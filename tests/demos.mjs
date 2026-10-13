import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {demos} from '../src/demos.mjs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
const base=process.env.QA_URL||'http://127.0.0.1:4174';
await mkdir('qa/screenshots',{recursive:true});const checks=[],errors=[];
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
const root=page.locator('#demo-dialog .product-demo');const cmd=c=>root.locator(`[data-command="${c}"]`).filter({visible:true}).first();
const stage=()=>page.evaluate(()=>({y:document.querySelector('#demo-dialog .film-stage').getBoundingClientRect().top,scroll:document.querySelector('#demo-dialog').scrollTop}));
async function held(i){await root.locator('video').evaluate((v,end)=>{v.currentTime=end-.04;v.dispatchEvent(new Event('timeupdate'));},demos[await root.evaluate(el=>el.closest('dialog').querySelector('h2').textContent==='SimReview'?'simreview':'the-city-beyond')].steps[i].end);await page.waitForFunction(()=>document.querySelector('#demo-dialog .product-demo').dataset.acted==='true');}
try{
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/','/simreview/','/the-city-beyond/']){
   const early=[];const listener=r=>{if(/\/demos\/.*\.mp4/.test(r.url()))early.push(r.url());};page.on('request',listener);
   assert.equal((await page.goto(base+route,{waitUntil:'networkidle'})).status(),200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(early.length,0);page.off('request',listener);
   if(route!=='/')await page.locator('[data-demo-embed]').screenshot({path:`qa/screenshots/revision-${route.split('/')[1]}-${width}.png`});
  }
 }
 checks.push('Three pages at 320/390/768/1440; no horizontal overflow or demo video before activation');
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:700},{width:1440,height:900},{width:1024,height:480}]){
  await page.setViewportSize(viewport);await page.goto(base,{waitUntil:'networkidle'});
  for(const id of Object.keys(demos)){
   await page.locator(`[data-demo-open="${id}"]`).click();await page.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);await cmd('play').click();
   assert.equal(await root.locator('video').evaluate(v=>v.paused),true);
   const before=await stage();await cmd('explore').click();await root.locator('select').selectOption('1');const after=await stage();assert.ok(Math.abs(before.y-after.y)<1,'Stage jumped when mode/chapter changed');assert.equal(before.scroll,after.scroll);
   const bounds=await root.locator('.chapter-control').boundingBox();assert.ok(bounds.y+bounds.height<=viewport.height,`Clipped controls ${id} ${viewport.width}x${viewport.height}`);
   assert.equal(await page.locator('#demo-dialog').evaluate(d=>d.scrollTop),0);
   await page.screenshot({path:`qa/screenshots/revision-dialog-${id}-${viewport.width}-${viewport.height}.png`});await page.keyboard.press('Escape');assert.equal(await page.evaluate(id=>document.activeElement.dataset.demoOpen===id,id),true);
  }
 }
 checks.push('Both dialogs fit 320x568, 390x844, tablet, desktop and 1024x480; zero playback scroll jump; Escape restores focus');
 await page.setViewportSize({width:1440,height:1000});await page.goto(base);
 for(const [id,d] of Object.entries(demos)){
  await page.locator(`[data-demo-open="${id}"]`).click();await page.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);await cmd('explore').click();
  for(let i=0;i<d.steps.length;i++){
   if(i)await cmd('next').click();assert.equal(await root.getAttribute('data-step'),String(i));assert.equal(await root.getAttribute('data-acted'),'false');
   const pos=await stage();await cmd('action').click();await page.waitForFunction(()=>!document.querySelector('#demo-dialog video').paused);await held(i);assert.equal(await root.locator('video').evaluate(v=>v.paused),true);assert.deepEqual(await stage(),pos,`${id} chapter ${i}: ${await root.evaluate(r=>JSON.stringify([...r.children].map(e=>[e.className,e.getBoundingClientRect().height])))}`);
   await cmd('replay').click();await page.waitForFunction(()=>!document.querySelector('#demo-dialog video').paused);await held(i);
   if(i){await cmd('back').click();assert.equal(await root.getAttribute('data-step'),String(i-1));await cmd('next').click();}
  }
  const loaded=await root.locator('video').getAttribute('src');await cmd('film').click();assert.equal(await root.locator('video').getAttribute('src'),loaded);await page.waitForFunction(()=>!document.querySelector('#demo-dialog video').paused);
  await root.locator('video').evaluate(v=>{v.currentTime=v.duration-.15;});await page.waitForFunction(()=>document.querySelector('#demo-dialog video').ended);assert.equal(await root.locator('video').evaluate(v=>v.loop),false);
  await root.locator('.demo-secondary summary').click();await cmd('restart').click();assert.equal(await root.locator('video').getAttribute('src'),null);assert.equal(await root.getAttribute('data-step'),'0');
  if(d.extra){await cmd('extra').click();await page.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);assert.match(await root.locator('.extra-explanation').textContent(),/separate Hebrew session/);assert.match(await root.locator('.demo-label').textContent(),/Separate Hebrew/);await cmd('main').click();assert.equal(await root.getAttribute('data-extra'),'false');}
  for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>Boolean(document.activeElement.closest('#demo-dialog'))),true);}
  await page.keyboard.press('Escape');await page.locator('#demo-dialog video').waitFor({state:'detached'});assert.equal(await page.locator('#demo-dialog video').count(),0);
 }
 checks.push('All chapters: action, held result, replay, back/next; film reuse; end stops; restart unloads; Hebrew consistency; keyboard modal containment');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);const early=[];page.on('request',r=>{if(/\/demos\/.*\.mp4/.test(r.url()))early.push(r.url());});await page.locator('[data-demo-open="simreview"]').click();assert.equal(await root.getAttribute('data-mode'),'explore');assert.equal(await root.locator('video').getAttribute('src'),null);assert.equal(early.length,0);await cmd('film').click();await page.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);await page.keyboard.press('Escape');await page.emulateMedia({reducedMotion:'no-preference'});
 checks.push('Reduced motion opens still exploration, with explicit film opt-in');
 await page.route('**/demos/*-desktop.mp4',r=>r.abort());await page.goto(base);await page.locator('[data-demo-open="simreview"]').click();await root.locator('.demo-error').waitFor({state:'visible'});assert.equal(await root.locator('.demo-still').isVisible(),true);await page.unroute('**/demos/*-desktop.mp4');await cmd('retry').click();await page.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);await page.keyboard.press('Escape');
 checks.push('Failed media falls back to still and transcript; retry recovers');
 let release;const gate=new Promise(resolve=>release=resolve);await page.route('**/demos/simreview-desktop.mp4',async route=>{await gate;await route.continue().catch(()=>{});});await page.goto(base);await page.locator('[data-demo-open="simreview"]').click();await page.keyboard.press('Escape');await page.locator('#demo-dialog video').waitFor({state:'detached'});release();await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>[...document.querySelectorAll('video')].filter(v=>!v.paused).length),0);await page.unroute('**/demos/simreview-desktop.mp4');
 checks.push('Closing while media is pending cancels playback');
 await page.goto(base+'/simreview/');const embed=page.locator('[data-demo-embed]');await embed.scrollIntoViewIfNeeded();await embed.locator('.film-controls [data-command="play"]').click();await page.waitForFunction(()=>document.querySelector('[data-demo-embed] video').currentTime>0);await page.evaluate(async()=>{const full=document.querySelector('.video-shell video');full.muted=true;await full.play();});assert.equal(await embed.locator('video').evaluate(v=>v.paused),true);assert.equal(await page.evaluate(()=>[...document.querySelectorAll('video')].filter(v=>!v.paused).length),1);await embed.locator('.film-controls [data-command="play"]').click();await page.waitForFunction(()=>!document.querySelector('[data-demo-embed] video').paused);await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.waitForFunction(()=>document.querySelector('[data-demo-embed] video').paused);await embed.scrollIntoViewIfNeeded();await embed.locator('.film-controls [data-command="play"]').click();await page.waitForFunction(()=>!document.querySelector('[data-demo-embed] video').paused);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await embed.locator('video').evaluate(v=>v.paused),true);
 checks.push('Only one active media source; offscreen and hidden-tab playback stops');
 assert.deepEqual(errors,[]);await writeFile('qa/demo-report.json',JSON.stringify({base,checks,errors},null,2));console.log(checks.join('\n'));
}finally{await browser.close();}
