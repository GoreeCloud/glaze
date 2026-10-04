#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  glazeV17V13Development,
  resolveGlazeAdaptiveComposition,
  resolveGlazeAdaptiveInputBinding,
  resolveGlazeSignatureMotion,
  resolveGlazePrivacyAuthorityBoundaryV12,
  resolveGlazeTaskContinuity
} from '../js/glaze-v1.7-development-v1-3.dev.mjs';
import {glazeV171Development} from '../js/glaze-v1.7.1-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(value,message)=>{if(!value)throw new Error(message);};

const plan=json('contracts/v1.7/qualification.v1.2.human.plan.json');
const schema=json('schemas/v1.7.1-human-qualification-plan.schema.json');
const acceptance=json('contracts/v1.7/acceptance.dev.json');
const lifecycle=json('registry/lifecycle.json');
const harness=read('reference/v1.7/human-qualification.html');
const prepare=read('scripts/prepare_glaze_v1_7_1_human_qualification.py');
const version=read('VERSION').trim();

const SOURCE='4b9d085a5177b96cc31d4270b38d792a59872e37';
const SOURCE_MODEL='1.7.0-dev.47';
const ACCEPTANCE='1.7.0-dev.39';
const STABLE='1.7.0';
const HISTORICAL_STABLE='1.6.0';
const LANES=['keyboard','pointer','representative-rendering','human-visual-motion-review','privacy-boundaries','security-boundaries'];

assert(version===STABLE,'bounded V1.7 Stable version changed');
assert(lifecycle.currentOfficial===STABLE&&lifecycle.currentStable===STABLE&&lifecycle.currentLifecycle==='anchor','bounded V1.7 Stable/Anchor authority changed');
assert(lifecycle.plannedNext==='1.7.1'&&lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'human review tooling must not create lifecycle candidate state');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','human plan schema dialect mismatch');
assert(plan.schemaVersion===1&&plan.planId==='goreecloud.glaze.v1.7.1.human-qualification','human plan identity drifted');
assert(plan.lifecycle==='DevelopmentQualification'&&plan.successorReleaseLine==='1.7.1'&&plan.developmentIdentity==='1.7.1-dev.1','successor identity drifted');
assert(plan.sourceRevision===SOURCE&&plan.sourceModelVersion===SOURCE_MODEL,'human plan frozen-source binding drifted');
assert(plan.acceptanceModelVersion===ACCEPTANCE&&plan.stableBaseline===STABLE&&plan.historicalSourceStableBaseline===HISTORICAL_STABLE,'human plan acceptance/baseline binding drifted');
assert(plan.consumerEligible===false&&plan.evidenceType==='human','human plan authority/evidence type drifted');
assert(JSON.stringify(plan.lanes)===JSON.stringify(LANES),'human lane set drifted');

const expectedGroups={
  keyboard:[['machine'],['human']],
  pointer:[['machine'],['human']],
  'representative-rendering':[['rendered'],['human']],
  'human-visual-motion-review':[['human']],
  'privacy-boundaries':[['machine'],['human']],
  'security-boundaries':[['machine'],['human']]
};
for(const lane of LANES){
  assert(JSON.stringify(acceptance.evidenceRequirements[lane])===JSON.stringify(expectedGroups[lane]),'acceptance evidence requirements drifted: '+lane);
}
assert(JSON.stringify(acceptance.evidenceRequirements['alternative-input'])===JSON.stringify([['assistive-technology'],['human']]),'alternative-input evidence requirement drifted');
assert(!plan.lanes.includes('alternative-input'),'human review control must not pretend to close alternative-input without assistive-technology evidence');
assert(!plan.lanes.includes('assistive-technology'),'human review control must not include AT-only lane');
assert(!plan.lanes.includes('performance')&&!plan.lanes.includes('energy-behavior'),'human review control must not include performance/energy lanes');

assert(plan.execution.repositoryLocalOnly===true&&plan.execution.telemetryRequired===false&&plan.execution.remoteAnalysisRequired===false,'human review must remain local/private');
assert(plan.execution.realHumanObservationRequired===true,'real human observation must be required');
assert(plan.execution.realKeyboardInteractionRequiredForKeyboardLane===true&&plan.execution.realPointerInteractionRequiredForPointerLane===true,'real input observation requirements weakened');
assert(plan.execution.reviewerMustConfirmRepresentativeRuntimeForRenderingLane===true,'representative-runtime confirmation missing');
assert(plan.execution.reviewerMustObserveMotionAndReducedMotion===true,'motion/Reduced Motion observation requirement missing');
assert(plan.execution.reviewerMustInspectPrivacyAndSecurityTruthBoundaries===true,'privacy/security observation requirement missing');
assert(plan.execution.reviewFindingsMustBeRecordedOutsideHarness===true&&plan.execution.generatedEvidenceAutomatic===false,'harness must not generate human evidence');

for(const key of [
  'humanEvidenceClaimedByPlan','assistiveTechnologyEvidenceClaimed','physicalDeviceEvidenceClaimed',
  'performanceEvidenceClaimed','energyEvidenceClaimed','section48Accepted','v171AcceptanceClaimed',
  'lifecyclePromotionAutomatic','consumerAcceptanceAutomatic','deploymentAcceptanceAutomatic',
  'productionAcceptanceAutomatic'
]) assert(plan.evidenceBoundary[key]===false,'human plan authority boundary must remain false: '+key);
assert(plan.evidenceBoundary.reviewSurfaceOnly===true,'human plan must remain review-surface-only');

assert(glazeV17V13Development.version===SOURCE_MODEL&&glazeV17V13Development.lifecycle==='Development','frozen dev.47 aggregate identity changed');
assert(glazeV17V13Development.stableBaseline===HISTORICAL_STABLE&&glazeV17V13Development.consumerEligible===false,'historical source boundary changed');
assert(glazeV171Development.version==='1.7.1-dev.1'&&glazeV171Development.stableBaseline===STABLE,'V1.7.1 successor identity changed');
assert(glazeV171Development.retainedEvidenceAutomaticallyRebound===false,'retained evidence must not automatically rebind');

for(const marker of [
  "const SOURCE='"+SOURCE+"'",
  "const SOURCE_MODEL='"+SOURCE_MODEL+"'",
  "const ACCEPTANCE='"+ACCEPTANCE+"'",
  "const STABLE='"+STABLE+"'",
  "const HISTORICAL_STABLE='"+HISTORICAL_STABLE+"'",
  "event.isTrusted",
  "resolveGlazeAdaptiveInputBinding",
  "resolveGlazeSignatureMotion",
  "resolveGlazePrivacyAuthorityBoundaryV12",
  "resolveGlazeTaskContinuity",
  "rendered-v1.2-qualification.html?revision="
]) assert(harness.includes(marker),'human harness missing required marker: '+marker);
assert(harness.includes('Human review surface only — not acceptance evidence.'),'human harness authority warning missing');
assert(harness.includes('Record findings outside this harness.'),'external record boundary missing');
assert(!/\bPASS\b/.test(harness),'human harness must not expose PASS language');
assert(!harness.includes('downloadEvidence')&&!harness.includes('createObjectURL')&&!harness.includes('localStorage.setItem'),'human harness must not generate or persist evidence');

for(const marker of [
  'SOURCE_REVISION = "'+SOURCE+'"',
  'SOURCE_MODEL = "'+SOURCE_MODEL+'"',
  'STABLE_BASELINE = "'+STABLE+'"',
  'HISTORICAL_SOURCE_STABLE_BASELINE = "'+HISTORICAL_STABLE+'"',
  '"archive", "--format=tar"',
  'rendered-v1.2-*',
  '"humanEvidenceClaimed": False',
  '"section48Accepted": False',
  '"v171AcceptanceClaimed": False'
]) assert(prepare.includes(marker),'human preparation helper missing boundary/source marker: '+marker);

const keyboard=resolveGlazeAdaptiveInputBinding({actionId:'apply-review-scenario',inputModel:'keyboard',state:'available',authoritative:true,essential:true});
const pointer=resolveGlazeAdaptiveInputBinding({actionId:'apply-review-scenario',inputModel:'pointer',state:'available',authoritative:true,essential:true});
for(const binding of [keyboard,pointer]){
  assert(binding.binding.canPresentAsEnabled===true,'authoritative review action not presentable');
  assert(binding.binding.physicalBindingCreatesSemanticAuthority===false,'physical binding gained semantic authority');
  assert(binding.binding.executionAutomatic===false,'review input binding auto-executed');
}

const standardMotion=resolveGlazeSignatureMotion({relationship:'workspace-recomposition',relationshipAuthoritative:true});
const reducedMotion=resolveGlazeSignatureMotion({relationship:'workspace-recomposition',relationshipAuthoritative:true,accessibilityProfiles:['reduced-motion']});
assert(standardMotion.signature.signatureFamilyApplied===true,'governed signature motion missing');
assert(reducedMotion.accessibility.reducedMotionApplied===true&&reducedMotion.accessibility.motionRequiredToUnderstandState===false,'Reduced Motion boundary weakened');

const privacyAuthoritative=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'privacy-consent',
  claims:[{providerId:'privacy-shield',ownerKind:'privacy-shield',authority:'privacy',scope:'system',state:'revoked',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(privacyAuthoritative.truth.accepted===true&&privacyAuthoritative.truth.effectiveState==='revoked','authoritative privacy revocation not accepted');

const privacyUntrusted=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'privacy-consent',
  claims:[{providerId:'privacy-shield',ownerKind:'privacy-shield',authority:'privacy',scope:'system',state:'granted',authorityAttested:false}],
  transitionOccurrenceAuthoritative:true
});
assert(privacyUntrusted.truth.accepted===false&&privacyUntrusted.truth.effectiveState==='unknown','unattested positive privacy claim did not fail closed');

const wardveil=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'security-protection',
  claims:[{providerId:'wardveil-security',ownerKind:'wardveil-security',authority:'security',scope:'system',state:'protected',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(wardveil.truth.accepted===true&&wardveil.presentation.protectionCueAllowed===true,'authoritative Wardveil protection not reviewable');

const spoof=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'security-protection',
  claims:[{providerId:'random-service',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'protected',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(spoof.truth.accepted===false&&spoof.truth.effectiveState==='unknown','security provider spoof did not fail closed');

const conflict=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'synchronization',
  claims:[
    {providerId:'sync-a',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'synchronized',authorityAttested:true},
    {providerId:'sync-b',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'failed',authorityAttested:true}
  ],
  transitionOccurrenceAuthoritative:true
});
assert(conflict.providerSnapshot.conflict===true&&conflict.truth.effectiveState==='unknown','truth conflict did not fail closed');

for(const profile of ['desktop','mobile']){
  const composition=resolveGlazeAdaptiveComposition({profile,semanticSurfaceId:'human-qualification-task',surfaceRole:'task',posture:'unknown'});
  assert(composition.preservation.semanticIdentityPreserved===true&&composition.preservation.taskStatePreserved!==false,'representative composition weakened continuity: '+profile);
}

const continuity=resolveGlazeTaskContinuity({
  environmentChange:'input-method',
  previous:{draftText:'V1.7.1-HUMAN-REVIEW-TASK-STATE',focusId:'apply'},
  incoming:{},
  stateClasses:{draftText:'recoverable',focusId:'session-scoped'}
});
assert(continuity.state.draftText==='V1.7.1-HUMAN-REVIEW-TASK-STATE'&&continuity.state.focusId==='apply','task/focus continuity smoke failed');

console.log('Glaze V1.7.1 human qualification review control: PASS');
console.log('Frozen source: '+SOURCE+' / '+SOURCE_MODEL);
console.log('Human-capable lanes prepared: '+LANES.join(', '));
console.log('Real keyboard/pointer observation required: true');
console.log('Automatic human evidence generation: false');
console.log('Assistive Technology/device/performance/energy evidence claimed: false');
console.log('Current bounded Stable preserved: '+STABLE);
