#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createGlazeV17AcceptanceMatrix} from '../js/glaze-v1.7-acceptance.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const sorted=values=>[...values].sort();
const SOURCE='4b9d085a5177b96cc31d4270b38d792a59872e37';
const TOOLING='83c8d783dc57a78ad87d0819e06bd59782978989';
const MERGE='8508f2636fe2364d041bb36f1d4a78c154978018';

const record=json('acceptance/v1.7.1-regression-evidence.json');
const plan=json('contracts/v1.7/qualification.v1.2.regression.plan.json');
const machinePlan=json('contracts/v1.7/qualification.v1.2.machine.plan.json');
const renderedPlan=json('contracts/v1.7/qualification.v1.2.rendered.plan.json');
const lifecycle=json('registry/lifecycle.json');
const hardening=read('GLAZE_V1_7_1_HARDENING.md');

assert.equal(read('VERSION').trim(),'1.7.0');
assert.equal(lifecycle.currentOfficial,'1.7.0');
assert.equal(lifecycle.currentStable,'1.7.0');
assert.equal(lifecycle.currentLifecycle,'anchor');
assert.equal(lifecycle.plannedNext,'1.7.1');
assert.equal(lifecycle.activeCandidate,null);
assert.equal(lifecycle.activePatchReleaseCandidate,null);

assert.equal(record.schemaVersion,1);
assert.equal(record.lifecycle,'DevelopmentQualification');
assert.equal(record.successorReleaseLine,'1.7.1');
assert.equal(record.developmentIdentity,'1.7.1-dev.1');
assert.equal(record.sourceRevision,SOURCE);
assert.equal(record.sourceRevision,plan.sourceRevision);
assert.equal(record.sourceModelVersion,'1.7.0-dev.47');
assert.equal(record.sourceModelVersion,plan.sourceModelVersion);
assert.equal(record.acceptanceModelVersion,'1.7.0-dev.39');
assert.equal(record.acceptanceModelVersion,plan.acceptanceModelVersion);
assert.equal(record.stableBaseline,'1.7.0');
assert.equal(record.stableBaseline,plan.stableBaseline);
assert.equal(record.historicalSourceStableBaseline,'1.6.0');
assert.equal(record.historicalSourceStableBaseline,plan.historicalSourceStableBaseline);

assert.equal(record.tooling.pullRequest,393);
assert.equal(record.tooling.toolingHeadRevision,TOOLING);
assert.equal(record.tooling.mergeRevision,MERGE);
assert.equal(record.qualificationRun.runId,37157473094);
assert.equal(record.qualificationRun.verificationJobId,111303763574);
assert.equal(record.qualificationRun.comparisonJobId,111303887933);
assert.equal(record.qualificationRun.conclusion,'success');
assert.equal(record.qualificationRun.observedAt,'2026-10-03T22:11:18Z');
assert.equal(record.artifact.id,11286278764);
assert.equal(record.artifact.name,'glaze-v1.7-v1.2-rendered-regression-37157473094');
assert.equal(record.artifact.sizeBytes,3486665);
assert.equal(record.artifact.digest,'sha256:cb55b581668f6007b9ed56d53fca3a318ae773639f6a9e7620b22a4cf4d2e2e5');
assert.equal(record.artifact.createdAt,'2026-10-03T22:11:13Z');
assert.equal(record.artifact.expiresAt,'2027-01-01T22:09:26Z');
assert.equal(record.artifact.expiredAtObservation,false);
assert.equal(record.artifact.sceneCount,22);
assert.equal(record.artifact.pixelTolerance,0);
assert.ok(Date.parse(record.artifact.expiresAt)>Date.parse(record.qualificationRun.observedAt));

assert.equal(record.comparison.kind,plan.comparison.kind);
assert.equal(record.comparison.priorRenderedEvidenceRunId,37144536213);
assert.equal(record.comparison.priorRenderedEvidenceArtifactId,11281038583);
assert.equal(record.comparison.priorRenderedEvidenceArtifactDigest,'sha256:9b862d7da7d5aaf389507f9005edcdf141095593c8c4b30c26ff354e46da5018');
assert.equal(record.comparison.semanticBaselineMatched,true);
assert.equal(record.comparison.freshVisualRepeatabilityMatched,true);
assert.equal(record.comparison.freshCaptureCount,2);
assert.equal(record.comparison.pixelTolerance,0);
assert.equal(record.comparison.regressionResultSha256,'f7b3c120dc04200954ea5b8db947d364b9ec2ebaa78f2346aeea6775fa9b5f2c');
assert.equal(record.comparison.regressionEvidenceSha256,'671b1bef2ca668c5c0878370b3bc6866e47b92fd53c4ee80f80cbfe2e551d0ea');

assert.equal(record.regressionEvidence.length,1);
const regressionEvidence=record.regressionEvidence[0];
assert.deepEqual(regressionEvidence,{
  id:'regression',verified:true,revision:SOURCE,evidenceType:'rendered',
  reference:'evidence+sha256:f7b3c120dc04200954ea5b8db947d364b9ec2ebaa78f2346aeea6775fa9b5f2c:v1.7/v1.2-regression/regression-result.json'
});

const synthetic=[
  ...machinePlan.expectedMachineLaneIds.map(id=>({id,verified:true,revision:SOURCE,evidenceType:'machine',reference:'synthetic://machine/'+id})),
  ...renderedPlan.eligibleRenderedEvidenceLaneIds.map(id=>({id,verified:true,revision:SOURCE,evidenceType:'rendered',reference:'synthetic://rendered/'+id})),
  regressionEvidence,
  {id:'artifact-provenance',verified:true,revision:SOURCE,evidenceType:'provenance',reference:'synthetic://provenance'}
];
const matrix=createGlazeV17AcceptanceMatrix({exactRevision:SOURCE,evidence:synthetic});
const complete=matrix.lanes.filter(lane=>lane.status==='externally-verified').map(lane=>lane.id);
const partial=matrix.lanes.filter(lane=>lane.status==='unverified'&&lane.satisfiedEvidenceGroupCount>0).map(lane=>lane.id);
const untouched=matrix.lanes.filter(lane=>lane.status==='unverified'&&lane.satisfiedEvidenceGroupCount===0).map(lane=>lane.id);
assert.equal(matrix.externallyVerifiedCount,17);
assert.equal(matrix.unverifiedCount,20);
assert.equal(matrix.evidenceInventoryComplete,false);
assert.equal(matrix.readyForGovernedQualificationReview,false);
assert.deepEqual(sorted(complete),sorted(record.matrixDisposition.externallyVerifiedLaneIds));
assert.deepEqual(sorted(partial),sorted(record.matrixDisposition.partialLaneIds));
assert.deepEqual(sorted(untouched),sorted(record.matrixDisposition.untouchedLaneIds));
assert.equal(record.matrixDisposition.externallyVerifiedCount,17);
assert.equal(record.matrixDisposition.unverifiedCount,20);
assert.equal(record.matrixDisposition.notApplicableJustifiedCount,0);
assert.equal(record.matrixDisposition.evidenceInventoryComplete,false);
assert.equal(record.matrixDisposition.readyForGovernedQualificationReview,false);
const regression=matrix.lanes.find(lane=>lane.id==='regression');
assert.equal(regression.status,'externally-verified');
assert.equal(regression.satisfiedEvidenceGroupCount,2);

assert.equal(record.authority.renderedRegressionEvidenceClaimed,true);
assert.equal(record.authority.historicalSourceEvidenceOnly,true);
for(const key of ['governedReviewAcceptanceClaimed','section46CompleteClaimed','section48Accepted','v171AcceptanceClaimed','anchorStatusGranted','consumerEligibilityGranted','deploymentAcceptanceGranted','productionAcceptanceGranted','lifecyclePromotionAutomatic']){
  assert.equal(record.authority[key],false,key);
}
assert.match(record.boundary,/frozen historical dev\.47 source/i);
assert.match(record.boundary,/does not rebind evidence to a changed V1\.7\.1 candidate/i);
assert.ok(hardening.includes(String(record.qualificationRun.runId)),'hardening record must name the Regression qualification run');
assert.ok(hardening.includes(String(record.artifact.id)),'hardening record must name the Regression artifact');
assert.ok(hardening.includes('20 still-open retained v1.2 lanes'),'hardening record must state the 20-lane remainder');

console.log('Glaze V1.7.1 durable retained Regression evidence record: PASS');
console.log('Source revision: '+record.sourceRevision);
console.log('Tooling head / merge: '+record.tooling.toolingHeadRevision+' / '+record.tooling.mergeRevision);
console.log('Run / artifact: '+record.qualificationRun.runId+' / '+record.artifact.id);
console.log('Evidence-group-complete retained lanes: 17 / 37');
console.log('Still-open retained lanes: 20 / 37');
console.log('Lifecycle promotion automatic: false');
