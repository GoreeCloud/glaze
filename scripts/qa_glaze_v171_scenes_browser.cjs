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
      await page.click('#scene-command-open');
      assert.equal(await page.$eval('#scene-command-dialog',el=>el.open),true);
      await page.type('#scene-command-search','launcher');
      if(process.env.GLAZE_QA_SCREENSHOTS && (width===390||width===1280)){
        fs.mkdirSync(process.env.GLAZE_QA_SCREENSHOTS,{recursive:true});
        await page.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'quick-actions-'+width+'.png'),fullPage:true});
      }
      assert.equal(await page.$eval('#scene-command-count',el=>el.textContent),'1 example action available');
      assert.equal(await page.evaluate(()=>[...document.querySelectorAll('.scene-command-action')].filter(el=>getComputedStyle(el).display!=='none').length),1,'only matching command is rendered');
      await page.keyboard.press('Enter');
      assert.equal(await page.$eval('#tab-launcher',el=>el.getAttribute('aria-selected')),'true');
      assert.equal(await page.$eval('#scene-command-dialog',el=>el.open),false);
      await page.click('#tab-memos');
      const beforePad=await page.$eval('.section .scene-card',el=>parseFloat(getComputedStyle(el).paddingTop));
      await page.click('[data-density="compact"]');
      const afterPad=await page.$eval('.section .scene-card',el=>parseFloat(getComputedStyle(el).paddingTop));
      assert.ok(afterPad<beforePad,'Compact density must actually reduce card padding: '+afterPad+'/'+beforePad);
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.glazeDensity),'compact');
      assert.equal(await page.$eval('[data-density="compact"]',el=>el.getAttribute('aria-pressed')),'true');
      await page.click('[data-density="comfortable"]');
      assert.equal(await page.$eval('.section .scene-card',el=>parseFloat(getComputedStyle(el).paddingTop)),beforePad);
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.glazeDensity),'comfortable');
      if(width===390){
        const composition=await page.evaluate(()=>{
          const choices=Array.from(document.querySelectorAll('.scene-theme-link'),e=>Math.round(e.getBoundingClientRect().top));
          return {masonry:getComputedStyle(document.querySelector('.scene-masonry')).columnCount,themeRows:choices};
        });
        assert.equal(composition.masonry,'2','two-column mobile notes');
        assert.equal(composition.themeRows[0],composition.themeRows[1],'first theme row');
        assert.equal(composition.themeRows[2],composition.themeRows[3],'second theme row');
        assert.ok(composition.themeRows[2]>composition.themeRows[0],'balanced two-row theme picker');
      }
      if(process.env.GLAZE_QA_SCREENSHOTS){
        fs.mkdirSync(process.env.GLAZE_QA_SCREENSHOTS,{recursive:true});
        await page.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'memos-'+width+'.png'),fullPage:true});
      }
      await page.click('#tab-launcher');await page.click('#drawer-toggle');
      const drawer=await page.evaluate(()=>({open:!document.querySelector('#scene-drawer').hidden,columns:getComputedStyle(document.querySelector('#drawer-grid')).gridTemplateColumns.split(' ').length,items:document.querySelectorAll('#drawer-grid button').length}));
      assert.deepEqual(drawer,{open:true,columns:5,items:10});
      assert.equal(await page.evaluate(()=>document.activeElement.id),'drawer-close','drawer initial focus');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#scene-drawer',el=>el.hidden),true,'Escape closes drawer');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'drawer-toggle','drawer focus restoration');
      await page.click('#drawer-toggle');
      if(process.env.GLAZE_QA_SCREENSHOTS){
        await page.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'drawer-'+width+'.png'),fullPage:true});
      }
      await page.click('#drawer-close');await page.click('#tab-memos');
      await page.click('[data-colorize]');
      assert.equal(await page.$eval('#memo-customize-dialog',el=>el.open),true);
      assert.equal(await page.$eval('#memo-label-input',el=>el.value),'Design');
      // A global shortcut must not interrupt another modal's edits or steal focus.
      await page.keyboard.down('Control');
      await page.keyboard.press('k');
      await page.keyboard.up('Control');
      assert.equal(await page.$eval('#memo-customize-dialog',el=>el.open),true,'memo dialog remains open');
      assert.equal(await page.$eval('#scene-command-dialog',el=>el.open),false,'command dialog must not stack');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'memo-label-input','memo editor keeps keyboard focus');
      if(process.env.GLAZE_QA_SCREENSHOTS){
        await page.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'memo-editor-'+width+'.png'),fullPage:true});
      }
      await page.click('[data-memo-tone="green"]');
      await page.$eval('#memo-label-input',el=>{el.value='Refined Design';el.dispatchEvent(new Event('input',{bubbles:true}));});
      await page.click('#memo-customize-apply');
      assert.equal(await page.$eval('.scene-memo',el=>el.dataset.tone),'green');
      assert.equal(await page.$eval('.scene-memo .scene-label',el=>el.textContent),'Refined Design');
      assert.equal(await page.$eval('#memo-customize-dialog',el=>el.open),false);
      await page.click('[data-colorize]');
      await page.click('[data-memo-tone="rose"]');
      await page.click('#memo-customize-cancel');
      assert.equal(await page.$eval('.scene-memo',el=>el.dataset.tone),'green','Cancel must not mutate note');
      await page.click('[data-colorize]');
      await page.click('[data-memo-tone="warm"]');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('.scene-memo',el=>el.dataset.tone),'green','Escape must not mutate note');
      assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-colorize')),true,'focus restored to edit opener');
      await page.click('[data-colorize]');
      await page.$eval('#memo-label-input',el=>{el.value='   ';el.dispatchEvent(new Event('input',{bubbles:true}));});
      await page.click('#memo-customize-apply');
      assert.equal(await page.$eval('.scene-memo .scene-label',el=>el.textContent),'Unlabeled','empty label fallback');
      await page.click('[data-colorize]');
      await page.$eval('#memo-label-input',el=>{el.value='<img src=x onerror=alert(1)>';el.dispatchEvent(new Event('input',{bubbles:true}));});
      await page.click('#memo-customize-apply');
      assert.ok(await page.$eval('.scene-memo .scene-label',el=>el.textContent.startsWith('<img')),'label is text, not parsed HTML');
      assert.equal(await page.$eval('.scene-memo img',el=>el.tagName).catch(()=>null),null,'no injected HTML markup');
      await page.click('[data-colorize]');
      await page.$eval('#memo-label-input',el=>{el.value='Design';el.dispatchEvent(new Event('input',{bubbles:true}));});
      await page.click('#memo-customize-apply');
      assert.equal(await page.$eval('.scene-memo .scene-label',el=>el.textContent),'Design','synthetic visual restored after injection test');

      await page.click('[data-note-more]');
      if(process.env.GLAZE_QA_SCREENSHOTS)
        await page.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'note-menu-'+width+'.png'),fullPage:true});
      assert.equal(await page.$eval('[data-note-more]',e=>e.getAttribute('aria-expanded')),'true');
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.noteAction),'appearance');
      await page.keyboard.press('ArrowDown');
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.noteAction),'pin');
      await page.keyboard.press('Enter');
      assert.equal(await page.$eval('.scene-memo',e=>e.dataset.pinned),'true');
      assert.equal(await page.$eval('.scene-pin-indicator',e=>e.textContent),'Pinned');
      assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-note-more')),true);
      await page.click('[data-note-more]');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('.scene-note-menu',e=>e.hidden),true);
      assert.equal(await page.$eval('[data-note-more]',e=>e.getAttribute('aria-expanded')),'false');
      await page.click('[data-note-more]');
      await page.click('.scene-memo h3');
      assert.equal(await page.$eval('.scene-note-menu',e=>e.hidden),true,'click within note outside menu dismisses it');
      await page.click('[data-note-more]');
      await page.click('[data-note-action="pin"]');
      assert.equal(await page.$eval('.scene-memo',e=>e.dataset.pinned),'false');
      assert.equal(await page.evaluate(()=>document.querySelectorAll('.scene-pin-indicator').length),0);
      await page.click('[data-note-more]');
      await page.click('[data-note-action="appearance"]');
      assert.equal(await page.$eval('#memo-customize-dialog',e=>e.open),true);
      await page.click('#memo-customize-cancel');
      assert.equal(await page.$eval('#memo-customize-dialog',e=>e.open),false);
      for(const mode of ['empty','error','loading']){
        await page.click('[data-content-mode="'+mode+'"]');
        assert.equal(await page.$eval('#scene-content-'+mode,e=>e.hidden),false);
        assert.equal(await page.$eval('[data-content-mode="'+mode+'"]',e=>e.getAttribute('aria-pressed')),'true');
        assert.ok((await page.$eval('#scene-content-feedback',e=>e.textContent)).includes('Illustrative'));
      }
      await page.click('#scene-form button[type="submit"]');
      assert.equal(await page.$eval('#scene-form-name',e=>e.getAttribute('aria-invalid')),'true','required input is invalid');
      assert.equal(await page.$eval('#scene-form-error',e=>e.dataset.visible),'true');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'scene-form-name','focus must reach invalid control');
      await page.type('#scene-form-name','<b>Design Studio</b>');
      await page.click('.scene-form-radio:has(input[value="team"])');
      await page.click('#scene-form button[type="submit"]');
      assert.equal(await page.$eval('#scene-form-name',e=>e.hasAttribute('aria-invalid')),false);
      assert.equal(await page.$eval('#scene-form-result-title',e=>e.textContent),'<b>Design Studio</b>');
      assert.equal(await page.evaluate(()=>document.querySelectorAll('#scene-form-result-title b').length),0,'input never becomes markup');
      assert.equal(await page.$eval('#scene-form-result-meta',e=>e.textContent.startsWith('Team workspace')),true);
      assert.equal(await page.$eval('#scene-form-result-icon',e=>e.getAttribute('href').endsWith('#network')),true);
      await page.click('#scene-form-preview-toggle');
      assert.equal(await page.$eval('#scene-form-result',e=>e.dataset.preview),'hidden');
      await page.click('#scene-form button[type="reset"]');
      assert.equal(await page.$eval('#scene-form-result-title',e=>e.textContent),'Your workspace');
      assert.equal(await page.$eval('#scene-form-result',e=>e.dataset.preview),'visible');
      assert.equal(await page.$eval('#scene-form-name',e=>e.value),'');
      if(process.env.GLAZE_QA_SCREENSHOTS && (width===390||width===1280))
        await page.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'forms-'+width+'.png'),fullPage:true});
      await page.click('[data-type-scale="large"]');
      assert.equal(await page.$eval('.scene-type-sample p',el=>getComputedStyle(el).fontSize),'21px');
      await page.click('[data-type-leading="airy"]');
      assert.ok(await page.$eval('.scene-type-sample p',el=>parseFloat(getComputedStyle(el).lineHeight))>38);
      await page.click('[data-type-clarity="enhanced"]');
      assert.equal(await page.$eval('#scene-type-sample',e=>e.dataset.clarity),'enhanced');
      assert.ok(await page.$eval('.scene-type-sample p',e=>Number(getComputedStyle(e).fontWeight)>=600));
      assert.equal(await page.$eval('[data-type-clarity="enhanced"]',e=>e.getAttribute('aria-pressed')),'true');
      assert.equal(await page.$eval('.scene-type-options-pair',e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),2);
      const defaultRadius=await page.$eval('#scene-material-preview',e=>getComputedStyle(e).borderTopLeftRadius);
      assert.equal(defaultRadius,'18px');
      await page.click('[data-material-elevation="raised"]');
      assert.equal(await page.$eval('#scene-material-preview',e=>e.dataset.elevation),'raised');
      assert.notEqual(await page.$eval('#scene-material-preview',e=>getComputedStyle(e).boxShadow),'none');
      await page.click('[data-material-elevation="outlined"]');
      assert.equal(await page.$eval('#scene-material-preview',e=>getComputedStyle(e).borderTopWidth),'2px');
      assert.equal(await page.$eval('[data-material-elevation="outlined"]',e=>e.getAttribute('aria-pressed')),'true');
      await page.click('#scene-material-accent');
      assert.equal(await page.$eval('#scene-material-accent',e=>e.getAttribute('aria-checked')),'false');
      assert.equal(await page.$eval('#scene-material-preview',e=>e.dataset.accent),'off');
      assert.equal(await page.$eval('#scene-material-preview',e=>getComputedStyle(e).borderTopColor),await page.$eval('.scene-card',e=>getComputedStyle(e).borderTopColor),'accent-off should use neutral border');
      await page.focus('#scene-material-radius');
      await page.$eval('#scene-material-radius',e=>{e.value='22';e.dispatchEvent(new Event('input',{bubbles:true}));});
      assert.equal(await page.$eval('#scene-material-preview',e=>getComputedStyle(e).borderTopLeftRadius),'22px');
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.$eval('#scene-material-radius-output',e=>e.textContent),'24px');
      assert.ok((await page.$eval('#scene-material-feedback',e=>e.textContent)).includes('No preference was saved'));
      if(process.env.GLAZE_QA_SCREENSHOTS && (width===390||width===1280)){
        await page.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'materials-'+width+'.png'),fullPage:true});
      }
      await page.click('#dialog-open');
      assert.equal(await page.$eval('#sample-dialog',el=>el.open),true);
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#sample-dialog',el=>el.open),false);
      await page.click('#progress-update');
      assert.equal(await page.$eval('#sample-progress',el=>el.value),50);
      for(const type of ['security','warning','privacy']){
        await page.click('[data-notice-demo="'+type+'"]');
        assert.equal(await page.$eval('#glaze-notice-preview',el=>el.hidden),false);
        assert.equal(await page.$eval('#glaze-notice-preview',el=>el.dataset.tone),type);
        assert.ok((await page.$eval('#glaze-notice-title',el=>el.textContent)).length>5);
        assert.ok((await page.$eval('#glaze-notice-glyph',el=>el.getAttribute('href'))).endsWith('#'+type));
        await page.click('#glaze-notice-dismiss');
        assert.equal(await page.$eval('#glaze-notice-preview',el=>el.hidden),true);
        assert.equal(await page.evaluate(type=>document.activeElement?.dataset.noticeDemo===type,type),true);
      }

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
    {
      const gallery=await browser.newPage();
      await gallery.goto(base.replace('visual-evolution-scenes.html','visual-evolution.html'),{waitUntil:'networkidle0'});
      const initial=await gallery.$eval('.showcase-item',el=>parseFloat(getComputedStyle(el).paddingTop));
      await gallery.click('[data-density="compact"]');
      const dense=await gallery.$eval('.showcase-item',el=>parseFloat(getComputedStyle(el).paddingTop));
      assert.ok(dense<initial,'Gallery density must affect component geometry');
      assert.equal(await gallery.evaluate(()=>document.documentElement.dataset.glazeDensity),'compact');
      await gallery.click('[data-density="comfortable"]');
      assert.equal(await gallery.$eval('.showcase-item',el=>parseFloat(getComputedStyle(el).paddingTop)),initial);
      await gallery.click('[data-theme="nocturne"]');
      assert.equal(await gallery.$eval('[data-theme="nocturne"]',el=>el.getAttribute('aria-pressed')),'true');
      await gallery.type('#component-search','glyphs');
      assert.ok((await gallery.evaluate(()=>document.querySelectorAll('.showcase-item.hidden').length))>=1);
      assert.ok(await gallery.$eval('a[href="./visual-evolution-scenes.html"]',el=>Boolean(el.href)));
      assert.equal(await gallery.evaluate(()=>document.querySelectorAll('.glyph-tile').length),16);
      await gallery.click('[data-glyph-size="32"]');
      assert.equal(await gallery.$eval('.glyph-tile svg',el=>Math.round(el.getBoundingClientRect().width)),32);
      await gallery.type('#glyph-search','secur');
      assert.equal(await gallery.evaluate(()=>document.querySelectorAll('.glyph-tile:not([hidden])').length),1);
      await gallery.click('[data-glyph="security"]');
      assert.ok((await gallery.$eval('#glyph-selection',el=>el.textContent)).includes('#security'));
      assert.equal(await gallery.$eval('[data-glyph="security"]',el=>el.getAttribute('aria-pressed')),'true');
      await gallery.evaluate(()=>{
        const input=document.getElementById('glyph-search');
        input.value='';
        input.dispatchEvent(new Event('input',{bubbles:true}));
      });
      assert.equal(await gallery.evaluate(()=>document.querySelectorAll('.glyph-tile:not([hidden])').length),16);
      await gallery.setViewport({width:390,height:844});
      assert.ok(await gallery.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'glyph mobile overflow');
      await gallery.setViewport({width:1280,height:900});
      assert.ok(await gallery.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'glyph desktop overflow');
      if(process.env.GLAZE_QA_SCREENSHOTS)
        await gallery.screenshot({path:path.join(process.env.GLAZE_QA_SCREENSHOTS,'glyph-gallery-1280.png'),fullPage:true});
      results.push({gallery:true,density:true,theme:true,search:true,glyphs:true});
      await gallery.close();
    }
    for(const theme of ['porcelain','cedar','nocturne','contrast']){
      const page=await browser.newPage();
      await page.goto(base+'?theme='+theme,{waitUntil:'networkidle0'});
      const materialContrast=await page.evaluate(()=>{
        function luminance(rgb){
          const v=(rgb.match(/[0-9.]+/g)||[]).slice(0,3).map(Number).map(n=>{
            const c=n/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
          });
          return .2126*v[0]+.7152*v[1]+.0722*v[2];
        }
        function pair(selector){
          const c=getComputedStyle(document.querySelector(selector));
          const a=luminance(c.color),b=luminance(c.backgroundColor);
          return Number(((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toFixed(2));
        }
        return {
          selected:pair('[data-material-elevation="flat"]'),
          unselected:pair('[data-material-elevation="raised"]'),
          switchText:pair('#scene-material-accent')
        };
      });
      for(const [control,ratio] of Object.entries(materialContrast))
        assert.ok(ratio>=4.5,'Material text contrast '+theme+'/'+control+' = '+ratio);
      const palette=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--surface').trim());
      const current=await page.evaluate(()=>Array.from(document.querySelectorAll('[data-scene-theme][aria-current="true"]'),el=>el.dataset.sceneTheme));
      assert.deepEqual(current,[theme],'one visible active theme choice');
      assert.match(palette,/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i);
      if(theme!=='porcelain') assert.match(await page.$eval('#scene-status',el=>el.textContent),new RegExp(theme+' example theme'));
      results.push({theme,surface:palette});
      await page.close();
    }
    const rtl=await browser.newPage();
    await rtl.setViewport({width:390,height:844});
    await rtl.goto(base,{waitUntil:'networkidle0'});
    await rtl.evaluate(()=>document.documentElement.dir='rtl');
    assert.ok(await rtl.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'RTL horizontal overflow');
    await rtl.click('[data-note-more]');
    await rtl.keyboard.press('Escape');
    assert.equal(await rtl.$eval('.scene-note-menu',e=>e.hidden),true);
    await rtl.click('#tab-launcher');
    await rtl.click('#drawer-toggle');
    assert.equal(await rtl.$eval('#scene-drawer',e=>e.hidden),false);
    await rtl.click('#drawer-close');
    results.push({rtl:true,viewport:390,menu:true,drawer:true});
    await rtl.close();
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