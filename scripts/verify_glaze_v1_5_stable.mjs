import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeInterface,
  summarizeGlazeInterfaceResolution
} from '../js/glaze-v1.5-resolution.dev.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const expectedAnchor = 'ee1032a0822ab8e103f8afe48e5c1859fde65cc9';
const deferred = [
  'performance-representative-budget',
  'platform-posture-continuity'
];

const lifecycle = json('registry/lifecycle.json');
const release = lifecycle.releases.find(item => item.version === '1.5.0');
assert(release, 'lifecycle must retain V1.5.0 release history');
assert(release.status === 'stable', 'V1.5.0 historical lifecycle status must remain stable');
assert(release.consumerEligible === true, 'V1.5.0 historical Stable record must remain consumer eligible');
assert(release.stableBaseline === '1.4.1', 'V1.5.0 historical Stable baseline must remain 1.4.1');
assert(release.contract === 'GLAZE_UI_V1_5.md', 'V1.5.0 historical contract mismatch');
assert(release.qualification === 'contracts/v1.5/stable-scope.json', 'V1.5.0 historical qualification record mismatch');
assert(release.acceptance === 'acceptance/v1.5-stable.md', 'V1.5.0 historical acceptance record mismatch');
assert(release.runtimeEntrypoint === 'js/glaze-v1.5.0.mjs', 'V1.5.0 historical runtime entrypoint mismatch');
assert(release.sourceQualificationAnchor === expectedAnchor, 'V1.5.0 source qualification anchor mismatch');
assert(release.deferredFollowUp === 'GLAZE_UI_V1_5_1_HARDENING.md', 'V1.5.1 follow-up provenance must remain declared');

const scope = json('contracts/v1.5/stable-scope.json');
assert(scope.version === '1.5.0', 'Historical Stable scope version mismatch');
assert(scope.lifecycle === 'stable', 'Historical Stable scope lifecycle mismatch');
assert(scope.reviewedImplementationAnchor === expectedAnchor, 'Historical Stable scope reviewed anchor mismatch');
assert(scope.qualifiedObligationCount === 16, 'V1.5.0 historical scope must retain exactly 16 qualified obligations');
assert(scope.qualifiedObligations.length === 16, 'V1.5.0 historical qualified-obligation list must retain 16 entries');
assert(scope.deferredObligationCount === 2, 'V1.5.0 historical scope must retain exactly two deferred obligations');
assert(scope.deferredToV151.length === 2, 'V1.5.0 historical deferred list must retain two entries');
assert(
  JSON.stringify(scope.deferredToV151.map(item => item.id).sort()) === JSON.stringify([...deferred].sort()),
  'Historical V1.5.0 deferred V1.5.1 obligations mismatch'
);
assert(scope.stableClaims.numericPerformanceBudgetV10Measured === false, 'V1.5.0 history must not be rewritten to claim Performance Budget v1.0 measurement');
assert(scope.stableClaims.foldablePostureTargetRuntimeAccepted === false, 'V1.5.0 history must not be rewritten to claim posture target-runtime acceptance');
assert(scope.continuityPolicy.presentationBehaviorChangePermittedByPromotion === false, 'V1.5.0 promotion history must retain no-presentation-change policy');
assert(scope.continuityPolicy.authorizationBehaviorChangePermittedByPromotion === false, 'V1.5.0 promotion history must retain no-authorization-change policy');

const consumerSchema = json('schemas/consumer-registry.schema.json');
assert(Number.isInteger(consumerSchema.properties?.schemaVersion?.const) && consumerSchema.properties.schemaVersion.const >= 8, 'Consumer registry schema must retain a governed schema version at or after the V1.5 historical baseline');
assert(String(consumerSchema.title).includes('Consumer Registry'), 'Consumer registry schema title must retain its governed registry identity');
const currentConsumers=json('consumers/registry.json');
assert(currentConsumers.officialBaseline===lifecycle.currentStable,'current consumer registry baseline must follow live Stable authority');
assert(currentConsumers.requiredConsumerVersion===lifecycle.currentStable,'current consumer target must follow live Stable authority');

const stableRuntime = read('js/glaze-v1.5.0.mjs');
assert(stableRuntime.includes("version: '1.5.0'"), 'Historical Stable runtime must identify version 1.5.0');
assert(stableRuntime.includes("lifecycle: 'stable'"), 'Historical Stable runtime must identify stable lifecycle');
assert(stableRuntime.includes(expectedAnchor), 'Historical Stable runtime must name reviewed implementation anchor');
assert(stableRuntime.includes("'performance-representative-budget'"), 'Historical Stable runtime must disclose deferred performance qualification');
assert(stableRuntime.includes("'platform-posture-continuity'"), 'Historical Stable runtime must disclose deferred posture qualification');
assert(stableRuntime.includes('numericPerformanceBudgetV10AcceptanceClaimed: false'), 'Historical Stable runtime must preserve performance non-claim');
assert(stableRuntime.includes('foldablePostureAcceptanceClaimed: false'), 'Historical Stable runtime must preserve posture non-claim');
assert(stableRuntime.includes("from './glaze-v1.5-resolution.dev.mjs'"), 'Historical Stable runtime must delegate to reviewed V1.5 resolver');
assert(stableRuntime.includes('promoteStableIdentity'), 'Historical Stable runtime must retain bounded Stable identity promotion');

const resolved = resolveGlazeInterface({
  providers: [
    {
      id: 'stable-platform',
      authority: 'platform',
      context: {
        layout: {category: 'expanded'},
        input: {primary: 'keyboard'},
        connectivity: {class: 'online'}
      },
      capabilities: [
        {id: 'connectivity.network', domain: 'connectivity', state: 'available'}
      ]
    },
    {
      id: 'stable-app',
      authority: 'application',
      context: {task: {kind: 'composing'}},
      capabilities: [
        {id: 'application.compose', domain: 'application', state: 'available'}
      ]
    },
    {
      id: 'stable-privacy',
      authority: 'privacy',
      capabilities: [
        {id: 'authorization.data-use', domain: 'authorization', state: 'permission-required'}
      ]
    }
  ],
  actions: [
    {id: 'compose', label: 'Compose', primary: true, requiredCapabilities: ['application.compose']},
    {id: 'sensitive', label: 'Sensitive action', requiredCapabilities: ['authorization.data-use'], consequential: true}
  ],
  destinations: [{id: 'home', label: 'Home'}],
  currentDestinationId: 'home',
  intent: {supportsMultiPane: true}
});

assert(resolved.version === '1.5.0-dev.1', 'Reviewed implementation identity must remain Development at the exact implementation layer');
assert(resolved.lifecycle === 'development', 'Reviewed implementation lifecycle must remain Development at the implementation layer');
assert(resolved.authority.authorizationInferred === false, 'Reviewed resolver must not infer authorization');
assert(resolved.authority.permissionGranted === false, 'Reviewed resolver must not grant permission');
assert(resolved.authority.automaticNavigationAllowed === false, 'Reviewed resolver must not allow automatic navigation');
assert(resolved.authority.automaticPermissionRequestAllowed === false, 'Reviewed resolver must not allow automatic permission requests');
assert(resolved.authority.automaticConsequentialExecutionAllowed === false, 'Reviewed resolver must not allow automatic consequential execution');
assert(resolved.authority.automaticFallbackExecutionAllowed === false, 'Reviewed resolver must not allow automatic fallback execution');
assert(resolved.continuity.taskStateReset === false, 'Reviewed resolver must preserve task state');
assert(resolved.continuity.pageReloadRequired === false, 'Reviewed resolver must not require page reload');

const sensitive = resolved.actions.actions.find(action => action.id === 'sensitive');
assert(sensitive?.state === 'permission-required', 'Privacy-sensitive action must remain permission-required');
assert(sensitive?.enabled === false, 'Privacy-sensitive action must remain disabled');

const summary = summarizeGlazeInterfaceResolution(resolved);
assert(summary.version === '1.5.0-dev.1', 'Reviewed resolver summary identity must remain Development');
assert(summary.lifecycle === 'development', 'Reviewed resolver summary lifecycle must remain Development');
assert(summary.operationalAuthorityGranted === false, 'Reviewed resolver summary must not grant operational authority');

const acceptance = read('acceptance/v1.5-stable.md');
assert(acceptance.includes(expectedAnchor), 'Historical V1.5.0 acceptance must name reviewed implementation anchor');
assert(acceptance.includes('performance-representative-budget'), 'Historical V1.5.0 acceptance must retain deferred performance record');
assert(acceptance.includes('platform-posture-continuity'), 'Historical V1.5.0 acceptance must retain deferred posture record');

const followUp = read('GLAZE_UI_V1_5_1_HARDENING.md');
for (const id of deferred) assert(followUp.includes(id), `V1.5.1 hardening record must retain ${id}`);

console.log('GLAZE UI V1.5.0 historical Stable integrity verification: PASS');
console.log(`Reviewed V1.5 implementation anchor: ${expectedAnchor}`);
console.log('Historical qualified obligations: 16');
console.log('Historical deferred obligations: 2');
