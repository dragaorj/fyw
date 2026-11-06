(function () {
  var d = document, root = d.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T = function (t) { return window.gfyT ? window.gfyT(t) : t; };

  // topo: fica sólido ao rolar
  var nav = d.querySelector('.nav');
  var onScroll = function () { if (nav) nav.classList.toggle('is-solid', scrollY > 30); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu do celular
  var burger = d.querySelector('.burger');
  if (burger) burger.addEventListener('click', function () {
    var open = !d.body.classList.contains('is-menu');
    d.body.classList.toggle('is-menu', open); burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  d.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', function () { d.body.classList.remove('is-menu'); }); });

  // revelar ao rolar
  var rv = d.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || reduce) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (e) { io.observe(e); });
  }

  // FAQ: um aberto por vez
  d.querySelectorAll('.faq').forEach(function (f) {
    f.addEventListener('toggle', function (e) { if (e.target.open) f.querySelectorAll('details[open]').forEach(function (x) { if (x !== e.target) x.open = false; }); }, true);
  });

  // painel de abertura da empresa: as etapas vão sendo concluídas uma a uma; no fim mostra "Complete", pausa e recomeça
  d.querySelectorAll('[data-track]').forEach(function (box) {
    var steps = box.querySelectorAll('.step'), n = steps.length, i = 0, label = box.querySelector('[data-track-label]'), card = box.querySelector('.app-card');
    var paint = function () {
      steps.forEach(function (s, k) {
        s.classList.toggle('done', k < i); s.classList.toggle('now', k === i);
        var st = s.querySelector('.st'); if (st) st.textContent = k < i ? T('Done') : k === i ? T('In progress') : T(s.dataset.eta);
      });
      if (label) { label.textContent = i >= n ? T('Complete') : T('In progress'); label.className = 'badge' + (i >= n ? '' : ' warn'); }
      box.classList.toggle('is-done', i >= n);
    };
    window.addEventListener('gfy:lang', paint);
    if (reduce) { i = n; paint(); return; } // sem animação: mostra a abertura concluída
    i = 1; paint();
    var next = function () {
      if (i < n) { i++; paint(); setTimeout(next, i < n ? 1700 : 3200); }
      else { card.classList.add('is-reset'); setTimeout(function () { i = 0; paint(); card.classList.remove('is-reset'); setTimeout(next, 1100); }, 420); }
    };
    setTimeout(next, 1700);
  });

  // tags do topo: abrem o painel da abertura da empresa ou o cartão da conta bancária
  var pops = d.querySelectorAll('[data-pop]');
  var closeAll = function (except) { pops.forEach(function (b) { if (b === except) return; b.setAttribute('aria-expanded', 'false'); var p = d.getElementById(b.dataset.pop); if (p) p.hidden = true; }); };
  pops.forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); var p = d.getElementById(b.dataset.pop), open = b.getAttribute('aria-expanded') !== 'true'; closeAll(b); b.setAttribute('aria-expanded', open); if (p) p.hidden = !open; }); });
  d.querySelectorAll('.hpop').forEach(function (p) { p.addEventListener('click', function (e) { e.stopPropagation(); }); var x = p.querySelector('.pop-x'); if (x) x.addEventListener('click', function () { closeAll(); }); });
  d.addEventListener('click', function () { closeAll(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // palavra que troca ("through email / by phone / on WhatsApp")
  d.querySelectorAll('.rot').forEach(function (r) {
    var w = r.querySelectorAll('span'), k = 0; if (w.length < 2 || reduce) return;
    setInterval(function () {
      var a = w[k]; k = (k + 1) % w.length; var b = w[k];
      a.classList.remove('on'); a.classList.add('out');
      b.classList.remove('out'); b.classList.add('on');
      setTimeout(function () { a.classList.remove('out'); }, 650);
    }, 2200);
  });

  // abas (Step 1 / 2 / 3)
  d.querySelectorAll('[role=tablist]').forEach(function (tl) {
    var bs = tl.querySelectorAll('[role=tab]');
    var sel = function (b) {
      bs.forEach(function (x) { var on = x === b; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; d.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
    };
    bs.forEach(function (b, k) {
      b.addEventListener('click', function () { sel(b); });
      b.addEventListener('keydown', function (e) { var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (n) { var t = bs[(k + n + bs.length) % bs.length]; sel(t); t.focus(); } });
    });
  });

  // artigo: barra de leitura e índice ativo
  var bar = d.querySelector('.progress');
  if (bar) {
    var links = [].slice.call(d.querySelectorAll('.toc a')), heads = links.map(function (a) { return d.querySelector(a.getAttribute('href')); });
    var upd = function () {
      var h = root.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
      var cur = 0; heads.forEach(function (el, k) { if (el && el.getBoundingClientRect().top < 160) cur = k; });
      links.forEach(function (a, k) { a.classList.toggle('on', k === cur); });
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  // formulários de demonstração não saem da página
  d.querySelectorAll('form').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); var b = f.querySelector('button'); if (b) b.textContent = 'Thanks!'; }); });
})();
