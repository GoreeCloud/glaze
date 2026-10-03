#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  evaluateGlazePerformanceMeasurements,
  glazeV16PerformanceDiagnosticsDevelopmentContract
} from '../js/glaze-v1.6-performance-diagnostics.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(value,message)=>{if(!value)throw new Error(message);};

const plan=json('contracts/v1.6/qualification.performance.plan.json');
const schema=json('schemas/v1.6-performance-qualification-plan.schema.json');
const acceptance=json('contracts/v1.6/acceptance.dev.json');
const lifecycle=json('registry/lifecycle.json');
const harness=read('reference/v1.6/performance-qualification.html');
const prepare=read('scripts/prepare_glaze_v1_6_performance_qualification.py');

const liveStable=read('VERSION').trim();
assert(lifecycle.currentOfficial===liveStable&&lifecycle.currentStable===liveStable,'VERSION/current Stable authority must agree');
const liveRelease=lifecycle.releases.find(item=>item.version===liveStable);
assert(liveRelease&&liveRelease.status==='stable'&&liveRelease.consumerEligible===true,'live current Stable must remain a consumer-eligible Stable release');
const liveTuple=liveStable.split('.').slice(0,3).map(Number);
assert(liveTuple.length===3&&liveTuple.every(Number.isInteger),'live Stable must use major.minor.patch versioning');
assert(
  liveTuple[0]>1 || (liveTuple[0]===1 && (liveTuple[1]>5 || (liveTuple[1]===5 && liveTuple[2]>=1))),
  'performance qualification requires live Stable authority at or after its frozen 1.5.1 qualification baseline'
);
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'retained V1.6 qualification tooling must not create an active lifecycle candidate');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','performance plan schema dialect mismatch');
assert(plan.schemaVersion===1,'performance plan schemaVersion drifted');
assert(plan.planId==='goreecloud.glaze-ui.v1.6.representative-performance-qualification','performance plan ID drifted');
assert(plan.lifecycle==='DevelopmentQualification','performance plan lifecycle mismatch');
assert(plan.sourceRevision==='c7509c79256b04b0aa67cb9dd0737d7588e0ae4a','performance plan must remain bound to frozen V1.6 source');
assert(plan.acceptanceModelVersion==='1.6.0-dev.12','performance plan acceptance model mismatch');
assert(plan.stableBaseline==='1.5.1'&&plan.consumerEligible===false,'performance plan Stable/consumer boundary drifted');
assert(plan.laneId==='performance'&&plan.evidenceType==='performance','performance plan must target only the performance lane');

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
assert(budget.activeFrameP95Rule==='max(20ms,1.25*idle-median-frame-interval)','active-frame rule drifted');
assert(budget.minimumSamples.resolver===200&&budget.minimumSamples.interactionPaint===30,'resolver/interaction sample minima drifted');
assert(budget.minimumSamples.idleFrames===120&&budget.minimumSamples.activeFrames===240,'frame sample minima drifted');

assert(JSON.stringify(acceptance.evidenceRequirements.performance)==='[["performance"]]','acceptance performance evidence group drifted');
assert(plan.execution.repositoryLocalOnly===true,'performance review must remain repository-local');
assert(plan.execution.telemetryRequired===false&&plan.execution.remoteAnalysisRequired===false,'performance review must not require telemetry or remote analysis');
assert(plan.execution.reviewerMustConfirmRepresentativeEnvironment===true,'representative environment confirmation must be required');
assert(plan.execution.reviewerMustConfirmAuthorityIncidentsAbsent===true,'authority observation review must be required');
assert(plan.execution.realReviewControlInteractionsRequired===true,'real review-control interactions must be required');
assert(plan.execution.hostedCiMayClaimRepresentativePerformance===false,'hosted CI must not claim representative performance');
assert(plan.execution.generatedEvidenceRequiresSeparateDurableReview===true,'generated measurements must require separate durable review');

for(const key of [
  'performanceEvidenceClaimedByPlan','humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed',
  'physicalDeviceEvidenceClaimed','representativeRenderingSecondGroupClaimed',
  'lifecyclePromotionAutomatic','candidateStatusGranted','releaseCandidateStatusGranted',
  'stableStatusGranted','consumerAcceptanceAutomatic','deploymentAcceptanceAutomatic',
  'productionAcceptanceAutomatic'
]) assert(plan.evidenceBoundary[key]===false,'performance plan authority boundary must remain false: '+key);

assert(harness.includes("const SOURCE='c7509c79256b04b0aa67cb9dd0737d7588e0ae4a'"),'harness frozen source binding missing');
assert(harness.includes("fetch('../../qualification-source.json'"),'harness must verify prepared source manifest');
assert(harness.includes("addEventListener('click',recordInteraction)"),'harness must measure real review-control click events');
assert(!harness.includes("$('interaction-target').click("),'harness must not synthesize qualification interactions');
assert(harness.includes("evaluateGlazePerformanceMeasurements(input)"),'harness must use governed performance evaluator');
assert(harness.includes("representativeEnvironmentConfirmed"),'harness must record representative-environment confirmation');
assert(harness.includes("durableEvidenceRecorded:false"),'harness must not claim durable evidence recording');
assert(harness.includes("performanceLaneClosed:false"),'harness must not close performance lane automatically');

assert(prepare.includes('git", "archive"')||prepare.includes('"archive", "--format=tar"'),'preparation helper must materialize frozen source through git archive');
assert(prepare.includes('SOURCE_REVISION = "c7509c79256b04b0aa67cb9dd0737d7588e0ae4a"'),'preparation helper source binding missing');
assert(prepare.includes('performanceEvidenceClaimed": False'),'preparation helper must not claim performance evidence');

const environment={
  exactRevision:plan.sourceRevision,
  lifecycle:'DevelopmentQualification',
  operatingSystem:'Representative OS',
  runtime:'Representative Runtime',
  hardware:'Representative Hardware',
  foregroundState:'foreground',
  presentationMode:'normal',
  measurementDate:'2026-09-18'
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

console.log('GLAZE UI V1.6 representative performance qualification control: PASS');
console.log('Frozen source: '+plan.sourceRevision);
console.log('Approved budget: '+budget.authority+' '+budget.version);
console.log('Required samples: '+budget.minimumSamples.resolver+' resolver / '+budget.minimumSamples.interactionPaint+' interactions / '+budget.minimumSamples.idleFrames+' idle frames / '+budget.minimumSamples.activeFrames+' active frames');
console.log('Hosted CI representative-performance claim: false');
console.log('Performance lane closed by tooling alone: false');
console.log('Stable baseline preserved: 1.5.1');
