importFiles.camada(xl('contatos, formas complexas, estilos de vida, mentores'),_imp0=>async function(files){const rest=[];let n=0,flag=0;
 for(const f of files){const nm=f.name.toLowerCase();
  if(/^(contacts|complexforms|lifestyles|mentors)/.test(nm)){const d=new DOMParser().parseFromString(await f.text(),'text/xml');
   if(nm.startsWith('contacts')){const l=[...d.querySelectorAll('chummer > contacts > contact')].map(e=>e.textContent.trim()).filter(Boolean);if(l.length){CONTACTS=l;n++;flag=1}}
   else if(nm.startsWith('complexforms')){const l=[...d.querySelectorAll('chummer > complexforms > complexform')].filter(e=>!/\[/.test(g(e,'name'))).map(e=>[g(e,'name'),g(e,'target'),g(e,'id'),g(e,'source')]);if(l.length){CFORMS=l;n++;flag=1}}
   else if(nm.startsWith('lifestyles')){const l=[...d.querySelectorAll('chummer > lifestyles > lifestyle')].filter(e=>['Street','Squatter','Low','Medium','High','Luxury'].includes(g(e,'name'))&&g(e,'id')).map(e=>[g(e,'name'),+g(e,'cost')||0,g(e,'id'),g(e,'source')]).sort((x,y)=>x[1]-y[1]);if(l.length){LIFE=l;n++;flag=1}}
   else{const l=[...d.querySelectorAll('chummer > mentors > mentor')].map(e=>[g(e,'name'),g(e,'id'),g(e,'advantage'),g(e,'source'),[...e.querySelectorAll(':scope > choices > choice')].map(x=>g(x,'name'))]);if(l.length){MENT=l;n++;flag=1}}}
  else rest.push(f)}
 if(flag)IDB.tx('readwrite',t=>t.put({name:'__extra',size:0,data:{CF:CFORMS,CT:CONTACTS,LF:LIFE,MT:MENT}})).catch(()=>{});
 return n+(rest.length?await _imp0(rest):0)});
(async()=>{try{const r=await IDB.tx('readonly',t=>t.get('__extra'));if(r&&r.data){CFORMS=r.data.CF;CONTACTS=r.data.CT;if(r.data.LF)LIFE=r.data.LF;if(r.data.MT)MENT=r.data.MT}}catch(x){avisa('importar-extras',x)}})();
