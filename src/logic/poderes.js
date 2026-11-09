const _ls=loadStore;loadStore=function(s){_ls(s);applyHeritage();fixBooks()};
const PW_OK=['Adrenaline Boost','Astral Perception','Combat Sense','Danger Sense','Improved Potential (Physical)','Improved Potential (Mental)','Improved Potential (Social)','Improved Reflexes','Improved Ability (skill)','Killing Hands','Kinesics','Light Body','Missile Parry','Mystic Armor','Natural Immunity','Pain Resistance','Rapid Healing','Spell Resistance','Traceless Walk','Voice Control','Wall Running'];
const PW_COMBAT={'Improved Reflexes':6,'Combat Sense':4,'Mystic Armor':3,'Killing Hands':3,'Improved Ability (skill)':4,'Pain Resistance':2,'Rapid Healing':2,'Adrenaline Boost':2,'Missile Parry':2,'Improved Potential (Physical)':2,'Danger Sense':1,'Astral Perception':1,'Wall Running':1,'Light Body':1,'Traceless Walk':1,'Kinesics':1,'Spell Resistance':1,'Natural Immunity':1,'Improved Potential (Mental)':1,'Voice Control':1,'Improved Potential (Social)':1};
// ===== Prioridade por papel =====
// Cada perfil é uma lista ORDENADA: [poder, chance, nívelMín, nívelMáx]  ('m' = o máximo que couber).
// Fase 1 compra na ordem da lista (por isso o que vem primeiro nunca fica sem orçamento);
// fase 2 completa o resto sorteando com peso decrescente pela posição (fora do perfil pesa pouco);
// fase 3 sobe níveis dos poderes do perfil, também com peso por posição.
// ia = regex das perícias preferidas para Improved Ability (skill).
const PW_PERFIL={
 lutador:{ia:/Unarmed|Blades|Clubs|Throwing/,l:[['Improved Reflexes',1,2,3],['Killing Hands',.9],['Improved Ability (skill)',.9,1,'m'],['Pain Resistance',.6,1,2],['Mystic Armor',.6,1,2],['Combat Sense',.5,1,2],['Rapid Healing',.4,1,2],['Adrenaline Boost',.3,1,2],['Missile Parry',.2],['Danger Sense',.2,1,2],['Improved Potential (Physical)',.15]]},
 soldado:{ia:/Automatics|Pistols|Longarms|Gunnery|Unarmed/,l:[['Improved Reflexes',1,2,3],['Combat Sense',.9,1,3],['Improved Ability (skill)',.85,1,'m'],['Mystic Armor',.7,1,2],['Pain Resistance',.5,1,2],['Rapid Healing',.4,1,2],['Danger Sense',.4,1,2],['Adrenaline Boost',.3,1,2],['Missile Parry',.2],['Killing Hands',.2]]},
 guarda:{ia:/Unarmed|Pistols|Automatics|Clubs/,l:[['Improved Reflexes',1,2,3],['Mystic Armor',.9,1,2],['Combat Sense',.8,1,3],['Missile Parry',.7],['Killing Hands',.5],['Improved Ability (skill)',.7,1,'m'],['Pain Resistance',.5,1,2],['Danger Sense',.5,1,2],['Rapid Healing',.3,1,2]]},
 furtivo:{ia:/Sneaking|Palming|Locksmith|Gymnastics|Running|Perception/,l:[['Traceless Walk',.9],['Improved Ability (skill)',.9,1,'m'],['Danger Sense',.8,1,3],['Light Body',.6,1,2],['Wall Running',.5],['Improved Reflexes',.5,1,2],['Combat Sense',.4,1,2],['Astral Perception',.2],['Kinesics',.2,1,2]]},
 investigador:{ia:/Perception|Tracking|Sneaking|Con|Computer/,l:[['Danger Sense',.9,1,3],['Improved Ability (skill)',.9,1,'m'],['Kinesics',.8,1,3],['Astral Perception',.6],['Traceless Walk',.4],['Combat Sense',.4,1,2],['Improved Reflexes',.4,1,2],['Improved Potential (Mental)',.3],['Voice Control',.1,1,2]]},
 face:{ia:/Negotiation|Etiquette|Con|Leadership|Intimidation|Impersonation/,l:[['Kinesics',.95,1,3],['Voice Control',.8,1,3],['Improved Ability (skill)',.9,1,'m'],['Improved Potential (Social)',.5],['Danger Sense',.5,1,2],['Rapid Healing',.3,1,2],['Natural Immunity',.3],['Improved Reflexes',.2,1,2]]},
 piloto:{ia:/Pilot|Gunnery|Navigation|Automotive/,l:[['Improved Reflexes',1,1,3],['Improved Ability (skill)',.9,1,'m'],['Danger Sense',.7,1,3],['Combat Sense',.5,1,2],['Pain Resistance',.3,1,2],['Rapid Healing',.3,1,2],['Adrenaline Boost',.3,1,2]]},
 tecnico:{ia:/Medicine|First Aid|Biotechnology|Cybertechnology|Mechanic|Armorer|Chemistry|Computer|Hardware|Software/,l:[['Improved Ability (skill)',.95,1,'m'],['Improved Potential (Mental)',.6],['Natural Immunity',.5],['Rapid Healing',.5,1,2],['Danger Sense',.4,1,2],['Spell Resistance',.3,1,2],['Improved Reflexes',.25,1,2],['Pain Resistance',.2,1,2]]},
 civil:{ia:/Running|Perception|Etiquette|Con/,l:[['Rapid Healing',.7,1,2],['Natural Immunity',.6],['Danger Sense',.6,1,2],['Pain Resistance',.4,1,2],['Light Body',.3,1,2],['Kinesics',.3,1,2],['Improved Reflexes',.2,1,2],['Improved Ability (skill)',.4,1,'m']]}
};
const PW_PAPEL={
 'Civil (cidadão comum)':'civil',
 'Wage slave (funcionário corporativo)':'face','Executivo / Mr. Johnson':'face','Político / burocrata':'face',
 'Cientista':'tecnico','Técnico / engenheiro':'tecnico','Médico / street doc':'tecnico',
 'Arruaceiro / manifestante':'lutador','Ganger de rua (gangue)':'lutador','Sindicato (máfia, yakuza, vory)':'lutador','Cultista / fanático':'lutador',
 'Contrabandista':'furtivo',
 'Segurança corporativa (rent-a-cop)':'soldado','Polícia (Lone Star / força local)':'soldado','Guarda-costas':'guarda','Detetive / investigador':'investigador',
 'Resposta de alta ameaça (HTR)':'soldado','Operações especiais (spec ops)':'soldado','Mercenário (merc)':'soldado','Caçador de recompensas (bounty hunter)':'soldado',
 'Motorista / piloto':'piloto','Informante / fixer':'face'};
const PW_GRUPO={'Civis':'civil','Corporativo e ciência':'face','Rua e crime':'lutador','Segurança e lei':'soldado','Militar e caça':'soldado','Sombras':'furtivo'};
const pwPerfil=c=>{const pp=persPf(c);if(pp)return pp;const t=(c.npc||{}).type,T=TYPES[t]||{};return PW_PERFIL[PW_PAPEL[t]||PW_GRUPO[T.g]||'soldado']};
let PWD=Object.assign({},EMB.PW);
const pwCost=(p,l)=>+(p.pts*(p.lv?l:1)+(p.x||0)).toFixed(2);
const pwMax=(p,mag)=>p.lv?Math.max(1,Math.min(p.mx?+p.mx:99,mag)):1;
const PW_NOIA=['Spellcasting','Counterspelling','Ritual Spellcasting','Summoning','Banishing','Binding','Alchemy','Artificing','Disenchanting','Assensing','Compiling','Decompiling','Registering'];
function genPowers(c){
 const mag=Math.max(1,(c.magic||1)-(c.magicLoss||0));let left=c.pp||0;const out=[];
 const base=PW_OK.filter(n=>PWD[n]&&okSrc(PWD[n].src||'SR5'));
 const pf=pwPerfil(c),L=pf.l,T=TYPES[(c.npc||{}).type]||{};
 const idx=n=>L.findIndex(e=>e[0]===n);
 // perícia do Improved Ability: favorece as do papel (regex do perfil), depois as perícias-base do tipo, ponderando pela graduação
 const iaSkill=()=>{const ok=Object.keys(c.sk||{}).filter(s=>(c.sk[s]||0)>=2&&!PW_NOIA.includes(s));if(!ok.length)return null;
  const tp=ok.filter(s=>(T.s||[]).includes(s));const pool=tp.length?tp:ok;return wchoose(pool,s=>c.sk[s]*(pf.ia.test(s)?4:1)*((T.s||[]).indexOf(s)<3?1.5:1))};
 const afford=(p,l)=>Math.floor((left-(p.x||0))/p.pts+1e-9);
 const add=(n,l)=>{const p=PWD[n];let ex='';if(n==='Improved Ability (skill)'){ex=iaSkill();if(!ex)return false;l=Math.min(l,Math.floor(c.sk[ex]*1.5))}
  if(l<1)return false;const cost=pwCost(p,l);if(cost>left+1e-9)return false;left=+(left-cost).toFixed(2);
  out.push({n,l,pp:cost,id:p.id,pts:p.pts,lv:p.lv,mx:p.mx||'',x:p.x||0,act:p.act||'',pg:p.pg,ex});return true};
 const has=n=>out.some(o=>o.n===n);
 // fase 1: prioridades do papel, na ordem
 L.forEach(([n,pr,lo,hi])=>{
  if(left<.25||!base.includes(n)||has(n)||Math.random()>pr)return;
  const p=PWD[n];let l=1;
  if(p.lv){const top=Math.min(pwMax(p,mag),hi==='m'||hi===undefined?99:hi),mn=Math.min(lo||1,top);l=R(mn,Math.max(mn,hi==='m'?pwMax(p,mag):top));l=Math.min(l,afford(p,l),Math.max(1,Math.floor(((c.pp||0)*.65-(p.x||0))/p.pts+1e-9)))}   // nenhum poder sozinho passa de ~65% do orçamento
  if(l>=1)add(n,l)});
 // fase 2: completa o orçamento; peso cai com a posição no perfil, poder fora do perfil quase não entra
 const wts=n=>{const i=idx(n);return i<0?.15:1+4*(L.length-i)/L.length};
 for(let t=0;t<60&&left>=.25;t++){
  const pool=base.filter(n=>!has(n)&&pwCost(PWD[n],1)<=left+1e-9&&(n!=='Improved Ability (skill)'||Object.keys(c.sk||{}).some(s=>(c.sk[s]||0)>=2&&!PW_NOIA.includes(s))));
  if(!pool.length)break;
  const n=wchoose(pool,wts),p=PWD[n];let l=1;
  if(p.lv){const mx=Math.min(pwMax(p,mag),afford(p,1));l=Math.max(1,R(1,Math.max(1,mx)))}
  if(!add(n,l))break}
 // fase 3: sobra de pontos vira nível nos poderes do papel (peso pela posição)
 for(let t=0;t<30&&left>=.25;t++){const o=out.filter(x=>x.lv&&x.l<pwMax(PWD[x.n],mag)&&x.pts<=left+1e-9&&(x.n!=='Improved Ability (skill)'||x.l+1<=Math.floor((c.sk[x.ex]||0)*1.5)));if(!o.length)break;const x=wchoose(o,y=>wts(y.n));x.l++;x.pp=pwCost(PWD[x.n],x.l);left=+(left-x.pts).toFixed(2)}
 // ordem de exibição: a do perfil (mais importante primeiro)
 out.sort((a,b)=>(idx(a.n)<0?99:idx(a.n))-(idx(b.n)<0?99:idx(b.n)));
 return out}
