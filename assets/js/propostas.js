/* Fyw · propostas comerciais e tabela de preços (/propostas, dentro do login do painel).
   Lista das propostas salvas, editor com prévia ao vivo, PDF (impressão em página única de 1240 px) e tabela de preços editável.
   Grava no Supabase pela /api/propostas. Se o servidor não responder (ex.: prévia local ou tabela ainda não criada),
   grava neste navegador e avisa no topo. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const R = n => 'R$ ' + Math.round(+n || 0).toLocaleString('pt-BR');
  const L = a => (Array.isArray(a) ? a : []).map(x => String(x == null ? '' : x).trim()).filter(Boolean);
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
  const clone = o => JSON.parse(JSON.stringify(o));
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const hoje = () => { const d = new Date(); return { longa: d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear(), cod: 'PCF' + String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0') + d.getFullYear() }; };
  const dataCurta = iso => { try { return new Date(iso).toLocaleDateString('pt-BR'); } catch (e) { return ''; } };

  /* ---------- tabela de preços 2027 (padrão; editável em /propostas#/tabela) ---------- */
  const TAB0 = {
    titulo: 'Tabela de preços 2027',
    itens: [
      { id: 'hotsite', grupo: 'Eventos', nome: 'Hotsite de evento', desc: 'Home e até 3 páginas internas, seção de retrospectiva, até 2 rodadas de ajustes e 1 ajuste pós-evento.', tabela: 6500, parceiro: 5000, un: '' },
      { id: 'encerramento', grupo: 'Eventos', nome: 'Hotsite de encerramento', desc: 'Resultados e indicadores, palestrantes e atrações, galeria e retrospectiva, em até 3 idiomas.', tabela: 6500, parceiro: 5000, un: '' },
      { id: 'website', grupo: 'Eventos', nome: 'Website oficial do evento', desc: 'Agenda, palestrantes, patrocinadores, informações práticas e contato, com painel de edição e versão bilíngue.', tabela: 16000, parceiro: 12500, un: '' },
      { id: 'agenda', grupo: 'Eventos', nome: 'Plataforma de agenda e programação', desc: 'Agenda em lista, grade e cards, filtros, sessões e palestrantes, painel administrativo e até 3 idiomas.', tabela: 12500, parceiro: 10000, un: '', rotulo: 'Proposta comercial para plataforma de programação' },
      { id: 'portal', grupo: 'Conteúdo', nome: 'Portal ou hub de conteúdo', desc: 'Até 6 páginas e página modelo, filtros por tema, painel de edição, formulário com LGPD e 30 dias de suporte.', tabela: 8600, parceiro: 7000, un: '' },
      { id: 'branding', grupo: 'Marca', nome: 'Branding completo', desc: 'Criação de marca do zero: estratégia, logo, identidade visual, manual da marca e arquivos finais editáveis.', tabela: 10700, parceiro: 8500, un: '' },
      { id: 'rebranding', grupo: 'Marca', nome: 'Rebranding completo', desc: 'Diagnóstico, estratégia de marca, novo logo, identidade visual, manual da marca e arquivos finais editáveis.', tabela: 10700, parceiro: 8500, un: '' },
      { id: 'manutencao', grupo: 'Continuidade', nome: 'Manutenção e suporte dos sistemas', desc: 'Disponibilidade diária, atualizações, infraestrutura em nuvem e manutenção dos sistemas por 12 meses.', tabela: 2000, parceiro: 1500, un: '/mês' },
      { id: 'mensal', grupo: 'Continuidade', nome: 'Contrato mensal de tecnologia e design', desc: 'Demandas contínuas de sites, sistemas e design gráfico, sem contagem de horas. Mínimo de 3 meses.', tabela: 7000, parceiro: 5500, un: '/mês' }
    ],
    // pacote: seção própria no fim da tabela. Valor fixo (o que fechou com o Impact Minds 2026 & 2027, sem a manutenção);
    // parceiro paga o pacote com desconto
    pacote: { nome: 'Pacote da edição', titulo: 'Toda a edição do evento\nem um só contrato', itens: ['hotsite', 'website', 'agenda', 'encerramento'], preco: 35000, parceiroDesconto: 20 },
    pagamento: ['50% na aprovação e 50% na entrega', 'Até 12x no cartão de crédito (juros da operadora)', '10% de desconto à vista no Pix', 'Valores fechados, sem cobrança por hora']
  };
  let TAB = clone(TAB0);
  const r100 = n => Math.round(n / 100) * 100;
  const pacoteValores = T => {
    const p = T.pacote || {}, its = (p.itens || []).map(id => T.itens.find(x => x.id === id)).filter(Boolean);
    const st = its.reduce((a, x) => a + (+x.tabela || 0), 0), sp = its.reduce((a, x) => a + (+x.parceiro || 0), 0);
    const tabela = +p.preco || st, parceiro = r100(tabela * (1 - (+p.parceiroDesconto || 0) / 100));
    return { its, somaTabela: st, somaParceiro: sp, tabela, parceiro, economia: Math.max(0, st - tabela) };
  };
  const tipos = () => { const v = pacoteValores(TAB); return TAB.itens.concat(TAB.pacote && v.its.length ? [{ id: 'pacote', nome: TAB.pacote.nome, tabela: v.tabela, parceiro: v.parceiro, un: '' }] : []); };

  /* ---------- armazenamento: servidor (Supabase) ou este navegador ---------- */
  const LK = 'fyw-propostas', LT = 'fyw-tabela-precos', LSEM = 'fyw-propostas-bas';
  const lget = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  let MODO = 'api';
  const LOCAL = { local: true };
  function local(motivo) {
    if (MODO === 'local') return; MODO = 'local';
    const a = $('#aviso'); a.hidden = false;
    a.innerHTML = '<b>Salvando só neste navegador.</b> ' + esc(motivo) + ' Enquanto isso, as propostas e a tabela ficam guardadas aqui e não aparecem em outros aparelhos.';
  }
  async function api(a, q, body) {
    if (MODO === 'local') throw LOCAL;
    let r;
    try { r = await fetch('/api/propostas?a=' + a + (q || ''), { method: body ? 'POST' : 'GET', credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }); }
    catch (e) { local('O servidor não respondeu.'); throw LOCAL; }
    const json = /json/.test(r.headers.get('content-type') || '');
    const j = json ? await r.json().catch(() => ({})) : {};
    if (r.status === 401) { location.href = '/painel?volta=propostas'; throw new Error('Entre com a senha do painel.'); }
    if (!json || r.status === 404 && !j.erro) { local('O servidor das propostas não está disponível aqui.'); throw LOCAL; }
    if (r.status === 503) { local(j.tabela === false ? 'Falta criar as tabelas no banco: rode o arquivo supabase/propostas.sql no SQL Editor do Supabase.' : (j.erro || 'Banco não conectado.')); throw LOCAL; }
    if (!r.ok) throw new Error(j.erro || ('Erro ' + r.status));
    return j;
  }
  // a agenda chegou a ir para R$ 8.500 / 6.500 por engano; quem gravou assim volta para R$ 12.500 / 10.000
  const agendaNova = d => { if (d && d.tipoId === 'agenda' && d.precoTabela === 'R$ 8.500' && d.preco === 'R$ 6.500') { d.precoTabela = 'R$ 12.500'; d.preco = 'R$ 10.000'; } return d; };
  const lrow = p => ({ id: p.id, titulo: p.dados.titulo, cliente: p.dados.cliente, tipo: p.dados.tipo, preco: p.dados.preco, logo: p.dados.logo, pdfs: p.dados.pdfs, criado: p.criado, atualizado: p.atualizado });
  const store = {
    async list() {
      try {
        const rows = await api('list');
        // propostas guardadas neste navegador antes do banco existir sobem sozinhas
        const loc = lget(LK, []); if (loc.length) { for (const p of loc) await api('save', '', { dados: p.dados }); lset(LK, []); return api('list'); }
        return rows;
      } catch (e) { if (e !== LOCAL) throw e; return lget(LK, []).map(lrow).sort((a, b) => b.atualizado < a.atualizado ? -1 : 1); }
    },
    async get(id) {
      try { const r = await api('get', '&id=' + encodeURIComponent(id)); return { id: r.id, dados: r.dados }; }
      catch (e) { if (e !== LOCAL) throw e; const p = lget(LK, []).find(x => x.id === id); if (!p) throw new Error('Proposta não encontrada.'); return p; }
    },
    async save(id, dados) {
      try { const r = await api('save', '', { id, dados }); return r && r.id; }
      catch (e) {
        if (e !== LOCAL) throw e;
        const list = lget(LK, []), now = new Date().toISOString();
        let p = id && list.find(x => x.id === id); if (!p) { p = { id: id || uid(), criado: now }; list.push(p); }
        p.dados = dados; p.atualizado = now;
        if (!lset(LK, list)) throw new Error('Sem espaço neste navegador: use imagens mais leves.');
        return p.id;
      }
    },
    async del(id) {
      try { await api('del', '&id=' + encodeURIComponent(id), {}); }
      catch (e) { if (e !== LOCAL) throw e; lset(LK, lget(LK, []).filter(x => x.id !== id)); }
    },
    async tabela() { try { return await api('tabela'); } catch (e) { if (e !== LOCAL) throw e; return lget(LT, null); } },
    async tabelaSave(t) { try { return await api('tabela-save', '', { tabela: t }); } catch (e) { if (e !== LOCAL) throw e; lset(LT, t); return t; } }
  };

  /* ---------- modelo de proposta ---------- */
  function nova() {
    const h = hoje();
    return {
      modelo: 'nova', pdfs: [],
      tipoId: '', tipo: '', rotulo: 'Proposta comercial', titulo: 'Nome do projeto', cliente: 'Cliente', logo: '',
      data: h.longa, codigo: h.cod, prazo: 'Até 20 dias úteis', contato: 'fyw.ggwp@gmail.com',
      objetivo: '', objetivoTexto: ['', ''],
      publicoTitulo: 'Para quem estamos construindo', publico: [],
      demo: { ativo: false, titulo: 'Como funciona', nota: '', sessoes: [] },
      estruturaTag: 'Estrutura do projeto', estruturaTitulo: 'O que vamos construir', estrutura: [{ t: '', itens: [] }, { t: '', itens: [] }], funcionalidades: [],
      cronogramaTitulo: 'No ar em até 20 dias úteis',
      etapas: [{ t: 'Planejamento', periodo: 'Dias 1 a 5', desc: '' }, { t: 'Desenvolvimento', periodo: 'Dias 6 a 16', desc: '' }, { t: 'Publicação', periodo: 'Dias 17 a 20', desc: '' }],
      cronogramaNota: 'Prazo contado a partir da aprovação da proposta, da definição do escopo e do recebimento dos materiais.',
      beneficiosTitulo: 'O que o evento ganha', beneficios: [],
      parceiro: false, precoTabela: '', preco: '', precoNota: 'Condição parceiro Fyw 2027, para quem fecha 6 serviços no ano ou uma proposta anual.',
      escopo: [],
      condicoes: [{ k: 'Entrada', v: '50% na aprovação' }, { k: 'Restante', v: 'Na entrega' }, { k: 'No cartão', v: 'Até 12x (juros da operadora)' }, { k: 'À vista no Pix', v: '10% de desconto' }],
      proximos: ['Aprovação da proposta', 'Pagamento da entrada', 'Reunião de início do projeto'],
      assinaturaCliente: '',
      legal: 'Os dados e informações desta proposta têm caráter formal e ilustrativo. Prazos, recursos e valores podem ser ajustados em reuniões posteriores ou por necessidades identificadas durante a execução. Com a assinatura, as partes concordam com todos os termos aqui descritos. Proposta confidencial, destinada exclusivamente à empresa solicitante; é vedada sua divulgação sem autorização expressa da Fyw.'
    };
  }
  const B = '/assets/img/propostas/bas/';
  function bas() {
    const d = nova();
    return Object.assign(d, {
      modelo: 'bas',
      tipoId: 'agenda', tipo: 'Plataforma de agenda e programação', rotulo: 'Proposta comercial para plataforma de programação', titulo: 'Plataforma oficial de programação', cliente: 'Bio Amazon Summit', logo: B + 'logo.svg',
      data: '12 de novembro de 2026', codigo: 'PCF12112026', prazo: 'Até 20 dias úteis',
      objetivo: 'Agenda, palestrantes e trilhas do Bio Amazon Summit em uma única experiência digital.',
      objetivoTexto: ['A plataforma será administrável por um painel online, com atualizações em tempo real feitas pela própria equipe, de qualquer lugar.', 'Os participantes encontram as informações do evento com rapidez em qualquer dispositivo, enquanto a equipe organizadora mantém total autonomia para gerenciar e publicar os conteúdos.'],
      publico: ['Participantes e visitantes', 'Palestrantes, painelistas e convidados', 'Patrocinadores e parceiros', 'Equipe organizadora', 'Imprensa e mídia especializada', 'Representantes governamentais', 'Empresas e investidores', 'Público nacional e internacional'],
      demo: { ativo: true, titulo: 'Como a agenda funciona', nota: 'Exemplo real da agenda do Impacta Mais 2026, desenvolvida pela Fyw.', sessoes: [
        { hora: '09:00', titulo: 'Performance de Lira  ·  Marina Viski e Angelo Lazzari', pessoas: '', fotos: [], dur: '15 min', trilha: 'Atrações artísticas', local: 'Palco principal', cor: '#C026D3' },
        { hora: '09:30', titulo: 'Abertura oficial', pessoas: 'Luciana Inácia Gomes, Philippe Figueiredo, Eduardo Zdanowicz e Pablo Handl', fotos: [B + 'luciana.webp', B + 'philippe.webp', B + 'eduardo.webp'], dur: '60 min', trilha: 'Temas transversais', local: 'Palco principal', cor: '#FF6A2B' },
        { hora: '10:30', titulo: 'O Brasil tem jeito? Democracia, confiança e caminhos possíveis para o futuro', pessoas: 'Creomar de Souza, Izabella Teixeira, Paulo Hartung e Andréa Álvares', fotos: [B + 'creomar.webp', B + 'izabella.webp', B + 'paulo.webp'], dur: '60 min', trilha: 'Temas transversais', local: 'Palco principal', cor: '#FF6A2B' }
      ] },
      estruturaTag: 'Estrutura da plataforma',
      estrutura: [
        { t: 'Portal oficial de programação', itens: ['Destaques do evento', 'Principais palestrantes', 'Informações institucionais', 'Acesso à agenda'] },
        { t: 'Agenda inteligente', itens: ['Visualização em lista, grade e cards', 'Busca e filtros', 'Programação completa', 'Organização automática por horário'] },
        { t: 'Sessões', itens: ['Horários e salas', 'Trilhas temáticas', 'Formatos de conteúdo', 'Detalhes das atividades'] },
        { t: 'Palestrantes', itens: ['Perfil profissional', 'Biografia resumida', 'Organização e cargo', 'Sessões vinculadas'] }
      ],
      funcionalidades: ['Atualização em tempo real', 'Responsivo (celular, tablet e desktop)', 'Acessibilidade (WCAG 2.1)', 'Segurança (SSL e LGPD)'],
      etapas: [
        { t: 'Planejamento', periodo: 'Dias 1 a 5', desc: 'Requisitos, arquitetura da informação e aprovação do escopo.' },
        { t: 'Desenvolvimento', periodo: 'Dias 6 a 16', desc: 'Front-end, back-end e integrações da plataforma.' },
        { t: 'Publicação', periodo: 'Dias 17 a 20', desc: 'Testes, configuração e publicação da plataforma.' }
      ],
      beneficios: ['Programação centralizada em uma única plataforma', 'Mais autonomia para a equipe organizadora', 'Menos erros operacionais durante o evento', 'Melhor experiência para participantes e palestrantes', 'Imagem mais forte para patrocinadores e parceiros', 'Estrutura pronta para as próximas edições'],
      parceiro: true, precoTabela: 'R$ 12.500', preco: 'R$ 10.000',
      escopo: ['Desenvolvimento completo da plataforma', 'Painel administrativo para a equipe', 'Versões em português, inglês e espanhol', 'Integração com Google Agenda', 'Configuração e publicação', 'Servidores, backup e recuperação de dados inclusos'],
      condicoes: [{ k: 'Entrada', v: '50% na aprovação' }, { k: 'Restante', v: 'Em 2x' }, { k: 'No cartão', v: 'Até 12x (juros da operadora)' }, { k: 'À vista no Pix', v: '10% de desconto' }],
      assinaturaCliente: 'Bio Amazon Summit'
    });
  }

  /* ---------- documento (HTML igual ao modelo de página única do Figma) ---------- */
  const IC = {
    clock: '<svg class="ico" width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    mic: '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" style="margin-top:3px"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    cal: '<svg class="ico" width="18" height="18" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M12 13v4M10 15h4"/></svg>',
    check: '<svg class="ck" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#C8F53C"/><path d="M9 14.5l3.2 3.2L19 11" fill="none" stroke="#0B0B0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  const logoFyw = '<svg viewBox="0 0 804 513" aria-label="Fyw"><use href="#fyw-logo"/></svg>';
  const glows = '<i class="gl" style="left:660px;top:-300px;width:760px;height:680px;background:#C8F53C;opacity:.36"></i><i class="gl" style="left:-340px;top:440px;width:760px;height:700px;background:#7B5CFF;opacity:.42"></i><i class="gl" style="left:720px;top:640px;width:640px;height:520px;background:#2F6BFF;opacity:.3"></i>';
  const chips = a => '<div class="chips">' + L(a).map(x => '<span class="chip co"><i class="dot"></i>' + esc(x) + '</span>').join('') + '</div>';
  const br = s => esc(s).replace(/\n/g, '<br>');

  function doc(d) {
    let n = 0;
    const tag = nome => '<div class="tag"><b class="rot">' + String(++n).padStart(2, '0') + '</b><span class="rot">' + esc(nome) + '</span></div>';
    const S = [];
    const obj = L(d.objetivoTexto);
    if (d.objetivo || obj.length) S.push('<section class="sec">' + tag('Objetivo') + (d.objetivo ? '<h2 class="t1">' + br(d.objetivo) + '</h2>' : '') + (obj.length ? '<div class="two co">' + obj.map(p => '<p>' + br(p) + '</p>').join('') + '</div>' : '') + '</section>');
    if (L(d.publico).length) S.push('<section class="sec">' + tag('Público-alvo') + '<h2 class="t1">' + br(d.publicoTitulo) + '</h2>' + chips(d.publico) + '</section>');
    const dm = d.demo || {};
    if (dm.ativo && (dm.sessoes || []).length) {
      S.push('<section class="sec">' + tag('Demonstração') + '<h2 class="t1">' + br(dm.titulo) + '</h2><div class="demo">' + dm.sessoes.map(s => {
        const c = s.cor || '#FF6A2B', f = L(s.fotos);
        return '<div class="hora cp">' + IC.clock + '<span>' + esc(s.hora) + '</span></div>' +
          '<div class="ss" style="--c:' + esc(c) + '">' + (f.length ? '<div class="av">' + f.map(u => '<img src="' + esc(u) + '" alt="">').join('') + '</div>' : '') +
          '<div class="si"><p class="t3">' + esc(s.titulo) + '</p>' + (s.pessoas ? '<p class="pp cp">' + IC.mic + '<span>' + esc(s.pessoas) + '</span></p>' : '') + (s.dur ? '<p class="du cp">' + IC.clock + '<span>' + esc(s.dur) + '</span></p>' : '') + '</div>' +
          '<div class="st">' + (s.trilha ? '<span class="et cp" style="background:color-mix(in srgb,' + esc(c) + ' 14%,#fff);color:color-mix(in srgb,' + esc(c) + ' 78%,#000)">' + esc(s.trilha) + '</span>' : '') + (s.local ? '<span class="et cp">' + esc(s.local) + '</span>' : '') + '<span class="cal">' + IC.cal + '</span></div></div>';
      }).join('') + '</div>' + (dm.nota ? '<p class="note cp">' + esc(dm.nota) + '</p>' : '') + '</section>');
    }
    const est = (d.estrutura || []).filter(c => c.t || L(c.itens).length), fn = L(d.funcionalidades);
    if (est.length || fn.length) S.push('<section class="sec">' + tag(d.estruturaTag || 'Estrutura do projeto') + '<h2 class="t1">' + br(d.estruturaTitulo) + '</h2>' +
      (est.length ? '<div class="grid" style="--n:' + (est.length % 3 === 0 && est.length % 2 ? 3 : est.length === 1 ? 1 : 2) + '">' + est.map(c => '<div class="card"><i class="dot"></i><p class="t3">' + esc(c.t) + '</p><ul class="cp">' + L(c.itens).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>').join('') + '</div>' : '') +
      (fn.length ? '<p class="rot flab">Funcionalidades</p>' + chips(fn) : '') + '</section>');
    const et = (d.etapas || []).filter(e => e.t || e.desc);
    if (et.length) S.push('<section class="sec">' + tag('Cronograma') + '<h2 class="t1">' + br(d.cronogramaTitulo) + '</h2><div class="tl">' + et.map((e, i) => '<div><b class="n rot">' + String(i + 1).padStart(2, '0') + '</b><p class="t3">' + esc(e.t) + '</p>' + (e.periodo ? '<p class="rot mut">' + esc(e.periodo) + '</p>' : '') + (e.desc ? '<p class="cp mut">' + esc(e.desc) + '</p>' : '') + '</div>').join('') + '</div>' + (d.cronogramaNota ? '<p class="note cp">' + esc(d.cronogramaNota) + '</p>' : '') + '</section>');
    if (L(d.beneficios).length) S.push('<section class="sec">' + tag('Benefícios') + '<h2 class="t1">' + br(d.beneficiosTitulo) + '</h2><div class="ben" style="--r:' + Math.ceil(L(d.beneficios).length / 2) + '">' + L(d.beneficios).map(b => '<div>' + IC.check + '<span class="co">' + esc(b) + '</span></div>').join('') + '</div></section>');
    if (d.preco || L(d.escopo).length) {
      const cd = (d.condicoes || []).filter(c => c.k || c.v);
      S.push('<section class="sec">' + tag('Investimento') + '<div class="inv"><div class="vr"><div class="vl"><p class="rot o6">Investimento total</p>' +
        (d.parceiro ? '<span class="sp rot">Valor exclusivo para parceiros Fyw</span>' + (d.precoTabela ? '<p class="co o7">Valor normal: <s>' + esc(d.precoTabela) + '</s></p>' : '') : '') +
        '<p class="pg">' + esc(d.preco) + '</p>' + (d.parceiro && d.precoNota ? '<p class="cp o7">' + esc(d.precoNota) + '</p>' : '') + '</div>' +
        (L(d.escopo).length ? '<div class="vl"><p class="rot o6">Escopo da entrega</p><ul class="co">' + L(d.escopo).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' : '<div></div>') + '</div>' +
        (cd.length ? '<div class="cd">' + cd.map(c => '<div><p class="rot o5">' + esc(c.k) + '</p><p class="t3">' + esc(c.v) + '</p></div>').join('') + '</div>' : '') + '</div></section>');
    }
    const px = L(d.proximos);
    const fim = '<section class="sec">' + (px.length ? '<p class="rot pxl">Próximos passos</p><div class="nx">' + px.map((p, i) => '<div><i class="co">' + (i + 1) + '</i><span class="co">' + esc(p) + '</span></div>').join('') + '</div>' : '') +
      '<div class="sg"><div><p class="cp">' + esc(d.assinaturaCliente || d.cliente) + '  ·  Contratante</p></div><div class="fy"><img class="ass" src="/assets/img/propostas/assinatura-fyw.svg?v=2" alt="Assinatura Fyw" width="314" height="283"><p class="cp">Fyw  ·  CNPJ 27.354.079/0001-05</p></div></div>' +
      (d.legal ? '<p class="lg cp">' + esc(d.legal) + '</p>' : '') + '<div class="ft cp"><span>fyw.com.br  ·  fyw.ggwp@gmail.com</span><span>' + esc(d.codigo) + '</span></div></section>';
    const meta = [['Data', d.data], ['Código', d.codigo], ['Prazo', d.prazo], ['Contato', d.contato]].filter(m => m[1]);
    return '<div class="pdoc"><header class="ph">' + glows + '<div class="in"><div class="top">' + logoFyw + '<span class="pill rot"><i></i>Proposta comercial</span></div><div class="grow"></div>' +
      '<div class="row"><div class="lgbox' + (d.logo ? '' : ' vazio') + '">' + (d.logo ? '<img src="' + esc(d.logo) + '" alt="' + esc(d.cliente) + '">' : '<span class="rot o5">Logo do cliente</span>') + '</div><i class="div"></i>' +
      '<div class="col"><p class="rot lima">' + esc(d.rotulo) + '</p><h1 class="t1">' + br(d.titulo) + '</h1><p class="co o7">Preparada para ' + esc(d.cliente) + '</p></div></div>' +
      '<div class="line"></div><div class="meta">' + meta.map(m => '<div><p class="rot o5">' + m[0] + '</p><p class="co">' + esc(m[1]) + '</p></div>').join('') + '</div></div></header>' +
      '<div class="pb">' + S.join('') + fim + '</div></div>';
  }

  function tdoc(T) {
    const grupos = []; for (const x of T.itens) { let g = grupos.find(g => g.n === x.grupo); if (!g) grupos.push(g = { n: x.grupo, it: [] }); g.it.push(x); }
    let n = 0;
    const meses = 'JFMAMJJASOND'.split('').map((m, i) => '<span class="' + (i % 2 ? 'on' : '') + '">' + m + '</span>').join('');
    const pv = pacoteValores(T), pk = T.pacote || {};
    const sv = x => '<div class="sv"><p class="t3">' + esc(x.nome) + '</p><p class="cp">' + esc(x.desc) + '</p><div class="pr"><div class="tb"><span class="rot">Tabela</span><s>' + R(x.tabela) + esc(x.un) + '</s></div><div class="pa"><span class="rot">Parceiro</span><b>' + R(x.parceiro) + esc(x.un) + '</b></div></div></div>';
    const grp = nome => '<div class="grp"><b>' + String(++n).padStart(2, '0') + '</b><h2 class="t2">' + esc(nome) + '</h2></div>';
    return '<div class="pdoc tdoc"><header class="ph">' + glows.replace(/top:640px/, 'top:300px') + '<div class="in"><div class="top">' + logoFyw + '<span class="pill rot"><i></i>' + esc(T.titulo) + '</span></div>' +
      '<div class="hx"><p class="rot lima">Valores fixos para 2027</p><h1 class="t1">Preços fixos para eventos,<br>sites, sistemas e marcas</h1><p class="co o7">Valor fechado, sem cobrança por hora. Clientes parceiros pagam menos em todos os serviços.</p></div></div></header>' +
      '<div class="pb"><div class="pbox"><div class="hd"><div><p class="rot">Condição parceiro</p><h2 class="t2">Como virar parceiro Fyw</h2></div><span class="bd rot">Preço de parceiro em todos os serviços</span></div>' +
      '<div class="op"><div><p class="rot">Opção 1</p><p class="t3">6 serviços em 12 meses</p><p class="cp">Um serviço fechado a cada 2 meses ao longo do ano.</p><div class="mes">' + meses + '</div></div>' +
      '<div><p class="rot">Opção 2</p><p class="t3">Um ano inteiro de uma vez</p><p class="cp">Fechar uma proposta que cubra os 12 meses do ano.</p><div class="ano"><span>Jan</span><span>12 meses</span><span>Dez</span></div></div></div></div>' +
      grupos.map(g => grp(g.n) + '<div class="svc">' + g.it.map(sv).join('') + '</div>').join('') +
      (pv.its.length ? grp(pk.nome || 'Pacote') + '<div class="pkg">' + '<i class="gl" style="left:560px;top:-260px;width:620px;height:480px;background:#C8F53C;opacity:.3"></i><i class="gl" style="left:-260px;top:180px;width:600px;height:480px;background:#7B5CFF;opacity:.38"></i>' +
        '<div class="pl"><p class="rot lima">Os ' + pv.its.length + ' serviços da edição, valor fixo</p><h3 class="t2">' + br(pk.titulo) + '</h3><ul>' + pv.its.map(x => '<li><i></i><span class="co">' + esc(x.nome) + '</span><small class="cp">' + R(x.tabela) + '</small></li>').join('') + '</ul></div>' +
        '<div class="pr2"><p class="sep"><span class="rot o5">Separados</span><s class="co o5">' + R(pv.somaTabela) + '</s></p>' + (pv.economia ? '<span class="off rot">Economia de ' + R(pv.economia) + '</span>' : '') + '<p class="rot o6">Valor do pacote</p><p class="pg">' + R(pv.tabela) + '</p>' +
        '<div class="pp2"><p class="rot lima">Parceiro Fyw</p><b>' + R(pv.parceiro) + '</b><p class="cp o6">' + (+pk.parceiroDesconto || 0) + '% off sobre o valor do pacote.</p></div></div></div>' : '') +
      '<div class="pgto"><div><p class="rot lima">Condições de pagamento</p><h2 class="t2">Do mesmo jeito em<br>todos os serviços</h2></div><ul class="cp">' + L(T.pagamento).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' +
      '<div class="ft cp"><span>fyw.com.br  ·  fyw.ggwp@gmail.com</span><span>CNPJ 27.354.079/0001-05</span></div></div></div>';
  }

  /* ---------- prévia em escala e PDF ---------- */
  function preview(html) {
    const box = $('#pvs'), pv = $('#pv');
    box.innerHTML = html;
    const el = box.firstElementChild;
    const fit = () => { const w = Math.min(1240, pv.clientWidth - 2 * parseFloat(getComputedStyle(pv).paddingLeft)); const k = w / 1240; el.style.transform = 'scale(' + k + ')'; box.style.width = w + 'px'; box.style.height = el.offsetHeight * k + 'px'; };
    fit(); el.querySelectorAll('img').forEach(i => i.complete || i.addEventListener('load', fit)); document.fonts && document.fonts.ready.then(fit);
    preview.fit = fit;
  }
  addEventListener('resize', () => preview.fit && preview.fit());
  async function pdf(html, nome) {
    const p = $('#print'); p.innerHTML = html;
    await (document.fonts ? document.fonts.ready : Promise.resolve());
    await Promise.all([...p.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    const h = Math.ceil(p.firstElementChild.getBoundingClientRect().height) || p.firstElementChild.scrollHeight;
    let st = $('#pagesz'); if (!st) { st = document.createElement('style'); st.id = 'pagesz'; document.head.appendChild(st); }
    st.textContent = '@page { size: 1240px ' + h + 'px; margin: 0 }';
    const t = document.title; document.title = nome.replace(/[\\/:*?"<>|]/g, '-');
    setTimeout(() => { window.print(); document.title = t; }, 60);
  }
  // o #print precisa ter altura medida: fica fora da tela, mas com layout
  $('#print').style.cssText = 'position:absolute;left:-99999px;top:0;display:block';
  const nomePdf = d => 'Proposta Fyw - ' + (d.cliente || 'Cliente') + ' - ' + (d.titulo || 'Projeto').replace(/\n/g, ' ');

  /* ---------- imagens enviadas (logo e fotos) ---------- */
  const lerArquivo = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(f); });
  const reduz = (src, max, quadrado) => new Promise(ok => {
    const im = new Image(); im.onload = () => {
      let w = im.naturalWidth, h = im.naturalHeight, sx = 0, sy = 0, sw = w, sh = h;
      if (quadrado) { const m = Math.min(w, h); sx = (w - m) / 2; sy = (h - m) / 2; sw = sh = m; w = h = Math.min(max, m); }
      else { const k = Math.min(1, max / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k); }
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
      ok(c.toDataURL(quadrado ? 'image/jpeg' : 'image/png', .86));
    }; im.onerror = () => ok(src); im.src = src;
  });
  async function imagem(f, tipo) {
    if (!f) return '';
    if (f.size > 3e6) { alert('Imagem muito pesada (máx. 3 MB).'); return ''; }
    const src = await lerArquivo(f);
    if (/svg/.test(f.type)) return src;                 // SVG entra como está (fica nítido no PDF)
    return tipo === 'foto' ? reduz(src, 160, true) : reduz(src, 900, false);
  }

  /* ---------- editor da proposta ---------- */
  let ID = null, D = null, salvo = true, fila = Promise.resolve(), tSalvar = 0, tPrev = 0;
  const get = (o, p) => p.split('.').reduce((a, k) => a == null ? a : a[k], o);
  const set = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => a[k] == null ? (a[k] = {}) : a[k], o); t[last] = v; };
  const vin = (lab, k, o = {}) => '<label class="f"><span>' + lab + '</span>' + (o.area ? '<textarea data-k="' + k + '" rows="' + (o.rows || 3) + '">' + esc(get(D, k)) + '</textarea>' : '<input data-k="' + k + '" value="' + esc(get(D, k)) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + '>') + (o.dica ? '<small>' + o.dica + '</small>' : '') + '</label>';
  const vls = (lab, k, dica, rows) => '<label class="f"><span>' + lab + '</span><textarea data-l="' + k + '" rows="' + (rows || 4) + '">' + esc(L(get(D, k)).join('\n')) + '</textarea><small>' + (dica || 'Um item por linha.') + '</small></label>';
  const box = (num, t, html, open, pad) => '<details class="bx"' + (open ? ' open' : '') + '><summary><i>' + num + '</i>' + t + '</summary><div class="bd">' + html + (pad ? '<div class="rs"><button class="x" type="button" ' + pad + '>Voltar ao padrão</button></div>' : '') + '</div></details>';
  // campos de cada seção da proposta (para "Voltar ao padrão" por seção)
  const SECOES = {
    capa: ['logo', 'tipoId', 'tipo', 'rotulo', 'titulo', 'cliente', 'data', 'codigo', 'prazo', 'contato'],
    objetivo: ['objetivo', 'objetivoTexto'], publico: ['publicoTitulo', 'publico'], demo: ['demo'],
    estrutura: ['estruturaTag', 'estruturaTitulo', 'estrutura', 'funcionalidades'], crono: ['cronogramaTitulo', 'etapas', 'cronogramaNota'],
    ben: ['beneficiosTitulo', 'beneficios'], inv: ['parceiro', 'precoTabela', 'preco', 'precoNota', 'escopo', 'condicoes'], fim: ['proximos', 'assinaturaCliente', 'legal']
  };
  const modeloDe = d => d.modelo === 'bas' ? bas() : nova();
  let antes = null, tAntes = null, tUndo = 0;
  const mostraDesfazer = () => { const u = $('#undo'); if (!u) return; u.hidden = false; clearTimeout(tUndo); tUndo = setTimeout(() => { const v = $('#undo'); if (v) v.hidden = true; }, 20000); };
  const agora = () => new Date().toISOString();
  const quando = iso => { try { const d = new Date(iso); return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
  const rep = (t, del, html) => '<div class="rep"><div class="rh"><span>' + t + '</span><button class="x" type="button" data-del="' + del + '">Remover</button></div>' + html + '</div>';

  function form() {
    const abertos = [...document.querySelectorAll('#form details')].map(x => x.open);
    const tp = tipos();
    const capa =
      '<div class="up"><div class="th">' + (D.logo ? '<img src="' + esc(D.logo) + '" alt="">' : '<span>Sem logo</span>') + '</div><div class="bt"><label class="btn">Enviar logo<input type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" data-up="logo"></label>' + (D.logo ? '<button class="x" type="button" data-nologo>Tirar logo</button>' : '') + '</div></div>' +
      '<label class="f"><span>Tipo de projeto</span><select data-tipo>' + '<option value="">Personalizado (sem tabela)</option>' + tp.map(x => '<option value="' + esc(x.id) + '"' + (x.id === D.tipoId ? ' selected' : '') + '>' + esc(x.nome) + ' · ' + R(x.tabela) + esc(x.un || '') + '</option>').join('') + '</select><small>Puxa o valor da tabela de preços. Dá para mudar o valor depois, em Investimento.</small></label>' +
      '<label class="chk"><input type="checkbox" data-k="parceiro"' + (D.parceiro ? ' checked' : '') + '>Cliente parceiro Fyw (preço de parceiro)</label>' +
      vin('Nome do projeto', 'titulo', { area: true, rows: 2 }) + vin('Cliente (para quem é a proposta)', 'cliente') + vin('Frase acima do nome do projeto', 'rotulo') +
      '<div class="g2">' + vin('Data', 'data') + vin('Código', 'codigo') + vin('Prazo', 'prazo') + vin('Contato', 'contato') + '</div>';
    const objetivo = vin('Objetivo (título grande)', 'objetivo', { area: true, rows: 2 }) + vin('Texto 1', 'objetivoTexto.0', { area: true }) + vin('Texto 2', 'objetivoTexto.1', { area: true });
    const publico = vin('Título', 'publicoTitulo') + vls('Para quem estamos construindo', 'publico', 'Um público por linha.', 6);
    const dm = D.demo;
    const demo = '<label class="chk"><input type="checkbox" data-k="demo.ativo"' + (dm.ativo ? ' checked' : '') + '>Mostrar demonstração na proposta</label>' + vin('Título', 'demo.titulo') +
      dm.sessoes.map((s, i) => rep('Sessão ' + (i + 1), 'demo.sessoes.' + i,
        '<div class="g3">' + vin('Horário', 'demo.sessoes.' + i + '.hora') + vin('Duração', 'demo.sessoes.' + i + '.dur') + '<label class="f"><span>Cor</span><input type="color" data-k="demo.sessoes.' + i + '.cor" value="' + esc(s.cor || '#FF6A2B') + '"></label></div>' +
        vin('Título da sessão', 'demo.sessoes.' + i + '.titulo', { area: true, rows: 2 }) + vin('Palestrantes', 'demo.sessoes.' + i + '.pessoas') +
        '<div class="g2">' + vin('Trilha', 'demo.sessoes.' + i + '.trilha') + vin('Local', 'demo.sessoes.' + i + '.local') + '</div>' +
        '<div class="f"><span>Fotos dos palestrantes</span><div class="fotos">' + L(s.fotos).map((u, j) => '<span class="ft"><img src="' + esc(u) + '" alt=""><button type="button" data-fdel="' + i + '.' + j + '" aria-label="Tirar foto">×</button></span>').join('') + '<label class="btn">Adicionar<input type="file" accept="image/*" multiple data-up="foto.' + i + '"></label></div></div>')).join('') +
      '<button class="add" type="button" data-add="demo.sessoes">+ Adicionar sessão</button>' + vin('Nota abaixo', 'demo.nota');
    const estrutura = vin('Etiqueta da seção', 'estruturaTag') + vin('Título', 'estruturaTitulo') +
      D.estrutura.map((c, i) => rep('Bloco ' + (i + 1), 'estrutura.' + i, vin('Nome do bloco', 'estrutura.' + i + '.t') + vls('Itens', 'estrutura.' + i + '.itens'))).join('') +
      '<button class="add" type="button" data-add="estrutura">+ Adicionar bloco</button>' + vls('Funcionalidades', 'funcionalidades');
    const crono = vin('Título', 'cronogramaTitulo') + D.etapas.map((e, i) => rep('Etapa ' + (i + 1), 'etapas.' + i, '<div class="g2">' + vin('Nome', 'etapas.' + i + '.t') + vin('Período', 'etapas.' + i + '.periodo') + '</div>' + vin('O que acontece', 'etapas.' + i + '.desc', { area: true, rows: 2 }))).join('') +
      '<button class="add" type="button" data-add="etapas">+ Adicionar etapa</button>' + vin('Nota', 'cronogramaNota', { area: true, rows: 2 });
    const ben = vin('Título', 'beneficiosTitulo') + vls('Benefícios', 'beneficios', 'Um por linha. Fica melhor com número par (2 colunas).', 6);
    const inv = '<div class="g2">' + vin('Valor final', 'preco', { ph: 'R$ 10.000' }) + vin('Valor normal (riscado)', 'precoTabela', { ph: 'R$ 12.500', dica: 'Só aparece para parceiro.' }) + '</div>' + vin('Nota do valor de parceiro', 'precoNota', { area: true, rows: 2 }) +
      vls('Escopo da entrega', 'escopo', 'Um item por linha.', 6) +
      D.condicoes.map((c, i) => rep('Condição ' + (i + 1), 'condicoes.' + i, '<div class="g2">' + vin('Título', 'condicoes.' + i + '.k') + vin('Valor', 'condicoes.' + i + '.v') + '</div>')).join('') +
      '<button class="add" type="button" data-add="condicoes">+ Adicionar condição</button>';
    const fim = vls('Próximos passos', 'proximos', 'Um por linha (até 3 ficam lado a lado).', 3) + vin('Nome na assinatura do cliente', 'assinaturaCliente', { ph: D.cliente }) + vin('Texto legal', 'legal', { area: true, rows: 5 });
    $('#form').innerHTML = '<div class="eh"><a class="btn" href="#/"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>Propostas</a><button class="btn" type="button" data-padrao="tudo">Voltar tudo ao padrão</button><button class="btn del" type="button" data-excluir>Excluir</button><button class="x" type="button" id="undo" data-desfazer hidden>Desfazer</button><span class="st" id="st"></span></div>' +
      box('01', 'Capa e tipo', capa, true, 'data-padrao="capa"') + box('02', 'Objetivo', objetivo, false, 'data-padrao="objetivo"') + box('03', 'Público-alvo', publico, false, 'data-padrao="publico"') +
      box('04', 'Demonstração', demo, false, 'data-padrao="demo"') + box('05', 'Estrutura', estrutura, false, 'data-padrao="estrutura"') + box('06', 'Cronograma', crono, false, 'data-padrao="crono"') +
      box('07', 'Benefícios', ben, false, 'data-padrao="ben"') + box('08', 'Investimento', inv, false, 'data-padrao="inv"') + box('09', 'Fechamento', fim, false, 'data-padrao="fim"');
    document.querySelectorAll('#form details').forEach((x, i) => { if (abertos.length) x.open = !!abertos[i]; });
    status();
  }
  const status = (m) => { const s = $('#st'); if (!s) return; s.className = 'st' + (salvo && !m ? ' ok' : ''); s.textContent = m || (salvo ? (MODO === 'local' ? 'Salvo neste navegador' : 'Salvo') : 'Salvando…'); };
  function mudou(refazForm) {
    salvo = false; status();
    if (refazForm) form();
    clearTimeout(tPrev); tPrev = setTimeout(() => preview(doc(D)), refazForm ? 0 : 120);
    clearTimeout(tSalvar); tSalvar = setTimeout(salvar, 700);
  }
  function salvar() {
    const dados = clone(D);
    fila = fila.then(async () => {
      try { const id = await store.save(ID, dados); if (id && id !== ID) { ID = id; try { history.replaceState(null, '', '#/p/' + id); } catch (e) {} } salvo = true; status(); }
      catch (e) { status('Não salvou: ' + e.message); }
    });
    return fila;
  }
  function aplicaTipo() {
    const x = tipos().find(t => t.id === D.tipoId); if (!x) return;
    D.tipo = x.nome;
    D.precoTabela = R(x.tabela) + (x.un || '');
    D.preco = (D.parceiro ? R(x.parceiro) : R(x.tabela)) + (x.un || '');
  }
  $('#form').addEventListener('input', e => {
    if (!D) return;
    const t = e.target, k = t.dataset.k, l = t.dataset.l;
    if (k) { set(D, k, t.type === 'checkbox' ? t.checked : t.value); if (k === 'parceiro') { aplicaTipo(); form(); } if (k === 'cliente' && $('[data-k=assinaturaCliente]')) $('[data-k=assinaturaCliente]').placeholder = t.value; mudou(k === 'parceiro'); }
    else if (l) { set(D, l, t.value.split('\n').map(s => s.trim()).filter(Boolean)); mudou(); }
  });
  $('#form').addEventListener('change', async e => {
    if (!D) return;
    const t = e.target;
    if (t.matches('[data-tipo]')) {
      D.tipoId = t.value; const x = tipos().find(y => y.id === t.value);
      if (x) { D.rotulo = x.rotulo || ('Proposta comercial para ' + x.nome.charAt(0).toLowerCase() + x.nome.slice(1)); aplicaTipo(); }
      return mudou(true);
    }
    const up = t.dataset.up; if (!up) return;
    const files = [...t.files]; t.value = '';
    if (up === 'logo') { const v = await imagem(files[0], 'logo'); if (v) { D.logo = v; mudou(true); } return; }
    const i = +up.split('.')[1], s = D.demo.sessoes[i];
    for (const f of files) { const v = await imagem(f, 'foto'); if (v) s.fotos = L(s.fotos).concat(v); }
    mudou(true);
  });
  const NOVOS = { 'demo.sessoes': () => ({ hora: '', titulo: '', pessoas: '', fotos: [], dur: '', trilha: '', local: '', cor: '#FF6A2B' }), estrutura: () => ({ t: '', itens: [] }), etapas: () => ({ t: '', periodo: '', desc: '' }), condicoes: () => ({ k: '', v: '' }) };
  $('#form').addEventListener('click', async e => {
    if (!D) return;
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.add) { get(D, b.dataset.add).push(NOVOS[b.dataset.add]()); return mudou(true); }
    if (b.dataset.del) { const p = b.dataset.del.split('.'), i = +p.pop(); get(D, p.join('.')).splice(i, 1); return mudou(true); }
    if (b.dataset.fdel) { const [i, j] = b.dataset.fdel.split('.').map(Number); D.demo.sessoes[i].fotos.splice(j, 1); return mudou(true); }
    if (b.hasAttribute('data-nologo')) { D.logo = ''; return mudou(true); }
    if (b.dataset.padrao) {
      const k = b.dataset.padrao, M = modeloDe(D);
      if (k === 'tudo') { if (!confirm('Voltar a proposta inteira ao modelo padrão? Tudo o que foi escrito nela será trocado.')) return; antes = clone(D); M.pdfs = L(D.pdfs); D = M; }
      else { antes = clone(D); for (const f of SECOES[k]) D[f] = clone(M[f]); if (k === 'inv' && D.tipoId) aplicaTipo(); }
      mudou(true); mostraDesfazer(); return;
    }
    if (b.hasAttribute('data-desfazer')) { if (antes) { D = antes; antes = null; mudou(true); } return; }
    if (b.hasAttribute('data-excluir')) { if (!confirm('Excluir a proposta "' + (D.titulo || '') + '"? Não dá para desfazer.')) return; clearTimeout(tSalvar); await fila; if (ID) await store.del(ID); ID = null; location.hash = '#/'; }
  });

  /* ---------- tabela de preços (editável) ---------- */
  let tTab = 0;
  const fmtN = v => (+v || 0) ? (+v).toLocaleString('pt-BR') : '';
  const pctTxt = x => (+x.tabela && +x.parceiro && +x.parceiro < +x.tabela) ? 'Parceiro paga ' + Math.round((1 - x.parceiro / x.tabela) * 100) + '% a menos (economia de ' + R(x.tabela - x.parceiro) + (x.un || '') + ')' : '';
  const money = (lab, k, v) => '<label class="f"><span>' + lab + '</span><span class="money"><i>R$</i><input data-t="' + k + '" data-m value="' + esc(fmtN(v)) + '" inputmode="numeric"></span></label>';
  function tform() {
    const abertos = [...document.querySelectorAll('#form details')].map(x => x.open);
    const grupos = [...new Set(TAB.itens.map(x => x.grupo))], g0 = new Set(TAB0.itens.map(x => x.grupo));
    const pv = pacoteValores(TAB), pk = TAB.pacote;
    const svc = i => {
      const x = TAB.itens[i], k = 'itens.' + i;
      return '<div class="svx"><div class="sh"><input class="nm" data-t="' + k + '.nome" value="' + esc(x.nome) + '" aria-label="Nome do serviço"><button class="x" type="button" data-del="' + k + '">Remover</button></div>' +
        '<div class="g3">' + money('Tabela', k + '.tabela', x.tabela) + money('Parceiro', k + '.parceiro', x.parceiro) +
        '<label class="f"><span>Cobrança</span><select data-t="' + k + '.un"><option value=""' + (x.un ? '' : ' selected') + '>Valor único</option><option value="/mês"' + (x.un === '/mês' ? ' selected' : '') + '>Por mês</option></select></label></div>' +
        '<small class="pct" data-pct="' + i + '">' + pctTxt(x) + '</small>' +
        '<label class="f"><span>Descrição</span><textarea data-t="' + k + '.desc" rows="2">' + esc(x.desc) + '</textarea></label>' +
        '<label class="f"><span>Grupo</span><select data-grupo="' + i + '">' + grupos.map(g => '<option' + (g === x.grupo ? ' selected' : '') + '>' + esc(g) + '</option>').join('') + '<option value="__novo">Novo grupo…</option></select></label></div>';
    };
    let n = 0; const num = () => String(++n).padStart(2, '0');
    const blocos = grupos.map(g => box(num(), esc(g) + ' <small>' + TAB.itens.filter(x => x.grupo === g).length + '</small>',
      '<label class="f"><span>Nome do grupo</span><input data-gnome="' + esc(g) + '" value="' + esc(g) + '"></label>' +
      TAB.itens.map((x, i) => x.grupo === g ? svc(i) : '').join('') +
      '<button class="add" type="button" data-tadd="' + esc(g) + '">+ Serviço em ' + esc(g) + '</button>', false, g0.has(g) ? 'data-tpadrao="g:' + esc(g) + '"' : '')).join('');
    $('#form').innerHTML = '<div class="eh"><a class="btn" href="#/"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>Propostas</a><button class="btn" type="button" data-tpadrao="tudo">Voltar tudo ao padrão</button><button class="x" type="button" id="undo" data-tdesfazer hidden>Desfazer</button><span class="st" id="st"></span></div>' +
      '<p class="soma">Os valores ficam salvos e aparecem na hora na prévia. Cada seção tem o botão <b>Voltar ao padrão</b> (valores de 2027).</p>' +
      blocos + '<button class="add" type="button" data-tgrupo>+ Novo grupo</button>' +
      box(num(), 'Pacote da edição <small>fim da tabela</small>', tin('Nome', 'pacote.nome', pk.nome) + '<label class="f"><span>Título</span><textarea data-t="pacote.titulo" rows="2">' + esc(pk.titulo) + '</textarea></label>' +
        '<div class="f"><span>Serviços do pacote</span>' + TAB.itens.map(x => '<label class="chk"><input type="checkbox" data-pk="' + esc(x.id) + '"' + (pk.itens.includes(x.id) ? ' checked' : '') + '>' + esc(x.nome) + '</label>').join('') + '</div>' +
        '<div class="g2">' + money('Valor fixo do pacote', 'pacote.preco', pk.preco) + tin('Desconto parceiro (%)', 'pacote.parceiroDesconto', pk.parceiroDesconto, 'inputmode="numeric"') + '</div>' +
        '<p class="soma" data-pv>' + resumoPacote(pv) + '</p>', false, 'data-tpadrao="pacote"') +
      box(num(), 'Condições de pagamento', '<label class="f"><span>Condições</span><textarea data-tl="pagamento" rows="4">' + esc(L(TAB.pagamento).join('\n')) + '</textarea><small>Uma por linha.</small></label>', false, 'data-tpadrao="pagamento"');
    const ds = document.querySelectorAll('#form details');
    ds.forEach((x, i) => { x.open = abertos.length ? !!abertos[i] : i === 0; });
    status();
  }
  const resumoPacote = pv => 'Separados: ' + R(pv.somaTabela) + ' · Pacote: <b>' + R(pv.tabela) + '</b>' + (pv.economia ? ' (economia de ' + R(pv.economia) + ')' : '') + '<br>Pacote para parceiro: <b>' + R(pv.parceiro) + '</b>';
  const tin = (lab, k, v, extra) => '<label class="f"><span>' + lab + '</span><input data-t="' + k + '" value="' + esc(v == null ? '' : v) + '" ' + (extra || '') + '></label>';
  const NUM = /\.(tabela|parceiro|preco|parceiroDesconto)$/;
  let VISTA = 'lista';
  function tmudou(refaz) {
    salvo = false; status(); if (refaz) tform();
    clearTimeout(tPrev); tPrev = setTimeout(() => preview(tdoc(TAB)), refaz ? 0 : 120);
    clearTimeout(tTab); tTab = setTimeout(salvarTabela, 700);
  }
  function salvarTabela() {
    clearTimeout(tTab); TAB.atualizado = agora(); const t = clone(TAB);
    fila = fila.then(() => store.tabelaSave(t)).then(() => { salvo = true; status(); }, e => status('Não salvou: ' + e.message));
    return fila;
  }
  function tabelaEventos(on) {
    const f = $('#form');
    const atualizaResumo = () => { const s = document.querySelector('#form [data-pv]'); if (s) s.innerHTML = resumoPacote(pacoteValores(TAB)); };
    f.oninput = !on ? null : e => {
      const t = e.target;
      if (t.dataset.t) {
        const k = t.dataset.t, v = NUM.test(k) ? +String(t.value).replace(/\D/g, '') || 0 : t.value; set(TAB, k, v);
        const m = /^itens\.(\d+)\./.exec(k); if (m) { const c = document.querySelector('#form [data-pct="' + m[1] + '"]'); if (c) c.textContent = pctTxt(TAB.itens[+m[1]]); }
        atualizaResumo(); tmudou(false);
      }
      else if (t.dataset.tl) { set(TAB, t.dataset.tl, t.value.split('\n').map(s => s.trim()).filter(Boolean)); tmudou(false); }
      else if (t.dataset.pk) { const id = t.dataset.pk, a = TAB.pacote.itens; if (t.checked) { if (!a.includes(id)) a.push(id); } else a.splice(a.indexOf(id), 1); tmudou(true); }
    };
    f.onchange = !on ? null : e => {
      const t = e.target;
      if (t.hasAttribute('data-m')) t.value = fmtN(get(TAB, t.dataset.t));
      if (t.dataset.grupo != null) {
        const x = TAB.itens[+t.dataset.grupo]; let g = t.value;
        if (g === '__novo') { g = (prompt('Nome do novo grupo:') || '').trim(); if (!g) { t.value = x.grupo; return; } }
        x.grupo = g; const resto = TAB.itens.filter(y => y !== x), at = resto.map(y => y.grupo).lastIndexOf(g);
        resto.splice(at < 0 ? resto.length : at + 1, 0, x); TAB.itens = resto; tmudou(true);
      }
      if (t.dataset.gnome != null) { const de = t.dataset.gnome, para = t.value.trim(); if (!para || para === de) { t.value = de; return; } TAB.itens.forEach(x => { if (x.grupo === de) x.grupo = para; }); tmudou(true); }
    };
    f.onclick = !on ? null : e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.tadd != null) { const g = b.dataset.tadd, at = TAB.itens.map(x => x.grupo).lastIndexOf(g); TAB.itens.splice(at + 1, 0, { id: 's' + Date.now().toString(36), grupo: g, nome: 'Novo serviço', desc: '', tabela: 0, parceiro: 0, un: '' }); return tmudou(true); }
      if (b.hasAttribute('data-tgrupo')) { const g = (prompt('Nome do novo grupo:') || '').trim(); if (!g) return; TAB.itens.push({ id: 's' + Date.now().toString(36), grupo: g, nome: 'Novo serviço', desc: '', tabela: 0, parceiro: 0, un: '' }); return tmudou(true); }
      if (b.dataset.del && b.dataset.del.startsWith('itens.')) { const i = +b.dataset.del.split('.')[1], x = TAB.itens[i]; if (!confirm('Tirar "' + x.nome + '" da tabela?')) return; tAntes = clone(TAB); TAB.itens.splice(i, 1); TAB.pacote.itens = TAB.pacote.itens.filter(id => id !== x.id); tmudou(true); return mostraDesfazer(); }
      if (b.dataset.tpadrao) {
        const k = b.dataset.tpadrao;
        if (k === 'tudo') { if (!confirm('Voltar a tabela inteira para os valores padrão de 2027?')) return; tAntes = clone(TAB); TAB = Object.assign(clone(TAB0), { pdfs: L(TAB.pdfs) }); }
        else if (k === 'pacote') { tAntes = clone(TAB); TAB.pacote = clone(TAB0.pacote); }
        else if (k === 'pagamento') { tAntes = clone(TAB); TAB.pagamento = clone(TAB0.pagamento); }
        else if (k.startsWith('g:')) {
          const g = k.slice(2), novos = clone(TAB0.itens.filter(x => x.grupo === g)), ids = new Set(novos.map(x => x.id));
          tAntes = clone(TAB);
          const at = TAB.itens.findIndex(x => x.grupo === g);
          TAB.itens = TAB.itens.filter(x => x.grupo !== g && !ids.has(x.id));
          TAB.itens.splice(at < 0 ? TAB.itens.length : Math.min(at, TAB.itens.length), 0, ...novos);
        }
        tmudou(true); return mostraDesfazer();
      }
      if (b.hasAttribute('data-tdesfazer')) { if (tAntes) { TAB = tAntes; tAntes = null; tmudou(true); } }
    };
  }

  /* ---------- lista ---------- */
  const pdfChip = a => { a = L(a); return a.length ? '<span class="chipx">PDF baixado em ' + dataCurta(a[a.length - 1]) + (a.length > 1 ? ' · ' + a.length + 'x' : '') + '</span>' : ''; };
  async function lista() {
    const c = $('#cards'); c.innerHTML = '<p class="vazio">Carregando…</p>';
    let rows;
    try { rows = await store.list(); } catch (e) { c.innerHTML = '<p class="vazio">' + esc(e.message) + '</p>'; return; }
    // a proposta do BAS entra uma vez, de exemplo
    if (!rows.some(r => r.cliente === 'Bio Amazon Summit') && !lget(LSEM, false)) { await store.save(null, bas()); lset(LSEM, true); rows = await store.list(); }
    $('#lsub').textContent = rows.length ? rows.length + (rows.length === 1 ? ' proposta salva.' : ' propostas salvas.') + ' Tudo fica aqui até você excluir.' : 'Tudo o que você gerar fica salvo aqui até você excluir.';
    c.innerHTML = !rows.length ? '<div class="vazio">Nenhuma proposta ainda. Clique em <b>Nova proposta</b>.</div>' : rows.map(r => '<article class="pc" data-id="' + esc(r.id) + '"><div class="lg" data-ed>' + (r.logo ? '<img src="' + esc(r.logo) + '" alt="">' : '<span>Sem logo</span>') + '</div>' +
      '<div class="in"><h3>' + esc(r.titulo) + '</h3><p class="cl">' + esc(r.cliente) + '</p><div class="mt">' + (r.tipo ? '<span class="chipx">' + esc(r.tipo) + '</span>' : '') + (r.preco ? '<span class="chipx acc">' + esc(r.preco === 'R$ 6.500' && /agenda/i.test(r.tipo || '') ? 'R$ 10.000' : r.preco) + '</span>' : '') + '<span class="chipx">Editada em ' + dataCurta(r.atualizado) + '</span>' + pdfChip(r.pdfs) + '</div></div>' +
      '<div class="ac"><button class="btn" type="button" data-ed>Editar</button><button class="btn" type="button" data-pdf>Baixar PDF</button><button class="btn" type="button" data-dup>Duplicar</button><button class="btn del" type="button" data-del>Excluir</button></div></article>').join('');
    // tabela de preços
    const pv = pacoteValores(TAB);
    $('#tabcard').innerHTML = '<article class="pc"><div class="lg" data-ted><span class="tt">Tabela de preços<b>' + esc(String(TAB.titulo).replace(/\D+/g, '') || '2027') + '</b></span></div>' +
      '<div class="in"><h3>' + esc(TAB.titulo) + '</h3><p class="cl">' + TAB.itens.length + ' serviços' + (pv.its.length ? ' + pacote da edição' : '') + '</p><div class="mt">' + (pv.its.length ? '<span class="chipx acc">Pacote ' + R(pv.tabela) + '</span>' : '') + (TAB.atualizado ? '<span class="chipx">Editada em ' + dataCurta(TAB.atualizado) + '</span>' : '<span class="chipx">Valores padrão 2027</span>') + pdfChip(TAB.pdfs) + '</div></div>' +
      '<div class="ac"><button class="btn" type="button" data-ted>Editar</button><button class="btn" type="button" data-tpdf>Baixar PDF</button></div></article>';
    // PDFs baixados
    const hist = [];
    rows.forEach(r => L(r.pdfs).forEach(d => hist.push({ d, nome: r.titulo + ' · ' + r.cliente, id: r.id })));
    L(TAB.pdfs).forEach(d => hist.push({ d, nome: TAB.titulo, id: 'tabela' }));
    hist.sort((a, b) => a.d < b.d ? 1 : -1);
    $('#hist').innerHTML = hist.length ? '<ul class="hist">' + hist.slice(0, 30).map(h => '<li><svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 14h6M10 17h4"/></svg><div><b>' + esc(h.nome) + '</b><small>Baixado em ' + quando(h.d) + '</small></div><button class="btn" type="button" data-hpdf="' + esc(h.id) + '">Baixar de novo</button></li>').join('') + '</ul><p class="hnota">"Baixar de novo" gera o PDF com a versão atual da proposta.</p>' : '<p class="vazio">Os PDFs que você baixar aparecem aqui, com data e hora.</p>';
  }
  $('#cards').addEventListener('click', async e => {
    const card = e.target.closest('.pc'); if (!card) return; const id = card.dataset.id;
    const b = e.target.closest('[data-ed],[data-pdf],[data-dup],[data-del]'); if (!b) return;
    if (b.hasAttribute('data-ed')) return void (location.hash = '#/p/' + id);
    try {
      if (b.hasAttribute('data-pdf')) return pdfProposta(id);
      if (b.hasAttribute('data-dup')) { const p = await store.get(id); const d = clone(p.dados); d.titulo = d.titulo + ' (cópia)'; d.pdfs = []; const nid = await store.save(null, d); return void (location.hash = '#/p/' + nid); }
      if (b.hasAttribute('data-del')) { if (!confirm('Excluir esta proposta? Não dá para desfazer.')) return; await store.del(id); lista(); }
    } catch (x) { alert(x.message); }
  });
  $('#tabcard').addEventListener('click', e => {
    if (e.target.closest('[data-ted]')) location.hash = '#/tabela';
    else if (e.target.closest('[data-tpdf]')) { pdfTabela(); setTimeout(lista, 800); }
  });
  $('#hist').addEventListener('click', async e => {
    const b = e.target.closest('[data-hpdf]'); if (!b) return;
    try { if (b.dataset.hpdf === 'tabela') { pdfTabela(); setTimeout(lista, 800); } else await pdfProposta(b.dataset.hpdf); } catch (x) { alert(x.message); }
  });

  /* ---------- telas ---------- */
  const tela = v => { $('#vlista').hidden = v !== 'lista'; $('#ved').hidden = v === 'lista'; document.querySelectorAll('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.v === (v === 'tabela' ? 'tabela' : 'lista'))); };
  $('#ved').addEventListener('click', e => {
    if (!e.target.closest('[data-pdf]')) return;
    if (D) { D.pdfs = L(D.pdfs).concat(agora()).slice(-30); mudou(); pdf(doc(D), nomePdf(D)); }
    else pdfTabela();
  });
  function pdfTabela() { TAB.pdfs = L(TAB.pdfs).concat(agora()).slice(-30); salvarTabela(); pdf(tdoc(TAB), 'Fyw - ' + TAB.titulo); }
  async function pdfProposta(id) {
    const p = await store.get(id); agendaNova(p.dados);
    p.dados.pdfs = L(p.dados.pdfs).concat(agora()).slice(-30);
    await store.save(id, p.dados);
    await pdf(doc(p.dados), nomePdf(p.dados));
    setTimeout(lista, 800);
  }
  async function rota() {
    const h = location.hash.replace(/^#\/?/, '');
    clearTimeout(tSalvar);
    if (!salvo) { if (D) await salvar(); else if (VISTA === 'tabela') await salvarTabela(); }
    clearTimeout(tTab);
    D = null; ID = null; salvo = true;
    await carregaTabela();
    VISTA = h === 'tabela' ? 'tabela' : 'outra';
    if (h === 'tabela') { tela('tabela'); tabelaEventos(true); $('#pinfo').textContent = 'Prévia da tabela de preços (página única)'; tform(); preview(tdoc(TAB)); return; }
    tabelaEventos(false);
    if (h === 'nova') { tela('ed'); D = nova(); $('#pinfo').textContent = 'Prévia do PDF (página única, 1240 px de largura)'; form(); preview(doc(D)); await salvar(); return; }
    const m = /^p\/(.+)$/.exec(h);
    if (m) {
      tela('ed'); $('#form').innerHTML = '<p class="vazio">Carregando…</p>';
      try { const p = await store.get(decodeURIComponent(m[1])); ID = p.id; D = Object.assign(nova(), { modelo: p.dados.cliente === 'Bio Amazon Summit' ? 'bas' : 'nova' }, agendaNova(p.dados)); }
      catch (e) { $('#form').innerHTML = '<p class="vazio">' + esc(e.message) + '</p>'; return; }
      $('#pinfo').textContent = 'Prévia do PDF (página única, 1240 px de largura)'; form(); preview(doc(D)); return;
    }
    tela('lista'); lista();
  }
  let tabOk = false;
  async function carregaTabela() {
    if (tabOk) return; tabOk = true;
    try { const t = await store.tabela(); if (t && Array.isArray(t.itens)) { TAB = Object.assign(clone(TAB0), t); if (!TAB.pacote || TAB.pacote.preco == null) TAB.pacote = Object.assign(clone(TAB0.pacote), TAB.pacote ? { nome: TAB.pacote.nome, titulo: TAB.pacote.titulo, itens: TAB.pacote.itens } : {}); delete TAB.pacote.desconto; const ag = TAB.itens.find(x => x.id === 'agenda'); if (ag && +ag.tabela === 8500 && +ag.parceiro === 6500) { ag.tabela = 12500; ag.parceiro = 10000; } } } catch (e) {}
  }
  addEventListener('hashchange', rota);
  addEventListener('beforeunload', e => { if (!salvo) { e.preventDefault(); e.returnValue = ''; } });

  /* tema (o mesmo do painel) */
  try { const t = localStorage.getItem('fyw-painel-tema'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  $('#theme').addEventListener('click', () => { const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = t; try { localStorage.setItem('fyw-painel-tema', t); } catch (e) {} });

  rota();
})();
