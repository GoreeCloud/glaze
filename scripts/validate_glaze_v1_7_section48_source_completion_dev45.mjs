import {readFileSync} from 'node:fs';
import {
  resolveGlazeWorkspace,
  resolveGlazeCompactSurface,
  resolveGlazeAccessibilityPresentation,
  glazeV17AdaptiveExperienceSurfacesDevelopmentContract
} from '../js/glaze-v1.7-adaptive-experience-surfaces.dev.mjs';
import {
  resolveGlazeAgentActivity,
  resolveGlazePrivacyAttention,
  resolveGlazeCareSurface,
  glazeV17TrustCareSurfacesDevelopmentContract
} from '../js/glaze-v1.7-trust-care-surfaces.dev.mjs';
import {
  resolveGlazeCreativeSurface,
  resolveGlazeCompare,
  glazeV17CreativeCompareSurfacesDevelopmentContract
} from '../js/glaze-v1.7-creative-compare-surfaces.dev.mjs';
import {
  evaluateGlazeV17Section48Qualification,
  glazeV17Section48QualificationDevelopmentContract
} from '../js/glaze-v1.7-section48-qualification.dev.mjs';
import {glazeV17V13Development} from '../js/glaze-v1.7-development-v1-3.dev.mjs';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const json=p=>JSON.parse(read(p));
const assert=(value,message)=>{if(!value)throw new Error(message);};

const version=read('VERSION').trim();
const lifecycle=json('registry/lifecycle.json');
const manifest=json('docs/v1.7/section48-source-completion-dev45.contract.json');
const status=read('docs/v1.7/GLAZE_V1_7_DEV42_45_SECTION48_SOURCE_COMPLETION.md');

const common={
  formFactor:'desktop',
  inputContext:'keyboard',
  densityRole:'standard',
  expressionProfile:'balanced',
  expressionProfileAuthoritative:true,
  performancePressure:'neutral',
  performancePressureAuthoritative:true,
  accessibility:{},
  accessibilityAuthoritative:true
};

const workspace=resolveGlazeWorkspace({
  ...common,
  workspaceId:'workspace.main',
  panes:[
    {paneId:'navigation',role:'secondary'},
    {paneId:'content',role:'primary'},
    {paneId:'inspector',role:'inspector'}
  ],
  previousTaskState:{focusId:'content.title',selectionIds:['item.1'],draftText:'draft'},
  incomingTaskState:{focusId:'content.title'},
  posture:'expanded'
});
assert(workspace.panes.length===3,'Workspace pane count mismatch');
assert(workspace.layout.paneIdentityPreserved===true,'Workspace pane identity not preserved');
assert(workspace.continuity.state.draftText==='draft','Workspace recomposition lost draft state');
assert(workspace.authority.navigationExecutedByGlaze===false,'Workspace executed navigation');

const compact=resolveGlazeCompactSurface({
  ...common,
  surfaceId:'cover.now-playing',
  context:'cover-display',
  interactionDepth:'quick-action',
  providerId:'media-provider',
  providerIdentityAuthoritative:true,
  stateId:'playing',
  stateAuthoritative:false
});
assert(compact.state.accepted==='unknown','Compact Surface invented untrusted state');
assert(compact.presentation.essentialMeaningRequired===true,'Compact Surface essential meaning boundary missing');
let compactFailed=false;
try{
  resolveGlazeCompactSurface({...common,surfaceId:'x',context:'wearable',interactionDepth:'full-experience'});
}catch{compactFailed=true;}
assert(compactFailed,'Full-experience compact surface allowed without escalation target');

const accessibility=resolveGlazeAccessibilityPresentation({
  ...common,
  presentation:'text-spotlight',
  modes:['large-text','forced-colors'],
  accessibilityAuthoritative:false
});
assert(accessibility.effectiveModes.length===0,'Untrusted accessibility modes were treated as authoritative');
assert(accessibility.behavior.colorOnlyMeaningAllowed===false,'Accessibility Presentation permits color-only meaning');

const agent=resolveGlazeAgentActivity({
  ...common,
  activityId:'agent.1',
  kind:'result',
  providerId:'assistant-provider',
  providerIdentityAuthoritative:true,
  occurrenceAuthoritative:true,
  resultState:'success',
  resultAuthoritative:false
});
assert(agent.presentation.visible===true,'Authoritative Agent Activity occurrence not presentable');
assert(agent.result.accepted==='unknown','Agent Activity invented untrusted result');
assert(agent.authority.resultTrustworthinessInferredByGlaze===false,'Agent Activity inferred trustworthiness');

const privacy=resolveGlazePrivacyAttention({
  ...common,
  truthDomain:'privacy-access',
  claims:[{
    providerId:'privacy-shield',
    ownerKind:'privacy-shield',
    authority:'privacy',
    scope:'system',
    state:'denied',
    authorityAttested:true
  }]
});
assert(privacy.boundary.truth.effectiveState==='denied','Privacy Attention lost Privacy Shield truth');
assert(privacy.attention.level==='critical','Denied privacy access should receive critical attention');
assert(privacy.authority.consentInferredByGlaze===false,'Privacy Attention inferred consent');

const care=resolveGlazeCareSurface({
  ...common,
  itemId:'storage.primary',
  domain:'storage',
  providerId:'storage-provider',
  providerIdentityAuthoritative:true,
  stateId:'healthy',
  stateAuthoritative:false
});
assert(care.state.accepted==='unknown','Care Surface manufactured storage health');
assert(care.authority.storageSafetyCreatedByGlaze===false,'Care Surface created storage safety truth');

const creative=resolveGlazeCreativeSurface({
  ...common,
  operationId:'creative.1',
  operation:'generate',
  stage:'preview',
  stageAuthoritative:true,
  providerId:'creative-provider',
  providerIdentityAuthoritative:true,
  sourceId:'source.1',
  proposalId:'proposal.1'
});
assert(creative.stage.accepted==='preview','Creative Surface stage mismatch');
assert(creative.stage.previewIsCommitment===false,'Creative preview became commitment');
assert(creative.authority.applicationStateCommittedByGlaze===false,'Creative Surface committed application state');

const compare=resolveGlazeCompare({
  ...common,
  comparisonId:'compare.1',
  kind:'theme',
  mode:'before-after',
  sourceId:'theme.old',
  targetId:'theme.new',
  selectedId:'theme.new',
  selectionAuthoritative:false
});
assert(compare.selection.accepted===null,'Compare inferred selection');
assert(compare.presentation.commitmentImpliedBySelection===false,'Compare implied commitment from selection');

const qualification=evaluateGlazeV17Section48Qualification({
  sourceRevision:'0123456789abcdef0123456789abcdef01234567',
  predecessorQualification:{
    sourceRevision:'0123456789abcdef0123456789abcdef01234567',
    reference:'governed-review-placeholder',
    acceptedByGovernedReview:false
  },
  evidence:[]
});
assert(qualification.sourceCoverage.allPlannedSurfacesSourceImplemented===true,'Section 48 planned surface source coverage incomplete');
assert(qualification.blockingLanes.length===glazeV17Section48QualificationDevelopmentContract.qualificationLanes.length,'Empty evidence packet did not block every Section 48 qualification lane');
assert(qualification.readyForGovernedQualificationReview===false,'Empty Section 48 evidence became ready');
assert(qualification.authority.section48Accepted===false&&qualification.authority.anchorStatusGranted===false,'Qualification evaluator granted acceptance');

assert(glazeV17AdaptiveExperienceSurfacesDevelopmentContract.version==='1.7.0-dev.42','dev.42 contract mismatch');
assert(glazeV17TrustCareSurfacesDevelopmentContract.version==='1.7.0-dev.43','dev.43 contract mismatch');
assert(glazeV17CreativeCompareSurfacesDevelopmentContract.version==='1.7.0-dev.44','dev.44 contract mismatch');
assert(glazeV17Section48QualificationDevelopmentContract.version==='1.7.0-dev.45','dev.45 contract mismatch');
assert(glazeV17Section48QualificationDevelopmentContract.section48SourceComplete===true,'Section 48 source coverage not marked complete');
assert(glazeV17Section48QualificationDevelopmentContract.section48Accepted===false,'Section 48 acceptance overclaimed');
assert(glazeV17V13Development.version==='1.7.0-dev.45','v1.3 aggregate version mismatch');
assert(glazeV17V13Development.section48SourceComplete===true,'v1.3 aggregate missing Section 48 source completion');
assert(glazeV17V13Development.section48Complete===false,'v1.3 aggregate overclaims Section 48 acceptance');
assert(glazeV17V13Development.acceptanceControlAutomaticallyCoversV13===false,'v1.2 acceptance control silently covers v1.3');

assert(manifest.version==='1.7.0-dev.45'&&manifest.section===48,'manifest identity mismatch');
assert(manifest.section48SourceComplete===true&&manifest.section48Accepted===false,'manifest source/acceptance boundary mismatch');
assert(manifest.surfaces.length===11,'manifest surface coverage mismatch');
assert(status.includes('Section 48 source-complete')&&status.includes('Section 48 remains acceptance-incomplete'),'status record boundary missing');

assert(version==='1.6.0','VERSION changed from V1.6 Anchor');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor lifecycle changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'Source completion created a lifecycle candidate');

console.log('Glaze V1.7 dev.42-dev.45 Section 48 source completion validation: PASS');
console.log('Section 48 planned surfaces source implemented: 11/11');
console.log('Section 48 acceptance complete: false');
console.log('Official Anchor preserved: 1.6.0');
