/*
 * Vista de la misión financiera. El núcleo está en finanzas.js; aquí solo se
 * muestra y se narra lo que el agente calculó y lo que el azar trajo.
 */
(function () {
  'use strict';

  var F = window.Finanzas;
  var NOMBRE = { bfs: 'BFS', dfs: 'DFS', ucs: 'Costo uniforme', astar: 'A*' };
  var POL = ['planificador', 'avalancha', 'bola', 'fondo'];
  var POL_CORTO = { planificador: 'Planificador', avalancha: 'Avalancha', bola: 'Bola de nieve', fondo: 'Fondo primero' };
  var CLAVE = 'cartografo.misiones.bitacora';
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function plata(x) { return x.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' M'; }
  function ent(x) { return x + ' M'; }

  var S = null;
  var timer = null;

  function abrir(def) {
    S = {
      def: def,
      params: Object.assign({}, def.valores),
      politica: 'planificador',
      algo: def.sugerido || 'astar',
      semilla: 1
    };
    $('fEyebrow').textContent = 'Reto ' + def.reto + ' · ' + def.lugar;
    $('fTitulo').textContent = def.titulo;
    var chips = $('fChips');
    chips.textContent = '';
    chips.appendChild(el('span', 'chip', def.concepto));
    chips.appendChild(el('span', 'chip suave', def.dificultad));
    pintarMision();
    pintarControles();
    reiniciar();
    abrirTab('mision');
    capitulo();
  }

  function modelo() { return F.modelo(S.def, S.params); }

  function reiniciar() {
    parar();
    S.M = modelo();
    S.s = S.M.inicial.slice();
    S.mes = 0;
    S.rng = window.Azar.crear(S.semilla);
    S.historia = [{ mes: 0, s: S.s.slice(), accion: null, choque: null }];
    S.intereses = 0;
    S.choques = 0;
    S.nueva = 0;
    S.fin = false;
    S.decidir = F.politica(S.M, S.politica, S.algo);
    $('fLog').textContent = '';
    $('fFinal').hidden = true;
    $('fSub').hidden = true;
    planHoy();
    pintar();
  }

  // ---------- el mes ----------

  function planHoy() {
    S.plan = F.resolver(S.M, S.s, S.algo);
    S.alternativas = [];
    if (S.politica !== 'planificador' || F.esMeta(S.M, S.s)) return;
    var c = F.costoMes(S.M, S.s);
    F.acciones(S.M, S.s).forEach(function (a) {
      var r = F.resolver(S.M, F.aplicar(S.M, S.s, a), S.algo === 'dfs' || S.algo === 'bfs' ? 'astar' : S.algo);
      if (r.encontrado) S.alternativas.push({ a: a, costo: c + r.costo, meses: r.pasos + 1 });
    });
    S.alternativas.sort(function (x, y) { return x.costo - y.costo; });
  }

  function mesNombre(m) {
    var nombres = S.def.relato.meses;
    var anio = Math.floor((m - 1) / 12);
    return nombres[(m - 1) % 12] + (anio ? ' (año ' + (anio + 1) + ')' : '');
  }

  function reparto(a) {
    var partes = [];
    a.forEach(function (v, i) { if (v) partes.push(v + ' M → ' + S.M.cuentas[i].corto); });
    return partes.join(' · ') || 'nada que repartir';
  }

  function siguienteMes() {
    if (S.fin) return;
    if (F.esMeta(S.M, S.s)) { terminar(); return; }
    var M = S.M;
    var a = S.decidir(S.s);
    var interes = F.interes(M, S.s);
    S.intereses += interes;
    var antes = S.s.slice();
    S.s = F.aplicar(M, S.s, a);
    S.mes += 1;
    var ch = F.choque(M, S.s, S.rng);
    var R = S.def.relato;
    var nombre = mesNombre(S.mes);
    contar(nombre + '. ' + (S.politica === 'planificador' ? 'El asesor reparte: ' : 'Regla de ' + POL_CORTO[S.politica].toLowerCase() + ': ') + reparto(a) + '. Intereses del mes: ' + plata(interes) + '.', 'decide');
    if (ch) {
      S.choques += 1;
      S.s = ch.s;
      var txt = nombre + ': ' + ch.texto.toLowerCase() + ' (' + ent(ch.monto) + '). ';
      if (ch.cubre) txt += R.cubre.replace('{cubre}', ch.cubre) + ' ';
      ch.nueva.forEach(function (x) {
        S.nueva += x.monto;
        S.intereses += x.comision;
        txt += R.desborda.replace('{falta}', x.monto).replace('{cuenta}', M.cuentas[x.cuenta].nombre.toLowerCase()) + (x.comision ? ' Comisión: ' + plata(x.comision) + '.' : '');
      });
      contar(txt, ch.cubre === ch.monto ? 'bueno' : 'malo');
      subtitulo(txt);
    } else {
      var t = R.tranquilo[S.mes % R.tranquilo.length];
      contar(t, null);
      subtitulo(nombre + '. ' + t);
    }
    S.historia.push({ mes: S.mes, s: S.s.slice(), antes: antes, accion: a, choque: ch, interes: interes });
    if (F.esMeta(M, S.s)) { terminar(); return; }
    if (S.mes >= S.def.horizonte) { terminar(); return; }
    planHoy();
    pintar();
  }

  function terminar() {
    parar();
    S.fin = true;
    planHoy();
    pintar();
    var libre = F.esMeta(S.M, S.s);
    var f = $('fFinal');
    f.textContent = '';
    f.classList.toggle('malo', !libre);
    f.appendChild(el('p', 'eyebrow', libre ? 'Libre de deudas en ' + S.mes + ' meses' : 'Se acabó el plazo'));
    f.appendChild(el('h3', null, plata(S.intereses) + ' en intereses'));
    f.appendChild(el('p', null, POL_CORTO[S.politica] + (S.politica === 'planificador' ? ' (' + NOMBRE[S.algo] + ')' : '') + ' · realidad #' + S.semilla + ' · ' + S.choques + ' imprevistos · ' + ent(S.nueva) + ' de deuda nueva'));
    var fila = el('div', 'fila-btn');
    var b1 = el('button', 'b-pri', 'Comparar en 300 realidades');
    b1.type = 'button';
    b1.addEventListener('click', function () { f.hidden = true; abrirTab('comparar'); montecarlo(); });
    var b2 = el('button', 'b-sec', 'Otra realidad');
    b2.type = 'button';
    b2.addEventListener('click', function () { otraRealidad(); });
    var b3 = el('button', 'b-sec', 'Cerrar');
    b3.type = 'button';
    b3.addEventListener('click', function () { f.hidden = true; });
    fila.appendChild(b1); fila.appendChild(b2); fila.appendChild(b3);
    f.appendChild(fila);
    f.hidden = false;
    if (libre) subtitulo(S.def.relato.libre);
    guardar({ tipo: 'finanzas', algo: S.politica === 'planificador' ? S.algo : 'astar', costo: Math.round(S.intereses * 100) / 100, pasos: S.mes, expandidos: S.plan.expandidos, replanes: S.mes, unidad: 'M', resultado: POL_CORTO[S.politica] + ', realidad ' + S.semilla });
  }

  function jugar() {
    if (timer) { parar(); return; }
    if (S.fin) reiniciar();
    $('fJugar').textContent = 'Pausar';
    $('fCapitulo').hidden = true;
    if (S.mes === 0) S.def.relato.inicio.forEach(function (t) { contar(t, 'relato'); });
    var vel = Number($('fVel').value);
    var paso = function () {
      siguienteMes();
      if (S.fin) { parar(); return; }
      timer = setTimeout(paso, reducido ? 0 : [0, 2200, 1500, 1000, 600, 260][vel]);
    };
    timer = setTimeout(paso, 300);
  }

  function parar() {
    if (timer) clearTimeout(timer);
    timer = null;
    var b = $('fJugar');
    if (b) b.textContent = 'Simular hasta el final';
  }

  function otraRealidad() {
    S.semilla = 1 + Math.floor(Math.random() * 300);
    reiniciar();
    pintarControles();
    contar('Realidad #' + S.semilla + ': otros imprevistos, mismas reglas.', null);
  }

  // ---------- dibujo ----------

  function pintar() {
    pintarCuentas();
    pintarGrafica();
    pintarDecision();
    pintarKpis();
    pintarAgente();
    var tabComo = document.querySelector('.ftab[data-panel=como]');
    if (tabComo && !tabComo.hidden && !timer) pintarComo();
  }

  function pintarCuentas() {
    var box = $('fCuentas');
    box.textContent = '';
    var prev = S.historia.length > 1 ? S.historia[S.historia.length - 2].s : null;
    S.M.cuentas.forEach(function (c, i) {
      var card = el('div', 'cuenta' + (c.tipo === 'ahorro' ? ' ahorro' : ''));
      card.style.setProperty('--c', c.color);
      var top = el('div', 'cuenta-top');
      top.appendChild(el('span', null, c.nombre));
      top.appendChild(el('small', null, c.tipo === 'ahorro' ? 'meta ' + ent(c.meta) : (c.tasa * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' % mes'));
      card.appendChild(top);
      var v = el('strong', null, ent(S.s[i]));
      if (prev && prev[i] !== S.s[i]) {
        var d = S.s[i] - prev[i];
        var chip = el('em', (c.tipo === 'ahorro' ? d > 0 : d < 0) ? 'bien' : 'mal', (d > 0 ? '+' : '') + d);
        v.appendChild(chip);
      }
      card.appendChild(v);
      var barra = el('i');
      var lleno = el('b');
      var ref = c.tipo === 'ahorro' ? c.meta : Math.max(c.max, c.saldo);
      lleno.style.width = Math.min(100, 100 * S.s[i] / ref) + '%';
      barra.appendChild(lleno);
      card.appendChild(barra);
      box.appendChild(card);
    });
  }

  function pintarGrafica() {
    var cv = $('fGrafica');
    var dpr = window.devicePixelRatio || 1;
    var W = cv.clientWidth || 800;
    var H = 260;
    cv.width = W * dpr;
    cv.height = H * dpr;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var M = S.M;
    var futuro = S.plan && S.plan.encontrado ? S.plan.estados.slice(1) : [];
    var total = Math.max(12, S.historia.length + futuro.length);
    var izq = 38;
    var der = 12;
    var base = 170;
    var ancho = (W - izq - der) / total;
    var maxDeuda = 0;
    M.cuentas.forEach(function (c) { if (c.tipo === 'deuda') maxDeuda += c.max; });
    maxDeuda = Math.max(10, Math.min(maxDeuda, 26));
    var escala = (base - 30) / maxDeuda;
    var escalaF = 60 / Math.max(1, M.cuentas[M.fondo].meta);
    // ejes
    ctx.strokeStyle = 'rgba(15,23,42,0.15)';
    ctx.lineWidth = 1;
    for (var y = 0; y <= maxDeuda; y += 5) {
      ctx.beginPath(); ctx.moveTo(izq, base - y * escala); ctx.lineTo(W - der, base - y * escala); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'right';
      ctx.fillText(y + ' M', izq - 6, base - y * escala + 3);
    }
    ctx.strokeStyle = '#0f172a'; ctx.beginPath(); ctx.moveTo(izq, base); ctx.lineTo(W - der, base); ctx.stroke();
    ctx.fillStyle = '#16a34a'; ctx.textAlign = 'right'; ctx.fillText('fondo', izq - 6, base + 22);

    function barra(i, s, fantasma) {
      var x = izq + i * ancho + ancho * 0.15;
      var w = ancho * 0.7;
      var yy = base;
      ctx.save();
      if (fantasma) ctx.globalAlpha = 0.28;
      M.cuentas.forEach(function (c, k) {
        if (c.tipo !== 'deuda' || !s[k]) return;
        var h = s[k] * escala;
        ctx.fillStyle = c.color;
        ctx.fillRect(x, yy - h, w, h);
        yy -= h;
      });
      var fh = s[M.fondo] * escalaF;
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(x, base + 2, w, fh);
      ctx.restore();
      if (fantasma) {
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(15,23,42,0.35)';
        var tot = 0;
        M.cuentas.forEach(function (c, k) { if (c.tipo === 'deuda') tot += s[k]; });
        if (tot) ctx.strokeRect(x, base - tot * escala, w, tot * escala);
        ctx.restore();
      }
    }
    S.historia.forEach(function (h, i) {
      barra(i, h.s, false);
      if (h.choque) {
        var tot = 0;
        M.cuentas.forEach(function (c, k) { if (c.tipo === 'deuda') tot += h.s[k]; });
        var cx = izq + i * ancho + ancho / 2;
        var cy = base - tot * escala - 14;
        ctx.fillStyle = h.choque.cubre === h.choque.monto ? '#16a34a' : '#dc2626';
        ctx.beginPath(); ctx.moveTo(cx - 4, cy - 7); ctx.lineTo(cx + 2, cy - 7); ctx.lineTo(cx - 1, cy - 1); ctx.lineTo(cx + 4, cy - 1); ctx.lineTo(cx - 3, cy + 8); ctx.lineTo(cx - 1, cy + 1); ctx.lineTo(cx - 5, cy + 1); ctx.closePath(); ctx.fill();
      }
    });
    futuro.forEach(function (s, j) { barra(S.historia.length + j, s, true); });
    // mes actual
    var xa = izq + (S.historia.length - 1) * ancho + ancho / 2;
    ctx.strokeStyle = '#0f766e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xa, 10); ctx.lineTo(xa, H - 18); ctx.stroke();
    ctx.fillStyle = '#0f766e'; ctx.font = '600 11px Outfit, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(S.mes === 0 ? 'hoy' : 'mes ' + S.mes, xa, H - 4);
    if (futuro.length) {
      ctx.fillStyle = '#475569'; ctx.textAlign = 'left';
      ctx.fillText('plan sin sorpresas (' + futuro.length + ' meses más)', Math.min(xa + 8, W - 190), 18);
    }
  }

  function pintarDecision() {
    var box = $('fDecision');
    box.textContent = '';
    if (F.esMeta(S.M, S.s)) {
      box.appendChild(el('p', 'eyebrow', 'Meta cumplida'));
      box.appendChild(el('h3', null, 'Sin deudas y con el fondo lleno.'));
      return;
    }
    var a = S.decidir(S.s);
    box.appendChild(el('p', 'eyebrow', (S.mes === 0 ? 'Primer mes' : 'Mes ' + (S.mes + 1)) + ' · ' + POL_CORTO[S.politica] + (S.politica === 'planificador' ? ' con ' + NOMBRE[S.algo] : '')));
    var fila = el('div', 'reparto');
    a.forEach(function (v, i) {
      if (!v) return;
      var chip = el('span', null, v + ' M → ' + S.M.cuentas[i].corto);
      chip.style.setProperty('--c', S.M.cuentas[i].color);
      fila.appendChild(chip);
    });
    box.appendChild(fila);
    if (S.politica === 'planificador' && S.alternativas.length) {
      box.appendChild(el('p', 'por-que', 'Por qué: comparó ' + S.alternativas.length + ' repartos posibles. Cada número es el costo total del mejor plan que empieza así (intereses' + (S.M.riesgo ? ' + prudencia' : '') + ').'));
      var lista = el('ol', 'alternativas');
      S.alternativas.slice(0, 4).forEach(function (alt, k) {
        var li = el('li', k === 0 ? 'elegida' : null);
        li.appendChild(el('span', null, reparto(alt.a)));
        li.appendChild(el('b', null, plata(alt.costo)));
        lista.appendChild(li);
      });
      box.appendChild(lista);
    } else if (S.politica !== 'planificador') {
      var reglas = {
        avalancha: 'No busca: aplica una regla. Todo a la deuda con la tasa más alta; el fondo, al final.',
        bola: 'No busca: aplica una regla. Todo a la deuda más pequeña, para cerrar cuentas rápido; el fondo, al final.',
        fondo: 'No busca: aplica una regla. Primero llena el fondo de emergencia; después, la deuda más cara.'
      };
      box.appendChild(el('p', 'por-que', reglas[S.politica]));
    }
  }

  function pintarKpis() {
    var deuda = 0;
    S.M.cuentas.forEach(function (c, i) { if (c.tipo === 'deuda') deuda += S.s[i]; });
    $('fkMes').textContent = S.mes ? mesNombre(S.mes) : 'Enero';
    $('fkInt').textContent = plata(S.intereses);
    $('fkDeuda').textContent = ent(deuda);
    $('fkFondo').textContent = ent(S.s[S.M.fondo]) + ' / ' + ent(S.M.cuentas[S.M.fondo].meta);
    $('fkCh').textContent = String(S.choques) + (S.nueva ? ' · +' + S.nueva + ' M deuda' : '');
    $('fPlanTxt').textContent = S.plan.encontrado
      ? NOMBRE[S.algo] + ' calcula desde aquí un plan de ' + S.plan.pasos + ' meses con ' + plata(S.plan.costo) + ' de costo, expandiendo ' + S.plan.expandidos + ' estados en ' + (S.plan.tiempo < 1 ? '<1' : Math.round(S.plan.tiempo)) + ' ms. Las barras claras son ese plan. Las sólidas son lo que de verdad pasó: cada rayo es un imprevisto (verde si el fondo lo cubrió, rojo si se volvió deuda).'
      : 'Ya no hay nada que planear.';
  }

  function pintarAgente() {
    var M = S.M;
    $('fTupla').textContent = 's = (' + M.cuentas.map(function (c, i) { return c.corto.toLowerCase().replace(/ /g, '_') + ' ' + S.s[i]; }).join(', ') + ')';
    var ult = S.historia[S.historia.length - 1];
    var textos = {
      percibe: 'Saldos: ' + M.cuentas.map(function (c, i) { return c.corto + ' ' + ent(S.s[i]); }).join(', ') + '. ' + (ult.choque ? 'El mes pasado hubo un imprevisto de ' + ent(ult.choque.monto) + '.' : 'El mes pasado fue tranquilo.'),
      recuerda: 'No necesita más memoria que los saldos: el estado resume toda la historia.',
      decide: S.politica === 'planificador'
        ? NOMBRE[S.algo] + ' sobre un modelo sin sorpresas, con prudencia ' + M.riesgo + '. Replanifica cada mes con los saldos reales.'
        : 'Regla fija: ' + F.POLITICAS[S.politica].toLowerCase() + '.',
      actua: F.esMeta(M, S.s) ? 'Nada: meta cumplida.' : 'Reparte ' + reparto(S.decidir(S.s)) + '.'
    };
    Array.prototype.forEach.call(document.querySelectorAll('#fCiclo li'), function (li) {
      li.querySelector('span').textContent = textos[li.dataset.fase];
    });
  }

  function contar(texto, tono) {
    var li = el('li', tono || null, texto);
    var ol = $('fLog');
    ol.insertBefore(li, ol.firstChild);
    while (ol.children.length > 80) ol.removeChild(ol.lastChild);
  }

  function subtitulo(t) {
    var sub = $('fSub');
    sub.hidden = false;
    sub.textContent = '';
    var span = el('span', null, t);
    sub.appendChild(span);
    sub.classList.remove('entra');
    void sub.offsetWidth;
    sub.classList.add('entra');
  }

  // ---------- controles ----------

  function pintarControles() {
    var box = $('fParams');
    box.textContent = '';
    S.def.parametros.forEach(function (p) {
      var w = el('div', 'param-op');
      w.title = p.ayuda || '';
      w.appendChild(el('span', null, p.nombre));
      var seg = el('div', 'mini-seg ancho');
      p.opciones.forEach(function (v, i) {
        var b = el('button', null, p.etiquetas[i]);
        b.type = 'button';
        if (S.params[p.id] === v) b.classList.add('on');
        b.addEventListener('click', function () {
          S.params[p.id] = v;
          pintarControles();
          reiniciar();
          contar(p.nombre + ': ' + p.etiquetas[i] + '.', null);
        });
        seg.appendChild(b);
      });
      w.appendChild(seg);
      box.appendChild(w);
    });
    var pol = $('fPol');
    pol.textContent = '';
    POL.forEach(function (k) {
      var b = el('button', S.politica === k ? 'on' : null, POL_CORTO[k]);
      b.type = 'button';
      b.title = F.POLITICAS[k];
      b.addEventListener('click', function () {
        S.politica = k;
        pintarControles();
        reiniciar();
      });
      pol.appendChild(b);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#fAlgos button'), function (b) {
      b.classList.toggle('on', b.dataset.algo === S.algo);
    });
    $('fSemilla').textContent = 'Realidad #' + S.semilla + ' ↻';
  }

  function pintarMision() {
    var d = S.def;
    $('fHistoria').textContent = d.historia;
    $('fObjetivo').textContent = d.objetivo;
    var dl = $('fAgente');
    dl.textContent = '';
    [['Se llama', d.agente.nombre], ['Percibe', d.agente.percibe], ['Recuerda', d.agente.recuerda], ['Puede', d.agente.acciones], ['Termina cuando', d.agente.meta]].forEach(function (par) {
      dl.appendChild(el('dt', null, par[0]));
      dl.appendChild(el('dd', null, par[1]));
    });
    var tb = $('fTasas');
    tb.textContent = '';
    d.cuentas.forEach(function (c) {
      var tr = el('tr');
      tr.appendChild(el('td', null, c.nombre));
      tr.appendChild(el('td', 'num', c.tipo === 'ahorro' ? 'meta ' + ent(c.meta) : (c.tasa * 100).toLocaleString('es-CO') + ' %/mes' + (c.comision ? ' + ' + c.comision * 100 + ' % al prestar' : '')));
      tb.appendChild(tr);
    });
    var ol = $('fPreguntas');
    ol.textContent = '';
    d.preguntas.forEach(function (q) { ol.appendChild(el('li', null, q)); });
  }

  function capitulo() {
    var d = S.def;
    var box = $('fCapitulo');
    box.textContent = '';
    var card = el('div', 'cap-card');
    card.appendChild(el('p', 'eyebrow', 'Reto ' + d.reto + ' · ' + d.lugar));
    card.appendChild(el('h2', null, d.titulo));
    card.appendChild(el('p', 'cap-historia', d.historia));
    var ag = el('div', 'cap-agente');
    ag.appendChild(el('b', null, d.agente.nombre));
    ag.appendChild(el('span', null, d.objetivo));
    card.appendChild(ag);
    var fila = el('div', 'fila-btn');
    var b1 = el('button', 'b-pri', 'Vivir los meses');
    b1.type = 'button';
    b1.addEventListener('click', function () { box.hidden = true; jugar(); });
    var b2 = el('button', 'b-sec', 'Mirar el plan primero');
    b2.type = 'button';
    b2.addEventListener('click', function () { box.hidden = true; });
    fila.appendChild(b1); fila.appendChild(b2);
    card.appendChild(fila);
    box.appendChild(card);
    box.hidden = false;
  }

  // ---------- comparar ----------

  function compararAlgoritmos() {
    var M = modelo();
    var box = $('fAlgTabla');
    box.textContent = '';
    var t = el('table', 'costos realidades');
    var cab = el('tr');
    ['', 'Costo del plan', 'Meses', 'Estados'].forEach(function (h) { cab.appendChild(el('th', null, h)); });
    t.appendChild(cab);
    var R = {};
    ['bfs', 'dfs', 'ucs', 'astar'].forEach(function (a) {
      var r = F.resolver(M, M.inicial, a);
      R[a] = r;
      var tr = el('tr', a === S.algo ? 'actual' : null);
      tr.appendChild(el('td', null, NOMBRE[a]));
      tr.appendChild(el('td', 'num', plata(r.costo)));
      tr.appendChild(el('td', 'num', String(r.pasos)));
      tr.appendChild(el('td', 'num', String(r.expandidos)));
      t.appendChild(tr);
    });
    box.appendChild(t);
    $('fAlgLectura').textContent = 'BFS busca el plan con menos meses: ' + R.bfs.pasos + ' meses pero ' + plata(R.bfs.costo) + '. Costo uniforme y A* buscan el de menor costo: ' + plata(R.ucs.costo) +
      '. A* expande ' + R.astar.expandidos + ' estados frente a ' + R.ucs.expandidos + ': su pista es cuánto costaría pagar la deuda más cara primero si se pudiera abonar en pesos sueltos. DFS toma el primer plan que encuentra.';
  }

  function montecarlo() {
    var box = $('fMcTabla');
    var boton = $('fMcBtn');
    boton.disabled = true;
    box.textContent = '';
    var out = {};
    var i = 0;
    var M = modelo();
    (function sig() {
      if (i >= POL.length) { boton.disabled = false; boton.textContent = 'Volver a simular'; pintarMc(out); return; }
      boton.textContent = 'Simulando ' + POL_CORTO[POL[i]] + '…';
      setTimeout(function () {
        out[POL[i]] = F.montecarlo(M, POL[i], S.algo === 'dfs' ? 'astar' : S.algo, 300);
        i += 1;
        sig();
      }, 20);
    })();
  }

  function pintarMc(out) {
    var box = $('fMcTabla');
    box.textContent = '';
    var mejor = POL.reduce(function (m, k) { return out[k].intereses < out[m].intereses ? k : m; }, POL[0]);
    var maxI = Math.max.apply(null, POL.map(function (k) { return out[k].p90; }));
    POL.forEach(function (k) {
      var r = out[k];
      var fila = el('div', 'cmp' + (k === S.politica ? ' actual' : ''));
      var cab = el('div', 'cmp-cab');
      cab.appendChild(el('b', null, POL_CORTO[k]));
      cab.appendChild(el('span', k === mejor ? 'tag-ok' : 'tag-mal', k === mejor ? 'mejor promedio' : '+' + plata(r.intereses - out[mejor].intereses)));
      fila.appendChild(cab);
      [['Promedio', r.intereses], ['Peor 10 %', r.p90]].forEach(function (m) {
        var l = el('div', 'cmp-l');
        l.appendChild(el('small', null, m[0]));
        var pista = el('span', 'pista costo');
        var bar = el('i');
        bar.style.width = Math.max(2, 100 * m[1] / maxI) + '%';
        pista.appendChild(bar);
        l.appendChild(pista);
        l.appendChild(el('code', null, plata(m[1])));
        fila.appendChild(l);
      });
      var hist = el('div', 'histo');
      var cubos = new Array(16).fill(0);
      r.distribucion.forEach(function (x) { cubos[Math.min(15, Math.floor(x / maxI * 15.99))] += 1; });
      var cmax = Math.max.apply(null, cubos);
      cubos.forEach(function (c) { var b = el('i'); b.style.height = Math.max(1, 100 * c / cmax) + '%'; hist.appendChild(b); });
      fila.appendChild(hist);
      fila.appendChild(el('p', 'cmp-pie', (r.meses ? r.meses.toFixed(1) + ' meses en promedio · ' : '') + Math.round(r.logran * 100) + '% sale de deudas en ' + S.def.horizonte + ' meses · ' + r.nuevaDeuda.toFixed(1) + ' M de deuda nueva por imprevistos'));
      box.appendChild(fila);
    });
    var av = out.avalancha;
    var pl = out.planificador;
    var txt = 'En 300 realidades con imprevistos «' + etiquetaParam('choques') + '», ';
    if (S.params.choques === 0) txt += 'sin sorpresas, la regla avalancha es imbatible: ' + plata(av.intereses) + '. Guardar antes de pagar solo cuesta intereses.';
    else txt += POL_CORTO[mejor].toLowerCase() + ' paga en promedio ' + plata(out[mejor].intereses) + '. Avalancha, la mejor en un mundo sin sorpresas, paga ' + plata(av.intereses) + ' y en el peor 10 % de los casos ' + plata(av.p90) + ': cada imprevisto sin fondo se vuelve gota a gota con comisión. El planificador con prudencia «' + etiquetaParam('riesgo') + '» paga ' + plata(pl.intereses) + '.';
    $('fMcLectura').textContent = txt;
    guardar({ tipo: 'realidades', unidad: 'M', resultados: POL.reduce(function (o, k) { o[k] = { costo: Math.round(out[k].intereses * 100) / 100, pasos: null, expandidos: 0 }; return o; }, {}) });
  }

  function etiquetaParam(id) {
    var p = S.def.parametros.filter(function (x) { return x.id === id; })[0];
    return p.etiquetas[p.opciones.indexOf(S.params[id])];
  }

  function guardar(e) {
    var lista;
    try { lista = JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (x) { lista = []; }
    e.fecha = new Date().toISOString();
    e.mision = S.def.id;
    e.unidad = e.unidad || 'M';
    e.parametros = Object.assign({ politica: S.politica, semilla: S.semilla }, S.params);
    e.cambios = [];
    lista.unshift(e);
    try { localStorage.setItem(CLAVE, JSON.stringify(lista.slice(0, 300))); } catch (x) { /* sin espacio */ }
  }

  function abrirTab(nombre) {
    Array.prototype.forEach.call(document.querySelectorAll('#fTabs [role=tab]'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.tab === nombre));
    });
    Array.prototype.forEach.call(document.querySelectorAll('.ftab'), function (p) {
      p.hidden = p.dataset.panel !== nombre;
    });
    if (nombre === 'comparar') compararAlgoritmos();
    if (nombre === 'como') pintarComo();
  }

  // ---------- cómo busca: la búsqueda de la panadería explicada con sus números ----------

  var LISTA_F = {
    bfs: 'una cola: abre los estados en el orden en que aparecieron, mes por mes. Busca el plan con menos meses y no mira los intereses.',
    dfs: 'una pila: sigue un plan hasta el final antes de probar otro. Se queda con el primero que llega a la meta.',
    ucs: 'una cola de prioridad ordenada por g, lo que ya costaron los meses anteriores. Siempre abre la situación más barata hasta ahora.',
    astar: 'una cola de prioridad ordenada por f = g + h: lo que ya costó más la pista de lo mínimo que falta.'
  };

  function pasoF(box, n, titulo) {
    var card = el('section', 'como-paso');
    var cab = el('div', 'como-cab');
    cab.appendChild(el('span', 'como-num', String(n)));
    cab.appendChild(el('h4', null, titulo));
    card.appendChild(cab);
    box.appendChild(card);
    return card;
  }

  function tuplaF(s) { return '(' + s.join(', ') + ')'; }

  function pintarComo() {
    var box = $('fComo');
    if (!box || !S) return;
    box.textContent = '';
    var M = S.M;
    var s0 = S.s;
    var R = {};
    ['bfs', 'dfs', 'ucs', 'astar'].forEach(function (a) { R[a] = F.resolver(M, s0, a); });
    var r = R[S.algo];
    var total = F.contarEstados(Object.assign({}, M, { inicial: s0 }));
    var nombres = M.cuentas.map(function (c) { return c.corto.toLowerCase(); }).join(', ');

    box.appendChild(el('p', 'sub', 'Aquí no hay mapa: el algoritmo «camina» por combinaciones de saldos. Todo se calcula desde ' + (S.mes ? 'los saldos de este mes' : 'los saldos de hoy') + ' con ' + NOMBRE[S.algo] + '.'));

    var c1 = pasoF(box, 1, 'El estado: cómo está Lucía');
    c1.appendChild(el('p', null, 'El estado son cuatro números: (' + nombres + '). Con ellos el agente sabe todo lo que necesita: no importa cómo llegó ahí, solo dónde está.'));
    var tup = el('div', 'como-tupla');
    tup.appendChild(el('span', null, 'Ahora'));
    tup.appendChild(el('code', null, tuplaF(s0)));
    tup.appendChild(el('span', null, 'Meta'));
    tup.appendChild(el('code', null, '(0, 0, 0, ' + M.cuentas[M.fondo].meta + ')'));
    c1.appendChild(tup);
    c1.appendChild(el('p', 'como-dato', 'Desde aquí se pueden alcanzar ' + total + ' combinaciones de saldos distintas. Ese es el tamaño del problema.'));

    var c2 = pasoF(box, 2, 'Las acciones: cómo repartir el excedente');
    var acc = F.acciones(M, s0);
    c2.appendChild(el('p', null, 'Este mes sobran ' + M.excedente + ' M y se reparten en millones enteros. Hay ' + acc.length + ' maneras de hacerlo; cada una lleva a un estado distinto:'));
    var t2 = el('table', 'costos como-tabla');
    acc.forEach(function (a) {
      var tr = el('tr');
      tr.appendChild(el('td', null, a.map(function (v, i) { return v ? v + ' → ' + M.cuentas[i].corto : null; }).filter(Boolean).join(' · ') || 'nada'));
      tr.appendChild(el('td', 'num', tuplaF(F.aplicar(M, s0, a))));
      t2.appendChild(tr);
    });
    c2.appendChild(t2);

    var c3 = pasoF(box, 3, 'Expandir: abrir una situación y mirar sus siguientes meses');
    c3.appendChild(el('p', null, 'Expandir un estado es preguntarse «¿ya llegué a la meta?» y, si no, generar sus hijos: los estados de todos los repartos posibles del mes siguiente. Así se arma un árbol de «¿qué pasa si…?». ' + NOMBRE[S.algo] + ' usa ' + LISTA_F[S.algo]));
    c3.appendChild(el('p', null, 'Estos fueron los primeros estados que abrió, con lo que ya costaba llegar a cada uno (g):'));
    var ol = el('ol', 'como-orden');
    r.orden.slice(0, 10).forEach(function (o) { ol.appendChild(el('li', null, tuplaF(o.s) + '  ·  g = ' + plata(o.g))); });
    c3.appendChild(ol);
    c3.appendChild(el('p', 'como-dato', 'En total abrió ' + r.expandidos + ' de los ' + total + ' estados, en ' + (r.tiempo < 1 ? 'menos de 1 ms' : Math.round(r.tiempo) + ' ms') + '. Eso es «expandiendo ' + r.expandidos + ' estados».'));

    var c4 = pasoF(box, 4, 'El costo de cada mes');
    var partes = [];
    M.cuentas.forEach(function (c, i) {
      if (c.tipo === 'deuda' && s0[i]) partes.push(s0[i] + ' × ' + (c.tasa * 100).toLocaleString('es-CO') + ' %');
    });
    var falta = F.faltaFondo(M, s0);
    c4.appendChild(el('p', null, 'Quedarse un mes en un estado cuesta los intereses de lo que se debe más la prudencia: ' + M.riesgo + ' por cada millón que le falta al fondo. El plan busca la cadena de meses con la menor suma.'));
    c4.appendChild(el('p', 'como-dato', 'Ahora: intereses ' + (partes.join(' + ') || '0') + ' = ' + plata(F.interes(M, s0)) + (M.riesgo ? '; prudencia ' + M.riesgo + ' × ' + falta + ' M = ' + plata(M.riesgo * falta) : '') + '. Total del mes: ' + plata(F.costoMes(M, s0)) + '.'));

    var c5 = pasoF(box, 5, 'La pista de A*');
    c5.appendChild(el('p', null, 'A* estima lo mínimo que falta pagar: cuántos intereses habría si se abonara siempre a la deuda más cara primero, en pesos sueltos y sin guardar nada en el fondo. Nunca exagera, porque ningún plan real puede pagar menos intereses que ese.'));
    c5.appendChild(el('p', 'como-dato', 'Desde aquí la pista vale h = ' + plata(F.heuristica(M, s0)) + '. El plan óptimo cuesta ' + (R.ucs.encontrado ? plata(R.ucs.costo) : '—') + ': la pista queda por debajo, como debe ser.'));

    var c6 = pasoF(box, 6, 'Lo que encontró cada algoritmo');
    var t6 = el('table', 'costos realidades');
    var cab = el('tr');
    ['', 'Estados abiertos', 'Meses', 'Costo'].forEach(function (h) { cab.appendChild(el('th', null, h)); });
    t6.appendChild(cab);
    ['bfs', 'dfs', 'ucs', 'astar'].forEach(function (a) {
      var tr = el('tr', a === S.algo ? 'actual' : null);
      tr.appendChild(el('td', null, NOMBRE[a]));
      tr.appendChild(el('td', 'num', String(R[a].expandidos)));
      tr.appendChild(el('td', 'num', String(R[a].pasos)));
      tr.appendChild(el('td', 'num', plata(R[a].costo)));
      t6.appendChild(tr);
    });
    c6.appendChild(t6);
    var ul = el('ul', 'como-lista');
    if (R.bfs.pasos === R.ucs.pasos && R.bfs.costo > R.ucs.costo) ul.appendChild(el('li', null, 'Todos los planes duran ' + R.bfs.pasos + ' meses, así que para BFS cualquiera sirve: toma uno sin mirar intereses y paga ' + plata(R.bfs.costo) + '.'));
    else ul.appendChild(el('li', null, 'BFS busca el plan con menos meses (' + R.bfs.pasos + '), no el más barato: paga ' + plata(R.bfs.costo) + '.'));
    ul.appendChild(el('li', null, 'Costo uniforme y A* encuentran el más barato: ' + plata(R.ucs.costo) + '. A* abre ' + R.astar.expandidos + ' estados en vez de ' + R.ucs.expandidos + ' gracias a la pista.'));
    ul.appendChild(el('li', null, 'DFS se queda con el primer plan que llega a la meta: ' + plata(R.dfs.costo) + '.'));
    c6.appendChild(ul);

    var c7 = pasoF(box, 7, 'Del plan a la realidad');
    c7.appendChild(el('p', null, 'El agente calcula el plan completo, pero solo ejecuta el primer mes. Después llega la realidad: puede haber un imprevisto. Con los saldos reales vuelve a buscar. En la gráfica, las barras claras son el plan imaginado y las sólidas lo que de verdad pasó. Por eso la prudencia importa: la búsqueda supone un mundo sin sorpresas y la prudencia le recuerda que no lo es.'));
  }

  // ---------- miniatura para el centro de misiones ----------

  function miniatura(cv, def) {
    var M = F.modelo(def, {});
    var r = F.resolver(M, M.inicial, 'astar');
    var est = r.estados;
    var dpr = window.devicePixelRatio || 1;
    var W = 420;
    var H = 290;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.aspectRatio = W + ' / ' + H;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var ox = 70;
    var oy = 210;
    var paso = 30;
    est.forEach(function (s, i) {
      var x = ox + i * paso;
      var y = oy - i * 9;
      var z = 0;
      M.cuentas.forEach(function (c, k) {
        if (c.tipo !== 'deuda' || !s[k]) return;
        var h = s[k] * 7;
        prisma(ctx, x, y - z, 20, h, c.color);
        z += h;
      });
      if (s[M.fondo]) prisma(ctx, x + 6, y + 18, 14, s[M.fondo] * 7, '#16a34a');
    });
  }

  function prisma(ctx, x, y, w, h, color) {
    var d = w * 0.5;
    ctx.fillStyle = color;
    ctx.fillRect(x, y - h, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.5); ctx.lineTo(x + w + d, y - h - d * 0.5); ctx.lineTo(x + w, y - h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + d, y - h - d * 0.5); ctx.lineTo(x + w + d, y - h - d * 0.5); ctx.lineTo(x + w, y - h); ctx.closePath(); ctx.fill();
  }

  // ---------- eventos ----------

  function enlazar() {
    $('fVolver').addEventListener('click', function () { parar(); location.hash = ''; });
    $('fMes').addEventListener('click', function () { parar(); $('fCapitulo').hidden = true; if (S.fin) reiniciar(); else siguienteMes(); });
    $('fJugar').addEventListener('click', jugar);
    $('fReiniciar').addEventListener('click', function () { reiniciar(); });
    $('fSemilla').addEventListener('click', otraRealidad);
    $('fMcBtn').addEventListener('click', montecarlo);
    Array.prototype.forEach.call(document.querySelectorAll('#fAlgos button'), function (b) {
      b.addEventListener('click', function () { S.algo = b.dataset.algo; pintarControles(); reiniciar(); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#fTabs [role=tab]'), function (b) {
      b.addEventListener('click', function () { abrirTab(b.dataset.tab); });
    });
    window.addEventListener('resize', function () { if (S && !$('vistaFin').hidden) pintarGrafica(); });
  }

  enlazar();
  window.FinApp = { abrir: abrir, parar: function () { if (S) parar(); }, miniatura: miniatura };
})();
