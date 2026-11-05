/* Prévia de landing page (páginas de projeto): a tela rola sozinha enquanto está visível.
   Se a pessoa rolar, tocar ou clicar, a rolagem automática pausa e retoma ~2,5s depois, de onde ela parou.
   Dois tipos de tela:
   - imagem longa dentro de .lp-scroll (rola a própria moldura);
   - landing de verdade (.lp-live > iframe): a página é desenhada na largura real (1440 / 390), reduzida para caber,
     e rola por dentro do iframe — assim o menu fixo, os botões e os links funcionam como no site real. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = 55; // px por segundo (na escala da moldura)

  function autoScroll(box, t) {
    // t = { top(), set(y), max(), scale() }: abstrai "moldura" ou "janela do iframe"
    var on = false, raf = 0, last = 0, dir = 1, wait = 0, pausedUntil = 0, pos = 0;
    function step(now) {
      raf = 0; if (!on) return;
      var dt = last ? Math.min(64, now - last) : 16; last = now;
      if (performance.now() < pausedUntil) { pos = t.top(); raf = requestAnimationFrame(step); return; }
      var max = t.max();
      if (max > 0) {
        if (wait > 0) { wait -= dt; } else {
          pos += dir * SPEED / (t.scale ? t.scale() : 1) * dt / 1000;
          if (pos >= max) { pos = max; dir = -1; wait = 1800; }
          else if (pos <= 0) { pos = 0; dir = 1; wait = 1800; }
          t.set(pos);
        }
      }
      raf = requestAnimationFrame(step);
    }
    function go() { if (!raf && on && !reduce) { last = 0; pos = t.top(); raf = requestAnimationFrame(step); } }
    function pause() { pausedUntil = performance.now() + 2500; }
    box._pause = pause;
    box._reset = function () { pos = 0; dir = 1; wait = 1200; t.set(0); };
    ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(function (ev) { box.addEventListener(ev, pause, { passive: true }); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on) go(); }, { threshold: 0.25 }).observe(box);
    } else { on = true; go(); }
  }

  document.querySelectorAll('.lp-scroll').forEach(function (box) {
    var wrap = box.querySelector('.lp-live');
    if (!wrap) {
      autoScroll(box, { top: function () { return box.scrollTop; }, set: function (y) { box.scrollTop = y; }, max: function () { return box.scrollHeight - box.clientHeight; } });
      return;
    }
    // landing de verdade
    box.classList.add('is-live');
    var f = wrap.querySelector('iframe'), W = +wrap.dataset.w || 1440;
    function s() { return box.clientWidth / W || 1; }
    function fit() {
      var k = s();
      f.style.width = W + 'px';
      f.style.height = Math.ceil((wrap.clientHeight || box.clientHeight) / k) + 2 + 'px';
      f.style.transform = 'scale(' + k + ')';
    }
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box); else addEventListener('resize', fit);
    function win() { try { return f.contentWindow; } catch (e) { return null; } }
    autoScroll(box, {
      scale: s,
      top: function () { var w = win(); return w ? w.scrollY : 0; },
      set: function (y) { var w = win(); if (w) w.scrollTo(0, y); },
      max: function () { var w = win(); try { return w.document.documentElement.scrollHeight - w.innerHeight; } catch (e) { return 0; } }
    });
    f.addEventListener('load', function () {
      fit();
      if (box._reset) box._reset();
      wrap.classList.add('is-ready');
      try {
        var d = f.contentWindow.document;
        d.documentElement.classList.add('in-frame');
        // o que a pessoa faz dentro da landing também pausa a rolagem automática
        ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(function (ev) { d.addEventListener(ev, function () { box._pause(); }, { passive: true }); });
      } catch (e) {}
    });
  });

  // abas de páginas (ex.: Home / Home V2 / Institucional): troca as telas do navegador e do celular juntas
  document.querySelectorAll('.lp-tabs').forEach(function (tabs) {
    var sec = tabs.closest('.lp-sec'); if (!sec) return;
    var dImg = sec.querySelector('.lp-browser img'), mImg = sec.querySelector('.lp-phone img'), title = sec.querySelector('.lp-title');
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.lp-tab'); if (!b || b.classList.contains('is-on')) return;
      tabs.querySelectorAll('.lp-tab').forEach(function (t) { var on = t === b; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
      if (dImg) { dImg.width = +b.dataset.dw; dImg.height = +b.dataset.dh; dImg.src = b.dataset.d; }
      if (mImg) { mImg.width = +b.dataset.mw; mImg.height = +b.dataset.mh; mImg.src = b.dataset.m; }
      if (title && b.dataset.title) title.textContent = b.dataset.title;
      // páginas de verdade: troca o endereço dos iframes (navegador e celular) e o botão "Abrir o site"
      if (b.dataset.src) {
        sec.querySelectorAll('.lp-live').forEach(function (w) { w.classList.remove('is-ready'); var f = w.querySelector('iframe'); if (f) f.src = b.dataset.src; });
        var open = sec.querySelector('.lp-open'); if (open) open.href = b.dataset.src.replace(/\?.*$/, '');
        return;
      }
      sec.querySelectorAll('.lp-scroll').forEach(function (s) { if (s._reset) s._reset(); else s.scrollTop = 0; });
    });
  });
})();
