#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeProgressiveDisclosure,
  resolveGlazeActionHierarchy,
  resolveGlazeApplicationChrome,
  resolveGlazeCommonOperation,
  resolveGlazeTokenConsumption,
  resolveGlazeTruthfulPresentation,
  resolveGlazePrivacyMinimizedAdaptation,
  resolveGlazeLocalFirstPresentation,
  resolveGlazeStablePrimaryActions,
  resolveGlazeCalmDefault,
  evaluateGlazeExpressiveEffect,
  glazeV16ExperienceGovernanceDevelopmentContract
} from '../js/glaze-v1.6-experience-governance.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.6/experience-governance.dev.json');
const schema = json('schemas/v1.6-experience-governance.schema.json');
const tokens = json('tokens/glaze-v1.6-experience-governance.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_6_PLANNED.md');

const sections = [74,75,76,77,78,79,88,89,90,91,92,93];
const actionClasses = ['primary','secondary','tertiary','contextual','destructive'];
const chromeSurfaces = [
  'application-bar','side-navigation','search','dialog','menu',
  'context-surface','settings','loading','error','notification'
];
const truthKinds = ['capability','authority','privacy','security','connectivity','availability','permission'];

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
assert(contract.$schema === '../../schemas/v1.6-experience-governance.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.6.0-dev.8', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.5.1', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify(sections), 'implemented section set mismatch');
assert(contract.progressiveDisclosure.essentialFunctionalityMayBeHidden === false, 'essential functionality must not be hidden');
assert(contract.actionHierarchy.referenceSimultaneousDominantLimit === 1, 'dominant action reference limit mismatch');
assert(contract.applicationChrome.applicationIdentityMayRedefineCoreBehavior === false, 'app identity must not redefine core behavior');
assert(contract.crossApplicationFamiliarity.arbitraryBehaviorChangesAllowed === false, 'equivalent operations must remain familiar');
assert(contract.tokens.semanticTokensRequired === true, 'semantic tokens must be required');
assert(contract.tokenSafety.protectedSemanticOverrideAllowed === false, 'protected token overrides must be blocked');
assert(contract.truthfulPresentation.stateManufacturedByGlaze === false, 'presentation must not manufacture truth');
assert(contract.privacyPreservingAdaptation.privateDataCollectedByResolver === false, 'adaptation must not collect private data');
assert(contract.localFirstResolution.remoteProcessingRequired === false, 'ordinary presentation must remain local-first');
assert(contract.stablePrimaryActions.transientAdaptationMayReorder === false, 'primary actions must remain stable');
assert(contract.calmDefault.continuousDecorativeMotionDefaultAllowed === false, 'calm default must not enable continuous decorative motion');
assert(contract.beautyWithRestraint.unjustifiedEffectAllowed === false, 'unjustified visual effects must be rejected');

assert(tokens.version === '1.6.0-dev.8', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.5.1', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(tokens.progressiveDisclosure.essentialMayBeHidden === false, 'token map must protect essential functionality');
assert(tokens.protectedTokenDomains.arbitraryOverrideAllowed === false, 'token map must protect semantic domains');
assert(tokens.truthfulPresentation.unverifiedMayUpgradeToPositive === false, 'token map must fail closed for unverified truth');
assert(tokens.localFirst.remoteProcessingRequired === false, 'token map must preserve local-first resolution');
assert(tokens.stablePrimaryActions.transientReorderAllowed === false, 'token map must preserve primary action order');
assert(tokens.calmDefault.continuousDecorativeMotionDefaultAllowed === false, 'token map must preserve calm default');
assert(tokens.effectBenefits.unjustifiedEffectAllowed === false, 'token map must reject unjustified effects');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

assert(glazeV16ExperienceGovernanceDevelopmentContract.version === '1.6.0-dev.8', 'runtime contract version mismatch');
assert(glazeV16ExperienceGovernanceDevelopmentContract.lifecycle === 'development', 'runtime contract must remain development');
assert(glazeV16ExperienceGovernanceDevelopmentContract.consumerEligible === false, 'runtime contract must remain non-consumer-eligible');
assert(glazeV16ExperienceGovernanceDevelopmentContract.essentialFunctionalityMayBeHidden === false, 'runtime must protect essential functionality');
assert(glazeV16ExperienceGovernanceDevelopmentContract.protectedSemanticOverrideAllowed === false, 'runtime must protect semantic overrides');
assert(glazeV16ExperienceGovernanceDevelopmentContract.presentationMayManufactureTruth === false, 'runtime must not manufacture truth');
assert(glazeV16ExperienceGovernanceDevelopmentContract.ordinaryPresentationRequiresRemoteProcessing === false, 'runtime must remain local-first');
assert(glazeV16ExperienceGovernanceDevelopmentContract.transientAdaptationMayReorderPrimaryActions === false, 'runtime must preserve primary action stability');
assert(glazeV16ExperienceGovernanceDevelopmentContract.unjustifiedExpressiveEffectsAllowed === false, 'runtime must reject unjustified effects');

const aggregateVersionParts = String(glazeV16Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.6.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 8,
  'aggregate Development version must retain or advance beyond dev.8'
);
assert(glazeV16Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV16Development.stableBaseline === '1.5.1', 'aggregate Stable baseline mismatch');
assert(glazeV16Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const number of sections) {
  assert(glazeV16Development.implementedSpecificationSections.includes(number), `aggregate must retain experience-governance section ${number}`);
}
for (const retained of [1,6,10,15,29,41,55,60,70,71,73]) {
  assert(glazeV16Development.implementedSpecificationSections.includes(retained), `aggregate lost prior section ${retained}`);
}

const disclosure = resolveGlazeProgressiveDisclosure({
  items:[
    {id:'title',essential:true,priority:'primary'},
    {id:'save',essential:true,priority:'primary'},
    {id:'advanced-formatting',essential:false,priority:'tertiary'},
    {id:'metadata',essential:false,priority:'contextual'}
  ],
  requestedHiddenIds:['save','advanced-formatting','metadata']
});
assert(disclosure.visibleIds.includes('save'), 'essential action must remain visible');
assert(disclosure.attemptedEssentialHides.includes('save'), 'attempt to hide essential control must be observable');
assert(!disclosure.hiddenIds.includes('save'), 'essential control must not be hidden');
assert(disclosure.hiddenIds.includes('advanced-formatting'), 'nonessential control may be progressively disclosed');
assert(disclosure.rules.essentialFunctionalityMayBeHidden === false, 'disclosure rule mismatch');

const hierarchy = resolveGlazeActionHierarchy({
  actions:[
    {id:'save',class:'primary'},
    {id:'share',class:'secondary'},
    {id:'more',class:'tertiary'},
    {id:'delete',class:'destructive'}
  ],
  destructiveProminent:false
});
assert(hierarchy.counts.primary === 1, 'primary action count mismatch');
assert(hierarchy.counts.destructive === 1, 'destructive action count mismatch');
assert(hierarchy.hierarchy.tooManyDominantActions === false, 'single primary action should not exceed dominant budget');
assert(hierarchy.hierarchy.destructiveSemanticProtectionRequired === true, 'destructive action needs semantic protection');

const crowdedHierarchy = resolveGlazeActionHierarchy({
  actions:[
    {id:'save',class:'primary'},
    {id:'publish',class:'primary'}
  ]
});
assert(crowdedHierarchy.hierarchy.tooManyDominantActions === true, 'multiple primary actions should exceed reference dominant limit');

for (const surface of chromeSurfaces) {
  const resolved = resolveGlazeApplicationChrome({surface});
  assert(resolved.surface === surface, `chrome surface failed: ${surface}`);
  assert(resolved.sharedBehavior.applicationIdentityMayRedefineCoreBehavior === false, `chrome behavior divergence allowed: ${surface}`);
  assert(resolved.sharedBehavior.accessibilityPrecedenceRequired === true, `accessibility precedence missing: ${surface}`);
}

const operation = resolveGlazeCommonOperation({
  operation:'save',
  requestedBehavior:'save',
  presentationVariation:['icon','label']
});
assert(operation.equivalent === true, 'equivalent common operation should remain equivalent');
assert(operation.consistency.arbitraryBehaviorChangeAllowed === false, 'common operation must not change arbitrarily');

const divergentOperation = resolveGlazeCommonOperation({
  operation:'save',
  requestedBehavior:'publish'
});
assert(divergentOperation.equivalent === false, 'divergent operation must be visible to validation');

const token = resolveGlazeTokenConsumption({
  category:'focus',
  semanticToken:'focus.material-protected',
  rawValueRequested:false,
  overrideRequested:false
});
assert(token.consumption.rawValueAccepted === true, 'semantic token consumption should be accepted');

const protectedOverride = resolveGlazeTokenConsumption({
  category:'status',
  semanticToken:'security.protected',
  overrideRequested:true,
  protectedDomains:['security-state','accessibility']
});
assert(protectedOverride.consumption.protectedOverrideBlocked === true, 'protected semantic override must be blocked');
assert(protectedOverride.safety.securityMeaningMayBeRedefined === false, 'security meaning must remain protected');
assert(protectedOverride.safety.accessibilityMayBeBrokenByOverride === false, 'accessibility must remain protected');

const rawDuplication = resolveGlazeTokenConsumption({
  category:'blur',
  rawValueRequested:true
});
assert(rawDuplication.consumption.rawValueAccepted === false, 'raw token duplication should not be accepted as semantic consumption');

for (const kind of truthKinds) {
  const authoritative = resolveGlazeTruthfulPresentation({
    kind,
    state:'available',
    authoritative:true
  });
  assert(authoritative.acceptedState === 'available', `authoritative truth failed: ${kind}`);
  assert(authoritative.authority.stateManufacturedByGlaze === false, `Glaze manufactured truth: ${kind}`);
}

const unknownCapability = resolveGlazeTruthfulPresentation({
  kind:'capability',
  state:'available',
  authoritative:false
});
assert(unknownCapability.acceptedState === 'unknown', 'unverified capability must fail closed to unknown');

const unverifiedSecurity = resolveGlazeTruthfulPresentation({
  kind:'security',
  state:'protected',
  authoritative:false
});
assert(unverifiedSecurity.acceptedState === 'unverified', 'unverified security must fail closed to unverified');
assert(unverifiedSecurity.presentation.positiveOrSpecificTruthWithoutAuthorityAllowed === false, 'specific truth must require authority');

const adaptation = resolveGlazePrivacyMinimizedAdaptation({
  requestedSignals:[
    'layout-environment',
    'accessibility-profiles',
    'performance-level',
    'personal-content',
    'private-communications',
    'browsing-history',
    'unrelated-application-state'
  ]
});
for (const signal of ['layout-environment','accessibility-profiles','performance-level']) {
  assert(adaptation.acceptedSignals.includes(signal), `allowed adaptation signal rejected: ${signal}`);
}
for (const signal of ['personal-content','private-communications','browsing-history','unrelated-application-state']) {
  assert(adaptation.rejectedSignals.includes(signal), `private/unrelated adaptation signal accepted: ${signal}`);
  assert(adaptation.explicitlyProhibited.includes(signal), `prohibited adaptation signal not classified: ${signal}`);
}
assert(adaptation.privacy.minimumNecessarySignalsOnly === true, 'adaptation must use minimum necessary signals');
assert(adaptation.authority.privateDataCollectedByResolver === false, 'resolver must not collect private data');

for (const capability of [
  'ordinary-appearance','accessibility','responsive-behavior',
  'skeleton-loading','component-state-rendering','focus-presentation',
  'semantic-color-resolution','density-resolution'
]) {
  const resolved = resolveGlazeLocalFirstPresentation({capability,localInputsAvailable:true});
  assert(resolved.resolution.remoteProcessingRequired === false, `remote processing incorrectly required: ${capability}`);
  assert(resolved.resolution.networkAvailabilityRequired === false, `network incorrectly required: ${capability}`);
  assert(resolved.resolution.mayResolveLocally === true, `local resolution unavailable: ${capability}`);
}

const stableActions = resolveGlazeStablePrimaryActions({
  previousIds:['new','save','share'],
  requestedIds:['share','save','new','export'],
  taskRelatedReason:false
});
assert(JSON.stringify(stableActions.acceptedIds) === JSON.stringify(['new','save','share','export']), 'transient adaptation must preserve surviving primary action order');
assert(stableActions.stability.preserveSurvivingRelativeOrder === true, 'stable action order marker missing');

const taskDrivenActions = resolveGlazeStablePrimaryActions({
  previousIds:['new','save','share'],
  requestedIds:['save','share','new'],
  taskRelatedReason:true
});
assert(JSON.stringify(taskDrivenActions.acceptedIds) === JSON.stringify(['save','share','new']), 'strong task reason may permit explicit recomposition');

const calmDefault = resolveGlazeCalmDefault({
  effects:['color','translucency','depth','motion'],
  emphasizedRegions:1,
  continuousMotionRequested:true,
  defaultContext:true
});
assert(calmDefault.presentation.continuousDecorativeMotionAllowed === false, 'default context must remain calm');
assert(calmDefault.presentation.excessiveSimultaneousEmphasis === false, 'single emphasis region should not be excessive');
assert(calmDefault.presentation.restrainedTransparencyRequired === true, 'calm default must restrain transparency');

const noisyDefault = resolveGlazeCalmDefault({
  effects:['color','blur','motion'],
  emphasizedRegions:4,
  defaultContext:true
});
assert(noisyDefault.presentation.excessiveSimultaneousEmphasis === true, 'excessive default emphasis must be detectable');

const justifiedEffect = evaluateGlazeExpressiveEffect({
  effect:'blur',
  benefits:['readability','hierarchy']
});
assert(justifiedEffect.justified === true, 'effect with approved benefit should be justified');
assert(justifiedEffect.recommendation === 'retain-within-budgets', 'justified effect recommendation mismatch');

const unjustifiedEffect = evaluateGlazeExpressiveEffect({
  effect:'reflection',
  benefits:['looks-cool']
});
assert(unjustifiedEffect.justified === false, 'effect without approved benefit should not be justified');
assert(unjustifiedEffect.recommendation === 'remove-or-simplify', 'unjustified effect should be removed or simplified');
assert(unjustifiedEffect.principle.visualIntensityEqualsQuality === false, 'visual intensity must not equal quality');

let invalidAction=false;
try { resolveGlazeActionHierarchy({actions:[{id:'x',class:'super-primary'}]}); } catch { invalidAction=true; }
assert(invalidAction, 'unknown action class must fail closed');

let invalidChrome=false;
try { resolveGlazeApplicationChrome({surface:'random-panel'}); } catch { invalidChrome=true; }
assert(invalidChrome, 'unknown chrome surface must fail closed');

let invalidToken=false;
try { resolveGlazeTokenConsumption({category:'magic'}); } catch { invalidToken=true; }
assert(invalidToken, 'unknown token category must fail closed');

let invalidTruth=false;
try { resolveGlazeTruthfulPresentation({kind:'vibe',state:'good'}); } catch { invalidTruth=true; }
assert(invalidTruth, 'unknown truth kind must fail closed');

let invalidLocalFirst=false;
try { resolveGlazeLocalFirstPresentation({capability:'remote-ai-analysis'}); } catch { invalidLocalFirst=true; }
assert(invalidLocalFirst, 'unsupported local-first capability must fail closed');

let invalidEffect=false;
try { evaluateGlazeExpressiveEffect({effect:'sparkles'}); } catch { invalidEffect=true; }
assert(invalidEffect, 'unknown expressive effect must fail closed');

console.log('GLAZE UI V1.6 experience governance Development foundation: PASS');
console.log('Action classes: 5');
console.log('Chrome surfaces: 10');
console.log('Semantic token categories: 15');
console.log('Protected token domains: 6');
console.log('Truth kinds: 7');
console.log('Local-first capabilities: 8');
console.log('Implemented sections: 74-79,88-93');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
