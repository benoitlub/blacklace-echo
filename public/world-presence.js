/* Shared read-only view of Sherlock's verified public world projection.
   Never simulates movement or meetings; Octopus/Sherlock remain authoritative. */
(()=>{'use strict';
const el=document.querySelector('[data-world-presence]');
if(!el)return;
const place=el.getAttribute('data-world-presence');
const url=window.BLACKLACE_SHERLOCK_PUBLIC_FEED_URL;
const names={'marie-jeanne':'Marie Jeanne',natasha:'Natasha',marty:'Marty',slobodane:'Slobodane',lolo:'Lolo',nikolas:'Nikolas',ludmila:'Ludmila',max:'Max',lili:'Lili'};
const clean=s=>typeof s==='string'&&s.length>0&&s.length<=80;
const line=document.createElement('p');line.setAttribute('aria-live','polite');el.append(line);
if(!url){line.textContent='SHERLOCK · Flux non configuré — aucune présence simulée';return}
let last='',timer;
async function refresh(){
 try{
  const response=await fetch(url,{credentials:'omit',cache:'no-store'});
  if(!response.ok)throw Error('offline');
  const payload=await response.json();
  if(!Array.isArray(payload.entries))throw Error('invalid');
  const entries=payload.entries.filter(e=>{
   if(!e||!Number.isSafeInteger(e.cycle)||e.cycle<1||!clean(e.id))return false;
   const parts=e.id.split(':');
   if(!((parts.length===2&&parts[0]===String(e.cycle)&&/^[1-9][0-9]*$/.test(parts[1]))||(parts.length===3&&parts[0]==='presence'&&parts[1]===String(e.cycle)&&clean(parts[2]))))return false;
   if(e.kind==='moved')return clean(e.actor)&&clean(e.from)&&clean(e.to)&&e.from!==e.to;
   if(e.kind==='waited')return clean(e.actor)&&clean(e.place);
   if(e.kind==='met')return Array.isArray(e.actors)&&e.actors.length===2&&e.actors.every(clean)&&e.actors[0]!==e.actors[1]&&clean(e.place);
   return false;
  }).slice(-20);
  const relevant=entries.filter(e=>e.kind==='moved'?e.to===place||e.from===place:e.place===place);
  const e=relevant.at(-1);
  const next=e?(e.kind==='met'?((names[e.actors[0]]||e.actors[0])+' rencontre '+(names[e.actors[1]]||e.actors[1])):(names[e.actor]||e.actor)+(e.kind==='moved'?(e.to===place?' arrive':' repart'):' est ici')):'Aucun événement récent vérifié dans ce lieu';
  if(next!==last){line.textContent='SHERLOCK · '+next;last=next}
 }catch{line.textContent='SHERLOCK · Signal indisponible — aucune présence inventée'}
}
refresh();timer=setInterval(refresh,15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();