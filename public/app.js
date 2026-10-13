const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const themeButton=document.querySelector('.theme-toggle');
function themeLabel(){const dark=document.documentElement.dataset.theme==='dark';themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} theme`);themeButton.setAttribute('aria-pressed',String(dark));}
themeLabel();
themeButton.addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('baruch-theme',document.documentElement.dataset.theme)}catch{}themeLabel();});

if('IntersectionObserver' in window&&!reduced.matches){
 document.documentElement.classList.add('js-motion');
 const revealObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target);}})},{threshold:.07});
 document.querySelectorAll('.reveal').forEach(e=>revealObserver.observe(e));
}

const cards=[...document.querySelectorAll('.deck-card')];let current=0;
function showCard(n){current=(n+cards.length)%cards.length;cards.forEach((c,i)=>{const active=i===current;c.classList.toggle('active',active);c.classList.toggle('behind',!active);c.inert=!active;});document.querySelectorAll('[data-slide]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));}
if(cards.length){document.querySelector('.deck-prev').addEventListener('click',()=>showCard(current-1));document.querySelector('.deck-next').addEventListener('click',()=>showCard(current+1));document.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>showCard(Number(b.dataset.slide))));document.querySelector('.deck').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showCard(current+(e.key==='ArrowRight'?1:-1));}});let touchX;document.querySelector('.deck').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});document.querySelector('.deck').addEventListener('touchend',e=>{if(touchX===undefined)return;const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>60){showCard(current+(delta<0?1:-1));}touchX=undefined;},{passive:true});}

const dialog=document.querySelector('#video-dialog');const player=dialog.querySelector('video');
if(matchMedia('(max-width:600px)').matches)document.querySelectorAll('[data-promo-duration]').forEach(el=>{el.textContent=el.dataset.mobileDuration;});
const promoSource=(desktop,mobile)=>matchMedia('(max-width:600px)').matches&&mobile?mobile:desktop;
document.querySelectorAll('[data-video]').forEach(b=>b.addEventListener('click',()=>{player.src=promoSource(b.dataset.video,b.dataset.videoMobile);player.poster=b.dataset.poster;document.querySelector('#video-dialog-title').textContent=`${b.dataset.title} · Project promo`;dialog.showModal();document.body.style.overflow='hidden';player.play().catch(()=>{});}));
function closeVideo(){dialog.close();}
dialog.querySelector('.dialog-close').addEventListener('click',closeVideo);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeVideo();}});
dialog.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();document.body.style.overflow='';});
document.addEventListener('visibilitychange',()=>{if(document.hidden){document.querySelectorAll('video').forEach(v=>v.pause());}});

const caseLinks=[...document.querySelectorAll('.case-subnav a')];
const navLinks=[...document.querySelectorAll('.nav-links a')];
if('IntersectionObserver' in window){
 const sectionObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){caseLinks.forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`));navLinks.forEach(a=>a.classList.toggle('on',a.hash===`#${e.target.id}`));}})},{rootMargin:'-140px 0px -55% 0px',threshold:0});
 document.querySelectorAll('main section[id]').forEach(s=>sectionObserver.observe(s));
}
