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

/* Opt-in head-coupled window perspective. Frames stay on the device.
   MediaPipe is lazy-loaded only after an explicit user click. */
const faceButton=document.querySelector('#face-toggle');
let faceStream=null,faceVideo=null,faceLandmarker=null,faceFrame=0,faceActive=false;
let faceNeutral=null,faceX=0,faceY=0,lastFaceSample=0;
function stopFace(){
  faceActive=false;cancelAnimationFrame(faceFrame);
  faceStream?.getTracks().forEach(track=>track.stop());
  faceStream=null;faceVideo?.remove();faceVideo=null;faceNeutral=null;
  root.style.setProperty('--hx','0');root.style.setProperty('--hy','0');
  faceButton.setAttribute('aria-pressed','false');faceButton.textContent='◎ Visage';
}
async function startFace(){
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Caméra indisponible');
  faceStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:320},height:{ideal:240}},audio:false});
  faceVideo=document.createElement('video');
  faceVideo.muted=true;faceVideo.playsInline=true;faceVideo.srcObject=faceStream;
  await faceVideo.play();
  const vision=await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm');
  const files=await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
  faceLandmarker=await vision.FaceLandmarker.createFromOptions(files,{
    baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',delegate:'CPU'},
    runningMode:'VIDEO',numFaces:1
  });
  faceActive=true;faceNeutral=null;faceX=0;faceY=0;
  faceButton.setAttribute('aria-pressed','true');faceButton.textContent='◎ Visage actif';
  const sample=(now)=>{
    if(!faceActive)return;
    if(!reduced.matches&&getPhase()!=='crossing'&&now-lastFaceSample>90&&faceVideo.readyState>=2){
      lastFaceSample=now;
      const marks=faceLandmarker.detectForVideo(faceVideo,now).faceLandmarks?.[0];
      if(marks){
        // Face midpoint relative to the front camera; mirror x for natural window motion.
        const point=marks[1]||marks[4]||marks[0];
        if(!faceNeutral)faceNeutral={x:point.x,y:point.y};
        const tx=clampUnit((point.x-faceNeutral.x)*5)*.75;
        const ty=clampUnit((point.y-faceNeutral.y)*5)*.75;
        faceX+=(tx-faceX)*.18;faceY+=(ty-faceY)*.18;
        root.style.setProperty('--hx',String(faceX));
        root.style.setProperty('--hy',String(faceY));
      }
    }
    faceFrame=requestAnimationFrame(sample);
  };
  faceFrame=requestAnimationFrame(sample);
}
faceButton?.addEventListener('click',async()=>{
  if(faceActive){stopFace();return}
  faceButton.disabled=true;faceButton.textContent='◎ Chargement…';
  try{
    // Orientation and face tracking must not compete for the same CSS variables.
    if(tracking)trackingButton.click();
    await startFace();
  }catch(error){
    stopFace();faceButton.title='Suivi facial indisponible : utiliser le tactile ou Perspective';
    console.warn('Suivi facial non activé',error);
  }finally{faceButton.disabled=false}
});
window.addEventListener('pagehide',stopFace);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&faceActive)stopFace()});

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
