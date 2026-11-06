/* Tradução das páginas internas (projetos, lista de projetos, privacidade) para EN/ES.
   Segue o idioma salvo (fio-lang) e a troca no menu. Não mexe nas landings/sites embutidos (iframes)
   nem no design system do cliente (.bds). Os textos vêm de window.FYW_PAGE_I18N = { "texto em pt": ["en", "es"] }. */
(function () {
  var SKIP = 'script,style,svg,iframe,noscript,template,.bds,[data-i18n],[data-i18n-html],[data-no-tr],.lang';
  var INLINE = { B: 1, STRONG: 1, EM: 1, I: 1, BR: 1, SPAN: 1, A: 1, SMALL: 1, SUP: 1, SUB: 1, S: 1, U: 1 };
  var ATTRS = ['alt', 'aria-label', 'title', 'placeholder'];
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  function onlyInline(el) {
    var all = el.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) if (!INLINE[all[i].tagName]) return false;
    return true;
  }
  function ownText(el) { for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return true; return false; }
  // blocos de texto: o elemento mais externo cujo conteúdo é só texto + tags inline
  function blocks(root) {
    var out = [], els = root.querySelectorAll('body *');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest(SKIP)) continue;
      if (!ownText(el) && !(el.children.length && onlyInline(el) && norm(el.textContent))) continue;
      if (!onlyInline(el)) continue;
      if (el.querySelector('[data-i18n],[data-i18n-html],[data-i18n-aria]')) continue;
      var p = el.parentElement, inside = false;
      while (p && p.tagName !== 'BODY') { if (p.__trBlock) { inside = true; break; } p = p.parentElement; }
      if (inside) continue;
      el.__trBlock = true; out.push(el);
    }
    return out;
  }
  window.__fywTrBlocks = blocks;
  window.__fywTrNorm = norm;
  window.__fywTrSkip = SKIP;

  var DICT = window.FYW_PAGE_I18N; if (!DICT) return;
  var PAT = window.FYW_PAGE_I18N_P || [], WORDS = window.FYW_PAGE_I18N_W || {};
  // tradução de um texto: dicionário, palavras curtas ou padrões
  var cache = {};
  function tr(s) {
    if (s in cache) return cache[s];
    var r = DICT[s] || WORDS[s] || null;
    if (!r) for (var i = 0; i < PAT.length; i++) { var m = s.match(PAT[i][0]); if (m) { var en = PAT[i][1](m, 0), es = PAT[i][1](m, 1); if (en && es) { r = [en, es]; break; } } }
    return (cache[s] = r);
  }
  var items = null, attrs = null, title0 = document.title;
  function collect() {
    items = blocks(document).map(function (el) { var key = norm(el.innerHTML); return { el: el, pt: el.innerHTML, tr: tr(key) }; }).filter(function (o) { return o.tr; });
    // textos soltos (ex.: ao lado de bandeiras/ícones)
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { var v = norm(n.nodeValue); if (!v || !/[A-Za-zÀ-ú]{2}/.test(v)) continue; var pe = n.parentElement; if (!pe || pe.closest(SKIP)) continue; var inBlock = false; for (var q = pe; q && q !== document.body; q = q.parentElement) if (q.__trBlock) { inBlock = true; break; } if (inBlock) continue; var t = tr(v); if (t) items.push({ text: n, pt: n.nodeValue, tr: [n.nodeValue.replace(v, t[0]), n.nodeValue.replace(v, t[1])] }); }
    attrs = [];
    document.querySelectorAll('[alt],[aria-label],[title],[placeholder]').forEach(function (el) {
      if (el.closest(SKIP)) return;
      ATTRS.forEach(function (a) { var v = el.getAttribute(a); var t = v && tr(norm(v)); if (t) attrs.push({ el: el, a: a, pt: v, tr: t }); });
    });
  }
  function getLang() { try { var s = localStorage.getItem('fio-lang'); if (s === 'en' || s === 'es' || s === 'pt') return s; } catch (e) {} var n = (navigator.language || 'pt').slice(0, 2); return n === 'pt' || n === 'es' ? n : 'en'; }
  var cur = 'pt';
  function apply(l) {
    if (!items) collect();
    var k = l === 'en' ? 0 : l === 'es' ? 1 : -1;
    items.forEach(function (o) { var val = k < 0 ? o.pt : o.tr[k]; if (o.text) o.text.nodeValue = val; else o.el.innerHTML = val; });
    attrs.forEach(function (o) { o.el.setAttribute(o.a, k < 0 ? o.pt : o.tr[k]); });
    var t = tr(norm(title0)); document.title = k < 0 || !t ? title0 : t[k];
    var md = document.querySelector('meta[name="description"]');
    if (md) { if (!md.__pt) md.__pt = md.content; var dv = tr(norm(md.__pt)); md.content = k < 0 || !dv ? md.__pt : dv[k]; }
    document.documentElement.lang = l === 'pt' ? 'pt-BR' : l;
    cur = l;
    dispatchEvent(new Event('resize'));
  }
  function sync() { var l = getLang(); if (l !== cur) apply(l); }
  document.addEventListener('click', function (e) { if (e.target.closest('.lang button')) setTimeout(sync, 0); });
  addEventListener('storage', function (e) { if (e.key === 'fio-lang') sync(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
})();
