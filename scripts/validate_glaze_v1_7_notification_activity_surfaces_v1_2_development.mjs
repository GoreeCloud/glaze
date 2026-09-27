#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeNotificationActivitySurfaceV12,
  glazeV17NotificationActivitySurfacesV12DevelopmentContract
} from '../js/glaze-v1.7-notification-activity-surfaces-v1-2.dev.mjs';
import {glazeV17NotificationActivitySurfacesDevelopmentContract} from '../js/glaze-v1.7-notification-activity-surfaces.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/notification-activity-surfaces-v1-2.dev.json');
const schema=json('schemas/v1.7-notification-activity-surfaces-v1-2.schema.json');
const tokens=json('tokens/glaze-v1.7-notification-activity-surfaces-v1-2.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');

const components=['GlzNotificationSurface','GlzActivityItem','GlzActivityGroup','GlzStatusFeed','GlzBackgroundTask','GlzProgressSurface'];
const transitions=['progress','completion','recovery','arrival','expansion','dismissal'];
const relationships={progress:'color-state-change',completion:'material-role-change',recovery:'material-role-change',arrival:'transient-elevation',expansion:'same-object-expansion',dismissal:'transient-elevation'};

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.28 must not create lifecycle promotion state');
for(const phrase of ['## 36. Notification and Activity Surfaces',...components,'progress, completion, recovery, arrival, expansion, or dismissal','Persistent pulsing should not become the default way to communicate attention.']){
  assert(spec.includes(phrase),'Section 36 requirement missing: '+phrase);
}
assert(spec.includes('## 37. Native Glaze Kits'),'Section 37 must remain separately governed');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.28'&&contract.lifecycle==='Development','dev.28 identity mismatch');
assert(contract.stableBaseline==='1.6.0'&&contract.consumerEligible===false,'dev.28 lifecycle boundary mismatch');
assert(contract.planVersion==='v1.2'&&JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([36]),'dev.28 Section 36 binding mismatch');
assert(contract.historicalFoundation.version==='1.7.0-dev.7','historical notification/activity foundation changed');
assert(contract.historicalFoundation.historicalSpecificationSection===8,'historical dev.7 section changed');
assert(contract.historicalFoundation.reinterpretedAsV12Section36===false,'dev.7 must not be relabeled as v1.2 Section 36');
assert(JSON.stringify(contract.components)===JSON.stringify(components),'component set mismatch');
assert(JSON.stringify(contract.meaningfulTransitions)===JSON.stringify(transitions),'meaningful transition set mismatch');
assert(JSON.stringify(contract.transitionRelationships)===JSON.stringify(relationships),'transition relationship map mismatch');
assert(contract.motionPolicy.persistentPulsingDefault===false,'persistent pulsing must not be default');
assert(contract.motionPolicy.continuousAttentionAnimationAllowed===false,'continuous attention animation boundary weakened');
assert(contract.motionPolicy.finalStateDependsOnAnimationCompletion===false,'final state must not depend on motion');
assert(contract.motionPolicy.motionRequiredToUnderstandState===false,'motion must not be required to understand state');
assert(contract.motionPolicy.reducedMotionPrecedence===true,'Reduced Motion precedence missing');
assert(contract.acceptanceBoundary.section36Complete===false,'Section 36 completion overclaimed');
for(const denied of ['notificationTruthCreatedByGlaze','activityTruthCreatedByGlaze','progressTruthCreatedByGlaze','completionTruthCreatedByGlaze','recoveryTruthCreatedByGlaze','objectIdentityCreatedByGlaze','actionExecutionPerformedByGlaze','backgroundTaskExecutionPerformedByGlaze','systemNotificationPermissionGrantedByGlaze']){
  assert(contract.authority[denied]===false,'authority boundary weakened: '+denied);
}

assert(glazeV17NotificationActivitySurfacesDevelopmentContract.version==='1.7.0-dev.7','historical dev.7 runtime changed');
assert(JSON.stringify(glazeV17NotificationActivitySurfacesDevelopmentContract.implementedSpecificationSections)===JSON.stringify([8]),'historical dev.7 numbering changed');
assert(glazeV17NotificationActivitySurfacesV12DevelopmentContract.version==='1.7.0-dev.28','dev.28 runtime contract mismatch');
assert(glazeV17NotificationActivitySurfacesV12DevelopmentContract.historicalFoundationReinterpreted===false,'runtime relabeled dev.7');
assert(glazeV17NotificationActivitySurfacesV12DevelopmentContract.persistentPulsingDefault===false,'runtime persistent pulsing boundary weakened');
assert(glazeV17NotificationActivitySurfacesV12DevelopmentContract.glazeMotionExperimentalLifecyclePromoted===false,'runtime promoted Glaze Motion');

const previousTaskState={navigationDestination:'activity',focusId:'row-2',draftText:'draft',query:'sync',paneState:{activePane:'detail'}};
const base={component:'GlzProgressSurface',profile:'mobile',kind:'user-requested-progress',truthAuthoritative:true,sourceId:'provider',previousTaskState};

const progress=resolveGlazeNotificationActivitySurfaceV12({...base,progressMode:'determinate',progressFraction:0.5,progressAuthoritative:true,transitionKind:'progress',transitionAuthoritative:true});
assert(progress.transition.providerTruthSatisfied===true,'authoritative progress truth should satisfy progress motion gate');
assert(progress.transition.signatureFamily==='Glaze Color Shift','progress should use Glaze Color Shift semantics');
assert(progress.transition.optionalMotionApplied===true,'authoritative progress motion should be eligible');
assert(progress.surface.taskState.focusId==='row-2','progress motion must preserve focus');
assert(progress.transition.progressTruthDependsOnAnimation===false,'progress truth must be independent of motion');

const untrustedProgress=resolveGlazeNotificationActivitySurfaceV12({...base,progressMode:'determinate',progressFraction:0.5,progressAuthoritative:false,transitionKind:'progress',transitionAuthoritative:true});
assert(untrustedProgress.surface.progress.acceptedMode==='unknown','untrusted progress must fail closed');
assert(untrustedProgress.transition.providerTruthSatisfied===false,'untrusted progress must not satisfy motion truth gate');
assert(untrustedProgress.transition.optionalMotionApplied===false,'untrusted progress must not apply signature motion');

const completion=resolveGlazeNotificationActivitySurfaceV12({...base,progressMode:'none',transitionKind:'completion',transitionAuthoritative:true});
assert(completion.transition.signatureFamily==='Glaze Material Shift','completion should use Glaze Material Shift semantics');
assert(completion.transition.completionTruthDependsOnAnimation===false,'completion truth must be independent of motion');

const untrustedCompletion=resolveGlazeNotificationActivitySurfaceV12({...base,truthAuthoritative:false,progressMode:'none',transitionKind:'completion',transitionAuthoritative:true});
assert(untrustedCompletion.transition.providerTruthSatisfied===false,'untrusted provider truth must not drive completion motion');
assert(untrustedCompletion.transition.optionalMotionApplied===false,'untrusted completion must not apply signature motion');

const expansionNoIdentity=resolveGlazeNotificationActivitySurfaceV12({...base,progressMode:'none',transitionKind:'expansion',transitionAuthoritative:true});
assert(expansionNoIdentity.transition.signatureRelationshipAccepted===false,'expansion Bloom must require authoritative connected identity');
assert(expansionNoIdentity.transition.optionalMotionApplied===false,'expansion without identity must fail closed');

const expansion=resolveGlazeNotificationActivitySurfaceV12({...base,progressMode:'none',transitionKind:'expansion',transitionAuthoritative:true,connectedIdentity:'activity:item:42',connectedIdentityAuthoritative:true});
assert(expansion.transition.signatureFamily==='Glaze Bloom','authoritative expansion identity should use Glaze Bloom');
assert(expansion.transition.optionalMotionApplied===true,'authoritative expansion should allow signature motion');

const attention=resolveGlazeNotificationActivitySurfaceV12({component:'GlzNotificationSurface',profile:'mobile',kind:'critical',truthAuthoritative:true,sourceId:'provider',progressMode:'none',transitionKind:'arrival',transitionAuthoritative:true,persistentPulsing:true,previousTaskState});
assert(attention.attention.attentionRequired===true,'critical activity should require attention');
assert(attention.attention.persistentPulsingRequested===true,'persistent pulsing request should be observable');
assert(attention.attention.persistentPulsingApplied===false,'persistent pulsing must not be applied as default attention');
assert(attention.attention.defaultCue==='static-semantic-emphasis','attention fallback should be static semantic emphasis');

const reduced=resolveGlazeNotificationActivitySurfaceV12({...base,progressMode:'none',transitionKind:'arrival',transitionAuthoritative:true,accessibilityProfiles:['reduced-motion']});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion must propagate');
assert(reduced.performance.mode==='reduced-motion','Reduced Motion must outrank notification motion');
assert(reduced.accessibility.motionRequiredToUnderstandState===false,'notification state must remain understandable without motion');

const pressure=resolveGlazeNotificationActivitySurfaceV12({...base,progressMode:'none',transitionKind:'arrival',transitionAuthoritative:true,runtimePressure:'severe',runtimePressureAuthoritative:true});
assert(pressure.performance.mode==='minimal','severe authoritative runtime pressure must simplify notification motion');
assert(pressure.surface.taskState.navigationDestination==='activity','performance degradation must not reset task state');

let rawRejected=false;
try{resolveGlazeNotificationActivitySurfaceV12({...base,progressMode:'none',transitionKind:'arrival',transitionAuthoritative:true,durationMs:200});}catch(error){rawRejected=error instanceof RangeError;}
assert(rawRejected,'raw motion controls must be rejected');

assert(tokens.version==='1.7.0-dev.28'&&tokens.v12SpecificationSections[0]===36,'dev.28 token identity mismatch');
assert(tokens.attention.persistentPulsingDefault===false&&tokens.attention.continuousAttentionAnimationAllowed===false,'token attention boundary weakened');
assert(tokens.stateFirst.finalStateDependsOnAnimationCompletion===false,'token state-first boundary weakened');
assert(tokens.boundaries.section36Complete===false,'token Section 36 completion overclaimed');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=28,'aggregate version regressed below dev.28');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31,32,33,34,35,36]) assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.notificationActivitySurfacesV12Foundation==='js/glaze-v1.7-notification-activity-surfaces-v1-2.dev.mjs','aggregate missing dev.28 foundation');
assert(glazeV17Development.notificationActivitySurfacesHistoricalFoundationReinterpretedAsV12===false,'aggregate relabeled historical dev.7');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(spec.includes('dev.28')&&spec.includes('Section 36'),'plan provenance missing dev.28');
assert(planned.includes('1.7.0-dev.28')&&planned.includes('Notification and Activity Surfaces'),'planned-feature control missing dev.28');
assert(implemented.includes('Notification and Activity Surfaces v1.2 — `1.7.0-dev.28`'),'implemented-feature control missing dev.28');
assert(changelog.includes('1.7.0-dev.28')&&changelog.includes('Notification and Activity Surfaces'),'changelog missing dev.28');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

console.log('GLAZE UI V1.7 Notification and Activity Surfaces v1.2 Development validation: PASS');
console.log('Plan binding: v1.2 Section 36');
console.log('Historical dev.7 provenance preserved: true');
console.log('Persistent pulsing default: false');
console.log('Section 36 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
