/*
 * La rutina para cada piel. No hay mapa: el estado es la rutina a medio armar
 * (en qué paso va y qué productos lleva). Una acción agrega el producto de un
 * paso siguiente; los tratamientos se pueden saltar. Las reglas (tipo de piel,
 * embarazo, irritación, mezclas que no van, presupuesto) podan el árbol.
 * python/cartografo/cosmetica.py implementa lo mismo, número a número.
 */
(function (root) {
  'use strict';

  function modelo(def, perfil, agotados) {
    var p = Object.assign({}, def.valores, perfil || {});
    var necesarias = 0;
    var idx = {};
    Object.keys(def.preocupaciones).forEach(function (k, i) { idx[k] = i; });
    (p.preocupaciones || []).forEach(function (k) { necesarias |= 1 << idx[k]; });
    var productos = def.productos.map(function (pr) {
      var mask = 0;
      pr.cubre.forEach(function (k) { mask |= 1 << idx[k]; });
      return Object.assign({}, pr, { mask: mask });
    });
    return {
      def: def,
      perfil: p,
      pasos: def.pasos,
      productos: productos,
      porId: productos.reduce(function (o, pr) { o[pr.id] = pr; return o; }, {}),
      indice: idx,
      necesarias: necesarias,
      tolerancia: p.sensible ? def.tolerancia.sensible : def.tolerancia.normal,
      presupuesto: p.presupuesto,
      agotados: agotados || []
    };
  }

  // Por qué un producto no sirve para esta persona, sin mirar la rutina (null si sirve).
  function motivoPerfil(M, pr) {
    if (M.agotados.indexOf(pr.id) >= 0) return 'agotado en el estante';
    if (pr.pieles.indexOf(M.perfil.tipo) < 0) return 'no es para piel ' + M.def.tipos_piel[M.perfil.tipo].toLowerCase();
    if (pr.no_embarazo && M.perfil.embarazo) return 'no se recomienda en embarazo';
    return null;
  }

  function momentosDe(paso) { return paso.momento === 'ambos' ? ['am', 'pm'] : [paso.momento]; }

  function choca(M, activos, nuevos) {
    var reglas = M.def.incompatibles;
    for (var i = 0; i < reglas.length; i += 1) {
      var r = reglas[i];
      for (var a = 0; a < nuevos.length; a += 1) {
        if ((nuevos[a] === r.a && activos.indexOf(r.b) >= 0) || (nuevos[a] === r.b && activos.indexOf(r.a) >= 0)) return r;
      }
    }
    return null;
  }

  function inicial() {
    return { i: 0, elegidos: [], gasto: 0, irrita: 0, cubre: 0, am: [], pm: [] };
  }

  function clave(s) { return s.i + '|' + s.elegidos.map(function (e) { return e.paso + ':' + e.id; }).join(','); }

  // Todas las opciones desde s, válidas o no, con el motivo de cada descarte.
  function candidatos(M, s) {
    var out = [];
    var usados = s.elegidos.map(function (e) { return e.id; });
    for (var j = s.i; j < M.pasos.length; j += 1) {
      var paso = M.pasos[j];
      var cat = paso.categoria || paso.id;
      M.productos.forEach(function (pr) {
        if (pr.categoria !== cat) return;
        if (pr.momentos && pr.momentos.indexOf(paso.momento) < 0) return;
        var motivo = motivoPerfil(M, pr);
        if (!motivo && usados.indexOf(pr.id) >= 0) motivo = 'ya está en la rutina';
        if (!motivo && s.gasto + pr.precio > M.presupuesto) motivo = 'se pasa del presupuesto';
        if (!motivo && s.irrita + pr.irrita > M.tolerancia) motivo = 'suma demasiada irritación';
        var regla = null;
        if (!motivo) {
          momentosDe(paso).some(function (mo) { regla = choca(M, s[mo], pr.activos); return regla; });
          if (regla) motivo = regla.por;
        }
        out.push({ paso: j, producto: pr, valido: !motivo, motivo: motivo });
      });
      if (paso.obligatorio) break;
    }
    return out;
  }

  function aplicar(M, s, c) {
    var pr = c.producto;
    var paso = M.pasos[c.paso];
    var t = {
      i: c.paso + 1,
      elegidos: s.elegidos.concat([{ paso: c.paso, id: pr.id }]),
      gasto: s.gasto + pr.precio,
      irrita: s.irrita + pr.irrita,
      cubre: s.cubre | pr.mask,
      am: s.am.slice(),
      pm: s.pm.slice()
    };
    momentosDe(paso).forEach(function (mo) { t[mo] = t[mo].concat(pr.activos); });
    return t;
  }

  function sucesores(M, s) {
    return candidatos(M, s).filter(function (c) { return c.valido; }).map(function (c) {
      return { s: aplicar(M, s, c), c: c.producto.precio, cand: c };
    });
  }

  function esMeta(M, s) {
    return s.i === M.pasos.length && (s.cubre & M.necesarias) === M.necesarias;
  }

  // Pista de A*: lo más barato que se puede poner en cada paso obligatorio que falta.
  function heuristica(M, s) {
    var h = 0;
    for (var j = s.i; j < M.pasos.length; j += 1) {
      var paso = M.pasos[j];
      if (!paso.obligatorio) continue;
      var cat = paso.categoria || paso.id;
      var min = Infinity;
      M.productos.forEach(function (pr) {
        if (pr.categoria === cat && !motivoPerfil(M, pr) && pr.precio < min) min = pr.precio;
      });
      if (min !== Infinity) h += min;
    }
    return h;
  }

  function resolver(M, algo) {
    var reloj = typeof performance !== 'undefined' ? performance : Date;
    var t0 = reloj.now();
    var out = { algo: algo, encontrado: false, rutina: null, costo: 0, productos: 0, expandidos: 0, generados: 0, orden: [], tiempo: 0 };
    var usarH = algo === 'astar';
    var ini = { s: inicial(), g: 0, k: clave(inicial()), padre: null };
    var meta = null;
    var tie = 0;

    function expandir(n) {
      out.expandidos += 1;
      if (out.orden.length < 3000) out.orden.push({ elegidos: n.s.elegidos, g: n.g, h: usarH ? heuristica(M, n.s) : 0, k: n.k, padre: n.padre, s: n.s });
      if (esMeta(M, n.s)) { meta = n; return true; }
      return false;
    }
    function hijos(n) {
      return sucesores(M, n.s).map(function (x) { return { s: x.s, g: n.g + x.c, k: clave(x.s), padre: n.k }; });
    }

    if (algo === 'bfs') {
      var cola = [ini];
      var cab = 0;
      var visto = new Set([ini.k]);
      while (cab < cola.length) {
        var cur = cola[cab++];
        if (expandir(cur)) break;
        hijos(cur).forEach(function (h) { if (!visto.has(h.k)) { visto.add(h.k); out.generados += 1; cola.push(h); } });
      }
    } else if (algo === 'dfs') {
      var pila = [ini];
      var cerr = new Set();
      while (pila.length) {
        var cd = pila.pop();
        if (cerr.has(cd.k)) continue;
        cerr.add(cd.k);
        if (expandir(cd)) break;
        var hs = hijos(cd);
        for (var i = hs.length - 1; i >= 0; i -= 1) if (!cerr.has(hs[i].k)) { out.generados += 1; pila.push(hs[i]); }
      }
    } else {
      var mont = [];
      var push = function (n) {
        var e = { f: n.g + (usarH ? heuristica(M, n.s) : 0), t: tie++, n: n };
        mont.push(e);
        var q = mont.length - 1;
        while (q > 0) {
          var pp = (q - 1) >> 1;
          if (mont[pp].f < e.f || (mont[pp].f === e.f && mont[pp].t < e.t)) break;
          mont[q] = mont[pp]; q = pp;
        }
        mont[q] = e;
      };
      var pop = function () {
        var top = mont[0];
        var last = mont.pop();
        if (mont.length) {
          var q = 0;
          for (;;) {
            var l = 2 * q + 1;
            var r = l + 1;
            var m = q;
            var menor = function (x, y) { return x.f < y.f || (x.f === y.f && x.t < y.t); };
            if (l < mont.length && menor(mont[l], m === q ? last : mont[m])) m = l;
            if (r < mont.length && menor(mont[r], m === q ? last : mont[m])) m = r;
            if (m === q) break;
            mont[q] = mont[m]; q = m;
          }
          mont[q] = last;
        }
        return top;
      };
      var cerrado = new Set();
      push(ini);
      while (mont.length) {
        var cu = pop().n;
        if (cerrado.has(cu.k)) continue;
        cerrado.add(cu.k);
        if (expandir(cu)) break;
        hijos(cu).forEach(function (h) { if (!cerrado.has(h.k)) { out.generados += 1; push(h); } });
      }
    }
    if (meta) {
      out.encontrado = true;
      out.rutina = meta.s;
      out.costo = meta.g;
      out.productos = meta.s.elegidos.length;
    }
    out.tiempo = reloj.now() - t0;
    return out;
  }

  // Recorre todo el árbol: rutinas válidas (de la más barata a la más cara) y descartes por motivo.
  function explorarTodo(M) {
    var rutinas = [];
    var nodos = 0;
    var descartes = {};
    var pila = [inicial()];
    while (pila.length) {
      var s = pila.pop();
      nodos += 1;
      if (esMeta(M, s)) { rutinas.push(s); continue; }
      candidatos(M, s).forEach(function (c) {
        if (c.valido) pila.push(aplicar(M, s, c));
        else descartes[c.motivo] = (descartes[c.motivo] || 0) + 1;
      });
    }
    rutinas.sort(function (a, b) { return a.gasto - b.gasto || a.elegidos.length - b.elegidos.length; });
    return { rutinas: rutinas, nodos: nodos, descartes: descartes };
  }

  var api = {
    modelo: modelo, motivoPerfil: motivoPerfil, candidatos: candidatos, aplicar: aplicar,
    sucesores: sucesores, esMeta: esMeta, heuristica: heuristica, inicial: inicial,
    resolver: resolver, explorarTodo: explorarTodo, clave: clave
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Cosmetica = api;
})(typeof window !== 'undefined' ? window : this);
