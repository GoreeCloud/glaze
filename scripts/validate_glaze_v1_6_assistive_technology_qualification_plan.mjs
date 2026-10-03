#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(v,m)=>{if(!v)throw new Error(m)};

const plan=json('contracts/v1.6/qualification.assistive-technology.plan.json');
const schema=json('schemas/v1.6-assistive-technology-qualification-plan.schema.json');
const acceptance=json('contracts/v1.6/acceptance.dev.json');
const lifecycle=json('registry/lifecycle.json');
const harness=read('reference/v1.6/assistive-technology-qualification.html');
const prepare=read('scripts/prepare_glaze_v1_6_assistive_technology_qualification.py');

const liveStable=read('VERSION').trim();
assert(lifecycle.currentOfficial===liveStable&&lifecycle.currentStable===liveStable,'VERSION/current Stable authority must agree');
const liveRelease=lifecycle.releases.find(item=>item.version===liveStable);
assert(liveRelease&&liveRelease.status==='stable'&&liveRelease.consumerEligible===true,'live current Stable must remain a consumer-eligible Stable release');
const liveTuple=liveStable.split('.').slice(0,3).map(Number);
assert(liveTuple.length===3&&liveTuple.every(Number.isInteger),'live Stable must use major.minor.patch versioning');
assert(
  liveTuple[0]>1 || (liveTuple[0]===1 && (liveTuple[1]>5 || (liveTuple[1]===5 && liveTuple[2]>=1))),
  'V1.6 retained qualification requires live Stable authority at or after its frozen 1.5.1 baseline'
);
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'retained V1.6 qualification tooling must not create an active lifecycle candidate');
assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema dialect mismatch');
assert(plan.planId==='goreecloud.glaze-ui.v1.6.assistive-technology-qualification','plan ID mismatch');
assert(plan.sourceRevision==='c7509c79256b04b0aa67cb9dd0737d7588e0ae4a','plan must stay bound to frozen source');
assert(plan.acceptanceModelVersion==='1.6.0-dev.12'&&plan.stableBaseline==='1.5.1','source model or Stable baseline drifted');
assert(plan.consumerEligible===false&&plan.evidenceType==='assistive-technology'&&plan.laneId==='assistive-technology','lane/evidence boundary drifted');
assert(plan.mayAlsoSatisfyAccessibilityAlternativeGroup===true,'accepted AT evidence may satisfy Accessibility alternative group');
assert(JSON.stringify(acceptance.evidenceRequirements['assistive-technology'])==='[["assistive-technology"]]','Assistive Technology evidence requirement drifted');
assert(JSON.stringify(acceptance.evidenceRequirements.accessibility)==='[["machine"],["human","assistive-technology"]]','Accessibility grouped requirement drifted');
assert(plan.execution.realAssistiveTechnologySessionRequired===true,'real assistive-technology session must remain required');
assert(plan.execution.reviewerMustIdentifyAssistiveTechnology===true,'assistive technology identity must be recorded');
assert(plan.execution.reviewerMustExerciseKeyboardOrEquivalentNavigation===true,'navigation review must be required');
assert(plan.execution.reviewerMustObserveDynamicAnnouncements===true,'dynamic announcement review must be required');
assert(plan.execution.hostedCiMayClaimAssistiveTechnologyEvidence===false,'hosted CI must not claim AT evidence');
assert(plan.execution.generatedEvidenceAutomatic===false,'harness must not manufacture evidence');
for(const k of ['assistiveTechnologyEvidenceClaimedByPlan','humanEvidenceClaimed','physicalDeviceEvidenceClaimed','performanceEvidenceClaimed','lifecyclePromotionAutomatic','candidateStatusGranted','releaseCandidateStatusGranted','stableStatusGranted','consumerAcceptanceAutomatic','deploymentAcceptanceAutomatic','productionAcceptanceAutomatic']) assert(plan.evidenceBoundary[k]===false,'authority boundary must remain false: '+k);
assert(harness.includes("const SOURCE='c7509c79256b04b0aa67cb9dd0737d7588e0ae4a'"),'harness source binding missing');
assert(harness.includes('role="status" aria-live="polite"'),'live-region review target missing');
assert(harness.includes('Skip to review content'),'skip link missing');
assert(harness.includes('This page intentionally has no PASS button'),'no-PASS boundary missing');
assert(!/download\s*=|Blob\s*\(|URL\.createObjectURL|localStorage|sessionStorage|indexedDB/i.test(harness),'harness must not persist or manufacture evidence');
assert(!/https?:\/\//i.test(harness),'harness must not load remote resources');
assert(prepare.includes('SOURCE_REVISION="c7509c79256b04b0aa67cb9dd0737d7588e0ae4a"'),'preparation source binding missing');
assert(prepare.includes('"archive","--format=tar"'),'preparation must materialize frozen source with git archive');
assert(prepare.includes('"assistiveTechnologyEvidenceClaimed":False'),'preparation must not claim AT evidence');

console.log('GLAZE UI V1.6 assistive-technology qualification control: PASS');
console.log('Frozen source: '+plan.sourceRevision);
console.log('Assistive Technology lane closed by tooling alone: false');
console.log('Hosted CI assistive-technology claim: false');
console.log('Stable baseline preserved: 1.5.1');
