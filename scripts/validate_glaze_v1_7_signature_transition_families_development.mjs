#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveGlazeSignatureTransitionFamily,glazeV17SignatureTransitionFamiliesDevelopmentContract} from '../js/glaze-v1.7-signature-transition-families.dev.mjs';
import {glazeV17SignatureMotionPrinciplesDevelopmentContract} from '../js/glaze-v1.7-signature-motion-principles.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/signature-transition-families.dev.json');
const schema=json('schemas/v1.7-signature-transition-families.schema.json');
const tokens=json('tokens/glaze-v1.7-signature-transition-families.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const glazeMotion=json('tokens/glaze-motion.json');

const families=['Glaze Bloom','Glaze Flow','Glaze Lift','Glaze Veil','Glaze Fold','Glaze Trace','Glaze Settle','Glaze Focus Transfer','Glaze Color Shift','Glaze Material Shift'];
const relationships=['same-object-expansion','workspace-recomposition','transient-elevation','context-overlay','posture-partition','source-destination-continuity','direct-manipulation-settle','focus-transfer','color-state-change','material-role-change'];
const identityRelationships=new Set(['same-object-expansion','source-destination-continuity']);

assert(read('VERSION').trim()==='1.7.0','bounded V1.7 VERSION changed');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.16 must not create lifecycle promotion state');

for(const phrase of ['## 24. Glaze Signature Transition Families','### Glaze Bloom','### Glaze Flow','### Glaze Lift','### Glaze Veil','### Glaze Fold','### Glaze Trace','### Glaze Settle','### Glaze Focus Transfer','### Glaze Color Shift','### Glaze Material Shift','Critical dialogs should remain certainty-first and must not depend on translucent effects.','It must not imitate a literal folding animation merely for decoration.','It must not become a continuous decorative trail.','Settle should feel precise rather than springy.','The actual focus state must update independently from the animation.','Protected semantic meaning must remain immediately recognizable throughout the transition.','Reduced Transparency should substitute a suitable non-translucent equivalent.']){
  assert(spec.includes(phrase),'Section 24 requirement missing: '+phrase);
}

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.16'&&contract.planVersion==='v1.2'&&contract.consumerEligible===false,'dev.16 contract identity mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([24]),'dev.16 section marker mismatch');
assert(contract.dependsOn.signatureMotionPrinciplesVersion==='1.7.0-dev.15','dev.15 dependency mismatch');
assert(JSON.stringify(contract.familyOrder)===JSON.stringify(families),'family order mismatch');
assert(Object.keys(contract.familyPolicy).length===10,'family policy count mismatch');
for(let i=0;i<families.length;i++)assert(contract.familyPolicy[families[i]].relationship===relationships[i],'relationship mapping mismatch: '+families[i]);
assert(contract.requestPolicy.directFamilyRequestAccepted===false,'direct family request boundary weakened');
assert(contract.familyPolicy['Glaze Bloom'].requiresObjectIdentityAuthority===true,'Bloom identity boundary weakened');
assert(contract.familyPolicy['Glaze Veil'].criticalSurfaceTranslucencyRequired===false,'Veil certainty boundary weakened');
assert(contract.familyPolicy['Glaze Fold'].literalFoldSimulationAllowed===false,'Fold decorative literal animation enabled');
assert(contract.familyPolicy['Glaze Trace'].continuousDecorativeTrailAllowed===false,'Trace decorative trail enabled');
assert(contract.familyPolicy['Glaze Settle'].routineBounceAllowed===false,'Settle bounce enabled');
assert(contract.familyPolicy['Glaze Focus Transfer'].focusStateIndependentOfAnimation===true,'Focus Transfer state boundary weakened');
assert(contract.familyPolicy['Glaze Color Shift'].protectedSemanticMeaningImmediate===true,'Color Shift semantic safety weakened');
assert(contract.familyPolicy['Glaze Material Shift'].reducedTransparencySolidEquivalent===true,'Material Shift solid fallback weakened');
assert(contract.acceptanceBoundary.familyCatalogImplemented===true&&contract.acceptanceBoundary.section24Complete===false,'Section 24 source boundary mismatch');
assert(contract.acceptanceBoundary.renderedChoreographyAcceptanceEstablished===false,'rendered choreography acceptance overclaim');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

assert(tokens.version==='1.7.0-dev.16'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.fallbacks.reducedTransparencyMaterial==='solid-fallback','Reduced Transparency fallback missing');
assert(tokens.boundaries.section24Complete===false&&tokens.boundaries.glazeMotionExperimentalLifecyclePromoted===false,'token lifecycle/completion boundary weakened');

for(let i=0;i<relationships.length;i++){
  const input={relationship:relationships[i],relationshipAuthoritative:true,fromState:'before',toState:'after'};
  if(identityRelationships.has(relationships[i])){
    input.objectIdentity='surface-42';
    input.objectIdentityAuthoritative=true;
  }
  const resolved=resolveGlazeSignatureTransitionFamily(input);
  assert(resolved.version==='1.7.0-dev.16','runtime version mismatch: '+relationships[i]);
  assert(resolved.sourceFoundation.relationshipAccepted===true,'relationship rejected: '+relationships[i]);
  assert(resolved.choreography.family===families[i],'family mismatch: '+relationships[i]);
  assert(resolved.choreography.renderedChoreographyAcceptanceEstablished===false,'rendered acceptance overclaim: '+relationships[i]);
  assert(resolved.acceptanceBoundary.section24Complete===false,'Section 24 completion overclaim: '+relationships[i]);
  assert(resolved.authority.providerTruthCreatedByGlaze===false,'provider truth boundary weakened: '+relationships[i]);
}

for(const relationship of identityRelationships){
  for(const objectIdentity of [undefined,null,'','   ']){
    const resolved=resolveGlazeSignatureTransitionFamily({relationship,relationshipAuthoritative:true,objectIdentity,objectIdentityAuthoritative:true});
    assert(resolved.sourceFoundation.relationshipAccepted===false,'missing identity accepted: '+relationship);
    assert(resolved.choreography.family==='Standard transition','missing identity did not fall back: '+relationship);
  }
}

const reduced=resolveGlazeSignatureTransitionFamily({relationship:'same-object-expansion',relationshipAuthoritative:true,objectIdentity:'surface-42',objectIdentityAuthoritative:true,accessibilityProfiles:['reduced-motion']});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion not applied');
assert(reduced.choreography.channels.find(x=>x.channel==='position').enabled===false,'Reduced Motion did not suppress position travel');

const material=resolveGlazeSignatureTransitionFamily({relationship:'material-role-change',relationshipAuthoritative:true,accessibilityProfiles:['reduced-transparency']});
assert(material.choreography.channels.find(x=>x.channel==='material').mode==='solid-fallback','Material Shift solid fallback missing');

const veil=resolveGlazeSignatureTransitionFamily({relationship:'context-overlay',relationshipAuthoritative:true,criticalSurface:true,criticalSurfaceAuthoritative:true});
assert(veil.familyRules.veilCriticalSurfaceCertaintyFirst===true,'critical Veil is not certainty-first');
assert(veil.choreography.channels.find(x=>x.channel==='foreground-material').mode==='certainty-first-solid-capable','critical Veil translucency dependency retained');

for(const key of ['family','signatureFamily','durationMs','easing','spring','physics','keyframes','path','travelPx','distance','rotation','overshoot','bounce','wobble']){
  let failed=false;
  try{resolveGlazeSignatureTransitionFamily({relationship:'workspace-recomposition',relationshipAuthoritative:true,[key]:'arbitrary'});}catch{failed=true;}
  assert(failed,'raw choreography request accepted: '+key);
}

assert(glazeV17SignatureMotionPrinciplesDevelopmentContract.version==='1.7.0-dev.15','dev.15 identity changed');
assert(glazeV17SignatureMotionPrinciplesDevelopmentContract.section24ChoreographyComplete===false,'dev.15 relabeled as Section 24 complete');
assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(glazeV17SignatureTransitionFamiliesDevelopmentContract.version==='1.7.0-dev.16','runtime contract version mismatch');
assert(glazeV17SignatureTransitionFamiliesDevelopmentContract.section24Complete===false,'runtime contract completion overclaim');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=16,'aggregate version regressed below dev.16');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.signatureTransitionFamiliesFoundation==='js/glaze-v1.7-signature-transition-families.dev.mjs','aggregate missing dev.16 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(spec.includes('dev.16 adds the bounded **Section 24 — Glaze Signature Transition Families** semantic choreography layer')&&spec.includes('dev.16 does **not** establish Section 24 completion'),'plan authority boundary missing dev.16 Section 24 provenance');
assert(planned.includes('1.7.0-dev.16')&&planned.includes('Signature Transition Families'),'planned-feature control missing dev.16');
assert(implemented.includes('Signature Transition Families — `1.7.0-dev.16`'),'implemented-feature control missing dev.16');
assert(changelog.includes('1.7.0-dev.16')&&changelog.includes('Signature Transition Families'),'changelog missing dev.16');

console.log('GLAZE UI V1.7 Signature Transition Families Development foundation: PASS');
console.log('Plan binding: v1.2 Section 24');
console.log('Named families: 10');
console.log('Family catalog implemented: true');
console.log('Section 24 complete: false');
console.log('Rendered choreography acceptance: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
