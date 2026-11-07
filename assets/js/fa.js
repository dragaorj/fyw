/* Fyw · análise própria do site (sem Google Analytics).
   Todo mundo: conta a página vista e de onde a pessoa veio (sem guardar nada no aparelho).
   Só quem clicou em "Aceitar" no aviso de cookies: também o caminho da visita, os cliques, o tempo e até onde rolou.
   Envia para /api/t. Robôs e o próprio painel não contam. */
(function () {
  'use strict';
  if (navigator.webdriver || /bot|crawl|spider|lighthouse|headless|preview/i.test(navigator.userAgent)) return;
  if (location.pathname.indexOf('/painel') === 0) return;
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
  var left = false;
  var leave = function () { if (left || !ok()) return; left = true; var o = base('leave'); o.dur = Math.round((Date.now() - t0) / 1000); o.depth = depth; send(o); };
  addEventListener('pagehide', leave);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') leave(); });
})();
