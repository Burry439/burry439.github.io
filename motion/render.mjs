// Build-only renderer. Exported MP4s and chapter stills are committed; Pages needs no React.
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {resolve} from 'node:path';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {demos} from '../src/demos.mjs';
const selected=process.argv.slice(2);
const url=await bundle({entryPoint:resolve('src/index.jsx'),publicDir:resolve('../public')});
const source=JSON.parse(await readFile('../public/demos/provenance.json','utf8'));
const records=[];
for(const [id,d] of Object.entries(demos))for(const format of ['desktop','mobile']){
 const name=`${id}-${format}`;if(selected.length&&!selected.includes(name))continue;
 const composition=await selectComposition({serveUrl:url,id:name});
 const file=resolve('../public/demos/'+d.films[format].file);
 await renderMedia({serveUrl:url,composition,outputLocation:file,codec:'h264',crf:26,pixelFormat:'yuv420p',concurrency:2,muted:true,onProgress:({progress})=>{if(Math.floor(progress*100)%20===0)process.stdout.write('.');}});
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file],{encoding:'utf8'}));
 const stills=[];
 for(const [i,s] of d.steps.entries())for(const state of ['before','after']){
  const frame=state==='before'?Math.round(s.start*24):Math.round(s.end*24)-1;
  const poster=resolve('../public/demos/'+s.posters[format][state]);
  // PNG render then WebP conversion preserves readable UI and minimizes transfers.
  const temp=poster+'.png';await renderStill({serveUrl:url,composition,output:temp,frame,imageFormat:'png'});
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',temp,'-quality','82',poster]);
  const {unlink}=await import('node:fs/promises');await unlink(temp);
  stills.push({output:s.posters[format][state],frame,bytes:(await stat(poster)).size});
 }
 const cuts=d.steps.flatMap(s=>source.exports.find(e=>e.output===s.clip)?.cuts||[]);
 const record={output:d.films[format].file,composition:name,duration:Number(probe.format.duration),bytes:(await stat(file)).size,silent:!probe.streams.some(s=>s.codec_type==='audio'),stills,cuts};records.push(record);
 console.log(`\n${name}: ${(record.bytes/1e6).toFixed(2)}MB, ${record.duration}s`);
 const manifestPath='../public/demos/films-provenance.json';
 let existing=[];try{existing=JSON.parse(await readFile(manifestPath,'utf8')).exports;}catch{}
 await writeFile(manifestPath,JSON.stringify({description:'Remotion product films made from duration-validated capture exports. Chapter sources and source timestamps are retained. No sound; synthetic English session and recorded gameplay.',exports:[...existing.filter(r=>r.output!==record.output),record]},null,2)+'\n');
}
