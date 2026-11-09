/* ===== v29: dados do Chummer que ainda não eram aplicados aos NPCs/critters =====
 * Fonte: data/chummer-extras.json (XD), gerado por tools/gen_extras.py a partir do data/ do Chummer:
 *   ST/SPR  streams.xml        stream do technomante e seus sprites (com poderes e perícias)
 *   PAR/MEN paragons/mentors   paragon (technomante) e mentor spirit (mago / adepto)
 *   DRG/DGR drugcomponents     drogas prontas e graus
 *   VES     vessels.xml        vasos inanimados para espíritos com Inhabitation
 *   AIP     programs.xml       programas avançados de IA (Advanced Programs)
 * Além disso aplica a NPCs o que só existia como lista: contatos (contacts.xml) e estilo de vida (lifestyles.xml).
 * Tudo respeita os livros marcados (okSrc). Os campos guardados em c: stream, mentor, drugs, contacts, life, aip, vessel. */
const NM_MENTOR_Q={Mentor:{n:'Mentor Spirit',id:'ced3fecf-2277-4b20-b1e0-894162ca9ae2',c:5,s:'SR5',pg:'76'},Paragon:{n:'Paragon',id:'c5311ee0-8a9b-41b9-857f-28541090968a',c:0,s:'KC',pg:'102'}};
const xdOkNpc=c=>c&&c.npc&&!c.crit&&c.npc.kt!=null;
const xdTal=c=>c.talent==='Technomancer'?'tech':(c.talent==='Magician'||c.talent==='Adept'||c.talent==='Mystic Adept')&&c.magic?(c.talent==='Adept'?'adept':'mage'):'';
const xdFx=(s,F)=>{s=String(s==null?'':s).replace(/F/g,F);return/^[\d+\-*\/() .]+$/.test(s)?Math.max(0,Math.round(Function('return '+s)())):0};

/* ---------- stream do technomante + sprites ---------- */
const streamInfo=c=>{const t=XD.ST.find(x=>x.n===c.stream)||XD.ST[0];return{n:t.n,id:t.id,dr:t.dr,src:t.src,pg:t.pg,sp:t.sp}};
const streamDrain=c=>{const t=streamInfo(c);return(t.dr.match(/\{(\w+)\}/g)||[]).reduce((s,k)=>s+(+((c.at||{})[k.slice(1,-1)])||0),0)};
const resEff=c=>Math.max(1,(+(c.at||{}).RES||0)-(c.resLoss||0));
function xdStream(c,pr){
 const pool=XD.ST.filter(s=>okSrc(s.src)),st=pool.length?pick(pool):XD.ST[0];c.stream=st.n;
 const old=c.spirits||[],n=old.length,fr=old[0]?old[0].force:Math.max(1,Math.min((c.sk||{}).Compiling||pr,2*resEff(c))),sv=old[0]?(old[0].svc??1):1;
 const names=shuffle(st.sp.filter(nm=>{const d=XD.SPR.find(x=>x.n===nm);return d&&okSrc(d.src)}));
 const rs=XD.RST.filter(q=>okSrc(q.src)&&n>0),stq=rs.length&&Math.random()<Math.min(.5,.08*pr)?pick(rs):null;c.rstream=stq?stq.n:null;
 const pref=stq?stq.sp.filter(nm=>names.includes(nm)):[],ordered=[...pref,...names.filter(nm=>!pref.includes(nm))];
 c.spirits=ordered.slice(0,n).map(nm=>{const d=XD.SPR.find(x=>x.n===nm);return{n:nm,force:fr,svc:sv,sprite:1,id:d.id,sk:d.sk,pw:d.pw,src:d.src,pg:d.pg}})}

/* ---------- mentor spirit (mago/adepto) e paragon (technomante) ---------- */
function xdMentor(c,pr){
 c.mentor=null;const t=xdTal(c);if(!t||Math.random()>Math.min(.4,.08+.03*pr))return;
 const pool=(t==='tech'?XD.PAR:XD.MEN).filter(m=>okSrc(m.src)&&!m.rq);if(!pool.length)return;
 const m=pick(pool),re=t==='tech'?/Resonance|Technomancer|Sprite/i:t==='adept'?/^Adept/i:/^(Magician|Mage|Mystic)/i,fl=(m.ch||[]).filter(x=>re.test(x));
 c.mentor={n:m.n,id:m.id,kind:t==='tech'?'Paragon':'Mentor',adv:m.adv||'',dis:m.dis||'',src:m.src,pg:m.pg,choice:fl.length?pick(fl):(m.ch&&m.ch.length&&!/^(Magician|Adept)/.test(m.ch[0])?m.ch[0]:'')};
 c.mentor.fx=t==='tech'?[]:xdMentorFx(c.mentor.choice,t)}
/* A vantagem escolhida do mentor deixa de ser só texto quando dá para traduzi-la em regra (c.mentor.fx):
   "+N dados para magias de <categoria>" → improvement SpellCategory (mago); "+N dados em <perícia>" → improvement Skill;
   "N nível(is) grátis de <poder>" (adepto) → níveis grátis do poder (p.mf; improvement AdeptPowerFreeLevels). O que não der para traduzir fica só como texto (fx vazio). */
const MN_NUM={a:1,an:1,one:1,two:2,three:3};
const xdFxTr=s=>s?String(s).split(', ').map(p=>(IDIOMA_ATUAL==='en'?p.replace(/^dado\(s\) de iniciativa /,'dados de iniciativa '):p).replace(/^(limite |qualidade |armadura |dados de iniciativa )/,m=>xl(m))).join(', '):s;
function xdMentorFx(choice,t){const s=String(choice||'').trim(),fx=[];if(!s)return fx;
 if(/^Magician:/i.test(s)){const v=s.match(/\+(\d+)/),cats=[...new Set(s.match(/Combat|Detection|Health|Illusion|Manipulation/g)||[])];
  if(t==='mage'&&v&&/spells?\b/i.test(s))cats.forEach(k=>fx.push({t:'sp',n:k,v:+v[1]}));return fx}
 if(/^Adept:/i.test(s)){if(t!=='adept')return fx;let lv=0;
  s.replace(/^Adept:\s*/i,'').replace(/^Gain\s+/i,'').replace(/\.$/,'').split(/\s+and\s+/i).forEach(cl=>{cl=cl.trim();
   let m=cl.match(/^(\d+|one|two|three|an?)\s+(?:free\s+)?levels?\s+of\s+(.+)$/i),n,l;
   if(m){l=/^\d+$/.test(m[1])?+m[1]:(MN_NUM[m[1].toLowerCase()]||1);n=m[2]}
   else if((m=cl.match(/^free\s+(.+)$/i))){l=1;n=m[1]}
   else if(lv&&/^[A-Z][A-Za-z ]+$/.test(cl)){l=lv;n=cl}
   if(!n)return;lv=l;n=n.replace(/\.$/,'').trim();
   const nm=PWD[n]?n:Object.keys(PWD).find(k=>k.startsWith(n+' ('));
   if(nm&&!/^Improved Ability/.test(nm))fx.push({t:'pw',n:nm,l})});
  return fx}
 const q=s.match(/^\+(\d+)\s*(?:dice\s*)?(?:on|for|to)\s+(?:an?\s+)?([A-Z][A-Za-z ]*?)(?:\s+skill)?(?:\s+tests?)?$/i);
 if(q&&SKA[q[2].trim()])fx.push({t:'sk',n:q[2].trim(),v:+q[1]});
 return fx}
const xdFxTxt=f=>f.t==='sp'?'+'+f.v+xl(' dados em magias de ')+f.n:f.t==='sk'?'+'+f.v+xl(' dados em ')+f.n:f.l+(f.l>1?xl(' níveis grátis'):xl(' nível grátis'))+' de '+f.n;
/* níveis grátis de poder de adepto: refeitos a cada reconciliação (sem duplicar); custam 0 pontos de poder */
function xdMentorPw(c){
 c.powers=(c.powers||[]).filter(p=>{if(p.mf){p.l-=p.mf;delete p.mf}return !(p.mn&&(+p.l||0)<=0)});
 c.powers.forEach(p=>{if(PWD[p.n]&&p.pts!==undefined)p.pp=pwCost(PWD[p.n],+p.l||0)});
 ((c.mentor&&c.mentor.fx)||[]).filter(f=>f.t==='pw').forEach(f=>{const d=PWD[f.n];if(!d)return;
  let p=c.powers.find(x=>x.n===f.n);if(p&&!d.lv)return;
  if(!p){p={n:f.n,l:0,pp:0,id:d.id,pts:d.pts,lv:d.lv,mx:d.mx||'',x:d.x||0,act:d.act||'',pg:d.pg,ex:'',mn:1};c.powers.push(p)}
  const add=d.lv?f.l:1;p.l=(+p.l||0)+add;p.mf=(p.mf||0)+add;p.pp=d.lv?pwCost(d,p.l-p.mf):0})}
/* improvements do mentor (vão na qualidade Mentor Spirit; Chummer lê ao abrir a ficha) */
const xdMentorBn=c=>((c.mentor&&c.mentor.fx)||[]).map(f=>f.t==='sp'?['SpellCategory',f.n,f.v,'',1]:f.t==='sk'?['Skill',f.n,f.v,'',1]:['AdeptPowerFreeLevels',f.n,f.l,'',1])
/* a qualidade Mentor Spirit/Paragon acompanha c.mentor (custa 5 carma no Mentor; o Paragon custa 0);
   a Resonant Stream (Cyberadept, Machinist…; 20 de carma, KC) acompanha c.rstream. Só de tecnomante, nunca junto de magia. */
function xdReconcile(c){
 if(!c||c.crit||!c.npc)return;
 if(c.mentor&&!xdTal(c))c.mentor=null;
 const names=Object.values(NM_MENTOR_Q).map(q=>q.n);c.q=(c.q||[]).filter(o=>!names.includes(o.n)&&!/^Resonant Stream:/.test(o.n));
 if(c.talent!=='Technomancer')c.rstream=null;
 if(c.rstream){const q=XD.RST.find(z=>z.n===c.rstream);if(q)c.q.push({n:q.n,c:q.c,id:q.id,s:q.src,t:'Positive',bn:[],pg:q.pg,x:''});else c.rstream=null}
 if(c.mentor){const q=NM_MENTOR_Q[c.mentor.kind]||NM_MENTOR_Q.Mentor;c.q.push({n:q.n,c:q.c,id:q.id,s:q.s,t:'Positive',bn:xdMentorBn(c),pg:q.pg,x:''})}
 if(!c.crit&&typeof pwCost==='function')xdMentorPw(c)}

/* ---------- drogas ---------- */
const DR_PERFIL={'Civis':[['Zen',2],['Bliss',1],['Psyche',1],['Long Haul',1]],
 'Corporativo e ciência':[['Psyche',3],['Novacoke',1.5],['Long Haul',2],['Cram',1]],
 'Rua e crime':[['Jazz',3],['Kamikaze',2],['Nitro',1.5],['Novacoke',1.5],['Bliss',2],['Zen',1],['Cram',1.5],['Deepweed',.3]],
 'Segurança e lei':[['Cram',2],['Long Haul',3],['Psyche',1]],
 'Militar e caça':[['Cram',3],['Long Haul',2],['Psyche',1],['Deepweed',.6],['Kamikaze',.6],['Jazz',.8]],
 'Sombras':[['Cram',2],['Long Haul',2],['Jazz',1.5],['Psyche',1],['Novacoke',.8]]};
const DR_CH={'Civis':.12,'Corporativo e ciência':.15,'Rua e crime':.5,'Segurança e lei':.2,'Militar e caça':.3,'Sombras':.3};
function xdDrugs(c,pr){
 c.drugs=[];const g=(TYPES[c.npc.type]||{}).g,prf=(DR_PERFIL[g]||DR_PERFIL['Civis']).map(([n,w])=>[XD.DRG.find(d=>d.n===n),w]).filter(([d])=>d&&okSrc(d.src));
 if(!prf.length||Math.random()>Math.min(.8,(DR_CH[g]||.2)+.02*pr))return;
 const gr=XD.DGR.find(x=>x.n===(pr<=3?'Street Cooked':'Standard'))||XD.DGR[0],n=Math.min(prf.length,1+(pr>=4&&Math.random()<.5?1:0)+(pr>=8&&Math.random()<.4?1:0));let pool=prf.slice();
 for(let i=0;i<n&&pool.length;i++){const [d]=wchoose(pool,x=>x[1]);pool=pool.filter(x=>x[0]!==d);
  c.drugs.push({n:d.n,id:d.id,src:d.src,pg:d.pg,qty:R(1,3),cost:Math.round(d.c*gr.c*100)/100,grade:gr.n,gid:gr.id,av:d.av,sp:d.sp,v:d.v,du:d.du,fx:xdFxTr(d.fx)})}}
const drugTotal=c=>(c.drugs||[]).reduce((s,d)=>s+d.cost*d.qty,0);

/* ---------- contatos (CHA x 3 pontos de conexão+lealdade, sem custo de carma) ---------- */
const CT_PERFIL={'Civis':/Bartender|Mechanic|Squatter|Fixer|Janitor|Dockworker|Gambler/i,'Corporativo e ciência':/Corporate|Company|Forensics|Hermetic|Infobroker|Fixer|Mr\. Johnson|Doctor|Street Doc/i,
 'Rua e crime':/Fence|Fixer|Gang|Go-Ganger|Bookie|Smuggler|Street|Armorer|Bartender|Coyote|Mafia|Dealer|Club/i,'Segurança e lei':/Cop|Armorer|Bodyguard|Forensics|Fixer|Infobroker|Bounty|Firefighter|Bartender/i,
 'Militar e caça':/Armorer|Fixer|Bounty|Smuggler|Mechanic|Street Doc|Mr\. Johnson|Infobroker/i,'Sombras':/Fixer|Smuggler|Mechanic|Hacker|Infobroker|Armorer|Street Doc|Coyote|Fence/i};
function xdContacts(c,pr){
 const cha=+(c.at||{}).CHA||1,cap=cha*3,g=(TYPES[c.npc.type]||{}).g,re=CT_PERFIL[g]||/./,list=(CONTACTS||[]).filter(Boolean);
 const pref=list.filter(r=>re.test(r)),n=Math.min(6,1+Math.floor(pr/3)+(Math.random()<.4?1:0)),out=[],used=new Set();let pts=0;
 const cmax=Math.max(1,Math.min(6,2+Math.floor(pr/2)));
 for(let i=0;i<n;i++){const pl=(pref.length&&Math.random()<.7?pref:list).filter(r=>!used.has(r));if(!pl.length)break;
  const role=pick(pl),con=R(1,cmax),loy=R(1,Math.min(4,1+Math.floor(pr/3)));if(pts+con+loy>cap)break;
  pts+=con+loy;used.add(role);out.push({n:pick(NFIRST)+' '+pick(NLAST),role,con,loy})}
 c.contacts=out}
/* Contatos acima da cota grátis (CHA×3 pontos de conexão+lealdade) custam 1 de carma por ponto: entram na conta do carma (karmaBook.ct)
   e são comprados com a sobra em karmaGastaSobra. */
const ctPts=c=>(c.contacts||[]).reduce((s,k)=>s+(+k.con||0)+(+k.loy||0),0),ctExtra=c=>Math.max(0,ctPts(c)-3*(+(c.at||{}).CHA||1));
function ctBuy(c,L){const cs=c.contacts=c.contacts||[],up=cs.filter(k=>k.con<6||k.loy<6);
 if(up.length&&(cs.length>=9||Math.random()<.5)){const k=pick(up);if(k.loy<6&&(k.con>=6||Math.random()<.6))k.loy++;else k.con++;return 1}
 if(cs.length>=9||L<2)return 0;
 const g=(TYPES[c.npc.type]||{}).g,re=CT_PERFIL[g]||/./,used=new Set(cs.map(k=>k.role)),list=(CONTACTS||[]).filter(r=>r&&!used.has(r)),pref=list.filter(r=>re.test(r));
 if(!list.length)return 0;
 const role=pick(pref.length&&Math.random()<.7?pref:list),con=Math.min(6,R(1,Math.max(1,Math.min(4,L-1)))),loy=Math.min(6,R(1,Math.max(1,Math.min(3,L-con))));
 if(con+loy>L)return 0;
 cs.push({n:pick(NFIRST)+' '+pick(NLAST),role,con,loy});return con+loy}
function ctTrim(c){const cs=c.contacts||[],k=cs[cs.length-1];if(!k)return;if(k.loy>1)k.loy--;else if(k.con>1)k.con--;else cs.pop()}

/* ---------- estilo de vida (lifestyles.xml) ---------- */
const LF_G={'Civis':0,'Corporativo e ciência':1,'Rua e crime':-1,'Segurança e lei':0,'Militar e caça':0,'Sombras':-1};
function xdLife(c,pr){
 const L=(typeof LIFE!=='undefined'?LIFE:[]).filter(x=>okSrc(x[3]));c.life=null;if(!L.length)return;
 const g=(TYPES[c.npc.type]||{}).g,t=Math.round(pr/2.5)+(LF_G[g]||0)+R(-1,0);let i=Math.max(0,Math.min(L.length-1,t));
 const teto=resNuyen(pr,c.npc.fo??1)*.2;
 while(i>0&&L[i][1]>teto)i--;
 const months=L[i][1]>0?R(1,2):1;c.life={n:L[i][0],cost:L[i][1],id:L[i][2],src:L[i][3],months}}
const lifeTotal=c=>c.life?c.life.cost*c.life.months:0;
/* o que o NPC gasta além do equipamento: drogas e meses de estilo de vida pagos */
const extrasTotal=c=>Math.round(drugTotal(c)+lifeTotal(c)+sinTotal(c));

/* ---------- SIN e licenças (licenses.xml + Fake SIN / Fake License do gear.xml) ---------- */
const SIN_ID='0c800bca-e6ff-475b-a014-c2069f5e364c',LICF_ID='8a16bbb2-8028-4c74-b22b-7aad9d001073';
function xdLicNeeds(c){const g=(c.gear||[]).filter(x=>!x.nat),L=[],ty=c.npc.type||'';
 if(g.some(x=>x.cat==='weapon'))L.push('Firearms License');
 if(g.some(x=>x.cat==='weapon'&&/Blade|Sword|Knife|Katana/i.test((x.n||'')+(x.sub||''))))L.push('Small Blades License');
 if(g.some(x=>x.cat==='comm'&&/Cyberdeck|Deck/i.test(x.n||'')))L.push('Cyberdeck License');
 if(g.some(x=>x.cat==='cyber'))L.push('Restricted Cyberware License');
 if(g.some(x=>x.cat==='bio'))L.push('Restricted Bioware License');
 if(g.some(x=>x.cat==='drone'))L.push('Drone License');
 if(g.some(x=>x.cat==='vehicle'))L.push("Driver's License",'Pilot License');
 if(c.talent==='Adept'||c.talent==='Mystic Adept')L.push('Adept License');if(c.talent==='Magician'||c.talent==='Mystic Adept')L.push('Mage License');
 if((c.spirits||[]).some(s=>!s.sprite))L.push('Summoner License');
 if(tipId(ty)==='medic')L.push('Medical License');if(tipId(ty)==='detective')L.push('Private Investigator License');
 if(tipId(ty)==='bounty')L.push("Bounty Hunter's License");if(tipId(ty)==='bodyguard')L.push('Bodyguard License');
 return[...new Set(L)].filter(l=>(XD.LIC||[]).includes(l))}
function xdSin(c,pr){
 c.sin=null;const g=(TYPES[c.npc.type]||{}).g,need=xdLicNeeds(c);
 if(['Rua e crime','Sombras'].includes(g)&&Math.random()<.7){
  let r=R(1,Math.max(1,Math.min(6,1+Math.floor(pr/2)))),k=Math.min(need.length,R(0,Math.min(3,1+Math.floor(pr/4)))),lic=shuffle(need).slice(0,k);
  const teto=resNuyen(pr,c.npc.fo??1)*.15,cost=()=>r*2500+lic.length*r*200;
  while(cost()>teto&&lic.length)lic.pop();while(cost()>teto&&r>1)r--;
  if(cost()<=teto)c.sin={fake:1,r,lic}}
 else{const lic=need.filter(()=>Math.random()<.7).slice(0,4);if(lic.length)c.sin={fake:0,r:0,lic}}}
const sinTotal=c=>c.sin&&c.sin.fake?c.sin.r*2500+c.sin.lic.length*c.sin.r*200:0;

/* ---------- poderes dos espíritos vinculados (critters.xml importado ou spiritpowers/critters embutidos) ---------- */
function xdSpiritPw(nm){const e=(typeof CRIT!=='undefined'?CRIT:[]).find(x=>x&&x.n===nm),px=e&&e.px&&e.px.length?e.px:((XD.SPW||{})[nm]||{}).px;
 return(px||[]).map(p=>p.n+(p.s?' ('+p.s+')':'')+(p.r?' '+p.r:''))}

/* ---------- programas avançados de IA ---------- */
/* Rating da IA (1 a 6, sobe com o nível): é o limite de programas avançados que ela roda ao mesmo tempo (Data Trails) */
const aiRating=pr=>Math.max(1,Math.min(6,Math.ceil((+pr||0)/3)));
function xdAI(c,pr){
 c.aip=[];c.aiRt=aiRating(pr);const pool=XD.AIP.filter(p=>okSrc(p.src));if(!pool.length)return;
 c.aip=shuffle(pool).slice(0,Math.min(pool.length,c.aiRt,Math.max(1,Math.min(4,1+Math.floor(pr/3))))).map(p=>({n:p.n,id:p.id,src:p.src,pg:p.pg,rq:(p.rq||[])[0]||''}))}

/* ---------- vessel (critters com Inhabitation) ---------- */
function xdVessel(c){
 c.vessel=null;if(!c.crit||!(c.powers||[]).some(p=>p.n==='Inhabitation'))return;
 const V=XD.VES.filter(v=>okSrc(v.src));if(!V.length)return;
 const F=Math.max(1,(c.crit&&c.crit.force)||1),i=Math.min(V.length-1,Math.floor(Math.random()*Math.min(V.length,2+Math.ceil(F/3))));
 const v=V[i];c.vessel={n:v.n,id:v.id,cat:v.cat,src:v.src,pg:v.pg,bod:v.bod,arm:v.arm,fx:v.fx}}

/* ---------- gerador: encaixa depois de todas as camadas anteriores de genNPC / genCritter ---------- */
npcPos(xl('extras do Chummer'),function(c,pr,type,sp,metaSel){
 try{if(!xdOkNpc(c))return c;const p=+c.npc.pr||0,ai=(META[c.meta]||{}).ai;
  c.mentor=null;c.aip=null;c.stream=null;c.sin=null;
  if(c.talent==='Technomancer')xdStream(c,p);
  if(ai)xdAI(c,p);else{xdDrugs(c,p);xdMentor(c,p)}
  xdContacts(c,p);if(ai){c.life=null;c.sin=null}else{xdLife(c,p);xdSin(c,p)}xdReconcile(c);karmaFinish(c)}catch(e){console.error('extras-chummer:',e)}
});
/* os spirits embutidos não trazem poderes: vêm do conjunto SPW (critters.xml embutido); o critters.xml importado continua mandando */
function xdCritPw(c){if(!c.crit)return;const old=c.powers||[];if(old.some(p=>!/^Fraqueza: /.test(p.n)))return;
 const e=(XD.SPW||{})[c.meta];if(!e||!(e.px||[]).length)return;
 c.powers=e.px.map(p=>({n:p.n,l:'',x:p.s||'',pp:0})).concat((e.wk||[]).map(w=>({n:'Fraqueza: '+(w.n||w),l:'',pp:0})),old)}
genCritter.camada(xl('dados do Chummer (poderes de espírito, vessel)'),_genCritter_xd=>function(){const c=_genCritter_xd.apply(null,arguments);try{xdCritPw(c);xdVessel(c)}catch(e){console.error('extras-chummer:',e)}return c});

/* ---------- ficha: linhas ---------- */
function xdRows(c){const R_=[],E=esc;
 if(c.crit){if(c.vessel)R_.push(['Vessel',E(c.vessel.n)+' <span class="note">(Corpo '+c.vessel.bod+xl(', armadura ')+c.vessel.arm+' · '+E(c.vessel.src)+' '+E(c.vessel.pg)+')</span>']);return R_}
 if(c.talent==='Technomancer'&&c.stream){const s=streamInfo(c);R_.push(['Stream',E(s.n)+xl(' · dreno ')+E(s.dr.replace(/[{}]/g,''))+' ('+streamDrain(c)+xl(' dados) · Resonance efetiva ')+resEff(c)+' <span class="note">('+E(s.src)+' '+E(s.pg)+')</span>'+(c.rstream?'<br>'+E(c.rstream.replace('Resonant Stream: ',''))+xl(' <span class="note">(stream ressonante, 20 de carma)</span>'):'')])}
 if(c.mentor){const m=c.mentor;R_.push([m.kind==='Paragon'?'Paragon':'Mentor spirit',E(m.n)+(m.choice?' · '+E(m.choice):'')+(m.adv?' <span class="note">— '+E(m.adv)+'</span>':'')+((m.fx||[]).length?xl('<br><span class="note">Aplicado na ficha: ')+m.fx.map(xdFxTxt).map(E).join('; ')+'</span>':'')])}
 if(c.aip&&c.aip.length)R_.push([xl('Programas de IA'),(c.aiRt?'<span class="note">'+termo('rating')+' '+c.aiRt+xl(' (máx. ')+c.aiRt+')</span> ':'')+c.aip.map(p=>E(p.n)+(p.rq?' <span class="note">(requer '+E(p.rq)+')</span>':'')).join(', ')]);
 if((c.drugs||[]).length)R_.push([xl('Drogas'),c.drugs.map(d=>E(d.n)+' ×'+d.qty+(d.fx?' <span class="note">('+E(d.fx)+')</span>':'')).join(', ')]);
 if((c.contacts||[]).length)R_.push([xl('Contatos'),c.contacts.map(k=>E(k.n)+' — '+E(k.role)+' (C'+k.con+'/L'+k.loy+')').join('; ')]);
 if(c.sin){const s=c.sin;R_.push([s.fake?xl('SIN falsa'):xl('SIN e licenças'),(s.fake?termo('rating')+' '+s.r+(s.lic.length?xl(' · licenças falsas: '):'')+s.lic.map(E).join(', ')+' · '+fmtNy(sinTotal(c)):'legal'+(s.lic.length?xl(' · licenças: ')+s.lic.map(E).join(', '):''))])}
 const sp=(c.spirits||[]).filter(x=>!x.sprite).map(x=>[x.n,xdSpiritPw(x.n)]).filter(x=>x[1].length);
 if(sp.length)R_.push([xl('Poderes dos espíritos'),sp.map(x=>E(x[0])+': '+x[1].map(E).join(', ')).join('<br>')]);
 if(c.life)R_.push([xl('Estilo de vida'),E(c.life.n)+' · '+tn('vida.mes',c.life.months)+' · '+fmtNy(lifeTotal(c))]);
 return R_}

/* ---------- exportação XML (.chum5) ---------- */
function xmlExtras2(c,s){const G=()=>crypto.randomUUID(),E=esc,Z='00000000-0000-0000-0000-000000000000';
 if(c.crit||!c.npc)return s;
 if((c.drugs||[]).length)s=s.replace('<drugs />','<drugs>'+c.drugs.map(d=>`<drug><sourceid>${d.id}</sourceid><guid>${G()}</guid><name>${E(d.n)}</name><category>Drugs</category><grade>${E(d.grade)}</grade><gradeid>${d.gid}</gradeid><quantity>${d.qty}</quantity><availability>${E(d.av)}</availability><cost>${d.cost}</cost><speed>${E(d.sp)}</speed><vectors>${E(d.v)}</vectors><duration>${E(d.du)}</duration><source>${E(d.src)}</source><page>${E(d.pg)}</page><notes>${E(d.fx)}</notes></drug>`).join('')+'</drugs>');
 if(c.mentor){const m=c.mentor;s=s.replace('<mentorspirits />',`<mentorspirits><mentorspirit><sourceid>${m.id}</sourceid><guid>${G()}</guid><name>${E(m.n)}</name><extra />${m.choice?'<choice1>'+E(m.choice)+'</choice1>':''}<mentortype>${m.kind}</mentortype><advantage>${E(m.adv||'')}</advantage><disadvantage>${E(m.dis||'')}</disadvantage><source>${E(m.src)}</source><page>${E(m.pg)}</page></mentorspirit></mentorspirits>`)}
 if((c.aip||[]).length)s=s.replace('<aiprograms />','<aiprograms>'+c.aip.map(p=>`<aiprogram><sourceid>${p.id}</sourceid><guid>${G()}</guid><name>${E(p.n)}</name><extra />${p.rq?'<requiresprogram>'+E(p.rq)+'</requiresprogram>':''}<source>${E(p.src)}</source><page>${E(p.pg)}</page></aiprogram>`).join('')+'</aiprograms>');

 if(c.sin&&c.sin.fake&&/<\/gears>/.test(s)){const k=c.sin,al=E(c.alias||''),lic=k.lic.map(l=>`<gear><sourceid>${LICF_ID}</sourceid><guid>${G()}</guid><name>Fake License</name><category>ID/Credsticks</category><rating>${k.r}</rating><qty>1</qty><avail>${3*k.r}F</avail><cost>${k.r*200}</cost><extra>${E(l)}</extra><source>SR5</source><page>443</page></gear>`).join('');
  s=s.replace('</gears>',`<gear><sourceid>${SIN_ID}</sourceid><guid>${G()}</guid><name>Fake SIN</name><category>ID/Credsticks</category><rating>${k.r}</rating><qty>1</qty><avail>${3*k.r}F</avail><cost>${k.r*2500}</cost><extra>${al}</extra><source>SR5</source><page>442</page>${lic?'<children>'+lic+'</children>':''}</gear></gears>`)}
 if(c.talent==='Technomancer'&&c.stream&&!/<tradition>/.test(s)){const t=streamInfo(c);s=s.replace('</character>',`<tradition><sourceid>${t.id}</sourceid><guid>${G()}</guid><name>${E(t.n)}</name><extra /><drain>${E(t.dr)}</drain><source>${E(t.src)}</source><page>${E(t.pg)}</page><istechnomancertradition>True</istechnomancertradition></tradition></character>`)}
 return s}

/* ---------- exportação JSON ---------- */
function jsonExtras2(c,o){if(c.crit||!c.npc)return o;const ch=o.characters.character,U=()=>crypto.randomUUID();
 if((c.drugs||[]).length)xPut(ch,'drugs','drug',c.drugs.map(d=>({sourceid:d.id,guid:U(),name:d.n,category:'Drugs',grade:d.grade,quantity:String(d.qty),availability:d.av,cost:String(d.cost),speed:d.sp,vectors:d.v,duration:d.du,source:d.src,page:d.pg,notes:d.fx||null})));
 if(c.mentor){const m=c.mentor;xPut(ch,'mentorspirits','mentorspirit',[{sourceid:m.id,guid:U(),name:m.n,extra:null,choice1:m.choice||null,mentortype:m.kind,advantage:m.adv||'',disadvantage:m.dis||'',source:m.src,page:m.pg}])}
 if((c.aip||[]).length)xPut(ch,'aiprograms','aiprogram',c.aip.map(p=>({sourceid:p.id,guid:U(),name:p.n,extra:null,requiresprogram:p.rq||null,source:p.src,page:p.pg})));
 if((c.contacts||[]).length)xPut(ch,'contacts','contact',c.contacts.map(k=>({guid:U(),name:k.n,role:k.role,connection:String(k.con),loyalty:String(k.loy),free:'False',type:'Contact'})));
 if(c.life){const l=c.life;xPut(ch,'lifestyles','lifestyle',[{sourceid:l.id,guid:U(),name:l.n,baselifestyle:l.n,cost:String(l.cost),months:String(l.months),percentage:'100',increment:'Month',type:'Standard',source:l.src}])}
 if(c.sin&&c.sin.fake){const k=c.sin,gi=(id,n,r,cost,pg,ex)=>({sourceid:id,guid:U(),name:n,name_english:n,fullname:n,fullname_english:n,category:'ID/Credsticks',category_english:'ID/Credsticks',rating:String(r),qty:'1',avail:3*r+'F',cost:String(cost),owncost:String(cost),extra:ex||null,source:'SR5',page:pg});
  xAdd(ch,'gears','gear',gi(SIN_ID,'Fake SIN',k.r,k.r*2500,'442',c.alias));k.lic.forEach(l=>xAdd(ch,'gears','gear',gi(LICF_ID,'Fake License',k.r,k.r*200,'443',l)))}
 if(c.talent==='Technomancer'&&c.stream&&ch.tradition){const s=streamInfo(c);ch.tradition.name=s.n;ch.tradition.name_english=s.n;ch.tradition.drain=s.dr.replace(/[{}]/g,'');ch.tradition.drainvalue=String(streamDrain(c))}
 return o}

/* ---------- critter com vessel: anota no campo Notas (o Chummer não tem campo próprio para o vessel de um critter) ---------- */
function xmlVessel(c,s){if(!c.crit||!c.vessel)return s;const v=c.vessel,t='Vessel (Inhabitation): '+v.n+' — Corpo '+v.bod+xl(', armadura ')+v.arm+' ('+v.src+' '+v.pg+')';
 try{const d=new DOMParser().parseFromString(s,'text/xml'),r=d.documentElement;let n=[...r.children].find(x=>x.tagName==='notes');if(!n){n=d.createElement('notes');r.appendChild(n)}
  if(!n.textContent.includes('Vessel (Inhabitation)'))n.textContent=(n.textContent?n.textContent+'\n':'')+t;
  return'<?xml version="1.0" encoding="utf-8"?>\n'+new XMLSerializer().serializeToString(r)}catch(x){return s}}
function jsonVessel(c,o){if(!c.crit||!c.vessel)return o;const ch=o.characters.character,v=c.vessel,t='Vessel (Inhabitation): '+v.n+' — Corpo '+v.bod+xl(', armadura ')+v.arm+' ('+v.src+' '+v.pg+')';
 if(!String(ch.notes||'').includes('Vessel (Inhabitation)'))ch.notes=(ch.notes?ch.notes+'\n':'')+t;return o}

/* licenças legais e escolha do mentor entram nas Notas do XML/JSON junto com os ganchos */
ganchoNotas.camada(xl('licenças e mentor'),g=>function(c){let a=[];try{if(c.sin&&!c.sin.fake&&c.sin.lic.length)a.push(xl('Licenças (legais): ')+c.sin.lic.join(', '));if(c.mentor&&c.mentor.choice)a.push((c.mentor.kind==='Paragon'?'Paragon: ':'Mentor spirit: ')+c.mentor.n+' — '+c.mentor.choice)}catch(e){avisa('extras-chummer',e)}return[...g(c),...a]});
