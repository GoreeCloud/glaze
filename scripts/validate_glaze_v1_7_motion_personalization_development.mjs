#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeMotionPersonalization,
  glazeV17MotionPersonalizationDevelopmentContract
} from '../js/glaze-v1.7-motion-personalization.dev.mjs';
import {glazeV17MotionExpressionProfilesDevelopmentContract} from '../js/glaze-v1.7-motion-expression-profiles.dev.mjs';
import {glazeV17PersonalizationDevelopmentContract} from '../js/glaze-v1.7-personalization.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/motion-personalization.dev.json');
const schema=json('schemas/v1.7-motion-personalization.schema.json');
const tokens=json('tokens/glaze-v1.7-motion-personalization.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('docs/development/v1.7-motion-personalization-open-source-research-20260926.md');
const glazeMotion=json('tokens/glaze-motion.json');

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.22 must not create lifecycle promotion state');

for(const phrase of [
  '## 30. Motion Personalization','Theme Manager may expose a bounded Motion Expression preference',
  '- Minimal','- Calm','- Balanced','- Expressive',
  'raw duration, easing, spring, or physics controls',
  'Theme packages may request approved motion profiles but must not include executable animation code'
]) assert(spec.includes(phrase),'Section 30 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.22'&&contract.planVersion==='v1.2'&&contract.consumerEligible===false,'dev.22 contract identity mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([30]),'dev.22 section marker mismatch');
assert(JSON.stringify(contract.preferenceModel.modes)===JSON.stringify(['minimal','calm','balanced','expressive']),'motion personalization modes mismatch');
assert(contract.preferenceModel.createsSecondPersistenceAuthority===false,'dev.22 created a second persistence authority');
assert(contract.preferenceModel.persistableModeMapping.calm==='minimal','Calm durable mapping mismatch');
assert(contract.preferenceModel.persistableModeMapping.balanced==='standard','Balanced durable mapping mismatch');
assert(contract.preferenceModel.persistableModeMapping.expressive==='expressive','Expressive durable mapping mismatch');
assert(contract.preferenceModel.minimalMode.previewOnly===true&&contract.preferenceModel.minimalMode.durableEncodingEstablished===false,'Minimal durability boundary weakened');
assert(contract.actions.explicitUserIntentRequiredForApply===true&&contract.actions.callerOwnsPersistence===true&&contract.actions.persistencePerformedByGlaze===false,'apply/persistence boundary weakened');
assert(contract.themePackages.mayOverrideAuthoritativeUserSelection===false&&contract.themePackages.mayPersistPreference===false&&contract.themePackages.mayAutoApply===false,'theme package authority expanded');
assert(contract.themePackages.executableAnimationCodeAllowed===false&&contract.themePackages.animationScriptsAllowed===false&&contract.themePackages.animationModulesAllowed===false&&contract.themePackages.rawKeyframesAllowed===false,'theme package executable animation boundary weakened');
assert(contract.requestPolicy.rawTimingAccepted===false&&contract.requestPolicy.rawEasingAccepted===false&&contract.requestPolicy.rawSpringAccepted===false&&contract.requestPolicy.rawPhysicsAccepted===false,'raw motion boundary weakened');
assert(contract.accessibilityAndPerformance.accessibilityPrecedence===true&&contract.accessibilityAndPerformance.performancePrecedence===true,'accessibility/performance precedence weakened');
assert(contract.authority.motionPreferencePersistedByGlaze===false&&contract.authority.applicationStateChangedByGlaze===false,'presentation authority expanded');
assert(contract.acceptanceBoundary.motionPersonalizationSemanticLayerImplemented===true&&contract.acceptanceBoundary.section30Complete===false,'Section 30 source boundary mismatch');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

assert(JSON.stringify(glazeV17PersonalizationDevelopmentContract.motionIntensityLevels)===JSON.stringify(['minimal','standard','expressive']),'Personalization durable vocabulary changed unexpectedly');
assert(glazeV17MotionExpressionProfilesDevelopmentContract.version==='1.7.0-dev.21','dev.21 dependency identity changed');
assert(glazeV17MotionExpressionProfilesDevelopmentContract.section29Complete===false,'dev.21 relabeled as Section 29 complete');

const calm=resolveGlazeMotionPersonalization({
  action:'apply-proposal',
  motionExpressionMode:'calm',
  motionExpressionModeAuthoritative:true,
  explicitUserIntent:true
});
assert(calm.selection.selectedMode==='calm'&&calm.selection.persistable===true,'Calm selection not accepted');
assert(calm.selection.persistenceEncoding.value==='minimal','Calm did not map to existing minimal durable value');
assert(calm.resolvedMotion.selectedProfile==='calm','Calm did not resolve through dev.21');
assert(calm.action.accepted===true&&calm.action.callerMustPersist===true&&calm.action.persistencePerformedByGlaze===false,'Calm apply proposal boundary mismatch');

const balanced=resolveGlazeMotionPersonalization({motionExpressionMode:'balanced',motionExpressionModeAuthoritative:true});
assert(balanced.selection.persistenceEncoding.value==='standard'&&balanced.resolvedMotion.selectedProfile==='balanced','Balanced mapping mismatch');

const expressive=resolveGlazeMotionPersonalization({motionExpressionMode:'expressive',motionExpressionModeAuthoritative:true});
assert(expressive.selection.persistenceEncoding.value==='expressive'&&expressive.resolvedMotion.selectedProfile==='expressive','Expressive mapping mismatch');

const minimal=resolveGlazeMotionPersonalization({action:'preview',motionExpressionMode:'minimal',motionExpressionModeAuthoritative:true});
assert(minimal.selection.minimalPreviewOnly===true&&minimal.selection.persistable===false,'Minimal preview-only boundary weakened');
assert(minimal.selection.distinctMinimalDurableEncodingEstablished===false,'Minimal durable encoding invented');
assert(minimal.resolvedMotion.selectedProfile==='calm','Minimal should reuse Calm resolver profile');
assert(minimal.resolvedMotion.minimalModeTraits.decorativeMovement==='none','Minimal governed reduction missing');

const minimalApply=resolveGlazeMotionPersonalization({
  action:'apply-proposal',motionExpressionMode:'minimal',motionExpressionModeAuthoritative:true,explicitUserIntent:true
});
assert(minimalApply.action.accepted===false&&minimalApply.action.reason==='minimal-mode-preview-only-until-durable-encoding-exists','Minimal was allowed to persist without encoding');

const noIntent=resolveGlazeMotionPersonalization({
  action:'apply-proposal',motionExpressionMode:'expressive',motionExpressionModeAuthoritative:true
});
assert(noIntent.action.accepted===false&&noIntent.action.reason==='explicit-user-intent-required','apply accepted without explicit user intent');

const packagePreview=resolveGlazeMotionPersonalization({
  themePackageMotionProfile:'expressive',themePackageMotionProfileAuthoritative:true,themePackagePreviewRequested:true
});
assert(packagePreview.selection.source==='theme-package-preview'&&packagePreview.themePackage.previewAccepted===true,'authoritative package preview not accepted');
assert(packagePreview.themePackage.mayPersistPreference===false&&packagePreview.themePackage.mayAutoApply===false,'package preview gained persistence/apply authority');

const userBeatsPackage=resolveGlazeMotionPersonalization({
  motionExpressionMode:'calm',motionExpressionModeAuthoritative:true,
  themePackageMotionProfile:'expressive',themePackageMotionProfileAuthoritative:true,themePackagePreviewRequested:true
});
assert(userBeatsPackage.selection.selectedMode==='calm'&&userBeatsPackage.selection.source==='user','theme package overrode user selection');
assert(userBeatsPackage.themePackage.previewAccepted===false,'package preview should not replace authoritative user selection');

const untrustedPackage=resolveGlazeMotionPersonalization({
  themePackageMotionProfile:'expressive',themePackageMotionProfileAuthoritative:false,themePackagePreviewRequested:true
});
assert(untrustedPackage.selection.selectedMode==='balanced'&&untrustedPackage.selection.fallbackUsed===true,'untrusted package request changed selection');

const reduced=resolveGlazeMotionPersonalization({
  motionExpressionMode:'expressive',motionExpressionModeAuthoritative:true,accessibilityProfiles:['reduced-motion']
});
assert(reduced.selection.selectedMode==='expressive','Reduced Motion rewrote selected Theme Manager mode');
assert(reduced.resolvedMotion.effectiveProfile==='calm','Reduced Motion did not cap effective profile');
assert(reduced.resolvedMotion.profileTraits.travel==='none'&&reduced.resolvedMotion.profileTraits.directManipulationTrackingRequired===true,'Reduced Motion equivalents/direct manipulation boundary mismatch');

const constrained=resolveGlazeMotionPersonalization({
  motionExpressionMode:'expressive',motionExpressionModeAuthoritative:true,
  performanceConstraint:'constrained',performanceConstraintAuthoritative:true
});
assert(constrained.resolvedMotion.selectedProfile==='expressive'&&constrained.resolvedMotion.effectiveProfile==='balanced','performance precedence not delegated to dev.21');

for(const key of ['durationMs','easing','spring','physics','keyframes','distancePx','scaleFactor']){
  let failed=false;
  try{resolveGlazeMotionPersonalization({motionExpressionMode:'balanced',motionExpressionModeAuthoritative:true,[key]:'arbitrary'});}catch{failed=true;}
  assert(failed,'raw motion request accepted: '+key);
}
for(const key of ['themePackageAnimationCode','themePackageAnimationScript','themePackageAnimationModule','themePackageKeyframes','themePackageRemoteAnimationResource']){
  let failed=false;
  try{resolveGlazeMotionPersonalization({themePackageMotionProfile:'balanced',themePackageMotionProfileAuthoritative:true,themePackagePreviewRequested:true,[key]:'arbitrary'});}catch{failed=true;}
  assert(failed,'executable theme-package motion accepted: '+key);
}

assert(tokens.version==='1.7.0-dev.22'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.durablePreferenceMapping.calm==='minimal'&&tokens.durablePreferenceMapping.balanced==='standard'&&tokens.durablePreferenceMapping.expressive==='expressive','token durable mapping mismatch');
assert(tokens.durablePreferenceMapping.minimal===null&&tokens.minimalMode.previewOnly===true,'token Minimal durability boundary weakened');
assert(tokens.themePackagePolicy.automaticPersistence===false&&tokens.themePackagePolicy.executableAnimationAccepted===false,'token package boundary weakened');
assert(tokens.boundaries.section30Complete===false&&tokens.boundaries.secondPersistenceAuthorityCreated===false,'token Section 30/persistence boundary weakened');

assert(glazeV17MotionPersonalizationDevelopmentContract.version==='1.7.0-dev.22','runtime contract version mismatch');
assert(glazeV17MotionPersonalizationDevelopmentContract.section30Complete===false,'runtime contract completion overclaim');
assert(glazeV17Development.version==='1.7.0-dev.22','aggregate version mismatch');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.motionPersonalizationFoundation==='js/glaze-v1.7-motion-personalization.dev.mjs','aggregate missing dev.22 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(research.includes('Material Components for Android')&&research.includes('Carbon Design System')&&research.includes('Microsoft Fluent UI'),'research source diversity incomplete');
assert(research.includes('Apache-2.0')&&research.includes('License: MIT'),'research license provenance incomplete');
assert(research.includes('No upstream source code')||research.includes('No upstream source'),'research independence boundary missing');
assert(spec.includes('1.7.0-dev.22')&&spec.includes('Motion Personalization'),'plan authority boundary missing dev.22');
assert(planned.includes('1.7.0-dev.22')&&planned.includes('Motion Personalization'),'planned-feature control missing dev.22');
assert(implemented.includes('Motion Personalization — `1.7.0-dev.22`'),'implemented-feature control missing dev.22');
assert(changelog.includes('1.7.0-dev.22')&&changelog.includes('Motion Personalization'),'changelog missing dev.22');

console.log('GLAZE UI V1.7 Motion Personalization Development foundation: PASS');
console.log('Plan binding: v1.2 Section 30');
console.log('Theme Manager modes: Minimal, Calm, Balanced, Expressive');
console.log('Minimal durable encoding established: false');
console.log('Existing Personalization motionIntensity remains durable authority: true');
console.log('Theme package executable animation accepted: false');
console.log('Section 30 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
