#!/usr/bin/env node
// Gerador de Inimigos SR5 — Copyright (C) 2026 Luã Sol
// Software livre: você pode redistribuí-lo e/ou modificá-lo sob os termos da GNU General Public License, versão 3 ou (à sua escolha) qualquer versão posterior.
// Distribuído SEM NENHUMA GARANTIA. Veja o arquivo LICENSE. Derivado de dados e código do Chummer5a (GPL-3.0). Não afiliado à Catalyst Game Labs.
// Monta o HTML único a partir de src/.
//   node build.js                       -> dist/<nome>.html
//   node build.js --out arquivo.html    -> grava em outro caminho
//   node build.js --verify ref.html     -> não grava; compara com um HTML de referência (sai com código 1 se diferir)
//   node build.js --check               -> só confere a sintaxe de cada arquivo de src/ (sem montar)
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, 'src'), M = require('./src/manifest.js');
const NOME = 'Gerador_de_Inimigos_SR5_v' + require('./package.json').geradorVersao + '.html';   // a versão mora só no package.json
const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : (process.argv[i + 1] || true); };
const read = rel => fs.readFileSync(path.join(SRC, rel), 'utf8');
const body = rel => read(rel).replace(/\n$/, '');                  // todo arquivo termina em \n; ele não faz parte do conteúdo
const json = rel => JSON.stringify(JSON.parse(read(rel)));        // data/*.json pode ser formatado à vontade: sai minificado

function piece(e, ctx) {
  if (typeof e === 'string') { ctx.files.push(e); return body(e); }
  if (e.line) return e.line.map(p => typeof p === 'string' ? p : (ctx.files.push(p.json), json(p.json))).join('');
  if (e.wrap) return [e.wrap[0], ...e.files.map(f => piece(f, ctx)), e.wrap[1]].join('\n');
  throw new Error('entrada inválida no manifest: ' + JSON.stringify(e).slice(0, 80));
}
function montar() {
  const ctx = { files: [] };
  const blocos = M.scripts.map(s => '<script>\n' + s.files.map(f => piece(f, ctx)).join('\n') + '\n</script>');
  const vend = n => fs.readFileSync(path.join(__dirname, 'vendor', n)),   // bibliotecas embutidas (funcionam sem internet)
    pdfjs = '<script type="text/plain" id="pdfjs-main">' + vend('pdf.min.mjs').toString('base64') + '</script>\n<script type="text/plain" id="pdfjs-worker">' + vend('pdf.worker.min.mjs').toString('base64') + '</script>';
  // Fonte Chakra Petch: se vendor/fonts/ChakraPetch-{500,700}.woff2 existirem, entram em base64 (offline). Sem eles, vale a pilha do sistema.
  const fonte = (peso, f) => fs.existsSync(path.join(__dirname, 'vendor', 'fonts', f)) ? '@font-face{font-family:"Chakra Petch";font-weight:' + peso + ';font-display:swap;src:url(data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, 'vendor', 'fonts', f)).toString('base64') + ') format("woff2")}\n' : '';
  const fontes = fonte(500, 'ChakraPetch-500.woff2') + fonte(700, 'ChakraPetch-700.woff2');
  const pkg = require('./package.json'), srcLink = pkg.repositorio ? '<a href="' + pkg.repositorio + '" target="_blank" rel="noopener">' + pkg.repositorio + '</a>' : '';
  const html = read(M.template).replace('@@FONTE@@', () => srcLink).replace('@@CSS@@', () => fontes + body(M.css)).replace('@@JSZIP@@', () => vend('jszip.min.js').toString('utf8')).replace('@@PDFJS@@', () => pdfjs).replace('@@SCRIPTS@@', () => blocos.join('\n'));
  return { html, usados: [...ctx.files, M.template, M.css] };
}
function validar(usados) {                                           // manifest e pasta src/ precisam concordar
  const todos = [], ler = d => fs.readdirSync(d, { withFileTypes: true }).forEach(n => {
    const p = path.join(d, n.name); n.isDirectory() ? ler(p) : todos.push(path.relative(SRC, p).split(path.sep).join('/'));
  });
  ler(SRC);
  const dup = usados.filter((f, i) => usados.indexOf(f) !== i), orf = todos.filter(f => f !== 'manifest.js' && !usados.includes(f));
  dup.forEach(f => console.error('ERRO: arquivo listado 2x no manifest: ' + f));
  orf.forEach(f => console.error('ERRO: src/' + f + ' existe mas não está no manifest (não entraria no HTML)'));
  return dup.length + orf.length;
}
function checar() {                                                  // cada .js precisa ser um trecho de código válido
  let ruim = 0;
  const vis = (e, dentro) => {
    if (typeof e === 'string') {
      if (!e.endsWith('.js')) return;
      const t = body(e);
      for (const w of dentro ? ['(async function(){\n', '(function(){\n'] : ['', '(async function(){\n']) {
        try { new vm.Script(w + t + (w ? '\n})' : ''), { filename: e }); return; } catch (x) { var err = x; }
      }
      ruim++; console.error('ERRO de sintaxe em src/' + e + ': ' + err.message);
    } else if (e.wrap) e.files.forEach(f => vis(f, true));
  };
  M.scripts.forEach(s => s.files.forEach(f => vis(f, false)));
  return ruim;
}
if (process.argv.includes('--check')) { const n = checar() + validar(montar().usados); console.log(n ? n + ' arquivo(s) com erro' : 'sintaxe OK'); process.exit(n ? 1 : 0); }
const { html, usados } = montar();
if (validar(usados)) process.exit(1);
const ref = arg('--verify');
if (ref) {
  const r = fs.readFileSync(ref, 'utf8');
  if (r === html) { console.log('IDÊNTICO ao de referência (' + html.length + ' caracteres)'); process.exit(0); }
  let i = 0; while (i < r.length && r[i] === html[i]) i++;
  console.error('DIFERE a partir do caractere ' + i + '\n  ref : ' + JSON.stringify(r.slice(i, i + 80)) + '\n  novo: ' + JSON.stringify(html.slice(i, i + 80)));
  process.exit(1);
}
const out = typeof arg('--out') === 'string' ? arg('--out') : path.join(__dirname, 'dist', NOME);
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
console.log('gerado: ' + out + ' (' + (html.length / 1024).toFixed(0) + ' KB)');
