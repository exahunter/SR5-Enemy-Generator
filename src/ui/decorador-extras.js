/* v29: linhas da ficha para stream, mentor/paragon, programas de IA, drogas, contatos, estilo de vida e vessel.
   Os sprites do technomante ganham poderes e perícias (streams.xml). */
decorateSheet((sh,c)=>{const sec=sh.querySelector('.sec');if(!sec)return;
 if(c.talent==='Technomancer'&&(c.spirits||[]).some(s=>s.pw)){
  const r=[...sec.querySelectorAll('.row')].find(x=>x.firstElementChild.textContent.trim().startsWith(xl('Sprites registrados')));
  if(r)r.lastElementChild.innerHTML=c.spirits.filter(s=>s.sprite).map(s=>t('esp.forca',{nome:esc(s.n),f:s.force,s:tn('n.tarefa',s.svc??s.force)+(s.pw&&s.pw.length?xl('; poderes: ')+s.pw.map(esc).join(', '):'')})).join('; ')}
 xdRows(c).forEach(([k,v])=>sec.insertAdjacentHTML('beforeend','<div class="row"><span>'+k+'</span><span>'+v+'</span></div>'))});
