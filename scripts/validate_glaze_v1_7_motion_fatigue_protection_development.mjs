#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeMotionFatigueProtection,
  glazeV17MotionFatigueProtectionDevelopmentContract
} from '../js/glaze-v1.7-motion-fatigue-protection.dev.mjs';
import {glazeV16FocusMotionDevelopmentContract} from '../js/glaze-v1.6-focus-motion.dev.mjs';
import {glazeV17SignatureMicrointeractionsDevelopmentContract} from '../js/glaze-v1.7-signature-microinteractions.dev.mjs';
import {glazeV17ReducedMotionEquivalentsDevelopmentContract} from '../js/glaze-v1.7-reduced-motion-equivalents.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/motion-fatigue-protection.dev.json');
const schema=json('schemas/v1.7-motion-fatigue-protection.schema.json');
const tokens=json('tokens/glaze-v1.7-motion-fatigue-protection.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('docs/development/v1.7-motion-fatigue-protection-open-source-research-20260926.md');
const glazeMotion=json('tokens/glaze-motion.json');

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.24 must not create lifecycle promotion state');

for(const phrase of [
  '## 32. Motion Fatigue Protection',
  'preserve and strengthen motion budgeting',
  'Transitions',
  'Skeleton animations',
  'Material animations',
  'Decorative movements',
  'Large-area transformations',
  'Continuous animated elements',
  'optional animation should be reduced automatically',
  'Semantic state must not be reduced'
]) assert(spec.includes(phrase),'Section 32 requirement missing: '+phrase);

const expectedBudget={
  simultaneousTransitions:6,
  skeletonMotionElements:4,
  backgroundMaterialAnimations:1,
  decorativeMovements:2,
  largeAreaTransformations:1,
  continuousAnimatedElements:4
};

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.24'&&contract.planVersion==='v1.2'&&contract.consumerEligible===false,'dev.24 contract identity mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([32]),'dev.24 section marker mismatch');
assert(JSON.stringify(contract.referenceBudget)===JSON.stringify(expectedBudget),'dev.24 reference budget mismatch');
assert(JSON.stringify(glazeV16FocusMotionDevelopmentContract.referenceMotionBudget)===JSON.stringify(expectedBudget),'V1.6 reference motion budget changed');
assert(contract.budgetPolicy.inheritedWithoutExpansion===true&&contract.budgetPolicy.callerMayRaiseLimits===false&&contract.budgetPolicy.callerMayOverrideBudget===false,'budget authority expanded');
assert(contract.budgetPolicy.optionalAnimationReducedAutomaticallyWhenExceeded===true&&contract.budgetPolicy.semanticStateReduced===false,'Section 32 reduction/state boundary mismatch');
assert(JSON.stringify(contract.reductionOrder)===JSON.stringify(['decorativeMovements','continuousAnimatedElements','skeletonMotionElements','backgroundMaterialAnimations','largeAreaTransformations','simultaneousTransitions']),'reduction order mismatch');
for(const key of ['semanticStatePreserved','authoritativeStatePreserved','focusPreserved','navigationPreserved','taskContinuityPreserved','directManipulationTrackingPreserved']) assert(contract.invariants[key]===true,'invariant missing: '+key);
assert(contract.invariants.finalStateDependsOnAnimationCompletion===false&&contract.invariants.userInputBlockedByBudgetReduction===false,'state/input boundary weakened');
assert(contract.requestPolicy.rawBudgetOverrideAccepted===false&&contract.requestPolicy.rawTimingAccepted===false&&contract.requestPolicy.rawEasingAccepted===false&&contract.requestPolicy.rawPhysicsAccepted===false,'raw control boundary weakened');
assert(contract.authority.applicationStateChangedByGlaze===false&&contract.authority.providerTruthCreatedByGlaze===false&&contract.authority.performanceTruthCreatedByGlaze===false,'presentation authority expanded');
assert(contract.acceptanceBoundary.motionFatigueBudgetLayerImplemented===true&&contract.acceptanceBoundary.section32Complete===false,'Section 32 source/completion boundary mismatch');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

const within=resolveGlazeMotionFatigueProtection({activeMotion:{
  simultaneousTransitions:6,skeletonMotionElements:4,backgroundMaterialAnimations:1,
  decorativeMovements:2,largeAreaTransformations:1,continuousAnimatedElements:4
}});
assert(within.budget.exhausted===false&&within.budget.exceededDimensions.length===0,'exact budget should not be exceeded');
assert(within.reduction.optionalAnimationReducedAutomatically===false,'motion reduced without pressure');

const overDecorative=resolveGlazeMotionFatigueProtection({activeMotion:{decorativeMovements:3}});
assert(overDecorative.budget.exhausted===true&&overDecorative.budget.exceededDimensions.includes('decorativeMovements'),'decorative budget overage not detected');
assert(overDecorative.reduction.byDimension.decorativeMovements.action==='suppress-excess-decorative-motion','decorative reduction mismatch');
assert(overDecorative.reduction.byDimension.decorativeMovements.semanticStateReduced===false,'decorative reduction changed semantic state');

const allOver=resolveGlazeMotionFatigueProtection({activeMotion:{
  simultaneousTransitions:7,skeletonMotionElements:5,backgroundMaterialAnimations:2,
  decorativeMovements:3,largeAreaTransformations:2,continuousAnimatedElements:5
}});
assert(allOver.budget.exceededDimensions.length===6,'not all budget dimensions detected');
assert(allOver.reduction.byDimension.skeletonMotionElements.action==='convert-excess-to-static-skeleton','skeleton reduction mismatch');
assert(allOver.reduction.byDimension.backgroundMaterialAnimations.action==='convert-excess-to-static-material','material reduction mismatch');
assert(allOver.reduction.byDimension.largeAreaTransformations.action==='replace-excess-with-simpler-state-transition','large-area reduction mismatch');
assert(allOver.reduction.byDimension.simultaneousTransitions.action==='simplify-or-immediately-resolve-excess-transitions','transition reduction mismatch');
assert(allOver.invariants.semanticStatePreserved===true&&allOver.invariants.authoritativeStatePreserved===true,'budget pressure reduced state');

const major=resolveGlazeMotionFatigueProtection({majorTransitionActive:true,decorativeMotionRequested:true});
assert(major.reduction.decorativeSuspendedForMajorTransition===true,'major transition did not suspend optional decorative motion');
assert(major.reduction.optionalAnimationReducedAutomatically===true,'major transition suppression not reflected');

const repeated=resolveGlazeMotionFatigueProtection({repeatedActionPressure:true});
assert(repeated.reduction.repeatedActionFatigueReductionApplied===true,'repeated-action fatigue reduction missing');
assert(glazeV17SignatureMicrointeractionsDevelopmentContract.repeatedActionFatigueReduction===true,'dev.19 repeated-action fatigue dependency changed');

const reduced=resolveGlazeMotionFatigueProtection({
  accessibilityProfiles:['reduced-motion'],
  activeMotion:{simultaneousTransitions:1,skeletonMotionElements:1,backgroundMaterialAnimations:1,decorativeMovements:1,largeAreaTransformations:1,continuousAnimatedElements:1}
});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion precedence missing');
assert(reduced.reduction.byDimension.skeletonMotionElements.action==='static-skeleton','Reduced Motion skeleton fallback mismatch');
assert(reduced.reduction.byDimension.largeAreaTransformations.action==='immediate-or-static-state','Reduced Motion large-area fallback mismatch');
assert(reduced.accessibility.directManipulationTrackingPreserved===true,'Reduced Motion broke direct manipulation tracking');

let badCount=false;
try{resolveGlazeMotionFatigueProtection({activeMotion:{decorativeMovements:-1}});}catch{badCount=true;}
assert(badCount,'negative motion count accepted');

for(const key of ['budget','budgetOverride','motionBudget','maxConcurrentMotion','durationMs','easing','spring','physics','keyframes','distancePx','scaleFactor']){
  let failed=false;
  try{resolveGlazeMotionFatigueProtection({activeMotion:{},[key]:{simultaneousTransitions:99}});}catch{failed=true;}
  assert(failed,'caller motion/budget control accepted: '+key);
}

assert(tokens.version==='1.7.0-dev.24'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(JSON.stringify(tokens.referenceBudget)===JSON.stringify(expectedBudget),'token budget mismatch');
assert(tokens.boundaries.callerMayRaiseBudget===false&&tokens.boundaries.callerMayOverrideBudget===false,'token budget authority weakened');
assert(tokens.boundaries.semanticStateReduced===false&&tokens.boundaries.section32Complete===false,'token Section 32/state boundary weakened');

assert(glazeV17ReducedMotionEquivalentsDevelopmentContract.version==='1.7.0-dev.23','dev.23 dependency changed');
assert(glazeV17MotionFatigueProtectionDevelopmentContract.version==='1.7.0-dev.24','runtime contract version mismatch');
assert(glazeV17MotionFatigueProtectionDevelopmentContract.section32Complete===false,'runtime contract completion overclaim');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=24,'aggregate version regressed below dev.24');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31,32])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.motionFatigueProtectionFoundation==='js/glaze-v1.7-motion-fatigue-protection.dev.mjs','aggregate missing dev.24 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(glazeMotion.performance.maxConcurrentSettlingAnimations===12,'Glaze Motion experimental settling budget changed unexpectedly');
assert(research.includes('Material Components for Android')&&research.includes('Carbon Design System')&&research.includes('Microsoft Fluent UI'),'research source diversity incomplete');
assert(research.includes('V1.6 focus and motion foundation')&&research.includes('V1.6 loading/skeleton foundation')&&research.includes('V1.7 Signature Microinteractions'),'GoreeCloud-native research dependencies incomplete');
assert(research.includes('Apache-2.0')&&research.includes('License: MIT'),'research license provenance incomplete');
assert(research.includes('No upstream source code')||research.includes('No upstream source'),'research independence boundary missing');
assert(spec.includes('dev.24')&&spec.includes('Motion Fatigue Protection'),'plan provenance boundary missing dev.24');
assert(planned.includes('1.7.0-dev.24')&&planned.includes('Motion Fatigue Protection'),'planned-feature control missing dev.24');
assert(implemented.includes('Motion Fatigue Protection — `1.7.0-dev.24`'),'implemented-feature control missing dev.24');
assert(changelog.includes('1.7.0-dev.24')&&changelog.includes('Motion Fatigue Protection'),'changelog missing dev.24');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

console.log('GLAZE UI V1.7 Motion Fatigue Protection Development foundation: PASS');
console.log('Plan binding: v1.2 Section 32');
console.log('Reference budget preserved from V1.6: true');
console.log('Budget dimensions: 6');
console.log('Optional animation reduces automatically under budget pressure: true');
console.log('Semantic state reduced: false');
console.log('Section 32 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
