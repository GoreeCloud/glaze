import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  createGlazeV17V13QualificationMatrix,
  V13_SECTION48_QUALIFICATION_LANES
} from '../js/glaze-v1.7-v1-3-qualification.dev.mjs';
import {
  createGlazeV17V13QualificationCoverageMatrix,
  V13_SECTION48_COVERAGE_LANES
} from '../js/glaze-v1.7-v1-3-qualification-coverage.dev.mjs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const json=path=>JSON.parse(read(path));

const SOURCE='414ec21921cbcfd5e7efb4828027ecebeb11aae8';
const MODEL='1.7.0-dev.47';
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

assert.equal(plan.scenes.length,14);
assert.equal(new Set(plan.scenes.map(scene=>scene.id)).size,14);
for(const scene of plan.scenes){
  assert.ok(Array.isArray(scene.viewport)&&scene.viewport.length===2,'scene viewport invalid: '+scene.id);
  assert.ok(Array.isArray(scene.laneIds)&&scene.laneIds.length>=1,'scene lane coverage missing: '+scene.id);
}

const baseRendered=[
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
const coverageRendered=[
  'expression-system-v13',
  'contextual-actions-v13',
  'brief-v13',
  'control-center-v13'
];
const expected=[...coverageRendered,...baseRendered];
assert.deepEqual(sorted(plan.eligibleRenderedEvidenceLaneIds),sorted(expected));
const covered=new Set(plan.scenes.flatMap(scene=>scene.laneIds));
assert.deepEqual(sorted(covered),sorted(expected),'scene coverage must exactly match eligible rendered lanes');

const baseMap=new Map(V13_SECTION48_QUALIFICATION_LANES.map(lane=>[lane.id,lane]));
for(const id of baseRendered){
  const lane=baseMap.get(id);
  assert.ok(lane,'rendered plan references unknown dev.46 lane: '+id);
  assert.ok(lane.evidenceTypes.includes('rendered'),'rendered plan claims dev.46 lane without rendered evidence type: '+id);
}
const coverageMap=new Map(V13_SECTION48_COVERAGE_LANES.map(lane=>[lane.id,lane]));
for(const id of coverageRendered){
  const lane=coverageMap.get(id);
  assert.ok(lane,'rendered plan references unknown dev.47 coverage lane: '+id);
  assert.ok(lane.evidenceTypes.includes('rendered'),'rendered plan claims dev.47 lane without rendered evidence type: '+id);
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

const baseEvidence=baseRendered.map(id=>({
  id,verified:true,revision:SOURCE,evidenceType:'rendered',
  reference:'STRUCTURAL-SELF-TEST rendered lane '+id
}));
const coverageEvidence=coverageRendered.map(id=>({
  id,verified:true,revision:SOURCE,evidenceType:'rendered',
  reference:'STRUCTURAL-SELF-TEST rendered coverage lane '+id
}));

const dev46=createGlazeV17V13QualificationMatrix({
  exactRevision:SOURCE,
  section48Evidence:baseEvidence
});
assert.equal(dev46.readyForGovernedQualificationReview,false);
assert.equal(dev46.evidenceInventoryComplete,false);
for(const id of baseRendered){
  const lane=dev46.section48.lanes.find(candidate=>candidate.id===id);
  assert.ok(lane,'missing dev.46 matrix lane: '+id);
  assert.ok(lane.satisfiedEvidenceGroupCount>=1,'rendered evidence did not satisfy dev.46 rendered group: '+id);
  assert.equal(lane.status,'unverified','browser rendered evidence alone unexpectedly completed dev.46 lane: '+id);
}

const dev47=createGlazeV17V13QualificationCoverageMatrix({
  exactRevision:SOURCE,
  section48Evidence:baseEvidence,
  coverageEvidence
});
assert.equal(dev47.readyForGovernedQualificationReview,false);
assert.equal(dev47.evidenceInventoryComplete,false);
assert.equal(dev47.retainedCombinedQualification.evidenceInventoryComplete,false);
assert.equal(dev47.authority.section48Accepted,false);
assert.equal(dev47.authority.v17AcceptanceEstablished,false);
assert.equal(dev47.authority.anchorStatusGranted,false);
for(const id of coverageRendered){
  const lane=dev47.coverage.lanes.find(candidate=>candidate.id===id);
  assert.ok(lane,'missing dev.47 coverage lane: '+id);
  assert.ok(lane.satisfiedEvidenceGroupCount>=1,'rendered evidence did not satisfy dev.47 rendered group: '+id);
  assert.equal(lane.status,'unverified','browser rendered evidence alone unexpectedly completed dev.47 lane: '+id);
}

const requiredMarkers=[
  "import {glazeV17V13Development} from '../../js/glaze-v1.7-development-v1-3.dev.mjs'",
  'resolveGlazeExpressionV13',
  'resolveGlazeContextualActions',
  'resolveGlazeBrief',
  'resolveGlazeControlCenter',
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
  'qualificationCoverageControlVersion',
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
