export const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
export const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n);
export function emi(p,annual,n){if(!Number.isFinite(p)||p<=0||!Number.isInteger(n)||n<1||annual<0||!Number.isFinite(annual))throw Error('Invalid loan inputs');const r=annual/1200;return r===0?p/n:p*r/(1-Math.pow(1+r,-n));}
export function schedule(p,annual,n){const pay=round(emi(p,annual,n)),rows=[];let opening=p;for(let month=1;month<=n;month++){const interest=round(opening*annual/1200);const installment=month===n?round(opening+interest):Math.min(pay,round(opening+interest));const principal=round(installment-interest);const closing=round(opening-principal);rows.push({month,opening,interest,principal,payment:installment,closing});opening=closing;}return rows;}
export function allocate(payment,buckets,mode='vertical'){
 const order=['charge','interest','principal'];let left=Math.round(payment*100);const lines=[],remaining=structuredClone(buckets);
 const apply=(b,c)=>{const due=Math.round(remaining[b][c]*100);const paid=Math.min(left,due);left-=paid;remaining[b][c]=(due-paid)/100;if(paid)lines.push({bucket:b+1,component:c,amount:paid/100});};
 if(mode==='vertical')for(let b=0;b<buckets.length;b++)for(const c of order)apply(b,c);
 else for(const c of order)for(let b=0;b<buckets.length;b++)apply(b,c);
 return {lines,remaining,applied:(Math.round(payment*100)-left)/100,unapplied:left/100};
}
export function split(principal,interest,totalPOS,share,rateA,rateB){
 const ia=round(totalPOS*share*rateA/1200),ib=round(totalPOS*(1-share)*rateB/1200);
 const weight=ia+ib===0?share:ia/(ia+ib);const interestA=round(interest*weight),interestB=round(interest-interestA);
 const principalA=round(principal*share),principalB=round(principal-principalA);
 return {interestA,interestB,principalA,principalB,totalA:round(principalA+interestA),totalB:round(principalB+interestB),blended:share*rateA+(1-share)*rateB};
}
export function clockRemaining(session,now=Date.now()){
 if(session.mode==='untimed')return null;
 return Math.max(0,session.paused?session.remaining:Math.min(session.remaining,session.deadline-now));
}
export function pauseClock(session,now=Date.now()){
 if(session.mode==='untimed'||session.paused||session.status!=='active')return session;
 const remaining=clockRemaining(session,now);return {...session,paused:remaining>0,remaining,deadline:remaining>0?null:session.deadline};
}
export function resumeClock(session,now=Date.now()){
 if(!session.paused||session.status!=='active')return session;
 return {...session,paused:false,deadline:now+session.remaining};
}
export function classifyAttempt(history,qid,{helped=false,exposed=false,correct=false,timeout=false}){
 const old=history[qid]||{seen:0,attempts:[]};const kind=old.attempts.length?'repeat':helped||exposed?'helped':'independent-first';
 const record={kind,correct:correct&&!timeout,timeout,at:Date.now()};return {...old,attempts:[...old.attempts,record].slice(-100),first:old.first||record};
}
// Conventional cashflows only: one initial outflow followed by nonnegative receipts.
export function periodicIRR(initial,receipts){if(initial<=0||!receipts.length||receipts.some(c=>c<0)||receipts.every(c=>c===0))throw Error('Use conventional cashflows');let lo=-0.9999,hi=1;const npv=r=>-initial+receipts.reduce((n,c,i)=>n+c/Math.pow(1+r,i+1),0);while(npv(hi)>0&&hi<1e6)hi*=2;if(npv(lo)<0||npv(hi)>0)throw Error('Yield is not bracketed');for(let i=0;i<150;i++){const mid=(lo+hi)/2;if(npv(mid)>0)lo=mid;else hi=mid;}return (lo+hi)/2;}
export function eirSchedule(p,annual,n,fee){const gross=schedule(p,annual,n);if(fee<0||fee>=p)throw Error('Fee must be lower than principal');const yieldRate=periodicIRR(p-fee,gross.map(r=>r.payment));let carrying=round(p-fee),deferred=fee;const rows=gross.map((r,i)=>{const opening=carrying;const income=i===n-1?round(r.payment-opening):round(opening*yieldRate);carrying=round(opening+income-r.payment);const feeAccretion=round(income-r.interest);deferred=round(deferred-feeAccretion);return {...r,carryingOpen:opening,income,carryingClose:carrying,feeAccretion,deferred};});return {yieldRate,effectiveAnnual:Math.pow(1+yieldRate,12)-1,rows};}

export function observeClock(session,tracker,wallNow,monoNow){
 if(session.mode==='untimed'||session.paused||session.status!=='active')return {tracker:null,remaining:clockRemaining(session,wallNow),rollback:false};
 const key=`${session.startedAt}:${session.index}:${session.deadline}`;
 if(!tracker||tracker.key!==key)tracker={key,wallHigh:session.lastObserved,monoBase:monoNow,remainingBase:clockRemaining(session,wallNow),remaining:clockRemaining(session,wallNow)};
 const rollback=wallNow+1000<tracker.wallHigh;
 const remaining=Math.max(0,Math.min(tracker.remaining,tracker.remainingBase-(monoNow-tracker.monoBase),session.deadline-wallNow));
 return {remaining,rollback,tracker:{...tracker,remaining,wallHigh:Math.max(tracker.wallHigh,wallNow)}};
}
