/* Fyw — "Feito para impressionar. Pensado para vender."
   1) ao rolar, a frase dá zoom no ponto final até a tela virar a cor da letra;
   2) dentro dela, os trabalhos giram em volta do centro como uma galáxia 3D, enquanto a frase do meio troca
      a palavra conforme a rolagem ("Criamos para quem cuida de sorrisos / move torcidas / …");
   3) na saída, a bolinha fecha num ponto e a frase agora é outra. A página nunca trava. */
(function () {
  'use strict';
  var sec = document.querySelector('.zoom-stack'); if (!sec) return;
  var stage = sec.querySelector('.zs-stage'), title = sec.querySelector('.zoom-intro-title:not(.zs-outro)'), outro = sec.querySelector('.zs-outro'), fill = sec.querySelector('.zi-fill');
  var cosmos = sec.querySelector('.zs-cosmos'), orbs = [].slice.call(sec.querySelectorAll('.zs-o')), word = sec.querySelector('.zs-say-w');
  var lang = function () { var l = (document.documentElement.lang || 'pt').slice(0, 2); return l === 'en' || l === 'es' ? l : 'pt'; };
  // tipos de cliente reais da Fyw (Lumière, SPFC, Latimpacto/Impacta, Kyoto, Beta, Cimed, Pacto Global)
  var WORDS = {
    pt: ['cuida de sorrisos.', 'move torcidas.', 'reúne multidões.', 'leva sabor à mesa.', 'ensina profissões.', 'cuida da saúde.', 'cuida do planeta.', 'cuida da sua empresa.', /* OCULTO let-me-be: 'empodera a beleza.', */ 'leva comida até você.'],
    en: ['cares for smiles.', 'moves crowds of fans.', 'brings people together.', 'brings flavor to the table.', 'teaches careers.', 'takes care of health.', 'takes care of the planet.', 'takes care of your company.', /* OCULTO let-me-be: 'empowers beauty.', */ 'brings food to your door.'],
    es: ['cuida sonrisas.', 'mueve hinchadas.', 'reúne multitudes.', 'lleva sabor a la mesa.', 'enseña profesiones.', 'cuida la salud.', 'cuida el planeta.', 'cuida tu empresa.', /* OCULTO let-me-be: 'empodera la belleza.', */ 'lleva comida hasta ti.']
  };
  var dotPoint = function (el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, last = null; while ((n = w.nextNode())) if (n.data.trim()) last = n;
    if (!last) return null; var i = last.data.lastIndexOf('.'); if (i < 0) return null;
    var r = document.createRange(); r.setStart(last, i); r.setEnd(last, i + 1); var b = r.getBoundingClientRect(), t = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { tx: b.left + b.width / 2 - t.left, ty: b.top + b.height * .72 - t.top, sx: b.left + b.width / 2 - s.left, sy: b.top + b.height * .72 - s.top };
  };

  // ---- galáxia: cada imagem numa órbita elíptica inclinada; a profundidade muda tamanho, nitidez e ordem ----
  // giro sozinho: parado na galáxia, ela passa de um cliente para o outro; rolar a página volta a mandar
  var gObj = { v: 0 }, gOn = false;
  var gate = function (on) { if (on === gOn) return; gOn = on; gsap.to(gObj, { v: on ? 1 : 0, duration: on ? 1.1 : .45, ease: on ? 'power2.out' : 'power2.in', overwrite: true, onUpdate: function () { gather = gObj.v; if (gather < .02) measureDot(); renderOrbit(); } }); };
  var pendW = null, autoX = 0, baseU = 0, baseK = 0, lastScrollT = 0, lastStepT = 0, inGalaxy = false;
  var N = orbs.length, spin = 0, scrollSpin = Math.PI / 2, spinT = Math.PI / 2, spread = 0, gather = 0, live = false;
  // posição do giro automático (com a mesma curva usada em todo lugar: a rolagem e o giro sozinho nunca discordam, então nada anda para trás)
  // giro contínuo e uniforme: as bolinhas não param na frente, só passam (a logo vai aparecendo conforme chegam)
  var autoPos = function (x) { return x; };
  // logo branca de cada cliente na frente da foto (copiada do mural de clientes), sobre uma película escura
  var LOGOS = ['lumiere', 'jogo-pela-integridade', 'latimpacto', 'kyoto', 'beta-online', 'cimed', 'pacto-global', 'globalfy', /* OCULTO let-me-be: 'let-me-be', */ 'ifood'];
  // cópia da logo com ids únicos (máscaras/gradientes), senão a logo original e a cópia brigam
  var cloneMark = function (a, suf) {
    var c = a.cloneNode(true); c.removeAttribute('role'); c.setAttribute('aria-hidden', 'true');
    [].forEach.call(c.querySelectorAll('[id]'), function (e) {
      var old = e.id, neu = old + suf; e.id = neu;
      [].forEach.call(c.querySelectorAll('*'), function (n) { [].forEach.call(n.attributes, function (at) {
        if (at.value === '#' + old) n.setAttribute(at.name, '#' + neu);
        else if (at.value.indexOf('#' + old + ')') > -1) n.setAttribute(at.name, at.value.split('#' + old + ')').join('#' + neu + ')'));
      }); });
    });
    return c;
  };
  orbs.forEach(function (o, i) {
    var cell = document.querySelector('.lw-inner[href="projetos/' + LOGOS[i] + '.html"]'), a = cell && cell.querySelector('.lw-mark:not(.is-color)'); if (!a) return;
    var w = document.createElement('span'); w.className = 'zs-lg zs-lg-' + LOGOS[i];
    w.appendChild(cloneMark(a, '-zs' + i));
    // versão colorida (aparece ao passar o mouse); sem versão colorida, a logo pega a cor da marca
    var col = cell.querySelector('.lw-mark.is-color'), li = cell.closest('.lw-cell');
    if (LOGOS[i] !== 'jogo-pela-integridade' && LOGOS[i] !== 'pacto-global' && LOGOS[i] !== 'beta-online') col = null; // as outras versões coloridas têm partes brancas: usa a logo na cor da marca
    if (col) { var cc = cloneMark(col, '-zc' + i); cc.classList.add('zs-lg-col'); w.appendChild(cc); } else w.classList.add('no-col');
    if (li && li.style.getPropertyValue('--brand')) o.style.setProperty('--brand', li.style.getPropertyValue('--brand'));
    o.appendChild(w);
  });
  orbs.forEach(function (o, i) { o.addEventListener('click', function () { if (performance.now() < noClickUntil) return; if (LOGOS[i]) location.href = 'projetos/' + LOGOS[i] + '.html'; }); });
  // arrastar na horizontal (dedo ou mouse) gira as bolinhas; ao soltar, elas continuam com o embalo e voltam ao giro sozinho
  (function () {
    var d = null, perOrb = function () { return Math.max(60, lastRX * 2 * Math.PI / N); };
    stage.addEventListener('pointerdown', function (e) { if (!live || gather < .9 || e.button > 0) return; d = { x: e.clientX, y: e.clientY, t: performance.now(), on: false }; });
    addEventListener('pointermove', function (e) {
      if (!d) return; var dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.on) { if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) { d.on = true; dragging = true; orbHover = false; d.x = e.clientX; d.t = performance.now(); } else if (Math.abs(dy) > 12) d = null; return; }
      var now = performance.now(), du = dx / perOrb(); autoX += du; vel = du / Math.max(8, now - d.t); d.x = e.clientX; d.t = now;
    }, { passive: true });
    var end = function () { if (d && d.on) noClickUntil = performance.now() + 350; d = null; dragging = false; vel = Math.max(-.004, Math.min(.004, vel)); };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
  })();
  // mouse em cima de uma bolinha: a galáxia pausa (a bolinha não foge do cursor) e ela fica em destaque, como a da frente
  var orbHover = false;
  orbs.forEach(function (o) {
    o.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; orbHover = true; o.classList.add('is-hov'); });
    o.addEventListener('pointerleave', function () { orbHover = false; o.classList.remove('is-hov'); });
  });
  // uma foto por frase, na mesma ordem das frases; a foto da frase atual vem para a frente (embaixo da frase)
  var seeds = orbs.map(function (o, i) { return { a: i / N * Math.PI * 2, r: 1, h: 0, s: .92 + (i % 3) * .05 }; });
  // centro do ponto final da palavra grande (em relação ao centro da tela)
  var DP = { x: 0, y: 0, s: .12 };
  var measureDot = function () { var el = word, t = el.firstChild; if (!t || !t.data) return; var j = t.data.lastIndexOf('.'); if (j < 0) return; var r = document.createRange(); r.setStart(t, j); r.setEnd(t, j + 1); var b = r.getBoundingClientRect(), o = sec.querySelector('.zs-orbit').getBoundingClientRect(); DP.x = b.left + b.width / 2 - o.left; DP.y = b.top + b.height * .78 - o.top; DP.s = Math.max(.05, b.width * .55 / (innerWidth < 600 ? 84 : Math.min(200, innerWidth * (innerWidth < innerHeight ? .15 : .11)))); };
  // área ocupada pelo texto (em relação ao centro da órbita), medida com a frase mais larga do idioma:
  // a órbita é calculada para que nenhuma bolinha passe por cima do texto, em qualquer tela
  var safe = { hw: 0, hh: 0, key: '' }, noClickUntil = 0;
  var measureSafe = function () {
    var key = innerWidth + 'x' + innerHeight + lang(); if (safe.key === key) return;
    var say = sec.querySelector('.zs-say'), ob = sec.querySelector('.zs-orbit'); if (!say || !ob || !word) return;
    var o = ob.getBoundingClientRect(), cx = o.left + o.width / 2, cy = o.top + o.height / 2, keep = word.textContent, hw = 0, hh = 0;
    WORDS[lang()].forEach(function (t) { word.textContent = t; var r = say.getBoundingClientRect(); if (!r.width) return; hw = Math.max(hw, cx - r.left, r.right - cx); hh = Math.max(hh, cy - r.top, r.bottom - cy); });
    word.textContent = keep; if (!hw) return; safe.hw = hw; safe.hh = hh; safe.key = key;
  };
  var lastRX = 400, dragging = false, vel = 0;
  var renderOrbit = function () {
    // anel sempre deitado (elipse limpa), igual em celular, tablet em pé e computador
    var W = innerWidth, H = innerHeight, mob = W < 600, tall = W < H, RX = W * (mob ? .4 : (tall ? .4 : .4)), RY = mob ? Math.min(H * .19, RX * .62) : Math.min(H * .27, RX * (tall ? .5 : .42)),
        base = mob ? 84 : Math.min(200, W * (tall ? .15 : .11)), JIT = 0; // todas as bolinhas exatamente sobre a mesma elipse (sem desvio), em qualquer tela
    // a elipse envolve o retângulo do texto com folga do raio da maior bolinha: nenhuma bolinha encosta no texto
    // (no celular as das laterais ficam em parte fora da tela, o que é proposital)
    measureSafe();
    if (safe.hw) {
      var r0 = base * .86 * (mob ? 1.37 : 1.3) * 1.02 / 2 + (mob ? 10 : 16), ax = safe.hw + r0, ay = safe.hh + r0;
      RX = Math.max(RX, ax * (mob ? 1.22 : 1.12)); var kx = ax / RX; RY = Math.max(RY, ay / Math.sqrt(1 - kx * kx));
      var maxRY = H / 2 - r0 * .95 - (mob ? 0 : 24); // a bolinha da frente nunca sai pela parte de baixo da tela
      if (RY > maxRY) { RY = maxRY; var ky = Math.min(.97, ay / RY); RX = Math.max(RX, ax / Math.sqrt(1 - ky * ky)); }
    }
    lastRX = RX;
    orbs.forEach(function (o, i) {
      // spread = 0..1 no fim: as bolinhas se juntam todas no centro (é dali que o site abre)
      var sd = seeds[i], th = sd.a + spin + scrollSpin, g = gather * gather * (3 - 2 * gather), m = spread * spread * (3 - 2 * spread), rr = sd.r * (1 - m);
      var x = Math.cos(th) * RX * rr, depth = Math.sin(th), y = depth * RY * rr + sd.h * JIT, k = (depth + 1) / 2; // 0 = fundo, 1 = frente
      var sc = (mob ? .42 + k * .95 : .55 + k * .75) * sd.s, op = .62 + k * .38; y *= (1 - m); sc = sc + (.5 - sc) * m; op = op + (1 - op) * m;
      // no começo as bolinhas saem de dentro do ponto final da frase (pequenas, todas no ponto) e se abrem em órbita
      var gp = Math.min(1, Math.max(0, gather * 1.12 - i * .015)); gp = 1 - Math.pow(1 - gp, 3); var gr = .82 + .18 * gp; x *= gr; y *= gr;
      sc *= .55 + .45 * gp; op *= gp;
      o.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ')'; // sem inclinação: a logo fica reta
      // só a foto em foco (na frente, embaixo da frase) mostra a película e a logo
      // branco e logo crescem aos poucos enquanto a bolinha se aproxima da frente e somem aos poucos quando ela sai
      var fe = Math.min(1, Math.max(0, (depth - .925) / .07)); fe = fe * fe * (3 - 2 * fe);
      var f = (fe * Math.min(1, Math.max(0, 1 - m * 2)) * Math.min(1, Math.max(0, (gp - .9) / .1))).toFixed(2); if (o.__f !== f) { o.__f = f; o.style.setProperty('--f', f); }
      // só mexe no que mudou: largura (layout) só quando a tela muda de tamanho; opacidade e camada só quando mudam — sem travadas no celular
      var w = Math.round(base * .86); if (o.__w !== w) { o.__w = w; o.style.width = w + 'px'; }
      var ops = op.toFixed(2); if (o.__op !== ops) { o.__op = ops; o.style.opacity = ops; }
      var z = depth > 0 ? 3 : 1; if (o.__z !== z) { o.__z = z; o.style.zIndex = z; }
    });
  };
  var tick = function () {
    if (!live) return; var now = performance.now(), dt = Math.min(64, now - (lastStepT || now)); lastStepT = now;
    // a galáxia gira sempre, na mesma velocidade, rolando a página ou não (a rolagem só abre e fecha a cena);
    // a frase troca quando a bolinha seguinte passa pela frente. Só para com o mouse em cima de uma bolinha ou arrastando.
    if (!orbHover && !document.hidden) {
      if (!dragging) { autoX += dt / 2400 + vel * dt; vel *= Math.pow(.93, dt / 16); if (Math.abs(vel) < 1e-6) vel = 0; }
      spinT = Math.PI / 2 - autoX * Math.PI * 2 / N; if (inGalaxy) setWord(((Math.round(autoX) % N) + N) % N);
    }
    scrollSpin = dragging ? scrollSpin + (spinT - scrollSpin) * .35 : spinT; renderOrbit();
  };
  var curW = -1;
  var setWord = function (i) {
    if (i === curW) return; curW = i; var list = WORDS[lang()], txt = list[((i % list.length) + list.length) % list.length];
    gsap.to(word, { yPercent: -35, autoAlpha: 0, filter: 'blur(6px)', duration: .3, ease: 'power2.inOut', overwrite: true, onComplete: function () { word.textContent = txt; gsap.fromTo(word, { yPercent: 35, autoAlpha: 0, filter: 'blur(6px)' }, { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: .7, ease: 'power3.out' }); } });
  };

  // ---- cena "site se construindo": um cursor clica e o site vai se montando, no ritmo da rolagem ----
  var tr = function (k) { var D = window.FIO_I18N || {}; return (D[lang()] && D[lang()][k]) || (D.pt && D.pt[k]) || ''; };
  var B$ = function (q) { return sec.querySelector(q); };
  var build = B$('.zs-build'), frame = B$('.zb-frame'), cursor = B$('.zb-cursor'), ripple = B$('.zb-ripple');
  // digitação controlada pela rolagem
  var TYPERS = [], syncTypers = function () { TYPERS.forEach(function (x) { x.set(); }); };
  var typer = function (el, key, caret) { var o = { n: 0 }; el.__o = o; var T = { o: o, set: function () { var t = tr(key), s = t.slice(0, Math.round(o.n * t.length)); if (el.textContent !== s) el.textContent = s; el.classList.toggle('is-typing', !!caret && o.n > 0 && o.n < 1); } }; TYPERS.push(T); return T; };
  // posição de um elemento dentro da moldura (para onde o cursor vai)
  var at = function (q, fx, fy) { return function () { var e = B$(q), f = frame.getBoundingClientRect(), r = e.getBoundingClientRect(); return { x: r.left - f.left + r.width * fx, y: r.top - f.top + r.height * fy }; }; };
  var TOUR = { t: 0, f: null };
  var buildScene = function (tl, t0) {
    if (!build) return;
    var T2 = typer(B$('.zb-h'), 'zb.h', true), TL = typer(B$('.zb-logo'), 'zb.logo', false);
    var move = function (q, fx, fy, t, d) { var p = at(q, fx, fy); tl.to(cursor, { x: function () { return p().x; }, y: function () { return p().y; }, ease: 'power2.inOut', duration: d || .025 }, t); };
    var click = function (q, fx, fy, t) { var p = at(q, fx, fy); tl.set(ripple, { x: function () { return p().x; }, y: function () { return p().y; } }, t).fromTo(ripple, { scale: 0, autoAlpha: .7 }, { scale: 1, autoAlpha: 0, duration: .012, ease: 'power2.out' }, t).to(cursor, { scale: .82, duration: .004, yoyo: true, repeat: 1 }, t); };
    var t = t0;
    // a ilustração do site muda a cada vez que a cena passa (vetor animado: gráfico, barras, pedidos, relógio 24h)
    var vBox = B$('.zb-img'), vI = 0;
    var nextV = function () { if (!vBox) return; vI = vI % 4 + 1; vBox.setAttribute('data-v', [3, 1, 2, 4][vI - 1]); };
    tl.call(nextV, null, t - .01);
    // enquanto o site está na tela, a ilustração fica mudando sozinha (começa pelos pedidos chegando)
    setInterval(function () { if (build && getComputedStyle(build).visibility !== 'hidden' && !document.hidden) nextV(); }, 3600);
    // as bolinhas já se juntaram no centro: dali a tela do site abre, como um círculo que cresce
    var r0 = function () { return Math.max(14, (innerWidth < 600 ? 64 : Math.min(150, innerWidth * .085)) * .25); };
    var r1 = function () { return Math.hypot(frame.offsetWidth, frame.offsetHeight) / 2 + 4; };
    tl.fromTo(build, { autoAlpha: 0 }, { autoAlpha: 1, duration: .004 }, t)
      .fromTo(frame, { clipPath: function () { return 'circle(' + r0() + 'px at ' + frame.offsetWidth / 2 + 'px ' + frame.offsetHeight / 2 + 'px)'; } }, { clipPath: function () { return 'circle(' + r1() + 'px at ' + frame.offsetWidth / 2 + 'px ' + frame.offsetHeight / 2 + 'px)'; }, duration: .05, ease: 'power3.inOut' }, t)
      .fromTo(cursor, { autoAlpha: 0, x: function () { return frame.offsetWidth * .9; }, y: function () { return frame.offsetHeight * .95; } }, { autoAlpha: 1, duration: .01 }, t + .06);
    t -= .03; // o resto da montagem começa logo depois que a tela abre
    // 1) menu
    move('.zb-nav', .1, .5, t + .07, .016); click('.zb-nav', .1, .5, t + .087);
    tl.fromTo(B$('.zb-nav'), { clipPath: 'inset(-24px 100% -24px -24px)' }, { clipPath: 'inset(-24px -24px -24px -24px)', duration: .02, ease: 'power2.out' }, t + .089)
      .fromTo(TL.o, { n: 0 }, { n: 1, duration: .012, ease: 'none', onUpdate: TL.set }, t + .091);
    // 2) título digitando
    move('.zb-copy', .05, .2, t + .105, .016); click('.zb-copy', .05, .2, t + .122);
    tl.fromTo(T2.o, { n: 0 }, { n: 1, duration: .035, ease: 'none', onUpdate: T2.set }, t + .124)
      .fromTo(B$('.zb-p').children, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: .016, stagger: .005, ease: 'power2.out' }, t + .152);
    // 3) imagem
    move('.zb-img', .5, .5, t + .168, .016); click('.zb-img', .5, .5, t + .185);
    tl.fromTo(B$('.zb-img'), { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: .024, ease: 'power2.out' }, t + .187);
    // 4) botão
    move('.zb-copy', .2, .92, t + .2, .014); click('.zb-copy', .2, .92, t + .215);
    tl.fromTo(sec.querySelectorAll('.zb-cta, .zb-cta2'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .016, ease: 'back.out(2)' }, t + .217)
      .fromTo(B$('.zb-cards').children, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .016, stagger: .005, ease: 'power3.out' }, t + .222);
    // 5) passeio pelo site (o estado de cada momento é aplicado em tour(), pela posição da rolagem):
    //    menu → Produtos → adiciona ao carrinho → abre o carrinho → aba Clientes → menu → Contato
    move('.zb-navbtn', .5, .5, t + .238, .011); click('.zb-navbtn', .5, .5, t + .25);
    move('.zb-menu b[data-pg="1"]', .3, .5, t + .256, .011); click('.zb-menu b[data-pg="1"]', .3, .5, t + .268);
    move('.zv-1 .zv-prod.p1 .zv-add', .5, .5, t + .276, .011); click('.zv-1 .zv-prod.p1 .zv-add', .5, .5, t + .287);
    move('.zb-cart', .5, .5, t + .295, .011); click('.zb-cart', .5, .5, t + .307);
    move('.zb-links i:nth-child(3)', .5, .5, t + .31, .007); click('.zb-links i:nth-child(3)', .5, .5, t + .318);
    move('.zb-navbtn', .5, .5, t + .326, .011); click('.zb-navbtn', .5, .5, t + .338);
    move('.zb-menu b[data-pg="3"]', .3, .5, t + .344, .008); click('.zb-menu b[data-pg="3"]', .3, .5, t + .353);
    TOUR.t = t;
    tl.to(cursor, { autoAlpha: 0, duration: .01 }, t + .365)
      // a tela fecha de volta num círculo antes da saída
;

    // brilho quando as bolinhas se juntam no centro (antes da tela abrir)
    var glow = document.createElement('span'); glow.className = 'zb-glow'; glow.setAttribute('aria-hidden', 'true'); build.parentNode.insertBefore(glow, build);
    tl.fromTo(glow, { autoAlpha: 0, scale: .35 }, { autoAlpha: 1, scale: 1, duration: .022, ease: 'power2.out', immediateRender: false }, t0 - .012)
      .to(glow, { autoAlpha: 0, scale: 1.9, duration: .045, ease: 'power2.in' }, t0 + .03);

    // ---- a tela do site é interativa: a setinha preta segue o mouse e os elementos respondem ao clique ----
    var mouse = cursor.cloneNode(true); mouse.className = 'zb-mouse'; frame.appendChild(mouse);
    var L3 = function () { var l = (document.documentElement.lang || 'pt').slice(0, 2); return l === 'en' || l === 'es' ? l : 'pt'; };
    var MSG = {
      pt: [['Novo contato', 'Um cliente pediu orçamento agora'], ['Venda aprovada', 'Pedido #1042 · R$ 890,00'], ['Agenda cheia', '3 reuniões marcadas pelo site'], ['Avaliação 5 estrelas', '“Atendimento impecável!”']],
      en: [['New lead', 'A client just asked for a quote'], ['Sale approved', 'Order #1042 · $890.00'], ['Calendar full', '3 meetings booked through the site'], ['5-star review', '“Flawless service!”']],
      es: [['Nuevo contacto', 'Un cliente pidió presupuesto ahora'], ['Venta aprobada', 'Pedido #1042 · $890,00'], ['Agenda llena', '3 reuniones agendadas por el sitio'], ['Reseña 5 estrellas', '“¡Atención impecable!”']]
    };
    var toast = document.createElement('div'); toast.className = 'zb-toast'; toast.setAttribute('aria-hidden', 'true'); frame.appendChild(toast);
    var tI = 0, tT = 0;
    var showToast = function () {
      var m = tI === 4 ? MSG[L3()][4] : MSG[L3()][tI % 4]; tI = tI === 4 ? 0 : tI + 1;
      toast.innerHTML = '<i><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></i><span><b></b><small></small></span>';
      toast.querySelector('b').textContent = m[0]; toast.querySelector('small').textContent = m[1];
      toast.classList.remove('on'); void toast.offsetWidth; toast.classList.add('on');
      clearTimeout(tT); tT = setTimeout(function () { toast.classList.remove('on'); }, 2600);
    };
    var pt = function (e) { var f = frame.getBoundingClientRect(); return { x: e.clientX - f.left, y: e.clientY - f.top }; };
    var rip = function (p) { gsap.killTweensOf(ripple); gsap.set(ripple, { x: p.x, y: p.y }); gsap.fromTo(ripple, { scale: 0, autoAlpha: .75 }, { scale: 1.2, autoAlpha: 0, duration: .55, ease: 'power2.out' }); };
    frame.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; document.documentElement.classList.add('zb-in'); mouse.classList.add('on'); });
    frame.addEventListener('pointerleave', function () { document.documentElement.classList.remove('zb-in'); mouse.classList.remove('on'); });
    frame.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var p = pt(e); mouse.style.transform = 'translate3d(' + p.x + 'px,' + p.y + 'px,0)'; });
    frame.addEventListener('pointerdown', function () { mouse.classList.add('down'); });
    addEventListener('pointerup', function () { mouse.classList.remove('down'); });
    // ---- site de mentira, mas clicável: páginas, menu, segundo botão e painel ----
    var TX = {
      pt: { more: 'Ver projetos', menu: ['Início', 'Produtos', 'Clientes', 'Contato'], sheet: 'Projetos recentes', proj: ['Loja de café', 'Clínica', 'Escritório'], add: 'Adicionar', added: 'Adicionado', prods: [['Kit essencial', 'R$ 129'], ['Linha premium', 'R$ 249'], ['Assinatura', 'R$ 59/mês']], prodT: 'Mais vendidos', quote: '“Em 3 meses o site virou nosso melhor vendedor.”', who: 'Ana Souza · Café Aurora', cliT: 'Quem confia', formT: 'Fale com a gente', fields: ['Seu nome', 'Seu e-mail', 'Como podemos ajudar?'], send: 'Enviar mensagem', sent: 'Mensagem enviada!' },
      en: { more: 'See projects', menu: ['Home', 'Products', 'Clients', 'Contact'], sheet: 'Recent projects', proj: ['Coffee shop', 'Clinic', 'Law firm'], add: 'Add', added: 'Added', prods: [['Starter kit', '$29'], ['Premium line', '$59'], ['Subscription', '$12/mo']], prodT: 'Best sellers', quote: '“In 3 months the site became our best salesperson.”', who: 'Ana Souza · Aurora Coffee', cliT: 'Trusted by', formT: 'Get in touch', fields: ['Your name', 'Your email', 'How can we help?'], send: 'Send message', sent: 'Message sent!' },
      es: { more: 'Ver proyectos', menu: ['Inicio', 'Productos', 'Clientes', 'Contacto'], sheet: 'Proyectos recientes', proj: ['Cafetería', 'Clínica', 'Despacho'], add: 'Agregar', added: 'Agregado', prods: [['Kit esencial', '$29'], ['Línea premium', '$59'], ['Suscripción', '$12/mes']], prodT: 'Más vendidos', quote: '“En 3 meses el sitio se volvió nuestro mejor vendedor.”', who: 'Ana Souza · Café Aurora', cliT: 'Confían en nosotros', formT: 'Habla con nosotros', fields: ['Tu nombre', 'Tu correo', '¿Cómo podemos ayudarte?'], send: 'Enviar mensaje', sent: '¡Mensaje enviado!' }
    };
    // textos extras: nota média (página de depoimento) e cartão do local no mapa
    [['pt', '4,9', 'nota média · 2.300 avaliações', 'Sua loja', 'Aberto agora'], ['en', '4.9', 'average rating · 2,300 reviews', 'Your store', 'Open now'], ['es', '4,9', 'nota media · 2.300 reseñas', 'Tu tienda', 'Abierto ahora']].forEach(function (r) { TX[r[0]].rate = r[1]; TX[r[0]].rateT = r[2]; TX[r[0]].place = r[3]; TX[r[0]].open = r[4]; });
    // frases de benefício que aparecem embaixo do site, uma por etapa do passeio; carrinho e avaliações
    var SAY = {
      pt: ['Um site sob medida, com a cara da sua marca.', 'Uma mensagem clara, que vende logo de cara.', 'Imagens que prendem a atenção do cliente.', 'Botões que levam direto ao contato ou à compra.', 'Menu simples: tudo a um clique.', 'Sua loja aberta 24 horas por dia.', 'Carrinho prático: menos cliques, mais vendas.', 'Avaliações que passam confiança.', 'Contato e mapa: o cliente chega até você.'],
      en: ['A tailor-made site that looks like your brand.', 'A clear message that sells right away.', 'Images that hold your customer’s attention.', 'Buttons that lead straight to contact or checkout.', 'A simple menu: everything one click away.', 'Your store open 24 hours a day.', 'An easy cart: fewer clicks, more sales.', 'Reviews that build trust.', 'Contact and map: customers find you.'],
      es: ['Un sitio a medida, con la cara de tu marca.', 'Un mensaje claro que vende desde el inicio.', 'Imágenes que atrapan la atención del cliente.', 'Botones que llevan directo al contacto o a la compra.', 'Menú simple: todo a un clic.', 'Tu tienda abierta las 24 horas.', 'Carrito práctico: menos clics, más ventas.', 'Reseñas que generan confianza.', 'Contacto y mapa: el cliente llega hasta ti.']
    };
    [['pt', 'Seu carrinho', 'Total', 'Finalizar compra', 'Mais avaliações', [['Mariana L.', 'Comprei pelo celular em 2 minutos.'], ['Rafael T.', 'Responderam no WhatsApp na hora.'], ['Júlia M.', 'Site lindo e muito fácil de usar.']]],
     ['en', 'Your cart', 'Total', 'Checkout', 'More reviews', [['Mariana L.', 'Bought on my phone in 2 minutes.'], ['Rafael T.', 'They answered on WhatsApp right away.'], ['Julia M.', 'Beautiful site, so easy to use.']]],
     ['es', 'Tu carrito', 'Total', 'Finalizar compra', 'Más reseñas', [['Mariana L.', 'Compré desde el celular en 2 minutos.'], ['Rafael T.', 'Respondieron por WhatsApp al instante.'], ['Julia M.', 'Sitio lindo y muy fácil de usar.']]]
    ].forEach(function (r) { var o = TX[r[0]]; o.cartT = r[1]; o.total = r[2]; o.buy = r[3]; o.revT = r[4]; o.revs = r[5]; });
    // desenhos dos produtos (kit, frasco premium, assinatura)
    var PIC = [
      '<svg viewBox="0 0 120 120" aria-hidden="true"><path class="pz-s" d="M30 54h60v38a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6Z"/><rect class="pz-f" x="25" y="42" width="70" height="15" rx="4"/><path class="pz-a" d="M55 42h10v56H55Z"/><path class="pz-a" d="M60 42c-6-12-20-14-20-6s14 6 20 6c6 0 20 2 20-6s-14-6-20 6Z"/></svg>',
      '<svg viewBox="0 0 120 120" aria-hidden="true"><rect class="pz-f" x="46" y="26" width="26" height="8" rx="3"/><path class="pz-s" d="M72 30h12" /><rect class="pz-f" x="53" y="34" width="14" height="12" rx="2"/><rect class="pz-f" x="40" y="46" width="40" height="56" rx="12"/><rect class="pz-a" x="48" y="62" width="24" height="22" rx="4"/></svg>',
      '<svg viewBox="0 0 120 120" aria-hidden="true"><rect class="pz-f" x="26" y="32" width="68" height="62" rx="9"/><path class="pz-a" d="M26 41a9 9 0 0 1 9-9h50a9 9 0 0 1 9 9v8H26Z"/><path class="pz-s" d="M43 26v12M77 26v12"/><path class="pz-c" d="M48 71l8 8 17-17"/></svg>'
    ];
    // mapa desenhado: quadras, avenidas, parque e rio (cores seguem o tema)
    var MAP = '<svg class="zv-map-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
      + '<path class="mp-water" d="M-10 318C60 296 96 340 160 330S270 280 330 300 410 330 410 330V410H-10Z"/>'
      + '<path class="mp-park" d="M250 40h110a14 14 0 0 1 14 14v70a14 14 0 0 1-14 14H250a14 14 0 0 1-14-14V54a14 14 0 0 1 14-14Z"/>'
      + '<g class="mp-blocks">' + [[24, 24, 80, 62], [120, 24, 96, 62], [24, 104, 80, 74], [120, 104, 40, 74], [176, 104, 40, 74], [236, 158, 60, 58], [312, 158, 70, 58], [24, 196, 120, 62], [160, 196, 56, 62], [236, 234, 146, 40]].map(function (b) { return '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="8"/>'; }).join('') + '</g>'
      + '<g class="mp-roads"><path d="M0 95H400M0 187H400M226 0V290M112 0V290"/></g>'
      + '<path class="mp-ave" d="M-10 276C80 262 150 228 226 187S340 120 410 108"/>'
      + '<path class="mp-route" d="M112 290V187H226"/>'
      + '<g class="mp-trees"><circle cx="270" cy="70" r="9"/><circle cx="298" cy="96" r="11"/><circle cx="334" cy="66" r="8"/><circle cx="346" cy="110" r="9"/></g>'
      + '</svg>';
    var tx = function () { return TX[L3()]; };
    var cta2 = B$('.zb-cta2'), links = B$('.zb-links'), page = B$('.zb-page'), nav = B$('.zb-nav');
    // carrinho no menu (aparece na página de produtos)
    var cart = document.createElement('span'); cart.className = 'zb-cart'; cart.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 5h2l2 10h10l2-7H7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="19" r="1.4" fill="currentColor"/><circle cx="17" cy="19" r="1.4" fill="currentColor"/></svg><b>0</b>';
    if (nav) nav.insertBefore(cart, B$('.zb-navbtn')); var nCart = 0;
    // páginas extras, cada uma com um layout diferente
    var views = document.createElement('div'); views.className = 'zb-views'; page.appendChild(views);
    var menu = document.createElement('div'); menu.className = 'zb-menu'; frame.appendChild(menu);
    var sheet = document.createElement('div'); sheet.className = 'zb-sheet'; frame.appendChild(sheet);
    var cartp = document.createElement('div'); cartp.className = 'zb-cartp'; frame.appendChild(cartp);
    var items = [];
    var paintCart = function () {
      var t = tx(), sum = 0;
      var rows = items.map(function (k) { var p = t.prods[k], n = parseFloat(p[1].replace(/[^\d,.]/g, '').replace(',', '.')) || 0; sum += n; return '<div class="cp-row"><span class="cp-pic p' + k + '">' + PIC[k] + '</span><b>' + p[0] + '</b><em>' + p[1] + '</em></div>'; }).join('');
      var cur = (t.prods[0][1].match(/^[^\d]+/) || [''])[0];
      cartp.innerHTML = '<p class="cp-h">' + t.cartT + '</p>' + rows + '<div class="cp-tot"><span>' + t.total + '</span><b>' + cur + (L3() === 'en' ? sum.toFixed(2) : sum.toFixed(2).replace('.', ',')) + '</b></div><span class="cp-buy">' + t.buy + ' <em>→</em></span>';
      cart.querySelector('b').textContent = items.length; cart.classList.toggle('has', items.length > 0);
    };
    var addItem = function (k, btn) { items.push(k); paintCart(); cart.classList.remove('bump'); void cart.offsetWidth; cart.classList.add('bump'); if (btn) { btn.textContent = tx().added; btn.classList.add('ok'); } };
    // frase embaixo do site
    var say = document.createElement('p'); say.className = 'zb-say'; say.setAttribute('aria-hidden', 'true'); build.appendChild(say);
    var sayI = -1, setSay = function (i) { if (i === sayI) return; sayI = i; if (i < 0) { say.classList.remove('on'); return; } say.classList.remove('on'); clearTimeout(say.__t); say.__t = setTimeout(function () { say.textContent = SAY[L3()][i]; say.classList.add('on'); }, 160); };
    var paint = function () {
      var t = tx(); if (cta2) cta2.textContent = t.more;
      menu.innerHTML = t.menu.map(function (m, i) { return '<b data-pg="' + i + '">' + m + '</b>'; }).join('');
      sheet.innerHTML = '<div class="zs-h"><b>' + t.sheet + '</b><i class="zs-x" aria-label="Fechar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></i></div><div class="zs-g">' + t.proj.map(function (p, i) { return '<span class="zs-c c' + i + '"><em></em><b>' + p + '</b></span>'; }).join('') + '</div>';
      views.innerHTML =
        '<section class="zv zv-1"><p class="zv-t">' + t.prodT + '</p><div class="zv-grid">' + t.prods.map(function (p, i) { return '<div class="zv-prod p' + i + '"><span class="zv-img">' + PIC[i] + '</span><b>' + p[0] + '</b><span class="zv-row"><em>' + p[1] + '</em><span class="zv-add">' + t.add + '</span></span></div>'; }).join('') + '</div></section>'
        + '<section class="zv zv-2"><div class="zv-quote"><div class="zv-q-txt"><span class="zv-stars">★★★★★</span><p>' + t.quote + '</p><span class="zv-who"><i></i>' + t.who + '</span></div>'
        + '<div class="zv-rate"><b>' + t.rate + '</b><span class="zv-stars">★★★★★</span><small>' + t.rateT + '</small><ul>' + [[5, 86], [4, 10], [3, 3], [2, 1], [1, 0]].map(function (r) { return '<li><em>' + r[0] + '</em><i style="--w:' + r[1] + '%"></i></li>'; }).join('') + '</ul></div></div><p class="zv-t">' + t.revT + '</p><div class="zv-revs">' + t.revs.map(function (r, i) { return '<div class="zv-rev r' + i + '"><span class="zv-stars">★★★★★</span><p>“' + r[1] + '”</p><span class="zv-who"><i></i>' + r[0] + '</span></div>'; }).join('') + '</div></section>'
        + '<section class="zv zv-3"><div class="zv-form"><p class="zv-t big">' + t.formT + '</p>' + t.fields.map(function (f, i) { return '<label class="zv-in' + (i === 2 ? ' area' : '') + '"><span>' + f + '</span></label>'; }).join('') + '<span class="zv-send">' + t.send + ' <em>→</em></span></div><div class="zv-map">' + MAP + '<i></i><span class="zv-pin-card"><b>' + t.place + '</b><small><em></em>' + t.open + '</small></span></div></section>';
      [].forEach.call(menu.children, function (x) { x.classList.toggle('on', +x.dataset.pg === pg); });
    };
    var pg = 0; paint(); paintCart();
    new MutationObserver(function () { paint(); paintCart(); if (sayI >= 0) say.textContent = SAY[L3()][sayI]; }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    var goPage = function (n) {
      if (n === pg) return; pg = n;
      if (links) [].forEach.call(links.children, function (x, k) { x.classList.toggle('on', k === n); });
      [].forEach.call(menu.children, function (x) { x.classList.toggle('on', +x.dataset.pg === n); });
      frame.classList.add('swap');
      setTimeout(function () { page.setAttribute('data-pg', n); frame.classList.remove('swap'); }, 220);
    };
    var tS = {};
    TOUR.f = function (time) {
      var x = time - TOUR.t, set = function (k, v, fn) { if (tS[k] !== v) { tS[k] = v; fn(v); } };
      set('say', x < .05 || x > .372 ? -1 : x < .105 ? 0 : x < .165 ? 1 : x < .198 ? 2 : x < .236 ? 3 : x < .27 ? 4 : x < .305 ? 5 : x < .318 ? 6 : x < .352 ? 7 : 8, setSay);
      set('menu', (x >= .252 && x < .27) || (x >= .34 && x < .355), function (v) { if (v) [].forEach.call(menu.children, function (c) { c.classList.toggle('on', +c.dataset.pg === pg); }); frame.classList.toggle('menu-open', v); });
      set('pg', x < .27 ? 0 : x < .32 ? 1 : x < .355 ? 2 : 3, goPage);
      set('add', x >= .289, function (v) { var b = B$('.zv-1 .zv-prod.p1 .zv-add'); if (v) { if (items.indexOf(1) < 0) addItem(1, b); } else { items = items.filter(function (k) { return k !== 1; }); paintCart(); if (b) { b.textContent = tx().add; b.classList.remove('ok'); } } });
      set('cart', x >= .309 && x < .32, function (v) { frame.classList.toggle('cart-open', v); });
    };
    frame.addEventListener('click', function (e) {
      rip(pt(e));
      var el = e.target;
      if (!el.closest('.zb-navbtn, .zb-menu')) frame.classList.remove('menu-open');
      if (el.closest('.zb-img')) { nextV(); return; }
      if (el.closest('.zs-x')) { frame.classList.remove('sheet-open'); return; }
      var add = el.closest('.zv-add'); if (add) { var pr = add.closest('.zv-prod'); addItem(+(pr.className.match(/p(\d)/) || [0, 0])[1], add); return; }
      if (el.closest('.zb-cart')) { frame.classList.toggle('cart-open'); return; }
      if (frame.classList.contains('cart-open') && !el.closest('.zb-cartp')) frame.classList.remove('cart-open');
      var snd = el.closest('.zv-send'); if (snd) { var fm = snd.closest('.zv-form'); fm.classList.add('sent'); MSG[L3()][4] = [tx().sent, '']; tI = 4; showToast(); setTimeout(function () { fm.classList.remove('sent'); }, 2400); return; }
      var inp = el.closest('.zv-in'); if (inp) { [].forEach.call(inp.parentNode.querySelectorAll('.zv-in'), function (x) { x.classList.toggle('focus', x === inp); }); return; }
      if (el.closest('.zv-prod, .zv-quote, .zv-logos i, .zs-c')) { var q = el.closest('.zv-prod, .zv-quote, .zv-logos i, .zs-c'); q.classList.remove('pop'); void q.offsetWidth; q.classList.add('pop'); return; }
      if (el.closest('.zb-frame') && frame.classList.contains('sheet-open') && !el.closest('.zb-sheet')) { frame.classList.remove('sheet-open'); return; }
      if (el.closest('.zb-sheet')) return;
      var mi = el.closest('.zb-menu b'); if (mi) { goPage(+mi.dataset.pg); frame.classList.remove('menu-open'); return; }
      if (el.closest('.zb-cta2')) { frame.classList.add('sheet-open'); return; }
      if (el.closest('.zb-cta')) { showToast(); return; }
      var li = el.closest('.zb-links i'); if (li) { var k = [].indexOf.call(li.parentNode.children, li); goPage(k); [].forEach.call(li.parentNode.children, function (x) { x.classList.toggle('on', x === li); }); return; }
      var cd = el.closest('.zb-cards i'); if (cd) { cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop'); return; }
      if (el.closest('.zb-navbtn')) { [].forEach.call(menu.children, function (x) { x.classList.toggle('on', +x.dataset.pg === pg); }); frame.classList.toggle('menu-open'); return; }
      if (el.closest('.zb-h, .zb-logo')) { var h = el.closest('.zb-h, .zb-logo'); h.classList.remove('wave'); void h.offsetWidth; h.classList.add('wave'); return; }
    });
  };

  var init = function () {
    if (!window.gsap || !window.ScrollTrigger) { setTimeout(init, 200); return; }
    gsap.registerPlugin(ScrollTrigger);
    var FB = 800, D = null, O = null;
    var measure = function () {
      gsap.set([title, outro], { scale: 1 }); gsap.set(outro, { autoAlpha: 0 });
      D = dotPoint(title); O = dotPoint(outro);
      if (D) { gsap.set(title, { transformOrigin: D.tx + 'px ' + D.ty + 'px' }); gsap.set(fill, { left: D.sx, top: D.sy, width: FB, height: FB, xPercent: -50, yPercent: -50 }); }
      if (O) gsap.set(outro, { transformOrigin: O.tx + 'px ' + O.ty + 'px' });
      // CTA logo abaixo da frase final
      // (usa medidas de layout, sem transformações, porque a frase pode estar em zoom na hora da medida)
      if (cta) { var oy = outro.offsetTop + (+gsap.getProperty(outro, 'y') || 0) + outro.offsetHeight * (1 + (+gsap.getProperty(outro, 'yPercent') || 0) / 100); cta.style.top = (oy + (innerWidth < 600 ? 28 : 44)) + 'px'; var hn = sec.querySelector('.zs-scroll'); if (hn) { var cr = cta.getBoundingClientRect(), sr = stage.getBoundingClientRect(); hn.style.top = (cr.bottom - (+gsap.getProperty(cta, 'y') || 0) - sr.top + (innerWidth < 600 ? 40 : 56)) + 'px'; hn.style.bottom = 'auto'; } }
    };
    var cta = sec.querySelector('.zs-cta');
    measure(); word.textContent = WORDS[lang()][0];
    // mede a área do texto antes da galáxia abrir (medir na hora dava um tranco quando as bolinhas apareciam)
    var preSafe = function () { (window.requestIdleCallback || setTimeout)(function () { measureSafe(); measureDot(); }); };
    preSafe(); ScrollTrigger.addEventListener('refresh', preSafe);
    var cover = function (P) { if (!P) return 4; var HH = Math.max(innerHeight, stage.offsetHeight, (window.screen && screen.height) || 0), far = Math.max(Math.hypot(P.sx, P.sy), Math.hypot(innerWidth - P.sx, P.sy), Math.hypot(P.sx, HH - P.sy), Math.hypot(innerWidth - P.sx, HH - P.sy)); return far * 2.1 / FB; };
    var mob = innerWidth < 600, A = .11, B = .42, nW = WORDS.pt.length;
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + (mob ? 560 : 680) + '%'; }, scrub: 1, pin: stage, invalidateOnRefresh: true, onRefreshInit: measure,
        onUpdate: function (s) {
          var p = s.progress;
          if (p < .1) { var q = dotPoint(title); if (q) gsap.set(fill, { left: q.sx, top: q.sy }); }
          var on = p > A - .03 && p < B + .05; if (on !== live) { live = on; if (on) gsap.ticker.add(tick); else gsap.ticker.remove(tick); }
          // a rolagem também gira a galáxia; na saída as imagens se espalham para fora
          var P0 = A + .05, uR = Math.max(0, Math.min(nW - 1, (p - P0) / (B - P0) * nW - .5)), kk = Math.round(uR), dd = uR - kk, ee = Math.min(1, Math.max(0, Math.abs(dd) - .1) / .4); ee = .5 - Math.cos(ee * Math.PI) / 2; baseU = uR; baseK = uR; /* rolagem move o giro de forma contínua (sem parar em cada bolinha nem pular) */ /* o giro é só pelo tempo (constante); a rolagem não mexe nele */ var nowT = performance.now(); lastScrollT = nowT; inGalaxy = p > A - .013 && p < B - .01; spread = p > B ? Math.min(1, (p - B) / .04) : 0; gate(gOn ? p >= A - .04 : p >= A - .013); // folga para não ligar e desligar quando a rolagem para no limite
          if (p >= A - .02 && p <= B + .02) setWord(((Math.round(autoX) % N) + N) % N);
          if (gather < .02) measureDot(); if (live) renderOrbit();
        } } });
    // entrada: zoom no ponto final até a cor da letra tomar a tela
    gsap.set(title, { autoAlpha: 1, y: 0 }); // a frase sempre começa visível
    tl.fromTo(title, { scale: 1 }, { scale: 7, ease: 'power2.in', duration: .1 }, 0)
      .fromTo(fill, { scale: 0 }, { scale: function () { return cover(D); }, ease: 'power2.in', duration: .09 }, .015)
      .fromTo(title, { autoAlpha: 1 }, { autoAlpha: 0, duration: .02, immediateRender: false }, .095)
      .fromTo(cosmos, { autoAlpha: 0 }, { autoAlpha: 1, duration: .02 }, .1)
      // com a tela já tomada pela cor, o palco e a seção inteira ganham essa cor também (nunca sobra borda, mesmo se a tela mudar de tamanho)
      .fromTo([stage, sec], { backgroundColor: 'rgba(0,0,0,0)' }, { backgroundColor: function () { return getComputedStyle(fill).backgroundColor; }, duration: .001, immediateRender: false }, .1)
      .to(sec.querySelector('.zs-say'), { autoAlpha: 0, filter: 'blur(8px)', duration: .02 }, .415)
      .to(cosmos, { autoAlpha: 0, duration: .005 }, .485);
    buildScene(tl, .455);
    // saída: a bolinha fecha num ponto e a frase agora é outra
    tl
    // tudo fecha junto: a tela do site e a parte clara encolhem ao mesmo tempo para dentro do ponto da nova frase
    var E = .8, P = function () { return O || D; };
    // ponto final da frase nova, no sistema de coordenadas da moldura
    var inFrame = function () { var f = frame.getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: P().sx - (f.left - s.left), y: P().sy - (f.top - s.top) }; };
    tl.set([stage, sec], { backgroundColor: '' }, E)
      .set(fill, { left: function () { return P().sx; }, top: function () { return P().sy; }, scale: function () { return Math.max(cover(D), cover(O)); } }, E)
      .set(outro, { scale: 7, autoAlpha: 0 }, E)
      .to(frame, { clipPath: function () { var q = inFrame(); return 'circle(0px at ' + q.x + 'px ' + q.y + 'px)'; }, duration: .07, ease: 'power3.inOut' }, E)
      .to(fill, { scale: 0, ease: 'power2.inOut', duration: .09 }, E + .005)
      .to(build, { autoAlpha: 0, duration: .002 }, E + .07)
      .to(outro, { autoAlpha: 1, duration: .03 }, E + .02)
      .to(outro, { scale: 1, ease: 'power2.out', duration: .09 }, E + .02);
    if (cta) tl.fromTo(cta, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: 'power3.out', duration: .04 }, E + .08);
    tl.set({}, {}, 1);
    tl.eventCallback('onUpdate', function () { syncTypers(); if (TOUR.f) TOUR.f(tl.time()); });
    // depois de recalcular (resize, fontes), redesenha a cena no ponto atual da rolagem
    ScrollTrigger.addEventListener('refresh', function () { var pr = tl.progress(); tl.progress(0, true).progress(pr); syncTypers(); });
    // ---- aviso "Role a página" + no celular a seção toca sozinha (para se a pessoa tocar na tela) ----
    var hint = sec.querySelector('.zs-scroll'), ST = tl.scrollTrigger;
    // ---- a apresentação inteira toca sozinha (celular, tablet e computador) até a frase final ----
    // a pessoa mexeu (rolou, tocou, clicou, apertou tecla, arrastou): pausa; parou de mexer: continua de onde está
    // ritmo por trecho (ms para atravessar cada pedaço): abertura, bolinhas se abrindo, uma frase a cada ~2,2 s, o site se montando e a saída
    var SEG = [[0, .11, 3200], [.11, .16, 1600], [.16, .42, 22000], [.42, .8, 16000], [.8, .955, 3200]], ENDP = .955, IDLE = 1600;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, auto = null, touching = false, lastUser = -1e9, lastSet = null;
    var goTo = function (y) { lastSet = y; if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); };
    var rate = function (p) { for (var i = 0; i < SEG.length; i++) if (p < SEG[i][1]) return (SEG[i][1] - SEG[i][0]) / SEG[i][2]; return 0; }; // progresso por ms
    var stopAuto = function () { if (auto) { cancelAnimationFrame(auto); auto = null; } };
    var user = function () { lastUser = performance.now(); stopAuto(); };
    // começa assim que a frase "Feito para impressionar" está na tela (antes mesmo de a seção travar)
    var fresh = true, down = true, lastY = window.scrollY;
    addEventListener('scroll', function () { var y = window.scrollY; if (Math.abs(y - lastY) > 2) { if (!auto) down = y > lastY; lastY = y; } }, { passive: true });
    var inside = function () { var y = window.scrollY; return y > ST.start - innerHeight * .35 && y < ST.start + (ST.end - ST.start) * ENDP - 2; };
    var runAuto = function () {
      if (auto || reduce) return;
      var last = performance.now(), y = window.scrollY, len = ST.end - ST.start; lastSet = null;
      var step = function (now) {
        var dt = Math.min(50, now - last); last = now;
        // rolou por fora (barra de rolagem, atalho): conta como mexer
        if (lastSet !== null && Math.abs(window.scrollY - lastSet) > 40) { user(); return; }
        var p = (y - ST.start) / len, endY = ST.start + len * ENDP;
        y += rate(p) * len * dt;
        if (y >= endY) { goTo(endY); auto = null; return; }
        goTo(y); auto = requestAnimationFrame(step);
      };
      auto = requestAnimationFrame(step);
    };
    // vigia leve: a cada meio segundo, se a pessoa está dentro da apresentação e parou de mexer, volta a tocar
    // chegando na seção: começa quase na hora (só espera o embalo da rolagem acabar); depois de a pessoa mexer, espera ela parar
    setInterval(function () { if (!auto && !touching && !document.hidden && inside() && (!fresh || down) && performance.now() - lastUser > (fresh ? 250 : IDLE)) { fresh = false; runAuto(); } }, 120);
    addEventListener('touchstart', function () { touching = true; user(); }, { passive: true });
    addEventListener('touchend', function () { touching = false; lastUser = performance.now(); }, { passive: true });
    addEventListener('touchcancel', function () { touching = false; lastUser = performance.now(); }, { passive: true });
    ['wheel', 'keydown', 'mousedown', 'pointerdown'].forEach(function (ev) { addEventListener(ev, user, { passive: true }); });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: function () { return ST.end; },
      onUpdate: function (s) { if (hint) hint.classList.toggle('is-end', s.progress > .9); },
      onLeave: function () { stopAuto(); fresh = true; }, onLeaveBack: function () { stopAuto(); fresh = true; } });
    // celular: a barra de endereço aparecendo/sumindo muda só a altura; recalcular aí dava um tranco na apresentação
    var lastW = innerWidth;
    addEventListener('resize', function () { if (innerWidth === lastW && matchMedia('(pointer: coarse)').matches) return; lastW = innerWidth; clearTimeout(window.__zsR); window.__zsR = setTimeout(function () { ScrollTrigger.refresh(); }, 200); });
    new MutationObserver(function () { curW = -1; word.textContent = WORDS[lang()][0]; ScrollTrigger.refresh(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  };
  if (document.readyState === 'complete') init(); else addEventListener('load', init);
})();
