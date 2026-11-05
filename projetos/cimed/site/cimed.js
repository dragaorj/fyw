/* Cimed — interações */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header: sólido ao rolar, some ao descer e volta ao subir
  var hd = $('#hd'), lastY = 0;
  function onScroll() {
    var y = scrollY;
    hd.classList.toggle('is-solid', y > 30);
    hd.classList.toggle('is-hide', y > 400 && y > lastY + 4 && !root.classList.contains('is-menu'));
    if (y < lastY - 4 || y < 400) hd.classList.remove('is-hide');
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu mobile
  var burger = $('.hd-burger');
  function menu(open) {
    root.classList.toggle('is-menu', open); root.classList.toggle('is-lock', open);
    burger.setAttribute('aria-expanded', open); $('#drawer').setAttribute('aria-hidden', !open);
  }
  burger.addEventListener('click', function () { menu(!root.classList.contains('is-menu')); });
  $$('#drawer a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });

  // menu ativo conforme a seção
  var navs = $$('.hd-nav a');
  var secs = ['inicio', 'sobre', 'produtos', 'novidades'].map(function (id) { return document.getElementById(id); });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        navs.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { s && so.observe(s); });
  }

  // reveal
  var rvs = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el, i) {
      var sib = el.parentElement ? $$('.rv', el.parentElement).indexOf(el) : 0;
      el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
      ro.observe(el);
    });
  } else rvs.forEach(function (el) { el.classList.add('in'); });
  requestAnimationFrame(function () { $('.hero-ph').classList.add('in'); });

  // faixas contínuas (marcas e slogans): deriva lenta + arrastar com o mouse
  $$('[data-drift]').forEach(function (box) {
    var tr = $('.mq-track', box); if (!tr) return;
    tr.innerHTML += tr.innerHTML;
    $$('img', tr).forEach(function (im, i) { if (i >= $$('img', tr).length / 2) im.alt = ''; });
    var speed = box.dataset.drift === 'slow' ? 0.35 : 0.5, x = 0, drag = false, sx = 0, sxx = 0, vis = true, half = 0;
    function measure() { half = tr.scrollWidth / 2; }
    measure(); addEventListener('resize', measure);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(box);
    (function loop() {
      if (vis && !drag && !reduce) x -= speed;
      if (half) { if (x <= -half) x += half; if (x > 0) x -= half; }
      tr.style.transform = 'translate3d(' + x + 'px,0,0)';
      requestAnimationFrame(loop);
    })();
    box.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; drag = true; sx = e.clientX; sxx = x; box.classList.add('is-drag'); box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', function (e) { if (drag) x = sxx + (e.clientX - sx); });
    ['pointerup', 'pointercancel'].forEach(function (t) { box.addEventListener(t, function () { drag = false; box.classList.remove('is-drag'); }); });
    // toque: arrasto horizontal manual
    var tx = 0, ty = 0, tX = 0, lock = 0;
    box.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; tX = x; lock = 0; drag = true; }, { passive: true });
    box.addEventListener('touchmove', function (e) {
      var dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
      if (!lock) lock = Math.abs(dx) > Math.abs(dy) ? 1 : 2;
      if (lock === 1) x = tX + dx;
    }, { passive: true });
    box.addEventListener('touchend', function () { drag = false; }, { passive: true });
  });

  // Lavitan: abre com o frasco girando e as formas surgindo
  var lav = $('#lav');
  if (lav && !reduce && 'IntersectionObserver' in window) {
    lav.classList.add('js');
    var lo = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { lav.classList.add('play'); lo.disconnect(); }
    }, { threshold: .3 });
    lo.observe(lav.parentNode);
    // parallax suave com o mouse
    var w = $('.lav-w', lav), yv = $('.lav-y', lav), bt = $('.lav-bt', lav), raf = 0, mx = 0, my = 0;
    lav.addEventListener('pointermove', function (e) {
      var r = lav.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        w.style.translate = (mx * -14) + 'px ' + (my * -10) + 'px';
        yv.style.translate = (mx * 18) + 'px ' + (my * 14) + 'px';
        bt.style.translate = (mx * 28) + 'px ' + (my * 20) + 'px';
      });
    });
    lav.addEventListener('pointerleave', function () { w.style.translate = yv.style.translate = bt.style.translate = ''; });
    [w, yv, bt].forEach(function (el) { el.style.transition = 'translate .8s cubic-bezier(.2,.7,.2,1)'; });
  }

  // produtos: filtro por categoria
  var tabs = $$('.tabs button'), cards = $$('.pc');
  function filter(f) {
    tabs.forEach(function (b) { var on = b.dataset.f === f; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    cards.forEach(function (c) {
      var show = f === '*' || c.dataset.c === f;
      c.hidden = !show; c.classList.remove('pop');
      if (show) { void c.offsetWidth; c.classList.add('pop'); }
    });
  }
  tabs.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); }); });
  $$('[data-cat]').forEach(function (a) { a.addEventListener('click', function () { filter(a.dataset.cat); }); });

  // newsletter
  var nf = $('.nl-f');
  nf.addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('input', nf), msg = $('.nl-msg', nf);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inp.value.trim())) { msg.textContent = 'Digite um e-mail válido.'; inp.focus(); return; }
    msg.textContent = 'Pronto! Você vai receber as novidades da Cimed.'; inp.value = '';
  });

  // notícias: leitura em painel com endereço próprio (#novidades/slug)
  var post = $('#post'), art = $('.post-art', post), sc = $('.post-sc', post);
  var order = ['pouso-alegre', 'selecao', 'concentracao'];
  var titles = { 'pouso-alegre': 'Pouso Alegre: onde a Cimed fabrica saúde em escala nacional', 'selecao': 'Cimed e Seleção: a parceria que veste a camisa da saúde', 'concentracao': 'Como melhorar a concentração: 7 hábitos para o dia a dia' };
  function openPost(slug) {
    var tp = document.getElementById('tp-' + slug); if (!tp) return;
    art.innerHTML = ''; art.appendChild(tp.content.cloneNode(true));
    var nx = order[(order.indexOf(slug) + 1) % order.length];
    var a = document.createElement('a'); a.className = 'post-next'; a.href = '#novidades/' + nx;
    a.innerHTML = '<span><small>Próxima leitura</small><b>' + titles[nx] + '</b></span><i><svg><use href="#arr"/></svg></i>';
    art.appendChild(a);
    sc.scrollTop = 0;
    post.classList.add('on'); post.setAttribute('aria-hidden', 'false'); root.classList.add('is-lock');
  }
  function closePost() { post.classList.remove('on'); post.setAttribute('aria-hidden', 'true'); if (!root.classList.contains('is-menu')) root.classList.remove('is-lock'); }
  function route() {
    var m = location.hash.match(/^#novidades\/([\w-]+)/);
    if (m) openPost(m[1]); else if (post.classList.contains('on')) closePost();
  }
  addEventListener('hashchange', route); route();
  $('.post-x').addEventListener('click', function () {
    if (history.length > 1 && /^#novidades\//.test(location.hash)) history.replaceState(null, '', '#novidades');
    closePost();
  });

  // busca
  var sr = $('#srch'), si = $('input', sr), list = $('.srch-res', sr);
  var KW = {"Lavitan":"vitaminas suplementos bcaa creatina omega colageno melatonina imunidade energia foco disposicao","Cimegripe":"gripe resfriado febre dor antigripal spray gotas","Nevralgex":"dor muscular analgesico relaxante cabeca costas","Bepantriz":"pele assadura pomada bebe tattoo labial dexpantenol","Carmed":"labial labios boca hidratante gel dental enxaguante fini","Xô Inseto":"repelente mosquito inseto dengue icaridina kids baby","Dermafeme":"intimo feminino sabonete higiene","K-MED":"gel intimo lubrificante"};
  var idx = cards.map(function (c) { var t = $('h3', c).textContent; return { t: t, s: $('.pc-b span', c).textContent, x: $('.pc-b p', c).textContent + ' ' + (KW[t] || ''), h: '#produtos', cat: c.dataset.c, el: c }; })
    .concat(order.map(function (k) { var tp = document.getElementById('tp-' + k); return { t: titles[k], s: 'Notícia', x: tp ? tp.content.textContent : '', h: '#novidades/' + k }; }))
    .concat([
      { t: 'Nossa história', s: 'Sobre', x: 'quem somos 1977 50 anos verticalizada fabrica pouso alegre missao valores', h: '#sobre' },
      { t: 'O que nos torna diferentes', s: 'Sobre', x: 'qualidade certificada anvisa presenca nacional precos acessiveis', h: '#sobre' },
      { t: 'Lavitan · Mais disposição e foco', s: 'Destaque', x: 'vitaminas minerais bcaa ferro zinco magnesio complexo b', h: '#inicio', go: '.lav' },
      { t: 'Seleção Brasileira', s: 'Patrocínio', x: 'cbf futebol patrocinadora oficial copa', h: '#selecao' },
      { t: 'Nosso compromisso', s: 'Sobre', x: 'saude direito de todos acesso', h: '#selecao', go: '.comp' },
      { t: 'Newsletter', s: 'Novidades', x: 'email assinar receber dicas', h: '#novidades', go: '.nl-sec' },
      { t: 'SAC 0800 704 4647', s: 'Fale conosco', x: 'contato atendimento telefone sac', h: 'tel:08007044647' },
      { t: 'Trabalhe conosco', s: 'Carreiras', x: 'vagas emprego carreira gupy', h: 'https://cimed.gupy.io/' }
    ]);
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function render() {
    var q = norm(si.value.trim()), words = q.split(/\s+/).filter(Boolean);
    var r = idx.map(function (i) {
      var head = norm(i.t + ' ' + i.s), body = norm(i.x || ''), sc = 0;
      for (var w = 0; w < words.length; w++) { if (head.indexOf(words[w]) > -1) sc += 3; else if (body.indexOf(words[w]) > -1) sc += 1; else return null; }
      return { i: i, sc: sc };
    }).filter(Boolean).sort(function (a, b) { return b.sc - a.sc; }).slice(0, 8).map(function (o) { return o.i; });
    list.innerHTML = r.length ? r.map(function (i, n) { return '<li><a href="' + i.h + '" data-n="' + idx.indexOf(i) + '"' + (/^http/.test(i.h) ? ' target="_blank" rel="noopener"' : '') + (n === 0 && q ? ' class="is-k"' : '') + '><span>' + i.t + '</span><small>' + i.s + '</small></a></li>'; }).join('') : '<li class="none">Nada encontrado para “' + si.value.replace(/[<>&]/g, '') + '”.</li>';
  }
  function openS() { menu(false); sr.classList.add('on'); sr.setAttribute('aria-hidden', 'false'); root.classList.add('is-lock'); si.value = ''; render(); setTimeout(function () { si.focus(); }, 60); }
  function closeS() { sr.classList.remove('on'); sr.setAttribute('aria-hidden', 'true'); root.classList.remove('is-lock'); }
  $$('[data-open-search]').forEach(function (b) { b.addEventListener('click', openS); });
  $('.srch-x').addEventListener('click', closeS);
  sr.addEventListener('click', function (e) {
    if (e.target === sr) return closeS();
    var a = e.target.closest('a'); if (!a) return;
    var it = idx[+a.dataset.n]; closeS();
    if (it && (it.el || it.go)) { e.preventDefault(); if (it.cat) filter(it.cat); var el = it.el || $(it.go); setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }, 60); }
  });
  si.addEventListener('input', render);
  si.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var a = $('a', list); if (a) a.click(); } });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeS(); if (post.classList.contains('on')) $('.post-x').click(); menu(false); }
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openS(); }
  });

  // cursor ponto Fyw
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var dot = document.createElement('div'); dot.className = 'fyw-dot'; dot.setAttribute('aria-hidden', 'true'); document.body.appendChild(dot);
    root.classList.add('has-dot');
    var cx = -50, cy = -50, craf = 0;
    var place = function () { craf = 0; dot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; };
    addEventListener('pointermove', function (e) { cx = e.clientX; cy = e.clientY; dot.classList.remove('is-hidden'); if (!craf) craf = requestAnimationFrame(place); }, { passive: true });
    document.addEventListener('mouseover', function (e) { dot.classList.toggle('is-hover', !!(e.target.closest && e.target.closest('a, button, input, .pc, .mq'))); });
    document.addEventListener('mouseleave', function () { dot.classList.add('is-hidden'); });
  }
})();

// contorno do símbolo da Seleção desenha ao entrar na tela
(function () {
  var s = document.querySelector('.sel'); if (!s) return;
  if (!('IntersectionObserver' in window)) { s.classList.add('in-view'); return; }
  var o = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { s.classList.add('in-view'); o.disconnect(); } }, { threshold: .25 });
  o.observe(s);
})();

// brilho amarelo no símbolo do hero: anda sozinho e segue o mouse quando ele está no hero
(function () {
  var g = document.getElementById('hsG'), svg = document.querySelector('.hero-sym'), hero = document.querySelector('.hero');
  if (!g || !svg) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var x = -200, y = 0, tx = null, ty = 0, vis = true, last = performance.now();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(hero);
  hero.addEventListener('pointermove', function (e) {
    var r = svg.getBoundingClientRect(), k = 1885 / r.width;
    tx = (e.clientX - r.left) * k + 350; ty = (e.clientY - r.top) * k - 150;
  });
  hero.addEventListener('pointerleave', function () { tx = null; ty = 0; });
  (function loop(t) {
    var dt = Math.min(64, t - last); last = t;
    if (vis && !reduce) {
      if (tx === null) { x += dt * 0.4; if (x > 2600) x = -400; y += (0 - y) * 0.04; }
      else { x += (tx - x) * 0.08; y += (ty - y) * 0.08; }
      g.setAttribute('gradientTransform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
    }
    requestAnimationFrame(loop);
  })(last);
})();

// pop-up do produto (informações do site oficial da Cimed)
(function () {
  var B = 'https://cimedremedios.com.br';
  var P = {
    lavitan: { n: 'Lavitan BCAA', c: 'Vitaminas & Nutrição · Suplementos', pr: 'Frasco 2400 mg · 100 cápsulas', d: [['O que é', 'Suplemento alimentar em cápsulas com alta concentração de BCAAs.'], ['Como usar', 'Ingerir 4 cápsulas ao dia, com líquido. Uso oral, a partir de 19 anos.'], ['Registro MS', 'Isento']], u: '/vitaminas-e-nutricao/lavitan-pro-bcaa/' },
    cimegripe: { n: 'Cimegripe® cápsulas', c: 'Remédios · Analgésicos · Isento de prescrição', pr: '10 cápsulas', d: [['Indicação', 'Tratamento dos sintomas de gripes e resfriados. Alivia congestão nasal, coriza, febre, dor de cabeça e dores musculares presentes nos estados gripais.'], ['Princípio ativo', 'Paracetamol 400 mg + maleato de clorfeniramina 4 mg + cloridrato de fenilefrina 4 mg'], ['Registro MS', '1.4381.0272']], m: 1, u: '/remedio/cimegripe-2/' },
    nevralgex: { n: 'Nevralgex®', c: 'Remédios · Analgésicos · Isento de prescrição', pr: '30 ou 100 comprimidos', d: [['Indicação', 'Alívio da dor associada a contraturas musculares, incluindo dor de cabeça tensional.'], ['Princípio ativo', 'Dipirona monoidratada 300 mg + cafeína 50 mg + citrato de orfenadrina 35 mg'], ['Registro MS', '1.4381.0051']], m: 1, u: '/remedio/nevralgex/' },
    bepantriz: { n: 'Bepantriz pomada para assaduras', c: 'Dermocosméticos · Uso dermatológico', pr: 'Pomada 50 mg/g · bisnaga de 30 g', d: [['Indicação', 'Prevenção e tratamento da dermatite de fraldas (assaduras), de fissuras de pele e mucosas (mamilos, lábios e região anal), feridas leves, escoriações e escaras.'], ['Princípio ativo', 'Dexpantenol'], ['Registro MS', '1.4381.0133']], m: 1, u: '/higiene-e-beleza/bepantriz-pomada/' },
    carmed: { n: 'Carmed Cereja', c: 'Higiene & Beleza · Hidratante labial', pr: 'Bisnaga de 10 g · sabor cereja', d: [['O que é', 'Hidratante labial incolor e refrescante. Hidrata, protege contra o ressecamento e deixa os lábios macios.'], ['Composição', 'Lanolina, manteiga de cacau, mentol, vaselina e cera de abelha. Sem parabenos e conservantes.'], ['Indicação', 'Pode ser usado a partir de 3 anos. Não testado em animais.']], u: '/higiene-e-beleza/carmed-cereja/' },
    xo: { n: 'Xô Inseto!® Spray Repelente', c: 'Higiene & Beleza · Repelentes', pr: 'Frasco de 200 ml', d: [['O que é', 'Repelente não oleoso com até 10 horas de proteção contra insetos.'], ['Indicação', 'Eficaz contra o Aedes aegypti, transmissor da dengue, zika, chikungunya e febre amarela, e contra o Anopheles, transmissor da malária.'], ['Composição', '15% DEET']], u: '/higiene-e-beleza/xo-inseto-spray-repelente/' },
    dermafeme: { n: 'Dermafeme Floral', c: 'Higiene & Beleza · Higiene íntima', pr: 'Kit com 2 frascos de 200 ml', d: [['Indicação', 'Limpeza e equilíbrio do pH da região íntima, com proteção, conforto e bem-estar. Fragrância suave, para uso diário.'], ['Composição', 'Proteína do leite + ácido lático'], ['Testes', 'Dermatologicamente e ginecologicamente testado']], u: '/higiene-e-beleza/dermafeme-floral/' },
    kmed: { n: 'K-Med® Tradicional', c: 'Higiene & Beleza · Lubrificante íntimo', pr: 'Embalagens de 25 g, 50 g e 100 g', d: [['O que é', 'Gel lubrificante íntimo à base de água, similar à lubrificação natural do corpo, para mais bem-estar e conforto.'], ['Destaques', 'Transparente, não gorduroso, sem fragrância, fácil de remover e compatível com preservativos.']], u: '/higiene-e-beleza/k-med-tradicional/' }
  };
  var pm = document.getElementById('pm'); if (!pm) return;
  var root = document.documentElement, last = null;
  var q = function (s) { return pm.querySelector(s); };
  function open(card) {
    var k = card.dataset.p, p = P[k]; if (!p) return;
    last = card;
    var ph = q('.pm-m > img'); ph.src = 'img/p-' + k + '.webp'; ph.alt = p.n;
    var lg = q('.pc-lg img'); lg.src = 'img/lg-' + k + '.webp'; lg.alt = card.querySelector('h3').textContent;
    q('.pm-m').className = 'pm-m ' + (card.classList.contains('t-y') ? 't-y' : card.classList.contains('t-g') ? 't-g' : 't-k');
    q('.pm-cat').textContent = p.c; q('#pm-t').textContent = p.n; q('.pm-pres').textContent = p.pr;
    q('.pm-dl').innerHTML = p.d.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
    q('.pm-warn').textContent = p.m ? 'Este produto é um medicamento. Seu uso pode trazer riscos. Procure o médico e o farmacêutico. Leia a bula. Se persistirem os sintomas, o médico deverá ser consultado.' : '';
    q('.pm-warn').hidden = !p.m;
    q('.pm-go').href = B + p.u;
    q('.pm-b').scrollTop = 0; q('.pm-card').scrollTop = 0;
    pm.classList.add('on'); pm.setAttribute('aria-hidden', 'false'); root.classList.add('is-lock');
    setTimeout(function () { q('.pm-x').focus({ preventScroll: true }); }, 50);
  }
  function close() { if (!pm.classList.contains('on')) return; pm.classList.remove('on'); pm.setAttribute('aria-hidden', 'true'); root.classList.remove('is-lock'); if (last) last.focus({ preventScroll: true }); }
  document.querySelectorAll('.pc[data-p]').forEach(function (c) {
    c.addEventListener('click', function () { open(c); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(c); } });
  });
  q('.pm-x').addEventListener('click', close);
  pm.addEventListener('click', function (e) { if (e.target === pm) close(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

// animações de texto com GSAP (títulos sobem palavra por palavra, parágrafos e números entram em sequência)
(function () {
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('gs');

  // divide em palavras preservando <em> e <br>
  function split(el) {
    var out = [];
    (function walk(node, parent) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
            w.appendChild(i); frag.appendChild(w); out.push(i);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    return out;
  }

  var heads = document.querySelectorAll('.hero-h, .h2, .comp-h, .diff-h, .nl h2, .lav-txt h2');
  heads.forEach(function (h) {
    h.classList.remove('rv'); h.classList.add('in');
    var ws = split(h);
    var inLav = h.closest('.lav');
    var tw = gsap.from(ws, { yPercent: 110, rotate: 4, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.045, paused: true });
    if (h.classList.contains('hero-h')) { tw.delay(0.15).play(); return; }
    if (inLav) { h.style.opacity = 1; gsap.delayedCall(0, function () {}); var lav = h.closest('.lav'); new MutationObserver(function (m, o) { if (lav.classList.contains('play')) { gsap.delayedCall(1.05, function () { tw.play(); }); o.disconnect(); } }).observe(lav, { attributes: true, attributeFilter: ['class'] }); return; }
    ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () { tw.play(); } });
  });

  // textos de apoio e botões
  gsap.utils.toArray('.hero-sub, .hero .btn, .sponsor, .about-p p, .sel2-txt p, .sel2-txt .btn, .sel2-chips, .sel2-cap, .nl p, .nc-b h3, .eyebrow').forEach(function (el) {
    el.classList.remove('rv'); el.classList.add('in'); el.style.transitionDelay = '';
    if (el.closest('.hero')) {
      var d = el.classList.contains('sponsor') ? .05 : el.classList.contains('hero-sub') ? .75 : .9;
      gsap.fromTo(el, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, ease: 'power3.out', delay: d });
      return;
    }
    gsap.fromTo(el, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // números do hero contam
  gsap.utils.toArray('.stats > div').forEach(function (d, i) {
    d.classList.remove('rv');
    gsap.from(d, { y: 24, opacity: 0, duration: .9, ease: 'power3.out', delay: 1.05 + i * .12 });
    var dt = d.querySelector('dt'), raw = dt.textContent, m = raw.match(/[\d,]+/);
    if (!m) return;
    var target = parseFloat(m[0].replace(',', '.')), dec = m[0].indexOf(',') > -1 ? 1 : 0, o = { v: 0 };
    gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out', delay: 1.1 + i * .12, onUpdate: function () { dt.textContent = raw.replace(m[0], o.v.toFixed(dec).replace('.', ',')); } });
  });
  var st = document.querySelector('.stats'); if (st) st.classList.remove('rv'), st.classList.add('in');

  // linha de slogans entra deslizando
  gsap.from('.tick', { scrollTrigger: { trigger: '.tick', start: 'top 95%' }, xPercent: 8, opacity: 0, duration: 1.2, ease: 'power3.out' });
})();

// hover na foto do hero: a foto acompanha o mouse e acende o contorno amarelo
(function () {
  var ph = document.querySelector('.hero-ph'); if (!ph || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  var raf = 0, mx = 0, my = 0;
  ph.addEventListener('pointermove', function (e) {
    var r = ph.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; ph.style.setProperty('--mx', mx.toFixed(3)); ph.style.setProperty('--my', my.toFixed(3)); ph.style.setProperty('--gx', ((mx + .5) * 100).toFixed(1) + '%'); ph.style.setProperty('--gy', ((my + .5) * 100).toFixed(1) + '%'); });
  });
  ph.addEventListener('pointerenter', function () { ph.classList.add('is-hover'); });
  ph.addEventListener('pointerleave', function () { ph.classList.remove('is-hover'); ph.style.setProperty('--mx', 0); ph.style.setProperty('--my', 0); });
})();

// imagens com parallax e revelação (GSAP)
(function () {
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ph = document.querySelector('.about-ph');
  if (ph) {
    ph.classList.remove('rv'); ph.classList.add('in');
    var img = ph.querySelector('img');
    gsap.fromTo(ph, { clipPath: 'inset(10% 7% 10% 7% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none', scrollTrigger: { trigger: ph, start: 'top 95%', end: 'top 35%', scrub: .6 } });
    gsap.fromTo(img, { yPercent: -9, scale: 1.18 }, { yPercent: 9, scale: 1.08, ease: 'none', scrollTrigger: { trigger: ph, start: 'top bottom', end: 'bottom top', scrub: .6 } });
    gsap.from(ph.querySelectorAll('figcaption, .about-badge'), { y: 24, autoAlpha: 0, duration: .9, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: ph, start: 'top 60%', once: true } });
  }
  gsap.utils.toArray('.nc-m > img').forEach(function (im) {
    gsap.fromTo(im, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: .6 } });
  });
  gsap.utils.toArray('.pc-ph').forEach(function (im) {
    gsap.fromTo(im, { yPercent: 4 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: .6 } });
  });
})();
