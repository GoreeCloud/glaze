#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  evaluateGlazePerformanceMeasurements,
  glazeV16PerformanceDiagnosticsDevelopmentContract
} from '../js/glaze-v1.6-performance-diagnostics.dev.mjs';
import {
  glazeV17V13Development,
  resolveGlazeAdaptiveComposition,
  resolveGlazeSemanticColor,
  resolveGlazeMotionPerformance,
  resolveGlazePerformanceEnergyAwareness,
  resolveGlazeExpressionV13,
  resolveGlazeTaskContinuity
} from '../js/glaze-v1.7-development-v1-3.dev.mjs';
import {glazeV171Development} from '../js/glaze-v1.7.1-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(value,message)=>{if(!value)throw new Error(message);};

const plan=json('contracts/v1.7/qualification.v1.2.performance.plan.json');
const schema=json('schemas/v1.7.1-performance-qualification-plan.schema.json');
const acceptance=json('contracts/v1.7/acceptance.dev.json');
const lifecycle=json('registry/lifecycle.json');
const template=json('acceptance/v1.7.1-performance-evidence.template.json');
const harness=read('reference/v1.7/performance-qualification.html');
const prepare=read('scripts/prepare_glaze_v1_7_1_performance_qualification.py');

const SOURCE='4b9d085a5177b96cc31d4270b38d792a59872e37';
const SOURCE_MODEL='1.7.0-dev.47';
const ACCEPTANCE='1.7.0-dev.39';
const STABLE='1.7.0';
const HISTORICAL_STABLE='1.6.0';
const LANES=['frame-pacing','input-latency','performance'];

const liveStable=read('VERSION').trim();
assert(liveStable===STABLE,'V1.7.1 performance tooling must coexist with bounded Glaze V1.7 / 1.7.0 Stable');
assert(lifecycle.currentOfficial===STABLE&&lifecycle.currentStable===STABLE&&lifecycle.currentLifecycle==='anchor','bounded V1.7 Stable/Anchor authority changed');
assert(lifecycle.plannedNext==='1.7.1','V1.7.1 must remain the planned successor');
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'performance tooling must not create a lifecycle candidate');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','performance plan schema dialect mismatch');
assert(plan.schemaVersion===1,'performance plan schemaVersion drifted');
assert(plan.planId==='goreecloud.glaze.v1.7.1.representative-performance-qualification','performance plan ID drifted');
assert(plan.lifecycle==='DevelopmentQualification','performance plan lifecycle mismatch');
assert(plan.successorReleaseLine==='1.7.1'&&plan.developmentIdentity==='1.7.1-dev.1','successor identity drifted');
assert(plan.sourceRevision===SOURCE&&plan.sourceModelVersion===SOURCE_MODEL,'performance plan must remain bound to frozen dev.47 source');
assert(plan.acceptanceModelVersion===ACCEPTANCE,'performance plan acceptance model mismatch');
assert(plan.stableBaseline===STABLE&&plan.historicalSourceStableBaseline===HISTORICAL_STABLE,'stable/historical source baseline drifted');
assert(plan.consumerEligible===false,'performance plan must remain non-consumer-eligible');
assert(JSON.stringify(plan.laneIds)===JSON.stringify(LANES),'performance plan must target only frame-pacing, input-latency, and performance');
assert(plan.evidenceType==='performance','performance plan evidence type mismatch');
assert(plan.energyLaneIncluded===false,'energy behavior must remain outside this tranche');
assert(plan.energyLaneExclusionReason.includes('energy and device evidence'),'energy exclusion reason must preserve the two-group requirement');

for(const lane of LANES){
  assert(JSON.stringify(acceptance.evidenceRequirements[lane])==='[["performance"]]','acceptance performance evidence group drifted: '+lane);
}
assert(JSON.stringify(acceptance.evidenceRequirements['energy-behavior'])==='[["energy"],["device"]]','energy-behavior evidence requirement drifted');

const budget=plan.budget;
const runtimeBudget=glazeV16PerformanceDiagnosticsDevelopmentContract.approvedPerformanceBudget;
for(const [planKey,runtimeKey] of [
  ['resolverP95MsMax','resolverP95MsMax'],
  ['resolverP99MsMax','resolverP99MsMax'],
  ['interactionPaintP95MsMax','interactionPaintP95MsMax'],
  ['interactionPaintP99MsMax','interactionPaintP99MsMax'],
  ['severeFrameStallRateMax','severeFrameStallRateMax'],
  ['catastrophicForegroundStallCountMax','catastrophicForegroundStallCountMax'],
  ['taskStateResetCountMax','taskStateResetCountMax'],
  ['pageReloadRequiredCountMax','pageReloadRequiredCountMax'],
  ['automaticAuthorityActionCountMax','automaticAuthorityActionCountMax']
]){
  assert(budget[planKey]===runtimeBudget[runtimeKey],'performance budget drift: '+planKey);
}
assert(budget.authority==='GoreeCloud Standard — Glaze UI Performance Budget'&&budget.version==='v1.0','approved budget authority drifted');
assert(budget.motionAuthority==='GoreeCloud Standard — System-Wide Motion Continuity and Performance','motion-performance authority drifted');
assert(budget.activeFrameP95Rule==='max(20ms,1.25*idle-median-frame-interval)','active-frame rule drifted');
assert(budget.minimumSamples.resolver===200&&budget.minimumSamples.interactionPaint===30,'resolver/interaction sample minima drifted');
assert(budget.minimumSamples.idleFrames===120&&budget.minimumSamples.activeFrames===240,'frame sample minima drifted');

assert(plan.execution.repositoryLocalOnly===true,'performance review must remain repository-local');
assert(plan.execution.telemetryRequired===false&&plan.execution.remoteAnalysisRequired===false,'performance review must not require telemetry or remote analysis');
assert(plan.execution.reviewerMustConfirmRepresentativeEnvironment===true,'representative environment confirmation must be required');
assert(plan.execution.reviewerMustConfirmAuthorityIncidentsAbsent===true,'authority observation review must be required');
assert(plan.execution.realReviewControlInteractionsRequired===true,'real review-control interactions must be required');
assert(plan.execution.hostedCiMayClaimRepresentativePerformance===false,'hosted CI must not claim representative performance');
assert(plan.execution.generatedCandidateEvidenceRequiresSeparateDurableReview===true,'candidate measurements must require separate durable review');
assert(plan.execution.candidateEvidenceMayAutomaticallyCloseLane===false,'candidate measurement must not automatically close lanes');

for(const key of [
  'performanceEvidenceClaimedByPlan','energyEvidenceClaimed','deviceEvidenceClaimed',
  'humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed','section48Accepted',
  'v171AcceptanceClaimed','lifecyclePromotionAutomatic','consumerAcceptanceAutomatic',
  'deploymentAcceptanceAutomatic','productionAcceptanceAutomatic'
]) assert(plan.evidenceBoundary[key]===false,'performance plan authority boundary must remain false: '+key);

assert(glazeV17V13Development.version===SOURCE_MODEL,'historical V1.7 aggregate identity changed');
assert(glazeV17V13Development.stableBaseline===HISTORICAL_STABLE&&glazeV17V13Development.consumerEligible===false,'historical dev.47 boundary changed');
assert(glazeV171Development.version==='1.7.1-dev.1'&&glazeV171Development.stableBaseline===STABLE,'V1.7.1 successor identity changed');
assert(glazeV171Development.retainedEvidenceAutomaticallyRebound===false,'retained evidence must not automatically rebind to successor');

for(let index=0;index<8;index++){
  const variant=index%8;
  const profile=['desktop','tablet','mobile','foldable'][variant%4];
  const reducedMotion=variant===4;
  const pressured=variant===3||variant===6;
  resolveGlazeAdaptiveComposition({profile,semanticSurfaceId:'qualification-surface',surfaceRole:variant%2?'detail':'task',posture:profile==='foldable'?(variant===3?'folded':'unfolded'):'unknown',accessibilityProfiles:variant===5?['large-text']:[]});
  resolveGlazeSemanticColor({role:variant===2?'security':'information',prominence:variant===2?'critical':'standard',authoritative:true});
  resolveGlazeMotionPerformance({motionKind:variant===7?'direct-manipulation':'task-transition',runtimePressure:pressured?'severe':undefined,runtimePressureAuthoritative:pressured,accessibilityProfiles:reducedMotion?['reduced-motion']:[]});
  resolveGlazePerformanceEnergyAwareness({presentationDomain:variant===1?'adaptive-transition':variant===6?'background-visual-work':'material',runtimePressure:pressured?'severe':undefined,runtimePressureAuthoritative:pressured,visibilityClass:variant===6?'background':'visible',visibilityClassAuthoritative:true,accessibilityProfiles:reducedMotion?['reduced-motion']:[]});
  resolveGlazeExpressionV13({geometryRole:'connected',emphasisRole:variant===2?'prominent':'standard',typographyRole:'body',containmentRole:'task-region',componentRole:'content',formFactor:profile,inputContext:variant===7?'keyboard':'pointer',densityRole:variant===5?'compact':'standard',colorIntent:variant===2?'protected-state':'semantic-state',compositionRole:'primary-secondary',motionPurpose:'state-change',transitionOccurrenceAuthoritative:true,expressionProfile:variant===3?'calm':'balanced',expressionProfileAuthoritative:true,performancePressure:pressured?'severe':'neutral',performancePressureAuthoritative:true,accessibility:{largeText:variant===5,reducedMotion,reducedTransparency:variant===1,increasedContrast:false,forcedColors:false},accessibilityAuthoritative:true,semanticSeverity:variant===2?'critical':'ordinary',semanticSeverityAuthoritative:true});
  resolveGlazeTaskContinuity({environmentChange:variant===1?'connectivity':variant===4?'accessibility-mode':variant===7?'input-method':'window-resize',previous:{draftText:'retained',focusId:'qualification-control'},incoming:{},stateClasses:{draftText:'recoverable',focusId:'session-scoped'}});
}

const moduleMarker='<script type="module">';
assert(harness.includes(moduleMarker)&&harness.includes('</script>'),'performance harness module block missing');
const moduleBody=harness.split(moduleMarker,2)[1].split('</script>',1)[0];
const moduleWithoutImports=moduleBody
  .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];\s*/g,'')
  .replace(/import\s+[^;]+;\s*/g,'');
try{new Function(moduleWithoutImports);}catch(error){throw new Error('performance harness executable module syntax invalid: '+error.message);}

assert(harness.includes("const SOURCE='"+SOURCE+"'"),'harness frozen source binding missing');
assert(harness.includes("const SOURCE_MODEL='"+SOURCE_MODEL+"'"),'harness source model binding missing');
assert(harness.includes("const STABLE='"+STABLE+"'")&&harness.includes("const HISTORICAL_STABLE='"+HISTORICAL_STABLE+"'"),'harness stable baseline bindings missing');
assert(harness.includes("fetch('../../qualification-source.json'"),'harness must verify prepared source manifest');
assert(harness.includes("addEventListener('click',recordInteraction)"),'harness must measure real review-control click events');
assert(!harness.includes("$('interaction-target').click("),'harness must not synthesize qualification interactions');
assert(!harness.includes('state.sourceVerified=true;\\n'),'harness must not contain a literal escaped newline in executable source');
assert(harness.includes('resolveGlazeAdaptiveComposition(')&&harness.includes('resolveGlazeExpressionV13('),'harness must exercise V1.7 workload');
assert(harness.includes('evaluateGlazePerformanceMeasurements(input)'),'harness must use governed performance evaluator');
assert(harness.includes('representativeEnvironmentConfirmed'),'harness must record representative-environment confirmation');
assert(harness.includes("candidateLaneIds:['frame-pacing','input-latency','performance']"),'harness target-lane binding missing');
assert(harness.includes('durableEvidenceRecorded:false'),'harness must not claim durable evidence recording');
assert(harness.includes('performanceLanesClosed:false'),'harness must not close performance lanes automatically');
assert(harness.includes('energyEvidenceClaimed:false')&&harness.includes('deviceEvidenceClaimed:false'),'harness must not claim energy/device evidence');

assert(prepare.includes('"archive", "--format=tar"'),'preparation helper must materialize frozen source through git archive');
assert(prepare.includes('SOURCE_REVISION = "'+SOURCE+'"'),'preparation helper source binding missing');
assert(prepare.includes('SOURCE_MODEL = "'+SOURCE_MODEL+'"'),'preparation helper source-model binding missing');
assert(prepare.includes('performanceEvidenceClaimed": False'),'preparation helper must not claim performance evidence');
assert(prepare.includes('energyEvidenceClaimed": False')&&prepare.includes('deviceEvidenceClaimed": False'),'preparation helper must preserve energy/device boundary');

assert(template.sourceRevision===SOURCE&&template.sourceModelVersion===SOURCE_MODEL,'candidate template source binding drifted');
assert(template.acceptanceModelVersion===ACCEPTANCE&&template.stableBaseline===STABLE,'candidate template acceptance/stable identity drifted');
assert(JSON.stringify(template.candidateLaneIds)===JSON.stringify(LANES),'candidate template lane set drifted');
assert(template.representativeEnvironmentConfirmed===false&&template.authorityObservationReviewed===false,'candidate template must require real review confirmations');
assert(template.candidateDisposition==='unverified','candidate template must start unverified');
assert(template.authority.durableEvidenceRecorded===false&&template.authority.performanceLanesClosed===false,'candidate template must not claim durable/closed evidence');
assert(template.authority.energyEvidenceClaimed===false&&template.authority.deviceEvidenceClaimed===false,'candidate template must not claim energy/device evidence');
assert(template.authority.section48Accepted===false&&template.authority.v171AcceptanceClaimed===false,'candidate template must not grant Section 48 or V1.7.1 acceptance');

const environment={
  exactRevision:SOURCE,
  lifecycle:'DevelopmentQualification',
  operatingSystem:'Representative OS',
  runtime:'Representative Runtime',
  hardware:'Representative Hardware',
  foregroundState:'foreground',
  presentationMode:'normal',
  measurementDate:'2026-10-03'
};
const passing=evaluateGlazePerformanceMeasurements({
  environment,
  samples:{resolver:200,interactionPaint:30,idleFrames:120,activeFrames:240},
  measurements:{
    resolverP95Ms:9.5,resolverP99Ms:16,
    interactionPaintP95Ms:90,interactionPaintP99Ms:180,
    idleMedianFrameIntervalMs:16.7,activeFrameP95Ms:20,
    severeFrameStallRate:0.005,catastrophicForegroundStallCount:0,
    taskStateResetCount:0,pageReloadRequiredCount:0,automaticAuthorityActionCount:0
  }
});
assert(passing.status==='pass','governed evaluator should pass a complete within-budget fixture');

const missingEnvironment=evaluateGlazePerformanceMeasurements({
  environment:{...environment,hardware:''},
  samples:{resolver:200,interactionPaint:30,idleFrames:120,activeFrames:240},
  measurements:{
    resolverP95Ms:9.5,resolverP99Ms:16,
    interactionPaintP95Ms:90,interactionPaintP99Ms:180,
    idleMedianFrameIntervalMs:16.7,activeFrameP95Ms:20,
    severeFrameStallRate:0.005,catastrophicForegroundStallCount:0,
    taskStateResetCount:0,pageReloadRequiredCount:0,automaticAuthorityActionCount:0
  }
});
assert(missingEnvironment.status==='unverified','missing representative environment metadata must remain unverified');

const failing=evaluateGlazePerformanceMeasurements({
  environment,
  samples:{resolver:200,interactionPaint:30,idleFrames:120,activeFrames:240},
  measurements:{
    resolverP95Ms:11,resolverP99Ms:17,
    interactionPaintP95Ms:90,interactionPaintP99Ms:180,
    idleMedianFrameIntervalMs:16.7,activeFrameP95Ms:20,
    severeFrameStallRate:0.005,catastrophicForegroundStallCount:0,
    taskStateResetCount:0,pageReloadRequiredCount:0,automaticAuthorityActionCount:0
  }
});
assert(failing.status==='fail','over-budget resolver measurements must fail closed');

console.log('Glaze V1.7.1 representative performance qualification control: PASS');
console.log('Frozen source: '+plan.sourceRevision+' / '+plan.sourceModelVersion);
console.log('Target lanes: '+plan.laneIds.join(', '));
console.log('Approved budget: '+budget.authority+' '+budget.version);
console.log('Required samples: '+budget.minimumSamples.resolver+' resolver / '+budget.minimumSamples.interactionPaint+' interactions / '+budget.minimumSamples.idleFrames+' idle frames / '+budget.minimumSamples.activeFrames+' active frames');
console.log('Hosted CI representative-performance claim: false');
console.log('Performance lanes closed by tooling alone: false');
console.log('Energy/device evidence claimed: false');
console.log('Current bounded Stable preserved: '+STABLE);
