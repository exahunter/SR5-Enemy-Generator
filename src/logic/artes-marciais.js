let MART=EMB.MA,MTECH=EMB.TECH;
const MA_TECH_K=5,MA_AWK=new Set(['Neijia','Strike the Darkness']);
const MA_P={'Samurai de rua':.35,'Adepto físico':.6,'Adepto místico':.4,'Face':.08,'Mago hermético':.05,'Xamã':.05,'Mago aspectado':.05,'Decker':.03,'Rigger':.04,'Tecnomante':.03};
const MA_NPC={'Operações especiais (spec ops)':.5,'Resposta de alta ameaça (HTR)':.25,'Mercenário (merc)':.3,'Ganger de rua (gangue)':.15,'Segurança corporativa (rent-a-cop)':.1,'Polícia (Lone Star / força local)':.1,'Sindicato (máfia, yakuza, vory)':.1,'Caçador de recompensas (bounty hunter)':.2,'Guarda-costas':.2};
const metaK=c=>((META[c.meta]||{}).kc||{})[(c.P||{}).meta]||0;
const negSum=c=>Math.min(25,c.q.filter(o=>o.t==='Negative').reduce((a,o)=>a+o.c,0));
const isAwake=c=>(+c.magic||0)>0;
function maStyles(c){const ad=['Adept','Mystic Adept'].includes(c.talent),aw=isAwake(c);return MART.filter(m=>!m.q&&okSrc(m.s)&&(!m.a||ad)&&(!m.g||aw))}
function maTechs(m,c){const aw=isAwake(c);return m.t.filter(n=>{const t=MTECH[n];return t&&okSrc(t.s)&&(!t.m||aw)&&(!MA_AWK.has(n)||aw)})}
function applyMA(c){
 c.ma=null;c.maKarma=0;const mode='auto',npc=!!c.npc;if(mode==='never')return;
 let p=npc?(c.npc.sp==='Adept'||c.npc.sp==='Mystic'?.6:(MA_NPC[c.npc.type]||0)*(c.npc.pr>=2?1:0)):(MA_P[c.arch]||.04);
 if(mode==='always')p=npc&&!(MA_NPC[c.npc.type]||c.npc.sp==='Adept'||c.npc.sp==='Mystic')?.5:1;
 if(Math.random()>=p)return;
 let list=maStyles(c);if(!list.length&&mode==='always'){SEL.add('RG');drawBooks();list=maStyles(c)}
 if(!list.length)return;
 const bal=npc?999:25+negSum(c)-metaK(c),fight=['Samurai de rua','Adepto físico','Adepto místico'].includes(c.arch)||npc;
 const w=m=>{const r=m.sk&&c.sk?(c.sk[m.sk]||0):0;return 1+(r>=3?4:r>=1?2:0)+(m.sk&&['Unarmed Combat','Blades','Clubs'].includes(m.sk)&&fight?2:0)+(!m.sk?-.5:0)};
 let m=null;for(let t=0;t<40&&!m;t++){const x=wchoose(list,w);if(x.c<=bal)m=x}
 if(!m)return;
 const tl=shuffle(maTechs(m,c));if(!tl.length)return;
 let n=Math.min(tl.length,1+R(0,2));while(n>1&&m.c+MA_TECH_K*(n-1)>bal)n--;
 c.ma={id:m.id,n:m.n,s:m.s,p:m.p,c:m.c,sk:m.sk,sp:m.sp,tech:tl.slice(0,n).map(t=>({id:MTECH[t].id,n:t,s:MTECH[t].s,p:MTECH[t].p}))};
 c.maKarma=m.c+MA_TECH_K*(n-1);
 if(m.sk){
  if(npc){if(!(c.sk[m.sk]>0))c.sk[m.sk]=Math.max(1,Math.min(6,Math.ceil((c.npc.pr||1)/2)+1))}
  else{if((c.sk[m.sk]||0)<2)c.sk[m.sk]=2;if(m.sp&&(!(c.specs||{})[m.sk]||Math.random()<.7)){c.specs=c.specs||{};c.specs[m.sk]=m.sp}}}}
