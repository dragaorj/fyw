/* Fyw — menu completo nas páginas internas (projetos, todos os projetos, privacidade)
   Mesmo menu da página inicial: abas Menu principal / Acessibilidade, idioma, tema e a doca ao rolar.
   Usa as mesmas preferências salvas (fio-theme, fio-lang, fio-a11y), então vale para o site todo. */
(function () {
  'use strict';
  var d = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k, f) { try { var v = localStorage.getItem(k); return v === null ? f : v; } catch (e) { return f; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var DICT = window.FIO_I18N || {};
  var menu = $('#mobile-menu'); if (!menu) return;
  var btns = $$('.menu-btn, .dock-menu');
  var dock = $('.dock'), nav = $('.nav');

  /* véu desfocado atrás do menu (igual à página inicial) */
  var veil = document.createElement('div'); veil.className = 'page-veil'; veil.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil);

  /* abrir / fechar */
  var mmTabs = $$('.mm-tab', menu), mmPanes = $$('.mm-pane', menu);
  function setTab(name) {
    mmTabs.forEach(function (b) { var on = b.dataset.pane === name; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    mmPanes.forEach(function (p) { p.hidden = p.dataset.pane !== name; });
  }
  function setMenu(open) {
    menu.hidden = !open;
    btns.forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
    veil.classList.toggle('is-on', open); document.body.classList.toggle('veil-on', open);
    if (!open) setTimeout(function () { setTab('main'); }, 300);
  }
  btns.forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); setMenu(menu.hidden); }); });
  veil.addEventListener('click', function () { setMenu(false); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); var b = $('.menu-btn'); if (b && b.offsetParent) b.focus(); } });
  mmTabs.forEach(function (b) {
    b.addEventListener('click', function () { setTab(b.dataset.pane); });
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var i = mmTabs.indexOf(b), n = mmTabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + mmTabs.length) % mmTabs.length];
      setTab(n.dataset.pane); n.focus();
    });
  });

  /* idioma (textos do menu e da navegação; o conteúdo das páginas de projeto é em português) */
  var lang = (function () { var s = store.get('fio-lang', null); if (s && DICT[s]) return s; var n = (navigator.language || 'pt').slice(0, 2); return DICT[n] ? n : 'en'; })();
  function applyTexts() {
    var t = DICT[lang]; if (!t) return;
    $$('[data-i18n]').forEach(function (el) { var v = t[el.dataset.i18n]; if (v !== undefined) el.textContent = v; });
    $$('[data-i18n-aria]').forEach(function (el) { var v = t[el.dataset.i18nAria]; if (v !== undefined) el.setAttribute('aria-label', v); });
    $$('.lang button', menu).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
  }
  $$('.lang button', menu).forEach(function (b) { b.addEventListener('click', function () { lang = b.dataset.lang; store.set('fio-lang', lang); applyTexts(); }); });
  applyTexts();

  /* tema */
  $$('.mm-theme').forEach(function (b) { b.addEventListener('click', function () { var t = d.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; d.setAttribute('data-theme', t); store.set('fio-theme', t); }); });

  /* acessibilidade (mesmas opções e regras da página inicial) */
  var a11y = (function () { try { return JSON.parse(store.get('fio-a11y', '{}')) || {}; } catch (e) { return {}; } })();
  if (!a11y.size) a11y.size = 1;
  function saveA11y() { store.set('fio-a11y', JSON.stringify(a11y)); }
  function renderA11y() {
    d.style.setProperty('--fs-scale', a11y.size);
    var out = $('.a11y-size-val', menu); if (out) out.textContent = Math.round(a11y.size * 100) + '%';
    ['contrast', 'motion', 'clean', 'links', 'spacing'].forEach(function (k) {
      d.classList.toggle('a11y-' + k, !!a11y[k]);
      var b = $('.a11y-opt[data-opt="' + k + '"]', menu); if (b) b.setAttribute('aria-pressed', String(!!a11y[k]));
    });
  }
  $$('.a11y-stepper button', menu).forEach(function (b) { b.addEventListener('click', function () {
    a11y.size = Math.min(1.5, Math.max(0.9, Math.round((a11y.size + Number(b.dataset.size) * 0.1) * 10) / 10)); renderA11y(); saveA11y();
  }); });
  $$('.a11y-opt', menu).forEach(function (b) { b.addEventListener('click', function () { var k = b.dataset.opt; a11y[k] = !a11y[k]; renderA11y(); saveA11y(); }); });
  var rs = $('.a11y-reset', menu); if (rs) rs.addEventListener('click', function () { a11y = { size: 1 }; renderA11y(); saveA11y(); });
  renderA11y();

  /* brilho de cor que segue o mouse dentro do menu (igual à página inicial) */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var put = function (x, y, w, h) {
      menu.style.setProperty('--gx', x.toFixed(0) + 'px'); menu.style.setProperty('--gy', y.toFixed(0) + 'px');
      menu.style.setProperty('--nx', (x / w - 0.5).toFixed(3)); menu.style.setProperty('--ny', (y / h - 0.5).toFixed(3));
    };
    var rest = function () { var w = menu.offsetWidth, h = menu.offsetHeight; put(w * 0.92, 0, w || 1, h || 1); };
    new MutationObserver(function () { if (!menu.hidden) rest(); }).observe(menu, { attributes: true, attributeFilter: ['hidden'] });
    var ev = null, raf = 0, inside = false;
    var frame = function () {
      raf = 0; if (!ev || menu.hidden) return;
      var hit = menu.contains(ev.target);
      if (hit !== inside) { inside = hit; menu.classList.toggle('is-glow', hit); if (!hit) rest(); }
      if (!hit) return;
      var r = menu.getBoundingClientRect(); put(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
    };
    addEventListener('pointermove', function (e) { ev = e; if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
    document.addEventListener('pointerleave', function () { inside = false; menu.classList.remove('is-glow'); rest(); });
  }

  /* doca: ao rolar, a barra do topo sai e a doca (logo, menu e topo) fica sempre à mão */
  var on = null;
  function u() { var s = window.scrollY > 320; if (s !== on) { on = s; if (dock) dock.classList.toggle('is-on', s); document.body.classList.toggle('dock-on', s); if (nav) nav.classList.toggle('is-gone', s); } }
  addEventListener('scroll', u, { passive: true }); u();
  var top = $('.dock-top'); if (top) top.addEventListener('click', function () { var m = matchMedia('(prefers-reduced-motion: reduce)').matches || a11y.motion; window.scrollTo({ top: 0, behavior: m ? 'auto' : 'smooth' }); });
})();
