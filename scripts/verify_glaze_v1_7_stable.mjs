#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const req = (condition, message) => { if (!condition) throw new Error(message); };

const moved = [
  'frame-pacing','input-latency','mobile','tablet','desktop','foldable','tv',
  'wearable','keyboard','pointer','touch','alternative-input',
  'representative-rendering','native-behavior','performance','energy-behavior',
  'regression','human-visual-motion-review','assistive-technology',
  'privacy-boundaries','security-boundaries'
];

req(read('VERSION').trim() === '1.7.0', 'VERSION must be 1.7.0');

const lifecycle = json('registry/lifecycle.json');
req(lifecycle.currentOfficial === '1.7.0', 'currentOfficial must be 1.7.0');
req(lifecycle.currentStable === '1.7.0', 'currentStable must be 1.7.0');
req(lifecycle.currentLifecycle === 'anchor', 'currentLifecycle must be anchor');
req(lifecycle.activeCandidate === null, 'activeCandidate must be null');
req(lifecycle.plannedNext === '1.7.1', 'plannedNext must be 1.7.1');

const release = lifecycle.releases.find(item => item.version === '1.7.0');
req(release, 'lifecycle must contain 1.7.0');
req(release.status === 'stable', '1.7.0 compatibility status must be stable');
req(release.lifecycle === 'anchor', '1.7.0 canonical lifecycle must be anchor');
req(release.consumerEligible === true, '1.7.0 must be consumer eligible');
req(release.runtimeEntrypoint === 'js/glaze-v1.7.0.mjs', '1.7.0 runtime mismatch');
req(release.deferredFollowUp === 'GLAZE_V1_7_1_HARDENING.md', '1.7.1 follow-up missing');

const scope = json('contracts/v1.7/stable-scope.json');
req(scope.version === '1.7.0', 'stable scope version mismatch');
req(scope.stableBaseline === '1.6.0', 'stable baseline mismatch');
req(scope.stableRuntime.inheritedRuntime === 'js/glaze-v1.6.0.mjs', 'Stable runtime must inherit 1.6.0');
req(scope.stableRuntime.retainedDev47RuntimeIncluded === false, 'dev.47 runtime must be excluded from Stable');
req(scope.movedOutOfStableScopeCount === 21, 'exactly 21 open lanes must move to V1.7.1');
req(JSON.stringify(scope.movedOutOfStableScopeToV171) === JSON.stringify(moved), 'V1.7.1 lane transfer mismatch');
req(scope.stableClaims.dev47PrivacyBoundaryAccepted === false, 'must not claim dev.47 privacy acceptance');
req(scope.stableClaims.dev47SecurityBoundaryAccepted === false, 'must not claim dev.47 security acceptance');
req(scope.continuityPolicy.privacyOrSecurityRequirementMayBeDeferredForIncludedStableBehavior === false, 'privacy/security stable gate must remain fail-closed');

const runtime = read('js/glaze-v1.7.0.mjs');
req(runtime.includes("export * from './glaze-v1.6.0.mjs'"), 'Stable entrypoint must inherit accepted V1.6 runtime');
req(!runtime.includes("from './glaze-v1.7-development"), 'Stable entrypoint must not import V1.7 Development aggregate');
req(runtime.includes("retainedDev47RuntimeIncluded: false"), 'Stable entrypoint must disclose dev.47 exclusion');
req(runtime.includes("section48RuntimeIncluded: false"), 'Stable entrypoint must disclose Section 48 exclusion');

const successor = read('js/glaze-v1.7.1-development.mjs');
req(successor.includes("version: '1.7.1-dev.1'"), 'V1.7.1 Development identity missing');
req(successor.includes("from './glaze-v1.7-development-v1-3.dev.mjs'"), 'V1.7.1 must preserve dev.47 aggregate as Development input');

const followup = read('GLAZE_V1_7_1_HARDENING.md');
for (const name of ['Frame pacing','Privacy boundaries','Security boundaries','Section 48']) {
  req(followup.includes(name), `V1.7.1 follow-up missing ${name}`);
}

const consumers = json('consumers/registry.json');
req(consumers.officialBaseline === '1.7.0', 'consumer official baseline must be 1.7.0');
req(consumers.requiredConsumerVersion === '1.7.0', 'consumer required version must be 1.7.0');
req(consumers.consumers.every(item => item.requiredTargetVersion === '1.7.0'), 'every consumer must require 1.7.0');
req(consumers.consumers.every(item => item.productionEligible === false), 'shared Glaze promotion cannot auto-certify consumers');
req(consumers.consumers.every(item => item.status !== 'accepted-v1' || item.targetVersion === '1.7.0'), 'old accepted-v1 evidence cannot satisfy 1.7.0');

const schema = json('schemas/consumer-registry.schema.json');
req(String(schema.title).includes('Glaze V1.7'), 'consumer schema title must identify Glaze V1.7');

console.log('Glaze V1.7.0 bounded Stable authority verification: PASS');
console.log('Stable behavior: inherited accepted V1.6.0 runtime');
console.log('Transferred to V1.7.1: 21 open lanes + Section 48 Development acceptance');
