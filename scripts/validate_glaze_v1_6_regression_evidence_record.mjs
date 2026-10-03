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

const record=json('acceptance/v1.6-regression-evidence.json');
const machine=json('acceptance/v1.6-machine-evidence.json');
const rendered=json('acceptance/v1.6-rendered-evidence.json');
const plan=json('contracts/v1.6/qualification.regression.plan.json');
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
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'regression evidence must not promote lifecycle');

assert(record.schemaVersion===1,'regression evidence schema version drifted');
assert(record.lifecycle==='DevelopmentQualification','regression evidence lifecycle mismatch');
assert(record.sourceRevision===plan.sourceRevision,'regression evidence source revision must match regression plan');
assert(record.sourceRevision===machine.sourceRevision&&record.sourceRevision===rendered.sourceRevision,'all V1.6 evidence must bind the same frozen source');
assert(record.acceptanceModelVersion===plan.acceptanceModelVersion,'regression acceptance model version mismatch');
assert(record.acceptanceModelVersion===machine.acceptanceModelVersion&&record.acceptanceModelVersion===rendered.acceptanceModelVersion,'evidence model version mismatch');
assert(record.stableBaseline==='1.5.1','regression Stable baseline mismatch');

assert(record.tooling.pullRequest===258,'regression tooling PR mismatch');
assert(record.tooling.toolingHeadRevision==='fe471447d37ea800d03be438e1126f0840f89000','regression tooling head mismatch');
assert(record.tooling.mergeRevision==='b1f8575d6ed9199a7eb130f919680376c2e74d14','regression tooling merge mismatch');

assert(record.qualificationRun.runId===35352215130,'regression qualification run mismatch');
assert(record.qualificationRun.verificationJobId===105622807547,'regression verification job mismatch');
assert(record.qualificationRun.comparisonJobId===105622931820,'regression comparison job mismatch');
assert(record.qualificationRun.conclusion==='success','regression qualification run must be successful');
assert(record.qualificationRun.observedAt==='2026-09-18T13:47:39Z','regression qualification observation timestamp drifted');

assert(record.artifact.id===10550685472,'regression artifact ID mismatch');
assert(record.artifact.name==='glaze-v1.6-rendered-regression-35352215130','regression artifact name mismatch');
assert(record.artifact.sizeBytes===3808954,'regression artifact size mismatch');
assert(record.artifact.digest==='sha256:5c4058fba12969fe1c95c523f5f9cd4fc1fb846cc2b3aaab4b2ba84c9034839d','regression artifact digest mismatch');
assert(record.artifact.createdAt==='2026-09-18T13:47:36Z','regression artifact creation timestamp mismatch');
assert(record.artifact.expiresAt==='2026-12-17T13:46:44Z','regression artifact retention timestamp mismatch');
assert(record.artifact.expiredAtObservation===false,'regression artifact must be unexpired at observation');
assert(record.artifact.sceneCount===9,'regression evidence must cover the nine-scene rendered set');
assert(record.artifact.pixelTolerance===0,'regression pixel tolerance must remain zero');
assert(Date.parse(record.artifact.expiresAt)>Date.parse(record.qualificationRun.observedAt),'artifact expiry must follow observation');

assert(record.comparison.kind===plan.comparison.kind,'regression comparison kind mismatch');
assert(record.comparison.priorRenderedEvidenceRunId===35348330585,'prior rendered run mismatch');
assert(record.comparison.priorRenderedEvidenceArtifactId===10549115165,'prior rendered artifact mismatch');
assert(record.comparison.semanticBaselineMatched===true,'semantic baseline must match');
assert(record.comparison.freshVisualRepeatabilityMatched===true,'fresh visual repeatability must match');
assert(record.comparison.freshCaptureCount===2,'regression evidence requires two fresh captures');
assert(record.comparison.pixelTolerance===0,'comparison pixel tolerance must remain zero');

assert(Array.isArray(record.regressionEvidence)&&record.regressionEvidence.length===1,'exactly one regression lane record is expected');
const regressionRecord=record.regressionEvidence[0];
const expectedReference='GitHub Actions run 35352215130 / comparison job 105622931820 / artifact 10550685472 / sha256:5c4058fba12969fe1c95c523f5f9cd4fc1fb846cc2b3aaab4b2ba84c9034839d';
assert(regressionRecord.id==='regression-testing','regression evidence lane mismatch');
assert(regressionRecord.verified===true,'regression evidence must be explicitly verified');
assert(regressionRecord.revision===record.sourceRevision,'regression evidence revision mismatch');
assert(regressionRecord.evidenceType==='rendered','regression evidence type must be rendered');
assert(regressionRecord.reference===expectedReference,'regression evidence reference mismatch');

const matrix=createGlazeV16AcceptanceMatrix({
  exactRevision:record.sourceRevision,
  evidence:[...machine.machineEvidence,...rendered.renderedEvidence,...record.regressionEvidence]
});
const disposition=record.matrixDisposition;

assert(matrix.verifiedCount===17&&matrix.unverifiedCount===7&&matrix.notApplicableCount===0,'combined evidence matrix count mismatch');
assert(matrix.qualificationEvidenceComplete===false,'regression evidence must not complete qualification');
assert(matrix.readyForGovernedQualificationReview===false,'regression evidence must not become review-ready');
assert(JSON.stringify(sort(matrix.lanes.filter(x=>x.status==='verified').map(x=>x.id)))===JSON.stringify(sort(disposition.fullyVerifiedLaneIds)),'fully verified regression checkpoint lanes mismatch');
assert(JSON.stringify(sort(matrix.lanes.filter(x=>x.status==='unverified'&&x.satisfiedEvidenceGroupCount>0).map(x=>x.id)))===JSON.stringify(sort(disposition.partialLaneIds)),'partial regression checkpoint lanes mismatch');
assert(JSON.stringify(sort(matrix.lanes.filter(x=>x.status==='unverified'&&x.satisfiedEvidenceGroupCount===0).map(x=>x.id)))===JSON.stringify(sort(disposition.untouchedLaneIds)),'untouched regression checkpoint lanes mismatch');
assert(disposition.verifiedCount===17&&disposition.unverifiedCount===7&&disposition.notApplicableCount===0,'recorded regression disposition counts mismatch');
assert(disposition.qualificationEvidenceComplete===false&&disposition.readyForGovernedQualificationReview===false,'recorded regression completion boundary mismatch');

const regression=matrix.lanes.find(lane=>lane.id==='regression-testing');
assert(regression.status==='verified'&&regression.satisfiedEvidenceGroupCount===2,'regression testing must be fully verified after machine plus rendered regression evidence');
for(const id of ['accessibility','keyboard-navigation','privacy-boundaries','authority-boundaries','representative-rendering']){
  const lane=matrix.lanes.find(item=>item.id===id);
  assert(lane.status==='unverified'&&lane.satisfiedEvidenceGroupCount===1,id+' must remain partial');
}
for(const id of ['assistive-technology','performance']){
  const lane=matrix.lanes.find(item=>item.id===id);
  assert(lane.status==='unverified'&&lane.satisfiedEvidenceGroupCount===0,id+' must remain untouched');
}

assert(record.authority.renderedRegressionEvidenceClaimed===true,'record must identify rendered regression authority');
for(const key of [
  'humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed','deviceEvidenceClaimed',
  'nativePlatformEvidenceClaimed','performanceEvidenceClaimed','candidateStatusGranted',
  'releaseCandidateStatusGranted','stableStatusGranted','consumerAcceptanceAutomatic',
  'deploymentAcceptanceAutomatic','productionAcceptanceAutomatic'
]) assert(record.authority[key]===false,'regression evidence authority boundary must remain false: '+key);

assert(acceptance.includes(record.sourceRevision),'acceptance matrix must name the frozen source revision');
assert(acceptance.includes(String(record.qualificationRun.runId)),'acceptance matrix must name the regression qualification run');
assert(acceptance.includes(String(record.artifact.id)),'acceptance matrix must name the regression artifact');
assert(acceptance.includes('17 fully verified lanes'),'acceptance matrix must state regression checkpoint verified count');
assert(acceptance.includes('7 lanes remain unverified'),'acceptance matrix must state regression checkpoint remaining count');
assert(acceptance.includes('Regression testing | **Verified'),'acceptance matrix must record Regression testing as verified');

console.log('GLAZE UI V1.6 regression evidence record: PASS');
console.log('Source revision: '+record.sourceRevision);
console.log('Regression qualification run/comparison job: '+record.qualificationRun.runId+'/'+record.qualificationRun.comparisonJobId);
console.log('Artifact: '+record.artifact.id+' '+record.artifact.digest);
console.log('Fully verified lanes: 17');
console.log('Unverified lanes: 7');
console.log('Qualification evidence complete: false');
console.log('Stable baseline preserved: 1.5.1');
