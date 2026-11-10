(function (root) {
  'use strict';

  function normalize(cfg) {
    const traffic = Math.max(1, Number(cfg.traffic) || 1);
    return {
      algo: cfg.algo || 'bfs',
      rows: cfg.rows || 4,
      cols: cfg.cols || 7,
      start: cfg.start,
      goal: cfg.goal,
      traffic: traffic,
      blocked: cfg.blocked || []
    };
  }

  function createModel(cfg) {
    const spec = normalize(cfg);
    const { rows, cols, traffic } = spec;
    const blockedSet = new Set(spec.blocked);
    const COL = Array.from({ length: cols }, function (_, i) {
      return String.fromCharCode(65 + i);
    });

    function coord(id) {
      return [Math.floor(id / cols), id % cols];
    }

    function label(id) {
      const pair = coord(id);
      return COL[pair[1]] + String(pair[0] + 1);
    }

    function inBounds(id) {
      return id >= 0 && id < rows * cols;
    }

    function isBlocked(id) {
      return blockedSet.has(id);
    }

    function adjacent(id) {
      const pair = coord(id);
      const r = pair[0];
      const c = pair[1];
      const list = [];
      if (c + 1 < cols) list.push(id + 1);
      if (r + 1 < rows) list.push(id + cols);
      if (c > 0) list.push(id - 1);
      if (r > 0) list.push(id - cols);
      return list;
    }

    function neighbors(id) {
      return adjacent(id).filter(function (n) { return !blockedSet.has(n); });
    }

    function premiumReason(a, b) {
      const pa = coord(a);
      const pb = coord(b);
      if (pa[0] === 1 && pb[0] === 1) return 'fila 2';
      if (pa[1] === 3 && pb[1] === 3) return 'columna D';
      return null;
    }

    function wInfo(a, b) {
      const via = premiumReason(a, b);
      const w = via ? traffic * 3 : 1;
      const text = via ? '3 × ' + traffic + ' = ' + w + ' (' + via + ')' : '1 (vía normal)';
      return { w: w, premium: Boolean(via), via: via, text: text };
    }

    function weight(a, b) {
      return wInfo(a, b).w;
    }

    function manhattan(a, b) {
      const pa = coord(a);
      const pb = coord(b);
      return Math.abs(pa[0] - pb[0]) + Math.abs(pa[1] - pb[1]);
    }

    function hText(a, b) {
      const pa = coord(a);
      const pb = coord(b);
      const dr = Math.abs(pa[0] - pb[0]);
      const dc = Math.abs(pa[1] - pb[1]);
      return {
        h: dr + dc,
        text: '|fila ' + (pa[0] + 1) + ' − ' + (pb[0] + 1) + '| + |col ' + COL[pa[1]] + ' − col ' + COL[pb[1]] + '| = ' + dr + ' + ' + dc + ' = ' + (dr + dc)
      };
    }

    function blockedList() {
      return Array.from(blockedSet).sort(function (a, b) { return a - b; });
    }

    return {
      rows: rows,
      cols: cols,
      traffic: traffic,
      coord: coord,
      label: label,
      inBounds: inBounds,
      isBlocked: isBlocked,
      adjacent: adjacent,
      neighbors: neighbors,
      wInfo: wInfo,
      weight: weight,
      manhattan: manhattan,
      hText: hText,
      blockedList: blockedList
    };
  }

  function structureName(algo) {
    if (algo === 'dfs') return 'pila';
    if (algo === 'bfs') return 'cola';
    return 'cola de prioridad';
  }

  function termsOf(path, model) {
    const terms = [];
    for (let i = 1; i < path.length; i++) {
      const info = model.wInfo(path[i - 1], path[i]);
      terms.push({
        from: path[i - 1],
        to: path[i],
        w: info.w,
        premium: info.premium,
        via: info.via
      });
    }
    return terms;
  }

  function sumTerms(terms) {
    return terms.reduce(function (s, t) { return s + t.w; }, 0);
  }

  function reconstruct(node) {
    const ids = [];
    const guard = new Set();
    let cur = node;
    while (cur && !guard.has(cur.id)) {
      guard.add(cur.id);
      ids.push(cur.id);
      cur = cur.parent;
    }
    ids.reverse();
    return ids;
  }

  function freezeFrontier(list, model, goal) {
    return list.map(function (n) {
      const h = model.manhattan(n.id, goal);
      return { id: n.id, g: n.g, h: h, f: n.g + h };
    });
  }

  function token(cls, text) {
    return { cls: cls, text: text };
  }

  function heroFor(algo, lab, g, h, hLine, depth, terms, sum, kind) {
    if (kind === 'goal') {
      const tokens = [];
      terms.forEach(function (t, i) {
        if (i) tokens.push(token('op', ' + '));
        tokens.push(token(t.premium ? 'h' : 'g', String(t.w)));
      });
      if (!terms.length) tokens.push(token('g', '0'));
      tokens.push(token('op', ' = '));
      tokens.push(token('s', String(sum)));
      let sub = 'Esa suma es el costo del camino que quedó.';
      if (algo === 'bfs') sub = 'BFS encontró el camino con menos saltos (' + depth + '). Esta suma es el costo de ese camino, no una prueba de que sea el más barato.';
      if (algo === 'dfs') sub = 'DFS se detuvo en el primer camino que alcanzó al profundizar. No comparó esta suma con otras rutas.';
      if (algo === 'ucs') sub = 'Costo uniforme elige siempre el menor g, y las vías cuestan más de cero. Esta suma es el menor costo.';
      if (algo === 'astar') sub = 'Con esta heurística, A* debe coincidir con el costo uniforme. h(meta) = 0, así que f(meta) = g(meta) = ' + sum + '.';
      return {
        tokens: tokens,
        caption: 'Costo = suma de las vías del camino',
        sub: sub
      };
    }
    if (algo === 'astar') {
      return {
        tokens: [
          token('s', 'f(' + lab + ')'),
          token('op', ' = '),
          token('g', String(g)),
          token('op', ' + '),
          token('h', String(h)),
          token('op', ' = '),
          token('s', String(g + h))
        ],
        caption: 'f = g + h. Sale este nodo porque su f es el menor de la frontera.',
        sub: 'g es lo ya caminado. h = ' + hLine + '. h estima saltos, no pesos.'
      };
    }
    if (algo === 'ucs') {
      return {
        tokens: [
          token('g', 'g(' + lab + ')'),
          token('op', ' = '),
          token('s', String(g))
        ],
        caption: 'Sale este nodo porque su g es el menor de la frontera.',
        sub: 'h sería ' + h + ' (' + hLine + '), pero costo uniforme no lo usa para ordenar.'
      };
    }
    if (algo === 'dfs') {
      return {
        tokens: [
          token('s', 'tope'),
          token('op', ' → '),
          token('g', lab),
          token('op', ' · '),
          token('s', depth + ' saltos')
        ],
        caption: 'DFS saca el tope de la pila. No elige por costo ni por cercanía.',
        sub: 'El costo acumulado de esta rama es ' + g + '. Puede existir otra rama más barata o más corta.'
      };
    }
    return {
      tokens: [
        token('s', depth + ' saltos'),
        token('op', ' hasta '),
        token('g', lab)
      ],
      caption: 'BFS saca el nodo más antiguo de la cola: el de menor profundidad.',
      sub: 'El costo acumulado es ' + g + ', pero no participa en la decisión. h = ' + h + ' es solo un piso de saltos.'
    };
  }

  function describeSetup(cfg) {
    const spec = normalize(cfg);
    const model = createModel(spec);
    const from = model.label(spec.start);
    const to = model.label(spec.goal);
    const hInfo = model.hText(spec.start, spec.goal);
    const blocks = model.blockedList().map(model.label);
    const via = 3 * spec.traffic;
    const paragraphs = [
      'Inicio ' + from + '. Meta ' + to + '.',
      'Manhattan: ' + hInfo.text + '. Si cada vía costara 1 y no hubiera muros, harían falta al menos ' + hInfo.h + ' saltos.',
      'La fila 2 y la columna D cuestan ' + via + '. El resto de las vías cuesta 1.',
      blocks.length ? 'Obstáculos: ' + blocks.join(', ') + '.' : 'No hay obstáculos: la cuadrícula está completa.'
    ];
    if (spec.algo === 'astar') {
      paragraphs.push('A* ordena con f = g + h. Ahora g(' + from + ') = 0, así que f = h = ' + hInfo.h + '. Ese número es una prioridad, no el precio del viaje.');
    } else if (spec.algo === 'ucs') {
      paragraphs.push('Costo uniforme ordena por g. g(' + from + ') = 0. Manhattan (' + hInfo.h + ') se puede mirar, pero no decide quién sale.');
    } else if (spec.algo === 'dfs') {
      paragraphs.push('DFS usa una pila. No consulta ni el costo ni Manhattan. h = ' + hInfo.h + ' queda como referencia.');
    } else {
      paragraphs.push('BFS usa una cola y busca menos saltos, no menor costo. h = ' + hInfo.h + ' es el mínimo sin muros; un obstáculo puede obligar a más saltos.');
    }
    const hero = spec.algo === 'astar'
      ? {
        tokens: [token('s', 'f(' + from + ')'), token('op', ' = '), token('g', '0'), token('op', ' + '), token('h', String(hInfo.h)), token('op', ' = '), token('s', String(hInfo.h))],
        caption: 'Prioridad inicial. Todavía no es el costo de una ruta.',
        sub: hInfo.text
      }
      : spec.algo === 'ucs'
        ? {
          tokens: [token('g', 'g(' + from + ')'), token('op', ' = '), token('s', '0')],
          caption: 'Todavía no se ha pagado ninguna vía.',
          sub: 'La heurística, que este algoritmo no usa, diría ' + hInfo.text + '.'
        }
        : {
          tokens: [token('s', 'h = ' + hInfo.h), token('op', ' saltos de piso')],
          caption: 'Estimación antes de buscar. No es el resultado.',
          sub: hInfo.text
        };
    return {
      kind: 'setup',
      algo: spec.algo,
      mark: 'init',
      title: 'Antes de buscar',
      status: 'Listo para explorar',
      paragraphs: paragraphs,
      hero: hero,
      contest: [],
      decisions: [],
      terms: [],
      sum: 0,
      frontier: [{ id: spec.start, g: 0, h: hInfo.h, f: hInfo.h }],
      visited: [],
      path: null,
      hot: [],
      current: null,
      nextId: spec.start,
      g: 0,
      h: hInfo.h,
      f: hInfo.h,
      depth: 0
    };
  }

  function runSearch(cfg) {
    const spec = normalize(cfg);
    const algo = spec.algo;
    const known = { bfs: 1, dfs: 1, ucs: 1, astar: 1 };
    if (!known[algo]) throw new Error('Algoritmo desconocido: ' + algo);
    const model = createModel(spec);
    const start = spec.start;
    const goal = spec.goal;
    const total = spec.rows * spec.cols;
    if (!model.inBounds(start) || !model.inBounds(goal)) {
      throw new Error('Inicio o meta fuera del mapa');
    }

    const frames = [];
    const visited = new Set();
    const seen = new Set([start]);
    let frontier = [{ id: start, g: 0, parent: null }];
    const order = [];

    function pathBundle(node) {
      const path = reconstruct(node);
      const terms = termsOf(path, model);
      return { path: path, terms: terms, sum: sumTerms(terms), depth: path.length - 1 };
    }

    frames.push({
      kind: 'init',
      algo: algo,
      mark: 'init',
      title: 'Preparo la ' + structureName(algo),
      status: 'Pongo ' + model.label(start) + ' en la ' + structureName(algo),
      paragraphs: [
        'Meto solo el inicio, ' + model.label(start) + ', con g = 0.',
        'g = 0 porque todavía no recorrí ninguna vía. La meta es ' + model.label(goal) + '.',
        model.hText(start, goal).text + '. Ese h es un piso de saltos, no el costo que vamos a sumar.'
      ],
      hero: {
        tokens: algo === 'astar'
          ? [token('s', 'f(' + model.label(start) + ')'), token('op', ' = '), token('g', '0'), token('op', ' + '), token('h', String(model.manhattan(start, goal))), token('op', ' = '), token('s', String(model.manhattan(start, goal)))]
          : algo === 'ucs'
            ? [token('g', 'g(' + model.label(start) + ')'), token('op', ' = '), token('s', '0')]
            : [token('g', 'g(' + model.label(start) + ')'), token('op', ' = '), token('s', '0')],
        caption: 'Arranque. g = 0: todavía no se recorre ninguna vía.',
        sub: model.hText(start, goal).text
      },
      contest: [],
      decisions: [],
      terms: [],
      sum: 0,
      frontier: freezeFrontier(frontier, model, goal),
      visited: [],
      path: [start],
      hot: [],
      current: start,
      nextId: start,
      g: 0,
      h: model.manhattan(start, goal),
      f: model.manhattan(start, goal),
      depth: 0
    });

    let safety = 0;
    let done = null;

    function consider(cur, n, depth) {
      const labCur = model.label(cur.id);
      const lab = model.label(n);
      if (visited.has(n)) {
        return {
          id: n,
          action: 'visitado',
          detail: lab + ' ya se expandió. Con vías de costo positivo no vuelvo a abrirlo.'
        };
      }
      const info = model.wInfo(cur.id, n);
      const g = cur.g + info.w;
      const h = model.manhattan(n, goal);
      const f = g + h;
      const hCur = model.manhattan(cur.id, goal);
      const consistent = hCur <= info.w + h;
      const base = {
        id: n,
        w: info.w,
        wText: info.text,
        g: g,
        h: h,
        f: f,
        depth: depth + 1,
        consistency: algo === 'astar'
          ? 'h(' + labCur + ') = ' + hCur + ' ≤ w + h(' + lab + ') = ' + info.w + ' + ' + h + ' = ' + (info.w + h) + (consistent ? '. Sí: este paso es consistente.' : '. No: esta heurística se pasó en este paso.')
          : null
      };
      if (algo === 'ucs' || algo === 'astar') {
        const idx = frontier.findIndex(function (q) { return q.id === n; });
        if (idx < 0 || g < frontier[idx].g) {
          const previousG = idx >= 0 ? frontier[idx].g : null;
          if (idx >= 0) frontier.splice(idx, 1);
          frontier.push({ id: n, g: g, parent: cur });
          const action = previousG === null ? 'entra' : 'mejora';
          let detail;
          if (action === 'entra' && algo === 'astar') {
            detail = 'g(' + lab + ') = g(' + labCur + ') + w = ' + cur.g + ' + ' + info.w + ' = ' + g + '. h = ' + h + '. f = ' + g + ' + ' + h + ' = ' + f + '. No estaba: entra.';
          } else if (action === 'entra') {
            detail = 'g(' + lab + ') = ' + cur.g + ' + ' + info.w + ' = ' + g + '. ' + info.text + '. No estaba en la frontera: entra.';
          } else if (algo === 'astar') {
            detail = 'A* reemplaza por g, no por f. g nuevo = ' + g + ' y el guardado era ' + previousG + '. ' + g + ' es menor, así que sustituyo esa entrada. f queda en ' + f + '.';
          } else {
            detail = 'g nuevo = ' + g + ' y el guardado era ' + previousG + '. Mejora, así que sustituyo esa entrada.';
          }
          return Object.assign(base, { action: action, previousG: previousG, detail: detail });
        }
        const previousG = frontier[idx].g;
        const detail = algo === 'astar'
          ? 'A* reemplaza solo si g mejora. g si entrara = ' + g + ' y el guardado es ' + previousG + '. No entra. f (' + f + ') no desempata esta decisión.'
          : 'g si entrara = ' + g + ' y el guardado es ' + previousG + '. Igual o peor: me quedo con el primero.';
        return Object.assign(base, { action: 'peor', previousG: previousG, detail: detail });
      }
      if (!seen.has(n)) {
        seen.add(n);
        frontier.push({ id: n, g: g, parent: cur });
        const detail = algo === 'dfs'
          ? 'Primera vez que veo ' + lab + '. Lo apilo. w = ' + info.text + '. El costo de esta rama quedaría en ' + g + ', pero la pila no compara ese número.'
          : 'Primera vez que veo ' + lab + '. Entra al final de la cola, profundidad ' + (depth + 1) + '. w = ' + info.text + '. Costo acumulado ' + g + ', que la cola no consulta.';
        return Object.assign(base, { action: 'entra', detail: detail });
      }
      return Object.assign(base, {
        action: 'visto',
        detail: lab + ' ya está visto. ' + (algo === 'dfs' ? 'DFS' : 'BFS') + ' no lo mete otra vez. Si entrara, el costo de esa rama sería ' + g + '.'
      });
    }

    while (frontier.length && safety++ < 500) {
      if (algo === 'ucs' || algo === 'astar') {
        frontier.sort(function (a, b) {
          const pa = algo === 'astar' ? a.g + model.manhattan(a.id, goal) : a.g;
          const pb = algo === 'astar' ? b.g + model.manhattan(b.id, goal) : b.g;
          if (pa !== pb) return pa - pb;
          if (a.g !== b.g) return a.g - b.g;
          return a.id - b.id;
        });
      }
      const contest = freezeFrontier(frontier, model, goal).map(function (item, index, arr) {
        const picked = algo === 'dfs' ? index === arr.length - 1 : index === 0;
        return Object.assign({}, item, { picked: picked });
      });
      const cur = algo === 'dfs' ? frontier.pop() : frontier.shift();
      if (visited.has(cur.id)) {
        const bundle = pathBundle(cur);
        frames.push({
          kind: 'skip',
          algo: algo,
          mark: 'skip',
          title: 'Ignoro ' + model.label(cur.id),
          status: 'Ignoro un duplicado de ' + model.label(cur.id),
          paragraphs: [
            model.label(cur.id) + ' salió otra vez, con g = ' + cur.g + '.',
            'Ya estaba expandido. Descarto esta copia y no miro a sus vecinos.'
          ],
          hero: heroFor(algo, model.label(cur.id), cur.g, model.manhattan(cur.id, goal), model.hText(cur.id, goal).text, bundle.depth, bundle.terms, bundle.sum, 'expand'),
          contest: contest,
          decisions: [],
          terms: bundle.terms,
          sum: bundle.sum,
          frontier: freezeFrontier(frontier, model, goal),
          visited: Array.from(visited),
          path: bundle.path,
          hot: [],
          current: cur.id,
          nextId: null,
          g: cur.g,
          h: model.manhattan(cur.id, goal),
          f: cur.g + model.manhattan(cur.id, goal),
          depth: bundle.depth
        });
        continue;
      }

      visited.add(cur.id);
      order.push(cur.id);
      const bundle = pathBundle(cur);
      const lab = model.label(cur.id);
      const h = model.manhattan(cur.id, goal);
      const hLine = model.hText(cur.id, goal).text;

      if (cur.id === goal) {
        const h0 = model.manhattan(start, goal);
        const sample = 'En el inicio, h(' + model.label(start) + ') = ' + h0 + ' y el costo encontrado es ' + bundle.sum + '. ' +
          (h0 <= bundle.sum
            ? h0 + ' ≤ ' + bundle.sum + '. En este caso la estimación no superó el costo.'
            : 'La estimación superó el costo: h no sería admisible aquí.');
        frames.push({
          kind: 'goal',
          algo: algo,
          mark: 'goal',
          title: 'Llegué a ' + lab,
          status: 'Meta alcanzada · costo ' + bundle.sum,
          paragraphs: [
            'Saco ' + lab + ' y es la meta. Me detengo antes de generar vecinos.',
            'Camino de ' + bundle.depth + ' saltos. La suma de las vías es ' + bundle.sum + ' y coincide con g(' + lab + ') = ' + cur.g + '.',
            sample + ' Esto ilustra el inicio; no revisa todos los nodos. h es Manhattan y cada vía cuesta al menos 1, así que no cuenta de más: cualquier camino real necesita al menos esos saltos, y un muro solo puede alargar el viaje.'
          ],
          hero: heroFor(algo, lab, cur.g, h, hLine, bundle.depth, bundle.terms, bundle.sum, 'goal'),
          contest: contest,
          decisions: [],
          terms: bundle.terms,
          sum: bundle.sum,
          frontier: freezeFrontier(frontier, model, goal),
          visited: Array.from(visited),
          path: bundle.path,
          hot: [],
          current: cur.id,
          nextId: null,
          g: cur.g,
          h: h,
          f: cur.g + h,
          depth: bundle.depth
        });
        done = { path: bundle.path, sum: bundle.sum, depth: bundle.depth };
        break;
      }

      const adjacent = model.adjacent(cur.id);
      const open = adjacent.filter(function (id) { return !model.isBlocked(id); });
      const process = algo === 'dfs' ? open.slice().reverse() : open.slice();
      const byId = new Map();
      let stackTop = null;
      process.forEach(function (n) {
        const decision = consider(cur, n, bundle.depth);
        if (algo === 'dfs' && decision.action === 'entra') stackTop = n;
        byId.set(n, decision);
      });
      const decisions = adjacent.map(function (id) {
        if (model.isBlocked(id)) {
          return {
            id: id,
            action: 'bloqueado',
            detail: model.label(id) + ' está bloqueado. No es un estado al que se pueda pasar.'
          };
        }
        const decision = byId.get(id);
        if (id === stackTop) decision.stackTop = true;
        return decision;
      });

      const frozenAfter = freezeFrontier(frontier, model, goal);
      let nextId = null;
      if (frozenAfter.length) {
        if (algo === 'dfs') nextId = frozenAfter[frozenAfter.length - 1].id;
        else if (algo === 'bfs') nextId = frozenAfter[0].id;
        else {
          const ranked = frozenAfter.slice().sort(function (a, b) {
            const pa = algo === 'astar' ? a.f : a.g;
            const pb = algo === 'astar' ? b.f : b.g;
            if (pa !== pb) return pa - pb;
            if (a.g !== b.g) return a.g - b.g;
            return a.id - b.id;
          });
          nextId = ranked[0].id;
        }
      }

      const entered = decisions.filter(function (d) { return d.action === 'entra' || d.action === 'mejora'; }).length;
      frames.push({
        kind: 'expand',
        algo: algo,
        mark: 'neighbors',
        title: 'Saco ' + lab,
        status: 'Expandiendo ' + lab,
        paragraphs: [
          'Saco ' + lab + ' de la ' + structureName(algo) + '.',
          algo === 'astar'
            ? 'Lo elijo por f = ' + (cur.g + h) + ', el menor de los candidatos.'
            : algo === 'ucs'
              ? 'Lo elijo por g = ' + cur.g + ', el menor costo parcial.'
              : algo === 'dfs'
                ? 'Estaba en el tope. Profundidad ' + bundle.depth + '.'
                : 'Estaba al frente de la cola. Profundidad ' + bundle.depth + '.',
          'Reviso ' + adjacent.length + ' vecinos en este orden: derecha, abajo, izquierda, arriba. ' +
            entered + ' entran o mejoran su lugar. ' +
            (nextId === null ? 'La frontera queda vacía.' : 'El siguiente en salir sería ' + model.label(nextId) + '.')
        ],
        hero: heroFor(algo, lab, cur.g, h, hLine, bundle.depth, bundle.terms, bundle.sum, 'expand'),
        contest: contest,
        decisions: decisions,
        terms: bundle.terms,
        sum: bundle.sum,
        frontier: frozenAfter,
        visited: Array.from(visited),
        path: bundle.path,
        hot: decisions.filter(function (d) { return d.action !== 'bloqueado'; }).map(function (d) { return [cur.id, d.id]; }),
        current: cur.id,
        nextId: nextId,
        g: cur.g,
        h: h,
        f: cur.g + h,
        depth: bundle.depth
      });
    }

    if (!done) {
      frames.push({
        kind: 'fail',
        algo: algo,
        mark: 'fail',
        title: 'La frontera se vació',
        status: 'No hay ruta',
        paragraphs: [
          'No quedan nodos por sacar y ' + model.label(goal) + ' nunca se expandió.',
          'Todo lo alcanzable desde ' + model.label(start) + ' ya se revisó. Con estos obstáculos el inicio y la meta quedaron en componentes distintos.',
          'Visitados: ' + (order.map(model.label).join(', ') || 'ninguno') + '.'
        ],
        hero: {
          tokens: [token('s', 'sin ruta')],
          caption: 'No hay suma que hacer: ningún camino une los dos puntos.',
          sub: 'Quita un obstáculo que esté cortando la cuadrícula, o mueve la meta.'
        },
        contest: [],
        decisions: [],
        terms: [],
        sum: null,
        frontier: [],
        visited: Array.from(visited),
        path: null,
        hot: [],
        current: null,
        nextId: null,
        g: null,
        h: null,
        f: null,
        depth: null
      });
    }

    return {
      frames: frames,
      result: {
        algo: algo,
        path: done ? done.path : null,
        explored: visited.size,
        cost: done ? done.sum : null,
        hops: done ? done.depth : null,
        traffic: spec.traffic,
        start: start,
        goal: goal,
        blocked: model.blockedList(),
        order: order
      }
    };
  }

  const api = { createModel: createModel, runSearch: runSearch, describeSetup: describeSetup };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Motor = api;
})(typeof window !== 'undefined' ? window : globalThis);
