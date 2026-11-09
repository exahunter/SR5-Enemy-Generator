const modeEl=document.getElementById('mode'),val=i=>document.getElementById(i).value;
{const G={};Object.keys(TYPES).forEach(k=>(G[TYPES[k].g||'Outros']=G[TYPES[k].g||'Outros']||[]).push(k));document.getElementById('ntype').innerHTML='<option value="rand"></option>'+Object.entries(G).map(([g,a])=>`<optgroup label="${esc(xl(g))}">`+a.map(k=>`<option value="${esc(k)}">${esc(xl(k))}</option>`).join('')+'</optgroup>').join('')}
// textos que dependem do modo e do idioma (o resto do template usa data-i18n)
function textosModo(){const m=modeEl.value,g=m==='grp',cr=m==='critter',$=i=>document.getElementById(i);
 $('nprt').textContent=t(cr?'modo.forca':'modo.nivel');$('nszt').textContent=t(g?'modo.pessoas':'modo.qtd');
 {const o=document.querySelector('#ntype option[value="rand"]');if(o)o.textContent=t(g?'modo.auto':'modo.rand')}
 $('gen').textContent=t(g?'modo.gerar.grp':cr?'modo.gerar.crit':'modo.gerar.npc')}
document.addEventListener('idioma',textosModo);textosModo();
modeEl.onchange=()=>{const m=modeEl.value,g=m==='grp',cr=m==='critter',$=i=>document.getElementById(i);
 $('ntl').style.display=$('nil').style.display=cr?'none':'';$('nsl').style.display=m==='npc'?'':'none';
 $('ngl').style.display=g?'':'none';$('ncl').style.display=cr?'':'none';
 $('meta').parentElement.style.display=$('wild').parentElement.style.display=cr?'none':'';
 textosModo();
 document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.m===m)));
 renderNPC(SESSAO.fichas)};
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{modeEl.value=b.dataset.m;modeEl.onchange()});
