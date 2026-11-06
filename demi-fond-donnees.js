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
  runners:[{s:6},{s:30},{s:58},{s:85},{s:120},{s:150},{s:178}],runs:[{a:88,b:112}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'grands plots jaunes tous les 50 m',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'en 3 min : plots franchis = km/h',cls:'w'}],
  cap:'Les points bleus sont les élèves, répartis tout autour de la piste au départ. Pendant 3 min, chacun compte les grands plots qu’il dépasse, en repartant de 0 à chaque allure. 12 plots en 3 min = 600 m en 3 min = 12 km/h.'},
 relais:{alt:'Le relais du binôme',plots:false,
  runners:[{s:5,l:'B',team:'b',off:4.8},{s:130,l:'A'}],runs:[{a:132,b:194}],segs:[{a:0,b:10,off:4.8,w:2.6}],stxt:[{s:3,t:'zone de relais →',off:-9,a:'end',cls:'w'}],
  texts:[{x:PIN.x,y:PIN.y-18,t:'A fait 1 tour, tape la main de B',cls:'w'},{x:PIN.x,y:PIN.y,t:'qui repart ; A récupère et compte',cls:'w'}],
  cap:'Le binôme est une équipe : un coureur dans le couloir 1, son partenaire attend dans la zone de relais (couloir 3, les 10 premiers mètres après la ligne). 1 tour = 200 m chacun son tour ; 2 manches de 6 min.'},
 test:{alt:'Test 36’’/24’’ sur les plots plats',plots:'10',
  runners:[{s:20,l:'A'},{s:150,l:'A'},{s:56,l:'B',team:'n',off:-7}],runs:[{a:22,b:142}],
  segs:[{a:20,b:140,cls:'blue',t:'36’’ à 12 km/h = 120 m = 12 plots',toff:10}],
  texts:[{x:PIN.x,y:PIN.y,t:'24’’ de marche, puis on repart',cls:'w'},{x:PIN.x,y:PIN.y+18,t:'du plot plat où l’on s’est arrêté',cls:'w'}],
  cap:'Chaque minute : 36’’ de course, 24’’ de marche. Le coureur part d’un plot plat et compte ses plots ; au sifflet il s’arrête et annonce son chiffre. Le coach, au centre de la pelouse, l’a suivi des yeux et vérifie (demi-plot = 0,5). Plots franchis = vitesse en km/h.'},
 ra:{alt:'Récupération active à 70 % de la VMA',plots:'50',
  runners:[{s:10},{s:45},{s:90},{s:130},{s:170}],runs:[{a:92,b:126}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'3 min à 70 % : grands plots jaunes',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'cible = 0,7 × VMA (VMA 12 → 8,5 plots)',cls:'w'}],
  cap:'Les points bleus sont les élèves, répartis autour de la piste. Toute la classe en même temps, chacun à son allure. En 3 min, les grands plots jaunes (50 m) franchis donnent la vitesse en km/h : on vise 70 % de sa VMA, on doit pouvoir parler en phrases.'},
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
  cap:'Départ en face de la ligne (100 m après elle). Le coach démarre son chrono au départ, se place sur la pelouse à hauteur du plot bleu et annonce le temps au 2e passage du coureur (le 1er passage est à 50 m, le 2e à 250 m), puis va à l’arrivée.'},
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
/* Schémas ajoutés à la relecture des fiches (nov. 2026) */
Object.assign(SCH,{
 s3min:{alt:'Le 3’ au plot : départ groupé, mi-course, arrêt',plots:'all',
  runners:[{s:3,l:'A'},{s:62,l:'B',team:'n',off:-7}],runs:[{a:6,b:102}],
  cones:[{s:106,t:'mi-course (1’30)',cls:'g',toff:10.5}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'départ groupé sur la ligne',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'VMA 12 : 600 m en 3’ (3 tours)',cls:'w'}],
  cap:'Tous partent de la ligne au sifflet. Le coach, au centre de la pelouse, compte les tours de son coureur ; au sifflet de 1’30, il pose un plot violet au bord de la pelouse là où passe son coureur ; au sifflet de 3’, le coureur s’arrête sur place et le coach relève le plot plat le plus proche. Distance = tours × 200 m + position du plot ; vitesse = distance ÷ 50.'},
 relais5:{alt:'Le relais 5 km à deux',plots:'50',
  runners:[{s:5,l:'B',team:'b',off:4.8},{s:120,l:'A'}],runs:[{a:122,b:194}],segs:[{a:0,b:10,off:4.8,w:2.6}],stxt:[{s:3,t:'zone de relais →',off:-9,a:'end',cls:'w'}],
  texts:[{x:PIN.x,y:PIN.y-18,t:'25 tours à deux, relais de 1 à 3 tours',cls:'w'},{x:PIN.x,y:PIN.y,t:'B chronomètre A en attendant',cls:'w'}],
  cap:'A court dans le couloir 1 le nombre de tours annoncé ; B attend dans la zone de relais (couloir 3, juste après la ligne), chronomètre le relais de A et l’écrit dans la grille. A tape la main de B dans la zone ; B rentre dans le couloir 1 en regardant derrière.'},
 tours:{alt:'Tours de 200 m à vitesse croissante',plots:'50',
  runners:[{s:3,l:'A'},{s:8,l:'B',team:'n',off:-7}],runs:[{a:6,b:194}],
  texts:[{x:PIN.x,y:PIN.y-14,t:'8 km/h : 1’30 · 10 : 1’12',cls:'w'},{x:PIN.x,y:PIN.y+4,t:'12 km/h : 1’00 · 14 : 51’’',cls:'w'},{x:PIN.x,y:PIN.y+22,t:'1 grand plot jaune = ¼ du tour',cls:'w'}],
  cap:'Départ et passages sur la ligne. Le coach se tient sur la pelouse à hauteur de la ligne (jamais dans le couloir 1), lit son chrono à chaque passage et annonce le temps et l’écart. Repère dans le tour : chaque grand plot jaune = un quart du temps du tour (12 km/h : 15’’ par plot).'},
 i112:{alt:'Intermittent 1’12/1’12 compté en coupelles',plots:'cup20',
  runners:[{s:20,l:'A'},{s:115,l:'A'},{s:70,l:'B',team:'n',off:-7}],runs:[{a:22,b:110}],
  segs:[{a:20,b:110,cls:'blue',t:'80 % de VMA 12 : 9,5 coupelles en 1’12',toff:10}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'1’12 de marche, puis on repart',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'de la coupelle où l’on s’est arrêté',cls:'w'}],
  cap:'Coupelles orange tous les 20 m. En 1’12, coupelles franchies = vitesse en km/h. Le coureur part d’une coupelle, compte, s’arrête au sifflet et annonce son chiffre ; il récupère 1’12 en marchant et repart de la coupelle suivante. Le coach, au centre, vérifie le chiffre.'},
 pyrT4:{alt:'Départs de la pyramide 250-375-500-375-250-125',plots:'50',
  cones:[{s:150,t:'250 m',cls:'o',toff:10.5},{s:25,t:'375 m',cls:'o',toff:10.5},{s:100,t:'500 m',cls:'o',toff:-7},{s:75,t:'125 m',cls:'o',toff:10.5}],
  runners:[{s:104,l:'A'},{s:190,l:'B',team:'n',off:-6}],runs:[{a:107,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'départ = distance avant la ligne',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'toutes les arrivées sur la ligne',cls:'w'}],
  cap:'Chaque distance part d’un plot placé à cette distance avant la ligne : 250 m à 150 m après la ligne, 375 m à 25 m après, 500 m en face (100 m après), 125 m à 75 m après. Le coach chronomètre depuis la pelouse, à hauteur de la ligne.'},
 pyrT6:{alt:'Départs de la série 100-200-250-300-400 m',plots:'50',
  cones:[{s:100,t:'100 m · 300 m',cls:'o',toff:10.5},{s:150,t:'250 m',cls:'o',toff:10.5},{s:0,t:'',cls:'o'}],
  runners:[{s:112,l:'A'},{s:190,l:'B',team:'n',off:-6}],runs:[{a:107,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'200 m et 400 m : départ sur la ligne',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'toutes les arrivées sur la ligne',cls:'w'}],
  cap:'100 m et 300 m partent en face de la ligne (100 m après elle), 250 m à 150 m après la ligne, 200 m et 400 m de la ligne. Le coach annonce le passage à mi-course et l’écart à l’arrivée.'}
});
SCH.projetS=Object.assign({},SCH.projet,{alt:'1’30 avec projet : zones d’arrivée de Seconde',
  cap:'Le coureur place son plot de départ à sa distance projet avant la ligne d’arrivée. Au sifflet de 1’30, il s’arrête sur place : la zone donne les points d’efficacité de Seconde : Z4 (à 5 m de la ligne) = 3 pts ; Z3 (5 à 15 m après) = 2 ; Z2 (5 à 15 m avant) = 1 ; Z1 (plus de 15 m) = 0.'});
const EVAL_SHORT={afl1:'AFL1 · performance (/8) et efficacité du projet sur 1’30 (/4)',afl2:'AFL2 · s’entraîner : carnet, préparation, projet de course',afl3:'AFL3 · coach, chronométreur, juge'};
const S_ACC={t:'Accueil, règles et binômes',k:'Organisation',
  disp:'Classe assise sur la pelouse, face à la ligne d’arrivée. Le professeur montre la piste : sens de course (corde à gauche), ligne d’arrivée, grands plots jaunes tous les 50 m, plots plats tous les 10 m. Présentation de l’épreuve de fin de cycle (S8) : 3’ au plot, 10 min de récupération, 1’30 avec projet de distance.',
  four:'Professeur : forme les binômes (deux élèves de vitesses différentes ; un trio si la classe est impaire) et distribue le matériel. Binôme : un coureur et un coach, rôles inversés à chaque exercice ; un chronomètre, un crayon et le carnet par binôme.',
  deroul:['Règles de piste : on court dans le couloir 1 ; on double par l’extérieur ; on ne s’arrête jamais dans le couloir 1 (on sort vers la pelouse après avoir regardé derrière) ; on ne traverse la piste qu’après avoir regardé à gauche.','Le coach se place toujours sur la pelouse, jamais sur la piste.','Signaux : un coup de sifflet = départ ; deux coups = arrêt sur place ; « top » à la voix = changement d’allure.','Carnet : nom, binôme, date ; il reste au coach pendant que le coureur court.'],
  cons:['Élève inapte partiel : il devient chronométreur ou juge, avec la feuille du professeur.'],
  reus:'Chaque binôme a son chronomètre, son crayon et son carnet ; chacun sait redire les règles de piste avant l’échauffement.'};
const S_RA={t:'Récupération active : 3 min à 70 %',k:'Mode « temps »',sch:'ra',
  disp:'Toute la classe en même temps, répartie autour de la piste. Grands plots jaunes tous les 50 m : en 3 min, grands plots franchis = vitesse en km/h. Cible = 0,7 × VMA de travail (VMA 10 → 7 plots ; VMA 12 → 8,5 ; VMA 14 → 10).',
  four:'Coureur et coach courent tous les deux (c’est la récupération de tout le monde) ; chacun compte ses plots sur les doigts et dit son total à l’autre, qui le note. Professeur : sifflet au départ et à la fin, annonce de chaque minute.',
  deroul:['Départ au sifflet, chacun de là où il est.','Fin au sifflet de 3 min : on s’arrête, on compte ses grands plots (½ plot si on a passé la moitié du chemin vers le suivant).','Pouls 15’’ × 4 tout de suite, puis 1 min de marche et boire.'],
  cons:['70 % : je parle encore en faisant des phrases. Si je ne peux dire que des mots, je ralentis.','Pouls repère à la fin : 140 à 150 ; il doit redescendre sous 120 après la minute de marche.','Doubler par l’extérieur ; personne ne s’arrête dans le couloir 1.'],
  reus:'À 1 grand plot de la cible, et pouls sous 120 après la minute de marche.',moins:'2 min de trot, 1 min de marche.',plus:'Annoncer sa cible avant de partir et la toucher à ½ plot près.'};
function S_I36(pct,n,extra){const f=v=>fP(v*pct/100),mm=n*72;return Object.assign({t:`36’’/36’’ au plot cible à ${pct} %`,k:'Fil rouge 1 · courir au temps',sch:'i3636',
  disp:`Plots plats tous les 10 m depuis la ligne (plot 1 à 10 m, plot 12 à 120 m). En 36’’, plots franchis = vitesse en km/h : plot cible = ${pct===100?'plot n° VMA de travail':'plot n° '+(pct/100).toFixed(2).replace('.',',')+' × VMA de travail'} (VMA 10 → ${f(10)}e plot ; 12 → ${f(12)}e ; 14 → ${f(14)}e). Départ commun sur la ligne, couloirs 1 et 2. ${n} répétitions en aller-retour : 36’’ de course, 36’’ de récupération en marchant ; toute la vague court dans le même sens (tous à l’aller, puis tous au retour).`,
  four:'Coureur : arrive à son plot cible au sifflet de fin, ni avant ni après ; aux retours, il vise la ligne et s’annonce lui-même (« pile », « 1 plot court »). Coach : debout sur la pelouse à hauteur du plot cible de son coureur, juge chaque aller : « tôt » (plot passé avant le sifflet), « pile » (à moins de 5 m), « tard » ; il coche dans le carnet. Professeur : un coup de sifflet au départ et à la fin de chaque 36’’, « moitié » à 18’’, « 5 secondes » avant chaque départ.',
  deroul:[`Vague A : ${n} × 36’’/36’’ (${Math.floor(mm/60)} min ${String(mm%60).padStart(2,'0')}), 2 min de transition (le coach devient coureur), puis vague B.`,'Pendant les 36’’ de récupération : marcher autour de son plot, dans les couloirs 1 et 2, puis s’y replacer pour le retour vers la ligne.','À « moitié » (18’’), on doit être à mi-chemin de son plot cible (6e plot pour une cible au 12e).','Après la dernière répétition : pouls 15’’ × 4, noté dans le carnet avec le nombre de « pile ».'],
  cons:['Les 10 premiers mètres décident de tout : se caler tout de suite sur l’allure, ne pas sprinter.','Tôt deux fois : je ralentis. Tard deux fois : j’accélère.',`Ressenti : à ${pct} %, je ne parle plus pendant les 36’’, mais je récupère en marchant. Pouls repère en fin de série : 160 à 180.`,'Sécurité : on ne se retourne pas avant le sifflet ; celui qui s’arrête sort vers la pelouse ; les coachs ne mettent jamais le pied dans le couloir 1.'],
  reus:`${Math.ceil(n*0.75)} répétitions sur ${n} à 1 plot près (10 m).`,moins:`Plot cible à ${pct-5} %.`,plus:`Les ${Math.floor(n/2)} dernières à ${pct+5} %.`},extra||{})}
function S_3MIN(extra){const e=Object.assign({},extra||{}),b={t:'Le 3’ au plot',k:'Fil rouge 2 · course C1 de l’épreuve',sch:'s3min',
  disp:'Grands plots jaunes (50 m) et plots plats (10 m) autour de la piste. Départ groupé sur la ligne au sifflet ; le professeur siffle la mi-course (1’30) puis l’arrêt (3’) et annonce le temps toutes les 30’’. Vague A, puis vague B 3 min plus tard. Distance visée : 3’ à 95 ou 100 % de la VMA de travail, soit VMA × 50 m (VMA 12 → 600 m à 100 %, 570 m à 95 %).',
  four:'Coureur : annonce sa distance visée et sa mi-course (moitié de la distance), court régulier, s’arrête sur place au sifflet de 3’. Coach : au centre de la pelouse, compte les tours sur ses doigts ; au sifflet de 1’30, pose un plot violet au bord de la pelouse là où passe son coureur ; à 3’, relève le plot plat le plus proche (à 5 m près). Professeur : sifflets et annonce du temps.',
  deroul:['Avant le départ : distance visée et mi-course visée écrites dans le carnet.','Distance = tours complets × 200 m + position du plot d’arrêt depuis la ligne (3 tours + 40 m = 640 m). Vitesse en km/h = distance ÷ 50 (600 m = 12 km/h).','Régularité : 2e moitié = distance totale − distance à la mi-course ; elle doit être au moins égale à la 1re.','Pouls 15’’ × 4 tout de suite après l’arrêt, puis marche et boire.'],
  cons:['Partir à l’allure de la fin : à 12 km/h, un grand plot jaune toutes les 15’’, un tour en 1’.','Je ne parle plus, mais je ne suis pas « à bloc » avant les 30 dernières secondes. Pouls repère à l’arrivée : 170 à 190.','Doubler par l’extérieur. Au sifflet final, s’arrêter sur place, puis sortir vers la pelouse en regardant derrière.'],
  reus:'2e moitié ≥ 1re moitié, à 10 m près (c’est le point de régularité de l’épreuve) ; distance à 20 m près de la distance visée.',moins:'Viser 90 % ; le coach annonce le temps de chaque tour (« 1’02 »).',plus:'Viser 100 % sans annonce de temps ; le coureur estime sa distance avant que le coach la lui donne.'};
  if(e.avant){b.deroul=e.avant.concat(b.deroul);delete e.avant}return Object.assign(b,e)}
function S_PROJ(extra){const e=Object.assign({},extra||{}),b={t:'1’30 avec projet de distance',k:'Fil rouge 2 · course C2 de l’épreuve',sch:'projetS',
  disp:'Plots plats tous les 10 m pour placer son plot ; zones d’arrivée marquées autour de la ligne (−15, −5, +5, +15 m). Chacun part de son plot, posé à sa distance projet avant la ligne ; tous partent au même sifflet et visent la ligne au sifflet de 1’30. Vague A, 3 min de placement, vague B.',
  four:'Coureur : annonce sa distance projet, pose son plot en comptant les plots plats, court régulier, s’arrête sur place au sifflet. Coach : vérifie le plot avant le départ ; au centre de la pelouse, au « 45 » du professeur, regarde si son coureur est en avance ou en retard sur la moitié du projet ; puis se place au niveau des zones, juge la zone et mesure l’écart en mètres. Professeur : sifflet de départ, « 45 » à mi-course, sifflet de fin.',
  deroul:['Placer son plot : 1’30 à V km/h = V × 25 m. Projet 300 m → un tour + 100 m : plot 100 m avant la ligne. Projet 340 m → un tour + 140 m : plot 140 m avant la ligne, soit 60 m après elle.','Mi-course (45’’) = moitié du projet (projet 340 m → 170 m).','Écart : + si le coureur a dépassé la ligne, − s’il ne l’a pas atteinte. Distance réalisée = projet + écart ; vitesse = distance ÷ 25.'],
  cons:['Même allure du début à la fin : la ligne doit arriver au sifflet, pas avant.','Allure du 1’30 : 105 à 110 % de la VMA de travail ; je ne parle plus. Pouls repère à l’arrivée : 170 à 190.','Zones de Seconde : Z4 (à 5 m de la ligne) = 3 pts ; Z3 (5 à 15 m après) = 2 ; Z2 (5 à 15 m avant) = 1 ; Z1 (plus de 15 m) = 0.','Au sifflet : arrêt sur place jusqu’à la lecture du coach ; les autres doublent par l’extérieur.'],
  reus:'Zone 4 ou zone 3.',moins:'Zones élargies à ± 10 m ; le coach crie « en avance » ou « en retard » au « 45 ».',plus:'Projet + 5 m, sans annonce à mi-course.'};
  if(e.avant){b.deroul=e.avant.concat(b.deroul);delete e.avant}return Object.assign(b,e)}
const S_RAC={t:'Retour au calme et auto-évaluation',k:'AFL2 · bilan',
  disp:'Toute la classe : 3 min de marche dans les couloirs 3 et 4, puis étirements doux assis sur la pelouse (mollets, cuisses avant et arrière, fessiers : 15 à 20’’ chacun, sans à-coups). Boire.',
  four:'Coureur : remplit la partie bilan du carnet (distances, zone, pouls, ressenti de 1 à 5, ce qui a marché, ce qui a manqué). Coach : complète la feuille de résultats et écrit un conseil chiffré (« pars 10 m moins vite », « projet + 5 m »). Professeur : relit et signe 3 ou 4 carnets.',
  deroul:['Pouls 15’’ × 4 au début de la marche, puis au bout de 3 min : il doit être redescendu sous 110.','Bilan : écart entre projet et réalisé pour chaque course, en mètres.'],
  cons:['Étirer doucement : ça tire, ça ne fait pas mal. Pas d’étirement forcé juste après un effort intense.','Un conseil utile = un chiffre et une action.'],
  reus:'Carnet complet et pouls sous 110 avant de quitter la piste.',moins:'Le coach remplit le bilan sous la dictée du coureur.',plus:'Le coureur écrit déjà son projet pour la séance suivante et le justifie.'};
const SESSIONS=[
 {id:'s1',n:'S1',short:'Allures, VMA',title:'Courir ensemble, découvrir les allures, mesurer sa VMA de travail',lv:1,tab:'ref1',
  lead:'Installer les binômes et les règles de la piste, apprendre les 3 parties de l’échauffement, découvrir quatre allures sur 3 min. La 4e, le 3’ rapide, donne la VMA de travail de tout le cycle : grands plots jaunes franchis en 3’ = km/h.',
  tl:[['Accueil, règles et binômes',5,'acc'],['Échauffement guidé',25,'warm'],['Les 4 allures sur 3’',18,'allures4'],['Le relais du binôme',22,'relais'],['Ma VMA de travail et carnet',20,'bilan']],
  warm:'Le professeur mène et explique chaque partie. Apprendre à prendre son pouls (15’’ × 4) et à vérifier les 3 signes ; gammes démontrées.',
  eval:[['afl1','Le 3’ rapide est déjà la course C1 de l’épreuve : première distance, première note repère.'],['afl2','Premières données du carnet : 4 vitesses, pouls, VMA de travail.'],['afl3','Le binôme se forme : compter, noter, encourager.']],
  ex:{acc:S_ACC,
   allures4:{t:'Les 4 allures : 4 × 3 min',k:'Fil rouge 2 · courir au temps',sch:'allures4',
    disp:'Toute la classe en même temps sur la piste. Grands plots jaunes tous les 50 m (4 par tour de 200 m). Les élèves partent répartis tout autour de la piste, pour ne pas courir en paquet. En 3 min, le nombre de grands plots dépassés donne directement la vitesse en km/h.',
    four:'Coureur : compte ses grands plots sur les doigts (une main = 5). Binôme : au sifflet de fin, chacun dit son total à l’autre, qui le note dans le carnet avec le pouls. Le professeur donne les tops de départ et de fin, et annonce le temps toutes les minutes.',
    deroul:['Départ au sifflet, chacun là où il est. Fin au sifflet : on s’arrête sur place et on regarde où l’on est.','Compter : nombre de grands plots dépassés ; si on a fait plus de la moitié du chemin vers le plot suivant, on ajoute ½ (= ½ km/h).','Tout de suite après l’arrêt : pouls 15’’ × 4. Puis 1 min de pause en marchant, le binôme note les deux totaux et les deux pouls.','Allure 1 · Marche rapide, 3 min : on marche le plus vite possible sans courir (repère : 5 à 7 plots).','Allure 2 · Footing, 3 min : je peux parler en faisant des phrases (repère : 7 à 9 plots).','Allure 3 · Allure rythmée, 3 min : je parle seulement par mots (repère : 9 à 11 plots).','Allure 4 · 3’ rapide : la plus grande distance possible en restant régulier, sans marcher. Ce total = la VMA de travail du cycle.'],
    cons:['Associer chaque allure à une respiration : je parle par phrases, je parle par mots, je ne parle plus.','Le 3’ rapide : partir à l’allure de la fin, pas plus vite ; le 1er plot doit tomber vers 15’’ pour 12 km/h (un plot toutes les 15’’ = 12 km/h).','Pouls : 2 doigts sur le côté du cou, compter 15’’, multiplier par 4.','Doubler par l’extérieur, ne jamais s’arrêter dans le couloir 1.'],
    reus:'Les 4 vitesses augmentent d’une allure à l’autre ; le 3’ rapide est régulier (pas d’arrêt, pas de marche) ; les 4 totaux et 4 pouls sont notés dans le carnet.',
    moins:'Marche-course alternée sur les 2 premières allures ; le binôme compte pour son coureur pendant le 3’ rapide.',plus:'Annoncer avant le 3’ rapide le nombre de plots visés, et le comparer au réalisé.'},
   relais:{t:'Le relais du binôme',k:'Situation finale · courir ensemble',sch:'relais',
    disp:'Binôme = une équipe. Zone de relais : les 10 premiers mètres après la ligne, dans le couloir 3. 2 manches de 6 min, 3 min de récupération entre les deux ; chacun court un tour (200 m) à son tour. Tous les binômes en même temps : le premier coureur de chaque binôme part de la ligne au sifflet.',
    four:'Coureur : court son tour dans le couloir 1, se décale vers le couloir 3 en arrivant et tape la main de son partenaire dans la zone. Partenaire : attend dans la zone, couloir 3 ; repart dès qu’on lui a tapé la main et rejoint le couloir 1 en regardant derrière. Celui qui récupère compte les tours du binôme (un trait par tour) et chronomètre le tour de l’autre. Trio : les trois tournent dans le même ordre. Professeur : sifflet au départ et à 6 min, annonce du temps chaque minute.',
    deroul:['Avant chaque manche, le binôme annonce le nombre de tours qu’il pense faire en 6 min (repère : deux élèves à 12 km/h font environ 6 tours).','Au sifflet de 6 min, le tour en cours compte s’il a passé la moitié (grand plot jaune du 100 m).','3 min de récupération : marcher, boire, comparer annoncé et réalisé, regarder les temps au tour.','2e manche : le binôme ajuste son annonce à partir des temps au tour de la 1re.'],
    cons:['Allure qu’on peut répéter 3 ou 4 fois, pas de sprint : chaque tour à 2 secondes près du précédent.','Pendant le tour de repos, on marche dans la zone : si on ne peut plus parler en repartant, on est parti trop vite.','Sécurité : on attend dans le couloir 3, jamais dans le couloir 1 ; on regarde derrière avant d’y rentrer.'],
    reus:'2e manche : écart entre tours annoncés et réalisés d’un tour au plus ; temps au tour stables à 3 secondes près.',moins:'Relais à mi-piste (100 m) : le partenaire attend au grand plot jaune du 100 m, couloir 3.',plus:'Un tour sur deux à l’allure du 3’ rapide, annoncé avant.'}
  },
  bilan:'Classement du jour des binômes (points des deux challenges). VMA de travail = grands plots jaunes franchis pendant le 3’ rapide (au demi-plot près). Chacun recopie sa ligne du tableau « Mes cibles » dans le carnet. Groupes de vitesse (G1 moins de 10 km/h, G2 10 à 11,5, G3 12 à 13,5, G4 14 et plus) ; coureur et coach dans deux groupes différents. Retour au calme : marche, étirements doux.'},

 {id:'s2',n:'S2',short:'36’’, 1’30',title:'Découvrir le 36’’/36’’ et mesurer son 1’30',lv:1,tab:'cour',
  lead:'Premier contact avec les deux situations du cycle : le 36’’/36’’ au plot cible (la VMA de travail donne le numéro du plot) et le 1’30 mesuré, qui fournit la distance du premier projet. Échauffement guidé, mais ce sont les élèves qui annoncent l’étape suivante.',
  tl:[['Échauffement guidé',22,'warm'],['36’’/36’’ au plot cible à 100 %',24,'i36'],['Récupération active',6,'ra'],['Le 1’30 mesuré',18,'p130'],['Bilan et carnet',20,'bilan']],
  warm:'Les élèves annoncent la partie suivante et vérifient les 3 signes. Fin d’échauffement : 2 × 36’’ « pour voir » sur les plots plats.',
  eval:[['afl1','Le 1’30 mesuré donne la première distance du projet de l’épreuve.'],['afl3','Le coach juge les arrivées au plot cible et mesure le 1’30.']],
  ex:{i36:S_I36(100,8),ra:S_RA,
   p130:{t:'Le 1’30 mesuré',k:'Fil rouge 2 · mesurer sa distance',sch:'p130',
    disp:'Plots plats tous les 10 m et grands plots jaunes tous les 50 m. Départ groupé sur la ligne au sifflet ; le professeur annonce « 45 » à la mi-course et siffle l’arrêt à 1’30. Vague A, puis vague B 5 min plus tard.',
    four:'Coureur : court 1’30 à l’allure qu’il pourrait tenir encore une fois, s’arrête sur place au sifflet. Coach : au centre de la pelouse, compte les tours ; au « 45 », repère le plot plat où passe son coureur ; au sifflet, rejoint son coureur et relève le plot d’arrêt. Professeur : sifflets, annonce du temps à 30’’, 45’’, 1’ et 1’15.',
    deroul:['Cible : 105 à 110 % de la VMA de travail, soit VMA × 25 m × 1,05 à 1,10 (VMA 10 → 265 à 275 m ; VMA 12 → 315 à 330 m ; VMA 14 → 365 à 385 m).','Distance = tours × 200 m + position du plot d’arrêt ; vitesse en km/h = distance ÷ 25 (325 m = 13 km/h).','1re moitié = distance au « 45 » ; 2e moitié = distance totale − 1re moitié.','Pouls 15’’ × 4 à l’arrêt ; ressenti de 1 (facile) à 5 (à bloc) dans le carnet.'],
    cons:['La 2e moitié au moins aussi longue que la 1re : partir à 105 %, pas plus vite.','Je ne parle plus, mais je peux encore accélérer dans les 15 dernières secondes. Pouls repère : 170 à 190 ; ressenti 4 sur 5.','Au sifflet : arrêt sur place, puis sortie vers la pelouse ; les autres doublent par l’extérieur.'],
    reus:'2e moitié ≥ 1re moitié, et distance dans la cible (105 à 110 %).',moins:'Cible à 100 %.',plus:'Cible à 110 % sans regarder les plots.'}
  },
  bilan:'Carnet : répétitions « pile » au 36’’, distance du 1’30 et sa note repère (barème de Seconde). Premier projet pour S3 : distance du 1’30 mesuré, ± 10 m selon le ressenti.'},

 {id:'s3',n:'S3',short:'Premier projet',title:'Le 3’ au plot et le premier 1’30 avec projet',lv:2,tab:'cour',
  lead:'Les deux courses de l’épreuve, chacune seule : le 3’ avec mi-course marquée pour apprendre la régularité, puis le premier 1’30 avec plot de départ et zones d’arrivée. Échauffement semi-guidé : le binôme suit la fiche, le professeur ne donne que les tops.',
  tl:[['Échauffement semi-guidé',20,'warm'],['36’’/36’’ au plot cible à 100 %',20,'i36'],['Le 3’ au plot',16,'c3'],['1’30 avec projet',18,'proj'],['Bilan et carnet',16,'bilan']],
  warm:'Fin d’échauffement : 2 accélérations de 60 m à l’allure du 36’’/36’’.',
  eval:[['afl1','Les deux courses de l’épreuve sont là : distance du 3’, zone du 1’30.'],['afl2','Projet construit à partir d’une mesure (S2), pas au hasard.'],['afl3','Le coach marque la mi-course du 3’ et juge la zone du 1’30.']],
  ex:{i36:S_I36(100,6,{t:'36’’/36’’ au plot cible à 100 % (2e fois)',reus:'5 répétitions sur 6 à 1 plot près : mieux qu’en S2.'}),c3:S_3MIN(),proj:S_PROJ({avant:['Projet = distance du 1’30 mesuré en S2, ± 10 m selon le ressenti.','Au moins 8 min après le 3’ : vague A, 3 min de placement, vague B.']})},
  bilan:'Carnet : distance du 3’ et régularité (2e moitié − 1re), zone du 1’30 et écart en mètres. Retour au calme : marche et étirements doux.'},

 {id:'s4',n:'S4',short:'1’30 fatigué',title:'Tenir son projet en étant fatigué',lv:2,tab:'cour',
  lead:'Même travail qu’en S3, une seule variable change : le 1’30 avec projet arrive juste après le 3’, avec seulement 6 min de récupération. Faut-il retirer quelques mètres au projet ? Le binôme décide et le justifie.',
  tl:[['Échauffement semi-guidé',18,'warm'],['36’’/36’’ au plot cible à 100 %',20,'i36'],['Le 3’ au plot',14,'c3'],['1’30 avec projet, après 6 min',16,'proj'],['Récupération active',6,'ra'],['Bilan et carnet',16,'bilan']],
  warm:'Le binôme choisit ses 4 exercices de renforcement et sa fin d’échauffement.',
  eval:[['afl1','Préparer C2 : courir le 1’30 sans être frais.'],['afl2','Ajuster son projet à la fatigue : décision écrite dans le carnet.']],
  ex:{i36:S_I36(100,6,{t:'36’’/36’’ au plot cible à 100 % (3e fois)',reus:'6 répétitions sur 6 à 1 plot près.'}),c3:S_3MIN(),proj:S_PROJ({t:'1’30 avec projet, 6 min après le 3’',avant:['Vague A : 3’ à 0’, puis 1’30 à 9’ (6 min après la fin du 3’) ; vague B : 3’ à 5’, 1’30 à 14’.','Projet ajusté à la fatigue : − 5 à − 10 m par rapport à S3 ? Le binôme décide et écrit pourquoi.']}),ra:S_RA},
  bilan:'Carnet : zone du 1’30 fatigué comparée à S3. La décision prise sur le projet était-elle la bonne ?'},

 {id:'s5',n:'S5',short:'Régularité',title:'Régularité sur 3’ et allure au-dessus de la VMA',lv:3,tab:'cour',
  lead:'Le 36’’/36’’ passe à 105 %. Deux 3’ séparés de 5 min pour apprendre à reproduire une allure, puis le 1’30 avec projet. Échauffement autonome avec fiche : le binôme construit son échauffement de 15 min et l’écrit dans le carnet.',
  tl:[['Échauffement autonome (fiche)',15,'warm'],['36’’/36’’ au plot cible à 105 %',20,'i36'],['2 × 3’ au plot',24,'c3'],['1’30 avec projet',16,'proj'],['Bilan et carnet',15,'bilan']],
  warm:'Le binôme écrit son échauffement (durées des 3 parties, 4 exercices, gammes) avant de commencer.',
  eval:[['afl1','Régularité du 3’ : 1 point de l’efficacité à l’épreuve.'],['afl2','Échauffement construit et écrit par le binôme.']],
  ex:{i36:S_I36(105,6),c3:S_3MIN({t:'2 × 3’ au plot',disp:'Deux 3’ par vague, 5 min de récupération entre les deux : vague A à 0’, vague B à 4’, vague A à 8’, vague B à 12’. Départ groupé sur la ligne au sifflet, mi-course sifflée à 1’30, arrêt à 3’. Le coach pose le plot violet de mi-course à chaque 3’.',deroul:['Le 2e 3’ doit être à 20 m près du 1er : c’est reproduire une allure. Même distance visée, même mi-course visée.','Distance = tours × 200 m + plot d’arrêt ; régularité = 2e moitié − 1re moitié, pour chacun des deux 3’.','Entre les deux : marcher, boire, regarder avec son coach la mi-course du 1er.','Pouls 15’’ × 4 après chaque 3’ : le 2e ne doit pas dépasser le 1er de plus de 10 pulsations.'],reus:'Deux 3’ à 20 m près l’un de l’autre, et réguliers (2e moitié ≥ 1re, à 10 m près).'}),proj:S_PROJ()},
  bilan:'Carnet : écart entre les deux 3’, régularité, zone du 1’30. Le coach écrit un conseil pour l’épreuve blanche.'},

 {id:'s6',n:'S6',short:'Épreuve blanche',title:'Épreuve blanche : 3’, 10 min, 1’30',lv:3,tab:'evs',
  lead:'L’épreuve de Seconde en vrai, notée au barème : 3’ au plot, 10 min de récupération, 1’30 avec projet. Le bilan dit ce que chacun travaille en S7.',
  tl:[['Échauffement autonome (fiche)',18,'warm'],['Projets et installation',5,'inst'],['C1 · 3’ au plot',12,'e1'],['C2 · 1’30 avec projet',12,'e2'],['Retour au calme et auto-évaluation',13,'rac'],['Notes et bilan',30,'bilan']],
  warm:'Échauffement écrit dans le carnet, réalisé en binôme ; dernières accélérations à l’allure du 1’30.',
  eval:[['afl1','Note blanche : performance /8 (3’ /4, 1’30 /4) et efficacité /4.'],['afl2','Échauffement et projet comme le jour de l’évaluation.'],['afl3','Le coach mesure, marque la mi-course, juge la zone.']],
  ex:{
   inst:{t:'Projets et installation',k:'Organisation',
    disp:'Avant l’échauffement, le professeur pose les zones d’arrivée du 1’30 (−15, −5, +5, +15 m) et distribue une feuille de résultats par coach. Chaque coach prend un plot violet (mi-course du 3’) ; les plots de départ du 1’30 attendent au bord de la pelouse.',
    four:'Coureur : donne sa distance visée sur 3’ (et la mi-course qui va avec) et son projet de 1’30, justifiés par le carnet. Coach : les recopie sur la feuille, vérifie son chrono. Professeur : rappelle les horaires de départ.',
    deroul:['Horaires, comptés depuis le premier sifflet : C1 3’, vague A à 0’, vague B à 6’ ; C2 1’30, vague A à 12’, vague B à 18’.','La vague B finit son échauffement pendant le C1 de la vague A : dernière accélération 5 min avant son départ.'],
    cons:['Le projet du 1’30 est écrit avant le 3’ ; on peut le modifier après le 3’, en l’annonçant au coach.'],
    reus:'Tous les projets écrits sur la feuille avant le premier départ.'},
   e1:{t:'C1 · 3’ au plot',k:'Course 1',sch:'s3min',
    disp:'Départ groupé sur la ligne : vague A au sifflet (0’), vague B à 6’. Le professeur siffle la mi-course (1’30) et l’arrêt (3’) et annonce le temps toutes les 30’’. Les coachs sont au centre de la pelouse, plot violet en main.',
    four:'Coureur : court à son projet, s’arrête sur place au sifflet. Coach : compte les tours ; au sifflet de 1’30, pose le plot violet au bord de la pelouse là où passe son coureur ; à 3’, relève le plot plat d’arrêt ; écrit mi-course et distance sur la feuille. Professeur : chronomètre officiel, vérifie 3 ou 4 distances.',
    deroul:['Distance = tours × 200 m + plot d’arrêt (à 5 m près). Mi-course = position du plot violet.','Régularité (1 pt) : 2e moitié (distance − mi-course) ≥ 1re moitié, à 10 m près.','Après la course : pouls, puis marche, trot très lent, boire ; rester actif et couvert, ne pas s’asseoir.'],
    cons:['Sécurité : le plot violet se pose sur la pelouse, jamais dans le couloir 1.','Au sifflet : arrêt sur place ; le coureur ne bouge plus tant que son coach n’a pas lu le plot.'],
    reus:'Distance à 20 m près du projet ; 2e moitié ≥ 1re moitié.'},
   e2:{t:'C2 · 1’30 avec projet',k:'Course 2',sch:'projetS',
    disp:'Vague A à 12’, vague B à 18’ (comptés depuis le départ du C1) : environ 9 min de récupération pour chacun. Chacun part de son plot, posé à la distance projet avant la ligne ; tous partent au même sifflet. Le professeur annonce « 45 » et siffle l’arrêt à 1’30.',
    four:'Coureur : annonce son projet définitif et pose son plot 3 min avant son départ. Coach : vérifie le plot en comptant les plots plats, se place au bord de la pelouse au niveau des zones, juge la zone et mesure l’écart. Professeur : sifflets, contrôle des plots de départ.',
    deroul:['Le coureur peut ajuster son projet après son 3’ : projet ≈ distance du 3’ × 0,53 à 0,55 (600 m → 320 à 330 m). Il l’annonce avant de partir.','Zone : Z4 (à 5 m de la ligne) = 3 pts ; Z3 (5 à 15 m après) = 2 ; Z2 (5 à 15 m avant) = 1 ; Z1 = 0.','Distance réalisée = projet + écart : la note de performance se lit au barème de Seconde.'],
    cons:['Au « 45 », être à la moitié du projet.','Au sifflet : arrêt sur place jusqu’à la lecture du coach.'],
    reus:'Zone 4 ou zone 3.'},
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
    disp:'Trois ateliers sur la même piste, chacun choisit le sien. A. Départ du 3’ trop rapide : 2 × 1’30 à l’allure du 3’ (VMA × 25 m, soit 300 m pour une VMA de 12), 2 min de marche entre les deux. B. 1’30 hors zone : 3 × 45’’ à l’allure du projet (moitié du projet en 45’’), 1’30 de marche entre. C. Chute de vitesse : 3 × 300 m à l’allure du 1’30, 2’30 de récupération.',
    four:'Coureur : choisit l’atelier à partir de sa feuille d’épreuve blanche et écrit sa cible chiffrée dans le carnet. Coach : donne le départ, chronomètre, mesure (plots plats) et annonce l’écart après chaque répétition. Professeur : valide le choix de chaque binôme avant le départ.',
    deroul:['A : départ de la ligne ; à 45’’, le coach annonce l’écart à la moitié de la cible (150 m pour 300 m) ; arrêt au signal du coach à 1’30, lecture du plot.','B : plot de départ à la moitié du projet avant la ligne (projet 330 m → 165 m avant la ligne, soit 35 m après elle) ; arrêt à 45’’, lecture de l’écart à la ligne.','C : départ en face de la ligne (100 m après elle), arrivée sur la ligne. Temps visé = 300 × 90 ÷ projet (projet 330 m → 1’22) ; passage au 150 m à la moitié.','10 min par coureur, puis on inverse.'],
    cons:['Un seul atelier : celui qui répond au problème de l’épreuve blanche, pas celui qu’on préfère.','Sécurité : les coachs restent sur la pelouse ; à l’arrêt, on sort vers la pelouse en regardant derrière.','Pouls 15’’ × 4 après la dernière répétition, noté avec les écarts.'],
    reus:'Écart à la cible réduit d’une répétition à l’autre ; dernière répétition à 5 m près (A, B) ou à 2 secondes près (C).',moins:'Une répétition de moins.',plus:'Aucune annonce du coach : le coureur estime son écart avant de l’entendre.'},
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
 testA:{t:'Test 10 × 36’’/24’’ · vague A',k:'Test de VMA',sch:'test',
  disp:'Plots plats tous les 10 m sur toute la piste. Une minute = 36’’ de course + 24’’ de marche, 10 fois de suite (10 min). Les coureurs partent répartis autour de la piste, chacun d’un plot plat. Sifflet au départ et à la fin de chaque 36’’.',
  four:'Coureur A : part d’un plot plat, compte ses plots en courant, s’arrête au sifflet et annonce son chiffre ; il marche 24’’ jusqu’au plot plat suivant et repart de là. Coach B : au centre de la pelouse, suit son coureur des yeux, vérifie le chiffre annoncé (demi-plot = 0,5) et le note dans la grille 1’ à 10’. Professeur : sifflets, annonce du numéro de la répétition (« 4 sur 10 ») et « 5 secondes » avant chaque départ.',
  deroul:['2 min : rappel du protocole, chaque coach a son crayon et sa grille.','10 min de test.','2 min : le coach additionne les 10 chiffres et divise par 10 : c’est la VMA (km/h), au demi-km/h près.'],
  cons:['Plots franchis en 36’’ = vitesse en km/h (12 plots = 120 m en 36’’ = 12 km/h).','Partir à l’allure que je crois tenir 10 fois : on cherche 10 chiffres proches, pas un record sur la 1re. Si c’est facile après 3 répétitions, monter d’un plot.','Ressenti : dur à partir de la 6e répétition (4 sur 5) ; pouls en fin de test 180 et plus.','Sécurité : au sifflet, ralentir en 2 pas sans se retourner ; marcher dans son couloir ; doubler par l’extérieur.'],
  reus:'Au plus 2 km/h d’écart entre la meilleure et la moins bonne répétition.',moins:'8 répétitions (diviser par 8) pour un élève qui reprend ou un inapte partiel autorisé à courir.',plus:'Aucune : c’est un test.'},
 testB:{t:'Test 10 × 36’’/24’’ · vague B',k:'Test de VMA',sch:'test',
  disp:'Même dispositif que la vague A, rôles inversés : coureur B, coach A.',
  four:'Coureur B : mêmes règles. Coach A, encore essoufflé : au centre de la pelouse, compte à voix basse avec son coureur et note chaque chiffre dans la grille. Professeur : mêmes sifflets ; contrôle 3 ou 4 grilles pendant le test.',
  deroul:['10 min de test.','2 min de calcul : total des 10 chiffres ÷ 10 = VMA.','2 min de récupération en marchant ; pouls à la fin.'],
  cons:['Comparer avec la dernière vitesse tenue aux tours (exercice 1) et avec la VMA de Seconde notée dans le carnet : un écart de plus de 1,5 km/h se discute avec le professeur.','Sécurité : au sifflet, ralentir en 2 pas sans se retourner ; doubler par l’extérieur.'],
  reus:'VMA calculée et vérifiée par le professeur pour chaque élève avant la fin de la séance.',moins:'8 répétitions (diviser par 8) pour un élève qui reprend.',plus:'Aucune : c’est un test.'},
 t130:{t:'Travail du 1’30 : 1’30, 45’’, 45’’, 1’30',k:'Situation finale · leçon 5 du carnet',sch:'projet',
  disp:'Plots plats tous les 10 m pour placer les plots de départ ; zones d’arrivée autour de la ligne (−15, −5, +5, +15 m). Deux 1’30 avec projet ; entre les deux, 2 × 45’’ à l’allure du 1’30, 45’’ de récupération en marchant. Tous les coureurs d’une vague partent au même sifflet, chacun de son plot.',
  four:'Coureur : écrit sa distance projet et sa distance visée aux 45’’ (moitié du projet), pose son plot. Coach : au centre de la pelouse ; au « 45 » du professeur, repère où passe son coureur ; au sifflet de 1’30, juge la zone et mesure l’écart en mètres. Professeur : sifflets de départ et de fin, « 45 » à mi-course.',
  deroul:['A 1’30, B 1’30, A 2 × 45’’, B 2 × 45’’, A 1’30, B 1’30.','Plot du 1’30 = projet avant la ligne (projet 340 m → un tour + 140 m : plot à 60 m après la ligne).','Plot des 45’’ = moitié du projet avant la ligne (projet 340 m → 170 m avant la ligne : plot à 30 m après elle) ; arrivée jugée à la ligne, à 5 m près.','Après le 1er 1’30 : distance réalisée = projet + écart. Le projet du 2e se fixe à partir de cette distance et des deux 45’’.'],
  cons:['Distance aux 45’’ = la moitié du projet : si on la dépasse de plus de 10 m, on finit en zone 2.','Allure du 1’30 : autour de 120 % de la VMA (VMA 12 → 360 m ; VMA 15 → 450 m), à corriger avec ses propres mesures.','Ressenti : on ne parle plus, le dernier tiers est dur (4 sur 5) ; pouls à l’arrivée 180 et plus.','Au sifflet : arrêt sur place jusqu’à la lecture du coach ; les autres sortent vers la pelouse en regardant derrière.'],
  reus:'Deuxième 1’30 en zone 4 ou zone 3.',moins:'Un seul 1’30 après les 45’’.',plus:'Deuxième 1’30 avec un projet + 5 m.'},
 inst:{t:'Projets et installation',k:'Organisation',
  disp:'Avant l’échauffement, le professeur installe : plot de départ des 500 m (en face de la ligne, 100 m après elle), plot bleu du 250 m (150 m après la ligne), zones du 1’30 (−15, −5, +5, +15 m), plots plats tous les 10 m. Une feuille de résultats par coach ; les plots de départ du 1’30 attendent au bord de la pelouse.',
  four:'Coureur : donne au professeur son temps projet du 500 m (et le passage au 250 m qui va avec) et sa distance projet du 1’30, justifiés par le carnet. Coach : les recopie sur la feuille, vérifie son chrono. Professeur : rappelle les horaires de départ.',
  deroul:['Horaires, comptés depuis le premier sifflet : C1 à 0’ (vague A) et 6’ (vague B) ; C2 à 12’ et 18’ ; C3 à 24’ et 30’.','Rappel : passage au 250 m annoncé par le coach ; arrivée sur la ligne ; zones du 1’30.','La vague B finit son échauffement pendant le C1 de la vague A : dernière accélération 5 min avant son départ.'],
  cons:['L’écart entre temps projet et temps réalisé du 500 m est noté, comme la zone du 1’30 : le projet compte.'],
  reus:'Tous les projets écrits sur la feuille avant le premier départ.'},
 c1:{t:'C1 · 500 m',k:'Course 1',sch:'d500',
  disp:'Départ debout en face de la ligne (100 m après elle), arrivée sur la ligne : 2 tours et demi. Vague A au sifflet (0’), vague B à 6’. Plot bleu du 250 m à 150 m après la ligne : le coureur y passe à 50 m puis à 250 m.',
  four:'Coureur : court à son projet. Coach : démarre au sifflet, se place sur la pelouse à hauteur du plot bleu, annonce le temps au 2e passage avec l’écart (« 1’04, 2 secondes d’avance »), puis rejoint la ligne pour le temps final ; note les deux temps. Professeur : chronomètre officiel au départ de chaque vague, contrôle quelques temps.',
  deroul:['Écart prévu-réalisé = temps réalisé − temps projet, écrit sur la feuille.','Pouls 15’’ × 4 à l’arrivée ; puis récupération active : 2 min de marche, 3 min de footing très lent, boire, rester debout et couvert.','Le coach donne au coureur son temps et son passage avant la fin de la récupération.'],
  cons:['Passage au 250 m = moitié du temps projet (projet 2’10 → 1’05) ; pas plus de 2 secondes d’avance.','Doubler par l’extérieur, ne pas couper la corde ; après la ligne, continuer en marchant dans le couloir 3.'],
  reus:'Temps à 3 secondes près du projet ; 2e 250 m pas plus lent de 3 secondes que le 1er.'},
 c2:{t:'C2 · 500 m',k:'Course 2',sch:'d500',
  disp:'Même départ, même arrivée. Vague A à 12’, vague B à 18’ (comptés depuis le départ du C1) : environ 10 min de récupération pour chacun.',
  four:'Mêmes rôles. Avant le départ, le coach rappelle au coureur son temps du C1 et son passage au 250 m ; le coureur annonce son projet pour C2, le coach l’écrit.',
  deroul:['Le coureur peut ajuster son projet (+ 2 à 4 secondes si le C1 a été très dur) : il l’annonce avant de partir.','Pouls avant le départ : il doit être redescendu sous 120 ; sinon, marcher encore.','Après la course : même récupération active ; C3 dans 12 min.'],
  cons:['C2 se court fatigué : partir au même passage que C1, pas plus vite pour « rattraper ».'],
  reus:'Temps à 3 secondes près du projet annoncé ; écart C2 − C1 inférieur à 5 secondes.'},
 c3:{t:'C3 · 1’30 avec projet',k:'Course 3',sch:'projet',
  disp:'Vague A à 24’, vague B à 30’. Chacun part de son plot, posé à la distance projet avant la ligne ; tous partent au même sifflet. Le professeur annonce « 45 » et siffle l’arrêt à 1’30.',
  four:'Coureur : annonce son projet définitif et pose son plot 3 min avant le départ. Coach : vérifie le plot en comptant les plots plats, se place au bord de la pelouse au niveau des zones, juge la zone et mesure l’écart. Professeur : sifflets, contrôle des plots de départ.',
  deroul:['Zone 4 : ± 5 m = 4 pts ; zone 3 : +5 à +15 m = 3 ; zone 2 : −5 à −15 m = 2 ; zone 1 : 1 (trop loin) ou 0,5 (trop court).','Distance réalisée = projet + écart ; note de performance au barème.','Après la course : 3 min de marche, pouls, puis retour au calme.'],
  cons:['Projet du C3 = projet prévu, ajusté à la fatigue des deux 500 m (− 5 à − 10 m si C2 a été très dur).','Au « 45 », être à la moitié du projet. Au sifflet : arrêt sur place jusqu’à la lecture du coach.'],
  reus:'Zone 4 ou zone 3.'},
 c100:{t:'Prise d’allure : 3 × 100 m',k:'Allure spécifique',sch:'c100',
  disp:'Départ en face de la ligne (100 m après elle) : virage puis ligne droite, arrivée sur la ligne. 3 × 100 m, 1 min de récupération en marchant vers le départ. Temps visé = temps projet du 500 m ÷ 5 (projet 2’10 → 26’’).',
  four:'Coureur : part au signal de son coach, vise son temps. Coach : sur la pelouse à hauteur de la ligne, lève le bras, le baisse en lançant son chrono (le coureur part à ce signal), annonce le temps et l’écart à l’arrivée.',
  deroul:['Vague A : 3 × 100 m, puis vague B.','Après chaque 100 m : temps, écart et ce qu’on change (« 1 seconde trop vite »).'],
  cons:['On ne sprinte pas : c’est l’allure qu’on tiendra 5 fois (26’’ au 100 m = 13,8 km/h).','Retour au départ en marchant sur la pelouse, jamais dans le couloir 1.'],
  reus:'2 des 3 passages à 1 seconde près.',moins:'2 × 100 m.',plus:'Le 3e sans annonce du coach : le coureur estime son temps.'}
};
const T_RAC={t:'Retour au calme et auto-évaluation',k:'AFL2 · bilan',
  disp:'Toute la classe : 3 min de marche dans les couloirs 3 et 4, puis étirements doux assis sur la pelouse (mollets, cuisses avant et arrière, fessiers : 15 à 20’’ chacun, sans à-coups). Boire.',
  four:'Coureur : remplit la partie bilan du carnet (temps et écarts au projet, zone, pouls, ressenti de 1 à 5, ce qui a marché). Coach : complète la feuille de résultats et écrit un conseil chiffré (« passage au 250 m 2 secondes trop vite », « projet − 5 m »). Professeur : relit et signe 3 ou 4 carnets.',
  deroul:['Pouls 15’’ × 4 au début de la marche, puis au bout de 3 min : il doit être redescendu sous 110.','Bilan : écart prévu-réalisé de chaque course.'],
  cons:['Étirer doucement : ça tire, ça ne fait pas mal. Pas d’étirement forcé juste après un effort intense.','Un conseil utile = un chiffre et une action.'],
  reus:'Carnet complet et pouls sous 110 avant de quitter la piste.'};
const T_RA={t:'Récupération active : 3 min à 70 %',k:'Mode « temps »',sch:'ra',
  disp:'Toute la classe en même temps, répartie autour de la piste. Grands plots jaunes tous les 50 m : en 3 min, grands plots franchis = vitesse en km/h. Cible = 0,7 × VMA (VMA 12 → 8,5 plots ; VMA 15 → 10,5).',
  four:'Coureur et coach courent tous les deux ; chacun compte ses plots et dit son total à l’autre, qui le note. Professeur : sifflet au départ et à la fin, annonce de chaque minute.',
  deroul:['Départ au sifflet, chacun de là où il est ; fin au sifflet de 3 min.','Pouls 15’’ × 4 tout de suite, puis 1 min de marche et boire.'],
  cons:['70 % : je parle encore en faisant des phrases.','Pouls repère à la fin : 140 à 150 ; sous 120 après la minute de marche.','Doubler par l’extérieur ; personne ne s’arrête dans le couloir 1.'],
  reus:'À 1 grand plot de la cible, et pouls sous 120 après la minute de marche.',moins:'2 min de trot, 1 min de marche.',plus:'Annoncer sa cible avant de partir et la toucher à ½ plot près.'};
const T_PROJ={t:'1’30 avec projet de distance',k:'Situation finale · course C3 de l’épreuve',sch:'projet',
  disp:'Plots plats tous les 10 m ; zones d’arrivée (−15, −5, +5, +15 m). Chacun part de son plot, posé à la distance projet avant la ligne ; tous partent au même sifflet. Le professeur annonce « 45 » et siffle à 1’30. Vague A, 3 min de placement, vague B.',
  four:'Coureur : annonce sa distance, place son plot. Coach : vérifie le plot ; au « 45 », regarde si son coureur est en avance ou en retard sur la moitié du projet ; puis juge la zone et note l’écart en mètres. Professeur : sifflets, contrôle des plots.',
  deroul:['Projet ajusté à partir de T5 et de la fatigue du jour (la série de résistance vient d’être courue : − 5 à − 10 m ?). Le binôme décide et écrit pourquoi.','Distance réalisée = projet + écart ; comparer à T5.'],
  cons:['Distance aux 45’’ = moitié du projet.','Comme au C3 de l’épreuve, on court fatigué : partir quand même à l’allure du projet, pas plus vite. Pouls à l’arrivée : 180 et plus.','Au sifflet : arrêt sur place jusqu’à la lecture du coach.'],
  reus:'Zone 4 ou zone 3.',moins:'Zones à ± 10 m.',plus:'Projet + 5 m.'};
const T_SESSIONS=[
 {id:'t1',n:'T1',short:'Relais 5 km',title:'Diagnostic : le 5 km à deux et un 500 m de référence',lv:3,tab:'t1',
  lead:'Retrouver la piste et le binôme, courir longtemps à une allure régulière, puis un premier 500 m pour se situer dans le barème. Échauffement en binôme avec la fiche de Seconde : le professeur repère qui sait déjà s’échauffer seul.',
  tl:[['Échauffement avec fiche',18,'warm'],['Relais 5 km à deux',35,'r5'],['Récupération active',5,'ra'],['500 m de référence',17,'ref'],['Bilan et carnet',15,'bilan']],
  warm:'Rappel des 3 parties et des 3 signes. Fin d’échauffement : 2 accélérations de 80 m.',
  eval:[['afl1','Premier 500 m chronométré : note au barème, point de départ des progrès.'],['afl2','Carnet ouvert dès la 1re séance : distances et temps de chaque relais.'],['afl3','Binômes coureur / coach formés (groupes de vitesse différents), fixes après T3.']],
  ex:{
   r5:{t:'Relais 5 km à deux',k:'Leçon 1 du carnet · régularité',sch:'relais5',
    disp:'Zone de relais : les 10 premiers mètres après la ligne, dans le couloir 3. 25 tours de 200 m (5 km) à deux, en relais ; chacun choisit des relais de 1 à 3 tours. Tous les binômes partent ensemble de la ligne au sifflet ; arrêt au bout de 35 min si les 25 tours ne sont pas finis. Record cadette du 5 km : 17’32 (carnet).',
    four:'Coureur : annonce la longueur de son relais (« 2 tours ») et court dans le couloir 1. Partenaire : attend dans la zone, chronomètre le relais, écrit dans la grille de 7 relais du carnet tours prévus, temps réalisé et temps au tour (temps ÷ tours), puis prend le relais quand on lui tape la main. Professeur : annonce le temps toutes les 5 min.',
    deroul:['Avant le départ, le binôme annonce son temps total visé et le temps au tour qui va avec (35 min pour 25 tours = 1’24 au tour ; 25 min = 1’00).','Le total des tours se lit dans la grille (somme des relais des deux).','Au bout de 35 min, on arrête : la distance réalisée compte (5 km à deux en 35 min = 8,6 km/h de moyenne).','Fin : pouls 15’’ × 4 et ressenti de 1 à 5 dans le carnet.'],
    cons:['Même temps au tour sur tous ses relais : 12 km/h = 1’00 au tour ; 10 km/h = 1’12.','Partir à l’allure des derniers tours, pas plus vite : au premier relais, je parle encore par mots.','Pouls repère pendant les relais : 160 à 175 ; au-dessus de 180, relais plus courts.','Sécurité : attente et passage du relais dans le couloir 3 ; on rentre dans le couloir 1 en regardant derrière ; on double par l’extérieur.'],
    reus:'Temps au tour stable à 3 secondes près sur tous ses relais ; écart au temps visé inférieur à 1 min.',
    moins:'3 km (15 tours).',plus:'Relais de 2 tours imposés, temps au tour annoncé avant chaque relais.'},
   ra:{t:'Récupération active',k:'Marche et footing lent',sch:'ra',
    disp:'2 min de marche puis 3 min de footing très lent dans les couloirs 3 et 4, pendant que le professeur installe le 500 m. Boire.',
    four:'Coureur et partenaire marchent ensemble et finissent la grille du relais (temps au tour moyen). Professeur : pose le plot de départ du 500 m (100 m après la ligne) et le plot bleu du 250 m (150 m après la ligne).',
    deroul:['Pouls 15’’ × 4 à la fin de la marche, puis à la fin du footing.'],
    cons:['Le 500 m se court frais : pouls sous 120 avant de partir, sinon une minute de marche de plus.','On parle en faisant des phrases.'],
    reus:'Pouls sous 120 et grille du relais remplie avant le 500 m.',moins:'5 min de marche.',plus:'Finir par 3 accélérations progressives de 50 m, la dernière à l’allure prévue du 500 m.'},
   ref:{t:'500 m de référence',k:'Situation finale · course C1 sans projet chiffré',sch:'d500',
    disp:'Départ debout en face de la ligne (100 m après elle) : 2 tours et demi, arrivée sur la ligne. Plot bleu du 250 m à 150 m après la ligne : le coureur y passe à 50 m puis à 250 m. Vague A au sifflet, vague B 5 min plus tard.',
    four:'Coureur : court au mieux, sans projet chiffré, mais régulier. Coach : démarre au sifflet, se place sur la pelouse à hauteur du plot bleu, annonce le temps au 2e passage (250 m), puis rejoint la ligne pour le temps final ; note les deux temps et le pouls. Professeur : départs, contrôle de quelques temps.',
    deroul:['Temps du 2e 250 m = temps final − temps au 250 m.','Vitesse en km/h = 1 800 ÷ temps en secondes (2’00 = 120 s → 15 km/h).','Note sur 8 au barème (outil « Évaluation ») : c’est la référence du cycle.','Pouls 15’’ × 4 à l’arrivée, puis 5 min de marche avant de devenir coach.'],
    cons:['La 2e moitié au moins aussi vite que la 1re : le 1er tour ne doit pas « faire plaisir ».','Ressenti 5 et pouls à 180 et plus à l’arrivée : c’est normal sur 500 m.','Doubler par l’extérieur, ne pas couper la corde ; après la ligne, continuer en marchant dans le couloir 3.'],
    reus:'Écart entre les deux 250 m inférieur à 3 secondes.',moins:'Départ par groupes de 4 de même niveau, pour ne pas partir dans le paquet.',plus:'Annoncer son temps estimé avant de partir et noter l’écart, comme à l’épreuve.'}
  },
  bilan:'Carnet : temps au tour moyen, 500 m de référence et sa note sur 8. Première idée de la répartition AFL2 / AFL3 (6/2, 4/4 ou 2/6), à confirmer avant T7.'},

 {id:'t2',n:'T2',short:'VMA',title:'Alterner les allures et trouver sa VMA',lv:3,tab:'vma',
  lead:'Leçon 2 du carnet : des tours de plus en plus rapides pour sentir les allures, puis le test 10 × 36’’/24’’. Les tableaux d’allures du cycle en dépendent.',
  tl:[['Échauffement avec fiche',18,'warm'],['Varier les allures et coacher',18,'tours'],['Test VMA · vague A',14,'testA'],['Test VMA · vague B',14,'testB'],['Récupération active 3’ à 70 %',6,'ra'],['Tableau d’allures et groupes',20,'bilan']],
  warm:'Fin d’échauffement courte : les tours rapides de l’exercice 1 terminent la mise en route.',
  eval:[['afl2','VMA, fréquences cardiaques et ressentis dans le carnet : les données qui servent à planifier la charge.'],['afl3','Annoncer le temps au tour, compter les plots du test.']],
  ex:{
   tours:{t:'Varier les allures : tours de 8 à 14 km/h et plus',k:'Leçon 2 du carnet · coaching',sch:'tours',
    disp:'Départ et passages sur la ligne. Tours enchaînés sans arrêt : 8 km/h (1’30 au tour), 10 (1’12), 12 (1’00), 14 (51’’), puis + 1 km/h par tour (15 : 48’’ ; 16 : 45’’). Vague A, puis vague B. Grands plots jaunes tous les 50 m : chacun = un quart du temps du tour.',
    four:'Coureur : vise le temps du tour. Coach : sur la pelouse à hauteur de la ligne, annonce le temps à chaque passage (« 1’02, accélère de 2 ») ; note le dernier tour tenu, le pouls et le ressenti. Professeur : annonce la vitesse du tour suivant à chaque passage du groupe.',
    deroul:['On s’arrête au premier tour manqué de plus de 3 secondes (le coach dit « stop » au passage).','La dernière vitesse tenue donne une première idée de la VMA.','À l’arrêt : pouls 15’’ × 4 et ressenti de 1 à 5, notés avec la vitesse du dernier tour tenu.','Le coureur arrêté marche dans les couloirs 3 et 4, sans traverser la piste.'],
    cons:['Changer d’allure dès la ligne, pas au milieu du tour. Repère : 12 km/h = 15’’ par grand plot ; 14 km/h = 13’’.','Respiration : à 8 et 10 km/h, je parle par phrases ; à 12, par mots ; au-delà, je ne parle plus.','Coach : annonce chiffrée et courte, jamais seulement « vas-y ».'],
    reus:'4 tours de suite à 2 secondes près du temps visé.',
    moins:'Démarrer à 7 km/h (1’43 au tour).',plus:'Tours à + 0,5 km/h au-delà de 14.'},
   ra:T_RA,testA:LIB.testA,testB:LIB.testB
  },
  bilan:'VMA = total des 10 répétitions ÷ 10. Recopier sa ligne du tableau d’allures. Groupes de vitesse (G1 à G4) ; binômes définitifs avec coureur et coach dans deux groupes différents.'},

 {id:'t3',n:'T3',short:'1er 500',title:'Travail du premier 500 m',lv:4,tab:'t3',
  lead:'Leçon 3 du carnet : des distances qui raccourcissent pendant que l’allure monte, de 90 à 130 % de la VMA, puis l’intermittent 36’’/36’’ au-dessus de la VMA. À partir de T3, échauffement seul et sans fiche.',
  tl:[['Échauffement autonome',15,'warm'],['Varier les allures : 500 à 100 m',38,'desc'],['Récupération active 3’ à 70 %',5,'ra'],['36’’/36’’ à 110 puis 120 %',18,'i36'],['Bilan et carnet',14,'bilan']],
  warm:'Chacun écrit son échauffement dans le carnet après coup ; le professeur observe 5 élèves par séance avec la grille.',
  eval:[['afl1','Allure du premier 500 m : partir à la bonne vitesse, c’est la moitié de la note de C1.'],['afl2','Performances stables : chaque course a un temps prévu et un temps réalisé.'],['afl3','Coach : choix des vitesses, organisation de la récupération, bilan de coaching.']],
  ex:{
   desc:{t:'Varier les allures : 500-400-300-200-100-100',k:'Leçon 3 du carnet · % de VMA',sch:'pyramide',
    disp:'500 m à 90 %, 400 m à 95 %, 300 m à 100 %, 200 m à 110 %, 100 m à 120 %, 100 m à 130 %. Toutes les arrivées sur la ligne. Vague A puis vague B sur chaque distance ; récupérations du carnet (4’, 3’30, 3’, 2’, 2’) : la course de l’autre vague plus le temps qui manque, jusqu’au sifflet du professeur.',
    four:'Coureur : lit son temps prévu. Coach : chronomètre, annonce le passage à mi-course, note temps et pouls, remplit « choix de vitesses », « organisation de la récup », « bilan coaching ». Professeur : départs de chaque vague, annonce du temps de récupération restant.',
    deroul:['Départs : 500 et 300 m en face de la ligne (100 m après elle) ; 400 et 200 m sur la ligne ; 100 m en face de la ligne.','Temps visé (s) = distance (m) × 3,6 ÷ (VMA × %). VMA 12 : 2’47, 2’06, 1’30, 55’’, 25’’, 23’’. VMA 15 : 2’13, 1’41, 1’12, 44’’, 20’’, 18’’.','Après chaque course : temps, écart au prévu, pouls, ressenti.'],
    cons:['Plus c’est court, plus c’est vite : le 100 m à 130 % n’est pas un sprint.','Ressenti : 500 m à 90 %, on parle par mots ; à partir du 200 m, on ne parle plus.','Récupération : marcher ; pouls sous 130 avant de repartir, sinon prévenir son coach.','Sécurité : la vague qui récupère marche dans les couloirs 3 et 4 ou sur la pelouse ; les coachs ne traversent jamais la piste pendant une course.'],
    reus:'5 courses sur 6 à 2 secondes ou moins du temps prévu.',moins:'Intensités à −5 % ; sans le dernier 100 m.',plus:'300 m à 105 %, 200 m à 115 %.'},
   ra:T_RA,
   i36:{t:'36’’/36’’ à 110 % puis 120 %',k:'Leçon 3 du carnet · intermittent',sch:'i3636',
    disp:'Plots plats tous les 10 m depuis la ligne ; départ commun sur la ligne, couloirs 1 et 2. En 36’’, plots franchis = km/h : plot cible = 1,1 × VMA pour les 3 premières répétitions (VMA 12 → 13e plot ; VMA 15 → 16,5e), puis 1,2 × VMA pour les 3 suivantes (VMA 12 → 14,5e ; VMA 15 → 18e). Aller-retour : toute la vague court dans le même sens. Vague A puis vague B.',
    four:'Coureur : arrive à son plot au sifflet, ni avant ni après ; aux retours, il vise la ligne et s’annonce lui-même. Coach : sur la pelouse à hauteur du plot cible, juge les allers (« tôt », « pile », « tard ») et coche. Professeur : sifflets au départ et à la fin des 36’’, « moitié » à 18’’.',
    deroul:['6 × 36’’/36’’ par vague (7 min 12), transition 2 min.','36’’ de récupération : marcher autour de son plot, couloirs 1 et 2, puis s’y replacer pour le retour.','Pouls 15’’ × 4 après la 6e répétition.'],
    cons:['120 % : allure du 1’30 de l’épreuve.','Se caler dans les 10 premiers mètres ; tôt deux fois → je ralentis ; tard deux fois → j’accélère.','Pouls repère en fin de série : 180 et plus ; ressenti 4 sur 5.','Sécurité : on ne se retourne pas avant le sifflet ; celui qui s’arrête sort vers la pelouse.'],
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
    disp:'Coupelles orange tous les 20 m sur toute la piste : en 1’12, coupelles franchies = vitesse en km/h. Cible = 0,8 × VMA (VMA 12 → 9,5 coupelles, 190 m ; VMA 15 → 12 coupelles, 240 m). Coureurs répartis autour de la piste. 4 répétitions par vague : 1’12 de course, 1’12 de récupération en marchant jusqu’à la coupelle suivante, d’où l’on repart.',
    four:'Coureur : part d’une coupelle, compte ses coupelles, s’arrête au sifflet et annonce son chiffre. Coach : au centre de la pelouse, suit son coureur, vérifie le chiffre et note les ressentis souffle, chaleur, muscles (1 à 5). Professeur : sifflets au départ et à la fin de chaque 1’12, « moitié » à 36’’.',
    deroul:['Vague A : 4 × 1’12/1’12 (9 min 36), 2 min de transition, puis vague B.','Au « moitié » (36’’), on doit avoir passé la moitié de son chiffre cible.','Pouls 15’’ × 4 après la 4e répétition.'],
    cons:['80 % : on parle encore par mots ; c’est long, pas dur.','Pouls repère en fin de série : 150 à 170.','Doubler par l’extérieur ; pendant la récupération, marcher sans s’arrêter dans le couloir 1.'],
    reus:'3 répétitions sur 4 à ½ coupelle près (10 m) de la cible.',moins:'75 %.',plus:'6 répétitions.'},
   ra2:{t:'Récupération active : 2’ à 50 %',k:'Mode « temps »',
    disp:'Toute la classe, 2 min : marche rapide ou trot très lent dans les couloirs 3 et 4, pendant que le professeur pose les départs de la pyramide. Boire.',
    four:'Coureur : récupère et relit ses 6 temps visés de la pyramide. Coach : les écrit dans sa grille. Professeur : pose les plots de départ (250, 375, 500 et 125 m).',
    deroul:['Pouls 15’’ × 4 à la fin des 2 min.'],
    cons:['50 % : on parle sans difficulté.','Le pouls doit être redescendu sous 120 avant le premier 250 m.'],
    reus:'Pouls sous 120 et temps visés écrits dans la grille.',moins:'Marche seule.',plus:'Le coureur dit de tête ses 6 temps visés à son coach.'},
   pyr:{t:'Pyramide 250-375-500-375-250-125',k:'Leçon 4 du carnet · % de VMA',sch:'pyrT4',
    disp:'250 m à 95 %, 375 m à 100 %, 500 m à 110 %, 375 m à 115 %, 250 m à 120 %, 125 m à 130 %. Toutes les arrivées sur la ligne. Alternance des vagues ; récupérations du carnet (2’30 à 5’), en ajoutant une minute si besoin.',
    four:'Coureur : lit son temps prévu. Coach : chronomètre depuis le sifflet, annonce le passage à mi-course et l’écart à l’arrivée, note temps et pouls. Professeur : siffle le départ de chaque vague, contrôle les plots de départ.',
    deroul:['Départs : 250 m à 150 m après la ligne, 375 m à 25 m après, 500 m en face (100 m après), 125 m à 75 m après. Pour 375 et 125 m, un seul plot de départ, posé entre deux plots plats.','Temps visés VMA 12 : 1’19, 1’53, 2’16, 1’38, 1’03, 29’’. VMA 15 : 1’03, 1’30, 1’49, 1’18, 50’’, 23’’.','Après chaque course : temps, écart, pouls, ressenti de 1 à 5.'],
    cons:['Le 500 m à 110 % est la course clé : passage au 250 m à la moitié du temps prévu (VMA 12 : 1’08).','Ressenti : à partir du 375 m à 115 %, on ne parle plus (4 sur 5).','Pouls sous 130 avant de repartir.','Sécurité : la vague qui récupère marche dans les couloirs 3 et 4 ; les coachs restent sur la pelouse.'],
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
    disp:'300 m à 110 % de la VMA : départ en face de la ligne (100 m après elle), arrivée sur la ligne. Le professeur siffle un départ toutes les 2’30 en alternant les vagues : chacun repart toutes les 5 min (la course de l’autre vague, puis le temps qui manque).',
    four:'Coureur : même temps visé 6 fois. Coach : chronomètre, annonce le passage au 150 m (moitié du temps), note temps, pouls à l’arrivée et pouls avant de repartir, et remplit « organisation de la récup ». Professeur : sifflet toutes les 2’30.',
    deroul:['A, B, A, B… 6 fois chacun (environ 30 min).','Temps visé = 300 × 3,6 ÷ (1,1 × VMA) : VMA 12 → 1’22 (passage au 150 m en 41’’) ; VMA 15 → 1’05 (33’’).','Après chaque 300 m : temps, écart, deux pouls.'],
    cons:['Le 6e 300 m doit ressembler au 1er : c’est le 2e 500 m de l’épreuve.','Ressenti : 3 sur 5 au 1er, 4 sur 5 au 6e ; si c’est 5 dès le 3e, on est parti trop vite.','Pouls avant de repartir : sous 130.','Sécurité : retour au départ en marchant sur la pelouse ou dans le couloir 4, jamais à contresens dans le couloir 1.'],
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
    disp:'100 m à 100 %, 200 m à 105 %, 250 m à 110 %, 300 m à 120 %, 400 m à 125 % (intensités du carnet). Toutes les arrivées sur la ligne. Récupérations du carnet (2’ à 5’) par alternance des vagues.',
    four:'Coureur : vise son temps. Coach : chronomètre, annonce le passage à mi-course et l’écart à l’arrivée ; note temps, pouls et ressenti. Professeur : départs de chaque vague, signal de fin de récupération.',
    deroul:['A puis B sur chaque distance.','Départs : 100 et 300 m en face de la ligne (100 m après elle) ; 250 m à 150 m après la ligne ; 200 et 400 m sur la ligne.','Temps visés VMA 12 : 30’’, 57’’, 1’08, 1’15, 1’36. VMA 15 : 24’’, 46’’, 55’’, 1’00, 1’17.'],
    cons:['Les jambes brûlent sur le 300 et le 400 m : c’est le but. On garde sa foulée ; si on « s’assoit », on le note, c’est le point à travailler.','Pouls sous 130 avant de repartir ; la vague qui récupère reste hors du couloir 1.','Note pour le professeur : le 500 m à 130 % du carnet est retiré (6e effort de la série, et le temps manque). Les documents de collègues placent l’allure du 3 × 500 m entre 107 et 130 % de la VMA selon le niveau ; mais ici la VMA vient d’un test intermittent, qui la surestime : 125 % de cette VMA est déjà très haut. Si plus de la moitié de la classe rate le 300 m, passer à la variable « − ».'],
    reus:'4 courses sur 5 à 2 secondes près ; le 400 m tenu jusqu’au bout.',moins:'300 m et 400 m à 115 %.',plus:'500 m à 130 % en fin de séance (carnet) pour les G4.'},
   retest:{t:'Re-test VMA court : paliers de 36’’/24’’',k:'2e mesure de VMA · mise à jour des cibles',sch:'test',
    disp:'Mêmes plots plats tous les 10 m qu’en T2, mais en paliers : chaque minute, 36’’ de course et 24’’ de marche, et la cible monte d’un plot (1 km/h). Premier palier = VMA de T2 moins 2 km/h : 3 à 6 paliers seulement. Vague A puis vague B.',
    four:'Coureur : part d’un plot plat, doit franchir le nombre de plots du palier (palier 13 = 13 plots) avant le sifflet ; marche 24’’ et repart du plot suivant. Coach : au centre de la pelouse, vérifie et note le dernier palier tenu. Professeur : sifflets, annonce du palier (« palier 14 »).',
    deroul:['Arrêt au premier palier manqué de plus d’un plot.','Vague A (5 min), vague B (5 min).','Nouvelle VMA = dernier palier tenu. Un test en paliers donne un chiffre un peu plus haut que la moyenne du test de T2 : si l’écart dépasse 1 km/h, retenir la VMA de T2 + 1.','Chacun met à jour la colonne « Mise à jour T6 » de ses cibles (page 2 du carnet).'],
    cons:['Nancy-Metz impose au moins deux tests de VMA dans la séquence et retient le meilleur. Ici, il sert surtout à recaler les allures de T7 et T9.','Le dernier palier est à fond : pouls 180 et plus, ressenti 5. Au sifflet, ralentir en 2 pas, rester dans son couloir.'],
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
    disp:'Fiche du carnet et tableau d’allures. Trois thèmes : 1er 500 m, 2e 500 m, 1’30. Choix parmi la banque de situations ou les leçons du carnet (6’ au plot pour la puissance, 36’’/36’’ pour la capacité). Binômes assis sur la pelouse.',
    four:'Coureur : écrit thème, exercice, distance ou durée, intensité, récupération, nombre de répétitions, temps ou distances visés. Coach : vérifie la cohérence avec le carnet. Professeur : valide en passant de binôme en binôme.',
    deroul:['Ordre d’écriture : problème vu en T7 → thème → exercice → intensité (% de VMA) → distance ou durée → répétitions → récupération → cibles chiffrées (tableau d’allures).','Volume total d’effort rapide entre 1 000 et 1 800 m.','Exemple, thème « 2e 500 m » : 4 × 250 m à 110 %, 1’ de récupération ; VMA 13 → 250 m en 1’03.'],
    cons:['La séance répond à un problème vu en T7 : écrire lequel.','Changer un paramètre à la fois : si l’intensité monte, la récupération ne raccourcit pas en même temps.'],
    reus:'Séance écrite, chiffrée et validée.',
    moins:'Le binôme part d’une des 3 séances types du carnet (puissance, capacité, allure spécifique) et n’adapte que les chiffres à sa VMA.',plus:'Chaque paramètre (intensité, durée, récupération) est justifié par le point faible relevé sur le 500 m ; volume vers 1 800 m.'},
   mine:{t:'Réaliser sa séance',k:'AFL2 · séance du binôme',sch:'piste',
    disp:'Les binômes travaillent en même temps, chacun sur sa séance. Piste partagée : couloir 1 pour les courses longues et les intermittents ; les fractions partent et finissent sur la ligne ; les coachs restent sur la pelouse.',
    four:'Coureur : réalise sa séance. Coach : chronomètre et note, puis on inverse (ou les deux courent en alternance dans la même séance). Professeur : passe de binôme en binôme, vérifie qu’on fait ce qui est écrit.',
    deroul:['Exemples : 6’ au plot à 95 % (puissance) ; 2 × 6 × 36’’/36’’ à 110 % (capacité) ; 4 × 250 m à l’allure du 500 m, 1’ de récupération (allure spécifique).','Après chaque répétition : réalisé, pouls et ressenti, notés à côté du prévu.'],
    cons:['Respecter les récupérations écrites : c’est un paramètre de la charge.','Ressenti attendu : allure spécifique 4 sur 5 ; puissance (6’ à 95 %) 3 à 4 sur 5.','Sécurité : regarder derrière avant de partir ; doubler par l’extérieur ; personne ne s’arrête dans le couloir 1.'],
    reus:'Séance réalisée telle qu’écrite ; écart prévu-réalisé noté.',
    moins:'Récupérations allongées de 30 s ; volume vers 1 000 m.',plus:'Récupérations raccourcies (36’’/24’’ au lieu de 36’’/36’’) ; volume vers 1 800 m.'},
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

/* Variables « plus facile / plus difficile » des situations qui n’en avaient pas (fixe = pas de variable, volontairement). */
(function(){const V={"t1#ra": {"fixe": "Récupération : l’intensité reste basse pour tout le monde."}, "t2#ra": {"fixe": "Récupération : l’intensité reste basse pour tout le monde."}, "t4#ra2": {"fixe": "Récupération : l’intensité reste basse pour tout le monde."}, "s2#ra": {"fixe": "Récupération : l’intensité reste basse pour tout le monde."}, "t1#ref": {"fixe": "Situation de référence : mêmes conditions pour tous, pour comparer en fin de cycle."}, "t2#testB": {"fixe": "Test de VMA : protocole identique pour tous, sinon la VMA est fausse."}, "t7#inst": {"fixe": "Temps d’organisation."}, "s1#acc": {"fixe": "Temps d’organisation."}, "s6#inst": {"fixe": "Temps d’organisation."}, "t7#c1": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "t7#c2": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "t7#c3": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "s6#e1": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "s6#e2": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "t7#rac": {"fixe": "Bilan : même travail pour tous."}, "s6#rac": {"fixe": "Bilan : même travail pour tous."}, "t8#constr": {"moins": "Le binôme part d’une des 3 séances types du carnet (puissance, capacité, allure spécifique) et n’adapte que les chiffres à sa VMA.", "plus": "Chaque paramètre (intensité, durée, récupération) est justifié par le point faible relevé sur le 500 m ; volume vers 1 800 m."}, "t8#mine": {"moins": "Récupérations allongées de 30 s ; volume vers 1 000 m.", "plus": "Récupérations raccourcies (36’’/24’’ au lieu de 36’’/36’’) ; volume vers 1 800 m."}, "s7#choix": {"moins": "Une répétition de moins par atelier, récupération allongée d’1 min ; le coach annonce chaque passage.", "plus": "Le coureur annonce son temps de passage avant que le coach le donne ; une répétition de plus."}};
[SESSIONS,T_SESSIONS].forEach(L=>L.forEach(s=>{if(!s||!s.ex)return;Object.keys(V).forEach(k=>{const [sid,i]=k.split('#');if(sid!==s.id)return;const e=Array.isArray(s.ex)?s.ex[+i]:s.ex[i];if(!e||e.moins||e.plus||e.fixe)return;Object.assign(e,V[k]);});}));})();

/* ================== Échauffement en 5 parties (copie des données de l'appli élève demi-fond-eleves, img/echauffement/) ================== */
const DF_WARM=[
 [['f','Footing de plus en plus vite (60 → 70 %)'],['tf','Talons-fesses'],['mg','Montées de genoux'],['pc','Pas chassés'],['sg1','✓ J’ai chaud, je transpire'],['sg2','✓ Je respire vite, je parle encore'],['sg3','✓ Pouls 150-160 (15" × 4)']],
 [['ch','1 · Chevilles'],['ge','2 · Genoux et hanches'],['tr','3 · Tronc'],['ep','4 · Épaules'],['pg','5 · Poignets'],['nu','6 · Nuque (demi-cercles)']],
 [['e1','Mollets'],['e2','Ischio-jambiers'],['e3','Quadriceps'],['e4','Fléchisseurs de hanche']],
 [['sq','Squats'],['fe','Fentes'],['po','Montées sur pointes'],['ga','Gainage face'],['gl','Gainage latéral'],['pm','Pompes (genoux au sol possible)']],
 [],
 [['ac','3 accélérations progressives (60-80 m)'],['al','1 passage à l’allure du jour, au plot']]];
/* 4 étirements actifs-dynamiques : allonger puis contracter sans bouger 4 s, freiner en contractant 4 s, relâcher, 8 s de mouvement. Chaque côté. */
const DF_ETIR=[
 ['e1','Mollets','etir-mollets.jpg','Fente avant, jambe arrière tendue, talon au sol : pousse l’avant du pied arrière dans le sol.','Fléchis doucement le genou arrière, talon toujours au sol.','Petits sauts pieds joints sur l’avant du pied.'],
 ['e2','Ischio-jambiers','etir-ischios.jpg','Jambe avant tendue, talon au sol, pointe relevée : enfonce le talon dans le sol.','Penche le buste vers le genou en appuyant toujours.','Talons-fesses rapides.'],
 ['e3','Quadriceps','etir-quadriceps.jpg','Debout, tiens ta cheville, bassin basculé vers l’arrière : pousse le pied contre la main.','Rapproche le pied de la fesse en poussant toujours.','Fentes avant-arrière sautées.'],
 ['e4','Fléchisseurs de hanche','etir-hanche.jpg','Grande fente, genou arrière près du sol, bassin vers l’avant : tire le genou arrière vers l’avant sans le bouger.','Descends un peu le bassin en tirant toujours.','Montées de genoux.']];
/* Catalogue de gammes : l'élève en choisit 4 (20 à 30 m, retour en trottinant). */
const DF_GAMMES=[
 ['g1','Talons-fesses','gamme-talons-fesses.jpg','Buste droit, talons ramenés sous les fesses.','Le talon touche presque la fesse, le genou reste vers le bas.'],
 ['g2','Montées de genoux','gamme-montees-genoux.jpg','Cuisse à l’horizontale, bras actifs.','Je reste grand, je ne me penche pas en arrière.'],
 ['g3','Skipping bas','gamme-skipping-bas.jpg','Petits pas très rapides sur l’avant du pied.','Fréquence élevée, talons jamais au sol.'],
 ['g4','Foulées griffées (« le cheval »)','gamme-griffe.jpg','Genou haut, la jambe se déplie puis griffe le sol vers l’arrière.','Le pied se pose sous le bassin, sur l’avant du pied.'],
 ['g5','Foulées bondissantes','gamme-bondissantes.jpg','Sauter loin d’un pied sur l’autre.','Cheville, genou et hanche tendus à chaque poussée.'],
 ['g6','Course sur la plante des pieds','gamme-plante-pieds.jpg','Courir en ressort sans poser le talon.','Rebond souple, pas de bruit au sol.'],
 ['g7','Mise en tension du pied','gamme-tension-pied.jpg','Jambes presque tendues, seule la cheville travaille, pointe relevée.','Pose active de l’avant du pied.'],
 ['g8','Enjamber le bâtonnet','gamme-batonnet.jpg','À chaque pas, le pied passe au-dessus de la cheville opposée.','Cycle de jambe complet et régulier.'],
 ['g9','Jambes tendues','gamme-jambes-tendues.jpg','Jambes raides lancées vers l’avant, pose sous le bassin.','Bassin haut, pas de recul du buste.'],
 ['g10','Pas chassés','gamme-pas-chasses.jpg','De côté, les pieds ne se croisent jamais.','Bassin de face, appuis légers.'],
 ['g11','Pas croisés','gamme-pas-croises.jpg','De côté, le pied passe devant puis derrière.','Les épaules restent de face, les hanches tournent.'],
 ['g12','Course arrière','gamme-course-arriere.jpg','Courir à reculons sur l’avant du pied.','Regard par-dessus l’épaule, trajectoire droite.'],
 ['g13','Skipping marché','gamme-skipping-marche.jpg','En marchant, monte le genou, pose le pied activement sous toi.','Jambe d’appui toujours tendue.'],
 ['g14','Montée de genou puis extension','gamme-genou-extension.jpg','Monte le genou, déplie la jambe, griffe le sol.','Enchaînement fluide, sans à-coups.'],
 ['g15','Rebonds pieds joints','gamme-rebonds.jpg','Petits sauts réactifs, chevilles toniques.','Temps de contact très court.'],
 ['g16','Pas sautillés','gamme-pas-sautilles.jpg','Sautille d’un pied sur l’autre, genou opposé qui monte, bras en opposition.','Rythme régulier, buste droit.'],
 ['g17','Montées de genoux latérales','gamme-genoux-lateral.jpg','De côté, monte le genou à chaque pas.','Bassin de face, pieds qui ne se croisent pas.'],
 ['g18','Cloche-pied alterné','gamme-cloche-pied.jpg','3 bonds sur un pied, 3 sur l’autre, en avançant.','Réception sur l’avant du pied, bassin stable.'],
 ['g19','Fentes marchées','gamme-fentes-marchees.jpg','Grand pas, genou arrière proche du sol, et on enchaîne.','Genou avant au-dessus de la cheville, buste droit.'],
 ['g20','Balancés de jambe en marchant','gamme-balances.jpg','Lance la jambe tendue devant, main opposée vers le pied.','Jambe d’appui tendue, mouvement contrôlé.'],
 ['g21','Course au ralenti','gamme-ralenti.jpg','Cours très lentement en décomposant chaque phase : genou qui monte, jambe qui se déplie, pied qui se pose sous le bassin.','Mouvement complet et contrôlé, buste droit.'],
 ['g22','Coordination bras-jambes','gamme-coordination.jpg','Cours en insistant sur les bras : bras opposé à la jambe qui monte, coudes à 90°, mains des hanches au menton.','Les bras rythment la foulée, les épaules restent basses.'],
 ['g23','Rythme de foulée (cibles au sol)','gamme-rythme-foulee.jpg','Cerceaux ou coupelles à espacement régulier : un appui dans chaque cible, sans changer de rythme.','Appuis dans les cibles, foulée régulière, regard devant.']];
DF_WARM[4]=DF_GAMMES.map(g=>[g[0],g[1]]);
