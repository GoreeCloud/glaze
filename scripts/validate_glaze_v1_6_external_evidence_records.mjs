#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

import {createGlazeV16AcceptanceMatrix} from '../js/glaze-v1.6-acceptance.dev.mjs';
import {evaluateGlazePerformanceMeasurements} from '../js/glaze-v1.6-performance-diagnostics.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.isAbsolute(rel)?rel:path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const clone=value=>JSON.parse(JSON.stringify(value));
const SOURCE='c7509c79256b04b0aa67cb9dd0737d7588e0ae4a';
const MODEL='1.6.0-dev.12';
const STABLE='1.5.1';
const placeholder=value=>typeof value==='string'&&(value.startsWith('REPLACE_WITH_')||value.includes('Template placeholder'));
const usable=value=>typeof value==='string'&&value.trim().length>0&&!placeholder(value);
const ids=items=>items.map(x=>x.id);

const humanTemplate=json('acceptance/v1.6-human-evidence.template.json');
const atTemplate=json('acceptance/v1.6-assistive-technology-evidence.template.json');
const performanceTemplate=json('acceptance/v1.6-performance-evidence.template.json');
const humanPlan=json('contracts/v1.6/qualification.human.plan.json');
const atPlan=json('contracts/v1.6/qualification.assistive-technology.plan.json');
const performancePlan=json('contracts/v1.6/qualification.performance.plan.json');
const acceptance=json('contracts/v1.6/acceptance.dev.json');
const lifecycle=json('registry/lifecycle.json');

function base(record,recordId,type){
  assert(record.recordId===recordId,'recordId mismatch');
  assert(record.recordType===type,'recordType mismatch');
  assert(record.lifecycle==='DevelopmentQualification','record lifecycle mismatch');
  assert(record.sourceRevision===SOURCE,'external evidence must remain bound to frozen V1.6 source');
  assert(record.acceptanceModelVersion===MODEL,'acceptance model mismatch');
  assert(record.stableBaseline===STABLE,'Stable baseline mismatch');
  for(const key of ['lifecyclePromotionAutomatic','candidateStatusGranted','releaseCandidateStatusGranted','stableStatusGranted','consumerAcceptanceAutomatic','deploymentAcceptanceAutomatic','productionAcceptanceAutomatic']){
    assert(record.authority[key]===false,'external evidence authority boundary must remain false: '+key);
  }
}

function laneRecords(record,type){
  return record.laneEvidence.filter(x=>x.verified===true).map(x=>({
    id:x.id,verified:true,revision:x.revision,evidenceType:type,reference:x.reference
  }));
}

function allScenarioPass(record){
  return record.scenarioResults.every(x=>x.status==='pass'&&usable(x.finding));
}

function validateHuman(record){
  base(record,'goreecloud.glaze-ui.v1.6.human-evidence','human');
  assert(record.reviewDecision==='accepted','human review decision must be accepted');
  assert(record.authority.humanEvidenceAccepted===true,'human evidence authority must be explicitly accepted');
  assert(record.authority.assistiveTechnologyEvidenceAccepted===false&&record.authority.performanceEvidenceAccepted===false,'human record must not accept other evidence types');
  assert(record.review.representativeRuntimeConfirmed===true,'human reviewer must confirm representative runtime');
  for(const key of ['reviewedAt','reviewer','reviewerRole','operatingSystem','runtime'])assert(usable(record.review[key]),'human review metadata missing: '+key);
  assert(Array.isArray(record.review.inputMethods)&&record.review.inputMethods.length>0&&record.review.inputMethods.every(usable),'human input methods missing');
  assert(JSON.stringify([...ids(record.scenarioResults)].sort())===JSON.stringify([...humanPlan.requiredReviewScenarios].sort()),'human scenario set mismatch');
  assert(allScenarioPass(record),'every human qualification scenario must pass for an accepted record');
  assert(JSON.stringify([...ids(record.laneEvidence)].sort())===JSON.stringify([...humanPlan.lanes].sort()),'human lane set mismatch');
  for(const item of record.laneEvidence){
    assert(item.verified===true,'accepted human record must explicitly verify every scoped lane');
    assert(item.revision===SOURCE&&item.evidenceType==='human','human lane evidence identity mismatch');
    assert(usable(item.reference)&&usable(item.finding),'human lane evidence needs durable reference and finding');
  }
  return laneRecords(record,'human');
}

function validateAssistiveTechnology(record){
  base(record,'goreecloud.glaze-ui.v1.6.assistive-technology-evidence','assistive-technology');
  assert(record.reviewDecision==='accepted','assistive-technology review decision must be accepted');
  assert(record.authority.assistiveTechnologyEvidenceAccepted===true,'assistive-technology evidence authority must be explicitly accepted');
  assert(record.authority.humanEvidenceAccepted===false&&record.authority.performanceEvidenceAccepted===false,'assistive-technology record must not accept other evidence types');
  assert(record.review.realAssistiveTechnologySessionConfirmed===true,'real assistive-technology session must be confirmed');
  for(const key of ['reviewedAt','reviewer','operatingSystem','runtime','assistiveTechnologyName','assistiveTechnologyVersion','inputMethod'])assert(usable(record.review[key]),'assistive-technology review metadata missing: '+key);
  assert(JSON.stringify([...ids(record.scenarioResults)].sort())===JSON.stringify([...atPlan.requiredReviewScenarios].sort()),'assistive-technology scenario set mismatch');
  assert(allScenarioPass(record),'every assistive-technology scenario must pass for an accepted record');
  const byId=new Map(record.laneEvidence.map(x=>[x.id,x]));
  const dedicated=byId.get('assistive-technology');
  assert(dedicated&&dedicated.verified===true&&dedicated.revision===SOURCE&&dedicated.evidenceType==='assistive-technology','dedicated Assistive Technology lane must be verified');
  for(const item of record.laneEvidence.filter(x=>x.verified===true)){
    assert(['assistive-technology','accessibility'].includes(item.id),'assistive-technology record lane scope widened');
    assert(item.revision===SOURCE&&item.evidenceType==='assistive-technology','assistive-technology lane evidence identity mismatch');
    assert(usable(item.reference)&&usable(item.finding),'assistive-technology lane evidence needs durable reference and finding');
  }
  return laneRecords(record,'assistive-technology');
}

function validatePerformance(record,{verifyCandidateArtifact=false}={}){
  base(record,'goreecloud.glaze-ui.v1.6.performance-evidence','performance');
  assert(record.reviewDecision==='accepted','performance review decision must be accepted');
  assert(record.authority.performanceEvidenceAccepted===true,'performance evidence authority must be explicitly accepted');
  assert(record.authority.humanEvidenceAccepted===false&&record.authority.assistiveTechnologyEvidenceAccepted===false,'performance record must not accept other evidence types');
  assert(record.review.representativeEnvironmentConfirmed===true,'representative environment must be confirmed');
  assert(record.review.authorityIncidentsAbsentConfirmed===true,'authority incident absence must be confirmed');
  for(const key of ['reviewedAt','reviewer','candidateEvidenceReference'])assert(usable(record.review[key]),'performance review metadata missing: '+key);
  assert(/^sha256:[0-9a-f]{64}$/.test(record.review.candidateEvidenceSha256),'candidate performance evidence SHA-256 must be durable');
  for(const key of ['operatingSystem','runtime','hardware','foregroundState','presentationMode','measurementDate'])assert(usable(record.environment[key]),'performance environment metadata missing: '+key);

  if(verifyCandidateArtifact){
    const candidatePath=record.review.candidateEvidenceReference;
    assert(candidatePath==='acceptance/v1.6-performance-candidate-evidence.json','accepted performance evidence must reference the canonical committed candidate artifact');
    const resolved=path.resolve(root,candidatePath);
    const acceptanceRoot=path.resolve(root,'acceptance');
    const relative=path.relative(acceptanceRoot,resolved);
    assert(relative!==''&&!relative.startsWith('..')&&!path.isAbsolute(relative),'performance candidate evidence must remain under acceptance/');
    assert(fs.existsSync(resolved)&&fs.statSync(resolved).isFile(),'performance candidate evidence artifact is missing');
    const candidateBytes=fs.readFileSync(resolved);
    const digest='sha256:'+crypto.createHash('sha256').update(candidateBytes).digest('hex');
    assert(digest===record.review.candidateEvidenceSha256,'performance candidate evidence SHA-256 mismatch');
    const candidate=JSON.parse(candidateBytes.toString('utf8'));
    assert(candidate.recordType==='glaze-v1.6-representative-performance-candidate-evidence','performance candidate recordType mismatch');
    assert(candidate.lifecycle==='DevelopmentQualification'&&candidate.evidenceType==='performance','performance candidate lifecycle/evidence type mismatch');
    assert(candidate.sourceRevision===SOURCE&&candidate.acceptanceModelVersion===MODEL&&candidate.stableBaseline===STABLE,'performance candidate authority binding mismatch');
    assert(candidate.environment?.exactRevision===SOURCE&&candidate.environment?.lifecycle==='DevelopmentQualification','performance candidate exact revision/lifecycle mismatch');
    assert(candidate.representativeEnvironmentConfirmed===true&&candidate.authorityObservationReviewed===true,'performance candidate review confirmations missing');
    assert(candidate.candidateDisposition==='pass'&&candidate.evaluation?.status==='pass','performance candidate disposition/evaluation must pass');
    assert(Array.isArray(candidate.evaluation?.sampleChecks)&&candidate.evaluation.sampleChecks.every(x=>x.status==='pass'),'performance candidate sample checks must all pass');
    assert(Array.isArray(candidate.evaluation?.metricChecks)&&candidate.evaluation.metricChecks.every(x=>x.status==='pass'),'performance candidate metric checks must all pass');
    for(const key of ['operatingSystem','runtime','hardware','foregroundState','presentationMode','measurementDate']){
      assert(candidate.environment?.[key]===record.environment[key],'performance candidate environment mismatch: '+key);
    }
    assert(JSON.stringify(candidate.samples)===JSON.stringify(record.samples),'performance candidate sample counts mismatch accepted record');
    assert(JSON.stringify(candidate.measurements)===JSON.stringify(record.measurements),'performance candidate measurements mismatch accepted record');
  }

  const minimum=performancePlan.budget.minimumSamples;
  for(const key of ['resolver','interactionPaint','idleFrames','activeFrames'])assert(record.samples[key]>=minimum[key],'performance sample minimum not met: '+key);
  for(const [key,value] of Object.entries(record.measurements))assert(Number.isFinite(value),'performance measurement missing: '+key);
  const result=evaluateGlazePerformanceMeasurements({
    environment:{
      exactRevision:SOURCE,lifecycle:'DevelopmentQualification',
      operatingSystem:record.environment.operatingSystem,runtime:record.environment.runtime,hardware:record.environment.hardware,
      foregroundState:record.environment.foregroundState,presentationMode:record.environment.presentationMode,measurementDate:record.environment.measurementDate
    },
    samples:record.samples,
    measurements:record.measurements
  });
  assert(result.status==='pass','governed performance evaluator did not pass the reviewed measurements');
  assert(record.budgetResult==='pass','performance record budgetResult must be pass');
  const item=record.laneEvidence[0];
  assert(record.laneEvidence.length===1&&item.id==='performance'&&item.verified===true,'performance lane must be explicitly verified');
  assert(item.revision===SOURCE&&item.evidenceType==='performance','performance lane evidence identity mismatch');
  assert(usable(item.reference)&&usable(item.finding),'performance lane evidence needs durable reference and finding');
  return laneRecords(record,'performance');
}
const validators=new Map([
  ['goreecloud.glaze-ui.v1.6.human-evidence',validateHuman],
  ['goreecloud.glaze-ui.v1.6.assistive-technology-evidence',validateAssistiveTechnology],
  ['goreecloud.glaze-ui.v1.6.performance-evidence',record=>validatePerformance(record,{verifyCandidateArtifact:true})]
]);

function validateTemplate(record,acceptedKey){
  assert(record.reviewDecision==='not-accepted','evidence template must fail closed');
  assert(record.authority[acceptedKey]===false,'evidence template must not claim accepted evidence');
  assert(record.laneEvidence.every(x=>x.verified===false),'evidence template must not verify lanes');
  assert(record.authority.lifecyclePromotionAutomatic===false&&record.authority.stableStatusGranted===false,'evidence template must not promote lifecycle');
}

function fillHuman(){
  const r=clone(humanTemplate);
  Object.assign(r.review,{reviewedAt:'2026-09-18T20:00:00-05:00',reviewer:'Qualification reviewer',reviewerRole:'Human accessibility reviewer',operatingSystem:'Representative OS',runtime:'Representative runtime',representativeRuntimeConfirmed:true});
  r.scenarioResults.forEach(x=>{x.status='pass';x.finding='Observed expected behavior in a real review fixture.';});
  r.laneEvidence.forEach(x=>{x.verified=true;x.reference='review://human/'+x.id;x.finding='Reviewed and accepted fixture observation.';});
  r.reviewDecision='accepted';r.authority.humanEvidenceAccepted=true;return r;
}
function fillAt(){
  const r=clone(atTemplate);
  Object.assign(r.review,{reviewedAt:'2026-09-18T20:00:00-05:00',reviewer:'Qualification reviewer',operatingSystem:'Representative OS',runtime:'Representative runtime',assistiveTechnologyName:'Representative AT',assistiveTechnologyVersion:'1.0',inputMethod:'keyboard',realAssistiveTechnologySessionConfirmed:true});
  r.scenarioResults.forEach(x=>{x.status='pass';x.finding='Observed expected behavior in a real assistive-technology fixture.';});
  r.laneEvidence.forEach(x=>{x.verified=true;x.reference='review://assistive/'+x.id;x.finding='Reviewed and accepted fixture observation.';});
  r.reviewDecision='accepted';r.authority.assistiveTechnologyEvidenceAccepted=true;return r;
}
function fillPerformance(){
  const r=clone(performanceTemplate);
  Object.assign(r.review,{reviewedAt:'2026-09-18T20:00:00-05:00',reviewer:'Qualification reviewer',candidateEvidenceReference:'artifact://representative-performance',candidateEvidenceSha256:'sha256:'+'a'.repeat(64),representativeEnvironmentConfirmed:true,authorityIncidentsAbsentConfirmed:true});
  Object.assign(r.environment,{operatingSystem:'Representative OS',runtime:'Representative Runtime',hardware:'Representative Hardware',measurementDate:'2026-09-18'});
  Object.assign(r.samples,{resolver:200,interactionPaint:30,idleFrames:120,activeFrames:240});
  Object.assign(r.measurements,{resolverP95Ms:9.5,resolverP99Ms:16,interactionPaintP95Ms:90,interactionPaintP99Ms:180,idleMedianFrameIntervalMs:16.7,activeFrameP95Ms:20,severeFrameStallRate:0.005,catastrophicForegroundStallCount:0,taskStateResetCount:0,pageReloadRequiredCount:0,automaticAuthorityActionCount:0});
  r.budgetResult='pass';r.laneEvidence[0].verified=true;r.laneEvidence[0].reference='review://performance/accepted';r.laneEvidence[0].finding='Reviewed representative measurement fixture passes the governed budget.';
  r.reviewDecision='accepted';r.authority.performanceEvidenceAccepted=true;return r;
}

const liveStable=read('VERSION').trim();
assert(lifecycle.currentOfficial===liveStable&&lifecycle.currentStable===liveStable,'VERSION/current Stable authority must agree');
const liveRelease=lifecycle.releases.find(item=>item.version===liveStable);
assert(liveRelease&&liveRelease.status==='stable'&&liveRelease.consumerEligible===true,'live current Stable must remain a consumer-eligible Stable release');
const liveTuple=liveStable.split('.').slice(0,3).map(Number);
assert(liveTuple.length===3&&liveTuple.every(Number.isInteger),'live Stable must use major.minor.patch versioning');
assert(
  liveTuple[0]>1 || (liveTuple[0]===1 && (liveTuple[1]>5 || (liveTuple[1]===5 && liveTuple[2]>=1))),
  'V1.6 retained qualification requires live Stable authority at or after its frozen 1.5.1 baseline'
);
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'retained V1.6 evidence tooling must not create an active lifecycle candidate');
assert(JSON.stringify(acceptance.evidenceRequirements['assistive-technology'])==='[["assistive-technology"]]','Assistive Technology acceptance requirement drifted');
assert(JSON.stringify(acceptance.evidenceRequirements.performance)==='[["performance"]]','Performance acceptance requirement drifted');
assert(JSON.stringify(acceptance.evidenceRequirements.accessibility)==='[["machine"],["human","assistive-technology"]]','Accessibility grouped requirement drifted');

validateTemplate(humanTemplate,'humanEvidenceAccepted');
validateTemplate(atTemplate,'assistiveTechnologyEvidenceAccepted');
validateTemplate(performanceTemplate,'performanceEvidenceAccepted');

const humanEvidence=validateHuman(fillHuman());
const humanMatrix=createGlazeV16AcceptanceMatrix({exactRevision:SOURCE,evidence:[
  {id:'accessibility',verified:true,revision:SOURCE,evidenceType:'machine',reference:'fixture://machine/accessibility'},
  {id:'keyboard-navigation',verified:true,revision:SOURCE,evidenceType:'machine',reference:'fixture://machine/keyboard'},
  {id:'privacy-boundaries',verified:true,revision:SOURCE,evidenceType:'machine',reference:'fixture://machine/privacy'},
  {id:'authority-boundaries',verified:true,revision:SOURCE,evidenceType:'machine',reference:'fixture://machine/authority'},
  {id:'representative-rendering',verified:true,revision:SOURCE,evidenceType:'rendered',reference:'fixture://rendered/representative'},
  ...humanEvidence
]});
for(const id of humanPlan.lanes)assert(humanMatrix.lanes.find(x=>x.id===id).status==='verified','accepted human record did not satisfy lane with prerequisites: '+id);

const atEvidence=validateAssistiveTechnology(fillAt());
const atMatrix=createGlazeV16AcceptanceMatrix({exactRevision:SOURCE,evidence:[
  {id:'accessibility',verified:true,revision:SOURCE,evidenceType:'machine',reference:'fixture://machine/accessibility'},
  ...atEvidence
]});
assert(atMatrix.lanes.find(x=>x.id==='assistive-technology').status==='verified','accepted assistive-technology record must satisfy dedicated lane');
assert(atMatrix.lanes.find(x=>x.id==='accessibility').status==='verified','accepted assistive-technology accessibility observation may satisfy Accessibility alternative');

const performanceEvidence=validatePerformance(fillPerformance());
const performanceMatrix=createGlazeV16AcceptanceMatrix({exactRevision:SOURCE,evidence:performanceEvidence});
assert(performanceMatrix.lanes.find(x=>x.id==='performance').status==='verified','accepted performance record must satisfy Performance lane');
for(const matrix of [humanMatrix,atMatrix,performanceMatrix])assert(matrix.authority.lifecyclePromotionAutomatic===false&&matrix.authority.stableStatusGranted===false,'external evidence must never auto-promote lifecycle');

const args=process.argv.slice(2);
if(args.length){
  for(const file of args){
    const record=json(file);
    const validator=validators.get(record.recordId);
    assert(validator,'unsupported V1.6 external evidence record: '+record.recordId);
    const acceptedEvidence=validator(record);
    console.log(JSON.stringify({file,acceptedEvidence},null,2));
  }
}else{
  console.log('GLAZE UI V1.6 external evidence record control: PASS');
  console.log('Frozen source: '+SOURCE);
  console.log('Human template self-authorizing: false');
  console.log('Assistive-technology template self-authorizing: false');
  console.log('Performance template self-authorizing: false');
  console.log('Accepted fixture lifecycle promotion automatic: false');
  console.log('Stable baseline preserved: '+STABLE);
}
