document.addEventListener('DOMContentLoaded', function(){
  var header = document.querySelector('.site-header');
  if(header){
    window.addEventListener('scroll', function(){
      header.classList.toggle('scrolled', window.scrollY > 8);
    });
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

  // Contact form validation (no backend yet)
  var form = document.querySelector('#contact-form');
  if(form){
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
        form.reset();
        if(msg) msg.classList.add('show');
        form.style.display = 'none';
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
