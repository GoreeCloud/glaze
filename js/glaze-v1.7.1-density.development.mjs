/* Development-only interaction density for Glaze examples. */
export const options=Object.freeze(['comfortable','compact']);
export function applyDensity(root,choice,buttons=[]) {
  if(!root || !options.includes(choice)) return false;
  root.dataset.glazeDensity=choice;
  for(const b of buttons) if(b.dataset?.density)
    b.setAttribute('aria-pressed',String(b.dataset.density===choice));
  return true;
}
export function wireDensity(root,scope,status) {
  const buttons=Array.from(scope.querySelectorAll('[data-density]'));
  function change(choice) {
    if(!applyDensity(root,choice,buttons))return;
    if(status)status.textContent='Sample density: '+choice+'. No setting was saved.';
  }
  for(const b of buttons)b.addEventListener('click',()=>change(b.dataset.density));
  applyDensity(root,'comfortable',buttons);
  return change;
}
