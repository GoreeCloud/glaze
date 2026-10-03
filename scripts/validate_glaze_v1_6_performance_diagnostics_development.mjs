#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazePerceivedPerformance,
  runGlazeDeveloperDiagnostics,
  runGlazeAccessibilityDiagnostics,
  runGlazeSkeletonDiagnostics,
  buildGlazeVisualRegressionMatrix,
  evaluateGlazeSemanticRegression,
  evaluateGlazePerformanceMeasurements,
  evaluateGlazeLayoutStability,
  resolveGlazeGracefulDegradation,
  glazeV16PerformanceDiagnosticsDevelopmentContract
} from '../js/glaze-v1.6-performance-diagnostics.dev.mjs';
import {glazeV16Development} from '../js/glaze-v1.6-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.6/performance-diagnostics.dev.json');
const schema = json('schemas/v1.6-performance-diagnostics.schema.json');
const tokens = json('tokens/glaze-v1.6-performance-diagnostics.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_6_PLANNED.md');

const sections = [5,80,81,82,83,84,85,86,87];

assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
const stableTuple = stable.split('.').slice(0, 3).map(Number);
assert(stableTuple.length === 3 && stableTuple.every(Number.isInteger), 'live Stable must use major.minor.patch versioning');
assert(
  stableTuple[0] > 1 || (stableTuple[0] === 1 && (stableTuple[1] > 5 || (stableTuple[1] === 5 && stableTuple[2] >= 1))),
  'V1.6 retained Development validation requires live Stable authority at or after its frozen 1.5.1 baseline'
);
assert((lifecycle.activeCandidate === null || lifecycle.activeCandidate === '1.6.0-rc.1'), 'V1.6 Development validation permits only no active Candidate or governed 1.6.0-rc.1');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.6 Development must not create patch RC');

for (const number of sections) {
  assert(spec.includes(`# ${number}.`), `planned specification missing section ${number}`);
}

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.6-performance-diagnostics.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.6.0-dev.9', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.5.1', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify(sections), 'implemented section set mismatch');
assert(contract.perceivedPerformance.secondaryCompletionRequiredBeforeInteraction === false, 'partially useful screens must be allowed to become interactive');
assert(contract.developerDiagnostics.autofixSource === false, 'developer diagnostics must not auto-modify source');
assert(contract.accessibilityDiagnostics.missingEvidenceMayInferPass === false, 'missing accessibility evidence must remain unverified');
assert(contract.skeletonDiagnostics.durationThresholdInvented === false, 'skeleton duration threshold must not be invented');
assert(contract.visualRegression.renderedEvidenceClaimedByResolver === false, 'visual matrix must not claim rendered evidence');
assert(contract.semanticRegression.stateTruthInventedByGlaze === false, 'semantic regression must not invent state truth');
assert(contract.performanceRegression.measurementsMayBeManufactured === false, 'performance measurements must not be manufactured');
assert(contract.performanceRegression.missingMeasurementMayInferPass === false, 'missing performance measurements must not pass');
assert(contract.performanceRegression.exactRevisionBindingRequired === true, 'performance evidence must bind exact revision');
assert(contract.layoutStability.numericShiftBudgetInvented === false, 'layout shift budget must not be invented');
assert(contract.gracefulDegradation.meaningPreserved === true, 'graceful degradation must preserve meaning');
assert(contract.gracefulDegradation.automaticFallbackExecution === false, 'fallback execution must not be automatic');
assert(contract.authority.lifecyclePromotionAutomatic === false, 'dev.9 must not promote lifecycle automatically');

assert(tokens.version === '1.6.0-dev.9', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.5.1', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(tokens.performanceBudget.resolverP95MsMax === 10, 'resolver p95 budget mismatch');
assert(tokens.performanceBudget.resolverP99MsMax === 16.7, 'resolver p99 budget mismatch');
assert(tokens.performanceBudget.interactionPaintP95MsMax === 100, 'interaction p95 budget mismatch');
assert(tokens.performanceBudget.interactionPaintP99MsMax === 200, 'interaction p99 budget mismatch');
assert(tokens.performanceBudget.severeFrameStallRateMax === 0.01, 'severe stall budget mismatch');
assert(tokens.performanceBudget.measurementsMayBeManufactured === false, 'token map must not manufacture performance evidence');
assert(tokens.layoutStability.numericShiftBudgetInvented === false, 'token map must not invent layout budget');
assert(tokens.boundaries.missingEvidenceMayInferPass === false, 'token map must fail open evidence as unverified, not pass');
assert(tokens.boundaries.releaseAcceptanceAutomatic === false, 'token map must not create release acceptance');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

assert(glazeV16PerformanceDiagnosticsDevelopmentContract.version === '1.6.0-dev.9', 'runtime contract version mismatch');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.lifecycle === 'development', 'runtime contract must remain development');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.consumerEligible === false, 'runtime contract must remain non-consumer-eligible');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.partiallyUsefulScreenMayBecomeInteractiveBeforeSecondaryCompletion === true, 'runtime perceived-performance rule mismatch');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.diagnosticsMayAutofixSource === false, 'runtime diagnostics must not auto-fix');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.missingEvidenceMayInferPass === false, 'runtime missing evidence must remain unverified');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.performanceMeasurementsMayBeManufactured === false, 'runtime must not manufacture performance evidence');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.layoutShiftBudgetMayBeInvented === false, 'runtime must not invent layout budget');
assert(glazeV16PerformanceDiagnosticsDevelopmentContract.gracefulFallbackMustPreserveMeaning === true, 'runtime degradation invariant missing');

const aggregateVersionParts = String(glazeV16Development.version).split('-dev.');
const aggregateDevelopmentRevision = Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0] === '1.6.0'
    && Number.isInteger(aggregateDevelopmentRevision)
    && aggregateDevelopmentRevision >= 9,
  'aggregate Development version must retain or advance beyond dev.9'
);
assert(glazeV16Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV16Development.stableBaseline === '1.5.1', 'aggregate Stable baseline mismatch');
assert(glazeV16Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const number of sections) {
  assert(glazeV16Development.implementedSpecificationSections.includes(number), `aggregate must retain performance/diagnostics section ${number}`);
}
for (const retained of [1,6,10,15,29,41,55,60,70,71,73,74,79,88,93]) {
  assert(glazeV16Development.implementedSpecificationSections.includes(retained), `aggregate lost prior section ${retained}`);
}

const perceived = resolveGlazePerceivedPerformance({
  visibleContentReady:true,
  secondaryContentReady:false,
  interactionAcknowledged:true,
  layoutSpaceReserved:true,
  incrementalRenderingAvailable:true,
  progressiveDisclosureAvailable:true,
  staleUsableContent:false,
  secondaryHydrationPending:true,
  nonessentialEffectsPending:true
});
assert(perceived.readiness.partiallyUseful === true, 'visible primary content should make screen partially useful');
assert(perceived.readiness.canBecomeInteractiveBeforeSecondaryComplete === true, 'partially useful screen should become interactive before secondary completion');
assert(perceived.presentation.fullSecondaryCompletionRequiredBeforeInteraction === false, 'secondary completion must not block interaction');
assert(perceived.presentation.deferNonessentialEffects === true, 'nonessential effects should be deferrable');
assert(perceived.presentation.backgroundHydrateSecondaryContent === true, 'secondary content should support background hydration');
assert(perceived.authority.measurementsManufactured === false, 'perceived-performance resolver must not manufacture measurements');

const stalePerceived = resolveGlazePerceivedPerformance({
  visibleContentReady:false,
  secondaryContentReady:false,
  staleUsableContent:true
});
assert(stalePerceived.readiness.partiallyUseful === true, 'usable stale content should count as partial utility');
assert(stalePerceived.presentation.preserveUsableStaleContent === true, 'usable stale content should remain visible');

const developerDiagnostics = runGlazeDeveloperDiagnostics({
  contrastSufficient:false,
  unsupportedTokenOverride:true,
  missingComponentStates:['focus','error'],
  blurOverBudget:true,
  animationOverBudget:true,
  targetSizeAccessible:false,
  missingAccessibleName:true,
  nestedMaterialMisuse:true,
  semanticStateInconsistent:true,
  skeletonActiveTooLong:true,
  loadingWithoutRecovery:true
});
assert(developerDiagnostics.findingCount === 12, 'developer diagnostic finding count mismatch');
assert(developerDiagnostics.codes.includes('insufficient-contrast'), 'contrast diagnostic missing');
assert(developerDiagnostics.codes.includes('missing-component-state'), 'missing-state diagnostic missing');
assert(developerDiagnostics.safety.autofixExecuted === false, 'diagnostics must not auto-fix source');
assert(developerDiagnostics.safety.privateContentIncluded === false, 'diagnostics must remain privacy-minimized');

const cleanDiagnostics = runGlazeDeveloperDiagnostics({
  contrastSufficient:true,
  targetSizeAccessible:true
});
assert(cleanDiagnostics.clean === true, 'clean diagnostic input should remain clean');

const accessibilityPass = runGlazeAccessibilityDiagnostics({
  contrastSufficient:true,
  focusVisible:true,
  focusOrderLogical:true,
  targetSizeAccessible:true,
  reducedMotionCompatible:true,
  reducedTransparencyCompatible:true,
  largeTextReflow:true,
  semanticAnnouncementsCorrect:true,
  screenReaderLabelsComplete:true,
  statusMeaningAvailableWithoutColor:true
});
assert(accessibilityPass.status === 'pass', 'complete accessibility checks should pass');
assert(accessibilityPass.failureIds.length === 0, 'passing accessibility diagnostics must have no failures');
assert(accessibilityPass.renderedOrAssistiveTechnologyEvidenceManufactured === false, 'static diagnostics must not manufacture AT evidence');

const accessibilityMissing = runGlazeAccessibilityDiagnostics({
  contrastSufficient:true
});
assert(accessibilityMissing.status === 'unverified', 'incomplete accessibility evidence must remain unverified');
assert(accessibilityMissing.unverifiedIds.length === 9, 'missing accessibility checks should remain explicitly unverified');

const skeletonProblems = runGlazeSkeletonDiagnostics({
  skeletonActive:true,
  contentReady:true,
  reducedMotion:true,
  motionMode:'flow',
  simultaneousShimmerCount:10,
  simultaneousShimmerBudget:4,
  layoutStable:false,
  loadingSemanticsPresent:false,
  failureEscalationAvailable:false,
  elapsedMs:12000,
  maximumSkeletonDurationMs:6000,
  focusPreservedOnResolve:false
});
assert(skeletonProblems.findingCount === 8, 'skeleton diagnostic finding count mismatch');
assert(skeletonProblems.findings.some(finding => finding.code === 'skeleton-after-content-ready'), 'ready-content skeleton diagnostic missing');
assert(skeletonProblems.findings.some(finding => finding.code === 'skeleton-endless'), 'endless skeleton diagnostic missing');
assert(skeletonProblems.evidence.inventedDurationThreshold === false, 'skeleton diagnostics must not invent duration thresholds');
assert(skeletonProblems.evidence.inventedShimmerBudget === false, 'skeleton diagnostics must not invent shimmer budgets');

const skeletonNoBudget = runGlazeSkeletonDiagnostics({
  skeletonActive:true,
  contentReady:false,
  reducedMotion:false,
  motionMode:'soft-pulse',
  layoutStable:true,
  loadingSemanticsPresent:true,
  failureEscalationAvailable:true,
  focusPreservedOnResolve:true
});
assert(skeletonNoBudget.clean === true, 'skeleton without supplied numeric budgets should not invent failures');
assert(skeletonNoBudget.evidence.durationEvidenceAvailable === false, 'missing duration threshold must remain unavailable');
assert(skeletonNoBudget.evidence.shimmerBudgetEvidenceAvailable === false, 'missing shimmer budget must remain unavailable');

const visualMatrix = buildGlazeVisualRegressionMatrix();
assert(visualMatrix.requiredSceneCount === 14, 'visual regression required scene count mismatch');
for (const value of Object.values(visualMatrix.includes)) {
  assert(value === true, 'visual regression matrix missing required coverage');
}
assert(visualMatrix.evidence.screenshotsCapturedByResolver === false, 'static matrix must not claim screenshot capture');
assert(visualMatrix.evidence.renderedAcceptanceClaimed === false, 'static matrix must not claim rendered acceptance');

const semanticPass = evaluateGlazeSemanticRegression({
  cases:[
    {id:'error-theme',expected:'error',actual:'error'},
    {id:'loading-state',expected:'loading',actual:'loading'},
    {id:'restricted-state',expected:'restricted',actual:'restricted'},
    {id:'offline-state',expected:'offline',actual:'offline'}
  ]
});
assert(semanticPass.status === 'pass', 'matching semantic regression cases should pass');
assert(semanticPass.invariants.focusDistinctFromSelection === true, 'focus/selection semantic invariant missing');

const semanticFail = evaluateGlazeSemanticRegression({
  cases:[
    {id:'restricted-became-disabled',expected:'restricted',actual:'disabled'}
  ]
});
assert(semanticFail.status === 'fail', 'semantic mismatch must fail');
assert(semanticFail.failedIds.includes('restricted-became-disabled'), 'semantic failure id missing');

const performancePass = evaluateGlazePerformanceMeasurements({
  environment:{
    exactRevision:'0123456789abcdef0123456789abcdef01234567',
    lifecycle:'development',
    operatingSystem:'Representative OS',
    runtime:'Representative Runtime',
    hardware:'Representative Hardware',
    foregroundState:'foreground',
    presentationMode:'normal',
    measurementDate:'2026-09-18',
    displayRefreshRateHz:60
  },
  samples:{
    resolver:240,
    interactionPaint:40,
    idleFrames:140,
    activeFrames:300
  },
  measurements:{
    resolverP95Ms:8.4,
    resolverP99Ms:13.2,
    interactionPaintP95Ms:76,
    interactionPaintP99Ms:145,
    idleMedianFrameIntervalMs:16,
    activeFrameP95Ms:19,
    severeFrameStallRate:0.006,
    catastrophicForegroundStallCount:0,
    taskStateResetCount:0,
    pageReloadRequiredCount:0,
    automaticAuthorityActionCount:0
  }
});
assert(performancePass.status === 'pass', 'representative passing measurements should pass budget evaluator');
assert(performancePass.derived.activeFrameP95LimitMs === 20, 'refresh-adaptive frame ceiling mismatch');
assert(performancePass.evidence.measurementsManufactured === false, 'performance evaluator must not manufacture measurements');
assert(performancePass.authority.performanceAdaptationMayChangeTruth === false, 'performance adaptation must not alter truth');

const performanceFail = evaluateGlazePerformanceMeasurements({
  environment:{
    exactRevision:'0123456789abcdef0123456789abcdef01234567',
    lifecycle:'development',
    operatingSystem:'Representative OS',
    runtime:'Representative Runtime',
    hardware:'Representative Hardware',
    foregroundState:'foreground',
    presentationMode:'normal',
    measurementDate:'2026-09-18'
  },
  samples:{
    resolver:240,
    interactionPaint:40,
    idleFrames:140,
    activeFrames:300
  },
  measurements:{
    resolverP95Ms:12,
    resolverP99Ms:18,
    interactionPaintP95Ms:130,
    interactionPaintP99Ms:220,
    idleMedianFrameIntervalMs:16.7,
    activeFrameP95Ms:30,
    severeFrameStallRate:0.02,
    catastrophicForegroundStallCount:1,
    taskStateResetCount:1,
    pageReloadRequiredCount:1,
    automaticAuthorityActionCount:1
  }
});
assert(performanceFail.status === 'fail', 'over-budget measurements must fail');
assert(performanceFail.metricChecks.some(check => check.status === 'fail'), 'performance failure must expose failed metrics');

const performanceMissing = evaluateGlazePerformanceMeasurements({
  environment:{
    lifecycle:'development'
  },
  samples:{resolver:240},
  measurements:{resolverP95Ms:8}
});
assert(performanceMissing.status === 'unverified', 'missing performance evidence must remain unverified');
assert(performanceMissing.environment.complete === false, 'incomplete environment metadata must remain incomplete');
assert(performanceMissing.evidence.missingMeasurementInferredPassing === false, 'missing measurement must not infer pass');

const layoutPass = evaluateGlazeLayoutStability({
  skeletonSpaceReserved:true,
  imageSpaceReserved:true,
  dynamicControlSpaceReserved:true,
  asyncContentSpaceReserved:true,
  unexpectedLayoutMovement:false,
  measuredShift:0.03,
  suppliedShiftBudget:0.05
});
assert(layoutPass.status === 'pass', 'layout stability should pass when all supplied checks pass');
assert(layoutPass.evidence.inventedShiftBudget === false, 'layout evaluator must not invent shift budget');

const layoutMissingBudget = evaluateGlazeLayoutStability({
  skeletonSpaceReserved:true,
  imageSpaceReserved:true,
  dynamicControlSpaceReserved:true,
  asyncContentSpaceReserved:true,
  unexpectedLayoutMovement:false,
  measuredShift:0.02
});
assert(layoutMissingBudget.status === 'unverified', 'missing numeric layout budget must remain unverified');

const layoutFail = evaluateGlazeLayoutStability({
  skeletonSpaceReserved:false,
  imageSpaceReserved:true,
  dynamicControlSpaceReserved:true,
  asyncContentSpaceReserved:true,
  unexpectedLayoutMovement:true,
  measuredShift:0.2,
  suppliedShiftBudget:0.05
});
assert(layoutFail.status === 'fail', 'layout instability must fail');

const blurPreferred = resolveGlazeGracefulDegradation({
  effect:'blur',
  capabilityAvailable:true
});
assert(blurPreferred.selected === 'blur', 'available blur should retain preferred effect');

const blurFallback = resolveGlazeGracefulDegradation({
  effect:'blur',
  capabilityAvailable:false
});
assert(blurFallback.selected === 'translucent-solid', 'unsupported blur should use first simpler fallback');
assert(blurFallback.invariants.meaningPreserved === true, 'blur fallback must preserve meaning');

const blurSimplest = resolveGlazeGracefulDegradation({
  effect:'blur',
  capabilityAvailable:false,
  forceSimplest:true
});
assert(blurSimplest.selected === 'opaque-solid', 'forced simplest blur fallback mismatch');

const motionAccessibility = resolveGlazeGracefulDegradation({
  effect:'morph',
  accessibilityRequiresSimplification:true
});
assert(motionAccessibility.selected === 'fade', 'accessibility simplification should select bounded morph fallback');

const skeletonFallback = resolveGlazeGracefulDegradation({
  effect:'animated-skeleton',
  performanceRequiresSimplification:true
});
assert(skeletonFallback.selected === 'static-skeleton', 'performance simplification should make skeleton static');
assert(skeletonFallback.invariants.fallbackExecutionAutomatic === false, 'degradation resolver must not execute fallback');

let invalidDegradation=false;
try { resolveGlazeGracefulDegradation({effect:'magic-glitter'}); } catch { invalidDegradation=true; }
assert(invalidDegradation, 'unknown degradation effect must fail closed');

console.log('GLAZE UI V1.6 performance/diagnostics Development foundation: PASS');
console.log('Implemented sections: 5, 80-87');
console.log('Developer diagnostics: 11 primary codes');
console.log('Accessibility diagnostics: 10 checks');
console.log('Visual regression scenes: 14');
console.log('Performance budget source: Glaze UI Performance Budget v1.0');
console.log('Stable baseline preserved: 1.5.1');
console.log('Consumer eligible: false');
