/* ===== v40: regras de ligação texto → ação do livro para as condutas novas (entram na frente das regras de acoes-regras.js) ===== */
ACR.unshift(
 [/bani[sc]h?|banimento|banisha/,['Banish Spirit']],
 [/sprites?\b/,['Command Sprite']],
 [/\barco\b|\bbesta\b|flecha/,['Fire Bow']]);
