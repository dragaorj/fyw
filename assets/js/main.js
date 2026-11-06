window.__fywTagBg = function (hex) { var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return hex; var n = parseInt(m[1], 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255]; var lum = function (a) { var v = a.map(function (x) { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; }; for (var k = 1; k >= .5; k -= .01) { var d = c.map(function (x) { return Math.round(x * k); }); if (1.05 / (lum(d) + .05) >= 4.6) return '#' + d.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); } return hex; };
/* =========================================================
   FIO — interações
   ========================================================= */
(function () {
  'use strict';

  const d = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const store = {
    get(k, f) { try { const v = localStorage.getItem(k); return v === null ? f : v; } catch (e) { return f; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const DICT = window.FIO_I18N || {};
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sysReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------------- Idioma ---------------- */
  let lang = (function () {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && DICT[q]) return q;
    const s = store.get('fio-lang', null);
    if (s && DICT[s]) return s;
    const n = (navigator.language || 'pt').slice(0, 2);
    return DICT[n] ? n : 'en';
  })();

  function applyTexts() {
    const t = DICT[lang];
    $$('[data-i18n]').forEach(el => { const v = t[el.dataset.i18n]; if (v !== undefined) el.textContent = v; });
    $$('[data-i18n-html]').forEach(el => { const v = t[el.dataset.i18nHtml]; if (v !== undefined) el.innerHTML = v; });
    $$('[data-i18n-aria]').forEach(el => { const v = t[el.dataset.i18nAria]; if (v !== undefined) el.setAttribute('aria-label', v); });
    d.lang = lang === 'pt' ? 'pt-BR' : lang;
    document.title = t['meta.title'];
    const md = $('meta[name="description"]'); if (md) md.content = t['meta.desc'];
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }

  $$('.lang button').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang; store.set('fio-lang', lang);
    if (window.__fywTypeRestart) setTimeout(window.__fywTypeRestart, 0);
    // troca instantânea: só o texto muda; títulos são re-divididos já no estado final
    applyTexts();
    if (motionOn) {
      $$('[data-split]').forEach(el => splitWords(el));
      const st = $('.statement'); if (st) splitStatement(st);
      refreshLater(50);
    }
  }));

  /* ---------------- Tema ---------------- */
  $('.theme-toggle').addEventListener('click', () => {
    const next = d.dataset.theme === 'dark' ? 'light' : 'dark';
    d.dataset.theme = next; store.set('fio-theme', next);
  });

  /* ---------------- Acessibilidade ---------------- */
  const a11y = Object.assign({ size: 1 }, (function () { try { return JSON.parse(store.get('fio-a11y', '{}')); } catch (e) { return {}; } })());
  const a11yBtn = $('.a11y-btn'), a11yPanel = $('#a11y-panel');
  function saveA11y() { store.set('fio-a11y', JSON.stringify(a11y)); }
  function renderA11y() {
    d.style.setProperty('--fs-scale', a11y.size);
    $('.a11y-size-val').textContent = Math.round(a11y.size * 100) + '%';
    ['contrast', 'motion', 'clean', 'links', 'spacing'].forEach(k => {
      d.classList.toggle('a11y-' + k, !!a11y[k]);
      const b = $(`.a11y-opt[data-opt="${k}"]`); if (b) b.setAttribute('aria-pressed', String(!!a11y[k]));
    });
  }
  // véu desfocado atrás de menus/painéis
  const veil = document.createElement('div');
  veil.className = 'page-veil'; veil.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil);
  function syncVeil() {
    const menuEl = $('#mobile-menu');
    const open = !a11yPanel.hidden || (menuEl && !menuEl.hidden);
    veil.classList.toggle('is-on', open);
    document.body.classList.toggle('veil-on', open);
  }
  function toggleA11yPanel(open) {
    a11yPanel.hidden = !open; a11yBtn.setAttribute('aria-expanded', String(open));
    syncVeil();
    if (open) $('.a11y-close', a11yPanel).focus(); else if (a11yBtn.offsetParent) a11yBtn.focus();
  }
  veil.addEventListener('click', () => {
    if (!a11yPanel.hidden) toggleA11yPanel(false);
    const mb = $('.menu-btn'); if (mb && mb.getAttribute('aria-expanded') === 'true') mb.click();
  });
  a11yBtn.addEventListener('click', () => window.__fywOpenA11y && window.__fywOpenA11y());
  $('.a11y-close').addEventListener('click', () => toggleA11yPanel(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !a11yPanel.hidden) toggleA11yPanel(false); });
  $$('.a11y-stepper button').forEach(b => b.addEventListener('click', () => {
    a11y.size = Math.min(1.5, Math.max(0.9, Math.round((a11y.size + Number(b.dataset.size) * 0.1) * 10) / 10));
    renderA11y(); saveA11y(); refreshLater();
  }));
  $$('.a11y-opt').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.opt; a11y[k] = !a11y[k];
    renderA11y(); saveA11y(); syncMotion();
  }));
  $('.a11y-reset').addEventListener('click', () => {
    Object.keys(a11y).forEach(k => delete a11y[k]); a11y.size = 1;
    renderA11y(); saveA11y(); syncMotion();
  });

  /* ---------------- Cookies ---------------- */
  const cookie = $('.cookie');
  function showCookie(v) { cookie.hidden = !v; document.body.classList.toggle('has-cookie', v); }
  function setConsent(v) { store.set('fio-consent', v); showCookie(false); /* aqui entram scripts de analytics se v === 'accepted' */ }
  $('.cookie-accept').addEventListener('click', () => setConsent('accepted'));
  $('.cookie-deny').addEventListener('click', () => setConsent('denied'));
  $$('.cookie-open').forEach(b => b.addEventListener('click', () => showCookie(true)));
  // o aviso só aparece depois que a pessoa rola e passa da seção Trabalhos (não cobre o topo nem o botão principal)
  if (!store.get('fio-consent', null)) {
    const work = $('.work');
    const onS = () => {
      const past = work ? work.getBoundingClientRect().bottom < innerHeight : window.scrollY > innerHeight * 1.5;
      if (past) { removeEventListener('scroll', onS); showCookie(true); }
    };
    addEventListener('scroll', onS, { passive: true });
  }

  /* ---------------- FAQ ---------------- */
  $$('.faq-q').forEach(q => q.addEventListener('click', () => {
    const open = q.getAttribute('aria-expanded') === 'true';
    $$('.faq-q').forEach(o => o.setAttribute('aria-expanded', 'false'));
    q.setAttribute('aria-expanded', String(!open));
    $$('.faq-item').forEach(it => it.classList.toggle('is-open', it.contains(q) && !open));
    refreshLater(600);
  }));

  /* ---------------- Trabalhos: toque no mobile ---------------- */
  if (!matchMedia('(hover: hover)').matches) {
    $$('.work-row').forEach(r => r.addEventListener('click', e => {
      if (!r.classList.contains('is-open')) {
        e.preventDefault();
        $$('.work-row').forEach(o => o.classList.remove('is-open'));
        r.classList.add('is-open'); refreshLater(700);
      }
    }));
  }
  // teclado: foco abre a linha
  $$('.work-row').forEach(r => {
    r.addEventListener('focus', () => r.classList.add('is-open'));
    r.addEventListener('blur', () => r.classList.remove('is-open'));
  });

  /* ---------------- Menu desktop: indicador deslizante + seção ativa ---------------- */
  const navLinks = $('.nav-links'), ind = $('.nav-ind'), pills = $$('.nav-links .pill');
  let activePill = null;
  function moveInd(p) {
    pills.forEach(x => x.classList.toggle('is-ind', x === p));
    if (!p) { ind.classList.remove('is-on'); return; }
    ind.style.left = p.offsetLeft + 'px'; ind.style.width = p.offsetWidth + 'px';
    ind.classList.add('is-on');
  }
  pills.forEach(p => {
    p.addEventListener('mouseenter', () => moveInd(p));
    p.addEventListener('focus', () => moveInd(p));
  });
  navLinks.addEventListener('mouseleave', () => moveInd(activePill));
  const spyTargets = pills.map(p => $(p.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const p = pills.find(x => x.getAttribute('href') === '#' + en.target.id);
        if (p) { activePill = p; if (!navLinks.matches(':hover')) moveInd(p); }
      });
      if (window.scrollY < window.innerHeight * 0.6) { activePill = null; if (!navLinks.matches(':hover')) moveInd(null); }
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach(t => io.observe(t));
  }
  addEventListener('resize', () => moveInd(navLinks.matches(':hover') ? pills.find(p => p.matches(':hover')) : activePill));

  /* ---------------- Clientes: filtros ---------------- */
  const wall = $('.logo-wall');
  $$('.lw-f').forEach(b => b.addEventListener('click', () => {
    $$('.lw-f').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', String(x === b)); });
    wall.dataset.filter = b.dataset.filter;
  }));

  /* ---------------- Menu mobile ---------------- */
  const menuBtn = $('.menu-btn'), menu = $('#mobile-menu');
  function setMenu(open) { if (!open && typeof setTab === 'function') setTimeout(() => setTab('main'), 300); menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); const dm = $('.dock-menu'); if (dm) dm.setAttribute('aria-expanded', String(open)); syncVeil(); }
  // na barra compacta (desktop, após rolar): o menu troca os links pelas opções, na própria barra
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  $('.no-theme').addEventListener('click', () => $('.theme-toggle').click());
  $('.no-a11y').addEventListener('click', () => window.__fywOpenA11y());
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  $('.mm-theme').addEventListener('click', () => $('.theme-toggle').click());
  // abas do menu: "Menu principal" e "Acessibilidade"
  const mmTabs = $$('.mm-tab', menu), mmPanes = $$('.mm-pane', menu);
  function setTab(name) {
    mmTabs.forEach(b => { const on = b.dataset.pane === name; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    mmPanes.forEach(p => { p.hidden = p.dataset.pane !== name; });
  }
  mmTabs.forEach(b => {
    b.addEventListener('click', () => setTab(b.dataset.pane));
    b.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const i = mmTabs.indexOf(b), n = mmTabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + mmTabs.length) % mmTabs.length]; setTab(n.dataset.pane); n.focus(); } });
  });
  window.__fywOpenA11y = () => { setTab('a11y'); if (menu.hidden) setMenu(true); };
  const mmA = $('.mm-a11y'); if (mmA) mmA.addEventListener('click', () => setTab('a11y'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------------- Voltar ao topo / âncoras ---------------- */
  function scrollToTarget(target) {
    if (lenis) { lenis.start(); lenis.scrollTo(target, { duration: 1.4, force: true, lock: false }); }
    else (typeof target === 'number' ? window.scrollTo({ top: target }) : target.scrollIntoView());
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = id === '#top' ? 0 : $(id);
    if (t === null) return;
    e.preventDefault(); scrollToTarget(t);
    if (typeof t !== 'number') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
  }));

  /* ---------------- Contadores (sempre) ---------------- */
  function setCountsFinal() { $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; }); }

  let refreshTimer;
  function refreshLater(ms = 120) {
    if (!hasGsap) return;
    clearTimeout(refreshTimer); refreshTimer = setTimeout(() => ScrollTrigger.refresh(), ms);
  }

  /* =========================================================
     MOVIMENTO (GSAP + Lenis)
     ========================================================= */
  let motionOn = false, ctx = null, lenis = null, tickerFn = null, firstRun = true;

  function wantsMotion() { return hasGsap && !sysReduced && !a11y.motion && !a11y.clean; }
  function syncMotion() {
    if (wantsMotion() && !motionOn) startMotion(false);
    else if (!wantsMotion() && motionOn) stopMotion();
    refreshLater();
  }

  // divide texto em palavras com máscara
  function splitWords(el) {
    // \n no texto vira quebra de linha
    const lines = el.textContent.trim().split(/\n/);
    el.innerHTML = lines.map(l => l.trim().split(/\s+/).map(w => `<span class="sw"><span>${w}</span></span>`).join(' ')).join('<br>');
    return $$('.sw > span', el);
  }
  // divide preservando chips (statement)
  function splitStatement(el) {
    const out = [];
    Array.from(el.childNodes).forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          const s = document.createElement('span'); s.className = 'word'; s.textContent = p; frag.appendChild(s); out.push(s);
        });
        el.replaceChild(frag, n);
      } else out.push(n);
    });
    return out;
  }

  function startMotion(intro) {
    if (!hasGsap) return;
    motionOn = true;
    gsap.registerPlugin(ScrollTrigger);

    if (typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 }); window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      window.fywLenis = lenis;
      tickerFn = t => lenis.raf(t * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const E = 'expo.out';

      /* --- Intro de carregamento --- */
      if (intro) {
        const tl = gsap.timeline({ defaults: { ease: E } });
        tl.from('.hero-stage', { clipPath: 'inset(5% 5% 5% 5% round 28px)', duration: 1.6 }, 0)
          .from('.aura i', { scale: 0.4, opacity: 0, duration: 2.2, stagger: 0.15 }, 0);
        // o menu do topo não entra animado: aparece sempre, desde o início
      }

      /* --- Hero: cards chegam numa pilha e abrem em leque. Ao rolar, cada card desce até a sua linha
             em Trabalhos e atravessa a linha "escrevendo" o nome do projeto --- */
      const fanEl = $('.hfan');
      const allCards = fanEl ? $$('.hf-card', fanEl) : [];
      const fCards = allCards.filter(el => getComputedStyle(el).display !== 'none');
      if (fCards.length) {
        const n = fCards.length, mid = (n - 1) / 2, mob = innerWidth < 600;
        const probe = document.createElement('i'); probe.className = 'hf-probe'; fanEl.appendChild(probe);
        // camada no documento (fora do hero, que corta o conteúdo)
        const layer = document.createElement('div'); layer.className = 'hf-layer'; layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
        allCards.forEach(el => { if (!fCards.includes(el)) el.remove(); });
        fCards.forEach(el => layer.appendChild(el));
        const PJ = window.FYW_PROJECTS || {}, TC = ['t-o', 't-v', 't-b'];
        fCards.forEach((el, i) => {
          const pj = PJ[el.dataset.project]; if (!pj) return;
          let tag = el.querySelector('.hf-tag');
          if (!tag) { tag = document.createElement('span'); tag.className = 'hf-tag ' + TC[i % 3]; el.appendChild(tag); }
          tag.textContent = pj.name; const tt = document.createElement("span"); tt.className = "hf-tt"; tt.textContent = " · " + pj.type; tag.appendChild(tt); if (pj.color) { tag.style.setProperty('--tc', pj.ink ? pj.color : window.__fywTagBg(pj.color), 'important'); tag.style.setProperty('color', pj.ink || '#fff', 'important'); }
        });
        const ROT = fCards.map(el => parseFloat(el.style.getPropertyValue('--r')) || 0);
        const PILE = [-6, 4, -2, 7, -4, 3, -7, 5, -3];
        const S = fCards.map(() => ({ x: 0, y: 0, r: 0, s: 1, a: 1 }));
        // celular: o leque mostra todos os cards e dá para arrastar para os lados (pan)
        const H = { pan: 0, to: 0 };
        const fanOff = (i, w) => { const sp = w * (mob ? 0.64 : 0.6); return { x: (i - mid) * sp, y: Math.abs(i - mid) * w * (mob ? 0.03 : 0.05), r: ROT[i] }; };
        const pile = i => ({ x: (i % 3 - 1) * 4, y: 0, r: PILE[i % PILE.length] });
        // card i -> linha de trabalho (os 5 do meio vão para as 5 linhas; os outros saem de cena)
        const rowsAll = $$('.work-row');
        // a lista mostra no máximo uma linha por card visível (no celular há menos cards)
        // celular e computador mostram os mesmos 5 projetos sorteados
        rowsAll.forEach((r, k) => { r.hidden = k >= Math.min(5, n); });
        const rows = rowsAll.filter(r => !r.hidden);
        // cada card vai para a linha do MESMO projeto (a foto que passa na linha é sempre a do projeto certo);
        // projeto sem card cai no esquema antigo por posição
        const slugOf = r => (r.getAttribute('href') || '').split('/').pop().replace('.html', '');
        const rowBySlug = {}; rows.forEach((r, k) => { rowBySlug[slugOf(r)] = k; });
        const firstMapped = rows.length >= n ? 0 : Math.max(0, Math.round(mid) - Math.floor(rows.length / 2));
        const allMatch = rows.every(r => fCards.some(c => c.dataset.project === slugOf(r)));
        const rowOf = i => { if (allMatch) { const k = rowBySlug[fCards[i].dataset.project]; return k === undefined ? -1 : k; } const k = i - firstMapped; return k >= 0 && k < rows.length ? k : -1; };
        // letras dos nomes (para "escrever" quando o card passa)
        rows.forEach(r => { $$('.wr-title > span:not(.wr-thumb)', r).forEach(sp => { const t = sp.textContent; sp.innerHTML = [...t].map(ch => '<span class="wch">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>').join(''); }); });
        const docPos = el => { let x = 0, y = 0, e = el; while (e) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; };
        let G = null;
        const measure = () => {
          const f = docPos(fanEl), fw = probe.offsetWidth || 150;
          const heroH = $('.hero').offsetHeight;
          G = { fx: f.x + f.w / 2, fy: f.y + f.h / 2, fw, heroH, vh: innerHeight, workTop: docPos($('.work')).y,
            rows: rows.map(r => { const t = $('.wr-title', r); const p = docPos(t); const chars = $$('.wch', t).map(ch => { const q = docPos(ch); return { el: ch, x: q.x + q.w / 2 }; });
              const hh = Math.min(p.h * 0.95, mob ? 64 : 120); return { t, x: p.x, y: p.y + p.h / 2, w: p.w, h: hh, cw: hh * 1.32, chars, cy: docPos(r).y + r.offsetHeight / 2 }; }) };
        };
        const ease = gsap.parseEase('power3.inOut'), easeO = gsap.parseEase('power2.out');
        const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
        const lerp = (p, q, t) => p + (q - p) * t;
        rows.forEach(r => $('.wr-title', r).classList.add('is-typing')); document.documentElement.classList.add('hf-written-gate');
        let lastY = -1, dirty = true;
        const A = { p: 0 };
        let capture = null, namesOn = false, workOn = false;
        // p: 0..0.25 junta na pilha | depois cada card (na ordem das linhas) desce e atravessa sua linha
        const GATHER = 0.25, STEP = 0.1;
        const render = () => {
          if (!G) measure();
          fCards.forEach((el, i) => {
            const st = S[i];
            const tg0 = ease(clamp01(A.p / GATHER));
            let cx = G.fx + st.x + (mob ? H.pan * (1 - tg0) : 0), cy = G.fy + st.y, w = G.fw * st.s, hgt = w, rot = st.r, op = st.a, rad = 14;
            const k = rowOf(i);
            // 1) junta todos no meio, um em cima do outro
            const pl = pile(i), tg = ease(clamp01(A.p / GATHER));
            cx = lerp(cx, G.fx + pl.x, tg); cy = lerp(cy, G.fy + pl.y, tg); rot = lerp(rot, pl.r, tg);
            if (k < 0) {
              // os que não têm linha somem dentro da pilha
              const tx = clamp01((A.p - GATHER * 0.85) / 0.15);
              op *= 1 - tx; w *= 1 - tx * 0.3; hgt = w;
            } else {
              const R = G.rows[k];
              const sx = R.x - R.cw / 2 - 14, ex = R.x + R.w + R.cw / 2 + 14;
              // 2) sai da pilha e desce até a sua linha (um por um)
              const tA = ease(clamp01((A.p - GATHER - k * STEP) / 0.35));
              // 3) atravessa a linha escrevendo o nome
              const tB = easeO(clamp01((A.p - GATHER - 0.3 - k * STEP) / 0.35));
              cx = lerp(cx, sx, tA); cy = lerp(cy, R.y, tA);
              w = lerp(w, R.cw, tA); hgt = lerp(hgt, R.h, tA); rot = lerp(rot, 0, tA); rad = lerp(14, 16, tA);
              if (tB > 0) {
                cx = lerp(sx, ex, tB);
                const fade = clamp01((tB - 0.82) / 0.18);
                op *= 1 - fade; const sh = 1 - fade * 0.35; w *= sh; hgt *= sh; rot = -fade * 6;
              }
              const edge = cx - w * 0.15;
              if (!capture) R.chars.forEach(ch => { const on = tB >= 1 || (tB > 0 && ch.x < edge); if (on !== !!ch.on) { ch.on = on; ch.el.classList.toggle('on', on); } });
              if (!capture) {
                const row = R.t.closest('.work-row');
                const done = tB >= 1; if (done !== R.done) { R.done = done; row.classList.toggle('is-written', done); }
                const arr = tB > 0; if (arr !== R.arr) { R.arr = arr; row.classList.toggle('is-arrived', arr); }
              }
            }
            // na pilha, o próximo a descer fica por cima
            const z = A.p > 0.02 ? (k < 0 ? 1 : 100 - k) : (mob ? 50 - Math.round(Math.abs(i - mid + H.pan / (G.fw * 0.64)) * 10) : baseZ[i]);
            const props = { x: cx - w / 2, y: cy - hgt / 2, width: w, height: hgt, rotation: rot, autoAlpha: op, '--fr': rad + 'px', zIndex: z };
            if (capture) { capture[i] = props; return; }
            gsap.set(el, props);
            el.classList.toggle('is-live', A.p < 0.01);
            const tag = el.querySelector('.hf-tag.is-rest'); if (tag) tag.style.opacity = String(clamp01(1 - A.p / 0.12) * (st.tag ?? 1));
          });
        };
        // intro: pilha -> leque (anima o estado S; o render desenha)
        const L = () => fCards.map((el, i) => fanOff(i, G ? G.fw : 150));
        measure();
        const FL = L();
        if (intro) {
          S.forEach((st, i) => Object.assign(st, { x: pile(i).x, y: innerHeight * 0.55, r: pile(i).r - 24, s: 0.86, a: 0, tag: 0 }));
          gsap.timeline({ delay: 0.45, onUpdate: () => { dirty = true; } })
            .to(S, { y: 0, r: i => pile(i).r, a: 1, s: 0.92, duration: 1.1, ease: 'expo.out', stagger: { each: 0.07, from: 'end' } })
            .to(S, { x: i => FL[i].x, y: i => FL[i].y, r: i => FL[i].r, s: 1, duration: 1.3, ease: 'expo.inOut', stagger: { each: 0.035, from: 'center' } }, '+=0.12')
            .to(S, { tag: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3');
          gsap.from('.hf-tag', { scale: 0, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.14, delay: 3.1 });
        } else S.forEach((st, i) => Object.assign(st, { x: FL[i].x, y: FL[i].y, r: FL[i].r }));
        const baseZ = fCards.map((el, i) => mob ? 50 - Math.round(Math.abs(i - mid) * 10) : (el.querySelector('.hf-tag') ? 40 + i : i + 1));
        fCards.forEach((el, i) => { el.style.zIndex = baseZ[i]; });
        // etiqueta nunca fica atrás de outro card: se o vizinho da esquerda está na frente, ela vai para o canto direito
        fCards.forEach((el, i) => { const tag = el.querySelector('.hf-tag'); if (!tag) return;
          if (mob) tag.classList.add('is-rest');
          tag.classList.toggle('at-right', i > 0 && baseZ[i - 1] > baseZ[i]); });

        // etiqueta acompanha o card no hover e segue o mouse (magnética), voltando com mola ao sair
        // foco: ao passar o mouse num card, o resto do hero desfoca suavemente e o card cresce
        if (finePointer) fCards.forEach(card => {
          card.addEventListener('mouseenter', () => { if (!card.classList.contains('is-live')) return; card.classList.add('is-hot'); document.documentElement.classList.add('hf-focus'); });
          card.addEventListener('mouseleave', () => { card.classList.remove('is-hot'); document.documentElement.classList.remove('hf-focus'); });
        });
        if (finePointer) fCards.forEach(card => {
          const tag = card.querySelector('.hf-tag'); if (!tag) return;
          const o = { x: 0, y: 0, s: 1, r: 0 };
          const apply = () => { tag.style.setProperty('--tx', o.x.toFixed(1) + 'px'); tag.style.setProperty('--ty', o.y.toFixed(1) + 'px'); tag.style.setProperty('--ts', o.s.toFixed(3)); tag.style.setProperty('--tr', o.r.toFixed(2) + 'deg'); };
          // no hover a etiqueta vai para perto do cursor (acima e à direita) e o acompanha
          const follow = e => {
            const tr = tag.getBoundingClientRect();
            const dx = (e.clientX + 10) - tr.left, dy = (e.clientY - tr.height - 12) - tr.top;
            const th = (gsap.getProperty(card, 'rotation') || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
            gsap.to(o, { x: o.x + dx * c + dy * s, y: o.y - dx * s + dy * c, r: 0, s: 1.06, duration: 0.3, ease: 'power3.out', overwrite: 'auto', onUpdate: apply });
          };
          card.addEventListener('mouseenter', follow);
          card.addEventListener('mousemove', follow);
          card.addEventListener('mouseleave', () => gsap.to(o, { x: 0, y: 0, s: 1, r: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto', onUpdate: apply }));
        });
        // a viagem anda sozinha devagar e acelera conforme a velocidade do scroll; ao voltar ao topo, retorna rápido
        const PMAX = 1.45;
        // o scroll controla a animação: desce = avança, sobe = volta (na mesma medida)
        // posição da rolagem guardada só quando a página rola: ler window.scrollY a cada quadro forçava
        // o navegador a recalcular estilo e layout 120x por segundo, mesmo com a página parada
        let curY = window.scrollY;
        addEventListener('scroll', () => { curY = window.scrollY; }, { passive: true });
        addEventListener('resize', () => { curY = window.scrollY; }, { passive: true });
        gsap.ticker.add(() => {
          const y = curY;
          const target = clamp01(y / (G.heroH * 0.9)) * PMAX;
          const d = target - A.p;
          if (Math.abs(d) > 0.0004) { A.p += d * 0.2; dirty = true; } else if (A.p !== target) { A.p = target; dirty = true; }
          if (mob && H.pan !== H.to) { const dp = H.to - H.pan; H.pan = Math.abs(dp) < 0.3 ? H.to : H.pan + dp * 0.22; dirty = true; }
          // os nomes só se apagam quando a lista sai da tela e sobra só o hero
          if (namesOn && G.workTop > y + innerHeight) {
            namesOn = false; G.rows.forEach(R => R.chars.forEach(ch => { if (ch.on) { ch.on = false; ch.el.classList.remove('on'); } }));
          }
          if (dirty || y !== lastY) { lastY = y; dirty = false; render(); const on = A.p > GATHER; if (on !== workOn) { workOn = on; $('.work').classList.toggle('is-on', on); } }
        });
        // celular: arrastar o leque para os lados (o card mais perto do centro vem para a frente); ao soltar, encaixa num card
        if (mob) {
          const spX = () => G.fw * 0.64, maxP = () => mid * spX();
          const clampP = v => Math.max(-maxP(), Math.min(maxP(), v));
          let t0 = null, moved = false;
          const onFan = t => { if (A.p > 0.02) return false; const r = fanEl.getBoundingClientRect(); return t.clientY >= r.top - 20 && t.clientY <= r.bottom + 20; };
          addEventListener('touchstart', e => { const t = e.touches[0]; if (e.touches.length !== 1 || !onFan(t)) { t0 = null; return; } t0 = { x: t.clientX, y: t.clientY, p: H.to, ax: 0, lx: t.clientX, lt: performance.now(), v: 0 }; moved = false; }, { passive: true });
          addEventListener('touchmove', e => {
            if (!t0) return; const t = e.touches[0], dx = t.clientX - t0.x, dy = t.clientY - t0.y;
            if (!t0.ax) { if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; t0.ax = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; }
            if (t0.ax !== 'x') return;
            e.preventDefault(); moved = true;
            const now = performance.now(); t0.v = (t.clientX - t0.lx) / Math.max(1, now - t0.lt); t0.lx = t.clientX; t0.lt = now;
            const raw = t0.p + dx, m = maxP();
            H.to = raw > m ? m + (raw - m) * 0.3 : raw < -m ? -m + (raw + m) * 0.3 : raw; H.pan = H.to; dirty = true;
          }, { passive: false });
          addEventListener('touchend', () => {
            if (!t0) return; if (t0.ax === 'x') { const s = spX(); H.to = clampP(Math.round((H.to + t0.v * 220) / s) * s); } t0 = null;
          }, { passive: true });
          // depois de arrastar, o toque não abre o projeto
          document.addEventListener('click', e => { if (moved && e.target.closest && e.target.closest('.hf-card')) { e.preventDefault(); e.stopImmediatePropagation(); } moved = false; }, true);
        }
        const remeasure = () => { measure(); const F2 = L(); if (!intro || S[0].a === 1) S.forEach((st, i) => Object.assign(st, { x: F2[i].x, y: F2[i].y, r: F2[i].r })); dirty = true; };
        addEventListener('resize', () => { clearTimeout(window.__hfR); window.__hfR = setTimeout(remeasure, 150); });
        ScrollTrigger.addEventListener('refresh', () => { measure(); dirty = true; });
        document.fonts && document.fonts.ready.then(() => { measure(); dirty = true; });
        gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 } })
          .fromTo('.hero .hero-content', { opacity: 1, y: 0 }, { opacity: 0.15, y: -30, ease: 'none', immediateRender: false }, 0);
        // parallax: o vídeo do fundo fica parado enquanto o conteúdo do hero rola por cima
        gsap.to('.hero-video', { y: () => $('.hero').offsetHeight, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      }
      if (finePointer) {
        const stage = $('.hero-stage');
        const au = $$('.aura i:not(.a4)').map((el, i) => ({
          x: gsap.quickTo(el, 'x', { duration: 2.4, ease: 'power3' }),
          y: gsap.quickTo(el, 'y', { duration: 2.4, ease: 'power3' }),
          k: [1, -1, 0.7][i] || 1
        }));
        const glow = $('.aura .a4');
        const gx = gsap.quickTo(glow, 'x', { duration: 1.1, ease: 'power3' });
        const gy = gsap.quickTo(glow, 'y', { duration: 1.1, ease: 'power3' });
        const fanX = () => {};
        stage.addEventListener('mouseenter', () => stage.classList.add('is-pointer'));
        stage.addEventListener('mouseleave', () => { stage.classList.remove('is-pointer'); au.forEach(a => { a.x(0); a.y(0); }); fanX(0); });
        stage.addEventListener('mousemove', e => {
          const r = stage.getBoundingClientRect();
          const px = e.clientX - r.left, py = e.clientY - r.top;
          const nx = px / r.width - 0.5, ny = py / r.height - 0.5;
          au.forEach(a => { a.x(nx * 160 * a.k); a.y(ny * 120 * a.k); });
          gx(px); gy(py);
          fanX(nx * -40);
        });
      }

      const Q = []; const chunk = f => Q.push(f);
      chunk(() => {
      /* --- Textos: parágrafos surgem palavra a palavra, com blur suave --- */
      const blurWords = el => {
        // mantém negrito/itálico: cada palavra vira um span, preservando os espaços originais
        const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const wrap = s => esc(s).replace(/\S+/g, w => '<span class="bw">' + w + '</span>');
        el.innerHTML = [...el.childNodes].map(n => n.nodeType === 1
          ? '<' + n.localName + '>' + wrap(n.textContent) + '</' + n.localName + '>'
          : wrap(n.textContent)).join('').trim();
        return $$('.bw', el);
      };
      const heroSub = $('.hero-sub');
      if (heroSub) gsap.from(blurWords(heroSub), { y: 10, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.02, delay: intro ? 0.3 : 0.1 });
      $$('.zoom-sub, .clients-sub, .story-text p, .proc-card p, .pillar p, .svc p, .stat span, .t-head p, .faq-head p').forEach(el => chunk(() => {
        if (!el.textContent.trim() || el.querySelector(':not(strong):not(b):not(em)')) return;
        const w = blurWords(el);
        gsap.from(w, { opacity: 0, y: 14, filter: 'blur(8px)', duration: 1.3, ease: 'power2.out', stagger: 0.035, clearProps: 'filter',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      }));
      // título da galeria: palavras sobem por trás de uma máscara quando a imagem abre
      const zt = $('.zoom-title');
      if (zt) splitWords(zt).forEach((s, i) => s.style.setProperty('--wi', i));

      });
      chunk(() => {
      /* --- Títulos palavra a palavra --- */
      $$('[data-split]').forEach(el => {
        const w = splitWords(el);
        gsap.from(w, { yPercent: 110, rotate: 4, duration: 1.7, ease: 'power3.out', stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 85%' } });
      });

      });
      chunk(() => {
      /* --- Statement: palavras acendem com o scroll --- */
      const st = $('.statement');
      const parts = splitStatement(st);
      const words = parts.filter(p => p.classList && p.classList.contains('word'));
      const chips = parts.filter(p => p.classList && p.classList.contains('chip'));
      gsap.set(words, { opacity: 0.45 });
      gsap.set(chips, { scale: 0, width: 0 });
      const stl = gsap.timeline({ scrollTrigger: { trigger: st, start: 'top 82%', end: 'bottom 30%', scrub: 1.4 } });
      parts.forEach((p, i) => {
        if (p.classList && p.classList.contains('chip')) stl.to(p, { scale: 1, width: '1.05em', ease: 'power2.inOut', duration: 2.4 }, i * 0.5);
        else if (p.classList && p.classList.contains('word')) stl.to(p, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, i * 0.5);
      });

      });
      chunk(() => {
      /* --- Números --- */
      $$('[data-count]').forEach(el => {
        const o = { v: 0 };
        gsap.to(o, { v: +el.dataset.count, duration: 2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => { el.textContent = Math.round(o.v); } });
      });
      gsap.from('.stat', { y: 40, opacity: 0, duration: 1.2, ease: E, stagger: 0.08, scrollTrigger: { trigger: '.stats', start: 'top 88%' } });


      });
      chunk(() => {
      /* --- História --- */
      gsap.from('.story-year span', { yPercent: 100, duration: 1.4, ease: E, stagger: 0.08, scrollTrigger: { trigger: '.story-year', start: 'top 85%' } });
      gsap.fromTo('.story-year', { yPercent: 0 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true } });
      if (false) gsap.from('.story-text p', { y: 30, opacity: 0, duration: 1.1, ease: E, stagger: 0.12, scrollTrigger: { trigger: '.story-text', start: 'top 85%' } });
      gsap.from('.story-quote', { clipPath: 'inset(0 100% 0 0 round 20px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.story-quote', start: 'top 85%' } });
      gsap.from('.pillar', { y: 80, opacity: 0, duration: 1.2, ease: E, stagger: 0.1, scrollTrigger: { trigger: '.pillars', start: 'top 85%' } });

      });
      chunk(() => {
      /* --- Como funciona: trilha em gradiente preenche suave com a rolagem; cards entram em sequência --- */
      const cards = $$('.proc-card');
      if (cards.length) {
        gsap.from(cards, { y: 60, autoAlpha: 0, duration: 1.6, ease: 'expo.out', stagger: 0.14, scrollTrigger: { trigger: '.proc', start: 'top 85%' } });
        const setOn = p => cards.forEach((c, i) => c.classList.toggle('is-on', p >= (i / (cards.length - 1)) - 0.001 && p > 0.001));
        const fill = $('.proc-fill');
        if (fill && getComputedStyle($('.proc-track')).display !== 'none') {
          gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none',
            scrollTrigger: { trigger: '.proc', start: 'top 78%', end: 'top 30%', scrub: 1.6, onUpdate: self => setOn(self.progress) } });
        } else {
          cards.forEach(c => ScrollTrigger.create({ trigger: c, start: 'top 75%', onEnter: () => c.classList.add('is-on'), onLeaveBack: () => c.classList.remove('is-on') }));
        }
      }
      gsap.from('.svc-cta', { y: 30, opacity: 0, duration: 1, ease: E, scrollTrigger: { trigger: '.svc-cta', start: 'top 92%' } });

      });
      chunk(() => {
      /* --- Blocos com inclinação 3D seguindo o mouse --- */
      if (finePointer) {
        $$('.pillar, .story-quote, .proc-card').forEach(el => {
          gsap.set(el, { transformPerspective: 900 });
          const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
          const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
          el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
            ry((nx - 0.5) * 12); rx((0.5 - ny) * 10);
            el.style.setProperty('--mx', nx * 100 + '%'); el.style.setProperty('--my', ny * 100 + '%');
          });
          el.addEventListener('mouseleave', () => { rx(0); ry(0); });
        });
      }

      });
      chunk(() => {
      /* --- Serviços --- */
      gsap.from('.svc', { y: 60, opacity: 0, duration: 1.2, ease: E, stagger: 0.08, scrollTrigger: { trigger: '.svc-list', start: 'top 85%' } });

      });
      chunk(() => {
      /* --- Trabalhos --- */

      });
      chunk(() => {
      /* --- Galeria: colunas em parallax, grade cresce, card central ocupa a tela --- */
      const center = $('.zg-center');
      const tiles = $$('.zg');
      const others = tiles.filter(x => x !== center);
      const coverScale = () => Math.max(innerWidth / center.offsetWidth, innerHeight / center.offsetHeight) * 1.12;
      // (a grade foi trocada pelo mini game: sem o card central, nada disso roda)
      if (center) mm.add({ sm: '(max-width: 599px)', md: '(min-width: 600px)' }, cnd => {
        const cols = cnd.conditions.sm ? 3 : 5;
        const mid = Math.floor(cols / 2);
        const colY = el => { const ci = tiles.indexOf(el) % cols; return ci === mid ? 0 : (ci % 2 ? -1 : 1) * (cnd.conditions.sm ? 50 : 90); };
        // frases gigantes: depois que a tela do meio ocupa tudo, cenas de tipografia entram uma por uma com a rolagem
        const show = $('.zshow'), scenes = show ? $$('.zk', show) : [];
        const SC = 1.2, S0 = 1.95, N = scenes.length, END = S0 + N * SC + 0.9;
        // quebra a palavra em letras; algumas letras ganham imagens dos projetos por dentro
        const splitWord = w => {
          const sc = w.closest('.zk'), imgs = (sc.dataset.imgs || '').split(',').filter(Boolean), sw = w.dataset.swap, all = w.classList.contains('zk-all');
          const txt = (w.textContent || '').trim(); w.setAttribute('aria-label', txt); w.__busy = true; w.innerHTML = ''; let k = 0;
          [...txt].forEach((ch, i) => {
            const sp = document.createElement('span'); sp.className = 'zl'; sp.setAttribute('aria-hidden', 'true');
            if (ch === ' ') { sp.classList.add('zsp'); w.appendChild(sp); return; }
            const isImg = all || (sw === '-1' ? /[O0]/i.test(ch) : +sw === i);
            if (isImg && imgs.length) { sp.classList.add('zi'); const list = all ? [imgs[k++ % imgs.length]] : imgs; list.forEach(u => { const b = document.createElement('b'); b.textContent = ch; b.style.backgroundImage = 'url(' + u + ')'; sp.appendChild(b); }); }
            else sp.textContent = ch;
            w.appendChild(sp);
          });
          w.__busy = false;
        };
        const fitWord = w => { w.style.setProperty('--fs', '100px'); w.style.width = 'max-content'; w.style.padding = '0'; const cw = (w.parentElement.clientWidth || innerWidth) * 0.97, ww = w.getBoundingClientRect().width || w.offsetWidth || 1; w.style.width = ''; w.style.padding = ''; const fs = Math.min(100 * cw / ww, innerHeight * 0.5 / 0.84); w.style.setProperty('--fs', fs.toFixed(1) + 'px'); };
        const words = show ? $$('.zk-word', show) : [];
        words.forEach(w => { splitWord(w); new MutationObserver(() => { if (w.__busy) return; if (!w.querySelector('.zl')) { splitWord(w); fitWord(w); ScrollTrigger.refresh(); } }).observe(w, { childList: true }); });
        const fitAll = () => words.forEach(fitWord); fitAll();
        if (document.fonts && document.fonts.load) document.fonts.load('400 100px Anton').then(() => { fitAll(); ScrollTrigger.refresh(); });
        addEventListener('resize', () => { clearTimeout(window.__zkF); window.__zkF = setTimeout(fitAll, 150); });
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.zoom-pin', start: 'top top', end: () => '+=' + Math.round(END * (cnd.conditions.sm ? 75 : 85)) + '%', scrub: 0.8, pin: '.zoom-pin', invalidateOnRefresh: true } })
          .fromTo('.zoom-grid', { scale: 0.82 }, { scale: 1, ease: 'power1.inOut', duration: 0.6 }, 0)
          .fromTo(others, { y: 0 }, { y: (i, el) => -colY(el), ease: 'none', duration: 0.8 }, 0.15)
          .to(others, { filter: 'blur(10px)', ease: 'power1.in', duration: 0.55 }, 0.45)
          .to(others, { scale: 0.7, opacity: 0, ease: 'power1.in', duration: 0.6, stagger: { each: 0.025, from: 'center' } }, 0.85)
          .to(center, { scale: coverScale, borderRadius: 0, ease: 'power2.inOut', duration: 1 }, 0.95);
        if (show && N) {
          const bar = $('.zs-progress i', show);
          // cada cena entra com uma "cortina" diferente
          const WIPE = [['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'], ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'], ['circle(0% at 50% 50%)', 'circle(150% at 50% 50%)'], ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'], ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)']];
          tl.fromTo(show, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none', onStart: () => show.classList.add('is-live'), onReverseComplete: () => show.classList.remove('is-live') }, 1.75)
            .fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: N * SC }, S0);
          scenes.forEach((sc, i) => {
            const t = S0 + i * SC, w = $('.zk-word', sc), notes = $$('.zk-note, .zk-small', sc), wp = WIPE[i % WIPE.length];
            tl.set(sc, { visibility: 'visible' }, t - 0.001)
              .fromTo(sc, { clipPath: wp[0] }, { clipPath: wp[1], duration: i ? 0.32 : 0.2, ease: 'power3.inOut' }, t)
              .fromTo(notes, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.22, stagger: 0.05, ease: 'power2.out' }, t + 0.3);
            if (i > 0) tl.set(scenes[i - 1], { visibility: 'hidden' }, t + 0.34);
            const L = () => w ? $$('.zl', w) : [];
            if (i === 0 && w) { // letras sobem uma a uma; a letra com imagem troca de projeto
              tl.fromTo(L(), { yPercent: 110 }, { yPercent: 0, duration: 0.4, stagger: 0.04, ease: 'power3.out' }, t + 0.05);
              const bs = $$('.zi > b', w); bs.forEach((b, j) => { if (j) tl.to(b, { opacity: 1, duration: 0.05, ease: 'none' }, t + 0.45 + j * ((SC - 0.5) / bs.length)); });
              tl.to(w, { scale: 1.03, duration: SC - 0.3, ease: 'none' }, t + 0.3);
            } else if (i === 1 && w) { // a frase atravessa a tela
              tl.fromTo(w, { xPercent: 35, skewX: -8 }, { xPercent: -35, skewX: 0, duration: SC + 0.2, ease: 'none' }, t);
            } else if (i === 2 && w) { // letras viram uma a uma, cada uma com um projeto dentro
              tl.fromTo(L(), { rotateX: -95, yPercent: 30, autoAlpha: 0, transformPerspective: 800, transformOrigin: '50% 100%' }, { rotateX: 0, yPercent: 0, autoAlpha: 1, duration: 0.3, stagger: { each: 0.03, from: 'random' }, ease: 'back.out(1.6)' }, t + 0.12)
                .to($$('.zi > b', w), { backgroundPosition: '80% 50%', duration: SC - 0.3, ease: 'none' }, t + 0.3);
            } else if (i === 3 && w) { // número gigante chega de perto e encaixa
              tl.fromTo(w, { scale: 3.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'expo.out' }, t + 0.05)
                .to(w, { scale: 0.92, duration: SC - 0.5, ease: 'none' }, t + 0.5);
            } else if (i === 4) { // nomes dos clientes correndo em sentidos opostos
              const rows = $$('.zk-row', sc);
              if (rows[0]) tl.fromTo(rows[0], { xPercent: 10 }, { xPercent: -45, duration: SC + 0.4, ease: 'none' }, t);
              if (rows[1]) tl.fromTo(rows[1], { xPercent: -10 }, { xPercent: 45, duration: SC + 0.4, ease: 'none' }, t);
            }
          });
          tl.to(show, { autoAlpha: 0, duration: 0.25, ease: 'none', onComplete: () => show.classList.remove('is-live'), onReverseComplete: () => show.classList.add('is-live') }, S0 + N * SC);
        }
        // pular a apresentação: vai direto para o fim (texto final + botão)
        const skip = show && $('.zs-skip', show);
        if (skip) skip.onclick = () => { const st = tl.scrollTrigger; if (!st) return; const y = st.start + (st.end - st.start) * ((S0 + N * SC + 0.5) / END); if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 }); else scrollTo({ top: y, behavior: 'smooth' }); };
        const FIN = show && N ? S0 + N * SC : 1.75;
        tl.to(center, { '--shade': 1, ease: 'none', duration: 0.3 }, FIN - 0.1)
          .fromTo('.zoom-final', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.35, onStart: () => $('.zoom').classList.add('is-final'), onReverseComplete: () => $('.zoom').classList.remove('is-final') }, FIN + 0.1)
          .set({}, {}, END);
      });
      // onda: ondula ao redor do cursor; mais forte com movimento rápido, acalma quando para
      if (false && finePointer) { // efeito de onda desativado (pesava)
        const zc = $('.zg-center'), turb = document.getElementById('wave-turb'), disp = document.getElementById('wave-disp');
        const st = { amp: 0, t: 0, lx: 0, ly: 0 };
        let active = false;
        const tick = () => {
          st.t += 0.006;
          st.amp += (0 - st.amp) * 0.02;
          const target = active ? Math.max(st.amp, 20) : st.amp;
          disp.setAttribute('scale', target.toFixed(1));
          turb.setAttribute('baseFrequency', (0.0028 + Math.sin(st.t) * 0.0008).toFixed(4) + ' ' + (0.009 + Math.cos(st.t * 0.8) * 0.0025).toFixed(4));
          if (!active && st.amp < 0.3) { gsap.ticker.remove(tick); zc.classList.remove('is-waving'); }
        };
        $('.zoom-pin').addEventListener('mousemove', e => {
          if (!$('.zoom').classList.contains('is-final')) return;
          const r = zc.getBoundingClientRect(), sc = r.width / zc.offsetWidth || 1;
          zc.style.setProperty('--wx', ((e.clientX - r.left) / sc) + 'px');
          zc.style.setProperty('--wy', ((e.clientY - r.top) / sc) + 'px');
          zc.style.setProperty('--wr', (680 / sc) + 'px');
          const v = Math.hypot(e.clientX - st.lx, e.clientY - st.ly); st.lx = e.clientX; st.ly = e.clientY;
          st.amp = Math.min(55, st.amp + v * 0.3);
          if (!active) { active = true; zc.classList.add('is-waving'); gsap.ticker.add(tick); }
        });
        $('.zoom-pin').addEventListener('mouseleave', () => { active = false; });
      }
      gsap.from('.zoom:not(.zoom-stack) .zoom-intro > *', { y: 30, opacity: 0, duration: 1.1, ease: E, stagger: 0.1, scrollTrigger: { trigger: '.zoom', start: 'top 70%' } });

      });
      chunk(() => {
      /* --- Clientes: playground com física (carrega Matter.js sob demanda) --- */
      // parede de logos: entrada em sequência + brilho que segue o mouse
      gsap.from('.lw-cell', { opacity: 0, y: 24, duration: 1, ease: E, stagger: { each: 0.05, from: 'start' }, scrollTrigger: { trigger: '.logo-wall', start: 'top 85%' } });
      if (finePointer) {
        $$('.lw-cell').forEach(cell => cell.addEventListener('mousemove', e => {
          const r = cell.getBoundingClientRect();
          cell.style.setProperty('--cx', (e.clientX - r.left) + 'px'); cell.style.setProperty('--cy', (e.clientY - r.top) + 'px');
        }));
      }

      });
      chunk(() => {
      /* --- Depoimentos --- */
      gsap.from('.t-col', { y: 80, opacity: 0, duration: 1.3, ease: E, stagger: 0.12, scrollTrigger: { trigger: '.testimonials', start: 'top 75%' } });

      });
      chunk(() => {
      /* --- Faixa: marquee guiado pela velocidade --- */
      // todas as faixas: a de cima corre no sentido contrário
      $$('.band-wrap').forEach((wrap, k) => {
        const track = $('.band-track', wrap), set = $('.band-set', wrap); if (!track || !set) return;
        if (track.children.length < 2) { const c2 = set.cloneNode(true); c2.setAttribute('aria-hidden', 'true'); track.appendChild(c2); }
        const dir = wrap.classList.contains('band-top') ? -1 : 1;
        // cópia colorida do texto (aparece só onde o mouse está) andando junto com a faixa
        const hi = $('.band-hi', wrap); let tracks = track;
        if (hi && !hi.firstChild) { const tc = track.cloneNode(true); hi.appendChild(tc); tracks = [track, tc]; }
        const loop = dir > 0 ? gsap.to(tracks, { xPercent: -50, ease: 'none', duration: 26, repeat: -1, paused: true }) : gsap.fromTo(tracks, { xPercent: -50 }, { xPercent: 0, ease: 'none', duration: 26, repeat: -1, paused: true });
        ScrollTrigger.create({
          trigger: wrap, start: 'top bottom', end: 'bottom top',
          // a faixa só anda enquanto aparece na tela (antes rodava sem parar e ocupava o processador o tempo todo)
          onToggle: self => { if (self.isActive) loop.play(); else loop.pause(); },
          onUpdate: self => {
            const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
            gsap.to(loop, { timeScale: 1 + Math.abs(v), duration: 0.3, overwrite: true });
            gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.3 });
          }
        });
      });

      });
      chunk(() => {
      /* --- FAQ --- */
      gsap.from('.faq-item', { y: 30, opacity: 0, duration: 1, ease: E, stagger: 0.06, scrollTrigger: { trigger: '.faq-list', start: 'top 88%' } });

      });
      chunk(() => {
      /* --- CTA / footer --- */
      gsap.from('.cta-row', { y: 30, opacity: 0, duration: 1.1, ease: E, scrollTrigger: { trigger: '.cta-row', start: 'top 92%' } });
      gsap.fromTo('.footer-line path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 90%', end: 'bottom bottom', scrub: 0.8 } });
      gsap.from('.footer-title .sw > span', { yPercent: 110, duration: 1.2, ease: E, stagger: 0.05, scrollTrigger: { trigger: '.footer', start: 'top 80%' } });
      gsap.from('.footer-cols .f-col', { y: 30, opacity: 0, duration: 1, ease: E, stagger: 0.08, scrollTrigger: { trigger: '.footer-cols', start: 'top 95%' } });


      });
      // galeria: ao sair, a imagem final fica parada (parallax) enquanto o texto e a próxima seção sobem
      chunk(() => {
        const pin = $('.zoom-pin'); if (!pin) return;
        const spacer = pin.parentElement && pin.parentElement.classList.contains('pin-spacer') ? pin.parentElement : pin;
        gsap.to('.zoom-grid', { y: () => innerHeight, ease: 'none',
          scrollTrigger: { trigger: spacer, start: 'bottom bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      });
      const idle = window.requestIdleCallback ? (f => requestIdleCallback(f, { timeout: 1200 })) : (f => setTimeout(f, 60));
      const runQ = () => { const f = Q.shift(); if (!f) { ScrollTrigger.refresh(); return; } if (ctx) ctx.add(f); idle(runQ); };
      // 1º pedaço (texto do topo) já; o resto da página só no 1º movimento do visitante ou ~4s após carregar (abertura fica leve)
      const first = Q.shift(); if (first) { if (ctx) ctx.add(first); else first(); }
      let qStarted = false;
      const startQ = () => { if (qStarted) return; qStarted = true; QEV.forEach(ev => removeEventListener(ev, startQ)); idle(runQ); };
      const QEV = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
      QEV.forEach(ev => addEventListener(ev, startQ, { passive: true, once: true }));
      const qLater = () => setTimeout(startQ, 4000);
      if (document.readyState === 'complete') qLater(); else addEventListener('load', qLater, { once: true });
    });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------------- Física das logos ---------------- */
  let phys = null;
  function loadMatter() {
    if (window.Matter) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'assets/vendor/matter.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  function startLogoPhysics() {
    const sec = $('.clients'); if (!sec || phys) return;
    phys = { stop: () => {} };
    const io = new IntersectionObserver(async ents => {
      if (!ents[0].isIntersecting) return;
      io.disconnect();
      try { await loadMatter(); } catch (e) { return; }
      if (!motionOn) return;
      initLogoPhysics(sec);
    }, { rootMargin: '300px 0px' });
    io.observe(sec);
    phys.stop = () => { io.disconnect(); phys = null; };
  }
  function initLogoPhysics(sec) {
    const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = Matter;
    const box = $('.float-logos', sec);
    const els = $$('.fl', box).filter(el => el.offsetParent !== null);
    sec.classList.add('is-physics');
    const engine = Engine.create({ gravity: { y: 1 } });
    const world = engine.world;
    let W = box.clientWidth, H = box.clientHeight;
    const T = 200;
    const wall = (x, y, w, h) => Bodies.rectangle(x, y, w, h, { isStatic: true });
    let walls = [];
    function buildWalls() {
      if (walls.length) Composite.remove(world, walls);
      W = box.clientWidth; H = box.clientHeight;
      walls = [wall(W / 2, H + T / 2, W * 3, T), wall(-T / 2, H / 2, T, H * 4), wall(W + T / 2, H / 2, T, H * 4), wall(W / 2, -H - T / 2, W * 3, T)];
      Composite.add(world, walls);
    }
    buildWalls();
    const items = els.map((el, i) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const body = Bodies.rectangle(
        W * (0.15 + Math.random() * 0.7), -h - i * (h + 30), w, h,
        { chamfer: { radius: Math.min(h / 2, 14) }, restitution: 0.32, friction: 0.45, frictionStatic: 0.8, frictionAir: 0.022, density: 0.0016, angle: (Math.random() - 0.5) * 0.35 }
      );
      Composite.add(world, body);
      el._body = body;
      return { el, body, w, h };
    });
    // mouse: arrastar e arremessar (desktop)
    if (finePointer) {
      const mouse = Mouse.create(box);
      mouse.element.removeEventListener('wheel', mouse.mousewheel);
      mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
      mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
      ['touchstart', 'touchmove', 'touchend'].forEach(ev => mouse.element.removeEventListener(ev, ev === 'touchstart' ? mouse.mousedown : ev === 'touchmove' ? mouse.mousemove : mouse.mouseup));
      const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.18, damping: 0.1, render: { visible: false } } });
      Composite.add(world, mc);
      Events.on(mc, 'startdrag', e => { dragged = e.body; const it = items.find(x => x.body === e.body); if (it) it.el.classList.add('is-grab'); box.classList.add('is-dragging'); });
      Events.on(mc, 'enddrag', () => { dragged = null; items.forEach(x => x.el.classList.remove('is-grab')); box.classList.remove('is-dragging'); });
    }
    // toque/clique: dá um "pulo" na logo
    items.forEach(it => it.el.addEventListener('pointerdown', e => {
      if (finePointer) return;
      Body.setVelocity(it.body, { x: (Math.random() - 0.5) * 14, y: -18 });
      Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.3);
    }));
    let running = false, raf = 0, last = 0, dragged = null;
    function tick(t) {
      const dt = Math.min(32, t - (last || t)); last = t;
      Engine.update(engine, dt || 16.67);
      // auto-endireitar: puxa cada logo de volta para a horizontal (como um "joão-bobo")
      for (const it of items) {
        const b = it.body; if (b === dragged) continue;
        let a = b.angle % (Math.PI * 2); if (a > Math.PI) a -= Math.PI * 2; if (a < -Math.PI) a += Math.PI * 2;
        Body.setAngularVelocity(b, b.angularVelocity * 0.9 - a * 0.012);
      }
      for (const it of items) {
        const p = it.body.position;
        it.el.style.transform = `translate(${p.x - it.w / 2}px, ${p.y - it.h / 2}px) rotate(${it.body.angle}rad)`;
      }
      raf = requestAnimationFrame(tick);
    }
    const vis = new IntersectionObserver(ents => {
      const on = ents[0].isIntersecting;
      if (on && !running) { running = true; last = 0; raf = requestAnimationFrame(tick); }
      if (!on && running) { running = false; cancelAnimationFrame(raf); }
    });
    vis.observe(sec);
    const onResize = () => buildWalls();
    addEventListener('resize', onResize);
    phys.stop = () => {
      vis.disconnect(); cancelAnimationFrame(raf); running = false; removeEventListener('resize', onResize);
      Engine.clear(engine); sec.classList.remove('is-physics');
      items.forEach(it => { it.el.style.transform = ''; it.el.classList.remove('is-grab'); });
      phys = null;
    };
  }

  function stopMotion() {
    motionOn = false;
    if (phys) phys.stop();
    if (ctx) { ctx.revert(); ctx = null; }
    if (lenis) { gsap.ticker.remove(tickerFn); lenis.destroy(); lenis = null; }
    // remove spans de split, restaurando o texto
    applyTexts();
    setCountsFinal();
  }

  /* ---------------- Cursor ---------------- */
  if (finePointer && hasGsap && !a11y.motion && !a11y.clean) {
    const cur = $('.cursor');
    // à prova de falhas: a seta do sistema só some depois que a bolinha já está seguindo um mouse de verdade;
    // com toque/caneta (notebooks com tela touch), dentro de vídeos/iframes ou com a janela sem foco, a seta volta
    const on = () => { if (!d.classList.contains('has-cursor')) d.classList.add('has-cursor'); cur.classList.remove('is-hidden'); };
    const off = () => { d.classList.remove('has-cursor'); cur.classList.add('is-hidden'); };
    // segue o mouse sem atraso, como a seta do sistema (1 atualização por quadro, só transform)
    let mx = -50, my = -50, craf = 0;
    const place = () => { craf = 0; cur.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)'; };
    addEventListener('pointermove', e => { if (e.pointerType && e.pointerType !== 'mouse') { off(); return; } mx = e.clientX; my = e.clientY; on(); if (!craf) craf = requestAnimationFrame(place); }, { passive: true });
    addEventListener('pointerdown', e => { if (e.pointerType && e.pointerType !== 'mouse') off(); }, { passive: true });
    addEventListener('blur', off);
    document.addEventListener('mouseover', e => { if (e.target.closest && e.target.closest('iframe, video')) cur.classList.add('is-hidden'); });
    document.addEventListener('mouseover', e => {
      const v = e.target.closest('[data-cursor="view"]');
      const h = e.target.closest('a, button, .svc, .wheel-card, .fl');
      cur.classList.toggle('is-view', !!v);
      if (v) { const cs = getComputedStyle(v); cur.style.setProperty('--cv', cs.getPropertyValue('--row-c').trim() || 'var(--accent)'); cur.style.setProperty('--cvi', cs.getPropertyValue('--row-i').trim() || '#0B0B0B'); }
      cur.classList.toggle('is-hover', !v && !!h);
    });
    document.addEventListener('mouseleave', () => cur.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => cur.classList.remove('is-hidden'));
  }

  /* ---------------- Header no topo; ao rolar, vira doca flutuante (logo + menu + topo) ---------------- */
  const nav = $('.nav'), fab = $('.fab-top'), dock = $('.dock'), dockMenu = $('.dock-menu');
  // cor da doca conforme o fundo atrás dela (claro -> preta, escuro -> clara)
  function lumAt(x, y) {
    // imagens sem clique (galeria/roda) não aparecem no elementsFromPoint: checa pela área
    // só considera a galeria se ela for de fato o que está atrás da doca (outra seção pode estar por cima)
    const hits = document.elementsFromPoint(x, y); // uma consulta só por checagem (é cara)
    const top0 = hits.find(el => !dock.contains(el) && !el.closest('.cursor'));
    const overZoom = !!(top0 && top0.closest('.zoom'));
    const zp = overZoom && document.querySelector(".zoom.is-final .zoom-pin");
    if (zp) { const r = zp.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return 0.25; }
    // seção "Feito para impressionar" (apresentação): fica presa na tela e não recebe clique, então não aparece no elementsFromPoint;
    // por isso é checada pela área: moldura do site, bolinha que vira tela e a cor de fundo que a apresentação ganha
    const zst = document.querySelector('.zoom-stack .zs-stage'), zr = zst && zst.getBoundingClientRect();
    if (zr && x >= zr.left && x <= zr.right && y >= zr.top && y <= zr.bottom) {
      const lumOf = el => { const c = getComputedStyle(el).backgroundColor, m = c.match(/[\d.]+/g); if (!m || (m[3] !== undefined && +m[3] < .5)) return null; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / (c.startsWith('color(') ? 1 : 255); };
      const fr = document.querySelector('.zoom-stack .zb-frame');
      if (fr && getComputedStyle(fr.closest('.zs-build')).visibility !== 'hidden' && +getComputedStyle(fr).opacity > .5) { const r = fr.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) { const v = lumOf(fr); if (v !== null) return v; } }
      const fl = document.querySelector('.zoom-stack .zi-fill');
      if (fl) { const r = fl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (r.width > 4 && Math.hypot(x - cx, y - cy) < r.width / 2) { const v = lumOf(fl); if (v !== null) return v; } }
      // fundo que a apresentação ganha (claro ou escuro, conforme o tema e a cena)
      const sv = lumOf(zst); if (sv !== null) return sv;
      const sec = zst.closest('.zoom-stack'), qv = sec && lumOf(sec); if (qv !== null && qv !== undefined && qv !== false) return qv;
    }
    const zgr = overZoom && document.querySelector(".zoom-grid"); if (zgr) { for (const t of zgr.querySelectorAll(".zg")) { const r = t.getBoundingClientRect(); if (getComputedStyle(t).opacity > 0.5 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return 0.3; } }
    const els = hits.filter(el => !dock.contains(el) && !el.classList.contains('cursor') && !el.closest('.cursor') && !el.closest('.zs-o')); // bolinhas da galáxia não contam: vale o fundo
    for (const el of els) {
      if (el.tagName === 'IMG' || el.tagName === 'VIDEO') return 0.3;
      let n = el;
      while (n && n !== document.documentElement) {
        const c = getComputedStyle(n).backgroundColor;
        const m = c.match(/[\d.]+/g);
        if (m && (m[3] === undefined || +m[3] > 0.5)) return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / (c.startsWith('color(') ? 1 : 255); // color-mix() vem em 0..1
        n = n.parentElement;
      }
    }
    return (0.2126 * 11 + 0.7152 * 11 + 0.0722 * 11) / 255 > 0 && document.documentElement.dataset.theme === 'dark' ? 0.05 : 0.93;
  }
  let toneRaf = 0, toneT = 0, toneY = -1e9, toneTail = 0;
  // a cor da doca é conferida no máximo ~8x por segundo e só se a página andou (antes: todo quadro de rolagem — travava no celular);
  // uma última checagem logo depois que a rolagem para garante a cor certa
  function checkTone() {
    if (toneRaf) return;
    toneT = performance.now(); toneY = window.scrollY;
    toneRaf = requestAnimationFrame(() => {
      toneRaf = 0;
      // mede atrás da logo (é ela que precisa contrastar); sem logo visível, no meio da doca
      const lg = dock.querySelector('.dock-logo'), r = (lg && lg.offsetWidth ? lg : dock).getBoundingClientRect();
      dock.classList.toggle('on-dark', lumAt(r.left + r.width / 2, r.top + r.height / 2) < 0.5);
    });
  }
  function syncDockTone() {
    clearTimeout(toneTail); toneTail = setTimeout(checkTone, 160); // checagem final, quando a rolagem para
    if (performance.now() - toneT < 120 || Math.abs(window.scrollY - toneY) < 24) return;
    checkTone();
  }
  function onScrollUI() {
    const y = window.scrollY;
    const away = y > 80;
    nav.classList.toggle('is-gone', away);
    dock.classList.toggle('is-on', away);
    document.body.classList.toggle('dock-on', away);
    if (!away && !menu.hidden && innerWidth >= 0) { /* mantém o menu do topo */ }
    if (away) syncDockTone();
    if (innerWidth < 900) { dock.classList.add("is-moving"); clearTimeout(dockIdle); dockIdle = setTimeout(() => dock.classList.remove("is-moving"), 450); }
  }
  let dockIdle;
  addEventListener('scroll', onScrollUI, { passive: true });
  // estado certo do menu/doca já ao abrir (e ao voltar para a página pelo histórico)
  addEventListener('load', onScrollUI); addEventListener('pageshow', onScrollUI);
  addEventListener('resize', syncDockTone);
  new MutationObserver(syncDockTone).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  dockMenu.addEventListener('click', () => { setMenu(menu.hidden); dockMenu.setAttribute('aria-expanded', String(!menu.hidden)); });
  $('.dock-top').addEventListener('click', () => scrollToTarget(0));
  fab.addEventListener('click', () => scrollToTarget(0));
  onScrollUI();

  /* ---------------- Roda do hero: geometria responsiva ---------------- */
  const wheelEl = $('.wheel');
  function layoutWheel() {
    if (!wheelEl) return;
    const stage = $('.hero-stage'), content = $('.hero-content');
    const maxPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--max")) || 1600;
    const W = Math.min(stage.clientWidth, maxPx), H = stage.clientHeight;
    const mobile = W < 600;
    const n = $$('.wheel-card', wheelEl).length || 36;
    if (mobile) {
      // celular: cards maiores e arco mais curvo; texto centralizado no espaço acima da roda
      const r = 760;
      const first = content.firstElementChild, last = content.lastElementChild;
      content.style.paddingTop = '';
      const cH = last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
      const headerH = 76;
      // cards crescem para ocupar o espaço livre (sem vão grande entre o botão e a roda)
      const avail = H - headerH - cH;
      const cw = Math.min(Math.max(avail * 0.55 / 0.9 / 0.76, 210), W * 0.8), ch = cw * 0.76;
      const vis = ch * 0.9;
      const free = Math.max(avail - vis, 48);
      content.style.paddingTop = (headerH + free * 0.5) + 'px';
      const top = headerH + free * 0.5 + cH + free * 0.5;
      wheelEl.style.setProperty('--r', r + 'px');
      wheelEl.style.setProperty('--cw', cw + 'px');
      wheelEl.style.setProperty('--ch', ch + 'px');
      wheelEl.style.setProperty('--cy', (top + ch / 2 + r) + 'px');
      wheelEl.style.setProperty('--step', (360 / n) + 'deg');
      return;
    }
    content.style.paddingTop = '';
    const r = Math.max(W * 1.1, 1000);                 // círculo grande: arco suave cobrindo toda a largura
    const spacing = 2 * Math.PI * r / n;
    const cw = Math.min(spacing * 1.22, mobile ? 230 : 400); // > espaçamento => cards se sobrepõem
    let ch = cw * 0.76;
    const last = content.lastElementChild;
    const contentBottom = last ? (last.getBoundingClientRect().bottom - stage.getBoundingClientRect().top) : H * 0.6;
    let top = Math.max(contentBottom + (mobile ? 28 : 40), H * (mobile ? 0.62 : 0.6));
    // garante que o card central passe da borda inferior (sem vão)
    const need = H + 60 - top;
    // cresce no máximo 25%; o restante é compensado descendo a roda
    const chMax = ch * 1.25;
    if (ch < need) { ch = Math.min(need, chMax); if (top + ch < H + 60) top = H + 60 - ch; }
    const cwF = Math.max(cw, ch / 0.76);
    const cy = top + ch / 2 + r;
    wheelEl.style.setProperty('--r', r + 'px');
    wheelEl.style.setProperty('--cw', cwF + 'px');
    wheelEl.style.setProperty('--ch', ch + 'px');
    wheelEl.style.setProperty('--cy', cy + 'px');
    wheelEl.style.setProperty('--step', (360 / n) + 'deg');
  }
  layoutWheel();
  window.__fywLayoutWheel = layoutWheel;
  addEventListener('resize', layoutWheel);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutWheel);

  /* ---------------- Galeria "Feito para impressionar": em telas altas o título desce para perto das fotos ---------------- */
  (function () {
    const intro = $('.zoom-intro'), grid = $('.zoom-grid'); if (!intro || !grid) return;
    const GAP = 96;
    // mede pela posição de layout (offsetTop), que não muda com a animação/fixação da galeria —
    // medir na tela durante a rolagem dava valores errados e puxava as fotos por cima de outras seções
    const fit = () => {
      const prev = intro.style.getPropertyValue('margin-bottom');
      intro.style.removeProperty('margin-bottom');
      let next = '';
      // posição dentro da seção somando offsetTop (null se a galeria estiver fixada na tela: aí não mexe)
      const zoomEl = intro.closest('.zoom');
      const topIn = el => { let y = 0, e = el; while (e && e !== zoomEl) { if (getComputedStyle(e).position === 'fixed') return null; y += e.offsetTop; e = e.offsetParent; } return e === zoomEl ? y : null; };
      const gt = topIn(grid), it = topIn(intro);
      if (gt === null || it === null) { if (prev) intro.style.setProperty('margin-bottom', prev); return; }
      if (innerHeight > innerWidth) { // só telas em pé
        // a grade começa encolhida (escala 0,82 a partir do centro): o topo visível fica mais abaixo
        const gap = gt + grid.offsetHeight * (1 - 0.82) / 2 - (it + intro.offsetHeight);
        const pull = Math.min(Math.round(gap - GAP), Math.round(innerHeight * 0.5));
        if (pull > 40) next = (-pull) + 'px';
      }
      if (next) intro.style.setProperty('margin-bottom', next);
      if (next !== prev && window.ScrollTrigger) ScrollTrigger.refresh();
    };
    fit();
    // só recalcula quando a largura muda (no celular a barra do navegador some/aparece ao rolar e dispara "resize")
    let lastW = innerWidth;
    addEventListener('resize', () => { if (innerWidth === lastW) return; lastW = innerWidth; clearTimeout(window.__zgT); window.__zgT = setTimeout(fit, 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  })();

  /* ---------------- "2023" do fundo: a base do número termina junto com o título (nunca sobre os parágrafos) ---------------- */
  (function () {
    const side = $('.story-side'), year = $('.story-year'), title = $('.story-title'), inner = $('.story-inner');
    if (!side || !year || !title || !inner) return;
    const place = () => {
      year.style.removeProperty('font-size');
      const t = title.getBoundingClientRect(), i = inner.getBoundingClientRect();
      const avail = t.bottom - i.top - 8;
      // se não couber entre o topo e o fim do título, o número diminui até caber
      if (year.offsetHeight > avail) year.style.setProperty('font-size', Math.max(96, Math.floor(avail / 0.8)) + 'px', 'important');
      const top = Math.max(8, Math.round(t.bottom - i.top - year.offsetHeight));
      side.style.setProperty('top', top + 'px', 'important');
      // números normais (sem esticar)
      if (window.gsap) gsap.set(year.querySelectorAll("span"), { scaleX: 1 });
    };
    place();
    addEventListener('resize', () => { clearTimeout(window.__yrT); window.__yrT = setTimeout(place, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    addEventListener('load', place, { once: true });
  })();

  /* ---------------- Cards do topo com página própria: clique abre o projeto ---------------- */
  document.addEventListener('click', e => { const c = e.target.closest && e.target.closest('.hf-card[data-href]'); if (c) location.href = c.dataset.href; });

  /* ---------------- Projetos em ordem aleatória a cada visita (cards do topo + linhas de Trabalhos combinando) ---------------- */
  (function () {
    const fan = $('.hfan'), list = $('.work-list'); if (!fan || !list || fan.hasAttribute('data-fixed')) return;
    const cards = [...$$('.hf-card', fan)]; if (cards.length < 7) return;
    const mid = cards.slice(2, 7), poses = mid.map(c => c.getAttribute('style'));
    // etiquetas fixas nas posições 3, 5 e 7 (saem dos cards e voltam para quem cair nessas posições)
    const tags = [cards[2], cards[4], cards[6]].map(c => { const t = c.querySelector('.hf-tag.is-rest'); if (t) t.remove(); return t; });
    const sh = mid.slice(); for (let i = sh.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [sh[i], sh[k]] = [sh[k], sh[i]]; }
    // card marcado com data-center (projeto em destaque) fica sempre no meio
    const ci = sh.findIndex(c => c.hasAttribute('data-center')); if (ci > -1) { const m = Math.floor(sh.length / 2); [sh[ci], sh[m]] = [sh[m], sh[ci]]; }
    sh.forEach((c, i) => { fan.insertBefore(c, cards[7]); c.setAttribute('style', poses[i]); });
    [sh[0], sh[2], sh[4]].forEach((c, i) => { if (tags[i]) c.appendChild(tags[i]); });
    const bySlug = {}; $$('.work-row', list).forEach(r => { bySlug[(r.getAttribute('href') || '').split('/').pop().replace('.html', '')] = r; });
    sh.forEach(c => { const r = bySlug[c.dataset.project]; if (r) list.appendChild(r); });
    $$('.work-row', list).forEach((r, i) => { const n = $('.wr-n', r); if (n) n.textContent = '/0' + (i + 1); });
  })();

  /* ---------------- Vídeo de fundo do hero: um por tema, os dois ficam prontos (troca instantânea) ---------------- */
  window.__fywVideoReady = new Promise(res => { window.__fywVideoDone = res; });
  (function () {
    const box = $(".hero-video"); if (!box) { window.__fywVideoDone(); return; }
    // TESTE: fundo de nuvens 3D (Vanta.js) no lugar do vídeo — ativado com data-bg="clouds" no .hero-video
    if (box.dataset.bg === 'clouds') {
      // céu em degradê já na abertura (custo zero); as nuvens 3D entram depois, sem pesar no carregamento
      const load = src => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
      box.classList.add('is-clouds');
      if (window.__fywVideoDone) window.__fywVideoDone(); // a tela de carregamento não espera as nuvens
        const SETS = {
          light: [
            [0x1fa9f2, 0xffd1b3, 0x3a2f6b, 0xff9919, 0xff6633, 0xff9933], // azul + nuvem pêssego
            [0x8f7cf2, 0xffc2dc, 0x3b2a6b, 0xffb36b, 0xff7a9a, 0xffb380], // lilás + nuvem rosa
            [0x2fbfb0, 0xffb8a1, 0x17404a, 0xffd27a, 0xff8a5a, 0xffc46b], // turquesa + nuvem coral
            [0xf27a5e, 0xd6c8ff, 0x4a2a5a, 0xffb347, 0xff6f61, 0xffa65c], // coral + nuvem lavanda
            [0x3f6df2, 0xffe9a8, 0x1c2a66, 0xffc04d, 0xff8a3d, 0xffd08a], // azul royal + nuvem amarelo-claro
            [0xf28bb5, 0xbff0dc, 0x4a1f36, 0xffc078, 0xff7f7f, 0xffb38a], // rosa + nuvem menta
            [0x4fd1b5, 0xd9c8ff, 0x1d4a44, 0xffd27a, 0xff9a8a, 0xffcf8a]  // verde-água + nuvem lilás
          ],
          dark: [
            [0x000000, 0x797c82, 0x183550, 0x000000, 0x110703, 0xff9933], // preto + nuvem cinza
            [0x0a1630, 0x6a4fa8, 0x0d1b3a, 0x1a2a55, 0x0a1430, 0x6a8cff], // azul-noite + nuvem roxa
            [0x140a26, 0x8a3f6e, 0x1c1036, 0x2a1450, 0x140a26, 0xff7ab0], // roxo profundo + nuvem rosa
            [0x1f0710, 0x8a5a2e, 0x2a0d18, 0x3a0f1c, 0x1f0710, 0xffb347], // vinho + nuvem âmbar
            [0x06171a, 0x2f6a8a, 0x0a2428, 0x0c2a2c, 0x06171a, 0x4fd1b5], // verde-noite + nuvem azul-petróleo
            [0x050505, 0x33507a, 0x101a30, 0x0a0a0a, 0x0a0a14, 0x6a8cff]  // preto + nuvem azul-noite
          ]
        };
        // sorteia sem repetir a combinação da visita anterior (por tema)
        const pickNoRepeat = t => {
          const list = SETS[t]; let last = -1;
          try { last = parseInt(localStorage.getItem('fio-cloud-' + t), 10); } catch (err) {}
          let i = Math.floor(Math.random() * list.length);
          if (list.length > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
          try { localStorage.setItem('fio-cloud-' + t, String(i)); } catch (err) {}
          return list[i];
        };
        const toOpts = c => ({ backgroundColor: 0xffffff, skyColor: c[0], cloudColor: c[1], cloudShadowColor: c[2], sunColor: c[3], sunGlareColor: c[4], sunlightColor: c[5] });
        const PAL = { light: toOpts(pickNoRepeat('light')), dark: toOpts(pickNoRepeat('dark')) };
        const hex = n => '#' + n.toString(16).padStart(6, '0');
        const theme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const paintBg = t => {
          const p = PAL[t];
          box.style.setProperty('background', 'linear-gradient(180deg, ' + hex(p.skyColor) + ' 0%, ' + hex(p.skyColor) + ' 30%, color-mix(in srgb, ' + hex(p.skyColor) + ' 50%, ' + hex(p.cloudColor) + ') 52%, ' + hex(p.cloudColor) + ' 72%, ' + hex(p.cloudShadowColor) + ' 130%)', 'important');
        };
        paintBg(theme());
        new MutationObserver(() => { paintBg(theme()); if (window.__fywClouds) window.__fywClouds.setOptions(PAL[theme()]); })
          .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        if (sysReduced || a11y.motion || a11y.clean) return; // sem animações: fica só o céu em degradê
        // sem placa de vídeo de verdade (o 3D seria desenhado pelo processador, o que trava a página por segundos —
        // acontece nos testes do Google e em aparelhos muito fracos): fica o céu em degradê, sem as nuvens animadas
        const softGL = (() => { try {
          const c = document.createElement('canvas'), gl = c.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || c.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: true });
          if (!gl) return true;
          const ext = gl.getExtension('WEBGL_debug_renderer_info'), r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
          const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
          return /swiftshader|llvmpipe|software|basic render|mesa offscreen/i.test(r);
        } catch (e) { return true; } })();
        if (softGL) { softSky(); return; }
        // nuvens leves (sem 3D): desenhadas pelo processador numa tela pequena (~200 px de largura) e ampliadas pelo navegador.
        // Mesmo céu, mesmas cores e mar de nuvens em perspectiva vindo na direção de quem vê, por ~1–2 ms por quadro
        function softSky() {
          const N = 128, M = N - 1;
          const noise = seed => { // ruído suave que se repete sem emenda (128×128), 4 camadas de detalhe
            let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
            const out = new Float32Array(N * N);
            for (let o = 0, amp = .5, cells = 4; o < 4; o++, amp *= .5, cells *= 2) {
              const g = new Float32Array(cells * cells); for (let i = 0; i < g.length; i++) g[i] = rnd();
              const k = cells / N;
              for (let y = 0; y < N; y++) {
                const fy = y * k, y0 = fy | 0, ty = fy - y0, sy = ty * ty * (3 - 2 * ty), r0 = y0 * cells, r1 = ((y0 + 1) % cells) * cells;
                for (let x = 0; x < N; x++) {
                  const fx = x * k, x0 = fx | 0, tx = fx - x0, sx = tx * tx * (3 - 2 * tx), x1 = (x0 + 1) % cells;
                  const a = g[r0 + x0] + (g[r0 + x1] - g[r0 + x0]) * sx, b = g[r1 + x0] + (g[r1 + x1] - g[r1 + x0]) * sx;
                  out[y * N + x] += (a + (b - a) * sy) * amp;
                }
              }
            }
            return out;
          };
          const A = noise(9301), B = noise(49297);
          const at = (T, x, y) => { // leitura suave (bilinear) com repetição
            x -= Math.floor(x / N) * N; y -= Math.floor(y / N) * N;
            const x0 = x | 0, y0 = y | 0, tx = x - x0, ty = y - y0, x1 = (x0 + 1) & M, y1 = (y0 + 1) & M, r0 = y0 * N, r1 = y1 * N;
            const a = T[r0 + x0] + (T[r0 + x1] - T[r0 + x0]) * tx, b = T[r1 + x0] + (T[r1 + x1] - T[r1 + x0]) * tx;
            return a + (b - a) * ty;
          };
          const cv = document.createElement('canvas'), ctx = cv.getContext('2d', { alpha: false });
          box.appendChild(cv); box.classList.add('is-soft');
          let W = 0, H = 0, img, px, rows;
          const size = () => {
            const r = box.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
            W = Math.round(Math.min(220, Math.max(140, w / 8))); H = Math.max(60, Math.round(W * h / w));
            if (cv.width === W && cv.height === H) return;
            cv.width = W; cv.height = H; img = ctx.createImageData(W, H); px = img.data;
            const HOR = .3; rows = new Float32Array(H * 3); // por linha: profundidade, névoa e posição no céu
            for (let y = 0; y < H; y++) { const v = y / (H - 1), d = v - HOR; rows[y * 3] = d > 0 ? 1 / (d + .045) : 0; rows[y * 3 + 1] = d > 0 ? Math.min(1, d * 5.5) : 0; rows[y * 3 + 2] = v; }
          };
          size(); addEventListener('resize', size, { passive: true });
          const rgb = n => [(n >> 16) & 255, (n >> 8) & 255, n & 255];
          let C; const colors = () => { const p = PAL[theme()]; C = { sky: rgb(p.skyColor), cl: rgb(p.cloudColor), sh: rgb(p.cloudShadowColor), sun: rgb(p.sunColor), lite: rgb(p.sunlightColor), glare: rgb(p.sunGlareColor) }; };
          colors(); new MutationObserver(colors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
          let mx = 0, tmx = 0; addEventListener('pointermove', e => { tmx = (e.clientX / innerWidth - .5); }, { passive: true });
          const draw = t => {
            mx += (tmx - mx) * .05;
            const { sky, cl, sh, sun, lite } = C, ox = mx * 30, z0 = t * 9;
            // névoa do horizonte: a cor da nuvem levemente puxada para o céu
            const hzR = cl[0] * .88 + sky[0] * .12, hzG = cl[1] * .88 + sky[1] * .12, hzB = cl[2] * .88 + sky[2] * .12;
            // vales entre as nuvens: sombra da nuvem misturada ao céu
            const gR = sh[0] * .5 + cl[0] * .2 + sky[0] * .3, gG = sh[1] * .5 + cl[1] * .2 + sky[1] * .3, gB = sh[2] * .5 + cl[2] * .2 + sky[2] * .3;
            for (let y = 0; y < H; y++) {
              const z = rows[y * 3], fog = rows[y * 3 + 1], v = rows[y * 3 + 2];
              // céu: puxa um pouco para a cor do sol perto do horizonte
              const hz = Math.max(0, 1 - Math.abs(v - .3) * 3.2), sk0 = sky[0] + (sun[0] - sky[0]) * hz * .3, sk1 = sky[1] + (sun[1] - sky[1]) * hz * .3, sk2 = sky[2] + (sun[2] - sky[2]) * hz * .3;
              // passagem suave céu → nuvens (sem linha dura no horizonte)
              const hb = Math.min(1, Math.max(0, (v - .24) / .09)), sb = hb * hb * (3 - 2 * hb);
              let i = y * W * 4;
              for (let x = 0; x < W; x++, i += 4) {
                let r = sk0, g = sk1, b = sk2;
                if (sb > 0) {
                  let cr = hzR, cg = hzG, cb = hzB;
                  if (z) {
                    const u = (x / W - .5) * z * 26 + ox, w = z * 16 + z0;
                    const n = at(A, u, w) * .68 + at(B, u * 2.1 + 11, w * 2.1 - t * 4) * .32;
                    const dens = Math.min(1, Math.max(0, (n - .38) * 4));
                    const lit = Math.min(1, Math.max(0, .82 + (n - at(A, u - 1.6, w - 1.6) * .68 - at(B, u * 2.1 + 9.4, w * 2.1 - t * 4 - 3.4) * .32) * 9)); // luz vindo de cima
                    const k = lit * .14; // topo das nuvens com um toque da luz do sol
                    const tr = sh[0] + (cl[0] - sh[0]) * lit + (lite[0] - cl[0]) * k, tg = sh[1] + (cl[1] - sh[1]) * lit + (lite[1] - cl[1]) * k, tb = sh[2] + (cl[2] - sh[2]) * lit + (lite[2] - cl[2]) * k;
                    const sr = gR + (tr - gR) * dens, sg = gG + (tg - gG) * dens, sb2 = gB + (tb - gB) * dens;
                    cr = hzR + (sr - hzR) * fog; cg = hzG + (sg - hzG) * fog; cb = hzB + (sb2 - hzB) * fog;
                  }
                  r += (cr - r) * sb; g += (cg - g) * sb; b += (cb - b) * sb;
                }
                px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
              }
            }
            ctx.putImageData(img, 0, 0);
          };
          const t0 = performance.now(); let req = 0, last = 0, on = true;
          const loop = now => { req = requestAnimationFrame(loop); if (now - last < 40) return; last = now; draw((now - t0) / 1000); }; // ~25 quadros por segundo
          draw(0); requestAnimationFrame(() => box.classList.add('is-live'));
          const play = () => { if (!req && on && !document.hidden) req = requestAnimationFrame(loop); }, stop = () => { if (req) cancelAnimationFrame(req); req = 0; };
          new IntersectionObserver(es => { on = es[0].isIntersecting; on ? play() : stop(); }).observe(box);
          document.addEventListener('visibilitychange', () => document.hidden ? stop() : play());
        }

        let started = false;
        const start = () => {
          if (started) return; started = true;
          EVC.forEach(ev => removeEventListener(ev, start));
          // ~40% da resolução da tela (o fundo é desfocado, não se nota) — muito menos trabalho para a placa de vídeo
          const LOWRES = Math.max(2.5, (window.devicePixelRatio || 1) * 2.5);
          load('assets/vendor/three.r134.min.js').then(() => load('assets/vendor/vanta.clouds.min.js')).then(() => {
            const fx = window.__fywClouds = window.VANTA.CLOUDS(Object.assign({
              el: box, mouseControls: true, touchControls: true, gyroControls: false, minHeight: 200, minWidth: 200, speed: 1, scale: LOWRES, scaleMobile: LOWRES
            }, PAL[theme()]));
            // trava em 60 quadros por segundo: em monitores de 120/144/165 Hz o efeito desenharia 2–3x mais (placa de vídeo a 100%)
            const loop = fx.animationLoop; let due = 0;
            fx.animationLoop = function () {
              const now = performance.now();
              if (now < due - 2) { fx.req = requestAnimationFrame(fx.animationLoop); return; }
              due = (now - due > 50) ? now + 16.667 : due + 16.667; // média de 60 quadros por segundo em qualquer monitor
              return loop.call(fx);
            };
            requestAnimationFrame(() => box.classList.add('is-live')); // as nuvens aparecem suavemente por cima do degradê
            // pausa de verdade quando o topo sai da tela (poupa processador e bateria)
            new IntersectionObserver(es => {
              const on = es[0].isIntersecting;
              if (!on && fx.req) { cancelAnimationFrame(fx.req); fx.req = 0; }
              else if (on && !fx.req) { fx.prevNow = performance.now(); fx.req = requestAnimationFrame(fx.animationLoop); }
            }).observe(box);
          }).catch(() => {});
        };
        // começa no primeiro movimento do visitante, ou alguns segundos depois de abrir
        const EVC = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'wheel', 'keydown'];
        EVC.forEach(ev => addEventListener(ev, start, { passive: true, once: true }));
        const later = () => setTimeout(start, 4500);
        if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
      return;
    }
    const saveData = navigator.connection && navigator.connection.saveData;
    if (sysReduced || a11y.motion || a11y.clean || saveData) { window.__fywVideoDone(); return; }
    // cada tema tem uma lista de vídeos; sorteia um ao carregar e a cada troca de tema (claro só com claro, escuro só com escuro)
    const themeNow = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const pool = t => (t === 'dark' ? box.dataset.ytDark : box.dataset.ytLight || '').split(',').map(s => s.trim()).filter(Boolean);
    const pick = t => { const p = pool(t); return p[Math.floor(Math.random() * p.length)]; };
    const chosen = { light: pick('light'), dark: pick('dark') };
    const idFor = t => chosen[t || themeNow()];
    const P = {}; // id -> { f, playing }
    let active = null;
    const cmd = (f, func) => { try { f.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*"); } catch (e) {} };
    addEventListener("message", e => {
      if (!/youtube/.test(e.origin)) return;
      let d; try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (err) { return; }
      if (!d) return;
      // nunca mostra o começo nem o fim do vídeo (telas "8K Ultra HD"): se chegar perto, pula para outro trecho do meio
      if (d.event === "infoDelivery" && d.info && typeof d.info.currentTime === "number") {
        const ct = d.info.currentTime;
        if (ct < 25 || ct > 895) for (const id in P) if (P[id].f.contentWindow === e.source) {
          try { P[id].f.contentWindow.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [30 + Math.floor(Math.random() * 730), true] }), "*"); } catch (err) {}
        }
      }
      const playing = (d.event === "onStateChange" && d.info === 1) || (d.event === "infoDelivery" && d.info && d.info.playerState === 1);
      if (!playing) return;
      for (const id in P) if (P[id].f.contentWindow === e.source) onPlaying(id);
    });
    function onPlaying(id) {
      const p = P[id]; if (p.playing) return; p.playing = true;
      if (id === active) reveal(id);
      else cmd(p.f, "pauseVideo"); // o do outro tema fica pronto, pausado
    }
    function reveal(id) {
      if (window.__fywVideoDone) window.__fywVideoDone();
      Object.keys(P).forEach(k => { P[k].f.style.opacity = k === id ? "1" : "0"; });
      box.classList.add("is-ready");
      // depois que um está tocando, prepara o outro tema em segundo plano
      const ot = themeNow() === 'dark' ? 'light' : 'dark'; chosen[ot] = pick(ot);
      const other = idFor(ot);
      if (other && !P[other]) setTimeout(() => create(other), 1200);
    }
    function create(id) {
      const f = document.createElement("iframe");
      // cada visita começa num ponto diferente do vídeo (~16 min); nunca perto do começo nem do fim (lá aparecem as telas "8K Ultra HD")
      const start = 30 + Math.floor(Math.random() * 730), end = 900;
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?start=" + start + "&end=" + end + "&autoplay=1&mute=1&controls=0&loop=1&playlist=" + id + "&enablejsapi=1&origin=" + encodeURIComponent(location.origin) + "&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0";
      f.title = "Vídeo de fundo"; f.setAttribute("tabindex", "-1");
      f.allow = "autoplay; encrypted-media; picture-in-picture";
      f.style.opacity = "0";
      P[id] = { f, playing: false };
      f.addEventListener("load", () => {
        const ping = () => { try { f.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*"); } catch (err) {} };
        ping(); let n = 0; const iv = setInterval(() => { if (P[id].playing || ++n > 30) return clearInterval(iv); ping(); }, 300);
      });
      box.appendChild(f);
    }
    function show() {
      const id = idFor(); if (!id) return;
      const prev = active; active = id;
      if (!P[id]) { create(id); return; }
      if (P[id].playing) { cmd(P[id].f, "playVideo"); reveal(id); }
      if (prev && prev !== id && P[prev]) setTimeout(() => { if (active !== prev) cmd(P[prev].f, "pauseVideo"); }, 450);
    }
    new MutationObserver(() => { if (started) show(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    let started = false;
    const go = () => { if (started) return; started = true; EV.forEach(ev => removeEventListener(ev, go)); show(); };
    const EV = ["pointermove", "pointerdown", "touchstart", "wheel", "keydown", "scroll"];
    EV.forEach(ev => addEventListener(ev, go, { passive: true, once: true }));
    // a capa do vídeo já aparece na hora; o vídeo (pesado, de terceiros) entra no 1º movimento ou logo depois do carregamento
    // o vídeo começa a carregar já na abertura; a tela de carregamento espera ele começar a tocar
    go();
  })();

  /* ---------------- Hero: título digitando (3 frases em loop) ---------------- */
  (function () {
    const el = $('.ht-type'); if (!el) return;
    let timer = 0, run = 0;
    function balanced(s, h1) {
      if (innerWidth >= 600) return s;
      const m = h1.cloneNode(false);
      m.removeAttribute('style');
      m.style.cssText = 'position:absolute;visibility:hidden;left:0;right:0;top:0;width:' + h1.clientWidth + 'px;text-wrap:balance;white-space:normal;min-height:0';
      const words = s.replace(/\n/g, ' ').split(' ');
      m.innerHTML = words.map(w => '<span>' + w.replace(/</g, '&lt;') + '</span>').join(' ');
      h1.parentElement.appendChild(m);
      let out = '', lastTop = null;
      [...m.children].forEach((sp, k) => { const tp = sp.offsetTop; out += (k === 0 ? '' : (tp !== lastTop ? '\n' : ' ')) + words[k]; lastTop = tp; });
      m.remove();
      return out;
    }
    function phrases() { const t = DICT[lang] || DICT.pt; const h1 = el.closest('.hero-title'); return [t['hero.type1'], t['hero.type2'], t['hero.type3']].map(s => balanced(s, h1)); }
    function start() {
      clearTimeout(timer); const id = ++run;
      const list = phrases();
      // reserva a altura da frase mais longa para o layout não pular
      const h1 = el.closest('.hero-title'); h1.style.minHeight = ''; h1.style.paddingTop = '';
      const hs = []; let mh = 0; list.forEach(s => { el.textContent = s; hs.push(h1.offsetHeight); mh = Math.max(mh, h1.offsetHeight); });
      h1.style.minHeight = mh + 'px';
      // celular: a sobra de altura fica em cima da frase, então ela fica sempre colada nos cards
      const anchor = k => { h1.style.paddingTop = innerWidth < 600 ? Math.max(0, mh - hs[k]) + 'px' : ''; };
      anchor(0);
      if (window.__fywLayoutWheel) window.__fywLayoutWheel();
      if (sysReduced || a11y.motion || a11y.clean) { el.textContent = list[0]; return; }
      // digita a frase, segura, some com fade e a próxima já entra digitando
      // a 1ª frase já aparece pronta (carregamento rápido); as seguintes são digitadas em loop
      let p = 0, i = list[0].length;
      el.textContent = list[0]; el.classList.remove('is-out');
      const step = () => {
        if (id !== run) return;
        const s = list[p];
        i++; el.textContent = s.slice(0, i);
        if (i < s.length) { timer = setTimeout(step, 38 + Math.random() * 30); return; }
        timer = setTimeout(() => {
          if (id !== run) return;
          el.classList.add('is-out');
          timer = setTimeout(() => {
            if (id !== run) return;
            p = (p + 1) % list.length; i = 0; el.textContent = ''; anchor(p); el.classList.remove('is-out');
            timer = setTimeout(step, 120);
          }, 380);
        }, p === 0 ? 2600 : 2000);
      };
      timer = setTimeout(step, 0);
    }
    window.__fywTypeRestart = start;
    let rw = innerWidth;
    addEventListener('resize', () => { if (Math.abs(innerWidth - rw) < 40) return; rw = innerWidth; start(); if (window.__fywLayoutWheel) window.__fywLayoutWheel(); });
    start();
  })();

  /* ---------------- Brilhos de cor que seguem o mouse (leve: 1 leitura por quadro, só transform) ---------------- */
  (function () {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const SEL = '.mobile-menu, .proc-card, .pillar, .story-quote, .t-card, .btn-hero, .cta.section, .sm, .band';
    // posição de repouso de cada brilho (fração da largura/altura do elemento)
    const REST = el => el.matches('.mobile-menu') ? [0.92, 0] : el.matches('.proc-card, .pillar') ? [0.85, 0.05] : el.matches('.story-quote') ? [0.85, 0.5] : [0.5, 0.5];
    const put = (el, x, y, w, h) => {
      el.style.setProperty('--gx', x.toFixed(0) + 'px'); el.style.setProperty('--gy', y.toFixed(0) + 'px');
      el.style.setProperty('--nx', (x / w - 0.5).toFixed(3)); el.style.setProperty('--ny', (y / h - 0.5).toFixed(3));
    };
    // faixa: ao sair, o brilho apaga onde está (não volta para o centro)
    const rest = el => { if (el.matches('.band') && el.style.getPropertyValue('--gx')) return; const w = el.offsetWidth, h = el.offsetHeight, f = REST(el); put(el, w * f[0], h * f[1], w, h); };
    const all = () => document.querySelectorAll(SEL).forEach(rest);
    all(); addEventListener('resize', () => { clearTimeout(window.__glR); window.__glR = setTimeout(all, 200); });
    const mm = document.querySelector('.mobile-menu'); if (mm) new MutationObserver(() => { if (!mm.hidden) rest(mm); }).observe(mm, { attributes: true, attributeFilter: ['hidden'] });
    let cur = null, ev = null, raf = 0;
    const frame = () => {
      raf = 0; if (!ev) return;
      const el = ev.target.closest && ev.target.closest(SEL);
      if (el !== cur) { if (cur) { cur.classList.remove('is-glow'); rest(cur); } cur = el; if (el) el.classList.add('is-glow'); }
      if (!el) return;
      el.classList.add('is-glow');
      const r = el.getBoundingClientRect();
      put(el, ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
    };
    addEventListener('pointermove', e => { ev = e; if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
    document.addEventListener('pointerleave', () => { if (cur) { cur.classList.remove('is-glow'); rest(cur); } cur = null; });
    // faixas: o efeito só existe com o mouse em cima — saiu (ou a página rolou), apaga
    document.querySelectorAll('.band').forEach(b => b.addEventListener('pointerleave', () => b.classList.remove('is-glow')));
    addEventListener('scroll', () => { document.querySelectorAll('.band.is-glow').forEach(b => b.classList.remove('is-glow')); }, { passive: true });
  })();

  /* ---------------- Init ---------------- */
  // "vitrine → máquina de vendas": o site se monta sozinho quando aparece; o seletor também troca no clique
  (() => {
    const sm = document.querySelector('.sm'); if (!sm) return;
    const d = document.documentElement;
    const opts = sm.querySelectorAll('.sm-opt');
    const set = m => { sm.classList.add('is-s1'); sm.classList.toggle('is-s2', m === 2); opts.forEach(o => o.setAttribute('aria-pressed', String(+o.dataset.mode === m))); };
    let auto = [];
    opts.forEach(o => o.addEventListener('click', () => { auto.forEach(clearTimeout); auto = []; set(+o.dataset.mode); }));
    // celular: um aviso por vez, no topo da janela do site, trocando sozinho
    (() => {
      const ts = [...sm.querySelectorAll('.sm-t')], win = sm.querySelector('.sm-win'); if (!ts.length || !win) return;
      let k = 0;
      const place = () => sm.style.setProperty('--sm-top', (win.offsetTop + 46) + 'px');
      const show = () => { ts.forEach((t, j) => t.classList.toggle('is-show', j === k)); };
      place(); show(); addEventListener('resize', place);
      setInterval(() => { if (innerWidth >= 600 || !sm.classList.contains('is-s2') || document.hidden) return; k = (k + 1) % ts.length; show(); }, 2600);
    })();
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || d.classList.contains('a11y-motion') || d.classList.contains('a11y-clean');
    if (still || !('IntersectionObserver' in window)) { set(2); return; }
    const io = new IntersectionObserver(es => {
      if (!es.some(x => x.isIntersecting)) return;
      io.disconnect();
      // mostra rápido a parte que interessa (vendas); no celular já entra pronto
      if (matchMedia('(max-width: 599px)').matches) { set(2); return; }
      auto.push(setTimeout(() => sm.classList.add('is-s1'), 150));
      auto.push(setTimeout(() => set(2), 800));
    }, { threshold: 0.5 });
    io.observe(sm);
  })();
  // depoimentos (celular): cada depoimento uma vez só + bolinhas mostrando onde está
  (() => {
    const wall = document.querySelector('.t-wall'); if (!wall) return;
    const seen = new Set();
    wall.querySelectorAll('.t-card:not([aria-hidden="true"])').forEach(card => {
      const k = (card.querySelector('blockquote') || card).getAttribute('data-i18n') || card.textContent.trim();
      if (seen.has(k)) card.classList.add('t-dup'); else seen.add(k);
    });
    const cards = [...wall.querySelectorAll('.t-card:not([aria-hidden="true"]):not(.t-dup)')];
    const hint = document.createElement('div'); hint.className = 't-hint'; hint.setAttribute('aria-hidden', 'true');
    cards.forEach(() => hint.appendChild(document.createElement('i')));
    wall.after(hint);
    const dots = [...hint.children]; if (dots[0]) dots[0].classList.add('is-on');
    let raf = 0;
    wall.addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => {
      raf = 0; const w = cards[0] ? cards[0].offsetWidth + (parseFloat(getComputedStyle(wall).columnGap) || 12) : 1; const i = Math.min(dots.length - 1, Math.round(wall.scrollLeft / w));
      dots.forEach((d, n) => d.classList.toggle('is-on', n === i));
    }); }, { passive: true });
    // celular: passa sozinho a cada 4s (pausa ao tocar/arrastar, volta depois; só com a seção na tela)
    const mq = matchMedia('(max-width: 599px)');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || d.classList.contains('a11y-motion') || d.classList.contains('a11y-clean');
    if (!still && cards.length > 1) {
      let timer = 0, visible = false, holdUntil = 0;
      const step = () => {
        if (!mq.matches || !visible || Date.now() < holdUntil) return;
        const w = cards[0].offsetWidth + (parseFloat(getComputedStyle(wall).columnGap) || 12), n = Math.round(wall.scrollLeft / w);
        const next = n + 1 >= cards.length ? 0 : n + 1;
        wall.scrollTo({ left: next * w, behavior: 'smooth' });
      };
      const run = () => { clearInterval(timer); timer = setInterval(step, 4000); };
      const hold = () => { holdUntil = Date.now() + 7000; };
      ['touchstart', 'pointerdown', 'wheel'].forEach(ev => wall.addEventListener(ev, hold, { passive: true }));
      new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) run(); else clearInterval(timer); }, { threshold: 0.4 }).observe(wall);
    }
  })();
  // vidro vivo (cards + CTA): as cores só se mexem enquanto estão na tela
  (() => {
    const els = document.querySelectorAll('.pillar, .proc-card, .story-quote, .cta.section');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-live')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-live', e.isIntersecting)), { rootMargin: '80px 0px' });
    els.forEach(e => io.observe(e));
  })();
  if ('scrollRestoration' in history && !location.hash) { history.scrollRestoration = 'manual'; window.scrollTo(0, 0); }
  renderA11y();
  applyTexts();
  // cards do hero: imagens e etiquetas sempre (com ou sem animações)
  (function () {
    const PJ = window.FYW_PROJECTS || {}, TC = ['t-o', 't-v', 't-b'];
    // fotos dos cards só depois da primeira pintura (ficam por trás da tela de carregamento e não atrasam o título)
    const loadImgs = () => $$('.hf-card img[data-src], .wr-thumb img[data-src]').forEach(im => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
    let imgsGo = false; const goImgs = () => { if (imgsGo) return; imgsGo = true; requestAnimationFrame(() => setTimeout(loadImgs, 0)); };
    try { new PerformanceObserver(l => { if (l.getEntries().some(e => e.name === 'first-contentful-paint')) goImgs(); }).observe({ type: 'paint', buffered: true }); } catch (e) {}
    setTimeout(goImgs, 1200);
    $$('.hf-card').forEach((el, i) => {
      const pj = PJ[el.dataset.project]; if (!pj) return;
      let tag = el.querySelector('.hf-tag');
      if (!tag) { tag = document.createElement('span'); tag.className = 'hf-tag ' + TC[i % 3]; el.appendChild(tag); }
      tag.textContent = pj.name; const tt = document.createElement("span"); tt.className = "hf-tt"; tt.textContent = " · " + pj.type; tag.appendChild(tt); if (pj.color) { tag.style.setProperty('--tc', pj.ink ? pj.color : window.__fywTagBg(pj.color), 'important'); tag.style.setProperty('color', pj.ink || '#fff', 'important'); }
    });
  })();
  // tela de carregamento: sobe até 100% quando a página e o vídeo estão prontos (no máximo ~3s)
  const loaderEl = $('.loader');
  const begin = () => { if (wantsMotion()) startMotion(true); else setCountsFinal(); };
  if (loaderEl && !d.classList.contains('no-loader')) {
    const bar = $('.loader-bar i', loaderEl), pct = $('.loader-pct', loaderEl);
    // progresso pelo tempo (não depende da taxa de quadros): sobe rápido até ~85%, completa quando tudo está pronto
    const t0 = performance.now(); let doneAt = 0, finished = false;
    const finish = () => {
      if (finished) return; finished = true; clearInterval(iv);
      bar.style.setProperty('--p', '1'); pct.textContent = '100%';
      setTimeout(() => { loaderEl.classList.add('is-out'); begin(); setTimeout(() => loaderEl.remove(), 800); }, 60);
    };
    const iv = setInterval(() => {
      const t = performance.now() - t0;
      let p = 0.85 * (1 - Math.exp(-t / 600));
      if (doneAt) p = p + (1 - p) * Math.min(1, (performance.now() - doneAt) / 160);
      bar.style.setProperty('--p', p.toFixed(3)); pct.textContent = Math.round(p * 100) + '%';
      if (doneAt && performance.now() - doneAt >= 160) finish();
    }, 40);
    // pronto = fontes carregadas (não espera fotos nem o vídeo, que entram depois sem atrapalhar)
    const pageReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const cap = new Promise(r => setTimeout(r, 2500));
    Promise.race([Promise.all([pageReady, window.__fywVideoReady]), cap]).then(() => { doneAt = performance.now(); });
  } else { if (loaderEl) loaderEl.remove(); begin(); }
  firstRun = false;
})();

/* Mural de clientes no celular: só a linha mais perto do meio da tela (ou a tocada) ganha a cor da marca */
(function () {
  if (!matchMedia('(max-width: 599px)').matches) return;
  var cells = Array.prototype.slice.call(document.querySelectorAll('.logo-wall .lw-cell:not(.lw-next)')); if (!cells.length) return;
  var cur = null, tick = false;
  var set = function (c) { if (c === cur) return; if (cur) cur.classList.remove('is-lit'); cur = c; if (c) c.classList.add('is-lit'); };
  var pick = function () { tick = false; var mid = innerHeight / 2, best = null, bd = 1e9;
    cells.forEach(function (c) { var r = c.getBoundingClientRect(); var d = Math.abs(r.top + r.height / 2 - mid); if (d < bd && d < r.height * 0.6) { bd = d; best = c; } }); set(best); };
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(pick); } }, { passive: true });
  cells.forEach(function (c) { c.addEventListener('touchstart', function () { set(c); }, { passive: true }); });
  pick();
})();
