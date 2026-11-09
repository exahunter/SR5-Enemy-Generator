const b64e=t=>btoa(unescape(encodeURIComponent(t))),b64d=t=>decodeURIComponent(escape(atob(t)));
const xmlSnapshot=(c,d)=>{const s=d.replace(/<sr5gen[\s\S]*?<\/sr5gen>/g,'');try{return s.replace(/<\/character>\s*$/,()=>'<sr5gen v="1">'+b64e(JSON.stringify(c))+'</sr5gen></character>')}catch(e){return s}};
function parseSheetXML(txt){
 const d=new DOMParser().parseFromString(txt.replace(/^﻿/,''),'application/xml');if(d.querySelector('parsererror'))throw new Error(xl('XML inválido'));
 if(!/^character$/i.test(d.documentElement.nodeName))throw new Error(xl('não é uma ficha do Chummer (.chum5)'));
 const root=d.documentElement,T=q=>{const e=root.querySelector(':scope > '+q);return e?e.textContent.trim():''},num=(e,q)=>+((e.querySelector(q)||{}).textContent)||0;
 const sn=root.querySelector(':scope > sr5gen');let c=null;if(sn){try{c=JSON.parse(b64d(sn.textContent.trim()))}catch(e){c=null}}
 const A={},S={},SP={};
 root.querySelectorAll(':scope > attributes > attribute').forEach(e=>{const k=(e.querySelector('name')||{}).textContent;if(k)A[k.trim()]=num(e,'metatypemin')+num(e,'base')+num(e,'karma')});
 root.querySelectorAll(':scope > newskills > skills > skill, :scope > skills > skill').forEach(e=>{if(/true/i.test((e.querySelector('isknowledge')||{}).textContent||''))return;const k=(e.querySelector('name')||{}).textContent;if(k){S[k.trim()]=num(e,'base')+num(e,'karma');const sp=[...e.querySelectorAll(':scope > specs > spec > name, :scope > skillspecializations > skillspecialization > name')].map(x=>x.textContent.trim()).filter(Boolean)[0];if(sp)SP[k.trim()]=specCanon(k.trim(),sp)||sp}});
 const alias=T('alias')||T('name')||'Importado';
 if(c&&c.at&&c.sk){c.alias=alias;Object.keys(A).forEach(k=>{if(c.at[k]!==undefined&&A[k]>0)c.at[k]=A[k]});if(!c.crit){Object.keys(S).forEach(k=>{if(c.sk[k]!==undefined||S[k]>0)c.sk[k]=S[k]});/* a ficha do Chummer manda nas especializações: as da ficha viram manuais, as que sumiram dela saem */c.specs=c.specs||{};Object.keys(S).forEach(k=>{if(SP[k])c.specs[k]=SP[k];else delete c.specs[k]});c.specAuto=(c.specAuto||[]).filter(k=>c.specs[k]&&!SP[k]);if(!Object.keys(c.specs).length)delete c.specs}if(!c.lock)c.lock={name:1};return{c,exact:1}}
 const cps=[...root.querySelectorAll(':scope > critterpowers > critterpower')],isCr=/true/i.test(T('iscritter')||T('critter'))||cps.length>0;
 if(isCr){const tx=(e,q)=>((e.querySelector(':scope > '+q)||{}).textContent||'').trim(),cat=T('metatypecategory')||'Spirits',sp=/Spirit/.test(cat),at2={};
  [...ATTR,'EDG'].forEach(k=>at2[k]=A[k]||1);if(A.MAG)at2.MAG=A.MAG;
  root.querySelectorAll(':scope > improvements > improvement').forEach(e=>{if(tx(e,'improvementttype')==='SkillLevel'){const n=tx(e,'improvedname'),v=+tx(e,'val')||0;if(n&&v>0)S[n]=v}});
  const F=Math.max(1,sp?(A.MAG||Math.round(+T('totaless'))||1):Math.round(ATTR.reduce((s,k)=>s+at2[k],0)/ATTR.length)),mt1=T('metatype')||alias;
  const pw=cps.map(e=>{const wk=/Weakness/i.test(tx(e,'category')),r=+tx(e,'rating')||0;return{n:(wk?'Fraqueza: ':'')+tx(e,'name'),l:r>0?String(r):'',x:tx(e,'extra'),pp:0}}).filter(p=>p.n.replace(/^Fraqueza: /,''));
  return{c:{alias,arch:'Critter',meta:mt1,critId:T('metatypeid')||'',P:{},at:at2,sk:Object.assign({},S),know:[],q:[],spells:[],powers:pw,magic:sp?F:0,nuyen:0,nuyenLeft:0,gear:[],ess:6,spirits:[],books:[...SEL],crit:{force:F,cat,min:1,raised:false,req:F},npc:{pr:F,type:'Critter',sp:'Critter'},lock:{name:1}},exact:0}}
 const mt=T('metatype'),meta=META[mt]?mt:'Human',at={};
 [...ATTR,'EDG'].forEach(k=>{at[k]=A[k]||3});if(A.MAG)at.MAG=A.MAG;if(A.RES)at.RES=A.RES;
 const sv=Object.values(S).filter(v=>v>0),pr=Math.max(0,Math.min(10,Math.round(sv.length?sv.reduce((a,b)=>a+b,0)/sv.length:1)));
 return{c:{alias,arch:'Importado',meta,P:{meta:'A',attr:'A',skill:'A',res:'A',magic:A.MAG||A.RES?'A':'E'},at,sk:Object.fromEntries(Object.entries(S).filter(([k,v])=>v>0)),specs:Object.fromEntries(Object.entries(SP).filter(([k])=>S[k]>0)),know:[],q:[],spells:[],powers:[],magic:A.MAG||0,nuyen:0,nuyenLeft:0,gear:[],ess:6,spirits:[],books:[...SEL],npc:{pr,type:'Importado',sp:''},lang:'English',lock:{name:1}},exact:0}}
async function importSheets(files){const out=[];let ex=0,ap=0,bad=[];
 const doText=(name,t)=>{t=t.replace(/^﻿/,'');
  if(/^\s*[\[{]/.test(t)){const j=JSON.parse(t),a=Array.isArray(j)?j:Array.isArray(j.npcs)?j.npcs:null;if(!a||!a.every(x=>x&&x.at&&x.alias!==undefined))throw new Error(xl('JSON não é um backup do gerador'));a.forEach(x=>{out.push(x);ex++});return}
  const r=parseSheetXML(t);out.push(r.c);r.exact?ex++:ap++};
 for(const fl of files){try{
  if(/\.zip$/i.test(fl.name)){if(typeof JSZip==='undefined')throw new Error(xl('JSZip indisponível'));const Z=await JSZip.loadAsync(await fl.arrayBuffer());for(const e of Object.values(Z.files)){if(e.dir||!/\.(chum5|xml|json)$/i.test(e.name))continue;try{doText(e.name,await e.async('string'))}catch(x){bad.push(e.name+': '+x.message)}}}
  else doText(fl.name,await fl.text())}catch(x){bad.push(fl.name+': '+x.message)}}
 if(out.length){SESSAO.fichas=capN([...SESSAO.fichas,...out]);saveN();renderNPC(SESSAO.fichas);window.scrollTo(0,document.body.scrollHeight)}
 say(out.length?tn('ficha.imp',out.length,{c:tn('ficha.completa',ex),r:ap?tn('ficha.recon',ap):''})+(bad.length?t('ficha.falhas',{l:bad.join('; ')}):''):t('ficha.nada',{l:bad.join('; ')}))}
async function saveBackup(){const data=JSON.stringify({sr5gen:'backup',v:15,npcs:SESSAO.fichas});try{const d=await claude.use('downloads');if(!d)throw 0;await d.save({filename:'sr5gen_backup.json',data});say('Backup salvo: sr5gen_backup.json ('+SESSAO.fichas.length+xl(' fichas, favoritos e travas incluídos).'))}catch(e){if(e&&e.code==='declined'){say('Download cancelado.');return}saveF('sr5gen_backup.json.txt',data)}}
