/* ===== Dinheiro e carma por NÍVEL DE COMPETÊNCIA (npc.pr) =====
   O nível (0–10, e 11–100 extrapolando) escolhe a prioridade de recursos do SR5 por interpolação: 0 = E … 10 = A (nuyen);
   carma total = carma inicial + KARL por nível. 'FORCA' (0 street, 1 padrão, 2 prime) só desloca as tabelas; o padrão é 1 e não há controle na interface. */
const FORCA=1;
const RS_NY=[[6000,15000,25000,50000,75000],       // street
             [6000,50000,140000,275000,450000],    // padrão (livro-base)
             [100000,150000,210000,325000,500000]],// prime
 RS_KG=[13,25,35];
const fMix=(a,f)=>{f=Math.max(0,Math.min(2,Number.isFinite(+f)?+f:1));const i=Math.min(1,Math.floor(f)),t=f-i;return a[i]+(a[i+1]-a[i])*t};
const fOf=f=>f==null?FORCA:f;
const chargenK=f=>Math.round(fMix(RS_KG,fOf(f)));
const karmaTotal=(pr,f)=>chargenK(f)+KARL*(+pr||0);
const qBudget=pr=>{const cg=chargenK();return pr>10?cg+Math.round(10*(pr-10)/90):Math.min(cg,pr*5)};   // teto de qualidades positivas/negativas
function resNuyen(pr,f){f=fOf(f);const col=[0,1,2,3,4].map(p=>fMix(RS_NY.map(r=>r[p]),f)),t=Math.max(0,+pr||0)/2.5;
 const v=t<=4?(i=>col[i]+(col[i+1]-col[i])*(t-i))(Math.min(3,Math.floor(t))):col[4]+(col[4]-col[3])*(t-4);
 return Math.round(v/50)*50}
/* orçamento de equipamento: a tabela antiga (BUDA) ajustada pela raiz da razão entre os recursos atuais e os padrão */
const BUD=pr=>EXT(BUDA,pr)*Math.sqrt(resNuyen(pr)/resNuyen(pr,1));
/* custo total do que o NPC carrega (armas, acessórios, armadura, mods, munição, gear, implantes, veículos…) */
function gearTotal(c){return Math.round((c.gear||[]).reduce((s,x)=>{const u=+x.cost||0,q=x.sub==='Ammunition'?(x.qty||1)/((+((x.st||{}).costfor))||1):(x.qty||1);
 return s+u*q+(x.acc||[]).reduce((t,a)=>t+(+a.cost||0),0)+(x.mods||[]).reduce((t,m)=>t+(+m.cost||0),0)},0))}
const isGen=c=>c&&c.npc&&!c.crit&&c.npc.kt!=null;
function nuyenBook(c){if(!isGen(c))return null;
 const o=c.npc,res=o.nyTot!=null?o.nyTot:resNuyen(o.pr,o.fo??1),gasto=gearTotal(c)+(typeof extrasTotal==='function'?extrasTotal(c):0),exc=gasto>res,tot=exc?Math.round(gasto*1.03):res;
 return{res,gasto,tot,left:tot-gasto,exc,f:o.fo??1}}
const nyStart=c=>{const b=nuyenBook(c);return b?b.tot:(c.nuyen||0)},nyLeft=c=>{const b=nuyenBook(c);return b?b.left:(c.nuyenLeft??c.nuyen??0)};
/* ---- carma ---- */
/* v52: as especializações vêm do perfil (logic/especializacoes.js: specComprar); KM_SPEC saiu */
/* carma gasto em graduações extras de habilidade (2×nova graduação) e conhecimentos extras (1 cada); sempre recalculado do estado atual */
function karmaExtra(c){const sk=c.sk||{};let t=0;Object.entries(c.skX||{}).forEach(([n,x])=>{const r=+sk[n]||0;x=Math.min(+x||0,r);for(let v=r-x+1;v<=r;v++)t+=2*v});
 return t+Math.min(+c.knX||0,(c.know||[]).length)}
function karmaBook(c){if(!isGen(c))return null;
 const o=c.npc,ak=c.ak||o.ak||{},at=c.at||{},cg=chargenK(o.fo??1);
 let atr=0;ATTR.forEach(k=>{if(at[k]===undefined)return;const n=Math.min(ak[k]||0,at[k]);for(let v=at[k]-n+1;v<=at[k];v++)atr+=v*5});
 const q=c.q||[],pos=q.filter(x=>x.t==='Positive').reduce((a,x)=>a+(+x.c||0),0),neg=Math.min(cg,q.filter(x=>x.t!=='Positive').reduce((a,x)=>a+(+x.c||0),0));
 const ma=+c.maKarma||0,ig=(c.mm?c.mm.length:0)+(c.echoes?c.echoes.length:0);let ini=0;for(let g=1;g<=ig;g++)ini+=10+3*g;
 const eff=Math.max(1,(c.magic||0)-(c.magicLoss||0)),spl=c.talent==='Magician'||c.talent==='Mystic Adept'?Math.max(0,(c.spells||[]).length-Math.floor(1.7*eff))*5:0,ppk=c.talent==='Mystic Adept'?(+c.pp||0)*5:0,sp=Object.keys(c.specs||{}).length*(typeof SPEC_K!=='undefined'?SPEC_K:7);
 const ex=karmaExtra(c),ct=typeof ctExtra==='function'?ctExtra(c):0,spent=atr+pos-neg+ma+ini+spl+sp+ppk+ex+ct;
 return{tot:o.kt,cg,earn:o.kt-cg,atr,pos,neg,ma,ini,spl,ppk,sp,ex,ct,spent,left:o.kt-spent}}
/* v45.2: do nível 6 ao 10 a sobra de carma não pode encher todos os atributos até o teto (tiraria o que o orçamento deixou para redistribuir) */
const attrTotOk=(c,pr)=>{pr=+pr||0;if(pr<6||pr>10)return true;return ATTR.reduce((x,k)=>x+(+c.at[k]||0),0)<ATTR.reduce((x,k)=>x+capNat(c.meta,k,pr),0)-(11-pr)};
const kmLeft=c=>{const b=karmaBook(c);return b?Math.max(0,b.left):(c.kar!=null?c.kar:25)};
/* Fecha a conta do carma: se algo (qualidades, arte marcial, iniciação, magias) estourou o total, desfaz aumentos de atributo
   (os menos importantes para o papel primeiro); o que sobra compra especializações (7 cada, escolhidas pelo perfil) e depois graduações. */
function karmaFinish(c,opt){if(!isGen(c))return;const o=c.npc,fav=(TYPES[o.type]||{}).a||[];let b=karmaBook(c);c.ak=c.ak||o.ak||{};o.ak=c.ak;
 if(c.skX){Object.keys(c.skX).forEach(k=>{if(c.sk[k]===undefined)delete c.skX[k]})}
 if(!(opt&&opt.noTrim))for(let n=0;n<60&&b.left<0&&typeof ctExtra==='function'&&ctExtra(c)>0;n++){ctTrim(c);b=karmaBook(c)}
 if(!(opt&&opt.noTrim))for(let n=0;n<40&&b.left<0&&(Object.keys(c.skX||{}).length||(c.knX>0));n++){   // extras saem antes dos atributos
  const ks=Object.keys(c.skX||{}).filter(k=>c.skX[k]>0);
  if(ks.length){const k=pick(ks);c.sk[k]--;c.skX[k]--;if(!c.skX[k])delete c.skX[k];if(!c.sk[k]){delete c.sk[k];delete c.skX[k]}}
  else if(c.knX>0){c.know.pop();c.knX--}
  b=karmaBook(c)}
 if(!(opt&&opt.noTrim))for(let n=0;n<80&&b.left<0;n++){
  const ks=ATTR.filter(k=>c.ak[k]>0&&c.at[k]>lim(c.meta,k)[0]);if(!ks.length)break;
  const nf=ks.filter(k=>!fav.includes(k)),k=pick(nf.length?nf:ks);c.at[k]--;c.ak[k]--;if(!c.ak[k])delete c.ak[k];b=karmaBook(c)}
 if(!(opt&&opt.noSpec)){specLimpa(c);specComprar(c);b=karmaBook(c)}   // v52: especialização por perfil (logic/especializacoes.js); refeita no fim da geração (specRefaz)
 if(!(opt&&opt.noSpec))karmaGastaSobra(c);
 b=karmaBook(c);c.kar=o.kar=Math.max(0,b.left)}
/* a sobra de carma vira graduações de habilidade (do papel primeiro), habilidades novas do papel, conhecimentos e qualidades positivas */
function karmaGastaSobra(c){const o=c.npc,T=TYPES[o.type]||{},pr=+o.pr||0,cap=skCap(pr);c.skX=c.skX||{};c.knX=c.knX||0;let b=karmaBook(c);
 const role=[...(T.s||[])],POSQ=(typeof POS!=='undefined'?POS:[]);
  let noCt=!(typeof ctBuy==='function'&&c.contacts&&!c.crit);const CORE=['BOD','AGI','REA','STR','CHA','INT','LOG','WIL'];c.ak=Object.assign({},c.ak||o.ak||{});o.ak=c.ak;
 for(let n=0;n<120&&b.left>=1;n++){
  const L=b.left,opts=[];
  const up=Object.keys(c.sk).filter(s=>c.sk[s]<cap&&2*(c.sk[s]+1)<=L&&!/^Exotic/.test(s));
  if(up.length)opts.push(['up',6,up]);
  const nw=role.filter(s=>c.sk[s]===undefined&&SKA[s]&&L>=2);
  if(nw.length)opts.push(['nw',2,nw]);
  const kp=Object.keys(KTX).filter(k=>!(c.know||[]).includes(k));
  if(kp.length&&c.knX<4)opts.push(['kn',2,kp]);
  const qb=typeof qBudget==='function'?qBudget(pr):25,qs=(c.q||[]),pos=qs.filter(x=>x.t==='Positive').reduce((a,x)=>a+(+x.c||0),0);
  const qp=POSQ.filter(x=>okSrc(x[2])&&x[1]<=L&&pos+x[1]<=qb&&!qs.some(g=>g.n===x[0])&&!qs.some(g=>typeof QFB==='function'&&QFB(g.n,x[0]))&&!x[6]);
  if(qp.length&&qs.filter(x=>x.t==='Positive').length<8)opts.push(['q',2,qp]);
  /* ralos extras para a sobra grande: contatos (1 de carma por ponto acima da cota grátis) e atributo (novo valor × 5) */
  if(!noCt&&L>=2&&(c.contacts||[]).length<=9)opts.push(['ct',3,[1]]);
  const at1=attrTotOk(c,pr)?CORE.filter(a=>c.at[a]!==undefined&&c.at[a]<capNat(c.meta,a,pr)&&(c.at[a]+1)*5<=L):[];
  if(at1.length)opts.push(['at',2,at1]);
  if(!opts.length)break;
  const [k,,pl]=wchoose(opts,x=>x[1]),it=pick(pl);
  if(k==='ct'){if(!ctBuy(c,L))noCt=true}
  else if(k==='at'){c.at[it]++;c.ak[it]=(c.ak[it]||0)+1}
  else if(k==='up'){c.sk[it]++;c.skX[it]=(c.skX[it]||0)+1}
  else if(k==='nw'){c.sk[it]=1;c.skX[it]=1}
  else if(k==='kn'){c.know=c.know||[];c.know.push(it);c.knX++}
  else{c.q=c.q||[];c.q.push({n:it[0],c:it[1],id:it[3],s:it[2],t:'Positive',bn:it[4]||[],pg:it[5]||(typeof QPG!=='undefined'&&QPG[it[3]])||''})}
  b=karmaBook(c)}}
/* ---- linhas da ficha ---- */
function karmaRowHTML(c){const b=karmaBook(c);if(!b)return'';
 const L=[[xl('atributos'),b.atr],[xl('qualidades'),b.pos-b.neg],[xl('arte marcial'),b.ma],[xl('iniciação/submersão'),b.ini],[xl('magias extras'),b.spl],[xl('pontos de poder (místico)'),b.ppk],[xl('especializações'),b.sp],[xl('habilidades/conhecimentos extras'),b.ex],[xl('contatos acima da cota grátis'),b.ct]].filter(x=>x[1]).map(([n,v])=>n+' '+(v>0?'−':'+')+Math.abs(v));
 return xlf('<div class="row"><span>Carma</span><span>{0} de {1} <span class="note">(inicial {2} + carreira {3})</span>{4}</span></div>',b.left<0?'<b class="neg">'+xl('faltam ')+(-b.left)+'</b>':b.left+' restantes',b.tot,b.cg,b.earn,L.length?xl(' · gastos: ')+L.join(', '):'')}
function nuyenRowHTML(c){const b=nuyenBook(c);if(!b)return'';
 return xlf('<div class="row"><span>Dinheiro</span><span><b>{0}</b> em conta · {1} em equipamento · recursos {2} <span class="note">(nível {3}{4})</span></span></div>',fmtNy(b.left),fmtNy(b.gasto),fmtNy(b.tot),c.npc.pr,b.exc?xl('; equipamento acima da tabela'):'')}
/* ---- fecho de cada NPC gerado: nome/idioma por cultura, ganchos e conta do carma ---- */
function npcFinish(c,type){const o=c.npc;if(!o||c.crit)return;o.fo=FORCA;
 const nm=genNome(c.meta,type);c.alias=nm.alias;c.lang=nm.l;o.nm=nm;genGancho(c);karmaFinish(c)}
