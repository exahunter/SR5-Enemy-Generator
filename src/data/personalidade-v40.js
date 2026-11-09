/* ===== v40: mais personalidades (artes marciais, explosivos, arco, drogas, banimento, sprites) =====
 * Mesmos campos de data/personalidade.js (veja o comentário no topo). Sem falas: só comportamento e manias.
 * Carregado depois de personalidade-extra.js. Para ajustar, edite só aqui. */
Object.assign(ESTILO,{
 marcial:{n:'Artista marcial',sk:['Unarmed Combat'],wk:'u',wp:/Unarmed/,wc:'',at:['AGI','REA','STR'],ap:['Gymnastics','Blades','Clubs','Perception','Sneaking'],w:.5,
  ar:'discreta',im:[['Reaction Enhancers|Wired Reflexes|Synaptic',1.5],['Muscle|Bone Lacing',1]],pf:'soldado',spc:'Striking',
  qp:{Ambidextrous:1.5,Toughness:1},kn:['Martial Arts Styles'],pec:[xl('Cumprimenta o adversário antes de lutar'),xl('Treina a mesma sequência em todo tempo livre'),xl('Mede a distância com os pés antes de agir')],d:xl('vive do estilo de luta e prefere resolver de perto, sem armas')},
 demolidor:{n:xl('Demolidor'),sk:['Demolitions'],wk:'f',wp:/Shotguns|Submachine|Machine Pistols|Light Pistols/,wc:'Submachine Guns|Light Pistols',at:['LOG','AGI','INT'],ap:['Perception','Sneaking','Gymnastics','Running'],w:.4,
  pg:[['Tool Kit',.5],['Flashlight',.4]],ar:'tatica',pf:'tecnico',spc:'Commercial Explosives',qp:{'Analytical Mind':1},kn:['Building Layouts'],
  pec:[xl('Confere duas vezes cada carga antes de armar'),xl('Conta os passos até a distância segura'),xl('Nunca trabalha com pressa, nem sob fogo')],d:xl('prepara cargas e armadilhas e prefere armas leves para o resto')},
 arqueiro:{n:xl('Arqueiro'),sk:['Archery'],wk:'f',wp:/Bows|Crossbows/,wc:'Bows|Crossbows',at:['AGI','STR','INT'],ap:['Sneaking','Perception','Running','Tracking'],w:.4,
  pg:[['Binoculars',.3]],ar:'leve',pf:'furtivo',spc:'Bow',qp:{Sharpshooter:1.5},kn:['Wilderness'],
  pec:[xl('Ajusta a corda antes de cada disparo'),xl('Recolhe as flechas depois do combate'),xl('Respira fundo e prende o ar antes de soltar')],d:xl('prefere arcos e bestas pelo silêncio e troca por modelos melhores')},
 combatequimico:{n:xl('Combatente químico'),sk:['Automatics'],wk:'f',wp:/Assault Rifles|Submachine|Shotguns|Pistols/,wc:'Assault Rifles|Submachine Guns',at:['BOD','WIL','AGI'],ap:['Unarmed Combat','Intimidation','Running','Perception'],w:.5,
  ar:'tatica',im:[['Pain Editor|Dermal',1],['Reaction Enhancers|Wired Reflexes',1.2]],pf:'soldado',spc:'Assault Rifles',
  qp:{Toughness:1.5,'Will to Live':1,Guts:1},nq:{'Addiction (Mild)':1.2},kn:['Drug Dealers'],pec:[xl('Toma a dose antes de entrar, e de novo quando o efeito cai'),xl('Transpira e não para de se mexer'),xl('Carrega as doses separadas por cor')],d:xl('entra em combate sob efeito de drogas e aposta em resistência')},
 banidor:{n:xl('Banidor'),sk:['Banishing'],req:['Mage'],sc:['Health','Detection'],wk:'',at:['WIL','LOG','INT'],ap:['Counterspelling','Assensing','Perception','Binding'],w:.8,
  ar:'leve',pf:'civil',spc:'Banishing',qp:{},kn:['Magical Theory'],pec:[xl('Desenha símbolos de proteção antes de entrar no local'),xl('Olha o astral antes de olhar o resto'),xl('Desconfia de qualquer espírito que não conhece')],d:xl('especialista em desfazer espíritos e proteger o grupo contra magia')},
 domador:{n:xl('Domador de sprites'),sk:['Compiling'],req:['Technomancer'],wk:'',at:['LOG','WIL','INT'],ap:['Registering','Software','Electronic Warfare','Perception'],w:.8,
  ar:'leve',pf:'civil',spc:'Machine Sprites',qp:{},kn:['Matrix Security'],pec:[xl('Dá nome a cada sprite e confere se estão todos presentes'),xl('Fala baixo com as máquinas ao redor'),xl('Mantém os sprites ocupados antes de precisar deles')],d:xl('vive de sprites bem preparados e sempre guarda serviços para a hora crítica')}
});
Object.assign(ST_GRP,{marcial:'corpo',demolidor:'tecnico',arqueiro:'furtivo',combatequimico:'fogo',banidor:'magia',domador:'matrix'});
Object.assign(TAT_ST,{
 marcial:{o:xl('Fecha a distância e luta do jeito do estilo, sem pressa e sem desperdiçar golpe.')},
 demolidor:{o:xl('Prepara o terreno com cargas e armadilhas antes do combate e luta para empurrar o inimigo até elas.')},
 arqueiro:{o:xl('Atira de longe e em silêncio, trocando de posição a cada disparo para não ser localizado.')},
 combatequimico:{o:xl('Entra sob efeito de droga, aguenta mais do que parece e paga o preço depois da luta.')},
 banidor:{o:xl('Neutraliza espíritos e magia inimiga antes de qualquer outra coisa e protege o grupo contra o astral.')},
 domador:{o:xl('Põe os sprites para trabalhar primeiro e só então age; guarda os serviços para a hora crítica.')}});
Object.assign(TRACO,{
 viciado:{n:xl('Viciado'),c:['disciplinado','naturalista'],gw:{'Rua e crime':1.4,Sombras:1.2,Civis:1.1},up:.8,acc:-1,bv:.55,rd:1.2,rf:.8,
  nq:{'Addiction (Mild)':1.5,'Addiction (Moderate)':1},pec:[xl('Procura a dose assim que a luta esfria'),xl('Tem as mãos trêmulas antes de agir')],mot:[xl('Só pensa em conseguir a próxima dose')]},
 pragmatico:{n:xl('Pragmático'),c:['fanatico','orgulhoso'],gw:{Sombras:1.3,'Corporativo e ciência':1.2,'Militar e caça':1.1},up:1.1,acc:1,bv:.55,rd:1.3,rf:1,
  pec:[xl('Escolhe o que funciona, não o que é bonito'),xl('Larga uma posição perdida sem hesitar')],mot:['Quer sair vivo e pago, nessa ordem']},
 solitario:{n:xl('Solitário'),c:['leal','protetor'],gw:{Sombras:1.4,'Militar e caça':1.1},up:1,acc:0,bv:.6,rd:.6,rf:.3,
  pq:{'Lone Wolf':1.2},pec:[xl('Prefere agir sem avisar os outros'),xl('Escolhe sempre uma posição afastada do grupo')],mot:[xl('Não confia a vida a mais ninguém')]},
 vigilante:{n:'Vigilante',c:['exausto','impulsivo','curioso'],gw:{'Segurança e lei':1.4,'Militar e caça':1.2},up:1.1,acc:1,bv:.7,rd:.3,rf:1.1,at:['INT'],
  pq:{Guts:1},pec:[xl('Varre o ambiente de novo a cada minuto'),xl('Dorme pouco e sempre perto de uma saída')],mot:[xl('Não aceita ser pego de surpresa de novo')]}});
Object.assign(TAT_TR,{
 viciado:{p:xl('Age em função do efeito da droga: ousado enquanto dura e frágil depois que passa.'),e:xl('Gasta Edge para conseguir mais uma dose ou para segurar o efeito.')},
 pragmatico:{p:xl('Escolhe o que funciona e abandona o que não funciona; recua assim que a posição está perdida.'),e:xl('Gasta Edge só quando o ganho é claro e imediato.')},
 solitario:{p:xl('Age sozinho e se posiciona longe do grupo; só coopera quando não tem escolha.'),e:xl('Gasta Edge pensando apenas em si.')},
 vigilante:{p:xl('Observa o ambiente o tempo todo e dificilmente é pego de surpresa.'),e:xl('Gasta Edge para evitar uma emboscada ou um ataque pelas costas.')}});
