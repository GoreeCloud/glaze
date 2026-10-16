/* Automated accessibility audit for Glaze Development; human AT remains separate. */
const fs=require('node:fs'),path=require('node:path');
const P=require(process.env.GLAZE_PUPPETEER_MODULE||'puppeteer');
const axePath=process.env.GLAZE_AXE_PATH;
if(!axePath||!fs.existsSync(axePath))throw Error('GLAZE_AXE_PATH must refer to axe.min.js');
const root=path.resolve(__dirname,'..');
const {createPreviewServer}=require('./glaze_v171_preview_server.cjs');
const server=createPreviewServer(root);
(async()=>{
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 let browser;let failed=0;
 try{
  browser=await P.launch({headless:true,executablePath:process.env.GLAZE_CHROME_PATH||undefined,args:['--no-sandbox']});
  const base='http://127.0.0.1:'+server.address().port+'/reference/v1.7.1/';
  const samples=[['gallery','visual-evolution.html',1280],['gallery-mobile','visual-evolution.html',390],['scenes','visual-evolution-scenes.html',1280],['scenes-mobile','visual-evolution-scenes.html',390],['editor','visual-evolution-scenes.html',390],['launcher','visual-evolution-scenes.html',390],['menu','visual-evolution-scenes.html',390],['commands','visual-evolution-scenes.html',390],['commands-empty','visual-evolution-scenes.html',390],['form-invalid','visual-evolution-scenes.html',390],['form-team','visual-evolution-scenes.html',390],['material-raised','visual-evolution-scenes.html',390],['typography-enhanced','visual-evolution-scenes.html',390],['error-state','visual-evolution-scenes.html',390],['notice-warning','visual-evolution-scenes.html',390],['glyph-filter','visual-evolution.html',390],['rtl','visual-evolution-scenes.html',390],['dark','visual-evolution-scenes.html?theme=nocturne',390]];
  for(const [name,url,width] of samples){
   const page=await browser.newPage();await page.setViewport({width,height:880});
   await page.goto(base+url,{waitUntil:'networkidle0'});
   if(name==='editor')await page.click('[data-colorize]');
   if(name==='launcher')await page.click('#tab-launcher');
   if(name==='menu')await page.click('[data-note-more]');
   if(name==='commands'||name==='commands-empty')await page.click('#scene-command-open');
   if(name==='commands-empty')await page.type('#scene-command-search','missing-command');
   if(name==='form-invalid')await page.click('#scene-form button[type="submit"]');
   if(name==='form-team'){
     await page.type('#scene-form-name','Example Team');
     await page.click('.scene-form-radio:has(input[value="team"])');
     await page.click('#scene-form button[type="submit"]');
   }
   if(name==='material-raised')await page.click('[data-material-elevation="raised"]');
   if(name==='typography-enhanced'){
     await page.click('[data-type-scale="large"]');
     await page.click('[data-type-leading="airy"]');
     await page.click('[data-type-clarity="enhanced"]');
   }
   if(name==='error-state')await page.click('[data-content-mode="error"]');
   if(name==='notice-warning')await page.click('[data-notice-demo="warning"]');
   if(name==='glyph-filter')await page.type('#glyph-search','secur');
   if(name==='rtl')await page.evaluate(()=>document.documentElement.dir='rtl');
   await page.addScriptTag({path:axePath});
   const report=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   const violations=report.violations.map(v=>({rule:v.id,severity:v.impact,targets:v.nodes.map(n=>n.target).slice(0,8)}));
   failed+=violations.length;
   console.log(JSON.stringify({case:name,passed:report.passes.length,violations}));
   await page.close();
  }
  if(failed)throw Error(failed+' WCAG audit rule failures');
  console.log('Automated axe audit PASS. Physical device and human screen-reader acceptance remain open.');
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error('AUDIT FAIL:',e.message);process.exitCode=1;}).finally(()=>server.close());
