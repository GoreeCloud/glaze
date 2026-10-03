#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  classifyGlazeTaskState,
  resolveGlazeTaskContinuity,
  resolveGlazeAdaptiveComposition,
  resolveGlzAdaptivePane,
  glazeV17TaskContinuityDevelopmentContract
} from '../js/glaze-v1.7-task-continuity.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.7/task-continuity.dev.json');
const schema = json('schemas/v1.7-task-continuity.schema.json');
const tokens = json('tokens/glaze-v1.7-task-continuity.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_7_PLANNED.md');

const stateClasses = [
  'durable',
  'session-scoped',
  'presentation-only',
  'provider-owned',
  'temporary',
  'recoverable',
  'non-restorable'
];
const environmentChanges = [
  'window-resize',
  'device-rotation',
  'foldable-posture',
  'compact-expanded-layout',
  'input-method',
  'accessibility-mode',
  'appearance',
  'capability-degradation',
  'connectivity',
  'multi-pane-recomposition',
  'form-factor'
];
const profiles = ['mobile', 'tablet', 'desktop', 'foldable', 'tv', 'wearable'];

assert(stable === '1.7.0', 'V1.7 dev.1 must coexist with bounded Glaze V1.7 / 1.7.0 as current Stable');
assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
assert(lifecycle.activeCandidate === null, 'V1.7 dev.1 must not create an active Candidate');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.7 dev.1 must not create a patch RC');
assert(lifecycle.plannedNext==='1.7.1', 'V1.7 dev.1 must not mutate lifecycle plannedNext');

assert(spec.includes('## 1. Task Continuity System'), 'V1.7 specification missing Task Continuity section');
assert(spec.includes('## 4. Adaptive Composition'), 'V1.7 specification missing Adaptive Composition section');
assert(spec.includes('Continuous. Adaptive. Expressive. Fluid. Accessible. Semantic. Native. Truthful.'), 'V1.7 v1.2 final direction missing');

assert(fs.existsSync(path.join(root, 'IMPLEMENTED-FEATURES.md')), 'IMPLEMENTED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'PLANNED-FEATURES.md')), 'PLANNED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'CHANGELOGS.md')), 'CHANGELOGS.md is required');
assert(!fs.existsSync(path.join(root, 'FEATURE-ROADMAP.md')), 'FEATURE-ROADMAP.md must remain retired');
assert(!fs.existsSync(path.join(root, 'CHANGELOG.md')), 'legacy singular CHANGELOG.md must remain retired');

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.7-task-continuity.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.7.0-dev.1', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.6.0', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify([1,4]), 'implemented section set mismatch');
assert(JSON.stringify(contract.stateClasses) === JSON.stringify(stateClasses), 'state class set mismatch');
assert(JSON.stringify(contract.environmentChanges) === JSON.stringify(environmentChanges), 'environment change set mismatch');
assert(contract.adaptiveComposition.foundationalComponent === 'GlzAdaptivePane', 'adaptive composition must expose GlzAdaptivePane');
assert(contract.adaptiveComposition.semanticIdentityPreserved === true, 'semantic identity must be preserved');
assert(contract.adaptiveComposition.taskStateResetOnRecompositionAllowed === false, 'recomposition must not reset task state');
assert(contract.adaptiveComposition.accessibilitySemanticsPreserved === true, 'accessibility semantics must be preserved');
assert(contract.adaptiveComposition.providerTruthPreserved === true, 'provider truth must be preserved');
assert(contract.adaptiveComposition.widthAloneIsAuthority === false, 'width alone must not be composition authority');
assert(contract.restoration.providerOwnedMayBeReplacedOnlyByAuthoritativeProviderInput === true, 'provider-owned state must require authoritative provider replacement');
assert(contract.restoration.nonRestorableLossMustBeExplicit === true, 'non-restorable loss must be explicit');
assert(contract.authority.boundary === 'presentation-only', 'authority boundary must remain presentation-only');
assert(contract.authority.providerTruthManufactured === false, 'provider truth must not be manufactured');
assert(contract.authority.authorizationGrantedByGlaze === false, 'Glaze must not grant authorization');
assert(contract.authority.permissionGrantedByGlaze === false, 'Glaze must not grant permission');
assert(contract.authority.consentGrantedByGlaze === false, 'Glaze must not grant consent');
assert(contract.authority.consequentialExecutionAutomatic === false, 'Glaze must not auto-execute consequential actions');

assert(tokens.version === '1.7.0-dev.1', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.6.0', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(Object.keys(tokens.stateClasses).length === 7, 'token map must expose seven state classes');
assert(Object.keys(tokens.continuityFields).length === 13, 'token map must expose thirteen continuity fields');
assert(Object.keys(tokens.environmentChanges).length === 11, 'token map must expose eleven environment changes');
assert(tokens.adaptiveComponents.GlzAdaptivePane === 'component.adaptive-pane', 'token map must expose GlzAdaptivePane');
assert(Object.keys(tokens.compositionRoles).length === 6, 'token map must expose six composition roles');
assert(Object.keys(tokens.profiles).length === 6, 'token map must expose six form-factor profiles');
assert(tokens.invariants.taskStateResetOnRecompositionAllowed === false, 'token map must prohibit task reset on recomposition');
assert(tokens.invariants.providerTruthManufactured === false, 'token map must preserve provider authority');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

for (const stateClass of stateClasses) {
  const resolved = classifyGlazeTaskState({stateClass});
  assert(resolved.stateClass === stateClass, `state classification failed: ${stateClass}`);
  assert(resolved.authority.presentationOnly === true, `presentation boundary missing: ${stateClass}`);
  assert(resolved.authority.persistenceClaimCreatedByGlaze === false, `Glaze invented persistence claim: ${stateClass}`);
}

const previous = {
  navigationDestination: 'settings/privacy',
  focusId: 'privacy-toggle',
  selectionIds: ['memo-1', 'memo-2'],
  scrollPositionKey: 'settings-scroll-420',
  expandedRegionIds: ['advanced'],
  draftText: 'unsaved draft',
  formState: {enabled: true},
  activeFilters: ['private'],
  query: 'privacy',
  paneState: 'detail',
  mediaState: {playing: false, position: 12},
  pendingInteractions: ['save-draft'],
  workingContext: {workspace: 'settings'}
};

for (const environmentChange of environmentChanges) {
  const resolved = resolveGlazeTaskContinuity({
    environmentChange,
    previous,
    incoming: {},
    stateClasses: {
      navigationDestination: 'durable',
      focusId: 'session-scoped',
      selectionIds: 'session-scoped',
      scrollPositionKey: 'session-scoped',
      expandedRegionIds: 'session-scoped',
      draftText: 'recoverable',
      formState: 'recoverable',
      activeFilters: 'durable',
      query: 'session-scoped',
      paneState: 'presentation-only',
      mediaState: 'session-scoped',
      pendingInteractions: 'temporary',
      workingContext: 'provider-owned'
    }
  });
  assert(resolved.environmentChange === environmentChange, `environment change failed: ${environmentChange}`);
  assert(resolved.state.navigationDestination === previous.navigationDestination, `navigation lost: ${environmentChange}`);
  assert(resolved.state.focusId === previous.focusId, `focus lost: ${environmentChange}`);
  assert(resolved.state.draftText === previous.draftText, `draft lost: ${environmentChange}`);
  assert(resolved.state.query === previous.query, `query lost: ${environmentChange}`);
  assert(resolved.state.workingContext.workspace === 'settings', `working context lost: ${environmentChange}`);
  assert(resolved.continuity.taskStateResetOnRecompositionAllowed === false, `task reset allowed: ${environmentChange}`);
  assert(resolved.authority.providerTruthManufactured === false, `provider truth manufactured: ${environmentChange}`);
}

const unauthoritativeClear = resolveGlazeTaskContinuity({
  environmentChange: 'window-resize',
  previous: {draftText: 'keep me'},
  clearFields: ['draftText'],
  clearAuthoritative: false,
  stateClasses: {draftText: 'recoverable'}
});
assert(unauthoritativeClear.state.draftText === 'keep me', 'unauthoritative clear must preserve recoverable draft');
assert(unauthoritativeClear.decisions.draftText === 'preserved-clear-not-authoritative', 'unauthoritative clear decision mismatch');

const providerClear = resolveGlazeTaskContinuity({
  environmentChange: 'connectivity',
  previous: {workingContext: {source: 'provider'}},
  clearFields: ['workingContext'],
  clearAuthoritative: true,
  stateClasses: {workingContext: 'provider-owned'}
});
assert(providerClear.state.workingContext.source === 'provider', 'Glaze must not clear provider-owned truth');
assert(providerClear.continuity.blockedByContinuityRisk === true, 'provider-owned clear must expose continuity risk');

const providerReplacementRejected = resolveGlazeTaskContinuity({
  environmentChange: 'connectivity',
  previous: {workingContext: {source: 'provider-a'}},
  incoming: {workingContext: {source: 'untrusted-b'}},
  stateClasses: {workingContext: 'provider-owned'}
});
assert(providerReplacementRejected.state.workingContext.source === 'provider-a', 'provider-owned state must reject unmarked incoming replacement');
assert(providerReplacementRejected.decisions.workingContext === 'rejected-provider-input-not-authoritative', 'provider-owned rejection decision mismatch');
assert(providerReplacementRejected.continuity.providerOwnedReplacementRequiresExplicitAuthority === true, 'provider replacement authority invariant missing');

const providerReplacementAccepted = resolveGlazeTaskContinuity({
  environmentChange: 'connectivity',
  previous: {workingContext: {source: 'provider-a'}},
  incoming: {workingContext: {source: 'provider-b'}},
  providerAuthoritativeFields: ['workingContext'],
  stateClasses: {workingContext: 'provider-owned'}
});
assert(providerReplacementAccepted.state.workingContext.source === 'provider-b', 'explicit provider-authoritative input should replace provider-owned state');
assert(providerReplacementAccepted.decisions.workingContext === 'accepted-authoritative-provider-input', 'provider-owned accepted decision mismatch');

const recoveryReplacementRejected = resolveGlazeTaskContinuity({
  environmentChange: 'device-rotation',
  previous: {draftText: 'existing draft'},
  incoming: {draftText: 'undeclared replacement'},
  stateClasses: {draftText: 'recoverable'}
});
assert(recoveryReplacementRejected.state.draftText === 'existing draft', 'recoverable state must reject undeclared recovery input');
assert(recoveryReplacementRejected.decisions.draftText === 'rejected-recovery-input-not-declared', 'recoverable rejection decision mismatch');
assert(recoveryReplacementRejected.continuity.recoverableReplacementRequiresExplicitRecoveryState === true, 'recoverable restoration invariant missing');

const recoveryReplacementAccepted = resolveGlazeTaskContinuity({
  environmentChange: 'device-rotation',
  previous: {draftText: 'existing draft'},
  incoming: {draftText: 'restored draft'},
  recoveryStateFields: ['draftText'],
  stateClasses: {draftText: 'recoverable'}
});
assert(recoveryReplacementAccepted.state.draftText === 'restored draft', 'declared caller recovery state should replace recoverable state');
assert(recoveryReplacementAccepted.decisions.draftText === 'accepted-caller-recovery-state', 'recoverable accepted decision mismatch');

const temporaryProtected = resolveGlazeTaskContinuity({
  environmentChange: 'input-method',
  previous: {pendingInteractions: ['safe-pending-action']},
  clearFields: ['pendingInteractions'],
  clearAuthoritative: true,
  stateClasses: {pendingInteractions: 'temporary'}
});
assert(temporaryProtected.state.pendingInteractions[0] === 'safe-pending-action', 'temporary state must require explicit disposable classification');

const temporaryDiscard = resolveGlazeTaskContinuity({
  environmentChange: 'input-method',
  previous: {pendingInteractions: ['hover-preview']},
  clearFields: ['pendingInteractions'],
  clearAuthoritative: true,
  temporaryDisposableFields: ['pendingInteractions'],
  stateClasses: {pendingInteractions: 'temporary'}
});
assert(!Object.prototype.hasOwnProperty.call(temporaryDiscard.state, 'pendingInteractions'), 'explicitly disposable temporary state should clear');

const nonRestorableProtected = resolveGlazeTaskContinuity({
  environmentChange: 'form-factor',
  previous: {draftText: 'non-restorable input'},
  clearFields: ['draftText'],
  clearAuthoritative: true,
  stateClasses: {draftText: 'non-restorable'}
});
assert(nonRestorableProtected.state.draftText === 'non-restorable input', 'non-restorable state must not be silently lost');
assert(nonRestorableProtected.continuity.blockedByContinuityRisk === true, 'non-restorable loss must expose continuity risk');

const nonRestorableDirected = resolveGlazeTaskContinuity({
  environmentChange: 'form-factor',
  previous: {draftText: 'non-restorable input'},
  clearFields: ['draftText'],
  clearAuthoritative: true,
  lossDirectedFields: ['draftText'],
  stateClasses: {draftText: 'non-restorable'}
});
assert(!Object.prototype.hasOwnProperty.call(nonRestorableDirected.state, 'draftText'), 'explicitly directed non-restorable loss should clear');

const expectedPresentation = {
  mobile: 'bottom-sheet',
  tablet: 'side-pane',
  desktop: 'secondary-pane',
  foldable: 'side-pane',
  tv: 'far-view-panel',
  wearable: 'full-screen-step'
};

for (const profile of profiles) {
  const resolved = resolveGlazeAdaptiveComposition({
    profile,
    semanticSurfaceId: 'memo-detail',
    surfaceRole: 'detail',
    posture: profile === 'foldable' ? 'unfolded' : 'unknown'
  });
  assert(resolved.profile === profile, `profile failed: ${profile}`);
  assert(resolved.presentation === expectedPresentation[profile], `presentation mismatch: ${profile}`);
  assert(resolved.preservation.semanticIdentityPreserved === true, `semantic identity lost: ${profile}`);
  assert(resolved.preservation.draftStatePreserved === true, `draft preservation missing: ${profile}`);
  assert(resolved.compositionRules.widthAloneIsAuthority === false, `width-only authority leaked: ${profile}`);
  assert(resolved.authority.navigationExecutedByGlaze === false, `Glaze executed navigation: ${profile}`);
}

const folded = resolveGlazeAdaptiveComposition({
  profile: 'foldable',
  semanticSurfaceId: 'detail',
  surfaceRole: 'detail',
  posture: 'folded'
});
assert(folded.presentation === 'full-screen-step', 'folded composition should use a constrained full-screen step');

const largeText = resolveGlazeAdaptiveComposition({
  profile: 'desktop',
  semanticSurfaceId: 'preferences',
  surfaceRole: 'task',
  accessibilityProfiles: ['large-text']
});
assert(largeText.presentation === 'full-screen-step', 'large text may simplify composition to full-screen');
assert(largeText.preservation.accessibilitySemanticsPreserved === true, 'accessibility semantics must survive composition change');

const adaptivePane = resolveGlzAdaptivePane({
  profile: 'tablet',
  semanticSurfaceId: 'memo-detail',
  surfaceRole: 'detail',
  environmentChange: 'compact-expanded-layout',
  previousTaskState: {
    navigationDestination: 'memos/detail',
    focusId: 'memo-title',
    draftText: 'draft survives'
  },
  stateClasses: {
    navigationDestination: 'durable',
    focusId: 'session-scoped',
    draftText: 'recoverable'
  }
});
assert(adaptivePane.component === 'GlzAdaptivePane', 'adaptive pane component identity mismatch');
assert(adaptivePane.presentation === 'side-pane', 'tablet adaptive pane presentation mismatch');
assert(adaptivePane.taskState.navigationDestination === 'memos/detail', 'adaptive pane lost navigation state');
assert(adaptivePane.taskState.focusId === 'memo-title', 'adaptive pane lost focus state');
assert(adaptivePane.taskState.draftText === 'draft survives', 'adaptive pane lost draft state');
assert(adaptivePane.continuity.taskStateResetOnRecompositionAllowed === false, 'adaptive pane must not permit task reset');
assert(adaptivePane.authority.providerTruthManufactured === false, 'adaptive pane must not manufacture provider truth');

assert(glazeV17TaskContinuityDevelopmentContract.version === '1.7.0-dev.1', 'runtime contract version mismatch');
assert(glazeV17TaskContinuityDevelopmentContract.stableBaseline === '1.6.0', 'runtime Stable baseline mismatch');
assert(glazeV17TaskContinuityDevelopmentContract.consumerEligible === false, 'runtime must remain non-consumer-eligible');
assert(glazeV17TaskContinuityDevelopmentContract.foundationalComponent === 'GlzAdaptivePane', 'runtime must expose GlzAdaptivePane');
assert(glazeV17TaskContinuityDevelopmentContract.taskStateResetOnRecompositionAllowed === false, 'runtime must prohibit task-state reset');
assert(glazeV17TaskContinuityDevelopmentContract.providerTruthManufactured === false, 'runtime must not manufacture provider truth');

const aggregateVersionParts = String(glazeV17Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.7.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 1,
  'aggregate Development version must retain or advance beyond dev.1'
);
assert(glazeV17Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV17Development.stableBaseline === '1.6.0', 'aggregate Stable baseline mismatch');
assert(glazeV17Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const retainedSection of [1,4]) {
  assert(
    glazeV17Development.implementedSpecificationSections.includes(retainedSection),
    `aggregate lost Task Continuity section ${retainedSection}`
  );
}

let invalidClass = false;
try { classifyGlazeTaskState({stateClass: 'magical'}); } catch { invalidClass = true; }
assert(invalidClass, 'unknown state class must fail closed');

let invalidEnvironment = false;
try { resolveGlazeTaskContinuity({environmentChange: 'telepathy'}); } catch { invalidEnvironment = true; }
assert(invalidEnvironment, 'unknown environment change must fail closed');

let invalidProfile = false;
try { resolveGlazeAdaptiveComposition({profile: 'car', semanticSurfaceId: 'detail'}); } catch { invalidProfile = true; }
assert(invalidProfile, 'unknown form-factor profile must fail closed');

let missingSurface = false;
try { resolveGlazeAdaptiveComposition({profile: 'mobile'}); } catch { missingSurface = true; }
assert(missingSurface, 'adaptive composition requires semantic surface identity');

console.log('GLAZE UI V1.7 Task Continuity Development foundation: PASS');
console.log('Implemented sections: 1, 4');
console.log('State classes: 7');
console.log('Continuity fields: 13');
console.log('Environment changes: 11');
console.log('Form-factor profiles: 6');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
