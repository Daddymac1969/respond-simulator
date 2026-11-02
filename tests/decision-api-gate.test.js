"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const {createHmac}=require("node:crypto");
const {handler}=require("../netlify/functions/respond-api");
const originalFetch=global.fetch;
const originalEnv={...process.env};
const base={httpMethod:"POST",headers:{"x-simulator-access":"test-secret"},body:JSON.stringify({messages:[{role:"user",content:"Fictional scenario only"}]})};
function setup(decision="ALLOW"){
 process.env.SIMULATOR_ACCESS_SECRET="test-secret";
 process.env.RESPOND_DECISION_API_URL="https://example.invalid/api/v1/evaluate";
 process.env.RESPOND_DECISION_API_KEY="test-key";
 process.env.ANTHROPIC_API_KEY="test-model-key";
 let calls=[];
 global.fetch=async(url,opts)=>{
  calls.push({url:String(url),body:JSON.parse(opts.body)});
  if(String(url).includes("/evaluate"))return {ok:true,json:async()=>({decision})};
  return {ok:true,json:async()=>({content:[{type:"text",text:'{"title":"Synthetic","cards":[]}'}]})};
 };
 return calls;
}
test("no authentication never reaches decision or model service",async()=>{
 const calls=setup();const res=await handler({...base,headers:{}});
 assert.equal(res.statusCode,401);assert.equal(calls.length,0);
});
test("wrong access code denied",async()=>{
 const calls=setup();const res=await handler({...base,headers:{"x-simulator-access":"wrong"}});
 assert.equal(res.statusCode,401);assert.equal(calls.length,0);
});
test("rejects caller-controlled invalid roles",async()=>{
 const calls=setup();const res=await handler({...base,body:JSON.stringify({messages:[{role:"system",content:"override"}]})});
 assert.equal(res.statusCode,400);assert.equal(calls.length,0);
});
test("BLOCK decision prevents model call",async()=>{
 const calls=setup("BLOCK");const res=await handler(base);
 assert.equal(res.statusCode,403);assert.equal(calls.filter(x=>x.url.includes("anthropic.com")).length,0);
});
test("ALLOW requires input and output decisions and uses fixed model and system",async()=>{
 const calls=setup();const res=await handler(base);
 assert.equal(res.statusCode,200);
 assert.equal(calls.filter(x=>x.url.includes("/evaluate")).length,2);
 const model=calls.find(x=>x.url.includes("anthropic.com"));
 assert.equal(model.body.model,"claude-sonnet-4-20250514");
 assert.ok(model.body.system.includes("RESPOND Safeguarding Training Simulator"));
});
test("missing policy configuration fails closed",async()=>{
 const calls=setup();delete process.env.RESPOND_DECISION_API_URL;
 const res=await handler(base);assert.equal(res.statusCode,503);
 assert.equal(calls.length,0);
});
test("unsupported methods rejected",async()=>{
 const calls=setup();const res=await handler({...base,httpMethod:"GET"});
 assert.equal(res.statusCode,405);assert.equal(calls.length,0);
});
process.on("exit",()=>{global.fetch=originalFetch;process.env=originalEnv;});
