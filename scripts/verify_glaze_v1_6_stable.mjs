#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));

const VERSION='1.6.0';
const RC='1.6.0-rc.1';
const ROLLBACK='1.5.1';
const QUALIFIED='c7509c79256b04b0aa67cb9dd0737d7588e0ae4a';
const EVIDENCE_INTEGRATION='354f5759385c28596fcfec26a3ad525e89fb1c35';
const ACCEPTED_SOURCE='a7180679ea851389e0f3004515f9a25f420e716d';
const ACCEPTED_TREE='9ff0bf7a5f9d64f109d99bf4b76b81bd2a162268';
const PUBLICATION_CONTROL='7e8b537b9d1a123bc3e92679774a4d9cc704e03b';
const TAG='v1.6.0';
const RELEASE_ID=392095913;
const ARCHIVE_SHA='687268b5eb76917eccae9d935ffa1bead333d5dee50b6098e996a3f44cee50af';
const SBOM_SHA='3ffbb8bfe372d20642cd58f34fc0faaec2a74657d90e10742b75c5adf52dde82';
const PROVENANCE_SHA='711b58d5854085fb104dbae8bb5e7f7cfe4e8846e2e1fb314441c5212821ddd8';

const currentVersion=read('VERSION').trim();
assert.match(currentVersion,/^\d+\.\d+\.\d+$/);
const lifecycle=json('registry/lifecycle.json');
assert.equal(lifecycle.currentOfficial,currentVersion);
assert.equal(lifecycle.currentStable,currentVersion);
assert.equal(lifecycle.currentLifecycle,'anchor');
assert.equal(lifecycle.lifecycleVocabulary,'goreecloud-release-lifecycle/v0.7');
assert.equal(lifecycle.activeCandidate,null);
const currentRelease=lifecycle.releases.find(item=>item.version===currentVersion);
assert.ok(currentRelease,'missing current Stable/Anchor lifecycle record');
assert.equal(currentRelease.status,'stable');
assert.equal(currentRelease.lifecycle,'anchor');
assert.equal(currentRelease.consumerEligible,true);
assert.equal(lifecycle.officialProductLabel,currentRelease.label);

const stable=lifecycle.releases.find(item=>item.version===VERSION);
assert.ok(stable,'missing 1.6.0 lifecycle record');
assert.equal(stable.status,'stable');
assert.equal(stable.lifecycle,'anchor');
assert.equal(stable.consumerEligible,true);
assert.equal(stable.stableBaseline,ROLLBACK);
assert.equal(stable.contract,'contracts/v1.6/stable-release.json');
assert.equal(stable.qualification,'acceptance/v1.6-stable-qualification-review.json');
assert.equal(stable.acceptance,'acceptance/v1.6-stable.json');
assert.equal(stable.runtimeEntrypoint,'js/glaze-v1.6.0.mjs');
assert.equal(stable.sourceQualificationAnchor,QUALIFIED);
assert.equal(stable.qualificationEvidenceIntegrationCommit,EVIDENCE_INTEGRATION);
assert.equal(stable.acceptedReleaseSource,ACCEPTED_SOURCE);
assert.equal(stable.acceptedReleaseTree,ACCEPTED_TREE);
assert.equal(stable.publicationControlCommit,PUBLICATION_CONTROL);
assert.equal(stable.tag,TAG);
assert.equal(stable.githubReleaseId,RELEASE_ID);
assert.equal(stable.artifactSha256,ARCHIVE_SHA);

const rc=lifecycle.releases.find(item=>item.version===RC);
assert.ok(rc,'missing retained V1.6 RC provenance');
assert.equal(rc.status,'superseded-release-candidate');
assert.equal(rc.consumerEligible,false);
assert.equal(rc.sourceQualificationAnchor,QUALIFIED);
assert.equal(rc.qualificationEvidenceIntegrationCommit,EVIDENCE_INTEGRATION);

const anchorReview=json('acceptance/v1.6-anchor-reclassification-review.json');
assert.equal(anchorReview.decision,'approved-for-anchor-reclassification');
assert.equal(anchorReview.canonicalLifecycle,'anchor');
assert.equal(anchorReview.qualificationState,'passed');
assert.deepEqual(anchorReview.blockers,[]);
assert.equal(anchorReview.exactReleaseIdentity.acceptedReleaseSource,ACCEPTED_SOURCE);
assert.equal(anchorReview.exactReleaseIdentity.artifactSha256,ARCHIVE_SHA);
assert.equal(anchorReview.livePublicationReadback.tagResolvedToAcceptedSource,true);
assert.equal(anchorReview.livePublicationReadback.assetDigestsMatchRetainedAcceptance,true);

const acceptance=json('acceptance/v1.6-stable.json');
assert.equal(acceptance.decision,'approved-for-stable-promotion');
assert.equal(acceptance.stablePromotionAuthorized,true);
assert.equal(acceptance.consumerEligible,true);
assert.equal(acceptance.qualification.verifiedCount,24);
assert.equal(acceptance.qualification.unverifiedCount,0);
assert.equal(acceptance.qualification.notApplicableCount,0);
assert.equal(acceptance.releaseSource.revision,ACCEPTED_SOURCE);
assert.equal(acceptance.releaseSource.tree,ACCEPTED_TREE);
assert.equal(acceptance.publication.tag,TAG);
assert.equal(acceptance.publication.githubReleaseId,RELEASE_ID);
assert.equal(acceptance.publication.releasedBytesMatchSecurityAcceptedBytes,true);
assert.equal(acceptance.publication.assets['glaze-ui-v1.6.0-source-runtime.tar.gz'],'sha256:'+ARCHIVE_SHA);
assert.equal(acceptance.publication.assets['cyclonedx-1.5.json'],'sha256:'+SBOM_SHA);
assert.equal(acceptance.publication.assets['provenance.json'],'sha256:'+PROVENANCE_SHA);
assert.equal(acceptance.productionBoundary.directServiceDeploymentApplicable,false);
assert.equal(acceptance.productionBoundary.publicationAcceptanceCompleted,true);

const qualification=json('acceptance/v1.6-stable-qualification-review.json');
assert.equal(qualification.decision,'approved-for-stable-promotion');
assert.equal(qualification.stablePromotionAuthorized,true);
assert.equal(qualification.consumerEligibilityGranted,true);
assert.equal(qualification.requiredLifecycleState,'Stable');
assert.equal(qualification.remainingBlockerCount,0);
assert.deepEqual(qualification.blockers,[]);
assert.ok(qualification.verifiedPasses.some(item=>item.id==='security.release-security-acceptance'&&item.status==='passed'));
assert.ok(qualification.verifiedPasses.some(item=>item.id==='release.artifact-provenance-and-publication-boundary'&&item.status==='passed'));

const security=json('acceptance/v1.6-stable-security-review.json');
assert.equal(security.overallDecision,'passed');
assert.equal(security.stableSecurityAcceptanceGranted,true);
assert.deepEqual(security.remainingReleaseSecurityBlockers,[]);
assert.equal(security.dependencySupplyChain.advisoryCount,0);
assert.equal(security.dependencySupplyChain.cyclonedxVulnerabilityCount,0);
assert.equal(security.finalArtifactSourceProvenance.acceptedSourceRevision,ACCEPTED_SOURCE);
assert.equal(security.finalArtifactSourceProvenance.releasedBytesMatchSecurityAcceptedBytes,true);

const finalSecurity=json('acceptance/v1.6-final-security-acceptance.json');
assert.equal(finalSecurity.decision,'passed-for-controlled-publication');
assert.equal(finalSecurity.stableSecurityAcceptanceGranted,true);
assert.equal(finalSecurity.stablePromotionAuthorized,false);
assert.equal(finalSecurity.acceptedSource.revision,ACCEPTED_SOURCE);
assert.equal(finalSecurity.acceptedArtifact.archive.sha256,ARCHIVE_SHA);
assert.equal(finalSecurity.acceptedArtifact.sbom.sha256,SBOM_SHA);
assert.equal(finalSecurity.acceptedArtifact.provenance.sha256,PROVENANCE_SHA);

const drive=json('acceptance/v1.6-drive-document-reconciliation.json');
assert.equal(drive.decision,'passed-current-promotion-ready');
assert.equal(drive.taskRecord.driveFileId,'1sluzc6yiRlRlLf71JjFqUowM6ZC4amcy');
assert.equal(drive.taskRecord.sha256,'eaf98db0b43650059ded5173925dc16f1bc174a6e33674f4aec20158edd232e4');
assert.equal(drive.taskRecord.pageCount,76);
assert.equal(drive.taskRecord.structuralVerification.stableQualificationZeroBlockersPresent,true);
assert.equal(drive.taskRecord.structuralVerification.protectedLifecyclePromotionPendingPresent,true);
assert.equal(drive.taskRecord.structuralVerification.historicalRevisionSetPreserved,true);
assert.equal(drive.taskRecord.structuralVerification.staleBlockedStableFrontMatterRemoved,true);
assert.equal(drive.changeLogRecord.driveFileId,'1p1PTyUeQ2Ht4tzibAATmrEuVctyLs8up');
assert.equal(drive.changeLogRecord.sha256,'9d8cc11374ca7bee8c743eb46680ca7a5dc866004fca6a07fa8287925d8d552c');
assert.equal(drive.changeLogRecord.pageCount,235);
assert.equal(drive.changeLogRecord.structuralVerification.stableQualificationZeroBlockersPresent,true);
assert.equal(drive.changeLogRecord.structuralVerification.protectedLifecyclePromotionPendingPresent,true);
assert.equal(drive.changeLogRecord.structuralVerification.historicalChangeHistoryRetained,true);
assert.equal(drive.changeLogRecord.structuralVerification.staleBlockedStableFrontMatterRemoved,true);

assert.equal(security.controlApplicability.evaluatedControlCount,39);
assert.equal(security.controlApplicability.passedOrBoundedPassedCount,14);
assert.equal(security.controlApplicability.notApplicableJustifiedCount,25);
assert.equal(security.controlApplicability.blockedCount,0);
assert.equal(security.controlApplicability.unknownCount,0);
assert.equal(security.controlApplicability.exceptedCount,0);
assert.deepEqual(security.controlApplicability.exceptions,[]);
assert.equal(security.controlApplicability.controls.length,39);
assert.ok(security.controlApplicability.controls.every(item =>
  item.result==='passed' || item.result==='passed-bounded' || item.result==='not-applicable-justified'
));
assert.ok(security.controlApplicability.controls
  .filter(item=>item.result==='not-applicable-justified')
  .every(item=>typeof item.justification==='string' && item.justification.length>20));

const applicability=json('acceptance/v1.6-production-applicability.json');
assert.equal(applicability.deploymentApplicability.result,'not-applicable-justified');
assert.equal(applicability.productionAcceptanceApplicability.result,'passed-at-controlled-publication-boundary');
assert.equal(applicability.currentDisposition.publicationAcceptanceCompleted,true);
assert.equal(applicability.currentDisposition.finalArtifactAccepted,true);
assert.equal(applicability.currentDisposition.directServiceDeploymentAcceptanceRequired,false);

const contract=json('contracts/v1.6/stable-release.json');
assert.equal(contract.version,VERSION);
assert.equal(contract.releaseLifecycle,'Stable');
assert.equal(contract.consumerEligible,true);
assert.equal(contract.sourceQualificationAnchor,QUALIFIED);
assert.equal(contract.qualificationEvidenceIntegrationCommit,EVIDENCE_INTEGRATION);
assert.equal(contract.rollback.knownGoodStable,ROLLBACK);
assert.equal(contract.authority.effectiveOnlyAfterImmutablePublicationReadback,true);
assert.equal(contract.authority.effectiveOnlyAfterRepositoryLifecyclePromotion,true);

const runtime=read('js/glaze-v1.6.0.mjs');
for(const token of [
  "export * from './glaze-v1.6-development.mjs'",
  "version: '1.6.0'",
  "lifecycle: 'stable'",
  "stableBaseline: '1.5.1'",
  "releaseCandidateSource: '1.6.0-rc.1'",
  QUALIFIED,
  EVIDENCE_INTEGRATION,
  'qualificationEvidenceComplete: true',
  'verifiedQualificationLanes: 24',
  'consumerEligible: true',
  'presentationOnly: true',
  'activationRequiresImmutablePublicationReadback: true',
  'activationRequiresRepositoryLifecyclePromotion: true'
]) assert.ok(runtime.includes(token),'Stable runtime identity missing: '+token);
assert.ok(!/resolveGlaze[A-Za-z0-9_]*\s*\(/.test(runtime),'Stable identity wrapper must not add resolver behavior');

const consumers=json('consumers/registry.json');
assert.equal(consumers.officialBaseline,currentVersion);
assert.equal(consumers.requiredConsumerVersion,currentVersion);
assert.equal(consumers.officialProductLabel,lifecycle.officialProductLabel);
assert.ok(consumers.consumers.length>0);
assert.ok(consumers.consumers.every(item=>item.requiredTargetVersion===currentVersion));
assert.ok(consumers.consumers.every(item=>item.productionEligible===false));
assert.ok(consumers.consumers.every(item=>['adoption-required','unverified','accepted-v1'].includes(item.status)));
for(const item of consumers.consumers){
  if(item.status==='accepted-v1'){
    assert.equal(item.targetVersion,currentVersion);
    assert.match(item.referenceRevision,/^[0-9a-f]{40}$/);
    assert.ok(typeof item.evidence==='string'&&item.evidence.length>0);
  }
}

const sourcePaths=[
  'GLAZE_UI_V1_6_PLANNED.md',
  'js/glaze-v1.6-development.mjs',
  'js/glaze-v1.6-loading.dev.mjs',
  'js/glaze-v1.6-state-accessibility.dev.mjs',
  'js/glaze-v1.6-focus-motion.dev.mjs',
  'js/glaze-v1.6-material-type-input.dev.mjs',
  'js/glaze-v1.6-resilience-feedback.dev.mjs',
  'js/glaze-v1.6-navigation-status.dev.mjs',
  'js/glaze-v1.6-component-systems.dev.mjs',
  'js/glaze-v1.6-experience-governance.dev.mjs',
  'js/glaze-v1.6-performance-diagnostics.dev.mjs',
  'js/glaze-v1.6-conformance-adoption.dev.mjs',
  'js/glaze-v1.6-acceptance.dev.mjs',
  'contracts/v1.6/loading-skeleton.dev.json',
  'contracts/v1.6/state-accessibility.dev.json',
  'contracts/v1.6/focus-motion.dev.json',
  'contracts/v1.6/material-type-input.dev.json',
  'contracts/v1.6/resilience-feedback.dev.json',
  'contracts/v1.6/navigation-status.dev.json',
  'contracts/v1.6/component-systems.dev.json',
  'contracts/v1.6/experience-governance.dev.json',
  'contracts/v1.6/performance-diagnostics.dev.json',
  'contracts/v1.6/conformance-adoption.dev.json',
  'contracts/v1.6/acceptance.dev.json'
];
const continuity=spawnSync('git',['diff','--quiet',ACCEPTED_SOURCE,'--',...sourcePaths],{cwd:root,encoding:'utf8'});
assert.equal(continuity.status,0,'accepted/published V1.6 behavior/contract source changed after release acceptance');

for(const rel of ['js/glaze-v1.5.1.mjs','contracts/v1.5.1/stable-scope.json','acceptance/v1.5.1-stable.md']){
  assert.ok(fs.existsSync(path.join(root,rel)),'missing V1.5.1 rollback provenance: '+rel);
}

console.log('GLAZE UI V1.6.0 retained Stable/Anchor release integrity: PASS');
console.log('Published source: '+ACCEPTED_SOURCE);
console.log('Published archive SHA-256: '+ARCHIVE_SHA);
console.log('Qualification: 24 verified / 0 unverified / 0 not applicable');
console.log('Rollback Stable: '+ROLLBACK);
console.log('Downstream consumer acceptance remains separate.');
