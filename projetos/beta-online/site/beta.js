/* Beta Online — comportamento das páginas recriadas (menu, gaveta, carrosséis, pesquisa, contador) */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // topo: vira barra fixa escura depois do primeiro bloco
  var hd = $('#hd'), hero = $('.hero, .hero2, .about');
  if (hd) {
    var solid = false;
    var onScroll = function () {
      var lim = hero ? hero.offsetHeight - 80 : 200, s = scrollY > lim;
      if (s !== solid) { solid = s; hd.classList.toggle('is-solid', s); }
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  // submenus (clique no celular/teclado; no desktop também abre ao passar o mouse)
  $$('.nav .has-dd > button').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var li = b.parentNode, open = !li.classList.contains('open');
      $$('.nav .has-dd.open').forEach(function (x) { x.classList.remove('open'); x.firstElementChild.setAttribute('aria-expanded', 'false'); });
      li.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function () { $$('.nav .has-dd.open').forEach(function (x) { x.classList.remove('open'); }); });

  // gaveta do celular
  var dr = $('#drawer'), burger = $('.burger');
  function setDrawer(o) { if (!dr) return; dr.classList.toggle('open', o); dr.setAttribute('aria-hidden', !o); document.documentElement.style.overflow = o ? 'hidden' : ''; }
  if (burger) burger.addEventListener('click', function () { setDrawer(true); });
  $$('[data-close]').forEach(function (x) { x.addEventListener('click', function () { setDrawer(false); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  // busca: dá para digitar; Enter só mostra que buscou (não há resultados nesta prévia)
  $$('.search input').forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); i.blur(); } }); });

  // faixas de profissões
  var jobs = ['Veterinário', 'Professor', 'Advogado', 'Biomédico', 'Contador', 'Médico', 'Dentista', 'Corretor', 'Engenheiro Agrônomo', 'Engenheiro Civil', 'Pedagogo', 'Profissional de TI', 'Engenheiro Mecânico', 'Arquiteto', 'Assistente Social', 'Farmacêutico', 'Psicólogo', 'Fisioterapeuta'];
  var rows = $$('.jobs .row');
  rows.forEach(function (row, r) {
    var list = jobs.slice(r * 6).concat(jobs.slice(0, r * 6));
    var html = list.concat(list).map(function (j, n) { return '<button type="button" class="chip' + (r === 1 && j === 'Engenheiro Agrônomo' ? ' on' : '') + '" data-k="' + r + '-' + (n % list.length) + '">' + j + '</button>'; }).join('');
    row.innerHTML = html;
  });
  var courseName = $('#courseName');
  $$('.jobs .chip').forEach(function (c) {
    c.addEventListener('click', function () {
      $$('.jobs .chip').forEach(function (x) { x.classList.toggle('on', x.dataset.k === c.dataset.k); });
      if (courseName) { courseName.textContent = c.textContent; courseName.parentNode.classList.remove('flash'); void courseName.offsetWidth; }
    });
  });

  // carrosséis de cards
  $$('[data-carousel]').forEach(function (car) {
    if (car.closest('.school')) { car._drift = 1; return; }
    var tr = $('.track', car), prev = $('.prev', car), next = $('.next', car);
    function step() { var c = tr.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(tr).columnGap || 16) : 300; }
    function upd() { prev.disabled = tr.scrollLeft < 8; next.disabled = tr.scrollLeft + tr.clientWidth > tr.scrollWidth - 8; }
    prev.addEventListener('click', function () { tr.scrollBy({ left: -step() }); });
    next.addEventListener('click', function () { tr.scrollBy({ left: step() }); });
    tr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });

  // depoimentos: o card ativo fica em destaque; passa sozinho
  $$('[data-testi]').forEach(function (car) {
    var tr = $('.ttrack', car), cards = $$('.tcard', car), i = 0, timer;
    function go(n, smooth) {
      i = (n + cards.length) % cards.length;
      cards.forEach(function (c, j) { c.classList.toggle('on', j === i); });
      tr.scrollTo({ left: cards[i].offsetLeft - tr.offsetLeft - 2, behavior: smooth === false ? 'auto' : 'smooth' });
      clearTimeout(timer); if (!reduce) timer = setTimeout(function () { go(i + 1); }, 6000);
    }
    $('.prev', car).addEventListener('click', function () { go(i - 1); });
    $('.next', car).addEventListener('click', function () { go(i + 1); });
    var st; tr.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(function () {
      var best = 0, d = 1e9; cards.forEach(function (c, j) { var dd = Math.abs(c.offsetLeft - tr.offsetLeft - tr.scrollLeft); if (dd < d) { d = dd; best = j; } });
      if (best !== i) { i = best; cards.forEach(function (c, j) { c.classList.toggle('on', j === i); }); }
    }, 120); }, { passive: true });
    go(0, false);
  });

  // carrosséis que passam sozinhos, devagar (nomeações e cards da escola); pausam ao tocar e retomam depois
  function drift(tr, prevB, nextB) {
    if (!tr || tr._drift) return; tr._drift = true;
    Array.prototype.slice.call(tr.children).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.querySelectorAll('a,button').forEach(function (x) { x.tabIndex = -1; }); tr.appendChild(k); });
    tr.classList.add('is-drift');
    var SPEED = 28, pos = 0, last = 0, until = 0, vis = false, raf = 0;
    var half = function () { return tr.scrollWidth / 2; };
    var hold = function () { until = performance.now() + 3500; };
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) { tr.addEventListener(ev, hold, { passive: true }); });
    var step = function (t) {
      raf = 0; if (!vis) return;
      var dt = last ? Math.min(64, t - last) : 16; last = t;
      if (performance.now() < until) pos = tr.scrollLeft; else { pos += SPEED * dt / 1000; if (pos >= half()) pos -= half(); tr.scrollLeft = pos; }
      if (tr.scrollLeft >= half()) { tr.scrollLeft -= half(); pos = tr.scrollLeft; }
      raf = requestAnimationFrame(step);
    };
    var go = function () { if (!raf && vis && !reduce) { last = 0; pos = tr.scrollLeft; raf = requestAnimationFrame(step); } };
    var w = function () { var c = tr.firstElementChild; return c ? c.getBoundingClientRect().width + 16 : 300; };
    if (prevB) prevB.addEventListener('click', function () { hold(); if (tr.scrollLeft < w()) tr.scrollLeft += half(); tr.scrollBy({ left: -w(), behavior: 'smooth' }); });
    if (nextB) nextB.addEventListener('click', function () { hold(); tr.scrollBy({ left: w(), behavior: 'smooth' }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) go(); }, { threshold: .15 }).observe(tr); else { vis = true; go(); }
  }
  var ch = $('#chats'); if (ch) { var nb = $$('.nom .nav2 button'); drift(ch, nb[0], nb[1]); }

  // vídeo do fundador (prévia: abre em tela cheia)
  var lb = document.getElementById('lb'), vb = document.getElementById('videoBtn');
  function setLb(o) { if (!lb) return; lb.classList.toggle('open', o); lb.setAttribute('aria-hidden', !o); }
  if (vb) vb.addEventListener('click', function () { setLb(true); });
  if (lb) { lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('[data-lb-close]')) setLb(false); }); addEventListener('keydown', function (e) { if (e.key === 'Escape') setLb(false); }); }

  // escritório: fotos passando sozinhas, com setas e pontos
  var of = document.getElementById('office');
  if (of) {
    var sls = Array.prototype.slice.call(of.querySelectorAll('.sl')), dw3 = of.querySelector('.dots3'), cur = 0, tm;
    dw3.innerHTML = sls.map(function (_, k) { return '<button type="button" aria-label="Foto ' + (k + 1) + '"></button>'; }).join('');
    var ds = Array.prototype.slice.call(dw3.children);
    function showSlide(k) { cur = (k + sls.length) % sls.length; sls.forEach(function (s, q) { s.classList.toggle('on', q === cur); }); ds.forEach(function (d, q) { d.classList.toggle('on', q === cur); }); clearTimeout(tm); if (!reduce) tm = setTimeout(function () { showSlide(cur + 1); }, 5000); }
    of.querySelector('.p').addEventListener('click', function () { showSlide(cur - 1); });
    of.querySelector('.n').addEventListener('click', function () { showSlide(cur + 1); });
    ds.forEach(function (d, q) { d.addEventListener('click', function () { showSlide(q); }); });
    showSlide(0);
  }

  // mapa do banco de peritos: camadas acompanham o mouse
  var bm = $('#bmap');
  if (bm && !reduce && matchMedia('(hover: hover)').matches) {
    bm.addEventListener('pointermove', function (e) { var r = bm.getBoundingClientRect(); bm.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * 2); bm.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5) * 2); });
    bm.addEventListener('pointerleave', function () { bm.style.setProperty('--mx', 0); bm.style.setProperty('--my', 0); });
  }

  $$('.school [data-carousel]').forEach(function (car) { drift($('.track', car), $('.prev', car), $('.next', car)); });

  // arrastar com o mouse nas faixas que rolam para o lado (ofertas, cursos, cards, depoimentos)
  $$('.offers, .picks, .track, .ttrack, .chats, .cgrid').forEach(function (el) {
    var down = false, moved = false, sx = 0, sl = 0, snap = '';
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || el.scrollWidth <= el.clientWidth + 2) return;
      down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; snap = el.style.scrollSnapType; el.style.scrollSnapType = 'none'; el.style.scrollBehavior = 'auto'; el.classList.add('is-grab');
    });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; el.scrollLeft = sl - dx; });
    addEventListener('pointerup', function (e) {
      if (!down) return; down = false; el.classList.remove('is-grab'); el.style.scrollBehavior = '';
      if (el.classList.contains('is-drift')) { el.style.scrollSnapType = snap; return; }
      var dx = e.clientX - sx, kids = Array.prototype.slice.call(el.children).filter(function (c) { return c.offsetWidth; });
      var pad = parseFloat(getComputedStyle(el).paddingLeft) || 0, base = kids.length ? kids[0].offsetLeft : 0;
      var idx = 0, best = 1e9; kids.forEach(function (c, q) { var d = Math.abs(c.offsetLeft - base - sl); if (d < best) { best = d; idx = q; } });
      if (Math.abs(dx) > 40) idx = Math.max(0, Math.min(kids.length - 1, idx + (dx < 0 ? 1 : -1)));
      var to = kids[idx] ? kids[idx].offsetLeft - base : el.scrollLeft;
      el.scrollTo({ left: to, behavior: 'smooth' });
      setTimeout(function () { el.style.scrollSnapType = snap; }, 450);
    });
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  // cursor da Fyw: bolinha que segue o mouse (vale também dentro das molduras do portfólio)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    var dot = document.createElement('div'); dot.className = 'fyw-dot'; dot.setAttribute('aria-hidden', 'true'); document.body.appendChild(dot);
    document.documentElement.classList.add('has-dot');
    var cx = -50, cy = -50, craf = 0;
    var cplace = function () { craf = 0; dot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; };
    addEventListener('pointermove', function (e) { cx = e.clientX; cy = e.clientY; dot.classList.remove('is-hidden'); if (!craf) craf = requestAnimationFrame(cplace); }, { passive: true });
    document.addEventListener('mouseover', function (e) { dot.classList.toggle('is-hover', !!(e.target.closest && e.target.closest('a, button, label, input, textarea, summary, .chip, .pin'))); });
    document.addEventListener('mouseleave', function () { dot.classList.add('is-hidden'); });
  }

  // contador da oferta (conta para baixo)
  $$('[data-timer]').forEach(function (t) {
    var s = +t.dataset.timer;
    function fmt(n) { return (n < 10 ? '0' : '') + n; }
    setInterval(function () { s = s > 0 ? s - 1 : 43408; t.textContent = fmt(Math.floor(s / 3600)) + ':' + fmt(Math.floor(s % 3600 / 60)) + ':' + fmt(s % 60); }, 1000);
  });

  // pesquisas em etapas (seção e janela flutuante)
  $$('[data-survey]').forEach(function (sv) {
    var steps = $$('.step', sv), segs = $$('.segs i', sv), k = 0;
    function show(x) {
      k = x; steps.forEach(function (s, q) { s.classList.toggle('on', q === k); });
      segs.forEach(function (g, q) { g.classList.toggle('on', q < k || k >= segs.length); g.classList.toggle('cur', q === k); });
      var p = steps[k] && $('.prev', steps[k]); if (p) p.disabled = k === 0;
    }
    $$('.next', sv).forEach(function (b) { b.addEventListener('click', function () { show(Math.min(k + 1, steps.length - 1)); }); });
    $$('.prev', sv).forEach(function (b) { b.addEventListener('click', function () { show(Math.max(k - 1, 0)); }); });
    sv._reset = function () { show(0); };
    show(0);
  });
  var fab = $('.info-fab'), pop = $('#pop');
  function setPop(o) { if (!pop) return; pop.classList.toggle('open', o); pop.setAttribute('aria-hidden', !o); fab.setAttribute('aria-expanded', o); if (o) { var f = $('[data-survey]', pop); if (f && f._reset && $('.done.on', f)) f._reset(); } }
  if (fab) fab.addEventListener('click', function (e) { e.stopPropagation(); setPop(!pop.classList.contains('open')); });
  // no banner da opinião a aba vira o cartão da pesquisa (abre sozinho); ao subir a página, volta para o canto
  var slot = $('.survey-slot'), docked = false, dismissed = false;
  function dock(on) {
    if (!slot || !pop || on === docked) return; docked = on;
    if (on) { slot.appendChild(pop); pop.classList.add('docked', 'open'); fab.classList.add('away'); }
    else { document.body.appendChild(pop); pop.classList.remove('docked', 'open'); fab.classList.remove('away'); }
    pop.setAttribute('aria-hidden', !on); fab.setAttribute('aria-expanded', on);
  }
  if (slot && pop && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (e.isIntersecting && e.intersectionRatio >= .35) { if (!dismissed) dock(true); }
      else if (e.intersectionRatio < .15) { dock(false); if (!e.isIntersecting) dismissed = false; }
    }); }, { threshold: [0, .15, .35, .6] }).observe(slot.closest('section'));
  }
  $$('[data-pop-close]').forEach(function (b) { b.addEventListener('click', function () { if (docked) { dismissed = true; dock(false); } else setPop(false); }); });
  document.addEventListener('click', function (e) { if (pop && !docked && pop.classList.contains('open') && !e.target.closest('#pop') && !e.target.closest('.info-fab')) setPop(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setPop(false); });

  // newsletter: confirma no próprio botão
  $$('#newsForm').forEach(function (f) {
    f.addEventListener('submit', function () { var b = $('button', f); b.textContent = 'Inscrito ✓'; b.disabled = true; $('input', f).value = ''; });
  });

  // perguntas: uma aberta por vez
  $$('.faq details').forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) $$('.faq details').forEach(function (x) { if (x !== d) x.open = false; }); }); });

  // revelar ao rolar
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });
})();
