/*
 * Núcleo de las misiones: convierte un escenario (JSON) en un problema de
 * búsqueda y lo resuelve con BFS, DFS, costo uniforme o A*.
 *
 * El estado no es solo la baldosa. Según la misión es
 *   (posición, objetivos hechos, entregados, fase del semáforo)  o
 *   (posición del robot A, posición del robot B).
 * La misma baldosa con distinta memoria es otro estado. python/cartografo/
 * implementa lo mismo y las pruebas exigen que ambos den números idénticos.
 */
(function (root) {
  'use strict';

  var LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var MAX_OBJETIVOS = 6;
  var LIMITE = 600000;

  function crearMundo(def) {
    var filas = def.mapa.length;
    var cols = def.mapa[0].length;
    var celdas = [];
    for (var r = 0; r < filas; r += 1) {
      if (def.mapa[r].length !== cols) throw new Error(def.id + ': la fila ' + r + ' no mide ' + cols);
      for (var c = 0; c < cols; c += 1) {
        var tipo = def.leyenda[def.mapa[r][c]];
        if (!tipo || !def.tipos[tipo]) throw new Error(def.id + ': símbolo sin tipo "' + def.mapa[r][c] + '"');
        celdas.push(tipo);
      }
    }
    var params = {};
    (def.parametros || []).forEach(function (p) { params[p.id] = p.valor; });
    return { def: def, filas: filas, cols: cols, celdas: celdas, debajo: {}, params: params };
  }

  function clonarMundo(m) {
    return {
      def: m.def, filas: m.filas, cols: m.cols,
      celdas: m.celdas.slice(),
      debajo: Object.assign({}, m.debajo),
      params: Object.assign({}, m.params)
    };
  }

  function tipoDe(m, id) { return m.def.tipos[m.celdas[id]]; }

  function etiqueta(m, id) {
    var r = Math.floor(id / m.cols);
    var c = id % m.cols;
    return LETRAS[c] + (r + 1);
  }

  function costos(m) {
    var tabla = {};
    var tipos = m.def.tipos;
    Object.keys(tipos).forEach(function (k) {
      var t = tipos[k];
      tabla[k] = t.paso === false ? Infinity : (t.costo || 1);
    });
    (m.def.parametros || []).forEach(function (p) {
      if (p.costos && m.params[p.id]) {
        Object.keys(p.costos).forEach(function (k) { tabla[k] = p.costos[k]; });
      }
    });
    // lo que el agente cree: un escombro oculto parece el suelo que lo cubre
    Object.keys(tipos).forEach(function (k) {
      if (tipos[k].parece) tabla[k] = tabla[tipos[k].parece];
    });
    return tabla;
  }

  function reglas(m) {
    var out = { prioridad: true, capacidad: Infinity };
    (m.def.parametros || []).forEach(function (p) {
      if (p.regla) out[p.regla] = m.params[p.id];
    });
    return out;
  }

  function fases(m) {
    if (!m.def.fases) return null;
    var f = { periodo: m.def.fases.periodo, verde: Object.assign({}, m.def.fases.verde) };
    (m.def.parametros || []).forEach(function (p) {
      if (p.fases && m.params[p.id]) {
        if (p.fases.periodo) f.periodo = p.fases.periodo;
        Object.assign(f.verde, p.fases.verde || {});
      }
    });
    return f;
  }

  function zonaDe(m, id) {
    var r = Math.floor(id / m.cols);
    var c = id % m.cols;
    var zonas = m.def.zonas || [];
    for (var i = 0; i < zonas.length; i += 1) {
      var z = zonas[i];
      if (r >= z.desde[0] && r <= z.hasta[0] && c >= z.desde[1] && c <= z.hasta[1]) return z.nombre;
    }
    return null;
  }

  function primero(m, kind) {
    for (var i = 0; i < m.celdas.length; i += 1) if (m.celdas[i] === kind) return i;
    return -1;
  }

  function compilar(m) {
    var n = m.filas * m.cols;
    var tipos = m.def.tipos;
    var tabla = costos(m);
    var reg = reglas(m);
    var modo = m.def.modo || 'visitar';
    var costo = new Float64Array(n);
    var inicio = -1;
    var inicio2 = -1;
    var objetivos = [];
    var minCosto = Infinity;
    for (var id = 0; id < n; id += 1) {
      var k = m.celdas[id];
      var t = tipos[k];
      costo[id] = tabla[k];
      if (costo[id] < minCosto) minCosto = costo[id];
      if (t.inicio && inicio < 0) inicio = id;
      if (t.inicio2 && inicio2 < 0) inicio2 = id;
      if (t.objetivo) {
        objetivos.push({
          celda: id,
          indice: objetivos.length,
          letra: LETRAS[objetivos.length % 26],
          alta: t.prioridad === 'alta' && reg.prioridad !== false,
          urgente: t.prioridad === 'alta',
          tipo: k,
          clase: t.clase || k,
          opcional: !!t.opcional,
          zona: zonaDe(m, id)
        });
      }
    }
    var finalId = -1;
    if (m.def.final === 'inicio') finalId = inicio;
    else if (m.def.final) finalId = primero(m, m.def.final);
    var final2 = m.def.final2 ? primero(m, m.def.final2) : -1;

    var cerrojo = new Int32Array(n);
    for (var j = 0; j < n; j += 1) {
      var req = tipos[m.celdas[j]].requiere;
      if (!req) continue;
      var mask = 0;
      objetivos.forEach(function (o) { if (o.clase === req || o.tipo === req) mask |= 1 << o.indice; });
      cerrojo[j] = mask;
    }

    var f = fases(m);
    var grupos = f ? Object.keys(f.verde) : [];
    var grupo = new Int8Array(n).fill(-1);
    if (f) {
      for (var q = 0; q < n; q += 1) {
        var g = tipos[m.celdas[q]].semaforo;
        if (g) grupo[q] = grupos.indexOf(g);
      }
    }

    return {
      n: n, filas: m.filas, cols: m.cols,
      costo: costo,
      inicio: inicio,
      inicio2: inicio2,
      final: finalId,
      final2: final2,
      objetivos: objetivos,
      modo: modo,
      capacidad: reg.capacidad == null ? Infinity : Number(reg.capacidad),
      minCosto: minCosto === Infinity ? 1 : minCosto,
      cerrojo: cerrojo,
      periodo: f ? f.periodo : 1,
      verde: f ? grupos.map(function (gname) { return f.verde[gname]; }) : [],
      grupos: grupos,
      grupo: grupo,
      espera: !!f || modo === 'dos',
      demasiados: (modo === 'visitar' || modo === 'recoger') && objetivos.length > MAX_OBJETIVOS
    };
  }

  // ¿El semáforo de esta celda está en verde en esta fase?
  function enVerde(p, id, fase) {
    var g = p.grupo[id];
    if (g < 0) return true;
    var v = p.verde[g];
    return fase >= v[0] && fase < v[1];
  }

  // ---- búsqueda en el espacio de estados -----------------------------------

  function popcount(x) {
    var c = 0;
    while (x) { x &= x - 1; c += 1; }
    return c;
  }

  function Monticulo() { this.a = []; }
  Monticulo.prototype.menor = function (x, y) {
    return x.f < y.f || (x.f === y.f && x.t < y.t);
  };
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
  Monticulo.prototype.size = function () { return this.a.length; };

  function reglasDe(p) {
    var n = p.n;
    var cols = p.cols;
    var k = p.objetivos.length;
    var dos = p.modo === 'dos';
    var alguno = p.modo === 'alguno';
    var conMask = p.modo === 'visitar' || p.modo === 'recoger';
    var todos = conMask ? (1 << k) - 1 : 0;
    var lleno = 0;
    p.objetivos.forEach(function (o) { if (!o.opcional) lleno |= 1 << o.indice; });
    if (!conMask) lleno = 0;
    var objIdx = new Int16Array(n).fill(-1);
    var altaMask = 0;
    p.objetivos.forEach(function (o) {
      objIdx[o.celda] = o.indice;
      if (o.alta) altaMask |= 1 << o.indice;
    });
    var P = p.periodo;

    function llegar(pos, h, e) {
      if (!conMask) return [h, e];
      var i = objIdx[pos];
      if (i >= 0 && !((h >> i) & 1)) {
        if (p.modo === 'visitar') {
          if (((altaMask >> i) & 1) || (h & altaMask) === altaMask) h |= 1 << i;
        } else if (popcount(h & ~e) < p.capacidad) {
          h |= 1 << i;
        }
      }
      if (p.modo === 'recoger' && pos === p.final) e = h;
      return [h, e];
    }

    function esMeta(s) {
      if (dos) return s.pos === p.final && s.p2 === p.final2;
      if (alguno) return objIdx[s.pos] >= 0;
      if (p.modo === 'recoger') return (s.e & lleno) === lleno && s.pos === p.final;
      return (s.h & lleno) === lleno && (p.final < 0 || s.pos === p.final);
    }

    function clave(s) {
      if (dos) return s.p2 * n + s.pos;
      return ((s.e * (todos + 1) + s.h) * P + s.f) * n + s.pos;
    }

    function man(a, b) {
      return Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) + Math.abs((a % cols) - (b % cols));
    }

    function heur(s) {
      if (dos) return (man(s.pos, p.final) + man(s.p2, p.final2)) * p.minCosto;
      if (alguno) {
        var mn = Infinity;
        for (var a = 0; a < k; a += 1) mn = Math.min(mn, man(s.pos, p.objetivos[a].celda));
        return mn === Infinity ? 0 : mn * p.minCosto;
      }
      var mejor = 0;
      var f = p.final;
      var pend = false;
      for (var i = 0; i < k; i += 1) {
        if (p.objetivos[i].opcional) continue;
        var cel = p.objetivos[i].celda;
        var v;
        if (p.modo === 'recoger') {
          if ((s.e >> i) & 1) continue;
          if ((s.h >> i) & 1) v = man(s.pos, f);
          else v = man(s.pos, cel) + man(cel, f);
        } else {
          if ((s.h >> i) & 1) continue;
          v = man(s.pos, cel) + (f >= 0 ? man(cel, f) : 0);
        }
        pend = true;
        if (v > mejor) mejor = v;
      }
      if (!pend && f >= 0) mejor = man(s.pos, f);
      return mejor * p.minCosto;
    }

    function pasos(pos, h) {
      var r = Math.floor(pos / cols);
      var c = pos % cols;
      var out = [];
      if (c + 1 < cols) out.push(pos + 1);
      if (r + 1 < p.filas) out.push(pos + cols);
      if (c > 0) out.push(pos - 1);
      if (r > 0) out.push(pos - cols);
      return out.filter(function (q) {
        if (p.costo[q] === Infinity) return false;
        var lock = p.cerrojo[q];
        return !lock || (h & lock) === lock;
      });
    }

    function sucesores(s) {
      var out = [];
      if (dos) {
        var movA = pasos(s.pos, 0).concat([s.pos]);
        var movB = pasos(s.p2, 0).concat([s.p2]);
        movA.forEach(function (a) {
          movB.forEach(function (b) {
            if (a === s.pos && b === s.p2) return;
            if (a === b) return;
            if (a === s.p2 && b === s.pos) return;
            var c = (a === s.pos ? (s.pos === p.final ? 0 : 1) : p.costo[a]) +
              (b === s.p2 ? (s.p2 === p.final2 ? 0 : 1) : p.costo[b]);
            out.push({ pos: a, h: 0, e: 0, f: 0, p2: b, c: c });
          });
        });
        return out;
      }
      // esperar va primero: ante un empate, un vehículo real espera en vez de ir y volver
      if (p.espera) out.push({ pos: s.pos, h: s.h, e: s.e, f: (s.f + 1) % P, p2: -1, c: 1 });
      pasos(s.pos, s.h).forEach(function (q) {
        var c = p.costo[q];
        var f2 = (s.f + c) % P;
        if (P > 1 && !enVerde(p, q, f2)) return;
        var he = llegar(q, s.h, s.e);
        out.push({ pos: q, h: he[0], e: he[1], f: f2, p2: -1, c: c });
      });
      return out;
    }

    function inicial() {
      if (dos) return { pos: p.inicio, h: 0, e: 0, f: 0, p2: p.inicio2 };
      var he = llegar(p.inicio, 0, 0);
      return { pos: p.inicio, h: he[0], e: he[1], f: 0, p2: -1 };
    }

    return { esMeta: esMeta, clave: clave, heur: heur, sucesores: sucesores, inicial: inicial };
  }

  function resolver(p, algo, desde) {
    var reloj = typeof performance !== 'undefined' ? performance : Date;
    var t0 = reloj.now();
    var R = reglasDe(p);
    var salida = {
      algo: algo, encontrado: false, agotado: false, ruta: [], costo: 0, pasos: 0,
      expandidos: 0, generados: 0, fronteraMax: 0, tiempo: 0,
      exp: { pos: [], h: [], e: [], f: [], p2: [] }
    };
    if (p.inicio < 0 || (p.modo === 'dos' && p.inicio2 < 0)) return salida;

    var ini = desde ? Object.assign({ f: 0, p2: -1 }, desde) : R.inicial();
    if (p.costo[ini.pos] === Infinity) return salida;
    var inicial = { pos: ini.pos, h: ini.h, e: ini.e, f: ini.f, p2: ini.p2, g: 0, padre: -1 };
    inicial.k = R.clave(inicial);
    var heur = algo === 'astar' ? R.heur : function () { return 0; };

    var padre = new Map();
    var cerrado = new Set();
    var meta = null;

    function expandir(cur) {
      padre.set(cur.k, cur);
      salida.exp.pos.push(cur.pos);
      salida.exp.h.push(cur.h);
      salida.exp.e.push(cur.e);
      salida.exp.f.push(cur.f);
      salida.exp.p2.push(cur.p2);
      if (R.esMeta(cur)) { meta = cur; return true; }
      if (salida.exp.pos.length >= LIMITE) { salida.agotado = true; return true; }
      return false;
    }

    function hijo(cur, s) {
      var n = { pos: s.pos, h: s.h, e: s.e, f: s.f, p2: s.p2, g: cur.g + s.c, padre: cur.k };
      n.k = R.clave(n);
      return n;
    }

    if (algo === 'bfs') {
      var cola = [inicial];
      var cabeza = 0;
      var visto = new Set([inicial.k]);
      while (cabeza < cola.length) {
        if (cola.length - cabeza > salida.fronteraMax) salida.fronteraMax = cola.length - cabeza;
        var cur = cola[cabeza++];
        if (expandir(cur)) break;
        var vs = R.sucesores(cur);
        for (var i = 0; i < vs.length; i += 1) {
          var nb = hijo(cur, vs[i]);
          if (visto.has(nb.k)) continue;
          visto.add(nb.k);
          salida.generados += 1;
          cola.push(nb);
        }
      }
    } else if (algo === 'dfs') {
      var pila = [inicial];
      while (pila.length) {
        if (pila.length > salida.fronteraMax) salida.fronteraMax = pila.length;
        var cd = pila.pop();
        if (cerrado.has(cd.k)) continue;
        cerrado.add(cd.k);
        if (expandir(cd)) break;
        var vd = R.sucesores(cd);
        for (var j = vd.length - 1; j >= 0; j -= 1) {
          var nd = hijo(cd, vd[j]);
          if (cerrado.has(nd.k)) continue;
          salida.generados += 1;
          pila.push(nd);
        }
      }
    } else {
      var tie = 0;
      var mont = new Monticulo();
      var mejorG = new Map();
      inicial.f2 = heur(inicial);
      mont.push({ f: inicial.f2, t: tie++, n: inicial });
      mejorG.set(inicial.k, 0);
      while (mont.size()) {
        if (mont.size() > salida.fronteraMax) salida.fronteraMax = mont.size();
        var cu = mont.pop().n;
        if (cerrado.has(cu.k)) continue;
        cerrado.add(cu.k);
        if (expandir(cu)) break;
        var vu = R.sucesores(cu);
        for (var m = 0; m < vu.length; m += 1) {
          var nu = hijo(cu, vu[m]);
          if (cerrado.has(nu.k)) continue;
          var previo = mejorG.get(nu.k);
          if (previo !== undefined && previo <= nu.g) continue;
          mejorG.set(nu.k, nu.g);
          salida.generados += 1;
          mont.push({ f: nu.g + heur(nu), t: tie++, n: nu });
        }
      }
    }

    salida.expandidos = salida.exp.pos.length;
    if (meta) {
      var ruta = [];
      var nodo = meta;
      while (nodo) {
        ruta.push({ pos: nodo.pos, h: nodo.h, e: nodo.e, f: nodo.f, p2: nodo.p2 });
        nodo = nodo.padre === -1 ? null : padre.get(nodo.padre);
      }
      ruta.reverse();
      salida.encontrado = true;
      salida.ruta = ruta;
      salida.costo = meta.g;
      salida.pasos = ruta.length - 1;
    }
    salida.tiempo = reloj.now() - t0;
    return salida;
  }

  // Qué pasa en cada paso del plan: qué objetivo se completa, se entrega o si espera.
  function eventos(p, ruta) {
    var out = [];
    for (var i = 1; i < ruta.length; i += 1) {
      var a = ruta[i - 1];
      var b = ruta[i];
      var ev = [];
      p.objetivos.forEach(function (o) {
        var bit = 1 << o.indice;
        if (!(a.h & bit) && (b.h & bit)) ev.push({ tipo: p.modo === 'recoger' ? 'recoge' : 'visita', obj: o });
        if (!(a.e & bit) && (b.e & bit)) ev.push({ tipo: 'entrega', obj: o });
      });
      if (p.modo === 'alguno' && i === ruta.length - 1) {
        var o2 = p.objetivos.filter(function (o) { return o.celda === b.pos; })[0];
        if (o2) ev.push({ tipo: 'llega', obj: o2 });
      }
      if (a.pos === b.pos && (p.modo !== 'dos' || a.p2 !== b.p2)) ev.push({ tipo: 'espera', agente: 1 });
      if (p.modo === 'dos' && a.p2 === b.p2 && b.p2 !== p.final2) ev.push({ tipo: 'espera', agente: 2 });
      out.push(ev);
    }
    return out;
  }

  function baldosasDistintas(sal) {
    return new Set(sal.exp.pos).size;
  }

  // Desde una celda, ¿qué celdas se alcanzan sin importar costos? (contención)
  function alcanzables(p, desde) {
    var visto = new Uint8Array(p.n);
    if (desde < 0 || p.costo[desde] === Infinity) return visto;
    var cola = [desde];
    visto[desde] = 1;
    while (cola.length) {
      var x = cola.pop();
      var r = Math.floor(x / p.cols);
      var c = x % p.cols;
      [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(function (d) {
        var rr = r + d[0];
        var cc = c + d[1];
        if (rr < 0 || cc < 0 || rr >= p.filas || cc >= p.cols) return;
        var y = rr * p.cols + cc;
        if (!visto[y] && p.costo[y] !== Infinity) { visto[y] = 1; cola.push(y); }
      });
    }
    return visto;
  }

  // Para explicar la búsqueda: el estado inicial, sus hijos, la pista y cuántos estados existen.
  function inicial(p) { return reglasDe(p).inicial(); }
  function sucesores(p, s) { return reglasDe(p).sucesores(s); }
  function heuristica(p, s) { return reglasDe(p).heur(s); }
  function contarEstados(p, limite) {
    var R = reglasDe(p);
    var ini = R.inicial();
    var visto = new Set([R.clave(ini)]);
    var pila = [ini];
    var metas = 0;
    limite = limite || 200000;
    while (pila.length && visto.size < limite) {
      var s = pila.pop();
      if (R.esMeta(s)) { metas += 1; continue; }
      R.sucesores(s).forEach(function (t) {
        var k = R.clave(t);
        if (!visto.has(k)) { visto.add(k); pila.push(t); }
      });
    }
    return { total: visto.size, metas: metas, cortado: visto.size >= limite };
  }

  var api = {
    LETRAS: LETRAS,
    inicial: inicial,
    sucesores: sucesores,
    heuristica: heuristica,
    contarEstados: contarEstados,
    MAX_OBJETIVOS: MAX_OBJETIVOS,
    crearMundo: crearMundo,
    clonarMundo: clonarMundo,
    tipoDe: tipoDe,
    etiqueta: etiqueta,
    costos: costos,
    reglas: reglas,
    zonaDe: zonaDe,
    compilar: compilar,
    resolver: resolver,
    eventos: eventos,
    enVerde: enVerde,
    alcanzables: alcanzables,
    baldosasDistintas: baldosasDistintas,
    popcount: popcount
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Nucleo = api;
})(typeof window !== 'undefined' ? window : this);
