import React,{useLayoutEffect,useRef} from 'react';
import {registerRoot,Composition,AbsoluteFill,Sequence,Freeze,OffthreadVideo,Img,staticFile,useCurrentFrame,interpolate,spring,Easing,delayRender,continueRender} from 'remotion';
import {demos} from '../../src/demos.mjs';
import provenance from '../../public/demos/provenance.json';
import {direction} from './direction.mjs';
export const fps=24;
// Chapters keep their published start times. Each chapter after the first
// fades in over the held last frame of the previous one for this long.
export const transition=.45;
const fontReady=delayRender('General Sans');
Promise.all([500,600].map(weight=>new FontFace('General Sans',`url(${staticFile(`assets/general-sans-${weight}.woff2`)})`,{weight:String(weight)}).load().then(f=>document.fonts.add(f)))).then(()=>continueRender(fontReady)).catch(()=>continueRender(fontReady));
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'};
const ease=Easing.bezier(.65,0,.35,1);
const palette={
 sim:{bg:'#eef2f3',ink:'#173543',muted:'#173543b0',stage:'#dfe7eb',bezel:'#16262e',accent:'#2f7d95',mark:'#cfe6ec',track:'#17354322'},
 city:{bg:'#1d231b',ink:'#f8f2e2',muted:'#f8f2e2b0',stage:'#141911',bezel:'#0d100b',accent:'#d8b46a',mark:'#5a4a25',track:'#f8f2e222'}
};
function value(keys,time,column,easing){
 if(keys.length===1)return keys[0][column];
 return interpolate(time,keys.map(k=>k[0]),keys.map(k=>k[column]),{...clamp,...(easing?{easing}:{})});
}
function current(keys,time){return [...keys].reverse().find(k=>time>=k[0])||keys[0];}
const pop=(frame,delay=0,config={damping:16,stiffness:170,mass:.6})=>spring({frame:frame-Math.round(delay*fps),fps,config});
// Words rise into place one after another from the moment a caption appears.
function Kinetic({text,since,frame,highlight,color}){
 const local=frame-Math.round(since*fps);
 const words=text.split(' ');
 const marked=new Set();
 if(highlight&&text.includes(highlight)){const start=text.slice(0,text.indexOf(highlight)).split(' ').length-1;highlight.split(' ').forEach((_,i)=>marked.add(start+i));}
 const sweep=interpolate(local,[words.length*.9+4,words.length*.9+16],[0,100],clamp);
 return words.map((word,i)=>{
  const p=pop(local,i*.035);
  return <span key={i} style={{display:'inline-block',whiteSpace:'pre',opacity:p,transform:`translateY(${(1-p)*14}px)`}}>
   <span style={marked.has(i)?{backgroundImage:`linear-gradient(${color},${color})`,backgroundSize:`${sweep}% 100%`,backgroundRepeat:'no-repeat',borderRadius:4,padding:'0 2px'}:null}>{word}</span>{i<words.length-1?' ':''}
  </span>;
 });
}
function Progress({demo,time,colors,mobile}){
 return <div style={{display:'flex',gap:6,marginTop:mobile?14:12}}>{demo.steps.map((s,i)=>{
  const fill=interpolate(time,[s.start,s.end],[0,100],clamp);
  return <div key={i} style={{flex:s.seconds,height:4,borderRadius:4,background:colors.track,overflow:'hidden'}}><div style={{width:`${fill}%`,height:'100%',background:colors.accent}}/></div>;
 })}</div>;
}
function Tap({x,y,since,frame,colors}){
 const local=frame-Math.round(since*fps);
 if(local<0||local>fps*1.1)return null;
 const ring=interpolate(local,[0,fps*.9],[.4,1.9],clamp),fade=interpolate(local,[0,fps*.15,fps*.9],[0,1,0],clamp);
 const dot=interpolate(local,[0,fps*.12,fps*.35,fps*.6],[0,1,.85,0],clamp);
 return <>
  <div style={{position:'absolute',left:x-34,top:y-34,width:68,height:68,borderRadius:'50%',border:`3px solid ${colors.accent}`,opacity:fade,transform:`scale(${ring})`}}/>
  <div style={{position:'absolute',left:x-15,top:y-15,width:30,height:30,borderRadius:'50%',background:colors.accent,opacity:dot*.55,boxShadow:`0 0 0 6px ${colors.accent}33`}}/>
 </>;
}
function Chapter({step,index,demo,mobile,id}){
 const frame=useCurrentFrame(),seconds=frame/fps,sim=id==='simreview',shot=direction[id][index],colors=sim?palette.sim:palette.city;
 const last=index===demo.steps.length-1,time=step.start+seconds;
 const stage=mobile?{x:32,y:104,w:656,h:500}:sim?{x:60,y:98,w:580,h:540}:{x:32,y:94,w:1216,h:496};
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
 const [captionAt,caption]=current(shot.caption,seconds);
 const style={position:'absolute',width:sourceW*scale,height:sourceH*scale,maxWidth:'none',left,top};
 // The final coaching shot is an editorial cut to the recorded feedback screen,
 // rather than an invented navigation interaction.
 const still=returning?'sim-moment-before.webp':step.before;
 const setupStill=shot.still&&seconds>=shot.still.from?shot.still.file:null;
 const focus=sim&&index===3&&(seconds<1.5||returning)?{x:.106,y:.327,w:.784,h:.205,from:returning?shot.returnToFeedback:0}:sim&&index===4?{x:.18,y:.328,w:.66,h:.05,from:0}:null;
 const focusIn=focus?pop(frame,focus.from+.15):0;
 // A chapter has one qualification beside its main caption. The full source
 // and omitted-wait explanations also remain in the transcript.
 const note=line?null:(shot.note?seconds>=(shot.noteFrom||0)?shot.note:null:step.note&&seconds>1?step.note:null);
 const attribution=line?`${line.who} · recorded interview`:returning?'Feedback at 2:13':!sim&&shot.speaker!==undefined&&seconds>=shot.speaker?'Recorded game response':null;
 const enter=index===0?1:interpolate(seconds,[0,transition],[0,1],{...clamp,easing:Easing.out(Easing.cubic)});
 const stageIn=index===0?pop(frame,0,{damping:20,stiffness:90}):1;
 const outro=last?interpolate(seconds,[step.seconds-1.6,step.seconds-1.1],[0,1],clamp):0;
 const captionRef=useRef(null);
 useLayoutEffect(()=>{
  // Offset measurements are in composition pixels, independent of the
  // preview scale and the temporary zero-height root used in discovery.
  const text=captionRef.current;
  if(text.offsetTop+text.offsetHeight>(mobile?960-46:720-3))throw new Error(`${id}/${mobile?'mobile':'desktop'} chapter ${index+1} at ${seconds}s: caption extends beyond its reading area`);
 },[frame,id,index,mobile,seconds]);
 const tap=shot.tap!==undefined&&step.hotspot?{x:left+step.hotspot.x*sourceW*scale,y:top+step.hotspot.y*sourceH*scale}:null;
 return <AbsoluteFill style={{background:colors.bg,color:colors.ink,fontFamily:'General Sans',opacity:enter}}>
  <div style={{position:'absolute',inset:0,background:sim?'radial-gradient(1200px 600px at 20% 0%,#ffffff,transparent 70%)':'radial-gradient(1100px 520px at 70% 0%,#2c3527,transparent 70%)'}}/>
  <div style={{position:'absolute',top:mobile?30:26,left:mobile?32:48,right:mobile?32:48}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',fontSize:mobile?24:19}}>
    <span style={{fontWeight:600,letterSpacing:'-.01em'}}>{demo.name}</span>
    <span style={{color:colors.muted}}>{step.title}</span>
   </div>
   <Progress demo={demo} time={time} colors={colors} mobile={mobile}/>
  </div>
  <div data-review="stage" style={{position:'absolute',left:stage.x,top:stage.y,width:stage.w,height:stage.h,overflow:'hidden',borderRadius:sim&&!mobile?30:16,background:colors.stage,boxShadow:sim&&!mobile?`0 0 0 9px ${colors.bezel},0 24px 60px #17354333`:`0 18px 50px #0000002e`,opacity:stageIn,transform:`translateY(${(1-stageIn)*24}px) scale(${.97+.03*stageIn})`,transformOrigin:'50% 60%'}}>
   {step.clip&&!returning?<Freeze frame={videoFrame}><OffthreadVideo muted src={staticFile('demos/'+step.clip)} style={style}/></Freeze>:<Img src={staticFile(setupStill||'demos/'+still)} style={style}/>}
   {focus&&<div style={{position:'absolute',pointerEvents:'none',left:left+focus.x*sourceW*scale,top:top+focus.y*sourceH*scale,width:focus.w*sourceW*scale,height:focus.h*sourceH*scale,border:`3px solid ${colors.accent}`,borderRadius:12,opacity:focusIn,transform:`scale(${1.06-.06*focusIn})`,boxShadow:`0 0 0 999px rgba(23,53,67,${.22*focusIn})`}}/>}
   {tap&&<Tap x={tap.x} y={tap.y} since={shot.tap} frame={frame} colors={colors}/>}
  </div>
  <div ref={captionRef} data-review="caption" style={{position:'absolute',left:mobile?32:sim?712:48,top:mobile?636:sim?190:612,width:mobile?656:sim?520:1184}}>
   {attribution&&<div style={{display:'inline-block',fontSize:mobile?20:sim?17:15,marginBottom:mobile?14:sim?18:9,padding:'5px 12px',borderRadius:30,background:colors.track,opacity:pop(frame,line?line.s:captionAt)}}>{attribution}</div>}
   <div style={{fontSize:mobile?46:sim?40:31,lineHeight:1.26,letterSpacing:'-.025em',fontWeight:500}}><Kinetic key={line?line.text:caption} text={line?line.text:caption} since={line?line.s:Math.max(captionAt,index===0?.25:0)} frame={frame} highlight={line?.highlight} color={colors.mark}/></div>
   {note&&<div style={{fontSize:mobile?21:sim?18:16,lineHeight:1.4,marginTop:mobile?14:sim?20:9,color:colors.muted,opacity:interpolate(frame,[Math.round(((shot.noteFrom||0)+.5)*fps),Math.round(((shot.noteFrom||0)+.9)*fps)],[0,1],clamp)}}>{note}</div>}
  </div>
  {mobile&&<div style={{position:'absolute',bottom:20,left:32,right:32,fontSize:17,color:colors.muted}}>{demo.label}</div>}
  {last&&<div style={{position:'absolute',right:mobile?32:48,bottom:mobile?54:26,padding:'10px 16px',borderRadius:30,background:colors.ink,color:colors.bg,fontSize:mobile?20:16,opacity:outro,transform:`translateY(${(1-outro)*10}px)`}}>baruchweinstein.com/{id}</div>}
 </AbsoluteFill>;
}
function Film({id,mobile}){
 const demo=demos[id];
 return <AbsoluteFill>{demo.steps.map((step,i)=>{
  const hold=i<demo.steps.length-1?transition:0;
  return <Sequence key={i} from={step.start*fps} durationInFrames={Math.round((step.seconds+hold)*fps)}><Chapter step={step} index={i} demo={demo} mobile={mobile} id={id}/></Sequence>;
 })}</AbsoluteFill>;
}
function Root(){return <>{Object.entries(demos).flatMap(([id,d])=>['desktop','mobile'].map(format=><Composition key={id+format} id={`${id}-${format}`} component={Film} defaultProps={{id,mobile:format==='mobile'}} width={d.films[format].width} height={d.films[format].height} fps={fps} durationInFrames={d.totalSeconds*fps}/>))}</>;}
registerRoot(Root);
