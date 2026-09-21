(()=>{
const toggle=document.getElementById('menu-button'),menu=document.getElementById('mobile-nav');
const close=()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');};
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
const trigger=document.querySelector('.property-menu-trigger');
trigger.addEventListener('click',()=>trigger.setAttribute('aria-expanded',String(trigger.getAttribute('aria-expanded')!=='true')));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();trigger.setAttribute('aria-expanded','false');}});
document.addEventListener('click',e=>{if(!e.target.closest('.property-menu'))trigger.setAttribute('aria-expanded','false');});
})();
