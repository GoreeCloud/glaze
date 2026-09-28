import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGlazeV17AcceptanceMatrix,glazeV17AcceptanceDevelopmentContract} from '../js/glaze-v1.7-acceptance.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';
const root=new URL('../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),'utf8');
const json=path=>JSON.parse(read(path));
const contract=json('contracts/v1.7/acceptance.dev.json');
const schema=json('schemas/v1.7-acceptance.schema.json');
const tokens=json('tokens/glaze-v1.7-acceptance.dev.json');
const lifecycle=json('registry/lifecycle.json');
const version=read('VERSION').trim();
const plan=read('GLAZE_UI_V1_7_PLANNED.md');
const record=read('acceptance/v1.7-development.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const acceptanceWorkflow=read('.github/workflows/glaze-v1.7-acceptance-development.yml');

assert.equal(contract.version,'1.7.0-dev.39');
assert.equal(contract.lifecycle,'Development');
assert.equal(contract.consumerEligible,false);
assert.deepEqual(contract.v12SpecificationSections,[46]);
assert.equal(contract.qualification.laneCount,37);
assert.equal(contract.qualification.exactRevisionRequired,true);
assert.equal(contract.qualification.allEvidenceGroupsRequired,true);
assert.equal(contract.qualification.missingEvidenceMayInferPass,false);
assert.equal(contract.qualification.revisionMismatchMayPass,false);
assert.equal(contract.qualification.partialEvidenceGroupMayPass,false);
assert.equal(contract.qualification.automatedTestsAloneMayEstablishMotionAcceptance,false);
assert.equal(contract.qualification.matrixCompletionEqualsV17Acceptance,false);
assert.deepEqual(contract.conditionalApplicabilityLanes,['wearable','energy-behavior']);
assert.equal(contract.lanes.length,37);
assert.equal(Object.keys(contract.evidenceRequirements).length,37);
assert.equal(contract.authority.v17AcceptanceGranted,false);
assert.equal(contract.authority.lifecyclePromotionAutomatic,false);
assert.equal(contract.acceptanceBoundary.section46Complete,false);
assert.equal(schema.$schema,'https://json-schema.org/draft/2020-12/schema');
assert.equal(tokens.qualification.laneCount,37);
assert.equal(tokens.qualification.requiredLaneCount,35);
assert.equal(tokens.qualification.conditionalLaneCount,2);
assert.equal(tokens.authority.matrixCompletionEqualsV17Acceptance,false);
assert.equal(glazeV17AcceptanceDevelopmentContract.version,'1.7.0-dev.39');
assert.equal(glazeV17AcceptanceDevelopmentContract.laneCount,37);
assert.equal(glazeV17AcceptanceDevelopmentContract.section46Complete,false);
assert.equal(glazeV17AcceptanceDevelopmentContract.lifecyclePromotionAutomatic,false);
const workflowOccurrenceCount=needle=>acceptanceWorkflow.split(needle).length-1;
assert.equal(workflowOccurrenceCount('runs-on: ubuntu-24.04'),3,'all V1.7 acceptance jobs must use the explicit Ubuntu 24.04 runner');
assert.equal(workflowOccurrenceCount('persist-credentials: false'),3,'all V1.7 acceptance checkouts must disable persisted credentials');
assert.equal(workflowOccurrenceCount('test "$(git rev-parse HEAD)" = "$EXPECTED_SHA"'),3,'all V1.7 acceptance jobs must verify the exact checked-out revision');
assert.equal(workflowOccurrenceCount('actions/setup-node@820762786026740c76f36085b0efc47a31fe5020'),3,'all V1.7 acceptance jobs must use the approved immutable setup-node pin');
assert.equal(workflowOccurrenceCount("node-version: '22'"),3,'all V1.7 acceptance jobs must pin Node.js 22');
assert.equal(workflowOccurrenceCount('git diff --exit-code -- .'),3,'all V1.7 acceptance jobs must fail on tracked-source mutation');
assert(!acceptanceWorkflow.includes('ubuntu-latest'),'V1.7 acceptance workflow must not use a moving Ubuntu runner');
assert.equal(version,'1.6.0','VERSION must remain V1.6 Anchor');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'Development source must not create lifecycle candidate');

const empty=createGlazeV17AcceptanceMatrix({});
assert.equal(empty.laneCount,37);
assert.equal(empty.unverifiedCount,37);
assert.equal(empty.evidenceInventoryComplete,false);
assert.equal(empty.authority.v17AcceptanceEstablished,false);

const revision='c40075b75521189d0ea568d19460aceb20b55e80';
const wrongRevision='7bb56df9cd12d9193c03cda174608895aea4e38b';
const mismatch=createGlazeV17AcceptanceMatrix({exactRevision:revision,evidence:[{id:'task-continuity',verified:true,revision:wrongRevision,evidenceType:'machine',reference:'exact-source task continuity suite'}]});
assert.equal(mismatch.lanes.find(x=>x.id==='task-continuity').status,'unverified');
assert.equal(mismatch.lanes.find(x=>x.id==='task-continuity').failureReason,'evidence-revision-mismatch');

assert.throws(()=>createGlazeV17AcceptanceMatrix({exactRevision:revision,applicability:{'task-continuity':false},notApplicableJustifications:{'task-continuity':'Required qualification cannot be disabled.'}}),RangeError);

const conditional=createGlazeV17AcceptanceMatrix({
  exactRevision:revision,applicability:{wearable:false,'energy-behavior':false},
  notApplicableJustifications:{wearable:'No wearable target is claimed by this exact V1.7 qualification scope.','energy-behavior':'No separately applicable energy-behavior target is claimed by this exact qualification scope.'}
});
assert.equal(conditional.lanes.find(x=>x.id==='wearable').status,'not-applicable-justified');
assert.equal(conditional.lanes.find(x=>x.id==='energy-behavior').status,'not-applicable-justified');
assert.equal(conditional.evidenceInventoryComplete,false);

const motionMachineOnly=createGlazeV17AcceptanceMatrix({exactRevision:revision,evidence:[{id:'signature-motion',verified:true,revision,evidenceType:'machine',reference:'motion source suite'}]});
assert.equal(motionMachineOnly.lanes.find(x=>x.id==='signature-motion').status,'unverified');
assert.equal(motionMachineOnly.lanes.find(x=>x.id==='signature-motion').satisfiedEvidenceGroupCount,1);
const motionComplete=createGlazeV17AcceptanceMatrix({exactRevision:revision,evidence:[
  {id:'signature-motion',verified:true,revision,evidenceType:'machine',reference:'motion source suite'},
  {id:'signature-motion',verified:true,revision,evidenceType:'human',reference:'human motion review'}
]});
assert.equal(motionComplete.lanes.find(x=>x.id==='signature-motion').status,'externally-verified');

const fixtureEvidence=[];
let fixtureIndex=0;
for(const [id,groups] of Object.entries(contract.evidenceRequirements)){
  if(contract.conditionalApplicabilityLanes.includes(id))continue;
  for(const group of groups){
    fixtureIndex+=1;
    fixtureEvidence.push({id,verified:true,revision,evidenceType:group[0],reference:'fixture-'+fixtureIndex});
  }
}
const completeFixture=createGlazeV17AcceptanceMatrix({
  exactRevision:revision,evidence:fixtureEvidence,applicability:{wearable:false,'energy-behavior':false},
  notApplicableJustifications:{wearable:'No wearable target is claimed by this exact V1.7 qualification scope.','energy-behavior':'No separately applicable energy-behavior target is claimed by this exact qualification scope.'}
});
assert.equal(completeFixture.externallyVerifiedCount,35);
assert.equal(completeFixture.notApplicableJustifiedCount,2);
assert.equal(completeFixture.unverifiedCount,0);
assert.equal(completeFixture.evidenceInventoryComplete,true);
assert.equal(completeFixture.readyForGovernedQualificationReview,true);
assert.equal(completeFixture.authority.v17AcceptanceEstablished,false);
assert.equal(completeFixture.authority.lifecyclePromotionAutomatic,false);
assert.equal(completeFixture.authority.consumerEligibilityGranted,false);
assert.throws(()=>createGlazeV17AcceptanceMatrix({exactRevision:revision,overallAccepted:true}),RangeError);
assert.throws(()=>createGlazeV17AcceptanceMatrix({exactRevision:revision,evidence:[{id:'unknown-lane',verified:true,revision,evidenceType:'machine',reference:'bad'}]}),RangeError);

assert(plan.includes('Development source status — September 27, 2026: `1.7.0-dev.39`'),'planned upgrade authority missing dev.39 Section 46 status');
assert(record.includes('37 qualification dimensions')&&record.includes('ready for governed qualification review'),'acceptance development record missing core boundary');
assert(planned.includes('1.7.0-dev.39')&&planned.includes('Section 46'),'planned feature control missing dev.39');
assert(implemented.includes('V1.7 Acceptance Control')&&implemented.includes('1.7.0-dev.39'),'implemented feature control missing dev.39');
assert(changelog.includes('1.7.0-dev.39')&&changelog.includes('V1.7 Acceptance Control'),'changelog missing dev.39');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=39,'aggregate version regressed below dev.39');
assert(glazeV17Development.planV12FoundationSections.includes(46),'aggregate missing Section 46');
assert.equal(glazeV17Development.acceptanceFoundation,'js/glaze-v1.7-acceptance.dev.mjs');
assert.equal(glazeV17Development.providerTruthManufactured,false);
console.log('GLAZE UI V1.7 Acceptance Control Development validation: PASS');
console.log('Plan binding: v1.2 Section 46');
console.log('Qualification lanes: 37');
console.log('Required lanes: 35');
console.log('Conditional lanes: 2');
console.log('Automated tests alone establish motion acceptance: false');
console.log('Section 46 complete: false');
console.log('V1.7 acceptance established by source: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
