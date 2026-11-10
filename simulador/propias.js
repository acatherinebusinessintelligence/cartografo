/*
 * Misiones propias: las que arman los estudiantes en taller.html.
 * Se guardan en este navegador, se descargan en JSON o se comparten por enlace
 * (el caso completo viaja dentro de la dirección, después de #caso=).
 */
(function (root) {
  'use strict';

  var CLAVE = 'cartografo.misiones.propias';

  function leer() {
    try {
      var l = JSON.parse(localStorage.getItem(CLAVE) || '[]');
      return Array.isArray(l) ? l : [];
    } catch (e) { return []; }
  }

  function guardar(def) {
    var l = leer().filter(function (d) { return d.id !== def.id; });
    l.push(def);
    try { localStorage.setItem(CLAVE, JSON.stringify(l)); return true; } catch (e) { return false; }
  }

  function borrar(id) {
    var l = leer().filter(function (d) { return d.id !== id; });
    try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch (e) { /* sin espacio */ }
  }

  function codificar(def) {
    var b = btoa(unescape(encodeURIComponent(JSON.stringify(def))));
    return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodificar(texto) {
    var t = texto.replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) t += '=';
    return JSON.parse(decodeURIComponent(escape(atob(t))));
  }

  // Devuelve un mensaje si el caso no se puede abrir, o null si está bien formado.
  function validar(def) {
    if (!def || typeof def !== 'object') return 'El archivo no contiene una misión.';
    var faltan = ['titulo', 'mapa', 'leyenda', 'tipos', 'agente'].filter(function (k) { return !def[k]; });
    if (faltan.length) return 'Le falta: ' + faltan.join(', ') + '.';
    try {
      var m = root.Nucleo.crearMundo(def);
      var p = root.Nucleo.compilar(m);
      if (p.inicio < 0) return 'El mapa no tiene inicio para el agente.';
    } catch (e) { return e.message; }
    return null;
  }

  root.Propias = { leer: leer, guardar: guardar, borrar: borrar, codificar: codificar, decodificar: decodificar, validar: validar };
})(window);
