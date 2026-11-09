/* ===== v24: mago completo. Tradição (traditions.xml), magias espalhadas por categoria, espíritos vinculados,
 * foci vinculados e reagentes (gear.xml). Dados em MAGIA (data/magia-dados.json). ===== */
const MG_CATS=['Combat','Detection','Health','Illusion','Manipulation'];
const tradName=c=>c.trad||(/Xam/.test(c.arch||'')?'Shamanic':'Hermetic');
function tradInfo(c){const n=tradName(c),t=MAGIA.TRAD.find(x=>x[0]===n)||MAGIA.TRAD[0];return{n:t[0],id:t[1],dr:t[2],src:t[3],pg:t[4],sp:t[5]}}
const tradDrain=(c,ti)=>(ti.dr.match(/\{(\w+)\}/g)||[]).reduce((s,k)=>s+(+((c.at||{})[k.slice(1,-1)])||0),0);
const magEff=c=>Math.max(1,(c.magic||0)-(c.magicLoss||0));
const wpick=(l,w)=>{let r=Math.random()*l.reduce((s,x)=>s+w(x),0);for(const x of l){r-=w(x);if(r<0)return x}return l[l.length-1]};
function genMageKit(c,pr){
 const eff=magEff(c),at=c.at||{},pool=MAGIA.TRAD.filter(t=>okSrc(t[3])),
  t=wpick(pool.length?pool:MAGIA.TRAD,t=>t[0]==='Hermetic'?30:t[0]==='Shamanic'?25:1.5);   // as duas do SR5 dominam; as demais aparecem de vez em quando
 c.trad=t[0];c.arch=/CHA/.test(t[2])?'Xamã':'Mago hermético';
 const ti=tradInfo(c);
 /* magias: uma de cada categoria antes de repetir categoria; no máximo 2 por ponto de Magia efetiva */
 const okS=SPELLS.filter(o=>okSrc(o[2])),q=persCatOrder(MG_CATS).map(k=>shuffle(okS.filter(o=>o[1]===k))),n=Math.min(2+Math.ceil(pr/2),Math.max(2,2*eff)),sp=[];
 for(let i=0;sp.length<n&&q.some(l=>l.length);i++){const l=q[i%q.length];if(l.length){const s=l.pop();if(!sp.some(z=>z[0]===s[0]))sp.push(s)}}
 c.spells=sp;
 /* espíritos vinculados: tipos da tradição, Força pela perícia Summoning (máx. 2x Magia efetiva), no máx. CHA espíritos */
 const nS=Math.min(pr>=8?3:pr>=5?2:pr>=2?1:0,Math.max(1,+at.CHA||1)),fr=Math.max(1,Math.min((c.sk||{}).Summoning||1,2*eff)),seen=new Set();
 c.spirits=shuffle(MG_CATS).map(k=>ti.sp[k]).filter(nm=>nm&&!seen.has(nm)&&seen.add(nm)).slice(0,nS).map(nm=>({n:nm,force:fr,svc:Math.max(1,Math.ceil(fr/2))}));
 /* foci vinculados: soma das Forças <= Magia efetiva */
 const F=MAGIA.FOCI.filter(f=>okSrc(f[5])),fnd=nm=>F.find(f=>f[0]===nm),cs=[...new Set(c.spells.map(s=>s[1]))].filter(k=>MG_CATS.includes(k)),opts=[];
 if(eff>=2&&fnd('Power Focus'))opts.push(['power',fnd('Power Focus'),3]);
 cs.forEach(k=>{if(fnd('Spellcasting Focus, '+k))opts.push(['spellcasting',fnd('Spellcasting Focus, '+k),4]);if(fnd('Counterspelling Focus, '+k))opts.push(['counterspelling',fnd('Counterspelling Focus, '+k),1.5])});
 const gear=[],have=new Set();let left=eff;
 for(let i=0,nF=pr>=8?3:pr>=5?2:pr>=2?1:0;i<nF&&left>0;i++){
  const av=opts.filter(o=>!have.has(o[1][0]));if(!av.length)break;
  const [fk,f]=wpick(av,o=>o[2]),mxF=pr<7&&f[3]>0?Math.floor((12-f[4])/f[3]):99;   // abaixo do nível 7, disponibilidade máx. 12 (como o resto do equipamento)
  if(mxF<1){have.add(f[0]);continue}
  const force=Math.max(1,Math.min(left,mxF,R(1,Math.max(1,Math.ceil(eff*.7)))));have.add(f[0]);left-=force;
  gear.push({cat:'gear',n:f[0],cost:f[2]*force,src:f[5],ess:0,id:f[1],sub:'Foci',rt:force,qty:1,g:crypto.randomUUID(),fk,mg:1,st:{page:f[6],avail:(f[3]*force)+f[4],bonded:'True'}})}
 /* reagentes */
 const rg=MAGIA.REAG.filter(r=>okSrc(r[4])),r0=rg.find(r=>r[0]==='Reagents, per dram')||rg[0];
 if(r0)gear.push({cat:'gear',n:r0[0],cost:r0[2],src:r0[4],ess:0,id:r0[1],sub:'Magical Supplies',rt:0,qty:2*eff+2*Math.ceil(pr/2)+R(0,4),mg:1,st:{page:r0[5]}});
 c.gear=(c.gear||[]).filter(x=>!x.mg).concat(gear)}
