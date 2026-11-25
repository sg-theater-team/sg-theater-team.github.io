import React,{useEffect,useState} from 'react';import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import logo from './logo.jpg';
const sb=createClient(import.meta.env.VITE_SUPABASE_URL||'http://localhost',import.meta.env.VITE_SUPABASE_ANON_KEY||'anon');
const KINDS={rehearsal:'مواعيد البروفات',script:'النصوص',role:'توزيع الأدوار',note:'إعلانات'};
const css=`*{box-sizing:border-box}body{margin:0;font-family:system-ui,'Segoe UI',Tahoma,sans-serif;background:#1b1030;color:#f4ecff}
.w{max-width:720px;margin:0 auto;padding:20px}h1{color:#e8c46a;margin:.2em 0;font-size:clamp(1.6rem,8vw,2.4rem);white-space:nowrap}.sub{margin:0 0 12px;color:#d9c9f2;font-size:.95rem}::placeholder{color:#c9b6e8;opacity:1}h2{color:#e8c46a;font-size:1.1rem}
.c{background:#2a1a48;border:1px solid #4b2f7c;border-radius:12px;padding:14px;margin:10px 0}
input,textarea,select{width:100%;padding:10px;margin:6px 0;border-radius:8px;border:1px solid #6b4aa3;background:#150b27;color:#fff;font:inherit}
button{background:#e8c46a;color:#1b1030;border:0;border-radius:8px;padding:10px 16px;font:inherit;font-weight:700;cursor:pointer;margin:4px 0 4px 6px}
button.g{background:transparent;color:#e8c46a;border:1px solid #e8c46a}.m{color:#ffb4b4}.s{color:#9fe3b0}`;
function Auth(){const[mode,setMode]=useState('in');const[e,setE]=useState('');const[p,setP]=useState('');const[n,setN]=useState('');const[msg,setMsg]=useState('');
const go=async()=>{setMsg('');if(mode==='in'){const{error}=await sb.auth.signInWithPassword({email:e,password:p});if(error)setMsg('تعذر الدخول: تأكد من البريد وكلمة السر');}
else{const{data,error}=await sb.auth.signUp({email:e,password:p,options:{data:{full_name:n}}});if(error)setMsg('تعذر التسجيل: '+error.message);else if(!data.session)setMsg('تم التسجيل. افتح رسالة التأكيد على بريدك، وبعدها ينتظر طلبك موافقة مينا.');}};
return <div className="c"><h2>{mode==='in'?'دخول الأعضاء':'طلب انضمام'}</h2>
{mode==='up'&&<input placeholder="الاسم" value={n} onChange={x=>setN(x.target.value)}/>}
<input type="email" dir="ltr" placeholder="البريد الإلكتروني" value={e} onChange={x=>setE(x.target.value)}/>
<input type="password" dir="ltr" placeholder="كلمة السر (٨ حروف على الأقل)" value={p} onChange={x=>setP(x.target.value)}/>
<button type="button" onClick={go}>{mode==='in'?'دخول':'إرسال الطلب'}</button>
<button type="button" className="g" onClick={()=>setMode(mode==='in'?'up':'in')}>{mode==='in'?'طلب انضمام جديد':'عندي حساب'}</button>
{msg&&<p className={msg.startsWith('تم')?'s':'m'}>{msg}</p>}</div>;}
function Admin(){const[rows,setRows]=useState([]);const[mem,setMem]=useState([]);const load=async()=>{const{data}=await sb.from('profiles').select('*').order('created_at');const d=data||[];setRows(d.filter(r=>r.status!=='approved'));setMem(d.filter(r=>r.status==='approved'));};useEffect(()=>{load()},[]);
const set=async(id,status)=>{await sb.from('profiles').update({status}).eq('id',id);load();};
return <><div className="c"><h2>طلبات الانضمام</h2>{rows.length===0&&<p>مفيش طلبات دلوقتي.</p>}
{rows.map(r=><div key={r.id}><b>{r.full_name||'بدون اسم'}</b> <span dir="ltr">{r.email}</span> ({r.status==='pending'?'منتظر':'مرفوض'})
<div><button type="button" onClick={()=>set(r.id,'approved')}>موافقة</button><button type="button" className="g" onClick={()=>set(r.id,'rejected')}>رفض</button></div></div>)}</div>
<div className="c"><h2>الأعضاء ({mem.length})</h2>{mem.map(r=><div key={r.id} style={{margin:'8px 0'}}><b>{r.full_name||'بدون اسم'}</b> <span dir="ltr">{r.email}</span>{r.is_admin?' (مسؤول)':''}
{!r.is_admin&&<div><button type="button" className="g" onClick={()=>set(r.id,'rejected')}>إلغاء العضوية</button></div>}</div>)}</div></>;}
function Section({kind,admin}){const[rows,setRows]=useState([]);const[t,setT]=useState('');const[b,setB]=useState('');const[d,setD]=useState('');
const load=async()=>{const{data}=await sb.from('posts').select('*').eq('kind',kind).order('event_date',{nullsFirst:false}).order('created_at',{ascending:false});setRows(data||[]);};useEffect(()=>{load()},[kind]);
const add=async()=>{if(!t)return;await sb.from('posts').insert({kind,title:t,body:b,event_date:d||null});setT('');setB('');setD('');load();};
const del=async id=>{await sb.from('posts').delete().eq('id',id);load();};
return <div><h2>{KINDS[kind]}</h2>{rows.length===0&&<p>لسه مفيش حاجة هنا.</p>}
{rows.map(r=><div className="c" key={r.id}><b>{r.title}</b>{r.event_date&&<div dir="ltr">{new Date(r.event_date).toLocaleString('ar-EG')}</div>}<div style={{whiteSpace:'pre-wrap'}}>{r.body}</div>{admin&&<button type="button" className="g" onClick={()=>del(r.id)}>حذف</button>}</div>)}
{admin&&<div className="c"><input placeholder="العنوان" value={t} onChange={x=>setT(x.target.value)}/>{kind==='rehearsal'&&<input type="datetime-local" dir="ltr" value={d} onChange={x=>setD(x.target.value)}/>}<textarea rows="3" placeholder="التفاصيل" value={b} onChange={x=>setB(x.target.value)}/><button type="button" onClick={add}>إضافة</button></div>}</div>;}
function Pic({name}){const[u,setU]=useState('');useEffect(()=>{let o='';sb.storage.from('team-media').download(name).then(({data})=>{if(data){o=URL.createObjectURL(data);setU(o);}});return()=>{if(o)URL.revokeObjectURL(o)};},[name]);return u?<img src={u} alt="" style={{width:'100%',borderRadius:8}}/>:<p>جاري التحميل…</p>;}
function Vid({name}){const[u,setU]=useState('');const[e,setE]=useState('');const play=async()=>{setE('');const{data,error}=await sb.storage.from('team-media').createSignedUrl(name,300);if(error)setE('تعذر تشغيل الفيديو');else setU(data.signedUrl);};
return u?<video src={u} controls autoPlay playsInline style={{width:'100%',borderRadius:8}}/>:<div><button type="button" onClick={play}>تشغيل الفيديو</button>{e&&<p className="m">{e}</p>}</div>;}
function Media({admin}){const[albums,setAlbums]=useState([]);const[cur,setCur]=useState(null);const[nm,setNm]=useState('');const[msg,setMsg]=useState('');
const loadA=async()=>{const{data}=await sb.from('albums').select('*').order('created_at',{ascending:false});setAlbums(data||[]);};useEffect(()=>{loadA()},[]);
const addA=async()=>{const n=nm.trim();if(!n)return;const{error}=await sb.from('albums').insert({name:n});if(error)setMsg('تعذر إنشاء الألبوم: '+error.message);else{setNm('');setMsg('');loadA();}};
if(cur==='root')return <div><button type="button" className="g" onClick={()=>setCur(null)}>رجوع للألبومات</button><Album admin={admin} album={{id:'',name:'صور قديمة بدون ألبوم'}} onGone={()=>setCur(null)}/></div>;
if(cur)return <div><button type="button" className="g" onClick={()=>{setCur(null);loadA();}}>رجوع للألبومات</button><Album admin={admin} album={cur} onGone={()=>{setCur(null);loadA();}}/></div>;
return <div><h2>الصور والفيديوهات</h2>{albums.length===0&&<p>لسه مفيش ألبومات.</p>}
{albums.map(a=><div className="c" key={a.id}><b>{a.name}</b><div><button type="button" onClick={()=>setCur(a)}>فتح الألبوم</button></div></div>)}
<div className="c"><button type="button" className="g" onClick={()=>setCur('root')}>صور قديمة بدون ألبوم</button></div>
{admin&&<div className="c"><input placeholder="اسم ألبوم جديد، مثلًا: البروفات" value={nm} onChange={x=>setNm(x.target.value)}/><button type="button" onClick={addA}>إنشاء ألبوم</button>{msg&&<p className="m">{msg}</p>}</div>}</div>;}
function Album({admin,album,onGone}){const[items,setItems]=useState([]);const[msg,setMsg]=useState('');const[busy,setBusy]=useState(false);const pre=album.id===''?'':album.id+'/';
const load=async()=>{const{data}=await sb.storage.from('team-media').list(String(album.id),{limit:100,sortBy:{column:'created_at',order:'desc'}});const f=(data||[]).filter(x=>x.name&&x.id);
setItems(f.map(x=>({name:pre+x.name,at:x.created_at,type:(x.metadata&&x.metadata.mimetype)||''})));};useEffect(()=>{load()},[album.id]);
const shrink=file=>new Promise(res=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{const m=1600,r=Math.min(1,m/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);c.getContext('2d').drawImage(img,0,0,c.width,c.height);c.toBlob(b=>{URL.revokeObjectURL(url);res(b||file)},'image/jpeg',0.82);};img.onerror=()=>res(file);img.src=url;});
const up=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;setMsg('');
const isI=file.type.startsWith('image/'),isV=file.type.startsWith('video/');if(!isI&&!isV){setMsg('الملف لازم يكون صورة أو فيديو.');return;}
if(isV&&file.size>50*1024*1024){setMsg('الفيديو أكبر من ٥٠ ميجا. استخدم فيديو أقصر أو مضغوط.');return;}
setBusy(true);let body=file,ext=(file.name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,5)||'bin',ct=file.type;
if(isI&&file.type!=='image/gif'){body=await shrink(file);if(body!==file){ext='jpg';ct='image/jpeg';}}
const name=pre+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
const{error}=await sb.storage.from('team-media').upload(name,body,{contentType:ct});setBusy(false);
if(error)setMsg('تعذر الرفع: '+error.message);else{setMsg('تم الرفع.');load();}};
const del=async n=>{await sb.storage.from('team-media').remove([n]);load();};
const delA=async()=>{if(!window.confirm('حذف الألبوم وكل اللي فيه؟'))return;const{data}=await sb.storage.from('team-media').list(String(album.id),{limit:1000});const names=(data||[]).filter(x=>x.id).map(x=>pre+x.name);if(names.length)await sb.storage.from('team-media').remove(names);await sb.from('albums').delete().eq('id',album.id);onGone();};
return <div><h2>{album.name}</h2>{items.length===0&&<p>لسه مفيش حاجة هنا.</p>}
{items.map(x=><div className="c" key={x.name}>{x.type.startsWith('video/')?<Vid name={x.name}/>:<Pic name={x.name}/>}
{admin&&<button type="button" className="g" onClick={()=>del(x.name)}>حذف</button>}</div>)}
{admin&&album.id!==''&&<div className="c"><p>رفع صورة أو فيديو في الألبوم (الفيديو لحد ٥٠ ميجا، والصور بتتصغّر تلقائي).</p><input type="file" accept="image/*,video/*" onChange={up} disabled={busy}/>{busy&&<p>جاري الرفع…</p>}{msg&&<p className={msg.startsWith('تم')?'s':'m'}>{msg}</p>}</div>}
{admin&&album.id!==''&&<button type="button" className="g" onClick={delA}>حذف الألبوم</button>}</div>;}
function App(){const[s,setS]=useState(null);const[prof,setProf]=useState(null);const[tab,setTab]=useState('rehearsal');
useEffect(()=>{sb.auth.getSession().then(({data})=>setS(data.session));const{data}=sb.auth.onAuthStateChange((_e,x)=>setS(x));return()=>data.subscription.unsubscribe();},[]);
useEffect(()=>{if(!s){setProf(null);return;}sb.from('profiles').select('*').eq('id',s.user.id).single().then(({data})=>setProf(data));},[s]);
return <div className="w"><style>{css}</style><img src={logo} alt="شعار فريق سان چورج" style={{display:'block',margin:'0 auto 8px',width:'min(240px,60vw)',height:'auto',borderRadius:12}}/><h1>فريق سان چورج</h1><p className="sub">كواليس الفريق · للأعضاء المعتمدين فقط</p>
{!s&&<Auth/>}
{s&&!prof&&<p>جاري التحميل…</p>}
{s&&prof&&prof.status==='pending'&&<div className="c">طلبك وصل وبانتظار موافقة مينا.</div>}
{s&&prof&&prof.status==='rejected'&&<div className="c">لم تتم الموافقة على هذا الحساب.</div>}
{s&&prof&&prof.status==='approved'&&<>{prof.is_admin&&<Admin/>}
<div>{Object.keys(KINDS).map(k=><button key={k} type="button" className={tab===k?'':'g'} onClick={()=>setTab(k)}>{KINDS[k]}</button>)}<button type="button" className={tab==='media'?'':'g'} onClick={()=>setTab('media')}>صور وفيديو</button></div>
{tab==='media'?<Media admin={prof.is_admin} key="media"/>:<Section kind={tab} admin={prof.is_admin} key={tab}/>}</>}
{s&&<button type="button" className="g" onClick={()=>sb.auth.signOut()}>خروج</button>}</div>;}
createRoot(document.getElementById('root')).render(<App/>);
