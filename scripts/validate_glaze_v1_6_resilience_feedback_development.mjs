#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeEmptyState,
  resolveGlazeErrorPresentation,
  resolveGlazeRecoveryPresentation,
  resolveGlazeConnectivityPresentation,
  resolveGlazeStaleDataPresentation,
  resolveGlazeBackgroundRefresh,
  resolveGlazeOptimisticInteraction,
  resolveGlazeProgressPresentation,
  resolveGlazeNotificationPresentation,
  resolveGlazeMessageSurface,
  resolveGlazeDialogPresentation,
  resolveGlazeDestructiveAction,
  glazeV16ResilienceFeedbackDevelopmentContract
} from '../js/glaze-v1.6-resilience-feedback.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.6/resilience-feedback.dev.json');
const schema = json('schemas/v1.6-resilience-feedback.schema.json');
const tokens = json('tokens/glaze-v1.6-resilience-feedback.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_6_PLANNED.md');

const sections = [29,30,31,32,33,34,35,36,37,38,39,40];
const emptyKinds = [
  'no-content-yet','no-search-results','filter-removed-all-results',
  'no-permission','offline','service-unavailable','feature-unsupported',
  'content-deleted','content-unavailable','setup-incomplete'
];
const recoveryActions = [
  'retry','reconnect','continue-offline','use-local-content',
  'restore-previous-state','change-settings','resolve-conflict','return-to-safe-state'
];
const connectivityStates = [
  'fully-online','fully-offline','local-only','partially-connected',
  'sync-pending','sync-failed','service-degraded'
];
const progressKinds = [
  'indeterminate','determinate','step','background-activity','sync','transfer','processing'
];
const priorities = ['passive','informational','actionable','important','critical'];

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
assert(contract.$schema === '../../schemas/v1.6-resilience-feedback.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.6.0-dev.5', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.5.1', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify(sections), 'implemented section set mismatch');
assert(contract.emptyStates.genericEmptyScreenAllowed === false, 'generic empty screen must be prohibited');
assert(contract.recovery.mayInventCapabilities === false, 'recovery capabilities must not be invented');
assert(contract.connectivity.timeoutAloneMayInferState === false, 'timeout must not infer connectivity');
assert(contract.optimisticInteraction.securitySensitiveAllowed === false, 'security-sensitive optimism must remain prohibited');
assert(contract.progress.fakePercentageAllowed === false, 'fake percentage must remain prohibited');
assert(contract.notifications.criticalTreatmentRequiresAuthoritativeCriticality === true, 'critical treatment must require authoritative criticality');
assert(contract.messageSurfaces.dialogOnlyWhenInterruptionNecessary === true, 'dialogs must be reserved for interruption');
assert(contract.destructiveActions.colorOnlyIntentAllowed === false, 'destructive intent must not rely on color alone');
assert(contract.destructiveActions.automaticExecutionAllowed === false, 'destructive action must not execute automatically');

assert(tokens.version === '1.6.0-dev.5', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.5.1', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(Object.keys(tokens.emptyStateRoles).length === 10, 'token map must expose ten empty-state roles');
assert(tokens.progressRoles.fakePercentageAllowed === false, 'token map must prohibit fake percentage');
assert(tokens.notificationRoles.criticalRequiresAuthoritativeState === true, 'token map must protect critical notification state');
assert(tokens.boundaries.recoveryCapabilityMayBeInvented === false, 'token map must not invent recovery');
assert(tokens.boundaries.destructiveActionMayExecuteAutomatically === false, 'token map must not execute destructive action');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

assert(glazeV16ResilienceFeedbackDevelopmentContract.version === '1.6.0-dev.5', 'runtime contract version mismatch');
assert(glazeV16ResilienceFeedbackDevelopmentContract.lifecycle === 'development', 'runtime contract must remain development');
assert(glazeV16ResilienceFeedbackDevelopmentContract.consumerEligible === false, 'runtime contract must remain non-consumer-eligible');
assert(glazeV16ResilienceFeedbackDevelopmentContract.recoveryCapabilityMayBeInvented === false, 'runtime must not invent recovery');
assert(glazeV16ResilienceFeedbackDevelopmentContract.fakeProgressAllowed === false, 'runtime must not invent progress');

const aggregateVersionParts = String(glazeV16Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.6.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 5,
  'aggregate Development version must retain or advance beyond dev.5'
);
assert(glazeV16Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV16Development.stableBaseline === '1.5.1', 'aggregate Stable baseline mismatch');
assert(glazeV16Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const number of sections) {
  assert(glazeV16Development.implementedSpecificationSections.includes(number), `aggregate must retain resilience section ${number}`);
}
assert(glazeV16Development.implementedSpecificationSections.includes(1), 'aggregate must retain loading foundation');
assert(glazeV16Development.implementedSpecificationSections.includes(28), 'aggregate must retain material/type/input foundation');
assert(glazeV16Development.implementedSpecificationSections.includes(73), 'aggregate must retain continuity foundation');

for (const kind of emptyKinds) {
  const resolved = resolveGlazeEmptyState({kind, availableActions:['retry','return-to-safe-state','made-up']});
  assert(resolved.kind === kind, `empty state failed: ${kind}`);
  assert(resolved.genericEmptyScreenAllowed === false, `generic empty screen allowed: ${kind}`);
  assert(resolved.recovery.inventedActionCount === 0, `empty state invented action: ${kind}`);
  assert(!resolved.recovery.availableActions.includes('made-up'), `invalid recovery action leaked: ${kind}`);
}

const error = resolveGlazeErrorPresentation({
  dataSafety:'safe',
  availableCapabilities:['local-edit','export'],
  availableActions:['retry','use-local-content']
});
assert(error.structure.whatHappenedRequired === true, 'error must explain what happened');
assert(error.structure.whatRemainsAvailableRequired === true, 'error must explain what remains');
assert(error.state.dataSafety === 'safe', 'error data-safety truth mismatch');
assert(error.state.retryAvailable === true, 'real retry capability missing');
assert(error.disclosure.sensitiveInternalDetailsIncluded === false, 'error leaked sensitive internals');
assert(error.authority.retryInventedByGlaze === false, 'error invented retry');

const recovery = resolveGlazeRecoveryPresentation({
  availableActions:['change-settings','retry','continue-offline']
});
assert(JSON.stringify(recovery.availableActions) === JSON.stringify(['retry','continue-offline','change-settings']), 'recovery order mismatch');
assert(recovery.primarySuggestedAction === 'retry', 'recovery primary suggestion mismatch');
assert(recovery.authority.inventedRecoveryActions === false, 'recovery invented action');
assert(recovery.authority.automaticRecoveryExecutionAllowed === false, 'recovery executed automatically');

for (const state of connectivityStates) {
  const resolved = resolveGlazeConnectivityPresentation({
    state,
    localCapabilities:['read-cache'],
    remoteCapabilities:['sync']
  });
  assert(resolved.state === state, `connectivity state failed: ${state}`);
  assert(resolved.presentation.localCapabilitiesRemainAccessible === true, `local capability hidden: ${state}`);
  assert(resolved.authority.timeoutAloneMayInferState === false, `timeout inferred state: ${state}`);
  assert(resolved.authority.networkProbePerformedByGlaze === false, `Glaze probed network: ${state}`);
}

const stale = resolveGlazeStaleDataPresentation({
  usable:true,
  pendingRefresh:true,
  locallyCached:true,
  unsynchronizedEdits:true,
  lastUpdatedKnown:true
});
assert(stale.presentation.keepContentVisible === true, 'usable stale content must remain visible');
assert(stale.presentation.replaceWithBlankLoadingScreen === false, 'stale content must not be blanked');
assert(stale.presentation.showUnsynchronizedEdits === true, 'unsynchronized edits state missing');
assert(stale.privacy.exactTimestampRequiredInDiagnostic === false, 'diagnostic must not require exact stale timestamp');

const refresh = resolveGlazeBackgroundRefresh({contentAvailable:true,userBlocking:false});
assert(refresh.presentation.preserveExistingInterface === true, 'background refresh must preserve interface');
assert(refresh.presentation.subtleRefreshIndicatorPreferred === true, 'background refresh should prefer subtle indicator');
assert(refresh.presentation.skeletonReplacementPreferred === false, 'background refresh must not prefer skeleton replacement');
assert(refresh.continuity.focusPreservationRequired === true, 'background refresh must preserve focus');

const optimisticSafe = resolveGlazeOptimisticInteraction({
  operation:{optimisticEligible:true,reversible:true},
  failed:false
});
assert(optimisticSafe.allowed === true, 'safe reversible optimistic operation should be allowed');
assert(optimisticSafe.presentation.reflectIntendedStateImmediately === true, 'safe optimism should reflect intended state');
assert(optimisticSafe.presentation.representAsAuthoritativelyCompleteBeforeConfirmation === false, 'optimism must not claim authoritative completion');

const optimisticFailure = resolveGlazeOptimisticInteraction({
  operation:{optimisticEligible:true,reversible:true},
  failed:true,
  reversionAvailable:true,
  availableActions:['retry']
});
assert(optimisticFailure.presentation.revertAvailable === true, 'failed safe optimism should expose real reversion');
assert(optimisticFailure.presentation.retryAvailable === true, 'failed safe optimism should expose real retry');
assert(optimisticFailure.authority.reversionExecutedAutomatically === false, 'reversion must not auto-execute');

const optimisticUnsafe = resolveGlazeOptimisticInteraction({
  operation:{optimisticEligible:true,reversible:true,securitySensitive:true}
});
assert(optimisticUnsafe.allowed === false, 'security-sensitive optimism must be denied');

for (const kind of progressKinds) {
  const args = {kind};
  if (kind === 'determinate') args.value = 0.4;
  if (kind === 'step') { args.currentStep = 2; args.totalSteps = 5; }
  const resolved = resolveGlazeProgressPresentation(args);
  assert(resolved.acceptedKind === kind, `progress kind failed: ${kind}`);
  assert(resolved.semantics.fakePercentageGenerated === false, `fake progress generated: ${kind}`);
}

const invalidDeterminate = resolveGlazeProgressPresentation({kind:'determinate',value:1.5});
assert(invalidDeterminate.acceptedKind === 'indeterminate', 'invalid determinate progress must fall back');
assert(invalidDeterminate.value === null, 'invalid determinate value must not leak');

const invalidStep = resolveGlazeProgressPresentation({kind:'step',currentStep:4,totalSteps:2});
assert(invalidStep.acceptedKind === 'indeterminate', 'invalid step progress must fall back');
assert(invalidStep.totalSteps === null, 'invalid step count must not be invented');

for (const priority of priorities) {
  const resolved = resolveGlazeNotificationPresentation({
    priority,
    authoritativeCritical: priority === 'critical'
  });
  assert(resolved.acceptedPriority === priority, `notification priority failed: ${priority}`);
  assert(resolved.presentation.colorOnlyPriorityMeaningAllowed === false, `color-only notification meaning allowed: ${priority}`);
}

const falseCritical = resolveGlazeNotificationPresentation({priority:'critical',authoritativeCritical:false});
assert(falseCritical.acceptedPriority === 'important', 'non-authoritative critical request must be downgraded');
assert(falseCritical.authority.criticalityUpgradedByGlaze === false, 'Glaze must not invent criticality');

const toast = resolveGlazeMessageSurface({briefConfirmation:true});
assert(toast.surface === 'toast', 'brief confirmation should use toast');
const banner = resolveGlazeMessageSurface({persistentPageImpact:true});
assert(banner.surface === 'banner', 'persistent page impact should use banner');
const dialog = resolveGlazeMessageSurface({interruptionNecessary:true,inlineClearer:false});
assert(dialog.surface === 'dialog', 'necessary interruption should use dialog');
const inline = resolveGlazeMessageSurface({interruptionNecessary:true,inlineClearer:true});
assert(inline.surface === 'inline', 'clearer inline surface should avoid dialog');

const dialogPlan = resolveGlazeDialogPresentation({
  title:'Delete item?',
  purpose:'Confirm permanent deletion.',
  modal:true,
  destructive:true,
  restoreTargetValid:true
});
assert(dialogPlan.useDialog === true, 'valid interruptive dialog should remain dialog');
assert(dialogPlan.semantics.titlePresent === true, 'dialog title missing');
assert(dialogPlan.semantics.destructiveActionExplicit === true, 'destructive dialog action must be explicit');
assert(dialogPlan.focus.trapRequired === true, 'modal dialog must trap focus when appropriate');
assert(dialogPlan.focus.automaticFocusExecutionByResolver === false, 'Glaze must not execute focus operations');

const clearerInline = resolveGlazeDialogPresentation({
  title:'Info',
  purpose:'Inline is clearer.',
  inlineWouldBeClearer:true
});
assert(clearerInline.useDialog === false, 'dialog must yield to clearer inline surface');

const destructive = resolveGlazeDestructiveAction({risk:'irreversible'});
assert(destructive.destructive === true, 'irreversible action must be destructive');
assert(destructive.presentation.confirmationRequired === true, 'irreversible action must require confirmation');
assert(destructive.presentation.colorOnlyIntentAllowed === false, 'destructive intent must not rely on color');
assert(destructive.authority.actionExecutedAutomatically === false, 'destructive action must not auto-execute');

let invalidEmptyRejected=false;
try { resolveGlazeEmptyState({kind:'generic'}); } catch { invalidEmptyRejected=true; }
assert(invalidEmptyRejected, 'unknown empty state must fail closed');

let invalidConnectivityRejected=false;
try { resolveGlazeConnectivityPresentation({state:'probably-online'}); } catch { invalidConnectivityRejected=true; }
assert(invalidConnectivityRejected, 'unknown connectivity state must fail closed');

let invalidProgressRejected=false;
try { resolveGlazeProgressPresentation({kind:'fake-percent'}); } catch { invalidProgressRejected=true; }
assert(invalidProgressRejected, 'unknown progress kind must fail closed');

let invalidPriorityRejected=false;
try { resolveGlazeNotificationPresentation({priority:'panic'}); } catch { invalidPriorityRejected=true; }
assert(invalidPriorityRejected, 'unknown notification priority must fail closed');

console.log('GLAZE UI V1.6 resilience/feedback Development foundation: PASS');
console.log('Empty-state kinds: 10');
console.log('Recovery actions: 8');
console.log('Connectivity states: 7');
console.log('Progress kinds: 7');
console.log('Notification priorities: 5');
console.log('Implemented sections: 29-40');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
