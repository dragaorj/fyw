/* Área de membros (demonstração): valida os campos e simula a entrada. Nada é enviado nem guardado. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  // botões: a luz branca segue o mouse
  document.addEventListener('pointermove', function (e) { var b = e.target.closest && e.target.closest('.btn, .mb-go'); if (!b) return; var r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true });

  var form = $('.mb-card'), email = $('[name="email"]', form), senha = $('[name="senha"]', form), go = $('.mb-go', form), msg = $('.mb-msg', form);

  // mostrar / esconder a senha
  var eye = $('.mb-eye', form);
  eye.addEventListener('click', function () {
    var show = senha.type === 'password';
    senha.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show)); eye.setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha');
    senha.focus();
  });

  // lembrar de mim
  var chk = $('.mb-chk', form);
  chk.addEventListener('click', function () { chk.setAttribute('aria-checked', String(chk.getAttribute('aria-checked') !== 'true')); });

  function say(t, ok) { msg.textContent = t; msg.classList.toggle('is-ok', !!ok); msg.hidden = false; }
  function bad(input, on) {
    var f = input.closest('.mb-f'), err = $('.mb-err', f);
    f.classList.remove('is-bad'); if (on) { void f.offsetWidth; f.classList.add('is-bad'); }
    err.hidden = !on; input.setAttribute('aria-invalid', String(on));
  }
  [email, senha].forEach(function (i) { i.addEventListener('input', function () { bad(i, false); msg.hidden = true; }); });

  // esqueci minha senha
  $('.mb-forgot', form).addEventListener('click', function () {
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!ok) { bad(email, true); email.focus(); say('Digite o seu e-mail acima para receber o link de redefinição.'); return; }
    say('Pronto! Se este e-mail estiver cadastrado, o link para criar uma nova senha chega em alguns minutos.', true);
  });

  // entrar
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), okPass = senha.value.length > 0;
    bad(email, !okMail); bad(senha, !okPass);
    if (!okMail) { email.focus(); return; }
    if (!okPass) { senha.focus(); return; }
    msg.hidden = true; go.classList.add('is-load'); $('span', go).textContent = 'Entrando';
    setTimeout(function () {
      go.classList.remove('is-load'); $('span', go).textContent = 'Entrar';
      senha.value = '';
      say('Este é um ambiente de demonstração do site: nenhum dado foi enviado ou guardado.');
    }, 1300);
  });
})();
