/* Seletor de serviços no topo das páginas de projeto (ex.: Design System · Web Design).
   Cada seção ou imagem marcada com data-svc="chave1 chave2" só aparece quando um dos seus serviços está selecionado;
   o que não tem data-svc aparece sempre. A escolha fica no endereço (#web, #branding…). */
(function () {
  // design system resumido: botão abre e fecha
  var bm = document.querySelector('.bds-more'), bx = document.getElementById('bdsBox');
  if (bm && bx) bm.addEventListener('click', function () {
    var open = bx.classList.contains('is-collapsed');
    if (open) { bx.style.maxHeight = bx.scrollHeight + 'px'; bx.classList.remove('is-collapsed'); setTimeout(function () { bx.style.maxHeight = 'none'; }, 850); }
    else { bx.style.maxHeight = ''; bx.classList.add('is-collapsed'); bx.scrollIntoView({ block: 'start' }); }
    bm.setAttribute('aria-expanded', open); bm.querySelector('span').textContent = open ? 'Recolher o design system' : 'Ver o design system completo';
  });
  var sw = document.querySelector('.pp2-svc'); if (!sw) return;
  var btns = Array.prototype.slice.call(sw.querySelectorAll('.pp2-svc-b'));
  var ind = document.createElement('span'); ind.className = 'pp2-svc-ind'; ind.setAttribute('aria-hidden', 'true'); sw.insertBefore(ind, sw.firstChild);
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function place(b) { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = 'translateX(' + (b.offsetLeft - 4) + 'px)'; }

  function apply(key, first) {
    var b = btns.filter(function (x) { return x.dataset.svc === key; })[0] || btns[0]; key = b.dataset.svc;
    btns.forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; });
    place(b);
    document.documentElement.setAttribute('data-svc', key);
    document.querySelectorAll('[data-svc]:not(.pp2-svc-b)').forEach(function (el) {
      if (el === document.documentElement) return;
      var show = (' ' + el.getAttribute('data-svc') + ' ').indexOf(' ' + key + ' ') > -1;
      var was = !el.hidden; el.hidden = !show;
      if (show && !was && !first && !reduce) { el.classList.remove('svc-in'); void el.offsetWidth; el.classList.add('svc-in'); }
    });
    // galeria: some se sobrar menos de 2 imagens para este serviço
    var gs = document.querySelector('.pp2-gal-sec');
    if (gs) { var vis = gs.querySelectorAll('.pp2-slide:not([aria-hidden="true"]):not([hidden])').length; var own = gs.hasAttribute('data-svc') ? (' ' + gs.getAttribute('data-svc') + ' ').indexOf(' ' + key + ' ') < 0 : false; gs.hidden = own || vis < 2; var g = gs.querySelector('.pp2-gal'); if (g) g.scrollLeft = 0; }
    if (!first && history.replaceState) history.replaceState(null, '', '#' + key);
    dispatchEvent(new Event('resize'));
  }

  sw.addEventListener('click', function (e) { var b = e.target.closest('.pp2-svc-b'); if (b) apply(b.dataset.svc); });
  sw.addEventListener('keydown', function (e) {
    var i = btns.indexOf(document.activeElement); if (i < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length]; n.focus(); apply(n.dataset.svc); }
  });
  addEventListener('resize', function () { var on = sw.querySelector('.is-on'); if (on) place(on); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { var on = sw.querySelector('.is-on'); if (on) place(on); }).observe(sw);
  setTimeout(function () { var on = sw.querySelector('.is-on'); if (on) place(on); }, 600);
  var start = (location.hash || '').slice(1);
  apply(btns.some(function (b) { return b.dataset.svc === start; }) ? start : btns[0].dataset.svc, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { var on = sw.querySelector('.is-on'); if (on) place(on); });
})();
