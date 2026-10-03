#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  runGlazeConsistencyInspector,
  buildGlazeComponentConformanceMetadata,
  resolveGlazeApplicationAdoptionProfile,
  evaluateGlazeV151MigrationContinuity,
  glazeV16ConformanceAdoptionDevelopmentContract
} from '../js/glaze-v1.6-conformance-adoption.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(v,m)=>{if(!v)throw new Error(m);};
const contract=json('contracts/v1.6/conformance-adoption.dev.json');
const schema=json('schemas/v1.6-conformance-adoption.schema.json');
const tokens=json('tokens/glaze-v1.6-conformance-adoption.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_6_PLANNED.md');
const sections=[94,95,96,97];

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
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'dev.10 must preserve Stable authority and permit only governed V1.6 RC coexistence');
for(const n of sections)assert(spec.includes(`# ${n}.`),`planned specification missing section ${n}`);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema version mismatch');
assert(contract.version==='1.6.0-dev.10'&&contract.lifecycle==='Development'&&contract.consumerEligible===false,'contract Development boundary mismatch');
assert(JSON.stringify(contract.implementedSpecificationSections)===JSON.stringify(sections),'section set mismatch');
assert(contract.consistencyInspector.sourceModifiedAutomatically===false,'inspector must not auto-modify source');
assert(contract.componentConformanceMetadata.metadataProvesRuntimeConformance===false,'metadata must not prove runtime conformance');
assert(contract.applicationAdoptionProfiles.sharedStableStatusImpliesApplicationAdoption===false,'shared Stable must not imply app adoption');
assert(contract.applicationAdoptionProfiles.applicationAcceptanceAutomatic===false,'application acceptance must not be automatic');
assert(contract.migrationFromV151.priorAcceptanceReboundAutomatically===false,'migration must not rebind old acceptance');
assert(contract.authority.releasePromotionAutomatic===false&&contract.authority.productionEligibilityGranted===false,'contract must not grant release/production state');

assert(tokens.version==='1.6.0-dev.10'&&tokens.lifecycle==='Development'&&tokens.consumerEligible===false,'token map boundary mismatch');
assert(Object.keys(tokens.consistencyInspectorDomains).length===11,'inspector domain count mismatch');
assert(Object.keys(tokens.adoptionStatuses).length===5,'adoption status count mismatch');
assert(Object.keys(tokens.migrationInvariants).length===8,'migration invariant count mismatch');
assert(tokens.boundaries.sharedStatusImpliesApplicationAdoption===false,'token map must preserve adoption boundary');
for(const source of tokens.sourceAuthorities||[])assert(fs.existsSync(path.join(root,source)),`missing token source ${source}`);

assert(glazeV16ConformanceAdoptionDevelopmentContract.version==='1.6.0-dev.10','runtime contract version mismatch');
assert(glazeV16ConformanceAdoptionDevelopmentContract.consumerEligible===false,'runtime must remain non-consumer-eligible');
assert(glazeV16ConformanceAdoptionDevelopmentContract.inspectorMayModifySource===false,'runtime inspector must be advisory');
assert(glazeV16ConformanceAdoptionDevelopmentContract.sharedStatusImpliesApplicationAdoption===false,'runtime must not infer adoption');

const aggregateVersionParts=String(glazeV16Development.version).split('-dev.');
const aggregateDevelopmentRevision=Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0]==='1.6.0'&&Number.isInteger(aggregateDevelopmentRevision)&&aggregateDevelopmentRevision>=10,
  'aggregate Development version must retain or advance beyond dev.10'
);
assert(glazeV16Development.lifecycle==='development'&&glazeV16Development.consumerEligible===false,'aggregate boundary mismatch');
for(let n=1;n<=97;n++)assert(glazeV16Development.implementedSpecificationSections.includes(n),`aggregate must retain section ${n}`);

const inspectorPass=runGlazeConsistencyInspector({
  evidence:Object.fromEntries(glazeV16ConformanceAdoptionDevelopmentContract.inspectorDomains.map(x=>[x,true])),
  findings:{}
});
assert(inspectorPass.status==='pass'&&inspectorPass.failedDomains.length===0,'fully evidenced clean inspector should pass');
assert(inspectorPass.authority.sourceModifiedAutomatically===false,'inspector must not mutate source');

const inspectorFail=runGlazeConsistencyInspector({
  evidence:{tokens:true,colors:true},
  findings:{colors:['semantic danger overridden'],accessibility:['focus hidden']}
});
assert(inspectorFail.status==='fail','inspector violations must fail');
assert(inspectorFail.failedDomains.includes('colors')&&inspectorFail.failedDomains.includes('accessibility'),'inspector failed domains missing');
assert(inspectorFail.unverifiedDomains.length>0,'missing evidence must remain unverified');

const metadata=buildGlazeComponentConformanceMetadata({
  componentId:'button',
  supportedStates:['default','hover','focus','pressed','disabled','loading','error'],
  accessibilityModes:['default','high-contrast','reduced-motion','screen-reader','keyboard'],
  formFactors:['compact','medium','expanded','workspace'],
  motionBehavior:'semantic-state-transition with Reduced Motion fallback',
  fallbackBehavior:'solid accessible control with preserved semantics',
  performanceExpectations:{continuousAnimation:false,optionalBlur:false}
});
assert(metadata.status==='complete','complete component metadata should be complete');
assert(metadata.boundaries.metadataDoesNotProveRuntimeConformance===true,'metadata must not prove runtime conformance');
const incomplete=buildGlazeComponentConformanceMetadata({componentId:'menu'});
assert(incomplete.status==='incomplete','missing metadata must remain incomplete');

const profile=resolveGlazeApplicationAdoptionProfile({
  application:'GoreeCloud Example',
  repository:'GoreeCloud/example',
  referenceRevision:'0123456789abcdef0123456789abcdef01234567',
  applicationAcceptanceProvided:true,
  capabilities:[
    {id:'semantic-tokens',status:'implemented',evidence:'repo-local evidence'},
    {id:'tv',status:'not-applicable',evidence:'not supported product scope'}
  ]
});
assert(profile.implementationComplete===true,'implemented/not-applicable profile should be implementation-complete');
assert(profile.adoptionState==='profile-complete-awaiting-shared-lifecycle','dev profile must remain awaiting shared lifecycle');
assert(profile.authority.sharedDevelopmentStatusImpliesApplicationAdoption===false,'shared development must not imply adoption');
assert(profile.authority.consumerRegistryMutatedByResolver===false,'resolver must not mutate consumer registry');

const partial=resolveGlazeApplicationAdoptionProfile({
  application:'GoreeCloud Example',
  repository:'GoreeCloud/example',
  capabilities:[{id:'accessibility',status:'partially-implemented'}]
});
assert(partial.adoptionState==='incomplete','partial adoption must remain incomplete');
let badStatus=false;try{resolveGlazeApplicationAdoptionProfile({application:'X',repository:'GoreeCloud/x',capabilities:[{id:'x',status:'certified'}]});}catch{badStatus=true;}
assert(badStatus,'unknown adoption status must fail closed');

const migrationPass=evaluateGlazeV151MigrationContinuity({
  sourceRevision:'1111111111111111111111111111111111111111',
  targetRevision:'2222222222222222222222222222222222222222',
  preserved:Object.fromEntries(glazeV16ConformanceAdoptionDevelopmentContract.migrationInvariants.map(x=>[x,true])),
  addedCapabilities:['skeleton-motion','conformance-metadata']
});
assert(migrationPass.status==='pass','fully evidenced migration continuity should pass');
assert(migrationPass.evolution.destructiveMigrationPreferred===false,'migration should be evolutionary');
assert(migrationPass.authority.lifecyclePromotionAutomatic===false,'migration must not promote lifecycle');

const migrationMissing=evaluateGlazeV151MigrationContinuity({
  preserved:{'semantic-colors':true,'accessibility-precedence':true}
});
assert(migrationMissing.status==='unverified','missing revisions/invariants must remain unverified');

const migrationFail=evaluateGlazeV151MigrationContinuity({
  sourceRevision:'1111111111111111111111111111111111111111',
  targetRevision:'2222222222222222222222222222222222222222',
  preserved:{'semantic-colors':false}
});
assert(migrationFail.status==='fail','broken migration invariant must fail');

console.log('GLAZE UI V1.6 conformance/adoption Development foundation: PASS');
console.log('Implemented sections: 94-97');
console.log('Aggregate implemented sections: 1-97');
console.log('Inspector domains: 11');
console.log('Adoption statuses: 5');
console.log('Migration invariants: 8');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
