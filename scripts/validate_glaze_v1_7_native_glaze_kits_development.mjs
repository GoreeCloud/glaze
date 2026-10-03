#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeNativeCapability,
  resolveGlazeNativeKit,
  glazeV17NativeGlazeKitsDevelopmentContract
} from '../js/glaze-v1.7-native-glaze-kits.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition) throw new Error(message);};

const contract=json('contracts/v1.7/native-glaze-kits.dev.json');
const schema=json('schemas/v1.7-native-glaze-kits.schema.json');
const tokens=json('tokens/glaze-v1.7-native-glaze-kits.dev.json');
const lifecycle=json('registry/lifecycle.json');
const stable=read('VERSION').trim();
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');

const platforms=['android-compose','apple-swiftui','web','linux-native'];
const roles=['surface','action','navigation','focus','input','state','progress','recovery','privacy','security'];

assert(stable==='1.7.0','V1.7 dev.9 must coexist with bounded Glaze V1.7 / 1.7.0 as current Stable');
assert(lifecycle.currentOfficial===stable && lifecycle.currentStable===stable,'VERSION/current Stable authority must agree');
assert(lifecycle.activeCandidate===null,'V1.7 dev.9 must not create an active Candidate');
assert(lifecycle.activePatchReleaseCandidate===null,'V1.7 dev.9 must not create a patch RC');
assert(lifecycle.plannedNext==='1.7.1','V1.7 dev.9 must not mutate lifecycle plannedNext');

assert(spec.includes('## 37. Native Glaze Kits'),'V1.7 v1.2 specification missing Native Glaze Kits Section 37');
assert(spec.includes('dev.8–dev.13 use the prior v1.1 35-section numbering'),'v1.2 plan must preserve v1.1 implementation-numbering provenance');
for(const phrase of ['Android / Jetpack Compose','Apple / SwiftUI','Web','Linux native environments']) {
  assert(spec.includes(phrase),`V1.7 v1.2 Native Glaze Kits platform missing: ${phrase}`);
}

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema must use JSON Schema 2020-12');
assert(contract.version==='1.7.0-dev.9','contract version mismatch');
assert(contract.lifecycle==='Development','contract must remain Development');
assert(contract.stableBaseline==='1.6.0','contract Stable baseline mismatch');
assert(contract.consumerEligible===false,'contract must remain non-consumer-eligible');
assert(contract.planVersion==='v1.1','contract plan version mismatch');
assert(JSON.stringify(contract.v11SpecificationSections)===JSON.stringify([24]),'v1.1 Section 24 foundation marker mismatch');
assert(contract.completionClaims.v11Section24Complete===false,'dev.9 must not claim Section 24 complete');
assert(contract.completionClaims.nativeReferenceImplementationsComplete===false,'dev.9 must not claim completed native reference implementations');
assert(JSON.stringify(contract.platforms)===JSON.stringify(platforms),'platform catalog mismatch');
assert(JSON.stringify(contract.semanticVocabulary)===JSON.stringify(roles),'semantic vocabulary mismatch');

for(const platform of platforms){
  const mapping=contract.platformMappings[platform];
  for(const field of ['framework','controlPolicy','accessibilityBridge','inputBridge','renderingBridge','appearanceBridge','colorBridge','performanceBridge']){
    assert(typeof mapping[field]==='string' && mapping[field].length>0,`platform mapping field missing: ${platform}.${field}`);
  }
  assert(mapping.supportedProfiles.length>=1,`profile mapping missing: ${platform}`);
}

for(const required of [
  'platformCapabilityAuthorityRequired','nativeControlMappingAuthorityRequired',
  'systemAppearanceAuthorityRequired','platformColorCapabilityAuthorityRequired',
  'privacyAuthorityRequired','securityAuthorityRequired','permissionAuthorityRequired',
  'consentAuthorityRequired','availabilityAuthorityRequired','executionAuthorityRequired'
]) assert(contract.authority[required]===true,`required authority gate missing: ${required}`);

for(const denied of [
  'platformCapabilityCreatedByGlaze','nativeControlAvailabilityCreatedByGlaze',
  'systemAppearanceTruthCreatedByGlaze','platformColorCapabilityCreatedByGlaze',
  'privacyTruthCreatedByGlaze','securityTruthCreatedByGlaze','permissionGrantedByGlaze',
  'consentGrantedByGlaze','availabilityTruthCreatedByGlaze','actionExecutionPerformedByGlaze',
  'nativeCertificationImplied','downstreamAdoptionAutomatic','consequentialExecutionAutomatic'
]) assert(contract.authority[denied]===false,`authority boundary weakened: ${denied}`);

for(const required of [
  'nativeReferenceImplementationAcceptanceRequired','nativeDeviceAcceptanceRequired',
  'renderedAcceptanceRequired','assistiveTechnologyAcceptanceRequired','performanceAcceptanceRequired'
]) assert(contract.acceptanceBoundary[required]===true,`acceptance boundary missing: ${required}`);

for(const source of Object.values(contract.integrationFoundations)){
  assert(fs.existsSync(path.join(root,source)),`integration foundation missing: ${source}`);
}

assert(tokens.version==='1.7.0-dev.9','token version mismatch');
assert(tokens.planVersion==='v1.1','token plan version mismatch');
assert(JSON.stringify(tokens.v11SpecificationSections)===JSON.stringify([24]),'token Section 24 marker mismatch');
assert(tokens.lifecycle==='Development' && tokens.consumerEligible===false,'tokens must remain Development and non-consumer-eligible');
assert(tokens.mappingPolicy.semanticThemes==='preserve','semantic themes must be preserved');
assert(tokens.mappingPolicy.semanticColorRoles==='preserve','semantic color roles must be preserved');
assert(tokens.mappingPolicy.crossPlatformPixelIdentity==='not-required','pixel identity must not be required');
assert(tokens.themeIntegration.protectedSemanticOverrideAllowed===false,'native kits must preserve protected semantic roles');
assert(tokens.boundaries.sourceMappingOnly===true,'dev.9 must remain source-mapping only');
assert(tokens.boundaries.nativeCertificationImplied===false,'dev.9 must not imply native certification');

const withheld=resolveGlazeNativeCapability({state:'available',authoritative:false});
assert(withheld.acceptedState==='unknown' && withheld.presentAsAvailable===false,'untrusted native capability must fail closed');

const previousTaskState={
  navigationDestination:'settings',
  focusId:'appearance-toggle',
  draftText:'preserve this draft',
  query:'native',
  paneState:{activePane:'detail'}
};

for(const platform of platforms){
  const profile=contract.platformMappings[platform].supportedProfiles[0];
  const resolved=resolveGlazeNativeKit({
    platform,
    profile,
    semanticRole:'surface',
    nativeControl:'PlatformNativeControl',
    nativeControlMappingAuthoritative:true,
    capabilityState:'available',
    capabilityAuthoritative:true,
    systemAppearanceApiState:'available',
    systemAppearanceApiAuthoritative:true,
    platformColorApiState:'available',
    platformColorApiAuthoritative:true,
    semanticColorRole:'security',
    semanticProminence:'critical',
    semanticColorAuthoritative:true,
    protectedSemanticThemeToken:'semantic.security.critical',
    protectedSemanticThemeAuthoritative:true,
    productIdentityThemeToken:'identity.app',
    productIdentityThemeAuthoritative:true,
    userThemeToken:'theme.user',
    previousTaskState
  });

  assert(resolved.platform===platform,`platform mismatch: ${platform}`);
  assert(resolved.mapping.profile===profile,`profile mismatch: ${platform}`);
  assert(resolved.mapping.nativeControl==='PlatformNativeControl',`native control mapping lost: ${platform}`);
  assert(resolved.mapping.pixelIdenticalPresentationRequired===false,`pixel-identity boundary weakened: ${platform}`);
  assert(resolved.capabilities.platform.presentAsAvailable===true,`platform capability lost: ${platform}`);
  assert(resolved.capabilities.systemAppearance.presentAsAvailable===true,`system appearance capability lost: ${platform}`);
  assert(resolved.capabilities.platformColor.presentAsAvailable===true,`color API capability lost: ${platform}`);
  assert(resolved.theme.layer.layer==='protected-semantic-state',`protected semantic theme must outrank user theme: ${platform}`);
  assert(resolved.theme.semanticColor.acceptedRole==='security',`semantic color role lost: ${platform}`);
  assert(resolved.theme.semanticColor.effectiveProminence==='critical',`semantic prominence lost: ${platform}`);
  assert(resolved.theme.protectedSemanticOverrideAllowed===false,`protected semantic boundary weakened: ${platform}`);
  assert(resolved.taskState.navigationDestination==='settings',`navigation continuity lost: ${platform}`);
  assert(resolved.taskState.focusId==='appearance-toggle',`focus continuity lost: ${platform}`);
  assert(resolved.taskState.draftText==='preserve this draft',`draft continuity lost: ${platform}`);
  assert(resolved.authority.systemAppearanceTruthCreatedByGlaze===false,`appearance authority weakened: ${platform}`);
  assert(resolved.authority.platformColorCapabilityCreatedByGlaze===false,`color authority weakened: ${platform}`);
  assert(resolved.acceptanceBoundary.nativeDeviceAcceptanceRequired===true,`native acceptance boundary lost: ${platform}`);
}

const withheldControl=resolveGlazeNativeKit({
  platform:'android-compose',
  profile:'mobile',
  semanticRole:'action',
  nativeControl:'Button',
  nativeControlMappingAuthoritative:false,
  capabilityState:'unknown',
  semanticColorRole:'security',
  semanticProminence:'critical',
  semanticColorAuthoritative:false
});
assert(withheldControl.mapping.nativeControl===null,'untrusted native control mapping must be withheld');
assert(withheldControl.mapping.nativeControlWithheldWithoutAuthority===true,'withheld native control should be explicit');
assert(withheldControl.theme.semanticColor.acceptedRole==='unknown','untrusted semantic truth must fail closed');

for(const input of [
  {platform:'invented-platform',profile:'mobile',semanticRole:'surface'},
  {platform:'linux-native',profile:'mobile',semanticRole:'surface'},
  {platform:'web',profile:'desktop',semanticRole:'invented-role'}
]){
  let failed=false;
  try{resolveGlazeNativeKit(input);}catch{failed=true;}
  assert(failed,`unsupported native-kit input must fail closed: ${JSON.stringify(input)}`);
}

assert(glazeV17NativeGlazeKitsDevelopmentContract.version==='1.7.0-dev.9','runtime contract version mismatch');
assert(glazeV17NativeGlazeKitsDevelopmentContract.planVersion==='v1.1','runtime plan version mismatch');
assert(JSON.stringify(glazeV17NativeGlazeKitsDevelopmentContract.v11SpecificationSections)===JSON.stringify([24]),'runtime Section 24 marker mismatch');
assert(glazeV17NativeGlazeKitsDevelopmentContract.v11Section24Complete===false,'runtime must not claim Section 24 complete');
assert(glazeV17NativeGlazeKitsDevelopmentContract.themeSemanticColorVersion==='1.7.0-dev.8','dev.9 must build on dev.8 theme/color foundation');
assert(glazeV17NativeGlazeKitsDevelopmentContract.consumerEligible===false,'runtime must remain non-consumer-eligible');

const aggregateVersionParts=String(glazeV17Development.version).split('-dev.');
const aggregateDevelopmentRevision=Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0]==='1.7.0' && Number.isInteger(aggregateDevelopmentRevision) && aggregateDevelopmentRevision>=9,
  'aggregate Development version must retain or advance beyond Native Glaze Kits dev.9'
);
assert(glazeV17Development.lifecycle==='development','aggregate must remain Development');
assert(glazeV17Development.stableBaseline==='1.6.0','aggregate Stable baseline mismatch');
assert(glazeV17Development.consumerEligible===false,'aggregate must remain non-consumer-eligible');
assert(glazeV17Development.implementedSpecificationSectionsPlanVersion==='v1.0-historical-numbering','historical numbering provenance must remain explicit');
const aggregatePlanMinor=Number(glazeV17Development.planVersion.match(/^v1\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregatePlanMinor)&&aggregatePlanMinor>=1,'aggregate current plan version regressed below v1.1');
assert(glazeV17Development.planV11FoundationSections.includes(24),'aggregate must include v1.1 Section 24 foundation');
assert(glazeV17Development.themeSemanticColorFoundation==='js/glaze-v1.7-theme-semantic-color.dev.mjs','aggregate must preserve dev.8 theme/color foundation');
assert(glazeV17Development.nativeGlazeKitsFoundation==='js/glaze-v1.7-native-glaze-kits.dev.mjs','aggregate missing dev.9 Native Glaze Kits foundation');
assert(glazeV17Development.providerTruthManufactured===false,'aggregate provider-truth boundary weakened');

assert(planned.includes('1.7.0-dev.9') && planned.includes('Native Glaze Kits'),'planned-feature control missing dev.9 state');
assert(implemented.includes('Native Glaze Kits — `1.7.0-dev.9`'),'implemented-feature control missing dev.9');
assert(changelog.includes('1.7.0-dev.9') && changelog.includes('Native Glaze Kits'),'changelog missing dev.9');

console.log('GLAZE UI V1.7 Native Glaze Kits Development foundation: PASS');
console.log('Plan version: v1.1');
console.log('Bounded foundation section: 24');
console.log('Section 24 complete: false');
console.log('Platform mappings: 4');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
