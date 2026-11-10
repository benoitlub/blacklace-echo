export function installNavigation(root,reduced,getPhase,setPhase){
const fullscreenButton=document.querySelector('#fullscreen-toggle');
function updateFullscreenButton(){
  const enabled=document.fullscreenElement===root;
  fullscreenButton.textContent=enabled?'⤢':'⛶';
  fullscreenButton.setAttribute('aria-pressed',String(enabled));
  fullscreenButton.setAttribute('aria-label',enabled?'Quitter le plein écran':'Activer le plein écran');
  fullscreenButton.title=enabled?'Quitter le plein écran':'Plein écran';
}
fullscreenButton.addEventListener('click',async()=>{
  try{
    if(document.fullscreenElement){await document.exitFullscreen()}
    else if(root.requestFullscreen){await root.requestFullscreen()}
    else{fullscreenButton.title='Plein écran non disponible dans ce navigateur';fullscreenButton.setAttribute('aria-label','Plein écran indisponible')}
  }catch(e){fullscreenButton.title='Plein écran refusé par le navigateur'}
});
document.addEventListener('fullscreenchange',updateFullscreenButton);
const trackingButton=document.querySelector('#tracking-toggle');
let tracking=false,orientationBase=null;
function clampUnit(n){return Math.max(-1,Math.min(1,n))}
function orientationMove(event){
  if(!tracking||getPhase()==='crossing'||reduced.matches)return;
  if(!Number.isFinite(event.gamma)||!Number.isFinite(event.beta))return;
  if(!orientationBase)orientationBase={gamma:event.gamma,beta:event.beta};
  root.style.setProperty('--hx',String(clampUnit((event.gamma-orientationBase.gamma)/20)));
  root.style.setProperty('--hy',String(clampUnit((event.beta-orientationBase.beta)/25)));
}
trackingButton.addEventListener('click',async()=>{
  if(tracking){tracking=false;window.removeEventListener('deviceorientation',orientationMove);orientationBase=null;root.style.setProperty('--hx','0');root.style.setProperty('--hy','0');trackingButton.setAttribute('aria-pressed','false');trackingButton.textContent='◉ Perspective';return}
  if(!('DeviceOrientationEvent' in window)){trackingButton.title='Capteur de mouvement indisponible';return}
  try{
    if(typeof DeviceOrientationEvent.requestPermission==='function'){
      const permission=await DeviceOrientationEvent.requestPermission();
      if(permission!=='granted')return;
    }
    orientationBase=null;tracking=true;
    window.addEventListener('deviceorientation',orientationMove);
    trackingButton.setAttribute('aria-pressed','true');
    trackingButton.textContent='◉ Perspective active';
  }catch(e){trackingButton.title='Autorisation du capteur refusée'}
});
document.querySelectorAll('.landmark').forEach(button=>button.addEventListener('click',()=>{
  if(getPhase()!=='explore')return;
  const destination=button.dataset.destination;
  document.querySelector('#travel-title').textContent=button.dataset.title;
  if(['institute','rotas'].includes(button.dataset.place) && document.fullscreenElement===root){
    // Keep the same fullscreen document alive: navigation would end browser fullscreen.
    const portal=document.querySelector('#institute-portal');
    const frame=document.querySelector('#institute-frame');
    frame.title=button.dataset.title;
    portal.setAttribute('aria-label',button.dataset.title);
    frame.src=destination;
    portal.hidden=false;
    return;
  }
  if(reduced.matches){window.location.assign(destination);return}
  setPhase('transition');
  setTimeout(()=>window.location.assign(destination),1700);
}));
const immersiveFrame=document.querySelector('#institute-frame');
immersiveFrame.addEventListener('load',()=>{
  try{
    const inner=immersiveFrame.contentDocument;
    if(!inner)return;
    // The embedded scenes already expose their own return to the harbour.
    document.querySelector('#institute-return').hidden=!!inner.querySelector('a[href$="port/"]');
    inner.addEventListener('click',event=>{
      const link=event.target.closest?.('a[href]');
      if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target==='_blank')return;
      const url=new URL(link.href,inner.baseURI);
      if(url.origin!==location.origin)return;
      const base=new URL('../',location.href).pathname;
      const path=url.pathname;
      if(path===base+'port/' || path===base+'port'){
        event.preventDefault();
        document.querySelector('#institute-return').click();
      }else if(path===base+'rotas/' || path===base+'rotas' || path===base+'feuch-institute/' || path===base+'feuch-institute' || (path===base+'map' && url.searchParams.get('place')==='rotas')){
        event.preventDefault();
        immersiveFrame.src=url.href;
      }
    },true);
  }catch(e){/* External destinations retain normal navigation. */}
});
document.querySelector('#institute-return').addEventListener('click',()=>{
  const portal=document.querySelector('#institute-portal');
  portal.hidden=true;
  document.querySelector('#institute-frame').removeAttribute('src');
});

}
