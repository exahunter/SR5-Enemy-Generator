// Carrega as regras do idioma pedido (--lang pt, padrão pt). Falta o arquivo? Diz qual criar e sai.
const fs=require('fs'),path=require('path');
module.exports=(argv=process.argv)=>{const i=argv.indexOf('--lang'),cod=i<0?'pt':argv[i+1],f=path.join(__dirname,cod+'.js');
 if(!/^[a-z]{2}(-[A-Za-z]{2})?$/.test(cod)||!fs.existsSync(f)){console.error(`sem regras para o idioma "${cod}": crie tools/idioma/${cod}.js (copie pt.js e traduza as expressões)`);process.exit(2)}
 return Object.assign(require(f),{cod})};
