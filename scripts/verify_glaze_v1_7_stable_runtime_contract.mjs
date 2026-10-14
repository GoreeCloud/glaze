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
