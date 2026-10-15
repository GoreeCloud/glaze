/* Synthetic Glaze 1.7.1 surface controls; presentation only, never persisted. */
const preview=document.getElementById('scene-material-preview');
const elevationButtons=[...document.querySelectorAll('[data-material-elevation]')];
const accentSwitch=document.getElementById('scene-material-accent');
const radiusInput=document.getElementById('scene-material-radius');
const radiusOutput=document.getElementById('scene-material-radius-output');
const feedback=document.getElementById('scene-material-feedback');
const elevations=new Set(['flat','raised','outlined']);
function updateFeedback(){
 feedback.textContent='Example: '+preview.dataset.elevation+' surface, '+radiusInput.value+'px corners, decorative accent '+(accentSwitch.getAttribute('aria-checked')==='true'?'on':'off')+'. No preference was saved.';
}
function setElevation(value){
 if(!elevations.has(value))return;
 preview.dataset.elevation=value;
 for(const button of elevationButtons)button.setAttribute('aria-pressed',String(button.dataset.materialElevation===value));
 updateFeedback();
}
for(const button of elevationButtons)button.addEventListener('click',()=>setElevation(button.dataset.materialElevation));
accentSwitch.addEventListener('click',()=>{
 const active=accentSwitch.getAttribute('aria-checked')!=='true';
 accentSwitch.setAttribute('aria-checked',String(active));
 preview.dataset.accent=active?'on':'off';
 updateFeedback();
});
radiusInput.addEventListener('input',()=>{
 const value=Number(radiusInput.value);
 if(!Number.isFinite(value)||value<8||value>28)return;
 preview.style.setProperty('--scene-radius',value+'px');
 radiusOutput.value=value+'px';
 radiusOutput.textContent=value+'px';
 updateFeedback();
});
setElevation('flat');
