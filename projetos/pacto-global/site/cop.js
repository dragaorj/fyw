(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- textos em inglês (o HTML já está em português) ---------- */
  var EN = {
    home: 'Home', agenda: 'Agenda', speakers: 'Speakers', venues: 'Venues', about: 'About', join: 'Join',
    h1: '30th Conference of the Parties to the United Nations Framework Convention on Climate Change',
    lead: 'COP30 plays a key role in leveraging climate ambition and securing the financing needed to reach the goals set out in the Paris Agreement.',
    allEvents: 'See all events', dates: 'November<br>11 to 17', time: 'Time',
    d0: 'Water &amp; Ocean &amp; Waste', d1: 'Agriculture &amp; Forests', d2: 'From Ambition to Corporate Climate Action', d3: 'Beyond Belém: the legacy of COP30',
    r1: 'Global Director of Corporate Relations, Suzano', r3: 'Head of Sustainability, Itaúsa',
    spkH: 'Brilliant minds fighting the climate crisis.', spkCta: 'See the full list of speakers',
    blH: 'COP30 will take place in Belém, capital of Pará, in the heart of the Amazon',
    blP1: 'The city was chosen for its strategic and symbolic importance in the fight against climate change. Several venues have been prepared to host the official, side and public activities during the event.',
    blP2: 'Beyond the official venues, the city will host a wide programme in squares, universities, museums, cultural centres and community spaces, promoting debates on climate, environmental justice, sustainable solutions and innovation.',
    blCta: 'See the official event venues', blCap: 'Capital of Pará · Amazon',
    faqH: 'Answers to the most common questions about the events',
    ftH: 'We are the world’s largest corporate sustainability initiative, with more than 21 thousand members.',
    s1: 'countries', s2: 'companies', s3: 'local networks', s4: 'non-governmental organisations', ftCta: 'Learn more about the Global Compact',
    cookies: 'Cookie policy', privacy: 'Privacy policy', jobs: 'Work with us', copy: '© 2025 COP30. All rights reserved.'
  };
  var PT = {};
  $$('[data-t]').forEach(function (el) { if (!(el.dataset.t in PT)) PT[el.dataset.t] = el.innerHTML; });

  /* ---------- agenda por dia ---------- */
  var DAYS = [
    { d: '11/11', pt: { t: 'Água & Oceano & Resíduos', i: 'O evento reunirá empresas, academia e sociedade civil para o lançamento do Guia Empresarial de Combate ao Lixo no Mar, Protótipo do Reinova, a apresentação do vídeo documentário sobre o protótipo do Reinova, apresentação do Guia Empresarial de Combate ao Lixo no Mar e dois painéis de debate.' },
      en: { t: 'Water & Ocean & Waste', i: 'The event brings together companies, academia and civil society for the launch of the Corporate Guide to Fighting Marine Litter and the Reinova prototype, a documentary screening about the Reinova prototype, a presentation of the guide and two discussion panels.' },
      s: [
        ['08:30 am', { pt: 'Credenciamento', en: 'Registration' }],
        ['09:00 – 09:10 am', { pt: 'Abertura', en: 'Opening' }, { pt: 'Representante Pacto Global – Rede Brasil', en: 'Global Compact – Brazil Network representative' }],
        ['09:10 – 09:20 am', { pt: 'Lançamento do Guia Empresarial de Combate ao Lixo no Mar, Protótipo do Reinova', en: 'Launch of the Corporate Guide to Fighting Marine Litter, Reinova prototype' }, { pt: 'Luiza Demoro, Líder Global de Transição Energética da Bloomberg/BNEF', en: 'Luiza Demoro, Global Head of Energy Transition, Bloomberg/BNEF' }],
        ['09:20 – 10:00 am', { pt: 'Painel Reinova', en: 'Reinova panel' }, null, ['Unilever', 'Alpargatas', 'Coca-Cola', 'Gov. MDIC – Lucas Ramalho'], true],
        ['10:00 – 10:10 am', { pt: 'Apresentação', en: 'Presentation' }],
        ['10:10 – 11:00 am', { pt: 'Painel Blue Keepers', en: 'Blue Keepers panel' }, null, ['Paul Watson', 'Boyan Slat', 'Santos Brasil', 'Porto do Açu', 'Aegea', 'MMA – Adalberto Maluf / Angélica (gabinete presidência)']],
        ['11:00 – 11:50 am', { pt: 'Painel Movimento +Água. Coalizão Brasileira pela Resiliência Hídrica', en: '+Water Movement panel. Brazilian Coalition for Water Resilience' }, null, ['Coca-Cola', 'Aegea'], true],
        ['11:50 – 12:00 pm', { pt: 'Encerramento', en: 'Closing' }]
      ] },
    { d: '12/11', pt: { t: 'Agricultura & Floresta' }, en: { t: 'Agriculture & Forests' } },
    { d: '13/11', pt: { t: 'Da Ambição à Ação Climática Empresarial' }, en: { t: 'From Ambition to Corporate Climate Action' } },
    { d: '17/11', pt: { t: 'Para além de Belém: o legado da COP30' }, en: { t: 'Beyond Belém: the legacy of COP30' } }
  ];
  var FAQ = [
    { pt: ['O que é a COP30?', 'É a 30ª Conferência das Partes da Convenção-Quadro das Nações Unidas sobre Mudança do Clima. A COP30 desempenha um papel fundamental na alavancagem da ambição climática e na garantia de financiamento para alcançar os objetivos estabelecidos no Acordo de Paris.'],
      en: ['What is COP30?', 'It is the 30th Conference of the Parties to the United Nations Framework Convention on Climate Change. COP30 plays a key role in leveraging climate ambition and securing the financing needed to reach the goals of the Paris Agreement.'] },
    { pt: ['Quando e onde acontecerá a COP30?', 'A COP30 será realizada entre 10 e 21 de novembro de 2025, em Belém, no estado do Pará, Brasil. Esta será a primeira vez que a região amazônica sedia o evento, destacando a importância estratégica da floresta para o equilíbrio climático do planeta.'],
      en: ['When and where will COP30 take place?', 'COP30 takes place from 10 to 21 November 2025 in Belém, in the state of Pará, Brazil. It is the first time the Amazon region hosts the event, highlighting the forest’s strategic importance for the planet’s climate balance.'] },
    { pt: ['Quem pode participar da COP30?', 'As negociações oficiais reúnem delegações dos países e observadores credenciados pela ONU. Já as atividades paralelas e abertas, como os eventos do Pacto Global, recebem empresas, academia, sociedade civil e o público em geral.'],
      en: ['Who can take part in COP30?', 'The official negotiations bring together country delegations and UN-accredited observers. Side and public activities, such as the Global Compact events, welcome companies, academia, civil society and the general public.'] },
    { pt: ['Como faço para me credenciar?', 'O credenciamento para a área oficial é feito pela ONU, por meio das organizações observadoras. Para os eventos do Pacto Global, use o botão Participar no topo da página.'],
      en: ['How do I register?', 'Accreditation for the official area is handled by the UN through observer organisations. For the Global Compact events, use the Join button at the top of the page.'] },
    { pt: ['Onde acontecerão os eventos da COP30 em Belém?', 'Além dos locais oficiais, a cidade contará com programação em praças, universidades, museus, centros culturais e espaços comunitários.'],
      en: ['Where will the COP30 events take place in Belém?', 'Besides the official venues, the city will host activities in squares, universities, museums, cultural centres and community spaces.'] },
    { pt: ['Como chegar a Belém?', 'Belém é servida pelo Aeroporto Internacional Val-de-Cans, com voos para as principais capitais do país.'],
      en: ['How do I get to Belém?', 'Belém is served by Val-de-Cans International Airport, with flights to Brazil’s main capitals.'] },
    { pt: ['Onde posso me hospedar?', 'A cidade conta com hotéis, pousadas e hospedagens alternativas preparadas para o evento. Como a procura é alta, reserve com antecedência.'],
      en: ['Where can I stay?', 'The city has hotels, guesthouses and alternative accommodation prepared for the event. Demand is high, so book early.'] }
  ];

  var lang = 'pt';
  lang = (function(){var O={pt:1,en:1,es:1};try{var s=localStorage.getItem('fio-lang');if(O[s])return s;}catch(e){}var n=(navigator.language||'en').slice(0,2).toLowerCase();return O[n]?n:'en';})(); if (lang !== 'pt') lang = 'en';
  var cur = 0;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function renderAgenda() {
    var D = DAYS[cur], L = D[lang], box = $('#agendaBox');
    var h = '<div class="ag-head"><b>' + D.d + '</b><span>Agenda</span><i></i><img src="img/logo-cop30.svg" alt="" width="30" height="30"></div>';
    h += '<div class="ag-intro"><h3>' + esc(L.t) + '</h3>' + (L.i ? '<p>' + esc(L.i) + '</p>' : '') + '</div>';
    if (D.s) {
      h += '<div class="ag-list">' + D.s.map(function (s) {
        var who = s[3] ? '<ul>' + s[3].map(function (n) { return '<li>' + (s[4] ? (lang === 'pt' ? 'Representante ' : '') + esc(n) + (lang === 'en' ? ' representative' : '') : esc(n)) + '</li>'; }).join('') + '</ul>' : '';
        return '<div class="slot"><time>' + s[0] + '</time><div><h4>' + esc(s[1][lang]) + '</h4>' + (s[2] ? '<p>' + esc(s[2][lang]) + '</p>' : '') + who + '</div></div>';
      }).join('') + '</div>';
      h += '<a class="btn btn-gold" href="https://www.pactoglobal.org.br/" target="_blank" rel="noopener">' + (lang === 'pt' ? 'Saiba mais' : 'Learn more') + '</a>';
    } else h += '<p class="ag-soon">' + (lang === 'pt' ? 'A programação completa deste dia será divulgada em breve.' : 'The full programme for this day will be announced soon.') + '</p>';
    box.innerHTML = h;
  }
  function renderFaq() {
    $('#faqBox').innerHTML = FAQ.map(function (q, i) {
      return '<details class="qa"' + (i === 1 ? ' open' : '') + '><summary>' + (i + 1) + ' – ' + esc(q[lang][0]) + '<i></i></summary><div class="ans"><p>' + esc(q[lang][1]) + '</p></div></details>';
    }).join('');
    $$('.qa').forEach(function (d) {
      $('summary', d).addEventListener('click', function (e) {
        e.preventDefault();
        var open = !d.open; $$('.qa').forEach(function (o) { o.open = false; }); d.open = open;
        if (open && window.gsap && !reduce) gsap.fromTo($('.ans', d), { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .5, ease: 'power3.out' });
      });
    });
  }
  function setLang(l) {
    lang = l; root.lang = l === 'pt' ? 'pt-BR' : 'en';
    
    $$('[data-t]').forEach(function (el) { var k = el.dataset.t, v = l === 'en' ? EN[k] : PT[k]; if (v != null) el.innerHTML = v; });
    $$('.lang button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.lang === l); });
    document.title = l === 'pt' ? 'Pacto Global na COP30 — Belém, 11 a 17 de novembro' : 'Global Compact at COP30 — Belém, November 11–17';
    renderAgenda(); renderFaq();
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

  /* dias */
  $$('.day').forEach(function (b) {
    b.addEventListener('click', function () {
      cur = +b.dataset.day;
      $$('.day').forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
      renderAgenda();
      if (window.gsap && !reduce) gsap.fromTo('#agendaBox', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' });
    });
  });

  /* header, menu, topo */
  var nav = $('#nav'), tt = $('.totop');
  function onScroll() { nav.classList.toggle('is-solid', scrollY > 40); tt.classList.toggle('is-on', scrollY > innerHeight * .8); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = $('.burger');
  function menu(o) { root.classList.toggle('is-menu', o); document.body.classList.toggle('is-lock', o); burger.setAttribute('aria-expanded', o); $('#menu').setAttribute('aria-hidden', !o); }
  burger.addEventListener('click', function () { menu(!root.classList.contains('is-menu')); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });
  // item ativo do menu conforme a seção
  var secs = ['inicio', 'agenda', 'palestrantes', 'locais', 'sobre'].map(function (id) { return document.getElementById(id); });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var id = e.target.id === 'inicio' ? 'top' : e.target.id; $$('.links a:not(.cta)').forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + id); }); } }); }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) so.observe(s); });
  }

  /* palestrantes: o do meio cresce; clique troca o destaque */
  $$('.sp').forEach(function (s) { s.addEventListener('mouseenter', function () { if (innerWidth > 760) { $$('.sp').forEach(function (x) { x.classList.toggle('is-big', x === s); }); } }); });


  /* faixas que rolam pro lado (dias e palestrantes): arrastar com o mouse também */
  ['.days', '.spk-row'].forEach(function (s) {
    var el = $(s); if (!el) return; var d = null, moved = false;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || el.scrollWidth <= el.clientWidth) return; d = { x: e.clientX, l: el.scrollLeft }; moved = false; el.style.scrollSnapType = 'none'; el.style.cursor = 'grabbing'; });
    addEventListener('pointermove', function (e) { if (!d) return; var dx = e.clientX - d.x; if (Math.abs(dx) > 5) moved = true; el.scrollLeft = d.l - dx; });
    addEventListener('pointerup', function () { if (!d) return; d = null; el.style.scrollSnapType = ''; el.style.cursor = ''; });
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  /* revelação */
  var rvs = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add('in'); });

  setLang(lang);

  if (window.gsap && !reduce) {
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.nav-in > *', { y: -16, opacity: 0, duration: .7, stagger: .06 })
      .from('.hero h1', { y: 30, opacity: 0, duration: 1 }, .15)
      .from('.hero-row > *', { y: 24, opacity: 0, duration: .9, stagger: .1 }, .4)
      .from('.day', { y: 40, opacity: 0, duration: .9, stagger: .08, clearProps: 'transform,opacity' }, .55);
    gsap.fromTo('.hero-bg img', { scale: 1.08 }, { scale: 1, duration: 2.4, ease: 'power2.out' });
  }
})();
