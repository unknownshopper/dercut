// Navbar hamburger toggle
(function(){
  var nav = document.getElementById('topnav');
  var btn = document.getElementById('navToggle');
  if(btn && nav){ btn.addEventListener('click', function(){ nav.classList.toggle('open'); }); }
})();

// Simple login form handling (demo)
(function(){
  var form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var email = form.elements['email'].value.trim();
    var pwd = form.elements['password'].value;
    if(!email || !pwd){
      alert('Por favor ingresa tus credenciales.');
      return;
    }
    // Demo: redirigir o mostrar mensaje
    alert('Bienvenido, ' + email + '. (Demo de login)');
    // window.location.href = 'estructura.html';
  });

  var forgot = document.getElementById('forgotLink');
  if(forgot){
    forgot.addEventListener('click', function(ev){
      ev.preventDefault();
      alert('Por favor contacta al administrador para restablecer tu contraseña.');
    });
  }
})();
