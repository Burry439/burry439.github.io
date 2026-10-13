import {readFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {demos} from '../src/demos.mjs';
import {direction} from '../motion/src/direction.mjs';
const source=JSON.parse(await readFile('public/demos/provenance.json','utf8'));
const films=JSON.parse(await readFile('public/demos/films-provenance.json','utf8'));
for(const r of source.exports)for(const cut of r.cuts||[])assert.ok(cut.start>=0&&cut.end>cut.start&&cut.end<=cut.sourceDuration,`${r.output}: invalid source cut`);
const sizes={};
for(const [id,demo] of Object.entries(demos)){
 assert.equal(demo.totalSeconds,id==='simreview'?43:52);let end=0;
 for(const s of demo.steps){assert.equal(s.start,end);assert.equal(s.end,s.start+s.seconds);end=s.end;assert.ok(s.heading&&s.caption&&s.action);for(const format of ['desktop','mobile']){const spot=s.hotspots[format];if(spot)for(const key of ['x','y'])assert.ok(spot[key]>=0&&spot[key]<=1);}}
 assert.equal(end,demo.totalSeconds);
 for(const [index,step] of demo.steps.entries()){
  const shot=direction[id][index],capture=source.exports.find(r=>r.output===step.clip);
  for(const line of step.filmNarration)assert.ok(line.at>=0&&line.at<step.seconds,`${id}: caption outside chapter`);
  let previousTime=-1,previousSource=-1;
  for(const [at,sourceTime] of shot.media||[]){
   assert.ok(at>previousTime&&at<=step.seconds,`${id}: invalid reading-hold timing`);
   assert.ok(capture&&sourceTime>=previousSource&&sourceTime<=capture.duration,`${id}: reading hold outside recorded footage or reverses it`);
   previousTime=at;previousSource=sourceTime;
  }
 }
 for(const [format,asset] of Object.entries(demo.films)){
  const r=films.exports.find(r=>r.output===asset.file);assert.ok(r,`No provenance ${asset.file}`);assert.ok(r.silent);assert.ok(Math.abs(r.duration-demo.totalSeconds)<.05);assert.equal((await stat('public/demos/'+asset.file)).size,r.bytes);
  assert.deepEqual(r.direction,direction[id],`${id}/${format}: re-render after changing film direction`);
  let bytes=r.bytes;
  for(const still of r.stills){assert.equal((await stat('public/demos/'+still.output)).size,still.bytes);assert.ok(still.frame>=0&&still.frame<demo.totalSeconds*24);bytes+=still.bytes;}
  for(const cut of r.cuts)assert.ok(cut.start>=0&&cut.end>cut.start&&cut.end<=cut.sourceDuration);
  if(demo.extra)for(const key of ['clip','before','after'])bytes+=(await stat('public/demos/'+demo.extra[key])).size;
  assert.ok(bytes<8_000_000,`${id}/${format}: ${bytes} exceeds budget`);sizes[`${id}/${format}`]=bytes;
  assert.equal(r.stills.length,demo.steps.length*2);
 }
}
console.log('Validated film timings, continuous chapters, original source bounds, stills, silent exports and <8MB rendition budgets:',sizes);
