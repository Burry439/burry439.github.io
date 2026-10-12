// Run with a locally installed Playwright package; the shipped site has no dependencies.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
const base=process.env.QA_URL||'http://127.0.0.1:4174';
await mkdir('qa/screenshots',{recursive:true});const checks=[];const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:1050}});
page.on('pageerror',e=>errors.push(e.message));
const command=(root,c)=>root.locator(`[data-command="${c}"]`).first();
const root=page.locator('#demo-dialog .guided-demo');
try{
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});
  for(const route of ['/','/simreview/','/the-city-beyond/']){
   const requests=[];const listener=req=>{if(/\/demos\/.*\.mp4/.test(req.url()))requests.push(req.url());};page.on('request',listener);
   const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow ${width} ${route}`);
   assert.equal(requests.length,0,`Early demo download ${route}`);page.off('request',listener);
   if(route!=='/'){await page.locator('a[href="#demo"]').click();await page.waitForTimeout(400);await page.locator('.guided-demo').screenshot({path:`qa/screenshots/demo-${route.split('/')[1]}-${width}.png`});}
  }
 }
 checks.push('Three routes at 320, 390, 768, 1440px; no overflow or early demo MP4 requests');console.log(checks.at(-1));
 await page.setViewportSize({width:1440,height:1050});await page.goto(base,{waitUntil:'networkidle'});
 for(const [id,total] of [['simreview',5],['the-city-beyond',6]]){
  const opener=page.locator(`[data-demo-open="${id}"]`);await opener.click();
  assert.equal(await page.locator('#demo-dialog').evaluate(d=>d.open),true);
  assert.equal(await root.evaluate(r=>r.classList.contains('portrait')),id==='simreview');
  assert.equal(await page.locator('[data-demo-close]').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>Boolean(document.activeElement.closest('#demo-dialog'))),true);
  // Tab must remain inside the native modal, and every screenshot action has a visible equivalent.
  for(let i=0;i<24;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>Boolean(document.activeElement.closest('#demo-dialog'))),true);}
  for(let step=0;step<total;step++){
   assert.equal(await root.getAttribute('data-step'),String(step));
   if(id==='simreview'&&step===3){assert.equal(await root.locator('.demo-dialogue mark').textContent(),'shortness of breath');assert.match(await root.locator('.demo-dialogue').textContent(),/cold sweat/);assert.match(await root.locator('.demo-quote').textContent(),/Ask that part again separately/);}
   const hotspot=root.locator('.demo-hotspot');if(await hotspot.isVisible())assert.equal(await hotspot.getAttribute('aria-label'),await command(root,'action').filter({hasText:/./}).first().textContent().catch(()=>''));
   await root.locator('.demo-action').click();
   await page.waitForFunction(()=>{const r=document.querySelector('#demo-dialog .guided-demo');return !r.classList.contains('has-footage')&&r.querySelector('.demo-error').hidden;},{},{timeout:25000}).catch(async()=>{
    assert.equal(await root.locator('.demo-error').isVisible(),false);assert.equal(await root.locator('video').evaluate(v=>v.ended),true);
   });
   assert.equal(await root.locator('.demo-error').isVisible(),false);
   assert.equal(await root.evaluate(r=>r.classList.contains('has-outcome')),true);
   const previous=await root.getAttribute('data-step');await page.waitForTimeout(250);assert.equal(await root.getAttribute('data-step'),previous);
   if(step===total-1)await page.screenshot({path:`qa/screenshots/demo-${id}-finished.png`});
   await command(root,'next').click();
  }
  assert.equal(await root.locator('.demo-complete').isVisible(),true);
  if(id==='simreview'){
   await command(root,'extra').click();assert.equal(await root.getAttribute('data-extra'),'true');
   assert.match(await root.locator('.demo-body').textContent(),/different recorded session/i);
   assert.match(await root.locator('.demo-quote').textContent(),/Opening.*0:12/s);
   await root.locator('.demo-action').click();await page.waitForFunction(()=>document.querySelector('#demo-dialog video').ended).catch(async error=>{console.log(await root.evaluate(r=>({status:r.querySelector('.demo-status').textContent,playing:r.dataset.playing,time:r.querySelector('video').currentTime})));throw error;});
   await root.screenshot({path:'qa/screenshots/demo-hebrew.png'});
   await command(root,'back').click();assert.equal(await root.getAttribute('data-extra'),'false');
  }
  await command(root,'back').click();assert.equal(await root.getAttribute('data-step'),String(total-2));
  await command(root,'replay').click();await page.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);
  await command(root,'play').click();assert.equal(await root.locator('video').evaluate(v=>v.paused),true);
  await command(root,'restart').click();assert.equal(await root.getAttribute('data-step'),'0');assert.equal(await root.locator('video').getAttribute('src'),null);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#demo-dialog').evaluate(d=>d.open),false);assert.equal(await opener.evaluate(el=>document.activeElement===el),true);
  checks.push(`${id}: complete manual journey, hold outcomes, Back, Replay, Pause, Restart, Escape and focus return`);console.log(checks.at(-1));
 }
 // Reusing the modal must tear down old handlers, media, and project styling.
 for(let cycle=0;cycle<2;cycle++)for(const id of ['simreview','the-city-beyond']){
  await page.locator(`[data-demo-open="${id}"]`).click();
  assert.equal(await root.evaluate(r=>r.classList.contains('portrait')),id==='simreview');
  await root.locator('[data-step="1"]').click();await root.locator('.demo-action').click();
  await page.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);
  assert.match(await root.locator('video').getAttribute('src'),id==='simreview'?/sim-record\.mp4$/:/city-bronze\.mp4$/);
  await command(root,'play').click();assert.equal(await root.getAttribute('data-playing'),'false');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#demo-dialog video'));
  assert.equal(await page.locator('#demo-dialog video').count(),0);
 }
 checks.push('Repeated dialog openings keep the right project and remove previous playback handlers');
 const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const phone=await touch.newPage();
 phone.on('pageerror',e=>errors.push(e.message));await phone.goto(base,{waitUntil:'networkidle'});
 for(const id of ['simreview','the-city-beyond']){
  await phone.locator(`[data-demo-open="${id}"]`).tap();const demo=phone.locator('#demo-dialog .guided-demo');
  await command(demo,'watch').tap();await phone.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);
  await command(demo,'play').tap();assert.equal(await demo.getAttribute('data-playing'),'false');
  await phone.locator('[data-demo-close]').tap();await phone.waitForFunction(()=>!document.querySelector('#demo-dialog video'));
 }
 await touch.close();checks.push('Touch activation, playback, pause and close work at 390px');
 // Media failure stays usable and retry recovers.
 await page.route('**/demos/sim-record.mp4',route=>route.abort());await page.locator('[data-demo-open="simreview"]').click();
 await root.locator('[data-step="1"]').click();await root.locator('.demo-action').click();await root.locator('.demo-error').waitFor({state:'visible'});
 await page.waitForFunction(()=>{const img=document.querySelector('#demo-dialog .demo-still');return img.complete&&img.naturalWidth>0;});
 await page.unroute('**/demos/sim-record.mp4');await command(root,'retry').click();await page.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);
 await page.keyboard.press('Escape');checks.push('Failed media shows recorded still, explanation and working retry');
 // Closing immediately while a play promise is pending cancels the request and future playback.
 await page.locator('[data-demo-open="the-city-beyond"]').click();await command(root,'watch').click();await page.keyboard.press('Escape');await page.waitForTimeout(300);
 assert.equal(await page.locator('#demo-dialog video').count(),0);checks.push('Closing during activation cancels playback');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/simreview/',{waitUntil:'networkidle'});
 const embedded=page.locator('[data-demo-embed]');await embedded.scrollIntoViewIfNeeded();const reducedRequests=[];page.on('request',req=>{if(/\/demos\/.*\.mp4/.test(req.url()))reducedRequests.push(req.url());});
 await command(embedded,'watch').click();await page.waitForTimeout(600);assert.equal(reducedRequests.length,0);assert.equal(await embedded.locator('video').getAttribute('src'),null);
 await command(embedded,'play').click();await embedded.locator('[data-step="3"]').click();await embedded.locator('.demo-action').click();assert.equal(await embedded.evaluate(r=>r.classList.contains('has-outcome')),true);
 checks.push('Reduced motion uses the same interactive steps and stills, without video requests');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'/the-city-beyond/',{waitUntil:'networkidle'});const inline=page.locator('[data-demo-embed]');await inline.scrollIntoViewIfNeeded();
 await command(inline,'watch').click();await page.waitForFunction(()=>document.querySelector('[data-demo-embed]').dataset.playing==='true');
 await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-demo-embed]').dataset.playing==='false',{},{timeout:3000});assert.equal(await inline.locator('video').evaluate(v=>v.paused),true);
 await inline.scrollIntoViewIfNeeded();await command(inline,'play').click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await inline.getAttribute('data-playing'),'false');
 await page.evaluate(()=>{delete document.hidden;});checks.push('Offscreen pause and simulated hidden-tab pause stop video and sequence timer');
 // Two real-time, one-shot watch-throughs in independent browser pages.
 for(const id of ['simreview','the-city-beyond']){
  const p=await browser.newPage({viewport:{width:1440,height:1050}});p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/'+id+'/',{waitUntil:'networkidle'});
  const demo=p.locator('[data-demo-embed]');await demo.scrollIntoViewIfNeeded();const begin=Date.now();await command(demo,'watch').click();
  await demo.locator('.demo-complete').waitFor({state:'visible',timeout:65000});const elapsed=(Date.now()-begin)/1000;
  assert.ok(elapsed>=(id==='simreview'?35:45)&&elapsed<=(id==='simreview'?45:60),`${id} duration ${elapsed}`);
  const step=await demo.getAttribute('data-step');await p.waitForTimeout(350);assert.equal(await demo.getAttribute('data-step'),step);assert.equal(await demo.locator('video').evaluate(v=>v.paused),true);
  checks.push(`${id}: watch-through ${elapsed.toFixed(1)}s, stops once at completion`);await p.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors},null,2));await writeFile('qa/demo-report.json',JSON.stringify({checks,errors},null,2));
}finally{await browser.close();}
