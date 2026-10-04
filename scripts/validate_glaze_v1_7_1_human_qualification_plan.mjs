#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  glazeV17V13Development,
  resolveGlazeAdaptiveInputBinding,
  resolveGlazeAdaptiveComposition,
  resolveGlazeSignatureMotion,
  resolveGlazeExpressionV13,
  resolveGlazeTaskContinuity,
  resolveGlazePrivacyAuthorityBoundaryV12
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
const SOURCE='4b9d085a5177b96cc31d4270b38d792a59872e37';
const SOURCE_MODEL='1.7.0-dev.47',ACCEPTANCE='1.7.0-dev.39',STABLE='1.7.0',HISTORICAL='1.6.0';
const LANES=['keyboard','pointer','representative-rendering','human-visual-motion-review','privacy-boundaries','security-boundaries'];

assert(read('VERSION').trim()===STABLE,'bounded V1.7 Stable version changed');
assert(lifecycle.currentOfficial===STABLE&&lifecycle.currentStable===STABLE&&lifecycle.currentLifecycle==='anchor','bounded V1.7 Stable/Anchor authority changed');
assert(lifecycle.plannedNext==='1.7.1'&&lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'V1.7.1 successor lifecycle boundary changed');
assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','human plan schema dialect mismatch');
assert(plan.schemaVersion===1&&plan.planId==='goreecloud.glaze.v1.7.1.human-qualification','human plan identity drifted');
assert(plan.lifecycle==='DevelopmentQualification'&&plan.successorReleaseLine==='1.7.1'&&plan.developmentIdentity==='1.7.1-dev.1','human plan successor identity drifted');
assert(plan.sourceRevision===SOURCE&&plan.sourceModelVersion===SOURCE_MODEL&&plan.acceptanceModelVersion===ACCEPTANCE,'human plan exact-source binding drifted');
assert(plan.stableBaseline===STABLE&&plan.historicalSourceStableBaseline===HISTORICAL&&plan.consumerEligible===false,'human plan Stable/consumer boundary drifted');
assert(plan.evidenceType==='human'&&JSON.stringify(plan.lanes)===JSON.stringify(LANES),'human review lane scope drifted');

const req=acceptance.evidenceRequirements;
assert(JSON.stringify(req.keyboard)==='[["machine"],["human"]]','keyboard evidence requirement drifted');
assert(JSON.stringify(req.pointer)==='[["machine"],["human"]]','pointer evidence requirement drifted');
assert(JSON.stringify(req['representative-rendering'])==='[["rendered"],["human"]]','representative rendering evidence requirement drifted');
assert(JSON.stringify(req['human-visual-motion-review'])==='[["human"]]','human visual/motion evidence requirement drifted');
assert(JSON.stringify(req['privacy-boundaries'])==='[["machine"],["human"]]','privacy evidence requirement drifted');
assert(JSON.stringify(req['security-boundaries'])==='[["machine"],["human"]]','security evidence requirement drifted');
assert(JSON.stringify(req['assistive-technology'])==='[["assistive-technology"]]','assistive-technology must remain separate');
assert(JSON.stringify(req.performance)==='[["performance"]]','performance must remain separate');
assert(JSON.stringify(req['energy-behavior'])==='[["energy"],["device"]]','energy/device evidence boundary drifted');

const prereq=plan.existingEvidencePrerequisites;
assert(JSON.stringify(prereq.keyboard)==='["machine"]'&&JSON.stringify(prereq.pointer)==='["machine"]','input prerequisites drifted');
assert(JSON.stringify(prereq['representative-rendering'])==='["rendered"]','rendered prerequisite drifted');
assert(JSON.stringify(prereq['human-visual-motion-review'])==='[]','human-only lane prerequisite drifted');
assert(JSON.stringify(prereq['privacy-boundaries'])==='["machine"]'&&JSON.stringify(prereq['security-boundaries'])==='["machine"]','truth-boundary prerequisites drifted');
const exec=plan.execution;
for(const key of ['repositoryLocalOnly','realHumanObservationRequired','realKeyboardInteractionRequiredForKeyboardLane','realPointerInteractionRequiredForPointerLane','reviewerMustConfirmRepresentativeRuntimeForRenderingLane','reviewerMustObserveMotionAndReducedMotion','reviewerMustInspectPrivacyAndSecurityTruthBoundaries','reviewFindingsMustBeRecordedOutsideHarness'])assert(exec[key]===true,'required human-review execution control drifted: '+key);
assert(exec.telemetryRequired===false&&exec.remoteAnalysisRequired===false&&exec.generatedEvidenceAutomatic===false,'human review must remain local and non-automatic');
for(const key of ['humanEvidenceClaimedByPlan','assistiveTechnologyEvidenceClaimed','physicalDeviceEvidenceClaimed','performanceEvidenceClaimed','energyEvidenceClaimed','section48Accepted','v171AcceptanceClaimed','lifecyclePromotionAutomatic','consumerAcceptanceAutomatic','deploymentAcceptanceAutomatic','productionAcceptanceAutomatic'])assert(plan.evidenceBoundary[key]===false,'human review authority boundary must remain false: '+key);
assert(plan.evidenceBoundary.reviewSurfaceOnly===true,'human review must remain a review surface only');

assert(glazeV17V13Development.version===SOURCE_MODEL&&glazeV17V13Development.lifecycle==='Development','historical dev.47 aggregate identity changed');
assert(glazeV17V13Development.stableBaseline===HISTORICAL&&glazeV17V13Development.consumerEligible===false,'historical dev.47 authority boundary changed');
assert(glazeV171Development.version==='1.7.1-dev.1'&&glazeV171Development.stableBaseline===STABLE,'V1.7.1 identity changed');
assert(glazeV171Development.retainedEvidenceAutomaticallyRebound===false,'retained evidence must not automatically rebind');

assert(harness.includes("const SOURCE='"+SOURCE+"'")&&harness.includes("const SOURCE_MODEL='"+SOURCE_MODEL+"'"),'harness exact-source binding missing');
assert(harness.includes("const STABLE='"+STABLE+"'")&&harness.includes("const HISTORICAL_STABLE='"+HISTORICAL+"'"),'harness baseline binding missing');
assert(harness.includes("fetch('../../qualification-source.json'"),'harness must verify prepared source manifest');
assert(harness.includes('Human review surface only — not acceptance evidence.'),'human non-evidence notice missing');
assert(harness.includes('This page intentionally has no PASS button'),'no-PASS boundary missing');
assert(harness.includes("document.addEventListener('keydown'"),'real keyboard observation support missing');
assert(harness.includes("document.addEventListener('pointerdown'"),'real pointer observation support missing');
assert(harness.includes('aria-live="polite"')&&harness.includes(':focus-visible'),'live-region/focus review support missing');
for(const marker of ['resolveGlazeAdaptiveInputBinding','resolveGlazeAdaptiveComposition','resolveGlazeSignatureMotion','resolveGlazeExpressionV13','resolveGlazeTaskContinuity','resolveGlazePrivacyAuthorityBoundaryV12'])assert(harness.includes(marker),'V1.7 review workload missing: '+marker);
assert(!/https?:\/\//i.test(harness),'human review harness must not load remote resources');
assert(!/navigator\.mediaDevices|getUserMedia|sendBeacon|WebSocket|XMLHttpRequest/i.test(harness),'human review harness must not capture media or emit telemetry');
assert(!/localStorage|sessionStorage|indexedDB/i.test(harness),'review scratch notes must not persist locally');
assert(!/download\s*=|Blob\s*\(|URL\.createObjectURL/i.test(harness),'human review harness must not generate evidence files');
assert(!/evidenceType\s*[:=]\s*['"]human['"]/i.test(harness),'human review harness must not manufacture human evidence');

assert(prepare.includes('SOURCE_REVISION = "'+SOURCE+'"')&&prepare.includes('SOURCE_MODEL = "'+SOURCE_MODEL+'"'),'preparation helper exact-source binding missing');
assert(prepare.includes('STABLE_BASELINE = "'+STABLE+'"')&&prepare.includes('HISTORICAL_SOURCE_STABLE_BASELINE = "'+HISTORICAL+'"'),'preparer Stable baseline binding missing');
assert(prepare.includes('"archive", "--format=tar"'),'preparer must materialize frozen source through git archive');
for(const marker of ['"humanEvidenceClaimed": False','"assistiveTechnologyEvidenceClaimed": False','"physicalDeviceEvidenceClaimed": False','"performanceEvidenceClaimed": False','"energyEvidenceClaimed": False','"section48Accepted": False','"v171AcceptanceClaimed": False'])assert(prepare.includes(marker),'preparer authority boundary missing: '+marker);

const adaptive=resolveGlazeAdaptiveInputBinding({actionId:'activate-review-target',inputModel:'keyboard',state:'available',authoritative:true,essential:true,interactionDependencies:['drag'],unavailableDependencies:['drag']});
assert(adaptive.inputModel==='keyboard'&&adaptive.binding.executionAutomatic===false,'adaptive-input review workload invalid');
const pointer=resolveGlazeAdaptiveInputBinding({actionId:'activate-review-target',inputModel:'pointer',state:'available',authoritative:true,essential:true,interactionDependencies:['precision-pointer'],unavailableDependencies:['precision-pointer']});
assert(pointer.inputModel==='pointer'&&pointer.binding.physicalBindingCreatesSemanticAuthority===false,'pointer review workload invalid');
const composition=resolveGlazeAdaptiveComposition({profile:'desktop',semanticSurfaceId:'human-review-surface',surfaceRole:'task',posture:'unknown',accessibilityProfiles:[]});
assert(composition.profile==='desktop'&&composition.preservation.focusPreserved===true&&composition.preservation.draftStatePreserved===true&&composition.preservation.taskStateResetOnRecompositionAllowed===false,'representative composition review workload invalid');
const wardveil=resolveGlazePrivacyAuthorityBoundaryV12({truthDomain:'security-protection',claims:[{providerId:'wardveil-security',ownerKind:'wardveil-security',authority:'security',scope:'system',state:'protected',authorityAttested:true}],transitionOccurrenceAuthoritative:true});
assert(wardveil.truth.accepted===true&&wardveil.truth.effectiveState==='protected','authoritative Wardveil truth review workload invalid');
const spoof=resolveGlazePrivacyAuthorityBoundaryV12({truthDomain:'security-protection',claims:[{providerId:'random-service',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'protected',authorityAttested:true}],transitionOccurrenceAuthoritative:true});
assert(spoof.truth.accepted===false&&spoof.truth.effectiveState==='unknown','spoofed protection must fail closed');
const conflict=resolveGlazePrivacyAuthorityBoundaryV12({truthDomain:'synchronization',claims:[{providerId:'sync-a',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'synchronized',authorityAttested:true},{providerId:'sync-b',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'failed',authorityAttested:true}],transitionOccurrenceAuthoritative:true});
assert(conflict.providerSnapshot.conflict===true&&conflict.truth.effectiveState==='unknown','provider conflict review workload invalid');
const motion=resolveGlazeSignatureMotion({relationship:'workspace-recomposition',relationshipAuthoritative:true,accessibilityProfiles:['reduced-motion']});
assert(motion.accessibility.reducedMotionApplied===true&&motion.motion.presentation.finalStateDependsOnAnimationCompletion===false,'Reduced Motion review workload invalid');
const expression=resolveGlazeExpressionV13({geometryRole:'connected',emphasisRole:'prominent',typographyRole:'body',containmentRole:'task-region',componentRole:'content',formFactor:'desktop',inputContext:'keyboard',densityRole:'standard',colorIntent:'protected-state',compositionRole:'primary-secondary',motionPurpose:'state-change',transitionOccurrenceAuthoritative:true,expressionProfile:'balanced',expressionProfileAuthoritative:true,performancePressure:'neutral',performancePressureAuthoritative:true,accessibility:{largeText:false,reducedMotion:true,reducedTransparency:false,increasedContrast:false,forcedColors:false},accessibilityAuthoritative:true,semanticSeverity:'critical',semanticSeverityAuthoritative:true});
assert(expression.continuity.taskContinuityPreserved===true&&expression.personalization.truthMayChange===false,'expression review workload invalid');
const continuity=resolveGlazeTaskContinuity({environmentChange:'input-method',previous:{draftText:'retain',focusId:'apply'},incoming:{},stateClasses:{draftText:'recoverable',focusId:'session-scoped'}});
assert(continuity.state.draftText==='retain'&&continuity.state.focusId==='apply','task continuity review workload invalid');

console.log('Glaze V1.7.1 retained human qualification review control: PASS');
console.log('Frozen source: '+SOURCE+' / '+SOURCE_MODEL);
console.log('Target human lanes: '+LANES.join(', '));
console.log('Automatic human evidence generation: false');
console.log('Assistive-technology/device/performance/energy evidence claimed: false');
console.log('Current bounded Stable preserved: '+STABLE);
