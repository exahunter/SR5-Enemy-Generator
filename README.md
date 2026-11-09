# Gerador de Inimigos SR5 / SR5 Enemy Generator

**PT** · Gerador de NPCs, grupos e critters de Shadowrun 5ª edição, num único arquivo HTML que roda no navegador, sem internet. Exporta fichas para o **Chummer** (`.chum5`) e JSON compatível com o importador do **Foundry**.

**EN** · Shadowrun 5th edition NPC, group and critter generator in a single HTML file that runs in the browser, offline. Exports to **Chummer** (`.chum5`) and Foundry-compatible JSON.

## Como usar / How to use
1. Abra `index.html` no navegador (ou o link do GitHub Pages). / Open `index.html` in your browser (or the GitHub Pages link).
2. Opcional: no painel **Livros ativos e PDFs**, carregue os **seus** PDFs dos livros. Com eles, o texto de regra aparece ao passar o mouse nos itens e entra nas Notas dos arquivos exportados. / Optional: load **your own** book PDFs in the **Active books and PDFs** panel. With them, rule text shows on hover and goes into the Notes of exported files.
3. Opcional: importe a pasta `data/` do seu Chummer para usar o seu catálogo. / Optional: import your Chummer `data/` folder to use your own catalog.

## Texto dos livros / Book text
Este projeto **não distribui texto dos livros**. O texto de regra só aparece a partir dos PDFs que você carrega no seu próprio navegador; eles não são enviados a nenhum servidor.
This project **does not distribute book text**. Rule text only appears from the PDFs you load in your own browser; they are never uploaded anywhere.

## Licença / License
Copyright (C) 2026 Luã Sol. Software livre sob a **GNU GPL v3 ou posterior** (arquivo [`LICENSE`](LICENSE)), sem nenhuma garantia. / Free software under the **GNU GPL v3 or later** (see [`LICENSE`](LICENSE)), with no warranty.

Este trabalho é **derivado de dados e código do [Chummer5a](https://github.com/chummer5a/chummer5a)** (GPL-3.0) e foi modificado (versão atual: novembro de 2026). Inclui, sem alterações, o **pdf.js** (Apache-2.0) e o **JSZip** (MIT ou GPL-3.0), em `vendor/`, com seus avisos de copyright.
This work is **derived from data and code of [Chummer5a](https://github.com/chummer5a/chummer5a)** (GPL-3.0) and has been modified (current version: November 2026). It bundles, unmodified, **pdf.js** (Apache-2.0) and **JSZip** (MIT or GPL-3.0) in `vendor/`, with their copyright notices.

**Projeto de fãs, não afiliado à Catalyst Game Labs.** Shadowrun é marca registrada da Catalyst Game Labs / Topps. A GPL cobre o código e os dados deste projeto, não o texto nem as marcas dos livros. / **Fan project, not affiliated with Catalyst Game Labs.** Shadowrun is a trademark of Catalyst Game Labs / Topps. The GPL covers this project's code and data, not the books' text or trademarks.

## Código-fonte e compilação / Source and build
O HTML é montado a partir de `src/` por `build.js` (Node.js, sem dependências):
The HTML is assembled from `src/` by `build.js` (Node.js, no dependencies):

```
node build.js            # gera dist/Gerador_de_Inimigos_SR5_v<versão>.html
node build.js --check    # confere a sintaxe de cada arquivo
```

Para publicar, defina `"repositorio"` no `package.json` com a URL do repositório: ela aparece no rodapé do HTML, junto do aviso de licença. / When publishing, set `"repositorio"` in `package.json` to the repository URL: it shows in the HTML footer next to the license notice.

Notas de desenvolvimento (em português): [`DESENVOLVIMENTO.md`](DESENVOLVIMENTO.md).
