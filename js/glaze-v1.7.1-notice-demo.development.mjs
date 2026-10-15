/* Development-only example notices. */
const notice=document.getElementById('glaze-notice-preview');
const title=document.getElementById('glaze-notice-title');
const body=document.getElementById('glaze-notice-body');
const close=document.getElementById('glaze-notice-dismiss');
const examples={
 security:['Security example','Sample safeguard completed, not a real protection result.'],
 warning:['Attention example','Example review needed, not a detected issue.'],
 privacy:['Privacy example','Example access control, not a real permission check.']
};
let opener=null;
for(const b of document.querySelectorAll('[data-notice-demo]')){
 b.addEventListener('click',()=>{
  const type=b.dataset.noticeDemo;
  if(!Object.hasOwn(examples,type))return;
  opener=b;notice.dataset.tone=type;
  title.textContent=examples[type][0];body.textContent=examples[type][1];
  document.getElementById('glaze-notice-glyph').setAttribute('href','../../assets/icon-glyphs/system-symbols.svg#'+type);
  notice.hidden=false;close.focus();
 });
}
function dismiss(){notice.hidden=true;if(opener?.isConnected)opener.focus();}
close.addEventListener('click',dismiss);
notice.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dismiss();}});
