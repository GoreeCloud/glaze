/* Glaze 1.7.1 — Quick Actions: local-only accessible example navigation. */
const commandDialog=document.getElementById('scene-command-dialog');
const commandOpen=document.getElementById('scene-command-open');
const commandClose=document.getElementById('scene-command-close');
const commandInput=document.getElementById('scene-command-search');
const commandResults=document.getElementById('scene-command-results');
const commandCount=document.getElementById('scene-command-count');
const commandEmpty=document.getElementById('scene-command-empty');
const commandActions=[...commandResults.querySelectorAll('[data-command-target]')];
let lastOpener=commandOpen;
function matches(button,q){return (button.textContent+' '+(button.dataset.keywords||'')).toLowerCase().includes(q);}
function filtered(){return commandActions.filter(button=>!button.hidden);}
function update(){
 const q=commandInput.value.trim().toLowerCase();
 let count=0;
 for(const button of commandActions){button.hidden=!matches(button,q);if(!button.hidden)count++;}
 commandEmpty.hidden=count!==0;
 commandCount.textContent=count+(count===1?' example action available':' example actions available');
}
function open(){
 if(commandDialog.open)return;
 lastOpener=document.activeElement instanceof HTMLElement?document.activeElement:commandOpen;
 commandInput.value='';update();
 commandDialog.showModal();commandInput.focus();
}
function close(){if(commandDialog.open)commandDialog.close();}
function run(button){
 const target=document.getElementById(button.dataset.commandTarget);
 if(!target)return;
 close();
 if(button.hasAttribute('data-command-tab')){
   target.click();target.focus();
 }else{
   if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
   target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});
 }
 const status=document.getElementById('scene-status');
 status.textContent=button.querySelector('span')?.textContent.trim()+' example selected; no application was opened.';
}
commandOpen.addEventListener('click',open);
commandClose.addEventListener('click',close);
commandInput.addEventListener('input',update);
commandInput.addEventListener('keydown',event=>{
 if(event.key==='ArrowDown'&&filtered().length){event.preventDefault();filtered()[0].focus();}
 if(event.key==='ArrowUp'&&filtered().length){event.preventDefault();filtered().at(-1).focus();}
 if(event.key==='Enter'&&filtered().length){event.preventDefault();run(filtered()[0]);}
});
commandResults.addEventListener('keydown',event=>{
 const items=filtered();const current=items.indexOf(document.activeElement);
 if(current<0)return;
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();items[(current+(event.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();
 }else if(event.key==='Home'){event.preventDefault();items[0].focus();}
 else if(event.key==='End'){event.preventDefault();items.at(-1).focus();}
 else if(event.key==='Backspace'&&commandInput.value===''){event.preventDefault();commandInput.focus();}
});
for(const button of commandActions)button.addEventListener('click',()=>run(button));
document.addEventListener('keydown',event=>{
 if((event.ctrlKey||event.metaKey)&&!event.altKey&&event.key.toLowerCase()==='k'){
  event.preventDefault();commandDialog.open?close():open();
 }
});
commandDialog.addEventListener('close',()=>{
 if(document.activeElement===document.body&&lastOpener?.isConnected)lastOpener.focus();
});
update();
