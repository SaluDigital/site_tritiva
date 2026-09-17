document.addEventListener('DOMContentLoaded', function(){
  var loadAnalytics = function(){
    if(window.tritivaAnalyticsLoaded) return;
    window.tritivaAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-XYXWYSZM5Y');

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XYXWYSZM5Y';
    document.head.appendChild(script);
  };

  window.addEventListener('load', function(){
    if('requestIdleCallback' in window){
      window.requestIdleCallback(loadAnalytics, {timeout: 2500});
    } else {
      window.setTimeout(loadAnalytics, 1500);
    }
  });

  var header = document.querySelector('.site-header');
  if(header){
    window.addEventListener('scroll', function(){
      header.classList.toggle('scrolled', window.scrollY > 8);
    }, {passive: true});
  }
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }

  // Value cards (A Tritiva page) expand on click
  document.querySelectorAll('.value-card').forEach(function(card){
    card.addEventListener('click', function(){ card.classList.toggle('open'); });
    card.addEventListener('keypress', function(e){
      if(e.key === 'Enter' || e.key === ' '){ card.classList.toggle('open'); }
    });
  });

  // Contact form validation
  var form = document.querySelector('#contact-form');
  if(form){
    var phoneField = form.querySelector('#telefone');
    if(phoneField){
      phoneField.addEventListener('input', function(){
        var digits = phoneField.value.replace(/\D/g, '').slice(0, 11);
        if(digits.length > 10){
          phoneField.value = digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
        } else if(digits.length > 6){
          phoneField.value = digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
        } else if(digits.length > 2){
          phoneField.value = digits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else {
          phoneField.value = digits.replace(/(\d{0,2})/, '($1').replace(/\($/, '');
        }
      });
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function(field){
        var err = field.parentElement.querySelector('.error-msg');
        var ok = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
        field.classList.toggle('invalid', !ok);
        if(err) err.classList.toggle('show', !ok);
        if(!ok) valid = false;
      });
      var emailField = form.querySelector('#email');
      if(emailField && emailField.value.trim() !== ''){
        var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim());
        emailField.classList.toggle('invalid', !okEmail);
        var emailErr = emailField.parentElement.querySelector('.error-msg');
        if(emailErr) emailErr.classList.toggle('show', !okEmail);
        if(!okEmail) valid = false;
      }
      var msg = document.querySelector('#form-msg');
      if(valid){
        var submitButton = form.querySelector('button[type="submit"]');
        if(msg){
          msg.textContent = 'Mensagem enviada com sucesso!';
          msg.classList.add('show');
          msg.classList.remove('error');
        }
        if(submitButton){
          submitButton.disabled = true;
          submitButton.textContent = 'Enviando...';
        }
        form.submit();
      } else if(msg){
        msg.classList.remove('show');
      }
    });
  }

  // Cookie banner
  var banner = document.querySelector('#cookie-banner');
  var choice = localStorage.getItem('tritiva_cookie_choice');
  if(banner && !choice){ banner.classList.add('show'); }
  document.querySelectorAll('[data-cookie-choice]').forEach(function(btn){
    btn.addEventListener('click', function(){
      localStorage.setItem('tritiva_cookie_choice', btn.getAttribute('data-cookie-choice'));
      if(banner) banner.classList.remove('show');
    });
  });
});
