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
