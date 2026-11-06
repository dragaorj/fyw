/* Seção "Desempenho" da home — dados reais do Google Lighthouse deste site.
   Abre com a última medição conhecida e troca pela medição ao vivo (/api/lighthouse, com cache de algumas horas na Vercel).
   Os medidores enchem e os números contam quando a seção aparece; Celular / Computador alterna as medições. */
(function () {
  var sec = document.getElementById('performance'); if (!sec) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-motion');
  // última medição conhecida (Lighthouse 13 · Moto G Power / 4G lento e computador)
  var DATA = {
    mobile: { at: '2026-11-06T20:17:00Z', scores: { performance: 98, accessibility: 97, bestPractices: 100, seo: 100 }, metrics: { fcp: 1500, lcp: 1500, cls: .006, tbt: 50, si: 4100 } },
    desktop: { at: '2026-11-06T15:00:00Z', scores: { performance: 92, accessibility: 97, bestPractices: 100, seo: 100 }, metrics: { fcp: 400, lcp: 400, cls: .001, tbt: 160, si: 2100 } }
  };
  var LIMIT = { fcp: 1800, lcp: 2500, cls: .1, tbt: 200, si: 3400 }; // "bom" segundo o Google
  var cur = 'mobile', seen = false;
  var lang = function () { var l = (document.documentElement.lang || 'pt').slice(0, 2); return l === 'en' || l === 'es' ? l : 'pt'; };
  var fmt = function (k, v) {
    var dec = lang() === 'en' ? '.' : ',';
    if (k === 'cls') return (Math.round(v * 1000) / 1000).toFixed(3).replace('.', dec);
    if (k === 'tbt') return Math.round(v) + ' ms';
    return (Math.round(v / 100) / 10).toFixed(1).replace('.', dec) + ' s';
  };
  var when = function (iso) {
    try { var d = new Date(iso); return d.toLocaleDateString({ pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[lang()], { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; }
  };
  var gauges = [].slice.call(sec.querySelectorAll('.pg')), mets = [].slice.call(sec.querySelectorAll('.pm'));
  var setG = function (g, v) { g.style.setProperty('--v', v.toFixed(1)); g.querySelector('.pg-n').textContent = Math.round(v); g.classList.toggle('is-mid', v < 89.5 && v >= 49.5); };
  var paint = function (animate) {
    var d = DATA[cur];
    gauges.forEach(function (g, i) {
      var to = d.scores[g.getAttribute('data-k')]; if (typeof to !== 'number') return;
      var from = +(g.style.getPropertyValue('--v') || 0);
      if (!animate || reduce) { setG(g, to); return; }
      if (window.gsap) { var o = { v: from }; gsap.to(o, { v: to, duration: from ? .9 : 1.6, delay: from ? 0 : .15 + i * .12, ease: 'power3.out', overwrite: true, onUpdate: function () { setG(g, o.v); } }); }
      else setG(g, to);
    });
    mets.forEach(function (m) {
      var k = m.getAttribute('data-k'), v = d.metrics[k]; if (typeof v !== 'number') return;
      m.querySelector('.pm-v').textContent = fmt(k, v);
      var p = Math.max(2, Math.min(100, v / (LIMIT[k] * 2) * 100)); // a metade da barra é o limite do "bom"
      m.style.setProperty('--p', p.toFixed(1) + '%'); m.classList.toggle('is-over', v > LIMIT[k]);
    });
    var t = sec.querySelector('.perf-when'); if (t) { t.textContent = ' · ' + when(d.at); t.setAttribute('datetime', d.at); }
  };
  // medição ao vivo (uma por dispositivo; a Vercel guarda em cache)
  var live = function (s) {
    // a função só existe na Vercel: no site local não chama (evita erro 404 no console)
    if (!window.fetch || location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    fetch('/api/lighthouse?s=' + s).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !j.ok || !j.scores || typeof j.scores.performance !== 'number') return;
      DATA[s] = j; if (s === cur && seen) paint(true); else if (s === cur) paint(false);
    }).catch(function () {});
  };
  // abas Celular / Computador
  sec.querySelectorAll('.perf-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      cur = b.getAttribute('data-s');
      sec.querySelectorAll('.perf-tabs button').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); });
      sec.classList.remove('is-swap'); void sec.offsetWidth; sec.classList.add('is-swap');
      paint(true);
    });
  });
  // número com vírgula ou ponto conforme o idioma
  new MutationObserver(function () { paint(false); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  gauges.forEach(function (g) { setG(g, 0); });
  paint(false); gauges.forEach(function (g) { setG(g, 0); });
  var start = function () { seen = true; sec.classList.add('is-on'); paint(true); };
  if (reduce || !('IntersectionObserver' in window)) start();
  else {
    var card = sec.querySelector('.perf-scores');
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !seen) { io.disconnect(); start(); } }, { threshold: .25 }); io.observe(card);
    // reserva: confere a posição ao rolar (garante a animação mesmo se o observador atrasar)
    var chk = function () { if (seen) { removeEventListener('scroll', chk); return; } var r = card.getBoundingClientRect(); if (r.top < innerHeight * .85 && r.bottom > 0) { io.disconnect(); removeEventListener('scroll', chk); start(); } };
    addEventListener('scroll', chk, { passive: true }); setTimeout(chk, 600);
  }
  // busca a medição ao vivo sem atrapalhar o carregamento da página
  var go = function () { live('mobile'); live('desktop'); };
  if (document.readyState === 'complete') setTimeout(go, 1200); else addEventListener('load', function () { setTimeout(go, 1200); });
})();
