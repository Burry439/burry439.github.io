import {demos} from './demo-data.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mediaURL=file=>new URL(`demos/${file}`,import.meta.url).href;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const players=new Set();
const time=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
let uid=0;
class ProductDemo{
 constructor(root,id){
  this.root=root;this.data=demos[id];this.index=0;this.mode=reduced.matches?'explore':'film';this.acted=false;this.loaded=false;this.failed=false;this.destroyed=false;this.generation=0;this.extra=false;this.resumeAt=null;
  this.format=matchMedia('(max-width:600px)').matches?'mobile':'desktop';this.film=this.data.films[this.format];
  this.lifecycle=new AbortController();const signal=this.lifecycle.signal;this.uid=`film-${++uid}`;
  root.className='product-demo guided-demo';root.dataset.format=this.format;
  root.innerHTML=`<div class="film-heading"><p class="demo-label">${esc(this.data.label)}</p><span>${this.data.totalSeconds}s · Silent</span></div><div class="demo-modes" role="group" aria-label="Choose how to view the recorded demo"><button data-command="film">Watch film</button><button data-command="explore">Explore moments</button></div><div class="film-stage"><img class="demo-still" src="${mediaURL(this.film.poster)}" alt="${esc(this.data.name)}: ${esc(this.data.steps[0].heading)}"><video muted playsinline preload="none" tabindex="-1" aria-hidden="true"></video><button class="film-start" data-command="play" aria-label="Play ${esc(this.data.name)} film">▶</button></div><p class="extra-explanation" hidden>A separate Hebrew session: fictional ectopic-pregnancy case. English coaching explanation: inviting the patient to describe the problem in her own words gave her room to present the main complaint.</p><div class="demo-error" role="status" hidden><span>The film couldn’t load. Read the still and transcript, or</span> <button data-command="retry">retry the film</button>.</div><div class="film-controls" role="group" aria-label="Film controls"><button data-command="play">Play</button><label class="sr-only" for="${this.uid}-progress">Film position in seconds</label><input id="${this.uid}-progress" type="range" min="0" max="${this.data.totalSeconds}" step="0.1" value="0"><span class="film-time">0:00 / ${time(this.data.totalSeconds)}</span></div><div class="explore-controls" role="group" aria-label="Recorded chapter controls"><button class="demo-action" data-command="action"></button><button data-command="back" aria-label="Previous recorded moment">Back</button><button data-command="next" aria-label="Next recorded moment">Next</button><button data-command="replay">Replay</button></div><div class="chapter-control"><label for="${this.uid}-chapter">Chapter</label><select id="${this.uid}-chapter" aria-label="Choose a recorded chapter">${this.data.steps.map((s,i)=>`<option value="${i}">${i+1}. ${esc(s.title)}</option>`).join('')}</select><span class="demo-status" role="status" aria-live="polite" aria-atomic="true"></span></div><details class="demo-secondary"><summary>Transcript and more</summary><button data-command="restart">Restart demo</button>${this.data.extra?'<button data-command="extra">See a separate Hebrew example</button><button data-command="main" hidden>Return to the English example</button>':''}<div class="demo-transcript">${this.data.transcript.map(s=>`<section><h3>${time(s.start)} · ${esc(s.title)}</h3><p>${esc(s.text).replaceAll('\n','<br>')}</p></section>`).join('')}${this.data.extra?`<section><h3>Separate Hebrew session</h3><p>${esc(this.data.extra.body)} ${esc(this.data.extra.quote)} ${esc(this.data.extra.outcome)}</p></section>`:''}</div></details>`;
  root.querySelector('.film-stage').append(root.querySelector('.demo-error'));this.video=root.querySelector('video');this.image=root.querySelector('.demo-still');this.range=root.querySelector('input');this.select=root.querySelector('select');
  root.addEventListener('click',e=>{const button=e.target.closest('[data-command]');if(button)this.command(button.dataset.command);},{signal});
  this.select.addEventListener('change',()=>this.go(Number(this.select.value)),{signal});
  this.range.addEventListener('input',()=>{this.pause();this.seek(Number(this.range.value));},{signal});
  this.video.addEventListener('timeupdate',()=>this.tick(),{signal});
  this.video.addEventListener('play',()=>{if(this.destroyed)return;for(const v of document.querySelectorAll('video'))if(v!==this.video)v.pause();this.update();},{signal});
  this.video.addEventListener('pause',()=>this.update(),{signal});
  this.video.addEventListener('error',()=>{if(this.loaded&&!this.destroyed){this.failed=true;this.pause();this.showStill(this.acted?'after':'before');this.update();}},{signal});
  this.video.addEventListener('ended',()=>{if(this.extra){this.showStill('after');this.acted=true;}else if(this.mode==='film'){this.index=this.data.steps.length-1;this.acted=true;this.showStill('after');}this.update();},{signal});
  this.observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)this.pause();},{threshold:.1});this.observer.observe(root);
  window.addEventListener('resize',()=>{if(!this.loaded){this.format=matchMedia('(max-width:600px)').matches?'mobile':'desktop';this.film=this.data.films[this.format];this.root.dataset.format=this.format;this.showStill(this.acted?'after':'before');}},{signal});players.add(this);this.showStill('before');this.update();
 }
 get step(){return this.extra?this.data.extra:this.data.steps[this.index];}
 showStill(state){const file=this.extra?this.step[state]:this.step.posters[this.format][state];this.image.src=mediaURL(file);this.image.alt=`${this.data.name}: ${this.extra?this.step.title:this.step.heading} · ${state==='after'?'recorded result':'chapter preview'}`;this.root.classList.remove('has-footage');}
 update(){
  if(this.destroyed)return;this.root.dataset.mode=this.mode;this.root.dataset.extra=String(this.extra);this.root.querySelector('.extra-explanation').hidden=!this.extra;this.root.querySelector('.demo-label').textContent=this.extra?'Separate Hebrew session · AI-voiced example · real app footage':this.data.label;this.root.dataset.step=String(this.index);this.root.dataset.acted=String(this.acted);
  const playing=!this.video.paused;this.root.querySelectorAll('[data-command="play"]').forEach(b=>{if(!b.classList.contains('film-start'))b.textContent=playing?'Pause':this.video.ended?'Replay film':'Play';});
  this.root.querySelector('.film-start').hidden=this.mode==='explore'||playing||this.loaded;
  this.root.querySelector('[data-command="action"]').textContent=playing?'Pause moment':this.resumeAt!==null?'Continue moment':this.format==='mobile'?'Play moment':this.step.action;
  this.root.querySelector('[data-command="back"]').disabled=this.index===0||this.extra;
  this.root.querySelector('[data-command="next"]').disabled=this.index===this.data.steps.length-1||this.extra;
  this.root.querySelectorAll('.demo-modes button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.command===this.mode)));
  this.root.querySelector('.demo-error').hidden=!this.failed;
  this.select.value=String(this.index);this.select.disabled=this.extra;
  this.root.querySelector('.demo-status').innerHTML=this.extra?'Separate Hebrew recording':`${this.index+1} of ${this.data.steps.length}<span class="sr-only">: ${esc(this.step.title)}${this.acted?'; recorded result held':''}</span>`;
 }
 pause(){if(this.destroyed)return;if(!this.video.paused&&this.mode==='explore')this.resumeAt=this.video.currentTime;this.generation++;this.video.pause();}
 unload(){this.pause();this.loaded=false;this.video.removeAttribute('src');this.video.load();}
 load(){if(!this.loaded){const format=matchMedia('(max-width:600px)').matches?'mobile':'desktop';if(format!==this.format){this.format=format;this.film=this.data.films[format];this.root.dataset.format=format;this.showStill('before');}this.loaded=true;this.video.src=mediaURL(this.extra?this.step.clip:this.film.file);this.video.load();}}
 async seek(at,play=false){
  this.load();const generation=++this.generation;
  try{
   if(this.video.readyState<1)await new Promise((resolve,reject)=>{const controller=new AbortController();this.pending?.abort();this.pending=controller;const onAbort=()=>reject(new Error('cancelled'));const finish=(fn)=>{controller.signal.removeEventListener('abort',onAbort);controller.abort();if(this.pending===controller)this.pending=null;fn();};this.video.addEventListener('loadedmetadata',()=>finish(resolve),{once:true,signal:controller.signal});this.video.addEventListener('error',()=>finish(()=>reject(new Error('media'))),{once:true,signal:controller.signal});controller.signal.addEventListener('abort',onAbort,{once:true});});
   if(this.destroyed||generation!==this.generation)return;
   this.video.currentTime=Math.min(at,this.video.duration-.05);this.root.classList.add('has-footage');
   if(play)await this.video.play();
   if(this.destroyed||generation!==this.generation){this.video.pause();return;}this.update();
  }catch(error){if(error.name==='AbortError'||error.message==='cancelled')return;if(generation===this.generation&&!this.destroyed){this.failed=true;this.showStill(this.acted?'after':'before');this.update();}}
 }
 tick(){
  if(this.destroyed)return;
  const at=this.video.currentTime;
  if(this.mode==='explore'&&!this.extra&&at>=this.step.end-.07){this.video.pause();this.resumeAt=null;this.acted=true;this.showStill('after');this.update();}
  else if(this.mode==='film'&&!this.extra){const index=this.data.steps.findIndex(s=>at>=s.start&&at<s.end);if(index>=0&&this.index!==index){this.index=index;this.update();}}
  if(!this.extra){this.range.value=at;this.root.querySelector('.film-time').textContent=`${time(at)} / ${time(this.data.totalSeconds)}`;}
 }
 go(index){this.pause();this.pending?.abort();this.resumeAt=null;if(this.extra){this.unload();this.extra=false;}this.index=index;this.acted=false;this.failed=false;this.showStill('before');if(this.mode==='film'&&this.loaded)this.seek(this.step.start);this.update();}
 command(command){
  if(command==='film'||command==='explore'){this.pause();if(this.extra){this.unload();this.extra=false;}this.mode=command;this.resumeAt=null;this.acted=false;this.showStill('before');this.update();if(command==='film')this.seek(this.step.start,true);}
  if(command==='play'){if(document.activeElement?.classList.contains('film-start'))this.root.querySelector('.film-controls [data-command="play"]').focus({preventScroll:true});if(!this.video.paused){this.pause();return;}this.failed=false;this.seek(this.video.ended?0:this.loaded?this.video.currentTime:this.step.start,true);}
  if(command==='action'||command==='replay'){if(command==='action'&&!this.video.paused){this.pause();return;}this.failed=false;this.acted=false;const start=this.resumeAt!==null&&command==='action'?this.resumeAt:this.extra?0:this.step.start;this.resumeAt=null;this.seek(start,true);}
  if(command==='next')this.go(Math.min(this.index+1,this.data.steps.length-1));
  if(command==='back')this.go(Math.max(0,this.index-1));
  if(command==='restart'){this.unload();this.pending?.abort();this.extra=false;this.failed=false;this.resumeAt=null;this.index=0;this.acted=false;this.range.value=0;this.root.querySelector('.film-time').textContent=`0:00 / ${time(this.data.totalSeconds)}`;this.showStill('before');this.update();}
  if(command==='retry'){this.unload();this.failed=false;this.resumeAt=null;this.seek(this.extra?0:this.step.start,true);this.update();}
  if(command==='extra'){this.unload();this.extra=true;this.mode='explore';this.acted=false;this.resumeAt=null;this.showStill('before');this.root.querySelector('[data-command="main"]').hidden=false;this.update();this.seek(0,true);}
  if(command==='main'){this.go(0);this.root.querySelector('[data-command="main"]').hidden=true;this.root.querySelector('.demo-action').focus({preventScroll:true});}
 }
 destroy(){this.pause();this.pending?.abort();this.unload();this.destroyed=true;this.lifecycle.abort();this.observer.disconnect();players.delete(this);}
}
// Pause any source (including full promos) before another starts.
for(const video of document.querySelectorAll('video'))video.addEventListener('play',()=>{for(const v of document.querySelectorAll('video'))if(v!==video)v.pause();});
for(const el of document.querySelectorAll('[data-demo-embed]'))new ProductDemo(el,el.dataset.demoEmbed);
const dialog=document.querySelector('#demo-dialog');let modal,opener;
for(const button of document.querySelectorAll('[data-demo-open]'))button.addEventListener('click',()=>{for(const p of players)p.pause();opener=button;dialog.querySelector('h2').textContent=demos[button.dataset.demoOpen].name;dialog.querySelector('.demo-dialog-content').innerHTML='<div></div>';modal=new ProductDemo(dialog.querySelector('.demo-dialog-content>div'),button.dataset.demoOpen);dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';dialog.querySelector('[data-demo-close]').focus({preventScroll:true});if(!reduced.matches)modal.command('play');});
dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const focusable=[...dialog.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled),summary,a[href]')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus({preventScroll:true});}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus({preventScroll:true});}});
const closeDemo=()=>{modal?.pause();modal?.pending?.abort();dialog.close();};dialog.addEventListener('cancel',()=>{modal?.pause();modal?.pending?.abort();});dialog.querySelector('[data-demo-close]').addEventListener('click',closeDemo);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDemo();}});
dialog.addEventListener('close',()=>{modal?.destroy();modal=null;dialog.querySelector('.demo-dialog-content').replaceChildren();document.body.style.overflow='';opener?.focus({preventScroll:true});});
document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const p of players)p.pause();});
reduced.addEventListener('change',()=>{if(reduced.matches)for(const p of players){p.pause();p.mode='explore';p.showStill('before');p.update();}});
