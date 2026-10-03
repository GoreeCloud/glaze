import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  createGlazeV17AcceptanceMatrix,
  glazeV17AcceptanceDevelopmentContract
} from '../js/glaze-v1.7-acceptance.dev.mjs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const json=path=>JSON.parse(read(path));
const sorted=values=>[...values].sort();

const SOURCE='4b9d085a5177b96cc31d4270b38d792a59872e37';
const SOURCE_MODEL='1.7.0-dev.47';
const ACCEPTANCE_MODEL='1.7.0-dev.39';
const plan=json('contracts/v1.7/qualification.v1.2.rendered.plan.json');
const html=read('reference/v1.7/rendered-v1.2-qualification.html');
const modulePaths=[
  'reference/v1.7/rendered-v1.2-qualification.mjs',
  'reference/v1.7/rendered-v1.2-qualification-shared.mjs',
  'reference/v1.7/rendered-v1.2-scenes-core.mjs',
  'reference/v1.7/rendered-v1.2-scenes-signature.mjs',
  'reference/v1.7/rendered-v1.2-scenes-motion-policy.mjs',
  'reference/v1.7/rendered-v1.2-scenes-form-factor.mjs',
  'reference/v1.7/rendered-v1.2-scenes-accessibility.mjs'
];
const modules=modulePaths.map(read);
const sourceBundle=[html,...modules].join('\n');

assert.equal(plan.schemaVersion,1);
assert.equal(plan.planId,'goreecloud.glaze.v1.7.v1.2.rendered-browser-qualification');
assert.equal(plan.lifecycle,'DevelopmentQualification');
assert.equal(plan.sourceRevision,SOURCE);
assert.equal(plan.sourceModelVersion,SOURCE_MODEL);
assert.equal(plan.acceptanceModelVersion,ACCEPTANCE_MODEL);
assert.equal(plan.stableBaseline,'1.6.0');
assert.equal(plan.consumerEligible,false);
assert.equal(plan.harness,'reference/v1.7/rendered-v1.2-qualification.html');
assert.equal(plan.captureScript,'scripts/capture_glaze_v1_7_v1_2_rendered_qualification.py');
assert.equal(plan.validator,'scripts/validate_glaze_v1_7_v1_2_rendered_qualification_harness.mjs');
assert.equal(plan.workflow,'.github/workflows/glaze-v1.7-v1.2-rendered-qualification.yml');
assert.equal(plan.artifactDirectory,'artifacts/v1.7-v1.2-rendered');
assert.equal(plan.networkPolicy,'repository-local-only');
assert.equal(plan.browserClass,'chromium-headless');

assert.equal(glazeV17AcceptanceDevelopmentContract.version,ACCEPTANCE_MODEL);
assert.equal(glazeV17AcceptanceDevelopmentContract.planVersion,'v1.2');
assert.equal(glazeV17AcceptanceDevelopmentContract.laneCount,37);
assert.equal(glazeV17AcceptanceDevelopmentContract.consumerEligible,false);

const allRendered=glazeV17AcceptanceDevelopmentContract.acceptanceLanes
  .filter(lane=>lane.evidenceTypes.includes('rendered'))
  .map(lane=>lane.id);
assert.equal(allRendered.length,23);

assert.equal(plan.scenes.length,22);
assert.equal(new Set(plan.scenes.map(scene=>scene.id)).size,22);
for(const scene of plan.scenes){
  assert.ok(Array.isArray(scene.viewport)&&scene.viewport.length===2,'scene viewport invalid: '+scene.id);
  assert.ok(Array.isArray(scene.laneIds)&&scene.laneIds.length===1,'each retained scene must map exactly one lane: '+scene.id);
}
assert.equal(plan.eligibleRenderedEvidenceLaneIds.length,22);
assert.equal(new Set(plan.eligibleRenderedEvidenceLaneIds).size,22);
assert.deepEqual(plan.openRenderedEvidenceLaneIds,['regression']);
assert.deepEqual(
  sorted([...plan.eligibleRenderedEvidenceLaneIds,...plan.openRenderedEvidenceLaneIds]),
  sorted(allRendered),
  'plan must account for every rendered-capable retained lane'
);
const covered=plan.scenes.flatMap(scene=>scene.laneIds);
assert.deepEqual(sorted(covered),sorted(plan.eligibleRenderedEvidenceLaneIds),'scene coverage drifted');
assert.equal(covered.includes('regression'),false,'rendered regression evidence requires a governed baseline and must remain open');

const laneMap=new Map(glazeV17AcceptanceDevelopmentContract.acceptanceLanes.map(lane=>[lane.id,lane]));
for(const id of plan.eligibleRenderedEvidenceLaneIds){
  const lane=laneMap.get(id);
  assert.ok(lane,'unknown retained lane: '+id);
  assert.ok(lane.evidenceTypes.includes('rendered'),'lane does not allow rendered evidence: '+id);
}
assert.ok(laneMap.get('regression').evidenceTypes.includes('rendered'));

assert.equal(plan.authority.renderedBrowserOnly,true);
for(const key of [
  'regressionBaselineClaimed','humanEvidenceClaimed','assistiveTechnologyEvidenceClaimed',
  'physicalDeviceEvidenceClaimed','nativePlatformEvidenceClaimed',
  'representativePerformanceEvidenceClaimed','energyEvidenceClaimed',
  'v12QualificationClaimed','section46CompleteClaimed','v17AcceptanceClaimed',
  'anchorStatusGranted','consumerEligibilityGranted','deploymentAcceptanceGranted',
  'productionAcceptanceGranted','lifecyclePromotionAutomatic'
]){
  assert.equal(plan.authority[key],false,'plan authority drift: '+key);
}

const structuralEvidence=plan.eligibleRenderedEvidenceLaneIds.map(id=>({
  id,verified:true,revision:SOURCE,evidenceType:'rendered',
  reference:'STRUCTURAL-SELF-TEST rendered lane '+id
}));
const matrix=createGlazeV17AcceptanceMatrix({exactRevision:SOURCE,evidence:structuralEvidence});
assert.equal(matrix.laneCount,37);
assert.equal(matrix.externallyVerifiedCount,0);
assert.equal(matrix.unverifiedCount,37);
assert.equal(matrix.evidenceInventoryComplete,false);
assert.equal(matrix.readyForGovernedQualificationReview,false);
for(const id of plan.eligibleRenderedEvidenceLaneIds){
  const lane=matrix.lanes.find(candidate=>candidate.id===id);
  assert.ok(lane,'matrix missing lane: '+id);
  assert.equal(lane.satisfiedEvidenceGroupCount,1,'rendered evidence should satisfy exactly one group: '+id);
  assert.equal(lane.status,'unverified','rendered-only evidence unexpectedly completed lane: '+id);
}
const regression=matrix.lanes.find(lane=>lane.id==='regression');
assert.equal(regression.satisfiedEvidenceGroupCount,0);
assert.equal(regression.status,'unverified');
assert.equal(matrix.authority.v17AcceptanceEstablished,false);
assert.equal(matrix.authority.stableStatusGranted,false);

assert.ok(html.includes('type="module" src="./rendered-v1.2-qualification.mjs"'),'HTML must load the local retained qualification module');
assert.equal(modulePaths.length,7);

const markers=[
  "import {glazeV17V13Development} from '../../js/glaze-v1.7-development-v1-3.dev.mjs'",
  'resolveGlazeTaskContinuity',
  'resolveGlazeAdaptiveComposition',
  'resolveGlazeSemanticColor',
  'resolveGlazeThemeSafety',
  'resolveGlazeSignatureMotion',
  'resolveGlazeSignatureMotionPrinciples',
  'resolveGlazeConnectedTransformation',
  'resolveGlazeReducedMotionEquivalent',
  'resolveGlazeAccessibilityContinuity',
  'resolveGlazeFormFactorProfile',
  'window.__glazeV17V12RenderedEvidence=evidence',
  'window.__glazeV17V12RenderedReady=true',
  'renderedBrowserOnly:true',
  'regressionBaselineClaimed:false',
  'v12QualificationClaimed:false',
  'section46CompleteClaimed:false',
  'v17AcceptanceClaimed:false',
  'anchorStatusGranted:false'
];
for(const marker of markers)assert.ok(sourceBundle.includes(marker),'retained rendered harness missing marker: '+marker);

const forbidden=[
  /<(?:script|link|img|iframe|video|audio|source)\b[^>]*(?:src|href)\s*=\s*["']https?:\/\//i,
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /WebSocket\s*\(/i,
  /sendBeacon\s*\(/i,
  /getUserMedia\s*\(/i,
  /navigator\.mediaDevices/i,
  /regressionBaselineClaimed\s*:\s*true/i,
  /v12QualificationClaimed\s*:\s*true/i,
  /section46CompleteClaimed\s*:\s*true/i,
  /v17AcceptanceClaimed\s*:\s*true/i,
  /anchorStatusGranted\s*:\s*true/i
];
for(const pattern of forbidden)assert.equal(pattern.test(sourceBundle),false,'rendered harness violates local/fail-closed boundary: '+pattern);

const args=process.argv.slice(2);
if(args.length>1)throw new Error('at most one rendered evidence file may be supplied');
if(args.length===1){
  const evidence=JSON.parse(readFileSync(args[0],'utf8'));
  assert.ok(Array.isArray(evidence));
  assert.equal(evidence.length,22);
  assert.deepEqual(sorted(evidence.map(item=>item.id)),sorted(plan.eligibleRenderedEvidenceLaneIds));
  for(const item of evidence){
    assert.equal(item.verified,true);
    assert.equal(item.revision,SOURCE);
    assert.equal(item.evidenceType,'rendered');
    assert.match(item.reference,/^evidence\+sha256:[0-9a-f]{64}:v1\.7\/v1\.2-rendered\/[A-Za-z0-9_-]+\.json$/);
  }
  const captured=createGlazeV17AcceptanceMatrix({exactRevision:SOURCE,evidence});
  assert.equal(captured.externallyVerifiedCount,0);
  assert.equal(captured.unverifiedCount,37);
  assert.equal(captured.evidenceInventoryComplete,false);
  assert.equal(captured.readyForGovernedQualificationReview,false);
  for(const id of plan.eligibleRenderedEvidenceLaneIds){
    const lane=captured.lanes.find(candidate=>candidate.id===id);
    assert.equal(lane.satisfiedEvidenceGroupCount,1,'captured rendered group not satisfied: '+id);
    assert.equal(lane.status,'unverified');
  }
  const open=captured.lanes.find(lane=>lane.id==='regression');
  assert.equal(open.satisfiedEvidenceGroupCount,0);
  assert.equal(open.status,'unverified');
}

console.log('Glaze V1.7 retained-v1.2 rendered qualification harness validation: PASS');
console.log('Rendered groups represented: 22 / 23 rendered-capable lanes');
console.log('Open rendered group: regression (no governed V1.7 rendered baseline yet)');
console.log('Full retained lanes established by rendered-only evidence: 0');
