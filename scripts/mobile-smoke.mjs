import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const require = createRequire('/tmp/qa-playwright/package.json');
const { chromium } = require('playwright');
const target = 'http://127.0.0.1:4173/blacklace-echo/map';
let ready = false;
for (let attempt = 0; attempt < 120; attempt++) {
  try { if ((await fetch(target)).ok()) { ready = true; break; } } catch {}
  await new Promise(resolve => setTimeout(resolve, 250));
}
if (!ready) throw new Error('Built application did not start');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(target,{waitUntil:'networkidle'});
  if (!response?.ok()) throw new Error('Page failed to load');
  const visible = await page.locator('body').innerText();
  if (visible.trim().length < 50 || !/Blacklace|Sherlock/i.test(visible)) throw new Error('Application content missing');
  if (errors.length) throw new Error('Runtime errors: '+errors.join('; '));
  const width = await page.evaluate(()=>document.documentElement.scrollWidth);
  if(width > 405) throw new Error('Horizontal overflow: '+width);
  await mkdir('qa-output',{recursive:true});
  await page.screenshot({path:'qa-output/mobile.png',fullPage:true});
  console.log('Built application mobile smoke passed');
} finally { await browser.close(); }
