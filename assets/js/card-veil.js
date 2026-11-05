/* Cards do topo (home): quando o mouse para em cima de um card, a foto escurece e o logo do cliente aparece na frente.
   Logos vêm do mural de clientes (versão de uma cor); projetos sem logo mostram o nome. */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var P = window.FYW_PROJECTS || {};
  function logoFor(slug) {
    var cell = '.lw-inner[href="projetos/' + slug + '.html"] ';
    var m = document.querySelector(cell + '.lw-mark.is-color') || document.querySelector(cell + '.lw-mark');
    if (m) { var s = m.cloneNode(true); s.removeAttribute('role'); s.removeAttribute('aria-label'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'veil-logo'); s.querySelectorAll('[fill="#242424"]').forEach(function (p) { p.setAttribute('fill', '#fff'); }); s.querySelectorAll('[id]').forEach(function (x) { var o = x.id, n = o + '-veil'; x.id = n; s.querySelectorAll('[mask],[clip-path],[fill],[filter]').forEach(function (y) { ['mask', 'clip-path', 'fill', 'filter'].forEach(function (at) { var v = y.getAttribute(at); if (v && v.indexOf('#' + o + ')') > -1) y.setAttribute(at, v.replace('#' + o + ')', '#' + n + ')')); }); }); }); return s; }
    var b = document.createElement('b'); b.className = 'veil-name'; b.textContent = (P[slug] && P[slug].name) || slug; return b;
  }
  document.querySelectorAll('.hf-card').forEach(function (card) {
    var inn = card.querySelector('.fc-in'); if (!inn || inn.querySelector('.fc-veil')) return;
    var v = document.createElement('span'); v.className = 'fc-veil'; v.setAttribute('aria-hidden', 'true');
    v.appendChild(logoFor(card.getAttribute('data-project'))); inn.appendChild(v);
    var t = 0, lx = -1, ly = -1;
    card.addEventListener('pointermove', function (e) {
      if (Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly) < 3) return;
      lx = e.clientX; ly = e.clientY; clearTimeout(t);
      if (!card.classList.contains('is-rest')) t = setTimeout(function () { card.classList.add('is-rest'); }, 320);
    });
    card.addEventListener('pointerleave', function () { clearTimeout(t); card.classList.remove('is-rest'); lx = ly = -1; });
  });
})();
