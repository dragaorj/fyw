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
    pt: ['cuida de sorrisos.', 'move torcidas.', 'reúne multidões.', 'leva sabor à mesa.', 'ensina profissões.', 'cuida da saúde.', 'cuida do planeta.'],
    en: ['cares for smiles.', 'moves crowds of fans.', 'brings people together.', 'brings flavor to the table.', 'teaches careers.', 'takes care of health.', 'takes care of the planet.'],
    es: ['cuida sonrisas.', 'mueve hinchadas.', 'reúne multitudes.', 'lleva sabor a la mesa.', 'enseña profesiones.', 'cuida la salud.', 'cuida el planeta.']
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
  var gate = function (on) { if (on === gOn) return; gOn = on; gsap.to(gObj, { v: on ? 1 : 0, duration: on ? 2.2 : .7, ease: on ? 'power3.out' : 'power2.in', overwrite: true, onUpdate: function () { gather = gObj.v; if (gather < 1) measureDot(); renderOrbit(); } }); };
  var pendW = null, autoX = 0, baseU = 0, baseK = 0, lastScrollT = 0, lastStepT = 0, inGalaxy = false;
  var N = orbs.length, spin = 0, scrollSpin = Math.PI / 2, spinT = Math.PI / 2, spread = 0, gather = 0, live = false;
  // logo branca de cada cliente na frente da foto (copiada do mural de clientes), sobre uma película escura
  var LOGOS = ['lumiere', 'jogo-pela-integridade', 'latimpacto', 'kyoto', 'beta-online', 'cimed', 'pacto-global'];
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
  orbs.forEach(function (o, i) { o.addEventListener('click', function () { if (LOGOS[i]) location.href = 'projetos/' + LOGOS[i] + '.html'; }); });
  // uma foto por frase, na mesma ordem das frases; a foto da frase atual vem para a frente (embaixo da frase)
  var seeds = orbs.map(function (o, i) { return { a: i / N * Math.PI * 2, r: .92 + (i % 2) * .08, h: ((i * 3) % 5 - 2) / 4, s: .92 + (i % 3) * .05 }; });
  // centro do ponto final da palavra grande (em relação ao centro da tela)
  var DP = { x: 0, y: 0, s: .12 };
  var measureDot = function () { var el = word, t = el.firstChild; if (!t || !t.data) return; var j = t.data.lastIndexOf('.'); if (j < 0) return; var r = document.createRange(); r.setStart(t, j); r.setEnd(t, j + 1); var b = r.getBoundingClientRect(), o = sec.querySelector('.zs-orbit').getBoundingClientRect(); DP.x = b.left + b.width / 2 - o.left; DP.y = b.top + b.height * .78 - o.top; DP.s = Math.max(.05, b.width * .55 / (innerWidth < 600 ? 92 : Math.min(200, innerWidth * (innerWidth < innerHeight ? .15 : .11)))); };
  var renderOrbit = function () {
    var W = innerWidth, H = innerHeight, mob = W < 600, RX = W * (mob ? .5 : (W < H ? .44 : .4)), RY = mob ? Math.min(H * .16, W * .34) : Math.min(H * .27, RX * (W < H ? .5 : .42)), // anel sempre deitado, inclusive em tela em pé // no celular: anel deitado (inclinado), igual ao desktop
        base = mob ? 92 : Math.min(200, W * (W < H ? .15 : .11));
    orbs.forEach(function (o, i) {
      // spread = 0..1 no fim: as bolinhas se juntam todas no centro (é dali que o site abre)
      var sd = seeds[i], th = sd.a + spin + scrollSpin, g = gather * gather * (3 - 2 * gather), m = spread * spread * (3 - 2 * spread), rr = sd.r * (1 - m) * g;
      var x = Math.cos(th) * RX * rr, depth = Math.sin(th), y = depth * RY * rr + sd.h * (mob ? W * .05 : H * .07) * g, k = (depth + 1) / 2; // 0 = fundo, 1 = frente
      var sc = (mob ? .42 + k * .95 : .55 + k * .75) * sd.s, op = .62 + k * .38; y *= (1 - m); sc = sc + (.5 - sc) * m; op = op + (1 - op) * m;
      // no começo as bolinhas saem de dentro do ponto final da frase (pequenas, todas no ponto) e se abrem em órbita
      var gp = Math.min(1, Math.max(0, g * 1.15 - i * .012)); x = DP.x + (x - DP.x) * gp; y = DP.y + (y - DP.y) * gp;
      var rot = Math.cos(th) * -6 * gp; sc = DP.s + (sc - DP.s) * gp; op = gp < .02 ? 0 : op * gp + (1 - gp);
      o.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ')'; // sem inclinação: a logo fica reta
      // só a foto em foco (na frente, embaixo da frase) mostra a película e a logo
      var f = Math.min(1, Math.max(0, (depth - .9) / .08)); f = f * f * (3 - 2 * f) * (1 - m) * gp; o.style.setProperty('--f', f.toFixed(3));
      o.style.width = base + 'px'; o.style.opacity = op.toFixed(3); o.style.zIndex = depth > 0 ? 3 : 1; o.style.filter = depth < -.2 && m < .5 ? 'blur(' + ((-depth - .2) * 1.2 * (1 - m)).toFixed(1) + 'px)' : 'none';
    });
  };
  var tick = function () {
    if (!live) return; var now = performance.now(), dt = Math.min(64, now - (lastStepT || now)); lastStepT = now;
    // parado na galáxia: as fotos orbitam a frase sem parar, devagar; desaceleram quando uma chega no centro (embaixo da frase) e a frase troca ali
    if (inGalaxy && (gather < 1 || now - lastScrollT > 450) && !document.hidden) { // começa a girar junto com a abertura das bolinhas
      autoX += dt / 5600; var ai = Math.floor(autoX), fr = autoX - ai, ef = fr * .35 + (.5 - Math.cos(fr * Math.PI) / 2) * .65, pos = baseK + ai + ef;
      spinT = Math.PI / 2 - pos * Math.PI * 2 / N; setWord(((Math.round(baseK + ai + ef) % N) + N) % N);
    }
    scrollSpin += (spinT - scrollSpin) * .12; renderOrbit();
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
    move('.zb-nav', .1, .5, t + .09); click('.zb-nav', .1, .5, t + .115);
    tl.fromTo(B$('.zb-nav'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .025, ease: 'power2.out' }, t + .117)
      .fromTo(TL.o, { n: 0 }, { n: 1, duration: .015, ease: 'none', onUpdate: TL.set }, t + .12);
    // 2) título digitando
    move('.zb-copy', .05, .2, t + .145); click('.zb-copy', .05, .2, t + .17);
    tl.fromTo(T2.o, { n: 0 }, { n: 1, duration: .05, ease: 'none', onUpdate: T2.set }, t + .172)
      .fromTo(B$('.zb-p').children, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: .02, stagger: .006, ease: 'power2.out' }, t + .215);
    // 3) imagem
    move('.zb-img', .5, .5, t + .24); click('.zb-img', .5, .5, t + .265);
    tl.fromTo(B$('.zb-img'), { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: .03, ease: 'power2.out' }, t + .267);
    // 4) botão
    move('.zb-copy', .2, .92, t + .3); click('.zb-copy', .2, .92, t + .325);
    tl.fromTo(B$('.zb-cta'), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .02, ease: 'back.out(2)' }, t + .327)
      .fromTo(B$('.zb-cards').children, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .02, stagger: .006, ease: 'power3.out' }, t + .335)
      .to(cursor, { autoAlpha: 0, duration: .01 }, t + .36)
      // a tela fecha de volta num círculo antes da saída
;
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
      if (cta) { var oy = outro.offsetTop + (+gsap.getProperty(outro, 'y') || 0) + outro.offsetHeight * (1 + (+gsap.getProperty(outro, 'yPercent') || 0) / 100); cta.style.top = (oy + (innerWidth < 600 ? 28 : 44)) + 'px'; }
    };
    var cta = sec.querySelector('.zs-cta');
    measure(); word.textContent = WORDS[lang()][0];
    var cover = function (P) { if (!P) return 4; var HH = Math.max(innerHeight, stage.offsetHeight, (window.screen && screen.height) || 0), far = Math.max(Math.hypot(P.sx, P.sy), Math.hypot(innerWidth - P.sx, P.sy), Math.hypot(P.sx, HH - P.sy), Math.hypot(innerWidth - P.sx, HH - P.sy)); return far * 2.1 / FB; };
    var mob = innerWidth < 600, A = .11, B = .42, nW = WORDS.pt.length;
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + (mob ? 560 : 680) + '%'; }, scrub: 1, pin: stage, invalidateOnRefresh: true, onRefreshInit: measure,
        onUpdate: function (s) {
          var p = s.progress;
          if (p < .1) { var q = dotPoint(title); if (q) gsap.set(fill, { left: q.sx, top: q.sy }); }
          var on = p > A - .02 && p < B + .05; if (on !== live) { live = on; if (on) gsap.ticker.add(tick); else gsap.ticker.remove(tick); }
          // a rolagem também gira a galáxia; na saída as imagens se espalham para fora
          var P0 = A + .05, uR = Math.max(0, Math.min(nW - 1, (p - P0) / (B - P0) * nW - .5)), kk = Math.round(uR), dd = uR - kk, ee = Math.min(1, Math.max(0, Math.abs(dd) - .1) / .4); ee = .5 - Math.cos(ee * Math.PI) / 2; autoX = Math.round(autoX); baseU = kk + (dd < 0 ? -1 : 1) * ee * .5; baseK = kk; spinT = Math.PI / 2 - (baseU + autoX) * Math.PI * 2 / N; var nowT = performance.now(); lastScrollT = nowT; inGalaxy = p > A - .005 && p < B - .01; spread = p > B ? Math.min(1, (p - B) / .04) : 0; gate(p >= A - .005);
          if (p >= A - .02 && p <= B + .02) setWord((kk + autoX) % N);
          if (gather < 1) measureDot(); if (live) renderOrbit();
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
    tl.eventCallback('onUpdate', syncTypers);
    // depois de recalcular (resize, fontes), redesenha a cena no ponto atual da rolagem
    ScrollTrigger.addEventListener('refresh', function () { var pr = tl.progress(); tl.progress(0, true).progress(pr); syncTypers(); });
    // ---- aviso "Role a página" + no celular a seção toca sozinha (para se a pessoa tocar na tela) ----
    var hint = sec.querySelector('.zs-scroll'), ST = tl.scrollTrigger;
    var coarse = matchMedia('(pointer: coarse)').matches, auto = null, armed = true, touching = false, waitT = 0;
    var stopAuto = function () { clearTimeout(waitT); if (auto) { cancelAnimationFrame(auto); auto = null; } };
    var goTo = function (y) { if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); };
    var startAuto = function () {
      stopAuto(); if (ST.progress <= 0 || ST.progress >= .9) return; // só toca se a pessoa está dentro da seção
      var endY = ST.start + (ST.end - ST.start) * .97, v = (ST.end - ST.start) / 28000, last = performance.now(), y = window.scrollY;
      var step = function (now) { var dt = Math.min(48, now - last); last = now; y = Math.max(y, window.scrollY) + v * dt; if (y >= endY) { goTo(endY); auto = null; return; } goTo(y); auto = requestAnimationFrame(step); };
      auto = requestAnimationFrame(step);
    };
    var arm = function () { clearTimeout(waitT); waitT = setTimeout(function () { if (touching) return arm(); startAuto(); }, 450); };
    if (coarse) {
      addEventListener('touchstart', function () { touching = true; stopAuto(); }, { passive: true });
      addEventListener('touchend', function () { touching = false; }, { passive: true });
    }
    ['wheel', 'keydown', 'mousedown'].forEach(function (ev) { addEventListener(ev, function () { if (auto) stopAuto(); }, { passive: true }); });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: function () { return ST.end; },
      onUpdate: function (s) {
        if (hint) hint.classList.toggle('is-off', s.progress > .78);
        // depois que a apresentação terminou, rolar para cima volta direto para a página (não repete a animação ao contrário)
        if (s.progress > .95) played = true;
        if (played && !jumping && s.direction < 0 && s.progress < .93) {
          jumping = true; stopAuto(); var ab = document.querySelector(".about"), yb = ab ? ab.getBoundingClientRect().bottom + window.scrollY - innerHeight : ST.start - innerHeight; goTo(Math.max(0, Math.min(yb, ST.start - innerHeight * .6))); // volta para a seção dos números tl.progress(0); setTimeout(function () { jumping = false; played = false; }, 400);
        }
      },
      onEnter: function () { if (coarse && armed) { armed = false; arm(); } },
      onLeave: function () { stopAuto(); },
      onLeaveBack: function () { stopAuto(); armed = true; if (!jumping) played = false; } });
    var played = false, jumping = false;
    addEventListener('resize', function () { clearTimeout(window.__zsR); window.__zsR = setTimeout(function () { ScrollTrigger.refresh(); }, 200); });
    new MutationObserver(function () { curW = -1; word.textContent = WORDS[lang()][0]; ScrollTrigger.refresh(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  };
  if (document.readyState === 'complete') init(); else addEventListener('load', init);
})();
