/* Beta Online — comportamento das páginas recriadas (menu, gaveta, carrosséis, pesquisa, contador) */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // topo: vira barra fixa escura depois do primeiro bloco
  var hd = $('#hd'), hero = $('.hero, .phero');
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
      $('.jobs .chip').forEach(function (x) { x.classList.toggle('on', x.dataset.k === c.dataset.k); });
      if (courseName) { courseName.textContent = c.textContent; courseName.parentNode.classList.remove('flash'); void courseName.offsetWidth; }
    });
  });

  // carrosséis de cards
  $$('[data-carousel]').forEach(function (car) {
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

  // contador da oferta (conta para baixo)
  $$('[data-timer]').forEach(function (t) {
    var s = +t.dataset.timer;
    function fmt(n) { return (n < 10 ? '0' : '') + n; }
    setInterval(function () { s = s > 0 ? s - 1 : 43408; t.textContent = fmt(Math.floor(s / 3600)) + ':' + fmt(Math.floor(s % 3600 / 60)) + ':' + fmt(s % 60); }, 1000);
  });

  // pesquisa em etapas
  var sv = $('#survey');
  if (sv) {
    var steps = $$('.step', sv), bar = $('.bar i', sv), k = 0;
    function show(n) { k = n; steps.forEach(function (s, j) { s.classList.toggle('on', j === k); }); bar.style.width = ((k + 1) / steps.length * 100) + '%'; }
    $$('.next', sv).forEach(function (b) { b.addEventListener('click', function () { show(Math.min(k + 1, steps.length - 1)); }); });
    $$('.prev', sv).forEach(function (b) { b.addEventListener('click', function () { show(Math.max(k - 1, 0)); }); });
  }

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
