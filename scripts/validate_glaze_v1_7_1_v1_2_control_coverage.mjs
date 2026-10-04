#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createGlazeV17AcceptanceMatrix,glazeV17AcceptanceDevelopmentContract as contract} from '../js/glaze-v1.7-acceptance.dev.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const j=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const req=(v,m)=>{if(!v)throw new Error(m);};
const S='4b9d085a5177b96cc31d4270b38d792a59872e37';
const A='1.7.0-dev.39';
const key=(lane,type)=>lane+'::'+type;
const sorted=x=>[...x].sort();

const acceptance=j('contracts/v1.7/acceptance.dev.json');
const coverage=j('contracts/v1.7/qualification.v1.2.control-coverage.json');
const sessions=j('contracts/v1.7/qualification.v1.2.field-session-plan.json');
const machine=j('contracts/v1.7/qualification.v1.2.machine.plan.json');
const rendered=j('contracts/v1.7/qualification.v1.2.rendered.plan.json');
const regression=j('contracts/v1.7/qualification.v1.2.regression.plan.json');
const human=j('contracts/v1.7/qualification.v1.2.human.plan.json');
const fieldHuman=j('contracts/v1.7/qualification.v1.2.field-human.plan.json');
const device=j('contracts/v1.7/qualification.v1.2.device.plan.json');
const at=j('contracts/v1.7/qualification.v1.2.assistive-technology.plan.json');
const performance=j('contracts/v1.7/qualification.v1.2.performance.plan.json');
const energy=j('contracts/v1.7/qualification.v1.2.energy.plan.json');
const provenance=j('contracts/v1.7/qualification.v1.3.provenance.plan.json');
const regEvidence=j('acceptance/v1.7.1-regression-evidence.json');
const working=j('contracts/v1.7/qualification.v1.2.working-set.plan.json');
const lifecycle=j('registry/lifecycle.json');

const types=['machine','rendered','device','human','assistive-technology','performance','energy','provenance'];
req(JSON.stringify(acceptance.evidenceTypes)===JSON.stringify(types),'evidence type set drifted');
req(contract.acceptanceLanes.length===37,'retained lane count drifted');

const sets={
  machine:new Set(machine.expectedMachineLaneIds),
  rendered:new Set([...rendered.eligibleRenderedEvidenceLaneIds,regression.laneId]),
  device:new Set(device.eligibleEvidenceGroups.map(x=>x.laneId)),
  human:new Set([...human.lanes,...fieldHuman.eligibleEvidenceGroups.map(x=>x.laneId)]),
  'assistive-technology':new Set(at.eligibleEvidenceGroups.map(x=>x.laneId)),
  performance:new Set(performance.laneIds),
  energy:new Set([energy.laneId]),
  provenance:new Set(provenance.evidenceLanes.v12)
};
const gaps=[];
for(const lane of contract.acceptanceLanes)for(const group of lane.evidenceGroups)
  if(!group.some(type=>sets[type]?.has(lane.id)))gaps.push({lane:lane.id,group});
req(gaps.length===0,'retained evidence group lacks control: '+JSON.stringify(gaps));

const baseline=[
 ...machine.expectedMachineLaneIds.map(id=>({id,verified:true,revision:S,evidenceType:'machine',reference:'baseline://m/'+id})),
 ...rendered.eligibleRenderedEvidenceLaneIds.map(id=>({id,verified:true,revision:S,evidenceType:'rendered',reference:'baseline://r/'+id})),
 ...regEvidence.regressionEvidence.map(x=>({id:x.id,verified:true,revision:S,evidenceType:x.evidenceType,reference:x.reference})),
 {id:'artifact-provenance',verified:true,revision:S,evidenceType:'provenance',reference:'baseline://p'}
];
const matrix=createGlazeV17AcceptanceMatrix({exactRevision:S,evidence:baseline});
req(baseline.length===44&&matrix.externallyVerifiedCount===17&&matrix.unverifiedCount===20,'retained 44/17/20 baseline drifted');
req(working.expectedCombinedEvidenceRecordCount===44&&working.expectedMatrixExternallyVerifiedCount===17&&working.expectedMatrixUnverifiedCount===20,'working-set baseline drifted');

const missing=[];
for(const lane of matrix.lanes)if(lane.status!=='externally-verified')for(const group of lane.evidenceGroupResults)
  if(!group.satisfied){req(group.allowedEvidenceTypes.length===1,'batching needs explicit alternate-group handling: '+lane.id);missing.push(key(lane.id,group.allowedEvidenceTypes[0]));}
req(missing.length===24,'missing evidence-group count drifted');

req(sessions.planId==='goreecloud.glaze.v1.7.1.v1.2-field-session-plan'&&sessions.sourceRevision===S&&sessions.acceptanceModelVersion===A,'session plan identity drifted');
req(sessions.retainedOpenLaneCount===20&&sessions.missingEvidenceGroupCount===24,'session plan counts drifted');
req(JSON.stringify(sessions.conditionalLaneIds)===JSON.stringify(['wearable','energy-behavior']),'conditional lanes drifted');
req(Object.keys(sessions.batches).length===5,'field batch count drifted');
const planned=Object.values(sessions.batches).flat().map(([lane,type])=>key(lane,type));
req(new Set(planned).size===planned.length,'duplicate field target');
req(JSON.stringify(sorted(planned))===JSON.stringify(sorted(missing)),'field batches do not exactly cover missing groups');
for(const [lane,type] of Object.values(sessions.batches).flat())req(sets[type]?.has(lane),'field target lacks matching control: '+key(lane,type));
for(const rels of Object.values(sessions.controlPaths))for(const rel of rels)req(fs.existsSync(path.join(root,rel)),'field control path missing: '+rel);
for(const k of ['separateEvidenceRecordsRequiredByLaneAndType','independentGovernedReviewRequiredBeforeIntake','conditionalLaneRequiresSpecificJustification'])req(sessions.rules[k]===true,'required batching safeguard false: '+k);
for(const k of ['companionEvidenceAutomaticallyInherited','candidateRecordAutomaticallyAccepted','hostedCiMaySubstituteForManualFieldEvidence','emulatorMaySubstituteForPhysicalDeviceEvidence','automationMaySubstituteForHumanObservation'])req(sessions.rules[k]===false,'batching authority overclaim: '+k);
for(const [k,v] of Object.entries(sessions.authority))req(v===false,'session authority overclaim: '+k);

req(coverage.recordId==='goreecloud.glaze.v1.7.1.v1.2-evidence-control-coverage'&&coverage.sourceRevision===S&&coverage.acceptanceModelVersion===A,'coverage pointer drifted');
req(coverage.validator==='scripts/validate_glaze_v1_7_1_v1_2_control_coverage.mjs'&&coverage.fieldSessionPlan==='contracts/v1.7/qualification.v1.2.field-session-plan.json','coverage pointer path drifted');
req(coverage.controlCoverageComplete===true&&coverage.acceptedEvidenceInventoryComplete===false&&coverage.readyForGovernedQualificationReview===false&&coverage.v171AcceptanceEstablished===false,'coverage authority boundary drifted');

req(fs.readFileSync(path.join(root,'VERSION'),'utf8').trim()==='1.7.0','bounded Stable VERSION changed');
req(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor'&&lifecycle.plannedNext==='1.7.1','lifecycle boundary changed');

console.log('Glaze V1.7.1 retained V1.2 evidence-control coverage: PASS');
console.log('Control-covered lanes: 37 / 37; evidence types: 8 / 8');
console.log('Retained baseline: 44 records / 17 complete / 20 unverified');
console.log('Missing evidence groups: 24 across 5 field batches');
console.log('Accepted external evidence: 0; V1.7.1 authority granted: false');
