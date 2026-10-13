// Normalized hotspot coordinates refer to the exported (cropped) media frame.
// Quotes and session dialogue come from each project's original promo capture plan.
import {direction} from '../motion/src/direction.mjs';
const media=(name)=>({clip:`${name}.mp4`,before:`${name}-before.webp`,after:`${name}-after.webp`});
export const demos={
 simreview:{
  name:'SimReview',title:'SimReview: practice and feedback',duration:'43 seconds',
  label:'AI-voiced example interview · real app footage',kind:'portrait',
  introduction:'Explore a fictional interview, inspect the source of its feedback, and choose what to practice next.',
  steps:[
   {title:'Choose the example',seconds:6,before:'sim-case.webp',after:'sim-record-before.webp',action:'Choose chest-pain example',hotspot:{x:.35,y:.73},
    body:'A fictional chest-pain case. The learner interviews a helper playing the patient; the helper holds the phone and follows the case guide.',
    outcome:'The helper follows the guide; the student conducts the interview. AI reviews their recording afterwards.'},
   {title:'Record a practice',seconds:8,...media('sim-record'),action:'Play recorded interview',
    body:'Watch a short excerpt from this English example. The dialogue below is the recorded exchange, shown without sound.',
    dialogue:[{s:.231,e:2.711,who:'Learner',text:'How would you describe the feeling itself?'},{s:3.473,e:5.713,who:'Patient',text:'A heavy, squeezing pressure.'}],
    outcome:'The recording becomes the source for the review. This excerpt starts at 1:14 in the example interview.'},
   {title:'Inspect feedback',seconds:5,...media('sim-feedback'),action:'Reveal the feedback',
    body:'The review links strengths and suggested improvements to the recording. Select a timestamp to check the exchange behind a recommendation.',
    note:'Processing time omitted',outcome:'The 2:13 feedback flags an unanswered breathing question.'},
   {title:'Follow-up · 2:13',seconds:16,...media('sim-moment'),action:'Select Follow-up · 2:13',hotspot:{x:.5,y:.429},
    body:'Replay the cited moment. The patient answers about nausea and sweating, but the shortness-of-breath question goes unanswered.',
    dialogue:[{s:2.15,e:7.27,who:'Learner',text:'Are you feeling anything else, like nausea, sweating, or shortness of breath?',highlight:'shortness of breath'},{s:7.94,e:11.62,who:'Patient',text:"I feel sick, and I’ve been sweating. A cold sweat."}],
    quote:'Nausea and sweating are established, but the patient does not answer about shortness of breath. Ask that part again separately.',
    quoteLabel:'Actual app coaching · unanswered shortness-of-breath question',
    outcome:'The patient mentions nausea and sweating. The breathing question needs a separate follow-up.'},
   {title:'Choose the next-practice focus',seconds:8,...media('sim-focus'),action:'Select the next-practice focus',hotspot:{x:.409,y:.349},
    body:'The student selects “Explore the acute complaint before extended demographic questions.” The app saves it for another attempt. This concerns interview order, separate from the breathing follow-up.',
    outcome:'The selected focus is saved for the next practice.'},
  ],
  extra:{title:'A separate Hebrew example',seconds:9,...media('sim-hebrew'),action:'Play Hebrew example',
   body:'A different recorded session: a fictional ectopic-pregnancy case. It demonstrates the same source-linked review in Hebrew.',
   quote:'Opening: inviting the patient to describe the problem in her own words gave her room to present the main complaint.',
   quoteLabel:'English explanation of the Hebrew coaching · Opening, 0:12',
   outcome:'The interview, score and coaching belong to this separate Hebrew session.'},
 },
 'the-city-beyond':{
  name:'The City Beyond',title:'The City Beyond: inventing a compass',duration:'52 seconds',kind:'landscape',
  label:'Guided replay of recorded gameplay',
  introduction:'Try a recorded idea, understand its failure, and see an invention change the world. These are selected examples of a free-form system.',
  steps:[
   {title:'Meet the problem',seconds:6,...media('city-need'),action:'Reveal the watch’s problem',
    body:'You arrive from the future outside a guarded city. The watch needs a reliable way to navigate in fog. Can your knowledge earn you a way in?',
    quote:'In thick fog we lose the track on the moor. We have no reliable way to hold a heading.',quoteLabel:'Elin · watch scout',
    outcome:'An opportunity: make a compass that helps the watch hold a heading.'},
   {title:'Try bronze',seconds:7,...media('city-bronze'),action:'Try the recorded bronze attempt',hotspot:{x:.547,y:.757},
    body:'Choose the recorded attempt to magnetise a bronze needle. In the full game, players type their own methods rather than choosing from this demo’s steps.',
    outcome:'The action is submitted. Next, inspect the game’s response.',note:'Waiting time omitted between attempt and response'},
   {title:'Understand the failure',seconds:6,...media('city-failure'),action:'Reveal the game’s response',
    body:'The game checks the idea against the materials. An appealing idea does not guarantee success.',
    quote:'…bronze cannot be magnetised this way, so it will not serve as a compass.',quoteLabel:'Recorded game explanation',
    outcome:'The explanation gives you a reason to change your method: use iron.'},
   {title:'Switch to iron',seconds:10,...media('city-iron'),action:'Try iron and assemble the compass',
    body:'Iron becomes weakly magnetised. The player then assembles the floating needle; the invention receives generated artwork and becomes a usable object.',
    quote:'The iron becomes weakly magnetised.',quoteLabel:'Recorded game response',note:'Selected results; processing time omitted',
    outcome:'The floating needle is saved as an inventory object.'},
   {title:'Demonstrate the invention',seconds:10,...media('city-proof'),action:'Show the captain and test the heading',
    body:'Oren brings the invention to Captain Roderic’s attention. The captain asks for evidence; the player demonstrates whether it holds a heading.',
    quoteLabel:'Captain Roderic requests a heading test',
    note:'Selected request and test result; waiting time omitted',outcome:'The demonstration makes the invention’s usefulness observable to the watch.'},
   {title:'Enter the city',seconds:13,...media('city-enter'),action:'See the response and walk through the gate',
    body:'The captain responds to the demonstrated result. Permission changes the objective to walking through the gate. This replay ends at the boundary of the current playable area.',
    quote:'Walk through the city gate!',quoteLabel:'Recorded quest update',
    outcome:'The heading test earns permission to enter. This is recorded gameplay.'},
  ],
 },
};

// Film chapters are also the exploration source. No second set of videos is loaded.
const editorial={
 simreview:[
  ['Record a practice interview','A helper follows the patient guide. The recording is reviewed by AI afterwards.','View the recording setup'],
  ['Interview excerpt','A recorded exchange from the fictional chest-pain case.','Play the interview'],
  ['Review the feedback','Strengths and suggested improvements link to moments in the recording.','Show the feedback'],
  ['Replay the 2:13 follow-up','The patient answers about nausea and sweating, leaving the breathing question unanswered.','Replay 2:13'],
  ['Select a practice focus','Save the interview-order recommendation for another attempt. This is separate from the breathing follow-up.','Replay the focus selection']
 ],
 'the-city-beyond':[
  ['The navigation problem','The watch needs a way to hold a heading in fog. The player proposes a compass.','Read the watch’s request'],
  ['The bronze attempt','The player types a method to magnetise a bronze needle.','Replay the bronze attempt'],
  ['The failed attempt','“Bronze cannot be magnetised this way, so it will not serve as a compass.”','Read the response'],
  ['The iron compass','The iron becomes weakly magnetised. The assembled floating needle receives generated artwork.','Replay the iron attempt'],
  ['The heading test','The captain asks for proof. The needle returns to the same heading with the lodestone several paces away.','Replay the heading test'],
  ['Permission to enter','The captain permits entry. The player walks through the gate and reaches the end of the current playable area.','Replay city entry']
 ]
};
for(const [id,demo] of Object.entries(demos)){
 let start=0;
 demo.title=id==='simreview'?'SimReview: practice and feedback':'The City Beyond: inventing a compass';
 demo.introduction=id==='simreview'?'A recorded example of the interview, review and next-practice selection.':'A recorded invention attempt, heading test and entry into the city.';
 demo.label=id==='simreview'?'AI-voiced example interview · real app footage':'Guided replay of recorded gameplay';
 demo.steps.forEach((step,i)=>{
  step.start=start;start+=step.seconds;step.end=start;
  [step.heading,step.caption,step.action]=editorial[id][i];
  step.filmNarration=direction[id][i].caption.map(([at,text])=>({at,text}));
  step.title=['Setup','Interview','Feedback','2:13 follow-up','Next focus'][i]||step.title;
  if(id!=='simreview')step.title=['Fog problem','Bronze attempt','Why it fails','Iron compass','Heading test','City entry'][i];
  step.posters=Object.fromEntries(['desktop','mobile'].map(format=>[format,{before:`${id}-${format}-${i}-before.webp`,after:`${id}-${format}-${i}-after.webp`}]));
  step.hotspots={desktop:null,mobile:null};
 });
 demo.films=Object.fromEntries(['desktop','mobile'].map(format=>[format,{file:`${id}-${format}.mp4`,poster:demo.steps[0].posters[format].before,width:format==='desktop'?1280:720,height:format==='desktop'?720:960}]));
 demo.transcript=demo.steps.map((s,i)=>({start:s.start,end:s.end,title:s.heading,text:[...new Set([s.caption,...s.filmNarration.map(l=>l.text),...(s.dialogue||[]).map(l=>`${l.who}: ${l.text}`),s.quote,direction[id][i].note,s.note].filter(Boolean))].join('\n')}));
 demo.totalSeconds=start;
}
