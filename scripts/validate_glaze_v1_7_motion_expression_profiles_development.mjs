#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeMotionExpressionProfile,
  glazeV17MotionExpressionProfilesDevelopmentContract
} from '../js/glaze-v1.7-motion-expression-profiles.dev.mjs';
import {glazeV17PersonalizationDevelopmentContract} from '../js/glaze-v1.7-personalization.dev.mjs';
import {glazeV17ThemeTransitionSystemDevelopmentContract} from '../js/glaze-v1.7-theme-transition-system.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/motion-expression-profiles.dev.json');
const schema=json('schemas/v1.7-motion-expression-profiles.schema.json');
const tokens=json('tokens/glaze-v1.7-motion-expression-profiles.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('docs/development/v1.7-motion-expression-profiles-open-source-research-20260926.md');
const glazeMotion=json('tokens/glaze-motion.json');

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.21 must not create lifecycle promotion state');

for(const phrase of [
  '## 29. Motion Expression Profiles','### Calm','Minimal travel','Fast settling',
  '### Balanced','Standard Glaze transitions','Default GoreeCloud motion character',
  '### Expressive','Richer connected transformations','Expressive must not mean constant animation',
  'Accessibility and performance constraints override the selected expression profile'
]) assert(spec.includes(phrase),'Section 29 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.21'&&contract.planVersion==='v1.2'&&contract.consumerEligible===false,'dev.21 contract identity mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([29]),'dev.21 section marker mismatch');
assert(JSON.stringify(contract.expressionModel.sourceLevels)===JSON.stringify(['minimal','standard','expressive']),'expression source levels mismatch');
assert(contract.expressionModel.profileMapping.minimal==='calm'&&contract.expressionModel.profileMapping.standard==='balanced'&&contract.expressionModel.profileMapping.expressive==='expressive','profile mapping mismatch');
assert(contract.expressionModel.createsNewUserPreference===false,'dev.21 created a second preference authority');
assert(contract.profiles.calm.continuousDecorativeAnimation===false&&contract.profiles.balanced.continuousDecorativeAnimation===false&&contract.profiles.expressive.continuousDecorativeAnimation===false,'continuous decorative animation enabled');
assert(contract.requestPolicy.rawTimingAccepted===false&&contract.requestPolicy.rawEasingAccepted===false&&contract.requestPolicy.rawSpringAccepted===false&&contract.requestPolicy.rawPhysicsAccepted===false,'raw motion boundary weakened');
assert(contract.overridePolicy.accessibilityPrecedence===true&&contract.overridePolicy.performancePrecedence===true&&contract.overridePolicy.overridesDoNotRewriteStoredPreference===true,'override precedence/persistence boundary weakened');
assert(contract.overridePolicy.directManipulationTrackingPreserved===true,'direct manipulation tracking boundary weakened');
assert(contract.authority.motionPreferencePersistedByGlaze===false&&contract.authority.applicationStateChangedByGlaze===false,'presentation authority expanded');
assert(contract.accessibility.reducedMotionTravel==='none'&&contract.accessibility.directManipulationTrackingRequired===true,'Reduced Motion behavior mismatch');
assert(contract.performance.measuredPerformanceAcceptanceEstablished===false,'performance acceptance overclaim');
assert(contract.acceptanceBoundary.motionExpressionProfileCatalogImplemented===true&&contract.acceptanceBoundary.section29Complete===false,'Section 29 source boundary mismatch');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

assert(JSON.stringify(glazeV17PersonalizationDevelopmentContract.motionIntensityLevels)===JSON.stringify(['minimal','standard','expressive']),'Personalization motionIntensity source model changed');
assert(glazeV17PersonalizationDevelopmentContract.accessibilityPrecedence===true,'Personalization accessibility precedence changed');

const calm=resolveGlazeMotionExpressionProfile({motionIntensity:'minimal',motionIntensityAuthoritative:true});
assert(calm.expression.selectedProfile==='calm'&&calm.expression.effectiveProfile==='calm','minimal did not map to Calm');
assert(calm.traits.travel==='minimal'&&calm.traits.connectedTransformations==='fewer','Calm profile semantics mismatch');

const balanced=resolveGlazeMotionExpressionProfile({motionIntensity:'standard',motionIntensityAuthoritative:true});
assert(balanced.expression.selectedProfile==='balanced'&&balanced.expression.effectiveProfile==='balanced','standard did not map to Balanced');
assert(balanced.traits.signatureMotion==='standard','Balanced signature motion mismatch');

const expressive=resolveGlazeMotionExpressionProfile({motionIntensity:'expressive',motionIntensityAuthoritative:true});
assert(expressive.expression.selectedProfile==='expressive'&&expressive.expression.effectiveProfile==='expressive','expressive mapping mismatch');
assert(expressive.traits.connectedTransformations==='richer'&&expressive.traits.continuousDecorativeAnimation===false,'Expressive semantics overreach');

const fallback=resolveGlazeMotionExpressionProfile({motionIntensity:'expressive'});
assert(fallback.expression.selectionAccepted===false&&fallback.expression.selectedProfile==='balanced','untrusted intensity did not fail closed to Balanced');
assert(fallback.expression.fallbackReason==='untrusted-motion-intensity','untrusted intensity fallback not reported');

const constrained=resolveGlazeMotionExpressionProfile({
  motionIntensity:'expressive',motionIntensityAuthoritative:true,
  performanceConstraint:'constrained',performanceConstraintAuthoritative:true
});
assert(constrained.expression.selectedProfile==='expressive'&&constrained.expression.effectiveProfile==='balanced','constrained performance did not cap Expressive at Balanced');
assert(constrained.overrides.selectedPreferencePreserved===true,'performance override rewrote selected preference');

const severe=resolveGlazeMotionExpressionProfile({
  motionIntensity:'standard',motionIntensityAuthoritative:true,
  performanceConstraint:'severe',performanceConstraintAuthoritative:true
});
assert(severe.expression.selectedProfile==='balanced'&&severe.expression.effectiveProfile==='calm','severe performance did not cap profile at Calm');

const untrustedPerformance=resolveGlazeMotionExpressionProfile({
  motionIntensity:'expressive',motionIntensityAuthoritative:true,
  performanceConstraint:'severe',performanceConstraintAuthoritative:false
});
assert(untrustedPerformance.performance.untrustedConstraintIgnored===true&&untrustedPerformance.expression.effectiveProfile==='expressive','untrusted performance constraint changed profile');

const reduced=resolveGlazeMotionExpressionProfile({
  motionIntensity:'expressive',motionIntensityAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.expression.selectedProfile==='expressive'&&reduced.expression.effectiveProfile==='calm','Reduced Motion did not override effective profile');
assert(reduced.traits.travel==='none'&&reduced.traits.settling==='immediate-state'&&reduced.traits.connectedTransformations==='none','Reduced Motion equivalents incomplete');
assert(reduced.traits.directManipulationTrackingRequired===true,'Reduced Motion broke direct manipulation tracking');
assert(reduced.expression.storedPreferenceRewrittenByOverride===false,'Reduced Motion rewrote stored preference');

const simplified=resolveGlazeMotionExpressionProfile({
  motionIntensity:'expressive',motionIntensityAuthoritative:true,
  accessibilityProfiles:['simplified-visual-effects']
});
assert(simplified.expression.effectiveProfile==='calm','simplified visual effects did not cap profile at Calm');
assert(simplified.accessibility.precedence===true,'accessibility precedence missing');

let badIntensity=false;
try{resolveGlazeMotionExpressionProfile({motionIntensity:'cinematic',motionIntensityAuthoritative:true});}catch{badIntensity=true;}
assert(badIntensity,'unknown motion intensity accepted');

for(const key of ['durationMs','easing','spring','physics','keyframes','path','travelPx','distancePx','rotation','overshoot','bounce','wobble','scaleFactor','stiffness','dampingRatio']){
  let failed=false;
  try{resolveGlazeMotionExpressionProfile({motionIntensity:'standard',motionIntensityAuthoritative:true,[key]:'arbitrary'});}catch{failed=true;}
  assert(failed,'raw motion request accepted: '+key);
}

assert(tokens.version==='1.7.0-dev.21'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.motionIntensityToProfile.minimal==='calm'&&tokens.motionIntensityToProfile.standard==='balanced'&&tokens.motionIntensityToProfile.expressive==='expressive','token profile mapping mismatch');
assert(tokens.boundaries.continuousDecorativeAnimation===false&&tokens.boundaries.section29Complete===false,'token expression/completion boundary weakened');
assert(tokens.boundaries.directManipulationTrackingRequired===true,'token direct manipulation boundary missing');

assert(glazeV17ThemeTransitionSystemDevelopmentContract.version==='1.7.0-dev.20','dev.20 identity changed');
assert(glazeV17ThemeTransitionSystemDevelopmentContract.section28Complete===false,'dev.20 relabeled as Section 28 complete');
assert(glazeV17MotionExpressionProfilesDevelopmentContract.version==='1.7.0-dev.21','runtime contract version mismatch');
assert(glazeV17MotionExpressionProfilesDevelopmentContract.section29Complete===false,'runtime contract completion overclaim');
assert(glazeV17Development.version==='1.7.0-dev.21','aggregate version mismatch');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.motionExpressionProfilesFoundation==='js/glaze-v1.7-motion-expression-profiles.dev.mjs','aggregate missing dev.21 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(research.includes('Material Components for Android')&&research.includes('Carbon Design System')&&research.includes('Microsoft Fluent UI'),'research source diversity incomplete');
assert(research.includes('Apache-2.0')&&research.includes('License: MIT'),'research license provenance incomplete');
assert(research.includes('No upstream source code')||research.includes('No upstream source'),'research independence boundary missing');
assert(spec.includes('1.7.0-dev.21')&&spec.includes('Motion Expression Profiles'),'plan authority boundary missing dev.21');
assert(planned.includes('1.7.0-dev.21')&&planned.includes('Motion Expression Profiles'),'planned-feature control missing dev.21');
assert(implemented.includes('Motion Expression Profiles — `1.7.0-dev.21`'),'implemented-feature control missing dev.21');
assert(changelog.includes('1.7.0-dev.21')&&changelog.includes('Motion Expression Profiles'),'changelog missing dev.21');

console.log('GLAZE UI V1.7 Motion Expression Profiles Development foundation: PASS');
console.log('Plan binding: v1.2 Section 29');
console.log('Profiles: Calm, Balanced, Expressive');
console.log('Existing Personalization motionIntensity reused: true');
console.log('Accessibility/performance precedence: true');
console.log('Section 29 complete: false');
console.log('Rendered/native/performance/fatigue acceptance: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
