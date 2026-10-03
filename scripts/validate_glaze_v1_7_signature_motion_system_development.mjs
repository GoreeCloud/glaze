#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeSignatureMotion,
  glazeV17SignatureMotionSystemDevelopmentContract
} from '../js/glaze-v1.7-signature-motion-system.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/signature-motion-system.dev.json');
const schema=json('schemas/v1.7-signature-motion-system.schema.json');
const tokens=json('tokens/glaze-v1.7-signature-motion-system.dev.json');
const lifecycle=json('registry/lifecycle.json');
const stable=read('VERSION').trim();
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const glazeMotionTokens=json('tokens/glaze-motion.json');
const glazeMotionDoc=read('GLAZE_MOTION.md');

const relationships=[
  'same-object-expansion',
  'workspace-recomposition',
  'transient-elevation',
  'context-overlay',
  'posture-partition',
  'source-destination-continuity',
  'direct-manipulation-settle',
  'focus-transfer',
  'color-state-change',
  'material-role-change'
];
const familyLabels=[
  'Glaze Bloom',
  'Glaze Flow',
  'Glaze Lift',
  'Glaze Veil',
  'Glaze Fold',
  'Glaze Trace',
  'Glaze Settle',
  'Glaze Focus Transfer',
  'Glaze Color Shift',
  'Glaze Material Shift'
];
const baseFamilies=['expand','move','enter','enter','reorder','move','move','focus','replace','replace'];
const identityRelationships=new Set(['same-object-expansion','source-destination-continuity']);

assert(stable==='1.7.0','dev.14 must coexist with bounded Glaze V1.7 / 1.7.0 Stable');
assert(lifecycle.currentOfficial===stable&&lifecycle.currentStable===stable,'Stable authority mismatch');
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'dev.14 must not create Candidate state');
assert(lifecycle.plannedNext==='1.7.1','dev.14 must not mutate lifecycle plannedNext');

assert(spec.includes('## 22. Glaze Signature Motion System'),'V1.7 v1.2 Section 22 missing');
for(const phrase of [
  'Continuity. Depth. Material. Precision. Quiet settling.',
  'named, reusable transition families',
  'Applications should request motion by semantic intent instead of inventing arbitrary animations.'
]) assert(spec.includes(phrase),`V1.7 v1.2 Section 22 requirement missing: ${phrase}`);
assert(spec.includes('## 23. Signature Motion Principles'),'v1.2 Section 23 must remain a separate obligation');
assert(spec.includes('## 24. Glaze Signature Transition Families'),'v1.2 Section 24 must remain a separate obligation');
assert(spec.includes('## 34. Glaze Motion Lifecycle'),'v1.2 Glaze Motion lifecycle obligation missing');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema version mismatch');
assert(contract.version==='1.7.0-dev.14'&&contract.lifecycle==='Development'&&contract.consumerEligible===false,'contract lifecycle mismatch');
assert(contract.planVersion==='v1.2','dev.14 must bind explicitly to plan v1.2');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([22]),'dev.14 Section 22 marker mismatch');
assert(JSON.stringify(contract.motionPillars)===JSON.stringify(['continuity','depth','material','precision','quiet-settling']),'motion pillar vocabulary mismatch');
assert(JSON.stringify(contract.semanticRelationships)===JSON.stringify(relationships),'semantic relationship catalog mismatch');
assert(JSON.stringify(contract.signatureFamilies)===JSON.stringify(familyLabels),'signature family catalog mismatch');
for(let i=0;i<relationships.length;i++) assert(contract.relationshipToFamily[relationships[i]]===familyLabels[i],`relationship/family mapping mismatch: ${relationships[i]}`);
assert(contract.principles.semanticIntentRequired===true&&contract.principles.arbitraryAnimationRequestsAccepted===false,'semantic-intent boundary weakened');
assert(contract.principles.rawDurationControlAccepted===false&&contract.principles.rawEasingControlAccepted===false&&contract.principles.rawSpringControlAccepted===false,'raw motion controls must remain unavailable');
assert(contract.principles.finalStateDependsOnAnimationCompletion===false&&contract.principles.motionMayBlockInteraction===false,'motion state/blocking boundary weakened');
assert(contract.authority.semanticRelationshipCreatedByGlaze===false&&contract.authority.providerTruthCreatedByGlaze===false,'motion authority boundary weakened');
assert(contract.accessibility.reducedMotionPrecedence===true&&contract.accessibility.motionRequiredToUnderstandState===false,'accessibility boundary weakened');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'dev.14 must not promote Experimental Glaze Motion');
assert(contract.acceptanceBoundary.sourceFoundationOnly===true&&contract.acceptanceBoundary.section22Complete===false,'dev.14 must remain a bounded Section 22 source foundation');
assert(contract.acceptanceBoundary.section23PrinciplesComplete===false&&contract.acceptanceBoundary.section24ChoreographyComplete===false,'dev.14 must not overclaim later Signature Motion sections');
for(const source of Object.values(contract.integrationFoundations)) assert(fs.existsSync(path.join(root,source)),`missing dev.14 integration source: ${source}`);

assert(tokens.version==='1.7.0-dev.14'&&tokens.planVersion==='v1.2'&&tokens.consumerEligible===false,'token lifecycle mismatch');
assert(tokens.requestPolicy.semanticRelationshipRequired===true&&tokens.requestPolicy.arbitraryFamilyInputAllowed===false,'token semantic-request boundary weakened');
assert(tokens.boundaries.glazeMotionExperimentalLifecyclePromoted===false,'token map must preserve Experimental Glaze Motion lifecycle');
assert(tokens.boundaries.section22Complete===false&&tokens.boundaries.section24ChoreographyComplete===false,'token completion boundary weakened');

for(let i=0;i<relationships.length;i++){
  const relationship=relationships[i];
  const input={
    relationship,
    relationshipAuthoritative:true,
    fromState:'before',
    toState:'after'
  };
  if(identityRelationships.has(relationship)){
    input.objectIdentity='surface-42';
    input.objectIdentityAuthoritative=true;
  }
  const resolved=resolveGlazeSignatureMotion(input);
  assert(resolved.version==='1.7.0-dev.14'&&resolved.planVersion==='v1.2',`runtime version/plan mismatch: ${relationship}`);
  assert(resolved.request.acceptedRelationship===relationship,`semantic relationship not accepted: ${relationship}`);
  assert(resolved.signature.family===familyLabels[i],`signature family mismatch: ${relationship}`);
  assert(resolved.signature.signatureFamilyApplied===true,`signature family not applied: ${relationship}`);
  assert(resolved.motion.family===baseFamilies[i],`retained motion-base mapping mismatch: ${relationship}`);
  assert(resolved.signature.semanticIntentOnly===true&&resolved.signature.arbitraryAnimationAccepted===false,`semantic-intent boundary weakened: ${relationship}`);
  assert(resolved.motion.presentation.finalStateDependsOnAnimationCompletion===false,`animation completion dependency introduced: ${relationship}`);
  assert(resolved.authority.providerTruthCreatedByGlaze===false&&resolved.authority.stateChangedByMotion===false,`provider/state authority weakened: ${relationship}`);
  assert(resolved.acceptanceBoundary.section22Complete===false&&resolved.acceptanceBoundary.section24ChoreographyComplete===false,`completion overclaim: ${relationship}`);
}

const untrusted=resolveGlazeSignatureMotion({relationship:'workspace-recomposition',relationshipAuthoritative:false});
assert(untrusted.request.acceptedRelationship===null&&untrusted.request.relationshipWithheldWithoutAuthority===true,'untrusted semantic relationship must fail closed');
assert(untrusted.signature.family==='Standard transition'&&untrusted.signature.signatureFamilyApplied===false,'untrusted semantic relationship must not receive Signature Motion family');
assert(untrusted.motion.family==='replace','untrusted semantic relationship must use bounded standard replacement');

const untrustedIdentity=resolveGlazeSignatureMotion({
  relationship:'same-object-expansion',
  relationshipAuthoritative:true,
  objectIdentity:'surface-42',
  objectIdentityAuthoritative:false
});
assert(untrustedIdentity.signature.signatureFamilyApplied===false,'connected identity motion must require authoritative identity');
assert(untrustedIdentity.request.objectIdentity.accepted===null&&untrustedIdentity.request.objectIdentity.withheldWithoutAuthority===true,'untrusted object identity must be withheld');

for(const relationship of identityRelationships){
  for(const objectIdentity of [undefined,null,'','   ']){
    const missingIdentity=resolveGlazeSignatureMotion({
      relationship,relationshipAuthoritative:true,
      objectIdentity,objectIdentityAuthoritative:true
    });
    assert(missingIdentity.signature.signatureFamilyApplied===false,'missing identity must not receive connected Signature Motion');
    assert(missingIdentity.request.acceptedRelationship===null,'missing identity must withhold the connected relationship');
    assert(missingIdentity.motion.family==='replace','missing identity must use standard replacement');
    assert(missingIdentity.continuity.conceptualIdentitySame===false,'missing identity must not assert object continuity');
  }
}

const reduced=resolveGlazeSignatureMotion({
  relationship:'same-object-expansion',
  relationshipAuthoritative:true,
  objectIdentity:'surface-42',
  objectIdentityAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion must take precedence');
assert(reduced.motion.presentation.continuousMotionAllowed===false,'Reduced Motion must disable continuous motion');
assert(reduced.accessibility.motionRequiredToUnderstandState===false,'state understanding must not require motion');

const direct=resolveGlazeSignatureMotion({
  relationship:'direct-manipulation-settle',
  relationshipAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(direct.accessibility.directManipulationTrackingPreserved===true,'direct manipulation tracking must survive Reduced Motion');
assert(direct.motion.interaction.directManipulation===true&&direct.motion.presentation.spatialTravelAllowed===true,'Reduced Motion must preserve active direct manipulation tracking');
assert(direct.motion.presentation.continuousMotionAllowed===false,'post-gesture continuous motion must collapse under Reduced Motion');

const pressured=resolveGlazeSignatureMotion({
  relationship:'workspace-recomposition',
  relationshipAuthoritative:true,
  activeMotion:{simultaneousTransitions:99}
});
assert(pressured.motion.budget.fatigueProtectionApplied===true&&pressured.motion.budget.optionalMotionReducedAutomatically===true,'retained motion budget protection must apply');

for(const key of ['family','signatureFamily','durationMs','easing','spring','physics','keyframes']){
  let failed=false;
  try{resolveGlazeSignatureMotion({relationship:'workspace-recomposition',relationshipAuthoritative:true,[key]:'arbitrary'});}catch{failed=true;}
  assert(failed,`raw/arbitrary motion request must fail closed: ${key}`);
}
let unsupportedFailed=false;
try{resolveGlazeSignatureMotion({relationship:'spin-forever',relationshipAuthoritative:true});}catch{unsupportedFailed=true;}
assert(unsupportedFailed,'unsupported semantic relationship must fail closed');

assert(glazeMotionTokens.glazeMotion.version==='0.6.0'&&glazeMotionTokens.glazeMotion.status==='experimental','separate Glaze Motion 0.6 must remain Experimental');
assert(glazeMotionTokens.glazeMotion.runtimeCompatibilityBaseline==='0.4.0','Glaze Motion runtime compatibility baseline changed unexpectedly');
assert(glazeMotionTokens.tiers.core.status==='experimental'&&glazeMotionTokens.tiers.studio.status==='planned'&&glazeMotionTokens.tiers.spatial.status==='planned','Glaze Motion tier lifecycle changed');
assert(glazeMotionDoc.includes('Experimental foundation (0.6.0)'),'Glaze Motion documentation no longer identifies Experimental foundation');
assert(glazeMotionDoc.includes('Motion Studio — Planned')&&glazeMotionDoc.includes('Motion Spatial — Planned'),'Glaze Motion planned-tier boundary changed');

assert(glazeV17SignatureMotionSystemDevelopmentContract.version==='1.7.0-dev.14','runtime contract version mismatch');
assert(glazeV17SignatureMotionSystemDevelopmentContract.planVersion==='v1.2','runtime plan version mismatch');
assert(glazeV17SignatureMotionSystemDevelopmentContract.glazeMotionExperimentalLifecyclePromoted===false,'runtime must not promote Glaze Motion');
assert(glazeV17SignatureMotionSystemDevelopmentContract.section22Complete===false,'runtime must not claim Section 22 complete');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=14,'aggregate version regressed below dev.14');
assert(glazeV17Development.lifecycle==='development'&&glazeV17Development.stableBaseline==='1.6.0'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
assert(glazeV17Development.planVersion==='v1.2','aggregate must expose current V1.7 plan v1.2');
assert(glazeV17Development.planV12FoundationSections.includes(22),'aggregate lost v1.2 Section 22 foundation');
for(const n of [7,8,9,10,11,12,13,18,19,21,24,25,26,27,28]) assert(glazeV17Development.planV11FoundationSections.includes(n),`aggregate lost historical v1.1 foundation ${n}`);
assert(glazeV17Development.signatureMotionSystemFoundation==='js/glaze-v1.7-signature-motion-system.dev.mjs','aggregate missing dev.14 Signature Motion foundation');
assert(glazeV17Development.continuityAwareMotionFoundation==='js/glaze-v1.7-continuity-aware-motion.dev.mjs','aggregate lost dev.13 Continuity-Aware Motion');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate must keep Glaze Motion Experimental');
assert(glazeV17Development.providerTruthManufactured===false,'aggregate provider-truth boundary weakened');

assert(spec.includes('dev.14 is the first explicitly v1.2-bound source foundation for **Section 22 — Glaze Signature Motion System**')&&spec.includes('dev.14 does **not** establish Section 22 completion'),'V1.7 plan authority boundary missing dev.14 Section 22 provenance');
assert(planned.includes('1.7.0-dev.14')&&planned.includes('v1.2 Section 22')&&planned.includes('Signature Motion System'),'planned-feature control missing dev.14 provenance');
assert(implemented.includes('Glaze Signature Motion System — `1.7.0-dev.14`'),'implemented-feature control missing dev.14');
assert(changelog.includes('1.7.0-dev.14')&&changelog.includes('Glaze Signature Motion System'),'changelog missing dev.14');

console.log('GLAZE UI V1.7 Signature Motion System Development foundation: PASS');
console.log('Plan binding: v1.2 Section 22');
console.log('Semantic relationships: 10');
console.log('Named Signature Motion families: 10');
console.log('Section 22 complete: false');
console.log('Glaze Motion Experimental promoted: false');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
