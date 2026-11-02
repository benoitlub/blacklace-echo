import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire('/tmp/qa-playwright/package.json');
const { chromium } = require('playwright');
const target = 'http://127.0.0.1:4173/blacklace-echo/map';
let ready = false;
for (let attempt = 0; attempt < 120; attempt++) {
  try { if ((await fetch(new URL('./', target), {headers:{Accept:'text/html'}})).ok()) { ready = true; break; } } catch {}
  await new Promise(resolve => setTimeout(resolve, 250));
}
assert.ok(ready, 'Built application did not start');
await mkdir('qa-output',{recursive:true});
const browser = await chromium.launch({ headless: true });
try {
  for (const device of [{name:'mobile',width:390,height:844,touch:true},{name:'desktop',width:1440,height:900,touch:false},{name:'landscape',width:844,height:390,touch:true}]) {
    const page = await browser.newPage({viewport:{width:device.width,height:device.height},hasTouch:device.touch,deviceScaleFactor:1,reducedMotion:'reduce'});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      const response = await page.goto(target,{waitUntil:'networkidle'});
      assert.ok(response?.ok(), 'Page failed to load');
      await page.getByRole('button',{name:'ROTAS',exact:true}).click();
      const visit = page.getByRole('dialog',{name:'La place de Rotas'});
      await visit.waitFor();
      await page.waitForFunction(()=>document.querySelector('.rv-scene')?.complete && document.querySelector('.rv-scene')?.naturalWidth > 0);
      assert.equal(await page.locator('main.map-page').evaluate(el=>el.inert),true,'Background must be inert');
      await page.screenshot({path:`qa-output/rotas-${device.name}.png`});
      const actions = page.locator('.rv-place-actions');
      await actions.getByRole('button',{name:'Fontaine centrale'}).click();
      assert.match(await page.locator('.rv-note').innerText(),/Fontaine centrale/);
      assert.match(await page.locator('.rv-camera output').innerText(),/165/);
      await page.getByRole('button',{name:'Fermer le détail',exact:true}).click();
      await page.getByRole('button',{name:'Recentrer la vue',exact:true}).click();
      for (let i=0;i<8;i++) {
        const button=page.getByRole('button',{name:'Zoom avant',exact:true});
        if(await button.isEnabled()) await button.click();
      }
      assert.match(await page.locator('.rv-camera output').innerText(),/250/);
      assert.equal(await page.getByRole('button',{name:'Zoom avant',exact:true}).isDisabled(),true);
      const viewport = page.locator('.rv-viewport');
      await viewport.focus(); await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight');
      const transform = await page.locator('.rv-canvas').evaluate(el=>el.style.transform);
      await page.keyboard.press('ArrowLeft');
      if(device.name==='mobile') assert.notEqual(await page.locator('.rv-canvas').evaluate(el=>el.style.transform),transform,'Keyboard pan must move the camera');
      for (const [label,file,title] of [['Salon de thé','tea','Les terrasses du thé'],['Marché','market','La rue du marché'],['Escaliers','stairs','Les escaliers fleuris'],['La côte','coast','Le passage de la côte'],['Boutiques','shop','La rue des boutiques'],['La place','square','La place de Rotas']]) {
        await page.getByRole('navigation',{name:'Étapes de la promenade'}).getByRole('button',{name:label,exact:true}).click();
        await page.getByRole('heading',{name:title,exact:true}).waitFor();
        await page.waitForFunction(file=>{const img=document.querySelector('.rv-scene');return img?.src.endsWith('/'+file+'.webp')&&img.complete&&img.naturalWidth>0;},file);
        assert.equal(await page.locator('.rv-note').count(),0);
        if(device.name==='mobile') await page.screenshot({path:`qa-output/rotas-${file}-mobile.png`});
      }
      // Touch/pointer dragging moves the cover image, with no exposed blank edge.
      await page.mouse.move(device.width * .3, device.height * .35);
      await page.mouse.down(); await page.mouse.move(device.width * .4, device.height * .35,{steps:5}); await page.mouse.up();
      if(device.name==='mobile') {
        const cdp=await page.context().newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:110,y:250,id:1},{x:200,y:250,id:2}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:70,y:250,id:1},{x:260,y:250,id:2}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert.ok(parseInt(await page.locator('.rv-camera output').innerText())>100,'Pinch must increase zoom');
        await cdp.detach();
      }
      // Click the selected scene again: loading must not get stuck.
      await page.getByRole('navigation',{name:'Étapes de la promenade'}).getByRole('button',{name:'La place',exact:true}).click();
      assert.equal(await page.locator('.rv-image-status').count(),0);
      await page.getByRole('button',{name:'☾ Soir',exact:true}).click();
      assert.equal(await page.getByRole('button',{name:'☀ Jour',exact:true}).getAttribute('aria-pressed'),'true');
      await page.getByRole('button',{name:/Habitants ·/}).click();
      await page.locator('.rv-note').waitFor();
      assert.match(await page.locator('.rv-note').innerText(),/SHERLOCK/);
      await page.keyboard.press('Escape');
      await page.screenshot({path:`qa-output/rotas-evening-${device.name}.png`});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1),'Horizontal page overflow');
      await page.getByRole('button',{name:'← HoloMap',exact:true}).click();
      await page.waitForTimeout(1400);
      assert.equal(await page.locator('.rotas-visit').count(),0,'Returning must cancel delayed arrival');
      assert.equal(await page.locator('main.map-page').evaluate(el=>el.inert),false);
      assert.deepEqual(errors,[],'Browser runtime errors');
      console.log(`Rotas ${device.name}: scene navigation, images, zoom, keyboard, residents, return passed`);
    } catch(error) {
      await page.screenshot({path:`qa-output/failure-${device.name}.png`,fullPage:true});
      throw error;
    } finally { await page.close(); }
  }
} finally { await browser.close(); }
