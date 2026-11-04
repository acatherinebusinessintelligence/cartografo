(function () {
  'use strict';

  var N = window.Nucleo;
  var DEFS = (window.MISIONES || []).slice().sort(function (a, b) { return a.orden - b.orden; });
  var NOMBRE = { bfs: 'BFS', dfs: 'DFS', ucs: 'Costo uniforme', astar: 'A*' };
  var ALGOS = ['bfs', 'dfs', 'ucs', 'astar'];
  var CLAVE_BITACORA = 'cartografo.misiones.bitacora';
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function fmt(x) {
    if (x === Infinity) return '∞';
    return Math.round(x) === x ? String(x) : x.toFixed(1);
  }
  function conjunto(prob, mask) {
    var l = prob.objetivos.filter(function (o) { return (mask >> o.indice) & 1; }).map(function (o) { return o.letra; });
    return l.length ? '{' + l.join(', ') + '}' : '∅';
  }
  function mayus(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

  // =====================================================================
  // CENTRO DE MISIONES
  // =====================================================================

  var hero = null;

  function pintarHub() {
    var grid = $('hubGrid');
    grid.textContent = '';
    DEFS.forEach(function (def) {
      if (def.vista === 'finanzas') { grid.appendChild(tarjetaFinanzas(def)); return; }
      if (def.vista === 'cosmetica') { grid.appendChild(tarjetaCosmetica(def)); return; }
      var mundo = N.crearMundo(def);
      var prob = N.compilar(mundo);
      var a = el('a', 'm-card');
      a.href = '#' + def.id;
      var vis = el('div', 'm-vis');
      var fondo = Iso.fondo(def);
      vis.style.background = 'radial-gradient(120% 90% at 50% 10%, ' + fondo[0] + ', ' + fondo[1] + ')';
      var num = el('span', 'm-num', String(def.reto).padStart(2, '0'));
      vis.appendChild(num);
      var cv = el('canvas');
      cv.setAttribute('aria-hidden', 'true');
      vis.appendChild(cv);
      a.appendChild(vis);
      var body = el('div', 'm-body');
      body.appendChild(el('p', 'eyebrow', def.lugar));
      body.appendChild(el('h3', null, def.titulo));
      body.appendChild(el('p', 'm-concepto', def.concepto));
      var tags = el('div', 'm-tags');
      tags.appendChild(el('span', null, def.dificultad));
      tags.appendChild(el('span', null, def.agente.nombre));
      body.appendChild(tags);
      a.appendChild(body);
      grid.appendChild(a);
      var esc = new Iso.Escena(cv);
      esc.ajustar(mundo, 0.75);
      esc.dibujar({
        quieto: true, objetivos: prob.objetivos, sinZonas: true,
        luz: function (id) { return N.enVerde(prob, id, 0); },
        abierta: function () { return false; }
      });
    });
    prepararHero();
  }

  function tarjetaFinanzas(def) {
    var a = el('a', 'm-card');
    a.href = '#' + def.id;
    var vis = el('div', 'm-vis');
    vis.style.background = 'radial-gradient(120% 90% at 50% 10%, #fef9c3, #fcd34d)';
    vis.appendChild(el('span', 'm-num', String(def.reto).padStart(2, '0')));
    var cv = el('canvas');
    cv.setAttribute('aria-hidden', 'true');
    vis.appendChild(cv);
    a.appendChild(vis);
    var body = el('div', 'm-body');
    body.appendChild(el('p', 'eyebrow', def.lugar));
    body.appendChild(el('h3', null, def.titulo));
    body.appendChild(el('p', 'm-concepto', def.concepto));
    var tags = el('div', 'm-tags');
    tags.appendChild(el('span', null, def.dificultad));
    tags.appendChild(el('span', 'nuevo', 'Sistemas financieros'));
    body.appendChild(tags);
    a.appendChild(body);
    window.FinApp.miniatura(cv, def);
    return a;
  }

  function tarjetaCosmetica(def) {
    var a = el('a', 'm-card');
    a.href = '#' + def.id;
    var vis = el('div', 'm-vis');
    vis.style.background = 'radial-gradient(120% 90% at 50% 10%, #fdf2f8, #f9a8d4)';
    vis.appendChild(el('span', 'm-num', String(def.reto).padStart(2, '0')));
    var cv = el('canvas');
    cv.setAttribute('aria-hidden', 'true');
    vis.appendChild(cv);
    a.appendChild(vis);
    var body = el('div', 'm-body');
    body.appendChild(el('p', 'eyebrow', def.lugar));
    body.appendChild(el('h3', null, def.titulo));
    body.appendChild(el('p', 'm-concepto', def.concepto));
    var tags = el('div', 'm-tags');
    tags.appendChild(el('span', null, def.dificultad));
    tags.appendChild(el('span', 'nuevo', 'Cuidado de la piel'));
    body.appendChild(tags);
    a.appendChild(body);
    window.CosApp.miniatura(cv);
    return a;
  }

  function prepararHero() {
    var def = DEFS.filter(function (d) { return d.id === 'casa'; })[0];
    if (!def) return;
    var mundo = N.crearMundo(def);
    var prob = N.compilar(mundo);
    var res = N.resolver(prob, 'ucs');
    var esc = new Iso.Escena($('heroLienzo'));
    esc.ajustar(mundo, 1);
    hero = { esc: esc, mundo: mundo, prob: prob, ruta: res.ruta, i: 0, p: 0 };
  }

  function animarHero(dt, t) {
    if (!hero) return;
    var h = hero;
    if (!reducido && h.ruta.length > 1) {
      h.p += dt / 260;
      if (h.p >= 1) {
        h.p = 0;
        h.i += 1;
        if (h.i >= h.ruta.length - 1) h.i = 0;
      }
    }
    var a = h.ruta[h.i] || { pos: h.prob.inicio, h: 0 };
    var b = h.ruta[h.i + 1] || a;
    var ag = posAgente(h.mundo, a.pos, b.pos, reducido ? 0 : h.p);
    h.esc.dibujar({
      t: t, quieto: reducido, objetivos: h.prob.objetivos, hechos: a.h,
      ruta: h.ruta.map(function (s) { return s.pos; }), rutaDesde: h.i,
      agente: ag, sinZonas: true
    });
  }

  function posAgente(mundo, a, b, p) {
    var cols = mundo.cols;
    var ra = Math.floor(a / cols);
    var ca = a % cols;
    var rb = Math.floor(b / cols);
    var cb = b % cols;
    var dir = cb > ca ? 'e' : cb < ca ? 'o' : rb > ra ? 's' : rb < ra ? 'n' : null;
    return { r: ra + (rb - ra) * p, c: ca + (cb - ca) * p, dir: dir };
  }

  // =====================================================================
  // VISTA DE UNA MISIÓN
  // =====================================================================

  var S = null;
  var escena = new Iso.Escena($('lienzo'));

  function rel() { return S.def.relato || {}; }
  function esDos() { return S.def.modo === 'dos'; }
  function contener() { return S.def.exito === 'contener'; }
  function tieneOcultos() {
    return Object.keys(S.def.tipos).some(function (k) { return S.def.tipos[k].parece; });
  }

  function abrir(def) {
    var mundo = N.crearMundo(def);
    S = {
      def: def, mundo: mundo, prob: N.compilar(mundo),
      algo: def.sugerido || 'ucs', herr: null,
      res: null, ruta: [], eventos: [], orden: {},
      idx: 0, prog: 0, andando: false, pausado: false, fin: false, fallo: false,
      gastado: 0, replanes: 0, pendiente: false, descubiertos: 0,
      replay: null, calor: null, calorMax: 0,
      hover: -1, ultimoDir: 'e', ultimoDir2: 'o',
      zonasVistas: {}, terrenosVistos: {}, silencio: 0, ambiente: 0,
      rastro: null, aBordo: -1,
      vivo: false, semilla: 1, rng: null, tiempo: 0, nEventos: 0, atendidos: 0, metas: 0, espera: 0
    };
    escena.ajustar(mundo, 1);
    var fondo = Iso.fondo(def);
    var stage = $('stage');
    stage.dataset.noche = String(!!(def.escena && def.escena.noche) || def.tema === 'ciudad');
    stage.style.setProperty('--f0', fondo[0]);
    stage.style.setProperty('--f1', fondo[1]);

    $('vEyebrow').textContent = 'Reto ' + def.reto + ' · ' + def.lugar;
    $('vTitulo').textContent = def.titulo;
    var chips = $('vChips');
    chips.textContent = '';
    chips.appendChild(el('span', 'chip', def.concepto));
    chips.appendChild(el('span', 'chip suave', def.dificultad));
    $('omniWrap').hidden = !tieneOcultos();
    $('omni').checked = false;

    pintarHerramientas();
    pintarParametros();
    pintarMision();
    pintarAlgos();
    $('aLog').textContent = '';
    $('final').hidden = true;
    $('subtitulo').hidden = true;
    planificar();
    anotar('Misión cargada. ' + def.objetivo);
    abrirTab('mision');
    pintarBitacora();
    capitulo();
  }

  // ---------- capítulo de apertura ----------

  function capitulo() {
    var d = S.def;
    var box = $('capitulo');
    box.textContent = '';
    var card = el('div', 'cap-card');
    card.appendChild(el('p', 'eyebrow', 'Reto ' + d.reto + ' · ' + d.lugar));
    card.appendChild(el('h2', null, d.titulo));
    var hora = rel().reloj ? reloj(0) : null;
    if (hora) card.appendChild(el('p', 'cap-hora', hora));
    card.appendChild(el('p', 'cap-historia', d.historia));
    var ag = el('div', 'cap-agente');
    ag.appendChild(el('b', null, d.agente.nombre + (d.agente2 ? ' y ' + d.agente2.nombre : '')));
    ag.appendChild(el('span', null, d.objetivo));
    card.appendChild(ag);
    var fila = el('div', 'fila-btn');
    var b1 = el('button', 'b-pri', 'Comenzar misión');
    b1.type = 'button';
    b1.addEventListener('click', function () { box.hidden = true; if (S.res.encontrado) ir(); else verContencion(); });
    var b2 = el('button', 'b-sec', 'Explorar el mapa primero');
    b2.type = 'button';
    b2.addEventListener('click', function () { box.hidden = true; });
    fila.appendChild(b1);
    fila.appendChild(b2);
    card.appendChild(fila);
    box.appendChild(card);
    box.hidden = false;
  }

  // ---------- reloj, medidor y relato ----------

  function reloj(gastado) {
    var r = rel().reloj;
    if (!r) return null;
    if (r.semanas) return 'Semana ' + (1 + Math.floor(gastado / (r.horas_por_semana || 6)));
    var p = r.inicio.split(':').map(Number);
    var seg = p[0] * 3600 + p[1] * 60 + Math.round(gastado * (r.segundos_por_unidad || 60));
    seg = ((seg % 86400) + 86400) % 86400;
    var hh = String(Math.floor(seg / 3600)).padStart(2, '0');
    var mm = String(Math.floor(seg / 60) % 60).padStart(2, '0');
    var ss = String(seg % 60).padStart(2, '0');
    return (r.segundos_por_unidad || 60) < 60 ? hh + ':' + mm + ':' + ss : hh + ':' + mm;
  }

  function medidor() {
    var m = rel().medidor;
    if (!m) return null;
    var est = estadoActual() || { pos: S.prob.inicio, h: 0, e: 0, p2: S.prob.inicio2 };
    if (m.bateria) {
      var b = S.def.bateria || 100;
      return { nombre: m.nombre, valor: Math.max(0, 100 * (1 - S.gastado / b)), texto: Math.max(0, Math.round(100 * (1 - S.gastado / b))) + '%' };
    }
    if (m.distancia) {
      var cols = S.mundo.cols;
      var d = Math.abs(Math.floor(est.pos / cols) - Math.floor(est.p2 / cols)) + Math.abs(est.pos % cols - est.p2 % cols);
      return { nombre: m.nombre, valor: null, texto: d + ' ' + m.unidad };
    }
    if (m.pulso) {
      if (!est.h) return { nombre: m.nombre, valor: null, texto: 'sin paciente a bordo' };
      if (S.aBordo < 0) S.aBordo = S.gastado;
      return { nombre: m.nombre, valor: null, texto: Math.round(112 - Math.min(18, (S.gastado - S.aBordo) * 0.6)) + ' lpm' };
    }
    var v = m.inicio - (m.por_unidad || 0) * S.gastado;
    if (m.eventos) {
      Object.keys(m.eventos).forEach(function (t) { if (t === 'visita') v += m.eventos[t] * N.popcount(est.h); });
    }
    if (m.unidad === '%') v = Math.max(0, Math.min(100, v));
    return { nombre: m.nombre, valor: m.unidad === '%' ? v : null, texto: Math.round(v) + (m.unidad ? (m.unidad === '%' ? '%' : ' ' + m.unidad) : '') };
  }

  function pintarHud() {
    var hud = $('hud');
    var hora = reloj(S.gastado);
    var med = medidor();
    hud.textContent = '';
    if (!hora && !med && !S.vivo) { hud.hidden = true; return; }
    hud.hidden = false;
    if (hora) hud.appendChild(el('span', 'hud-hora', hora));
    if (med) {
      var w = el('span', 'hud-med');
      w.appendChild(el('small', null, med.nombre));
      w.appendChild(el('b', null, med.texto));
      if (med.valor != null) {
        var barra = el('i');
        var fill = el('em');
        fill.style.width = Math.round(med.valor) + '%';
        if (med.valor < 25) fill.classList.add('bajo');
        barra.appendChild(fill);
        w.appendChild(barra);
      }
      hud.appendChild(w);
    }
    if (S.vivo) hud.appendChild(el('span', 'hud-fase', 'Turno ' + Math.min(S.tiempo, turnoTotal()) + '/' + turnoTotal() + (S.def.dinamica.continuo ? ' · ' + S.atendidos + ' atendidos' : '')));
    if (S.prob.periodo > 1) {
      var est = estadoActual() || { f: 0 };
      hud.appendChild(el('span', 'hud-fase', 'Ciclo ' + est.f + '/' + S.prob.periodo + ' s'));
    }
  }

  function plantilla(txt, extra) {
    var est = estadoActual() || { pos: S.prob.inicio };
    var med = medidor();
    var vals = Object.assign({
      agente: S.def.agente.nombre,
      zona: N.zonaDe(S.mundo, est.pos) || '',
      celda: N.etiqueta(S.mundo, est.pos),
      hora: reloj(S.gastado) || '',
      medidor: med ? med.texto : '',
      verbo: '', obj: '', motivo: '', quien: ''
    }, extra || {});
    return txt.replace(/\{(\w+)\}/g, function (_, k) { return vals[k] != null ? vals[k] : ''; }).replace(/\s+/g, ' ').trim();
  }

  var colaRelato = [];
  var mostrandoHasta = 0;

  function narrar(texto) {
    if (!texto) return;
    anotar(texto, 'relato');
    colaRelato.push(texto);
    if (colaRelato.length > 2) colaRelato.splice(0, colaRelato.length - 2);
  }

  function tickRelato(t) {
    if (!colaRelato.length || t < mostrandoHasta) return;
    var texto = colaRelato.shift();
    var sub = $('subtitulo');
    sub.hidden = false;
    sub.textContent = '';
    var span = el('span', null, texto);
    sub.appendChild(span);
    sub.classList.remove('entra');
    void sub.offsetWidth;
    sub.classList.add('entra');
    var vel = Number($('vel').value);
    mostrandoHasta = t + Math.max(1400, Math.min(4200, texto.length * 45)) * (3 / (vel + 1)) * 1.3;
  }

  function nombreObj(o) {
    var t = S.def.tipos[o.tipo];
    if (t.nombre_obj) return t.nombre_obj;
    if (S.def.modo === 'alguno') return (S.def.objeto || 'la meta') + ' ' + N.etiqueta(S.mundo, o.celda);
    var letra = S.prob.objetivos.filter(function (x) { return !x.opcional; }).length > 1 ? ' ' + o.letra : '';
    return (S.def.objeto || 'el objetivo') + letra + (o.urgente ? ' (urgente)' : '') + (o.zona ? ', ' + o.zona : '');
  }

  function verboDe(ev) {
    if (ev.obj && S.def.verbos_clase && S.def.verbos_clase[ev.obj.clase]) return S.def.verbos_clase[ev.obj.clase];
    return (S.def.verbos || {})[ev.tipo] || ev.tipo;
  }

  function contarPaso(pos, de) {
    var R = rel();
    var k = S.mundo.celdas[pos];
    var zona = N.zonaDe(S.mundo, pos);
    var dicho = false;
    (S.eventos[S.idx - 1] || []).forEach(function (ev) {
      if (ev.tipo === 'espera') {
        var quien = ev.agente === 2 && S.def.agente2 ? S.def.agente2.nombre : S.def.agente.nombre;
        var tE = (R.eventos || {}).espera;
        if (tE && S.silencio > 0) { narrar(plantilla(tE, { quien: quien })); dicho = true; }
        return;
      }
      var tpl = (ev.obj && R.eventos_clase && R.eventos_clase[ev.obj.clase]) || (R.eventos || {})[ev.tipo];
      var vb = verboDe(ev);
      var txt = tpl ? plantilla(tpl, { verbo: vb, obj: nombreObj(ev.obj) }) : mayus(vb) + ' ' + nombreObj(ev.obj) + '.';
      narrar(txt);
      avisar(mayus(vb) + ' ' + nombreObj(ev.obj) + '.');
      dicho = true;
    });
    if (!dicho && zona && zona !== N.zonaDe(S.mundo, de) && !S.zonasVistas[zona] && R.zonas && R.zonas[zona]) {
      S.zonasVistas[zona] = true;
      narrar(plantilla(R.zonas[zona]));
      dicho = true;
    }
    if (!dicho && R.terreno && R.terreno[k] && !S.terrenosVistos[k]) {
      S.terrenosVistos[k] = true;
      narrar(plantilla(R.terreno[k]));
      dicho = true;
    }
    if (dicho) S.silencio = 0;
    else {
      S.silencio += 1;
      if (S.silencio >= 6 && R.ambiente && R.ambiente.length) {
        narrar(plantilla(R.ambiente[S.ambiente % R.ambiente.length]));
        S.ambiente += 1;
        S.silencio = 0;
      }
    }
  }

  // ---------- herramientas y parámetros ----------

  function pintarHerramientas() {
    var box = $('herrs');
    box.textContent = '';
    var lista = [{ id: null, nombre: 'Mirar', ayuda: 'Pasa el cursor para ver cada baldosa.' }].concat(S.def.herramientas || []);
    lista.forEach(function (h) {
      var b = el('button', null, h.nombre);
      b.type = 'button';
      b.title = h.ayuda || '';
      var on = (S.herr && S.herr.id === h.id) || (!S.herr && !h.id);
      b.setAttribute('aria-pressed', String(on));
      if (on) b.classList.add('on');
      b.addEventListener('click', function () {
        S.herr = h.id ? h : null;
        pintarHerramientas();
        $('lienzo').classList.toggle('editando', !!S.herr);
        if (h.ayuda) avisar(h.ayuda);
      });
      box.appendChild(b);
    });
  }

  function pintarParametros() {
    var box = $('params');
    box.textContent = '';
    (S.def.parametros || []).forEach(function (p) {
      if (p.tipo === 'opciones') {
        var w = el('div', 'param-op');
        w.title = p.ayuda || '';
        w.appendChild(el('span', null, p.nombre));
        var seg = el('div', 'mini-seg');
        p.opciones.forEach(function (v) {
          var b = el('button', null, String(v));
          b.type = 'button';
          if (S.mundo.params[p.id] === v) b.classList.add('on');
          b.addEventListener('click', function () {
            S.mundo.params[p.id] = v;
            pintarParametros();
            cambio(p.nombre + ': ' + v + '.');
          });
          seg.appendChild(b);
        });
        w.appendChild(seg);
        box.appendChild(w);
      } else {
        var t = el('button', 'switch');
        t.type = 'button';
        t.setAttribute('role', 'switch');
        t.setAttribute('aria-checked', String(!!S.mundo.params[p.id]));
        t.title = p.ayuda || '';
        t.appendChild(el('i'));
        t.appendChild(el('span', null, p.nombre));
        t.addEventListener('click', function () {
          S.mundo.params[p.id] = !S.mundo.params[p.id];
          pintarParametros();
          cambio((S.mundo.params[p.id] ? 'Activa ' : 'Apaga ') + p.nombre.toLowerCase() + '. ' + (p.ayuda || ''));
        });
        box.appendChild(t);
      }
    });
    if (S.def.dinamica) {
      var v = el('button', 'switch vivo');
      v.type = 'button';
      v.setAttribute('role', 'switch');
      v.setAttribute('aria-checked', String(S.vivo));
      v.title = S.def.dinamica.resumen || '';
      v.appendChild(el('i'));
      v.appendChild(el('span', null, 'Mundo vivo'));
      v.addEventListener('click', function () {
        S.vivo = !S.vivo;
        pintarParametros();
        planificar();
        anotar(S.vivo ? 'Mundo vivo: ' + S.def.dinamica.resumen + ' Turno de ' + S.def.dinamica.turno + ' ' + S.def.unidad + (S.def.dinamica.continuo ? '; al cumplir, el agente sigue atendiendo lo que aparezca.' : '.') : 'Mundo quieto: nada cambia salvo lo que tú cambies.');
        if (S.vivo) avisar('Realidad #' + S.semilla + '. ' + S.def.dinamica.resumen);
      });
      box.appendChild(v);
      if (S.vivo) {
        var sem = el('button', 'switch semilla', 'Realidad #' + S.semilla + ' ↻');
        sem.type = 'button';
        sem.title = 'Otra realidad: otra semilla para el azar. La misma semilla repite exactamente lo mismo.';
        sem.addEventListener('click', function () {
          S.semilla = 1 + Math.floor(Math.random() * 999);
          pintarParametros();
          planificar();
          avisar('Realidad #' + S.semilla + '.');
        });
        box.appendChild(sem);
      }
    }
  }

  function pintarAlgos() {
    Array.prototype.forEach.call(document.querySelectorAll('#algos button'), function (b) {
      var on = b.dataset.algo === S.algo;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
    });
  }

  function proximoTipo(h, k) {
    if (h.mover) return h.sobre.indexOf(k) >= 0 ? h.mover : null;
    for (var i = 0; i < h.ciclos.length; i += 1) {
      var ciclo = h.ciclos[i];
      var j = ciclo.indexOf(k);
      if (j >= 0) return ciclo[(j + 1) % ciclo.length];
    }
    return null;
  }

  function posActual() {
    if (!S.ruta.length) return S.prob.inicio;
    return S.ruta[S.idx].pos;
  }

  function aplicar(id) {
    var h = S.herr;
    if (!h || id < 0) return;
    var m = S.mundo;
    var k = m.celdas[id];
    var nuevo = proximoTipo(h, k);
    var nombreK = m.def.tipos[k].nombre;
    if (!nuevo) { avisar(h.nombre + ' no actúa sobre «' + nombreK + '».'); return; }
    var tNuevo = m.def.tipos[nuevo];
    var est = estadoActual();
    var ocupadas = [posActual()];
    if (est && est.p2 >= 0) ocupadas.push(est.p2);
    if ((tNuevo.paso === false || tNuevo.parece) && ocupadas.indexOf(id) >= 0) {
      avisar('Hay un agente en ' + N.etiqueta(m, id) + '. No se bloquea la baldosa que pisa.');
      return;
    }
    var limite = S.def.modo === 'visitar' || S.def.modo === 'recoger';
    if (limite && tNuevo.objetivo && !m.def.tipos[k].objetivo && S.prob.objetivos.length >= N.MAX_OBJETIVOS) {
      avisar('Máximo ' + N.MAX_OBJETIVOS + ' objetivos: el espacio de estados crece como 2ⁿ.');
      return;
    }
    if (h.mover) {
      var antes = m.celdas.indexOf(h.mover);
      if (antes >= 0) {
        var o = S.prob.objetivos.filter(function (x) { return x.celda === antes; })[0];
        if (o && est && ((est.h >> o.indice) & 1)) { avisar('Ya va a bordo.'); return; }
        m.celdas[antes] = m.debajo[antes] || m.def.tipos[h.mover].suelo || k;
        delete m.debajo[antes];
      }
      m.debajo[id] = k;
      m.celdas[id] = h.mover;
      cambio('Mueve ' + tNuevo.nombre.toLowerCase() + ' a ' + N.etiqueta(m, id) + '.');
      return;
    }
    m.celdas[id] = nuevo;
    cambio(N.etiqueta(m, id) + ': ' + nombreK.toLowerCase() + ' → ' + tNuevo.nombre.toLowerCase() + '.');
  }

  // ---------- planificación ----------

  function estadoActual() {
    if (!S.ruta.length) return null;
    return S.ruta[S.idx];
  }

  function remapear(estado, viejos, nuevos) {
    var h = 0;
    var e = 0;
    nuevos.forEach(function (o) {
      viejos.forEach(function (v) {
        if (v.celda !== o.celda) return;
        if ((estado.h >> v.indice) & 1) h |= 1 << o.indice;
        if ((estado.e >> v.indice) & 1) e |= 1 << o.indice;
      });
    });
    return { pos: estado.pos, h: h, e: e, f: estado.f || 0, p2: estado.p2 == null ? -1 : estado.p2 };
  }

  function aceptar(res) {
    S.res = res;
    S.ruta = res.ruta;
    S.eventos = N.eventos(S.prob, res.ruta);
    S.orden = {};
    var n = 0;
    S.eventos.forEach(function (evs) {
      evs.forEach(function (ev) {
        if ((ev.tipo === 'visita' || ev.tipo === 'recoge') && !S.orden[ev.obj.celda]) { n += 1; S.orden[ev.obj.celda] = n; }
      });
    });
    var calor = new Uint32Array(S.prob.n);
    var max = 0;
    res.exp.pos.forEach(function (p) { calor[p] += 1; if (calor[p] > max) max = calor[p]; });
    S.calor = calor;
    S.calorMax = max;
  }

  function planificar() {
    S.prob = N.compilar(S.mundo);
    detener();
    S.replay = null;
    S.fin = false;
    S.fallo = false;
    S.idx = 0;
    S.prog = 0;
    S.gastado = 0;
    S.replanes = 0;
    S.descubiertos = 0;
    S.zonasVistas = {};
    S.terrenosVistos = {};
    S.silencio = 0;
    S.aBordo = -1;
    S.rastro = new Uint8Array(S.prob.n);
    S.rng = window.Azar.crear(S.semilla);
    S.tiempo = 0;
    S.nEventos = 0;
    S.atendidos = 0;
    S.metas = 0;
    S.espera = 0;
    colaRelato = [];
    $('final').hidden = true;
    aceptar(N.resolver(S.prob, S.algo));
    if (!S.res.encontrado) {
      if (contener()) avisar('Contención: el gusano ya no tiene camino a los datos.');
      else avisar(sinPlan());
    } else if (S.def.bateria && S.res.costo > S.def.bateria) {
      avisar('El plan pide ' + fmt(S.res.costo) + ' ' + S.def.unidad + ' y la batería tiene ' + S.def.bateria + '. No alcanza.');
    }
    refrescar();
  }

  function sinPlan() {
    if (S.res && S.res.agotado) return 'La búsqueda se detuvo: demasiados estados.';
    return 'No existe un plan: algún objetivo o la meta quedó encerrado.';
  }

  function restante() {
    if (!S.ruta.length) return 0;
    var c = 0;
    for (var i = S.idx + 1; i < S.ruta.length; i += 1) c += costoPaso(S.ruta[i - 1], S.ruta[i]);
    return c;
  }

  function costoPaso(a, b) {
    var p = S.prob;
    if (esDos()) {
      return (b.pos === a.pos ? (a.pos === p.final ? 0 : 1) : p.costo[b.pos]) + (b.p2 === a.p2 ? (a.p2 === p.final2 ? 0 : 1) : p.costo[b.p2]);
    }
    return b.pos === a.pos ? 1 : p.costo[b.pos];
  }

  function replanificar(motivo, costoAntes, viejos) {
    viejos = viejos || S.prob.objetivos;
    if (costoAntes == null) costoAntes = restante();
    var est = estadoActual();
    S.prob = N.compilar(S.mundo);
    if (!est) { planificar(); return; }
    var desde = remapear(est, viejos, S.prob.objetivos);
    var res = N.resolver(S.prob, S.algo, desde);
    S.replanes += 1;
    aceptar(res);
    S.idx = 0;
    S.prog = 0;
    var R = rel();
    if (!res.encontrado) {
      S.ruta = [desde];
      if (!S.vivo) detener();
      if (contener()) {
        anotar(motivo + ' El gusano queda encerrado en ' + N.etiqueta(S.mundo, desde.pos) + '.', 'bueno');
        narrar(plantilla(R.contenido || 'Contención lograda.'));
        terminarContencion(true);
      } else {
        anotar(motivo + ' Replanifica desde ' + N.etiqueta(S.mundo, desde.pos) + ': no hay camino. ' + (S.vivo ? 'Espera a que el mundo cambie.' : 'El agente se detiene.'), 'malo');
        avisar(S.vivo ? 'Sin camino por ahora: ' + S.def.agente.nombre + ' espera.' : 'Sin plan desde aquí. Deshaz el cambio o reinicia.');
      }
    } else {
      anotar(motivo + ' Replanifica desde ' + N.etiqueta(S.mundo, desde.pos) + ': le faltaban ' + fmt(costoAntes) + ' ' + S.def.unidad + ', ahora ' + fmt(res.costo) + '.', res.costo > costoAntes ? 'malo' : 'bueno');
      if (R.eventos && R.eventos.replan) narrar(plantilla(R.eventos.replan, { motivo: '' }));
    }
    refrescar();
  }

  function cambio(texto) {
    var enMarcha = (S.andando || S.pausado) && !S.fin;
    if (!enMarcha) {
      planificar();
      anotar(texto + ' Nuevo plan: ' + (S.res.encontrado ? fmt(S.res.costo) + ' ' + S.def.unidad + ' en ' + S.res.pasos + ' pasos.' : (contener() ? 'el gusano no tiene camino.' : 'no hay.')));
      return;
    }
    var sig = S.ruta[S.idx + 1];
    var antes = restante();
    var viejos = S.prob.objetivos;
    if (S.prog > 0 && sig) {
      var nuevo = N.compilar(S.mundo);
      var libre = nuevo.costo[sig.pos] !== Infinity && (sig.p2 < 0 || nuevo.costo[sig.p2] !== Infinity);
      if (libre) {
        S.pendiente = { texto: texto, antes: antes - costoPaso(S.ruta[S.idx], sig), viejos: viejos };
        anotar(texto + ' Lo verá al llegar a ' + N.etiqueta(S.mundo, sig.pos) + '.');
        return;
      }
    }
    S.prog = 0;
    replanificar(texto, antes, viejos);
  }

  // ---------- sensor: lo que el agente descubre ----------

  function sentir() {
    var radio = S.def.sensor;
    if (!radio) return false;
    var est = estadoActual();
    if (!est) return false;
    var m = S.mundo;
    var cols = m.cols;
    var r0 = Math.floor(est.pos / cols);
    var c0 = est.pos % cols;
    var vistos = [];
    for (var id = 0; id < m.celdas.length; id += 1) {
      var t = m.def.tipos[m.celdas[id]];
      if (!t.parece) continue;
      var d = Math.abs(Math.floor(id / cols) - r0) + Math.abs(id % cols - c0);
      if (d <= radio) { m.celdas[id] = t.revela; vistos.push(id); }
    }
    if (!vistos.length) return false;
    S.descubiertos += vistos.length;
    var R = rel();
    vistos.forEach(function (id) {
      var txt = (R.eventos || {}).revela;
      narrar(txt ? plantilla(txt, { celda: N.etiqueta(m, id) }) : 'El sensor descubre un obstáculo en ' + N.etiqueta(m, id) + '.');
    });
    var enRuta = S.ruta.slice(S.idx + 1).some(function (s) { return vistos.indexOf(s.pos) >= 0; });
    if (enRuta) {
      replanificar('El sensor detecta un escombro en ' + vistos.map(function (id) { return N.etiqueta(m, id); }).join(', ') + '.');
    } else {
      var viejos = S.prob.objetivos;
      S.prob = N.compilar(m);
      void viejos;
      anotar('Escombro en ' + vistos.map(function (id) { return N.etiqueta(m, id); }).join(', ') + ': no estaba en el plan, sigue igual.');
    }
    return true;
  }

  // ---------- ejecución ----------

  function detener() {
    S.andando = false;
    S.pausado = false;
    botonIr();
  }

  function botonIr() {
    var b = $('btnIr');
    if (!S) return;
    if (S.fin) b.textContent = 'Repetir';
    else if (S.andando) b.textContent = 'Pausar';
    else if (S.pausado) b.textContent = 'Continuar';
    else b.textContent = contener() ? 'Lanzar el ataque' : 'Ejecutar misión';
    b.disabled = !S.res || (!S.res.encontrado && !S.fin);
    $('btnBuscar').textContent = S.replay ? 'Saltar' : 'Ver la búsqueda';
  }

  function ir() {
    if (!S.res) return;
    if (S.fin) planificar();
    if (!S.res.encontrado) return;
    S.replay = null;
    $('capitulo').hidden = true;
    if (S.andando) { S.andando = false; S.pausado = true; botonIr(); return; }
    var empieza = S.idx === 0 && S.prog === 0;
    if (empieza) {
      anotar('Sale con ' + NOMBRE[S.algo] + ': plan de ' + S.res.pasos + ' pasos y ' + fmt(S.res.costo) + ' ' + S.def.unidad + '.');
      (rel().inicio || []).forEach(function (t) { narrar(plantilla(t)); });
      S.rastro[S.prob.inicio] = 1;
      if (sentir() && !S.res.encontrado) return;
      tickVivo();
    }
    if (reducido) {
      while (S.idx < S.ruta.length - 1 && !S.fin) llegar();
      refrescar();
      return;
    }
    S.andando = true;
    S.pausado = false;
    abrirTab('agente');
    botonIr();
  }

  var DIRS = { e: 'al este', o: 'al oeste', s: 'al sur', n: 'al norte' };

  function llegar() {
    var de = S.ruta[S.idx];
    S.idx += 1;
    S.prog = 0;
    var a = S.ruta[S.idx];
    var cPaso = costoPaso(de, a);
    S.gastado += cPaso;
    S.tiempo += cPaso;
    S.atendidos += S.def.modo === 'recoger' ? N.popcount(a.e & ~de.e) : (S.def.modo === 'visitar' ? N.popcount(a.h & ~de.h) : 0);
    var d1 = posAgente(S.mundo, de.pos, a.pos, 1).dir;
    if (d1) S.ultimoDir = d1;
    if (esDos()) { var d2 = posAgente(S.mundo, de.p2, a.p2, 1).dir; if (d2) S.ultimoDir2 = d2; }
    S.rastro[a.pos] = 1;
    contarPaso(a.pos, de.pos);
    if (S.def.bateria && S.gastado > S.def.bateria) { fallar('La batería se agota en ' + N.etiqueta(S.mundo, a.pos) + '. ' + S.def.agente.nombre + ' aterriza de emergencia.'); return; }
    if (S.pendiente) {
      var pend = S.pendiente;
      S.pendiente = false;
      replanificar(pend.texto, pend.antes, pend.viejos);
      return;
    }
    if (sentir()) { if (S.vivo && S.tiempo >= turnoTotal()) finTurno(); return; }
    if (S.idx >= S.ruta.length - 1) {
      if (!S.vivo) { terminar(); return; }
      metaVivo();
      return;
    }
    if (S.vivo) {
      if (S.tiempo >= turnoTotal()) { finTurno(); return; }
      tickVivo();
    }
  }

  // ---------- mundo vivo ----------

  function turnoTotal() { return S.def.dinamica ? S.def.dinamica.turno : Infinity; }

  function tickVivo() {
    if (!S.vivo || S.fin) return false;
    var est = estadoActual() || { pos: S.prob.inicio, p2: -1 };
    var ocup = [est.pos];
    if (est.p2 >= 0) ocup.push(est.p2);
    var cambios = window.Turno.eventos(S.mundo, S.rng, ocup, S.nEventos);
    if (!cambios.length) return false;
    S.nEventos += cambios.length;
    cambios.forEach(function (ch) {
      var txt = plantilla(ch.texto, { celda: N.etiqueta(S.mundo, ch.celda), zona: N.zonaDe(S.mundo, ch.celda) || 'zona' });
      narrar(txt);
      avisar(txt);
    });
    replanificar('El mundo cambió (' + cambios.map(function (ch) { return ch.evento.nombre.toLowerCase() + ' en ' + N.etiqueta(S.mundo, ch.celda); }).join('; ') + ').');
    return true;
  }

  function metaVivo() {
    S.metas += 1;
    if (S.def.modo === 'alguno') S.atendidos += 1;
    if (!S.def.dinamica.continuo) { terminar(); return; }
    var est = estadoActual();
    var limpias = window.Turno.limpiar(S.mundo, S.prob, est);
    narrar(plantilla('{agente} atendió todo lo pendiente. Espera nuevas tareas. Van ' + S.atendidos + ' en el turno.'));
    if (limpias) {
      var viejos = S.prob.objetivos;
      S.prob = N.compilar(S.mundo);
      var desde = remapear(est, viejos, S.prob.objetivos);
      var res = N.resolver(S.prob, S.algo, desde);
      aceptar(res);
      if (!res.encontrado) S.ruta = [desde];
      S.idx = 0;
    }
    if (S.tiempo >= turnoTotal()) finTurno();
  }

  function esperarTic(dt, vel) {
    S.espera += dt;
    var base = [0, 620, 420, 280, 170, 90][vel];
    if (S.espera < base) return;
    S.espera = 0;
    S.tiempo += 1;
    if (S.tiempo >= turnoTotal()) { finTurno(); return; }
    tickVivo();
    refrescar();
  }

  function finTurno() {
    S.andando = false;
    S.pausado = false;
    S.fin = true;
    botonIr();
    var cont = S.def.dinamica.continuo;
    var tit = cont ? 'Fin del turno' : (S.metas ? 'Misión cumplida' : 'Se acabó el tiempo');
    var grande = cont ? S.atendidos + ' ' + (S.def.objeto_plural || 'objetivos') + ' atendidos' : fmt(S.gastado) + ' ' + S.def.unidad_larga;
    var det = 'Realidad #' + S.semilla + ' · ' + S.nEventos + ' eventos · ' + S.replanes + ' replanificaciones · costo ' + fmt(S.gastado) + ' ' + S.def.unidad;
    narrar(plantilla(cont ? 'Termina el turno a las {hora}. ' + S.atendidos + ' atendidos.' : (rel().fin || 'Fin.')));
    mostrarFinal(tit, grande, det, !cont && !S.metas);
    guardar({ tipo: 'turno', algo: S.algo, costo: S.gastado, pasos: S.idx, expandidos: S.res ? S.res.expandidos : 0, replanes: S.replanes, resultado: S.atendidos + ' atendidos, semilla ' + S.semilla });
  }

  function fallar(texto) {
    S.andando = false;
    S.pausado = false;
    S.fin = true;
    S.fallo = true;
    botonIr();
    anotar(texto, 'malo');
    narrar(texto);
    mostrarFinal('Misión fallida', fmt(S.gastado) + ' ' + S.def.unidad_larga, texto, true);
    guardar({ tipo: 'misión', algo: S.algo, costo: S.gastado, pasos: S.idx, expandidos: S.res.expandidos, replanes: S.replanes, resultado: 'fallida' });
  }

  function terminar() {
    S.andando = false;
    S.pausado = false;
    S.fin = true;
    botonIr();
    var R = rel();
    if (contener()) {
      narrar(plantilla(R.fin || 'El gusano llegó a los datos.'));
      mostrarFinal('Brecha', S.ruta.length - 1 + ' saltos', 'El gusano alcanzó la base de datos. Corta enlaces o pon cortafuegos y vuelve a intentarlo.', true);
      guardar({ tipo: 'ataque', algo: S.algo, costo: S.gastado, pasos: S.ruta.length - 1, expandidos: S.res.expandidos, replanes: S.replanes, resultado: 'brecha' });
      return;
    }
    anotar('Misión cumplida en ' + N.etiqueta(S.mundo, posActual()) + '. Gastó ' + fmt(S.gastado) + ' ' + S.def.unidad + (S.replanes ? ' y replanificó ' + S.replanes + (S.replanes === 1 ? ' vez.' : ' veces.') : '.'), 'bueno');
    if (R.fin) narrar(plantilla(R.fin));
    var det = NOMBRE[S.algo] + (S.replanes ? ' · ' + S.replanes + ' replanificaciones' : '') + (S.descubiertos ? ' · ' + S.descubiertos + ' obstáculos descubiertos' : '');
    mostrarFinal('Misión cumplida' + (reloj(S.gastado) ? ' · ' + reloj(S.gastado) : ''), fmt(S.gastado) + ' ' + S.def.unidad_larga, det, false);
    guardar({ tipo: 'misión', algo: S.algo, costo: S.gastado, pasos: S.ruta.length - 1, expandidos: S.res.expandidos, replanes: S.replanes, resultado: 'cumplida' });
  }

  function verContencion() {
    if (contener() && !S.res.encontrado) terminarContencion(false);
  }

  function terminarContencion(enMarcha) {
    var leg = legitimos();
    var cambios = cambiosDelMapa().length;
    S.fin = true;
    botonIr();
    var det = 'Terminales que siguen llegando a los datos: ' + leg.conectadas + ' de ' + leg.total + '. Cambios a la red: ' + cambios + '.';
    mostrarFinal('Red contenida', leg.conectadas + '/' + leg.total + ' terminales en línea', det, false);
    if (!enMarcha) narrar(plantilla(rel().contenido || 'Contención lograda.'));
    guardar({ tipo: 'contención', algo: S.algo, costo: 0, pasos: 0, expandidos: S.res.expandidos, replanes: S.replanes, resultado: leg.conectadas + '/' + leg.total + ' terminales' });
  }

  function mostrarFinal(titulo, grande, detalle, malo) {
    var f = $('final');
    f.textContent = '';
    f.classList.toggle('malo', !!malo);
    f.appendChild(el('p', 'eyebrow', titulo));
    f.appendChild(el('h3', null, grande));
    f.appendChild(el('p', null, detalle));
    var fila = el('div', 'fila-btn');
    var b1 = el('button', 'b-pri', 'Comparar algoritmos');
    b1.type = 'button';
    b1.addEventListener('click', function () { abrirTab('comparar'); f.hidden = true; });
    var b2 = el('button', 'b-sec', 'Repetir');
    b2.type = 'button';
    b2.addEventListener('click', function () { planificar(); });
    var b3 = el('button', 'b-sec', 'Cerrar');
    b3.type = 'button';
    b3.addEventListener('click', function () { f.hidden = true; });
    fila.appendChild(b1);
    fila.appendChild(b2);
    fila.appendChild(b3);
    f.appendChild(fila);
    f.hidden = false;
  }

  // terminales que aún llegan a los datos (un cortafuegos sí deja pasar a los empleados)
  function legitimos() {
    var m = S.mundo;
    var tipos = m.def.tipos;
    var meta = S.prob.final;
    var total = 0;
    var conectadas = 0;
    var mapa = {};
    if (!S.def.legitimos || meta < 0) return { total: 0, conectadas: 0, mapa: mapa };
    var cols = m.cols;
    var paso = function (id) { var t = tipos[m.celdas[id]]; return t.paso !== false || t.legitimo; };
    var visto = new Uint8Array(m.celdas.length);
    var cola = [meta];
    visto[meta] = 1;
    while (cola.length) {
      var x = cola.pop();
      var r = Math.floor(x / cols);
      var c = x % cols;
      [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(function (d) {
        var rr = r + d[0];
        var cc = c + d[1];
        if (rr < 0 || cc < 0 || rr >= m.filas || cc >= cols) return;
        var y = rr * cols + cc;
        if (!visto[y] && paso(y)) { visto[y] = 1; cola.push(y); }
      });
    }
    m.celdas.forEach(function (k, id) {
      if (k !== S.def.legitimos) return;
      total += 1;
      mapa[id] = !!visto[id];
      if (visto[id]) conectadas += 1;
    });
    return { total: total, conectadas: conectadas, mapa: mapa };
  }

  function verBusqueda() {
    if (!S.res) return;
    if (S.replay) { S.replay = null; botonIr(); refrescar(); return; }
    if (S.andando || S.pausado || S.fin) planificar();
    if (!S.res.expandidos) return;
    $('capitulo').hidden = true;
    S.replay = { i: 0, calor: new Uint32Array(S.prob.n), max: 1 };
    $('verCalor').checked = true;
    anotar('Repite la búsqueda de ' + NOMBRE[S.algo] + ': ' + S.res.expandidos + ' estados, en el orden en que los sacó de la frontera.');
    botonIr();
  }

  // ---------- bucle ----------

  var ultimo = 0;
  function bucle(t) {
    var dt = Math.min(64, t - (ultimo || t));
    ultimo = t;
    if (!$('hub').hidden) animarHero(dt, t);
    if (S && !$('vista').hidden) {
      var vel = Number($('vel').value);
      if (S.replay) {
        var total = S.res.expandidos;
        var dur = Math.max(1600, Math.min(6500, total * 7)) / (vel / 3);
        var avanza = Math.max(1, Math.round(total * dt / dur));
        var R = S.replay;
        for (var k = 0; k < avanza && R.i < total; k += 1) {
          var p = S.res.exp.pos[R.i];
          R.calor[p] += 1;
          if (R.calor[p] > R.max) R.max = R.calor[p];
          R.i += 1;
        }
        if (R.i >= total) {
          S.replay = null;
          botonIr();
          refrescar();
        } else if (Math.floor(t / 120) !== Math.floor((t - dt) / 120)) {
          var j = R.i - 1;
          $('memTexto').textContent = 'Estado ' + (j + 1) + ' de ' + total + ': (' + N.etiqueta(S.mundo, S.res.exp.pos[j]) + ', ' + conjunto(S.prob, S.res.exp.h[j]) + ').';
        }
      }
      if (S.andando) {
        var sig = S.ruta[S.idx + 1];
        if (!sig) { if (S.vivo && !S.fin) esperarTic(dt, vel); else terminar(); }
        else {
          var c = costoPaso(S.ruta[S.idx], sig);
          if (esDos()) c = Math.max(1, c / 2);
          var base = [0, 620, 420, 280, 170, 90][vel];
          S.prog += dt / (base * (0.45 + 0.55 * Math.min(c, 8)));
          if (S.prog >= 1) { llegar(); refrescar(); }
        }
      }
      tickRelato(t);
      dibujar(t);
    }
    requestAnimationFrame(bucle);
  }

  function dibujar(t) {
    var a = S.ruta[S.idx] || { pos: S.prob.inicio, h: 0, e: 0, f: 0, p2: S.prob.inicio2 };
    var b = S.ruta[S.idx + 1] || a;
    var prog = S.andando || S.pausado ? Math.min(1, S.prog) : 0;
    var ag = posAgente(S.mundo, a.pos, b.pos, prog);
    if (!ag.dir) ag.dir = S.ultimoDir;
    ag.saltando = S.fin && !S.fallo;
    ag.andando = S.andando;
    var ag2 = null;
    if (esDos()) {
      ag2 = posAgente(S.mundo, a.p2, b.p2, prog);
      if (!ag2.dir) ag2.dir = S.ultimoDir2;
      ag2.spec = S.def.agente2;
      ag2.saltando = ag.saltando;
    }
    var lleva = S.prob.objetivos.filter(function (o) { return ((a.h & ~a.e) >> o.indice) & 1; }).map(function (o) { return o.letra; });
    var calor = null;
    var max = 0;
    if ($('verCalor').checked) {
      if (S.replay) { calor = S.replay.calor; max = S.replay.max; }
      else if (!S.andando && !S.fin) { calor = S.calor; max = S.calorMax; }
    }
    var enMarcha = S.idx > 0 || S.andando || S.pausado;
    var prob = S.prob;
    var med = medidor();
    escena.dibujar({
      t: t, quieto: reducido,
      objetivos: prob.objetivos, hechos: a.h, entregados: a.e, lleva: lleva,
      calor: calor, calorMax: max, numeros: $('verNumeros').checked,
      foco: S.replay && S.replay.i > 0 ? S.res.exp.pos[S.replay.i - 1] : -1,
      ruta: S.replay ? null : S.ruta.map(function (s) { return s.pos; }),
      ruta2: S.replay || !esDos() ? null : S.ruta.map(function (s) { return s.p2; }),
      rutaDesde: S.idx,
      orden: enMarcha ? null : S.orden,
      agente: ag, agente2: ag2,
      hover: S.hover, hoverOk: S.hoverOk,
      lluvia: !!S.mundo.params.lluvia,
      luz: function (id) { return N.enVerde(prob, id, a.f || 0); },
      abierta: function (id) { var l = prob.cerrojo[id]; return !l || (a.h & l) === l; },
      rastro: contener() ? S.rastro : null,
      conectadas: contener() ? legitimos().mapa : null,
      omnisciente: $('omni').checked,
      bateria: S.def.bateria && med ? med.valor : null
    });
  }

  // ---------- paneles ----------

  function refrescar() {
    if (!S) return;
    var r = S.res;
    var u = ' ' + S.def.unidad;
    var enMarcha = S.idx > 0 || S.andando || S.pausado || S.fin;
    if (contener() && r && !r.encontrado) {
      $('kCostoL').textContent = 'Gusano';
      $('kCosto').textContent = 'sin camino';
    } else if (enMarcha) {
      $('kCostoL').textContent = 'Gastado / restante';
      $('kCosto').textContent = fmt(S.gastado) + ' / ' + fmt(restante()) + u;
    } else {
      $('kCostoL').textContent = 'Costo del plan';
      $('kCosto').textContent = r && r.encontrado ? fmt(r.costo) + u : 'sin plan';
    }
    $('kPasos').textContent = r && r.encontrado ? String(r.pasos) : '—';
    $('kExp').textContent = r ? String(r.expandidos) : '—';
    $('kBald').textContent = r ? String(N.baldosasDistintas(r)) : '—';
    $('kMs').textContent = r ? (r.tiempo < 1 ? '<1 ms' : Math.round(r.tiempo) + ' ms') : '—';
    pintarCapas();
    pintarAgente();
    pintarCostos();
    pintarHud();
    botonIr();
    $('lienzo').setAttribute('aria-label', S.def.lugar + '. ' + S.def.agente.nombre + ' está en ' + N.etiqueta(S.mundo, posActual()) + '. ' + (r && r.encontrado ? 'Plan de ' + r.pasos + ' pasos y costo ' + fmt(r.costo) + '.' : 'Sin plan.'));
    if (!document.querySelector('#vista .tab[data-panel=comparar]').hidden) comparar();
    if (!document.querySelector('#vista .tab[data-panel=como]').hidden && !S.andando) pintarComo();
  }

  function pintarCapas() {
    var r = S.res;
    var box = $('capas');
    box.textContent = '';
    if (!r || !r.expandidos) { $('memTexto').textContent = ''; return; }
    var bald = N.baldosasDistintas(r);
    var memo = esDos() ? 'cada estado es un par de posiciones (Alfa, Beta)' :
      S.prob.periodo > 1 ? 'el estado también guarda el segundo del ciclo del semáforo' :
      S.def.modo === 'alguno' ? 'aquí el estado es solo la posición' :
      'cada barra es un conjunto de ' + (S.def.modo === 'recoger' ? 'paquetes recogidos' : 'objetivos cumplidos');
    $('memTexto').textContent = NOMBRE[r.algo] + ' expandió ' + r.expandidos + ' estados sobre ' + bald + ' baldosas' +
      (r.expandidos > bald ? ': una misma baldosa vuelve a aparecer con otra memoria; ' + memo + '.' : ': cada baldosa apareció una sola vez.');
    if (esDos() || S.def.modo === 'alguno' || !S.prob.objetivos.length) return;
    var porCapa = {};
    r.exp.h.forEach(function (h) { porCapa[h] = (porCapa[h] || 0) + 1; });
    var claves = Object.keys(porCapa).map(Number).sort(function (a, b) { return N.popcount(a) - N.popcount(b) || a - b; });
    var max = 0;
    claves.forEach(function (k) { if (porCapa[k] > max) max = porCapa[k]; });
    claves.forEach(function (k) {
      var d = el('div', 'capa');
      d.appendChild(el('code', null, conjunto(S.prob, k)));
      var pista = el('span', 'pista');
      var barra = el('i');
      barra.style.width = Math.max(4, Math.round(100 * porCapa[k] / max)) + '%';
      pista.appendChild(barra);
      d.appendChild(pista);
      d.appendChild(el('b', null, String(porCapa[k])));
      box.appendChild(d);
    });
  }

  function tupla(est) {
    var m = S.mundo;
    var p = S.prob;
    if (esDos()) return '(' + S.def.agente.nombre + ' ' + N.etiqueta(m, est.pos) + ', ' + S.def.agente2.nombre + ' ' + N.etiqueta(m, est.p2) + ')';
    if (S.def.modo === 'alguno') return '(' + N.etiqueta(m, est.pos) + ')';
    var base = S.def.modo === 'recoger'
      ? N.etiqueta(m, est.pos) + ', lleva ' + conjunto(p, est.h & ~est.e) + ', entregó ' + conjunto(p, est.e)
      : N.etiqueta(m, est.pos) + (p.objetivos.length ? ', ' + conjunto(p, est.h) : '');
    if (p.periodo > 1) base += ', t mod ' + p.periodo + ' = ' + (est.f || 0);
    return '(' + base + ')';
  }

  function pintarAgente() {
    var est = estadoActual() || { pos: S.prob.inicio, h: 0, e: 0, f: 0, p2: S.prob.inicio2 };
    var m = S.mundo;
    var p = S.prob;
    $('aTupla').textContent = 's = ' + tupla(est);

    var t = m.def.tipos[m.celdas[est.pos]];
    var libres = [];
    var cols = m.cols;
    [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(function (d) {
      var r = Math.floor(est.pos / cols) + d[0];
      var c = (est.pos % cols) + d[1];
      if (r < 0 || c < 0 || r >= m.filas || c >= cols) return;
      var id = r * cols + c;
      var lock = p.cerrojo[id];
      if (p.costo[id] !== Infinity && (!lock || (est.h & lock) === lock)) libres.push(N.etiqueta(m, id));
    });
    var obl = p.objetivos.filter(function (o) { return !o.opcional; });
    var faltan = obl.filter(function (o) { return S.def.modo === 'recoger' ? !((est.e >> o.indice) & 1) : !((est.h >> o.indice) & 1); });
    var hechos = p.objetivos.filter(function (o) { return (est.h >> o.indice) & 1; });
    var sig = S.ruta[S.idx + 1];
    var dir = sig ? posAgente(m, est.pos, sig.pos, 1).dir : null;
    var recuerda;
    if (esDos()) recuerda = S.def.agente2.nombre + ' está en ' + N.etiqueta(m, est.p2) + '. No pueden compartir celda ni cruzarse de frente.';
    else if (S.def.modo === 'alguno') recuerda = 'No necesita memoria: cualquier cupo libre es una meta.';
    else if (!p.objetivos.length) recuerda = 'No guarda memoria: solo busca un camino a ' + (m.def.tipos[S.def.final] ? m.def.tipos[S.def.final].nombre.toLowerCase() : 'la meta') + '.';
    else recuerda = (hechos.length ? 'Ya tiene ' + hechos.map(function (o) { return o.letra; }).join(', ') + '. ' : 'Nada hecho todavía. ') +
      (faltan.length ? 'Faltan ' + faltan.map(function (o) { return o.letra + (o.alta ? '!' : ''); }).join(', ') + '.' : 'No falta ningún objetivo.');
    if (p.periodo > 1) recuerda += ' Segundo ' + (est.f || 0) + ' de un ciclo de ' + p.periodo + '.';
    var actua;
    if (S.fin) actua = S.fallo ? 'Se detuvo.' : 'Misión terminada.';
    else if (!sig) actua = 'Espera.';
    else if (sig.pos === est.pos && (!esDos() || sig.p2 !== est.p2)) actua = S.def.agente.nombre + ' espera un paso en ' + N.etiqueta(m, est.pos) + '.';
    else if (esDos()) {
      actua = (sig.pos === est.pos ? S.def.agente.nombre + ' espera' : S.def.agente.nombre + ' va a ' + N.etiqueta(m, sig.pos)) + '; ' +
        (sig.p2 === est.p2 ? S.def.agente2.nombre + ' espera.' : S.def.agente2.nombre + ' va a ' + N.etiqueta(m, sig.p2) + '.');
    } else actua = 'Avanza ' + DIRS[dir] + ', a ' + N.etiqueta(m, sig.pos) + ' (cuesta ' + fmt(p.costo[sig.pos]) + ').';
    var textos = {
      percibe: 'En ' + N.etiqueta(m, est.pos) + ': ' + t.nombre.toLowerCase() + '. Puede pasar a ' + (libres.join(', ') || 'ninguna vecina') + '.',
      recuerda: recuerda,
      decide: S.res && S.res.encontrado
        ? NOMBRE[S.algo] + ': quedan ' + (S.ruta.length - 1 - S.idx) + ' pasos y ' + fmt(restante()) + ' ' + S.def.unidad + '.' + (S.replanes ? ' Replanificó ' + S.replanes + '×.' : '')
        : (contener() ? 'No encuentra ninguna ruta a los datos.' : 'No hay plan.'),
      actua: actua
    };
    Array.prototype.forEach.call(document.querySelectorAll('#aCiclo li'), function (li) {
      li.querySelector('span').textContent = textos[li.dataset.fase];
    });
  }

  function pintarMision() {
    var d = S.def;
    $('mHistoria').textContent = d.historia;
    $('mObjetivo').textContent = d.objetivo;
    var dl = $('mAgente');
    dl.textContent = '';
    var nombre = d.agente.nombre + (d.agente2 ? ' y ' + d.agente2.nombre : '');
    [['Se llama', nombre], ['Percibe', d.agente.percibe], ['Recuerda', d.agente.recuerda], ['Puede', d.agente.acciones], ['Termina cuando', d.agente.meta]].forEach(function (par) {
      dl.appendChild(el('dt', null, par[0]));
      dl.appendChild(el('dd', null, par[1]));
    });
    var ol = $('mPreguntas');
    ol.textContent = '';
    (d.preguntas || []).forEach(function (q) { ol.appendChild(el('li', null, q)); });
  }

  function pintarCostos() {
    var tb = $('mCostos');
    tb.textContent = '';
    var tabla = N.costos(S.mundo);
    var vistos = {};
    Object.keys(S.def.tipos).forEach(function (k) {
      var t = S.def.tipos[k];
      if (t.paso === false && tabla[k] === Infinity) return;
      if (t.parece || vistos[t.nombre]) return;
      vistos[t.nombre] = true;
      var tr = el('tr');
      tr.appendChild(el('td', null, t.nombre));
      var base = t.paso === false ? Infinity : (t.costo || 1);
      var td = el('td', 'num', fmt(tabla[k]) + ' ' + S.def.unidad);
      if (tabla[k] !== base) td.classList.add('subio');
      tr.appendChild(td);
      tb.appendChild(tr);
    });
    if (S.prob.periodo > 1) {
      var trS = el('tr');
      trS.appendChild(el('td', null, 'Esperar en el sitio'));
      trS.appendChild(el('td', 'num', '1 ' + S.def.unidad));
      tb.appendChild(trS);
    }
    var tr2 = el('tr', 'bloq');
    tr2.appendChild(el('td', null, 'Muros y obstáculos'));
    tr2.appendChild(el('td', 'num', 'no se pasa'));
    tb.appendChild(tr2);
  }

  function anotar(texto, tono) {
    var li = el('li', tono || null, texto);
    var ol = $('aLog');
    ol.insertBefore(li, ol.firstChild);
    while (ol.children.length > 80) ol.removeChild(ol.lastChild);
  }

  var timerAviso = null;
  function avisar(texto) {
    var a = $('aviso');
    a.textContent = texto;
    a.hidden = false;
    a.classList.remove('sale');
    clearTimeout(timerAviso);
    timerAviso = setTimeout(function () { a.classList.add('sale'); timerAviso = setTimeout(function () { a.hidden = true; }, 300); }, 2600);
  }

  // ---------- comparar ----------

  function comparar() {
    var p = N.compilar(S.mundo);
    var R = {};
    ALGOS.forEach(function (a) { R[a] = N.resolver(p, a); });
    var box = $('cTabla');
    box.textContent = '';
    var ok = ALGOS.filter(function (a) { return R[a].encontrado; });
    if (!ok.length) {
      $('cLectura').textContent = contener()
        ? 'Ninguno de los cuatro encuentra ruta: si BFS no la encuentra, nadie la encuentra, porque BFS revisa todo lo alcanzable. La red está contenida.'
        : 'Ningún algoritmo encuentra un plan: con este mapa la misión es imposible.';
      return R;
    }
    var mejor = Math.min.apply(null, ok.map(function (a) { return R[a].costo; }));
    var maxExp = Math.max.apply(null, ALGOS.map(function (a) { return R[a].expandidos; }));
    var maxCosto = Math.max.apply(null, ok.map(function (a) { return R[a].costo; }));
    ALGOS.forEach(function (a) {
      var r = R[a];
      var fila = el('div', 'cmp' + (a === S.algo ? ' actual' : ''));
      var cab = el('div', 'cmp-cab');
      cab.appendChild(el('b', null, NOMBRE[a]));
      if (r.encontrado && r.costo === mejor) cab.appendChild(el('span', 'tag-ok', 'óptimo'));
      else if (r.encontrado) cab.appendChild(el('span', 'tag-mal', '+' + fmt(r.costo - mejor) + ' ' + S.def.unidad));
      else cab.appendChild(el('span', 'tag-mal', 'sin plan'));
      fila.appendChild(cab);
      [['Costo', r.encontrado ? r.costo : 0, maxCosto, r.encontrado ? fmt(r.costo) + ' ' + S.def.unidad : '—', 'costo'],
        ['Estados', r.expandidos, maxExp, String(r.expandidos), 'exp']].forEach(function (m) {
        var l = el('div', 'cmp-l');
        l.appendChild(el('small', null, m[0]));
        var pista = el('span', 'pista ' + m[4]);
        var bar = el('i');
        bar.style.width = (m[2] ? Math.max(2, 100 * m[1] / m[2]) : 0) + '%';
        pista.appendChild(bar);
        l.appendChild(pista);
        l.appendChild(el('code', null, m[3]));
        fila.appendChild(l);
      });
      fila.appendChild(el('p', 'cmp-pie', r.encontrado ? r.pasos + ' pasos · ' + N.baldosasDistintas(r) + ' baldosas · ' + (r.tiempo < 1 ? '<1' : Math.round(r.tiempo)) + ' ms' : ''));
      box.appendChild(fila);
    });

    var u = ' ' + S.def.unidad;
    var b = R.bfs;
    var c = R.ucs;
    var a = R.astar;
    var d = R.dfs;
    var partes = [];
    if (b.encontrado && c.encontrado) {
      if (b.costo > c.costo) partes.push('BFS halla el plan con menos pasos (' + b.pasos + '), pero cuesta ' + fmt(b.costo) + u + '. Costo uniforme baja a ' + fmt(c.costo) + u + ' con ' + c.pasos + ' pasos: ' + fmt(b.costo - c.costo) + u + ' menos.');
      else partes.push('Aquí BFS empata en costo con costo uniforme (' + fmt(c.costo) + u + '): el camino con menos pasos también es el más barato.');
    }
    if (a.encontrado && c.encontrado) {
      var ahorro = c.expandidos ? Math.round(100 * (c.expandidos - a.expandidos) / c.expandidos) : 0;
      partes.push('A* llega al mismo costo expandiendo ' + a.expandidos + ' estados frente a ' + c.expandidos + (ahorro > 0 ? ' (' + ahorro + '% menos): la pista h descarta estados lejanos.' : '.'));
    }
    if (d.encontrado && c.encontrado) {
      partes.push(d.costo > c.costo
        ? 'DFS encuentra un plan de ' + fmt(d.costo) + u + ' (' + Math.round(100 * (d.costo - c.costo) / c.costo) + '% más caro): toma el primero que encuentra, no el mejor.'
        : 'DFS acertó esta vez con el óptimo, pero no lo garantiza.');
    }
    if (S.def.bateria) {
      partes.push('Batería: ' + S.def.bateria + u + '. ' + ALGOS.filter(function (x) { return R[x].encontrado && R[x].costo > S.def.bateria; }).map(function (x) { return NOMBRE[x]; }).join(', ').replace(/^$/, 'Todos los planes alcanzan') + (ALGOS.some(function (x) { return R[x].encontrado && R[x].costo > S.def.bateria; }) ? ' no alcanzaría' + (ALGOS.filter(function (x) { return R[x].encontrado && R[x].costo > S.def.bateria; }).length > 1 ? 'n' : '') + ' a volver.' : '.'));
    }
    $('cLectura').textContent = partes.join(' ');
    pintarVivoComparar();
    return R;
  }

  function pintarVivoComparar() {
    var box = $('cVivo');
    box.hidden = !S.def.dinamica;
    if (!S.def.dinamica) return;
    $('cVivoTxt').textContent = S.def.dinamica.resumen + ' Cada algoritmo trabaja el mismo turno en las mismas 20 realidades (semillas 1 a 20).';
  }

  function correrRealidades() {
    var def = S.def;
    var params = Object.assign({}, S.mundo.params);
    var algos = ['bfs', 'dfs', 'ucs', 'astar'];
    var out = {};
    var i = 0;
    var boton = $('cVivoBtn');
    boton.disabled = true;
    var tabla = $('cVivoTabla');
    tabla.textContent = '';
    (function siguiente() {
      if (i >= algos.length) { boton.disabled = false; boton.textContent = 'Volver a simular'; pintarRealidades(out); return; }
      boton.textContent = 'Simulando ' + NOMBRE[algos[i]] + '…';
      setTimeout(function () {
        var a = algos[i];
        var corridas = [];
        for (var s = 1; s <= 20; s += 1) corridas.push(window.Turno.simular(def, { params: params, algo: a, semilla: s }));
        var prom = function (k) { return corridas.reduce(function (x, y) { return x + y[k]; }, 0) / corridas.length; };
        out[a] = { atendidos: prom('atendidos'), costo: prom('costo'), replanes: prom('replanes'), expandidos: prom('expandidos'), exito: corridas.filter(function (c) { return c.exito; }).length / 20 };
        i += 1;
        siguiente();
      }, 20);
    })();
  }

  function pintarRealidades(out) {
    var cont = S.def.dinamica.continuo;
    var tabla = $('cVivoTabla');
    tabla.textContent = '';
    var t = el('table', 'costos realidades');
    var cab = el('tr');
    ['', cont ? 'Atendidos' : 'Éxito', 'Costo', 'Replanes', 'Estados'].forEach(function (h) { cab.appendChild(el('th', null, h)); });
    t.appendChild(cab);
    var mejor = null;
    ALGOS.forEach(function (a) {
      var r = out[a];
      var val = cont ? r.atendidos : r.exito;
      if (mejor === null || val > out[mejor][cont ? 'atendidos' : 'exito'] || (val === out[mejor][cont ? 'atendidos' : 'exito'] && r.expandidos < out[mejor].expandidos)) mejor = a;
      var tr = el('tr', a === S.algo ? 'actual' : null);
      tr.appendChild(el('td', null, NOMBRE[a]));
      tr.appendChild(el('td', 'num', cont ? r.atendidos.toFixed(1) : Math.round(r.exito * 100) + '%'));
      tr.appendChild(el('td', 'num', r.costo.toFixed(0) + ' ' + S.def.unidad));
      tr.appendChild(el('td', 'num', r.replanes.toFixed(1)));
      tr.appendChild(el('td', 'num', Math.round(r.expandidos).toLocaleString('es-CO')));
      t.appendChild(tr);
    });
    tabla.appendChild(t);
    var d = out.dfs;
    var a2 = out.astar;
    var u = out.ucs;
    var lect = 'En promedio, ' + NOMBRE[mejor] + ' rinde mejor en este mundo cambiante. ';
    if (cont) lect += 'DFS atiende ' + d.atendidos.toFixed(1) + ' frente a ' + a2.atendidos.toFixed(1) + ' de A*: sus planes largos se quedan viejos antes de terminarse. ';
    else lect += 'DFS cumple en el ' + Math.round(d.exito * 100) + '% de las realidades, A* en el ' + Math.round(a2.exito * 100) + '%. ';
    if (u.expandidos > 0) lect += 'A* expande ' + Math.round(100 * (1 - a2.expandidos / u.expandidos)) + '% menos estados que costo uniforme a lo largo del turno, porque replanifica muchas veces y cada búsqueda cuenta.';
    $('cVivoLectura').textContent = lect;
    guardar({ tipo: 'realidades', resultados: Object.keys(out).reduce(function (o, k) { o[k] = { costo: Math.round(out[k].costo * 10) / 10, pasos: null, expandidos: Math.round(out[k].expandidos) }; return o; }, {}) });
  }

  // ---------- cómo busca: explicación con los números de esta misión ----------

  var LISTA = {
    bfs: 'una cola: siempre saca el estado que entró primero. Por eso avanza por capas: primero todo lo que está a 1 paso, luego a 2…',
    dfs: 'una pila: siempre saca el estado que entró de último. Por eso se mete por un camino hasta el fondo antes de probar otro.',
    ucs: 'una cola de prioridad ordenada por g, el costo acumulado desde el inicio. Siempre abre lo más barato de alcanzar.',
    astar: 'una cola de prioridad ordenada por f = g + h: lo que ya costó llegar más la pista de cuánto falta.'
  };

  function paso(box, n, titulo) {
    var card = el('section', 'como-paso');
    var cab = el('div', 'como-cab');
    cab.appendChild(el('span', 'como-num', String(n)));
    cab.appendChild(el('h4', null, titulo));
    card.appendChild(cab);
    box.appendChild(card);
    return card;
  }

  function nombreAccion(p, s, t) {
    var m = S.mundo;
    if (esDos()) {
      var a = t.pos === s.pos ? S.def.agente.nombre + ' espera' : S.def.agente.nombre + ' va a ' + N.etiqueta(m, t.pos);
      var b = t.p2 === s.p2 ? S.def.agente2.nombre + ' espera' : S.def.agente2.nombre + ' va a ' + N.etiqueta(m, t.p2);
      return a + '; ' + b;
    }
    if (t.pos === s.pos) return 'Esperar un segundo';
    return 'Ir ' + DIRS[posAgente(m, s.pos, t.pos, 1).dir] + ' a ' + N.etiqueta(m, t.pos);
  }

  function explicarPista(p) {
    var c = fmt(p.minCosto);
    var d = S.def;
    var base;
    if (esDos()) base = 'Suma cuánto le falta a cada robot hasta su estación, contando casillas en línea recta sin muros, y lo multiplica por el costo más barato de un paso (' + c + ').';
    else if (d.modo === 'alguno') base = 'Cuenta las casillas en línea recta hasta el cupo libre más cercano y las multiplica por el costo más barato de un paso (' + c + ').';
    else if (d.modo === 'recoger') base = 'Para cada paquete pendiente calcula ir por él y luego al muelle; para los que ya lleva, ir al muelle. Toma la mayor de esas distancias en línea recta y la multiplica por el costo más barato de un paso (' + c + ').';
    else if (!p.objetivos.filter(function (o) { return !o.opcional; }).length) base = 'Cuenta las casillas en línea recta hasta la meta, sin muros, y las multiplica por el costo más barato de un paso (' + c + ').';
    else base = 'Para cada objetivo pendiente calcula ir hasta él' + (p.final >= 0 ? ' y de ahí a la meta final' : '') + ', contando casillas en línea recta sin muros. Toma la mayor de esas distancias y la multiplica por el costo más barato de un paso (' + c + ').';
    var extra = ' Nunca exagera: ese recorrido hay que hacerlo sí o sí, y en el mapa real solo puede costar más (muros, ' + (p.periodo > 1 ? 'esperas en rojo, ' : '') + 'terrenos caros). Por eso A* sigue encontrando el óptimo.';
    if (p.objetivos.some(function (o) { return o.opcional; })) extra += ' Los objetivos opcionales no cuentan en la pista.';
    return base + extra;
  }

  function pintarComo() {
    var box = $('comoBox');
    if (!box || !S) return;
    box.textContent = '';
    var d = S.def;
    var p = N.compilar(S.mundo);
    var ini = N.inicial(p);
    var R = {};
    ALGOS.forEach(function (a) { R[a] = N.resolver(p, a); });
    var r = R[S.algo];
    var conteo = N.contarEstados(p);
    var libres = 0;
    for (var i = 0; i < p.n; i += 1) if (p.costo[i] !== Infinity) libres += 1;

    box.appendChild(el('p', 'sub', 'Todo lo de esta pestaña se calcula con el mapa tal como está ahora y el algoritmo elegido (' + NOMBRE[S.algo] + '). Cambia el mapa o el algoritmo y vuelve aquí.'));

    // 1. estado
    var c1 = paso(box, 1, 'El estado: qué necesita saber el agente');
    var qué;
    if (esDos()) qué = 'Aquí el estado es el par de posiciones (' + d.agente.nombre + ', ' + d.agente2.nombre + '). Moverlos por separado no sirve: lo que es seguro para uno depende de dónde está el otro.';
    else if (d.modo === 'alguno') qué = 'Aquí basta la casilla donde está el carro: no necesita recordar nada, porque cualquier cupo libre es una meta.';
    else if (d.modo === 'recoger') qué = 'Aquí el estado es (casilla, paquetes que lleva, paquetes entregados). La misma casilla con la bandeja llena o vacía son situaciones distintas.';
    else if (p.objetivos.length) qué = 'Aquí el estado es (casilla, objetivos ya cumplidos), donde los objetivos son ' + (d.objeto_plural || 'los puntos de la misión') + '. La misma casilla con distinta memoria son estados distintos: por eso el agente puede pasar dos veces por un sitio sin dar vueltas en círculo.';
    else qué = 'Aquí el estado es solo la casilla donde está el agente.';
    if (p.periodo > 1) qué += ' Además guarda el segundo del ciclo del semáforo: estar frente al cruce en verde o en rojo no es lo mismo.';
    c1.appendChild(el('p', null, qué));
    var tup = el('div', 'como-tupla');
    tup.appendChild(el('span', null, 'Inicio'));
    tup.appendChild(el('code', null, tupla(ini)));
    tup.appendChild(el('span', null, 'Meta'));
    tup.appendChild(el('code', null, d.agente.meta));
    c1.appendChild(tup);
    var tam = 'En este mapa hay ' + conteo.total.toLocaleString('es-CO') + ' estados alcanzables';
    if ((d.modo === 'visitar' || d.modo === 'recoger') && p.objetivos.length) tam += ': ' + libres + ' casillas por donde se puede pasar, combinadas con lo que el agente ya hizo';
    c1.appendChild(el('p', 'como-dato', tam + '. Ese es el tamaño del problema.'));

    // 2. acciones
    var c2 = paso(box, 2, 'Las acciones: qué puede hacer desde el inicio');
    var hijos = N.sucesores(p, ini);
    c2.appendChild(el('p', null, 'Desde el inicio tiene ' + hijos.length + (hijos.length === 1 ? ' opción' : ' opciones') + '. Cada una lleva a un estado nuevo y tiene un costo:'));
    var t2 = el('table', 'costos como-tabla');
    hijos.forEach(function (h) {
      var tr = el('tr');
      tr.appendChild(el('td', null, nombreAccion(p, ini, h)));
      tr.appendChild(el('td', 'num', tupla(h)));
      tr.appendChild(el('td', 'num', '+' + fmt(h.c) + ' ' + d.unidad));
      t2.appendChild(tr);
    });
    c2.appendChild(t2);

    // 3. expandir
    var c3 = paso(box, 3, 'Expandir: abrir un estado y mirar sus hijos');
    c3.appendChild(el('p', null, 'Expandir es sacar un estado de la lista de pendientes, preguntar «¿es la meta?» y, si no, agregar sus hijos a la lista. ' + NOMBRE[S.algo] + ' usa ' + LISTA[S.algo]));
    c3.appendChild(el('p', null, 'Estos fueron los primeros estados que abrió, en orden:'));
    var ol = el('ol', 'como-orden');
    for (var k = 0; k < Math.min(10, r.exp.pos.length); k += 1) {
      ol.appendChild(el('li', null, tupla({ pos: r.exp.pos[k], h: r.exp.h[k], e: r.exp.e[k], f: r.exp.f[k], p2: r.exp.p2[k] })));
    }
    c3.appendChild(ol);
    c3.appendChild(el('p', 'como-dato', 'En total abrió ' + r.expandidos.toLocaleString('es-CO') + ' de los ' + conteo.total.toLocaleString('es-CO') + ' estados antes de sacar la meta de la lista. Usa «Ver la búsqueda» para verlo en el mapa.'));

    // 4. costo
    var c4 = paso(box, 4, 'El costo: qué se suma en cada paso');
    var tabla = N.costos(S.mundo);
    var grupos = {};
    Object.keys(d.tipos).forEach(function (kk) {
      var tt = d.tipos[kk];
      if (tabla[kk] === Infinity || tt.parece) return;
      var v = fmt(tabla[kk]);
      (grupos[v] = grupos[v] || []).push(tt.nombre.toLowerCase());
    });
    var frases = Object.keys(grupos).sort(function (a, b) { return Number(a) - Number(b); }).map(function (v) {
      var nombres = grupos[v].filter(function (x, i2, arr) { return arr.indexOf(x) === i2; });
      return v + ' ' + d.unidad + ': ' + nombres.slice(0, 4).join(', ') + (nombres.length > 4 ? '…' : '');
    });
    c4.appendChild(el('p', null, 'Cada paso suma el costo de la casilla a la que entra' + (esDos() ? ', por cada robot que se mueve (esperar cuesta 1 mientras no esté en su estación)' : '') + (p.periodo > 1 ? '. Esperar un segundo cuesta 1' : '') + '. El costo de un plan es la suma de sus pasos.'));
    var ul = el('ul', 'como-lista');
    frases.forEach(function (f) { ul.appendChild(el('li', null, f)); });
    c4.appendChild(ul);

    // 5. pista
    var c5 = paso(box, 5, 'La pista de A*: cuánto falta, sin exagerar');
    c5.appendChild(el('p', null, explicarPista(p)));
    c5.appendChild(el('p', 'como-dato', 'Al inicio la pista vale h = ' + fmt(N.heuristica(p, ini)) + ' ' + d.unidad + '. El plan óptimo cuesta ' + (R.ucs.encontrado ? fmt(R.ucs.costo) + ' ' + d.unidad : '—') + ': la pista se queda por debajo, como debe ser.'));

    // 6. comparación
    var c6 = paso(box, 6, 'Lo que encontró cada algoritmo');
    var t6 = el('table', 'costos realidades');
    var cab = el('tr');
    ['', 'Estados abiertos', 'Pasos', 'Costo'].forEach(function (h) { cab.appendChild(el('th', null, h)); });
    t6.appendChild(cab);
    ALGOS.forEach(function (a) {
      var tr = el('tr', a === S.algo ? 'actual' : null);
      tr.appendChild(el('td', null, NOMBRE[a]));
      tr.appendChild(el('td', 'num', R[a].expandidos.toLocaleString('es-CO')));
      tr.appendChild(el('td', 'num', R[a].encontrado ? String(R[a].pasos) : '—'));
      tr.appendChild(el('td', 'num', R[a].encontrado ? fmt(R[a].costo) + ' ' + d.unidad : 'sin camino'));
      t6.appendChild(tr);
    });
    c6.appendChild(t6);
    var ideas = [];
    if (!R.bfs.encontrado) ideas.push(contener() ? 'Ninguno encuentra ruta: el gusano está contenido. Si BFS no encuentra camino, no existe, porque revisa todo lo alcanzable.' : 'Ningún algoritmo encuentra camino: con este mapa la meta es inalcanzable.');
    else {
      ideas.push(R.bfs.costo > R.ucs.costo
        ? 'BFS cuenta pasos, no costos: su plan tiene ' + R.bfs.pasos + ' pasos pero cuesta ' + fmt(R.bfs.costo) + '. Costo uniforme acepta ' + R.ucs.pasos + ' pasos para pagar solo ' + fmt(R.ucs.costo) + '.'
        : 'Aquí BFS empata en costo con costo uniforme: el plan con menos pasos también es el más barato.');
      ideas.push(R.astar.expandidos < R.ucs.expandidos
        ? 'A* y costo uniforme llegan al mismo costo, pero A* abre ' + R.astar.expandidos + ' estados en vez de ' + R.ucs.expandidos + ' gracias a la pista.'
        : 'A* y costo uniforme llegan al mismo costo; aquí la pista casi no ahorra trabajo.');
      ideas.push(R.dfs.costo > R.ucs.costo
        ? 'DFS se queda con el primer plan que encuentra: cuesta ' + fmt(R.dfs.costo) + ', es decir ' + fmt(R.dfs.costo - R.ucs.costo) + ' más que el óptimo.'
        : 'DFS acertó esta vez, pero no lo garantiza.');
    }
    var ul6 = el('ul', 'como-lista');
    ideas.forEach(function (x) { ul6.appendChild(el('li', null, x)); });
    c6.appendChild(ul6);

    // 7. del plan a la acción
    var c7 = paso(box, 7, 'Del plan a la acción');
    c7.appendChild(el('p', null, 'Toda la búsqueda ocurre en la «cabeza» del agente, en ' + (r.tiempo < 1 ? 'menos de 1 ms' : Math.round(r.tiempo) + ' ms') + '. Después ejecuta el plan un paso a la vez. Si algo cambia (usa una herramienta o activa «Mundo vivo»), vuelve a buscar desde donde está: ese es el ciclo percibir, recordar, decidir y actuar de la pestaña «En vivo».'));
  }

  // ---------- bitácora ----------

  function cambiosDelMapa() {
    var original = N.crearMundo(S.def);
    var out = [];
    S.mundo.celdas.forEach(function (k, i) {
      if (k !== original.celdas[i]) out.push(N.etiqueta(S.mundo, i) + ':' + original.celdas[i] + '→' + k);
    });
    return out;
  }

  function leerBitacora() {
    try { return JSON.parse(localStorage.getItem(CLAVE_BITACORA) || '[]'); } catch (e) { return []; }
  }

  function guardar(entrada) {
    var lista = leerBitacora();
    entrada.fecha = new Date().toISOString();
    entrada.mision = S.def.id;
    entrada.unidad = S.def.unidad;
    entrada.parametros = Object.assign({}, S.mundo.params);
    entrada.cambios = cambiosDelMapa();
    lista.unshift(entrada);
    try { localStorage.setItem(CLAVE_BITACORA, JSON.stringify(lista.slice(0, 300))); } catch (e) { /* sin espacio */ }
    pintarBitacora();
  }

  function pintarBitacora() {
    var box = $('bLista');
    box.textContent = '';
    var lista = leerBitacora();
    if (!lista.length) { box.appendChild(el('p', 'sub', 'Todavía no hay registros.')); return; }
    lista.slice(0, 40).forEach(function (e) {
      var d = el('div', 'b-item');
      var cab = el('div', 'b-cab');
      cab.appendChild(el('b', null, e.mision + ' · ' + e.tipo));
      cab.appendChild(el('time', null, new Date(e.fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })));
      d.appendChild(cab);
      var txt = (e.tipo === 'comparación' || e.tipo === 'realidades')
        ? ALGOS.map(function (a) { return NOMBRE[a] + ' ' + (e.resultados[a].costo == null ? '—' : fmt(e.resultados[a].costo)) + ' (' + e.resultados[a].expandidos + ')'; }).join(' · ')
        : NOMBRE[e.algo] + ' · ' + fmt(e.costo) + ' ' + e.unidad + ' · ' + e.pasos + ' pasos · ' + e.expandidos + ' estados' + (e.replanes ? ' · ' + e.replanes + ' replanes' : '') + (e.resultado ? ' · ' + e.resultado : '');
      d.appendChild(el('p', null, txt));
      if (e.cambios && e.cambios.length) d.appendChild(el('p', 'sub', e.cambios.length + ' cambios al mapa'));
      box.appendChild(d);
    });
  }

  function descargar(nombre, texto, tipo) {
    var blob = new Blob([texto], { type: tipo });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function csv() {
    var filas = [['fecha', 'mision', 'tipo', 'algoritmo', 'costo', 'unidad', 'pasos', 'expandidos', 'replanes', 'resultado', 'parametros', 'cambios']];
    leerBitacora().forEach(function (e) {
      if (e.tipo === 'comparación') {
        ALGOS.forEach(function (a) {
          var r = e.resultados[a];
          filas.push([e.fecha, e.mision, e.tipo, a, r.costo == null ? '' : r.costo, e.unidad, r.pasos == null ? '' : r.pasos, r.expandidos, '', '', JSON.stringify(e.parametros), (e.cambios || []).join(' ')]);
        });
      } else {
        filas.push([e.fecha, e.mision, e.tipo, e.algo, e.costo, e.unidad, e.pasos, e.expandidos, e.replanes, e.resultado || '', JSON.stringify(e.parametros), (e.cambios || []).join(' ')]);
      }
    });
    return filas.map(function (f) {
      return f.map(function (v) { v = String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',');
    }).join('\n');
  }

  // ---------- pestañas ----------

  function abrirTab(nombre) {
    if (!S) return;
    Array.prototype.forEach.call(document.querySelectorAll('#vista .tabs [role=tab]'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.tab === nombre));
    });
    Array.prototype.forEach.call(document.querySelectorAll('#vista .tab'), function (p) {
      p.hidden = p.dataset.panel !== nombre;
    });
    if (nombre === 'comparar') comparar();
    if (nombre === 'como') pintarComo();
    if (nombre === 'bitacora') pintarBitacora();
  }

  // ---------- eventos ----------

  function enlazar() {
    Array.prototype.forEach.call(document.querySelectorAll('#algos button'), function (b) {
      b.addEventListener('click', function () { elegirAlgo(b.dataset.algo); });
    });
    $('btnIr').addEventListener('click', ir);
    $('btnBuscar').addEventListener('click', verBusqueda);
    $('btnReiniciar').addEventListener('click', reiniciar);
    $('volver').addEventListener('click', function () { location.hash = ''; });
    $('verNumeros').addEventListener('change', function () { if (S) refrescar(); });
    Array.prototype.forEach.call(document.querySelectorAll('#vista .tabs [role=tab]'), function (b) {
      b.addEventListener('click', function () { abrirTab(b.dataset.tab); });
    });
    $('cGuardar').addEventListener('click', function () {
      var R = comparar();
      var res = {};
      ALGOS.forEach(function (a) { res[a] = { costo: R[a].encontrado ? R[a].costo : null, pasos: R[a].encontrado ? R[a].pasos : null, expandidos: R[a].expandidos }; });
      guardar({ tipo: 'comparación', resultados: res });
      avisar('Comparación guardada en la bitácora.');
    });
    $('cVivoBtn').addEventListener('click', correrRealidades);
    $('bJson').addEventListener('click', function () { descargar('bitacora-misiones.json', JSON.stringify(leerBitacora(), null, 2), 'application/json'); });
    $('bCsv').addEventListener('click', function () { descargar('bitacora-misiones.csv', csv(), 'text/csv'); });
    $('bBorrar').addEventListener('click', function () {
      if (!window.confirm('¿Borrar toda la bitácora de misiones de este navegador?')) return;
      localStorage.removeItem(CLAVE_BITACORA);
      pintarBitacora();
    });

    var lienzo = $('lienzo');
    lienzo.addEventListener('mousemove', function (ev) {
      if (!S) return;
      var id = escena.celdaEn(ev.clientX, ev.clientY);
      S.hover = id;
      var tip = $('tip');
      if (id < 0) { tip.hidden = true; return; }
      var m = S.mundo;
      var k = m.celdas[id];
      var t = m.def.tipos[k];
      var costo = S.prob.costo[id];
      var nombre = t.parece && !$('omni').checked ? m.def.tipos[t.parece].nombre : t.nombre;
      var linea = N.etiqueta(m, id) + ' · ' + nombre + (costo === Infinity ? ' · no se pasa' : ' · cuesta ' + fmt(costo) + ' ' + S.def.unidad);
      if (t.parece && $('omni').checked) linea += ' · el agente cree que está libre';
      if (S.prob.cerrojo[id]) linea += ' · se abre con: ' + S.prob.objetivos.filter(function (o) { return (S.prob.cerrojo[id] >> o.indice) & 1; }).map(function (o) { return m.def.tipos[o.tipo].nombre.toLowerCase(); }).join(', ');
      if (S.prob.grupo[id] >= 0) {
        var v = S.prob.verde[S.prob.grupo[id]];
        linea += ' · verde en los segundos ' + v[0] + '–' + (v[1] - 1) + ' del ciclo';
      }
      var o = S.prob.objetivos.filter(function (x) { return x.celda === id; })[0];
      if (o && S.def.modo !== 'alguno') linea += ' · objetivo ' + o.letra + (o.opcional ? ' (opcional)' : '');
      if (S.calor && S.calor[id] && !S.andando) linea += ' · ' + S.calor[id] + (S.calor[id] === 1 ? ' estado' : ' estados');
      var accion = '';
      S.hoverOk = true;
      if (S.herr) {
        var nuevo = proximoTipo(S.herr, k);
        S.hoverOk = !!nuevo;
        accion = nuevo ? 'Clic → ' + m.def.tipos[nuevo].nombre.toLowerCase() : S.herr.nombre + ' no actúa aquí';
      }
      tip.textContent = '';
      tip.appendChild(el('span', null, linea));
      if (accion) tip.appendChild(el('em', S.hoverOk ? null : 'no', accion));
      var caja = $('stage').getBoundingClientRect();
      tip.style.left = Math.min(caja.width - 270, ev.clientX - caja.left + 14) + 'px';
      tip.style.top = (ev.clientY - caja.top + 16) + 'px';
      tip.hidden = false;
    });
    lienzo.addEventListener('mouseleave', function () { if (S) S.hover = -1; $('tip').hidden = true; });
    lienzo.addEventListener('click', function (ev) {
      if (!S) return;
      var id = escena.celdaEn(ev.clientX, ev.clientY);
      if (!S.herr) {
        if (id >= 0) avisar('Elige una herramienta arriba para cambiar el mundo.');
        return;
      }
      aplicar(id);
    });

    document.addEventListener('keydown', function (ev) {
      if (!S || $('vista').hidden) return;
      var tag = (ev.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (ev.key === ' ' && tag !== 'button') { ev.preventDefault(); ir(); }
      else if (ev.key === 'r' || ev.key === 'R') reiniciar();
      else if (ev.key >= '1' && ev.key <= '4') elegirAlgo(ALGOS[Number(ev.key) - 1]);
      else if (ev.key === 'Escape') { if (!$('capitulo').hidden) $('capitulo').hidden = true; else location.hash = ''; }
    });

    window.addEventListener('hashchange', ruta);
  }

  function elegirAlgo(a) {
    if (!S || a === S.algo) return;
    S.algo = a;
    pintarAlgos();
    if ((S.andando || S.pausado) && !S.fin) {
      S.prog = 0;
      replanificar('Cambia a ' + NOMBRE[a] + '.');
    } else {
      planificar();
      anotar(NOMBRE[a] + ': plan de ' + (S.res.encontrado ? S.res.pasos + ' pasos y ' + fmt(S.res.costo) + ' ' + S.def.unidad : 'ninguno') + ', ' + S.res.expandidos + ' estados expandidos.');
    }
  }

  function reiniciar() {
    if (!S) return;
    var algo = S.algo;
    abrir(S.def);
    $('capitulo').hidden = true;
    S.algo = algo;
    pintarAlgos();
    planificar();
    $('lienzo').classList.remove('editando');
  }

  function ruta() {
    var id = location.hash.replace('#', '');
    var def = DEFS.filter(function (d) { return d.id === id; })[0];
    if (def && def.vista === 'finanzas') {
      if (S) detener();
      $('hub').hidden = true;
      $('vista').hidden = true;
      $('vistaFin').hidden = false;
      document.title = def.titulo + ' · Cartógrafo';
      window.FinApp.abrir(def);
      window.scrollTo(0, 0);
      return;
    }
    if (def && def.vista === 'cosmetica') {
      if (S) detener();
      window.FinApp.parar();
      $('hub').hidden = true;
      $('vista').hidden = true;
      $('vistaFin').hidden = true;
      $('vistaCos').hidden = false;
      document.title = def.titulo + ' · Cartógrafo';
      window.CosApp.abrir(def);
      window.scrollTo(0, 0);
      return;
    }
    $('vistaCos').hidden = true;
    window.CosApp.parar();
    $('vistaFin').hidden = true;
    window.FinApp.parar();
    if (def) {
      $('hub').hidden = true;
      $('vista').hidden = false;
      document.title = def.titulo + ' · Cartógrafo';
      abrir(def);
      window.scrollTo(0, 0);
    } else {
      if (S) detener();
      $('vista').hidden = true;
      $('hub').hidden = false;
      document.title = 'Cartógrafo · misiones de agentes';
    }
  }

  if (!DEFS.length) {
    document.querySelector('main').textContent = 'No se cargaron los escenarios (escenarios/misiones.js).';
    return;
  }
  pintarHub();
  enlazar();
  $('omni').addEventListener('change', function () { if (S) refrescar(); });
  ruta();
  requestAnimationFrame(bucle);
})();
