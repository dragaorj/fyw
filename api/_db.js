/* Fyw · acesso ao banco (Supabase, pela API REST). Arquivo com "_" não vira rota na Vercel.
   Na Vercel → Settings → Environment Variables:
     SUPABASE_URL               = https://SEU-PROJETO.supabase.co   (Supabase → Project Settings → API)
     SUPABASE_SERVICE_ROLE_KEY  = chave secreta: "sb_secret_…" (API Keys) ou "service_role" (Legacy API Keys). Nunca vai para o navegador.
   E rode supabase/fa.sql uma vez no SQL Editor do Supabase. */
const base = () => (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ready = () => !!(base() && key());
// aceita a chave antiga (service_role, um JWT) e a nova (sb_secret_…, que vai só no cabeçalho apikey)
const H = () => key().startsWith('sb_') ? { apikey: key(), 'Content-Type': 'application/json' } : { apikey: key(), Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json' };

async function insert(rows) {
  const r = await fetch(base() + '/rest/v1/fa_events', { method: 'POST', headers: Object.assign(H(), { Prefer: 'return=minimal' }), body: JSON.stringify(rows) });
  if (!r.ok) throw new Error('insert ' + r.status + ' ' + (await r.text()).slice(0, 200));
}
async function rpc(fn, args) {
  const r = await fetch(base() + '/rest/v1/rpc/' + fn, { method: 'POST', headers: H(), body: JSON.stringify(args || {}) });
  if (!r.ok) throw new Error('rpc ' + fn + ' ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
// acesso direto a uma tabela (ex.: propostas): rest('propostas?select=*', { method, body, prefer })
async function rest(path, opt) {
  opt = opt || {};
  const h = H(); if (opt.prefer) h.Prefer = opt.prefer;
  const r = await fetch(base() + '/rest/v1/' + path, { method: opt.method || 'GET', headers: h, body: opt.body ? JSON.stringify(opt.body) : undefined });
  if (!r.ok) { const e = new Error('rest ' + r.status + ' ' + (await r.text()).slice(0, 200)); e.status = r.status; throw e; }
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
module.exports = { insert, rpc, rest, ready, key };
