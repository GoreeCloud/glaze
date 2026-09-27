#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeCrossDeviceConsistencyV12,
  glazeV17CrossDeviceConsistencyDevelopmentContract
} from '../js/glaze-v1.7-cross-device-consistency.dev.mjs';
import {glazeV17NativeGlazeKitsV12DevelopmentContract}
  from '../js/glaze-v1.7-native-glaze-kits-v1-2.dev.mjs';
import {glazeV17AccessibilityContinuityDevelopmentContract}
  from '../js/glaze-v1.7-accessibility-continuity.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/cross-device-consistency.dev.json');
const schema=json('schemas/v1.7-cross-device-consistency.schema.json');
const tokens=json('tokens/glaze-v1.7-cross-device-consistency.dev.json');
const lifecycle=json('registry/lifecycle.json');
const plan=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('research/v1.7-cross-device-consistency.md');
const rootResearch=read('OPEN-SOURCE-RESEARCH.md');

assert(read('VERSION').trim()==='1.6.0','dev.35 must preserve V1.6 / 1.6.0 Anchor baseline');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.35 must not create release lifecycle state');

assert(plan.includes('## 42. Cross-Device Consistency Without Uniformity'),'V1.7 plan missing Section 42');
for(const phrase of [
  'Semantic vocabulary','Color roles','State vocabulary','Motion language','Material hierarchy',
  'Interaction principles','Accessibility expectations','Authority boundaries',
  'does not have to use identical implementation details'
])assert(plan.includes(phrase),'Section 42 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.35'&&contract.planVersion==='v1.2','dev.35 contract identity mismatch');
assert(contract.lifecycle==='Development'&&contract.consumerEligible===false,'dev.35 lifecycle boundary weakened');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([42]),'Section 42 binding mismatch');
assert(contract.consistencyRequirements.semanticRoleConsistencyRequired===true,'semantic role consistency missing');
assert(contract.consistencyRequirements.authorityBoundaryConsistencyRequired===true,'authority consistency missing');
assert(contract.uniformityNotRequired.pixelIdenticalPresentation===true,'pixel non-uniformity boundary missing');
assert(contract.uniformityNotRequired.identicalAnimationTiming===true,'animation timing non-uniformity boundary missing');
assert(contract.authority.providerTruthCreatedByGlaze===false&&contract.authority.nativeImplementationCreatedByGlaze===false,'authority boundary weakened');
assert(contract.acceptanceBoundary.section42Complete===false,'dev.35 must not claim Section 42 complete');

const base={
  semanticSurfaceId:'settings-theme-preview',
  semanticRole:'state',
  semanticState:'warning',
  semanticStateAuthoritative:true,
  semanticColorRole:'warning',
  semanticColorAuthoritative:true,
  semanticProminence:'prominent',
  motionRelationship:'focus-transfer',
  motionRelationshipAuthoritative:true,
  materialHierarchy:['canvas','surface','focus'],
  interactionPrinciples:['task-continuity','state-first','predictable-focus','native-control-preference'],
  accessibilityExpectations:['reduced-motion','keyboard-navigation'],
  previousTaskState:{navigationDestination:'settings',focusId:'theme-preview',draftText:'draft'},
  incomingTaskState:{navigationDestination:'settings',focusId:'theme-preview',draftText:'draft'},
  targets:[
    {
      targetId:'android-phone',
      platform:'android-compose',
      profile:'mobile',
      capabilityState:'available',
      capabilityAuthoritative:true,
      nativeMotionCapabilityState:'available',
      nativeMotionCapabilityAuthoritative:true
    },
    {
      targetId:'apple-phone',
      platform:'apple-swiftui',
      profile:'mobile',
      capabilityState:'available',
      capabilityAuthoritative:true,
      nativeMotionCapabilityState:'available',
      nativeMotionCapabilityAuthoritative:true
    },
    {
      targetId:'web-desktop',
      platform:'web',
      profile:'desktop',
      capabilityState:'available',
      capabilityAuthoritative:true,
      nativeMotionCapabilityState:'available',
      nativeMotionCapabilityAuthoritative:true
    },
    {
      targetId:'linux-desktop',
      platform:'linux-native',
      profile:'desktop',
      capabilityState:'available',
      capabilityAuthoritative:true,
      nativeMotionCapabilityState:'available',
      nativeMotionCapabilityAuthoritative:true
    }
  ]
};

const result=resolveGlazeCrossDeviceConsistencyV12(base);
assert(result.version==='1.7.0-dev.35'&&result.v12SpecificationSections[0]===42,'runtime Section 42 identity mismatch');
assert(result.targets.length===4,'cross-device target count mismatch');
assert(result.consistency.authoritySatisfied===true&&result.consistency.semanticContractConsistent===true,'authoritative semantic consistency should resolve');
assert(result.consistency.sourceConsistencyEstablished===true,'Section 42 source consistency should establish for authoritative input');
assert(new Set(result.targets.map(x=>x.sharedSemantics.semanticRole)).size===1,'semantic role diverged across targets');
assert(new Set(result.targets.map(x=>x.sharedSemantics.semanticState)).size===1,'semantic state diverged across targets');
assert(new Set(result.targets.map(x=>x.sharedSemantics.semanticColorRole)).size===1,'semantic color role diverged across targets');
assert(new Set(result.targets.map(x=>x.sharedSemantics.motionFamily)).size===1,'motion family meaning diverged across targets');
assert(new Set(result.targets.map(x=>x.framework)).size>=3,'platform-specific frameworks were not preserved');
assert(result.nonUniformity.pixelIdenticalPresentationRequired===false,'runtime incorrectly requires pixel identity');
assert(result.nonUniformity.identicalNativeControlsRequired===false,'runtime incorrectly requires native-control identity');
assert(result.nonUniformity.identicalAnimationTimingRequired===false,'runtime incorrectly requires timing identity');
assert(result.consistency.rankingPerformed===false&&result.consistency.winnerSelected===false,'Section 42 must not rank platforms');
assert(result.acceptanceBoundary.section42Complete===false,'runtime overclaims Section 42 completion');

const untrusted=resolveGlazeCrossDeviceConsistencyV12({
  ...base,
  semanticStateAuthoritative:false
});
assert(untrusted.canonicalSemantics.semanticState.accepted==='unknown','untrusted semantic state must fail closed');
assert(untrusted.consistency.authoritySatisfied===false,'untrusted semantic state must block authority satisfaction');
assert(untrusted.consistency.sourceConsistencyEstablished===false,'untrusted semantic state must block source consistency claim');

for(const bad of [
  ()=>resolveGlazeCrossDeviceConsistencyV12({...base,durationMs:240}),
  ()=>resolveGlazeCrossDeviceConsistencyV12({...base,score:10}),
  ()=>resolveGlazeCrossDeviceConsistencyV12({...base,winner:'android-phone'}),
  ()=>resolveGlazeCrossDeviceConsistencyV12({...base,targets:[base.targets[0]]}),
  ()=>resolveGlazeCrossDeviceConsistencyV12({...base,targets:[
    base.targets[0],
    {...base.targets[3],targetId:'linux-mobile',profile:'mobile'}
  ]}),
  ()=>resolveGlazeCrossDeviceConsistencyV12({...base,targets:[
    base.targets[0],
    {...base.targets[1],targetId:'android-phone'}
  ]})
]){
  let failed=false;
  try{bad();}catch{failed=true;}
  assert(failed,'unsupported/raw/uniformity cross-device input must fail closed');
}

assert(tokens.version==='1.7.0-dev.35'&&tokens.v12SpecificationSections[0]===42,'token identity mismatch');
assert(tokens.nonUniformity.pixelIdenticalPresentationRequired===false,'token uniformity boundary weakened');
assert(tokens.acceptance.section42Complete===false,'token acceptance boundary weakened');

assert(glazeV17CrossDeviceConsistencyDevelopmentContract.version==='1.7.0-dev.35','runtime contract identity mismatch');
assert(glazeV17CrossDeviceConsistencyDevelopmentContract.rawUniformityControlsAccepted===false,'runtime raw uniformity controls boundary weakened');
assert(glazeV17CrossDeviceConsistencyDevelopmentContract.rankingAllowed===false&&glazeV17CrossDeviceConsistencyDevelopmentContract.winnerSelectionAllowed===false,'runtime ranking boundary weakened');
assert(glazeV17CrossDeviceConsistencyDevelopmentContract.section42Complete===false,'runtime contract overclaims Section 42 completion');
assert(glazeV17NativeGlazeKitsV12DevelopmentContract.version==='1.7.0-dev.29','Native Glaze Kits dependency changed');
assert(glazeV17AccessibilityContinuityDevelopmentContract.version==='1.7.0-dev.34','Accessibility Continuity dependency changed');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=35,'aggregate version regressed below dev.35');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle boundary weakened');
assert(glazeV17Development.planV12FoundationSections.includes(42),'aggregate missing Section 42');
assert(glazeV17Development.crossDeviceConsistencyFoundation==='js/glaze-v1.7-cross-device-consistency.dev.mjs','aggregate missing dev.35 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Experimental Glaze Motion');

assert(planned.includes('1.7.0-dev.35')&&planned.includes('Cross-Device Consistency'),'planned-feature control missing dev.35');
assert(implemented.includes('Cross-Device Consistency Without Uniformity')&&implemented.includes('1.7.0-dev.35'),'implemented-feature control missing dev.35');
assert(changelog.includes('1.7.0-dev.35')&&changelog.includes('Cross-Device Consistency Without Uniformity'),'changelog missing dev.35');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

for(const phrase of [
  'flutter/flutter','8db55268667c738b90677d49857ff42938e9c9fa','BSD-3-Clause',
  'JetBrains/compose-multiplatform-core','ba2c8a19a0d6e190068d99ce33d77c2f8bb5159d','Apache-2.0',
  'GNOME/libadwaita','0ffcd2c80b2260bdae01b89e88d94bb5c856db13',
  'No third-party source code'
])assert(research.includes(phrase),'research provenance missing: '+phrase);
assert(rootResearch.includes('## V1.7 dev.35 — Cross-Device Consistency Without Uniformity'),'root research register missing dev.35');

console.log('GLAZE UI V1.7 Cross-Device Consistency Development validation: PASS');
console.log('Plan binding: v1.2 Section 42');
console.log('Shared semantic dimensions: 8');
console.log('Pixel-identical presentation required: false');
console.log('Identical native controls required: false');
console.log('Platform ranking/winner selection allowed: false');
console.log('Section 42 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
