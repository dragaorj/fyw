/* Prévia de landing page (páginas de projeto): a tela rola sozinha enquanto está visível.
   Se a pessoa rolar ou tocar, a rolagem automática pausa e retoma sozinha ~2,5s depois, de onde ela parou. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.lp-scroll').forEach(function (box) {
    var on = false, raf = 0, last = 0, dir = 1, wait = 0, pausedUntil = 0, pos = 0;
    var SPEED = 55; // px por segundo
    function step(t) {
      raf = 0; if (!on) return;
      var dt = last ? Math.min(64, t - last) : 16; last = t;
      if (performance.now() < pausedUntil) { pos = box.scrollTop; raf = requestAnimationFrame(step); return; }
      var max = box.scrollHeight - box.clientHeight;
      if (max > 0) {
        if (wait > 0) { wait -= dt; } else {
          pos += dir * SPEED * dt / 1000;
          if (pos >= max) { pos = max; dir = -1; wait = 1800; }
          else if (pos <= 0) { pos = 0; dir = 1; wait = 1800; }
          box.scrollTop = pos;
        }
      }
      raf = requestAnimationFrame(step);
    }
    function go() { if (!raf && on && !reduce) { last = 0; pos = box.scrollTop; raf = requestAnimationFrame(step); } }
    function pause() { pausedUntil = performance.now() + 2500; }
    ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(function (ev) { box.addEventListener(ev, pause, { passive: true }); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on) go(); }, { threshold: 0.25 }).observe(box);
    } else { on = true; go(); }
  });
})();
