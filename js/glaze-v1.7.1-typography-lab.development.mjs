/* Glaze 1.7.1 — synthetic type scale preview, no preferences stored. */
const sample=document.getElementById('scene-type-sample');
const typeStatus=document.getElementById('scene-type-feedback');
const scaleOptions=[...document.querySelectorAll('[data-type-scale]')];
const leadingOptions=[...document.querySelectorAll('[data-type-leading]')];
const typeScales={standard:15,relaxed:18,large:21};
const leadingValues={balanced:1.5,airy:1.85};
let scale='standard',leading='balanced';
function updateTypography(){
 sample.style.setProperty('--type-size',typeScales[scale]+'px');
 sample.style.setProperty('--type-leading',String(leadingValues[leading]));
 for(const button of scaleOptions)button.setAttribute('aria-pressed',String(button.dataset.typeScale===scale));
 for(const button of leadingOptions)button.setAttribute('aria-pressed',String(button.dataset.typeLeading===leading));
 typeStatus.textContent='Illustrative '+scale+' text and '+leading+' line spacing. No setting was saved.';
}
for(const button of scaleOptions)button.addEventListener('click',()=>{
 if(!Object.hasOwn(typeScales,button.dataset.typeScale))return;
 scale=button.dataset.typeScale;updateTypography();
});
for(const button of leadingOptions)button.addEventListener('click',()=>{
 if(!Object.hasOwn(leadingValues,button.dataset.typeLeading))return;
 leading=button.dataset.typeLeading;updateTypography();
});
updateTypography();
