/* ===== Idiomas (pt/en) =====
 *   t('chave')              texto no idioma atual; cai no pt e, se não houver, devolve a própria chave
 *   t('chave',{n:3})        troca {n} no texto (o chamador escapa com esc() o que for para innerHTML)
 *   idiomaAtual()           'pt' | 'en'
 *   setIdioma('en')         grava a escolha (localStorage 'sr5_lang'), troca <html lang>, reaplica o HTML e avisa
 *   i18nAdd({chave:[pt,en]})  registra textos; cada arquivo data/textos-*.js cuida de uma área da interface
 * HTML estático ou injetado: data-i18n (texto), data-i18n-title, data-i18n-aria (aria-label), data-i18n-ph (placeholder),
 *   data-i18n-label (optgroup). Depois de injetar HTML novo, chame aplicaIdioma().
 * Texto montado em JS: use t() na hora de desenhar e escute o evento 'idioma' (document) se a tela precisa se refazer.
 * Não ponha data-i18n em elemento cujo texto o JS troca depois (use t() + evento 'idioma', como em painel-modo.js). */
const I18N={pt:{},en:{}};
function i18nAdd(tab){for(const k in tab){I18N.pt[k]=tab[k][0];I18N.en[k]=tab[k][1]}}
const LANG_HTML={pt:'pt-BR',en:'en'},LANG_KEY='sr5_lang',LANG_ATTR={title:'title',aria:'aria-label',ph:'placeholder',label:'label'};
let IDIOMA_ATUAL=(()=>{try{const v=localStorage.getItem(LANG_KEY);return I18N[v]?v:'pt'}catch(e){return 'pt'}})();
const idiomaAtual=()=>IDIOMA_ATUAL;
function t(k,v){let s=I18N[IDIOMA_ATUAL][k];if(s==null)s=I18N.pt[k];if(s==null)return k;
 return v?String(s).replace(/\{(\w+)\}/g,(m,n)=>v[n]==null?m:v[n]):s}
/* Plural: tn('chave', n, {outras}) usa 'chave.one' (n = 1) ou 'chave.other' e preenche {n} (já formatado) e as variáveis dadas.
 * Em vez de "arquivo(s)", registre as duas formas inteiras com i18nAdd: a ordem das palavras e a concordância ficam por conta de cada idioma.
 * Regras por idioma em PLURAL (pt e en: 1 = one, o resto = other); idioma novo com mais formas (few, many) entra aqui. */
const PLURAL={pt:n=>n===1?'one':'other',en:n=>n===1?'one':'other'};
function tn(k,n,v){const cat=(PLURAL[IDIOMA_ATUAL]||PLURAL.pt)(Math.abs(+n)),key=(I18N[IDIOMA_ATUAL][k+'.'+cat]!=null||I18N.pt[k+'.'+cat]!=null)?k+'.'+cat:k+'.other';
 return t(key,Object.assign({n:typeof fmtNum==='function'?fmtNum(n):n},v||{}))}
/* Texto com o PORTUGUÊS como chave (gettext): xl('texto pt') devolve o inglês de TX_EN (data/en.js) quando o idioma é en; sem tradução, ou em pt,
 * devolve o próprio texto. Linha de banco "texto§afinidades§tags" traduz só o que vem antes do 1º § (o resto é estrutura e passa igual).
 * xlf('Cria {0} fichas de {1}',a,b) troca {0},{1} (valores entram como estão: o escape fica com quem chama). Os bancos de dados são
 * traduzidos no carregamento; por isso trocar de idioma recarrega a página (as fichas guardadas voltam sozinhas). */
const TX_EN={},TX_FALTA=new Set(),REV=new Map(),PTOF=new Map();   /* REV: texto traduzido → original pt; PTOF: texto já sorteado (en) → o mesmo sorteio em pt. Só servem para o código que lê o texto em português (acRefs) */
function xlAdd(tab){for(const k in tab)if(tab[k]!=='')TX_EN[k]=tab[k]}
function xl(s){if(IDIOMA_ATUAL!=='en'||typeof s!=='string')return s;const i=s.indexOf('§');if(i>=0)return xl(s.slice(0,i))+s.slice(i);
 const r=TX_EN[s];if(r!=null){if(!REV.has(r))REV.set(r,s);return r}TX_FALTA.add(s);return s}
function xlf(s,...a){return xl(s).replace(/\{(\d+)\}/g,(m,i)=>a[+i]==null?'':a[+i])}
/* sorteia as alternativas {a|b} de um texto; se há o original pt, faz o mesmo sorteio nele e guarda o par (PTOF) */
function fillAlt(en,choose,pt){const RG=/\{([^{}]*\|[^{}]*)\}/;let p=pt!==undefined?pt:REV.get(en),r=en;
 for(let g;(g=r.match(RG));){const L=g[1].split('|'),v=choose(L);r=r.replace(g[0],()=>v);
  if(p!=null){const h=p.match(RG);if(h){const M=h[1].split('|'),i=L.indexOf(v);p=i>=0&&M.length===L.length?p.replace(h[0],()=>M[i]):null}}}
 if(p!=null&&p!==r)PTOF.set(r,p);return r}
const rxEsc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');   // texto literal dentro de RegExp
const traduz=t;   // mesmo t(): use onde a função tem uma variável local chamada t (ex.: critter-condutas.js), que esconderia a tradução
function aplicaIdioma(){
 document.documentElement.lang=LANG_HTML[IDIOMA_ATUAL];
 document.title=t('titulo');
 document.querySelectorAll('[data-i18n]').forEach(e=>{e.textContent=t(e.getAttribute('data-i18n'))});
 for(const k in LANG_ATTR)document.querySelectorAll('[data-i18n-'+k+']').forEach(e=>e.setAttribute(LANG_ATTR[k],t(e.getAttribute('data-i18n-'+k))));
 document.querySelectorAll('#langw [data-lang]').forEach(b=>{const on=b.dataset.lang===IDIOMA_ATUAL;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')})}
function setIdioma(l){if(!I18N[l])return;const mudou=l!==IDIOMA_ATUAL;IDIOMA_ATUAL=l;try{localStorage.setItem(LANG_KEY,l)}catch(e){}
 aplicaIdioma();document.dispatchEvent(new CustomEvent('idioma',{detail:{lang:l}}));
 if(mudou&&typeof location!=='undefined'&&typeof location.reload==='function')setTimeout(()=>location.reload(),60)}
(function(){document.querySelectorAll('#langw [data-lang]').forEach(b=>b.addEventListener('click',()=>setIdioma(b.dataset.lang)));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',aplicaIdioma);else aplicaIdioma()})();   // os textos entram depois (data/textos-*.js); por isso espera o fim do parse
