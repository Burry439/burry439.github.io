import React,{useLayoutEffect,useRef} from 'react';
import {registerRoot,Composition,AbsoluteFill,Sequence,Freeze,OffthreadVideo,Img,staticFile,useCurrentFrame,interpolate,Easing,delayRender,continueRender} from 'remotion';
import {demos} from '../../src/demos.mjs';
import provenance from '../../public/demos/provenance.json';
import {direction} from './direction.mjs';
const fps=24;
const fontReady=delayRender('General Sans');
const face=new FontFace('General Sans',`url(${staticFile('assets/general-sans-500.woff2')})`);
face.load().then(f=>{document.fonts.add(f);continueRender(fontReady);}).catch(()=>continueRender(fontReady));
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'};
const ease=Easing.bezier(.22,1,.36,1);
function value(keys,time,column,easing){
 if(keys.length===1)return keys[0][column];
 return interpolate(time,keys.map(k=>k[0]),keys.map(k=>k[column]),{...clamp,...(easing?{easing}: {})});
}
function current(keys,time){return [...keys].reverse().find(k=>time>=k[0])||keys[0];}
function Emphasis({text,highlight}){
 if(!highlight||!text.includes(highlight))return text;
 const [a,b]=text.split(highlight);return <>{a}<span style={{background:'#d1e8ee',borderRadius:4,padding:'0 3px'}}>{highlight}</span>{b}</>;
}
function Chapter({step,index,demo,mobile,id}){
 const frame=useCurrentFrame(),seconds=frame/fps,sim=id==='simreview',shot=direction[id][index];
 const stage=mobile?{x:32,y:82,w:656,h:520}:sim?{x:48,y:82,w:600,h:562}:{x:32,y:76,w:1216,h:514};
 const sourceW=sim?624:1280,sourceH=sim?1350:720;
 const fitWidth=Math.max(1,stage.w/sourceW/(stage.h/sourceH));
 const camera=shot.camera.map(k=>[k[0],k[1],k[2],k[3]==='fit'?fitWidth:k[3]]);
 const scale=stage.w/(sourceW*value(camera,seconds,3,ease));
 // Keep the source edges in frame: moving towards the lower log must not
 // reveal an empty strip below the game or crop the first word of a line.
 const bounded=(center,pixels,extent)=>pixels<=extent?.5:Math.max(extent/(2*pixels),Math.min(1-extent/(2*pixels),center));
 const left=stage.w/2-sourceW*scale*bounded(value(camera,seconds,1,ease),sourceW*scale,stage.w);
 const top=stage.h/2-sourceH*scale*bounded(value(camera,seconds,2,ease),sourceH*scale,stage.h);
 const clipDuration=provenance.exports.find(e=>e.output===step.clip)?.duration||0;
 const mediaTime=shot.media?value(shot.media,seconds,1):seconds;
 const videoFrame=Math.min(Math.round(mediaTime*fps),Math.max(0,Math.floor(clipDuration*fps)-1));
 const returning=shot.returnToFeedback!==undefined&&seconds>=shot.returnToFeedback;
 const dialogue=step.dialogue||[],dialogueUntil=shot.returnToFeedback??step.seconds;
 // Hold a spoken line through the gap before the next speaker. Returning to
 // the chapter introduction in those gaps would create a distracting flash.
 const spoken=[...dialogue].reverse().find(l=>seconds>=l.s)||(index===1?dialogue[0]:null);
 const line=seconds<dialogueUntil?spoken:null;
 const caption=current(shot.caption,seconds)[1];
 const style={position:'absolute',width:sourceW*scale,height:sourceH*scale,maxWidth:'none',left,top};
 // The final coaching shot is an editorial cut to the recorded feedback screen,
 // rather than an invented navigation interaction.
 const still=returning?'sim-moment-before.webp':step.before;
 const setupStill=shot.still&&seconds>=shot.still.from?shot.still.file:null;
 const focus=sim&&index===3&&(seconds<1.5||returning)?{x:.106,y:.327,w:.784,h:.205}:sim&&index===4?{x:.18,y:.328,w:.66,h:.05}:null;
 const focusOpacity=interpolate(seconds,[0,.2],[0,1],clamp);
 // A chapter has one qualification beside its main caption. The full source
 // and omitted-wait explanations also remain in the transcript.
 const note=line?null:(shot.note?seconds>=(shot.noteFrom||0)?shot.note:null:step.note&&seconds>1?step.note:null);
 const attribution=line?`${line.who} · recorded interview`:returning?'Feedback at 2:13':!sim&&shot.speaker!==undefined&&seconds>=shot.speaker?'Recorded game response':null;
 const captionRef=useRef(null);
 useLayoutEffect(()=>{
  // Offset measurements are in composition pixels, independent of the
  // preview scale and the temporary zero-height root used in discovery.
  const text=captionRef.current;
  if(text.offsetTop+text.offsetHeight>(mobile?960-42:720-3))throw new Error(`${id}/${mobile?'mobile':'desktop'} chapter ${index+1} at ${seconds}s: caption extends beyond its reading area`);
 },[frame,id,index,mobile,seconds]);
 return <AbsoluteFill style={{background:sim?'#ecf1f3':'#20271e',color:sim?'#173543':'#f8f2e2',fontFamily:'General Sans'}}>
  <div style={{position:'absolute',top:26,left:mobile?32:48,right:mobile?32:48,display:'flex',justifyContent:'space-between',fontSize:mobile?24:20}}><span>{demo.name}</span><span style={{opacity:.7}}>{index+1} / {demo.steps.length} · {step.title}</span></div>
  <div data-review="stage" style={{position:'absolute',left:stage.x,top:stage.y,width:stage.w,height:stage.h,overflow:'hidden',borderRadius:14,background:sim?'#dfe7eb':'#141911'}}>
   {step.clip&&!returning?<Freeze frame={videoFrame}><OffthreadVideo muted src={staticFile('demos/'+step.clip)} style={style}/></Freeze>:<Img src={staticFile(setupStill||'demos/'+still)} style={style}/>}
   {focus&&<div style={{position:'absolute',pointerEvents:'none',left:left+focus.x*sourceW*scale,top:top+focus.y*sourceH*scale,width:focus.w*sourceW*scale,height:focus.h*sourceH*scale,border:'3px solid #35809a',borderRadius:10,opacity:focusOpacity,boxShadow:'0 0 0 999px #17354320'}}/>}
  </div>
  <div ref={captionRef} data-review="caption" style={{position:'absolute',left:mobile?32:sim?704:48,top:mobile?630:sim?180:605,width:mobile?656:sim?528:1184}}>
   {attribution&&<div style={{fontSize:mobile?22:sim?19:17,marginBottom:mobile?14:sim?18:10,opacity:.7}}>{attribution}</div>}
   <div style={{fontSize:mobile?48:sim?42:32,lineHeight:1.28,letterSpacing:'-.025em'}}><Emphasis text={line?line.text:caption} highlight={line?.highlight}/></div>
   {note&&<div style={{fontSize:mobile?22:sim?18:17,lineHeight:1.4,marginTop:mobile?14:sim?20:10,opacity:.7}}>{note}</div>}
  </div>
  {mobile&&<div style={{position:'absolute',bottom:20,left:32,right:32,fontSize:17,opacity:.7}}>{demo.label}</div>}
 </AbsoluteFill>;
}
function Film({id,mobile}){
 const demo=demos[id];return <AbsoluteFill>{demo.steps.map((step,i)=><Sequence key={i} from={step.start*fps} durationInFrames={step.seconds*fps}><Chapter step={step} index={i} demo={demo} mobile={mobile} id={id}/></Sequence>)}</AbsoluteFill>;
}
function Root(){return <>{Object.entries(demos).flatMap(([id,d])=>['desktop','mobile'].map(format=><Composition key={id+format} id={`${id}-${format}`} component={Film} defaultProps={{id,mobile:format==='mobile'}} width={d.films[format].width} height={d.films[format].height} fps={fps} durationInFrames={d.totalSeconds*fps}/>))}</>;}
registerRoot(Root);

