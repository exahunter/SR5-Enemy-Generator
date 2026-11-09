/* ===== v32: condutas por OCUPAÇÃO, PERSONALIDADE e ESPECIALIZAÇÃO (somam-se aos bancos de condutas-alta.js e condutas-baixa.js) =====
 * Mesmos formatos dos bancos originais. Afinidades novas:
 *   co / vo / tt         coordenação, volatilidade e tática do perfil (0–1) × coeficiente (logic/perfil-ocupacao.js)
 *   SOLD SEG POL ESC MERC GANG CRIM CULT CORP CIV SOMB CAC   tag da ocupação (+coeficiente se tiver)
 *   SMAGE SADEPT SDECK STECH SRIGGER SLIDER                  tag da especialização
 *   Eesquadrao, Ebando…  peso do estilo (E + nome do estilo) na personalidade
 *   traços novos         coordenado tatico volatil imprevisivel solitario obediente bravateiro pragmatico profissional
 * Soldado (SOLD, co e tt altos) → condutas de equipe, setores, rádio e ordem; membro de gangue (GANG, vo alto) → bando, provocação e improviso. */
CD_HI.h1.push(
xl("Entra por etapas: {limpa cômodo por cômodo|avança de uma porta à outra|toma um setor de cada vez} e só passa adiante quando o setor está seguro§tt2 co1 SOLD1.5 SEG1 Eesquadrao1.5 G.8 b.2§siege plan§charge noisy"),
xl("Segue o plano da missão: {cumpre os objetivos na ordem combinada|não improvisa sem ordem|volta ao plano a cada imprevisto} mesmo quando é tentador agir de outro jeito§tt2 co.8 SOLD1.5 profissional1.5 metodico1 disciplinado1 b.2§tech patient§dirty noisy"),
xl("Ataca em bando, sem plano: {todos de uma vez|cada um por um lado|gritando e atirando ao mesmo tempo} e deixa o resto ao acaso§vo2 GANG2 Ebando2 bravateiro1 impulsivo1 b.2§noisy burst§amb patient silent siege"),
xl("Muda de tática sem aviso: {começa de longe e de repente avança|troca de alvo a cada rodada|faz o contrário do que o grupo espera} só para manter o inimigo sem saber o que vem§vo2.5 imprevisivel2 volatil1.5 b.1§feint mobile§siege tech patient"),
xl("Emboscada de equipe: {divide os atiradores em dois lados|fecha o triângulo de fogo|sincroniza o primeiro tiro com o líder} e só abre fogo quando todos estão em posição§co2 tt1.5 G2 SOLD1 SEG.6 Eesquadrao1 b.1§amb sync§charge noisy burst"),
xl("Mostra força antes de atacar: {exibe as armas|grita as cores da gangue|chuta a porta e anuncia quem chegou} para fazer o inimigo recuar sem luta§GANG2 Ebando1.5 bravateiro1.5 vaidoso.6 sadico.4 b.1§noisy talk§amb silent patient"),
xl("Dá a voz de comando: {manda largar a arma e se deitar|dá o aviso formal de prisão|se identifica e manda parar} e só atira se for ignorado§POL2.5 SEG1 Epatrulheiro2 lei1.5 obediente1 honrado1 b.1§react talk§burst dirty charge"),
xl("Ritual de abertura: {faz uma oração coletiva|entoa o canto da seita|acende um símbolo e ataca} antes do primeiro golpe§CULT3 Ezelote2 fan1.5 devoto1 b.05§noisy§amb silent patient"),
xl("Reconhece antes de agir: {fica em posição de vigia|estuda o terreno|conta os inimigos e as saídas} e só então passa o que viu ao grupo§Ebatedor3 Esentinela2 stl1 tt1 b.05§recon patient§charge noisy burst"),
xl("Domina o ambiente: {fecha as saídas e mantém a calma|fala em voz baixa e firme|deixa o silêncio fazer o trabalho} e só ataca quando o alvo entende que perdeu§Echefao2 Einterrogador2 Eintimidador1.5 soc1 CRIM1 b.05§talk§noisy burst"),
xl("Apoio à distância: {fica atrás do grupo e conjura|lança feitiços por cima dos aliados|mantém a linha de visão para o grupo} e deixa o corpo a corpo para os outros§SMAGE2.5 mag1 far1 b.1§far supp§near charge"),
xl("Comanda a luta pela Matrix: {desliga as câmeras antes do primeiro tiro|abre as portas na hora certa|trava as armas inimigas} e só então a equipe entra§SDECK2 STECH2 Ehackerdecampo2 mtx1 co.5 b.05§tech supp§charge"),
xl("Fogo de {DR}: {põe os drones na frente|libera os drones em duas levas|usa os drones como isca} enquanto fica atrás da cobertura§SRIGGER3 Eenxame2 pil1 far.6 b.1§supp far§near charge"),
xl("Combate de adepto: {entra primeiro no corpo a corpo|é o primeiro a fechar a distância|usa a velocidade para chegar antes de todos}§SADEPT3 Eadeptoguardiao1 near1 b.1§near charge§far kite")
);
CD_HI.h2.push(
xl("Avança em lances: {um cobre enquanto o outro corre|alterna entre correr e atirar|nunca se move sem alguém cobrindo} até a posição seguinte§tt2 co1.5 G1.5 SOLD1.5 SEG.8 Eesquadrao1 b.2§adv duo§charge solo"),
xl("Mantém a formação: {fica a poucos passos dos aliados|move-se em cunha|segue a coluna sem abrir espaço} e não vai além do que o grupo cobre§co2 tt1 G1.5 obediente1 SEG1 b.2§tight§solo flank dash charge"),
xl("Corre sem rumo certo: {muda de direção a cada passo|corre de um lado para o outro|avança e recua sem pensar} deixando o inimigo sem saber onde mirar§vo2.5 imprevisivel2 volatil1.5 impulsivo1 b.1§dash mobile§hold tight patient"),
xl("Não sai da posição que recebeu: {segura o setor até receber outra ordem|fica no ponto combinado mesmo sob fogo|só se move quando mandam}§obediente2 co1 tt1 SEG1.5 SOLD1 b.2§hold§mobile dash flank charge"),
xl("Persegue por impulso: {sai atrás do primeiro que corre|abandona a cobertura para seguir um inimigo|corre atrás de quem o insultou}§vo2 GANG1.5 bravateiro1 impulsivo1.5 rancoroso.8 b.1§chase noisy§hold patient cover"),
xl("Planeja a retirada antes da entrada: {marca a rota de fuga|deixa o veículo ligado|define o ponto de encontro} e se move sempre em direção a ela; sem rota de fuga, {muda o plano e busca o ponto de encontro|fica no lugar e luta até abrir caminho}; com aliado ferido, {leva o aliado ferido até o ponto de encontro|deixa o aliado ferido no veículo}; com aliado importante ainda lutando, {segura o veículo até ele sair|adia a retirada enquanto ele estiver de pé}§tt1.5 Efugitivo2 CRIM1 SOMB1 pragmatico.8 b.2§pull cover§charge"),
xl("Cobre o setor do aliado: {olha para o lado que ele não vê|fica de costas para as costas dele|muda de posição para fechar o ângulo que ele abriu}§co2 G2 SEG1 SOLD1 b.1§duo sync§solo"),
xl("Desaparece da luta quando ela esquenta: {some pelo corredor|se esconde atrás de um veículo|vai para trás do grupo} e espera o resultado§pragmatico1.5 solitario1 SOMB1 CORP.8 ll1 b.1§hide pull§charge point")
);
CD_HI.h3.push(
xl("Divide os setores de tiro: {cada um cobre um ângulo|marca quem cuida de cada janela|confere a linha de fogo dos aliados} e só atira no seu§tt2 co1.5 G1.5 SOLD1.5 SEG1 Eesquadrao1 b.2§hard sector§expose burst"),
xl("Usa a cobertura de forma teatral: {chuta a mesa para virar escudo|pula atrás do carro com um grito|atira de pé e só abaixa quando erram}§GANG1.5 Ebando1 bravateiro1.5 vo1 b.1§expose burst§hard low"),
xl("Não fica parado: {troca de cobertura a cada rodada|nunca usa a mesma cobertura duas vezes|muda de lugar assim que é visto}§vo1.5 imprevisivel1.5 b.2§mobile dodge§hold terrain"),
xl("Cobertura de equipe: {abre fogo para os outros trocarem de posição|cobre quem se move|dá fogo de supressão no momento exato}§co2 tt1.5 G2 SOLD1 SEG.8 b.1§cfire burst§expose solo"),
xl("Barreira mágica: {ergue uma barreira entre o grupo e o inimigo|conjura uma proteção sobre os aliados|usa magia de proteção antes de qualquer tiro}§SMAGE3 Eguardiaomagico2 mag1 b.05§magic def§expose charge"),
xl("Cobertura pela Matrix: {zera os sensores inimigos|trava as miras eletrônicas|embaralha a visão deles}§SDECK2 STECH2 Ehackerdecampo2 mtx1 b.05§tech§expose")
);
CD_HI.h4.push(
xl("Segue a cadeia de comando: {espera a ordem do líder|executa a ordem sem discutir|repete a ordem e executa}§G2 N1.5 obediente1.5 SEG1.5 SOLD1.5 tt1 b.2§follow plan§solo"),
xl("Mantém comunicação constante: {anuncia posição e munição pelo rádio|avisa cada mudança de setor|diz quem caiu e quem avança} para o grupo agir junto§G2 co1.5 tt1 SOLD1.5 SEG1 coordenado1 b.2§radio sync§solo hide"),
xl("Cobre o parceiro: {escolhe um colega e nunca o perde de vista|forma dupla fixa|vigia o ponto cego do parceiro}§G2 co1.5 SOLD1 SEG1 leal.8 b.2§duo§solo"),
xl("Assume o ponto: {vai na frente abrindo caminho|serve de ponta de lança|entra primeiro para os outros}§G1 tt1 SOLD1 temerario.5 b.2§point§reserve hide"),
xl("Ataca por conta própria: {ignora o plano e sai atirando|decide sozinho quem atacar|age antes de o grupo entender o que está acontecendo}§vo2 GANG1.5 rebelde1.5 solitario1.5 b.1§solo§follow sync plan duo shield focus"),
xl("Segue o mais forte: {vai atrás de quem parece mandar|copia o que o chefe faz|troca de lado se o chefe cair}§GANG1.5 vo1 pragmatico.8 b.1§follow§solo lead"),
xl("Protege o protegido: {mantém o corpo entre ele e a ameaça|empurra o cliente para a saída|cobre o cliente com o próprio colete}§ESC4 Eescolta3 protetor1 leal1 b.05§shield§solo flank"),
xl("Dá comandos de equipe: {distribui as ordens por sinais|diz a cada um o que fazer|chama os setores pelo nome} e mantém todos juntos§lead2 SLIDER2 co1 tt1 G1.5 b.1§lead call sync§solo"),
xl("Usa o grupo como isca: {manda os outros na frente|deixa os aliados abertos e flanqueia|deixa um dos seus como distração}§oportunista1.5 pragmatico1 solitario.8 G1 ll1 b.1§bait§shield medic duo"),
xl("Cada um por si: {cada um decide o que fazer|ninguém espera ninguém|o grupo se espalha sem coordenação}§vo1.5 co-1.5 GANG1.5 b.05§solo§sync plan follow radio duo shield focus"),
xl("Aproveita o que o grupo abre: {entra depois do primeiro tiro dos aliados|espera os outros chamarem a atenção|rouba o momento em que o inimigo olha para outro lado}§G1 pragmatico1 solitario.6 b.1§reserve hide§point"),
xl("Obedece à hierarquia da organização: {só age quando o chefe manda|não age sem a palavra do chefe|passa a ordem adiante sem alterar} e não discute com ninguém acima dele§CRIM2 Eexecutor2 Echefao1 obediente1 G1.5 N1 b.1§follow§solo lead")
);
CD_HI.h5.push(
xl("Prioriza o alvo da missão: {foca o objetivo antes dos inimigos|ignora quem não atrapalha a missão|só gasta munição no que importa}§tt2 co.5 SOLD1.5 profissional1.5 b.2§obj tgt§"),
xl("Escolhe o alvo pela ordem do líder ou do plano e {ignora as provocações|não persegue os que fogem|não se distrai com os feridos}§tt1.5 obediente1 SOLD1 SEG1 b.2§tgt obj§"),
xl("Atira no que está mais perto, {sem escolher|sem ver quem é|e só então olha para o resto}§vo2 GANG1.5 Ebando1 impulsivo1 b.1§tgt noisy§obj patient"),
xl("Muda de alvo toda hora: {quem fez a última provocação|quem o enfrentou por último|quem tem a arma mais bonita}§vo2.5 imprevisivel1.5 bravateiro1 b.1§tgt§obj patient"),
xl("Divide o equipamento com o grupo: {pede o medkit emprestado|divide a munição com os aliados|passa carregadores para os colegas}§G1.5 co1.5 leal1 SOLD.8 b.2§res§"),
xl("Pede apoio logo cedo: {chama os reforços assim que a luta começa|abre o canal de rádio com a central|avisa a base antes do primeiro tiro}§SEG2 POL1 tt1 rf1.5 b.1§call§"),
xl("Quer ser visto: {faz questão de que todos vejam o golpe|ataca em plena luz para ser notado|deixa uma marca nos derrotados}§GANG1.5 Ebando1 bravateiro1.5 vaidoso1 sadico.5 b.05§noisy tgt§silent patient"),
xl("Cumpre a regra de engajamento: {usa só o necessário|desarma e entrega ao grupo|segue as ordens de não matar}§SEG1.5 POL1 obediente1 lei1 honrado1 b.1§nl§lethal sadico"),
xl("Procura o conjurador ou o decker dos inimigos: {corta as comunicações deles|mira em quem está com o deck|vai atrás do mago primeiro}§tt1.5 co.5 SOLD1 SEG.5 b.1§tgt tech§")
);
CD_LO.s1.push(
xl("avisa pelo rádio que está ferido e {pede cobertura ao parceiro|troca de posição com um aliado|recua um passo com apoio de quem está mais perto}§lm§call cover§§co2 SOLD1.5 SEG1 b.8"),
xl("continua o plano e {faz o que foi combinado|mantém o setor|executa a ordem mesmo ferido} sem mostrar alteração§lm§fight§§tt2 profissional1 obediente1 SOLD1 b.8"),
xl("dá um grito e {ataca o primeiro que vê|descarrega a arma na direção de qualquer coisa|joga uma garrafa no inimigo mais próximo}§lmd§rage§§vo2 GANG2 bravateiro1 b.4"),
xl("fica pálido e {olha para os lados procurando quem o apoie|chama pelo nome de um amigo|pergunta se alguém vai ajudar}§md§wary§§GANG1 vo1 ansioso1 b.4"),
xl("ri da dor e {continua em pé|segue o combate em silêncio|ergue a arma como se nada tivesse acontecido}§lmd§fight§§estoico1 bravateiro1.5 b.3"),
xl("pede ao líder para ser retirado e {espera a ordem|fica na posição até alguém substituí-lo|cede o lugar para o próximo da fila}§lm§call§§SOLD1.5 SEG1 obediente1 G1 b.4"),
xl("faz um cálculo rápido de custo e {troca de cobertura|usa um estimulante|guarda munição para a saída}§md§wary cover§§pragmatico2 calculista1 b.3"),
xl("muda de planos no meio da luta: {foge para outro lado|ataca o alvo errado|abandona o setor sem avisar}; sem rota de fuga, {fica e ataca o alvo errado|se esconde onde está}; com aliado ferido, {segue o próprio plano e esquece o aliado ferido|passa direto pelo aliado ferido}; com aliado importante ainda lutando, {segue o próprio plano mesmo assim|hesita uma rodada e só então sai}§md§slip§§vo2 imprevisivel1.5 GANG1 b.2")
);
CD_LO.s2.push(
xl("assume a formação de retirada: {cobre a saída dos companheiros|recua um por vez com os aliados|abre espaço no setor para os outros se reorganizarem}§l§ret§fight cover heal call swap wary§co2 tt1.5 SOLD1.5 SEG1 b1"),
xl("mantém o setor até receber ordem: {segura o ponto|fica no lugar|dá cobertura para quem for primeiro}§lm§hold§fight cover heal call rage swap§obediente1.5 co1 SEG1 SOLD1 b1"),
xl("sai da linha de fogo e {chama o médico da equipe|procura o aliado mais próximo|vai direto ao ponto de encontro}§lm§ret§fight cover heal call wary§co1.5 G1 b.8"),
xl("perde a cabeça e {investe contra o inimigo mais próximo|ataca sem olhar|grita e avança}§lmd§stand§fight cover heal call rage swap wary slip§vo2.5 GANG2 bravateiro1 b.3"),
xl("age por instinto: {foge de repente|se joga ao chão|corre para o lado errado}; sem rota de fuga, {se joga no chão|corre para o lado errado e acaba sem saída}; com aliado ferido, {tropeça no aliado ferido|esquece o aliado ferido}; com aliado importante ainda lutando, {segue o instinto, sem pensar nele|acaba perto dele sem querer}§md§flee§wary slip rage fight§vo2 imprevisivel2 b.2"),
xl("pergunta ao chefe o que fazer e {se o chefe cair, vai embora|se o chefe mandar fugir, foge primeiro|segue o último que ainda está de pé}; sem rota de fuga, {fica colado ao último aliado de pé|se abaixa e espera a ordem}; com aliado ferido, {segue o chefe e deixa o aliado ferido|fica com o aliado ferido se o chefe mandar}; com aliado importante ainda lutando, {só se mexe depois dele|faz o que ele fizer}§md§flee§call cover wary§GANG1.5 pragmatico1 b.3"),
xl("negocia com o inimigo: {pede um acordo|oferece a localização de algo em troca de ficar vivo|propõe que ambos parem}§md§sur§wary slip call§pragmatico1.5 oportunista1 b.2")
);
CD_LO.s3.push(
xl("mantém o setor até o último {minuto|tiro|respiro} para os outros saírem§l§last§stand shield hold ret§tt1 obediente1 SOLD1.5 SEG1 b1"),
xl("cobre a retirada do grupo em ordem e {só depois cai|só então se retira|deixa a arma para o próximo}§l§last§ret hold shield stand§co2 tt1.5 SOLD1.5 SEG1 b1"),
xl("perde o controle e {dispara em todas as direções|bate em qualquer um|joga tudo o que tem}§md§last§stand shield hold ret flee§vo2.5 GANG2 b.3"),
xl("dá meia-volta e {corre sem avisar ninguém|sai pelo lado oposto|abandona o setor}; sem rota de fuga, {para no meio do caminho e volta à cobertura|fica parado, sem atirar}; com aliado ferido, {passa pelo aliado ferido sem parar|leva o aliado ferido se estiver no caminho}; com aliado importante ainda lutando, {hesita e só então sai|sai mesmo assim, sem olhar para trás}§md§flee§stand shield hold ret flee turn§vo1.5 GANG1.5 pragmatico1 b.4"),
xl("vira o jogo no último segundo: {muda de lado|fecha um acordo|joga a arma e levanta as mãos}§d§turn§ret flee sur turn§imprevisivel1.5 pragmatico1 b.2")
);
