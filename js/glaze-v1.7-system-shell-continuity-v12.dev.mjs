/* GLAZE UI V1.7 — System Shell Continuity v1.2 Development reconciliation.
 *
 * Bounded v1.2 Section 35 source layer. Historical dev.6 remains the shell
 * capability/task-continuity foundation. This overlay adds semantic Signature
 * Motion relationships without executing shell actions, inventing capability
 * truth, or allowing motion to delay shell navigation.
 */

import {
  resolveGlazeSystemShellContinuity,
  glazeV17SystemShellContinuityDevelopmentContract
} from './glaze-v1.7-system-shell-continuity.dev.mjs';
import {
  resolveGlazeSignatureTransitionFamily,
  glazeV17SignatureTransitionFamiliesDevelopmentContract
} from './glaze-v1.7-signature-transition-families.dev.mjs';
import {
  resolveGlazeReducedMotionEquivalent,
  glazeV17ReducedMotionEquivalentsDevelopmentContract
} from './glaze-v1.7-reduced-motion-equivalents.dev.mjs';
import {
  resolveGlazeMotionFatigueProtection,
  glazeV17MotionFatigueProtectionDevelopmentContract
} from './glaze-v1.7-motion-fatigue-protection.dev.mjs';
import {
  resolveGlazeMotionPerformance,
  glazeV17MotionPerformanceDevelopmentContract
} from './glaze-v1.7-motion-performance.dev.mjs';

const SHELL_POLICY=Object.freeze({
  'notification-activity-presentation':Object.freeze({
    dev6ShellArea:'notification-activity-presentation',
    dev6TransitionKind:'notification-activity-presentation',
    relationship:'transient-elevation',
    expectedFamily:'Glaze Lift',
    motionKind:'task-transition'
  }),
  'control-center':Object.freeze({
    dev6ShellArea:'control-center',
    dev6TransitionKind:'control-center-layout',
    relationship:'context-overlay',
    expectedFamily:'Glaze Veil',
    motionKind:'task-transition'
  }),
  'multi-window':Object.freeze({
    dev6ShellArea:'multi-window',
    dev6TransitionKind:'multi-window-change',
    relationship:'workspace-recomposition',
    expectedFamily:'Glaze Flow',
    motionKind:'adaptive-recomposition'
  }),
  'split-view':Object.freeze({
    dev6ShellArea:'split-view',
    dev6TransitionKind:'split-view-change',
    relationship:'workspace-recomposition',
    expectedFamily:'Glaze Flow',
    motionKind:'adaptive-recomposition'
  }),
  'compact-expanded-navigation':Object.freeze({
    dev6ShellArea:'compact-expanded-navigation',
    dev6TransitionKind:'compact-expanded-navigation',
    relationship:'workspace-recomposition',
    expectedFamily:'Glaze Flow',
    motionKind:'adaptive-recomposition'
  }),
  'window-restoration':Object.freeze({
    dev6ShellArea:'window-restoration',
    dev6TransitionKind:'window-restoration',
    relationship:'workspace-recomposition',
    expectedFamily:'Glaze Flow',
    motionKind:'adaptive-recomposition'
  }),
  'application-system-handoff':Object.freeze({
    dev6ShellArea:'application-system-handoff',
    dev6TransitionKind:'application-system-handoff',
    relationship:'source-destination-continuity',
    expectedFamily:'Glaze Trace',
    motionKind:'task-transition'
  }),
  'task-switching':Object.freeze({
    dev6ShellArea:'task-switching',
    dev6TransitionKind:'task-switching',
    relationship:'focus-transfer',
    expectedFamily:'Glaze Focus Transfer',
    motionKind:'task-transition'
  }),
  'universal-search':Object.freeze({
    dev6ShellArea:'search-continuity',
    dev6TransitionKind:'search-continuity',
    relationship:'context-overlay',
    expectedFamily:'Glaze Veil',
    motionKind:'task-transition'
  }),
  'contextual-commands':Object.freeze({
    dev6ShellArea:'contextual-command-surfaces',
    dev6TransitionKind:'contextual-command-surface',
    relationship:'transient-elevation',
    expectedFamily:'Glaze Lift',
    motionKind:'task-transition'
  })
});

const SECTION35_AREAS=Object.freeze(Object.keys(SHELL_POLICY));

const PROHIBITED_KEYS=Object.freeze([
  'relationship','relationshipAuthoritative','family','signatureFamily','requestedFamily',
  'duration','durationMs','easing','spring','physics','keyframes','path','travelPx',
  'distance','rotation','scale','overshoot','bounce','wobble','frameBudgetMs',
  'targetFps','performanceThresholds','performanceEvidence','measurements','samples'
]);

function plainObject(value){
  if(value===null||typeof value!=='object'||Array.isArray(value))return false;
  const proto=Object.getPrototypeOf(value);
  return proto===Object.prototype||proto===null;
}

function rejectRawControl(input){
  for(const key of PROHIBITED_KEYS){
    if(Object.prototype.hasOwnProperty.call(input,key)){
      throw new RangeError(`System Shell Continuity v1.2 accepts governed shell semantics, not direct motion/performance control: ${key}`);
    }
  }
}

function member(value,allowed,label){
  const normalized=String(value??'').trim().toLowerCase();
  if(!allowed.includes(normalized))throw new RangeError(`Unsupported ${label}: ${normalized||'(empty)'}`);
  return normalized;
}

function signatureInput(input,policy,shell){
  return {
    relationship:policy.relationship,
    relationshipAuthoritative:shell.presentation.available===true
      &&shell.presentation.capabilityAuthoritative===true,
    objectIdentity:input.objectIdentity,
    objectIdentityAuthoritative:input.objectIdentityAuthoritative===true,
    accessibilityProfiles:input.accessibilityProfiles,
    activeMotion:input.activeMotion,
    userDriven:input.userDriven!==false,
    fromState:input.fromState,
    toState:input.toState,
    criticalSurface:input.criticalSurface,
    criticalSurfaceAuthoritative:input.criticalSurfaceAuthoritative===true
  };
}

function performanceInput(input,policy){
  return {
    motionKind:policy.motionKind,
    accessibilityProfiles:input.accessibilityProfiles,
    activeMotion:plainObject(input.activeMotion)?input.activeMotion:{},
    repeatedActionPressure:input.repeatedActionPressure===true,
    majorTransitionActive:true,
    decorativeMotionRequested:false,
    runtimePressure:input.runtimePressure,
    runtimePressureAuthoritative:input.runtimePressureAuthoritative===true,
    powerSaving:input.powerSaving===true,
    powerSavingAuthoritative:input.powerSavingAuthoritative===true,
    thermalState:input.thermalState,
    thermalStateAuthoritative:input.thermalStateAuthoritative===true,
    hardwareClass:input.hardwareClass,
    hardwareClassAuthoritative:input.hardwareClassAuthoritative===true,
    refreshClass:input.refreshClass,
    refreshClassAuthoritative:input.refreshClassAuthoritative===true,
    performanceDegraded:input.performanceDegraded===true,
    performanceDegradedAuthoritative:input.performanceDegradedAuthoritative===true,
    visibilityClass:input.visibilityClass,
    visibilityClassAuthoritative:input.visibilityClassAuthoritative===true
  };
}

export function resolveGlazeSystemShellContinuityV12(input={}){
  if(!plainObject(input))throw new TypeError('System Shell Continuity v1.2 input must be a plain object');
  rejectRawControl(input);

  const shellArea=member(input.shellArea,SECTION35_AREAS,'Section 35 shell area');
  const policy=SHELL_POLICY[shellArea];

  const shell=resolveGlazeSystemShellContinuity({
    ...input,
    shellArea:policy.dev6ShellArea,
    transitionKind:policy.dev6TransitionKind
  });

  const semanticMotion=signatureInput(input,policy,shell);
  const transitionFamily=resolveGlazeSignatureTransitionFamily(semanticMotion);
  const reducedMotion=resolveGlazeReducedMotionEquivalent(semanticMotion);
  const fatigue=resolveGlazeMotionFatigueProtection({
    activeMotion:plainObject(input.activeMotion)?input.activeMotion:{},
    accessibilityProfiles:input.accessibilityProfiles,
    repeatedActionPressure:input.repeatedActionPressure===true,
    majorTransitionActive:true,
    decorativeMotionRequested:false
  });
  const performance=resolveGlazeMotionPerformance(performanceInput(input,policy));

  const presentationAllowed=shell.presentation.available===true;
  const signatureApplied=presentationAllowed
    &&transitionFamily.sourceFoundation.relationshipAccepted===true;
  const resolvedFamily=signatureApplied
    ?transitionFamily.choreography.family
    :'Standard transition';
  const reducedEquivalent=reducedMotion.equivalent.applied===true
    ?reducedMotion.equivalent.presentation
    :null;

  return Object.freeze({
    version:'1.7.0-dev.27',
    lifecycle:'development',
    stableBaseline:'1.6.0',
    consumerEligible:false,
    planVersion:'v1.2',
    v12SpecificationSections:Object.freeze([35]),
    shellArea,
    historicalFoundation:Object.freeze({
      version:shell.version,
      implementedSpecificationSections:glazeV17SystemShellContinuityDevelopmentContract.implementedSpecificationSections,
      shellArea:policy.dev6ShellArea,
      transitionKind:policy.dev6TransitionKind,
      preservedAsHistoricalProvenance:true
    }),
    shell,
    signatureMotion:Object.freeze({
      relationship:policy.relationship,
      expectedFamily:policy.expectedFamily,
      relationshipAccepted:transitionFamily.sourceFoundation.relationshipAccepted,
      family:resolvedFamily,
      familyId:signatureApplied?transitionFamily.choreography.familyId:'standard-transition',
      signatureApplied,
      presentationAllowed,
      motionProposalOnly:true,
      reducedMotionApplied:reducedMotion.equivalent.applied===true,
      reducedMotionEquivalent:reducedEquivalent,
      performanceMode:performance.performance.mode,
      performanceDirective:performance.presentation.directive,
      fatigueBudgetExhausted:fatigue.budget.exhausted,
      motionMayDelayShellNavigation:false,
      motionMayDelayProviderExecution:false,
      finalStateDependsOnAnimationCompletion:false,
      artificialNavigationDelayAllowed:false
    }),
    continuity:Object.freeze({
      activeTaskPreserved:shell.continuity.activeTaskPreserved,
      navigationDestinationPreserved:shell.continuity.navigationDestinationPreserved,
      focusPreserved:shell.continuity.focusPreserved,
      selectionPreserved:shell.continuity.selectionPreserved,
      draftsPreserved:shell.continuity.draftsPreserved,
      queryFilterContextPreserved:shell.continuity.queryFilterContextPreserved,
      paneWindowStatePreserved:shell.continuity.paneWindowStatePreserved,
      safePendingInteractionsPreserved:shell.continuity.safePendingInteractionsPreserved,
      providerOwnedTruthPreserved:shell.continuity.providerOwnedTruthPreserved,
      shellRecompositionMayResetTask:false,
      stateAppliedIndependentlyOfMotion:true
    }),
    accessibility:Object.freeze({
      reducedMotionPrecedence:true,
      reducedMotionApplied:reducedMotion.equivalent.applied===true,
      equivalentPresentationRequired:true,
      motionRequiredToUnderstandState:false,
      criticalInteractionMayRequireObservingMotion:false,
      directManipulationTrackingPreserved:true
    }),
    performance:Object.freeze({
      mode:performance.performance.mode,
      directive:performance.presentation.directive,
      compositorFriendlyTechniquesPreferred:performance.presentation.compositorFriendlyTechniquesPreferred,
      offscreenOptionalWorkSuspended:performance.presentation.offscreenOptionalWorkSuspended,
      idleRenderLoopsAllowed:false,
      inputMayWaitForDecorativeMotion:false,
      measuredFramePacingEstablished:false,
      measuredInteractionLatencyEstablished:false,
      energyImpactEstablished:false
    }),
    dependencies:Object.freeze({
      historicalSystemShellVersion:glazeV17SystemShellContinuityDevelopmentContract.version,
      signatureTransitionFamiliesVersion:glazeV17SignatureTransitionFamiliesDevelopmentContract.version,
      reducedMotionEquivalentsVersion:glazeV17ReducedMotionEquivalentsDevelopmentContract.version,
      motionFatigueProtectionVersion:glazeV17MotionFatigueProtectionDevelopmentContract.version,
      motionPerformanceVersion:glazeV17MotionPerformanceDevelopmentContract.version
    }),
    authority:Object.freeze({
      presentationOnly:true,
      shellConfigurationOwnedByCallerOrPlatform:true,
      capabilityOwnedByCallerOrPlatform:true,
      providerTruthOwnedByProvider:true,
      semanticRelationshipDerivedOnlyFromExplicitShellArea:true,
      objectIdentityCreatedByGlaze:false,
      windowingSupportCreatedByGlaze:false,
      systemPrivilegesGrantedByGlaze:false,
      notificationTruthCreatedByGlaze:false,
      activityTruthCreatedByGlaze:false,
      searchAuthorityCreatedByGlaze:false,
      navigationAuthorityCreatedByGlaze:false,
      executionAuthorityCreatedByGlaze:false,
      persistencePerformedByGlaze:false,
      actionExecutedByMotion:false,
      navigationExecutedByMotion:false,
      providerExecutionBlockedByMotion:false
    }),
    glazeMotionBoundary:Object.freeze({
      experimentalFoundationVersion:'0.6.0',
      runtimeCompatibilityBaseline:'0.4.0',
      experimentalLifecyclePromoted:false
    }),
    acceptanceBoundary:Object.freeze({
      sourceFoundationOnly:true,
      section35Complete:false,
      historicalDev6ReinterpretedAsSection35:false,
      semanticShellMotionMappingImplemented:true,
      renderedAcceptanceEstablished:false,
      nativePlatformAcceptanceEstablished:false,
      assistiveTechnologyAcceptanceEstablished:false,
      measuredPerformanceAcceptanceEstablished:false,
      physicalDeviceAcceptanceEstablished:false,
      energyImpactAcceptanceEstablished:false,
      humanMotionReviewEstablished:false,
      downstreamConsumerAcceptanceAutomatic:false,
      releasePromotionAutomatic:false,
      deploymentAcceptanceAutomatic:false,
      productionAcceptanceAutomatic:false
    })
  });
}

export const glazeV17SystemShellContinuityV12DevelopmentContract=Object.freeze({
  version:'1.7.0-dev.27',
  lifecycle:'development',
  stableBaseline:'1.6.0',
  consumerEligible:false,
  planVersion:'v1.2',
  v12SpecificationSections:Object.freeze([35]),
  section35Areas:SECTION35_AREAS,
  shellPolicy:SHELL_POLICY,
  historicalSystemShellVersion:glazeV17SystemShellContinuityDevelopmentContract.version,
  signatureTransitionFamiliesVersion:glazeV17SignatureTransitionFamiliesDevelopmentContract.version,
  reducedMotionEquivalentsVersion:glazeV17ReducedMotionEquivalentsDevelopmentContract.version,
  motionFatigueProtectionVersion:glazeV17MotionFatigueProtectionDevelopmentContract.version,
  motionPerformanceVersion:glazeV17MotionPerformanceDevelopmentContract.version,
  artificialNavigationDelayAllowed:false,
  motionMayDelayProviderExecution:false,
  section35Complete:false,
  consumerAcceptanceAutomatic:false
});
