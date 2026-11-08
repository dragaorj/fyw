/* Impacta Mais 2026 — interações */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header: fundo ao rolar, some ao descer
  var hd = $('#hd'), lastY = 0;
  function onScroll() {
    var y = scrollY;
    var mx = document.documentElement.scrollHeight - innerHeight; hd.style.setProperty('--p', mx > 0 ? (y / mx).toFixed(4) : 0);
    hd.classList.toggle('is-solid', y > 40);
    if (y <= 40) { hd.classList.remove('is-open'); var ha0 = $('.hd-ast'); if (ha0) ha0.setAttribute('aria-expanded', 'false'); }
    if (y > 500 && y > lastY + 4 && !root.classList.contains('is-menu') && innerWidth <= 860) hd.classList.add('is-hide');
    else if (y < lastY - 4 || y < 500) hd.classList.remove('is-hide');
    lastY = y;
  }
  var srRaf = 0;
  function spin() { srRaf = 0; root.style.setProperty('--sr', (scrollY * 0.3).toFixed(1)); }
  addEventListener('scroll', function () { onScroll(); if (!srRaf && !reduce) srRaf = requestAnimationFrame(spin); }, { passive: true }); onScroll(); spin();

  // menu do celular

  // menu do desktop recolhido no asterisco ao rolar: clique abre/fecha (hdAstToggle)
  (function () {
    var ha = $('.hd-ast'); if (!ha) return;
    var set = function (on) { hd.classList.toggle('is-open', on); ha.setAttribute('aria-expanded', on ? 'true' : 'false'); ha.setAttribute('aria-label', on ? 'Fechar menu' : 'Abrir menu'); };
    ha.addEventListener('click', function (e) { e.preventDefault(); if (!hd.classList.contains('is-solid')) return; set(!hd.classList.contains('is-open')); });
    $$('.hd-nav a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('click', function (e) { if (!hd.contains(e.target)) set(false); });
  })();
  var burger = $('.hd-burger');
  function menu(open) { root.classList.toggle('is-menu', open); root.classList.toggle('is-lock', open); burger.setAttribute('aria-expanded', open); $('#drawer').setAttribute('aria-hidden', !open); }
  burger.addEventListener('click', function () { menu(!root.classList.contains('is-menu')); });
  $$('#drawer a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });

  // contagem regressiva até o evento (se já passou, mostra a data do evento)
  var cd = $('[data-cd]');
  if (cd) {
    var target = new Date(cd.dataset.cd).getTime();
    var tick = function () {
      var ms = target - Date.now();
      if (ms <= 0) {
        cd.innerHTML = '<div><b>20</b><small>maio</small></div><div><b>21</b><small>maio</small></div><div><b>2026</b><small>São Paulo</small></div>';
        var nx = $('.hero-next'); if (nx) nx.textContent = 'Edição 2026';
        return;
      }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
      $('[data-k=d]', cd).textContent = d; $('[data-k=h]', cd).textContent = (h < 10 ? '0' : '') + h; $('[data-k=m]', cd).textContent = (m < 10 ? '0' : '') + m;
      setTimeout(tick, 30000);
    };
    tick();
  }

  // reveal
  var rvs = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var t = e.target; t.classList.add('in'); ro.unobserve(t); setTimeout(function () { t.style.transitionDelay = ''; t.classList.add('rv-done'); }, 1500); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { var sib = el.parentElement ? $$(':scope > .rv', el.parentElement).indexOf(el) : 0; el.style.transitionDelay = Math.min(Math.max(sib, 0), 6) * 70 + 'ms'; ro.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add('in'); });
  requestAnimationFrame(function () { $('.hero').classList.add('in'); });

  // faixa de logos: deriva lenta + arrastar
  $$('[data-drift]').forEach(function (box) {
    var tr = $('.mq-track', box); tr.innerHTML += tr.innerHTML + tr.innerHTML;
    $$('img', tr).forEach(function (im, i, all) { if (i >= all.length / 3) im.alt = ''; });
    var x = 0, drag = false, sx = 0, sxx = 0, vis = true, third = 0;
    var measure = function () { third = tr.scrollWidth / 3; }; measure(); addEventListener('resize', measure); addEventListener('load', measure);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(box);
    (function loop() { if (vis && !drag && !reduce) x -= 0.6; if (third) { if (x <= -third) x += third; if (x > 0) x -= third; } tr.style.transform = 'translate3d(' + x + 'px,0,0)'; requestAnimationFrame(loop); })();
    box.addEventListener('pointerdown', function (e) { drag = true; sx = e.clientX; sxx = x; box.classList.add('is-drag'); box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', function (e) { if (drag) x = sxx + (e.clientX - sx); });
    ['pointerup', 'pointercancel'].forEach(function (t) { box.addEventListener(t, function () { drag = false; box.classList.remove('is-drag'); }); });
  });

  // vídeo: abre o player do YouTube no lugar da capa
  $$('[data-yt]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.yt + '?autoplay=1&rel=0';
      f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.title = 'Vídeo do Impacta Mais';
      b.appendChild(f);
    });
  });

  // V1: palavras "palestras / debates / workshop / colaboração" alternam com o texto do cartão
  var words = $('[data-cycle]'), ftxt = $('[data-fmt-txt]');
  if (words && ftxt) {
    var T = ['Palcos e trilhas de conhecimento temático', 'Rodadas de negócios, hackathons e premiações para investidores e startups', 'Workshops e oficinas temáticas', 'Espaços para colaboração e apresentações'];
    var sp = $$('span', words), wi = 1;
    var set = function (i) { wi = i; sp.forEach(function (s, k) { s.classList.toggle('is-on', k === i); }); ftxt.textContent = T[i]; };
    sp.forEach(function (s, i) { s.addEventListener('mouseenter', function () { set(i); }); s.addEventListener('click', function () { set(i); }); });
    if (!reduce) setInterval(function () { if (!words.matches(':hover')) set((wi + 1) % sp.length); }, 3200);
  }

  // carrossel da edição 2025 (coverflow): gira sozinho, clique e arraste
  // V1: carrossel curvo — fotos num cilindro visto por dentro, girando devagar
  // V1: carrossel curvo como no PDF — parede côncava de um cilindro: foto do meio menor, as das pontas maiores
  if (root.classList.contains('v1')) $$('[data-cf]').forEach(function (cf) {
    var its = $$('.cf-it', cf); its.forEach(function (it) { cf.appendChild(it.cloneNode(true)); });
    its = $$('.cf-it', cf); var ring = document.createElement('div'); ring.className = 'cf-ring'; cf.appendChild(ring); its.forEach(function (it) { ring.appendChild(it); });
    var n = its.length, step = 360 / n, ang = 0, vis = true, last = 0, W = 0, R = 0, P = 0, drag = null;
    function place() {
      W = cf.clientWidth; var w = W * (W < 700 ? .3 : .2);
      R = w / (2 * Math.tan(Math.PI / n)) / .9; P = W * (W < 700 ? .62 : .553);
      cf.style.perspective = P + 'px';
      its.forEach(function (it, i) { it.style.width = w + 'px'; it.style.transform = 'translate(-50%,-50%) rotateY(' + (i * step) + 'deg) translateZ(' + (-R) + 'px)'; });
    }
    place(); addEventListener('resize', place);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(cf);
    cf.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, a: ang }; cf.setPointerCapture(e.pointerId); });
    cf.addEventListener('pointermove', function (e) { if (drag) ang = drag.a + (e.clientX - drag.x) * 90 / W; });
    cf.addEventListener('pointerup', function () { drag = null; }); cf.addEventListener('pointercancel', function () { drag = null; });
    (function spin(t) {
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (vis && !reduce && !drag) ang -= dt * 0.0045;
      ring.style.transform = 'translateZ(' + (P - R * .943) + 'px) rotateY(' + ang + 'deg)';
      for (var k = 0; k < n; k++) { var c = Math.cos((k * step + ang) * Math.PI / 180); its[k].style.visibility = c > -0.25 ? 'visible' : 'hidden'; }
      requestAnimationFrame(spin);
    })(0);
  });
  if (!root.classList.contains('v1')) $$('[data-cf]').forEach(function (cf) {
    var items = $$('.cf-it', cf), n = items.length, cur = 2, dots = cf.nextElementSibling, timer = 0;
    items.forEach(function (_, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Foto ' + (i + 1)); b.addEventListener('click', function () { go(i); }); dots.appendChild(b); });
    var prevO = [];
    function layout() {
      var bw = items[0].offsetWidth, gap = Math.max(14, bw * 0.05), sc = function (k) { return k === 0 ? 1 : (k === 1 ? 0.76 : 0.68); };
      items.forEach(function (it, i) {
        var o = ((i - cur) % n + n + Math.floor(n / 2)) % n - Math.floor(n / 2), k = Math.abs(o), s = sc(k), x = 0;
        // posição somando a metade de cada foto + o espaço: espaçamento igual entre todas
        for (var q = 1; q <= k; q++) x += bw * sc(q - 1) / 2 + gap + bw * sc(q) / 2;
        x *= o < 0 ? -1 : 1;
        var jump = prevO[i] !== undefined && Math.abs(o - prevO[i]) > 1; prevO[i] = o;
        if (jump) { it.style.transition = 'none'; it.style.opacity = 0; }
        it.style.transform = 'translate(-50%,-50%) translateX(' + x + 'px) scale(' + s + ')';
        it.style.zIndex = 10 - k; it.style.filter = o === 0 ? 'none' : 'grayscale(1) brightness(.85)';
        if (jump) { void it.offsetWidth; it.style.transition = ''; requestAnimationFrame(function () { it.style.opacity = 1; }); }
        else it.style.opacity = k > 2 ? 0 : 1;
        it.classList.toggle('is-c', o === 0);
      });
      $$('button', dots).forEach(function (b, i) { b.classList.toggle('is-on', i === cur); });
    }
    function go(i) { cur = (i + n) % n; layout(); restart(); }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(cur + 1); }, 3600); }
    items.forEach(function (it, i) { it.addEventListener('click', function () { if (i !== cur) go(i); }); });
    var sx = null;
    cf.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    cf.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); });
    addEventListener('resize', layout); layout(); restart();
  });

  // local: abas Local / Hotéis / Como chegar
  var tabs = $$('.loc-tabs button'), info = $('[data-info]');
  var INFO = {
    local: '<h3>Pro Magno Centro de Eventos</h3><p>Avenida Professora Ida Kolb, 513, Jardim das Laranjeiras,<br>São Paulo, SP, CEP 02518-000</p>',
    hoteis: '<h3><span class="or">4</span> estrelas<br><span class="or">8,5km</span> de distância do evento</h3>',
    chegar: '<h3>Como chegar</h3><p>Av. Profa. Ida Kolb, 513 — Jardim das Laranjeiras, São Paulo<br><a class="or" href="https://www.google.com/maps/dir/?api=1&destination=Pro+Magno+Centro+de+Eventos+S%C3%A3o+Paulo" target="_blank" rel="noopener">Abrir rota no Google Maps</a></p>'
  };
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.tab;
      tabs.forEach(function (t) { t.classList.toggle('is-on', t === b); });
      $$('.loc-pane').forEach(function (p) { p.classList.toggle('is-on', p.dataset.pane === k); });
      var mp = $('.loc-pane[data-pane=chegar] iframe'); if (k === 'chegar' && mp && !mp.src) mp.src = mp.dataset.src;
      if (info) info.innerHTML = INFO[k];
    });
  });

  // formulário de contato (demonstração: abre o e-mail com a mensagem)
  var form = $('.ft-form form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#f-n').value.trim(), m = $('#f-e').value.trim(), t = $('#f-m').value.trim(), msg = $('.ft-msg', form);
    if (!n || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m) || !t) { msg.textContent = 'Preencha nome, e-mail válido e mensagem.'; return; }
    location.href = 'mailto:impacta.mais@impacthub.net?subject=' + encodeURIComponent('Contato pelo site — ' + n) + '&body=' + encodeURIComponent(t + '\n\n' + n + ' · ' + m);
    msg.textContent = 'Abrimos o seu e-mail com a mensagem pronta.';
  });


  // hero: a 2ª linha do título ganha a largura exata da 1ª (bloco retangular)
  var fitTitle = function () {
    var t1 = $('.hero-title .t1'), t2 = $('.hero-title .t2'); if (!t1 || !t2) return;
    var w = function (el) { var r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().width; };
    t2.style.fontSize = ''; t1.style.fontSize = '';
    // no celular, IMPACTA ocupa a largura toda do bloco
    if (matchMedia('(max-width:860px)').matches) { var box = $('.hero-r'), cw = box ? box.clientWidth : 0; for (var z = 0; z < 3 && cw; z++) { var w1 = w(t1); if (!w1) break; t1.style.fontSize = (parseFloat(getComputedStyle(t1).fontSize) * cw / w1) + 'px'; } }
    for (var k = 0; k < 3; k++) { var a = w(t1), b = w(t2); if (!a || !b) return; var fs0 = parseFloat(getComputedStyle(t2).fontSize); t2.style.fontSize = (fs0 * a / b) + 'px'; }
  };
  fitTitle(); addEventListener('resize', fitTitle); if (document.fonts) document.fonts.ready.then(fitTitle);
  // hero: parallax leve com o mouse
  var heroEl = $('.hero');
  if (heroEl && window.gsap && !reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var layers = [['.hero-ph', 22]].map(function (l) { var el = $(l[0], heroEl); return el ? { x: gsap.quickTo(el, 'x', { duration: .9, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: .9, ease: 'power3' }), k: l[1] } : null; }).filter(Boolean);
    heroEl.addEventListener('mousemove', function (e) { var r = heroEl.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; layers.forEach(function (l) { l.x(nx * l.k); l.y(ny * l.k * .6); }); });
    heroEl.addEventListener('mouseleave', function () { layers.forEach(function (l) { l.x(0); l.y(0); }); });
  }
  // GSAP: títulos e números
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    // abertura: letras do título sobem uma a uma, linhas do texto à esquerda se revelam, caixas e botões entram
    if (!root.classList.contains('v1')) $$('.hero-title > span').forEach(function (line) { var t = line.textContent; line.innerHTML = ''; t.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = c === ' ' ? ' ' : c; line.appendChild(s); }); });
    document.documentElement.classList.add('is-intro');
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: function () { document.documentElement.classList.remove('is-intro'); gsap.set('.hd-in > *, .hero-cta > *, .cd > div, .hero-next', { clearProps: 'transform,opacity' }); } });
    tl.from('.hd-in > *', { y: -30, opacity: 0, duration: .8, stagger: .08 }, 0)
      .from('.hero-title .t1 .ch', { yPercent: 110, rotate: 8, duration: 1, stagger: .04 }, .15)
      .from('.hero-title .t2 .ch', { yPercent: 110, rotate: 8, duration: 1, stagger: .035 }, .35)
      .from(root.classList.contains('v1') ? '.hero-title > span' : [], { yPercent: 60, opacity: 0, clipPath: 'inset(0 0 100% 0)', duration: 1.1, stagger: .15, clearProps: 'clipPath' }, .15)
      .from('.hero-kick .ln > span', { yPercent: 105, duration: .9, stagger: .1 }, .3)
      .from('.hero-next', { y: 20, opacity: 0, duration: .7 }, .7)
      .from('.cd > div', { y: 30, opacity: 0, scale: .85, duration: .7, stagger: .08, ease: 'back.out(1.8)' }, .8)
      .from('.hero-cta > *', { y: 26, opacity: 0, duration: .8, stagger: .12 }, .9);
    $$('[data-count]').forEach(function (b) {
      var to = +b.dataset.count, o = { v: 0 };
      ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: function () { gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: function () { b.textContent = Math.round(o.v).toLocaleString('pt-BR'); } }); } });
    });
    // títulos das seções: palavra por palavra subindo de dentro de uma máscara; asterisco gira ao entrar
    $$('.ast-h, .spons-h, .tix-h').forEach(function (h) {
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
              var o = document.createElement('span'); o.className = 'wm'; var i = document.createElement('span'); i.className = 'wi'; i.textContent = w; o.appendChild(i); frag.appendChild(o);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'IMG' && n.tagName !== 'BR' && n.tagName !== 'SVG' && !n.classList.contains('wm')) walk(n);
        });
      };
      walk(h);
      var tl2 = gsap.timeline({ scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
      tl2.from($$('.wi', h), { yPercent: 115, rotate: 4, duration: 1, ease: 'power4.out', stagger: .06 });
      var ast = $('img', h); if (ast) tl2.from(ast, { rotate: -200, scale: 0, duration: 1.1, ease: 'back.out(1.6)' }, 0);
    });
    // fotos: entram com leve zoom-out quando aparecem
    $$('.about-ph img, .spk img, .hub img:not(.hub-ast), .split img, .loc-pane img, .vid img').forEach(function (im) {
      gsap.from(im, { scale: 1.14, duration: 1.4, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: im, start: 'top 92%', once: true } });
    });
    // V1 ingressos: cartões entram em sequência, o logo em stroke se desenha e os asteriscos giram
    if (document.querySelector('.tix-v1')) {
      var lp = Array.prototype.slice.call(document.querySelectorAll('#imStroke path')); lp.forEach(function (p) { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });
      var ttl = gsap.timeline({ scrollTrigger: { trigger: '.tix-v1 .tix-cards', start: 'top 82%', once: true } });
      ttl.from('.tix-v1 .tk', { y: 46, opacity: 0, duration: .9, ease: 'power3.out', stagger: .09, clearProps: 'transform,opacity' })
        .to(lp, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, .2)
        .from('.tix-v1 .tk-ast', { rotate: -180, scale: .4, opacity: 0, duration: 1, ease: 'back.out(1.6)', stagger: .07, clearProps: 'transform,opacity,scale,rotate' }, .3)
        .from('.tix-v1 .tk b', { yPercent: 40, opacity: 0, duration: .8, ease: 'power3.out', stagger: .07 }, .25);
    }
    // posições do scroll recalculadas quando fotos e fontes terminam de carregar (senão a linha para no meio)
    var stRefresh = function () { ScrollTrigger.refresh(); };
    addEventListener('load', stRefresh);
    if (document.fonts) document.fonts.ready.then(stRefresh);
    Array.prototype.slice.call(document.images).forEach(function (im) { if (!im.complete) im.addEventListener('load', function () { clearTimeout(window.__stT); window.__stT = setTimeout(stRefresh, 200); }, { once: true }); });
    // V1: a linha grossa se desenha conforme a rolagem (laranja no alto, azul embaixo)
    var trs = $$('.trail path'); if (trs.length) { var vd = $('.v1-dark'), spn = $('.v1-dark .spons'); var fitTr = function () { if (vd && spn) vd.style.setProperty('--trh', spn.offsetHeight + 'px'); }; fitTr(); addEventListener('resize', fitTr); trs.forEach(function (t) { if (t.classList.contains('tr-m')) return; t.setAttribute('pathLength', '1'); t.style.strokeDasharray = '1 1'; t.style.strokeDashoffset = '1'; }); var trm = $('.tr-m'), trmL = 0; var fitTm = function () { if (!trm || !trm.getScreenCTM()) return; var m = trm.getScreenCTM(), L = trm.getTotalLength(), s = 0, p0 = null; for (var k = 0; k <= 200; k++) { var q = trm.getPointAtLength(L * k / 200), x = q.x * m.a + m.e, y = q.y * m.d + m.f; if (p0) s += Math.hypot(x - p0[0], y - p0[1]); p0 = [x, y]; } trmL = Math.ceil(s) + 20; trm.style.strokeDasharray = trmL + ' ' + trmL; if (typeof drawTm === 'function') drawTm(); }; fitTm(); addEventListener('resize', fitTm); ScrollTrigger.addEventListener('refresh', fitTm); var trsD = trs.filter(function (t) { return !t.classList.contains('tr-m'); }); if (trm) { var tmo = { p: 0 }; var drawTm = function () { if (trmL) trm.style.strokeDashoffset = (trmL * (1 - tmo.p)) + 'px'; }; drawTm(); gsap.to(tmo, { p: 1, ease: 'none', onUpdate: drawTm, scrollTrigger: { trigger: '.v1-dark', start: 'top 75%', end: 'bottom bottom', scrub: .6 } }); } gsap.to(trsD, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.v1-dark', start: 'top 75%', end: 'bottom bottom', scrub: .6 } }); }
    if (!matchMedia('(max-width:860px)').matches) $$('[data-par]').forEach(function (im) { gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: .6 } }); });
    if (!matchMedia('(max-width:860px)').matches) gsap.fromTo('.hero-ph img', { yPercent: 0 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 } });
  }

  // cursor ponto Fyw
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var dot = document.createElement('div'); dot.className = 'fyw-dot is-hidden'; dot.setAttribute('aria-hidden', 'true'); document.body.appendChild(dot); root.classList.add('has-dot');
    var cx = 0, cy = 0, raf = 0;
    addEventListener('pointermove', function (e) { cx = e.clientX; cy = e.clientY; dot.classList.remove('is-hidden'); if (!raf) raf = requestAnimationFrame(function () { raf = 0; dot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; }); }, { passive: true });
    document.addEventListener('mouseover', function (e) { dot.classList.toggle('is-hover', !!(e.target.closest && e.target.closest('a, button, summary, input, textarea, .cf-it'))); });
    document.addEventListener('mouseleave', function () { dot.classList.add('is-hidden'); });
  }

  // botão de voltar ao topo
  (function () {
    var b = document.createElement('a'); b.className = 'to-top'; b.href = '#inicio'; b.setAttribute('aria-label', 'Voltar ao topo');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(b);
    b.addEventListener('click', function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });
    var on = function () { b.classList.toggle('is-on', scrollY > innerHeight * .8); };
    addEventListener('scroll', on, { passive: true }); on();
  })();

  // cantos arredondados garantidos: recorta cada moldura de foto com o próprio raio (não falha durante zoom/parallax)
  (function clipRound() {
    var sel = '.split figure, .about-ph, .loc-stage, .fmt-card figure, .spk-card, .video-box, .hotels figure, .cf-it, .hub';
    var run = function () { Array.prototype.slice.call(document.querySelectorAll(sel)).forEach(function (el) { var r = getComputedStyle(el).borderTopLeftRadius; if (r && r !== '0px') el.style.clipPath = 'inset(0 round ' + r + ')'; }); };
    run(); addEventListener('resize', run);
  })();
})();
