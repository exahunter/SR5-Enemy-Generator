// Regras de verificação em português. Para outro idioma, copie este arquivo para idioma/<codigo>.js e traduza SÓ as expressões:
// as ferramentas (checar-fuga, checar-vida-baixa, contar-condutas) não têm mais nenhuma palavra de idioma dentro delas.
module.exports={
 nome:'português',
 // checar-fuga: o que conta como "menciona fuga" e como se reconhece cada complemento obrigatório
 fuga:/fug|fugi|foge|debanda|desert|abandona (o|a) (grupo|posto|local|luta)|sai correndo|sai da luta|dá as costas|bate em retirada|bate a retirada/i,
 complementos:{
  semRota:/sem (rota|saída|saida|como (fugir|sair|escapar))|não (há|tem|ha) (rota|saída|por onde)|acuad|encurral|sem escapatória|sem por onde|se não (houver|tiver) (rota|saída)|fechad|bloquead|cercad/i,
  ferido:/aliad\w* ferid|companheir\w* ferid|ferid\w* (do|da) (grupo|equipe)|carrega|arrasta (o|a|os|as) ferid|não deixa (o|os) ferid|deixa (o|os) ferid|abandona (o|os) ferid|leva (o|os) ferid/i,
  importante:/aliad\w* importante|líder|lider|chefe|comandante|quem manda|ainda (está )?(lutando|em combate)|não (larga|abandona|deixa) (o|a) (líder|chefe)|enquanto (o|a) (líder|chefe)/i},
 // checar-vida-baixa: "Com N de F caixas de dano físico (ou S de A de atordoante, o que vier primeiro): …"  -> grupos: nf, F, ns, A, resto
 caixas:/^Com (\d+) de (\d+) caixas de dano físico \(ou (\d+) de (\d+) de atordoante, o que vier primeiro\): (.+)$/,
 continuaLutando:/continua (atirando|lutando|a lutar)/i,       // conduta de ferido comum: não pode aparecer no 3º passo
 noLimite:/(at[ée] o fim|quase|[úu]ltim|sem recuar|se debate|desfeito)/i,   // CC_LAST precisa dizer que o critter está no limite
 desfechosFugaCritter:[[/sem rota de fuga/,'sem rota de fuga'],[/com aliado ferido/,'aliado ferido'],[/com aliado importante ainda lutando/,'aliado importante ainda lutando']],
 // contar-condutas: conjunção que, repetida, denuncia frase carregada demais
 conjuncao:/ e /g};
