import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  createGlazeV17AcceptanceMatrix,
  glazeV17AcceptanceDevelopmentContract
} from '../js/glaze-v1.7-acceptance.dev.mjs';

const root=new URL('../',import.meta.url);
const plan=JSON.parse(readFileSync(new URL('contracts/v1.7/qualification.v1.2.machine.plan.json',root),'utf8'));

assert.equal(plan.schemaVersion,1);
assert.equal(plan.planId,'goreecloud.glaze.v1.7.v1.2.machine-qualification');
assert.equal(plan.lifecycle,'DevelopmentQualification');
assert.equal(plan.sourceRevision,'4b9d085a5177b96cc31d4270b38d792a59872e37');
assert.equal(plan.sourceModelVersion,'1.7.0-dev.47');
assert.equal(plan.acceptanceModelVersion,'1.7.0-dev.39');
assert.equal(plan.stableBaseline,'1.6.0');
assert.equal(plan.consumerEligible,false);
assert.equal(plan.networkPolicy,'repository-local-only');
assert.equal(plan.evidenceType,'machine');

assert.equal(glazeV17AcceptanceDevelopmentContract.version,'1.7.0-dev.39');
assert.equal(glazeV17AcceptanceDevelopmentContract.planVersion,'v1.2');
assert.equal(glazeV17AcceptanceDevelopmentContract.laneCount,37);
assert.equal(glazeV17AcceptanceDevelopmentContract.consumerEligible,false);

const machineLaneIds=glazeV17AcceptanceDevelopmentContract.acceptanceLanes
  .filter(lane=>lane.evidenceTypes.includes('machine'))
  .map(lane=>lane.id)
  .sort();
assert.equal(machineLaneIds.length,20);
assert.deepEqual([...plan.expectedMachineLaneIds].sort(),machineLaneIds);
assert.equal(new Set(plan.expectedMachineLaneIds).size,20);

const mapped=plan.checks.flatMap(check=>check.laneIds);
assert.equal(mapped.length,20);
assert.equal(new Set(mapped).size,20);
assert.deepEqual([...mapped].sort(),machineLaneIds);

const laneMap=new Map(glazeV17AcceptanceDevelopmentContract.acceptanceLanes.map(lane=>[lane.id,lane]));
for(const id of plan.expectedMachineLaneIds){
  const lane=laneMap.get(id);
  assert.ok(lane,'unknown v1.2 machine lane: '+id);
  assert.ok(lane.evidenceTypes.includes('machine'),'lane does not accept machine evidence: '+id);
  assert.ok(lane.evidenceGroups.some(group=>group.includes('machine')),'lane has no machine evidence group: '+id);
}

for(const check of plan.checks){
  assert.match(check.id,/^[A-Za-z0-9_-]+$/);
  const nodeOk=/^node scripts\/validate_glaze_v1_7_[A-Za-z0-9_]+\.mjs$/.test(check.command);
  const pythonOk=[
    'python scripts/validate_glaze_v1_3_accessibility.py',
    'python scripts/validate_glaze_v1.py'
  ].includes(check.command);
  assert.ok(nodeOk||pythonOk,'unsupported check command: '+check.command);
  assert.equal(/[;&|<>]/.test(check.command),false);
}

assert.equal(plan.authority.machineEvidenceOnly,true);
assert.equal(plan.authority.machineEvidenceCompletesAnyLane,false);
for(const key of [
  'renderedEvidenceClaimed','humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed',
  'deviceEvidenceClaimed','performanceEvidenceClaimed','energyEvidenceClaimed',
  'provenanceEvidenceClaimed','v12QualificationClaimed','section46CompleteClaimed',
  'v17AcceptanceClaimed','anchorStatusGranted','consumerEligibilityGranted',
  'deploymentAcceptanceGranted','productionAcceptanceGranted','lifecyclePromotionAutomatic'
]){
  assert.equal(plan.authority[key],false,key);
}

const args=process.argv.slice(2);
if(args.length>1)throw new Error('at most one machine evidence file may be supplied');
if(args.length===1){
  const evidence=JSON.parse(readFileSync(args[0],'utf8'));
  assert.ok(Array.isArray(evidence));
  assert.equal(evidence.length,20);
  assert.deepEqual(evidence.map(item=>item.id).sort(),machineLaneIds);
  for(const item of evidence){
    assert.equal(item.verified,true);
    assert.equal(item.revision,plan.sourceRevision);
    assert.equal(item.evidenceType,'machine');
    assert.match(item.reference,/^evidence\+sha256:[0-9a-f]{64}:v1\.7\/v1\.2-machine\/[A-Za-z0-9_-]+\.log$/);
  }

  const matrix=createGlazeV17AcceptanceMatrix({
    exactRevision:plan.sourceRevision,
    evidence
  });
  assert.equal(matrix.laneCount,37);
  assert.equal(matrix.externallyVerifiedCount,0);
  assert.equal(matrix.notApplicableJustifiedCount,0);
  assert.equal(matrix.unverifiedCount,37);
  assert.equal(matrix.evidenceInventoryComplete,false);
  assert.equal(matrix.readyForGovernedQualificationReview,false);

  for(const lane of matrix.lanes){
    if(machineLaneIds.includes(lane.id)){
      assert.equal(lane.satisfiedEvidenceGroupCount,1,'machine group should be satisfied only for '+lane.id);
      assert.equal(lane.status,'unverified','machine-only evidence must not fully verify '+lane.id);
      assert.equal(lane.failureReason,'required-evidence-group-unsatisfied');
    }else{
      assert.equal(lane.satisfiedEvidenceGroupCount,0,'non-machine lane unexpectedly received evidence: '+lane.id);
      assert.equal(lane.status,'unverified');
    }
  }
  assert.equal(matrix.authority.v17AcceptanceEstablished,false);
  assert.equal(matrix.authority.stableStatusGranted,false);
}

console.log('Glaze V1.7 retained-v1.2 machine qualification plan validation: PASS');
console.log('Machine-eligible evidence groups: 20 / 37 lanes');
console.log('Full lanes established by machine-only evidence: 0');
console.log('Boundary: remaining rendered/human/device/AT/performance/energy/provenance groups stay blocking.');
