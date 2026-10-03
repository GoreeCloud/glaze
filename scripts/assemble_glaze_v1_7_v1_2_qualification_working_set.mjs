#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  createGlazeV17AcceptanceMatrix,
  glazeV17AcceptanceDevelopmentContract
} from '../js/glaze-v1.7-acceptance.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='4b9d085a5177b96cc31d4270b38d792a59872e37';
const SOURCE_MODEL='1.7.0-dev.47';
const ACCEPTANCE_MODEL='1.7.0-dev.39';
const PLAN_DEFAULT='contracts/v1.7/qualification.v1.2.working-set.plan.json';
const CURRENT_STABLE_BASELINE='1.7.0';
const HISTORICAL_SOURCE_STABLE_BASELINE='1.6.0';

function readJson(file){
  return JSON.parse(fs.readFileSync(path.isAbsolute(file)?file:path.join(root,file),'utf8'));
}
function sha256(file){
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function writeJson(file,value){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8');
}
function sorted(values){return [...values].sort();}
function arg(name,args){
  const index=args.indexOf(name);
  return index>=0?args[index+1]:null;
}

function validateEvidenceRecord(item,type,allowedIds,referencePattern){
  assert.ok(item&&typeof item==='object'&&!Array.isArray(item),'evidence item must be an object');
  assert.ok(allowedIds.has(item.id),'unexpected '+type+' evidence lane: '+item.id);
  assert.equal(item.verified,true,'evidence not verified: '+item.id);
  assert.equal(item.revision,SOURCE,'evidence revision mismatch: '+item.id);
  assert.equal(item.evidenceType,type,'evidence type mismatch: '+item.id);
  assert.match(item.reference,referencePattern,'evidence reference mismatch: '+item.id);
}

function validatePlan(plan){
  assert.equal(plan.schemaVersion,1);
  assert.equal(plan.planId,'goreecloud.glaze.v1.7.1.v1.2.qualification-working-set');
  assert.equal(plan.successorReleaseLine,'1.7.1');
  assert.equal(plan.developmentIdentity,'1.7.1-dev.1');
  assert.equal(plan.lifecycle,'DevelopmentQualification');
  assert.equal(plan.sourceRevision,SOURCE);
  assert.equal(plan.sourceModelVersion,SOURCE_MODEL);
  assert.equal(plan.acceptanceModelVersion,ACCEPTANCE_MODEL);
  assert.equal(plan.stableBaseline,CURRENT_STABLE_BASELINE);
  assert.equal(plan.historicalSourceStableBaseline,HISTORICAL_SOURCE_STABLE_BASELINE);
  assert.equal(plan.consumerEligible,false);
  assert.equal(plan.networkPolicy,'repository-local-only');

  assert.equal(glazeV17AcceptanceDevelopmentContract.version,ACCEPTANCE_MODEL);
  assert.equal(glazeV17AcceptanceDevelopmentContract.planVersion,'v1.2');
  assert.equal(glazeV17AcceptanceDevelopmentContract.laneCount,37);

  const machinePlan=readJson('contracts/v1.7/qualification.v1.2.machine.plan.json');
  const renderedPlan=readJson('contracts/v1.7/qualification.v1.2.rendered.plan.json');
  assert.equal(machinePlan.sourceRevision,SOURCE);
  assert.equal(machinePlan.acceptanceModelVersion,ACCEPTANCE_MODEL);
  assert.equal(renderedPlan.sourceRevision,SOURCE);
  assert.equal(renderedPlan.sourceModelVersion,SOURCE_MODEL);
  assert.equal(renderedPlan.acceptanceModelVersion,ACCEPTANCE_MODEL);
  assert.equal(machinePlan.expectedMachineLaneIds.length,plan.expectedMachineEvidenceRecordCount);
  assert.equal(renderedPlan.eligibleRenderedEvidenceLaneIds.length,plan.expectedRenderedEvidenceRecordCount);
  assert.deepEqual(renderedPlan.openRenderedEvidenceLaneIds,plan.historicalRenderedOpenEvidenceLaneIds);
  assert.deepEqual(plan.openRenderedEvidenceLaneIds,[]);
  assert.equal(plan.expectedRegressionRenderedEvidenceRecordCount,1);
  assert.equal(plan.expectedProvenanceEvidenceRecordCount,1);
  assert.equal(
    plan.expectedMachineEvidenceRecordCount+
    plan.expectedRenderedEvidenceRecordCount+
    plan.expectedRegressionRenderedEvidenceRecordCount+
    plan.expectedProvenanceEvidenceRecordCount,
    plan.expectedCombinedEvidenceRecordCount
  );
  assert.equal(plan.expectedMatrixExternallyVerifiedLaneIds.length,plan.expectedMatrixExternallyVerifiedCount);
  assert.equal(plan.expectedMatrixExternallyVerifiedCount+plan.expectedMatrixUnverifiedCount,37);

  const synthetic=[
    ...machinePlan.expectedMachineLaneIds.map(id=>({id,verified:true,revision:SOURCE,evidenceType:'machine',reference:'synthetic://machine/'+id})),
    ...renderedPlan.eligibleRenderedEvidenceLaneIds.map(id=>({id,verified:true,revision:SOURCE,evidenceType:'rendered',reference:'synthetic://rendered/'+id})),
    {id:'regression',verified:true,revision:SOURCE,evidenceType:'rendered',reference:'synthetic://regression'},
    {id:'artifact-provenance',verified:true,revision:SOURCE,evidenceType:'provenance',reference:'synthetic://provenance'}
  ];
  const matrix=createGlazeV17AcceptanceMatrix({exactRevision:SOURCE,evidence:synthetic});
  const verified=matrix.lanes.filter(lane=>lane.status==='externally-verified').map(lane=>lane.id);
  assert.deepEqual(sorted(verified),sorted(plan.expectedMatrixExternallyVerifiedLaneIds));
  assert.equal(matrix.externallyVerifiedCount,plan.expectedMatrixExternallyVerifiedCount);
  assert.equal(matrix.unverifiedCount,plan.expectedMatrixUnverifiedCount);
  assert.equal(matrix.evidenceInventoryComplete,false);
  assert.equal(matrix.readyForGovernedQualificationReview,false);

  assert.equal(plan.authority.workingSetOnly,true);
  for(const key of [
    'governedReviewAcceptanceClaimed','section46CompleteClaimed','v17AcceptanceClaimed',
    'v171AcceptanceClaimed','section48Accepted',
    'anchorStatusGranted','consumerEligibilityGranted','deploymentAcceptanceGranted',
    'productionAcceptanceGranted','lifecyclePromotionAutomatic'
  ])assert.equal(plan.authority[key],false,key);

  return {machinePlan,renderedPlan};
}

function assemble({planFile,machineFile,renderedDir,regressionFile,provenanceFile,outDir}){
  const plan=readJson(planFile);
  const {machinePlan,renderedPlan}=validatePlan(plan);

  const machine=readJson(machineFile);
  assert.ok(Array.isArray(machine));
  assert.equal(machine.length,plan.expectedMachineEvidenceRecordCount);
  assert.deepEqual(sorted(machine.map(item=>item.id)),sorted(machinePlan.expectedMachineLaneIds));
  const machineIds=new Set(machinePlan.expectedMachineLaneIds);
  for(const item of machine){
    validateEvidenceRecord(item,'machine',machineIds,/^evidence\+sha256:[0-9a-f]{64}:v1\.7\/v1\.2-machine\/[A-Za-z0-9_-]+\.log$/);
  }

  const renderedEvidenceFile=path.join(renderedDir,'rendered-evidence.json');
  const renderedManifestFile=path.join(renderedDir,'manifest.json');
  const rendered=readJson(renderedEvidenceFile);
  const renderedManifest=readJson(renderedManifestFile);
  assert.ok(Array.isArray(rendered));
  assert.equal(rendered.length,plan.expectedRenderedEvidenceRecordCount);
  assert.deepEqual(sorted(rendered.map(item=>item.id)),sorted(renderedPlan.eligibleRenderedEvidenceLaneIds));
  const renderedIds=new Set(renderedPlan.eligibleRenderedEvidenceLaneIds);
  for(const item of rendered){
    validateEvidenceRecord(item,'rendered',renderedIds,/^evidence\+sha256:[0-9a-f]{64}:v1\.7\/v1\.2-rendered\/[A-Za-z0-9_-]+\.json$/);
  }

  assert.equal(renderedManifest.recordType,'glaze-v1.7-v1.2-rendered-browser-capture');
  assert.equal(renderedManifest.sourceRevision,SOURCE);
  assert.equal(renderedManifest.sourceModelVersion,SOURCE_MODEL);
  assert.equal(renderedManifest.acceptanceModelVersion,ACCEPTANCE_MODEL);
  assert.equal(renderedManifest.stableBaseline,'1.6.0');
  assert.equal(renderedManifest.sceneCount,22);
  assert.equal(renderedManifest.passed,true);
  assert.deepEqual(renderedManifest.openRenderedEvidenceLaneIds,plan.historicalRenderedOpenEvidenceLaneIds);
  assert.deepEqual(sorted(renderedManifest.renderedEvidenceLaneIds),sorted(renderedPlan.eligibleRenderedEvidenceLaneIds));
  assert.equal(renderedManifest.authority?.renderedBrowserOnly,true);
  assert.equal(renderedManifest.authority?.regressionBaselineClaimed,false);
  for(const key of [
    'humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed','physicalDeviceEvidenceClaimed',
    'nativePlatformEvidenceClaimed','representativePerformanceEvidenceClaimed',
    'energyEvidenceClaimed','v12QualificationClaimed','section46CompleteClaimed',
    'v17AcceptanceClaimed','anchorStatusGranted','consumerEligibilityGranted',
    'deploymentAcceptanceGranted','productionAcceptanceGranted','lifecyclePromotionAutomatic'
  ])assert.equal(renderedManifest.authority?.[key],false,'rendered authority drift: '+key);

  const sceneMap=new Map(renderedManifest.scenes.map(scene=>[scene.id,scene]));
  assert.equal(sceneMap.size,22);
  for(const item of rendered){
    const scene=sceneMap.get(item.id);
    assert.ok(scene,'rendered manifest missing scene: '+item.id);
    assert.equal(scene.passed,true,'rendered scene did not pass: '+item.id);
    assert.equal(scene.laneIds.length,1,'rendered scene lane mapping drift: '+item.id);
    assert.equal(scene.laneIds[0],item.id,'rendered scene lane mismatch: '+item.id);
    const expected='evidence+sha256:'+scene.evidenceSha256+':v1.7/v1.2-rendered/'+item.id+'.json';
    assert.equal(item.reference,expected,'rendered content-address mismatch: '+item.id);
  }
  assert.equal(rendered.some(item=>item.id==='regression'),false,'historical rendered capture must not invent Regression evidence');

  const regressionRecord=readJson(regressionFile);
  assert.equal(regressionRecord.sourceRevision,SOURCE);
  assert.equal(regressionRecord.stableBaseline,CURRENT_STABLE_BASELINE);
  assert.equal(regressionRecord.historicalSourceStableBaseline,HISTORICAL_SOURCE_STABLE_BASELINE);
  assert.equal(regressionRecord.authority?.historicalSourceEvidenceOnly,true);
  assert.equal(regressionRecord.authority?.v171AcceptanceClaimed,false);
  assert.equal(regressionRecord.regressionEvidence.length,plan.expectedRegressionRenderedEvidenceRecordCount);
  const regression=regressionRecord.regressionEvidence;
  validateEvidenceRecord(regression[0],'rendered',new Set(['regression']),/^evidence\+sha256:[0-9a-f]{64}:v1\.7\/v1\.2-regression\/regression-result\.json$/);

  const provenance=readJson(provenanceFile);
  assert.ok(Array.isArray(provenance));
  assert.equal(provenance.length,plan.expectedProvenanceEvidenceRecordCount);
  assert.equal(provenance[0].id,'artifact-provenance');
  assert.equal(provenance[0].verified,true);
  assert.equal(provenance[0].revision,SOURCE);
  assert.equal(provenance[0].evidenceType,'provenance');
  assert.match(provenance[0].reference,/^evidence\+sha256:[0-9a-f]{64}:v1\.7\/v1\.3-provenance\/provenance\.json$/);

  const combined=[...machine,...rendered,...regression,...provenance];
  assert.equal(combined.length,plan.expectedCombinedEvidenceRecordCount);
  const matrix=createGlazeV17AcceptanceMatrix({exactRevision:SOURCE,evidence:combined});
  const verifiedIds=matrix.lanes.filter(lane=>lane.status==='externally-verified').map(lane=>lane.id);
  assert.deepEqual(sorted(verifiedIds),sorted(plan.expectedMatrixExternallyVerifiedLaneIds));
  assert.equal(matrix.externallyVerifiedCount,plan.expectedMatrixExternallyVerifiedCount);
  assert.equal(matrix.notApplicableJustifiedCount,0);
  assert.equal(matrix.unverifiedCount,plan.expectedMatrixUnverifiedCount);
  assert.equal(matrix.evidenceInventoryComplete,false);
  assert.equal(matrix.readyForGovernedQualificationReview,false);
  assert.equal(matrix.authority.v17AcceptanceEstablished,false);
  assert.equal(matrix.authority.stableStatusGranted,false);
  assert.equal(matrix.authority.consumerEligibilityGranted,false);

  fs.mkdirSync(outDir,{recursive:true});
  const combinedFile=path.join(outDir,'combined-evidence.json');
  writeJson(combinedFile,combined);
  const summary={
    schemaVersion:1,
    recordType:'glaze-v1.7.1-retained-v1.2-qualification-working-set-summary',
    lifecycle:'DevelopmentQualification',
    sourceRevision:SOURCE,
    sourceModelVersion:SOURCE_MODEL,
    acceptanceModelVersion:ACCEPTANCE_MODEL,
    stableBaseline:CURRENT_STABLE_BASELINE,
    historicalSourceStableBaseline:HISTORICAL_SOURCE_STABLE_BASELINE,
    successorReleaseLine:'1.7.1',
    developmentIdentity:'1.7.1-dev.1',
    evidenceRecordCounts:{
      machine:machine.length,
      historicalRendered:rendered.length,
      regressionRendered:regression.length,
      provenance:provenance.length,
      combined:combined.length
    },
    rendered:{
      sceneCount:renderedManifest.sceneCount,
      historicalOpenLaneIds:plan.historicalRenderedOpenEvidenceLaneIds,
      currentOpenLaneIds:plan.openRenderedEvidenceLaneIds,
      evidenceRecordSha256:sha256(renderedEvidenceFile),
      manifestSha256:sha256(renderedManifestFile)
    },
    matrix:{
      externallyVerifiedCount:matrix.externallyVerifiedCount,
      externallyVerifiedLaneIds:verifiedIds,
      unverifiedCount:matrix.unverifiedCount,
      blockingLaneIds:matrix.blockingLaneIds,
      evidenceInventoryComplete:matrix.evidenceInventoryComplete,
      readyForGovernedQualificationReview:matrix.readyForGovernedQualificationReview
    },
    authority:{...plan.authority}
  };
  const summaryFile=path.join(outDir,'matrix-summary.json');
  writeJson(summaryFile,summary);
  const manifest={
    schemaVersion:1,
    recordType:'glaze-v1.7.1-retained-v1.2-qualification-working-set',
    lifecycle:'DevelopmentQualification',
    sourceRevision:SOURCE,
    sourceModelVersion:SOURCE_MODEL,
    acceptanceModelVersion:ACCEPTANCE_MODEL,
    stableBaseline:CURRENT_STABLE_BASELINE,
    historicalSourceStableBaseline:HISTORICAL_SOURCE_STABLE_BASELINE,
    successorReleaseLine:'1.7.1',
    developmentIdentity:'1.7.1-dev.1',
    machineEvidenceSha256:sha256(machineFile),
    renderedEvidenceSha256:sha256(renderedEvidenceFile),
    renderedManifestSha256:sha256(renderedManifestFile),
    regressionEvidenceRecordSha256:sha256(regressionFile),
    provenanceEvidenceSha256:sha256(provenanceFile),
    combinedEvidenceSha256:sha256(combinedFile),
    matrixSummarySha256:sha256(summaryFile),
    matrixExternallyVerifiedCount:matrix.externallyVerifiedCount,
    matrixUnverifiedCount:matrix.unverifiedCount,
    evidenceInventoryComplete:matrix.evidenceInventoryComplete,
    readyForGovernedQualificationReview:matrix.readyForGovernedQualificationReview,
    authority:{...plan.authority}
  };
  writeJson(path.join(outDir,'manifest.json'),manifest);
  return {manifest,summary};
}

const args=process.argv.slice(2);
const planFile=arg('--plan',args)||PLAN_DEFAULT;
const plan=readJson(planFile);
validatePlan(plan);
if(args.includes('--plan-only')){
  console.log('Glaze V1.7.1 retained-v1.2 qualification working-set plan validation: PASS');
  console.log('Expected combined evidence records: '+plan.expectedCombinedEvidenceRecordCount);
  console.log('Expected fully satisfied lanes: '+plan.expectedMatrixExternallyVerifiedCount+' / 37');
  console.log('Current open rendered lanes: '+(plan.openRenderedEvidenceLaneIds.join(', ')||'none'));
  console.log('Historical rendered capture open lane: '+plan.historicalRenderedOpenEvidenceLaneIds.join(', '));
  process.exit(0);
}

const machineFile=arg('--machine',args)||plan.inputs.machineEvidence;
const renderedDir=arg('--rendered',args)||path.dirname(plan.inputs.renderedEvidence);
const regressionFile=arg('--regression',args)||plan.inputs.regressionEvidenceRecord;
const provenanceFile=arg('--provenance',args)||plan.inputs.provenanceEvidence;
const outDir=path.resolve(root,arg('--out',args)||'artifacts/v1.7-v1.2-working-set/working-set');
const {manifest}=assemble({
  planFile,
  machineFile:path.resolve(root,machineFile),
  renderedDir:path.resolve(root,renderedDir),
  regressionFile:path.resolve(root,regressionFile),
  provenanceFile:path.resolve(root,provenanceFile),
  outDir
});
console.log('Glaze V1.7.1 retained-v1.2 qualification working set: PASS');
console.log('Fully satisfied lanes: '+manifest.matrixExternallyVerifiedCount+' / 37');
console.log('Unverified lanes: '+manifest.matrixUnverifiedCount+' / 37');
console.log('Boundary: historical exact-source evidence working set only; governed review, Section 48, V1.7.1 acceptance, Anchor, consumer, deployment, and production authority remain false.');
