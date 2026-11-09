/* ===== v48: achar fichas em sessões grandes — busca, filtro por ocupação e nível, ordenação, recolher/expandir =====
   Só mexe na tela: o filtro esconde fichas (também na impressão), a ordenação usa CSS `order` e nada disso altera a lista guardada
   (SESSAO.fichas). O estado vale enquanto a página estiver aberta e sobrevive aos redesenhos (rerrolar, subir nível…). */
(()=>{
 const DEF={q:'',t:'',min:'',max:'',fav:false,o:'ord'},F=Object.assign({},DEF),COL=new Set(),TXT=new WeakMap();
 const nz=s=>String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),
  lvl=c=>(c.crit?+c.crit.force:+(c.npc||{}).pr)||0,occ=c=>c.crit?'Critter':((c.npc||{}).type||'—'),
  SORTS=[['ord',xl('Ordem de criação')],[xl('nome'),xl('Nome (A–Z)')],['niv-',xl('Nível: maior primeiro')],['niv+',xl('Nível: menor primeiro')],['ocup',xl('Ocupação (A–Z)')],['fav',xl('Favoritas primeiro')]],
  CMP={nome:(a,b)=>String(a.c.alias).localeCompare(String(b.c.alias),'pt'),'niv-':(a,b)=>lvl(b.c)-lvl(a.c),'niv+':(a,b)=>lvl(a.c)-lvl(b.c),
   ocup:(a,b)=>occ(a.c).localeCompare(occ(b.c),'pt')||lvl(b.c)-lvl(a.c),fav:(a,b)=>(b.c.fav?1:0)-(a.c.fav?1:0)};
 const visiveis=out=>[...out.querySelectorAll('.sheet[data-id]')].filter(s=>!s.classList.contains('f-off'));
 function rotulo(out){const b=document.getElementById('ach-col');if(!b)return;const v=visiveis(out);b.textContent=v.length&&v.every(s=>COL.has(s.dataset.id))?xl('Expandir todas'):xl('Recolher todas')}
 function aplicar(L,out){
  const by=new Map(L.map(c=>[c._id,c])),sh=[...out.querySelectorAll('.sheet[data-id]')],q=nz(F.q).split(/\s+/).filter(Boolean),
   min=F.min===''?null:+F.min,max=F.max===''?null:+F.max,rows=[];let n=0;
  sh.forEach((s,i)=>{const c=by.get(s.dataset.id);if(!c)return;let ok=true;
   if(q.length){let t=TXT.get(s);if(t===undefined){t=nz(s.textContent);TXT.set(s,t)}ok=q.every(w=>t.includes(w))}
   if(ok&&F.t&&occ(c)!==F.t)ok=false;
   if(ok&&min!==null&&lvl(c)<min)ok=false;
   if(ok&&max!==null&&lvl(c)>max)ok=false;
   if(ok&&F.fav&&!c.fav)ok=false;
   s.classList.toggle('f-off',!ok);s.classList.toggle('colapsada',COL.has(c._id));if(ok)n++;rows.push({s,c,i})});
  const cmp=CMP[F.o],sorted=!!cmp,filt=!!(q.length||F.t||min!==null||max!==null||F.fav);
  if(sorted)[...rows].sort((a,b)=>cmp(a,b)||a.i-b.i).forEach((r,k)=>{r.s.style.order=k+1});else rows.forEach(r=>{r.s.style.order=''});
  out.classList.toggle('ord',sorted);out.classList.toggle('filtrando',filt||sorted);
  const cn=document.getElementById('ach-n'),cl=document.getElementById('ach-clr');
  if(cn)cn.textContent=filt?n+' de '+rows.length+xl(' fichas'):rows.length+xl(' fichas');if(cl)cl.hidden=!(filt||sorted);const at=document.getElementById('ach-ativo');if(at)at.hidden=!(filt||sorted);rotulo(out)}
 const OPEN='sr5_achopen',aberto=()=>{try{return localStorage.getItem(OPEN)!=='0'}catch(e){return true}},
  IC={chev:'<svg viewBox="0 0 16 16" width="14" height="14" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>',
   lupa:'<svg viewBox="0 0 16 16" width="15" height="15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.3"/><path d="M10.3 10.3 14 14"/></svg>'};
 decoratePage((L,out)=>{
  out.classList.remove('ord','filtrando');
  if(L.length<3){Object.assign(F,DEF);return}
  const tb=out.querySelector(':scope > .toolbar, :scope > .actions');if(!tb)return;
  const tipos={};L.forEach(c=>{tipos[occ(c)]=(tipos[occ(c)]||0)+1});if(F.t&&!tipos[F.t])F.t='';
  tb.insertAdjacentHTML('afterend','<div class="achar'+(aberto()?'':' fechado')+'" role="search">'+
   '<div class="ach-h"><button type="button" class="ach-tg" id="ach-tg" aria-expanded="'+(aberto()?'true':'false')+'">'+IC.chev+' '+xl('Buscar e filtrar')+'</button><span class="ach-ativo" id="ach-ativo" hidden>'+xl('filtro ativo')+'</span><span class="fn" id="ach-n"></span><span class="ach-sp"></span>'+
   xl('<button type="button" id="ach-col">Recolher todas</button><button type="button" id="ach-clr" hidden>Limpar</button></div>')+
   '<div class="ach-body"><label class="ach-s">'+IC.lupa+xl('<input type="search" id="ach-q" placeholder="Nome, ocupação, arma, equipamento…" aria-label="Buscar fichas"></label>')+
   xl('<div class="ach-r"><label class="ach-f"><span>Ocupação</span><select id="ach-t"><option value="">Todas</option>')+Object.keys(tipos).sort((a,b)=>xl(a).localeCompare(xl(b),IDIOMA_ATUAL==='en'?'en':'pt')).map(k=>'<option value="'+esc(k)+'">'+esc(xl(k))+' ('+tipos[k]+')</option>').join('')+'</select></label>'+
   xl('<div class="ach-f"><span>Nível</span><span class="ach-lv"><input type="number" id="ach-min" min="0" placeholder="de" aria-label="Nível mínimo"> – <input type="number" id="ach-max" min="0" placeholder="a" aria-label="Nível máximo"></span></div>')+
   '<label class="ach-f"><span>Ordenar</span><select id="ach-o">'+SORTS.map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join('')+'</select></label>'+
   xl('<button type="button" id="ach-fav" class="ach-chip" aria-pressed="false">★ Só favoritas</button></div></div></div>'));
  const g=id=>document.getElementById(id),go=()=>aplicar(L,out),box=g('ach-tg').closest('.achar'),pf=()=>{g('ach-fav').classList.toggle('on',F.fav);g('ach-fav').setAttribute('aria-pressed',F.fav?'true':'false')};let tm=0;
  g('ach-q').value=F.q;g('ach-t').value=F.t;g('ach-min').value=F.min;g('ach-max').value=F.max;g('ach-o').value=F.o;pf();
  g('ach-tg').onclick=()=>{const f=box.classList.toggle('fechado');g('ach-tg').setAttribute('aria-expanded',f?'false':'true');try{localStorage.setItem(OPEN,f?'0':'1')}catch(e){}};
  g('ach-q').oninput=e=>{F.q=e.target.value;clearTimeout(tm);tm=setTimeout(go,120)};
  g('ach-t').onchange=e=>{F.t=e.target.value;go()};g('ach-min').oninput=e=>{F.min=e.target.value;go()};g('ach-max').oninput=e=>{F.max=e.target.value;go()};
  g('ach-fav').onclick=()=>{F.fav=!F.fav;pf();go()};g('ach-o').onchange=e=>{F.o=e.target.value;go()};
  g('ach-col').onclick=()=>{const v=visiveis(out),todas=v.length&&v.every(s=>COL.has(s.dataset.id));v.forEach(s=>{todas?COL.delete(s.dataset.id):COL.add(s.dataset.id);s.classList.toggle('colapsada',!todas)});rotulo(out)};
  g('ach-clr').onclick=()=>{Object.assign(F,DEF);g('ach-q').value='';g('ach-t').value='';g('ach-min').value='';g('ach-max').value='';g('ach-o').value='ord';pf();go()};
  Promise.resolve().then(()=>{try{go()}catch(e){console.error('achar fichas',e)}})});
 /* botão de recolher/expandir em cada ficha */
 decorateSheet((sh,c)=>{if(sh.querySelector('.colb'))return;const box=sh.querySelector('.levers')||sh.querySelector('.top');if(!box)return;
  const b=document.createElement('button');b.type='button';b.className='lever colb';b.title=xl('Recolher / expandir a ficha');b.setAttribute('aria-label',xl('Recolher ou expandir a ficha'));
  b.innerHTML='<svg viewBox="0 0 16 16" width="15" height="15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>';
  b.onclick=()=>{const on=!sh.classList.contains('colapsada');sh.classList.toggle('colapsada',on);on?COL.add(c._id):COL.delete(c._id);const o=document.getElementById('out');if(o)rotulo(o)};
  box.prepend(b);if(COL.has(c._id))sh.classList.add('colapsada')});
})();
