import assert from 'node:assert/strict';
import {
  createGlazeV17V13QualificationMatrix,
  V13_SECTION48_QUALIFICATION_LANES,
  glazeV17V13QualificationDevelopmentContract
} from '../js/glaze-v1.7-v1-3-qualification.dev.mjs';
import {glazeV17AcceptanceDevelopmentContract} from '../js/glaze-v1.7-acceptance.dev.mjs';
import {glazeV17Section48QualificationDevelopmentContract} from '../js/glaze-v1.7-section48-qualification.dev.mjs';

const revision='0123456789abcdef0123456789abcdef01234567';
assert.equal(glazeV17AcceptanceDevelopmentContract.laneCount,37);
assert.equal(glazeV17Section48QualificationDevelopmentContract.section48SourceComplete,true);
assert.equal(glazeV17V13QualificationDevelopmentContract.version,'1.7.0-dev.46');
assert.equal(glazeV17V13QualificationDevelopmentContract.totalLaneCount,58);
assert.equal(V13_SECTION48_QUALIFICATION_LANES.length,21);

const empty=createGlazeV17V13QualificationMatrix({exactRevision:revision});
assert.equal(empty.totalLaneCount,58);
assert.equal(empty.retainedV12.blockingLaneIds.length,37);
assert.equal(empty.section48.blockingLaneIds.length,21);
assert.equal(empty.readyForGovernedQualificationReview,false);
assert.equal(empty.authority.anchorStatusGranted,false);

const completeV12=[];
for(const lane of glazeV17AcceptanceDevelopmentContract.acceptanceLanes){
  for(const group of lane.evidenceGroups){
    completeV12.push({id:lane.id,verified:true,revision,evidenceType:group[0],reference:'structural '+lane.id+' '+group[0]});
  }
}
const completeV13=[];
for(const lane of V13_SECTION48_QUALIFICATION_LANES){
  for(const group of lane.evidenceGroups){
    completeV13.push({id:lane.id,verified:true,revision,evidenceType:group[0],reference:'structural '+lane.id+' '+group[0]});
  }
}
const complete=createGlazeV17V13QualificationMatrix({exactRevision:revision,v12Evidence:completeV12,section48Evidence:completeV13});
assert.equal(complete.evidenceInventoryComplete,true);
assert.equal(complete.readyForGovernedQualificationReview,true);
assert.equal(complete.authority.matrixCompletionEqualsV17Acceptance,false);
assert.equal(complete.authority.section48Accepted,false);
assert.equal(complete.authority.v17AcceptanceEstablished,false);
assert.equal(complete.authority.anchorStatusGranted,false);

assert.throws(()=>createGlazeV17V13QualificationMatrix({
  exactRevision:revision,
  section48Applicability:{'workspace-continuity-v13':false}
}),RangeError);

console.log('Glaze V1.7 dev.46 combined qualification validation: PASS');
console.log('58 qualification lanes evaluated; lifecycle promotion remains external.');
