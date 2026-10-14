// Seconds are local to each chapter. `tap` marks when the chapter's hotspot is pressed. Media maps preserve capture order and add
// reading holds; camera coordinates refer to the complete, uncropped source.
export const direction={
 simreview:[
  {camera:[[0,.5,.5,'fit'],[2,.5,.5,'fit'],[2.6,.5,.64,1.02]],caption:[[0,'Choose a fictional patient case.'],[2,'Interview a helper following this guide.']],still:{file:'assets/sim-recording-guide.webp',from:2},tap:1.2},
  {media:[[0,0],[5.8,5.8],[7,5.8]],camera:[[0,.5,.36,1.08]],caption:[[0,'Record the interview on one phone.']]},
  {camera:[[0,.5,.35,.98],[1.2,.5,.35,.98],[2.8,.5,.43,.86]],caption:[[0,'AI feedback links to the recording.']]},
  {media:[[0,0],[1.5,0],[12,10.5],[16,10.5]],camera:[[0,.5,.43,.86],[1.5,.5,.43,.86],[1.9,.5,.3,1.08],[12,.5,.3,1.08],[12.01,.5,.43,.86]],caption:[[0,'Select the feedback at 2:13.'],[12,'Ask about breathing separately.']],returnToFeedback:12,tap:.9},
  {media:[[0,0],[2,0],[3.125,1.125],[8,1.125]],camera:[[0,.5,.21,.94]],caption:[[0,'Choose one focus for the next practice.'],[3.2,'Saved: explore the main complaint first.']],note:'Different feedback from the breathing follow-up.',tap:1.7}
 ],
 'the-city-beyond':[
  {camera:[[0,.5,.5,'fit'],[1,.5,.5,'fit'],[1.6,.455,.79,.7]],caption:[[0,'The watch needs a way to navigate in fog.'],[2,'“We have no reliable way to hold a heading.”']],speaker:2},
  {media:[[0,0],[2.6,2.6],[3.5,2.6],[5.7,4.8],[6,4.8]],camera:[[0,.5,.5,'fit'],[.6,.5,.5,'fit'],[1.2,.455,.8,.7]],caption:[[0,'Try to magnetise bronze with a lodestone.']],tap:2.3},
  {camera:[[0,.455,.8,.7]],caption:[[0,'“Bronze cannot be magnetised this way, so it will not serve as a compass.”']],speaker:0},
  {camera:[[0,.455,.8,.7],[4.4,.455,.8,.7],[4.5,.51,.395,.5]],caption:[[0,'Iron works where bronze failed.'],[4.5,'The assembled needle becomes an inventory object.']]},
  {media:[[0,0],[3.5,3.5],[4.5,3.5],[5,4.8],[9,4.8],[9.5,5.2],[11,5.2]],camera:[[0,.59,.37,.62],[4.5,.59,.37,.62],[5,.46,.8,.7]],caption:[[0,'The captain asks for a heading test.'],[5,'The needle returns to the same north–south heading.']],note:'The test is repeated with the lodestone several paces away.',noteFrom:5},
  {camera:[[0,.5,.5,'fit'],[4,.5,.5,'fit'],[5,.5,.48,.83],[10.5,.5,.48,.83],[11.1,.5,.5,.75]],caption:[[0,'The captain permits entry.'],[4,'Walk through the gate.'],[11,'Beyond the gate: the end of this playable area.']]}
 ]
};
