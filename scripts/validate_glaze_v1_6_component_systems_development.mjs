#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeVisualComplexity,
  resolveGlazeEnergyPresentation,
  evaluateGlazeComponentStateCompleteness,
  evaluateGlazeComponentComposition,
  resolveGlazeFormField,
  resolveGlazeSaveState,
  resolveGlazeTablePresentation,
  resolveGlazeChartAccessibility,
  resolveGlazeMediaControls,
  resolveGlazeScrollPresentation,
  resolveGlazeBackgroundActivity,
  glazeV16ComponentSystemsDevelopmentContract
} from '../js/glaze-v1.6-component-systems.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.6/component-systems.dev.json');
const schema = json('schemas/v1.6-component-systems.schema.json');
const tokens = json('tokens/glaze-v1.6-component-systems.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_6_PLANNED.md');

const sections = [60,61,62,63,64,65,66,67,68,69,70];
const requiredStates = ['default','hover','focused','pressed','selected','disabled','loading','error'];
const saveStates = ['unsaved','saving','saved','save-failed','conflict','offline-pending'];

assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
const stableTuple = stable.split('.').slice(0, 3).map(Number);
assert(stableTuple.length === 3 && stableTuple.every(Number.isInteger), 'live Stable must use major.minor.patch versioning');
assert(
  stableTuple[0] > 1 || (stableTuple[0] === 1 && (stableTuple[1] > 5 || (stableTuple[1] === 5 && stableTuple[2] >= 1))),
  'V1.6 retained Development validation requires live Stable authority at or after its frozen 1.5.1 baseline'
);
assert((lifecycle.activeCandidate === null || lifecycle.activeCandidate === '1.6.0-rc.1'), 'V1.6 Development validation permits only no active Candidate or governed 1.6.0-rc.1');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.6 Development must not create patch RC');

for (const number of sections) {
  assert(spec.includes(`# ${number}.`), `planned specification missing section ${number}`);
}

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.6-component-systems.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.6.0-dev.7', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.5.1', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify(sections), 'implemented section set mismatch');
assert(contract.visualComplexity.optionalEffectsSimplifyWhenExceeded === true, 'complexity must simplify optional effects');
assert(contract.visualComplexity.semanticContentMayBeRemovedToMeetBudget === false, 'complexity budget must preserve semantic content');
assert(contract.energyAwareness.idleBackgroundsCalm === true, 'idle backgrounds must calm');
assert(contract.componentStateCompleteness.criticalStatesMayBeApplicationGuesswork === false, 'critical component state guesswork must be prohibited');
assert(contract.componentComposition.nestedTransparencyDefaultAllowed === false, 'nested transparency must not be default');
assert(contract.forms.validationNearFieldRequired === true, 'form validation must remain near field');
assert(contract.saveState.savedRequiresAuthoritativePersistenceTruth === true, 'Saved must require authoritative persistence truth');
assert(contract.tables.transparencyPolicy === 'solid-or-near-solid', 'dense table transparency must be conservative');
assert(contract.charts.colorOnlyMeaningAllowed === false, 'charts must not rely on color alone');
assert(contract.scroll.decorativeEffectsMayBlockContentAccess === false, 'scroll effects must not block content access');
assert(contract.backgroundActivity.nonBlockingWorkMayUseBlockingLoader === false, 'nonblocking work must not use blocking loader');

assert(tokens.version === '1.6.0-dev.7', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.5.1', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(tokens.complexity.optionalEffectsSimplify === true, 'complexity token map must simplify optional effects');
assert(tokens.componentStates.applicationGuessworkForMissingCriticalStateAllowed === false, 'component token map must prohibit state guesswork');
assert(tokens.composition.nestedTransparencyDefaultAllowed === false, 'composition token map must reject nested transparency');
assert(tokens.saveStates.savedRequiresAuthority === true, 'save token map must require authority');
assert(tokens.chart.colorOnlyMeaningAllowed === false, 'chart token map must reject color-only meaning');
assert(tokens.scroll.decorativeEffectsMayBlockAccess === false, 'scroll token map must preserve access');
assert(tokens.backgroundActivity.nonBlockingMayUseBlockingLoader === false, 'background activity map must preserve nonblocking behavior');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

assert(glazeV16ComponentSystemsDevelopmentContract.version === '1.6.0-dev.7', 'runtime contract version mismatch');
assert(glazeV16ComponentSystemsDevelopmentContract.lifecycle === 'development', 'runtime contract must remain development');
assert(glazeV16ComponentSystemsDevelopmentContract.consumerEligible === false, 'runtime contract must remain non-consumer-eligible');
assert(glazeV16ComponentSystemsDevelopmentContract.optionalEffectsSimplifyWhenOverBudget === true, 'runtime must simplify over-budget effects');
assert(glazeV16ComponentSystemsDevelopmentContract.componentCriticalStatesMayBeApplicationGuesswork === false, 'runtime must prohibit component state guesswork');
assert(glazeV16ComponentSystemsDevelopmentContract.chartColorOnlyMeaningAllowed === false, 'runtime chart semantics must not be color-only');
assert(glazeV16ComponentSystemsDevelopmentContract.nonBlockingActivityMayUseBlockingLoader === false, 'runtime must protect nonblocking work');

const aggregateVersionParts = String(glazeV16Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.6.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 7,
  'aggregate Development version must retain or advance beyond dev.7'
);
assert(glazeV16Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV16Development.stableBaseline === '1.5.1', 'aggregate Stable baseline mismatch');
assert(glazeV16Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const number of sections) {
  assert(glazeV16Development.implementedSpecificationSections.includes(number), `aggregate must retain component-system section ${number}`);
}
for (const retained of [1,6,10,15,29,41,55,59,71,73]) {
  assert(glazeV16Development.implementedSpecificationSections.includes(retained), `aggregate lost prior section ${retained}`);
}

const withinBudget = resolveGlazeVisualComplexity({
  observed:{
    transparentLayers:2,
    blurLayers:1,
    shadows:2,
    animatedSurfaces:1,
    gradientLayers:1,
    liveBackgrounds:0,
    skeletonAnimations:2
  },
  performanceLevel:'full'
});
assert(withinBudget.overBudget === false, 'within-budget surface incorrectly classified over budget');
assert(withinBudget.presentation.simplifyOptionalEffects === false, 'within-budget full presentation should not simplify');

const overBudget = resolveGlazeVisualComplexity({
  observed:{
    transparentLayers:7,
    blurLayers:3,
    shadows:6,
    animatedSurfaces:8,
    gradientLayers:5,
    liveBackgrounds:2,
    skeletonAnimations:10
  },
  performanceLevel:'balanced'
});
assert(overBudget.overBudget === true, 'over-budget surface not detected');
assert(overBudget.presentation.simplifyOptionalEffects === true, 'over-budget surface must simplify');
assert(overBudget.exceededDimensions.length === 7, 'all over-budget dimensions should be reported');
assert(overBudget.presentation.simplificationActions.includes('remove-nested-or-optional-blur'), 'blur simplification missing');
assert(overBudget.presentation.semanticContentMayBeRemovedToMeetBudget === false, 'complexity simplification must preserve semantic content');
assert(overBudget.presentation.accessibilityMayBeReducedToMeetBudget === false, 'complexity simplification must preserve accessibility');

const accessibleComplexity = resolveGlazeVisualComplexity({
  observed:{transparentLayers:1},
  accessibilityProfiles:['reduced-transparency']
});
assert(accessibleComplexity.presentation.simplifyOptionalEffects === true, 'Reduced Transparency must simplify optional effects');

const activeEnergy = resolveGlazeEnergyPresentation({
  activity:'active',
  nowMs:5000,
  previousPerformance:{level:'full',acceptedAtMs:0},
  renderingCapability:'full',
  recoveryStableMs:5000
});
assert(activeEnergy.presentation.continuousDecorativeAnimationAllowed === true, 'active unconstrained state may allow bounded decorative animation');
assert(activeEnergy.presentation.idleBackgroundShouldCalm === false, 'active state must not be treated as idle');

const idleEnergy = resolveGlazeEnergyPresentation({
  activity:'idle',
  nowMs:5000,
  previousPerformance:{level:'full',acceptedAtMs:0}
});
assert(idleEnergy.presentation.continuousDecorativeAnimationAllowed === false, 'idle state must constrain continuous decorative animation');
assert(idleEnergy.presentation.liveBackgroundMotionAllowed === false, 'idle state must calm live background');
assert(idleEnergy.presentation.idleBackgroundShouldCalm === true, 'idle calm marker missing');

const powerSaving = resolveGlazeEnergyPresentation({
  activity:'active',
  powerSaving:true,
  nowMs:100,
  previousPerformance:{level:'full',acceptedAtMs:0}
});
assert(powerSaving.presentation.continuousDecorativeAnimationAllowed === false, 'power saving must constrain decorative animation');
assert(powerSaving.authority.powerStateOwnedByPlatform === true, 'power truth must remain platform owned');

const completeComponent = evaluateGlazeComponentStateCompleteness({
  componentId:'glaze-button',
  declaredStates:requiredStates
});
assert(completeComponent.complete === true, 'component with all minimum states should be complete');
assert(completeComponent.missingStates.length === 0, 'complete component should have no missing states');

const incompleteComponent = evaluateGlazeComponentStateCompleteness({
  componentId:'glaze-row',
  declaredStates:['default','hover','focused','pressed'],
  applicableAdditionalStates:['offline','restricted']
});
assert(incompleteComponent.complete === false, 'incomplete component incorrectly accepted');
for (const state of ['selected','disabled','loading','error','offline','restricted']) {
  assert(incompleteComponent.missingStates.includes(state), `missing state not reported: ${state}`);
}
assert(incompleteComponent.rules.applicationSpecificGuessworkAllowedForMissingCriticalStates === false, 'missing states must not be delegated to app guesswork');

const safeComposition = evaluateGlazeComponentComposition({
  parentKind:'surface',
  childKind:'group',
  transparentAncestors:0,
  borderAncestors:0,
  elevationAncestors:0,
  repeatedPaddingLayers:1
});
assert(safeComposition.safeToNest === true, 'simple component composition should be safe');

const unsafeComposition = evaluateGlazeComponentComposition({
  parentKind:'glaze-surface',
  childKind:'raised-surface',
  transparentAncestors:1,
  borderAncestors:1,
  elevationAncestors:2,
  repeatedPaddingLayers:2,
  childTransparent:true,
  childBordered:true,
  childElevated:true
});
for (const violation of ['nested-transparency','repeated-borders','conflicting-elevation','repeated-padding']) {
  assert(unsafeComposition.violations.includes(violation), `composition violation missing: ${violation}`);
}
assert(unsafeComposition.safeToNest === false, 'unsafe composition incorrectly accepted');

const invalidField = resolveGlazeFormField({
  designation:'required',
  state:'invalid',
  message:'Enter a valid address.',
  inlineHelp:'Use a complete address.'
});
assert(invalidField.presentation.requiredIndicator === true, 'required field indicator missing');
assert(invalidField.presentation.validationNearFieldRequired === true, 'invalid field must show near-field validation');
assert(invalidField.presentation.accessibleValidationAssociationRequired === true, 'invalid field must associate validation accessibly');
assert(invalidField.presentation.stateMayRelyOnColorAlone === false, 'form state must not be color-only');

const readOnlyField = resolveGlazeFormField({
  designation:'optional',
  state:'read-only'
});
assert(readOnlyField.interaction.editable === false, 'read-only field must not be editable');
assert(readOnlyField.interaction.focusable === true, 'read-only field may remain focusable/readable');
assert(readOnlyField.presentation.disabledDistinctFromReadOnly === true, 'read-only must remain distinct from disabled');

for (const state of saveStates) {
  const resolved = resolveGlazeSaveState({
    state,
    authoritative: state === 'saved'
  });
  assert(resolved.acceptedState === state, `save state failed: ${state}`);
  assert(resolved.presentation.explicitFeedbackRequired === true, `save feedback must be explicit: ${state}`);
  assert(resolved.presentation.nonColorIndicatorRequired === true, `save state must have non-color indicator: ${state}`);
}

const unverifiedSaved = resolveGlazeSaveState({
  state:'saved',
  authoritative:false
});
assert(unverifiedSaved.acceptedState === 'unsaved', 'unverified Saved claim must fail closed');
assert(unverifiedSaved.authority.savedStateCreatedByGlaze === false, 'Glaze must not create persistence truth');

const table = resolveGlazeTablePresentation({
  features:[
    'sticky-headers','row-focus','selection','sortable-columns',
    'responsive-collapse','horizontal-overflow','loading-rows',
    'empty-state','error-state','compact-density',
    'accessible-row-column-semantics'
  ],
  density:'compact',
  narrow:true,
  largeText:true
});
assert(table.presentation.stickyHeaders === true, 'table sticky header behavior missing');
assert(table.presentation.transparencyPolicy === 'solid-or-near-solid', 'dense table must use conservative material');
assert(table.presentation.compactMayShrinkTargetsBelowMinimum === false, 'compact table must preserve targets');
assert(table.accessibility.rowColumnSemanticsRequired === true, 'table row/column semantics missing');
assert(table.accessibility.keyboardRowAndCellAccessRequired === true, 'table keyboard semantics missing');
assert(table.accessibility.largeTextMayPreferResponsiveCollapse === true, 'large-text table must allow responsive collapse');

const accessibleChart = resolveGlazeChartAccessibility({
  essentialInformation:true,
  alternatives:['labels','values','summary','accessible-description','table']
});
assert(accessibleChart.complete === true, 'chart with nonvisual alternatives should be complete');
assert(accessibleChart.accessibility.colorOnlyMeaningAllowed === false, 'chart must not rely on color');
assert(accessibleChart.accessibility.tableAlternativeSupported === true, 'chart table alternative missing');

const inaccessibleChart = resolveGlazeChartAccessibility({
  essentialInformation:true,
  alternatives:['labels']
});
assert(inaccessibleChart.complete === false, 'essential chart without sufficient nonvisual content should be incomplete');
assert(inaccessibleChart.authority.summaryContentInventedByGlaze === false, 'Glaze must not invent chart summary');

const media = resolveGlazeMediaControls({
  backgroundComplexity:'high',
  performanceLevel:'balanced'
});
assert(media.rules.controlLegibilityProtected === true, 'media controls must protect legibility');
assert(media.protection.includes('contrast-surface'), 'media contrast surface missing');
assert(media.protection.includes('scrim'), 'complex media background should include scrim');
assert(media.protection.includes('protected-text'), 'media protected text missing');
assert(media.rules.mediaContentMayOverrideControlContrast === false, 'media content must not override control contrast');

const scroll = resolveGlazeScrollPresentation({
  features:[
    'scrollbar-presentation','overscroll','restoration',
    'sticky-surfaces','nested-scrolling','keyboard-scrolling'
  ],
  restorationKey:'results-scroll',
  nested:true
});
assert(scroll.presentation.scrollbarPresentationStandardized === true, 'scrollbar presentation must be standardized');
assert(scroll.presentation.keyboardScrollingRequired === true, 'keyboard scrolling must be required');
assert(scroll.presentation.decorativeScrollEffectsMayBlockContentAccess === false, 'decorative scroll effects must not block access');
assert(scroll.presentation.stickySurfacesMayObscureFocusedContent === false, 'sticky surface must not obscure focused content');
assert(scroll.continuity.restorationKey === 'results-scroll', 'scroll restoration key lost');

const syncActivity = resolveGlazeBackgroundActivity({
  kind:'sync',
  blocking:false
});
assert(syncActivity.surface === 'inline-sync-marker', 'nonblocking sync should use inline sync marker');
assert(syncActivity.presentation.fullBlockingLoaderAllowed === false, 'nonblocking sync must not permit blocking loader');
assert(syncActivity.presentation.existingInterfaceRemainsUsable === true, 'nonblocking sync must preserve interface usability');

const transfer = resolveGlazeBackgroundActivity({
  kind:'transfer',
  blocking:false,
  progress:0.4
});
assert(transfer.surface === 'small-progress-surface', 'nonblocking determinate transfer should use small progress surface');
assert(transfer.progress === 0.4, 'truthful background progress lost');
assert(transfer.presentation.fakeProgressGenerated === false, 'background activity must not invent progress');

const blocking = resolveGlazeBackgroundActivity({
  kind:'processing',
  blocking:true
});
assert(blocking.surface === 'blocking-loader', 'genuinely blocking work may use blocking loader');
assert(blocking.presentation.interruptUser === true, 'blocking activity must indicate interruption truth');
assert(blocking.authority.blockingTruthOwnedByApplication === true, 'blocking truth must remain application owned');

let invalidActivity=false;
try { resolveGlazeEnergyPresentation({activity:'sleepy-ish'}); } catch { invalidActivity=true; }
assert(invalidActivity, 'unknown energy activity must fail closed');

let missingComponentId=false;
try { evaluateGlazeComponentStateCompleteness({declaredStates:requiredStates}); } catch { missingComponentId=true; }
assert(missingComponentId, 'component state validation must require componentId');

let invalidComposition=false;
try { evaluateGlazeComponentComposition({parentKind:'mystery',childKind:'group'}); } catch { invalidComposition=true; }
assert(invalidComposition, 'unknown component composition kind must fail closed');

let invalidFieldState=false;
try { resolveGlazeFormField({designation:'required',state:'probably-valid'}); } catch { invalidFieldState=true; }
assert(invalidFieldState, 'unknown field state must fail closed');

let invalidSave=false;
try { resolveGlazeSaveState({state:'maybe-saved'}); } catch { invalidSave=true; }
assert(invalidSave, 'unknown save state must fail closed');

console.log('GLAZE UI V1.6 component systems Development foundation: PASS');
console.log('Complexity dimensions: 7');
console.log('Required component states: 8');
console.log('Save states: 6');
console.log('Table features: 11');
console.log('Chart alternatives: 5');
console.log('Implemented sections: 60-70');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
