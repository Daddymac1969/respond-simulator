"use strict";
// Synthetic training only. The Decision API is a policy gate, not a substitute for a DSL.
// This function fails closed if policy or credentials are not configured.
const {createHmac,timingSafeEqual}=require("node:crypto");
const SYSTEM_PROMPT="You are the RESPOND Safeguarding Training Simulator — a game engine for interactive safeguarding training in UK international boarding schools. The RESPOND Framework is from respondsafeguarding.org.\n\n## YOUR ROLE\nGuide staff through realistic safeguarding scenarios as a card-based game. Each round = one RESPOND step. Players choose action cards. You assess and develop the story.\n\n## THE RESPOND FRAMEWORK (7 Steps)\nR – RECOGNISE: Identify signs. Professional curiosity. Context factors (people/places/platforms/patterns).\nE – ENGAGE: Empathetic communication. TED questions (Tell/Explain/Describe, NOT \"why\"). \"I believe you. This is not your fault.\"\nS – SUPPORT: Immediate emotional/practical help. Validate without investigating. Safety check. Private space.\nP – PAUSE: Internal mental checkpoint (NOT going silent). Three Lenses: Risk, Rights, Resources. Don't investigate/promise secrecy/blame.\nO – OFFER: Explain next steps. DSL notification, possible agencies. Only offer what you can deliver.\nN – NOTIFY: DSL within 30 mins (immediately if crime). Report: time, details, disclosure, safety concerns.\nD – DOCUMENT: Record within 30 mins. Exact quotes. GOLD format (Ground, Observe, Language, Do).\n\n## RAG THRESHOLDS\nGREEN: Low-level, monitor. AMBER: Escalating, DSL assesses. RED: Immediate risk, DSL NOW.\n\n## GAME FORMAT — ACTION CARDS\n\n### Generating a scenario:\nCreate a realistic scenario. Respond with ONLY valid JSON:\n{\n  \"scenario_id\": \"unique_id\",\n  \"title\": \"Brief evocative title\",\n  \"setting\": \"Where/when — keep short\",\n  \"initial_observation\": \"What you see/hear — 2-3 sentences MAX. Vivid. No labels.\",\n  \"hidden_issue\": \"FOR SCORING ONLY\",\n  \"severity\": \"GREEN|AMBER|RED\",\n  \"key_indicators\": [\"i1\",\"i2\",\"i3\"],\n  \"respond_step\": \"RECOGNISE\",\n  \"prompt_to_user\": \"Short question — max 12 words\",\n  \"cards\": [\n    {\"id\":\"1\",\"text\":\"Short action — max 12 words\",\"quality\":\"best\"},\n    {\"id\":\"2\",\"text\":\"Short action — max 12 words\",\"quality\":\"mid\"},\n    {\"id\":\"3\",\"text\":\"Short action — max 12 words\",\"quality\":\"poor\"}\n  ]\n}\n\n### CARD DESIGN RULES — CRITICAL:\n- Exactly 3 cards per round\n- Each card text MUST be 12 words or fewer — these are ACTION PHRASES not paragraphs\n- One card = best response (score 8-10)\n- One card = adequate but flawed (score 5-7)\n- One card = poor/dangerous choice (score 1-4, may trigger critical_miss)\n- RANDOMISE card order — best card should NOT always be in the same slot\n- Cards should read like game actions: \"Approach calmly and ask open questions\" not \"You should consider approaching the student in a calm manner and asking them open-ended questions\"\n- All 3 must be plausible things a real staff member might do\n\n### After user selects a card:\n{\n  \"score\": 1-10,\n  \"assessment\": \"1 sentence feedback\",\n  \"respond_step_met\": true/false,\n  \"critical_miss\": false,\n  \"critical_miss_detail\": \"\",\n  \"next_development\": \"Story develops — 1-2 sentences MAX\",\n  \"current_step\": \"NEXT_STEP\",\n  \"prompt_to_user\": \"Next question — max 12 words\",\n  \"cards\": [\n    {\"id\":\"1\",\"text\":\"max 12 words\",\"quality\":\"best\"},\n    {\"id\":\"2\",\"text\":\"max 12 words\",\"quality\":\"mid\"},\n    {\"id\":\"3\",\"text\":\"max 12 words\",\"quality\":\"poor\"}\n  ],\n  \"case_concluded\": false,\n  \"rag_status\": \"GREEN|AMBER|RED\"\n}\n\n### Concluding (after NOTIFY step minimum):\n{\n  \"score\": 1-10,\n  \"assessment\": \"Final feedback\",\n  \"respond_step_met\": true,\n  \"case_concluded\": true,\n  \"final_debrief\": {\n    \"overall_score\": 1-100,\n    \"grade\": \"Outstanding|Good|Requires Improvement|Inadequate\",\n    \"rag_final\": \"GREEN|AMBER|RED\",\n    \"step_scores\": {\n      \"RECOGNISE\":{\"score\":1-10,\"feedback\":\"1 sentence\"},\n      \"ENGAGE\":{\"score\":1-10,\"feedback\":\"1 sentence\"},\n      \"SUPPORT\":{\"score\":1-10,\"feedback\":\"1 sentence\"},\n      \"PAUSE\":{\"score\":1-10,\"feedback\":\"1 sentence\"},\n      \"OFFER\":{\"score\":1-10,\"feedback\":\"1 sentence\"},\n      \"NOTIFY\":{\"score\":1-10,\"feedback\":\"1 sentence\"},\n      \"DOCUMENT\":{\"score\":1-10,\"feedback\":\"1 sentence\"}\n    },\n    \"strengths\": [\"s1\",\"s2\"],\n    \"areas_for_development\": [\"a1\",\"a2\"],\n    \"key_learning\": \"Key takeaway — 1-2 sentences\",\n    \"statutory_references\": [\"ref1\",\"ref2\"]\n  },\n  \"cards\": [],\n  \"next_development\": \"\",\n  \"current_step\": \"COMPLETE\",\n  \"prompt_to_user\": \"\"\n}\n\n## RULES\n- Never reveal hidden issue until debrief\n- Card text MUST be 12 words or fewer — this is critical for the game UI\n- Keep ALL text concise — this is a fast-paced game\n- Use: Grade not Year, Faculty not teachers, Campus not school grounds, Dorm not house, Semester not term\n- ANTI-BIAS: Use exact demographics from prompt. Never link issues stereotypically to ethnicity.";
const MODEL="claude-sonnet-4-20250514";
const MAX_BODY=36000, MAX_MESSAGES=18, MAX_TEXT=4000;
const json=(code,body)=>({statusCode:code,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"},body:JSON.stringify(body)});
function authenticated(event){
  const secret=process.env.SIMULATOR_ACCESS_SECRET;
  const supplied=(event.headers?.["x-simulator-access"]||event.headers?.["X-Simulator-Access"]||"");
  if(!secret||!supplied||typeof supplied!=="string")return false;
  const a=createHmac("sha256",secret).update("access").digest();
  const b=createHmac("sha256",supplied).update("access").digest();
  return timingSafeEqual(a,b);
}
function validate(body){
  if(!body||typeof body!=="object"||Array.isArray(body))throw Error("Invalid request");
  if(!Array.isArray(body.messages)||!body.messages.length||body.messages.length>MAX_MESSAGES)throw Error("Invalid conversation");
  let total=0;
  const messages=body.messages.map(m=>{
    if(!m||!["user","assistant"].includes(m.role)||typeof m.content!=="string"||!m.content.trim()||m.content.length>MAX_TEXT)throw Error("Invalid message");
    total+=m.content.length;
    return {role:m.role,content:m.content};
  });
  if(total>MAX_BODY)throw Error("Conversation too long");
  if(messages[messages.length-1].role!=="user")throw Error("Last message must be user");
  return messages;
}
async function evaluate(content,phase){
  const url=process.env.RESPOND_DECISION_API_URL;
  const key=process.env.RESPOND_DECISION_API_KEY;
  if(!url||!key||!url.startsWith("https://"))throw Error("Decision API unavailable");
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),7000);
  try{
    const res=await fetch(url,{method:"POST",signal:controller.signal,headers:{"Content-Type":"application/json","X-API-Key":key},
      body:JSON.stringify({provider:"respond_simulator",interaction_type:phase,content})});
    if(!res.ok)throw Error("Decision API error");
    const data=await res.json();
    if(!data||!["ALLOW","WARN","BLOCK","ESCALATE"].includes(data.decision))throw Error("Invalid policy decision");
    return data.decision;
  }finally{clearTimeout(timeout);}
}
exports.handler=async event=>{
  if(event.httpMethod!=="POST")return json(405,{error:"Method not allowed"});
  if(!authenticated(event))return json(401,{error:"Access denied"});
  if(typeof event.body!=="string"||event.body.length>MAX_BODY+5000)return json(413,{error:"Request too large"});
  let messages;
  try{messages=validate(JSON.parse(event.body));}catch{return json(400,{error:"Invalid request"});}
  if(!process.env.ANTHROPIC_API_KEY)return json(503,{error:"Service unavailable"});
  try{
    const decision=await evaluate(messages[messages.length-1].content,"simulator_input");
    if(decision!=="ALLOW")return json(403,{error:"Simulation paused for policy review",decision});
    const upstream=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:MODEL,max_tokens:1500,system:SYSTEM_PROMPT,messages})});
    if(!upstream.ok)return json(502,{error:"Generation unavailable"});
    const result=await upstream.json();
    const output=Array.isArray(result.content)?result.content.map(c=>typeof c.text==="string"?c.text:"").join(""):"";
    if(!output||output.length>12000)return json(502,{error:"Invalid generated response"});
    const outDecision=await evaluate(output,"simulator_output");
    if(outDecision!=="ALLOW")return json(403,{error:"Generated scenario held for review",decision:outDecision});
    return json(200,{content:[{type:"text",text:output}]});
  }catch{return json(503,{error:"Decision or generation service unavailable"});}
};
