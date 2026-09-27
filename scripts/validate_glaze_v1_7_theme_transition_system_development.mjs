#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeThemeTransition,
  glazeV17ThemeTransitionSystemDevelopmentContract
} from '../js/glaze-v1.7-theme-transition-system.dev.mjs';
import {glazeV17SignatureMicrointeractionsDevelopmentContract} from '../js/glaze-v1.7-signature-microinteractions.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/theme-transition-system.dev.json');
const schema=json('schemas/v1.7-theme-transition-system.schema.json');
const tokens=json('tokens/glaze-v1.7-theme-transition-system.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('docs/development/v1.7-theme-transition-system-open-source-research-20260926.md');
const glazeMotion=json('tokens/glaze-motion.json');

const properties=[
  'canvas-color','surface-color','accent-families','material-atmosphere',
  'icon-tint','selection-color','decorative-color','appearance-mode'
];

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.20 must not create lifecycle promotion state');

for(const phrase of [
  '## 28. Theme Transition System','Canvas color','Surface color','Accent families',
  'Material atmosphere','Icon tint','Selection color','Non-semantic decorative color',
  'Appearance mode','Theme previews should be cancellable',
  'A theme should not be considered applied until its configuration state is actually committed'
]) assert(spec.includes(phrase),'Section 28 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.20'&&contract.planVersion==='v1.2'&&contract.consumerEligible===false,'dev.20 contract identity mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([28]),'dev.20 section marker mismatch');
assert(JSON.stringify(contract.governedProperties)===JSON.stringify(properties),'governed theme property order mismatch');
assert(contract.requestPolicy.themeChangeAuthorityRequired===true&&contract.requestPolicy.themeIdentityAuthorityRequired===true&&contract.requestPolicy.changedPropertiesAuthorityRequired===true,'theme authority boundary weakened');
assert(contract.requestPolicy.resultAuthorityRequiredForResultPhase===true&&contract.requestPolicy.previewCommitAllowed===false,'result/preview boundary weakened');
assert(contract.requestPolicy.rawTimingAccepted===false&&contract.requestPolicy.rawChoreographyAccepted===false&&contract.requestPolicy.directThemeMutationAccepted===false,'raw/mutation boundary weakened');
assert(contract.resultPolicy.appliedOnlyAfterAuthoritativeCommittedResult===true&&contract.resultPolicy.pendingApplicationIsNotApplied===true,'commit boundary weakened');
assert(contract.transitionPolicy.fullScreenSpectacleAllowed===false&&contract.transitionPolicy.maximumSemanticChannels===4,'transition restraint boundary changed');
assert(contract.authority.themeCommitCreatedByGlaze===false&&contract.authority.themeConfigurationPersistedByGlaze===false,'theme commit/persistence authority manufactured');
assert(contract.accessibility.reducedMotionUsesImmediateThemeReplacement===true&&contract.accessibility.forcedColorsAuthorityPreserved===true,'accessibility boundary weakened');
assert(contract.performance.authoritativeThemeStateMustRemainCorrect===true&&contract.performance.measuredPerformanceAcceptanceEstablished===false,'performance boundary weakened');
assert(contract.acceptanceBoundary.themeTransitionCatalogImplemented===true&&contract.acceptanceBoundary.section28Complete===false,'Section 28 source boundary mismatch');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

assert(tokens.version==='1.7.0-dev.20'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.fallbacks.untrustedResult==='pending-or-source-theme-no-commit-claim','untrusted result fallback missing');
assert(tokens.fallbacks.reducedMotion==='immediate-theme-replacement','Reduced Motion fallback missing');
assert(tokens.boundaries.section28Complete===false&&tokens.boundaries.glazeMotionExperimentalLifecyclePromoted===false,'token lifecycle/completion boundary weakened');

const preview=resolveGlazeThemeTransition({
  mode:'preview',phase:'intent',themeChangeAuthoritative:true,
  sourceThemeIdentity:'theme-a',targetThemeIdentity:'theme-b',themeIdentityAuthoritative:true,
  changedProperties:properties,changedPropertiesAuthoritative:true
});
assert(preview.sourceFoundation.requestAccepted===true,'preview request rejected');
assert(preview.transition.applicationState==='preview-only','preview state mismatch');
assert(preview.transition.effectiveThemeIdentity==='theme-b','preview target not visible');
assert(preview.transition.appliedThemeIdentity==='theme-a','preview incorrectly committed target');
assert(preview.transition.semanticChannels.length<=4,'semantic channel budget exceeded');
assert(preview.authority.themeCommitCreatedByGlaze===false,'preview manufactured commit');

const previewCancelled=resolveGlazeThemeTransition({
  mode:'preview',phase:'result',themeChangeAuthoritative:true,
  sourceThemeIdentity:'theme-a',targetThemeIdentity:'theme-b',themeIdentityAuthoritative:true,
  changedProperties:['canvas-color'],changedPropertiesAuthoritative:true,
  resultAuthoritative:true,resultState:'cancelled'
});
assert(previewCancelled.transition.effectiveThemeIdentity==='theme-a','cancelled preview did not return source');
assert(previewCancelled.transition.appliedThemeIdentity==='theme-a','cancelled preview mutated applied theme');

const pending=resolveGlazeThemeTransition({
  mode:'apply',phase:'intent',themeChangeAuthoritative:true,
  sourceThemeIdentity:'theme-a',targetThemeIdentity:'theme-b',themeIdentityAuthoritative:true,
  changedProperties:['canvas-color','material-atmosphere'],changedPropertiesAuthoritative:true
});
assert(pending.transition.applicationState==='pending','apply intent not pending');
assert(pending.transition.appliedThemeIdentity==='theme-a','pending application incorrectly marked applied');

const untrustedCommit=resolveGlazeThemeTransition({
  mode:'apply',phase:'result',themeChangeAuthoritative:true,
  sourceThemeIdentity:'theme-a',targetThemeIdentity:'theme-b',themeIdentityAuthoritative:true,
  changedProperties:['canvas-color'],changedPropertiesAuthoritative:true,
  resultAuthoritative:false,resultState:'committed'
});
assert(untrustedCommit.sourceFoundation.requestAccepted===false,'untrusted commit accepted');
assert(untrustedCommit.transition.appliedThemeIdentity==='theme-a','untrusted commit changed applied theme');

const committed=resolveGlazeThemeTransition({
  mode:'apply',phase:'result',themeChangeAuthoritative:true,
  sourceThemeIdentity:'theme-a',targetThemeIdentity:'theme-b',themeIdentityAuthoritative:true,
  changedProperties:properties,changedPropertiesAuthoritative:true,
  resultAuthoritative:true,resultState:'committed'
});
assert(committed.transition.applicationState==='committed','authoritative commit not represented');
assert(committed.transition.appliedThemeIdentity==='theme-b','authoritative commit did not apply target');
assert(committed.acceptanceBoundary.section28Complete===false,'Section 28 completion overclaim');

for(const state of ['failed','cancelled','unchanged']){
  const result=resolveGlazeThemeTransition({
    mode:'apply',phase:'result',themeChangeAuthoritative:true,
    sourceThemeIdentity:'theme-a',targetThemeIdentity:'theme-b',themeIdentityAuthoritative:true,
    changedProperties:['accent-families'],changedPropertiesAuthoritative:true,
    resultAuthoritative:true,resultState:state
  });
  assert(result.transition.appliedThemeIdentity==='theme-a',state+' result mutated applied theme');
}

const reduced=resolveGlazeThemeTransition({
  mode:'preview',phase:'intent',themeChangeAuthoritative:true,
  sourceThemeIdentity:'theme-a',targetThemeIdentity:'theme-b',themeIdentityAuthoritative:true,
  changedProperties:['canvas-color','material-atmosphere'],changedPropertiesAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion not applied');
assert(reduced.transition.semanticChannels.every(channel=>channel.enabled===false),'Reduced Motion did not suppress interpolation');

const reducedTransparency=resolveGlazeThemeTransition({
  mode:'preview',phase:'intent',themeChangeAuthoritative:true,
  sourceThemeIdentity:'theme-a',targetThemeIdentity:'theme-b',themeIdentityAuthoritative:true,
  changedProperties:['material-atmosphere'],changedPropertiesAuthoritative:true,
  accessibilityProfiles:['reduced-transparency']
});
assert(reducedTransparency.transition.semanticChannels.some(channel=>channel.channel==='material-solid-equivalent'),'Reduced Transparency material equivalent missing');

const pressured=resolveGlazeThemeTransition({
  mode:'apply',phase:'intent',themeChangeAuthoritative:true,
  sourceThemeIdentity:'theme-a',targetThemeIdentity:'theme-b',themeIdentityAuthoritative:true,
  changedProperties:['material-atmosphere','appearance-mode'],changedPropertiesAuthoritative:true,
  performancePressure:true
});
assert(pressured.performance.degradationApplied===true,'performance degradation not applied');
assert(pressured.performance.authoritativeThemeStateCorrect===true,'performance pressure changed authoritative state');

for(const bad of [
  {},
  {mode:'preview',phase:'intent',themeChangeAuthoritative:false,sourceThemeIdentity:'a',targetThemeIdentity:'b',themeIdentityAuthoritative:true,changedProperties:['canvas-color'],changedPropertiesAuthoritative:true},
  {mode:'preview',phase:'intent',themeChangeAuthoritative:true,sourceThemeIdentity:'',targetThemeIdentity:'b',themeIdentityAuthoritative:true,changedProperties:['canvas-color'],changedPropertiesAuthoritative:true},
  {mode:'preview',phase:'intent',themeChangeAuthoritative:true,sourceThemeIdentity:'a',targetThemeIdentity:'b',themeIdentityAuthoritative:true,changedProperties:[],changedPropertiesAuthoritative:true}
]){
  const result=resolveGlazeThemeTransition(bad);
  assert(result.sourceFoundation.requestAccepted===false,'invalid theme transition request accepted');
}

let badProperty=false;
try{
  resolveGlazeThemeTransition({
    mode:'preview',phase:'intent',themeChangeAuthoritative:true,
    sourceThemeIdentity:'a',targetThemeIdentity:'b',themeIdentityAuthoritative:true,
    changedProperties:['unknown-property'],changedPropertiesAuthoritative:true
  });
}catch{badProperty=true;}
assert(badProperty,'unknown theme property accepted');

for(const key of ['durationMs','easing','spring','physics','keyframes','path','travelPx','distance','rotation','overshoot','bounce','wobble','scaleFactor']){
  let failed=false;
  try{
    resolveGlazeThemeTransition({
      mode:'preview',phase:'intent',themeChangeAuthoritative:true,
      sourceThemeIdentity:'a',targetThemeIdentity:'b',themeIdentityAuthoritative:true,
      changedProperties:['canvas-color'],changedPropertiesAuthoritative:true,[key]:'arbitrary'
    });
  }catch{failed=true;}
  assert(failed,'raw motion request accepted: '+key);
}

assert(glazeV17SignatureMicrointeractionsDevelopmentContract.version==='1.7.0-dev.19','dev.19 identity changed');
assert(glazeV17SignatureMicrointeractionsDevelopmentContract.section27Complete===false,'dev.19 relabeled as Section 27 complete');
assert(glazeV17ThemeTransitionSystemDevelopmentContract.version==='1.7.0-dev.20','runtime contract version mismatch');
assert(glazeV17ThemeTransitionSystemDevelopmentContract.section28Complete===false,'runtime contract completion overclaim');
const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=20,'aggregate version regressed below dev.20');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.themeTransitionSystemFoundation==='js/glaze-v1.7-theme-transition-system.dev.mjs','aggregate missing dev.20 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(research.includes('Material Components for Android')&&research.includes('Microsoft Fluent UI'),'research provenance incomplete');
assert(research.includes('No upstream source code')||research.includes('No upstream source'),'research independence boundary missing');
assert(spec.includes('dev.20')&&spec.includes('Theme Transition System'),'plan provenance boundary missing dev.20');
assert(planned.includes('1.7.0-dev.20')&&planned.includes('Theme Transition System'),'planned-feature provenance missing dev.20');
assert(implemented.includes('Theme Transition System — `1.7.0-dev.20`'),'implemented-feature control missing dev.20');
assert(changelog.includes('1.7.0-dev.20')&&changelog.includes('Theme Transition System'),'changelog missing dev.20');

console.log('GLAZE UI V1.7 Theme Transition System Development foundation: PASS');
console.log('Plan binding: v1.2 Section 28');
console.log('Governed theme properties: 8');
console.log('Applied only after authoritative committed result: true');
console.log('Section 28 complete: false');
console.log('Rendered/native/performance/fatigue acceptance: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
