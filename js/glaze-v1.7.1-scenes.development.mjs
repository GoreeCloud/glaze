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
const tones=['','warm','green','rose'];
document.querySelectorAll('[data-colorize]').forEach(button=>button.addEventListener('click',()=>{
 const card=button.closest('.scene-memo');const current=tones.indexOf(card.dataset.tone||'');
 card.dataset.tone=tones[(current+1)%tones.length];
 status.textContent='Example memo color changed; no note was saved.';
}));
