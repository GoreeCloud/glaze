#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeAdaptiveCompositionMotion,
  glazeV17AdaptiveCompositionMotionDevelopmentContract
} from '../js/glaze-v1.7-adaptive-composition-motion.dev.mjs';
import {glazeV17ConnectedTransformation2DevelopmentContract} from '../js/glaze-v1.7-connected-transformation-2.dev.mjs';
import {glazeV17SignatureTransitionFamiliesDevelopmentContract} from '../js/glaze-v1.7-signature-transition-families.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/adaptive-composition-motion.dev.json');
const schema=json('schemas/v1.7-adaptive-composition-motion.schema.json');
const tokens=json('tokens/glaze-v1.7-adaptive-composition-motion.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const glazeMotion=json('tokens/glaze-motion.json');

const changes=[
  'reposition','resize','hierarchy-change','move-between-panes',
  'merge','separate','reorder','material-level-change'
];
const expected={
  'reposition':{relationship:'workspace-recomposition',family:'Glaze Flow'},
  'resize':{relationship:'workspace-recomposition',family:'Glaze Flow'},
  'hierarchy-change':{relationship:'workspace-recomposition',family:'Glaze Flow'},
  'move-between-panes':{relationship:'workspace-recomposition',family:'Glaze Flow'},
  'merge':{relationship:'posture-partition',family:'Glaze Fold'},
  'separate':{relationship:'posture-partition',family:'Glaze Fold'},
  'reorder':{relationship:'workspace-recomposition',family:'Glaze Flow'},
  'material-level-change':{relationship:'material-role-change',family:'Glaze Material Shift'}
};

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.18 must not create lifecycle promotion state');

for(const phrase of [
  '## 26. Adaptive Composition Motion',
  'Reposition',
  'Resize',
  'Change hierarchy',
  'Move between panes',
  'Merge',
  'Separate',
  'Reorder',
  'Change material level',
  'without creating unnecessary disappearance/reappearance',
  'Mobile ↔ Tablet-like resizing',
  'foldable posture changes',
  'desktop window resizing',
  'multi-pane workspaces'
]) assert(spec.includes(phrase),'Section 26 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.18'&&contract.planVersion==='v1.2'&&contract.consumerEligible===false,'dev.18 contract identity mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([26]),'dev.18 section marker mismatch');
assert(contract.dependsOn.connectedTransformationVersion==='1.7.0-dev.17','dev.17 dependency mismatch');
assert(contract.dependsOn.signatureTransitionFamiliesVersion==='1.7.0-dev.16','dev.16 dependency mismatch');
assert(JSON.stringify(contract.compositionChangeOrder)===JSON.stringify(changes),'composition change order mismatch');
assert(Object.keys(contract.compositionPolicy).length===8,'composition policy count mismatch');
assert(contract.requestPolicy.compositionAuthorityRequired===true&&contract.requestPolicy.compositionIdentityAuthorityRequired===true,'composition authority boundary weakened');
assert(contract.requestPolicy.arbitraryRelationshipRequestAccepted===false&&contract.requestPolicy.directFamilyRequestAccepted===false,'direct relationship/family boundary weakened');
assert(contract.continuity.preserveSpatialUnderstanding===true&&contract.continuity.unnecessaryDisappearReappearAllowed===false,'spatial continuity boundary weakened');
assert(contract.continuity.layoutCommitDependsOnAnimationCompletion===false&&contract.continuity.taskCompletionDependsOnAnimationCompletion===false,'animation completion dependency introduced');
assert(contract.authority.compositionChangeCreatedByGlaze===false&&contract.authority.compositionIdentityCreatedByGlaze===false,'composition authority manufactured');
assert(contract.authority.formFactorTruthCreatedByGlaze===false&&contract.authority.windowStateCreatedByGlaze===false&&contract.authority.paneStateCreatedByGlaze===false,'layout/platform truth manufactured');
assert(contract.accessibility.reducedMotionPrecedence===true&&contract.accessibility.motionRequiredToUnderstandComposition===false,'accessibility boundary weakened');
assert(contract.performance.finalCompositionMustRemainCorrect===true&&contract.performance.measuredPerformanceAcceptanceEstablished===false,'performance boundary weakened');
assert(contract.acceptanceBoundary.adaptiveCompositionCatalogImplemented===true&&contract.acceptanceBoundary.section26Complete===false,'Section 26 source boundary mismatch');
assert(contract.acceptanceBoundary.renderedAcceptanceEstablished===false&&contract.acceptanceBoundary.nativePlatformAcceptanceEstablished===false,'acceptance overclaim');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

assert(tokens.version==='1.7.0-dev.18'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.fallbacks.missingCompositionIdentity==='immediate-final-composition','missing composition identity fallback missing');
assert(tokens.fallbacks.reducedMotion==='immediate-recomposition-with-focus-continuity','Reduced Motion fallback missing');
assert(tokens.boundaries.section26Complete===false&&tokens.boundaries.glazeMotionExperimentalLifecyclePromoted===false,'token lifecycle/completion boundary weakened');

for(const change of changes){
  const resolved=resolveGlazeAdaptiveCompositionMotion({
    compositionChange:change,
    compositionAuthoritative:true,
    compositionIdentity:'layout-42',
    compositionIdentityAuthoritative:true,
    fromComposition:'before',
    toComposition:'after',
    adaptiveContext:'multi-pane-workspace'
  });
  assert(resolved.version==='1.7.0-dev.18','runtime version mismatch: '+change);
  assert(resolved.sourceFoundation.compositionAccepted===true,'composition rejected: '+change);
  assert(resolved.sourceFoundation.acceptedCompositionChange===change,'accepted change mismatch: '+change);
  assert(resolved.composition.mode==='adaptive-composition-motion','adaptive composition mode missing: '+change);
  assert(resolved.motion.relationship===expected[change].relationship,'relationship mismatch: '+change);
  assert(resolved.motion.family===expected[change].family,'family mismatch: '+change);
  assert(resolved.motion.unnecessaryDisappearReappearAllowed===false,'disappear/reappear boundary weakened: '+change);
  assert(resolved.continuity.spatialUnderstandingPreserved===true&&resolved.continuity.taskIdentityPreserved===true,'continuity lost: '+change);
  assert(resolved.continuity.focusOrderPreserved===true&&resolved.continuity.readingOrderPreserved===true,'accessibility order lost: '+change);
  assert(resolved.continuity.layoutCommitDependsOnAnimationCompletion===false,'layout blocked by animation: '+change);
  assert(resolved.authority.providerTruthCreatedByGlaze===false&&resolved.authority.stateChangedByMotion===false,'authority boundary weakened: '+change);
  assert(resolved.acceptanceBoundary.section26Complete===false,'Section 26 completion overclaim: '+change);
}

for(const compositionIdentity of [undefined,null,'','   ']){
  const resolved=resolveGlazeAdaptiveCompositionMotion({
    compositionChange:'resize',
    compositionAuthoritative:true,
    compositionIdentity,
    compositionIdentityAuthoritative:true,
    fromComposition:'compact',
    toComposition:'expanded'
  });
  assert(resolved.sourceFoundation.compositionAccepted===false,'unclear composition identity accepted');
  assert(resolved.composition.mode==='immediate-final-composition','unclear identity did not fall back');
  assert(resolved.composition.fallbackReason==='unclear-composition-identity','unclear identity fallback reason mismatch');
}

const untrusted=resolveGlazeAdaptiveCompositionMotion({
  compositionChange:'reposition',
  compositionAuthoritative:false,
  compositionIdentity:'layout-42',
  compositionIdentityAuthoritative:true,
  fromComposition:'before',
  toComposition:'after'
});
assert(untrusted.sourceFoundation.compositionAccepted===false,'untrusted composition accepted');
assert(untrusted.composition.fallbackReason==='untrusted-composition-change','untrusted composition fallback mismatch');

const incomplete=resolveGlazeAdaptiveCompositionMotion({
  compositionChange:'merge',
  compositionAuthoritative:true,
  compositionIdentity:'layout-42',
  compositionIdentityAuthoritative:true,
  fromComposition:'before'
});
assert(incomplete.sourceFoundation.compositionAccepted===false,'incomplete composition state accepted');
assert(incomplete.composition.fallbackReason==='incomplete-composition-state','incomplete composition fallback mismatch');

const reduced=resolveGlazeAdaptiveCompositionMotion({
  compositionChange:'move-between-panes',
  compositionAuthoritative:true,
  compositionIdentity:'layout-42',
  compositionIdentityAuthoritative:true,
  fromComposition:'single-pane',
  toComposition:'dual-pane',
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.accessibility.reducedMotionApplied===true&&reduced.accessibility.immediateRecompositionEquivalent===true,'Reduced Motion not applied');
assert(reduced.motion.channels.every(channel=>channel.enabled===false),'Reduced Motion did not suppress choreography channels');
assert(reduced.accessibility.motionRequiredToUnderstandComposition===false,'composition understanding depends on motion');

const pressured=resolveGlazeAdaptiveCompositionMotion({
  compositionChange:'resize',
  compositionAuthoritative:true,
  compositionIdentity:'layout-42',
  compositionIdentityAuthoritative:true,
  fromComposition:'compact',
  toComposition:'wide',
  performancePressure:true
});
assert(pressured.performance.degradationApplied===true&&pressured.performance.finalCompositionCorrect===true,'performance degradation boundary failed');

for(const key of ['relationship','family','durationMs','easing','spring','physics','keyframes','path','travelPx','distance','rotation','overshoot','bounce','wobble']){
  let failed=false;
  try{
    resolveGlazeAdaptiveCompositionMotion({
      compositionChange:'resize',
      compositionAuthoritative:true,
      compositionIdentity:'layout-42',
      compositionIdentityAuthoritative:true,
      fromComposition:'before',
      toComposition:'after',
      [key]:'arbitrary'
    });
  }catch{failed=true;}
  assert(failed,'direct/raw motion request accepted: '+key);
}

assert(glazeV17ConnectedTransformation2DevelopmentContract.version==='1.7.0-dev.17','dev.17 identity changed');
assert(glazeV17ConnectedTransformation2DevelopmentContract.section25Complete===false,'dev.17 relabeled as Section 25 complete');
assert(glazeV17SignatureTransitionFamiliesDevelopmentContract.version==='1.7.0-dev.16','dev.16 identity changed');
assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');

assert(glazeV17AdaptiveCompositionMotionDevelopmentContract.version==='1.7.0-dev.18','runtime contract version mismatch');
assert(glazeV17AdaptiveCompositionMotionDevelopmentContract.section26Complete===false,'runtime contract completion overclaim');
const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=18,'aggregate version regressed below dev.18');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.adaptiveCompositionMotionFoundation==='js/glaze-v1.7-adaptive-composition-motion.dev.mjs','aggregate missing dev.18 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(spec.includes('dev.18')&&spec.includes('Adaptive Composition Motion'),'plan provenance boundary missing dev.18');
assert(planned.includes('1.7.0-dev.18')&&planned.includes('Adaptive Composition Motion'),'planned-feature control missing dev.18');
assert(implemented.includes('Adaptive Composition Motion — `1.7.0-dev.18`'),'implemented-feature control missing dev.18');
assert(changelog.includes('1.7.0-dev.18')&&changelog.includes('Adaptive Composition Motion'),'changelog missing dev.18');

console.log('GLAZE UI V1.7 Adaptive Composition Motion Development foundation: PASS');
console.log('Plan binding: v1.2 Section 26');
console.log('Adaptive composition changes: 8');
console.log('Adaptive contexts: 4');
console.log('Section 26 complete: false');
console.log('Rendered/native/performance acceptance: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
