#!/usr/bin/env node
/* Development-only deterministic resource/visual stability smoke.
   Timings are diagnostic, not hardware performance or energy acceptance. */
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const browserLib=require(process.env.GLAZE_PUPPETEER_MODULE||'puppeteer');
const root=path.resolve(__dirname,'..');
const contentTypes={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(err,data)=>{
  if(err){res.writeHead(404).end();return;}
  res.writeHead(200,{'content-type':contentTypes[path.extname(target)]||'text/plain','cache-control':'no-store'}).end(data);
 });
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await browserLib.launch({headless:true,executablePath:process.env.GLAZE_CHROME_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  const origin='http://127.0.0.1:'+server.address().port;
  for(const [name,url,width] of [['gallery-mobile','visual-evolution.html',390],['scenes-mobile','visual-evolution-scenes.html',390],['scenes-desktop','visual-evolution-scenes.html',1280]]){
   const page=await browser.newPage();
   await page.setViewport({width,height:900});
   const errors=[];const external=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',req=>{if(/^https?:/.test(req.url())&&!req.url().startsWith(origin+'/'))external.push(req.url());});
   await page.evaluateOnNewDocument(()=>{
    window.__glazeCLS=0;
    new PerformanceObserver(list=>{
     for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__glazeCLS+=entry.value;
    }).observe({type:'layout-shift',buffered:true});
   });
   await page.goto(origin+'/reference/v1.7.1/'+url,{waitUntil:'networkidle0'});
   const perf=await page.evaluate(()=>{
    const resources=performance.getEntriesByType('resource');
    const nav=performance.getEntriesByType('navigation')[0];
    const paint=performance.getEntriesByType('paint').find(p=>p.name==='first-contentful-paint');
    return {resources:resources.length,bytes:resources.reduce((n,r)=>n+(r.encodedBodySize||0),0),cls:window.__glazeCLS||0,domReady:Math.round(nav.domContentLoadedEventEnd),fcp:paint?Math.round(paint.startTime):null,overflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert.deepEqual(errors,[],'runtime errors: '+name);
   assert.deepEqual(external,[],'external network dependency: '+name);
   assert.ok(perf.resources<=45,name+' request count '+perf.resources);
   assert.ok(perf.bytes<=600000,name+' first-party payload '+perf.bytes);
   assert.ok(perf.cls<=.1,name+' layout shift '+perf.cls);
   assert.ok(perf.overflow<=1,name+' horizontal overflow '+perf.overflow);
   console.log(JSON.stringify({case:name,...perf}));
   await page.close();
  }
  console.log('Development resource and layout-stability smoke PASS; field performance, frame pacing and energy remain unverified.');
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
