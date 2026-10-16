/* Automated accessibility audit for Glaze Development; human AT remains separate. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const P=require(process.env.GLAZE_PUPPETEER_MODULE||'puppeteer');
const axePath=process.env.GLAZE_AXE_PATH;
if(!axePath||!fs.existsSync(axePath))throw Error('GLAZE_AXE_PATH must refer to axe.min.js');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let file;
 try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{
  if(err){res.writeHead(404).end();return;}
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'text/plain'}).end(data);
 });
});
(async()=>{
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 let browser;let failed=0;
 try{
  browser=await P.launch({headless:true,executablePath:process.env.GLAZE_CHROME_PATH||undefined,args:['--no-sandbox']});
  const base='http://127.0.0.1:'+server.address().port+'/reference/v1.7.1/';
  const samples=[['gallery','visual-evolution.html',1280],['gallery-mobile','visual-evolution.html',390],['scenes','visual-evolution-scenes.html',1280],['scenes-mobile','visual-evolution-scenes.html',390],['editor','visual-evolution-scenes.html',390],['launcher','visual-evolution-scenes.html',390],['menu','visual-evolution-scenes.html',390],['dark','visual-evolution-scenes.html?theme=nocturne',390]];
  for(const [name,url,width] of samples){
   const page=await browser.newPage();await page.setViewport({width,height:880});
   await page.goto(base+url,{waitUntil:'networkidle0'});
   if(name==='editor')await page.click('[data-colorize]');
   if(name==='launcher')await page.click('#tab-launcher');
   if(name==='menu')await page.click('[data-note-more]');
   await page.addScriptTag({path:axePath});
