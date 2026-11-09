const MAKEY='__ma';
const saveMA=()=>IDB.tx('readwrite',t=>t.put({name:MAKEY,size:0,data:{MA:MART,TECH:MTECH,PW:PWD,SPX,BK:EMB.BOOKS}})).catch(()=>{});
importFiles.camada('artes marciais',_imp2=>async function(files){const rest=[];let n=0,flag=0;
 for(const f of files){const nm=f.name.toLowerCase();
  if(/^(martialarts|powers|books|spells)/.test(nm)){const d=new DOMParser().parseFromString(await f.text(),'text/xml'),all=s=>[...d.querySelectorAll(s)];
   if(nm.startsWith('martialarts')){const T={};all('chummer > techniques > technique').forEach(e=>{if(g(e,'name'))T[g(e,'name')]={id:g(e,'id'),s:g(e,'source'),p:g(e,'page'),m:e.querySelector(':scope > required magenabled')?1:0}});
    const M=all('chummer > martialarts > martialart').map(e=>{const sp=e.querySelector('addskillspecializationoption'),rq=e.querySelector(':scope > required');return{id:g(e,'id'),n:g(e,'name'),s:g(e,'source'),p:g(e,'page'),c:parseInt(g(e,'cost'))||7,q:g(e,'isquality')==='True'?1:0,sk:sp?g(sp,'skill'):'',sp:sp?g(sp,'spec'):'',t:[...e.querySelectorAll(':scope > techniques > technique')].map(x=>g(x,'name')),a:rq&&[...rq.querySelectorAll('quality')].some(q=>q.textContent==='Adept')?1:0,g:rq&&rq.querySelector('magenabled')?1:0}}).filter(m=>m.id&&m.n);
    if(M.length){MART=M;MTECH=T;flag=1;n++;M.forEach(m=>{if(m.s&&!BOOKS.some(b=>b[0]===m.s))BOOKS.push([m.s,m.s])});drawBooks()}}
   else if(nm.startsWith('powers')){all('chummer > powers > power').forEach(e=>{const s=g(e,'source')||'SR5';if(!PW_OK.includes(g(e,'name')))return;PWD[g(e,'name')]={id:g(e,'id'),pts:parseFloat(g(e,'points'))||0,lv:g(e,'levels')==='True',mx:g(e,'maxlevels')||null,lim:g(e,'limit'),x:parseFloat(g(e,'extrapointcost'))||0,act:g(e,'action'),pg:g(e,'page'),aw:g(e,'adeptway'),src:s}});flag=1;n++}
   else if(nm.startsWith('books')){const B=all('chummer > books > book').map(e=>[g(e,'code'),g(e,'name')]).filter(b=>b[0]&&b[1]);if(B.length){EMB.BOOKS=B;flag=1;n++;fixBooks()}}
   else{all('chummer > spells > spell').forEach(e=>{if(g(e,'id'))SPX[g(e,'id')]={id:g(e,'id'),c:g(e,'category'),src:g(e,'source'),pg:g(e,'page'),d:g(e,'descriptors'),t:g(e,'type'),r:g(e,'range'),dm:g(e,'damage'),du:g(e,'duration'),dv:g(e,'dv')}});flag=1;rest.push(f)}
  }else rest.push(f)}
 if(flag)saveMA();
 const r=n+(rest.length?await _imp2(rest):0);applyHeritage();fixBooks();return r});
(async()=>{try{const r=await IDB.tx('readonly',t=>t.get(MAKEY));if(r&&r.data){const D=r.data;if(D.MA&&D.MA.length){MART=D.MA;MTECH=D.TECH}if(D.PW)PWD=Object.assign(PWD,D.PW);if(D.SPX)Object.assign(SPX,D.SPX);if(D.BK&&D.BK.length)EMB.BOOKS=D.BK;fixBooks()}}catch(x){avisa('importar-arte-marcial',x)}})();
