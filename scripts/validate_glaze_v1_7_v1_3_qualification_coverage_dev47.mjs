import assert from 'node:assert/strict';
import {
  createGlazeV17V13QualificationCoverageMatrix,
  V13_SECTION48_COVERAGE_LANES,
  glazeV17V13QualificationCoverageDevelopmentContract
} from '../js/glaze-v1.7-v1-3-qualification-coverage.dev.mjs';
import {glazeV17V13QualificationDevelopmentContract} from '../js/glaze-v1.7-v1-3-qualification.dev.mjs';

const revision='0123456789abcdef0123456789abcdef01234567';
const wrongRevision='1111111111111111111111111111111111111111';

assert.equal(glazeV17V13QualificationDevelopmentContract.version,'1.7.0-dev.46');
assert.equal(glazeV17V13QualificationDevelopmentContract.totalLaneCount,58);
assert.equal(glazeV17V13QualificationCoverageDevelopmentContract.version,'1.7.0-dev.47');
assert.equal(glazeV17V13QualificationCoverageDevelopmentContract.retainedCombinedLaneCount,58);
assert.equal(glazeV17V13QualificationCoverageDevelopmentContract.addedCoverageLaneCount,4);
assert.equal(glazeV17V13QualificationCoverageDevelopmentContract.totalLaneCount,62);
assert.equal(V13_SECTION48_COVERAGE_LANES.length,4);

const ids=V13_SECTION48_COVERAGE_LANES.map(lane=>lane.id);
assert.deepEqual(ids,[
  'expression-system-v13',
  'contextual-actions-v13',
  'brief-v13',
  'control-center-v13'
]);

const empty=createGlazeV17V13QualificationCoverageMatrix({exactRevision:revision});
assert.equal(empty.totalLaneCount,62);
assert.equal(empty.retainedCombinedQualification.laneCount,58);
assert.equal(empty.coverage.laneCount,4);
assert.equal(empty.coverage.unverifiedCount,4);
assert.equal(empty.evidenceInventoryComplete,false);
assert.equal(empty.readyForGovernedQualificationReview,false);
assert.equal(empty.authority.implicitSurfaceCoverageAccepted,false);
assert.equal(empty.authority.anchorStatusGranted,false);

const mismatch=createGlazeV17V13QualificationCoverageMatrix({
  exactRevision:revision,
  coverageEvidence:[{
    id:'contextual-actions-v13',
    verified:true,
    revision:wrongRevision,
    evidenceType:'rendered',
    reference:'wrong revision fixture'
  }]
});
assert.equal(mismatch.coverage.lanes.find(lane=>lane.id==='contextual-actions-v13').failureReason,'evidence-revision-mismatch');

const renderedOnly=createGlazeV17V13QualificationCoverageMatrix({
  exactRevision:revision,
  coverageEvidence:V13_SECTION48_COVERAGE_LANES.map(lane=>({
    id:lane.id,
    verified:true,
    revision,
    evidenceType:'rendered',
    reference:'rendered-only structural fixture'
  }))
});
for(const lane of renderedOnly.coverage.lanes){
  assert.equal(lane.status,'unverified');
  assert.equal(lane.satisfiedEvidenceGroupCount,1);
}
assert.equal(renderedOnly.readyForGovernedQualificationReview,false);
assert.equal(renderedOnly.authority.section48Accepted,false);
assert.equal(renderedOnly.authority.v17AcceptanceEstablished,false);

const completeCoverage=[];
for(const lane of V13_SECTION48_COVERAGE_LANES){
  for(const group of lane.evidenceGroups){
    completeCoverage.push({
      id:lane.id,
      verified:true,
      revision,
      evidenceType:group[0],
      reference:'structural fixture '+lane.id+' '+group[0]
    });
  }
}
const coverageComplete=createGlazeV17V13QualificationCoverageMatrix({
  exactRevision:revision,
  coverageEvidence:completeCoverage
});
assert.equal(coverageComplete.coverage.evidenceInventoryComplete,true);
assert.equal(coverageComplete.evidenceInventoryComplete,false);
assert.equal(coverageComplete.readyForGovernedQualificationReview,false);

assert.throws(()=>createGlazeV17V13QualificationCoverageMatrix({
  exactRevision:revision,
  coverageEvidence:[{
    id:'unknown-v13',
    verified:true,
    revision,
    evidenceType:'machine',
    reference:'unsupported'
  }]
}),RangeError);

console.log('Glaze V1.7 dev.47 qualification coverage validation: PASS');
console.log('Added explicit Section 48 coverage lanes: 4');
console.log('Combined V1.7 qualification lanes: 62');
console.log('Anchor authority granted: false');
