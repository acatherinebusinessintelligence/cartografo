(function () {
  'use strict';

  var N = window.Nucleo;
  var F = window.Finanzas;
  var DEFS = window.MISIONES || [];
  var NOMBRE = { bfs: 'BFS', dfs: 'DFS', ucs: 'Costo uniforme', astar: 'A*' };
  var ALGOS = ['bfs', 'dfs', 'ucs', 'astar'];
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function svg(tag, attrs, padre) {
    var n = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (padre) padre.appendChild(n);
    return n;
  }
  function def(id) { return DEFS.filter(function (d) { return d.id === id; })[0]; }

  // ---------- el mapa de ejemplo ----------

  var DEMO = {
    id: 'demo', modo: 'visitar', final: 'meta',
    mapa: [
      '.........',
      '.~~~~~~..',
      'S~~~~~~.M',
      '.~~~~~~..',
      '.........'
    ],
    leyenda: { '.': 'camino', '~': 'barro', S: 'salida', M: 'meta' },
    tipos: {
      camino: { nombre: 'Camino', costo: 1 },
      barro: { nombre: 'Barro', costo: 5 },
      salida: { nombre: 'Salida', costo: 1, inicio: true },
      meta: { nombre: 'Meta', costo: 1 }
    }
  };

  var FICHAS = {
    bfs: {
      titulo: 'BFS · búsqueda en anchura',
      idea: 'Revisa por capas: primero todo lo que está a un paso, luego todo lo que está a dos, y así. Como una mancha de tinta que se extiende pareja.',
      lista: 'Cola: el primero que entra es el primero que sale.',
      bien: 'Encuentra el camino con menos pasos. Si existe solución, la encuentra.',
      mal: 'No mira los costos: aquí cruza el barro porque son menos casillas, aunque cueste mucho más.',
      cuando: 'Todas las acciones cuestan lo mismo, o solo importa contar pasos o saber si hay camino.'
    },
    dfs: {
      titulo: 'DFS · búsqueda en profundidad',
      idea: 'Sigue un camino hasta el fondo y solo retrocede cuando se atasca. Como recorrer un laberinto con la mano pegada a la pared.',
      lista: 'Pila: el último que entra es el primero que sale.',
      bien: 'Usa muy poca memoria y a veces llega rápido.',
      mal: 'No garantiza el mejor camino: se queda con el primero que encuentra, aunque sea largo o caro. Aquí se mete derecho al barro.',
      cuando: 'Basta con cualquier solución, el espacio es muy profundo o la memoria es escasa.'
    },
    ucs: {
      titulo: 'Costo uniforme',
      idea: 'Siempre revisa lo más barato de alcanzar hasta ahora, sumando el costo real g de cada acción. Por eso rodea el barro.',
      lista: 'Cola de prioridad ordenada por g, el costo acumulado.',
      bien: 'Encuentra el camino de menor costo total.',
      mal: 'Explora en todas las direcciones por igual, también hacia donde no está la meta.',
      cuando: 'Las acciones cuestan distinto (tiempo, dinero, energía) y no sabes estimar cuánto falta.'
    },
    astar: {
      titulo: 'A* · costo + pista',
      idea: 'Como costo uniforme, pero suma una pista h: una estimación de cuánto falta. Aquí, la distancia en línea recta sin contar el barro.',
      lista: 'Cola de prioridad ordenada por f = g + h.',
      bien: 'Encuentra el camino de menor costo revisando menos casillas, si la pista nunca exagera.',
      mal: 'Necesita una buena pista. Si h exagera, puede devolver un camino que no es el mejor.',
      cuando: 'Los costos varían y sabes estimar cuánto falta sin pasarte: distancias, deudas pendientes, tareas restantes.'
    }
  };

  var demo = { algo: 'bfs', timer: null };
  var mundoDemo = N.crearMundo(DEMO);
  var probDemo = N.compilar(mundoDemo);

  function pintarDemo(algo) {
    demo.algo = algo;
    if (demo.timer) clearTimeout(demo.timer);
    Array.prototype.forEach.call(document.querySelectorAll('#demoAlgos button'), function (b) {
      b.classList.toggle('on', b.dataset.algo === algo);
    });
    var r = N.resolver(probDemo, algo);
    var root = $('demoSvg');
    var C = 54;
    var cols = mundoDemo.cols;
    var filas = mundoDemo.filas;
    root.setAttribute('viewBox', '0 0 ' + (cols * C + 8) + ' ' + (filas * C + 8));
    root.textContent = '';
    var celdas = [];
    for (var id = 0; id < filas * cols; id += 1) {
      var k = mundoDemo.celdas[id];
      var x = 4 + (id % cols) * C;
      var y = 4 + Math.floor(id / cols) * C;
      var g = svg('g', {}, root);
      var rect = svg('rect', { x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 10, class: 'dc ' + k }, g);
      var num = svg('text', { x: x + C / 2, y: y + C / 2 + 5, 'text-anchor': 'middle', class: 'dn' }, g);
      if (k === 'salida' || k === 'meta') num.textContent = k === 'salida' ? 'S' : 'M';
      celdas.push({ rect: rect, num: num, k: k });
    }
    var orden = r.exp.pos;
    var visto = {};
    var i = 0;
    $('dExp').textContent = '…';
    $('dPasos').textContent = '…';
    $('dCosto').textContent = '…';
    function final() {
      $('dExp').textContent = String(r.expandidos);
      $('dPasos').textContent = String(r.pasos);
      $('dCosto').textContent = String(r.costo);
      var pts = r.ruta.map(function (s) { return (4 + (s.pos % cols) * C + C / 2) + ',' + (4 + Math.floor(s.pos / cols) * C + C / 2); }).join(' ');
      svg('polyline', { points: pts, class: 'dr' }, root);
    }
    function paso() {
      if (i >= orden.length) { final(); return; }
      var p = orden[i];
      i += 1;
      if (!visto[p]) {
        visto[p] = true;
        var c = celdas[p];
        c.rect.classList.add('vista');
        if (c.k !== 'salida' && c.k !== 'meta') c.num.textContent = String(i);
      }
      demo.timer = setTimeout(paso, reducido ? 0 : 70);
    }
    paso();
    pintarFicha(algo, r);
  }

  function pintarFicha(algo, r) {
    var f = FICHAS[algo];
    var box = $('demoFicha');
    box.textContent = '';
    box.appendChild(el('h3', null, f.titulo));
    box.appendChild(el('p', 'idea', f.idea));
    var dl = el('dl');
    [['Su lista', f.lista], ['Lo bueno', f.bien], ['Cuidado', f.mal], ['Úsalo cuando', f.cuando]].forEach(function (par) {
      dl.appendChild(el('dt', null, par[0]));
      dl.appendChild(el('dd', null, par[1]));
    });
    box.appendChild(dl);
    var todos = {};
    ALGOS.forEach(function (a) { todos[a] = N.resolver(probDemo, a); });
    var mejor = Math.min.apply(null, ALGOS.map(function (a) { return todos[a].costo; }));
    var lect = 'En este mapa: ' + NOMBRE[algo] + ' revisa ' + r.expandidos + ' casillas y devuelve un camino de ' + r.pasos + ' pasos que cuesta ' + r.costo + '. ';
    lect += r.costo === mejor ? 'Es el más barato posible.' : 'El más barato cuesta ' + mejor + '.';
    box.appendChild(el('p', 'lectura', lect));
  }

  // ---------- mini mapa de la portada ----------

  function portada() {
    var root = $('portadaSvg');
    var r = N.resolver(probDemo, 'astar');
    var C = 38;
    var ox = 10;
    var oy = 34;
    for (var id = 0; id < probDemo.n; id += 1) {
      var k = mundoDemo.celdas[id];
      svg('rect', { x: ox + (id % 9) * C + 2, y: oy + Math.floor(id / 9) * C + 2, width: C - 4, height: C - 4, rx: 8, class: 'dc ' + k }, root);
    }
    var pts = r.ruta.map(function (s) { return (ox + (s.pos % 9) * C + C / 2) + ',' + (oy + Math.floor(s.pos / 9) * C + C / 2); }).join(' ');
    svg('polyline', { points: pts, class: 'dr portada-ruta' }, root);
    var t = svg('text', { x: 180, y: 22, 'text-anchor': 'middle', class: 'portada-txt' }, root);
    t.textContent = 'A* rodea el barro: costo ' + r.costo + ' en vez de ' + N.resolver(probDemo, 'bfs').costo;
  }

  // ---------- guía ----------

  var PREGUNTAS = {
    inicio: { q: '¿Todas las acciones cuestan lo mismo?', ayuda: 'Por ejemplo: cada movimiento vale 1. Si unas valen más tiempo, dinero o energía, responde que no.', op: [['Sí, todas valen igual', 'iguales'], ['No, unas cuestan más', 'pista']] },
    iguales: { q: '¿Necesitas la solución con menos pasos?', ayuda: 'O te basta cualquier solución, aunque sea larga, gastando poca memoria.', op: [['Sí, la más corta', 'R:bfs'], ['Me basta cualquiera', 'R:dfs']] },
    pista: { q: '¿Puedes estimar cuánto falta sin pasarte nunca?', ayuda: 'Una pista que nunca exagera: la distancia en línea recta, la deuda pendiente pagada al máximo, las tareas que faltan.', op: [['Sí, tengo esa pista', 'R:astar'], ['No tengo una pista confiable', 'R:ucs']] }
  };

  var RESULTADOS = {
    bfs: { por: 'Todas las acciones cuestan igual: contar pasos es lo mismo que contar costo, y BFS encuentra el camino con menos pasos.', ver: ['laberinto', 'ciber', 'dos'] },
    dfs: { por: 'Solo necesitas una solución y la memoria pesa. DFS gasta poca memoria, pero no esperes el mejor camino.', ver: ['laberinto', 'tutor'] },
    ucs: { por: 'Los costos varían y no tienes una pista confiable: costo uniforme garantiza el camino más barato.', ver: ['ambulancia', 'parqueadero', 'semaforo'] },
    astar: { por: 'Los costos varían y sabes estimar cuánto falta: A* encuentra el mismo costo que costo uniforme revisando menos estados.', ver: ['almacen', 'logistica', 'finanzas'] }
  };

  function guia(paso, historia) {
    historia = historia || [];
    var box = $('guia');
    box.textContent = '';
    historia.forEach(function (h) {
      var d = el('div', 'resp');
      d.appendChild(el('small', null, h.q));
      d.appendChild(el('b', null, h.r));
      box.appendChild(d);
    });
    if (paso.indexOf('R:') === 0) { resultado(paso.slice(2), historia); return; }
    $('guiaRes').hidden = true;
    var P = PREGUNTAS[paso];
    var card = el('div', 'pregunta');
    card.appendChild(el('p', 'q', P.q));
    card.appendChild(el('p', 'sub', P.ayuda));
    var fila = el('div', 'fila-btn');
    P.op.forEach(function (o) {
      var b = el('button', 'b-sec', o[0]);
      b.type = 'button';
      b.addEventListener('click', function () { guia(o[1], historia.concat([{ q: P.q, r: o[0] }])); });
      fila.appendChild(b);
    });
    card.appendChild(fila);
    box.appendChild(card);
  }

  function resultado(algo, historia) {
    var R = RESULTADOS[algo];
    var box = $('guiaRes');
    box.textContent = '';
    box.appendChild(el('p', 'eyebrow', 'Te conviene'));
    box.appendChild(el('h3', null, NOMBRE[algo]));
    box.appendChild(el('p', null, R.por));
    var extra = el('p', 'sub', '¿Y si el mundo cambia mientras el agente actúa? Elige el algoritmo con esta guía y además haz que el agente vuelva a planear cuando perciba un cambio. Pruébalo con «Mundo vivo».');
    box.appendChild(extra);
    box.appendChild(el('p', 'mini', 'Compruébalo en:'));
    var fila = el('div', 'fila-btn');
    R.ver.forEach(function (id) {
      var d = def(id);
      if (!d) return;
      var a = el('a', 'b-sec', d.titulo + ' →');
      a.href = 'misiones.html#' + id;
      fila.appendChild(a);
    });
    box.appendChild(fila);
    var otra = el('button', 'b-ico reiniciar-guia', '↺');
    otra.type = 'button';
    otra.title = 'Empezar de nuevo';
    otra.addEventListener('click', function () { guia('inicio'); });
    box.appendChild(otra);
    box.hidden = false;
    void historia;
  }

  // ---------- dónde brilla: números en vivo ----------

  var BRILLA = [
    { algo: 'bfs', mision: 'laberinto', por: 'Todos los pasos cuestan 1: BFS da el mismo costo que los algoritmos con costos, y el camino más corto.' },
    { algo: 'bfs', mision: 'ciber', por: 'Solo importa si existe un camino hasta los datos. BFS revisa todo lo alcanzable: si no encuentra ruta, no existe.' },
    { algo: 'dfs', mision: 'tutor', por: 'DFS encuentra un plan con poca memoria, pero no el de menos horas. Sirve para saber si es posible, no para optimizar.' },
    { algo: 'ucs', mision: 'ambulancia', por: 'Menos cuadras no es menos tiempo: las avenidas son rápidas y los trancones lentos. BFS pierde minutos.' },
    { algo: 'ucs', mision: 'semaforo', por: 'El costo es tiempo y a veces conviene esperar el verde. Solo un algoritmo que suma costos lo ve.' },
    { algo: 'astar', mision: 'almacen', por: 'Tres paquetes y un muelle: la pista estima lo que falta recorrer y descarta caminos inútiles.' },
    { algo: 'astar', mision: 'logistica', por: 'Cinco tiendas son 120 órdenes posibles. A* encuentra el mejor sin revisarlos todos.' },
    { algo: 'astar', mision: 'finanzas', por: 'Sin mapa: el estado son saldos. La pista es cuánto costaría pagar la deuda más cara primero.' }
  ];

  function resolverMision(d) {
    if (d.vista === 'finanzas') {
      var M = F.modelo(d, {});
      var o = {};
      ALGOS.forEach(function (a) { var r = F.resolver(M, M.inicial, a); o[a] = { costo: r.costo, pasos: r.pasos, expandidos: r.expandidos, encontrado: r.encontrado }; });
      return o;
    }
    var p = N.compilar(N.crearMundo(d));
    var out = {};
    ALGOS.forEach(function (a) { out[a] = N.resolver(p, a); });
    return out;
  }

  function fmt(x) { return Math.round(x * 100) / 100; }

  function brilla() {
    var box = $('brilla');
    box.textContent = '';
    ['bfs', 'dfs', 'ucs', 'astar'].forEach(function (algo) {
      var col = el('div', 'brilla-col');
      col.appendChild(el('h3', 'brilla-titulo ' + algo, NOMBRE[algo]));
      BRILLA.filter(function (b) { return b.algo === algo; }).forEach(function (b) {
        var d = def(b.mision);
        if (!d) return;
        var R = resolverMision(d);
        var a = el('a', 'brilla-card');
        a.href = 'misiones.html#' + d.id;
        a.appendChild(el('p', 'eyebrow', 'Reto ' + d.reto));
        a.appendChild(el('h4', null, d.titulo));
        a.appendChild(el('p', 'por', b.por));
        var maxE = Math.max.apply(null, ALGOS.map(function (x) { return R[x].expandidos; }));
        var conCamino = ALGOS.filter(function (x) { return R[x].encontrado; });
        var mejor = conCamino.length ? Math.min.apply(null, conCamino.map(function (x) { return R[x].costo; })) : null;
        var t = el('div', 'evid');
        ALGOS.forEach(function (x) {
          var fila = el('div', 'ev' + (x === algo ? ' destacado' : ''));
          fila.appendChild(el('span', null, NOMBRE[x]));
          var barra = el('i');
          var lleno = el('b');
          lleno.style.width = Math.max(3, 100 * R[x].expandidos / maxE) + '%';
          barra.appendChild(lleno);
          fila.appendChild(barra);
          var costo = R[x].encontrado ? fmt(R[x].costo) + ' ' + (d.unidad || '') : 'sin camino';
          fila.appendChild(el('code', R[x].encontrado && R[x].costo === mejor ? 'opt' : null, costo));
          t.appendChild(fila);
        });
        a.appendChild(t);
        a.appendChild(el('p', 'leyenda-ev', 'Barra: estados revisados. Número: costo del plan (verde = el mejor).'));
        col.appendChild(a);
      });
      box.appendChild(col);
    });
  }

  // ---------- arranque ----------

  Array.prototype.forEach.call(document.querySelectorAll('#demoAlgos button'), function (b) {
    b.addEventListener('click', function () { pintarDemo(b.dataset.algo); });
  });
  portada();
  pintarDemo('bfs');
  guia('inicio');
  if (DEFS.length) brilla();
})();
