#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  createGlazeSkeletonDescriptor,
  resolveGlazeLoadingPresentation,
  glazeV16LoadingDevelopmentContract
} from '../js/glaze-v1.6-loading.dev.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.6/loading-skeleton.dev.json');
const schema = json('schemas/v1.6-loading-skeleton.schema.json');
const tokens = json('tokens/glaze-v1.6-loading.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const planned = read('GLAZE_UI_V1_6_PLANNED.md');

assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
const stableTuple = stable.split('.').slice(0, 3).map(Number);
assert(stableTuple.length === 3 && stableTuple.every(Number.isInteger), 'live Stable must use major.minor.patch versioning');
assert(
  stableTuple[0] > 1 || (stableTuple[0] === 1 && (stableTuple[1] > 5 || (stableTuple[1] === 5 && stableTuple[2] >= 1))),
  'V1.6 retained Development validation requires live Stable authority at or after its frozen 1.5.1 baseline'
);
assert((lifecycle.activeCandidate === null || lifecycle.activeCandidate === '1.6.0-rc.1'), 'V1.6 Development validation permits only no active Candidate or governed 1.6.0-rc.1');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.6 Development foundation must not create an active patch RC');
assert(planned.includes('status: "Planned"'), 'V1.6 human specification must remain Planned');
assert(planned.includes('# 1. Glaze Skeleton Motion System'), 'planned specification section 1 missing');
assert(planned.includes('# 2. Skeleton Accessibility'), 'planned specification section 2 missing');
assert(planned.includes('# 3. Intelligent Loading Presentation'), 'planned specification section 3 missing');
assert(planned.includes('# 4. Loading State Escalation'), 'planned specification section 4 missing');
assert(planned.includes('# 100. Governing Principle'), 'planned specification section 100 missing');

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.6-loading-skeleton.schema.json', 'contract schema binding mismatch');
assert(contract.schemaVersion === 1, 'contract schemaVersion must be 1');
assert(contract.version === '1.6.0-dev.1', 'contract Development version mismatch');
assert(contract.lifecycle === 'Development', 'contract lifecycle must remain Development');
assert(contract.stableBaseline === '1.5.1', 'contract stable baseline mismatch');
assert(contract.consumerEligible === false, 'Development contract must be non-consumer-eligible');
assert(contract.runtimeEntrypoint === 'js/glaze-v1.6-loading.dev.mjs', 'runtime entrypoint mismatch');
assert(contract.tokenMap === 'tokens/glaze-v1.6-loading.dev.json', 'token map reference mismatch');
assert(Array.isArray(contract.skeletonPrimitives) && contract.skeletonPrimitives.length === 26, 'expected 26 skeleton primitive types');
assert(Array.isArray(contract.skeletonMotionModes) && contract.skeletonMotionModes.length === 5, 'expected five skeleton motion modes');
assert(Array.isArray(contract.loadingPresentations) && contract.loadingPresentations.length === 14, 'expected fourteen loading presentation kinds');

assert(tokens.version === '1.6.0-dev.1', 'V1.6 loading token map version mismatch');
assert(tokens.lifecycle === 'Development', 'V1.6 loading token map must remain Development');
assert(tokens.stableBaseline === '1.5.1', 'V1.6 loading token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'V1.6 loading token map must be non-consumer-eligible');
assert(tokens.accessibility?.reducedMotion?.skeletonMode === 'static', 'Reduced Motion token fallback must be static');
assert(tokens.accessibility?.reducedTransparency?.surfaceMode === 'solid', 'Reduced Transparency token fallback must be solid');
assert(tokens.motionFatigue?.manySkeletonThreshold === 12, 'motion fatigue skeleton threshold mismatch');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority does not exist: ${source}`);
}

assert(glazeV16LoadingDevelopmentContract.version === '1.6.0-dev.1', 'runtime Development contract identity mismatch');
assert(glazeV16LoadingDevelopmentContract.lifecycle === 'development', 'runtime lifecycle must remain development');
assert(glazeV16LoadingDevelopmentContract.stableBaseline === '1.5.1', 'runtime Stable baseline mismatch');
assert(glazeV16LoadingDevelopmentContract.consumerEligible === false, 'runtime Development contract must be non-consumer-eligible');

const quiet = resolveGlazeLoadingPresentation({state: 'initial', elapsedMs: 40});
assert(quiet.presentation.kind === 'quiet-wait' && quiet.presentation.visible === false, 'very short initial work must stay in quiet window');

const skeleton = resolveGlazeLoadingPresentation({
  state: 'initial',
  elapsedMs: 220,
  runtime: {performanceLevel: 'full'},
  skeleton: {count: 3, requestedMotionMode: 'flow', geometrySimilar: true}
});
assert(skeleton.presentation.kind === 'skeleton', 'initial load after skeleton delay must use skeleton presentation');
assert(skeleton.skeleton.motion.baseMode === 'flow', 'bounded full-performance skeleton may use Flow');
assert(skeleton.skeleton.motion.morphAllowed === true, 'geometry-similar skeleton may morph when motion is allowed');
assert(skeleton.skeleton.hiddenFromAccessibilityTree === true, 'skeleton must be hidden from accessibility tree');

const reduced = resolveGlazeLoadingPresentation({
  state: 'initial',
  elapsedMs: 220,
  accessibility: {reducedMotion: true, reducedTransparency: true},
  runtime: {performanceLevel: 'full'},
  skeleton: {count: 2, requestedMotionMode: 'flow', geometrySimilar: true}
});
assert(reduced.skeleton.motion.baseMode === 'static', 'Reduced Motion must force static skeleton');
assert(reduced.skeleton.motion.morphAllowed === false, 'Reduced Motion must disable skeleton morph');
assert(reduced.skeleton.solidAlternativeApplied === true, 'Reduced Transparency must use solid skeleton alternative');

const refresh = resolveGlazeLoadingPresentation({
  state: 'refreshing',
  elapsedMs: 4000,
  content: {available: true}
});
assert(refresh.presentation.kind === 'background-refresh', 'refresh with available content must use background-refresh');
assert(refresh.presentation.preserveExistingContent === true, 'refresh must preserve existing content');
assert(refresh.presentation.contentBlankedForRefresh === false, 'refresh must not blank usable content');

const loadingMore = resolveGlazeLoadingPresentation({
  state: 'loading-more',
  elapsedMs: 800,
  content: {available: true}
});
assert(loadingMore.presentation.kind === 'inline-progress', 'loading additional results must use inline progress');

const stale = resolveGlazeLoadingPresentation({
  state: 'initial',
  elapsedMs: 9000,
  content: {staleUsable: true}
});
assert(stale.presentation.kind === 'stale-content', 'stale usable content must remain visible');

const optimistic = resolveGlazeLoadingPresentation({
  state: 'initial',
  elapsedMs: 10,
  operation: {optimisticEligible: true, reversible: true}
});
assert(optimistic.presentation.kind === 'optimistic-state', 'safe reversible optimistic operation should render optimistically');
assert(optimistic.optimism.allowed === true, 'safe optimistic operation must be allowed');

const protectedOperation = resolveGlazeLoadingPresentation({
  state: 'initial',
  elapsedMs: 400,
  operation: {optimisticEligible: true, reversible: true, securitySensitive: true}
});
assert(protectedOperation.presentation.kind !== 'optimistic-state', 'security-sensitive operation must not render optimistically');
assert(protectedOperation.optimism.allowed === false, 'security-sensitive optimism must be denied');

const irreversible = resolveGlazeLoadingPresentation({
  state: 'initial',
  elapsedMs: 400,
  operation: {optimisticEligible: true, reversible: false, irreversible: true}
});
assert(irreversible.presentation.kind !== 'optimistic-state', 'irreversible operation must not render optimistically');

const determinate = resolveGlazeLoadingPresentation({
  state: 'processing',
  elapsedMs: 1000,
  progress: {kind: 'determinate', value: 0.42}
});
assert(determinate.presentation.kind === 'determinate-progress', 'truthful determinate progress must be used when available');
assert(determinate.presentation.progress.value === 0.42, 'determinate progress value must be preserved');
assert(determinate.presentation.fakePercentageGenerated === false, 'resolver must not invent fake percentages');

const invalidDeterminate = resolveGlazeLoadingPresentation({
  state: 'processing',
  elapsedMs: 1000,
  progress: {kind: 'determinate', value: 1.7}
});
assert(invalidDeterminate.presentation.kind === 'indeterminate-progress', 'invalid determinate value must fall back to indeterminate');
assert(invalidDeterminate.presentation.progress.value === null, 'invalid determinate value must not be exposed');

const offline = resolveGlazeLoadingPresentation({
  state: 'offline',
  elapsedMs: 12000,
  content: {available: true, staleUsable: true},
  recovery: {continueOfflineAvailable: true}
});
assert(offline.presentation.kind === 'offline', 'authoritative offline input must remain distinct');
assert(offline.escalation.continueOfflineAvailable === true, 'real continue-offline capability may be presented');
assert(offline.escalation.timeoutAloneInfersOffline === false, 'timeout must never infer offline');

const delayed = resolveGlazeLoadingPresentation({state: 'initial', elapsedMs: 7000});
assert(delayed.stage === 'delayed-response', 'long initial load must escalate to delayed-response');
assert(delayed.authority.connectivityInferred === false, 'delayed response must not infer connectivity');
assert(delayed.authority.recoveryCapabilityInvented === false, 'delayed response must not invent recovery capability');

const busy = resolveGlazeLoadingPresentation({
  state: 'initial',
  elapsedMs: 500,
  runtime: {performanceLevel: 'full'},
  skeleton: {count: 20, requestedMotionMode: 'flow'}
});
assert(busy.skeleton.motion.baseMode === 'static', 'many simultaneous skeletons must reduce to static');
assert(busy.skeleton.motion.motionFatigueProtectionApplied === true, 'motion fatigue protection must be observable');

const essential = resolveGlazeLoadingPresentation({
  state: 'initial',
  elapsedMs: 500,
  runtime: {performanceLevel: 'essential'},
  skeleton: {count: 2, requestedMotionMode: 'flow'}
});
assert(essential.skeleton.motion.baseMode === 'static', 'Essential performance level must use static skeleton');
assert(essential.skeleton.motion.performanceConstraintApplied === true, 'performance constraint must be observable');

const descriptor = createGlazeSkeletonDescriptor({
  type: 'image',
  geometry: {aspectRatio: '16/9', cornerRole: 'card', spacingRole: 'content-gap'},
  hierarchy: 'primary-media'
});
assert(descriptor.type === 'image', 'skeleton descriptor type mismatch');
assert(descriptor.accessibility.hiddenFromAccessibilityTree === true, 'descriptor must be hidden from accessibility tree');
assert(descriptor.truth.fakeContentGenerated === false, 'descriptor must not manufacture fake content');

let invalidTypeRejected = false;
try {
  createGlazeSkeletonDescriptor({type: 'fake-content'});
} catch {
  invalidTypeRejected = true;
}
assert(invalidTypeRejected, 'unknown skeleton primitive type must fail closed');

let invalidThresholdRejected = false;
try {
  resolveGlazeLoadingPresentation({
    state: 'initial',
    thresholds: {skeletonDelayMs: 500, extendedLoadMs: 100, delayedResponseMs: 1000}
  });
} catch {
  invalidThresholdRejected = true;
}
assert(invalidThresholdRejected, 'non-monotonic loading thresholds must fail closed');

console.log('GLAZE UI V1.6 loading/skeleton Development foundation: PASS');
console.log('Skeleton primitive types: 26');
console.log('Skeleton motion modes: 5');
console.log('Loading presentation kinds: 14');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
