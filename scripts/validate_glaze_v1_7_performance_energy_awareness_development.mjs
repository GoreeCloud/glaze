import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  resolveGlazePerformanceEnergyAwareness,
  glazeV17PerformanceEnergyAwarenessDevelopmentContract
} from '../js/glaze-v1.7-performance-energy-awareness.dev.mjs';
import {glazeV17MotionPerformanceDevelopmentContract} from '../js/glaze-v1.7-motion-performance.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=new URL('../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),'utf8');
const json=path=>JSON.parse(read(path));

const contract=json('contracts/v1.7/performance-energy-awareness.dev.json');
const tokens=json('tokens/glaze-v1.7-performance-energy-awareness.dev.json');
const version=read('VERSION').trim();
const lifecycle=json('registry/lifecycle.json');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const plan=read('GLAZE_UI_V1_7_PLANNED.md');
const research=read('research/v1.7-performance-energy-awareness.md');
const rootResearch=read('OPEN-SOURCE-RESEARCH.md');

assert.equal(contract.version,'1.7.0-dev.38');
assert.deepEqual(contract.v12SpecificationSections,[45]);
assert.equal(contract.consumerEligible,false);
assert.equal(contract.acceptanceBoundary.section45Complete,false);
assert.equal(contract.degradationPolicy.taskContinuityMayDegrade,false);
assert.equal(contract.degradationPolicy.accessibilityMayDegrade,false);
assert.equal(contract.degradationPolicy.semanticStateMayDegrade,false);
assert.equal(contract.degradationPolicy.forcedFramesForOptionalVisualsAllowed,false);
assert.equal(tokens.energy.idleRenderLoopsAllowed,false);
assert.equal(tokens.energy.continuousDecorativeAnimationDefault,false);

const neutral=resolveGlazePerformanceEnergyAwareness({presentationDomain:'theme'});
assert.equal(neutral.performanceMode,'full');
assert.equal(neutral.presentation.directive,'preserve-governed-presentation');
assert.equal(neutral.presentation.themeIdentityPreserved,true);
assert.equal(neutral.presentation.protectedSemanticColorMeaningPreserved,true);

const power=resolveGlazePerformanceEnergyAwareness({
  presentationDomain:'material',
  powerSaving:true,
  powerSavingAuthoritative:true
});
assert.equal(power.performanceMode,'restrained');
assert.equal(power.energy.powerSavingEffective,true);
assert.match(power.presentation.directive,/restrain-material/);

const untrustedPower=resolveGlazePerformanceEnergyAwareness({
  presentationDomain:'material',
  powerSaving:true,
  powerSavingAuthoritative:false
});
assert.equal(untrustedPower.performanceMode,'full');
assert.equal(untrustedPower.energy.powerSavingEffective,false);
assert.equal(untrustedPower.inheritedMotionPerformance.evidence.untrustedNonNeutralSignalIgnored,true);

const combined=resolveGlazePerformanceEnergyAwareness({
  presentationDomain:'theme',
  hardwareClass:'constrained',
  hardwareClassAuthoritative:true,
  refreshClass:'low',
  refreshClassAuthoritative:true
});
assert.equal(combined.performanceMode,'simplified');
assert.match(combined.presentation.directive,/reduced-optional-material-richness/);

const severe=resolveGlazePerformanceEnergyAwareness({
  presentationDomain:'material',
  runtimePressure:'severe',
  runtimePressureAuthoritative:true
});
assert.equal(severe.performanceMode,'minimal');
assert.equal(severe.presentation.directive,'use-static-solid-material-equivalent');

const background=resolveGlazePerformanceEnergyAwareness({
  presentationDomain:'background-visual-work',
  visibilityClass:'background',
  visibilityClassAuthoritative:true
});
assert.equal(background.performanceMode,'minimal');
assert.equal(background.presentation.optionalBackgroundWorkSuspended,true);
assert.equal(background.presentation.directive,'suspend-optional-background-visual-work');

const reduced=resolveGlazePerformanceEnergyAwareness({
  presentationDomain:'adaptive-transition',
  accessibilityProfiles:['reduced-motion']
});
assert.equal(reduced.performanceMode,'reduced-motion');
assert.equal(reduced.presentation.taskContinuityPreserved,true);
assert.equal(reduced.presentation.accessibilityPreserved,true);
assert.equal(reduced.presentation.semanticStatePreserved,true);

const decorative=resolveGlazePerformanceEnergyAwareness({
  presentationDomain:'decorative',
  thermalState:'constrained',
  thermalStateAuthoritative:true,
  powerSaving:true,
  powerSavingAuthoritative:true
});
assert.equal(decorative.performanceMode,'simplified');
assert.equal(decorative.presentation.directive,'suppress-most-optional-decoration');

for(const raw of [
  {forceFrames:true},
  {powerBudgetMw:50},
  {energyMeasurements:[1,2,3]},
  {blurRadius:20},
  {complexityScore:0.9},
  {accepted:true}
]){
  assert.throws(()=>resolveGlazePerformanceEnergyAwareness(raw),RangeError);
}

assert.equal(glazeV17PerformanceEnergyAwarenessDevelopmentContract.motionPerformanceVersion,'1.7.0-dev.25');
assert.equal(glazeV17MotionPerformanceDevelopmentContract.section33Complete,false);
assert.equal(glazeV17MotionPerformanceDevelopmentContract.measurementsManufactured,false);

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=38,'aggregate version regressed below dev.38');
assert(glazeV17Development.planV12FoundationSections.includes(45),'aggregate missing Section 45');
assert.equal(glazeV17Development.performanceEnergyAwarenessFoundation,'js/glaze-v1.7-performance-energy-awareness.dev.mjs');
assert.equal(glazeV17Development.providerTruthManufactured,false);

assert.equal(version,'1.6.0','VERSION must remain V1.6 Anchor');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'source implementation must not create lifecycle candidate');

assert(planned.includes('1.7.0-dev.38')&&planned.includes('Performance and Energy Awareness'),'planned feature control missing dev.38');
assert(implemented.includes('Performance and Energy Awareness')&&implemented.includes('1.7.0-dev.38'),'implemented feature control missing dev.38');
assert(changelog.includes('1.7.0-dev.38')&&changelog.includes('Performance and Energy Awareness'),'changelog missing dev.38');
assert(plan.includes('1.7.0-dev.38')&&plan.includes('Section 45'),'planned upgrade authority missing dev.38');
assert(rootResearch.includes('## V1.7 dev.38 — Performance and Energy Awareness'),'root research register missing dev.38');

for(const phrase of [
  'flutter/flutter','8db55268667c738b90677d49857ff42938e9c9fa','BSD-3-Clause',
  'androidx/androidx','23327507f7fc7d5b19d65fec4b090f60c970079b','Apache-2.0',
  'GNOME/libadwaita','0ffcd2c80b2260bdae01b89e88d94bb5c856db13','LGPL-2.1-or-later',
  'No third-party source code'
])assert(research.includes(phrase),'research provenance missing: '+phrase);

console.log('GLAZE UI V1.7 Performance and Energy Awareness Development validation: PASS');
console.log('Plan binding: v1.2 Section 45');
console.log('Presentation domains: 6');
console.log('Optional visual complexity may degrade: true');
console.log('Forced frames for optional visuals allowed: false');
console.log('Section 45 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
