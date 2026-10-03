import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  createGlazeV17V13QualificationMatrix,
  V13_SECTION48_QUALIFICATION_LANES
} from '../js/glaze-v1.7-v1-3-qualification.dev.mjs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const json=path=>JSON.parse(read(path));

const SOURCE='e165007292878fd268298055c39b2f4a36a33ecf';
const MODEL='1.7.0-dev.46';
const plan=json('contracts/v1.7/qualification.v1.3.rendered.plan.json');
const html=read('reference/v1.7/rendered-qualification.html');
const sorted=values=>[...values].sort();

assert.equal(plan.schemaVersion,1);
assert.equal(plan.planId,'goreecloud.glaze.v1.7.v1.3.rendered-browser-qualification');
assert.equal(plan.lifecycle,'DevelopmentQualification');
assert.equal(plan.sourceRevision,SOURCE);
assert.equal(plan.acceptanceModelVersion,MODEL);
assert.equal(plan.stableBaseline,'1.6.0');
assert.equal(plan.consumerEligible,false);
assert.equal(plan.harness,'reference/v1.7/rendered-qualification.html');
assert.equal(plan.captureScript,'scripts/capture_glaze_v1_7_v1_3_rendered_qualification.py');
assert.equal(plan.validator,'scripts/validate_glaze_v1_7_v1_3_rendered_qualification_harness.mjs');
assert.equal(plan.workflow,'.github/workflows/glaze-v1.7-v1.3-rendered-qualification.yml');
assert.equal(plan.artifactDirectory,'artifacts/v1.7-v1.3-rendered');
assert.equal(plan.networkPolicy,'repository-local-only');
assert.equal(plan.browserClass,'chromium-headless');

assert.equal(plan.scenes.length,10);
assert.equal(new Set(plan.scenes.map(scene=>scene.id)).size,10);
for(const scene of plan.scenes){
  assert.ok(Array.isArray(scene.viewport)&&scene.viewport.length===2,'scene viewport invalid: '+scene.id);
  assert.ok(Array.isArray(scene.laneIds)&&scene.laneIds.length>=1,'scene lane coverage missing: '+scene.id);
}

const expected=[
  'workspace-continuity-v13',
  'compact-surface-v13',
  'agent-activity-authority-v13',
  'privacy-attention-authority-v13',
  'accessibility-presentation-v13',
  'creative-state-separation-v13',
  'compare-neutrality-v13',
  'care-authority-v13',
  'large-text-reflow-v13',
  'forced-colors-v13',
  'compact-device-behavior-v13'
];
assert.deepEqual(sorted(plan.eligibleRenderedEvidenceLaneIds),sorted(expected));
const covered=new Set(plan.scenes.flatMap(scene=>scene.laneIds));
assert.deepEqual(sorted(covered),sorted(expected),'scene coverage must exactly match eligible rendered lanes');

const laneMap=new Map(V13_SECTION48_QUALIFICATION_LANES.map(lane=>[lane.id,lane]));
for(const id of expected){
  const lane=laneMap.get(id);
  assert.ok(lane,'rendered plan references unknown lane: '+id);
  assert.ok(lane.evidenceTypes.includes('rendered'),'rendered plan claims lane without rendered evidence type: '+id);
}

assert.equal(plan.authority.renderedBrowserOnly,true);
for(const key of [
  'humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed','physicalDeviceEvidenceClaimed',
  'nativePlatformEvidenceClaimed','providerIntegrationEvidenceClaimed',
  'privacySecurityIntegrationEvidenceClaimed','representativePerformanceEvidenceClaimed',
  'energyEvidenceClaimed','crossPlatformEvidenceClaimed','regressionBaselineClaimed',
  'section48AcceptanceClaimed','v17AcceptanceClaimed','anchorStatusGranted',
  'lifecyclePromotionAutomatic'
]){
  assert.equal(plan.authority[key],false,'plan authority drift: '+key);
}

const renderedEvidence=expected.map(id=>({
  id,
  verified:true,
  revision:SOURCE,
  evidenceType:'rendered',
  reference:'STRUCTURAL-SELF-TEST rendered lane '+id
}));
const matrix=createGlazeV17V13QualificationMatrix({
  exactRevision:SOURCE,
  section48Evidence:renderedEvidence
});
assert.equal(matrix.readyForGovernedQualificationReview,false);
assert.equal(matrix.evidenceInventoryComplete,false);
assert.equal(matrix.retainedV12.evidenceInventoryComplete,false);
assert.equal(matrix.retainedV12.blockingLaneIds.length,37);
assert.equal(matrix.authority.section48Accepted,false);
assert.equal(matrix.authority.v17AcceptanceEstablished,false);
assert.equal(matrix.authority.anchorStatusGranted,false);
for(const id of expected){
  const lane=matrix.section48.lanes.find(candidate=>candidate.id===id);
  assert.ok(lane,'missing matrix lane: '+id);
  assert.ok(lane.satisfiedEvidenceGroupCount>=1,'rendered evidence did not satisfy rendered group: '+id);
  assert.equal(lane.status,'unverified','browser rendered evidence alone unexpectedly completed lane: '+id);
}

const requiredMarkers=[
  "import {glazeV17V13Development} from '../../js/glaze-v1.7-development-v1-3.dev.mjs'",
  'resolveGlazeWorkspace',
  'resolveGlazeCompactSurface',
  'resolveGlazeAccessibilityPresentation',
  'resolveGlazeAgentActivity',
  'resolveGlazePrivacyAttention',
  'resolveGlazeCareSurface',
  'resolveGlazeCreativeSurface',
  'resolveGlazeCompare',
  'window.__glazeV17RenderedEvidence=evidence',
  'window.__glazeV17RenderedReady=true',
  'renderedBrowserOnly:true',
  'humanEvidenceClaimed:false',
  'assistiveTechnologyEvidenceClaimed:false',
  'physicalDeviceEvidenceClaimed:false',
  'providerIntegrationEvidenceClaimed:false',
  'privacySecurityIntegrationEvidenceClaimed:false',
  'representativePerformanceEvidenceClaimed:false',
  'energyEvidenceClaimed:false',
  'crossPlatformEvidenceClaimed:false',
  'section48AcceptanceClaimed:false',
  'v17AcceptanceClaimed:false',
  'anchorStatusGranted:false'
];
for(const marker of requiredMarkers){
  assert.ok(html.includes(marker),'rendered harness missing marker: '+marker);
}

const forbidden=[
  /<(?:script|link|img|iframe|video|audio|source)\b[^>]*(?:src|href)\s*=\s*["']https?:\/\//i,
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /WebSocket\s*\(/i,
  /sendBeacon\s*\(/i,
  /getUserMedia\s*\(/i,
  /navigator\.mediaDevices/i,
  /section48AcceptanceClaimed\s*:\s*true/i,
  /v17AcceptanceClaimed\s*:\s*true/i,
  /anchorStatusGranted\s*:\s*true/i,
  /consumerEligible\s*:\s*true/i
];
for(const pattern of forbidden){
  assert.equal(pattern.test(html),false,'rendered harness violates local/fail-closed boundary: '+pattern);
}

console.log('Glaze V1.7 v1.3 rendered qualification harness structural validation: PASS');
console.log('Rendered lanes represented: '+expected.length);
console.log('Browser evidence remains partial and non-authorizing.');
