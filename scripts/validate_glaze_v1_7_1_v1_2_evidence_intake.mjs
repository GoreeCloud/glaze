#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {
  createGlazeV17AcceptanceMatrix,
  glazeV17AcceptanceDevelopmentContract
} from '../js/glaze-v1.7-acceptance.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.isAbsolute(rel)?rel:path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const req=(value,message)=>{if(!value)throw new Error(message);};

const plan=json('contracts/v1.7/qualification.v1.2.evidence-intake.plan.json');
const planSchema=json('schemas/v1.7.1-v1.2-evidence-intake-plan.schema.json');
const packetSchema=json('schemas/v1.7.1-v1.2-evidence-intake.schema.json');
const template=json('acceptance/v1.7.1-v1.2-evidence-intake.template.json');
const workingSetPlan=json('contracts/v1.7/qualification.v1.2.working-set.plan.json');
const machinePlan=json('contracts/v1.7/qualification.v1.2.machine.plan.json');
const renderedPlan=json('contracts/v1.7/qualification.v1.2.rendered.plan.json');
const regressionRecord=json('acceptance/v1.7.1-regression-evidence.json');
const lifecycle=json('registry/lifecycle.json');

const SOURCE='4b9d085a5177b96cc31d4270b38d792a59872e37';
const SOURCE_MODEL='1.7.0-dev.47';
const ACCEPTANCE_MODEL='1.7.0-dev.39';
const STABLE='1.7.0';
const HISTORICAL='1.6.0';
const HEX40=/^[0-9a-f]{40}$/;
const REF=/^evidence\+sha256:([0-9a-f]{64}):(.{1,700})$/;
const LOCATOR=/^[A-Za-z0-9._-][A-Za-z0-9._/-]*$/;
const PLACEHOLDER=/(REPLACE_WITH|\bTBD\b|\bTODO\b|template placeholder)/i;
const TYPES=['machine','rendered','device','human','assistive-technology','performance','energy','provenance'];
const LANES=glazeV17AcceptanceDevelopmentContract.acceptanceLanes;
const LANE_MAP=new Map(LANES.map(x=>[x.id,x]));
const CONDITIONAL=new Set(glazeV17AcceptanceDevelopmentContract.conditionalApplicabilityLanes);

function git(...args){return execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();}
function meaningful(value,label,max=2000){
  req(typeof value==='string'&&value.trim(),label+' must be non-empty');
  const s=value.trim(); req(s.length<=max,label+' too long'); req(!PLACEHOLDER.test(s),label+' contains placeholder'); return s;
}
function timestamp(value,label){
  const s=meaningful(value,label,50); req(/(?:Z|[+-]\d{2}:\d{2})$/.test(s),label+' must include timezone');
  const ms=Date.parse(s); req(Number.isFinite(ms),label+' invalid'); return ms;
}
function evidenceReference(value,label){
  const s=meaningful(value,label,800); const m=REF.exec(s); req(m,label+' must use evidence+sha256');
  const loc=m[2]; req(LOCATOR.test(loc),label+' locator invalid');
  req(!loc.startsWith('/')&&!loc.endsWith('/'),'locator must be relative');
  req(!loc.split('/').some(x=>!x||x==='.'||x==='..'),'locator contains unsafe traversal');
  req(!/(token|password|secret|authorization|bearer)=/i.test(loc),'locator appears to contain credential material');
  return s;
}
function laneAllows(lane,type){return lane.evidenceTypes.includes(type);}
function sorted(values){return [...values].sort();}
function baselineEvidence(){
  return [
    ...machinePlan.expectedMachineLaneIds.map(id=>({id,verified:true,revision:SOURCE,evidenceType:'machine',reference:'retained-baseline://machine/'+id})),
    ...renderedPlan.eligibleRenderedEvidenceLaneIds.map(id=>({id,verified:true,revision:SOURCE,evidenceType:'rendered',reference:'retained-baseline://rendered/'+id})),
    ...regressionRecord.regressionEvidence.map(item=>({id:item.id,verified:true,revision:SOURCE,evidenceType:item.evidenceType,reference:item.reference})),
    {id:'artifact-provenance',verified:true,revision:SOURCE,evidenceType:'provenance',reference:'retained-baseline://provenance/artifact-provenance'}
  ];
}
function validateSource(){
  req(planSchema.$schema==='https://json-schema.org/draft/2020-12/schema','plan schema dialect drifted');
  req(packetSchema.$schema==='https://json-schema.org/draft/2020-12/schema','packet schema dialect drifted');
  req(plan.planId==='goreecloud.glaze.v1.7.1.v1.2-evidence-intake','plan ID drifted');
  req(plan.lifecycle==='DevelopmentQualification'&&plan.successorReleaseLine==='1.7.1'&&plan.developmentIdentity==='1.7.1-dev.1','successor identity drifted');
  req(plan.sourceRevision===SOURCE&&plan.sourceModelVersion===SOURCE_MODEL&&plan.acceptanceModelVersion===ACCEPTANCE_MODEL,'source/model binding drifted');
  req(plan.stableBaseline===STABLE&&plan.historicalSourceStableBaseline===HISTORICAL,'stable baseline binding drifted');
  req(plan.consumerEligible===false&&plan.retainedLaneCount===37&&LANES.length===37,'retained lane boundary drifted');
  req(JSON.stringify(plan.evidenceTypes)===JSON.stringify(TYPES),'evidence type set drifted');
  req(JSON.stringify(plan.conditionalLaneIds)===JSON.stringify(['wearable','energy-behavior']),'conditional lane set drifted');

  req(workingSetPlan.planId==='goreecloud.glaze.v1.7.1.v1.2.qualification-working-set','working-set plan identity drifted');
  req(workingSetPlan.sourceRevision===SOURCE&&workingSetPlan.acceptanceModelVersion===ACCEPTANCE_MODEL,'working-set exact-source binding drifted');
  req(workingSetPlan.expectedCombinedEvidenceRecordCount===44,'retained baseline record count drifted');
  req(workingSetPlan.expectedMatrixExternallyVerifiedCount===17&&workingSetPlan.expectedMatrixUnverifiedCount===20,'retained baseline matrix drifted');
  req(sorted(workingSetPlan.expectedMatrixExternallyVerifiedLaneIds).join('|')===sorted(plan.retainedBaseline.evidenceGroupCompleteLaneIds).join('|'),'baseline complete lane set drifted');
  req(plan.retainedBaseline.evidenceRecordCount===44&&plan.retainedBaseline.externallyVerifiedLaneCount===17&&plan.retainedBaseline.unverifiedLaneCount===20,'plan retained baseline counts drifted');

  req(machinePlan.sourceRevision===SOURCE&&renderedPlan.sourceRevision===SOURCE,'baseline capture source drifted');
  req(regressionRecord.sourceRevision===SOURCE&&regressionRecord.authority?.historicalSourceEvidenceOnly===true,'durable Regression evidence boundary drifted');
  req(regressionRecord.matrixDisposition.externallyVerifiedCount===17&&regressionRecord.matrixDisposition.unverifiedCount===20,'Regression checkpoint matrix drifted');

  const baseline=baselineEvidence();
  req(baseline.length===44,'reconstructed retained baseline must contain 44 records');
  const matrix=createGlazeV17AcceptanceMatrix({exactRevision:SOURCE,evidence:baseline});
  req(matrix.externallyVerifiedCount===17&&matrix.unverifiedCount===20,'reconstructed retained baseline matrix drifted');
  req(sorted(matrix.lanes.filter(x=>x.status==='externally-verified').map(x=>x.id)).join('|')===sorted(plan.retainedBaseline.evidenceGroupCompleteLaneIds).join('|'),'reconstructed retained complete lanes drifted');

  req(read('VERSION').trim()===STABLE,'bounded Stable VERSION changed');
  req(lifecycle.currentOfficial===STABLE&&lifecycle.currentStable===STABLE&&lifecycle.currentLifecycle==='anchor','bounded Stable authority changed');
  req(lifecycle.plannedNext==='1.7.1'&&lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'successor lifecycle boundary changed');
  req(packetSchema.properties.evidence.items.properties.laneId.enum.length===37,'packet lane enum drifted');
  req(packetSchema.properties.evidence.items.properties.type.enum.length===8,'packet evidence type enum drifted');
  for(const rel of Object.values(plan.implementation)) if(typeof rel==='string') req(fs.existsSync(path.join(root,rel)),'intake implementation dependency missing: '+rel);
  git('cat-file','-e',SOURCE+'^{commit}');
}

export function validateRetainedV12EvidenceIntake(packet,{allowTemplate=false}={}){
  req(packet&&typeof packet==='object'&&!Array.isArray(packet),'packet must be an object');
  req(packet.$schema==='../schemas/v1.7.1-v1.2-evidence-intake.schema.json','$schema mismatch');
  req(packet.schemaVersion===1&&packet.recordId==='goreecloud.glaze.v1.7.1.v1.2-evidence-intake','packet identity mismatch');
  req(packet.lifecycle==='DevelopmentQualification','packet lifecycle mismatch');
  req(packet.sourceRevision===SOURCE&&packet.acceptanceModelVersion===ACCEPTANCE_MODEL,'packet source/model mismatch');
  req(packet.stableBaseline===STABLE&&packet.historicalSourceStableBaseline===HISTORICAL,'packet baseline mismatch');

  const isTemplate=packet.reviewDecision==='not-reviewed'&&Array.isArray(packet.evidence)&&packet.evidence.length===0;
  if(allowTemplate&&isTemplate&&String(packet.toolingRevision).startsWith('REPLACE_WITH_')){
    // Template-only placeholder; never accepted as evidence.
  }else{
    req(HEX40.test(String(packet.toolingRevision||'')),'toolingRevision must be full SHA');
    git('cat-file','-e',packet.toolingRevision+'^{commit}');
    try{execFileSync('git',['merge-base','--is-ancestor',packet.toolingRevision,'HEAD'],{cwd:root,stdio:'ignore'});}
    catch{throw new Error('toolingRevision must be an ancestor of current tooling HEAD');}
  }

  req(packet.review&&typeof packet.review==='object'&&!Array.isArray(packet.review),'review metadata required');
  req(typeof packet.review.representativeRevisionConfirmed==='boolean','representativeRevisionConfirmed must be boolean');
  req(typeof packet.review.independentReviewConfirmed==='boolean','independentReviewConfirmed must be boolean');

  const applicability=packet.retainedApplicability||{};
  const justifications=packet.retainedNotApplicableJustifications||{};
  for(const [id,value] of Object.entries(applicability)){
    req(LANE_MAP.has(id),'unknown applicability lane: '+id);
    req(typeof value==='boolean','applicability must be boolean: '+id);
    req(value!==false||CONDITIONAL.has(id),'required lane cannot be not applicable: '+id);
  }
  for(const id of Object.keys(justifications))req(CONDITIONAL.has(id),'justification provided for non-conditional lane: '+id);

  req(Array.isArray(packet.evidence)&&packet.evidence.length<=2000,'evidence must be bounded array');
  const seenRefs=new Set();
  const admitted=[];
  for(const [index,item] of packet.evidence.entries()){
    req(item&&typeof item==='object'&&!Array.isArray(item),'evidence item must be object: '+index);
    const lane=LANE_MAP.get(item.laneId); req(lane,'unknown evidence lane: '+item.laneId);
    req(TYPES.includes(item.type),'unsupported evidence type: '+item.type);
    req(laneAllows(lane,item.type),'evidence type '+item.type+' not allowed for '+item.laneId);
    req(item.sourceRevision===SOURCE,'evidence source revision mismatch: '+item.laneId);
    const ref=evidenceReference(item.reference,'evidence reference '+item.laneId);
    req(!seenRefs.has(ref),'duplicate evidence reference: '+ref); seenRefs.add(ref);
    meaningful(item.finding,'finding '+item.laneId); meaningful(item.reviewer,'reviewer '+item.laneId,240); meaningful(item.limitations,'limitations '+item.laneId);
    const observed=timestamp(item.observedAt,'observedAt '+item.laneId);
    const reviewed=timestamp(item.reviewedAt,'reviewedAt '+item.laneId);
    req(observed<=reviewed,'evidence review predates observation: '+item.laneId);
    req(typeof item.acceptedByGovernedReview==='boolean','acceptedByGovernedReview must be boolean');
    if(packet.reviewDecision==='reviewed-evidence-inventory') req(item.acceptedByGovernedReview===true,'reviewed inventory may contain only governed-review-accepted evidence');
    if(item.acceptedByGovernedReview===true) admitted.push({id:item.laneId,verified:true,revision:SOURCE,evidenceType:item.type,reference:ref});
  }

  const app={};
  const reasons={};
  for(const id of CONDITIONAL){
    app[id]=applicability[id]!==false;
    if(app[id]===false){
      const reason=typeof justifications[id]==='string'?justifications[id].trim():'';
      req(reason.length>=20&&!PLACEHOLDER.test(reason),'conditional not-applicable lane requires specific justification: '+id);
      reasons[id]=reason;
    }
  }

  if(packet.reviewDecision==='reviewed-evidence-inventory'){
    const packetReviewedAt=timestamp(packet.review.reviewedAt,'packet reviewedAt');
    meaningful(packet.review.reviewer,'packet reviewer',240); meaningful(packet.review.reviewerRole,'packet reviewerRole',240); meaningful(packet.review.scope,'packet scope'); meaningful(packet.review.notes,'packet notes');
    req(packet.review.representativeRevisionConfirmed===true,'reviewed inventory requires representative revision confirmation');
    req(packet.review.independentReviewConfirmed===true,'reviewed inventory requires independent review confirmation');
    for(const item of packet.evidence) req(timestamp(item.reviewedAt,'item reviewedAt')<=packetReviewedAt,'evidence item review postdates packet review');
  }else{
    req(packet.reviewDecision==='not-reviewed','unsupported reviewDecision');
    req(packet.review.representativeRevisionConfirmed===false&&packet.review.independentReviewConfirmed===false,'not-reviewed packet cannot confirm review');
    req(packet.evidence.every(x=>x.acceptedByGovernedReview===false),'not-reviewed packet cannot contain accepted evidence');
  }

  req(packet.authority&&typeof packet.authority==='object','authority block required');
  for(const [key,value] of Object.entries(packet.authority)) req(value===false,'packet must not grant authority: '+key);
  meaningful(packet.boundary,'boundary',3000);

  const combined=[...baselineEvidence(),...admitted];
  const matrix=createGlazeV17AcceptanceMatrix({
    exactRevision:SOURCE,
    evidence:combined,
    applicability:app,
    notApplicableJustifications:reasons
  });
  const ready=packet.reviewDecision==='reviewed-evidence-inventory'&&matrix.evidenceInventoryComplete&&packet.review.representativeRevisionConfirmed===true&&packet.review.independentReviewConfirmed===true;
  return Object.freeze({
    retainedBaselineEvidenceRecordCount:44,
    acceptedExternalEvidenceRecordCount:admitted.length,
    totalEvaluatedEvidenceRecordCount:combined.length,
    laneCount:matrix.laneCount,
    externallyVerifiedCount:matrix.externallyVerifiedCount,
    notApplicableJustifiedCount:matrix.notApplicableJustifiedCount,
    unverifiedCount:matrix.unverifiedCount,
    evidenceInventoryComplete:matrix.evidenceInventoryComplete,
    readyForGovernedQualificationReview:ready,
    laneResults:matrix.lanes,
    blockingLaneIds:matrix.blockingLaneIds,
    authority:Object.freeze({
      section46Complete:false,
      v171AcceptanceEstablished:false,
      lifecyclePromotionAutomatic:false,
      consumerEligibilityGranted:false,
      deploymentAcceptanceAutomatic:false,
      publicationAutomatic:false,
      productionAcceptanceAutomatic:false
    })
  });
}

validateSource();
const empty=validateRetainedV12EvidenceIntake(template,{allowTemplate:true});
req(empty.retainedBaselineEvidenceRecordCount===44&&empty.acceptedExternalEvidenceRecordCount===0,'template must preserve 44-record baseline and admit no new evidence');
req(empty.externallyVerifiedCount===17&&empty.unverifiedCount===20,'template must preserve retained 17/20 matrix');
req(empty.evidenceInventoryComplete===false&&empty.readyForGovernedQualificationReview===false,'template must remain incomplete');

function ref(n,lane,type){return 'evidence+sha256:'+n.toString(16).padStart(64,'0')+':v1.7.1/v1.2/'+lane+'/'+type+'.json';}
const head=git('rev-parse','HEAD');
const baselineMatrix=createGlazeV17AcceptanceMatrix({exactRevision:SOURCE,evidence:baselineEvidence()});
const fixture=JSON.parse(JSON.stringify(template));
fixture.toolingRevision=head;
fixture.review={reviewedAt:'2026-10-04T10:00:00-05:00',reviewer:'Synthetic intake self-test reviewer',reviewerRole:'Governed review fixture',scope:'Synthetic retained-v1.2 all-gap intake validator self-test.',representativeRevisionConfirmed:true,independentReviewConfirmed:true,notes:'Synthetic fixture only; not real evidence.'};
fixture.reviewDecision='reviewed-evidence-inventory';
fixture.evidence=[];
let n=0;
for(const lane of baselineMatrix.lanes){
  if(lane.status==='externally-verified')continue;
  for(const group of lane.evidenceGroupResults||lane.requiredEvidenceGroups.map(g=>({allowedEvidenceTypes:g,satisfied:false}))){
    if(group.satisfied)continue;
    n+=1; const type=group.allowedEvidenceTypes[0];
    fixture.evidence.push({laneId:lane.id,type,sourceRevision:SOURCE,reference:ref(n,lane.id,type),finding:'Synthetic accepted-review fixture for '+lane.id+' / '+type+'.',observedAt:'2026-10-04T09:00:00-05:00',reviewedAt:'2026-10-04T09:30:00-05:00',reviewer:'Synthetic intake self-test reviewer',acceptedByGovernedReview:true,limitations:'Synthetic validator fixture only.'});
  }
}
const complete=validateRetainedV12EvidenceIntake(fixture);
req(complete.evidenceInventoryComplete===true&&complete.unverifiedCount===0,'complete synthetic intake should fill all missing evidence groups');
req(complete.readyForGovernedQualificationReview===true,'complete independently reviewed inventory should become qualification-review-ready');
req(complete.authority.section46Complete===false&&complete.authority.v171AcceptanceEstablished===false,'complete intake must remain non-authorizing');

const partial=JSON.parse(JSON.stringify(fixture));
partial.evidence=partial.evidence.slice(0,1);
const partialResult=validateRetainedV12EvidenceIntake(partial);
req(partialResult.evidenceInventoryComplete===false&&partialResult.unverifiedCount>0,'partial reviewed evidence must remain incomplete');
req(partialResult.readyForGovernedQualificationReview===false,'partial inventory must not become review-ready');

function reject(mut,label){const r=JSON.parse(JSON.stringify(fixture)); mut(r); let threw=false; try{validateRetainedV12EvidenceIntake(r);}catch{threw=true;} req(threw,'expected rejection: '+label);}
reject(r=>{r.evidence[0].sourceRevision='0'.repeat(40);},'stale evidence source');
reject(r=>{r.evidence[0].type='provenance';},'wrong lane/type');
reject(r=>{r.evidence[0].reference='https://example.invalid/evidence';},'non-content-addressed reference');
reject(r=>{r.evidence[0].reviewedAt='2026-10-04T08:00:00-05:00';},'review predates observation');
reject(r=>{r.review.independentReviewConfirmed=false;},'missing independent review');
reject(r=>{r.authority.section46Complete=true;},'authority overclaim');
reject(r=>{r.retainedApplicability['mobile']=false;},'required lane marked not applicable');

console.log('Glaze V1.7.1 retained V1.2 governed evidence intake: PASS');
console.log('Retained lanes: '+LANES.length);
console.log('Retained baseline records: 44');
console.log('Retained baseline complete/unverified: 17 / 20');
console.log('Evidence types: '+TYPES.length);
console.log('Template inventory complete: false');
console.log('Synthetic complete inventory ready for separate qualification review: true');
console.log('Section 46 complete by intake: false');
