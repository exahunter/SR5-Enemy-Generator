// Ordem de execução = ordem desta lista (os 3 <script> compartilham o mesmo escopo global).
// string = arquivo; {line:[...]} = linha de dados (texto + JSON); {wrap:[abre,fecha],files:[...]} = bloco envolvido.
module.exports={
 "template": "ui/template.html",
 "css": "ui/estilos.css",
 "scripts": [
  {
   "nome": "base",
   "files": [
    "logic/compat.js",
    "logic/util.js",
    "logic/i18n.js",
    "data/en.js",
    "logic/formato.js",
    "data/textos-template.js",
    "data/textos-plural.js",
    "data/textos-ferimento.js",
    "logic/ferimento.js",
    "data/textos-pdf.js",
    "logic/camadas.js",
    "logic/estado.js",
    "data/tabelas-base.js",
    {
     "line": [
      "const QXD=",
      {
       "json": "data/qualidades.json"
      },
      ";"
     ]
    },
    "data/tabelas-jogo.js",
    "logic/armazenamento.js",
    "data/livros.js",
    {
     "line": [
      "let ITEMS=",
      {
       "json": "data/itens.json"
      },
      ";"
     ]
    },
    "data/metatipo-ids.js",
    {
     "line": [
      "const SID0=",
      {
       "json": "data/skill-ids.json"
      },
      ";const DATA={sid:Object.assign({},SID0)};const FOUND=new Set();const first={};"
     ]
    },
    "logic/metatipos.js",
    "logic/chummer-parse.js",
    "logic/importar-arquivos.js",
    "data/afinidades-npc.js",
    "data/personalidade.js",
    "data/taticas.js",
    "data/personalidade-extra.js",
    "data/personalidade-v40.js",
    "data/perfil-ocupacao.js",
    "data/condutas-alta.js",
    "data/condutas-baixa.js",
    "data/condutas-perfil.js",
    "data/condutas-v40.js",
    "data/critter-condutas.js",
    "data/critter-acoes.js",
    "data/ids-funcao.js",
    "data/grupo-taticas.js",
    "logic/personalidade.js",
    "logic/npc-base.js",
    {
     "line": [
      "const MTD=",
      {
       "json": "data/metatipos-lim.json"
      },
      ";Object.entries(MTD).forEach(([n,d])=>{const m=META[n];if(!m)return;m.lim=d.lim;m.id=d.id;delete m.approx});"
     ]
    },
    "logic/npc-qualidades.js",
    "data/tipos-npc.js",
    "logic/npc-gerar.js",
    "ui/downloads.js",
    "ui/render-npc.js",
    {
     "line": [
      "const CRITX=",
      {
       "json": "data/critters.json"
      },
      ";"
     ]
    },
    "logic/critters.js",
    "ui/editar-ficha.js",
    "logic/derivados.js",
    "logic/xml-base.js",
    "logic/combate.js",
    "logic/origem-helpers.js",
    "logic/origem-itens-skills.js",
    "logic/origem-derivados.js",
    "logic/origem-json-base.js",
    "logic/pipelines.js",
    "ui/painel-modo.js",
    "logic/geracao-grupo.js",
    "ui/eventos.js"
   ]
  },
  {
   "nome": "extensoes",
   "files": [
    "data/contatos-tradicoes.js",
    "logic/importar-extras.js",
    "logic/xml-extras.js",
    "logic/grupo-composicao.js",
    "logic/grupo-gerar.js",
    "ui/decorador-vinculo.js",
    "ui/campos-persistentes.js",
    "ui/penalidade-ferimento.js",
    {
     "line": [
      "const EMB=",
      {
       "json": "data/chummer-embutido.json"
      },
      ";"
     ]
    },
    {
     "line": [
      "const ALC=",
      {
       "json": "data/alcances.json"
      },
      ";"
     ]
    },
    {
     "line": [
      "const INI=",
      {
       "json": "data/iniciacao.json"
      },
      ";"
     ]
    },
    {
     "line": [
      "const KITP=",
      {
       "json": "data/kits-prontos.json"
      },
      ";"
     ]
    },
    {"line":["const SPK=",{"json":"data/especializacoes.json"},";"]},
    "logic/embutido-pos.js",
    "logic/magias-heranca.js",
    "logic/poderes.js",
    "logic/artes-marciais.js",
    "data/veiculo-modulos.js",
    "logic/veiculo-modulos.js",
    "logic/rigger.js",
    "logic/decker.js",
    "logic/npc-gerar-ext.js",
    {"line":["const MAGIA=",{"json":"data/magia-dados.json"},";"]},
    "logic/mago.js",
    "ui/decorador-arte-marcial.js",
    "logic/importar-arte-marcial.js",
    {
     "line": [
      "/* ===== Exportacao de critters (.chum5), modelada na ficha de referencia ===== */"
     ]
    },
    {
     "line": [
      "const CPW=",
      {
       "json": "data/critter-poderes.json"
      },
      ",CWK=",
      {
       "json": "data/critter-fraquezas.json"
      },
      ";"
     ]
    },
    "logic/critter-xml.js",
    "logic/implantes-estado.js",
    {
     "line": [
      "const IMP0=",
      {
       "json": "data/implantes.json"
      },
      ";"
     ]
    },
    "logic/implantes.js",
    "logic/notas.js",
    "ui/interface-limpa.js",
    "logic/rerrolar.js",
    "logic/subir-nivel.js",
    "data/nomes.js",
    "logic/recursos.js",
    "logic/ganchos.js",
    {"line":["const LMD=",{"json":"data/lifemodules.json"},";"]},
    "logic/historico.js",
    "logic/grupo-resumo.js",
    "ui/decorador-ganchos.js",
    "ui/decorador-historico.js",
    "ui/decorador-personalidade.js",
    "ui/decorador-condutas.js",
    "ui/decorador-condutas-critter.js",
    "data/equip-tabelas.js",
    "data/kits-ocupacao.js",
    "data/perfis-novos.js",
    "logic/equipamento.js",
    "logic/arma-natural.js",
    "logic/taticas.js",
    "logic/personalidade-ligacao.js",
    "logic/perfil-ocupacao.js",
    "logic/equip-ilegal.js",
    "logic/condutas.js",
    "logic/critter-condutas.js",
    "logic/grupo-taticas.js",
    {
     "line": [
      "const ACOES=",
      {
       "json": "data/acoes.json"
      },
      ";"
     ]
    },
    "data/acoes-regras.js",
    "data/acoes-regras-v40.js",
    "logic/acoes.js",
    {
     "line": [
      "const XD=",
      {
       "json": "data/chummer-extras.json"
      },
      ";"
     ]
    },
    "logic/extras-chummer.js",
    "logic/extras-importar.js",
    "data/especializacoes-perfil.js",
    "logic/especializacoes.js",
    "ui/decorador-extras.js",
    "ui/organizar-ficha.js",
    "ui/caixas-dano.js",
    "ui/ficha-mesa.js",
    "ui/ficha-manual.js",
    "logic/importar-fichas.js",
    "ui/eventos-fichas.js",
    "ui/decorador-favoritos-travas.js",
    "ui/barra-ajustar.js",
    "ui/achar-fichas.js",
    "ui/grupo-colapso.js",
    "ui/regras-hover.js",
    "logic/desfazer.js",
    "ui/init-fichas.js",
    {
     "line": [
      "/* ===== JSON no formato de exportação do Chummer (o que a importação do Foundry VTT lê) ===== */\n",
      "const SPD=",
      {
       "json": "data/magias-detalhes.json"
      },
      ";"
     ]
    }
   ]
  },
  {
   "nome": "livros",
   "files": [
    "logic/ajustes-dados.js",
    "ui/primeiros-passos.js",
    {
     "wrap": [
      "/* Leitor de pasta do Chummer + Índice mestre (como o MasterIndex do Chummer: nome, seção, livro e página de tudo que está nos XML). */\n(function(){",
      "})();\n"
     ],
     "files": [
      "logic/mestre-indice.js",
      "ui/mestre-indice.js",
      "logic/mestre-pasta.js",
      "ui/pdf-painel.js",
      "logic/pdf-leitura.js",
      "ui/pdf-calibrador.js",
      "ui/pdf-busca.js",
      "logic/pdf-notas.js",
      "logic/pdf-qualidades.js",
      "logic/pdf-resolver.js",
      "logic/pdf-json-notas.js",
      "ui/dica-livro.js"
     ]
    }
   ]
  }
 ]
};
