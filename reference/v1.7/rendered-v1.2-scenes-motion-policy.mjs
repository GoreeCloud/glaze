import {resolveGlazeSignatureMotionPrinciples} from '../../js/glaze-v1.7-signature-motion-principles.dev.mjs';
import {resolveGlazeReducedMotionEquivalent} from '../../js/glaze-v1.7-reduced-motion-equivalents.dev.mjs';
import {card,showCards} from './rendered-v1.2-qualification-shared.mjs';

export function renderMotionPolicyScene(scene,stage,assertions){
  if(scene==='animation-interruption'||scene==='animation-reversal'){
    const r=resolveGlazeSignatureMotionPrinciples({
      relationship:'direct-manipulation-settle',
      relationshipAuthoritative:true,
      userDriven:true,
      directManipulation:true,
      fromState:'dragging',
      toState:'settled'
    });
    const policy=r.principles.remainInterruptible;
    showCards(stage,scene==='animation-interruption'?'Animation interruption':'Animation reversal',[
      card('User controlled',policy.userControlled),
      card('Interruptibility satisfied',policy.interruptibilitySatisfied),
      card('Reversal blocked',policy.reversalMayBeBlockedByAnimation)
    ]);
    Object.assign(assertions,{
      userControlled:policy.userControlled===true,
      interruptibilityRequired:policy.interruptibilityRequired===true,
      interruptibilitySatisfied:policy.interruptibilitySatisfied===true,
      reversalNotBlocked:policy.reversalMayBeBlockedByAnimation===false
    });
    return policy;
  }
  if(scene==='reduced-motion'){
    const r=resolveGlazeReducedMotionEquivalent({
      relationship:'same-object-expansion',
      relationshipAuthoritative:true,
      objectIdentity:'memo-42',
      objectIdentityAuthoritative:true,
      accessibilityProfiles:['reduced-motion'],
      fromState:'card',
      toState:'detail',
      userDriven:true
    });
    showCards(stage,'Reduced Motion',[
      card('Family',r.equivalent.family),
      card('Equivalent applied',r.equivalent.applied),
      card('State preserved',r.equivalent.statePreserved)
    ]);
    Object.assign(assertions,{
      reducedMotionApplied:r.accessibility.reducedMotionApplied===true,
      equivalentApplied:r.equivalent.applied===true,
      statePreserved:r.equivalent.statePreserved===true,
      motionNotRequired:r.accessibility.motionRequiredToUnderstandState===false
    });
    return r.equivalent;
  }
  return null;
}
