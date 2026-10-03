#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateGlazeV17Section48Qualification,SECTION48_QUALIFICATION_LANES} from '../js/glaze-v1.7-section48-qualification.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.isAbsolute(rel)?rel:path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const template=json('acceptance/v1.7-section48-qualification-evidence.template.json');
const schema=json('schemas/v1.7-section48-qualification-evidence.schema.json');

const LANE_IDS=new Set(SECTION48_QUALIFICATION_LANES.map(x=>x.id));
const REQUIREMENTS=new Map(SECTION48_QUALIFICATION_LANES.map(x=>[x.id,new Set(x.groups)]));
const EVIDENCE_TYPES=new Set([
  'machine','rendered','device','human','assistive-technology',
  'provider-integration','privacy-security','performance','energy','provenance'
]);
const TOP_KEYS=new Set([
  '$schema','schemaVersion','recordId','lifecycle','sourceRevision','acceptanceModelVersion',
  'stableBaseline','predecessorQualification','review','evidence','reviewDecision','authority','boundary'
]);
const PREDECESSOR_KEYS=new Set(['sourceRevision','reference','acceptedByGovernedReview']);
const REVIEW_KEYS=new Set(['reviewedAt','reviewer','reviewerRole','scope','representativeRevisionConfirmed','notes']);
const EVIDENCE_KEYS=new Set(['laneId','type','sourceRevision','reference','finding','observedAt','reviewer','acceptedByGovernedReview']);
const AUTHORITY_KEYS=new Set([
  'packetIsV17Acceptance','section48Accepted','lifecyclePromotionAutomatic','anchorStatusGranted',
  'consumerEligibilityGranted','deploymentAcceptanceGranted','productionAcceptanceGranted'
]);
const EVIDENCE_REFERENCE=/^evidence\+sha256:[0-9a-f]{64}:(.{1,700})$/;
const EVIDENCE_LOCATOR=/^[A-Za-z0-9._-][A-Za-z0-9._/-]*$/;

function assert(value,message){if(!value)throw new Error(message);}
function plainObject(value){
  if(value===null||typeof value!=='object'||Array.isArray(value))return false;
  const proto=Object.getPrototypeOf(value);
  return proto===Object.prototype||proto===null;
}
function exactKeys(value,allowed,name){
  for(const key of Object.keys(value))assert(allowed.has(key),name+' contains unsupported key: '+key);
  for(const key of allowed)assert(Object.hasOwn(value,key),name+' missing required key: '+key);
}
function revision(value){return typeof value==='string'&&/^[0-9a-f]{40}$/.test(value);}
function placeholder(value){return typeof value==='string'&&value.startsWith('REPLACE_WITH_');}
function usable(value){return typeof value==='string'&&value.trim().length>0&&!placeholder(value)&&!value.includes('Template placeholder');}
function timestamp(value,name){
  assert(usable(value)&&value.length<=40&&/(?:Z|[+-]\d{2}:\d{2})$/.test(value),name+' must be timezone-qualified');
  const ms=Date.parse(value);
  assert(Number.isFinite(ms),name+' must be valid');
  return ms;
}
function evidenceReference(value,name){
  assert(usable(value)&&value.length<=800,name+' must be a bounded evidence reference');
  const match=EVIDENCE_REFERENCE.exec(value);
  const locator=match?.[1];
  assert(match&&EVIDENCE_LOCATOR.test(locator)&&!locator.startsWith('/')&&!locator.endsWith('/')&&!locator.split('/').some(x=>!x||x==='.'||x==='..'),name+' must be a content-addressed credential-safe logical locator');
}

export function validateGlazeV17Section48QualificationPacket(record,{allowTemplate=false}={}){
  assert(plainObject(record),'Section 48 packet must be a plain object');
  exactKeys(record,TOP_KEYS,'Section 48 packet');
  assert(record.$schema==='../schemas/v1.7-section48-qualification-evidence.schema.json','$schema mismatch');
  assert(record.schemaVersion===1,'schemaVersion mismatch');
  assert(record.recordId==='goreecloud.glaze.v1.7.section48-qualification-evidence','recordId mismatch');
  assert(record.lifecycle==='DevelopmentQualification','lifecycle mismatch');
  assert(record.acceptanceModelVersion==='1.7.0-dev.45','acceptance model mismatch');
  assert(record.stableBaseline==='1.6.0','stable baseline mismatch');
  const isTemplate=record.reviewDecision==='not-accepted'&&record.evidence.length===0;
  assert(revision(record.sourceRevision)||(allowTemplate&&isTemplate&&record.sourceRevision==='REPLACE_WITH_FROZEN_V17_SOURCE_REVISION'),'sourceRevision must be exact');

  assert(plainObject(record.predecessorQualification),'predecessorQualification missing');
  exactKeys(record.predecessorQualification,PREDECESSOR_KEYS,'predecessorQualification');
  assert(record.predecessorQualification.acceptedByGovernedReview===true||record.predecessorQualification.acceptedByGovernedReview===false,'predecessor accepted flag must be boolean');
  assert(
    revision(record.predecessorQualification.sourceRevision)||
    (allowTemplate&&record.predecessorQualification.sourceRevision==='REPLACE_WITH_FROZEN_V17_SOURCE_REVISION'),
    'predecessor sourceRevision must be exact'
  );

  assert(plainObject(record.review),'review missing');
  exactKeys(record.review,REVIEW_KEYS,'review');
  assert(record.review.representativeRevisionConfirmed===true||record.review.representativeRevisionConfirmed===false,'review representativeRevisionConfirmed must be boolean');
  assert(Array.isArray(record.evidence)&&record.evidence.length<=1000,'evidence must be a bounded array');

  const normalized=[];
  const observed=[];
  for(const item of record.evidence){
    assert(plainObject(item),'evidence item must be a plain object');
    exactKeys(item,EVIDENCE_KEYS,'evidence item');
    assert(LANE_IDS.has(item.laneId),'unknown lane: '+item.laneId);
    assert(EVIDENCE_TYPES.has(item.type),'unsupported evidence type: '+item.type);
    assert(REQUIREMENTS.get(item.laneId).has(item.type),'evidence type is not required by lane '+item.laneId+': '+item.type);
    assert(revision(item.sourceRevision),'evidence sourceRevision must be exact');
    assert(item.sourceRevision===record.sourceRevision,'evidence revision mismatch for '+item.laneId);
    evidenceReference(item.reference,'evidence reference for '+item.laneId);
    const observedAt=timestamp(item.observedAt,'observedAt for '+item.laneId);
    assert(usable(item.finding)&&item.finding.length<=2000,'finding missing or too long for '+item.laneId);
    assert(usable(item.reviewer)&&item.reviewer.length<=240,'reviewer missing or too long for '+item.laneId);
    assert(item.acceptedByGovernedReview===true||item.acceptedByGovernedReview===false,'acceptedByGovernedReview must be boolean');
    if(item.acceptedByGovernedReview)observed.push({laneId:item.laneId,observedAt});
    normalized.push({
      laneId:item.laneId,
      type:item.type,
      sourceRevision:item.sourceRevision,
      reference:item.reference,
      reviewer:item.reviewer,
      acceptedByGovernedReview:item.acceptedByGovernedReview
    });
  }

  exactKeys(record.authority,AUTHORITY_KEYS,'authority');
  for(const key of AUTHORITY_KEYS)assert(record.authority[key]===false,'packet must not grant authority: '+key);
  assert(typeof record.boundary==='string'&&record.boundary.length>=40,'boundary must be descriptive');

  if(record.reviewDecision==='accepted-for-governed-qualification-review'){
    assert(revision(record.sourceRevision),'accepted packet requires exact source revision');
    assert(record.review.representativeRevisionConfirmed===true,'accepted packet requires exact-revision confirmation');
    const reviewedAt=timestamp(record.review.reviewedAt,'reviewedAt');
    for(const key of ['reviewer','reviewerRole','scope','notes'])assert(usable(record.review[key]),'accepted packet review metadata missing: '+key);
    assert(record.predecessorQualification.acceptedByGovernedReview===true,'accepted Section 48 intake requires accepted predecessor qualification');
    assert(record.predecessorQualification.sourceRevision===record.sourceRevision,'predecessor qualification revision mismatch');
    evidenceReference(record.predecessorQualification.reference,'predecessor qualification reference');
    for(const item of observed)assert(item.observedAt<=reviewedAt,'accepted evidence postdates review for '+item.laneId);
  }else{
    assert(record.reviewDecision==='not-accepted','unsupported reviewDecision');
    assert(record.review.representativeRevisionConfirmed===false,'not-accepted packet must not confirm representative revision');
    if(!allowTemplate)assert(record.evidence.every(x=>x.acceptedByGovernedReview!==true),'not-accepted packet must not contain accepted evidence');
  }

  return evaluateGlazeV17Section48Qualification({
    sourceRevision:revision(record.sourceRevision)?record.sourceRevision:'0'.repeat(40),
    predecessorQualification:{
      sourceRevision:revision(record.predecessorQualification.sourceRevision)?record.predecessorQualification.sourceRevision:'0'.repeat(40),
      reference:record.predecessorQualification.reference,
      acceptedByGovernedReview:record.predecessorQualification.acceptedByGovernedReview
    },
    evidence:normalized
  });
}

assert(Array.isArray(schema.properties.evidence.items.properties.laneId.enum),'schema lane enum missing');
assert(schema.properties.evidence.items.properties.laneId.enum.length===SECTION48_QUALIFICATION_LANES.length,'schema/runtime lane count mismatch');
assert(schema.properties.evidence.items.properties.type.enum.length===EVIDENCE_TYPES.size,'schema/runtime evidence-type count mismatch');

const empty=validateGlazeV17Section48QualificationPacket(template,{allowTemplate:true});
assert(empty.blockingLanes.length===SECTION48_QUALIFICATION_LANES.length,'template must block every Section 48 lane');
assert(empty.readyForGovernedQualificationReview===false,'template must not be review-ready');

const exact='a'.repeat(40);
const fixture=JSON.parse(JSON.stringify(template));
fixture.sourceRevision=exact;
fixture.predecessorQualification={
  sourceRevision:exact,
  reference:'evidence+sha256:'+'f'.repeat(64)+':v1.7/predecessor/accepted-review',
  acceptedByGovernedReview:true
};
fixture.review={
  reviewedAt:'2026-10-03T10:00:00-05:00',
  reviewer:'Section 48 qualification fixture reviewer',
  reviewerRole:'Independent governed review fixture',
  scope:'Synthetic validator self-test for every Section 48 evidence group.',
  representativeRevisionConfirmed:true,
  notes:'Synthetic validator self-test only; not committed qualification evidence.'
};
fixture.evidence=[];
let n=0;
for(const lane of SECTION48_QUALIFICATION_LANES){
  for(const type of lane.groups){
    n+=1;
    fixture.evidence.push({
      laneId:lane.id,
      type,
      sourceRevision:exact,
      reference:'evidence+sha256:'+n.toString(16).padStart(64,'0')+':v1.7/section48/'+lane.id+'/'+type,
      finding:'Synthetic validator self-test observation for '+lane.id+' / '+type+'.',
      observedAt:'2026-10-03T09:00:00-05:00',
      reviewer:'Section 48 qualification fixture reviewer',
      acceptedByGovernedReview:true
    });
  }
}
fixture.reviewDecision='accepted-for-governed-qualification-review';
const complete=validateGlazeV17Section48QualificationPacket(fixture);
assert(complete.evidenceComplete===true&&complete.blockingLanes.length===0,'synthetic complete packet must satisfy all Section 48 evidence groups');
assert(complete.readyForGovernedQualificationReview===true,'synthetic complete packet must become review-ready');
assert(complete.authority.section48Accepted===false&&complete.authority.anchorStatusGranted===false,'complete packet must remain non-authorizing');

console.log('Glaze V1.7 Section 48 qualification evidence intake validation: PASS');
console.log('Template evidence count: 0');
console.log('Qualification lanes: '+SECTION48_QUALIFICATION_LANES.length);
