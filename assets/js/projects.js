/* =========================================================
   Projetos da Fyw — fonte única dos dados dos projetos.
   Edite aqui: "svc" diz em quais serviços o projeto aparece no painel (0 Branding, 1 UI/UX & Web, 2 Apps & Sistemas, 3 Design Systems, 4 Rebranding, 5 Packaging); o "tipo" aparece na etiqueta dos cards do hero
   (Branding, Website, App...). A ordem não importa; cada card
   aponta para o projeto pelo "slug" (nome da página em /projetos).
   ========================================================= */
window.FYW_PROJECTS = {
  'beta-online': { name: 'Beta Online', type: 'Design System', color: '#0F1115', title: 'Beta Online', sub: 'Design System · UI/UX & Web', svc: [3, 1], img: 'assets/img/projetos/beta-online/thumb.webp?v=3' },
  'jogo-pela-integridade': { name: 'SPFC', type: 'UI/UX & Web', color: '#DC1414', title: 'São Paulo FC', sub: 'Jogo pela Integridade', svc: [1], img: 'assets/img/projetos/jogo-pela-integridade/thumb.webp?v=c1' },
  'cimed':       { name: 'Cimed', type: 'UI/UX & Web', color: '#FFC600', ink: '#0B0B0B', title: 'Cimed', sub: 'UI/UX & Web', svc: [1], img: 'assets/img/projetos/cimed/thumb.webp?v=c2' },
  'let-me-be':   { hidden: true /* OCULTO let-me-be: tirar para mostrar de novo */, name: 'Let Me Be', type: 'Rebranding', color: '#008575', title: 'Let Me Be', sub: 'Rebranding · Cosméticos', svc: [4, 0], img: 'assets/img/projetos/let-me-be/thumb.webp' },
  'kyoto':       { name: 'Kyoto',         type: 'Branding', color: '#0178FF', title: 'Kyoto Rice', sub: 'Branding · UI/UX & Web', svc: [0, 1], img: 'assets/img/projetos/kyoto/thumb.webp?v=3' },
  'impacta-mais': { name: 'Impacta Mais', type: 'UI/UX & Web', color: '#F7621E', title: 'Impacta Mais', sub: 'UI/UX & Web · Apps & Sistemas', svc: [1, 2], img: 'assets/img/projetos/impacta-mais/thumb.webp' },
  'ifood':       { name: 'iFood', type: 'UI/UX & Web', color: '#EA1D2C', title: 'iFood', sub: 'Redesign conceitual', svc: [1], img: 'assets/img/projetos/ifood/thumb.webp?v=2' },
  'lumiere':     { name: 'Lumière', type: 'UI/UX & Web', color: '#1B4A82', title: 'Lumière Dentists', sub: 'UI/UX & Web', svc: [1], img: 'assets/img/projetos/lumiere/thumb.webp?v=2' },
  'latimpacto':  { name: 'Latimpacto', type: 'UI/UX & Web', color: '#985CCC', title: 'Latimpacto', sub: 'Impact Minds', svc: [1], img: 'assets/img/projetos/latimpacto/thumb.webp' },
  'pacto-global': { name: 'Pacto Global', type: 'UI/UX & Web', color: '#3D7B44', title: 'Pacto Global', sub: 'COP30 · UI/UX & Web', svc: [1], img: 'assets/img/projetos/pacto-global/thumb.webp' },
  'globalfy':    { name: 'Globalfy', type: 'UI/UX & Web', color: '#06B051', title: 'Globalfy', sub: 'Fintech · UI/UX & Web', svc: [1], img: 'assets/img/projetos/globalfy/thumb.webp?v=c2' },
  'super-mansao-maromba': { name: 'Super', type: 'Packaging', color: '#F705BC', title: 'Super + Mansão Maromba', sub: 'Packaging · Branding', svc: [5, 0], img: 'assets/img/projetos/super-mansao-maromba/thumb.webp?v=c1' },
  'bgold':       { name: 'BGold', type: 'UI/UX & Web', color: '#B89550', title: 'BGold Joalheria', sub: 'Joalheria · UI/UX & Web', svc: [1], img: 'assets/img/projetos/bgold/thumb.webp?v=c1' },
};
