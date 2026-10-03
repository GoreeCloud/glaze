import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {glazeV17AcceptanceDevelopmentContract} from '../js/glaze-v1.7-acceptance.dev.mjs';
import {V13_SECTION48_QUALIFICATION_LANES} from '../js/glaze-v1.7-v1-3-qualification.dev.mjs';

const root=new URL('../',import.meta.url);
const plan=JSON.parse(readFileSync(new URL('contracts/v1.7/qualification.v1.3.provenance.plan.json',root),'utf8'));

assert.equal(plan.schemaVersion,1);
assert.equal(plan.planId,'goreecloud.glaze.v1.7.v1.3.provenance-qualification');
assert.equal(plan.lifecycle,'DevelopmentQualification');
assert.equal(plan.sourceRevision,'4b9d085a5177b96cc31d4270b38d792a59872e37');
assert.equal(plan.acceptanceModelVersion,'1.7.0-dev.47');
assert.equal(plan.stableBaseline,'1.6.0');
assert.equal(plan.consumerEligible,false);
assert.equal(plan.networkPolicy,'repository-local-only');
assert.equal(plan.archiveName,'glaze-v1.7.0-dev.47-source-qualification.tar.gz');
assert.equal(plan.deterministicDoubleBuildRequired,true);
assert.equal(plan.publishesTag,false);
assert.equal(plan.publishesGithubRelease,false);
assert.deepEqual(plan.evidenceLanes.v12,['artifact-provenance']);
assert.deepEqual(plan.evidenceLanes.section48,['artifact-provenance-v13']);

const v12=glazeV17AcceptanceDevelopmentContract.acceptanceLanes.find(lane=>lane.id==='artifact-provenance');
assert.ok(v12);
assert.ok(v12.evidenceTypes.includes('provenance'));
const v13=V13_SECTION48_QUALIFICATION_LANES.find(lane=>lane.id==='artifact-provenance-v13');
assert.ok(v13);
assert.ok(v13.evidenceTypes.includes('provenance'));

assert.equal(plan.authority.provenanceEvidenceOnly,true);
for(const key of [
  'renderedEvidenceClaimed','humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed',
  'deviceEvidenceClaimed','providerIntegrationEvidenceClaimed','privacySecurityIntegrationEvidenceClaimed',
  'performanceEvidenceClaimed','energyEvidenceClaimed','section48AcceptanceClaimed',
  'v17AcceptanceClaimed','anchorStatusGranted','lifecyclePromotionAutomatic','publicationAuthorized'
]){
  assert.equal(plan.authority[key],false,key);
}

console.log('Glaze V1.7 dev.47 provenance qualification plan validation: PASS');
console.log('Provenance lanes: v1.2 artifact-provenance + v1.3 artifact-provenance-v13');
