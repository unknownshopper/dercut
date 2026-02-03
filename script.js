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

// Print buttons: any element with data-action="print"
(function(){
  document.addEventListener('click', function(e){
    var t = e.target;
    if(t && t.closest){
      var btn = t.closest('[data-action="print"]');
      if(btn){
        e.preventDefault();
        window.print();
      }
      var toggle = t.closest('[data-action="toggle-week-layout"]');
      if(toggle){
        e.preventDefault();
        var grid = document.querySelector('#view-week .week-grid');
        if(grid){
          var rows = grid.classList.toggle('rows');
          localStorage.setItem('weekLayoutRows', rows ? '1' : '0');
          toggle.textContent = rows ? 'Cambiar a columnas' : 'Cambiar a filas';
        }
      }
      var send = t.closest('[data-action="send-bitacora"]');
      if(send){
        e.preventDefault();
        if(send.hasAttribute('disabled')) return;
        // Guardar entrada de bitácora
        try {
          var today = new Date();
          var iso = today.toISOString();
          var tasks = Array.from(document.querySelectorAll('#view-daily .agenda .slot')).map(function(slot){
            var time = slot.querySelector('.time') ? slot.querySelector('.time').textContent.trim() : '';
            var label = slot.querySelector('label') ? slot.querySelector('label').innerText.trim() : slot.textContent.trim();
            return { time: time, label: label };
          });
          var entry = { date: iso, origin: 'chklst2', scope: 'diario', status: 'completo', tasks: tasks };
          var key = 'bitacoraEntries';
          var list = [];
          try { list = JSON.parse(localStorage.getItem(key) || '[]'); } catch(_) { list = []; }
          list.push(entry);
          localStorage.setItem(key, JSON.stringify(list));
          // marcar como enviado hoy
          var y = today.getFullYear();
          var m = String(today.getMonth()+1).padStart(2,'0');
          var d = String(today.getDate()).padStart(2,'0');
          localStorage.setItem('dailySent:'+ (y+'-'+m+'-'+d), '1');
          // bloquear reenvío y checks
          send.textContent = 'Enviado a bitácora';
          send.setAttribute('disabled','disabled');
          Array.from(document.querySelectorAll('#view-daily .agenda input[type="checkbox"]')).forEach(function(cb){ cb.disabled = true; });
          // agregar badge
          var h2 = document.querySelector('#view-daily h2');
          if(h2 && !h2.querySelector('.badge.success')){
            var b = document.createElement('span'); b.className = 'badge success'; b.style.marginLeft = '8px'; b.textContent = 'Enviado'; h2.appendChild(b);
          }
          alert('Bitácora: entrada registrada para hoy.');
        } catch(err){
          console.error('Bitácora error:', err);
          alert('No se pudo enviar a bitácora.');
        }
      }
    }
  });
})();

// Planner: default to daily, remember last view, and label tabs with dates
(function(){
  function monthNameES(idx){
    return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][idx];
  }
  function fmtRange(start, months){
    var sM = start.getMonth();
    var sY = start.getFullYear();
    var eM = (sM + months - 1) % 12;
    var eY = sY + Math.floor((sM + months - 1) / 12);
    return {
      start: monthNameES(sM) + ' ' + sY,
      end: monthNameES(eM) + ' ' + eY,
      short: monthNameES(sM).slice(0,3) + '–' + monthNameES(eM).slice(0,3) + ' ' + (sY===eY? sY : (sY + '–' + eY))
    };
  }

  function setTabLabel(selector, base, suffix){
    var a = document.querySelector(selector);
    if(!a) return;
    var dot = a.querySelector('.dot');
    var colorStyle = dot ? ' style="'+ (dot.getAttribute('style')||'') +'"' : '';
    a.innerHTML = '<span class="dot"'+colorStyle+'></span> ' + base + (suffix ? ' ('+suffix+')' : '');
  }

  function initTabs(){
    var tabs = document.querySelectorAll('.planner-tabs a[href^="#view-"]');
    if(!tabs.length) return;

    // Default/remember behavior
    var allowed = ['#view-daily','#view-week','#view-month','#view-q','#view-6m','#view-12m'];
    var hash = location.hash;
    if(allowed.indexOf(hash) === -1){
      var saved = localStorage.getItem('plannerView');
      if(saved && allowed.indexOf(saved) !== -1){ hash = saved; }
      else { hash = '#view-daily'; }
      if(location.hash !== hash){ location.hash = hash; }
    }

    document.addEventListener('click', function(ev){
      var a = ev.target.closest('.planner-tabs a[href^="#view-"]');
      if(!a) return;
      var h = a.getAttribute('href');
      localStorage.setItem('plannerView', h);
    });

    // Dynamic labels with dates (tabs + section headers)
    var now = new Date();
    setTabLabel('.planner-tabs a[href="#view-daily"]', 'Diario');
    setTabLabel('.planner-tabs a[href="#view-week"]', 'Semana');
    setTabLabel('.planner-tabs a[href="#view-month"]', 'Mes', monthNameES(now.getMonth()) + ' ' + now.getFullYear());
    var r3 = fmtRange(new Date(now.getFullYear(), now.getMonth(), 1), 3);
    var r6 = fmtRange(new Date(now.getFullYear(), now.getMonth(), 1), 6);
    var r12 = fmtRange(new Date(now.getFullYear(), now.getMonth(), 1), 12);
    setTabLabel('.planner-tabs a[href="#view-q"]', '3 meses', r3.short);
    setTabLabel('.planner-tabs a[href="#view-6m"]', '6 meses', r6.short);
    setTabLabel('.planner-tabs a[href="#view-12m"]', '12 meses', r12.short);

    function dayNameES(idx){
      return ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][idx];
    }
    function fmtDay(d){
      return dayNameES(d.getDay()) + ' ' + d.getDate() + ' ' + monthNameES(d.getMonth()).slice(0,3) + ' ' + d.getFullYear();
    }
    function startOfWeekMonday(d){
      var tmp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      var day = tmp.getDay(); // 0=Dom ... 6=Sáb
      var diff = (day === 0 ? -6 : 1 - day); // mover a lunes
      tmp.setDate(tmp.getDate() + diff);
      return tmp;
    }
    function addDays(d, n){ var x = new Date(d); x.setDate(x.getDate()+n); return x; }

    function setSectionDates(){
      var today = new Date();
      var daily = document.querySelector('#view-daily .date-label');
      if(daily) daily.textContent = '(' + fmtDay(today) + ')';

      var week = document.querySelector('#view-week .date-label');
      if(week){
        var mon = startOfWeekMonday(today);
        var sun = addDays(mon, 6);
        week.textContent = '(' + mon.getDate() + ' ' + monthNameES(mon.getMonth()).slice(0,3) + ' – ' + sun.getDate() + ' ' + monthNameES(sun.getMonth()).slice(0,3) + ' ' + sun.getFullYear() + ')';
      }

      var month = document.querySelector('#view-month .date-label');
      if(month) month.textContent = '(' + monthNameES(today.getMonth()) + ' ' + today.getFullYear() + ')';

      var q = document.querySelector('#view-q .date-label');
      if(q) q.textContent = '(' + r3.short + ')';
      var m6 = document.querySelector('#view-6m .date-label');
      if(m6) m6.textContent = '(' + r6.short + ')';
      var y12 = document.querySelector('#view-12m .date-label');
      if(y12) y12.textContent = '(' + r12.short + ')';
    }

    setSectionDates();
    window.addEventListener('hashchange', setSectionDates);

    // Restore weekly layout preference
    var grid = document.querySelector('#view-week .week-grid');
    var pref = localStorage.getItem('weekLayoutRows');
    if(grid && pref === '1'){
      grid.classList.add('rows');
      var btn = document.querySelector('[data-action="toggle-week-layout"]');
      if(btn) btn.textContent = 'Cambiar a columnas';
    }

    // Daily checklist persistence and button enable
    function ymd(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
    function dailyKey(){ return 'dailyChecks:' + ymd(new Date()); }
    var dailyChecks = Array.from(document.querySelectorAll('#view-daily .agenda input[type="checkbox"]'));
    var sendBtn = document.querySelector('#view-daily [data-action="send-bitacora"]');
    function loadDaily(){
      var raw = localStorage.getItem(dailyKey());
      if(!raw) return;
      try {
        var arr = JSON.parse(raw);
        dailyChecks.forEach(function(cb, i){ cb.checked = !!arr[i]; });
      } catch(_){ /* noop */ }
    }
    function saveDaily(){
      var arr = dailyChecks.map(function(cb){ return cb.checked ? 1 : 0; });
      localStorage.setItem(dailyKey(), JSON.stringify(arr));
    }
    function updateSend(){
      if(!sendBtn) return;
      var sent = localStorage.getItem('dailySent:'+ ymd(new Date())) === '1';
      var all = dailyChecks.length > 0 && dailyChecks.every(function(cb){ return cb.checked; });
      if(sent){
        sendBtn.textContent = 'Enviado a bitácora';
        sendBtn.setAttribute('disabled','disabled');
        dailyChecks.forEach(function(cb){ cb.disabled = true; });
      } else if(all){
        sendBtn.textContent = 'Enviar a bitácora';
        sendBtn.removeAttribute('disabled');
      } else {
        sendBtn.textContent = 'Enviar a bitácora';
        sendBtn.setAttribute('disabled','disabled');
      }
    }
    function markSentBadge(){
      var sent = localStorage.getItem('dailySent:'+ ymd(new Date())) === '1';
      if(!sent) return;
      var h2 = document.querySelector('#view-daily h2');
      if(h2 && !h2.querySelector('.badge.success')){
        var b = document.createElement('span'); b.className='badge success'; b.style.marginLeft='8px'; b.textContent='Enviado'; h2.appendChild(b);
      }
    }
    if(dailyChecks.length){
      loadDaily();
      updateSend();
      markSentBadge();
      dailyChecks.forEach(function(cb){
        cb.addEventListener('change', function(){ saveDaily(); updateSend(); });
      });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }
})();
