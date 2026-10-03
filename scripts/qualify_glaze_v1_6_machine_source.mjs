#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const toolingRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot=path.resolve(process.argv[2]||'');
if(!sourceRoot||!fs.existsSync(sourceRoot))throw new Error('exact source worktree path is required');

const plan=JSON.parse(fs.readFileSync(path.join(toolingRoot,'contracts/v1.6/qualification.machine.plan.json'),'utf8'));
const assert=(v,m)=>{if(!v)throw new Error(m);};

function run(cmd,args,cwd){
  const result=spawnSync(cmd,args,{cwd,encoding:'utf8'});
  if(result.stdout)process.stdout.write(result.stdout);
  if(result.stderr)process.stderr.write(result.stderr);
  if(result.status!==0)throw new Error(`command failed (${result.status}): ${cmd} ${args.join(' ')}`);
  return String(result.stdout||'').trim();
}

const actualRevision=run('git',['rev-parse','HEAD'],sourceRoot).split('\n').at(-1).trim();
assert(actualRevision===plan.sourceRevision,`qualification source mismatch: expected ${plan.sourceRevision}, got ${actualRevision}`);

const version=fs.readFileSync(path.join(sourceRoot,'VERSION'),'utf8').trim();
const lifecycle=JSON.parse(fs.readFileSync(path.join(sourceRoot,'registry/lifecycle.json'),'utf8'));
const acceptanceContract=JSON.parse(fs.readFileSync(path.join(sourceRoot,'contracts/v1.6/acceptance.dev.json'),'utf8'));

assert(version==='1.5.1','Stable VERSION must remain 1.5.1');
assert(lifecycle.currentOfficial==='1.5.1'&&lifecycle.currentStable==='1.5.1','Stable lifecycle must remain 1.5.1');
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'qualification source must not activate V1.6 lifecycle');
assert(acceptanceContract.version===plan.acceptanceModelVersion,'acceptance model version mismatch');
assert(acceptanceContract.acceptance.allEvidenceGroupsRequired===true,'qualification source must use grouped evidence requirements');
assert(acceptanceContract.acceptance.partialEvidenceGroupMayPass===false,'partial evidence groups must not pass');

const allLaneIds=new Set(acceptanceContract.lanes);
assert(plan.machineEvidenceLaneIds.length===20,'machine evidence lane count must remain 20');
assert(plan.nonMachineOnlyLaneIds.length===4,'non-machine-only lane count must remain 4');
for(const id of [...plan.machineEvidenceLaneIds,...plan.nonMachineOnlyLaneIds])assert(allLaneIds.has(id),`unknown acceptance lane in qualification plan: ${id}`);
assert(new Set([...plan.machineEvidenceLaneIds,...plan.nonMachineOnlyLaneIds]).size===24,'qualification plan must partition all 24 lanes');

for(const id of plan.machineEvidenceLaneIds){
  const groups=acceptanceContract.evidenceRequirements[id];
  assert(Array.isArray(groups)&&groups.some(group=>group.includes('machine')),`planned machine lane lacks a machine evidence group: ${id}`);
}
for(const id of plan.nonMachineOnlyLaneIds){
  const groups=acceptanceContract.evidenceRequirements[id];
  assert(Array.isArray(groups)&&!groups.some(group=>group.includes('machine')),`non-machine-only lane unexpectedly permits machine evidence: ${id}`);
}

for(const validator of plan.validators){
  const validatorPath=path.join(sourceRoot,validator.path);
  assert(fs.existsSync(validatorPath),`validator missing at frozen source: ${validator.path}`);
  console.log(`QUALIFY validator=${validator.id} path=${validator.path} source=${actualRevision}`);
  run(process.execPath,[validatorPath],sourceRoot);
}

const acceptanceModule=await import(pathToFileURL(path.join(sourceRoot,'js/glaze-v1.6-acceptance.dev.mjs')).href+`?source=${actualRevision}`);
const evidence=plan.machineEvidenceLaneIds.map((id,index)=>({
  id,
  verified:true,
  revision:actualRevision,
  evidenceType:'machine',
  reference:`qualification-machine-fixture-${index+1}`
}));
const matrix=acceptanceModule.createGlazeV16AcceptanceMatrix({exactRevision:actualRevision,evidence});
const expected=plan.expectedMachineMatrixDisposition;

assert(matrix.verifiedCount===expected.verifiedLaneCount,`machine matrix verified count mismatch: ${matrix.verifiedCount}`);
assert(matrix.unverifiedCount===expected.unverifiedLaneCount,`machine matrix unverified count mismatch: ${matrix.unverifiedCount}`);
assert(matrix.notApplicableCount===expected.notApplicableLaneCount,'machine matrix N/A count mismatch');
assert(matrix.qualificationEvidenceComplete===expected.qualificationEvidenceComplete,'machine matrix completion mismatch');
assert(matrix.readyForGovernedQualificationReview===expected.readyForGovernedQualificationReview,'machine matrix review readiness mismatch');

const fullyVerifiedLaneIds=matrix.lanes.filter(lane=>lane.status==='verified').map(lane=>lane.id);
const partialMachineLaneIds=matrix.lanes
  .filter(lane=>lane.status==='unverified'&&lane.satisfiedEvidenceGroupCount>0)
  .map(lane=>lane.id);
const untouchedLaneIds=matrix.lanes
  .filter(lane=>lane.status==='unverified'&&lane.satisfiedEvidenceGroupCount===0)
  .map(lane=>lane.id);

console.log('GLAZE UI V1.6 exact-source machine qualification: PASS');
console.log(JSON.stringify({
  sourceRevision:actualRevision,
  acceptanceModelVersion:plan.acceptanceModelVersion,
  validatorsPassed:plan.validators.map(v=>v.id),
  machineEvidenceLaneIds:plan.machineEvidenceLaneIds,
  fullyVerifiedLaneIds,
  partialMachineLaneIds,
  untouchedLaneIds,
  matrix:{
    verifiedCount:matrix.verifiedCount,
    unverifiedCount:matrix.unverifiedCount,
    notApplicableCount:matrix.notApplicableCount,
    qualificationEvidenceComplete:matrix.qualificationEvidenceComplete,
    readyForGovernedQualificationReview:matrix.readyForGovernedQualificationReview
  },
  lifecycle:{
    currentOfficial:lifecycle.currentOfficial,
    currentStable:lifecycle.currentStable,
    activeCandidate:lifecycle.activeCandidate,
    plannedNext:lifecycle.plannedNext,
    activePatchReleaseCandidate:lifecycle.activePatchReleaseCandidate
  },
  evidenceBoundary:'machine-only; no rendered/human/assistive-technology/device/performance evidence claimed'
},null,2));
