#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveGlazeContinuityAwareMotion,resolveGlazeThemeContinuityTransition,glazeV17ContinuityAwareMotionDevelopmentContract} from '../js/glaze-v1.7-continuity-aware-motion.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/continuity-aware-motion.dev.json');
const schema=json('schemas/v1.7-continuity-aware-motion.schema.json');
const tokens=json('tokens/glaze-v1.7-continuity-aware-motion.dev.json');
const lifecycle=json('registry/lifecycle.json');
const stable=read('VERSION').trim();
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');

const events=["surface-relocation","composition-change","retained-object-identity","focus-movement","pane-primacy-change","compact-expanded-transition","theme-change"];

assert(stable==='1.7.0','dev.13 must coexist with bounded Glaze V1.7 / 1.7.0 Stable');
assert(lifecycle.currentOfficial===stable&&lifecycle.currentStable===stable,'Stable authority mismatch');
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'dev.13 must not create Candidate state');
assert(lifecycle.plannedNext==='1.7.1','dev.13 must not mutate plannedNext');

assert(spec.includes("dev.13's “v1.1 Section 28 Continuity-Aware Motion”")&&spec.includes('must **not** be reinterpreted as v1.2 Section 28 Theme Transition System'),'v1.2 plan must preserve dev.13 v1.1 provenance');
for(const heading of ['## 22. Glaze Signature Motion System','## 26. Adaptive Composition Motion','## 28. Theme Transition System','## 31. Reduced Motion Equivalents','## 34. Glaze Motion Lifecycle']) {
  assert(spec.includes(heading),`V1.7 v1.2 motion reconciliation area missing: ${heading}`);
}
assert(spec.includes('### Glaze Focus Transfer'),'V1.7 v1.2 must retain focus-transfer motion semantics');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema version mismatch');
assert(contract.version==='1.7.0-dev.13'&&contract.lifecycle==='Development'&&contract.consumerEligible===false,'contract lifecycle mismatch');
assert(contract.planVersion==='v1.1','plan version mismatch');
assert(JSON.stringify(contract.v11SpecificationSections)===JSON.stringify([28]),'Section 28 marker mismatch');
assert(JSON.stringify(contract.continuityEvents)===JSON.stringify(events),'continuity event catalog mismatch');
assert(contract.principles.primaryPurpose==='explain-continuity','continuity purpose mismatch');
assert(contract.principles.reducedMotionEquivalentRequired===true,'Reduced Motion equivalent missing');
assert(contract.principles.finalStateDependsOnAnimationCompletion===false,'final state must not depend on animation');
assert(contract.principles.largeContinuousRainbowEffectsDefault===false&&contract.principles.decorativeAnimationDefault===false,'decorative/chromatic defaults weakened');
assert(contract.authority.providerTruthCreatedByMotion===false&&contract.authority.actionExecutedByMotion===false,'motion authority boundary weakened');
assert(contract.accessibility.reducedMotionPrecedence===true&&contract.accessibility.staticOrMinimalEquivalentRequired===true,'accessibility boundary weakened');
assert(contract.acceptanceBoundary.section28Complete===false,'dev.13 must not claim Section 28 complete');
for(const source of Object.values(contract.integrationFoundations))assert(fs.existsSync(path.join(root,source)),`missing motion integration source: ${source}`);

assert(tokens.version==='1.7.0-dev.13'&&tokens.consumerEligible===false,'token lifecycle mismatch');
assert(JSON.stringify(tokens.continuityEvents)===JSON.stringify(events),'token event catalog mismatch');
assert(tokens.reducedMotion.precedence===true&&tokens.reducedMotion.equivalentRequired===true,'token Reduced Motion boundary weakened');
assert(tokens.chromaticPolicy.continuousRainbowDefault===false&&tokens.chromaticPolicy.decorativeAnimationDefault===false,'token chromatic boundary weakened');

const base={
  previousTaskState:{navigationDestination:'settings',focusId:'theme-preview',draftText:'preserve',paneState:{primary:'detail'}},
  semanticColorRole:'information'
};

for(const event of events){
  const input={...base,event};
  if(event==='retained-object-identity')Object.assign(input,{objectIdentity:'memo-card-42',objectIdentityAuthoritative:true});
  if(event==='focus-movement')Object.assign(input,{focusTarget:'appearance-picker',focusTargetAuthoritative:true});
  if(event==='pane-primacy-change')Object.assign(input,{primaryPane:'detail',primaryPaneAuthoritative:true});
  if(event==='compact-expanded-transition')Object.assign(input,{direction:'expand'});
  const resolved=resolveGlazeContinuityAwareMotion(input);
  assert(resolved.event===event,`event mismatch: ${event}`);
  assert(resolved.continuity.motionPurpose==='explain-continuity',`motion purpose lost: ${event}`);
  assert(resolved.continuity.taskResetAllowed===false,`task reset boundary weakened: ${event}`);
  assert(resolved.continuity.finalStateDependsOnAnimationCompletion===false,`final state boundary weakened: ${event}`);
  assert(resolved.taskState.draftText==='preserve',`draft continuity lost: ${event}`);
  assert(resolved.authority.providerTruthCreatedByMotion===false,`provider truth boundary weakened: ${event}`);
  assert(resolved.chromatic.continuousRainbowAllowed===false,`rainbow default weakened: ${event}`);
}

const reduced=resolveGlazeContinuityAwareMotion({
  ...base,
  event:'surface-relocation',
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion application missing');
assert(reduced.motion.presentation.continuousMotionAllowed===false,'Reduced Motion must disable continuous motion');
assert(reduced.accessibility.staticOrMinimalEquivalentRequired===true,'Reduced Motion equivalent requirement missing');
assert(reduced.continuity.motionRequiredToUnderstandState===false,'motion must not be required to understand state');

const untrustedIdentity=resolveGlazeContinuityAwareMotion({
  ...base,event:'retained-object-identity',objectIdentity:'memo-card-42',objectIdentityAuthoritative:false
});
assert(untrustedIdentity.observed.objectIdentity.accepted===null&&untrustedIdentity.observed.objectIdentity.withheldWithoutAuthority===true,'untrusted object identity must be withheld');

const untrustedFocus=resolveGlazeContinuityAwareMotion({
  ...base,event:'focus-movement',focusTarget:'danger-zone',focusTargetAuthoritative:false
});
assert(untrustedFocus.observed.focusTarget.accepted===null&&untrustedFocus.authority.focusTargetCreatedByMotion===false,'untrusted focus target must fail closed');

const collapse=resolveGlazeContinuityAwareMotion({...base,event:'compact-expanded-transition',direction:'collapse'});
assert(collapse.motion.family==='collapse','compact/expanded collapse mapping mismatch');

const theme=resolveGlazeThemeContinuityTransition({
  ...base,fromTheme:'light',toTheme:'dark',accessibilityProfiles:['minimal-motion']
});
assert(theme.event==='theme-change'&&theme.chromatic.themeColorMaterialTransitionAllowed===true,'theme continuity mapping missing');
assert(theme.chromatic.continuousRainbowAllowed===false&&theme.chromatic.decorativeAnimationDefault===false,'theme chromatic boundary weakened');
assert(theme.accessibility.reducedMotionApplied===true,'theme transition must honor Reduced Motion');

for(const bad of [
  ()=>resolveGlazeContinuityAwareMotion({...base,event:'spin-forever'}),
  ()=>resolveGlazeContinuityAwareMotion({...base,event:'compact-expanded-transition',direction:'sideways'})
]){
  let failed=false;try{bad();}catch{failed=true;}assert(failed,'unsupported motion input must fail closed');
}

assert(glazeV17ContinuityAwareMotionDevelopmentContract.version==='1.7.0-dev.13','runtime contract version mismatch');
assert(glazeV17ContinuityAwareMotionDevelopmentContract.section28Complete===false&&glazeV17ContinuityAwareMotionDevelopmentContract.consumerEligible===false,'runtime lifecycle overclaim');
assert(glazeV17ContinuityAwareMotionDevelopmentContract.reducedMotionPrecedence===true,'runtime Reduced Motion boundary weakened');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=13,'aggregate version regressed below dev.13');
assert(glazeV17Development.lifecycle==='development'&&glazeV17Development.stableBaseline==='1.6.0'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const n of [7,8,9,10,11,12,13,18,19,21,24,25,26,27,28])assert(glazeV17Development.planV11FoundationSections.includes(n),`aggregate missing v1.1 foundation ${n}`);
assert(glazeV17Development.continuityAwareMotionFoundation==='js/glaze-v1.7-continuity-aware-motion.dev.mjs','aggregate missing dev.13 motion foundation');
assert(glazeV17Development.studioFoundation==='js/glaze-v1.7-studio.dev.mjs','aggregate lost dev.12');
assert(glazeV17Development.inspectorFoundation==='js/glaze-v1.7-inspector.dev.mjs','aggregate lost dev.11');
assert(glazeV17Development.expandedComponentSystemFoundation==='js/glaze-v1.7-expanded-component-system.dev.mjs','aggregate lost dev.10');
assert(glazeV17Development.providerTruthManufactured===false,'aggregate provider-truth boundary weakened');

assert(planned.includes('1.7.0-dev.13')&&planned.includes('Continuity-Aware Motion'),'planned control missing dev.13');
assert(planned.includes('1.7.0-dev.12')&&planned.includes('Glaze Studio'),'planned control lost dev.12 provenance');
assert(planned.includes('1.7.0-dev.7')&&planned.includes('historical dev tranche numbers'),'planned control lost historical provenance');
assert(implemented.includes('Continuity-Aware Motion — `1.7.0-dev.13`'),'implemented control missing dev.13');
assert(changelog.includes('1.7.0-dev.13')&&changelog.includes('Continuity-Aware Motion'),'changelog missing dev.13');

console.log('GLAZE UI V1.7 Continuity-Aware Motion Development foundation: PASS');
console.log('Continuity events: 7');
console.log('Reduced Motion equivalents required: true');
console.log('Section 28 complete: false');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
