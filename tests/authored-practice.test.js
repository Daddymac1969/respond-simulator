"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {CASE,STEPS,evaluate}=require("../public/authored-practice.js");
test("authored case covers each RESPOND stage once",()=>{
 assert.deepEqual(CASE.steps.map(s=>s.step),STEPS);
 assert.equal(new Set(CASE.steps.flatMap(s=>s.options.map(o=>o.id))).size,21);
});
test("best authored answers receive deterministic feedback",()=>{
 const r=evaluate(CASE,CASE.steps.map(s=>s.options[0].id));
 assert.equal(r.points,14);assert.equal(r.max,14);assert.equal(r.status,"PRACTICE_FEEDBACK_ONLY");
});
test("unsafe authored answers score zero without any AI request",()=>{
 const r=evaluate(CASE,CASE.steps.map(s=>s.options[1].id));
 assert.equal(r.points,0);
});
test("invalid and incomplete answers fail closed",()=>{
 assert.throws(()=>evaluate(CASE,[]),/Incomplete/);
 assert.throws(()=>evaluate(CASE,CASE.steps.map(()=>"forged")) ,/Invalid choice/);
});
test("authored feedback is fixed and excludes invented universal reporting deadlines",()=>{
 const text=JSON.stringify(CASE);
 assert.doesNotMatch(text,/within 30 min|KCSIE 2025|Working Together 2023/i);
 assert.match(text,/DSL promptly/);
});
test("authored practice page uses textContent for untrusted dynamic text",()=>{
 const html=fs.readFileSync(path.join(__dirname,"../public/authored-practice.html"),"utf8");
 assert.match(html,/textContent=text/);
 assert.doesNotMatch(html,/innerHTML\s*=/);
 assert.match(html,/No answers are transmitted or saved/);
});
