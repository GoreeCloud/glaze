/* GLAZE UI V1.7 — Privacy and Authority Boundaries.
 *
 * Bounded v1.2 Section 44 Development foundation.
 * Motion communicates authoritative truth. Motion never creates truth.
 */

import {glazeV17VisualMotionDirectionDevelopmentContract}
  from './glaze-v1.7-visual-motion-direction.dev.mjs';

export const PRIVACY_AUTHORITY_TRUTH_DOMAINS=Object.freeze([
  'security-protection',
  'privacy-access',
  'synchronization',
  'operation-result',
  'recovery',
  'identity-authentication'
]);

export const PRIVACY_AUTHORITY_EVENTS=Object.freeze([
  'protection-enabled',
  'protection-disabled',
  'privacy-access-revoked',
  'privacy-access-granted',
  'synchronization-completed',
  'synchronization-failed',
  'operation-succeeded',
  'operation-failed',
  'recovery-completed',
  'recovery-failed',
  'identity-authenticated',
  'identity-signed-out'
]);

const TRUTH_STATES=Object.freeze(['confirmed','refuted','unknown']);
const AUTHORITY_SOURCES=Object.freeze([
  'wardveil-security',
  'privacy-shield',
  'everkeep',
  'goreecloud-identity',
  'responsible-provider'
]);

const EVENT_DOMAIN=Object.freeze({
  'protection-enabled':'security-protection',
  'protection-disabled':'security-protection',
  'privacy-access-revoked':'privacy-access',
  'privacy-access-granted':'privacy-access',
  'synchronization-completed':'synchronization',
  'synchronization-failed':'synchronization',
  'operation-succeeded':'operation-result',
  'operation-failed':'operation-result',
  'recovery-completed':'recovery',
  'recovery-failed':'recovery',
  'identity-authenticated':'identity-authentication',
  'identity-signed-out':'identity-authentication'
});

const DOMAIN_AUTHORITY=Object.freeze({
  'security-protection':Object.freeze(['wardveil-security']),
  'privacy-access':Object.freeze(['privacy-shield','responsible-provider']),
  'synchronization':Object.freeze(['responsible-provider']),
  'operation-result':Object.freeze(['responsible-provider']),
  'recovery':Object.freeze(['everkeep','responsible-provider']),
  'identity-authentication':Object.freeze(['goreecloud-identity'])
});

const PROHIBITED_KEYS=Object.freeze([
  'protected','isProtected','secure','isSecure','success','isSuccess','synced','isSynced',
  'completed','isCompleted','revoked','isRevoked','authenticated','isAuthenticated',
  'authorized','isAuthorized','permissionGranted','consentGranted','accessGranted',
  'providerPrecedence','providerPriority','authorityRank','winner','score','rating',
  'duration','durationMs','easing','spring','keyframes','blur','blurPx','opacity'
]);

function plainObject(value){
  if(value===null||typeof value!=='object'||Array.isArray(value))return false;
  const proto=Object.getPrototypeOf(value);
  return proto===Object.prototype||proto===null;
}

function member(value,allowed,label,fallback=null){
  const normalized=String(value??fallback??'').trim().toLowerCase();
  if(!allowed.includes(normalized))throw new RangeError('Unsupported '+label+': '+normalized);
  return normalized;
}

function rejectRawTruthControls(input,scope='privacy/authority input'){
  if(!plainObject(input))return;
  for(const key of PROHIBITED_KEYS){
    if(Object.prototype.hasOwnProperty.call(input,key)){
      throw new RangeError(scope+' accepts authoritative semantic truth evidence, not raw truth, authority, ranking, or effect controls: '+key);
    }
  }
}

function resolveAuthority(input,domain){
  const source=member(input.authoritySource,AUTHORITY_SOURCES,'authority source','responsible-provider');
  const authoritative=input.authorityAuthoritative===true;
  const responsibleProviderId=String(input.responsibleProviderId??'').trim();

  if(source==='responsible-provider'&&authoritative&&responsibleProviderId.length===0){
    throw new RangeError('Authoritative responsible-provider evidence requires responsibleProviderId');
  }

  const sourceAllowed=DOMAIN_AUTHORITY[domain].includes(source);
  return Object.freeze({
    source,
    authoritative,
    sourceAllowed,
    responsibleProviderId:source==='responsible-provider'&&responsibleProviderId?responsibleProviderId:null,
    validForDomain:authoritative&&sourceAllowed,
    providerPrecedenceInferred:false,
    authorityCreatedByGlaze:false
  });
}

function resolutionFor(truthState,authority){
  if(truthState==='unknown'){
    return Object.freeze({
      effectiveTruth:'unknown',
      truthBearingMotionAllowed:false,
      presentationDirective:'neutral-unknown',
      reason:'truth-unknown'
    });
  }

  if(!authority.validForDomain){
    return Object.freeze({
      effectiveTruth:'unknown',
      truthBearingMotionAllowed:false,
      presentationDirective:'neutral-unknown',
      reason:authority.authoritative?'authority-source-not-valid-for-domain':'authority-not-authoritative'
    });
  }

  if(truthState==='refuted'){
    return Object.freeze({
      effectiveTruth:'refuted',
      truthBearingMotionAllowed:false,
      presentationDirective:'confirmed-negative-semantic-state',
      reason:'authoritative-refutation'
    });
  }

  return Object.freeze({
    effectiveTruth:'confirmed',
    truthBearingMotionAllowed:true,
    presentationDirective:'confirmed-truth-transition',
    reason:'authoritative-confirmation'
  });
}

function acceptanceBoundary(){
  return Object.freeze({
    sourceFoundationOnly:true,
    section44Complete:false,
    renderedAcceptanceEstablished:false,
    nativePlatformAcceptanceEstablished:false,
    assistiveTechnologyAcceptanceEstablished:false,
    representativeDeviceAcceptanceEstablished:false,
    providerIntegrationAcceptanceEstablished:false,
    privacyBoundaryAcceptanceEstablished:false,
    securityBoundaryAcceptanceEstablished:false,
    measuredPerformanceAcceptanceEstablished:false,
    energyAcceptanceEstablished:false,
    humanReviewEstablished:false,
    downstreamConsumerAcceptanceAutomatic:false,
    releasePromotionAutomatic:false,
    deploymentAcceptanceAutomatic:false,
    productionAcceptanceAutomatic:false
  });
}

export function resolveGlazePrivacyAuthorityBoundaryV12(input={}){
  if(!plainObject(input))throw new TypeError('Privacy and Authority Boundaries input must be a plain object');
  rejectRawTruthControls(input);

  const truthDomain=member(input.truthDomain,PRIVACY_AUTHORITY_TRUTH_DOMAINS,'truth domain');
  const event=member(input.event,PRIVACY_AUTHORITY_EVENTS,'truth-bearing event');
  const truthState=member(input.truthState,TRUTH_STATES,'truth state','unknown');

  if(EVENT_DOMAIN[event]!==truthDomain){
    throw new RangeError('Truth-bearing event does not belong to requested truth domain');
  }

  const authority=resolveAuthority(input,truthDomain);
  const resolution=resolutionFor(truthState,authority);

  return Object.freeze({
    version:'1.7.0-dev.37',
    lifecycle:'Development',
    stableBaseline:'1.6.0',
    consumerEligible:false,
    planVersion:'v1.2',
    v12SpecificationSections:Object.freeze([44]),
    truthDomain,
    event,
    requestedTruth:truthState,
    authority,
    resolution,
    governingRule:Object.freeze({
      motionCommunicatesTruth:true,
      motionCreatesTruth:false,
      adaptivePresentationCreatesTruth:false,
      truthBearingTransitionRequiresAuthoritativeState:true,
      unknownOrUntrustedTruthFailsClosed:true,
      providerPrecedenceInferred:false
    }),
    authorityBoundary:Object.freeze({
      presentationOnly:true,
      truthOwnedByResponsibleProvider:true,
      securityTruthCreatedByGlaze:false,
      privacyTruthCreatedByGlaze:false,
      synchronizationTruthCreatedByGlaze:false,
      successTruthCreatedByGlaze:false,
      recoveryTruthCreatedByGlaze:false,
      identityTruthCreatedByGlaze:false,
      authorizationGrantedByGlaze:false,
      permissionGrantedByGlaze:false,
      consentGrantedByGlaze:false,
      accessRevocationExecutedByGlaze:false,
      protectionActivatedByGlaze:false,
      synchronizationCompletedByGlaze:false,
      recoveryCompletedByGlaze:false,
      stateDependsOnAnimationCompletion:false
    }),
    acceptance:acceptanceBoundary()
  });
}

export const glazeV17PrivacyAuthorityBoundariesDevelopmentContract=Object.freeze({
  version:'1.7.0-dev.37',
  lifecycle:'Development',
  stableBaseline:'1.6.0',
  consumerEligible:false,
  planVersion:'v1.2',
  v12SpecificationSections:Object.freeze([44]),
  visualMotionDirectionVersion:glazeV17VisualMotionDirectionDevelopmentContract.version,
  truthDomains:PRIVACY_AUTHORITY_TRUTH_DOMAINS,
  truthBearingEvents:PRIVACY_AUTHORITY_EVENTS,
  motionCommunicatesTruth:true,
  motionCreatesTruth:false,
  adaptivePresentationCreatesTruth:false,
  providerPrecedenceInferred:false,
  truthBearingMotionRequiresAuthoritativeState:true,
  rawTruthControlsAccepted:false,
  section44Complete:false,
  acceptance:acceptanceBoundary()
});
