// LOCAL VISUAL TEST ONLY: fake client, no real authorization
const posts=[{id:1,kind:'rehearsal',title:'مثال: بروفة (بيانات تجريبية)',body:'تفاصيل تجريبية',event_date:'2026-12-01T18:00:00Z'},{id:2,kind:'rehearsal',title:'مثال: بروفة ثانية',body:'',event_date:null}];
const pend=[{id:'u1',email:'member@example.com',full_name:'عضو تجريبي',status:'pending'}];
const q=(t)=>{let f=[];const o={select:()=>o,eq:(k,v)=>{f.push([k,v]);return o},neq:()=>o,order:()=>o,single:()=>Promise.resolve({data:{id:'a',status:'approved',is_admin:true}}),insert:()=>o,update:()=>o,delete:()=>o,
then:(r)=>r({data:t==='posts'?posts.filter(p=>f.every(([k,v])=>p[k]===v)):pend})};return o};
export const createClient=()=>({from:q,auth:{getSession:()=>Promise.resolve({data:{session:window.location.search.includes('in')?{user:{id:'a'}}:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut(){}}});
