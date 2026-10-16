/* Glaze 1.7.1 Development typography and readability browser audit. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const P=require(process.env.GLAZE_PUPPETEER_MODULE||'puppeteer');
const root=path.resolve(__dirname,'..');
const {createPreviewServer}=require('./glaze_v171_preview_server.cjs');
const server=createPreviewServer(root);
(async()=>{
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 let browser;
 try{
  browser=await P.launch({headless:true,executablePath:process.env.GLAZE_CHROME_PATH||undefined,args:['--no-sandbox']});
  const addr='http://127.0.0.1:'+server.address().port+'/reference/v1.7.1/visual-evolution-scenes.html';
  const cases=[];
  for(const theme of ['porcelain','cedar','nocturne','contrast']){
   for(const width of (theme==='porcelain'?[320,390,768,1280]:[390,1280]))cases.push({theme,width});
  }
  for(const {theme,width} of cases){
   const page=await browser.newPage();
   await page.setViewport({width,height:850});
   await page.goto(addr+'?theme='+theme,{waitUntil:'networkidle0'});
   const hierarchy=await page.evaluate(()=>{
     const controls=document.querySelector('.scene-type-controls');
     return {fields:controls.querySelectorAll(':scope > .scene-type-field').length,
       adjacent:document.getElementById('scene-type-sample').parentElement===document.querySelector('.scene-type-layout')};
   });
   assert.equal(hierarchy.fields,3,'independent typography fields');
   assert.equal(hierarchy.adjacent,true,'specimen inside layout');
   assert.equal(await page.$eval('.scene-type-sample p',e=>getComputedStyle(e).fontSize),'15px');
   await page.click('[data-type-scale="large"]');
   assert.equal(await page.$eval('.scene-type-sample p',e=>getComputedStyle(e).fontSize),'21px');
   await page.click('[data-type-leading="airy"]');
   assert.ok((await page.$eval('.scene-type-sample p',e=>parseFloat(getComputedStyle(e).lineHeight)))>38);
   await page.click('[data-type-clarity="enhanced"]');
   assert.equal(await page.$eval('#scene-type-sample',e=>e.dataset.clarity),'enhanced');
   assert.equal(await page.$eval('[data-type-clarity="enhanced"]',e=>e.getAttribute('aria-pressed')),'true');
   assert.ok(await page.$eval('.scene-type-sample p',e=>Number(getComputedStyle(e).fontWeight)>=600));
   const state=await page.evaluate(()=>{
    const pair=document.querySelector('.scene-type-options-pair');
    const choices=[...pair.querySelectorAll('button')];
    return {overflow:document.documentElement.scrollWidth-innerWidth,
      columns:getComputedStyle(pair).gridTemplateColumns.split(' ').length,
      row:Math.abs(choices[0].getBoundingClientRect().top-choices[1].getBoundingClientRect().top)<2,
      target:Math.min(...choices.map(e=>e.getBoundingClientRect().height))};
   });
   assert.ok(state.overflow<=1,theme+' '+width+' overflow');
   assert.equal(state.columns,2,'paired controls grid');
   assert.equal(state.row,true,'paired controls same row');
   assert.ok(state.target>=44,'touch target height');
   if(process.env.GLAZE_QA_SCREENSHOTS && width===390 && (theme==='porcelain'||theme==='nocturne')){
     fs.mkdirSync(process.env.GLAZE_QA_SCREENSHOTS,{recursive:true});
     await page.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'typography-'+theme+'-390.png'),fullPage:true});
   }
   if(process.env.GLAZE_AXE_PATH){
    await page.addScriptTag({path:process.env.GLAZE_AXE_PATH});
    const report=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
    assert.deepEqual(report.violations.map(v=>v.id),[]);
   }
   console.log(JSON.stringify({theme,width,highClarity:true}));
   await page.close();
  }
  console.log('Development typography QA PASS; physical and manual AT testing remains open.');
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error('Typography QA FAIL:',e.message);process.exitCode=1;}).finally(()=>server.close());
