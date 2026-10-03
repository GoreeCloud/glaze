import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createGlazeV17V13QualificationMatrix,
  glazeV17Section48QualificationDevelopmentContract
} from '../js/glaze-v1.7-section48-qualification.dev.mjs';
import {glazeV17AcceptanceDevelopmentContract} from '../js/glaze-v1.7-acceptance.dev.mjs';
import {glazeV17V13Development} from '../js/glaze-v1.7-development-v1-3.dev.mjs';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const json=p=>JSON.parse(read(p));
const contract=json('docs/v1.7/section48-qualification-dev43.contract.json');
const template=json('acceptance/v1.7-v1.3-qualification-evidence.template.json');
const record=read('acceptance/v1.7-v1.3-development.md');
const lifecycle=json('registry/lifecycle.json');
const version=read('VERSION').trim();
const workflow=read('.github/workflows/glaze-v1.7-section48-qualification-development.yml');

assert.equal(contract.version,'1.7.0-dev.43');
assert.equal(contract.section48LaneCount,21);
assert.equal(contract.totalLaneCount,58);
assert.equal(contract.retainedV12AcceptanceVersion,'1.7.0-dev.39');
assert.equal(contract.adaptiveExperienceSurfacesVersion,'1.7.0-dev.42');
assert.equal(contract.section48SourceScopeImplemented,true);
assert.equal(contract.section48QualificationControlImplemented,true);
assert.equal(contract.section48Complete,false);
assert.equal(glazeV17Section48QualificationDevelopmentContract.version,'1.7.0-dev.43');
assert.equal(glazeV17Section48QualificationDevelopmentContract.section48LaneCount,21);
assert.equal(glazeV17Section48QualificationDevelopmentContract.totalLaneCount,58);
assert.equal(glazeV17Section48QualificationDevelopmentContract.lifecyclePromotionAutomatic,false);

const empty=createGlazeV17V13QualificationMatrix({});
assert.equal(empty.totalLaneCount,58);
assert.equal(empty.evidenceInventoryComplete,false);
assert.equal(empty.readyForGovernedQualificationReview,false);
assert.equal(empty.authority.anchorStatusGranted,false);
assert.equal(empty.authority.section48Complete,false);

const revision='a'.repeat(40);
const wrong='b'.repeat(40);
const mismatch=createGlazeV17V13QualificationMatrix({
  exactRevision:revision,
  section48Evidence:[{id:'workspace-continuity-v13',verified:true,revision:wrong,evidenceType:'machine',reference:'workspace-machine'}]
});
assert.equal(mismatch.section48.lanes.find(x=>x.id==='workspace-continuity-v13').failureReason,'evidence-revision-mismatch');
assert.throws(()=>createGlazeV17V13QualificationMatrix({
  exactRevision:revision,section48Applicability:{'workspace-continuity-v13':false},
  section48NotApplicableJustifications:{'workspace-continuity-v13':'Required workspace lane cannot be disabled.'}
}),RangeError);

const v12Applicability={};
const v12NotApplicableJustifications={};
for(const id of glazeV17AcceptanceDevelopmentContract.conditionalApplicabilityLanes){
  v12Applicability[id]=false;
  v12NotApplicableJustifications[id]='This synthetic validator fixture does not claim the conditional '+id+' target.';
}
const v12Evidence=[];
for(const lane of glazeV17AcceptanceDevelopmentContract.acceptanceLanes){
  if(glazeV17AcceptanceDevelopmentContract.conditionalApplicabilityLanes.includes(lane.id))continue;
  for(const group of lane.evidenceGroups){
    v12Evidence.push({id:lane.id,verified:true,revision,evidenceType:group[0],reference:'v12/'+lane.id+'/'+group[0]});
  }
}
const section48Applicability={'energy-v13':false};
const section48NotApplicableJustifications={
  'energy-v13':'This synthetic validator fixture does not claim a separately applicable Section 48 energy target.'
};
const section48Evidence=[];
for(const lane of glazeV17Section48QualificationDevelopmentContract.section48Lanes){
  if(lane.id==='energy-v13')continue;
  for(const group of lane.evidenceGroups){
    section48Evidence.push({id:lane.id,verified:true,revision,evidenceType:group[0],reference:'v13/'+lane.id+'/'+group[0]});
  }
}
const complete=createGlazeV17V13QualificationMatrix({
  exactRevision:revision,v12Evidence,v12Applicability,v12NotApplicableJustifications,
  section48Evidence,section48Applicability,section48NotApplicableJustifications
});
assert.equal(complete.totalLaneCount,58);
assert.equal(complete.evidenceInventoryComplete,true);
assert.equal(complete.readyForGovernedQualificationReview,true);
assert.equal(complete.blockingLaneIds.length,0);
assert.equal(complete.authority.matrixCompletionEqualsSection48Acceptance,false);
assert.equal(complete.authority.matrixCompletionEqualsV17Acceptance,false);
assert.equal(complete.authority.anchorStatusGranted,false);
assert.equal(complete.authority.lifecyclePromotionAutomatic,false);

const partial=createGlazeV17V13QualificationMatrix({
  exactRevision:revision,v12Evidence,v12Applicability,v12NotApplicableJustifications,
  section48Evidence:section48Evidence.filter(x=>!(x.id==='human-visual-v13')),
  section48Applicability,section48NotApplicableJustifications
});
assert(partial.blockingLaneIds.includes('v1.3:human-visual-v13'));
assert.equal(partial.readyForGovernedQualificationReview,false);

assert.equal(template.version,'1.7.0-dev.43');
assert.equal(template.sourceRevision,null);
assert.equal(template.section48Evidence.length,0);
assert.equal(template.review.representativeRevisionConfirmed,false);
assert.equal(template.reviewDecision,'not-accepted');
assert(record.includes('58 lanes'));
assert(record.includes('ready for governed qualification review'));
assert(record.includes('does not establish'));

assert.equal(glazeV17V13Development.version,'1.7.0-dev.43');
assert.equal(glazeV17V13Development.section48QualificationControlVersion,'1.7.0-dev.43');
assert.equal(glazeV17V13Development.section48Complete,false);

const count=needle=>workflow.split(needle).length-1;
assert.equal(count('runs-on: ubuntu-24.04'),3);
assert.equal(count('persist-credentials: false'),3);
assert.equal(count('test "$(git rev-parse HEAD)" = "$EXPECTED_SHA"'),3);
assert(!workflow.includes('ubuntu-latest'));

assert.equal(version,'1.6.0');
assert.equal(lifecycle.currentOfficial,'1.6.0');
assert.equal(lifecycle.currentStable,'1.6.0');
assert.equal(lifecycle.currentLifecycle,'anchor');
assert.equal(lifecycle.activeCandidate,null);
assert.equal(lifecycle.plannedNext,null);

console.log('Glaze V1.7 dev.43 Section 48 qualification control: PASS');
console.log('Combined qualification lanes: 58');
console.log('Section 48 source scope implemented: true');
console.log('Section 48 accepted: false');
console.log('Official Anchor preserved: 1.6.0');
