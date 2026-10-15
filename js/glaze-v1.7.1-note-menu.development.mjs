/* Glaze 1.7.1, development-only example note actions. */
const cards=[...document.querySelectorAll('.scene-memo')];
const status=document.getElementById('scene-status');
let active=null;
function closeMenu(restore=false){
 if(!active)return;
 const {menu,button,card}=active;
 menu.hidden=true;card.classList.remove('scene-menu-open');
 button.setAttribute('aria-expanded','false');active=null;
 if(restore&&button.isConnected)button.focus();
}
cards.forEach((card,index)=>{
 const appearance=card.querySelector('[data-colorize]');
 const title=card.querySelector('h3')?.textContent||'memo';
 const bar=document.createElement('div');bar.className='scene-note-actions';
 appearance.before(bar);bar.append(appearance);
 const button=document.createElement('button');button.type='button';
 button.className='scene-note-more';button.dataset.noteMore='';
 button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');
 button.setAttribute('aria-label','More actions for '+title);
 const menu=document.createElement('div');menu.className='scene-note-menu';
 menu.id='scene-note-menu-'+index;menu.role='menu';menu.hidden=true;
 button.setAttribute('aria-controls',menu.id);
