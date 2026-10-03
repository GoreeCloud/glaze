#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeNativeKitMotionV12,
  glazeV17NativeGlazeKitsV12DevelopmentContract
} from '../js/glaze-v1.7-native-glaze-kits-v1-2.dev.mjs';
import {glazeV17NativeGlazeKitsDevelopmentContract} from '../js/glaze-v1.7-native-glaze-kits.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/native-glaze-kits-v1-2.dev.json');
const schema=json('schemas/v1.7-native-glaze-kits-v1-2.schema.json');
const tokens=json('tokens/glaze-v1.7-native-glaze-kits-v1-2.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('research/v1.7-native-glaze-kits-v1-2.md');

const platforms=['android-compose','apple-swiftui','web','linux-native'];
const relationships=[
  'same-object-expansion','workspace-recomposition','transient-elevation','context-overlay',
  'posture-partition','source-destination-continuity','direct-manipulation-settle',
  'focus-transfer','color-state-change','material-role-change'
];
const profiles={
  'android-compose':'mobile',
  'apple-swiftui':'mobile',
  web:'desktop',
  'linux-native':'desktop'
};

function baseInput(platform,relationship='transient-elevation'){
  return {
    platform,
    profile:profiles[platform],
    semanticRole:'surface',
    nativeControl:'NativeSurface',
    nativeControlMappingAuthoritative:true,
    capabilityState:'available',
    capabilityAuthoritative:true,
    nativeMotionCapabilityState:'available',
    nativeMotionCapabilityAuthoritative:true,
    semanticColorRole:'security',
    semanticProminence:'critical',
    semanticColorAuthoritative:true,
    relationship,
    relationshipAuthoritative:true,
    previousTaskState:{navigationDestination:'detail',focusId:'native-surface',draftText:'preserve'}
  };
}

assert(read('VERSION').trim()==='1.7.0','bounded V1.7 VERSION changed');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.29 must not create lifecycle promotion state');

for(const phrase of [
  '## 37. Native Glaze Kits',
  'Android / Jetpack Compose',
  'Apple / SwiftUI',
  'Web',
  'Linux native environments',
  'preserve Glaze semantic motion',
  'respecting platform interaction behavior, accessibility, rendering architecture, and performance',
  'shared motion character, not identical animation implementation'
]) assert(spec.includes(phrase),'Section 37 requirement missing: '+phrase);
assert(spec.includes('## 38. Expanded Component System'),'Section 38 must remain separately governed');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.29'&&contract.lifecycle==='Development','dev.29 identity mismatch');
assert(contract.stableBaseline==='1.6.0'&&contract.consumerEligible===false,'dev.29 lifecycle boundary mismatch');
assert(contract.planVersion==='v1.2'&&JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([37]),'dev.29 Section 37 binding mismatch');
assert(contract.historicalFoundation.version==='1.7.0-dev.9','historical Native Glaze Kits foundation changed');
assert(contract.historicalFoundation.planNumbering==='v1.1-historical-numbering','historical dev.9 plan provenance missing');
assert(contract.historicalFoundation.historicalSpecificationSection===24,'historical dev.9 section changed');
assert(contract.historicalFoundation.reinterpretedAsV12Section37===false,'dev.9 must not be relabeled as v1.2 Section 37');
assert(JSON.stringify(contract.platforms)===JSON.stringify(platforms),'platform set mismatch');
assert(JSON.stringify(contract.semanticMotionRelationships)===JSON.stringify(relationships),'semantic relationship set mismatch');

for(const key of [
  'semanticFamilyConsistencyRequired','semanticIntentConsistencyRequired','stateMeaningConsistencyRequired',
  'motionCharacterConsistencyRequired','nativeInteractionBehaviorPreserved','nativeAccessibilitySettingsPreserved',
  'nativeRenderingArchitecturePreserved','nativePerformanceCharacteristicsPreserved','reducedMotionPrecedence',
  'performanceMaySimplifyOptionalMotion','performanceMayRemoveOptionalMotion','stateFirstFallbackRequired'
]) assert(contract.crossPlatformPolicy[key]===true,'cross-platform requirement missing: '+key);
for(const key of [
  'identicalAnimationImplementationRequired','exactTimingEqualityRequired','exactCurveEqualityRequired',
  'exactPathEqualityRequired','exactPhysicsEqualityRequired','rawAnimationControlsAccepted',
  'finalStateDependsOnAnimationCompletion'
]) assert(contract.crossPlatformPolicy[key]===false,'cross-platform boundary weakened: '+key);

for(const denied of [
  'platformCapabilityCreatedByGlaze','nativeMotionCapabilityCreatedByGlaze',
  'nativePrimitiveAvailabilityCreatedByGlaze','systemMotionPreferenceCreatedByGlaze',
  'performanceAcceptanceCreatedByGlaze','applicationStateChangedByGlazeMotion',
  'navigationExecutedByGlazeMotion','focusAuthorityCreatedByGlazeMotion'
]) assert(contract.authority[denied]===false,'authority boundary weakened: '+denied);
assert(contract.acceptanceBoundary.section37Complete===false,'Section 37 completion overclaimed');
assert(contract.acceptanceBoundary.nativeReferenceImplementationsComplete===false,'native reference implementations overclaimed');

assert(glazeV17NativeGlazeKitsDevelopmentContract.version==='1.7.0-dev.9','historical dev.9 runtime changed');
assert(glazeV17NativeGlazeKitsDevelopmentContract.planVersion==='v1.1','historical dev.9 plan version changed');
assert(JSON.stringify(glazeV17NativeGlazeKitsDevelopmentContract.v11SpecificationSections)===JSON.stringify([24]),'historical dev.9 numbering changed');
assert(glazeV17NativeGlazeKitsV12DevelopmentContract.version==='1.7.0-dev.29','dev.29 runtime contract mismatch');
assert(glazeV17NativeGlazeKitsV12DevelopmentContract.historicalFoundationReinterpreted===false,'runtime relabeled dev.9');
assert(glazeV17NativeGlazeKitsV12DevelopmentContract.identicalAnimationImplementationRequired===false,'runtime requires identical animations');
assert(glazeV17NativeGlazeKitsV12DevelopmentContract.glazeMotionExperimentalLifecyclePromoted===false,'runtime promoted Glaze Motion');

const directives=new Set();
for(const platform of platforms){
  const resolved=resolveGlazeNativeKitMotionV12(baseInput(platform));
  assert(resolved.platformMotion.platform===platform,'platform mismatch: '+platform);
  assert(resolved.semanticMotion.family==='Glaze Lift','transient elevation should map to Glaze Lift: '+platform);
  assert(resolved.semanticMotion.semanticIntent==='transient-hierarchy-emerged','semantic intent mismatch: '+platform);
  assert(resolved.platformMotion.semanticTransitionEligible===true,'authoritative native transition should be eligible: '+platform);
  assert(resolved.platformMotion.identicalAnimationImplementationRequired===false,'pixel/choreography identity boundary weakened: '+platform);
  assert(resolved.platformMotion.nativeInteractionBehaviorPreserved===true,'native interaction behavior boundary weakened: '+platform);
  assert(resolved.nativeKit.taskState.navigationDestination==='detail','task navigation continuity lost: '+platform);
  assert(resolved.nativeKit.taskState.focusId==='native-surface','focus continuity lost: '+platform);
  assert(resolved.authority.nativePrimitiveSelectionOwnedByPlatformOrApplication===true,'native primitive ownership weakened: '+platform);
  assert(resolved.acceptanceBoundary.nativePlatformAcceptanceEstablished===false,'native acceptance overclaimed: '+platform);
  directives.add(resolved.platformMotion.directive);
}
assert(directives.size===platforms.length,'full-mode platform directives should remain platform-specific');

const noMotionAuthority=resolveGlazeNativeKitMotionV12({
  ...baseInput('android-compose'),
  nativeMotionCapabilityState:'available',
  nativeMotionCapabilityAuthoritative:false
});
assert(noMotionAuthority.platformMotion.nativeMotionCapability.accepted==='unknown','untrusted native motion capability must fail closed');
assert(noMotionAuthority.platformMotion.semanticTransitionEligible===false,'untrusted native motion capability must not enable transition');

const untrustedRelationship=resolveGlazeNativeKitMotionV12({
  ...baseInput('web'),
  relationshipAuthoritative:false
});
assert(untrustedRelationship.semanticMotion.relationshipAccepted===false,'untrusted relationship must fail closed');
assert(untrustedRelationship.semanticMotion.family==='Standard transition','untrusted relationship should use standard transition');
assert(untrustedRelationship.platformMotion.semanticTransitionEligible===false,'untrusted relationship must not enable native semantic transition');

const bloomNoIdentity=resolveGlazeNativeKitMotionV12(baseInput('apple-swiftui','same-object-expansion'));
assert(bloomNoIdentity.semanticMotion.relationshipAccepted===false,'Bloom must require authoritative connected identity');
assert(bloomNoIdentity.platformMotion.semanticTransitionEligible===false,'Bloom without identity must fail closed');

const bloom=resolveGlazeNativeKitMotionV12({
  ...baseInput('apple-swiftui','same-object-expansion'),
  connectedIdentity:'native:item:42',
  connectedIdentityAuthoritative:true
});
assert(bloom.semanticMotion.family==='Glaze Bloom','authoritative connected identity should map to Glaze Bloom');
assert(bloom.platformMotion.semanticTransitionEligible===true,'authoritative Bloom should be eligible');

const reduced=resolveGlazeNativeKitMotionV12({
  ...baseInput('web'),
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion must propagate to native mapping');
assert(reduced.performance.mode==='reduced-motion','Reduced Motion must outrank native motion richness');
assert(reduced.platformMotion.directive==='use-platform-reduced-motion-semantic-equivalent','native Reduced Motion directive mismatch');
assert(reduced.accessibility.motionRequiredToUnderstandState===false,'native state must remain understandable without motion');

const pressure=resolveGlazeNativeKitMotionV12({
  ...baseInput('linux-native'),
  runtimePressure:'severe',
  runtimePressureAuthoritative:true
});
assert(pressure.performance.mode==='minimal','severe authoritative pressure must simplify native motion');
assert(pressure.platformMotion.directive==='use-minimal-native-semantic-transition-or-immediate-state','minimal native directive mismatch');
assert(pressure.nativeKit.taskState.draftText==='preserve','performance degradation must not reset task state');

let rawRejected=false;
try{resolveGlazeNativeKitMotionV12({...baseInput('android-compose'),durationMs:240});}catch(error){rawRejected=error instanceof RangeError;}
assert(rawRejected,'raw cross-platform animation controls must be rejected');

assert(tokens.version==='1.7.0-dev.29'&&tokens.v12SpecificationSections[0]===37,'dev.29 token identity mismatch');
assert(tokens.crossPlatformPolicy.identicalAnimationImplementation==='not-required','token map requires identical animation implementation');
assert(tokens.crossPlatformPolicy.semanticFamily==='preserve','token semantic family boundary missing');
assert(tokens.accessibility.reducedMotionPrecedence===true,'token Reduced Motion precedence missing');
assert(tokens.boundaries.section37Complete===false,'token Section 37 completion overclaimed');

for(const phrase of [
  'Jetpack Compose',
  'Compose Multiplatform',
  'SwiftUI accessibility Reduce Motion',
  'prefers-reduced-motion',
  'GTK/libadwaita',
  'No upstream source code',
  'requirements and architectural boundaries only'
]) assert(research.includes(phrase),'research provenance missing: '+phrase);

assert(contract.researchProvenance.independentReimplementation===true,'independent reimplementation boundary missing');
for(const key of ['upstreamSourceCopied','upstreamTimingValuesCopied','upstreamCurvesCopied','upstreamAssetsCopied','upstreamVisualIdentityCopied']){
  assert(contract.researchProvenance[key]===false,'research copying boundary weakened: '+key);
}

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=29,'aggregate version regressed below dev.29');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37]){
  assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
}
assert(glazeV17Development.nativeGlazeKitsV12Foundation==='js/glaze-v1.7-native-glaze-kits-v1-2.dev.mjs','aggregate missing dev.29 foundation');
assert(glazeV17Development.nativeGlazeKitsHistoricalFoundationReinterpretedAsV12===false,'aggregate relabeled historical dev.9');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(spec.includes('dev.29')&&spec.includes('Section 37'),'plan provenance missing dev.29');
assert(planned.includes('1.7.0-dev.29')&&planned.includes('Native Glaze Kits'),'planned-feature control missing dev.29');
assert(implemented.includes('Native Glaze Kits v1.2 — `1.7.0-dev.29`'),'implemented-feature control missing dev.29');
assert(changelog.includes('1.7.0-dev.29')&&changelog.includes('Native Glaze Kits'),'changelog missing dev.29');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

console.log('GLAZE UI V1.7 Native Glaze Kits v1.2 Development validation: PASS');
console.log('Plan binding: v1.2 Section 37');
console.log('Historical dev.9 provenance preserved: true');
console.log('Platforms: 4');
console.log('Semantic motion relationships: 10');
console.log('Identical animation implementation required: false');
console.log('Section 37 complete: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
