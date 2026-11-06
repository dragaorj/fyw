/* Botão "voltar ao topo" dos sites de projeto, na cor de cada marca.
   Uso: <script src=".../_shared/totop.js" data-bg="#06B051" data-fg="#FFFFFF" defer></script>
   Aparece depois de rolar um pouco; o anel em volta mostra quanto da página já foi lido. */
(function () {
  var s = document.currentScript, bg = (s && s.dataset.bg) || '#0B0B0B', fg = (s && s.dataset.fg) || '#FFFFFF';
  var css = '.ftt{position:fixed;right:max(18px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));z-index:2147483000;width:54px;height:54px;border:0;padding:0;border-radius:50%;cursor:pointer;background:var(--ftt-bg);color:var(--ftt-fg);display:grid;place-items:center;box-shadow:0 14px 30px -12px color-mix(in srgb,var(--ftt-bg) 75%,#000),0 2px 6px rgba(0,0,0,.12);opacity:0;transform:translateY(16px) scale(.9);pointer-events:none;transition:opacity .35s,transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .3s;-webkit-tap-highlight-color:transparent}'
    + '.ftt.on{opacity:1;transform:none;pointer-events:auto}'
    + '.ftt:hover{transform:translateY(-3px)}'
    + '.ftt:focus-visible{outline:2px solid var(--ftt-bg);outline-offset:4px}'
    + '.ftt .ftt-a{width:22px;height:22px;transition:transform .35s cubic-bezier(.2,.7,.2,1)}'
    + '.ftt:hover .ftt-a{transform:translateY(-2px)}'
    + '.ftt .ftt-r{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}'
    + '.ftt .ftt-r circle{fill:none;stroke:currentColor;stroke-width:2;opacity:.9;stroke-linecap:round;stroke-dasharray:157;transition:stroke-dashoffset .15s linear}'
    + '.ftt .ftt-r .ftt-t{opacity:.22;stroke-dashoffset:0!important}'
    + '@media (max-width:600px){.ftt{width:48px;height:48px}.ftt .ftt-a{width:20px;height:20px}}'
    + '@media (prefers-reduced-motion:reduce){.ftt,.ftt .ftt-a{transition:none}}';
  var hide = s && s.dataset.hide; if (hide) css += hide.split(',').map(function (x) { return x.trim() + ':not(.ftt)'; }).join(',') + '{display:none!important}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'ftt';
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  b.setAttribute('aria-label', lang === 'pt' ? 'Voltar ao topo' : lang === 'es' ? 'Volver arriba' : 'Back to top');
  b.style.setProperty('--ftt-bg', bg); b.style.setProperty('--ftt-fg', fg);
  b.innerHTML = '<svg class="ftt-r" viewBox="0 0 54 54" aria-hidden="true"><circle class="ftt-t" cx="27" cy="27" r="25"/><circle class="ftt-p" cx="27" cy="27" r="25"/></svg>'
    + '<svg class="ftt-a" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19.5V5.5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var add = function () { document.body.appendChild(b); upd(); };
  var p = b.querySelector('.ftt-p'), raf = 0;
  // se o site já tem algo fixo no canto (WhatsApp, CTA), o botão sobe e fica acima
  var lift = function () {
    var base = 18, top = innerHeight;
    document.querySelectorAll('body *').forEach(function (e) {
      if (e === b || b.contains(e)) return; var cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
      var r = e.getBoundingClientRect(); if (!r.width || r.width > 420 || r.height > 260) return;
      if (r.right > innerWidth - 90 && r.bottom > innerHeight - 140) top = Math.min(top, r.top);
    });
    b.style.bottom = (top < innerHeight ? Math.round(innerHeight - top + 12) : base) + 'px';
  };
  var upd = function () {
    raf = 0; var y = window.scrollY || document.documentElement.scrollTop, h = document.documentElement.scrollHeight - innerHeight;
    var on = y > Math.min(600, innerHeight * .7); if (on && !b.classList.contains('on')) lift(); b.classList.toggle('on', on);
    p.style.strokeDashoffset = (157 * (1 - (h > 0 ? Math.min(1, y / h) : 0))).toFixed(1);
  };
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
  addEventListener('resize', function () { lift(); upd(); });
  b.addEventListener('click', function () {
    var smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  });
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
