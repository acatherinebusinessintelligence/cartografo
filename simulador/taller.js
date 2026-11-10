/*
 * Taller de misiones: cada estudiante arma su propio caso (historia, mapa,
 * agente y meta), lo prueba con los cuatro algoritmos y lo abre como misión.
 */
(function () {
  'use strict';

  var N = window.Nucleo;
  var P = window.Propias;
  var NOMBRE = { bfs: 'BFS', dfs: 'DFS', ucs: 'Costo uniforme', astar: 'A*' };
  var ALGOS = ['bfs', 'dfs', 'ucs', 'astar'];
  var BORRADOR = 'cartografo.taller.borrador';

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  // ---------- las piezas del mapa ----------

  var PIEZAS = [
    { k: 'piso', c: 'a', grupo: 'Suelos', nombre: 'Piso', costo: 1, piso: '#e7e2d6', patron: 'baldosa', muestra: '#e7e2d6' },
    { k: 'calle', c: 'b', grupo: 'Suelos', nombre: 'Calle', costo: 1, piso: '#6b7280', patron: 'asfalto', muestra: '#6b7280' },
    { k: 'pasto', c: 'c', grupo: 'Suelos', nombre: 'Pasto', costo: 1, piso: '#86c06c', patron: 'cesped', muestra: '#86c06c' },
    { k: 'arena', c: 'd', grupo: 'Suelos', nombre: 'Arena', costo: 2, piso: '#f3d58a', patron: 'puntos', muestra: '#f3d58a' },
    { k: 'barro', c: 'e', grupo: 'Terreno caro', nombre: 'Barro', costo: 4, piso: '#8a5a33', patron: 'puntos', muestra: '#8a5a33' },
    { k: 'agua_baja', c: 'f', grupo: 'Terreno caro', nombre: 'Agua baja', costo: 3, piso: '#67e8f9', patron: 'agua', muestra: '#67e8f9' },
    { k: 'charco', c: 'g', grupo: 'Terreno caro', nombre: 'Charco', costo: 3, suelo: 'piso', forma: { f: 'charco', color: 'rgba(56,189,248,0.6)' }, muestra: '#7dd3fc' },
    { k: 'fuego', c: 'h', grupo: 'Terreno caro', nombre: 'Fuego', costo: 6, suelo: 'piso', forma: { f: 'fuego' }, muestra: '#f97316' },
    { k: 'trancon', c: 'i', grupo: 'Terreno caro', nombre: 'Trancón', costo: 5, suelo: 'calle', forma: { f: 'trancon' }, muestra: '#ef4444' },
    { k: 'muro', c: 'j', grupo: 'Obstáculos', nombre: 'Muro', paso: false, forma: { f: 'bloque', alto: 22, color: '#cbd5e1', techo: '#e2e8f0' }, muestra: '#94a3b8' },
    { k: 'edificio', c: 'k', grupo: 'Obstáculos', nombre: 'Edificio', paso: false, piso: '#a8a29e', forma: { f: 'edificio', alto: [24, 56], colores: ['#fde68a', '#bfdbfe', '#fecaca', '#ddd6fe', '#bbf7d0'] }, muestra: '#60a5fa' },
    { k: 'arbol', c: 'l', grupo: 'Obstáculos', nombre: 'Árbol', paso: false, piso: '#86c06c', patron: 'cesped', forma: { f: 'arbol' }, muestra: '#15803d' },
    { k: 'roca', c: 'm', grupo: 'Obstáculos', nombre: 'Roca', paso: false, piso: '#d6d3d1', forma: { f: 'roca' }, muestra: '#78716c' },
    { k: 'cajas', c: 'n', grupo: 'Obstáculos', nombre: 'Cajas', paso: false, suelo: 'piso', forma: { f: 'cajas' }, muestra: '#c58f52' },
    { k: 'agua', c: 'o', grupo: 'Obstáculos', nombre: 'Agua profunda', paso: false, piso: '#0ea5e9', patron: 'agua', muestra: '#0284c7' },
    { k: 'barrera', c: 'p', grupo: 'Obstáculos', nombre: 'Barrera', paso: false, suelo: 'calle', forma: { f: 'barrera' }, muestra: '#ea580c' },
    { k: 'obj_persona', c: 'q', grupo: 'Objetivos', nombre: 'Persona', costo: 1, objetivo: 'visitar', suelo: 'piso', forma: { f: 'persona', color: '#ef4444', pulso: true }, muestra: '#f43f5e', simbolo: '●' },
    { k: 'obj_cofre', c: 'r', grupo: 'Objetivos', nombre: 'Cofre', costo: 1, objetivo: 'visitar', suelo: 'piso', forma: { f: 'cofre' }, muestra: '#ca8a04', simbolo: '◆' },
    { k: 'obj_tienda', c: 's', grupo: 'Objetivos', nombre: 'Tienda', costo: 1, objetivo: 'visitar', suelo: 'calle', forma: { f: 'tienda' }, muestra: '#dc2626', simbolo: '▲' },
    { k: 'obj_punto', c: 't', grupo: 'Objetivos', nombre: 'Punto de control', costo: 1, objetivo: 'visitar', suelo: 'piso', forma: { f: 'hito', color: '#0ea5e9', icono: '★' }, muestra: '#0ea5e9', simbolo: '★' },
    { k: 'obj_urgente', c: 'u', grupo: 'Objetivos', nombre: 'Objetivo urgente', costo: 1, objetivo: 'visitar', prioridad: 'alta', suelo: 'piso', forma: { f: 'persona', color: '#dc2626', pulso: true }, muestra: '#b91c1c', simbolo: '!' },
    { k: 'inicio', c: 'v', grupo: 'Especiales', nombre: 'Inicio del agente', costo: 1, inicio: true, suelo: 'piso', forma: { f: 'marca', color: '#14b8a6' }, muestra: '#14b8a6', simbolo: 'S', unico: true },
    { k: 'meta', c: 'w', grupo: 'Especiales', nombre: 'Meta final', costo: 1, suelo: 'piso', forma: { f: 'portal', color: '#fde68a' }, muestra: '#facc15', simbolo: 'M', unico: true }
  ];
  var PIEZA = PIEZAS.reduce(function (o, p) { o[p.k] = p; return o; }, {});

  var TEMAS = {
    claro: { nombre: 'Día', fondo: ['#e0f2fe', '#bae6fd'], losa: ['#e2e8f0', '#cbd5e1', '#94a3b8'], calor: [14, 165, 233], ruta: '#f59e0b', noche: false, alto: 60 },
    noche: { nombre: 'Noche', fondo: ['#1e293b', '#0b1220'], losa: ['#334155', '#1e293b', '#0f172a'], calor: [56, 189, 248], ruta: '#facc15', noche: true, alto: 60 },
    bosque: { nombre: 'Bosque', fondo: ['#ecfccb', '#a3e635'], losa: ['#a16207', '#854d0e', '#713f12'], calor: [234, 88, 12], ruta: '#dc2626', noche: false, alto: 60 },
    desierto: { nombre: 'Desierto', fondo: ['#fef3c7', '#fcd34d'], losa: ['#d6b26a', '#b8954f', '#94753a'], calor: [37, 99, 235], ruta: '#2563eb', noche: false, alto: 60 },
    rosa: { nombre: 'Rosa', fondo: ['#fdf2f8', '#f9a8d4'], losa: ['#fce7f3', '#f5c2da', '#e9a8c8'], calor: [219, 39, 119], ruta: '#db2777', noche: false, alto: 60 }
  };

  var AGENTES = {
    persona: 'Persona', robot: 'Robot', vehiculo: 'Vehículo', dron: 'Dron', rover: 'Robot todoterreno', aspiradora: 'Aspiradora'
  };

  // ---------- el estado del editor ----------

  var E = null;
  var pincel = 'muro';
  var pintando = false;
  var escena = null;
  var algoVista = 'astar';

  function nuevo(filas, cols) {
    var celdas = [];
    for (var i = 0; i < filas * cols; i += 1) celdas.push('piso');
    celdas[0] = 'inicio';
    return {
      id: 'propia-' + Date.now().toString(36),
      titulo: '', lugar: '', historia: '', objetivo: '',
      agente: { nombre: '', dibujo: 'robot', color: '#0ea5e9', percibe: '', recuerda: '', acciones: '' },
      unidad: 'min', tema: 'claro', filas: filas, cols: cols, celdas: celdas,
      ajustes: {}, final: 'inicio', modo: 'visitar',
      textos: { inicio: '', cumplir: '', fin: '' },
      preguntas: ['', '', '']
    };
  }

  function ejemplo() {
    var mapa = [
      'vaaaaajkkajk',
      'abbbbbbbbbbk',
      'abkkabkkbqbk',
      'abkkabkkbbba',
      'abbbbbbbibba',
      'aallabkkbkka',
      'aallabkksbka',
      'aaaaabbbbbba',
      'eeeeaaaaaawa'
    ];
    var porC = PIEZAS.reduce(function (o, p) { o[p.c] = p.k; return o; }, {});
    var e = nuevo(mapa.length, mapa[0].length);
    e.celdas = mapa.join('').split('').map(function (ch) { return porC[ch]; });
    e.titulo = 'El domiciliario del barrio';
    e.lugar = 'Un barrio con calles y un parque';
    e.historia = 'Son las seis de la tarde. Lina reparte domicilios en bicicleta: tiene que llevar un pedido a una persona y otro a una tienda, y terminar en el punto de entrega de la empresa. Por las calles se avanza rápido; por el barro del potrero, muy lento. Hay un trancón en la calle principal.';
    e.objetivo = 'Entregar los dos pedidos y llegar a la meta en el menor tiempo.';
    e.agente = { nombre: 'Lina', dibujo: 'persona', color: '#f97316', percibe: 'El estado de cada calle y dónde están los pedidos.', recuerda: 'Qué pedidos ya entregó.', acciones: 'Avanzar una cuadra por cualquier vía abierta.' };
    e.final = 'meta';
    e.ajustes = { piso: { nombre: 'Andén', costo: 2 } };
    e.textos = { inicio: 'Lina sube a la bicicleta con dos pedidos en la maleta.', cumplir: '{agente} entrega el pedido en {celda}. Le firman y sigue.', fin: 'Lina llega al punto de entrega a tiempo.' };
    e.preguntas = ['¿Por qué BFS cruza por donde costo uniforme no?', 'Quita el trancón. ¿Cambia la ruta óptima?', '¿Cuántos estados ahorra A* frente a costo uniforme?'];
    return e;
  }

  function guardarBorrador() {
    try { localStorage.setItem(BORRADOR, JSON.stringify(E)); } catch (e) { /* sin espacio */ }
  }

  function cargarBorrador() {
    try {
      var b = JSON.parse(localStorage.getItem(BORRADOR) || 'null');
      if (b && b.celdas && b.celdas.length === b.filas * b.cols) return b;
    } catch (e) { /* nada */ }
    return null;
  }

  // ---------- del editor a una misión ----------

  function piezaFinal(k) {
    var base = PIEZA[k];
    var aj = E.ajustes[k] || {};
    return Object.assign({}, base, aj);
  }

  function construir() {
    var tipos = {};
    var leyenda = {};
    var suelo = masUsado();
    var usadas = {};
    E.celdas.forEach(function (k) { usadas[k] = true; if (PIEZA[k].suelo) usadas[PIEZA[k].suelo] = true; });
    [suelo, 'muro', 'barro'].forEach(function (k) { usadas[k] = true; });
    PIEZAS.forEach(function (p) {
      if (!usadas[p.k]) return;
      var f = piezaFinal(p.k);
      var t = { nombre: f.nombre };
      if (p.paso === false) t.paso = false; else t.costo = Number(f.costo) || 1;
      ['piso', 'patron', 'forma', 'suelo', 'objetivo', 'prioridad', 'inicio'].forEach(function (x) { if (p[x] !== undefined) t[x] = p[x]; });
      tipos[p.k] = t;
      leyenda[p.c] = p.k;
    });
    var filas = [];
    for (var r = 0; r < E.filas; r += 1) {
      var fila = '';
      for (var c = 0; c < E.cols; c += 1) fila += PIEZA[E.celdas[r * E.cols + c]].c;
      filas.push(fila);
    }
    var tema = TEMAS[E.tema] || TEMAS.claro;
    var nombreAgente = E.agente.nombre || 'El agente';
    var objetivos = E.celdas.filter(function (k) { return PIEZA[k].objetivo; }).length;
    var def = {
      id: E.id,
      propia: true,
      orden: 1000,
      reto: '★',
      titulo: E.titulo || 'Mi misión',
      lugar: E.lugar || 'Un mundo propio',
      concepto: 'Caso diseñado en el taller',
      dificultad: 'Diseño propio',
      escena: { fondo: tema.fondo, losa: tema.losa, calor: tema.calor, ruta: tema.ruta, noche: tema.noche, alto: tema.alto },
      historia: E.historia || 'Un agente tiene que resolver un problema en este mapa.',
      objetivo: E.objetivo || (objetivos ? 'Pasar por todos los objetivos' + (E.final === 'meta' ? ' y llegar a la meta.' : E.final === 'inicio' ? ' y volver al inicio.' : '.') : 'Llegar a la meta.'),
      agente: {
        nombre: nombreAgente, dibujo: E.agente.dibujo, color: E.agente.color,
        percibe: E.agente.percibe || 'Las casillas que tiene alrededor y cuánto cuesta cada una.',
        recuerda: E.agente.recuerda || 'Qué objetivos ya cumplió.',
        acciones: E.agente.acciones || 'Avanzar una casilla al norte, sur, este u oeste.',
        meta: E.objetivo || 'Cumplir todos los objetivos.'
      },
      objeto: 'el objetivo',
      objeto_plural: 'objetivos',
      verbos: { visita: 'cumple', llega: 'llega a' },
      modo: E.modo,
      unidad: E.unidad || 'min',
      unidad_larga: E.unidad || 'min',
      mapa: filas,
      leyenda: leyenda,
      tipos: tipos,
      zonas: [],
      herramientas: [
        { id: 'obstaculo', nombre: 'Obstáculos', ayuda: 'Pone o quita un muro.', ciclos: [[suelo, 'muro']] },
        { id: 'caro', nombre: 'Barro', ayuda: 'Pone o quita barro: se puede pasar, pero cuesta más.', ciclos: [[suelo, 'barro']] }
      ],
      parametros: [],
      sugerido: 'astar',
      preguntas: E.preguntas.filter(function (q) { return q && q.trim(); }),
      relato: {
        inicio: E.textos.inicio ? [E.textos.inicio] : [nombreAgente + ' revisa el mapa y calcula su plan.'],
        eventos: { visita: E.textos.cumplir || '{agente} {verbo} {obj} en {celda}.', llega: E.textos.cumplir || '{agente} llega a {obj}.', replan: '{motivo} ' + nombreAgente + ' vuelve a calcular.' },
        fin: E.textos.fin || nombreAgente + ' termina la misión.'
      },
      taller: JSON.parse(JSON.stringify(E))
    };
    if (E.final === 'inicio') def.final = 'inicio';
    else if (E.final === 'meta') def.final = 'meta';
    if (suelo === 'muro') def.herramientas = [];
    return def;
  }

  function masUsado() {
    var cuenta = {};
    E.celdas.forEach(function (k) { if (PIEZA[k].paso !== false && !PIEZA[k].objetivo && !PIEZA[k].unico && !PIEZA[k].forma) cuenta[k] = (cuenta[k] || 0) + 1; });
    var mejor = 'piso';
    Object.keys(cuenta).forEach(function (k) { if (!cuenta[mejor] || cuenta[k] > cuenta[mejor]) mejor = k; });
    return mejor;
  }

  // ---------- análisis: errores y pistas de diseño ----------

  function analizar(def) {
    var errores = [];
    var pistas = [];
    var objetivos = E.celdas.filter(function (k) { return PIEZA[k].objetivo; }).length;
    if (E.celdas.indexOf('inicio') < 0) errores.push('Falta el inicio del agente: pinta la pieza «Inicio del agente».');
    if (E.final === 'meta' && E.celdas.indexOf('meta') < 0) errores.push('Elegiste terminar en la meta, pero no hay ninguna «Meta final» en el mapa.');
    if (E.modo === 'alguno' && !objetivos) errores.push('Con «basta llegar a uno», pon al menos un objetivo.');
    if (E.modo === 'visitar' && objetivos > N.MAX_OBJETIVOS) errores.push('Hay ' + objetivos + ' objetivos: el máximo es ' + N.MAX_OBJETIVOS + ' (cada objetivo duplica los estados).');
    if (E.modo === 'visitar' && !objetivos && E.final !== 'meta') errores.push('No hay objetivos ni meta: el agente no tiene nada que hacer.');
    if (errores.length) return { errores: errores, pistas: pistas };
    var m;
    var p;
    try { m = N.crearMundo(def); p = N.compilar(m); } catch (e) { return { errores: [e.message], pistas: [] }; }
    var R = {};
    ALGOS.forEach(function (a) { R[a] = N.resolver(p, a); });
    var conteo = N.contarEstados(p, 80000);
    if (!R.bfs.encontrado) {
      errores.push('No hay camino: algún objetivo o la meta quedó encerrado entre obstáculos.');
      return { errores: errores, pistas: pistas, R: R, conteo: conteo, mundo: m, prob: p };
    }
    var costos = {};
    E.celdas.forEach(function (k) { if (PIEZA[k].paso !== false) costos[piezaFinal(k).costo] = true; });
    if (R.bfs.costo === R.ucs.costo) pistas.push(Object.keys(costos).length < 2
      ? 'Todos los terrenos cuestan lo mismo, así que BFS y costo uniforme dan igual. Agrega barro, agua o fuego (o cambia el costo de un suelo) para que se separen.'
      : 'BFS y costo uniforme coinciden: el camino más corto también es el más barato. Pon terreno caro justo en la ruta directa para obligar a decidir entre corto y barato.');
    else pistas.push('Bien: BFS paga ' + R.bfs.costo + ' ' + E.unidad + ' y costo uniforme ' + R.ucs.costo + '. Tu caso muestra que menos pasos no es menos costo.');
    if (R.astar.expandidos >= R.ucs.expandidos * 0.9) pistas.push('A* casi no ahorra trabajo frente a costo uniforme (' + R.astar.expandidos + ' contra ' + R.ucs.expandidos + ' estados). Aleja el inicio de la meta o agrega espacio abierto hacia los lados para que la pista descarte más.');
    else pistas.push('A* abre ' + R.astar.expandidos + ' estados contra ' + R.ucs.expandidos + ' de costo uniforme: la pista está haciendo su trabajo.');
    if (R.dfs.costo === R.ucs.costo) pistas.push('DFS acertó con el óptimo. Agrega caminos alternativos para que se note que no lo garantiza.');
    if (objetivos >= 2) pistas.push('Con ' + objetivos + ' objetivos, el estado guarda cuáles ya cumplió: hay ' + conteo.total.toLocaleString('es-CO') + ' estados para ' + p.n + ' casillas.');
    else if (E.modo === 'visitar') pistas.push('Con uno o ningún objetivo la memoria no pesa. Prueba con 2 o 3 para que el orden de visita importe.');
    return { errores: errores, pistas: pistas, R: R, conteo: conteo, mundo: m, prob: p };
  }

  // ---------- dibujo del editor ----------

  function pintarPaleta() {
    var box = $('tPaleta');
    box.textContent = '';
    var grupos = {};
    PIEZAS.forEach(function (p) { (grupos[p.grupo] = grupos[p.grupo] || []).push(p); });
    Object.keys(grupos).forEach(function (g) {
      var sec = el('div', 'paleta-grupo');
      sec.appendChild(el('h4', null, g));
      var fila = el('div', 'paleta-fila');
      grupos[g].forEach(function (p) {
        var f = piezaFinal(p.k);
        var b = el('button', 'pieza' + (pincel === p.k ? ' on' : ''));
        b.type = 'button';
        b.title = f.nombre + (p.paso === false ? ' · no se pasa' : ' · cuesta ' + f.costo);
        var sw = el('i', null, p.simbolo || '');
        sw.style.background = p.muestra;
        b.appendChild(sw);
        b.appendChild(el('span', null, f.nombre));
        if (p.paso !== false) b.appendChild(el('small', null, String(f.costo)));
        b.addEventListener('click', function () { pincel = p.k; pintarPaleta(); pintarAjuste(); });
        fila.appendChild(b);
      });
      sec.appendChild(fila);
      box.appendChild(sec);
    });
  }

  function pintarAjuste() {
    var box = $('tAjuste');
    box.textContent = '';
    var p = PIEZA[pincel];
    var f = piezaFinal(pincel);
    box.appendChild(el('span', 'aj-et', 'Pincel:'));
    var nombre = el('input');
    nombre.type = 'text';
    nombre.value = f.nombre;
    nombre.maxLength = 40;
    nombre.setAttribute('aria-label', 'Nombre de la pieza');
    nombre.addEventListener('change', function () { E.ajustes[pincel] = Object.assign({}, E.ajustes[pincel], { nombre: nombre.value || p.nombre }); cambio(); pintarPaleta(); });
    box.appendChild(nombre);
    if (p.paso !== false && !p.unico) {
      box.appendChild(el('span', 'aj-et', 'Costo'));
      var costo = el('input');
      costo.type = 'number';
      costo.min = '1';
      costo.max = '20';
      costo.value = String(f.costo);
      costo.setAttribute('aria-label', 'Costo de la pieza');
      costo.addEventListener('change', function () {
        var v = Math.max(1, Math.min(20, Math.round(Number(costo.value) || 1)));
        E.ajustes[pincel] = Object.assign({}, E.ajustes[pincel], { costo: v });
        cambio();
        pintarPaleta();
      });
      box.appendChild(costo);
    } else box.appendChild(el('small', null, p.paso === false ? 'No se puede pasar.' : 'Pieza única.'));
  }

  function pintarGrilla() {
    var g = $('tGrilla');
    g.textContent = '';
    g.style.gridTemplateColumns = 'repeat(' + E.cols + ', 1fr)';
    E.celdas.forEach(function (k, i) {
      var p = PIEZA[k];
      var b = el('button', 'celda', p.simbolo || '');
      b.type = 'button';
      b.style.background = p.muestra;
      b.title = N.LETRAS[i % E.cols] + (Math.floor(i / E.cols) + 1) + ' · ' + piezaFinal(k).nombre;
      b.dataset.i = String(i);
      g.appendChild(b);
    });
  }

  function pintarEn(i, k) {
    if (E.celdas[i] === k) return;
    if (PIEZA[k].unico) {
      var antes = E.celdas.indexOf(k);
      if (antes >= 0) E.celdas[antes] = masUsado();
    }
    if (PIEZA[E.celdas[i]].unico && !PIEZA[k].unico && E.celdas[i] === 'inicio') return;
    E.celdas[i] = k;
    pintarGrilla();
    cambio();
  }

  var timerCambio = null;
  function cambio() {
    guardarBorrador();
    clearTimeout(timerCambio);
    timerCambio = setTimeout(probar, 120);
  }

  function probar() {
    var def = construir();
    var A = analizar(def);
    var box = $('tPrueba');
    box.textContent = '';
    var lista = el('ul', 'avisos');
    A.errores.forEach(function (x) { lista.appendChild(el('li', 'av-error', x)); });
    A.pistas.forEach(function (x) { lista.appendChild(el('li', 'av-pista', x)); });
    if (A.R) {
      var t = el('table', 'costos realidades');
      var cab = el('tr');
      ['', 'Pasos', 'Costo', 'Estados abiertos'].forEach(function (h) { cab.appendChild(el('th', null, h)); });
      t.appendChild(cab);
      var mejor = A.R.ucs.encontrado ? A.R.ucs.costo : null;
      ALGOS.forEach(function (a) {
        var r = A.R[a];
        var tr = el('tr', a === algoVista ? 'actual' : null);
        var td = el('td');
        var b = el('button', 'link-algo', NOMBRE[a]);
        b.type = 'button';
        b.addEventListener('click', function () { algoVista = a; probar(); });
        td.appendChild(b);
        tr.appendChild(td);
        tr.appendChild(el('td', 'num', r.encontrado ? String(r.pasos) : '—'));
        tr.appendChild(el('td', 'num' + (r.encontrado && r.costo === mejor ? ' opt' : ''), r.encontrado ? r.costo + ' ' + E.unidad : 'sin camino'));
        tr.appendChild(el('td', 'num', String(r.expandidos)));
        t.appendChild(tr);
      });
      box.appendChild(t);
    }
    box.appendChild(lista);
    $('tAbrir').disabled = A.errores.length > 0;
    $('tEnlace').disabled = A.errores.length > 0;
    dibujarIso(def, A);
  }

  function dibujarIso(def, A) {
    var cv = $('tIso');
    var m;
    try { m = A.mundo || N.crearMundo(def); } catch (e) { return; }
    if (!escena) escena = new Iso.Escena(cv);
    escena.ajustar(m, 1);
    var p = A.prob || N.compilar(m);
    var r = A.R ? A.R[algoVista] : null;
    var ini = p.inicio >= 0 ? p.inicio : 0;
    escena.dibujar({
      t: 0, quieto: true,
      objetivos: p.objetivos,
      ruta: r && r.encontrado ? r.ruta.map(function (s) { return s.pos; }) : null,
      agente: { r: Math.floor(ini / m.cols), c: ini % m.cols, dir: 'e' },
      luz: function () { return true; }, abierta: function () { return true; }
    });
    $('tIsoTxt').textContent = r && r.encontrado ? 'Ruta de ' + NOMBRE[algoVista] + ': ' + r.pasos + ' pasos, ' + r.costo + ' ' + E.unidad + '. Toca otro algoritmo en la tabla para ver su ruta.' : 'Así se verá tu mundo.';
  }

  // ---------- formulario ----------

  var CAMPOS = [
    ['tTitulo', 'titulo'], ['tLugar', 'lugar'], ['tHistoria', 'historia'], ['tObjetivo', 'objetivo'],
    ['tAgNombre', 'agente.nombre'], ['tAgPercibe', 'agente.percibe'], ['tAgRecuerda', 'agente.recuerda'], ['tAgAcciones', 'agente.acciones'],
    ['tTxtInicio', 'textos.inicio'], ['tTxtCumplir', 'textos.cumplir'], ['tTxtFin', 'textos.fin'],
    ['tPreg1', 'preguntas.0'], ['tPreg2', 'preguntas.1'], ['tPreg3', 'preguntas.2'],
    ['tUnidad', 'unidad']
  ];

  function leerRuta(o, ruta) { return ruta.split('.').reduce(function (x, k) { return x == null ? x : x[k]; }, o); }
  function ponerRuta(o, ruta, v) {
    var ks = ruta.split('.');
    var u = ks.pop();
    var dest = ks.reduce(function (x, k) { return x[k]; }, o);
    dest[u] = v;
  }

  function pintarFormulario() {
    CAMPOS.forEach(function (c) { $(c[0]).value = leerRuta(E, c[1]) || ''; });
    $('tAgDibujo').value = E.agente.dibujo;
    $('tAgColor').value = E.agente.color;
    $('tTema').value = E.tema;
    $('tFinal').value = E.final;
    $('tModo').value = E.modo;
    $('tFilas').value = String(E.filas);
    $('tCols').value = String(E.cols);
  }

  function redimensionar(filas, cols) {
    var nuevas = [];
    for (var r = 0; r < filas; r += 1) {
      for (var c = 0; c < cols; c += 1) {
        nuevas.push(r < E.filas && c < E.cols ? E.celdas[r * E.cols + c] : masUsado());
      }
    }
    E.celdas = nuevas;
    E.filas = filas;
    E.cols = cols;
    if (E.celdas.indexOf('inicio') < 0) E.celdas[0] = 'inicio';
    pintarGrilla();
    cambio();
  }

  function cargar(e) {
    E = e;
    pintarFormulario();
    pintarPaleta();
    pintarAjuste();
    pintarGrilla();
    cambio();
  }

  // ---------- guardar, abrir, compartir ----------

  function aviso(t) {
    var a = $('tAviso');
    a.textContent = t;
    a.hidden = false;
    clearTimeout(aviso.timer);
    aviso.timer = setTimeout(function () { a.hidden = true; }, 3500);
  }

  function abrirComoMision() {
    var def = construir();
    var err = P.validar(def);
    if (err) { aviso(err); return; }
    if (!P.guardar(def)) { aviso('El navegador no dejó guardar. Libera espacio o descarga el JSON.'); return; }
    location.href = 'misiones.html#' + def.id;
  }

  function descargar() {
    var def = construir();
    var nombre = (def.titulo || 'mision').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mision';
    var blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function enlace() {
    var def = construir();
    delete def.taller;
    var url = new URL('misiones.html#caso=' + P.codificar(def), location.href).href;
    var caja = $('tEnlaceTxt');
    caja.value = url;
    caja.hidden = false;
    caja.select();
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { aviso('Enlace copiado. Quien lo abra verá tu misión completa.'); }, function () { aviso('Copia el enlace del recuadro.'); });
    else aviso('Copia el enlace del recuadro.');
  }

  function importar(archivo) {
    var lector = new FileReader();
    lector.onload = function () {
      var def;
      try { def = JSON.parse(lector.result); } catch (e) { aviso('Ese archivo no es un JSON válido.'); return; }
      var err = P.validar(def);
      if (err) { aviso('No se puede abrir: ' + err); return; }
      if (def.taller && def.taller.celdas) {
        def.taller.id = 'propia-' + Date.now().toString(36);
        cargar(def.taller);
        aviso('Misión cargada en el editor: «' + def.titulo + '».');
      } else {
        def.id = 'propia-' + Date.now().toString(36);
        def.propia = true;
        def.orden = 1000;
        P.guardar(def);
        pintarGuardadas();
        aviso('Misión guardada: ábrela en la lista «Tus misiones».');
      }
    };
    lector.readAsText(archivo);
  }

  function pintarGuardadas() {
    var box = $('tGuardadas');
    box.textContent = '';
    var l = P.leer();
    if (!l.length) { box.appendChild(el('p', 'sub', 'Todavía no has guardado ninguna. Cuando abras tu misión, aparecerá aquí.')); return; }
    l.forEach(function (d) {
      var item = el('div', 'guardada');
      var txt = el('div');
      txt.appendChild(el('b', null, d.titulo));
      txt.appendChild(el('small', null, d.lugar + ' · ' + d.mapa.length + '×' + d.mapa[0].length));
      item.appendChild(txt);
      var acc = el('div', 'fila-btn');
      var a1 = el('a', 'b-sec', 'Abrir');
      a1.href = 'misiones.html#' + d.id;
      acc.appendChild(a1);
      if (d.taller) {
        var b2 = el('button', 'b-sec', 'Editar');
        b2.type = 'button';
        b2.addEventListener('click', function () { cargar(JSON.parse(JSON.stringify(d.taller))); window.scrollTo({ top: $('tEditor').offsetTop - 80, behavior: 'smooth' }); });
        acc.appendChild(b2);
      }
      var b3 = el('button', 'b-peligro', 'Eliminar');
      b3.type = 'button';
      b3.addEventListener('click', function () {
        if (!window.confirm('¿Eliminar «' + d.titulo + '» de este navegador?')) return;
        P.borrar(d.id);
        pintarGuardadas();
      });
      acc.appendChild(b3);
      item.appendChild(acc);
      box.appendChild(item);
    });
  }

  // ---------- eventos ----------

  function enlazar() {
    CAMPOS.forEach(function (c) {
      $(c[0]).addEventListener('input', function () { ponerRuta(E, c[1], $(c[0]).value); cambio(); });
    });
    $('tAgDibujo').addEventListener('change', function () { E.agente.dibujo = $('tAgDibujo').value; cambio(); });
    $('tAgColor').addEventListener('input', function () { E.agente.color = $('tAgColor').value; cambio(); });
    $('tTema').addEventListener('change', function () { E.tema = $('tTema').value; cambio(); });
    $('tFinal').addEventListener('change', function () { E.final = $('tFinal').value; cambio(); });
    $('tModo').addEventListener('change', function () { E.modo = $('tModo').value; cambio(); });
    $('tFilas').addEventListener('change', function () { redimensionar(Math.max(4, Math.min(14, Number($('tFilas').value) || 8)), E.cols); });
    $('tCols').addEventListener('change', function () { redimensionar(E.filas, Math.max(4, Math.min(16, Number($('tCols').value) || 10))); });
    var g = $('tGrilla');
    g.addEventListener('mousedown', function (ev) {
      var i = ev.target.dataset && ev.target.dataset.i;
      if (i == null) return;
      ev.preventDefault();
      pintando = ev.button === 2 ? 'borrar' : true;
      pintarEn(Number(i), pintando === 'borrar' ? masUsado() : pincel);
    });
    g.addEventListener('mouseover', function (ev) {
      if (!pintando) return;
      var i = ev.target.dataset && ev.target.dataset.i;
      if (i == null) return;
      if (PIEZA[pincel].unico && pintando !== 'borrar') return;
      pintarEn(Number(i), pintando === 'borrar' ? masUsado() : pincel);
    });
    g.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    window.addEventListener('mouseup', function () { pintando = false; });
    $('tNuevo').addEventListener('click', function () {
      if (!window.confirm('¿Empezar un mapa vacío? Se pierde el borrador actual si no lo guardaste.')) return;
      cargar(nuevo(8, 10));
    });
    $('tEjemplo').addEventListener('click', function () {
      if (!window.confirm('¿Cargar el ejemplo «El domiciliario del barrio»? Se reemplaza el borrador actual.')) return;
      cargar(ejemplo());
    });
    $('tAbrir').addEventListener('click', abrirComoMision);
    $('tDescargar').addEventListener('click', descargar);
    $('tEnlace').addEventListener('click', enlace);
    $('tImportar').addEventListener('change', function () { if (this.files[0]) importar(this.files[0]); this.value = ''; });
  }

  // ---------- arranque ----------

  Object.keys(TEMAS).forEach(function (k) {
    var o = el('option', null, TEMAS[k].nombre);
    o.value = k;
    $('tTema').appendChild(o);
  });
  Object.keys(AGENTES).forEach(function (k) {
    var o = el('option', null, AGENTES[k]);
    o.value = k;
    $('tAgDibujo').appendChild(o);
  });
  enlazar();
  cargar(cargarBorrador() || ejemplo());
  pintarGuardadas();
})();
