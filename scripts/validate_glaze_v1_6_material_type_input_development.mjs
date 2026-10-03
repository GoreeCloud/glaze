#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeMaterialPresentation,
  resolveGlazeTypography,
  resolveGlazeLargeTextResilience,
  resolveGlazeDensity,
  resolveGlazeInputPresentation,
  resolveGlazeTactileIntent,
  glazeV16MaterialTypeInputDevelopmentContract
} from '../js/glaze-v1.6-material-type-input.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.6/material-type-input.dev.json');
const schema = json('schemas/v1.6-material-type-input.schema.json');
const tokens = json('tokens/glaze-v1.6-material-type-input.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_6_PLANNED.md');

const sections = [15,16,17,18,19,20,21,22,23,24,25,26,27,28];
const typographyRoles = [
  'display','hero','page-title','section-heading','subheading','body',
  'secondary-body','label','supporting-label','caption','metadata',
  'numeric-data','code','status','button-text'
];
const largeTextComponents = [
  'navigation','card','toolbar','dialog','form','table','button',
  'media-control','search','notification','settings'
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
assert(contract.$schema === '../../schemas/v1.6-material-type-input.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.6.0-dev.4', 'contract Development version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.5.1', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify(sections), 'implemented section set mismatch');
assert(contract.material.clarityOverridesTranslucency === true, 'clarity must override translucency');
assert(contract.material.blurIsBoundedResource === true, 'blur must be a bounded resource');
assert(contract.material.blurAloneMayProvideContrast === false, 'blur alone must not provide contrast');
assert(contract.typography.semanticHierarchyBeforeRawFontValues === true, 'semantic typography must precede raw font values');
assert(contract.typography.clippingAllowedByDefault === false, 'typography clipping must not be default');
assert(contract.largeTextResilience.targetMayShrinkToPreserveLayout === false, 'targets must not shrink to preserve layout');
assert(contract.density.compactMayReduceBelowSupportedMinimum === false, 'compact density must preserve target minimums');
assert(contract.input.essentialControlMayBeHoverOnly === false, 'essential controls must not be hover-only');
assert(contract.tactile.hardwarePatternHardcodedByGlaze === false, 'Glaze must not hardcode tactile hardware patterns');
assert(contract.tactile.automaticHardwareExecutionByResolver === false, 'resolver must not execute tactile hardware feedback');

assert(tokens.version === '1.6.0-dev.4', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.5.1', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(Object.keys(tokens.typographyRoles).length === 15, 'token map must expose 15 typography roles');
assert(tokens.blurLevels.rawArbitraryValuesAllowed === false, 'arbitrary blur values must be prohibited');
assert(tokens.densityRoles.densityMayReduceBelowTargetFloor === false, 'density token map must protect target floor');
assert(tokens.glazeMotionBoundary == null, 'material/type/input map must not create a competing Glaze Motion lifecycle authority');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

assert(glazeV16MaterialTypeInputDevelopmentContract.version === '1.6.0-dev.4', 'runtime contract version mismatch');
assert(glazeV16MaterialTypeInputDevelopmentContract.lifecycle === 'development', 'runtime contract must remain development');
assert(glazeV16MaterialTypeInputDevelopmentContract.consumerEligible === false, 'runtime contract must remain non-consumer-eligible');
assert(glazeV16MaterialTypeInputDevelopmentContract.accessibilityOverridesRichness === true, 'accessibility must override richness');
assert(glazeV16MaterialTypeInputDevelopmentContract.hoverMayBeSoleEssentialPath === false, 'hover-only essential path must remain prohibited');

const aggregateVersionParts = String(glazeV16Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.6.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 4,
  'aggregate Development version must retain or advance beyond dev.4'
);
assert(glazeV16Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV16Development.stableBaseline === '1.5.1', 'aggregate Stable baseline mismatch');
assert(glazeV16Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const number of sections) {
  assert(glazeV16Development.implementedSpecificationSections.includes(number), `aggregate must retain material/type/input section ${number}`);
}
assert(glazeV16Development.implementedSpecificationSections.includes(1), 'aggregate must retain loading foundation');
assert(glazeV16Development.implementedSpecificationSections.includes(73), 'aggregate must retain focus/motion continuity foundation');

const critical = resolveGlazeMaterialPresentation({
  contentKind: 'critical-warning',
  backgroundComplexity: 'high',
  performanceLevel: 'full',
  backdropSupported: true
});
assert(critical.material.role === 'solid', 'critical warning must use solid material');
assert(critical.material.transparentMaterialProhibited === true, 'critical warning must prohibit transparent material');
assert(critical.material.blurLevel === 'none', 'critical warning must not use blur');

const privacy = resolveGlazeMaterialPresentation({
  contentKind: 'privacy-decision',
  backgroundComplexity: 'low',
  performanceLevel: 'full'
});
assert(privacy.material.role === 'solid', 'privacy decision must prefer solid material');

const complexBackground = resolveGlazeMaterialPresentation({
  contentKind: 'general-content',
  backgroundComplexity: 'high',
  foregroundImportance: 'high',
  performanceLevel: 'full'
});
assert(complexBackground.material.role === 'raised', 'high-complexity background must strengthen material');
assert(complexBackground.readability.clarityOverridesTranslucency === true, 'clarity boundary missing');

const media = resolveGlazeMaterialPresentation({
  contentKind: 'media-control',
  backgroundComplexity: 'low',
  foregroundImportance: 'standard',
  performanceLevel: 'full',
  backdropSupported: true
});
assert(media.material.role === 'clear-glass', 'bounded media control may use clear glass');
assert(media.material.blurLevel === 'low', 'clear glass must use bounded low blur role');

const reducedTransparency = resolveGlazeMaterialPresentation({
  contentKind: 'general-content',
  accessibilityProfiles: ['reduced-transparency'],
  performanceLevel: 'full'
});
assert(reducedTransparency.material.role === 'solid', 'Reduced Transparency must force solid material');

const essential = resolveGlazeMaterialPresentation({
  contentKind: 'general-content',
  performanceLevel: 'essential'
});
assert(essential.material.role === 'solid', 'Essential performance level must use solid material');

const battery = resolveGlazeMaterialPresentation({
  contentKind: 'general-content',
  performanceLevel: 'full',
  batteryPreservation: true
});
assert(battery.material.blurLevel === 'none', 'battery preservation must be able to disable blur');
assert(battery.authority.backgroundContentInspectedByGlaze === false, 'resolver must not inspect raw background content');

for (const role of typographyRoles) {
  const resolved = resolveGlazeTypography({role, environment: 'medium'});
  assert(resolved.role === role, `typography role failed: ${role}`);
  assert(resolved.adaptation.semanticHierarchyPreserved === true, `typography hierarchy not preserved: ${role}`);
  assert(resolved.adaptation.arbitraryFontSizeAllowed === false, `arbitrary font sizes incorrectly allowed: ${role}`);
  assert(resolved.fontPolicy.remoteRuntimeFontDependencyAllowed === false, `remote runtime font dependency allowed: ${role}`);
}

const largeType = resolveGlazeTypography({
  role: 'body',
  environment: 'workspace',
  textScale: 2,
  languageExpansion: 'high',
  density: 'compact',
  availableSpace: 'constrained'
});
assert(largeType.reflow.largeText === true, '200% text scale must be treated as large text');
assert(largeType.reflow.required === true, 'large text must require reflow');
assert(largeType.adaptation.widthCompressionAllowed === false, 'large text must disable width compression');
assert(largeType.reflow.clippingAllowedByDefault === false, 'large text must not clip by default');

const fallbackEnvironment = resolveGlazeTypography({role: 'status', environment: 'spaceship'});
assert(fallbackEnvironment.environment === 'medium', 'unknown typography environment must fail to bounded default');

for (const component of largeTextComponents) {
  const resolved = resolveGlazeLargeTextResilience({component, textScale: 2});
  assert(resolved.largeText === true, `large-text component not recognized: ${component}`);
  assert(resolved.behavior.wrapOrReflowRequired === true, `reflow not required: ${component}`);
  assert(resolved.behavior.targetSizeMayShrinkToPreserveLayout === false, `target shrink incorrectly allowed: ${component}`);
  assert(resolved.behavior.focusOrderPreserved === true, `focus order not preserved: ${component}`);
}

const compactPointer = resolveGlazeDensity({mode: 'compact', inputMode: 'pointer'});
assert(compactPointer.acceptedMode === 'compact', 'compact pointer density should remain compact');
assert(compactPointer.targetProtection.targetFloorRole === 'pointer-compact-minimum', 'pointer compact target role mismatch');
assert(compactPointer.targetProtection.compactMayReduceBelowSupportedMinimum === false, 'compact density lowered minimum target');

const compactTouch = resolveGlazeDensity({mode: 'compact', inputMode: 'touch'});
assert(compactTouch.targetProtection.targetFloorRole === 'coarse-minimum', 'touch compact density must retain coarse target floor');

const compactLargeText = resolveGlazeDensity({
  mode: 'compact',
  inputMode: 'pointer',
  accessibilityProfiles: ['large-text']
});
assert(compactLargeText.acceptedMode === 'standard', 'large text must be able to override compact density');
assert(compactLargeText.accessibility.compactRejectedForLargeText === true, 'large-text density override must be observable');

const pointer = resolveGlazeInputPresentation({
  mode: 'pointer',
  previousMode: 'keyboard',
  hoverIntents: ['interactivity', 'preview']
});
assert(pointer.modeChanged === true, 'input-mode transition must be observable');
assert(pointer.composition.dramaticRearrangementAllowedForInputChangeAlone === false, 'input change alone must not dramatically rearrange');
assert(pointer.hover.available === true, 'pointer hover should be available');
assert(pointer.hover.enhancementOnly === true, 'hover must remain enhancement only');
assert(pointer.hover.essentialControlMayBeHoverOnly === false, 'essential controls must not be hover-only');
assert(pointer.composition.taskContinuityRequired === true, 'input changes must preserve task continuity');

const touch = resolveGlazeInputPresentation({
  mode: 'touch',
  hoverIntents: ['interactivity', 'supplemental-information']
});
assert(touch.hover.available === false, 'touch must not require hover');
assert(touch.hover.equivalentNonHoverPathRequired === true, 'hover intent must require non-hover equivalent');
assert(touch.press.immediateFeedbackRequired === true, 'touch press feedback must be immediate');

const reducedMotionPress = resolveGlazeInputPresentation({
  mode: 'touch',
  accessibilityProfiles: ['reduced-motion']
});
assert(reducedMotionPress.accessibility.reducedMotionApplied === true, 'Reduced Motion press profile not applied');
assert(!reducedMotionPress.press.recommendedFeedback.includes('scale'), 'Reduced Motion press feedback must avoid scale');

const tactileEligible = resolveGlazeTactileIntent({
  intent: 'selection',
  platformSupported: true,
  userEnabled: true
});
assert(tactileEligible.eligible === true, 'supported enabled tactile intent should be eligible');
assert(tactileEligible.mapping.hardwarePatternHardcodedByGlaze === false, 'Glaze must not hardcode hardware pattern');
assert(tactileEligible.execution.automaticHardwareExecutionByResolver === false, 'resolver must not execute hardware feedback');
assert(tactileEligible.accessibility.tactileFeedbackRequiredForMeaning === false, 'tactile feedback must not be required for meaning');

const tactileUnavailable = resolveGlazeTactileIntent({
  intent: 'warning',
  platformSupported: false
});
assert(tactileUnavailable.eligible === false, 'unsupported tactile capability must not be presented as eligible');

let invalidTypeRoleRejected = false;
try {
  resolveGlazeTypography({role: 'tiny-random-text'});
} catch {
  invalidTypeRoleRejected = true;
}
assert(invalidTypeRoleRejected, 'unknown typography role must fail closed');

let invalidDensityRejected = false;
try {
  resolveGlazeDensity({mode: 'microscopic'});
} catch {
  invalidDensityRejected = true;
}
assert(invalidDensityRejected, 'unknown density mode must fail closed');

let invalidInputRejected = false;
try {
  resolveGlazeInputPresentation({mode: 'brainwave'});
} catch {
  invalidInputRejected = true;
}
assert(invalidInputRejected, 'unknown input mode must fail closed');

let invalidTactileRejected = false;
try {
  resolveGlazeTactileIntent({intent: 'buzz-randomly'});
} catch {
  invalidTactileRejected = true;
}
assert(invalidTactileRejected, 'unknown tactile intent must fail closed');

console.log('GLAZE UI V1.6 material/type/input Development foundation: PASS');
console.log('Material roles: 6');
console.log('Typography roles: 15');
console.log('Density modes: 3');
console.log('Input modes: 8');
console.log('Tactile intents: 7');
console.log('Implemented sections: 15-28');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
