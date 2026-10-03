#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeSignatureMicrointeraction,
  glazeV17SignatureMicrointeractionsDevelopmentContract
} from '../js/glaze-v1.7-signature-microinteractions.dev.mjs';
import {glazeV17AdaptiveCompositionMotionDevelopmentContract} from '../js/glaze-v1.7-adaptive-composition-motion.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/signature-microinteractions.dev.json');
const schema=json('schemas/v1.7-signature-microinteractions.schema.json');
const tokens=json('tokens/glaze-v1.7-signature-microinteractions.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('docs/development/v1.7-signature-microinteractions-open-source-research-20260926.md');
const glazeMotion=json('tokens/glaze-motion.json');

const actions=[
  'toggle','select','favorite','save','copy','pin','expand','collapse',
  'refresh','retry','send','download','upload','completion','reorder'
];

assert(read('VERSION').trim()==='1.7.0','bounded V1.7 VERSION changed');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.19 must not create lifecycle promotion state');

for(const phrase of [
  '## 27. Signature Microinteractions','Toggle','Select','Favorite','Save','Copy','Pin',
  'Expand','Collapse','Refresh','Retry','Send','Download','Upload','Completion','Reorder',
  'small number of properties','quick, readable, and non-disruptive',
  'Repeated actions must not produce tiring or distracting animation'
]) assert(spec.includes(phrase),'Section 27 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.19'&&contract.planVersion==='v1.2'&&contract.consumerEligible===false,'dev.19 contract identity mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([27]),'dev.19 section marker mismatch');
assert(contract.dependsOn.adaptiveCompositionMotionVersion==='1.7.0-dev.18','dev.18 dependency mismatch');
assert(JSON.stringify(contract.actionOrder)===JSON.stringify(actions),'action order mismatch');
assert(Object.keys(contract.actionPolicy).length===15,'action policy count mismatch');
for(const action of actions){
  const channels=contract.actionPolicy[action].channels;
  assert(Array.isArray(channels)&&channels.length>=1&&channels.length<=3,'channel count out of bounds: '+action);
}
assert(contract.requestPolicy.actionAuthorityRequired===true&&contract.requestPolicy.controlIdentityAuthorityRequired===true,'action/control authority boundary weakened');
assert(contract.requestPolicy.resultAuthorityRequiredForResultPhase===true,'result authority boundary weakened');
assert(contract.requestPolicy.directExecutionAccepted===false&&contract.requestPolicy.rawTimingAccepted===false&&contract.requestPolicy.rawChoreographyAccepted===false,'raw/execution boundary weakened');
assert(contract.microinteractionPolicy.maximumMotionChannels===3,'microinteraction channel budget changed');
assert(contract.microinteractionPolicy.resultFeedbackRequiresAuthoritativeResult===true&&contract.microinteractionPolicy.operationExecutionPerformedByGlaze===false,'result/execution boundary weakened');
assert(contract.authority.providerTruthCreatedByGlaze===false&&contract.authority.completionDeclaredByGlaze===false,'provider/completion truth manufactured');
assert(contract.accessibility.reducedMotionPrecedence===true&&contract.accessibility.motionRequiredToUnderstandResult===false,'accessibility boundary weakened');
assert(contract.fatigue.repeatedActionsMaySuppressTravel===true&&contract.fatigue.authoritativeStateRemainsVisible===true,'fatigue boundary weakened');
assert(contract.performance.authoritativeStateMustRemainCorrect===true&&contract.performance.measuredPerformanceAcceptanceEstablished===false,'performance boundary weakened');
assert(contract.acceptanceBoundary.microinteractionCatalogImplemented===true&&contract.acceptanceBoundary.section27Complete===false,'Section 27 source boundary mismatch');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

assert(tokens.version==='1.7.0-dev.19'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.fallbacks.untrustedResult==='intent-only-no-result-claim','untrusted result fallback missing');
assert(tokens.fallbacks.reducedMotion==='immediate-state-feedback','Reduced Motion fallback missing');
assert(tokens.boundaries.section27Complete===false&&tokens.boundaries.glazeMotionExperimentalLifecyclePromoted===false,'token lifecycle/completion boundary weakened');

for(const action of actions){
  const intent=resolveGlazeSignatureMicrointeraction({
    action,actionAuthoritative:true,controlIdentity:'control-42',controlIdentityAuthoritative:true,phase:'intent'
  });
  assert(intent.version==='1.7.0-dev.19','runtime version mismatch: '+action);
  assert(intent.sourceFoundation.actionAccepted===true,'action rejected: '+action);
  assert(intent.interaction.action===action&&intent.interaction.phase==='intent','intent mismatch: '+action);
  assert(intent.motion.channels.length<=3,'runtime channel budget exceeded: '+action);
  assert(intent.staticSignals.semanticResultRole===null,'intent manufactured result: '+action);
  assert(intent.authority.commandExecutedByGlaze===false&&intent.authority.providerTruthCreatedByGlaze===false,'authority boundary weakened: '+action);
  assert(intent.acceptanceBoundary.section27Complete===false,'Section 27 completion overclaim: '+action);

  const result=resolveGlazeSignatureMicrointeraction({
    action,actionAuthoritative:true,controlIdentity:'control-42',controlIdentityAuthoritative:true,
    phase:'result',resultAuthoritative:true,resultState:'confirmed'
  });
  assert(result.interaction.resultAuthorityAccepted===true,'authoritative result rejected: '+action);
  assert(result.staticSignals.semanticResultRole==='action-confirmed','confirmed result role missing: '+action);
}

for(const badIdentity of [undefined,null,'','   ']){
  const resolved=resolveGlazeSignatureMicrointeraction({
    action:'save',actionAuthoritative:true,controlIdentity:badIdentity,controlIdentityAuthoritative:true,phase:'intent'
  });
  assert(resolved.sourceFoundation.actionAccepted===false,'unclear control identity accepted');
  assert(resolved.interaction.fallbackReason==='unclear-control-identity','identity fallback reason mismatch');
}

const untrustedResult=resolveGlazeSignatureMicrointeraction({
  action:'send',actionAuthoritative:true,controlIdentity:'send-1',controlIdentityAuthoritative:true,
  phase:'result',resultAuthoritative:false,resultState:'confirmed'
});
assert(untrustedResult.sourceFoundation.actionAccepted===false,'untrusted result accepted');
assert(untrustedResult.interaction.fallbackReason==='untrusted-result-state','untrusted result fallback mismatch');
assert(untrustedResult.staticSignals.semanticResultRole===null,'untrusted result manufactured success');

const reduced=resolveGlazeSignatureMicrointeraction({
  action:'favorite',actionAuthoritative:true,controlIdentity:'favorite-1',controlIdentityAuthoritative:true,
  phase:'intent',accessibilityProfiles:['reduced-motion']
});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion not applied');
assert(reduced.motion.channels.every(channel=>channel.enabled===false),'Reduced Motion did not suppress motion channels');
assert(reduced.accessibility.motionRequiredToUnderstandResult===false,'result meaning depends on motion');

const repeated=resolveGlazeSignatureMicrointeraction({
  action:'refresh',actionAuthoritative:true,controlIdentity:'refresh-1',controlIdentityAuthoritative:true,
  phase:'intent',repeatedAction:true
});
assert(repeated.motion.repeatedActionFatigueReductionApplied===true,'repetition-fatigue policy not applied');
assert(repeated.motion.channels.filter(channel=>['position','geometry','bounded-scale','icon-transformation'].includes(channel.channel)).every(channel=>channel.enabled===false),'fatiguing channel remained enabled');

const pressured=resolveGlazeSignatureMicrointeraction({
  action:'reorder',actionAuthoritative:true,controlIdentity:'row-4',controlIdentityAuthoritative:true,
  phase:'intent',performancePressure:true
});
assert(pressured.motion.performanceDegradationApplied===true,'performance degradation not applied');
assert(pressured.performance.authoritativeStateCorrect===true,'performance pressure changed authoritative state');

const reducedTransparency=resolveGlazeSignatureMicrointeraction({
  action:'select',actionAuthoritative:true,controlIdentity:'select-1',controlIdentityAuthoritative:true,
  phase:'intent',accessibilityProfiles:['reduced-transparency']
});
assert(reducedTransparency.motion.channels.some(channel=>channel.channel==='material-solid-equivalent'),'Reduced Transparency material equivalent missing');

for(const key of ['durationMs','easing','spring','physics','keyframes','path','travelPx','distance','rotation','overshoot','bounce','wobble','scaleFactor']){
  let failed=false;
  try{
    resolveGlazeSignatureMicrointeraction({
      action:'toggle',actionAuthoritative:true,controlIdentity:'toggle-1',controlIdentityAuthoritative:true,phase:'intent',[key]:'arbitrary'
    });
  }catch{failed=true;}
  assert(failed,'raw motion request accepted: '+key);
}

assert(glazeV17AdaptiveCompositionMotionDevelopmentContract.version==='1.7.0-dev.18','dev.18 identity changed');
assert(glazeV17AdaptiveCompositionMotionDevelopmentContract.section26Complete===false,'dev.18 relabeled as Section 26 complete');
assert(glazeV17SignatureMicrointeractionsDevelopmentContract.version==='1.7.0-dev.19','runtime contract version mismatch');
assert(glazeV17SignatureMicrointeractionsDevelopmentContract.section27Complete===false,'runtime contract completion overclaim');
const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=19,'aggregate version regressed below dev.19');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25,26,27])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.signatureMicrointeractionsFoundation==='js/glaze-v1.7-signature-microinteractions.dev.mjs','aggregate missing dev.19 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');
assert(research.includes('Material Components for Android')&&research.includes('IBM Carbon Design System')&&research.includes('Microsoft Fluent UI'),'research provenance incomplete');
assert(research.includes('No upstream source code')||research.includes('No upstream source'),'research independence boundary missing');
assert(spec.includes('dev.19')&&spec.includes('Signature Microinteractions'),'plan provenance boundary missing dev.19');
assert(planned.includes('1.7.0-dev.19')&&planned.includes('Signature Microinteractions'),'planned-feature provenance missing dev.19');
assert(implemented.includes('Signature Microinteractions — `1.7.0-dev.19`'),'implemented-feature control missing dev.19');
assert(changelog.includes('1.7.0-dev.19')&&changelog.includes('Signature Microinteractions'),'changelog missing dev.19');

console.log('GLAZE UI V1.7 Signature Microinteractions Development foundation: PASS');
console.log('Plan binding: v1.2 Section 27');
console.log('Governed microinteraction actions: 15');
console.log('Result feedback requires authoritative result: true');
console.log('Section 27 complete: false');
console.log('Rendered/native/performance/fatigue acceptance: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
