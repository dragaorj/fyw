/* Hotwebinar · menu, painel interativo, carrosséis, planos anual/mensal, perguntas, vídeo e animações (GSAP) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = matchMedia('(min-width: 900px)');
  // botões: a luz branca segue o mouse
  document.addEventListener('pointermove', function (e) { var b = e.target.closest && e.target.closest('.btn, .mb-go'); if (!b) return; var r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true });


  // menu do celular
  var hd = $('.hd'), dr = $('.drawer'), bt = $('.hd-burger');
  function menu(open) { dr.hidden = !open; hd.classList.toggle('is-open', open); bt.setAttribute('aria-expanded', String(open)); document.documentElement.style.overflow = open ? 'hidden' : ''; }
  bt.addEventListener('click', function () { menu(dr.hidden); });
  $$('a', dr).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });

  // painel "Criar webinar": abas, tipo de vídeo, calendário, autoplay, confirmar e próximo
  var tabs = $$('.dash-tabs button');
  var panes = $$('.dpane');
  function setTab(t) {
    var k = tabs.indexOf(t);
    tabs.forEach(function (b) { var on = b === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
    panes.forEach(function (p) { p.classList.toggle('on', +p.dataset.t === k); });
  }
  tabs.forEach(function (b) { b.addEventListener('click', function () { setTab(b); }); });
  // cada grupo de opções escolhe só dentro dele
  $$('.dash-radios').forEach(function (g) {
    var rs = $$('button', g);
    rs.forEach(function (b) { b.addEventListener('click', function () { rs.forEach(function (r) { var on = r === b; r.classList.toggle('on', on); r.setAttribute('aria-checked', String(on)); }); }); });
  });
  $$('.dtgl').forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-checked', String(b.getAttribute('aria-checked') !== 'true')); }); });
  // pico de espectadores: barra arrastável (mouse, toque e setas do teclado), de 100 a 2.500
  $$('.drange').forEach(function (g) {
    var bar = $('i', g), out = $('b', g), MIN = 100, MAX = 2500, STEP = 50;
    bar.setAttribute('role', 'slider'); bar.setAttribute('tabindex', '0'); bar.setAttribute('aria-label', 'Pico de espectadores');
    bar.setAttribute('aria-valuemin', MIN); bar.setAttribute('aria-valuemax', MAX);
    function set(v) {
      v = Math.round(Math.min(MAX, Math.max(MIN, v)) / STEP) * STEP;
      bar.style.setProperty('--p', ((v - MIN) / (MAX - MIN)) * 100);
      out.textContent = v.toLocaleString('pt-BR'); bar.setAttribute('aria-valuenow', v);
      n = Math.round(v * 1.62);
      if (vw) vw.textContent = n.toLocaleString('pt-BR');
    }
    function at(x) { var r = bar.getBoundingClientRect(); set(MIN + ((x - r.left) / r.width) * (MAX - MIN)); }
    bar.addEventListener('pointerdown', function (e) { e.preventDefault(); bar.setPointerCapture(e.pointerId); g.classList.add('is-drag'); at(e.clientX); });
    bar.addEventListener('pointermove', function (e) { if (bar.hasPointerCapture(e.pointerId)) at(e.clientX); });
    bar.addEventListener('pointerup', function () { g.classList.remove('is-drag'); });
    bar.addEventListener('keydown', function (e) {
      var v = +bar.getAttribute('aria-valuenow'), d = { ArrowRight: STEP, ArrowUp: STEP, ArrowLeft: -STEP, ArrowDown: -STEP, PageUp: 500, PageDown: -500 }[e.key];
      if (e.key === 'Home') d = MIN - v; if (e.key === 'End') d = MAX - v;
      if (d) { e.preventDefault(); set(v + d); }
    });
    set(1500);
  });
  $$('.dchips span').forEach(function (c) { c.addEventListener('click', function () { c.classList.toggle('on'); }); });
  $$('.dab').forEach(function (g) { var ss = $$('span', g); ss.forEach(function (s) { s.addEventListener('click', function () { ss.forEach(function (o) { o.classList.toggle('on', o === s); }); }); }); });
  // calendário: escolhe o dia e o horário do webinar (dias passados ficam bloqueados)
  var sel = $('.dash-sel'), cal = $('.cal');
  if (sel && cal) {
    var MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    var SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    var vm0 = new Date(hoje.getFullYear(), hoje.getMonth(), 1), pick = null, hora = '20h00';
    var p2 = function (x) { return (x < 10 ? '0' : '') + x; };
    function draw() {
      var y = vm0.getFullYear(), m = vm0.getMonth(), first = new Date(y, m, 1).getDay(), dias = new Date(y, m + 1, 0).getDate(), h = '';
      for (var e = 0; e < first; e++) h += '<span></span>';
      for (var d = 1; d <= dias; d++) {
        var dt = new Date(y, m, d), cls = (+dt === +hoje ? 'today' : '') + (pick && +dt === +pick ? ' on' : '');
        h += '<button type="button" data-d="' + d + '"' + (dt < hoje ? ' disabled' : '') + (cls.trim() ? ' class="' + cls.trim() + '"' : '') + '>' + d + '</button>';
      }
      var atual = y === hoje.getFullYear() && m === hoje.getMonth();
      cal.innerHTML = '<div class="cal-h"><button type="button" class="cal-p" aria-label="Mês anterior"' + (atual ? ' disabled' : '') + '>‹</button><span>' + MES[m] + ' ' + y + '</span><button type="button" class="cal-n" aria-label="Próximo mês">›</button></div>' +
        '<div class="cal-w">' + SEM.map(function (s) { return '<span>' + s.charAt(0) + '</span>'; }).join('') + '</div><div class="cal-d">' + h + '</div>' +
        '<p class="cal-lb">Horário</p><div class="cal-t">' + ['19h00', '20h00', '21h00', '22h00'].map(function (t) { return '<button type="button"' + (t === hora ? ' class="on"' : '') + '>' + t + '</button>'; }).join('') + '</div>' +
        '<button type="button" class="cal-ok">' + (pick ? 'Agendar ' + p2(pick.getDate()) + '/' + p2(pick.getMonth() + 1) + ' às ' + hora : 'Escolha um dia') + '</button>';
    }
    function open(o) { cal.hidden = !o; sel.setAttribute('aria-expanded', String(o)); if (o) draw(); }
    sel.addEventListener('click', function (e) { e.stopPropagation(); open(cal.hidden); });
    cal.addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.classList.contains('cal-p')) vm0.setMonth(vm0.getMonth() - 1);
      else if (b.classList.contains('cal-n')) vm0.setMonth(vm0.getMonth() + 1);
      else if (b.dataset.d) pick = new Date(vm0.getFullYear(), vm0.getMonth(), +b.dataset.d);
      else if (b.parentNode.classList.contains('cal-t')) hora = b.textContent;
      else if (b.classList.contains('cal-ok')) {
        if (!pick) return;
        $('.sel-t', sel).textContent = SEM[pick.getDay()] + ', ' + p2(pick.getDate()) + '/' + p2(pick.getMonth() + 1) + ' · ' + hora;
        open(false); return;
      }
      draw();
    });
    document.addEventListener('click', function () { if (!cal.hidden) open(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cal.hidden) open(false); });
  }

  // cartões flutuantes do "Sobre nós": clique traz o de trás para a frente
  var tc = $('.tech-cards');
  // como embaralhar duas cartas: a da frente desliza para o lado (para longe da outra), passa por trás no ponto
  // mais afastado e volta ao lugar já atrás; a de trás avança um pouco e cresce até ficar na frente.
  // O movimento é somado (composite: add) ao transform/flutuação que os cartões já têm, então nada pula.
  var busy = false;
  if (tc) tc.addEventListener('click', function () {
    if (busy) return;
    var sw = tc.classList.contains('is-swap'), front = $(sw ? '.sk-offer' : '.sk-funnel', tc), back = $(sw ? '.sk-funnel' : '.sk-offer', tc);
    if (reduce || !front.animate) { tc.classList.toggle('is-swap'); return; }
    var fr = $('.sk-in', front).getBoundingClientRect(), br = $('.sk-in', back).getBoundingClientRect();
    var vx = (fr.left + fr.width / 2) - (br.left + br.width / 2), vy = (fr.top + fr.height / 2) - (br.top + br.height / 2), len = Math.hypot(vx, vy) || 1;
    // sai mais para o lado do que para baixo, para não encostar na seção de baixo
    var out = fr.width * .6, ox = (vx < 0 ? -1 : 1) * out, oy = (vy < 0 ? -1 : 1) * out * .14;
    var D = 950, E = 'cubic-bezier(.65,0,.35,1)';
    busy = true;
    front.animate([
      { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
      { transform: 'translate(' + ox + 'px, ' + oy + 'px) scale(.92) rotate(' + (ox < 0 ? -4 : 4) + 'deg)', offset: .45 },
      { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' }
    ], { duration: D, easing: E, composite: 'add' });
    back.animate([
      { transform: 'translate(0px, 0px) scale(1)' },
      { transform: 'translate(' + (-ox * .18) + 'px, ' + (-oy * .18) + 'px) scale(1.05)', offset: .45 },
      { transform: 'translate(0px, 0px) scale(1)' }
    ], { duration: D, easing: E, composite: 'add' });
    // troca quem está na frente no ponto em que os dois estão mais afastados
    setTimeout(function () { tc.classList.toggle('is-swap'); }, D * .45);
    setTimeout(function () { busy = false; }, D);
  });
  var auto = $('.dash-auto'); if (auto) auto.addEventListener('click', function () { auto.setAttribute('aria-checked', String(auto.getAttribute('aria-checked') !== 'true')); });
  var ok = $('.js-ok'); if (ok) ok.addEventListener('click', function () { ok.classList.add('is-done'); ok.textContent = 'Salvo'; setTimeout(function () { ok.classList.remove('is-done'); ok.textContent = 'Confirmar'; }, 1600); });
  var nx = $('.js-next'); if (nx) nx.addEventListener('click', function () { var i = tabs.findIndex(function (b) { return b.classList.contains('on'); }); setTab(tabs[(i + 1) % tabs.length]); });
  // perguntas do chat subindo por cima do vídeo do painel, uma atrás da outra
  var dvc = $('.dv-chat');
  if (dvc && !reduce) {
    var Q = [['Juliana', 'Isso funciona pra quem está começando agora?'], ['Pedro', 'Tem certificado no final?'], ['Camila', 'Dá pra parcelar no cartão?'],
      ['Rafael', 'Até quando vale essa condição?'], ['Lucas', 'Quanto tempo de acesso ao curso?'], ['Fernanda', 'Vocês têm suporte depois da compra?'],
      ['Bruno', 'Consigo assistir pelo celular?'], ['Mariana', 'O bônus ainda está valendo?']];
    var qi = 0, qt = 0, qon = false;
    var push = function () {
      var q = Q[qi++ % Q.length], m = document.createElement('p');
      m.className = 'dv-msg'; m.innerHTML = '<i>' + q[0].charAt(0) + '</i><span><b>' + q[0] + '</b>' + q[1] + '</span>';
      m.addEventListener('animationend', function () { m.remove(); });
      dvc.appendChild(m);
    };
    var qgo = function (on) { if (on === qon) return; qon = on; clearInterval(qt); if (on) { push(); qt = setInterval(push, 2700); } };
    if (window.self !== window.top || !('IntersectionObserver' in window)) qgo(true);
    else new IntersectionObserver(function (es) { qgo(es[0].isIntersecting); }, { threshold: .2 }).observe(dvc.parentNode);
  }

  // espectadores ao vivo mudando
  var vw = $('.viewers'), n = 2437;
  if (vw && !reduce) setInterval(function () { n += Math.round(Math.random() * 9 - 3); vw.textContent = n.toLocaleString('pt-BR'); }, 1800);

  // setas dos carrosséis
  $$('.tst-wrap, .plans-wrap').forEach(function (w) {
    var tr = $('.tst-track, .plans-track', w);
    function go(d) {
      if (wide.matches && tr.classList.contains('tst-track')) {
        if (d > 0) tr.appendChild(tr.firstElementChild); else tr.insertBefore(tr.lastElementChild, tr.firstElementChild);
        if (!reduce) tr.animate([{ opacity: .3, transform: 'translateX(' + (d * 30) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
        return;
      }
      var step = tr.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(tr).columnGap || 0);
      var max = tr.scrollWidth - tr.clientWidth, x = tr.scrollLeft + d * step;
      if (x > max + 2) x = 0; else if (x < -2) x = max;
      tr.scrollTo({ left: x, behavior: 'smooth' });
    }
    $$('.arw', w).forEach(function (a) { a.addEventListener('click', function () { go(a.classList.contains('next') ? 1 : -1); }); });
  });
  var pt = $('.plans-track'), top = $('.plan.is-top');
  if (pt && top && !wide.matches) requestAnimationFrame(function () { pt.scrollLeft = top.offsetLeft - pt.offsetLeft; });

  // planos: anual (à vista com 30% de desconto) ou mensal (preço cheio dividido em 12)
  $$('.pl-anual').forEach(function (b) {
    b.addEventListener('click', function () {
      var plan = b.closest('.plan'), on = b.getAttribute('aria-checked') !== 'true';
      b.setAttribute('aria-checked', String(on)); b.setAttribute('aria-label', on ? 'Cobrança anual' : 'Cobrança mensal');
      plan.classList.add('is-swap');
      setTimeout(function () {
        $$('[data-a]', plan).forEach(function (el) { el.innerHTML = on ? el.dataset.a : el.dataset.m; });
        plan.classList.remove('is-swap');
      }, 200);
    });
  });

  // perguntas: uma aberta por vez
  var qs = $$('.faq details');
  qs.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) qs.forEach(function (o) { if (o !== d) o.open = false; }); }); });

  // funcionalidades: cada item tem a sua tela; passam sozinhas, uma por uma (mouse ou toque escolhe e segura)
  // a barrinha do item ativo enche em 4,5 s e aí passa para o próximo
  var items = $$('.feat-list li'), scrs = $$('.feat-art .scr'), fl = $('.feat-list'), cur = 0, raf = 0, t0 = 0, DUR = 4500, run = false;
  function bar(i, p) { var b = $('.fbar b', items[i]); if (b) b.style.width = (p * 100) + '%'; }
  function showF(i) { bar(cur, 0); cur = i; items.forEach(function (x, k) { x.classList.toggle('on', k === i); }); scrs.forEach(function (s) { s.classList.toggle('on', +s.dataset.i === i); }); bar(i, 0); }
  function tick(now) {
    if (!t0) t0 = now;
    var p = Math.min((now - t0) / DUR, 1); bar(cur, p);
    if (p >= 1) { showF((cur + 1) % items.length); t0 = now; }
    raf = requestAnimationFrame(tick);
  }
  function loop() { if (run) return; run = true; t0 = 0; bar(cur, 0); raf = requestAnimationFrame(tick); }
  function stop() { run = false; cancelAnimationFrame(raf); }
  function hold(i) { stop(); fl.classList.add('is-hold'); showF(i); bar(i, 1); }
  items.forEach(function (li, i) { li.addEventListener('mouseenter', function () { hold(i); }); li.addEventListener('click', function () { hold(i); }); });
  fl.addEventListener('mouseleave', function () { fl.classList.remove('is-hold'); loop(); });
  if (window.self !== window.top || !('IntersectionObserver' in window)) loop(); else new IntersectionObserver(function (es) { if (es[0].isIntersecting) { if (!fl.classList.contains('is-hold')) loop(); } else stop(); }, { threshold: .3 }).observe(fl);

  // vídeo do botão "Assista o vídeo"
  var vm = $('#video'), vv = vm && $('video', vm);
  function vmOpen(open) { vm.hidden = !open; document.documentElement.style.overflow = open ? 'hidden' : ''; if (open) { vv.currentTime = 0; vv.play().catch(function () {}); } else vv.pause(); }
  $$('.js-play').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); vmOpen(true); }); });
  if (vm) { $('.vm-x', vm).addEventListener('click', function () { vmOpen(false); }); vm.addEventListener('click', function (e) { if (e.target === vm) vmOpen(false); }); }
  addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; if (vm && !vm.hidden) vmOpen(false); if (!dr.hidden) menu(false); });

  // ===== animações (GSAP + ScrollTrigger) =====
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power3.out';
  // topo
  var tl = gsap.timeline({ defaults: { ease: E } });
  tl.from('.hd > *', { autoAlpha: 0, duration: .8, stagger: .06 })
    .from('.hero .h-xl', { y: 60, autoAlpha: 0, duration: 1.1 }, .1)
    .from('.hero .sub', { y: 30, autoAlpha: 0, duration: .9 }, .35)
    .from('.hero-cta', { y: 20, autoAlpha: 0, scale: .92, duration: .8, clearProps: 'transform' }, .5);
  // painel da plataforma entra ao rolar
  gsap.from('.dash', { y: 80, autoAlpha: 0, scale: .96, duration: 1.2, ease: E, scrollTrigger: { trigger: '.dash', start: 'top 88%' } });
  gsap.from('.dash-tabs button', { y: 14, autoAlpha: 0, duration: .5, stagger: .05, ease: E, scrollTrigger: { trigger: '.dash', start: 'top 80%' } });
  // títulos e textos das seções aparecem ao rolar
  function reveal(sel, vars) {
    $$(sel).forEach(function (el) {
      gsap.from(el, Object.assign({ y: 50, autoAlpha: 0, duration: 1, ease: E, scrollTrigger: { trigger: el, start: 'top 88%' } }, vars || {}));
    });
  }
  reveal('.tech .h-lg, .tst > .h-lg, .feat .h-lg, .intg .h-lg, .plans > .h-lg, .faq > .h-lg');
  reveal('.tech .sub, .intg .sub', { y: 30, delay: .1 });
  reveal('.tech .btn, .intg-txt .btn', { y: 20, delay: .2, clearProps: 'transform' });
  // vídeo do apresentador entra com zoom suave
  gsap.from('.tech-bg video', { scale: 1.12, duration: 1.6, ease: E, scrollTrigger: { trigger: '.tech-bg', start: 'top 85%' } });
  // cartões flutuantes: entram e ficam flutuando
  // (os cartões e os painéis têm escala/inclinação próprias no CSS: as animações vão no contêiner deles)
  gsap.from('.tech-cards', { x: 120, autoAlpha: 0, duration: 1.2, ease: E, scrollTrigger: { trigger: '.tech-cards', start: 'top 85%' } });
  // barras do funil crescem
  gsap.from('.f-row i', { scaleX: 0, transformOrigin: '0 50%', duration: 1, ease: E, stagger: .1, scrollTrigger: { trigger: '.tech-cards', start: 'top 80%' } });
  // depoimentos, logos, integrações, planos e perguntas em cascata
  gsap.from('.tcard', { y: 60, autoAlpha: 0, duration: .9, ease: E, stagger: .12, clearProps: 'transform', scrollTrigger: { trigger: '.tst-track', start: 'top 88%' } });
  gsap.from('.tst .arw', { autoAlpha: 0, duration: .8, scrollTrigger: { trigger: '.tst-track', start: 'top 88%' } });
  gsap.from('.logos', { autoAlpha: 0, y: 30, duration: 1, ease: E, scrollTrigger: { trigger: '.logos', start: 'top 92%' } });
  gsap.from('.feat-list li', { x: -30, autoAlpha: 0, duration: .6, ease: E, stagger: .05, clearProps: 'transform', scrollTrigger: { trigger: '.feat-list', start: 'top 85%' } });
  gsap.from('.feat-art', { y: 90, autoAlpha: 0, duration: 1.2, ease: E, scrollTrigger: { trigger: '.feat-list', start: 'top 85%' } });
  gsap.from('.pill', { scale: .8, autoAlpha: 0, duration: .6, ease: 'back.out(1.6)', stagger: { each: .05, from: 'random' }, clearProps: 'transform', scrollTrigger: { trigger: '.intg-grid', start: 'top 88%' } });
  gsap.from('.plan', { y: 70, autoAlpha: 0, duration: .9, ease: E, stagger: .1, clearProps: 'transform', scrollTrigger: { trigger: '.plans-track', start: 'top 88%' } });
  gsap.from('.incl', { y: 40, autoAlpha: 0, duration: .9, ease: E, scrollTrigger: { trigger: '.incl', start: 'top 92%' } });
  gsap.from('.faq details', { y: 30, autoAlpha: 0, duration: .7, ease: E, stagger: .08, scrollTrigger: { trigger: '.faq-list', start: 'top 88%' } });
  gsap.from('.ft > *', { y: 30, autoAlpha: 0, duration: .8, ease: E, stagger: .08, scrollTrigger: { trigger: '.ft', start: 'top 92%' } });
  // profundidade ao rolar: painéis e imagens de fundo em velocidades diferentes
  if (wide.matches) {
    gsap.to(['.bgt-hero', '.ext-ring-t'], { y: 140, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: '+=1200', scrub: true } });
  }
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
