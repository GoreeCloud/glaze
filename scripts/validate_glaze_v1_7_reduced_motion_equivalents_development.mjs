#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeReducedMotionEquivalent,
  glazeV17ReducedMotionEquivalentsDevelopmentContract
} from '../js/glaze-v1.7-reduced-motion-equivalents.dev.mjs';
import {glazeV17SignatureTransitionFamiliesDevelopmentContract} from '../js/glaze-v1.7-signature-transition-families.dev.mjs';
import {glazeV17MotionExpressionProfilesDevelopmentContract} from '../js/glaze-v1.7-motion-expression-profiles.dev.mjs';
import {glazeV17MotionPersonalizationDevelopmentContract} from '../js/glaze-v1.7-motion-personalization.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/reduced-motion-equivalents.dev.json');
const schema=json('schemas/v1.7-reduced-motion-equivalents.schema.json');
const tokens=json('tokens/glaze-v1.7-reduced-motion-equivalents.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('docs/development/v1.7-reduced-motion-equivalents-open-source-research-20260926.md');
const glazeMotion=json('tokens/glaze-motion.json');

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.23 must not create lifecycle promotion state');

for(const phrase of [
  '## 31. Reduced Motion Equivalents',
  'Bloom → opacity/shape-state replacement',
  'Flow → immediate recomposition with brief emphasis',
  'Lift → opacity change without travel',
  'Veil → immediate hierarchy change with restrained fade',
  'Fold → immediate layout replacement',
  'Trace → static destination highlight',
  'Settle → immediate final position',
  'Focus Transfer → immediate focus-ring update',
  'Color Shift → shortened or immediate palette replacement',
  'Material Shift → immediate material replacement',
  'Direct-manipulation tracking',
  'No critical interaction should require observing motion'
]) assert(spec.includes(phrase),'Section 31 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.23'&&contract.planVersion==='v1.2'&&contract.consumerEligible===false,'dev.23 contract identity mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([31]),'dev.23 section marker mismatch');
assert(Object.keys(contract.equivalents).length===10,'reduced-motion equivalent catalog must cover ten families');
for(const key of ['state','meaning','focus','navigation','taskContinuity','directManipulationTracking']) assert(contract.preservationRequirements[key]===true,'preservation requirement missing: '+key);
assert(contract.preservationRequirements.semanticStateReduced===false,'semantic state reduction enabled');
assert(contract.preservationRequirements.motionRequiredToUnderstandState===false,'motion made necessary to understand state');
assert(contract.preservationRequirements.criticalInteractionMayRequireObservingMotion===false,'critical interaction depends on observed motion');
assert(contract.requestPolicy.directFamilyRequestAccepted===false&&contract.requestPolicy.rawDurationAccepted===false&&contract.requestPolicy.rawEasingAccepted===false&&contract.requestPolicy.rawPhysicsAccepted===false,'raw motion/family boundary weakened');
assert(contract.authority.stateMutationPerformedByGlaze===false&&contract.authority.navigationPerformedByGlaze===false&&contract.authority.providerTruthCreatedByGlaze===false,'presentation authority expanded');
assert(contract.acceptanceBoundary.reducedMotionEquivalentCatalogImplemented===true&&contract.acceptanceBoundary.section31Complete===false,'Section 31 source/completion boundary mismatch');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

const relationships={
  'same-object-expansion':'opacity-shape-state-replacement',
  'workspace-recomposition':'immediate-recomposition-with-brief-emphasis',
  'transient-elevation':'opacity-change-without-travel',
  'context-overlay':'immediate-hierarchy-change-with-restrained-fade',
  'posture-partition':'immediate-layout-replacement',
  'source-destination-continuity':'static-destination-highlight',
  'direct-manipulation-settle':'direct-tracking-then-immediate-final-position',
  'focus-transfer':'immediate-focus-ring-update',
  'color-state-change':'immediate-or-restrained-palette-replacement',
  'material-role-change':'immediate-material-replacement'
};

for(const [relationship,presentation] of Object.entries(relationships)){
  const needsIdentity=relationship==='same-object-expansion'||relationship==='source-destination-continuity';
  const input={
    relationship,
    relationshipAuthoritative:true,
    accessibilityProfiles:['reduced-motion']
  };
  if(needsIdentity){
    input.objectIdentity='object-1';
    input.objectIdentityAuthoritative=true;
  }
  const resolved=resolveGlazeReducedMotionEquivalent(input);
  assert(resolved.accessibility.reducedMotionApplied===true,'Reduced Motion not applied for '+relationship);
  assert(resolved.equivalent.applied===true,'equivalent not applied for '+relationship);
  assert(resolved.equivalent.presentation===presentation,'wrong equivalent for '+relationship);
  for(const key of ['statePreserved','meaningPreserved','focusPreserved','navigationPreserved','taskContinuityPreserved','directManipulationTrackingPreserved']){
    assert(resolved.equivalent[key]===true,'preservation invariant missing for '+relationship+': '+key);
  }
  assert(resolved.equivalent.motionDependencyCreated===false,'motion dependency created for '+relationship);
  assert(resolved.equivalent.finalStateDependsOnAnimationCompletion===false,'final state waits on animation for '+relationship);
}

const standard=resolveGlazeReducedMotionEquivalent({
  relationship:'workspace-recomposition',relationshipAuthoritative:true,
  accessibilityProfiles:[]
});
assert(standard.accessibility.reducedMotionApplied===false&&standard.equivalent.applied===false,'Reduced Motion applied without Reduced Motion profile');

const missingBloomIdentity=resolveGlazeReducedMotionEquivalent({
  relationship:'same-object-expansion',relationshipAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(missingBloomIdentity.sourceFoundation.resolvedFamily==='Standard transition','Bloom continuity asserted without authoritative identity');
assert(missingBloomIdentity.equivalent.presentation==='immediate-state-replacement','identity failure did not fall back to standard immediate state');

const settle=resolveGlazeReducedMotionEquivalent({
  relationship:'direct-manipulation-settle',relationshipAuthoritative:true,
  accessibilityProfiles:['minimal-motion']
});
assert(settle.equivalent.travel==='direct-manipulation-only','Settle broke direct manipulation tracking');
assert(settle.equivalent.directManipulationTrackingPreserved===true,'Settle direct manipulation preservation missing');

const focus=resolveGlazeReducedMotionEquivalent({
  relationship:'focus-transfer',relationshipAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(focus.equivalent.presentation==='immediate-focus-ring-update'&&focus.equivalent.focusPreserved===true,'Focus Transfer Reduced Motion equivalent mismatch');

for(const key of ['family','durationMs','easing','spring','physics','keyframes','path','distance','rotation','bounce','wobble']){
  let failed=false;
  try{resolveGlazeReducedMotionEquivalent({relationship:'workspace-recomposition',relationshipAuthoritative:true,accessibilityProfiles:['reduced-motion'],[key]:'arbitrary'});}catch{failed=true;}
  assert(failed,'raw choreography request accepted: '+key);
}

assert(tokens.version==='1.7.0-dev.23'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(Object.keys(tokens.families).length===10,'token equivalent catalog incomplete');
assert(tokens.preservation.motionRequiredToUnderstandState===false&&tokens.preservation.criticalInteractionMayRequireObservingMotion===false,'token motion dependency boundary weakened');
assert(tokens.preservation.directManipulationTracking===true,'token direct manipulation preservation missing');
assert(tokens.boundaries.section31Complete===false&&tokens.boundaries.glazeMotionExperimentalLifecyclePromoted===false,'token lifecycle/completion boundary weakened');

assert(glazeV17SignatureTransitionFamiliesDevelopmentContract.version==='1.7.0-dev.16','dev.16 dependency changed');
assert(glazeV17MotionExpressionProfilesDevelopmentContract.version==='1.7.0-dev.21','dev.21 dependency changed');
assert(glazeV17MotionPersonalizationDevelopmentContract.version==='1.7.0-dev.22','dev.22 dependency changed');
assert(glazeV17ReducedMotionEquivalentsDevelopmentContract.version==='1.7.0-dev.23','runtime contract version mismatch');
assert(glazeV17ReducedMotionEquivalentsDevelopmentContract.section31Complete===false,'runtime contract completion overclaim');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=23,'aggregate version regressed below dev.23');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.reducedMotionEquivalentsFoundation==='js/glaze-v1.7-reduced-motion-equivalents.dev.mjs','aggregate missing dev.23 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(research.includes('Material Components for Android')&&research.includes('Carbon Design System')&&research.includes('Microsoft Fluent UI'),'research source diversity incomplete');
assert(research.includes('Apache-2.0')&&research.includes('License: MIT'),'research license provenance incomplete');
assert(research.includes('No upstream source code')||research.includes('No upstream source'),'research independence boundary missing');
assert(spec.includes('dev.23')&&spec.includes('Reduced Motion Equivalents'),'plan provenance boundary missing dev.23');
assert(planned.includes('1.7.0-dev.23')&&planned.includes('Reduced Motion Equivalents'),'planned-feature control missing dev.23');
assert(implemented.includes('Reduced Motion Equivalents — `1.7.0-dev.23`'),'implemented-feature control missing dev.23');
assert(changelog.includes('1.7.0-dev.23')&&changelog.includes('Reduced Motion Equivalents'),'changelog missing dev.23');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

console.log('GLAZE UI V1.7 Reduced Motion Equivalents Development foundation: PASS');
console.log('Plan binding: v1.2 Section 31');
console.log('Signature families covered: 10');
console.log('State/meaning/focus/navigation/task/direct-manipulation preserved: true');
console.log('Motion required to understand state: false');
console.log('Section 31 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
