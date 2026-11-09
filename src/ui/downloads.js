async function saveF(fn,data){const m=document.getElementById('msg');
 const fb=why=>{m.innerHTML=why+xl(' Copie o texto abaixo e salve como <b>')+esc(fn.replace(/\.txt$/,''))+'</b>.';let t=document.getElementById('fbx');if(!t){t=document.createElement('textarea');t.id='fbx';t.readOnly=true;m.parentElement.after(t)}t.value=data;t.focus();t.select()};
 try{const dl=await claude.use('downloads');if(!dl){fb(xl('Download indisponível neste visualizador.'));return}await dl.save({filename:fn,data});m.textContent=xl('Salvo. Se o nome terminar em .txt, remova essa parte.')}
 catch(e){if(e&&e.code==='declined')m.textContent='Download cancelado.';else fb('O download falhou ('+((e&&e.code)||xl('erro'))+').')}}
const saveN=()=>IDB.tx('readwrite',t=>t.put({name:'__npcs',size:0,data:SESSAO.fichas})).catch(()=>{});
async function zipAll(L){const m=document.getElementById('msg'),l=L;if(!l.length){m.textContent=xl('Nada para exportar.');return}
 try{if(typeof JSZip==='undefined')throw 0;const Z=new JSZip(),used={};
  l.forEach(c=>{const b=c.alias.replace(/[^\w-]+/g,'_')||'npc';let k=b,i=2;while(used[k])k=b+'_'+i++;used[k]=1;Z.file(k+'.chum5','\ufeff'+toXML(c).replace(/\n/g,'\r\n'))});
  const blob=await Z.generateAsync({type:'blob'}),d=await claude.use('downloads');if(!d)throw 0;await d.save({filename:'npcs.zip',data:blob});m.textContent=tn('zip.salvo',l.length)}
 catch(e){m.textContent=e&&e.code==='declined'?'Download cancelado.':xl('Não foi possível gerar o .zip neste visualizador.')}}
