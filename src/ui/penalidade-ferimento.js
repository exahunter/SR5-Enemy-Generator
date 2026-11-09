/* Seletor da penalidade de ferimento (opções avançadas). Grava em localStorage e redesenha as fichas abertas. */
(()=>{const s=document.getElementById('fer');if(!s)return;
 s.value=String(ferStep());
 s.addEventListener('change',()=>{ferSet(+s.value);try{if(typeof SESSAO!=='undefined'&&SESSAO.fichas&&SESSAO.fichas.length)renderNPC(SESSAO.fichas)}catch(e){avisa('penalidade-ferimento',e)}})})();
