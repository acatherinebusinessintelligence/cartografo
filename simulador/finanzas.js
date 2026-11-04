/*
 * Agente financiero. No hay mapa ni ruta: el estado es el saldo de cada cuenta
 * y una acción es cómo repartir el excedente del mes. La búsqueda encuentra el
 * plan que paga menos intereses; la simulación mete imprevistos al azar y el
 * agente vuelve a decidir cada mes con lo que de verdad pasó.
 * python/cartografo/finanzas.py implementa lo mismo, número a número.
 */
(function (root) {
  'use strict';

  var Azar = typeof module !== 'undefined' && module.exports ? require('./azar.js') : root.Azar;
  var LIMITE = 400000;

  function modelo(def, params) {
    var p = Object.assign({}, def.valores, params || {});
    var cuentas = def.cuentas.map(function (c) { return Object.assign({}, c); });
    if (p.tasa_tarjeta != null) cuentas.forEach(function (c) { if (c.id === 'tarjeta') c.tasa = p.tasa_tarjeta; });
    var fondo = -1;
    cuentas.forEach(function (c, i) { if (c.tipo === 'ahorro') fondo = i; });
    return {
      def: def,
      cuentas: cuentas,
      n: cuentas.length,
      fondo: fondo,
      excedente: p.excedente,
      riesgo: p.riesgo,
      choques: p.choques,
      inicial: cuentas.map(function (c) { return c.saldo; })
    };
  }

  function capacidad(M, s, i) {
    var c = M.cuentas[i];
    return c.tipo === 'ahorro' ? Math.max(0, c.meta - s[i]) : s[i];
  }

  // todas las formas de repartir el excedente, en orden fijo
  function acciones(M, s) {
    var caps = [];
    var total = 0;
    for (var i = 0; i < M.n; i += 1) { caps.push(capacidad(M, s, i)); total += caps[i]; }
    var reparto = Math.min(M.excedente, total);
    var out = [];
    var a = new Array(M.n).fill(0);
    (function rec(i, resto) {
      if (i === M.n - 1) {
        if (resto <= caps[i]) { a[i] = resto; out.push(a.slice()); }
        return;
      }
      for (var v = Math.min(caps[i], resto); v >= 0; v -= 1) {
        a[i] = v;
        rec(i + 1, resto - v);
      }
    })(0, reparto);
    return out;
  }

  function interes(M, s) {
    var t = 0;
    for (var i = 0; i < M.n; i += 1) if (M.cuentas[i].tipo === 'deuda') t += s[i] * M.cuentas[i].tasa;
    return t;
  }

  function faltaFondo(M, s) {
    return M.fondo < 0 ? 0 : Math.max(0, M.cuentas[M.fondo].meta - s[M.fondo]);
  }

  function aplicar(M, s, a) {
    var s2 = s.slice();
    for (var i = 0; i < M.n; i += 1) s2[i] = M.cuentas[i].tipo === 'ahorro' ? s[i] + a[i] : s[i] - a[i];
    return s2;
  }

  function costoMes(M, s) {
    return interes(M, s) + M.riesgo * faltaFondo(M, s);
  }

  function esMeta(M, s) {
    for (var i = 0; i < M.n; i += 1) {
      var c = M.cuentas[i];
      if (c.tipo === 'deuda' && s[i] > 0) return false;
      if (c.tipo === 'ahorro' && s[i] < c.meta) return false;
    }
    return true;
  }

  // cota inferior: pagar la deuda más cara primero, en pesos sueltos, sin fondo
  function heuristica(M, s) {
    var orden = [];
    for (var i = 0; i < M.n; i += 1) if (M.cuentas[i].tipo === 'deuda') orden.push(i);
    orden.sort(function (x, y) { return M.cuentas[y].tasa - M.cuentas[x].tasa || x - y; });
    var b = orden.map(function (i) { return s[i]; });
    var costo = 0;
    var queda = b.reduce(function (x, y) { return x + y; }, 0);
    var vueltas = 0;
    while (queda > 0 && vueltas < 1000) {
      for (var j = 0; j < orden.length; j += 1) costo += b[j] * M.cuentas[orden[j]].tasa;
      var resto = M.excedente;
      for (var k = 0; k < orden.length && resto > 0; k += 1) {
        var pago = Math.min(b[k], resto);
        b[k] -= pago;
        resto -= pago;
      }
      queda = b.reduce(function (x, y) { return x + y; }, 0);
      vueltas += 1;
    }
    return costo;
  }

  function clave(s) { return s.join(','); }

  function Monticulo() { this.a = []; }
  Monticulo.prototype.menor = function (x, y) { return x.f < y.f || (x.f === y.f && x.t < y.t); };
  Monticulo.prototype.push = function (e) {
    var a = this.a;
    a.push(e);
    var i = a.length - 1;
    while (i > 0) {
      var p = (i - 1) >> 1;
      if (!this.menor(a[i], a[p])) break;
      var tmp = a[i]; a[i] = a[p]; a[p] = tmp;
      i = p;
    }
  };
  Monticulo.prototype.pop = function () {
    var a = this.a;
    var top = a[0];
    var last = a.pop();
    if (a.length) {
      a[0] = last;
      var i = 0;
      for (;;) {
        var l = 2 * i + 1;
        var r = l + 1;
        var m = i;
        if (l < a.length && this.menor(a[l], a[m])) m = l;
        if (r < a.length && this.menor(a[r], a[m])) m = r;
        if (m === i) break;
        var tmp = a[i]; a[i] = a[m]; a[m] = tmp;
        i = m;
      }
    }
    return top;
  };

  function resolver(M, s0, algo) {
    var reloj = typeof performance !== 'undefined' ? performance : Date;
    var t0 = reloj.now();
    var out = { algo: algo, encontrado: false, estados: [], acciones: [], costo: 0, pasos: 0, expandidos: 0, tiempo: 0, orden: [] };
    var padre = new Map();
    var meta = null;
    var ini = { s: s0, k: clave(s0), g: 0, padre: null, a: null };
    var exp = 0;

    function expandir(n) {
      padre.set(n.k, n);
      exp += 1;
      if (out.orden.length < 40) out.orden.push({ s: n.s, g: n.g });
      if (esMeta(M, n.s)) { meta = n; return true; }
      return exp >= LIMITE;
    }
    function hijos(n) {
      var c = costoMes(M, n.s);
      return acciones(M, n.s).map(function (a) {
        var s2 = aplicar(M, n.s, a);
        return { s: s2, k: clave(s2), g: n.g + c, padre: n.k, a: a };
      });
    }

    if (algo === 'bfs') {
      var cola = [ini];
      var cab = 0;
      var visto = new Set([ini.k]);
      while (cab < cola.length) {
        var cur = cola[cab++];
        if (expandir(cur)) break;
        hijos(cur).forEach(function (h) { if (!visto.has(h.k)) { visto.add(h.k); cola.push(h); } });
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
        for (var i = hs.length - 1; i >= 0; i -= 1) if (!cerr.has(hs[i].k)) pila.push(hs[i]);
      }
    } else {
      var usarH = algo === 'astar';
      var mont = new Monticulo();
      var tie = 0;
      var cerrado = new Set();
      var mejor = new Map([[ini.k, 0]]);
      mont.push({ f: usarH ? heuristica(M, s0) : 0, t: tie++, n: ini });
      while (mont.a.length) {
        var cu = mont.pop().n;
        if (cerrado.has(cu.k)) continue;
        cerrado.add(cu.k);
        if (expandir(cu)) break;
        hijos(cu).forEach(function (h) {
          if (cerrado.has(h.k)) return;
          var prev = mejor.get(h.k);
          if (prev !== undefined && prev <= h.g) return;
          mejor.set(h.k, h.g);
          mont.push({ f: h.g + (usarH ? heuristica(M, h.s) : 0), t: tie++, n: h });
        });
      }
    }
    out.expandidos = exp;
    if (meta) {
      var estados = [];
      var accs = [];
      var nodo = meta;
      while (nodo) {
        estados.push(nodo.s);
        if (nodo.a) accs.push(nodo.a);
        nodo = nodo.padre === null ? null : padre.get(nodo.padre);
      }
      out.estados = estados.reverse();
      out.acciones = accs.reverse();
      out.encontrado = true;
      out.costo = meta.g;
      out.pasos = out.acciones.length;
    }
    out.tiempo = reloj.now() - t0;
    return out;
  }

  // ---------- políticas: cómo decide el agente cada mes ----------

  function porReglas(M, s, orden) {
    var a = new Array(M.n).fill(0);
    var resto = M.excedente;
    orden.forEach(function (i) {
      var p = Math.min(capacidad(M, s, i), resto);
      a[i] += p;
      resto -= p;
    });
    return a;
  }

  function ordenAvalancha(M) {
    var d = [];
    for (var i = 0; i < M.n; i += 1) if (M.cuentas[i].tipo === 'deuda') d.push(i);
    return d.sort(function (x, y) { return M.cuentas[y].tasa - M.cuentas[x].tasa || x - y; });
  }

  var POLITICAS = {
    planificador: 'El agente planificador',
    avalancha: 'Avalancha: la deuda más cara primero',
    bola: 'Bola de nieve: la deuda más pequeña primero',
    fondo: 'Fondo primero, después avalancha'
  };

  function politica(M, nombre, algo) {
    var cache = new Map();
    var av = ordenAvalancha(M);
    return function (s) {
      if (nombre === 'avalancha') return porReglas(M, s, av.concat([M.fondo]));
      if (nombre === 'fondo') return porReglas(M, s, [M.fondo].concat(av));
      if (nombre === 'bola') {
        var d = av.slice().sort(function (x, y) {
          var sx = s[x] > 0 ? s[x] : Infinity;
          var sy = s[y] > 0 ? s[y] : Infinity;
          return sx - sy || M.cuentas[y].tasa - M.cuentas[x].tasa || x - y;
        });
        return porReglas(M, s, d.concat([M.fondo]));
      }
      var k = clave(s);
      if (!cache.has(k)) {
        var r = resolver(M, s, algo || 'astar');
        cache.set(k, r.encontrado && r.acciones.length ? r.acciones[0] : porReglas(M, s, av.concat([M.fondo])));
      }
      return cache.get(k);
    };
  }

  // ---------- el mundo: un mes con sus imprevistos ----------

  function choque(M, s, rng) {
    var ch = M.def.choques;
    if (!(rng() < M.choques)) return null;
    var monto = ch.min + Math.floor(rng() * (ch.max - ch.min + 1));
    var cual = Math.floor(rng() * ch.textos.length);
    var s2 = s.slice();
    var cubre = Math.min(s2[M.fondo], monto);
    s2[M.fondo] -= cubre;
    var falta = monto - cubre;
    var nueva = [];
    M.def.desborde.forEach(function (id) {
      if (!falta) return;
      var i = M.cuentas.findIndex(function (c) { return c.id === id; });
      var cabe = Math.min(falta, M.cuentas[i].max - s2[i]);
      if (cabe > 0) { s2[i] += cabe; falta -= cabe; nueva.push({ cuenta: i, monto: cabe, comision: cabe * (M.cuentas[i].comision || 0) }); }
    });
    return { monto: monto, texto: ch.textos[cual], cubre: cubre, nueva: nueva, impago: falta, s: s2 };
  }

  function simular(M, decidir, semilla, horizonte) {
    var rng = Azar.crear(semilla);
    var H = horizonte || M.def.horizonte;
    var s = M.inicial.slice();
    var meses = [];
    var intereses = 0;
    var libre = null;
    var nuevaDeuda = 0;
    var choques = 0;
    for (var mes = 1; mes <= H; mes += 1) {
      if (esMeta(M, s)) { libre = mes - 1; break; }
      var a = decidir(s);
      var int = interes(M, s);
      intereses += int;
      var antes = s;
      s = aplicar(M, s, a);
      var ch = choque(M, s, rng);
      if (ch) {
        choques += 1;
        s = ch.s;
        ch.nueva.forEach(function (x) { nuevaDeuda += x.monto; intereses += x.comision; });
      }
      meses.push({ mes: mes, antes: antes, accion: a, interes: int, choque: ch, despues: s });
    }
    if (libre === null && esMeta(M, s)) libre = meses.length;
    return { meses: meses, intereses: intereses, libre: libre, choques: choques, nuevaDeuda: nuevaDeuda, final: s };
  }

  function percentil(xs, q) {
    var o = xs.slice().sort(function (a, b) { return a - b; });
    if (!o.length) return null;
    return o[Math.min(o.length - 1, Math.floor(q * o.length))];
  }

  function montecarlo(M, nombre, algo, n) {
    var decidir = politica(M, nombre, algo);
    var ints = [];
    var meses = [];
    var logran = 0;
    var nueva = 0;
    for (var semilla = 1; semilla <= n; semilla += 1) {
      var r = simular(M, decidir, semilla);
      ints.push(r.intereses);
      if (r.libre !== null) { logran += 1; meses.push(r.libre); }
      nueva += r.nuevaDeuda;
    }
    var suma = ints.reduce(function (a, b) { return a + b; }, 0);
    return {
      politica: nombre,
      corridas: n,
      intereses: suma / n,
      p90: percentil(ints, 0.9),
      logran: logran / n,
      meses: meses.length ? meses.reduce(function (a, b) { return a + b; }, 0) / meses.length : null,
      nuevaDeuda: nueva / n,
      distribucion: ints
    };
  }

  function contarEstados(M) {
    var visto = new Set([clave(M.inicial)]);
    var pila = [M.inicial];
    while (pila.length) {
      var s = pila.pop();
      if (esMeta(M, s)) continue;
      acciones(M, s).forEach(function (a) {
        var t = aplicar(M, s, a);
        var k = clave(t);
        if (!visto.has(k)) { visto.add(k); pila.push(t); }
      });
    }
    return visto.size;
  }

  var api = {
    contarEstados: contarEstados,
    modelo: modelo, acciones: acciones, aplicar: aplicar, interes: interes, costoMes: costoMes,
    esMeta: esMeta, heuristica: heuristica, resolver: resolver, politica: politica,
    POLITICAS: POLITICAS, simular: simular, montecarlo: montecarlo, faltaFondo: faltaFondo, choque: choque, capacidad: capacidad
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Finanzas = api;
})(typeof window !== 'undefined' ? window : this);
