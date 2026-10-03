import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGlazeV17AcceptanceMatrix,glazeV17AcceptanceDevelopmentContract} from '../js/glaze-v1.7-acceptance.dev.mjs';
const plan=JSON.parse(readFileSync(new URL('../contracts/v1.7/qualification.v1.2.regression.plan.json',import.meta.url),'utf8'));
const SOURCE='4b9d085a5177b96cc31d4270b38d792a59872e37';
assert.equal(plan.schemaVersion,1);
assert.equal(plan.planId,'goreecloud.glaze.v1.7.v1.2.rendered-regression-qualification');
assert.equal(plan.lifecycle,'DevelopmentQualification');
assert.equal(plan.sourceRevision,SOURCE);
assert.equal(plan.sourceModelVersion,'1.7.0-dev.47');
assert.equal(plan.acceptanceModelVersion,'1.7.0-dev.39');
assert.equal(plan.stableBaseline,'1.6.0');
assert.equal(plan.laneId,'regression');
assert.equal(plan.priorRenderedEvidence.runId,37144536213);
assert.equal(plan.priorRenderedEvidence.artifactId,11281038583);
assert.equal(plan.priorRenderedEvidence.artifactDigest,'sha256:9b862d7da7d5aaf389507f9005edcdf141095593c8c4b30c26ff354e46da5018');
assert.equal(plan.priorRenderedEvidence.pixelBaselineClaimed,false);
assert.equal(plan.comparison.kind,'semantic-baseline-plus-double-render-pixel-sha256-exact');
assert.equal(plan.comparison.pixelTolerance,0);
assert.equal(plan.comparison.freshRasterNormalization.fontRenderHinting,'none');
assert.equal(plan.comparison.freshRasterNormalization.lcdTextDisabled,true);
assert.equal(plan.sceneCount,22);
assert.equal(new Set(plan.sceneIds).size,22);
const lane=glazeV17AcceptanceDevelopmentContract.acceptanceLanes.find(x=>x.id==='regression');
assert.ok(lane);
assert.deepEqual(lane.evidenceGroups,[['machine'],['rendered']]);
const matrix=createGlazeV17AcceptanceMatrix({exactRevision:SOURCE,evidence:[
{id:'regression',verified:true,revision:SOURCE,evidenceType:'machine',reference:'synthetic://machine'},
{id:'regression',verified:true,revision:SOURCE,evidenceType:'rendered',reference:'synthetic://rendered'}
]});
const regression=matrix.lanes.find(x=>x.id==='regression');
assert.equal(regression.status,'externally-verified');
assert.equal(regression.satisfiedEvidenceGroupCount,2);
assert.equal(matrix.evidenceInventoryComplete,false);
assert.equal(matrix.readyForGovernedQualificationReview,false);
for(const key of ['humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed','physicalDeviceEvidenceClaimed','nativePlatformEvidenceClaimed','representativePerformanceEvidenceClaimed','energyEvidenceClaimed','governedReviewAcceptanceClaimed','section46CompleteClaimed','v17AcceptanceClaimed','anchorStatusGranted','consumerEligibilityGranted','deploymentAcceptanceGranted','productionAcceptanceGranted','lifecyclePromotionAutomatic']) assert.equal(plan.evidenceBoundary[key],false,key);
console.log('Glaze V1.7 retained-v1.2 rendered regression plan validation: PASS');
console.log('Lane: regression; evidence group closed by this tranche: rendered only');
