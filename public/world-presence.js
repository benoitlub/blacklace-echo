/* Shared read-only view of Sherlock's verified public world projection.
   Never simulates movement or meetings; Octopus/Sherlock remain authoritative. */
(()=>{'use strict';
const el=document.querySelector('[data-world-presence]');
if(!el)return;
const place=el.getAttribute('data-world-presence');
const url=window.BLACKLACE_SHERLOCK_PUBLIC_FEED_URL;
const names={'marie-jeanne':'Marie Jeanne',natasha:'Natasha',marty:'Marty',slobodane:'Slobodane',lolo:'Lolo',nikolas:'Nikolas',ludmila:'Ludmila',max:'Max',lili:'Lili'};
const clean=s=>typeof s==='string'&&s.length>0&&s.length<=80;
const dialogueTarget=document.querySelector('[data-live-dialogue]');
const dialogueName=document.querySelector('[data-live-speaker]');
const dialogueBox=document.querySelector('[data-live-dialogue-box]');
const seenTurns=new Set();let queued=[];let speaking=false;
function playNext(){if(speaking||!queued.length||!dialogueTarget)return;
 const turn=queued.shift();speaking=true;
 dialogueTarget.textContent=turn.text;
 if(dialogueName)dialogueName.textContent=(names[turn.speaker]||turn.speaker).toUpperCase();
 if(dialogueBox)dialogueBox.hidden=false;
 setTimeout(()=>{speaking=false;playNext()},Math.max(4200,Math.min(11000,turn.text.length*75)));
}
const line=document.createElement('p');line.setAttribute('aria-live','polite');el.append(line);
if(!url){line.textContent='SHERLOCK · Flux non configuré — aucune présence simulée';return}
let last='',timer;
async function refresh(){
 try{
  const response=await fetch(url,{credentials:'omit',cache:'no-store'});
  if(!response.ok)throw Error('offline');
  const payload=await response.json();
  if(!Array.isArray(payload.entries))throw Error('invalid');
  const dialogueEntries=Array.isArray(payload.dialogues)?payload.dialogues.filter(d=>
   d&&clean(d.id)&&Number.isSafeInteger(d.cycle)&&d.cycle>=1&&d.place===place&&clean(d.speaker)&&
   typeof d.text==='string'&&d.text.trim().length>0&&d.text.length<=600).slice(-24):[];
  // First successful poll establishes baseline; only subsequently verified new turns are spoken.
  if(!window.__blacklaceDialogueReady){dialogueEntries.forEach(d=>seenTurns.add(d.id));window.__blacklaceDialogueReady=true}
  else {const fresh=dialogueEntries.filter(d=>!seenTurns.has(d.id));fresh.forEach(d=>seenTurns.add(d.id));queued.push(...fresh);playNext()}
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