/* Prévia de landing page (páginas de projeto): a tela rola sozinha enquanto está visível.
   Se a pessoa rolar, tocar ou clicar, a rolagem automática pausa e retoma ~2,5s depois, de onde ela parou.
   Dois tipos de tela:
   - imagem longa dentro de .lp-scroll (rola a própria moldura);
   - landing de verdade (.lp-live > iframe): a página é desenhada na largura real (1440 / 390), reduzida para caber,
     e rola por dentro do iframe — assim o menu fixo, os botões e os links funcionam como no site real. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  function autoScroll(box, t) {
    // t = { top(), set(y), max(), scale() }: abstrai "moldura" ou "janela do iframe"
    // rolagem contínua por tempo, sem animação suave do navegador no meio, sem medir a página a cada quadro
    var ema = 0, tick = 0, on = false, raf = 0, last = 0, dir = 1, wait = 0, pausedUntil = 0, pos = 0, shown = -1, max = 0, maxAt = 0;
    function getMax(now) { if (now - maxAt > 1000 || max <= 0) { max = t.max(); maxAt = now; } return max; }
    function step(now) {
      raf = 0; if (!on) return;
      var dt = last ? Math.min(50, now - last) : 16; last = now;
      if (now < pausedUntil) { pos = t.top(); shown = -1; raf = requestAnimationFrame(step); return; }
      var m = getMax(now);
      if (m > 0) {
        if (wait > 0) { wait -= dt; } else {
          // 1 pixel físico a cada N quadros, com N tirado da taxa de atualização da tela (60 Hz: 1, 120/144 Hz: 2, 154+ Hz: 3):
          // cadência sempre regular, sem quadros alternando entre parado e andando
          var dpr = window.devicePixelRatio || 1, unit = Math.max(1, Math.round(dpr)), sc = t.scale ? t.scale() : 1;
          ema = ema ? ema * 0.95 + dt * 0.05 : dt;
          var N = Math.max(1, Math.round(16.667 / ema));
          tick = (tick + 1) % N;
          var frames = tick === 0 ? 1 : 0;
          // passo alinhado à grade de pixels da página rolada (evita passos alternando 0,8 / 1,6)
          var g = 1 / dpr, stepPx = Math.max(g, Math.round((unit / dpr) / sc / g) * g);
          pos = Math.round(pos / g) * g + dir * frames * stepPx;
          if (pos >= m) { pos = m; dir = -1; wait = 1800; }
          else if (pos <= 0) { pos = 0; dir = 1; wait = 1800; }
          if (pos !== shown) { t.set(pos); shown = pos; }
        }
      }
      raf = requestAnimationFrame(step);
    }
    function go() { if (!raf && on && !reduce) { last = 0; pos = t.top(); shown = -1; maxAt = 0; raf = requestAnimationFrame(step); } }
    function pause() { pausedUntil = performance.now() + 2500; }
    box._pause = pause;
    box._reset = function () { pos = 0; dir = 1; wait = 1200; maxAt = 0; t.set(0); };
    ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(function (ev) { box.addEventListener(ev, pause, { passive: true }); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on) go(); }, { threshold: 0.1 }).observe(box);
    } else { on = true; go(); }
  }

  document.querySelectorAll('.lp-scroll').forEach(function (box) {
    var wrap = box.querySelector('.lp-live');
    if (!wrap) {
      autoScroll(box, { top: function () { return box.scrollTop; }, set: function (y) { box.scrollTo({ top: y, behavior: 'instant' }); }, max: function () { return box.scrollHeight - box.clientHeight; } });
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
    // site de outro domínio com tela de carregamento: mostra a imagem do site até ele ficar pronto
    if (wrap.dataset.poster) { wrap.style.backgroundImage = 'url(' + wrap.dataset.poster + ')'; wrap.classList.add('has-poster'); }
    // a bolinha do cursor da página some enquanto o mouse está dentro da moldura (lá dentro há outra)
    var pc = document.querySelector('.cursor');
    if (pc) { f.addEventListener('mouseenter', function () { pc.classList.add('is-hidden'); }); f.addEventListener('mouseleave', function () { pc.classList.remove('is-hidden'); }); }
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box); else addEventListener('resize', fit);
    function win() { try { return f.contentWindow; } catch (e) { return null; } }
    autoScroll(box, {
      scale: s,
      top: function () { var w = win(); return w ? w.scrollY : 0; },
      set: function (y) { var w = win(); if (w) w.scrollTo({ top: y, behavior: 'instant' }); },
      max: function () { var w = win(); try { return w.document.documentElement.scrollHeight - w.innerHeight; } catch (e) { return 0; } }
    });
    f.addEventListener('load', function () {
      fit();
      if (box._reset) box._reset();
      wrap.classList.add('is-ready');
      if (wrap.dataset.poster) setTimeout(function () { wrap.classList.add('is-shown'); }, +wrap.dataset.delay || 0);
      try {
        var d = f.contentWindow.document;
        d.documentElement.classList.add('in-frame');
        d.documentElement.style.scrollBehavior = 'auto';
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
