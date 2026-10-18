/* Données du cycle de demi-fond (Lycée G. Pompidou) : séances, schémas, échauffements.
   Partagées par l'écran de cours (index.html) et l'outil complet (cycle-demi-fond-old.html). */
let SID=0;
const PR=17, PL=(200-2*Math.PI*PR)/2, PS=3.6, PMX=58, PMY=30;
const PCX0=PMX+PR*PS, PCX1=PCX0+PL*PS, PCY=PMY+PR*PS+18;
const PW=PCX1+PR*PS+PMX, PH=PCY+PR*PS+PMY+18;
function pPt(s,off){ /* off : décalage vers l’extérieur, en mètres (0 = corde) */
  s=((s%200)+200)%200; const r=(PR+(off||0))*PS, bend=Math.PI*PR;
  if(s<bend){const a=s/PR;return [PCX1+r*Math.sin(a),PCY+r*Math.cos(a)]}            /* virage de droite, on monte */
  if(s<bend+PL){const d=(s-bend)*PS;return [PCX1-d,PCY-r]}                          /* ligne droite du haut, vers la gauche */
  if(s<2*bend+PL){const a=(s-bend-PL)/PR;return [PCX0-r*Math.sin(a),PCY-r*Math.cos(a)]} /* virage de gauche, on descend */
  const d=(s-2*bend-PL)*PS;return [PCX0+d,PCY+r];                                    /* ligne droite du bas, vers la droite */
}
function pPath(a,b,off,rev){ /* chemin le long de la piste de a à b (b>a), échantillonné ; rev : parcouru de b vers a */
  const n=Math.max(4,Math.ceil((b-a)/2)),P=[];for(let i=0;i<=n;i++)P.push(pPt(a+(b-a)*i/n,off));if(rev)P.reverse();
  return P.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join('');
}
function pDefs(id){return `<defs><marker id="${id}r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="c-head-r"/></marker><marker id="${id}b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="p-head-b"/></marker><marker id="${id}o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="c-head-o"/></marker></defs>`}
function piste(sp){
  const id='p'+(++SID);
  let g=`<svg viewBox="0 0 ${PW.toFixed(0)} ${PH.toFixed(0)}" role="img" aria-label="${sp.alt||'Schéma de piste'}" xmlns="http://www.w3.org/2000/svg">${pDefs(id)}`;
  /* pelouse puis piste (4 couloirs de 1,2 m dessinés larges pour la lisibilité) */
  g+=`<path class="p-grass" d="${pPath(0,200,-0.4)}Z"/>`;
  g+=`<path class="p-track" d="${pPath(0,200,3)}Z" style="stroke-width:${(6.6*PS).toFixed(1)}"/>`;
  [0,2,4,6].forEach(o=>{g+=`<path class="p-lane${o===0||o===6?' e':''}" d="${pPath(0,200,o)}Z"/>`});
  /* zones d’arrivée du 1’30 (référentiel Pompidou) */
  if(sp.zones){
    [[-30,-15,'z1'],[-15,-5,'z2'],[-5,0,'z4'],[0,5,'z4'],[5,15,'z3'],[15,30,'z1']].forEach(z=>{g+=`<path class="p-zone ${z[2]}" d="${pPath(200+z[0],200+z[1],3)}" style="stroke-width:${(6*PS).toFixed(1)}"/>`});
    [['−15',-15],['−5',-5],['+5',5],['+15',15]].forEach(z=>{const p=pPt(z[1],7.6);g+=`<text class="p-small" x="${p[0].toFixed(1)}" y="${(p[1]+4).toFixed(1)}" text-anchor="middle">${z[0]}</text>`});
    const zl=[['Z1',-22],['Z2',-10],['Z4',0],['Z3',10],['Z1',22]];zl.forEach(z=>{const p=pPt(z[1],3);g+=`<text class="p-zt" x="${p[0].toFixed(1)}" y="${(p[1]+4).toFixed(1)}" text-anchor="middle">${z[0]}</text>`});
  }
  (sp.segs||[]).forEach(z=>{g+=`<path class="p-seg ${z.cls||''}" d="${pPath(z.a,z.b,z.off===undefined?3:z.off)}" style="stroke-width:${((z.w||5)*PS).toFixed(1)}"/>`;if(z.t){const p=pPt((z.a+z.b)/2,z.toff===undefined?9.5:z.toff);g+=`<text class="p-lab" x="${p[0].toFixed(1)}" y="${(p[1]+4).toFixed(1)}" text-anchor="middle">${z.t}</text>`}});
  /* plots */
  const pl=sp.plots===undefined?'all':sp.plots;
  if(pl){
    for(let s=0;s<200;s+=5){
      const p=pPt(s,-0.9);
      if(pl==='cup20'){if(s%20===0)g+=`<circle class="p-cup" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.6"/>`;continue}
      if(s%50===0&&(pl==='all'||pl==='50'||pl==='25')){g+=`<path class="p-c50" d="M${p[0].toFixed(1)},${(p[1]-7).toFixed(1)} l5,11 h-10z"/>`;continue}
      if(false){g+=`<path class="p-c25" d="M${p[0].toFixed(1)},${(p[1]-6).toFixed(1)} l4.5,10 h-9z"/><path class="p-c25b" d="M${(p[0]-2.3).toFixed(1)},${(p[1]-1).toFixed(1)} h4.6 l1.2,2.6 h-7z"/>`;continue}
      if(s%10===0&&(pl==='all'||pl==='10'))g+=`<ellipse class="p-c10" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="3.2" ry="2.2"/>`;
    }
  }
  if(sp.finish!==false){const a=pPt(0,-0.3),b=pPt(0,6.3);g+=`<line class="p-finish" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
    if(sp.finishLab!==false){g+=`<text class="p-lab" x="${(a[0]).toFixed(1)}" y="${(b[1]+13).toFixed(1)}" text-anchor="middle">${sp.finishLab||'ligne d’arrivée'}</text>`}}
  (sp.runs||[]).forEach(r=>{const m=r.cls==='o'?'o':r.cls==='b'?'b':'r';g+=`<path class="p-run ${r.cls||''}" d="${pPath(r.a,r.b,r.off===undefined?1.6:r.off,r.rev)}" marker-end="url(#${id}${m})"/>`});
  (sp.cones||[]).forEach(c=>{const p=pPt(c.s,c.off===undefined?1.6:c.off);g+=`<path class="p-cone ${c.cls||''}" d="M${p[0].toFixed(1)},${(p[1]-8).toFixed(1)} l6,13 h-12z"/>`;if(c.t){const q=pPt(c.s,c.toff===undefined?-6.5:c.toff);g+=`<text class="p-lab" x="${q[0].toFixed(1)}" y="${(q[1]+4).toFixed(1)}" text-anchor="${c.a||'middle'}">${c.t}</text>`}});
  (sp.runners||[]).forEach(p0=>{const p=pPt(p0.s,p0.off===undefined?1.6:p0.off);const cls=p0.team==='b'?'c-pb':p0.team==='n'?'c-pn':'c-pa';g+=`<circle class="${cls}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${p0.l&&p0.l.length>1?10:8.5}"/><text class="c-pt p-pt" x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}">${p0.l||''}</text>`});
  (sp.stxt||[]).forEach(t=>{const p=pPt(t.s,t.off===undefined?-7:t.off);g+=`<text class="p-lab ${t.cls||''}" x="${p[0].toFixed(1)}" y="${(p[1]+4).toFixed(1)}" text-anchor="${t.a||'middle'}">${t.t}</text>`});
  (sp.texts||[]).forEach(t=>{g+=`<text class="p-lab ${t.cls||''}" x="${t.x}" y="${t.y}" text-anchor="${t.a||'middle'}">${t.t}</text>`});
  g+='</svg>';return g;
}
const PIN={x:(PCX0+PCX1)/2,y:PCY};
function fP(n){const r=Math.round(n*2)/2;return String(r).replace('.',',')}
function startS(d){return ((-d%200)+200)%200}
const SCH={
 piste:{alt:'Piste de 200 m et ses plots',plots:'all',
  texts:[{x:PIN.x,y:PIN.y-26,t:'piste de 200 m',cls:'w big'},{x:PIN.x,y:PIN.y-6,t:'plots plats : tous les 10 m',cls:'w'},{x:PIN.x,y:PIN.y+12,t:'coupelles orange : tous les 20 m (si besoin)',cls:'w'},{x:PIN.x,y:PIN.y+30,t:'grands plots jaunes : tous les 50 m',cls:'w'}],
  cap:'Sens de course : la corde à gauche. 36’’ de course : 1 plot plat franchi = 1 km/h. 1’12 : 1 coupelle (20 m) = 1 km/h. 3’ : 1 grand plot jaune (50 m) = 1 km/h. 1’30 : vitesse = distance ÷ 25 (325 m = 13 km/h).'},
 anneaux:{alt:'Les anneaux : 6 minutes autour de la piste',plots:'cup20',
  runners:[{s:12,l:'A'},{s:48,l:'A'},{s:92,l:'A'},{s:138,l:'A'},{s:176,l:'A'}],
  runs:[{a:14,b:44}],texts:[{x:PIN.x-40,y:PIN.y-18,t:'coupelles orange tous les 20 m',cls:'w'},{x:PIN.x,y:PIN.y+26,t:'les B au centre comptent les coupelles',cls:'w'}],
  cap:'Vague A : 6 min sans marcher. Chaque observateur B reste au centre de la pelouse, compte les coupelles franchies par son coureur et note le total à chaque top de minute. Distance = coupelles × 20 m ; distance ÷ 100 = vitesse moyenne en km/h.'},
 allures4:{alt:'Les 4 allures : toute la classe sur la piste',plots:'50',
  runners:[{s:6,l:'1'},{s:30,l:'2'},{s:58,l:'3'},{s:85,l:'4'},{s:120,l:'5'},{s:150,l:'6'},{s:178,l:'7'}],runs:[{a:88,b:112}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'grands plots jaunes tous les 50 m',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'en 3 min : plots franchis = km/h',cls:'w'}],
  cap:'Toute la classe court en même temps ; chacun compte les grands plots jaunes qu’il franchit pendant 3 min, en repartant de 0 à chaque allure. 12 plots en 3 min = 600 m en 3 min = 12 km/h.'},
 relais:{alt:'Le relais du binôme',plots:false,
  runners:[{s:196,l:'B',team:'b',off:-0.2},{s:130,l:'A'}],runs:[{a:132,b:190}],cones:[{s:195,t:'zone de relais',cls:'o',toff:-6.5}],
  texts:[{x:PIN.x,y:PIN.y,t:'A fait 1 tour, tape la main de B',cls:'w'},{x:PIN.x,y:PIN.y+18,t:'qui repart ; A récupère et compte',cls:'w'}],
  cap:'Le binôme est une équipe : un coureur sur la piste, son partenaire attend dans la zone de relais (couloir extérieur). 1 tour = 200 m chacun son tour, pendant 10 min.'},
 test:{alt:'Test 36’’/24’’ sur les plots plats',plots:'10',
  runners:[{s:20,l:'A'},{s:150,l:'A'},{s:56,l:'B',team:'n',off:-7}],runs:[{a:22,b:142}],
  segs:[{a:20,b:140,cls:'blue',t:'36’’ à 12 km/h = 120 m = 12 plots',toff:10}],
  texts:[{x:PIN.x,y:PIN.y,t:'24’’ de marche, puis on repart',cls:'w'},{x:PIN.x,y:PIN.y+18,t:'du plot plat où l’on s’est arrêté',cls:'w'}],
  cap:'Chaque minute : 36’’ de course, 24’’ de marche. Le coureur part d’un plot plat et compte ses plots ; au sifflet il s’arrête et annonce son chiffre. Le coach, au centre de la pelouse, l’a suivi des yeux et vérifie (demi-plot = 0,5). Plots franchis = vitesse en km/h.'},
 ra:{alt:'Récupération active à 70 % de la VMA',plots:'50',
  runners:[{s:10,l:'1'},{s:45,l:'2'},{s:90,l:'3'},{s:130,l:'4'},{s:170,l:'5'}],runs:[{a:92,b:126}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'3 min à 70 % : grands plots jaunes',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'cible = 0,7 × VMA (VMA 12 → 8,5 plots)',cls:'w'}],
  cap:'Toute la classe en même temps, chacun à son allure. En 3 min, les grands plots jaunes (50 m) franchis donnent la vitesse en km/h : on vise 70 % de sa VMA, on doit pouvoir parler en phrases.'},
 i3636:{alt:'Intermittent 36’’/36’’ en aller-retour',plots:'10',
  cones:[{s:0,t:'départ commun',cls:'o',toff:-7},{s:100,t:'VMA 10',toff:10.5},{s:120,t:'VMA 12',toff:11},{s:150,t:'VMA 15',toff:10.5}],
  runs:[{a:2,b:117,off:1.2},{a:4,b:117,off:4.8,rev:true,cls:'o'}],runners:[{s:108,l:'A',off:3},{s:126,l:'B',team:'n',off:-5.5}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'aller en 36’’, 36’’ de marche,',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'retour en 36’’ : tout le monde dans le même sens',cls:'w'}],
  cap:'Plot cible = plot plat n° (VMA × %) compté depuis le départ. À 100 % pour une VMA de 12 : 12e plot plat (120 m). Allers puis retours : toute la vague court dans le même sens. Le coach se tient au plot cible de son coureur.'},
 p130:{alt:'Le 1’30 mesuré avec les plots de 10 et 50 m',plots:'all',
  runners:[{s:2,l:'A'},{s:75,l:'B',team:'n',off:-7}],runs:[{a:4,b:196}],
  texts:[{x:PIN.x,y:PIN.y+6,t:'1’30 : distance lue sur les plots',cls:'w'},{x:PIN.x,y:PIN.y+24,t:'vitesse = distance ÷ 25',cls:'w'}],stxt:[{s:76,t:'45’’ : le coach annonce la mi-course',off:10}],
  cap:'Départ de la ligne. À 45’’, le coach crie « mi-course » et repère le plot ; à 1’30 (sifflet), le coureur s’arrête. Distance = tours complets × 200 m + position lue sur les plots (grands jaunes tous les 50 m, plats tous les 10 m) ; vitesse en km/h = distance ÷ 25. Réussi si la 2e moitié est au moins aussi longue que la 1re.'},
 projet:{alt:'1’30 avec projet de distance et zones d’arrivée',plots:'10',zones:true,finishLab:false,
  cones:[{s:startS(300),t:'projet 300 m',cls:'o',toff:10.5},{s:startS(330),t:'330 m',cls:'o',toff:10.5},{s:startS(355),t:'355 m',cls:'o',toff:10.5}],
  runners:[{s:startS(300),l:'A',off:3.8},{s:startS(330),l:'A',off:3.8},{s:startS(355),l:'A',off:3.8},{s:182,l:'B',team:'n',off:-6}],
  texts:[{x:PIN.x,y:PIN.y-6,t:'chacun part de son plot,',cls:'w'},{x:PIN.x,y:PIN.y+12,t:'tous visent la ligne d’arrivée à 1’30',cls:'w'}],
  cap:'Le coureur place son plot de départ à sa distance projet avant la ligne d’arrivée. Au sifflet de 1’30, il s’arrête : la zone donne les points d’efficacité (référentiel du lycée) : Z4 à ±5 m = 4 pts ; Z3 de +5 à +15 m = 3 ; Z2 de −5 à −15 m = 2 ; Z1 au-delà de 15 m = 1 (trop loin) ou 0,5 (trop court).'},
 d500:{alt:'500 m : départ, passage au 250 m, arrivée',plots:'50',
  cones:[{s:100,t:'départ 500 m',cls:'o',toff:-7},{s:150,t:'250 m',cls:'',toff:10.5},{s:0,t:'',cls:'r'}],
  runners:[{s:102,l:'A'},{s:150,l:'B',team:'n',off:-6}],runs:[{a:104,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'2 tours et demi',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'passage au 250 m : plot bleu',cls:'w'}],
  cap:'Départ en face de la ligne (100 m après elle). Le coach démarre son chrono au départ, se place à l’intérieur au plot bleu (250 m, au 1er passage) et annonce le temps de passage, puis va à l’arrivée.'},
 pyramide:{alt:'Départs des distances 500, 400, 300 et 200 m',plots:'50',
  cones:[{s:100,t:'500 m · 300 m',cls:'o',toff:-7},{s:0,t:'',cls:'o'},{s:150,t:'passage 250 du 500',toff:10.5},{s:50,t:'passage 150 du 300',toff:10.5}],
  runners:[{s:102,l:'A'},{s:120,l:'B',team:'n',off:-7}],runs:[{a:104,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'400 m et 200 m : départ sur la ligne',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'toutes les courses finissent sur la ligne',cls:'w'}],
  cap:'500 m et 300 m partent en face de la ligne, 400 m et 200 m de la ligne. Le coach donne le temps de passage à mi-course (plot bleu) et note le temps final.'},
 d250:{alt:'2 × 250 m',plots:'50',
  cones:[{s:150,t:'départ 250 m',cls:'o',toff:-7},{s:75,t:'125 m',toff:10.5}],runners:[{s:152,l:'A'},{s:75,l:'B',team:'n',off:-7}],runs:[{a:154,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'1 tour + 50 m',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'1’ de récupération entre les deux 250 m',cls:'w'}],
  cap:'Départ 50 m avant le début de la ligne droite opposée (150 m après la ligne). Temps visé sur 250 m = moitié du temps visé sur 500 m.'},
 c100:{alt:'Prise d’allure sur 100 m',plots:'10',
  cones:[{s:100,t:'départ 100 m',cls:'o',toff:-7}],runners:[{s:102,l:'A'},{s:160,l:'A'},{s:196,l:'B',team:'n',off:-6}],runs:[{a:104,b:196}],
  texts:[{x:PIN.x,y:PIN.y,t:'temps visé = temps du 500 m ÷ 5',cls:'w'}],
  cap:'Virage puis ligne droite : 100 m jusqu’à la ligne. Le coach chronomètre à l’arrivée et annonce l’écart à l’allure du 500 m.'},
 epreuve:{alt:'L’épreuve : 500 m, 500 m, 1’30',plots:'10',zones:true,finishLab:false,
  cones:[{s:100,t:'départ des 500 m',cls:'o',toff:-7},{s:150,t:'250 m',toff:10.5},{s:startS(340),t:'plot 1’30 (projet 340 m)',cls:'g',toff:-6.5}],
  runners:[{s:102,l:'A'},{s:150,l:'B',team:'n',off:-6}],
  texts:[{x:PIN.x,y:PIN.y-6,t:'C1 500 m · 10’ · C2 500 m · 10’ · C3 1’30',cls:'w'},{x:PIN.x,y:PIN.y+12,t:'arrivée de toutes les courses sur la ligne',cls:'w'}],
  cap:'Référentiel du lycée : 3 courses, 10 min de récupération entre chaque. 500 m avec passage au 250 m donné par le binôme ; 1’30 avec plot de départ placé à la distance projet, arrivée jugée par zones.'}
};
const EVAL_SHORT={afl1:'AFL1 · performance (/8) et efficacité du projet sur 1’30 (/4)',afl2:'AFL2 · s’entraîner : carnet, préparation, projet de course',afl3:'AFL3 · coach, chronométreur, juge'};
const S_ACC={t:'Accueil, règles et binômes',k:'Organisation',disp:'Sens de course, sécurité, rôle du coach, matériel du binôme (chrono, crayon, carnet). Présentation de l’épreuve de fin de cycle : 3’ puis 1’30 avec projet.',four:'Les binômes se forment (coureur et coach) et récupèrent leur carnet.',reus:'Chaque binôme a son matériel avant l’échauffement.'};
const S_RA={t:'Récupération active : 3 min à 70 %',k:'Mode « temps »',sch:'ra',disp:'Toute la classe, grands plots jaunes (50 m) : cible = 0,7 × VMA de travail en 3 min.',four:'Chacun pour soi, le coach note le nombre de plots.',deroul:['3 min puis 1 min de marche.'],reus:'À 1 grand plot de la cible.'};
function S_I36(pct,n,extra){return Object.assign({t:`36’’/36’’ au plot cible à ${pct} %`,k:'Fil rouge 1 · courir au temps',sch:'i3636',
  disp:`Plots plats tous les 10 m depuis la ligne. Plot cible = plot n° ${pct===100?'VMA':(pct/100).toFixed(2).replace('.',',')+' × VMA'} (VMA de travail ${pct===100?'12 → 12e plot, 120 m':'12 → '+fP(12*pct/100)+'e plot'}). ${n} répétitions en aller-retour : 36’’ de course, 36’’ de marche ; toute la vague court dans le même sens (tous à l’aller, puis tous au retour).`,
  four:'Coureur : arrive à son plot cible au sifflet, ni avant ni après ; aux retours, il regarde la ligne au sifflet et s’annonce lui-même. Coach : au plot cible, juge les allers (« tôt », « pile », « tard ») et coche les résultats. Puis on inverse.',
  deroul:[`Vague A : ${n} × 36’’/36’’, 2 min de transition, vague B.`],
  cons:['Les 10 premiers mètres décident de tout : se caler tout de suite, ne pas sprinter.','Tôt deux fois : je ralentis. Tard deux fois : j’accélère.'],
  reus:`${Math.ceil(n*0.75)} répétitions sur ${n} à 1 plot près (10 m).`,moins:`Plot cible à ${pct-5} %.`,plus:`Les ${Math.floor(n/2)} dernières à ${pct+5} %.`},extra||{})}
function S_3MIN(extra){return Object.assign({t:'Le 3’ au plot',k:'Fil rouge 2 · course C1 de l’épreuve',sch:'s3min',
  disp:'Grands plots jaunes (50 m) et plots plats (10 m). Départ de la ligne, tous ensemble ; mi-course à 1’30 ; arrêt au sifflet de 3’. Vague A puis vague B.',
  four:'Coureur : vise une distance (tableau : 3’ à 95 ou 100 % de sa VMA de travail) et une allure régulière. Coach : compte les tours, pose un plot violet à la mi-course (1’30), relève le plot plat d’arrêt et calcule la distance.',
  deroul:['Distance = tours × 200 m + plot d’arrêt ; vitesse = grands plots franchis (ou distance ÷ 50).','Régularité : distance de la 2e moitié = distance totale − distance à la mi-course.'],
  cons:['Partir à l’allure de la fin : la 2e moitié doit être au moins aussi longue que la 1re.'],
  reus:'2e moitié ≥ 1re moitié, à 10 m près ; distance à 20 m près de la distance visée.',moins:'Viser 90 %.',plus:'Viser 100 % sans annonce de mi-course.'},extra||{})}
function S_PROJ(extra){return Object.assign({t:'1’30 avec projet de distance',k:'Fil rouge 2 · course C2 de l’épreuve',sch:'projet',
  disp:'Plots plats tous les 10 m pour placer son plot, zones d’arrivée autour de la ligne (−15, −5, +5, +15 m). Tous partent au même sifflet, chacun de son plot, et visent la ligne à 1’30. Vague A, 3 min de placement, vague B.',
  four:'Coureur : annonce sa distance projet, place son plot (distance avant la ligne). Coach : vérifie le plot, se met aux zones, relève la zone et l’écart en mètres.',
  deroul:['Plot de départ = distance projet avant la ligne (340 m → 140 m avant la ligne, puis un tour complet).'],
  cons:['Distance à la mi-course (45’’) = moitié du projet.','Même allure du début à la fin : la ligne doit arriver au sifflet.'],
  reus:'Zone 4 (à 5 m de la ligne) ou zone 3.',moins:'Zones à ± 10 m.',plus:'Projet + 5 m.'},extra||{})}
const S_RAC={t:'Retour au calme et auto-évaluation',k:'AFL2 · bilan',disp:'Marche, étirements doux (10 à 15’’), hydratation. Chaque élève compare ses projets et ses distances réalisées.',four:'Coureur : remplit la partie bilan du carnet. Coach : complète la feuille de résultats et écrit un conseil au coureur.',reus:'Carnet complet avant de quitter la piste.'};
const SESSIONS=[
 {id:'s1',n:'S1',short:'Allures, VMA',title:'Courir ensemble, découvrir les allures, mesurer sa VMA de travail',lv:1,tab:'ref1',
  lead:'Installer les binômes et les règles de la piste, apprendre les 3 parties de l’échauffement, découvrir quatre allures sur 3 min. La 4e, le 3’ rapide, donne la VMA de travail de tout le cycle : grands plots jaunes franchis en 3’ = km/h.',
  tl:[['Accueil, règles et binômes',5,'acc'],['Échauffement guidé',25,'warm'],['Les 4 allures sur 3’',18,'allures4'],['Le relais du binôme',22,'relais'],['Ma VMA de travail et carnet',20,'bilan']],
  warm:'Le professeur mène et explique chaque partie. Apprendre à prendre son pouls (15’’ × 4) et à vérifier les 3 signes ; gammes démontrées.',
  eval:[['afl1','Le 3’ rapide est déjà la course C1 de l’épreuve : première distance, première note repère.'],['afl2','Premières données du carnet : 4 vitesses, pouls, VMA de travail.'],['afl3','Le binôme se forme : compter, noter, encourager.']],
  ex:{acc:S_ACC,
   allures4:{t:'Les 4 allures : 4 × 3 min',k:'Fil rouge 2 · courir au temps',sch:'allures4',
    disp:'Toute la classe en même temps. Grands plots jaunes tous les 50 m : en 3 min, le nombre de plots franchis donne directement la vitesse en km/h.',
    four:'Chacun compte ses grands plots jaunes. À chaque pause, le binôme se retrouve : il note les deux totaux et les deux pouls.',
    deroul:['Marche rapide 3 min, pause 1 min (noter, pouls).','Footing 3 min, pause 1 min.','Allure rythmée (on parle par mots) 3 min, pause 1 min.','3’ rapide : la plus grande distance possible en restant régulier. C’est la VMA de travail.'],
    cons:['Pouls : 2 doigts sur le côté du cou, compter 15’’, multiplier par 4.','Associer chaque allure à une respiration : je parle, je parle par mots, je ne parle plus.','Le 3’ rapide : partir à l’allure de la fin, pas plus vite.'],
    reus:'Les 4 vitesses augmentent ; le 3’ rapide est régulier (pas d’arrêt, pas de marche).',
    moins:'Marche-course alternée sur les 2 premières allures.',plus:'Annoncer avant le 3’ rapide le nombre de plots visés.'},
   relais:{t:'Le relais du binôme',k:'Situation finale · courir ensemble',sch:'relais',
    disp:'Binôme = une équipe. Zone de relais sur la ligne, couloir extérieur. 2 × 6 min de course, 3 min entre les manches, chacun un tour (200 m) à son tour.',
    four:'Coureur : 1 tour, tape la main de son partenaire. Partenaire : attend dans la zone, repart, compte les tours du binôme. Le trio fait tourner ses trois coureurs.',
    deroul:['Avant chaque manche, le binôme annonce le nombre de tours qu’il pense faire en 6 min.','2e manche : le binôme ajuste son annonce.'],
    cons:['Allure qu’on peut répéter, pas de sprint.','Relais dans la zone, le partenaire s’écarte de la corde pour attendre.'],
    reus:'Écart entre tours annoncés et réalisés : 1 tour au plus, sur la 2e manche.',moins:'Relais à mi-piste (100 m).',plus:'Un tour sur deux à l’allure du 3’ rapide.'}
  },
  bilan:'Classement du jour des binômes (points des deux challenges). VMA de travail = grands plots jaunes franchis pendant le 3’ rapide (au demi-plot près). Chacun recopie sa ligne du tableau « Mes cibles » dans le carnet. Groupes de vitesse (G1 moins de 10 km/h, G2 10 à 11,5, G3 12 à 13,5, G4 14 et plus) ; coureur et coach dans deux groupes différents. Retour au calme : marche, étirements doux.'},

 {id:'s2',n:'S2',short:'36’’, 1’30',title:'Découvrir le 36’’/36’’ et mesurer son 1’30',lv:1,tab:'cour',
  lead:'Premier contact avec les deux situations du cycle : le 36’’/36’’ au plot cible (la VMA de travail donne le numéro du plot) et le 1’30 mesuré, qui fournit la distance du premier projet. Échauffement guidé, mais ce sont les élèves qui annoncent l’étape suivante.',
  tl:[['Échauffement guidé',22,'warm'],['36’’/36’’ au plot cible à 100 %',24,'i36'],['Récupération active',6,'ra'],['Le 1’30 mesuré',18,'p130'],['Bilan et carnet',20,'bilan']],
  warm:'Les élèves annoncent la partie suivante et vérifient les 3 signes. Fin d’échauffement : 2 × 36’’ « pour voir » sur les plots plats.',
  eval:[['afl1','Le 1’30 mesuré donne la première distance du projet de l’épreuve.'],['afl3','Le coach juge les arrivées au plot cible et mesure le 1’30.']],
  ex:{i36:S_I36(100,8),ra:S_RA,
   p130:{t:'Le 1’30 mesuré',k:'Fil rouge 2 · mesurer sa distance',sch:'p130',
    disp:'Plots plats tous les 10 m et grands plots jaunes tous les 50 m. Départ de la ligne, 1’30 de course ; mi-course annoncée à 45’’. Vague A, puis vague B 5 min plus tard.',
    four:'Coureur : court 1’30 à l’allure qu’il pourrait tenir encore une fois. Coach : crie « mi-course » à 45’’ en repérant le plot, compte les tours, relève le plot d’arrêt à 1’30.',
    deroul:['Cible : 105 à 110 % de la VMA de travail (VMA 12 → 315 à 330 m).','Distance = tours × 200 m + plot d’arrêt ; vitesse en km/h = distance ÷ 25.'],
    cons:['La 2e moitié au moins aussi longue que la 1re.'],
    reus:'Distance de la 2e moitié ≥ distance de la 1re moitié.',moins:'Cible à 100 %.',plus:'Cible à 110 % sans regarder les plots.'}
  },
  bilan:'Carnet : répétitions « pile » au 36’’, distance du 1’30 et sa note repère (barème de Seconde). Premier projet pour S3 : distance du 1’30 mesuré, ± 10 m selon le ressenti.'},

 {id:'s3',n:'S3',short:'Premier projet',title:'Le 3’ au plot et le premier 1’30 avec projet',lv:2,tab:'cour',
  lead:'Les deux courses de l’épreuve, chacune seule : le 3’ avec mi-course marquée pour apprendre la régularité, puis le premier 1’30 avec plot de départ et zones d’arrivée. Échauffement semi-guidé : le binôme suit la fiche, le professeur ne donne que les tops.',
  tl:[['Échauffement semi-guidé',20,'warm'],['36’’/36’’ au plot cible à 100 %',20,'i36'],['Le 3’ au plot',16,'c3'],['1’30 avec projet',18,'proj'],['Bilan et carnet',16,'bilan']],
  warm:'Fin d’échauffement : 2 accélérations de 60 m à l’allure du 36’’/36’’.',
  eval:[['afl1','Les deux courses de l’épreuve sont là : distance du 3’, zone du 1’30.'],['afl2','Projet construit à partir d’une mesure (S2), pas au hasard.'],['afl3','Le coach marque la mi-course du 3’ et juge la zone du 1’30.']],
  ex:{i36:S_I36(100,6,{t:'36’’/36’’ au plot cible à 100 % (2e fois)',reus:'5 répétitions sur 6 à 1 plot près : mieux qu’en S2.'}),c3:S_3MIN({moins:'Viser 90 %.'}),proj:S_PROJ({deroul:['Projet = distance du 1’30 mesuré en S2, ± 10 m selon le ressenti.','Au moins 8 min après le 3’ : vague A, 3 min de placement, vague B.']})},
  bilan:'Carnet : distance du 3’ et régularité (2e moitié − 1re), zone du 1’30 et écart en mètres. Retour au calme : marche et étirements doux.'},

 {id:'s4',n:'S4',short:'1’30 fatigué',title:'Tenir son projet en étant fatigué',lv:2,tab:'cour',
  lead:'Même travail qu’en S3, une seule variable change : le 1’30 avec projet arrive juste après le 3’, avec seulement 6 min de récupération. Faut-il retirer quelques mètres au projet ? Le binôme décide et le justifie.',
  tl:[['Échauffement semi-guidé',18,'warm'],['36’’/36’’ au plot cible à 100 %',20,'i36'],['Le 3’ au plot',14,'c3'],['1’30 avec projet, après 6 min',16,'proj'],['Récupération active',6,'ra'],['Bilan et carnet',16,'bilan']],
  warm:'Le binôme choisit ses 4 exercices de renforcement et sa fin d’échauffement.',
  eval:[['afl1','Préparer C2 : courir le 1’30 sans être frais.'],['afl2','Ajuster son projet à la fatigue : décision écrite dans le carnet.']],
  ex:{i36:S_I36(100,6,{t:'36’’/36’’ au plot cible à 100 % (3e fois)',reus:'6 répétitions sur 6 à 1 plot près.'}),c3:S_3MIN(),proj:S_PROJ({t:'1’30 avec projet, 6 min après le 3’',deroul:['Vague A : 3’ puis 1’30 six minutes plus tard ; vague B décalée de 5 min.','Projet ajusté à la fatigue : − 5 à − 10 m par rapport à S3 ? Le binôme décide.']}),ra:S_RA},
  bilan:'Carnet : zone du 1’30 fatigué comparée à S3. La décision prise sur le projet était-elle la bonne ?'},

 {id:'s5',n:'S5',short:'Régularité',title:'Régularité sur 3’ et allure au-dessus de la VMA',lv:3,tab:'cour',
  lead:'Le 36’’/36’’ passe à 105 %. Deux 3’ séparés de 5 min pour apprendre à reproduire une allure, puis le 1’30 avec projet. Échauffement autonome avec fiche : le binôme construit son échauffement de 15 min et l’écrit dans le carnet.',
  tl:[['Échauffement autonome (fiche)',15,'warm'],['36’’/36’’ au plot cible à 105 %',20,'i36'],['2 × 3’ au plot',24,'c3'],['1’30 avec projet',16,'proj'],['Bilan et carnet',15,'bilan']],
  warm:'Le binôme écrit son échauffement (durées des 3 parties, 4 exercices, gammes) avant de commencer.',
  eval:[['afl1','Régularité du 3’ : 1 point de l’efficacité à l’épreuve.'],['afl2','Échauffement construit et écrit par le binôme.']],
  ex:{i36:S_I36(105,6),c3:S_3MIN({t:'2 × 3’ au plot',disp:'Deux 3’ par vague, 5 min entre les deux (la course de l’autre vague). Départ de la ligne, mi-course marquée.',deroul:['A 3’, B 3’, A 3’, B 3’.','Le 2e 3’ doit être à 20 m près du 1er : c’est reproduire une allure.'],reus:'Deux 3’ à 20 m près l’un de l’autre, et réguliers (2e moitié ≥ 1re, à 10 m près).'}),proj:S_PROJ()},
  bilan:'Carnet : écart entre les deux 3’, régularité, zone du 1’30. Le coach écrit un conseil pour l’épreuve blanche.'},

 {id:'s6',n:'S6',short:'Épreuve blanche',title:'Épreuve blanche : 3’, 10 min, 1’30',lv:3,tab:'evs',
  lead:'L’épreuve de Seconde en vrai, notée au barème : 3’ au plot, 10 min de récupération, 1’30 avec projet. Le bilan dit ce que chacun travaille en S7.',
  tl:[['Échauffement autonome (fiche)',18,'warm'],['Projets et installation',5,'inst'],['C1 · 3’ au plot',12,'e1'],['C2 · 1’30 avec projet',12,'e2'],['Retour au calme et auto-évaluation',13,'rac'],['Notes et bilan',30,'bilan']],
  warm:'Échauffement écrit dans le carnet, réalisé en binôme ; dernières accélérations à l’allure du 1’30.',
  eval:[['afl1','Note blanche : performance /8 (3’ /4, 1’30 /4) et efficacité /4.'],['afl2','Échauffement et projet comme le jour de l’évaluation.'],['afl3','Le coach mesure, marque la mi-course, juge la zone.']],
  ex:{
   inst:{t:'Projets et installation',k:'Organisation',disp:'Feuille de résultats remise à chaque coach. Plots des 1’30 posés à côté de la piste.',four:'Coureur : écrit sa distance visée sur 3’ et son projet de 1’30. Coach : les recopie sur la feuille.'},
   e1:{t:'C1 · 3’ au plot',k:'Course 1',sch:'s3min',disp:'Vague A au top (0’), vague B à 6’.',four:'Coach : compte les tours, pose le plot de mi-course à 1’30, relève la distance.',deroul:['Après la course : marche, trot très lent, boire ; rester actif.']},
   e2:{t:'C2 · 1’30 avec projet',k:'Course 2',sch:'projet',disp:'Vague A à 12’, vague B à 18’ (comptés depuis C1) : environ 10 min de récupération pour chacun. Plot de départ à la distance projet avant la ligne.',four:'Coach : vérifie le plot, juge la zone, relève la distance.',deroul:['Le coureur peut ajuster son projet après son 3’ : il l’annonce avant de partir.']},
   rac:S_RAC
  },
  bilan:'Chacun calcule sa note blanche (outil « Évaluation ») et choisit son travail pour S7 : allure trop rapide au départ du 3’, 1’30 hors zone, ou chute de vitesse. Grands plots du 3’ = nouvelle VMA de travail : chacun met à jour ses cibles (page 2 du carnet) et se situe sur les degrés AFL2 et AFL3 (page « Je me situe »).'},

 {id:'s7',n:'S7',short:'Réglage',title:'Travailler son point faible et ajuster son projet',lv:4,tab:'cour',
  lead:'Le 36’’/36’’ passe à 110 %. Chaque binôme travaille le point faible repéré à l’épreuve blanche, puis court un dernier 1’30 avec le projet de l’évaluation. Échauffement seul, sans fiche.',
  tl:[['Échauffement autonome sans fiche',18,'warm'],['36’’/36’’ au plot cible à 110 %',20,'i36'],['Mon point faible',22,'choix'],['1’30 avec projet final',15,'proj'],['Bilan et carnet',15,'bilan']],
  warm:'Sans fiche. Le professeur observe avec la grille de l’outil « Échauffement » et rend un retour à chacun.',
  eval:[['afl1','Projet final du 1’30 et distance visée sur 3’.'],['afl2','Choisir son travail à partir de ses données : premier pas vers la séance construite de Terminale.']],
  ex:{i36:S_I36(110,6),
   choix:{t:'Mon point faible',k:'Au choix du binôme',sch:'s3min',
    disp:'Trois ateliers sur la piste, au choix : A. départ du 3’ trop rapide : 2 × 1’30 à l’allure du 3’, 2 min entre les deux, mi-course annoncée ; B. 1’30 hors zone : 3 × 45’’ à l’allure du projet (moitié du projet en 45’’), 1’30 entre ; C. chute de vitesse : 4 × 300 m à l’allure du 1’30, 3 min entre.',
    four:'Coureur : choisit l’atelier à partir de l’épreuve blanche et l’écrit. Coach : mesure et donne l’écart après chaque répétition.',
    deroul:['10 min par coureur, puis on inverse.'],
    reus:'Écart à la cible réduit d’une répétition à l’autre.'},
   proj:S_PROJ({t:'1’30 avec projet final'})},
  bilan:'Projet final dans le carnet : distance visée sur 3’ et projet du 1’30, justifiés par l’épreuve blanche et la séance du jour.'},

 {id:'s8',n:'S8',short:'Évaluation',title:'Évaluation : 3’, 10 min, 1’30',lv:4,tab:'evs',status:'eval',
  lead:'L’épreuve de Seconde : 3’ au plot, 10 min de récupération, 1’30 avec projet. Échauffement seul observé ; projets annoncés avant la première course.',
  tl:[['Échauffement autonome observé',20,'warm'],['Projets et installation',5,'inst'],['C1 · 3’ au plot',12,'e1'],['C2 · 1’30 avec projet',12,'e2'],['Retour au calme et auto-évaluation',13,'rac'],['Notes et bilan',28,'bilan']],
  warm:'Sans fiche, observé (AFL2, 2 points).',
  eval:[['afl1','Performance /8 : 3’ /4 et 1’30 /4. Efficacité /4 : zone du 1’30 /3 et régularité du 3’ /1.'],['afl2','Échauffement seul (2 pts) et projet justifié par le carnet (2 pts).'],['afl3','Coach : distance, mi-course, zone (4 pts).']],
  ex:{inst:null,e1:null,e2:null,rac:S_RAC},
  bilan:'Saisie dans l’outil « Évaluation ». Chaque élève écrit ce qu’il garde pour la Première et la Terminale : sa VMA de travail, sa distance sur 3’, sa distance sur 1’30.'}
];
SESSIONS[7].ex.inst=SESSIONS[5].ex.inst;
SESSIONS[7].ex.e1=SESSIONS[5].ex.e1;
SESSIONS[7].ex.e2=SESSIONS[5].ex.e2;
const JEUX={
 s1:{allures4:{n:'Le défi des 4 allures',r:'Avant chaque allure, le coureur annonce à son coach le nombre de grands plots qu’il va franchir. Au 3’ rapide, règle du banquier : chaque grand plot franchi = 1 point, divisé par deux si le coureur marche.',p:'annonce juste = 3 pts, à 1 plot près = 1 pt ; 3’ rapide : 1 pt par grand plot'},
     relais:{n:'Le contrat de tours',r:'Le binôme signe un contrat avant chaque manche : nombre de tours en 6 min. La 2e manche se joue en connaissant le résultat de la 1re.',p:'contrat tenu = 5 pts, à 1 tour près = 2 pts, par manche'}}
};
SESSIONS.forEach(s=>{const J=JEUX[s.id];if(!J)return;Object.keys(J).forEach(k=>{if(s.ex[k])s.ex[k]=Object.assign({},s.ex[k],{jeu:J[k]})})});
SESSIONS[0].lead='Séance d’entrée en challenges : le binôme se forme et marque des points ensemble sur deux défis (annonce juste, contrat tenu), classement du jour en fin de séance. On apprend les 3 parties de l’échauffement, on découvre quatre allures sur 3 min ; la 4e, le 3’ rapide, donne la VMA de travail (grands plots jaunes franchis = km/h).';
const LIB={
 "testA": {
  "t": "Test 10 × 36’’/24’’ · vague A",
  "k": "Test de VMA",
  "sch": "test",
  "disp": "Plots plats tous les 10 m sur toute la piste. Une minute = 36’’ de course + 24’’ de marche, 10 fois de suite (10 min). Sifflet au départ et à la fin de chaque 36’’.",
  "four": "Coureur A : part d’un plot plat, compte ses plots en courant, s’arrête au sifflet et annonce son chiffre ; il marche 24’’ jusqu’au plot plat suivant et repart de là. Coach B : au centre de la pelouse, suit son coureur des yeux, vérifie le chiffre annoncé (demi-plot = 0,5) et le note dans la grille 1’ à 10’.",
  "deroul": [
   "2 min : rappel du protocole, chaque coach a son crayon et sa grille.",
   "10 min de test.",
   "2 min : le coach additionne les 10 chiffres et divise par 10 : c’est la VMA (km/h)."
  ],
  "cons": [
   "Plots franchis en 36’’ = vitesse en km/h (12 plots = 120 m en 36’’ = 12 km/h).",
   "Partir à l’allure que je crois tenir 10 fois : on cherche 10 chiffres proches, pas un record sur la 1re.",
   "Si c’est facile après 3 répétitions, monter d’un plot."
  ],
  "reus": "Au plus 2 km/h d’écart entre la meilleure et la moins bonne répétition.",
  "moins": "8 répétitions (diviser par 8) pour un élève qui reprend ou un inapte partiel autorisé à courir.",
  "plus": "Aucune : c’est un test."
 },
 "testB": {
  "t": "Test 10 × 36’’/24’’ · vague B",
  "k": "Test de VMA",
  "sch": "test",
  "disp": "Même dispositif, rôles inversés.",
  "four": "Coureur B, coach A. Le coach de la vague A, encore essoufflé, compte à voix haute avec son coureur : c’est l’occasion de vérifier que la grille est lisible.",
  "deroul": [
   "10 min de test, 2 min de calcul, 2 min de récupération en marchant."
  ],
  "cons": [
   "Comparer avec la séance 1 : distance des anneaux ÷ 100 et allure rapide des 4 allures. Les trois chiffres sont proches mais pas égaux, et c’est normal : ce ne sont pas les mêmes efforts."
  ],
  "reus": "VMA calculée et vérifiée par le professeur pour chaque élève avant la fin de la séance."
 },
 "t130": {
  "t": "Travail du 1’30 : 1’30, 45’’, 45’’, 1’30",
  "k": "Situation finale · leçon 5 du carnet",
  "sch": "projet",
  "disp": "Plots plats pour placer les plots de départ, zones autour de la ligne. Deux 1’30 avec projet ; entre les deux, 2 × 45’’ à l’allure du 1’30 (45’’ de récupération).",
  "four": "Coureur : distance prévue, distance aux 45’’, distance réalisée. Coach : annonce « mi-course » à 45’’, relève la distance et la zone.",
  "deroul": [
   "A 1’30, B 1’30, A 2 × 45’’, B 2 × 45’’, A 1’30, B 1’30.",
   "45’’ : plot de départ à la moitié de la distance projet avant la ligne."
  ],
  "cons": [
   "Distance aux 45’’ = la moitié du projet : si on la dépasse, on finit en zone 2."
  ],
  "reus": "Deuxième 1’30 en zone 4 ou zone 3.",
  "moins": "Un seul 1’30 après les 45’’.",
  "plus": "Deuxième 1’30 avec un projet + 5 m."
 },
 "inst": {
  "t": "Projets et installation",
  "k": "Organisation",
  "disp": "Fiche de résultats remise à chaque coach. Plots des 1’30 posés dès maintenant à côté de la piste.",
  "four": "Coureur : donne au professeur son temps projet du 500 m et sa distance projet du 1’30. Coach : recopie les projets sur la fiche.",
  "deroul": [
   "Rappel : passage au 250 m annoncé par le coach ; arrivée sur la ligne ; zones du 1’30."
  ]
 },
 "c1": {
  "t": "C1 · 500 m",
  "k": "Course 1",
  "sch": "d500",
  "disp": "Vague A au top de départ (0’), vague B à 6’.",
  "four": "Coach : chronomètre, annonce le passage au 250 m, note le temps. Professeur : chronomètre officiel au départ de chaque vague et contrôle quelques temps.",
  "deroul": [
   "Après la course : récupération active (marche, footing très lent), hydratation."
  ]
 },
 "c2": {
  "t": "C2 · 500 m",
  "k": "Course 2",
  "sch": "d500",
  "disp": "Vague A à 12’, vague B à 18’ (comptés depuis le départ de C1) : environ 10 min de récupération pour chacun après sa course.",
  "four": "Mêmes rôles. Le coach annonce le temps de C1 au coureur avant le départ.",
  "deroul": [
   "Le coureur peut ajuster son projet pour C2 : il l’annonce avant de partir."
  ]
 },
 "c3": {
  "t": "C3 · 1’30 avec projet",
  "k": "Course 3",
  "sch": "projet",
  "disp": "Vague A à 24’, vague B à 30’. Plot de départ à la distance projet avant la ligne.",
  "four": "Coach : vérifie le plot de son coureur, se place aux zones, relève zone et distance.",
  "deroul": [
   "Zone 4 : ± 5 m = 4 pts ; zone 3 : +5 à +15 m = 3 ; zone 2 : −5 à −15 m = 2 ; zone 1 : 1 (trop loin) ou 0,5 (trop court)."
  ]
 },
 "rac": {
  "t": "Retour au calme et auto-évaluation",
  "k": "AFL2 · bilan",
  "disp": "Marche, étirements doux (10 à 15’’), hydratation. Chaque élève compare ses projets et ses temps réalisés.",
  "four": "Coureur : remplit la partie bilan du carnet (écarts, ressenti, ce qui a marché). Coach : complète la feuille de résultats et écrit un conseil au coureur.",
  "reus": "Carnet complet avant de quitter la piste."
 },
 "c100": {
  "t": "Prise d’allure : 3 × 100 m",
  "k": "Allure spécifique",
  "sch": "c100",
  "disp": "100 m (virage + ligne droite), récupération 1 min en marchant. Temps visé = temps projet du 500 m ÷ 5.",
  "four": "Coureur : vise son temps au 100 m. Coach : chronomètre à l’arrivée, annonce l’écart.",
  "deroul": [
   "Vague A : 3 × 100 m, puis vague B."
  ],
  "cons": [
   "On ne sprinte pas : c’est l’allure qu’on tiendra 5 fois."
  ],
  "reus": "2 des 3 passages à 1 seconde près.",
  "moins": "2 × 100 m.",
  "plus": "Le 3e sans annonce du coach : le coureur estime son temps."
 },
 "ra": {
  "t": "Récupération active : 3 min à 70 %",
  "k": "Mode « temps » · 70 % de VMA",
  "sch": "ra",
  "disp": "Toute la classe ensemble. Grands plots jaunes (50 m) : cible = 0,7 × VMA plots en 3 min.",
  "four": "Chacun pour soi ; le coach note le nombre de plots de son coureur.",
  "deroul": [
   "3 min de footing à 70 %, puis 1 min de marche."
  ],
  "cons": [
   "La récupération active aide à faire baisser le pouls et à éliminer plus vite les déchets de l’effort que l’arrêt complet."
  ],
  "reus": "À 1 grand plot de la cible."
 }
};
const T_RAC={t:'Retour au calme et auto-évaluation',k:'AFL2 · bilan',disp:'Marche, étirements doux (10 à 15’’), hydratation. Chaque élève compare ses projets et ses temps réalisés.',four:'Coureur : remplit la partie bilan du carnet (écarts, ressenti, ce qui a marché). Coach : complète la feuille de résultats et écrit un conseil au coureur.',reus:'Carnet complet avant de quitter la piste.'};
const T_RA={t:'Récupération active : 3 min à 70 %',k:'Mode « temps »',sch:'ra',disp:'Toute la classe, grands plots jaunes (50 m) : cible = 0,7 × VMA plots en 3 min.',four:'Chacun pour soi ; le coach note le nombre de plots.',deroul:['3 min puis 1 min de marche.'],reus:'À 1 grand plot de la cible.'};
const T_PROJ={t:'1’30 avec projet de distance',k:'Situation finale · course C3 de l’épreuve',sch:'projet',
  disp:'Plot de départ à la distance projet avant la ligne, zones à −15, −5, +5, +15 m. Vague A, 3 min de placement, vague B.',
  four:'Coureur : annonce sa distance, place son plot. Coach : vérifie le plot, juge la zone, note l’écart en mètres.',
  deroul:['Projet ajusté à partir de la dernière séance et de la fatigue du jour.'],
  cons:['Distance aux 45’’ = moitié du projet.'],reus:'Zone 4 ou zone 3.',moins:'Zones à ± 10 m.',plus:'Projet + 5 m.'};
const T_SESSIONS=[
 {id:'t1',n:'T1',short:'Relais 5 km',title:'Diagnostic : le 5 km à deux et un 500 m de référence',lv:3,tab:'t1',
  lead:'Retrouver la piste et le binôme, courir longtemps à une allure régulière, puis un premier 500 m pour se situer dans le barème. Échauffement en binôme avec la fiche de Seconde : le professeur repère qui sait déjà s’échauffer seul.',
  tl:[['Échauffement avec fiche',18,'warm'],['Relais 5 km à deux',35,'r5'],['Récupération active',5,'ra'],['500 m de référence',17,'ref'],['Bilan et carnet',15,'bilan']],
  warm:'Rappel des 3 parties et des 3 signes. Fin d’échauffement : 2 accélérations de 80 m.',
  eval:[['afl1','Premier 500 m chronométré : note au barème, point de départ des progrès.'],['afl2','Carnet ouvert dès la 1re séance : distances et temps de chaque relais.'],['afl3','Binômes coureur / coach formés (groupes de vitesse différents), fixes après T3.']],
  ex:{
   r5:{t:'Relais 5 km à deux',k:'Leçon 1 du carnet · régularité',sch:'relais5',
    disp:'25 tours de 200 m en relais ; chacun choisit des relais de 1 à 3 tours. Grille de 7 relais par élève dans le carnet. Record cadette du 5 km : 17’32 (carnet).',
    four:'Coureur : annonce la longueur de son relais et court. Partenaire : chronomètre, note distance prévue et temps réalisé, puis prend le relais dans la zone.',
    deroul:['Avant le départ, le binôme annonce son temps total visé.','Au bout de 35 min, on arrête : la distance réalisée compte (5 km à deux en 35 min = 8,6 km/h de moyenne).'],
    cons:['Même temps au tour sur tous ses relais : le chronomètre du partenaire le dit.','Partir à l’allure des derniers tours, pas plus vite.'],
    reus:'Temps au tour stable à 3 secondes près sur tous ses relais ; écart au temps visé inférieur à 1 min.',
    moins:'3 km (15 tours).',plus:'Relais de 2 tours imposés, temps au tour annoncé avant chaque relais.'},
   ra:{t:'Récupération active',k:'Marche et footing lent',sch:'ra',disp:'2 min de marche, 3 min de footing très lent, hydratation.',four:'Le binôme remplit le carnet du relais pendant la marche.',reus:'Pouls sous 120 avant le 500 m.'},
   ref:{t:'500 m de référence',k:'Situation finale · course C1 sans projet chiffré',sch:'d500',
    disp:'Départ en face de la ligne, passage au 250 m au plot bleu. Vague A, puis vague B 5 min plus tard.',
    four:'Coureur : court au mieux, sans projet chiffré. Coach : annonce le passage au 250 m, note le temps final et le pouls.',
    deroul:['Après la course : note au barème (outil « Évaluation »).'],
    cons:['La 2e moitié au moins aussi vite que la 1re.'],
    reus:'Écart entre les deux 250 m inférieur à 3 secondes.'}
  },
  bilan:'Carnet : temps au tour moyen, 500 m de référence et sa note sur 8. Première idée de la répartition AFL2 / AFL3 (6/2, 4/4 ou 2/6), à confirmer avant T7.'},

 {id:'t2',n:'T2',short:'VMA',title:'Alterner les allures et trouver sa VMA',lv:3,tab:'vma',
  lead:'Leçon 2 du carnet : des tours de plus en plus rapides pour sentir les allures, puis le test 10 × 36’’/24’’. Les tableaux d’allures du cycle en dépendent.',
  tl:[['Échauffement avec fiche',18,'warm'],['Varier les allures et coacher',18,'tours'],['Test VMA · vague A',14,'testA'],['Test VMA · vague B',14,'testB'],['Récupération active 3’ à 70 %',6,'ra'],['Tableau d’allures et groupes',20,'bilan']],
  warm:'Fin d’échauffement courte : les tours rapides de l’exercice 1 terminent la mise en route.',
  eval:[['afl2','VMA, fréquences cardiaques et ressentis dans le carnet : les données qui servent à planifier la charge.'],['afl3','Annoncer le temps au tour, compter les plots du test.']],
  ex:{
   tours:{t:'Varier les allures : tours de 8 à 14 km/h et plus',k:'Leçon 2 du carnet · coaching',sch:'tours',
    disp:'Tours enchaînés sans arrêt : 8 km/h (1’30 au tour), 10 (1’12), 12 (1’00), 14 (51’’), puis + 1 km/h par tour. Vague A, puis vague B.',
    four:'Coureur : vise le temps du tour. Coach : sur la ligne, annonce le temps à chaque passage (« 1’02, accélère de 2 »), note le dernier tour tenu et le pouls.',
    deroul:['On s’arrête au premier tour manqué de plus de 3 secondes.','La dernière vitesse tenue donne une première idée de la VMA.'],
    cons:['Changer d’allure dès la ligne, pas au milieu du tour.'],
    reus:'4 tours de suite à 2 secondes près du temps visé.',
    moins:'Démarrer à 7 km/h (1’43 au tour).',plus:'Tours à + 0,5 km/h au-delà de 14.'},
   ra:T_RA,testA:LIB.testA,testB:Object.assign({},LIB.testB,{cons:['Comparer avec la dernière vitesse tenue aux tours (exercice 1) et avec la VMA de Seconde notée dans le carnet : un écart de plus de 1,5 km/h se discute avec le professeur.']})
  },
  bilan:'VMA = total des 10 répétitions ÷ 10. Recopier sa ligne du tableau d’allures. Groupes de vitesse (G1 à G4) ; binômes définitifs avec coureur et coach dans deux groupes différents.'},

 {id:'t3',n:'T3',short:'1er 500',title:'Travail du premier 500 m',lv:4,tab:'t3',
  lead:'Leçon 3 du carnet : des distances qui raccourcissent pendant que l’allure monte, de 90 à 130 % de la VMA, puis l’intermittent 36’’/36’’ au-dessus de la VMA. À partir de T3, échauffement seul et sans fiche.',
  tl:[['Échauffement autonome',15,'warm'],['Varier les allures : 500 à 100 m',38,'desc'],['Récupération active 3’ à 70 %',5,'ra'],['36’’/36’’ à 110 puis 120 %',18,'i36'],['Bilan et carnet',14,'bilan']],
  warm:'Chacun écrit son échauffement dans le carnet après coup ; le professeur observe 5 élèves par séance avec la grille.',
  eval:[['afl1','Allure du premier 500 m : partir à la bonne vitesse, c’est la moitié de la note de C1.'],['afl2','Performances stables : chaque course a un temps prévu et un temps réalisé.'],['afl3','Coach : choix des vitesses, organisation de la récupération, bilan de coaching.']],
  ex:{
   desc:{t:'Varier les allures : 500-400-300-200-100-100',k:'Leçon 3 du carnet · % de VMA',sch:'pyramide',
    disp:'500 m à 90 %, 400 m à 95 %, 300 m à 100 %, 200 m à 110 %, 100 m à 120 %, 100 m à 130 %. Récupérations du carnet respectées (4’, 3’30, 3’, 2’, 2’) : la course de l’autre vague plus le temps qui manque.',
    four:'Coureur : lit son temps prévu. Coach : chronomètre, annonce le passage à mi-course, note temps et pouls, remplit « choix de vitesses », « organisation de la récup », « bilan coaching ».',
    deroul:['A puis B sur chaque distance. Départs : 500 et 300 m en face de la ligne, 400 et 200 m de la ligne, 100 m en face.'],
    cons:['Plus c’est court, plus c’est vite : le 100 m à 130 % n’est pas un sprint.'],
    reus:'5 courses sur 6 à 2 secondes ou moins du temps prévu.',moins:'Intensités à −5 % ; sans le dernier 100 m.',plus:'300 m à 105 %, 200 m à 115 %.'},
   ra:T_RA,
   i36:{t:'36’’/36’’ à 110 % puis 120 %',k:'Leçon 3 du carnet · intermittent',sch:'i3636',
    disp:'Aller-retour depuis la ligne, plot plat cible : 3 répétitions à 110 % (plot = 1,1 × VMA), 3 à 120 %. Vague A puis vague B.',
    four:'Coureur : arrive au plot au sifflet. Coach : au plot cible, juge les allers ; le coureur s’annonce lui-même aux retours.',
    deroul:['6 × 36’’/36’’ par vague, transition 2 min.'],
    cons:['120 % : allure du 1’30 de l’épreuve.'],
    reus:'4 répétitions sur 6 à 1 plot près.',moins:'105 puis 110 %.',plus:'4 à 110 %, 4 à 120 %.'}
  },
  bilan:'Carnet : écarts prévu-réalisé, pouls, ressenti 1 à 5. Question : à quel pourcentage de ta VMA cours-tu ton 500 m de T1 ? (vitesse = 1 800 ÷ temps en secondes).'},

 {id:'t4',n:'T4',short:'Intermittent',title:'Intermittent long et pyramide',lv:4,tab:'t4',
  lead:'Leçon 4 du carnet : 1’12/1’12 à 80 % pour durer, puis une pyramide de 250 à 500 m qui monte jusqu’à 130 %. On apprend à tenir une allure au-dessus de la VMA sur des distances proches de 500 m.',
  tl:[['Échauffement autonome',15,'warm'],['1’12/1’12 à 80 %',24,'i112'],['Récupération active 2’ à 50 %',3,'ra2'],['Pyramide 250 à 500 m',36,'pyr'],['Bilan et carnet',12,'bilan']],
  warm:'Fin d’échauffement à l’allure du 500 m (110 %).',
  eval:[['afl1','Le 500 m à 110 % de la pyramide : l’allure des deux 500 m de l’épreuve.'],['afl2','Tenue des allures prévues sur toute la pyramide.']],
  ex:{
   i112:{t:'1’12/1’12 à 80 %',k:'Leçon 4 du carnet · intermittent long',sch:'i112',
    disp:'Aller-retour depuis un départ commun en face de la ligne, coupelles orange tous les 20 m : en 1’12, 1 coupelle = 1 km/h. Coupelle cible n° 0,8 × VMA (VMA 12 → 9,5e coupelle, 190 m environ). 4 répétitions par vague (2 allers, 2 retours).',
    four:'Coureur : arrive au plot au bout de 1’12. Coach : au plot cible, juge les allers ; noter ressentis souffle, chaleur, muscles.',
    deroul:['Vague A : 4 × 1’12/1’12 (9 min 36), 2 min de transition, puis vague B.'],
    cons:['80 % : on parle encore par mots.'],
    reus:'3 répétitions sur 4 à 10 m près du plot.',moins:'75 %.',plus:'6 répétitions.'},
   ra2:{t:'Récupération active : 2’ à 50 %',k:'Mode « temps »',disp:'Marche rapide ou trot très lent, toute la classe.',four:'Chacun pour soi.',reus:'Pouls qui redescend sous 120.'},
   pyr:{t:'Pyramide 250-375-500-375-250-125',k:'Leçon 4 du carnet · % de VMA',sch:'pyrT4',
    disp:'250 m à 95 %, 375 m à 100 %, 500 m à 110 %, 375 m à 115 %, 250 m à 120 %, 125 m à 130 %. Alternance des vagues ; récupérations du carnet (2’30 à 5’) respectées en ajoutant une minute si besoin.',
    four:'Coureur : lit son temps prévu. Coach : chronomètre, annonce l’écart à l’arrivée, note.',
    deroul:['Départs : distance avant la ligne (250 m à 150 m après la ligne, 375 m à 25 m après, 500 m en face, 125 m à 75 m après). Pour 375 et 125 m, un seul plot de départ, posé entre deux plots plats.'],
    cons:['Le 500 m à 110 % est la course clé : passage au 250 m à la moitié du temps prévu.'],
    reus:'4 courses sur 6 à 2 secondes près.',moins:'Intensités à −5 % ; sans le 125 m à 130 %.',plus:'125 m à 130 % refait en fin de séance.'}
  },
  bilan:'Carnet : temps prévu et réalisé du 500 m à 110 %. C’est la première estimation du projet de C1.'},

 {id:'t5',n:'T5',short:'2e 500, 1’30',title:'Travail du deuxième 500 m et du 1’30',lv:4,tab:'t5',
  lead:'Leçon 5 du carnet : répéter l’allure du 500 m en étant fatigué (6 × 300 m à 110 %), puis le travail du 1’30 en deux 45’’. Le deuxième 500 m de l’épreuve se court 10 min après le premier.',
  tl:[['Échauffement autonome',15,'warm'],['6 × 300 m à 110 %',33,'r300'],['Récupération active 3’ à 70 %',5,'ra'],['Travail du 1’30',22,'t130'],['Bilan et carnet',15,'bilan']],
  warm:'Fin d’échauffement : 1 accélération de 100 m à l’allure du 300 m.',
  eval:[['afl1','Tenir l’allure malgré la fatigue : la note de C2 en dépend.'],['afl1','1’30 : zones d’arrivée (/4).'],['afl2','Projet de distance construit à partir de la mesure des 45’’.']],
  ex:{
   r300:{t:'6 × 300 m à 110 %',k:'Leçon 5 du carnet · maintenir l’allure',sch:'pyramide',
    disp:'300 m (départ en face de la ligne) à 110 % de la VMA. Récupération du carnet (5 min) par alternance des coureurs : la course de l’autre vague, puis on repart au top du professeur toutes les 5 min environ.',
    four:'Coureur : même temps visé 5 fois. Coach : chronomètre, annonce le passage au 150 m, note temps, pouls, et remplit « organisation de la récup ».',
    deroul:['A, B, A, B… 6 fois chacun.'],
    cons:['Le 6e 300 m doit ressembler au 1er : c’est le 2e 500 m de l’épreuve.'],
    reus:'5 des 6 courses à 2 secondes près ; le 6e pas plus lent de 3 secondes que le 1er.',moins:'4 × 300 m.',plus:'300 m à 115 % pour les deux derniers.'},
   ra:T_RA,
   t130:LIB.t130
  },
  bilan:'Carnet : distance aux 45’’ et distance réalisée ; zone obtenue. Le coach écrit un conseil pour le projet de T6.'},

 {id:'t6',n:'T6',short:'Dernier 500',title:'Travail du dernier 500 m : résister',lv:4,tab:'t6',
  lead:'Leçon 6 du carnet : des distances qui s’allongent pendant que l’allure monte (jusqu’à 125 %), pour apprendre à tenir quand les jambes brûlent. Puis un 1’30 avec projet en étant fatigué, comme C3 à l’épreuve.',
  tl:[['Échauffement autonome',15,'warm'],['Re-test VMA court (36’’/24’’)',10,'retest'],['Résistance : 100 à 400 m',30,'res'],['Récupération active 3’ à 70 %',5,'ra'],['1’30 avec projet',18,'proj'],['Bilan et carnet',12,'bilan']],
  warm:'Fin d’échauffement : 2 accélérations, la 2e à l’allure du 400 m.',
  eval:[['afl1','La 3e course de l’épreuve arrive fatigué : projet du 1’30 ajusté à l’état du jour.'],['afl2','Projet anticipé et réalisé : degré 4 du référentiel.']],
  ex:{
   res:{t:'Résistance : 100-200-250-300-400 m',k:'Leçon 6 du carnet',sch:'pyrT6',
    disp:'100 m à 100 %, 200 m à 105 %, 250 m à 110 %, 300 m à 120 %, 400 m à 125 % (intensités du carnet). Récupérations du carnet (2’ à 5’) par alternance des vagues.',
    four:'Coureur : vise son temps. Coach : chronomètre, annonce le passage à mi-course et l’écart à l’arrivée.',
    deroul:['A puis B sur chaque distance.'],
    cons:['Le 500 m à 130 % du carnet est retiré : 6e effort de la série, et le temps manque. Les documents de collègues placent l’allure du 3 × 500 m entre 107 et 130 % de la VMA selon le niveau ; mais ici la VMA vient d’un test intermittent, qui la surestime : 125 % de cette VMA est déjà très haut. Si plus de la moitié de la classe rate le 300 m, passer à la variable « − ».'],
    reus:'4 courses sur 5 à 2 secondes près ; le 400 m tenu jusqu’au bout.',moins:'300 m et 400 m à 115 %.',plus:'500 m à 130 % en fin de séance (carnet) pour les G4.'},
   retest:{t:'Re-test VMA court : 36’’/24’’',k:'2e mesure de VMA · mise à jour des cibles',sch:'test',
    disp:'Même protocole que T2, plots plats tous les 10 m, mais départ à la VMA de T2 moins 2 km/h : 3 à 6 paliers seulement. Vague A puis vague B.',
    four:'Coureur : court jusqu’au plot annoncé à chaque palier. Coach : note le dernier palier tenu.',
    deroul:['Vague A (5 min), vague B (5 min).','Nouvelle VMA = dernier palier tenu. Chacun met à jour la colonne « Mise à jour T6 » de ses cibles (page 2 du carnet).'],
    cons:['Nancy-Metz impose au moins deux tests de VMA dans la séquence et retient le meilleur. Ici, il sert surtout à recaler les allures de T7 et T9.'],
    reus:'Chaque élève a une VMA à jour et ses cibles de l’épreuve recalculées.',moins:'Arrêt au palier de T2 pour les élèves fatigués.',plus:'Aller au bout pour les G4.'},
   ra:T_RA,proj:T_PROJ
  },
  bilan:'Carnet : zone du 1’30 fatigué comparée à celle de T5, cibles de l’épreuve mises à jour avec la nouvelle VMA.'},

 {id:'t7',n:'T7',short:'Épreuve blanche',title:'Épreuve blanche : 500 m, 500 m, 1’30',lv:4,tab:'t7',
  lead:'L’épreuve en vrai : projets annoncés, échauffement seul observé, 3 courses avec 10 min de récupération, notes au barème. Le bilan dit ce qu’il faut travailler en T8.',
  tl:[['Échauffement autonome observé',20,'warm'],['Projets et installation',5,'inst'],['C1 · 500 m',12,'c1'],['C2 · 500 m',12,'c2'],['C3 · 1’30 avec projet',12,'c3'],['Retour au calme et auto-évaluation',12,'rac'],['Notes et bilan',17,'bilan']],
  warm:'Observé avec la grille de l’outil « Échauffement » ; retour individuel en fin de séance.',
  eval:[['afl1','Note blanche /12 : performance /8 et efficacité /4.'],['afl2','Échauffement et projet observés comme le jour J.'],['afl3','Le coach chronomètre, annonce le passage au 250 m, vérifie le plot du 1’30.']],
  ex:{inst:LIB.inst,c1:LIB.c1,c2:LIB.c2,c3:LIB.c3,rac:T_RAC},
  bilan:'Chacun calcule sa note blanche (outil « Évaluation ») et choisit son thème pour T8 : 1er 500 (départ mal réglé), 2e 500 (chute de vitesse), ou 1’30 (zone ratée). Puis page « Je me situe » : il se place sur les degrés AFL2 et AFL3 et choisit sa répartition (6/2, 4/4, 2/6), à annoncer avant l’épreuve.'},

 {id:'t8',n:'T8',short:'Ma séance',title:'Construire et réaliser sa séance',lv:4,tab:'t8',
  lead:'Ce que le référentiel demande en AFL2 : construire et réaliser une séance sur un thème en utilisant les paramètres de la charge (distance ou durée, intensité, récupération, répétitions). Le thème vient de l’épreuve blanche. Puis on règle l’allure du projet final.',
  tl:[['Échauffement autonome',15,'warm'],['Construire sa séance',10,'constr'],['Réaliser sa séance',35,'mine'],['Prise d’allure : 3 × 100 m',12,'c100'],['Projet final et bilan',18,'bilan']],
  warm:'Échauffement adapté au thème choisi.',
  eval:[['afl2','Séance construite avec les paramètres de la charge et réalisée : élément du référentiel.'],['afl3','Le coach aide à construire la séance et la chronomètre.']],
  ex:{
   constr:{t:'Construire sa séance',k:'AFL2 · paramètres de la charge',
    disp:'Fiche du carnet. Trois thèmes : 1er 500 m, 2e 500 m, 1’30. Choix parmi la banque de situations ou les leçons du carnet (6’ au plot pour la puissance, 36’’/36’’ pour la capacité).',
    four:'Coureur : écrit thème, exercice, distance ou durée, intensité, récupération, nombre de répétitions. Coach : vérifie la cohérence avec le carnet. Professeur : valide en passant de binôme en binôme.',
    deroul:['Volume total d’effort rapide entre 1 000 et 1 800 m.'],
    cons:['La séance répond à un problème vu en T7 : écrire lequel.'],reus:'Séance écrite, chiffrée et validée.'},
   mine:{t:'Réaliser sa séance',k:'AFL2 · séance du binôme',sch:'piste',
    disp:'Les binômes travaillent en même temps, chacun sur sa séance ; la piste est partagée (corde aux courses longues, couloirs extérieurs aux fractions).',
    four:'Coureur : réalise sa séance. Coach : chronomètre et note, puis on inverse (ou les deux courent en alternance dans la même séance).',
    deroul:['Exemples : 6’ au plot à 95 % (puissance) ; 2 × 6 × 36’’/36’’ à 110 % (capacité) ; 4 × 250 m à l’allure du 500 m, 1’ de récupération (allure spécifique).'],
    cons:['Respecter les récupérations écrites : c’est un paramètre de la charge.'],
    reus:'Séance réalisée telle qu’écrite ; écart prévu-réalisé noté.'},
   c100:LIB.c100
  },
  bilan:'Projet final dans le carnet : temps de C1 et C2, passage au 250 m, distance et plot du 1’30, justifiés par l’épreuve blanche.'},

 {id:'t9',n:'T9',short:'Épreuve',title:'Épreuve CCF',lv:4,tab:'eval',status:'eval',
  lead:'Épreuve du référentiel du lycée : 500 m, 500 m et 1’30, 10 min entre les courses, en binôme ; projets annoncés au professeur avant la première course ; échauffement observé.',
  tl:[['Échauffement autonome observé',20,'warm'],['Projets et installation',5,'inst'],['C1 · 500 m',12,'c1'],['C2 · 500 m',12,'c2'],['C3 · 1’30 avec projet',12,'c3'],['Retour au calme et auto-évaluation',12,'rac'],['Notes',17,'bilan']],
  warm:'Sans fiche, observé (AFL2).',
  eval:[['afl1','Performance /8 (moyenne des notes des 3 courses) et efficacité /4 (zone du 1’30).'],['afl2','Carnet, échauffement, projet : 2, 4 ou 6 points selon le choix de l’élève.'],['afl3','Coach-chronométreur-juge : 6, 4 ou 2 points.']],
  ex:{inst:LIB.inst,c1:LIB.c1,c2:LIB.c2,c3:LIB.c3,rac:T_RAC},
  bilan:'Saisie des notes dans l’outil « Évaluation ». Le professeur relève les chronos officiels au départ de chaque vague et contrôle les temps des coachs.'}
];
const JEUX_T={
 t1:{r5:{n:'Le 5 km des équipes',r:'Équipes de 2 binômes (4 élèves, niveaux mélangés). Chaque binôme annonce son temps total visé ; l’équipe additionne ses deux écarts (temps visé − temps réalisé, en valeur absolue). L’équipe qui a le plus petit écart cumulé gagne, pas la plus rapide.',p:'plus petit écart cumulé de la classe = 5 pts, 2e = 3, 3e = 1 ; tout binôme à moins de 30’’ de son temps visé = + 1 pt'},
     ref:{n:'Le pronostic du coach',r:'Avant le 500 m, chaque coach écrit le temps qu’il prédit pour son coureur, sans le lui dire. On compare à l’arrivée : c’est le coach qui marque pour l’équipe.',p:'pronostic à 2’’ près = 3 pts, à 5’’ près = 1 pt'}},
 t2:{tours:{n:'La montée en équipe',r:'Dans chaque équipe, les 2 coureurs de la vague montent ensemble les tours de 8, 10, 12, 14 km/h… Chaque tour tenu à 2’’ près rapporte un point à l’équipe ; les 2 coachs annoncent les passages et s’entraident pour chronométrer.',p:'1 pt par tour tenu ; meilleure équipe de la vague = + 3 pts'}},
 t3:{i36:{n:'Pile-poil par équipes',r:'Les 4 membres de l’équipe font les 36’’/36’’ (deux par vague). Chaque arrivée « pile » au plot cible compte pour l’équipe : on gagne ensemble, chacun à son plot.',p:'pile = 2 pts, à 1 plot près = 1 pt ; total de l’équipe sur les deux vagues'},
     desc:{n:'Le contrat d’équipe',r:'Avant la série, l’équipe additionne les temps prévus de ses 4 coureurs sur chaque distance (tableau) : c’est son contrat. Après chaque distance, on compare au total réalisé (d’après le cours « Demi-fond Pompidou », 6 × 250 m en relais à contrat collectif).',p:'écart d’équipe ≤ 5’’ = 3 pts, ≤ 10’’ = 1 pt, par distance'}},
 t4:{pyr:{n:'La pyramide à contrat',r:'Même contrat d’équipe qu’en T3, sur la pyramide 250-375-500-375-250-125. Le 500 m à 110 % compte double : c’est l’allure des 500 m de l’épreuve.',p:'écart d’équipe ≤ 5’’ = 3 pts, ≤ 10’’ = 1 pt par distance ; doublé sur le 500 m ; équipe gagnante de T3 + T4 annoncée en fin de séance'}}
};
T_SESSIONS.forEach(s=>{const J=JEUX_T[s.id];if(!J)return;Object.keys(J).forEach(k=>{if(s.ex[k])s.ex[k]=Object.assign({},s.ex[k],{jeu:J[k]})})});
T_SESSIONS[0].bilan='Carnet : temps au tour moyen, 500 m de référence et sa note sur 8. Équipes de 2 binômes (niveaux mélangés) gardées jusqu’à T4 ; résultats des deux challenges du jour. Première idée de la répartition AFL2 / AFL3 (6/2, 4/4 ou 2/6), à confirmer avant T7.';
T_SESSIONS[3].bilan='Carnet : temps prévu et réalisé du 500 m à 110 %, première estimation du projet de C1. Annonce de l’équipe gagnante des contrats de T3 et T4 ; à partir de T5, on revient au binôme seul.';
const LEGEND=`<div class="legend"><span><i class="dot" style="background:var(--accent)"></i>coureur</span><span><i class="dot" style="background:var(--team-n)"></i>coach, observateur</span><span><i class="liner"></i>course</span><span><i class="lineo"></i>retour</span><span>plots : plats tous les 10 m · coupelles orange tous les 20 m · grands jaunes tous les 50 m</span></div>`;
SESSIONS.concat(T_SESSIONS).forEach(s=>s.orig=s.status||'next');
