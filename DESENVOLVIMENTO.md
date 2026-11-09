# Gerador de Inimigos SR5

O HTML final é **um único arquivo**, gerado a partir de `src/`. Edite `src/`, rode o build, abra o HTML.

```
node build.js                     # gera dist/Gerador_..._v<geradorVersao>.html (a versão vem do package.json)
node build.js --check             # confere a sintaxe de cada arquivo de src/ (rápido, sem montar)
node tools/testar.js              # testes de regressão (armas, implantes, relações, libs embutidas; precisa de playwright)
node tools/mapa-camadas.js [função]  # mostra a pilha de camadas de cada função (ordem do manifest); falha se alguém reatribuir uma função com camadas
node tools/impressao.js [--gravar]   # compara o comportamento (grupos, NPCs, critters, notas, importação…) com a referência; sem navegador
# genNPC: etapas pós-geração entram com npcPos(nome,fn) (logic/npc-gerar.js); a ordem é a do manifest
node tools/teste-ferimento.js    # penalidade de ferimento configurável (−1 a cada 3/2/1 caixas ou nenhuma): função, seletor, gravação e redesenho (playwright)
node tools/teste-caixas-dano.js  # caixas de dano clicáveis (ficha completa e modo mesa): marcar/desmarcar, penalidade, sincronia, persistência, teclado (playwright)
node tools/texto-cego.js         # prova que a geração não lê o texto em português (cifra o texto em duas cópias e compara)
node tools/teste-download.js     # fallback de download (compat.js) sem navegador
node tools/checar-fuga.js [--tudo|--json]  # condutas que citam fuga sem o complemento (sem rota, aliados feridos, aliado importante)
node build.js --verify ref.html   # compara o resultado com um HTML de referência
```
O build só precisa de Node (sem dependências). Os testes (`tools/testar.js`) precisam do pacote `playwright`.

## Estrutura
```
src/
  manifest.js        ORDEM de execução (é a única fonte da ordem)
  ui/                template.html, estilos.css, e o código que desenha/liga a interface
  logic/             geração, regras, importação, exportação (XML/JSON), PDFs
  data/              tabelas: *.json (literais puros) e *.js (tabelas com sintaxe JS)
vendor/              bibliotecas embutidas no HTML (pdf.min.mjs e pdf.worker.min.mjs do pdf.js v6 legacy, jszip.min.js)
tools/               testes e verificações (ver abaixo)
build.js
```

## Bibliotecas embutidas (`vendor/`)
O HTML final funciona **sem internet**: o `build.js` embute o JSZip (como `<script>`) e o pdf.js (em base64, em dois
`<script type="text/plain">` com ids `pdfjs-main` e `pdfjs-worker`; `ui/pdf-painel.js` os transforma em Blob e importa).
O CDN só entra como reserva se o embutido falhar.
A fonte Chakra Petch é opcional: coloque `ChakraPetch-500.woff2` e `ChakraPetch-700.woff2` em `vendor/fonts/` e o build as embute; sem elas, vale a fonte do sistema. O template não carrega mais nada do Google Fonts. Para atualizar uma biblioteca, troque o arquivo em `vendor/` e rode o build
(o HTML cresce ~3 MB). Não adicione `<script src="https://...">` novo no template: tudo que for necessário vai em `vendor/`.

## Ferramentas (`tools/`)
- `node tools/testar.js`: monta o HTML e roda os testes de regressão (armas, implantes, relações, aviso HT/RG, libs embutidas) offline.
- `node tools/validar-fichas.js [N]`: gera N NPCs (padrão 500) e confere disponibilidade ≤ 12 abaixo do nível 7 (todas as categorias), essência, nuyen, perícias, magia × implantes e condutas que citam granada/feitiço que o NPC não tem. Entra no `testar.js`.
- `node tools/mapa-camadas.js [função]`: pilha de camadas de cada função (ver "Camadas" abaixo). Também é uma guarda: sai com código 1 se um arquivo reatribui uma função que tem camadas. Roda dentro do `testar.js`.
- `node tools/impressao.js [--gravar]`: gera, com sementes fixas, grupos, NPCs, critters, subida de nível, notas, renderização e importação num contexto Node (DOM simulado, sem Playwright) e compara os hashes com `tools/impressao.base.json`. Use depois de refatorar: se só a estrutura mudou, nada muda. Quando a mudança de comportamento for intencional, rode com `--gravar` e commite a nova referência.
- `python3 tools/gen_especializacoes.py <data do Chummer> src/data/especializacoes.json`: gera o catálogo de especializações por perícia a partir do `skills.xml`. Em tempo de execução, importar um `skills.xml` no gerador o atualiza (une ao embutido). Os pesos por perfil ficam em `src/data/especializacoes-perfil.js`; a lógica (importar, calcular +2 dados, comprar por perfil com a sobra de carma, refazer no fim da geração) em `src/logic/especializacoes.js`.
- `python3 tools/gen_qualidades.py <data do Chummer> src/data/qualidades.json`: gera `qualidades.json` (P/N sorteáveis, F conflitos, X fora do sorteio com motivo e requisitos) a partir de `qualities.xml` e `qualitylevels.xml`. Mantém as linhas já existentes e só acrescenta as novas.
- `python3 tools/gen_iniciacao.py <data do Chummer> src/data/iniciacao.json`: gera `iniciacao.json` (metamagias com requisitos estruturados e artes) a partir de `metamagic.xml`. O sorteio fica em `iniGerar` (`logic/npc-gerar-ext.js`): um grau = uma metamagia ou arte; artes são do Street Grimoire e, com ele desmarcado, a exigência de arte cai.
- `python3 tools/gen_alcances.py <data do Chummer> src/data/alcances.json`: gera `alcances.json` (tabelas de `ranges.xml`, alcance próprio de cada arma de `weapons.xml`). A ficha JSON das armas preenche curto/médio/longo/extremo no formato do Chummer (`0-5`, `6-20`…), com `{STR}` pela FOR total do NPC; importar um `ranges.xml` sobrescreve a tabela embutida.
- `python3 tools/gen_acoes.py <data do Chummer> src/data/acoes.json`: gera `acoes.json` a partir de `actions.xml` (260 ações: nome, tipo, livro, página, fórmula de dados, limite). `data/acoes-regras.js` (ACR) liga o texto de táticas e condutas a ações pelo nome do Chummer; `logic/acoes.js` anexa `[Ação]` às condutas e aberturas (ficha e notas) e acrescenta a nota "Ações do livro" com tipo, página, reserva de dados do NPC e limite. Ações de livro desmarcado não aparecem.
- `python3 tools/gen_kits.py <data do Chummer> src/data/kits-prontos.json`: gera `kits-prontos.json` (KITP) a partir de `packs.xml` (80 kits: armas, armaduras, gear, cyber/bio, veículos e drones). Os perfis de `data/kits-ocupacao.js` apontam para kits pelo nome (`wk`/`wkp` armas, `ak` armaduras, `pk` gear); `logic/implantes.js` (impKit) usa os kits de cyber/bio como base dos implantes, `logic/decker.js` os decks e programas dos kits Decker e `logic/rigger.js` os drones e veículos dos kits Spy/Combat Drone e Vehicle. Item que o catálogo carregado não tem é pulado; sem `weapons.xml` importado, os kits de arma rendem pouco.
- `node tools/checar-fuga.js`: condutas que citam fuga sem o complemento (sem rota, aliados feridos, aliado importante).
- `node tools/auditar-html.js [--tudo]`: pontos que montam HTML (`innerHTML` etc.) com valores sem `esc()`; há falsos positivos (números, `esc()` aninhado), então confira cada um. Texto vindo de fichas ou XML importados **sempre** passa por `esc()`.
- `node tools/contar-condutas.js`: conta modelos e variações de conduta.

## Convenções de código
- **`genNPC` não se reescreve.** Etapas pós-geração se registram com `npcPos(nome, (c,pr,type,sp,metaSel)=>{…})` (em `logic/npc-gerar.js`) e rodam na ordem do manifest.
- **Sem `catch{}` vazio.** Use `catch(e){avisa('arquivo',e)}` (`logic/util.js`): registra uma vez no console, sem travar.
- Texto de conduta: só personalidade e comportamento (sem falas nem dicas de roleplay); toda conduta de fuga do próprio NPC traz sem rota, aliados feridos e aliado importante.

## Regras
- **A ordem importa.** Os 3 blocos `<script>` compartilham o escopo global e algumas funções são estendidas por vários
  arquivos (`importFiles`, `genGroup`, `genNPC`…) como **camadas** (ver abaixo). O `manifest.js` define a ordem de
  empilhamento. Ao criar um arquivo novo, registre-o no manifest no ponto certo.
- O build recusa arquivo em `src/` que não esteja no manifest (ou listado 2x), para nada ficar de fora do HTML sem aviso.
- `data/*.json` pode ser formatado como quiser: o build lê e minifica. Mantenha JSON válido.
- Algumas linhas de dados têm código colado depois do JSON (ex.: `SID0`, `MTD`, `CPW`+`CWK`);
  no manifest elas aparecem como `{line:[texto, {json}, texto…]}`.
- Os nomes das pastas dizem o papel **predominante**: vários arquivos ainda misturam um pouco
  (ex.: `ui/pdf-painel.js` tem também carga do pdf.js).
- Esta divisão não muda nenhum comportamento: o primeiro build é idêntico, byte a byte, ao HTML anterior.

## v22: especialização Rigger
- `logic/rigger.js`: veículo principal (por domínio: terrestre, aéreo ou aquático), drones (2 a 6 conforme o nível),
  console RCC e autosofts. O **Control Rig (VCR)** é garantido em `logic/implantes.js` (nível ≥ 2).
- Categorias de item novas: `veh` (veículo, sai em `<vehicles>`) e `auto` (autosoft, sai em `<gears>` com `<extra>`).
- `importar-arquivos.js` agora lê veículos não-drone de `vehicles.xml` (Bikes, Cars, Trucks, Boats, Submarines,
  Rotorcraft, VTOL, Fixed-Wing); consoles de rigger já entravam como `comm` pelo `gear.xml`.
- `data/itens.json` ganhou veículos, drones e RCCs do SR5 como lista-base (para funcionar sem importar nada).

## v23: decker com cyberdeck e programas
- `logic/decker.js`: cyberdeck do nível (rating alvo = ⌈nível/2⌉, até 6, respeitando a disponibilidade máx. 12 do gerador),
  programas de hacking até o limite "Programs" do deck, programas comuns e a linha **Matrix** da ficha
  (A/S/D/F, iniciativa de Matrix em RV, monitor e programas). Ao subir de nível, ganha um deck melhor e mais programas.
- Item novo: `prog` (programa, sai em `<gears>`). O deck é um `comm` com categoria `Cyberdecks`; atributos saem também como
  `attack/sleaze/dataprocessing/firewall` e `programlimit`.
- `importar-arquivos.js` lê Hacking Programs e Common Programs do `gear.xml`.

## v24: mago completo
- `logic/mago.js` (`genMageKit`, chamado em `npc-gerar-ext.js` para `talent==='Magician'`): **tradição** sorteada entre as de
  `traditions.xml` (Hermetic e Shamanic pesam mais; as demais respeitam os livros marcados), **magias** espalhadas pelas 5 categorias
  (no máx. 2 por ponto de Magia efetiva), **espíritos vinculados** (tipos da tradição, Força pela perícia Summoning, até CHA espíritos),
  **foci vinculados** (soma das Forças ≤ Magia efetiva; Power, Spellcasting e Counterspelling) e **reagentes**.
- `data/magia-dados.json` (gerado de `traditions.xml` e `gear.xml` do Chummer): `TRAD` (nome, id, dreno, fonte, página, espíritos),
  `FOCI` e `REAG`. Carregado como `MAGIA` no manifest.
- XML: `<tradition>` com os 5 campos de espírito e dreno/id/página da tradição; `<spirits>` com `<type>`; `<foci>` ligado ao `guid` do
  item (campo `g`) e improvements `SkillAttribute` (Power) / `SpellCategory` (Spellcasting) com `improvementsource` Gear; `<qty>` real.
- JSON: tradição com dreno e espíritos; foci com `rating`; serviços dos espíritos/sprites usam `svc` (antes saía a Força).
- Itens do mago levam `mg:1` (foci têm também `fk` e `g`); rerrolar e subir de nível os tratam junto da magia, não do equipamento.
- Ficha: linhas Tradição (dreno em dados, Magia efetiva, Força máx.) e Espíritos vinculados; foci mostram a Força e reagentes a quantidade.

## v25: equipamento coerente (armas, armaduras, munição, gear por ocupação)
- `logic/equipamento.js`: depois do gerador base, **refaz** armas, armadura e gear de cada NPC a partir do perfil da ocupação (`data/kits-ocupacao.js`).
  - **Armas**: categorias por ocupação (sem armas ciber/bio/escondidas), arma principal + secundária + branca; saem com os acessórios de fábrica do Chummer
    (ex.: Smartgun interno da Predator V) e acessórios sorteados (smartgun, laser, silenciador, gas-vent, scope, lanterna, coldre…) respeitando montagens (Top/Under/Barrel/Side/Stock), exclusões e orçamento; carregadores extras / speed loaders.
  - **Munição**: Ammo: Regular Ammo proporcional ao nº de carregadores + munição especial do perfil (Gel, APDS, Hollow Points, Explosive…), como `<gear>` com `qty` e `costfor`.
  - **Armadura**: escolhida por ocupação (ex.: policial = Armor Jacket/Vest + capacete) e com mods que cabem na capacidade (Chemical Protection, Shock Frills, Gear Access…); mods embutidos da armadura entram como `included`. O valor de armadura (`eqArm`) soma melhor base + capacete + bônus de mods.
  - **Gear**: lista da ocupação (policial: Restraint, Flashlight, Medkit…; médico: Medkit, Slap Patches, Biomonitor…); itens com Rating recebem rating conforme o nível.
  - Subir de nível: armas/armaduras novas ganham acessórios/mods/munição; gear solto novo vira item do perfil.
- `data/equip-tabelas.js` é **gerado** do seu `data/` do Chummer: `python3 tools/gen_equip.py <pasta-data> <saida.js>`. Para outro conjunto de livros, rode de novo.
- Exportação: `<accessories>` dentro de `<weapon>` e `<armormods>` dentro de `<armor>` (XML .chum5 e JSON). Rótulo na ficha: `Arma [acessórios…]` (`*` = de fábrica).
- Para ajustar uma ocupação, edite só `data/kits-ocupacao.js` (nomes iguais aos do Chummer; o que não existir é ignorado).

## v26: poderes de adepto por papel
- `logic/poderes.js`: `genPowers` deixou de sortear às cegas. Cada ocupação (`TYPES`) mapeia para um **perfil** (`PW_PERFIL`: lutador, soldado, guarda, furtivo, investigador, face, piloto, tecnico, civil) com uma lista **ordenada** de `[poder, chance, nívelMín, nívelMáx]`.
  - Fase 1 compra na ordem do perfil (ex.: soldado = Improved Reflexes → Combat Sense → Improved Ability → Mystic Armor…; face = Kinesics → Voice Control → Improved Ability → Improved Potential (Social)…). Nenhum poder com níveis gasta mais de ~65% do orçamento sozinho.
  - Fase 2 completa o orçamento com peso decrescente pela posição no perfil (poder fora do perfil pesa pouco).
  - Fase 3 sobe níveis só com a sobra, também ponderado pelo perfil. A lista final sai na ordem de prioridade.
  - **Improved Ability (skill)** escolhe a perícia entre as do papel (regex `ia` do perfil + `TYPES[...].s`), ponderando pela graduação.
- Para ajustar um papel, edite só `PW_PERFIL` / `PW_PAPEL` em `poderes.js`.

## v27: dinheiro e carma por nível de competência, nomes por cultura, ganchos e resumo de grupo
- `logic/recursos.js`: o **nível de competência** (`npc.pr`) define o dinheiro (tabela de prioridades E→A do SR5, interpolada; acima de 10 extrapola) e o carma total (inicial 25 + 15 por nível). `BUD(pr)` substitui `EXT(BUDA,pr)` como orçamento de equipamento. A ficha mostra o **livro-caixa**: carma restante com os gastos (atributos, qualidades, arte marcial, iniciação, magias extras, especializações) e dinheiro em conta = recursos − custo real do equipamento. Se o equipamento passar da tabela, os recursos sobem para cobri-lo. `karmaFinish` desfaz aumentos de atributo se o carma estourar e usa a sobra em especializações (7 cada; saem só no XML .chum5, o JSON não leva especializações).
- `data/nomes.js`: 14 culturas com nome, sobrenome e **idioma nativo**; o metatipo pesa as culturas e a chance de apelido (orks e trolls mais). Parentes dividem sobrenome e cultura; grupos dividem parte da cultura.
- `logic/ganchos.js`: motivação, peculiaridade e conduta em combate (foge a X caixas de dano, rende-se, chama reforço) por grupo de ocupação, ajustada por nível, papel e lealdade. Vai também para as Notas do .chum5/JSON.
- `logic/grupo-resumo.js` + `ui/decorador-ganchos.js`: cartão de resumo do grupo (ameaça, iniciativa média, culturas, equipamento padrão, recursos, tática, moral) e armadura padrão em grupos uniformizados (patrulha, corp, HTR, spec ops, mercs, gangue, caçadores).
- Reroll e subir de nível preservam nome/cultura quando o nome está travado e refazem a conta do carma.

## v27.1: critterpowers
- `critters.js` (`addCrit`): lê de cada `<power>` do `critters.xml` os atributos `rating` e `select` (antes só o texto do nome), guardados em `px`; `genCritter` calcula o rating (expressões com F, ex.: `F-1`) e a seleção (`x`).
- Exportação: o .chum5 agora grava `<rating>` e `<extra>` reais; o JSON passou a levar `critterpowers` (antes saía sem eles).
- Importação de .chum5 de critter sem o snapshot do gerador: reconstrói como critter (poderes com rating/extra, fraquezas, perícias lidas dos improvements `SkillLevel`). A Força de critter não espiritual é estimada pela média dos atributos; fichas exportadas pelo gerador mantêm a Força exata pelo snapshot.
- Ficha: poderes aparecem como `Nome (seleção) nível`.

## v27.2: ataque desarmado e armas naturais no inventário
- `logic/arma-natural.js`: todo personagem ganha **Unarmed Attack** em `gear` (item `nat:1`, custo 0, perícia Unarmed Combat); com Killing Hands o dano passa de S para P. Critters ganham também uma arma por poder **Natural Weapon** (Bite, Claws, Horns…), lidas do campo de seleção do poder (`DV:…|AP:…|Reach:…`). Sem DV legível, usa `({STR}+0)P`.
- Se o `weapons.xml` do Chummer foi importado e tem "Unarmed Attack", os dados (id, dano, PA, alcance) vêm dele; senão vale o padrão `({STR}+0)S` e sourceid vazio — **confira com o weapons.xml**.
- Os itens `nat` saem em `<weapons>` do .chum5 e do JSON (inclusive de critters) e aparecem na ficha, que agora mostra o bloco de combate também para critters. São refeitos a cada geração/rerrolagem/renderização (sem duplicar) e não contam como arma comprada.

## v28: perfil de atuação (antes "personalidade"; 1–5 estilos com %, traços, coerência e táticas)
- Cada NPC recebe de **1 a 3 estilos de atuação** com porcentagem (soma 100; ex.: Pistoleiro 60% · Sombra 25% · Observador 15%) e **1 a 2 traços** de temperamento (Cauteloso, Metódico…). Guardado em `c.npc.pers`; vai no snapshot do .chum5, então sobrevive à reimportação.
- Opção avançada **Estilos de atuação** (Automático / 1 / 2 / 3).
- Tabelas: `data/personalidade.js` (ESTILO e TRAÇO, 38 e 16) e `data/taticas.js` (ações por estilo, postura e Edge por traço, afinidades).
- `logic/personalidade.js` (motor): os % mandam em atributos, perícia-foco e perícias aprendidas, conhecimentos, armas (principal, reserva e branca), acessórios, munição, armadura e mods, gear, implantes, magias, perfil de poderes do adepto, programas do decker e qualidades; os traços mexem em bravura (quando foge), rendição, reforço, orçamento de arma, luxo/sovinice e Essência de implantes.
- **Camada de coerência** (`persMarkers`): lista na ficha o que comprova cada estilo (perícia, arma, acessório, equipamento, armadura, implante, qualidade, magia, conhecimento) e cada traço. `persEnforce` garante que todo estilo ≥25% tenha ao menos um marcador de ficha.
- **Táticas** (`logic/taticas.js`): tabela d100 por rodada montada com os itens reais da ficha (arma, feitiço, drone, deck), pesada pelos % e deformada pelos traços; mais abertura de cada estilo, postura, uso de Edge, conduta e fala típica. Sai também no campo Notas do Chummer e no JSON.
- Rerrolar/travar: nova trava **perfil de atuação**; "rerrolar só perfil de atuação" refaz perícias, qualidades, equipamento e implantes. Subir de nível mantém a personalidade e ganha perícia do estilo (1 a cada 3 níveis), arma melhor da mesma linha e item do estilo.
- `logic/personalidade-ligacao.js` empilha as camadas (kit da ocupação → kit da personalidade); no gerador base há só chamadas pontuais (`persStart`, `persSkillList`, `persQW`, `persImpW`…).

## v29: dados do Chummer que faltavam (streams, mentor/paragon, drogas, vessels, programas de IA, contatos, estilo de vida)
- `data/chummer-extras.json` é **gerado** do seu `data/` do Chummer: `python3 tools/gen_extras.py <pasta-data> src/data/chummer-extras.json`
  (streams.xml, paragons.xml, mentors.xml, drugcomponents.xml, vessels.xml, programs.xml, licenses.xml, spiritpowers.xml e os espíritos de critters.xml). Carregado como `XD` no manifest.
  Ao importar esses XML na página (ou a pasta `data`), o conjunto importado **substitui** o embutido e fica guardado no navegador (`logic/extras-importar.js`).
- `logic/extras-chummer.js` (encaixa depois de todas as camadas de `genNPC` / `genCritter`; falha dele nunca derruba a geração):
  - **Stream do technomante** (`c.stream`): sorteado de `streams.xml`; os sprites vêm da lista da stream (Courier, Crack, Data, Fault, Machine e, com o livro KC marcado, Companion e Generalist) e carregam **poderes e perícias**. Dreno e id da stream saem no XML/JSON. Antes o XML do technomante **não levava `<tradition>`**; agora leva.
  - **Mentor spirit** (mago/adepto, `mentors.xml`, escolha da vantagem conforme Magician/Adept) e **Paragon** (technomante, KC): `c.mentor`. Vira a qualidade *Mentor Spirit* (5 carma, entra na conta do carma) ou *Paragon* (0) e o elemento `<mentorspirits>` do .chum5/JSON. Mentores com `<required>` (ex.: Doom) são ignorados.
  - **Drogas** (`drugcomponents.xml`, drogas prontas): perfil por grupo de ocupação (gangue: Jazz/Kamikaze/Nitro…; militar: Cram/Long Haul/Deepweed…), 1–3 tipos, grau Street Cooked (nível ≤3) ou Standard. Custo entra no dinheiro gasto. Saem em `<drugs>`.
  - **Contatos** (`contacts.xml`/lista embutida): até CHA×3 pontos de conexão+lealdade (a cota grátis do Chummer, portanto sem carma), papéis conforme a ocupação.
  - **Estilo de vida** (`lifestyles.xml`): Street…Luxury conforme o nível, 1–2 meses pagos, limitado a 20% dos recursos; o custo entra no dinheiro gasto. Não se aplica a IA.
  - **IA**: programas avançados (`programs.xml`, categoria Advanced Programs, livro DT) em `<aiprograms>`; o quantitativo cresce com o nível (1 a 4).
  - **Vessel** (critters com *Inhabitation*, ex.: espíritos do SG): material sorteado de `vessels.xml` (Corpo e armadura crescem com a Força). O Chummer não tem campo de vessel em critter: vai no campo Notas.
- `ui/decorador-extras.js`: linhas Stream, Mentor spirit/Paragon, Programas de IA, Drogas, Contatos, Estilo de vida e Vessel na ficha.
- Travas: contatos seguem a trava **nome**; drogas, estilo de vida e programas de IA seguem **equipamento**; stream e mentor seguem **magia** (o mentor também segue **qualidades**). Subir de nível mantém tudo isso.
- Todos respeitam os livros marcados (`okSrc`): os programas avançados de IA e os sprites Companion/Generalist só aparecem com DT / KC marcados.
- **Conferir no Chummer:** o formato XML de `<drug>`, `<mentorspirit>` e `<aiprogram>` foi montado a partir dos dados e do que o Chummer lê de forma tolerante; abra uma ficha exportada e confirme que os itens aparecem.

### v29 (parte 2): SIN/licenças e poderes dos espíritos vinculados
- **SIN e licenças** (`licenses.xml` + *Fake SIN* / *Fake License* do gear.xml): grupos Rua e crime e Sombras (70%) levam **Fake SIN** de rating 1–6 (¥2.500 × rating) com **Fake Licenses** (¥200 × rating) escolhidas pelo que o NPC carrega (armas → Firearms, deck → Cyberdeck, cyber/bio → Restricted…, Mage/Adept/Summoner License, Medical, PI, Bounty Hunter, Bodyguard…). Custo limitado a 15% dos recursos e entra no dinheiro gasto. No XML as licenças vão como `<children>` da SIN; no JSON, como itens irmãos com `extra`. Os demais grupos têm SIN legal: as licenças só aparecem na ficha e nas Notas. IA não recebe.
- **Poderes dos espíritos vinculados** dos magos: linha "Poderes dos espíritos" com os poderes (e fraquezas, como Allergy) de cada espírito, vindos do critters.xml importado ou do conjunto embutido (`SPW`). `SPD` guarda fonte/página de `spiritpowers.xml`.
- Trava **equipamento** também mantém a SIN. XML dos itens da SIN passou no mesmo enriquecimento de Notas dos demais itens.
- **Conferir no Chummer:** o aninhamento `<children>` das Fake Licenses dentro da Fake SIN.

### v29 (parte 3): especiais misturados à personalidade
- **O especial entra na mistura de estilos.** `persStart` agora decide também o especial (`pers.sp`, aplicado em `genNPC` logo depois do sorteio). Estilos exclusivos de especial (`req`) ganharam três de Adepto: *Adepto de combate*, *Adepto sombra* e *Adepto face* (`pw` lista os poderes que comprovam o estilo na ficha).
- **Mago + Adepto = Adepto místico** (SR5 p.69, talento `Mystic Adept`, seletor "Adepto místico"). Um Mago que sorteia estilo de Adepto, ou um Adepto que sorteia estilo de Mago, vira místico (≈20% e ≈12% dos casos); também dá para pedir direto. Gera tradição, magias (metade, máx. do kit de mago), 1 espírito e pontos de poder (≈Magia/2, +1 a partir do nível 7). **Cada ponto de poder custa 5 de carma** (`karmaBook.ppk`, linha "pontos de poder (místico)"); magias além de 1,7×Magia custam 5, como no mago. XML usa `MAGAdept` = pontos de poder; JSON marca `magician` e `adept`.
- **Tecnomante + magia é bloqueado.** A qualidade *Technomancer* do Chummer tem `forbidden: magenabled`, então tecnomante nunca recebe estilo de Mago/Adepto nem vira místico. Isso inclui "Tecnomante + Adepto".
- **Cyberadept não é tecnomante+adepto.** É a *Resonant Stream: Cyberadept* (Kill Code p.89, 20 de carma), exclusiva de tecnomante, com bônus de +2 em Compiling/Decompiling para sprites Fault e Companion. Tecnomantes (livro KC marcado, ≈8% por nível, até 50%) podem ter uma das streams ressonantes (Cyberadept, Machinist, Sourceror, Technoshaman; `XD.RST`, lidas de qualities.xml); a qualidade entra em `c.q` (conta no carma) e os sprites preferidos da stream vêm primeiro. Sourceror e Technoshaman não têm sprite preferido nos dados.
- Seletor de grupo, especialista aleatório e papéis "Adepto místico/Místico" também geram o místico. Travas: a stream ressonante segue a trava de **magia**.

## Condutas em combate (v31)
Substituem a tabela d100 de ações. Cada NPC tem **5 condutas com a vida alta** (1 de cada slot: abordagem, movimento, cobertura, equipe, alvo/recursos) e **3 com a vida baixa** (ferido → muito ferido → quase caindo), guardadas em `c.npc.cond`.
- `data/condutas-alta.js` e `data/condutas-baixa.js`: os bancos (≈940 condutas em 8 slots, mais de 100 por slot). Formato da linha e das afinidades no comentário do topo de cada arquivo; `{a|b|c}` sorteia variante.
- `logic/condutas.js`: sorteio ponderado pela personalidade, grupo, ficha e gancho. Vida baixa depende da lealdade (leal / médio / desleal) e tem a exceção "o leal nem sempre é tão leal"; os 3 passos são coerentes (cada conduta diz de quais do passo anterior ela pode vir).
- `ui/decorador-condutas.js`: bloco na ficha. As condutas também vão nas Notas do Chummer.
- `node tools/contar-condutas.js` conta as condutas por slot e aponta frases suspeitas.

## v32: personalidades, perfil de ocupação e lealdade neutra
- `data/personalidade-extra.js`: mais estilos e traços (duelista, sentinela, assaltante, faqueiro, protetor, interrogador, sobrevivente, manipulador…).
- `data/perfil-ocupacao.js`: tabelas do **perfil** (lealdade-base, coordenação, volatilidade e tática) por ocupação, especialização, estilo e traço; pesos de sorteio de estilo/traço por ocupação e especialização; estilos novos de ocupação (esquadrão, batedor, patrulheiro, escolta, bando, chefão, executor, zelote, fugitivo, burocrata) e de especialização (guardião arcano, adepto guardião, hacker de campo, comandante de enxame); traços novos (coordenado, tático, volátil, imprevisível, solitário, obediente, bravateiro, pragmático, profissional); `OCC_DOUTRINA` (texto da ocupação nas Notas).
- `logic/perfil-ocupacao.js`: `persPerfil(c)`, `loyGen(c)` (lealdade 1–6 **neutra**: parte de 3,5, é puxada pelo perfil, recebe ruído maior para o volátil e é comprimida de volta ao centro), `persOccTW`, `perfilTxt`.
- `data/condutas-perfil.js`: ~100 modelos de condutas novos (vida alta e baixa) por ocupação (afinidades por tag: `SOLD SEG POL ESC MERC GANG CRIM CULT CORP CIV SOMB CAC`), especialização (`SMAGE SADEPT SDECK STECH SRIGGER SLIDER`), estilo (`Eesquadrao`, `Ebando`…) e traço novo; chaves `co vo tt` usam coordenação/volatilidade/tática.
- `logic/condutas.js`: o soldado (tt/co altos) tem pesos mais afiados (repete o que faz melhor); o membro de gangue (vo alto) tem pesos achatados (imprevisível). A lealdade sai de `loyGen` (guardada em `c.npc.loyg`); ao compor grupos, a lealdade ao líder também usa `loyGen`.
- A ficha mostra o perfil e a doutrina da ocupação; as Notas do Chummer ganham uma linha de perfil.
- `ocx:1` num estilo = só entra no sorteio se a ocupação o citar em `OCC_ESTILO_W`.

## v34: itens que estavam em andamento
- **Disponibilidade acima de 12** (só nível 7+ passa): agora também filtra a arma principal/secundária (`eqPickWeapon`), acessórios e mods de armadura, gear e armadura de estilo (`personalidade.js`), o sorteio base (`npc-gerar.js`), subir de nível (`subir-nivel.js`) e veículos/drones do rigger (com fallback para o pool inteiro se o filtro esvaziar). Implantes (`cyber`) não passam por esse filtro.
- **Armas brancas**: acessórios sorteáveis ampliados (`EQM`: Melee Hardening e *Special Modification* Improved Accuracy/Damage/Improved Reach; no máximo uma Special Modification por arma; respeitam livros e disponibilidade).
- **Armas de apoio** (arcos, bestas, lançadores de granada/míssil, metralhadoras médias/pesadas, canhões de assalto): `K.x`/`K.xp` em `kits-ocupacao.js` (HTR, spec ops, merc, caçador de recompensas), `eqPoolX`, perícia garantida (`eqSkills`; Light MG → Automatics, MMG/HMG/lançadores → Heavy Weapons, arcos → Archery) e munição própria (`eqSupportAmmo`: flechas, virotes, granadas, mísseis; item marcado `sa:1`). As armas vêm do `weapons.xml` importado; a munição vem do `gear.xml` importado (ou de `EQ.G`).
- **Programas de IA**: `aiRating(pr)` (1–6) limita quantos programas avançados a IA leva; a ficha mostra "Rating N (máx. N)".
- **Contatos acima da cota grátis** (CHA×3): custam 1 de carma por ponto (`ctExtra`, `karmaBook.ct`), são comprados com a sobra (`ctBuy`) e cortados antes de tudo se o carma estourar (`ctTrim`). A sobra de carma também compra atributo (valor novo × 5). Rerrolar com nome travado copia os contatos (não compartilha objetos).
- **Mentor spirit**: a vantagem escolhida vira regra quando dá (`c.mentor.fx`): +N dados em magias de uma categoria (improvement `SpellCategory`), +N dados em perícia (`Skill`) e níveis grátis de poder de adepto (`p.mf`, custo 0; improvement `AdeptPowerFreeLevels`). Os improvements vão na qualidade Mentor Spirit do .chum5; o JSON do Foundry não exporta improvements, então leva só os poderes. **Conferir no Chummer** se `AdeptPowerFreeLevels`/`SpellCategory`/`Skill` abrem certo.
- **Critters**: `<optionalpowers>` do `critters.xml` importado são lidos (`addCrit` → `ox`); 70% dos critters levam 1 poder opcional, 2 em Força 6+ (metade das vezes).
- **Resumo do grupo**: botões "Copiar resumo" e "Baixar .txt" no cartão (`grupoTexto`, `grupoCopiar`, `grupoBaixar`).

## Camadas (depois da v34): extensão de funções sem reatribuição
Nove funções são estendidas por mais de um arquivo. Antes, cada arquivo fazia `const g=X; X=function(){…g()…}` e a ordem só estava no manifest.
Agora existe `logic/camadas.js`:
```js
const genCritter=comCamadas('genCritter',genCritterBase);                       // arquivo da base (a função-base é içada)
genCritter.camada('arma natural',prox=>function(...a){const c=prox(...a);armaNatural(c);return c});   // qualquer arquivo posterior
```
- `prox` é a função anterior da pilha. A ordem de registro é a do manifest, igual à de antes (a refatoração não mudou nenhum hash de `tools/impressao.js`).
- Cada camada tem um **rótulo**; `node tools/mapa-camadas.js` lista a pilha (arquivo:linha) e `genCritter.rotulos()` faz o mesmo no console.
- **Não reatribua** uma função que tem camadas: o `mapa-camadas` falha. A base ficou com sufixo `Base` (`genNPCBase`, `renderNPCBase`, `importFilesBase`…).
- As funções agora são `const` globais (não propriedades de `window`); o acesso por nome continua igual.
- O `genGroup` antigo de `geracao-grupo.js` era código morto (`grupo-gerar.js` o substituía sem chamá-lo) e foi removido; a base é a de `grupo-gerar.js`.
- Semente: `genGroup` zera `META_USED` ao começar, e `tools/testar.js` tem o teste "mesma semente gera o mesmo grupo" (GUIDs e ids de relação continuam aleatórios).

## Estado mutável (`src/logic/estado.js`)

As ~10 variáveis globais soltas (`curN`, `WILD`, `META_USED`, `CULT_HINT`, `IMPSEL`, `COMP`, `LV_ADD`, `PERS_CUR`, `PERS_FORCE`, `PERS_LEVEL`) viraram dois objetos:

- `GEN`: opções e rascunho da geração em andamento (`wild`, `impSel`, `comp`, `metaUsed`, `cultHint`, `lvAdd`, `persCur`, `persForce`, `persLevel`).
- `SESSAO`: o que o usuário vê (`fichas`, antes `curN`) e o histórico (`hist`, chave `__pcs` do IndexedDB).

`leOpcoesGeracao()` é o único ponto que lê os controles da tela (`wild`, `nimp`) e zera `GEN.metaUsed`; `doGen`, `rerollChar` e `levelAt` chamam essa função (antes eram três cópias da mesma linha). Foram removidos `boot` e `curT` (nunca usados); `FORCA` virou `const`.
Para conferir uma refatoração que mexe nesses caminhos: `node tools/teste-ui.js <pasta>` em duas versões e `diff` da saída (cobre `doGen`, `rerollChar` e `levelAt`, que o `impressao.js` não alcança).

## Módulos de veículo e drone (`veiculo-modulos`)

- `data/veiculo-modulos.js` é gerado do `vehicles.xml` por `python3 tools/gen_veiculos.py <pasta-data>`: `VM` (197 módulos com fórmulas de slots, custo e disponibilidade, categoria, rating máximo e requisito) e `VF` (módulos de fábrica de 263 modelos). Não editar à mão.
- `logic/veiculo-modulos.js`: avaliador das fórmulas do Chummer (`Body`, `Rating`, `Handling`, `Vehicle Cost`, `FixedValues(...)`, `number(...)`; sem `eval`) e `vmDress(item,pr,ctx,opt)`. Cada veículo/drone recebe os módulos de fábrica (gratuitos, sem slot) e, no kit do rigger, o veículo principal e os 2 primeiros drones recebem módulos sorteados (tabelas `VM_V`, `VM_D`, `VM_B` com os pesos) que cabem nos slots (`modslots` ou Body) e no orçamento. O veículo (não drone) do rigger leva sempre o Rigger Interface (SR5).
- Só entram módulos dos livros marcados (`okSrc`): quase todos são do Rigger 5.0 (R5). Sem R5 marcado sobram o Rigger Interface e os módulos de fábrica; por isso o aviso de livros também lista o R5.
- Saída: `<mods><mod>…` dentro de `<vehicle>` (XML grava as fórmulas originais para o Chummer recalcular) e `mods:{mod:[…]}` no JSON (valores já calculados). A ficha mostra "Módulos: …" na linha do veículo.
- `node tools/teste-veiculos.js`: avalia as fórmulas de todos os módulos (falhas devem ser 0), gera riggers com e sem R5 e confere slots e duplicados.
- Fora do escopo por enquanto: montagens de arma (`weaponmounts`) e armas de fábrica dos drones, gears de fábrica (Sensor Array) e módulos da categoria Weapons.

## v35: implantes de todos os livros
- `tools/gen_implantes.py <pasta-data> src/data/implantes.json` regenera `data/implantes.json` a partir de `cyberware.xml` e `bioware.xml` (Chummer 5.225), com as mesmas regras do `impParse`: 138 itens (SR5 40, CF 49, 2050 37, KC 4, NF 3, TCT 2, HT 2, DTR 1). Os 40 de SR5 ficam na mesma ordem de antes; os novos vêm depois. O filtro por livro continua em `okSrc` (padrão: só SR5).
- Ainda fora (exigem lógica nova, não só dados): cyberlimbs, melhorias de olho/ouvido e de membro (`requireparent`, `limbslot`, `addweapon`) e grades de outros livros (Gammaware, Omegaware, Greyware) em `IMPG`.

## v36: todos os implantes embutidos
- `data/implantes.json` agora traz **todos** os 575 itens de `cyberware.xml` (362) e `bioware.xml` (213). (A conta de "~1000" vinha de elementos de referência dentro de `required`/`forbidden`.) Linha: as 15 colunas de antes + `ok` (15), `motivo` (16) e `meta` (17: `rq` pais exigidos, `sd` escolhe lado, `ls` limbslot, `aw` arma embutida, `av` veículo, `lm` limite, `bm` montagens bloqueadas, `sub` categorias de subsistema, `rt` rating bruto).
- `ok=1` (138) entra no sorteio como antes; `ok=0` (437) fica embutido e **fora** do sorteio (`implantes.js` filtra `x.ok!==0`), porque exige lógica: cyberlimbs e `selectside` (lado), peças que exigem pai (`required`/`requireparent`, capacidade `[n]`), `addweapon`/`addvehicle`, categorias novas (Cosmetic, Cybersuite, Bio-Weapons, Transgenics, Phenotype…) e fórmulas fora do parser.
- Regenerar: `python3 tools/gen_implantes.py <pasta-data> src/data/implantes.json` (mantém a ordem dos itens `ok`, para o sorteio não mudar).

## v37: histórico de vida (lifemodules.xml)
- `tools/gen_lifemodules.py <pasta-data> src/data/lifemodules.json`: 165 módulos (Nationality 8, Formative Years 40, Teen Years 37, Further Education 11, Real Life 69) com livro/página, requisitos (talento, metatipo), perícias do bônus e versões. O texto narrativo do Chummer (inglês, com macros) não entra.
- `logic/historico.js`: camada em `genGancho` (`genHist`) sorteia um módulo por etapa (Educação superior com chance ~0,3+0,05×nível; 2º módulo de Vida adulta a partir do nível 6). Vida adulta casa com a ocupação (`LM_TIPO`) e a especialização (`LM_SP`) em 70% dos casos; o peso também sobe com as perícias do NPC. Educação mágica só para o talento certo; módulos de Ork/Troll só para esses metatipos; versão de nacionalidade respeita o metatipo.
- Só entram módulos de livros marcados (`okSrc`) e com livro definido. Nenhum módulo é de SR5 (vêm de Run Faster, Sail Away, etc.): sem esses livros marcados, o histórico não aparece.
- Saída: linha "Histórico" na ficha (`ui/decorador-historico.js`) e "Histórico de vida:" nas notas (camada em `ganchoNotas`, vai para XML e JSON). Fichas antigas geram o histórico na primeira exibição (`histOf`). Não altera atributos, perícias ou qualidades.

## v40 — personalidades, condutas, critters e táticas de grupo
- `data/personalidade-v40.js`: 6 estilos (Artista marcial, Demolidor, Arqueiro, Combatente químico, Banidor, Domador de sprites) e 4 traços (Viciado, Pragmático, Solitário, Vigilante), com postura e Edge. As falas (`fl`) foram removidas de todos os traços e da ficha.
- `data/condutas-v40.js`: condutas novas de vida alta e baixa; perfis de coordenação/tática dos estilos novos. `logic/condutas.js`: o gatilho da vida baixa soma o físico e o atordoante (o físico manda) e nunca usa todas as caixas.
- `data/critter-condutas.js`, `logic/critter-condutas.js`, `ui/decorador-condutas-critter.js`: condutas de critters e espíritos (temperamento, 3 de vida alta, 3 de vida baixa).
- `data/grupo-taticas.js`, `logic/grupo-taticas.js`: doutrina por composição, abertura, desenvolvimento, sinergias, papéis e ruptura; saem no cartão, no .txt e nas Notas de cada membro. `data/acoes-regras-v40.js`: ligação com ações do livro (banimento, sprites, arco).
- Testes novos em `tools/testar.js`: critters e táticas de grupo.

## v40 (etapa 6): critters embutidos e perfil de atuação
- `data/critters.json` (gerado por `python3 tools/gen_critters.py <pasta-data> src/data/critters.json`): todos os 269 critters do `critters.xml` do Chummer (atributos normal/aumentado, poderes, poderes opcionais, perícias, livro e id). Entram em `CRIT` na abertura, sem importar nada; `critMergeEmb()` (logic/critters.js) também roda ao carregar dados salvos, e o `critters.xml` importado continua valendo (não duplica nome + id). Os 6 espíritos básicos sem id são trocados pelos do XML, já com poderes.
- Só aparecem na lista e no sorteio os critters dos livros marcados (SR5 sozinho: 37; todos os livros: 269). Há dois "Vampire" (ids diferentes, livros diferentes).
- Poderes opcionais (`<optionalpower>`): o importador antigo procurava a tag `power` e nunca os lia; agora entram (70% dos critters levam 1, ver `genCritterBase`).
- Perfil de atuação: até 5 estilos (ver acima, v28); o rótulo "Personalidade" virou "Perfil de atuação" na interface.

## v41: condutas de critter por habilidade e ligadas às ações do livro
- `data/critter-acoes.js`: `CC_SK_H` / `CC_SK_L` (condutas por perícia do critters.xml: Perception, Unarmed Combat, Sneaking, Gymnastics, Running, Flight, Swimming, Intimidation, Tracking, Assensing, Astral Combat, Hacking, Cybercombat, Counterspelling, Con…) e `CCR` (texto → ação). Para acrescentar uma habilidade ou uma regra, basta uma linha lá; o nome da ação tem de ser igual ao `<name>` do actions.xml.
- `logic/critter-condutas.js`: a 2ª e a 3ª conduta da vida alta (70% / 35%) e o passo 2 da vida baixa (sem fuga) podem vir de uma habilidade que o critter realmente tem; temperamentos que não combinam (ex.: presa) não recebem conduta agressiva. A fuga continua sendo `CC_FUGA` (três desfechos). Continuam 3 + 3 condutas.
- Ligação: `ccRefs` (até 2 ações por conduta; Sprint vira Run se o critter não tem Running), `ccInfo`/`ccHtml`/`ccSuf` (ação + perícia com o rating + poder com a ação do poder), `acResumoCrit` (lista "Ações do livro" com tipo, página, reserva de dados e limite). Só ação de livro marcado aparece. Na ficha e nas notas do Chummer.
- `logic/acoes.js`: a reserva de dados de critter usa Unarmed Combat (corpo a corpo) ou Exotic Ranged Weapon (disparo); o limite sai como "da arma natural". Também corrigi "limite limite da arma", que aparecia nos NPCs.
- O arquivo gerado passa a se chamar `..._v41.html`. `tools/impressao.base.json` regravado (mudança intencional de comportamento).
- Ferramentas novas (v41): `node tools/checar-vida-baixa.js` (regras da vida baixa em NPCs e critters: físico + atordoante nos 3 passos, limiares crescentes, 3º passo = "quase morto", tags por passo, fuga dos critters com os três desfechos) e `node tools/medir-critters.js` (temperamentos, poderes sem conduta e condutas sem ação nos 268 critters reais embutidos).
- `CC_HI_P` ganhou Confusion, Energy Drain e Blend (os poderes mais comuns que ainda não tinham conduta).
- Livros sem PDF (v41): o painel "Livros em PDF" ganhou o bloco "Livros sem PDF" (os marcados em "Livros ativos" sem PDF em destaque; os não marcados numa lista recolhida), o título do painel resume a situação, e cada livro da lista "Livros ativos" tem o selo "PDF ✔" / "sem PDF". As dicas e as notas dizem "você não enviou" o PDF do livro. Ponte `window.PDFX` (resumo, selos, atualização) porque o bloco do leitor de PDFs é fechado; teste em `tools/testar.js`.

## v42: tetos de perícia e Magia, livros ativos junto dos PDFs, metasapientes no metatipo
- `skCap` (logic/rerrolar.js): máximo natural de perícia `SKNAT=12` (nível 10); do 11 ao 90 sobe até o dobro (24) e fica nisso até o 100. Antes só chegava a 24 no nível 100. `srv` segue a mesma rampa. Para aumentar o máximo natural, mude `SKNAT`.
- Critters (logic/critters.js): perícias e Magia de espírito usam `Math.min(F, skCap(F))`, em vez da Força crua (Magia chegava a 100). XML do critter: essência de espírito = Magia da ficha.
- "Livros ativos" saiu das Opções avançadas e fica dentro do painel "Livros ativos e PDFs" (ui/pdf-painel.js move o bloco `#bk`); novo botão "Só os livros com PDF". Cada livro mostra o selo PDF ✔ / sem PDF.
- O checkbox "Incluir metasapientes (Centauro, Naga, Pixie…) no sorteio" (`#wild`) agora fica logo abaixo do campo Metatipo.
- O arquivo gerado passa a se chamar `..._v42.html`.
- Critters (v42): Sprites ganham temperamento próprio `sprite` (compilador/registro/Matrix, sem fuga; `CC_HI_A.sprite`, `CC_HI_TS`, `CC_LO.sprite`, `CC_LAST.sprite`). `ccTemp`: categorias Shedim/Dracoform e nomes claramente sapientes (Vampire, Banshee, Goblin…) seguem sapiente; o poder Sapience sozinho dá sapiente em ~35% (antes Ritual e Infected saíam 100%). Condutas de poder novas em `CC_HI_P`: Search, Banishing Resistance, AR-Parallelism, Resonance Feed (Fragile, Allergy, Accident e Toughness ficam sem conduta, de propósito).
- Grupos (v42): `COMP_EST` (logic/grupo-composicao.js) define, por composição e papel, os estilos de atuação preferidos (Demolidor no Armeiro, Arqueiro/Batedor, Banidor no Mago de segurança, Domador no Tecnomante, Combatente químico, Artista marcial no Capanga etc.). `genGroup` põe `GEN.persPref` antes de cada NPC; `persStart` (logic/personalidade.js) usa a preferência no 1º estilo em `COMP_EST_P` (70%) das vezes, só entre estilos que a ocupação/especialização aceita. Os demais estilos sorteiam como antes. `tools/impressao.base.json` regravado.
- Revisão de pesos (v42, item 6), medida com 200 grupos por composição e 30 sorteios por critter:
  - Táticas de grupo (logic/grupo-taticas.js): `GT_REQ` filtra variantes de abertura, desenvolvimento e ruptura que citam motorista/veículo, decker/Matrix, magia/ritual, atirador, batedor, granada, drone, silenciador ou arma não letal quando o grupo não tem aquilo. Antes 15–35% dos grupos citavam algo inexistente (batedor no grupo genérico 24%, silenciador em spec ops 36%, granada em elite 28%, motorista em VIP 20%); agora 0. Se nenhuma variante serve, volta a sortear entre todas.
  - Lealdade por composição conferida: gangue 2,8, protesto 2,7, caçadores 2,9, contrabando 3,0 (ruptura "perde o rumo" frequente); elite 4,2, spec ops 4,3, culto 4,5, VIP 4,1 (ruptura "se fecha em volta"). Sem mudança.
  - Estilos por papel: cada repetição do mesmo estilo no grupo pesa `1/(1+0,7·n)` (`usedEst` em grupo-gerar.js); multidões (protesto, culto) continuam homogêneas de propósito.
  - Temperamento de critter (`ccTemp`): ajustes por nome (herbívoros e presas → Presa/Territorial; Bear, Boar, Elephant → Territorial; Snake, Spider, Alligator, Crocodile → Emboscador; ratos e baratas → Presa). Horse passou de ~60% predador para ~20%.
  - `tools/impressao.base.json` regravado.

## v43: servo, ações de Matrix e sociais, dado morto das táticas, kits e armas
- Critters: Watcher, Homunculus e Corps Cadavre (categoria `Ritual`) ganham o temperamento próprio `servo` (criado por ritual para servir: cumpre a ordem do criador, sem fuga nem vontade própria). `CC_HI_A.servo`, `CC_HI_TV`, `CC_LO.servo`, `CC_LAST.servo` em `data/critter-condutas.js`; `ccTemp` devolve `servo` para toda a categoria Ritual (antes caíam em sapiente, predador etc.). A assinatura das condutas passou a `v43`, então fichas antigas refazem as condutas na primeira exibição.
- Ações do livro (`data/acoes-regras.js`): bloco v43 com regras próprias para Matrix (marcar + controlar portas, câmeras e armas = `Hack on the Fly (1 Mark)` + `Control Device (Simple)`; `Jam Signals`, `Trace Icon`, `Erase Matrix Signature`, `Hide`, `Reboot Device`, `Format Device`, `Crash Program`) e para ações sociais (`Use Skill`: o actions.xml não tem ação social). Falsos positivos corrigidos: "decker"/"hackers" citados como alvo não viram `Matrix Perception`; "o médico" não vira `Use Skill`; "abaixa a arma" não vira `Drop Prone`; "conjurador" não vira `Cast Spell`; "cobrindo-se" não vira `Suppressive Fire`; "Cobertura pela Matrix" não vira `Take Cover`; "se finge de morto" agora liga `Playing Possum`.
- Táticas (`data/taticas.js`, `personalidade-v40.js`, `personalidade-extra.js`, `perfil-ocupacao.js`): removidos `a` (lista de ações por estilo) e `m` (multiplicadores por traço). Eram da tabela d100 antiga, substituída pelas condutas (`logic/condutas.js`), e nada os lia. Ficam `o` (abertura), `p` (postura) e `e` (Edge).
- Kits e armas (`logic/equipamento.js`):
  - A arma que vem de um kit do packs.xml leva os acessórios do kit (coldre, mira laser, silenciador, shock pad, bipé, tripé…; `pka`, com o alias `Silencer` → `Sound Suppressor`) e os carregadores do kit (limitados a 5, ou 3 speed loaders). O kit "Smartgun" garante o Smartgun System (`pksg`). A munição especial do kit para a categoria da arma (APDS, Stick-n-Shock, Explosive Rounds…; `pkam`) entra em `eqAmmo`, dentro de 12% do orçamento. `pkn` guarda o nome do kit na arma.
  - Kits de estilo de vida (Bug-out Bag) e da comunidade (Runnerhub Basic Gear, Runnerhub Pennypincher, ShadowNET starter) entram em `wk`/`ak`/`pk` de Civil, Informante, Contrabandista, Detetive, Mercenário, Caçador de recompensas, Operações especiais, Sindicato, Ganger, Arruaceiro, Guarda-costas e Motorista. `KP_OUTRO` deixa de fora o que outras camadas já cobrem (Fake SIN/License, credsticks, drogas).
  - Rocketeer e Medium Machine Gunner valem em qualquer perfil que os liste em `wk` (antes só com `K.x`): o pool dos kits sempre inclui `eqPoolX()`. Contrabandista, Mercenário e Sindicato ganharam esses kits.
  - Sem o weapons.xml importado só há 8 armas embutidas: `eqSemWeaponsXml()` (menos de 30 armas) mostra um aviso na interface (`drawArmasAviso`, chamada por `drawBooks`) e kits, arcos, lançadores e metralhadoras ficam de fora em silêncio; o NPC que deve andar armado continua armado.
  - Limite do arco: o nível do arco (`Bow (Rating N)`) não passa da FOR total do NPC nem de 3 + nível (`eqBowSet`, `eqBowOk`), em kits, sorteio de arma de apoio, troca do estilo Arqueiro e subida de nível.
- Testes novos em `tools/testar.js`: servo, dado morto das táticas, regras de Matrix/sociais, acessórios e munição do kit, Rocketeer/MMG sem `K.x`, limite do arco (níveis 1 a 12, FOR 1 a 10), kits de lifestyle/Runnerhub, aviso sem weapons.xml. Como o catálogo embutido tem poucas armas, eles montam um catálogo de armas de teste (`__catW`) com as armas dos kits e arcos de nível 1 a 12.
- As funções do aviso de armas são declaradas (içadas): `drawBooks` roda na carga, antes das `const` de equipamento.js, e usar `const` ali dava erro de inicialização. O teste agora falha com qualquer "Warning: [gerador]" no console.
- O arquivo gerado passa a se chamar `..._v43.html`.
- Catálogo embutido completo (do data/ do Chummer, gerado pelo próprio importador, então idêntico a importar os XML): `data/itens.json` passa de 99 para 1295 itens (armas 434, armaduras 176, comlinks/decks 142, gear 154, drones 119, veículos 200, programas 68) e `SPELLS` de 13 para 363 feitiços (`data/tabelas-jogo.js`). Os livros continuam filtrados pela seleção (padrão SR5, RG, HT). Já estavam embutidos: critters, implantes, extras (mentores, drogas, streams…), kits, ações, alcances, histórico de vida, artes marciais, poderes, contatos, formas complexas, estilos de vida. Ficam de fora de propósito: qualidades que o gerador não sabe aplicar (ficam em `QXD.X`) e a lista `SPIRITS`, que só serve ao armazenamento.
- O teste "sem weapons.xml" agora simula o catálogo reduzido (8 armas) em vez de depender do embutido.

## v44: catálogo limpo, comlinks e drones por perfil, kits novos e seis ocupações novas
- **Catálogo sem duplicatas**: `data/itens.json` tinha 96 itens repetidos (armas, armaduras, comlinks, drones, veículos e programas antigos mais os do XML), o que dobrava o peso deles no sorteio. Agora cada `(categoria, nome, livro)` aparece uma vez (1295 → 1199).
- **O sorteio só enxerga itens com sentido** (`eqCtxOk` em `logic/equipamento.js`, chamada por `poolItems`): sem variantes `(2050)` (também nos implantes), sem peças de arma de custo zero (canos, supressores embutidos, acessórios), sem armas-novidade (macuahuitl, pole arm, comlink-taser, halberd, reprodução histórica…), sem roupa e sem armadura de nicho (traje de mergulho, Bunker Gear, bolha de sobrevivência, EE Suit, alta-costura de luxo). Itens citados pelo nome nos kits não passam por esse filtro.
- **Causa raiz das armaduras absurdas**: `persEnforce` (personalidade) trocava a armadura pelas 3 mais caras da classe do estilo; agora filtra por `eqCtxOk`, prefere a lista do perfil (peso ×5) e pesa pelo preço.
- **Comlink por perfil e nível** (`eqCommDrone`): o degrau do comlink vem do nível (`EQ_CL_DR`) mais o ajuste `cd` do perfil e ±1 ao acaso; sai sorteado entre os comlinks do catálogo (antes só 4 modelos fixos). `subir-nivel` usa o mesmo cálculo (por Device Rating, não por posição numa lista).
- **Drones por perfil** (`K.dr` = chance, nível mínimo, segunda unidade e lista `[regex, peso, nível mín.]`): o detetive e o espião sorteiam microdrones espiões, o paramédico e o médico drones de resgate, a polícia e a segurança drones de patrulha, o HTR e o merc drones de combate (só em nível alto). Antes o drone era sorteado de todo o catálogo para qualquer ocupação. Os itens do sorteio-base levam a marca `bs` para o equipamento poder substituí-los; drones de Rigger não são tocados.
- **Kits do packs.xml agora usados**: Intro/Basic/Advanced Runner, Basic/Advanced Bowman e Tacticool Helmet. Riot Control Armor entra na segurança, na polícia e no HTR. Ficam de fora: Monowhip (o catálogo não tem o chicote), Box of Grenades (granada é arma de arremesso, não gear de kit), kits de implantes (vêm de `logic/implantes.js`), de Rigger e de Decker (têm lógica própria).
- **Seis ocupações novas** (28 no total), todas em `data/perfis-novos.js` + `TYPES` em `data/tipos-npc.js`: Paramédico / socorrista, Espião / agente de infiltração, Traficante / dealer de rua, Leão-de-chácara, Jornalista / repórter e Soldado de força corporativa (SecOps). Cada uma tem kit (armas, armadura, mods, gear, packs), perfil (lealdade, coordenação, volatilidade, tática), pesos de estilo e traço, doutrina, papel de poderes, histórico de vida e fator de implantes.
- Testes novos: sem duplicatas, sem (2050) nem armadura de nicho nos NPCs; comlink e drones seguem perfil e nível; as 28 ocupações geram ficha. Referência `tools/impressao.base.json` regravada.

## Granadas e itens ilegais (v45, logic/equip-ilegal.js)
Item com `F` (Forbidden) entra no catálogo na importação, mas os sorteios normais (`poolItems`) o ignoram. O passo `granadas e itens ilegais` sorteia granadas de arremesso (Flash-Bang, Smoke, Gas…) e, mais raramente, um item F (arma, granada Fragmentation/High Explosive depois de importar o weapons.xml). Peso = grupo/tipo × nível × personalidade e perfil de combate (`condCtx`); item F vem marcado `ilegal` (rótulo "· ilegal") com ágio de mercado negro.

## v45.1: download, versão e fonte
- `logic/compat.js`: `claude.use('downloads')` agora cai no download do navegador (`<a download>`) quando `window.claude` não existe, não tem `use()`, `use()` falha/devolve vazio ou o `save()` do visualizador falha. `declined` (usuário cancelou) continua sendo repassado. Os 4 chamadores (`saveF`, `zipAll`, `saveBackup`, `dlChum`) não mudaram. Teste: `node tools/teste-download.js`.
- `build.js`: o nome do arquivo usa `geradorVersao` do `package.json` (antes estava fixo em v44).
- `ui/template.html`: removidos os `<link>` do Google Fonts (HTML 100% offline); fonte opcional em `vendor/fonts/`.
- **Primeiros passos e aviso de armas (item 8)**: o texto antigo dizia que, sem importar nada, o app usava "só uma lista básica"; isso não vale desde a v43 (catálogo completo embutido). `ui/primeiros-passos.js` (`drawPrimeirosPassos`, dentro de Livros ativos e PDFs, `#pp`) mostra o que já vem embutido (armas, armaduras, comlinks, drones, veículos, feitiços, critters, qualidades), quais XML já foram importados (✔ importado / embutido) e o que cada um acrescenta. É chamado por `drawStored` e por `drawArmasAviso`.
- O aviso de catálogo de armas reduzido (`#armaaviso`, `eqAvisoArmas`/`drawArmasAviso` em `logic/equipamento.js`) agora aparece **fora** das Opções avançadas, antes delas (antes ficava escondido lá dentro), com o botão **Restaurar catálogo embutido** (pede confirmação, apaga os XML guardados e mantém as fichas). Texto reescrito com a causa provável e os dois caminhos de solução. Removida a linha morta em `logic/importar-arte-marcial.js` que editava o texto antigo de `#impmsg`.

## Números e nomes do jogo (v54)
- `logic/formato.js` é o único lugar que formata número para mostrar: `fmtNum` (até N casas), `fmtDec` (casas fixas), `fmtNy` (¥) seguem o idioma da tela (pt: `1.234,5` · en: `1,234.5`). Não use `toLocaleString`/`toFixed` direto em texto de tela.
- Arquivo (XML, JSON do Foundry, Notas) segue o Chummer: número sem localização; só o nuyen do JSON e das Notas leva milhar en-US, via `nyArquivo` (o único `'en-US'` fixo do projeto).
- Nome de coisa do jogo (item, magia, poder, qualidade, perícia, metatipo, programa, tradição) fica no original, como o Chummer mostra. Palavra de regra que o gerador escreve sozinho é traduzida na tela por `termo('grade')` etc. (tabela `TERMOS` no fim de `formato.js`: Grau, Essência, Dreno, carma, Custo). Ficam no original: Rating, Fade, Edge e as estatísticas de Matrix e veículo.
- `node tools/testar.js` tem um teste que trava essa regra.

## Frases com número e concordância (v55)
- Frase com número, plural ou nome de coisa do jogo no meio é **uma chave inteira com `{variáveis}`** em `data/textos-plural.js`, nunca texto colado em JS. Quem traduz reordena as palavras sem tocar no código.
- Plural: `chave.one` / `chave.other` lidos por `tn('chave', n, {outras})` (regras por idioma em `PLURAL`, `logic/i18n.js`). Nada de `arquivo(s)`, `mês(es)`, `serviço(s)`: o teste `node tools/testar.js` falha se voltar.
- Nome de perícia, item, magia etc. entra por variável (`{p}`) e fica no original; só a moldura ("perícia {p} {r}", "Atributo ligado: {k} · Nível {r}") é traduzida. Lista com "e": `listaE([...])`.
- "N de F caixas", "lealdade X/6" e a Moral do grupo seguem o mesmo modelo (`cond.caixas`, `cond.perfil`, `loy.media`, `grupo.moral`).
- Função com variável local chamada `t` (ex.: `critter-condutas.js`) usa o alias `traduz()`.
- Fora desta rodada: os bancos de condutas (`data/condutas-*.js`, `{a|b}`) e as Notas dos arquivos continuam em português.

## v56: texto de livro fora do HTML (só vem dos PDFs do usuário)
O HTML não leva mais texto de regra dos livros (a Catalyst é titular desse texto; o aviso de GPL do Chummer cobre o código, não o texto dos livros).
- `data/critter-textos.json` (descrição completa de 7 poderes de critter) foi **removido** junto com a constante `CNT`. A nota do poder de critter nasce vazia em `logic/critter-xml.js`; o texto entra pelo mesmo caminho dos outros itens (`NOTES.xml` → `bookLines`, e `jsonQuality` no JSON), a partir do PDF do livro que o usuário carregou. Sem o PDF, a nota leva só o resumo (fonte, página, Type/Action/Range/Duration).
- `data/chummer-extras.json`: `MEN` e `PAR` não trazem mais `adv` (vantagem) e `dis` (desvantagem). `tools/gen_extras.py` deixou de copiar `<advantage>`/`<disadvantage>`. A ficha mostra o texto do mentor/paragon na dica do livro, a partir do PDF; sem o PDF, a dica diz qual PDF falta. Ficam `n`, `id`, `src`, `pg`, `rq` e `ch` (as escolhas que viram bônus na ficha).
- Quem importar a pasta do Chummer continua com `adv`/`dis` do próprio `mentors.xml` (cópia local, guardada só no navegador de quem importou; `logic/extras-importar.js`).
- `adv`/`dis` vazios viram `''` (e não "undefined") na ficha, no XML e no JSON.
- Referência `tools/impressao.base.pt.json`: só o hash de `grupos` mudou (grupos com mentor perderam o texto). Com o JSON antigo de volta, a impressão fica idêntica à anterior.
