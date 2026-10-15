#!/usr/bin/env node
/* Glaze 1.7.1 Development browser smoke. Not human/native/release acceptance.
   Set GLAZE_PUPPETEER_MODULE to an installed Puppeteer path and
   GLAZE_CHROME_PATH to an existing Chrome/Chromium executable. */
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const puppeteer=require(process.env.GLAZE_PUPPETEER_MODULE||'puppeteer');
const extensions={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  let url;
  try { url=new URL(req.url,'http://localhost'); }catch {res.writeHead(400);return res.end('Bad URL');}
  const target=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
  fs.readFile(target,(error,bytes)=>{
    if(error){res.writeHead(404);return res.end('Missing');}
    res.writeHead(200,{'Content-Type':extensions[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(bytes);
  });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  const base='http://127.0.0.1:'+server.address().port+'/reference/v1.7.1/visual-evolution-scenes.html';
  const results=[];
  try {
    browser=await puppeteer.launch({headless:true,executablePath:process.env.GLAZE_CHROME_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
    for(const width of [320,390,768,1280,1600]){
      const page=await browser.newPage();
      await page.setViewport({width,height:900});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
      await page.goto(base,{waitUntil:'networkidle0'});
      let state=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth,memos:document.querySelectorAll('.scene-memo').length,dock:document.querySelectorAll('.scene-dock button').length}));
      assert.ok(state.scroll<=width+1,'Horizontal overflow '+JSON.stringify(state));
      assert.equal(state.memos,5);assert.equal(state.dock,5);
      await page.click('#tab-launcher');await page.click('#drawer-toggle');
      const drawer=await page.evaluate(()=>({open:!document.querySelector('#scene-drawer').hidden,columns:getComputedStyle(document.querySelector('#drawer-grid')).gridTemplateColumns.split(' ').length,items:document.querySelectorAll('#drawer-grid button').length}));
      assert.deepEqual(drawer,{open:true,columns:5,items:10});
      await page.click('#drawer-close');await page.click('#tab-memos');
      await page.click('[data-colorize]');
      assert.equal(await page.$eval('.scene-memo',el=>el.dataset.tone),'green');
      await page.click('#dialog-open');
      assert.equal(await page.$eval('#sample-dialog',el=>el.open),true);
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#sample-dialog',el=>el.open),false);
      await page.click('#progress-update');
      assert.equal(await page.$eval('#sample-progress',el=>el.value),50);
      await page.focus('#tab-memos');await page.keyboard.press('ArrowRight');
      assert.equal(await page.$eval('#tab-launcher',el=>el.getAttribute('aria-selected')),'true');
      assert.deepEqual(errors,[],'browser errors');
      if(process.env.GLAZE_QA_SCREENSHOTS){
        fs.mkdirSync(process.env.GLAZE_QA_SCREENSHOTS,{recursive:true});
        await page.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'scenes-'+width+'.png'),fullPage:true});
      }
      results.push({width,pass:true,drawerColumns:5,keyboard:true,dialog:true,progress:true});
      await page.close();
    }
    for(const theme of ['porcelain','cedar','nocturne','contrast']){
      const page=await browser.newPage();
      await page.goto(base+'?theme='+theme,{waitUntil:'networkidle0'});
      const palette=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--surface').trim());
      assert.match(palette,/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i);
      if(theme!=='porcelain') assert.match(await page.$eval('#scene-status',el=>el.textContent),new RegExp(theme+' example theme'));
      results.push({theme,surface:palette});
      await page.close();
    }
    const page=await browser.newPage();
    await page.setViewport({width:390,height:844});
    const cdp=await page.createCDPSession();
    await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'},{name:'prefers-reduced-motion',value:'reduce'}]});
    await page.goto(base,{waitUntil:'networkidle0'});
    assert.equal(await page.evaluate(()=>matchMedia('(forced-colors: active)').matches),true);
    assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
    results.push({forcedColors:true,reducedMotion:true});
    await page.close();
    console.log('Glaze scenes browser smoke PASS (development-only)');
    console.log(JSON.stringify(results,null,2));
  } finally {if(browser)await browser.close();}
})().catch(e=>{console.error('QA FAILED:',e.stack||e);process.exitCode=1;}).finally(()=>server.close());