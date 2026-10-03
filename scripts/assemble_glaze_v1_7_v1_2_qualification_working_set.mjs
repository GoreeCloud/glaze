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
function deepGet(value,key){
  return value && Object.prototype.hasOwnProperty.call(value,key)?value[key]:undefined;
}
function assertObjectSubset(actual,expected,label){
  for(const [key,value] of Object.entries(expected||{})){
    assert.deepEqual(actual?.[key],value,label+' mismatch for '+key);
  }
}
function validatePlan(plan){
  assert.equal(plan.schemaVersion,1);
  assert.equal(plan.planId,'goreecloud.glaze.v1.7.v1.2.qualification-working-set');
  assert.equal(plan.lifecycle,'DevelopmentQualification');
  assert.equal(plan.sourceRevision,SOURCE);
  assert.equal(plan.sourceModelVersion,SOURCE_MODEL);
  assert.equal(plan.acceptanceModelVersion,ACCEPTANCE_MODEL);
  assert.equal(plan.stableBaseline,'1.6.0');
  assert.equal(plan.consumerEligible,false);
  assert.equal(plan.networkPolicy,'repository-local-only');

  assert.equal(glazeV17AcceptanceDevelopmentContract.version,ACCEPTANCE_MODEL);
  assert.equal(glazeV17AcceptanceDevelopmentContract.planVersion,'v1.2');
  assert.equal(glazeV17AcceptanceDevelopmentContract.laneCount,37);

  const laneMap=new Map(glazeV17AcceptanceDevelopmentContract.acceptanceLanes.map(lane=>[lane.id,lane]));
  const machinePlan=readJson('contracts/v1.7/qualification.v1.2.machine.plan.json');
  assert.equal(machinePlan.sourceRevision,SOURCE);
  assert.equal(machinePlan.acceptanceModelVersion,ACCEPTANCE_MODEL);
  assert.equal(machinePlan.expectedMachineLaneIds.length,plan.expectedMachineEvidenceRecordCount);

  assert.equal(plan.renderedBridgeMappings.length,plan.expectedRenderedEvidenceRecordCount);
  const bridgeIds=plan.renderedBridgeMappings.map(item=>item.id);
  assert.equal(new Set(bridgeIds).size,bridgeIds.length);
  for(const mapping of plan.renderedBridgeMappings){
    const lane=laneMap.get(mapping.id);
    assert.ok(lane,'unknown rendered bridge lane: '+mapping.id);
    assert.ok(lane.evidenceTypes.includes('rendered'),'lane does not accept rendered evidence: '+mapping.id);
    assert.equal(typeof mapping.finding,'string');
    assert.ok(mapping.finding.length>=40,'rendered bridge finding is too short: '+mapping.id);
    assert.ok(mapping.requireAllManifestScenes===true || (Array.isArray(mapping.scenes)&&mapping.scenes.length>=1),'rendered bridge has no scenes: '+mapping.id);
  }

  const provenance=laneMap.get('artifact-provenance');
  assert.ok(provenance?.evidenceTypes.includes('provenance'));
  assert.equal(plan.expectedProvenanceEvidenceRecordCount,1);
  assert.equal(
    plan.expectedMachineEvidenceRecordCount+plan.expectedRenderedEvidenceRecordCount+plan.expectedProvenanceEvidenceRecordCount,
    plan.expectedCombinedEvidenceRecordCount
  );
  assert.equal(plan.expectedMatrixExternallyVerifiedLaneIds.length,plan.expectedMatrixExternallyVerifiedCount);
  assert.equal(plan.expectedMatrixExternallyVerifiedCount+plan.expectedMatrixUnverifiedCount,37);

  assert.equal(plan.authority.workingSetOnly,true);
  for(const key of [
    'governedReviewAcceptanceClaimed','section46CompleteClaimed','v17AcceptanceClaimed',
    'anchorStatusGranted','consumerEligibilityGranted','deploymentAcceptanceGranted',
    'productionAcceptanceGranted','lifecyclePromotionAutomatic'
  ]) assert.equal(plan.authority[key],false,key);
  return {laneMap,machinePlan};
}

function validateScene(scene,sceneManifest,scenePlan){
  assert.equal(scene.schemaVersion,1);
  assert.equal(scene.passed,true,'scene did not pass: '+scenePlan.id);
  assert.equal(scene.scene,scenePlan.id,'scene identity mismatch: '+scenePlan.id);
  assert.equal(scene.sourceRevisionParameter,SOURCE,'scene source mismatch: '+scenePlan.id);
  assert.equal(scene.aggregateVersion,SOURCE_MODEL,'scene aggregate mismatch: '+scenePlan.id);
  assert.equal(scene.qualificationModelVersion,SOURCE_MODEL,'scene model mismatch: '+scenePlan.id);
  assert.equal(scene.stableBaseline,'1.6.0','scene stable baseline mismatch: '+scenePlan.id);
  assert.equal(scene.authority?.renderedBrowserOnly,true,'scene rendered authority missing: '+scenePlan.id);
  for(const key of [
    'humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed','physicalDeviceEvidenceClaimed',
    'nativePlatformEvidenceClaimed','providerIntegrationEvidenceClaimed',
    'privacySecurityIntegrationEvidenceClaimed','representativePerformanceEvidenceClaimed',
    'energyEvidenceClaimed','crossPlatformEvidenceClaimed','regressionBaselineClaimed',
    'section48AcceptanceClaimed','v17AcceptanceClaimed','anchorStatusGranted',
    'lifecyclePromotionAutomatic'
  ]) assert.equal(scene.authority?.[key],false,'scene authority drift: '+scenePlan.id+' / '+key);

  for(const key of scenePlan.requiredAssertions||[]){
    assert.equal(scene.assertions?.[key],true,'required rendered assertion failed: '+scenePlan.id+' / '+key);
  }
  if(scenePlan.expectedViewport){
    assert.deepEqual([scene.viewport?.width,scene.viewport?.height],scenePlan.expectedViewport,'viewport mismatch: '+scenePlan.id);
  }
  assertObjectSubset(scene.sceneData,scenePlan.expectedSceneData,'scene data '+scenePlan.id);
  assertObjectSubset(scene.computed,scenePlan.expectedComputed,'computed data '+scenePlan.id);
  for(const [key,value] of Object.entries(scenePlan.expectedSceneDataIncludes||{})){
    assert.ok(Array.isArray(scene.sceneData?.[key])&&scene.sceneData[key].includes(value),'scene data inclusion mismatch: '+scenePlan.id+' / '+key);
  }
  if(scenePlan.expectedMediaFeature){
    assert.ok(
      Array.isArray(sceneManifest.mediaFeatures)&&sceneManifest.mediaFeatures.some(item=>
        item.name===scenePlan.expectedMediaFeature.name&&item.value===scenePlan.expectedMediaFeature.value
      ),
      'media feature mismatch: '+scenePlan.id
    );
  }
  assert.equal(sceneManifest.passed,true,'manifest scene not passed: '+scenePlan.id);
  return {
    id:scenePlan.id,
    evidenceSha256:sceneManifest.evidenceSha256,
    screenshotSha256:sceneManifest.screenshotSha256,
    pixelSha256:sceneManifest.pixelSha256,
    viewport:sceneManifest.viewport,
    mobile:sceneManifest.mobile,
    mediaFeatures:sceneManifest.mediaFeatures||[]
  };
}

function assemble({planFile,machineFile,renderedDir,provenanceFile,outDir}){
  const plan=readJson(planFile);
  const {machinePlan}=validatePlan(plan);
  const machine=readJson(machineFile);
  assert.ok(Array.isArray(machine));
  assert.equal(machine.length,plan.expectedMachineEvidenceRecordCount);
  assert.deepEqual(sorted(machine.map(item=>item.id)),sorted(machinePlan.expectedMachineLaneIds));
  for(const item of machine){
    assert.equal(item.verified,true);
    assert.equal(item.revision,SOURCE);
    assert.equal(item.evidenceType,'machine');
    assert.match(item.reference,/^evidence\+sha256:[0-9a-f]{64}:v1\.7\/v1\.2-machine\/[A-Za-z0-9_-]+\.log$/);
  }

  const renderedManifestFile=path.join(renderedDir,'manifest.json');
  const renderedManifest=readJson(renderedManifestFile);
  assert.equal(renderedManifest.sourceRevision,SOURCE);
  assert.equal(renderedManifest.acceptanceModelVersion,SOURCE_MODEL);
  assert.equal(renderedManifest.stableBaseline,'1.6.0');
  assert.equal(renderedManifest.sceneCount,14);
  assert.equal(renderedManifest.passed,true);
  assert.equal(renderedManifest.authority?.renderedBrowserOnly,true);
  assert.equal(renderedManifest.authority?.regressionBaselineClaimed,false);
  const manifestSceneMap=new Map(renderedManifest.scenes.map(scene=>[scene.id,scene]));

  const bridgeDir=path.join(outDir,'rendered-bridge');
  fs.mkdirSync(bridgeDir,{recursive:true});
  const renderedEvidence=[];
  for(const mapping of plan.renderedBridgeMappings){
    const selected=[];
    if(mapping.requireAllManifestScenes===true){
      assert.equal(renderedManifest.scenes.length,14,'representative rendering requires all fourteen manifest scenes');
      for(const manifestScene of renderedManifest.scenes){
        const scene=readJson(path.join(renderedDir,manifestScene.evidence));
        validateScene(scene,manifestScene,{id:manifestScene.id,requiredAssertions:mapping.requiredAssertionsForAllScenes||[]});
        selected.push({
          id:manifestScene.id,
          evidenceSha256:manifestScene.evidenceSha256,
          screenshotSha256:manifestScene.screenshotSha256,
          pixelSha256:manifestScene.pixelSha256,
          viewport:manifestScene.viewport,
          mobile:manifestScene.mobile,
          mediaFeatures:manifestScene.mediaFeatures||[]
        });
      }
    }else{
      for(const scenePlan of mapping.scenes){
        const manifestScene=manifestSceneMap.get(scenePlan.id);
        assert.ok(manifestScene,'rendered manifest missing scene: '+scenePlan.id);
        const scene=readJson(path.join(renderedDir,manifestScene.evidence));
        selected.push(validateScene(scene,manifestScene,scenePlan));
      }
    }

    const bridge={
      schemaVersion:1,
      recordType:'glaze-v1.7-retained-v1.2-rendered-evidence-bridge',
      lifecycle:'DevelopmentQualification',
      laneId:mapping.id,
      sourceRevision:SOURCE,
      sourceModelVersion:SOURCE_MODEL,
      acceptanceModelVersion:ACCEPTANCE_MODEL,
      stableBaseline:'1.6.0',
      evidenceType:'rendered',
      finding:mapping.finding,
      sourceRenderedArtifact:{
        recordType:renderedManifest.recordType,
        toolingRevision:renderedManifest.toolingRevision,
        observedAt:renderedManifest.observedAt,
        browser:renderedManifest.browser,
        manifestSha256:sha256(renderedManifestFile)
      },
      scenes:selected,
      authority:{
        renderedBrowserOnly:true,
        humanEvidenceClaimed:false,
        assistiveTechnologyEvidenceClaimed:false,
        physicalDeviceEvidenceClaimed:false,
        nativePlatformEvidenceClaimed:false,
        representativePerformanceEvidenceClaimed:false,
        regressionBaselineClaimed:false,
        governedReviewAcceptanceClaimed:false,
        v17AcceptanceClaimed:false,
        anchorStatusGranted:false
      }
    };
    const bridgeFile=path.join(bridgeDir,mapping.id+'.json');
    writeJson(bridgeFile,bridge);
    const digest=sha256(bridgeFile);
    renderedEvidence.push({
      id:mapping.id,
      verified:true,
      revision:SOURCE,
      evidenceType:'rendered',
      reference:'evidence+sha256:'+digest+':v1.7/v1.2-working-set/rendered-bridge/'+mapping.id+'.json'
    });
  }
  assert.equal(renderedEvidence.length,plan.expectedRenderedEvidenceRecordCount);

  const provenance=readJson(provenanceFile);
  assert.ok(Array.isArray(provenance));
  assert.equal(provenance.length,plan.expectedProvenanceEvidenceRecordCount);
  assert.equal(provenance[0].id,'artifact-provenance');
  assert.equal(provenance[0].verified,true);
  assert.equal(provenance[0].revision,SOURCE);
  assert.equal(provenance[0].evidenceType,'provenance');
  assert.match(provenance[0].reference,/^evidence\+sha256:[0-9a-f]{64}:v1\.7\/v1\.3-provenance\/provenance\.json$/);

  const combined=[...machine,...renderedEvidence,...provenance];
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

  const combinedFile=path.join(outDir,'combined-evidence.json');
  writeJson(combinedFile,combined);
  const summary={
    schemaVersion:1,
    recordType:'glaze-v1.7-retained-v1.2-qualification-working-set-summary',
    lifecycle:'DevelopmentQualification',
    sourceRevision:SOURCE,
    sourceModelVersion:SOURCE_MODEL,
    acceptanceModelVersion:ACCEPTANCE_MODEL,
    stableBaseline:'1.6.0',
    evidenceRecordCounts:{
      machine:machine.length,
      rendered:renderedEvidence.length,
      provenance:provenance.length,
      combined:combined.length
    },
    matrix:{
      laneCount:matrix.laneCount,
      externallyVerifiedCount:matrix.externallyVerifiedCount,
      externallyVerifiedLaneIds:verifiedIds,
      notApplicableJustifiedCount:matrix.notApplicableJustifiedCount,
      unverifiedCount:matrix.unverifiedCount,
      evidenceInventoryComplete:matrix.evidenceInventoryComplete,
      readyForGovernedQualificationReview:matrix.readyForGovernedQualificationReview,
      blockingLaneIds:matrix.blockingLaneIds,
      lanes:matrix.lanes.map(lane=>({
        id:lane.id,
        label:lane.label,
        status:lane.status,
        satisfiedEvidenceGroupCount:lane.satisfiedEvidenceGroupCount,
        requiredEvidenceGroups:lane.requiredEvidenceGroups,
        missingEvidenceGroups:(lane.evidenceGroupResults||[])
          .filter(group=>!group.satisfied)
          .map(group=>group.allowedEvidenceTypes),
        failureReason:lane.failureReason
      }))
    },
    authority:{
      workingSetOnly:true,
      governedReviewAcceptanceClaimed:false,
      section46CompleteClaimed:false,
      v17AcceptanceClaimed:false,
      anchorStatusGranted:false,
      consumerEligibilityGranted:false,
      deploymentAcceptanceGranted:false,
      productionAcceptanceGranted:false,
      lifecyclePromotionAutomatic:false
    }
  };
  const summaryFile=path.join(outDir,'matrix-summary.json');
  writeJson(summaryFile,summary);

  const manifest={
    schemaVersion:1,
    recordType:'glaze-v1.7-retained-v1.2-qualification-working-set',
    lifecycle:'DevelopmentQualification',
    sourceRevision:SOURCE,
    sourceModelVersion:SOURCE_MODEL,
    acceptanceModelVersion:ACCEPTANCE_MODEL,
    stableBaseline:'1.6.0',
    plan:path.relative(root,path.isAbsolute(planFile)?planFile:path.join(root,planFile)),
    inputs:{
      machine:{path:path.relative(root,path.isAbsolute(machineFile)?machineFile:path.join(root,machineFile)),sha256:sha256(machineFile)},
      renderedManifest:{path:path.relative(root,renderedManifestFile),sha256:sha256(renderedManifestFile)},
      provenance:{path:path.relative(root,path.isAbsolute(provenanceFile)?provenanceFile:path.join(root,provenanceFile)),sha256:sha256(provenanceFile)}
    },
    outputs:{
      combinedEvidence:{path:'combined-evidence.json',sha256:sha256(combinedFile)},
      matrixSummary:{path:'matrix-summary.json',sha256:sha256(summaryFile)},
      renderedBridgeLaneIds:renderedEvidence.map(item=>item.id)
    },
    matrixExternallyVerifiedLaneIds:verifiedIds,
    matrixExternallyVerifiedCount:matrix.externallyVerifiedCount,
    matrixUnverifiedCount:matrix.unverifiedCount,
    evidenceInventoryComplete:false,
    readyForGovernedQualificationReview:false,
    authority:summary.authority
  };
  const manifestFile=path.join(outDir,'manifest.json');
  writeJson(manifestFile,manifest);
  return {manifest,summary};
}

const args=process.argv.slice(2);
const planFile=arg('--plan',args)||PLAN_DEFAULT;
const plan=readJson(planFile);
validatePlan(plan);

if(args.includes('--plan-only')){
  console.log('Glaze V1.7 retained-v1.2 qualification working-set plan: PASS');
  console.log('Rendered bridge lanes: '+plan.expectedRenderedEvidenceRecordCount);
  console.log('Expected matrix-complete evidence lanes: '+plan.expectedMatrixExternallyVerifiedCount);
  console.log('Boundary: working-set completeness is not governed review acceptance or lifecycle promotion.');
}else{
  const machineFile=arg('--machine',args);
  const renderedDir=arg('--rendered',args);
  const provenanceFile=arg('--provenance',args);
  const outDir=arg('--out',args);
  assert.ok(machineFile&&renderedDir&&provenanceFile&&outDir,'--machine, --rendered, --provenance, and --out are required');
  const result=assemble({
    planFile:path.isAbsolute(planFile)?planFile:path.join(root,planFile),
    machineFile:path.isAbsolute(machineFile)?machineFile:path.join(root,machineFile),
    renderedDir:path.isAbsolute(renderedDir)?renderedDir:path.join(root,renderedDir),
    provenanceFile:path.isAbsolute(provenanceFile)?provenanceFile:path.join(root,provenanceFile),
    outDir:path.isAbsolute(outDir)?outDir:path.join(root,outDir)
  });
  console.log('Glaze V1.7 retained-v1.2 qualification working set: PASS');
  console.log('Combined evidence records: '+result.summary.evidenceRecordCounts.combined);
  console.log('Matrix externally verified evidence lanes: '+result.summary.matrix.externallyVerifiedCount);
  console.log('Matrix unverified lanes: '+result.summary.matrix.unverifiedCount);
  console.log('Boundary: no governed review acceptance, Section 46 completion, V1.7 acceptance, or Anchor promotion is established.');
}
