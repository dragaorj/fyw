/* Fyw — envio do formulário de contato com e-mail no visual do site.
   Roda como função da Vercel (/api/contact). Usa o Resend (https://resend.com) para enviar.
   Configuração na Vercel → Settings → Environment Variables:
     RESEND_API_KEY  = chave do Resend (obrigatória)
     CONTACT_TO      = e-mail que recebe os pedidos (padrão: fyw.ggwp@gmail.com)
     CONTACT_FROM    = remetente (padrão: "Site Fyw <onboarding@resend.dev>"; troque após verificar um domínio no Resend)
   Sem a chave, responde 503 e o site usa o envio reserva (FormSubmit). */

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderEmail(d) {
  const ink = '#0B0B0B', paper = '#EEEDE9', card = '#FFFFFF', mute = '#6B6A66', line = '#E2E1DC', orange = '#FF6A2B';
  const font = "'Google Sans','Product Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
  const digits = String(d.whatsapp || '').replace(/\D/g, '');
  const wa = digits ? 'https://wa.me/' + (d.lang === 'pt' && digits.length <= 11 ? '55' : '') + digits : '';
  const svcs = (d.services && d.services.length ? d.services : []).map(s =>
    `<span style="display:inline-block;margin:0 6px 6px 0;padding:7px 14px;border-radius:99px;background:${ink};color:${paper};font-size:13px;line-height:1">${esc(s)}</span>`).join('') ||
    `<span style="color:${mute}">Não informado</span>`;
  const row = (label, value) => `
          <tr><td style="padding:14px 0;border-top:1px solid ${line}">
            <div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${mute};margin-bottom:6px">${label}</div>
            <div style="font-size:16px;color:${ink};line-height:1.5">${value}</div>
          </td></tr>`;
  const btn = (href, text, bg, fg) => `<a href="${href}" style="display:inline-block;margin:0 8px 8px 0;padding:14px 22px;border-radius:99px;background:${bg};color:${fg};font-size:15px;font-weight:600;text-decoration:none;line-height:1">${text} &nbsp;→</a>`;
  const first = esc(String(d.name || '').split(' ')[0]);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>Novo contato</title></head>
<body style="margin:0;padding:0;background:${paper};font-family:${font};-webkit-font-smoothing:antialiased">
  <div style="display:none;max-height:0;overflow:hidden">${esc(d.name)} quer conversar sobre ${esc((d.services || []).join(', ') || 'um projeto')}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${paper}"><tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
      <tr><td style="padding:0 4px 20px">
        <img src="${esc(d.origin || 'https://fyw-two.vercel.app')}/assets/img/logo-fyw-email.png" width="56" height="36" alt="Fyw" style="display:block;border:0">
      </td></tr>
      <tr><td style="background:${card};border-radius:28px;padding:32px 28px 20px;box-shadow:0 20px 40px -24px rgba(11,11,11,.25)">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${mute};margin-bottom:14px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${orange};margin-right:8px;vertical-align:1px"></span>Novo contato pelo site</div>
        <h1 style="margin:0 0 8px;font-size:30px;line-height:1.1;letter-spacing:-.02em;font-weight:600;color:${ink}">${first ? first + ' quer conversar' : 'Novo pedido de orçamento'}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:${mute}">Responda em até 48 horas, como prometido no site.</p>
        <div style="margin-bottom:18px">
          ${wa ? btn(wa, 'Chamar no WhatsApp', ink, paper) : ''}${d.email ? btn('mailto:' + esc(d.email) + '?subject=' + encodeURIComponent('Fyw — sobre o seu projeto'), 'Responder por e-mail', paper, ink) : ''}
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row('Nome', esc(d.name))}
          ${row('WhatsApp', wa ? `<a href="${wa}" style="color:${ink};text-decoration:none">${esc(d.whatsapp)}</a>` : '—')}
          ${row('E-mail', `<a href="mailto:${esc(d.email)}" style="color:${ink};text-decoration:none">${esc(d.email)}</a>`)}
          ${row('Do que precisa', svcs)}
          ${row('Mensagem', d.message ? esc(d.message).replace(/\n/g, '<br>') : `<span style="color:${mute}">Sem mensagem</span>`)}
        </table>
      </td></tr>
      <tr><td style="padding:18px 8px 0;font-size:12px;line-height:1.6;color:${mute}">
        Enviado em ${esc(d.date)} · Site em ${esc(d.langName)}<br>
        Página: <a href="${esc(d.page)}" style="color:${mute}">${esc(d.page)}</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  const key = process.env.RESEND_API_KEY;
  if (!key) { res.statusCode = 503; res.setHeader('Content-Type', 'application/json'); return res.end('{"success":false,"message":"not-configured"}'); }
  let d = req.body;
  if (!d || typeof d === 'string') { try { d = JSON.parse(d || '{}'); } catch (e) { d = {}; } }
  if (d._honey) { res.statusCode = 200; return res.end('{"success":true}'); }
  const name = String(d.name || '').trim().slice(0, 80), email = String(d.email || '').trim().slice(0, 120);
  if (!name || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { res.statusCode = 400; return res.end('{"success":false}'); }
  const data = {
    origin: 'https://' + (req.headers['x-forwarded-host'] || req.headers.host || 'fyw-two.vercel.app'), name, email, whatsapp: String(d.whatsapp || '').slice(0, 30), lang: d.lang || 'pt',
    langName: ({ pt: 'Português', en: 'Inglês', es: 'Espanhol' })[d.lang] || 'Português',
    services: Array.isArray(d.services) ? d.services.slice(0, 8).map(s => String(s).slice(0, 40)) : [],
    message: String(d.message || '').slice(0, 4000), page: String(d.page || '').slice(0, 300),
    date: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short' })
  };
  const subject = 'Novo contato do site da Fyw — ' + name + (data.services.length ? ' (' + data.services.join(', ') + ')' : '');
  const text = [subject, '', 'Nome: ' + name, 'WhatsApp: ' + (data.whatsapp || '—'), 'E-mail: ' + email, 'Do que precisa: ' + (data.services.join(', ') || '—'), 'Mensagem: ' + (data.message || '—'), '', 'Enviado em ' + data.date, 'Página: ' + data.page].join('\n');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.CONTACT_FROM || 'Site Fyw <onboarding@resend.dev>', to: [process.env.CONTACT_TO || 'fyw.ggwp@gmail.com'], reply_to: email, subject, html: renderEmail(data), text })
  });
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = r.ok ? 200 : 502;
  res.end(JSON.stringify({ success: r.ok }));
}

module.exports = handler;
module.exports.renderEmail = renderEmail;
