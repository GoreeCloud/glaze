import {resolveGlazeFormFactorProfile} from '../../js/glaze-v1.7-form-factor-profiles.dev.mjs';
import {card,showCards} from './rendered-v1.2-qualification-shared.mjs';

const supported=new Set(['mobile','tablet','desktop','foldable','tv','wearable']);

export function renderFormFactorScene(scene,profileParam,posture,stage,assertions){
  if(!supported.has(scene))return null;
  const profile=profileParam||scene;
  const r=resolveGlazeFormFactorProfile({
    profile,
    posture:profile==='foldable'?posture:'unknown',
    semanticSurfaceId:'representative-task'
  });
  const composition=r.expectations.paneBehavior==='multi-pane'?'multi-pane':
    r.expectations.paneBehavior==='single-pane'?'single-pane':'dual-pane';
  showCards(stage,profile+' profile',[
    card('Pane behavior',r.expectations.paneBehavior),
    card('Viewing distance',r.expectations.viewingDistance),
    card('Typography',r.expectations.typography)
  ],composition);
  Object.assign(assertions,{
    profileResolved:r.profile===profile,
    semanticIdentityPreserved:r.composition.semanticIdentityPreserved===true,
    accessibilitySemanticsPreserved:r.composition.accessibilitySemanticsPreserved===true,
    nativeAcceptanceNotImplied:r.supportBoundary.nativeDeviceAcceptanceImplied===false,
    widthNotAuthority:r.authority.widthAloneIsProfileAuthority===false
  });
  return r;
}
