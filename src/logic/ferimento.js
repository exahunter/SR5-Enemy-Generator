/* ===== Penalidade de ferimento configurável =====
 * Passo = quantas caixas de dano para cada −1 dado: 3 (regra padrão do SR5), 2, 1 ou 0 (sem penalidade). Guardado em localStorage 'sr5_fer'.
 * Só afeta a EXIBIÇÃO (monitor, modo mesa, texto de fuga). Não entra no sorteio, nem no XML/JSON do Chummer. */
const FER_KEY='sr5_fer';
function ferStep(){try{const v=localStorage.getItem(FER_KEY);if(v===null)return 3;const n=+v;return n===0||n===1||n===2||n===3?n:3}catch(e){return 3}}
function ferSet(n){try{localStorage.setItem(FER_KEY,String(n))}catch(e){}}
const ferPen=boxes=>{const s=ferStep();return s?Math.floor(boxes/s):0};      // dados perdidos com N caixas preenchidas
const ferRegra=()=>t('fer.regra.'+ferStep()),ferHover=()=>t('fer.hover.'+ferStep());
