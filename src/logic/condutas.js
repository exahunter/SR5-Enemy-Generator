/* ===== v31: condutas em combate (substituem a tabela d100 de ações) =====
 * Cada NPC ganha 5 condutas com a vida alta (uma de cada slot: abordagem, movimento, cobertura, equipe, alvo/recursos)
 * e 3 com a vida baixa (ferido → muito ferido → quase caindo). Bancos: data/condutas-alta.js e data/condutas-baixa.js.
 * Ficam em c.npc.cond e são refeitas sozinhas quando mudam personalidade, lealdade, gancho ou equipamento.
 * Vida baixa depende da LEALDADE (c.npc.loy 1–6; quem não tem recebe uma por ocupação/traços):
 *   leal (5–6) não abandona os aliados (luta, cobre a retirada, se explode correndo), mas às vezes "o leal não é tão leal assim" (exceção sorteada);
 *   médio (3–4) recua, se rende ou segura mais um pouco; desleal (1–2) foge, se rende ou vira a casaca.
 * Os 3 passos são coerentes: cada conduta declara depois de quais condutas do passo anterior ela pode vir. */
const CD_TOP=['Líder','Chefe','Sargento','Supervisor'];
const CD_NUMK=['near','far','stl','soc','tec','mag','mtx','pil','co','vo','tt'];   // co coordenação · vo volatilidade · tt tática (perfil de ocupação)
let CD_BANK=null;
/* lê os bancos uma vez: "texto§afinidades§tags§incompatíveis" (alta) e "texto§níveis§tag§vem-depois-de§afinidades" (baixa) */
/* o que a conduta cita → o que a ficha precisa ter (token de bloqueio, ver cdTokOk/cdFill) */
const CD_CITA=[[/granada/i,'GREN'],[/feiti[çc]o|\bconjura\b/i,'SPL']];
function cdBank(){if(CD_BANK)return CD_BANK;
 const aff=s=>{const r={};(s||'').split(' ').filter(Boolean).forEach(p=>{const m=p.match(/^([A-Za-z]+?)(-?\d*\.?\d+)?$/);if(m)r[m[1]]=m[2]===undefined?1:+m[2]});return r},
  sp=s=>(s||'').split(' ').filter(Boolean),tk=t=>{const r=(t.match(/\{([A-Z0-9]+)\}/g)||[]).map(z=>z.slice(1,-1));
  CD_CITA.forEach(([re,k])=>{const o=t.replace(/\{[^{}]*\|[^{}]*\}/g,g=>g.slice(1,-1).split('|').every(z=>re.test(z))?'x '+g.slice(1,-1).split('|')[0]:'');if(re.test(o)&&!r.includes(k))r.push(k)});return r},   // conduta que sempre cita granada/feitiço só vale para quem tem
  hi={},lo={};
 Object.keys(CD_HI).forEach(k=>{hi[k]=CD_HI[k].map(l=>{const p=l.split('§'),a=aff(p[1]);return{t:p[0],a,b:a.b===undefined?.7:a.b,g:sp(p[2]),no:sp(p[3]),tok:tk(p[0])}})});
 Object.keys(CD_LO).forEach(k=>{lo[k]=CD_LO[k].map(l=>{const p=l.split('§'),a=aff(p[4]);return{t:p[0],lv:p[1],a,b:a.b===undefined?.7:a.b,g:sp(p[2]),p:sp(p[3]),tok:tk(p[0])}})});
 return CD_BANK={hi,lo}}
/* lealdade 1–6 (v32: neutra e gerada pelo perfil de ocupação + personalidade; ver logic/perfil-ocupacao.js).
   Com c.npc.loy (lealdade ao líder, definida ao compor o grupo) usa esse valor; sem ele, gera uma vez e guarda em c.npc.loyg. */
function condLoy(c){
 const o=c.npc||{},P=o.pers;let L=+o.loy;
 if(!L){const sig=[o.type,o.role||'',P?P.t.join('.'):'',P?P.s.map(z=>z.k).join('.'):'',(P&&P.sp)||o.sp||''].join('|');
  if(!o.loyg||o.loyg.sig!==sig)o.loyg={v:loyGen(c),sig};L=o.loyg.v}
 if((o.rel||[]).some(r=>/Lealdade comprada|Informante/.test(r)))L=Math.min(L,2);
 return Math.max(1,Math.min(6,L))}
/* contexto: o que a ficha, a personalidade, o grupo e o gancho dizem sobre o NPC */
function cdTokens(c,P){if(P){try{return persTokens(c,P)}catch(e){avisa('condutas',e)}}
 const G=c.gear||[],W=G.filter(x=>x.cat==='weapon'&&!x.nat),dr=G.find(x=>x.cat==='drone')||G.find(x=>x.cat==='veh'),dk=G.find(x=>x.cat==='comm'&&x.sub==='Cyberdecks'),sp=(c.spells||[])[0],spi=(c.spirits||[])[0];
 return{W1:W[0]&&W[0].n,W2:W[1]&&W[1].n,SP:sp&&sp[0],SPI:spi&&spi.n,DR:dr&&dr.n,DECK:dk&&dk.n}}
function condCtx(c){
 const o=c.npc||{},P=o.pers,S=P?pshare(P):[],gs={},tr=k=>!!(P&&P.t&&P.t.includes(k));
 S.forEach(({k,f})=>{const g=ST_GRP[k];if(g)gs[g]=(gs[g]||0)+f});
 const near=(gs.corpo||0)+(tr('agressivo')?.3:0)+(tr('impulsivo')?.2:0)+(tr('fanatico')?.2:0),
  far=(gs.fogo||0)+(gs.magia||0)+(gs.matrix||0)+(gs.piloto||0)*.6+(gs.furtivo||0)*.5+(tr('cauteloso')?.3:0)+(tr('paranoico')?.2:0),
  loy=condLoy(c),h=o.hook||{},pf=persPerfil(c),sh={};S.forEach(z=>{sh[z.k]=z.f});
 return{o,P,h,perfil:pf,co:pf.co,vo:pf.vo,tt:pf.tt,tg:pf.tags,sh,near,far,stl:gs.furtivo||0,soc:gs.social||0,tec:gs.tecnico||0,mag:gs.magia||0,mtx:gs.matrix||0,pil:gs.piloto||0,
  tk:cdTokens(c,P),loy,tr,fan:o.type==='Cultista / fanático'||tr('fanatico'),grp:!!(o.gid||o.vinc),
  lead:CD_TOP.includes(o.role)||(o.loy===0&&!!o.vinc),lei:(TYPES[o.type]||{}).g==='Segurança e lei',
  gren:(c.gear||[]).some(x=>/Grenade/i.test(x.n)),spl:!!((c.spells||[]).length)}}
/* peso de uma conduta para este NPC */
function cdW(o,x){let w=o.b;const a=o.a;
 for(const k in a){if(k==='b'||k==='G'||k==='N')continue;const v=a[k];
  if(CD_NUMK.includes(k))w+=(x[k]||0)*v;
  else if(k==='lead')w+=x.lead?v:0;else if(k==='lei')w+=x.lei?v:0;else if(k==='fan')w+=x.fan?v:0;
  else if(k==='hl')w+=x.loy>=4?v:0;else if(k==='ll')w+=x.loy<=2?v:0;
  else if(k==='rd')w+=x.h.rd?v:0;else if(k==='fl')w+=(x.h.f<.55)?v:0;else if(k==='rf')w+=x.h.rf?v:0;
  else if(/^E[a-z]+$/.test(k))w+=((x.sh||{})[k.slice(1)]||0)*v;          // Eestilo: peso do estilo na personalidade
  else if(/^[A-Z]{2,}$/.test(k))w+=(x.tg||{})[k]?v:0;                       // TAG de ocupação/especialização (SOLD, GANG, SMAGE…)
  else if(x.tr(k))w+=v}
 if(a.G&&!x.grp)w*=.15;if(a.N&&x.lead)w*=.1;w=Math.max(.03,w);
 /* v32: o tático e coordenado repete o que faz melhor (pesos mais afiados); o volátil é mais aleatório (pesos achatados) */
 return Math.max(.03,Math.pow(w,pfClamp(1+.7*(x.tt||0)-.7*(x.vo||0),.45,1.6)))}
/* fichas ({W1}, {SP}…): sem o item na ficha, a conduta não entra */
function cdTokOk(o,x){return o.tok.every(k=>k==='RF'?!!x.h.rf:k==='GREN'?x.gren:k==='SPL'?x.spl:!!x.tk[k])}
function cdFill(t,x){const m={RF:x.h.rf&&x.h.rf.q,GREN:xl('uma granada')},mp=Object.assign({},m,{GREN:'uma granada'}),tk=(s,M)=>s.replace(/\{([A-Z0-9]+)\}/g,(z,k)=>(M[k]!==undefined?M[k]:x.tk[k])||'');
 const p0=REV.get(t);
 return fillAlt(tk(t,m),L=>{const ok=L.filter(o=>CD_CITA.every(([re,k])=>(k==='GREN'?x.gren:x.spl)||!re.test(o)));return pick(ok.length?ok:L)},p0!=null?tk(p0,mp):undefined)}   // descarta as opções que citam o que a ficha não tem
/* ---------- vida alta: 5 condutas, uma por slot, sem se contradizerem ---------- */
function condHi(x){
 const B=cdBank().hi,slots=['h1','h2','h3','h4','h5'],got={},cl=(o,q)=>o.no.some(t=>q.g.includes(t))||q.no.some(t=>o.g.includes(t));
 const edge=[];if(x.P&&typeof TAT_TR!=='undefined')x.P.t.forEach(k=>{const e=TAT_TR[k]&&TAT_TR[k].e;if(e)edge.push({t:'Edge: '+e.replace(/\.$/,'').replace(/^./,m=>m.toLowerCase()),a:{},b:1.6,g:[],no:[],tok:[]})});
 slots.slice().sort(()=>Math.random()-.5).forEach(s=>{
  const pool=B[s].filter(o=>cdTokOk(o,x)).concat(s==='h5'?edge:[]),pr=Object.values(got);
  let ok=pool.filter(o=>!pr.some(q=>cl(o,q)));if(!ok.length)ok=pool;
  got[s]=wchoose(ok,o=>cdW(o,x))});
 return slots.map(s=>cdFill(got[s].t,x))}
/* ---------- vida baixa: 3 passos coerentes com a lealdade ---------- */
function condLo(c,x){
 const d=derived(c),fis=Math.max(5,d.fis),atu=Math.max(5,d.atu),h=x.h,L=x.loy,B=cdBank().lo;
 let tB=h.f<1?Math.round(fis*h.f):Math.round(fis*.7);tB=Math.max(3,Math.min(fis-2,tB));
 const tA=Math.max(1,Math.min(tB-1,Math.round(tB*.55))),tC=fis-1,at=(n,i)=>{const sN=Math.min(atu-1,Math.round(atu*[.6,.8,.9][i]));return t('cond.caixas',{n,f:fis,s:sN,a:atu})},
  tier=L>=5?'l':L>=3?'m':'d',
  pe=x.fan?.05:L===6?.12:.2,mode=(L>=5&&Math.random()<pe)?pick(['early','late']):null,   // o leal que não é tão leal assim
  T=[mode==='early'?'x':tier,mode==='early'?'x':tier,mode==='late'?'x':mode==='early'?'d':tier];
 let prev=null;const out=[];
 ['s1','s2','s3'].forEach((s,i)=>{
  const pool=B[s].filter(o=>o.lv.includes(T[i])&&cdTokOk(o,x));
  let ok=prev?pool.filter(o=>!o.p.length||o.p.some(t=>prev.includes(t))):pool;
  if(!ok.length)ok=pool.length?pool:B[s].filter(o=>o.lv.includes(tier));
  const o=wchoose(ok,z=>cdW(z,x));prev=o.g;{const f=cdFill(o.t,x),s0=at([tA,tB,tC][i],i),pf=PTOF.get(f);if(pf)PTOF.set(s0+f,s0+pf);out.push(s0+f)}});
 return out}
function condOf(c){
 const o=c.npc;if(!o||c.crit)return null;
 const P=o.pers,h=o.hook||{},sig=JSON.stringify(['v32',(P&&P.sp)||o.sp||'',P?P.s.map(s=>s.k+s.p):0,P?P.t:0,o.loy||0,h.f,!!h.rd,!!h.rf,o.type,o.role||'',(c.gear||[]).length]);
 if(o.cond&&o.cond.sig===sig)return o.cond;
 try{const x=condCtx(c);o.cond={sig,hi:condHi(x),lo:condLo(c,x),loy:x.loy,pf:perfilTxt(x.perfil),dc:doutrinaOf(c)}}catch(e){console.error('condutas',e);return null}
 return o.cond}
/* linhas de texto para o campo Notas do Chummer / JSON */
function condNotas(c){const k=condOf(c);if(!k)return[];
 return[...(k.pf?[t('cond.perfil',{pf:k.pf,n:k.loy,txt:loyTxt(k.loy)})+(k.dc?xl(' · Doutrina da ocupação: ')+k.dc:'')]:[]),xl('Condutas com a vida alta: ')+k.hi.map((t,i)=>(i+1)+') '+t+acSuf(t)).join(' · '),t('cond.baixa',{n:k.loy})+k.lo.map((t,i)=>(i+1)+') '+t+acSuf(t)).join(' · ')]}
ganchoNotas.camada('condutas',g=>function(c){let p=[];try{p=condNotas(c)}catch(e){console.error('condNotas',e)}return[...g(c),...p]});
