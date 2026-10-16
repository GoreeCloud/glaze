/* Glaze 1.7.1 — synthetic settings and validation, with no persistence or network. */
const form=document.getElementById('scene-form');
const nameInput=document.getElementById('scene-form-name');
const error=document.getElementById('scene-form-error');
const previewToggle=document.getElementById('scene-form-preview-toggle');
const result=document.getElementById('scene-form-result');
const title=document.getElementById('scene-form-result-title');
const meta=document.getElementById('scene-form-result-meta');
const icon=document.getElementById('scene-form-result-icon');
const status=document.getElementById('scene-form-status');
const defaultName='Your workspace';
function hideError(){nameInput.removeAttribute('aria-invalid');error.dataset.visible='false';}
function setError(message){error.textContent=message;error.dataset.visible='true';nameInput.setAttribute('aria-invalid','true');}
nameInput.addEventListener('input',()=>{if(nameInput.value.trim().length)hideError();});
previewToggle.addEventListener('change',()=>{
 result.dataset.preview=previewToggle.checked?'visible':'hidden';
 status.textContent=previewToggle.checked?'Example card preview enabled. Nothing was saved.':'Example card preview muted. Nothing was saved.';
});
form.addEventListener('submit',event=>{
 event.preventDefault();
 const label=nameInput.value.trim();
 if(!label){setError('Enter a workspace name to preview this example.');nameInput.focus();status.textContent='Example form needs a workspace name; no request was sent.';return;}
 if(label.length>32){setError('Use 32 characters or fewer.');nameInput.focus();return;}
 hideError();
 const mode=form.querySelector('input[name="scene-workspace-mode"]:checked')?.value||'personal';
 title.textContent=label;
 meta.textContent=(mode==='team'?'Team workspace':'Personal workspace')+' · demonstration only';
 icon.setAttribute('href','../../assets/icon-glyphs/system-symbols.svg#'+(mode==='team'?'network':'account'));
 status.textContent='Example preview updated locally. No workspace was created or saved.';
});
form.addEventListener('reset',()=>{
 hideError();
 title.textContent=defaultName;
 meta.textContent='Personal workspace · demonstration only';
 icon.setAttribute('href','../../assets/icon-glyphs/system-symbols.svg#account');
 result.dataset.preview='visible';
 status.textContent='Example controls reset. No settings were saved.';
});
