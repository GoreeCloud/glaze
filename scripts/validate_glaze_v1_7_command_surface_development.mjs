#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeCommandItem,
  resolveGlzCommandSurface,
  glazeV17CommandSurfaceDevelopmentContract
} from '../js/glaze-v1.7-command-surface.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.7/command-surface.dev.json');
const schema = json('schemas/v1.7-command-surface.schema.json');
const tokens = json('tokens/glaze-v1.7-command-surface.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_7_PLANNED.md');

const concepts = [
  'universal-search',
  'application-search',
  'command',
  'action',
  'contextual-action',
  'navigation-shortcut'
];
const providerScopes = ['universal','application','contextual','navigation','system','unknown'];
const sourceKinds = ['local','goreecloud-service','remote','cached','synchronized','imported','unknown'];
const phases = [
  'closed','initial','typing','suggestions','loading','partial-results',
  'results','no-results','filters','history','error'
];
const presentations = {
  mobile:'reachable-sheet',
  tablet:'expanded-search-command-pane',
  desktop:'keyboard-first-command-palette',
  foldable:'posture-aware-command-pane',
  tv:'directional-command-panel',
  wearable:'glanceable-command-list'
};
const representativeInputs = {
  mobile:'touch',
  tablet:'touch',
  desktop:'keyboard',
  foldable:'touch',
  tv:'remote-dpad',
  wearable:'rotary'
};

assert(stable === '1.7.0', 'V1.7 dev.4 must coexist with bounded Glaze V1.7 / 1.7.0 as current Stable');
assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
assert(lifecycle.activeCandidate === null, 'V1.7 dev.4 must not create an active Candidate');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.7 dev.4 must not create a patch RC');
assert(lifecycle.plannedNext==='1.7.1', 'V1.7 dev.4 must not mutate lifecycle plannedNext');

assert(spec.includes('## 5. Glaze Command Surface'), 'V1.7 specification missing Glaze Command Surface section');
for (const phrase of [
  'Universal Search',
  'Application search',
  'Commands',
  'Actions',
  'Contextual actions',
  'Navigation shortcuts',
  'Keyboard command palettes',
  'Touch search',
  'Remote-friendly command selection'
]) {
  assert(spec.includes(phrase), `V1.7 v1.2 specification missing command-surface requirement: ${phrase}`);
}
assert(spec.includes('Search scope, source, availability, provenance, and authority must remain explicit.'), 'V1.7 v1.2 command authority sentence missing');

assert(fs.existsSync(path.join(root, 'IMPLEMENTED-FEATURES.md')), 'IMPLEMENTED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'PLANNED-FEATURES.md')), 'PLANNED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'CHANGELOGS.md')), 'CHANGELOGS.md is required');
assert(!fs.existsSync(path.join(root, 'FEATURE-ROADMAP.md')), 'FEATURE-ROADMAP.md must remain retired');
assert(!fs.existsSync(path.join(root, 'CHANGELOG.md')), 'legacy singular CHANGELOG.md must remain retired');

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.7-command-surface.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.7.0-dev.4', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.6.0', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify([5]), 'implemented section set mismatch');
assert(contract.component === 'GlzCommandSurface', 'contract component mismatch');
assert(JSON.stringify(contract.interactionConcepts) === JSON.stringify(concepts), 'interaction concept set mismatch');
assert(JSON.stringify(contract.providerScopes) === JSON.stringify(providerScopes), 'provider scope set mismatch');
assert(JSON.stringify(contract.sourceKinds) === JSON.stringify(sourceKinds), 'source kind set mismatch');
assert(JSON.stringify(contract.surfacePhases) === JSON.stringify(phases), 'surface phase set mismatch');
assert(JSON.stringify(contract.presentationMappings) === JSON.stringify(presentations), 'presentation mapping mismatch');
assert(contract.semanticIdentity.oneCommandConceptAcrossProfiles === true, 'command concept must be unified across profiles');
assert(contract.semanticIdentity.oneCommandConceptAcrossInputModels === true, 'command concept must be unified across input models');
assert(contract.semanticIdentity.commandIdentityMayChangeFromPresentationAlone === false, 'presentation must not change command identity');
assert(contract.continuity.queryPreserved === true, 'query continuity required');
assert(contract.continuity.filtersPreserved === true, 'filter continuity required');
assert(contract.continuity.selectionPreservedWhenValid === true, 'selection continuity required');
assert(contract.continuity.focusPreserved === true, 'focus continuity required');
assert(contract.continuity.navigationContextPreserved === true, 'navigation continuity required');
assert(contract.continuity.providerScopePreserved === true, 'provider-scope continuity required');
assert(contract.continuity.sourceIdentityPreserved === true, 'source-identity continuity required');
assert(contract.continuity.presentationChangeMayResetTask === false, 'presentation change must not reset task');
assert(contract.ordering.providerArrivalMayArbitrarilyReorderExistingItems === false, 'provider arrival must not arbitrarily reorder items');
assert(contract.ordering.providerPrecedenceInferredByGlaze === false, 'provider precedence must not be inferred');
assert(contract.ordering.rankingInventedByGlaze === false, 'ranking must not be invented');
assert(contract.authority.boundary === 'presentation-only', 'Command Surface must remain presentation-only');
assert(contract.authority.providerScopeInferredByGlaze === false, 'Glaze must not infer provider scope');
assert(contract.authority.sourceIdentityInferredByGlaze === false, 'Glaze must not infer source identity');
assert(contract.authority.capabilityCreatedByGlaze === false, 'Glaze must not create capability');
assert(contract.authority.authorizationGrantedByGlaze === false, 'Glaze must not grant authorization');
assert(contract.authority.permissionGrantedByGlaze === false, 'Glaze must not grant permission');
assert(contract.authority.consentGrantedByGlaze === false, 'Glaze must not grant consent');
assert(contract.authority.navigationExecutedByGlaze === false, 'Glaze must not execute navigation');
assert(contract.authority.commandExecutionAutomatic === false, 'Glaze must not auto-execute commands');
assert(contract.authority.consequentialExecutionAutomatic === false, 'Glaze must not auto-execute consequential actions');

assert(tokens.version === '1.7.0-dev.4', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.6.0', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(tokens.component.GlzCommandSurface === 'component.command-surface', 'token map missing GlzCommandSurface');
assert(Object.keys(tokens.interactionConcepts).length === 6, 'token map must expose six interaction concepts');
assert(Object.keys(tokens.providerScopes).length === 6, 'token map must expose six provider scopes');
assert(Object.keys(tokens.sourceKinds).length === 7, 'token map must expose seven source kinds');
assert(Object.keys(tokens.surfacePhases).length === 11, 'token map must expose eleven surface phases');
assert(Object.keys(tokens.presentations).length === 6, 'token map must expose six profile presentations');
assert(tokens.continuity.presentationChangeMayResetTask === false, 'token map must prohibit task reset');
assert(tokens.ordering.providerPrecedenceInferredByGlaze === false, 'token map must reject inferred provider precedence');
assert(tokens.ordering.rankingInventedByGlaze === false, 'token map must reject invented ranking');
assert(tokens.boundaries.providerScopeRequiresAuthority === true, 'token map must require provider-scope authority');
assert(tokens.boundaries.sourceIdentityRequiresAuthority === true, 'token map must require source-identity authority');
assert(tokens.boundaries.availabilityRequiresAuthority === true, 'token map must require availability authority');
assert(tokens.boundaries.commandExecutionAutomatic === false, 'token map must prohibit automatic execution');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

for (const concept of concepts) {
  const item = resolveGlazeCommandItem({
    commandId:`item-${concept}`,
    concept,
    providerScope:'application',
    providerScopeAuthoritative:true,
    sourceKind:'local',
    sourceIdentityAuthoritative:true,
    sourceId:'local-app',
    availabilityState:'available',
    availabilityAuthoritative:true
  });
  assert(item.concept === concept, `command concept failed: ${concept}`);
  assert(item.provider.acceptedScope === 'application', `provider scope failed: ${concept}`);
  assert(item.source.acceptedKind === 'local', `source kind failed: ${concept}`);
  assert(item.presentation.authorityComplete === true, `authority should be complete: ${concept}`);
  assert(item.presentation.executablePresentationEnabled === true, `authoritative available item should be enabled: ${concept}`);
  assert(item.authority.commandExecutionAutomatic === false, `command auto-execution leaked: ${concept}`);
}

const unverifiedScope = resolveGlazeCommandItem({
  commandId:'scope-unverified',
  concept:'action',
  providerScope:'application',
  providerScopeAuthoritative:false,
  sourceKind:'local',
  sourceIdentityAuthoritative:true,
  availabilityState:'available',
  availabilityAuthoritative:true
});
assert(unverifiedScope.provider.acceptedScope === 'unknown', 'unverified provider scope must fail closed to unknown');
assert(unverifiedScope.provider.requestedScopeWithheldWithoutAuthority === true, 'withheld provider scope must be observable');
assert(unverifiedScope.presentation.authorityComplete === false, 'unverified provider scope must block authority-complete presentation');
assert(unverifiedScope.presentation.executablePresentationEnabled === false, 'unverified provider scope must disable executable presentation');

const unverifiedSource = resolveGlazeCommandItem({
  commandId:'source-unverified',
  concept:'action',
  providerScope:'application',
  providerScopeAuthoritative:true,
  sourceKind:'remote',
  sourceIdentityAuthoritative:false,
  sourceId:'remote-provider',
  availabilityState:'available',
  availabilityAuthoritative:true
});
assert(unverifiedSource.source.acceptedKind === 'unknown', 'unverified source kind must fail closed to unknown');
assert(unverifiedSource.source.acceptedSourceId === null, 'unverified source id must be withheld');
assert(unverifiedSource.source.requestedIdentityWithheldWithoutAuthority === true, 'withheld source identity must be observable');
assert(unverifiedSource.presentation.executablePresentationEnabled === false, 'unverified source identity must disable executable presentation');

const unverifiedAvailability = resolveGlazeCommandItem({
  commandId:'availability-unverified',
  concept:'action',
  providerScope:'application',
  providerScopeAuthoritative:true,
  sourceKind:'local',
  sourceIdentityAuthoritative:true,
  availabilityState:'available',
  availabilityAuthoritative:false
});
assert(unverifiedAvailability.availability.acceptedState === 'unknown', 'unverified availability must fail closed to unknown');
assert(unverifiedAvailability.presentation.authorityComplete === false, 'unverified availability must block authority completeness');
assert(unverifiedAvailability.presentation.executablePresentationEnabled === false, 'unverified availability must disable executable presentation');

const restricted = resolveGlazeCommandItem({
  commandId:'restricted',
  concept:'action',
  providerScope:'application',
  providerScopeAuthoritative:true,
  sourceKind:'local',
  sourceIdentityAuthoritative:true,
  availabilityState:'restricted',
  availabilityAuthoritative:true
});
assert(restricted.presentation.authorityComplete === true, 'authoritative restricted item should have complete authority metadata');
assert(restricted.presentation.available === false, 'restricted item must not be available');
assert(restricted.presentation.executablePresentationEnabled === false, 'restricted item must not be enabled');

const baseItems = [
  {
    commandId:'open',
    concept:'command',
    providerScope:'application',
    providerScopeAuthoritative:true,
    sourceKind:'local',
    sourceIdentityAuthoritative:true,
    availabilityState:'available',
    availabilityAuthoritative:true
  },
  {
    commandId:'share',
    concept:'action',
    providerScope:'contextual',
    providerScopeAuthoritative:true,
    sourceKind:'goreecloud-service',
    sourceIdentityAuthoritative:true,
    availabilityState:'restricted',
    availabilityAuthoritative:true
  }
];

for (const [profile,inputModel] of Object.entries(representativeInputs)) {
  const surface = resolveGlzCommandSurface({
    profile,
    posture: profile === 'foldable' ? 'unfolded' : 'unknown',
    inputModel,
    availableInputs:[inputModel],
    inputCapabilityAuthoritative:true,
    invocationAvailabilityState:'available',
    invocationAvailabilityAuthoritative:true,
    surfaceConcept:'universal-search',
    phase:'results',
    items:baseItems,
    previousCommandIds:['open','share'],
    query:'continuity',
    filters:['current'],
    selectedCommandId:'open',
    focusId:'command-open',
    navigationDestination:'memos',
    stateClasses:{
      query:'session-scoped',
      activeFilters:'session-scoped',
      selectionIds:'session-scoped',
      focusId:'session-scoped',
      navigationDestination:'durable'
    }
  });
  assert(surface.component === 'GlzCommandSurface', `component identity mismatch: ${profile}`);
  assert(surface.presentation.form === presentations[profile], `presentation mapping mismatch: ${profile}`);
  assert(surface.presentation.oneCommandConceptAcrossProfiles === true, `profile created separate command concept: ${profile}`);
  assert(surface.presentation.oneCommandConceptAcrossInputModels === true, `input created separate command concept: ${profile}`);
  assert(surface.context.query === 'continuity', `query lost: ${profile}`);
  assert(surface.context.filters[0] === 'current', `filters lost: ${profile}`);
  assert(surface.context.selectedCommandId === 'open', `selection lost: ${profile}`);
  assert(surface.context.focusId === 'command-open', `focus lost: ${profile}`);
  assert(surface.context.navigationDestination === 'memos', `navigation context lost: ${profile}`);
  assert(surface.presentation.invocationBinding.binding.executionAutomatic === false, `invocation auto-execution leaked: ${profile}`);
  assert(surface.authority.commandExecutionAutomatic === false, `command auto-execution leaked: ${profile}`);
}

const partial = resolveGlzCommandSurface({
  profile:'desktop',
  inputModel:'keyboard',
  invocationAvailabilityState:'available',
  invocationAvailabilityAuthoritative:true,
  phase:'partial-results',
  pendingProviders:['remote-provider'],
  previousCommandIds:['alpha','beta'],
  items:[
    {
      commandId:'beta',
      concept:'command',
      providerScope:'application',
      providerScopeAuthoritative:true,
      sourceKind:'local',
      sourceIdentityAuthoritative:true,
      availabilityState:'available',
      availabilityAuthoritative:true
    },
    {
      commandId:'gamma',
      concept:'command',
      providerScope:'application',
      providerScopeAuthoritative:true,
      sourceKind:'remote',
      sourceIdentityAuthoritative:true,
      availabilityState:'available',
      availabilityAuthoritative:true
    }
  ]
});
assert(partial.itemContinuity.stableCommandIds.join(',') === 'alpha,beta,gamma', 'partial provider arrival must preserve existing relative order');
assert(partial.itemContinuity.providerArrivalMayArbitrarilyReorderExistingItems === false, 'partial provider arrival must not reorder arbitrarily');
assert(partial.itemContinuity.providerPrecedenceInferredByGlaze === false, 'provider precedence must not be inferred');
assert(partial.itemContinuity.rankingInventedByGlaze === false, 'ranking must not be invented');

const finalResults = resolveGlzCommandSurface({
  profile:'desktop',
  inputModel:'keyboard',
  invocationAvailabilityState:'available',
  invocationAvailabilityAuthoritative:true,
  phase:'results',
  previousCommandIds:['alpha','beta'],
  items:[
    {
      commandId:'beta',
      concept:'command',
      providerScope:'application',
      providerScopeAuthoritative:true,
      sourceKind:'local',
      sourceIdentityAuthoritative:true,
      availabilityState:'available',
      availabilityAuthoritative:true
    },
    {
      commandId:'gamma',
      concept:'command',
      providerScope:'application',
      providerScopeAuthoritative:true,
      sourceKind:'remote',
      sourceIdentityAuthoritative:true,
      availabilityState:'available',
      availabilityAuthoritative:true
    }
  ]
});
assert(finalResults.itemContinuity.stableCommandIds.join(',') === 'beta,gamma', 'final results should drop absent stale item while preserving retained order');

for (const phase of phases) {
  const surface = resolveGlzCommandSurface({
    profile:'mobile',
    inputModel:'touch',
    phase,
    invocationAvailabilityState:'unknown',
    invocationAvailabilityAuthoritative:false
  });
  assert(surface.phase === phase, `surface phase failed: ${phase}`);
  assert(surface.presentation.invocationBinding.availability.acceptedState === 'unknown', `unverified invocation must remain unknown: ${phase}`);
  assert(surface.presentation.invocationBinding.binding.canPresentAsEnabled === false, `unverified invocation must remain disabled: ${phase}`);
}

assert(glazeV17CommandSurfaceDevelopmentContract.version === '1.7.0-dev.4', 'runtime contract version mismatch');
assert(glazeV17CommandSurfaceDevelopmentContract.lifecycle === 'development', 'runtime contract must remain Development');
assert(glazeV17CommandSurfaceDevelopmentContract.stableBaseline === '1.6.0', 'runtime Stable baseline mismatch');
assert(glazeV17CommandSurfaceDevelopmentContract.consumerEligible === false, 'runtime must remain non-consumer-eligible');
assert(glazeV17CommandSurfaceDevelopmentContract.component === 'GlzCommandSurface', 'runtime component mismatch');
assert(glazeV17CommandSurfaceDevelopmentContract.interactionConcepts.length === 6, 'runtime concept count mismatch');
assert(glazeV17CommandSurfaceDevelopmentContract.providerScopes.length === 6, 'runtime provider-scope count mismatch');
assert(glazeV17CommandSurfaceDevelopmentContract.sourceKinds.length === 7, 'runtime source-kind count mismatch');
assert(glazeV17CommandSurfaceDevelopmentContract.surfacePhases.length === 11, 'runtime phase count mismatch');
assert(glazeV17CommandSurfaceDevelopmentContract.oneCommandConceptAcrossProfiles === true, 'runtime command concept must be unified across profiles');
assert(glazeV17CommandSurfaceDevelopmentContract.oneCommandConceptAcrossInputModels === true, 'runtime command concept must be unified across input models');
assert(glazeV17CommandSurfaceDevelopmentContract.commandExecutionAutomatic === false, 'runtime must not auto-execute commands');

const aggregateVersionParts = String(glazeV17Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.7.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 4,
  'aggregate Development version must retain or advance beyond dev.4'
);
assert(glazeV17Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV17Development.stableBaseline === '1.6.0', 'aggregate Stable baseline mismatch');
assert(glazeV17Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const retainedSection of [1,2,3,4,5]) {
  assert(
    glazeV17Development.implementedSpecificationSections.includes(retainedSection),
    `aggregate lost Command Surface prerequisite section ${retainedSection}`
  );
}
assert(glazeV17Development.taskContinuityFoundation === 'js/glaze-v1.7-task-continuity.dev.mjs', 'aggregate lost Task Continuity');
assert(glazeV17Development.adaptiveInputFoundation === 'js/glaze-v1.7-adaptive-input.dev.mjs', 'aggregate lost Adaptive Input');
assert(glazeV17Development.formFactorProfilesFoundation === 'js/glaze-v1.7-form-factor-profiles.dev.mjs', 'aggregate lost Form-Factor Profiles');
assert(glazeV17Development.commandSurfaceFoundation === 'js/glaze-v1.7-command-surface.dev.mjs', 'aggregate missing Command Surface');

let invalidConcept=false;
try { resolveGlazeCommandItem({commandId:'x',concept:'telepathy'}); } catch { invalidConcept=true; }
assert(invalidConcept, 'unknown command concept must fail closed');

let invalidScope=false;
try { resolveGlazeCommandItem({commandId:'x',providerScope:'galactic'}); } catch { invalidScope=true; }
assert(invalidScope, 'unknown provider scope must fail closed');

let invalidSource=false;
try { resolveGlazeCommandItem({commandId:'x',sourceKind:'mystery-cloud'}); } catch { invalidSource=true; }
assert(invalidSource, 'unknown source kind must fail closed');

let invalidPhase=false;
try { resolveGlzCommandSurface({profile:'mobile',inputModel:'touch',phase:'dreaming'}); } catch { invalidPhase=true; }
assert(invalidPhase, 'unknown surface phase must fail closed');

let invalidProfile=false;
try { resolveGlzCommandSurface({profile:'spatial',inputModel:'touch'}); } catch { invalidProfile=true; }
assert(invalidProfile, 'non-first-class profile must fail closed');

let invalidInput=false;
try { resolveGlzCommandSurface({profile:'mobile',inputModel:'telepathy'}); } catch { invalidInput=true; }
assert(invalidInput, 'unknown input model must fail closed');

console.log('GLAZE UI V1.7 GlzCommandSurface Development foundation: PASS');
console.log('Implemented section: 5');
console.log('Interaction concepts: 6');
console.log('Provider scopes: 6');
console.log('Source kinds: 7');
console.log('Surface phases: 11');
console.log('Profile presentations: 6');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
