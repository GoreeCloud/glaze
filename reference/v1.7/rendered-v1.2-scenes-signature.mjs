import {resolveGlazeSignatureMotion} from '../../js/glaze-v1.7-signature-motion-system.dev.mjs';
import {resolveGlazeConnectedTransformation} from '../../js/glaze-v1.7-connected-transformation-2.dev.mjs';
import {card,showCards} from './rendered-v1.2-qualification-shared.mjs';

export function renderSignatureScene(scene,stage,assertions){
  if(scene==='signature-motion'){
    const r=resolveGlazeSignatureMotion({
      relationship:'same-object-expansion',
      relationshipAuthoritative:true,
      objectIdentity:'memo-42',
      objectIdentityAuthoritative:true,
      fromState:'card',
      toState:'detail',
      userDriven:true
    });
    showCards(stage,'Signature motion',[
      card('Family',r.signature.family),
      card('Relationship',r.request.acceptedRelationship),
      card('Interruptible',r.motion.interaction.interruptible)
    ]);
    Object.assign(assertions,{
      signatureApplied:r.signature.signatureFamilyApplied===true&&r.signature.family==='Glaze Bloom',
      interruptible:r.motion.interaction.interruptible===true,
      finalStateIndependent:r.motion.presentation.finalStateDependsOnAnimationCompletion===false,
      presentationOnly:r.authority.presentationOnly===true
    });
    return r;
  }
  if(scene==='connected-transformations'){
    const r=resolveGlazeConnectedTransformation({
      connection:'card-to-detail-view',
      connectionAuthoritative:true,
      connectionIdentity:'memo-42',
      connectionIdentityAuthoritative:true,
      userDriven:true,
      fromState:'card',
      toState:'detail'
    });
    showCards(stage,'Connected transformation',[
      card('Connection',r.connection.requested),
      card('Mode',r.transformation.mode),
      card('Family',r.transformation.family)
    ]);
    Object.assign(assertions,{
      connectionAccepted:r.sourceFoundation.connectionAccepted===true,
      connectedMode:r.transformation.mode==='connected-transformation',
      identityPreserved:r.continuity.objectIdentityPreserved===true,
      stateIndependent:r.continuity.stateDependsOnAnimationCompletion===false
    });
    return r;
  }
  return null;
}
