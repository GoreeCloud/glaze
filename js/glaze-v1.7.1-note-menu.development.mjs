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
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('aria-hidden','true');
 const use=document.createElementNS('http://www.w3.org/2000/svg','use');
 use.setAttribute('href','../../assets/icon-glyphs/system-symbols.svg#settings');
 svg.append(use);button.append(svg);bar.append(button);
 function action(text,kind){
  const item=document.createElement('button');item.type='button';
  item.role='menuitem';item.dataset.noteAction=kind;item.textContent=text;
  menu.append(item);return item;
 }
 const edit=action('Customize appearance','appearance');
 const pin=action('Pin note','pin');
 card.append(menu);
 button.addEventListener('click',()=>{
  if(active?.menu===menu){closeMenu(true);return;}
  closeMenu();active={menu,button,card};menu.hidden=false;
  card.classList.add('scene-menu-open');
  button.setAttribute('aria-expanded','true');edit.focus();
 });
 menu.addEventListener('keydown',event=>{
  const items=[edit,pin];const current=items.indexOf(document.activeElement);
  let target=-1;
  if(event.key==='ArrowDown')target=(current+1)%items.length;
  if(event.key==='ArrowUp')target=(current+items.length-1)%items.length;
  if(event.key==='Home')target=0;
  if(event.key==='End')target=items.length-1;
  if(target>=0){event.preventDefault();items[target].focus();}
  else if(event.key==='Escape'){event.preventDefault();closeMenu(true);}
  else if(event.key==='Tab')closeMenu();
 });
 edit.addEventListener('click',()=>{closeMenu();appearance.click();});
