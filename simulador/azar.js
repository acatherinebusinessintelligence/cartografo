// Azar reproducible: la misma semilla da la misma realidad en el navegador y en Python.
// mulberry32, idéntico a python/cartografo/azar.py.
(function (root) {
  'use strict';
  function crear(semilla) {
    var a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ (t + (Math.imul(t ^ (t >>> 7), t | 61) >>> 0))) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var api = { crear: crear };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Azar = api;
})(typeof window !== 'undefined' ? window : this);
