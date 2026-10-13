// Smoke-check the published Pages site, including media byte ranges and both promos.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
const base=process.env.QA_URL||'https://baruchweinstein.com';
await mkdir('qa/screenshots',{recursive:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 for(const route of ['/','/simreview/','/the-city-beyond/']){
  const early=[];const listener=req=>{if(/\/demos\/.*\.mp4/.test(req.url()))early.push(req.url());};page.on('request',listener);
  assert.equal((await page.goto(base+route,{waitUntil:'networkidle'})).status(),200);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),base+route);
  assert.equal(early.length,0);page.off('request',listener);
  assert.ok(await page.locator(route==='/'?'[data-demo-open]':'[data-demo-embed] .demo-action').count());
 }
 const media=await page.evaluate(async()=>{
  const {demos}=await import('/demo-data.js');const files=new Set();
  for(const demo of Object.values(demos))for(const step of [...demo.steps,...(demo.extra?[demo.extra]:[])])for(const key of ['before','after','clip'])if(step[key])files.add(step[key]);
  return Promise.all([...files].map(async file=>{
   const clip=file.endsWith('.mp4');const res=await fetch('/demos/'+file,clip?{headers:{Range:'bytes=0-1023'}}:{});
   const length=(await res.arrayBuffer()).byteLength;
   return {file,status:res.status,range:res.headers.get('content-range'),length,type:res.headers.get('content-type')};
  }));
 });
 for(const item of media){assert.equal(item.status,item.file.endsWith('.mp4')?206:200,item.file);assert.ok(item.length>0);if(item.file.endsWith('.mp4'))assert.match(item.range,/bytes 0-1023\/\d+/);}
 await page.goto(base,{waitUntil:'networkidle'});
 for(const id of ['simreview','the-city-beyond']){
  await page.locator(`[data-demo-open="${id}"]`).click();const root=page.locator('#demo-dialog .guided-demo');
  await root.locator('[data-step="1"]').click();await root.locator('.demo-action').click();
  await page.waitForFunction(()=>document.querySelector('#demo-dialog video').currentTime>0);
  assert.equal(await root.locator('.demo-error').isVisible(),false);
  await page.screenshot({path:`qa/screenshots/live-${id}-demo.png`});await page.keyboard.press('Escape');
  await page.locator(`[data-title="${id==='simreview'?'SimReview':'The City Beyond'}"][data-video]`).click();
  await page.waitForFunction(()=>document.querySelector('#video-dialog video').currentTime>0);
  await page.locator('#video-dialog .dialog-close').click();assert.equal(await page.locator('#video-dialog video').evaluate(v=>v.paused),true);
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/simreview/',{waitUntil:'networkidle'});
 await page.locator('a[href="#demo"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'qa/screenshots/live-mobile-demo.png'});
 assert.deepEqual(errors,[]);
 const report={base,routes:3,mediaFiles:media.length,clips:media.filter(m=>m.file.endsWith('.mp4')).length,checks:['Canonical URLs','No early demo video downloads','All demo media available; MP4 range requests succeed','Both dialog demos play','Both full promos play and stop on close','390px mobile layout'],errors};
 console.log(JSON.stringify(report,null,2));await writeFile('qa/public-report.json',JSON.stringify(report,null,2));
}finally{await browser.close();}
