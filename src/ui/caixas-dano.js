/* ===== v53: caixas de dano clicáveis (físico, atordoamento e excedente) =====
   Aparecem no bloco de combate da ficha completa e no modo mesa (os dois mostram o mesmo estado e se atualizam juntos).
   Clique numa caixa vazia marca o dano até ela; clique numa marcada desmarca ela e as seguintes. A penalidade de ferimento usa ferStep() em cada trilha separada (físico e atordoamento) e soma as duas.
   O estado fica em sessionStorage por ficha (_id): sobrevive ao redesenho e some ao fechar a aba. Não entra no sorteio nem no Chummer. */
const DANO_KEY='sr5-dano';
let DANO=(()=>{try{return JSON.parse(sessionStorage.getItem(DANO_KEY)||'{}')||{}}catch(e){return {}}})();
const danoSalvar=()=>{try{sessionStorage.setItem(DANO_KEY,JSON.stringify(DANO))}catch(e){avisa('caixas-dano',e)}};
const danoMax=c=>{const d=derived(c);return{f:d.fis|0,a:d.atu|0,o:+((c.at||{}).BOD)||0}};
const danoEst=c=>{const m=danoMax(c),s=DANO[c._id]||{};return{f:Math.min(m.f,s.f|0),a:Math.min(m.a,s.a|0),o:Math.min(m.o,s.o|0)}};
function danoTrilha(k,n,v){let h='';const s=ferStep();
 for(let i=1;i<=n;i++){h+='<i class="cx '+k+(i<=v?' on':'')+'" role="checkbox" aria-checked="'+(i<=v)+'" tabindex="0" data-k="'+k+'" data-n="'+i+'"></i>';
  if(s&&i%s===0&&k!=='o')h+='<em>−'+(i/s)+'</em>'}
 return h}
function danoHTML(c){if(!c||!c._id)return'';
 const m=danoMax(c),e=danoEst(c),pen=ferPen(e.f)+ferPen(e.a),
  st=[e.f>=m.f&&m.f?t('dano.inc'):'',e.a>=m.a&&m.a?t('dano.ina'):''].filter(Boolean).join(' · '),
  linha=(k,l)=>'<div class="mon"><b>'+t(l)+'</b><span>'+danoTrilha(k,m[k],e[k])+'</span></div>';
 return'<div class="dano" data-id="'+c._id+'" title="'+esc(t('dano.dica'))+'">'+linha('f','dano.fis')+linha('a','dano.atu')+(m.o?linha('o','dano.exc'):'')+
  '<div class="dpen"><span class="dp'+(pen?' hot':'')+'">'+(pen?tn('dano.pen',pen):t('dano.sem'))+'</span>'+(st?'<span class="ds">'+esc(st)+'</span>':'')+
  '<button type="button" class="dz">'+t('dano.zerar')+'</button></div></div>'}
function danoAtualizar(c){const foco=document.activeElement,sh=sheetOf(c);let k=null,n=null,mesa=false;
 if(foco&&foco.matches&&foco.matches('.dano .cx')){k=foco.dataset.k;n=foco.dataset.n;mesa=!!foco.closest('.mesa')}
 document.querySelectorAll('.dano[data-id="'+c._id+'"]').forEach(b=>{b.outerHTML=danoHTML(c)});
 if(k&&sh){const x=sh.querySelector((mesa?'.mesa':'.cmb')+' .dano .cx[data-k="'+k+'"][data-n="'+n+'"]');if(x)x.focus()}}   // o teclado não perde o lugar
function danoAgir(x){const sh=x.closest('.sheet'),c=sh&&charOf(SESSAO.fichas,sh);if(!c)return;
 const e=danoEst(c);
 if(x.classList.contains('dz'))e.f=e.a=e.o=0;
 else{const k=x.dataset.k,n=+x.dataset.n;e[k]=n<=e[k]?n-1:n}   // caixa marcada: desmarca a clicada (e as seguintes); vazia: marca até ela
 DANO[c._id]=e;danoSalvar();danoAtualizar(c)}
document.addEventListener('click',ev=>{const x=ev.target.closest&&ev.target.closest('.dano .cx, .dano .dz');if(x)danoAgir(x)});
document.addEventListener('keydown',ev=>{const x=ev.target;if((ev.key===' '||ev.key==='Enter')&&x.matches&&x.matches('.dano .cx')){ev.preventDefault();danoAgir(x)}});
/* ficha completa: as caixas vão logo abaixo da linha "Monitor" do bloco de combate */
decorateSheet((sh,c)=>{const b=sh.querySelector('.cmb');if(!b||b.querySelector('.dano'))return;
 try{b.insertAdjacentHTML('beforeend',danoHTML(c))}catch(e){avisa('caixas-dano',e)}});
document.addEventListener('idioma',()=>{try{if(typeof SESSAO!=='undefined'&&SESSAO.fichas&&SESSAO.fichas.length)renderNPC(SESSAO.fichas)}catch(e){avisa('caixas-dano',e)}});
