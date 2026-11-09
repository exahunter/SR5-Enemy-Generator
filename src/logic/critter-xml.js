function critXML(c){
 const k=c.crit,Z='00000000-0000-0000-0000-000000000000',F=k.force,sp=/Spirit/.test(k.cat),mid=(c.critId||'')||Z;
 if(!META[c.meta])META[c.meta]={cat:k.cat,lim:{},sp:{A:7},kc:{},id:mid,hid:1,crit:1};
 const t=Object.assign({},c,{crit:null,magic:0,spirits:[],powers:[],q:[],gear:(c.gear||[]).filter(x=>x.nat),spells:[],know:[],mm:null,echoes:null}),
  d=new DOMParser().parseFromString(runXML(upTo(XML_PIPE,xmlCritter),t),'application/xml'),r=d.documentElement,
  ch=n=>[...r.children].find(e=>e.tagName===n),
  mk=(n,o)=>{const e=d.createElement(n);Object.entries(o||{}).forEach(([a,v])=>{const x=d.createElement(a);if(v!==''&&v!=null)x.textContent=v;e.appendChild(x)});return e},
  set=(n,v)=>{let e=ch(n);if(!e){e=d.createElement(n);r.appendChild(e)}e.textContent=v};
 set('metatype',c.meta);set('metatypeid',mid);set('metavariant','');set('metavariantid',Z);set('metatypecategory',k.cat||'Spirits');
 set('iscritter','True');set('critter','True');set('ignorerules','True');set('created','True');
 set('adept','False');set('magician','False');set('technomancer','False');set('ai','False');
 set('magenabled',c.at.MAG?'True':'False');set('resenabled','False');set('depenabled','False');set('totaless',(sp?(c.at.MAG||F):6).toFixed(1));
 const A=ch('attributes');while(A.firstChild)A.removeChild(A.firstChild);
 const AT=[['STR',c.at.STR,'Standard'],['DEP',1,'Special'],['MAGAdept',1,'Special'],['CHA',c.at.CHA,'Standard'],['INT',c.at.INT,'Standard'],['AGI',c.at.AGI,'Standard'],['REA',c.at.REA,'Standard'],['RES',1,'Special'],['ESS',sp?F:6,'Special'],['EDG',c.at.EDG||1,'Special'],['MAG',c.at.MAG||1,'Special'],['LOG',c.at.LOG,'Standard'],['BOD',c.at.BOD,'Standard'],['WIL',c.at.WIL,'Standard']];
 AT.forEach(([n,v,cat])=>A.appendChild(mk('attribute',{name:n,metatypemin:v,metatypemax:v,metatypeaugmax:v,base:0,karma:0,metatypecategory:cat,totalvalue:v})));
 r.querySelectorAll('newskills > skills > skill').forEach(s=>{['base','karma'].forEach(n=>{const e=[...s.children].find(x=>x.tagName===n);if(e)e.textContent='0'})});
 const cp=ch('critterpowers')||(()=>{const e=d.createElement('critterpowers');r.appendChild(e);return e})();while(cp.firstChild)cp.removeChild(cp.firstChild);
 const IMP=[],imp=(unique,ty,nm,val,src,sn)=>mk('improvement',{unique:unique||'',target:'',improvedname:nm,sourcename:sn||mid,min:0,max:0,aug:0,augmax:0,val:val,rating:0,exclude:'',condition:'',improvementttype:ty,improvementsource:src||'Metatype',custom:'False',customname:'',customid:'',customgroup:'',addtorating:0,enabled:1,order:0,notes:'',notesColor:'#E3813C'});
 if(c.at.MAG)IMP.push(imp('enableattribute','Attribute','MAG',0));
 IMP.push(imp('enabletab','SpecialTab','Critter',0));
 if(sp)IMP.push(imp('initiativepass','InitiativeDice','',1));
 (c.powers||[]).forEach(p=>{const wk=/^Fraqueza: /.test(p.n),n=p.n.replace(/^Fraqueza: /,''),D=(wk?CWK:CPW)[n]||CPW[n]||CWK[n]||{},g=crypto.randomUUID();
  cp.appendChild(mk('critterpower',{sourceid:D.id||'',guid:g,name:n,extra:p.x||'',rating:+p.l||0,category:D.cat||(wk?'Weakness':'Paranormal'),type:D.type||'',action:D.act||'',range:D.rng||'',duration:D.dur||'',grade:0,source:D.src||'SR5',page:D.pg||'',karma:D.k||0,points:0,counttowardslimit:'False',bonus:'',notes:''}));
  IMP.push(imp('','CritterPower',g,0))});
 Object.keys(c.sk||{}).forEach(n=>IMP.push(imp('','SkillLevel',n,c.sk[n])));
 const I=ch('improvements')||(()=>{const e=d.createElement('improvements');r.appendChild(e);return e})();IMP.forEach(e=>I.appendChild(e));
 const DEF={movement:'',walk:'2/1/0',run:'4/0/0',sprint:'2/1/0',walkalt:'2/1/0',runalt:'4/0/0',sprintalt:'2/1/0',essenceatspecialstart:(sp?(c.at.MAG||F):6).toFixed(1),mainmugshotindex:-1,mugshots:'',gender:'',age:'',eyes:'',height:'',weight:'',skin:'',hair:'',description:'',background:'',concept:'',notes:'',playername:'',gamenotes:'',edgeused:0,contactpoints:6,spelllimit:0,cfplimit:0,ainormalprogramlimit:0,aiadvancedprogramlimit:0,currentcounterspellingdice:0,currentliftcarryhits:0,basecarrylimit:30,baseliftlimit:45,totalcarriedweight:0,encumbranceinterval:15,streetcred:0,notoriety:0,publicawareness:0,burntstreetcred:0,baseastralreputation:0,basewildreputation:0,cyberwaredisabled:'False',initiationdisabled:'False',prototypetranshuman:0,groupname:'',groupnotes:'',physicalcmfilled:0,stuncmfilled:0,psyche:'False'};
 Object.entries(DEF).forEach(([n,v])=>{if(!ch(n)){const e=d.createElement(n);if(v!=='')e.textContent=v;r.appendChild(e)}});
 if(!ch('calculatedvalues'))r.appendChild(mk('calculatedvalues',{physicalcm:8+Math.ceil(c.at.BOD/2),physicalcmthresholdoffset:0,physicalcmoverflow:c.at.BOD+1,stuncm:8+Math.ceil(c.at.WIL/2),stuncmthresholdoffset:0}));
 return '<?xml version="1.0" encoding="utf-8"?>\n'+new XMLSerializer().serializeToString(d.documentElement)}
const xmlCritter=(c,s)=>c.crit?critXML(c):s;
const jsonCritter=(c,o)=>{if(!c.crit)return o;const CP=(c.powers||[]).map(p=>{const wk=/^Fraqueza: /.test(p.n),n=p.n.replace(/^Fraqueza: /,''),D=(wk?CWK:CPW)[n]||CPW[n]||CWK[n]||{};return{sourceid:D.id||'',guid:crypto.randomUUID(),name:n,name_english:n,extra:p.x||null,rating:String(+p.l||0),category:D.cat||(wk?'Weakness':'Paranormal'),type:D.type||null,action:D.act||null,range:D.rng||null,duration:D.dur||null,grade:'0',source:D.src||'SR5',page:D.pg||null,karma:String(D.k||0),points:'0',counttowardslimit:'False',bonus:null,notes:null}});const t=Object.assign({},c,{crit:null,magic:0,spirits:[],powers:[],q:[],gear:(c.gear||[]).filter(x=>x.nat),spells:[],know:[],_ddice:derived(c).dice});if(!META[c.meta])META[c.meta]={cat:c.crit.cat,lim:{},sp:{A:7},kc:{},id:c.critId||'',hid:1,crit:1};o=runJSON(upTo(JSON_PIPE,jsonCritter),t);const ch=o.characters.character;ch.critter='True';ch.iscritter='True';ch.ignorerules='True';ch.created='True';ch.metatypecategory=c.crit.cat;xPut(ch,'critterpowers','critterpower',CP);return o};

