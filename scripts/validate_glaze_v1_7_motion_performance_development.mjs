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

assert(contract.version==='1.7.0-dev.25'&&contract.lifecycle==='Development','contract identity mismatch');
assert(contract.stableBaseline==='1.6.0'&&contract.consumerEligible===false,'contract lifecycle boundary mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([33]),'contract Section 33 binding mismatch');
assert(contract.degradationPolicy.semanticStateReduced===false&&contract.degradationPolicy.authoritativeStateReduced===false,'degradation may not reduce state');
assert(contract.degradationPolicy.directManipulationTrackingPreserved===true,'direct manipulation invariant missing');
assert(contract.renderingPolicy.compositorFriendlyTechniquesPreferred===true,'compositor-friendly preference missing');
assert(contract.requestPolicy.callerPerformanceThresholdsAccepted===false&&contract.requestPolicy.callerFrameBudgetAccepted===false,'caller performance authority expanded');
assert(contract.evidence.measurementsManufactured===false,'performance measurements manufactured');
assert(contract.acceptanceBoundary.section33Complete===false&&contract.acceptanceBoundary.measuredPerformanceAcceptanceEstablished===false,'Section 33 acceptance overclaimed');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

const normal=resolveGlazeMotionPerformance({motionKind:'task-transition'});
assert(normal.performance.mode==='full','unconstrained motion should retain full governed mode');
assert(normal.presentation.directive==='preserve-governed-semantic-motion','full-mode directive mismatch');
assert(normal.evidence.measurementsManufactured===false,'resolver manufactured measurements');

const restrained=resolveGlazeMotionPerformance({motionKind:'material',powerSaving:true});
assert(restrained.performance.mode==='restrained','single ordinary constraint should restrain motion');
assert(restrained.presentation.directive==='restrain-material-animation','material restrained directive mismatch');

const simplified=resolveGlazeMotionPerformance({
  motionKind:'connected-transformation',
  powerSaving:true,
  refreshClass:'low'
});
assert(simplified.performance.mode==='simplified','multiple ordinary constraints should simplify motion');
assert(simplified.presentation.directive==='simple-state-transition-or-replacement','connected simplification mismatch');

const severe=resolveGlazeMotionPerformance({
  motionKind:'task-transition',
  runtimePressure:'severe'
});
assert(severe.performance.mode==='minimal','severe runtime pressure should use minimal motion');
assert(severe.presentation.directive==='immediate-state-with-brief-semantic-emphasis','minimal task directive mismatch');

const thermal=resolveGlazeMotionPerformance({
  motionKind:'adaptive-recomposition',
  thermalState:'critical'
});
assert(thermal.performance.mode==='minimal','critical thermal state should use minimal motion');
assert(thermal.presentation.directive==='immediate-recomposition-with-stable-focus','thermal recomposition fallback mismatch');

const fatigue=resolveGlazeMotionPerformance({
  motionKind:'decorative',
  activeMotion:{decorativeMovements:3}
});
assert(fatigue.inheritedFatigueProtection.budget.exhausted===true,'dev.24 budget pressure not inherited');
assert(fatigue.performance.reasons.includes('motion-budget-pressure'),'fatigue budget pressure not reflected');
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
  thermalState:'critical'
});
assert(direct.presentation.directive==='preserve-input-tracking-and-simplify-post-release-settle','direct manipulation fallback mismatch');
assert(direct.presentation.directManipulationTrackingPreserved===true&&direct.invariants.directManipulationTrackingPreserved===true,'direct manipulation tracking not preserved');

for(const key of ['durationMs','easing','spring','physics','keyframes','distancePx','scaleFactor','frameBudgetMs','targetFps','refreshRateHz','cpuThreshold']){
  let failed=false;
  try{resolveGlazeMotionPerformance({[key]:123});}catch{failed=true;}
  assert(failed,'raw animation/performance control accepted: '+key);
}

let badPressure=false;
try{resolveGlazeMotionPerformance({runtimePressure:'turbo'});}catch{badPressure=true;}
assert(badPressure,'unknown runtime pressure accepted');

assert(tokens.version==='1.7.0-dev.25'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.rendering.compositorFriendlyPreferred===true,'token rendering policy mismatch');
assert(tokens.boundaries.measurementsManufactured===false&&tokens.boundaries.section33Complete===false,'token evidence boundary weakened');
assert(tokens.boundaries.callerMaySetFrameBudget===false&&tokens.boundaries.callerMaySetPerformanceThresholds===false,'token caller authority expanded');

assert(glazeV17MotionFatigueProtectionDevelopmentContract.version==='1.7.0-dev.24','dev.24 dependency changed');
assert(glazeV17ReducedMotionEquivalentsDevelopmentContract.version==='1.7.0-dev.23','dev.23 dependency changed');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.version==='1.6.0-dev.9','V1.6 performance-diagnostics dependency changed');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.performanceMeasurementsMayBeManufactured===false,'V1.6 evidence boundary weakened');
assert(glazeV17MotionPerformanceDevelopmentContract.version==='1.7.0-dev.25','runtime contract version mismatch');
assert(glazeV17MotionPerformanceDevelopmentContract.section33Complete===false,'runtime contract completion overclaim');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=25,'aggregate version regressed below dev.25');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31,32,33])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.motionPerformanceFoundation==='js/glaze-v1.7-motion-performance.dev.mjs','aggregate missing dev.25 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(research.includes('Material Components for Android')&&research.includes('Carbon Design System')&&research.includes('Microsoft Fluent UI'),'research source diversity incomplete');
assert(research.includes('V1.6 Performance Diagnostics')&&research.includes('System-Wide Motion Continuity and Performance'),'GoreeCloud-native performance research incomplete');
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
console.log('Measurements manufactured: false');
console.log('Direct manipulation tracking preserved: true');
console.log('Section 33 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
