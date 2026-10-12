import {readFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {demos} from '../src/demos.mjs';
const manifest=JSON.parse(await readFile('public/demos/provenance.json','utf8'));
for(const record of manifest.exports){
 assert.equal((await stat(`public/demos/${record.output}`)).size,record.bytes,`${record.output}: outdated provenance`);
 for(const cut of record.cuts||[])assert.ok(cut.start>=0&&cut.end>cut.start&&cut.end<=cut.sourceDuration,`${record.output}: source timestamps out of bounds`);
}
const sizes={};
for(const [id,demo] of Object.entries(demos)){
 const files=new Set();const runtime=demo.steps.reduce((total,s)=>total+s.seconds,0);
 assert.ok(runtime>=(id==='simreview'?35:45)&&runtime<=(id==='simreview'?45:60));
 assert.equal(demo.duration,`${runtime} seconds`);
 for(const step of [...demo.steps,...(demo.extra?[demo.extra]:[])]){
  assert.ok(step.title&&step.body&&step.action&&step.outcome&&step.before&&step.after);
  if(step.hotspot)for(const key of ['x','y'])assert.ok(step.hotspot[key]>=0&&step.hotspot[key]<=1,'Invalid normalized hotspot');
  for(const key of ['before','after','clip'])if(step[key]){files.add(step[key]);assert.ok((await stat(`dist/demos/${step[key]}`)).size>0);}
  if(step.clip){const record=manifest.exports.find(r=>r.output===step.clip);assert.ok(record,'Missing source provenance');assert.ok(record.silent);assert.ok(record.duration<=step.seconds+.1,'Step would cut footage short');for(const line of step.dialogue||[]){assert.ok(line.s>=0&&line.e>line.s&&line.e<=record.duration,'Dialogue outside exported clip');if(line.highlight)assert.ok(line.text.includes(line.highlight),'Highlight missing from dialogue');}}
 }
 sizes[id]=0;for(const file of files)sizes[id]+=(await stat(`dist/demos/${file}`)).size;
 assert.ok(sizes[id]<8_000_000,`${id} media exceeds 8MB`);
}
console.log('Checked source cut bounds, exported files, step timing, hotspots and media budgets:',sizes);
