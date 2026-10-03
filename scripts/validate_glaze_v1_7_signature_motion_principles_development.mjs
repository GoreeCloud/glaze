#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeSignatureMotionPrinciples,
  glazeV17SignatureMotionPrinciplesDevelopmentContract
} from '../js/glaze-v1.7-signature-motion-principles.dev.mjs';
import {
  resolveGlazeSignatureMotion,
  glazeV17SignatureMotionSystemDevelopmentContract
} from '../js/glaze-v1.7-signature-motion-system.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/signature-motion-principles.dev.json');
const schema=json('schemas/v1.7-signature-motion-principles.schema.json');
const tokens=json('tokens/glaze-v1.7-signature-motion-principles.dev.json');
const lifecycle=json('registry/lifecycle.json');
const stable=read('VERSION').trim();
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const glazeMotionTokens=json('tokens/glaze-motion.json');
const glazeMotionDoc=read('GLAZE_MOTION.md');

const principles=[
  'respond-immediately',
  'move-with-purpose',
  'preserve-identity',
  'use-depth-meaningfully',
  'settle-quietly',
  'remain-interruptible',
  'never-block-state',
  'respect-accessibility'
];

const relationships=[
  'same-object-expansion',
  'workspace-recomposition',
  'transient-elevation',
  'context-overlay',
  'posture-partition',
  'source-destination-continuity',
  'direct-manipulation-settle',
  'focus-transfer',
  'color-state-change',
  'material-role-change'
];

const expected={
  'same-object-expansion':{purpose:'state-relationship',depthRole:'none',identityMode:'authoritative-required',settlingRole:'quiet'},
  'workspace-recomposition':{purpose:'task-continuity',depthRole:'none',identityMode:'task-preserving',settlingRole:'quiet'},
  'transient-elevation':{purpose:'hierarchy-change',depthRole:'transient-hierarchy',identityMode:'none',settlingRole:'quiet'},
  'context-overlay':{purpose:'attention-hierarchy',depthRole:'overlay-hierarchy',identityMode:'none',settlingRole:'quiet'},
  'posture-partition':{purpose:'workspace-structure',depthRole:'none',identityMode:'task-preserving',settlingRole:'quiet'},
  'source-destination-continuity':{purpose:'source-destination',depthRole:'none',identityMode:'authoritative-required',settlingRole:'quiet'},
  'direct-manipulation-settle':{purpose:'direct-manipulation',depthRole:'none',identityMode:'none',settlingRole:'precise'},
  'focus-transfer':{purpose:'focus-relationship',depthRole:'none',identityMode:'focus-preserving',settlingRole:'quiet'},
  'color-state-change':{purpose:'state-change',depthRole:'none',identityMode:'none',settlingRole:'quiet'},
  'material-role-change':{purpose:'material-hierarchy',depthRole:'material-hierarchy',identityMode:'none',settlingRole:'quiet'}
};

const identityRelationships=new Set(['same-object-expansion','source-destination-continuity']);

assert(stable==='1.7.0','dev.15 must coexist with bounded Glaze V1.7 / 1.7.0');
assert(lifecycle.currentOfficial===stable&&lifecycle.currentStable===stable,'V1.6 compatibility authority mismatch');
assert(lifecycle.currentLifecycle==='anchor','V1.6 must remain canonical Anchor');
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'dev.15 must not create Candidate state');
assert(lifecycle.plannedNext==='1.7.1','dev.15 must not mutate lifecycle plannedNext');

for(const phrase of [
  '## 23. Signature Motion Principles',
  '**Respond immediately.**',
  '**Move with purpose.**',
  '**Preserve identity.**',
  '**Use depth meaningfully.**',
  '**Settle quietly.**',
  '**Remain interruptible.**',
  '**Never block state.**',
  '**Respect accessibility.**',
  'User-controlled transitions must be reversible or interruptible where appropriate.',
  'State updates, focus changes, navigation, close actions, and task completion must never depend on an animation finishing.',
  'Reduced Motion and other accessibility requirements take precedence over visual expression.'
]) assert(spec.includes(phrase),`V1.7 v1.2 Section 23 requirement missing: ${phrase}`);
assert(spec.includes('## 24. Glaze Signature Transition Families'),'Section 24 must remain a separate choreography obligation');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.15'&&contract.lifecycle==='Development'&&contract.consumerEligible===false,'contract lifecycle mismatch');
assert(contract.planVersion==='v1.2','dev.15 must bind to plan v1.2');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([23]),'dev.15 Section 23 marker mismatch');
assert(contract.dependsOn.signatureMotionSystemVersion==='1.7.0-dev.14','dev.15 must depend on dev.14');
assert(JSON.stringify(contract.principleOrder)===JSON.stringify(principles),'Section 23 principle order mismatch');
assert(Object.keys(contract.relationshipInterpretation).length===10,'relationship interpretation catalog mismatch');

const pp=contract.principlePolicy;
assert(pp['respond-immediately'].artificialDelayAllowed===false,'artificial delay boundary weakened');
assert(pp['respond-immediately'].measuredResponsivenessAcceptanceEstablished===false,'source policy must not claim measured responsiveness acceptance');
assert(pp['move-with-purpose'].semanticRelationshipRequired===true&&pp['move-with-purpose'].arbitraryAnimationAccepted===false,'purpose boundary weakened');
assert(pp['preserve-identity'].authoritativeIdentityRequiredForConnectedIdentity===true&&pp['preserve-identity'].identityMayBeInferredByGlaze===false,'identity boundary weakened');
assert(pp['use-depth-meaningfully'].depthMustCommunicateHierarchy===true&&pp['use-depth-meaningfully'].rawDepthControlAccepted===false,'depth boundary weakened');
assert(pp['settle-quietly'].routineBounceAllowed===false&&pp['settle-quietly'].routineWobbleAllowed===false&&pp['settle-quietly'].repetitiveOvershootAllowed===false,'quiet settling boundary weakened');
assert(pp['remain-interruptible'].userControlledTransitionsInterruptible===true&&pp['remain-interruptible'].reversalMayBeBlockedByAnimation===false,'interruptibility boundary weakened');
assert(pp['never-block-state'].finalStateDependsOnAnimationCompletion===false&&pp['never-block-state'].taskCompletionBlockedByAnimation===false,'state blocking boundary weakened');
assert(pp['respect-accessibility'].accessibilityPrecedence===true&&pp['respect-accessibility'].reducedMotionPrecedence===true&&pp['respect-accessibility'].expressionMayOverrideAccessibility===false,'accessibility precedence weakened');

assert(contract.authority.providerTruthCreatedByGlaze===false&&contract.authority.hierarchyTruthCreatedByGlaze===false,'authority boundary weakened');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'dev.15 must not promote Experimental Glaze Motion');
assert(contract.acceptanceBoundary.sourceFoundationOnly===true&&contract.acceptanceBoundary.section23Complete===false,'dev.15 must remain a bounded Section 23 source foundation');
assert(contract.acceptanceBoundary.section24ChoreographyComplete===false,'dev.15 must not claim Section 24 choreography');
assert(contract.acceptanceBoundary.measuredResponsivenessAcceptanceEstablished===false,'dev.15 must not claim measured responsiveness acceptance');

assert(tokens.version==='1.7.0-dev.15'&&tokens.planVersion==='v1.2'&&tokens.consumerEligible===false,'token lifecycle mismatch');
assert(JSON.stringify(tokens.principleOrder)===JSON.stringify(principles),'token principle order mismatch');
assert(tokens.boundaries.section23Complete===false&&tokens.boundaries.section24ChoreographyComplete===false,'token completion boundary weakened');
assert(tokens.boundaries.glazeMotionExperimentalLifecyclePromoted===false,'token map must keep Glaze Motion Experimental');
assert(tokens.boundaries.measuredResponsivenessAcceptanceEstablished===false,'token map must not claim measured responsiveness acceptance');

for(const relationship of relationships){
  const input={relationship,relationshipAuthoritative:true,fromState:'before',toState:'after'};
  if(identityRelationships.has(relationship)){
    input.objectIdentity='surface-42';
    input.objectIdentityAuthoritative=true;
  }
  const resolved=resolveGlazeSignatureMotionPrinciples(input);
  const want=expected[relationship];

  assert(resolved.version==='1.7.0-dev.15'&&resolved.planVersion==='v1.2',`runtime version mismatch: ${relationship}`);
  assert(resolved.sourceFoundation.signatureMotionSystemVersion==='1.7.0-dev.14',`dev.14 dependency mismatch: ${relationship}`);
  assert(resolved.sourceFoundation.relationshipAccepted===true,`relationship not accepted: ${relationship}`);
  assert(resolved.principles.respondImmediately.artificialDelayAllowed===false,`artificial delay allowed: ${relationship}`);
  assert(resolved.principles.respondImmediately.measuredResponsivenessAcceptanceEstablished===false,`measured responsiveness overclaim: ${relationship}`);
  assert(resolved.principles.moveWithPurpose.purpose===want.purpose,`purpose mismatch: ${relationship}`);
  assert(resolved.principles.moveWithPurpose.decorativeOnlyMotionDefault===false,`decorative-only default introduced: ${relationship}`);
  assert(resolved.principles.preserveIdentity.identityMode===want.identityMode,`identity mode mismatch: ${relationship}`);
  assert(resolved.principles.useDepthMeaningfully.depthRole===want.depthRole,`depth role mismatch: ${relationship}`);
  assert(resolved.principles.useDepthMeaningfully.spectacleOnlyDepthAllowed===false,`spectacle-only depth enabled: ${relationship}`);
  assert(resolved.principles.settleQuietly.settlingRole===want.settlingRole,`settling role mismatch: ${relationship}`);
  assert(resolved.principles.settleQuietly.routineBounceAllowed===false&&resolved.principles.settleQuietly.repetitiveOvershootAllowed===false,`quiet settling weakened: ${relationship}`);
  assert(resolved.principles.remainInterruptible.interruptibilityRequired===true&&resolved.principles.remainInterruptible.interruptibilitySatisfied===true,`user-controlled interruptibility missing: ${relationship}`);
  assert(resolved.principles.remainInterruptible.reversalMayBeBlockedByAnimation===false,`reversal blocking introduced: ${relationship}`);
  assert(resolved.principles.neverBlockState.finalStateDependsOnAnimationCompletion===false,`animation completion dependency introduced: ${relationship}`);
  assert(resolved.principles.neverBlockState.navigationBlockedByAnimation===false&&resolved.principles.neverBlockState.closeBlockedByAnimation===false&&resolved.principles.neverBlockState.taskCompletionBlockedByAnimation===false,`state blocking introduced: ${relationship}`);
  assert(resolved.principles.respectAccessibility.accessibilityPrecedence===true&&resolved.principles.respectAccessibility.motionRequiredToUnderstandState===false,`accessibility boundary weakened: ${relationship}`);
  assert(resolved.authority.providerTruthCreatedByGlaze===false&&resolved.authority.stateChangedByMotion===false,`authority boundary weakened: ${relationship}`);
  assert(resolved.acceptanceBoundary.section23Complete===false&&resolved.acceptanceBoundary.section24ChoreographyComplete===false,`completion overclaim: ${relationship}`);
}

const untrusted=resolveGlazeSignatureMotionPrinciples({relationship:'workspace-recomposition',relationshipAuthoritative:false});
assert(untrusted.sourceFoundation.relationshipAccepted===false,'untrusted relationship must fail closed');
assert(untrusted.principles.moveWithPurpose.purpose==='fallback-replacement','untrusted relationship must use fallback purpose');
assert(untrusted.principles.useDepthMeaningfully.depthRole==='none','untrusted relationship must not receive semantic depth');
assert(untrusted.signatureMotion.signature.family==='Standard transition','untrusted relationship must fall back to standard transition');

for(const relationship of identityRelationships){
  for(const objectIdentity of [undefined,null,'','   ']){
    const resolved=resolveGlazeSignatureMotionPrinciples({
      relationship,
      relationshipAuthoritative:true,
      objectIdentity,
      objectIdentityAuthoritative:true
    });
    assert(resolved.sourceFoundation.relationshipAccepted===false,'missing identity must fail connected relationship closed');
    assert(resolved.principles.preserveIdentity.identityClaimApplied===false,'missing identity must not claim preserved identity');
    assert(resolved.signatureMotion.continuity.conceptualIdentitySame===false,'missing identity must not assert conceptual same-object continuity');
  }
}

const reduced=resolveGlazeSignatureMotionPrinciples({
  relationship:'same-object-expansion',
  relationshipAuthoritative:true,
  objectIdentity:'surface-42',
  objectIdentityAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.principles.respectAccessibility.reducedMotionApplied===true,'Reduced Motion must take precedence');
assert(reduced.signatureMotion.motion.presentation.continuousMotionAllowed===false,'Reduced Motion must disable continuous motion');
assert(reduced.principles.respectAccessibility.motionRequiredToUnderstandState===false,'Reduced Motion must preserve state understanding');

const direct=resolveGlazeSignatureMotionPrinciples({
  relationship:'direct-manipulation-settle',
  relationshipAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(direct.principles.settleQuietly.settlingRole==='precise','direct manipulation must use precise settling role');
assert(direct.principles.respectAccessibility.directManipulationTrackingPreserved===true,'Reduced Motion must preserve direct manipulation tracking');
assert(direct.signatureMotion.motion.presentation.spatialTravelAllowed===true,'active direct manipulation tracking must remain spatial');

const systemDriven=resolveGlazeSignatureMotionPrinciples({
  relationship:'color-state-change',
  relationshipAuthoritative:true,
  userDriven:false
});
assert(systemDriven.principles.remainInterruptible.userControlled===false,'system-driven transition misclassified');
assert(systemDriven.principles.remainInterruptible.interruptibilityRequired===false,'system-driven transition should not manufacture a user-control requirement');

for(const key of ['depth','depthPx','translateZ','bounce','wobble']){
  let failed=false;
  try{resolveGlazeSignatureMotionPrinciples({relationship:'workspace-recomposition',relationshipAuthoritative:true,[key]:1});}catch{failed=true;}
  assert(failed,`raw principle control must fail closed: ${key}`);
}
for(const key of ['family','durationMs','easing','spring','physics','keyframes']){
  let failed=false;
  try{resolveGlazeSignatureMotionPrinciples({relationship:'workspace-recomposition',relationshipAuthoritative:true,[key]:'arbitrary'});}catch{failed=true;}
  assert(failed,`dev.14 raw motion boundary must remain enforced: ${key}`);
}

const dev14=resolveGlazeSignatureMotion({
  relationship:'same-object-expansion',
  relationshipAuthoritative:true,
  objectIdentity:'surface-42',
  objectIdentityAuthoritative:true
});
assert(dev14.version==='1.7.0-dev.14','dev.14 runtime identity must remain unchanged');
assert(glazeV17SignatureMotionSystemDevelopmentContract.version==='1.7.0-dev.14','dev.14 contract identity must remain unchanged');
assert(glazeV17SignatureMotionSystemDevelopmentContract.section23PrinciplesComplete===false,'dev.14 must not be relabeled as Section 23 complete');

assert(glazeMotionTokens.glazeMotion.version==='0.6.0'&&glazeMotionTokens.glazeMotion.status==='experimental','Glaze Motion 0.6 must remain Experimental');
assert(glazeMotionTokens.glazeMotion.runtimeCompatibilityBaseline==='0.4.0','Glaze Motion runtime compatibility baseline changed unexpectedly');
assert(glazeMotionTokens.tiers.core.status==='experimental'&&glazeMotionTokens.tiers.studio.status==='planned'&&glazeMotionTokens.tiers.spatial.status==='planned','Glaze Motion tier lifecycle changed');
assert(glazeMotionDoc.includes('Experimental foundation (0.6.0)'),'Glaze Motion documentation no longer identifies Experimental foundation');

assert(glazeV17SignatureMotionPrinciplesDevelopmentContract.version==='1.7.0-dev.15','runtime contract version mismatch');
assert(glazeV17SignatureMotionPrinciplesDevelopmentContract.planVersion==='v1.2','runtime contract plan mismatch');
assert(glazeV17SignatureMotionPrinciplesDevelopmentContract.section23Complete===false,'runtime contract must not claim Section 23 complete');
assert(glazeV17SignatureMotionPrinciplesDevelopmentContract.measuredResponsivenessAcceptanceEstablished===false,'runtime contract must not claim measured responsiveness acceptance');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=15,'aggregate version regressed below dev.15');
assert(glazeV17Development.lifecycle==='development'&&glazeV17Development.stableBaseline==='1.6.0'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
assert(glazeV17Development.planVersion==='v1.2','aggregate plan version mismatch');
assert(glazeV17Development.planV12FoundationSections.includes(22)&&glazeV17Development.planV12FoundationSections.includes(23),'aggregate v1.2 foundations missing Section 22 or 23');
assert(glazeV17Development.signatureMotionSystemFoundation==='js/glaze-v1.7-signature-motion-system.dev.mjs','aggregate lost dev.14 Signature Motion System');
assert(glazeV17Development.signatureMotionPrinciplesFoundation==='js/glaze-v1.7-signature-motion-principles.dev.mjs','aggregate missing dev.15 Signature Motion Principles');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate must keep Glaze Motion Experimental');
assert(glazeV17Development.providerTruthManufactured===false,'aggregate provider-truth boundary weakened');

assert(spec.includes('dev.15 adds the bounded **Section 23 — Signature Motion Principles** source layer')&&spec.includes('dev.15 does **not** establish Section 23 completion'),'V1.7 plan authority boundary missing dev.15 Section 23 provenance');
assert(planned.includes('1.7.0-dev.15')&&planned.includes('Signature Motion Principles'),'planned-feature control missing dev.15 state');
assert(implemented.includes('Signature Motion Principles — `1.7.0-dev.15`'),'implemented-feature control missing dev.15');
assert(changelog.includes('1.7.0-dev.15')&&changelog.includes('Signature Motion Principles'),'changelog missing dev.15');

console.log('GLAZE UI V1.7 Signature Motion Principles Development foundation: PASS');
console.log('Plan binding: v1.2 Section 23');
console.log('Principles: 8');
console.log('Section 23 complete: false');
console.log('Measured responsiveness acceptance: false');
console.log('Section 24 choreography complete: false');
console.log('Glaze Motion Experimental promoted: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
