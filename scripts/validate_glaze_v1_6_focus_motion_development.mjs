#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeFocusPresentation,
  resolveGlazeMotionPlan,
  resolveGlazeMicrointeraction,
  resolveGlazeStateContinuity,
  resolveGlazeContentTransition,
  glazeV16FocusMotionDevelopmentContract
} from '../js/glaze-v1.6-focus-motion.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.6/focus-motion.dev.json');
const schema = json('schemas/v1.6-focus-motion.schema.json');
const tokens = json('tokens/glaze-v1.6-focus-motion.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_6_PLANNED.md');

const sections = [10, 11, 12, 13, 14, 71, 72, 73];
const families = [
  'enter', 'exit', 'expand', 'collapse', 'move', 'reorder', 'replace',
  'reveal', 'hide', 'focus', 'select', 'load', 'refresh', 'complete',
  'fail', 'connect', 'disconnect'
];
const microIntents = [
  'toggle', 'selection', 'favorite', 'save', 'copy', 'pin', 'expand',
  'collapse', 'refresh', 'retry', 'send', 'download', 'upload', 'completion'
];

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
assert(contract.$schema === '../../schemas/v1.6-focus-motion.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.6.0-dev.3', 'focus/motion contract version mismatch');
assert(contract.lifecycle === 'Development', 'focus/motion contract must remain Development');
assert(contract.stableBaseline === '1.5.1', 'focus/motion Stable baseline mismatch');
assert(contract.consumerEligible === false, 'focus/motion contract must be non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify(sections), 'implemented section set mismatch');
assert(JSON.stringify(contract.motionFamilies) === JSON.stringify(families), 'motion family grammar mismatch');
assert(JSON.stringify(contract.microinteractionIntents) === JSON.stringify(microIntents), 'microinteraction intent grammar mismatch');
assert(contract.focus.unexpectedFocusStealingAllowed === false, 'focus stealing must remain prohibited');
assert(contract.interruptibility.userDrivenMotionInterruptible === true, 'user-driven motion must be interruptible');
assert(contract.interruptibility.finalStateDependsOnAnimationCompletion === false, 'final state must not depend on animation');
assert(contract.motionBudget.fatigueProtectionRequired === true, 'motion fatigue protection must be required');
assert(contract.glazeMotionBoundary.promotedByThisContract === false, 'V1.6 must not promote Glaze Motion');
assert(contract.authority.navigationExecutedByResolver === false, 'focus/motion resolver must not execute navigation');

assert(tokens.version === '1.6.0-dev.3', 'focus/motion token map version mismatch');
assert(tokens.lifecycle === 'Development', 'focus/motion token map must remain Development');
assert(tokens.stableBaseline === '1.5.1', 'focus/motion token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'focus/motion token map must remain non-consumer-eligible');
assert(Object.keys(tokens.motionFamilies).length === 17, 'token map must expose 17 motion families');
assert(tokens.glazeMotionBoundary.promotedByV16SemanticMap === false, 'token map must not promote Glaze Motion');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

assert(glazeV16FocusMotionDevelopmentContract.version === '1.6.0-dev.3', 'runtime focus/motion version mismatch');
assert(glazeV16FocusMotionDevelopmentContract.lifecycle === 'development', 'runtime focus/motion lifecycle mismatch');
assert(glazeV16FocusMotionDevelopmentContract.consumerEligible === false, 'runtime focus/motion must remain non-consumer-eligible');
assert(glazeV16FocusMotionDevelopmentContract.glazeMotionExperimentalLifecyclePromoted === false, 'runtime must not promote Glaze Motion');
const aggregateVersionParts = String(glazeV16Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.6.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 3,
  'aggregate Development version must retain or advance beyond dev.3'
);
assert(glazeV16Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV16Development.stableBaseline === '1.5.1', 'aggregate Stable baseline must remain 1.5.1');
assert(glazeV16Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const number of sections) {
  assert(glazeV16Development.implementedSpecificationSections.includes(number), `aggregate must retain focus/motion section ${number}`);
}

const keyboardFocus = resolveGlazeFocusPresentation({
  focused: true,
  selected: true,
  hovered: true,
  modality: 'keyboard',
  material: 'functional-glass'
});
assert(keyboardFocus.focus.visible === true, 'keyboard focus must be visible');
assert(keyboardFocus.focus.contrastRole === 'focus.material-protected', 'focus on Glaze material must use protected contrast');
assert(keyboardFocus.focus.distinctFromSelection === true, 'focus must remain distinct from selection');
assert(keyboardFocus.focus.distinctFromHover === true, 'focus must remain distinct from hover');
assert(keyboardFocus.continuity.focusStealingAllowed === false, 'unexpected focus stealing must be prohibited');

const restoration = resolveGlazeFocusPresentation({
  focused: true,
  modality: 'directional',
  requestedRestoreTarget: 'dialog-trigger',
  restoreTargetValid: true
});
assert(restoration.continuity.restoration.suggestedAction === 'restore-authoritative-target', 'valid focus restoration target should be suggested');
assert(restoration.continuity.restoration.automaticExecutionByGlaze === false, 'Glaze must not execute focus restoration itself');

const invalidRestoration = resolveGlazeFocusPresentation({
  focused: true,
  modality: 'keyboard',
  requestedRestoreTarget: 'gone',
  restoreTargetValid: false
});
assert(invalidRestoration.continuity.restoration.suggestedAction === 'resolve-nearest-logical-valid-target', 'invalid focus target must not be restored blindly');

for (const family of families) {
  const plan = resolveGlazeMotionPlan({
    family,
    magnitude: 'small',
    surfaceHierarchy: 'secondary',
    userDriven: true
  });
  assert(plan.family === family, `motion family failed to resolve: ${family}`);
  assert(plan.interaction.interruptible === true, `user-driven motion not interruptible: ${family}`);
  assert(plan.presentation.finalStateDependsOnAnimationCompletion === false, `final state depends on animation: ${family}`);
  assert(plan.authority.actionExecutedByMotionResolver === false, `motion resolver executed action: ${family}`);
}

const cappedDecoration = resolveGlazeMotionPlan({
  family: 'move',
  magnitude: 'large',
  surfaceHierarchy: 'decoration'
});
assert(cappedDecoration.acceptedMagnitude === 'micro', 'decorative motion must not use large semantic magnitude');

const primaryMotion = resolveGlazeMotionPlan({
  family: 'move',
  magnitude: 'large',
  surfaceHierarchy: 'primary'
});
assert(primaryMotion.acceptedMagnitude === 'medium', 'primary motion magnitude cap mismatch');

const reduced = resolveGlazeMotionPlan({
  family: 'replace',
  magnitude: 'medium',
  surfaceHierarchy: 'primary',
  accessibilityProfiles: ['reduced-motion']
});
assert(reduced.presentation.mode === 'opacity-or-immediate', 'Reduced Motion must simplify replacement');
assert(reduced.presentation.continuousMotionAllowed === false, 'Reduced Motion must disable continuous motion');
assert(reduced.accessibility.reducedMotionApplied === true, 'Reduced Motion application must be observable');

const budgeted = resolveGlazeMotionPlan({
  family: 'move',
  magnitude: 'medium',
  surfaceHierarchy: 'primary',
  activeMotion: {
    continuousAnimatedElements: 5,
    simultaneousTransitions: 7,
    largeAreaTransformations: 2
  }
});
assert(budgeted.budget.fatigueProtectionApplied === true, 'motion budget exceedance must trigger fatigue protection');
assert(budgeted.presentation.continuousMotionAllowed === false, 'budget pressure must disable continuous optional motion');
assert(budgeted.budget.exceededKeys.length >= 3, 'budget exceedance diagnostics incomplete');

for (const intent of microIntents) {
  const micro = resolveGlazeMicrointeraction({intent});
  assert(micro.intent === intent, `microinteraction failed: ${intent}`);
  assert(micro.shortByDefault === true, `microinteraction must remain short: ${intent}`);
  assert(micro.interruptible === true, `microinteraction must be interruptible: ${intent}`);
  assert(micro.finalSemanticStateIndependentOfAnimation === true, `microinteraction state depends on animation: ${intent}`);
}

const continuous = resolveGlazeStateContinuity({
  fromState: 'play',
  toState: 'pause',
  conceptualIdentitySame: true
});
assert(continuous.transition === 'continuous-transform', 'same-identity state change should prefer continuous transform');

const reducedContinuity = resolveGlazeStateContinuity({
  fromState: 'offline',
  toState: 'online',
  conceptualIdentitySame: true,
  accessibilityProfiles: ['reduced-motion']
});
assert(reducedContinuity.transition === 'immediate-state-change', 'Reduced Motion must simplify state continuity');
assert(reducedContinuity.requirements.preserveFocus === true, 'state continuity must preserve focus');

const content = resolveGlazeContentTransition({
  sameConceptualRegion: true
});
assert(content.mode === 'subtle-replacement', 'same-region content should use subtle replacement when allowed');
assert(content.preserve.focus === true, 'content transition must preserve focus');
assert(content.preserve.scrollPosition === true, 'content transition must preserve scroll position');
assert(content.prohibited.flashing === true, 'flashing must be prohibited');
assert(content.prohibited.scrollJump === true, 'scroll jumps must be prohibited');

const reducedContent = resolveGlazeContentTransition({
  sameConceptualRegion: true,
  accessibilityProfiles: ['minimal-motion']
});
assert(reducedContent.mode === 'immediate-or-opacity', 'Minimal Motion must simplify content replacement');

let invalidFamilyRejected = false;
try {
  resolveGlazeMotionPlan({family: 'spin-forever'});
} catch {
  invalidFamilyRejected = true;
}
assert(invalidFamilyRejected, 'unknown motion family must fail closed');

let invalidModalityRejected = false;
try {
  resolveGlazeFocusPresentation({modality: 'telepathy'});
} catch {
  invalidModalityRejected = true;
}
assert(invalidModalityRejected, 'unknown focus modality must fail closed');

console.log('GLAZE UI V1.6 focus/motion Development foundation: PASS');
console.log('Focus modalities: 8');
console.log('Motion families: 17');
console.log('Microinteraction intents: 14');
console.log('Implemented sections: 10,11,12,13,14,71,72,73');
console.log('Glaze Motion promoted: false');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
