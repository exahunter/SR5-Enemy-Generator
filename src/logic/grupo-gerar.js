const genGroup=comCamadas('genGroup',function(n,pr,type0,metaSel){const C=COMPS[GEN.comp]||COMPS.grp,roles=C[1].slice(0,n),pool=(C[4]&&C[4].length)?C[4]:Object.keys(TYPES),gt=type0==='__auto'?pick(pool):type0,tp=()=>type0==='__auto'&&C[5]?pick(pool):gt;while(roles.length<n)roles.push(pick(C[2]));
 const cl=p=>Math.max(0,Math.min(LVMAX,p)),LD=['Líder','Sargento','Chefe','Supervisor'],SPC={Decker:'Decker',Mago:'Mage','Mago de segurança':'Mage',Adepto:'Adept','Adepto místico':'Mystic',Místico:'Mystic',Tecnomante:'Technomancer',Sacerdote:'Mage'},DL={Novato:-2,Assistente:-2,Capanga:-1,Fiel:-1,'Guarda-costas':1,Sacerdote:1};
 const BO=ROLE_BO;
 const usedEst={};   /* v42: cada repetição do mesmo estilo no grupo pesa menos (medido: capangas de gangue saíam quase todos Membro de bando) */
 const L=roles.map(r=>{let c;const type=tp();{const pf=compPref(GEN.comp,r);GEN.persPref=pf&&pf.map(([k,w])=>[k,w/(1+.7*(usedEst[k]||0))])}
  if(LD.includes(r))c=genNPC(cl(pr+1),type,'Lieutenant',metaSel);
  else if(r==='Segundo em comando')c=genNPC(cl(pr),type,'Lieutenant',metaSel);
  else if(r==='Especialista')c=genNPC(cl(pr),type,pick(['Decker','Adept','Mage','Mystic','Technomancer','Rigger']),metaSel);
  else if(SPC[r])c=genNPC(cl(pr+(DL[r]||0)),type,SPC[r],metaSel);
  else if(r==='VIP')c=genNPC(cl(pr),'Executivo / Mr. Johnson','',metaSel);
  else if(r==='Assistente')c=genNPC(cl(pr-2),'Wage slave (funcionário corporativo)','',metaSel);
  else if(r==='Atirador'){c=genNPC(cl(pr),type,'',metaSel);roleFx(c,r)}
  else{c=genNPC(cl(pr+(DL[r]||0)),type,'',metaSel);roleFx(c,r)}
  GEN.persPref=null;{const s0=c.npc.pers&&c.npc.pers.s&&c.npc.pers.s[0];if(s0)usedEst[s0.k]=(usedEst[s0.k]||0)+1}c.npc.role=r;return c});
 genRels(L,pick(C[3]));return L});
