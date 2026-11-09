/* Super + Mansão Maromba: abdução (nave + raio + produtos), explorador da linha, rótulos que viram e anel do Sabor Energético */
(function () {
  'use strict';
  var d = document.documentElement;
  var calm = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches || d.classList.contains('a11y-motion'); };
  var lang = function () { var l = (d.lang || 'pt').slice(0, 2); return l === 'en' || l === 'es' ? l : 'pt'; };
  var IMG = '../assets/img/projetos/super-mansao-maromba/';

  /* ---------- abdução ---------- */
  var abd = document.querySelector('[data-smm-abd]');
  if (abd) (function () {
    var ufoW = abd.querySelector('.smm-ufo-w'), line = abd.querySelector('.smm-line'), items = [].slice.call(line.children);
    
    var say = abd.querySelector('.smm-say'), replay = abd.querySelector('.smm-replay');
    items.forEach(function (li, i) { li.style.setProperty('--i', i); });
    // frase: palavras separadas para entrar uma a uma (o texto de cada idioma fica no próprio elemento)
    var sayPt = say.textContent.trim();
    var split = function () {
      var t = lang() === 'pt' ? sayPt : (say.getAttribute('data-' + lang()) || sayPt);
      say.setAttribute('aria-label', t);
      say.innerHTML = t.split(' ').map(function (w, k) { return '<span class="w" aria-hidden="true" style="--d:' + k + '">' + w + '</span>'; }).join(' ');
    };
    split(); new MutationObserver(split).observe(d, { attributes: true, attributeFilter: ['lang'] });

    // ponto de onde os produtos saem: embaixo da nave
    var geo = function () {
      var sr = abd.getBoundingClientRect(), uw = ufoW.offsetWidth;
      return { ux: ufoW.offsetLeft + uw * 0.53, uy: ufoW.offsetTop + ufoW.offsetHeight * 0.6, sr: sr };
    };

    var timers = [], anims = [], started = false;
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var reset = function () {
      timers.forEach(clearTimeout); timers = []; anims.forEach(function (a) { a.cancel(); }); anims = [];
      abd.classList.remove('s-on', 's-beam', 's-sign', 's-idle');
    };
    var finalState = function () { abd.classList.add('s-on', 's-beam', 's-sign', 's-idle'); geo(); };
    var run = function () {
      reset(); void abd.offsetWidth;
      if (calm()) { finalState(); return; }
      geo();
      abd.classList.add('s-on');                               // a nave chega
      at(1250, function () {                                   // raio
        geo(); abd.classList.add('s-beam');
      });
      at(1850, function () {                                   // produtos descem pelo feixe, um por um
        var g = geo();
        items.forEach(function (li, i) {
          var r = li.getBoundingClientRect(), cx = r.left + r.width / 2 - g.sr.left, cy = r.top + r.height / 2 - g.sr.top;
          var dx = g.ux - cx, dy = g.uy - cy, rot = (i % 2 ? 1 : -1) * (14 + i * 3);
          var a = li.animate([
            { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.06) rotate(' + rot + 'deg)', opacity: 0, filter: 'brightness(2.6) saturate(.4)' },
            { offset: .3, opacity: 1 },
            { offset: .78, transform: 'translate(0,-22px) scale(1.05) rotate(' + (-rot * .12) + 'deg)', filter: 'brightness(1.25)' },
            { transform: 'none', opacity: 1, filter: 'none' }
          ], { duration: 1050, delay: i * 210, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' });
          anims.push(a);
        });
      });
      at(1850 + 5 * 210 + 900, function () { abd.classList.add('s-sign'); });   // logos e frase
      at(1850 + 5 * 210 + 1900, function () { anims.forEach(function (a) { a.cancel(); }); anims = []; abd.classList.add('s-idle'); });
    };
    replay.addEventListener('click', run);
    
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !started) { started = true; io.disconnect(); run(); } }, { threshold: 0.35 });
      io.observe(abd);
    } else finalState();
  })();

  /* ---------- explorador da linha ---------- */
  var x = document.querySelector('[data-smm-x]');
  if (x) (function () {
    var imgs = [].slice.call(x.querySelectorAll('.smm-x-img')), tabs = [].slice.call(x.querySelectorAll('.smm-x-tabs button'));
    var txts = [].slice.call(x.querySelectorAll('.smm-x-txt')), vb = [].slice.call(x.querySelectorAll('.smm-x-v button'));
    var P = 'enx', V = 'dark', user = false, vis = false, timer = 0;
    var show = function (p, v, anim) {
      var changedP = p !== P; P = p; V = v; x.dataset.p = p; x.dataset.v = v;
      var key = p + '-' + v;
      imgs.forEach(function (im) {
        var on = im.dataset.k === key;
        if (on) { im.classList.remove('is-out'); im.classList.add('is-on'); im.loading = 'eager'; }
        else if (im.classList.contains('is-on')) { im.classList.remove('is-on'); if (anim) { im.classList.add('is-out'); setTimeout(function () { im.classList.remove('is-out'); }, 700); } }
      });
      tabs.forEach(function (b) { var on = b.dataset.p === p; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      vb.forEach(function (b) { var on = b.dataset.v === v; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
      txts.forEach(function (t) { var on = t.dataset.p === p; t.hidden = !on; if (on && changedP && anim) { t.classList.remove('is-in'); void t.offsetWidth; t.classList.add('is-in'); } });
    };
    tabs.forEach(function (b) { b.addEventListener('click', function () { user = true; show(b.dataset.p, V, true); }); });
    vb.forEach(function (b) { b.addEventListener('click', function () { user = true; show(P, b.dataset.v, true); }); });
    x.querySelector('.smm-x-tabs').addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement); if (i < 0 || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      e.preventDefault(); var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); user = true; show(n.dataset.p, V, true);
    });
    show(P, V, false);
    // passa sozinho pelos produtos e versões enquanto ninguém mexe
    var ORDER = [['enx', 'dark'], ['enx', 'light'], ['gel', 'dark'], ['gel', 'light'], ['anti', 'dark'], ['anti', 'light']], step = 0;
    var tick = function () {
      timer = 0; if (!vis || calm()) return;
      if (user) { user = false; step = ORDER.findIndex(function (o) { return o[0] === P && o[1] === V; }); timer = setTimeout(tick, 7000); return; }
      step = (step + 1) % ORDER.length; show(ORDER[step][0], ORDER[step][1], true); timer = setTimeout(tick, 2800);
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && !timer) timer = setTimeout(tick, 2200); }, { threshold: 0.4 }).observe(x);
  })();

  /* ---------- rótulos: virar frente/verso ---------- */
  var cards = [].slice.call(document.querySelectorAll('.smm-card'));
  cards.forEach(function (c) {
    c.addEventListener('click', function () { var f = !c.classList.contains('is-flip'); c.classList.toggle('is-flip', f); c.setAttribute('aria-pressed', String(f)); });
  });
  var rot = document.querySelector('.smm-rot');
  if (rot && cards.length && 'IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; rio.disconnect(); if (calm()) return;
      // uma onda: cada rótulo mostra o verso e volta, para indicar que dá para virar
      cards.forEach(function (c, i) { setTimeout(function () { c.classList.add('is-flip'); }, 500 + i * 160); setTimeout(function () { if (c.getAttribute('aria-pressed') !== 'true') c.classList.remove('is-flip'); }, 1900 + i * 160); });
    }, { threshold: 0.5 });
    rio.observe(rot);
  }

  /* ---------- anel de tubos em volta do Sabor Energético ---------- */
  var ring = document.querySelector('[data-smm-ring]');
  if (ring) (function () {
    var orbit = ring.querySelector('.smm-orbit'), N = 10, tubes = [];
    for (var i = 0; i < N; i++) {
      var im = document.createElement('img'); im.className = 't'; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
      im.src = IMG + (i % 2 ? 'gel-light.webp' : 'gel-dark.webp'); im.width = 355; im.height = 1026; orbit.appendChild(im); tubes.push(im);
    }
    var R = 0;
    var lay = function () {
      var W = ring.clientWidth, H = ring.clientHeight, m = Math.min(W, H), big = Math.max(W, H);
      if (!W || !H) return;
      var L = m * 0.46; R = m * 0.3;
      ring.style.setProperty('--tw', (L * 355 / 1026) + 'px');
      tubes.forEach(function (t, k) { t.style.transform = 'rotate(' + (k * 360 / N) + 'deg) translateY(' + (-R) + 'px)'; });
    };
    lay(); addEventListener('resize', lay); if ('ResizeObserver' in window) new ResizeObserver(lay).observe(ring);
    var vis = false, raf = 0, a = 0, last = 0, lastY = scrollY;
    var frame = function (t) {
      raf = 0; if (!vis) return;
      var dt = last ? Math.min(64, t - last) : 16; last = t;
      var dy = scrollY - lastY; lastY = scrollY;
      if (!calm()) a += dt * 0.006 + dy * 0.05;
      orbit.style.transform = 'rotate(' + a.toFixed(2) + 'deg)';
      raf = requestAnimationFrame(frame);
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && !raf) { last = 0; lastY = scrollY; raf = requestAnimationFrame(frame); } }).observe(ring);
  })();
})();
