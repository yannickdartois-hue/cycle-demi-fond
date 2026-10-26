/* Hors ligne : l'appli est gardée sur l'appareil à la première ouverture avec internet,
   puis s'ouvre sans connexion. La page est rechargée depuis GitHub dès que le réseau répond (3 s max) ;
   les autres fichiers sont servis depuis l'appareil et mis à jour en arrière-plan. */
const CACHE='cycle-demi-fond-v11';
// Toutes les applis partagent le même stockage (même adresse github.io) : on n'efface QUE les anciennes versions de CETTE appli.
const MES_CACHES=/^(?:cycle\-demi\-fond\-v)\d+$/;

const SHELL=["demi-fond-donnees.js", "cycle-demi-fond-old.html", "polices/archivo.woff2", "polices/atkinson-400.woff2", "polices/atkinson-700.woff2", "eps-design.css", "eps-outil.css", "ecran.css", "ecran.js", "eps-commun.js", './','index.html','manifest.webmanifest','icon-32.png','icon-180.png','icon-192.png','icon-512.png'];
const FILES=["pdf/2de-DemiFond-S1.pdf", "pdf/2de-DemiFond-S2.pdf", "pdf/2de-DemiFond-S3.pdf", "pdf/2de-DemiFond-S4.pdf", "pdf/2de-DemiFond-S5.pdf", "pdf/2de-DemiFond-S6.pdf", "pdf/2de-DemiFond-S7.pdf", "pdf/2de-DemiFond-S8.pdf", "pdf/Banque-situations.pdf", "pdf/Cycle-DemiFond-Seconde.pdf", "pdf/Cycle-DemiFond-Terminale.pdf", "pdf/Echauffement-autonome.pdf", "pdf/Evaluation-bareme-Seconde.pdf", "pdf/Evaluation-bareme-Terminale.pdf", "pdf/Fiche-roles-AFL3.pdf", "pdf/Tableaux-allures.pdf", "pdf/Tle-DemiFond-T1.pdf", "pdf/Tle-DemiFond-T2.pdf", "pdf/Tle-DemiFond-T3.pdf", "pdf/Tle-DemiFond-T4.pdf", "pdf/Tle-DemiFond-T5.pdf", "pdf/Tle-DemiFond-T6.pdf", "pdf/Tle-DemiFond-T7.pdf", "pdf/Tle-DemiFond-T8.pdf", "pdf/Tle-DemiFond-T9.pdf"];
const CDN=/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|cdn\.tailwindcss\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);
  await Promise.all(SHELL.concat(FILES).map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})));self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(MES_CACHES.test(k)&&k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(r.mode==='navigate'&&u.origin===location.origin){e.respondWith((async()=>{const c=await caches.open(CACHE);const K=(/\/(index\.html)?$/.test(u.pathname))?'index.html':r;
    try{const net=await Promise.race([fetch(r),new Promise((_,no)=>setTimeout(no,3000))]);if(net&&net.ok){c.put(K,net.clone());return net}throw 0}
    catch(x){return (await c.match(K))||(await c.match('index.html'))||(await c.match('./'))||fetch(r)}})());return}
  if(u.origin===location.origin||CDN.test(u.hostname)){e.respondWith((async()=>{const c=await caches.open(CACHE);
    const hit=await c.match(r,{ignoreSearch:u.origin===location.origin});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||Response.error()})())}
});
