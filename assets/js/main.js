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
    return DICT[n] ? n : 'pt';
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
  if (!store.get('fio-consent', null)) setTimeout(() => showCookie(true), 900);

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
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
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
          .from('.aura i', { scale: 0.4, opacity: 0, duration: 2.2, stagger: 0.15 }, 0)
          .from('.nav', { y: -90, opacity: 0, duration: 1.2, clearProps: 'all' }, 0.6);
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
        allCards.forEach(el => { const im = el.querySelector('img[data-src]'); if (im) { im.src = im.dataset.src; im.removeAttribute('data-src'); } });
        const PJ = window.FYW_PROJECTS || {}, TC = ['t-o', 't-v', 't-b'];
        fCards.forEach((el, i) => {
          const pj = PJ[el.dataset.project]; if (!pj) return;
          let tag = el.querySelector('.hf-tag');
          if (!tag) { tag = document.createElement('span'); tag.className = 'hf-tag ' + TC[i % 3]; el.appendChild(tag); }
          tag.textContent = pj.type;
        });
        const ROT = fCards.map(el => parseFloat(el.style.getPropertyValue('--r')) || 0);
        const PILE = [-6, 4, -2, 7, -4, 3, -7, 5, -3];
        const S = fCards.map(() => ({ x: 0, y: 0, r: 0, s: 1, a: 1 }));
        const fanOff = (i, w) => { const sp = w * (mob ? 0.64 : 0.6); return { x: (i - mid) * sp, y: Math.abs(i - mid) * w * (mob ? 0.03 : 0.05), r: ROT[i] }; };
        const pile = i => ({ x: (i % 3 - 1) * 4, y: 0, r: PILE[i % PILE.length] });
        // card i -> linha de trabalho (os 5 do meio vão para as 5 linhas; os outros saem de cena)
        const rowsAll = $$('.work-row');
        // a lista mostra no máximo uma linha por card visível (no celular há menos cards)
        rowsAll.forEach((r, k) => { r.hidden = k >= n; });
        const rows = rowsAll.filter(r => !r.hidden);
        const firstMapped = rows.length >= n ? 0 : Math.max(0, Math.round(mid) - Math.floor(rows.length / 2));
        const rowOf = i => { const k = i - firstMapped; return k >= 0 && k < rows.length ? k : -1; };
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
            let cx = G.fx + st.x, cy = G.fy + st.y, w = G.fw * st.s, hgt = w, rot = st.r, op = st.a, rad = 14;
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
            const z = A.p > 0.02 ? (k < 0 ? 1 : 100 - k) : baseZ[i];
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
        gsap.ticker.add(() => {
          const y = window.scrollY;
          const target = clamp01(y / (G.heroH * 0.9)) * PMAX;
          const d = target - A.p;
          if (Math.abs(d) > 0.0004) { A.p += d * 0.2; dirty = true; } else if (A.p !== target) { A.p = target; dirty = true; }
          // os nomes só se apagam quando a lista sai da tela e sobra só o hero
          if (namesOn && G.workTop > y + innerHeight) {
            namesOn = false; G.rows.forEach(R => R.chars.forEach(ch => { if (ch.on) { ch.on = false; ch.el.classList.remove('on'); } }));
          }
          if (dirty || y !== lastY) { lastY = y; dirty = false; render(); const on = A.p > GATHER; if (on !== workOn) { workOn = on; $('.work').classList.toggle('is-on', on); } }
        });
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
      if (heroSub) gsap.from(blurWords(heroSub), { y: 10, filter: 'blur(8px)', duration: 0.9, ease: 'power3.out', stagger: 0.02, delay: intro ? 0.5 : 0.1, clearProps: 'filter' });
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
        if (p.classList && p.classList.contains('chip')) stl.to(p, { scale: 1, width: '1.6em', ease: 'power2.inOut', duration: 2.4 }, i * 0.5);
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
      gsap.fromTo('.story-year', { yPercent: 10 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true } });
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
      mm.add({ sm: '(max-width: 599px)', md: '(min-width: 600px)' }, cnd => {
        const cols = cnd.conditions.sm ? 3 : 5;
        const mid = Math.floor(cols / 2);
        const colY = el => { const ci = tiles.indexOf(el) % cols; return ci === mid ? 0 : (ci % 2 ? -1 : 1) * (cnd.conditions.sm ? 50 : 90); };
        gsap.timeline({ scrollTrigger: { trigger: '.zoom-pin', start: 'top top', end: '+=230%', scrub: 0.8, pin: '.zoom-pin', invalidateOnRefresh: true } })
          .fromTo('.zoom-grid', { scale: 0.82 }, { scale: 1, ease: 'power1.inOut', duration: 0.6 }, 0)
          .fromTo(others, { y: 0 }, { y: (i, el) => -colY(el), ease: 'none', duration: 0.8 }, 0.15)
          .to(others, { filter: 'blur(10px)', ease: 'power1.in', duration: 0.55 }, 0.45)
          .to(others, { scale: 0.7, opacity: 0, ease: 'power1.in', duration: 0.6, stagger: { each: 0.025, from: 'center' } }, 0.85)
          .to(center, { scale: coverScale, borderRadius: 0, ease: 'power2.inOut', duration: 1 }, 0.95)
          .to(center.querySelector('img'), { scale: 1.1, ease: 'none', duration: 1 }, 0.95)
          .to(center, { '--shade': 1, ease: 'none', duration: 0.4 }, 1.55)
          .fromTo('.zoom-final', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.35, onStart: () => $('.zoom').classList.add('is-final'), onReverseComplete: () => $('.zoom').classList.remove('is-final') }, 1.75)
          .set({}, {}, 2.3);
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
      gsap.from('.zoom-intro > *', { y: 30, opacity: 0, duration: 1.1, ease: E, stagger: 0.1, scrollTrigger: { trigger: '.zoom', start: 'top 70%' } });

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
        const loop = dir > 0 ? gsap.to(tracks, { xPercent: -50, ease: 'none', duration: 26, repeat: -1 }) : gsap.fromTo(tracks, { xPercent: -50 }, { xPercent: 0, ease: 'none', duration: 26, repeat: -1 });
        ScrollTrigger.create({
          trigger: wrap, start: 'top bottom', end: 'bottom top',
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
      idle(runQ);
    });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------------- Física das logos ---------------- */
  let phys = null;
  function loadMatter() {
    if (window.Matter) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
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
    d.classList.add('has-cursor');
    // segue o mouse sem atraso, como a seta do sistema (1 atualização por quadro, só transform)
    let mx = -50, my = -50, craf = 0;
    const place = () => { craf = 0; cur.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)'; };
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (!craf) craf = requestAnimationFrame(place); }, { passive: true });
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
    const top0 = document.elementsFromPoint(x, y).find(el => !dock.contains(el) && !el.closest('.cursor'));
    const overZoom = !!(top0 && top0.closest('.zoom'));
    const zp = overZoom && document.querySelector(".zoom.is-final .zoom-pin");
    if (zp) { const r = zp.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return 0.25; }
    const zgr = overZoom && document.querySelector(".zoom-grid"); if (zgr) { for (const t of zgr.querySelectorAll(".zg")) { const r = t.getBoundingClientRect(); if (getComputedStyle(t).opacity > 0.5 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return 0.3; } }
    const els = document.elementsFromPoint(x, y).filter(el => !dock.contains(el) && !el.classList.contains('cursor') && !el.closest('.cursor'));
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
  let toneRaf = 0;
  function syncDockTone() {
    if (toneRaf) return;
    toneRaf = requestAnimationFrame(() => {
      toneRaf = 0;
      const r = dock.getBoundingClientRect();
      dock.classList.toggle('on-dark', lumAt(r.left + r.width / 2, r.top + r.height / 2) < 0.5);
    });
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

  /* ---------------- Vídeo de fundo do hero: um por tema, os dois ficam prontos (troca instantânea) ---------------- */
  window.__fywVideoReady = new Promise(res => { window.__fywVideoDone = res; });
  (function () {
    const box = $(".hero-video"); if (!box) { window.__fywVideoDone(); return; }
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
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&mute=1&controls=0&loop=1&playlist=" + id + "&enablejsapi=1&origin=" + encodeURIComponent(location.origin) + "&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0";
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
    go(); // carrega o vídeo já na abertura (junto com o site)
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
      const h1 = el.closest('.hero-title'); h1.style.minHeight = '';
      let mh = 0; list.forEach(s => { el.textContent = s; mh = Math.max(mh, h1.offsetHeight); });
      h1.style.minHeight = mh + 'px';
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
            p = (p + 1) % list.length; i = 0; el.textContent = ''; el.classList.remove('is-out');
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
      raf = 0; const w = cards[0] ? cards[0].offsetWidth + 12 : 1; const i = Math.min(dots.length - 1, Math.round(wall.scrollLeft / w));
      dots.forEach((d, n) => d.classList.toggle('is-on', n === i));
    }); }, { passive: true });
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
    $$('.hf-card').forEach((el, i) => {
      const im = el.querySelector('img[data-src]'); if (im) { im.src = im.dataset.src; im.removeAttribute('data-src'); }
      const pj = PJ[el.dataset.project]; if (!pj) return;
      let tag = el.querySelector('.hf-tag');
      if (!tag) { tag = document.createElement('span'); tag.className = 'hf-tag ' + TC[i % 3]; el.appendChild(tag); }
      tag.textContent = pj.type;
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
      setTimeout(() => { loaderEl.classList.add('is-out'); begin(); setTimeout(() => loaderEl.remove(), 1100); }, 220);
    };
    const iv = setInterval(() => {
      const t = performance.now() - t0;
      let p = 0.85 * (1 - Math.exp(-t / 600));
      if (doneAt) p = p + (1 - p) * Math.min(1, (performance.now() - doneAt) / 300);
      bar.style.setProperty('--p', p.toFixed(3)); pct.textContent = Math.round(p * 100) + '%';
      if (doneAt && performance.now() - doneAt >= 300) finish();
    }, 40);
    const pageReady = new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }));
    const cap = new Promise(r => setTimeout(r, 2200));
    Promise.race([Promise.all([pageReady, window.__fywVideoReady]), cap]).then(() => { doneAt = performance.now(); setTimeout(finish, 450); });
  } else { if (loaderEl) loaderEl.remove(); begin(); }
  firstRun = false;
})();
