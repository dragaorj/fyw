/* Fyw — medição ao vivo do Google Lighthouse (PageSpeed Insights) deste site, para a seção "Desempenho" da home.
   Roda como função da Vercel: /api/lighthouse?s=mobile  ou  /api/lighthouse?s=desktop
   A resposta fica guardada no cache da Vercel por 6 horas (e serve a anterior enquanto atualiza):
   todos os visitantes recebem um número real e recente na hora, e o Google é consultado só poucas vezes por dia.
   Opcional na Vercel → Settings → Environment Variables:
     PSI_KEY = chave da API do PageSpeed Insights (Google Cloud). Sem ela também funciona, mas com limite menor do Google.
     PSI_URL = endereço medido (padrão: https://fyw.com.br/) */

const CATS = ['performance', 'accessibility', 'best-practices', 'seo'];

async function handler(req, res) {
  const s = (req.query && req.query.s) || new URL(req.url, 'http://x').searchParams.get('s');
  const strategy = s === 'desktop' ? 'desktop' : 'mobile';
  const target = process.env.PSI_URL || 'https://fyw.com.br/';
  const q = new URLSearchParams({ url: target, strategy });
  CATS.forEach(c => q.append('category', c));
  if (process.env.PSI_KEY) q.set('key', process.env.PSI_KEY);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // uma medição do Google
  const runOnce = async signal => {
    const r = await fetch('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?' + q, { signal });
    if (!r.ok) throw new Error('psi ' + r.status);
    const j = await r.json(), lr = j.lighthouseResult || {}, c = lr.categories || {}, a = lr.audits || {};
    const sc = k => (c[k] && typeof c[k].score === 'number') ? Math.round(c[k].score * 100) : null;
    const nv = k => (a[k] && typeof a[k].numericValue === 'number') ? a[k].numericValue : null;
    const out = {
      ok: true, strategy, at: lr.fetchTime || new Date().toISOString(), lighthouse: lr.lighthouseVersion || null,
      scores: { performance: sc('performance'), accessibility: sc('accessibility'), bestPractices: sc('best-practices'), seo: sc('seo') },
      metrics: { fcp: nv('first-contentful-paint'), lcp: nv('largest-contentful-paint'), cls: nv('cumulative-layout-shift'), tbt: nv('total-blocking-time'), si: nv('speed-index') }
    };
    if (out.scores.performance === null) throw new Error('empty');
    return out;
  };
  try {
    // 3 medições ao mesmo tempo; vale a do meio (mediana pela nota de desempenho), como o próprio Google recomenda:
    // uma rodada ruim isolada do servidor do Google não aparece no site
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 55000);
    const runs = (await Promise.allSettled([runOnce(ctrl.signal), runOnce(ctrl.signal), runOnce(ctrl.signal)])).filter(x => x.status === 'fulfilled').map(x => x.value);
    clearTimeout(t);
    if (!runs.length) throw new Error('none');
    runs.sort((x, y) => x.scores.performance - y.scores.performance);
    const out = runs[Math.floor((runs.length - 1) / 2)]; out.runs = runs.length;
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    res.statusCode = 200; res.end(JSON.stringify(out));
  } catch (e) {
    // falhou (limite do Google, tempo esgotado): a página continua com a última medição conhecida
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    res.statusCode = 200; res.end(JSON.stringify({ ok: false })); // 200 de propósito: a página não mostra erro no console
  }
}

module.exports = handler;
