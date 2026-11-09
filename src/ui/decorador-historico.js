/* ===== Ficha: histórico de vida (módulos do Chummer) ===== */
decorateSheet((sh,c)=>{const h=histLinha(c);if(!h)return;const sec=sh.querySelector('.sec');if(!sec)return;sec.insertAdjacentHTML('beforeend',dgRow(xl('Histórico'),esc(h)))});
