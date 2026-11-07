/* Fyw · coleta das visitas (/api/t). Recebe os eventos do assets/js/fa.js e grava no Supabase (tabela fa_events).
   Não guarda IP: o visitante sem consentimento vira um código que muda todo dia (só para contar visitantes únicos).
   Cidade e país vêm dos cabeçalhos da Vercel. */
const crypto = require('crypto');
const { insert, rpc, ready, key } = require('./_db');

const clean = (s, n) => { const v = String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, '').slice(0, n); return v || null; };
function source(ref, utm) {
  if (utm) return utm.toLowerCase();
  if (!ref) return 'direto';
  let h = ''; try { h = new URL(ref).hostname.replace(/^(www|m|l|lm|out|mobile)\./, ''); } catch (e) { return 'direto'; }
  const M = [[/google\./, 'google'], [/instagram\.com/, 'instagram'], [/facebook\.com|fb\.me/, 'facebook'], [/linkedin\.com|lnkd\.in/, 'linkedin'], [/^t\.co$|twitter\.com|x\.com/, 'x'],
    [/whatsapp|wa\.me/, 'whatsapp'], [/bing\.com/, 'bing'], [/youtube\.com|youtu\.be/, 'youtube'], [/chatgpt\.com|openai\.com/, 'chatgpt'], [/duckduckgo/, 'duckduckgo'], [/behance\.net/, 'behance'], [/github\.com/, 'github']];
  for (const [re, n] of M) if (re.test(h)) return n;
  return h;
}
function device(ua, w) {
  const tab = /iPad|Tablet/i.test(ua), mob = !tab && /Mobi|Android|iPhone/i.test(ua);
  const kind = tab ? 'tablet' : mob || (w && w < 700) ? 'celular' : 'computador';
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'outro';
  const br = /Instagram/.test(ua) ? 'Instagram' : /FBAN|FBAV/.test(ua) ? 'Facebook' : /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'outro';
  return { kind, br: br + ' · ' + os };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  if (!ready()) return res.status(204).end(); // banco ainda não conectado: ignora sem erro
  let e = req.body;
  try { if (typeof e === 'string') e = JSON.parse(e); else if (Buffer.isBuffer(e)) e = JSON.parse(e.toString()); } catch (x) { return res.status(400).end(); }
  if (!e || typeof e !== 'object' || !['pv', 'click', 'leave'].includes(e.t)) return res.status(400).end();
  const ua = String(req.headers['user-agent'] || '');
  if (/bot|crawl|spider|lighthouse|headless|preview|facebookexternalhit/i.test(ua)) return res.status(204).end();

  const sid = clean(e.sid, 24);
  if (e.t !== 'pv' && !sid) return res.status(204).end(); // cliques e tempo só com consentimento
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const day = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  const anon = crypto.createHash('sha256').update(ip + '|' + ua + '|' + day + '|' + key().slice(-12)).digest('hex').slice(0, 16);
  let city = clean(req.headers['x-vercel-ip-city'], 60); try { if (city) city = decodeURIComponent(city); } catch (x) {}
  const dev = device(ua, +e.w || 0), ref = clean(e.ref, 200);
  let refHost = null; try { if (ref) refHost = new URL(ref).hostname.replace(/^www\./, ''); } catch (x) {}
  const num = (v, lo, hi) => { const n = +v; return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : null; };
  const row = {
    t: e.t, p: clean(e.p, 120) || '/', sid, who: clean(e.vid, 24) || anon, first: !!e.first,
    country: clean(req.headers['x-vercel-ip-country'], 4), city, region: clean(req.headers['x-vercel-ip-country-region'], 10),
    dev: dev.kind, br: dev.br, lang: clean(e.l, 4), w: num(e.w, 0, 10000)
  };
  if (e.t === 'pv') Object.assign(row, { title: clean(e.title, 90), ref, ref_host: refHost, src: source(ref, clean(e.source, 40)), campaign: clean(e.campaign, 60) });
  if (e.t === 'click') Object.assign(row, { x: num(e.x, 0, 100), y: num(e.y, 0, 1e6), h: num(e.h, 0, 1e6), txt: clean(e.txt, 60), href: clean(e.href, 120) });
  if (e.t === 'leave') Object.assign(row, { dur: num(e.dur, 0, 3600), depth: num(e.depth, 0, 100) });
  try {
    await insert([row]);
    if (Math.random() < .002) rpc('fa_cleanup').catch(() => {}); // de vez em quando apaga o que passou de 180 dias
  } catch (x) { return res.status(500).end(); }
  res.status(204).end();
};
module.exports._source = source;
