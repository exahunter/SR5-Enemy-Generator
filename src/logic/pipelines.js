/* ===== Pipelines de exportação =====
 * Cada etapa é (c, doc) => doc; a ordem de execução é a ordem escrita em XML_PIPE / JSON_PIPE
 * (montados no fim do último <script>). XML: doc é string; JSON: doc é objeto (a cada etapa passa por
 * JSON.parse(JSON.stringify()), como antes). 'plain' pula a etapa para critters, que têm etapa própria. */
let XML_PIPE=[],JSON_PIPE=[];
const plain=f=>(c,d)=>c.crit?d:f(c,d),upTo=(P,f)=>P.slice(0,P.indexOf(f)),
 runXML=(P,c)=>P.reduce((s,f)=>f(c,s),''),
 runJSON=(P,c)=>P.reduce((o,f)=>JSON.parse(JSON.stringify(f(c,o))),null);
function toXML(c){return runXML(XML_PIPE,c)}
function chumJSON(c){return JSON.stringify(runJSON(JSON_PIPE,c),null,2)}
async function copyTo(t,id,ok){const m=document.getElementById('msg'),ta=document.getElementById(id);try{await navigator.clipboard.writeText(t);m.textContent=ok}catch(e){if(ta.parentElement.open!==undefined)ta.parentElement.open=true;ta.focus();ta.select();m.textContent=xl('Selecione o texto do campo e copie (Ctrl+C).')}}
async function dlChum(c,zip){const fn=c.alias.replace(/[^\w-]+/g,'_')||'npc',data='\ufeff'+toXML(c).replace(/\n/g,'\r\n'),m=document.getElementById('msg');
 try{const d=await claude.use('downloads');if(!d)throw new Error(xl('sem suporte a download'));
  if(zip){if(typeof JSZip==='undefined')throw new Error(xl('JSZip indisponível'));const Z=new JSZip();Z.file(fn+'.chum5',data);await d.save({filename:fn+'.zip',data:await Z.generateAsync({type:'blob'})});m.textContent='Salvo: '+fn+xl('.zip (extraia para obter o .chum5).')}
  else{await d.save({filename:fn+'.chum5',data});m.textContent='Baixado: '+fn+xl('.chum5 (veja a pasta de downloads do navegador). No Chummer: Arquivo > Abrir.')}}
 catch(e){if(e&&e.code==='declined'){m.textContent='Download cancelado.';return}saveF(fn+'.chum5.txt',data)}}
