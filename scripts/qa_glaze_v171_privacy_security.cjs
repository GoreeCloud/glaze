#!/usr/bin/env node
/* Development-preview privacy/security regression. Synthetic browser evidence only;
   this does not qualify real providers, devices, privacy or security release lanes. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const puppeteer=require(process.env.GLAZE_PUPPETEER_MODULE||'puppeteer');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let target;
 try{target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}
 catch{res.writeHead(400).end('Bad request');return;}
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}
 fs.readFile(target,(error,data)=>{
  if(error){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'content-type':mime[path.extname(target)]||'application/octet-stream','cache-control':'no-store'}).end(data);
 });
});
async function storageState(page){
 return page.evaluate(async()=>({
  cookies:document.cookie,
  local:Object.keys(localStorage),
  session:Object.keys(sessionStorage),
  databases:typeof indexedDB.databases==='function'?(await indexedDB.databases()).map(x=>x.name):[],
  caches:typeof caches==='undefined'?[]:await caches.keys(),
  workers:'serviceWorker' in navigator?(await navigator.serviceWorker.getRegistrations()).length:0,
  beacons:window.__glazeTestBeacons||[]
 }));
}
function clean(s){
 assert.equal(s.cookies,'','no test cookies');
 assert.deepEqual(s.local,[],'no persistent localStorage');
 assert.deepEqual(s.session,[],'no sessionStorage');
 assert.deepEqual(s.databases,[],'no IndexedDB');
 assert.deepEqual(s.caches,[],'no CacheStorage');
 assert.equal(s.workers,0,'no service worker registration');
 assert.deepEqual(s.beacons,[],'no beacon attempts');
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await puppeteer.launch({headless:true,executablePath:process.env.GLAZE_CHROME_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  const origin='http://127.0.0.1:'+server.address().port;
  for(const name of ['visual-evolution.html','visual-evolution-scenes.html']){
   const page=await browser.newPage();
   const external=[],errors=[],sockets=[];
   const cdp=await page.createCDPSession();
   await cdp.send('Network.enable');
   cdp.on('Network.webSocketCreated',e=>sockets.push(e.url));
   page.on('pageerror',e=>errors.push(e.message));
   await page.evaluateOnNewDocument(()=>{
    window.__glazeTestBeacons=[];
    const original=navigator.sendBeacon?.bind(navigator);
    if(original)navigator.sendBeacon=(url)=>{window.__glazeTestBeacons.push(String(url));return false;};
   });
   await page.setRequestInterception(true);
   page.on('request',req=>{
    if(req.url().startsWith(origin+'/'))req.continue();
    else {external.push(req.url());req.abort();}
   });
   await page.goto(origin+'/reference/v1.7.1/'+name,{waitUntil:'networkidle0'});
   clean(await storageState(page));
   if(name==='visual-evolution-scenes.html'){
    const marker='SYNTHETIC-PRIVATE-71';
    await page.click('[data-colorize]');
    await page.$eval('#memo-label-input',(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},marker);
    await page.click('#memo-customize-apply');
    assert.equal(await page.$eval('.scene-memo .scene-label',e=>e.textContent),marker);
    await page.click('[data-note-more]');
    await page.click('[data-note-action="pin"]');
    assert.equal(await page.$eval('.scene-memo',e=>e.dataset.pinned),'true');
    await page.type('#scene-form-name',marker);
    await page.click('#scene-form button[type="submit"]');
    assert.equal(await page.$eval('#scene-form-result-title',e=>e.textContent),marker);
    await page.click('#scene-command-open');
    await page.type('#scene-command-search','memos');
    await page.click('#scene-command-close');
    await page.click('#tab-launcher');
    await page.click('#drawer-toggle');
    await page.click('#drawer-close');
    clean(await storageState(page));
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('.scene-memo .scene-label',e=>e.textContent),'Design','memo changes stay ephemeral');
    assert.equal(await page.$eval('.scene-memo',e=>e.dataset.pinned||''),'','pin state not persisted');
    assert.equal(await page.$eval('#scene-form-name',e=>e.value),'','form data not persisted');
    assert.equal(await page.$eval('#scene-form-result-title',e=>e.textContent),'Your workspace','workspace preview not persisted');
   }else{
    await page.click('[data-density="compact"]');
    await page.click('[data-theme="nocturne"]');
   }
   clean(await storageState(page));
   assert.deepEqual(external,[],'no external requests, including attempted exfiltration: '+name);
   assert.deepEqual(sockets,[],'no websocket attempts: '+name);
   assert.deepEqual(errors,[],'no runtime errors: '+name);
   console.log(JSON.stringify({page:name,originOnly:true,persistentStorage:false,beacons:false,websockets:false,reloadReset:name.includes('scenes')}));
   await page.close();
  }
  console.log('PASS: Development local-preview privacy isolation smoke; provider and field security/privacy acceptance remain open.');
 }finally{if(browser)await browser.close();}
})().catch(error=>{console.error('Privacy regression FAILED:',error.stack||error);process.exitCode=1;}).finally(()=>server.close());
