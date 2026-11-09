/* ===== v45.1: barra "Ajustar" em cada ficha =====
   Clique no nome de uma parte = rerrola só ela. O cadeado trava a parte para o "Rerrolar o resto".
   "Desfazer" volta ao estado anterior da ficha (até 8 passos). Usa rerollAt/undoAt (logic/rerrolar.js) e as mesmas travas. */
const AJ_PREF='sr5_ajopen',ajOpen=()=>{try{const v=localStorage.getItem(AJ_PREF);return v===null?false:v==='1'}catch(e){return false}};
const AJ_IC={lock:'<svg viewBox="0 0 16 16" width="13" height="13" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="7.2" width="9" height="6.3" rx="1.4"/><path d="M5.6 7.2V5.4a2.4 2.4 0 0 1 4.8 0v1.8"/></svg>',
 undo:'<svg viewBox="0 0 16 16" width="13" height="13" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.2 6.4h6.2a3.6 3.6 0 0 1 0 7.2H6"/><path d="M5.6 3.8 3 6.4l2.6 2.6"/></svg>',
 dice:'<svg viewBox="0 0 16 16" width="13" height="13" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.2 8a5.2 5.2 0 0 1-9 3.5"/><path d="M2.8 8a5.2 5.2 0 0 1 9-3.5"/><path d="M12.4 1.9v2.9H9.5"/><path d="M3.6 14.1v-2.9h2.9"/></svg>'};
function ajPartes(c){
 if(c.crit)return[['name',xl('Nome'),1],['type',xl('Tipo'),1],['force',xl('Força'),1],['cond',xl('Condutas'),0]];
 const o=c.npc||{},imp=(c.gear||[]).some(IMPC),mag=!!(c.talent||c.magic||(c.spells||[]).length||(c.powers||[]).length||(c.cf||[]).length);
 return[['name',xl('Nome'),1],['attr',xl('Atributos'),1],['skill',xl('Habilidades'),1],['qual',xl('Qualidades'),1],['weap',xl('Armas'),1],['armor',xl('Armadura'),1],['misc',xl('Equipamento'),1],
  ...(imp?[['imp',xl('Implantes'),1]]:[]),...(mag?[['magic',xl('Magia'),1]]:[]),...(c.ma?[['ma',xl('Arte marcial'),1]]:[]),...(o.pers?[['pers',xl('Perfil de atuação'),1]]:[]),['cond',xl('Condutas'),0]]}
const AJ_TIPS={name:xl('o nome (e os contatos ligados a ele)'),attr:xl('os atributos'),skill:xl('as habilidades'),qual:xl('as qualidades'),weap:xl('as armas, com acessórios e munição'),armor:xl('a armadura'),misc:xl('os demais itens (comlink, kits, drones…)'),imp:xl('os implantes'),magic:xl('a magia (tradição, feitiços, poderes)'),ma:xl('a arte marcial'),pers:xl('o perfil de atuação (e o que ele escolhe na ficha)'),cond:xl('as condutas em combate (vida alta e vida baixa)'),type:xl('o tipo de critter'),force:xl('a Força')};
decorateSheet((sh,c)=>{
 if(!c.npc&&!c.crit)return;const top=sh.querySelector('.top');if(!top)return;
 const idx=()=>SESSAO.fichas.indexOf(c),LK=lockOf(c),tie=()=>!!(c.magicLoss||c.resLoss),P=ajPartes(c);
 const eff=k=>!!(LK[k]||(GKEYS.includes(k)&&LK.gear)||(k==='meta'&&LK.attr));
 const det=document.createElement('details');det.className='ajusta';det.open=ajOpen();
 const sum=document.createElement('summary');sum.innerHTML=xl('Ajustar esta ficha <span class="note">rerrole só uma parte ou trave o que gostou</span>');det.appendChild(sum);
 const row=document.createElement('div');row.className='ajb';det.appendChild(row);
 const pills=new Map();
 P.forEach(([k,lab,canLock])=>{const sp=document.createElement('span');sp.className='ajp';
  if(canLock){const l=document.createElement('button');l.type='button';l.className='ajl';l.innerHTML=AJ_IC.lock;l.dataset.k=k;sp.appendChild(l)}
  const r=document.createElement('button');r.type='button';r.className='ajr';r.textContent=lab;r.title=xl('Rerrolar só ')+AJ_TIPS[k]+xl(' (o resto não muda)');r.setAttribute('aria-label',xl('Rerrolar só: ')+lab);
  r.onclick=()=>rerollAt(idx(),k);sp.appendChild(r);row.appendChild(sp);pills.set(k,sp)});
 const sep=document.createElement('span');sep.className='ajs';row.appendChild(sep);
 const all=document.createElement('button');all.type='button';all.className='aja';
 const und=document.createElement('button');und.type='button';und.className='ajd';und.innerHTML=AJ_IC.undo+' '+xl('Desfazer');
 const tt=document.createElement('button');tt.type='button';tt.className='ajt';   // travar/destravar tudo (antes: botão do canto)
 const sc=document.createElement('span');sc.className='ajm';sc.innerHTML=xl('<span class="note">Clicar na ficha:</span>');
 const mb=(txt,tip,get)=>{const b=document.createElement('button');b.type='button';b.className='ajt';b.textContent=txt;b.title=tip;b.onclick=()=>{get().click();paint()};sc.appendChild(b);return b};
 const mL=mb(xl('travar'),xl('Liga/desliga o atalho: clique num bloco da ficha (nome, atributos, habilidades…) para travar ou destravar'),()=>sh._lv),mR=mb(xl('rerrolar'),xl('Liga/desliga o atalho: clique num bloco da ficha para rerrolar só ele'),()=>sh._rv);
 row.append(tt,all,und);det.appendChild(sc);
 let w=0;
 const paint=()=>{let n=0;P.forEach(([k,,cl])=>{if(!cl)return;const on=eff(k),sp=pills.get(k),l=sp.querySelector('.ajl');if(on)n++;sp.classList.toggle('on',on);l.setAttribute('aria-pressed',on?'true':'false');
   l.title=on?xl('Travado: não muda ao rerrolar o resto. Clique para destravar'):'Travar '+AJ_TIPS[k]+xl(' (vale para “Rerrolar o resto”)');l.setAttribute('aria-label',(on?xl('Destravar: '):xl('Travar: '))+P.find(x=>x[0]===k)[1])});
  const allOn=P.every(([k,,cl])=>!cl||eff(k));tt.textContent=allOn?xl('Destravar tudo'):xl('Travar tudo');tt.title=allOn?xl('Remove todas as travas desta ficha'):xl('Trava todos os itens desta ficha');
  mL.classList.toggle('on',LM.has(c));mL.setAttribute('aria-pressed',LM.has(c)?'true':'false');mR.classList.toggle('on',RM.has(c));mR.setAttribute('aria-pressed',RM.has(c)?'true':'false');
  all.innerHTML=AJ_IC.dice+' '+(w?xl('Confirmar? é favorita'):n?xl('Rerrolar o resto')+' <span class="note">('+tn('rr.travadoN',n)+')</span>':xl('Rerrolar tudo'));
  all.title=n?xl('Gera a ficha de novo mantendo só o que está travado'):xl('Nada travado: gera a ficha inteira de novo');
  const u=undoCount(c);und.disabled=!u;und.title=u?xl('Volta ao estado anterior desta ficha (')+u+' passo'+(u>1?'s':'')+' guardado'+(u>1?'s':'')+')':xl('Ainda não há o que desfazer')};
 row.querySelectorAll('.ajl').forEach(l=>l.onclick=()=>{const k=l.dataset.k,v=!eff(k);
  if(GKEYS.includes(k)){if(LK.gear&&!v){LK.gear=0;GKEYS.forEach(x=>LK[x]=1)}LK[k]=v?1:0;LK.gear=GKEYS.every(x=>LK[x])?1:0}
  else if((k==='imp'||k==='magic')&&tie()){LK.imp=LK.magic=v?1:0}
  else if(k==='attr'){LK.attr=v?1:0;if(v)LK.meta=1}
  else LK[k]=v?1:0;
  saveN();paint();if(sh._paint)sh._paint()});
 tt.onclick=()=>{const on=P.every(([k,,cl])=>!cl||eff(k));P.forEach(([k,,cl])=>{if(cl&&k!=='name'||(cl&&on))LK[k]=on?0:1});if(!on){LK.gear=GKEYS.every(x=>LK[x])?1:0}else{LK.gear=0;LK.meta=0}saveN();paint();if(sh._paint)sh._paint()};
 all.onclick=()=>{if(c.fav&&!w){w=1;paint();setTimeout(()=>{w=0;paint()},4000);return}rerollAt(idx())};
 und.onclick=()=>undoAt(idx());
 det.addEventListener('toggle',()=>{try{localStorage.setItem(AJ_PREF,det.open?'1':'0')}catch(e){}});
 top.insertAdjacentElement('afterend',det);const p0=sh._paint;sh._paint=()=>{if(p0)p0();paint()};paint()});
