/* King County Window & Door — no tracking, external SDKs or server required. */
(function(){
  'use strict';
  document.documentElement.classList.add('js-ready');
  const menuButton=document.getElementById('menuToggle');
  const mobileNav=document.getElementById('mobileNav');
  if(menuButton&&mobileNav){
    function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');}
    menuButton.addEventListener('click',()=>{const open=mobileNav.hidden;mobileNav.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
    mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  }
  document.querySelectorAll('img[data-fallback]').forEach(image=>{
    image.addEventListener('error',()=>{
      const fallback=image.getAttribute('data-fallback');
      if(fallback && image.getAttribute('src')!==fallback){image.src=fallback;}
    },{once:true});
  });
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
    },{threshold:.08,rootMargin:'0px 0px 70px 0px'});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));}
  // Production: set this to your trusted backend endpoint; it must accept JSON and return 2xx.
  // E.g. '/api/leads' after implementing server validation, rate limiting and consent handling.
  const FORM_ENDPOINT='';
  document.querySelectorAll('[data-lead-form]').forEach(form=>{
    const status=form.querySelector('.form-status');
    form.addEventListener('submit',async function(event){
      event.preventDefault();
      if(!form.reportValidity())return;
      const d=new FormData(form);
      if(d.get('website'))return; // spam honeypot
      const payload={name:String(d.get('name')||'').trim(),phone:String(d.get('phone')||'').trim(),email:String(d.get('email')||'').trim(),zip:String(d.get('zip')||'').trim(),service:String(d.get('service')||''),message:String(d.get('message')||'').trim(),consent:d.get('consent')==='on',source:location.href};
      if(!payload.name||!payload.phone||!payload.email||!payload.consent){status.textContent='Please complete all required fields.';return;}
      const submit=form.querySelector('[type=submit]');
      if(FORM_ENDPOINT){
        try{
          submit.disabled=true;status.textContent='Submitting your request...';
          const result=await fetch(FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
          if(!result.ok)throw Error('Request failed');
          status.textContent='Your request has been sent. We will contact you soon.';
          form.reset();
        }catch(error){status.textContent='Unable to send the request. Please call (206) 944-2857 or email kingcountydecks@gmail.com.';}
        finally{submit.disabled=false;}
      }else{
        const subject='Window & Door Estimate Request — '+payload.name;
        const body=[
          'Hello King County Decks,', '', 'I would like to discuss a window or door project.', '',
          'Name: '+payload.name,'Phone: '+payload.phone,'Email: '+payload.email,'ZIP code: '+(payload.zip||'Not provided'),
          'Service: '+payload.service,'Project details: '+(payload.message||'Not provided'),'',
          'Sent from the King County Window & Door website concept.'
        ].join('\n');
        status.textContent='Your email application will open. Please press Send there to complete your request. Alternatively, call (206) 944-2857.';
        window.location.href='mailto:kingcountydecks@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      }
    });
  });
})();
