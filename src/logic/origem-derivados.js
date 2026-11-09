/* derivados: nascem prontos, ninguém recalcula depois */
function xStats(c){
const a=c.at||{},A=k=>+a[k]||0,S=xS,d=derived(c),DI=d.dice,
BOD=A('BOD'),AGI=xE(c,'AGI'),REA=xE(c,'REA'),STR=xE(c,'STR'),CHA=A('CHA'),INT=A('INT'),LOG=A('LOG'),WIL=A('WIL'),
arm=eqArm(c)+augm(c).AR,
o={},set=(k,v)=>o[k]=S(v);
set('movement',(AGI*2)+'/'+(AGI*4)+'; 2m / hit, Swim: 3; 1m / hit');
['walk','run','sprint'].forEach(k=>set(k,o.movement));
set('movementwalk',(AGI*2)+'/'+(AGI*4)+'; 2m / hit');set('movementswim','3; 1m / hit');set('movementfly','0');
set('dodge',REA+INT);set('initdice',DI);set('init',(REA+INT)+' + '+DI+'d6');set('initvalue',REA+INT);set('initbonus','0');
set('matrixarinit',(REA+INT)+' + '+DI+'d6');set('matrixarinitdice',DI);set('matrixarinitvalue',REA+INT);
set('matrixcoldinit',INT+' + DP + 3d6');set('matrixcoldinitdice','3');set('matrixcoldinitvalue',INT);
set('matrixhotinit',INT+' + DP + 4d6');set('matrixhotinitdice','4');set('matrixhotinitvalue',INT);
set('riggerinit',(REA+INT)+' + 1d6');set('limitastral',Math.max(d.lm,d.ls));
set('physicalcm',8+Math.ceil(BOD/2));set('stuncm',8+Math.ceil(WIL/2));set('physicalcmfilled','0');set('stuncmfilled','0');
set('cmthreshold','3');set('cmoverflow',BOD+1);set('physicalcmiscorecm','False');set('stuncmismatrixcm','False');
set('physicalcmthresholdoffset','0');set('stuncmthresholdoffset','0');
['armor','firearmor','coldarmor','electricityarmor','acidarmor','fallingarmor'].forEach(k=>{set(k,k==='armor'?arm:0);set(k+'dicestun','1');set(k+'dicephysical','1')});
set('surprise',REA+INT);set('composure',CHA+WIL);set('judgeintentions',CHA+INT);set('judgeintentionsresist',CHA+WIL);
set('liftandcarry',STR+BOD);set('memory',LOG+WIL);set('liftweight',STR*15);set('carryweight',STR*10);set('totalcarriedweight','0');
['fatigueresist','radiationresist','toxincontactresist','toxiningestionresist','toxininhalationresist','toxininjectionresist',
'pathogencontactresist','pathogeningestionresist','pathogeninhalationresist','pathogeninjectionresist',
'physiologicaladdictionresistfirsttime','physiologicaladdictionresistalreadyaddicted'].forEach(k=>set(k,BOD+WIL));
set('sonicresist',WIL);set('psychologicaladdictionresistfirsttime',LOG+WIL);set('psychologicaladdictionresistalreadyaddicted',LOG+WIL);
set('physicalcmnaturalrecovery',BOD+1);set('stuncmnaturalrecovery',BOD+WIL);
set('indirectdefenseresist',REA+INT);set('directmanaresist',WIL);set('directphysicalresist',BOD);set('detectionspellresist',LOG+WIL);
[['bod',BOD],['agi',AGI],['rea',REA],['str',STR],['cha',CHA],['int',INT],['log',LOG]].forEach(([k,v])=>set('decrease'+k+'resist',v+WIL));
set('decreasewilresist',WIL*2);set('illusionmanaresist',LOG+WIL);set('illusionphysicalresist',INT+WIL);
set('manipulationmentalresist',LOG+WIL);set('manipulationphysicalresist',STR+BOD);
['streetcred','calculatedstreetcred','totalstreetcred','burntstreetcred','notoriety','calculatednotoriety','totalnotoriety',
'publicawareness','calculatedpublicawareness','totalpublicawareness','astralreputation','totalastralreputation',
'wildreputation','totalwildreputation','totalkarma'].forEach(k=>set(k,'0'));
set('contactpoints',CHA*3);['cfplimit','ainormalprogramlimit','aiadvancedprogramlimit','spelllimit'].forEach(k=>set(k,'0'));
set('imageformat','jpeg');set('cyberwaredisabled','False');set('psyche','False');set('edgeused','0');
return o}
