const jh=()=>{const e=document.getElementById('jhtml');return !e||e.checked};
try{const e=document.getElementById('jhtml'),v=localStorage.getItem('sr5_jhtml');if(e){if(v!==null)e.checked=v==='1';e.addEventListener('change',()=>{try{localStorage.setItem('sr5_jhtml',e.checked?'1':'0')}catch(x){avisa('pdf-json-notas',x)}})}}catch(x){avisa('pdf-json-notas',x)}
const JKIND={skill:'skill',weapon:'weapon',accessory:'accessory',armor:'armor',armormod:'armormod',gear:'gear',cyberware:'cyberware',vehicle:'vehicle',quality:'quality',
 spell:'spell',power:'power',martialart:'martialart',martialarttechnique:'martialarttechnique',metamagic:'metamagic',complexform:'complexform',critterpower:'critterpower',
 tradition:'tradition',mentorspirit:'mentorspirit',drug:'drug',lifestyle:'lifestyle',aiprogram:'aiprogram',spirit:'spirit'};
const jsonQuality=(c,o)=>{
 const ch=o&&o.characters&&o.characters.character;if(!ch)return o;
 const walk=(v,key)=>{
  if(Array.isArray(v))return v.forEach(x=>walk(x,key));
  if(!v||typeof v!=='object')return;
  const kind=JKIND[key];
  if(kind&&typeof v.name==='string'&&(v.guid||key==='tradition')&&v.isknowledge!=='True'){
   let [sr,pgn]=srcPage(v,key);
   if(key==='tradition'&&!sr)try{const t=c.talent==='Technomancer'&&c.stream?streamInfo(c):tradInfo(c);sr=t.src;pgn=t.pg}catch(e){avisa('pdf-json-notas',e)}
   const cur=v.notes?String(v.notes):'',nop=nameOnPage(v,key),nms=[...new Set([nop,v.name_english,v.name].filter(Boolean))];
   const R=bookNote(kind,nms,sr||v.source||'',pgn||v.page||''),sr2=R.src||sr||'?',pg2=R.page||pgn;
   const paras=R.paras?R.paras.filter(Boolean):null;
   WHY[sr2+'|'+v.name]={n:v.name,why:R.paras?(kind==='quality'&&R.how!=='cascade'?xl('texto completo não achado — ')+qualityWhy(sr2,pg2,nop||v.name_english||v.name):''):(kind==='quality'&&/^título não achado/.test(R.why)?xl('texto completo não achado — ')+qualityWhy(sr2,pg2,nop||v.name_english||v.name):R.why),k:kind,pg:pg2};
   const hasBook=paras&&!cur.includes((R.paras[2]||R.paras[0]||'').slice(0,60));
   if(hasBook||cur)v.notes=composeNote(cur,hasBook?paras:'',jh());
   else if(key==='martialarttechnique')v.notes=composeNote(v.name.toUpperCase()+'\n'+v.source+(v.page?' p. '+v.page:''),'',jh())}
  Object.entries(v).forEach(([k,x])=>walk(x,k))};
 walk(ch,'');
 if(!ch.notes){try{const d=new DOMParser().parseFromString(toXML(c),'application/xml'),n=[...d.documentElement.children].find(x=>x.tagName==='notes');if(n&&n.textContent.trim())ch.notes=composeNote(n.textContent,'',jh())}catch(e){avisa('pdf-json-notas',e)}}
 stat();
 return o};

/* ordem de execução das exportações (cada etapa: (c, doc) => doc) */
XML_PIPE=[plain(xmlBase),plain(xmlExtras),plain(xmlMagic),plain(xmlExtras2),xmlCritter,xmlVessel,NOTES.xml,xmlSnapshot];
JSON_PIPE=[plain(jsonBase),plain(jsonMagic),plain(jsonExtras2),jsonCritter,jsonVessel,NOTES.json,jsonQuality];

