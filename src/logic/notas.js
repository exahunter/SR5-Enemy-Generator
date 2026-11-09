/* ===== Notas do Chummer: pré-preenchimento do campo <notes> =====
 * Com os PDFs vinculados, o Chummer preenche "Notas" de cada item com um trecho do livro
 * (NOME / Type–Action–Range–Duration / texto). Este app não tem os PDFs, então grava a mesma
 * estrutura a partir dos dados que já tem: fonte e página, categoria e números de regra.
 * Notas que já vêm preenchidas são preservadas. Texto de livro nunca vai embutido no HTML: só entra o que for lido dos PDFs do usuário (bookLines).
 * A posição deste bloco no pipeline (depois de tudo que muda o XML/JSON, antes do snapshot) está em XML_PIPE/JSON_PIPE. */
const NOTES=(()=>{
 const on=()=>{const e=document.getElementById('notesOn');return !e||e.checked};
 const kid=(el,t)=>[...el.children].find(x=>x.tagName===t);
 const val=(el,t)=>{const n=kid(el,t);return n?n.textContent.trim():''};
 const SEP=' · ';
 const sign=n=>(n>0?'+':'')+n;
 const money=v=>/^\d+$/.test(v)?'¥'+nyArquivo(v):v;
 const clean=v=>String(v).replace(/\{(\w+)\}/g,'$1');

 // [tag no XML, rótulo]; valores "0" são omitidos nos campos de ZERO
 const FIELDS={
  weapon:[['damage','Damage'],['ap','AP'],['mode','Mode'],['rc','RC'],['ammo','Ammo'],['accuracy','Accuracy'],['reach','Reach'],['conceal','Conceal'],['avail','Avail'],['cost','Cost']],
  armor:[['armor','Armor'],['armorcapacity','Capacity'],['avail','Avail'],['cost','Cost']],
  gear:[['rating','Rating'],['devicerating','Device Rating'],['attack','Attack'],['sleaze','Sleaze'],['dataprocessing','Data Processing'],['firewall','Firewall'],['capacity','Capacity'],['avail','Avail'],['cost','Cost']],
  cyberware:[['rating','Rating'],['grade','Grade'],['ess','Essence'],['capacity','Capacity'],['avail','Avail'],['cost','Cost']],
  vehicle:[['handling','Handling'],['speed','Speed'],['accel','Accel'],['body','Body'],['armor','Armor'],['pilot','Pilot'],['sensor','Sensor'],['avail','Avail'],['cost','Cost']],
  spell:[['type','Type'],['range','Range'],['damage','Damage'],['duration','Duration'],['dv','Drain']],
  critterpower:[['type','Type'],['action','Action'],['range','Range'],['duration','Duration']],
  metamagic:[['grade','Grade']]
 };
 const ZERO=new Set(['rating','capacity','reach','mode','ammo','damage']);
 const hide=(kind,key,v,el)=>{
  if(v===''||(key==='cost'&&v==='0'))return true;
  if(v==='0'&&ZERO.has(key)&&!(kind==='weapon'&&key==='damage'))return true;
  if(kind==='weapon'){const melee=val(el,'type')==='Melee';if(melee&&['mode','ammo','rc'].includes(key))return true;if(!melee&&key==='reach')return true}
  return false};

 // Efeitos das qualidades (lista bn do gerador) em texto de regra
 const effect=([ty,nm,v,cond,X])=>{const c=cond?' ('+cond+')':'';
  switch(ty){
   case'SkillAttribute':return sign(v)+' dice on tests with '+nm+'-linked skills'+c;
   case'SkillCategory':return sign(v)+' dice on '+nm+' skills'+c;
   case'Skill':return sign(v)+' dice on '+nm+c;
   case'Attribute':{const p=X?Object.entries(X).filter(([,n])=>n).map(([k,n])=>k+' '+sign(n)):[];if(v)p.unshift(sign(v));return p.length?nm+': '+p.join(', ')+c:''}
   case'Notoriety':return sign(v)+' Notoriety';
   case'PublicAwareness':return sign(v)+' Public Awareness';
   case'Fame':return 'Fame';
   case'DamageResistance':return sign(v)+' dice to resist damage';
   default:return ''}};

 const TAGKIND={weapon:'weapon',accessory:'accessory',armor:'armor',armormod:'armormod',gear:'gear',cyberware:'cyberware',vehicle:'vehicle',quality:'quality',spell:'spell',power:'power',
  martialart:'martialart',martialarttechnique:'martialarttechnique',metamagic:'metamagic',complexform:'complexform',critterpower:'critterpower',tradition:'tradition',mentorspirit:'mentorspirit',
  drug:'drug',lifestyle:'lifestyle',aiprogram:'aiprogram',spirit:'spirit',skill:'skill'};
 const ref=(el,extra)=>{let s=val(el,'source'),p=val(el,'page');
  if(!s||!p){try{const P=window.PDFNOTES,r=P&&P.ref&&P.ref(TAGKIND[el.tagName]||'',[val(el,'name'),val(el,'name_english')],s,p);if(r){s=s||r.src;p=p||r.page}}catch(e){avisa('notas',e)}}
  return[s&&(p?s+' p. '+p:s),extra].filter(Boolean).join(SEP)};
 const bookLines=(el,kind)=>{try{const P=window.PDFNOTES;if(!P||!P.note||window.__QJ)return[];
   const nm=val(el,'name'),r=P.note(kind,[nm,val(el,'name_english')],val(el,'source'),val(el,'page'));
   return r&&r.paras?[r.paras[1]].concat(r.paras.slice(2)).filter(Boolean):[]}catch(e){return[]}};
 const stats=(kind,el)=>(FIELDS[kind]||[]).map(([k,l])=>{const v=val(el,k);return hide(kind,k,v,el)?'':l+': '+clean(k==='cost'?money(v):v)}).filter(Boolean).join(SEP);
 const head=el=>val(el,'name').toUpperCase();

 // Texto da nota de cada tipo de item. c = personagem do app (para dados que o XML não guarda).
 const TEXT={
  quality:(el,c)=>{const o=(c.q||[]).find(q=>q.n===val(el,'name'))||{},bp=Math.abs(+val(el,'bp')||0),
   fx=(o.bn||[]).map(effect).filter(Boolean),
   P=!window.__QJ&&window.PDFNOTES&&window.PDFNOTES.quality&&window.PDFNOTES.resolve(val(el,'source'),val(el,'page'),[window.PDFNOTES.nop(val(el,'name')),val(el,'name_english'),val(el,'name')]),
   sel=o.x&&'Selection: '+o.x,efx=fx.length&&'Effects: '+fx.join('; ');
   // com o texto do livro: NOME / custo como no livro / texto (um parágrafo por linha), como o Chummer grava; sem ele: resumo do app
   return P?[head(el),P[1],sel,efx].concat(P.slice(2)):[head(el),ref(el,[val(el,'qualitytype'),bp+' Karma'].join(SEP)),sel,efx]},
  power:el=>{const p=+val(el,'pointsperlevel')||0,x=+val(el,'extrapointcost')||0,lv=val(el,'levels')==='True',mx=val(el,'maxlevels'),a=val(el,'action'),ex=val(el,'extra');
   return[head(el),ref(el),['Cost: '+p+(lv?' PP per level':' PP')+(x?' (+'+x+' extra)':''),'Level: '+val(el,'rating')+(mx?' (max '+mx+')':''),a&&'Action: '+a,ex&&'Selection: '+ex].filter(Boolean).join(SEP)]},
  martialart:el=>{const t=[...el.querySelectorAll('martialarttechnique')].map(x=>val(x,'name')+' ('+ref(x)+')');
   return[head(el),ref(el),'Cost: '+val(el,'cost')+' Karma',t.length&&'Techniques: '+t.join('; ')]},
  skill:(el,c)=>{const n=val(el,'name'),r=(c.sk||{})[n],k=SKA[n],a=k&&c.at?c.at[k]:undefined;if(r===undefined||!k)return null;
   return[n.toUpperCase(),val(el,'skillcategory'),'Linked attribute: '+k+(a!==undefined?' '+a:'')+SEP+'Rating '+r+(a!==undefined?SEP+'Dice pool '+(a+r):'')+((c.specs||{})[n]?SEP+'Specialization '+c.specs[n]+' (+'+SPEC_B+(a!==undefined?' → '+(a+r+SPEC_B):'')+')':'')]}
 };
 const generic=kind=>(el,c)=>[head(el),ref(el,val(el,'category')),stats(kind,el)];

 // contêiner no XML -> tipo de item
 const CONT={weapons:'weapon',armors:'armor',gears:'gear',cyberwares:'cyberware',vehicles:'vehicle',qualities:'quality',spells:'spell',powers:'power',
  metamagics:'metamagic',complexforms:'complexform',martialarts:'martialart',critterpowers:'critterpower',
  spirits:'spirit',mentorspirits:'mentorspirit',drugs:'drug',aiprograms:'aiprogram',lifestyles:'lifestyle'};

 const summary=c=>{try{const n=c.npc||{},d=derived(c),a=c.at;
  return['NPC: '+c.alias,
   [c.meta,n.type,n.role&&xl('Função: ')+xl(n.role),n.pr!=null&&'Tier '+n.pr,n.threat&&xl('Ameaça ')+n.threat,n.group&&xl('Grupo: ')+n.group].filter(Boolean).join(SEP),
   xl('Iniciativa ')+d.ini+'+'+d.dice+'d6'+SEP+xl('Monitor físico/atordoamento ')+d.fis+'/'+d.atu+SEP+xl('Defesa ')+(d.REA+a.INT)+SEP+xl('Limites ')+d.lf+'/'+d.lm+'/'+d.ls]
  }catch(e){return[]}};
 const FOOT=xl('As notas dos itens são um resumo gerado pelo app (fonte, página e dados de regra). O texto integral dos livros vem dos PDFs: vincule-os nas opções do Chummer.');

 function build(c,xml){
  const d=new DOMParser().parseFromString(xml,'application/xml'),map=new Map();
  if(d.querySelector('parsererror'))return{xml,map};
  const r=d.documentElement;
  const put=(el,kind,lines)=>{
   const text=(lines||[]).filter(Boolean).join('\n'),bk=kind==='quality'?[]:bookLines(el,kind);
   let n=kid(el,'notes');
   if(!n){n=d.createElement('notes');el.appendChild(n)}
   const cur=n.textContent.trim();
   if(!cur&&(text||bk.length))n.textContent=[text].concat(bk).filter(Boolean).join('\n');
   else if(cur&&bk.length&&!cur.includes(bk[0].slice(0,60)))n.textContent=cur+'\n'+bk.join('\n');
   if(n.textContent.trim())map.set(kind+'|'+val(el,'name'),n.textContent)};
  [...r.children].forEach(box=>{const kind=CONT[box.tagName];if(!kind)return;
   [...box.children].forEach(el=>{
    put(el,kind,(TEXT[kind]||generic(kind))(el,c));
    if(kind==='martialart')el.querySelectorAll('martialarttechnique').forEach(t=>put(t,'martialarttechnique',[head(t),ref(t)]))})});
  r.querySelectorAll('newskills > skills > skill').forEach(el=>{const l=TEXT.skill(el,c);if(l)put(el,'skill',l)});
  [['weapons > weapon > accessories > accessory','accessory'],['armors > armor > armormods > armormod','armormod'],['gears > gear > children > gear','gear']]
   .forEach(([sel,k])=>r.querySelectorAll(sel).forEach(el=>put(el,k,generic(k)(el,c))));
  [...r.children].filter(x=>x.tagName==='tradition').forEach(el=>put(el,'tradition',generic('tradition')(el,c)));
  // nota geral da ficha: resumo do NPC + notas que o gerador já tinha escrito (relações, mentor)
  let cn=[...r.children].find(x=>x.tagName==='notes');
  if(!cn){cn=d.createElement('notes');r.appendChild(cn)}
  const old=cn.textContent.trim();
  if(!/^NPC: /.test(old))cn.textContent=[summary(c).join('\n'),old,FOOT].filter(Boolean).join('\n\n');
  return{xml:'<?xml version="1.0" encoding="utf-8"?>\n'+new XMLSerializer().serializeToString(r),map}}

 // JSON: coloca "notes" em cada objeto de item com o mesmo texto do XML
 const JK={weapon:'weapon',weapons:'weapon',armor:'armor',armors:'armor',gear:'gear',gears:'gear',cyberware:'cyberware',cyberwares:'cyberware',
  vehicle:'vehicle',vehicles:'vehicle',quality:'quality',qualities:'quality',spell:'spell',spells:'spell',power:'power',powers:'power',
  skill:'skill',skills:'skill',martialart:'martialart',martialarts:'martialart',metamagic:'metamagic',metamagics:'metamagic',
  complexform:'complexform',complexforms:'complexform',critterpower:'critterpower',critterpowers:'critterpower',
  accessory:'accessory',accessories:'accessory',armormod:'armormod',armormods:'armormod',spirit:'spirit',spirits:'spirit',mentorspirit:'mentorspirit',mentorspirits:'mentorspirit',
  drug:'drug',drugs:'drug',aiprogram:'aiprogram',aiprograms:'aiprogram',lifestyle:'lifestyle',lifestyles:'lifestyle'};
 function inJSON(o,kind,map){
  if(Array.isArray(o))return o.forEach(x=>inJSON(x,kind,map));
  if(!o||typeof o!=='object')return;
  if(kind&&typeof o.name==='string'&&o.guid){const t=map.get(kind+'|'+o.name);if(t&&!o.notes)o.notes=t}
  Object.entries(o).forEach(([k,v])=>inJSON(v,JK[k]||(kind&&!o.name?kind:null),map))}

 const self={on};
 self.xml=(c,s)=>{if(!on())return s;const r=build(c,s);self.last=r.map;return r.xml};
 self.json=(c,o)=>{if(!on())return o;
  window.__QJ=1;try{toXML(c)}finally{window.__QJ=0}
  inJSON(o,null,self.last||new Map());return o};

 // lembra a escolha do usuário
 try{const e=document.getElementById('notesOn'),v=localStorage.getItem('sr5_notesOn');
  if(e){if(v!==null)e.checked=v==='1';e.addEventListener('change',()=>{try{localStorage.setItem('sr5_notesOn',e.checked?'1':'0')}catch(x){avisa('notas',x)}})}}catch(x){avisa('notas',x)}
 return self})();


