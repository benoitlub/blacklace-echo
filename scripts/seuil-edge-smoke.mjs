import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),args:['--no-sandbox','--enable-unsafe-swiftshader']});
const base='http://127.0.0.1:4173/blacklace-echo/port/';
const page=await browser.newPage({viewport:{width:393,height:851},hasTouch:true,isMobile:true});
await page.goto(base);await page.waitForFunction(()=>document.querySelector('#fallback-title').hidden);
await page.locator('#enter').click();await page.locator('.port-tools summary').click();await page.locator('#skip').click();
await page.waitForTimeout(8500);assert.equal(await page.locator('#port').getAttribute('data-phase'),'welcome');
await page.locator('#explore').click();
await page.locator('.port-tools summary').click();await page.locator('#sound-toggle').click();assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'true');await page.locator('#sound-toggle').click();assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'false');
await page.locator('#fullscreen-toggle').click();
if(await page.evaluate(()=>!!document.fullscreenElement)){
 await page.locator('[data-place="institute"]').click();await page.locator('#institute-frame').contentFrame().locator('body').waitFor();
 assert.ok(await page.evaluate(()=>!!document.fullscreenElement));await page.locator('#institute-frame').contentFrame().getByRole('link',{name:'Port',exact:true}).click();assert.ok(await page.locator('#institute-portal').isHidden());
}
await page.goto(base);await page.waitForFunction(()=>document.querySelector('#fallback-title').hidden);
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#enter').click();assert.equal(await page.locator('#port').getAttribute('data-phase'),'welcome');
const fallback=await browser.newPage();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.startsWith('webgl'))return null;return original.call(this,type,...args);};});
await fallback.goto(base);await fallback.locator('#enter').click();assert.equal(await fallback.locator('#port').getAttribute('data-phase'),'welcome');
console.log('PASS: skip mid-crossing stays skipped; sound toggles; fullscreen portal; dynamic reduced-motion; WebGL unavailable');
await browser.close();
