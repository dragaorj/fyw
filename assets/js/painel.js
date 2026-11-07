/* Fyw · painel de visitas v2: tudo numa tela só (sem rolar a página). Menu lateral com as seções; os cartões se ajustam
   à largura da tela (mais colunas em telas grandes e ultrawide) e o que não couber rola dentro do próprio cartão. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const api = (a, q = '', opt) => fetch('/api/painel?a=' + a + q, Object.assign({ credentials: 'same-origin' }, opt)).then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(j.erro || r.status); e.status = r.status; throw e; } return j; });
  const fmt = n => (+n || 0).toLocaleString('pt-BR');
  const secs = s => { s = Math.round(+s || 0); return s < 60 ? s + 's' : Math.floor(s / 60) + 'min' + (s % 60 ? ' ' + (s % 60) + 's' : ''); };
  const ms = v => v == null || !+v ? '–' : (+v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + ' s';
  const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '0%';
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  const SRC = { google: 'Google', instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', x: 'X (Twitter)', whatsapp: 'WhatsApp', bing: 'Bing', youtube: 'YouTube', chatgpt: 'ChatGPT', duckduckgo: 'DuckDuckGo', behance: 'Behance', github: 'GitHub', tiktok: 'TikTok', threads: 'Threads', pinterest: 'Pinterest', perplexity: 'Perplexity', gemini: 'Gemini', claude: 'Claude', yahoo: 'Yahoo', direto: 'Direto' };
  const SRC_C = { google: '#4F7BFF', instagram: '#E1306C', facebook: '#1877F2', linkedin: '#0A66C2', x: '#8A8A8A', whatsapp: '#25D366', youtube: '#FF0033', tiktok: '#25F4EE', direto: '#C8F53C', chatgpt: '#10A37F', bing: '#2BB0A6' };
  const CH_C = { 'Busca': '#4F7BFF', 'Redes sociais': '#E1306C', 'Direto': '#C8F53C', 'Inteligência artificial': '#10A37F', 'Campanhas': '#FF6A2B', 'Outros sites': '#A78BFA' };
  const NOMES = { 'beta-online': 'Beta Online', cimed: 'Cimed', globalfy: 'Globalfy', ifood: 'iFood', 'impacta-mais': 'Impacta Mais', 'jogo-pela-integridade': 'São Paulo FC', kyoto: 'Kyoto', latimpacto: 'Latimpacto', 'let-me-be': 'Let Me Be', lumiere: 'Lumière', 'pacto-global': 'Pacto Global' };
  const PAGE = p => { p = String(p || '/'); const m = /^\/projetos\/([a-z-]+)(\.html)?$/.exec(p); return ({ '/': 'Início', '/projetos.html': 'Projetos', '/projetos': 'Projetos', '/privacidade.html': 'Privacidade', '/privacidade': 'Privacidade' }[p]) || (m ? 'Projeto · ' + (NOMES[m[1]] || m[1]) : p); };
  const CC = { BR: 'Brasil', US: 'Estados Unidos', PT: 'Portugal', AR: 'Argentina', CO: 'Colômbia', MX: 'México', CL: 'Chile', ES: 'Espanha', GB: 'Reino Unido', DE: 'Alemanha', FR: 'França', IT: 'Itália', CA: 'Canadá', JP: 'Japão', PE: 'Peru', UY: 'Uruguai', PY: 'Paraguai', NL: 'Holanda', IE: 'Irlanda', '??': 'Desconhecido' };
  const EMPTY = '<p class="empty">Ainda sem dados neste período.</p>';
  const bars = (list, o = {}) => {
    list = list || []; if (!list.length) return EMPTY;
    const max = Math.max(1, ...list.map(x => +x.n || 0));
    return '<ul class="bars">' + list.map(x => '<li><span title="' + esc(x.k) + '">' + esc(o.label ? o.label(x.k, x) : x.k) + '</span><b>' + (o.val ? o.val(x) : fmt(x.n)) + '</b><i style="--w:' + Math.max(2, Math.round((+x.n || 0) / max * 100)) + '%' + (o.color ? ';--c:' + (o.color(x.k) || 'var(--acc)') : '') + '"></i></li>').join('') + '</ul>';
  };
  const city = k => String(k || '').replace(/ · BR$/, '');

  /* ícones do menu */
  const I = {
    geral: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
    origem: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    redes: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
    paginas: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
    comp: '<path d="M5 3l14 8-6 2-2 6z"/>',
    publico: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    perf: '<path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/>',
    erros: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    visitas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    mapa: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'
  };
  const NETS = [['instagram', 'Instagram', 'IG'], ['facebook', 'Facebook', 'f'], ['linkedin', 'LinkedIn', 'in'], ['x', 'X (Twitter)', 'X'], ['youtube', 'YouTube', '▶'], ['tiktok', 'TikTok', 'TT'], ['whatsapp', 'WhatsApp', 'WA']];
  const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  let S = null, dias = 7, cur = 'geral', SESS = [], selSess = null;

  /* cartões de cada seção. w = colunas que ocupa, h = linhas */
  const card = (t, html, o = {}) => ({ t, html, w: o.w || 1, h: o.h || 1, sub: o.sub || '', id: o.id || '' });
  const SECTIONS = {
    geral: { name: 'Visão geral', icon: I.geral, desc: 'O resumo do período: quem veio, de onde, o que viu e onde parou.', kpis: true, cards: s => [
      card('Visitantes por dia', '<div class="chart" id="chart"></div>', { w: 2, sub: fmt(s.uv) + ' no período' }),
      card('Canais', bars(s.channels, { color: k => CH_C[k] }), { sub: 'como chegaram' }),
      card('Redes sociais', netBars(s), { sub: fmt(socialTotal(s)) + ' visitas' }),
      card('Páginas mais vistas', bars(s.pages, { label: PAGE })),
      card('Onde param (última página)', bars(s.exits, { label: PAGE, color: () => 'var(--or)' })),
      card('Cidades', bars(s.city, { label: city })),
      card('Telas', bars(s.scr, { label: k => k + ' px' }), { sub: 'resolução' }),
      card('Aparelhos', bars(s.dev, { label: cap })),
      card('Agora no site', bars(s.livepages, { label: PAGE, color: () => 'var(--gr)' }), { sub: fmt(s.live) + ' agora' })
    ].concat(big() ? [
      card('Horários (Brasília)', hours(s.hours), { w: 2 }),
      card('Contatos', bars(s.goals, { color: () => 'var(--gr)' }), { sub: fmt(s.goaltotal) + ' cliques' }),
      card('Origens', bars(s.src, { label: k => SRC[k] || k, color: k => SRC_C[k] })),
      card('Países', bars(s.country, { label: k => CC[k] || k })),
      card('Navegadores', bars(s.br)),
      card('Velocidade por aparelho', bars(s.perfdev, { label: cap, val: x => ms(x.n) })),
      card('Problemas', bars((s.errs || []).map(e => ({ k: e.k, n: e.n })), { color: () => 'var(--rd)' }), { sub: fmt(s.errtotal) })
    ] : []) },
    origem: { name: 'Origem do tráfego', icon: I.origem, desc: 'De onde as pessoas vieram antes de abrir o site.', cards: s => [
      card('Canais', bars(s.channels, { color: k => CH_C[k], val: x => fmt(x.n) + ' · ' + pct(x.n, s.visits) }), { sub: fmt(s.visits) + ' visitas' }),
      card('Origens', bars(s.src, { label: k => SRC[k] || k, color: k => SRC_C[k] }), { h: 2 }),
      card('Sites que mandaram visitas', bars(s.refs), { h: 2 }),
      card('Campanhas (utm)', bars(s.camp, { color: () => 'var(--or)' })),
      card('Primeira página da visita', bars(s.land, { label: PAGE })),
      card('Como medir suas postagens', '<p class="note">Coloque no link da bio ou do post: <b>fyw.com.br/?utm_source=instagram&amp;utm_campaign=nome-do-post</b>. Assim cada postagem aparece separada em Campanhas.<br><br>Links abertos dentro do app do Instagram ou do WhatsApp às vezes chegam como “Direto”, porque o app esconde de onde veio. O utm resolve isso.</p>')
    ] },
    redes: { name: 'Redes sociais', icon: I.redes, desc: 'Visitas que vieram de cada rede e como essas pessoas usaram o site.', cards: s => NETS.map(([k, n, ic]) => netCard(s, k, n, ic)).concat([
      card('Todas as redes', bars((s.social || []).filter(x => +x.n).sort((a, b) => b.n - a.n), { label: k => SRC[k] || k, color: k => SRC_C[k], val: x => fmt(x.n) + ' · ' + pct(x.n, socialTotal(s)) }), { sub: pct(socialTotal(s), s.visits) + ' das visitas' })
    ]) },
    paginas: { name: 'Páginas', icon: I.paginas, desc: 'O que viram, por onde entraram, o caminho que fizeram e onde pararam.', cards: s => [
      card('Mais vistas', bars(s.pages, { label: PAGE }), { h: 2, sub: fmt(s.pv) + ' no total' }),
      card('Página de entrada', bars(s.land, { label: PAGE })),
      card('Onde param (saída)', bars(s.exits, { label: PAGE, color: () => 'var(--or)' })),
      card('Caminhos', bars(s.flows, { label: k => k.split(' → ').map(PAGE).join(' → '), color: () => 'var(--bl)' }), { sub: 'de uma página para outra' }),
      card('Tempo e rolagem por página', bars(s.time, { label: PAGE, val: x => secs(x.n) + ' · ' + (x.d || 0) + '%' }), { sub: 'quem aceitou cookies' }),
      card('Agora no site', bars(s.livepages, { label: PAGE, color: () => 'var(--gr)' }), { sub: 'últimos 5 min' })
    ] },
    comp: { name: 'Comportamento', icon: I.comp, desc: 'Quando entram, se voltam, onde clicam e quantos chamam você.', cards: s => [
      card('Horários (Brasília)', hours(s.hours), { w: 2 }),
      card('Dias da semana', bars(WD.map((d, i) => ({ k: d, n: ((s.weekdays || []).find(x => +x.k === i) || {}).n || 0 })))),
      card('Novos e de volta', bars([{ k: 'Novos', n: Math.max(0, s.uv - s.returning) }, { k: 'Voltaram', n: s.returning }], { color: k => k === 'Novos' ? 'var(--acc)' : 'var(--bl)', val: x => fmt(x.n) + ' · ' + pct(x.n, s.uv) })),
      card('Contatos', bars(s.goals, { color: () => 'var(--gr)' }), { sub: fmt(s.goaltotal) + ' cliques' }),
      card('Cliques mais comuns', bars(s.clicks, { label: k => k.replace(/ ⟶ (.*)$/, (m, p) => ' · ' + PAGE(p)), color: () => 'var(--or)' }), { w: 2 }),
      card('Visita média', '<div class="gauge"><div><b>' + secs(s.sessdur) + '</b><span>tempo da visita</span></div><div><b>' + (s.sessions ? (s.pv / Math.max(1, s.visits)).toFixed(1).replace('.', ',') : '0') + '</b><span>páginas por visita</span></div><div><b>' + (s.avgdepth || 0) + '%</b><span>rolagem média</span></div><div><b>' + (s.bounce || 0) + '%</b><span>viram só 1 página</span></div></div>')
    ] },
    publico: { name: 'Público', icon: I.publico, desc: 'Onde estão e em que tela estão vendo o site.', cards: s => [
      card('Cidades', bars(s.city, { label: city }), { h: 2 }),
      card('Países', bars(s.country, { label: k => CC[k] || k })),
      card('Aparelhos', bars(s.dev, { label: cap, val: x => fmt(x.n) + ' · ' + pct(x.n, s.visits) })),
      card('Resolução da tela', bars(s.scr, { label: k => k + ' px' }), { h: 2 }),
      card('Largura da janela', bars(s.win), { sub: 'área visível do site' }),
      card('Navegadores', bars(s.br)),
      card('Idiomas', bars(s.lang, { label: k => ({ pt: 'Português', en: 'Inglês', es: 'Espanhol' }[k] || k) }))
    ] },
    perf: { name: 'Desempenho', icon: I.perf, desc: 'Quanto o site demora para abrir de verdade, medido no aparelho de cada visitante.', cards: s => perfCards(s) },
    erros: { name: 'Problemas', icon: I.erros, desc: 'Erros e arquivos que não carregaram no aparelho de quem visitou.', cards: s => [
      card('Problemas ao carregar', errTable(s.errs), { w: 9, h: 9, sub: fmt(s.errtotal) + ' no período' })
    ] },
    visitas: { name: 'Visitas', icon: I.visitas, desc: 'Cada visita, passo a passo (só de quem aceitou os cookies).', special: 'visitas' },
    mapa: { name: 'Mapa de cliques', icon: I.mapa, desc: 'Onde as pessoas clicam em cada página (computador).', special: 'mapa' }
  };
  const ORDER = ['geral', 'origem', 'redes', 'paginas', 'comp', 'publico', 'perf', 'erros', 'visitas', 'mapa'];

  function socialTotal(s) { return (s.social || []).reduce((a, x) => a + (+x.n || 0), 0); }
  function netBars(s) { return bars(NETS.map(([k, n]) => ({ k: n, n: ((s.social || []).find(x => x.k === k) || {}).n || 0, c: SRC_C[k] })), { color: k => SRC_C[(NETS.find(x => x[1] === k) || [])[0]] }); }
  function netCard(s, k, n, ic) {
    const x = (s.social || []).find(y => y.k === k) || {}, tot = socialTotal(s), c = SRC_C[k];
    return card(n, '<div class="net" style="--c:' + c + '"><div class="hd"><span class="ic"' + (k === 'tiktok' ? ' style="color:#0B0B0B"' : '') + '>' + ic + '</span><b>' + n + '</b></div>' +
      '<div class="big">' + fmt(x.n) + '<small>visitas · ' + fmt(x.who) + ' pessoas</small></div>' +
      '<div class="share"><i style="width:' + (tot ? Math.round((x.n || 0) / tot * 100) : 0) + '%"></i></div>' +
      '<dl><div><dt>Páginas</dt><dd>' + String(x.pages || 0).replace('.', ',') + '</dd></div><div><dt>Tempo</dt><dd>' + secs(x.secs) + '</dd></div><div><dt>Só 1 pág.</dt><dd>' + (x.bounce || 0) + '%</dd></div></dl></div>');
  }
  function hours(list) {
    const h = Array.from({ length: 24 }, (_, i) => +((list || []).find(x => +x.k === i) || {}).n || 0), max = Math.max(1, ...h);
    return '<div class="hrs">' + h.map((n, i) => '<i title="' + i + 'h: ' + n + ' páginas" style="height:' + Math.max(2, n / max * 100) + '%;' + (n ? '' : 'opacity:.25') + '"></i>').join('') + '</div><div class="hrsl">' + h.map((_, i) => '<span>' + (i % 3 ? '' : i) + '</span>').join('') + '</div>';
  }
  function perfCards(s) {
    const p = s.perf || {}, tot = (+p.fast || 0) + (+p.mid || 0) + (+p.slow || 0);
    const cls = (v, a, b) => !+v ? '' : v <= a ? 'ok' : v <= b ? 'warn' : 'bad';
    return [
      card('Velocidade (75% das visitas)', '<div class="gauge"><div><b class="' + cls(p.lcp75, 2500, 4000) + '">' + ms(p.lcp75) + '</b><span>conteúdo principal aparece (LCP)</span></div><div><b class="' + cls(p.load75, 3000, 6000) + '">' + ms(p.load75) + '</b><span>página carregada</span></div><div><b class="' + cls(p.ttfb75, 800, 1800) + '">' + ms(p.ttfb75) + '</b><span>servidor responde</span></div><div><b>' + ms(p.load50) + '</b><span>carregamento típico</span></div></div>', { w: 2, sub: fmt(p.n) + ' medições' }),
      card('Rápido, médio, lento', tot ? '<div class="dist"><i style="width:' + p.fast / tot * 100 + '%;background:var(--gr)"></i><i style="width:' + p.mid / tot * 100 + '%;background:#FFB020"></i><i style="width:' + p.slow / tot * 100 + '%;background:var(--rd)"></i></div>' + bars([{ k: 'Rápido (até 2,5 s)', n: p.fast }, { k: 'Médio (2,5 a 4 s)', n: p.mid }, { k: 'Lento (mais de 4 s)', n: p.slow }], { color: k => /Rápido/.test(k) ? 'var(--gr)' : /Médio/.test(k) ? '#FFB020' : 'var(--rd)', val: x => fmt(x.n) + ' · ' + pct(x.n, tot) }) : EMPTY),
      card('Por aparelho', bars(s.perfdev, { label: cap, val: x => ms(x.n) + ' · ' + fmt(x.c) })),
      card('Páginas mais lentas', bars(s.slow, { label: PAGE, val: x => ms(x.n), color: k => { const v = ((s.slow || []).find(y => y.k === k) || {}).n; return v > 4000 ? 'var(--rd)' : v > 2500 ? '#FFB020' : 'var(--gr)'; } }), { w: 2 }),
      card('Como ler', '<p class="note"><b class="ok">Verde</b>: abre rápido. <b class="warn">Amarelo</b>: dá para melhorar. <b class="bad">Vermelho</b>: a pessoa espera demais e pode desistir.<br><br>O número mostra o tempo em que 75% das visitas já viram a página, o mesmo critério que o Google usa.</p>')
    ];
  }
  function errTable(list) {
    if (!list || !list.length) return '<p class="empty">Nenhum problema registrado neste período. 🎉</p>';
    return '<table class="etab"><thead><tr><th>Problema</th><th>Página</th><th>Arquivo</th><th>Vezes</th><th>Última</th></tr></thead><tbody>' + list.map(e => '<tr><td title="' + esc(e.k) + '">' + esc(e.k) + '</td><td>' + esc(PAGE(e.p)) + '</td><td style="word-break:break-all">' + esc(e.href || '–') + '</td><td>' + fmt(e.n) + '</td><td>' + new Date(e.last).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</td></tr>').join('') + '</tbody></table>';
  }
  function kpis(s) {
    const k = (t, v, sub) => '<div class="kpi"><h4>' + t + '</h4><b>' + v + '</b><span>' + sub + '</span></div>';
    return '<div class="kpis">' + [
      k('Agora', fmt(s.live), 'no site (5 min)'),
      k('Visitantes', fmt(s.uv), fmt(s.returning) + ' voltaram'),
      k('Visitas', fmt(s.visits), fmt(socialTotal(s)) + ' das redes'),
      k('Páginas', fmt(s.pv), (s.visits ? (s.pv / s.visits).toFixed(1).replace('.', ',') : '0') + ' por visita'),
      k('Rejeição', (s.bounce || 0) + '%', 'viram só 1 página'),
      k('Tempo', secs(s.sessdur), 'rolagem ' + (s.avgdepth || 0) + '%'),
      k('Contatos', fmt(s.goaltotal), 'WhatsApp, e-mail…'),
      k('Velocidade', ms((s.perf || {}).lcp75), fmt(s.errtotal) + ' problemas')
    ].join('') + '</div>';
  }

  /* grade: colunas pela largura disponível; linhas dividem a altura da tela */
  function big() { return cols() >= 5 || (cols() >= 4 && innerHeight >= 1250); }
  function cols() { const w = $('#sec').clientWidth; return w >= 2700 ? 6 : w >= 2100 ? 5 : w >= 1100 ? 4 : w >= 760 ? 3 : 2; }
  function layout(list) {
    const C = cols(), occ = [], at = (r, c) => (occ[r] || [])[c];
    const mark = cd => { for (let y = cd.r; y < cd.r + cd.h; y++) { occ[y] = occ[y] || []; for (let x = cd.c; x < cd.c + cd.w; x++) occ[y][x] = cd; } };
    list.forEach(cd => {
      if (cd.w >= 9) { cd.w = C; cd.h = 1; }
      cd.w = Math.min(cd.w, C);
      for (let r = 0, done = false; !done; r++) for (let c = 0; c + cd.w <= C && !done; c++) {
        let ok = true; for (let y = r; y < r + cd.h && ok; y++) for (let x = c; x < c + cd.w; x++) if (at(y, x)) { ok = false; break; }
        if (ok) { cd.r = r; cd.c = c; mark(cd); done = true; }
      }
    });
    // buracos: o cartão ao lado se estica para preencher (nada fica vazio)
    const rows = occ.length;
    for (let y = 0; y < rows; y++) for (let x = 0; x < C; x++) if (!at(y, x)) {
      const left = x > 0 && at(y, x - 1);
      if (left && left.r === y && left.h === 1) { left.w++; mark(left); continue; }
      const up = y > 0 && at(y - 1, x);
      if (up && up.w === 1 && up.c === x) { up.h++; mark(up); }
    }
    return { C, rows };
  }
  function render() {
    const def = SECTIONS[cur];
    $('#title').textContent = def.name; $('#sub').textContent = def.desc + (S ? ' · ' + ({ 1: 'hoje', 7: 'últimos 7 dias', 30: 'últimos 30 dias', 90: 'últimos 90 dias' }[dias]) : '');
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.s === cur));
    if (def.special === 'visitas') return renderVisitas();
    if (def.special === 'mapa') return renderMapa();
    if (!S) return;
    const list = def.cards(S), L = layout(list), o = def.kpis ? 2 : 1, sec = $('#sec');
    sec.style.gridTemplateColumns = 'repeat(' + L.C + ', minmax(0, 1fr))';
    sec.style.gridTemplateRows = (def.kpis ? 'auto ' : '') + 'repeat(' + L.rows + ', minmax(0, 1fr))';
    sec.innerHTML = (def.kpis ? kpis(S) : '') + list.map(c => '<section class="card" style="grid-column:' + (c.c + 1) + ' / span ' + c.w + ';grid-row:' + (c.r + o) + ' / span ' + c.h + '"><h3>' + esc(c.t) + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') + '</h3><div class="body">' + c.html + '</div></section>').join('');
    if (def.kpis || $('#chart')) chart(S.byday || []);
  }
  function chart(byday) {
    const el = $('#chart'); if (!el) return;
    if (!byday.length) { el.innerHTML = EMPTY; return; }
    const W = Math.max(200, el.clientWidth), H = Math.max(80, el.clientHeight), pb = 18, n = byday.length, max = Math.max(1, ...byday.map(d => +d.uv || 0)), bw = W / n;
    const lab = Math.ceil(n / Math.max(1, Math.floor(W / 46)));
    el.innerHTML = '<svg width="' + W + '" height="' + H + '"><line x1="0" x2="' + W + '" y1="' + (H - pb) + '" y2="' + (H - pb) + '" stroke="var(--line)"/><text x="0" y="10" font-size="10" fill="var(--muted)">' + max + '</text>' + byday.map((d, i) => {
      const h = Math.round((+d.uv || 0) / max * (H - pb - 16)), x = i * bw, bwi = Math.min(48, bw * .64);
      return '<rect x="' + (x + (bw - bwi) / 2).toFixed(1) + '" y="' + (H - pb - h) + '" width="' + bwi.toFixed(1) + '" height="' + h + '" rx="4" fill="var(--acc)"><title>' + d.d.slice(8) + '/' + d.d.slice(5, 7) + ': ' + d.uv + ' visitantes · ' + d.pv + ' páginas</title></rect>' + (i % lab === 0 ? '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="10" fill="var(--muted)">' + d.d.slice(8) + '/' + d.d.slice(5, 7) + '</text>' : '');
    }).join('') + '</svg>';
  }

  /* visitas: lista + linha do tempo ao lado */
  async function renderVisitas() {
    const C = cols(), sec = $('#sec'), lw = C >= 4 ? 2 : 1;
    sec.style.gridTemplateColumns = 'repeat(' + C + ', minmax(0, 1fr))'; sec.style.gridTemplateRows = 'minmax(0, 1fr)';
    sec.innerHTML = '<section class="card" style="grid-column:span ' + lw + '"><h3>Visitas recentes<small id="scount"></small></h3><div class="body"><ul class="sess" id="sess"><li class="empty" style="background:none">Carregando…</li></ul></div></section><section class="card" style="grid-column:span ' + (C - lw) + '"><h3>Passo a passo<small id="swhen"></small></h3><div class="body" id="sdet"><p class="empty">Escolha uma visita na lista.</p></div></section>';
    try { SESS = await api('sessions'); } catch (x) { SESS = []; }
    if (cur !== 'visitas') return;
    $('#scount').textContent = SESS.length + ' visitas';
    $('#sess').innerHTML = SESS.length ? SESS.map(v => '<li data-id="' + esc(v.sid) + '"><span class="tag" style="' + (SRC_C[v.src] ? 'background:' + SRC_C[v.src] + ';color:#0B0B0B' : '') + '">' + esc(SRC[v.src] || v.src || 'Direto') + '</span><span class="mid"><b>' + esc(PAGE(v.land || '/')) + (v.exitp && v.exitp !== v.land ? ' → ' + esc(PAGE(v.exitp)) : '') + '</b><small>' + esc([city(v.city), CC[v.country] || v.country, cap(v.dev), v.scr ? v.scr + ' px' : ''].filter(Boolean).join(' · ')) + '</small></span><span class="r">' + new Date(v.last).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '<br>' + v.pages + ' pág · ' + secs(v.secs) + (v.goals ? ' · <span class="ok">contato</span>' : '') + (v.errs ? ' · <span class="bad">erro</span>' : '') + '</span></li>').join('') : '<li class="empty" style="background:none;cursor:default">Nenhuma visita com consentimento ainda.</li>';
    $('#sess').querySelectorAll('li[data-id]').forEach(li => li.addEventListener('click', () => openSession(li.dataset.id)));
    const first = selSess && SESS.find(v => v.sid === selSess) ? selSess : SESS[0] && SESS[0].sid;
    if (first) openSession(first);
  }
  async function openSession(id) {
    selSess = id; const v = SESS.find(x => x.sid === id) || {};
    document.querySelectorAll('#sess li').forEach(li => li.classList.toggle('on', li.dataset.id === id));
    const tag = t => t ? '<span class="tag">' + esc(t) + '</span>' : '';
    const meta = '<div class="meta">' + [SRC[v.src] || v.src || 'Direto', v.ref ? 'veio de ' + v.ref.replace(/^https?:\/\//, '').slice(0, 50) : '', [city(v.city), CC[v.country] || v.country].filter(Boolean).join(', '), cap(v.dev), v.br, v.scr ? 'tela ' + v.scr + ' px' : '', v.w ? 'janela ' + v.w + (v.vh ? '×' + v.vh : '') + ' px' : '', v.pages + ' páginas', v.clicks + ' cliques', 'ficou ' + secs(v.secs)].map(tag).join('') + '</div>';
    $('#sdet').innerHTML = meta + '<p class="empty">Carregando…</p>';
    $('#swhen').textContent = v.start ? new Date(v.start).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    let ev = []; try { ev = await api('session', '&id=' + encodeURIComponent(id)); } catch (x) {}
    if (selSess !== id || !$('#sdet')) return;
    $('#sdet').innerHTML = meta + '<ul class="tl">' + (ev.map(e => {
      const h = new Date(e.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (e.t === 'pv') return '<li><b>Abriu ' + esc(PAGE(e.p)) + '</b><small>' + h + (e.title ? ' · ' + esc(e.title) : '') + '</small></li>';
      if (e.t === 'click') return '<li class="click">Clicou em <b>' + esc(e.txt || 'um elemento') + '</b><small>' + h + ' · ' + esc(PAGE(e.p)) + (e.href ? ' · ' + esc(e.href) : '') + '</small></li>';
      if (e.t === 'goal') return '<li class="goal"><b>Contato: ' + esc(e.txt) + '</b><small>' + h + ' · ' + esc(PAGE(e.p)) + '</small></li>';
      if (e.t === 'err') return '<li class="err"><b>Problema: ' + esc(e.txt) + '</b><small>' + h + ' · ' + esc(PAGE(e.p)) + (e.href ? ' · ' + esc(e.href) : '') + '</small></li>';
      if (e.t === 'perf') return '<li class="leave">Carregou ' + esc(PAGE(e.p)) + ' em <b>' + ms(e.lcp || e.load) + '</b><small>' + h + '</small></li>';
      return '<li class="leave">Saiu de ' + esc(PAGE(e.p)) + '<small>' + h + ' · ficou ' + secs(e.dur) + ' · rolou ' + (e.depth || 0) + '%</small></li>';
    }).join('') || '<li>Sem eventos.</li>') + '</ul>';
  }

  /* mapa de cliques */
  async function renderMapa() {
    const sec = $('#sec');
    sec.style.gridTemplateColumns = '1fr'; sec.style.gridTemplateRows = 'minmax(0, 1fr)';
    sec.innerHTML = '<section class="card"><div class="hbar"><select class="pill" id="hpage"><option>Carregando…</option></select><span class="note" id="hnote"></span></div><div class="heatbox" id="hbox"><div class="heat" id="heat"><div class="vp" id="hvp"><iframe id="hframe" title="Página" tabindex="-1"></iframe></div><canvas id="hcan"></canvas></div></div></section>';
    let list = []; try { list = await api('clickpages', '&dias=' + dias); } catch (x) {}
    if (cur !== 'mapa') return;
    const sel = $('#hpage');
    sel.innerHTML = list.length ? list.map(x => '<option value="' + esc(x.k) + '">' + esc(PAGE(x.k)) + ' · ' + fmt(x.n) + ' cliques</option>').join('') : '<option value="">Sem cliques ainda</option>';
    sel.addEventListener('change', heat); heat();
  }
  let PTS = [];
  async function heat() {
    const sel = $('#hpage'); if (!sel) return;
    const p = sel.value, fr = $('#hframe'), wrap = $('#hbox');
    if (!p) { fr.removeAttribute('src'); return; }
    let pts = []; try { pts = await api('clicks', '&dias=' + dias + '&p=' + encodeURIComponent(p)); } catch (x) {}
    const all = pts.length; PTS = pts.filter(q => (q[3] || 0) >= 1000);
    $('#hnote').textContent = PTS.length + ' cliques no computador' + (all > PTS.length ? ' · ' + (all - PTS.length) + ' no celular ficam fora do mapa' : '');
    if (fr.getAttribute('src') !== p) { fr.onload = () => { try { const st = fr.contentDocument.createElement('style'); st.textContent = '.cookie{display:none!important}'; fr.contentDocument.head.appendChild(st); } catch (x) {} try { const w = fr.contentWindow; w.addEventListener('load', () => setTimeout(heatDraw, 300)); } catch (x) {} setTimeout(heatDraw, 800); setTimeout(heatDraw, 2500); }; fr.src = p; wrap.scrollTop = 0; }
    heatDraw();
  }
  function heatDraw() {
    const fr = $('#hframe'), cv = $('#hcan'), wrap = $('#hbox'), box = $('#heat'), vp = $('#hvp'); if (!fr || !wrap) return;
    // escala: a página em 1440 px reduzida para caber (nunca ampliada)
    const k = Math.min(1, (wrap.clientWidth - 2) / 1440), vw = Math.round(1440 * k), vh = wrap.clientHeight;
    fr.style.height = Math.round(vh / k) + 'px'; fr.style.transform = 'scale(' + k + ')';
    vp.style.width = vw + 'px'; vp.style.height = vh + 'px';
    let H = 0; try { const d = fr.contentDocument; H = Math.max(d.documentElement.scrollHeight, d.body ? d.body.scrollHeight : 0); } catch (x) {}
    if (!H) H = Math.max(1800, ...PTS.map(q => q[1] * 1440 / (q[3] || 1440) + 300));
    const th = Math.round(H * k);
    box.style.width = vw + 'px'; box.style.height = th + 'px';
    vp.style.marginBottom = -vh + 'px';
    cv.width = vw; cv.height = th; cv.style.width = vw + 'px'; cv.style.height = th + 'px';
    const g = cv.getContext('2d'); g.clearRect(0, 0, vw, th);
    PTS.forEach(q => { const x = q[0] / 100 * vw, y = (q[2] ? q[1] / q[2] * H : q[1]) * k, r = 22, grd = g.createRadialGradient(x, y, 0, x, y, r); grd.addColorStop(0, 'rgba(255,90,30,.65)'); grd.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
    wrap.onscroll = heatSync; heatSync();
  }
  function heatSync() {
    const fr = $('#hframe'), wrap = $('#hbox'); if (!fr || !wrap) return;
    const k = Math.min(1, (wrap.clientWidth - 2) / 1440), y = wrap.scrollTop / k;
    try { const w = fr.contentWindow; if (w.__lenis) w.__lenis.scrollTo(y, { immediate: true, force: true }); else w.scrollTo(0, y); } catch (x) {}
  }

  /* dados */
  async function load() {
    $('#aerr').textContent = '';
    try { S = await api('stats', '&dias=' + dias); }
    catch (x) { if (x.status === 401) return showLogin(); $('#aerr').textContent = x.message; return; }
    $('#live').textContent = S.live + (S.live === 1 ? ' pessoa agora' : ' pessoas agora');
    const eb = document.querySelector('#nav [data-s="erros"] b'); if (eb) { eb.textContent = S.errtotal; eb.hidden = !S.errtotal; }
    render();
  }

  /* menu, período, tema, login */
  $('#nav').innerHTML = ORDER.map(k => '<button type="button" data-s="' + k + '"><svg viewBox="0 0 24 24">' + SECTIONS[k].icon + '</svg><span>' + SECTIONS[k].name + '</span>' + (k === 'erros' ? '<b hidden></b>' : '') + '</button>').join('');
  $('#nav').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = b.dataset.s; try { history.replaceState(null, '', '#' + cur); } catch (x) {} render(); });
  if (SECTIONS[location.hash.slice(1)]) cur = location.hash.slice(1);
  document.querySelectorAll('#per button').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('#per button').forEach(x => x.classList.toggle('on', x === b)); dias = +b.dataset.d; load(); }));
  try { const t = localStorage.getItem('fyw-painel-tema'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  $('#theme').addEventListener('click', () => { const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = t; try { localStorage.setItem('fyw-painel-tema', t); } catch (e) {} });
  // este aparelho é seu: as suas visitas no site deixam de contar
  const marcaEu = () => { try { localStorage.setItem('fyw-eu', '1'); } catch (e) {} };
  const showLogin = () => { $('#login').hidden = false; $('#app').hidden = true; setTimeout(() => $('#senha').focus(), 50); };
  const showApp = () => { marcaEu(); $('#login').hidden = true; $('#app').hidden = false; load(); };
  $('#lform').addEventListener('submit', async e => {
    e.preventDefault(); $('#lerr').textContent = '';
    try { await api('login', '', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha: $('#senha').value }) }); $('#senha').value = ''; showApp(); }
    catch (x) { $('#lerr').textContent = x.message; }
  });
  $('#sair').addEventListener('click', async () => { await api('logout', '', { method: 'POST' }).catch(() => {}); showLogin(); });
  addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(() => { if (cur === 'mapa') heat(); else if (cur !== 'visitas') render(); }, 200); });

  api('me').then(showApp).catch(showLogin);
  // atualiza sozinho a cada 30 s (sem mexer em Visitas e no Mapa)
  setInterval(() => { if ($('#app').hidden || document.hidden) return; api('stats', '&dias=' + dias).then(s => { S = s; $('#live').textContent = s.live + (s.live === 1 ? ' pessoa agora' : ' pessoas agora'); if (cur !== 'visitas' && cur !== 'mapa') render(); }).catch(() => {}); }, 30000);
})();
