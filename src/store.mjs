export const KEY='lending-systems-lab:v1';
export function fresh(){return {version:1,bookmarks:[],lessons:[],cards:{},history:{},exposed:[],session:null,settings:{large:false},filters:{module:'all',difficulty:'all',search:''}};}
function plain(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function strings(a,valid){return Array.isArray(a)&&a.length<=2000&&a.every(x=>typeof x==='string'&&valid.has(x));}
export function validate(raw,bank){
 let x;try{x=JSON.parse(raw);}catch{return {ok:false,reason:'Saved bytes are not valid JSON.'};}
 if(!plain(x)||x.version!==1)return {ok:false,reason:'Saved format is unknown or from another version.'};
 const mids=new Set(bank.modules.map(m=>m.id)),cids=new Set(bank.cards.map(c=>c.id)),qids=new Set(bank.questions.map(q=>q.id));
 if(!strings(x.bookmarks,mids)||!strings(x.lessons,mids)||!strings(x.exposed,qids)||!plain(x.cards)||!plain(x.history)||!plain(x.settings)||typeof x.settings.large!=='boolean'||!plain(x.filters)||!['all',...mids].includes(x.filters.module)||!['all','Foundation','Applied','Advanced'].includes(x.filters.difficulty)||typeof x.filters.search!=='string'||x.filters.search.length>300)return {ok:false,reason:'Saved progress has an invalid structure.'};
 for(const [id,v] of Object.entries(x.cards))if(!cids.has(id)||!plain(v)||!Number.isInteger(v.seen)||v.seen<0||v.seen>100000||!Number.isInteger(v.revealed)||v.revealed<0||v.revealed>100000)return {ok:false,reason:'Saved card record is invalid.'};
 const isRecord=r=>plain(r)&&['independent-first','helped','repeat'].includes(r.kind)&&typeof r.correct==='boolean'&&typeof r.timeout==='boolean'&&Number.isFinite(r.at)&&r.at>=0;
 for(const [id,v] of Object.entries(x.history))if(!qids.has(id)||!plain(v)||!Number.isInteger(v.seen)||v.seen<0||v.seen>100000||!Array.isArray(v.attempts)||v.attempts.length>100||!v.attempts.every(isRecord)||(v.first&&!isRecord(v.first)))return {ok:false,reason:'Saved question history is invalid.'};
 const s=x.session;
 if(s!==null){
  if(!plain(s)||!strings(s.ids,qids)||s.ids.length===0||s.ids.length>200||new Set(s.ids).size!==s.ids.length||!Number.isInteger(s.index)||s.index<0||s.index>=s.ids.length||!['untimed','session','question'].includes(s.mode)||!['active','complete','expired','abandoned'].includes(s.status)||typeof s.paused!=='boolean'||!Number.isFinite(s.budget)||s.budget<0||s.budget>10800000||!Number.isFinite(s.remaining)||s.remaining<0||s.remaining>s.budget||!(s.deadline===null||Number.isFinite(s.deadline)&&s.deadline>0)||typeof s.helped!=='boolean'||!(s.selected===null||Number.isInteger(s.selected)&&s.selected>=0&&s.selected<3)||!plain(s.results)||!Number.isFinite(s.startedAt)||!Number.isFinite(s.lastObserved)||s.lastObserved<s.startedAt)return {ok:false,reason:'Saved assessment is invalid.'};
  if(s.mode!=='untimed'&&s.status==='active'&&((s.paused&&s.deadline!==null)||(!s.paused&&s.deadline===null)||s.budget===0))return {ok:false,reason:'Saved timer is invalid.'};
  for(const [id,r] of Object.entries(s.results))if(!s.ids.includes(id)||!plain(r)||!(r.choice===null||Number.isInteger(r.choice)&&r.choice>=0&&r.choice<3)||typeof r.correct!=='boolean'||typeof r.helped!=='boolean'||typeof r.timeout!=='boolean'||!['independent-first','helped','repeat','unanswered'].includes(r.kind))return {ok:false,reason:'Saved assessment result is invalid.'};
 }
 return {ok:true,data:x};
}
export function read(storage,bank){let raw;try{raw=storage.getItem(KEY);}catch{return {state:fresh(),blocked:true,raw:null,reason:'Browser storage is unavailable. Choose a temporary session to continue.'};}if(raw===null)return {state:fresh(),blocked:false,raw:null};const result=validate(raw,bank);return result.ok?{state:result.data,blocked:false,raw}:{state:fresh(),blocked:true,raw,reason:result.reason};}
export function save(storage,state){try{storage.setItem(KEY,JSON.stringify(state));return {ok:true};}catch{return {ok:false,reason:'Saving failed. Your last saved bytes remain; export current progress before leaving.'};}}
export function recoverReset(storage,raw){try{if(raw!==null)storage.setItem(`${KEY}:backup:${Date.now()}`,raw);const state=fresh();storage.setItem(KEY,JSON.stringify(state));return {ok:true,state};}catch{return {ok:false,reason:'Backup/reset failed. Original bytes have not been intentionally removed; export them and use a temporary session.'};}}
