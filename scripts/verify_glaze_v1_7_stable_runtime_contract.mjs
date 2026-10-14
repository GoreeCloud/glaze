#!/usr/bin/env node
// Glaze V1.7.0: executable, fail-closed Stable-to-V1.6 compatibility regression.
// This checks exported behavior identity; textual checks live in verify_glaze_v1_7_stable.mjs.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import * as baseline from '../js/glaze-v1.6.0.mjs';
import * as stable from '../js/glaze-v1.7.0.mjs';

const baselineFile = fileURLToPath(new URL('../js/glaze-v1.6.0.mjs', import.meta.url));
const bytes = readFileSync(baselineFile);
const blobSha = createHash('sha1')
  .update(`blob ${bytes.length}\0`)
  .update(bytes)
  .digest('hex');
assert.equal(
  blobSha,
  '7dfc863d6c39def97c263de80b21b73efe54db1e',
  'The accepted V1.6.0 entrypoint bytes changed; requalify rather than silently altering V1.7.0'
);

// These direct V1.6 modules exactly match the published V1.6.0 release-source
// revision a7180679ea851389e0f3004515f9a25f420e716d. The Stable entrypoint
// is separately pinned above because it was produced after that source revision.
const acceptedV16SourceBlobs = Object.freeze({
  "glaze-v1.6-development.mjs": "e1e1e96afe051f2cb9b6e3c5817f65c65d37f68a",
  "glaze-v1.6-loading.dev.mjs": "8e0ab678ace5ca7dfec4e472973f73e6bb81fce3",
  "glaze-v1.6-state-accessibility.dev.mjs": "701d9dad505fc958351cae3ed3e9368b96f63ccd",
  "glaze-v1.6-focus-motion.dev.mjs": "661a3821a43af490eaaa63d2bf9095ec9048ea62",
  "glaze-v1.6-material-type-input.dev.mjs": "df40130fd76ede1edb172ec441ef2e8a405c081b",
  "glaze-v1.6-resilience-feedback.dev.mjs": "df716c160dc76beeba47a18197be4af6c584e419",
  "glaze-v1.6-navigation-status.dev.mjs": "6670c6fcdaefae88d71cbea2c0087a1b9cc76fdf",
  "glaze-v1.6-component-systems.dev.mjs": "0e0ccad5ce8df9a7c2e93db50e38acb7166ca875",
  "glaze-v1.6-experience-governance.dev.mjs": "35dd6fb924e269d5bcc41f537c236c5adbcd260c",
  "glaze-v1.6-performance-diagnostics.dev.mjs": "318aba55119295cc5ae1bfe643689b4f2307c1d9",
  "glaze-v1.6-conformance-adoption.dev.mjs": "022bbfef7eb43a2464013f16d806d6b27e44fe97",
  "glaze-v1.6-acceptance.dev.mjs": "a72a23b4a7176e4d2a816fa6bac1eb740162f148"
});
const gitBlobSha = bytes => createHash('sha1')
  .update(`blob ${bytes.length}\\0`)
  .update(bytes)
  .digest('hex');
for (const [name, expectedSha] of Object.entries(acceptedV16SourceBlobs)) {
  const bytes = readFileSync(fileURLToPath(new URL(`../js/${name}`, import.meta.url)));
  assert.equal(gitBlobSha(bytes), expectedSha, `Published V1.6 source drift: ${name}`);
}
const aggregateSource = readFileSync(
  fileURLToPath(new URL('../js/glaze-v1.6-development.mjs', import.meta.url)), 'utf8'
);
const inheritedSources = [...aggregateSource.matchAll(/export\\s+\\*\\s+from\\s+['"]\\.\\/(glaze-v1\\.6-[^'"]+\\.dev\\.mjs)['"]/g)]
  .map(match => match[1]).sort();
assert.deepEqual(inheritedSources, Object.keys(acceptedV16SourceBlobs)
  .filter(name => name !== 'glaze-v1.6-development.mjs').sort(),
  'V1.6 Development aggregate introduced or removed an unpinned direct runtime dependency');

const expected = [...Object.keys(baseline), 'glazeV170', 'glazeV17'].sort();
assert.deepEqual(
  Object.keys(stable).sort(),
  expected,
  'V1.7.0 must expose exactly the inherited V1.6 exports plus the bounded release identity'
);
for (const name of Object.keys(baseline)) {
  assert.strictEqual(stable[name], baseline[name], `V1.6 export identity drift: ${name}`);
}

assert.strictEqual(stable.glazeV17, stable.glazeV170);
assert.ok(Object.isFrozen(stable.glazeV170));
const identity = stable.glazeV170;
assert.equal(identity.version, '1.7.0');
assert.equal(identity.canonicalLifecycle, 'anchor');
assert.equal(identity.stableBaseline, '1.6.0');
assert.equal(identity.inheritedStableRuntime, 'js/glaze-v1.6.0.mjs');
assert.equal(identity.newPresentationBehaviorIncluded, false);
for (const key of [
  'retainedDev47RuntimeIncluded',
  'section48RuntimeIncluded',
  'authorizationInferred',
  'permissionRequestAutomatic',
  'automaticNavigationAllowed',
  'consequentialExecutionAutomatic',
  'fallbackExecutionAutomatic',
  'downstreamConsumerAcceptanceAutomatic',
  'deploymentAcceptanceAutomatic',
  'productionAcceptanceAutomatic',
  'publicationAutomatic'
]) {
  assert.equal(identity[key], false, `V1.7.0 Stable authority expanded: ${key}`);
}
assert.ok(!('glazeV171Development' in stable), 'V1.7.1 Development leaked into Stable');
console.log('PASS: Glaze V1.7.0 exact V1.6.0 entrypoint and runtime export-identity regression');
