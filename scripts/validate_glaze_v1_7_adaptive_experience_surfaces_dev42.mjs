import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  resolveGlazeWorkspace,
  resolveGlazeCompactSurface,
  resolveGlazeAgentActivity,
  resolveGlazePrivacyAttention,
  resolveGlazeAccessibilityPresentation,
  resolveGlazeCreativeSurface,
  resolveGlazeCompare,
  resolveGlazeCareSurface,
  glazeV17AdaptiveExperienceSurfacesDevelopmentContract
} from '../js/glaze-v1.7-adaptive-experience-surfaces.dev.mjs';
import {glazeV17V13Development} from '../js/glaze-v1.7-development-v1-3.dev.mjs';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const json=p=>JSON.parse(read(p));
const manifest=json('docs/v1.7/adaptive-experience-surfaces-dev42.contract.json');
const lifecycle=json('registry/lifecycle.json');
const version=read('VERSION').trim();
const status=read('docs/v1.7/GLAZE_V1_7_DEV42_ADAPTIVE_EXPERIENCE_SURFACES.md');
const research=read('docs/research/v1.7-adaptive-experience-surfaces.md');

assert.equal(manifest.version,'1.7.0-dev.42');
assert.equal(manifest.planVersion,'v1.3');
assert.equal(manifest.section,48);
assert.equal(manifest.consumerEligible,false);
assert.equal(manifest.section48SourceScopeImplemented,true);
assert.equal(manifest.section48Complete,false);
assert.equal(glazeV17AdaptiveExperienceSurfacesDevelopmentContract.version,'1.7.0-dev.42');
assert.equal(glazeV17AdaptiveExperienceSurfacesDevelopmentContract.surfaces.length,8);
assert.equal(glazeV17AdaptiveExperienceSurfacesDevelopmentContract.section48SourceScopeImplemented,true);
assert.equal(glazeV17AdaptiveExperienceSurfacesDevelopmentContract.section48Complete,false);

const common={
  formFactor:'desktop',inputContext:'keyboard',densityRole:'standard',
  expressionProfile:'balanced',expressionProfileAuthoritative:true,
  performancePressure:'neutral',performancePressureAuthoritative:true,
  accessibility:{},accessibilityAuthoritative:true
};

const workspace=resolveGlazeWorkspace({
  ...common,compositionMode:'two-pane',profile:'desktop',
  panes:[
    {paneId:'primary',role:'primary',providerId:'app',providerIdentityAuthoritative:true},
    {paneId:'detail',role:'secondary',providerId:'app',providerIdentityAuthoritative:true}
  ],
  previousTaskState:{navigationDestination:'items',selectionIds:['42'],draftText:'draft'},
  incomingTaskState:{},
  stateClasses:{navigationDestination:'session-scoped',selectionIds:'session-scoped',draftText:'session-scoped'}
});
assert.deepEqual(workspace.taskState.selectionIds,['42']);
assert.equal(workspace.taskState.draftText,'draft');
assert.equal(workspace.presentation.taskStateResetAllowed,false);
assert.equal(workspace.authority.navigationExecutedByGlaze,false);

const compact=resolveGlazeCompactSurface({
  ...common,kind:'wearable',formFactor:'wearable',
  items:[{itemId:'sync',kind:'status',providerId:'sync-provider',providerIdentityAuthoritative:false,
    stateId:'complete',stateAuthoritative:true,label:'Sync'}]
});
assert.equal(compact.visibleItems.length,0);
assert.equal(compact.authority.providerTruthCreatedByGlaze,false);

const agent=resolveGlazeAgentActivity({
  ...common,activityId:'agent.1',kind:'result',providerId:'agent-provider',providerIdentityAuthoritative:true,
  accessState:'active',accessStateAuthoritative:true,resultState:'success',resultStateAuthoritative:false
});
assert.equal(agent.access.truth.effectiveState,'granted');
assert.equal(agent.result.truth.effectiveState,'unknown');
assert.equal(agent.authority.resultCreatedByGlaze,false);

const attention=resolveGlazePrivacyAttention({
  ...common,truthDomain:'privacy-access',
  claims:[{providerId:'privacy-provider',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',
    state:'revoked',authorityAttested:true}]
});
assert.equal(attention.truth.truth.effectiveState,'revoked');
assert.equal(attention.attention,true);
assert.equal(attention.authority.privacyTruthCreatedByGlaze,false);

const accessibility=resolveGlazeAccessibilityPresentation({
  ...common,mode:'enlarged-presentation',
  accessibilityChanges:['large-text','forced-colors','keyboard-navigation'],
  accessibilityStateAuthoritative:true,profile:'desktop',profileAuthoritative:true,
  previousTaskState:{navigationDestination:'current',focusId:'field',draftText:'keep'},
  incomingTaskState:{},
  stateClasses:{navigationDestination:'session-scoped',focusId:'session-scoped',draftText:'session-scoped'},
  focusStateAuthoritative:true,focused:true,focusVisible:true
});
assert.equal(accessibility.continuity.task.state.draftText,'keep');
assert.equal(accessibility.presentation.taskPreservationRequired,true);
assert.equal(accessibility.authority.accessibilityStateCreatedByGlaze,false);

const creative=resolveGlazeCreativeSurface({
  ...common,itemId:'draft.1',stage:'approval',providerId:'editor',providerIdentityAuthoritative:true,
  stateId:'pending',stateAuthoritative:true,approvalRequested:true,approvalState:'approved',
  approvalStateAuthoritative:false
});
assert.equal(creative.approval.approved,false);
assert.equal(creative.authority.approvalCreatedByGlaze,false);
assert.equal(creative.authority.changeCommittedByGlaze,false);

const compare=resolveGlazeCompare({
  ...common,options:[
    {optionId:'a',label:'A',providerId:'catalog',providerIdentityAuthoritative:true,attributes:{storage:'1 TB'}},
    {optionId:'b',label:'B',providerId:'catalog',providerIdentityAuthoritative:true,attributes:{storage:'2 TB'}}
  ],
  preferredOptionIds:['b','a'],orderPreferenceAuthoritative:false
});
assert.deepEqual(compare.options.map(o=>o.optionId),['a','b']);
assert.equal(compare.authority.winnerInventedByGlaze,false);
assert.throws(()=>resolveGlazeCompare({...common,options:[{optionId:'a',score:99}]}),RangeError);

const care=resolveGlazeCareSurface({
  ...common,items:[
    {itemId:'storage',domain:'storage',providerId:'storage-provider',providerIdentityAuthoritative:true,
      state:'healthy',stateAuthoritative:false,label:'Storage'}
  ]
});
assert.equal(care.visibleItems[0].state.accepted,'unknown');
assert.equal(care.authority.healthTruthCreatedByGlaze,false);

for(const bad of [
  ()=>resolveGlazeWorkspace({...common,panes:[],rank:1}),
  ()=>resolveGlazeCompactSurface({...common,items:[],colorHex:'#fff'}),
  ()=>resolveGlazeAgentActivity({...common,activityId:'x',providerId:'p',permissionGranted:true}),
  ()=>resolveGlazeCreativeSurface({...common,itemId:'x',approved:true}),
  ()=>resolveGlazeCareSurface({...common,items:[],anchorStatus:'anchor'})
])assert.throws(bad,RangeError);

assert.equal(glazeV17V13Development.adaptiveExperienceSurfacesVersion,'1.7.0-dev.42');
assert.equal(glazeV17V13Development.section48SourceScopeImplemented,true);
assert.equal(glazeV17V13Development.remainingAdaptiveSurfaces.length,0);
assert.equal(glazeV17V13Development.section48Complete,false);

assert.equal(version,'1.6.0');
assert.equal(lifecycle.currentOfficial,'1.6.0');
assert.equal(lifecycle.currentStable,'1.6.0');
assert.equal(lifecycle.currentLifecycle,'anchor');
assert.equal(lifecycle.activeCandidate,null);
assert.equal(lifecycle.plannedNext,null);

assert(status.includes('Section 48 is **source-scope implemented, not accepted**'));
assert(status.includes('No source-level result'));
assert(research.includes('No third-party component implementation is incorporated.'));
assert(research.includes('No mechanical rewriting or line-by-line translation was performed.'));

console.log('Glaze V1.7 dev.42 adaptive experience surfaces validation: PASS');
console.log('Remaining Section 48 adaptive surfaces: 0');
console.log('Section 48 source scope implemented: true');
console.log('Section 48 accepted: false');
console.log('Official Anchor preserved: 1.6.0');
