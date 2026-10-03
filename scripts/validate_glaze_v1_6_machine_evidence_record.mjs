#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createGlazeV16AcceptanceMatrix} from '../js/glaze-v1.6-acceptance.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(v,m)=>{if(!v)throw new Error(m);};

const record=json('acceptance/v1.6-machine-evidence.json');
const plan=json('contracts/v1.6/qualification.machine.plan.json');
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
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'machine evidence must not promote lifecycle');

assert(record.sourceRevision===plan.sourceRevision,'machine evidence source revision must match qualification plan');
assert(record.acceptanceModelVersion===plan.acceptanceModelVersion,'acceptance model version mismatch');
assert(record.stableBaseline==='1.5.1','machine evidence Stable baseline mismatch');
assert(record.qualificationRun.conclusion==='success','qualification run must be successful');
assert(Number.isInteger(record.qualificationRun.runId)&&record.qualificationRun.runId>0,'qualification run ID missing');
assert(Number.isInteger(record.qualificationRun.jobId)&&record.qualificationRun.jobId>0,'qualification job ID missing');
assert(record.validatorsPassed.length===12,'all planned validators must be recorded');

const expectedIds=[...plan.machineEvidenceLaneIds].sort();
const actualIds=record.machineEvidence.map(item=>item.id).sort();
assert(JSON.stringify(actualIds)===JSON.stringify(expectedIds),'machine evidence lane set mismatch');
assert(new Set(actualIds).size===20,'machine evidence lane IDs must be unique');

const expectedReference=`GitHub Actions run ${record.qualificationRun.runId} / job ${record.qualificationRun.jobId}`;
assert(record.qualificationRun.reference===expectedReference,'qualification reference format mismatch');
for(const item of record.machineEvidence){
  assert(item.verified===true,'machine evidence must be explicitly verified');
  assert(item.revision===record.sourceRevision,`machine evidence revision mismatch: ${item.id}`);
  assert(item.evidenceType==='machine',`non-machine evidence leaked into machine record: ${item.id}`);
  assert(item.reference===expectedReference,`machine evidence reference mismatch: ${item.id}`);
}

const matrix=createGlazeV16AcceptanceMatrix({
  exactRevision:record.sourceRevision,
  evidence:record.machineEvidence
});
const disposition=record.matrixDisposition;
const sort=v=>[...v].sort();

assert(matrix.verifiedCount===9&&matrix.unverifiedCount===15&&matrix.notApplicableCount===0,'machine matrix count mismatch');
assert(matrix.qualificationEvidenceComplete===false,'machine evidence must not complete qualification');
assert(matrix.readyForGovernedQualificationReview===false,'machine evidence must not become review-ready');
assert(JSON.stringify(sort(matrix.lanes.filter(x=>x.status==='verified').map(x=>x.id)))===JSON.stringify(sort(disposition.fullyVerifiedLaneIds)),'fully verified lane record mismatch');
assert(JSON.stringify(sort(matrix.lanes.filter(x=>x.status==='unverified'&&x.satisfiedEvidenceGroupCount>0).map(x=>x.id)))===JSON.stringify(sort(disposition.partialMachineLaneIds)),'partial machine lane record mismatch');
assert(JSON.stringify(sort(matrix.lanes.filter(x=>x.status==='unverified'&&x.satisfiedEvidenceGroupCount===0).map(x=>x.id)))===JSON.stringify(sort(disposition.untouchedLaneIds)),'untouched lane record mismatch');
assert(disposition.verifiedCount===9&&disposition.unverifiedCount===15&&disposition.qualificationEvidenceComplete===false,'recorded disposition mismatch');

for(const [key,value] of Object.entries(record.authority))assert(value===false,`authority boundary must remain false: ${key}`);
assert(acceptance.includes(record.sourceRevision),'durable acceptance record must name frozen source revision');
assert(acceptance.includes(String(record.qualificationRun.runId)),'durable acceptance record must name machine qualification run');
assert(acceptance.includes('9 fully verified'),'durable acceptance record must state machine-only verified count');
assert(acceptance.includes('15 remain unverified'),'durable acceptance record must state remaining count');

console.log('GLAZE UI V1.6 machine evidence record: PASS');
console.log(`Source revision: ${record.sourceRevision}`);
console.log(`Qualification run/job: ${record.qualificationRun.runId}/${record.qualificationRun.jobId}`);
console.log('Fully verified lanes: 9');
console.log('Unverified lanes: 15');
console.log('Qualification evidence complete: false');
console.log('Stable baseline preserved: 1.5.1');
