#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeMotionPerformance,
  glazeV17MotionPerformanceDevelopmentContract
} from '../js/glaze-v1.7-motion-performance.dev.mjs';
import {glazeV17MotionFatigueProtectionDevelopmentContract} from '../js/glaze-v1.7-motion-fatigue-protection.dev.mjs';
import {glazeV17ReducedMotionEquivalentsDevelopmentContract} from '../js/glaze-v1.7-reduced-motion-equivalents.dev.mjs';
import {glazeV16PerformanceDiagnosticsDevelopmentContract} from '../js/glaze-v1.6-performance-diagnostics.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/motion-performance.dev.json');
const schema=json('schemas/v1.7-motion-performance.schema.json');
const tokens=json('tokens/glaze-v1.7-motion-performance.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('docs/development/v1.7-motion-performance-open-source-research-20260926.md');
const glazeMotion=json('tokens/glaze-motion.json');

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.25 must not create lifecycle promotion state');

for(const phrase of [
  '## 33. Motion Performance',
  'predictable rendering performance',
  'compositor-friendly techniques',
  'Runtime pressure',
  'Power-saving conditions',
  'Thermal constraints',
  'Low-end hardware',
  'Low refresh conditions',
  'Reduced Motion',
  'Performance-degraded environments',
  'fail toward a simpler Glaze transition'
]) assert(spec.includes(phrase),'Section 33 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.25'&&contract.lifecycle==='Development','contract identity mismatch');
assert(contract.stableBaseline==='1.6.0'&&contract.consumerEligible===false,'contract lifecycle boundary mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([33]),'contract Section 33 binding mismatch');
assert(contract.environmentSignals.nonNeutralSignalsRequireCallerOrProviderAuthority===true,'environment authority requirement missing');
assert(contract.environmentSignals.untrustedSignalsFallBackToNeutral===true,'untrusted environment fallback missing');
assert(contract.degradationPolicy.semanticStateReduced===false&&contract.degradationPolicy.authoritativeStateReduced===false,'degradation may not reduce state');
assert(contract.degradationPolicy.directManipulationTrackingPreserved===true,'direct manipulation invariant missing');
assert(contract.degradationPolicy.offscreenOptionalWorkSuspended===true&&contract.degradationPolicy.idleRenderLoopsAllowed===false,'offscreen/idle work policy weakened');
assert(contract.renderingPolicy.compositorFriendlyTechniquesPreferred===true,'compositor-friendly preference missing');
assert(contract.requestPolicy.callerPerformanceThresholdsAccepted===false&&contract.requestPolicy.callerFrameBudgetAccepted===false&&contract.requestPolicy.measurementsAcceptedByResolver===false,'caller performance authority expanded');
assert(contract.environmentSignals.authorityRequired===true&&contract.degradationPolicy.untrustedNonNeutralSignalsIgnored===true,'environment authority boundary missing');
assert(contract.requestPolicy.acceptanceMeasurementsAcceptedByResolver===false,'resolver accepts acceptance measurements');
assert(contract.evidence.measurementsManufactured===false&&contract.evidence.environmentSignalsRequireCallerOrProviderAuthority===true,'performance evidence/authority boundary weakened');
assert(contract.acceptanceBoundary.section33Complete===false&&contract.acceptanceBoundary.measuredPerformanceAcceptanceEstablished===false,'Section 33 acceptance overclaimed');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false&&contract.glazeMotionBoundary.runtimeCompatibilityBaseline==='0.4.0','Glaze Motion boundary changed');

const approved=glazeV16PerformanceDiagnosticsDevelopmentContract.approvedPerformanceBudget;
for(const [key,value] of Object.entries({
  resolverP95MsMax:10.0,
  resolverP99MsMax:16.7,
  interactionPaintP95MsMax:100,
  interactionPaintP99MsMax:200,
  severeFrameStallRateMax:0.01,
  catastrophicForegroundStallCountMax:0,
  taskStateResetCountMax:0,
  pageReloadRequiredCountMax:0,
  automaticAuthorityActionCountMax:0
})) assert(approved[key]===value,'approved performance budget changed: '+key);
for(const [key,value] of Object.entries({resolver:200,interactionPaint:30,idleFrames:120,activeFrames:240})){
  assert(approved.minimumSamples[key]===value,'approved performance sample minimum changed: '+key);
}
assert(contract.performanceBudgetReference.source===approved.source&&contract.performanceBudgetReference.sourceVersion===approved.sourceVersion,'performance budget reference authority mismatch');
assert(contract.performanceBudgetReference.acceptanceMayBeInferredFromThisResolver===false,'resolver may infer performance acceptance');

const normal=resolveGlazeMotionPerformance({motionKind:'task-transition'});
assert(normal.performance.mode==='full','unconstrained motion should retain full governed mode');
assert(normal.presentation.directive==='preserve-governed-semantic-motion','full-mode directive mismatch');
assert(normal.evidence.measurementsManufactured===false&&normal.evidence.measurementsAcceptedByThisResolver===false,'resolver measurement boundary weakened');
assert(normal.performanceBudgetReference.thresholds.resolverP95MsMax===10.0,'runtime approved-budget reference mismatch');
assert(normal.performanceBudgetReference.acceptanceMayBeInferredFromThisResolver===false,'runtime inferred performance acceptance');

const untrustedSevere=resolveGlazeMotionPerformance({
  motionKind:'task-transition',
  runtimePressure:'severe',
  environmentSignalsAuthoritative:true
});
assert(untrustedSevere.performance.mode==='full','untrusted severe runtime pressure changed presentation');
assert(untrustedSevere.performance.runtimePressure.effective==='none'&&untrustedSevere.performance.runtimePressure.fallbackUsed===true,'untrusted runtime pressure did not fail closed');

const restrained=resolveGlazeMotionPerformance({
  motionKind:'material',
  powerSaving:true,
  powerSavingAuthoritative:true
});
assert(restrained.performance.mode==='restrained','single authoritative ordinary constraint should restrain motion');
assert(restrained.presentation.directive==='restrain-material-animation','material restrained directive mismatch');

const simplified=resolveGlazeMotionPerformance({
  motionKind:'connected-transformation',
  powerSaving:true,
  powerSavingAuthoritative:true,
  refreshClass:'low',
  refreshClassAuthoritative:true
});
assert(simplified.performance.mode==='simplified','multiple authoritative ordinary constraints should simplify motion');
assert(simplified.presentation.directive==='simple-state-transition-or-replacement','connected simplification mismatch');

const severe=resolveGlazeMotionPerformance({
  motionKind:'task-transition',
  runtimePressure:'severe',
  runtimePressureAuthoritative:true
});
assert(severe.performance.mode==='minimal','authoritative severe runtime pressure should use minimal motion');
assert(severe.presentation.directive==='immediate-state-with-brief-semantic-emphasis','minimal task directive mismatch');

const thermal=resolveGlazeMotionPerformance({
  motionKind:'adaptive-recomposition',
  thermalState:'critical',
  thermalStateAuthoritative:true
});
assert(thermal.performance.mode==='minimal','authoritative critical thermal state should use minimal motion');
assert(thermal.presentation.directive==='immediate-recomposition-with-stable-focus','thermal recomposition fallback mismatch');

const background=resolveGlazeMotionPerformance({
  motionKind:'continuous-decorative',
  visibilityClass:'background',
  visibilityClassAuthoritative:true
});
assert(background.performance.mode==='minimal','authoritative background visibility should use minimal motion');
assert(background.presentation.offscreenOptionalWorkSuspended===true,'background optional work not suspended');
assert(background.presentation.directive==='suspend-or-immediately-resolve-offscreen-optional-motion','background suspension directive mismatch');

const untrustedBackground=resolveGlazeMotionPerformance({
  motionKind:'decorative',
  visibilityClass:'background'
});
assert(untrustedBackground.performance.mode==='full','untrusted background visibility changed presentation');
assert(untrustedBackground.performance.visibility.effective==='visible'&&untrustedBackground.performance.visibility.fallbackUsed===true,'untrusted visibility did not fail closed');

const untrusted=resolveGlazeMotionPerformance({motionKind:'material',powerSaving:true,thermalState:'critical'});
assert(untrusted.performance.mode==='full','untrusted non-neutral environment signals must be ignored');
assert(untrusted.performance.untrustedNonNeutralSignalIgnored===true,'untrusted signal ignore flag missing');
assert(untrusted.evidence.environmentSignalsRequireAuthority===true,'environment authority requirement missing');

const background=resolveGlazeMotionPerformance({motionKind:'decorative',visibility:'background',environmentSignalsAuthoritative:true});
assert(background.performance.mode==='minimal','background presentation should minimize optional motion');
assert(background.presentation.directive==='suspend-or-immediately-resolve-offscreen-optional-motion','background optional-work directive mismatch');
assert(background.presentation.offscreenOptionalWorkSuspended===true,'background optional work not suspended');

const fatigue=resolveGlazeMotionPerformance({
  motionKind:'decorative',
  activeMotion:{decorativeMovements:3}
});
assert(fatigue.inheritedFatigueProtection.budget.exhausted===true,'dev.24 budget pressure not inherited');
assert(fatigue.performance.reasons.includes('motion-budget-pressure'),'fatigue budget pressure not reflected');
assert(fatigue.performance.mode==='restrained','single fatigue pressure should restrain motion');
assert(fatigue.presentation.directive==='suppress-optional-decorative-motion','decorative pressure fallback mismatch');

const reduced=resolveGlazeMotionPerformance({
  motionKind:'connected-transformation',
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.performance.mode==='reduced-motion','Reduced Motion precedence missing');
assert(reduced.presentation.directive==='use-reduced-motion-semantic-equivalent','Reduced Motion semantic-equivalent delegation mismatch');
assert(reduced.accessibility.reducedMotionEquivalentCatalogRequired===true,'Reduced Motion catalog requirement missing');

const direct=resolveGlazeMotionPerformance({
  motionKind:'direct-manipulation',
  runtimePressure:'severe',
  runtimePressureAuthoritative:true,
  thermalState:'critical',
  thermalStateAuthoritative:true
});
assert(direct.presentation.directive==='preserve-input-tracking-and-simplify-post-release-settle','direct manipulation fallback mismatch');
assert(direct.presentation.directManipulationTrackingPreserved===true&&direct.invariants.directManipulationTrackingPreserved===true,'direct manipulation tracking not preserved');
assert(direct.invariants.inputMayWaitForDecorativeMotion===false,'input allowed to wait for decorative motion');

for(const key of [
  'durationMs','easing','spring','physics','keyframes','distancePx','scaleFactor',
  'frameBudgetMs','targetFps','refreshRateHz','cpuThreshold','measurements',
  'samples','performanceEvidence','resolverP95Ms','interactionPaintP95Ms'
]){
  let failed=false;
  try{resolveGlazeMotionPerformance({[key]:123});}catch{failed=true;}
  assert(failed,'raw animation/performance/measurement control accepted: '+key);
}

let badPressure=false;
try{resolveGlazeMotionPerformance({runtimePressure:'turbo'});}catch{badPressure=true;}
assert(badPressure,'unknown runtime pressure accepted');

assert(tokens.version==='1.7.0-dev.25'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.rendering.compositorFriendlyPreferred===true&&tokens.rendering.offscreenOptionalWorkSuspended===true&&tokens.rendering.idleRenderLoopsAllowed===false,'token rendering policy mismatch');
assert(tokens.boundaries.environmentSignalsRequireAuthority===true&&tokens.boundaries.measurementsAcceptedByResolver===false,'token authority/evidence boundary weakened');
assert(tokens.boundaries.environmentSignalsRequireAuthority===true&&tokens.boundaries.measurementsAcceptedByResolver===false,'token authority/evidence boundary missing');
assert(tokens.boundaries.measurementsManufactured===false&&tokens.boundaries.section33Complete===false,'token evidence boundary weakened');
assert(tokens.rendering.offscreenOptionalWorkSuspended===true&&tokens.rendering.idleRenderLoopsAllowed===false,'token offscreen efficiency policy missing');
assert(tokens.boundaries.callerMaySetFrameBudget===false&&tokens.boundaries.callerMaySetPerformanceThresholds===false,'token caller authority expanded');

assert(glazeV17MotionFatigueProtectionDevelopmentContract.version==='1.7.0-dev.24','dev.24 dependency changed');
assert(glazeV17ReducedMotionEquivalentsDevelopmentContract.version==='1.7.0-dev.23','dev.23 dependency changed');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.version==='1.6.0-dev.9','V1.6 performance-diagnostics dependency changed');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.performanceMeasurementsMayBeManufactured===false,'V1.6 evidence boundary weakened');
assert(glazeV17MotionPerformanceDevelopmentContract.version==='1.7.0-dev.25','runtime contract version mismatch');
assert(glazeV17MotionPerformanceDevelopmentContract.section33Complete===false,'runtime contract completion overclaim');
assert(glazeV17MotionPerformanceDevelopmentContract.environmentSignalsRequireAuthority===true&&glazeV17MotionPerformanceDevelopmentContract.measurementsAcceptedByResolver===false,'runtime authority/evidence boundary mismatch');
assert(glazeV17MotionPerformanceDevelopmentContract.environmentSignalsRequireAuthority===true,'runtime contract environment authority weakened');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=25,'aggregate version regressed below dev.25');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31,32,33])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.motionPerformanceFoundation==='js/glaze-v1.7-motion-performance.dev.mjs','aggregate missing dev.25 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(glazeMotion.runtime.preferCompositorProperties.includes('opacity')&&glazeMotion.runtime.preferCompositorProperties.includes('transform'),'Glaze Motion compositor preference changed');
assert(glazeMotion.performance.suspendOffscreenWork===true&&glazeMotion.performance.avoidIdleRenderLoops===true,'Glaze Motion resource governance changed');
assert(research.includes('Material Components for Android')&&research.includes('Carbon Design System')&&research.includes('Microsoft Fluent UI'),'research source diversity incomplete');
assert(research.includes('Standard — System-Wide Motion Continuity and Performance')&&research.includes('Standard — Glaze UI Performance Budget'),'GoreeCloud standards research incomplete');
assert(research.includes('V1.6 performance diagnostics')&&research.includes('Motion Fatigue Protection dev.24'),'GoreeCloud-native performance research incomplete');
assert(research.includes('Apache-2.0')&&research.includes('License: MIT'),'research license provenance incomplete');
assert(research.includes('No upstream source code')||research.includes('does not copy'),'research independence boundary missing');
assert(spec.includes('dev.25')&&spec.includes('Motion Performance'),'plan provenance boundary missing dev.25');
assert(planned.includes('1.7.0-dev.25')&&planned.includes('Motion Performance'),'planned-feature control missing dev.25');
assert(implemented.includes('Motion Performance — `1.7.0-dev.25`'),'implemented-feature control missing dev.25');
assert(changelog.includes('1.7.0-dev.25')&&changelog.includes('Motion Performance'),'changelog missing dev.25');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

console.log('GLAZE UI V1.7 Motion Performance Development foundation: PASS');
console.log('Plan binding: v1.2 Section 33');
console.log('Performance modes: full, restrained, simplified, minimal, reduced-motion');
console.log('Non-neutral environment signals require authority: true');
console.log('Approved performance budget acceptance inferred: false');
console.log('Measurements manufactured: false');
console.log('Direct manipulation tracking preserved: true');
console.log('Section 33 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
