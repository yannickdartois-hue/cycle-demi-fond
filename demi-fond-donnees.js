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
  texts:[{x:PIN.x,y:PIN.y-4,t:'3 min à 70 % : grands plots jaunes',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'plots franchis en 3’ = km/h',cls:'w'}],
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
  texts:[{x:PIN.x,y:PIN.y-4,t:'1 tour + 50 m',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'arrivée sur la ligne',cls:'w'}],
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
  runners:[{s:20,l:'A'},{s:250,l:'A'},{s:80,l:'B',team:'n',off:-6}],runs:[{a:22,b:246}],
  segs:[{a:20,b:248,cls:'blue'}],
  texts:[{x:PIN.x,y:PIN.y-16,t:'VMA 12 à 95 % : 11,5 coupelles',cls:'w'},{x:PIN.x,y:PIN.y+2,t:'1’12 de marche, puis on repart',cls:'w'},{x:PIN.x,y:PIN.y+20,t:'de la coupelle où l’on s’est arrêté',cls:'w'}],
  cap:'Coupelles orange tous les 20 m. En 1’12, coupelles franchies = vitesse en km/h. Le coureur part d’une coupelle, compte, s’arrête au sifflet et annonce son chiffre ; il récupère 1’12 en marchant et repart de la coupelle suivante. Le coach, au centre, vérifie le chiffre.'},
 pyrT4:{alt:'Départs de la pyramide 250-375-500-375-250-125',plots:'50',
  cones:[{s:150,t:'250 m',cls:'o',toff:10.5},{s:25,t:'375 m',cls:'o',toff:10.5},{s:100,t:'500 m',cls:'o',toff:-7},{s:75,t:'125 m',cls:'o',toff:10.5}],
  runners:[{s:104,l:'A'},{s:190,l:'B',team:'n',off:-6}],runs:[{a:107,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'départ = distance avant la ligne',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'toutes les arrivées sur la ligne',cls:'w'}],
  cap:'Chaque distance part d’un plot placé à cette distance avant la ligne : 125 m à 75 m après la ligne, 250 m à 150 m après, 375 m à 25 m après, 500 m en face (100 m après), 125 m à 75 m après. Le coach chronomètre depuis la pelouse, à hauteur de la ligne.'},
 pyrT6:{alt:'Départs de la série 100-200-250-300 m',plots:'50',
  cones:[{s:100,t:'100 m · 300 m',cls:'o',toff:10.5},{s:150,t:'250 m',cls:'o',toff:10.5},{s:0,t:'',cls:'o'}],
  runners:[{s:112,l:'A'},{s:190,l:'B',team:'n',off:-6}],runs:[{a:107,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'200 m : départ sur la ligne',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'toutes les arrivées sur la ligne',cls:'w'}],
  cap:'100 m et 300 m partent en face de la ligne (100 m après elle), 250 m à 150 m après la ligne, 200 m de la ligne. Le coach annonce le passage à mi-course et l’écart à l’arrivée.'}
});
SCH.d125={alt:'125 m à l’allure du 1’30',plots:'10',
  cones:[{s:75,t:'départ 125 m',cls:'o',toff:10.5}],runners:[{s:78,l:'A'},{s:192,l:'B',team:'n',off:-6}],runs:[{a:80,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'départ : 75 m après la ligne',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'retour au départ par la pelouse',cls:'w'}],
  cap:'Le plot de départ est 125 m avant la ligne (75 m après elle). Le coach, sur la pelouse à hauteur de la ligne, baisse le bras en lançant son chrono : c’est le départ. Arrivée sur la ligne, retour au plot en trottinant par la pelouse.'};
SCH.d400={alt:'400 m puis 200 m : départs et arrivées sur la ligne',plots:'50',
  cones:[{s:0,t:'',cls:'o'},{s:100,t:'mi-course du 200 m',toff:10.5}],runners:[{s:4,l:'A'},{s:190,l:'B',team:'n',off:-6}],runs:[{a:6,b:194}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'400 m = 2 tours · 200 m = 1 tour',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'départs et arrivées sur la ligne',cls:'w'}],
  cap:'Départ et arrivée sur la ligne. Le coach, sur la pelouse à hauteur de la ligne, annonce le passage au 200 m du 400 m (moitié du temps visé) et l’écart à l’arrivée.'};
SCH.d400s={alt:'400 m : départ et arrivée sur la ligne',plots:'50',
  cones:[{s:0,t:'',cls:'o'}],runners:[{s:4,l:'A'},{s:190,l:'B',team:'n',off:-6}],runs:[{a:6,b:194}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'400 m = 2 tours',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'au 1er tour : moitié du temps visé',cls:'w'}],
  cap:'Départ et arrivée sur la ligne. Le coach, sur la pelouse à hauteur de la ligne, annonce le temps au passage du 1er tour (200 m) et l’écart à l’arrivée.'};
SCH.d300={alt:'300 m : départ en face de la ligne',plots:'50',
  cones:[{s:100,t:'départ 300 m',cls:'o',toff:-7},{s:50,t:'150 m',toff:10.5}],runners:[{s:104,l:'A'},{s:190,l:'B',team:'n',off:-6}],runs:[{a:107,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'300 m = un tour et demi',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'arrivée sur la ligne',cls:'w'}],
  cap:'Départ en face de la ligne (100 m après elle), arrivée sur la ligne. Le coach, sur la pelouse à hauteur de la ligne, annonce le temps quand son coureur passe le grand plot jaune du 150 m (50 m après la ligne).'};
SCH.d300200={alt:'300 m puis 200 m',plots:'50',
  cones:[{s:100,t:'départ 300 m',cls:'o',toff:-7},{s:0,t:'',cls:'o'}],runners:[{s:104,l:'A'},{s:190,l:'B',team:'n',off:-6}],runs:[{a:107,b:196}],
  texts:[{x:PIN.x,y:PIN.y-4,t:'300 m : en face de la ligne',cls:'w'},{x:PIN.x,y:PIN.y+14,t:'200 m : départ sur la ligne, 1 min après',cls:'w'}],
  cap:'Le 300 m part en face de la ligne (100 m après elle) et finit sur la ligne ; 1 min plus tard, le 200 m part de la ligne et y revient. Le coach reste sur la pelouse à hauteur de la ligne.'};
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
  disp:'Toute la classe en même temps, répartie autour de la piste. Grands plots jaunes tous les 50 m : en 3 min, grands plots franchis = vitesse en km/h. Cible = 70 % de la VMA estimée (VMA de travail × 0,86) : VMA de travail 10 → 6 plots ; 12 → 7 ; 14 → 8,5.',
  four:'Coureur et coach courent tous les deux (c’est la récupération de tout le monde) ; chacun compte ses plots sur les doigts et dit son total à l’autre, qui le note. Professeur : sifflet au départ et à la fin, annonce de chaque minute.',
  deroul:['Départ au sifflet, chacun de là où il est.','Fin au sifflet de 3 min : on s’arrête, on compte ses grands plots (½ plot si on a passé la moitié du chemin vers le suivant).','Pouls 15’’ × 4 tout de suite, puis 1 min de marche et boire.'],
  cons:['70 % : je parle encore en faisant des phrases. Si je ne peux dire que des mots, je ralentis.','Pouls repère à la fin : 140 à 150 ; il doit redescendre sous 120 après la minute de marche.','Doubler par l’extérieur ; personne ne s’arrête dans le couloir 1.'],
  reus:'À 1 grand plot de la cible, et pouls sous 120 après la minute de marche.',moins:'2 min de trot, 1 min de marche.',plus:'Annoncer sa cible avant de partir et la toucher à ½ plot près.'};
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
 {id:'s1',n:'S1',short:'Allures, VMA',title:'Challenges du binôme – ma VMA',lv:1,tab:'ref1',
  lead:'Séance d’entrée en challenges : le binôme se forme et marque des points ensemble sur deux défis (annonce juste, contrat tenu), classement du jour en fin de séance. On apprend les 3 parties de l’échauffement et on découvre quatre allures sur 3 min ; la 4e, le 3’ rapide, donne une VMA de travail provisoire (grands plots jaunes franchis = km/h), remesurée en S2. Pour finir, 6 min de course continue : les anneaux.',
  tl:[['Accueil, règles et binômes',5,'acc'],['Échauffement guidé',22,'warm'],['Les 4 allures sur 3’',18,'allures4'],['Le relais du binôme',20,'relais'],['Les anneaux : 6’ en continu',15,'ann'],['Ma VMA de travail et carnet',10,'bilan']],
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
    reus:'2e manche : écart entre tours annoncés et réalisés d’un tour au plus ; temps au tour stables à 3 secondes près.',moins:'Relais à mi-piste (100 m) : le partenaire attend au grand plot jaune du 100 m, couloir 3.',plus:'Un tour sur deux à l’allure du 3’ rapide, annoncé avant.'},
   ann:{t:'Les anneaux : 6’ de course continue',k:'Courir longtemps à allure régulière',sch:'anneaux',
    disp:'Coupelles orange tous les 20 m autour de la piste. 6 min de course continue, sans marcher, à une allure tenue du début à la fin. Vague A, puis vague B. Départ au sifflet, chacun de là où il est ; arrêt au sifflet de 6’.',
    four:'Coureur : court à l’allure qu’il peut tenir 6 min en parlant par mots. Coach : au centre de la pelouse, compte les coupelles franchies par son coureur (un trait par tranche de 5) et note le total à chaque minute. Professeur : sifflets, annonce de chaque minute.',
    deroul:['Distance = coupelles × 20 m ; vitesse en km/h = distance ÷ 100 (50 coupelles = 1 000 m = 10 km/h).','Régularité : même nombre de coupelles chaque minute, à 1 près.','Pouls 15’’ × 4 à l’arrêt ; ressenti de 1 à 5 dans le carnet.'],
    cons:['Allure de footing rapide : je parle par mots, jamais à bout de souffle.','Pouls repère à l’arrêt : 150 à 170.','Doubler par l’extérieur ; personne ne s’arrête dans le couloir 1.'],
    reus:'6 minutes sans marcher ; même nombre de coupelles chaque minute, à 1 près.',moins:'4 min.',plus:'Annoncer avant le départ le nombre de coupelles visé.'}
  },
  bilan:'Classement du jour des binômes (points des deux challenges). VMA de travail provisoire = grands plots jaunes franchis pendant le 3’ rapide (au demi-plot près) ; elle est remesurée en S2. Chacun recopie sa ligne du tableau « Mes cibles » dans le carnet. Groupes de vitesse (G1 moins de 10 km/h, G2 10 à 11,5, G3 12 à 13,5, G4 14 et plus) ; coureur et coach dans deux groupes différents. Retour au calme : marche, étirements doux.'},

 {id:'s2',n:'S2',short:'3’, 1’30, 400 m',title:'Ma vitesse sur 3’, mon 1’30 et des 400 m réguliers',lv:1,tab:'cour',
  lead:'Deux mesures : le 3’ à fond, qui donne la VMA de travail du cycle, et le 1’30 mesuré, qui donne la distance du premier projet. Puis 4 × 400 m réguliers pour apprendre à courir au temps. Échauffement guidé, mais ce sont les élèves qui annoncent l’étape suivante.',
  tl:[['Échauffement guidé',22,'warm'],['Test : 3’ à fond',12,'t3m'],['Récupération active',6,'ra'],['Le 1’30 mesuré',14,'p130'],['4 × 400 m réguliers',24,'r400'],['Bilan et carnet',12,'bilan']],
  warm:'Les élèves annoncent la partie suivante et vérifient les 3 signes. Fin d’échauffement : 2 accélérations de 60 m.',
  eval:[['afl1','Le 3’ à fond donne la VMA de travail et une première distance de C1 ; le 1’30 mesuré, la distance du premier projet.'],['afl3','Le coach compte les tours, relève les plots et annonce les temps au 200 m.']],
  ex:{t3m:{t:'Test : 3’ à fond',k:'VMA de travail du cycle',sch:'s3min',
    disp:'Grands plots jaunes (50 m) et plots plats (10 m). Départ groupé sur la ligne au sifflet ; arrêt au sifflet de 3’ ; le professeur annonce le temps toutes les 30’’. Vague A, puis vague B 4 min plus tard. La plus grande distance possible en 3 min, sans s’arrêter.',
    four:'Coureur : court le plus loin possible en restant régulier, s’arrête sur place au sifflet. Coach : au centre de la pelouse, compte les tours ; au sifflet, rejoint son coureur et relève le plot plat d’arrêt. Professeur : sifflets, annonce du temps.',
    deroul:['Distance = tours × 200 m + plot d’arrêt.','Vitesse sur 3’ = distance ÷ 50 (600 m = 12 km/h) : c’est la VMA de travail du cycle, elle remplace celle de S1. Les cibles de S3 à S6 en dépendent.','VMA estimée = vitesse sur 3’ × 0,86 : elle sert aux allures lentes (récupération active, 400 m de fin de séance).','Pouls 15’’ × 4 à l’arrêt, puis 3 min de marche.'],
    cons:['Partir à l’allure de la fin : le premier tour ne doit pas être le plus rapide.','Ressenti 5 à l’arrivée, pouls 180 et plus : c’est un test.','Au sifflet : arrêt sur place jusqu’à la lecture du coach ; doubler par l’extérieur.'],
    reus:'3 min sans marcher ; distance relevée à 10 m près et écrite dans le carnet.',moins:'Le coach annonce le temps de chaque tour.',plus:'Annoncer sa distance avant le départ et noter l’écart.'},
   ra:S_RA,
   p130:{t:'Le 1’30 mesuré',k:'Fil rouge 2 · mesurer sa distance',sch:'p130',
    disp:'Plots plats tous les 10 m et grands plots jaunes tous les 50 m. Départ groupé sur la ligne au sifflet ; le professeur annonce « 45 » à la mi-course et siffle l’arrêt à 1’30. Vague A, puis vague B 5 min plus tard.',
    four:'Coureur : court 1’30 à l’allure qu’il pourrait tenir encore une fois, s’arrête sur place au sifflet. Coach : au centre de la pelouse, compte les tours ; au « 45 », repère le plot plat où passe son coureur ; au sifflet, rejoint son coureur et relève le plot d’arrêt. Professeur : sifflets, annonce du temps à 30’’, 45’’, 1’ et 1’15.',
    deroul:['Cible : 105 % de la VMA de travail, soit VMA × 25 × 1,05 (VMA 10 → 265 m ; VMA 12 → 315 m ; VMA 14 → 370 m).','Distance = tours × 200 m + position du plot d’arrêt ; vitesse en km/h = distance ÷ 25 (325 m = 13 km/h).','1re moitié = distance au « 45 » ; 2e moitié = distance totale − 1re moitié.','Pouls 15’’ × 4 à l’arrêt ; ressenti de 1 (facile) à 5 (à bloc) dans le carnet.'],
    cons:['La 2e moitié au moins aussi longue que la 1re : partir à 105 %, pas plus vite.','Je ne parle plus, mais je peux encore accélérer dans les 15 dernières secondes. Pouls repère : 170 à 190 ; ressenti 4 sur 5.','Au sifflet : arrêt sur place, puis sortie vers la pelouse ; les autres doublent par l’extérieur.'],
    reus:'2e moitié ≥ 1re moitié, et distance à 10 m près de la cible.',moins:'Cible à 100 %.',plus:'Cible à 110 % sans regarder les plots.'},
   r400:{t:'4 × 400 m réguliers, en alternance',k:'Courir au temps · allure lente',sch:'d400s',
    disp:'Départ et arrivée sur la ligne (2 tours). 4 × 400 m chacun à 85 % de la VMA estimée (environ 73 % de la VMA de travail) ; la récupération est le 400 m du partenaire. Temps visé : VMA de travail 10 → 3’17 ; 12 → 2’44 ; 14 → 2’21.',
    four:'Coureur : vise le même temps sur les 4. Coach : sur la pelouse à hauteur de la ligne, donne le départ, annonce le temps au 200 m avec l’écart à la moitié du temps visé, puis l’écart à l’arrivée ; note. Puis on échange les rôles.',
    deroul:['A, B, A, B… 4 fois chacun (environ 22 min).','Au 200 m : « 1’24, 2 secondes de retard ».','Après chaque 400 m : temps et écart dans le carnet.'],
    cons:['Allure de footing : je parle par phrases. On ne finit pas au sprint.','Repère : à 12 de VMA de travail, 41’’ par 100 m, un grand plot jaune toutes les 20’’ environ.','Sécurité : on part quand le couloir 1 est libre derrière ; le coach reste sur la pelouse.'],
    reus:'Les 4 temps à 2 secondes près du temps visé.',moins:'3 × 400 m.',plus:'Le dernier sans annonce au 200 m.'}
  },
  bilan:'Carnet : distance du 3’ et VMA de travail, distance du 1’30 et sa note repère (barème de Seconde), temps des 4 × 400 m. Premier projet pour S3 : distance du 1’30 mesuré, ± 10 m selon le ressenti.'},

 {id:'s3',n:'S3',short:'Premier projet',title:'Le 3’ au plot et le premier projet',lv:2,tab:'cour',
  lead:'D’abord sentir l’allure du 1’30 sur 12 × 125 m. Puis les deux courses de l’épreuve, chacune seule : le 3’ avec mi-course marquée pour apprendre la régularité, et le premier 1’30 avec plot de départ et zones d’arrivée. Échauffement semi-guidé : le binôme suit la fiche, le professeur ne donne que les tops.',
  tl:[['Échauffement semi-guidé',20,'warm'],['12 × 125 m à l’allure du 1’30',22,'r125'],['Le 3’ au plot',16,'c3'],['1’30 avec projet',18,'proj'],['Bilan et carnet',14,'bilan']],
  warm:'Fin d’échauffement : 2 accélérations de 60 m à l’allure du 1’30.',
  eval:[['afl1','Les deux courses de l’épreuve sont là : distance du 3’, zone du 1’30.'],['afl2','Projet construit à partir d’une mesure (S2), pas au hasard.'],['afl3','Le coach marque la mi-course du 3’ et juge la zone du 1’30.']],
  ex:{r125:{t:'12 × 125 m à l’allure du 1’30',k:'Fil rouge 1 · courir au temps',sch:'d125',
    disp:'Départ au plot orange 125 m avant la ligne (75 m après elle), arrivée sur la ligne. Allure du 1’30 : 108 % de la VMA de travail. Temps visé = 125 × 3,6 ÷ (1,08 × VMA) : VMA 10 → 42’’ ; VMA 12 → 35’’ ; VMA 14 → 30’’. 12 répétitions chacun, en alternance dans le binôme.',
    four:'Coureur : annonce son temps avant chaque 125 m, part au signal de son coach, écoute l’écart. Coach : sur la pelouse à hauteur de la ligne, lève le bras puis le baisse en lançant son chrono (c’est le départ), annonce le temps et l’écart, coche dans le carnet. Celui qui vient d’arriver devient coach ; l’autre est déjà au départ. Professeur : circule, vérifie quelques temps et les départs.',
    deroul:['Avant le 1er : temps visé lu dans le tableau et écrit dans le carnet.','Après chaque 125 m : retour au plot de départ en trottinant par la pelouse (environ 1’15) pendant que le partenaire court.','Après chaque passage : temps, écart, et ce qu’on change (« 1 seconde trop vite »).','Après le 12e : pouls 15’’ × 4 et ressenti de 1 à 5.'],
    cons:['Allure du 1’30, pas un sprint : je dois pouvoir la tenir 1’30.','Les 20 premiers mètres décident du temps : se lancer tout de suite à l’allure.','Ressenti : 3 sur 5 ; on ne parle plus mais on récupère pendant le retour. Pouls sous 140 avant de repartir.','Sécurité : retour par la pelouse, jamais dans le couloir 1 ; on ne part qu’au signal de son coach.'],
    reus:'9 répétitions sur 12 à 2 secondes près du temps annoncé.',moins:'8 répétitions ; temps visé à 100 % de la VMA.',plus:'Les 4 dernières sans annonce du coach : le coureur estime son temps avant de l’entendre.'},
   c3:S_3MIN(),proj:S_PROJ({avant:['Projet = distance du 1’30 mesuré en S2, ± 10 m selon le ressenti.','Au moins 8 min après le 3’ : vague A, 3 min de placement, vague B.']})},
  bilan:'Carnet : distance du 3’ et régularité (2e moitié − 1re), zone du 1’30 et écart en mètres. Retour au calme : marche et étirements doux.'},

 {id:'s4',n:'S4',short:'1’30 fatigué',title:'Tenir son projet fatigué',lv:2,tab:'cour',
  lead:'Même travail qu’en S3, une seule variable change : le 1’30 avec projet arrive juste après le 3’, avec seulement 6 min de récupération. Faut-il retirer quelques mètres au projet ? Le binôme décide et le justifie. Puis l’épreuve en miniature : 2 × (400 m + 200 m), pour courir juste en étant fatigué.',
  tl:[['Échauffement semi-guidé',18,'warm'],['Le 3’ au plot',14,'c3'],['1’30 avec projet, après 6 min',16,'proj'],['2 × (400 m + 200 m)',24,'mini'],['Bilan et carnet',18,'bilan']],
  warm:'Le binôme choisit ses 4 exercices de renforcement et sa fin d’échauffement.',
  eval:[['afl1','Préparer C2 : courir le 1’30 sans être frais.'],['afl2','Ajuster son projet à la fatigue : décision écrite dans le carnet.']],
  ex:{c3:S_3MIN(),proj:S_PROJ({t:'1’30 avec projet, 6 min après le 3’',avant:['Vague A : 3’ à 0’, puis 1’30 à 9’ (6 min après la fin du 3’) ; vague B : 3’ à 5’, 1’30 à 14’.','Projet ajusté à la fatigue : − 5 à − 10 m par rapport à S3 ? Le binôme décide et écrit pourquoi.']}),
   mini:{t:'2 × (400 m + 200 m) : l’épreuve en miniature',k:'Fil rouge 2 · courir juste en étant fatigué',sch:'d400',
    disp:'400 m à 100 % de la VMA de travail, 1 min de récupération, 200 m à 108 % ; 5 min de récupération ; on recommence. Départs et arrivées sur la ligne (400 m = 2 tours, 200 m = 1 tour). Le binôme alterne : A fait son bloc pendant que B le chronomètre, puis on inverse.',
    four:'Coureur : vise ses deux temps. Coach : sur la pelouse à hauteur de la ligne, donne le départ, annonce le passage au 200 m du 400 m (moitié du temps visé) et l’écart à l’arrivée ; note temps et pouls. Professeur : surveille l’enchaînement et la sécurité de la piste.',
    deroul:['A : 400 m, 1 min, 200 m (4 min environ) ; puis B pendant que A récupère ; A repart au bout de 5 min, puis B (17 min en tout).','Temps visés : 400 m = 1 440 ÷ VMA (VMA 10 → 2’24 ; 12 → 2’00 ; 14 → 1’43) ; 200 m à 108 % (VMA 10 → 1’07 ; 12 → 56’’ ; 14 → 48’’).','Après chaque course : temps, écart, pouls. Le 2e bloc doit ressembler au 1er.'],
    cons:['C’est la logique de l’épreuve : courir juste en étant fatigué. Le 200 m ne se court pas plus vite pour « rattraper » le 400 m.','Ressenti : 4 sur 5 au 2e 200 m ; pouls à l’arrivée 170 à 190, sous 130 avant de repartir.','Sécurité : celui qui récupère reste sur la pelouse ou dans le couloir 4 ; on double par l’extérieur.'],
    reus:'3 courses sur 4 à 3 secondes près ; le 2e 200 m pas plus lent de 3 secondes que le 1er.',moins:'Un seul bloc 400 m + 200 m, ou 400 m à 95 %.',plus:'Récupération de 5 min ramenée à 4 ; 200 m à 110 %.'}},
  bilan:'Carnet : zone du 1’30 fatigué comparée à S3, temps des 400 m et des 200 m. « J’ai ajusté mon projet parce que… » : la décision était-elle la bonne ?'},

 {id:'s5',n:'S5',short:'Régularité',title:'Régularité sur 3’',lv:3,tab:'cour',
  lead:'Six 300 m à 95 % pour apprendre à répéter une allure, puis deux 3’ séparés de 5 min, à 20 m près l’un de l’autre, et le 1’30 avec projet. Échauffement autonome avec fiche : le binôme construit son échauffement de 15 min et l’écrit dans le carnet.',
  tl:[['Échauffement autonome (fiche)',15,'warm'],['6 × 300 m à 95 %',28,'r300'],['2 × 3’ au plot',20,'c3'],['1’30 avec projet',14,'proj'],['Bilan et carnet',13,'bilan']],
  warm:'Le binôme écrit son échauffement (durées des 3 parties, 4 exercices, gammes) avant de commencer.',
  eval:[['afl1','Régularité du 3’ : 1 point de l’efficacité à l’épreuve.'],['afl2','Échauffement construit et écrit par le binôme.']],
  ex:{r300:{t:'6 × 300 m réguliers à 95 %',k:'Courir au temps · reproduire une allure',sch:'d300',
    disp:'Départ en face de la ligne (100 m après elle), arrivée sur la ligne. 6 × 300 m à 95 % de la VMA de travail, 3 min de récupération. Le professeur siffle un départ toutes les 2’20 en alternant les vagues : chacun repart toutes les 4’40.',
    four:'Coureur : vise le même temps 6 fois. Coach : sur la pelouse à hauteur de la ligne, chronomètre depuis le sifflet, annonce le temps quand son coureur passe le grand plot jaune du 150 m (50 m après la ligne), puis l’écart à l’arrivée ; note. Professeur : sifflet toutes les 2’20.',
    deroul:['A, B, A, B… 6 fois chacun (environ 28 min).','Temps visé = 1 080 ÷ (0,95 × VMA) : VMA 10 → 1’54 ; 12 → 1’35 ; 14 → 1’21. Passage au 150 m à la moitié.','Après chaque 300 m : temps, écart, pouls avant de repartir.'],
    cons:['Le 6e doit ressembler au 1er : c’est la régularité du 3’.','Ressenti 3 sur 5 au début, 4 à la fin ; on parle par mots pendant la récupération.','Pouls avant de repartir : sous 130.','Sécurité : retour au départ en marchant sur la pelouse, jamais à contresens dans le couloir 1.'],
    reus:'5 des 6 temps à 2 secondes près du temps visé.',moins:'4 × 300 m.',plus:'Les 2 derniers sans annonce au 150 m.'},
   c3:S_3MIN({t:'2 × 3’ au plot',disp:'Deux 3’ par vague, 5 min de récupération entre les deux : vague A à 0’, vague B à 4’, vague A à 8’, vague B à 12’. Départ groupé sur la ligne au sifflet, mi-course sifflée à 1’30, arrêt à 3’. Le coach pose le plot violet de mi-course à chaque 3’.',deroul:['Le 2e 3’ doit être à 20 m près du 1er : c’est reproduire une allure. Même distance visée, même mi-course visée.','Distance = tours × 200 m + plot d’arrêt ; régularité = 2e moitié − 1re moitié, pour chacun des deux 3’.','Entre les deux : marcher, boire, regarder avec son coach la mi-course du 1er.','Pouls 15’’ × 4 après chaque 3’ : le 2e ne doit pas dépasser le 1er de plus de 10 pulsations.'],reus:'Deux 3’ à 20 m près l’un de l’autre, et réguliers (2e moitié ≥ 1re, à 10 m près).'}),proj:S_PROJ()},
  bilan:'Carnet : temps des 6 × 300 m, écart entre les deux 3’ (objectif : 20 m au plus), régularité, zone du 1’30. Le coach écrit un conseil pour l’épreuve blanche.'},

 {id:'s6',n:'S6',short:'Épreuve blanche',title:'Épreuve blanche – 3’ / 10’ / 1’30',lv:3,tab:'evs',
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

 {id:'s7',n:'S7',short:'Réglage',title:'Mon point faible – projet final',lv:4,tab:'cour',
  lead:'Chaque binôme travaille le point faible repéré à l’épreuve blanche, puis vit la routine de l’épreuve : 3’ à 95 %, 10 min de récupération organisée, 1’30 avec le projet final. Échauffement seul, sans fiche.',
  tl:[['Échauffement autonome sans fiche',18,'warm'],['Mon point faible',22,'choix'],['Répétition générale : 3’ à 95 %',12,'rg'],['1’30 avec projet final, 10 min après',18,'proj'],['Bilan et carnet',20,'bilan']],
  warm:'Sans fiche. Le professeur observe avec la grille de l’outil « Échauffement » et rend un retour à chacun.',
  eval:[['afl1','Projet final du 1’30 et distance visée sur 3’.'],['afl2','Choisir son travail à partir de ses données : premier pas vers la séance construite de Terminale.']],
  ex:{
   choix:{t:'Mon point faible',k:'Au choix du binôme',sch:'s3min',
    disp:'Trois ateliers sur la même piste, chacun choisit le sien. A. Départ du 3’ trop rapide : 2 × 1’30 à l’allure du 3’ (VMA × 25 m, soit 300 m pour une VMA de 12), 2 min de marche entre les deux. B. 1’30 hors zone : 3 × 45’’ à l’allure du projet (moitié du projet en 45’’), 1’30 de marche entre. C. Chute de vitesse : 3 × 300 m à 105 % de la VMA de travail, 2’30 de récupération.',
    four:'Coureur : choisit l’atelier à partir de sa feuille d’épreuve blanche et écrit sa cible chiffrée dans le carnet. Coach : donne le départ, chronomètre, mesure (plots plats) et annonce l’écart après chaque répétition. Professeur : valide le choix de chaque binôme avant le départ.',
    deroul:['A : départ de la ligne ; à 45’’, le coach annonce l’écart à la moitié de la cible (150 m pour 300 m) ; arrêt au signal du coach à 1’30, lecture du plot.','B : plot de départ à la moitié du projet avant la ligne (projet 330 m → 165 m avant la ligne, soit 35 m après elle) ; arrêt à 45’’, lecture de l’écart à la ligne.','C : départ en face de la ligne (100 m après elle), arrivée sur la ligne. Temps visé à 105 % : VMA 10 → 1’43 ; 12 → 1’26 ; 14 → 1’13 ; passage au 150 m à la moitié.','10 min par coureur, puis on inverse.'],
    cons:['Un seul atelier : celui qui répond au problème de l’épreuve blanche, pas celui qu’on préfère.','Sécurité : les coachs restent sur la pelouse ; à l’arrêt, on sort vers la pelouse en regardant derrière.','Pouls 15’’ × 4 après la dernière répétition, noté avec les écarts.'],
    reus:'Écart à la cible réduit d’une répétition à l’autre ; dernière répétition à 5 m près (A, B) ou à 2 secondes près (C).',moins:'Une répétition de moins.',plus:'Aucune annonce du coach : le coureur estime son écart avant de l’entendre.'},
   rg:S_3MIN({t:'Répétition générale : 3’ à 95 %',k:'Routine de l’épreuve · C1',
    disp:'Comme à l’épreuve : départ groupé sur la ligne, vague A au sifflet (0’), vague B à 4’. Le professeur siffle la mi-course (1’30) et l’arrêt (3’). 3’ à 95 % de la VMA de travail, distance et mi-course annoncées avant (VMA 12 → 570 m, mi-course 285 m). Le 1’30 avec projet final suit 10 min après chaque 3’.',
    avant:['Distance visée = VMA × 50 × 0,95 ; mi-course = la moitié. Les deux sont écrites avant le départ.','Après le 3’ : 10 min de récupération organisée comme à l’épreuve (marche, trot très lent, boire, projet du 1’30 ajusté avec le coach).'],
    reus:'Distance à 20 m près de l’annonce ; 2e moitié ≥ 1re moitié.',moins:'Viser 90 %.',plus:'Aucune annonce de temps pendant la course.'}),
   proj:S_PROJ({t:'1’30 avec projet final, 10 min après le 3’',avant:['Vague A à 13’, vague B à 17’ : 10 min après la fin de son 3’, comme à l’épreuve.','Projet final ajusté après le 3’ : le binôme l’écrit et le justifie par ses chiffres.']})},
  bilan:'Projet final dans le carnet : distance visée sur 3’ et projet du 1’30, justifiés par l’épreuve blanche et la séance du jour.'},

 {id:'s8',n:'S8',short:'Évaluation',title:'Évaluation – 3’ / 10’ / 1’30',lv:4,tab:'evs',status:'eval',
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
SESSIONS[0].lead='Séance d’entrée en challenges : le binôme se forme et marque des points ensemble sur deux défis (annonce juste, contrat tenu), classement du jour en fin de séance. On apprend les 3 parties de l’échauffement et on découvre quatre allures sur 3 min ; la 4e, le 3’ rapide, donne une VMA de travail provisoire (grands plots jaunes franchis = km/h), remesurée en S2. Pour finir, 6 min de course continue : les anneaux.';
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
  deroul:['Projet = dernière distance réalisée au 1’30 (T1), ajustée à la fatigue du jour : la série 300 + 200 m vient d’être courue (− 5 à − 10 m ?). Le binôme décide et écrit pourquoi.','Distance réalisée = projet + écart ; vitesse = distance ÷ 25.'],
  cons:['Distance aux 45’’ = moitié du projet.','Comme au C3 de l’épreuve, on court fatigué : partir quand même à l’allure du projet, pas plus vite. Pouls à l’arrivée : 180 et plus.','Au sifflet : arrêt sur place jusqu’à la lecture du coach.'],
  reus:'Zone 4 ou zone 3.',moins:'Zones à ± 10 m.',plus:'Projet + 5 m.'};
const T_SESSIONS=[
 {id:'t1',n:'T1',short:'Relais 5 km',title:'Parcourir 5 km à 2 et observer',lv:3,tab:'t1',
  lead:'Retrouver la piste et le binôme, courir longtemps à une allure régulière, puis un premier 500 m pour se situer dans le barème et un 1’30 où l’on estime sa distance. Échauffement en binôme avec la fiche de Seconde : le professeur repère qui sait déjà s’échauffer seul.',
  tl:[['Échauffement avec fiche',15,'warm'],['Relais 5 km à deux',35,'r5'],['500 m de référence',17,'ref'],['1’30 : j’estime ma distance',11,'e130'],['Bilan et carnet',12,'bilan']],
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
   ref:{t:'500 m de référence',k:'Situation finale · course C1 sans projet chiffré',sch:'d500',
    disp:'Après 5 min de récupération active (marche puis footing très lent, pouls sous 120). Départ debout en face de la ligne (100 m après elle) : 2 tours et demi, arrivée sur la ligne. Plot bleu du 250 m à 150 m après la ligne : le coureur y passe à 50 m puis à 250 m. Vague A au sifflet, vague B 5 min plus tard.',
    four:'Coureur : court au mieux, sans projet chiffré, mais régulier. Coach : démarre au sifflet, se place sur la pelouse à hauteur du plot bleu, annonce le temps au 2e passage (250 m), puis rejoint la ligne pour le temps final ; note les deux temps et le pouls. Professeur : départs, contrôle de quelques temps.',
    deroul:['Temps du 2e 250 m = temps final − temps au 250 m.','Vitesse en km/h = 1 800 ÷ temps en secondes (2’00 = 120 s → 15 km/h).','Note sur 8 au barème (outil « Évaluation ») : c’est la référence du cycle.','Pouls 15’’ × 4 à l’arrivée, puis 5 min de marche avant de devenir coach.'],
    cons:['La 2e moitié au moins aussi vite que la 1re : le 1er tour ne doit pas « faire plaisir ».','Ressenti 5 et pouls à 180 et plus à l’arrivée : c’est normal sur 500 m.','Doubler par l’extérieur, ne pas couper la corde ; après la ligne, continuer en marchant dans le couloir 3.'],
    reus:'Écart entre les deux 250 m inférieur à 3 secondes.',moins:'Départ par groupes de 4 de même niveau, pour ne pas partir dans le paquet.',plus:'Annoncer son temps estimé avant de partir et noter l’écart, comme à l’épreuve.'},
   e130:{t:'1’30 : j’estime ma distance',k:'Repère pour le projet du 1’30',sch:'p130',
    disp:'Après le 500 m et 5 min de récupération active. Départ groupé sur la ligne au sifflet ; le professeur annonce « 45 » et siffle l’arrêt à 1’30. Vague A, puis vague B. Avant de partir, chacun annonce la distance qu’il pense faire à 45’’ et à 1’30.',
    four:'Coureur : annonce ses deux estimations au coach, court 1’30 à l’allure qu’il pense tenir à l’épreuve, s’arrête sur place au sifflet. Coach : au centre de la pelouse, compte les tours ; au « 45 », repère le plot plat où passe son coureur ; au sifflet, relève le plot d’arrêt. Il note estimé et réalisé à 45’’ et à 1’30. Professeur : sifflets et annonce du temps.',
    deroul:['Distance = tours × 200 m + plot d’arrêt ; vitesse = distance ÷ 25.','Écarts : réalisé − estimé, à 45’’ et à 1’30.','Repère : environ la vitesse de son 500 m ; 500 m en 2’00 (15 km/h) → 375 m en 1’30.','Pouls à l’arrêt, ressenti de 1 à 5.'],
    cons:['À 45’’, être à la moitié de son estimation : la 2e moitié au moins aussi longue que la 1re.','On court après le 500 m : c’est la situation du C3 de l’épreuve. Ressenti 5 à l’arrivée.','Au sifflet : arrêt sur place jusqu’à la lecture du coach ; les autres doublent par l’extérieur.'],
    reus:'Distance réalisée à 20 m près de l’estimation ; 2e moitié ≥ 1re.',moins:'Estimation à 1’30 seulement.',plus:'Estimations à 45’’, 1’ et 1’30.'}
  },
  bilan:'Carnet : temps au tour moyen, 500 m de référence et sa note sur 8, écarts entre distances estimées et réalisées au 1’30. Première idée de la répartition AFL2 / AFL3 (6/2, 4/4 ou 2/6), à confirmer avant T7.'},

 {id:'t2',n:'T2',short:'VMA',title:'Alterner les allures et trouver sa VMA',lv:3,tab:'vma',
  lead:'Leçon 2 du carnet : des tours de plus en plus rapides pour sentir les allures, puis le test 10 × 36’’/24’’. Les tableaux d’allures du cycle en dépendent.',
  tl:[['Échauffement avec fiche',20,'warm'],['Varier les allures et coacher',20,'tours'],['Test VMA · vague A',14,'testA'],['Test VMA · vague B',14,'testB'],['Tableau d’allures et groupes',22,'bilan']],
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
   testA:LIB.testA,testB:LIB.testB
  },
  bilan:'VMA = total des 10 répétitions ÷ 10. Recopier sa ligne du tableau d’allures. Groupes de vitesse (G1 à G4) ; binômes définitifs avec coureur et coach dans deux groupes différents.'},

 {id:'t3',n:'T3',short:'1er 500',title:'Travail du 1er 500 – intermittent 36’’/36’’',lv:4,tab:'t3',
  lead:'Des distances qui raccourcissent pendant que l’allure monte, de 90 à 130 % de la VMA, puis 4 × 250 m à l’allure visée du 500 m et l’intermittent 36’’/36’’ au-dessus de la VMA (5 répétitions à 110 %, 5 à 120 %). À partir de T3, échauffement seul et sans fiche.',
  tl:[['Échauffement autonome',15,'warm'],['Varier les allures : 500 à 100 m',24,'desc'],['4 × 250 m à l’allure du 500 m',12,'r250'],['Récupération active 3’ à 70 %',4,'ra'],['36’’/36’’ à 110 puis 120 %',26,'i36'],['Bilan et carnet',9,'bilan']],
  warm:'Chacun écrit son échauffement dans le carnet après coup ; le professeur observe 5 élèves par séance avec la grille.',
  eval:[['afl1','Allure du premier 500 m : partir à la bonne vitesse, c’est la moitié de la note de C1.'],['afl2','Performances stables : chaque course a un temps prévu et un temps réalisé.'],['afl3','Coach : choix des vitesses, organisation de la récupération, bilan de coaching.']],
  ex:{
   desc:{t:'Varier les allures : 500-400-300-200-100-100',k:'Leçon 3 du carnet · % de VMA',sch:'pyramide',
    disp:'500 m à 90 %, 400 m à 95 %, 300 m à 100 %, 200 m à 110 %, 100 m à 120 %, 100 m à 130 %. Toutes les arrivées sur la ligne. Vague A puis vague B sur chaque distance ; récupérations du carnet (4’, 3’30, 3’, 2’, 2’) : la course de l’autre vague plus le temps qui manque, jusqu’au sifflet du professeur.',
    four:'Coureur : lit son temps prévu. Coach : chronomètre, annonce le passage à mi-course, note temps et pouls, remplit « choix de vitesses », « organisation de la récup », « bilan coaching ». Professeur : départs de chaque vague, annonce du temps de récupération restant.',
    deroul:['Départs : 500 et 300 m en face de la ligne (100 m après elle) ; 400 et 200 m sur la ligne ; 100 m en face de la ligne.','Temps visé (s) = distance (m) × 3,6 ÷ (VMA × %). VMA 12 : 2’47, 2’06, 1’30, 55’’, 25’’, 23’’. VMA 15 : 2’13, 1’41, 1’12, 44’’, 20’’, 18’’.','Après chaque course : temps, écart au prévu, pouls, ressenti.'],
    cons:['Plus c’est court, plus c’est vite : le 100 m à 130 % n’est pas un sprint.','Ressenti : 500 m à 90 %, on parle par mots ; à partir du 200 m, on ne parle plus.','Récupération : marcher ; pouls sous 130 avant de repartir, sinon prévenir son coach.','Sécurité : la vague qui récupère marche dans les couloirs 3 et 4 ou sur la pelouse ; les coachs ne traversent jamais la piste pendant une course.'],
    reus:'5 courses sur 6 à 2 secondes ou moins du temps prévu.',moins:'Intensités à −5 % ; sans le dernier 100 m.',plus:'300 m à 105 %, 200 m à 115 %.'},
   r250:{t:'4 × 250 m à l’allure visée du 500 m',k:'Allure du 1er 500 m',sch:'d250',
    disp:'Départ 150 m après la ligne, arrivée sur la ligne (un tour et 50 m). 4 × 250 m à 115 % de la VMA, 2 min de récupération, en alternance dans le binôme.',
    four:'Coureur : vise son temps, la moitié de son temps visé sur 500 m. Coach : sur la pelouse à hauteur de la ligne, baisse le bras en lançant son chrono (c’est le départ), annonce le passage au 125 m (moitié du temps) et l’écart à l’arrivée. Puis on échange les rôles.',
    deroul:['Temps visé = 900 ÷ (1,15 × VMA) : VMA 12 → 1’05 ; VMA 15 → 52’’.','A, B, A, B… 4 fois chacun ; on repart environ 2 min après son arrivée.','Après chaque 250 m : temps, écart, ce qu’on change.'],
    cons:['C’est le premier 250 m de l’épreuve : le passage au 250 m se règle ici.','Ressenti 4 sur 5 ; pouls sous 140 avant de repartir.','Sécurité : retour au départ par la pelouse, jamais à contresens dans le couloir 1.'],
    reus:'3 des 4 passages à 2 secondes près.',moins:'3 × 250 m à 110 %.',plus:'Le dernier sans annonce : le coureur estime son temps.'},
   ra:T_RA,
   i36:{t:'36’’/36’’ à 110 % puis 120 %',k:'Intermittent au-dessus de la VMA',sch:'i3636',
    disp:'Plots plats tous les 10 m depuis la ligne ; départ commun sur la ligne, couloirs 1 et 2. En 36’’, plots franchis = km/h : plot cible = 1,1 × VMA pour les 5 premières répétitions (VMA 12 → 13e plot ; VMA 15 → 16,5e), puis 1,2 × VMA pour les 5 suivantes (VMA 12 → 14,5e ; VMA 15 → 18e). Aller-retour : toute la vague court dans le même sens. Vague A puis vague B.',
    four:'Coureur : arrive à son plot au sifflet, ni avant ni après ; aux retours, il vise la ligne et s’annonce lui-même. Coach : sur la pelouse à hauteur du plot cible, juge les allers (« tôt », « pile », « tard ») et coche. Professeur : sifflets au départ et à la fin des 36’’, « moitié » à 18’’.',
    deroul:['10 × 36’’/36’’ par vague (12 min), transition 2 min.','36’’ de récupération : marcher autour de son plot, couloirs 1 et 2, puis s’y replacer pour le retour.','Pouls 15’’ × 4 après la 10e répétition.'],
    cons:['120 % : allure du 1’30 de l’épreuve.','Se caler dans les 10 premiers mètres ; tôt deux fois → je ralentis ; tard deux fois → j’accélère.','Pouls repère en fin de série : 180 et plus ; ressenti 4 sur 5.','Sécurité : on ne se retourne pas avant le sifflet ; celui qui s’arrête sort vers la pelouse.'],
    reus:'8 répétitions sur 10 à 1 plot près.',moins:'105 puis 110 %.',plus:'6 à 110 %, 6 à 120 %.'}
  },
  bilan:'Carnet : écarts prévu-réalisé, pouls, ressenti 1 à 5. Question : à quel pourcentage de ta VMA cours-tu ton 500 m de T1 ? (vitesse = 1 800 ÷ temps en secondes).'},

 {id:'t4',n:'T4',short:'Intermittent',title:'Intermittent 1’12 et pyramide',lv:4,tab:'t4',
  lead:'Le 1’12/1’12 à 95 % (6 répétitions) pour tenir longtemps une allure proche de la VMA, puis une pyramide de 125 à 500 m qui monte jusqu’à 130 %. On apprend à tenir une allure au-dessus de la VMA sur des distances proches de 500 m.',
  tl:[['Échauffement autonome',15,'warm'],['1’12/1’12 à 95 %',30,'i112'],['Récupération active 3’ à 70 %',4,'ra'],['Pyramide 125 à 500 m',32,'pyr'],['Bilan et carnet',9,'bilan']],
  warm:'Fin d’échauffement à l’allure du 500 m (110 %).',
  eval:[['afl1','Le 500 m à 110 % de la pyramide : l’allure des deux 500 m de l’épreuve.'],['afl2','Tenue des allures prévues sur toute la pyramide.']],
  ex:{
   i112:{t:'1’12/1’12 à 95 %',k:'Intermittent long',sch:'i112',
    disp:'Coupelles orange tous les 20 m sur toute la piste : en 1’12, coupelles franchies = vitesse en km/h. Cible = 0,95 × VMA (VMA 12 → 11,5 coupelles, 228 m ; VMA 15 → 14,5 coupelles, 285 m). Coureurs répartis autour de la piste. 6 répétitions par vague : 1’12 de course, 1’12 de récupération en marchant jusqu’à la coupelle suivante, d’où l’on repart.',
    four:'Coureur : part d’une coupelle, compte ses coupelles, s’arrête au sifflet et annonce son chiffre. Coach : au centre de la pelouse, suit son coureur, vérifie le chiffre et le note avec les ressentis souffle, chaleur, muscles (1 à 5). Professeur : sifflets au départ et à la fin de chaque 1’12, « moitié » à 36’’.',
    deroul:['Vague A : 6 × 1’12/1’12 (14 min 24), 2 min de transition, puis vague B.','Au « moitié » (36’’), on doit avoir passé la moitié de son chiffre cible.','Pouls 15’’ × 4 après la 6e répétition.'],
    cons:['95 % : on ne parle plus, mais on doit tenir 6 fois la même distance.','Pouls repère en fin de série : 170 à 185.','Doubler par l’extérieur ; pendant la récupération, marcher sans s’arrêter dans le couloir 1.'],
    reus:'5 répétitions sur 6 à 1 coupelle près de la cible.',moins:'90 % ; 5 répétitions.',plus:'7 répétitions.'},
   ra:T_RA,
   pyr:{t:'Pyramide 125-250-375-500-375-250-125',k:'% de VMA',sch:'pyrT4',
    disp:'125 m à 90 %, 250 m à 95 %, 375 m à 100 %, 500 m à 110 %, 375 m à 115 %, 250 m à 120 %, 125 m à 130 %. Toutes les arrivées sur la ligne. Récupérations : 2’, 2’30, 3’, 5’, 4’, 3’30, en alternance des vagues.',
    four:'Coureur : lit son temps prévu. Coach : chronomètre depuis le sifflet, annonce le passage à mi-course et l’écart à l’arrivée, note temps et pouls. Professeur : siffle le départ de chaque vague, contrôle les plots de départ.',
    deroul:['Départs : 125 m à 75 m après la ligne, 250 m à 150 m après, 375 m à 25 m après, 500 m en face (100 m après). Pour 375 et 125 m, un seul plot de départ, posé entre deux plots plats.','Temps visés VMA 12 : 42’’, 1’19, 1’53, 2’16, 1’38, 1’03, 29’’. VMA 15 : 33’’, 1’03, 1’30, 1’49, 1’18, 50’’, 23’’.','Après chaque course : temps, écart, pouls, ressenti de 1 à 5.'],
    cons:['Le 500 m à 110 % est la course clé : passage au 250 m à la moitié du temps prévu (VMA 12 : 1’08).','Ressenti : à partir du 375 m à 115 %, on ne parle plus (4 sur 5).','Pouls sous 130 avant de repartir.','Sécurité : la vague qui récupère marche dans les couloirs 3 et 4 ; les coachs restent sur la pelouse.'],
    reus:'5 courses sur 7 à 2 secondes près ; on accélère sur la fin de la pyramide.',moins:'Intensités à −5 % ; sans le dernier 125 m.',plus:'Récupérations de la descente raccourcies de 30 s.'}
  },
  bilan:'Carnet : temps prévu et réalisé du 500 m à 110 %. C’est la première estimation du projet de C1.'},

 {id:'t5',n:'T5',short:'Re-test, 2e 500',title:'Re-test et travail du 2e 500 m',lv:4,tab:'t5',
  lead:'Le re-test 36’’/24’’ recale la VMA pour la fin du cycle. Puis 3 × (300 m + 200 m) à l’allure du 500 m : le 200 m, couru 1 min après le 300 m, doit être aussi rapide, comme le 2e 500 m de l’épreuve. Pour finir, un 1’30 avec projet.',
  tl:[['Échauffement autonome',15,'warm'],['Re-test VMA 36’’/24’’',26,'rt'],['3 × (300 m + 200 m)',26,'s32'],['1’30 avec projet',13,'proj'],['Bilan et carnet',10,'bilan']],
  warm:'Fin d’échauffement courte : le re-test commence à une allure modérée.',
  eval:[['afl1','Tenir l’allure du 500 m malgré la fatigue : la note de C2 en dépend.'],['afl1','1’30 : zones d’arrivée (/4).'],['afl2','VMA mise à jour : les cibles de T5 à T9 sont recalculées.']],
  ex:{
   rt:{t:'Re-test VMA : 10 × 36’’/24’’',k:'2e mesure de VMA · mise à jour des cibles',sch:'test',
    disp:'Même protocole qu’en T2 : plots plats tous les 10 m, chaque minute 36’’ de course et 24’’ de marche, 10 fois de suite. Vague A (10 min), 2 min de calcul, puis vague B.',
    four:'Coureur : part d’un plot plat, compte ses plots, s’arrête au sifflet et annonce son chiffre ; marche 24’’ et repart du plot suivant. Coach : au centre de la pelouse, vérifie et note le chiffre de chaque minute dans la grille. Professeur : sifflets, annonce du numéro de la répétition.',
    deroul:['Nouvelle VMA = total des 10 chiffres ÷ 10, comme en T2.','Les cibles de T5 à T9 sont recalculées avec cette VMA (l’appli le fait seule) ; chacun met à jour la page 2 du carnet.','Écart de plus de 1,5 km/h avec T2 : on en parle avec le professeur.'],
    cons:['Partir à l’allure qu’on croit tenir 10 fois : on cherche 10 chiffres proches.','Nancy-Metz demande au moins deux tests de VMA dans la séquence : celui-ci recale les allures de l’épreuve.','Pouls en fin de test : 180 et plus. Au sifflet, ralentir en 2 pas, rester dans son couloir.'],
    reus:'10 minutes remplies ; au plus 2 km/h d’écart entre la meilleure et la moins bonne répétition.',moins:'8 répétitions (diviser par 8).',plus:'Aucune : c’est un test.'},
   s32:{t:'3 × (300 m + 200 m) à l’allure du 500 m',k:'Travail du 2e 500 m',sch:'d300200',
    disp:'300 m à 115 % de la VMA, 1 min de récupération, 200 m à 115 % ; 5 min de récupération ; 3 fois. Le 300 m part en face de la ligne (100 m après elle) et finit sur la ligne ; le 200 m part de la ligne. Le binôme alterne : A fait son bloc pendant que B le chronomètre, puis on inverse.',
    four:'Coureur : vise la même allure sur le 300 et le 200 m. Coach : sur la pelouse à hauteur de la ligne, chronomètre, annonce le passage au 150 m du 300 m et l’écart à l’arrivée ; note les deux temps et le pouls. Professeur : surveille l’enchaînement des blocs.',
    deroul:['Temps visés : 300 m = 1 080 ÷ (1,15 × VMA) ; 200 m = 720 ÷ (1,15 × VMA). VMA 12 → 1’18 et 52’’ ; VMA 15 → 1’03 et 42’’.','A : 300 m, 1 min, 200 m (environ 3 min) ; puis B ; A repart au bout de 5 min. Trois blocs chacun (environ 25 min).','Après chaque bloc : deux temps, écarts, pouls.'],
    cons:['Le 200 m couru fatigué doit être à la même allure que le 300 m : c’est le 2e 500 m de l’épreuve.','Ressenti 4 sur 5 au 3e bloc ; pouls à l’arrivée 180 et plus, sous 130 avant de repartir.','Sécurité : celui qui récupère reste sur la pelouse ou dans le couloir 4 ; doubler par l’extérieur.'],
    reus:'Sur chaque bloc, le 200 m en deux tiers du temps du 300 m, à 1 seconde près.',moins:'2 blocs ; 110 % de la VMA.',plus:'Récupération entre le 300 et le 200 m ramenée à 45’’.'},
   proj:T_PROJ
  },
  bilan:'Carnet : nouvelle VMA et cibles mises à jour, temps des 300 m et des 200 m, zone du 1’30. Le coach écrit un conseil pour T6.'},

 {id:'t6',n:'T6',short:'Dernier 500',title:'Travail du dernier 500 m – résister',lv:4,tab:'t6',
  lead:'Des distances qui s’allongent pendant que l’allure monte (100 à 300 m, jusqu’à 120 %), pour apprendre à tenir quand les jambes brûlent. Puis deux 500 m séparés de 10 min, comme à l’épreuve : le 2e doit être à moins de 3 secondes du 1er.',
  tl:[['Échauffement autonome',15,'warm'],['Résistance : 100 à 300 m',26,'res'],['500 m n°1',12,'k1'],['500 m n°2, 10 min après',18,'k2'],['Bilan et carnet',19,'bilan']],
  warm:'Fin d’échauffement : 2 accélérations, la 2e à l’allure du 500 m.',
  eval:[['afl1','Deux 500 m à 10 min d’écart : la logique de C1 et C2 à l’épreuve.'],['afl2','Récupération de 10 min organisée comme le jour J.']],
  ex:{
   res:{t:'Résistance : 100-200-250-300 m',k:'Travail du dernier 500 m',sch:'pyrT6',
    disp:'100 m à 100 %, 200 m à 105 %, 250 m à 110 %, 300 m à 120 % de la VMA. Récupérations : 2’, 2’30, 3’, en alternance des vagues. Toutes les arrivées sur la ligne.',
    four:'Coureur : vise son temps. Coach : chronomètre, annonce le passage à mi-course et l’écart à l’arrivée ; note temps, pouls et ressenti. Professeur : départs de chaque vague, signal de fin de récupération.',
    deroul:['A puis B sur chaque distance.','Départs : 100 et 300 m en face de la ligne (100 m après elle) ; 250 m à 150 m après la ligne ; 200 m sur la ligne.','Temps visés VMA 12 : 30’’, 57’’, 1’08, 1’15. VMA 15 : 24’’, 46’’, 55’’, 1’00.'],
    cons:['Les jambes brûlent sur le 300 m : c’est le but. On garde sa foulée et les bras actifs jusqu’à la ligne.','Pouls sous 130 avant de repartir ; la vague qui récupère reste hors du couloir 1.','Les deux 500 m suivent : on tient les temps, on ne se vide pas.'],
    reus:'3 courses sur 4 à 2 secondes près ; le 300 m tenu jusqu’au bout.',moins:'300 m à 115 %.',plus:'300 m à 125 %.'},
   k1:Object.assign({},LIB.c1,{t:'500 m n°1',k:'Allure de l’épreuve · C1',
    deroul:['Temps visé : 500 m à 110 % de la VMA (VMA 12 → 2’16, passage au 250 m en 1’08 ; VMA 15 → 1’49, en 55’’), ou son projet de C1.'].concat(LIB.c1.deroul),
    moins:'Temps visé à 105 % de la VMA.',plus:'Pas d’annonce au 250 m : le coureur se règle seul.'}),
   k2:Object.assign({},LIB.c2,{t:'500 m n°2, 10 min après',k:'Allure de l’épreuve · C2',
    reus:'Écart entre les deux 500 m inférieur à 3 secondes.',moins:'2e course ramenée à 400 m.',plus:'Pas d’annonce au 250 m : le coureur se règle seul.'})
  },
  bilan:'Carnet : temps et passages au 250 m des deux 500 m, écart entre les deux (objectif : moins de 3 secondes), ce qui a été fait pendant les 10 min de récupération.'},

 {id:'t7',n:'T7',short:'Épreuve blanche',title:'Épreuve blanche – 500 / 500 / 1’30',lv:4,tab:'t7',
  lead:'L’épreuve en vrai : projets annoncés, échauffement seul observé, 3 courses avec 10 min de récupération, notes au barème. Le bilan dit ce qu’il faut travailler en T8.',
  tl:[['Échauffement autonome observé',20,'warm'],['Projets et installation',5,'inst'],['C1 · 500 m',12,'c1'],['C2 · 500 m',12,'c2'],['C3 · 1’30 avec projet',12,'c3'],['Retour au calme et auto-évaluation',12,'rac'],['Notes et bilan',17,'bilan']],
  warm:'Observé avec la grille de l’outil « Échauffement » ; retour individuel en fin de séance.',
  eval:[['afl1','Note blanche /12 : performance /8 et efficacité /4.'],['afl2','Échauffement et projet observés comme le jour J.'],['afl3','Le coach chronomètre, annonce le passage au 250 m, vérifie le plot du 1’30.']],
  ex:{inst:LIB.inst,c1:LIB.c1,c2:LIB.c2,c3:LIB.c3,rac:T_RAC},
  bilan:'Chacun calcule sa note blanche (outil « Évaluation ») et choisit son thème pour T8 : 1er 500 (départ mal réglé), 2e 500 (chute de vitesse), ou 1’30 (zone ratée). Puis page « Je me situe » : il se place sur les degrés AFL2 et AFL3 et choisit sa répartition (6/2, 4/4, 2/6), à annoncer avant l’épreuve.'},

 {id:'t8',n:'T8',short:'Ma séance',title:'Construire et réaliser ma séance',lv:4,tab:'t8',
  lead:'Ce que le référentiel demande en AFL2 : construire et réaliser une séance sur un thème en utilisant les paramètres de la charge (distance ou durée, intensité, récupération, répétitions). Le thème vient de l’épreuve blanche. Puis on règle l’allure du projet final.',
  tl:[['Échauffement autonome',15,'warm'],['Construire sa séance',10,'constr'],['Réaliser sa séance',35,'mine'],['Prise d’allure : 3 × 100 m',12,'c100'],['Projet final et bilan',18,'bilan']],
  warm:'Échauffement adapté au thème choisi.',
  eval:[['afl2','Séance construite avec les paramètres de la charge et réalisée : élément du référentiel.'],['afl3','Le coach aide à construire la séance et la chronomètre.']],
  ex:{
   constr:{t:'Construire sa séance',k:'AFL2 · paramètres de la charge',
    disp:'Fiche du carnet et tableau d’allures. Trois thèmes : 1er 500 m, 2e 500 m, 1’30. Choix parmi la banque de situations ou les leçons du carnet (6’ au plot pour la puissance, 36’’/36’’ pour la capacité). Binômes assis sur la pelouse.',
    four:'Coureur : écrit thème, exercice, distance ou durée, intensité, récupération, nombre de répétitions, temps ou distances visés. Coach : vérifie la cohérence avec le carnet. Professeur : valide en passant de binôme en binôme.',
    deroul:['Ordre d’écriture : problème vu en T7 → thème → exercice → intensité (% de VMA) → distance ou durée → répétitions → récupération → cibles chiffrées (tableau d’allures).','Une semaine avant l’épreuve : pas plus de 110 % de la VMA et pas plus de 1 500 m rapides au total. On s’affûte, on ne s’épuise pas.','Exemple, thème « 2e 500 m » : 4 × 250 m à 110 %, 1’ de récupération ; VMA 13 → 250 m en 1’03.'],
    cons:['La séance répond à un problème vu en T7 : écrire lequel.','Changer un paramètre à la fois : si l’intensité monte, la récupération ne raccourcit pas en même temps.'],
    reus:'Séance écrite, chiffrée et validée.',
    moins:'Le binôme part d’une des 3 séances types du carnet (puissance, capacité, allure spécifique) et n’adapte que les chiffres à sa VMA.',plus:'Chaque paramètre (intensité, durée, récupération) est justifié par le point faible relevé sur le 500 m ; volume jusqu’à 1 500 m.'},
   mine:{t:'Réaliser sa séance',k:'AFL2 · séance du binôme',sch:'piste',
    disp:'Les binômes travaillent en même temps, chacun sur sa séance. Piste partagée : couloir 1 pour les courses longues et les intermittents ; les fractions partent et finissent sur la ligne ; les coachs restent sur la pelouse.',
    four:'Coureur : réalise sa séance. Coach : chronomètre et note, puis on inverse (ou les deux courent en alternance dans la même séance). Professeur : passe de binôme en binôme, vérifie qu’on fait ce qui est écrit.',
    deroul:['Exemples (1 500 m rapides au plus) : 6 × 36’’/36’’ à 110 % (capacité) ; 4 × 250 m à 110 %, 1’ de récupération (allure spécifique) ; 3 × 300 m à 105 %, 3’ de récupération (2e 500 m).','Jusqu’à 8 répétitions notées : temps prévu et temps réalisé, à 2 secondes près ; pouls et ressenti.'],
    cons:['Respecter les récupérations écrites : c’est un paramètre de la charge.','Ressenti attendu : allure spécifique 4 sur 5 ; puissance (6’ à 95 %) 3 à 4 sur 5.','Sécurité : regarder derrière avant de partir ; doubler par l’extérieur ; personne ne s’arrête dans le couloir 1.'],
    reus:'Séance réalisée telle qu’écrite ; écart prévu-réalisé noté.',
    moins:'Récupérations allongées de 30 s ; volume vers 1 000 m.',plus:'Récupérations raccourcies (36’’/24’’ au lieu de 36’’/36’’) ; volume jusqu’à 1 500 m.'},
   c100:LIB.c100
  },
  bilan:'Projet final dans le carnet : temps de C1 et C2, passage au 250 m, distance et plot du 1’30, justifiés par l’épreuve blanche.'},

 {id:'t9',n:'T9',short:'Épreuve',title:'Épreuve – 500 / 500 / 1’30',lv:4,tab:'eval',status:'eval',
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
 t4:{pyr:{n:'La pyramide à contrat',r:'Même contrat d’équipe qu’en T3, sur la pyramide 125-250-375-500-375-250-125. Le 500 m à 110 % compte double : c’est l’allure des 500 m de l’épreuve.',p:'écart d’équipe ≤ 5’’ = 3 pts, ≤ 10’’ = 1 pt par distance ; doublé sur le 500 m ; équipe gagnante de T3 + T4 annoncée en fin de séance'}}
};
T_SESSIONS.forEach(s=>{const J=JEUX_T[s.id];if(!J)return;Object.keys(J).forEach(k=>{if(s.ex[k])s.ex[k]=Object.assign({},s.ex[k],{jeu:J[k]})})});
T_SESSIONS[0].bilan='Carnet : temps au tour moyen, 500 m de référence et sa note sur 8, écarts entre distances estimées et réalisées au 1’30. Équipes de 2 binômes (niveaux mélangés) gardées jusqu’à T4 ; résultats des deux challenges du jour. Première idée de la répartition AFL2 / AFL3 (6/2, 4/4 ou 2/6), à confirmer avant T7.';
T_SESSIONS[3].bilan='Carnet : temps prévu et réalisé du 500 m à 110 %, première estimation du projet de C1. Annonce de l’équipe gagnante des contrats de T3 et T4 ; à partir de T5, on revient au binôme seul.';
const LEGEND=`<div class="legend"><span><i class="dot" style="background:var(--accent)"></i>coureur</span><span><i class="dot" style="background:var(--team-n)"></i>coach, observateur</span><span><i class="liner"></i>course</span><span><i class="lineo"></i>retour</span><span>plots : plats tous les 10 m · coupelles orange tous les 20 m · grands jaunes tous les 50 m</span></div>`;
SESSIONS.concat(T_SESSIONS).forEach(s=>s.orig=s.status||'next');

/* Variables « plus facile / plus difficile » des situations qui n’en avaient pas (fixe = pas de variable, volontairement). */
(function(){const V={"t1#ra": {"fixe": "Récupération : l’intensité reste basse pour tout le monde."}, "t2#ra": {"fixe": "Récupération : l’intensité reste basse pour tout le monde."}, "t4#ra2": {"fixe": "Récupération : l’intensité reste basse pour tout le monde."}, "s2#ra": {"fixe": "Récupération : l’intensité reste basse pour tout le monde."}, "t1#ref": {"fixe": "Situation de référence : mêmes conditions pour tous, pour comparer en fin de cycle."}, "t2#testB": {"fixe": "Test de VMA : protocole identique pour tous, sinon la VMA est fausse."}, "t7#inst": {"fixe": "Temps d’organisation."}, "s1#acc": {"fixe": "Temps d’organisation."}, "s6#inst": {"fixe": "Temps d’organisation."}, "t7#c1": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "t7#c2": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "t7#c3": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "s6#e1": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "s6#e2": {"fixe": "Course évaluée : conditions de l’épreuve, pas d’aménagement."}, "t7#rac": {"fixe": "Bilan : même travail pour tous."}, "s6#rac": {"fixe": "Bilan : même travail pour tous."}, "t8#constr": {"moins": "Le binôme part d’une des 3 séances types du carnet (puissance, capacité, allure spécifique) et n’adapte que les chiffres à sa VMA.", "plus": "Chaque paramètre (intensité, durée, récupération) est justifié par le point faible relevé sur le 500 m ; volume jusqu’à 1 500 m."}, "t8#mine": {"moins": "Récupérations allongées de 30 s ; volume vers 1 000 m.", "plus": "Récupérations raccourcies (36’’/24’’ au lieu de 36’’/36’’) ; volume jusqu’à 1 500 m."}, "s7#choix": {"moins": "Une répétition de moins par atelier, récupération allongée d’1 min ; le coach annonce chaque passage.", "plus": "Le coureur annonce son temps de passage avant que le coach le donne ; une répétition de plus."}};
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
/* =====================================================================
   PARCOURS MARCHE — élèves asthmatiques (ou autre avis médical) : un élève
   du binôme peut suivre ce parcours (run.pc = 'm') pendant que l'autre court.
   Mêmes numéros de séance que la classe (S1-S8, T1-T9) : le code du cours,
   l'appel et l'envoi restent communs.
   Terminale : épreuve du lycée « marche fractionnée adaptée » 2 × 1000 m + 3’ (barème CCF 2021).
   Seconde : épreuve allégée 1 × 1000 m + 3’ (mêmes tables, un seul 1000 m).
   ===================================================================== */
const tMs=s=>{const m=/(\d+)\D+(\d+)/.exec(s);return +m[1]*60+ +m[2]};
const BARM={notes:[8,7.75,7.5,7.25,7,6.75,6.5,6.25,6,5.75,5.5,5.25,5,4.5,4,3.75,3.5,3.25,3,2.75,2.5,2.25,2,1.75,1.5,1.25,1,0.75,0.5],
 F1000:['6’35','6’45','6’55','7’05','7’15','7’25','7’35','7’45','7’55','8’05','8’15','8’25','8’35','8’45','8’55','9’05','9’15','9’25','9’35','9’55','10’15','10’35','10’55','11’15','11’35','11’55','12’15','12’55','13’15'].map(tMs),
 G1000:['5’55','6’05','6’15','6’25','6’35','6’45','6’55','7’05','7’15','7’25','7’35','7’45','7’55','8’05','8’15','8’25','8’35','8’45','8’55','9’05','9’15','9’25','9’35','9’55','10’15','10’45','11’15','11’55','12’15'].map(tMs),
 F2000:['13’10','13’30','13’50','14’10','14’30','14’50','15’10','15’30','15’50','16’10','16’30','16’50','17’10','17’30','17’50','18’10','18’30','18’50','19’10','19’50','20’30','21’10','21’50','22’30','23’10','23’50','24’30','25’50','26’30'].map(tMs),
 G2000:['11’50','12’10','12’30','12’50','13’10','13’30','13’50','14’10','14’30','14’50','15’10','15’30','15’50','16’10','16’30','16’50','17’10','17’30','17’50','18’10','18’30','18’50','19’10','19’50','20’30','21’30','22’30','23’50','24’30'].map(tMs),
 /* distance en 3’ : donnée tous les points ; entre deux lignes, répartition régulière (au quart de point le plus proche) */
 D3:{F:[[8,475],[7,430],[6,395],[5,370],[4,340],[3,315],[2,290],[1,265],[0.5,245]],G:[[8,530],[7,480],[6,440],[5,410],[4,380],[3,340],[2,315],[1,285],[0.5,275]]}};
const MCRIT=['Un pied toujours au sol','Bras actifs, coudes à 90°','Buste droit, regard loin'];
const SESS_SM=[
 {id:'s1',n:'S1',t:'Marche · technique et ma vitesse de marche',goal:'je marche sans jamais courir et je mesure ma vitesse de marche sur 3’.',crit:MCRIT,blocks:['mwarm','mtech',['m3','mx','3’ de marche à fond : ma vitesse de marche'],['mpause','en','Récupérer avant les allures'],'mall',['m3','q','3’ avec projet de distance (d’après ma vitesse)']]},
 {id:'s2',n:'S2',t:'Marche · mes trois allures',goal:'je tiens mes allures à 10 m près.',crit:['Allures bien différentes','Même vitesse du début à la fin','Respiration contrôlée'],blocks:['mwarm','mtech','mall',['m3','q','3’ avec projet de distance'],['m1000','k1','1000 m : je découvre mon temps']]},
 {id:'s3',n:'S3',t:'Marche · le 1000 m',goal:'mon 1000 m arrive à 10 s près de mon temps visé.',crit:['Passage au 500 m respecté','Pas de course','Accélère dans le dernier tour'],blocks:['mwarm',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance'],['mpause','en','Récupérer'],'mall']},
 {id:'s4',n:'S4',t:'Marche · fractionné 3 × 3’',goal:'mes trois 3’ sont à 10 m près de ce que j’annonce.',crit:['Récupère en marchant lentement','Annonce réaliste','Technique propre quand c’est dur'],blocks:['mwarm','mtech','mfr',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance']]},
 {id:'s5',n:'S5',t:'Marche · régularité',goal:'mes deux 3’ ont moins de 15 m d’écart.',crit:['Même allure du début à la fin','Écoute les temps de passage','Projet ajusté entre les deux'],blocks:['mwarm',['m3','q','3’ n°1 avec projet'],['mpause','en','Récupérer entre les deux'],['m3','q2','3’ n°2 avec projet'],['mpause','en2','Récupérer'],['m1000','k1','1000 m avec temps visé']]},
 {id:'s6',n:'S6',t:'Marche · épreuve blanche 1000 m / 3’',goal:'je m’échauffe seul et je repars avec ma note et mon point faible.',eval:true,crit:['Échauffement complet','Projet écrit avant de marcher','Départ du 1000 m maîtrisé'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m3','q','C2 · 3’ avec projet de distance'],'mnote','mpf']},
 {id:'s7',n:'S7',t:'Marche · mon point faible et mes projets',goal:'je règle mes projets pour l’épreuve.',crit:['Travail en lien avec son point faible','Annonces tenues','Projets cohérents avec ses chiffres'],blocks:['mwarm','mfr',['m1000','k1','1000 m avec temps visé'],['mpause','en','Récupérer'],['m3','q','3’ avec projet de distance'],'mpe']},
 {id:'s8',n:'S8',t:'Marche · évaluation 1000 m / 3’',goal:'mon 1000 m est régulier et mon 3’ arrive à 5 m de mon projet.',eval:true,crit:['Échauffement seul et complet','Coach précis','Allure gérée sur les deux épreuves'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m3','q','C2 · 3’ avec projet de distance'],'mnote','situe']}
];
const SESS_TM=[
 {id:'t1',n:'T1',t:'Marche · technique et ma vitesse de marche',goal:'je marche sans jamais courir et je mesure ma vitesse de marche sur 3’.',crit:MCRIT,blocks:['mwarm','mtech',['m3','mx','3’ de marche à fond : ma vitesse de marche'],['mpause','en','Récupérer avant les allures'],'mall',['m3','q','3’ avec projet de distance (d’après ma vitesse)']]},
 {id:'t2',n:'T2',t:'Marche · mes trois allures',goal:'je tiens mes allures à 10 m près.',crit:['Allures bien différentes','Même vitesse du début à la fin','Respiration contrôlée'],blocks:['mwarm','mtech','mall',['m3','q','3’ avec projet de distance'],['m1000','k1','1000 m : je découvre mon temps']]},
 {id:'t3',n:'T3',t:'Marche · le 1000 m',goal:'mon 1000 m arrive à 10 s près de mon temps visé.',crit:['Passage au 500 m respecté','Pas de course','Accélère dans le dernier tour'],blocks:['mwarm',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance'],['mpause','en','Récupérer'],'mall']},
 {id:'t4',n:'T4',t:'Marche · fractionné 3 × 3’',goal:'mes trois 3’ sont à 10 m près de ce que j’annonce.',crit:['Récupère en marchant lentement','Annonce réaliste','Technique propre quand c’est dur'],blocks:['mwarm','mtech','mfr',['m1000','k1','1000 m avec temps visé'],['m3','q','3’ avec projet de distance']]},
 {id:'t5',n:'T5',t:'Marche · 2 × 1000 m réguliers',goal:'mes deux 1000 m ont moins de 15 s d’écart.',crit:['Même allure sur les deux 1000 m','Récupération active','Passages au 500 m tenus'],blocks:['mwarm',['m1000','k1','1000 m n°1'],['mpause','en','Récupérer entre les deux'],['m1000','k2','1000 m n°2'],['mpause','en2','Récupérer'],['m3','q','3’ avec projet de distance']]},
 {id:'t6',n:'T6',t:'Marche · nouvelle mesure et projet de 3’',goal:'mon 3’ arrive à 5 m de mon projet.',crit:['Mesure faite à fond','Projet ajusté à la nouvelle vitesse','Fin de 3’ maîtrisée'],blocks:['mwarm',['m3','mx','3’ à fond : nouvelle mesure'],['mpause','en','Récupérer'],['m3','q','3’ avec projet de distance'],['mpause','en2','Récupérer'],['m1000','k1','1000 m avec temps visé']]},
 {id:'t7',n:'T7',t:'Marche · épreuve blanche 2 × 1000 m / 3’',goal:'je connais ma note et le point que je travaille en T8.',eval:true,crit:['Échauffement complet','Stratégie écrite avant chaque épreuve','Faible écart prévu / réalisé'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m1000','w2','C2 · 1000 m'],['mpause','en2','Entre C2 et C3'],['m3','q','C3 · 3’ avec projet de distance'],'mnote','mpf']},
 {id:'t8',n:'T8',t:'Marche · mon point faible et mes projets',goal:'je règle mes projets pour l’épreuve.',crit:['Travail en lien avec son point faible','Annonces tenues','Projets cohérents avec ses chiffres'],blocks:['mwarm','mfr',['m1000','k1','1000 m avec temps visé'],['mpause','en','Récupérer'],['m3','q','3’ avec projet de distance'],'mpe']},
 {id:'t9',n:'T9',t:'Marche · épreuve 2 × 1000 m / 3’',goal:'mes 1000 m sont réguliers et mon 3’ arrive à 5 m de mon projet.',eval:true,crit:['Échauffement seul et complet','Coach précis','Allure gérée sur les trois épreuves'],blocks:['mwarm',['m1000','w1','C1 · 1000 m'],['mpause','en','Entre C1 et C2'],['m1000','w2','C2 · 1000 m'],['mpause','en2','Entre C2 et C3'],['m3','q','C3 · 3’ avec projet de distance'],'mnote','situe']}
];

/* ===== Parcours marche dans l'outil de cycle (écran de cours + Préparer) =====
   Les séances ci-dessus sont COPIÉES des applis demi-fond-eleves / demi-fond-prof
   (donnees.js) : les modifier là-bas, puis recopier ici.
   MARCHE_CAL : pour chaque séance, nombre de blocs de marche placés pendant chaque
   bloc de la classe (dans l'ordre de tl), en suivant l'ordre de la séance de marche. */
const MARCHE_CAL={
 s1:[0,1,2,2,1,0],s2:[1,1,0,1,2,0],s3:[1,1,2,1,0],s4:[1,1,1,2,0],s5:[1,3,2,0,0],s6:[1,0,1,2,0,2],s7:[1,1,1,2,1],s8:[1,0,1,2,0,2],
 t1:[1,2,2,1,0],t2:[1,2,1,1,0],t3:[1,1,1,1,1,0],t4:[1,2,0,2,0],t5:[1,2,2,1,0],t6:[1,2,1,2,0],t7:[1,0,1,2,2,0,2],t8:[1,0,2,2,1],t9:[1,0,1,2,2,0,2]};
const MARCHE_NOM={mwarm:'Échauffement de marche (traitement pris si prescrit, inhalateur sur soi, 10 min de marche de plus en plus vite, chevilles-hanches-épaules, 3 accélérations)',
 mtech:'Technique de marche : le coach coche ce qu’il voit (un pied toujours au sol, déroulé du pied, bras actifs, buste droit, bassin qui tourne)',
 mall:'Mes trois allures : 3 × 2’ à 70, 80 et 90 % de ma vitesse de marche, 1’ de marche lente entre deux (à 10 m près)',
 mfr:'Fractionné 3 × 3’ : j’annonce ma distance, 2’ de marche lente entre deux (à 10 m près)',
 mnote:'Ma note (barème marche)',mpf:'Ce que je travaille ensuite',mpe:'Mes projets pour l’épreuve (temps du 1000 m, distance du 3’)',situe:'Je me situe'};
function marcheNom(b){if(typeof b==='string')return MARCHE_NOM[b]||b;const [ty,k,l]=b;
  if(ty==='m3')return l+(k==='mx'?' (mesure : ma vitesse de marche)':' · 3’, distance relevée au plot');
  if(ty==='m1000')return l+' · 5 tours, passage au 500 m';
  if(ty==='mpause')return l+' : marche lente, boire ; s’il siffle ou tousse, il s’arrête et prévient';return l}
const marcheSeance=id=>SESS_SM.concat(SESS_TM).find(x=>x.id===id);
const mEsc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* blocs de marche placés sur chaque bloc de la classe : [[libellé classe, durée, [blocs marche]], …] */
function marcheCal(s){const m=marcheSeance(s.id),cal=MARCHE_CAL[s.id];if(!m||!cal||!s.tl)return null;let k=0;
  return s.tl.map((t,i)=>{const n=cal[i]||0,L=m.blocks.slice(k,k+n);k+=n;return [t[0],+t[1],L,t[2]]})}
if(typeof document!=='undefined'&&!document.getElementById('st-marche')){const st=document.createElement('style');st.id='st-marche';st.textContent=`
.mch{border:2px solid #0e7490;border-radius:14px;padding:10px 12px;margin:12px 0;background:#ecfeff;color:#14202e}
.mch h2,.mch h3{margin:0 0 6px;color:#0e7490;font-size:1.05em}.mch p{margin:4px 0}.mch ul{margin:4px 0 4px 18px;padding:0}.mch li{margin:2px 0}
.mch table{width:100%;border-collapse:collapse;font-size:.95em;background:#fff}.mch th,.mch td{border:1px solid #b6d9e0;padding:5px 7px;text-align:left;vertical-align:top}
.mch th{background:#cff4fa}.mch td.lib{color:#6b7787;font-style:italic}.mch .ici{background:#fef9c3}.mch details summary{cursor:pointer;font-weight:700;color:#0e7490}
.mch .num{text-align:center;font-variant-numeric:tabular-nums}
:root[data-theme="dark"] .mch{background:#0b2a30;color:#e6edf3;border-color:#22d3ee}:root[data-theme="dark"] .mch table{background:#11161d}
:root[data-theme="dark"] .mch th{background:#164e58}:root[data-theme="dark"] .mch th,:root[data-theme="dark"] .mch td{border-color:#2b5b66}
:root[data-theme="dark"] .mch h2,:root[data-theme="dark"] .mch h3,:root[data-theme="dark"] .mch details summary{color:#67e8f9}:root[data-theme="dark"] .mch .ici{background:#3a3410}
@media print{.mch{break-inside:avoid;background:#fff}}`;document.head.appendChild(st)}
const MARCHE_QUI='Élèves asthmatiques ou avec un avis médical : dans l’appli élève, « Je marche » ; même binôme, même séance, même code du cours.';
/* tableau complet : pendant que la classe fait… / le marcheur fait… (ici = index du bloc de classe à surligner) */
function marcheTableau(s,ici){const C=marcheCal(s),m=marcheSeance(s.id);if(!C)return '';
  return `<p><b>${mEsc(m.n+' · '+m.t.replace(/^Marche · /,''))}</b> — objectif : ${mEsc(m.goal)}</p><table><thead><tr><th>Pendant que la classe fait…</th><th>le marcheur fait…</th></tr></thead><tbody>${C.map(([l,d,L],i)=>`<tr${i===ici?' class="ici"':''}><td>${mEsc(l)} <small>(${d} min)</small></td>${L.length?`<td>${L.map(b=>mEsc(marcheNom(b))).join('<br>')}</td>`:`<td class="lib">${/bilan|carnet|notes/i.test(l)?'carnet avec la classe':'il coache son binôme'}</td>`}</tr>`).join('')}</tbody></table>
  <p style="font-size:.9em">Critères : ${m.crit.map(mEsc).join(' · ')}. Marche dans les couloirs 3 et 4 pendant que les autres courent.</p>`}
/* encadré du bloc en cours (écran de cours) */
function marcheBloc(s,cle,idx){const C=marcheCal(s);if(!C)return '';let i=C.findIndex(x=>x[3]===cle);if(i<0)i=idx;const r=C[i];if(!r)return '';
  const now=r[2].length?`<ul>${r[2].map(b=>`<li>${mEsc(marcheNom(b))}</li>`).join('')}</ul>`:`<p>${/bilan|carnet|notes/i.test(r[0])?'Carnet avec la classe.':'Pas de bloc de marche : il coache son binôme.'}</p>`;
  return `<div class="boite mch"><h2>🚶 Parcours marche · pendant ce bloc</h2>${now}<details><summary>Toute la séance de marche</summary>${marcheTableau(s,i)}</details></div>`}
/* barème (CCF 2021, épreuve du lycée « marche fractionnée adaptée ») */
const mT=s=>Math.floor(s/60)+'’'+String(s%60).padStart(2,'0');
function marcheBareme(c){const T=c==='t',nf=n=>String(n).replace('.',',');
  const lignes=BARM.notes.map((n,i)=>`<tr><td class="num"><b>${nf(n)}</b></td>${T?`<td class="num">${mT(BARM.F2000[i])}</td><td class="num">${mT(BARM.G2000[i])}</td>`:`<td class="num">${mT(BARM.F1000[i])}</td><td class="num">${mT(BARM.G1000[i])}</td>`}</tr>`).join('');
  const d3=BARM.D3.F.map((x,i)=>`<tr><td class="num"><b>${nf(x[0])}</b></td><td class="num">${x[1]} m</td><td class="num">${BARM.D3.G[i][1]} m</td></tr>`).join('');
  return `<div class="mch"><h3>Barème marche · ${T?'Terminale : 2 × 1000 m + 3’':'Seconde : 1 × 1000 m + 3’'}</h3>
  <p>AFL1 sur 12 = performance /8 (moyenne de la note ${T?'des deux 1000 m (temps cumulé)':'du 1000 m'} et de la note du 3’) + projet de distance du 3’ /4.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px">
  <table><thead><tr><th>Note /8</th><th>Filles ${T?'2 × 1000':'1000 m'}</th><th>Garçons ${T?'2 × 1000':'1000 m'}</th></tr></thead><tbody>${lignes}</tbody></table>
  <div><table><thead><tr><th>Note /8</th><th>Filles 3’</th><th>Garçons 3’</th></tr></thead><tbody>${d3}</tbody></table>
  <p style="font-size:.9em">Entre deux lignes du 3’ : note répartie régulièrement, au quart de point.</p>
  <table style="margin-top:8px"><thead><tr><th>Projet du 3’ : écart réalisé − annoncé</th><th>/4</th></tr></thead><tbody>
  <tr><td>± 5 m</td><td class="num">4</td></tr><tr><td>+6 à +15 m</td><td class="num">3</td></tr><tr><td>plus de +15 m, ou −6 à −15 m</td><td class="num">2</td></tr><tr><td>−16 à −25 m</td><td class="num">1</td></tr><tr><td>moins de −25 m</td><td class="num">0</td></tr></tbody></table></div></div>
  <p style="font-size:.9em">Temps au-delà de la dernière ligne : 0. Le temps doit être inférieur ou égal à la valeur de la ligne.</p></div>`}
/* outil complet « Parcours marche » */
function marcheOutil(c){const T=c==='t',L=T?SESS_TM:SESS_SM,S=T?T_SESSIONS:SESSIONS;
  return `<div class="mch"><h3>Qui, et comment</h3><p>${mEsc(MARCHE_QUI)}</p><ul>
  <li><b>Règle de marche</b> : un pied toujours au sol ; dès qu’il y a une phase de vol, c’est de la course. Le coach le signale tout de suite.</li>
  <li><b>Sécurité</b> : traitement pris si prescrit, inhalateur sur soi ; couloirs 3 et 4 pendant que les autres courent ; s’il siffle, tousse ou se sent « gêné pour respirer », il s’arrête et prévient.</li>
  <li><b>Le binôme</b> : quand son binôme court, le marcheur le coache ; il fait ses blocs de marche pendant les récupérations et les exercices en alternance de la classe.</li>
  <li><b>Les jours d’épreuve</b> (${T?'T7, T9':'S6, S8'}) : son 1000 m tombe pendant C1, quand son binôme court aussi : <b>le professeur ou un autre élève le chronomètre</b>.</li>
  <li><b>Épreuve</b> : ${T?'C1 · 1000 m, C2 · 1000 m, C3 · 3’ avec projet de distance':'C1 · 1000 m, C2 · 3’ avec projet de distance'} ; temps et distances notés dans l’appli élève, la note se calcule toute seule.</li></ul></div>
  ${marcheBareme(c)}
  <div class="mch"><h3>Les ${L.length} séances de marche (${T?'Terminale':'Seconde'})</h3>${S.map(s=>`<details><summary>${mEsc(s.n)} · ${mEsc((marcheSeance(s.id)||{}).t||'')}</summary>${marcheTableau(s,-1)}</details>`).join('')}</div>`}
