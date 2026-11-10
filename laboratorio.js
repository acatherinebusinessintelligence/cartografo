(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const KEY = 'cartografo-bitacora-v1';
  const ROWS = 4;
  const COLS = 7;

  const SCENARIOS = {
    city: {
      title: 'Ciudad',
      blocked: [10, 17],
      start: 21,
      goal: 6,
      traffic: 1,
      help: 'Sales de A4 hacia G1. D2 y D3 están cerrados. La fila 2 y la columna D son las vías caras.'
    },
    atajo: {
      title: 'Atajo caro',
      blocked: [],
      start: 7,
      goal: 11,
      traffic: 4,
      help: 'De A2 a E2 la recta de la fila 2 tiene 4 vías caras. Con congestión 4× cada una cuesta 12. El rodeo por arriba cuesta 1 por vía.'
    },
    warehouse: {
      title: 'Almacén',
      blocked: [8, 9, 15, 16, 23],
      start: 0,
      goal: 27,
      traffic: 1,
      help: 'El robot va de A1 a G4. Los estantes bloqueados no son estados: no salen aristas hacia ellos.'
    },
    drone: {
      title: 'Dron',
      blocked: [3, 10, 11, 18],
      start: 21,
      goal: 13,
      traffic: 1,
      help: 'El dron va de A4 a G2. Las zonas cerradas obligan a rodear. Mira si la frontera se agota.'
    },
    casa: {
      title: 'Casa',
      blocked: [9, 16, 18],
      start: 21,
      goal: 5,
      traffic: 1,
      help: 'La entrada está en A4. C2, C3 y E3 son muebles: no se cruzan ni se limpian. Para limpiar varias habitaciones, cambia la meta y registra cada tramo.'
    },
    laberinto: {
      title: 'Laberinto',
      blocked: [8, 9, 10, 15, 16],
      start: 0,
      goal: 21,
      traffic: 1,
      help: 'La entrada es A1 y la salida es A4, por la misma columna. B2, C2, D2, B3 y C3 son muros. BFS baja por la columna A. DFS se va primero hacia la derecha.'
    },
    ambulancia: {
      title: 'Ambulancia',
      blocked: [],
      start: 7,
      goal: 11,
      traffic: 4,
      help: 'El hospital está en E2. La avenida de la fila 2 es el camino de 4 saltos y cada tramo cuesta 12. El rodeo por la fila 1 cuesta 1 por vía.'
    },
    hospital: {
      title: 'Hospital',
      blocked: [10, 11, 17],
      start: 0,
      goal: 27,
      traffic: 1,
      help: 'La farmacia está en A1 y la habitación final en G4. D2, E2 y D3 tienen el acceso cerrado.'
    },
    rescate: {
      title: 'Rescate',
      blocked: [15, 22],
      start: 0,
      goal: 27,
      traffic: 1,
      help: 'El equipo entra por A1 y la persona está en G4. B3 y B4 ya están cerrados. Si descubres otro derrumbe, bloquéalo y busca de nuevo.'
    }
  };

  const ALGO_INFO = {
    bfs: { name: 'BFS', optimiza: 'menos saltos', usa: 'el frente de la cola', ignora: 'el costo de las vías' },
    dfs: { name: 'DFS', optimiza: 'nada: se queda con la primera rama que llega', usa: 'el tope de la pila', ignora: 'costos y el resto de ramas' },
    ucs: { name: 'Costo uniforme', optimiza: 'el menor g(n)', usa: 'la suma de las vías ya recorridas', ignora: 'la estimación de lo que falta' },
    astar: { name: 'A*', optimiza: 'el menor f(n) = g(n) + h(n)', usa: 'lo recorrido y Manhattan', ignora: 'nada de lo que h estima por debajo' }
  };

  const FRONTERA = {
    bfs: { title: 'Cola', hint: 'Sale el de la izquierda. g, h y f se muestran, pero BFS solo mira el orden de llegada.' },
    dfs: { title: 'Pila', hint: 'El tope está a la derecha y es el siguiente. La pila no ordena por costo.' },
    ucs: { title: 'Prioridad por g', hint: 'Ordenados por g. Sale el de la izquierda, el costo parcial más bajo.' },
    astar: { title: 'Prioridad por f', hint: 'Ordenados por f = g + h. Sale el de la izquierda.' }
  };

  const LINES = {
    bfs: {
      code: [
        'frontera ← cola [ inicio ]',
        'vistos ← { inicio }',
        'mientras la cola no esté vacía:',
        '    actual ← sacar el primero',
        '    si actual es la meta: devolver camino',
        '    para cada vecino no visto:',
        '        marcarlo visto',
        '        encolarlo al final',
        'devolver: no hay ruta'
      ],
      at: { init: 0, extract: 3, goal: 4, neighbors: 5, fail: 8, skip: 3 }
    },
    dfs: {
      code: [
        'frontera ← pila [ inicio ]',
        'vistos ← { inicio }',
        'mientras la pila no esté vacía:',
        '    actual ← sacar el tope',
        '    si actual es la meta: devolver camino',
        '    para cada vecino no visto:',
        '        marcarlo visto y apilarlo',
        'devolver: no hay ruta'
      ],
      at: { init: 0, extract: 3, goal: 4, neighbors: 5, fail: 7, skip: 3 }
    },
    ucs: {
      code: [
        'frontera ← { inicio con g = 0 }',
        'expandidos ← ∅',
        'mientras la frontera no esté vacía:',
        '    actual ← extraer el menor g',
        '    si actual ya fue expandido: ignorarlo',
        '    expandidos ← expandidos ∪ { actual }',
        '    si actual es la meta: devolver camino',
        '    para cada vecino:',
        '        g′ ← g(actual) + w(actual, vecino)',
        '        si g′ mejora la frontera: reemplazar',
        'devolver: no hay ruta'
      ],
      at: { init: 0, extract: 3, skip: 4, neighbors: 7, goal: 6, fail: 10 }
    },
    astar: {
      code: [
        'f(n) ← g(n) + h(n)',
        'frontera ← { inicio con g = 0 }',
        'mientras la frontera no esté vacía:',
        '    actual ← extraer el menor f',
        '    si actual ya fue expandido: ignorarlo',
        '    marcarlo expandido',
        '    si actual es la meta: devolver camino',
        '    para cada vecino:',
        '        g′ ← g + w;   f′ ← g′ + h(vecino)',
        '        si g′ mejora: entrar o reemplazar',
        'devolver: no hay ruta'
      ],
      at: { init: 0, extract: 3, skip: 4, neighbors: 7, goal: 6, fail: 10 }
    }
  };

  const TOPICS = [
    ['Estados', 'Cada círculo es un estado. Cada línea es una acción que lleva a otro estado. Bloquear un nodo lo saca del problema: deja de haber tránsito por ahí.'],
    ['Costo g', 'g(n) es la suma de las vías desde el inicio hasta n. Una vía normal suma 1. Una vía de la fila 2 o de la columna D suma 3 × congestión. g(inicio) = 0.'],
    ['Heurística h', 'h(n) = |fila(n) − fila(meta)| + |columna(n) − columna(meta)|. Es Manhattan. Como cada vía cuesta al menos 1, h no cuenta de más: es un piso de saltos, no el precio.'],
    ['f = g + h', 'A* ordena la frontera con f. Costo uniforme ordena solo con g. BFS y DFS muestran g y h para que los compares, pero deciden por la cola o por la pila.'],
    ['Óptimo', 'Con vías de costo positivo, costo uniforme devuelve el menor g. A* también, si h es admisible. BFS devuelve menos saltos. DFS devuelve el primer camino de su rama.']
  ];

  const QUESTIONS = [
    ['En el atajo caro, congestión 4×, la recta A2 → B2 → C2 → D2 → E2 usa 4 vías caras. ¿Cuánto suma?', 'Cada vía cara cuesta 3 × 4 = 12. Cuatro vías: 12 + 12 + 12 + 12 = 48. Un rodeo por vías de costo 1 puede sumar 6. Por eso menos saltos y menor costo se separan.'],
    ['¿BFS encuentra siempre el menor costo?', 'No. BFS encuentra el camino con menos saltos. Si las vías no cuestan lo mismo, ese camino puede ser más caro. Para el menor costo hace falta costo uniforme o A* con h admisible.'],
    ['¿Por qué A* reemplaza una entrada de la frontera mirando g y no f?', 'f sirve para elegir a quién sacar. La entrada guardada es un camino parcial, y ese camino se mejora solo si el g nuevo es menor. Un f bonito con un g peor seguiría siendo un peor camino.'],
    ['¿Qué demuestra h(inicio) ≤ costo del camino?', 'Solo una muestra en el inicio. No revisa el resto de nodos. En este mapa la garantía viene de otra parte: h es Manhattan y cada vía cuesta al menos 1, así que h no supera el costo real.']
  ];

  const CHALLENGES = [
    {
      ask: 'Deja fijo el mapa y ejecuta BFS y costo uniforme. El botón del atajo caro lo hace de una vez. Después lee la evidencia.',
      read: readCostGap
    },
    {
      ask: 'Cierra nodos cerca de la meta y ejecuta una búsqueda. La evidencia dirá si todavía existe un camino y cuáles nodos se expandieron.',
      read: readConnectivity
    },
    {
      ask: 'Ejecuta costo uniforme y A* sobre el mismo mapa. La evidencia comparará el costo y cuántos nodos expandió cada uno.',
      read: readHeuristic
    }
  ];

  const ACTION = {
    entra: 'Entra',
    mejora: 'Mejora',
    peor: 'No mejora',
    visto: 'Ya visto',
    visitado: 'Ya expandido',
    bloqueado: 'Bloqueado'
  };

  let scenario = 'city';
  let blocked = new Set();
  let start = 21;
  let goal = 6;
  let traffic = 1;
  let mode = 'block';
  let model = null;
  let history = loadHistory();
  let lastRenderedStep = -2;
  const state = {
    frames: [],
    pos: 0,
    timer: null,
    report: null,
    replays: null,
    activeAlgo: null,
    hoverId: null
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function currentCfg() {
    return {
      algo: $('algo').value,
      rows: ROWS,
      cols: COLS,
      start: start,
      goal: goal,
      traffic: traffic,
      blocked: Array.from(blocked)
    };
  }

  function syncModel() {
    model = Motor.createModel({ rows: ROWS, cols: COLS, traffic: traffic, blocked: Array.from(blocked) });
  }

  function currentPayload() {
    if (!state.frames.length) return Motor.describeSetup(currentCfg());
    return state.frames[state.pos];
  }

  function loadHistory() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter((item) => item && typeof item.algo === 'string').slice(0, 40);
    } catch (err) {
      return [];
    }
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(history)); } catch (err) { /* el navegador puede bloquear el almacenamiento */ }
  }

  function pushHistory(result, via) {
    history.unshift({
      at: new Date().toLocaleString('es-CO'),
      via: via || '',
      algo: result.algo,
      scenario: scenario,
      explored: result.explored,
      cost: result.cost,
      hops: result.hops,
      traffic: result.traffic,
      start: result.start,
      goal: result.goal,
      blocked: result.blocked.slice(),
      path: result.path ? result.path.slice() : null
    });
    history = history.slice(0, 40);
    persist();
    renderHistory();
  }

  function sameMap(a, b) {
    return a.traffic === b.traffic && a.start === b.start && a.goal === b.goal && String(a.blocked) === String(b.blocked);
  }

  function latestPair(algoA, algoB) {
    for (let i = 0; i < history.length; i++) {
      const left = history[i];
      if (left.algo !== algoA) continue;
      const right = history.find((item) => item.algo === algoB && sameMap(left, item));
      if (right) return [left, right];
    }
    return null;
  }

  function readCostGap() {
    const pair = latestPair('bfs', 'ucs');
    if (!pair) return 'En la bitácora no están BFS y costo uniforme sobre el mismo mapa, la misma congestión y los mismos obstáculos. Ejecuta los dos sin cambiar el escenario entre medias, o usa el botón del atajo caro.';
    const bfs = pair[0];
    const ucs = pair[1];
    if (bfs.cost == null || ucs.cost == null) return 'En esa pareja alguna corrida no encontró ruta. Quita el corte y vuelve a ejecutar las dos.';
    if (bfs.cost === ucs.cost) {
      return 'En este mapa coincidieron. BFS costó ' + bfs.cost + ' con ' + bfs.hops + ' saltos y costo uniforme también costó ' + ucs.cost + ' con ' + ucs.hops + ' saltos. Para verlos separarse, abre Atajo caro o sube la congestión y repite las dos corridas.';
    }
    const gap = bfs.cost - ucs.cost;
    return 'BFS costó ' + bfs.cost + ' con ' + bfs.hops + ' saltos. Costo uniforme costó ' + ucs.cost + ' con ' + ucs.hops + ' saltos. El camino con menos saltos sale ' + gap + ' más caro. Congestión de esa corrida: ' + bfs.traffic + '×.';
  }

  function readConnectivity() {
    if (!history.length) return 'Todavía no hay corridas. Ejecuta un algoritmo después de bloquear nodos.';
    const last = history[0];
    const names = (last.blocked || []).map((id) => model.label(id));
    if (last.path) {
      return 'La última corrida sí encontró ruta: ' + last.path.map((id) => model.label(id)).join(' → ') + '. Costo ' + last.cost + ', ' + last.hops + ' saltos. Obstáculos de ese mapa: ' + (names.join(', ') || 'ninguno') + '.';
    }
    return 'La última corrida no encontró ruta. Se expandieron ' + last.explored + ' nodos y la frontera terminó vacía. Obstáculos: ' + (names.join(', ') || 'ninguno') + '. Esos muros dejaron el inicio y la meta desconectados, o la meta quedó aislada.';
  }

  function readHeuristic() {
    const pair = latestPair('ucs', 'astar');
    if (!pair) return 'Faltan costo uniforme y A* sobre el mismo mapa. Ejecuta los dos, o Comparar 4, sin cambiar obstáculos ni congestión.';
    const ucs = pair[0].algo === 'ucs' ? pair[0] : pair[1];
    const astar = pair[0].algo === 'astar' ? pair[0] : pair[1];
    if (ucs.cost == null || astar.cost == null) return 'Alguna de las dos no llegó a la meta. No hay costo óptimo que comparar.';
    const saved = ucs.explored - astar.explored;
    const costLine = ucs.cost === astar.cost
      ? 'El costo coincide: ' + ucs.cost + '.'
      : 'El costo no coincide: uniforme ' + ucs.cost + ', A* ' + astar.cost + '. En este mapa no debería pasar.';
    const expandLine = saved > 0
      ? ' A* expandió ' + astar.explored + ' y costo uniforme ' + ucs.explored + '. La heurística se ahorró ' + saved + ' expansiones.'
      : saved === 0
        ? ' Los dos expandieron ' + astar.explored + ' nodos. En este mapa h no redujo el trabajo.'
        : ' A* expandió ' + astar.explored + ' y costo uniforme ' + ucs.explored + '. Con empates, A* puede abrir nodos distintos en la frontera de f igual al costo óptimo.';
    return costLine + expandLine;
  }

  function stop() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  function delay() {
    const table = { 1: 1600, 2: 1050, 3: 650, 4: 380, 5: 200 };
    return table[String($('speed').value)] || 1050;
  }

  function tick() {
    if (state.pos >= state.frames.length - 1) {
      stop();
      renderPlayLabel();
      return;
    }
    state.pos += 1;
    render();
  }

  function execute(algo) {
    stop();
    const out = Motor.runSearch(Object.assign(currentCfg(), { algo: algo }));
    state.frames = out.frames;
    state.pos = 0;
    state.report = null;
    state.replays = null;
    state.activeAlgo = algo;
    state.hoverId = null;
    pushHistory(out.result, '');
    render();
  }

  function play() {
    if (state.timer) {
      stop();
      renderPlayLabel();
      return;
    }
    const atEnd = state.frames.length && state.pos >= state.frames.length - 1;
    if (!state.frames.length || atEnd) execute($('algo').value);
    state.timer = setInterval(tick, delay());
    renderPlayLabel();
  }

  function stepForward() {
    stop();
    if (!state.frames.length) {
      execute($('algo').value);
      return;
    }
    if (state.pos < state.frames.length - 1) state.pos += 1;
    render();
  }

  function stepBack() {
    stop();
    if (state.pos > 0) state.pos -= 1;
    render();
  }

  function runCompare() {
    stop();
    const algos = ['bfs', 'dfs', 'ucs', 'astar'];
    const replays = {};
    const results = [];
    algos.forEach((algo) => {
      const out = Motor.runSearch(Object.assign(currentCfg(), { algo: algo }));
      replays[algo] = out.frames;
      results.push(out.result);
      pushHistory(out.result, 'comparación');
    });
    state.replays = replays;
    state.report = buildReport(results);
    state.activeAlgo = 'astar';
    state.frames = replays.astar;
    state.pos = Math.max(0, state.frames.length - 1);
    state.hoverId = null;
    render();
  }

  function buildReport(results) {
    const reached = results.filter((item) => item.cost != null);
    const bestCost = reached.length ? Math.min.apply(null, reached.map((item) => item.cost)) : null;
    const bestHops = reached.length ? Math.min.apply(null, reached.map((item) => item.hops)) : null;
    const by = {};
    results.forEach((item) => { by[item.algo] = item; });
    let note = 'Pulsa una fila para ver esa corrida, paso a paso.';
    if (by.ucs && by.astar && by.ucs.cost != null && by.astar.cost != null && by.ucs.cost !== by.astar.cost) {
      note = 'A* costó ' + by.astar.cost + ' y costo uniforme ' + by.ucs.cost + '. En este mapa deberían coincidir.';
    } else if (by.bfs && by.ucs && by.bfs.cost != null && by.ucs.cost != null && by.bfs.cost > by.ucs.cost) {
      note = 'BFS costó ' + by.bfs.cost + ' (' + by.bfs.hops + ' saltos). Costo uniforme y A* costaron ' + by.ucs.cost + '. La ruta corta sale ' + (by.bfs.cost - by.ucs.cost) + ' más cara. Pulsa una fila para ver las cuentas.';
    } else if (by.bfs && by.ucs && by.bfs.cost != null && by.bfs.cost === by.ucs.cost) {
      note = 'Aquí el camino de menos saltos también cuesta ' + by.bfs.cost + '. Sube la congestión o abre Atajo caro para separarlos.';
    }
    return {
      rows: results.map((item) => ({
        algo: item.algo,
        cost: item.cost,
        hops: item.hops,
        explored: item.explored,
        bestCost: item.cost != null && item.cost === bestCost,
        bestHops: item.hops != null && item.hops === bestHops
      })),
      note: note
    };
  }

  function showReplay(algo) {
    if (!state.replays || !state.replays[algo]) return;
    stop();
    state.activeAlgo = algo;
    state.frames = state.replays[algo];
    state.pos = Math.max(0, state.frames.length - 1);
    state.hoverId = null;
    render();
  }

  function edgeKey(a, b) {
    return [a, b].slice().sort((x, y) => x - y).join('-');
  }

  function draw(frame) {
    const edgeG = $('edges');
    const nodeG = $('nodes');
    const labelG = $('gridLabels');
    edgeG.replaceChildren();
    nodeG.replaceChildren();
    labelG.replaceChildren();
    const pathSet = new Set();
    const trailSet = new Set();
    const hotSet = new Set();
    if (frame && frame.path && frame.path.length > 1) {
      const target = frame.kind === 'goal' ? pathSet : trailSet;
      for (let k = 1; k < frame.path.length; k++) target.add(edgeKey(frame.path[k - 1], frame.path[k]));
    }
    (frame && frame.hot ? frame.hot : []).forEach((pair) => hotSet.add(edgeKey(pair[0], pair[1])));
    const showAll = $('showCosts').checked;

    for (let c = 0; c < COLS; c++) {
      const p = point(c);
      const text = svgText(p.x, 22, String.fromCharCode(65 + c), 'grid-label');
      labelG.appendChild(text);
    }
    for (let r = 0; r < ROWS; r++) {
      const p = point(r * COLS);
      labelG.appendChild(svgText(22, p.y + 4, String(r + 1), 'grid-label'));
    }

    for (let i = 0; i < ROWS * COLS; i++) {
      [i + 1, i + COLS].forEach((j) => {
        if (j >= ROWS * COLS) return;
        if (j === i + 1 && i % COLS === COLS - 1) return;
        if (blocked.has(i) || blocked.has(j)) return;
        const a = point(i);
        const b = point(j);
        const key = edgeKey(i, j);
        const premium = model.wInfo(i, j).premium;
        const classes = ['edge'];
        if (premium) classes.push('premium');
        if (hotSet.has(key)) classes.push('hot');
        if (trailSet.has(key)) classes.push('trail');
        if (pathSet.has(key)) classes.push('path');
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', a.x);
        line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x);
        line.setAttribute('y2', b.y);
        line.setAttribute('class', classes.join(' '));
        edgeG.appendChild(line);
        if (showAll || premium || hotSet.has(key) || trailSet.has(key) || pathSet.has(key)) {
          const mid = labelPoint(a, b);
          const lab = svgText(mid.x, mid.y, String(model.weight(i, j)), 'edge-label' + (premium ? ' premium' : ''));
          edgeG.appendChild(lab);
        }
      });
    }

    for (let i = 0; i < ROWS * COLS; i++) {
      const p = point(i);
      const group = document.createElementNS(NS, 'g');
      const classes = ['node'];
      if (blocked.has(i)) classes.push('blocked');
      else if (frame && frame.kind === 'goal' && frame.path && frame.path.indexOf(i) !== -1) classes.push('path');
      else if (frame && frame.current === i) classes.push('current');
      else if (frame && frame.visited && frame.visited.indexOf(i) !== -1) classes.push('visited');
      else if (frame && (frame.frontier || []).some((n) => n.id === i)) classes.push('frontier');
      if (state.hoverId === i) classes.push('hover');
      group.setAttribute('class', classes.join(' '));
      group.setAttribute('tabindex', '0');
      group.setAttribute('role', 'button');
      const name = model.label(i);
      let role = '';
      if (i === start) role = ', inicio';
      if (i === goal) role = ', meta';
      if (blocked.has(i)) role = ', bloqueado';
      group.setAttribute('aria-label', 'Nodo ' + name + role);
      if (i === start) group.appendChild(ring(p, 'start'));
      if (i === goal) group.appendChild(ring(p, 'goal'));
      if (frame && frame.nextId === i && frame.current !== i && !blocked.has(i)) group.appendChild(ring(p, 'next'));
      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', '24');
      circle.setAttribute('class', 'body');
      const text = svgText(p.x, p.y + 4, name, '');
      const title = document.createElementNS(NS, 'title');
      title.textContent = name + role + scoreText(frame, i);
      group.append(circle, text, title);
      group.addEventListener('click', () => edit(i));
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          edit(i);
        }
      });
      nodeG.appendChild(group);
    }
  }

  function point(id) {
    return { x: 64 + (id % COLS) * 108, y: 58 + Math.floor(id / COLS) * 96 };
  }

  function labelPoint(a, b) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    if (Math.abs(a.y - b.y) < 1) return { x: mx, y: my - 12 };
    return { x: mx + 14, y: my + 4 };
  }

  function svgText(x, y, value, className) {
    const text = document.createElementNS(NS, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    if (className) text.setAttribute('class', className);
    text.textContent = value;
    return text;
  }

  function ring(p, kind) {
    const node = document.createElementNS(NS, 'circle');
    node.setAttribute('cx', p.x);
    node.setAttribute('cy', p.y);
    node.setAttribute('r', kind === 'next' ? '30' : '29');
    node.setAttribute('class', 'ring ' + kind);
    return node;
  }

  function scoreText(frame, id) {
    if (!frame) return '';
    const spot = (frame.frontier || []).find((n) => n.id === id);
    if (spot) return '. g ' + spot.g + ', h ' + spot.h + ', f ' + spot.f;
    if (frame.current === id && frame.g != null) return '. g ' + frame.g + ', h ' + frame.h + ', f ' + frame.f;
    return '';
  }

  function edit(id) {
    if (mode === 'start') {
      if (id === goal) return;
      start = id;
      blocked.delete(id);
    } else if (mode === 'goal') {
      if (id === start) return;
      goal = id;
      blocked.delete(id);
    } else {
      if (id === start || id === goal) return;
      if (blocked.has(id)) blocked.delete(id);
      else blocked.add(id);
    }
    stop();
    state.frames = [];
    state.pos = 0;
    state.report = null;
    state.replays = null;
    state.hoverId = null;
    syncModel();
    render();
  }

  function render() {
    syncModel();
    const frame = currentPayload();
    draw(frame);
    renderChrome(frame);
    renderMentor(frame);
    renderFrontier(frame);
    renderCompare();
    renderPlayLabel();
    const stepKey = state.frames.length ? state.pos : -1;
    if (stepKey !== lastRenderedStep) {
      $('mentor').scrollTop = 0;
      lastRenderedStep = stepKey;
    }
  }

function setAlgoSilently(algo) {
  const select = $('algo');
  if (select.value === algo) return;
  state.silenceAlgo = true;
  select.value = algo;
  state.silenceAlgo = false;
  renderAlgoCard();
}

function renderChrome(frame) {
  if (state.frames.length && state.activeAlgo) setAlgoSilently(state.activeAlgo);
  $('routeChip').textContent = model.label(start) + ' → ' + model.label(goal);
    $('mapCaption').textContent = SCENARIOS[scenario].title + ' · ' + model.label(start) + ' → ' + model.label(goal);
    const status = $('status');
    status.textContent = frame.status || 'Listo para explorar';
    status.className = 'status' + (frame.kind === 'fail' ? ' bad' : frame.kind === 'goal' ? '' : frame.kind === 'setup' ? '' : ' warn');
    $('explored').textContent = frame.visited ? String(frame.visited.length) : '0';
    $('frontierCount').textContent = frame.frontier ? String(frame.frontier.length) : '0';
    const showRunning = frame.kind === 'expand' || frame.kind === 'goal' || frame.kind === 'skip';
    $('cost').textContent = showRunning && frame.sum != null ? String(frame.sum) : '—';
    $('hops').textContent = showRunning && frame.depth != null ? String(frame.depth) : '—';
    $('costLabel').textContent = frame.kind === 'goal' ? 'Costo de la ruta' : 'Costo acumulado';
    $('hopsLabel').textContent = frame.kind === 'goal' ? 'Saltos del camino' : 'Saltos del tramo';
    if (!state.frames.length) {
      $('stepcount').textContent = 'Paso 0 de 0';
      $('bar').style.width = '0%';
      $('stepStamp').textContent = 'En espera';
    } else {
      $('stepcount').textContent = 'Paso ' + (state.pos + 1) + ' de ' + state.frames.length;
      const denom = Math.max(1, state.frames.length - 1);
      $('bar').style.width = (100 * state.pos / denom) + '%';
      $('stepStamp').textContent = 'Paso ' + (state.pos + 1);
    }
  }

  function renderPlayLabel() {
    const button = $('play');
    if (state.timer) button.textContent = 'Pausar';
    else if (state.frames.length && state.pos > 0 && state.pos < state.frames.length - 1) button.textContent = 'Seguir';
    else button.textContent = 'Ejecutar';
  }

  function renderMentor(frame) {
    const box = $('equation');
    box.replaceChildren();
    if (frame.hero) {
      const line = el('div', 'eq-line');
      frame.hero.tokens.forEach((tok) => line.appendChild(el('span', tok.cls || '', tok.text)));
      box.append(line, el('p', 'eq-cap', frame.hero.caption || ''));
      if (frame.hero.sub) box.appendChild(el('p', 'eq-sub', frame.hero.sub));
    }
    const story = $('story');
    story.replaceChildren(el('h3', 'story-title', frame.title || ''));
    (frame.paragraphs || []).forEach((text) => story.appendChild(el('p', '', text)));
    renderRibbon(frame);
    renderContest(frame);
    renderDecisions(frame);
    renderPseudo(frame);
  }

  function renderRibbon(frame) {
    const box = $('ribbon');
    const terms = frame.terms || [];
    box.replaceChildren();
    if (!terms.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    box.appendChild(el('p', 'ribbon-title', frame.kind === 'goal' ? 'Suma del camino' : 'Suma hasta aquí'));
    const line = el('div', 'ribbon');
    line.appendChild(el('span', 'nodechip', model.label(terms[0].from)));
    terms.forEach((term) => {
      line.appendChild(el('span', term.premium ? 'plus hot' : 'plus', '—' + term.w + '→'));
      line.appendChild(el('span', 'nodechip', model.label(term.to)));
    });
    box.appendChild(line);
    const sum = el('p', 'sumline');
    terms.forEach((term, index) => {
      if (index) sum.appendChild(el('span', 'op', ' + '));
      sum.appendChild(el('span', term.premium ? 'hot' : '', String(term.w)));
    });
    sum.appendChild(el('span', 'op', ' = '));
    sum.appendChild(el('strong', '', String(frame.sum)));
    box.appendChild(sum);
  }

  function renderContest(frame) {
    const wrap = $('contestWrap');
    const body = $('contestBody');
    body.replaceChildren();
    const contest = frame.contest || [];
    if (!contest.length) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    const algo = frame.algo;
    const rows = algo === 'dfs' ? contest.slice().reverse() : contest;
    if (algo === 'bfs') $('contestNote').textContent = 'El primero sale. La tabla enseña g, h y f, pero BFS no los consulta: usa el turno de la cola.';
    else if (algo === 'dfs') $('contestNote').textContent = 'El primero de esta tabla es el tope de la pila. DFS no elige por g ni por f.';
    else if (algo === 'ucs') $('contestNote').textContent = 'La columna g decide. h y f están para compararlos con A*.';
    else $('contestNote').textContent = 'La columna f decide. f = g + h, con h Manhattan.';
    rows.forEach((item) => {
      const tr = document.createElement('tr');
      if (item.picked) tr.className = 'picked';
      tr.append(
        cell(model.label(item.id), ''),
        cell(String(item.g), algo === 'ucs' ? 'decide' : ''),
        cell(String(item.h), ''),
        cell(String(item.f), algo === 'astar' ? 'decide' : ''),
        cell(item.picked ? 'sale ahora' : '', '')
      );
      tr.addEventListener('mouseenter', () => {
        state.hoverId = item.id;
        draw(currentPayload());
      });
      tr.addEventListener('mouseleave', () => {
        state.hoverId = null;
        draw(currentPayload());
      });
      body.appendChild(tr);
    });
  }

  function cell(text, className) {
    return el('td', className, text);
  }

  function renderDecisions(frame) {
    const wrap = $('decisionWrap');
    const body = $('decisionBody');
    body.replaceChildren();
    const decisions = frame.decisions || [];
    if (!decisions.length) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    decisions.forEach((decision) => {
      const tr = document.createElement('tr');
      tr.className = decision.action;
      const td = document.createElement('td');
      const head = el('div', 'd-head');
      head.append(el('strong', '', model.label(decision.id)), el('span', 'badge ' + decision.action, ACTION[decision.action] || decision.action));
      if (decision.stackTop) head.append(el('span', 'badge tope', 'tope'));
      td.appendChild(head);
      if (decision.w != null) {
        td.appendChild(el('p', 'math', 'w = ' + decision.wText + '   ·   g = ' + decision.g + '   ·   h = ' + decision.h + '   ·   f = ' + decision.f));
      }
      td.appendChild(el('p', 'detail', decision.detail));
      if (decision.consistency) td.appendChild(el('p', 'detail consistency', decision.consistency));
      tr.appendChild(td);
      tr.addEventListener('mouseenter', () => {
        state.hoverId = decision.id;
        draw(currentPayload());
      });
      tr.addEventListener('mouseleave', () => {
        state.hoverId = null;
        draw(currentPayload());
      });
      body.appendChild(tr);
    });
  }

  function renderPseudo(frame) {
    const algo = frame.algo || $('algo').value;
    const spec = LINES[algo];
    const mark = frame.mark || 'init';
    const active = spec.at[mark];
    const list = $('pseudo');
    list.replaceChildren();
    spec.code.forEach((line, index) => {
      list.appendChild(el('li', index === active ? 'on' : '', line));
    });
  }

  function orderedFrontier(algo, frontier) {
    const copy = frontier.slice();
    if (algo === 'ucs') copy.sort((a, b) => a.g - b.g || a.id - b.id);
    if (algo === 'astar') copy.sort((a, b) => a.f - b.f || a.g - b.g || a.id - b.id);
    return copy;
  }

  function renderFrontier(frame) {
    const algo = frame.algo || $('algo').value;
    const info = FRONTERA[algo];
    $('frontierTitle').textContent = info.title;
    let hint = info.hint;
    if (frame.kind === 'goal') hint = 'La búsqueda se detuvo. Estos nodos se quedaron en la frontera, sin expandir.';
    if (frame.kind === 'fail') hint = 'No quedó nadie por sacar.';
    $('frontierHint').textContent = hint;
    const box = $('frontierChips');
    box.replaceChildren();
    const items = orderedFrontier(algo, frame.frontier || []);
    if (!items.length) {
      box.appendChild(el('p', 'hint', 'La frontera está vacía.'));
      return;
    }
    items.forEach((item) => {
      const chip = el('button', 'chip');
      chip.type = 'button';
      if (item.id === frame.nextId) chip.classList.add('next');
      chip.append(
        el('strong', '', model.label(item.id)),
        el('span', algo === 'ucs' ? 'emph' : '', 'g ' + item.g),
        el('span', '', 'h ' + item.h),
        el('span', algo === 'astar' ? 'emph' : '', 'f ' + item.f)
      );
      chip.addEventListener('click', () => {
        state.hoverId = state.hoverId === item.id ? null : item.id;
        draw(currentPayload());
      });
      box.appendChild(chip);
    });
  }

  function renderCompare() {
    const box = $('compareBox');
if (!state.report) {
    box.hidden = true;
    box.replaceChildren();
    $('scoreline').hidden = true;
    $('scoreline').replaceChildren();
    return;
  }
    box.hidden = false;
    box.replaceChildren();
    const table = el('table', 'compare');
    const thead = document.createElement('thead');
    const head = document.createElement('tr');
    ['Algoritmo', 'Costo', 'Saltos', 'Expandidos'].forEach((label) => head.appendChild(el('th', '', label)));
    thead.appendChild(head);
    const tbody = document.createElement('tbody');
    state.report.rows.forEach((row) => {
      const tr = document.createElement('tr');
      if (row.algo === state.activeAlgo) tr.className = 'active';
      tr.tabIndex = 0;
      tr.append(
        el('td', '', ALGO_INFO[row.algo].name),
        el('td', row.bestCost ? 'win' : '', row.cost == null ? '—' : String(row.cost)),
        el('td', row.bestHops ? 'win' : '', row.hops == null ? '—' : String(row.hops)),
        el('td', '', String(row.explored))
      );
      const open = () => showReplay(row.algo);
      tr.addEventListener('click', open);
      tr.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      });
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);
box.append(table, el('p', 'compare-note', state.report.note));
  const line = $('scoreline');
  line.hidden = false;
  line.replaceChildren();
  state.report.rows.forEach((row) => {
    const pill = el('button', row.algo === state.activeAlgo ? 'on' : '', ALGO_INFO[row.algo].name + ' · ' + (row.cost == null ? 'sin ruta' : row.cost));
    pill.type = 'button';
    pill.addEventListener('click', () => showReplay(row.algo));
    line.appendChild(pill);
  });
}

  function renderAlgoCard() {
    const info = ALGO_INFO[$('algo').value];
    const card = $('algoCard');
    card.replaceChildren(
      el('strong', '', info.name),
      el('p', '', 'Optimiza: ' + info.optimiza),
      el('p', '', 'Usa: ' + info.usa),
      el('p', '', 'Deja fuera: ' + info.ignora)
    );
  }

  function renderTopics() {
    const box = $('topics');
    box.replaceChildren();
    TOPICS.forEach((topic, index) => {
      const button = el('button', index === topicIndex ? 'selected' : '', topic[0]);
      button.type = 'button';
      button.addEventListener('click', () => {
        topicIndex = index;
        renderTopics();
      });
      box.appendChild(button);
    });
    $('topicbody').textContent = TOPICS[topicIndex][1];
  }

  function renderQuestion() {
    $('question').textContent = QUESTIONS[questionIndex][0];
    $('feedback').hidden = true;
  }

  function renderChallenges() {
    const select = $('challenge');
    if (!select.options.length) {
      CHALLENGES.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = 'Reto ' + (index + 1);
        select.appendChild(option);
      });
    }
    $('challengeText').textContent = CHALLENGES[Number(select.value)].ask;
  }

  function renderHistory() {
    const box = $('history');
    box.replaceChildren();
    if (!history.length) {
      box.appendChild(el('p', '', 'Todavía no hay ejecuciones. Cuando corras un algoritmo, quedará aquí.'));
      return;
    }
    history.forEach((item) => {
      const route = item.path ? item.path.map((id) => labelOf(id)).join(' → ') : 'sin ruta';
      const cost = item.cost == null ? 'sin costo' : 'costo ' + item.cost;
      const via = item.via ? item.via + ' · ' : '';
      box.appendChild(el('p', '', item.at + ' · ' + via + item.scenario + ' · ' + String(item.algo).toUpperCase() + ' · ' + cost + ' · ' + (item.hops == null ? '—' : item.hops) + ' saltos · ' + item.explored + ' expandidos · ' + route));
    });
  }

  function labelOf(id) {
    const cols = 'ABCDEFG';
    return cols[id % COLS] + String(Math.floor(id / COLS) + 1);
  }

  function trafficText() {
    $('trafficLabel').textContent = traffic + '× · vía cara = ' + (traffic * 3);
  }

  function applyScenario(name) {
    const spec = SCENARIOS[name];
    scenario = name;
    blocked = new Set(spec.blocked);
    start = spec.start;
    goal = spec.goal;
    traffic = spec.traffic;
    $('scenario').value = name;
    $('traffic').value = String(traffic);
    $('scenarioHelp').textContent = spec.help;
    trafficText();
    stop();
    state.frames = [];
    state.pos = 0;
    state.report = null;
    state.replays = null;
    state.hoverId = null;
    syncModel();
    render();
  }

  function downloadHistory() {
    const header = ['fecha', 'origen', 'escenario', 'algoritmo', 'costo', 'saltos', 'expandidos', 'congestion', 'inicio', 'meta', 'obstaculos', 'ruta'];
    const rows = history.map((item) => [
      item.at,
      item.via,
      item.scenario,
      item.algo,
      item.cost == null ? '' : item.cost,
      item.hops == null ? '' : item.hops,
      item.explored,
      item.traffic,
      labelOf(item.start),
      labelOf(item.goal),
      (item.blocked || []).map(labelOf).join(' '),
      item.path ? item.path.map(labelOf).join(' → ') : 'sin ruta'
    ]);
    const csv = [header].concat(rows).map((row) => row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(';')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'bitacora_cartografo.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  let topicIndex = 0;
  let questionIndex = 0;

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      mode = button.dataset.mode;
      document.querySelectorAll('[data-mode]').forEach((item) => {
        const on = item === button;
        item.classList.toggle('active', on);
        item.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  });

  $('scenario').addEventListener('change', (event) => applyScenario(event.target.value));
$('algo').addEventListener('change', () => {
  if (state.silenceAlgo) return;
  stop();
  state.frames = [];
    state.pos = 0;
    state.report = null;
    state.replays = null;
    renderAlgoCard();
    render();
  });
  $('traffic').addEventListener('input', () => {
    traffic = Number($('traffic').value);
    trafficText();
    stop();
    state.frames = [];
    state.report = null;
    state.replays = null;
    syncModel();
    render();
  });
  $('speed').addEventListener('input', () => {
    if (!state.timer) return;
    clearInterval(state.timer);
    state.timer = setInterval(tick, delay());
  });
  $('showCosts').addEventListener('change', () => draw(currentPayload()));
  $('play').addEventListener('click', play);
  $('step').addEventListener('click', stepForward);
  $('next').addEventListener('click', stepForward);
  $('back').addEventListener('click', stepBack);
  $('compare').addEventListener('click', runCompare);
  $('reset').addEventListener('click', () => applyScenario(scenario));
  $('demo').addEventListener('click', () => {
    applyScenario('atajo');
    runCompare();
  });
  $('copyStep').addEventListener('click', async () => {
    const button = $('copyStep');
    try {
      await navigator.clipboard.writeText($('mentor').innerText);
      button.textContent = 'Copiado';
    } catch (err) {
      button.textContent = 'No se pudo copiar';
    }
    setTimeout(() => { button.textContent = 'Copiar este paso'; }, 1200);
  });
  $('reveal').addEventListener('click', () => {
    $('feedback').hidden = false;
    $('feedback').textContent = QUESTIONS[questionIndex][1];
  });
  $('newquestion').addEventListener('click', () => {
    questionIndex = (questionIndex + 1) % QUESTIONS.length;
    renderQuestion();
  });
  $('challenge').addEventListener('change', renderChallenges);
  $('check').addEventListener('click', () => {
    $('challengeFeedback').textContent = CHALLENGES[Number($('challenge').value)].read();
  });
  $('clearHistory').addEventListener('click', () => {
    history = [];
    persist();
    renderHistory();
  });
  $('save').addEventListener('click', downloadHistory);
  document.addEventListener('keydown', (event) => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepForward();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepBack();
    } else if (event.key === ' ' && tag !== 'BUTTON') {
      event.preventDefault();
      play();
    }
  });

  renderAlgoCard();
  renderTopics();
  renderQuestion();
  renderChallenges();
  renderHistory();
  applyScenario('city');

  window.Cartografo = {
    abrir: function (nombre) {
      if (!SCENARIOS[nombre]) return;
      applyScenario(nombre);
      const mapa = document.getElementById('graph');
      if (mapa && mapa.scrollIntoView) mapa.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    bitacora: function () {
      return history.map(function (item) {
        return {
          algo: item.algo,
          cost: item.cost,
          hops: item.hops,
          traffic: item.traffic,
          start: item.start,
          goal: item.goal,
          explored: item.explored,
          blocked: (item.blocked || []).slice(),
          path: item.path ? item.path.slice() : null,
          scenario: item.scenario
        };
      });
    },
    etiqueta: labelOf
  };
})();
