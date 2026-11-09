/* ===== v40: condutas de combate de CRITTERS (e espíritos) =====
 * Critters agem por instinto e por poderes, não por personalidade. Cada um recebe 3 condutas com a vida alta (abordagem, terreno, poder)
 * e 3 com a vida baixa (ferido → muito ferido → quase caindo), coerentes com o temperamento sorteado.
 * Linha: "texto§peso" ; {a|b|c} sorteia variante. Poderes: PW = regex sobre os nomes dos poderes da ficha (a linha só vale se a ficha tem o poder).
 * Sem falas nem dicas de roleplay. Toda fuga traz os três desfechos (sem rota, aliado ferido, aliado importante ainda lutando). */
const CC_TEMP={
 predador:xl('Predador'),territorial:xl('Territorial'),presa:xl('Presa assustadiça'),emboscador:xl('Emboscador'),sapiente:xl('Sapiente'),espirito:xl('Espírito'),sprite:xl('Sprite (compilado)'),servo:xl('Servo (criado por ritual)')};
const CC_HI_A={
 predador:[xl("Escolhe o alvo mais fraco ou isolado: {segue o que ficou para trás|persegue quem foge|ignora o grupo e vai atrás de um só} e não larga até derrubá-lo"),xl("Ataca em rajadas curtas e recua para observar: {o inimigo que sangra|quem hesita|quem baixa a guarda} vira a próxima vítima"),xl("Avança em linha reta contra a maior ameaça e {tenta derrubá-la de uma vez|a mantém ocupada} enquanto o resto do bando cerca")],
 territorial:[xl("Defende a área e {ataca tudo o que entra nela|para de perseguir quem sai|marca o limite com ameaças antes de morder}; não vai além do que considera seu território"),xl("Ataca o que está mais perto da toca ou do ninho e {ignora quem está longe|volta ao ponto de origem depois de cada ataque}"),xl("Intimida antes de atacar: {investe e freia|ronda o grupo|faz barulho e se mostra maior} e só parte para o ataque se o inimigo não recua")],
 presa:[xl("Prefere fugir a lutar: {procura uma saída antes de qualquer ataque|se mantém perto de um esconderijo|se afasta do grupo mais barulhento} e só reage se for cercado"),xl("Reage ao movimento e ao barulho: {ataca o que se mexe mais rápido|foge de quem faz mais barulho|congela até ser tocado} e raramente toma a iniciativa"),xl("Fica junto do bando ou do grupo e {segue o que o líder fizer|corre quando os outros correm|ataca só se os outros também atacam}")],
 emboscador:[xl("Espera imóvel até a vítima chegar perto e {salta de uma cobertura|ataca de uma abertura no chão|cai de cima} antes de ser percebido"),xl("Escolhe um ponto de passagem e {deixa a vanguarda passar|ataca o último do grupo|se esconde até o grupo parar}; depois do primeiro ataque, {recua e some|volta ao esconderijo}"),xl("Usa o terreno para esconder o corpo e {ataca só uma vez por esconderijo|muda de lugar depois do primeiro ataque|espera o inimigo baixar a guarda}")],
 sapiente:[xl("Avalia a ameaça antes de agir: {conta os inimigos|olha as armas|procura os alvos que podem feri-lo mais} e escolhe o momento do primeiro ataque"),xl("Luta com um objetivo próprio: {proteger algo|chegar a um ponto|tirar alguém da luta} e ignora o resto, a não ser que atrapalhe"),xl("Usa o ambiente e as armas à mão, não só o corpo: {derruba móveis|arranca objetos pesados|atira o que encontra} para atingir mais de um alvo")],
 sprite:[xl("Cumpre a tarefa que o compilador registrou: {ataca o alvo indicado na Matrix|protege o dispositivo ou o host que lhe foi dado|fica entre o alvo e quem o compilou} e ignora o resto, a menos que o impeçam"),xl("Age de acordo com a função do sprite: {usa o host ou o dispositivo que o sustenta|se mantém perto do nó de origem|evita o que o desregistra} e não se afasta muito disso"),xl("Escolhe o alvo que mais ameaça quem o compilou e {o enfrenta primeiro|o segue pela Matrix|o impede de chegar ao dispositivo do compilador}")],
 servo:[xl("Cumpre a ordem do criador à letra: {ataca o alvo indicado|fica junto de quem o fez|vigia o ponto que lhe deram} e ignora o resto, a menos que o impeçam"),xl("Não pensa em si: {segue o criador a poucos passos|toma o lugar de quem o criador quer proteger|volta ao ponto de onde recebeu a ordem} e só se afasta quando mandam"),xl("Escolhe o inimigo que mais ameaça o criador e {o enfrenta primeiro|o segue sem se desviar|se coloca entre ele e o criador}")],
 espirito:[xl("Cumpre o serviço que recebeu: {ataca o alvo ordenado|protege quem o invocou|fica entre o alvo e o grupo} e ignora o resto, a menos que o impeçam"),xl("Age de acordo com a natureza do espírito: {usa o ambiente que o fortalece|se mantém perto do elemento de origem|evita o que o enfraquece} e não se aventura longe disso"),xl("Escolhe o inimigo que mais ameaça quem o invocou e {o enfrenta primeiro|o segue pelo astral ou pelo terreno|o impede de chegar ao invocador}")]};
const CC_HI_TV=[xl("Usa o corpo e o ambiente que tem à mão: {fica entre o inimigo e o criador|avança pelo caminho mais direto|fica parado onde foi posto} e só muda de lugar por ordem"),xl("Mantém-se perto do criador e {só se afasta quando mandam|volta a ele depois de cada ação}")];
const CC_HI_TS=[xl("Usa a Matrix a seu favor: {fica dentro do host ou do dispositivo que o abriga|segue o sinal até o alvo|passa por nós onde o inimigo não alcança}"),xl("Mantém-se perto do nó que o sustenta e {só se afasta quando o compilador manda|volta a ele depois de cada ação}")];
const CC_HI_T=[xl("Usa o terreno a seu favor: {sobe em lugares altos|passa por espaços onde o inimigo não cabe|fica atrás de obstáculos que o inimigo não pode atravessar} e ataca de lá"),xl("Evita lutar em campo aberto: {procura cobertura|se mantém perto de uma parede|mantém uma saída livre às costas} antes de qualquer ataque"),xl("Muda de posição depois de cada ataque: {desloca-se para o flanco|volta para o escuro|passa por trás de outro inimigo} para não ser acertado no mesmo lugar"),xl("Fica de olho no ponto mais forte do inimigo e {evita atacá-lo de frente|dá a volta|espera ele se distrair}"),xl("Ataca quem está ferido ou sozinho e {ignora os outros|recua se o grupo se junta|volta ao ataque quando o grupo se separa}")];
const CC_HI_P=[
 [/^Search$/,xl("Localiza o alvo antes de atacar: {segue o rastro de quem se escondeu|procura quem sumiu da luta|descobre onde cada inimigo está} e só então parte para cima")],
 [/Banishing Resistance/,xl("Não se abala com o banimento: {ignora quem tenta bani-lo e ataca outro|mantém a posição até o ritual falhar|vai atrás de quem o conjura}")],
 [/AR-Parallelism/,xl("Atua ao mesmo tempo no mundo físico e na realidade aumentada: {reage a quem mexe nos dados da cena|usa a RA para ver o que o inimigo não vê|ataca quem tenta cegá-lo na RA}")],
 [/Resonance Feed/,xl("Se alimenta do fluxo da Ressonância ao redor: {fica perto de dispositivos conectados|age mais forte onde há muita atividade de Matrix|perde força quando o fluxo é cortado} e evita lutar longe deles")],
 [/Venom|Infection/,xl("Usa o veneno ou a infecção como arma principal: {morde ou fere uma vez e se afasta|deixa o efeito agir enquanto se mantém fora do alcance|insiste no alvo já envenenado}")],
 [/Paralyzing|Fear|Sonic Shriek|Noxious/,xl("Abre a luta com o efeito de medo, paralisia ou sopro: {usa antes do contato|em quem está mais perto do grupo|em quem tenta ajudar os feridos} e só depois ataca quem ficou parado")],
 [/Engulf/,xl("Prende o alvo e {o mantém imobilizado|o arrasta para longe do grupo|o usa como escudo} antes de procurar outro")],
 [/Concealment|Camouflage/,xl("Se esconde e some de vista: {aparece só para atacar|muda de lugar no escuro|usa o ambiente para não ser visto} e evita luta aberta")],
 [/Flight|Magical Flight/,xl("Ataca do alto: {mergulha sobre o alvo|rodeia o grupo|mantém a altitude fora do alcance das armas curtas} e só desce para atacar")],
 [/Movement/,xl("Aproveita a velocidade ou o modo de movimento: {corre em volta do grupo|passa por onde ninguém acompanha|ataca e some antes da resposta}")],
 [/Regeneration/,xl("Aceita o dano para ganhar tempo: {segue lutando mesmo ferido|ignora os ferimentos leves|volta ao ataque depois de se recuperar} e foge só quando a regeneração não dá mais conta")],
 [/Hardened Armor|Improved Natural Armor|Armor|Immunity/,xl("Avança sem se proteger: {aproveita a armadura|ignora armas comuns|aguenta o fogo cerrado} e muda o alvo quando o inimigo passa a usar o que o fere")],
 [/Mimicry/,xl("Imita sons e vozes: {chama quem está sozinho|atrai o grupo para uma armadilha|confunde quem tenta se coordenar} e ataca quem cai na isca")],
 [/Animal Control|Compulsion|Influence/,xl("Controla ou persuade antes de lutar: {manda animais atacarem|desvia um aliado para o lado errado|impede um inimigo de agir} e deixa os outros fazerem o serviço")],
 [/Elemental Attack|Sonic Projection|Electron Storm|Electrocytes/,xl("Usa o ataque elemental de longe: {mantém distância|ataca em linha reta|alterna entre alvos}, e só parte para o contato quando acaba a energia")],
 [/Natural Weapon|Natural Weapon \(|Additional Natural Weapon/,xl("Ataca com a arma natural de maior alcance e {troca para outra se o alvo recua|dá o golpe seguinte sem esperar|insiste no primeiro corte}")],
 [/Enhanced Senses|Echolocation|Magic Sense|Astral Perception/,xl("Escolhe o alvo pelo sentido mais apurado: {pelo cheiro|pelo som|pela vibração|pelo calor} e ignora quem tenta se esconder de outro jeito")],
 [/Dual Natured|Astral Form|Materialization/,xl("Alterna entre o plano físico e o astral: {some de um quando o inimigo mira|ataca de um e se refugia no outro|escolhe o plano em que o inimigo é mais fraco}")],
 [/Confusion/,xl("Atrapalha o inimigo antes de ferir: {desorienta quem lidera|confunde quem mira|embaralha os sentidos de quem tenta ajudar os feridos} e ataca quem perdeu o rumo")],
 [/Energy Drain/,xl("Suga a energia de quem alcança: {escolhe quem já está ferido|insiste no mesmo alvo|troca de alvo a cada contato} e só se afasta quando o alvo cai")],
 [/^Blend$/,xl("Se confunde com o ambiente: {fica parado entre coisas parecidas|só se mexe quando ninguém olha|volta a se misturar depois de cada golpe} e ataca de perto")],
 [/Magical Guard|Guard|Bodyguard/,xl("Fica de guarda: {entre o alvo protegido e o inimigo|perto do ponto que protege|atacando só quem tenta passar}")]];
const CC_LO={
 predador:[
  [xl("continua o ataque {no mesmo ritmo|mais devagar|procurando o ponto fraco}, expondo-se pouco"),"fight"],
  [xl("recua um passo e {volta ao ataque|espera o inimigo se aproximar|ruge e investe}"),"cover"],
  [xl("come, lambe o ferimento ou fica parado um instante e {volta ao ataque|ataca quem o feriu}"),"heal"]],
 territorial:[
  [xl("continua a defender o território, sem avançar além de onde estava"),"fight"],
  [xl("recua para o ponto mais seguro do território e {espera o inimigo vir|ataca só quem chega perto}"),"cover"],
  [xl("se enfurece com a dor: {ignora a cobertura|investe contra o inimigo mais próximo|ataca sem se proteger}"),"rage"]],
 presa:[
  [xl("tenta fugir da luta pelo caminho mais próximo e só ataca se for impedido"),"wary"],
  [xl("se esconde ou se afasta do grupo e {fica parado|espera o barulho cessar}"),"cover"],
  [xl("entra em pânico: {corre sem direção|se joga contra o primeiro obstáculo|ataca o primeiro que o toca}"),"rage"]],
 emboscador:[
  [xl("recua para o esconderijo e {espera uma abertura|se mantém imóvel|muda de lugar}"),"cover"],
  [xl("ataca de novo só se o alvo estiver ao alcance e {some em seguida|se esconde de novo}"),"fight"],
  [xl("tenta sair da luta {pelo mesmo caminho|pela saída mais escura}, deixando o resto para o grupo"),"wary"]],
 sapiente:[
  [xl("avalia o que mudou e {procura uma saída|troca de alvo|recua para se reorganizar}"),"wary"],
  [xl("usa o que sobrou do terreno e das armas à mão para {abrir caminho|ganhar tempo|trazer o inimigo para um lugar pior}"),"swap"],
  [xl("pensa no objetivo e {insiste|negocia|se rende}, conforme o que for mais barato naquele momento"),"deal"]],
 sprite:[
  [xl("continua a cumprir a tarefa registrada, {sem recuar|trocando de alvo|usando o host que o sustenta}"),"fight"],
  [xl("perde estabilidade e {se afasta do centro da luta|volta ao nó de origem|protege o dispositivo do compilador antes de atacar}"),"cover"],
  [xl("está sendo desregistrado, {agindo até o fim|seguindo a última ordem|levando consigo o que puder}"),"last"]],
 servo:[
  [xl("continua a cumprir a ordem recebida, {sem recuar|trocando de alvo só se mandarem|ficando junto do criador}"),"fight"],
  [xl("perde o vigor e {se afasta do centro da luta, se o criador mandar|volta para perto do criador|cobre o criador antes de atacar}"),"cover"],
  [xl("está se desfazendo, {atacando até o fim|seguindo a última ordem|levando consigo o que puder}"),"last"]],
 espirito:[
  [xl("continua a cumprir o serviço, {sem recuar|trocando de alvo|usando o terreno que o fortalece}"),"fight"],
  [xl("perde força e {se afasta do centro da luta|volta ao elemento de origem|protege quem o invocou antes de atacar}"),"cover"],
  [xl("se dissolve ou se desfaz devagar, {atacando até o fim|seguindo o último comando|levando consigo o que puder}"),"last"]]};
/* vida baixa: 3 passos; fuga com os três desfechos quando o temperamento permite */
const CC_FUGA=[xl("foge da luta {para o esconderijo|pela saída mais próxima|para onde veio}; sem rota de fuga, {se encolhe no canto mais protegido|luta de costas para a parede}; com aliado ferido, {passa por ele sem parar|o leva junto, se couber no caminho}; com aliado importante ainda lutando, {adia a fuga até ele cair ou ser coberto|segue para a fuga e o deixa}")];
const CC_LAST={
 predador:xl("vai até o fim, {atacando quem estiver mais perto|puxando alguém para baixo|tentando levar o inimigo junto}"),
 territorial:xl("fica onde está e ataca {o que se aproxima|o que o feriu}, sem recuar um passo"),
 presa:xl("se debate às cegas, {derrubando tudo o que está perto|rolando no chão|arranhando quem se aproxima}"),
 emboscador:xl("já sem esconderijo, {salta numa última investida|se enrola sobre si mesmo}, sem cuidado com o que vem depois"),
 sapiente:xl("sabe que está quase morto e {usa o último recurso|ataca o inimigo mais perigoso|tenta proteger o que veio proteger}"),
 sprite:xl("está quase desregistrado e {usa tudo o que resta numa última ação|segue a última ordem do compilador|se apaga do nó em que estava}"),
 servo:xl("está quase desfeito e {usa tudo o que resta num último golpe|segue a última ordem do criador|fica de pé entre o inimigo e o criador até cair}"),
 espirito:xl("está quase desfeito e {usa tudo o que resta num último golpe|obedece ao último comando|se retira para o plano de origem}")};
