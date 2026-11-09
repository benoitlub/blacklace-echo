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
if(!url)return;
let timer;
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

 }catch{/* Keep dialogue silent when the verified feed is unavailable. */}
}
refresh();timer=setInterval(refresh,15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();