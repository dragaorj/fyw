/* Fyw · painel (/api/painel): login e dados das visitas.
   Na Vercel → Settings → Environment Variables:
     PAINEL_SENHA  = a senha do painel (você escolhe; nunca fica no código)
   O login cria um cookie assinado (HttpOnly, só no seu navegador) que vale 7 dias. */
const crypto = require('crypto');
const { rpc, ready, key } = require('./_db');
const SENHA = () => process.env.PAINEL_SENHA || '';
const SECRET = () => crypto.createHash('sha256').update('fyw-painel|' + SENHA() + '|' + key()).digest();
const DAYS7 = 7 * 24 * 3600;

const sign = v => crypto.createHmac('sha256', SECRET()).update(v).digest('base64url');
const token = () => { const exp = Math.floor(Date.now() / 1000) + DAYS7; const v = 'adm.' + exp; return v + '.' + sign(v); };
function valid(t) {
  if (!t || !SENHA()) return false;
  const i = t.lastIndexOf('.'); if (i < 0) return false;
  const v = t.slice(0, i), s = t.slice(i + 1), good = sign(v);
  if (s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return false;
  return +v.split('.')[1] > Date.now() / 1000;
}
const cookie = req => { const m = String(req.headers.cookie || '').match(/(?:^|;\s*)fyw_painel=([^;]+)/); return m ? decodeURIComponent(m[1]) : ''; };
const setCookie = (res, v, age) => res.setHeader('Set-Cookie', ['fyw_painel=' + encodeURIComponent(v) + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + age, EU]);
// marca este aparelho como seu: as suas visitas no site deixam de contar (vale 1 ano e continua depois de sair)
const EU = 'fyw_eu=1; Path=/; Secure; SameSite=Lax; Max-Age=' + 365 * 24 * 3600;
// freio contra tentativa de adivinhar a senha (por instância da função)
const tries = new Map();

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const a = (req.query && req.query.a) || '';
  let body = req.body; try { if (typeof body === 'string') body = JSON.parse(body || '{}'); } catch (x) { body = {}; }

  if (a === 'login') {
    if (req.method !== 'POST') return res.status(405).end();
    if (!SENHA()) return res.status(503).json({ erro: 'Defina PAINEL_SENHA nas variáveis da Vercel.' });
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim(), now = Date.now();
    const tr = (tries.get(ip) || []).filter(t => now - t < 10 * 60e3);
    if (tr.length >= 8) return res.status(429).json({ erro: 'Muitas tentativas. Espere alguns minutos.' });
    const given = String((body && body.senha) || ''), want = SENHA();
    const ok = given.length === want.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(want));
    if (!ok) { tr.push(now); tries.set(ip, tr); await new Promise(r => setTimeout(r, 600)); return res.status(401).json({ erro: 'Senha incorreta.' }); }
    tries.delete(ip); setCookie(res, token(), DAYS7);
    return res.status(200).json({ ok: true });
  }
  if (a === 'logout') { setCookie(res, '', 0); return res.status(200).json({ ok: true }); }
  if (!valid(cookie(req))) return res.status(401).json({ erro: 'Entre com a senha.' });
  if (!/(?:^|;s*)fyw_eu=1/.test(String(req.headers.cookie || ''))) res.setHeader('Set-Cookie', EU);
  if (a === 'me') return res.status(200).json({ ok: true, banco: ready() });
  if (!ready()) return res.status(503).json({ erro: 'Banco não conectado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY e rode supabase/fa.sql.' });

  const q = req.query || {}, dias = Math.max(1, Math.min(180, parseInt(q.dias, 10) || 7));
  try {
    if (a === 'stats') return res.status(200).json(await rpc('fa_stats', { dias }));
    if (a === 'sessions') return res.status(200).json(await rpc('fa_sessions', { lim: 80 }));
    if (a === 'session') return res.status(200).json(await rpc('fa_session', { s: String(q.id || '').slice(0, 24) }));
    if (a === 'clicks') return res.status(200).json(await rpc('fa_clicks', { path: String(q.p || '/').slice(0, 120), dias }));
    if (a === 'clickpages') return res.status(200).json(await rpc('fa_clickpages', { dias }));
  } catch (x) { return res.status(500).json({ erro: String(x.message || x).slice(0, 200) }); }
  return res.status(404).json({ erro: 'Ação desconhecida.' });
};
