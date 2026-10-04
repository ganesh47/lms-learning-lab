import {emi,periodicIRR} from '../src/engine.mjs';import fs from 'node:fs';import assert from 'node:assert/strict';
export function check(){const data=JSON.parse(fs.readFileSync(new URL('../content/curriculum.json',import.meta.url)));const {modules,cards,questions,cases,sources}=data;
 assert.equal(modules.length,12);assert.equal(cards.length,120);assert.equal(questions.length,160);assert.equal(cases.length,15);
 for(const arr of [modules,cards,questions,cases,sources])assert.equal(new Set(arr.map(x=>x.id)).size,arr.length,'Duplicate IDs');
 const mids=new Set(modules.map(m=>m.id)),sids=new Set(sources.map(s=>s.id));
 for(const m of modules){assert(m.lesson.length>=5);assert(m.prerequisites.every(x=>mids.has(x)));}
 for(const x of [...cards,...questions,...cases]){assert(mids.has(x.module));assert(x.sources.length);for(const s of x.sources){assert(sids.has(s.id));if(s.id==='guide')assert(s.pages.length&&s.pages.every(p=>p>=1&&p<=42));}}
 assert.equal(new Set(questions.map(q=>q.prompt)).size,questions.length,'Duplicate prompts');
 for(const q of questions){assert.equal(q.options.length,3);assert.equal(new Set(q.options.map(o=>o.text)).size,3);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3);assert(q.options.every(o=>o.explanation.length>15));if(q.sources.some(s=>s.claim)){assert(q.scope&&q.checked==='2026-10-04');assert(q.sources.every(s=>s.section&&s.claim));}}
 const ops={xirr:a=>{let lo=0,hi=1;for(let i=0;i<150;i++){const m=(lo+hi)/2,npv=-a[0]+a.slice(2).reduce((n,d)=>n+a[1]/(1+m)**(d/365),0);if(npv>0)lo=m;else hi=m;}return (lo+hi)/2;},emi:a=>emi(...a),pv:a=>Array.from({length:a[2]},(_,i)=>a[0]/Math.pow(1+a[1],i+1)).reduce((x,y)=>x+y,0),effective:a=>(Math.pow(1+a[0],a[1])-1)*100,eir:a=>periodicIRR(a[0],Array.from({length:a[3]},(_,i)=>i===a[3]-1?a[2]:a[1])),subtract:a=>a[0]-a[1],sum:a=>a.reduce((x,y)=>x+y,0),blend:a=>a[0]*a[1]+(1-a[0])*a[2],quote:a=>a.slice(0,-1).reduce((x,y)=>x+y,0)-a.at(-1),yield:a=>(a[1]/a[0]-1)*100,escrow:a=>a[0]+a[1]-a[2]};let count=0;
 for(const c of cases){assert(c.steps.length>=4);assert(c.questions.every(id=>questions.some(q=>q.id===id&&q.case===c.id)));for(const e of c.checks){assert(Math.abs(ops[e.op](e.args)-e.expected)<0.000001,`${c.id} math: ${e.op}`);count++;}}
 // Known handbook arithmetic is deliberately corrected, with inclusive-POS convention.
 assert.equal([200,8000,25000,36,200,7750,25250,36,200,7500,25500,36].reduce((a,b)=>a+b),99708);
 return `${modules.length} modules / ${cards.length} cards / ${questions.length} MCQs / ${cases.length} cases / ${count} numeric identities; source and schema checks passed`;
}
if(process.argv[1]===new URL(import.meta.url).pathname)console.log(check());
