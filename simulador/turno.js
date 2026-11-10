/*
 * Mundo vivo: el entorno cambia mientras el agente trabaja. Cada tic puede
 * aparecer una mancha, un pedido, un trancón o una réplica del sismo. El
 * agente percibe el cambio y vuelve a planear. En los turnos continuos no
 * termina al llegar: sigue atendiendo lo que aparezca hasta que se acaba el turno.
 * La semilla hace que cada «realidad» se pueda repetir.
 */
(function (root) {
  'use strict';

  var enNode = typeof module !== 'undefined' && module.exports;
  var N = enNode ? require('./nucleo.js') : root.Nucleo;
  var Azar = enNode ? require('./azar.js') : root.Azar;

  function destino(ev, k) {
    if (typeof ev.a === 'string') return (ev.de || []).indexOf(k) >= 0 ? ev.a : null;
    return ev.a[k] || null;
  }

  function contar(m, kind) {
    var n = 0;
    for (var i = 0; i < m.celdas.length; i += 1) if (m.celdas[i] === kind) n += 1;
    return n;
  }

  function objetivosEnMapa(m) {
    var n = 0;
    for (var i = 0; i < m.celdas.length; i += 1) if (m.def.tipos[m.celdas[i]].objetivo) n += 1;
    return n;
  }

  // Tira los dados de cada evento. Devuelve la lista de cambios aplicados al mundo.
  function eventos(m, rng, ocupadas, numero) {
    var din = m.def.dinamica;
    if (!din) return [];
    var cambios = [];
    var cols = m.cols;
    var limite = (m.def.modo === 'visitar' || m.def.modo === 'recoger') ? N.MAX_OBJETIVOS : Infinity;
    din.eventos.forEach(function (ev) {
      if (!(rng() < ev.prob)) return;
      var cands = [];
      var objetivoNuevo = false;
      for (var id = 0; id < m.celdas.length; id += 1) {
        var k = m.celdas[id];
        var a = destino(ev, k);
        if (!a || ocupadas.indexOf(id) >= 0) continue;
        if (ev.zonas && ev.zonas.indexOf(N.zonaDe(m, id)) < 0) continue;
        if (ev.junto_a) {
          var r = Math.floor(id / cols);
          var c = id % cols;
          var cerca = [[0, 1], [1, 0], [0, -1], [-1, 0]].some(function (d) {
            var rr = r + d[0];
            var cc = c + d[1];
            return rr >= 0 && cc >= 0 && rr < m.filas && cc < cols && ev.junto_a.indexOf(m.celdas[rr * cols + cc]) >= 0;
          });
          if (!cerca) continue;
        }
        if (m.def.tipos[a].objetivo) objetivoNuevo = true;
        cands.push(id);
      }
      if (!cands.length) return;
      if (objetivoNuevo && objetivosEnMapa(m) >= limite) return;
      if (ev.max != null) {
        var tipoA = typeof ev.a === 'string' ? ev.a : ev.a[m.celdas[cands[0]]];
        if (contar(m, tipoA) >= ev.max) return;
      }
      var elegida = cands[Math.floor(rng() * cands.length)];
      var de = m.celdas[elegida];
      m.celdas[elegida] = destino(ev, de);
      var textos = ev.textos || [ev.texto || ev.nombre];
      cambios.push({ celda: elegida, de: de, a: m.celdas[elegida], evento: ev, texto: textos[(numero + cambios.length) % textos.length] });
    });
    return cambios;
  }

  // Turno continuo: lo ya atendido vuelve a su suelo para que pueda volver a pasar.
  function limpiar(m, p, est) {
    var n = 0;
    p.objetivos.forEach(function (o) {
      var hecho = m.def.modo === 'recoger' ? (est.e >> o.indice) & 1 : (est.h >> o.indice) & 1;
      var t = m.def.tipos[o.tipo];
      if (!hecho || t.permanente || !t.suelo) return;
      m.celdas[o.celda] = t.suelo;
      n += 1;
    });
    return n;
  }

  function remapear(est, viejos, nuevos) {
    var h = 0;
    var e = 0;
    nuevos.forEach(function (o) {
      viejos.forEach(function (v) {
        if (v.celda !== o.celda) return;
        if ((est.h >> v.indice) & 1) h |= 1 << o.indice;
        if ((est.e >> v.indice) & 1) e |= 1 << o.indice;
      });
    });
    return { pos: est.pos, h: h, e: e, f: est.f || 0, p2: est.p2 == null ? -1 : est.p2 };
  }

  function costoPaso(p, a, b) {
    if (p.modo === 'dos') {
      return (b.pos === a.pos ? (a.pos === p.final ? 0 : 1) : p.costo[b.pos]) + (b.p2 === a.p2 ? (a.p2 === p.final2 ? 0 : 1) : p.costo[b.p2]);
    }
    return b.pos === a.pos ? 1 : p.costo[b.pos];
  }

  function nuevosHechos(p, a, b) {
    if (p.modo === 'recoger') return N.popcount(b.e & ~a.e);
    if (p.modo === 'visitar') return N.popcount(b.h & ~a.h);
    return 0;
  }

  // Lo que el sensor del agente descubre al pararse en una celda (rescate).
  function sentir(m, pos) {
    var radio = m.def.sensor;
    if (!radio) return [];
    var cols = m.cols;
    var vistos = [];
    for (var id = 0; id < m.celdas.length; id += 1) {
      var t = m.def.tipos[m.celdas[id]];
      if (!t.parece) continue;
      var d = Math.abs(Math.floor(id / cols) - Math.floor(pos / cols)) + Math.abs(id % cols - pos % cols);
      if (d <= radio) { m.celdas[id] = t.revela; vistos.push(id); }
    }
    return vistos;
  }

  // Un turno completo sin animación: lo usa la comparación en muchas realidades.
  function simular(def, opciones) {
    var m = N.crearMundo(def);
    Object.assign(m.params, opciones.params || {});
    var din = def.dinamica;
    var turno = opciones.turno || din.turno;
    var algo = opciones.algo;
    var rng = Azar.crear(opciones.semilla);
    var p = N.compilar(m);
    var res = N.resolver(p, algo);
    var r = {
      algo: algo, semilla: opciones.semilla, atendidos: 0, costo: 0, tiempo: 0, replanes: 0,
      expandidos: res.expandidos, eventos: 0, exito: false, metas: 0, esperas: 0
    };
    var est = res.encontrado ? res.ruta[0] : { pos: p.inicio, h: 0, e: 0, f: 0, p2: p.inicio2 };
    var ruta = res.encontrado ? res.ruta : [est];
    var idx = 0;
    var numero = 0;

    function replanear() {
      var viejos = p.objetivos;
      p = N.compilar(m);
      est = remapear(est, viejos, p.objetivos);
      res = N.resolver(p, algo, est);
      r.expandidos += res.expandidos;
      r.replanes += 1;
      ruta = res.encontrado ? res.ruta : [est];
      idx = 0;
    }

    var guardia = 0;
    while (r.tiempo < turno && guardia < 5000) {
      guardia += 1;
      var ocup = [est.pos];
      if (est.p2 >= 0) ocup.push(est.p2);
      var cambios = eventos(m, rng, ocup, numero);
      if (cambios.length) { numero += cambios.length; r.eventos += cambios.length; replanear(); }
      if (idx < ruta.length - 1) {
        var a = ruta[idx];
        var b = ruta[idx + 1];
        var c = costoPaso(p, a, b);
        r.costo += c;
        r.tiempo += c;
        r.atendidos += nuevosHechos(p, a, b);
        idx += 1;
        est = b;
        if (def.bateria && r.costo > def.bateria) { r.exito = false; r.sinBateria = true; break; }
        if (sentir(m, est.pos).length) replanear();
        else if (idx === ruta.length - 1) {
          r.metas += 1;
          if (p.modo === 'alguno') r.atendidos += 1;
          r.exito = true;
          if (!din.continuo) break;
          if (limpiar(m, p, est)) replanear();
        }
      } else {
        r.tiempo += 1;
        r.esperas += 1;
        if (!res.encontrado && def.exito === 'contener') r.exito = true;
      }
    }
    if (def.exito === 'contener') r.exito = !res.encontrado || idx < ruta.length - 1;
    if (r.sinBateria) r.exito = false;
    return r;
  }

  function comparar(def, params, semillas, alPaso) {
    var algos = ['bfs', 'dfs', 'ucs', 'astar'];
    var out = {};
    algos.forEach(function (a) {
      var corridas = [];
      for (var s = 1; s <= semillas; s += 1) {
        corridas.push(simular(def, { params: params, algo: a, semilla: s }));
        if (alPaso) alPaso(a, s);
      }
      var prom = function (k) { return corridas.reduce(function (x, y) { return x + y[k]; }, 0) / corridas.length; };
      out[a] = {
        atendidos: prom('atendidos'), costo: prom('costo'), replanes: prom('replanes'),
        expandidos: prom('expandidos'), eventos: prom('eventos'),
        exito: corridas.filter(function (c) { return c.exito; }).length / corridas.length,
        corridas: corridas
      };
    });
    return out;
  }

  var api = { eventos: eventos, limpiar: limpiar, remapear: remapear, costoPaso: costoPaso, sentir: sentir, simular: simular, comparar: comparar };
  if (enNode) module.exports = api;
  else root.Turno = api;
})(typeof window !== 'undefined' ? window : this);
