#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeSystemShellContinuityV12,
  glazeV17SystemShellContinuityV12DevelopmentContract
} from '../js/glaze-v1.7-system-shell-continuity-v12.dev.mjs';
import {glazeV17SystemShellContinuityDevelopmentContract} from '../js/glaze-v1.7-system-shell-continuity.dev.mjs';
import {glazeV17SignatureTransitionFamiliesDevelopmentContract} from '../js/glaze-v1.7-signature-transition-families.dev.mjs';
import {glazeV17ReducedMotionEquivalentsDevelopmentContract} from '../js/glaze-v1.7-reduced-motion-equivalents.dev.mjs';
import {glazeV17MotionFatigueProtectionDevelopmentContract} from '../js/glaze-v1.7-motion-fatigue-protection.dev.mjs';
import {glazeV17MotionPerformanceDevelopmentContract} from '../js/glaze-v1.7-motion-performance.dev.mjs';
import {glazeV17GlazeMotionLifecycleDevelopmentContract} from '../js/glaze-v1.7-glaze-motion-lifecycle.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/system-shell-continuity-v12.dev.json');
const schema=json('schemas/v1.7-system-shell-continuity-v12.schema.json');
const tokens=json('tokens/glaze-v1.7-system-shell-continuity-v12.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('docs/development/v1.7-system-shell-continuity-v12-open-source-research-20260926.md');

const areas=[
  'notification-activity-presentation','control-center','multi-window','split-view',
  'compact-expanded-navigation','window-restoration','application-system-handoff',
  'task-switching','universal-search','contextual-commands'
];

assert(read('VERSION').trim()==='1.6.0','V1.6 VERSION changed');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'dev.27 must not create lifecycle promotion state');

for(const phrase of [
  '## 35. System Shell Continuity','Notification/activity presentation','Control Center',
  'Multi-window','Split view','Compact/expanded navigation','Window restoration',
  'Application/system handoff','Task switching','Universal Search','Contextual commands',
  'Signature motion should reinforce shell relationships without making shell navigation slower.'
]) assert(spec.includes(phrase),'Section 35 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.27'&&contract.lifecycle==='Development','dev.27 identity mismatch');
assert(contract.stableBaseline==='1.6.0'&&contract.consumerEligible===false,'dev.27 lifecycle boundary mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([35]),'dev.27 Section 35 binding mismatch');
assert(JSON.stringify(contract.section35Areas)===JSON.stringify(areas),'Section 35 area vocabulary changed');
assert(contract.historicalFoundation.version==='1.7.0-dev.6'&&contract.historicalFoundation.reinterpretedAsSection35===false,'historical dev.6 boundary changed');
assert(contract.motionPolicy.artificialNavigationDelayAllowed===false&&contract.motionPolicy.motionMayDelayProviderExecution===false,'shell anti-latency boundary weakened');
assert(contract.motionPolicy.reducedMotionPrecedence===true&&contract.motionPolicy.fatigueProtectionRequired===true&&contract.motionPolicy.performanceDegradationRequired===true,'motion precedence missing');
assert(contract.acceptanceBoundary.section35Complete===false,'Section 35 completion overclaimed');
assert(contract.acceptanceBoundary.semanticShellMotionMappingImplemented===true,'Section 35 source mapping missing');

assert(glazeV17SystemShellContinuityDevelopmentContract.version==='1.7.0-dev.6','historical dev.6 version changed');
assert(JSON.stringify(glazeV17SystemShellContinuityDevelopmentContract.implementedSpecificationSections)===JSON.stringify([7]),'historical dev.6 specification provenance changed');
assert(glazeV17SignatureTransitionFamiliesDevelopmentContract.version==='1.7.0-dev.16','dev.16 dependency changed');
assert(glazeV17ReducedMotionEquivalentsDevelopmentContract.version==='1.7.0-dev.23','dev.23 dependency changed');
assert(glazeV17MotionFatigueProtectionDevelopmentContract.version==='1.7.0-dev.24','dev.24 dependency changed');
assert(glazeV17MotionPerformanceDevelopmentContract.version==='1.7.0-dev.25','dev.25 dependency changed');
assert(glazeV17GlazeMotionLifecycleDevelopmentContract.version==='1.7.0-dev.26'&&glazeV17GlazeMotionLifecycleDevelopmentContract.promotionReady===false,'dev.26 lifecycle boundary changed');

const previousTaskState={
  navigationDestination:'search',
  focusId:'query-field',
  selectionIds:['result-2'],
  draftText:'draft',
  activeFilters:['local'],
  query:'privacy',
  paneState:{mode:'split',activePane:'results'},
  pendingInteractions:[{id:'open-result',safe:true}],
  workingContext:{task:'search'}
};

const multi=resolveGlazeSystemShellContinuityV12({
  shellArea:'multi-window',
  profile:'desktop',
  capabilityStates:{'multi-window':'available'},
  authoritativeCapabilities:['multi-window'],
  previousTaskState,
  previousShellContext:{windowState:{active:'search'}}
});
assert(multi.historicalFoundation.version==='1.7.0-dev.6','dev.27 does not compose historical dev.6');
assert(multi.shell.presentation.available===true,'authoritative multi-window capability should be available');
assert(multi.signatureMotion.relationship==='workspace-recomposition','multi-window relationship mismatch');
assert(multi.signatureMotion.family==='Glaze Flow'&&multi.signatureMotion.signatureApplied===true,'multi-window should resolve Glaze Flow');
assert(multi.continuity.navigationDestinationPreserved===true&&multi.continuity.focusPreserved===true&&multi.continuity.queryFilterContextPreserved===true,'multi-window continuity lost');
assert(multi.signatureMotion.motionMayDelayShellNavigation===false&&multi.signatureMotion.motionMayDelayProviderExecution===false,'multi-window motion may delay shell operation');
assert(multi.authority.navigationExecutedByMotion===false&&multi.authority.executionAuthorityCreatedByGlaze===false,'motion gained execution authority');

const search=resolveGlazeSystemShellContinuityV12({
  shellArea:'universal-search',
  profile:'mobile',
  capabilityStates:{'system-search':'available'},
  authoritativeCapabilities:['system-search'],
  previousTaskState
});
assert(search.historicalFoundation.shellArea==='search-continuity','Universal Search must map to historical search continuity');
assert(search.signatureMotion.relationship==='context-overlay'&&search.signatureMotion.family==='Glaze Veil','Universal Search semantic motion mismatch');

const commands=resolveGlazeSystemShellContinuityV12({
  shellArea:'contextual-commands',
  profile:'desktop',
  capabilityStates:{'contextual-command-surfaces':'available'},
  authoritativeCapabilities:['contextual-command-surfaces'],
  previousTaskState
});
assert(commands.historicalFoundation.shellArea==='contextual-command-surfaces','contextual command historical mapping mismatch');
assert(commands.signatureMotion.family==='Glaze Lift','contextual commands should resolve Glaze Lift');

const handoffNoIdentity=resolveGlazeSystemShellContinuityV12({
  shellArea:'application-system-handoff',
  profile:'mobile',
  capabilityStates:{'application-system-handoff':'available'},
  authoritativeCapabilities:['application-system-handoff'],
  previousTaskState
});
assert(handoffNoIdentity.signatureMotion.relationship==='source-destination-continuity','handoff relationship mismatch');
assert(handoffNoIdentity.signatureMotion.family==='Standard transition'&&handoffNoIdentity.signatureMotion.signatureApplied===false,'handoff without identity must fail closed');

const handoffIdentity=resolveGlazeSystemShellContinuityV12({
  shellArea:'application-system-handoff',
  profile:'mobile',
  capabilityStates:{'application-system-handoff':'available'},
  authoritativeCapabilities:['application-system-handoff'],
  previousTaskState,
  objectIdentity:'task-42',
  objectIdentityAuthoritative:true
});
assert(handoffIdentity.signatureMotion.family==='Glaze Trace'&&handoffIdentity.signatureMotion.signatureApplied===true,'authoritative handoff identity should allow Glaze Trace');
assert(handoffIdentity.shell.transition.executionPerformedByGlaze===false,'handoff execution must remain provider-owned');

const reduced=resolveGlazeSystemShellContinuityV12({
  shellArea:'split-view',
  profile:'tablet',
  capabilityStates:{'split-view':'available'},
  authoritativeCapabilities:['split-view'],
  previousTaskState,
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.signatureMotion.family==='Glaze Flow','Reduced Motion must preserve semantic family identity');
assert(reduced.accessibility.reducedMotionApplied===true&&reduced.signatureMotion.reducedMotionEquivalent!==null,'Reduced Motion equivalent missing');
assert(reduced.signatureMotion.finalStateDependsOnAnimationCompletion===false,'Reduced Motion final state depends on animation');

const pressure=resolveGlazeSystemShellContinuityV12({
  shellArea:'task-switching',
  profile:'desktop',
  capabilityStates:{'task-switching':'available'},
  authoritativeCapabilities:['task-switching'],
  previousTaskState,
  runtimePressure:'severe',
  runtimePressureAuthoritative:true
});
assert(pressure.signatureMotion.family==='Glaze Focus Transfer','task switching family mismatch');
assert(pressure.performance.mode==='minimal','severe authoritative runtime pressure should minimize shell motion');
assert(pressure.performance.inputMayWaitForDecorativeMotion===false,'shell input may wait for decorative motion');

const untrusted=resolveGlazeSystemShellContinuityV12({
  shellArea:'multi-window',
  profile:'desktop',
  capabilityStates:{'multi-window':'available'},
  authoritativeCapabilities:[],
  previousTaskState
});
assert(untrusted.shell.presentation.available===false,'untrusted shell capability became available');
assert(untrusted.signatureMotion.signatureApplied===false&&untrusted.signatureMotion.family==='Standard transition','untrusted shell capability activated signature motion');

for(const key of [
  'relationship','family','durationMs','easing','spring','physics','keyframes','path',
  'distance','scale','frameBudgetMs','performanceThresholds','measurements'
]){
  let failed=false;
  try{resolveGlazeSystemShellContinuityV12({shellArea:'multi-window',profile:'desktop',[key]:123});}catch{failed=true;}
  assert(failed,'raw control accepted: '+key);
}

for(const area of areas){
  assert(Object.prototype.hasOwnProperty.call(tokens.shellRelationships,area),'token map missing '+area);
}
assert(tokens.version==='1.7.0-dev.27'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.navigationPolicy.artificialDelayAllowed===false&&tokens.navigationPolicy.motionMayDelayNavigation===false,'token anti-latency rule weakened');
assert(tokens.boundaries.section35Complete===false&&tokens.boundaries.consumerEligible===false,'token acceptance boundary weakened');

assert(glazeV17SystemShellContinuityV12DevelopmentContract.version==='1.7.0-dev.27','runtime contract version mismatch');
assert(glazeV17SystemShellContinuityV12DevelopmentContract.artificialNavigationDelayAllowed===false,'runtime anti-latency rule changed');
assert(glazeV17SystemShellContinuityV12DevelopmentContract.section35Complete===false,'runtime Section 35 overclaim');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=27,'aggregate version regressed below dev.27');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27,28,29,30,31,32,33,34,35]){
  assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
}
assert(glazeV17Development.systemShellContinuityV12Foundation==='js/glaze-v1.7-system-shell-continuity-v12.dev.mjs','aggregate missing dev.27 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Experimental Glaze Motion');

for(const phrase of [
  'Android Open Source Project — SystemUI Scene Framework',
  'GNOME Mutter / GNOME Shell',
  'KDE KWin',
  'does **not** copy',
  'historical dev.6',
  'motion may not delay shell navigation'
]) assert(research.includes(phrase),'research record missing: '+phrase);

assert(spec.includes('dev.27')&&spec.includes('Section 35'),'plan provenance missing dev.27');
assert(planned.includes('1.7.0-dev.27')&&planned.includes('Section 35'),'planned-feature control missing dev.27');
assert(implemented.includes('System Shell Continuity v1.2 — `1.7.0-dev.27`'),'implemented-feature control missing dev.27');
assert(changelog.includes('1.7.0-dev.27')&&changelog.includes('System Shell Continuity'),'changelog missing dev.27');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

console.log('GLAZE UI V1.7 System Shell Continuity v1.2 Development reconciliation: PASS');
console.log('Plan binding: v1.2 Section 35');
console.log('Historical dev.6 preserved: true');
console.log('Section 35 shell areas: 10');
console.log('Shell navigation may wait for motion: false');
console.log('Section 35 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
