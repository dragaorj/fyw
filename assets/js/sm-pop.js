/* "Máquina de vendas": clicar num aviso abre um mini pop-up com o que chegou (pedido de orçamento, recibo Pix, mensagem) */
(function () {
  'use strict';
  var sm = document.querySelector('.sm'); if (!sm) return;
  var toasts = sm.querySelectorAll('.sm-t'); if (!toasts.length) return;
  var L = function () { var l = (document.documentElement.lang || 'pt').slice(0, 2); return l === 'en' || l === 'es' ? l : 'pt'; };
  var C = {
    pt: [
      { h: 'Pedido de orçamento', b: '<dl><dt>Nome</dt><dd>Camila Rocha</dd><dt>Serviço</dt><dd>Site institucional</dd><dt>Prazo</dt><dd>Até 30 dias</dd></dl><p class="smp-q">“Quero um site novo que traga mais clientes pelo Google.”</p>', f: 'Responder agora' },
      { h: 'Pix recebido', b: '<div class="smp-pix"><span>Valor</span><b>R$ 2.480,00</b></div><dl><dt>De</dt><dd>Rafael M. Souza</dd><dt>Pagamento</dt><dd>Pix · aprovado</dd><dt>Data</dt><dd>Hoje, 14:32</dd><dt>ID</dt><dd>E1823…7F4A</dd></dl>', f: 'Ver comprovante' },
      { h: 'WhatsApp', b: '<div class="smp-chat"><p class="in">Oi! Vi o site de vocês 👋</p><p class="in">Preciso de um orçamento para a minha loja. Vocês atendem esta semana?</p><p class="out">Olá! Atendemos sim. Já te mando os detalhes 😊</p></div>', f: 'Abrir conversa' }
    ],
    en: [
      { h: 'Quote request', b: '<dl><dt>Name</dt><dd>Camila Rocha</dd><dt>Service</dt><dd>Company website</dd><dt>Timeline</dt><dd>Within 30 days</dd></dl><p class="smp-q">“I want a new website that brings more clients from Google.”</p>', f: 'Reply now' },
      { h: 'Payment received', b: '<div class="smp-pix"><span>Amount</span><b>$ 480.00</b></div><dl><dt>From</dt><dd>Rafael M. Souza</dd><dt>Payment</dt><dd>Instant · approved</dd><dt>Date</dt><dd>Today, 2:32 PM</dd><dt>ID</dt><dd>E1823…7F4A</dd></dl>', f: 'View receipt' },
      { h: 'WhatsApp', b: '<div class="smp-chat"><p class="in">Hi! I saw your website 👋</p><p class="in">I need a quote for my store. Are you available this week?</p><p class="out">Hello! Yes, we are. Sending the details now 😊</p></div>', f: 'Open chat' }
    ],
    es: [
      { h: 'Pedido de presupuesto', b: '<dl><dt>Nombre</dt><dd>Camila Rocha</dd><dt>Servicio</dt><dd>Sitio institucional</dd><dt>Plazo</dt><dd>Hasta 30 días</dd></dl><p class="smp-q">“Quiero un sitio nuevo que traiga más clientes desde Google.”</p>', f: 'Responder ahora' },
      { h: 'Pago recibido', b: '<div class="smp-pix"><span>Monto</span><b>R$ 2.480,00</b></div><dl><dt>De</dt><dd>Rafael M. Souza</dd><dt>Pago</dt><dd>Pix · aprobado</dd><dt>Fecha</dt><dd>Hoy, 14:32</dd><dt>ID</dt><dd>E1823…7F4A</dd></dl>', f: 'Ver comprobante' },
      { h: 'WhatsApp', b: '<div class="smp-chat"><p class="in">¡Hola! Vi su sitio 👋</p><p class="in">Necesito un presupuesto para mi tienda. ¿Atienden esta semana?</p><p class="out">¡Hola! Sí, claro. Ya te envío los detalles 😊</p></div>', f: 'Abrir chat' }
    ]
  };
  var pop = document.createElement('div'); pop.className = 'smp'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-hidden', 'true');
  sm.appendChild(pop);
  var cur = -1;
  function show(i) {
    if (cur === i) return hide();
    cur = i; var d = C[L()][i], t = toasts[i];
    pop.className = 'smp is-' + (i + 1);
    pop.innerHTML = '<div class="smp-h"><span class="smp-ico">' + t.querySelector('.sm-ti').innerHTML + '</span><b>' + d.h + '</b><button type="button" class="smp-x" aria-label="Fechar">×</button></div>' + d.b + '<span class="smp-f">' + d.f + ' <i>→</i></span>';
    var sr = sm.getBoundingClientRect(), tr = t.getBoundingClientRect();
    pop.style.top = Math.max(0, tr.top - sr.top - 6) + 'px';
    pop.style.right = (sr.right - tr.left + 14) + 'px';
    pop.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { pop.classList.add('is-on'); });
    toasts.forEach(function (x, k) { x.classList.toggle('is-active', k === i); x.setAttribute('aria-expanded', k === i); });
    pop.querySelector('.smp-x').addEventListener('click', function (e) { e.stopPropagation(); hide(); });
  }
  function hide() { cur = -1; pop.classList.remove('is-on'); pop.setAttribute('aria-hidden', 'true'); toasts.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-expanded', 'false'); }); }
  toasts.forEach(function (t, i) {
    t.setAttribute('role', 'button'); t.setAttribute('tabindex', '0'); t.setAttribute('aria-expanded', 'false');
    t.addEventListener('click', function (e) { e.stopPropagation(); show(i); });
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
  });
  sm.querySelector('.sm-toasts').removeAttribute('aria-hidden');
  document.addEventListener('click', function (e) { if (cur > -1 && !pop.contains(e.target)) hide(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  addEventListener('scroll', function () { if (cur > -1 && matchMedia('(max-width: 599px)').matches) hide(); }, { passive: true });
})();
