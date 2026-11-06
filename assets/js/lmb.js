/* Let Me Be — antes e depois arrastável + logo vetorial sendo desenhado */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-motion');

  // ---- antes e depois: arrastar (ou passar o mouse) para comparar ----
  var ba = document.querySelector('[data-ba]');
  if (ba) {
    // a linha anda sozinha de um lado para o outro; quando a pessoa mexe, ela obedece,
    // e depois de alguns segundos parada volta a passear a partir de onde ficou
    var range = ba.querySelector('.lmb-ba-range'), p = 50, goal = 50, drag = false, lastUser = -1e9, vis = false, raf = 0, last = 0, ph = 0, IDLE = 3500, AMP = 44;
    var paint = function () {
      ba.style.setProperty('--p', p.toFixed(2) + '%');
      ba.style.setProperty('--m', (p * 1.16 - 8).toFixed(2) + '%'); // borda suave: o degradê some por completo nos extremos
      range.value = Math.round(p);
    };
    var user = function () { lastUser = performance.now(); };
    var loop = function (t) {
      raf = 0; if (!vis) return;
      var dt = last ? Math.min(64, t - last) : 16; last = t;
      if (!drag && t - lastUser > IDLE && !reduce) { ph += dt / 1000 * 0.55; goal = 50 - AMP * Math.sin(ph); } // começa indo para a esquerda: abre mostrando o logo novo (depois)
      p += (goal - p) * (drag ? 0.35 : 0.08);
      paint(); raf = requestAnimationFrame(loop);
    };
    var go = function () { if (!raf && vis) { last = 0; raf = requestAnimationFrame(loop); } };
    var to = function (v) { user(); goal = Math.max(0, Math.min(100, v)); ph = Math.asin(Math.max(-1, Math.min(1, (50 - goal) / AMP))); go(); };
    var fromX = function (x) { var r = ba.getBoundingClientRect(); return (x - r.left) / r.width * 100; };
    ba.addEventListener('pointerdown', function (e) { drag = true; ba.classList.add('is-drag'); if (e.pointerType === 'mouse') ba.setPointerCapture(e.pointerId); to(fromX(e.clientX)); });
    ba.addEventListener('pointermove', function (e) { if (drag || e.pointerType === 'mouse') to(fromX(e.clientX)); });
    var end = function () { drag = false; ba.classList.remove('is-drag'); user(); };
    ba.addEventListener('pointerup', end); ba.addEventListener('pointercancel', end);
    // toque: arrasto horizontal move a linha; vertical continua rolando a página
    var sx = 0, sy = 0, lock = 0;
    ba.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; lock = 0; }, { passive: true });
    ba.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (!lock) lock = Math.abs(t.clientX - sx) > Math.abs(t.clientY - sy) ? 1 : 2; if (lock === 1) to(fromX(t.clientX)); }, { passive: true });
    range.addEventListener('input', function () { to(+range.value); p = goal; paint(); });
    paint();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) { lastUser = performance.now() - IDLE + 600; go(); } }, { threshold: 0.2 }).observe(ba);
    else { vis = true; go(); }
  }

  // ---- logo sendo desenhado ----
  var box = document.querySelector('[data-lmbdraw]');
  if (box) {
    var play = function () { box.classList.remove('go'); void box.offsetWidth; box.classList.add('go'); };
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !box.classList.contains('go')) play(); }); }, { threshold: 0.35 });
      io2.observe(box);
    } else play();
    box.querySelector('.lmb-draw-replay').addEventListener('click', play);
    box.addEventListener('pointermove', function (e) {
      var r = box.getBoundingClientRect();
      box.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      box.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  // ---- brilho interativo: gira e se inclina acompanhando o mouse; clique dá uma volta inteira ----
  var art = document.querySelector('[data-star]');
  if (art) {
    var rot = art.querySelector('.lmb-sym-rot'), cur = { r: 0, s: 1, x: 0, y: 0 }, tgt = { r: 0, s: 1, x: 0, y: 0 }, sraf = 0, extra = 0;
    var step = function () {
      sraf = 0; var k = reduce ? 1 : 0.12, moving = false;
      for (var key in cur) { var dv = tgt[key] + (key === 'r' ? extra : 0) - cur[key]; cur[key] += dv * k; if (Math.abs(dv) > 0.01) moving = true; }
      rot.style.transform = 'translate(' + cur.x.toFixed(2) + 'px,' + cur.y.toFixed(2) + 'px) rotate(' + cur.r.toFixed(2) + 'deg) scale(' + cur.s.toFixed(3) + ')';
      if (moving) sraf = requestAnimationFrame(step);
    };
    var sgo = function () { if (!sraf) sraf = requestAnimationFrame(step); };
    art.addEventListener('pointermove', function (e) {
      var r = art.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      tgt.r = nx * 180 + ny * 40; tgt.s = 1.14; tgt.x = nx * 36; tgt.y = ny * 36; art.classList.add('is-on'); sgo();
    });
    art.addEventListener('pointerleave', function () { tgt.r = 0; tgt.s = 1; tgt.x = 0; tgt.y = 0; sgo(); });
    art.addEventListener('click', function () { extra += 360; sgo(); });
  }

  // ---- faixas em movimento só andam quando estão na tela ----
  if ('IntersectionObserver' in window) {
    var io3 = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('lmb-paused', !e.isIntersecting); }); });
    document.querySelectorAll('.lmb-ticker, .lmb-strip, .lmb-social-stage').forEach(function (el) { io3.observe(el); });
  }
})();
