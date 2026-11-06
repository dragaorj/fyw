/* Pausa as animações em CSS das seções que estão fora da tela (topo, história, desempenho).
   Elas continuam iguais na tela; só deixam de gastar o processador quando ninguém está vendo. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var els = document.querySelectorAll('.hero, #story, #performance');
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-offscreen', !e.isIntersecting); }); }, { rootMargin: '120px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
