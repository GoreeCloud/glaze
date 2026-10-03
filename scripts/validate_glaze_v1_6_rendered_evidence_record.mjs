#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {createGlazeV16AcceptanceMatrix} from '../js/glaze-v1.6-acceptance.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const sort=value=>[...value].sort();

const record=json('acceptance/v1.6-rendered-evidence.json');
const machine=json('acceptance/v1.6-machine-evidence.json');
const plan=json('contracts/v1.6/qualification.rendered.plan.json');
const lifecycle=json('registry/lifecycle.json');
const acceptance=read('acceptance/v1.6-development.md');

const liveStable=read('VERSION').trim();
assert(lifecycle.currentOfficial===liveStable&&lifecycle.currentStable===liveStable,'VERSION/current Stable authority must agree');
const liveRelease=lifecycle.releases.find(item=>item.version===liveStable);
assert(liveRelease&&liveRelease.status==='stable'&&liveRelease.consumerEligible===true,'live current Stable must remain a consumer-eligible Stable release');
const liveTuple=liveStable.split('.').slice(0,3).map(Number);
assert(liveTuple.length===3&&liveTuple.every(Number.isInteger),'live Stable must use major.minor.patch versioning');
assert(
  liveTuple[0]>1 || (liveTuple[0]===1 && (liveTuple[1]>5 || (liveTuple[1]===5 && liveTuple[2]>=1))),
  'V1.6 retained qualification requires live Stable authority at or after its frozen 1.5.1 baseline'
);
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'rendered evidence must not promote lifecycle');

assert(record.schemaVersion===1,'rendered evidence schema version drifted');
assert(record.lifecycle==='DevelopmentQualification','rendered evidence lifecycle mismatch');
assert(record.sourceRevision===plan.sourceRevision,'rendered evidence source revision must match rendered plan');
assert(record.sourceRevision===machine.sourceRevision,'rendered and machine evidence must bind the same frozen source');
assert(record.acceptanceModelVersion===plan.acceptanceModelVersion,'rendered acceptance model version mismatch');
assert(record.acceptanceModelVersion===machine.acceptanceModelVersion,'machine/rendered acceptance model mismatch');
assert(record.stableBaseline==='1.5.1','rendered Stable baseline mismatch');

assert(record.tooling.pullRequest===254,'rendered tooling PR mismatch');
assert(record.tooling.toolingHeadRevision==='ac737b650d02ff53ccb73dc36a013e816acb7050','rendered tooling head mismatch');
assert(record.tooling.mergeRevision==='040bb003fa137d1ddc4f162f0d91aa2d801129ce','rendered tooling merge mismatch');

assert(record.qualificationRun.runId===35348330585,'rendered qualification run mismatch');
assert(record.qualificationRun.verificationJobId===105610140264,'rendered verification job mismatch');
assert(record.qualificationRun.captureJobId===105610194447,'rendered capture job mismatch');
assert(record.qualificationRun.conclusion==='success','rendered qualification run must be successful');
assert(record.qualificationRun.observedAt==='2026-09-18T13:07:34Z','rendered qualification observation timestamp drifted');

assert(record.artifact.id===10549115165,'rendered artifact ID mismatch');
assert(record.artifact.name==='glaze-v1.6-rendered-browser-35348330585','rendered artifact name mismatch');
assert(record.artifact.sizeBytes===2191010,'rendered artifact size mismatch');
assert(record.artifact.digest==='sha256:dbd9d89353b630eae781210ba334cfcf1288189533a27f70931facee1b245506','rendered artifact digest mismatch');
assert(record.artifact.expiredAtObservation===false,'artifact was not expired at qualification observation');
assert(record.artifact.createdAt==='2026-09-18T13:07:30Z','rendered artifact creation timestamp mismatch');
assert(record.artifact.expiresAt==='2026-12-17T13:06:53Z','rendered artifact retention timestamp mismatch');
assert(record.artifact.sceneCount===9,'rendered artifact must contain the nine-scene checkpoint');
assert(Date.parse(record.artifact.expiresAt)>Date.parse(record.qualificationRun.observedAt),'artifact expiry must be after the qualification observation');

const expectedSceneIds=plan.scenes.map(scene=>scene.id);
assert(JSON.stringify(sort(record.sceneIds))===JSON.stringify(sort(expectedSceneIds)),'rendered scene set mismatch');
assert(new Set(record.sceneIds).size===9,'rendered scene IDs must be unique');

const expectedIds=sort(plan.eligibleRenderedEvidenceLaneIds);
const actualIds=sort(record.renderedEvidence.map(item=>item.id));
assert(JSON.stringify(actualIds)===JSON.stringify(expectedIds),'rendered evidence lane set mismatch');
assert(new Set(actualIds).size===8,'rendered evidence lane IDs must be unique');
const expectedReference='GitHub Actions run 35348330585 / capture job 105610194447 / artifact 10549115165 / sha256:dbd9d89353b630eae781210ba334cfcf1288189533a27f70931facee1b245506';
for(const item of record.renderedEvidence){
  assert(item.verified===true,'rendered evidence must be explicitly verified: '+item.id);
  assert(item.revision===record.sourceRevision,'rendered evidence revision mismatch: '+item.id);
  assert(item.evidenceType==='rendered','non-rendered evidence leaked into rendered record: '+item.id);
  assert(item.reference===expectedReference,'rendered evidence reference mismatch: '+item.id);
}
assert(!actualIds.includes('regression-testing'),'rendered checkpoint must not manufacture a regression baseline');

const matrix=createGlazeV16AcceptanceMatrix({
  exactRevision:record.sourceRevision,
  evidence:[...machine.machineEvidence,...record.renderedEvidence]
});
const disposition=record.matrixDisposition;

assert(matrix.verifiedCount===16&&matrix.unverifiedCount===8&&matrix.notApplicableCount===0,'combined machine/rendered matrix count mismatch');
assert(matrix.qualificationEvidenceComplete===false,'rendered evidence must not complete qualification');
assert(matrix.readyForGovernedQualificationReview===false,'rendered evidence must not become review-ready');
assert(JSON.stringify(sort(matrix.lanes.filter(x=>x.status==='verified').map(x=>x.id)))===JSON.stringify(sort(disposition.fullyVerifiedLaneIds)),'fully verified rendered checkpoint lanes mismatch');
assert(JSON.stringify(sort(matrix.lanes.filter(x=>x.status==='unverified'&&x.satisfiedEvidenceGroupCount>0).map(x=>x.id)))===JSON.stringify(sort(disposition.partialLaneIds)),'partial rendered checkpoint lanes mismatch');
assert(JSON.stringify(sort(matrix.lanes.filter(x=>x.status==='unverified'&&x.satisfiedEvidenceGroupCount===0).map(x=>x.id)))===JSON.stringify(sort(disposition.untouchedLaneIds)),'untouched rendered checkpoint lanes mismatch');
assert(disposition.verifiedCount===16&&disposition.unverifiedCount===8&&disposition.notApplicableCount===0,'recorded rendered disposition counts mismatch');
assert(disposition.qualificationEvidenceComplete===false&&disposition.readyForGovernedQualificationReview===false,'recorded rendered completion boundary mismatch');

const representative=matrix.lanes.find(lane=>lane.id==='representative-rendering');
assert(representative.status==='unverified'&&representative.satisfiedEvidenceGroupCount===1,'representative rendering must remain partial after browser rendering');
const regression=matrix.lanes.find(lane=>lane.id==='regression-testing');
assert(regression.status==='unverified'&&regression.satisfiedEvidenceGroupCount===1,'regression testing must remain machine-partial without a rendered regression baseline');
for(const id of ['assistive-technology','performance']){
  const lane=matrix.lanes.find(item=>item.id===id);
  assert(lane.status==='unverified'&&lane.satisfiedEvidenceGroupCount===0,id+' must remain untouched');
}

assert(record.authority.renderedEvidenceClaimed===true,'record must identify its rendered evidence authority');
for(const key of [
  'humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed','deviceEvidenceClaimed',
  'nativePlatformEvidenceClaimed','performanceEvidenceClaimed','regressionBaselineClaimed',
  'candidateStatusGranted','releaseCandidateStatusGranted','stableStatusGranted',
  'consumerAcceptanceAutomatic','deploymentAcceptanceAutomatic','productionAcceptanceAutomatic'
]) assert(record.authority[key]===false,'rendered evidence authority boundary must remain false: '+key);

assert(acceptance.includes(record.sourceRevision),'acceptance matrix must name the frozen source revision');
assert(acceptance.includes(String(record.qualificationRun.runId)),'acceptance matrix must name the rendered qualification run');
assert(acceptance.includes(String(record.artifact.id)),'acceptance matrix must name the rendered artifact');
assert(acceptance.includes('16 fully verified lanes'),'acceptance matrix must state rendered checkpoint verified count');
assert(acceptance.includes('8 lanes remain unverified'),'acceptance matrix must state rendered checkpoint remaining count');
assert(acceptance.includes('regression baseline remains open'),'acceptance matrix must preserve regression-baseline boundary');

console.log('GLAZE UI V1.6 rendered evidence record: PASS');
console.log('Source revision: '+record.sourceRevision);
console.log('Rendered qualification run/capture job: '+record.qualificationRun.runId+'/'+record.qualificationRun.captureJobId);
console.log('Artifact: '+record.artifact.id+' '+record.artifact.digest);
console.log('Fully verified lanes: 16');
console.log('Unverified lanes: 8');
console.log('Qualification evidence complete: false');
console.log('Stable baseline preserved: 1.5.1');
