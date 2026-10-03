#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  createGlazeAdaptationDiagnostic,
  resolveGlazeAccessibilityProfiles,
  resolveGlazeCapabilityPresentation,
  resolveGlazePerformanceLevel,
  resolveGlazeSemanticState,
  glazeV16StateAccessibilityDevelopmentContract
} from '../js/glaze-v1.6-state-accessibility.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.6/state-accessibility.dev.json');
const schema = json('schemas/v1.6-state-accessibility.schema.json');
const tokens = json('tokens/glaze-v1.6-state-accessibility.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_6_PLANNED.md');

const expectedSections = [6, 7, 8, 9, 55, 56, 57, 58, 59];
const expectedStates = [
  'neutral', 'informational', 'positive', 'successful', 'warning', 'caution',
  'error', 'critical', 'restricted', 'privacy-sensitive', 'security-sensitive',
  'offline', 'degraded', 'syncing', 'loading', 'updating', 'stale', 'disabled',
  'read-only', 'selected', 'active', 'inactive', 'pending', 'scheduled', 'paused',
  'complete'
];
const expectedProfiles = [
  'default', 'reduced-motion', 'minimal-motion', 'reduced-transparency',
  'solid-surfaces', 'increased-contrast', 'large-text', 'extra-large-text',
  'simplified-visual-effects', 'strong-focus', 'touch-assistance',
  'keyboard-first', 'screen-reader-optimized'
];

assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
const stableTuple = stable.split('.').slice(0, 3).map(Number);
assert(stableTuple.length === 3 && stableTuple.every(Number.isInteger), 'live Stable must use major.minor.patch versioning');
assert(
  stableTuple[0] > 1 || (stableTuple[0] === 1 && (stableTuple[1] > 5 || (stableTuple[1] === 5 && stableTuple[2] >= 1))),
  'V1.6 retained Development validation requires live Stable authority at or after its frozen 1.5.1 baseline'
);
assert((lifecycle.activeCandidate === null || lifecycle.activeCandidate === '1.6.0-rc.1'), 'V1.6 Development validation permits only no active Candidate or governed 1.6.0-rc.1');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.6 Development must not create an active patch RC');

for (const number of expectedSections) {
  assert(spec.includes(`# ${number}.`), `V1.6 planned specification missing section ${number}`);
}

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.6-state-accessibility.schema.json', 'contract schema binding mismatch');
assert(contract.schemaVersion === 1, 'contract schemaVersion must be 1');
assert(contract.version === '1.6.0-dev.2', 'contract Development version mismatch');
assert(contract.lifecycle === 'Development', 'contract lifecycle must remain Development');
assert(contract.stableBaseline === '1.5.1', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify(expectedSections), 'implemented section set mismatch');
assert(JSON.stringify(contract.semanticStates) === JSON.stringify(expectedStates), 'semantic state grammar mismatch');
assert(JSON.stringify(contract.accessibilityProfiles) === JSON.stringify(expectedProfiles), 'accessibility profile grammar mismatch');
assert(contract.semanticColor.colorOnlyMeaningAllowed === false, 'semantic meaning must not depend on color alone');
assert(contract.accessibilityPrecedence.overridesDecorativeRichness === true, 'accessibility must override decorative richness');
assert(contract.dynamicPerformanceAdaptation.capabilityTruthMayBeModified === false, 'performance adaptation must not modify capability truth');
assert(contract.antiJitter.hysteresisRequired === true, 'anti-jitter hysteresis must be required');

assert(tokens.version === '1.6.0-dev.2', 'state token map version mismatch');
assert(tokens.lifecycle === 'Development', 'state token map must remain Development');
assert(tokens.stableBaseline === '1.5.1', 'state token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'state token map must be non-consumer-eligible');
assert(Object.keys(tokens.semanticStateRoles).length === 26, 'token map must expose 26 semantic state roles');
assert(tokens.semanticColor.colorOnlyMeaningAllowed === false, 'token map must forbid color-only meaning');
assert(tokens.antiJitter.rapidCostUpgradeAllowed === false, 'token map must prohibit rapid cost upgrades');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority does not exist: ${source}`);
}

assert(glazeV16StateAccessibilityDevelopmentContract.version === '1.6.0-dev.2', 'runtime contract version mismatch');
assert(glazeV16StateAccessibilityDevelopmentContract.lifecycle === 'development', 'runtime contract must remain development');
assert(glazeV16StateAccessibilityDevelopmentContract.stableBaseline === '1.5.1', 'runtime Stable baseline mismatch');
assert(glazeV16StateAccessibilityDevelopmentContract.consumerEligible === false, 'runtime contract must remain non-consumer-eligible');
const aggregateVersionParts = String(glazeV16Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.6.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 2,
  'aggregate Development version must retain or advance beyond dev.2'
);
assert(glazeV16Development.lifecycle === 'development', 'aggregate entrypoint must remain Development');
assert(glazeV16Development.stableBaseline === '1.5.1', 'aggregate Stable baseline must remain 1.5.1');
assert(glazeV16Development.consumerEligible === false, 'aggregate entrypoint must remain non-consumer-eligible');
assert(glazeV16Development.implementedSpecificationSections.includes(1), 'aggregate must retain loading foundation');
for (const number of expectedSections) {
  assert(glazeV16Development.implementedSpecificationSections.includes(number), `aggregate must retain state/accessibility section ${number}`);
}

for (const state of expectedStates) {
  const resolved = resolveGlazeSemanticState({state, sourceAuthority: 'application', authoritative: true});
  assert(resolved.state === state, `semantic state failed to resolve: ${state}`);
  assert(resolved.colorOnlyMeaningAllowed === false, `color-only meaning incorrectly allowed: ${state}`);
  assert(resolved.authority.stateTruthCreatedByGlaze === false, `Glaze created state truth: ${state}`);
  assert(resolved.source.rawProviderIdentityIncluded === false, `provider identity leaked: ${state}`);
}

const critical = resolveGlazeSemanticState({state: 'critical'});
assert(critical.protectedSemanticRole === true, 'critical state must use protected semantic role');
assert(critical.nonColorIndicator === 'icon-and-label', 'critical state must have non-color indicator');

const privacy = resolveGlazeSemanticState({state: 'privacy-sensitive'});
assert(privacy.protectedSemanticRole === true, 'privacy state must use protected semantic role');
assert(privacy.authority.privacyTruthCreatedByGlaze === false, 'Glaze must not create privacy truth');

const security = resolveGlazeSemanticState({state: 'security-sensitive'});
assert(security.protectedSemanticRole === true, 'security state must use protected semantic role');
assert(security.authority.securityTruthCreatedByGlaze === false, 'Glaze must not create security truth');

const disabled = resolveGlazeCapabilityPresentation({state: 'disabled'});
const unavailable = resolveGlazeCapabilityPresentation({state: 'unavailable'});
const restricted = resolveGlazeCapabilityPresentation({state: 'restricted'});
const unsupported = resolveGlazeCapabilityPresentation({state: 'unsupported'});
const permission = resolveGlazeCapabilityPresentation({state: 'permission-required'});
assert(disabled.reason === 'local-state-disabled', 'disabled definition mismatch');
assert(unavailable.reason === 'capability-unavailable', 'unavailable definition mismatch');
assert(restricted.reason === 'authoritative-rule-restricts-use', 'restricted definition mismatch');
assert(unsupported.reason === 'runtime-unsupported', 'unsupported definition mismatch');
assert(permission.reason === 'user-authorization-required', 'permission-required definition mismatch');
assert(permission.permissionRequestedAutomatically === false, 'permission must not be requested automatically');
assert(restricted.authority.restrictionInferred === false, 'restriction must not be inferred by Glaze');

const defaultProfiles = resolveGlazeAccessibilityProfiles({preferences: {}});
assert(JSON.stringify(defaultProfiles.profiles) === JSON.stringify(['default']), 'empty accessibility preferences must resolve to Default only');

const accessibleProfiles = resolveGlazeAccessibilityProfiles({
  preferences: {
    reducedMotion: true,
    reducedTransparency: true,
    increasedContrast: true,
    extraLargeText: true,
    strongFocus: true,
    screenReaderOptimized: true
  }
});
for (const profile of ['reduced-motion', 'reduced-transparency', 'increased-contrast', 'extra-large-text', 'strong-focus', 'screen-reader-optimized']) {
  assert(accessibleProfiles.profiles.includes(profile), `combined accessibility profile missing: ${profile}`);
}
assert(accessibleProfiles.presentation.continuousDecorativeMotionAllowed === false, 'Reduced Motion must disable continuous decorative motion');
assert(accessibleProfiles.presentation.transparencyAllowed === false, 'Reduced Transparency must disable transparency');
assert(accessibleProfiles.presentation.blurAllowed === false, 'Reduced Transparency must disable blur');
assert(accessibleProfiles.presentation.strongFocusRequired === true, 'Strong Focus / screen-reader profile must require strong focus');
assert(accessibleProfiles.presentation.largeTextReflowRequired === true, 'Extra-Large Text must require reflow');
assert(accessibleProfiles.precedence.accessibilityOverridesDecorativeRichness === true, 'accessibility precedence missing');
assert(accessibleProfiles.source.profilesInferredFromPrivateContent === false, 'accessibility profiles must not be inferred from private content');

const full = resolveGlazePerformanceLevel({
  nowMs: 5000,
  previous: {level: 'full', acceptedAtMs: 0},
  runtime: {pressure: 'normal', renderingCapability: 'full', recoveryStableMs: 5000}
});
assert(full.acceptedLevel === 'full', 'normal authoritative runtime should retain Full');

const immediateDown = resolveGlazePerformanceLevel({
  nowMs: 100,
  previous: {level: 'full', acceptedAtMs: 0},
  runtime: {pressure: 'critical'}
});
assert(immediateDown.acceptedLevel === 'essential', 'critical pressure must allow immediate cost reduction');
assert(immediateDown.decision === 'immediate-cost-reduction', 'critical pressure decision mismatch');
assert(immediateDown.invariants.capabilityTruthModified === false, 'performance adaptation must not modify capability truth');

const heldRecovery = resolveGlazePerformanceLevel({
  nowMs: 1000,
  previous: {level: 'essential', acceptedAtMs: 0},
  runtime: {pressure: 'normal', renderingCapability: 'full', recoveryStableMs: 1000}
});
assert(heldRecovery.acceptedLevel === 'essential', 'early recovery must be held by anti-jitter');
assert(heldRecovery.antiJitter.applied === true, 'anti-jitter must be observable during held recovery');
assert(heldRecovery.decision === 'recovery-held-by-hysteresis', 'held recovery decision mismatch');

const stableRecovery = resolveGlazePerformanceLevel({
  nowMs: 6000,
  previous: {level: 'essential', acceptedAtMs: 0},
  runtime: {pressure: 'normal', renderingCapability: 'full', recoveryStableMs: 4000}
});
assert(stableRecovery.acceptedLevel === 'full', 'stable recovery should allow visual-cost upgrade after dwell and stability');
assert(stableRecovery.decision === 'stable-recovery-upgrade', 'stable recovery decision mismatch');

const efficient = resolveGlazePerformanceLevel({
  nowMs: 5000,
  previous: {level: 'balanced', acceptedAtMs: 0},
  runtime: {sustainedFrameDegradation: true, powerSaving: true}
});
assert(['efficient', 'essential'].includes(efficient.acceptedLevel), 'runtime pressure must reduce visual cost');
assert(efficient.diagnostics.rawRuntimePayloadIncluded === false, 'diagnostics must not include raw runtime payload');

const diagnostic = createGlazeAdaptationDiagnostic({
  reasonCodes: ['reduced-transparency-applied', 'performance-level-adapted'],
  accessibilityProfiles: ['reduced-transparency', 'increased-contrast'],
  performanceLevel: 'efficient',
  rawContent: 'must-not-appear'
});
assert(diagnostic.reasonCodes.length === 2, 'diagnostic reason code count mismatch');
assert(diagnostic.privacy.rawContentIncluded === false, 'adaptation diagnostic must exclude raw content');
assert(diagnostic.privacy.providerIdentityIncluded === false, 'adaptation diagnostic must exclude provider identity');
assert(diagnostic.authority.operationalAuthorityGranted === false, 'diagnostics must grant no operational authority');

let invalidStateRejected = false;
try {
  resolveGlazeSemanticState({state: 'pretty-purple'});
} catch {
  invalidStateRejected = true;
}
assert(invalidStateRejected, 'unknown semantic state must fail closed');

let invalidCapabilityRejected = false;
try {
  resolveGlazeCapabilityPresentation({state: 'maybe'});
} catch {
  invalidCapabilityRejected = true;
}
assert(invalidCapabilityRejected, 'unknown capability presentation state must fail closed');

console.log('GLAZE UI V1.6 state/accessibility/performance Development foundation: PASS');
console.log('Semantic states: 26');
console.log('Accessibility profiles: 13');
console.log('Performance levels: 4');
console.log('Implemented sections: 6,7,8,9,55,56,57,58,59');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
