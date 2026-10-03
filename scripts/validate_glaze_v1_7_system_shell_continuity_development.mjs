#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeShellCapability,
  resolveGlazeSystemShellContinuity,
  resolveGlazeControlCenterContinuity,
  glazeV17SystemShellContinuityDevelopmentContract
} from '../js/glaze-v1.7-system-shell-continuity.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.7/system-shell-continuity.dev.json');
const schema = json('schemas/v1.7-system-shell-continuity.schema.json');
const tokens = json('tokens/glaze-v1.7-system-shell-continuity.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_7_PLANNED.md');

const shellAreas = [
  'notification-activity-presentation',
  'control-center',
  'persistent-control-center-layout',
  'multi-window',
  'split-view',
  'compact-expanded-navigation',
  'window-restoration',
  'application-system-handoff',
  'task-switching',
  'shell-overlays',
  'search-continuity',
  'contextual-command-surfaces'
];
const transitionKinds = [
  'notification-activity-presentation',
  'control-center-layout',
  'multi-window-change',
  'split-view-change',
  'compact-expanded-navigation',
  'window-restoration',
  'application-system-handoff',
  'task-switching',
  'shell-overlay',
  'search-continuity',
  'contextual-command-surface'
];
const profiles = ['mobile','tablet','desktop','foldable','tv','wearable'];

assert(stable === '1.7.0', 'V1.7 dev.6 must coexist with bounded Glaze V1.7 / 1.7.0 as current Stable');
assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
assert(lifecycle.activeCandidate === null, 'V1.7 dev.6 must not create an active Candidate');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.7 dev.6 must not create a patch RC');
assert(lifecycle.plannedNext==='1.7.1', 'V1.7 dev.6 must not mutate lifecycle plannedNext');

assert(spec.includes('## 35. System Shell Continuity'), 'V1.7 v1.2 specification missing System Shell Continuity section');
for (const phrase of [
  'Notification/activity presentation',
  'Control Center',
  'Multi-window',
  'Split view',
  'Compact/expanded navigation',
  'Window restoration',
  'Application/system handoff',
  'Task switching',
  'Universal Search',
  'Contextual commands'
]) {
  assert(spec.includes(phrase), `V1.7 v1.2 specification missing System Shell requirement: ${phrase}`);
}
assert(spec.includes('## 36. Notification and Activity Surfaces'), 'V1.7 v1.2 specification must retain the separate Notification and Activity Surfaces obligation');

assert(fs.existsSync(path.join(root, 'IMPLEMENTED-FEATURES.md')), 'IMPLEMENTED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'PLANNED-FEATURES.md')), 'PLANNED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'CHANGELOGS.md')), 'CHANGELOGS.md is required');
assert(!fs.existsSync(path.join(root, 'FEATURE-ROADMAP.md')), 'FEATURE-ROADMAP.md must remain retired');
assert(!fs.existsSync(path.join(root, 'CHANGELOG.md')), 'legacy singular CHANGELOG.md must remain retired');

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.7-system-shell-continuity.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.7.0-dev.6', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.6.0', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify([7]), 'implemented section set mismatch');
assert(JSON.stringify(contract.shellAreas) === JSON.stringify(shellAreas), 'shell area set mismatch');
assert(JSON.stringify(contract.transitionKinds) === JSON.stringify(transitionKinds), 'transition kind set mismatch');
assert(JSON.stringify(contract.capabilityStates) === JSON.stringify(['available','unavailable','unknown']), 'capability state set mismatch');
assert(contract.continuityRequirements.length === 8, 'continuity requirements count mismatch');
assert(contract.shellContextFields.length === 6, 'shell context field count mismatch');
assert(contract.controlCenter.persistentLayoutSupportedWhenPlatformCapabilityAvailable === true, 'persistent Control Center layout capability rule missing');
assert(contract.controlCenter.layoutPersistenceAutomatic === false, 'Glaze must not automatically persist Control Center layout');
assert(contract.controlCenter.layoutPersistenceOwnedByCallerOrPlatform === true, 'Control Center persistence authority mismatch');
assert(contract.controlCenter.crossDeviceSyncEstablished === false, 'dev.6 must not claim cross-device Control Center sync');
assert(contract.notificationActivityBoundary.presentationContinuityIncluded === true, 'notification/activity presentation continuity must be included');
assert(contract.notificationActivityBoundary.notificationTruthOwnedByProvider === true, 'notification truth must remain provider-owned');
assert(contract.notificationActivityBoundary.activityTruthOwnedByProvider === true, 'activity truth must remain provider-owned');
assert(contract.notificationActivityBoundary.section8ComponentCatalogImplemented === false, 'dev.6 must not prematurely claim Section 8 components');
assert(contract.authority.boundary === 'presentation-only', 'System Shell continuity must remain presentation-only');
for (const denied of [
  'windowingSupportCreatedByGlaze',
  'systemPrivilegesGrantedByGlaze',
  'notificationTruthCreatedByGlaze',
  'activityTruthCreatedByGlaze',
  'searchAuthorityCreatedByGlaze',
  'navigationAuthorityCreatedByGlaze',
  'executionAuthorityCreatedByGlaze',
  'persistencePerformedByGlaze',
  'consequentialExecutionAutomatic'
]) {
  assert(contract.authority[denied] === false, `authority boundary weakened: ${denied}`);
}

for (const source of Object.values(contract.integrationFoundations)) {
  assert(fs.existsSync(path.join(root, source)), `integration foundation missing: ${source}`);
}

assert(tokens.version === '1.7.0-dev.6', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.6.0', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(Object.keys(tokens.shellAreas).length === 12, 'token map must expose 12 shell areas');
assert(Object.keys(tokens.transitionRoles).length === 11, 'token map must expose 11 shell transition roles');
assert(Object.keys(tokens.presentationByProfile).length === 6, 'token map must expose six profile shell presentations');
assert(Object.keys(tokens.continuity).length === 8, 'token map must expose eight continuity roles');
assert(tokens.boundaries.presentationOnly === true, 'token map must remain presentation-only');
assert(tokens.boundaries.capabilityAuthorityRequired === true, 'token map must require capability authority');
assert(tokens.boundaries.layoutPersistencePerformedByGlaze === false, 'token map must not claim persistence');
assert(tokens.boundaries.crossDeviceSyncEstablished === false, 'token map must not claim cross-device sync');
assert(tokens.boundaries.section8ComponentCatalogImplemented === false, 'token map must keep Section 8 separate');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

const untrustedCapability = resolveGlazeShellCapability({
  capability:'multi-window',
  state:'available',
  authoritative:false
});
assert(untrustedCapability.acceptedState === 'unknown', 'untrusted available capability must fail closed to unknown');
assert(untrustedCapability.available === false, 'untrusted capability must not become available');
assert(untrustedCapability.requestedStateWithheldWithoutAuthority === true, 'withheld capability state must be observable');

const trustedCapability = resolveGlazeShellCapability({
  capability:'multi-window',
  state:'available',
  authoritative:true
});
assert(trustedCapability.acceptedState === 'available', 'authoritative available capability should be accepted');
assert(trustedCapability.available === true, 'authoritative available capability should be usable for presentation');

const trustedUnavailable = resolveGlazeShellCapability({
  capability:'multi-window',
  state:'unavailable',
  authoritative:true
});
assert(trustedUnavailable.acceptedState === 'unavailable', 'authoritative unavailable capability should remain unavailable');
assert(trustedUnavailable.available === false, 'unavailable capability must not become available');

const previousTaskState = {
  navigationDestination:'settings',
  focusId:'privacy-toggle',
  selectionIds:['row-2'],
  draftText:'draft preserved',
  activeFilters:['local'],
  query:'privacy',
  paneState:{mode:'split',activePane:'detail'},
  pendingInteractions:[{id:'save-draft',safe:true}],
  workingContext:{task:'settings'}
};

const split = resolveGlazeSystemShellContinuity({
  shellArea:'split-view',
  transitionKind:'split-view-change',
  profile:'tablet',
  capabilityStates:{'split-view':'available'},
  authoritativeCapabilities:['split-view'],
  previousTaskState,
  previousShellContext:{
    windowState:{primary:'settings',secondary:'detail'},
    searchScope:'settings'
  },
  incomingShellContext:{
    windowState:{primary:'settings',secondary:'detail-expanded'}
  },
  shellContextAuthoritative:true
});
assert(split.presentation.available === true, 'authoritative split-view capability should be available');
assert(split.taskState.navigationDestination === 'settings', 'navigation destination must survive shell recomposition');
assert(split.taskState.focusId === 'privacy-toggle', 'focus must survive shell recomposition');
assert(split.taskState.draftText === 'draft preserved', 'draft must survive shell recomposition');
assert(split.taskState.query === 'privacy', 'query must survive shell recomposition');
assert(split.taskState.paneState.activePane === 'detail', 'pane state must survive shell recomposition');
assert(split.shellContext.windowState.secondary === 'detail-expanded', 'authoritative shell context should be accepted');
assert(split.continuity.shellRecompositionMayResetTask === false, 'shell recomposition must not reset the task');
assert(split.continuity.transitionPredictable === true && split.continuity.transitionReversible === true, 'shell transition must remain predictable and reversible');
assert(split.transition.executionPerformedByGlaze === false, 'Glaze must not execute shell transitions');
assert(split.authority.windowingSupportCreatedByGlaze === false, 'Glaze must not create windowing support');

const withheldContext = resolveGlazeSystemShellContinuity({
  shellArea:'multi-window',
  transitionKind:'multi-window-change',
  profile:'desktop',
  capabilityStates:{'multi-window':'available'},
  authoritativeCapabilities:['multi-window'],
  previousTaskState,
  previousShellContext:{windowState:{active:'a'}},
  incomingShellContext:{windowState:{active:'b'}},
  shellContextAuthoritative:false
});
assert(withheldContext.shellContext.windowState.active === 'a', 'untrusted incoming shell context must not replace existing context');
assert(withheldContext.decisions.shellContext.windowState === 'preserved-existing-context-incoming-not-authoritative', 'shell-context rejection reason mismatch');

const untrustedWindowing = resolveGlazeSystemShellContinuity({
  shellArea:'multi-window',
  transitionKind:'multi-window-change',
  profile:'desktop',
  capabilityStates:{'multi-window':'available'},
  authoritativeCapabilities:[],
  previousTaskState
});
assert(untrustedWindowing.presentation.available === false, 'multi-window support without authority must fail closed');
assert(untrustedWindowing.presentation.capabilityState === 'unknown', 'multi-window support without authority must remain unknown');
assert(untrustedWindowing.transition.providerExecutionRequired === true, 'multi-window transition must require provider execution');
assert(untrustedWindowing.transition.executionPerformedByGlaze === false, 'Glaze must not execute multi-window changes');

const controlCenter = resolveGlazeControlCenterContinuity({
  persistentLayoutRequested:true,
  profile:'tablet',
  capabilityStates:{'persistent-control-center-layout':'available'},
  authoritativeCapabilities:['persistent-control-center-layout'],
  previousTaskState,
  previousShellContext:{controlCenterLayout:['network','brightness','volume']}
});
assert(controlCenter.controlCenter.persistentLayoutRequested === true, 'persistent Control Center layout request missing');
assert(controlCenter.controlCenter.persistentLayoutAvailable === true, 'authoritative persistent Control Center layout should be presentable');
assert(controlCenter.controlCenter.callerOrPlatformMustPersistLayout === true, 'caller/platform must own layout persistence');
assert(controlCenter.controlCenter.persistencePerformedByGlaze === false, 'Glaze must not persist Control Center layout');
assert(controlCenter.controlCenter.crossDeviceSyncEstablished === false, 'dev.6 must not claim Control Center sync');

const notificationPresentation = resolveGlazeSystemShellContinuity({
  shellArea:'notification-activity-presentation',
  transitionKind:'notification-activity-presentation',
  profile:'mobile',
  capabilityStates:{'notification-activity-presentation':'available'},
  authoritativeCapabilities:['notification-activity-presentation'],
  previousTaskState
});
assert(notificationPresentation.notificationActivity.presentationContinuityIncluded === true, 'notification/activity presentation continuity missing');
assert(notificationPresentation.notificationActivity.truthOwnedByProvider === true, 'notification/activity truth must remain provider-owned');
assert(notificationPresentation.notificationActivity.truthCreatedByGlaze === false, 'Glaze must not generate notification/activity truth');
assert(notificationPresentation.notificationActivity.section8ComponentCatalogImplemented === false, 'Section 8 component catalog must remain unimplemented');

const handoff = resolveGlazeSystemShellContinuity({
  shellArea:'application-system-handoff',
  transitionKind:'application-system-handoff',
  profile:'mobile',
  capabilityStates:{'application-system-handoff':'available'},
  authoritativeCapabilities:['application-system-handoff'],
  previousTaskState
});
assert(handoff.transition.proposalOnly === true, 'handoff must be a presentation proposal only');
assert(handoff.transition.providerExecutionRequired === true, 'handoff execution must remain provider-controlled');
assert(handoff.transition.executionPerformedByGlaze === false, 'Glaze must not execute handoff');
assert(handoff.authority.systemPrivilegesGrantedByGlaze === false, 'Glaze must not grant system privileges');

for (const profile of profiles) {
  const resolved = resolveGlazeSystemShellContinuity({
    shellArea:'compact-expanded-navigation',
    transitionKind:'compact-expanded-navigation',
    profile,
    capabilityStates:{'navigation-recomposition':'available'},
    authoritativeCapabilities:['navigation-recomposition'],
    previousTaskState
  });
  assert(resolved.profile === profile, `profile mismatch: ${profile}`);
  assert(resolved.presentation.available === true, `authoritative navigation recomposition unavailable: ${profile}`);
  assert(resolved.continuity.activeTaskPreserved === true, `active task continuity lost: ${profile}`);
}

assert(glazeV17SystemShellContinuityDevelopmentContract.version === '1.7.0-dev.6', 'runtime contract version mismatch');
assert(glazeV17SystemShellContinuityDevelopmentContract.lifecycle === 'development', 'runtime contract must remain Development');
assert(glazeV17SystemShellContinuityDevelopmentContract.stableBaseline === '1.6.0', 'runtime Stable baseline mismatch');
assert(glazeV17SystemShellContinuityDevelopmentContract.consumerEligible === false, 'runtime must remain non-consumer-eligible');
assert(glazeV17SystemShellContinuityDevelopmentContract.shellAreas.length === 12, 'runtime shell area count mismatch');
assert(glazeV17SystemShellContinuityDevelopmentContract.transitionKinds.length === 11, 'runtime transition count mismatch');
assert(glazeV17SystemShellContinuityDevelopmentContract.section8ComponentCatalogImplemented === false, 'runtime must keep Section 8 separate');
assert(glazeV17SystemShellContinuityDevelopmentContract.persistentLayoutAutomatic === false, 'runtime must not auto-persist shell layout');
assert(glazeV17SystemShellContinuityDevelopmentContract.crossDeviceSyncEstablished === false, 'runtime must not claim cross-device sync');

const aggregateVersionParts = String(glazeV17Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.7.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 6,
  'aggregate Development version must retain or advance beyond System Shell dev.6'
);
assert(glazeV17Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV17Development.stableBaseline === '1.6.0', 'aggregate Stable baseline mismatch');
assert(glazeV17Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
assert(JSON.stringify(glazeV17Development.implementedSpecificationSections) === JSON.stringify([1,2,3,4,5,6,7,8]), 'aggregate section set mismatch');
assert(glazeV17Development.taskContinuityFoundation === 'js/glaze-v1.7-task-continuity.dev.mjs', 'aggregate lost Task Continuity');
assert(glazeV17Development.adaptiveInputFoundation === 'js/glaze-v1.7-adaptive-input.dev.mjs', 'aggregate lost Adaptive Input');
assert(glazeV17Development.formFactorProfilesFoundation === 'js/glaze-v1.7-form-factor-profiles.dev.mjs', 'aggregate lost Form-Factor Profiles');
assert(glazeV17Development.commandSurfaceFoundation === 'js/glaze-v1.7-command-surface.dev.mjs', 'aggregate lost Command Surface');
assert(glazeV17Development.personalizationFoundation === 'js/glaze-v1.7-personalization.dev.mjs', 'aggregate lost Personalization');
assert(glazeV17Development.systemShellContinuityFoundation === 'js/glaze-v1.7-system-shell-continuity.dev.mjs', 'aggregate missing System Shell Continuity');
assert(glazeV17Development.notificationActivitySurfacesFoundation === 'js/glaze-v1.7-notification-activity-surfaces.dev.mjs', 'aggregate missing Notification and Activity Surfaces');

for (const [field,value] of [
  ['shellArea','made-up-shell'],
  ['transitionKind','teleport-shell'],
  ['profile','spatial']
]) {
  let failed=false;
  try {
    resolveGlazeSystemShellContinuity({
      shellArea:'multi-window',
      transitionKind:'multi-window-change',
      profile:'desktop',
      [field]:value
    });
  } catch { failed=true; }
  assert(failed, `unknown shell value must fail closed: ${field}=${value}`);
}

let invalidCapabilityState=false;
try {
  resolveGlazeShellCapability({capability:'multi-window',state:'maybe',authoritative:true});
} catch { invalidCapabilityState=true; }
assert(invalidCapabilityState, 'unknown capability state must fail closed');

let invalidCapability=false;
try {
  resolveGlazeShellCapability({capability:'invented-windowing-mode',state:'available',authoritative:true});
} catch { invalidCapability=true; }
assert(invalidCapability, 'unknown shell capability must fail closed');

console.log('GLAZE UI V1.7 System Shell Continuity Development foundation: PASS');
console.log('Implemented section: 7');
console.log('Shell areas: 12');
console.log('Transition kinds: 11');
console.log('First-class profiles: 6');
console.log('Section 8 component catalog implemented: false');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
