/* Fyw · propostas comerciais do painel (/api/propostas).
   Usa o mesmo login do painel (cookie fyw_painel, assinado com PAINEL_SENHA) e grava na tabela "propostas"
   do Supabase (rode supabase/propostas.sql uma vez no SQL Editor).
   Ações: ?a=list (lista) · ?a=get&id= (uma) · ?a=save (POST, cria ou atualiza) · ?a=del&id= (POST, exclui)
          ?a=tabela (tabela de preços) · ?a=tabela-save (POST, grava a tabela; tabela fyw_config) */
const crypto = require('crypto');
const { rest, ready, key } = require('./_db');
const SENHA = () => process.env.PAINEL_SENHA || '';
const SECRET = () => crypto.createHash('sha256').update('fyw-painel|' + SENHA() + '|' + key()).digest();
const sign = v => crypto.createHmac('sha256', SECRET()).update(v).digest('base64url');
function valid(t) {
  if (!t || !SENHA()) return false;
  const i = t.lastIndexOf('.'); if (i < 0) return false;
  const v = t.slice(0, i), s = t.slice(i + 1), good = sign(v);
  if (s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return false;
  return +v.split('.')[1] > Date.now() / 1000;
}
const cookie = req => { const m = String(req.headers.cookie || '').match(/(?:^|;\s*)fyw_painel=([^;]+)/); return m ? decodeURIComponent(m[1]) : ''; };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const str = (v, n) => String(v == null ? '' : v).slice(0, n);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (!valid(cookie(req))) return res.status(401).json({ erro: 'Entre com a senha do painel.' });
  if (!ready()) return res.status(503).json({ erro: 'Banco não conectado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.' });
  const a = (req.query && req.query.a) || '', id = String((req.query && req.query.id) || '');
  let body = req.body; try { if (typeof body === 'string') body = JSON.parse(body || '{}'); } catch (x) { body = {}; }
  try {
    if (a === 'list') return res.status(200).json(await rest('propostas?select=id,titulo,cliente,tipo,preco,logo,criado,atualizado&order=atualizado.desc'));
    if (a === 'get') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Proposta inválida.' });
      const r = await rest('propostas?select=*&id=eq.' + id); if (!r || !r.length) return res.status(404).json({ erro: 'Proposta não encontrada.' });
      return res.status(200).json(r[0]);
    }
    if (a === 'save') {
      if (req.method !== 'POST') return res.status(405).end();
      const d = (body && body.dados) || {};
      const row = { titulo: str(d.titulo, 200), cliente: str(d.cliente, 200), tipo: str(d.tipo, 80), preco: str(d.preco, 40), logo: str(d.logo, 2e6), dados: d, atualizado: new Date().toISOString() };
      if (JSON.stringify(row).length > 4e6) return res.status(413).json({ erro: 'Proposta grande demais (imagens muito pesadas).' });
      const pid = String((body && body.id) || '');
      if (UUID.test(pid)) { const r = await rest('propostas?id=eq.' + pid, { method: 'PATCH', body: row, prefer: 'return=representation' }); return res.status(200).json(r && r[0]); }
      const r = await rest('propostas', { method: 'POST', body: row, prefer: 'return=representation' });
      return res.status(200).json(r && r[0]);
    }
    if (a === 'tabela') {
      const r = await rest('fyw_config?select=valor,atualizado&chave=eq.tabela-precos');
      return res.status(200).json(r && r[0] ? Object.assign({}, r[0].valor, { atualizado: r[0].atualizado }) : null);
    }
    if (a === 'tabela-save') {
      if (req.method !== 'POST') return res.status(405).end();
      const v = (body && body.tabela) || {};
      if (JSON.stringify(v).length > 2e5) return res.status(413).json({ erro: 'Tabela grande demais.' });
      const r = await rest('fyw_config?on_conflict=chave', { method: 'POST', body: { chave: 'tabela-precos', valor: v, atualizado: new Date().toISOString() }, prefer: 'resolution=merge-duplicates,return=representation' });
      return res.status(200).json(r && r[0] ? Object.assign({}, r[0].valor, { atualizado: r[0].atualizado }) : v);
    }
    if (a === 'del') {
      if (req.method !== 'POST') return res.status(405).end();
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Proposta inválida.' });
      await rest('propostas?id=eq.' + id, { method: 'DELETE' });
      return res.status(200).json({ ok: true });
    }
  } catch (x) {
    const m = String(x.message || x);
    if (/42P01|PGRST205|does not exist|relation|schema cache/i.test(m)) return res.status(503).json({ erro: 'Tabela de propostas ainda não existe: rode supabase/propostas.sql no Supabase.', tabela: false });
    return res.status(500).json({ erro: m.slice(0, 200) });
  }
  return res.status(404).json({ erro: 'Ação desconhecida.' });
};
