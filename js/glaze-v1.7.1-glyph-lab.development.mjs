/* Canonical SVG symbol showcase, Development-only. */
const names=['search','share','delete','back','forward','settings','cloud','device','folder','account','network','sync','warning','privacy','security','unavailable'];
const grid=document.getElementById('glyph-grid');
const count=document.getElementById('glyph-count');
const selection=document.getElementById('glyph-selection');
const input=document.getElementById('glyph-search');
const svgNS='http://www.w3.org/2000/svg';
const tiles=[];
for(const name of names){
 const tile=document.createElement('button');
 tile.type='button';tile.className='glyph-tile';tile.dataset.glyph=name;
 tile.setAttribute('aria-pressed','false');
 tile.setAttribute('aria-label','Select '+name+' vector glyph');
 const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('aria-hidden','true');
 const use=document.createElementNS(svgNS,'use');
 use.setAttribute('href','../../assets/icon-glyphs/system-symbols.svg#'+name);
 svg.append(use);tile.append(svg);
 const label=document.createElement('span');label.className='glyph-tile-label';
 label.textContent=name.charAt(0).toUpperCase()+name.slice(1);tile.append(label);
 tile.addEventListener('click',()=>{
  for(const item of tiles)item.setAttribute('aria-pressed',String(item===tile));
  selection.textContent='Selected canonical glyph: #'+name;
 });
 tiles.push(tile);grid.append(tile);
}
input.addEventListener('input',()=>{
 const query=input.value.trim().toLowerCase();
 let visible=0;
 for(const item of tiles){item.hidden=!item.dataset.glyph.includes(query);if(!item.hidden)visible++;}
 count.textContent=visible+' of '+tiles.length+' glyphs shown';
});
for(const button of document.querySelectorAll('[data-glyph-size]')){
 button.addEventListener('click',()=>{
  const size=Number(button.dataset.glyphSize);
  if(![16,24,32].includes(size))return;
  grid.style.setProperty('--glyph-size',size+'px');
  for(const option of document.querySelectorAll('[data-glyph-size]'))
   option.setAttribute('aria-pressed',String(option===button));
 });
}
count.textContent=names.length+' of '+names.length+' glyphs shown';
