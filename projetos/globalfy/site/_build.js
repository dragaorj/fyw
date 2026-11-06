// Gera as páginas do site recriado da Globalfy a partir de partes comuns (topo, rodapé, FAQ, CTA).
// Uso: node _build.js   (rodar dentro de projetos/globalfy/site)
const fs = require('fs');
const V = '14';
const u = (id, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;
const I = (n, c = '') => `<svg class="ico${c ? ' ' + c : ''}" aria-hidden="true"><use href="icons.svg?v=${V}#${n}"/></svg>`;
const LOGO = `<svg viewBox="0 0 244 66" role="img" aria-label="Globalfy"><use href="icons.svg?v=${V}#logo"/></svg>`;
const ck = (t = 'check', c = '') => `<span class="ck${c ? ' ' + c : ''}">${I(t)}</span>`;
const btn = (href, t, c = '', _arrow) => btnA(href, t, c);
const btnA = (href, t, c = '', arrow = true) => `<a class="btn${c ? ' ' + c : ''}${arrow ? '' : ' plain'}" href="${href}">${t}${arrow ? `<i>${I('arrow')}</i>` : ''}</a>`;
const FL = {
  us: '<svg viewBox="0 0 30 30"><clipPath id="cu"><circle cx="15" cy="15" r="15"/></clipPath><g clip-path="url(#cu)"><rect width="30" height="30" fill="#fff"/><path d="M0 0h30v2.3H0zm0 4.6h30v2.3H0zm0 4.6h30v2.3H0zm0 4.6h30v2.3H0zm0 4.6h30v2.3H0zm0 4.6h30v2.3H0zm0 4.6h30V30H0z" fill="#B22234"/><rect width="14" height="16" fill="#3C3B6E"/></g></svg>',
  es: '<svg viewBox="0 0 30 30"><clipPath id="ce"><circle cx="15" cy="15" r="15"/></clipPath><g clip-path="url(#ce)"><rect width="30" height="30" fill="#AA151B"/><rect y="7.5" width="30" height="15" fill="#F1BF00"/></g></svg>',
  br: '<svg viewBox="0 0 30 30"><clipPath id="cb"><circle cx="15" cy="15" r="15"/></clipPath><g clip-path="url(#cb)"><rect width="30" height="30" fill="#009C3B"/><path d="M15 5 27 15 15 25 3 15Z" fill="#FFDF00"/><circle cx="15" cy="15" r="5.4" fill="#2349B3"/><path d="M9.8 14.2c3.4-1 7-.6 10.3 1" stroke="#fff" stroke-width="1.1" fill="none"/></g></svg>'
};

const dots = (P) => { const inside = (x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }; let s = ''; for (let y = 34; y < 220; y += 11) for (let x = 16; x < 380; x += 11) if (inside(x, y)) s += '<circle cx="' + x + '" cy="' + y + '" r="3"/>'; return s; };
const PAGES = [['index.html', 'Home'], ['plans.html', 'Plans and Pricing'], ['freelancer.html', 'Freelancer'], ['scale.html', 'Support'], ['blog.html', 'Blog']];

function head(title, desc) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#223f3a">
<meta name="robots" content="noindex">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://api.fontshare.com" crossorigin><link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="gfy.css?v=${V}">
</head>`;
}

function nav(active) {
  const links = [['plans.html', 'Plans and Pricing'], ['freelancer.html', 'Freelancer'], ['scale.html', 'Support'], ['blog.html', 'Blog']];
  const a = links.map(([h, t]) => `<a href="${h}"${h === active ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="nav">
  <div class="wrap nav-in">
    <a class="logo" href="index.html" aria-label="Globalfy — home">${LOGO}</a>
    <nav class="nav-links" aria-label="Main">${a}</nav>
    <div class="nav-r">
      <a class="nav-login" href="#">Log in</a>
      <div class="lang-dd"><button class="lang-cur" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Language"></button><div class="lang-sw" role="group" aria-label="Language"><button type="button" data-lang="en" aria-label="English" title="English">${FL.us}<span>English</span></button><button type="button" data-lang="pt" aria-label="Português" title="Português">${FL.br}<span>Português</span></button><button type="button" data-lang="es" aria-label="Español" title="Español">${FL.es}<span>Español</span></button></div></div>
      ${btnA('plans.html', 'Start now', 'sm')}
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu">
  <nav aria-label="Mobile"><a href="index.html">Home</a>${a}</nav>
  <div class="lang-dd"><button class="lang-cur" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Language"></button><div class="lang-sw" role="group" aria-label="Language"><button type="button" data-lang="en" aria-label="English" title="English">${FL.us}<span>English</span></button><button type="button" data-lang="pt" aria-label="Português" title="Português">${FL.br}<span>Português</span></button><button type="button" data-lang="es" aria-label="Español" title="Español">${FL.es}<span>Español</span></button></div></div><div class="btns">${btn('plans.html', 'Start now', '', false)}${btnA('#', 'Log in', 'ghost')}</div>
</div>`;
}

function faq(items, title = 'Answers ready to <b>solve your doubts</b>') {
  return `<section class="sec" id="faq"><div class="wrap faq-grid">
  <div class="sec-head rv"><span class="eyebrow">FAQ</span><h2 class="h-l tt">${title}</h2><p class="lead">Still have questions? Our team answers in English, Spanish or Portuguese.</p>${btn('scale.html', 'Talk to the team', 'dark')}</div>
  <div class="faq rv">${items.map(([q, a], k) => `<details${k === 0 ? ' open' : ''}><summary>${q}<i>${I('plus')}</i></summary><div class="a"><p>${a}</p></div></details>`).join('')}</div>
</div></section>`;
}

const FAQ_BASE = [
  ['What is an LLC?', 'A Limited Liability Company is the most popular structure for foreign founders. It separates your personal assets from the business, has flexible taxation and can be owned 100% by non‑residents.'],
  ['What is a C Corp?', 'A C Corporation is taxed at the corporate level and can issue shares. It is the standard for startups that plan to raise money from investors.'],
  ['Which state should I choose?', 'It depends on your goals. Delaware is the gold standard for startups raising funds; Wyoming and Florida are popular for low fees and simple maintenance. We help you decide.'],
  ['Does Globalfy work with all types of companies?', 'We work with entrepreneurs from any country opening LLCs or C Corps in the US, from solo freelancers to companies with several owners.'],
  ['Do I need a US visa or SSN?', 'No. You can open and manage a US company as a non‑citizen without a visa or a Social Security Number.']
];

function cta() {
  return `<section class="wrap"><div class="band on-dark rv"><div class="cta">
  <h2 class="h-l">Your company was born to be <span class="hl">#global</span>.</h2>
  <div class="cta-side"><p class="lead">Open, manage and grow your US business from anywhere, 100% online.</p><div class="btns">${btn('plans.html', 'Start now')}${btn('scale.html', 'Talk to us', 'ghost', false)}</div></div>
</div></div></section>`;
}

function footer() {
  const col = (t, l) => `<div><h4>${t}</h4><ul>${l.map(x => `<li><a href="${x[1] || '#'}">${x[0] || x}</a></li>`).join('')}</ul></div>`;
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot-top">
      <a class="logo" href="index.html" aria-label="Globalfy — home">${LOGO}</a>
      <div class="partners" aria-label="Backed by"><span>Google for Startups</span><span>endeavor</span><span>SELECTUSA</span><span>UCF Incubator</span></div>
    </div>
    <div class="news"><p>Subscribe to be part of our community and take advantage of our news.</p><form><label class="skip" for="nl">Email</label><input id="nl" type="email" placeholder="Your best email" required><button class="btn plain" type="submit">Subscribe</button></form></div>
    <div class="foot-cols">
      ${col('Globalfy', [['About us'], ['Client support', 'scale.html'], ['Plans and Pricing', 'plans.html'], ['Platform and Features']])}
      ${col('Our tools', [['Company formation'], ['Bank account'], ['Tax accounting'], ['Affiliate program']])}
      ${col('Our plans', [['Starter', 'plans.html'], ['Essential', 'plans.html'], ['Freelancer', 'freelancer.html'], ['Scale', 'scale.html']])}
      ${col('Resources', [['Blog', 'blog.html'], ['FAQ', '#faq'], ['Glossary of terms']])}
      ${col('Legal', [['Terms of service'], ['Privacy policy'], ['Affiliate agreement']])}
    </div>
    <div class="foot-bot"><span>© 2026 Globalfy. All rights reserved.</span><div class="social"><a href="#" aria-label="Instagram">${I('instagram')}</a><a href="#" aria-label="LinkedIn">${I('linkedin')}</a><a href="#" aria-label="Facebook">${I('facebook')}</a><a href="#" aria-label="YouTube">${I('youtube')}</a></div></div>
    <p class="legal">Globalfy is a technology company, not a law firm or a bank. The information on this site is not legal or tax advice. Banking services are provided by partner banks.</p>
  </div>
</footer>
<script src="../../_shared/totop.js?v=2" data-bg="#06B051" data-fg="#FFFFFF" defer></script>
<script src="gfy-i18n.js?v=${V}" defer></script>
<script src="gfy.js?v=${V}" defer></script>
</body>
</html>`;
}

function page(file, title, desc, active, body, light = false) {
  const html = `${head(title, desc)}
<body${light ? ' class="light-top"' : ''}>
${nav(active)}
<main id="main">
${body}
</main>
${footer()}`;
  fs.writeFileSync(file, html);
  console.log(file, html.length);
}

const AV = ['1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1438761681033-6461ffad8d80', '1472099645785-5658abf4ff4e'];
const avs = `<div class="avs">${AV.map(a => `<img src="${u(a, 96)}" alt="" width="38" height="38">`).join('')}</div>`;
const quotes = (dark) => `<div class="quotes">
  ${[['STARTER PLAN', 'From the beginning, they attended to all our concerns and communicated clearly and effectively. Opening the LLC was simple.', 'Juan Sierra', 'Colombia', AV[3]],
     ['ESSENTIAL PLAN', 'Quality and reliability! Super efficient, very communicative, an excellent and complete service from start to finish.', 'Alberto Gonzalez', 'United States', AV[1]],
     ['SCALE PLAN', 'The best company to open an LLC. Super attentive from the opening of the company to the completion, and they keep helping after.', 'Jimena Gómez', 'Brazil', '1544005313-94ddf0286df2']]
    .map(([p, q, n, c, a]) => `<figure class="card${dark ? ' dark' : ' white'} q rv"><span class="badge${dark ? ' dark' : ''}">${p}</span><div class="stars" aria-label="5 stars">${I('star').repeat(5)}</div><p>“${q}”</p><figcaption class="who"><img src="${u(a, 120)}" alt="" width="46" height="46" loading="lazy"><span><b>${n}</b><small>${c}</small></span></figcaption></figure>`).join('')}
</div>`;

/* ============================ HOME ============================ */
page('index.html', 'Globalfy — Open and manage your US company from anywhere', 'All-in-one platform to open, manage and grow your business in the US market, 100% online, with support in English, Spanish and Portuguese.', 'index.html', `
<section class="hero on-dark">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <span class="eyebrow">US company formation · 100% online</span>
      <h1 class="h-xl">Your company was born to be <span class="hl">#global</span></h1>
      <p class="lead">The all‑in‑one platform to open, manage and grow your business in the US — LLC or Corp, EIN, bank account and taxes, with real people by your side.</p>
      <div class="btns">${btn('plans.html', 'Start now')}${btn('plans.html', 'View our plans', 'ghost', false)}</div>
      <div class="hero-trust">${avs}<span><b>8,000+ clients</b>from all over the world</span></div>
    </div>
    <div class="hero-art">
      <img class="ha-img" src="img/liberty.webp" width="960" height="1140" alt="Statue of Liberty in front of the American flag" fetchpriority="high">
      <button class="chip chip-1 tap" type="button" data-pop="pop-form" aria-expanded="false" aria-controls="pop-form"><span class="ci">${I('briefcase')}</span><span><b>Business Formation</b><small>LLC in Wyoming</small></span><i class="tap-i">${I('plus')}</i></button>
      <button class="chip light chip-2 tap" type="button" data-pop="pop-bank" aria-expanded="false" aria-controls="pop-bank"><span class="ci">${I('bank')}</span><span><b>US bank account</b><small>Ready to receive payments</small></span><i class="tap-i">${I('plus')}</i></button>
      <div class="hpop app" id="pop-form" data-track hidden><button class="pop-x" type="button" aria-label="Close">${I('x')}</button><div class="app-card">
        <div class="app-top"><span><small>Company</small><b>Acme Global LLC</b></span><span class="badge warn" data-track-label>In progress</span></div>
        <ul class="steps">
          <li class="step" data-eta="1–2 days"><span class="dot">${I('check')}</span><span><b>Submitted</b><small>We review your information</small></span><span class="st"></span></li>
          <li class="step" data-eta="1–6 days"><span class="dot">${I('check')}</span><span><b>State Registration</b><small>Filed with the State of Wyoming</small></span><span class="st"></span></li>
          <li class="step" data-eta="1–6 days"><span class="dot">${I('check')}</span><span><b>EIN Application</b><small>Your tax ID with the IRS</small></span><span class="st"></span></li>
          <li class="step" data-eta="1–3 days"><span class="dot">${I('check')}</span><span><b>Final Review</b><small>Documents ready to download</small></span><span class="st"></span></li>
        </ul>
      </div></div>
      <div class="hpop" id="pop-bank" hidden><button class="pop-x" type="button" aria-label="Close">${I('x')}</button><div class="app-card bank">
        <div class="app-top"><span><small>Business checking</small><b>Acme Global LLC</b></span><span class="badge">Active</span></div>
        <div class="bal"><small>Available balance</small><b>$48,920.00</b><span>•••• 4821</span></div>
        <p class="pays-t">Recent payments</p>
        <ul class="pays"><li><span class="pi">S</span><span><b>Stripe payout</b><small>Today</small></span><em>+$2,400.00</em></li><li><span class="pi am">A</span><span><b>Amazon Seller</b><small>Yesterday</small></span><em>+$1,180.50</em></li><li><span class="pi cl">C</span><span><b>Client invoice #1042</b><small>Mar 12</small></span><em>+$3,750.00</em></li></ul>
      </div></div>
    </div>
  </div>
</section>

<div class="wrap trust rv"><p>Backed by programs that support global founders</p><ul><li>Google <em>for Startups</em></li><li>endeavor</li><li>SELECT<em>USA</em></li><li>UCF <em>Incubator</em></li></ul></div>

<section class="sec tight"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Where are you now?</span><h2 class="h-l tt">One platform, <b>two ways in</b></h2></div>
  <div class="paths">
    <article class="card path rv">
      <div class="pm usmap" aria-hidden="true"><svg viewBox="0 0 400 240"><g fill="rgba(255,255,255,.16)">${dots([[22,40],[120,44],[200,48],[262,52],[300,46],[330,40],[352,30],[372,34],[368,60],[350,74],[338,96],[330,120],[322,140],[310,160],[318,190],[324,214],[310,214],[292,184],[270,170],[240,172],[214,180],[200,200],[184,190],[160,168],[120,160],[96,150],[72,140],[44,120],[28,96],[18,66]])}</g><g fill="#39cd80"><circle cx="118" cy="84" r="7"/><circle cx="340" cy="78" r="7"/><circle cx="314" cy="198" r="7"/></g><g fill="none" stroke="#39cd80" stroke-width="1.5" stroke-dasharray="4 5"><path d="M118 84Q230 20 340 78"/><path d="M340 78Q360 150 314 198"/></g><g font-family="Satoshi,sans-serif" font-size="13" font-weight="700" fill="#fff"><text x="84" y="68">Wyoming</text><text x="276" y="62">Delaware</text><text x="252" y="214">Florida</text></g></svg></div>
      <div class="pb"><span class="eyebrow">New in the US</span><h3 class="h-m">Want to start a business in the US?</h3><p>Starting a business can be a wild ride, especially when diving into the US market. We simplify the process: choose the state, pick a plan and we take care of the paperwork while you build the company.</p><div class="btns">${btn('plans.html', 'Open my company')}</div></div>
    </article>
    <article class="card path rv">
      <div class="pm"><img src="${u('1556761175-5973dc0f32e7', 1100)}" alt="Founders reviewing their company dashboard" loading="lazy"></div>
      <div class="pb"><span class="eyebrow">Already incorporated</span><h3 class="h-m">Already have a US company?</h3><p>Move your company to Globalfy and get registered agent, virtual address, compliance calendar, bookkeeping and taxes in one place — so nothing slips through the cracks.</p><div class="btns">${btn('plans.html', 'Transfer my company')}${btn('scale.html', 'Talk to us', 'ghost', false)}</div></div>
    </article>
  </div>
</div></section>

<section class="sec tight"><div class="wrap incl">
  <div class="incl-media incl-app rv"><div class="app" data-track><div class="app-card">
        <div class="app-top"><span><small>Company</small><b>Acme Global LLC</b></span><span class="badge warn" data-track-label>In progress</span></div>
        <ul class="steps">
          <li class="step" data-eta="1–2 days"><span class="dot">${I('check')}</span><span><b>Submitted</b><small>We review your information</small></span><span class="st"></span></li>
          <li class="step" data-eta="1–6 days"><span class="dot">${I('check')}</span><span><b>State Registration</b><small>Filed with the State of Wyoming</small></span><span class="st"></span></li>
          <li class="step" data-eta="1–6 days"><span class="dot">${I('check')}</span><span><b>EIN Application</b><small>Your tax ID with the IRS</small></span><span class="st"></span></li>
          <li class="step" data-eta="1–3 days"><span class="dot">${I('check')}</span><span><b>Final Review</b><small>Documents ready to download</small></span><span class="st"></span></li>
        </ul>
      </div></div></div>
  <div class="rv">
    <div class="sec-head" style="margin-bottom:28px"><span class="eyebrow">Everything in one place</span><h2 class="h-l tt">made for <b>global founders</b></h2><p class="lead">All our plans include the services you need to open and keep a US company running.</p></div>
    <ul class="check-grid">
      ${['Company Registration (LLC or Corp)', 'EIN Application with the IRS', 'Post‑formation document templates', 'Updates for existing companies', 'Registered Agent', 'Virtual Address', 'Compliance Calendar', 'Business Bank Account', 'Beneficial Ownership Information (BOI)', 'Support in 3 languages'].map(t => `<li>${ck()}${t}</li>`).join('')}
    </ul>
    <div class="btns">${btn('plans.html', 'Start now')}</div>
  </div>
</div></section>

<section class="sec"><div class="wrap"><div class="band on-dark rv" style="padding:clamp(32px,6vw,80px)">
  <div class="sec-head"><span class="eyebrow">How it works</span><h2 class="h-l">Three steps to conquer the US market <span class="hl">hassle‑free</span></h2></div>
  <div class="steps3">
    <article class="card dark s3" style="background:rgba(255,255,255,.05)"><span class="n">01</span><span class="ib">${I('capitol')}</span><h3 class="h-s">Choose a state and a structure</h3><p>Now is the time to evaluate your business needs. Each state offers different advantages for LLCs and Corps — explore the options and the costs.</p><a class="link" href="blog.html">Learn more ${I('arrow')}</a></article>
    <article class="card dark s3" style="background:rgba(255,255,255,.05)"><span class="n">02</span><span class="ib">${I('doc')}</span><h3 class="h-s">Choose one of our plans</h3><p>Each plan was designed for a different stage of your journey as an entrepreneur — from a solo freelancer to a growing team.</p><a class="link" href="plans.html">See plans ${I('arrow')}</a></article>
    <article class="card dark s3" style="background:rgba(255,255,255,.05)"><span class="n">03</span><span class="ib">${I('chart')}</span><h3 class="h-s">Track everything in real time</h3><p>Follow each stage of your company formation on the platform and download your documents as soon as they are ready.</p><a class="link" href="scale.html">Meet the platform ${I('arrow')}</a></article>
  </div>
</div></div></section>

<section class="wrap"><div class="band on-dark lang rv">
  <div class="lang-copy">
    <span class="eyebrow">Human support</span>
    <h2 class="h-l">We speak your <span class="hl">language</span></h2>
    <p class="lead">Count on our specialized teams to assist you along the way. We are ready to help you through multiple channels.</p>
    <div class="flags"><span class="flag">${FL.us}English</span><span class="flag">${FL.es}Español</span><span class="flag">${FL.br}Português</span></div>
    <div class="channels"><span>${I('mail')}Email</span><span>${I('chat')}Chat</span><span>${I('whatsapp')}WhatsApp</span><span>${I('phone')}Phone</span></div>
    <div class="btns">${btn('scale.html', 'Talk to the team')}</div>
  </div>
  <div class="lang-media"><img src="${u('1573496359142-b8d87734a5a2', 1000)}" alt="Globalfy specialist helping a client" loading="lazy"><div class="bubble"><small><i></i>Ana · Globalfy team</small>Hi! Your EIN is ready. Want me to open your bank account next?</div></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Bookkeeping, tax and legal</span><h2 class="h-l tt">we handle <b>bureaucracies</b></h2><p class="lead">Keep track of your earnings and optimize your profits in one place. Our tools help you manage your finances easily from start to finish.</p></div>
  <div class="bento">
    <article class="card b-wide rv"><span class="ib grad">${I('bank')}</span><h3 class="h-s">Banking</h3><p>Open your US business account and see every transaction alongside your books.</p>
      <div class="kpis"><div><b>$48,920</b><span>Balance</span></div><div><b>+18%</b><span>vs last month</span></div></div>
      <div class="mini-bars" aria-hidden="true">${[38, 52, 44, 66, 58, 74, 62, 88, 70, 96].map((h, k) => `<i style="--h:${h}%"${k > 6 ? ' class="on"' : ''}></i>`).join('')}</div></article>
    <article class="card mint rv"><span class="ib grad-v">${I('receipt')}</span><h3 class="h-s">Tax</h3><p>Federal and state filings prepared by specialists, on time.</p><div class="ring" style="--v:80" data-l="80%" role="img" aria-label="Tax filing 80% done"></div></article>
    <article class="card rv"><span class="ib grad-o">${I('doc')}</span><h3 class="h-s">Legal</h3><p>Registered agent, annual reports and BOI — all tracked.</p><ul class="tasks"><li>Annual Report<span class="badge">Done</span></li><li>BOI Report<span class="badge warn">Pending</span></li></ul></article>
    <article class="card dark b-wide rv"><span class="ib">${I('chart')}</span><h3 class="h-s">Bookkeeping</h3><p>Monthly bookkeeping with real‑time reports, so you can focus on making a profit while we take care of the numbers.</p><div class="btns" style="margin-top:8px">${btn('scale.html', 'See the Scale plan')}</div></article>
  </div>
</div></section>

<section class="sec tight"><div class="wrap qbig">
  <div class="qbig-media rv"><img src="${u('1573497019940-1c28c88b4f3e', 900)}" alt="Marcela Martins, Globalfy client" loading="lazy"></div>
  <blockquote class="rv"><span class="eyebrow">Meet clients who unlocked their global potential</span>${I('quote', 'qmark')}<p>“The important thing is to find the right partner. Globalfy was a game changer: they opened our LLC, our bank account and keep our compliance up to date. We just focus on selling.”</p><cite><b>Marcela Martins</b>Partner and Head of International Expansion</cite></blockquote>
</div></section>

<section class="sec tight"><div class="wrap">
  <p class="eyebrow rv" style="margin-bottom:24px">1,000+ companies we help to grow</p>
  <ul class="logos rv"><li>bávaro</li><li>editlag</li><li>CLOUDBEY</li><li>PhotoPay</li><li>nordia</li></ul>
</div></section>

<section class="sec tight"><div class="wrap">${quotes(false)}</div></section>

<section class="sec tight"><div class="wrap"><a class="card post rv" href="blog-open-us-company.html">
  <div class="post-media"><img src="${u('1554224155-6726b3ff858f', 1100)}" alt="" loading="lazy"></div>
  <div class="post-body"><span class="eyebrow">Globalfy blog</span><h2 class="h-m">How to open a company in the USA for non‑citizens in 2026</h2><p>LLC or C Corp, Delaware or Florida, EIN, address and bank account — everything you need to know before you start.</p><div class="post-meta"><span>8 min read</span>·<span>Updated Jan 2026</span></div><span class="link">Read the article ${I('arrow')}</span></div>
</a></div></section>

${faq(FAQ_BASE)}
${cta()}
`);

/* ============================ PLANS ============================ */
const P = [
  ['Starter', '$588', 'Best for new companies', 'badge', ['Registration for new companies', 'State and IRS updates for existing entities', 'Company formation documents', 'Employer Identification Number (EIN)', 'Registered Agent and Virtual Address']],
  ['Essential', '$1,308', 'Most popular', 'badge dark', ['Everything in Starter', 'Named Account Executive', 'Annual Report or Franchise Tax (State Renewal)', 'Business Income Tax Return', 'Business Dissolution']],
  ['Scale', '$5,028', 'Full support', 'badge violet', ['Everything in Essential', 'Full bookkeeping and tax support', 'Accounting software license included (Xero)', 'Sales Tax / Resale Tax application and returns', 'Monthly financial reports']]
];
const planCard = ([n, p, tag, bc, l], k) => `<article class="plan${k === 1 ? ' pop' : ''} rv"><div class="plan-h"><h3>${n}</h3><span class="${k === 1 ? 'badge' : bc}">${tag}</span></div><div class="price"><b>${p}</b><span>/year</span></div><p class="sub">Billed annually · state fee not included</p><ul>${l.map(x => `<li>${ck()}${x}</li>`).join('')}</ul>${btn(n === 'Scale' ? 'scale.html' : '#', 'Choose ' + n, k === 1 ? '' : 'dark', false)}</article>`;

const Y = ck(), N = ck('x', 'no'), S = ck('plus', 'soon');
const rows = [
  ['For new companies in the US'], ['LLC or Corp registration in chosen state', Y, Y, Y], ['EIN application with the IRS', Y, Y, Y], ['Post‑formation documents', Y, Y, Y],
  ['For existing entities'], ['State amendment to update address and agent', Y, Y, Y], ['IRS request to update address', Y, Y, Y],
  ['Features'], ['Virtual address with mail scanning', Y, Y, Y], ['Registered Agent', Y, Y, Y], ['Compliance Calendar', Y, Y, Y], ['Named Account Executive', N, Y, Y],
  ['Bookkeeping and tax'], ['Call with a Tax Advisor', N, Y, Y], ['Annual Report or Franchise Tax', N, Y, Y], ['Business Income Tax Return', N, Y, Y], ['Monthly bookkeeping and tax report', N, N, Y], ['Accounting software license (Xero)', N, N, Y], ['Sales Tax / Resale Tax application and returns', N, N, Y],
  ['Business dissolution'], ['State dissolution if needed', N, Y, Y], ['Final income tax or EIN cancellation', N, Y, Y],
  ['Add‑ons'], ['ITIN application', S, S, S], ['Individual income tax return', S, S, S]
];
page('plans.html', 'Plans and Pricing — Globalfy', 'Starter, Essential and Scale: plans to open and manage your company in the US, with registered agent, virtual address and compliance calendar included.', 'plans.html', `
<section class="hero center on-dark" style="padding-bottom:200px">
  <div class="wrap hero-copy"><span class="eyebrow">Plans and Pricing</span><h1 class="h-xl">Plans to start your business in the US <span class="hl">today.</span></h1><p class="lead">Simple annual pricing. No hidden costs — you always know what you will pay.</p></div>
</section>
<section class="wrap plans-hero"><div class="plans">${P.map(planCard).join('')}</div><p style="text-align:center;margin-top:28px"><a class="link" href="#compare">Compare the details of each plan ${I('arrow')}</a></p></section>

<section class="sec tight"><div class="wrap"><div class="wa rv"><div class="wa-l"><span class="ib">${I('whatsapp')}</span><span><b>Help with doubts?</b><span>Talk to us on WhatsApp — in English, Spanish or Portuguese.</span></span></div>${btn('#', 'Chat on WhatsApp', 'white')}</div></div></section>

<section class="sec tight"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Included in every plan</span><h2 class="h-l tt">Features included <b>in all plans</b></h2></div>
  <div class="feats3">
    <article class="card rv"><span class="ib">${I('user')}</span><h3 class="h-s">Registered Agent</h3><p>Required to operate in any state. Your agent receives government documents on behalf of your company during business hours.</p></article>
    <article class="card rv"><span class="ib">${I('pin')}</span><h3 class="h-s">Virtual Address</h3><p>Despite being called “virtual”, it is a real address that accepts physical mail and is mandatory for opening your business in the US.</p></article>
    <article class="card rv"><span class="ib">${I('calendar')}</span><h3 class="h-s">Compliance Calendar</h3><p>Easily monitor and control all government deadlines, simplifying the management of your obligations with the state and the IRS.</p></article>
  </div>
</div></section>

<section class="sec tight"><div class="wrap"><div class="card quiz rv">
  <div class="quiz-ic" aria-hidden="true"><span class="ib grad" style="--r:-8deg;width:64px;height:64px">${I('sparkle')}</span><span class="ib" style="--r:4deg;background:var(--pine);color:var(--mint);width:64px;height:64px">${I('star')}</span><span class="ib grad-v" style="--r:10deg;width:64px;height:64px">${I('arrow-up')}</span></div>
  <div><h2 class="h-m">Not sure which plan to choose?</h2><p style="margin-top:8px">Answer a few questions and we suggest the right plan. It won't take more than a few minutes of your time.</p></div>
  ${btn('#', 'Take the quiz', 'dark')}
</div></div></section>

<section class="sec tight" id="compare"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Side by side</span><h2 class="h-l tt">Compare <b>our plans</b></h2></div>
  <div class="cmp-wrap rv" tabindex="0" role="region" aria-label="Plan comparison table"><table class="cmp">
    <thead><tr><th scope="col">Compare our plans</th>${P.map(([n, p], k) => `<th scope="col"${k === 1 ? ' class="col-pop"' : ''}><small>${n}</small><b>${p}<span> /year</span></b>${btn('#', 'Choose', k === 1 ? 'sm' : 'sm dark', false)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => r.length === 1 ? `<tr class="grp"><td colspan="4">${r[0]}</td></tr>` : `<tr><td>${r[0]}</td>${r.slice(1).map((c, k) => `<td${k === 1 ? ' class="col-pop"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>
  <p class="legend">${ck("plus", "soon")}Available as an add‑on.</p>
</div></section>

<section class="sec tight"><div class="wrap"><div class="card boi rv">
  <div style="display:grid;gap:18px"><span class="eyebrow">New requirement</span><h2 class="h-m">Beneficial Ownership Information: new filing requirement for US businesses</h2><p>The BOI report is a requirement for companies in the US enforced by FinCEN. It provides information about a company's owners to prevent illegal activities such as money laundering and fraud. <strong style="color:var(--ink)">Most private businesses are required to file this report — that's why we included it in all our plans.</strong></p></div>
  <div class="boi-faces" aria-hidden="true"><img src="${u('1507003211169-0a1dd7228f2d', 500)}" alt="" loading="lazy"><img src="${u('1472099645785-5658abf4ff4e', 500)}" alt="" loading="lazy"><img src="${u('1438761681033-6461ffad8d80', 500)}" alt="" loading="lazy"><div class="chip"><span class="ci">${I('shield')}</span><span><b>BOI filed</b><small>3 owners reported</small></span></div></div>
</div></div></section>

<section class="sec tight"><div class="wrap nohid">
  <div class="eye rv" aria-hidden="true">${I('eye')}</div>
  <div class="rv" style="display:grid;gap:20px"><span class="eyebrow">Transparency</span><h2 class="h-l">No hidden costs: know what you <span class="hl">will pay</span></h2><p class="lead">Delaware, Wyoming, Texas, Florida and New Mexico have different fees and tax rates. To open your company, you only pay the state registration fee. After that, you will need to keep up with state and federal obligations — and we remind you of every one.</p><div class="states"><span>Delaware</span><span>Wyoming</span><span>Texas</span><span>Florida</span><span>New Mexico</span></div>${btn('blog.html', 'Learn more', 'ghost', false)}</div>
</div></section>

<section class="sec band-full on-dark" style="background:var(--pine)"><div class="wrap">
  <div class="sec-head center rv"><span class="eyebrow">Reviews</span><h2 class="h-l">What our clients have to say about us</h2></div>
  ${quotes(true)}
</div></section>

${faq([['Does Globalfy work with all types of companies?', FAQ_BASE[3][1]], ['Can I use Globalfy services from any country?', 'Yes. Our clients come from more than 50 countries and do everything online, without traveling to the US.'], ['Do you offer bookkeeping and tax services?', 'Yes. Essential includes the business income tax return and Scale adds full monthly bookkeeping, tax support and a Xero license.'], ['What payment methods do you accept?', 'Credit and debit cards from the main networks. Plans are billed annually.']])}
${cta()}
`);

/* ============================ FREELANCER ============================ */
page('freelancer.html', 'Freelancer Essential — Globalfy', 'Run your business solo, but not alone: formation, EIN, registered agent, annual state filings and federal tax filings for freelancers.', 'freelancer.html', `
<section class="lhero"><div class="wrap lhero-grid">
  <div class="lhero-copy">
    <div class="rating"><span class="stars" aria-hidden="true">${I('star').repeat(5)}</span><span><b>Excellent</b> on Trustpilot</span></div>
    <h1 class="h-xl">Solo, but never alone: <span class="hl">Freelancer Essential</span></h1>
    <p class="lead">Formation, EIN, Registered Agent, annual state filings, federal tax filings and a dedicated account manager. Grow your business and let us handle your compliance needs.</p>
    <div class="btns">${btn('#plan', 'Start your business')}${btn('scale.html', 'Talk to us', 'ghost', false)}</div>
  </div>
  <div class="lhero-media"><img src="${u('1551836022-d5d88e9218df', 1100)}" alt="Freelancer working with a client" fetchpriority="high">
    <div class="chip chip-1" style="right:-18px;top:28px"><span class="ci">${I('briefcase')}</span><span><b>Business Formation</b><small>LLC in Wyoming · <span style="color:var(--mint)">Complete</span></small></span></div>
  </div>
</div></section>
<section class="wrap"><ul class="reviews">
  ${['I received some links, attached documents and tutorials and that’s it — in a couple of weeks I had my LLC.', 'Great experience, so fast, clear, efficient and professional customer service.', 'The team is very prepared and the support is one of the best I’ve seen in this market.'].map(t => `<li class="rv">${ck('chat')}“${t}”</li>`).join('')}
</ul></section>

<section class="sec" id="plan" style="background:var(--grey);margin-top:clamp(56px,7vw,96px)"><div class="wrap planbox">
  <div class="pb-media rv"><img src="${u('1580489944761-15a19d654956', 1000)}" alt="Freelancer and Globalfy client" loading="lazy">
    <div class="chip light chip-a"><span class="ci" style="background:var(--mint-50);color:var(--green-d)">${I('user')}</span><span><b>Hi, Anna</b><small>Manage your account</small></span></div>
    <div class="chip chip-b"><span class="ci">${I('receipt')}</span><span><b>US Tax‑Free</b><small>LLC in Wyoming · 0% state tax</small></span></div>
  </div>
  <article class="plan solo rv"><div class="plan-h"><h3>Freelancer Essential ★</h3><span class="badge">Single‑member company</span></div><div class="price"><b>$899</b><span>/ billed annually</span></div><p class="sub">State fees not included</p>
    <ul>${['LLC Registration', 'EIN Application with the IRS', 'Named Account Executive', 'BOI Report Filing', 'Call with a Tax Advisor', 'Annual Report or Franchise Tax (State Renewal)', 'Business Income Tax Return', 'Business Dissolution', 'Final Income Tax or EIN Cancellation'].map(x => `<li>${ck()}${x}</li>`).join('')}</ul>
    ${btn('#', 'Start now', '', true)}
    <ul class="addons"><small>Add‑ons</small>${[['Personal Income Tax Return', '$150'], ['ITIN Application', '$250'], ['Foreign Qualification', '$200'], ['EIN Application for Foreign Entity', '$200']].map(([a, b]) => `<li><span>${a}</span><b>${b}</b></li>`).join('')}</ul>
  </article>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Your journey</span><h2 class="h-l tt">Key features to count <b>along your journey</b></h2><p class="lead">From the formation of your company to BOI reporting, we're by your side every step, ensuring your business remains 100% compliant.</p></div>
  <div class="feats3">
    <article class="card white rv"><span class="ib">${I('user')}</span><h3 class="h-s">Registered Agent</h3><p>Required to operate in any state, your Registered Agent will receive government documents on behalf of your company during business hours.</p></article>
    <article class="card white rv"><span class="ib">${I('pin')}</span><h3 class="h-s">Virtual Address</h3><p>Despite being called “virtual”, it's a real address that accepts physical mail and is mandatory for opening your business in the US.</p></article>
    <article class="card white rv"><span class="ib">${I('calendar')}</span><h3 class="h-s">Compliance Calendar</h3><p>Easily monitor and control all government deadlines with this tool, simplifying your obligations with the state and the IRS.</p></article>
  </div>
  <div class="btns" style="justify-content:center;margin-top:36px">${btn('#plan', 'Start now')}</div>
</div></section>

<section class="wrap"><div class="band on-dark online rv">
  <div class="rings" aria-hidden="true"><span style="--v:100%">${I('building')}</span><span style="--v:100%">${I('bank')}</span><span class="ok" style="--v:100%">${I('briefcase')}</span></div>
  <div style="display:grid;gap:20px"><span class="eyebrow">100% online</span><h2 class="h-l">Fill out the form. We do the rest.</h2><p class="lead">We keep you informed every step of the way as we complete the business formation. You only submit basic information about you and your company. No need to involve representatives or third parties. <strong style="color:#fff">Just you and your computer.</strong></p>${btn('#plan', 'Start now')}</div>
</div></section>

<section class="sec tight"><div class="wrap"><div class="card grow rv">
  <div class="grow-copy"><span class="eyebrow">For teams</span><h2 class="h-l">Looking to grow a bigger company?</h2><p class="lead">Meet plans designed for multiple‑owner businesses, with bookkeeping and tax support.</p><div class="btns">${btn('plans.html', 'See plans', 'dark')}${btn('scale.html', 'Talk to us', 'white', false)}</div></div>
  <div class="grow-media"><img src="${u('1600880292203-757bb62b4baf', 1000)}" alt="Business partners celebrating" loading="lazy"></div>
</div></div></section>

${faq(FAQ_BASE.slice(0, 4))}
${cta()}
`, true);

/* ============================ SCALE / SUPORTE ============================ */
page('scale.html', 'Scale plan and support — Globalfy', 'The specialized support your global business needs: bookkeeping, taxes and a real team helping you in English, Spanish or Portuguese.', 'scale.html', `
<section class="lhero"><div class="wrap lhero-grid">
  <div class="lhero-copy">
    <span class="eyebrow">Scale plan</span>
    <h1 class="h-xl"><span class="hl">Specialized support</span> for your global business.</h1>
    <p class="lead">We helped more than 8,000 clients with business formation, bookkeeping and tax services. Let us give you the support to achieve your goals in the US market.</p>
    <div class="btns">${btn('#scale-plan', 'Start now')}${btn('#talk', 'Talk to us', 'ghost', false)}</div>
  </div>
  <div class="lhero-media"><img src="${u('1543269865-cbf427effbad', 1000)}" alt="Globalfy specialists in a meeting with a client" fetchpriority="high">
    <div class="chip" style="left:-22px;bottom:36px;padding:14px"><span class="ci" style="width:56px;height:56px;border-radius:16px"><svg viewBox="0 0 56 66" width="28" height="30" aria-hidden="true"><use href="icons.svg?v=${V}#fy"/></svg></span><span><b>Your account team</b><small>Online now · replies in minutes</small></span></div>
  </div>
</div></section>

<section class="sec tight" id="talk"><div class="wrap talk rv"><span class="eyebrow">Always close</span><h2 class="h-l">talk to us <b><span class="rot"><span class="on">through email</span><span>by phone</span><span>on WhatsApp</span><span>in your language</span></span></b></h2></div></section>

<section class="wrap"><div class="split">
  <div class="card split-img rv"><img src="${u('1519085360753-af0119f7cbe7', 1000)}" alt="Globalfy account executive" loading="lazy"></div>
  <article class="card dark rv"><span class="eyebrow">Scale plan</span><h2 class="h-m">Real people to help you along the way</h2><p>Not only do you have monthly bookkeeping and tax support to call upon, but also a team that is actively seeking opportunities to increase your company's profit, reduce costs and stay compliant.</p><p>Discover how your business can do better with our support in English, Spanish or Portuguese.</p><a class="link" href="#talk">Talk to the team ${I('arrow')}</a></article>
</div>
<div class="split" style="margin-top:20px">
  <article class="card rv"><span class="eyebrow">Compliance</span><h2 class="h-m">Ahead of the game: support to keep you informed and compliant</h2><p>Say goodbye to missed deadlines and confusion over forms and fees. Our all‑in‑one platform ensures you have everything you need in one place, so you can focus on growing your business with confidence.</p></article>
  <div class="card mint rv taxart" aria-hidden="true" style="height:auto;min-height:320px"><span class="t t1">TAX<br>FORM</span><span class="t t2">1040</span><span class="t t3">BOI</span><span class="t t4">8805</span></div>
</div></section>

<section class="sec band-full on-dark" style="background:var(--pine);margin-top:clamp(72px,10vw,140px)"><div class="wrap">
  <div class="sec-head center rv"><svg viewBox="0 0 56 66" width="34" height="40" style="color:var(--mint)" aria-hidden="true"><use href="icons.svg?v=${V}#fy"/></svg><h2 class="h-l">Bring your business to Globalfy</h2><p class="lead">The Scale plan is made for growing companies who need a trusted partner to provide expert support in bookkeeping and taxes.</p></div>
  <div class="tabs rv">
    <div class="tab-btns" role="tablist" aria-label="Onboarding steps"><button role="tab" id="t1" aria-controls="p1" aria-selected="true">Step 1</button><button role="tab" id="t2" aria-controls="p2" aria-selected="false" tabindex="-1">Step 2</button><button role="tab" id="t3" aria-controls="p3" aria-selected="false" tabindex="-1">Step 3</button></div>
    <div class="tab-panel" role="tabpanel" id="p1" aria-labelledby="t1"><span class="ib">${I('users')}</span><h3 class="h-m">Take advantage of having a team of experts by your side.</h3><p>When you join Globalfy, we analyze the current status of your company and perform the necessary registered agent and virtual address updates with the state and IRS, to make sure your business is ready to take off in the US.</p></div>
    <div class="tab-panel" role="tabpanel" id="p2" aria-labelledby="t2" hidden><span class="ib">${I('chart')}</span><h3 class="h-m">We organize your books, month after month.</h3><p>Connect your bank and we categorize every transaction in Xero. You get monthly reports with your real‑time financial health and a named executive to talk to.</p></div>
    <div class="tab-panel" role="tabpanel" id="p3" aria-labelledby="t3" hidden><span class="ib">${I('receipt')}</span><h3 class="h-m">Taxes filed on time, without surprises.</h3><p>Federal and state returns, sales tax and annual reports are prepared by specialists and tracked on your Compliance Calendar, so you never miss a deadline.</p></div>
  </div>
  <div class="btns" style="justify-content:center;margin-top:36px">${btn('#talk', 'Talk to us', 'ghost', false)}</div>
</div></section>

<section class="sec" id="scale-plan"><div class="wrap"><div class="card white rv scale-box">
  <div style="display:grid;gap:16px;align-content:start"><div class="plan-h" style="justify-content:flex-start"><h3 style="font-size:15px;letter-spacing:.1em;text-transform:uppercase;font-weight:700">Scale plan</h3><span class="badge violet">Annual</span></div><div class="price"><b>$5,028</b><span>/year</span></div><p style="color:var(--muted);font-size:14px;margin-top:-8px">Billed annually</p><div style="padding:16px 18px;border-radius:16px;background:var(--grey);font-size:14px"><b style="color:var(--ink)">State registration fee</b><br>Depends on the state you choose.</div>${btn('#talk', 'Talk to us')}</div>
  <div><p style="font-weight:700;color:var(--ink);margin-bottom:14px">Included</p><ul class="check-grid">${['Full bookkeeping and tax support', 'Accounting software license included (Xero)', 'State tax / resale tax application and returns', 'Named Account Executive', 'Annual Report or Franchise Tax', 'Business Dissolution', 'Negotiation for new companies', 'State and IRS updates for existing entities', 'Company formation documents', 'Employer Identification Number (EIN)', 'Business Income Tax Return', 'Monthly financial reports'].map(t => `<li>${ck()}${t}</li>`).join('')}</ul></div>
</div></div></section>

<section class="sec tight"><div class="wrap xero">
  <div class="xero-art rv"><img src="${u('1559526324-4b87b5e36e44', 1000)}" alt="Financial reports on a laptop" loading="lazy"><span class="xb" aria-hidden="true">xero</span></div>
  <div class="rv" style="display:grid;gap:20px"><span class="eyebrow">Reports</span><h2 class="h-l">Your financial reports, live in Xero.</h2><p class="lead">With Xero, you get an overview of your company's financial health with real‑time reporting and tracking features. One year subscription included.</p></div>
</div></section>

<section class="sec tight"><div class="wrap split">
  <div class="icon-wall rv" aria-hidden="true">${['chat', 'mail', 'phone', 'whatsapp', 'users', 'calendar', 'doc', 'bank', 'globe', 'bell', 'search', 'shield', 'chart', 'card', 'clock', 'pin', 'receipt', 'sparkle', 'lock', 'briefcase'].map(n => `<span>${I(n)}</span>`).join('')}</div>
  <article class="card rv"><span class="eyebrow">Contact</span><h2 class="h-m">It's easy to get in touch. Connect with us in many ways.</h2><p>Our team is always available to assist you with any concerns, wherever and however you feel comfortable.</p><p>We offer support in English, Portuguese and Spanish through different channels such as email, chat and WhatsApp. If you need help during US working hours, we can even talk to you on the phone.</p><div class="channels" style="color:var(--ink)"><span style="color:var(--ink)">${I('mail')}Email</span><span style="color:var(--ink)">${I('chat')}Chat</span><span style="color:var(--ink)">${I('whatsapp')}WhatsApp</span><span style="color:var(--ink)">${I('phone')}Phone</span></div></article>
</div></section>

<section class="wrap"><div class="band on-dark calwrap rv">
  <div style="display:grid;gap:20px"><span class="eyebrow">Manage</span><h2 class="h-l">Your business at your fingertips</h2><p class="lead">On our platform you can easily access your documents and manage your obligations with the Compliance Calendar feature.</p>${btn('#scale-plan', 'Start now')}</div>
  <div class="cal" aria-label="Compliance calendar preview">
    <div class="cal-h"><b>March 2026</b><span class="badge">3 deadlines</span></div>
    <div class="cal-row"><span class="d"><small>Mon</small><b>02</b></span><div class="ev">${I('doc')}Annual Report · Wyoming<span class="badge">Filed</span></div></div>
    <div class="cal-row"><span class="d"><small>Mon</small><b>16</b></span><div class="ev v">${I('receipt')}Form 5472 + 1120<span class="badge violet">In review</span></div></div>
    <div class="cal-row"><span class="d"><small>Tue</small><b>31</b></span><div class="ev">${I('shield')}BOI update<span class="badge warn">Pending</span></div></div>
  </div>
</div></section>

${faq([['Does Globalfy work with all types of companies?', FAQ_BASE[3][1]], ['Can I use Globalfy services from any country?', 'Yes. Our clients do everything online, from any country, without traveling to the US.'], ['Do you offer bookkeeping and tax services?', 'Yes. The Scale plan includes monthly bookkeeping, tax returns, sales tax and a Xero license.'], ['What payment methods do you accept?', 'Credit and debit cards from the main networks. Plans are billed annually.']])}
${cta()}
`, true);


/* ============================ BLOG ============================ */
// Posts escritos do zero, inspirados nos temas que a Globalfy publica no blog dela (globalfy.com/blog).
const POSTS = [
  { file: 'blog-open-us-company.html', cat: 'Company formation', img: '1554224155-6726b3ff858f', read: 8, date: 'Oct 2026',
    h1: 'How to open a company in the USA as a non‑citizen', ex: 'LLC or C Corp, which state, EIN, address and bank account — the full path, step by step.',
    tldr: ['You don’t need a US visa, green card or SSN to own a US company.', 'Most foreign founders choose an LLC; startups raising money usually need a C Corp.', 'After formation come the EIN, a US address with a Registered Agent, and a business bank account.'],
    s: [
      ['structure', 'Choose a business structure', `<p>Start with the structure, because it defines how you pay taxes and who can invest in you. The two options foreign founders use most are the Limited Liability Company (LLC) and the C Corporation.</p><div class="video"><img src="${u('1553877522-43269d4ea984', 1400)}" alt="" loading="lazy"><svg class="vlogo" viewBox="0 0 244 66" aria-hidden="true"><use href="icons.svg?v=${V}#logo"/></svg><span class="vplay" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor"/></svg></span><span class="vtag"><b>LLC or C Corp?</b>Watch the 3‑minute explainer</span></div>`],
      ['differences', 'LLC vs C Corp: what changes', `<table class="cmp2"><thead><tr><th></th><th>LLC</th><th>C Corp</th></tr></thead><tbody><tr><td>Taxation</td><td>Pass‑through to the owners</td><td>Company level + dividends</td></tr><tr><td>Can issue shares</td><td>No</td><td>Yes</td></tr><tr><td>Paperwork</td><td>Lighter</td><td>Board, bylaws, more filings</td></tr><tr><td>Best for</td><td>Freelancers, e‑commerce, services</td><td>Startups raising funds</td></tr></tbody></table><p>In both cases the company is a separate legal entity: your personal assets are protected from the company’s debts.</p>`],
      ['state', 'Pick the state', `<p>You don’t need to live in the state where you form the company. Delaware is the classic choice for venture‑backed startups; Wyoming and New Mexico are popular for low maintenance; Florida and Texas make sense when you will actually operate there. See our <a href="blog-best-state-llc.html">state‑by‑state guide</a>.</p>`],
      ['docs', 'Gather the documents', `<ul><li>A valid passport for each owner</li><li>Your home address abroad</li><li>Two or three options of company name</li><li>The ownership split between members</li></ul><p>With that, the Articles of Organization (LLC) or Incorporation (Corp) are filed with the state, and the Operating Agreement or bylaws are prepared.</p>`],
      ['ein', 'Get your EIN', `<p>The Employer Identification Number is the company’s tax ID. You need it for the bank, for payment platforms and for taxes — and you can get it without an SSN. <a href="blog-llc-without-ssn.html">Here is how</a>.</p>`],
      ['bank', 'Open the business bank account', `<p>With the formation documents and the EIN in hand, you can open a US business account online and start receiving from clients and platforms. Compare the options in our <a href="blog-business-account.html">guide to business accounts for non‑residents</a>.</p><p class="note">In short: structure → state → documents → EIN → bank account. After that, keep an eye on the yearly obligations: annual report, tax return and BOI.</p>`]
    ] },
  { file: 'blog-llc-without-ssn.html', cat: 'Tax and IRS', img: '1450101499163-c8848c66ca85', read: 6, date: 'Oct 2026',
    h1: 'Can you open a US LLC without a Social Security Number?', ex: 'Yes. Here is what you use instead of an SSN — and where an ITIN actually comes in.',
    tldr: ['An SSN is not required to form an LLC or a Corp.', 'The company gets its own tax ID, the EIN, even when no owner has an SSN.', 'An ITIN is a personal number, needed only in some situations — not to open the company.'],
    s: [
      ['short', 'The short answer', `<p>Yes. States register companies owned by people from anywhere in the world, and none of them asks for a Social Security Number in the formation documents. What they ask for is a registered agent and an address in the state.</p>`],
      ['instead', 'What you need instead', `<ul><li><strong>Passport:</strong> identifies each owner.</li><li><strong>Registered Agent:</strong> a person or company in the state that receives official mail for you.</li><li><strong>US address:</strong> for the company’s mail and records.</li></ul>`],
      ['ein', 'How the EIN works without an SSN', `<p>The EIN is issued by the IRS to the company, not to you. When the responsible party has no SSN or ITIN, the online form isn’t available, so the request goes to the IRS through other channels — which takes longer. A formation service handles that request for you and follows up until the number is issued.</p>`],
      ['itin', 'When an ITIN comes in', `<table class="cmp2"><thead><tr><th>Situation</th><th>Do you need an ITIN?</th></tr></thead><tbody><tr><td>Forming the LLC</td><td>No</td></tr><tr><td>Getting the company’s EIN</td><td>No</td></tr><tr><td>Filing a personal US tax return</td><td>Usually yes</td></tr><tr><td>Some banks and payment providers</td><td>Sometimes</td></tr></tbody></table>`],
      ['mistakes', 'Common mistakes to avoid', `<ul><li>Improvising on the EIN request instead of following the instructions for non‑resident owners.</li><li>Using a mailbox service that the state doesn’t accept as a registered agent.</li><li>Forgetting that a single‑member LLC owned by a foreigner still has yearly IRS filings.</li></ul><p class="note">Bottom line: you can own a US company without an SSN. Plan the EIN step early, because it is the one that takes the longest.</p>`]
    ] },
  { file: 'blog-business-account.html', cat: 'Banking', img: '1556742049-0cfed4f6a45d', read: 7, date: 'Sep 2026',
    h1: 'US business accounts for non‑residents: how to choose', ex: 'Traditional bank or fintech? The criteria that matter when the owner lives abroad.',
    tldr: ['Start with one question: does the provider accept companies whose owners live abroad?', 'Fintech accounts open online; traditional banks often ask for a visit to a branch.', 'Compare fees, cards, currencies and integrations with the tools you already use.'],
    s: [
      ['types', 'Two kinds of accounts', `<p><strong>Traditional banks</strong> offer the full range of products, but many require the owner in person. <strong>Fintech business accounts</strong> open 100% online and are usually the first choice for founders abroad, with partner banks holding the money.</p>`],
      ['criteria', 'What to compare', `<table class="cmp2"><thead><tr><th>Criteria</th><th>Why it matters</th></tr></thead><tbody><tr><td>Accepts non‑resident owners</td><td>The first filter — many providers don’t</td></tr><tr><td>Documents required</td><td>EIN letter, formation documents, passport, proof of address</td></tr><tr><td>Monthly and transfer fees</td><td>International wires can cost more than the plan</td></tr><tr><td>Cards</td><td>Physical and virtual debit cards for the team</td></tr><tr><td>Currencies</td><td>Receiving and holding USD, EUR or BRL</td></tr><tr><td>Integrations</td><td>Stripe, Amazon, Shopify and your accounting software</td></tr></tbody></table>`],
      ['docs', 'Documents you will need', `<ul><li>Articles of Organization or Incorporation</li><li>EIN confirmation letter from the IRS</li><li>Operating Agreement or bylaws</li><li>Passport and proof of address of each owner</li></ul>`],
      ['tips', 'Tips to get approved faster', `<ul><li>Describe your business clearly, with a website that matches what you sell.</li><li>Keep the same company name and address on every document.</li><li>Apply to more than one provider: approval criteria vary.</li></ul><p class="note">Bottom line: choose the account by what your company does every day — receiving from clients, paying suppliers or selling on marketplaces.</p>`]
    ] },
  { file: 'blog-best-state-llc.html', cat: 'Company formation', img: '1485738422979-f5c462d49f74', read: 6, date: 'Sep 2026',
    h1: 'What is the best state to form an LLC as a foreign founder?', ex: 'Delaware, Wyoming, Florida, New Mexico or Texas — what each one is good at.',
    tldr: ['There is no single best state: it depends on where you operate and whether you will raise money.', 'Delaware is the reference for investors; Wyoming and New Mexico are known for simple maintenance.', 'If you will have an office or employees in a state, you may need to register there too.'],
    s: [
      ['compare', 'The popular states at a glance', `<table class="cmp2"><thead><tr><th>State</th><th>Known for</th><th>Good fit if…</th></tr></thead><tbody><tr><td>Delaware</td><td>Business courts and investor familiarity</td><td>You plan to raise venture capital</td></tr><tr><td>Wyoming</td><td>Low costs and privacy</td><td>You run an online business from abroad</td></tr><tr><td>New Mexico</td><td>Very light yearly maintenance</td><td>You want the simplest upkeep</td></tr><tr><td>Florida</td><td>Proximity to Latin America</td><td>You will operate or sell in Florida</td></tr><tr><td>Texas</td><td>No state personal income tax, big market</td><td>You will have presence in Texas</td></tr></tbody></table>`],
      ['where', 'Where you operate matters', `<p>Forming in one state and doing business physically in another usually means registering as a foreign entity in the second one (foreign qualification) — and paying fees in both. If you will have an office, warehouse or employees somewhere, consider forming there.</p>`],
      ['costs', 'Look at the yearly costs, not only the filing fee', `<p>Formation fees are paid once; annual reports, franchise taxes and registered agent fees are paid every year. Compare the total cost over three years before deciding.</p>`],
      ['decide', 'How to decide in three questions', `<ul><li>Will you raise money from investors? → Delaware C Corp.</li><li>Will you operate physically in a state? → Form there.</li><li>Online business run from abroad? → Wyoming or New Mexico LLC.</li></ul><p class="note">Still unsure? Our team helps you compare states in a quick call.</p>`]
    ] }
];
const postCard = (p, big) => `<a class="pcard${big ? ' big' : ''} rv" href="${p.file}"><span class="pc-media"><img src="${u(p.img, big ? 1200 : 700)}" alt="" loading="lazy"></span><span class="pc-body"><span class="badge">${p.cat}</span><b>${p.h1}</b><span class="pc-ex">${p.ex}</span><span class="post-meta">${p.read} min read · Updated ${p.date}</span></span></a>`;

page('blog.html', 'Blog — Globalfy', 'Guides about opening and running a business in the US: company formation, taxes, banking and compliance for international founders.', 'blog.html', `
<section class="lhero bloghero"><div class="wrap">
  <div class="sec-head" style="margin-bottom:28px"><span class="eyebrow">Globalfy blog</span><h1 class="h-xl" style="font-size:clamp(2.4rem,5.4vw,4.4rem)">Guides for building your business <span class="hl">in the US</span></h1><p class="lead">Company formation, taxes, banking and compliance — explained for founders who live anywhere in the world.</p></div>
  <form class="bsearch" role="search"><label class="skip" for="bs">Search articles</label>${I('search')}<input id="bs" type="search" placeholder="Search articles"><button class="btn sm plain" type="submit">Search</button></form>
  <div class="cats" aria-label="Categories"><a class="on" href="blog.html">All</a><a href="#">Company formation</a><a href="#">Tax and IRS</a><a href="#">Banking</a><a href="#">Compliance</a><a href="#">Case studies</a></div>
</div></section>
<section class="wrap">${postCard(POSTS[0], true)}<div class="posts">${POSTS.slice(1).map(p => postCard(p)).join('')}</div></section>
<section class="sec tight"><div class="wrap"><div class="wa rv"><div class="wa-l"><span class="ib">${I('mail')}</span><span><b>Get new guides in your inbox</b><span>One email a month. No spam.</span></span></div><form class="mini-news"><label class="skip" for="bn">Email</label><input id="bn" type="email" placeholder="Your best email" required><button class="btn white plain" type="submit">Subscribe</button></form></div></div></section>
${cta()}
`, true);

POSTS.forEach((p) => {
  const others = POSTS.filter(x => x !== p).slice(0, 3);
  page(p.file, p.h1 + ' — Globalfy blog', p.ex, 'blog.html', `
<div class="progress" aria-hidden="true"></div>
<div class="wrap art">
  <article>
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="blog.html">Blog</a><span>/</span><span>${p.cat}</span></nav>
    <h1>${p.h1}</h1>
    <div class="byline"><span class="fyb"><svg viewBox="0 0 56 66" aria-hidden="true"><use href="icons.svg?v=${V}#fy"/></svg></span><span><b>Globalfy team</b>Updated ${p.date} · ${p.read} min read</span></div>
    <div class="prose">
      <div class="tldr"><b>${I('sparkle')}Key takeaways</b><ul>${p.tldr.map(t => `<li>${t}</li>`).join('')}</ul></div>
      <figure><img src="${u(p.img, 1400)}" alt="" fetchpriority="high"></figure>
      ${p.s.map(([id, t, h]) => `<h2 id="${id}">${t}</h2>${h}`).join('\n      ')}
      <p>${btn('plans.html', 'Open my company')}</p>
    </div>
  </article>
  <aside class="aside">
    <nav class="toc" aria-label="In this article"><b>What you will find in this article</b><ol>${p.s.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol></nav>
    <a class="side-card" href="${others[0].file}"><img src="${u(others[0].img, 700)}" alt="" loading="lazy"><div><span class="badge">Read next</span><b>${others[0].h1}</b><span class="link">Read the article ${I('arrow')}</span></div></a>
    <div class="share">Share<a href="#" aria-label="Share on Facebook">${I('facebook')}</a><a href="#" aria-label="Share on X">${I('xlogo')}</a><a href="#" aria-label="Share on LinkedIn">${I('linkedin')}</a></div>
  </aside>
</div>
<section class="sec tight"><div class="wrap"><div class="sec-head rv"><span class="eyebrow">Keep reading</span><h2 class="h-m tt">More <b>guides</b></h2></div><div class="posts">${others.map(o => postCard(o)).join('')}</div></div></section>
${cta()}
`, true);
});
