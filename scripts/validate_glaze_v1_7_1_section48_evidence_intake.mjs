#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {V13_SECTION48_QUALIFICATION_LANES} from '../js/glaze-v1.7-v1-3-qualification.dev.mjs';
import {V13_SECTION48_COVERAGE_LANES} from '../js/glaze-v1.7-v1-3-qualification-coverage.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.isAbsolute(rel)?rel:path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const req=(value,message)=>{if(!value)throw new Error(message);};

const plan=json('contracts/v1.7/qualification.v1.3.evidence-intake.plan.json');
const planSchema=json('schemas/v1.7.1-section48-evidence-intake-plan.schema.json');
const packetSchema=json('schemas/v1.7.1-section48-evidence-intake.schema.json');
const template=json('acceptance/v1.7.1-section48-evidence-intake.template.json');
const lifecycle=json('registry/lifecycle.json');
const controlCoverage=json('contracts/v1.7/qualification.v1.3.control-coverage.json');

const SOURCE='4b9d085a5177b96cc31d4270b38d792a59872e37';
const MODEL='1.7.0-dev.47';
const STABLE='1.7.0';
const HISTORICAL='1.6.0';
const HEX40=/^[0-9a-f]{40}$/;
const REF=/^evidence\+sha256:([0-9a-f]{64}):(.{1,700})$/;
const LOCATOR=/^[A-Za-z0-9._-][A-Za-z0-9._/-]*$/;
const PLACEHOLDER=/(REPLACE_WITH|\bTBD\b|\bTODO\b|template placeholder)/i;
const TYPES=['machine','rendered','device','human','assistive-technology','performance','energy','provenance','provider-integration','privacy-security'];
const LANES=[...V13_SECTION48_QUALIFICATION_LANES,...V13_SECTION48_COVERAGE_LANES];
const LANE_MAP=new Map(LANES.map(x=>[x.id,x]));
const CONDITIONAL=new Set(['energy-v13']);

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
function requiredGroups(lane){return lane.evidenceGroups.map(g=>[...g]);}
function laneAllows(lane,type){return lane.evidenceTypes.includes(type);}
function groupSatisfied(group,records){return records.some(r=>r.acceptedByGovernedReview===true&&group.includes(r.type));}

function validateSource(){
  req(planSchema.$schema==='https://json-schema.org/draft/2020-12/schema','plan schema dialect drifted');
  req(packetSchema.$schema==='https://json-schema.org/draft/2020-12/schema','packet schema dialect drifted');
  req(plan.planId==='goreecloud.glaze.v1.7.1.section48-evidence-intake','plan ID drifted');
  req(plan.lifecycle==='DevelopmentQualification'&&plan.successorReleaseLine==='1.7.1'&&plan.developmentIdentity==='1.7.1-dev.1','successor identity drifted');
  req(plan.sourceRevision===SOURCE&&plan.sourceModelVersion===MODEL&&plan.section48QualificationModelVersion===MODEL,'source/model binding drifted');
  req(plan.stableBaseline===STABLE&&plan.historicalSourceStableBaseline===HISTORICAL,'stable baseline binding drifted');
  req(plan.consumerEligible===false,'plan must remain non-consumer-eligible');
  req(plan.section48LaneCount===25&&LANES.length===25,'Section 48 lane count drifted');
  req(JSON.stringify(plan.evidenceTypes)===JSON.stringify(TYPES),'intake evidence type set drifted');
  req(JSON.stringify(plan.conditionalLaneIds)===JSON.stringify(['energy-v13']),'conditional lane set drifted');
  req(controlCoverage.controlCoverageComplete===true,'control coverage must be complete before governed intake');
  req(controlCoverage.acceptedEvidenceInventoryComplete===false&&controlCoverage.section48Accepted===false,'control coverage must not overclaim evidence');
  for(const key of ['acceptedEvidenceInventoryComplete','readyForSection48GovernedAcceptanceReview','section48Accepted','v171AcceptanceEstablished','lifecyclePromotionEstablished','consumerAcceptanceEstablished','deploymentAcceptanceEstablished','publicationEstablished','productionAcceptanceEstablished']) req(plan.currentBoundary[key]===false,'plan boundary overclaim: '+key);
  req(read('VERSION').trim()===STABLE,'bounded Stable VERSION changed');
  req(lifecycle.currentOfficial===STABLE&&lifecycle.currentStable===STABLE&&lifecycle.currentLifecycle==='anchor','bounded Stable authority changed');
  req(lifecycle.plannedNext==='1.7.1'&&lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'successor lifecycle boundary changed');
  req(packetSchema.properties.evidence.items.properties.laneId.enum.length===25,'packet schema lane enum drifted');
  req(packetSchema.properties.evidence.items.properties.type.enum.length===10,'packet schema evidence type enum drifted');
  for(const rel of Object.values(plan.implementation)) if(typeof rel==='string') req(fs.existsSync(path.join(root,rel)),'intake implementation dependency missing: '+rel);
  git('cat-file','-e',SOURCE+'^{commit}');
}

export function validateSection48EvidenceIntake(packet,{allowTemplate=false}={}){
  req(packet&&typeof packet==='object'&&!Array.isArray(packet),'packet must be an object');
  req(packet.$schema==='../schemas/v1.7.1-section48-evidence-intake.schema.json','$schema mismatch');
  req(packet.schemaVersion===1&&packet.recordId==='goreecloud.glaze.v1.7.1.section48-evidence-intake','packet identity mismatch');
  req(packet.lifecycle==='DevelopmentQualification','packet lifecycle mismatch');
  req(packet.sourceRevision===SOURCE,'packet source revision mismatch');
  req(packet.section48QualificationModelVersion===MODEL,'packet model mismatch');
  req(packet.stableBaseline===STABLE&&packet.historicalSourceStableBaseline===HISTORICAL,'packet baseline mismatch');

  const isTemplate=packet.reviewDecision==='not-reviewed'&&Array.isArray(packet.evidence)&&packet.evidence.length===0;
  if(allowTemplate&&isTemplate&&String(packet.toolingRevision).startsWith('REPLACE_WITH_')){
    // fail-closed template placeholder accepted only for template validation
  }else{
    req(HEX40.test(String(packet.toolingRevision||'')),'toolingRevision must be full SHA');
    git('cat-file','-e',packet.toolingRevision+'^{commit}');
    try{execFileSync('git',['merge-base','--is-ancestor',packet.toolingRevision,'HEAD'],{cwd:root,stdio:'ignore'});}
    catch{throw new Error('toolingRevision must be an ancestor of current tooling HEAD');}
  }

  req(packet.review&&typeof packet.review==='object'&&!Array.isArray(packet.review),'review metadata required');
  req(typeof packet.review.representativeRevisionConfirmed==='boolean','representativeRevisionConfirmed must be boolean');
  req(typeof packet.review.independentReviewConfirmed==='boolean','independentReviewConfirmed must be boolean');

  const applicability=packet.section48Applicability||{};
  const justifications=packet.section48NotApplicableJustifications||{};
  for(const [id,value] of Object.entries(applicability)){
    req(LANE_MAP.has(id),'unknown applicability lane: '+id);
    req(typeof value==='boolean','applicability must be boolean: '+id);
    req(value!==false||CONDITIONAL.has(id),'required lane cannot be not applicable: '+id);
  }
  for(const id of Object.keys(justifications))req(CONDITIONAL.has(id),'justification provided for non-conditional lane: '+id);

  req(Array.isArray(packet.evidence)&&packet.evidence.length<=2000,'evidence must be bounded array');
  const seenRefs=new Set();
  const byLane=new Map();
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
    const list=byLane.get(item.laneId)||[]; list.push(item); byLane.set(item.laneId,list);
  }

  const laneResults=[];
  for(const lane of LANES){
    const applicable=applicability[lane.id]!==false;
    const records=byLane.get(lane.id)||[];
    if(!applicable){
      const reason=typeof justifications[lane.id]==='string'?justifications[lane.id].trim():'';
      const justified=CONDITIONAL.has(lane.id)&&reason.length>=20&&!PLACEHOLDER.test(reason);
      laneResults.push({id:lane.id,status:justified?'not-applicable-justified':'unverified',satisfiedEvidenceGroupCount:0,requiredEvidenceGroupCount:lane.evidenceGroups.length});
      continue;
    }
    const groups=requiredGroups(lane);
    const satisfied=groups.filter(g=>groupSatisfied(g,records)).length;
    laneResults.push({id:lane.id,status:satisfied===groups.length?'externally-verified':'unverified',satisfiedEvidenceGroupCount:satisfied,requiredEvidenceGroupCount:groups.length});
  }
  const complete=laneResults.every(x=>x.status==='externally-verified'||x.status==='not-applicable-justified');

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

  const ready=packet.reviewDecision==='reviewed-evidence-inventory'&&complete&&packet.review.representativeRevisionConfirmed===true&&packet.review.independentReviewConfirmed===true;
  return Object.freeze({
    laneCount:LANES.length,
    externallyVerifiedCount:laneResults.filter(x=>x.status==='externally-verified').length,
    notApplicableJustifiedCount:laneResults.filter(x=>x.status==='not-applicable-justified').length,
    unverifiedCount:laneResults.filter(x=>x.status==='unverified').length,
    evidenceInventoryComplete:complete,
    readyForSection48GovernedAcceptanceReview:ready,
    laneResults:Object.freeze(laneResults),
    blockingLaneIds:Object.freeze(laneResults.filter(x=>x.status==='unverified').map(x=>x.id)),
    authority:Object.freeze({section48Accepted:false,v171AcceptanceEstablished:false,lifecyclePromotionAutomatic:false})
  });
}

validateSource();
const empty=validateSection48EvidenceIntake(template,{allowTemplate:true});
req(empty.evidenceInventoryComplete===false&&empty.unverifiedCount===25,'template must block all 25 lanes');
req(empty.readyForSection48GovernedAcceptanceReview===false,'template must not be review-ready');

function ref(n,lane,type){return 'evidence+sha256:'+n.toString(16).padStart(64,'0')+':v1.7.1/section48/'+lane+'/'+type+'.json';}
const head=git('rev-parse','HEAD');
const fixture=JSON.parse(JSON.stringify(template));
fixture.toolingRevision=head;
fixture.review={reviewedAt:'2026-10-04T03:40:00-05:00',reviewer:'Synthetic intake self-test reviewer',reviewerRole:'Governed review fixture',scope:'Synthetic all-lane intake validator self-test.',representativeRevisionConfirmed:true,independentReviewConfirmed:true,notes:'Synthetic fixture only; not real evidence.'};
fixture.reviewDecision='reviewed-evidence-inventory';
fixture.evidence=[];
let n=0;
for(const lane of LANES){
  for(const group of lane.evidenceGroups){
    n+=1; const type=group[0];
    fixture.evidence.push({laneId:lane.id,type,sourceRevision:SOURCE,reference:ref(n,lane.id,type),finding:'Synthetic accepted-review fixture for '+lane.id+' / '+type+'.',observedAt:'2026-10-04T03:00:00-05:00',reviewedAt:'2026-10-04T03:20:00-05:00',reviewer:'Synthetic intake self-test reviewer',acceptedByGovernedReview:true,limitations:'Synthetic validator fixture only.'});
  }
}
const complete=validateSection48EvidenceIntake(fixture);
req(complete.evidenceInventoryComplete===true&&complete.unverifiedCount===0,'complete synthetic intake should fill all evidence groups');
req(complete.readyForSection48GovernedAcceptanceReview===true,'complete independently reviewed inventory should become acceptance-review-ready');
req(complete.authority.section48Accepted===false&&complete.authority.v171AcceptanceEstablished===false,'complete intake must remain non-authorizing');

const partial=JSON.parse(JSON.stringify(fixture));
partial.evidence=partial.evidence.slice(0,3);
const partialResult=validateSection48EvidenceIntake(partial);
req(partialResult.evidenceInventoryComplete===false&&partialResult.externallyVerifiedCount<25,'partial reviewed evidence must remain incomplete');
req(partialResult.readyForSection48GovernedAcceptanceReview===false,'partial inventory must not become acceptance-review-ready');

function reject(mut,label){const r=JSON.parse(JSON.stringify(fixture)); mut(r); let threw=false; try{validateSection48EvidenceIntake(r);}catch{threw=true;} req(threw,'expected rejection: '+label);}
reject(r=>{r.evidence[0].sourceRevision='0'.repeat(40);},'stale evidence source');
reject(r=>{r.evidence[0].type='energy';},'wrong lane/type');
reject(r=>{r.evidence[0].reference='https://example.invalid/evidence';},'non-content-addressed reference');
reject(r=>{r.evidence[0].reviewedAt='2026-10-04T02:00:00-05:00';},'review predates observation');
reject(r=>{r.review.independentReviewConfirmed=false;},'missing independent review');
reject(r=>{r.authority.section48Accepted=true;},'authority overclaim');
reject(r=>{r.section48Applicability['workspace-continuity-v13']=false;},'required lane marked not applicable');

console.log('Glaze V1.7.1 Section 48 governed evidence intake: PASS');
console.log('Section 48 lanes: '+LANES.length);
console.log('Evidence types: '+TYPES.length);
console.log('Template inventory complete: false');
console.log('Synthetic complete inventory ready for separate acceptance review: true');
console.log('Section 48 accepted by intake: false');
