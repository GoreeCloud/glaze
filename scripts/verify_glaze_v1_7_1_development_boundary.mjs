#!/usr/bin/env node
// V1.7.1 successor Development must never acquire Stable authority from source availability.
import assert from 'node:assert/strict';
import * as historical from '../js/glaze-v1.7-development-v1-3.dev.mjs';
import * as successor from '../js/glaze-v1.7.1-development.mjs';
import * as stable from '../js/glaze-v1.7.0.mjs';

assert.ok(Object.isFrozen(successor.glazeV171Development), 'Development identity must be immutable');
const s = successor.glazeV171Development;
assert.equal(s.version, '1.7.1-dev.1');
assert.equal(s.lifecycle, 'Development');
assert.equal(s.stableBaseline, '1.7.0');
assert.equal(s.inheritedHistoricalAggregateVersion, historical.glazeV17V13Development.version);
assert.equal(s.inheritedHistoricalPlanVersion, historical.glazeV17V13Development.planVersion);
assert.equal(s.inheritedHistoricalSourceRevision, '4b9d085a5177b96cc31d4270b38d792a59872e37');
assert.equal(s.retainedDevelopmentSourceOnly, true);
assert.equal(s.section48SourceAvailable, true);
assert.equal(s.iconGlyphRegistrySourceAvailable, true);

for (const key of [
  'consumerEligible',
  'retainedEvidenceAutomaticallyRebound',
  'section48Accepted',
  'iconGlyphRegistryStableQualified',
  'iconGlyphRegistryConsumerAdoptionAutomatic',
  'releasePromotionAutomatic',
  'deploymentAcceptanceAutomatic',
  'productionAcceptanceAutomatic'
]) {
  assert.equal(s[key], false, `V1.7.1 Development unauthorized acceptance: ${key}`);
}
assert.equal(historical.glazeV17V13Development.section48Complete, false);
assert.equal(historical.glazeV17V13Development.consumerEligible, false);
for (const [key, value] of Object.entries(historical)) {
  assert.strictEqual(successor[key], value, `historical Development export drift: ${key}`);
}
assert.equal(stable.glazeV170.version, '1.7.0');
assert.equal(stable.glazeV170.retainedDev47RuntimeIncluded, false);
assert.equal(stable.glazeV170.section48RuntimeIncluded, false);
assert.ok(!('glazeV171Development' in stable), 'Development metadata leaked into Stable');

console.log('PASS: Glaze V1.7.1 Development provenance, export identity and fail-closed authority');
