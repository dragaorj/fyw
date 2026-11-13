/* Kyoto · apresentação da marca. Dá a cada bloco [data-ky-p] o quanto ele já passou pela tela (--p, 0 a 1),
   faz o kit seguir o mouse (--mx/--my) e alterna os pesos da tipografia. Respeita o movimento reduzido. */
(function () {
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduz || document.documentElement.classList.contains('a11y-motion')) return;
  var els = [].slice.call(document.querySelectorAll('[data-ky-p]'));
  var raf = 0;
  function tick() {
    raf = 0;
    var vh = window.innerHeight || 800;
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      var p = (vh - r.top) / (vh + r.height);
      els[i].style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(4));
    }
  }
  function pede() { if (!raf) raf = requestAnimationFrame(tick); }
  addEventListener('scroll', pede, { passive: true });
  addEventListener('resize', pede);
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.pp2-svc-b')) setTimeout(tick, 60); });
  tick();

  // kit: as peças acompanham o mouse, cada uma numa profundidade
  var kit = document.querySelector('.ky-kit');
  if (kit && window.matchMedia('(hover: hover)').matches) {
    kit.addEventListener('pointermove', function (e) {
      var r = kit.getBoundingClientRect();
      kit.style.setProperty('--mx', (((e.clientX - r.left) / r.width) - .5).toFixed(3));
      kit.style.setProperty('--my', (((e.clientY - r.top) / r.height) - .5).toFixed(3));
    });
    kit.addEventListener('pointerleave', function () { kit.style.setProperty('--mx', 0); kit.style.setProperty('--my', 0); });
  }

  // tipografia: o "Aa" passa pelos pesos da fonte enquanto está na tela
  var aa = document.querySelector('.ky-aa'), lis = [].slice.call(document.querySelectorAll('.ky-weights li'));
  if (aa && lis.length) {
    var pesos = [100, 300, 400, 700, 900], i = 2, timer = 0;
    function passo() { i = (i + 1) % pesos.length; aa.style.setProperty('--w', pesos[i]); lis.forEach(function (l, k) { l.classList.toggle('on', k === i); }); }
    lis[i].classList.add('on');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { if (!timer) timer = setInterval(passo, 1400); } else { clearInterval(timer); timer = 0; } }); }, { threshold: .3 }).observe(aa);
    }
  }
})();
