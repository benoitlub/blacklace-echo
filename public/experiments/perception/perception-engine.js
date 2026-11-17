/**
 * Blacklace Perception Engine v0.1 — additive visual layer.
 * Does not modify the scene manifest, positions, or approved camera state.
 * Works with any scene root and optional paired normal/altered layers.
 */
export const DEFAULT_PROFILES = Object.freeze({
  feuch: {saturation:1.6,hue:12,contrast:1.08,warp:0.12,glow:0.28},
  fee_belette: {saturation:1.3,hue:48,contrast:1.12,warp:0.42,glow:0.18},
  aloisia: {saturation:1.35,hue:110,contrast:1.15,warp:0.32,glow:0.48}
});
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(+v)?+v:0));
export function createPerceptionEngine(root,{profiles=DEFAULT_PROFILES,reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false}={}){
  if(!(root instanceof Element))throw new TypeError('A scene root Element is required');
  const state=new Map();
  const altered=[...root.querySelectorAll('[data-perception-variant]')];
  const originalStyle=new Map(altered.map(el=>[el,{opacity:el.style.opacity,filter:el.style.filter,transform:el.style.transform}]));
  const overlay=document.createElement('div');
  overlay.setAttribute('aria-hidden','true');
  overlay.dataset.blacklacePerception='overlay';
  Object.assign(overlay.style,{position:'absolute',inset:'0',pointerEvents:'none',zIndex:'2147483000',opacity:'0',mixBlendMode:'screen',background:'radial-gradient(ellipse at 65% 45%,rgba(206,58,255,.26),transparent 65%),radial-gradient(ellipse at 25% 65%,rgba(30,240,205,.2),transparent 65%)',transition:'opacity 700ms ease',contain:'paint'});
  const previousPosition=root.style.position;
  if(getComputedStyle(root).position==='static')root.style.position='relative';
  root.append(overlay);
  let raf=0, start=performance.now(), alive=true;
  const tick=now=>{
    if(!alive)return;
    const strength=Math.min(1,[...state.values()].reduce((a,b)=>a+b,0));
    const weighted={saturation:1,hue:0,contrast:1,warp:0,glow:0};
    for(const [key,intensity] of state){
      const p=profiles[key];if(!p)continue;
      weighted.saturation+=(p.saturation-1)*intensity;
      weighted.hue+=p.hue*intensity;
      weighted.contrast+=(p.contrast-1)*intensity;
      weighted.warp+=p.warp*intensity;
      weighted.glow+=p.glow*intensity;
    }
    const phase=reducedMotion?0:(now-start)/1100;
    const wobble=reducedMotion?0:Math.sin(phase)*Math.min(4,weighted.warp*5);
    overlay.style.opacity=String(clamp(weighted.glow+strength*.08));
    overlay.style.filter='hue-rotate('+weighted.hue.toFixed(1)+'deg) saturate('+weighted.saturation.toFixed(2)+')';
    for(const el of altered){
      const key=el.dataset.perceptionVariant;
      const value=key==='all'?strength:(state.get(key)||0);
      el.style.opacity=String(clamp(value));
      el.style.filter='saturate('+weighted.saturation.toFixed(2)+') contrast('+weighted.contrast.toFixed(2)+') hue-rotate('+weighted.hue.toFixed(1)+'deg)';
      // A transform on a layer used by parallax would collide with its camera transform.
      // Only alter children explicitly tagged as effect surfaces.
      const surface=el.querySelector('[data-perception-warp]');
      if(surface)surface.style.transform='translate3d('+wobble.toFixed(2)+'px,0,0) scale('+(1+Math.min(.04,weighted.warp*.02)).toFixed(3)+')';
    }
    raf=requestAnimationFrame(tick);
  };
  raf=requestAnimationFrame(tick);
  return {
    setInfluence(name,intensity){if(!Object.hasOwn(profiles,name))throw new Error('Unknown influence: '+name);const v=clamp(intensity);if(v)state.set(name,v);else state.delete(name);return v},
    getInfluences(){return Object.fromEntries(state)},
    clear(){state.clear()},
    destroy(){alive=false;cancelAnimationFrame(raf);overlay.remove();for(const [el,old] of originalStyle){el.style.opacity=old.opacity;el.style.filter=old.filter;el.style.transform=old.transform;const surface=el.querySelector('[data-perception-warp]');if(surface)surface.style.transform=''}root.style.position=previousPosition}
  };
}
