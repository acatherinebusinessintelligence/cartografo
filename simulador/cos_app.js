/*
 * Vista de «La rutina para cada piel». El núcleo está en cosmetica.js; aquí se
 * muestra el perfil, el estante, la rutina y cómo llegó la búsqueda a ella.
 */
(function () {
  'use strict';

  var C = window.Cosmetica;
  var NOMBRE = { bfs: 'BFS', dfs: 'DFS', ucs: 'Costo uniforme', astar: 'A*' };
  var ALGOS = ['bfs', 'dfs', 'ucs', 'astar'];
  var CAT = { limpiador: 'Limpiadores', tratamiento: 'Tratamientos', hidratante: 'Hidratantes', protector: 'Protectores' };
  var COLOR = { limpiador: '#38bdf8', tratamiento: '#a78bfa', hidratante: '#34d399', protector: '#fbbf24' };
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function plata(x) { return '$' + (x * 1000).toLocaleString('es-CO'); }

  var S = null;
  var timer = null;

  function abrir(def) {
    S = { def: def, perfil: JSON.parse(JSON.stringify(def.personas[0].perfil)), persona: def.personas[0].id, algo: def.sugerido || 'astar', agotados: [] };
    $('cEyebrow').textContent = 'Reto ' + def.reto + ' · ' + def.lugar;
    $('cTitulo').textContent = def.titulo;
    var chips = $('cChips');
    chips.textContent = '';
    chips.appendChild(el('span', 'chip', def.concepto));
    chips.appendChild(el('span', 'chip suave', def.dificultad));
    pintarMision();
    prepararTienda();
    calcular();
    abrirTab('mision');
    subtitulo('Elige a una persona. El asesor arma la rutina en su cabeza; pulsa «Armar la rutina» para verlo recorrer la tienda.');
  }

  function parar() { if (timer) clearTimeout(timer); timer = null; if (timerArbol) clearTimeout(timerArbol); timerArbol = null; }

  function calcular() {
    parar();
    S.M = C.modelo(S.def, S.perfil, S.agotados);
    S.R = {};
    ALGOS.forEach(function (a) { S.R[a] = C.resolver(S.M, a); });
    S.todo = C.explorarTodo(S.M);
    if (T) { T.paseo = null; $('cArmar').textContent = 'Armar la rutina'; }
    pintar();
    pintarArbol(false);
  }

  function pintar() {
    pintarPersonas();
    pintarPerfil();
    pintarEstante();
    pintarRutina();
    pintarKpis();
    pintarPizarra(false);
    var tab = document.querySelector('.ctab:not([hidden])');
    if (tab && tab.dataset.panel === 'como') pintarComo();
    if (tab && tab.dataset.panel === 'comparar') pintarComparar();
    Array.prototype.forEach.call(document.querySelectorAll('#cAlgos button'), function (b) {
      b.classList.toggle('on', b.dataset.algo === S.algo);
    });
  }

  // ---------- persona y perfil ----------

  function pintarPersonas() {
    var box = $('cPersonas');
    box.textContent = '';
    S.def.personas.forEach(function (p) {
      var b = el('button', 'persona' + (S.persona === p.id ? ' on' : ''));
      b.type = 'button';
      b.appendChild(el('b', null, p.nombre));
      b.appendChild(el('span', null, p.texto));
      b.addEventListener('click', function () {
        S.persona = p.id;
        S.perfil = JSON.parse(JSON.stringify(p.perfil));
        S.agotados = [];
        calcular();
      });
      box.appendChild(b);
    });
  }

  function cambiarPerfil(f) {
    f();
    S.persona = null;
    calcular();
  }

  function pintarPerfil() {
    var d = S.def;
    var box = $('cPerfil');
    box.textContent = '';
    var fila1 = el('div', 'perfil-fila');
    fila1.appendChild(el('span', 'perfil-et', 'Tipo de piel'));
    var seg = el('div', 'mini-seg ancho');
    Object.keys(d.tipos_piel).forEach(function (k) {
      var b = el('button', S.perfil.tipo === k ? 'on' : null, d.tipos_piel[k]);
      b.type = 'button';
      b.addEventListener('click', function () { cambiarPerfil(function () { S.perfil.tipo = k; }); });
      seg.appendChild(b);
    });
    fila1.appendChild(seg);
    [['sensible', 'Piel sensible'], ['embarazo', 'Embarazo']].forEach(function (par) {
      var t = el('button', 'switch');
      t.type = 'button';
      t.setAttribute('role', 'switch');
      t.setAttribute('aria-checked', String(!!S.perfil[par[0]]));
      t.appendChild(el('i'));
      t.appendChild(el('span', null, par[1]));
      t.addEventListener('click', function () { cambiarPerfil(function () { S.perfil[par[0]] = !S.perfil[par[0]]; }); });
      fila1.appendChild(t);
    });
    box.appendChild(fila1);

    var fila2 = el('div', 'perfil-fila');
    fila2.appendChild(el('span', 'perfil-et', 'Le preocupa'));
    Object.keys(d.preocupaciones).forEach(function (k) {
      var on = S.perfil.preocupaciones.indexOf(k) >= 0;
      var b = el('button', 'preo' + (on ? ' on' : ''), d.preocupaciones[k]);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(on));
      b.addEventListener('click', function () {
        cambiarPerfil(function () {
          var i = S.perfil.preocupaciones.indexOf(k);
          if (i >= 0) S.perfil.preocupaciones.splice(i, 1); else S.perfil.preocupaciones.push(k);
        });
      });
      fila2.appendChild(b);
    });
    box.appendChild(fila2);

    var fila3 = el('div', 'perfil-fila');
    fila3.appendChild(el('span', 'perfil-et', 'Presupuesto'));
    var r = el('input');
    r.type = 'range';
    r.min = '100';
    r.max = '320';
    r.step = '10';
    r.value = String(S.perfil.presupuesto);
    r.setAttribute('aria-label', 'Presupuesto en miles de pesos');
    var v = el('b', 'presu', plata(S.perfil.presupuesto));
    r.addEventListener('input', function () { v.textContent = plata(Number(r.value)); });
    r.addEventListener('change', function () { cambiarPerfil(function () { S.perfil.presupuesto = Number(r.value); }); });
    fila3.appendChild(r);
    fila3.appendChild(v);
    fila3.appendChild(el('small', 'tol', 'Tolerancia a la irritación: ' + S.M.tolerancia + ' puntos'));
    box.appendChild(fila3);
  }

  // ---------- estante ----------

  function pintarEstante() {
    var box = $('cEstante');
    box.textContent = '';
    var r = S.R[S.algo];
    var elegidos = r.encontrado ? r.rutina.elegidos.map(function (e) { return e.id; }) : [];
    Object.keys(CAT).forEach(function (cat) {
      var col = el('div', 'estante-col');
      col.appendChild(el('h4', null, CAT[cat]));
      S.M.productos.filter(function (p) { return p.categoria === cat; }).forEach(function (p) {
        var motivo = C.motivoPerfil(S.M, p);
        var card = el('button', 'producto' + (elegidos.indexOf(p.id) >= 0 ? ' elegido' : '') + (motivo ? ' fuera' : '') + (S.agotados.indexOf(p.id) >= 0 ? ' agotado' : ''));
        card.type = 'button';
        card.style.setProperty('--c', COLOR[cat]);
        card.title = (S.agotados.indexOf(p.id) >= 0 ? 'Clic: volver a tener en estante' : 'Clic: marcar como agotado') + (motivo ? ' · ' + motivo : '');
        card.appendChild(el('i', 'frasco'));
        var txt = el('span', 'p-txt');
        txt.appendChild(el('b', null, p.nombre));
        txt.appendChild(el('small', null, plata(p.precio) + ' · irritación ' + p.irrita + (p.cubre.length ? ' · ' + p.cubre.map(function (k) { return S.def.preocupaciones[k].toLowerCase(); }).join(', ') : '')));
        if (motivo) txt.appendChild(el('em', null, motivo));
        card.appendChild(txt);
        card.addEventListener('click', function () {
          var i = S.agotados.indexOf(p.id);
          if (i >= 0) S.agotados.splice(i, 1); else S.agotados.push(p.id);
          calcular();
        });
        col.appendChild(card);
      });
      box.appendChild(col);
    });
  }

  // ---------- la rutina ----------

  function pintarRutina() {
    var box = $('cRutina');
    box.textContent = '';
    var r = S.R[S.algo];
    if (!r.encontrado) {
      box.appendChild(el('p', 'eyebrow', NOMBRE[S.algo]));
      box.appendChild(el('h3', null, 'No hay ninguna rutina que cumpla todo.'));
      box.appendChild(el('p', 'por-que', 'Prueba con más presupuesto, menos preocupaciones o vuelve a poner en el estante lo agotado. La búsqueda revisó ' + r.expandidos + ' rutinas a medio armar y todas se quedaron sin salida.'));
      return;
    }
    box.appendChild(el('p', 'eyebrow', 'La rutina que encontró ' + NOMBRE[S.algo]));
    var cols = el('div', 'rutina-cols');
    ['am', 'pm'].forEach(function (mo) {
      var c = el('div', 'rutina-col');
      c.appendChild(el('h4', null, mo === 'am' ? 'Mañana' : 'Noche'));
      var ol = el('ol');
      r.rutina.elegidos.forEach(function (e) {
        var paso = S.M.pasos[e.paso];
        if (paso.momento !== 'ambos' && paso.momento !== mo) return;
        var p = S.M.porId[e.id];
        var li = el('li');
        li.style.setProperty('--c', COLOR[p.categoria]);
        li.appendChild(el('small', null, paso.nombre));
        li.appendChild(el('span', null, p.nombre));
        ol.appendChild(li);
      });
      c.appendChild(ol);
      cols.appendChild(c);
    });
    box.appendChild(cols);
    var pie = el('div', 'rutina-pie');
    pie.appendChild(el('strong', null, plata(r.costo)));
    pie.appendChild(el('span', null, r.productos + ' productos · irritación ' + r.rutina.irrita + ' de ' + S.M.tolerancia));
    box.appendChild(pie);
    var cub = el('div', 'cubre');
    S.perfil.preocupaciones.forEach(function (k) {
      var quien = r.rutina.elegidos.filter(function (e) { return S.M.porId[e.id].cubre.indexOf(k) >= 0; }).map(function (e) { return S.M.porId[e.id].nombre; });
      cub.appendChild(el('span', null, '✓ ' + S.def.preocupaciones[k] + (quien.length ? ' — ' + quien[0] : '')));
    });
    box.appendChild(cub);
  }

  function pintarKpis() {
    var r = S.R[S.algo];
    $('ckCosto').textContent = r.encontrado ? plata(r.costo) : 'sin rutina';
    $('ckProd').textContent = r.encontrado ? String(r.productos) : '—';
    $('ckExp').textContent = String(r.expandidos);
    $('ckPosibles').textContent = String(S.todo.rutinas.length);
    $('ckMs').textContent = r.tiempo < 1 ? '<1 ms' : Math.round(r.tiempo) + ' ms';
  }

  // ---------- la búsqueda, paso a paso ----------

  function nombreParcial(elegidos) {
    if (!elegidos.length) return 'Rutina vacía';
    return elegidos.map(function (e) { return S.M.porId[e.id].nombre; }).join(' + ');
  }

  function pintarPizarra(animar) {
    parar();
    var r = S.R[S.algo];
    var box = $('cPizarra');
    box.textContent = '';
    var usaH = S.algo === 'astar';
    $('cPizTxt').textContent = NOMBRE[S.algo] + ' abrió ' + r.expandidos + ' rutinas a medio armar antes de dar con la que cumple todo. ' +
      (S.algo === 'bfs' ? 'Abre por capas: primero todas las rutinas de 1 producto, luego de 2… Por eso encuentra la de menos productos.' :
        S.algo === 'dfs' ? 'Sigue agregando productos a la primera rutina que se le ocurre y solo retrocede cuando se atasca.' :
          S.algo === 'ucs' ? 'Siempre abre la rutina más barata hasta ahora (g). Por eso la primera completa que saca es la más barata.' :
            'Abre la rutina con menor f = g + h: lo que ya cuesta más lo mínimo que falta en los pasos obligatorios.') +
      ' Estos son los primeros, en orden:';
    var lista = r.orden.slice(0, 24);
    var i = 0;
    function uno() {
      if (i >= lista.length) {
        if (r.encontrado) {
          var fin = el('li', 'meta');
          fin.appendChild(el('span', 'piz-n', '✓'));
          fin.appendChild(el('span', 'piz-r', nombreParcial(r.rutina.elegidos)));
          fin.appendChild(el('code', null, 'g = ' + r.costo));
          box.appendChild(fin);
        }
        return;
      }
      var o = lista[i];
      var li = el('li');
      li.appendChild(el('span', 'piz-n', String(i + 1)));
      li.appendChild(el('span', 'piz-r', nombreParcial(o.elegidos)));
      li.appendChild(el('code', null, usaH ? 'g ' + o.g + ' + h ' + o.h + ' = ' + (o.g + o.h) : 'g = ' + o.g));
      box.appendChild(li);
      i += 1;
      if (animar && !reducido) timer = setTimeout(uno, 260);
      else uno();
    }
    uno();
  }

  // ---------- la tienda: el asesor recorre los estantes ----------

  var T = null;
  var escenaT = null;
  var timerArbol = null;
  var ultimoT = 0;

  function prepararTienda() {
    var d = S.def;
    var tienda = d.tienda;
    var tipos = {
      muro: { nombre: 'Pared', paso: false, forma: { f: 'bloque', alto: 18, color: '#f5c2da', techo: '#fce7f3' } },
      piso: { nombre: 'Pasillo', costo: 1, piso: '#fffafc', patron: 'baldosa' },
      entrada: { nombre: 'Entrada', costo: 1, inicio: true, piso: '#fffafc', forma: { f: 'marca', color: '#f472b6' } },
      pago: { nombre: 'Punto de pago', costo: 1, piso: '#fffafc', forma: { f: 'marca', color: '#22c55e' } },
      caja: { nombre: 'Caja', paso: false, piso: '#fffafc', forma: { f: 'bloque', alto: 20, color: '#831843', techo: '#be185d' } },
      cliente: { nombre: 'La persona que espera', paso: false, piso: '#fffafc', forma: { f: 'persona', color: '#0ea5e9' } }
    };
    var leyenda = { '#': 'muro', '.': 'piso', E: 'entrada', K: 'pago', C: 'caja', Q: 'cliente' };
    var porCat = {};
    d.productos.forEach(function (p) { (porCat[p.categoria] = porCat[p.categoria] || []).push(p); });
    var celdas = [];
    var celdaDe = {};
    var filas = tienda.mapa.length;
    var cols = tienda.mapa[0].length;
    var usados = {};
    for (var r = 0; r < filas; r += 1) {
      for (var c = 0; c < cols; c += 1) {
        var ch = tienda.mapa[r][c];
        var cat = tienda.estantes[ch];
        if (cat) {
          var i = usados[cat] || 0;
          usados[cat] = i + 1;
          var pr = porCat[cat][i];
          var k = 'v_' + pr.id;
          tipos[k] = { nombre: pr.nombre, paso: false, piso: '#fffafc', forma: { f: 'vitrina', id: pr.id, color: COLOR[cat] } };
          celdas.push(k);
          celdaDe[pr.id] = r * cols + c;
        } else celdas.push(leyenda[ch]);
      }
    }
    var def = { id: 'tienda', tipos: tipos, escena: tienda.escena, zonas: tienda.zonas, agente: { dibujo: 'persona', color: '#db2777' } };
    var mundo = { def: def, filas: filas, cols: cols, celdas: celdas, debajo: {}, params: {} };
    var recoger = {};
    Object.keys(celdaDe).forEach(function (id) {
      var cel = celdaDe[id];
      var abajo = cel + cols;
      var arriba = cel - cols;
      recoger[id] = tipos[celdas[abajo]] && tipos[celdas[abajo]].paso !== false ? abajo : arriba;
    });
    T = {
      mundo: mundo, celdaDe: celdaDe, recoger: recoger,
      entrada: celdas.indexOf('entrada'), pago: celdas.indexOf('pago'),
      paseo: null
    };
    escenaT = new Iso.Escena($('cTienda'));
    escenaT.ajustar(mundo, 1);
  }

  function caminoEntre(a, b) {
    var m = T.mundo;
    var cols = m.cols;
    var padre = {};
    padre[a] = -1;
    var cola = [a];
    while (cola.length) {
      var x = cola.shift();
      if (x === b) break;
      [1, cols, -1, -cols].forEach(function (d) {
        var y = x + d;
        if (y < 0 || y >= m.celdas.length) return;
        if (Math.abs((y % cols) - (x % cols)) > 1) return;
        if (padre[y] !== undefined) return;
        if (m.def.tipos[m.celdas[y]].paso === false) return;
        padre[y] = x;
        cola.push(y);
      });
    }
    var out = [];
    for (var n = b; n !== -1 && n !== undefined; n = padre[n]) out.push(n);
    return out.reverse();
  }

  function recorridoDe(r) {
    if (!r.encontrado) return null;
    var paradas = [T.entrada];
    var ids = [];
    r.rutina.elegidos.forEach(function (e) { paradas.push(T.recoger[e.id]); ids.push(e.id); });
    paradas.push(T.pago);
    var camino = [T.entrada];
    var toma = {};
    for (var i = 1; i < paradas.length; i += 1) {
      var tramo = caminoEntre(paradas[i - 1], paradas[i]);
      camino = camino.concat(tramo.slice(1));
      if (i <= ids.length) {
        var idx = camino.length - 1;
        (toma[idx] = toma[idx] || []).push(ids[i - 1]);
      }
    }
    return { camino: camino, toma: toma, ids: ids };
  }

  function armar() {
    var r = S.R[S.algo];
    if (!r.encontrado) { subtitulo('No hay ninguna rutina que cumpla todo: no hay nada que armar.'); return; }
    var rec = recorridoDe(r);
    T.paseo = { camino: rec.camino, toma: rec.toma, i: 0, prog: 0, tomados: [], gasto: 0, irrita: 0, andando: true, fin: false };
    var per = S.def.personas.filter(function (p) { return p.id === S.persona; })[0];
    subtitulo((per ? per.nombre.split(',')[0] + ' espera en la caja. ' : '') + 'El asesor toma una canasta y sale hacia los estantes con la rutina que encontró ' + NOMBRE[S.algo] + '.');
    $('cArmar').textContent = 'Armando…';
  }

  function avanzarPaseo(dt) {
    var P = T.paseo;
    if (!P || !P.andando) return;
    var vel = Number($('cVel').value);
    P.prog += dt / ([0, 420, 300, 200, 130, 70][vel]);
    if (P.prog < 1) return;
    P.prog = 0;
    P.i += 1;
    (P.toma[P.i] || []).forEach(function (id) {
      var pr = S.M.porId[id];
      P.tomados.push(id);
      P.gasto += pr.precio;
      P.irrita += pr.irrita;
      var cubre = pr.cubre.filter(function (k) { return S.perfil.preocupaciones.indexOf(k) >= 0; }).map(function (k) { return S.def.preocupaciones[k].toLowerCase(); });
      subtitulo('Toma ' + pr.nombre + ' (' + plata(pr.precio) + ')' + (cubre.length ? ': cubre ' + cubre.join(' y ') : ': paso obligatorio de la rutina') + '. Quedan ' + plata(S.perfil.presupuesto - P.gasto) + ' del presupuesto.');
    });
    if (P.i >= P.camino.length - 1) {
      P.andando = false;
      P.fin = true;
      $('cArmar').textContent = 'Armar otra vez';
      subtitulo('En la caja: ' + P.tomados.length + ' productos por ' + plata(P.gasto) + ', irritación ' + P.irrita + ' de ' + S.M.tolerancia + '. La rutina cubre todo lo que le preocupa.');
    }
  }

  function dibujarTienda(t) {
    if (!T) return;
    var r = S.R[S.algo];
    var elegidos = r.encontrado ? r.rutina.elegidos.map(function (e) { return e.id; }) : [];
    var P = T.paseo;
    var vitrinas = {};
    var orden = {};
    elegidos.forEach(function (id, i) { orden[id] = i + 1; });
    S.M.productos.forEach(function (p) {
      var est = 'normal';
      if (S.agotados.indexOf(p.id) >= 0) est = 'agotado';
      else if (C.motivoPerfil(S.M, p)) est = 'fuera';
      if (elegidos.indexOf(p.id) >= 0) est = 'elegido';
      if (P && P.tomados.indexOf(p.id) >= 0) est = 'tomado';
      vitrinas[p.id] = est;
    });
    var rec = P ? { camino: P.camino } : recorridoDe(r);
    var cols = T.mundo.cols;
    var pos = P ? P.camino[P.i] : T.entrada;
    var sig = P && P.camino[P.i + 1] !== undefined ? P.camino[P.i + 1] : pos;
    var prog = P && P.andando ? P.prog : 0;
    var ag = {
      r: Math.floor(pos / cols) + (Math.floor(sig / cols) - Math.floor(pos / cols)) * prog,
      c: pos % cols + ((sig % cols) - (pos % cols)) * prog,
      dir: 'e', andando: !!(P && P.andando), saltando: !!(P && P.fin)
    };
    escenaT.dibujar({
      t: t, quieto: reducido,
      ruta: rec ? rec.camino : null, rutaDesde: P ? P.i : 0,
      agente: ag, lleva: P ? P.tomados : [],
      vitrinas: vitrinas, ordenVitrina: P ? null : orden,
      hover: T.hover, hoverOk: true
    });
    pintarHudTienda();
  }

  function pintarHudTienda() {
    var P = T.paseo;
    var hud = $('cHud');
    hud.textContent = '';
    var gasto = P ? P.gasto : 0;
    var irr = P ? P.irrita : 0;
    var r = S.R[S.algo];
    var total = r.encontrado ? r.productos : 0;
    [['Presupuesto', plata(S.perfil.presupuesto - gasto), 100 * (S.perfil.presupuesto - gasto) / S.perfil.presupuesto],
      ['Irritación', irr + ' de ' + S.M.tolerancia, 100 * (1 - irr / Math.max(1, S.M.tolerancia))],
      ['Canasta', (P ? P.tomados.length : 0) + ' de ' + total, null]].forEach(function (x) {
      var w = el('span', 'hud-med');
      w.appendChild(el('small', null, x[0]));
      w.appendChild(el('b', null, x[1]));
      if (x[2] != null) {
        var barra = el('i');
        var fill = el('em');
        fill.style.width = Math.max(0, Math.round(x[2])) + '%';
        if (x[2] < 25) fill.classList.add('bajo');
        barra.appendChild(fill);
        w.appendChild(barra);
      }
      hud.appendChild(w);
    });
  }

  var timerSub = null;
  function subtitulo(texto) {
    var sub = $('cSub');
    sub.hidden = false;
    sub.textContent = '';
    sub.appendChild(el('span', null, texto));
    sub.classList.remove('entra');
    void sub.offsetWidth;
    sub.classList.add('entra');
    clearTimeout(timerSub);
  }

  function bucleTienda(t) {
    var dt = Math.min(64, t - (ultimoT || t));
    ultimoT = t;
    if (S && T && !$('vistaCos').hidden) {
      avanzarPaseo(dt);
      dibujarTienda(t);
    }
    requestAnimationFrame(bucleTienda);
  }

  // ---------- el árbol de la búsqueda ----------

  function pintarArbol(animar) {
    if (timerArbol) clearTimeout(timerArbol);
    timerArbol = null;
    var svg = $('cArbol');
    var NS = 'http://www.w3.org/2000/svg';
    var r = S.R[S.algo];
    var nodos = r.orden;
    var W = 900;
    var H = 300;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.textContent = '';
    function mk(tag, at, padre) {
      var n = document.createElementNS(NS, tag);
      Object.keys(at).forEach(function (k) { n.setAttribute(k, at[k]); });
      (padre || svg).appendChild(n);
      return n;
    }
    var maxD = S.M.pasos.length;
    var porCol = {};
    nodos.forEach(function (n) { var d = n.elegidos.length; porCol[d] = (porCol[d] || 0) + 1; });
    var colX = function (d) { return 60 + d * (W - 120) / maxD; };
    var etiquetas = ['Vacía', '1 producto', '2', '3', '4', '5'];
    for (var d = 0; d <= maxD; d += 1) {
      var tx = mk('text', { x: colX(d), y: H - 6, 'text-anchor': 'middle', class: 'arbol-col' });
      tx.textContent = etiquetas[d] + (porCol[d] ? ' · ' + porCol[d] : '');
    }
    var cuenta = {};
    var pos = {};
    nodos.forEach(function (n) {
      var d2 = n.elegidos.length;
      var i = cuenta[d2] = (cuenta[d2] || 0) + 1;
      var tot = porCol[d2];
      var dy = Math.min(18, (H - 50) / Math.max(1, tot));
      var y0 = (H - 24) / 2 - (tot - 1) * dy / 2;
      pos[n.k] = [colX(d2), y0 + (i - 1) * dy];
    });
    var gLin = mk('g', {});
    var gNod = mk('g', {});
    var camino = {};
    if (r.encontrado) {
      var porK = {};
      nodos.forEach(function (n) { porK[n.k] = n; });
      for (var k = nodos[nodos.length - 1].k; k; k = porK[k] ? porK[k].padre : null) camino[k] = true;
    }
    var i2 = 0;
    var demora = Math.max(25, Math.min(140, 5000 / Math.max(1, nodos.length)));
    function uno() {
      if (i2 >= nodos.length) { resaltar(); return; }
      var n = nodos[i2];
      var p = pos[n.k];
      if (n.padre && pos[n.padre]) mk('line', { x1: pos[n.padre][0], y1: pos[n.padre][1], x2: p[0], y2: p[1], class: 'arbol-l' + (camino[n.k] ? ' camino' : '') }, gLin);
      var meta = r.encontrado && i2 === nodos.length - 1;
      var c = mk('circle', { cx: p[0], cy: p[1], r: meta ? 8 : 5, class: 'arbol-n' + (meta ? ' meta' : '') + (camino[n.k] ? ' camino' : '') }, gNod);
      var tt = document.createElementNS(NS, 'title');
      tt.textContent = (i2 + 1) + '. ' + (n.elegidos.length ? n.elegidos.map(function (e) { return S.M.porId[e.id].nombre; }).join(' + ') : 'Rutina vacía') + ' · g = ' + n.g + (S.algo === 'astar' ? ', h = ' + n.h : '');
      c.appendChild(tt);
      i2 += 1;
      if (animar && !reducido) timerArbol = setTimeout(uno, demora);
      else uno();
    }
    function resaltar() { svg.classList.add('listo'); }
    svg.classList.remove('listo');
    uno();
  }

  // ---------- pestañas ----------

  function pintarMision() {
    var d = S.def;
    $('cHistoria').textContent = d.historia;
    $('cObjetivo').textContent = d.objetivo;
    $('cAviso').textContent = d.aviso + ' ' + (d.propuesta || '');
    var dl = $('cAgente');
    dl.textContent = '';
    [['Se llama', d.agente.nombre], ['Percibe', d.agente.percibe], ['Recuerda', d.agente.recuerda], ['Puede', d.agente.acciones], ['Termina cuando', d.agente.meta]].forEach(function (par) {
      dl.appendChild(el('dt', null, par[0]));
      dl.appendChild(el('dd', null, par[1]));
    });
    var reglas = $('cReglas');
    reglas.textContent = '';
    ['Cada producto sirve solo para ciertos tipos de piel.', 'En embarazo no entra el retinol.', 'La irritación sumada no puede pasar de ' + d.tolerancia.normal + ' puntos (' + d.tolerancia.sensible + ' si la piel es sensible).', 'No se juntan en el mismo momento del día activos que se irritan entre sí:']
      .forEach(function (t) { reglas.appendChild(el('li', null, t)); });
    var sub = el('ul');
    d.incompatibles.forEach(function (r) { sub.appendChild(el('li', null, r.por)); });
    reglas.lastChild.appendChild(sub);
    reglas.appendChild(el('li', null, 'Limpiador, hidratante y protector son obligatorios; los tratamientos, opcionales.'));
    var ol = $('cPreguntas');
    ol.textContent = '';
    d.preguntas.forEach(function (q) { ol.appendChild(el('li', null, q)); });
  }

  function paso(box, n, titulo) {
    var card = el('section', 'como-paso');
    var cab = el('div', 'como-cab');
    cab.appendChild(el('span', 'como-num', String(n)));
    cab.appendChild(el('h4', null, titulo));
    card.appendChild(cab);
    box.appendChild(card);
    return card;
  }

  function pintarComo() {
    var box = $('cComo');
    box.textContent = '';
    var M = S.M;
    var R = S.R;
    var r = R[S.algo];
    var c1 = paso(box, 1, 'El estado: la rutina a medio armar');
    c1.appendChild(el('p', null, 'Aquí no hay mapa. Un estado es la rutina tal como va: en qué paso está y qué productos lleva. De ahí salen el gasto, la irritación acumulada, las preocupaciones ya cubiertas y los activos de mañana y de noche.'));
    c1.appendChild(el('p', 'como-dato', 'Con este perfil, el árbol completo tiene ' + S.todo.nodos + ' rutinas a medio armar, y ' + S.todo.rutinas.length + ' de ellas son rutinas completas que cumplen todo.'));

    var c2 = paso(box, 2, 'Las acciones: agregar el siguiente producto');
    var cands = C.candidatos(M, C.inicial());
    c2.appendChild(el('p', null, 'Desde la rutina vacía, la única acción posible es elegir un limpiador (es obligatorio y va primero). Estas son las opciones y lo que pasó con cada una:'));
    var t = el('table', 'costos como-tabla');
    cands.forEach(function (c) {
      var tr = el('tr', c.valido ? null : 'bloq');
      tr.appendChild(el('td', null, c.producto.nombre));
      tr.appendChild(el('td', 'num', c.valido ? '+' + plata(c.producto.precio) : c.motivo));
      t.appendChild(tr);
    });
    c2.appendChild(t);
    c2.appendChild(el('p', null, 'Después del limpiador puede agregar un tratamiento de mañana, uno de noche o saltar directo al hidratante. Así se ramifica el árbol.'));

    var c3 = paso(box, 3, 'Las reglas podan el árbol');
    c3.appendChild(el('p', null, 'Cada vez que una opción rompe una regla, la búsqueda ni siquiera la considera. Al recorrer el árbol completo, estos fueron los descartes:'));
    var ul = el('ul', 'como-lista');
    Object.keys(S.todo.descartes).sort(function (a, b) { return S.todo.descartes[b] - S.todo.descartes[a]; }).forEach(function (k) {
      ul.appendChild(el('li', null, S.todo.descartes[k] + ' veces: ' + k));
    });
    c3.appendChild(ul);

    var c4 = paso(box, 4, 'El costo y la meta');
    c4.appendChild(el('p', null, 'Cada producto suma su precio. La meta es una rutina con los tres pasos obligatorios y que cubra: ' + S.perfil.preocupaciones.map(function (k) { return S.def.preocupaciones[k].toLowerCase(); }).join(', ') + '. Entre todas las metas posibles, la mejor opción es la más barata.'));

    var c5 = paso(box, 5, 'La pista de A*');
    c5.appendChild(el('p', null, 'A* suma el producto más barato que sirve para cada paso obligatorio que falta. Nunca exagera: esos pasos hay que llenarlos sí o sí, y no se pueden llenar por menos.'));
    c5.appendChild(el('p', 'como-dato', 'Con la rutina vacía, la pista vale h = ' + plata(C.heuristica(M, C.inicial())) + '. La mejor rutina cuesta ' + (R.ucs.encontrado ? plata(R.ucs.costo) : '—') + '.'));

    var c6 = paso(box, 6, 'Lo que encontró cada algoritmo');
    var t6 = el('table', 'costos realidades');
    var cab = el('tr');
    ['', 'Rutinas abiertas', 'Productos', 'Precio'].forEach(function (h) { cab.appendChild(el('th', null, h)); });
    t6.appendChild(cab);
    ALGOS.forEach(function (a) {
      var tr = el('tr', a === S.algo ? 'actual' : null);
      tr.appendChild(el('td', null, NOMBRE[a]));
      tr.appendChild(el('td', 'num', String(R[a].expandidos)));
      tr.appendChild(el('td', 'num', R[a].encontrado ? String(R[a].productos) : '—'));
      tr.appendChild(el('td', 'num', R[a].encontrado ? plata(R[a].costo) : 'ninguna'));
      t6.appendChild(tr);
    });
    c6.appendChild(t6);
    if (R.ucs.encontrado) {
      var ideas = el('ul', 'como-lista');
      ideas.appendChild(el('li', null, R.bfs.costo > R.ucs.costo
        ? 'BFS encuentra una rutina con ' + R.bfs.productos + ' productos, la menor cantidad posible, pero cuesta ' + plata(R.bfs.costo) + '. La más barata cuesta ' + plata(R.ucs.costo) + '.'
        : 'Aquí la rutina con menos productos también es la más barata.'));
      ideas.appendChild(el('li', null, 'A* encuentra la más barata abriendo ' + R.astar.expandidos + ' rutinas; costo uniforme necesita ' + R.ucs.expandidos + '.'));
      ideas.appendChild(el('li', null, 'DFS se queda con la primera que funciona: ' + plata(R.dfs.costo) + '.'));
      c6.appendChild(ideas);
    }

    var c7 = paso(box, 7, 'Cuando algo cambia');
    c7.appendChild(el('p', null, 'Si cambia el perfil o se agota un producto (haz clic en él en el estante), el asesor vuelve a buscar con las reglas nuevas. ' + (r.encontrado ? 'Prueba agotar algo de la rutina actual: aparecerá la siguiente mejor opción.' : '')));
  }

  function pintarComparar() {
    var box = $('cCmp');
    box.textContent = '';
    var R = S.R;
    var t = el('table', 'costos realidades');
    var cab = el('tr');
    ['', 'Rutinas abiertas', 'Productos', 'Precio'].forEach(function (h) { cab.appendChild(el('th', null, h)); });
    t.appendChild(cab);
    ALGOS.forEach(function (a) {
      var tr = el('tr', a === S.algo ? 'actual' : null);
      tr.appendChild(el('td', null, NOMBRE[a]));
      tr.appendChild(el('td', 'num', String(R[a].expandidos)));
      tr.appendChild(el('td', 'num', R[a].encontrado ? String(R[a].productos) : '—'));
      tr.appendChild(el('td', 'num', R[a].encontrado ? plata(R[a].costo) : 'ninguna'));
      t.appendChild(tr);
    });
    box.appendChild(t);
    var top = $('cTop');
    top.textContent = '';
    S.todo.rutinas.slice(0, 6).forEach(function (rut, i) {
      var d = el('div', 'top-rutina' + (i === 0 ? ' mejor' : ''));
      var cab2 = el('div', 'cmp-cab');
      cab2.appendChild(el('b', null, (i + 1) + 'ª opción'));
      cab2.appendChild(el('span', i === 0 ? 'tag-ok' : 'tag-mal', plata(rut.gasto)));
      d.appendChild(cab2);
      d.appendChild(el('p', null, rut.elegidos.map(function (e) { return S.M.porId[e.id].nombre; }).join(' · ')));
      top.appendChild(d);
    });
    if (!S.todo.rutinas.length) top.appendChild(el('p', 'sub', 'Con este perfil no hay ninguna rutina posible.'));
  }

  function abrirTab(nombre) {
    Array.prototype.forEach.call(document.querySelectorAll('#cTabs [role=tab]'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.tab === nombre));
    });
    Array.prototype.forEach.call(document.querySelectorAll('.ctab'), function (p) {
      p.hidden = p.dataset.panel !== nombre;
    });
    if (nombre === 'como') pintarComo();
    if (nombre === 'comparar') pintarComparar();
  }

  // ---------- miniatura del centro de misiones ----------

  function miniatura(cv) {
    var dpr = window.devicePixelRatio || 1;
    var W = 420;
    var H = 290;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.aspectRatio = W + ' / ' + H;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(40, 196, 340, 12);
    var frascos = [['#38bdf8', 70, 70], ['#a78bfa', 140, 95], ['#a78bfa', 200, 60], ['#34d399', 260, 85], ['#fbbf24', 320, 75]];
    frascos.forEach(function (f) {
      var x = f[1];
      var h = f[2];
      ctx.fillStyle = f[0];
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, 196 - h, 44, h, 10); else ctx.rect(x, 196 - h, 44, h);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(x + 8, 196 - h + 14, 8, h - 28);
      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 12, 196 - h - 16, 20, 16);
    });
    ctx.fillStyle = '#831843';
    ctx.font = '600 15px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('limpiador → tratamiento → hidratante → protector', 210, 240);
  }

  function enlazar() {
    $('cVolver').addEventListener('click', function () { parar(); location.hash = ''; });
    $('cVer').addEventListener('click', function () { pintarPizarra(true); pintarArbol(true); $('cArbolCard').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    $('cArmar').addEventListener('click', armar);
    var lienzo = $('cTienda');
    lienzo.addEventListener('mousemove', function (ev) {
      if (!T) return;
      var id = escenaT.celdaEn(ev.clientX, ev.clientY);
      T.hover = id;
      var tip = $('cTip');
      var k = id >= 0 ? T.mundo.celdas[id] : null;
      if (!k || k.indexOf('v_') !== 0) { tip.hidden = true; lienzo.style.cursor = 'default'; return; }
      var pr = S.M.porId[k.slice(2)];
      var motivo = C.motivoPerfil(S.M, pr);
      tip.textContent = '';
      tip.appendChild(el('span', null, pr.nombre + ' · ' + plata(pr.precio) + ' · irritación ' + pr.irrita));
      tip.appendChild(el('em', motivo ? 'no' : null, motivo ? motivo : 'Clic: marcar como agotado'));
      var caja = lienzo.parentNode.getBoundingClientRect();
      tip.style.left = Math.min(caja.width - 260, ev.clientX - caja.left + 14) + 'px';
      tip.style.top = (ev.clientY - caja.top + 16) + 'px';
      tip.hidden = false;
      lienzo.style.cursor = 'pointer';
    });
    lienzo.addEventListener('mouseleave', function () { if (T) T.hover = -1; $('cTip').hidden = true; });
    lienzo.addEventListener('click', function (ev) {
      var id = escenaT.celdaEn(ev.clientX, ev.clientY);
      var k = id >= 0 ? T.mundo.celdas[id] : null;
      if (!k || k.indexOf('v_') !== 0) return;
      var pid = k.slice(2);
      var i = S.agotados.indexOf(pid);
      var antes = S.R[S.algo].encontrado ? S.R[S.algo].costo : null;
      if (i >= 0) S.agotados.splice(i, 1); else S.agotados.push(pid);
      calcular();
      var r = S.R[S.algo];
      subtitulo((i >= 0 ? 'Vuelve al estante: ' : 'Se agotó: ') + S.M.porId[pid].nombre + '. El asesor vuelve a buscar: ' + (r.encontrado ? 'la mejor rutina ahora cuesta ' + plata(r.costo) + (antes != null && r.costo !== antes ? ' (antes ' + plata(antes) + ')' : '') + '.' : 'ya no hay ninguna rutina posible.'));
    });
    Array.prototype.forEach.call(document.querySelectorAll('#cAlgos button'), function (b) {
      b.addEventListener('click', function () { S.algo = b.dataset.algo; pintar(); pintarPizarra(true); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#cTabs [role=tab]'), function (b) {
      b.addEventListener('click', function () { abrirTab(b.dataset.tab); });
    });
  }

  enlazar();
  requestAnimationFrame(bucleTienda);
  window.CosApp = { abrir: abrir, parar: parar, miniatura: miniatura };
})();
