/* Botão "Voltar para a Fyw" nos sites ao vivo (só quando a página está aberta sozinha, nunca dentro das telinhas da página do projeto) */
(function () {
  if (window.top !== window.self) return;
  var m = location.pathname.match(/\/projetos\/([^\/]+)\//);
  var href = m ? '/projetos/' + m[1] + '.html' : '/';
  var css = '.fyw-back{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:inline-flex;align-items:center;gap:10px;height:46px;padding:0 18px 0 7px;border-radius:99px;background:#0B0B0B;color:#EEEDE9;font:600 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.01em;text-decoration:none;white-space:nowrap;box-shadow:0 12px 30px -12px rgba(0,0,0,.55),inset 0 0 0 1px rgba(238,237,233,.14);transition:transform .35s cubic-bezier(.2,.8,.2,1),background .3s}' +
    '.fyw-back:hover{transform:translateY(-2px);background:#1a1a1a}' +
    '.fyw-back i{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#EEEDE9;color:#0B0B0B;transition:transform .35s cubic-bezier(.2,.8,.2,1)}' +
    '.fyw-back:hover i{transform:translateX(-2px)}' +
    '.fyw-back svg{width:16px;height:16px}' +
    '@media print{.fyw-back{display:none}}';
  function add() {
    if (document.querySelector('.fyw-back')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var a = document.createElement('a'); a.className = 'fyw-back'; a.href = href; a.setAttribute('aria-label', 'Voltar para o site da Fyw');
    a.innerHTML = '<i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 5.5 4.5 12 11 18.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></i><span>Voltar para a Fyw</span>';
    document.body.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
