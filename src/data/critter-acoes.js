/* ===== v41: critters — condutas por HABILIDADE da ficha e ligação das condutas com as AÇÕES do livro (actions.xml) =====
 * Lido por logic/critter-condutas.js. Só entra conduta de uma habilidade que o critter realmente tem em c.sk (as perícias do critters.xml).
 * Sem falas nem dicas de roleplay: só comportamento. {a|b|c} sorteia variante. Nomes de ação iguais ao <name> do actions.xml (ACO, data/acoes.json);
 * ação de livro desmarcado, ou que não existe no actions.xml carregado, some em silêncio (okSrc).
 *
 * CC_SK_H  (vida alta, ocupa a 2ª ou a 3ª conduta):  [habilidades "A|B", texto, [ações], peso, [temperamentos que NÃO usam]]
 * CC_SK_L  (vida baixa, passo 2, sem fuga):           [habilidades "A|B", texto (minúsculo, vem depois de "Com N de M caixas…: "), [ações], [temperamentos que NÃO usam]]
 *   Habilidades raras pesam mais que Perception e Unarmed Combat, que quase todo critter tem.
 *   Texto de recuo aqui é reposicionamento tático (a fuga de verdade é CC_FUGA, que traz os três desfechos: sem rota, aliado ferido, aliado importante).
 * CCR: [regex sobre o texto em minúsculas, [ações], parar?]; usado nas condutas que não vêm de uma habilidade (abordagem, terreno, poder, vida baixa).
 *   Cada regra acha a posição em que aparece no texto; as ações saem na ordem do texto, no máximo 2. "parar" (3º item) encerra a busca nessa regra. */
const CC_SK_H=[
 ["Perception",xl("Mantém a atenção em todo o campo: {observa o grupo inteiro antes do primeiro golpe|procura quem tenta flanquear|mede a distância até cada alvo} e troca de alvo quando percebe uma ameaça maior"),["Observe in Detail"],.6,[]],
 ["Perception",xl("Vigia as bordas da luta: {reage ao que acontece atrás dele|percebe quem recua ou se esconde|nota o inimigo que tenta cercá-lo} antes de se comprometer com um alvo"),["Shift Perception"],.5,[]],
 ["Unarmed Combat",xl("Luta no corpo a corpo com os ataques naturais: {golpeia o mesmo alvo até ele cair|troca de alvo a cada golpe|escolhe o inimigo que mais o fere}"),["Melee Attack"],.7,["presa"]],
 ["Unarmed Combat",xl("Agarra e imobiliza: {derruba o alvo no chão|o prende com o corpo|o mantém junto de si enquanto o grupo ataca} e só o solta quando outro inimigo o ameaça"),["Subduing","Clinch"],.9,["presa"]],
 ["Unarmed Combat",xl("Empurra o inimigo para {fora da cobertura|um espaço aberto|longe dos aliados} antes de golpeá-lo"),["Shove","Melee Attack"],.5,["presa"]],
 ["Sneaking",xl("Se aproxima sem ser notado: {pelo lado contrário ao do vento|pelas sombras|pelos pontos cegos do grupo} e só se mostra quando já está ao alcance"),["Use Skill","Take Cover"],1.4,[]],
 ["Sneaking",xl("Some da vista depois de atacar: {muda de esconderijo|volta ao escuro|se mistura ao ambiente} e reaparece em outro ponto"),["Take Cover","Use Skill"],1.2,[]],
 ["Assensing",xl("Escolhe o alvo pela aura: {o mais fraco fisicamente|quem usa magia|quem está mais assustado} e ignora quem não se destaca no astral"),["Assense"],1.1,[]],
 ["Astral Combat",xl("Luta também no plano astral: {ataca a aura do alvo|acompanha quem tenta se afastar pelo astral|ataca quem está distraído com o plano físico}"),["Melee Attack"],1.1,[]],
 ["Gymnastics",xl("Se reposiciona sem parar: {salta sobre obstáculos|passa por baixo do inimigo|gira em volta do alvo} e dificulta o golpe do inimigo"),["Evade","Dodge"],1.4,[]],
 ["Gymnastics",xl("Levanta-se no mesmo instante depois de ser derrubado: {rola e volta à luta|se ergue num pulo|usa o impulso para atacar}"),["Kip-Up","Stand Up"],.9,[]],
 ["Running",xl("Corre em volta do campo de batalha: {ataca de passagem|corta o caminho de quem tenta fugir|chega ao alvo antes de ser notado}"),["Sprint","Run"],1.3,[]],
 ["Intimidation",xl("Intimida durante a luta: {ruge para o inimigo que lidera|se mostra maior para quem hesita|encara quem mais fere o bando} e aproveita o recuo que isso provoca"),["Use Skill"],1.3,["presa"]],
 ["Tracking",xl("Segue o rastro de quem sai da luta: {o cheiro do sangue|as marcas no chão|o som dos passos} e ignora quem não deixa vestígio"),["Use Skill","Observe in Detail"],1.2,["presa"]],
 ["Flight",xl("Controla o voo para escolher o ângulo: {passa baixo e sobe|mergulha pelas costas do alvo|gira acima do grupo antes de descer}"),["Melee Attack","Evade"],1.2,[]],
 ["Swimming|Diving",xl("Usa a água a seu favor: {puxa o alvo para o fundo|ataca de baixo|some debaixo d'água e reaparece longe}"),["Use Skill"],1.2,[]],
 ["Counterspelling",xl("Protege os aliados contra a magia: {dissipa o feitiço mais perigoso|corta o efeito sobre o aliado|ataca quem sustenta o feitiço}"),["Dispelling"],1.2,[]],
 ["Spellcasting|Ritual Spellcasting",xl("Lança feitiços de combate: {no alvo mais próximo|no alvo que já está ferido|em quem protege o conjurador}"),["Cast Spell (Indirect, Single-target Combat)","Cast Spell (Direct, Physical Combat)"],1.2,[]],
 ["Con|Impersonation|Disguise",xl("Se faz de inofensivo ou de ferido: {espera o inimigo se aproximar|baixa a guarda do grupo|atrai o alvo para longe dos aliados} e só então ataca"),["Playing Possum (Con)","Use Skill"],1.2,[]],
 ["Negotiation|Etiquette",xl("Abre a luta tentando negociar: {propõe um acordo|exige algo em troca|oferece uma saída} e só ataca se o inimigo recusa"),["Use Skill"],1,["presa"]],
 ["Leadership",xl("Comanda quem está por perto: {dá ordens ao bando|marca o alvo prioritário|reorganiza os aliados} e ataca depois de ver o efeito"),["Speak/Text/Transmit Phrase","Use Skill"],1.2,[]],
 ["Clubs|Blades",xl("Luta com a arma que carrega: {golpeia o alvo mais próximo|alterna golpes altos e baixos|usa o alcance da arma para manter distância}"),["Melee Attack"],.9,[]],
 ["Throwing Weapons",xl("Arremessa o que tem à mão: {pedras|lanças|objetos pesados} contra {quem está longe|quem se esconde|quem ajuda os feridos}"),["Throw Weapon (Non-Grenade)"],1.1,[]],
 ["Pistols|Automatics|Longarms",xl("Usa armas de fogo: {dispara em tiros únicos|dispara rajadas curtas|mira antes de atirar} de {uma cobertura|uma posição elevada|um canto escuro}"),["Fire Single-Shot","Fire Burst Fire"],1,[]],
 ["Archery",xl("Atira com o arco a partir de {uma cobertura|uma posição elevada|um canto escuro} e {muda de lugar entre as flechas|escolhe quem está sem cobertura}"),["Fire Bow"],1,[]],
 ["Exotic Ranged Weapon",xl("Ataca de longe com o ataque à distância: {mantém a distância ideal|muda de posição entre os disparos|escolhe quem está sem cobertura}"),["Fire Single-Shot"],1.2,[]],
 ["Hacking",xl("Abre a luta pela Matrix: {invade o dispositivo mais próximo|toma um aparelho do grupo|sabota o equipamento do inimigo} e só depois ataca"),["Hack on the Fly (1 Mark)","Spoof Command"],1.2,[]],
 ["Cybercombat",xl("Ataca o ícone do alvo: {derruba o programa que ele usa|fere o ícone mais fraco|insiste no mesmo ícone}"),["Data Spike","Crash Program"],1.2,[]],
 ["Electronic Warfare",xl("Controla os sinais: {corta a comunicação do grupo|esconde o próprio ícone|escuta o que o inimigo transmite}"),["Jam Signals","Hide"],1.1,[]],
 ["Computer",xl("Procura e usa dados do ambiente: {rastreia o ícone do inimigo|lê arquivos do alvo|reinicia dispositivos que atrapalham}"),["Matrix Perception","Trace Icon"],1,[]],
 ["Software",xl("Prepara armadilhas de dados: {planta uma bomba de dados|desarma a bomba que o inimigo plantou|corrompe o programa do alvo}"),["Set Data Bomb","Disarm Data Bomb"],.9,[]],
 ["Escape Artist",xl("Se solta de qualquer prisão: {desliza para fora do agarrão|usa o próprio peso para escapar|torce o corpo até o inimigo largar} e volta a atacar"),["Escape (Subduing)","Escape (Clinch)"],1,[]],
 ["First Aid",xl("Cuida de um aliado entre um ataque e outro: {estanca o ferimento|o arrasta para trás de um abrigo|o mantém de pé} sem sair da luta"),["Use Skill"],1,[]],
 ["Pilot Ground Craft|Pilot Watercraft|Pilot Aircraft",xl("Usa o veículo como arma: {avança sobre o grupo|fecha o caminho do inimigo|corta a saída da cobertura}"),["Ramming","Control Vehicle"],1,[]]];
const CC_SK_L=[
 ["Sneaking",xl("some para a sombra mais próxima e {espera uma abertura|reaparece em outro ponto|observa quem o feriu}"),["Take Cover","Use Skill"],[]],
 ["Gymnastics",xl("se reposiciona em movimento: {salta para um ponto alto|passa por baixo do inimigo|se joga atrás de um obstáculo} e ganha tempo"),["Evade","Take Cover"],[]],
 ["Running",xl("dá a volta correndo e {ataca por outro lado|ganha distância antes de voltar|chega às costas do inimigo mais próximo}"),["Run","Melee Attack"],[]],
 ["Intimidation",xl("ruge para ganhar tempo e {mantém o inimigo parado|faz o grupo hesitar|volta ao ataque no mesmo golpe}"),["Use Skill"],["presa"]],
 ["Perception",xl("avalia quem ainda é ameaça e {muda para o alvo mais perigoso|escolhe o mais fraco|espera o inimigo se expor}"),["Observe in Detail"],[]],
 ["Unarmed Combat",xl("agarra o inimigo mais próximo e {o usa como escudo|o mantém preso|o arrasta para um canto} enquanto recupera o fôlego"),["Subduing"],["presa"]],
 ["Con|Impersonation",xl("se faz de mais ferido do que está e {espera o inimigo chegar perto|tenta sair do alcance|ataca quando ele baixa a guarda}"),["Playing Possum (Con)"],[]],
 ["Flight",xl("sobe para fora do alcance e {espera o inimigo gastar a munição|escolhe outro alvo|volta num mergulho}"),["Evade","Melee Attack"],[]],
 ["Swimming|Diving",xl("mergulha e {reaparece longe|espera o inimigo perder o alvo|volta por baixo}"),["Use Skill"],[]],
 ["Hacking|Electronic Warfare|Computer",xl("se esconde na Matrix e {espera o inimigo baixar a guarda|volta por outro dispositivo|observa o que o grupo faz}"),["Hide","Matrix Perception"],[]],
 ["Counterspelling|Spellcasting",xl("se protege com magia e {dissipa o que o atinge|devolve o efeito ao conjurador|volta ao ataque}"),["Dispelling","Cast Spell (Indirect, Single-target Combat)"],[]],
 ["Assensing|Astral Combat",xl("passa para o astral e {observa quem o feriu|ataca quem está distraído|espera a aura do inimigo enfraquecer}"),["Assense"],[]],
 ["Tracking",xl("fareja quem o feriu e {segue o rastro|espera o momento certo|ataca o mais fraco}"),["Use Skill"],["presa"]]];
const CCR=[
 [/prende o alvo|imobilizado|puxando|agarra/,["Subduing","Clinch"],1],
 [/ataque elemental|de longe/,["Fire Single-Shot"],1],
 [/intimida/,["Use Skill"]],
 [/defende(r)? (a [áa]rea|o territ)|fica de guarda|barra |impede (o )?de chegar|fica entre|entre o alvo|proteger|protege (quem|algo|o que)/,["Intercept"]],
 [/atira o que/,["Throw Weapon (Non-Grenade)"]],
 [/tirar algu[ée]m da luta/,["Shove"]],
 [/arranca objetos|derruba m[óo]veis|usa o que sobrou/,["Pick Up / Put Down"]],
 [/observa|avalia|conta os inimigos|olha as armas|fica de olho|pelo sentido mais apurado|procura os alvos/,["Observe in Detail"]],
 [/rolando no ch[ãa]o|se enrola/,["Drop Prone"]],
 [/se rende/,["Drop Object"]],
 [/negocia/,["Use Skill"]],
 [/foge|sair da luta|fugir/,["Sprint"]],
 [/\bcorre\b|correndo|desloca-se|passa por onde|passa por tr[áa]s|se afasta do centro|volta ao ponto de origem|chegar a um ponto|se retira|segue o que ficou|o segue pelo|(?<!sem )recua(?!r)/,["Run"]],
 [/se esconde(?!r)|esconderijo|cobertura|obst[áa]culos|parede|escuro|\bsome\b|esconder o corpo|campo aberto|im[óo]vel|fica parado|espera o barulho/,["Take Cover"]],
 [/ataca|morde|investe|golpe|avan[çc]a|derrub|salta|cai de cima|mergulha|insiste|mant[ée]m ocupada|enfrenta|arranhando|cumpre o servi[çc]o|continua (a|o) |vai at[ée] o fim|[úu]ltimo (recurso|golpe)|fere\b|ferir/,["Melee Attack"]]];
