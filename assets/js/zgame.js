/* Fyw — mini game pixel art em tela cheia, logo abaixo de "Feito para impressionar. Pensado para vender."
   Ao rolar, uma bolinha preta cresce até ocupar a tela e vira o jogo (a página fica parada; "Pular jogo" sempre visível).
   Alienígenas do mal, cada um com um problema de site, descem atirando; a nave atira sozinha e segue o mouse/dedo.
   Cada alien destruído mostra, em pixel, o benefício conquistado. Ao vencer, a tela fecha e aparece a frase final + CTA.
   Rolando a página de volta para cima, o jogo volta. */
(function () {
  'use strict';
  var sec = document.querySelector('.zoom-play'); if (!sec) return;
  var pin = sec.querySelector('.zp-pin'), dot = sec.querySelector('.zp-dot'), stage = sec.querySelector('.zgame');
  var cv = stage.querySelector('.zg-canvas'), cx = cv.getContext('2d');
  var lang = function () { var l = (document.documentElement.lang || 'pt').slice(0, 2); return l === 'en' || l === 'es' ? l : 'pt'; };
  // [problema que o alien carrega, benefício que aparece quando ele explode]
  var WORDS = {
    pt: [['GARGALO', 'SITE SEM GARGALO'], ['LENTIDÃO', 'SITES MAIS RÁPIDOS'], ['TEMPLATE', 'SITE SEM TEMPLATE'], ['WORDPRESS', 'SEM WORDPRESS'],
      ['PLUGIN', '100% PROGRAMAÇÃO LIMPA'], ['LAYOUT VELHO', 'FEITO DO ZERO NO FIGMA'], ['BUG', 'TESTADO EM CADA TELA'], ['SEM VENDAS', 'FEITO PARA VENDER'], ['POPUP CHATO', 'NAVEGAÇÃO CLARA'], ['SEM GOOGLE', 'PENSADO PARA O GOOGLE'], ['QUEBRA NO CELULAR', 'PERFEITO NO CELULAR'], ['CÓDIGO PESADO', 'CÓDIGO LEVE']],
    en: [['BOTTLENECK', 'NO BOTTLENECKS'], ['SLOWNESS', 'FASTER WEBSITES'], ['TEMPLATE', 'NO TEMPLATES'], ['WORDPRESS', 'NO WORDPRESS'],
      ['PLUGIN', '100% CLEAN CODE'], ['OLD LAYOUT', 'MADE FROM SCRATCH IN FIGMA'], ['BUG', 'TESTED ON EVERY SCREEN'], ['NO SALES', 'BUILT TO SELL'], ['ANNOYING POPUP', 'CLEAR NAVIGATION'], ['NO GOOGLE', 'BUILT FOR GOOGLE'], ['BROKEN ON MOBILE', 'PERFECT ON MOBILE'], ['HEAVY CODE', 'LIGHT CODE']],
    es: [['ATASCO', 'SITIO SIN ATASCOS'], ['LENTITUD', 'SITIOS MÁS RÁPIDOS'], ['PLANTILLA', 'SIN PLANTILLAS'], ['WORDPRESS', 'SIN WORDPRESS'],
      ['PLUGIN', '100% CÓDIGO LIMPIO'], ['DISEÑO VIEJO', 'HECHO DESDE CERO EN FIGMA'], ['BUG', 'PROBADO EN CADA PANTALLA'], ['SIN VENTAS', 'HECHO PARA VENDER'], ['POPUP MOLESTO', 'NAVEGACIÓN CLARA'], ['SIN GOOGLE', 'PENSADO PARA GOOGLE'], ['ROTO EN MÓVIL', 'PERFECTO EN MÓVIL'], ['CÓDIGO PESADO', 'CÓDIGO LIGERO']]
  };
  var TXT = {
    pt: { spT: 'ESPECIAL PRONTO! TOQUE 2X NA TELA', spK: 'ESPECIAL PRONTO! ESPAÇO OU CLIQUE', spGo: 'ESPECIAL FYW!', help: 'A FYW VEIO TE AJUDAR!', intro: 'META: UM SITE QUE RESOLVE O SEU PROBLEMA', goal: 'META', score: 'PONTOS', lose: 'DE NOVO!', win: 'SITE 100% LIMPO!', hint: 'Mova o mouse. A nave atira sozinha.', hintT: 'Arraste o dedo. A nave atira sozinha.' },
    en: { spT: 'SPECIAL READY! DOUBLE TAP', spK: 'SPECIAL READY! SPACE OR CLICK', spGo: 'FYW SPECIAL!', help: 'FYW IS HERE TO HELP!', intro: 'GOAL: A WEBSITE THAT SOLVES YOUR PROBLEM', goal: 'GOAL', score: 'SCORE', lose: 'AGAIN!', win: '100% CLEAN SITE!', hint: 'Move the mouse. The ship fires on its own.', hintT: 'Drag your finger. The ship fires on its own.' },
    es: { spT: 'ESPECIAL LISTO! TOCA 2 VECES', spK: 'ESPECIAL LISTO! ESPACIO O CLIC', spGo: 'ESPECIAL FYW!', help: 'FYW VINO A AYUDARTE!', intro: 'META: UN SITIO QUE RESUELVE TU PROBLEMA', goal: 'META', score: 'PUNTOS', lose: 'OTRA VEZ!', win: 'SITIO 100% LIMPIO!', hint: 'Mueve el mouse. La nave dispara sola.', hintT: 'Arrastra el dedo. La nave dispara sola.' }
  };
  // ---------- fonte pixel 5x7 ----------
  var G = {
    A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110', C: '01111 10000 10000 10000 10000 10000 01111',
    D: '11110 10001 10001 10001 10001 10001 11110', E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
    G: '01111 10000 10000 10011 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001', I: '11111 00100 00100 00100 00100 00100 11111',
    J: '00111 00010 00010 00010 00010 10010 01100', K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
    M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001', O: '01110 10001 10001 10001 10001 10001 01110',
    P: '11110 10001 10001 11110 10000 10000 10000', Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
    S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100', U: '10001 10001 10001 10001 10001 10001 01110',
    V: '10001 10001 10001 10001 10001 01010 00100', W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
    Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
    0: '01110 10011 10101 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110', 2: '01110 10001 00001 00010 00100 01000 11111',
    3: '11110 00001 00001 01110 00001 00001 11110', 4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
    6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000', 8: '01110 10001 10001 01110 10001 10001 01110',
    9: '01110 10001 10001 01111 00001 00010 01100', '!': '00100 00100 00100 00100 00100 00000 00100', '/': '00001 00010 00010 00100 01000 01000 10000',
    ':': '00000 00100 00100 00000 00100 00100 00000', ' ': '00000 00000 00000 00000 00000 00000 00000'
  };
  Object.keys(G).forEach(function (k) { G[k] = G[k].split(' '); });
  var textW = function (s) { return s.length * 6 - 1; };
  var text; text = function (ctx, s, x, y, col, sc) { sc = sc || 1; ctx.fillStyle = col; for (var i = 0; i < s.length; i++) { var g = G[s[i]] || G[' ']; for (var r = 0; r < 7; r++) for (var c = 0; c < 5; c++) if (g[r][c] === '1') ctx.fillRect(x + (i * 6 + c) * sc, y + r * sc, sc, sc); } };
  // ---------- som (sintetizado, sem arquivos) ----------
  var AC = null, soundOn = true, sndBtn = stage.querySelector('.zg-sound');
  var unlock = function () { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} };
  var tone = function (f0, f1, dur, type, vol) { if (!AC || !soundOn || AC.state !== 'running') return; var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur); g.gain.setValueAtTime(vol || .05, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + .02); };
  var noise = function (dur, vol, freq) { if (!AC || !soundOn || AC.state !== 'running') return; var t = AC.currentTime, n = Math.floor(AC.sampleRate * dur), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; f.type = 'lowpass'; f.frequency.setValueAtTime(freq || 2400, t); f.frequency.exponentialRampToValueAtTime(120, t + dur); g.gain.value = vol || .25; s.connect(f).connect(g).connect(AC.destination); s.start(t); };
  var SFX = {
    shot: function () { tone(1400, 700, .05, 'square', .018); },
    hit: function () { noise(.05, .12, 3000); },
    boom: function () { noise(.45, .4, 1800); tone(180, 40, .4, 'triangle', .12); },
    hurt: function () { tone(500, 60, .5, 'sawtooth', .08); noise(.3, .25, 900); },
    pick: function () { [660, 990, 1320].forEach(function (f, i) { setTimeout(function () { tone(f, f, .09, 'square', .05); }, i * 70); }); },
    special: function () { tone(90, 900, .3, 'sawtooth', .06); setTimeout(function () { noise(1.6, .35, 6000); tone(900, 300, 2.4, 'square', .03); }, 250); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { tone(f, f, .16, 'square', .05); }, i * 110); }); }
  };
  var SL = { pt: ['Som ligado', 'Som desligado'], en: ['Sound on', 'Sound off'], es: ['Sonido activado', 'Sonido desactivado'] };
  var setSnd = function () { if (!sndBtn) return; sndBtn.setAttribute('aria-pressed', String(soundOn)); sndBtn.querySelector('span').textContent = SL[lang()][soundOn ? 0 : 1]; };
  if (sndBtn) { sndBtn.querySelector('span').removeAttribute('data-i18n'); setSnd(); sndBtn.addEventListener('click', function (e) { e.stopPropagation(); unlock(); soundOn = !soundOn; setSnd(); if (soundOn) tone(880, 880, .08, 'square', .05); }); }
  // som ligado por padrão: o navegador só libera áudio depois do 1º clique/toque/tecla na página — liberamos no primeiro gesto em qualquer lugar do site
  ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (ev) { document.addEventListener(ev, unlock, { passive: true, capture: true }); });

  // acentos desenhados por cima (ou por baixo) da letra base
  var ACC = { 'Á': ['A', 'a'], 'À': ['A', 'g'], 'Ã': ['A', 't'], 'Â': ['A', 'c'], 'É': ['E', 'a'], 'Ê': ['E', 'c'], 'Í': ['I', 'a'], 'Ó': ['O', 'a'], 'Õ': ['O', 't'], 'Ô': ['O', 'c'], 'Ú': ['U', 'a'], 'Ç': ['C', 'd'], 'Ñ': ['N', 't'], '%': ['%', ''] };
  G['%'] = ['11001', '11010', '00010', '00100', '01000', '01011', '10011'];
  var MARK = { a: [[3, -2], [2, -1]], g: [[1, -2], [2, -1]], t: [[0, -1], [1, -2], [2, -1], [3, -2]], c: [[1, -1], [2, -2], [3, -1]], d: [[2, 7], [2, 8], [1, 8]] };
  var glyph = function (ctx, ch, x, y, sc) { var m = ACC[ch], base = m ? m[0] : ch, g = G[base] || G[' ']; for (var r = 0; r < 7; r++) for (var c = 0; c < 5; c++) if (g[r][c] === '1') ctx.fillRect(x + c * sc, y + r * sc, sc, sc); if (m && MARK[m[1]]) MARK[m[1]].forEach(function (p) { ctx.fillRect(x + p[0] * sc, y + p[1] * sc, sc, sc); }); };
  text = function (ctx, s, x, y, col, sc) { sc = sc || 1; ctx.fillStyle = col; for (var i = 0; i < s.length; i++) glyph(ctx, s[i], x + i * 6 * sc, y, sc); };

  // nave (original da Fyw) e três alienígenas do mal (2 quadros de animação cada)
  var SHIP = ['....1....', '...111...', '...121...', '..11211..', '.1111111.', '113111311', '11.111.11', '1...3...1'];
  var COL = { 1: '#EEEDE9', 2: '#2F6BFF', 3: '#FF6A2B' };
  var ALIENS = [
    [['..1....1..', '...1..1...', '..111111..', '.11.11.11.', '1111111111', '1.111111.1', '1.1....1.1', '...11.11..'],
     ['..1....1..', '1..1..1..1', '1.111111.1', '111.11.111', '1111111111', '.11111111.', '..1....1..', '.1......1.']],
    [['...1111...', '.11111111.', '1112112111', '1111111111', '..11..11..', '.11.11.11.', '11......11', '.1......1.'],
     ['...1111...', '.11111111.', '1112112111', '1111111111', '..11..11..', '.11.11.11.', '.11....11.', '1........1']],
    [['....11....', '...1111...', '..111111..', '.11.11.11.', '.11111111.', '..1.11.1..', '.1......1.', '..1....1..'],
     ['....11....', '...1111...', '..111111..', '.11.11.11.', '.11111111.', '...1..1...', '..1.11.1..', '.1.1..1.1.']]
  ];
  var PAL = ['#FF6A2B', '#7B5CFF', '#2F9E44', '#FFC600', '#2F6BFF', '#E5484D', '#00C2B8', '#FF4FA3'];
  var drawSprite = function (rows, x, y, sc, col, eye) { for (var r = 0; r < rows.length; r++) for (var c = 0; c < rows[r].length; c++) { var k = rows[r][c]; if (k === '.') continue; cx.fillStyle = typeof col === 'object' ? col[k] : (k === '2' ? (eye || '#0B0B0B') : col); cx.fillRect(Math.round(x + c * sc), Math.round(y + r * sc), Math.ceil(sc), Math.ceil(sc)); } };

  // ---------- jogo ----------
  var PP = { bg: '#0B0B0B' };
  // logo da Fyw em pixel (desenhado à mão, preto sobre a bolinha branca)
  var LOGO = { w: 28, h: 18, px: [[4,0],[5,0],[6,0],[3,1],[4,1],[5,1],[6,1],[7,1],[2,2],[3,2],[4,2],[5,2],[6,2],[2,3],[3,3],[4,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[12,4],[13,4],[14,4],[15,4],[19,4],[20,4],[21,4],[25,4],[26,4],[27,4],[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[11,5],[12,5],[13,5],[14,5],[15,5],[18,5],[19,5],[20,5],[21,5],[24,5],[25,5],[26,5],[27,5],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[11,6],[12,6],[13,6],[14,6],[15,6],[18,6],[19,6],[20,6],[21,6],[24,6],[25,6],[26,6],[1,7],[2,7],[3,7],[5,7],[6,7],[7,7],[10,7],[11,7],[12,7],[13,7],[14,7],[15,7],[18,7],[19,7],[20,7],[21,7],[24,7],[25,7],[26,7],[1,8],[2,8],[3,8],[5,8],[6,8],[7,8],[10,8],[11,8],[12,8],[13,8],[14,8],[15,8],[17,8],[18,8],[19,8],[20,8],[21,8],[23,8],[24,8],[25,8],[1,9],[2,9],[3,9],[5,9],[6,9],[7,9],[9,9],[10,9],[11,9],[12,9],[13,9],[14,9],[15,9],[16,9],[17,9],[18,9],[19,9],[20,9],[21,9],[22,9],[23,9],[24,9],[25,9],[1,10],[2,10],[3,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[13,10],[14,10],[15,10],[16,10],[17,10],[18,10],[20,10],[21,10],[22,10],[23,10],[24,10],[25,10],[0,11],[1,11],[2,11],[3,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[13,11],[14,11],[15,11],[16,11],[17,11],[20,11],[21,11],[22,11],[23,11],[24,11],[0,12],[1,12],[2,12],[3,12],[6,12],[7,12],[8,12],[9,12],[10,12],[13,12],[14,12],[15,12],[16,12],[17,12],[20,12],[21,12],[22,12],[23,12],[24,12],[0,13],[1,13],[2,13],[6,13],[7,13],[8,13],[9,13],[10,13],[14,13],[15,13],[16,13],[20,13],[21,13],[22,13],[23,13],[6,14],[7,14],[8,14],[9,14],[4,15],[5,15],[6,15],[7,15],[8,15],[9,15],[4,16],[5,16],[6,16],[7,16],[8,16],[4,17],[5,17],[6,17]] }; // gerado a partir do SVG oficial da marca
  var GOAL = 1300; // meta de pontos (máx. 1120; cada dano na nave tira 50)
  var W = 320, H = 180, S = null, raf = 0, live = false, last = 0, touch = matchMedia('(pointer: coarse)').matches;
  var resize = function () { var r = stage.getBoundingClientRect(); var rw = r.width || innerWidth, rh = r.height || innerHeight; W = rw < 600 ? 150 : 384; H = Math.max(140, Math.round(W * rh / rw)); cv.width = W; cv.height = H; };
  var stars = [];
  var reset = function () {
    resize(); stars = []; for (var i = 0; i < 90; i++) stars.push({ x: (Math.random() - .5) * 2, y: (Math.random() - .5) * 2, z: Math.random() });
    var list = WORDS[lang()];
    S = { px: W / 2, tx: W / 2, py: H - 14, ty: H - 14, bullets: [], shots: [], parts: [], en: [], queue: list.slice(), total: list.length, cd: 0, spawn: 2.4, t: 0, killed: 0, score: 0, win: 0, lose: 0, lives: 3, orb: /zgdebug/.test(location.search) ? { x: W / 2, y: H * .35, t: 0 } : null, orbGiven: false, sp: /zgdebug/.test(location.search), wave: null, sayQ: [], inv: 0, shake: 0, sfx: 0, say: null };
  };
  var boom = function (x, y, c, n) { for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, v = 20 + Math.random() * 80; S.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: .4 + Math.random() * .6, c: Math.random() < .55 ? c : PP.fg || '#EEEDE9' }); } };
  var HZ = function () { return H * .2; };
  var spawn = function () {
    var it = S.queue.shift(); if (!it) return; var i = S.total - S.queue.length - 1;
    S.en.push({ w: it[0], say: it[1], kind: i % ALIENS.length, c: PAL[i % PAL.length], cx0: W * (.22 + Math.random() * .56), drift: (Math.random() - .5) * W * .45, p: 0, hp: 4, hit: 0, dead: false, fire: 1 + Math.random() * 1.2 });
  };
  // a nave inimiga vem pequena do fundo e cresce ao se aproximar (p: 0 = fundo, 1 = chegou)
  var geo = function (e) { var ease = e.p * e.p, s = .6 + ease * (W < 260 ? 1.7 : 3.2), ww = 10 * s, hh = 8 * s; var x = e.cx0 + e.drift * ease + Math.sin(S.t * 1.8 + e.cx0) * 8 * e.p - ww / 2; x = Math.max(2, Math.min(W - 2 - ww, x)); return { x: x, y: HZ() + (H - 40 - HZ()) * ease, w: ww, h: hh, s: s }; };
  var fireSpecial = function () {
    if (!S || !S.sp || S.win || S.lose || !live) return; S.sp = false; S.beam = { t: 0, dur: 2.8, tick: 0 }; S.shake = .25; S.shots = []; SFX.special();
    S.say = { txt: TXT[lang()].spGo, c: '#FFC600', t0: S.t };
    // os inimigos são destruídos pelo raio enquanto ele dura (step)
  };
  var hitShip = function () { if (S.inv > 0 || S.win || S.lose) return; S.lives--; S.score = Math.max(0, S.score - 50); S.inv = 1.4; S.shake = .2; boom(S.px, S.py + 4, '#E5484D', 30); SFX.hurt(); if (S.lives <= 0) S.lose = S.t; };
  var step = function (dt) {
    S.t += dt;
    stars.forEach(function (s) { s.z -= dt * .35; if (s.z <= .02) { s.z = 1; s.x = (Math.random() - .5) * 2; s.y = (Math.random() - .5) * 2; } });
    S.px += (S.tx - S.px) * Math.min(1, dt * 22); S.py += (S.ty - S.py) * Math.min(1, dt * 22); S.inv = Math.max(0, S.inv - dt); S.shake = Math.max(0, S.shake - dt);
    if (S.lose && !S.ended && S.t - S.lose > 1.6) { S.ended = 1; finish('lose'); }
    S.spawn -= dt; if (S.spawn <= 0 && S.queue.length && S.en.filter(function (e) { return !e.dead; }).length < 3) { spawn(); S.spawn = 1.1; }
    S.cd -= dt; if (S.cd <= 0 && !S.win && !S.lose) { S.cd = .1; S.bullets.push({ x: S.px - 3, y: S.py - 2 }, { x: S.px + 3, y: S.py - 2 }); if ((S.sfx = (S.sfx + 1) % 3) === 0) SFX.shot(); }
    S.bullets.forEach(function (b) { b.y -= 220 * dt; }); S.bullets = S.bullets.filter(function (b) { return b.y > -6 && !b.gone; });
    S.en.forEach(function (e) {
      if (e.dead) return; e.p = Math.min(1, e.p + dt * (.16 + S.killed * .012)); e.hit = Math.max(0, e.hit - dt); var g = geo(e);
      e.fire -= dt; if (e.fire <= 0 && e.p > .15 && !S.win && !S.lose) { e.fire = 1.2 + Math.random() * 1.4; var dx = S.px - (g.x + g.w / 2), dy = (S.py + 4) - (g.y + g.h), d = Math.hypot(dx, dy) || 1; S.shots.push({ x: g.x + g.w / 2, y: g.y + g.h, vx: dx / d * 70, vy: dy / d * 70, c: e.c }); }
      S.bullets.forEach(function (b) { if (b.gone || e.dead) return; if (b.x >= g.x - 1 && b.x <= g.x + g.w + 1 && b.y >= g.y - 1 && b.y <= g.y + g.h + 1) { b.gone = true; e.hp--; e.hit = .08; S.score += 10; boom(b.x, g.y + g.h, e.c, 3); SFX.hit();
        if (e.hp <= 0) { e.dead = true; S.killed++; S.score += 100; boom(g.x + g.w / 2, g.y + g.h / 2, e.c, 34); SFX.boom(); if (S.say && S.t - S.say.t0 < 1.6) S.sayQ.push({ txt: e.say, c: e.c }); else S.say = { txt: e.say, c: e.c, t0: S.t };
          if (S.killed === 4 && !S.orbGiven) { S.orbGiven = true; S.orb = { x: g.x + g.w / 2, y: g.y + g.h / 2, t: 0 }; } } } });
      if (S.px + 4 > g.x && S.px - 4 < g.x + g.w && S.py + 7 > g.y && S.py < g.y + g.h && e.p > .3) { hitShip(); e.p = 1; }
      if (e.p >= 1) { e.p = 0; e.cx0 = W * (.22 + Math.random() * .56); e.drift = (Math.random() - .5) * W * .45; }
    });
    S.shots.forEach(function (s) { s.x += s.vx * dt; s.y += s.vy * dt; if (Math.abs(s.x - S.px) < 5 && s.y > S.py - 1 && s.y < S.py + 9) { s.gone = true; hitShip(); } });
    S.shots = S.shots.filter(function (s) { return !s.gone && s.y < H + 4 && s.x > -4 && s.x < W + 4; });
    if (!S.queue.length && S.en.every(function (e) { return e.dead; }) && !S.win) { S.win = S.t; S.sayQ = []; SFX.win(); S.winAt = Math.max(S.t + .3, S.say ? S.say.t0 + 1.65 : 0); }
    // fim: mostra 'SITE 100% LIMPO!' por um tempo e só então fecha
    if (S.win && !S.fin && S.t > S.winAt + 2.2) { S.fin = 1; finish(S.score >= GOAL ? 'win' : 'lose'); }
    if (S.say && S.t - S.say.t0 >= 1.6 && S.sayQ.length) { var nx = S.sayQ.shift(); S.say = { txt: nx.txt, c: nx.c, t0: S.t }; }
    if (S.orb) { var o = S.orb; o.t += dt; o.y += 22 * dt; o.x += Math.sin(o.t * 2.2) * 18 * dt; if (Math.hypot(o.x - S.px, o.y - (S.py + 4)) < 22) { S.orb = null; S.sp = true; SFX.pick(); boom(o.x, o.y, '#FFC600', 20); S.say = { txt: TXT[lang()].help, c: '#FFC600', t0: S.t }; } else if (o.y > H + 14) S.orb = null; }
    if (S.beam) { var B = S.beam; B.t += dt; var bw = W < 260 ? 12 : 22; if (B.t > .25 && B.t < B.dur) { B.tick -= dt; S.shots = S.shots.filter(function (sh) { return Math.abs(sh.x - S.px) > bw; });
        if (B.tick <= 0) { B.tick = .07; if (((B.t * 14) | 0) % 2) noise(.08, .08, 5000); S.en.forEach(function (e) { if (e.dead || e.p <= 0) return; var g = geo(e); if (g.x < S.px + bw / 2 && g.x + g.w > S.px - bw / 2 && g.y < S.py) { e.hp--; e.hit = .08; boom(S.px + (Math.random() - .5) * bw, g.y + g.h, '#9EE7FF', 4);
          if (e.hp <= 0) { e.dead = true; S.killed++; S.score += 140; boom(g.x + g.w / 2, g.y + g.h / 2, e.c, 40); SFX.boom(); if (S.say && S.t - S.say.t0 < 1.6) S.sayQ.push({ txt: e.say, c: e.c }); else S.say = { txt: e.say, c: e.c, t0: S.t }; } } }); } }
      if (B.t > B.dur + .3) S.beam = null; }
    S.parts.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 60 * dt; p.l -= dt; }); S.parts = S.parts.filter(function (p) { return p.l > 0; });
  };
  // texto grande em pixel, quebrando em linhas que caibam na tela
  var bigText = function (txt, col, a, dy) {
    var sc = W >= 300 ? 3 : 2, maxC = Math.floor((W * .92) / (6 * sc)); if (txt.length > maxC && sc > 1 && W >= 300) { sc = 2; maxC = Math.floor((W * .92) / (6 * sc)); }
    var lines = [], cur = ''; txt.split(' ').forEach(function (w) { if ((cur + ' ' + w).trim().length > maxC && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) lines.push(cur);
    var lh = 11 * sc, y0 = Math.round(H * .42 - lines.length * lh / 2 + (dy || 0)); cx.globalAlpha = a;
    lines.forEach(function (l, i) { var x = Math.round(W / 2 - (l.length * 6 - 1) * sc / 2); text(cx, l, x + sc, y0 + i * lh + sc, PP.bg, sc); text(cx, l, x, y0 + i * lh, col, sc); }); cx.globalAlpha = 1;
  };
  var draw = function () {
    var dk = document.documentElement.getAttribute('data-theme') === 'dark', P = dk ? { bg: '#EEEDE9', fg: '#0B0B0B', mid: '#6B6A66', far: '#C9C8C3', near: '#0B0B0B', acc: '#FF6A2B' } : { bg: '#0B0B0B', fg: '#EEEDE9', mid: '#8A8984', far: '#3A3A38', near: '#EEEDE9', acc: '#FFC600' }; PP = P;
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.imageSmoothingEnabled = false; cx.fillStyle = P.bg; cx.fillRect(0, 0, W, H);
    if (S.shake) cx.translate(Math.round((Math.random() - .5) * 2), Math.round((Math.random() - .5) * 2));
    var vx = W / 2, vy = HZ(); stars.forEach(function (s) { var px = vx + s.x / s.z * W * .25, py = vy + s.y / s.z * H * .3; if (px < 0 || px > W || py < 0 || py > H) return; cx.fillStyle = s.z < .3 ? P.near : s.z < .6 ? P.mid : P.far; cx.fillRect(Math.round(px), Math.round(py), s.z < .25 ? 2 : 1, 1); });
    var fr = (S.t * 3 | 0) % 2;
    S.en.filter(function (e) { return !e.dead; }).sort(function (a, b) { return a.p - b.p; }).forEach(function (e) { var g = geo(e); cx.globalAlpha = Math.min(1, .3 + e.p * 2);
      drawSprite(ALIENS[e.kind][fr], g.x, g.y, g.s, e.hit ? P.fg : e.c, P.bg);
      if (e.p > .25) { var lw = textW(e.w); text(cx, e.w, Math.round(g.x + g.w / 2 - lw / 2), Math.round(g.y + g.h + 2), P.mid, 1); } cx.globalAlpha = 1; });
    cx.fillStyle = '#FFC600'; S.bullets.forEach(function (b) { cx.fillRect(Math.round(b.x), Math.round(b.y), 1, 3); });
    S.shots.forEach(function (s) { cx.fillStyle = s.c; cx.fillRect(Math.round(s.x) - 1, Math.round(s.y) - 1, 2, 2); });
    S.parts.forEach(function (p) { cx.fillStyle = p.c; cx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); });
    // a nave nunca treme: desenhada sem o tremor da tela; quando leva dano fica translúcida (sem piscar)
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = S.inv ? .45 : 1;
    var drawShip = function () { cx.globalAlpha = S.inv ? .45 : 1; if (!S.lose) drawSprite(SHIP.map(function (r) { return r.replace(/3/g, (S.t * 10 | 0) % 2 ? '4' : '3'); }), S.px - 4, S.py, 1, { 1: P.fg, 2: '#2F6BFF', 3: '#FF6A2B', 4: '#FFC600' }); cx.globalAlpha = 1; }; drawShip();
    cx.globalAlpha = 1;
    // benefício conquistado, em pixel grande
    if (S.orb) { var ob = S.orb, pr = 19 + Math.sin(S.t * 8) * 1;
      // brilho em volta: halo pulsando em anéis de pixel + faíscas girando
      var pulse = .5 + Math.sin(S.t * 6) * .5; for (var hi = 4; hi >= 1; hi--) { var hr = pr + hi * 2.5 + pulse * 2; cx.globalAlpha = (.09 + pulse * .05) * (5 - hi); cx.fillStyle = hi > 2 ? '#FFE680' : '#FFFFFF'; for (var hy = -hr; hy <= hr; hy++) { var hx = Math.sqrt(hr * hr - hy * hy); cx.fillRect(Math.round(ob.x - hx), Math.round(ob.y + hy), Math.round(hx * 2), 1); } } cx.globalAlpha = 1;
      for (var si = 0; si < 8; si++) { var sa = S.t * 2.4 + si * Math.PI / 4, sr = pr + 7 + Math.sin(S.t * 5 + si) * 3; cx.fillStyle = si % 2 ? '#FFFFFF' : '#FFE680'; cx.fillRect(Math.round(ob.x + Math.cos(sa) * sr), Math.round(ob.y + Math.sin(sa) * sr), 2, 2); }
      cx.fillStyle = '#FFFFFF'; for (var oy = -pr; oy <= pr; oy++) { var ox = Math.sqrt(pr * pr - oy * oy); cx.fillRect(Math.round(ob.x - ox), Math.round(ob.y + oy), Math.round(ox * 2), 1); } cx.fillStyle = '#0B0B0B'; if (LOGO) LOGO.px.forEach(function (p) { cx.fillRect(Math.round(ob.x - LOGO.w / 2) + p[0], Math.round(ob.y - LOGO.h / 2) + p[1], 1, 1); }); else text(cx, 'FYW', Math.round(ob.x - 8), Math.round(ob.y - 3), '#0B0B0B', 1); }
    if (S.beam) { var b = S.beam, bw2 = W < 260 ? 12 : 22, grow = Math.min(1, b.t / .25), fade = b.t > b.dur ? Math.max(0, 1 - (b.t - b.dur) / .3) : 1, wob = 1 + Math.sin(b.t * 60) * .12;
      var bx = S.px, rr = (bw2 * .62 + Math.sin(b.t * 40) * 1.2) * Math.max(grow, .45), cy0 = S.py - 2 - rr, top = b.t < .25 ? cy0 - cy0 * (b.t / .25) : 0;
      cx.globalAlpha = .28 * fade; cx.fillStyle = '#5FD3FF'; cx.fillRect(Math.round(bx - bw2 * .9 * wob), Math.round(top), Math.round(bw2 * 1.8 * wob), Math.round(cy0 - top));
      cx.globalAlpha = .9 * fade; cx.fillStyle = '#7FDBFF'; cx.fillRect(Math.round(bx - bw2 / 2 * wob * grow), Math.round(top), Math.round(bw2 * wob * grow), Math.round(cy0 - top));
      cx.fillStyle = '#FFFFFF'; cx.fillRect(Math.round(bx - bw2 * .18 * wob), Math.round(top), Math.max(1, Math.round(bw2 * .36 * wob)), Math.round(cy0 - top));
      cx.fillStyle = '#7FDBFF'; for (var yy = -rr; yy <= rr; yy++) { var xx = Math.sqrt(rr * rr - yy * yy); cx.fillRect(Math.round(bx - xx), Math.round(cy0 + yy), Math.round(xx * 2), 1); }
      var r2 = rr * .5; cx.fillStyle = '#FFFFFF'; for (yy = -r2; yy <= r2; yy++) { xx = Math.sqrt(r2 * r2 - yy * yy); cx.fillRect(Math.round(bx - xx), Math.round(cy0 + yy), Math.round(xx * 2), 1); }
      for (var q = 0; q < 6; q++) { cx.fillStyle = Math.random() < .5 ? '#FFFFFF' : '#9EE7FF'; cx.fillRect(Math.round(bx + (Math.random() - .5) * bw2 * 2), Math.round(top + Math.random() * (cy0 - top)), 1, 2); } cx.globalAlpha = 1;
      drawShip(); }
    if (S.sp && (S.t * 3 | 0) % 2) { var sm = touch ? TXT[lang()].spT : TXT[lang()].spK; text(cx, sm, Math.round(W / 2 - textW(sm) / 2), Math.round(H - 26), '#FFC600', 1); }
    if (S.say) { var k = S.t - S.say.t0; if (k < 1.6) bigText(S.say.txt, S.say.c, k < .12 ? k / .12 : k > 1.25 ? Math.max(0, (1.6 - k) / .35) : 1, k < .12 ? (1 - k / .12) * 8 : 0); }
    if (S.t < 2.3) bigText(TXT[lang()].intro, P.acc, S.t < .2 ? S.t / .2 : S.t > 1.9 ? Math.max(0, (2.3 - S.t) / .4) : 1, 0);
    if (S.win) { var kw = S.t - S.winAt + .3; if (kw > .3) bigText(TXT[lang()].win, P.acc, Math.min(1, (kw - .3) * 3), 0); }
    var T = TXT[lang()]; text(cx, T.score + ' ' + String(S.score).padStart(4, '0'), 4, 4, P.fg); text(cx, S.killed + '/' + S.total, 4, 13, P.mid); var gl = T.goal + ' ' + String(GOAL).padStart(4, '0'); text(cx, gl, W - textW(gl) - 4, 4, S.score >= GOAL ? '#2F9E44' : P.acc);
    for (var i = 0; i < 3; i++) { cx.fillStyle = i < S.lives ? '#E5484D' : P.far; cx.fillRect(4 + i * 7, 23, 5, 5); }
    if (S.lose) bigText(T.lose, '#E5484D', 1, 0);
  };
  var loop = function (now) { var dt = Math.min(.05, (now - (last || now)) / 1000); last = now; step(dt); draw(); raf = live ? requestAnimationFrame(loop) : 0; };
  var startGame = function (fresh) { if (live) return; live = true; if (fresh || !S || S.win) reset(); else resize(); last = 0; raf = requestAnimationFrame(loop); };
  var stopGame = function () { live = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
  var aim = function (x, y) { var r = cv.getBoundingClientRect(); if (!r.width || !S) return; S.tx = Math.max(6, Math.min(W - 6, (x - r.left) / r.width * W)); if (y != null) S.ty = Math.max(H * .3, Math.min(H - 12, (y - r.top) / r.height * H - (touch ? 14 : 4))); };
  window.addEventListener('keydown', function (e) { if ((e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar' || e.keyCode === 32) && locked) { e.preventDefault(); e.stopPropagation(); fireSpecial(); } }, true);
  var lastTap = 0; stage.addEventListener('touchend', function () { var n = Date.now(); if (n - lastTap < 320) fireSpecial(); lastTap = n; }, { passive: true });
  // no computador, um clique no jogo também solta o especial
  stage.addEventListener('mousedown', function (e) { if (e.button === 0 && Date.now() - lastTap > 900 && !e.target.closest('button, a')) fireSpecial(); });
  // ao voltar para a aba/janela do site, o jogo pega o teclado de novo sozinho (sem precisar clicar)
  var refocus = function () { if (!locked) return; if (document.activeElement && document.activeElement !== stage && document.activeElement.blur) document.activeElement.blur(); try { stage.focus({ preventScroll: true }); } catch (e) {} };
  addEventListener('focus', refocus); document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(refocus, 30); });
  // aba escondida: pausa o jogo (volta quando a pessoa retorna)
  document.addEventListener('visibilitychange', function () { if (!locked) return; if (document.hidden) stopGame(); else startGame(false); });
  stage.addEventListener('mousemove', function (e) { aim(e.clientX, e.clientY); });
  stage.addEventListener('touchstart', function (e) { aim(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  stage.addEventListener('touchmove', function (e) { e.preventDefault(); aim(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  var hint = stage.querySelector('.zg-hint'); var setHint = function () { if (hint) hint.textContent = touch ? TXT[lang()].hintT : TXT[lang()].hint; };
  setHint(); new MutationObserver(setHint).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // ---------- fluxo ----------
  var zst = null, done = false, locked = false, skipped = false, played = false; // depois que o jogo termina (ou é pulado), a rolagem fica normal; só volta com 'Jogar de novo'
  var lockScroll = function (fresh) { if (locked) return; locked = true; unlock(); done = false; sec.classList.remove('is-done'); stage.classList.remove('is-open'); if (window.__lenis) window.__lenis.stop(); document.documentElement.classList.add('zg-lock'); stage.classList.add('is-live'); startGame(fresh); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); stage.setAttribute('tabindex', '-1'); try { stage.focus({ preventScroll: true }); } catch (e) {} };
  // jogar de novo: centraliza a página exatamente na tela do jogo antes de recomeçar
  var replay = function () { if (zst) { var y = zst.end - 1; if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); } setTimeout(function () { lockScroll(true); }, 60); };
  var unlockScroll = function () { locked = false; document.documentElement.classList.remove('zg-lock'); if (window.__lenis) window.__lenis.start(); };
  // vitória ou "pular": a tela do jogo fecha num círculo e aparece a frase final com o botão
  function finish(res) {
    if (done) return; done = true; played = true; sec.dataset.result = typeof res === 'string' ? res : 'skip'; var sc = sec.querySelector('.zp-score'); if (sc && S) sc.textContent = S.score + ' / ' + GOAL; stage.classList.add('is-open'); sec.classList.add('is-done');
    setTimeout(function () { stopGame(); stage.classList.remove('is-live'); unlockScroll();
      // rola sozinho até a tela final com o CTA (fim da seção fixa); dali a pessoa segue rolando se quiser
      var st = zst; lastR = -1; sec.classList.add('show-final'); if (st) { var y = st.end - 1; if (window.__lenis) window.__lenis.scrollTo(y, { duration: .9 }); else scrollTo({ top: y, behavior: 'smooth' }); }
      var cta = sec.querySelector('.zp-final .zoom-cta'); if (cta) setTimeout(function () { cta.focus({ preventScroll: true }); }, 1000);
    }, res === 'quit' ? 0 : 1000);
  }
  var skip = stage.querySelector('.zg-skip'); if (skip) skip.addEventListener('click', function (e) { e.stopPropagation(); skipped = true; finish('quit'); });
  // sair a qualquer hora com Esc
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && locked) { skipped = true; finish('quit'); } });
  var again = sec.querySelector('.zg-again'); if (again) again.addEventListener('click', function () { skipped = false; replay(); });
  sec.querySelectorAll('.zg-again').forEach(function (b) { if (b !== again) b.addEventListener('click', function () { skipped = false; replay(); }); });
  var init = function () {
    if (!window.gsap || !window.ScrollTrigger) { setTimeout(init, 200); return; }
    gsap.registerPlugin(ScrollTrigger);
    var cover = function () { var d = dot.offsetWidth || 20; return Math.hypot(innerWidth, innerHeight) / d * 1.05; };
    zst = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + (innerWidth < 600 ? 95 : 130) + '%'; }, scrub: .5, pin: pin, invalidateOnRefresh: true,
        onUpdate: function (st) { if (st.progress > .97 && st.direction > 0 && !done && !skipped && !played) lockScroll(true);  },
        // voltando a página para cima até o jogo, ele começa de novo
        onEnterBack: function () {},
        onLeaveBack: function () {} } })
      .fromTo(dot, { scale: 0 }, { scale: 0.12, ease: 'power2.out', duration: .25 }, 0)
      .to(sec.querySelector('.zoom-intro'), { autoAlpha: 0, y: -40, ease: 'power1.in', duration: .4 }, .3)
      .to(dot, { scale: cover, ease: 'power2.in', duration: .7 }, .3).scrollTrigger;
  };
  // depois do jogo, a frase final aparece recortada dentro da bolinha (cresce e diminui junto com ela)
  var lastR = -1; var porthole = function () { if (!done || !dot) return; var r = dot.getBoundingClientRect().width / 2; if (Math.abs(r - lastR) < .5) return; lastR = r; sec.style.setProperty('--zr', r.toFixed(1) + 'px'); sec.classList.toggle('show-final', r > 30); };
  var hookTick = function () { if (window.gsap) gsap.ticker.add(porthole); else setTimeout(hookTick, 200); }; hookTick();
  // frases de apoio da tela final sempre em duas linhas: largura = metade do texto
  var twoLines = function () { sec.querySelectorAll('.zp-s').forEach(function (el) { el.style.setProperty('max-width', 'min(92vw, ' + Math.ceil(el.textContent.trim().length / 2 + 2) + 'ch)', 'important'); }); };
  twoLines(); new MutationObserver(function () { setTimeout(twoLines, 50); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  // proteção: se por algum motivo a rolagem ficar presa depois do jogo, destrava no próximo toque/rolagem
  var unstick = function () { if (locked) return; if (document.querySelector('.lf.is-open') || document.querySelector('.smp-back.is-on')) return; document.documentElement.classList.remove('zg-lock'); var b = document.body.style; if (b.position === 'fixed' && !document.querySelector('.lf.is-open')) { b.position = b.top = b.left = b.right = b.width = ''; } if (window.__lenis && window.__lenis.isStopped) window.__lenis.start(); };
  ['touchstart', 'wheel', 'keydown'].forEach(function (ev) { addEventListener(ev, unstick, { passive: true, capture: true }); });
  if (document.readyState === 'complete') init(); else addEventListener('load', init);
  addEventListener('resize', function () { if (S && live) { var k = S.px / W, ky = S.py / H; resize(); S.px = S.tx = k * W; S.py = S.ty = ky * H; } });
})();
