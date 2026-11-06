/* Nome "Marlon Dias" no texto da história: com o mouse em cima, o cursor vira a foto dele (horizontal), acompanhando o mouse */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var SRC = 'assets/img/marlon.webp?v=1';
  var pop = null, img = null, on = false, raf = 0, x = 0, y = 0, cx = 0, cy = 0, vx = 0;
  var make = function () {
    pop = document.createElement('span'); pop.className = 'founder-pop'; pop.setAttribute('aria-hidden', 'true');
    img = new Image(); img.src = SRC; img.alt = ''; img.decoding = 'async'; img.width = 480; img.height = 320;
    pop.appendChild(img); document.body.appendChild(pop);
  };
  var tick = function () {
    raf = 0;
    var nx = cx + (x - cx) * 0.22, ny = cy + (y - cy) * 0.22; vx = nx - cx; cx = nx; cy = ny;
    var tilt = Math.max(-8, Math.min(8, vx * 0.6));
    pop.style.transform = 'translate3d(' + (cx + 18).toFixed(1) + 'px,' + (cy - pop.offsetHeight / 2).toFixed(1) + 'px,0) rotate(' + tilt.toFixed(2) + 'deg)';
    if (on || Math.abs(x - cx) > .3 || Math.abs(y - cy) > .3) raf = requestAnimationFrame(tick);
  };
  var go = function () { if (!raf) raf = requestAnimationFrame(tick); };
  document.addEventListener('pointerover', function (e) {
    var a = e.target.closest && e.target.closest('.story-link'); if (!a || on) return;
    if (!pop) make();
    on = true; x = cx = e.clientX; y = cy = e.clientY; pop.classList.add('on'); document.documentElement.classList.add('founder-on'); go();
  });
  document.addEventListener('pointerout', function (e) {
    var a = e.target.closest && e.target.closest('.story-link'); if (!a || !on) return;
    if (e.relatedTarget && a.contains(e.relatedTarget)) return;
    on = false; pop.classList.remove('on'); document.documentElement.classList.remove('founder-on');
  });
  addEventListener('pointermove', function (e) { if (!on) return; x = e.clientX; y = e.clientY; go(); }, { passive: true });
  // ao rolar, só fecha se o nome realmente saiu de baixo do mouse (a rolagem suave dispara eventos à toa)
  var hide = function () { on = false; pop.classList.remove('on'); document.documentElement.classList.remove('founder-on'); };
  addEventListener('scroll', function () { if (!on) return; var el = document.elementFromPoint(x, y); if (!(el && el.closest && el.closest('.story-link'))) hide(); }, { passive: true });
  // a foto já fica baixada quando o navegador estiver livre (aparece na hora no primeiro hover)
  var pre = function () { var p = new Image(); p.src = SRC; };
  if (window.requestIdleCallback) requestIdleCallback(pre, { timeout: 4000 }); else setTimeout(pre, 2500);
})();
