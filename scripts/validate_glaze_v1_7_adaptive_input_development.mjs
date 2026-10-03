#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeSemanticAction,
  resolveGlazeInteractionAlternative,
  resolveGlazeAdaptiveInputBinding,
  resolveGlazeInputTransition,
  glazeV17AdaptiveInputDevelopmentContract
} from '../js/glaze-v1.7-adaptive-input.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.7/adaptive-input.dev.json');
const schema = json('schemas/v1.7-adaptive-input.schema.json');
const tokens = json('tokens/glaze-v1.7-adaptive-input.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_7_PLANNED.md');

const inputModels = [
  'touch',
  'pointer',
  'keyboard',
  'stylus',
  'remote-dpad',
  'rotary',
  'switch-access',
  'voice-access',
  'assistive-input'
];
const actionStates = [
  'available',
  'unavailable',
  'unsupported',
  'restricted',
  'permission-required',
  'temporarily-unavailable',
  'unknown'
];
const dependencies = [
  'drag',
  'swipe',
  'hover',
  'long-press',
  'precision-pointer',
  'multi-touch'
];

assert(stable === '1.7.0', 'V1.7 dev.2 must coexist with bounded Glaze V1.7 / 1.7.0 as current Stable');
assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
assert(lifecycle.activeCandidate === null, 'V1.7 dev.2 must not create an active Candidate');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.7 dev.2 must not create a patch RC');
assert(lifecycle.plannedNext==='1.7.1', 'V1.7 dev.2 must not mutate lifecycle plannedNext');

assert(spec.includes('## 2. Adaptive Input 2.0'), 'V1.7 specification missing Adaptive Input 2.0 section');
for (const inputLabel of ['Touch','Pointer','Keyboard','Stylus','Remote/D-pad','Rotary input','Switch access','Voice access','Assistive input systems']) {
  assert(spec.includes(inputLabel), `V1.7 v1.2 specification missing input requirement: ${inputLabel}`);
}

assert(fs.existsSync(path.join(root, 'IMPLEMENTED-FEATURES.md')), 'IMPLEMENTED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'PLANNED-FEATURES.md')), 'PLANNED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'CHANGELOGS.md')), 'CHANGELOGS.md is required');
assert(!fs.existsSync(path.join(root, 'FEATURE-ROADMAP.md')), 'FEATURE-ROADMAP.md must remain retired');
assert(!fs.existsSync(path.join(root, 'CHANGELOG.md')), 'legacy singular CHANGELOG.md must remain retired');

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.7-adaptive-input.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.7.0-dev.2', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.6.0', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify([2]), 'implemented section set mismatch');
assert(JSON.stringify(contract.inputModels) === JSON.stringify(inputModels), 'input model set mismatch');
assert(JSON.stringify(contract.semanticActions.availabilityStates) === JSON.stringify(actionStates), 'action state set mismatch');
assert(JSON.stringify(contract.interactionDependencies.dependencies) === JSON.stringify(dependencies), 'dependency set mismatch');
assert(contract.semanticActions.actionDefinedIndependentlyFromPhysicalBinding === true, 'semantic actions must remain independent from physical bindings');
assert(contract.semanticActions.positiveAvailabilityRequiresExplicitAuthority === true, 'positive action availability must require explicit authority');
assert(contract.semanticActions.inputMethodChangeMayChangeAvailabilityByItself === false, 'input changes must not change availability by themselves');
assert(contract.semanticActions.physicalKeyOrGestureIsSemanticAuthority === false, 'physical binding must not become semantic authority');
assert(contract.interactionDependencies.alternativeRequiredWhenUnavailableOrUnsuitable === true, 'unavailable dependencies must require alternatives');
for (const dependency of dependencies) {
  assert(contract.interactionDependencies.alternatives[dependency].length > 0, `dependency missing alternatives: ${dependency}`);
}
assert(contract.continuity.inputChangeUsesEnvironmentChange === 'input-method', 'input transition must use Task Continuity input-method change');
assert(contract.continuity.taskLossAllowed === false, 'input changes must not allow task loss');
assert(contract.continuity.navigationResetAllowed === false, 'input changes must not reset navigation');
assert(contract.continuity.focusResetAllowed === false, 'input changes must not reset focus');
assert(contract.continuity.selectionResetAllowed === false, 'input changes must not reset selection');
assert(contract.continuity.draftResetAllowed === false, 'input changes must not reset drafts');
assert(contract.continuity.commandAvailabilityMayVaryOnlyFromInputChange === false, 'command availability must not vary solely from input changes');
assert(contract.authority.boundary === 'presentation-only', 'Adaptive Input must remain presentation-only');
assert(contract.authority.authorizationGrantedByGlaze === false, 'Glaze must not grant authorization');
assert(contract.authority.permissionGrantedByGlaze === false, 'Glaze must not grant permission');
assert(contract.authority.consentGrantedByGlaze === false, 'Glaze must not grant consent');
assert(contract.authority.capabilityCreatedByGlaze === false, 'Glaze must not create capability');
assert(contract.authority.executionAuthorityCreatedByGlaze === false, 'Glaze must not create execution authority');
assert(contract.authority.consequentialExecutionAutomatic === false, 'Glaze must not auto-execute consequential actions');

assert(tokens.version === '1.7.0-dev.2', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.6.0', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(Object.keys(tokens.inputModels).length === 9, 'token map must expose nine input models');
assert(Object.keys(tokens.actionAvailability).length === 7, 'token map must expose seven action availability states');
assert(Object.keys(tokens.interactionDependencies).length === 6, 'token map must expose six dependency roles');
assert(Object.keys(tokens.semanticAlternatives).length === 6, 'token map must expose alternatives for every dependency');
assert(Object.keys(tokens.bindingRoles).length === 9, 'token map must expose nine binding roles');
assert(tokens.continuity.taskStateResetAllowed === false, 'token map must prohibit task reset on input change');
assert(tokens.continuity.commandAvailabilityMayVaryOnlyFromInputChange === false, 'token map must prohibit input-only command-availability drift');
assert(tokens.boundaries.physicalBindingCreatesSemanticAuthority === false, 'token map must reject physical binding authority');
assert(tokens.boundaries.actionAvailabilityRequiresAuthority === true, 'token map must require action authority');
assert(tokens.boundaries.executionAuthorityCreatedByGlaze === false, 'token map must not create execution authority');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

for (const state of actionStates) {
  const resolved = resolveGlazeSemanticAction({
    actionId: 'open-item',
    state,
    authoritative: state !== 'unknown'
  });
  assert(resolved.actionId === 'open-item', `semantic action id changed: ${state}`);
  assert(resolved.availability.acceptedState === state, `authoritative action state failed: ${state}`);
  assert(resolved.authority.availabilityCreatedByGlaze === false, `Glaze created availability: ${state}`);
  assert(resolved.authority.executionAuthorityCreatedByGlaze === false, `Glaze created execution authority: ${state}`);
}

const unauthoritativeAvailable = resolveGlazeSemanticAction({
  actionId: 'delete-item',
  state: 'available',
  authoritative: false,
  essential: true
});
assert(unauthoritativeAvailable.availability.acceptedState === 'unknown', 'unverified available action must fail closed to unknown');
assert(unauthoritativeAvailable.availability.enabled === false, 'unverified available action must not be enabled');
assert(unauthoritativeAvailable.availability.requestedStateWithheldWithoutAuthority === true, 'withheld action state must be observable');

for (const dependency of dependencies) {
  const resolved = resolveGlazeInteractionAlternative({
    dependency,
    unavailable: true
  });
  assert(resolved.alternativeRequired === true, `alternative not required: ${dependency}`);
  assert(resolved.alternatives.length > 0, `alternative list empty: ${dependency}`);
  assert(resolved.physicalTechniqueRequiredForMeaning === false, `physical technique became semantic meaning: ${dependency}`);
  assert(resolved.authority.alternativeSelectionExecutesAction === false, `alternative resolver executed action: ${dependency}`);
}

for (const inputModel of inputModels) {
  const resolved = resolveGlazeAdaptiveInputBinding({
    actionId: 'activate',
    inputModel,
    state: 'available',
    authoritative: true,
    essential: true
  });
  assert(resolved.inputModel === inputModel, `input binding model mismatch: ${inputModel}`);
  assert(resolved.binding.semanticActionId === 'activate', `semantic action identity changed: ${inputModel}`);
  assert(resolved.binding.canPresentAsEnabled === true, `authoritative available action not enabled: ${inputModel}`);
  assert(resolved.binding.physicalBindingCreatesSemanticAuthority === false, `physical binding gained authority: ${inputModel}`);
  assert(resolved.binding.executionAutomatic === false, `binding auto-executed: ${inputModel}`);
  assert(resolved.continuity.inputMethodChangeMayResetTask === false, `task reset allowed: ${inputModel}`);
  assert(resolved.continuity.inputMethodChangeMayChangeActionAvailabilityByItself === false, `availability drift allowed: ${inputModel}`);
}

const dependencyBinding = resolveGlazeAdaptiveInputBinding({
  actionId: 'reorder-item',
  inputModel: 'keyboard',
  state: 'available',
  authoritative: true,
  interactionDependencies: ['drag', 'precision-pointer'],
  unavailableDependencies: ['drag', 'precision-pointer']
});
assert(dependencyBinding.alternatives.required === true, 'unavailable gesture dependency must require alternatives');
assert(dependencyBinding.alternatives.plans.length === 2, 'all unavailable dependencies must receive alternative plans');
assert(dependencyBinding.alternatives.allUnavailableOrUnsuitableDependenciesCovered === true, 'all unavailable dependencies must be covered');

const previousTaskState = {
  navigationDestination: 'memos/detail',
  focusId: 'memo-body',
  selectionIds: ['memo-42'],
  draftText: 'draft survives input transition',
  activeFilters: ['work'],
  query: 'continuity',
  paneState: 'detail',
  workingContext: {provider: 'authoritative'}
};
const stateClasses = {
  navigationDestination: 'durable',
  focusId: 'session-scoped',
  selectionIds: 'session-scoped',
  draftText: 'recoverable',
  activeFilters: 'durable',
  query: 'session-scoped',
  paneState: 'presentation-only',
  workingContext: 'provider-owned'
};
const actions = [
  {actionId: 'save', state: 'available', authoritative: true, essential: true},
  {actionId: 'share', state: 'restricted', authoritative: true},
  {actionId: 'delete', state: 'unknown', authoritative: false}
];

for (const from of inputModels) {
  for (const to of inputModels) {
    const resolved = resolveGlazeInputTransition({
      from,
      to,
      previousTaskState,
      stateClasses,
      actions
    });
    assert(resolved.transitionKey === `${from}->${to}`, `transition key mismatch: ${from}->${to}`);
    assert(resolved.taskState.navigationDestination === previousTaskState.navigationDestination, `navigation lost: ${from}->${to}`);
    assert(resolved.taskState.focusId === previousTaskState.focusId, `focus lost: ${from}->${to}`);
    assert(resolved.taskState.selectionIds[0] === 'memo-42', `selection lost: ${from}->${to}`);
    assert(resolved.taskState.draftText === previousTaskState.draftText, `draft lost: ${from}->${to}`);
    assert(resolved.taskState.query === previousTaskState.query, `query lost: ${from}->${to}`);
    assert(resolved.taskState.workingContext.provider === 'authoritative', `provider context lost: ${from}->${to}`);
    assert(resolved.semanticActions.map(action => action.actionId).join(',') === 'save,share,delete', `semantic action identity changed: ${from}->${to}`);
    assert(resolved.semanticActions.map(action => action.availability.acceptedState).join(',') === 'available,restricted,unknown', `action availability changed: ${from}->${to}`);
    assert(resolved.continuity.actionAvailabilityMayVaryOnlyFromInputChange === false, `input-only availability drift allowed: ${from}->${to}`);
    assert(resolved.authority.executionAuthorityCreatedByGlaze === false, `execution authority created: ${from}->${to}`);
  }
}

assert(glazeV17AdaptiveInputDevelopmentContract.version === '1.7.0-dev.2', 'runtime contract version mismatch');
assert(glazeV17AdaptiveInputDevelopmentContract.lifecycle === 'development', 'runtime contract must remain Development');
assert(glazeV17AdaptiveInputDevelopmentContract.stableBaseline === '1.6.0', 'runtime Stable baseline mismatch');
assert(glazeV17AdaptiveInputDevelopmentContract.consumerEligible === false, 'runtime must remain non-consumer-eligible');
assert(glazeV17AdaptiveInputDevelopmentContract.inputModels.length === 9, 'runtime input model count mismatch');
assert(glazeV17AdaptiveInputDevelopmentContract.interactionDependencies.length === 6, 'runtime dependency count mismatch');
assert(glazeV17AdaptiveInputDevelopmentContract.taskLossAllowed === false, 'runtime must prohibit task loss');
assert(glazeV17AdaptiveInputDevelopmentContract.executionAuthorityCreatedByGlaze === false, 'runtime must not create execution authority');

const aggregateVersionParts = String(glazeV17Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.7.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 2,
  'aggregate Development version must retain or advance beyond dev.2'
);
assert(glazeV17Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV17Development.stableBaseline === '1.6.0', 'aggregate Stable baseline mismatch');
assert(glazeV17Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const retainedSection of [1,2,4]) {
  assert(
    glazeV17Development.implementedSpecificationSections.includes(retainedSection),
    `aggregate lost Adaptive Input prerequisite section ${retainedSection}`
  );
}
assert(glazeV17Development.taskContinuityFoundation === 'js/glaze-v1.7-task-continuity.dev.mjs', 'aggregate lost Task Continuity foundation');
assert(glazeV17Development.adaptiveInputFoundation === 'js/glaze-v1.7-adaptive-input.dev.mjs', 'aggregate missing Adaptive Input foundation');

let invalidInput = false;
try { resolveGlazeAdaptiveInputBinding({actionId:'activate', inputModel:'telepathy', state:'available', authoritative:true}); } catch { invalidInput = true; }
assert(invalidInput, 'unknown input model must fail closed');

let invalidState = false;
try { resolveGlazeSemanticAction({actionId:'activate', state:'probably-available', authoritative:true}); } catch { invalidState = true; }
assert(invalidState, 'unknown action state must fail closed');

let invalidDependency = false;
try { resolveGlazeInteractionAlternative({dependency:'double-wink', unavailable:true}); } catch { invalidDependency = true; }
assert(invalidDependency, 'unknown interaction dependency must fail closed');

let missingAction = false;
try { resolveGlazeSemanticAction({state:'available', authoritative:true}); } catch { missingAction = true; }
assert(missingAction, 'semantic action id is required');

console.log('GLAZE UI V1.7 Adaptive Input 2.0 Development foundation: PASS');
console.log('Implemented section: 2');
console.log('Input models: 9');
console.log('Action availability states: 7');
console.log('Gesture/precision dependencies with alternatives: 6');
console.log('Input transition pairs validated: 81');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
