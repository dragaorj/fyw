/* Lumière Dentists — interações */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header: fundo ao rolar, some ao descer ---------- */
  var nav = $('#nav'), lastY = 0;
  function onScroll() {
    var y = scrollY;
    nav.classList.toggle('is-solid', y > 40);
    if (y > 600 && y > lastY + 4 && !root.classList.contains('is-menu')) nav.classList.add('is-hide');
    else if (y < lastY - 4 || y < 600) nav.classList.remove('is-hide');
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- menu do celular ---------- */
  var burger = $('.burger');
  function menu(open) {
    root.classList.toggle('is-menu', open); document.body.classList.toggle('is-lock', open);
    burger.setAttribute('aria-expanded', open); $('#menu').setAttribute('aria-hidden', !open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { menu(!root.classList.contains('is-menu')); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });

  /* ---------- serviços: lista + painel lateral ---------- */
  var SVC = [
    { n: 'Teeth whitening', s: 'Up to 8 shades brighter in a single 60-minute session — safe for sensitive teeth.', d: 'Professional, light-activated whitening that breaks down deep stains and discoloration. Unlike at-home kits, our in-office treatment delivers dramatic results in one visit.', f: ['Up to 8 shades brighter in one session', 'Safe for sensitive teeth', 'Long-lasting results (12–18 months)', 'Custom take-home maintenance kit included'] },
    { n: 'Dental implants', s: 'Permanent, natural-looking replacements placed with 3D-guided precision.', d: 'The gold standard for tooth replacement. A titanium post is placed into the jawbone and topped with a lifelike crown — it looks, feels and functions exactly like a natural tooth, for life.', f: ['Permanent, lifetime solution', 'Preserves jawbone structure', '3D-guided precision placement', 'Natural look and full chewing function'] },
    { n: 'Porcelain veneers', s: 'Ultra-thin porcelain that corrects color, shape and spacing in two visits.', d: 'Veneers are ultra-thin porcelain shells bonded to the front of your teeth. A digital smile preview lets you see the result before treatment even begins.', f: ['Completed in just 2 visits', 'Corrects color, gaps, chips and shape', 'Stain-resistant porcelain', 'Digital smile preview before treatment'] },
    { n: 'Orthodontics', s: 'Clear aligners and modern braces, planned with 3D digital scanning.', d: 'Clear aligners and modern braces designed to move teeth efficiently and comfortably. Every plan is built from a 3D scan — no impressions, no mess, just precise results.', f: ['Clear aligners or modern braces', 'Virtually invisible options', '3D digital scanning — no impressions', 'Average treatment: 6–18 months'] },
    { n: 'Dental crowns', s: 'Ceramic crowns that restore strength and shape — same-day CEREC available.', d: 'Custom ceramic caps placed over damaged, decayed or weakened teeth to restore their shape, strength and appearance, matched precisely to your natural tooth color.', f: ['Same-day CEREC crowns available', 'Precise natural color match', 'Strengthens cracked or decayed teeth', 'Durable — 10 to 15+ years'] },
    { n: 'Dental cleaning', s: 'Gentle hygiene and a full oral health screening, every six months.', d: 'A trained hygienist removes hardened tartar, polishes enamel and checks for early signs of decay or gum disease — the foundation of a healthy smile.', f: ['Removes tartar and plaque buildup', 'Full oral health screening included', 'Gentle on sensitive gums', 'Recommended every 6 months'] }
  ];
  var list = $('#svcList');
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  list.innerHTML = SVC.map(function (s, i) {
    return '<button class="svc rv" type="button" data-i="' + i + '"><span class="svc-n">0' + (i + 1) + '</span><h3>' + s.n + '</h3><p>' + s.s + '</p><span class="svc-go" aria-hidden="true">' + arrow + '</span></button>';
  }).join('');
  var lb = $('#lb');
  function openLb(i) {
    var s = SVC[i];
    $('#lbN').textContent = '0' + (i + 1) + ' — Treatment';
    $('#lbT').textContent = s.n; $('#lbD').textContent = s.d;
    $('#lbF').innerHTML = s.f.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('is-lock');
    setTimeout(function () { $('.lb-x', lb).focus(); }, 50);
  }
  function closeLb() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('is-lock'); }
  $$('.svc', list).forEach(function (b) { b.addEventListener('click', function () { openLb(+b.dataset.i); }); });
  $$('[data-close]', lb).forEach(function (b) { b.addEventListener('click', closeLb); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLb(); menu(false); } });

  /* ---------- depoimentos: uma citação por vez, troca sozinha ---------- */
  var qs = $$('.q-item'), faces = $$('.q-face'), bar = $('#qbar'), qi = 0, qt = 0, QD = 6500;
  function showQ(i) {
    qi = (i + qs.length) % qs.length;
    qs.forEach(function (q, k) { q.classList.toggle('is-on', k === qi); });
    faces.forEach(function (f, k) { f.classList.toggle('is-on', k === qi); });
    if (window.gsap && !reduce) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: QD / 1000, ease: 'none' });
    clearTimeout(qt); qt = setTimeout(function () { showQ(qi + 1); }, QD);
  }
  faces.forEach(function (f, k) { f.addEventListener('click', function () { showQ(k); }); });
  var qWrap = $('#quote'), sx = null;
  qWrap.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  qWrap.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) showQ(qi + (dx < 0 ? 1 : -1)); });
  showQ(0);

  /* ---------- FAQ: abre suave, um de cada vez ---------- */
  var qa = $$('.qa');
  qa.forEach(function (d) {
    var sum = $('summary', d), ans = $('.ans', d);
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) { close(d); return; }
      qa.forEach(function (o) { if (o !== d && o.open) close(o); });
      d.open = true;
      if (window.gsap && !reduce) gsap.fromTo(ans, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .6, ease: 'power3.out' });
    });
    function close(x) {
      var a = $('.ans', x);
      if (window.gsap && !reduce) gsap.to(a, { height: 0, opacity: 0, duration: .4, ease: 'power2.inOut', onComplete: function () { x.open = false; gsap.set(a, { clearProps: 'all' }); } });
      else x.open = false;
    }
  });

  /* ---------- aberto agora (horário de Miami) ---------- */
  var openEl = $('#openNow');
  function tickOpen() {
    var m = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    var d = m.getDay(), t = m.getHours() * 60 + m.getMinutes();
    var open = (d >= 1 && d <= 5 && t >= 480 && t < 1080) || (d === 6 && t >= 540 && t < 840);
    openEl.classList.toggle('is-open', open);
    openEl.textContent = open ? 'Open now' : 'Closed now · we reply next business day';
  }
  tickOpen(); setInterval(tickOpen, 60000);

  /* ---------- formulário (demonstração: valida e confirma) ---------- */
  var form = $('#form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    ['#f1', '#f3', '#f6'].forEach(function (id) {
      var el = $(id), v = el.value.trim(), ok = v && (id !== '#f3' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
      el.parentNode.classList.toggle('is-bad', !ok); if (!ok) bad = true;
    });
    if (bad) return;
    $('#formBox').classList.add('is-sent');
  });
  $$('.fld input, .fld textarea', form).forEach(function (el) { el.addEventListener('input', function () { el.parentNode.classList.remove('is-bad'); }); });

  /* ---------- revelação ao rolar ---------- */
  var rvs = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { var p = el.parentElement, sib = p ? $$(':scope > .rv', p).indexOf(el) : 0; el.style.transitionDelay = Math.min(Math.max(sib, 0), 6) * 80 + 'ms'; io.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add('in'); });

  /* ---------- GSAP: abertura do hero e números ---------- */
  if (window.gsap && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.nav-in > *', { y: -20, opacity: 0, duration: .8, stagger: .08 }, .1)
      .from('.hero h1 .ln > span', { yPercent: 110, duration: 1.2, stagger: .12 }, .2)
      .from('.hero-sub, .hero-actions', { y: 24, opacity: 0, duration: .9, stagger: .1 }, .7)
      .from('.hero-stats > div', { y: 24, opacity: 0, duration: .9, stagger: .1 }, .85)
      .from('.hero-trust span', { opacity: 0, duration: .8, stagger: .06 }, 1);
    $$('[data-count]').forEach(function (el) {
      var to = +el.dataset.count, o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } }); } });
    });
    gsap.to('.hero-media', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 } });
  }

  /* ---------- vídeo de fundo do YouTube SEM botão de play ----------
     Sem controles e sem clique; o vídeo só aparece depois que o player confirma que está TOCANDO.
     Até lá (ou se o navegador bloquear o autoplay) fica a imagem — então o botão de play nunca aparece. */
  var hero = $('#hero'), VID = 'MFHIB-fSe7Q';
  if (!reduce && !(navigator.connection && navigator.connection.saveData)) {
    window.onYouTubeIframeAPIReady = function () {
      var shown = 0;
      var p = new YT.Player('yt', {
        videoId: VID, host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: VID, playsinline: 1, rel: 0, modestbranding: 1, disablekb: 1, fs: 0, iv_load_policy: 3, cc_load_policy: 0, showinfo: 0 },
        events: {
          onReady: function (e) { e.target.mute(); e.target.playVideo(); },
          onStateChange: function (e) {
            if (e.data === YT.PlayerState.PLAYING) { clearTimeout(shown); shown = setTimeout(function () { hero.classList.add('is-playing'); }, 600); }
            else if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(0); e.target.playVideo(); }
            else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.UNSTARTED) { clearTimeout(shown); hero.classList.remove('is-playing'); e.target.playVideo(); }
          }
        }
      });
      // se a aba fica escondida e volta, garante que continua tocando
      document.addEventListener('visibilitychange', function () { if (!document.hidden && p && p.playVideo) p.playVideo(); });
    };
    var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
  }
})();
