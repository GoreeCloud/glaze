#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const json = path => JSON.parse(read(path));

const REVIEWED='ee1032a0822ab8e103f8afe48e5c1859fde65cc9';
const QUALIFIED='5b59d0e36950d737dba35b58ae58058684e0831b';
const QI='f7ef915f0aabea6cf92748018f2220a99e3a9c92';
const RC='a9c93506dd062d29c6c894940b71d060e8c39110';

const lifecycle=json('registry/lifecycle.json');
const liveVersion=read('VERSION').trim();
assert.equal(lifecycle.currentOfficial,liveVersion);
assert.equal(lifecycle.currentStable,liveVersion);
const liveRelease=lifecycle.releases.find(item=>item.version===liveVersion);
assert.ok(liveRelease);
assert.equal(liveRelease.status,'stable');
assert.equal(liveRelease.consumerEligible,true);

const v151=lifecycle.releases.find(item=>item.version==='1.5.1');
assert.ok(v151);
assert.equal(v151.status,'stable');
assert.equal(v151.consumerEligible,true);
assert.equal(v151.stableBaseline,'1.5.0');
assert.equal(v151.contract,'GLAZE_UI_V1_5.md');
assert.equal(v151.qualification,'contracts/v1.5.1/stable-scope.json');
assert.equal(v151.acceptance,'acceptance/v1.5.1-stable.md');
assert.equal(v151.runtimeEntrypoint,'js/glaze-v1.5.1.mjs');
assert.equal(v151.sourceQualificationAnchor,QUALIFIED);
assert.equal(v151.qualificationIntegrationCommit,QI);
assert.equal(v151.releaseCandidateIntegrationCommit,RC);

const scope=json('contracts/v1.5.1/stable-scope.json');
assert.equal(scope.version,'1.5.1');
assert.equal(scope.releaseLifecycle,'Stable');
assert.equal(scope.stableBaseline,'1.5.0');
assert.equal(scope.consumerEligible,true);
assert.equal(scope.reviewedImplementationAnchor,REVIEWED);
assert.equal(scope.sourceQualificationAnchor,QUALIFIED);
assert.equal(scope.qualificationIntegrationCommit,QI);
assert.equal(scope.releaseCandidateIntegrationCommit,RC);
assert.equal(scope.runtimeEntrypoint,'js/glaze-v1.5.1.mjs');
assert.equal(scope.qualification.totalAcceptedObligationCount,18);
assert.equal(scope.stableClaims.downstreamConsumerAcceptanceAutomatic,false);

const runtime=read('js/glaze-v1.5.1.mjs');
for(const token of [
  "export * from './glaze-v1.5.0.mjs'",
  "version: '1.5.1'",
  "lifecycle: 'stable'",
  "stableBaseline: '1.5.0'",
  'qualifiedStabilizationObligations: 18',
  'authorizationInferred: false',
  'permissionRequestAutomatic: false',
  'automaticNavigationAllowed: false',
  'consequentialExecutionAutomatic: false',
  'fallbackExecutionAutomatic: false',
  'downstreamConsumerAcceptanceAutomatic: false'
]) assert.ok(runtime.includes(token), `V1.5.1 retained runtime missing token: ${token}`);

const acceptance=read('acceptance/v1.5.1-stable.md');
for(const token of [REVIEWED,QUALIFIED,QI,RC,'5697516074','5705230782','GCU-ADR-GLAZE-V151-POSTURE-TR-001']) {
  assert.ok(acceptance.includes(token), `V1.5.1 retained acceptance missing provenance ${token}`);
}

const consumers=json('consumers/registry.json');
assert.equal(consumers.officialBaseline,liveVersion);
assert.equal(consumers.requiredConsumerVersion,liveVersion);
assert.ok(consumers.consumers.every(item=>item.requiredTargetVersion===liveVersion));
assert.ok(consumers.consumers.every(item=>item.productionEligible===false));

console.log('GLAZE UI V1.5.1 retained Stable integrity: PASS');
console.log(`V1.5.1 retained Stable integrity is preserved; current authority is ${liveVersion}.`);
