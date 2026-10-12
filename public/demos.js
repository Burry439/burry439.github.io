import {demos} from './demo-data.js';

const preference=matchMedia('(prefers-reduced-motion: reduce)');
const mediaURL=file=>new URL(`demos/${file}`,import.meta.url).href;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const players=new Set();
let serial=0;

class GuidedDemo {
 constructor(root,id){
  this.root=root;this.data=demos[id];this.index=0;this.extra=false;this.active=false;this.acted=false;
  this.watch=false;this.playing=false;this.remaining=0;this.raf=0;this.generation=0;this.failed=false;
  this.lifecycle=new AbortController();
  this.preloader=document.createElement('video');this.preloader.muted=true;this.preloader.preload='auto';
  this.uid=`guided-${++serial}`;
  root.classList.add('guided-demo',this.data.kind);
  root.innerHTML=`<div class="demo-top"><div><span class="eyebrow">Explore the product</span><h2>${escape(this.data.title)}</h2></div><span class="demo-length">${escape(this.data.duration)} · no sign-in</span></div>
   <p class="demo-introduction">${escape(this.data.introduction)}</p><p class="demo-label">${escape(this.data.label)}</p>
   <div class="demo-modes" role="group" aria-label="Demo mode"><button data-command="manual" aria-pressed="true">Click through</button><button data-command="watch" aria-pressed="false">▷ Watch walkthrough</button></div>
   <ol class="demo-steps" aria-label="Demo steps">${this.data.steps.map((s,i)=>`<li><button data-step="${i}" aria-label="Step ${i+1}: ${escape(s.title)}"><span>${i+1}</span><small>${escape(s.title)}</small></button></li>`).join('')}</ol>
   <div class="demo-stage"><div class="demo-screen"><div class="demo-frame"><img class="demo-still" alt="" width="${this.data.kind==='portrait'?624:1280}" height="${this.data.kind==='portrait'?1350:720}"><video muted playsinline preload="none" tabindex="-1" aria-hidden="true"></video><button class="demo-hotspot" data-command="action"><span class="hotspot-dot" aria-hidden="true"></span><span class="sr-only"></span></button></div><p class="demo-screen-note"></p></div>
   <div class="demo-explanation"><p class="demo-step-count"></p><h3 id="${this.uid}-step" tabindex="-1"></h3><p class="demo-body"></p><div class="demo-dialogue"></div><blockquote class="demo-quote"><span></span><p></p></blockquote><button class="demo-action" data-command="action"></button><div class="demo-outcome"><span class="eyebrow">What changed</span><p></p></div><div class="demo-error" role="status" hidden><p>The footage couldn’t load. The recorded still and explanation are available.</p><button data-command="retry">Retry footage</button></div></div></div>
   <div class="demo-controls" role="group" aria-label="Playback and navigation"><button data-command="back">← Back</button><button data-command="play">Play step</button><button data-command="replay">Replay step</button><button data-command="restart">Restart</button><button class="demo-next" data-command="next">Next →</button></div>
   <p class="demo-status" role="status" aria-live="polite" aria-atomic="true"></p>
   <div class="demo-complete" hidden><strong>You’ve explored the core loop.</strong><p>${escape(this.data.contribution)}</p>${this.data.extra?'<button class="text-link" data-command="extra">See a Hebrew example →</button>':''}</div>
   <p class="demo-credit">${escape(this.data.contribution)}</p>`;
  this.video=root.querySelector('video');this.still=root.querySelector('.demo-still');
  const listenerOptions={signal:this.lifecycle.signal};
  this.video.addEventListener('ended',()=>{if(!this.destroyed&&this.acted&&this.video.ended)this.finishClip();},listenerOptions);
  this.video.addEventListener('error',()=>{if(!this.destroyed&&this.active&&this.video.getAttribute('src'))this.fail();},listenerOptions);
  this.video.addEventListener('timeupdate',()=>{if(!this.destroyed)this.updateDialogue();},listenerOptions);
  root.addEventListener('click',e=>{if(this.destroyed)return;const button=e.target.closest('button');if(!button)return;
   if(button.dataset.step!==undefined){this.watch=false;this.go(Number(button.dataset.step),true);return;}
   const command=button.dataset.command;
   if(command==='manual'){this.pause();this.watch=false;this.sync();}
   if(command==='watch'){this.activate();this.watch=true;this.extra=false;this.go(0);this.act();}
   if(command==='action'){this.activate();this.watch=false;this.act();}
   if(command==='back'){this.watch=false;if(this.extra){this.extra=false;this.go(this.data.steps.length-1,true);}else this.go(this.index-1,true);}
   if(command==='next'){this.watch=false;if(this.index<this.data.steps.length-1&&!this.extra)this.go(this.index+1,true);else this.complete();}
   if(command==='restart'){this.reset();}
   if(command==='play'){if(this.playing)this.pause();else if(this.acted)this.resume();else {this.activate();this.act();}}
   if(command==='replay'||command==='retry'){this.activate();this.failed=false;this.act();}
   if(command==='extra'){this.pause();this.extra=true;this.watch=false;this.go(this.index,true);}
  },listenerOptions);
  this.observer=new IntersectionObserver(entries=>{if(!this.destroyed&&!entries[0].isIntersecting&&this.playing){this.pause();this.announce('Paused because the demo left view. Select Play to continue.');}},{threshold:0});
  this.observer.observe(this.query('.demo-screen'));players.add(this);this.go(0);
 }
 get step(){return this.extra?this.data.extra:this.data.steps[this.index];}
 query(selector){return this.root.querySelector(selector);}
 button(command){return this.query(`[data-command="${command}"]`);}
 announce(text){if(!this.destroyed)this.query('.demo-status').textContent=text;}
 activate(){for(const p of players)if(p!==this)p.pause();document.querySelectorAll('video').forEach(v=>{if(v!==this.video&&v!==this.preloader)v.pause();});this.active=true;}
 unload(video){video.pause();video.removeAttribute('src');video.load();}
 cancel(){this.generation++;this.pause();this.unload(this.video);this.unload(this.preloader);}
 go(index,focus=false){
  this.cancel();this.index=Math.max(0,Math.min(index,this.data.steps.length-1));this.acted=false;this.failed=false;this.remaining=this.step.seconds*1000;
  const s=this.step;this.root.dataset.step=String(this.index);this.root.dataset.extra=String(this.extra);this.root.classList.remove('has-outcome','has-footage');
  this.still.src=mediaURL(s.before);this.still.alt=`${this.data.name}: ${s.title}, recorded screen`;
  this.query('.demo-step-count').textContent=this.extra?'Separate recorded session':`Step ${this.index+1} of ${this.data.steps.length}`;
  this.query('h3').textContent=s.title;this.query('.demo-body').textContent=s.body;
  this.query('.demo-screen-note').textContent=`${this.data.label} · ${s.note||'Silent footage · readable explanation provided'}`;
  this.query('.demo-action').textContent=s.action;
  this.query('.demo-outcome p').textContent=s.outcome;this.query('.demo-outcome').setAttribute('aria-hidden','true');
  const quote=this.query('.demo-quote');quote.hidden=!s.quote;quote.querySelector('span').textContent=s.quoteLabel||'';quote.querySelector('p').textContent=s.quote||'';
  this.query('.demo-dialogue').innerHTML=(s.dialogue||[]).map((line,i)=>`<p data-line="${i}"><strong>${escape(line.who)}</strong> ${line.highlight?escape(line.text).replace(escape(line.highlight),`<mark>${escape(line.highlight)}</mark>`):escape(line.text)}</p>`).join('');
  this.query('.demo-error').hidden=true;this.query('.demo-complete').hidden=true;
  const hotspot=this.query('.demo-hotspot');hotspot.hidden=!s.hotspot;
  if(s.hotspot){hotspot.style.left=`${s.hotspot.x*100}%`;hotspot.style.top=`${s.hotspot.y*100}%`;hotspot.setAttribute('aria-label',s.action);hotspot.querySelector('.sr-only').textContent=s.action;}
  this.query('.demo-stage').classList.remove('step-enter');void this.root.offsetWidth;this.query('.demo-stage').classList.add('step-enter');
  this.sync();this.announce(`${this.extra?'Hebrew example':`Step ${this.index+1} of ${this.data.steps.length}`}: ${s.title}. ${s.body}`);
  if(focus){this.query('.demo-stage').scrollIntoView({block:'start',behavior:'instant'});this.query('h3').focus({preventScroll:true});}
  if(this.active)this.preloadNext();
 }
 preloadNext(){
  const next=this.extra?null:this.data.steps[this.index+1];
  if(next?.clip&&!preference.matches){this.preloader.src=mediaURL(next.clip);this.preloader.load();}
 }
 async act(){
  this.pause();this.generation++;const generation=this.generation;this.acted=true;this.remaining=this.step.seconds*1000;this.failed=false;
  this.query('.demo-stage').scrollIntoView({block:'start',behavior:'instant'});
  this.query('.demo-error').hidden=true;this.root.classList.remove('has-outcome');this.query('.demo-outcome').setAttribute('aria-hidden','true');this.query('.demo-hotspot').hidden=true;
  this.announce(`${this.step.title}. ${this.step.clip&&!preference.matches?'Playing the recorded example.':this.step.outcome}`);
  if(this.step.clip&&!preference.matches){
   this.root.classList.add('has-footage');this.video.poster=mediaURL(this.step.before);
   this.video.src=mediaURL(this.step.clip);this.video.currentTime=0;
   this.playing=true;this.sync();
   try{await this.video.play();if(generation!==this.generation){return;}this.tick();}
   catch{if(generation===this.generation)this.fail();}
  }else{this.still.src=mediaURL(this.step.after||this.step.before);this.showOutcome();if(this.watch){this.playing=true;this.tick();}}
  this.preloadNext();this.sync();
 }
 showOutcome(){this.root.classList.add('has-outcome');this.query('.demo-outcome').setAttribute('aria-hidden','false');}
 finishClip(){this.root.classList.remove('has-footage');this.still.src=mediaURL(this.step.after||this.step.before);this.showOutcome();if(!this.watch){this.pause();this.announce(`${this.step.outcome} Select Next to continue.`);}this.sync();}
 tick(){cancelAnimationFrame(this.raf);this.last=performance.now();const frame=now=>{
   if(!this.playing)return;const delta=now-this.last;this.last=now;
   // Buffering pauses watch-through time, so the next step never cuts footage short.
   if(this.watch&&(!this.root.classList.contains('has-footage')||this.video.readyState>=3))this.remaining-=delta;
   if(this.watch&&this.remaining<=0&&!this.root.classList.contains('has-footage')){this.pause();if(this.index<this.data.steps.length-1&&!this.extra){this.go(this.index+1);this.act();}else this.complete();return;}
   this.raf=requestAnimationFrame(frame);
  };this.raf=requestAnimationFrame(frame);
 }
 pause(){this.generation++;this.playing=false;cancelAnimationFrame(this.raf);this.video.pause();this.sync();}
 async resume(){
  this.activate();if(this.failed){this.announce('Retry the footage or continue with the still.');return;}
  if(this.root.classList.contains('has-footage')&&!preference.matches){const generation=this.generation;this.playing=true;this.sync();try{await this.video.play();if(generation!==this.generation)return;}catch{if(generation===this.generation)this.fail();return;}}
  else if(!this.watch){this.act();return;}
  this.playing=true;this.tick();this.sync();
 }
 fail(){this.pause();this.failed=true;this.root.classList.remove('has-footage');this.showOutcome();this.still.src=mediaURL(this.step.after||this.step.before);this.query('.demo-error').hidden=false;this.announce('Footage unavailable. Read the recorded still and explanation, retry, or continue.');}
 updateDialogue(){const s=this.step;if(!s.dialogue)return;this.query('.demo-dialogue').querySelectorAll('[data-line]').forEach((el,i)=>{const line=s.dialogue[i];el.classList.toggle('speaking',this.video.currentTime>=line.s&&this.video.currentTime<line.e);});}
 complete(){this.pause();this.query('.demo-complete').hidden=false;this.announce(`Walkthrough complete. ${this.data.contribution}`);this.button('play').disabled=true;this.button('next').disabled=true;}
 sync(){
  if(!this.video||this.destroyed)return;
  this.root.dataset.mode=this.watch?'watch':'manual';this.root.dataset.playing=String(this.playing);
  this.button('manual').setAttribute('aria-pressed',String(!this.watch));this.button('watch').setAttribute('aria-pressed',String(this.watch));
  this.button('play').textContent=this.playing?'Pause':this.acted?(this.watch?'Play':'Play step'):'Play step';this.button('play').disabled=false;
  this.button('back').disabled=this.index===0&&!this.extra;this.button('next').disabled=false;
  this.button('next').textContent=this.index===this.data.steps.length-1?'Finish →':'Next →';
  this.root.querySelectorAll('[data-step]').forEach((button,i)=>{if(i===this.index&&!this.extra)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 }
 reset(){this.cancel();this.active=false;this.extra=false;this.watch=false;this.go(0);this.query('h3').focus({preventScroll:true});}
 destroy(){this.cancel();this.destroyed=true;this.lifecycle.abort();this.observer.disconnect();players.delete(this);this.root.innerHTML='';this.root.classList.remove('guided-demo','portrait','landscape','has-outcome','has-footage');for(const key of ['step','extra','mode','playing'])delete this.root.dataset[key];}
}

document.querySelectorAll('[data-demo-embed]').forEach(root=>new GuidedDemo(root,root.dataset.demoEmbed));
const dialog=document.querySelector('#demo-dialog');let modalPlayer=null;let opener=null;
document.querySelectorAll('[data-demo-open]').forEach(button=>button.addEventListener('click',()=>{
 opener=button;for(const p of players)p.pause();modalPlayer=new GuidedDemo(dialog.querySelector('.demo-dialog-content'),button.dataset.demoOpen);
 dialog.querySelector('#demo-dialog-title').textContent=`${demos[button.dataset.demoOpen].name} · Explore demo`;
 dialog.showModal();document.body.style.overflow='hidden';dialog.querySelector('[data-demo-close]').focus();
}));
dialog?.querySelector('[data-demo-close]').addEventListener('click',()=>dialog.close());
dialog?.addEventListener('keydown',event=>{
 if(event.key!=='Tab')return;
 const items=[...dialog.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length>0);
 const first=items[0],last=items.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
});
dialog?.addEventListener('close',()=>{modalPlayer?.destroy();modalPlayer=null;document.body.style.overflow='';opener?.focus();});
dialog?.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const p of players){if(p.playing){p.pause();p.announce('Paused while the tab is hidden. Select Play to continue.');}}});
preference.addEventListener('change',()=>{for(const p of players){p.pause();if(preference.matches){p.root.classList.remove('has-footage');p.still.src=mediaURL(p.acted?(p.step.after||p.step.before):p.step.before);p.unload(p.video);p.unload(p.preloader);p.announce('Reduced motion: recorded stills show the same steps.');}}});
document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{for(const p of players)p.pause();}));
// Native full-promo controls also stop a guided walkthrough.
document.querySelectorAll('video:not(.demo-frame video)').forEach(video=>video.addEventListener('play',()=>{for(const p of players)p.pause();}));
