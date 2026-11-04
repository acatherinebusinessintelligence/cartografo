/*
 * Dibujo isométrico de las misiones. Todo sale de código: no hay imágenes.
 * La escena lee el mismo mundo que resuelve el núcleo; lo que se ve es el
 * modelo, no un fondo decorativo.
 */
(function (root) {
  'use strict';

  var TW = 64;
  var TH = 32;
  var ALTO = 132;
  var LOSA = 22;
  var MARGEN = 18;

  var TEMAS = {
    casa: { alto: 56, fondo: ['#d4ece8', '#9ccac3'], losa: ['#f4efe6', '#d8cdbc', '#c4b7a3'], calor: [20, 184, 166], ruta: '#f59e0b', noche: false },
    almacen: { alto: 60, fondo: ['#ebe7de', '#c7bfae'], losa: ['#e4e1da', '#b9b4a8', '#a19b8e'], calor: [37, 99, 235], ruta: '#f59e0b', noche: false },
    ciudad: { alto: 96, fondo: ['#24344a', '#0d1520'], losa: ['#47505c', '#2e353f', '#232931'], calor: [56, 189, 248], ruta: '#facc15', noche: true },
    finca: { alto: 60, fondo: ['#e6f2d5', '#a9cf8a'], losa: ['#8f6a43', '#6e4f30', '#5a3f25'], calor: [99, 102, 241], ruta: '#ef4444', noche: false }
  };

  var SUELO = {
    piso: '#d6ad7c', baldosa: '#eceee8', alfombra: '#c4675a', puerta: '#cfa271', base: '#d6ad7c',
    muro: '#efe7da',
    cargador: '#d5d7d2', despacho: '#d5d7d2', estante: '#c9cbc5',
    calle: '#5b626d', avenida: '#3e444d', urgencias: '#e7e4de', base_amb: '#c4c8cf',
    edificio: '#a9a49a', hospital: '#d5d2cb', parque: '#6fa35a',
    camino: '#cba56d', cultivo: '#6a963f', patio: '#b88c58', rio: '#3b8bbd', puente: '#8a5a33',
    barro: '#7a5233', arbol: '#4c7a33', granero: '#b88c58'
  };

  function hash(n) {
    var x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }

  function tono(hex, f) {
    var v = parseInt(hex.slice(1), 16);
    var r = (v >> 16) & 255;
    var g = (v >> 8) & 255;
    var b = v & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
  }

  function Escena(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mundo = null;
  }

  Escena.prototype.ajustar = function (mundo, escala) {
    this.mundo = mundo;
    this.tema = mundo.def.escena || TEMAS[mundo.def.tema] || TEMAS.casa;
    var f = mundo.filas;
    var c = mundo.cols;
    this.ox = MARGEN + f * TW / 2;
    var alto = this.tema.alto || ALTO;
    this.oy = MARGEN + alto;
    this.ancho = (f + c) * TW / 2 + MARGEN * 2;
    this.alto = (f + c) * TH / 2 + alto + LOSA + MARGEN * 2;
    var dpr = (root.devicePixelRatio || 1) * (escala || 1);
    this.dpr = dpr;
    this.canvas.width = Math.round(this.ancho * dpr);
    this.canvas.height = Math.round(this.alto * dpr);
    this.canvas.style.aspectRatio = this.ancho + ' / ' + this.alto;
    this.puertaEje = {};
  };

  // punto del plano (fila, columna) a una altura z
  Escena.prototype.P = function (r, c, z) {
    return [this.ox + (c - r) * TW / 2, this.oy + (c + r) * TH / 2 - (z || 0)];
  };

  Escena.prototype.centro = function (id, z) {
    var cols = this.mundo.cols;
    return this.P(Math.floor(id / cols) + 0.5, (id % cols) + 0.5, z);
  };

  Escena.prototype.celdaEn = function (clientX, clientY) {
    if (!this.mundo) return -1;
    var rect = this.canvas.getBoundingClientRect();
    var x = (clientX - rect.left) * this.ancho / rect.width - this.ox;
    var y = (clientY - rect.top) * this.alto / rect.height - this.oy;
    var c = Math.floor((x / (TW / 2) + y / (TH / 2)) / 2);
    var r = Math.floor((y / (TH / 2) - x / (TW / 2)) / 2);
    if (r < 0 || c < 0 || r >= this.mundo.filas || c >= this.mundo.cols) return -1;
    return r * this.mundo.cols + c;
  };

  Escena.prototype.poli = function (pts, fill, stroke, lw) {
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
  };

  // prisma dentro de la celda: u = columna local, v = fila local
  Escena.prototype.prisma = function (r, c, u0, v0, u1, v1, z0, z1, color, opc) {
    var P = this.P.bind(this);
    var top = opc && opc.top ? opc.top : color;
    var izq = opc && opc.izq ? opc.izq : tono(color, -0.14);
    var der = opc && opc.der ? opc.der : tono(color, -0.28);
    var linea = opc && opc.linea;
    this.poli([P(r + v1, c + u0, z0), P(r + v1, c + u1, z0), P(r + v1, c + u1, z1), P(r + v1, c + u0, z1)], izq, linea, 0.6);
    this.poli([P(r + v0, c + u1, z0), P(r + v1, c + u1, z0), P(r + v1, c + u1, z1), P(r + v0, c + u1, z1)], der, linea, 0.6);
    this.poli([P(r + v0, c + u0, z1), P(r + v0, c + u1, z1), P(r + v1, c + u1, z1), P(r + v1, c + u0, z1)], top, linea, 0.6);
  };

  Escena.prototype.rombo = function (r, c, ins, z) {
    var a = ins || 0;
    var P = this.P.bind(this);
    return [P(r + a, c + a, z), P(r + a, c + 1 - a, z), P(r + 1 - a, c + 1 - a, z), P(r + 1 - a, c + a, z)];
  };

  Escena.prototype.elipse = function (x, y, rx, ry, fill, stroke) {
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  };

  Escena.prototype.kind = function (id) { return this.mundo.celdas[id]; };

  Escena.prototype.sueloDe = function (id) {
    var mov = this.mundo.debajo[id];
    if (mov) return mov;
    var k = this.kind(id);
    var t = this.mundo.def.tipos[k];
    return t.suelo || k;
  };

  Escena.prototype.vecino = function (id, dr, dc) {
    var m = this.mundo;
    var r = Math.floor(id / m.cols) + dr;
    var c = (id % m.cols) + dc;
    if (r < 0 || c < 0 || r >= m.filas || c >= m.cols) return null;
    return m.celdas[r * m.cols + c];
  };

  // ---------- dibujo principal ----------

  Escena.prototype.dibujar = function (est) {
    var ctx = this.ctx;
    var m = this.mundo;
    var tema = this.tema;
    this.t = est.t || 0;
    this.quieto = !!est.quieto;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.ancho, this.alto);

    // losa del tablero
    var P = this.P.bind(this);
    var f = m.filas;
    var c = m.cols;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.28)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 14;
    this.poli([P(f, 0, 0), P(f, c, 0), P(f, c, -LOSA), P(f, 0, -LOSA)], tema.losa[1]);
    ctx.restore();
    this.poli([P(f, 0, 0), P(f, c, 0), P(f, c, -LOSA), P(f, 0, -LOSA)], tema.losa[1]);
    this.poli([P(0, c, 0), P(f, c, 0), P(f, c, -LOSA), P(0, c, -LOSA)], tema.losa[2]);

    var n = f * c;
    var hechos = est.hechos || 0;
    var objPorCelda = {};
    (est.objetivos || []).forEach(function (o) { objPorCelda[o.celda] = o; });
    this.objPorCelda = objPorCelda;
    this.hechos = hechos;
    this.entregados = est.entregados || 0;
    this.lleva = est.lleva || [];
    this.luz = est.luz || null;
    this.abierta = est.abierta || null;
    this.rastro = est.rastro || null;
    this.conectadas = est.conectadas || null;
    this.omnisciente = !!est.omnisciente;
    this.bateria = est.bateria;
    this.vitrinas = est.vitrinas || null;
    this.ordenVitrina = est.ordenVitrina || null;

    for (var id = 0; id < n; id += 1) this.suelo(id);

    // calor de la búsqueda
    if (est.calor && est.calorMax) {
      var rgb = tema.calor;
      for (var j = 0; j < n; j += 1) {
        var v = est.calor[j];
        if (!v) continue;
        var a = 0.18 + 0.55 * Math.min(1, v / est.calorMax);
        var rr = Math.floor(j / c);
        var cc = j % c;
        this.poli(this.rombo(rr, cc, 0.04, 0.5), 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a.toFixed(3) + ')');
        if (est.numeros && v > 1) {
          var pc = this.centro(j, 1);
          ctx.font = '600 11px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = tema.noche ? '#f8fafc' : '#0f172a';
          ctx.fillText(String(v), pc[0], pc[1]);
        }
      }
      if (est.foco != null && est.foco >= 0) {
        var fr = Math.floor(est.foco / c);
        var fc = est.foco % c;
        this.poli(this.rombo(fr, fc, 0.02, 1), null, '#ffffff', 2.5);
      }
    }

    if (est.hover != null && est.hover >= 0) {
      var hr = Math.floor(est.hover / c);
      var hc = est.hover % c;
      this.poli(this.rombo(hr, hc, 0.03, 1), 'rgba(255,255,255,0.18)', est.hoverOk === false ? '#ef4444' : '#ffffff', 2);
    }

    if (est.ruta && est.ruta.length > 1) this.ruta(est.ruta, est.rutaDesde || 0);
    if (est.ruta2 && est.ruta2.length > 1) this.ruta(est.ruta2, est.rutaDesde || 0, tema.ruta2);

    // objetos y agente por profundidad
    var cola = [];
    for (var k = 0; k < n; k += 1) cola.push({ d: Math.floor(k / c) + (k % c), id: k });
    if (est.agente) {
      var ag = est.agente;
      cola.push({ d: ag.r + ag.c + 0.02, agente: ag });
    }
    if (est.agente2) cola.push({ d: est.agente2.r + est.agente2.c + 0.02, agente: est.agente2 });
    cola.sort(function (x, y) { return x.d - y.d || (x.agente ? 1 : 0) - (y.agente ? 1 : 0); });
    for (var q = 0; q < cola.length; q += 1) {
      if (cola[q].agente) this.agente(cola[q].agente);
      else this.objeto(cola[q].id);
    }
    if (est.agente) {
      ctx.save();
      ctx.globalAlpha = 0.42;
      this.agente(est.agente);
      if (est.agente2) this.agente(est.agente2);
      ctx.restore();
    }

    this.rotulos(est);
    if (tema.noche) this.lluviaNoche(est);
    if (est.lluvia) this.lluvia();
  };

  Escena.prototype.suelo = function (id) {
    var m = this.mundo;
    var r = Math.floor(id / m.cols);
    var c = id % m.cols;
    var s = this.sueloDe(id);
    var k = this.kind(id);
    var ts = this.mundo.def.tipos[s];
    if (ts && ts.piso) { this.sueloGenerico(id, r, c, ts); return; }
    var color = SUELO[s] || '#cccccc';
    var rombo = this.rombo(r, c, 0, 0);
    this.poli(rombo, color, 'rgba(0,0,0,0.08)', 1);
    var ctx = this.ctx;
    var P = this.P.bind(this);
    var h = hash(id);

    if (s === 'piso' || s === 'puerta' || s === 'base') {
      ctx.strokeStyle = 'rgba(120,80,40,0.18)';
      ctx.lineWidth = 1;
      for (var i = 1; i < 3; i += 1) {
        var a = P(r + i / 3, c, 0);
        var b = P(r + i / 3, c + 1, 0);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
    } else if (s === 'baldosa') {
      this.poli([P(r, c, 0), P(r, c + 0.5, 0), P(r + 0.5, c + 0.5, 0), P(r + 0.5, c, 0)], '#dfe3dc');
      this.poli([P(r + 0.5, c + 0.5, 0), P(r + 0.5, c + 1, 0), P(r + 1, c + 1, 0), P(r + 1, c + 0.5, 0)], '#dfe3dc');
    } else if (s === 'alfombra') {
      this.poli(this.rombo(r, c, 0.12, 0), null, 'rgba(255,230,200,0.35)', 1.2);
    } else if (s === 'calle' || s === 'avenida') {
      var horiz = this.esVia(this.vecino(id, 0, 1)) || this.esVia(this.vecino(id, 0, -1));
      var vert = this.esVia(this.vecino(id, 1, 0)) || this.esVia(this.vecino(id, -1, 0));
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = s === 'avenida' ? 'rgba(250,204,21,0.75)' : 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.4;
      if (horiz && !vert) {
        var a1 = P(r + 0.5, c, 0); var b1 = P(r + 0.5, c + 1, 0);
        ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(b1[0], b1[1]); ctx.stroke();
      } else if (vert && !horiz) {
        var a2 = P(r, c + 0.5, 0); var b2 = P(r + 1, c + 0.5, 0);
        ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
      }
      ctx.restore();
    } else if (s === 'edificio' || s === 'hospital') {
      this.poli(this.rombo(r, c, 0, 0), '#9a958b');
    } else if (s === 'cultivo') {
      var plaga = k === 'plaga' || k === 'plaga_urgente';
      var o = this.objPorCelda[id];
      var sana = !plaga || (o && (this.hechos >> o.indice) & 1);
      var verde = sana ? '#3f7d2a' : (k === 'plaga_urgente' ? '#a3562a' : '#b39b3a');
      for (var fila = 0; fila < 3; fila += 1) {
        for (var col = 0; col < 4; col += 1) {
          var pt = P(r + 0.2 + fila * 0.3, c + 0.14 + col * 0.24, 0);
          this.elipse(pt[0], pt[1] - 2, 3.4, 2.6, verde);
          this.elipse(pt[0] - 0.5, pt[1] - 3, 1.6, 1.2, sana ? '#7fbf4d' : '#e3c766');
        }
      }
    } else if (s === 'rio') {
      var t = this.quieto ? 0 : this.t / 900;
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.2;
      for (var w = 0; w < 2; w += 1) {
        var off = ((h + w * 0.5 + t) % 1);
        var w1 = P(r + off, c + 0.25, 0);
        var w2 = P(r + off, c + 0.6, 0);
        ctx.beginPath(); ctx.moveTo(w1[0], w1[1]); ctx.lineTo(w2[0], w2[1]); ctx.stroke();
      }
    } else if (s === 'camino' || s === 'patio') {
      for (var g = 0; g < 4; g += 1) {
        var pp = P(r + hash(id * 7 + g), c + hash(id * 13 + g), 0);
        this.elipse(pp[0], pp[1], 1.5, 1, 'rgba(90,60,30,0.3)');
      }
    } else if (s === 'parque' || s === 'arbol') {
      for (var gg = 0; gg < 3; gg += 1) {
        var pq = P(r + hash(id * 5 + gg), c + hash(id * 11 + gg), 0);
        this.elipse(pq[0], pq[1], 2, 1.3, 'rgba(30,70,20,0.35)');
      }
    }

    if (k === 'barro') {
      this.elipse.apply(this, this.centro(id, 0).concat([16, 7, '#5e3d24']));
      var cb = this.centro(id, 0);
      this.elipse(cb[0] + 8, cb[1] + 3, 6, 3, '#4d311c');
    } else if (k === 'despacho') {
      ctx.save();
      this.poli(rombo, null);
      ctx.clip();
      for (var sx = -2; sx < 6; sx += 1) {
        this.poli([P(r, c + sx * 0.25, 0), P(r, c + sx * 0.25 + 0.125, 0), P(r + 1, c + sx * 0.25 + 0.125 - 0.6, 0), P(r + 1, c + sx * 0.25 - 0.6, 0)], '#facc15');
      }
      ctx.restore();
      this.poli(this.rombo(r, c, 0.16, 0), '#e7e5df', '#1f2937', 1.2);
    } else if (k === 'cargador' || k === 'base') {
      this.poli(this.rombo(r, c, 0.14, 0), '#26302f', null);
      var pulso = this.quieto ? 0.6 : 0.5 + 0.5 * Math.sin(this.t / 400);
      this.poli(this.rombo(r, c, 0.2, 0.2), null, 'rgba(45,212,191,' + (0.4 + 0.5 * pulso).toFixed(2) + ')', 2);
    } else if (k === 'urgencias') {
      var cu = this.centro(id, 0);
      this.poli([P(r + 0.4, c + 0.15, 0), P(r + 0.4, c + 0.85, 0), P(r + 0.6, c + 0.85, 0), P(r + 0.6, c + 0.15, 0)], '#dc2626');
      this.poli([P(r + 0.15, c + 0.4, 0), P(r + 0.15, c + 0.6, 0), P(r + 0.85, c + 0.6, 0), P(r + 0.85, c + 0.4, 0)], '#dc2626');
      void cu;
    } else if (k === 'base_amb') {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.4;
      var e1 = P(r + 0.15, c + 0.2, 0); var e2 = P(r + 0.85, c + 0.2, 0);
      var e3 = P(r + 0.15, c + 0.8, 0); var e4 = P(r + 0.85, c + 0.8, 0);
      ctx.beginPath(); ctx.moveTo(e1[0], e1[1]); ctx.lineTo(e2[0], e2[1]); ctx.moveTo(e3[0], e3[1]); ctx.lineTo(e4[0], e4[1]); ctx.stroke();
    } else if (k === 'puente') {
      ctx.strokeStyle = 'rgba(40,20,5,0.4)';
      ctx.lineWidth = 1;
      for (var pl = 1; pl < 5; pl += 1) {
        var q1 = P(r, c + pl / 5, 0); var q2 = P(r + 1, c + pl / 5, 0);
        ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke();
      }
    }
  };

  Escena.prototype.esVia = function (k) {
    return k === 'calle' || k === 'avenida' || k === 'trancon' || k === 'trancon_av' || k === 'cerrada' ||
      k === 'cerrada_av' || k === 'paciente' || k === 'urgencias' || k === 'base_amb';
  };

  Escena.prototype.objeto = function (id) {
    var m = this.mundo;
    var r = Math.floor(id / m.cols);
    var c = id % m.cols;
    var k = this.kind(id);
    var h = hash(id);
    var o = this.objPorCelda[id];
    var hecho = o && ((this.hechos >> o.indice) & 1);
    var frente = r === m.filas - 1 || c === m.cols - 1;
    var self = this;
    var P = this.P.bind(this);
    var ctx = this.ctx;

    var tg = m.def.tipos[k];
    if (tg.parece) { if (this.omnisciente) this.oculto(r, c); return; }
    if (tg.forma) { if (!(hecho && tg.al_cumplir === 'ocultar')) this.forma(r, c, id, tg.forma, k, hecho); return; }
    switch (k) {
      case 'muro': {
        var alto = frente ? 8 : (this.tema === TEMAS.almacen ? 26 : 22);
        var colorMuro = this.tema === TEMAS.almacen ? '#c9ced4' : '#f3ede2';
        this.prisma(r, c, 0, 0, 1, 1, 0, alto, colorMuro, { top: this.tema === TEMAS.almacen ? '#e2e6ea' : '#fbf8f2' });
        break;
      }
      case 'puerta':
      case 'puerta_cerrada': {
        var horiz = this.vecino(id, 0, 1) === 'muro' || this.vecino(id, 0, -1) === 'muro';
        if (k === 'puerta_cerrada') {
          if (horiz) this.prisma(r, c, 0, 0.4, 1, 0.6, 0, 30, '#b4532a', { top: '#d97745' });
          else this.prisma(r, c, 0.4, 0, 0.6, 1, 0, 30, '#b4532a', { top: '#d97745' });
          var cp = this.centro(id, 34);
          this.elipse(cp[0], cp[1], 7, 7, '#dc2626', '#fff');
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(cp[0] - 3, cp[1] - 3); ctx.lineTo(cp[0] + 3, cp[1] + 3); ctx.moveTo(cp[0] + 3, cp[1] - 3); ctx.lineTo(cp[0] - 3, cp[1] + 3); ctx.stroke();
        } else {
          if (horiz) this.prisma(r, c, 0, 0.42, 0.08, 1, 0, 30, '#e2b98a');
          else this.prisma(r, c, 0.42, 0, 1, 0.08, 0, 30, '#e2b98a');
        }
        break;
      }
      case 'cocina':
        this.prisma(r, c, 0.04, 0.04, 0.96, 0.7, 0, 24, '#8a6a50', { top: '#f1ede6' });
        if (h > 0.5) {
          var hornilla = P(r + 0.37, c + 0.5, 24);
          this.elipse(hornilla[0], hornilla[1], 8, 4, '#2f2f2f');
          this.elipse(hornilla[0], hornilla[1], 4, 2, '#555');
        } else {
          this.prisma(r, c, 0.3, 0.15, 0.7, 0.45, 24, 26, '#9fb6c2');
        }
        break;
      case 'cama': {
        this.prisma(r, c, 0.02, 0.02, 0.98, 0.98, 0, 12, '#d9cfc2');
        this.prisma(r, c, 0.04, 0.3, 0.96, 0.96, 12, 17, '#6fa6bf', { top: '#86bcd3' });
        if (this.vecino(id, -1, 0) === 'muro') this.prisma(r, c, 0.15, 0.06, 0.85, 0.28, 12, 19, '#ffffff', { top: '#f8f8f8' });
        break;
      }
      case 'sofa':
        this.prisma(r, c, 0.04, 0.2, 0.96, 0.92, 0, 12, '#3f7f7a', { top: '#4f9690' });
        this.prisma(r, c, 0.04, 0.72, 0.96, 0.96, 0, 24, '#336b67', { top: '#4a8b85' });
        break;
      case 'mesa':
        this.prisma(r, c, 0.15, 0.15, 0.25, 0.25, 0, 16, '#6b4a2f');
        this.prisma(r, c, 0.75, 0.75, 0.85, 0.85, 0, 16, '#6b4a2f');
        this.prisma(r, c, 0.06, 0.06, 0.94, 0.94, 16, 20, '#a8784f', { top: '#c1915f' });
        if (h > 0.4) { var taza = P(r + 0.5, c + 0.5, 20); this.elipse(taza[0], taza[1] - 2, 4, 2.5, '#ffffff', '#ccc'); }
        break;
      case 'planta': {
        this.prisma(r, c, 0.32, 0.32, 0.68, 0.68, 0, 14, '#c2683b', { top: '#5a3b22' });
        var hoja = P(r + 0.5, c + 0.5, 30);
        this.elipse(hoja[0], hoja[1], 13, 11, '#3f7d2a');
        this.elipse(hoja[0] - 4, hoja[1] - 4, 7, 6, '#5ea33a');
        break;
      }
      case 'juguete': {
        this.prisma(r, c, 0.25, 0.3, 0.55, 0.6, 0, 12, '#ef4444');
        this.prisma(r, c, 0.3, 0.35, 0.5, 0.55, 12, 20, '#3b82f6');
        var bola = P(r + 0.7, c + 0.7, 7);
        this.elipse(bola[0], bola[1], 6, 6, '#facc15', '#b45309');
        break;
      }
      case 'mugre':
      case 'mugre_baldosa':
      case 'mugre_alfombra':
        if (hecho) this.brillo(id);
        else {
          for (var s = 0; s < 5; s += 1) {
            var mp = P(r + 0.25 + hash(id + s * 31) * 0.5, c + 0.25 + hash(id + s * 17) * 0.5, 0);
            this.elipse(mp[0], mp[1], 5 + hash(id * s + 3) * 6, 2.5 + hash(id + s) * 3, 'rgba(84,56,28,0.62)');
          }
        }
        break;
      case 'base':
        this.prisma(r, c, 0.3, 0.06, 0.7, 0.22, 0, 14, '#334155', { top: '#475569' });
        break;
      case 'cargador':
        this.prisma(r, c, 0.25, 0.04, 0.75, 0.18, 0, 26, '#1f2937', { top: '#374151' });
        var luz = P(r + 0.18, c + 0.5, 18);
        this.elipse(luz[0], luz[1], 3, 3, '#22c55e');
        break;
      case 'estante':
        this.estante(r, c, id);
        break;
      case 'paquete':
        if (!hecho) this.caja(r, c, 0.25, 0.25, 0.75, 0.75, 0, 20);
        break;
      case 'despacho': {
        var n = 0;
        var self2 = this;
        Object.keys(this.objPorCelda).forEach(function (celda) {
          var ob = self2.objPorCelda[celda];
          if ((self2.entregados >> ob.indice) & 1) {
            var col = n % 2;
            var fil = Math.floor(n / 2) % 2;
            var piso = Math.floor(n / 4);
            self2.caja(r, c, 0.2 + col * 0.32, 0.2 + fil * 0.32, 0.48 + col * 0.32, 0.48 + fil * 0.32, piso * 14, piso * 14 + 14);
            n += 1;
          }
        });
        break;
      }
      case 'derrame': {
        var dp = this.centro(id, 0);
        this.elipse(dp[0] - 4, dp[1] + 2, 18, 8, 'rgba(56,152,214,0.75)');
        this.elipse(dp[0] + 8, dp[1] - 1, 9, 4, 'rgba(56,152,214,0.75)');
        this.cono(r + 0.3, c + 0.75);
        break;
      }
      case 'palet':
        this.prisma(r, c, 0.08, 0.08, 0.92, 0.92, 0, 6, '#b08350');
        this.prisma(r, c, 0.12, 0.12, 0.88, 0.88, 6, 32, '#d8dde2', { top: '#eef1f4' });
        break;
      case 'edificio': {
        var altoE = 34 + Math.round(h * 80);
        var paleta = this.tema.noche ? ['#5b6b80', '#6d5f73', '#4f6d6a', '#7a6a58', '#58607a'] : ['#d9c7a8', '#c7d3dd', '#e2b49a', '#b9c4b0', '#d0c3d9'];
        var bloque = this.bloqueDe(id, 'edificio');
        var color = paleta[Math.floor(hash(bloque * 3) * paleta.length)];
        altoE = 28 + Math.round(hash(bloque) * 46) + Math.round(h * 10);
        this.edificio(r, c, altoE, color, id);
        break;
      }
      case 'hospital':
        this.edificio(r, c, 52, '#eef2f5', id, true);
        break;
      case 'parque':
      case 'arbol':
        this.arbol(r + 0.5, c + 0.5, h, k === 'arbol' ? 1 : 0.85);
        if (h > 0.55) this.arbol(r + 0.25, c + 0.75, hash(id + 9), 0.6);
        break;
      case 'trancon':
      case 'trancon_av':
        this.carro(r, c, 0.12, 0.3, 0.45, 0.7, '#ef4444', true);
        this.carro(r, c, 0.55, 0.3, 0.88, 0.7, h > 0.5 ? '#3b82f6' : '#f59e0b', true);
        break;
      case 'cerrada':
      case 'cerrada_av':
        for (var bz = 0; bz < 4; bz += 1) {
          this.prisma(r, c, 0.1 + bz * 0.2, 0.45, 0.3 + bz * 0.2, 0.55, 10, 18, bz % 2 ? '#ffffff' : '#ea580c');
        }
        this.prisma(r, c, 0.12, 0.47, 0.16, 0.53, 0, 10, '#334155');
        this.prisma(r, c, 0.84, 0.47, 0.88, 0.53, 0, 10, '#334155');
        this.cono(r + 0.2, c + 0.2);
        this.cono(r + 0.8, c + 0.8);
        break;
      case 'paciente':
        if (!hecho) this.persona(id);
        break;
      case 'granero': {
        this.prisma(r, c, 0, 0, 1, 1, 0, 34, '#b03a2e', { top: '#7c2a22' });
        var fr = this.vecino(id, 1, 0) !== 'granero';
        if (fr) this.prisma(r, c, 0.3, 0.96, 0.7, 1, 0, 24, '#f5f0e6');
        break;
      }
      case 'plaga':
      case 'plaga_urgente':
        break;
      case 'puente':
        this.prisma(r, c, 0, 0.02, 1, 0.08, 0, 9, '#6b3f1d');
        this.prisma(r, c, 0, 0.92, 1, 0.98, 0, 9, '#6b3f1d');
        break;
      default:
        break;
    }
    void self;
  };

  Escena.prototype.bloqueDe = function (id, kind) {
    var m = this.mundo;
    var cols = m.cols;
    var visto = {};
    var pila = [id];
    var menor = id;
    while (pila.length) {
      var x = pila.pop();
      if (visto[x]) continue;
      visto[x] = true;
      if (x < menor) menor = x;
      var r = Math.floor(x / cols);
      var c = x % cols;
      [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(function (d) {
        var rr = r + d[0];
        var cc = c + d[1];
        if (rr < 0 || cc < 0 || rr >= m.filas || cc >= cols) return;
        var y = rr * cols + cc;
        if (!visto[y] && m.celdas[y] === kind) pila.push(y);
      });
    }
    return menor;
  };

  Escena.prototype.edificio = function (r, c, alto, color, id, hospital) {
    var noche = this.tema.noche;
    this.prisma(r, c, 0, 0, 1, 1, 0, alto, color, { top: tono(color, noche ? -0.15 : 0.18) });
    var P = this.P.bind(this);
    var ventanaOn = noche ? '#ffd76a' : '#9fc2d9';
    var ventanaOff = noche ? '#243041' : '#7c97ab';
    for (var z = 10; z < alto - 8; z += 13) {
      for (var u = 0; u < 3; u += 1) {
        var on = hash(id * 97 + z * 7 + u) > (noche ? 0.45 : 0.15);
        var a = 0.12 + u * 0.3;
        this.poli([P(r + 1, c + a, z), P(r + 1, c + a + 0.18, z), P(r + 1, c + a + 0.18, z + 6), P(r + 1, c + a, z + 6)], on ? ventanaOn : ventanaOff);
        var on2 = hash(id * 53 + z * 11 + u) > (noche ? 0.5 : 0.15);
        this.poli([P(r + a, c + 1, z), P(r + a + 0.18, c + 1, z), P(r + a + 0.18, c + 1, z + 6), P(r + a, c + 1, z + 6)], on2 ? tono(ventanaOn, -0.15) : tono(ventanaOff, -0.15));
      }
    }
    if (hospital) {
      var m = this.mundo;
      var cols = m.cols;
      var ultimo = -1;
      var minR = Infinity, maxR = -1, minC = Infinity, maxC = -1;
      for (var i = 0; i < m.celdas.length; i += 1) {
        if (m.celdas[i] !== 'hospital') continue;
        var rr = Math.floor(i / cols);
        var cc = i % cols;
        minR = Math.min(minR, rr); maxR = Math.max(maxR, rr); minC = Math.min(minC, cc); maxC = Math.max(maxC, cc);
        if (ultimo < 0 || rr + cc >= Math.floor(ultimo / cols) + ultimo % cols) ultimo = i;
      }
      if (id === ultimo) {
        var cr = (minR + maxR + 1) / 2;
        var cc2 = (minC + maxC + 1) / 2;
        this.poli([P(cr - 0.18, cc2 - 0.7, alto), P(cr - 0.18, cc2 + 0.7, alto), P(cr + 0.18, cc2 + 0.7, alto), P(cr + 0.18, cc2 - 0.7, alto)], '#dc2626');
        this.poli([P(cr - 0.7, cc2 - 0.18, alto), P(cr - 0.7, cc2 + 0.18, alto), P(cr + 0.7, cc2 + 0.18, alto), P(cr + 0.7, cc2 - 0.18, alto)], '#dc2626');
      }
    }
  };

  Escena.prototype.estante = function (r, c, id) {
    var metal = '#7b8794';
    var post = [[0.06, 0.06], [0.88, 0.06], [0.06, 0.88], [0.88, 0.88]];
    var self = this;
    self.prisma(r, c, post[0][0], post[0][1], post[0][0] + 0.06, post[0][1] + 0.06, 0, 42, metal);
    [0, 20, 40].forEach(function (z, i) {
      self.prisma(r, c, 0.04, 0.04, 0.96, 0.96, z, z + 3, '#9aa5b1', { top: '#b6c0ca' });
      if (i < 2) {
        var cajas = 1 + Math.floor(hash(id * 7 + i) * 3);
        for (var b = 0; b < cajas; b += 1) {
          var u0 = 0.1 + b * 0.28;
          self.caja(r, c, u0, 0.2, u0 + 0.24, 0.8, z + 3, z + 3 + 9 + Math.round(hash(id + i * 5 + b) * 5), true);
        }
      }
    });
    [1, 2, 3].forEach(function (i) {
      self.prisma(r, c, post[i][0], post[i][1], post[i][0] + 0.06, post[i][1] + 0.06, 0, 42, metal);
    });
  };

  Escena.prototype.caja = function (r, c, u0, v0, u1, v1, z0, z1, sinCinta) {
    this.prisma(r, c, u0, v0, u1, v1, z0, z1, '#c58f52', { top: '#dcae74' });
    if (!sinCinta) {
      var um = (u0 + u1) / 2;
      this.poli([this.P(r + v0, c + um - 0.03, z1), this.P(r + v0, c + um + 0.03, z1), this.P(r + v1, c + um + 0.03, z1), this.P(r + v1, c + um - 0.03, z1)], '#ede0c8');
    }
  };

  Escena.prototype.cono = function (r, c) {
    var b = this.P(r, c, 0);
    var t = this.P(r, c, 14);
    this.poli([[b[0] - 5, b[1]], [b[0] + 5, b[1]], t], '#f97316');
    this.poli([[b[0] - 3, b[1] - 5], [b[0] + 3, b[1] - 5], [b[0] + 2, b[1] - 8], [b[0] - 2, b[1] - 8]], '#ffffff');
  };

  Escena.prototype.arbol = function (r, c, h, esc) {
    var base = this.P(r, c, 0);
    this.elipse(base[0], base[1], 11 * esc, 5 * esc, 'rgba(0,0,0,0.18)');
    var ctx = this.ctx;
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(base[0] - 2, base[1] - 14 * esc, 4, 14 * esc);
    var copa = this.P(r, c, 24 * esc);
    var verde = h > 0.5 ? '#2f6b2a' : '#3d7f2f';
    this.elipse(copa[0], copa[1], 13 * esc, 13 * esc, verde);
    this.elipse(copa[0] - 4 * esc, copa[1] - 4 * esc, 7 * esc, 6 * esc, 'rgba(255,255,255,0.14)');
  };

  Escena.prototype.carro = function (r, c, u0, v0, u1, v1, color, frenando) {
    this.prisma(r, c, u0, v0, u1, v1, 2, 10, color);
    this.prisma(r, c, u0 + 0.06, v0 + 0.04, u1 - 0.08, v1 - 0.04, 10, 15, '#cbd5e1', { top: tono(color, 0.2) });
    if (frenando && !this.quieto && Math.sin(this.t / 220 + r * 3 + c) > 0) {
      var p = this.P(r + (v0 + v1) / 2, c + u0, 6);
      this.elipse(p[0], p[1], 3, 2, '#ff3b3b');
    }
  };

  Escena.prototype.persona = function (id) {
    var cp = this.centro(id, 0);
    var t = this.quieto ? 0 : (this.t / 700) % 1;
    this.ctx.save();
    this.ctx.globalAlpha = 1 - t;
    this.elipse(cp[0], cp[1], 10 + t * 16, 5 + t * 8, null, '#ef4444');
    this.ctx.restore();
    this.elipse(cp[0], cp[1], 9, 4, 'rgba(0,0,0,0.25)');
    var ctx = this.ctx;
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(cp[0] - 4, cp[1] - 16, 8, 12);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(cp[0] - 4, cp[1] - 5, 3, 5);
    ctx.fillRect(cp[0] + 1, cp[1] - 5, 3, 5);
    this.elipse(cp[0], cp[1] - 20, 4.5, 4.5, '#f2c39b');
  };

  Escena.prototype.brillo = function (id) {
    var cp = this.centro(id, 2);
    var ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    [[-8, -2, 4], [6, 2, 3], [0, -6, 2.5]].forEach(function (s) {
      var x = cp[0] + s[0];
      var y = cp[1] + s[1];
      var k = s[2];
      ctx.beginPath();
      ctx.moveTo(x, y - k * 2); ctx.lineTo(x + k * 0.5, y - k * 0.5); ctx.lineTo(x + k * 2, y);
      ctx.lineTo(x + k * 0.5, y + k * 0.5); ctx.lineTo(x, y + k * 2); ctx.lineTo(x - k * 0.5, y + k * 0.5);
      ctx.lineTo(x - k * 2, y); ctx.lineTo(x - k * 0.5, y - k * 0.5); ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  };

  // ---------- ruta ----------

  Escena.prototype.ruta = function (ruta, desde, colorRuta) {
    var ctx = this.ctx;
    var self = this;
    var pts = ruta.map(function (id) { return self.centro(id, 3); });
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (desde > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (var i = 0; i <= desde && i < pts.length; i += 1) { if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]); else ctx.lineTo(pts[i][0], pts[i][1]); }
      ctx.stroke();
    }
    var cr = colorRuta || this.tema.ruta;
    ctx.shadowColor = cr;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = cr;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 7]);
    ctx.lineDashOffset = this.quieto ? 0 : -this.t / 40;
    ctx.beginPath();
    for (var j = desde; j < pts.length; j += 1) { if (j === desde) ctx.moveTo(pts[j][0], pts[j][1]); else ctx.lineTo(pts[j][0], pts[j][1]); }
    ctx.stroke();
    ctx.restore();
    var fin = pts[pts.length - 1];
    this.elipse(fin[0], fin[1], 7, 3.5, cr);
  };

  // ---------- agentes ----------

  Escena.prototype.agente = function (ag) {
    var r = ag.r;
    var c = ag.c;
    var spec = ag.spec || this.mundo.def.agente;
    var tipo = spec.dibujo;
    var base = this.P(r + 0.5, c + 0.5, 0);
    var salto = ag.saltando ? Math.abs(Math.sin(this.t / 90)) * 3 : 0;
    this.elipse(base[0], base[1] + 1, 20, 9, 'rgba(0,0,0,0.22)');
    var horiz = ag.dir === 'e' || ag.dir === 'o';
    if (tipo === 'aspiradora') this.aspiradora(base, salto);
    else if (tipo === 'montacargas') this.montacargas(r, c, salto);
    else if (tipo === 'ambulancia') this.ambulancia(r, c, horiz, salto, ag);
    else if (tipo === 'rover') this.rover(r, c, salto, horiz);
    else this.agenteGenerico(spec, r, c, salto, horiz, ag);
  };

  Escena.prototype.aspiradora = function (b, salto) {
    var ctx = this.ctx;
    var y = b[1] - salto;
    var rx = 17;
    var ry = 8.5;
    this.elipse(b[0], y, rx, ry, '#1f2937');
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(b[0] - rx, y - 8, rx * 2, 8);
    this.elipse(b[0], y - 8, rx, ry, '#e5e7eb');
    this.elipse(b[0], y - 9, rx - 5, ry - 2.5, '#f8fafc', '#cbd5e1');
    this.elipse(b[0] + 6, y - 11, 4, 2, '#0f766e');
    var on = this.quieto || Math.sin(this.t / 160) > 0;
    this.elipse(b[0] - 6, y - 10, 2, 1.2, on ? '#2dd4bf' : '#115e59');
  };

  Escena.prototype.montacargas = function (r, c, salto) {
    var z = salto;
    this.prisma(r, c, 0.2, 0.2, 0.8, 0.8, z + 2, z + 14, '#f1f5f9', { izq: '#cbd5e1', der: '#94a3b8', top: '#e2e8f0' });
    this.prisma(r, c, 0.2, 0.2, 0.8, 0.8, z, z + 3, '#1e293b');
    var luz = this.P(r + 0.8, c + 0.5, z + 9);
    var on = this.quieto || Math.sin(this.t / 200) > 0;
    this.elipse(luz[0], luz[1], 3, 2, on ? '#38bdf8' : '#0369a1');
    var self = this;
    this.lleva.forEach(function (letra, i) {
      var zz = z + 14 + i * 11;
      self.caja(r, c, 0.3, 0.3, 0.7, 0.7, zz, zz + 11);
      var p = self.P(r + 0.7, c + 0.5, zz + 5);
      self.ctx.font = '700 8px Outfit, sans-serif';
      self.ctx.fillStyle = '#3b2511';
      self.ctx.textAlign = 'center';
      self.ctx.fillText(letra, p[0] - 4, p[1] + 2);
    });
  };

  Escena.prototype.ambulancia = function (r, c, horiz, salto, ag) {
    var z = salto;
    var u0 = horiz ? 0.08 : 0.24;
    var u1 = horiz ? 0.92 : 0.76;
    var v0 = horiz ? 0.24 : 0.08;
    var v1 = horiz ? 0.76 : 0.92;
    this.prisma(r, c, u0, v0, u1, v1, z + 3, z + 22, '#f8fafc', { izq: '#e2e8f0', der: '#cbd5e1', top: '#ffffff' });
    this.prisma(r, c, u0, v0, u1, v1, z + 9, z + 13, '#dc2626', { top: '#dc2626' });
    var cab = horiz ? (ag.dir === 'e' ? [u1 - 0.22, v0, u1, v1] : [u0, v0, u0 + 0.22, v1]) : (ag.dir === 's' ? [u0, v1 - 0.22, u1, v1] : [u0, v0, u1, v0 + 0.22]);
    this.prisma(r, c, cab[0], cab[1], cab[2], cab[3], z + 13, z + 21, '#1e3a5f', { top: '#ffffff' });
    var f = this.quieto ? 0 : Math.floor(this.t / 180) % 2;
    var mu = (u0 + u1) / 2;
    var mv = (v0 + v1) / 2;
    this.prisma(r, c, mu - 0.12, mv - 0.06, mu, mv + 0.06, z + 22, z + 26, f ? '#ef4444' : '#7f1d1d');
    this.prisma(r, c, mu, mv - 0.06, mu + 0.12, mv + 0.06, z + 22, z + 26, f ? '#1e3a8a' : '#3b82f6');
    if (!this.quieto && f) {
      var p = this.P(r + mv, c + mu, z + 26);
      this.ctx.save();
      this.ctx.globalAlpha = 0.25;
      this.elipse(p[0], p[1], 26, 14, '#ef4444');
      this.ctx.restore();
    }
    if (this.lleva.length) {
      var q = this.P(r + v0, c + u1, z + 30);
      this.elipse(q[0], q[1], 7, 7, '#ffffff', '#dc2626');
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(q[0] - 1.2, q[1] - 4, 2.4, 8);
      this.ctx.fillRect(q[0] - 4, q[1] - 1.2, 8, 2.4);
    }
  };

  Escena.prototype.rover = function (r, c, salto, horiz) {
    var z = salto;
    var self = this;
    var ruedas = horiz ? [[0.2, 0.22], [0.66, 0.22], [0.2, 0.66], [0.66, 0.66]] : [[0.22, 0.2], [0.22, 0.66], [0.66, 0.2], [0.66, 0.66]];
    ruedas.forEach(function (w) { self.prisma(r, c, w[0], w[1], w[0] + 0.14, w[1] + 0.14, 0, 8, '#1f2937'); });
    this.prisma(r, c, 0.24, 0.24, 0.76, 0.76, z + 6, z + 16, '#2f855a', { top: '#48bb78' });
    this.prisma(r, c, 0.4, 0.4, 0.6, 0.6, z + 16, z + 21, '#e2e8f0');
    var a = this.P(r + 0.3, c + 0.3, z + 16);
    var b = this.P(r + 0.3, c + 0.3, z + 34);
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath(); this.ctx.moveTo(a[0], a[1]); this.ctx.lineTo(b[0], b[1]); this.ctx.stroke();
    var on = this.quieto || Math.sin(this.t / 250) > 0;
    this.elipse(b[0], b[1], 3, 3, on ? '#facc15' : '#a16207');
  };

  // ---------- rótulos ----------

  Escena.prototype.rotulos = function (est) {
    var ctx = this.ctx;
    var m = this.mundo;
    var self = this;
    var noche = this.tema.noche;
    (m.def.zonas || []).forEach(function (z) {
      if (est.sinZonas) return;
      var p = self.P((z.desde[0] + z.hasta[0] + 1) / 2, (z.desde[1] + z.hasta[1] + 1) / 2, 0);
      ctx.font = '600 10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var txt = z.nombre.toUpperCase();
      var w = ctx.measureText(txt).width + 12;
      ctx.fillStyle = noche ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.72)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(p[0] - w / 2, p[1] - 8, w, 16, 8); else ctx.rect(p[0] - w / 2, p[1] - 8, w, 16);
      ctx.fill();
      ctx.fillStyle = noche ? '#e2e8f0' : '#334155';
      ctx.fillText(txt, p[0], p[1] + 0.5);
    });

    (est.objetivos || []).forEach(function (o) {
      var hecho = (self.hechos >> o.indice) & 1;
      var entregado = (self.entregados >> o.indice) & 1;
      if (m.def.modo === 'recoger' && hecho) return;
      if (m.def.modo === 'alguno') return;
      var fo = m.def.tipos[o.tipo].forma;
      if (fo && fo.f === 'hito') return;
      var flota = self.quieto ? 0 : Math.sin(self.t / 380 + o.indice) * 3;
      var p = self.centro(o.celda, 50 + flota);
      var color = hecho ? '#16a34a' : (o.urgente ? '#dc2626' : (o.opcional ? '#64748b' : '#f59e0b'));
      if (!hecho && o.urgente && !self.quieto) {
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.35 * Math.sin(self.t / 200);
        self.elipse(p[0], p[1], 17, 17, color);
        ctx.restore();
      }
      var base = self.centro(o.celda, 6);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(p[0], p[1] + 10); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p[0] - 7, p[1] + 6); ctx.lineTo(p[0], p[1] + 16); ctx.lineTo(p[0] + 7, p[1] + 6);
      ctx.fillStyle = color; ctx.fill();
      self.elipse(p[0], p[1], 11, 11, color, '#ffffff');
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hecho ? '✓' : o.letra, p[0], p[1] + 0.5);
      void entregado;
      if (est.orden && est.orden[o.celda] && !hecho) {
        ctx.font = '700 9px "IBM Plex Mono", monospace';
        var t = est.orden[o.celda] + 'º';
        var w = ctx.measureText(t).width + 8;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(p[0] + 8, p[1] - 17, w, 13, 6); else ctx.rect(p[0] + 8, p[1] - 17, w, 13);
        ctx.fill();
        ctx.fillStyle = '#fef3c7';
        ctx.fillText(t, p[0] + 8 + w / 2, p[1] - 10);
      }
    });
  };

  Escena.prototype.lluviaNoche = function () {};

  Escena.prototype.lluvia = function () {
    var ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(59,130,246,0.35)';
    ctx.lineWidth = 1;
    var t = this.quieto ? 0 : this.t;
    for (var i = 0; i < 90; i += 1) {
      var x = (hash(i * 3) * this.ancho + t * 0.05) % this.ancho;
      var y = (hash(i * 7) * this.alto + t * 0.5) % this.alto;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 10); ctx.stroke();
    }
    ctx.restore();
  };

  // ---------- mundos definidos en el JSON ----------

  Escena.prototype.sueloGenerico = function (id, r, c, ts) {
    var ctx = this.ctx;
    var P = this.P.bind(this);
    var color = ts.piso;
    this.poli(this.rombo(r, c, 0, 0), color, 'rgba(0,0,0,0.08)', 1);
    var h = hash(id);
    var pat = ts.patron;
    var self = this;
    if (pat === 'losas') {
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      var a = P(r + 0.5, c, 0); var b = P(r + 0.5, c + 1, 0);
      var a2 = P(r, c + 0.5, 0); var b2 = P(r + 1, c + 0.5, 0);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
    } else if (pat === 'baldosa') {
      this.poli([P(r, c, 0), P(r, c + 0.5, 0), P(r + 0.5, c + 0.5, 0), P(r + 0.5, c, 0)], tono(color, -0.05));
      this.poli([P(r + 0.5, c + 0.5, 0), P(r + 0.5, c + 1, 0), P(r + 1, c + 1, 0), P(r + 1, c + 0.5, 0)], tono(color, -0.05));
    } else if (pat === 'rejilla') {
      this.poli(this.rombo(r, c, 0.08, 0), null, 'rgba(255,255,255,0.18)', 1);
    } else if (pat === 'puntos' || pat === 'cesped') {
      for (var g = 0; g < 5; g += 1) {
        var pp = P(r + hash(id * 7 + g), c + hash(id * 13 + g), 0);
        this.elipse(pp[0], pp[1], pat === 'cesped' ? 2.4 : 1.4, pat === 'cesped' ? 1.4 : 0.9, pat === 'cesped' ? 'rgba(20,83,45,0.35)' : 'rgba(120,80,30,0.3)');
      }
    } else if (pat === 'agua') {
      var t = this.quieto ? 0 : this.t / 1100;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.2;
      for (var w = 0; w < 2; w += 1) {
        var off = (h + w * 0.5 + t) % 1;
        var w1 = P(r + off, c + 0.2, 0); var w2 = P(r + off, c + 0.55, 0);
        ctx.beginPath(); ctx.moveTo(w1[0], w1[1]); ctx.lineTo(w2[0], w2[1]); ctx.stroke();
      }
    } else if (pat === 'asfalto') {
      var via = function (dr, dc) {
        var k2 = self.vecino(id, dr, dc);
        if (!k2) return false;
        return self.mundo.def.tipos[k2].paso !== false;
      };
      var hz = via(0, 1) || via(0, -1);
      var vt = via(1, 0) || via(-1, 0);
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.3;
      if (hz && !vt) { var h1 = P(r + 0.5, c, 0); var h2 = P(r + 0.5, c + 1, 0); ctx.beginPath(); ctx.moveTo(h1[0], h1[1]); ctx.lineTo(h2[0], h2[1]); ctx.stroke(); }
      else if (vt && !hz) { var v1 = P(r, c + 0.5, 0); var v2 = P(r + 1, c + 0.5, 0); ctx.beginPath(); ctx.moveTo(v1[0], v1[1]); ctx.lineTo(v2[0], v2[1]); ctx.stroke(); }
      ctx.restore();
    } else if (pat === 'cable' || pat === 'cable_cortado') {
      var infectado = this.rastro && this.rastro[id];
      var centro = this.centro(id, 0);
      var tipos = this.mundo.def.tipos;
      [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(function (d) {
        var k2 = self.vecino(id, d[0], d[1]);
        if (!k2) return;
        var t2 = tipos[k2];
        if (!t2.red && t2.patron !== 'cable_cortado') return;
        var borde = P(r + 0.5 + d[0] * 0.5, c + 0.5 + d[1] * 0.5, 0);
        var ini = centro;
        var fin = borde;
        if (pat === 'cable_cortado') { ini = borde; fin = [centro[0] + (borde[0] - centro[0]) * 0.45, centro[1] + (borde[1] - centro[1]) * 0.45]; }
        ctx.save();
        ctx.strokeStyle = infectado ? '#f43f5e' : '#22d3ee';
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ini[0], ini[1]); ctx.lineTo(fin[0], fin[1]); ctx.stroke();
        ctx.restore();
      });
      if (pat === 'cable_cortado') {
        var chispa = !this.quieto && Math.sin(this.t / 120 + id) > 0.3;
        this.elipse(centro[0], centro[1], 5, 3, chispa ? '#fde047' : 'rgba(250,204,21,0.3)');
      } else if (!tipos[this.kind(id)].forma) {
        this.elipse(centro[0], centro[1], 3, 2, infectado ? '#f43f5e' : '#67e8f9');
      }
    }
  };

  Escena.prototype.forma = function (r, c, id, fm, k, hecho) {
    var ctx = this.ctx;
    var P = this.P.bind(this);
    var h = hash(id);
    var cp = this.centro(id, 0);
    switch (fm.f) {
      case 'bloque': {
        var ins = fm.ins || 0;
        this.prisma(r, c, ins, ins, 1 - ins, 1 - ins, 0, fm.alto, fm.color, { top: fm.techo || tono(fm.color, 0.15) });
        if (fm.ventanas) {
          for (var z = 6; z < fm.alto - 4; z += 10) {
            for (var u = 0; u < 3; u += 1) {
              var on = hash(id * 31 + z + u) > 0.3;
              var a = 0.15 + u * 0.28;
              this.poli([P(r + 1, c + a, z), P(r + 1, c + a + 0.16, z), P(r + 1, c + a + 0.16, z + 5), P(r + 1, c + a, z + 5)], on ? '#93c5fd' : '#64748b');
              this.poli([P(r + a, c + 1, z), P(r + a + 0.16, c + 1, z), P(r + a + 0.16, c + 1, z + 5), P(r + a, c + 1, z + 5)], on ? '#7aa7d8' : '#475569');
            }
          }
        }
        if (fm.puerta) this.poli([P(r + 1, c + 0.3, 0), P(r + 1, c + 0.7, 0), P(r + 1, c + 0.7, 22), P(r + 1, c + 0.3, 22)], '#94a3b8');
        break;
      }
      case 'edificio': {
        var bloque = this.bloqueDe(id, k);
        var cols = fm.colores || ['#d9c7a8'];
        var alto = fm.alto[0] + Math.round(hash(bloque) * (fm.alto[1] - fm.alto[0])) + Math.round(h * 6);
        this.edificio(r, c, alto, cols[Math.floor(hash(bloque * 3) * cols.length)], id);
        break;
      }
      case 'arbol':
        if (fm.palmera) this.palmera(r + 0.5, c + 0.5, h);
        else { this.arbol(r + 0.5, c + 0.5, h, 0.9); if (h > 0.5) this.arbol(r + 0.25, c + 0.75, hash(id + 9), 0.6); }
        break;
      case 'roca':
        this.prisma(r, c, 0.08, 0.1, 0.6, 0.62, 0, 14 + h * 10, '#a8a29e', { top: '#d6d3d1' });
        this.prisma(r, c, 0.45, 0.4, 0.92, 0.9, 0, 10 + h * 8, '#78716c', { top: '#a8a29e' });
        break;
      case 'escombro':
      case 'ruina': {
        var ruina = fm.f === 'ruina';
        var n = ruina ? 7 : 5;
        for (var i = 0; i < n; i += 1) {
          var u0 = 0.05 + hash(id * 7 + i) * 0.6;
          var v0 = 0.05 + hash(id * 11 + i) * 0.6;
          var tam = 0.2 + hash(id + i * 3) * 0.2;
          var alt = (ruina ? 5 : 4) + hash(id * 5 + i) * (ruina ? 13 : 10);
          this.prisma(r, c, u0, v0, u0 + tam, v0 + tam, 0, alt, ['#a8a29e', '#78716c', '#d6d3d1', '#b45309'][i % 4]);
        }
        if (ruina && h > 0.6) this.prisma(r, c, 0.1, 0.45, 0.9, 0.52, 10, 13, '#57534e');
        break;
      }
      case 'basedatos':
        for (var d = 0; d < 3; d += 1) {
          var zc = 6 + d * 12;
          this.elipse(cp[0], cp[1] - zc, 17, 8.5, '#1e3a8a');
          ctx.fillStyle = '#1e40af';
          ctx.fillRect(cp[0] - 17, cp[1] - zc - 10, 34, 10);
          this.elipse(cp[0], cp[1] - zc - 10, 17, 8.5, '#3b82f6', '#93c5fd');
        }
        break;
      case 'servidor':
        this.prisma(r, c, 0.2, 0.2, 0.8, 0.8, 0, 40, '#1f2937', { top: '#374151' });
        for (var l = 0; l < 5; l += 1) {
          var led = P(r + 0.8, c + 0.3 + (l % 3) * 0.2, 8 + l * 6);
          var on1 = this.quieto || hash(id + l + Math.floor(this.t / 200)) > 0.4;
          this.elipse(led[0], led[1], 1.6, 1.2, on1 ? (fm.color || '#22d3ee') : '#334155');
        }
        break;
      case 'switch': {
        var apagado = fm.apagado;
        this.prisma(r, c, 0.25, 0.3, 0.75, 0.7, 0, 9, apagado ? '#3f3f46' : '#0f766e', { top: apagado ? '#52525b' : '#14b8a6' });
        for (var p2 = 0; p2 < 4; p2 += 1) {
          var lp = P(r + 0.7, c + 0.32 + p2 * 0.12, 5);
          var on3 = !apagado && (this.quieto || hash(id * 3 + p2 + Math.floor(this.t / 150)) > 0.5);
          this.elipse(lp[0], lp[1], 1.3, 1, on3 ? '#a3e635' : '#27272a');
        }
        if (apagado) {
          var xa = this.centro(id, 14);
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(xa[0] - 5, xa[1] - 5); ctx.lineTo(xa[0] + 5, xa[1] + 5); ctx.moveTo(xa[0] + 5, xa[1] - 5); ctx.lineTo(xa[0] - 5, xa[1] + 5); ctx.stroke();
        }
        break;
      }
      case 'terminal': {
        var cortada = this.conectadas && this.conectadas[id] === false;
        this.prisma(r, c, 0.2, 0.3, 0.8, 0.7, 0, 10, '#475569', { top: '#64748b' });
        this.prisma(r, c, 0.3, 0.38, 0.7, 0.46, 10, 26, '#0f172a', { top: '#1e293b' });
        this.poli([P(r + 0.46, c + 0.33, 13), P(r + 0.46, c + 0.67, 13), P(r + 0.46, c + 0.67, 24), P(r + 0.46, c + 0.33, 24)], cortada ? '#7f1d1d' : '#22d3ee');
        break;
      }
      case 'firewall': {
        var fl = this.quieto ? 0.5 : 0.5 + 0.5 * Math.sin(this.t / 160 + id);
        this.prisma(r, c, 0.15, 0.4, 0.85, 0.6, 0, 26, '#ea580c', { top: '#fb923c', izq: 'rgba(234,88,12,0.85)', der: 'rgba(194,65,12,0.85)' });
        ctx.save(); ctx.globalAlpha = 0.25 + 0.3 * fl; this.elipse(cp[0], cp[1] - 18, 24, 14, '#fb923c'); ctx.restore();
        break;
      }
      case 'cofre':
        if (hecho) { this.prisma(r, c, 0.25, 0.32, 0.75, 0.68, 0, 12, '#92400e', { top: '#facc15' }); this.brillo(id); break; }
        this.prisma(r, c, 0.25, 0.32, 0.75, 0.68, 0, 14, '#92400e', { top: '#b45309' });
        this.prisma(r, c, 0.25, 0.32, 0.75, 0.68, 14, 20, '#a16207', { top: '#ca8a04' });
        this.prisma(r, c, 0.46, 0.66, 0.54, 0.7, 8, 16, '#facc15');
        break;
      case 'llave': {
        var y = cp[1] - 18 - (this.quieto ? 0 : Math.sin(this.t / 300) * 3);
        ctx.save(); ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 14;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cp[0] - 6, y, 5, 0, Math.PI * 2); ctx.moveTo(cp[0] - 1, y); ctx.lineTo(cp[0] + 10, y); ctx.moveTo(cp[0] + 6, y); ctx.lineTo(cp[0] + 6, y + 5); ctx.moveTo(cp[0] + 10, y); ctx.lineTo(cp[0] + 10, y + 5); ctx.stroke();
        ctx.restore();
        break;
      }
      case 'antorcha':
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cp[0] - 2, cp[1] - 20, 4, 20);
        this.llama(cp[0], cp[1] - 22, 1);
        break;
      case 'reja': {
        var abierta = this.abierta && this.abierta(id);
        var der = this.vecino(id, 0, 1);
        var horiz = !!der && this.mundo.def.tipos[der].paso === false;
        var colorR = fm.color || '#64748b';
        if (abierta) {
          if (horiz) this.prisma(r, c, 0, 0.42, 0.12, 0.58, 0, 28, colorR); else this.prisma(r, c, 0.42, 0, 0.58, 0.12, 0, 28, colorR);
          break;
        }
        for (var bb = 0; bb < 5; bb += 1) {
          var o = 0.1 + bb * 0.2;
          if (horiz) this.prisma(r, c, o - 0.03, 0.47, o + 0.03, 0.53, 0, 28, colorR);
          else this.prisma(r, c, 0.47, o - 0.03, 0.53, o + 0.03, 0, 28, colorR);
        }
        if (horiz) this.prisma(r, c, 0, 0.46, 1, 0.54, 24, 28, tono(colorR, -0.2)); else this.prisma(r, c, 0.46, 0, 0.54, 1, 24, 28, tono(colorR, -0.2));
        var cand = this.centro(id, 36);
        this.elipse(cand[0], cand[1], 6, 6, '#0f172a', colorR);
        this.elipse(cand[0], cand[1] - 1, 2, 2, '#fbbf24');
        break;
      }
      case 'portal': {
        var pul = this.quieto ? 0.6 : 0.5 + 0.5 * Math.sin(this.t / 300);
        var colP = fm.color || '#fde68a';
        ctx.save(); ctx.globalAlpha = 0.35 + 0.35 * pul;
        this.poli(this.rombo(r, c, 0.12, 1), colP);
        ctx.restore();
        ctx.save(); ctx.shadowColor = colP; ctx.shadowBlur = 20;
        this.poli(this.rombo(r, c, 0.25, 2), null, colP, 2);
        ctx.restore();
        break;
      }
      case 'marca':
        this.poli(this.rombo(r, c, 0.14, 0.5), null, fm.color, 2.5);
        this.poli(this.rombo(r, c, 0.3, 0.5), fm.color);
        break;
      case 'semaforo': {
        for (var zz = 0; zz < 4; zz += 1) this.poli([P(r + 0.1, c + 0.12 + zz * 0.22, 0), P(r + 0.1, c + 0.22 + zz * 0.22, 0), P(r + 0.9, c + 0.22 + zz * 0.22, 0), P(r + 0.9, c + 0.12 + zz * 0.22, 0)], 'rgba(255,255,255,0.55)');
        var verde = this.luz ? this.luz(id) : true;
        ctx.save(); ctx.globalAlpha = 0.28; this.poli(this.rombo(r, c, 0.05, 0.4), verde ? '#22c55e' : '#ef4444'); ctx.restore();
        var base = P(r + 0.1, c + 0.1, 0);
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(base[0] - 1.5, base[1] - 44, 3, 44);
        ctx.fillRect(base[0] - 5, base[1] - 62, 10, 20);
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = verde ? '#22c55e' : '#ef4444';
        this.elipse(base[0], base[1] - 57, 3.2, 3.2, verde ? '#3f1d1d' : '#ef4444');
        this.elipse(base[0], base[1] - 47, 3.2, 3.2, verde ? '#22c55e' : '#14351f');
        ctx.restore();
        break;
      }
      case 'parada':
        this.prisma(r, c, 0.05, 0.02, 0.95, 0.12, 0, 4, '#e5e7eb');
        this.prisma(r, c, 0.1, 0.02, 0.14, 0.08, 4, 26, '#334155');
        this.prisma(r, c, 0.86, 0.02, 0.9, 0.08, 4, 26, '#334155');
        this.prisma(r, c, 0.05, -0.05, 0.95, 0.15, 26, 29, '#16a34a', { top: '#22c55e' });
        if (!hecho) { this.personita(P(r + 0.15, c + 0.35, 0), '#f472b6'); this.personita(P(r + 0.15, c + 0.6, 0), '#60a5fa'); }
        break;
      case 'trancon':
        this.carro(r, c, 0.12, 0.3, 0.45, 0.7, '#ef4444', true);
        this.carro(r, c, 0.55, 0.3, 0.88, 0.7, h > 0.5 ? '#3b82f6' : '#f59e0b', true);
        break;
      case 'barrera':
        for (var bz = 0; bz < 4; bz += 1) this.prisma(r, c, 0.1 + bz * 0.2, 0.45, 0.3 + bz * 0.2, 0.55, 10, 18, bz % 2 ? '#ffffff' : '#ea580c');
        this.prisma(r, c, 0.12, 0.47, 0.16, 0.53, 0, 10, '#334155');
        this.prisma(r, c, 0.84, 0.47, 0.88, 0.53, 0, 10, '#334155');
        this.cono(r + 0.2, c + 0.2);
        this.cono(r + 0.8, c + 0.8);
        break;
      case 'conos':
        this.cono(r + 0.3, c + 0.3); this.cono(r + 0.5, c + 0.6); this.cono(r + 0.75, c + 0.3);
        break;
      case 'charco':
        this.elipse(cp[0] - 3, cp[1] + 1, 18, 8, fm.color);
        this.elipse(cp[0] + 9, cp[1] - 2, 8, 4, fm.color);
        break;
      case 'fuego':
        this.elipse(cp[0], cp[1], 18, 8, 'rgba(120,53,15,0.6)');
        this.llama(cp[0] - 8, cp[1] - 2, 1.1);
        this.llama(cp[0] + 6, cp[1] + 2, 1.4);
        this.llama(cp[0] + 1, cp[1] - 6, 0.9);
        break;
      case 'hito': {
        var bajo = fm.bajo;
        this.prisma(r, c, 0.25, 0.25, 0.75, 0.75, 0, bajo ? 8 : 18, '#f5f5f4', { top: '#ffffff' });
        var ic = this.centro(id, (bajo ? 8 : 18) + 14 + (this.quieto || hecho ? 0 : Math.sin(this.t / 400 + id) * 2));
        ctx.save(); if (!hecho) { ctx.shadowColor = fm.color; ctx.shadowBlur = 14; }
        this.elipse(ic[0], ic[1], 11, 11, hecho ? '#16a34a' : fm.color, '#ffffff');
        ctx.restore();
        ctx.fillStyle = '#ffffff'; ctx.font = '700 12px Outfit, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(hecho ? '✓' : fm.icono, ic[0], ic[1] + 0.5);
        break;
      }
      case 'maquina': {
        this.prisma(r, c, 0.04, 0.04, 0.96, 0.96, 0, 12, '#475569', { top: '#64748b' });
        this.prisma(r, c, 0.04, 0.04, 0.96, 0.96, 12, 15, '#facc15', { top: '#fde047' });
        var lm = P(r + 0.96, c + 0.5, 7);
        this.elipse(lm[0], lm[1], 2.5, 2, (this.quieto || Math.sin(this.t / 300 + id) > 0) ? '#22c55e' : '#14532d');
        break;
      }
      case 'volumen':
        this.prisma(r, c, 0, 0, 1, 1, 0, fm.alto || 50, fm.color, { top: fm.color, izq: fm.color, der: fm.color, linea: 'rgba(239,68,68,0.45)' });
        break;
      case 'torre': {
        this.prisma(r, c, 0.4, 0.4, 0.6, 0.6, 0, 70, '#94a3b8', { top: '#cbd5e1' });
        var tp = this.centro(id, 74);
        this.elipse(tp[0], tp[1], 3, 3, (this.quieto || Math.sin(this.t / 250) > 0) ? '#ef4444' : '#7f1d1d');
        break;
      }
      case 'tormenta': {
        var nube = this.centro(id, 58);
        ctx.save(); ctx.globalAlpha = 0.85;
        this.elipse(nube[0] - 10, nube[1], 14, 9, '#475569');
        this.elipse(nube[0] + 8, nube[1] - 3, 16, 10, '#334155');
        this.elipse(nube[0], nube[1] + 3, 18, 8, '#1e293b');
        ctx.restore();
        if (!this.quieto && Math.sin(this.t / 90 + id) > 0.92) {
          ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(nube[0], nube[1] + 8); ctx.lineTo(nube[0] - 5, nube[1] + 26); ctx.lineTo(nube[0] + 3, nube[1] + 26); ctx.lineTo(nube[0] - 3, nube[1] + 46); ctx.stroke();
        }
        break;
      }
      case 'cupo': {
        ctx.strokeStyle = fm.color; ctx.lineWidth = 1.6;
        var c1 = P(r + 0.08, c + 0.12, 0); var c2 = P(r + 0.92, c + 0.12, 0); var c3 = P(r + 0.08, c + 0.88, 0); var c4 = P(r + 0.92, c + 0.88, 0);
        ctx.beginPath(); ctx.moveTo(c1[0], c1[1]); ctx.lineTo(c2[0], c2[1]); ctx.moveTo(c3[0], c3[1]); ctx.lineTo(c4[0], c4[1]); ctx.stroke();
        ctx.fillStyle = fm.color; ctx.font = '700 11px Outfit, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(fm.simbolo ? '♿' : 'P', cp[0], cp[1]);
        break;
      }
      case 'carro_parqueado': {
        var cols2 = ['#ef4444', '#f8fafc', '#1e293b', '#3b82f6', '#a3a3a3', '#16a34a'];
        this.carro(r, c, 0.25, 0.1, 0.75, 0.9, cols2[Math.floor(h * cols2.length)], false);
        break;
      }
      case 'cama':
        this.prisma(r, c, 0.02, 0.02, 0.98, 0.98, 0, 12, '#d9cfc2');
        this.prisma(r, c, 0.04, 0.3, 0.96, 0.96, 12, 17, '#7dd3fc', { top: '#bae6fd' });
        break;
      case 'estante':
        this.estante(r, c, id);
        break;
      case 'camilla':
        this.prisma(r, c, 0.25, 0.15, 0.3, 0.2, 0, 10, '#64748b');
        this.prisma(r, c, 0.7, 0.8, 0.75, 0.85, 0, 10, '#64748b');
        this.prisma(r, c, 0.2, 0.1, 0.8, 0.9, 10, 14, '#e2e8f0', { top: '#f8fafc' });
        break;
      case 'cajas':
        this.caja(r, c, 0.12, 0.12, 0.52, 0.52, 0, 18);
        this.caja(r, c, 0.48, 0.45, 0.88, 0.88, 0, 16);
        this.caja(r, c, 0.2, 0.2, 0.5, 0.5, 18, 32);
        break;
      case 'tronco':
        this.prisma(r, c, 0.05, 0.38, 0.95, 0.62, 0, 12, '#78350f', { top: '#92400e' });
        break;
      case 'barco': {
        this.prisma(r, c, 0.15, 0.25, 0.85, 0.75, 0, 8, '#7c2d12', { top: '#c2410c' });
        var mb = this.centro(id, 8);
        ctx.fillStyle = '#78350f'; ctx.fillRect(mb[0] - 1, mb[1] - 30, 2, 30);
        this.poli([[mb[0] + 1, mb[1] - 30], [mb[0] + 16, mb[1] - 12], [mb[0] + 1, mb[1] - 10]], '#f8fafc');
        break;
      }
      case 'cueva':
        this.poli(this.rombo(r, c, 0.05, 0), 'rgba(0,0,0,0.3)');
        if (!(this.abierta && this.abierta(id))) this.poli(this.rombo(r, c, 0, 0.5), 'rgba(0,0,0,0.5)');
        break;
      case 'carpa': {
        this.prisma(r, c, 0.1, 0.1, 0.9, 0.9, 0, 16, '#f8fafc');
        this.poli([P(r + 0.9, c + 0.1, 16), P(r + 0.9, c + 0.9, 16), P(r + 0.5, c + 0.5, 32)], '#cbd5e1');
        this.poli([P(r + 0.1, c + 0.9, 16), P(r + 0.9, c + 0.9, 16), P(r + 0.5, c + 0.5, 32)], '#f1f5f9');
        var cz = this.centro(id, 22);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(cz[0] - 1.5, cz[1] - 5, 3, 10); ctx.fillRect(cz[0] - 5, cz[1] - 1.5, 10, 3);
        break;
      }
      case 'tienda':
        this.prisma(r, c, 0.1, 0.05, 0.9, 0.3, 0, 22, '#fef3c7', { top: '#fde68a' });
        for (var tl = 0; tl < 4; tl += 1) this.prisma(r, c, 0.1 + tl * 0.2, 0.3, 0.3 + tl * 0.2, 0.42, 16, 19, tl % 2 ? '#ffffff' : '#dc2626');
        if (hecho) this.caja(r, c, 0.4, 0.5, 0.7, 0.8, 0, 12);
        break;
      case 'vitrina': {
        var est = this.vitrinas ? this.vitrinas[fm.id] : 'normal';
        this.prisma(r, c, 0.06, 0.04, 0.94, 0.2, 0, 44, '#f3d9e6', { top: '#fbe7f0' });
        this.prisma(r, c, 0.06, 0.08, 0.94, 0.92, 0, 14, '#e9c4d6', { top: '#fdf2f8' });
        if (est !== 'tomado') {
          var col = est === 'fuera' || est === 'agotado' ? '#cbd5e1' : fm.color;
          if (est === 'elegido' && !this.quieto) {
            var pg = this.centro(id, 26);
            ctx.save(); ctx.globalAlpha = 0.35 + 0.25 * Math.sin(this.t / 260); this.elipse(pg[0], pg[1], 20, 16, fm.color); ctx.restore();
          }
          this.prisma(r, c, 0.38, 0.38, 0.62, 0.62, 14, 34, col, { top: tono(col, 0.25) });
          this.prisma(r, c, 0.44, 0.44, 0.56, 0.56, 34, 39, est === 'fuera' || est === 'agotado' ? '#94a3b8' : '#334155');
        }
        if (est === 'agotado') {
          var xg = this.centro(id, 26);
          ctx.strokeStyle = '#e11d48'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(xg[0] - 8, xg[1] - 8); ctx.lineTo(xg[0] + 8, xg[1] + 8); ctx.moveTo(xg[0] + 8, xg[1] - 8); ctx.lineTo(xg[0] - 8, xg[1] + 8); ctx.stroke();
        }
        if (est === 'elegido') {
          var pin = this.centro(id, 52 + (this.quieto ? 0 : Math.sin(this.t / 380 + id) * 3));
          this.elipse(pin[0], pin[1], 10, 10, '#db2777', '#ffffff');
          ctx.fillStyle = '#ffffff'; ctx.font = '700 10px Outfit, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(this.ordenVitrina && this.ordenVitrina[fm.id] || '★'), pin[0], pin[1] + 0.5);
        }
        break;
      }
      case 'persona':
        if (hecho) { this.brillo(id); break; }
        if (fm.acostado) {
          this.prisma(r, c, 0.15, 0.2, 0.85, 0.8, 0, 10, '#e2e8f0', { top: '#f8fafc' });
          this.prisma(r, c, 0.4, 0.25, 0.8, 0.75, 10, 13, fm.color, { top: fm.color });
          var cab = this.P(r + 0.5, c + 0.28, 13);
          this.elipse(cab[0], cab[1], 4, 4, '#f2c39b');
          break;
        }
        if (fm.pulso && !this.quieto) {
          var tt = (this.t / 700) % 1;
          ctx.save(); ctx.globalAlpha = 1 - tt; this.elipse(cp[0], cp[1], 10 + tt * 16, 5 + tt * 8, null, fm.color); ctx.restore();
        }
        this.personita(cp, fm.color);
        break;
      default:
        break;
    }
  };

  Escena.prototype.personita = function (cp, color) {
    var ctx = this.ctx;
    this.elipse(cp[0], cp[1], 7, 3, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = color;
    ctx.fillRect(cp[0] - 3.5, cp[1] - 15, 7, 11);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(cp[0] - 3.5, cp[1] - 5, 3, 5);
    ctx.fillRect(cp[0] + 0.5, cp[1] - 5, 3, 5);
    this.elipse(cp[0], cp[1] - 19, 4, 4, '#f2c39b');
  };

  Escena.prototype.llama = function (x, y, esc) {
    var t = this.quieto ? 0 : this.t / 90;
    var f = 1 + 0.15 * Math.sin(t + x);
    var ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = '#f97316'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(x - 5 * esc, y); ctx.quadraticCurveTo(x, y - 18 * esc * f, x + 5 * esc, y); ctx.closePath(); ctx.fillStyle = '#f97316'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 2.5 * esc, y); ctx.quadraticCurveTo(x, y - 10 * esc * f, x + 2.5 * esc, y); ctx.closePath(); ctx.fillStyle = '#fde047'; ctx.fill();
    ctx.restore();
  };

  Escena.prototype.palmera = function (r, c, h) {
    var base = this.P(r, c, 0);
    var ctx = this.ctx;
    this.elipse(base[0], base[1], 10, 4, 'rgba(0,0,0,0.18)');
    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.quadraticCurveTo(base[0] + 6, base[1] - 18, base[0] + 3, base[1] - 32); ctx.stroke();
    var top = [base[0] + 3, base[1] - 32];
    ctx.strokeStyle = h > 0.5 ? '#15803d' : '#16a34a'; ctx.lineWidth = 3;
    for (var i = 0; i < 6; i += 1) {
      var ang = i * Math.PI / 3 + h;
      ctx.beginPath(); ctx.moveTo(top[0], top[1]);
      ctx.quadraticCurveTo(top[0] + Math.cos(ang) * 10, top[1] - 6, top[0] + Math.cos(ang) * 16, top[1] + Math.sin(ang) * 6 + 4);
      ctx.stroke();
    }
  };

  Escena.prototype.oculto = function (r, c) {
    var ctx = this.ctx;
    ctx.save();
    ctx.setLineDash([4, 3]);
    this.poli(this.rombo(r, c, 0.1, 1), 'rgba(239,68,68,0.15)', '#ef4444', 1.5);
    ctx.restore();
    var p = this.P(r + 0.5, c + 0.5, 8);
    ctx.fillStyle = '#ef4444'; ctx.font = '700 13px Outfit, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', p[0], p[1]);
  };

  // ---------- agentes genéricos ----------

  Escena.prototype.agenteGenerico = function (spec, r, c, salto, horiz, ag) {
    var ctx = this.ctx;
    var color = spec.color || '#0ea5e9';
    var z = salto;
    var base = this.P(r + 0.5, c + 0.5, 0);
    switch (spec.dibujo) {
      case 'persona': {
        var y = base[1] - z;
        if (spec.linterna) {
          ctx.save();
          var g = ctx.createRadialGradient(base[0], y - 14, 2, base[0], y - 14, 95);
          g.addColorStop(0, 'rgba(253,230,138,0.38)'); g.addColorStop(1, 'rgba(253,230,138,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(base[0], y - 14, 95, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = color;
        ctx.fillRect(base[0] - 5, y - 22, 10, 14);
        ctx.fillStyle = '#1f2937';
        var paso = this.quieto || !ag.andando ? 0 : Math.sin(this.t / 80) * 2;
        ctx.fillRect(base[0] - 5, y - 8, 4, 8 + paso);
        ctx.fillRect(base[0] + 1, y - 8, 4, 8 - paso);
        this.elipse(base[0], y - 27, 5.5, 5.5, '#f2c39b');
        if (spec.birrete) this.poli([[base[0] - 9, y - 31], [base[0], y - 35], [base[0] + 9, y - 31], [base[0], y - 28]], '#1f2937');
        else this.elipse(base[0], y - 30, 5.5, 3, '#3f2a1d');
        if (spec.linterna) this.elipse(base[0] + 7, y - 14, 3, 3, '#fde68a');
        if (this.lleva.length) this.elipse(base[0] - 6, y - 18, 3.5, 5, '#a16207');
        break;
      }
      case 'vehiculo': {
        var largo = spec.largo;
        var u0 = horiz ? (largo ? 0.02 : 0.12) : 0.24;
        var u1 = horiz ? (largo ? 0.98 : 0.88) : 0.76;
        var v0 = horiz ? 0.24 : (largo ? 0.02 : 0.12);
        var v1 = horiz ? 0.76 : (largo ? 0.98 : 0.88);
        this.prisma(r, c, u0, v0, u1, v1, z + 3, z + (largo ? 22 : 12), color);
        if (largo) {
          for (var w = 0; w < 4; w += 1) {
            var f = 0.12 + w * 0.2;
            if (horiz) this.poli([this.P(r + v1, c + f, z + 12), this.P(r + v1, c + f + 0.14, z + 12), this.P(r + v1, c + f + 0.14, z + 18), this.P(r + v1, c + f, z + 18)], '#1e3a5f');
            else this.poli([this.P(r + f, c + u1, z + 12), this.P(r + f + 0.14, c + u1, z + 12), this.P(r + f + 0.14, c + u1, z + 18), this.P(r + f, c + u1, z + 18)], '#1e3a5f');
          }
        } else {
          this.prisma(r, c, u0 + 0.12, v0 + 0.08, u1 - 0.12, v1 - 0.08, z + 12, z + 18, '#cbd5e1', { top: tono(color, 0.2) });
        }
        break;
      }
      case 'dron': {
        var alto = 34 + (this.quieto ? 0 : Math.sin(this.t / 260) * 3);
        this.elipse(base[0], base[1], 14, 6, 'rgba(0,0,0,0.25)');
        var cz = this.P(r + 0.5, c + 0.5, alto + z);
        var brazos = [[-14, -5], [14, -5], [-14, 5], [14, 5]];
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
        brazos.forEach(function (d) { ctx.beginPath(); ctx.moveTo(cz[0], cz[1]); ctx.lineTo(cz[0] + d[0], cz[1] + d[1]); ctx.stroke(); });
        var self = this;
        var giro = this.quieto ? 0 : this.t / 30;
        brazos.forEach(function (d, i) { self.elipse(cz[0] + d[0], cz[1] + d[1], 8, 2.5 + Math.abs(Math.sin(giro + i)) * 1.5, 'rgba(148,163,184,0.55)'); });
        this.elipse(cz[0], cz[1], 8, 5, '#f8fafc', '#334155');
        this.elipse(cz[0], cz[1] - 2, 4, 2.5, '#0ea5e9');
        if (this.bateria != null) {
          ctx.fillStyle = '#0f172a'; ctx.fillRect(cz[0] - 12, cz[1] - 16, 24, 5);
          ctx.fillStyle = this.bateria > 30 ? '#22c55e' : this.bateria > 10 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(cz[0] - 11, cz[1] - 15, Math.max(0, 22 * this.bateria / 100), 3);
        }
        break;
      }
      case 'orbe': {
        var pc = this.P(r + 0.5, c + 0.5, 12 + z);
        var pu = this.quieto ? 0.5 : 0.5 + 0.5 * Math.sin(this.t / 120);
        ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 24;
        this.elipse(pc[0], pc[1], 9 + pu * 3, 9 + pu * 3, color);
        ctx.restore();
        this.elipse(pc[0] - 2, pc[1] - 3, 3, 3, 'rgba(255,255,255,0.7)');
        break;
      }
      case 'robot': {
        this.prisma(r, c, 0.24, 0.24, 0.76, 0.76, z, z + 3, '#1e293b');
        this.prisma(r, c, 0.24, 0.24, 0.76, 0.76, z + 3, z + 16, color, { top: tono(color, 0.25) });
        this.prisma(r, c, 0.36, 0.36, 0.64, 0.64, z + 16, z + 26, '#f8fafc', { top: '#e2e8f0' });
        var ojo = this.P(r + 0.64, c + 0.5, z + 22);
        this.elipse(ojo[0], ojo[1], 4, 2, '#0f172a');
        this.elipse(ojo[0], ojo[1], 1.5, 1.2, (this.quieto || Math.sin(this.t / 200) > 0) ? '#22d3ee' : '#0e7490');
        break;
      }
      default:
        this.rover(r, c, salto, horiz);
    }
  };

  root.Iso = {
    Escena: Escena,
    TEMAS: TEMAS,
    fondo: function (def) { return (def.escena || TEMAS[def.tema] || TEMAS.casa).fondo; }
  };
})(window);
