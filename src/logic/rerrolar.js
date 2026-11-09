/* ===== Favoritos, travas, rerrolar e importação (v15) ===== */
const lockOf=c=>c.lock||(c.lock={name:1}),LM=new WeakSet(),RM=new WeakSet(),LVO=new WeakSet(),MO=new WeakSet(),LBL={name:xl('nome'),meta:xl('metatipo'),attr:'atributos',skill:xl('habilidades'),qual:xl('qualidades'),gear:xl('equipamento'),imp:'implantes',magic:'magia',ma:'arte marcial',type:xl('tipo'),force:xl('força'),pers:xl('perfil de atuação'),weap:xl('armas'),armor:xl('armadura'),misc:xl('equipamento'),cond:'condutas'};
const isWeapG=x=>(x.cat==='weapon'&&!x.nat)||(x.cat==='gear'&&x.sub==='Ammunition');   // arma de verdade e a munição dela (arma natural vem do metatipo/implante)
const GKEYS=['weap','armor','misc'];   // v45.1: 'gear' = os três juntos; implantes têm trava própria
const onlyL=(c,k)=>{const L={};(c.crit?['name','type','force']:['name','meta','attr','skill','qual','gear','weap','armor','misc','imp','magic','ma','pers']).forEach(x=>L[x]=1);L[k]=0;if(k==='meta')L.attr=0;if(k==='pers')L.skill=L.qual=L.gear=L.weap=L.armor=L.misc=L.imp=0;
 if(k==='gear')L.weap=L.armor=L.misc=0;if(GKEYS.includes(k))L.gear=0;return L};
const LVMAX=100,BASEA=[2,3,3,4,4,5,6,6,7,7,8],SRA=[1,2,3,4,5,6,7,8,9,10,11],BUDA=[500,1500,3000,6000,12000,25000,50000,75000,100000,150000,250000],EXT=(a,p)=>p<a.length?a[p]:a[a.length-1]+(a[a.length-1]-a[a.length-2])*(p-a.length+1),SKNAT=12,skCap=p=>p<=1?6:p<=10?6+Math.round(6*(p-1)/9):SKNAT+Math.round(SKNAT*Math.min(1,(p-10)/80)),srv=p=>p<=10?SRA[Math.max(0,p)]:11+Math.round((SKNAT+1)*Math.min(1,(p-10)/80)),nExtra=p=>p>10?Math.max(1,Math.round(3*(p-10)/90)):0,SXP=l=>shuffle(Object.keys(SKCAT).filter(k=>/Combat|Physical|Social|Technical|Vehicle/.test(SKCAT[k])&&!/Magical|Resonance|Pseudo/.test(SKCAT[k])&&!l.includes(k))).slice(0,3);
const favFirst=l=>[...l.filter(c=>c.fav),...l.filter(c=>!c.fav)];
const capN=l=>{let ex=l.length-200;return favFirst(ex<=0?l:l.filter(c=>{if(ex>0&&!c.fav){ex--;return false}return true}))};
const say=t=>{const m=document.getElementById('msg');if(m){m.textContent=t;return}let e=document.getElementById('toast');if(!e){e=document.createElement('div');e.id='toast';document.body.appendChild(e)}e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),Math.max(6000,t.length*70))};
const IMPC=x=>x.cat==='cyber'||x.cat==='bio';
function rerollChar(c,only,opt){
 const o=c.npc||{},L=only?onlyL(c,only):Object.assign({},lockOf(c),opt&&opt.lock);const PR=opt&&opt.pr!=null?opt.pr:(+o.pr||0);leOpcoesGeracao();let n;
 if(c.crit){const F=L.force?c.crit.force:prFrom(val('npr'));n=genCritter(F,L.type?c.meta:val('ncrit'));if(L.name)n.alias=c.alias}
 else{
  const tie=!!(c.magicLoss||c.resLoss),lm=!!(L.magic||(L.imp&&tie)),li=!!(L.imp||(L.magic&&tie)),la=!!L.attr,lmeta=!!(L.meta||la);
  const type=TYPES[o.type]?o.type:pick(Object.keys(TYPES));
  GEN.persForce=L.pers&&o.pers?o.pers:null;GEN.persLevel=!!(opt&&opt.pr!=null);GEN.attrKeep=(!la&&lmeta&&!(opt&&opt.pr!=null)&&c.at)?{sum:ATTR.reduce((x,k)=>x+(+c.at[k]||0),0),ak:ATTR.reduce((x,k)=>x+(+((c.ak||o.ak||{})[k])||0),0)}:null;try{n=genNPC(PR,type,o.sp||'',lmeta?c.meta:val('meta'))}finally{GEN.persLevel=false;GEN.attrKeep=null}if(o.role)roleFx(n,o.role);
  if(!la&&lmeta&&!(opt&&opt.pr!=null)&&c.at){const T0=ATTR.reduce((x,k)=>x+(+c.at[k]||0),0),fv=(TYPES[type]||{}).a||[];n.ak=n.ak||{};   // v45.2: rerrolar atributos só redistribui: o carma que a geração gastou a mais em atributo é devolvido
   for(let i=0;i<20&&ATTR.reduce((x,k)=>x+n.at[k],0)>T0;i++){const ks=ATTR.filter(k=>n.ak[k]>0&&n.at[k]>lim(n.meta,k)[0]);if(!ks.length)break;const nf=ks.filter(k=>!fv.includes(k)),k=pick(nf.length?nf:ks);n.at[k]--;n.ak[k]--;if(!n.ak[k])delete n.ak[k]}if(n.npc)n.npc.ak=n.ak}
  const mgN=(n.gear||[]).filter(x=>x.mg),cp=(ks,src)=>ks.forEach(k=>{if(src[k]===undefined)delete n[k];else n[k]=src[k]});
  const gW=!!(L.gear||L.weap),gA=!!(L.gear||L.armor),gM=!!(L.gear||L.misc),gAll=gW&&gA&&gM,gAny=gW||gA||gM,nsk=Object.assign({},n.sk);
  if(L.name)cp(['alias','lang'],c);
  if(la){[...ATTR,'EDG'].forEach(a=>{if(c.at[a]!==undefined)n.at[a]=c.at[a]});cp(['ak','kar'],c);['ak','kar','kt'].forEach(k=>{if(o[k]!==undefined)n.npc[k]=o[k]})}
  if(L.skill)cp(['sk','know','kn','specs','specAuto'],c);
  if(L.qual)cp(['q'],c);
  if(gAny){const cls=x=>isWeapG(x)?'W':x.cat==='armor'?'A':'M',lk=x=>{const t=cls(x);return t==='W'?gW:t==='A'?gA:gM},old=(c.gear||[]).filter(x=>!IMPC(x)),neu=(n.gear||[]).filter(x=>!IMPC(x));
   n.gear=(n.gear||[]).filter(IMPC).concat(neu.filter(x=>!lk(x)),old.filter(lk));if(gAll)cp(['nuyen','nuyenLeft'],c)}
  if(L.skill&&!gW)(n.gear||[]).filter(x=>x.cat==='weapon'&&!x.nat).forEach(w=>{const k=(window.__SKW||{})[w.sub];if(k&&!(+n.sk[k]>0)&&+nsk[k]>0)n.sk[k]=nsk[k]});   // arma nova com perícia travada: a ficha precisa ter a perícia da arma
  if(li){n.gear=(n.gear||[]).filter(x=>!IMPC(x)).concat((c.gear||[]).filter(IMPC));cp(['imp','ess','magicLoss','resLoss'],c)}
  if(lm){['MAG','RES'].forEach(a=>{if(c.at[a]===undefined)delete n.at[a];else n.at[a]=c.at[a]});cp(['magic','trad','talent','spells','powers','pp','cf','spirits','sub','echoes','init','mm','arch'],c);if(c.P&&n.P)n.P.magic=c.P.magic;n.npc.sp=o.sp}
  if(lm||gM)n.gear=(n.gear||[]).filter(x=>!x.mg).concat(lm?(c.gear||[]).filter(x=>x.mg):mgN);   // foci e reagentes acompanham a magia travada, não o equipamento
  if(L.ma){cp(['ma','maKarma'],c);if(c.ma&&c.ma.sk&&!L.skill&&!(n.sk[c.ma.sk]>0))n.sk[c.ma.sk]=2}
  /* v29: extras do data/ do Chummer: contatos seguem o nome; drogas, estilo de vida e programas de IA seguem o equipamento; stream com a magia; mentor com a magia ou as qualidades */
  if(L.name){cp(['contacts'],c);if(Array.isArray(n.contacts))n.contacts=n.contacts.map(k=>Object.assign({},k))}   // cópia: o carma do novo NPC pode mexer nos contatos sem alterar o antigo
  if(gM)cp(['drugs','life','aip','sin'],c);if(lm)cp(['stream','rstream'],c);if(L.qual||lm)cp(['mentor'],c);if(typeof xdReconcile==='function')xdReconcile(n);
 }
 Object.keys(o).forEach(k=>{if(!['pr','type','sp','kar','kt','ak','nm','fo','hook','pers'].includes(k)&&o[k]!==undefined&&n.npc)n.npc[k]=o[k]});
 if(opt&&opt.pr!=null&&n.npc)n.npc.pr=PR;if(!c.crit&&n.npc){if(L.name&&o.nm)n.npc.nm=o.nm;if(o.hook&&opt&&opt.pr!=null)n.npc.hook=o.hook;else if(only&&only!=='pers'&&o.hook)n.npc.hook=o.hook;else genGancho(n);if(!(opt&&opt.pr!=null))karmaFinish(n,{noTrim:!!L.attr,noSpec:!!L.skill})}if(n.npc&&n.npc.cond){const fp=g=>(g||[]).map(x=>x.n).sort().join('|');if(fp(n.gear)!==fp(c.gear))delete n.npc.cond}   // conduta cita o equipamento; mudou, refaz
 if(c._id)n._id=c._id;n.fav=c.fav;n.lock=c.lock;if(LM.has(c))LM.add(n);if(RM.has(c))RM.add(n);if(LVO.has(c))LVO.add(n);if(MO.has(c))MO.add(n);return n}
function afterRoll(idx,txt){keepScroll(()=>{saveN();renderNPC(SESSAO.fichas)});flashSheet(SESSAO.fichas[idx]);say(txt)}
/* v45.1: desfazer (até 8 passos por ficha) e rerrolar só a conduta. A pilha acompanha a ficha (WeakMap). */
const UNDO=new WeakMap(),snapChar=c=>typeof structuredClone==='function'?structuredClone(c):JSON.parse(JSON.stringify(c)),
 flagsTo=(a,b)=>[LM,RM,LVO,MO].forEach(S=>{if(S.has(a))S.add(b)});
function undoPush(old,neu){const st=(UNDO.get(old)||[]).slice(-7);st.push(snapChar(old));UNDO.set(neu,st);if(old._id&&!neu._id)neu._id=old._id;undoSave()}
const undoCount=c=>(UNDO.get(c)||[]).length;
function undoAt(idx){const c=SESSAO.fichas[idx],st=c&&UNDO.get(c);if(!st||!st.length){say(xl('Nada para desfazer nesta ficha.'));return false}
 const prev=st.pop();UNDO.set(prev,st);undoSave();flagsTo(c,prev);SESSAO.fichas[idx]=prev;afterRoll(idx,'Desfeito: '+prev.alias+xl(' voltou ao estado anterior.'));return true}
function rerollCond(idx){const c=SESSAO.fichas[idx];if(!c||(!c.npc&&!c.crit))return;
 const n=snapChar(c);if(n.crit){delete n.critCond;critCondOf(n)}else{delete n.npc.cond;condOf(n)}
 undoPush(c,n);flagsTo(c,n);SESSAO.fichas[idx]=n;afterRoll(idx,xl('Condutas de ')+n.alias+xl(' sorteadas de novo (o resto da ficha não mudou).'))}
/* assinatura da parte: igual antes e depois = o sorteio caiu no mesmo conjunto */
function partSig(c,k){const g=c.gear||[],nm=l=>l.map(x=>x.n+(x.qty>1?'×'+x.qty:'')).sort().join('|');
 switch(k){case'weap':return nm(g.filter(isWeapG));case'armor':return nm(g.filter(x=>x.cat==='armor'));case'misc':return nm(g.filter(x=>!isWeapG(x)&&x.cat!=='armor'&&!IMPC(x)&&!x.nat));case'imp':return nm(g.filter(IMPC));
  case'skill':return JSON.stringify([c.sk,c.know]);case'qual':return JSON.stringify(c.q);case'attr':return JSON.stringify(c.at);case'name':return c.alias;case'ma':return JSON.stringify(c.ma);
  case'magic':return JSON.stringify([c.spells,c.powers,c.trad,c.cf]);case'pers':return JSON.stringify((c.npc||{}).pers);case'force':return String((c.crit||{}).force);case'type':return c.meta;default:return null}}
/* v45.3: resumo "antes → depois" da parte rerrolada (só o que mudou; o que ficou igual não aparece) */
function partDiff(a,b,k){
 const nm=x=>x==null?'':typeof x==='object'?(x.n||x.name||''):String(x),
  cnt=l=>{const m=new Map();(Array.isArray(l)?l:[]).forEach(x=>{const key=nm(x);if(!key)return;m.set(key,(m.get(key)||0)+(x&&x.qty>1?+x.qty:1))});return m},
  lab=(key,q)=>q>1?key+' ×'+q:key,
  cut=l=>l.length>4?l.slice(0,4).join(', ')+' +'+(l.length-4):l.join(', '),
  sd=(A,B)=>{const ma=cnt(A),mb=cnt(B),o=[],i=[];ma.forEach((q,key)=>{const d=q-(mb.get(key)||0);if(d>0)o.push(lab(key,d))});mb.forEach((q,key)=>{const d=q-(ma.get(key)||0);if(d>0)i.push(lab(key,d))});return o.length||i.length?(o.length?cut(o):'—')+' → '+(i.length?cut(i):'—'):''},
  W=(c,f)=>(c.gear||[]).filter(f),cap=t=>t.charAt(0).toUpperCase()+t.slice(1),
  one=(t,x,y)=>x!==y?cap(t)+': '+(x||'—')+' → '+(y||'—'):'',
  part=(t,d)=>d?cap(t)+': '+d:'';
 let r=[];
 switch(k){
  case'weap':r=[part(xl('armas'),sd(W(a,isWeapG),W(b,isWeapG)))];break;
  case'armor':r=[part(xl('armadura'),sd(W(a,x=>x.cat==='armor'),W(b,x=>x.cat==='armor')))];break;
  case'misc':{const f=x=>!isWeapG(x)&&x.cat!=='armor'&&!IMPC(x)&&!x.nat;r=[part(xl('equipamento'),sd(W(a,f),W(b,f)))];break}
  case'imp':r=[part('implantes',sd(W(a,IMPC),W(b,IMPC)))];break;
  case'qual':r=[part(xl('qualidades'),sd(a.q,b.q))];break;
  case'magic':r=[part('magias',sd(a.spells,b.spells)),part(xl('poderes'),sd(a.powers,b.powers)),one(xl('tradição'),nm(a.trad),nm(b.trad)),part('formas complexas',sd(a.cf,b.cf))];break;
  case'attr':{const ks=[...ATTR,'EDG'].filter(x=>(a.at||{})[x]!==(b.at||{})[x]).map(x=>x+' '+(((a.at||{})[x])??'—')+'→'+(((b.at||{})[x])??'—'));r=[ks.length?'Atributos: '+cut(ks):''];break}
  case'skill':{const A=a.sk||{},B=b.sk||{},ks=[...new Set([...Object.keys(A),...Object.keys(B)])].filter(x=>(+A[x]||0)!==(+B[x]||0)).map(x=>x+' '+(+A[x]||0)+'→'+(+B[x]||0));r=[ks.length?xl('Habilidades: ')+(ks.length>6?ks.slice(0,6).join(', ')+' +'+(ks.length-6):ks.join(', ')):'',part(xl('conhecimentos'),sd(a.know,b.know))];break}
  case'name':r=[one(xl('nome'),a.alias,b.alias)];break;
  case'ma':r=[one('arte marcial',nm(a.ma),nm(b.ma))];break;
  case'pers':{const L=x=>{const P=(x.npc||{}).pers;return P&&typeof persLabel==='function'?persLabel(P):''};r=[one(xl('perfil de atuação'),L(a),L(b))];break}
  case'force':r=[one(xl('força'),String((a.crit||{}).force??''),String((b.crit||{}).force??''))];break;
  case'type':r=[one(xl('tipo'),a.meta,b.meta)];break;
 }
 return r.filter(Boolean).join(' · ');
}
function rerollAt(idx,only){const c=SESSAO.fichas[idx];if(!c)return;if(only==='cond'){try{rerollCond(idx)}catch(x){say(xl('Não consegui rerrolar as condutas: ')+x.message)}return}
 try{const w=snapChar(c);flagsTo(c,w);   // rerrola sobre cópia: rerollChar reaproveita objetos da ficha antiga e a original não pode mudar (desfazer)
  let n=rerollChar(w,only),igual=false;
  if(only){const s0=partSig(c,only);for(let t=0;t<3&&s0!==null&&partSig(n,only)===s0;t++){const w2=snapChar(c);flagsTo(c,w2);n=rerollChar(w2,only)}igual=s0!==null&&partSig(n,only)===s0}
  if(igual){say(xl('O sorteio de ')+LBL[only]+xl(' caiu no mesmo conjunto (o perfil dele tem poucas opções). Nada mudou.'));return}
  undoPush(c,n);SESSAO.fichas[idx]=n;const k=Object.entries(lockOf(c)).filter(([a,v])=>v).length;afterRoll(idx,only?n.alias+' — '+(partDiff(c,n,only)||xl('Rerrolado só ')+LBL[only])+'.':'Rerrolada: '+n.alias+(k?' ('+tn('rr.travado',k)+')':'')+'.')}catch(x){say(xl('Não consegui rerrolar: ')+x.message)}}
