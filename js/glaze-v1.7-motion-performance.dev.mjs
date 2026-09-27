/* GLAZE UI V1.7 — Motion Performance Development foundation.
 *
 * Bounded v1.2 Section 33 source layer. Resolves caller/provider-supplied
 * environmental pressure into deterministic motion simplification guidance.
 * It does not manufacture measurements, mutate application state, or create
 * release/acceptance authority.
 */

import {
  resolveGlazeMotionFatigueProtection,
  glazeV17MotionFatigueProtectionDevelopmentContract
} from './glaze-v1.7-motion-fatigue-protection.dev.mjs';

const RUNTIME_PRESSURE=Object.freeze(['none','elevated','severe']);
const THERMAL_STATE=Object.freeze(['none','constrained','critical']);
const HARDWARE_CLASS=Object.freeze(['standard','constrained']);
const REFRESH_CLASS=Object.freeze(['normal','low']);
const MOTION_KINDS=Object.freeze([
  'direct-manipulation',
  'task-transition',
  'connected-transformation',
  'adaptive-recomposition',
  'material',
  'skeleton',
  'decorative',
  'continuous-decorative'
]);
const PERFORMANCE_MODES=Object.freeze(['full','restrained','simplified','minimal','reduced-motion']);
const PROHIBITED_KEYS=Object.freeze([
  'duration','durationMs','easing','curve','spring','physics','keyframes','path',
  'travelPx','distance','distancePx','rotation','scale','scaleFactor','overshoot',
  'bounce','wobble','stiffness','damping','dampingRatio','frameBudget','frameBudgetMs',
  'fpsTarget','targetFps','refreshRateHz','cpuThreshold','gpuThreshold','thermalThreshold'
]);

function plainObject(value){
  if(value===null||typeof value!=='object'||Array.isArray(value))return false;
  const proto=Object.getPrototypeOf(value);
  return proto===Object.prototype||proto===null;
}

function semantic(value,fallback){
  const normalized=String(value??'').trim().toLowerCase();
  return normalized||fallback;
}

function member(value,allowed,label,fallback){
  const normalized=semantic(value,fallback);
  if(!allowed.includes(normalized))throw new RangeError('Unsupported '+label+': '+normalized);
  return normalized;
}

function profiles(value){
  if(!Array.isArray(value))return Object.freeze([]);
  return Object.freeze([...new Set(value.map(v=>semantic(v,'')).filter(Boolean))].slice(0,64));
}

function rejectRawControls(input){
  for(const key of PROHIBITED_KEYS){
    if(Object.prototype.hasOwnProperty.call(input,key)){
      throw new RangeError('Motion Performance accepts semantic/environmental signals, not raw animation or performance thresholds: '+key);
    }
  }
}

function directiveFor(kind,mode){
  if(kind==='direct-manipulation'){
    return mode==='full'
      ? 'preserve-input-tracking-with-governed-settle'
      : 'preserve-input-tracking-and-simplify-post-release-settle';
  }
  if(mode==='full')return 'preserve-governed-semantic-motion';
  if(mode==='reduced-motion')return 'use-reduced-motion-semantic-equivalent';
  if(kind==='skeleton')return 'static-skeleton';
  if(kind==='material')return mode==='restrained'?'restrain-material-animation':'static-material-state';
  if(kind==='decorative')return 'suppress-optional-decorative-motion';
  if(kind==='continuous-decorative')return 'stop-optional-continuous-motion';
  if(kind==='adaptive-recomposition')return mode==='restrained'
    ? 'restrain-recomposition-motion'
    : 'immediate-recomposition-with-stable-focus';
  if(kind==='connected-transformation')return mode==='restrained'
    ? 'simplify-connected-transformation'
    : 'simple-state-transition-or-replacement';
  return mode==='restrained'
    ? 'restrain-semantic-transition'
    : mode==='simplified'
      ? 'simpler-semantic-transition'
      : 'immediate-state-with-brief-semantic-emphasis';
}

function performanceMode(input,fatigue,reducedMotion){
  const runtimePressure=member(input.runtimePressure,RUNTIME_PRESSURE,'runtime pressure','none');
  const thermalState=member(input.thermalState,THERMAL_STATE,'thermal state','none');
  const hardwareClass=member(input.hardwareClass,HARDWARE_CLASS,'hardware class','standard');
  const refreshClass=member(input.refreshClass,REFRESH_CLASS,'refresh class','normal');
  const powerSaving=input.powerSaving===true;
  const performanceDegraded=input.performanceDegraded===true;

  const reasons=[];
  if(runtimePressure!=='none')reasons.push('runtime-pressure-'+runtimePressure);
  if(powerSaving)reasons.push('power-saving');
  if(thermalState!=='none')reasons.push('thermal-'+thermalState);
  if(hardwareClass==='constrained')reasons.push('constrained-hardware');
  if(refreshClass==='low')reasons.push('low-refresh');
  if(performanceDegraded)reasons.push('performance-degraded');
  if(fatigue.budget.exhausted)reasons.push('motion-budget-pressure');
  if(reducedMotion)reasons.push('reduced-motion');

  let severity=0;
  if(reasons.length>0)severity=1;
  if(reasons.filter(reason=>reason!=='reduced-motion').length>=2)severity=2;
  if(runtimePressure==='severe'||thermalState==='critical')severity=3;

  const mode=reducedMotion
    ? 'reduced-motion'
    : severity>=3
      ? 'minimal'
      : severity===2
        ? 'simplified'
        : severity===1
          ? 'restrained'
          : 'full';

  return Object.freeze({
    mode,
    severity,
    reasons:Object.freeze(reasons),
    runtimePressure,
    powerSaving,
    thermalState,
    hardwareClass,
    refreshClass,
    performanceDegraded
  });
}

export function resolveGlazeMotionPerformance(input={}){
  if(!plainObject(input))throw new TypeError('Motion Performance input must be a plain object');
  rejectRawControls(input);

  const accessibilityProfiles=profiles(input.accessibilityProfiles);
  const reducedMotion=accessibilityProfiles.includes('reduced-motion')||accessibilityProfiles.includes('minimal-motion');
  const motionKind=member(input.motionKind,MOTION_KINDS,'motion kind','task-transition');
  const fatigue=resolveGlazeMotionFatigueProtection({
    activeMotion:plainObject(input.activeMotion)?input.activeMotion:{},
    accessibilityProfiles,
    repeatedActionPressure:input.repeatedActionPressure===true,
    majorTransitionActive:input.majorTransitionActive===true,
    decorativeMotionRequested:input.decorativeMotionRequested===true
  });
  const performance=performanceMode(input,fatigue,reducedMotion);
  const directManipulation=motionKind==='direct-manipulation'||input.directManipulation===true;
  const directive=directiveFor(directManipulation?'direct-manipulation':motionKind,performance.mode);

  return Object.freeze({
    version:'1.7.0-dev.25',
    lifecycle:'development',
    stableBaseline:'1.6.0',
    consumerEligible:false,
    planVersion:'v1.2',
    v12SpecificationSections:Object.freeze([33]),
    motionKind,
    performance,
    presentation:Object.freeze({
      directive,
      compositorFriendlyTechniquesPreferred:true,
      preferredTechniques:Object.freeze(['transform','opacity','bounded-clipping','platform-native-compositor-primitives']),
      avoidWhenEquivalent:Object.freeze([
        'layout-driven-animation',
        'synchronous-layout-measurement-loops',
        'unbounded-repainting',
        'continuous-main-thread-rendering',
        'unbounded-shader-complexity'
      ]),
      optionalMotionMayDegrade:true,
      directManipulationTrackingPreserved:true,
      taskRelevantStateChangePreserved:true,
      semanticMeaningPreserved:true
    }),
    inheritedFatigueProtection:fatigue,
    accessibility:Object.freeze({
      profiles:accessibilityProfiles,
      reducedMotionApplied:reducedMotion,
      reducedMotionEquivalentCatalogRequired:reducedMotion,
      precedence:true,
      criticalInteractionMayRequireObservingMotion:false
    }),
    evidence:Object.freeze({
      environmentSignalsSuppliedByCallerOrProvider:true,
      measurementsManufactured:false,
      measuredFramePacingEstablished:false,
      measuredInteractionLatencyEstablished:false,
      energyImpactEstablished:false,
      performanceAcceptanceEstablished:false
    }),
    invariants:Object.freeze({
      applicationStateChangedByGlaze:false,
      navigationExecutedByGlaze:false,
      providerTruthCreatedByGlaze:false,
      performanceTruthCreatedByGlaze:false,
      semanticStatePreserved:true,
      authoritativeStatePreserved:true,
      focusPreserved:true,
      taskContinuityPreserved:true,
      finalStateDependsOnAnimationCompletion:false,
      directManipulationTrackingPreserved:true
    }),
    glazeMotionBoundary:Object.freeze({
      experimentalFoundationVersion:'0.6.0',
      experimentalLifecyclePromoted:false
    }),
    acceptanceBoundary:Object.freeze({
      sourceFoundationOnly:true,
      section33Complete:false,
      motionPerformancePolicyImplemented:true,
      measuredPerformanceAcceptanceEstablished:false,
      renderedAcceptanceEstablished:false,
      nativePlatformAcceptanceEstablished:false,
      assistiveTechnologyAcceptanceEstablished:false,
      thermalPowerAcceptanceEstablished:false,
      humanMotionReviewEstablished:false,
      downstreamConsumerAcceptanceAutomatic:false,
      releasePromotionAutomatic:false,
      deploymentAcceptanceAutomatic:false,
      productionAcceptanceAutomatic:false
    })
  });
}

export const glazeV17MotionPerformanceDevelopmentContract=Object.freeze({
  version:'1.7.0-dev.25',
  lifecycle:'development',
  stableBaseline:'1.6.0',
  consumerEligible:false,
  planVersion:'v1.2',
  v12SpecificationSections:Object.freeze([33]),
  runtimePressure:RUNTIME_PRESSURE,
  thermalState:THERMAL_STATE,
  hardwareClass:HARDWARE_CLASS,
  refreshClass:REFRESH_CLASS,
  motionKinds:MOTION_KINDS,
  performanceModes:PERFORMANCE_MODES,
  compositorFriendlyTechniquesPreferred:true,
  directManipulationTrackingPreserved:true,
  semanticStatePreserved:true,
  measurementsManufactured:false,
  section33Complete:false,
  measuredPerformanceAcceptanceEstablished:false,
  thermalPowerAcceptanceEstablished:false,
  humanMotionReviewEstablished:false,
  motionFatigueDependencyVersion:glazeV17MotionFatigueProtectionDevelopmentContract.version,
  glazeMotionExperimentalLifecyclePromoted:false
});
