function mkRng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const hashSeed=t=>{let h=2166136261;for(const ch of String(t)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0};
const saveH=()=>IDB.tx('readwrite',t=>t.put({name:'__pcs',size:0,data:SESSAO.hist})).catch(()=>{});
function doGen(){leOpcoesGeracao();
 try{const m=modeEl.value,cr=m==='critter',z=val('nsize'),[lo,hi]=z==='1'?[1,1]:z.split('-').map(Number),n=R(lo,hi),pv=val('npr'),P=()=>prFrom(pv),pr=P(),sp=val('nspec');let nw;
  if(cr)nw=Array.from({length:n},()=>genCritter(P(),val('ncrit')));
  else if(m==='grp'){GEN.comp=val('ngrp')||'grp';nw=genGroup(Math.max(2,n),pr,val('ntype')==='rand'?'__auto':val('ntype'),val('meta'));
   }
  else nw=Array.from({length:n},()=>{const x=sp==='rand'?pick(['','Lieutenant','Decker','Adept','Mage','Mystic','Technomancer','Rigger']):sp;return genNPC(P(),val('ntype')==='rand'?pick(Object.keys(TYPES)):val('ntype'),x,val('meta'))});
  SESSAO.fichas=capN([...SESSAO.fichas,...nw]);saveN();renderNPC(SESSAO.fichas)}
 catch(x){document.getElementById('out').innerHTML='<p class="neg" style="margin-top:16px">'+esc(x.message)+'</p>'}}
