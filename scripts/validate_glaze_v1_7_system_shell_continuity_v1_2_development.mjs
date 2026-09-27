#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeSystemShellContinuityV12,
  glazeV17SystemShellContinuityV12DevelopmentContract
} from '../js/glaze-v1.7-system-shell-continuity-v1-2.dev.mjs';
import {glazeV17SystemShellContinuityDevelopmentContract} from '../js/glaze-v1.7-system-shell-continuity.dev.mjs';
import {glazeV17MotionPerformanceDevelopmentContract} from '../js/glaze-v1.7-motion-performance.dev.mjs';
import {glazeV17GlazeMotionLifecycleDevelopmentContract} from '../js/glaze-v1.7-glaze-motion-lifecycle.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/system-shell-continuity-v1-2.dev.json');
const schema=json('schemas/v1.7-system-shell-continuity-v1-2.schema.json');
const tokens=json('tokens/glaze-v1.7-system-shell-continuity-v1-2.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');

const section35Areas=[
  'notification-activity-presentation','control-center','multi-window','split-view',
  'compact-expanded-navigation','window-restoration','application-system-handoff',
  'task-switching','universal-search','contextual-commands'
];
const relationships={
  'notification-activity-presentation':'transient-elevation',
  'control-center-layout':'workspace-recomposition',
  'multi-window-change':'workspace-recomposition',
  'split-view-change':'posture-partition',
  'compact-expanded-navigation':'workspace-recomposition',
  'window-restoration':'workspace-recomposition',
  'application-system-handoff':'source-destination-continuity',
  'task-switching':'source-destination-continuity',
  'shell-overlay':'context-overlay',
  'search-continuity':'same-object-expansion',
  'contextual-command-surface':'transient-elevation'
};

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.27 must not create lifecycle promotion state');

for(const phrase of [
  '## 35. System Shell Continuity',
  'Notification/activity presentation',
  'Control Center',
  'Multi-window',
  'Split view',
  'Compact/expanded navigation',
  'Window restoration',
  'Application/system handoff',
  'Task switching',
  'Universal Search',
  'Contextual commands',
  'without making shell navigation slower'
]) assert(spec.includes(phrase),'Section 35 requirement missing: '+phrase);
assert(spec.includes('## 36. Notification and Activity Surfaces'),'Section 36 must remain separately governed');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.27'&&contract.lifecycle==='Development','dev.27 identity mismatch');
assert(contract.stableBaseline==='1.6.0'&&contract.consumerEligible===false,'dev.27 lifecycle boundary mismatch');
assert(contract.planVersion==='v1.2'&&JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([35]),'dev.27 Section 35 binding mismatch');
assert(JSON.stringify(contract.section35Areas)===JSON.stringify(section35Areas),'Section 35 area set mismatch');
assert(JSON.stringify(contract.transitionRelationships)===JSON.stringify(relationships),'Section 35 relationship map mismatch');
assert(contract.historicalFoundation.version==='1.7.0-dev.6','historical shell foundation version changed');
assert(contract.historicalFoundation.planNumbering==='v1.0-historical-numbering','historical plan provenance missing');
assert(contract.historicalFoundation.reinterpretedAsV12Section35===false,'dev.6 must not be relabeled as v1.2 Section 35');

for(const key of [
  'artificialDelayAllowed','navigationMayWaitForMotion','focusMayWaitForMotion',
  'shellExecutionMayWaitForMotion','taskStateMayWaitForMotion','finalStateDependsOnAnimationCompletion',
  'motionRequiredToUnderstandState','shellNavigationMayBeSlowedForMotion'
]) assert(contract.motionPolicy[key]===false,'motion/state boundary weakened: '+key);
assert(contract.motionPolicy.transitionOccurrenceAuthorityRequired===true,'shell transition authority must be explicit');
assert(contract.motionPolicy.reducedMotionPrecedence===true,'Reduced Motion precedence missing');
assert(contract.motionPolicy.performanceDegradationMayRemoveOptionalMotion===true,'performance degradation policy missing');

for(const denied of [
  'shellStateCreatedByGlaze','shellExecutionPerformedByGlaze','navigationExecutedByGlaze',
  'focusAuthorityCreatedByGlaze','notificationTruthCreatedByGlaze','activityTruthCreatedByGlaze',
  'searchAuthorityCreatedByGlaze','commandExecutionAuthorityCreatedByGlaze','performanceTruthCreatedByGlaze'
]) assert(contract.authority[denied]===false,'authority boundary weakened: '+denied);
assert(contract.acceptanceBoundary.section35Complete===false,'Section 35 completion overclaimed');

assert(glazeV17SystemShellContinuityDevelopmentContract.version==='1.7.0-dev.6','historical dev.6 runtime changed');
assert(JSON.stringify(glazeV17SystemShellContinuityDevelopmentContract.implementedSpecificationSections)===JSON.stringify([7]),'historical dev.6 numbering changed');
assert(glazeV17SystemShellContinuityV12DevelopmentContract.version==='1.7.0-dev.27','dev.27 runtime contract mismatch');
assert(glazeV17SystemShellContinuityV12DevelopmentContract.historicalFoundationReinterpreted===false,'runtime relabeled dev.6');
assert(glazeV17MotionPerformanceDevelopmentContract.version==='1.7.0-dev.25','dev.25 dependency changed');
assert(glazeV17GlazeMotionLifecycleDevelopmentContract.version==='1.7.0-dev.26','dev.26 dependency changed');
assert(glazeV17GlazeMotionLifecycleDevelopmentContract.glazeMotionExperimentalLifecyclePromoted===false,'Glaze Motion promoted unexpectedly');

const previousTaskState={
  navigationDestination:'search',focusId:'query',selectionIds:['result-2'],draftText:'draft',
  activeFilters:['local'],query:'notes',paneState:{mode:'split',activePane:'results'},
  pendingInteractions:[{id:'open-result',safe:true}],workingContext:{task:'search'}
};

const split=resolveGlazeSystemShellContinuityV12({
  shellArea:'split-view',transitionKind:'split-view-change',profile:'tablet',
  capabilityStates:{'split-view':'available'},authoritativeCapabilities:['split-view'],
  shellTransitionAuthoritative:true,previousTaskState,
  accessibilityProfiles:[]
});
assert(split.section35Area==='split-view','split-view Section 35 mapping mismatch');
assert(split.motion.signatureFamily==='Glaze Fold','split-view should use governed Glaze Fold semantics');
assert(split.motion.optionalMotionApplied===true,'authoritative split-view motion should be eligible');
assert(split.shell.taskState.navigationDestination==='search','shell motion must preserve navigation destination');
assert(split.shell.taskState.focusId==='query','shell motion must preserve focus');
assert(split.motion.shellNavigationMayBeSlowedForMotion===false,'shell navigation must not be slowed by motion');
assert(split.motion.finalStateDependsOnAnimationCompletion===false,'shell final state must not wait for motion');

const untrustedTransition=resolveGlazeSystemShellContinuityV12({
  shellArea:'multi-window',transitionKind:'multi-window-change',profile:'desktop',
  capabilityStates:{'multi-window':'available'},authoritativeCapabilities:['multi-window'],
  shellTransitionAuthoritative:false,previousTaskState
});
assert(untrustedTransition.motion.signatureRelationshipAccepted===false,'untrusted shell occurrence must not create a motion relationship');
assert(untrustedTransition.motion.optionalMotionApplied===false,'untrusted shell occurrence must not apply optional signature motion');
assert(untrustedTransition.motion.signatureFamily==='Standard transition','untrusted shell occurrence should fail closed to standard transition');

const searchWithoutIdentity=resolveGlazeSystemShellContinuityV12({
  shellArea:'search-continuity',transitionKind:'search-continuity',profile:'mobile',
  capabilityStates:{'system-search':'available'},authoritativeCapabilities:['system-search'],
  shellTransitionAuthoritative:true,previousTaskState
});
assert(searchWithoutIdentity.motion.signatureRelationshipAccepted===false,'search Bloom must require authoritative connected identity');
assert(searchWithoutIdentity.motion.optionalMotionApplied===false,'search motion must fail closed without identity');

const searchWithIdentity=resolveGlazeSystemShellContinuityV12({
  shellArea:'search-continuity',transitionKind:'search-continuity',profile:'mobile',
  capabilityStates:{'system-search':'available'},authoritativeCapabilities:['system-search'],
  shellTransitionAuthoritative:true,connectedIdentity:'search-session:local',connectedIdentityAuthoritative:true,
  previousTaskState
});
assert(searchWithIdentity.motion.signatureFamily==='Glaze Bloom','authoritative search identity should map to Glaze Bloom');
assert(searchWithIdentity.motion.optionalMotionApplied===true,'authoritative search identity should permit signature motion');

const reduced=resolveGlazeSystemShellContinuityV12({
  shellArea:'compact-expanded-navigation',transitionKind:'compact-expanded-navigation',profile:'tablet',
  capabilityStates:{'navigation-recomposition':'available'},authoritativeCapabilities:['navigation-recomposition'],
  shellTransitionAuthoritative:true,previousTaskState,accessibilityProfiles:['reduced-motion']
});
assert(reduced.motion.reducedMotionApplied===true,'Reduced Motion must propagate to shell continuity');
assert(reduced.motion.performanceMode==='reduced-motion','Reduced Motion must outrank shell motion richness');
assert(reduced.motion.motionRequiredToUnderstandState===false,'shell state must remain understandable without motion');

const pressure=resolveGlazeSystemShellContinuityV12({
  shellArea:'control-center',transitionKind:'control-center-layout',profile:'mobile',
  capabilityStates:{'control-center':'available'},authoritativeCapabilities:['control-center'],
  shellTransitionAuthoritative:true,previousTaskState,
  runtimePressure:'severe',runtimePressureAuthoritative:true
});
assert(pressure.motion.performanceMode==='minimal','authoritative severe runtime pressure must simplify shell motion');
assert(pressure.continuity.performanceDegradationMayResetTask===false,'performance degradation must not reset task state');

const untrustedPressure=resolveGlazeSystemShellContinuityV12({
  shellArea:'control-center',transitionKind:'control-center-layout',profile:'mobile',
  capabilityStates:{'control-center':'available'},authoritativeCapabilities:['control-center'],
  shellTransitionAuthoritative:true,previousTaskState,
  runtimePressure:'severe',runtimePressureAuthoritative:false
});
assert(untrustedPressure.motion.performanceMode==='full','untrusted runtime pressure must fail closed to neutral');
assert(untrustedPressure.motionPerformance.evidence.untrustedNonNeutralSignalIgnored===true,'untrusted pressure rejection must be observable');

let rawControlRejected=false;
try{
  resolveGlazeSystemShellContinuityV12({
    shellArea:'control-center',transitionKind:'control-center-layout',profile:'mobile',durationMs:200
  });
}catch(error){rawControlRejected=error instanceof RangeError;}
assert(rawControlRejected,'raw motion controls must be rejected');

assert(tokens.version==='1.7.0-dev.27'&&tokens.v12SpecificationSections[0]===35,'dev.27 token identity mismatch');
assert(tokens.stateFirst.finalStateDependsOnAnimationCompletion===false,'token state-first boundary weakened');
assert(tokens.degradation.shellNavigationMayBeSlowedForMotion===false,'token shell navigation boundary weakened');
assert(tokens.boundaries.section35Complete===false,'token Section 35 completion overclaimed');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=27,'aggregate version regressed below dev.27');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31,32,33,34,35]){
  assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
}
assert(glazeV17Development.systemShellContinuityV12Foundation==='js/glaze-v1.7-system-shell-continuity-v1-2.dev.mjs','aggregate missing dev.27 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(spec.includes('dev.27')&&spec.includes('Section 35'),'plan provenance missing dev.27');
assert(planned.includes('1.7.0-dev.27')&&planned.includes('System Shell Continuity'),'planned-feature control missing dev.27');
assert(implemented.includes('System Shell Continuity v1.2 — `1.7.0-dev.27`'),'implemented-feature control missing dev.27');
assert(changelog.includes('1.7.0-dev.27')&&changelog.includes('System Shell Continuity'),'changelog missing dev.27');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

console.log('GLAZE UI V1.7 System Shell Continuity v1.2 Development validation: PASS');
console.log('Plan binding: v1.2 Section 35');
console.log('Historical dev.6 provenance preserved: true');
console.log('Shell navigation may wait for motion: false');
console.log('Section 35 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
