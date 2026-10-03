#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeNotificationActivityTruth,
  resolveGlazeActivityProgress,
  resolveGlazeActivityActions,
  resolveGlazeNotificationActivitySurface,
  glazeV17NotificationActivitySurfacesDevelopmentContract
} from '../js/glaze-v1.7-notification-activity-surfaces.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.7/notification-activity-surfaces.dev.json');
const schema = json('schemas/v1.7-notification-activity-surfaces.schema.json');
const tokens = json('tokens/glaze-v1.7-notification-activity-surfaces.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_7_PLANNED.md');
const planned = read('PLANNED-FEATURES.md');
const implemented = read('IMPLEMENTED-FEATURES.md');
const changelog = read('CHANGELOGS.md');

const components = ['GlzNotificationSurface','GlzActivityItem','GlzActivityGroup','GlzStatusFeed','GlzBackgroundTask','GlzProgressSurface'];
const kinds = ['informational-activity','background-work','required-attention','warning','critical','user-requested-progress','recoverable-failure','security-state','privacy-state'];
const profiles = ['mobile','tablet','desktop','foldable','tv','wearable'];

assert(stable === '1.7.0', 'V1.7 dev.7 must coexist with bounded Glaze V1.7 / 1.7.0 as current Stable');
assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
assert(lifecycle.activeCandidate === null, 'V1.7 dev.7 must not create an active Candidate');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.7 dev.7 must not create a patch RC');
assert(lifecycle.plannedNext==='1.7.1', 'V1.7 dev.7 must not mutate lifecycle plannedNext');

assert(spec.includes('## 36. Notification and Activity Surfaces'), 'V1.7 v1.2 specification missing Notification and Activity Surfaces section');
for (const phrase of ['GlzNotificationSurface','GlzActivityItem','GlzActivityGroup','GlzStatusFeed','GlzBackgroundTask','GlzProgressSurface']) {
  assert(spec.includes(phrase), `V1.7 v1.2 specification missing Notification and Activity Surfaces component: ${phrase}`);
}
assert(spec.includes('Persistent pulsing should not become the default way to communicate attention.'), 'V1.7 v1.2 notification motion-fatigue boundary missing');

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.7-notification-activity-surfaces.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.7.0-dev.7', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.6.0', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify([8]), 'implemented section set mismatch');
assert(JSON.stringify(contract.components) === JSON.stringify(components), 'component catalog mismatch');
assert(JSON.stringify(contract.activityKinds) === JSON.stringify(kinds), 'activity kind catalog mismatch');
assert(contract.fallbackActivityKind === 'unknown', 'unknown fail-closed fallback missing');
assert(JSON.stringify(contract.progressModes) === JSON.stringify(['none','determinate','indeterminate','unknown']), 'progress modes mismatch');
assert(JSON.stringify(contract.availabilityStates) === JSON.stringify(['available','unavailable','unknown']), 'availability states mismatch');
assert(Object.keys(contract.presentationByProfile).length === 6, 'contract must include six form-factor presentations');
assert(contract.authority.boundary === 'presentation-only', 'Section 8 must remain presentation-only');
for (const required of ['providerTruthAuthorityRequired','progressAuthorityRequired','actionAvailabilityAuthorityRequired']) {
  assert(contract.authority[required] === true, `required authority gate missing: ${required}`);
}
for (const denied of ['notificationTruthCreatedByGlaze','activityTruthCreatedByGlaze','progressTruthCreatedByGlaze','securityAuthorityCreatedByGlaze','privacyAuthorityCreatedByGlaze','systemNotificationPermissionGrantedByGlaze','backgroundTaskExecutionPerformedByGlaze','actionExecutionPerformedByGlaze','persistencePerformedByGlaze','crossDeviceSyncEstablished','consequentialExecutionAutomatic']) {
  assert(contract.authority[denied] === false, `authority boundary weakened: ${denied}`);
}

for (const source of Object.values(contract.integrationFoundations)) {
  assert(fs.existsSync(path.join(root, source)), `integration foundation missing: ${source}`);
}
for (const source of contract.sourceAuthorities) {
  assert(fs.existsSync(path.join(root, source)), `source authority missing: ${source}`);
}

assert(tokens.version === '1.7.0-dev.7', 'token version mismatch');
assert(tokens.lifecycle === 'Development', 'tokens must remain Development');
assert(tokens.stableBaseline === '1.6.0', 'token Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'tokens must remain non-consumer-eligible');
assert(Object.keys(tokens.components).length === 6, 'token map must expose six components');
assert(Object.keys(tokens.activityRoles).length === 9, 'token map must expose nine activity roles');
assert(Object.keys(tokens.presentationByProfile).length === 6, 'token map must expose six profile presentations');
assert(Object.keys(tokens.continuity).length === 5, 'token map must expose five continuity roles');
assert(tokens.boundaries.presentationOnly === true, 'tokens must remain presentation-only');
assert(tokens.boundaries.providerTruthAuthorityRequired === true, 'tokens must require provider truth authority');
assert(tokens.boundaries.actionExecutionPerformedByGlaze === false, 'tokens must not claim action execution');

const untrustedSecurity = resolveGlazeNotificationActivityTruth({kind:'security-state', authoritative:false, sourceId:'wardveil'});
assert(untrustedSecurity.acceptedKind === 'unknown', 'untrusted security state must fail closed');
assert(untrustedSecurity.securityStatePresented === false, 'untrusted security state must not be presented as authoritative');

const trustedPrivacy = resolveGlazeNotificationActivityTruth({kind:'privacy-state', authoritative:true, sourceId:'privacy-shield'});
assert(trustedPrivacy.acceptedKind === 'privacy-state', 'trusted privacy state should remain privacy-state');
assert(trustedPrivacy.privacyStatePresented === true, 'trusted privacy state should be presentable');

const withheldProgress = resolveGlazeActivityProgress({mode:'determinate', fraction:0.5, authoritative:false});
assert(withheldProgress.acceptedMode === 'unknown' && withheldProgress.fraction === null, 'untrusted progress must fail closed');

const trustedProgress = resolveGlazeActivityProgress({mode:'determinate', fraction:0.42, authoritative:true});
assert(trustedProgress.acceptedMode === 'determinate' && trustedProgress.fraction === 0.42, 'trusted determinate progress should be preserved');

const actions = resolveGlazeActivityActions([
  {id:'retry',label:'Retry',state:'available',availabilityAuthoritative:true},
  {id:'delete',label:'Delete',state:'available',availabilityAuthoritative:false}
]);
assert(actions[0].presentAsAvailable === true, 'authoritative available action should be presentable');
assert(actions[1].presentAsAvailable === false && actions[1].acceptedState === 'unknown', 'untrusted action availability must fail closed');
assert(actions.every(action => action.executionPerformedByGlaze === false), 'Glaze must not execute notification/activity actions');

const previousTaskState = {
  navigationDestination:'activity',
  focusId:'activity-row-2',
  draftText:'draft preserved',
  query:'errors',
  paneState:{activePane:'detail'}
};

for (const profile of profiles) {
  const resolved = resolveGlazeNotificationActivitySurface({
    component:'GlzStatusFeed',
    profile,
    kind:'recoverable-failure',
    truthAuthoritative:true,
    sourceId:'provider',
    progressMode:'none',
    previousTaskState
  });
  assert(resolved.profile === profile, `profile mismatch: ${profile}`);
  assert(resolved.truth.acceptedKind === 'recoverable-failure', `trusted truth lost: ${profile}`);
  assert(resolved.taskState.navigationDestination === 'activity', `navigation continuity lost: ${profile}`);
  assert(resolved.taskState.focusId === 'activity-row-2', `focus continuity lost: ${profile}`);
  assert(resolved.taskState.draftText === 'draft preserved', `draft continuity lost: ${profile}`);
  assert(resolved.authority.notificationTruthCreatedByGlaze === false, `truth boundary weakened: ${profile}`);
  assert(resolved.authority.backgroundTaskExecutionPerformedByGlaze === false, `execution boundary weakened: ${profile}`);
}

assert(glazeV17NotificationActivitySurfacesDevelopmentContract.version === '1.7.0-dev.7', 'runtime contract version mismatch');
assert(glazeV17NotificationActivitySurfacesDevelopmentContract.lifecycle === 'development', 'runtime contract must remain Development');
assert(glazeV17NotificationActivitySurfacesDevelopmentContract.stableBaseline === '1.6.0', 'runtime Stable baseline mismatch');
assert(glazeV17NotificationActivitySurfacesDevelopmentContract.consumerEligible === false, 'runtime must remain non-consumer-eligible');
assert(JSON.stringify(glazeV17NotificationActivitySurfacesDevelopmentContract.components) === JSON.stringify(components), 'runtime component set mismatch');
assert(JSON.stringify(glazeV17NotificationActivitySurfacesDevelopmentContract.activityKinds) === JSON.stringify(kinds), 'runtime activity kind set mismatch');

const aggregateVersionParts = String(glazeV17Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.7.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 7,
  'aggregate Development version must retain or advance beyond Notification and Activity Surfaces dev.7'
);
assert(glazeV17Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV17Development.stableBaseline === '1.6.0', 'aggregate Stable baseline mismatch');
assert(glazeV17Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
assert(JSON.stringify(glazeV17Development.implementedSpecificationSections) === JSON.stringify([1,2,3,4,5,6,7,8]), 'aggregate section set mismatch');
assert(glazeV17Development.notificationActivitySurfacesFoundation === 'js/glaze-v1.7-notification-activity-surfaces.dev.mjs', 'aggregate missing Section 8 foundation');
assert(glazeV17Development.providerTruthManufactured === false, 'aggregate must preserve provider-truth boundary');

assert(planned.includes('1.7.0-dev.7') && planned.includes('historical dev tranche numbers'), 'planned-feature control must preserve dev.7 state and v1.1 provenance boundary');
assert(implemented.includes('Notification and Activity Surfaces — `1.7.0-dev.7`'), 'implemented-feature control missing dev.7');
assert(changelog.includes('1.7.0-dev.7') && changelog.includes('Notification and Activity Surfaces'), 'changelog missing dev.7');

for (const [field,value] of [
  ['component','GlzInventedSurface'],
  ['profile','spatial'],
  ['kind','invented-truth']
]) {
  let failed = false;
  try {
    resolveGlazeNotificationActivitySurface({
      component:'GlzStatusFeed',
      profile:'mobile',
      kind:'informational-activity',
      truthAuthoritative:true,
      progressMode:'none',
      [field]:value
    });
  } catch { failed = true; }
  assert(failed, `unsupported notification/activity value must fail closed: ${field}=${value}`);
}

let invalidProgress = false;
try {
  resolveGlazeActivityProgress({mode:'determinate',fraction:1.2,authoritative:true});
} catch { invalidProgress = true; }
assert(invalidProgress, 'invalid determinate progress must fail closed');

console.log('GLAZE UI V1.7 Notification and Activity Surfaces Development foundation: PASS');
console.log('Implemented section: 8');
console.log('Components: 6');
console.log('Activity kinds: 9 + unknown fail-closed fallback');
console.log('First-class profiles: 6');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
