import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const plan=JSON.parse(readFileSync(new URL('contracts/v1.7/qualification.v1.3.machine.plan.json',root),'utf8'));

assert.equal(plan.schemaVersion,1);
assert.equal(plan.planId,'goreecloud.glaze.v1.7.v1.3.machine-qualification');
assert.equal(plan.lifecycle,'DevelopmentQualification');
assert.equal(plan.sourceRevision,'e165007292878fd268298055c39b2f4a36a33ecf');
assert.equal(plan.acceptanceModelVersion,'1.7.0-dev.46');
assert.equal(plan.stableBaseline,'1.6.0');
assert.equal(plan.consumerEligible,false);
assert.equal(plan.networkPolicy,'repository-local-only');
assert.equal(plan.evidenceType,'machine');
assert.equal(plan.checks.length,5);
assert.equal(plan.expectedMachineLaneIds.length,13);
assert.equal(new Set(plan.expectedMachineLaneIds).size,13);

const mapped=plan.checks.flatMap(check=>check.laneIds);
assert.deepEqual([...mapped].sort(),[...plan.expectedMachineLaneIds].sort());
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
console.log('Machine evidence lanes: 13');
