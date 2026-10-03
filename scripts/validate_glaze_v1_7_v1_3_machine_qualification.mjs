import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {V13_SECTION48_QUALIFICATION_LANES} from '../js/glaze-v1.7-v1-3-qualification.dev.mjs';
import {V13_SECTION48_COVERAGE_LANES} from '../js/glaze-v1.7-v1-3-qualification-coverage.dev.mjs';

const root=new URL('../',import.meta.url);
const plan=JSON.parse(readFileSync(new URL('contracts/v1.7/qualification.v1.3.machine.plan.json',root),'utf8'));

assert.equal(plan.schemaVersion,1);
assert.equal(plan.planId,'goreecloud.glaze.v1.7.v1.3.machine-qualification');
assert.equal(plan.lifecycle,'DevelopmentQualification');
assert.equal(plan.sourceRevision,'4b9d085a5177b96cc31d4270b38d792a59872e37');
assert.equal(plan.acceptanceModelVersion,'1.7.0-dev.47');
assert.equal(plan.stableBaseline,'1.6.0');
assert.equal(plan.consumerEligible,false);
assert.equal(plan.networkPolicy,'repository-local-only');
assert.equal(plan.evidenceType,'machine');
assert.equal(plan.checks.length,7);
assert.equal(plan.expectedSection48MachineLaneIds.length,13);
assert.equal(plan.expectedCoverageMachineLaneIds.length,4);
assert.equal(plan.expectedMachineLaneIds.length,17);
assert.equal(new Set(plan.expectedMachineLaneIds).size,17);

const mapped=plan.checks.flatMap(check=>check.laneIds);
assert.deepEqual([...mapped].sort(),[...plan.expectedMachineLaneIds].sort());

const baseMap=new Map(V13_SECTION48_QUALIFICATION_LANES.map(lane=>[lane.id,lane]));
for(const id of plan.expectedSection48MachineLaneIds){
  const lane=baseMap.get(id);
  assert.ok(lane,'unknown dev.46 machine lane: '+id);
  assert.ok(lane.evidenceTypes.includes('machine'),'dev.46 lane does not accept machine evidence: '+id);
}
const coverageMap=new Map(V13_SECTION48_COVERAGE_LANES.map(lane=>[lane.id,lane]));
for(const id of plan.expectedCoverageMachineLaneIds){
  const lane=coverageMap.get(id);
  assert.ok(lane,'unknown dev.47 coverage lane: '+id);
  assert.ok(lane.evidenceTypes.includes('machine'),'dev.47 lane does not accept machine evidence: '+id);
}

for(const check of plan.checks){
  assert.match(check.id,/^[A-Za-z0-9_-]+$/);
  assert.match(check.command,/^node scripts\/validate_glaze_v1_7_[A-Za-z0-9_]+\.mjs$/);
  assert.equal(/[;&|<>]/.test(check.command),false);
}

assert.equal(plan.authority.machineEvidenceOnly,true);
for(const key of [
  'renderedEvidenceClaimed','humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed',
  'deviceEvidenceClaimed','providerIntegrationEvidenceClaimed',
  'privacySecurityIntegrationEvidenceClaimed','performanceEvidenceClaimed',
  'energyEvidenceClaimed','provenanceEvidenceClaimed','section48AcceptanceClaimed',
  'v17AcceptanceClaimed','anchorStatusGranted','lifecyclePromotionAutomatic'
]){
  assert.equal(plan.authority[key],false,key);
}

console.log('Glaze V1.7 v1.3 machine qualification plan validation: PASS');
console.log('Machine evidence lanes: 17 (13 dev.46 + 4 dev.47 coverage)');
