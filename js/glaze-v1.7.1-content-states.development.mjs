/* Development-only content state demonstration. */
const choices=[...document.querySelectorAll('[data-content-mode]')];
const modes=['loading','empty','error'];
const panels=modes.map(name=>document.getElementById('scene-content-'+name));
const status=document.getElementById('scene-content-feedback');
function present(mode){
 if(!modes.includes(mode))return;
 choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.contentMode===mode)));
 panels.forEach((panel,i)=>{panel.hidden=modes[i]!==mode;});
 status.textContent=mode==='loading'?'Illustrative loading state. No request is running.':
  mode==='empty'?'Illustrative empty state. No account data was checked.':
  'Illustrative error state. No real failure was detected.';
}
choices.forEach(b=>b.addEventListener('click',()=>present(b.dataset.contentMode)));
present('loading');
