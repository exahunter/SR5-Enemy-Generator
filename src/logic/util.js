/* erros engolidos: registra uma vez por tipo no console (F12), sem travar nada */
const _AVISOS=new Set();
function avisa(ctx,e){const k=ctx+':'+(e&&e.message||e);if(_AVISOS.has(k))return;_AVISOS.add(k);try{console.warn('[gerador] '+ctx,e)}catch(_){}}
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[R(0,a.length-1)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const ATTR=['BOD','AGI','REA','STR','CHA','INT','LOG','WIL'];
