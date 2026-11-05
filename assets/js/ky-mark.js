/* Kyoto — logo vetorial sendo desenhado na vitrine de Branding */
(function () {
  var box = document.querySelector('[data-kymark]'); if (!box) return;
  var svg = box.querySelector('.ky-logo');
  // barras do sol sobem de baixo para cima (ordem pela posição vertical)
  var bars = Array.prototype.slice.call(svg.querySelectorAll('.s'));
  bars.map(function (p) { return { p: p, y: p.getBBox().y }; })
    .sort(function (a, b) { return b.y - a.y; })
    .forEach(function (o, i) { o.p.style.setProperty('--d', (0.55 + i * 0.09) + 's'); });
  svg.querySelectorAll('.l').forEach(function (p, i, all) { p.style.setProperty('--d', (1.25 + (all.length - 1 - i) * 0.12) + 's'); });
  svg.querySelectorAll('.k').forEach(function (p, i, all) { p.style.setProperty('--d', (2.5 + (all.length - 1 - i) * 0.06) + 's'); });
  svg.querySelectorAll('.ky-guides > *').forEach(function (p, i) { p.style.setProperty('--d', (i * 0.12) + 's'); });

  function play() {
    box.classList.remove('go'); void box.offsetWidth; box.classList.add('go');
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !box.classList.contains('go')) play(); });
    }, { threshold: 0.35 });
    io.observe(box);
  } else play();
  // ao trocar para Branding, toca de novo
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.pp2-svc-b[data-svc="branding"]');
    if (b) setTimeout(play, 60);
  });
  box.querySelector('.ky-mark-replay').addEventListener('click', play);

  // linhas do fundo acompanham o mouse
  box.addEventListener('pointermove', function (e) {
    var r = box.getBoundingClientRect();
    box.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    box.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });
})();
