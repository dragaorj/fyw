/* Fyw — formulário de contato em pop-up. Todo CTA de contato do site abre este mesmo formulário.
   Envio: FormSubmit (https://formsubmit.co) → e-mail da Fyw. No primeiro envio o FormSubmit manda um e-mail
   de ativação para fyw.ggwp@gmail.com; depois de clicar em "Activate", os pedidos chegam direto. */
(function () {
  'use strict';
  var TO = 'fyw.ggwp@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO;
  /* Web3Forms (https://web3forms.com): cole aqui a Access Key que chega no e-mail fyw.ggwp@gmail.com. É pública, pode ficar no site. */
  var W3F_KEY = '2812137b-742f-4838-bb1d-89169e642624';
  var SEL = 'a.btn[href$="#contact"], a.lw-cta, a.zoom-cta, [data-form-link], a.btn[href^="mailto:fyw"], [data-open-form]';

  var T = {
    pt: { kicker: 'Vamos conversar', title: 'Conte sobre o seu projeto', sub: 'Entramos em contato em até 48 horas.',
      name: 'Nome', phone: 'WhatsApp', email: 'E-mail', need: 'Do que você precisa?', msg: 'Mensagem', msgPh: 'Conte mais sobre o seu projeto.',
      svc: ['Branding', 'UI/UX & Web', 'Apps & Sistemas', 'Design System', 'Outro'], send: 'Enviar', sending: 'Enviando…',
      okT: 'Recebemos sua mensagem!', okP: 'Obrigado pelo contato. Em até 48 horas você recebe a nossa resposta.', okB: 'Fechar',
      err: 'Não deu para enviar agora. Tente de novo ou escreva para ', req: 'Preencha nome, e-mail e mensagem.', close: 'Fechar', badEmail: 'Confira o e-mail.', badName: 'Digite seu nome e sobrenome.', badPhone: 'Digite um WhatsApp válido com DDD.', badMsg: 'Conte um pouco mais na mensagem (mínimo 15 caracteres).' },
    en: { kicker: "Let's talk", title: 'Tell us about your project', sub: 'We will get in touch within 48 hours.',
      name: 'Name', phone: 'Phone', email: 'E-mail', need: 'What do you need?', msg: 'Message', msgPh: 'Tell us more about your project.',
      svc: ['Branding', 'UI/UX & Web', 'Apps & Systems', 'Design System', 'Other'], send: 'Send', sending: 'Sending…',
      okT: 'Message received!', okP: 'Thanks for reaching out. You will hear from us within 48 hours.', okB: 'Close',
      err: 'Could not send right now. Try again or write to ', req: 'Please fill in name, e-mail and message.', close: 'Close', badEmail: 'Please check the e-mail.', badName: 'Please enter your first and last name.', badPhone: 'Please enter a valid phone number.', badMsg: 'Tell us a bit more in the message (at least 15 characters).' },
    es: { kicker: 'Hablemos', title: 'Cuéntanos sobre tu proyecto', sub: 'Te contactamos en hasta 48 horas.',
      name: 'Nombre', phone: 'WhatsApp', email: 'E-mail', need: '¿Qué necesitas?', msg: 'Mensaje', msgPh: 'Cuéntanos más sobre tu proyecto.',
      svc: ['Branding', 'UI/UX y Web', 'Apps y Sistemas', 'Design System', 'Otro'], send: 'Enviar', sending: 'Enviando…',
      okT: '¡Recibimos tu mensaje!', okP: 'Gracias por escribir. En hasta 48 horas recibirás nuestra respuesta.', okB: 'Cerrar',
      err: 'No se pudo enviar ahora. Inténtalo de nuevo o escribe a ', req: 'Completa nombre, e-mail y mensaje.', close: 'Cerrar', badEmail: 'Revisa el e-mail.', badName: 'Escribe tu nombre y apellido.', badPhone: 'Escribe un WhatsApp válido.', badMsg: 'Cuéntanos un poco más en el mensaje (mínimo 15 caracteres).' }
  };
  /* máscaras: WhatsApp só aceita números (formato BR (11) 98765-4321 em PT; internacional em EN/ES), nome só aceita letras */
  function maskPhone(v) {
    if (lang() !== 'pt') { var o = v.replace(/[^\d+\s()-]/g, '').replace(/(?!^)\+/g, ''); return o.slice(0, 20); }
    var d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function maskName(v) { return v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '').slice(0, 60); }
  function okName(v) { var p = v.trim().split(/\s+/).filter(function (w) { return w.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '').length >= 2; }); return p.length >= 2 && !/(.)\1{3,}/i.test(v); }
  function okPhone(v) { var n = v.replace(/\D/g, ''); if (lang() === 'pt') return /^[1-9]{2}9?\d{8}$/.test(n) && !/^(\d)\1+$/.test(n.slice(2)); return n.length >= 8 && n.length <= 15 && !/^(\d)\1+$/.test(n); }
  function okMsg(v) { var t = v.trim(); return t.length >= 15 && /[A-Za-zÀ-ÿ]{3,}/.test(t) && !/(.)\1{5,}/.test(t); }
  function lang() { var l = (document.documentElement.lang || 'pt').slice(0, 2); return T[l] ? l : 'pt'; }

  var css = '' +
    '.lf{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;padding:20px;visibility:hidden;opacity:0;transition:opacity .25s ease,visibility .25s}' +
    '.lf.is-open{visibility:visible;opacity:1}' +
    '.lf-bg{position:absolute;inset:0;background:rgba(11,11,11,.42);-webkit-backdrop-filter:blur(10px) saturate(1.2);backdrop-filter:blur(10px) saturate(1.2)}' +
    '.lf-box{position:relative;width:min(560px,100%);max-height:calc(100svh - 40px);overflow-y:auto;scrollbar-width:none;border-radius:28px;padding:clamp(24px,3.4vw,40px);' +
      'background:linear-gradient(160deg,rgba(255,255,255,.86),rgba(238,237,233,.78));-webkit-backdrop-filter:blur(24px) saturate(1.5);backdrop-filter:blur(24px) saturate(1.5);' +
      'border:1px solid rgba(255,255,255,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.8),0 40px 90px -40px rgba(0,0,0,.55);color:#0B0B0B;font-family:inherit;' +
      'transform:translateY(18px) scale(.98);transition:transform .45s cubic-bezier(.16,1,.3,1)}' +
    '.lf-box::-webkit-scrollbar{display:none}' +
    '.lf.is-open .lf-box{transform:none}' +
    '[data-theme="dark"] .lf-box{background:linear-gradient(160deg,rgba(28,28,26,.9),rgba(16,16,15,.86));border-color:rgba(255,255,255,.12);color:#EEEDE9;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 40px 90px -40px rgba(0,0,0,.9)}' +
    '.lf-x{position:absolute;top:16px;right:16px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(11,11,11,.14);background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;transition:background .25s,transform .4s cubic-bezier(.16,1,.3,1)}' +
    '.lf-x:hover{background:rgba(11,11,11,.06);transform:rotate(90deg)}[data-theme="dark"] .lf-x{border-color:rgba(255,255,255,.18)}' +
    '.lf-x svg{width:16px;height:16px}' +
    '.lf-k{display:inline-flex;align-items:center;gap:8px;font-size:.78rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;opacity:.7}' +
    '.lf-k i{width:8px;height:8px;border-radius:50%;background:var(--lf-acc,#FF6A2B);box-shadow:0 0 0 4px color-mix(in srgb,var(--lf-acc,#FF6A2B) 22%,transparent)}' +
    '.lf h2{font-size:clamp(1.6rem,3vw,2.2rem);line-height:1.05;letter-spacing:-.03em;font-weight:500;margin:12px 44px 8px 0}' +
    '.lf-sub{font-size:.95rem;opacity:.7;margin:0 0 22px}' +
    '.lf-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
    '.lf-f{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}' +
    '.lf-f label,.lf-need{font-size:.78rem;font-weight:600;opacity:.75}' +
    '.lf-f input,.lf-f textarea{font:inherit;font-size:1rem;color:inherit;background:rgba(255,255,255,.65);border:1px solid rgba(11,11,11,.14);border-radius:14px;padding:13px 15px;outline:none;transition:border-color .25s,box-shadow .25s,background .25s;width:100%;-webkit-appearance:none;appearance:none}' +
    '[data-theme="dark"] .lf-f input,[data-theme="dark"] .lf-f textarea{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.14)}' +
    '.lf-f input:focus,.lf-f textarea:focus,.lf-f input:focus-visible,.lf-f textarea:focus-visible{outline:none !important;border-color:var(--lf-acc,#FF6A2B) !important;box-shadow:0 0 0 4px color-mix(in srgb,var(--lf-acc,#FF6A2B) 22%,transparent)}' +
    '[data-theme="dark"] .lf-f input:focus,[data-theme="dark"] .lf-f textarea:focus{border-color:var(--lf-acc,#FF6A2B)}' +
    '.lf-f textarea{resize:none;min-height:110px;line-height:1.5}' +
    '.lf-f.is-bad input,.lf-f.is-bad textarea{border-color:#E5484D;box-shadow:0 0 0 4px rgba(229,72,77,.15)}' +
    '.lf-chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 14px}' +
    '.lf-chip{position:relative}.lf-chip input{position:absolute;opacity:0;pointer-events:none}' +
    '.lf-chip span{display:inline-flex;align-items:center;height:40px;padding:0 16px;border-radius:99px;border:1px solid rgba(11,11,11,.16);font-size:.9rem;cursor:pointer;white-space:nowrap;transition:background .25s,color .25s,border-color .25s,transform .25s}' +
    '[data-theme="dark"] .lf-chip span{border-color:rgba(255,255,255,.18)}' +
    '.lf-chip span:hover{transform:translateY(-1px)}' +
    '.lf-chip input:checked+span{background:var(--lf-acc,#FF6A2B);color:#fff;border-color:var(--lf-acc,#FF6A2B)}' +
    
    '.lf-chip input:focus-visible+span{box-shadow:0 0 0 3px color-mix(in srgb,var(--lf-acc,#FF6A2B) 35%,transparent)}' +
    '.lf .lf-send{width:100%;justify-content:space-between;margin-top:6px}' +
    '.lf-send[disabled]{pointer-events:none}.lf-send{position:relative;overflow:hidden;isolation:isolate}' +
    '.lf-bar{position:absolute;left:0;top:0;bottom:0;width:0;z-index:-1;border-radius:99px;pointer-events:none;opacity:0;overflow:hidden;background:linear-gradient(90deg,color-mix(in srgb,var(--lf-acc,#FF6A2B) 55%,#0B0B0B),var(--lf-acc,#FF6A2B));box-shadow:0 0 28px -2px var(--lf-acc,#FF6A2B)}' +
    '.lf-bar::before{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.38) 50%,transparent 70%);background-size:220% 100%;animation:lfShine 1.15s linear infinite}' +
    '@keyframes lfShine{from{background-position:120% 0}to{background-position:-100% 0}}@keyframes lfStripe{from{background-position:0 0}to{background-position:-28px 0}}' +
    '.lf-send.is-loading .lf-bar{opacity:1;width:86%;transition:width 2.6s cubic-bezier(.22,.8,.3,1),opacity .25s}' +
    '.lf-send.is-done .lf-bar{opacity:1;width:100%;transition:width .45s cubic-bezier(.16,1,.3,1)}' +
    '.lf-send .btn-arrow{position:relative}.lf-send .btn-arrow svg{transition:opacity .25s,transform .35s cubic-bezier(.16,1,.3,1)}' +
    '.lf-send .btn-arrow::before{content:"";position:absolute;inset:7px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;opacity:0;transform:scale(.4);transition:opacity .25s,transform .35s}' +
    '.lf-send.is-loading .btn-arrow svg{opacity:0;transform:scale(.4) rotate(-45deg)}.lf-send.is-loading .btn-arrow::before{opacity:1;transform:scale(1);animation:lfSpin .7s linear infinite}' +
    '.lf-send.is-done .btn-arrow::before{opacity:0;animation:none}.lf-send .lf-chk{position:absolute;inset:0;display:grid;place-items:center;opacity:0;transform:scale(.3);transition:opacity .3s,transform .45s cubic-bezier(.34,1.56,.64,1)}.lf-send.is-done .lf-chk{opacity:1;transform:scale(1)}' +
    '.lf-send .lf-chk svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}' +
    '@keyframes lfSpin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.lf-bar::before,.lf-send .btn-arrow::before{animation:none!important}}' +
    '.lf-msg{font-size:.85rem;margin-top:12px;min-height:1.2em;color:#C2373C}' +
    '.lf-ok{display:none;text-align:center;padding:30px 4px 6px}.lf.is-sent .lf-ok{display:block}.lf.is-sent form,.lf.is-sent .lf-head{display:none}' +
    '.lf-ok b{display:grid;place-items:center;width:64px;height:64px;margin:0 auto 18px;border-radius:50%;background:var(--lf-acc,#FF6A2B);color:#fff;box-shadow:0 14px 30px -10px var(--lf-acc,#FF6A2B)}' +
    '.lf-ok b svg{width:28px;height:28px}.lf-ok h2{margin:0 0 8px}.lf-ok p{opacity:.75;margin:0 auto 26px;max-width:32ch}' +
    '.lf.is-sent .lf-ok b{position:relative;animation:lfPop .7s cubic-bezier(.34,1.56,.64,1) both}.lf.is-sent .lf-ok b::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid var(--lf-acc,#FF6A2B);animation:lfRing 1.4s .25s ease-out both}' +
    '.lf.is-sent .lf-ok b path{stroke-dasharray:24;stroke-dashoffset:24;animation:lfDraw .5s .35s ease forwards}' +
    '.lf.is-sent .lf-ok h2,.lf.is-sent .lf-ok p,.lf.is-sent .lf-ok .btn{animation:lfUp .6s cubic-bezier(.16,1,.3,1) both}.lf.is-sent .lf-ok h2{animation-delay:.2s}.lf.is-sent .lf-ok p{animation-delay:.3s}.lf.is-sent .lf-ok .btn{animation-delay:.4s}' +
    '@keyframes lfPop{0%{transform:scale(0)}100%{transform:scale(1)}}@keyframes lfRing{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.9);opacity:0}}@keyframes lfDraw{to{stroke-dashoffset:0}}@keyframes lfUp{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){.lf.is-sent .lf-ok *,.lf.is-sent .lf-ok b::after{animation:none!important;stroke-dashoffset:0!important}}' +
    '.lf-hp{position:absolute;left:-9999px;opacity:0}' +
    'html.lf-lock,html.lf-lock body{overflow:hidden}' +
    '@media (max-width:600px){.lf{place-items:end center;padding:0}.lf-box{width:100%;border-radius:26px 26px 0 0;max-height:94svh;padding-bottom:calc(24px + env(safe-area-inset-bottom));transform:translateY(40px)}.lf-row{grid-template-columns:1fr;gap:0}}' +
    '@media (max-width:600px){.lf-box{padding:20px 18px calc(16px + env(safe-area-inset-bottom));overflow:visible;max-height:none}.lf-x{top:12px;right:12px;width:36px;height:36px}.lf h2{font-size:1.35rem;margin:6px 40px 4px 0}.lf-sub{font-size:.82rem;margin:0 0 12px;line-height:1.35}.lf-k{font-size:.68rem}.lf-row{grid-template-columns:1fr 1fr;gap:10px}.lf-f{gap:4px;margin-bottom:9px}.lf-f label,.lf-need{font-size:.72rem}.lf-f input,.lf-f textarea{padding:10px 12px;border-radius:12px;font-size:16px}.lf-f textarea{min-height:68px;height:68px}.lf-chips{gap:6px;margin:5px 0 9px}.lf-chip span{height:32px;padding:0 12px;font-size:.8rem}.lf-send{height:50px;margin-top:2px}.lf-send i{width:36px;height:36px}.lf-msg{margin-top:6px;font-size:.78rem;min-height:0}}' +
    '@media (prefers-reduced-motion:reduce){.lf,.lf-box{transition:none}}';

  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var root, box, form, lastFocus = null, lockY = 0, rLang = '', DK = 'fyw-lead-draft';
  function saveDraft() { if (!form) return; var d = { n: form.nome.value, p: form.telefone.value, e: form.email.value, m: form.mensagem.value, s: Array.prototype.slice.call(form.querySelectorAll('input[name="servico"]:checked')).map(function (i) { return i.value; }) }; try { sessionStorage.setItem(DK, JSON.stringify(d)); } catch (x) {} }
  function loadDraft() { var d; try { d = JSON.parse(sessionStorage.getItem(DK) || 'null'); } catch (x) {} if (!d || !form) return; form.nome.value = d.n || ''; form.telefone.value = d.p || ''; form.email.value = d.e || ''; form.mensagem.value = d.m || ''; form.querySelectorAll('input[name="servico"]').forEach(function (i) { i.checked = (d.s || []).indexOf(i.value) > -1; }); }
  function clearDraft() { try { sessionStorage.removeItem(DK); } catch (x) {} }

  function build() {
    if (root) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    root = document.createElement('div'); root.className = 'lf'; root.setAttribute('aria-hidden', 'true');
    document.body.appendChild(root);
  }
  function render() {
    var t = T[lang()];
    root.innerHTML = '<div class="lf-bg" data-lf-close></div>' +
      '<div class="lf-box" data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="lf-title">' +
        '<button type="button" class="lf-x" data-lf-close aria-label="' + t.close + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
        '<div class="lf-head"><span class="lf-k"><i></i>' + t.kicker + '</span><h2 id="lf-title">' + t.title + '</h2><p class="lf-sub">' + t.sub + '</p></div>' +
        '<form novalidate>' +
          '<input class="lf-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<div class="lf-row"><div class="lf-f"><label for="lf-n">' + t.name + '</label><input id="lf-n" name="nome" autocomplete="name" maxlength="60" required></div>' +
          '<div class="lf-f"><label for="lf-p">' + t.phone + '</label><input id="lf-p" name="telefone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" placeholder="' + (lang() === 'pt' ? '(11) 98765-4321' : '+1 555 123 4567') + '" required></div></div>' +
          '<div class="lf-f"><label for="lf-e">' + t.email + '</label><input id="lf-e" name="email" type="email" autocomplete="email" required></div>' +
          '<span class="lf-need">' + t.need + '</span><div class="lf-chips" role="group" aria-label="' + t.need + '">' +
            t.svc.map(function (s, i) { return '<label class="lf-chip"><input type="checkbox" name="servico" value="' + T.pt.svc[i] + '"><span>' + s + '</span></label>'; }).join('') +
          '</div>' +
          '<div class="lf-f"><label for="lf-m">' + t.msg + '</label><textarea id="lf-m" name="mensagem" placeholder="' + t.msgPh + '" maxlength="2000"></textarea></div>' +
          '<button class="btn btn-ink lf-send" type=\"submit\"><span class="btn-roll"><span>' + t.send + '</span><span aria-hidden="true">' + t.send + '</span></span><i class="btn-arrow"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg></i></button>' +
          '<p class="lf-msg" role="alert"></p>' +
        '</form>' +
        '<div class="lf-ok" role="status"><b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></b><h2>' + t.okT + '</h2><p>' + t.okP + '</p><button type="button" class="btn btn-ink lf-send" data-lf-close><span class="btn-roll"><span>' + t.okB + '</span><span aria-hidden="true">' + t.okB + '</span></span><i class="btn-arrow"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg></i></button></div>' +
      '</div>';
    box = root.querySelector('.lf-box'); form = root.querySelector('form');
    root.querySelectorAll('[data-lf-close]').forEach(function (b) { b.addEventListener('click', close); });
    form.addEventListener('submit', submit);
    form.querySelectorAll('input,textarea').forEach(function (el) { el.addEventListener('input', function () { el.parentNode.classList.remove('is-bad'); saveDraft(); }); el.addEventListener('change', saveDraft); });
    form.nome.addEventListener('input', function () { var v = maskName(this.value); if (v !== this.value) this.value = v; });
    form.telefone.addEventListener('input', function () { var v = maskPhone(this.value); if (v !== this.value) { this.value = v; this.setSelectionRange(v.length, v.length); } });
    form.nome.addEventListener('blur', function () { this.value = this.value.trim().replace(/\s+/g, ' ').replace(/(^|\s)(\S)/g, function (m, a, b) { return a + b.toUpperCase(); }); saveDraft(); });
    rLang = lang(); loadDraft();
  }
  function open(e) {
    if (e) e.preventDefault();
    build(); if (!form || rLang !== lang() || root.classList.contains('is-sent')) render();
    lastFocus = document.activeElement;
    root.classList.remove('is-sent');
    var acc = document.querySelector('.btn-arrow'); if (acc) { var cc = getComputedStyle(acc).backgroundColor; if (cc && cc !== 'rgba(0, 0, 0, 0)') root.style.setProperty('--lf-acc', cc); }
    root.classList.add('is-open'); root.setAttribute('aria-hidden', 'false');
    lockY = scrollY; var b = document.body.style; b.position = 'fixed'; b.top = -lockY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%'; document.documentElement.classList.add('lf-lock');
    if (window.__lenis && window.__lenis.stop) window.__lenis.stop();
    setTimeout(function () { var f = root.querySelector('#lf-n'); if (f && matchMedia('(pointer:fine)').matches) f.focus({ preventScroll: true }); }, 60);
  }
  function close() {
    if (!root) return;
    root.classList.remove('is-open'); root.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('lf-lock'); var b = document.body.style; b.position = b.top = b.left = b.right = b.width = ''; window.scrollTo(0, lockY);
    if (window.__lenis && window.__lenis.start) window.__lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function submit(e) {
    e.preventDefault();
    var t = T[lang()], msg = form.querySelector('.lf-msg'), bad = false;
    var n = form.nome.value.trim(), m = form.email.value.trim(), x = form.mensagem.value.trim(), p = form.telefone.value.trim();
    var first = '';
    [['nome', !okName(n), t.badName], ['telefone', !okPhone(p), t.badPhone], ['email', !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(m), t.badEmail]].forEach(function (c) { if (c[1]) { form[c[0]].parentNode.classList.add('is-bad'); if (!bad) { first = c[2]; form[c[0]].focus({ preventScroll: true }); } bad = true; } });
    if (bad) { msg.textContent = first; return; }
    if (form._honey.value) return;
    var svc = Array.prototype.slice.call(form.querySelectorAll('input[name="servico"]:checked')).map(function (i) { return i.value; }).join(', ') || '—';
    var btn = form.querySelector('.lf-send'), lbls = btn.querySelectorAll('.btn-roll > span'), orig = lbls[0].textContent; var setL = function (s) { lbls.forEach(function (x) { x.textContent = s; }); };
    btn.disabled = true; setL(t.sending); msg.textContent = '';
    var bar = btn.querySelector('.lf-bar'); if (!bar) { bar = document.createElement('span'); bar.className = 'lf-bar'; bar.setAttribute('aria-hidden', 'true'); btn.insertBefore(bar, btn.firstChild); }
    var ar = btn.querySelector('.btn-arrow'); if (ar) { btn.style.setProperty('--lf-acc', getComputedStyle(ar).backgroundColor); if (!ar.querySelector('.lf-chk')) { var ck = document.createElement('span'); ck.className = 'lf-chk'; ck.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'; ar.appendChild(ck); } }
    btn.classList.remove('is-done'); void bar.offsetWidth; btn.classList.add('is-loading'); var t0 = Date.now();
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var tf = function (u, o, ms) { var c = window.AbortController ? new AbortController() : null; if (c) { o.signal = c.signal; setTimeout(function () { c.abort(); }, ms); } return fetch(u, o); };
    var okJson = function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !(j.success === true || j.success === 'true')) throw new Error(j.message || 'erro'); }); };
    // 1º: e-mail no visual do site (/api/contact, Resend). Se não estiver configurado, cai no FormSubmit.
    var svcList = svc === '—' ? [] : svc.split(', ');
    tf('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: n, whatsapp: p, email: m, services: svcList, message: x, page: location.href, lang: lang(), _honey: form._honey.value }) }, 10000)
    .then(okJson)
    .catch(function () { if (!W3F_KEY) throw 0; return tf('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: W3F_KEY, subject: 'Novo contato do site da Fyw — ' + n + (svc !== '—' ? ' (' + svc + ')' : ''), from_name: 'Site Fyw', replyto: m, botcheck: form._honey.value,
        'Nome': n, 'WhatsApp': p, 'Abrir conversa no WhatsApp': 'https://wa.me/' + (lang() === 'pt' ? '55' : '') + p.replace(/\D/g, ''), 'E-mail': m, 'Do que precisa': svc, 'Mensagem': x || '—',
        'Enviado em': new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' }), 'Página de origem': location.href }) }, 12000).then(okJson); })
    .catch(function () { return tf(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: 'Novo contato do site da Fyw — ' + n + (svc !== '—' ? ' (' + svc + ')' : ''), _template: 'table', _captcha: 'false', _replyto: m,
        'Nome': n, 'WhatsApp': p, 'Abrir conversa no WhatsApp': 'https://wa.me/' + (lang() === 'pt' ? '55' : '') + p.replace(/\D/g, ''),
        'E-mail': m, 'Do que precisa': svc, 'Mensagem': x || '—',
        'Enviado em': new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' }),
        'Idioma do site': ({ pt: 'Português', en: 'Inglês', es: 'Espanhol' })[lang()], 'Página de origem': location.href })
    }, 15000).then(okJson); })
      // a barra enche até o fim (mínimo ~1,2 s para ser vista) e só então aparece a mensagem de sucesso
      .then(function () { return wait(Math.max(0, 1200 - (Date.now() - t0))); })
      .then(function () { btn.classList.add('is-done'); return wait(480); })
      .then(function () { form.reset(); clearDraft(); root.classList.add('is-sent'); box.setAttribute('tabindex', '-1'); box.focus({ preventScroll: true }); })
      .catch(function () { msg.innerHTML = t.err + '<a href="mailto:' + TO + '">' + TO + '</a>.'; })
      .then(function () { btn.disabled = false; setL(orig); btn.classList.remove('is-loading', 'is-done'); });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest(SEL);
    if (!a || e.metaKey || e.ctrlKey) return;
    e.stopPropagation(); e.stopImmediatePropagation();
    open(e);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (!root || !root.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      var f = Array.prototype.slice.call(box.querySelectorAll('button,input:not(.lf-hp),textarea,a')).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return; var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.fywOpenForm = open;
})();
