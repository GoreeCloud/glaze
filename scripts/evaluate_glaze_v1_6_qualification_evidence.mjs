#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

import {createGlazeV16AcceptanceMatrix} from '../js/glaze-v1.6-acceptance.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.isAbsolute(rel)?rel:path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const SOURCE='c7509c79256b04b0aa67cb9dd0737d7588e0ae4a';
const MODEL='1.6.0-dev.12';
const STABLE='1.5.1';

const intake=json('contracts/v1.6/qualification-evidence-intake.json');
const lifecycle=json('registry/lifecycle.json');

function runNode(script,args=[]){
  const result=spawnSync(process.execPath,[path.join(root,script),...args],{
    cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']
  });
  if(result.status!==0){
    throw new Error(
      `validator failed: ${script}`+
      (result.stdout?`\nstdout:\n${result.stdout.trim()}`:'')+
      (result.stderr?`\nstderr:\n${result.stderr.trim()}`:'')
    );
  }
  return result.stdout.trim();
}

function validateCanonicalRecord(entry){
  runNode(entry.validator);
  const record=json(entry.path);
  assert(record.sourceRevision===SOURCE,`${entry.type} canonical evidence source revision mismatch`);
  assert(record.acceptanceModelVersion===MODEL,`${entry.type} canonical evidence model mismatch`);
  assert(record.stableBaseline===STABLE,`${entry.type} canonical evidence Stable baseline mismatch`);
  if(entry.type==='machine')return record.machineEvidence;
  if(entry.type==='rendered')return record.renderedEvidence;
  if(entry.type==='rendered-regression')return record.regressionEvidence;
  throw new Error('unsupported canonical evidence type: '+entry.type);
}

function parseArgs(argv){
  const external=[];
  let requireComplete=false;
  let compact=false;
  for(let i=0;i<argv.length;i+=1){
    const arg=argv[i];
    if(arg==='--external'){
      const value=argv[++i];
      assert(value,'--external requires a record path');
      external.push(value);
    }else if(arg==='--require-complete'){
      requireComplete=true;
    }else if(arg==='--compact'){
      compact=true;
    }else if(arg==='--help'){
      console.log('Usage: node scripts/evaluate_glaze_v1_6_qualification_evidence.mjs [--external <record.json>]... [--require-complete] [--compact]');
      process.exit(0);
    }else{
      throw new Error('unknown argument: '+arg);
    }
  }
  return {external,requireComplete,compact};
}

function resolveGovernedExternalRecord(recordPath){
  const repositoryRoot=fs.realpathSync(root);
  const acceptanceRoot=fs.realpathSync(path.join(root,'acceptance'));
  const requested=path.resolve(root,recordPath);
  const resolved=fs.realpathSync(requested);
  const relativeToRepository=path.relative(repositoryRoot,resolved);
  const relativeToAcceptance=path.relative(acceptanceRoot,resolved);
  assert(relativeToRepository!==''&&!relativeToRepository.startsWith('..')&&!path.isAbsolute(relativeToRepository),
    'external evidence must resolve inside the governed repository');
  assert(relativeToAcceptance!==''&&!relativeToAcceptance.startsWith('..')&&!path.isAbsolute(relativeToAcceptance),
    'external evidence counted by reconciliation must be a durable repository record under acceptance/');
  assert(fs.statSync(resolved).isFile(),'external evidence must resolve to a regular file');
  const governedRecordPath=relativeToRepository.split(path.sep).join('/');
  const tracked=spawnSync('git',['ls-files','--error-unmatch','--',governedRecordPath],{
    cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']
  });
  assert(tracked.status===0,'external evidence counted by reconciliation must be tracked by Git at the exact reconciliation revision');
  const clean=spawnSync('git',['diff','--quiet','HEAD','--',governedRecordPath],{
    cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']
  });
  assert(clean.status===0,'external evidence must match the committed bytes at the exact reconciliation revision');
  return governedRecordPath;
}

function validateExternalRecord(recordPath,seenIds){
  const governedRecordPath=resolveGovernedExternalRecord(recordPath);
  const record=json(governedRecordPath);
  assert(intake.acceptedExternalRecordIds.includes(record.recordId),'external record type is not accepted by intake contract: '+record.recordId);
  assert(!seenIds.has(record.recordId),'duplicate external record type supplied: '+record.recordId);
  seenIds.add(record.recordId);
  const stdout=runNode(intake.externalRecordValidator,[governedRecordPath]);
  let result;
  try{
    result=JSON.parse(stdout);
  }catch(error){
    throw new Error('external evidence validator did not return parseable JSON for '+governedRecordPath+': '+error.message);
  }
  assert(result.file===governedRecordPath,'external validator path echo mismatch');
  assert(Array.isArray(result.acceptedEvidence)&&result.acceptedEvidence.length>0,'validated external record returned no accepted evidence: '+governedRecordPath);
  for(const item of result.acceptedEvidence){
    assert(item.verified===true,'external accepted evidence item must be verified');
    assert(item.revision===SOURCE,'external accepted evidence revision mismatch');
    assert(typeof item.reference==='string'&&item.reference.length>0,'external accepted evidence reference missing');
  }
  return {recordId:record.recordId,path:governedRecordPath,evidence:result.acceptedEvidence};
}

function compareCurrentDisposition(matrix){
  const expected=intake.currentDispositionWithoutExternalEvidence;
  assert(matrix.verifiedCount===expected.verifiedCount,'current canonical evidence verified count drifted');
  assert(matrix.unverifiedCount===expected.unverifiedCount,'current canonical evidence unverified count drifted');
  assert(matrix.notApplicableCount===expected.notApplicableCount,'current canonical evidence N/A count drifted');
  assert(matrix.qualificationEvidenceComplete===expected.qualificationEvidenceComplete,'current canonical evidence completion drifted');
  assert(matrix.readyForGovernedQualificationReview===expected.readyForGovernedQualificationReview,'current canonical review-readiness drifted');
  assert(JSON.stringify(matrix.blockingLaneIds)===JSON.stringify(expected.blockingLaneIds),'current canonical blocker set drifted');
}

const {external,requireComplete,compact}=parseArgs(process.argv.slice(2));

const liveStable=read('VERSION').trim();
assert(lifecycle.currentOfficial===liveStable&&lifecycle.currentStable===liveStable,'VERSION/current Stable authority must agree');
const liveRelease=lifecycle.releases.find(item=>item.version===liveStable);
assert(liveRelease&&liveRelease.status==='stable'&&liveRelease.consumerEligible===true,'live current Stable must remain a consumer-eligible Stable release');
const liveTuple=liveStable.split('.').slice(0,3).map(Number);
assert(liveTuple.length===3&&liveTuple.every(Number.isInteger),'live Stable must use major.minor.patch versioning');
assert(
  liveTuple[0]>1 || (liveTuple[0]===1 && (liveTuple[1]>5 || (liveTuple[1]===5 && liveTuple[2]>=1))),
  'evidence reconciliation requires live Stable authority at or after frozen baseline '+STABLE
);
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'retained V1.6 evidence tooling must not create an active lifecycle candidate');
assert(intake.sourceRevision===SOURCE&&intake.acceptanceModelVersion===MODEL&&intake.stableBaseline===STABLE,'evidence intake authority binding mismatch');
assert(intake.authority.externalEvidenceMustBeSeparatelyValidated===true,'external evidence validation must remain mandatory');
assert(intake.authority.missingExternalEvidenceMayInferPass===false,'missing external evidence must not infer pass');
assert(intake.authority.staleEvidenceMayInferPass===false,'stale evidence must not infer pass');
assert(intake.authority.revisionMismatchMayInferPass===false,'revision mismatch must not infer pass');
assert(intake.authority.qualificationCompletionMayPromoteLifecycleAutomatically===false,'matrix completion must not promote lifecycle');

const canonicalEvidence=[];
for(const entry of intake.canonicalEvidenceRecords)canonicalEvidence.push(...validateCanonicalRecord(entry));

const canonicalMatrix=createGlazeV16AcceptanceMatrix({exactRevision:SOURCE,evidence:canonicalEvidence});
compareCurrentDisposition(canonicalMatrix);

const seenExternalIds=new Set();
const acceptedExternal=[];
const externalEvidence=[];
for(const recordPath of external){
  const accepted=validateExternalRecord(recordPath,seenExternalIds);
  acceptedExternal.push({recordId:accepted.recordId,path:accepted.path,evidenceCount:accepted.evidence.length});
  externalEvidence.push(...accepted.evidence);
}

const reconciled=createGlazeV16AcceptanceMatrix({
  exactRevision:SOURCE,
  evidence:[...canonicalEvidence,...externalEvidence]
});

assert(reconciled.authority.evidenceManufactured===false,'reconciler must not manufacture evidence');
assert(reconciled.authority.staleEvidenceAccepted===false,'reconciler must not accept stale evidence');
assert(reconciled.authority.mismatchedRevisionAccepted===false,'reconciler must not accept revision mismatch');
assert(reconciled.authority.missingEvidenceInferredPassing===false,'reconciler must not infer missing evidence pass');
assert(reconciled.authority.partialEvidenceGroupInferredPassing===false,'reconciler must not infer partial grouped evidence pass');
assert(reconciled.authority.lifecyclePromotionAutomatic===false,'reconciler must not auto-promote lifecycle');
assert(reconciled.authority.stableStatusGranted===false,'reconciler must not grant Stable');

if(requireComplete){
  assert(reconciled.qualificationEvidenceComplete===true,'V1.6 qualification evidence remains incomplete: '+reconciled.blockingLaneIds.join(', '));
  assert(reconciled.readyForGovernedQualificationReview===true,'complete evidence matrix must be ready for governed qualification review');
}

const output={
  schemaVersion:1,
  recordType:'glaze-v1.6-qualification-evidence-reconciliation',
  sourceRevision:SOURCE,
  acceptanceModelVersion:MODEL,
  stableBaseline:STABLE,
  canonicalEvidenceRecordCount:intake.canonicalEvidenceRecords.length,
  canonicalEvidenceItemCount:canonicalEvidence.length,
  externalEvidenceRecords:acceptedExternal,
  externalEvidenceItemCount:externalEvidence.length,
  matrix:{
    laneCount:reconciled.laneCount,
    verifiedCount:reconciled.verifiedCount,
    unverifiedCount:reconciled.unverifiedCount,
    notApplicableCount:reconciled.notApplicableCount,
    qualificationEvidenceComplete:reconciled.qualificationEvidenceComplete,
    readyForGovernedQualificationReview:reconciled.readyForGovernedQualificationReview,
    blockingLaneIds:reconciled.blockingLaneIds,
    lanes:reconciled.lanes.map(lane=>({
      id:lane.id,status:lane.status,
      satisfiedEvidenceGroupCount:lane.satisfiedEvidenceGroupCount,
      requiredEvidenceGroups:lane.requiredEvidenceGroups,
      evidenceTypes:lane.evidenceTypes,
      evidenceRevisions:lane.evidenceRevisions,
      evidenceReferences:lane.evidenceReferences,
      failureReason:lane.failureReason
    }))
  },
  authority:{
    lifecyclePromotionAutomatic:false,
    candidateStatusGranted:false,
    releaseCandidateStatusGranted:false,
    stableStatusGranted:false,
    consumerAcceptanceAutomatic:false,
    deploymentAcceptanceAutomatic:false,
    productionAcceptanceAutomatic:false
  },
  boundary:'Evidence reconciliation only. A complete section-98 evidence matrix establishes readiness for governed qualification review, not Candidate, Release Candidate, Stable, downstream consumer, deployment, or production acceptance.'
};

console.log(JSON.stringify(output,null,compact?0:2));
