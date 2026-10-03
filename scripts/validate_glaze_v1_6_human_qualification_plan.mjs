#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  glazeV16Development,
  resolveGlazeAccessibilityProfiles,
  resolveGlazeCapabilityPresentation,
  resolveGlazeResponsiveLayout,
  resolveGlazePrivacyPresentation,
  resolveGlazeCapabilityControl,
  resolveGlazeFocusPresentation,
  createGlazeAdaptationDiagnostic,
  resolveGlazePrivacyMinimizedAdaptation,
  resolveGlazeStablePrimaryActions
} from '../js/glaze-v1.6-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(value,message)=>{if(!value)throw new Error(message);};

const plan=json('contracts/v1.6/qualification.human.plan.json');
const schema=json('schemas/v1.6-human-qualification-plan.schema.json');
const acceptance=json('contracts/v1.6/acceptance.dev.json');
const lifecycle=json('registry/lifecycle.json');
const harness=read('reference/v1.6/human-qualification.html');
const prepare=read('scripts/prepare_glaze_v1_6_human_qualification.py');

const liveStable=read('VERSION').trim();
assert(lifecycle.currentOfficial===liveStable&&lifecycle.currentStable===liveStable,'VERSION/current Stable authority must agree');
const liveRelease=lifecycle.releases.find(item=>item.version===liveStable);
assert(liveRelease&&liveRelease.status==='stable'&&liveRelease.consumerEligible===true,'live current Stable must remain a consumer-eligible Stable release');
const liveTuple=liveStable.split('.').slice(0,3).map(Number);
assert(liveTuple.length===3&&liveTuple.every(Number.isInteger),'live Stable must use major.minor.patch versioning');
assert(
  liveTuple[0]>1 || (liveTuple[0]===1 && (liveTuple[1]>5 || (liveTuple[1]===5 && liveTuple[2]>=1))),
  'human qualification requires live Stable authority at or after its frozen 1.5.1 qualification baseline'
);
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'retained V1.6 qualification tooling must not create an active lifecycle candidate');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','human review plan schema dialect mismatch');
assert(plan.schemaVersion===1,'human review plan schemaVersion drifted');
assert(plan.lifecycle==='DevelopmentQualification','human review lifecycle mismatch');
assert(plan.sourceRevision==='c7509c79256b04b0aa67cb9dd0737d7588e0ae4a','human review must remain bound to frozen V1.6 source');
assert(plan.acceptanceModelVersion==='1.6.0-dev.12','human review acceptance model mismatch');
assert(plan.stableBaseline==='1.5.1'&&plan.consumerEligible===false,'human review Stable/consumer boundary drifted');
assert(plan.evidenceType==='human','human review plan must target human evidence only');

const expectedLanes=[
  'accessibility','keyboard-navigation','privacy-boundaries',
  'authority-boundaries','representative-rendering'
];
assert(JSON.stringify(plan.lanes)===JSON.stringify(expectedLanes),'human review lane scope drifted');
assert(!plan.lanes.includes('assistive-technology'),'Assistive technology must remain a separate evidence lane');
assert(!plan.lanes.includes('performance'),'Performance must remain a separate evidence lane');

const requirements=acceptance.evidenceRequirements;
assert(JSON.stringify(requirements.accessibility)==='[["machine"],["human","assistive-technology"]]','Accessibility grouped evidence drifted');
assert(JSON.stringify(requirements['keyboard-navigation'])==='[["machine"],["human"]]','Keyboard navigation grouped evidence drifted');
assert(JSON.stringify(requirements['privacy-boundaries'])==='[["machine"],["human"]]','Privacy boundaries grouped evidence drifted');
assert(JSON.stringify(requirements['authority-boundaries'])==='[["machine"],["human"]]','Authority boundaries grouped evidence drifted');
assert(JSON.stringify(requirements['representative-rendering'])==='[["rendered"],["device","human"]]','Representative rendering grouped evidence drifted');
assert(JSON.stringify(requirements['assistive-technology'])==='[["assistive-technology"]]','Assistive Technology lane must remain separate');
assert(JSON.stringify(requirements.performance)==='[["performance"]]','Performance lane must remain separate');

assert(plan.execution.repositoryLocalOnly===true,'human review must remain repository-local');
assert(plan.execution.telemetryRequired===false&&plan.execution.remoteAnalysisRequired===false,'human review must not require telemetry or remote analysis');
assert(plan.execution.realHumanObservationRequired===true,'real human observation must remain required');
assert(plan.execution.realKeyboardInteractionRequiredForKeyboardLane===true,'real keyboard interaction must remain required');
assert(plan.execution.reviewerMustConfirmRepresentativeRuntimeForRenderingLane===true,'representative runtime confirmation must remain required');
assert(plan.execution.reviewFindingsMustBeRecordedOutsideHarness===true,'review findings must remain external to harness');
assert(plan.execution.generatedEvidenceAutomatic===false,'harness must not automatically generate human evidence');

for(const key of [
  'humanEvidenceClaimedByPlan','assistiveTechnologyEvidenceClaimed',
  'physicalDeviceEvidenceClaimed','performanceEvidenceClaimed','lifecyclePromotionAutomatic',
  'candidateStatusGranted','releaseCandidateStatusGranted','stableStatusGranted',
  'consumerAcceptanceAutomatic','deploymentAcceptanceAutomatic','productionAcceptanceAutomatic'
]) assert(plan.evidenceBoundary[key]===false,'human review authority boundary must remain false: '+key);

assert(harness.includes("const SOURCE='c7509c79256b04b0aa67cb9dd0737d7588e0ae4a'"),'harness frozen source binding missing');
assert(harness.includes("fetch('../../qualification-source.json'"),'harness must verify prepared source manifest');
assert(harness.includes('Human review surface only — not acceptance evidence.'),'human non-evidence notice missing');
assert(harness.includes('This page intentionally has no PASS button'),'no-PASS control boundary missing');
assert(harness.includes("document.addEventListener('keydown'"),'real keyboard observation support missing');
assert(harness.includes('aria-live="polite"'),'semantic live region missing');
assert(harness.includes(':focus-visible'),'visible focus styling missing');
assert(harness.includes('createGlazeAdaptationDiagnostic'),'privacy-minimized diagnostic review missing');
assert(harness.includes('resolveGlazePrivacyMinimizedAdaptation'),'privacy signal-minimization review missing');
assert(harness.includes('resolveGlazeStablePrimaryActions'),'primary action stability review missing');
assert(harness.includes('resolveGlazePrivacyPresentation'),'privacy authority review missing');
assert(harness.includes('resolveGlazeCapabilityControl'),'capability authority review missing');
assert(!/https?:\/\//i.test(harness),'human review harness must not load remote network resources');
assert(!/navigator\.mediaDevices|getUserMedia|sendBeacon|WebSocket|XMLHttpRequest/i.test(harness),'human review harness must not capture media or emit telemetry');
assert(!/localStorage|sessionStorage|indexedDB/i.test(harness),'review scratch notes must not persist locally without explicit governance');
assert(!/download\s*=|Blob\s*\(|URL\.createObjectURL/i.test(harness),'human review harness must not generate an evidence file');
assert(!/evidenceType\s*[:=]\s*['"]human['"]/i.test(harness),'human review harness must not manufacture human evidence');

assert(prepare.includes('SOURCE_REVISION = "c7509c79256b04b0aa67cb9dd0737d7588e0ae4a"'),'preparation helper source binding missing');
assert(prepare.includes('"archive", "--format=tar"'),'preparation helper must materialize frozen source through git archive');
assert(prepare.includes('"humanEvidenceClaimed": False'),'preparation helper must not claim human evidence');
assert(prepare.includes('"assistiveTechnologyEvidenceClaimed": False'),'preparation helper must not claim assistive-technology evidence');
assert(prepare.includes('"performanceEvidenceClaimed": False'),'preparation helper must not claim performance evidence');

assert(glazeV16Development.version==='1.6.0-dev.12'&&glazeV16Development.lifecycle==='development','aggregate identity mismatch');
assert(glazeV16Development.stableBaseline==='1.5.1'&&glazeV16Development.consumerEligible===false,'aggregate Stable/consumer boundary drifted');

const permission=resolveGlazeCapabilityPresentation({state:'permission-required'});
assert(permission.interactive===false&&permission.permissionRequestedAutomatically===false,'permission-required must not request automatically');
assert(permission.authority.permissionGranted===false,'Glaze must not grant permission');

const restricted=resolveGlazeCapabilityControl({state:'restricted',essential:true,explanationAvailable:true});
assert(restricted.control.enabled===false&&restricted.control.permissionRequestAutomatic===false,'restricted control must remain non-automatic');
assert(restricted.authority.consequentialExecutionAutomatic===false,'capability control must not execute consequences');

const untrustedPrivate=resolveGlazePrivacyPresentation({state:'private',authoritative:false});
assert(untrustedPrivate.acceptedState==='unknown','positive privacy state without authority must fail closed');
assert(untrustedPrivate.authority.consentGrantedByGlaze===false&&untrustedPrivate.authority.permissionGrantedByGlaze===false,'privacy presentation must not create consent or permission');

const profiles=resolveGlazeAccessibilityProfiles({preferences:{reducedMotion:true,largeText:true,keyboardFirst:true,strongFocus:true}});
assert(profiles.presentation.continuousDecorativeMotionAllowed===false,'Reduced Motion must suppress continuous decorative motion');
assert(profiles.presentation.largeTextReflowRequired===true,'large text must require reflow');
assert(profiles.presentation.strongFocusRequired===true,'keyboard-focused review must support strong focus');

const focus=resolveGlazeFocusPresentation({modality:'keyboard',focused:true,focusVisible:true,requestedRestoreTarget:'apply',restoreTargetValid:true,material:'glass'});
assert(focus.focus.visible===true&&focus.focus.strongIndicator===true,'keyboard focus must remain visibly strong');
assert(focus.continuity.focusStealingAllowed===false,'Glaze must not steal focus');
assert(focus.continuity.restoration.automaticExecutionByGlaze===false,'focus restoration remains caller-owned');

const layout=resolveGlazeResponsiveLayout({environment:'compact',viewingDistance:'near',inputMode:'keyboard',posture:'folded',contentDensity:'standard',task:'editing',accessibilityProfiles:profiles.profiles});
assert(layout.continuity.userEnteredDataPreserved===true&&layout.continuity.currentLocationPreserved===true,'responsive review requires task continuity');
assert(layout.authority.presentationOnly===true,'responsive layout must remain presentation-only');

const diagnostic=createGlazeAdaptationDiagnostic({reasonCodes:['review'],accessibilityProfiles:profiles.profiles,performanceLevel:'balanced'});
assert(Object.values(diagnostic.privacy).every(value=>value===false),'diagnostics must exclude private/raw data classes');
assert(diagnostic.authority.operationalAuthorityGranted===false,'diagnostics must not grant operational authority');

const minimization=resolveGlazePrivacyMinimizedAdaptation({requestedSignals:['layout-environment','input-mode','personal-content','private-communications','precise-user-behavior']});
assert(minimization.acceptedSignals.includes('layout-environment')&&minimization.acceptedSignals.includes('input-mode'),'approved adaptation signals must remain usable');
for(const signal of ['personal-content','private-communications','precise-user-behavior']){
  assert(minimization.explicitlyProhibited.includes(signal),'prohibited private signal must remain rejected: '+signal);
}

const stableActions=resolveGlazeStablePrimaryActions({previousIds:['save','share','archive'],requestedIds:['archive','save','details'],taskRelatedReason:false});
assert(JSON.stringify(stableActions.acceptedIds)==='["save","archive","details"]','surviving primary actions must retain relative order during transient adaptation');
assert(stableActions.authority.actionsExecutedByGlaze===false,'action ordering must not execute actions');

console.log('GLAZE UI V1.6 human qualification review control: PASS');
console.log('Frozen source: '+plan.sourceRevision);
console.log('Human-capable open lanes prepared: '+plan.lanes.join(', '));
console.log('Assistive Technology lane included: false');
console.log('Performance lane included: false');
console.log('Automatic human evidence generation: false');
console.log('Stable baseline preserved: 1.5.1');
