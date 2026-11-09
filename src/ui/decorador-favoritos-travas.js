decoratePage((L,out)=>{
 const tb=out.querySelector(':scope > .toolbar,:scope > .actions');
 if(tb){const mk=(id,t,f,tt)=>{const b=document.createElement('button');b.id=id;b.textContent=t;if(tt)b.title=tt;b.onclick=f;tb.appendChild(b);return b};
  mk('bkp','Backup (.json)',saveBackup,xl('Salva todas as fichas, favoritos e travas; reimporte com “Importar fichas”'));
  mk('imb',xl('Importar'),()=>document.getElementById('impcf').click(),xl('.chum5, .xml, .zip ou backup .json'));
  const r=mk('rrall',xl('Rerrolar todos (não favoritos)'),null,xl('Rerrola cada ficha respeitando as travas dela'));let w=0;
  r.onclick=()=>{if(!w){w=1;r.textContent=xl('Confirmar rerrolar todos?');setTimeout(()=>{w=0;r.textContent=xl('Rerrolar todos (não favoritos)')},4000);return}
   let k=0,e=0;const its=[];SESSAO.fichas=SESSAO.fichas.map(c=>{if(c.fav)return c;try{const sn=ugItem(c,0,1),x=rerollChar(c);its.push(sn);k++;return x}catch(z){e++;return c}});ugPush(xl('rerrolar todos (')+k+')',its);saveN();renderNPC(SESSAO.fichas);say(tn('rr.todas',k,{fal:e?t('rr.fal',{n:e}):''}))};
  if(UG.length){const u=mk('ugb',xl('Desfazer: ')+UG[UG.length-1].label+(UG.length>1?' (+'+(UG.length-1)+')':''),ugUndo,xl('Volta ao estado anterior à última ação em várias fichas (apagar, rerrolar todos). Fica guardado mesmo se você recarregar a página'));u.className='go'}
  const d=document.getElementById('dall');if(d){const nf=L.filter(c=>c.fav).length;if(nf)d.textContent=xl('Apagar não favoritos');let w2=0,lab=d.textContent;
   d.onclick=()=>{if(!w2){w2=1;d.textContent=xl('Confirmar: apagar')+(nf?xl(' não favoritos'):xl(' todos'))+'?';setTimeout(()=>{w2=0;d.textContent=lab},4000);return}ugPush(tn('ug.apagar',SESSAO.fichas.length-nf),SESSAO.fichas.map((c,i)=>c.fav?null:ugItem(c,i)).filter(Boolean));SESSAO.fichas=SESSAO.fichas.filter(c=>c.fav);saveN();renderNPC(SESSAO.fichas);say(nf?tn('fav.mantida',nf):'')}}}
 });
decorateSheet((sh,c)=>{const a=sh.querySelector('.actions');if(!a)return;const idx=()=>SESSAO.fichas.indexOf(c);
  
  const fv=document.createElement('button');fv.type='button';fv.className='lever fv'+(c.fav?' on':'');fv.innerHTML=((on)=>`<svg viewBox="0 0 16 16" width="15" height="15" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="${on?'currentColor':'none'}"><path d="M8 1.8l1.9 4 4.3.5-3.2 3 .9 4.3L8 11.4 4.1 13.6 5 9.3 1.8 6.3l4.3-.5z"/></svg>`)(!!c.fav);fv.setAttribute('aria-label',xl('Favorita'));fv.title=c.fav?xl('Favorita: protegida contra apagar e contra “Rerrolar todos”. Clique para desmarcar'):xl('Favoritar: protege esta ficha contra apagar');fv.onclick=()=>{c.fav=!c.fav;SESSAO.fichas=favFirst(SESSAO.fichas);saveN();keepScroll(()=>renderNPC(SESSAO.fichas));flashSheet(c,1)};
  const db=a.querySelector('.db');if(db){if(c.fav){db.disabled=true;db.title=xl('Favorita: tire a estrela para apagar')}else db.onclick=()=>{ugPush(xl('ficha apagada: ')+c.alias,[ugItem(c,idx())]);SESSAO.fichas.splice(idx(),1);saveN();keepScroll(()=>renderNPC(SESSAO.fichas))}}
  if(!c.npc&&!c.crit)return;
  {const mo=sh.querySelector('details.more');if(mo){if(MO.has(c))mo.open=true;mo.addEventListener('toggle',()=>{mo.open?MO.add(c):MO.delete(c)})}}
  const top=sh.querySelector('.top');if(!top)return;
  const LK=lockOf(c),tie=()=>!!(c.magicLoss||c.resLoss),eff=k=>!!(LK[k]||(k==='meta'&&LK.attr)||(GKEYS.includes(k)&&LK.gear)||(k==='gear'&&LK.weap&&LK.armor&&LK.misc));
  const tag=(el,k)=>{if(el)el.dataset.lk=k};
  tag(top.querySelector('h2'),'name');tag(top.querySelector('.chip'),c.crit?'type':'meta');tag(sh.querySelector('.sec > div'),c.crit?'force':'attr');
  const RXE=(...w)=>new RegExp('^('+w.map(x=>rxEsc(xl(x))).join('|')+')');   // o rótulo da linha está no idioma da tela
  const RK=[[RXE('Habilidades','Conhecimentos','Idiomas'),'skill'],[RXE('Feitiços','Poderes','Formas complexas','Sprites','Submersão','Iniciação','Magia efetiva','Tradição','Ecos','Stream','Mentor spirit','Paragon'),'magic'],[RXE('Equipamento','Veículos','Matrix','Drogas','Estilo de vida','Programas de IA'),'gear'],[RXE('Contatos'),'name'],[RXE('Qualidades'),'qual'],[new RegExp('^('+rxEsc(xl('Implantes'))+'|'+rxEsc(xl('Implantes ativos'))+'|'+rxEsc(termo('essence'))+')'),'imp'],[RXE('Arte marcial'),'ma']];
  if(!c.crit)sh.querySelectorAll('.sec .row').forEach(r=>{const m=RK.find(x=>x[0].test(r.firstElementChild.textContent.trim()));if(m)r.dataset.lk=m[1]});
  const ICO={lock:'<svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="7.2" width="9" height="6.3" rx="1.4"/><path d="M5.6 7.2V5.4a2.4 2.4 0 0 1 4.8 0v1.8"/></svg>',dice:'<svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M13.2 8a5.2 5.2 0 0 1-9 3.5"/><path d="M2.8 8a5.2 5.2 0 0 1 9-3.5"/><path d="M12.4 1.9v2.9H9.5"/><path d="M3.6 14.1v-2.9h2.9"/></svg>'},mkLv=(cls,ic,hint)=>{const b=document.createElement('button');b.type='button';b.className='lever '+cls;b.innerHTML=ic;b.dataset.hint=hint;return b};
  {const kc=top.querySelector('.chip.k'),L0=c.crit?c.crit.force:c.npc&&c.npc.pr;
   if(kc&&L0!=null&&RXE('Nível de competência','Força').test(kc.textContent.trim())){const lab=c.crit?xl('Força'):xl('Nível de competência'),v=+L0;kc.classList.add('lvl');
    kc.innerHTML=lab+'<button type="button" class="lvb" aria-label="'+xl('Diminuir')+'" '+(v<=(c.crit?1:0)?'disabled':'')+'>−</button><b>'+v+'</b>'+(c.crit&&c.crit.raised?xl('<span title="Critter muito forte: foi gerado no nível mínimo dele (')+c.crit.min+xl(') em vez de ')+c.crit.req+xl('. Você pode baixar manualmente com o botão −." style="color:#d9822b;margin:0 4px">⚠ gerado no mínimo (')+c.crit.min+xl('); dá para baixar com −</span>'):'')+(v>=11?xl('<span title="A partir do nível 11 o teto dos atributos sobe gradualmente até o dobro do máximo natural do metatipo (no nível 100)" style="color:#d9822b;margin:0 4px">⚠</span>'):'')+'<button type="button" class="lvb" aria-label="'+xl('Aumentar')+'" '+(v>=LVMAX?'disabled':'')+'>+</button>';
    const [bm,bp]=kc.querySelectorAll('.lvb');bm.onclick=()=>levelAt(idx(),v-1);bp.onclick=()=>levelAt(idx(),v+1);
    kc.title=xl('Clique para ajustar o nível');kc.tabIndex=0;kc.setAttribute('role','button');if(LVO.has(c))kc.classList.add('open');
    const tg=()=>{kc.classList.toggle('open');kc.classList.contains('open')?LVO.add(c):LVO.delete(c)};kc.onclick=e=>{if(!e.target.closest('.lvb'))tg()};kc.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('.lvb')){e.preventDefault();tg()}}}}
  const lv=mkLv('lk2',ICO.lock,xl('travar')),rv=mkLv('rr2',ICO.dice,xl('rerrolar')),box=document.createElement('div');box.className='levers';
  const ab=document.createElement('button');ab.type='button';ab.className='lever act rr';ab.hidden=true;let w=0;const allKeys=c.crit?['name','type','force']:['name','meta','attr','skill','qual','gear','weap','armor','misc','imp','magic','ma','pers'];
  box.append(fv);top.appendChild(box);sh._lv=lv;sh._rv=rv;sh._ab=ab;   // v45.2: o cadeado e o dado do canto viraram atalhos da barra Ajustar (mesmos botões, fora do canto)
  
  const paint=()=>{sh.querySelectorAll('[data-lk]').forEach(e=>{e.classList.toggle('lk-on',eff(e.dataset.lk));e.classList.toggle('lk-part',e.dataset.lk==='gear'&&!eff('gear')&&GKEYS.some(x=>LK[x]))});const m=LM.has(c),r=RM.has(c);ab.hidden=!(m||r);if(r){ab.textContent=c.fav&&w?xl('Confirmar rerrolar favorita?'):xl('Rerrolar tudo');ab.title=xl('Gera a ficha inteira de novo, respeitando o que está travado')}else if(m){const all=allKeys.every(k=>eff(k));ab.textContent=all?xl('Destravar tudo'):xl('Travar tudo');ab.title=all?xl('Remove todas as travas desta ficha'):xl('Trava todos os itens desta ficha')}sh.classList.toggle('lockmode',m);sh.classList.toggle('rrmode',r);lv.classList.toggle('on',m);rv.classList.toggle('on',r);
   lv.title=m?xl('Sair do modo de travar'):xl('Travar: ative e clique nos elementos da ficha que devem ser mantidos ao rerrolar (')+tn('rr.travadoN',Object.values(LK).filter(Boolean).length)+')';rv.title=r?xl('Sair do modo de rerrolar'):xl('Rerrolar parte: ative e clique no elemento da ficha que deve ser gerado de novo (o resto fica como está)')};
  ab.onclick=()=>{if(RM.has(c)){if(c.fav&&!w){w=1;paint();setTimeout(()=>{w=0;paint()},4000);return}rerollAt(idx());return}if(LM.has(c)){const all=allKeys.every(k=>eff(k));allKeys.forEach(k=>{LK[k]=all?0:1});saveN();paint()}};
  lv.onclick=()=>{if(LM.has(c))LM.delete(c);else{LM.add(c);RM.delete(c)}paint()};
  rv.onclick=()=>{if(RM.has(c))RM.delete(c);else{RM.add(c);LM.delete(c)}paint()};
  sh.addEventListener('mousedown',e=>{if((LM.has(c)||RM.has(c))&&e.target.closest('[data-lk]'))e.preventDefault()},true);
  sh.addEventListener('click',e=>{const m=LM.has(c),r=RM.has(c);if(!m&&!r)return;const t=e.target.closest('[data-lk]');if(!t||!sh.contains(t))return;e.preventDefault();e.stopPropagation();
   const k=t.dataset.lk;if(r){rerollAt(idx(),k);return}
   const v=!eff(k);
   if(k==='attr'){LK.attr=v?1:0;if(v)LK.meta=1}
   else if(k==='meta'){LK.meta=v?1:0;if(!v)LK.attr=0}
   else if((k==='imp'||k==='magic')&&tie()){LK.imp=LK.magic=v?1:0}
   else if(k==='gear'){LK.gear=LK.weap=LK.armor=LK.misc=v?1:0}
   else LK[k]=v?1:0;
   saveN();paint()},true);
  sh._paint=paint;paint()});
