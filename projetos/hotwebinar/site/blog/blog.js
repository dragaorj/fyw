/* Hotwebinar · blog: menu do celular, filtro por categoria, barra de leitura, índice ativo, copiar link e entrada ao rolar */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  // menu do celular
  var hd = $('.hd'), dr = $('.drawer'), bt = $('.hd-burger');
  function menu(open) { dr.hidden = !open; hd.classList.toggle('is-open', open); bt.setAttribute('aria-expanded', String(open)); document.documentElement.style.overflow = open ? 'hidden' : ''; }
  bt.addEventListener('click', function () { menu(dr.hidden); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dr.hidden) menu(false); });

  // entrada ao rolar
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el, i) { el.style.transitionDelay = (Math.min(i, 4) * 60) + 'ms'; io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // filtro por categoria (também abre filtrado vindo de /blog/#estrategia)
  var fb = $$('.bl-filter button'), cards = $$('.bl-list .bl-card'), empty = $('.bl-empty');
  function filter(f) {
    var n = 0;
    fb.forEach(function (b) { b.classList.toggle('on', b.dataset.f === f); });
    cards.forEach(function (c) { var on = f === '*' || c.dataset.cat === f; c.hidden = !on; if (on) { n++; c.classList.add('in'); } });
    if (empty) empty.hidden = n > 0;
  }
  fb.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); history.replaceState(null, '', b.dataset.f === '*' ? location.pathname : '#' + b.dataset.f); }); });
  var h = location.hash.slice(1);
  if (fb.length && h && fb.some(function (b) { return b.dataset.f === h; })) filter(h);

  // barra de leitura e índice ativo
  var prog = $('.bl-prog i'), body = $('.bl-body'), toc = $$('.bl-toc a'), hs = toc.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  if (prog && body) {
    var tick = function () {
      var r = body.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight * .6)));
      prog.style.transform = 'scaleX(' + p + ')';
      var cur = 0; hs.forEach(function (el, i) { if (el && el.getBoundingClientRect().top < innerHeight * .35) cur = i; });
      toc.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    };
    addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); tick();
  }

  // copiar link
  $$('.js-copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var done = function () { b.classList.add('is-done'); b.textContent = 'Link copiado'; setTimeout(function () { b.classList.remove('is-done'); b.textContent = 'Copiar link'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done); else done();
    });
  });
})();
