/* ===== Estado mutável: tudo o que muda durante a geração ou na sessão fica aqui =====
 *   GEN     opções e rascunho da geração em andamento (zerado por leOpcoesGeracao e no começo de genGroup)
 *   SESSAO  o que o usuário está vendo (as fichas na tela, antes `curN`) e o histórico (IndexedDB '__pcs')
 * leOpcoesGeracao() é o único ponto que lê os controles da tela; doGen, rerrolar e subir-nivel chamam ela.
 * Dados carregados do Chummer (ITEMS, IMPL, MART…) e caches não entram aqui. */
const GEN={
 wild:false, impSel:'auto', comp:'grp',
 metaUsed:{}, cultHint:null, lvAdd:{q:[],g:[]},
 persCur:null, persForce:null, persLevel:false,
 attrKeep:null   // v45.2: no rerrolar com metatipo travado, {sum,ak} = total de atributos e pontos de carma da ficha antiga (só redistribui)
};
const SESSAO={fichas:[],hist:[]};
function leOpcoesGeracao(){GEN.wild=document.getElementById('wild').checked;GEN.metaUsed={};GEN.impSel=val('nimp')}
