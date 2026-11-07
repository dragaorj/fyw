/* Fyw · análise própria do site (sem Google Analytics).
   Todo mundo: conta a página vista e de onde a pessoa veio (sem guardar nada no aparelho).
   Só quem clicou em "Aceitar" no aviso de cookies: também o caminho da visita, os cliques, o tempo e até onde rolou.
   Envia para /api/t. Robôs e o próprio painel não contam. */
(function () {
  'use strict';
  if (navigator.webdriver || /bot|crawl|spider|lighthouse|headless|preview/i.test(navigator.userAgent)) return;
  if (location.pathname.indexOf('/painel') === 0) return;
  // aparelho do dono (marcado ao entrar no /painel): não conta
  try { if (localStorage.getItem('fyw-eu') || /(?:^|;s*)fyw_eu=1/.test(document.cookie)) return; } catch (e) {}
  var END = '/api/t', path = location.pathname.replace(/index\.html$/, '') || '/';
  var ok = function () { try { return localStorage.getItem('fio-consent') === '"accepted"' || localStorage.getItem('fio-consent') === 'accepted'; } catch (e) { return false; } };
  var rid = function () { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); };
  var get = function (st, k) { try { return st.getItem(k); } catch (e) { return null; } };
  var put = function (st, k, v) { try { st.setItem(k, v); } catch (e) {} };
  var ids = function () {
    if (!ok()) return {};
    var v = get(localStorage, 'fyw-v'); if (!v) { v = rid(); put(localStorage, 'fyw-v', v); }
    var s = get(sessionStorage, 'fyw-s'); if (!s) { s = rid(); put(sessionStorage, 'fyw-s', s); }
    return { vid: v, sid: s };
  };
  var send = function (o) {
    var b = JSON.stringify(o);
    try { if (navigator.sendBeacon && navigator.sendBeacon(END, new Blob([b], { type: 'text/plain' }))) return; } catch (e) {}
    try { fetch(END, { method: 'POST', body: b, keepalive: true, headers: { 'Content-Type': 'text/plain' } }); } catch (e) {}
  };
  var q = new URLSearchParams(location.search);
  var ref = ''; try { ref = document.referrer && new URL(document.referrer).host !== location.host ? document.referrer : ''; } catch (e) {}
  var base = function (t) {
    var o = { t: t, p: path, w: innerWidth, l: (document.documentElement.lang || 'pt').slice(0, 2) };
    var i = ids(); if (i.sid) { o.sid = i.sid; o.vid = i.vid; }
    return o;
  };
  // página vista (com a origem)
  var pv = base('pv'); pv.title = document.title.slice(0, 90); pv.ref = ref.slice(0, 200);
  // resolução da tela, tamanho da janela e densidade de pixels
  try { pv.scr = screen.width + '×' + screen.height; pv.vh = innerHeight; pv.dpr = Math.round((devicePixelRatio || 1) * 100) / 100; } catch (e) {}
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { var v = q.get(k); if (v) pv[k.slice(4)] = v.slice(0, 60); });
  if (!get(sessionStorage, 'fyw-seen')) { pv.first = 1; put(sessionStorage, 'fyw-seen', '1'); }
  send(pv);
  // detalhes só com consentimento
  var t0 = Date.now(), depth = 0;
  addEventListener('scroll', function () { var h = document.documentElement.scrollHeight - innerHeight; if (h > 0) depth = Math.max(depth, Math.round(scrollY / h * 100)); }, { passive: true });
  document.addEventListener('click', function (e) {
    if (!ok()) return;
    var el = e.target.closest && e.target.closest('a,button,[role="button"],.hf-card,.work-row,.lw-cell,.pj2-item,input,label') || e.target;
    var c = base('click');
    c.x = Math.round(e.pageX / document.documentElement.scrollWidth * 1000) / 10; c.y = Math.round(e.pageY);
    c.h = document.documentElement.scrollHeight;
    c.el = (el.tagName || '').toLowerCase();
    c.txt = ((el.getAttribute && (el.getAttribute('aria-label') || '')) || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    var href = el.getAttribute && el.getAttribute('href'); if (href) c.href = href.slice(0, 120);
    send(c);
  }, { capture: true, passive: true });
  // contatos (para todos, anônimo): WhatsApp, e-mail, telefone, Instagram e envio de formulário
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '', g = /wa\.me|whatsapp/i.test(h) ? 'WhatsApp' : /^mailto:/i.test(h) ? 'E-mail' : /^tel:/i.test(h) ? 'Telefone' : /instagram\.com/i.test(h) ? 'Instagram' : /linkedin\.com/i.test(h) ? 'LinkedIn' : '';
    if (g) { var o = base('goal'); o.txt = g; o.href = h.slice(0, 120); send(o); }
  }, { capture: true, passive: true });
  document.addEventListener('submit', function (e) { var o = base('goal'); o.txt = 'Formulário'; o.href = ((e.target && e.target.getAttribute('action')) || '').slice(0, 120); send(o); }, true);
  // problemas ao carregar (para todos, anônimo): erros de script e arquivos que não abriram
  var nerr = 0;
  addEventListener('error', function (e) {
    if (nerr >= 5) return; nerr++;
    var o = base('err'), el = e.target;
    if (el && el !== window && (el.src || el.href)) { o.txt = 'Não carregou: ' + (el.tagName || '').toLowerCase(); o.href = String(el.src || el.href).replace(location.origin, '').slice(0, 120); }
    else { o.txt = String(e.message || 'Erro de script').slice(0, 120); o.href = String(e.filename || '').replace(location.origin, '').slice(0, 80) + (e.lineno ? ':' + e.lineno : ''); }
    send(o);
  }, true);
  addEventListener('unhandledrejection', function (e) { if (nerr >= 5) return; nerr++; var o = base('err'); o.txt = 'Promessa rejeitada: ' + String(e.reason && (e.reason.message || e.reason) || '').slice(0, 100); send(o); });
  // velocidade (para todos, anônimo): tempo até o servidor responder, até a página carregar e até o maior conteúdo aparecer (LCP)
  var lcp = 0;
  try { new PerformanceObserver(function (l) { var x = l.getEntries(); if (x.length) lcp = Math.round(x[x.length - 1].startTime); }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}
  var perfSent = false;
  var perf = function () {
    if (perfSent) return; perfSent = true;
    var n = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null, o = base('perf');
    if (n) { o.ttfb = Math.round(n.responseStart); o.load = Math.round(n.loadEventEnd || n.domComplete || 0); }
    o.lcp = lcp; if (o.load || o.lcp) send(o);
  };
  addEventListener('load', function () { setTimeout(perf, 4000); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') perf(); });
  var left = false;
  var leave = function () { if (left || !ok()) return; left = true; var o = base('leave'); o.dur = Math.round((Date.now() - t0) / 1000); o.depth = depth; send(o); };
  addEventListener('pagehide', leave);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') leave(); });
})();
