#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeSearchPresentation,
  resolveGlazeNavigationContinuity,
  resolveGlazeResponsiveLayout,
  resolveGlazePaneTransition,
  resolveGlazePosturePresentation,
  resolveGlazeLocalizationPresentation,
  resolveGlazeIconPresentation,
  resolveGlazeStatusIndicator,
  resolveGlazeBadgePresentation,
  resolveGlazeSourceProvenance,
  resolveGlazePrivacyPresentation,
  resolveGlazeSecurityPresentation,
  resolveGlazeCapabilityControl,
  glazeV16NavigationStatusDevelopmentContract
} from '../js/glaze-v1.6-navigation-status.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.6/navigation-status.dev.json');
const schema = json('schemas/v1.6-navigation-status.schema.json');
const tokens = json('tokens/glaze-v1.6-navigation-status.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_6_PLANNED.md');

const sections = [41,42,43,44,45,46,47,48,49,50,51,52,53,54];
const searchPhases = [
  'initial','typing','suggestions','loading','partial-results','results',
  'no-results','offline-results','filters','history','error'
];
const environments = [
  'compact','medium','expanded','large-screen',
  'workspace','far-view','wearable','spatial'
];
const paneStates = ['single-pane','dual-pane','multi-pane','overlay-pane'];
const postures = [
  'folded','unfolded','tabletop','portrait','landscape',
  'external-display','resized-window','flat','unknown'
];
const statusStates = [
  'online','offline','local','remote','syncing','synced','unsynced',
  'protected','restricted','shared','private','updating','error','unverified'
];
const capabilityStates = [
  'available','unavailable','unsupported','restricted',
  'permission-required','temporarily-unavailable','unknown'
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
assert(contract.$schema === '../../schemas/v1.6-navigation-status.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.6.0-dev.6', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.5.1', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify(sections), 'implemented section set mismatch');
assert(contract.search.providerArrivalMayReorderExistingResults === false, 'search providers must not arbitrarily reorder existing results');
assert(contract.search.providerPrecedenceInferred === false, 'search provider precedence must not be inferred');
assert(contract.navigation.transientRuntimeChangesMayContinuouslyReorderPrimaryDestinations === false, 'primary navigation must remain stable');
assert(contract.responsive.widthAloneIsAuthority === false, 'responsive composition must not be width-only');
assert(contract.responsive.deviceBrandBreakpointAuthority === false, 'device-brand breakpoints must not be canonical');
assert(contract.paneContinuity.deterministicTransitionsRequired === true, 'pane transitions must be deterministic');
assert(contract.posture.hardCodedDeviceGeometryAllowed === false, 'hard-coded hinge geometry must be prohibited');
assert(contract.localization.englishLengthAssumptionsAllowed === false, 'English-length assumptions must be prohibited');
assert(contract.iconography.labelRequiredWhenMeaningUnclear === true, 'unclear icons must require labels');
assert(contract.statusIndicators.nonColorMeaningRequired === true, 'status indicators must have non-color meaning');
assert(contract.statusIndicators.unknownOrUnverifiedMayUpgradeToPositive === false, 'unverified state must not upgrade to positive');
assert(contract.badges.secondaryToPrimaryContent === true, 'badges must remain secondary');
assert(contract.provenance.ownershipImplied === false, 'provenance must not imply ownership');
assert(contract.provenance.authorizationImplied === false, 'provenance must not imply authorization');
assert(contract.privacy.stateCreatedByGlaze === false, 'Glaze must not create privacy state');
assert(contract.security.stateInferredByGlaze === false, 'Glaze must not infer security state');
assert(contract.capabilities.permissionRequestAutomatic === false, 'capability presentation must not auto-request permission');
assert(contract.authority.consequentialExecutionAutomatic === false, 'presentation resolver must not execute consequential actions');

assert(tokens.version === '1.6.0-dev.6', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.5.1', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(Object.keys(tokens.searchPhases).length === 11, 'token map must expose eleven search phases');
assert(tokens.navigation.transientCapabilityReorderingAllowed === false, 'token map must protect navigation stability');
assert(tokens.responsive.widthAloneIsAuthority === false, 'token map must reject width-only responsiveness');
assert(tokens.postureRoles.hardCodedHingeGeometryAllowed === false, 'token map must reject hard-coded hinge geometry');
assert(tokens.localization.englishLengthAssumptionsAllowed === false, 'token map must reject English-length assumptions');
assert(tokens.iconPresentation.colorOnlyMeaningAllowed === false, 'icon meaning must not rely on color alone');
assert(tokens.statusRoles.unverified === 'status.unverified', 'token map must expose unverified status');
assert(tokens.statusRoles.unknownOrUnverifiedMayUpgradeToPositive === false, 'unverified status must fail closed');
assert(tokens.badgeCategories.maxVisibleCompact === 1, 'compact badge budget mismatch');
assert(tokens.sourceRoles.ownershipImplied === false, 'source map must not imply ownership');
assert(tokens.privacyRoles.stateCreatedByGlaze === false, 'privacy map must not create state');
assert(tokens.securityRoles.stateInferredByGlaze === false, 'security map must not infer state');
assert(tokens.capabilityRoles.permissionRequestAutomatic === false, 'capability map must not auto-request permission');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

assert(glazeV16NavigationStatusDevelopmentContract.version === '1.6.0-dev.6', 'runtime contract version mismatch');
assert(glazeV16NavigationStatusDevelopmentContract.lifecycle === 'development', 'runtime contract must remain development');
assert(glazeV16NavigationStatusDevelopmentContract.consumerEligible === false, 'runtime contract must remain non-consumer-eligible');
assert(glazeV16NavigationStatusDevelopmentContract.widthAloneIsResponsiveAuthority === false, 'runtime must reject width-only responsiveness');
assert(glazeV16NavigationStatusDevelopmentContract.primaryNavigationMayContinuouslyReorderFromTransientState === false, 'runtime must protect primary navigation stability');
assert(glazeV16NavigationStatusDevelopmentContract.privacyTruthCreatedByGlaze === false, 'runtime must not create privacy truth');
assert(glazeV16NavigationStatusDevelopmentContract.securityTruthCreatedByGlaze === false, 'runtime must not create security truth');
assert(glazeV16NavigationStatusDevelopmentContract.capabilityTruthCreatedByGlaze === false, 'runtime must not create capability truth');

const aggregateVersionParts = String(glazeV16Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.6.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 6,
  'aggregate Development version must retain or advance beyond dev.6'
);
assert(glazeV16Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV16Development.stableBaseline === '1.5.1', 'aggregate Stable baseline mismatch');
assert(glazeV16Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const number of sections) {
  assert(glazeV16Development.implementedSpecificationSections.includes(number), `aggregate must retain navigation/status section ${number}`);
}
for (const retained of [1,6,10,15,29,55,71,73]) {
  assert(glazeV16Development.implementedSpecificationSections.includes(retained), `aggregate lost prior section ${retained}`);
}

for (const phase of searchPhases) {
  const resolved = resolveGlazeSearchPresentation({
    phase,
    previousResultIds:['a','b'],
    incomingResultIds:['b','c'],
    pendingProviders: phase === 'partial-results' ? ['remote'] : []
  });
  assert(resolved.phase === phase, `search phase failed: ${phase}`);
  assert(resolved.resultContinuity.providerArrivalMayReorderExistingResults === false, `search reorder allowed: ${phase}`);
  assert(resolved.authority.providerPrecedenceInferred === false, `search provider precedence inferred: ${phase}`);
}

const partialSearch = resolveGlazeSearchPresentation({
  phase:'partial-results',
  previousResultIds:['a','b'],
  incomingResultIds:['b','c'],
  pendingProviders:['remote']
});
assert(JSON.stringify(partialSearch.resultContinuity.stableResultIds) === JSON.stringify(['a','b','c']), 'partial search must retain usable existing results and append new results');

const finalSearch = resolveGlazeSearchPresentation({
  phase:'results',
  previousResultIds:['a','b','c'],
  incomingResultIds:['c','b','d']
});
assert(JSON.stringify(finalSearch.resultContinuity.stableResultIds) === JSON.stringify(['b','c','d']), 'final search must preserve surviving prior relative order then append new results');
assert(finalSearch.authority.rankingInventedByGlaze === false, 'Glaze must not invent search ranking');

const navigation = resolveGlazeNavigationContinuity({
  previous:{
    scrollPositionKey:'scroll-20',
    selectedId:'item-2',
    expandedIds:['group-a'],
    activeFilters:['unread'],
    query:'cloud',
    paneState:'dual-pane'
  },
  next:{paneState:'multi-pane'},
  validSelectedIds:['item-2','item-3'],
  capabilityState:'degraded',
  primaryDestinations:['home','search','settings'],
  requestedPrimaryDestinations:['search','home','settings','admin']
});
assert(navigation.context.selectedId === 'item-2', 'navigation must preserve valid selection');
assert(navigation.context.scrollPositionKey === 'scroll-20', 'navigation must preserve scroll context');
assert(navigation.context.query === 'cloud', 'navigation must preserve query');
assert(navigation.context.paneState === 'multi-pane', 'navigation may accept requested pane transformation');
assert(JSON.stringify(navigation.primaryNavigation.destinations) === JSON.stringify(['home','search','settings','admin']), 'primary navigation must preserve stable order and append new destinations');
assert(navigation.primaryNavigation.continuousReorderingFromTransientRuntimeChangesAllowed === false, 'primary navigation churn must be prohibited');
assert(navigation.authority.navigationExecutedByGlaze === false, 'Glaze must not execute navigation');

for (const environment of environments) {
  const resolved = resolveGlazeResponsiveLayout({
    environment,
    viewingDistance: environment === 'far-view' ? 'far' : 'near',
    inputMode: environment === 'far-view' ? 'directional' : 'pointer',
    posture:'flat',
    contentDensity:'standard',
    task:'general'
  });
  assert(resolved.environment === environment, `responsive environment failed: ${environment}`);
  assert(resolved.rules.widthAloneIsAuthority === false, `width-only authority leaked: ${environment}`);
  assert(resolved.continuity.currentLocationPreserved === true, `location continuity missing: ${environment}`);
}

const workspace = resolveGlazeResponsiveLayout({
  environment:'workspace',
  task:'editing',
  posture:'flat'
});
assert(workspace.composition === 'multi-pane', 'workspace editing should use task-valued multi-pane composition');

const largeTextWorkspace = resolveGlazeResponsiveLayout({
  environment:'workspace',
  task:'editing',
  posture:'flat',
  accessibilityProfiles:['large-text']
});
assert(largeTextWorkspace.composition === 'dual-pane', 'large text must be able to reduce pane count');
assert(largeTextWorkspace.rules.targetSizeMayShrinkToPreservePaneCount === false, 'target size must not shrink to preserve pane count');

for (const from of paneStates) {
  for (const to of paneStates) {
    const resolved = resolveGlazePaneTransition({
      from,
      to,
      selectedId:'item-7',
      selectionStillValid:true,
      paneHistory:['primary','secondary'],
      queryState:'test',
      filters:['recent'],
      scrollContextKey:'scroll-key'
    });
    assert(resolved.transitionKey === `${from}->${to}`, `pane transition key mismatch: ${from}->${to}`);
    assert(resolved.preserved.selectionPreserved === true, `pane selection lost: ${from}->${to}`);
    assert(resolved.determinism.sameInputsProduceSameTransition === true, `pane transition non-deterministic: ${from}->${to}`);
  }
}

for (const posture of postures) {
  const resolved = resolveGlazePosturePresentation({
    posture,
    unsafeRegionIds: posture === 'tabletop' ? ['hinge-1'] : []
  });
  assert(resolved.posture === posture, `posture failed: ${posture}`);
  assert(resolved.unsafeRegions.hardCodedDeviceGeometryAllowed === false, `hard-coded geometry allowed: ${posture}`);
  assert(resolved.unsafeRegions.criticalControlsMayCrossUnsafeRegions === false, `critical controls may cross unsafe regions: ${posture}`);
  assert(resolved.authority.deviceModelInferred === false, `device model inferred: ${posture}`);
}

const rtl = resolveGlazeLocalizationPresentation({
  direction:'rtl',
  textExpansion:'high',
  directionalIcon:true
});
assert(rtl.layout.logicalPropertiesRequired === true, 'RTL must use logical properties');
assert(rtl.layout.englishLengthAssumptionsAllowed === false, 'RTL must not assume English lengths');
assert(rtl.layout.highExpansionRequiresReflow === true, 'high localization expansion must require reflow');
assert(rtl.iconography.directionalMirroringRequiredWhenMeaningReverses === true, 'directional RTL icon must mirror when semantic direction reverses');
assert(rtl.formatting.applicationOrPlatformFormatterOwnsLocaleFormatting === true, 'locale formatting must be application/platform owned');

const mixed = resolveGlazeLocalizationPresentation({direction:'mixed'});
assert(mixed.layout.mixedDirectionIsolationRequired === true, 'mixed-direction text must require isolation');

const unclearIcon = resolveGlazeIconPresentation({
  state:'active',
  semanticMeaning:'advanced synchronization mode',
  meaningClearWithoutLabel:false,
  interactive:true,
  directional:false
});
assert(unclearIcon.presentation.labelRequired === true, 'unclear icon must require label');
assert(unclearIcon.presentation.accessibleNameRequired === true, 'interactive icon must require accessible name');
assert(unclearIcon.identity.colorAloneCreatesMeaning === false, 'icon meaning must not rely on color');

const rtlIcon = resolveGlazeIconPresentation({
  state:'selected',
  semanticMeaning:'next',
  meaningClearWithoutLabel:true,
  interactive:true,
  directional:true,
  direction:'rtl'
});
assert(rtlIcon.presentation.mirrorForRTLWhenMeaningReverses === true, 'directional icon RTL mirroring missing');

for (const state of statusStates) {
  const resolved = resolveGlazeStatusIndicator({
    state,
    authoritative: state !== 'unverified'
  });
  assert(resolved.acceptedState === state, `authoritative status failed: ${state}`);
  assert(resolved.presentation.colorOnlyMeaningAllowed === false, `color-only status meaning allowed: ${state}`);
  assert(resolved.presentation.standardizedAcrossApplications === true, `status not standardized: ${state}`);
}

const unverifiedProtected = resolveGlazeStatusIndicator({
  state:'protected',
  authoritative:false
});
assert(unverifiedProtected.acceptedState === 'unverified', 'unverified protected claim must fail closed');
assert(unverifiedProtected.semanticRole === 'status.unverified', 'unverified protected semantic role mismatch');
assert(unverifiedProtected.evidence.requestedStateWithheldWithoutAuthority === true, 'withheld unverified status must be observable');
assert(unverifiedProtected.authority.securityTruthCreatedByGlaze === false, 'Glaze must not create security truth');

const compactBadges = resolveGlazeBadgePresentation({
  category:'warning',
  compact:true,
  visibleBadgeCount:3
});
assert(compactBadges.presentation.maxVisibleCompact === 1, 'compact badge budget mismatch');
assert(compactBadges.presentation.overflowTreatment === 'compound-or-expanded-labeled-status', 'badge overflow treatment mismatch');
assert(compactBadges.presentation.excessiveStackingAllowed === false, 'excessive badge stacking must be prohibited');

const countBadge = resolveGlazeBadgePresentation({category:'count',count:7});
assert(countBadge.count === 7, 'count badge truth mismatch');

for (const source of ['local','goreecloud-service','remote','cached','synchronized','imported','unknown']) {
  const resolved = resolveGlazeSourceProvenance({source,authoritative:true});
  assert(resolved.source === source, `source provenance failed: ${source}`);
  assert(resolved.presentation.ownershipImplied === false, `source implied ownership: ${source}`);
  assert(resolved.presentation.authorizationImplied === false, `source implied authorization: ${source}`);
}

const hiddenProvider = resolveGlazeSourceProvenance({
  source:'remote',
  authoritative:true,
  providerLabel:'Private Backend A',
  exposeProviderLabel:false
});
assert(hiddenProvider.presentation.providerLabel === null, 'provider label must remain minimized by default');

const exposedProvider = resolveGlazeSourceProvenance({
  source:'goreecloud-service',
  authoritative:true,
  providerLabel:'GoreeCloud Drive',
  exposeProviderLabel:true
});
assert(exposedProvider.presentation.providerLabel === 'GoreeCloud Drive', 'explicit authoritative provider label should be present');

for (const state of ['private','shared','restricted','permission-required','consent-required','local-only','protected','retention-limited','unknown']) {
  const resolved = resolveGlazePrivacyPresentation({
    state,
    authoritative: state !== 'unknown'
  });
  assert(resolved.acceptedState === state, `privacy state failed: ${state}`);
  assert(resolved.authority.privacyStateCreatedByGlaze === false, `Glaze created privacy state: ${state}`);
  assert(resolved.presentation.nonColorIndicatorRequired === true, `privacy state missing non-color indicator: ${state}`);
}

const unverifiedPrivate = resolveGlazePrivacyPresentation({
  state:'private',
  authoritative:false
});
assert(unverifiedPrivate.acceptedState === 'unknown', 'unverified private state must fail closed');
assert(unverifiedPrivate.authority.permissionGrantedByGlaze === false, 'Glaze must not grant privacy permission');

for (const state of ['protected','restricted','warning','critical','unverified','unknown']) {
  const resolved = resolveGlazeSecurityPresentation({
    state,
    authoritative: !['unverified','unknown'].includes(state)
  });
  assert(resolved.acceptedState === state, `security state failed: ${state}`);
  assert(resolved.presentation.distinguishFromOrdinaryWarning === true, `security state not distinguished: ${state}`);
  assert(resolved.authority.securityStateInferredByGlaze === false, `Glaze inferred security state: ${state}`);
}

const unverifiedSecurity = resolveGlazeSecurityPresentation({
  state:'protected',
  authoritative:false
});
assert(unverifiedSecurity.acceptedState === 'unverified', 'unverified security protection must fail closed');

for (const state of capabilityStates) {
  const resolved = resolveGlazeCapabilityControl({
    state,
    essential:true,
    explanationAvailable:true
  });
  assert(resolved.state === state, `capability state failed: ${state}`);
  assert(resolved.control.visible === true, `essential capability hidden: ${state}`);
  assert(resolved.control.enabled === (state === 'available'), `capability enabled mismatch: ${state}`);
  assert(resolved.control.permissionRequestAutomatic === false, `permission auto-requested: ${state}`);
  assert(resolved.authority.capabilityTruthOwnedByCallerOrProvider === true, `capability truth ownership missing: ${state}`);
}

const permission = resolveGlazeCapabilityControl({
  state:'permission-required',
  essential:true
});
assert(permission.basePresentation.permissionRequestedAutomatically === false, 'base capability presentation must not auto-request permission');
assert(permission.control.explainUnavailableWhereUseful === true, 'permission-required control should explain unavailability');

const optionalUnsupported = resolveGlazeCapabilityControl({
  state:'unsupported',
  essential:false
});
assert(optionalUnsupported.control.unsupportedMayBeHiddenOnlyWhenNonessentialAndCallerChooses === true, 'nonessential unsupported capability hide boundary mismatch');

let invalidSearch=false;
try { resolveGlazeSearchPresentation({phase:'telepathy'}); } catch { invalidSearch=true; }
assert(invalidSearch, 'unknown search phase must fail closed');

let invalidNavigation=false;
try { resolveGlazeNavigationContinuity({capabilityState:'maybe'}); } catch { invalidNavigation=true; }
assert(invalidNavigation, 'unknown navigation capability state must fail closed');

let invalidPane=false;
try { resolveGlazePaneTransition({from:'twelve-panes',to:'single-pane'}); } catch { invalidPane=true; }
assert(invalidPane, 'unknown pane state must fail closed');

let invalidDirection=false;
try { resolveGlazeLocalizationPresentation({direction:'diagonal'}); } catch { invalidDirection=true; }
assert(invalidDirection, 'unknown text direction must fail closed');

let invalidStatus=false;
try { resolveGlazeStatusIndicator({state:'magical'}); } catch { invalidStatus=true; }
assert(invalidStatus, 'unknown status state must fail closed');

let invalidPrivacy=false;
try { resolveGlazePrivacyPresentation({state:'super-private'}); } catch { invalidPrivacy=true; }
assert(invalidPrivacy, 'unknown privacy state must fail closed');

let invalidSecurity=false;
try { resolveGlazeSecurityPresentation({state:'probably-safe'}); } catch { invalidSecurity=true; }
assert(invalidSecurity, 'unknown security state must fail closed');

let invalidCapability=false;
try { resolveGlazeCapabilityControl({state:'coming-soon-maybe'}); } catch { invalidCapability=true; }
assert(invalidCapability, 'unknown capability state must fail closed');

console.log('GLAZE UI V1.6 navigation/status Development foundation: PASS');
console.log('Search phases: 11');
console.log('Responsive environments: 8');
console.log('Pane states: 4');
console.log('Posture states: 9');
console.log('Status states: 14');
console.log('Capability states: 7');
console.log('Implemented sections: 41-54');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
