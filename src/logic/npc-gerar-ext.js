const SKGRP={Firearms:['Automatics','Longarms','Pistols'],'Close Combat':['Blades','Clubs','Unarmed Combat'],Athletics:['Flight','Gymnastics','Running','Swimming'],Stealth:['Disguise','Palming','Sneaking'],Influence:['Etiquette','Leadership','Negotiation'],Acting:['Con','Impersonation','Performance'],Cracking:['Cybercombat','Electronic Warfare','Hacking'],Electronics:['Computer','Hardware','Software'],Engineering:['Aeronautics Mechanic','Automotive Mechanic','Industrial Mechanic','Nautical Mechanic'],Biotech:['Biotechnology','Cybertechnology','First Aid','Medicine'],Outdoors:['Navigation','Survival','Tracking'],Sorcery:['Counterspelling','Ritual Spellcasting','Spellcasting'],Conjuring:['Banishing','Binding','Summoning'],Enchanting:['Alchemy','Artificing','Disenchanting'],Tasking:['Compiling','Decompiling','Registering']};
/* Iniciação: cada grau dá uma metamagia OU uma arte (c.mm guarda na ordem dos graus; arte tem art:1). Metamagia exige o que o Chummer manda (arte, outra metamagia, qualidade Adept, grau mínimo);
   tradição, magia, arte marcial etc. o gerador não cumpre, então essas ficam de fora. Arte só entra se ainda houver metamagia que ela destrave, ou se não restar metamagia livre.
   Artes são do Street Grimoire: com ele desmarcado a exigência de arte cai (o livro base não tem artes; o iniciado escolhe a metamagia direto). */
function iniGerar(tl,grade){const ad=tl==='Adept',my=tl==='Mystic Adept',got=[],ok=s=>okSrc(s),tipo=m=>ad?m.ad:my?(m.ad||m.mg):m.mg;
 const has=(t,v,g)=>t==='art'?(got.some(x=>x.art&&x.n===v)||!INI.AR.some(a=>a.n===v&&ok(a.s))):t==='metamagic'?got.some(x=>!x.art&&x.n===v):t==='quality'?(v==='Adept'?(ad||my):v==='Mystic Adept'?my:false):t==='initiategrade'?g>=+v:false;
 const meets=(m,g,ex)=>{const h=(t,v)=>ex&&ex.t===t&&ex.v===v||has(t,v,g);return m.rq.all.every(([t,v])=>h(t,v))&&(!m.rq.one.length||m.rq.one.some(([t,v])=>h(t,v)))};
 const MMs=INI.MM.filter(m=>!m.tr&&ok(m.s)&&tipo(m)),ARs=ad?[]:INI.AR.filter(a=>ok(a.s));
 for(let i=0;i<grade;i++){const g=i+1,free=MMs.filter(m=>!got.some(x=>!x.art&&x.n===m.n)&&meets(m,g));
  const arts=ARs.filter(a=>!got.some(x=>x.art&&x.n===a.n)&&MMs.some(m=>!got.some(x=>!x.art&&x.n===m.n)&&!meets(m,g)&&meets(m,g,{t:'art',v:a.n})));   // artes que destravam metamagia ainda indisponível
  const useArt=arts.length&&(!free.length||(i<grade-1&&Math.random()<.5));
  if(useArt){const a=pick(arts);got.push({n:a.n,id:a.id,s:a.s,p:a.p,art:1})}else if(free.length){const m=pick(free);got.push({n:m.n,id:m.id,s:m.s,p:m.p})}else break}
 return got}
npcPos(xl('implantes, kits e magia'),function(c,pr,type,sp,metaSel){genImplants(c);if(c.npc&&c.npc.sp==='Rigger')genRiggerKit(c);if(c.npc&&c.npc.sp==='Decker'&&!(META[c.meta]||{}).ai)genDeckerKit(c);
  if((META[c.meta]||{}).ai)c.q=[];
 if(c.talent==='Adept'&&c.magic){c.pp=c.magic-(c.magicLoss||0);c.powers=genPowers(c)}
 if(c.talent==='Magician'&&c.magic)genMageKit(c,pr);
 if(c.talent==='Mystic Adept'&&c.magic){genMageKit(c,pr);const ef=magEff(c);c.spells=(c.spells||[]).slice(0,Math.max(1,Math.ceil((c.spells||[]).length*.5)));c.spirits=(c.spirits||[]).slice(0,1);c.arch='Adepto místico';
  c.pp=Math.min(ef,Math.max(1,Math.floor(ef/2)+(pr>=7?1:0)));c.powers=genPowers(c)}   // adepto místico: Magia dividida entre magias e pontos de poder (5 de carma cada)
  if(c.talent==='Technomancer'){const ok=CFORMS.filter(f=>okSrc(f[3])),pl=ok.length?ok:CFORMS;c.cf=shuffle(pl).slice(0,Math.min(pl.length,2+Math.ceil(pr/2)))
   const nS=pr>=8?3:pr>=5?2:1,fr=Math.max(1,Math.min(c.sk.Compiling||pr,2*(c.at.RES-(c.resLoss||0))));c.spirits=shuffle(['Courier','Crack','Data','Fault','Machine']).slice(0,nS).map(t=>({n:t+' Sprite',force:fr,svc:Math.max(1,Math.ceil((c.sk.Registering||1)/2)),sprite:1}))}
 
  (()=>{const IN=EMB.IN,ok=s=>okSrc(s),tl=c.talent;
   if(tl==='Technomancer'){const grade=Math.min(c.at.RES-(c.resLoss||0),pr>=9?3:pr>=6?2:pr>=4?1:0),pool=IN.E.filter(e=>ok(e.s)),got=[];
    for(let i=0;i<grade;i++){const av=pool.filter(e=>got.filter(x=>x.n===e.n).length<e.lim);if(!av.length)break;const e=pick(av);got.push(e)}
    if(got.length){c.sub=got.length;c.echoes=got}}
   else if((tl==='Adept'||tl==='Magician'||tl==='Mystic Adept')&&c.magic){const grade=Math.min(c.magic-(c.magicLoss||0),pr>=9?3:pr>=6?2:pr>=4?1:0),got=iniGerar(tl,grade);
    if(got.length){c.init=got.length;c.mm=got}}})();
  applyMA(c);npcFinish(c,type)});
function xmlMagic(c,s){const E=esc,G=()=>crypto.randomUUID(),B=v=>v?'True':'False';
 if(c.ma){const m=c.ma;s=s.replace('<martialarts />','<martialarts><martialart><sourceid>'+m.id+'</sourceid><guid>'+G()+'</guid><name>'+E(m.n)+'</name><source>'+E(m.s)+'</source><page>'+E(m.p)+'</page><cost>'+m.c+'</cost><isquality>False</isquality><martialarttechniques>'+m.tech.map(t=>'<martialarttechnique><sourceid>'+t.id+'</sourceid><guid>'+G()+'</guid><name>'+E(t.n)+'</name><source>'+E(t.s)+'</source><page>'+E(t.p)+'</page></martialarttechnique>').join('')+'</martialarttechniques></martialart></martialarts>')}
 return s}
function jsonMagic(c,o){const ch=o.characters.character;
 if(c.ma)ch.martialarts={martialart:{sourceid:c.ma.id,guid:crypto.randomUUID(),name:c.ma.n,source:c.ma.s,page:c.ma.p,cost:String(c.ma.c),isquality:'False',martialarttechniques:{martialarttechnique:c.ma.tech.map(t=>({sourceid:t.id,guid:crypto.randomUUID(),name:t.n,source:t.s,page:t.p}))}}};
 if(c.talent==='Technomancer'){const U=()=>crypto.randomUUID(),Z='00000000-0000-0000-0000-000000000000',r=c.at.RES||1,[mn,mx]=lim(c.meta,'RES'),arr=x=>x?(Array.isArray(x)?x:[x]):[];
   ch.technomancer='True';ch.resenabled='True';
   xAttrSet(ch,{name_english:'RES',name:'RES',base:String(r),total:String(r),min:String(mn),max:String(mx),aug:String(mx),bp:'0',metatypecategory:'Special'});
   xPut(ch,'complexforms','complexform',(c.cf||[]).map(f=>({sourceid:f[2]||Z,guid:U(),name:f[0],name_english:f[0],extra:null,source:f[3]||'SR5'})));
   xAdd(ch,'qualities','quality',{sourceid:'c4b35412-bd91-45b4-b428-29da7edd5ff4',guid:U(),name:'Technomancer',name_english:'Technomancer',fullname:'Technomancer',extra:null,bp:'15',qualitytype:'Positive',qualitytype_english:'Positive',qualitysource:'Heritage',metagenic:'False',source:'SR5',page:null,notes:null});
   xAdd(ch,'gears','gear',xFinish.gear({sourceid:'73b55822-dfb8-48f5-8ff8-37ef498ab9ef',guid:U(),name:'Living Persona',name_english:'Living Persona',fullname:'Living Persona',fullname_english:'Living Persona',category:'Commlinks',category_english:'Commlinks',cost:'0',owncost:'0',source:'SR5',equipped:'True'}))}
 if(c.echoes||c.mm){const isE=!!c.echoes,list=c.echoes||c.mm,U=()=>crypto.randomUUID();
   if(isE)ch.submersiongrade=String(list.length);else ch.initiategrade=String(list.length);
   ch.initiationgrades={initiationgrade:list.map((m,i)=>({guid:U(),res:isE?'True':'False',grade:String(i+1),group:'False',ordeal:'False',schooling:'False'}))};
   xPut(ch,'arts','art',list.map((m,i)=>m.art?{sourceid:m.id,guid:U(),name:m.n,name_english:m.n,extra:null,source:m.s,page:m.p,grade:String(i+1),improvementsource:'Metamagic'}:null).filter(Boolean));
   xPut(ch,'metamagics','metamagic',list.map((m,i)=>m.art?null:({sourceid:m.id,guid:U(),name:m.n,name_english:m.n,extra:null,source:m.s,page:m.p,paidwithkarma:'False',grade:String(i+1),improvementsource:isE?'Echo':'Metamagic'})).filter(Boolean))}
   if(c.grp&&Object.keys(c.grp).length)ch.skillgroups={group:Object.entries(c.grp).map(([g,r])=>({guid:crypto.randomUUID(),name:g,base:String(r),karma:'0'}))};
 return o}
