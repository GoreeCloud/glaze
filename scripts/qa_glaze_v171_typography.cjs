/* Glaze 1.7.1 Development typography and readability browser audit. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const P=require(process.env.GLAZE_PUPPETEER_MODULE||'puppeteer');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{
  if(err){res.writeHead(404).end();return;}
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'text/plain'}).end(data);
 });
});
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
