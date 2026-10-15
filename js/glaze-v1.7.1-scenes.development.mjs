/* Glaze V1.7.1 development scenes; local UI examples only. */
const tabs=[...document.querySelectorAll('[role="tab"][data-scene]')];
const panels=tabs.map(t=>document.getElementById(t.getAttribute('aria-controls')));
const status=document.getElementById('scene-status');
function selectTab(index,focus=false){
 tabs.forEach((t,i)=>{const active=i===index;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;panels[i].hidden=!active;});
 if(focus)tabs[index].focus();
 status.textContent=tabs[index].textContent+' demonstration selected; no application data accessed.';
}
tabs.forEach((t,i)=>{
 t.addEventListener('click',()=>selectTab(i));
 t.addEventListener('keydown',e=>{
  let target=null;
  if(e.key==='ArrowRight')target=(i+1)%tabs.length;
  if(e.key==='ArrowLeft')target=(i+tabs.length-1)%tabs.length;
  if(e.key==='Home')target=0;
  if(e.key==='End')target=tabs.length-1;
  if(target!==null){e.preventDefault();selectTab(target,true);}
 });
});
// Memo colors and labels are now handled by the separate accessible editor.

const drawer=document.getElementById('scene-drawer');
const toggle=document.getElementById('drawer-toggle');
function openDrawer(open){
  drawer.hidden=!open;
  toggle.setAttribute('aria-expanded',String(open));
  toggle.textContent=open?'Close app drawer':'Open app drawer';
  if(open)document.getElementById('drawer-close').focus();
  else toggle.focus();
}
toggle.addEventListener('click',()=>openDrawer(drawer.hidden));
document.getElementById('drawer-close').addEventListener('click',()=>openDrawer(false));
drawer.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();openDrawer(false);}
});
const svgNS='http://www.w3.org/2000/svg';
const glyphNames=['folder','cloud','device','network','account','search','settings','share','privacy','security'];
for(const name of glyphNames){
 const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Example '+name+' entry');
 const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('aria-hidden','true');
 const use=document.createElementNS(svgNS,'use');use.setAttribute('href','../../assets/icon-glyphs/system-symbols.svg#'+name);svg.append(use);button.append(svg);
 button.addEventListener('click',()=>{status.textContent=name+' example selected; no app launched.';});
 document.getElementById('drawer-grid').append(button);
}

const dialog=document.getElementById('sample-dialog');
document.getElementById('dialog-open').addEventListener('click',()=>dialog.showModal());
document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
const progress=document.getElementById('sample-progress');
document.getElementById('progress-update').addEventListener('click',()=>{
 progress.value=Math.min(100,progress.value+15);
 document.getElementById('sample-progress-value').textContent=progress.value+'%';
 status.textContent='Illustrative progress updated; no background process ran.';
});

// Optional, non-persistent review theme: ?theme=cedar|nocturne|contrast.
const selectedTheme=new URLSearchParams(location.search).get('theme');
if(['cedar','nocturne','contrast'].includes(selectedTheme)){
 try{
  const url=new URL('../tokens/v1.7.1/visual-evolution.development.json',import.meta.url);
  const response=await fetch(url);if(!response.ok)throw new Error('Local theme unavailable');
  const manifest=await response.json();
  if(manifest.lifecycle!=='Development'||manifest.consumerEligible!==false)throw new Error('Unapproved palette');
  const colors=manifest.themeSamples[selectedTheme];
  for(const [role,value] of Object.entries(colors))if(/^#[0-9a-f]{6}$/i.test(value))document.documentElement.style.setProperty('--'+role,value);
  document.documentElement.style.colorScheme=colors.appearance==='dark'?'dark':'light';
  status.textContent=selectedTheme+' example theme loaded; no theme setting was saved.';
 }catch{status.textContent='Theme preview unavailable; default example colors retained.';}
}

/* glaze-v171-scene-polish: active example theme, never stored */
const sceneTheme=['cedar','nocturne','contrast'].includes(selectedTheme)?selectedTheme:'porcelain';
for(const item of document.querySelectorAll('[data-scene-theme]')){
  if(item.dataset.sceneTheme===sceneTheme)item.setAttribute('aria-current','true');
}
