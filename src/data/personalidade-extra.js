/* ===== v32: mais personalidades =====
 * Acrescenta estilos e traços às tabelas de data/personalidade.js (ESTILO, TRACO) e de data/taticas.js (ST_GRP, TAT_ST, TAT_TR, TR_AFF).
 * Mesmos campos das tabelas originais (veja o comentário no topo de data/personalidade.js). Para ajustar, edite só aqui. */
Object.assign(ESTILO,{
 duelista:{n:'Duelista (pistola pesada)',sk:['Pistols'],wk:'f',wp:/Pistols/,wc:'Heavy Pistols',at:['AGI','WIL','REA'],ap:['Gymnastics','Perception','Intimidation','Etiquette'],w:.6,
  pa:{'Laser Sight':.3,'Quick-Draw Holster':.4,'Smartgun System, Internal':.2},ar:'discreta',im:[['Smartlink|Cybereyes',2],['Reaction Enhancers|Wired Reflexes',2]],pf:'soldado',spc:'Revolvers',
  qp:{Sharpshooter:1.5,Ambidextrous:1},kn:['Gun Manufacturers'],pec:[xl('Só saca depois de dar o aviso'),xl('Mede o adversário antes de qualquer tiro'),xl('Faz questão de que o outro atire primeiro')],d:xl('duela de pistola pesada e investe em um único modelo')},
 sentinela:{n:'Sentinela',sk:['Perception'],wk:'f',wp:/Submachine|Machine Pistols|Shotguns|Pistols/,wc:'Submachine Guns|Light Pistols',at:['INT','REA','BOD'],ap:['Gymnastics','Intimidation','Sneaking','Running'],w:.7,
  pa:{'Flashlight, Standard':.35,'Foregrip':.2},pg:[['Flashlight',.5],['Binoculars',.3]],ar:'tatica',im:[['Smartlink|Cybereyes',1.5]],pf:'soldado',spc:'Visual',
  qp:{Observant:1.5},kn:['Security Procedures'],pec:[xl('Faz a ronda no mesmo horário todos os dias'),xl('Apaga a luz antes de abrir a porta'),xl('Bate no capacete para ver se ainda está firme')],d:xl('vigia posições e investe em lanterna, sensores e armadura tática')},
 assaltante:{n:xl('Assaltante (invasão)'),sk:['Automatics'],wk:'f',wp:/Machine Pistols|Submachine|Shotguns/,wc:'Machine Pistols|Submachine Guns',at:['AGI','REA','BOD'],ap:['Gymnastics','Running','Unarmed Combat','Perception'],w:.7,
  pa:{'Foregrip':.3,'Laser Sight':.3},ar:'tatica',im:[['Muscle|Bone Lacing',1.5],['Reaction Enhancers|Wired Reflexes',2]],pf:'soldado',spc:'Submachine Guns',
  qp:{Toughness:1.2,Guts:1},kn:['Building Layouts'],pec:[xl('Conta os segundos em voz alta antes de entrar'),xl('Entra sempre pela porta, nunca pela janela'),xl('Usa a coronha para abrir caminho')],d:xl('entra primeiro, perto e rápido, com arma curta automática')},
 faqueiro:{n:xl('Faqueiro (lâmina curta)'),sk:['Blades'],wk:'m',wp:/Blades/,wc:'Blades',at:['AGI','REA','STR'],ap:['Sneaking','Palming','Gymnastics','Unarmed Combat'],w:.6,
  ar:'discreta',im:[['Muscle|Bone Lacing|Dermal',1.2]],pf:'furtivo',spc:'Knives',qp:{Ambidextrous:1.5},kn:['Street Law'],
  pec:[xl('Afia a lâmina em toda pausa'),xl('Corta fruta só para exibir o fio'),xl('Nunca deixa a faca longe da mão')],d:xl('trabalha de perto com lâmina curta e prefere passar despercebido')},
 protetor:{n:'Protetor (escolta)',sk:['Perception'],wk:'f',wp:/Pistols|Submachine|Machine Pistols/,wc:'Light Pistols|Machine Pistols',at:['REA','BOD','INT'],ap:['Intimidation','Unarmed Combat','Gymnastics','Etiquette'],w:.6,
  pg:[['Earbuds',.4],['Micro-Transceiver',.4]],ar:'discreta',im:[['Reaction Enhancers|Wired Reflexes',1.6],['Dermal|Bone Lacing',1.2]],pf:'soldado',spc:'Visual',
  qp:{Toughness:1.5,Guts:1},kn:['Security Procedures'],pec:[xl('Posiciona-se sempre entre o cliente e a porta'),xl('Olha as mãos de quem se aproxima'),xl('Não bebe em serviço nem a água do cliente')],d:xl('vive para manter alguém vivo e investe em reflexos e rádio')},
 interrogador:{n:'Interrogador',sk:['Intimidation'],wk:'',at:['WIL','CHA','LOG'],ap:['Etiquette','Negotiation','Perception','Con'],w:.6,
  pg:[['Restraint, Plastic',.4,0]],ar:'discreta',pf:'face',spc:'Interrogation',qp:{'Better to be Feared Than Loved':1.5},kn:['Criminal Gossip'],
  pec:[xl('Faz um silêncio longo depois de cada resposta'),xl('Nunca levanta a voz'),xl('Guarda a pergunta mais importante para o fim')],d:xl('extrai informação com paciência e pressão, sem pressa de lutar')},
 sobrevivente:{n:'Sobrevivente (campo aberto)',sk:['Survival'],wk:'f',wp:/Rifles|Shotguns|Pistols/,wc:'Sporting Rifles|Shotguns',at:['BOD','WIL','INT'],ap:['Tracking','Navigation','Sneaking','Perception'],w:.5,
  pa:{'Imaging Scope':.2},pg:[['Binoculars',.4],['Medkit',.45,1]],ar:'leve',pf:'investigador',spc:'Urban',qp:{Toughness:1.5,'Natural Hardening':1},kn:['Back Alleys'],
  pec:[xl('Guarda tudo o que pode ser reaproveitado'),xl('Dorme de olhos entreabertos'),xl('Conhece o caminho da água em qualquer bairro')],d:xl('se vira com pouco, em qualquer terreno, e carrega o que precisa')},
 manipulador:{n:xl('Manipulador (magia mental)'),sk:['Spellcasting'],req:['Mage'],sc:['Manipulation','Illusion'],at:['LOG','WIL','CHA'],ap:['Counterspelling','Assensing','Con'],w:.7,
  ar:'leve',pf:'civil',spc:'Manipulation',qp:{},kn:['Magical Theory'],pec:[xl('Faz gestos com as mãos mesmo sem conjurar'),xl('Evita olhar nos olhos de quem enfeitiça')],d:xl('prefere feitiços de manipulação e ilusão a causar dano')}
});
Object.assign(ST_GRP,{duelista:'fogo',sentinela:'fogo',assaltante:'fogo',faqueiro:'corpo',protetor:'fogo',interrogador:'social',sobrevivente:'furtivo',manipulador:'magia'});
Object.assign(TAT_ST,{
 duelista:{o:xl('Mira em um adversário só e dá a ele a chance de recuar antes do primeiro tiro.')},
 sentinela:{o:xl('Ocupa o ponto de vigia e deixa a ameaça entrar na área que ele controla.')},
 assaltante:{o:xl('Entra rápido, perto e barulhento para quebrar a linha de defesa antes de ela se formar.')},
 faqueiro:{o:xl('Chega pelo ponto cego e resolve a distância curta antes de o alvo reagir.')},
 protetor:{o:xl('Põe o corpo entre a ameaça e quem protege e só depois pensa em atacar.')},
 interrogador:{o:xl('Prefere capturar e conversar; usa o medo e o silêncio antes da arma.')},
 sobrevivente:{o:xl('Usa o terreno, a paciência e o que tiver à mão; não gasta nada além do necessário.')},
 manipulador:{o:xl('Prefere dobrar a vontade do inimigo a derrubá-lo; só fere quando não tem outro jeito.')}});
/* afinidade grupo de estilo → traço (os novos traços usam 1 quando não citados) */
Object.assign(TR_AFF.fogo,{disciplinado:1.4,estoico:1.3,frio:1.2,rebelde:.6});
Object.assign(TR_AFF.corpo,{temerario:1.6,orgulhoso:1.3,teimoso:1.2,gentil:.4});
Object.assign(TR_AFF.social,{brincalhao:1.4,cinico:1.3,oportunista:1.3,calculista:1.2,estoico:.7});
Object.assign(TR_AFF.furtivo,{calculista:1.4,frio:1.3,curioso:1.2,temerario:.4,orgulhoso:.6});
Object.assign(TR_AFF.tecnico,{curioso:1.6,calculista:1.3,ansioso:1.1,temerario:.5});
Object.assign(TR_AFF.matrix,{curioso:1.5,calculista:1.4,cinico:1.2,temerario:.6});
Object.assign(TR_AFF.magia,{supersticioso:1.6,curioso:1.3,devoto:1.2,disciplinado:.7});
Object.assign(TR_AFF.piloto,{temerario:1.5,brincalhao:1.2,disciplinado:.8});
/* ---------- traços novos ---------- */
Object.assign(TRACO,{
 estoico:{n:'Estoico',c:['ansioso','impulsivo'],gw:{'Militar e caça':1.3,'Segurança e lei':1.2},up:1,acc:0,bv:.85,rd:.2,rf:1,
  pq:{Guts:1.5,'Natural Hardening':1},pec:[xl('Não muda de expressão nem quando é ferido'),xl('Responde a gritos com um aceno de cabeça')],mot:[xl('Faz o que precisa ser feito e não reclama')]},
 ansioso:{n:'Ansioso',c:['estoico','temerario'],gw:{Civis:1.4,'Corporativo e ciência':1.2},up:.9,acc:0,bv:.3,rd:1.4,rf:1.3,
  nq:{'Poor Self Control (Combat Paralysis)':1.5,Paranoia:.6},pec:[xl('Rói as unhas até no meio do trabalho'),xl('Confere o celular a cada trinta segundos')],mot:[xl('Só quer que tudo isso acabe sem ninguém se ferir')]},
 brincalhao:{n:xl('Brincalhão'),c:['sombrio','frio'],gw:{'Rua e crime':1.2,Sombras:1.2},up:1,acc:0,bv:.6,rf:.9,at:['CHA'],
  pq:{Lucky:1},nq:{'Prank Warrior':1.5},pec:[xl('Faz piada até no meio do tiroteio'),xl('Dá apelido ridículo a todos os inimigos')],mot:[xl('Acha que rir é o melhor jeito de sobreviver')]},
 sombrio:{n:'Sombrio',c:['brincalhao','idealista'],gw:{'Sombras':1.2,'Militar e caça':1.1},up:1,acc:0,bv:.75,rd:.4,rf:.8,
  pec:[xl('Fala do próprio fim como se fosse certo'),xl('Só aparece nas fotos de costas')],mot:[xl('Já perdeu tanto que não tem medo de perder o resto')]},
 orgulhoso:{n:'Orgulhoso',c:['covarde','oportunista'],gw:{'Militar e caça':1.3,'Corporativo e ciência':1.1,'Rua e crime':1.1},up:1.1,acc:0,bv:.8,rd:.15,rf:.6,
  nq:{'Poor Self Control (Braggart)':1.5,'Code of Honor: Avenging Angel':.5},pec:[xl('Nunca pede ajuda, nem quando precisa'),xl('Corrige quem erra o próprio nome')],mot:[xl('Não aceita ser visto recuando')]},
 curioso:{n:'Curioso',c:['frio','disciplinado'],gw:{Sombras:1.3,'Corporativo e ciência':1.2},up:1.1,acc:1,bv:.55,rf:.9,at:['INT'],
  g:[['Camera, Micro',.3],['Binoculars',.3]],pq:{Gearhead:.8,Observant:1},pec:[xl('Abre o que não devia só para ver o que tem dentro'),xl('Para no meio da luta para olhar um objeto estranho')],mot:[xl('Quer descobrir o que está por trás de tudo isso')]},
 rancoroso:{n:'Rancoroso',c:['gentil','idealista'],gw:{'Rua e crime':1.3,'Segurança e lei':1},up:1,acc:0,bv:.75,rd:.4,rf:.8,
  nq:{'Poor Self Control (Vindictive)':2,'Bad Rep':.8},pec:[xl('Guarda a lista de quem o ofendeu'),xl('Nunca esquece um rosto')],mot:[xl('Ainda cobra um acerto de contas antigo')]},
 supersticioso:{n:'Supersticioso',c:['metodico','frio'],gw:{Civis:1.2,'Rua e crime':1.2,Sombras:1.1},up:.9,acc:0,bv:.5,rf:1,
  nq:{'Poor Self Control (Superstition)':1.5},pec:[xl('Toca num amuleto antes de cada passo importante'),xl('Nunca entra num prédio pelo lado esquerdo')],mot:[xl('Acredita que a sorte já escolheu um lado')]},
 devoto:{n:'Devoto',c:['cinico','oportunista'],gw:{Civis:1.2,'Militar e caça':1.1,'Rua e crime':1},up:1,acc:0,bv:.75,rd:.3,rf:.9,
  pq:{Guts:1},pec:[xl('Reza em voz baixa antes de agir'),xl('Beija um símbolo de fé pendurado no pescoço')],mot:[xl('Acredita que o resultado já está nas mãos de algo maior')]},
 oportunista:{n:'Oportunista',c:['leal','honrado','orgulhoso','devoto'],gw:{Sombras:1.5,'Rua e crime':1.2,'Corporativo e ciência':1.2},up:1,acc:0,bv:.45,rd:1.6,rf:.9,
  pq:{Closer:1},nq:{'Information Auctioneer':1,'Bad Rep':.8},pec:[xl('Sempre sabe a saída e a oferta mais alta'),xl('Troca de lado com um sorriso e sem culpa')],mot:[xl('Fica do lado de quem estiver ganhando')]},
 protetor:{n:'Protetor',c:['covarde','ganancioso','sadico','oportunista'],gw:{'Segurança e lei':1.3,Civis:1.1,'Militar e caça':1.1},up:1,acc:0,bv:.8,rd:.2,rf:1.2,
  pq:{Guts:1.2},nq:{'No Man Left Behind':1.5},pec:[xl('Conta os civis presentes antes de qualquer outra coisa'),xl('Avança primeiro para os outros não precisarem')],mot:[xl('Não suporta ver quem é mais fraco ser ferido')]},
 calculista:{n:'Calculista',c:['impulsivo','temerario'],gw:{'Corporativo e ciência':1.4,Sombras:1.3},up:1.2,acc:1,bv:.55,rd:1,rf:1.1,at:['LOG'],
  pq:{'Analytical Mind':1.5,'Photographic Memory':.8},pec:[xl('Calcula as chances em voz baixa antes de agir'),xl('Anota quanto cada decisão custou')],mot:[xl('Só entra em luta quando as contas fecham')]},
 temerario:{n:xl('Temerário'),c:['cauteloso','covarde','ansioso','calculista'],gw:{'Rua e crime':1.3,'Militar e caça':1.2},up:1,acc:0,bv:.9,rd:0,rf:.5,at:['AGI'],
  pq:{Daredevil:2,Guts:1},nq:{'Poor Self Control (Thrill Seeker)':2,'Leeeeeeeroy Jenkins':1.5},pec:[xl('Escolhe sempre o caminho mais perigoso'),xl('Ri quando o risco aumenta')],mot:[xl('Só se sente vivo quando está perto do fim')]},
 cinico:{n:xl('Cínico'),c:['idealista','devoto'],gw:{Sombras:1.3,'Segurança e lei':1.2,'Corporativo e ciência':1.1},up:1,acc:0,bv:.55,rd:1.2,rf:1,
  pec:[xl('Responde a tudo com sarcasmo'),xl('Diz que já viu esse filme antes')],mot:[xl('Não acredita em ninguém, mas aceita o pagamento')]},
 idealista:{n:'Idealista',c:['cinico','ganancioso','oportunista','sombrio'],gw:{Civis:1.2,'Segurança e lei':1.1},up:1,acc:0,bv:.8,rd:.2,rf:1.1,
  pq:{Guts:1},pec:[xl('Faz discursos curtos sobre o que é certo'),xl('Acredita que sempre existe um jeito justo')],mot:[xl('Luta por algo em que realmente acredita')]},
 disciplinado:{n:'Disciplinado',c:['rebelde','impulsivo','curioso'],gw:{'Militar e caça':1.5,'Segurança e lei':1.3,'Corporativo e ciência':1.1},up:1.15,acc:1,bv:.7,rd:.4,rf:1.4,arh:.15,arp:.1,
  pq:{'Analytical Mind':.8,Guts:1},pec:[xl('Obedece à ordem mesmo quando discorda'),xl('Mantém o uniforme impecável até no meio da luta')],mot:[xl('Cumpre a missão exatamente como foi dada')]},
 rebelde:{n:'Rebelde',c:['disciplinado','leal'],gw:{'Rua e crime':1.3,Sombras:1.2,Civis:1.1},up:1,acc:0,bv:.6,rd:.7,rf:.6,
  nq:{'Poor Self Control (Combat Monster)':.5,'Bad Rep':1},pec:[xl('Faz o contrário do que mandam só para provar'),xl('Desconfia de qualquer autoridade')],mot:[xl('Não aceita receber ordens de ninguém')]},
 frio:{n:'Frio',c:['brincalhao','impulsivo','supersticioso','curioso'],gw:{Sombras:1.3,'Militar e caça':1.2,'Segurança e lei':1},up:1.1,acc:1,bv:.75,rd:.3,rf:.9,
  pq:{'Analytical Mind':1},pec:[xl('Fala sempre no mesmo tom, qualquer que seja a situação'),xl('Nunca explica o que pretende fazer')],mot:[xl('Trata cada trabalho como uma tarefa e mais nada')]},
 gentil:{n:'Gentil',c:['sadico','agressivo','rancoroso'],gw:{Civis:1.4,'Segurança e lei':1},up:1,acc:0,bv:.45,rd:1.3,rf:1.2,
  pq:{'Natural Leader':.5},pec:[xl('Pede desculpa até a quem está apontando a arma'),xl('Oferece ajuda a quem acabou de ferir')],mot:[xl('Não quer machucar ninguém, mesmo no pior dia')]},
 teimoso:{n:'Teimoso',c:['oportunista'],gw:{'Rua e crime':1.1,'Militar e caça':1.1,Civis:1.1},up:.9,acc:0,bv:.75,rd:.3,rf:.7,
  pec:[xl('Mantém o plano mesmo depois de ele falhar'),xl('Repete a mesma tática até funcionar')],mot:[xl('Não larga uma decisão depois de tomada')]},
 exausto:{n:'Exausto',c:['temerario','fanatico'],gw:{'Segurança e lei':1.3,Civis:1.2,'Corporativo e ciência':1.1},up:.8,acc:-1,bv:.35,rd:1.5,rf:1.2,
  pec:[xl('Boceja nos momentos mais tensos'),xl('Pergunta quanto falta para o fim do turno')],mot:[xl('Só quer ir para casa e dormir')]},
 competitivo:{n:'Competitivo',c:['leal'],gw:{'Rua e crime':1.2,'Militar e caça':1.2,Sombras:1.1},up:1.1,acc:0,bv:.75,rd:.3,rf:.7,
  pq:{'Natural Leader':.5},nq:{'Poor Self Control (Braggart)':1},pec:[xl('Conta quantos alvos derrubou a mais que os colegas'),xl('Aposta com os colegas até no meio da missão')],mot:[xl('Precisa provar que é o melhor do grupo')]}
});
/* postura, uso do Edge e multiplicadores dos novos traços */
Object.assign(TAT_TR,{
 estoico:{p:xl('Mantém o ritmo mesmo ferido; não muda de plano por pânico nem por provocação.'),e:xl('Guarda Edge para o momento em que o grupo realmente precisa.')},
 ansioso:{p:xl('Hesita antes de agir e procura confirmação; cede ao medo ao primeiro ferimento sério.'),e:xl('Gasta Edge cedo para evitar dano, antes de saber se era preciso.')},
 brincalhao:{p:xl('Provoca e faz piada para quebrar o ritmo do inimigo e do próprio grupo.'),e:xl('Gasta Edge em jogadas ousadas só para ver o resultado.')},
 sombrio:{p:xl('Age como se o pior já tivesse acontecido; não se poupa e pouco recua.'),e:xl('Raramente gasta Edge; prefere aceitar o resultado.')},
 orgulhoso:{p:xl('Não recua primeiro nem pede ajuda; reage mal a qualquer humilhação.'),e:xl('Gasta Edge para vencer um duelo pessoal, não para fugir.')},
 curioso:{p:xl('Se distrai com tudo o que é novo; investiga antes de agir.'),e:xl('Gasta Edge para tirar proveito de algo que acabou de descobrir.')},
 rancoroso:{p:xl('Escolhe um alvo de ódio e o persegue, mesmo quando é arriscado.'),e:xl('Gasta Edge para terminar o serviço contra quem o ofendeu.')},
 supersticioso:{p:xl('Segue rituais antes de agir e recusa o que lhe parece azar.'),e:xl('Gasta Edge quando um sinal parece favorável.')},
 devoto:{p:xl('Age com calma e fé; aceita o risco como parte de um destino maior.'),e:xl('Gasta Edge para salvar outra pessoa, nunca para se salvar.')},
 oportunista:{p:xl('Observa quem está ganhando e se posiciona ao lado dele no último instante.'),e:xl('Gasta Edge para sair por cima, quase sempre à custa de outro.')},
 protetor:{p:xl('Põe o corpo entre a ameaça e os que não sabem lutar; só avança depois de eles estarem a salvo.'),e:xl('Gasta Edge para proteger alguém, antes de si.')},
 calculista:{p:xl('Faz as contas de risco e retorno e só ataca quando as chances são boas.'),e:xl('Gasta Edge somente quando a conta compensa.')},
 temerario:{p:xl('Escolhe o caminho mais perigoso e avança sem olhar o custo.'),e:xl('Gasta Edge cedo e várias vezes.')},
 cinico:{p:xl('Não confia em ninguém e esconde o que sente por trás de sarcasmo.'),e:xl('Gasta Edge para evitar ser enganado.')},
 idealista:{p:xl('Luta pelo que considera certo e se recusa a quebrar os próprios princípios.'),e:xl('Gasta Edge para proteger uma causa ou uma pessoa inocente.')},
 disciplinado:{p:xl('Cumpre a ordem recebida até o fim, mesmo quando a situação muda.'),e:xl('Gasta Edge para cumprir a missão, não para se salvar.')},
 rebelde:{p:xl('Desobedece à ordem por princípio e age por conta própria.'),e:xl('Gasta Edge para fazer o contrário do que o plano manda.')},
 frio:{p:xl('Trata a luta como tarefa: sem pressa, sem raiva e sem desperdício.'),e:xl('Gasta Edge de forma fria e calculada, no momento certo.')},
 gentil:{p:xl('Evita ferir e procura resolver sem violência; hesita antes de matar.'),e:xl('Gasta Edge para evitar que alguém se machuque.')},
 teimoso:{p:xl('Repete a mesma tática até funcionar e não aceita mudar o plano.'),e:xl('Gasta Edge para insistir no plano original.')},
 exausto:{p:xl('Quer terminar logo e evita risco extra; recua assim que o serviço permite.'),e:xl('Raramente gasta Edge; quer economizar o pouco de energia que lhe resta.')},
 competitivo:{p:xl('Disputa os melhores alvos com os próprios aliados e não deixa ninguém roubar o abate.'),e:xl('Gasta Edge para ser o primeiro a derrubar o alvo.')}});
