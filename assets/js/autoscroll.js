/* Fyw — Rolagem automática (menu › Acessibilidade)
   Interruptor liga/desliga (fica salvo e vale em todas as páginas até desligar) + velocidade ajustável.
   Rolagem contínua e suave: acelera devagar, desacelera no fim. Mexer o mouse não interrompe;
   se a pessoa rolar, ela espera um instante e continua a partir dali. */
(function () {
  'use strict';
  var pane = document.querySelector('.mm-a11y-pane');
  if (!pane || pane.querySelector('.as-row')) return;

  var T = {
    pt: { title: 'Rolagem automática', on: 'Ativada', off: 'Desativada', speed: 'Velocidade', slower: 'Mais devagar', faster: 'Mais rápido', hint: 'Fica ativa até você desligar, inclusive ao trocar de página' },
    en: { title: 'Auto scroll', on: 'On', off: 'Off', speed: 'Speed', slower: 'Slower', faster: 'Faster', hint: 'Stays on until you turn it off, even across pages' },
    es: { title: 'Desplazamiento automático', on: 'Activado', off: 'Desactivado', speed: 'Velocidad', slower: 'Más lento', faster: 'Más rápido', hint: 'Sigue activo hasta que lo desactives, incluso al cambiar de página' }
  };
  var SPEEDS = [14, 28, 45, 70, 105, 150, 210, 300, 420]; // px por segundo
  var store = {
    get: function (k, f) { try { var v = localStorage.getItem(k); return v === null ? f : v; } catch (e) { return f; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var level = Math.min(SPEEDS.length - 1, Math.max(0, parseInt(store.get('fio-autoscroll', '2'), 10) || 0));
  var enabled = store.get('fio-autoscroll-on', '0') === '1';
  var lang = function () { var l = (document.documentElement.lang || 'pt').slice(0, 2); return T[l] ? l : 'pt'; };

  /* interface (antes de "Restaurar padrão") */
  var row = document.createElement('div');
  row.className = 'as-row';
  row.innerHTML =
    '<div class="as-head"><span class="as-title" id="as-title"></span>' +
      '<button type="button" class="as-switch" role="switch" aria-checked="false" aria-labelledby="as-title"><span class="as-knob" aria-hidden="true"></span><span class="as-state"></span></button>' +
    '</div>' +
    '<div class="as-head"><span class="as-speed-label"></span>' +
      '<div class="a11y-stepper as-stepper"><button type="button" class="as-minus">−</button><output class="as-val" aria-live="polite"></output><button type="button" class="as-plus">+</button></div>' +
    '</div>' +
    '<p class="as-hint"></p>';
  pane.insertBefore(row, pane.querySelector('.a11y-reset') || null);
  var $ = function (s) { return row.querySelector(s); };

  function texts() {
    var t = T[lang()];
    $('.as-title').textContent = t.title;
    $('.as-state').textContent = enabled ? t.on : t.off;
    $('.as-speed-label').textContent = t.speed;
    $('.as-minus').setAttribute('aria-label', t.slower);
    $('.as-plus').setAttribute('aria-label', t.faster);
    $('.as-val').textContent = (level + 1) + ' / ' + SPEEDS.length;
    $('.as-hint').textContent = t.hint;
    var sw = $('.as-switch'); sw.setAttribute('aria-checked', String(enabled)); sw.classList.toggle('is-on', enabled);
  }

  /* motor */
  var raf = 0, last = 0, pos = 0, vel = 0, holdUntil = 0;
  var lenis = function () { return window.fywLenis || null; };
  var maxY = function () { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); };
  function setY(y) {
    var l = lenis();
    if (l) l.scrollTo(y, { immediate: true, force: true, lock: false });
    else window.scrollTo({ top: y, behavior: 'instant' });
  }
  function busy() { // tela de carregamento ou menu/painel aberto: espera
    return document.querySelector('.loader:not(.is-out)') || document.documentElement.classList.contains('sv-lock');
  }
  function step(t) {
    raf = requestAnimationFrame(step);
    var dt = last ? Math.min(50, t - last) : 16; last = t;
    if (!enabled) return;
    var now = performance.now();
    if (now < holdUntil || busy()) { pos = window.scrollY; vel = 0; return; }
    if (Math.abs(window.scrollY - pos) > 3) { pos = window.scrollY; vel = Math.min(vel, 20); } // a pessoa rolou: continua dali
    var target = SPEEDS[level], left = maxY() - pos;
    if (left < 300) target = Math.max(0, target * (left / 300)); // desacelera ao chegar no fim
    vel += (target - vel) * Math.min(1, dt / 900);                // acelera/ajusta com suavidade
    if (left <= 0.5) { vel = 0; return; }                          // fim da página: aguarda
    pos = Math.min(maxY(), pos + vel * dt / 1000);
    setY(pos);
  }
  function setEnabled(on) {
    enabled = on; store.set('fio-autoscroll-on', on ? '1' : '0');
    document.documentElement.classList.toggle('is-autoscroll', on);
    pos = window.scrollY; vel = 0; last = 0;
    var l = lenis(); if (l && on) l.start();
    texts();
    if (on) { // fecha o menu para a tela ficar limpa (bom para gravar)
      var open = document.querySelector('.menu-btn[aria-expanded="true"], .dock-menu[aria-expanded="true"]');
      if (open) open.click();
      holdUntil = performance.now() + 500;
    }
  }

  $('.as-switch').addEventListener('click', function (e) { e.stopPropagation(); setEnabled(!enabled); });
  $('.as-minus').addEventListener('click', function () { level = Math.max(0, level - 1); store.set('fio-autoscroll', level); texts(); });
  $('.as-plus').addEventListener('click', function () { level = Math.min(SPEEDS.length - 1, level + 1); store.set('fio-autoscroll', level); texts(); });

  // rolar com a roda/dedo/teclado: espera a pessoa terminar e continua a partir da nova posição
  var pauseBriefly = function () { holdUntil = performance.now() + 900; };
  addEventListener('wheel', pauseBriefly, { passive: true });
  addEventListener('touchmove', pauseBriefly, { passive: true });
  addEventListener('keydown', function (e) { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].indexOf(e.key) > -1) pauseBriefly(); });

  new MutationObserver(texts).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if (enabled) { document.documentElement.classList.add('is-autoscroll'); holdUntil = performance.now() + 1200; }
  texts();
  raf = requestAnimationFrame(step);
})();
