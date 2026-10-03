#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const json = path => JSON.parse(read(path));

const VERSION = '1.6.0';
const RC = '1.6.0-rc.1';
const ROLLBACK = '1.5.1';
const QUALIFIED = 'c7509c79256b04b0aa67cb9dd0737d7588e0ae4a';
const QUALIFICATION_INTEGRATION = '354f5759385c28596fcfec26a3ad525e89fb1c35';
const RELEASE_SOURCE = 'a7180679ea851389e0f3004515f9a25f420e716d';
const RELEASE_TREE = '9ff0bf7a5f9d64f109d99bf4b76b81bd2a162268';
const PUBLICATION_CONTROL = '7e8b537b9d1a123bc3e92679774a4d9cc704e03b';

const currentVersion = read('VERSION').trim();
assert.match(currentVersion, /^\d+\.\d+\.\d+$/);

const lifecycle = json('registry/lifecycle.json');
assert.equal(lifecycle.currentOfficial, currentVersion);
assert.equal(lifecycle.currentStable, currentVersion);
assert.equal(lifecycle.currentLifecycle, 'anchor');
assert.equal(lifecycle.lifecycleVocabulary, 'goreecloud-release-lifecycle/v0.7');
assert.equal(lifecycle.activeCandidate, null);
const currentRelease = lifecycle.releases.find(item => item.version === currentVersion);
assert.ok(currentRelease, 'missing current Stable/Anchor lifecycle record');
assert.equal(currentRelease.status, 'stable');
assert.equal(currentRelease.lifecycle, 'anchor');
assert.equal(currentRelease.consumerEligible, true);
assert.equal(lifecycle.officialProductLabel, currentRelease.label);

const stable = lifecycle.releases.find(item => item.version === VERSION);
assert.ok(stable);
assert.equal(stable.status, 'stable');
assert.equal(stable.lifecycle, 'anchor');
assert.equal(stable.consumerEligible, true);
assert.equal(stable.stableBaseline, ROLLBACK);
assert.equal(stable.contract, 'contracts/v1.6/stable-release.json');
assert.equal(stable.acceptance, 'acceptance/v1.6-stable.json');
assert.equal(stable.runtimeEntrypoint, 'js/glaze-v1.6.0.mjs');
assert.equal(stable.sourceQualificationAnchor, QUALIFIED);
assert.equal(stable.qualificationEvidenceIntegrationCommit, QUALIFICATION_INTEGRATION);
assert.equal(stable.acceptedReleaseSource, RELEASE_SOURCE);
assert.equal(stable.acceptedReleaseTree, RELEASE_TREE);
assert.equal(stable.publicationControlCommit, PUBLICATION_CONTROL);
assert.equal(stable.tag, 'v1.6.0');
assert.equal(stable.githubReleaseId, 392095913);

const rc = lifecycle.releases.find(item => item.version === RC);
assert.ok(rc);
assert.equal(rc.status, 'superseded-release-candidate');
assert.equal(rc.consumerEligible, false);
assert.equal(rc.sourceQualificationAnchor, QUALIFIED);

const anchorReview = json('acceptance/v1.6-anchor-reclassification-review.json');
assert.equal(anchorReview.decision, 'approved-for-anchor-reclassification');
assert.equal(anchorReview.canonicalLifecycle, 'anchor');
assert.equal(anchorReview.qualificationState, 'passed');
assert.deepEqual(anchorReview.blockers, []);
assert.equal(anchorReview.exactReleaseIdentity.acceptedReleaseSource, RELEASE_SOURCE);
assert.equal(anchorReview.exactReleaseIdentity.acceptedReleaseTree, RELEASE_TREE);

const review = json('acceptance/v1.6-stable-qualification-review.json');
assert.equal(review.targetStableVersion, VERSION);
assert.equal(review.decision, 'approved-for-stable-promotion');
assert.equal(review.stablePromotionAuthorized, true);
assert.equal(review.consumerEligibilityGranted, true);
assert.equal(review.requiredLifecycleState, 'Stable');
assert.equal(review.remainingBlockerCount, 0);
assert.deepEqual(review.blockers, []);
assert.equal(review.source.acceptedReleaseSource, RELEASE_SOURCE);
assert.equal(review.source.acceptedReleaseTree, RELEASE_TREE);
assert.equal(review.source.publicationControlCommit, PUBLICATION_CONTROL);
assert.equal(review.source.publishedTag, 'v1.6.0');
assert.equal(review.source.githubReleaseId, 392095913);

const qualification = json('acceptance/v1.6-qualification-review.json');
assert.equal(qualification.evidenceMatrix.laneCount, 24);
assert.equal(qualification.evidenceMatrix.verifiedCount, 24);
assert.equal(qualification.evidenceMatrix.unverifiedCount, 0);
assert.equal(qualification.evidenceMatrix.notApplicableCount, 0);
assert.deepEqual(qualification.evidenceMatrix.blockingLaneIds, []);

const security = json('acceptance/v1.6-stable-security-review.json');
assert.equal(security.overallDecision, 'passed');
assert.equal(security.stableSecurityAcceptanceGranted, true);
assert.equal(security.stablePromotionAuthorized, false);
assert.deepEqual(security.remainingReleaseSecurityBlockers, []);
assert.equal(security.finalArtifactSourceProvenance.acceptedSourceRevision, RELEASE_SOURCE);
assert.equal(security.finalArtifactSourceProvenance.releasedBytesMatchSecurityAcceptedBytes, true);
assert.equal(security.stablePromotionAuthorized, false);
assert.equal(security.controlApplicability.evaluatedControlCount, 39);
assert.equal(security.controlApplicability.passedOrBoundedPassedCount, 14);
assert.equal(security.controlApplicability.notApplicableJustifiedCount, 25);
assert.equal(security.controlApplicability.blockedCount, 0);
assert.equal(security.controlApplicability.unknownCount, 0);
assert.equal(security.controlApplicability.exceptedCount, 0);
assert.deepEqual(security.controlApplicability.exceptions, []);

assert.equal(security.controlApplicability.evaluatedControlCount,39);
assert.equal(security.controlApplicability.passedOrBoundedPassedCount,14);
assert.equal(security.controlApplicability.notApplicableJustifiedCount,25);
assert.equal(security.controlApplicability.blockedCount,0);
assert.equal(security.controlApplicability.unknownCount,0);
assert.equal(security.controlApplicability.exceptedCount,0);
assert.deepEqual(security.controlApplicability.exceptions,[]);
assert.equal(security.controlApplicability.controls.length,39);

const finalSecurity = json('acceptance/v1.6-final-security-acceptance.json');
assert.equal(finalSecurity.decision, 'passed-for-controlled-publication');
assert.equal(finalSecurity.stableSecurityAcceptanceGranted, true);
assert.equal(finalSecurity.publicationAuthorized, true);
assert.equal(finalSecurity.acceptedSource.revision, RELEASE_SOURCE);
assert.equal(finalSecurity.acceptedSource.tree, RELEASE_TREE);
assert.equal(finalSecurity.acceptedArtifact.archive.sha256, '687268b5eb76917eccae9d935ffa1bead333d5dee50b6098e996a3f44cee50af');
assert.equal(finalSecurity.acceptedArtifact.sbom.sha256, '3ffbb8bfe372d20642cd58f34fc0faaec2a74657d90e10742b75c5adf52dde82');
assert.equal(finalSecurity.acceptedArtifact.provenance.sha256, '711b58d5854085fb104dbae8bb5e7f7cfe4e8846e2e1fb314441c5212821ddd8');

const artifact = json('acceptance/v1.6-artifact-provenance-plan.json');
assert.equal(artifact.status, 'completed-controlled-publication-readback');
assert.equal(artifact.decision, 'completed-controlled-publication-readback');
assert.deepEqual(artifact.unresolvedPrerequisites, []);
assert.equal(artifact.finalArtifact.archiveSha256, '687268b5eb76917eccae9d935ffa1bead333d5dee50b6098e996a3f44cee50af');
assert.equal(artifact.publication.result, 'passed');
assert.equal(artifact.publication.tag, 'v1.6.0');
assert.equal(artifact.publication.tagTargetRevision, RELEASE_SOURCE);
assert.equal(artifact.publication.githubReleaseId, 392095913);
assert.equal(artifact.publication.githubReleasePlatformImmutableFlag, false);
assert.equal(artifact.publication.releasedBytesMatchSecurityAcceptedBytes, true);

const drive = json('acceptance/v1.6-drive-document-reconciliation.json');
assert.equal(drive.decision, 'passed-current-promotion-ready');
assert.equal(drive.taskRecord.sha256, 'eaf98db0b43650059ded5173925dc16f1bc174a6e33674f4aec20158edd232e4');
assert.equal(drive.changeLogRecord.sha256, '9d8cc11374ca7bee8c743eb46680ca7a5dc866004fca6a07fa8287925d8d552c');
assert.equal(drive.taskRecord.structuralVerification.protectedLifecyclePromotionPendingPresent, true);
assert.equal(drive.changeLogRecord.structuralVerification.protectedLifecyclePromotionPendingPresent, true);

const applicability = json('acceptance/v1.6-production-applicability.json');
assert.equal(applicability.componentBoundary.type, 'shared-library');
assert.equal(applicability.deploymentApplicability.directProductionDeploymentRequired, false);
assert.equal(applicability.currentDisposition.publicationAcceptanceCompleted, true);
assert.equal(applicability.currentDisposition.finalArtifactAccepted, true);
assert.equal(applicability.currentDisposition.productionAcceptanceGrantedForSharedLibraryPublicationBoundary, true);
assert.equal(applicability.currentDisposition.stablePromotionAuthorized, true);

const acceptance = json('acceptance/v1.6-stable.json');
assert.equal(acceptance.version, VERSION);
assert.equal(acceptance.decision, 'approved-for-stable-promotion');
assert.equal(acceptance.stablePromotionAuthorized, true);
assert.equal(acceptance.consumerEligible, true);
assert.equal(acceptance.releaseSource.revision, RELEASE_SOURCE);
assert.equal(acceptance.releaseSource.tree, RELEASE_TREE);
assert.equal(acceptance.publication.tag, 'v1.6.0');
assert.equal(acceptance.publication.githubReleaseId, 392095913);
assert.equal(acceptance.publication.githubReleasePlatformImmutableFlag, false);
assert.equal(acceptance.publication.releasedBytesMatchSecurityAcceptedBytes, true);

const stableContract = json('contracts/v1.6/stable-release.json');
assert.equal(stableContract.version, VERSION);
assert.equal(stableContract.releaseLifecycle, 'Stable');
assert.equal(stableContract.consumerEligible, true);
assert.equal(stableContract.stableBaseline, ROLLBACK);
assert.equal(stableContract.runtimeEntrypoint, 'js/glaze-v1.6.0.mjs');
assert.equal(stableContract.sourceQualificationAnchor, QUALIFIED);

const runtime = read('js/glaze-v1.6.0.mjs');
for (const token of [
  "version: '1.6.0'",
  "lifecycle: 'stable'",
  "stableBaseline: '1.5.1'",
  'verifiedQualificationLanes: 24',
  'consumerEligible: true',
  'presentationOnly: true',
  'authorizationInferred: false',
  'permissionRequestAutomatic: false',
  'automaticNavigationAllowed: false',
  'consequentialExecutionAutomatic: false',
  'fallbackExecutionAutomatic: false',
  'downstreamConsumerAcceptanceAutomatic: false'
]) assert.ok(runtime.includes(token), `Stable runtime missing token: ${token}`);

const consumers = json('consumers/registry.json');
assert.equal(consumers.officialBaseline, currentVersion);
assert.equal(consumers.requiredConsumerVersion, currentVersion);
assert.equal(consumers.officialProductLabel, lifecycle.officialProductLabel);
assert.ok(consumers.consumers.every(item => item.requiredTargetVersion === currentVersion));
assert.ok(consumers.consumers.every(item => item.productionEligible === false));

const manifest = read('goreecloud.platform.yaml');
assert.ok(manifest.includes('schema_version: "2.0"'));
assert.ok(manifest.includes('lifecycle: anchor'));
assert.ok(manifest.includes('qualification_state: passed'));
assert.ok(manifest.includes('goreecloud-platform-contract==2.0'));
assert.ok(manifest.includes(`version: ${currentVersion}`));
assert.ok(manifest.includes('status: conformant'));
assert.ok(manifest.includes('result: published'));
assert.ok(manifest.includes('id: v1.6.0'));
assert.ok(manifest.includes('version: 1.6.0'));

console.log('GLAZE UI V1.6.0 retained Stable/Anchor integrity: PASS');
console.log(`Qualification: 24/24; release source: ${RELEASE_SOURCE}; rollback: ${ROLLBACK}`);
console.log('Final security, controlled publication, and post-publication byte readback: PASS');
console.log('Downstream consumer production acceptance automatic: false');
