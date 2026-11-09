const SPEC={Critter:'Critter',Lieutenant:'Tenente',Decker:'Decker',Adept:'Adepto físico',Mystic:'Adepto místico',Mage:'Mago',Technomancer:'Tecnomante',Rigger:'Rigger'};
const COMMS=['Meta Link','Meta Link','Sony Emperor','Renraku Sensei','Erika Elite','Hermes Ikon','Transys Avalon'],CL=n=>COMMS[Math.min(n,6)];
function pickMeta(baseOnly){const names=Object.keys(META).filter(n=>{const m=META[n];return CORE.includes(n)||(!baseOnly&&!m.hid&&((m.par&&!m.fx)||m.grp==='Submetatipos'||(GEN.wild&&(m.grp==='Metasapientes'||m.fx))))}),W={Human:6,Elf:3,Dwarf:3,Ork:4,Troll:2};
 const n=wchoose(names,x=>(W[x]||(META[x].fx?.06:.7))/(1+2*(GEN.metaUsed[x]||0)));GEN.metaUsed[n]=(GEN.metaUsed[n]||0)+1;return n}
const BANDS={civil:[0,1],baixo:[1,4],medio:[4,7],alto:[6,9],lendario:[9,10]};
const nprNum=id=>{const v=parseInt(document.getElementById(id).value,10);return Number.isFinite(v)?Math.max(0,Math.min(LVMAX,v)):null};
const customPr=()=>{let a=nprNum('nprlo'),b=nprNum('nprhi');if(a==null&&b==null){a=0;b=10}else{if(a==null)a=b;if(b==null)b=a}if(a>b)[a,b]=[b,a];return R(a,b)};
const prFrom=v=>v==='rand'?R(1,10):v==='custom'?customPr():BANDS[v]?R(BANDS[v][0],BANDS[v][1]):+v;
let _pk='',_pv=null;function poolItems(){const k=[...SEL].sort().join(',')+'|'+ITEMS.length;if(k!==_pk||!_pv){_pk=k;_pv=ITEMS.filter(i=>okSrc(i[3])&&eqCtxOk(i)&&(!/F/.test(String((i[7]||{}).avail||''))||(typeof EQ_SUP!=='undefined'&&EQ_SUP.test(i[6]||''))))}return _pv}
/* v45.2: atributos por ORÇAMENTO. Antes cada atributo era sorteado sozinho: a soma oscilava muito (nível 2: de 17 a 39) e, do nível 6 em diante,
   tudo batia no teto (6) e não havia o que redistribuir. Agora a soma é fixa para o nível (base + bônus do papel) e o sorteio só decide ONDE ficam os pontos:
   cada atributo tem um alvo (base + bônus do papel/perfil) com ruído; um deslocamento comum ajusta o total ao orçamento, respeitando mínimo e teto.
   Do nível 6 ao 10 há uma folga (5, 4, 3, 2, 1 pontos abaixo do teto de tudo), só quando os atributos estariam todos no teto: sobra o que redistribuir.
   keep = {sum,ak}: ao rerrolar atributos com o metatipo travado, o total e os pontos de carma da ficha antiga se mantêm (redistribui, não aumenta). */
function attrBudget(at,o){const{meta,pr,sp,T,PA,base,spread,capA,keep}=o,lo={},cp={},r={};let sum0=0,nSat=0,sLo=0,sCp=0;
 ATTR.forEach(k=>{lo[k]=lim(meta,k)[0];cp[k]=Math.max(lo[k],capA(k));let f=0;const fv=T.a.includes(k);
  if(fv)f+=.75*(1+(pr>=4?.5:0));if(sp==='Lieutenant'&&fv)f+=.7;if(sp==='Decker'&&(k==='LOG'||k==='INT'))f+=.8;if(sp==='Rigger'&&(k==='REA'||k==='INT'||k==='LOG'))f+=.8;
  if((sp==='Mage'||sp==='Mystic')&&['LOG','WIL','CHA'].includes(k))f+=.8;if(sp==='Technomancer'&&['LOG','INT','WIL','CHA'].includes(k))f+=.8;f+=(PA[k]||0)*.8;
  const t=base+f;sum0+=Math.min(cp[k],Math.max(lo[k],t));if(t>=cp[k]-.01)nSat++;sLo+=lo[k];sCp+=cp[k];
  r[k]=t+R(-spread,spread)+(Math.random()<.12?pick([-1,1]):0)});
 const folga=pr>=6&&pr<=10?13-pr:0;/* (11-pr) pontos abaixo do teto no fim; +2 porque o carma de atributos devolve até 2 */let pts=Math.round(sum0)-Math.min(folga,nSat);
 if(keep)pts=keep.sum-keep.ak;pts=Math.max(sLo,Math.min(sCp,pts));
 const at2=s=>ATTR.reduce((x,k)=>x+Math.max(lo[k],Math.min(cp[k],r[k]+s)),0);let a=-300,b=300;for(let i=0;i<50;i++){const m=(a+b)/2;at2(m)<pts?a=m:b=m}
 const v={};let tot=0;ATTR.forEach(k=>{const x=Math.max(lo[k],Math.min(cp[k],r[k]+b));v[k]=Math.floor(x+1e-9);tot+=v[k]});
 const fr=ATTR.filter(k=>v[k]<cp[k]).sort((x,y)=>((r[y]+b)%1+1)%1-((r[x]+b)%1+1)%1);for(let i=0;tot<pts&&fr.length;i++){const k=fr[i%fr.length];if(v[k]<cp[k]){v[k]++;tot++}}
 ATTR.forEach(k=>at[k]=v[k])}
const genNPC=comCamadas('genNPC',genNPCBase);
function genNPCBase(pr,type,sp,metaSel){
 const T=TYPES[type],meta=metaSel==='rand'||metaSel==='randbase'?pickMeta(metaSel==='randbase'):metaSel,base=EXT(BASEA,pr),at={};
 if(META[meta].ai)sp='Decker';
 const PS=persStart(pr,type,sp),PA=persAttrW(PS);if(PS&&PS.sp&&PS.sp!==sp&&!META[meta].ai)sp=PS.sp;   // a mistura de estilos pode tornar Mago/Adepto em Adepto místico
   // personalidade: 1–5 estilos com %, traços (logic/personalidade.js)
 const spread=R(0,2),capN0=k=>capNat(meta,k,pr),RF={};ATTR.forEach(k=>{const r=.55+.45*Math.random();RF[k]=Math.min(1,r+(T.a.includes(k)?.2:0))});const capA=k=>{const c=capN0(k);return pr>=11?Math.round(lim(meta,k)[1]+(c-lim(meta,k)[1])*RF[k]):c};
 attrBudget(at,{meta,pr,sp,T,PA,base,spread,capA,keep:GEN.attrKeep});
 at.EDG=Math.min(lim(meta,'EDG')[1],Math.max(lim(meta,'EDG')[0],Math.ceil(pr/2)+R(-1,1)));
 const KT=karmaTotal(pr),ak={};let kar=KT;const fav=[...T.a,...(sp==='Decker'?['LOG','INT']:sp==='Mage'||sp==='Mystic'?['LOG','WIL','CHA']:sp==='Technomancer'?['LOG','INT','WIL','CHA']:sp==='Rigger'?['REA','INT','LOG','AGI']:sp==='Lieutenant'?['CHA','WIL']:[]),...persFavAttrs(PS)];
 const AQ=GEN.attrKeep?GEN.attrKeep.ak:(pr>=6&&pr<=10?2:80);for(let n=0;n<80&&n<AQ;n++){const cand=ATTR.filter(k=>at[k]<capA(k)&&(at[k]+1)*5<=kar);if(!cand.length)break;const fv=fav.filter(k=>cand.includes(k)),k=pick(fv.length&&Math.random()<.7?fv:cand);kar-=(at[k]+1)*5;at[k]++;ak[k]=(ak[k]||0)+1}
 const rg=sp==='Rigger'?(r=>r<.6?'ground':r<.85?'air':'water')(Math.random()):'';let list=[...T.s];if(sp==='Lieutenant')list.unshift('Leadership');if(sp==='Decker')list=['Hacking','Cybercombat','Electronic Warfare','Computer','Perception'].concat(META[meta].ai?['Software']:['Pistols']);if(sp==='Technomancer')list=['Hacking','Compiling','Registering','Software','Computer','Cybercombat','Electronic Warfare','Perception'];if(sp==='Mage')list=['Spellcasting','Counterspelling','Assensing','Perception','Summoning','Pistols'];if(sp==='Mystic')list=['Spellcasting','Unarmed Combat','Assensing','Counterspelling','Perception','Pistols'];if(sp==='Adept')list.unshift('Unarmed Combat');if(sp==='Rigger'){const D=RG_DOM[rg];list=[D.pilot,'Gunnery',D.mech,'Electronic Warfare','Perception','Pistols']}
 list=persSkillList(PS,list);const SKC=skCap(pr),sr=srv(pr),sk={},sx=SXP(list);list.forEach((s,i)=>{sk[s]=Math.max(1,Math.min(SKC,sr-(i>=3?1:0)+R(-1,1)))});sx.slice(0,nExtra(pr)).forEach(x=>{sk[x]=Math.max(1,Math.min(SKC,sr-2+R(-1,1)))});persSkillFx(sk,PS,SKC,sr,pr);persAp(sk,PS,pr,SKC,sr);
 let magic=sp==='Adept'?Math.max(1,Math.min(6,1+Math.ceil(pr/2)+R(-1,1))):sp==='Mage'||sp==='Mystic'?Math.max(1,Math.min(6,2+Math.ceil(pr/2)+R(-1,1))):0;if(magic)at.MAG=magic;if(sp==='Technomancer')at.RES=Math.max(1,Math.min(6,2+Math.ceil(pr/2)+R(-1,1)));
 const spells=[],powers=[];   // mago: tradição, magias, espíritos e foci saem de genMageKit (mago.js)
 if(sp==='Adept'){let pp=magic;shuffle(POWERS).forEach(([n,c,mx])=>{const l=Math.min(mx,Math.floor(pp/c));if(l>=1){pp-=l*c;powers.push({n,l,pp:l*c})}})}
 const pool=poolItems(),b=BUD(pr),gear=[];let ess=0;
 const buy=(k,f)=>{let o=pool.filter(i=>i[0]===k&&!(k==='comm'&&/Rigger/.test(i[6]||''))&&i[2]<=b*f&&!gear.some(x=>x.n===i[1])&&(k==='cyber'||k==='comm'||eqAvOk((i[7]||{}).avail,pr))&&(k!=='cyber'||ess+(i[4]||0)<=3));if(k==='weapon'&&T.wc){const w=o.filter(i=>T.wc.test(i[6]||''));if(w.length)o=w}if(o.length){const i=pick(o);if(k==='cyber')ess+=i[4]||0;gear.push({cat:k,n:i[1],cost:i[2],src:i[3]||'SR5',ess:k==='cyber'?(i[4]||0):0,id:i[5]||'',sub:i[6]||'',st:i[7]||{},...(k==='drone'?{bs:1}:{})})}};
 const noC=T.pw!==undefined&&Math.random()>T.pw;if(!noC){buy('weapon',.4);for(let n=R(0,pr>=6?3:pr>=3?2:1);n>0;n--)buy('weapon',.3)}buy('armor',.3);
 for(let n=R(0,1+Math.floor(pr/2));n>0;n--)buy('gear',.1);
 {const r=ITEMS.find(i=>i[0]==='comm'&&i[1]===CL(pr));gear.push({cat:'comm',n:CL(pr),cost:0,src:'SR5',ess:0,id:r?r[5]||'':'',sub:r?r[6]||'':'',st:r?r[7]||{}:{},bs:1})}
 if(sp==='Decker'&&pr<2)buy('comm',.8);
 if(sp!=='Rigger'&&pr>=3&&Math.random()<.3)buy('drone',.6);
  if(META[meta].ai)gear.splice(0);
 const NQ={'Segurança corporativa (rent-a-cop)':'Samurai de rua','Polícia (Lone Star / força local)':'Samurai de rua','Ganger de rua (gangue)':'Samurai de rua','Arruaceiro / manifestante':'Samurai de rua','Sindicato (máfia, yakuza, vory)':'Samurai de rua','Resposta de alta ameaça (HTR)':'Samurai de rua','Operações especiais (spec ops)':'Samurai de rua','Cultista / fanático':'Face','Político / burocrata':'Face','Guarda-costas':'Samurai de rua','Mercenário (merc)':'Samurai de rua','Caçador de recompensas (bounty hunter)':'Samurai de rua','Soldado de força corporativa (SecOps)':'Samurai de rua','Leão-de-chácara (segurança de casa noturna)':'Samurai de rua','Espião / agente de infiltração':'Face','Jornalista / repórter':'Face'},
  nq=genQuals(sp==='Decker'||sp==='Technomancer'?'Decker':sp==='Rigger'?'Rigger':sp==='Mage'||sp==='Mystic'?'Mago hermético':sp==='Adept'?'Adepto físico':(NQ[type]||''),R(0,5),qBudget(pr));
 return{alias:pick(NFIRST)+' '+pick(NLAST),arch:sp==='Adept'?'Adepto físico':sp==='Mystic'?'Adepto místico':sp==='Mage'?'Mago hermético':sp==='Technomancer'?'Tecnomante':'NPC',meta,P:{meta:'A',attr:'A',skill:'A',res:'A',magic:magic||sp==='Technomancer'?'A':'E'},at,sk,know:[...(T.kn||[])],q:nq,spells,powers,magic,talent:sp==='Adept'?'Adept':sp==='Mystic'?'Mystic Adept':sp==='Mage'?'Magician':sp==='Technomancer'?'Technomancer':'',pp:sp==='Adept'?magic:0,nuyen:0,nuyenLeft:0,gear,ess:+(6-ess).toFixed(2),spirits:[],books:[...SEL],npc:{pr,type,sp,rg,pers:PS,kar,kt:KT,ak,sx,base:Object.fromEntries(ATTR.map(k=>[k,Math.min(at[k],capNat(meta,k,10))])),bl:Math.min(pr,10),rf:RF},ak,kar,lang:pick(LANGS)}}
/* v34: genNPC não é mais reescrita por cada arquivo. As etapas pós-geração se registram com npcPos(nome,fn(c,pr,type,sp,metaSel)) e rodam na ordem do manifest (ver tools/mapa-camadas.js). */
const NPC_POS=[];
function npcPos(nome,fn){NPC_POS.push({nome,fn})}
genNPC.camada(xl('etapas pós-geração (npcPos)'),base=>function(pr,type,sp,metaSel){const c=base(pr,type,sp,metaSel);for(const e of NPC_POS)e.fn(c,pr,type,sp,metaSel);return c});
