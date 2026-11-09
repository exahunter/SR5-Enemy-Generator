/* ===== v40: condutas novas (estilos e traços de personalidade-v40.js) — mesmos formatos de condutas-alta.js e condutas-baixa.js =====
 * Sem falas nem dicas de roleplay: só comportamento. Toda conduta com fuga traz os três desfechos (sem rota, aliado ferido, aliado importante lutando). */
if(typeof ST_PERFIL!=='undefined')Object.assign(ST_PERFIL,{marcial:{co:-.1,tt:.1},demolidor:{co:.1,tt:.25},arqueiro:{co:-.05,tt:.15},combatequimico:{ly:-.1,vo:.2,tt:-.1},banidor:{ly:.3,co:.2,tt:.1},domador:{co:.2,tt:.2},viciado:{vo:.15}});
CD_HI.h1.push(
xl("Luta no estilo: {fecha a distância com passos curtos|escolhe o inimigo mais perigoso de perto|ignora quem está longe} e resolve com golpes limpos, sem desperdiçar movimento§near2 Emarcial3 disciplinado.6 b.1§near§far kite"),
xl("Prepara o terreno: {planta cargas nos acessos|arma armadilhas no caminho previsto|minou o caminho de saída do inimigo} antes do primeiro tiro e só então aceita a luta§tec1.5 Edemolidor3 metodico1 b.1§amb siege plan§charge noisy"),
xl("Atira de longe e em silêncio: {escolhe um ponto alto|se esconde entre a cobertura e a sombra|troca de posição a cada disparo} para o inimigo não saber de onde vem§far2 stl1.5 Earqueiro3 cauteloso.6 b.1§far silent§near charge noisy"),
xl("Entra no combate já sob efeito de droga: {aguenta mais do que parece|avança sem sentir o ferimento|segura a posição apesar do cansaço} e aposta tudo no começo da luta§Ecombatequimico3 viciado2 agressivo.6 b.1§near charge§silent patient"),
xl("Abre a luta pelo plano astral: {identifica espíritos e magia inimiga primeiro|banisha o que o inimigo tiver invocado|protege o grupo contra efeitos mágicos antes de agir}§mag2 Ebanidor3 b.1§plan tech§noisy"),
xl("Deixa os sprites trabalharem primeiro: {registra e compila antes do combate|manda os sprites aos alvos mais críticos|reserva serviços para a hora crítica} e só então entra no combate§mtx2 Edomador3 metodico.8 b.1§tech plan§charge noisy"));
CD_HI.h2.push(
xl("Mantém a posição afastada do grupo: {escolhe um ângulo próprio|age sem avisar os outros|fica sempre fora da linha de fogo dos aliados} e só se junta a eles se não tiver escolha§solitario3 b.05§solo§hold"),
xl("Varre o ambiente a todo momento: {olha de novo cada canto|confere as saídas depois de cada tiro|nunca fica de costas para uma porta}§vigilante3 cauteloso.5 b.05§wary§charge"),
xl("Abandona a posição que se mostrou perdida: {troca para uma melhor|recua sem discutir|deixa o ponto para quem ainda pode segurá-lo} em vez de insistir§pragmatico3 b.05§mov§hold"));
CD_HI.h5.push(
xl("Escolhe o alvo pelo resultado: {derruba primeiro o que dá mais ganho|ignora quem não muda o desfecho|deixa para depois quem já está fora da luta}§pragmatico2 calculista1 b.05§pick"),
xl("Cuida da próxima dose: {guarda as doses para depois da luta|toma a dose seguinte no momento errado|procura os recursos do inimigo antes de qualquer outra coisa}§viciado3 b.05§res"));
CD_LO.s1.push(
xl("sente o dano físico e o atordoante somando: {troca de cobertura|se abaixa atrás do aliado mais próximo|abre mais espaço entre ele e o inimigo} antes de voltar à luta§lm§cover§§b.8"),
xl("toma outra dose de {estimulante|droga de combate|adrenalina} para ignorar o dano e {volta ao combate|segue no mesmo ritmo}§lmd§heal§§Ecombatequimico2 viciado2 b.1"),
xl("o dano atordoante pesa mais que o físico: {respira fundo atrás da cobertura|troca de posição devagar|passa o flanco a um aliado} e só depois volta a atirar§lm§cover§§b.6"),
xl("foge da luta {pela saída mais próxima|em direção ao carro|pelos fundos}, sem olhar para trás; sem rota de fuga, {recua até o canto mais protegido|se encolhe atrás da cobertura e para de atirar}; com aliado ferido, {passa por ele sem parar|só o leva se ele estiver no caminho}; com aliado importante ainda lutando, {adia a fuga até ele cair ou ser coberto|fica mais uma rodada, de olho na saída}§md§flee§wary cover heal fight rage swap§pragmatico2 solitario1 fl1 b.3"));
CD_LO.s2.push(
xl("o físico pesa mais que o atordoante: {se encosta na parede|passa a atirar só em quem o ameaça|fica abaixado e só levanta para atirar}§lm§stand hold§wary cover heal fight rage swap§b.8"),
xl("já abandona o plano e faz o que o resto da luta permite: {luta só para sair|abre caminho para quem ainda pode escapar|usa o que tiver à mão}; sem rota de fuga, {fica onde está e luta para ficar vivo|se esconde atrás do aliado mais próximo}; com aliado ferido, {arrasta o aliado se puder|deixa o aliado onde caiu}; com aliado importante ainda lutando, {fica para cobri-lo|dá um último sinal e sai}§md§ret flee§wary cover heal fight rage swap§pragmatico2 b.4"),
xl("não aguenta mais a dor e {procura a próxima dose|força o corpo além do limite|ignora o aviso do corpo}; sem rota de fuga, {recua só até o fundo da posição|fica encostado, sem atirar}; com aliado ferido, {nem o olha|o usa como cobertura}; com aliado importante ainda lutando, {segue ao lado dele|o deixa e sai}§md§stand ret§wary cover heal fight rage swap§viciado2 Ecombatequimico1.5 b.3"));
CD_LO.s3.push(
xl("{encosta num canto|se deixa cair atrás de uma cobertura|fica de joelhos} e usa o que lhe resta para {cobrir a retirada|tirar um último inimigo da luta|manter o inimigo ocupado} enquanto o corpo ainda responde§lm§last§stand shield hold ret§b.8"),
xl("vê que o corpo não responde mais e {se arrasta para uma saída|se entrega|joga a arma longe}; sem rota de fuga, {fica no chão e finge estar fora da luta|se rende a quem estiver mais perto}; com aliado ferido, {não consegue ajudar|pede que o levem}; com aliado importante ainda lutando, {não o abandona com os olhos|dá a ele o que lhe sobrou}§md§sur flee§stand shield hold ret§pragmatico2 b.5"),
xl("já sabe que está quase morto e {usa o último recurso da ficha|ataca quem tiver à mão|fica entre o inimigo e um aliado}, sem se importar com o que acontece depois§l§last§stand shield hold ret§protetor2 b.4"));
