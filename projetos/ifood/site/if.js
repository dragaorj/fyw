/* iFood — redesign conceitual (Fyw). Tudo aqui é demonstração: nada é enviado a lugar nenhum. */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- idiomas (mesma chave do portfólio: fio-lang) ---------- */
  var T = {
    en: { skip: 'Skip to content', deliverTo: 'Deliver to', nRest: 'Restaurants', nMarket: 'Grocery', nPartners: 'For you', kick: 'Open now near you', h1a: 'Got the', h1a2: 'munchies?', h1b: 'We bring', w1: 'lunch.', w2: 'groceries.', w3: 'meds.', w4: 'pet food.', searchLbl: 'Search', go: 'Search', ring: 'burger week • app only •', pTag: 'Today only', pEnds: 'ends in', pOff: 'on the combo', pKick: 'Burger Week · Brasa Burger', pDesc: 'Double burger, rustic fries and a 350 ml soda.', pAdd: 'Add to bag', pCopy: 'copy', liveT: 'Your order is out', s1: 'Confirmed', s2: 'Preparing', s3: 'On the way', s4: 'Delivered', catsT: 'What do you want now?', c1: 'Restaurants', c2: 'Grocery', c3: 'Pharmacy', c4: 'Pet', c5: 'Drinks', c6: 'Sweets', c7: 'Coffee', rollK: 'Can’t decide?', rollT: 'Let hunger choose.', rollP: 'One tap and the wheel picks today’s order.', rollB: 'Spin the wheel', fSalad: 'Salad', fIce: 'Ice cream', st1: 'Free delivery at selected stores', st2: 'Welcome coupon', st3: 'Groceries in minutes', st4: 'Pay in the app', nearT: 'Near you', nearN: 'Fictional stores, for the concept only', free: 'Free delivery', tBurger: 'Burgers', tJap: 'Japanese', tHealthy: 'Healthy', tSweets: 'Sweets', howK: 'From tap to door', howT: 'Three steps. Zero effort.', h1t: 'Choose', h1p: 'Restaurant, grocery, pharmacy or pet. All in one place.', h2t: 'Pay in the app', h2p: 'Card, Pix or meal voucher, without leaving the screen.', h3t: 'Track it', h3p: 'Follow the courier on the map until the doorbell rings.', vK: 'Way beyond food', vT: 'One app, the whole house.', vMk: 'Fresh produce in minutes', vPh: 'From painkillers to sunscreen', vPt: 'Food and treats, no heavy lifting', vDr: 'Ice cold, right on time', dK: 'Join us', dT: 'There’s an iFood for everyone.', d1k: 'For restaurants and stores', d1: 'Sell more with us', d2k: 'For couriers', d2: 'Set your own hours', d3k: 'Careers', d3: 'Work at iFood', d4k: 'For companies', d4: 'Benefits for your team', aT: 'Ordered, delivered. Even faster in the app.', aP: 'Updates at every step, saved payment and app-only coupons.', phS: 'Arrives in 8–12 min', disc: 'Concept redesign created by Fyw for its portfolio. This is not the official iFood website; brands and names belong to their owners. Stores, prices, ratings and times shown are fictional.', official: 'Go to the official iFood site', byFyw: 'Design by Fyw', tb1: 'Home', tb2: 'Search', tb3: 'Bag', tb4: 'Profile', bagT: 'Your bag', bagFrom: 'Ordering from', bagEmpty: 'Your bag is empty', bagEmptyP: 'How about the Combo Brasa, 30% off?', bagApply: 'Apply', bagSub: 'Subtotal', bagFee: 'Delivery', bagDisc: 'FOME10 coupon', bagGo: 'Place order', addrT: 'Where are you?', addrGps: 'Use my location', addrGpsS: 'Demo: does not access your location', addrHome: 'Home', addrWork: 'Work', addrMom: 'Mom’s place', close: 'Close', srRecent: 'Recent searches', srTop: 'Trending now',
      ph: ['Search pizza, sushi, pharmacy…', 'Try “açaí near me”', 'Groceries for tonight?'], phs: { bagCp: 'Coupon', addrPh: 'Search address and number', srPh: 'Dishes, stores or categories' },
      s: { added: 'Added to bag', copied: 'Coupon FOME10 copied', cpOk: 'Coupon applied: 10% off', cpBad: 'Invalid coupon. Try FOME10', free: 'Free', addr: 'Delivering to', gps: 'Demo: using a sample address', sent: 'Order placed! Follow it below', st: ['Order confirmed', 'Preparing your order', 'Your order is out', 'Delivered. Enjoy!'], none: 'Nothing found for', shop: 'Store', cat: 'Category', picked: 'Today’s pick:', and: ' and ' } },
    es: { skip: 'Ir al contenido', deliverTo: 'Entregar en', nRest: 'Restaurantes', nMarket: 'Súper', nPartners: 'Para ti', kick: 'Abierto ahora cerca de ti', h1a: '¿Te dio', h1a2: 'hambre?', h1b: 'Te llevamos', w1: 'el almuerzo.', w2: 'el súper.', w3: 'la farmacia.', w4: 'la comida pet.', searchLbl: 'Buscar', go: 'Buscar', ring: 'semana burger • solo en la app •', pTag: 'Solo hoy', pEnds: 'termina en', pOff: 'en el combo', pKick: 'Semana Burger · Brasa Burger', pDesc: 'Burger doble, papas rústicas y refresco 350 ml.', pAdd: 'Agregar', pCopy: 'copiar', liveT: 'Tu pedido salió', s1: 'Confirmado', s2: 'Preparando', s3: 'En camino', s4: 'Entregado', catsT: '¿Qué quieres ahora?', c1: 'Restaurantes', c2: 'Súper', c3: 'Farmacia', c4: 'Mascotas', c5: 'Bebidas', c6: 'Dulces', c7: 'Café', rollK: '¿Indeciso?', rollT: 'Deja que el hambre elija.', rollP: 'Un toque y la ruleta elige qué pedir hoy.', rollB: 'Girar la ruleta', fSalad: 'Ensalada', fIce: 'Helado', st1: 'Envío gratis en tiendas seleccionadas', st2: 'Cupón de bienvenida', st3: 'Súper en minutos', st4: 'Paga en la app', nearT: 'Cerca de ti', nearN: 'Tiendas ficticias, solo para el concepto', free: 'Envío gratis', tBurger: 'Hamburguesas', tJap: 'Japonesa', tHealthy: 'Saludable', tSweets: 'Dulces', howK: 'Del toque a la puerta', howT: 'Tres pasos. Cero esfuerzo.', h1t: 'Elige', h1p: 'Restaurante, súper, farmacia o mascotas. Todo en un lugar.', h2t: 'Paga en la app', h2p: 'Tarjeta, Pix o vale de comida, sin salir de la pantalla.', h3t: 'Síguelo', h3p: 'Mira al repartidor en el mapa hasta que suene el timbre.', vK: 'Mucho más que comida', vT: 'Una app, toda la casa.', vMk: 'Frutas y verduras en minutos', vPh: 'Del analgésico al protector solar', vPt: 'Comida y mimos sin cargar peso', vDr: 'Bien fría, a la hora del brindis', dK: 'Súmate', dT: 'Hay un iFood para cada uno.', d1k: 'Para restaurantes y tiendas', d1: 'Vende más con nosotros', d2k: 'Para repartidores', d2: 'Elige tus horarios', d3k: 'Empleo', d3: 'Trabaja en iFood', d4k: 'Para empresas', d4: 'Beneficios para tu equipo', aT: 'Pediste, llegó. En la app es aún más rápido.', aP: 'Avisos en cada etapa, pago guardado y cupones exclusivos.', phS: 'Llega en 8–12 min', disc: 'Rediseño conceptual creado por Fyw para su portafolio. No es el sitio oficial de iFood; marcas y nombres pertenecen a sus dueños. Tiendas, precios, notas y tiempos son ficticios.', official: 'Ir al sitio oficial de iFood', byFyw: 'Diseño por Fyw', tb1: 'Inicio', tb2: 'Buscar', tb3: 'Bolsa', tb4: 'Perfil', bagT: 'Tu bolsa', bagFrom: 'Pedido en', bagEmpty: 'Tu bolsa está vacía', bagEmptyP: '¿Qué tal el Combo Brasa con 30% off?', bagApply: 'Aplicar', bagSub: 'Subtotal', bagFee: 'Envío', bagDisc: 'Cupón FOME10', bagGo: 'Hacer pedido', addrT: '¿Dónde estás?', addrGps: 'Usar mi ubicación', addrGpsS: 'Demostración: no accede a tu ubicación', addrHome: 'Casa', addrWork: 'Trabajo', addrMom: 'Casa de mamá', close: 'Cerrar', srRecent: 'Búsquedas recientes', srTop: 'En tendencia',
      ph: ['Busca pizza, sushi, farmacia…', 'Prueba “açaí cerca”', '¿Súper para esta noche?'], phs: { bagCp: 'Cupón', addrPh: 'Buscar dirección y número', srPh: 'Platos, tiendas o categorías' },
      s: { added: 'Agregado a la bolsa', copied: 'Cupón FOME10 copiado', cpOk: 'Cupón aplicado: 10% off', cpBad: 'Cupón inválido. Prueba FOME10', free: 'Gratis', addr: 'Entregando en', gps: 'Demostración: usando una dirección de ejemplo', sent: '¡Pedido hecho! Síguelo abajo', st: ['Pedido confirmado', 'Preparando tu pedido', 'Tu pedido salió', 'Entregado. ¡Buen provecho!'], none: 'Nada encontrado para', shop: 'Tienda', cat: 'Categoría', picked: 'La elección de hoy:', and: ' y ' } }
  };
  var PT = {}; $$('[data-i]').forEach(function (el) { if (!PT[el.dataset.i]) PT[el.dataset.i] = el.textContent; });
  PT.ph = ['Buscar pizza, sushi, farmácia…', 'Experimente “açaí perto de mim”', 'Mercado para hoje à noite?'];
  PT.phs = {}; $$('[data-ph]').forEach(function (el) { PT.phs[el.dataset.ph] = el.placeholder; });
  PT.s = { added: 'Adicionado à sacola', copied: 'Cupom FOME10 copiado', cpOk: 'Cupom aplicado: 10% off', cpBad: 'Cupom inválido. Tente FOME10', free: 'Grátis', addr: 'Entregando em', gps: 'Demonstração: usando um endereço de exemplo', sent: 'Pedido feito! Acompanhe aqui embaixo', st: ['Pedido confirmado', 'Preparando seu pedido', 'Seu pedido saiu', 'Entregue. Bom apetite!'], none: 'Nada encontrado para', shop: 'Loja', cat: 'Categoria', picked: 'O pedido de hoje:', and: ' e ' };
  var lang = 'pt'; try { lang = localStorage.getItem('fio-lang') || 'pt'; } catch (e) {}
  if (!T[lang]) lang = 'pt';
  var D = function () { return lang === 'pt' ? PT : T[lang]; }, S = function (k) { return D().s[k]; };
  var phI = 0, phC = 0, phDel = false, trackStep = -1;
  var applyLang = function (l) {
    lang = T[l] ? l : 'pt'; var d = D();
    $$('[data-i]').forEach(function (el) { var v = d[el.dataset.i]; if (v) el.textContent = v; });
    $$('[data-ph]').forEach(function (el) { var v = d.phs[el.dataset.ph]; if (v) el.placeholder = v; });
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    $$('.lang button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.l === lang); });
    phI = 0; renderBag(); renderIdle(); if (trackStep >= 0) setTrack(trackStep);
  };
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { applyLang(b.dataset.l); try { localStorage.setItem('fio-lang', lang); } catch (e) {} }); });
  addEventListener('storage', function (e) { if (e.key === 'fio-lang') applyLang(e.newValue); });

  /* ---------- catálogo (fictício) ---------- */
  var money = function (v) { return 'R$ ' + v.toFixed(2).replace('.', ','); };
  var ITEMS = {
    combo: { n: 'Combo Brasa', shop: 'Brasa Burger', p: 29.9, img: 'burger', tags: 'hamburguer burger combo lanche brasa' },
    classic: { n: 'Brasa Clássico', shop: 'Brasa Burger', p: 32.9, img: 'burger2', tags: 'hamburguer burger lanche cheddar' },
    pizza: { n: 'Pizza Margherita', shop: 'Nonna Forno', p: 54.9, img: 'pizza', tags: 'pizza margherita italiana' },
    sushi: { n: 'Combinado Kai · 20 peças', shop: 'Sushi Kai', p: 69.9, img: 'sushi', tags: 'sushi japonesa japones combinado temaki' },
    bowl: { n: 'Bowl Verde', shop: 'Verde Bowl', p: 36.9, img: 'bowl', tags: 'bowl saudavel salada poke fit' },
    salad: { n: 'Salada Mediterrânea', shop: 'Verde Bowl', p: 31.9, img: 'salad', tags: 'salada saudavel fit vegetariana' },
    donut: { n: 'Donut de doce de leite', shop: 'Doce Vó', p: 12.9, img: 'donut', tags: 'doce donut sobremesa' },
    ice: { n: 'Casquinha dupla', shop: 'Doce Vó', p: 14.9, img: 'icecream', tags: 'sorvete doce sobremesa acai açaí gelado' },
    coffee: { n: 'Cappuccino', shop: 'Café da Esquina', p: 11.9, img: 'coffee', tags: 'cafe café cappuccino' }
  };
  var SHOPS = [{ n: 'Brasa Burger', k: 'classic' }, { n: 'Nonna Forno', k: 'pizza' }, { n: 'Sushi Kai', k: 'sushi' }, { n: 'Verde Bowl', k: 'bowl' }, { n: 'Doce Vó', k: 'donut' }];
  var CATS = [['c1', '#near', 'burger2'], ['c2', '#verts', 'market'], ['c3', '#verts', 'pharmacy'], ['c4', '#verts', 'pet'], ['c5', '#verts', 'drinks'], ['c6', '#near', 'donut'], ['c7', '#near', 'coffee']];

  /* ---------- avisos ---------- */
  var toastEl = $('.toast'), toastT = 0;
  var toast = function (msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200); };

  /* ---------- painéis (sacola, endereço, busca) ---------- */
  var scrim = $('.scrim'), openSheet = null, lastFocus = null;
  var close = function (fast) {
    var sh = openSheet; if (!sh) return; openSheet = null;
    sh.classList.remove('is-on'); scrim.classList.remove('is-on'); document.documentElement.classList.remove('is-locked');
    setTimeout(function () { if (!sh.classList.contains('is-on')) sh.hidden = true; if (!openSheet) scrim.hidden = true; }, fast ? 0 : 500);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };
  var open = function (id) {
    if (openSheet) close(true);
    var sh = $('#' + id); lastFocus = document.activeElement; openSheet = sh;
    sh.hidden = false; scrim.hidden = false; document.documentElement.classList.add('is-locked');
    requestAnimationFrame(function () { requestAnimationFrame(function () { sh.classList.add('is-on'); scrim.classList.add('is-on'); }); });
    var f = sh.querySelector('input') || sh.querySelector('button');
    setTimeout(function () { if (f && (fine || id === 'sh-search')) f.focus({ preventScroll: true }); }, 350);
  };
  scrim.addEventListener('click', function () { close(); });
  $$('.sh-x, .sr-x').forEach(function (b) { b.addEventListener('click', function () { close(); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  /* ---------- sacola ---------- */
  var bag = [{ k: 'classic', q: 1 }, { k: 'donut', q: 1 }], coupon = false, FEE = 6.99, FREE_FROM = 60;
  var bagBtn = $('.bag'), bagN = $('.bag i');
  var count = function () { return bag.reduce(function (s, x) { return s + x.q; }, 0); };
  var renderBag = function (newKey) {
    var list = $('.bag-list'), sub = 0; list.innerHTML = '';
    bag.forEach(function (x) {
      var it = ITEMS[x.k]; sub += it.p * x.q;
      var li = document.createElement('li'); if (x.k === newKey) li.className = 'is-new';
      li.innerHTML = '<img src="img/' + it.img + '.webp" alt="" width="58" height="58"><span><b>' + it.n + '</b><small>' + it.shop + ' · ' + money(it.p) + '</small></span><span class="qty"><button type="button" data-d="-1" aria-label="Menos">−</button><span>' + x.q + '</span><button type="button" data-d="1" aria-label="Mais">+</button></span>';
      li.querySelectorAll('.qty button').forEach(function (b) { b.addEventListener('click', function () { x.q += +b.dataset.d; if (x.q <= 0) bag.splice(bag.indexOf(x), 1); renderBag(); }); });
      list.appendChild(li);
    });
    var empty = !bag.length, shops = bag.map(function (x) { return ITEMS[x.k].shop; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    $('.bag-empty').hidden = !empty; $('.bag-from').hidden = empty; $('.bag-cp').hidden = empty;
    $('.bag-from b').textContent = shops.length > 2 ? shops.slice(0, 2).join(', ') + ' +' + (shops.length - 2) : shops.join(S('and'));
    var fee = sub >= FREE_FROM || !sub ? 0 : FEE, disc = coupon ? sub * .1 : 0, tot = sub + fee - disc;
    $('.v-sub').textContent = money(sub); var vf = $('.v-fee'); vf.textContent = fee ? money(fee) : S('free'); vf.classList.toggle('is-free', !fee);
    $('.v-disc-row').hidden = !coupon || empty; $('.v-disc').textContent = '− ' + money(disc);
    $('.v-tot').textContent = money(tot); $('.v-tot2').textContent = money(tot); $('.checkout').disabled = empty;
    var n = count(); bagN.textContent = n; bagN.hidden = !n;
  };
  var pop = function () { bagBtn.classList.remove('is-pop'); void bagBtn.offsetWidth; bagBtn.classList.add('is-pop'); };
  // a foto voa até a sacola
  var fly = function (fromEl, img) {
    if (reduce || !fromEl || !fromEl.getBoundingClientRect || !Element.prototype.animate) return pop();
    var r = fromEl.getBoundingClientRect(), t = bagBtn.getBoundingClientRect(), f = document.createElement('img');
    f.src = 'img/' + img + '.webp'; f.className = 'fly'; f.alt = ''; f.style.left = '0'; f.style.top = '0'; document.body.appendChild(f);
    var x0 = r.left + r.width / 2 - 23, y0 = r.top + r.height / 2 - 23, x1 = t.left + t.width / 2 - 23, y1 = t.top + t.height / 2 - 23;
    f.animate([{ transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1.4)' }, { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + (Math.min(y0, y1) - 120) + 'px) scale(1)', offset: .5 }, { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.3)', opacity: .4 }], { duration: 800, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }).onfinish = function () { f.remove(); pop(); };
  };
  var add = function (k, fromEl) {
    var x = bag.filter(function (y) { return y.k === k; })[0]; if (x) x.q++; else bag.push({ k: k, q: 1 });
    renderBag(k); fly(fromEl, ITEMS[k].img); toast(S('added') + ': ' + ITEMS[k].n);
  };
  bagBtn.addEventListener('click', function () { open('sh-bag'); });
  $('.tb-bag').addEventListener('click', function (e) { e.preventDefault(); open('sh-bag'); });
  var cpWrap = $('.bag-cp'), cpIn = $('.bag-cp input');
  var applyCp = function () {
    cpWrap.classList.remove('is-ok', 'is-bad'); void cpWrap.offsetWidth;
    if (cpIn.value.trim().toUpperCase() === 'FOME10') { coupon = true; cpWrap.classList.add('is-ok'); toast(S('cpOk')); } else { cpWrap.classList.add('is-bad'); toast(S('cpBad')); }
    renderBag();
  };
  $('.bag-cp button').addEventListener('click', applyCp);
  cpIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') applyCp(); });

  /* ---------- promoção do topo ---------- */
  var promoBtn = $('.add-promo');
  promoBtn.addEventListener('click', function () {
    add('combo', $('.promo-img')); promoBtn.classList.add('is-added');
    setTimeout(function () { promoBtn.classList.remove('is-added'); }, 1400);
  });
  $('.coupon').addEventListener('click', function () {
    var c = this; try { if (navigator.clipboard) navigator.clipboard.writeText('FOME10').catch(function () {}); } catch (e) {}
    cpIn.value = 'FOME10'; c.classList.add('is-copied'); toast(S('copied')); setTimeout(function () { c.classList.remove('is-copied'); }, 1600);
  });
  // contagem regressiva até a meia-noite
  var cd = $('.cd');
  var tickCd = function () { var n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); var s = Math.max(0, Math.floor((m - n) / 1000)); cd.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function (v) { return String(v).padStart(2, '0'); }).join(':'); };
  tickCd(); setInterval(tickCd, 1000);
  // inclinação e brilho do card ao passar o mouse
  var promo = $('.promo');
  if (fine && !reduce) {
    promo.addEventListener('pointermove', function (e) { var r = promo.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; promo.style.setProperty('--mx', x * 100 + '%'); promo.style.setProperty('--my', y * 100 + '%'); promo.style.transform = 'perspective(900px) rotateY(' + ((x - .5) * 8) + 'deg) rotateX(' + ((.5 - y) * 6) + 'deg)'; });
    promo.addEventListener('pointerleave', function () { promo.style.transform = ''; });
  }

  /* ---------- lojas: tocar adiciona o prato da casa ---------- */
  $$('.shops a').forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); add(SHOPS[i].k, a.querySelector('.sp')); }); });

  /* ---------- endereço ---------- */
  var addrB = $('.addr b');
  $('.addr').addEventListener('click', function () { open('sh-addr'); });
  var setAddr = function (txt, btn) { addrB.textContent = txt; $$('.addr-list button').forEach(function (b) { b.classList.toggle('is-on', b === btn); }); toast(S('addr') + ' ' + txt); setTimeout(close, 450); };
  $$('.addr-list button').forEach(function (b) { b.addEventListener('click', function () { setAddr(b.dataset.addr, b); }); });
  $('.addr-gps').addEventListener('click', function () { toast(S('gps')); setTimeout(function () { setAddr('Rua Augusta, 1200', $('.addr-list button')); }, 900); });
  $('.addr-in input').addEventListener('keydown', function (e) { var v = this.value.trim(); if (e.key === 'Enter' && v.length > 3) { setAddr(v, null); this.value = ''; } });

  /* ---------- busca ---------- */
  var q = $('#q'), q2 = $('#q2'), res = $('.sr-res'), idle = $('.sr-idle'), none = $('.sr-none');
  var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var hl = function (txt, term) { var i = norm(txt).indexOf(norm(term)); if (!term || i < 0) return esc(txt); return esc(txt.slice(0, i)) + '<mark>' + esc(txt.slice(i, i + term.length)) + '</mark>' + esc(txt.slice(i + term.length)); };
  var recent = ['Pizza', 'Sushi', 'Açaí', 'Café'];
  var renderIdle = function () {
    var ch = $('.sr-chips'); ch.innerHTML = '';
    recent.slice(0, 6).forEach(function (r) { var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button'; b.textContent = r; b.addEventListener('click', function () { q2.value = r; search(); }); li.appendChild(b); ch.appendChild(li); });
    var top = $('.sr-top'); top.innerHTML = '';
    ['combo', 'pizza', 'sushi', 'bowl', 'ice'].forEach(function (k) { var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button'; b.textContent = ITEMS[k].n; b.addEventListener('click', function () { q2.value = ITEMS[k].n; search(); }); li.appendChild(b); top.appendChild(li); });
  };
  var search = function () {
    var term = q2.value.trim(), t = norm(term); res.innerHTML = '';
    if (!t) { idle.hidden = false; res.hidden = true; none.hidden = true; return; }
    var out = [];
    Object.keys(ITEMS).forEach(function (k) { var it = ITEMS[k]; if (norm(it.n + ' ' + it.shop + ' ' + it.tags).indexOf(t) > -1) out.push({ type: 'item', k: k, title: it.n, sub: it.shop + ' · ' + money(it.p), img: it.img }); });
    SHOPS.forEach(function (s) { if (norm(s.n).indexOf(t) > -1) out.push({ type: 'go', href: '#near', title: s.n, sub: S('shop'), img: ITEMS[s.k].img }); });
    CATS.forEach(function (c) { var name = D()[c[0]] || PT[c[0]]; if (norm(name).indexOf(t) > -1) out.push({ type: 'go', href: c[1], title: name, sub: S('cat'), img: c[2] }); });
    idle.hidden = true; res.hidden = !out.length; none.hidden = !!out.length; none.textContent = S('none') + ' “' + term + '”';
    out.slice(0, 8).forEach(function (o) {
      var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<img src="img/' + o.img + '.webp" alt="" width="56" height="56"><span><b>' + hl(o.title, term) + '</b><small>' + esc(o.sub) + '</small></span><i class="plus' + (o.type === 'go' ? ' is-go' : '') + '" aria-hidden="true">' + (o.type === 'go' ? '→' : '+') + '</i>';
      b.addEventListener('click', function () {
        var nice = term.charAt(0).toUpperCase() + term.slice(1); if (recent.indexOf(nice) < 0) { recent.unshift(nice); renderIdle(); }
        if (o.type === 'item') add(o.k, b.querySelector('img'));
        else { close(); setTimeout(function () { var el = $(o.href); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }, 300); }
      });
      li.appendChild(b); res.appendChild(li);
    });
  };
  q2.addEventListener('input', search);
  var openSearch = function (v) { q2.value = v || ''; search(); open('sh-search'); };
  q.addEventListener('focus', function () { if (!fine) { q.blur(); openSearch(q.value); } });
  $('.search').addEventListener('submit', function (e) { e.preventDefault(); openSearch(q.value); });
  $$('.quick button').forEach(function (b) { b.addEventListener('click', function () { openSearch(b.dataset.q); }); });
  $('.tb-search').addEventListener('click', function (e) { e.preventDefault(); openSearch(''); });
  // dica digitada na busca do topo
  var typeTick = function () {
    if (document.activeElement === q || q.value) { q.placeholder = D().ph[0]; return setTimeout(typeTick, 1200); }
    var txt = D().ph[phI % D().ph.length];
    phC += phDel ? -1 : 1; q.placeholder = txt.slice(0, Math.max(0, phC));
    if (!phDel && phC >= txt.length) { phDel = true; return setTimeout(typeTick, 1800); }
    if (phDel && phC <= 0) { phDel = false; phI++; }
    setTimeout(typeTick, phDel ? 28 : 60);
  };
  if (!reduce) setTimeout(typeTick, 900);

  /* ---------- pedido: finalizar e acompanhar ---------- */
  var track = $('.track'), trackT = 0;
  var setTrack = function (i) {
    trackStep = i; $('.tr-t').textContent = S('st')[i];
    $$('.track .live-steps li').forEach(function (li, j) { li.className = j < i ? 'ok' : j === i ? 'on' : ''; });
    track.style.setProperty('--p', [.15, .4, .72, 1][i]); $('.track .mins').textContent = [25, 18, 9, 0][i];
    track.classList.toggle('is-done', i === 3);
  };
  $('.checkout').addEventListener('click', function () {
    if (!bag.length) return; close(); bag = []; coupon = false; cpIn.value = ''; cpWrap.classList.remove('is-ok'); renderBag();
    toast(S('sent')); clearTimeout(trackT); track.hidden = false; setTrack(0);
    requestAnimationFrame(function () { requestAnimationFrame(function () { track.classList.add('is-on'); }); });
    var go = function (i) { trackT = setTimeout(function () { setTrack(i); if (i < 3) go(i + 1); else trackT = setTimeout(function () { track.classList.remove('is-on'); setTimeout(function () { track.hidden = true; trackStep = -1; }, 600); }, 6000); }, 4000); };
    go(1);
  });

  /* ---------- palavra que troca no título ---------- */
  var sws = $$('.swap .sw'), si = 0;
  if (!reduce) setInterval(function () {
    var cur = sws[si]; si = (si + 1) % sws.length; var nx = sws[si];
    cur.classList.remove('is-on'); cur.classList.add('is-out'); nx.classList.remove('is-out'); nx.classList.add('is-on');
    setTimeout(function () { cur.classList.remove('is-out'); }, 700);
  }, 2400);

  /* ---------- roleta da fome ---------- */
  var win = $('.roll-win'), reel = $('.reel'), figs = $$('.reel figure'), spinning = false, at = 0;
  figs.concat(figs).forEach(function (f) { var c = f.cloneNode(true); c.setAttribute('aria-hidden', 'true'); reel.appendChild(c); });
  var setReel = function (y) { if (window.gsap) gsap.set(reel, { y: y }); else reel.style.transform = 'translateY(' + y + 'px)'; };
  $('.roll-go').addEventListener('click', function () {
    if (spinning) return; spinning = true; win.classList.remove('is-won');
    var h = win.clientHeight, total = figs.length, pick = Math.floor(Math.random() * total); if (pick === at) pick = (pick + 1) % total;
    var done = function () { at = pick; setReel(-pick * h); win.classList.add('is-won'); spinning = false; toast(S('picked') + ' ' + figs[pick].querySelector('figcaption').textContent); };
    if (reduce || !window.gsap) return done();
    gsap.fromTo(reel, { y: -at * h }, { y: -(total + pick) * h, duration: 2.2, ease: 'power4.out', onComplete: done });
  });
  addEventListener('resize', function () { if (!spinning) setReel(-at * win.clientHeight); });

  /* ---------- barra inferior: some ao descer, volta ao subir ---------- */
  var tab = $('.tabbar'), lastY = scrollY;
  addEventListener('scroll', function () { var y = scrollY; tab.classList.toggle('is-hide', y > lastY && y > 300); lastY = y; }, { passive: true });

  /* ---------- portas: foto que segue o mouse (computador) ---------- */
  var peek = $('.door-peek'), peekImg = peek && peek.querySelector('img');
  if (peek && fine) {
    var px = 0, py = 0, cx = 0, cy = 0, praf = 0;
    var follow = function () { cx += (px - cx) * .18; cy += (py - cy) * .18; peek.style.left = cx + 'px'; peek.style.top = cy + 'px'; praf = peek.classList.contains('is-on') ? requestAnimationFrame(follow) : 0; };
    $$('.door-list a').forEach(function (a) {
      a.addEventListener('pointerenter', function (e) { peekImg.src = a.querySelector('img').src; px = cx = e.clientX + 150; py = cy = e.clientY; peek.classList.add('is-on'); if (!praf) praf = requestAnimationFrame(follow); });
      a.addEventListener('pointermove', function (e) { px = e.clientX + 150; py = e.clientY; });
      a.addEventListener('pointerleave', function () { peek.classList.remove('is-on'); });
    });
  }

  /* ---------- rota do entregador ligando os três passos ---------- */
  var map = $('.how-map'), svg = $('.route'), rFg = $('.r-fg'), rBg = $('.r-bg'), rider = $('.rider'), L = 1, routeP = 0;
  var buildRoute = function () {
    var mr = map.getBoundingClientRect(), W = map.clientWidth, H = map.clientHeight;
    var pts = $$('.steps .n').map(function (n) { var r = n.getBoundingClientRect(); return { x: r.left + r.width / 2 - mr.left, y: r.top + r.height / 2 - mr.top }; });
    if (pts.length < 3 || !W) return;
    var d = 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], dy = b.y - a.y; d += ' C' + a.x.toFixed(1) + ' ' + (a.y + dy * .7).toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + (b.y - dy * .7).toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1); }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('preserveAspectRatio', 'none');
    rFg.setAttribute('d', d); rBg.setAttribute('d', d); L = rFg.getTotalLength() || 1; rFg.style.strokeDasharray = L;
  };
  var placeRider = function (p) { var pt = rFg.getPointAtLength(L * p); rider.style.transform = 'translate(' + pt.x.toFixed(1) + 'px,' + pt.y.toFixed(1) + 'px)'; rFg.style.strokeDashoffset = L * (1 - p); };
  buildRoute(); placeRider(0);
  addEventListener('resize', function () { buildRoute(); placeRider(routeP); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { buildRoute(); placeRider(routeP); });

  renderBag(); renderIdle();
  if (!window.gsap || reduce) { placeRider(1); applyLang(lang); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- entrada do topo ---------- */
  var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.kick', { y: 20, opacity: 0, duration: .7 })
    .from('.h1 .ln', { yPercent: 60, opacity: 0, rotate: 3, stagger: .1, duration: 1 }, '-=.45')
    .from('.h1-pic', { scale: 0, rotate: -30, duration: .9, ease: 'back.out(2)' }, '-=.7')
    .from('.search', { y: 30, opacity: 0, scale: .96, duration: .9 }, '-=.7')
    .from('.quick li', { y: 14, opacity: 0, stagger: .05, duration: .6 }, '-=.6')
    .from('.promo', { y: 80, opacity: 0, rotate: 4, duration: 1.2, clearProps: 'transform' }, '-=1')
    .from('.deck', { rotate: 0, y: 40, opacity: 0, stagger: .1, duration: 1, ease: 'back.out(1.4)' }, '-=.9')
    .from('.promo .ring', { scale: 0, rotate: -90, transformOrigin: '50% 50%', duration: .9, ease: 'back.out(2)' }, '-=.7');

  gsap.to('.hero-word', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- seções entrando ---------- */
  gsap.utils.toArray('.sec-h, .roll-card, .app-card').forEach(function (el) { gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }); });
  gsap.from('.cat-rail li', { y: 50, opacity: 0, rotate: 4, stagger: .06, duration: .9, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.cat-rail', start: 'top 90%' } });
  gsap.from('.shops li', { x: 60, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.shops', start: 'top 88%' } });
  gsap.from('.door-list li', { y: 30, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.door-list', start: 'top 88%' } });
  gsap.from('.phone', { y: 120, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.app-card', start: 'top 75%' } });
  gsap.to('.ph-dot', { attr: { cx: 120, cy: 50 }, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  // cards que empilham: o de trás encolhe um pouco quando o próximo chega
  gsap.utils.toArray('.verts .bx').forEach(function (bx, i, all) {
    if (i === all.length - 1) return;
    gsap.fromTo(bx, { scale: 1, filter: 'brightness(1)' }, { scale: .94, filter: 'brightness(.75)', ease: 'none', scrollTrigger: { trigger: all[i + 1], start: 'top 85%', end: 'top 20%', scrub: true } });
  });
  // rota com a rolagem
  ScrollTrigger.create({ trigger: map, start: 'top 70%', end: 'bottom 60%', scrub: .6, onUpdate: function (s) { routeP = s.progress; placeRider(routeP); }, onRefresh: function () { buildRoute(); placeRider(routeP); } });
  gsap.from('.steps li', { opacity: 0, y: 30, scale: .95, stagger: .25, duration: .8, ease: 'back.out(1.5)', scrollTrigger: { trigger: map, start: 'top 75%' } });

  applyLang(lang);
})();
