import {readFileSync} from 'node:fs';
import {
  resolveGlazeContextualAction,
  resolveGlazeContextualActions,
  resolveGlazeBriefCard,
  resolveGlazeBrief,
  resolveGlazeControl,
  resolveGlazeControlCenter,
  glazeV17ProviderAdaptiveSurfacesDevelopmentContract
} from '../js/glaze-v1.7-provider-adaptive-surfaces.dev.mjs';
import {glazeV17V13Development} from '../js/glaze-v1.7-development-v1-3.dev.mjs';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const json=p=>JSON.parse(read(p));
const assert=(value,message)=>{if(!value)throw new Error(message);};

const manifest=json('docs/v1.7/provider-adaptive-surfaces-dev41.contract.json');
const lifecycle=json('registry/lifecycle.json');
const version=read('VERSION').trim();
const status=read('docs/v1.7/GLAZE_UI_V1_7_DEV41_PROVIDER_ADAPTIVE_SURFACES.md');
const research=read('docs/research/v1.7-provider-adaptive-surfaces.md');

assert(manifest.version==='1.7.0-dev.41','manifest version mismatch');
assert(manifest.planVersion==='v1.3'&&manifest.section===48,'manifest plan binding mismatch');
assert(manifest.consumerEligible===false&&manifest.stableBaseline==='1.6.0','manifest lifecycle boundary weakened');
assert(manifest.expressionSystemDependency==='1.7.0-dev.40','dev.40 dependency missing');
assert(manifest.section48Complete===false,'manifest overclaims Section 48');
assert(manifest.researchRecord==='docs/research/v1.7-provider-adaptive-surfaces.md','manifest research binding missing');
assert(manifest.developmentAggregate==='js/glaze-v1.7-development-v1-3.dev.mjs','manifest aggregate binding missing');
assert(manifest.priorV12AggregateVersion==='1.7.0-dev.39','manifest rewrites v1.2 aggregate provenance');
assert(glazeV17ProviderAdaptiveSurfacesDevelopmentContract.version==='1.7.0-dev.41','runtime contract mismatch');
assert(glazeV17ProviderAdaptiveSurfacesDevelopmentContract.section48Complete===false,'runtime contract overclaims Section 48');
assert(glazeV17V13Development.priorAggregateVersion==='1.7.0-dev.39'&&glazeV17V13Development.priorAggregatePlanVersion==='v1.2','v1.2 aggregate provenance changed');
assert(glazeV17V13Development.acceptanceControlAutomaticallyCoversV13===false,'v1.3 acceptance inferred from dev.39');
assert(glazeV17V13Development.priorAggregateVersion==='1.7.0-dev.39','frozen v1.2 aggregate provenance changed');
assert(glazeV17V13Development.expressionSystemCoreVersion==='1.7.0-dev.40','dev.40 expression dependency missing from v1.3 aggregate');
assert(glazeV17V13Development.providerAdaptiveSurfacesVersion==='1.7.0-dev.41','dev.41 adaptive surfaces missing from v1.3 aggregate');
assert(glazeV17V13Development.planVersion==='v1.3','v1.3 aggregate plan binding changed');
assert(glazeV17V13Development.section48Complete===false&&glazeV17V13Development.acceptanceControlAutomaticallyCoversV13===false,'v1.3 aggregate overclaims Section 48 acceptance');

const actionBase={
  actionId:'open-details',
  role:'primary',
  roleAuthoritative:true,
  providerId:'provider.example',
  providerIdentityAuthoritative:true,
  contextId:'item.42',
  contextIdentityAuthoritative:true,
  availabilityState:'available',
  availabilityAuthoritative:true,
  label:'Open details',
  formFactor:'desktop',
  inputContext:'keyboard',
  expressionProfile:'balanced',
  expressionProfileAuthoritative:true,
  performancePressure:'neutral',
  performancePressureAuthoritative:true,
  accessibility:{},
  accessibilityAuthoritative:true
};

const action=resolveGlazeContextualAction(actionBase);
assert(action.presentation.enabled===true,'authoritative contextual action should be presentable');
assert(action.authority.commandExecutedByGlaze===false,'Glaze executed contextual action');
assert(action.authority.userIntentCreatedByGlaze===false,'Glaze manufactured user intent');
assert(action.authority.rankingInventedByGlaze===false,'Glaze invented action ranking');

const untrustedAction=resolveGlazeContextualAction({
  ...actionBase,
  providerIdentityAuthoritative:false
});
assert(untrustedAction.presentation.enabled===false,'untrusted provider identity enabled action');

const untrustedDestructive=resolveGlazeContextualAction({
  ...actionBase,
  role:'destructive',
  roleAuthoritative:false
});
assert(untrustedDestructive.role.accepted==='standard','untrusted destructive role not withheld');

const actionSurface=resolveGlazeContextualActions({
  actions:[
    {...actionBase,actionId:'a'},
    {...actionBase,actionId:'b'}
  ],
  previousActionIds:['b','a']
});
assert(actionSurface.continuity.stableActionIds.join(',')==='b,a','existing contextual-action order not preserved');
assert(actionSurface.authority.actionExecutionAutomatic===false,'Contextual Actions executes automatically');

const criticalCard=resolveGlazeBriefCard({
  cardId:'privacy-warning',
  kind:'privacy',
  providerId:'privacy-shield',
  providerIdentityAuthoritative:true,
  stateId:'attention-required',
  stateAuthoritative:true,
  attention:'critical',
  attentionAuthoritative:true,
  requestedHidden:true,
  personalizationIntentAuthoritative:true,
  title:'Privacy attention',
  formFactor:'desktop',
  inputContext:'keyboard',
  expressionProfile:'balanced',
  expressionProfileAuthoritative:true,
  performancePressure:'neutral',
  performancePressureAuthoritative:true,
  accessibility:{},
  accessibilityAuthoritative:true
});
assert(criticalCard.presentation.visible===true,'critical Brief communication was hidden');
assert(criticalCard.personalization.protectedVisibility===true,'critical Brief card not protected');
assert(criticalCard.personalization.mayChangeTruth===false,'Brief personalization changed truth');

const unknownProviderCard=resolveGlazeBriefCard({
  cardId:'unknown-source',
  kind:'task',
  providerId:'untrusted-provider',
  providerIdentityAuthoritative:false,
  stateId:'complete',
  stateAuthoritative:true,
  attention:'ordinary',
  title:'Task',
  formFactor:'desktop',
  inputContext:'keyboard',
  accessibility:{},
  accessibilityAuthoritative:true
});
assert(unknownProviderCard.presentation.visible===false,'Brief displayed card without authoritative provider identity');

const ordinary1={
  cardId:'one',kind:'task',providerId:'tasks',providerIdentityAuthoritative:true,
  stateId:'open',stateAuthoritative:true,attention:'ordinary',attentionAuthoritative:true,
  title:'One',formFactor:'desktop',inputContext:'keyboard',accessibility:{},accessibilityAuthoritative:true
};
const ordinary2={...ordinary1,cardId:'two',title:'Two'};
const reordered=resolveGlazeBrief({
  cards:[ordinary1,ordinary2],
  preferredCardIds:['two','one'],
  orderPreferenceAuthoritative:true
});
assert(reordered.cards.map(c=>c.cardId).join(',')==='two,one','authoritative Brief order preference not applied');
const ignoredOrder=resolveGlazeBrief({
  cards:[ordinary1,ordinary2],
  preferredCardIds:['two','one'],
  orderPreferenceAuthoritative:false
});
assert(ignoredOrder.cards.map(c=>c.cardId).join(',')==='one,two','untrusted Brief order preference applied');

const controlBase={
  controlId:'wifi',
  kind:'toggle',
  providerId:'network-provider',
  providerIdentityAuthoritative:true,
  availabilityState:'available',
  availabilityAuthoritative:true,
  state:'active',
  stateAuthoritative:true,
  requestedTargetState:'inactive',
  userIntentAuthoritative:true,
  label:'Wi-Fi',
  formFactor:'desktop',
  inputContext:'keyboard',
  expressionProfile:'balanced',
  expressionProfileAuthoritative:true,
  performancePressure:'neutral',
  performancePressureAuthoritative:true,
  accessibility:{},
  accessibilityAuthoritative:true
};
const control=resolveGlazeControl(controlBase);
assert(control.presentation.enabled===true&&control.presentation.knownState===true,'authoritative control not presentable');
assert(control.proposal.eligible===true,'explicit user-intent control proposal not eligible');
assert(control.proposal.executionPerformed===false&&control.proposal.resultAssumed===false,'Control Center executed or assumed result');
assert(control.authority.permissionGrantedByGlaze===false&&control.authority.authorizationGrantedByGlaze===false,'Control Center granted authority');

const controlUnknown=resolveGlazeControl({...controlBase,stateAuthoritative:false});
assert(controlUnknown.state.accepted==='unknown','untrusted control state not withheld');
assert(controlUnknown.presentation.enabled===false,'stateful control remained enabled with unknown state');
assert(controlUnknown.proposal.eligible===false,'control proposal allowed without authoritative state');

const actionControl=resolveGlazeControl({
  ...controlBase,
  controlId:'open-settings',
  kind:'action',
  state:'unknown',
  stateAuthoritative:false,
  requestedTargetState:'open'
});
assert(actionControl.presentation.knownState===true,'stateless action control incorrectly requires provider state');
assert(actionControl.proposal.eligible===true,'stateless action control cannot form explicit proposal');

const center=resolveGlazeControlCenter({controls:[controlBase],previousControlIds:['wifi']});
assert(center.authority.executionPerformedByGlaze===false,'Control Center executes controls');
assert(center.continuity.stateResetAllowed===false,'Control Center permits state reset');

for(const bad of [
  ()=>resolveGlazeContextualAction({...actionBase,score:10}),
  ()=>resolveGlazeBriefCard({...ordinary1,colorHex:'#fff'}),
  ()=>resolveGlazeControl({...controlBase,permissionGranted:true}),
  ()=>resolveGlazeControl({...controlBase,durationMs:200})
]){
  let failed=false;
  try{bad();}catch{failed=true;}
  assert(failed,'ungoverned provider/adaptive input did not fail closed');
}

assert(version==='1.7.0','VERSION changed from bounded V1.7 Anchor');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor lifecycle changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','source implementation changed lifecycle candidate');
assert(status.includes('Glaze Contextual Actions')&&status.includes('Glaze Brief')&&status.includes('Glaze Control Center'),'dev.41 status record missing implemented surfaces');
assert(status.includes('Section 48 remains incomplete'),'dev.41 status record overclaims completion');
assert(status.includes('No third-party implementation is incorporated'),'Reforge boundary missing');
assert(research.includes('GAction')&&research.includes('Material Web')&&research.includes('Fluent UI')&&research.includes('WAI-ARIA'),'multi-source Reforge research missing');
assert(research.includes('No third-party component implementation'),'Reforge no-copy boundary missing');
assert(manifest.researchRecord==='docs/research/v1.7-provider-adaptive-surfaces.md','manifest research binding missing');
assert(research.includes('GLib / GIO GAction')&&research.includes('GNOME Shell')&&research.includes('Material Web')&&research.includes('Fluent UI')&&research.includes('W3C WAI-ARIA'),'Reforge source diversity missing');
assert(research.includes('No mechanical rewriting or line-by-line translation was performed.'),'Reforge independence boundary missing');

console.log('GLAZE UI V1.7 dev.41 Provider Adaptive Surfaces validation: PASS');
console.log('Implemented surfaces: Contextual Actions, Brief, Control Center');
console.log('Section 48 complete: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
