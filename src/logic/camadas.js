/* ===== Camadas: extensão ordenada e visível de uma função =====
 * Antes, vários arquivos reatribuíam a mesma função (`genNPC=function(){…}`), e a ordem só existia no manifest.
 * Agora a função-base é registrada uma vez e cada arquivo acrescenta uma camada com nome:
 *
 *   const genCritter=comCamadas('genCritter',genCritterBase);      // no arquivo da base
 *   genCritter.camada('arma natural',prox=>function(...a){const c=prox(...a);armaNatural(c);return c});  // em outro arquivo
 *
 * `prox` é a função anterior da pilha (a base ou a camada registrada antes). A ordem é a de registro, que é a do manifest.
 * A pilha pode ser conferida por `genCritter.rotulos()` ou `node tools/mapa-camadas.js`. Não reatribua mais a função:
 * o mapa-camadas acusa qualquer `nome=function` sobre um nome que tenha camadas. */
const CAMADAS={};
function comCamadas(nome,base){
 let cadeia=base;const lista=[];
 const f=function(...a){return cadeia.apply(this,a)};
 f.camada=(rotulo,mk)=>{if(typeof mk!=='function')throw new Error('camada '+nome+'/'+rotulo+xl(': mk deve ser função'));cadeia=mk(cadeia);lista.push(rotulo);return f};
 f.rotulos=()=>lista.slice();
 CAMADAS[nome]=f;return f}
