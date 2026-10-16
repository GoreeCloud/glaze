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
