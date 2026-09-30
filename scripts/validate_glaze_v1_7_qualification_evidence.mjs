#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {throws as assertThrows} from 'node:assert/strict';

import {createGlazeV17AcceptanceMatrix} from '../js/glaze-v1.7-acceptance.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.isAbsolute(rel)?rel:path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const contract=json('contracts/v1.7/acceptance.dev.json');
const template=json('acceptance/v1.7-qualification-evidence.template.json');
const evidenceSchema=json('schemas/v1.7-qualification-evidence.schema.json');
const laneIds=new Set(contract.lanes.map(x=>x.id));
const conditionalIds=new Set(contract.conditionalApplicabilityLanes);
const requirements=new Map(Object.entries(contract.evidenceRequirements));
const evidenceTypes=new Set(contract.evidenceTypes);
const AUTHORITY_FALSE_KEYS=[
  'packetIsV17Acceptance','section46Complete','lifecyclePromotionAutomatic','anchorStatusGranted',
  'consumerEligibilityGranted','deploymentAcceptanceGranted','productionAcceptanceGranted'
];
const EVIDENCE_REFERENCE=/^evidence\+sha256:([0-9a-f]{64}):(.{1,700})$/;
const EVIDENCE_LOCATOR=/^(?:[A-Za-z0-9._-][A-Za-z0-9._/-]*|[A-Za-z0-9._-]+:[A-Za-z0-9._-][A-Za-z0-9._/-]*)$/;

function assert(value,message){if(!value)throw new Error(message);}
function plainObject(value){
  if(value===null||typeof value!=='object'||Array.isArray(value))return false;
  const proto=Object.getPrototypeOf(value);
  return proto===Object.prototype||proto===null;
}
function placeholder(value){
  return typeof value==='string'&&(value.startsWith('REPLACE_WITH_')||value.includes('Template placeholder'));
}
function usable(value){return typeof value==='string'&&value.trim().length>0&&!placeholder(value);}
function evidenceReference(value,name){
  assert(usable(value)&&value.length<=800,name+' must be a bounded evidence reference');
  const match=EVIDENCE_REFERENCE.exec(value);
  const locator=match?.[2];
  assert(
    match&&EVIDENCE_LOCATOR.test(locator)&&!locator.startsWith('/')&&!locator.endsWith('/')&&
    locator.split(':').length<=2&&!locator.split('/').some(segment=>!segment||segment==='.'||segment==='..'),
    name+' must be a content-addressed evidence+sha256 reference with a credential-safe logical locator'
  );
  return value;
}
function timestamp(value,name){
  assert(usable(value)&&value.length<=40&&/(?:Z|[+-]\d{2}:\d{2})$/.test(value),name+' must be a timezone-qualified timestamp');
  const milliseconds=Date.parse(value);
  assert(Number.isFinite(milliseconds),name+' must be a valid timestamp');
  return milliseconds;
}
function revision(value){return typeof value==='string'&&/^[0-9a-f]{40}$/.test(value);}
function allowedEvidenceType(id,type){
  const groups=requirements.get(id)||[];
  return groups.some(group=>group.includes(type));
}
function clone(value){return JSON.parse(JSON.stringify(value));}

export function validateGlazeV17QualificationPacket(record,{allowTemplate=false}={}){
  assert(plainObject(record),'qualification packet must be a plain object');
  assert(record.recordId==='goreecloud.glaze-ui.v1.7.qualification-evidence','recordId mismatch');
  assert(record.lifecycle==='DevelopmentQualification','packet lifecycle mismatch');
  assert(record.acceptanceModelVersion==='1.7.0-dev.39','acceptance model mismatch');
  assert(record.stableBaseline==='1.6.0','Stable baseline mismatch');
  assert(plainObject(record.authority),'packet authority block missing');
  for(const key of AUTHORITY_FALSE_KEYS)assert(record.authority[key]===false,'packet must not grant authority: '+key);

  const isTemplate=record.reviewDecision==='not-accepted';
  assert(
    revision(record.sourceRevision)||(allowTemplate&&isTemplate&&record.sourceRevision==='REPLACE_WITH_FROZEN_V17_SOURCE_REVISION'),
    'packet sourceRevision must identify the frozen exact V1.7 source revision'
  );

  const applicability=plainObject(record.applicability)?record.applicability:{};
  const justifications=plainObject(record.notApplicableJustifications)?record.notApplicableJustifications:{};
  for(const [id,value] of Object.entries(applicability)){
    assert(conditionalIds.has(id),'only conditional V1.7 lanes may override applicability: '+id);
    assert(value===true||value===false,'applicability must be boolean: '+id);
    if(value===false){
      assert(typeof justifications[id]==='string'&&justifications[id].trim().length>=20,'not-applicable lane requires a specific justification: '+id);
    }
  }
  for(const id of Object.keys(justifications))assert(conditionalIds.has(id),'unknown not-applicable justification lane: '+id);

  assert(Array.isArray(record.evidence)&&record.evidence.length<=2000,'packet evidence must be a bounded array');
  const coreEvidence=[];
  const verifiedObservationTimes=[];
  for(const item of record.evidence){
    assert(plainObject(item),'each evidence item must be a plain object');
    assert(laneIds.has(item.id),'unknown V1.7 qualification lane: '+item.id);
    assert(evidenceTypes.has(item.evidenceType),'unsupported V1.7 evidence type: '+item.evidenceType);
    assert(allowedEvidenceType(item.id,item.evidenceType),'evidence type is not allowed for lane '+item.id+': '+item.evidenceType);
    assert(item.verified===true||item.verified===false,'evidence verified flag must be boolean');
    if(item.verified===true){
      assert(revision(record.sourceRevision),'verified evidence requires a frozen exact source revision');
      assert(item.revision===record.sourceRevision,'verified evidence revision mismatch for lane '+item.id);
      evidenceReference(item.reference,'verified evidence reference for lane '+item.id);
      const observedAt=timestamp(item.observedAt,'verified evidence observedAt for lane '+item.id);
      for(const key of ['finding','reviewer'])assert(usable(item[key]),'verified evidence missing '+key+' for lane '+item.id);
      verifiedObservationTimes.push({id:item.id,observedAt});
    }
    coreEvidence.push({
      id:item.id,verified:item.verified===true,revision:item.revision,evidenceType:item.evidenceType,reference:item.reference
    });
  }

  assert(plainObject(record.review),'packet review metadata missing');
  if(record.reviewDecision==='accepted-for-governed-qualification-review'){
    assert(revision(record.sourceRevision),'accepted intake requires an exact source revision');
    assert(record.review.representativeRevisionConfirmed===true,'accepted intake requires representative exact-revision confirmation');
    const reviewedAt=timestamp(record.review.reviewedAt,'accepted intake reviewedAt');
    for(const key of ['reviewer','reviewerRole','scope','notes'])assert(usable(record.review[key]),'accepted intake review metadata missing: '+key);
    for(const observation of verifiedObservationTimes){
      assert(observation.observedAt<=reviewedAt,'verified evidence observation cannot postdate packet review for lane '+observation.id);
    }
  }else{
    assert(record.reviewDecision==='not-accepted','unsupported qualification packet review decision');
    assert(record.review.representativeRevisionConfirmed===false,'not-accepted packet must not claim representative revision confirmation');
    if(!allowTemplate)assert(record.evidence.every(x=>x.verified!==true),'not-accepted packet must not contain verified evidence');
  }

  const exactRevision=revision(record.sourceRevision)?record.sourceRevision:null;
  const matrix=createGlazeV17AcceptanceMatrix({
    exactRevision,
    evidence:coreEvidence,
    applicability,
    notApplicableJustifications:justifications
  });
  const packetAcceptedForIntake=record.reviewDecision==='accepted-for-governed-qualification-review';
  const blockingLanes=Object.freeze(matrix.lanes
    .filter(lane=>!['externally-verified','not-applicable-justified'].includes(lane.status))
    .map(lane=>Object.freeze({
      id:lane.id,
      label:lane.label,
      status:lane.status,
      failureReason:lane.failureReason,
      requiredEvidenceGroups:Object.freeze(
        lane.requiredEvidenceGroups.map(group=>Object.freeze([...group]))
      ),
      missingEvidenceGroups:Object.freeze(
        (lane.evidenceGroupResults||[])
          .filter(group=>!group.satisfied)
          .map(group=>Object.freeze([...group.allowedEvidenceTypes]))
      )
    })));
  return Object.freeze({
    recordId:record.recordId,
    sourceRevision:exactRevision,
    packetAcceptedForIntake,
    laneCount:matrix.laneCount,
    externallyVerifiedCount:matrix.externallyVerifiedCount,
    notApplicableJustifiedCount:matrix.notApplicableJustifiedCount,
    unverifiedCount:matrix.unverifiedCount,
    blockingLaneIds:matrix.blockingLaneIds,
    blockingLanes,
    evidenceInventoryComplete:matrix.evidenceInventoryComplete,
    readyForGovernedQualificationReview:packetAcceptedForIntake&&matrix.readyForGovernedQualificationReview,
    authority:Object.freeze({
      packetIsV17Acceptance:false,
      section46Complete:false,
      lifecyclePromotionAutomatic:false,
      anchorStatusGranted:false,
      consumerEligibilityGranted:false,
      deploymentAcceptanceGranted:false,
      productionAcceptanceGranted:false
    })
  });
}

const templateResult=validateGlazeV17QualificationPacket(template,{allowTemplate:true});
assert(templateResult.unverifiedCount===37,'template must leave all 37 lanes unverified');
assert(templateResult.blockingLanes.length===37,'template gap report must enumerate all 37 blocking lanes');
const templateTaskContinuity=templateResult.blockingLanes.find(lane=>lane.id==='task-continuity');
assert(templateTaskContinuity?.failureReason==='matrix-exact-revision-missing','template gap report must retain exact-revision failure');
assert(
  JSON.stringify(templateTaskContinuity?.missingEvidenceGroups)===JSON.stringify([['machine'],['rendered','human']]),
  'template gap report must expose missing task-continuity evidence groups'
);
assert(templateResult.readyForGovernedQualificationReview===false,'template must not be qualification-review-ready');
assert(template.evidence.length===0,'template must not manufacture evidence');

const exact='a'.repeat(40);
const fixture=clone(template);
fixture.sourceRevision=exact;
fixture.applicability={wearable:false,'energy-behavior':false};
fixture.notApplicableJustifications={
  wearable:'No wearable target is claimed by this exact qualification scope.',
  'energy-behavior':'No separately applicable energy target is claimed by this exact qualification scope.'
};
fixture.review={
  reviewedAt:'2026-09-28T09:00:00-05:00',
  reviewer:'Qualification reviewer fixture',
  reviewerRole:'Independent qualification reviewer fixture',
  scope:'Self-test fixture for all required evidence groups',
  representativeRevisionConfirmed:true,
  notes:'Synthetic validator self-test only; not committed qualification evidence.'
};
fixture.evidence=[];
let index=0;
for(const [id,groups] of Object.entries(contract.evidenceRequirements)){
  if(conditionalIds.has(id))continue;
  for(const group of groups){
    index+=1;
    fixture.evidence.push({
      id,verified:true,revision:exact,evidenceType:group[0],
      reference:'evidence+sha256:'+index.toString(16).padStart(64,'0')+':v1.7/'+id+'/'+index,
      finding:'Synthetic validator self-test observation for '+id+'.',
      observedAt:'2026-09-28T09:00:00-05:00',
      reviewer:'Qualification reviewer fixture'
    });
  }
}
fixture.reviewDecision='accepted-for-governed-qualification-review';
const complete=validateGlazeV17QualificationPacket(fixture);
assert(complete.externallyVerifiedCount===35,'self-test must verify all 35 required lanes');
assert(complete.notApplicableJustifiedCount===2,'self-test must justify both conditional lanes');
assert(complete.unverifiedCount===0&&complete.evidenceInventoryComplete===true,'self-test complete matrix mismatch');
assert(complete.blockingLanes.length===0,'complete reviewed fixture must have no qualification gaps');
assert(complete.readyForGovernedQualificationReview===true,'complete reviewed fixture must be review-ready');
assert(complete.authority.packetIsV17Acceptance===false&&complete.authority.anchorStatusGranted===false,'complete packet must remain non-authorizing');

const partial=clone(fixture);
partial.evidence=partial.evidence.filter(item=>!(item.id==='task-continuity'&&item.evidenceType==='rendered'));
partial.reviewDecision='accepted-for-governed-qualification-review';
const partialResult=validateGlazeV17QualificationPacket(partial);
const partialTaskContinuity=partialResult.blockingLanes.find(lane=>lane.id==='task-continuity');
assert(partialTaskContinuity?.failureReason==='required-evidence-group-unsatisfied','partial packet must identify unsatisfied evidence group');
assert(
  JSON.stringify(partialTaskContinuity?.missingEvidenceGroups)===JSON.stringify([['rendered','human']]),
  'partial packet must report only the missing task-continuity evidence group'
);
assert(partialResult.readyForGovernedQualificationReview===false,'partial packet must remain blocked');

const wrongRevision=clone(fixture);
wrongRevision.evidence[0].revision='b'.repeat(40);
assertThrows(()=>validateGlazeV17QualificationPacket(wrongRevision),/revision mismatch/);

const wrongType=clone(fixture);
wrongType.evidence[0].evidenceType='energy';
assertThrows(()=>validateGlazeV17QualificationPacket(wrongType),/not allowed/);

const schemaEvidencePattern=new RegExp(evidenceSchema.properties.evidence.items.properties.reference.pattern);
const safeSchemaReference='evidence+sha256:'+('e'.repeat(64))+':v1.7/schema-parity/reference.json';
evidenceReference(safeSchemaReference,'schema parity reference');
assert(schemaEvidencePattern.test(safeSchemaReference),'qualification evidence schema must accept the same canonical evidence+sha256 reference as the runtime validator');

const unsafeReference=clone(fixture);
unsafeReference.evidence[0].reference='evidence+sha256:'+('f'.repeat(64))+':https://example.test/evidence?token=secret';
assertThrows(()=>validateGlazeV17QualificationPacket(unsafeReference),/credential-safe logical locator/);

const timezoneLessObservation=clone(fixture);
timezoneLessObservation.evidence[0].observedAt='2026-09-28T09:00:00';
assertThrows(()=>validateGlazeV17QualificationPacket(timezoneLessObservation),/timezone-qualified timestamp/);

const postReviewObservation=clone(fixture);
postReviewObservation.evidence[0].observedAt='2026-09-28T14:00:01Z';
assertThrows(()=>validateGlazeV17QualificationPacket(postReviewObservation),/cannot postdate packet review/);

const args=process.argv.slice(2);
if(args.length){
  for(const file of args){
    const result=validateGlazeV17QualificationPacket(json(file));
    console.log(JSON.stringify({file,...result},null,2));
  }
}else{
  console.log('GLAZE UI V1.7 qualification evidence packet control: PASS');
  console.log('Template: 37 unverified lanes; no evidence manufactured.');
  console.log('Boundary: packet completeness can only make evidence ready for governed qualification review; V1.7 acceptance and Anchor promotion remain separate.');
}
