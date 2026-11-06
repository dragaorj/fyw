/* Fyw — painel de detalhes dos serviços (Branding, Rebranding, UI/UX & Web, Apps & Sistemas, Design Systems) */
(function () {
  'use strict';

  const UI = {
    pt: { what: 'O que é', deliver: 'O que entregamos', who: 'Para quem é', how: 'Como fazemos', cta: 'Quero um orçamento', next: 'Próximo', close: 'Fechar', open: 'Ver detalhes de', work: 'Projetos', view: 'Ver projeto' },
    en: { what: 'What it is', deliver: 'What we deliver', who: 'Who it’s for', how: 'How we work', cta: 'Get a quote', next: 'Next', close: 'Close', open: 'See details of', work: 'Projects', view: 'View project' },
    es: { what: 'Qué es', deliver: 'Qué entregamos', who: 'Para quién es', how: 'Cómo lo hacemos', cta: 'Quiero un presupuesto', next: 'Siguiente', close: 'Cerrar', open: 'Ver detalles de', work: 'Proyectos', view: 'Ver proyecto' }
  };

  const S = {
    pt: [
      { t: 'Branding', lead: 'Sua marca é o que as pessoas sentem antes de ler qualquer palavra.',
        what: 'Branding é a construção da identidade do seu negócio: como ele se apresenta, como fala e como é lembrado. Vai muito além do logo: é estratégia, posicionamento e uma linguagem visual consistente que faz o cliente confiar e escolher você, e não o concorrente.',
        deliver: ['Estratégia e posicionamento', 'Naming', 'Logo e símbolo', 'Cores e tipografia', 'Tom de voz', 'Manual de marca', 'Rebranding'],
        who: 'Negócios que estão nascendo, empresas que cresceram e a marca não acompanhou, ou quem precisa se diferenciar num mercado em que todo mundo parece igual.',
        steps: [['Imersão', 'Entendemos o negócio, o público e a concorrência.'], ['Conceito', 'Definimos posicionamento, personalidade e direção visual.'], ['Identidade', 'Criamos a marca e o manual para aplicar em tudo.']] },
      { t: 'UI/UX & Web', lead: 'Um site bonito chama atenção. Um site bem pensado vende.',
        what: 'Aqui fazemos o web design completo do seu site: a estrutura das páginas, o visual e a experiência (UI/UX), o caminho que o visitante percorre até virar cliente. Depois desenvolvemos tudo em código para entregar sites rápidos e claros, que explicam o que você faz, mostram como você resolve a dor do cliente e levam ao contato, 24h por dia.',
        deliver: ['Pesquisa e arquitetura', 'Wireframes', 'Design de interface', 'Textos que vendem', 'Desenvolvimento sob medida', 'SEO e performance', 'Vários idiomas'],
        who: 'Quem só tem Instagram, quem tem um site que não gera contatos ou quem quer lançar uma página de alta conversão para um produto ou serviço.',
        steps: [['Estratégia', 'Objetivos, público e estrutura das páginas.'], ['Design', 'Wireframes e interface validados com você.'], ['Código', 'Desenvolvimento, testes e publicação.']] },
      { t: 'Apps & Sistemas', lead: 'Quando a planilha não dá mais conta, é hora de um sistema.',
        what: 'Criamos aplicativos e sistemas web sob medida (painéis, plataformas, áreas do cliente e ferramentas internas) que automatizam processos, organizam dados e crescem junto com o seu negócio. Do protótipo à publicação nas lojas.',
        deliver: ['Descoberta de produto', 'Protótipo navegável', 'Apps iOS e Android', 'Sistemas web e painéis', 'Integrações e APIs', 'Testes com usuários', 'Suporte e evolução'],
        who: 'Empresas com processos manuais, startups validando um produto ou negócios que querem oferecer uma experiência digital própria aos clientes.',
        steps: [['Descoberta', 'Mapeamos o problema e definimos o essencial.'], ['Protótipo', 'Testamos a ideia antes de construir.'], ['Construção', 'Desenvolvemos em etapas, com entregas frequentes.']] },
      { t: 'Design Systems', lead: 'Consistência que economiza tempo e dinheiro do seu time.',
        what: 'Um design system é a biblioteca viva da sua marca no digital: componentes, regras e padrões reutilizáveis que fazem designers e desenvolvedores criarem telas novas em dias, não em semanas, sempre com a mesma qualidade.',
        deliver: ['Auditoria de interface', 'Tokens de cor, tipo e espaço', 'Biblioteca de componentes', 'Documentação', 'Componentes em código', 'Acessibilidade', 'Treinamento do time'],
        who: 'Empresas com produto digital em crescimento, vários times trabalhando juntos ou telas que já não conversam entre si.',
        steps: [['Auditoria', 'Levantamos o que existe e o que se repete.'], ['Fundação', 'Definimos tokens, regras e componentes base.'], ['Escala', 'Documentamos e treinamos o time para usar.']] }
    ],
    en: [
      { t: 'Branding', lead: 'Your brand is what people feel before they read a single word.',
        what: 'Branding is building your business identity: how it presents itself, how it speaks and how it’s remembered. It goes far beyond a logo: it’s strategy, positioning and a consistent visual language that makes customers trust you and choose you over the competition.',
        deliver: ['Strategy and positioning', 'Naming', 'Logo and symbol', 'Colors and typography', 'Tone of voice', 'Brand guidelines', 'Rebranding'],
        who: 'New businesses, companies that grew while their brand didn’t, or anyone who needs to stand out in a market where everyone looks the same.',
        steps: [['Immersion', 'We understand the business, audience and competitors.'], ['Concept', 'We define positioning, personality and visual direction.'], ['Identity', 'We create the brand and the guidelines to apply it everywhere.']] },
      { t: 'UI/UX & Web', lead: 'A beautiful website gets attention. A well-thought-out one sells.',
        what: 'This is where we do the complete web design of your website: page structure, visuals and experience (UI/UX), the path a visitor takes until they become a customer. Then we build it all in code to deliver fast, clear websites that explain what you do, show how you solve the customer’s pain and lead to contact, 24/7.',
        deliver: ['Research and architecture', 'Wireframes', 'Interface design', 'Copy that sells', 'Custom development', 'SEO and performance', 'Multiple languages'],
        who: 'Businesses that only have Instagram, a website that brings no leads, or want to launch a high-converting page for a product or service.',
        steps: [['Strategy', 'Goals, audience and page structure.'], ['Design', 'Wireframes and interface approved with you.'], ['Code', 'Development, testing and launch.']] },
      { t: 'Apps & Systems', lead: 'When spreadsheets can’t keep up, it’s time for a system.',
        what: 'We build custom apps and web systems (dashboards, platforms, client areas and internal tools) that automate processes, organize data and grow with your business. From prototype to app store launch.',
        deliver: ['Product discovery', 'Clickable prototype', 'iOS and Android apps', 'Web systems and dashboards', 'Integrations and APIs', 'User testing', 'Support and evolution'],
        who: 'Companies with manual processes, startups validating a product, or businesses that want to offer their own digital experience.',
        steps: [['Discovery', 'We map the problem and define the essentials.'], ['Prototype', 'We test the idea before building.'], ['Build', 'We develop in stages, with frequent releases.']] },
      { t: 'Design Systems', lead: 'Consistency that saves your team time and money.',
        what: 'A design system is the living library of your brand in digital: reusable components, rules and patterns that let designers and developers build new screens in days, not weeks, always with the same quality.',
        deliver: ['Interface audit', 'Color, type and spacing tokens', 'Component library', 'Documentation', 'Coded components', 'Accessibility', 'Team training'],
        who: 'Companies with a growing digital product, several teams working together, or screens that no longer match each other.',
        steps: [['Audit', 'We map what exists and what repeats.'], ['Foundation', 'We define tokens, rules and base components.'], ['Scale', 'We document and train the team to use it.']] }
    ],
    es: [
      { t: 'Branding', lead: 'Tu marca es lo que la gente siente antes de leer una sola palabra.',
        what: 'Branding es construir la identidad de tu negocio: cómo se presenta, cómo habla y cómo se recuerda. Va mucho más allá del logo: es estrategia, posicionamiento y un lenguaje visual coherente que hace que el cliente confíe y te elija a ti, y no a la competencia.',
        deliver: ['Estrategia y posicionamiento', 'Naming', 'Logo y símbolo', 'Colores y tipografía', 'Tono de voz', 'Manual de marca', 'Rebranding'],
        who: 'Negocios que están naciendo, empresas que crecieron y su marca no las acompañó, o quien necesita diferenciarse en un mercado donde todos se parecen.',
        steps: [['Inmersión', 'Entendemos el negocio, el público y la competencia.'], ['Concepto', 'Definimos posicionamiento, personalidad y dirección visual.'], ['Identidad', 'Creamos la marca y el manual para aplicarla en todo.']] },
      { t: 'UI/UX & Web', lead: 'Un sitio bonito llama la atención. Un sitio bien pensado vende.',
        what: 'Aquí hacemos el diseño web completo de tu sitio: la estructura de las páginas, lo visual y la experiencia (UI/UX), el camino que recorre el visitante hasta convertirse en cliente. Después lo desarrollamos todo en código para entregar sitios rápidos y claros, que explican lo que haces, muestran cómo resuelves el dolor del cliente y llevan al contacto, 24 horas al día.',
        deliver: ['Investigación y arquitectura', 'Wireframes', 'Diseño de interfaz', 'Textos que venden', 'Desarrollo a medida', 'SEO y rendimiento', 'Varios idiomas'],
        who: 'Quien solo tiene Instagram, un sitio que no genera contactos o quiere lanzar una página de alta conversión para un producto o servicio.',
        steps: [['Estrategia', 'Objetivos, público y estructura de las páginas.'], ['Diseño', 'Wireframes e interfaz validados contigo.'], ['Código', 'Desarrollo, pruebas y publicación.']] },
      { t: 'Apps y Sistemas', lead: 'Cuando la planilla ya no alcanza, es hora de un sistema.',
        what: 'Creamos aplicaciones y sistemas web a medida (paneles, plataformas, áreas de cliente y herramientas internas) que automatizan procesos, organizan datos y crecen con tu negocio. Del prototipo a la publicación en las tiendas.',
        deliver: ['Descubrimiento de producto', 'Prototipo navegable', 'Apps iOS y Android', 'Sistemas web y paneles', 'Integraciones y APIs', 'Pruebas con usuarios', 'Soporte y evolución'],
        who: 'Empresas con procesos manuales, startups validando un producto o negocios que quieren ofrecer una experiencia digital propia.',
        steps: [['Descubrimiento', 'Mapeamos el problema y definimos lo esencial.'], ['Prototipo', 'Probamos la idea antes de construir.'], ['Construcción', 'Desarrollamos por etapas, con entregas frecuentes.']] },
      { t: 'Design Systems', lead: 'Consistencia que ahorra tiempo y dinero a tu equipo.',
        what: 'Un design system es la biblioteca viva de tu marca en digital: componentes, reglas y patrones reutilizables que permiten a diseñadores y desarrolladores crear pantallas nuevas en días, no en semanas, siempre con la misma calidad.',
        deliver: ['Auditoría de interfaz', 'Tokens de color, tipo y espacio', 'Biblioteca de componentes', 'Documentación', 'Componentes en código', 'Accesibilidad', 'Capacitación del equipo'],
        who: 'Empresas con un producto digital en crecimiento, varios equipos trabajando juntos o pantallas que ya no combinan entre sí.',
        steps: [['Auditoría', 'Relevamos lo que existe y lo que se repite.'], ['Fundación', 'Definimos tokens, reglas y componentes base.'], ['Escala', 'Documentamos y capacitamos al equipo.']] }
    ]
  };
  // Rebranding (segundo da lista, logo abaixo de Branding). "id" = número do serviço em projects.js (svc)
  const RB = {
    pt: { t: 'Rebranding', lead: 'Sua empresa cresceu. A marca precisa crescer junto.',
      what: 'Rebranding é a evolução de uma marca que já existe: partimos da história e do que o público já reconhece para criar uma identidade mais madura, atual e coerente com o tamanho que o negócio tem hoje, sem jogar fora o que construiu até aqui.',
      deliver: ['Diagnóstico da marca atual', 'Novo posicionamento', 'Redesenho do logo', 'Paleta e tipografia', 'Tom de voz', 'Redes sociais', 'Embalagens', 'Manual de marca'],
      who: 'Empresas que cresceram, mudaram de público ou de mercado, ou que sentem que a marca atual já não representa a qualidade do que entregam.',
      steps: [['Diagnóstico', 'Entendemos o que a marca tem de valioso e o que ficou para trás.'], ['Evolução', 'Redesenhamos a identidade a partir da essência que já existe.'], ['Lançamento', 'Aplicamos a nova marca em todos os pontos de contato.']] },
    en: { t: 'Rebranding', lead: 'Your company grew. Your brand needs to grow with it.',
      what: 'Rebranding is the evolution of an existing brand: we start from its history and what people already recognize to create a more mature, current identity that matches the size of the business today, without throwing away what it has built.',
      deliver: ['Current brand audit', 'New positioning', 'Logo redesign', 'Palette and typography', 'Tone of voice', 'Social media', 'Packaging', 'Brand guidelines'],
      who: 'Companies that have grown, changed audience or market, or feel their current brand no longer reflects the quality of what they deliver.',
      steps: [['Audit', 'We find what is valuable in the brand and what was left behind.'], ['Evolution', 'We redesign the identity from the essence that already exists.'], ['Launch', 'We apply the new brand across every touchpoint.']] },
    es: { t: 'Rebranding', lead: 'Tu empresa creció. La marca tiene que crecer con ella.',
      what: 'El rebranding es la evolución de una marca que ya existe: partimos de su historia y de lo que el público ya reconoce para crear una identidad más madura, actual y acorde al tamaño del negocio hoy, sin tirar lo que construyó hasta aquí.',
      deliver: ['Diagnóstico de la marca actual', 'Nuevo posicionamiento', 'Rediseño del logo', 'Paleta y tipografía', 'Tono de voz', 'Redes sociales', 'Empaques', 'Manual de marca'],
      who: 'Empresas que crecieron, cambiaron de público o de mercado, o que sienten que su marca actual ya no refleja la calidad de lo que entregan.',
      steps: [['Diagnóstico', 'Entendemos lo valioso de la marca y lo que quedó atrás.'], ['Evolución', 'Rediseñamos la identidad a partir de la esencia que ya existe.'], ['Lanzamiento', 'Aplicamos la nueva marca en todos los puntos de contacto.']] }
  };
  ['pt', 'en', 'es'].forEach(l => { S[l].forEach((x, k) => { x.id = k; }); RB[l].id = 4; S[l].splice(1, 0, RB[l]); });

  const list = document.querySelector('.svc-list'); if (!list) return;
  const rows = [...list.querySelectorAll('.svc')];
  const L = () => { const l = (document.documentElement.lang || 'pt').slice(0, 2); return S[l] ? l : 'pt'; };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const ARROW = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>';

  // painel (criado uma vez)
  const panel = document.createElement('div');
  panel.className = 'sv'; panel.hidden = true;
  panel.innerHTML = '<div class="sv-veil" data-close></div><div class="sv-sheet" role="dialog" aria-modal="true" aria-labelledby="sv-title" tabindex="-1"><span class="sv-glow" aria-hidden="true"></span><button type="button" class="sv-x" data-close></button><div class="sv-body" data-lenis-prevent></div></div>';
  document.body.appendChild(panel);
  const sheet = panel.querySelector('.sv-sheet'), body = panel.querySelector('.sv-body'), xBtn = panel.querySelector('.sv-x');
  let cur = 0, lastFocus = null, closing = 0;
  // rolagem automática suave do conteúdo (para no fim ou quando a pessoa mexe)
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let arRaf = 0, arDelay = 0, arLast = 0, arPos = 0, arV = 0;
  const autoStop = () => { cancelAnimationFrame(arRaf); clearTimeout(arDelay); arRaf = 0; };
  const autoStart = () => {
    autoStop();
    if (still || document.documentElement.classList.contains('a11y-motion')) return;
    arDelay = setTimeout(() => {
      arLast = 0; arPos = body.scrollTop; arV = 0;
      const step = t => {
        const dt = arLast ? Math.min(50, t - arLast) : 16; arLast = t;
        arV = Math.min(42, arV + dt * 0.05);            // acelera devagar até ~42px/s
        arPos += arV * dt / 1000; body.scrollTop = arPos;
        if (body.scrollTop + body.clientHeight >= body.scrollHeight - 1) { arRaf = 0; return; }
        arRaf = requestAnimationFrame(step);
      };
      arRaf = requestAnimationFrame(step);
    }, 1100);
  };
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(ev => sheet.addEventListener(ev, autoStop, { passive: true }));

  // projetos do site que usam este serviço (dados em assets/js/projects.js → svc)
  function work(i, u) {
    const P = window.FYW_PROJECTS || {};
    const id = S[L()][i] ? S[L()][i].id : i, items = Object.keys(P).filter(k => Array.isArray(P[k].svc) && P[k].svc.includes(id));
    if (!items.length) return '';
    return '<section class="sv-sec sv-in" style="--d:3"><h3>' + u.work + '</h3><div class="sv-work">' + items.map(k => {
      const x = P[k];
      return '<a class="sv-pj" href="projetos/' + k + '.html" style="--pc:' + (x.color || '#0B0B0B') + '"><span class="sv-pj-img"><img src="' + x.img + '" alt="" loading="lazy" decoding="async"></span>' +
        '<span class="sv-pj-meta"><span><b>' + esc(x.title || x.name) + '</b><small>' + esc(x.sub || x.type) + '</small></span><i aria-label="' + u.view + '">' + ARROW + '</i></span></a>';
    }).join('') + '</div></section>';
  }

  function render(i) {
    const l = L(), u = UI[l], s = S[l][i], n = String(i + 1).padStart(2, '0');
    xBtn.setAttribute('aria-label', u.close);
    xBtn.innerHTML = '<span></span><span></span>';
    sheet.style.setProperty('--sc', 'var(--c' + (i + 1) + ', #7B5CFF)');
    const next = S[l][(i + 1) % S[l].length];
    body.innerHTML =
      '<header class="sv-head sv-in" style="--d:0">' +
        '<h2 class="sv-title" id="sv-title">' + esc(s.t) + '</h2>' +
        '<p class="sv-lead">' + esc(s.lead) + '</p>' +
      '</header>' +
      '<section class="sv-sec sv-in" style="--d:2"><h3>' + u.what + '</h3><p>' + esc(s.what) + '</p></section>' +
      work(i, u) +
      '<section class="sv-sec sv-in" style="--d:3"><h3>' + u.deliver + '</h3><ul class="sv-chips">' + s.deliver.map((x, k) => '<li style="--k:' + k + '">' + esc(x) + '</li>').join('') + '</ul></section>' +
      '<section class="sv-sec sv-in" style="--d:4"><h3>' + u.who + '</h3><p>' + esc(s.who) + '</p></section>' +
      '<section class="sv-sec sv-in" style="--d:5"><h3>' + u.how + '</h3><ol class="sv-steps">' + s.steps.map((st, k) => '<li><span>0' + (k + 1) + '</span><b>' + esc(st[0]) + '</b><p>' + esc(st[1]) + '</p></li>').join('') + '</ol></section>' +
      '<footer class="sv-foot sv-in" style="--d:7">' +
        '<a href="#contact" class="btn btn-ink sv-cta" data-close><span class="btn-roll"><span>' + u.cta + '</span><span aria-hidden="true">' + u.cta + '</span></span><i class="btn-arrow">' + ARROW + '</i></a>' +
        '<button type="button" class="sv-next" data-next><span>' + u.next + '</span><b>' + esc(next.t) + '</b><i>' + ARROW + '</i></button>' +
      '</footer>';
    body.scrollTop = 0; autoStart();
    sheet.classList.remove('is-swap'); void sheet.offsetWidth; sheet.classList.add('is-swap');
  }

  function open(i, from) {
    clearTimeout(closing);
    cur = i; lastFocus = from || document.activeElement;
    render(i);
    panel.hidden = false;
    document.documentElement.classList.add('sv-lock');
    if (window.fywLenis) window.fywLenis.stop();
    requestAnimationFrame(() => requestAnimationFrame(() => { panel.classList.add('is-open'); sheet.focus({ preventScroll: true }); }));
  }
  function close(toContact) {
    if (panel.hidden) return;
    autoStop();
    panel.classList.remove('is-open');
    document.documentElement.classList.remove('sv-lock');
    if (window.fywLenis) window.fywLenis.start();
    closing = setTimeout(() => {
      panel.hidden = true;
      if (toContact) { const c = document.getElementById('contact'); if (c) { if (window.fywLenis) window.fywLenis.scrollTo(c); else c.scrollIntoView({ behavior: 'smooth' }); } }
      else if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }, 650);
  }

  panel.addEventListener('click', e => {
    const c = e.target.closest('[data-close]'); if (c) { e.preventDefault(); close(c.classList.contains('sv-cta')); return; }
    if (e.target.closest('[data-next]')) { cur = (cur + 1) % rows.length; render(cur); sheet.focus({ preventScroll: true }); }
  });
  addEventListener('keydown', e => {
    if (panel.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { // mantém o foco dentro do painel
      const f = [...sheet.querySelectorAll('a, button')]; if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === sheet)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  // cada linha de serviço abre o seu painel (a linha toda e o botão de seta)
  rows.forEach((row, i) => {
    const arrow = row.querySelector('.svc-arrow');
    if (arrow && arrow.tagName !== 'BUTTON') {
      const b = document.createElement('button'); b.type = 'button'; b.className = arrow.className + ' svc-open'; b.innerHTML = arrow.innerHTML;
      arrow.replaceWith(b);
    }
    const btn = row.querySelector('.svc-open');
    const label = () => { const h = row.querySelector('h3'); btn.setAttribute('aria-label', UI[L()].open + ' ' + (h ? h.textContent : '')); };
    label(); new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    row.classList.add('is-clickable');
    row.addEventListener('click', () => open(i, btn));
  });
})();
