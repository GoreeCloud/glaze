#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeExpandedComponentV12,
  glazeV17ExpandedComponentSystemV12DevelopmentContract
} from '../js/glaze-v1.7-expanded-component-system-v1-2.dev.mjs';
import {glazeV17ExpandedComponentSystemDevelopmentContract} from '../js/glaze-v1.7-expanded-component-system.dev.mjs';
import {glazeV17NotificationActivitySurfacesV12DevelopmentContract} from '../js/glaze-v1.7-notification-activity-surfaces-v1-2.dev.mjs';
import {glazeV17NativeGlazeKitsV12DevelopmentContract} from '../js/glaze-v1.7-native-glaze-kits-v1-2.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/expanded-component-system-v1-2.dev.json');
const schema=json('schemas/v1.7-expanded-component-system-v1-2.schema.json');
const tokens=json('tokens/glaze-v1.7-expanded-component-system-v1-2.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('research/v1.7-expanded-component-system-v1-2.md');
const rootResearch=read('OPEN-SOURCE-RESEARCH.md');

const components=[
  'GlzAdaptivePane','GlzCommandSurface','GlzActivitySurface','GlzNotificationSurface',
  'GlzAdaptiveToolbar','GlzActionCluster','GlzRecoverySurface','GlzProgressSurface',
  'GlzPreferenceGroup','GlzAppearancePicker','GlzThemePreview','GlzColorRolePicker',
  'GlzPalettePreview','GlzAdaptiveSplitView'
];

const relationshipMap={
  GlzAdaptivePane:['workspace-recomposition','focus-transfer'],
  GlzCommandSurface:['context-overlay','transient-elevation','focus-transfer','source-destination-continuity'],
  GlzActivitySurface:['transient-elevation','material-role-change','focus-transfer'],
  GlzNotificationSurface:['transient-elevation','same-object-expansion','material-role-change','color-state-change','focus-transfer'],
  GlzAdaptiveToolbar:['workspace-recomposition','focus-transfer'],
  GlzActionCluster:['workspace-recomposition','focus-transfer'],
  GlzRecoverySurface:['material-role-change','focus-transfer'],
  GlzProgressSurface:['color-state-change','material-role-change','focus-transfer'],
  GlzPreferenceGroup:['same-object-expansion','focus-transfer'],
  GlzAppearancePicker:['context-overlay','same-object-expansion','focus-transfer'],
  GlzThemePreview:['same-object-expansion','color-state-change','material-role-change'],
  GlzColorRolePicker:['context-overlay','same-object-expansion','color-state-change'],
  GlzPalettePreview:['same-object-expansion','color-state-change'],
  GlzAdaptiveSplitView:['workspace-recomposition','posture-partition','focus-transfer']
};

function base(component='GlzAdaptivePane'){
  return {
    component,
    profile:'mobile',
    semanticColorRole:'information',
    semanticProminence:'standard',
    semanticColorAuthoritative:true,
    glazeDefaultThemeToken:'glaze.default',
    previousTaskState:{
      navigationDestination:'settings',
      focusId:'component-control',
      draftText:'preserve',
      selectionIds:['current']
    }
  };
}

assert(read('VERSION').trim()==='1.7.0','bounded V1.7 VERSION changed');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.30 must not create lifecycle promotion state');

for(const phrase of [
  '## 38. Expanded Component System',
  ...components,
  'semantic transition relationships where appropriate instead of embedding arbitrary local animations'
]) assert(spec.includes(phrase),'Section 38 requirement missing: '+phrase);
assert(spec.includes('## 39. Glaze Inspector'),'Section 39 must remain separately governed');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.30'&&contract.lifecycle==='Development','dev.30 identity mismatch');
assert(contract.stableBaseline==='1.6.0'&&contract.consumerEligible===false,'dev.30 lifecycle boundary mismatch');
assert(contract.planVersion==='v1.2'&&JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([38]),'dev.30 Section 38 binding mismatch');
assert(contract.historicalFoundation.version==='1.7.0-dev.10','historical expanded component foundation changed');
assert(contract.historicalFoundation.planNumbering==='v1.1-historical-numbering','historical dev.10 plan provenance missing');
assert(contract.historicalFoundation.historicalSpecificationSection===25,'historical dev.10 section changed');
assert(contract.historicalFoundation.reinterpretedAsV12Section38===false,'dev.10 must not be relabeled as v1.2 Section 38');
assert(JSON.stringify(contract.componentCatalog)===JSON.stringify(components),'Section 38 component catalog mismatch');
assert(JSON.stringify(contract.componentTransitionRelationships)===JSON.stringify(relationshipMap),'Section 38 relationship allowlist mismatch');

for(const key of [
  'semanticRelationshipExposureRequiredWhereMotionUsed','transitionOccurrenceAuthorityRequired',
  'semanticStateAuthorityRequiredForStateChangingRelationships','authoritativeConnectedIdentityRequiredWhereApplicable',
  'specializedNotificationActivityTruthOwnedBySection36','reducedMotionPrecedence',
  'performanceMaySimplifyOptionalMotion','performanceMayRemoveOptionalMotion'
]) assert(contract.componentPolicy[key]===true,'Section 38 policy missing: '+key);
for(const key of [
  'directSignatureFamilySelectionAccepted','localArbitraryAnimationAllowed','embeddedRawAnimationControlsAccepted',
  'finalStateDependsOnAnimationCompletion','focusMayWaitForMotion','navigationMayWaitForMotion',
  'taskStateMayWaitForMotion','motionRequiredToUnderstandState'
]) assert(contract.componentPolicy[key]===false,'Section 38 boundary weakened: '+key);

for(const denied of [
  'semanticRelationshipCreatedByGlaze','providerTruthCreatedByGlaze','progressTruthCreatedByGlaze',
  'recoveryTruthCreatedByGlaze','themeTruthCreatedByGlaze','actionExecutionPerformedByGlaze',
  'navigationExecutionPerformedByGlaze','applicationStateChangedByGlazeMotion'
]) assert(contract.authority[denied]===false,'authority boundary weakened: '+denied);

assert(contract.acceptanceBoundary.section38Complete===false,'Section 38 completion overclaimed');
assert(contract.acceptanceBoundary.renderedAcceptanceEstablished===false,'rendered acceptance overclaimed');
assert(contract.acceptanceBoundary.nativePlatformAcceptanceEstablished===false,'native acceptance overclaimed');

assert(glazeV17ExpandedComponentSystemDevelopmentContract.version==='1.7.0-dev.10','historical dev.10 runtime changed');
assert(glazeV17ExpandedComponentSystemDevelopmentContract.planVersion==='v1.1','historical dev.10 plan version changed');
assert(JSON.stringify(glazeV17ExpandedComponentSystemDevelopmentContract.v11SpecificationSections)===JSON.stringify([25]),'historical dev.10 numbering changed');
assert(glazeV17ExpandedComponentSystemV12DevelopmentContract.version==='1.7.0-dev.30','dev.30 runtime contract mismatch');
assert(glazeV17ExpandedComponentSystemV12DevelopmentContract.historicalFoundationReinterpreted===false,'runtime relabeled dev.10');
assert(glazeV17ExpandedComponentSystemV12DevelopmentContract.localArbitraryAnimationAllowed===false,'runtime allows local arbitrary animation');
assert(glazeV17NotificationActivitySurfacesV12DevelopmentContract.version==='1.7.0-dev.28','Section 36 dependency changed');
assert(glazeV17NativeGlazeKitsV12DevelopmentContract.version==='1.7.0-dev.29','Section 37 dependency changed');

const pane=resolveGlazeExpandedComponentV12({
  ...base('GlzAdaptivePane'),
  transitionRelationship:'workspace-recomposition',
  transitionAuthoritative:true
});
assert(pane.semanticTransition.signatureFamily==='Glaze Flow','AdaptivePane should map recomposition to Glaze Flow');
assert(pane.semanticTransition.relationshipEligible===true&&pane.semanticTransition.optionalMotionApplied===true,'authoritative AdaptivePane relationship should be eligible');
assert(pane.componentState.taskState.navigationDestination==='settings','AdaptivePane motion must preserve navigation');
assert(pane.componentState.taskState.focusId==='component-control','AdaptivePane motion must preserve focus');

const split=resolveGlazeExpandedComponentV12({
  ...base('GlzAdaptiveSplitView'),
  transitionRelationship:'posture-partition',
  transitionAuthoritative:true
});
assert(split.semanticTransition.signatureFamily==='Glaze Fold','AdaptiveSplitView posture change should map to Glaze Fold');

const traceWithoutIdentity=resolveGlazeExpandedComponentV12({
  ...base('GlzCommandSurface'),
  transitionRelationship:'source-destination-continuity',
  transitionAuthoritative:true
});
assert(traceWithoutIdentity.semanticTransition.relationshipAccepted===false,'Trace must require authoritative connected identity');
assert(traceWithoutIdentity.semanticTransition.optionalMotionApplied===false,'Trace without identity must fail closed');

const trace=resolveGlazeExpandedComponentV12({
  ...base('GlzCommandSurface'),
  transitionRelationship:'source-destination-continuity',
  transitionAuthoritative:true,
  connectedIdentity:'command:search-result-42',
  connectedIdentityAuthoritative:true
});
assert(trace.semanticTransition.signatureFamily==='Glaze Trace','authoritative CommandSurface identity should map to Glaze Trace');
assert(trace.semanticTransition.optionalMotionApplied===true,'authoritative Trace should be eligible');

const themeUntrusted=resolveGlazeExpandedComponentV12({
  ...base('GlzThemePreview'),
  transitionRelationship:'color-state-change',
  transitionAuthoritative:true,
  semanticStateAuthoritative:false
});
assert(themeUntrusted.semanticTransition.stateAuthorityRequired===true,'theme color change must require state authority');
assert(themeUntrusted.semanticTransition.relationshipEligible===false,'untrusted theme state must fail closed');
assert(themeUntrusted.semanticTransition.signatureFamily==='Standard transition','untrusted theme state should not claim Color Shift');

const themeTrusted=resolveGlazeExpandedComponentV12({
  ...base('GlzThemePreview'),
  transitionRelationship:'color-state-change',
  transitionAuthoritative:true,
  semanticStateAuthoritative:true
});
assert(themeTrusted.semanticTransition.signatureFamily==='Glaze Color Shift','authoritative theme state should map to Glaze Color Shift');

const recoveryUntrusted=resolveGlazeExpandedComponentV12({
  ...base('GlzRecoverySurface'),
  semanticColorRole:'recovery',
  providerState:'recoverable',
  providerStateAuthoritative:false,
  transitionRelationship:'material-role-change',
  transitionAuthoritative:true,
  semanticStateAuthoritative:true
});
assert(recoveryUntrusted.semanticTransition.providerStateAuthorityRequired===true,'RecoverySurface provider state authority must be required');
assert(recoveryUntrusted.semanticTransition.providerStateAuthoritySatisfied===false,'untrusted recovery state must fail closed');
assert(recoveryUntrusted.semanticTransition.optionalMotionApplied===false,'untrusted recovery state must not animate as authoritative');

const recoveryTrusted=resolveGlazeExpandedComponentV12({
  ...base('GlzRecoverySurface'),
  semanticColorRole:'recovery',
  providerState:'recoverable',
  providerStateAuthoritative:true,
  transitionRelationship:'material-role-change',
  transitionAuthoritative:true,
  semanticStateAuthoritative:true
});
assert(recoveryTrusted.semanticTransition.signatureFamily==='Glaze Material Shift','trusted RecoverySurface should map to Material Shift');
assert(recoveryTrusted.semanticTransition.optionalMotionApplied===true,'trusted recovery relationship should be eligible');

let notificationBypassRejected=false;
try{
  resolveGlazeExpandedComponentV12({
    ...base('GlzNotificationSurface'),
    transitionRelationship:'transient-elevation',
    transitionAuthoritative:true
  });
}catch(error){notificationBypassRejected=error instanceof RangeError;}
assert(notificationBypassRejected,'NotificationSurface motion must not bypass Section 36 truth governance');

const arrival=resolveGlazeExpandedComponentV12({
  ...base('GlzNotificationSurface'),
  notificationTransitionKind:'arrival',
  transitionAuthoritative:true,
  kind:'informational-activity',
  truthAuthoritative:true
});
assert(arrival.semanticTransition.specializedNotificationActivityDelegation===true,'NotificationSurface arrival must delegate to Section 36');
assert(arrival.semanticTransition.signatureFamily==='Glaze Lift','notification arrival should map to Glaze Lift');
assert(arrival.semanticTransition.optionalMotionApplied===true,'authoritative arrival should be eligible');

const progressUntrusted=resolveGlazeExpandedComponentV12({
  ...base('GlzProgressSurface'),
  notificationTransitionKind:'progress',
  transitionAuthoritative:true,
  progressMode:'determinate',
  progressFraction:0.5,
  progressAuthoritative:false
});
assert(progressUntrusted.specializedNotificationActivity.transition.providerTruthSatisfied===false,'untrusted progress truth must fail closed');
assert(progressUntrusted.semanticTransition.optionalMotionApplied===false,'untrusted progress must not animate as authoritative');

const progressTrusted=resolveGlazeExpandedComponentV12({
  ...base('GlzProgressSurface'),
  notificationTransitionKind:'progress',
  transitionAuthoritative:true,
  progressMode:'determinate',
  progressFraction:0.5,
  progressAuthoritative:true
});
assert(progressTrusted.semanticTransition.signatureFamily==='Glaze Color Shift','trusted progress should map to Glaze Color Shift');
assert(progressTrusted.semanticTransition.optionalMotionApplied===true,'trusted progress should be eligible');

const bloomNoIdentity=resolveGlazeExpandedComponentV12({
  ...base('GlzNotificationSurface'),
  notificationTransitionKind:'expansion',
  transitionAuthoritative:true
});
assert(bloomNoIdentity.semanticTransition.relationshipAccepted===false,'notification expansion must require authoritative identity');
assert(bloomNoIdentity.semanticTransition.optionalMotionApplied===false,'expansion without identity must fail closed');

const bloom=resolveGlazeExpandedComponentV12({
  ...base('GlzNotificationSurface'),
  notificationTransitionKind:'expansion',
  transitionAuthoritative:true,
  connectedIdentity:'notification:42',
  connectedIdentityAuthoritative:true
});
assert(bloom.semanticTransition.signatureFamily==='Glaze Bloom','authoritative notification expansion should map to Glaze Bloom');
assert(bloom.semanticTransition.optionalMotionApplied===true,'authoritative notification Bloom should be eligible');

const reduced=resolveGlazeExpandedComponentV12({
  ...base('GlzAdaptiveToolbar'),
  transitionRelationship:'workspace-recomposition',
  transitionAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion must propagate through Section 38');
assert(reduced.performance.mode==='reduced-motion','Reduced Motion must outrank component motion richness');
assert(reduced.accessibility.motionRequiredToUnderstandState===false,'component state must remain understandable without motion');

const pressure=resolveGlazeExpandedComponentV12({
  ...base('GlzAdaptivePane'),
  transitionRelationship:'workspace-recomposition',
  transitionAuthoritative:true,
  runtimePressure:'severe',
  runtimePressureAuthoritative:true
});
assert(pressure.performance.mode==='minimal','severe authoritative runtime pressure must simplify component motion');
assert(pressure.componentState.taskState.draftText==='preserve','performance degradation must not reset task state');

let disallowedRejected=false;
try{
  resolveGlazeExpandedComponentV12({
    ...base('GlzAdaptivePane'),
    transitionRelationship:'material-role-change',
    transitionAuthoritative:true,
    semanticStateAuthoritative:true
  });
}catch(error){disallowedRejected=error instanceof RangeError;}
assert(disallowedRejected,'component-disallowed semantic relationships must fail closed');

for(const raw of [
  {durationMs:240},
  {signatureFamily:'Glaze Bloom'},
  {spring:{stiffness:300}}
]){
  let rejected=false;
  try{resolveGlazeExpandedComponentV12({...base('GlzAdaptivePane'),...raw});}catch(error){rejected=error instanceof RangeError;}
  assert(rejected,'raw/local animation control must be rejected: '+Object.keys(raw)[0]);
}

assert(tokens.version==='1.7.0-dev.30'&&tokens.v12SpecificationSections[0]===38,'dev.30 token identity mismatch');
assert(tokens.componentPolicy.directSignatureFamilySelection==='rejected','token direct-family boundary weakened');
assert(tokens.componentPolicy.localArbitraryAnimation==='rejected','token local-animation boundary weakened');
assert(tokens.accessibility.focusStateIndependentOfAnimation===true,'token focus boundary missing');
assert(tokens.boundaries.section38Complete===false,'token Section 38 completion overclaimed');

for(const phrase of [
  'Radix Primitives','f7ecd5ab16f5e1e820eb5786a1419a98a2d594ae','MIT',
  'Material Web','cbd34a8921915af94d5ef65c2a69eece41d5b4f3','Apache-2.0',
  'Microsoft Fluent UI','8add8c8750c34c85acd811e32ab324abf8f1562e',
  'W3C ARIA Authoring Practices','3f094fde1c81b25dfa69162563bf28d093f854d4',
  'No third-party source code'
]) assert(research.includes(phrase),'research provenance missing: '+phrase);
assert(rootResearch.includes('## V1.7 dev.30 — Expanded Component System v1.2'),'root research register missing dev.30');
assert(contract.researchProvenance.independentReimplementation===true,'independent reimplementation boundary missing');
for(const key of ['upstreamSourceCopied','upstreamAnimationValuesCopied','upstreamAssetsCopied','upstreamVisualIdentityCopied']){
  assert(contract.researchProvenance[key]===false,'research copying boundary weakened: '+key);
}

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=30,'aggregate version regressed below dev.30');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38]){
  assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
}
assert(glazeV17Development.expandedComponentSystemV12Foundation==='js/glaze-v1.7-expanded-component-system-v1-2.dev.mjs','aggregate missing dev.30 foundation');
assert(glazeV17Development.expandedComponentSystemHistoricalFoundationReinterpretedAsV12===false,'aggregate relabeled historical dev.10');
assert(glazeV17Development.expandedComponentSystemV12ResearchRecord==='research/v1.7-expanded-component-system-v1-2.md','aggregate missing dev.30 research record');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(spec.includes('dev.30')&&spec.includes('Section 38'),'plan provenance missing dev.30');
assert(planned.includes('1.7.0-dev.30')&&planned.includes('Expanded Component System'),'planned-feature control missing dev.30');
assert(implemented.includes('Expanded Component System v1.2 — `1.7.0-dev.30`'),'implemented-feature control missing dev.30');
assert(changelog.includes('1.7.0-dev.30')&&changelog.includes('Expanded Component System'),'changelog missing dev.30');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

console.log('GLAZE UI V1.7 Expanded Component System v1.2 Development validation: PASS');
console.log('Plan binding: v1.2 Section 38');
console.log('Historical dev.10 provenance preserved: true');
console.log('Component catalog: 14');
console.log('Local arbitrary animation allowed: false');
console.log('Section 38 complete: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
