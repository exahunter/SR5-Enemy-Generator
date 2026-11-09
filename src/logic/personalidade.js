/* ===== v28: PERSONALIDADE — motor (1 a 5 estilos com %, 1 a 2 traços, camada de coerência) =====
 * Tabelas: data/personalidade.js (ESTILO, TRAÇO) e data/taticas.js. Ligação ao gerador: logic/personalidade-ligacao.js.
 * Modelo guardado em c.npc.pers:
 *   s    [{k, p}]  estilos de atuação e a porcentagem de cada (soma 100, na ordem do maior para o menor)
 *   t    [k]       traços de temperamento (1 ou 2)
 *   pec  [texto]   manias (uma por estilo ≥25% e por traço, no máx. 3)
 *   fr   frase típica       pf  perfil de poderes (adepto)
 * Os % mandam em: atributos, perícias, conhecimentos, armas, acessórios, munição, armadura, gear, implantes, magias, poderes,
 * programas, qualidades, conduta em combate e tabela d100 de táticas. persMarkers() lista o que na ficha comprova cada estilo. */
   // GEN.persLevel: regerando só para subir de nível (nada sorteado de novo nas perícias)
const pcl=(v,a,b)=>Math.max(a,Math.min(b,v)),pshare=(P)=>P.s.map(x=>({k:x.k,p:x.p,f:x.p/100,e:ESTILO[x.k]}));
const PERS_SPEC=sp=>sp==='Lieutenant'||!sp?'':sp;

/* estilo exclusivo de um especial: peso 6 quando é o do NPC; Mago e Adepto se misturam (a mistura vira Adepto místico, SR5 p.69).
   Tecnomante nunca recebe estilo de Mago/Adepto: a qualidade Technomancer proíbe qualquer magia (Chummer: forbidden magenabled). */
const PERS_MIX=1.1;
function persReq(e,sp){const r=e.req;if(r.includes(sp))return 6;
 if(sp==='Mystic'&&(r.includes('Mage')||r.includes('Adept')))return 6;
 if((sp==='Adept'&&r.includes('Mage'))||(sp==='Mage'&&r.includes('Adept')))return PERS_MIX;return 0}
/* peso de um estilo para esta ocupação/especialização */
function persStyleW(k,type,sp){
 const e=ESTILO[k],T=TYPES[type]||{},g=ST_GRP[k];let w=e.w===undefined?1:e.w;
 if(e.req){const x=persReq(e,sp);if(!x)return 0;w*=x}
 else if(sp==='Mystic')w*=({corpo:1,fogo:.5,furtivo:1,social:.6,tecnico:.4}[g]||.3)
 else if(sp==='Decker'||sp==='Technomancer')w*=({social:.8,furtivo:1,tecnico:1}[g]||.12);
 else if(sp==='Mage')w*=({social:.6,furtivo:.7,tecnico:.4,fogo:.1,corpo:.05}[g]||.1);
 else if(sp==='Rigger')w*=({piloto:.8,tecnico:.5,fogo:.2}[g]||.15);
 else if(sp==='Adept')w*=({corpo:2,fogo:1,furtivo:1.3,social:.5}[g]||.6);
 else if(sp==='Lieutenant'){w*=g==='social'?1.5:1;if(k==='lider')w*=4}
 let aff=1;const S=T.s||[];(e.sk||[]).forEach(s=>{const i=S.indexOf(s);if(i>=0)aff+=3/(1+i*.45)});
 const K=typeof KIT!=='undefined'?KIT[type]:null;
 if(K&&K.w&&e.wc)K.w.forEach(([rx,mp,wt])=>{try{if(new RegExp(rx).test(e.wc))aff+=wt*.35}catch(x){avisa('personalidade',x)}});
 const om=typeof OCC_ESTILO_W!=='undefined'?(OCC_ESTILO_W[type]||{}):{};   // v32: estilos de ocupação (ocx) só entram se a ocupação os cita
 if(e.ocx&&!om[k])return 0;
 if(om[k])w*=om[k];
 else if(typeof OCC_GRP_ESTILO_W!=='undefined'){const gm=OCC_GRP_ESTILO_W[T.g];if(gm&&gm[g]!==undefined)w*=gm[g]}
 return w*aff}
const persShares=n=>{const r5=x=>Math.round(x/5)*5;if(n<=1)return[100];if(n===2){const a=r5(R(50,80));return[a,100-a]}
 if(n===3){let a=r5(R(40,60)),b=r5(R(20,35));if(100-a-b<10)b=100-a-10;return[a,b,100-a-b].sort((x,y)=>y-x)}
 /* 4 e 5 estilos: cada fatia sorteada dentro de uma faixa; a última leva o resto (mínimo 5%) e a lista sai do maior para o menor */
 const F=n===4?[[35,40],[25,30],[15,20]]:[[30,35],[20,25],[15,20],[10,15]],out=F.map(([lo,hi])=>r5(R(lo,hi)));out.push(100-out.reduce((a,b)=>a+b,0));return out.sort((a,b)=>b-a)};
/* sorteia a personalidade de um NPC novo (ou devolve a travada, se GEN.persForce) */
function persStart(pr,type,sp){
 if(GEN.persForce){GEN.persCur=JSON.parse(JSON.stringify(GEN.persForce));GEN.persForce=null;if(GEN.persCur.sp===undefined)GEN.persCur.sp=sp;return GEN.persCur}
 const T=TYPES[type]||{},civ=T.g==='Civis',el=typeof document!=='undefined'&&document.getElementById('npers'),fix=el&&el.value!=='auto'?+el.value:0;
 const n=fix||wchoose([1,2,3,4,5],x=>{const lo=civ||pr<=1;return x===1?(lo?.68:.4):x===2?(lo?.26:.38):x===3?(lo?.045:.15):x===4?(lo?.01:.05):(lo?.005:.02)});
 const keys=Object.keys(ESTILO),pk=[];
 for(let i=0;i<n;i++){
  let cand=keys.map(k=>({k,w:pk.some(x=>x.k===k)?0:persStyleW(k,type,sp)*(pk.some(x=>ST_GRP[x.k]===ST_GRP[k])?.45:1)})).filter(x=>x.w>0);
  /* v42: grupos — o 1º estilo vem da preferência do papel (GEN.persPref = [[estilo,peso]…]) quando a ocupação/especialização aceita algum */
  if(i===0&&GEN.persPref){const pf=GEN.persPref,c2=cand.filter(x=>pf.some(p=>p[0]===x.k)).map(x=>({k:x.k,w:x.w*pf.find(p=>p[0]===x.k)[1]}));if(c2.length)cand=c2}
  if(!cand.length)break;pk.push(wchoose(cand,x=>x.w))}
 GEN.persPref=null;
 if(!pk.length)pk.push({k:'pistoleiro'});
 const sh=persShares(pk.length),s=pk.map((x,i)=>({k:x.k,p:sh[i]}));
 /* traços: peso da ocupação × afinidade com os estilos; sem os incompatíveis */
 const nt=Math.random()<(civ||pr<=1?.4:.6)?2:1,t=[];
 for(let i=0;i<nt;i++){
  const cand=Object.keys(TRACO).filter(k=>!t.includes(k)&&!t.some(j=>(TRACO[j].c||[]).includes(k)||(TRACO[k].c||[]).includes(j))).map(k=>({k,w:(TRACO[k].gw&&TRACO[k].gw[T.g]||1)*(.5+s.reduce((a,x)=>a+x.p/100*((TR_AFF[ST_GRP[x.k]]||{})[k]??1),0))*(typeof persOccTW==='function'?persOccTW(type,sp,k):1)}));
  if(!cand.length)break;t.push(wchoose(cand,x=>x.w).k)}
 const P={s,t,pec:[],fr:'',pf:''},rqs=r=>s.some(x=>(ESTILO[x.k].req||[]).includes(r));
 P.sp=(sp==='Adept'&&rqs('Mage'))||(sp==='Mage'&&rqs('Adept'))?'Mystic':sp;
 const pf=wchoose(s,x=>x.p);P.pf=ESTILO[pf.k].pf||'';
 const pe=[];s.forEach(x=>{if(x.p>=25||!pe.length){const l=ESTILO[x.k].pec||[];if(l.length)pe.push(pick(l))}});t.forEach(k=>{const l=TRACO[k].pec||[];if(l.length)pe.push(pick(l))});
 P.pec=[...new Set(pe)].slice(0,3);
 GEN.persCur=P;return P}

/* ---- atributos, perícias e conhecimentos ---- */
function persAttrW(P){const W={};if(!P)return W;P.s.forEach(x=>{const e=ESTILO[x.k];(e.at||[]).forEach((a,i)=>{W[a]=(W[a]||0)+(x.p/100)*[1,.6,.35][i]})});
 P.t.forEach(k=>(TRACO[k].at||[]).forEach(a=>{W[a]=(W[a]||0)+.25}));Object.keys(W).forEach(k=>W[k]=Math.min(1,W[k]));return W}
const persFavAttrs=P=>{const W=persAttrW(P);return Object.keys(W).filter(k=>W[k]>=.35)};
/* foco de cada estilo: a 1ª perícia da lista do estilo que o NPC já tem; se nenhuma, a 1ª da lista */
function persFocus(e,has){const f=(e.sk||[]).find(s=>has(s));return f||(e.sk||[])[0]}
function persSkillList(P,list){if(!P)return list;const out=[],add=s=>{if(s&&SKCAT[s]&&!out.includes(s))out.push(s)};
 P.f=[];P.s.forEach(x=>{const f=persFocus(ESTILO[x.k],s=>list.includes(s));P.f.push(f);add(f)});list.forEach(add);return out}
function persSkillFx(sk,P,SKC,sr,pr){if(!P)return;
 const foc=P.s.map((x,i)=>({x,f:P.f&&P.f[i]})).filter(o=>o.f&&sk[o.f]!==undefined);
 foc.forEach(({x,f},i)=>{const e=ESTILO[x.k],others=Object.keys(sk).filter(s=>!foc.some(o=>o.f===s)&&!/Magical|Resonance/.test(SKCAT[s]||'')).map(s=>sk[s]);
  let r=x.p>=50?sr+1:x.p>=30?sr:x.p>=15?sr-1:sk[f];
  if(i===0&&x.p>=50)r=Math.max(r,Math.max(0,...others));
  sk[f]=Math.max(1,Math.min(SKC,Math.max(sk[f],r)));
  if(x.p>=30)(e.sk||[]).slice(1,3).forEach(s=>{if(SKCAT[s]&&sk[s]===undefined&&(!e.req||ESTILO[x.k].req))sk[s]=Math.max(1,Math.min(SKC,sr-2))})})}
/* perícias do "ap" do estilo que o NPC aprendeu no caminho: 1 a cada 3 níveis */
function persApPool(P,have){const out=[];P.s.forEach(x=>(ESTILO[x.k].ap||[]).forEach(s=>{if(SKCAT[s]&&!have(s)&&!out.some(o=>o.s===s))out.push({s,w:x.p/100})}));return out}
function persAp(sk,P,pr,SKC,sr){if(!P||pr<3||GEN.persLevel)return;
 for(let n=Math.floor(pr/3);n>0;n--){const pl=persApPool(P,s=>sk[s]!==undefined);if(!pl.length)break;const o=wchoose(pl,x=>x.w);sk[o.s]=Math.max(1,Math.min(SKC,sr-3+R(0,1)))}}
const XKT_P={'Corporate Law':'Professional','Ballistics':'Academic','Pharmacology':'Academic','Research Papers':'Academic','Magical Theory':'Academic','Spirit Lore':'Academic','Sprite Lore':'Academic','Signal Theory':'Academic','Data Brokers':'Professional','Corporate Hosts':'Professional','Parts Suppliers':'Professional','City Records':'Professional','Military History':'Academic','Folk Medicine':'Academic','Gun Manufacturers':'Professional','Blade Smiths':'Professional','Weapon Systems':'Professional','Astral Signatures':'Academic','IC Patterns':'Academic','Matrix Culture':'Interests','Stage Magic':'Interests','Martial Arts Trivia':'Interests','Tactics':'Professional'};
function persKnow(c){const P=c.npc&&c.npc.pers;if(!P)return;c.know=c.know||[];
 P.s.forEach(x=>{if(x.p<15)return;const k=(ESTILO[x.k].kn||[])[0];if(k&&!c.know.includes(k))c.know.push(k)})}

/* ---- qualidades, implantes, magias, poderes, programas ---- */
/* peso extra de uma qualidade (somado ao peso do arquétipo em genQuals) */
function persQW(name,t){const P=GEN.persCur;if(!P)return 0;let w=0;
 P.s.forEach(x=>{const e=ESTILO[x.k],m=t==='Positive'?e.qp:e.qn;if(m&&m[name])w+=3*(x.p/100)*m[name]});
 P.t.forEach(k=>{const m=t==='Positive'?TRACO[k].pq:TRACO[k].nq;if(m&&m[name])w+=1.5*m[name]});return w}
const persImpF=c=>{const P=c.npc&&c.npc.pers;return P?P.t.reduce((a,k)=>a*(TRACO[k].imp===undefined?1:TRACO[k].imp),1):1};
function persImpW(name){const P=GEN.persCur;if(!P)return 1;let m=1;
 P.s.forEach(x=>(ESTILO[x.k].im||[]).forEach(([rx,w])=>{try{if(new RegExp(rx,'i').test(name))m+=w*(x.p/100)}catch(e){avisa('personalidade',e)}}));return m}
function persCatOrder(cats){const P=GEN.persCur;if(!P)return shuffle(cats.slice());
 const W={};P.s.forEach(x=>(ESTILO[x.k].sc||[]).forEach((k,i)=>{W[k]=(W[k]||0)+(x.p/100)*(i?.7:1)}));
 const o=shuffle(cats.slice()).sort((a,b)=>(W[b]||0)-(W[a]||0)),out=[];o.forEach(k=>{out.push(k);if((W[k]||0)>=.45)out.push(k)});return out}
const persPf=c=>{const P=c.npc&&c.npc.pers;return P&&P.pf&&PW_PERFIL[P.pf]?PW_PERFIL[P.pf]:null};
const DK_ST={invasor:['Exploit','Sneak','Decryption','Stealth'],ciberlutador:['Hammer','Armor','Biofeedback','Track','Fork'],guerreletronica:['Blackout','Lockdown','Track','Sneak','Jammer'],analista:['Decryption','Track','Exploit','Armor','Guard']};
function persDkAdj(name){const P=GEN.persCur;if(!P)return 0;let a=0;P.s.forEach(x=>{const l=DK_ST[x.k];if(!l)return;const i=l.indexOf(name);if(i>=0)a-=10*(x.p/100)*(1-i/(l.length+1))});return a}

/* ---- equipamento: perfil de kit personalizado ---- */
const persArmCls=v=>v<=7?['leve','discreta']:v<=9?['leve']:v<=12?['tatica']:['pesada'];
function persArmMul(name,P){const r=EQAm.get(name);if(!r)return 1;const a=eqNum(r[3]);let m=0,t=0;
 P.s.forEach(x=>{const cl=ESTILO[x.k].ar;if(!cl)return;t+=x.p;m+=x.p*(persArmCls(a).includes(cl)?2:cl==='pesada'?.45:cl==='discreta'?.3:.8)});return t?m/t:1}
function persKit(K0,P){
 const K=Object.assign({},K0),S=pshare(P),top=S[0],e1=top.e,pw0=K0.pw===undefined?1:K0.pw;
 /* armas: o 1º estilo escolhe a arma principal; o 2º e o 3º, a reserva e a branca */
 const wcOf=e=>e.wc&&[[e.wc,0,8]];
 if(e1.wk==='f'&&e1.wc){K.w=[...wcOf(e1),...(K0.w||[]).map(([r,m,w])=>[r,m,w*.35])];if(top.p>=50)K.pw=Math.max(pw0,.55)}
 else if(e1.wk==='m'&&e1.wc){K.w=wcOf(e1);K.pw=Math.max(pw0,.7);K.s=K0.w;K.sp=Math.max(K0.sp||0,.3)}
 else if(e1.wk==='u')K.pw=Math.min(pw0,pw0>=1?.85:.4);   // profissão sempre armada (polícia, merc…) mantém a arma de serviço na maioria dos casos
 S.slice(1).forEach(({e,p})=>{if(p<20||!e.wc||(e.wk!=='f'&&e.wk!=='m'))return;
  if(e.wk==='f'){if(!K.sSet){K.s=wcOf(e);K.sp=Math.max(K0.sp||0,.85);K.sSet=1;K.pw=Math.max(K.pw===undefined?1:K.pw,.55)}}
  else if(!K.mSet){K.m=wcOf(e);K.mp=Math.max(K0.mp||0,.8);K.mSet=1}});
 /* acessórios e nível de acessórios */
 const pa={};S.forEach(({e,f})=>Object.keys(e.pa||{}).forEach(n=>pa[n]=(pa[n]||0)+e.pa[n]*f));
 K.pa=pa;K.a=pcl((K0.a||0)+P.t.reduce((a,k)=>a+(TRACO[k].acc||0),0),0,3);if(Object.keys(pa).some(n=>pa[n]>=.25)&&top.p>=40)K.a=Math.max(K.a,2);
 /* gear: o do estilo (chance cai com a fração) + o do traço */
 const g=[...(K0.g||[])];
 S.forEach(({e,f})=>(e.pg||[]).forEach(([n,p,mp])=>g.push([n,Math.min(1,p*(.45+.9*f)),mp||0])));
 P.t.forEach(k=>(TRACO[k].g||[]).forEach(a=>g.push(Array.isArray(a)?a.slice():[a])));
 K.g=g;
 /* munição especial */
 const am=[...(K0.am||[])];S.forEach(({e,f})=>(e.pam||[]).forEach(([n,p,mp])=>am.push([n,Math.min(1,p*(.5+f)),mp||0])));K.am=am;
 /* armadura e mods */
 const AR=Object.assign({p:0,l:[]},K0.ar);
 AR.p=pcl((AR.p||0)+P.t.reduce((a,k)=>a+(TRACO[k].arp||0),0),0,1);AR.h=pcl((AR.h||0)+P.t.reduce((a,k)=>a+(TRACO[k].arh||0),0),0,1);
 if(AR.l&&AR.l.length)AR.l=AR.l.map(([n,w,mp])=>[n,w*persArmMul(n,P),mp]);K.ar=AR;
 const md=Object.assign({},K0.md||{});S.forEach(({e,f})=>Object.keys(e.md||{}).forEach(n=>md[n]=Math.min(1,(md[n]||0)+e.md[n]*(.5+f))));
 P.t.forEach(k=>Object.keys(TRACO[k].md||{}).forEach(n=>md[n]=Math.min(1,(md[n]||0)+TRACO[k].md[n])));K.md=md;
 K.cap=P.t.reduce((a,k)=>a*(TRACO[k].cap||1),1);
 if(K.w!==K0.w&&K0.wkp)K.wkp=K0.wkp*.25;   // o estilo da personalidade já escolheu a arma: o kit pronto só entra de vez em quando
 return K}
/* escolha de arma entre candidatas: estilo prefere a categoria dele; luxo/sovinice pesam pelo custo */
function persPickW(cand){const P=GEN.persCur;if(!P||!cand.length)return pick(cand);
 const lux=P.t.some(k=>TRACO[k].lux),frug=P.t.reduce((a,k)=>a*(TRACO[k].cap||1),1)<1,mx=Math.max(...cand.map(i=>i[2]||0))||1;
 return wchoose(cand,i=>{let w=1;const sub=i[6]||'';pshare(P).forEach(({e,f})=>{if(e.wp&&e.wp.test(sub))w+=4*f});
  if(lux)w*=1+3*(i[2]/mx);if(frug)w*=1+2*(1-i[2]/mx);return w})}

/* ---- conduta em combate: bravura, rendição e reforço vêm dos traços ---- */
function persHook(c){const o=c.npc,P=o&&o.pers,h=o&&o.hook;if(!P||!h)return;
 const tr=P.t.map(k=>TRACO[k]),bvs=tr.filter(t=>t.bv!==undefined).map(t=>t.bv);
 if(bvs.length){const bv=bvs.reduce((a,b)=>a+b,0)/bvs.length;h.f=bv>=1?1:+pcl(h.f*.4+bv*.6,.1,.98).toFixed(2)}
 const rd=tr.reduce((a,t)=>a*(t.rd===undefined?1:t.rd),1);
 if(rd===0)h.rd=false;else if(rd<1&&h.rd&&Math.random()>rd)h.rd=false;else if(rd>1&&!h.rd&&Math.random()<(rd-1)*.5)h.rd=true;
 const rf=tr.reduce((a,t)=>a*(t.rf===undefined?1:t.rf),1),T=TYPES[o.type]||{},B=GC_CMB_TIPO[o.type]||GC_CMB[T.g||'Civis']||GC_CMB['Civis'];
 if(h.rf&&rf<1&&Math.random()>rf)h.rf=null;else if(!h.rf&&rf>1&&Math.random()<(rf-1)*.4)h.rf={rd:R(1,3),min:R(2,10),n:R(2,5),q:pick(B.who)};
 if(P.pec&&P.pec.length)h.pec=P.pec[0];
 const mot=tr.map(t=>t.mot&&t.mot.length?pick(t.mot):null).filter(Boolean);if(mot.length&&Math.random()<.7)h.mot=mot[0]}

/* estilos sem 'pg' na tabela: itens que os marcam quando faltar outro sinal na ficha */
const ST_PGX={lider:[['Micro-Transceiver',1,0],['Earbuds',1,0]],atirador:[['Binoculars',1,0]],escopeteiro:[['Flashlight',1,0]],fuzileiro:[['Flashlight',1,0]],guerreletronica:[['White Noise Generator',1,3],['Bug Scanner',1,2]],intimidador:[['Earbuds',1,0]],cassetete:[['Flashlight',1,0]],arremessador:[['Flashlight',1,0]]};
const persPg=e=>[...(e.pg||[]),...(ST_PGX[Object.keys(ESTILO).find(k=>ESTILO[k]===e)]||[])];
function persExtraMarks(k,c,it){const G=c.gear||[],g=ST_GRP[k];
 if(DK_ST[k]){const l=G.filter(x=>x.cat==='prog'&&DK_ST[k].includes(x.n)).map(x=>x.n).slice(0,2);if(l.length)it.push({t:xl('Programa'),v:l.join(', ')})}
 if(g==='piloto'||k==='artilheiro'){const l=G.filter(x=>x.cat==='veh'||x.cat==='drone').map(x=>x.n).slice(0,2);if(l.length)it.push({t:xl('Veículo/drone'),v:l.join(', ')})}
 if(k==='compilador'||k==='registrador'){const l=(c.spirits||[]).filter(s=>s.sprite).map(s=>s.n).slice(0,2);if(l.length)it.push({t:'Sprites',v:l.join(', ')})}
 if(k==='invocador'||k==='magocombate'&&0){const l=(c.spirits||[]).filter(s=>!s.sprite).map(s=>s.n).slice(0,2);if(l.length)it.push({t:xl('Espíritos'),v:l.join(', ')})}}
/* ---- camada de coerência: o que na ficha comprova cada estilo e cada traço ---- */
const persMainArmor=G=>G.filter(x=>x.cat==='armor'&&!/^\+/.test(String((x.st||{}).armor||''))).sort((a,b)=>eqNum((b.st||{}).armor)-eqNum((a.st||{}).armor))[0];
function persMarkers(c){const P=c.npc&&c.npc.pers;if(!P)return null;
 const G=c.gear||[],W=G.filter(x=>x.cat==='weapon'&&!x.nat),names=new Set(G.map(x=>x.n)),A=persMainArmor(G),imp=G.filter(x=>x.cat==='cyber'||x.cat==='bio'),qn=(c.q||[]).map(x=>x.n),sk=c.sk||{},spl=c.spells||[];
 const sty=P.s.map(x=>{const e=ESTILO[x.k],it=[];
  (e.sk||[]).filter(s=>sk[s]).slice(0,2).forEach(s=>it.push({t:xl('Perícia'),v:s+' '+sk[s],free:1}));
  const ww=e.wp?W.filter(w=>e.wp.test(w.sub||'')):[];ww.slice(0,1).forEach(w=>it.push({t:xl('Arma'),v:w.n}));
  const pa=[];W.forEach(w=>(w.acc||[]).forEach(a=>{if(e.pa&&e.pa[a.n]&&!pa.includes(a.n))pa.push(a.n)}));pa.slice(0,2).forEach(n=>it.push({t:xl('Acessório'),v:n}));
  persPg(e).filter(([n])=>names.has(n)).slice(0,2).forEach(([n])=>it.push({t:xl('Equipamento'),v:n}));
  persExtraMarks(x.k,c,it);
  if(e.pw&&(c.powers||[]).length){const m=c.powers.filter(p=>e.pw.includes(p.n));if(m.length)it.push({t:xl('Poderes'),v:m.slice(0,2).map(p=>p.n).join(', ')})}
  if(e.ar&&A&&persArmCls(eqNum((A.st||{}).armor)).includes(e.ar))it.push({t:xl('Armadura'),v:A.n+' ('+{leve:xl('leve'),discreta:xl('discreta'),tatica:xl('tática'),pesada:xl('pesada')}[e.ar]+')'});
  (e.im||[]).forEach(([rx])=>{const m=imp.find(i=>new RegExp(rx,'i').test(i.n));if(m&&!it.some(z=>z.v===m.n))it.push({t:xl('Implante'),v:m.n})});
  Object.keys(e.qp||{}).filter(n=>qn.includes(n)).slice(0,2).forEach(n=>it.push({t:xl('Qualidade'),v:n}));
  Object.keys(e.qn||{}).filter(n=>qn.includes(n)).slice(0,1).forEach(n=>it.push({t:xl('Qualidade'),v:n}));
  if(e.sc&&spl.length){const m=spl.filter(s=>e.sc.includes(s[1]));if(m.length)it.push({t:xl('Magias'),v:m.slice(0,2).map(s=>s[0]).join(', ')})}
  const ap=(e.ap||[]).filter(s=>sk[s]).slice(0,2);if(ap.length)it.push({t:'Aprendeu',v:ap.join(', '),free:1});
  const kn=(e.kn||[]).filter(k=>(c.know||[]).includes(k));if(kn.length)it.push({t:xl('Conhecimento'),v:kn[0],free:1});
  return{k:x.k,p:x.p,n:xl(e.n),d:e.d,it}});
 const h=c.npc.hook||{},trs=P.t.map(k=>{const t=TRACO[k],it=[];
  (t.g||[]).filter(([n])=>names.has(n)).slice(0,2).forEach(([n])=>it.push({t:xl('Equipamento'),v:n}));
  const mods=[];G.forEach(x=>(x.mods||[]).forEach(m=>{if(t.md&&t.md[m.n]&&!mods.includes(m.n))mods.push(m.n)}));mods.slice(0,1).forEach(n=>it.push({t:xl('Mod de armadura'),v:n}));
  Object.keys(t.pq||{}).filter(n=>qn.includes(n)).slice(0,2).forEach(n=>it.push({t:xl('Qualidade'),v:n}));
  Object.keys(t.nq||{}).filter(n=>qn.includes(n)).slice(0,2).forEach(n=>it.push({t:xl('Defeito'),v:n}));
  if(t.imp!==undefined){const sp=+(c.imp&&c.imp.spent)||0;if(t.imp<1&&sp<=1.5)it.push({t:xl('Implantes'),v:xlf('poucos ({0} de {1})',fmtDec(sp,1),termo('essence'))});if(t.imp>1&&sp>=2)it.push({t:xl('Implantes'),v:xlf('muitos ({0} de {1})',fmtDec(sp,1),termo('essence'))})}
  if(t.bv!==undefined&&h.f!==undefined)it.push({t:xl('Conduta'),v:h.f>=1?xl('não foge'):xl('foge com ')+Math.round(h.f*100)+xl('% do monitor'),free:1});
  if(t.rd!==undefined)it.push({t:xl('Conduta'),v:h.rd?xl('rende-se se encurralado'):xl('não se rende'),free:1});
  if(t.rf!==undefined)it.push({t:xl('Conduta'),v:h.rf?xl('chama reforço'):xl('não chama reforço'),free:1});
  if(t.mot&&h.mot&&t.mot.includes(h.mot))it.push({t:xl('Motivação'),v:h.mot,free:1});
  const pc=(t.pec||[]).find(z=>(P.pec||[]).includes(z));if(pc)it.push({t:xl('Mania'),v:pc,free:1});
  return{k,n:xl(t.n),it}});
 const sheet=sty.reduce((a,x)=>a+x.it.filter(i=>!i.free).length,0)+trs.reduce((a,x)=>a+x.it.filter(i=>!i.free).length,0),all=sty.reduce((a,x)=>a+x.it.length,0)+trs.reduce((a,x)=>a+x.it.length,0);
 return{sty,trs,sheet,all}}

/* garante que todo estilo ≥25% tenha ao menos 1 marcador "de ficha" (arma, acessório, equipamento, armadura, implante, qualidade ou magia) */
function persEnforce(c){const P=c.npc&&c.npc.pers;if(!P||c.crit||lockOf(c).gear)return;
 const pr=c.npc.pr||0,G=c.gear;let changed=false;eqBowSet(c,pr);
 for(let pass=0;pass<2;pass++){const M=persMarkers(c);
  M.sty.forEach(s=>{if(s.p<25||s.it.some(i=>!i.free))return;const e=ESTILO[s.k];
   /* 1) um item de gear do estilo (o primeiro que cabe) */
   for(const [n,p,mp] of persPg(e)){if(pr<(mp||0)||G.some(x=>x.n===n))continue;const x=EQGm.get(n);if(!x||!okSrc(x[7])||!eqAvOk(x[6],pr))continue;
    const rt=x[5]>0?Math.max(1,Math.min(x[5],R(Math.ceil(pr/3),Math.ceil(pr/2)+1))):0;G.push(eqGearItem(x,1,rt));changed=true;return}
   /* 2) armadura da classe do estilo (tática, pesada…) */
   if(e.ar&&e.ar!=='leve'){try{const K=persKit(KIT[c.npc.type]||{},P),b=BUD(pr),ac=Math.max(b*.6,600),
     cand=EQ.A.filter(r=>okSrc(r[7])&&eqCtxOk(['armor',r[0],r[5],r[7],0,'',r[2]])&&persArmCls(eqNum(r[3])).includes(e.ar)&&!/^\+/.test(String(r[3]))&&r[5]<=ac&&eqAvOk(r[6],pr)),
     kl=new Set(((K.ar||{}).l||[]).map(x=>x[0]));   // v44: antes pegava as 3 mais caras da classe (Bunker Gear, traje de mergulho…); agora prefere a lista do perfil e pesa pelo preço
     if(cand.length){const r=wchoose(cand,x=>(kl.has(x[0])?5:1)/(1+x[5]/800)),a=eqArmorItem(r);eqDressArmor(a,K,pr,{left:b*.2});const old=persMainArmor(G);if(old)G.splice(G.indexOf(old),1);G.push(a);changed=true;return}}catch(x){avisa('personalidade',x)}}
   /* 3) troca de arma principal por uma da categoria do estilo */
   if(e.wp&&e.wc&&s===M.sty[0]){try{const K=persKit(KIT[c.npc.type]||{},P),pool=poolItems().filter(i=>i[0]==='weapon'&&!EQ_MELEE_OUT.test(i[6]||'')&&!(i[7]||{}).cyberware&&!('hide' in (i[7]||{}))&&!EQ_BANNAME.test(i[1])),
     b=BUD(pr),w=eqPickWeapon([[e.wc,0,1]],pool,pr,Math.max(b*.4,350)*(K.cap||1),G.filter(x=>x.cat==='weapon'));
     if(w){const nw=eqWeaponItem(w),old=G.find(x=>x.cat==='weapon'&&!x.nat&&!e.wp.test(x.sub||''));eqDressWeapon(nw,K,pr,{left:b*.2});if(old)G.splice(G.indexOf(old),1);G.push(nw);eqAmmo(c,K,pr);changed=true}}catch(x){avisa('personalidade',x)}}})}
 return changed}

/* ---- ficha: resumo curto ---- */
const persLabel=P=>P.s.map(x=>xl(ESTILO[x.k].n)+' '+x.p+'%').join(' · ');
const persTraits=P=>P.t.map(k=>xl(TRACO[k].n)).join(', ');
