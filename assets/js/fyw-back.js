/* Botão "Voltar para a Fyw" nos sites ao vivo (só quando a página está aberta sozinha, nunca dentro das telinhas da página do projeto).
   Pílula de vidro escuro com a logo da Fyw; ao rolar para baixo encolhe e mostra só a seta + logo, ao subir volta inteira. */
// Idioma da pessoa = o idioma do site da Fyw (fio-lang); sem escolha salva, o do navegador; idioma que a Fyw não tem = inglês.
// Quando a pessoa troca o idioma dentro de um site de projeto, isso vale também para a Fyw (e para os outros projetos).
(function () {
  var OK = { pt: 1, en: 1, es: 1 };
  window.fywLang = function () {
    try { var s = localStorage.getItem('fio-lang'); if (OK[s]) return s; } catch (e) {}
    var n = (navigator.language || 'en').slice(0, 2).toLowerCase(); return OK[n] ? n : 'en';
  };
  if (window.top !== window.self) return;
  var userT = 0; ['pointerdown', 'keydown'].forEach(function (t) { addEventListener(t, function () { userT = Date.now(); }, true); });
  var save = function (l) { l = (l || '').slice(0, 2).toLowerCase(); if (!OK[l]) return; try { localStorage.setItem('fio-lang', l); } catch (e) {} dispatchEvent(new Event('fyw:lang')); };
  // troca feita pela pessoa (clique no seletor de idioma do site) muda a preferência
  new MutationObserver(function () { if (Date.now() - userT < 2000) save(document.documentElement.lang); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  // sites com uma pasta por idioma (/pt/, /en/, /es/): chegar numa delas por um link de dentro do próprio site conta como escolha
  var pm = location.pathname.match(/^(.*\/)(pt|en|es)\//); if (pm && document.referrer.indexOf(location.origin + pm[1]) === 0) save(pm[2]);
})();
// Assinatura no fim de cada página dos sites de projeto: "Website / Design system / Brand desenvolvido por Marlon Dias" (LinkedIn)
(function () {
  if (document.querySelector('a[href*="linkedin.com/in/marlonwebdesigner"]')) return;
  var slug = (location.pathname.match(/\/projetos\/([^\/]+)\//) || [])[1] || '';
  // tipo de trabalho de cada projeto: [pt, en, es]
  var K = {
    'beta-online': ['Design system e website desenvolvidos por', 'Design system and website developed by', 'Design system y sitio web desarrollados por'],
    'kyoto': ['Brand e website desenvolvidos por', 'Brand and website developed by', 'Marca y sitio web desarrollados por']
  }[slug] || ['Website desenvolvido por', 'Website developed by', 'Sitio web desarrollado por'];
  var css = '.fyw-credit{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:0 .35em;padding:18px 20px calc(18px + env(safe-area-inset-bottom));font:400 13px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.005em;text-align:center;background:var(--fc-bg,transparent);color:var(--fc-fg,inherit)}' +
    '.fyw-credit span{opacity:.68}' +
    '.fyw-credit a{color:inherit;font-weight:700;text-decoration:none;background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .35s cubic-bezier(.2,.8,.2,1)}' +
    '.fyw-credit a:hover{background-size:100% 1px}' +
    '@media (max-width:600px){.fyw-credit{padding-bottom:calc(76px + env(safe-area-inset-bottom))}}';
  var lang = function () { var l = window.fywLang(); return l === 'en' ? 1 : l === 'es' ? 2 : 0; };
  function add() {
    if (document.querySelector('.fyw-credit')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var d = document.createElement('div'); d.className = 'fyw-credit';
    d.innerHTML = '<span></span><a href="https://www.linkedin.com/in/marlonwebdesigner/" target="_blank" rel="noopener">Marlon Dias</a>';
    var paint = function () { d.firstChild.textContent = K[lang()]; };
    paint(); addEventListener('fyw:lang', paint); addEventListener('storage', function (e) { if (e.key === 'fio-lang') paint(); });
    // fica depois do rodapé do site, com as mesmas cores dele (sem rodapé: cor do fundo da página)
    var fs = [].filter.call(document.querySelectorAll('footer'), function (x) { return getComputedStyle(x).position !== 'fixed' && x.offsetHeight > 0; }), f = fs[fs.length - 1];
    var bg = function (e) { var c = getComputedStyle(e).backgroundColor; return c === 'rgba(0, 0, 0, 0)' ? '' : c; };
    // cor de fundo real do rodapé (sobe pelos pais até achar uma); sem rodapé, fundo da página
    var eff = function (e) { while (e && e.nodeType === 1) { var c = bg(e); if (c) return c; e = e.parentElement; } return ''; };
    var gradBody = !f && getComputedStyle(document.body).backgroundImage !== 'none';
    var cb = gradBody ? '' : (eff(f || document.body) || '#FFFFFF');
    // texto sempre legível: claro em fundo escuro, escuro em fundo claro
    var lum = function (c) { var m = (c || '').match(/[\d.]+/g); if (!m) return 1; return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255; };
    var fg = gradBody ? getComputedStyle(document.body).color : (lum(cb) < .5 ? '#FFFFFF' : '#0B0B0B');
    d.style.setProperty('--fc-bg', cb || 'transparent'); d.style.setProperty('--fc-fg', fg);
    document.body.appendChild(d);
  }
  if (document.readyState === 'complete') add(); else addEventListener('load', add);
})();
(function () {
  if (window.top !== window.self) return;
  var m = location.pathname.match(/\/projetos\/([^\/]+)\//);
  var href = m ? '/projetos/' + m[1] + '.html' : '/';
  var TT = { pt: ['Voltar para', 'Voltar para o site da Fyw'], en: ['Back to', 'Back to the Fyw website'], es: ['Volver a', 'Volver al sitio de Fyw'] }, T = TT[window.fywLang()];
  var E = 'cubic-bezier(.2,.8,.2,1)';
  var css = '.fyw-back{position:fixed;left:max(16px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));z-index:2147483000;display:inline-flex;align-items:center;height:50px;padding:5px 18px 5px 5px;border-radius:99px;background:rgba(11,11,11,.78);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);color:#EEEDE9;font:500 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.01em;text-decoration:none;white-space:nowrap;box-shadow:0 18px 40px -16px rgba(0,0,0,.6),inset 0 0 0 1px rgba(238,237,233,.12),inset 0 1px 0 rgba(238,237,233,.1);opacity:0;transform:translateY(20px) scale(.92);transition:opacity .5s,transform .6s ' + E + ',padding .45s ' + E + ',background .3s,box-shadow .3s;-webkit-tap-highlight-color:transparent}' +
    '.fyw-back.in{opacity:1;transform:none}' +
    '.fyw-back:hover{background:#0B0B0B;box-shadow:0 22px 44px -16px rgba(0,0,0,.7),inset 0 0 0 1px rgba(238,237,233,.22)}' +
    '.fyw-back:focus-visible{outline:2px solid #EEEDE9;outline-offset:3px}' +
    '.fyw-back .fb-a{position:relative;flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:#EEEDE9;color:#0B0B0B;overflow:hidden;transition:transform .45s ' + E + '}' +
    '.fyw-back .fb-a svg{width:17px;height:17px;grid-area:1/1;transition:transform .5s ' + E + '}' +
    '.fyw-back .fb-a svg+svg{transform:translateX(150%)}' +
    '.fyw-back:hover .fb-a svg{transform:translateX(-150%)}' +
    '.fyw-back:hover .fb-a svg+svg{transform:none}' +
    '.fyw-back:active .fb-a{transform:scale(.9)}' +
    '.fyw-back .fb-t{display:inline-block;max-width:120px;overflow:hidden;margin-left:12px;opacity:.72;transition:max-width .45s ' + E + ',margin .45s ' + E + ',opacity .3s}' +
    '.fyw-back .fb-l{display:block;width:34px;height:auto;margin-left:6px;transition:margin .45s ' + E + '}' +
    '.fyw-back.mini{padding-right:16px}' +
    '.fyw-back.mini:not(:hover) .fb-t{max-width:0;margin-left:6px;opacity:0}' +
    '@media (max-width:600px){.fyw-back{height:46px;padding-right:15px}.fyw-back .fb-a{width:36px;height:36px}.fyw-back .fb-t{display:none}.fyw-back .fb-l{margin-left:10px;width:32px}}' +
    '@media (prefers-reduced-motion:reduce){.fyw-back,.fyw-back *{transition:none!important}}' +
    '@media print{.fyw-back{display:none}}';
  var ARW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 5.5 4.5 12 11 18.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var LOGO = '<svg class="fb-l" viewBox="0 0 804 513" aria-hidden="true"><path d="M167.766 0C181.085 1.91695e-05 193.839 1.00516 206.027 3.01562C206.198 3.04375 206.368 3.07158 206.537 3.09961C220.661 5.43922 228.408 19.8275 223.516 33.2822L209.876 70.793C207.405 77.5889 200.003 81.2363 192.833 80.293C188.058 79.5391 183.723 79.1621 179.828 79.1621C170.153 79.1621 163.241 81.2352 159.095 85.3818C155.074 89.5284 152.435 94.995 151.179 101.78L149.037 114.597H210.108C223.005 114.597 233.69 124.603 234.537 137.472L246.111 313.392C246.176 314.376 246.993 315.141 247.979 315.141C248.742 315.141 249.429 314.678 249.715 313.971L324.103 129.905C327.842 120.653 336.822 114.597 346.801 114.597H441.707C455.024 114.597 465.899 125.242 466.184 138.556L469.413 289.691C469.429 290.427 470.03 291.015 470.766 291.016C471.329 291.016 471.835 290.666 472.033 290.139L532.082 130.461C535.671 120.917 544.8 114.597 554.997 114.597H615.826C628.855 114.597 639.602 124.802 640.275 137.813L648.055 288.215C648.092 288.939 648.691 289.508 649.416 289.508C649.995 289.508 650.511 289.141 650.702 288.594L705.722 131.009C709.153 121.18 718.425 114.597 728.835 114.597H778.771C796.24 114.597 808.088 132.368 801.369 148.494L701.143 389.039C697.341 398.162 688.427 404.104 678.544 404.104H604.75C592.145 404.104 581.601 394.534 580.383 381.988L567.62 250.533C567.524 249.548 566.696 248.796 565.706 248.796C564.936 248.796 564.239 249.256 563.937 249.964L504.44 389.24C500.589 398.256 491.73 404.104 481.927 404.104H408.282C395.55 404.104 384.942 394.344 383.885 381.655L373.26 254.16L285.808 428.229C277.766 444.188 267.713 458.513 255.65 471.204C243.713 484.021 229.012 494.135 211.546 501.549C194.08 508.962 173.221 512.67 148.97 512.67C136.907 512.67 125.661 511.728 115.231 509.843C114.447 509.711 113.671 509.574 112.901 509.434C99.0337 506.908 93.0004 491.746 99.043 479.011L113.313 448.936C118.767 437.442 132.057 432.648 144.661 434.378C144.841 434.403 145.021 434.427 145.2 434.45C152.111 435.33 158.206 434.827 163.483 432.942C168.761 431.058 173.096 427.476 176.488 422.198C178.671 418.803 179.504 414.715 178.824 410.736L141.115 189.989H136.44L104.082 383.657C102.11 395.457 91.8992 404.104 79.9355 404.104H25.5361C10.4039 404.104 -1.10515 390.513 1.38867 375.588L32.4004 189.989H24.4883C9.32791 189.989 -2.18827 176.35 0.352539 161.404L4.8457 134.976C6.8464 123.207 17.0438 114.597 28.9814 114.597H44.9971L46.3828 106.304C50.2781 82.4294 57.7549 62.6384 68.8125 46.9316C79.9957 31.225 94.0061 19.4761 110.844 11.6855C127.807 3.89499 146.781 0 167.766 0Z" fill="currentColor"/></svg>';
  function add() {
    if (document.querySelector('.fyw-back')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var a = document.createElement('a'); a.className = 'fyw-back'; a.href = href; a.setAttribute('aria-label', T[1]);
    a.innerHTML = '<span class="fb-a">' + ARW + ARW + '</span><span class="fb-t">' + T[0] + '</span>' + LOGO;
    document.body.appendChild(a);
    setTimeout(function () { a.classList.add('in'); }, 500);
    var repaint = function () { T = TT[window.fywLang()]; a.setAttribute('aria-label', T[1]); a.querySelector('.fb-t').textContent = T[0]; };
    addEventListener('fyw:lang', repaint); addEventListener('storage', function (e) { if (e.key === 'fio-lang') repaint(); });
    // rolando para baixo: encolhe; para cima: abre de novo
    var lastY = scrollY, raf = 0;
    addEventListener('scroll', function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; var y = scrollY; if (Math.abs(y - lastY) < 6) return; a.classList.toggle('mini', y > lastY && y > 160); lastY = y; }); }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
