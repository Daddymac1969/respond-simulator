"use strict";
/*
 * RESPOND authored practice engine v0.1.
 * Fixed fictional case and human-authored answer keys. Not a competency certificate.
 * Requires DSL review before assessed use. No network calls or case-data persistence.
 */
const STEPS=["RECOGNISE","ENGAGE","SUPPORT","PAUSE","OFFER","NOTIFY","DOCUMENT"];
const CASE={
 id:"rowan-fictional-01",version:"draft-2026-11-02",
 title:"Rowan at the end of the day",
 setting:"A fictional school corridor after activities",
 introduction:"Rowan, a fictional student, has become withdrawn. They say they are worried about going home and ask whether you can keep something secret.",
 steps:[
 {step:"RECOGNISE",question:"What should you recognise first?",options:[
 {id:"r1",text:"Treat the change and expressed worry as a possible safeguarding concern.",points:2,feedback:"Recognises indicators without assuming what has happened."},
 {id:"r2",text:"Wait until Rowan volunteers more information without recording the concern.",points:0,feedback:"Delay may miss an opportunity to respond and share the concern."},
 {id:"r3",text:"Assume the concern is about homework and reassure Rowan.",points:0,feedback:"This prematurely dismisses the student's expressed worry."}]},
 {step:"ENGAGE",question:"How do you respond to the request for secrecy?",options:[
 {id:"e1",text:"Listen calmly, explain you cannot promise secrecy, and say you will share only with people who need to help.",points:2,feedback:"Uses a clear, honest disclosure response without promising confidentiality."},
 {id:"e2",text:"Promise not to tell anyone if Rowan explains everything.",points:0,feedback:"Never promise confidentiality in a safeguarding disclosure."},
 {id:"e3",text:"Ask Rowan to provide proof before you listen further.",points:0,feedback:"Avoid investigative questioning or placing a burden of proof on the student."}]},
 {step:"SUPPORT",question:"What immediate support is appropriate?",options:[
 {id:"s1",text:"Check immediate safety and offer a suitable private, supervised space.",points:2,feedback:"Prioritises safety and appropriate support without investigation."},
 {id:"s2",text:"Send Rowan home without checking whether it is safe.",points:0,feedback:"Immediate safety must be considered before routine departure."},
 {id:"s3",text:"Gather detailed evidence from other students first.",points:0,feedback:"Staff should not conduct an investigation."}]},
 {step:"PAUSE",question:"What should guide your next decision?",options:[
 {id:"p1",text:"Consider immediate risk, Rowan's rights and the available safeguarding support.",points:2,feedback:"Uses risk, rights and resources to inform proportionate action."},
 {id:"p2",text:"Decide whether Rowan seems credible before contacting safeguarding staff.",points:0,feedback:"Credibility judgements are not an appropriate threshold for sharing a concern."},
 {id:"p3",text:"Wait for a second incident to be certain.",points:0,feedback:"Do not delay reporting pending further incidents."}]},
 {step:"OFFER",question:"What can you appropriately offer?",options:[
 {id:"o1",text:"Explain the next safeguarding steps and what support is available, without making promises you cannot keep.",points:2,feedback:"Offers realistic choices and transparency."},
 {id:"o2",text:"Promise that nobody else will be informed.",points:0,feedback:"This would be misleading and unsafe."},
 {id:"o3",text:"Promise that everything will be resolved by tomorrow.",points:0,feedback:"Avoid outcomes you cannot guarantee."}]},
 {step:"NOTIFY",question:"How should the concern be escalated?",options:[
 {id:"n1",text:"Contact the DSL promptly using the school's safeguarding procedure; seek emergency help if immediate danger is identified.",points:2,feedback:"Escalates through the appropriate pathway without relying on a universal invented deadline."},
 {id:"n2",text:"Keep the concern to yourself until the next scheduled team meeting.",points:0,feedback:"Unnecessary delay could increase risk."},
 {id:"n3",text:"Discuss the concern widely to gather opinions.",points:0,feedback:"Share information only with those who need it for safeguarding."}]},
 {step:"DOCUMENT",question:"What should be recorded?",options:[
 {id:"d1",text:"Record Rowan's words accurately, observations, time, actions and who was informed using the approved system.",points:2,feedback:"Creates a clear, factual and appropriately shared record."},
 {id:"d2",text:"Write only your conclusion without Rowan's words.",points:0,feedback:"A record should distinguish observations, disclosure and professional interpretation."},
 {id:"d3",text:"Keep a personal copy on your own device.",points:0,feedback:"Use the school's approved safeguarding recording arrangements."}]}
 ]};
function evaluate(caseData,answers){
 if(!caseData||!Array.isArray(caseData.steps)||!Array.isArray(answers))throw Error("Invalid assessment");
 if(answers.length!==caseData.steps.length)throw Error("Incomplete assessment");
 let points=0;
 const steps=caseData.steps.map((stage,i)=>{
  const selected=stage.options.find(o=>o.id===answers[i]);
  if(!selected)throw Error("Invalid choice at "+stage.step);
  points+=selected.points;
  return {step:stage.step,choice:selected.id,points:selected.points,max:2,feedback:selected.feedback};
 });
 return {caseId:caseData.id,version:caseData.version,points,max:steps.length*2,steps,
   status:"PRACTICE_FEEDBACK_ONLY",note:"Not an assessment of safeguarding competence. Review with a DSL."};
}
if(typeof module!=="undefined")module.exports={CASE,STEPS,evaluate};
if(typeof window!=="undefined")window.RESPOND_AUTHORED={CASE,STEPS,evaluate};
