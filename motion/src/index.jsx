import React from 'react';
import {registerRoot,Composition,AbsoluteFill,Sequence,Freeze,OffthreadVideo,Img,staticFile,useCurrentFrame,interpolate,delayRender,continueRender} from 'remotion';
import {demos} from '../../src/demos.mjs';
import provenance from '../../public/demos/provenance.json';
const fps=24;
const fontReady=delayRender('General Sans');
const face=new FontFace('General Sans',`url(${staticFile('assets/general-sans-500.woff2')})`);
face.load().then(f=>{document.fonts.add(f);continueRender(fontReady);}).catch(()=>continueRender(fontReady));
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'};
function Chapter({step,index,demo,mobile}){
 const frame=useCurrentFrame();const sim=demo.name==='SimReview';
 const w=mobile?640:740,h=mobile?410:548;
 const sourceW=sim?624:1280,sourceH=sim?1350:720;
 const fit=Math.min(w/sourceW,h/sourceH);
 const zoom=sim?(index===4?2.2:index===2||index===3?2.0:1.3):(index===3?1.16:1.08);
 const scale=fit*interpolate(frame,mobile?[12,48]:[24,60],[mobile&&sim&&index===4?1.75:1,zoom],clamp);
 const cy=sim?(index===4?.25:index===2||index===3?.38:.49):.5;
 const center=interpolate(frame,[24,60],[.5,cy],clamp);
 const clipDuration=provenance.exports.find(e=>e.output===step.clip)?.duration||0;
 const videoFrame=Math.min(frame,Math.max(0,Math.floor(clipDuration*fps)-1));
 const line=(step.dialogue||[]).find(l=>frame/fps>=l.s&&frame/fps<l.e);
 const color=sim?'#234f60':'#d6c79b';
 const heading=step.heading;
 const mobileCaption=(sim?[
  'Interview a helper playing the patient. AI reviews the recording afterwards.',
  'A fictional chest-pain interview.',
  'Replay the moments behind strengths and improvements.',
  'The breathing question goes unanswered. Ask it again separately.',
  'Selected: explore the acute complaint first. A separate item from the breathing follow-up.'
 ]:[
  'The watch needs a way to navigate. Can a compass get you inside?',
  'The player types a method to magnetise a bronze needle.',
  'Bronze cannot be magnetised this way. Change the material.',
  'Iron works. The floating needle becomes an illustrated object.',
  'The captain asks for proof. Test the heading.',
  '“It holds its heading… You may pass, stranger.” The player enters.'
 ])[index];
 const style={position:'absolute',width:sourceW*scale,height:sourceH*scale,maxWidth:'none',left:(w-sourceW*scale)/2,top:h/2-sourceH*scale*center};
 const fullframe=frame/fps;
 // Keep one quoted exchange readable, without replacing any recorded outcome.
 const quote=line?`${line.who}: ${line.text}`:index===3&&sim&&fullframe>10.15?'Coach: Ask the breathing question again separately.':null;
 return <AbsoluteFill style={{background:sim?'#ecf1f3':'#22291f',color:sim?'#173543':'#f8f2e2',fontFamily:'General Sans',padding:mobile?40:48}}>
  <div style={{display:'flex',justifyContent:'space-between',fontSize:mobile?23:21,alignItems:'center'}}><span>{demo.name}</span><span style={{opacity:.7}}>{String(index+1).padStart(2,'0')} / {demo.steps.length}</span></div>
  <div style={{position:'absolute',left:mobile?40:48,top:mobile?98:110,width:w,height:h,overflow:'hidden',borderRadius:18,background:sim?'#dfe7eb':'#151a12',boxShadow:'0 12px 35px #0002'}}>
   {step.clip?<Freeze frame={videoFrame}><OffthreadVideo muted src={staticFile('demos/'+step.clip)} style={style}/></Freeze>:<Img src={staticFile('demos/'+step.before)} style={style}/>}
  </div>
  <div style={{position:'absolute',left:mobile?40:836,top:mobile?548:125,width:mobile?640:394}}>
   <div style={{fontSize:mobile?44:38,lineHeight:1.15,letterSpacing:'-.025em',marginBottom:mobile?18:24}}>{heading}</div>
   {(!mobile||!quote)&&<div style={{fontSize:mobile?42:25,lineHeight:1.4,opacity:.88}}>{mobile?mobileCaption:step.caption}</div>}
   {quote&&<div style={{fontSize:mobile?40:24,lineHeight:1.4,marginTop:mobile?16:28,paddingTop:14,borderTop:`2px solid ${color}`}}>{quote}</div>}
   {step.note&&!quote&&<div style={{fontSize:mobile?21:19,lineHeight:1.3,marginTop:20,opacity:.7}}>{step.note}</div>}
  </div>
  <div style={{position:'absolute',bottom:mobile?18:24,left:mobile?40:48,right:40,fontSize:mobile?18:17,opacity:.7}}>{demo.label}</div>
 </AbsoluteFill>;
}
function Film({id,mobile}){
 const demo=demos[id];return <AbsoluteFill>{demo.steps.map((step,i)=><Sequence key={i} from={step.start*fps} durationInFrames={step.seconds*fps}><Chapter step={step} index={i} demo={demo} mobile={mobile}/></Sequence>)}</AbsoluteFill>;
}
function Root(){return <>{Object.entries(demos).flatMap(([id,d])=>['desktop','mobile'].map(format=><Composition key={id+format} id={`${id}-${format}`} component={Film} defaultProps={{id,mobile:format==='mobile'}} width={d.films[format].width} height={d.films[format].height} fps={fps} durationInFrames={d.totalSeconds*fps}/>))}</>;}
registerRoot(Root);

