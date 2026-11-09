/* Primeiros passos (v45.1): mostra o que já vem embutido, o que foi importado e o que cada XML acrescenta.
   Fica no painel Livros ativos e PDFs, acima da mensagem de importação (#pp). Só lê estado; não muda a geração. */
const PP_XML=[
 ['weapons','weapons.xml',xl('armas, kits de arma, arcos, lançadores')],
 ['armor','armor.xml','armaduras e capacetes'],
 ['gear','gear.xml',xl('comlinks, decks, programas, munição, equipamento')],
 ['cyberware','cyberware.xml',xl('implantes (cyber e bio)')],
 ['vehicles','vehicles.xml',xl('veículos e drones')],
 ['skills','skills.xml',xl('perícias (IDs do Chummer)')],
 ['metatypes','metatypes.xml','metatipos e metasapientes'],
 ['critters','critters.xml',xl('critters e espíritos')],
 ['qualities','qualities.xml',xl('qualidades')],
 ['spells','spells.xml',xl('feitiços')],
 ['ranges','ranges.xml',xl('alcances das armas')],
 ['martialarts','martialarts.xml','artes marciais'],
 ['powers','powers.xml',xl('poderes de adepto')],
 ['books','books.xml',xl('lista de livros')]];
function ppContagens(){const n=c=>ITEMS.filter(i=>i[0]===c).length;
 return[[xl('armas'),n('weapon')],[xl('armaduras'),n('armor')],[xl('comlinks/decks'),n('comm')],[xl('drones'),n('drone')],[xl('veículos'),n('veh')],[xl('feitiços'),SPELLS.length],['critters',CRIT.length],[xl('qualidades'),POS.length+NEG.length]]}
async function drawPrimeirosPassos(){const el=document.getElementById('pp');if(!el)return;
 let l=[];try{l=await stAll()}catch(e){avisa('primeiros-passos',e)}
 const nm=f=>f.name.toLowerCase().replace(/\.xml$/,'').replace(/__\d+$/,''),tem=k=>l.some(f=>nm(f).startsWith(k));
 const cont=ppContagens(),red=typeof eqSemWeaponsXml==='function'&&eqSemWeaponsXml(),nimp=PP_XML.filter(x=>tem(x[0])).length;
 el.innerHTML='<b>'+xl('Primeiros passos')+'</b><div>'+(red?xl('O catálogo de armas está reduzido (veja o aviso no topo). Use <b>Restaurar catálogo embutido</b> ou importe o weapons.xml.'):xl('Já dá para gerar: o catálogo completo vem embutido neste arquivo. Importar XML é opcional e serve para usar exatamente os dados e livros da <b>sua</b> versão do Chummer (livros novos, itens da comunidade).'))+'</div>'
 +'<div class="ppst">'+cont.map(c=>'<span><b>'+c[1]+'</b> '+esc(c[0])+'</span>').join('')+'</div>'
 +'<details><summary>'+xl('Quais XML posso importar (')+nimp+xl(' de ')+PP_XML.length+xl(' já importados)</summary><div class="note" style="margin:6px 0">Pasta <b>data</b> do seu Chummer. Selecione vários de uma vez em “Dados do seu Chummer” (Opções avançadas).</div>')
 +PP_XML.map(x=>{const ok=tem(x[0]);return'<div class="pprow"><span>'+esc(x[1])+' <span class="note">'+esc(x[2])+'</span></span><span class="'+(ok?'ppok':'note')+'">'+(ok?'✔ '+xl('importado'):xl('embutido'))+'</span></div>'}).join('')+'</details>'}
drawPrimeirosPassos();
