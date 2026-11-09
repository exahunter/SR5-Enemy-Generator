/* ===== Nomes por cultura e metatipo =====
   Cada NPC recebe uma cultura (define nome, sobrenome e idioma nativo). O metatipo muda o peso das culturas e a chance de apelido de rua.
   Em grupos, parte dos membros divide a mesma cultura (GEN.cultHint). */
const NM_CULT={
 'Anglo':{w:14,l:['English'],f:['James','Emily','Jack','Hannah','Connor','Megan','Tyler','Rachel','Dylan','Kayla','Nolan','Brianna','Wade','Kelsey','Colin','Tessa','Owen','Jenna','Travis','Holly','Cole','Mia','Reid','Piper','Grant','Shay'],s:['Walker','Hayes','Blackwood','Fitzgerald','Hollis','Drummond','Harlow','Mercer','Sullivan','Brooks','Callahan','Pruitt','Delaney','Rutledge','Whitaker','Monroe','Frost','Cole','Barlow','Quigley']},
 'Brasileira':{w:8,l:['Portuguese'],f:['Ana','Beatriz','Bruno','Camila','Caio','Daniela','Diego','Eduardo','Fernanda','Gabriel','Helena','Igor','Isadora',xl('João'),'Juliana','Larissa','Leandro','Lucas','Mariana','Mateus',xl('Natália'),xl('Otávio'),'Paulo','Rafaela','Renato','Sabrina','Tiago','Vanessa','Wellington','Yasmin'],s:['Silva','Souza','Oliveira','Santos','Pereira','Costa','Rodrigues','Almeida','Nascimento','Lima',xl('Araújo'),'Ribeiro','Carvalho','Gomes','Martins','Barbosa','Rocha','Dias','Moreira','Teixeira','Cardoso','Mendes','Freitas','Batista','Ferraz']},
 'Latina':{w:8,l:['Spanish'],f:['Alejandro','Camila','Carlos','Catalina','Diego','Elena','Fernando','Gabriela','Ignacio','Isabel','Javier',xl('Lucía'),'Mateo','Mariana',xl('Nicolás'),'Paola','Rafael',xl('Sofía'),'Santiago','Valentina','Ximena',xl('Andrés'),xl('Rocío'),xl('Tomás'),'Marisol','Esteban'],s:[xl('García'),xl('Rodríguez'),xl('Martínez'),xl('López'),xl('Hernández'),'Sandoval','Quintero','Reyes','Morales','Ortega','Vargas','Castillo','Mendoza','Rojas','Fuentes','Navarro','Salazar','Cabrera',xl('Domínguez'),xl('Echeverría')]},
 'Japonesa':{w:8,l:['Japanese'],f:['Haruto','Aiko','Kenji','Yuki','Hiro','Sakura','Daichi','Mei','Ren','Hana','Takeshi','Rina','Shun','Akari','Kaito','Noriko','Ryo','Miyu','Isamu','Emi','Jun','Saki','Taro','Yui'],s:['Tanaka','Nakamura','Hayashi','Yamada','Takeda','Ueda','Sato','Suzuki','Kobayashi','Watanabe','Ito','Matsumoto','Inoue','Kimura','Shimizu','Yoshida','Mori','Hashimoto','Fujita','Ogawa']},
 'Chinesa':{w:7,l:['Mandarin','Mandarin','Cantonese'],f:['Wei','Lei','Mei','Jun','Ling','Hao','Ying','Tao','Xin','Yan','Bo','Fang','Jian','Lan','Ming','Qiang','Shu','Yu','Zhen','Hui'],s:['Zhang','Wang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou','Xu','Sun','Ma','Zhu','Hu','Guo','Lin','He','Gao','Luo','Zheng']},
 'Coreana':{w:3,l:['Korean'],f:['Min-jun','Seo-yeon','Ji-ho','Ha-eun','Dong-hyun','Soo-jin','Hyun-woo','Yuna','Tae-yang','Eun-ji','Joon','Mi-rae'],s:['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim','Han','Oh']},
 'Russa':{w:5,l:['Russian'],f:['Viktor','Olga','Dmitri','Nikolai','Irina','Boris','Svetlana','Yuri','Anya','Pavel','Katya','Sergei','Vera','Anton','Tatiana','Misha','Zoya','Maxim','Larisa','Ilya','Galina','Oleg'],s:['Ivanov','Petrov','Volkov','Sokolov','Morozov','Novikov','Kuznetsov','Popov','Lebedev','Orlov','Smirnov','Fedorov','Kozlov','Zaitsev','Belov','Gromov']},
 'Alemã / nórdica':{w:5,l:['German','German','Swedish'],f:['Lukas','Greta','Sven','Ingrid','Jonas','Freya','Henrik','Astrid','Klaus','Liesel','Bjorn','Sigrid','Matthias','Elsa','Gunnar','Helga','Anders','Karin','Ragnar','Maren','Jens','Ylva','Stefan','Hanne'],s:['Weber','Kruger','Lindqvist','Eriksen','Johansson','Schmidt','Becker','Hoffmann','Larsen','Andersen','Nilsson','Bauer','Fischer','Rask','Halvorsen','Brandt','Voss','Lund']},
 'Francesa':{w:3,l:['French'],f:[xl('Étienne'),'Camille','Luc','Margaux','Julien',xl('Élodie'),'Hugo',xl('Océane'),'Mathieu',xl('Chloé'),'Antoine','Manon','Baptiste',xl('Léa'),xl('Rémy'),'Juliette','Thibault','Inès'],s:['Dubois','Moreau','Fontaine','Lacroix','Laurent','Girard','Bonnet','Lambert','Faure','Mercier','Rousseau','Vidal','Marchand','Perrin']},
 'Italiana':{w:3,l:['Italian'],f:['Luca','Giulia','Marco','Chiara','Matteo','Francesca','Lorenzo','Sofia','Davide','Elena','Alessio','Valentina','Gianni','Silvia','Enzo','Paola'],s:['Rossi','Marchetti','Grimaldi','Ricci','Conti','Esposito','Greco','Bruno','Ferrari','Romano','Giordano','Lombardi','Vitale','Castellan']},
 'Árabe / persa':{w:4,l:['Arabic','Arabic','Farsi'],f:['Omar','Layla','Farid','Nadia','Karim','Samira','Yusuf','Amira','Tariq','Leila','Rashid','Zahra','Hassan','Noor','Idris','Soraya','Khalid','Dalia','Kian','Parisa'],s:['Al-Farsi','Haddad','Mansour','Nasser','Khalil','Rahimi','Saleh','Zaman','Qureshi','Hakimi','Aziz','Barakat','Darwish','Ghanem','Tehrani']},
 'Africana':{w:5,l:['English','English','Swahili','Yoruba'],f:['Kofi','Ama','Chidi','Ngozi','Tunde','Amara','Kwame','Folake','Sipho','Zanele','Jelani','Nia','Olu','Adaeze','Baraka','Imani','Obinna','Fatou','Thabo','Lerato'],s:['Okafor','Idowu','Abara','Oyelaran','Mensah','Adeyemi','Nkosi','Diallo','Kamau','Owusu','Bello','Mbeki','Okoye','Dlamini','Asante','Kone']},
 'Indiana':{w:4,l:['Hindi','English'],f:['Priya','Arjun','Anika','Rohan','Kavya','Vikram','Meera','Aditya','Sunita','Ravi','Ishaan','Deepa','Kabir','Lakshmi','Nikhil','Tara'],s:['Sharma','Patel','Iyer','Reddy','Gupta','Nair','Chopra','Banerjee','Mehta','Rao','Kapoor','Desai','Singh','Joshi']},
 'Élfica (Tír)':{w:2,l:['Sperethiel','Sperethiel','English'],f:['Aelwyn','Caelan','Eirlys','Faolan','Niamh','Saoirse','Tiernan','Sorcha','Lorcan','Ailis','Cormac','Deirdre','Eoghan','Rhiannon','Cian','Maeve',xl('Oisín'),'Aoife','Fionn','Branwen'],s:['Brennan','Gallagher','Quinlan','Maguire','Donnelly','Fitzpatrick','Lennox','Kavanagh','Tierney',xl('Ó Cathasaigh'),'Mac Aodha',xl('Ní Bhraonáin')]}
};
const NM_NICK=['Razor','Static','Sixer','Patch','Dice','Rook','Ash','Hex','Bolt','Chrome','Slate','Nails','Cinder','Tick','Moth','Gator','Lockjaw','Dusty','Pinball','Ledger','Tin','Switch','Wick','Crow','Fuse','Gristle','Halo','Jinx','Mouse','Rivet'];
const NM_AI=['ARIA','Halcyon','Echo','Vesper','Null','Oracle','Cipher','Lumen','Prisma','Tessera'];
/* multiplicadores de peso por metatipo-base (o que não aparece vale 1) */
const NM_META={Elf:{'Élfica (Tír)':25,'Anglo':.7},Dwarf:{'Alemã / nórdica':2.5,'Russa':2},Ork:{'Latina':1.5,'Africana':1.8,'Brasileira':1.4},Troll:{'Alemã / nórdica':3,'Africana':2,'Russa':1.5}};
const NM_NICKP={Human:.08,Elf:.06,Dwarf:.12,Ork:.35,Troll:.30};   // chance de apelido de rua
const NM_TIPO={'Sindicato (máfia, yakuza, vory)':{Japonesa:3,Russa:3,Italiana:3,Chinesa:2}};
const nomeFull=n=>n.f+(n.nick?' “'+n.nick+'”':'')+(n.s?' '+n.s:'');
function genNome(meta,type){
 const m=META[meta]||{},base=m.par||meta;
 if(m.ai){const a=pick(NM_AI)+'-'+R(2,99);return{f:a,s:'',nick:'',cult:xl('Sintética'),l:'English',alias:a}}
 const mw=NM_META[base]||{},tw=NM_TIPO[type]||{},hasT=Object.keys(tw).length,h=GEN.cultHint;
 const cult=h&&NM_CULT[h.c]&&Math.random()<h.p?h.c:wchoose(Object.keys(NM_CULT),k=>NM_CULT[k].w*(mw[k]??1)*(hasT?(tw[k]??.2):1));
 const C=NM_CULT[cult],f=pick(C.f),s=pick(C.s),g=(TYPES[type]||{}).g||'';
 const np=m.grp==='Metasapientes'?.7:Math.min(.7,(NM_NICKP[base]??.2)+(/^(Rua e crime|Sombras)$/.test(g)?.12:0));
 const nick=Math.random()<np?pick(NM_NICK):'',n={f,s,nick,cult,l:pick(C.l)};n.alias=nomeFull(n);return n}
/* parentes: mesmo sobrenome e mesma cultura (o primeiro nome vem do pool da cultura do outro) */
function parentesco(a,b){const A=a.npc&&a.npc.nm,B=b.npc&&b.npc.nm;
 if(!A||!B||!A.s||!NM_CULT[A.cult])return;
 B.cult=A.cult;B.s=A.s;B.f=pick(NM_CULT[A.cult].f);B.l=A.l;b.npc.nm=B;b.alias=nomeFull(B);b.lang=B.l}
