import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
mkdirSync('artifacts',{recursive:true});
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const base=process.env.SEUIL_URL || 'http://127.0.0.1:8080/blacklace-echo/port/';
for(const [name,width,height,reduced] of [['desktop',1440,900,false],['android',393,851,false],['landscape',851,393,false],['reduced',375,667,true]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:name!=='desktop',hasTouch:name!=='desktop',reducedMotion:reduced?'reduce':'no-preference'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForTimeout(1500);
 const loaded=await page.locator('#fallback-title').evaluate(e=>e.hidden);
 if(!reduced)assert.ok(loaded,`${name}: 3D ready`);
 await page.screenshot({path:`artifacts/seuil-${name}-quay.png`});
 await page.locator('#enter').click();
 if(!reduced){assert.equal(await page.locator('#port').getAttribute('data-phase'),'crossing');await page.waitForTimeout(3500);await page.screenshot({path:`artifacts/seuil-${name}-crossing.png`});}
 await page.waitForFunction(()=>document.querySelector('#port').dataset.phase==='welcome',null,{timeout:12000});
 for(let i=0;i<3;i++){
  for(const selector of ['#next','#explore','#night-toggle']){
   const box=await page.locator(selector).boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1,`${name} ${selector} on screen`);
  }
  await page.waitForTimeout(750);await page.screenshot({path:`artifacts/seuil-${name}-welcome-${i}.png`});await page.locator('#next').click();
 }
 assert.equal(await page.locator('#port').getAttribute('data-phase'),'explore');
 await page.locator('#night-toggle').click();assert.equal(await page.locator('#port').getAttribute('data-night'),'true');
 await page.screenshot({path:`artifacts/seuil-${name}-explore.png`});
 await page.locator('[data-place="rotas"]').click();await page.waitForURL('**/map?place=rotas');await page.waitForTimeout(1300);
 await page.locator('.rotas-visit').waitFor();
 await page.waitForFunction(()=>{const img=document.querySelector('.rv-scene');return img?.complete&&img.naturalWidth>0;});
 await page.goto(base);await page.locator('#skip').click();assert.equal(await page.locator('#port').getAttribute('data-phase'),'welcome');await page.locator('#explore').click();
 await page.locator('[data-place="institute"]').click();await page.waitForURL('**/feuch-institute/');
 assert.equal(errors.length,0,errors.join('\n'));console.log(`PASS ${name}: crossing, 3 lines, controls, night, skip, Rotas, Institute`);await context.close();
}
await browser.close();
