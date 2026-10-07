#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  getGlazeMotionLifecycleAssessment,
  glazeV17GlazeMotionLifecycleDevelopmentContract
} from '../js/glaze-v1.7-glaze-motion-lifecycle.dev.mjs';
import {glazeV17MotionPerformanceDevelopmentContract} from '../js/glaze-v1.7-motion-performance.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/glaze-motion-lifecycle.dev.json');
const schema=json('schemas/v1.7-glaze-motion-lifecycle.schema.json');
const tokens=json('tokens/glaze-v1.7-glaze-motion-lifecycle.dev.json');
const glazeMotion=json('tokens/glaze-motion.json');
const registry=json('consumers/registry.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const motionDoc=read('GLAZE_MOTION.md');
const motionValidator=read('scripts/validate_glaze_motion.py');
const reconciliation=read('docs/development/v1.7-glaze-motion-lifecycle-reconciliation-20260926.md');

const requirements=[
  'accessibility','native-platform-behavior','frame-pacing','interaction-latency',
  'interruption','reversal','reduced-motion','physical-device-behavior',
  'energy-impact','human-motion-review'
];

assert(read('VERSION').trim()==='1.7.0','bounded V1.7 VERSION changed');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.26 must not create lifecycle promotion state');

for(const phrase of [
  '## 34. Glaze Motion Lifecycle',
  'separately governed experimental foundation',
  'Accessibility',
  'Native-platform behavior',
  'Frame pacing',
  'Interaction latency',
  'Interruption',
  'Reversal',
  'Reduced Motion',
  'Physical-device behavior',
  'Energy impact',
  'Human motion review',
  'Experimental motion must not become Stable merely because it is visually attractive.'
]) assert(spec.includes(phrase),'Section 34 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.26'&&contract.lifecycle==='Development','dev.26 identity mismatch');
assert(contract.stableBaseline==='1.6.0'&&contract.consumerEligible===false,'dev.26 lifecycle boundary mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([34]),'dev.26 Section 34 binding mismatch');
assert(JSON.stringify(contract.promotionRequirements)===JSON.stringify(requirements),'Section 34 requirement set changed');

for(const [name,evidence] of Object.entries(contract.evidenceAssessment)){
  assert(evidence.promotionSatisfied===false,'promotion requirement overclaimed: '+name);
}
assert(contract.decision.disposition==='retain-experimental','Glaze Motion disposition changed');
assert(contract.decision.promotionReady===false,'Glaze Motion promotion readiness overclaimed');
assert(Array.isArray(contract.decision.eligibleSubset)&&contract.decision.eligibleSubset.length===0,'non-empty Motion subset promoted without complete evidence');
assert(contract.decision.officialGlazeUiContractAdoption===false,'official V1.7 Motion adoption overclaimed');
assert(contract.authority.mayInferMissingEvidence===false&&contract.authority.mayPromoteLifecycle===false,'dev.26 authority expanded');
assert(contract.acceptanceBoundary.section34Complete===false,'Section 34 completion overclaimed');

const assessment=getGlazeMotionLifecycleAssessment();
assert(assessment.decision==='retain-experimental'&&assessment.promotionReady===false,'runtime lifecycle disposition mismatch');
assert(assessment.eligibleSubset.length===0,'runtime returned promotable subset');
assert(assessment.requirements.length===10&&assessment.unsatisfiedRequirements.length===10,'runtime must retain all ten unsatisfied promotion gates');
assert(assessment.satisfiedRequirements.length===0,'runtime manufactured satisfied promotion gates');
for(const requirement of requirements){
  assert(assessment.requirements.includes(requirement),'runtime missing requirement '+requirement);
  assert(assessment.evidence[requirement].promotionSatisfied===false,'runtime promoted requirement '+requirement);
}
assert(assessment.provenance.historicalEvidenceCommit==='974c6043281db1497973ef2b5ebc149440cd476b','historical 0.6 evidence commit changed');
assert(assessment.provenance.historicalAcceptanceRetiredFromCurrentTree===true,'historical acceptance retirement not recorded');
assert(assessment.invariants.glazeMotionStatusChanged===false&&assessment.invariants.versionFileChanged===false&&assessment.invariants.lifecycleRegistryChanged===false,'dev.26 mutated protected lifecycle authority');

assert(glazeV17GlazeMotionLifecycleDevelopmentContract.version==='1.7.0-dev.26','runtime contract version mismatch');
assert(glazeV17GlazeMotionLifecycleDevelopmentContract.promotionReady===false,'runtime contract promotion overclaim');
assert(glazeV17GlazeMotionLifecycleDevelopmentContract.eligibleSubsetCount===0,'runtime contract subset overclaim');
assert(glazeV17GlazeMotionLifecycleDevelopmentContract.glazeMotionExperimentalLifecyclePromoted===false,'runtime contract promoted Glaze Motion');
assert(glazeV17GlazeMotionLifecycleDevelopmentContract.section34Complete===false,'runtime contract completed Section 34');
assert(glazeV17MotionPerformanceDevelopmentContract.version==='1.7.0-dev.25','dev.25 dependency changed');
assert(glazeV17MotionPerformanceDevelopmentContract.section33Complete===false,'dev.25 acceptance boundary weakened');

assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(glazeMotion.glazeMotion.runtimeCompatibilityBaseline==='0.4.0','Motion Core runtime baseline changed');
assert(glazeMotion.tiers.core.status==='experimental'&&glazeMotion.tiers.studio.status==='planned'&&glazeMotion.tiers.spatial.status==='planned','Glaze Motion tier lifecycle changed');
assert(glazeMotion.consumerEvidence.productionConsumerCertification===false,'historical Motion evidence promoted consumers');
assert(glazeMotion.consumerEvidence.firstPartyEvaluations.length===2,'historical Motion evaluation count changed');
for(const entry of glazeMotion.consumerEvidence.firstPartyEvaluations){
  assert(entry.productionDependency===false&&entry.nativeDeviceCertification===false&&entry.candidatePromotionSufficient===false,'historical Experimental evidence boundary weakened');
}

assert(registry.officialBaseline==='1.7.0'&&registry.requiredConsumerVersion==='1.7.0','current consumer registry not aligned to bounded V1.7');
for(const [sourcePath,label] of [['apps/launcher','Launcher'],['apps/keyboard','Keyboard']]){
  const matches=registry.consumers.filter(entry=>entry.repository==='GoreeCloud/android-app-defaults'&&entry.sourcePath===sourcePath);
  assert(matches.length===1,'current registry entry missing for '+label+' monorepo source '+sourcePath);
  const entry=matches[0];
  assert(entry.status==='adoption-required'&&entry.requiredTargetVersion==='1.7.0'&&entry.productionEligible===false,'current consumer acceptance overclaimed for '+label);
  assert(entry.targetVersion===null&&entry.referenceRevision===null&&entry.evidence===null,'unverified current-target evidence present for '+label);
}

assert(!motionDoc.includes('acceptance/glaze-motion-0.6-experimental.md'),'current Motion doc points to retired acceptance path');
assert(motionDoc.includes('v1.7-glaze-motion-lifecycle-reconciliation-20260926.md'),'current Motion doc lacks Section 34 reconciliation');
assert(motionDoc.includes('retains Glaze Motion 0.6 as Experimental'),'current Motion disposition missing');

assert(!motionValidator.includes("ACCEPTANCE=ROOT/'acceptance/glaze-motion-0.6-experimental.md'"),'current Motion validator still requires retired acceptance path');
assert(!motionValidator.includes("version=='2.2.0'"),'current Motion validator still expects obsolete 2.2 VERSION');
assert(motionValidator.includes("version=='1.7.0'"),'current Motion validator does not preserve bounded V1.7 Anchor');
assert(motionValidator.includes("CURRENT_MONOREPO='GoreeCloud/android-app-defaults'")&&motionValidator.includes("CURRENT_LAUNCHER_PATH='apps/launcher'")&&motionValidator.includes("CURRENT_KEYBOARD_PATH='apps/keyboard'"),'current Motion validator does not use current monorepo consumer identities');

for(const phrase of [
  'Retain Experimental',
  'Promotion-ready bounded subset',
  'Historical 0.6 evidence provenance',
  'Section 34 evidence assessment',
  'No bounded subset is eligible',
  'GLAZE UI V1.6 / 1.6.0 remains the Official Anchor'
]) assert(reconciliation.includes(phrase),'reconciliation record missing: '+phrase);

assert(tokens.version==='1.7.0-dev.26'&&tokens.decision.disposition==='retain-experimental','dev.26 token disposition mismatch');
assert(tokens.decision.promotionReady===false&&tokens.decision.eligibleSubset.length===0,'dev.26 token promotion overclaim');
assert(tokens.boundaries.experimentalLifecyclePromoted===false&&tokens.boundaries.section34Complete===false,'dev.26 token lifecycle boundary weakened');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=26,'aggregate version regressed below dev.26');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31,32,33,34]){
  assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
}
assert(glazeV17Development.glazeMotionLifecycleFoundation==='js/glaze-v1.7-glaze-motion-lifecycle.dev.mjs','aggregate missing dev.26 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(spec.includes('dev.26')&&spec.includes('Glaze Motion Lifecycle'),'plan provenance missing dev.26');
assert(planned.includes('1.7.0-dev.26')&&planned.includes('Glaze Motion Lifecycle'),'planned-feature control missing dev.26');
assert(implemented.includes('Glaze Motion Lifecycle — `1.7.0-dev.26`'),'implemented-feature control missing dev.26');
assert(changelog.includes('1.7.0-dev.26')&&changelog.includes('Glaze Motion Lifecycle'),'changelog missing dev.26');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

console.log('GLAZE UI V1.7 Glaze Motion Lifecycle Development reconciliation: PASS');
console.log('Plan binding: v1.2 Section 34');
console.log('Promotion requirements satisfied: 0 / 10');
console.log('Eligible Glaze Motion subset: none');
console.log('Disposition: retain-experimental');
console.log('Section 34 complete: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
