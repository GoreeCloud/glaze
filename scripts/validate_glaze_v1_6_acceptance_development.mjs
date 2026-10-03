#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  createGlazeV16AcceptanceMatrix,
  describeGlazeV16CorePillars,
  describeGlazeV16GoverningPrinciple,
  glazeV16AcceptanceDevelopmentContract
} from '../js/glaze-v1.6-acceptance.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(v,m)=>{if(!v)throw new Error(m);};

const contract=json('contracts/v1.6/acceptance.dev.json');
const schema=json('schemas/v1.6-acceptance.schema.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_6_PLANNED.md');
const acceptance=read('acceptance/v1.6-development.md');

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
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'dev.12 must preserve Stable authority and permit only governed V1.6 RC coexistence');
for(const n of [98,99,100])assert(spec.includes(`# ${n}.`),`planned specification missing section ${n}`);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema version mismatch');
assert(contract.schemaVersion===2,'acceptance contract schemaVersion must be 2');
assert(contract.version==='1.6.0-dev.12'&&contract.lifecycle==='Development'&&contract.consumerEligible===false,'contract boundary mismatch');
assert(JSON.stringify(contract.implementedSpecificationSections)===JSON.stringify([98,99,100]),'implemented section set mismatch');
assert(contract.acceptance.laneCount===24,'acceptance lane count mismatch');
assert(contract.acceptance.exactRevisionRequired===true,'exact revision must be required');
assert(contract.acceptance.evidenceReferenceRequired===true,'evidence references must be required');
assert(contract.acceptance.allEvidenceGroupsRequired===true,'all required evidence groups must be enforced');
assert(contract.acceptance.missingEvidenceMayInferPass===false,'missing evidence must not pass');
assert(contract.acceptance.revisionMismatchMayPass===false,'revision mismatch must not pass');
assert(contract.acceptance.partialEvidenceGroupMayPass===false,'partial evidence groups must not pass');
assert(contract.acceptance.matrixCompletionEqualsStablePromotion===false,'matrix completion must not equal Stable promotion');
assert(Object.keys(contract.evidenceRequirements).length===24,'evidence requirement lane count mismatch');
assert(contract.evidenceRequirements.accessibility.length===2,'accessibility must require two evidence groups');
assert(contract.evidenceRequirements['representative-rendering'].length===2,'representative rendering must require two evidence groups');
assert(contract.corePillars.length===8,'core pillar count mismatch');
assert(contract.authority.partialEvidenceGroupAccepted===false,'contract must reject partial evidence groups');
assert(contract.authority.lifecyclePromotionAutomatic===false&&contract.authority.stableStatusGranted===false,'contract must not promote lifecycle');
assert(acceptance.includes('every group must be satisfied on the same exact reviewed revision'),'acceptance record must define grouped evidence semantics');
assert(acceptance.includes('Accessibility requires machine evidence **and** either human or assistive-technology evidence'),'acceptance record must state the accessibility evidence conjunction');

assert(glazeV16AcceptanceDevelopmentContract.version==='1.6.0-dev.12','runtime contract version mismatch');
assert(glazeV16AcceptanceDevelopmentContract.acceptanceLanes.length===24,'runtime lane count mismatch');
assert(glazeV16AcceptanceDevelopmentContract.corePillars.length===8,'runtime pillar count mismatch');
assert(glazeV16AcceptanceDevelopmentContract.allEvidenceGroupsRequired===true,'runtime must require all evidence groups');
assert(glazeV16AcceptanceDevelopmentContract.partialEvidenceGroupMayPass===false,'runtime must reject partial evidence groups');
assert(glazeV16AcceptanceDevelopmentContract.missingEvidenceMayInferPass===false,'runtime missing evidence must not pass');

assert(glazeV16Development.version==='1.6.0-dev.12','aggregate must identify dev.12');
assert(glazeV16Development.lifecycle==='development'&&glazeV16Development.consumerEligible===false,'aggregate boundary mismatch');
for(let n=1;n<=100;n++)assert(glazeV16Development.implementedSpecificationSections.includes(n),`aggregate missing section ${n}`);

const empty=createGlazeV16AcceptanceMatrix({});
assert(empty.laneCount===24,'empty matrix lane count mismatch');
assert(empty.qualificationEvidenceComplete===false,'matrix without revision/evidence must not complete');
assert(empty.unverifiedCount===24,'empty matrix should leave all lanes unverified');
assert(empty.authority.missingEvidenceInferredPassing===false,'missing evidence must not infer pass');
assert(empty.authority.partialEvidenceGroupInferredPassing===false,'partial groups must not infer pass');

const revision='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const wrongRevision='bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

const mismatch=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[{
    id:'source-implementation',verified:true,revision:wrongRevision,
    evidenceType:'machine',reference:'CI run 1'
  }]
});
const mismatchLane=mismatch.lanes.find(x=>x.id==='source-implementation');
assert(mismatchLane.status==='unverified','mismatched evidence must remain unverified');
assert(mismatchLane.failureReason==='evidence-revision-mismatch','revision mismatch reason missing');

const wrongType=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[{
    id:'performance',verified:true,revision,
    evidenceType:'machine',reference:'synthetic source test'
  }]
});
const performanceLane=wrongType.lanes.find(x=>x.id==='performance');
assert(performanceLane.status==='unverified','machine-only performance record must not satisfy representative performance');
assert(performanceLane.failureReason==='evidence-type-not-allowed','wrong performance evidence type reason missing');

const noJustification=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  applicability:{'form-factor-transitions':false}
});
const naLane=noJustification.lanes.find(x=>x.id==='form-factor-transitions');
assert(naLane.status==='unverified','not-applicable without justification must remain unverified');

const justifiedNA=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  applicability:{'form-factor-transitions':false},
  notApplicableJustifications:{'form-factor-transitions':'No form-factor transition support is claimed for this qualification scope.'}
});
assert(justifiedNA.lanes.find(x=>x.id==='form-factor-transitions').status==='not-applicable','justified N/A disposition should be explicit');
assert(justifiedNA.qualificationEvidenceComplete===false,'one N/A disposition cannot complete otherwise missing evidence');

const accessibilityMachineOnly=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[{id:'accessibility',verified:true,revision,evidenceType:'machine',reference:'machine accessibility suite'}]
});
const accessMachineLane=accessibilityMachineOnly.lanes.find(x=>x.id==='accessibility');
assert(accessMachineLane.status==='unverified','machine-only accessibility must not complete grouped requirement');
assert(accessMachineLane.satisfiedEvidenceGroupCount===1,'machine accessibility should satisfy exactly one evidence group');
assert(accessMachineLane.failureReason==='required-evidence-group-unsatisfied','partial grouped accessibility reason mismatch');

const accessibilityHumanOnly=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[{id:'accessibility',verified:true,revision,evidenceType:'human',reference:'human accessibility review'}]
});
assert(accessibilityHumanOnly.lanes.find(x=>x.id==='accessibility').status==='unverified','human-only accessibility must not complete grouped requirement');

const accessibilityComplete=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[
    {id:'accessibility',verified:true,revision,evidenceType:'machine',reference:'machine accessibility suite'},
    {id:'accessibility',verified:true,revision,evidenceType:'human',reference:'human accessibility review'}
  ]
});
assert(accessibilityComplete.lanes.find(x=>x.id==='accessibility').status==='verified','machine plus human accessibility must satisfy grouped requirement');

for(const id of ['reduced-motion','reduced-transparency','increased-contrast','large-text']){
  const onlyMachine=createGlazeV16AcceptanceMatrix({
    exactRevision:revision,
    evidence:[{id,verified:true,revision,evidenceType:'machine',reference:`${id} machine suite`}]
  });
  assert(onlyMachine.lanes.find(x=>x.id===id).status==='unverified',`${id} machine-only evidence must remain unverified`);
  const complete=createGlazeV16AcceptanceMatrix({
    exactRevision:revision,
    evidence:[
      {id,verified:true,revision,evidenceType:'machine',reference:`${id} machine suite`},
      {id,verified:true,revision,evidenceType:'rendered',reference:`${id} rendered review`}
    ]
  });
  assert(complete.lanes.find(x=>x.id===id).status==='verified',`${id} grouped evidence should verify`);
}

const keyboardMachineOnly=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[{id:'keyboard-navigation',verified:true,revision,evidenceType:'machine',reference:'keyboard machine suite'}]
});
assert(keyboardMachineOnly.lanes.find(x=>x.id==='keyboard-navigation').status==='unverified','keyboard machine-only evidence must remain unverified');

const responsiveMachineOnly=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[{id:'responsive-layouts',verified:true,revision,evidenceType:'machine',reference:'responsive machine suite'}]
});
assert(responsiveMachineOnly.lanes.find(x=>x.id==='responsive-layouts').status==='unverified','responsive machine-only evidence must remain unverified');

const layoutMachineOnly=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[{id:'layout-stability',verified:true,revision,evidenceType:'machine',reference:'layout machine suite'}]
});
assert(layoutMachineOnly.lanes.find(x=>x.id==='layout-stability').status==='unverified','layout machine-only evidence must remain unverified');

for(const id of ['privacy-boundaries','authority-boundaries']){
  const machineOnly=createGlazeV16AcceptanceMatrix({
    exactRevision:revision,
    evidence:[{id,verified:true,revision,evidenceType:'machine',reference:`${id} machine suite`}]
  });
  assert(machineOnly.lanes.find(x=>x.id===id).status==='unverified',`${id} machine-only evidence must remain unverified`);
}

const regressionMachineOnly=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[{id:'regression-testing',verified:true,revision,evidenceType:'machine',reference:'machine regression suite'}]
});
assert(regressionMachineOnly.lanes.find(x=>x.id==='regression-testing').status==='unverified','machine-only regression evidence must remain unverified');

const renderingOnly=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[{id:'representative-rendering',verified:true,revision,evidenceType:'rendered',reference:'rendered scene review'}]
});
assert(renderingOnly.lanes.find(x=>x.id==='representative-rendering').status==='unverified','rendered-only representative-rendering evidence must remain unverified');

const renderingComplete=createGlazeV16AcceptanceMatrix({
  exactRevision:revision,
  evidence:[
    {id:'representative-rendering',verified:true,revision,evidenceType:'rendered',reference:'rendered scene review'},
    {id:'representative-rendering',verified:true,revision,evidenceType:'human',reference:'human representative review'}
  ]
});
assert(renderingComplete.lanes.find(x=>x.id==='representative-rendering').status==='verified','rendered plus human representative rendering should verify');

const fixtureEvidence=[];
let fixtureIndex=0;
for(const [id,groups] of Object.entries(contract.evidenceRequirements)){
  for(const group of groups){
    fixtureIndex+=1;
    fixtureEvidence.push({
      id,
      verified:true,
      revision,
      evidenceType:group[0],
      reference:`test-fixture-${fixtureIndex}`
    });
  }
}
const completeFixture=createGlazeV16AcceptanceMatrix({exactRevision:revision,evidence:fixtureEvidence});
assert(completeFixture.qualificationEvidenceComplete===true,'complete grouped fixture should complete evidence matrix');
assert(completeFixture.readyForGovernedQualificationReview===true,'complete grouped evidence matrix should be review-ready');
assert(completeFixture.verifiedCount===24,'complete grouped fixture should verify all lanes');
assert(completeFixture.authority.lifecyclePromotionAutomatic===false,'complete matrix must not auto-promote lifecycle');
assert(completeFixture.authority.stableStatusGranted===false,'complete matrix must not grant Stable');

const pillars=describeGlazeV16CorePillars();
assert(pillars.count===8&&pillars.summaryOnly===true&&pillars.lifecycleAuthority===false,'pillar summary boundary mismatch');

const principle=describeGlazeV16GoverningPrinciple();
assert(principle.states.length===10,'governing-principle state coverage mismatch');
assert(principle.accessibilityPrecedence===true,'governing principle must preserve accessibility precedence');
assert(principle.performancePrecedenceOverDecoration===true,'governing principle must preserve performance precedence');
assert(principle.truthPreservationRequired===true,'governing principle must preserve truth');

console.log('GLAZE UI V1.6 acceptance-control Development hardening: PASS');
console.log('Development version: 1.6.0-dev.12');
console.log('Implemented sections: 98-100');
console.log('Aggregate implemented sections: 1-100');
console.log('Acceptance lanes: 24');
console.log('Grouped-evidence lanes: '+Object.values(contract.evidenceRequirements).filter(groups=>groups.length>1).length);
console.log('Core pillars: 8');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
console.log('Stable promotion automatic: false');
