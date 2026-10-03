#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeFormFactorProfile,
  resolveGlazeFormFactorTransition,
  resolveGlazeExperimentalFormFactorBoundary,
  glazeV17FormFactorProfilesDevelopmentContract
} from '../js/glaze-v1.7-form-factor-profiles.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.7/form-factor-profiles.dev.json');
const schema = json('schemas/v1.7-form-factor-profiles.schema.json');
const tokens = json('tokens/glaze-v1.7-form-factor-profiles.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_7_PLANNED.md');

const profiles = ['mobile','tablet','desktop','foldable','tv','wearable'];
const dimensions = [
  'navigation',
  'reachability',
  'density',
  'safe-areas',
  'viewing-distance',
  'primary-input',
  'typography',
  'action-placement',
  'information-hierarchy',
  'pane-behavior',
  'overlay-behavior',
  'motion',
  'interaction-targets'
];

assert(stable === '1.7.0', 'V1.7 dev.3 must coexist with bounded Glaze V1.7 / 1.7.0 as current Stable');
assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
assert(lifecycle.activeCandidate === null, 'V1.7 dev.3 must not create an active Candidate');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.7 dev.3 must not create a patch RC');
assert(lifecycle.plannedNext==='1.7.1', 'V1.7 dev.3 must not mutate lifecycle plannedNext');

assert(spec.includes('## 3. First-Class Form-Factor Profiles'), 'V1.7 specification missing form-factor profile section');
for (const label of ['Mobile','Tablet','Desktop','Foldable','TV','Wearables']) {
  assert(spec.includes(label), `V1.7 specification missing profile requirement: ${label}`);
}
assert(spec.includes('Spatial presentation should remain separately governed'), 'V1.7 specification missing spatial governance boundary');

assert(fs.existsSync(path.join(root, 'IMPLEMENTED-FEATURES.md')), 'IMPLEMENTED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'PLANNED-FEATURES.md')), 'PLANNED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'CHANGELOGS.md')), 'CHANGELOGS.md is required');
assert(!fs.existsSync(path.join(root, 'FEATURE-ROADMAP.md')), 'FEATURE-ROADMAP.md must remain retired');
assert(!fs.existsSync(path.join(root, 'CHANGELOG.md')), 'legacy singular CHANGELOG.md must remain retired');

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.7-form-factor-profiles.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.7.0-dev.3', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.6.0', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify([3]), 'implemented section set mismatch');
assert(JSON.stringify(contract.profiles) === JSON.stringify(profiles), 'profile set mismatch');
assert(JSON.stringify(contract.priorityProfiles) === JSON.stringify(['mobile','tablet']), 'Mobile/Tablet priority mismatch');
assert(JSON.stringify(contract.profileDimensions) === JSON.stringify(dimensions), 'profile dimensions mismatch');
assert(Object.keys(contract.profileDefinitions).length === 6, 'contract must define six first-class profiles');
assert(contract.profileDefinitions.mobile.priority === 'first', 'Mobile must remain first-priority');
assert(contract.profileDefinitions.tablet.priority === 'first', 'Tablet must remain first-priority');
assert(contract.adaptation.widthAloneIsProfileAuthority === false, 'width alone must not become profile authority');
assert(contract.adaptation.deviceBrandBreakpointAuthority === false, 'device-brand breakpoints must not become canonical');
assert(contract.adaptation.semanticMeaningPreservedAcrossProfileChange === true, 'semantic meaning must survive profile transitions');
assert(contract.adaptation.taskContinuityRequired === true, 'Task Continuity must govern profile transitions');
assert(contract.adaptation.accessibilityMayOverrideDensity === true, 'accessibility must be able to override density');
assert(contract.adaptation.accessibilityMayReducePaneCount === true, 'accessibility must be able to reduce pane count');
assert(contract.adaptation.targetSizeMayShrinkToPreservePaneCount === false, 'target size must not shrink to preserve panes');
assert(contract.adaptation.safeAreasOwnedByPlatform === true, 'safe areas must remain platform-owned');
assert(contract.adaptation.hardCodedCutoutInsetsAllowed === false, 'hard-coded cutout insets must be prohibited');
assert(contract.wearableBoundary.governedProfileDefined === true, 'Wearable must have a governed profile');
assert(contract.wearableBoundary.nativeDeviceAcceptanceImplied === false, 'Wearable profile must not imply native-device acceptance');
assert(contract.wearableBoundary.productionSupportImplied === false, 'Wearable profile must not imply production support');
assert(contract.experimentalProfiles.spatial.status === 'experimental', 'Spatial must remain experimental');
assert(contract.experimentalProfiles.spatial.firstClassConsumerEligible === false, 'Spatial must not become first-class consumer eligible');
assert(contract.authority.boundary === 'presentation-only', 'profile system must remain presentation-only');
assert(contract.authority.inputCapabilityCreatedByGlaze === false, 'Glaze must not create input capability');
assert(contract.authority.hardwareCapabilityCreatedByGlaze === false, 'Glaze must not create hardware capability');
assert(contract.authority.safeAreaCreatedByGlaze === false, 'Glaze must not create safe-area truth');
assert(contract.authority.consumerSupportCreatedByGlaze === false, 'Glaze must not manufacture consumer support');
assert(contract.authority.consequentialExecutionAutomatic === false, 'Glaze must not auto-execute consequential actions');

assert(tokens.version === '1.7.0-dev.3', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.6.0', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(Object.keys(tokens.profiles).length === 6, 'token map must expose six profiles');
assert(Object.keys(tokens.dimensions).length === 13, 'token map must expose thirteen profile dimensions');
assert(tokens.priority.mobile === 'first' && tokens.priority.tablet === 'first', 'token map Mobile/Tablet priority mismatch');
assert(tokens.safeAreaPolicy.platformProvidedInsetsRequired === true, 'token map must require platform insets');
assert(tokens.safeAreaPolicy.hardCodedDeviceCutoutInsetsAllowed === false, 'token map must prohibit hard-coded cutouts');
assert(tokens.accessibility.mayReducePaneCount === true, 'token map must allow accessibility pane reduction');
assert(tokens.accessibility.targetSizeMayShrinkToPreservePaneCount === false, 'token map must not shrink targets to preserve panes');
assert(tokens.wearable.nativeDeviceAcceptanceImplied === false, 'token map Wearable must not imply native acceptance');
assert(tokens.spatial.status === 'experimental', 'token map Spatial must remain experimental');
assert(tokens.boundaries.widthAloneIsProfileAuthority === false, 'token map must reject width-only profile authority');
assert(tokens.boundaries.deviceBrandBreakpointAuthority === false, 'token map must reject brand breakpoints');
assert(tokens.boundaries.consumerSupportCreatedByGlaze === false, 'token map must not create consumer support');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

const expected = {
  mobile: {priority:'first', pane:'single-pane', view:'near'},
  tablet: {priority:'first', pane:'dual-pane', view:'near'},
  desktop: {priority:'standard', pane:'multi-pane', view:'near'},
  foldable: {priority:'standard', pane:'dual-pane', view:'near'},
  tv: {priority:'standard', pane:'dual-pane', view:'far'},
  wearable: {priority:'standard', pane:'single-pane', view:'near-glance'}
};

for (const profile of profiles) {
  const resolved = resolveGlazeFormFactorProfile({
    profile,
    posture: profile === 'foldable' ? 'unfolded' : 'unknown',
    availableInputs: [],
    inputCapabilityAuthoritative: false,
    semanticSurfaceId: 'primary-task'
  });
  assert(resolved.profile === profile, `profile resolution failed: ${profile}`);
  assert(resolved.priority === expected[profile].priority, `priority mismatch: ${profile}`);
  assert(resolved.dimensions.length === 13, `dimension count mismatch: ${profile}`);
  assert(resolved.expectations.paneBehavior === expected[profile].pane, `pane behavior mismatch: ${profile}`);
  assert(resolved.expectations.viewingDistance === expected[profile].view, `viewing distance mismatch: ${profile}`);
  assert(resolved.composition.semanticIdentityPreserved === true, `composition identity lost: ${profile}`);
  assert(resolved.composition.accessibilitySemanticsPreserved === true, `accessibility semantics lost: ${profile}`);
  assert(resolved.input.effectiveAvailableInputs.length === 0, `unauthoritative input capability leaked: ${profile}`);
  assert(resolved.input.unknownWhenNotAuthoritative === true, `unauthoritative input state must stay unknown: ${profile}`);
  assert(resolved.supportBoundary.nativeDeviceAcceptanceImplied === false, `native acceptance implied: ${profile}`);
  assert(resolved.supportBoundary.productionSupportImplied === false, `production support implied: ${profile}`);
  assert(resolved.authority.widthAloneIsProfileAuthority === false, `width-only authority leaked: ${profile}`);
  assert(resolved.authority.deviceBrandBreakpointAuthority === false, `brand breakpoint authority leaked: ${profile}`);
  assert(resolved.authority.inputCapabilityCreatedByGlaze === false, `input capability manufactured: ${profile}`);
}

const mobileInputs = resolveGlazeFormFactorProfile({
  profile:'mobile',
  availableInputs:['touch','pointer','keyboard'],
  inputCapabilityAuthoritative:true
});
assert(mobileInputs.input.effectiveAvailableInputs.join(',') === 'touch,keyboard', 'Mobile must only accept authoritative inputs declared by its profile');

const desktopInputs = resolveGlazeFormFactorProfile({
  profile:'desktop',
  availableInputs:['pointer','keyboard','remote-dpad'],
  inputCapabilityAuthoritative:true
});
assert(desktopInputs.input.effectiveAvailableInputs.join(',') === 'pointer,keyboard', 'Desktop must not manufacture undeclared remote/D-pad support');

const largeTextTablet = resolveGlazeFormFactorProfile({
  profile:'tablet',
  accessibilityProfiles:['large-text']
});
assert(largeTextTablet.expectations.density === 'comfortable', 'large text must be able to override Tablet density');
assert(largeTextTablet.expectations.paneBehavior === 'single-pane', 'large text must be able to reduce Tablet pane count');
assert(largeTextTablet.accessibility.targetSizeMayShrinkToPreservePaneCount === false, 'large text must not shrink targets to preserve panes');

const largeTextDesktop = resolveGlazeFormFactorProfile({
  profile:'desktop',
  accessibilityProfiles:['extra-large-text']
});
assert(largeTextDesktop.expectations.paneBehavior === 'dual-pane', 'extra-large text must be able to reduce Desktop pane count');

const touchAssistance = resolveGlazeFormFactorProfile({
  profile:'mobile',
  accessibilityProfiles:['touch-assistance']
});
assert(touchAssistance.expectations.interactionTargets === 'assisted-large', 'Touch Assistance must increase target policy');

const reducedMotion = resolveGlazeFormFactorProfile({
  profile:'tv',
  accessibilityProfiles:['reduced-motion']
});
assert(reducedMotion.expectations.motion === 'reduced', 'Reduced Motion must override TV motion presentation');

const folded = resolveGlazeFormFactorProfile({
  profile:'foldable',
  posture:'folded',
  unsafeRegionIds:['hinge']
});
assert(folded.expectations.paneBehavior === 'single-pane', 'folded posture must use single-pane composition');
assert(folded.safeArea.unsafeRegionIds[0] === 'hinge', 'caller/platform unsafe region must be preserved');
assert(folded.safeArea.hardCodedDeviceCutoutInsetsAllowed === false, 'foldable must not hard-code cutouts');

const unfolded = resolveGlazeFormFactorProfile({
  profile:'foldable',
  posture:'unfolded'
});
assert(unfolded.expectations.paneBehavior === 'dual-pane', 'unfolded posture should permit dual-pane composition');

const wearable = resolveGlazeFormFactorProfile({
  profile:'wearable',
  availableInputs:['touch','rotary'],
  inputCapabilityAuthoritative:true
});
assert(wearable.supportBoundary.wearableGovernedProfileDefined === true, 'Wearable governed profile marker missing');
assert(wearable.supportBoundary.nativeDeviceAcceptanceImplied === false, 'Wearable profile must not claim native-device acceptance');

const previousTaskState = {
  navigationDestination:'memos/detail',
  focusId:'memo-title',
  selectionIds:['memo-42'],
  draftText:'draft survives form-factor transition',
  activeFilters:['work'],
  query:'continuity',
  paneState:'detail',
  workingContext:{provider:'authoritative'}
};
const stateClasses = {
  navigationDestination:'durable',
  focusId:'session-scoped',
  selectionIds:'session-scoped',
  draftText:'recoverable',
  activeFilters:'durable',
  query:'session-scoped',
  paneState:'presentation-only',
  workingContext:'provider-owned'
};

for (const from of profiles) {
  for (const to of profiles) {
    const resolved = resolveGlazeFormFactorTransition({
      from,
      to,
      fromPosture: from === 'foldable' ? 'unfolded' : 'unknown',
      toPosture: to === 'foldable' ? 'unfolded' : 'unknown',
      previousTaskState,
      stateClasses,
      semanticSurfaceId:'memo-detail'
    });
    assert(resolved.transitionKey === `${from}->${to}`, `transition key mismatch: ${from}->${to}`);
    assert(resolved.taskState.navigationDestination === previousTaskState.navigationDestination, `navigation lost: ${from}->${to}`);
    assert(resolved.taskState.focusId === previousTaskState.focusId, `focus lost: ${from}->${to}`);
    assert(resolved.taskState.selectionIds[0] === 'memo-42', `selection lost: ${from}->${to}`);
    assert(resolved.taskState.draftText === previousTaskState.draftText, `draft lost: ${from}->${to}`);
    assert(resolved.taskState.query === previousTaskState.query, `query lost: ${from}->${to}`);
    assert(resolved.taskState.workingContext.provider === 'authoritative', `provider context lost: ${from}->${to}`);
    assert(resolved.continuity.semanticMeaningPreservedAcrossProfileChange === true, `semantic meaning not preserved: ${from}->${to}`);
    assert(resolved.continuity.taskLossAllowed === false, `task loss allowed: ${from}->${to}`);
    assert(resolved.authority.consumerSupportCreatedByGlaze === false, `consumer support manufactured: ${from}->${to}`);
  }
}

let spatialRejected = false;
try { resolveGlazeFormFactorProfile({profile:'spatial'}); } catch { spatialRejected = true; }
assert(spatialRejected, 'Spatial must not resolve through first-class profile path');

const spatial = resolveGlazeExperimentalFormFactorBoundary({profile:'spatial'});
assert(spatial.lifecycle === 'experimental', 'Spatial boundary must remain experimental');
assert(spatial.firstClassConsumerEligible === false, 'Spatial must not be consumer eligible');
assert(spatial.nativePlatformEvidenceRequired === true, 'Spatial must require native-platform evidence');
assert(spatial.accessibilityEvidenceRequired === true, 'Spatial must require accessibility evidence');
assert(spatial.interactionEvidenceRequired === true, 'Spatial must require interaction evidence');
assert(spatial.performanceEvidenceRequired === true, 'Spatial must require performance evidence');
assert(spatial.representativeDeviceEvidenceRequired === true, 'Spatial must require representative-device evidence');

assert(glazeV17FormFactorProfilesDevelopmentContract.version === '1.7.0-dev.3', 'runtime contract version mismatch');
assert(glazeV17FormFactorProfilesDevelopmentContract.lifecycle === 'development', 'runtime contract must remain Development');
assert(glazeV17FormFactorProfilesDevelopmentContract.stableBaseline === '1.6.0', 'runtime Stable baseline mismatch');
assert(glazeV17FormFactorProfilesDevelopmentContract.consumerEligible === false, 'runtime must remain non-consumer-eligible');
assert(glazeV17FormFactorProfilesDevelopmentContract.profiles.length === 6, 'runtime profile count mismatch');
assert(glazeV17FormFactorProfilesDevelopmentContract.profileDimensions.length === 13, 'runtime dimension count mismatch');
assert(glazeV17FormFactorProfilesDevelopmentContract.widthAloneIsProfileAuthority === false, 'runtime must reject width-only authority');
assert(glazeV17FormFactorProfilesDevelopmentContract.wearableNativeDeviceAcceptanceImplied === false, 'runtime Wearable must not imply native acceptance');
assert(glazeV17FormFactorProfilesDevelopmentContract.spatialFirstClassConsumerEligible === false, 'runtime Spatial must remain non-consumer-eligible');

const aggregateVersionParts = String(glazeV17Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.7.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 3,
  'aggregate Development version must retain or advance beyond dev.3'
);
assert(glazeV17Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV17Development.stableBaseline === '1.6.0', 'aggregate Stable baseline mismatch');
assert(glazeV17Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const retainedSection of [1,2,3,4]) {
  assert(
    glazeV17Development.implementedSpecificationSections.includes(retainedSection),
    `aggregate lost Form-Factor Profiles prerequisite section ${retainedSection}`
  );
}
assert(glazeV17Development.taskContinuityFoundation === 'js/glaze-v1.7-task-continuity.dev.mjs', 'aggregate lost Task Continuity');
assert(glazeV17Development.adaptiveInputFoundation === 'js/glaze-v1.7-adaptive-input.dev.mjs', 'aggregate lost Adaptive Input');
assert(glazeV17Development.formFactorProfilesFoundation === 'js/glaze-v1.7-form-factor-profiles.dev.mjs', 'aggregate missing Form-Factor Profiles');

let invalidProfile = false;
try { resolveGlazeFormFactorProfile({profile:'car-dashboard'}); } catch { invalidProfile = true; }
assert(invalidProfile, 'unknown first-class profile must fail closed');

let invalidInput = false;
try { resolveGlazeFormFactorProfile({profile:'mobile', availableInputs:['telepathy'], inputCapabilityAuthoritative:true}); } catch { invalidInput = true; }
assert(invalidInput, 'unknown caller input model must fail closed');

let invalidPosture = false;
try { resolveGlazeFormFactorProfile({profile:'foldable', posture:'banana'}); } catch { invalidPosture = true; }
assert(invalidPosture, 'unknown foldable posture must fail closed');

console.log('GLAZE UI V1.7 First-Class Form-Factor Profiles Development foundation: PASS');
console.log('Implemented section: 3');
console.log('First-class profiles: 6');
console.log('Profile dimensions: 13');
console.log('Profile transition pairs validated: 36');
console.log('Mobile/Tablet priority preserved: true');
console.log('Wearable native acceptance implied: false');
console.log('Spatial first-class consumer eligible: false');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
