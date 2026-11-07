/* Fyw · painel de visitas: login, números do período, origem do tráfego, páginas, cidades, visitas recentes e mapa de cliques. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const api = (a, q = '', opt) => fetch('/api/painel?a=' + a + q, Object.assign({ credentials: 'same-origin' }, opt)).then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(j.erro || r.status); e.status = r.status; throw e; } return j; });
  const fmt = n => (+n || 0).toLocaleString('pt-BR');
  const secs = s => { s = Math.round(+s || 0); return s < 60 ? s + 's' : Math.floor(s / 60) + 'min ' + (s % 60 ? (s % 60) + 's' : ''); };
  const SRC = { google: 'Google', instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', x: 'X (Twitter)', whatsapp: 'WhatsApp', bing: 'Bing', youtube: 'YouTube', chatgpt: 'ChatGPT', duckduckgo: 'DuckDuckGo', behance: 'Behance', github: 'GitHub', direto: 'Direto (digitou o endereço ou link salvo)' };
  const SRC_C = { google: '#4F7BFF', instagram: '#E1306C', facebook: '#1877F2', linkedin: '#0A66C2', whatsapp: '#25D366', direto: '#C8F53C', chatgpt: '#10A37F' };
  const NOMES = { 'beta-online': 'Beta Online', cimed: 'Cimed', globalfy: 'Globalfy', ifood: 'iFood', 'impacta-mais': 'Impacta Mais', 'jogo-pela-integridade': 'São Paulo FC', kyoto: 'Kyoto', latimpacto: 'Latimpacto', 'let-me-be': 'Let Me Be', lumiere: 'Lumière', 'pacto-global': 'Pacto Global' };
  const PAGE = p => { const m = /^\/projetos\/([a-z-]+)\.html$/.exec(p); return ({ '/': 'Início', '/projetos.html': 'Projetos', '/privacidade.html': 'Privacidade' }[p]) || (m ? 'Projeto · ' + (NOMES[m[1]] || m[1]) : p); };
  const CC = { BR: 'Brasil', US: 'Estados Unidos', PT: 'Portugal', AR: 'Argentina', CO: 'Colômbia', MX: 'México', CL: 'Chile', ES: 'Espanha', GB: 'Reino Unido', DE: 'Alemanha', FR: 'França', IT: 'Itália', CA: 'Canadá', JP: 'Japão', PE: 'Peru', UY: 'Uruguai', PY: 'Paraguai', '??': 'Desconhecido' };
  const bars = (el, list, label, color, extra) => {
    const max = Math.max(1, ...list.map(x => +x.n || 0));
    el.innerHTML = list.length ? list.map(x => '<li><span title="' + esc(x.k) + '">' + esc(label ? label(x.k) : x.k) + '</span><b>' + (extra ? extra(x) : fmt(x.n)) + '</b><i style="--w:' + Math.round((+x.n || 0) / max * 100) + '%' + (color ? ';--c:' + (color(x.k) || 'var(--acc)') : '') + '"></i></li>').join('') : '<li class="empty">Ainda sem dados neste período.</li>';
  };
  let dias = 7;

  // tema claro/escuro (lembrado neste navegador)
  try { const t = localStorage.getItem('fyw-painel-tema'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  $('#theme').addEventListener('click', () => { const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = t; try { localStorage.setItem('fyw-painel-tema', t); } catch (e) {} });

  const showLogin = () => { $('#login').hidden = false; $('#app').hidden = true; $('#sair').hidden = true; setTimeout(() => $('#senha').focus(), 50); };
  const showApp = () => { $('#login').hidden = true; $('#app').hidden = false; $('#sair').hidden = false; load(); };
  $('#lform').addEventListener('submit', async e => {
    e.preventDefault(); $('#lerr').textContent = '';
    try { await api('login', '', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha: $('#senha').value }) }); $('#senha').value = ''; showApp(); }
    catch (x) { $('#lerr').textContent = x.message; }
  });
  $('#sair').addEventListener('click', async () => { await api('logout', '', { method: 'POST' }).catch(() => {}); showLogin(); });
  document.querySelectorAll('#per .pill').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('#per .pill').forEach(x => x.classList.toggle('on', x === b)); dias = +b.dataset.d; load(); }));

  function chart(byday) {
    const W = 640, H = 220, pad = 28, n = Math.max(1, byday.length), max = Math.max(1, ...byday.map(d => +d.uv || 0));
    const bw = (W - pad) / n;
    const bars = byday.map((d, i) => { const h = Math.round((+d.uv || 0) / max * (H - 50)); const x = pad + i * bw; return '<rect x="' + (x + bw * .18).toFixed(1) + '" y="' + (H - 24 - h) + '" width="' + (bw * .64).toFixed(1) + '" height="' + h + '" rx="5" fill="var(--acc)"><title>' + d.d + ': ' + d.uv + ' visitantes · ' + d.pv + ' páginas</title></rect>' + (n <= 31 && (n <= 10 || i % Math.ceil(n / 8) === 0) ? '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="11" fill="var(--muted)">' + d.d.slice(8) + '/' + d.d.slice(5, 7) + '</text>' : ''); }).join('');
    $('#chart').innerHTML = byday.length ? '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><text x="0" y="14" font-size="11" fill="var(--muted)">' + max + '</text><line x1="' + pad + '" x2="' + W + '" y1="' + (H - 24) + '" y2="' + (H - 24) + '" stroke="var(--line)"/>' + bars + '</svg>' : '<p class="empty">Ainda sem dados neste período.</p>';
  }

  async function load() {
    $('#aerr').textContent = '';
    let s;
    try { s = await api('stats', '&dias=' + dias); }
    catch (x) { if (x.status === 401) return showLogin(); $('#aerr').textContent = x.message; return; }
    $('#live').textContent = s.live + (s.live === 1 ? ' pessoa agora' : ' pessoas agora');
    $('#k-uv').textContent = fmt(s.uv); $('#k-v').textContent = fmt(s.visits); $('#k-pv').textContent = fmt(s.pv);
    $('#k-ppv').textContent = s.visits ? (s.pv / s.visits).toFixed(1).replace('.', ',') : '0';
    $('#k-dur').textContent = secs(s.avgdur); $('#k-dep').textContent = (s.avgdepth || 0) + '%';
    chart(s.byday || []);
    bars($('#src'), s.src || [], k => SRC[k] || k, k => SRC_C[k]);
    bars($('#refs'), s.refs || []); bars($('#camp'), s.camp || []);
    bars($('#land'), s.land || [], PAGE); bars($('#pages'), s.pages || [], PAGE);
    bars($('#time'), s.time || [], PAGE, null, x => secs(x.n) + ' · ' + (x.d || 0) + '%');
    bars($('#city'), s.city || [], k => k.replace(/ · BR$/, '')); bars($('#country'), s.country || [], k => CC[k] || k);
    bars($('#dev'), s.dev || [], k => k[0].toUpperCase() + k.slice(1)); bars($('#br'), s.br || []);
    bars($('#clicks'), s.clicks || [], k => k.replace(/ ⟶ (.*)$/, (m, p) => ' · ' + PAGE(p)), () => 'var(--or)');
    sessions(); heatPages();
  }

  async function sessions() {
    let list = []; try { list = await api('sessions'); } catch (x) {}
    const el = $('#sess');
    el.innerHTML = list.length ? list.map(v => '<li data-id="' + esc(v.sid) + '"><span class="src">' + esc(SRC[v.src] ? (SRC[v.src] || '').split(' (')[0] : v.src || 'direto') + '</span><span class="mid"><b>' + esc(PAGE(v.land || '/')) + '</b><small>' + esc([v.city, CC[v.country] || v.country, v.dev].filter(Boolean).join(' · ')) + '</small></span><span class="r">' + new Date(v.last).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '<br>' + v.pages + ' pág · ' + v.clicks + ' cliques · ' + secs(v.secs) + '</span></li>').join('') : '<li class="empty" style="cursor:default;background:none;padding:0">Nenhuma visita com consentimento ainda.</li>';
    el.querySelectorAll('li[data-id]').forEach(li => li.addEventListener('click', () => openSession(li.dataset.id, list.find(v => v.sid === li.dataset.id))));
  }
  async function openSession(id, v) {
    $('#dmeta').textContent = v ? [SRC[v.src] || v.src, v.ref, v.city, CC[v.country] || v.country, v.dev, v.br].filter(Boolean).join(' · ') : '';
    $('#tl').innerHTML = '<li>Carregando…</li>'; $('#drawer').classList.add('on');
    let ev = []; try { ev = await api('session', '&id=' + encodeURIComponent(id)); } catch (x) {}
    $('#tl').innerHTML = ev.map(e => {
      const h = new Date(e.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (e.t === 'pv') return '<li><b>Abriu ' + esc(PAGE(e.p)) + '</b><small>' + h + (e.title ? ' · ' + esc(e.title) : '') + '</small></li>';
      if (e.t === 'click') return '<li class="click">Clicou em <b>' + esc(e.txt || 'um elemento') + '</b><small>' + h + ' · ' + esc(PAGE(e.p)) + (e.href ? ' · ' + esc(e.href) : '') + '</small></li>';
      return '<li class="leave">Saiu de ' + esc(PAGE(e.p)) + '<small>' + h + ' · ficou ' + secs(e.dur) + ' · rolou ' + (e.depth || 0) + '%</small></li>';
    }).join('') || '<li>Sem eventos.</li>';
  }
  $('#dx').addEventListener('click', () => $('#drawer').classList.remove('on'));

  // mapa de cliques: a página num iframe de 1440 px reduzido + pontos de calor por cima
  async function heatPages() {
    let list = []; try { list = await api('clickpages', '&dias=' + dias); } catch (x) {}
    const sel = $('#hpage'), cur = sel.value;
    sel.innerHTML = list.length ? list.map(x => '<option value="' + esc(x.k) + '">' + esc(PAGE(x.k)) + ' · ' + fmt(x.n) + ' cliques</option>').join('') : '<option value="">Sem cliques ainda</option>';
    if (cur && list.some(x => x.k === cur)) sel.value = cur;
    heat();
  }
  async function heat() {
    const p = $('#hpage').value, box = $('#heat'), fr = $('#hframe'), cv = $('#hcan');
    if (!p) { box.style.height = '120px'; fr.removeAttribute('src'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); return; }
    let pts = []; try { pts = await api('clicks', '&dias=' + dias + '&p=' + encodeURIComponent(p)); } catch (x) {}
    pts = pts.filter(q => (q[3] || 0) >= 1000); // só computador
    const k = box.clientWidth / 1440, maxY = Math.max(1800, ...pts.map(q => q[1] * 1440 / (q[3] || 1440) + 200));
    const H = Math.min(maxY, 9000);
    fr.style.height = H + 'px'; fr.style.transform = 'scale(' + k + ')';
    if (fr.getAttribute('src') !== p) fr.src = p;
    box.style.height = Math.round(H * k) + 'px';
    cv.width = box.clientWidth; cv.height = Math.round(H * k); cv.style.height = cv.height + 'px';
    const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
    pts.forEach(q => { const x = q[0] / 100 * cv.width, y = q[1] * (1440 / (q[3] || 1440)) * k; const r = 22; const grd = g.createRadialGradient(x, y, 0, x, y, r); grd.addColorStop(0, 'rgba(255,90,30,.55)'); grd.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
  }
  $('#hpage').addEventListener('change', heat);
  addEventListener('resize', () => { clearTimeout(window.__hz); window.__hz = setTimeout(heat, 300); });

  // abre direto no painel se já estiver logado
  api('me').then(showApp).catch(showLogin);
  setInterval(() => { if (!$('#app').hidden && !document.hidden) api('stats', '&dias=' + dias).then(s => { $('#live').textContent = s.live + (s.live === 1 ? ' pessoa agora' : ' pessoas agora'); }).catch(() => {}); }, 30000);
})();
