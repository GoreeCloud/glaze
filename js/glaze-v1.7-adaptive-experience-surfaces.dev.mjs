/* Glaze V1.7 - Adaptive Experience Surfaces Development foundation.
 *
 * Bounded V1.7 v1.3 Section 48 source layer for the eight remaining adaptive
 * experience surfaces. This is presentation-only source. It does not invent
 * provider truth, authorization, permission, user intent, ranking, health,
 * success, approval, acceptance, or lifecycle state.
 */

import {
  resolveGlazeTaskContinuity,
  resolveGlazeAdaptiveComposition,
  glazeV17TaskContinuityDevelopmentContract
} from './glaze-v1.7-task-continuity.dev.mjs';
import {
  resolveGlazeAccessibilityContinuity,
  glazeV17AccessibilityContinuityDevelopmentContract
} from './glaze-v1.7-accessibility-continuity.dev.mjs';
import {
  resolveGlazePrivacyAuthorityBoundaryV12,
  glazeV17PrivacyAuthorityBoundariesDevelopmentContract
} from './glaze-v1.7-privacy-authority-boundaries.dev.mjs';
import {
  resolveGlazePerformanceEnergyAwareness,
  glazeV17PerformanceEnergyAwarenessDevelopmentContract
} from './glaze-v1.7-performance-energy-awareness.dev.mjs';
import {
  resolveGlazeExpressionV13,
  glazeV17ExpressionSystemDevelopmentContract
} from './glaze-v1.7-expression-system.dev.mjs';

export const ADAPTIVE_EXPERIENCE_SURFACES=Object.freeze([
  'glaze-workspace',
  'glaze-compact-surface',
  'glaze-agent-activity',
  'glaze-privacy-attention',
  'glaze-accessibility-presentation',
  'glaze-creative-surface',
  'glaze-compare',
  'glaze-care-surface'
]);

export const WORKSPACE_PANE_ROLES=Object.freeze([
  'primary','secondary','supporting','inspector','media','utility'
]);
export const WORKSPACE_COMPOSITION_MODES=Object.freeze([
  'one-pane','two-pane','three-pane','multi-pane'
]);
export const COMPACT_SURFACE_KINDS=Object.freeze([
  'cover-display','wearable','widget','secondary-display','tv-overlay','constrained'
]);
export const COMPACT_ITEM_KINDS=Object.freeze([
  'status','action','summary','progress','navigation','media','notification'
]);
export const AGENT_ACTIVITY_KINDS=Object.freeze([
  'access','action','scope','result','history'
]);
export const AGENT_ACCESS_STATES=Object.freeze([
  'unknown','requested','active','revoked','denied','ended'
]);
export const AGENT_RESULT_STATES=Object.freeze([
  'unknown','pending','success','warning','failed','canceled'
]);
export const ACCESSIBILITY_PRESENTATION_MODES=Object.freeze([
  'standard','text-spotlight','enlarged-presentation','pointer-assistance'
]);
export const CREATIVE_STAGES=Object.freeze([
  'proposal','preview','edit','pending-change','selection','approval','committed-result'
]);
export const CARE_DOMAINS=Object.freeze([
  'device','application','storage','performance','energy','maintenance','recovery','service'
]);
export const CARE_STATES=Object.freeze([
  'unknown','healthy','attention','degraded','unavailable','pending','in-progress','complete','failed'
]);

const FORM_FACTORS=Object.freeze(['mobile','tablet','desktop','foldable','tv','wearable','compact']);
const ADAPTIVE_PROFILES=Object.freeze(['mobile','tablet','desktop','foldable','tv','wearable']);
const INPUT_CONTEXTS=Object.freeze(['touch','pointer','keyboard','remote','voice','switch','mixed']);
const DENSITIES=Object.freeze(['compact','standard','spacious']);
const EXPRESSION_PROFILES=Object.freeze(['calm','balanced','expressive']);
const PERFORMANCE_PRESSURES=Object.freeze(['neutral','constrained','severe']);

const PROHIBITED_KEYS=Object.freeze([
  'rank','ranking','score','rating','winner','preferredWinner','recommendationScore','confidence',
  'permission','permissionGranted','authorized','authorization','consent','consented','trusted','trustworthy',
  'success','completed','completion','healthy','protected','secure','private','approved','accepted',
  'providerTruth','forceState','forceSuccess','forceApproval','forceSelection','forceHealthy',
  'radius','borderRadius','cornerRadiusPx','fontSizePx','fontWeight','fontFamily','color','colorHex',
  'paddingPx','marginPx','gapPx','elevationDp','opacity','blurPx','backdropBlurPx',
  'duration','durationMs','delayMs','easing','curve','spring','physics','keyframes','path','travelPx',
  'fps','targetFps','frameBudget','energyBudget','performanceMeasurements','energyMeasurements',
  'productionEligible','anchorStatus','lifecyclePromotion'
]);

function plainObject(value){
  if(value===null||typeof value!=='object'||Array.isArray(value))return false;
  const proto=Object.getPrototypeOf(value);
  return proto===Object.prototype||proto===null;
}
function boundedText(value,max=180){
  const normalized=String(value??'').trim();
  return normalized?normalized.slice(0,max):null;
}
function requiredText(value,label,max=180){
  const normalized=boundedText(value,max);
  if(normalized===null)throw new TypeError(label+' is required');
  return normalized;
}
function member(value,allowed,label,fallback){
  const normalized=String(value??fallback??'').trim().toLowerCase();
  if(!allowed.includes(normalized))throw new RangeError('Unsupported '+label+': '+normalized);
  return normalized;
}
function rejectUngoverned(input,scope){
  if(!plainObject(input))return;
  for(const key of PROHIBITED_KEYS){
    if(Object.prototype.hasOwnProperty.call(input,key)){
      throw new RangeError(scope+' accepts governed semantic/source state, not raw design, ranking, authority, truth, measurement, acceptance, or lifecycle controls: '+key);
    }
  }
}
function uniqueIds(values,max=200){
  if(!Array.isArray(values))return Object.freeze([]);
  return Object.freeze([...new Set(values.map(v=>boundedText(v,180)).filter(Boolean))].slice(0,max));
}
function sourceIdentity(input,prefix='provider'){
  const id=boundedText(input.providerId??input.sourceId,180);
  const authoritative=input.providerIdentityAuthoritative===true||input.sourceIdentityAuthoritative===true;
  return Object.freeze({
    requestedId:id,
    authoritative,
    acceptedId:authoritative?id:null,
    complete:authoritative&&id!==null,
    withheldWithoutAuthority:!authoritative&&id!==null,
    identityCreatedByGlaze:false,
    identityPrefix:prefix
  });
}
function formFactor(input,fallback='desktop'){
  return member(input.formFactor,FORM_FACTORS,'form factor',fallback);
}
function profile(input,fallback='desktop'){
  const requested=formFactor(input,fallback);
  return requested==='compact'?'mobile':member(requested,ADAPTIVE_PROFILES,'adaptive profile',fallback);
}
function inputContext(input,fallback='mixed'){
  return member(input.inputContext,INPUT_CONTEXTS,'input context',fallback);
}
function expressionFor(input,overrides={}){
  return resolveGlazeExpressionV13({
    geometryRole:overrides.geometryRole??'grouped',
    emphasisRole:overrides.emphasisRole??'standard',
    typographyRole:overrides.typographyRole??'body',
    containmentRole:overrides.containmentRole??'related-content',
    componentRole:overrides.componentRole??'content',
    formFactor:formFactor(input),
    inputContext:inputContext(input),
    densityRole:member(input.densityRole,DENSITIES,'density role','standard'),
    colorIntent:overrides.colorIntent??'none',
    compositionRole:overrides.compositionRole??'single-pane',
    expressionProfile:member(input.expressionProfile,EXPRESSION_PROFILES,'expression profile','balanced'),
    expressionProfileAuthoritative:input.expressionProfileAuthoritative===true,
    performancePressure:member(input.performancePressure,PERFORMANCE_PRESSURES,'performance pressure','neutral'),
    performancePressureAuthoritative:input.performancePressureAuthoritative===true,
    accessibility:plainObject(input.accessibility)?input.accessibility:{},
    accessibilityAuthoritative:input.accessibilityAuthoritative===true,
    semanticSeverity:overrides.semanticSeverity??'ordinary',
    semanticSeverityAuthoritative:overrides.semanticSeverityAuthoritative===true,
    motionPurpose:overrides.motionPurpose??'state-change',
    transitionOccurrenceAuthoritative:input.transitionOccurrenceAuthoritative===true
  });
}
function performanceFor(input,presentationDomain='material'){
  return resolveGlazePerformanceEnergyAwareness({
    presentationDomain,
    accessibilityProfiles:Array.isArray(input.accessibilityProfiles)?input.accessibilityProfiles:[],
    runtimePressure:input.runtimePressure,
    runtimePressureAuthoritative:input.runtimePressureAuthoritative===true,
    powerSaving:input.powerSaving,
    powerSavingAuthoritative:input.powerSavingAuthoritative===true,
    thermalState:input.thermalState,
    thermalStateAuthoritative:input.thermalStateAuthoritative===true,
    hardwareClass:input.hardwareClass,
    hardwareClassAuthoritative:input.hardwareClassAuthoritative===true,
    refreshClass:input.refreshClass,
    refreshClassAuthoritative:input.refreshClassAuthoritative===true,
    performanceDegraded:input.performanceDegraded,
    performanceDegradedAuthoritative:input.performanceDegradedAuthoritative===true,
    visibilityClass:input.visibilityClass,
    visibilityClassAuthoritative:input.visibilityClassAuthoritative===true
  });
}

export function resolveGlazeWorkspacePane(input={}){
  if(!plainObject(input))throw new TypeError('Workspace pane input must be a plain object');
  rejectUngoverned(input,'Glaze Workspace pane');
  const paneId=requiredText(input.paneId,'paneId');
  const role=member(input.role,WORKSPACE_PANE_ROLES,'workspace pane role','supporting');
  return Object.freeze({
    paneId,
    role,
    title:boundedText(input.title,240),
    source:sourceIdentity(input),
    visible:input.visible!==false,
    semanticIdentityPreserved:true,
    focusIdentityPreserved:true,
    selectionIdentityPreserved:true,
    providerTruthCreatedByGlaze:false
  });
}

export function resolveGlazeWorkspace(input={}){
  if(!plainObject(input))throw new TypeError('Glaze Workspace input must be a plain object');
  rejectUngoverned(input,'Glaze Workspace');
  const panes=Object.freeze((Array.isArray(input.panes)?input.panes:[]).map(resolveGlazeWorkspacePane));
  const visible=panes.filter(pane=>pane.visible);
  const mode=member(input.compositionMode,WORKSPACE_COMPOSITION_MODES,'workspace composition mode',
    visible.length<=1?'one-pane':visible.length===2?'two-pane':visible.length===3?'three-pane':'multi-pane');
  const adaptive=resolveGlazeAdaptiveComposition({
    profile:profile(input),
    semanticSurfaceId:boundedText(input.semanticSurfaceId,180)??'glaze-workspace',
    surfaceRole:'task',
    posture:boundedText(input.posture,80)??'unknown',
    accessibilityProfiles:Array.isArray(input.accessibilityProfiles)?input.accessibilityProfiles:[],
    constrained:input.constrained===true
  });
  const continuity=resolveGlazeTaskContinuity({
    environmentChange:input.environmentChange??'multi-pane-recomposition',
    previous:plainObject(input.previousTaskState)?input.previousTaskState:{},
    incoming:plainObject(input.incomingTaskState)?input.incomingTaskState:{},
    stateClasses:plainObject(input.stateClasses)?input.stateClasses:{},
    clearFields:input.clearFields,
    clearAuthoritative:input.clearAuthoritative,
    temporaryDisposableFields:input.temporaryDisposableFields,
    lossDirectedFields:input.lossDirectedFields,
    providerAuthoritativeFields:input.providerAuthoritativeFields,
    recoveryStateFields:input.recoveryStateFields
  });
  const expression=expressionFor(input,{
    geometryRole:'structural',
    componentRole:'content',
    compositionRole:mode==='one-pane'?'single-pane':mode==='two-pane'?'primary-secondary':'multi-pane',
    motionPurpose:'adaptive-composition'
  });
  return Object.freeze({
    version:'1.7.0-dev.42',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
    planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),component:'Glaze Workspace',
    panes,visiblePaneIds:Object.freeze(visible.map(p=>p.paneId)),compositionMode:mode,
    adaptiveComposition:adaptive,taskState:continuity.state,continuity:continuity.continuity,
    presentation:Object.freeze({expression,taskStateResetAllowed:false,paneMeaningMayChangeDuringRecomposition:false}),
    authority:Object.freeze({presentationOnly:true,providerTruthCreatedByGlaze:false,navigationExecutedByGlaze:false,
      applicationStateChangedByGlaze:false,permissionGrantedByGlaze:false,authorizationGrantedByGlaze:false})
  });
}

export function resolveGlazeCompactItem(input={}){
  if(!plainObject(input))throw new TypeError('Compact item input must be a plain object');
  rejectUngoverned(input,'Glaze Compact item');
  const itemId=requiredText(input.itemId,'itemId');
  const kind=member(input.kind,COMPACT_ITEM_KINDS,'compact item kind','status');
  const source=sourceIdentity(input);
  const requestedState=boundedText(input.stateId,120)??'unknown';
  const stateAuthoritative=input.stateAuthoritative===true;
  return Object.freeze({
    itemId,kind,source,label:boundedText(input.label,220),summary:boundedText(input.summary,420),
    state:Object.freeze({requested:requestedState,authoritative:stateAuthoritative,
      accepted:stateAuthoritative?requestedState:'unknown',stateCreatedByGlaze:false}),
    presentation:Object.freeze({eligible:source.complete,glanceable:true,colorOnlyMeaningAllowed:false,
      gestureOnlyInteractionAllowed:false})
  });
}

export function resolveGlazeCompactSurface(input={}){
  if(!plainObject(input))throw new TypeError('Glaze Compact Surface input must be a plain object');
  rejectUngoverned(input,'Glaze Compact Surface');
  const kind=member(input.kind,COMPACT_SURFACE_KINDS,'compact surface kind','constrained');
  const items=Object.freeze((Array.isArray(input.items)?input.items:[]).map(resolveGlazeCompactItem));
  const expression=expressionFor({...input,formFactor:input.formFactor??(kind==='wearable'?'wearable':'compact')},{
    geometryRole:'grouped',componentRole:'content',compositionRole:'compact',motionPurpose:'state-change'
  });
  return Object.freeze({
    version:'1.7.0-dev.42',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
    planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),component:'Glaze Compact Surface',
    kind,items,visibleItems:Object.freeze(items.filter(i=>i.presentation.eligible)),
    presentation:Object.freeze({expression,glanceabilityRequired:true,essentialMeaningMustSurviveReducedMotion:true,
      essentialMeaningMustSurviveReducedTransparency:true,colorOnlyMeaningAllowed:false}),
    authority:Object.freeze({presentationOnly:true,providerTruthCreatedByGlaze:false,actionExecutedByGlaze:false,
      navigationExecutedByGlaze:false})
  });
}

function agentTruth(input,domain,state,stateAuthoritative){
  const providerId=requiredText(input.providerId,'providerId');
  return resolveGlazePrivacyAuthorityBoundaryV12({
    truthDomain:domain,
    claims:[{
      providerId,
      ownerKind:'responsible-provider',
      authority:'service',
      scope:'provider-local',
      state,
      authorityAttested:input.providerIdentityAuthoritative===true&&stateAuthoritative
    }],
    expressionProfile:input.expressionProfile??'balanced',
    expressionProfileAuthoritative:input.expressionProfileAuthoritative===true,
    performancePressure:input.performancePressure??'neutral',
    performancePressureAuthoritative:input.performancePressureAuthoritative===true,
    accessibility:plainObject(input.accessibility)?input.accessibility:{},
    accessibilityAuthoritative:input.accessibilityAuthoritative===true,
    transitionOccurrenceAuthoritative:input.transitionOccurrenceAuthoritative===true
  });
}

export function resolveGlazeAgentActivity(input={}){
  if(!plainObject(input))throw new TypeError('Agent Activity input must be a plain object');
  rejectUngoverned(input,'Glaze Agent Activity');
  const activityId=requiredText(input.activityId,'activityId');
  const kind=member(input.kind,AGENT_ACTIVITY_KINDS,'agent activity kind','action');
  const accessRequested=member(input.accessState,AGENT_ACCESS_STATES,'agent access state','unknown');
  const resultRequested=member(input.resultState,AGENT_RESULT_STATES,'agent result state','unknown');
  const accessMap={unknown:'unknown',requested:'unknown',active:'granted',revoked:'revoked',denied:'denied',ended:'revoked'};
  const access=agentTruth(input,'privacy-access',accessMap[accessRequested],input.accessStateAuthoritative===true);
  const result=agentTruth(input,'operation-result',resultRequested,input.resultStateAuthoritative===true);
  const source=sourceIdentity(input);
  const effectiveResult=result.truth.effectiveState;
  const severity=effectiveResult==='failed'?'critical':effectiveResult==='warning'?'attention':'ordinary';
  const expression=expressionFor(input,{
    geometryRole:'grouped',componentRole:'agent-activity',
    colorIntent:result.truth.accepted?'semantic-state':'none',
    semanticSeverity:severity,semanticSeverityAuthoritative:result.truth.accepted,
    motionPurpose:'state-change'
  });
  return Object.freeze({
    version:'1.7.0-dev.42',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
    planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),component:'Glaze Agent Activity',
    activityId,kind,source,access,result,
    content:Object.freeze({label:boundedText(input.label,220),summary:boundedText(input.summary,500)}),
    presentation:Object.freeze({expression,visible:source.complete,unknownStateMustRemainUnknown:true,
      accessAndResultMustRemainDistinct:true,historyMustRemainAttributable:true}),
    authority:Object.freeze({presentationOnly:true,agentIdentityCreatedByGlaze:false,accessCreatedByGlaze:false,
      actionExecutedByGlaze:false,resultCreatedByGlaze:false,permissionGrantedByGlaze:false,
      authorizationGrantedByGlaze:false,consentGrantedByGlaze:false})
  });
}

export function resolveGlazeAgentActivitySurface(input={}){
  if(!plainObject(input))throw new TypeError('Agent Activity surface input must be a plain object');
  rejectUngoverned(input,'Glaze Agent Activity surface');
  const activities=Object.freeze((Array.isArray(input.activities)?input.activities:[]).map(resolveGlazeAgentActivity));
  return Object.freeze({
    version:'1.7.0-dev.42',lifecycle:'Development',component:'Glaze Agent Activity',
    activities,visibleActivities:Object.freeze(activities.filter(a=>a.presentation.visible)),
    authority:Object.freeze({presentationOnly:true,agentRankingInventedByGlaze:false,providerPrecedenceInventedByGlaze:false,
      actionExecutionAutomatic:false})
  });
}

export function resolveGlazePrivacyAttention(input={}){
  if(!plainObject(input))throw new TypeError('Privacy Attention input must be a plain object');
  rejectUngoverned(input,'Glaze Privacy Attention');
  const truthDomain=member(input.truthDomain,['security-protection','privacy-consent','privacy-access'],'attention truth domain','privacy-access');
  const truth=resolveGlazePrivacyAuthorityBoundaryV12({
    truthDomain,
    claims:Array.isArray(input.claims)?input.claims:[],
    expressionProfile:input.expressionProfile??'balanced',
    expressionProfileAuthoritative:input.expressionProfileAuthoritative===true,
    performancePressure:input.performancePressure??'neutral',
    performancePressureAuthoritative:input.performancePressureAuthoritative===true,
    accessibility:plainObject(input.accessibility)?input.accessibility:{},
    accessibilityAuthoritative:input.accessibilityAuthoritative===true,
    transitionOccurrenceAuthoritative:input.transitionOccurrenceAuthoritative===true
  });
  const negative=['unprotected','restricted','degraded','failed','denied','revoked'];
  const attention=truth.truth.accepted&&(negative.includes(truth.truth.effectiveState)||truth.truth.cue==='attention'||truth.truth.cue==='negative');
  const expression=expressionFor(input,{
    geometryRole:'anchored',emphasisRole:attention?'prominent':'standard',typographyRole:attention?'title':'body',
    containmentRole:attention?'critical-decision':'related-content',componentRole:'status',
    colorIntent:truth.truth.accepted?'protected-state':'none',
    semanticSeverity:attention?'critical':'ordinary',semanticSeverityAuthoritative:truth.truth.accepted,
    motionPurpose:'state-change'
  });
  return Object.freeze({
    version:'1.7.0-dev.42',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
    planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),component:'Glaze Privacy Attention',
    truthDomain,truth,attention,
    presentation:Object.freeze({expression,unknownMustRemainUnknown:true,criticalMeaningMayNotDependOnColorOrMotion:true,
      requiredAttentionMayNotBeSilentlySuppressed:true}),
    authority:Object.freeze({presentationOnly:true,privacyTruthCreatedByGlaze:false,securityTruthCreatedByGlaze:false,
      consentGrantedByGlaze:false,permissionGrantedByGlaze:false,authorizationGrantedByGlaze:false})
  });
}

export function resolveGlazeAccessibilityPresentation(input={}){
  if(!plainObject(input))throw new TypeError('Accessibility Presentation input must be a plain object');
  rejectUngoverned(input,'Glaze Accessibility Presentation');
  const mode=member(input.mode,ACCESSIBILITY_PRESENTATION_MODES,'accessibility presentation mode','standard');
  const continuity=resolveGlazeAccessibilityContinuity({
    accessibilityChanges:Array.isArray(input.accessibilityChanges)?input.accessibilityChanges:[],
    accessibilityStateAuthoritative:input.accessibilityStateAuthoritative===true,
    previousTaskState:plainObject(input.previousTaskState)?input.previousTaskState:{},
    incomingTaskState:plainObject(input.incomingTaskState)?input.incomingTaskState:{},
    stateClasses:plainObject(input.stateClasses)?input.stateClasses:{},
    clearFields:input.clearFields,clearAuthoritative:input.clearAuthoritative,
    temporaryDisposableFields:input.temporaryDisposableFields,
    lossDirectedFields:input.lossDirectedFields,
    providerAuthoritativeFields:input.providerAuthoritativeFields,
    recoveryStateFields:input.recoveryStateFields,
    profile:profile(input),profileAuthoritative:input.profileAuthoritative===true,
    semanticSurfaceId:boundedText(input.semanticSurfaceId,180)??'glaze-accessibility-presentation',
    surfaceRole:'task',posture:boundedText(input.posture,80)??'unknown',
    fromInputModel:input.fromInputModel,toInputModel:input.toInputModel,
    inputModelChangeAuthoritative:input.inputModelChangeAuthoritative===true,
    semanticActions:input.semanticActions,
    focusModality:input.focusModality,focusStateAuthoritative:input.focusStateAuthoritative===true,
    focused:input.focused===true,focusVisible:input.focusVisible,selected:input.selected===true,
    material:input.material,currentFocusUnavailable:input.currentFocusUnavailable===true,
    currentFocusAvailabilityAuthoritative:input.currentFocusAvailabilityAuthoritative===true,
    fallbackFocusId:input.fallbackFocusId,fallbackFocusAuthoritative:input.fallbackFocusAuthoritative===true,
    motionIntensity:input.motionIntensity,motionIntensityAuthoritative:input.motionIntensityAuthoritative===true,
    performanceConstraint:input.performanceConstraint,
    performanceConstraintAuthoritative:input.performanceConstraintAuthoritative===true
  });
  return Object.freeze({
    version:'1.7.0-dev.42',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
    planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),component:'Glaze Accessibility Presentation',
    mode,continuity,
    presentation:Object.freeze({taskPreservationRequired:true,largeTextReflowRequired:
      continuity.presentation.largeText.active===true,forcedColorsSemanticMeaningRequired:true,
      pointerAssistanceDoesNotChangeActionMeaning:true}),
    authority:Object.freeze({presentationOnly:true,accessibilityStateCreatedByGlaze:false,focusExecutedByGlaze:false,
      inputModelCreatedByGlaze:false,taskTruthCreatedByGlaze:false,preferencePersistedByGlaze:false})
  });
}

export function resolveGlazeCreativeSurface(input={}){
  if(!plainObject(input))throw new TypeError('Creative Surface input must be a plain object');
  rejectUngoverned(input,'Glaze Creative Surface');
  const stage=member(input.stage,CREATIVE_STAGES,'creative stage','proposal');
  const itemId=requiredText(input.itemId,'itemId');
  const source=sourceIdentity(input,'application');
  const stateId=boundedText(input.stateId,160)??'unknown';
  const stateAuthoritative=input.stateAuthoritative===true;
  const approvalRequested=stage==='approval'||input.approvalRequested===true;
  const approvalAuthoritative=input.approvalStateAuthoritative===true;
  const approved=approvalRequested&&approvalAuthoritative&&input.approvalState==='approved';
  const expression=expressionFor(input,{
    geometryRole:'connected',componentRole:'creative',
    emphasisRole:stage==='approval'?'prominent':'standard',
    containmentRole:stage==='approval'?'critical-decision':'task-region',
    colorIntent:'identity',motionPurpose:'connected-identity'
  });
  return Object.freeze({
    version:'1.7.0-dev.42',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
    planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),component:'Glaze Creative Surface',
    itemId,source,stage,state:Object.freeze({requested:stateId,authoritative:stateAuthoritative,
      accepted:stateAuthoritative?stateId:'unknown',stateCreatedByGlaze:false}),
    approval:Object.freeze({requested:approvalRequested,authoritative:approvalAuthoritative,approved,
      approvalCreatedByGlaze:false,commitExecutedByGlaze:false}),
    presentation:Object.freeze({expression,proposalPreviewEditPendingApprovalAndCommittedStatesRemainDistinct:true,
      destructiveOrIrreversibleChangeRequiresResponsibleSystemConfirmation:true}),
    authority:Object.freeze({presentationOnly:true,contentTruthCreatedByGlaze:false,approvalCreatedByGlaze:false,
      changeCommittedByGlaze:false,applicationActionExecutedByGlaze:false})
  });
}

function compareOption(input){
  if(!plainObject(input))throw new TypeError('Compare option must be a plain object');
  rejectUngoverned(input,'Glaze Compare option');
  return Object.freeze({
    optionId:requiredText(input.optionId,'optionId'),
    label:boundedText(input.label,220),
    source:sourceIdentity(input),
    attributes:plainObject(input.attributes)?Object.freeze({...input.attributes}):Object.freeze({})
  });
}
export function resolveGlazeCompare(input={}){
  if(!plainObject(input))throw new TypeError('Glaze Compare input must be a plain object');
  rejectUngoverned(input,'Glaze Compare');
  const options=Object.freeze((Array.isArray(input.options)?input.options:[]).map(compareOption));
  const requestedOrder=uniqueIds(input.preferredOptionIds);
  const preferenceAuthoritative=input.orderPreferenceAuthoritative===true;
  let ordered=options;
  if(preferenceAuthoritative&&requestedOrder.length){
    const map=new Map(options.map(o=>[o.optionId,o]));
    const next=[];
    for(const id of requestedOrder){if(map.has(id)){next.push(map.get(id));map.delete(id);}}
    for(const option of options){if(map.has(option.optionId)){next.push(option);map.delete(option.optionId);}}
    ordered=Object.freeze(next);
  }
  const expression=expressionFor(input,{
    geometryRole:'grouped',componentRole:'comparison',containmentRole:'task-region',
    colorIntent:'data-category',motionPurpose:'none'
  });
  return Object.freeze({
    version:'1.7.0-dev.42',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
    planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),component:'Glaze Compare',
    options:ordered,
    presentation:Object.freeze({expression,equivalentDimensionsShouldAlign:true,winnerDisplayedByGlaze:false,
      rankingDisplayedByGlaze:false,scoringDisplayedByGlaze:false,visualProminenceMayNotImplyWinner:true}),
    personalization:Object.freeze({orderPreferenceAuthoritative:preferenceAuthoritative,
      untrustedOrderIgnored:!preferenceAuthoritative&&requestedOrder.length>0}),
    authority:Object.freeze({presentationOnly:true,optionTruthCreatedByGlaze:false,rankingInventedByGlaze:false,
      scoreInventedByGlaze:false,winnerInventedByGlaze:false,selectionCreatedByGlaze:false})
  });
}

export function resolveGlazeCareItem(input={}){
  if(!plainObject(input))throw new TypeError('Care item input must be a plain object');
  rejectUngoverned(input,'Glaze Care item');
  const itemId=requiredText(input.itemId,'itemId');
  const domain=member(input.domain,CARE_DOMAINS,'care domain','application');
  const requested=member(input.state,CARE_STATES,'care state','unknown');
  const authoritative=input.stateAuthoritative===true;
  return Object.freeze({
    itemId,domain,source:sourceIdentity(input),label:boundedText(input.label,220),detail:boundedText(input.detail,500),
    state:Object.freeze({requested,authoritative,accepted:authoritative?requested:'unknown',
      withheldWithoutAuthority:!authoritative&&requested!=='unknown',healthCreatedByGlaze:false}),
    presentation:Object.freeze({unknownMustRemainUnknown:true,healthyStateMayNotBeInferred:true,
      completeStateMayNotBeInferred:true,failureStateMayNotBeSuppressed:true})
  });
}
export function resolveGlazeCareSurface(input={}){
  if(!plainObject(input))throw new TypeError('Glaze Care Surface input must be a plain object');
  rejectUngoverned(input,'Glaze Care Surface');
  const items=Object.freeze((Array.isArray(input.items)?input.items:[]).map(resolveGlazeCareItem));
  const visible=items.filter(i=>i.source.complete);
  const known=visible.filter(i=>i.state.accepted!=='unknown');
  const attention=known.some(i=>i.state.accepted==='failed')?'critical':
    known.some(i=>['attention','degraded','unavailable'].includes(i.state.accepted))?'attention':'ordinary';
  const expression=expressionFor(input,{
    geometryRole:'grouped',componentRole:'care',colorIntent:'semantic-state',
    emphasisRole:attention==='ordinary'?'standard':'prominent',
    containmentRole:attention==='critical'?'critical-decision':'related-content',
    semanticSeverity:attention,semanticSeverityAuthoritative:known.length>0,motionPurpose:'state-change'
  });
  const performance=performanceFor(input,'material');
  return Object.freeze({
    version:'1.7.0-dev.42',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
    planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),component:'Glaze Care Surface',
    items,visibleItems:Object.freeze(visible),presentation:Object.freeze({expression,performance,attention,
      deviceHealthInvented:false,applicationHealthInvented:false,storageHealthInvented:false,
      performanceHealthInvented:false,energyHealthInvented:false,maintenanceStatusInvented:false,
      recoveryStatusInvented:false,serviceHealthInvented:false,colorOnlyMeaningAllowed:false}),
    authority:Object.freeze({presentationOnly:true,providerTruthCreatedByGlaze:false,healthTruthCreatedByGlaze:false,
      maintenanceTruthCreatedByGlaze:false,recoveryTruthCreatedByGlaze:false,repairExecutedByGlaze:false,
      recoveryExecutedByGlaze:false})
  });
}

function acceptanceBoundary(){
  return Object.freeze({
    sourceFoundationOnly:true,expressionSystemCoreImplemented:true,providerAdaptiveSurfacesImplemented:true,
    workspaceImplemented:true,compactSurfaceImplemented:true,agentActivityImplemented:true,
    privacyAttentionImplemented:true,accessibilityPresentationImplemented:true,creativeSurfaceImplemented:true,
    compareImplemented:true,careSurfaceImplemented:true,section48SourceScopeImplemented:true,
    section48Complete:false,v13QualificationControlImplemented:false,renderedAcceptanceEstablished:false,
    nativePlatformAcceptanceEstablished:false,assistiveTechnologyAcceptanceEstablished:false,
    representativeDeviceAcceptanceEstablished:false,largeTextReflowAcceptanceEstablished:false,
    forcedColorsAcceptanceEstablished:false,switchAccessAcceptanceEstablished:false,voiceAccessAcceptanceEstablished:false,
    keyboardAcceptanceEstablished:false,measuredPerformanceAcceptanceEstablished:false,energyAcceptanceEstablished:false,
    providerIntegrationAcceptanceEstablished:false,privacySecurityAcceptanceEstablished:false,
    crossPlatformExpressionAcceptanceEstablished:false,humanVisualReviewEstablished:false,
    downstreamConsumerAcceptanceAutomatic:false,releasePromotionAutomatic:false,deploymentAcceptanceAutomatic:false,
    productionAcceptanceAutomatic:false
  });
}

export const glazeV17AdaptiveExperienceSurfacesDevelopmentContract=Object.freeze({
  version:'1.7.0-dev.42',lifecycle:'Development',stableBaseline:'1.6.0',consumerEligible:false,
  planVersion:'v1.3',v13SpecificationSections:Object.freeze([48]),requirementGroup:'adaptive-experience-surfaces',
  surfaces:ADAPTIVE_EXPERIENCE_SURFACES,workspacePaneRoles:WORKSPACE_PANE_ROLES,
  workspaceCompositionModes:WORKSPACE_COMPOSITION_MODES,compactSurfaceKinds:COMPACT_SURFACE_KINDS,
  compactItemKinds:COMPACT_ITEM_KINDS,agentActivityKinds:AGENT_ACTIVITY_KINDS,
  accessibilityPresentationModes:ACCESSIBILITY_PRESENTATION_MODES,creativeStages:CREATIVE_STAGES,
  careDomains:CARE_DOMAINS,careStates:CARE_STATES,
  taskContinuityFoundationVersion:glazeV17TaskContinuityDevelopmentContract.version,
  accessibilityContinuityFoundationVersion:glazeV17AccessibilityContinuityDevelopmentContract.version,
  privacyAuthorityFoundationVersion:glazeV17PrivacyAuthorityBoundariesDevelopmentContract.version,
  performanceEnergyFoundationVersion:glazeV17PerformanceEnergyAwarenessDevelopmentContract.version,
  expressionSystemFoundationVersion:glazeV17ExpressionSystemDevelopmentContract.version,
  section48SourceScopeImplemented:true,section48Complete:false,presentationOnly:true,
  providerTruthCreatedByGlaze:false,userIntentCreatedByGlaze:false,permissionGrantedByGlaze:false,
  authorizationGrantedByGlaze:false,rankingInventedByGlaze:false,approvalInventedByGlaze:false,
  healthInventedByGlaze:false,accessibilityPrecedence:true,performanceMayReduceOptionalRichness:true,
  taskContinuityMayDegrade:false,acceptance:acceptanceBoundary()
});
