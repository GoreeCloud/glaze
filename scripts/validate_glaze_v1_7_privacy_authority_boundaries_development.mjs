import {readFileSync} from 'node:fs';
import {
  resolveGlazePrivacyAuthorityBoundaryV12,
  glazeV17PrivacyAuthorityBoundariesDevelopmentContract,
  PRIVACY_AUTHORITY_TRUTH_DOMAINS
} from '../js/glaze-v1.7-privacy-authority-boundaries.dev.mjs';
import {glazeProviderDevelopmentContract} from '../js/glaze-v1.5-provider-registry.dev.mjs';
import {glazeV17VisualMotionDirectionDevelopmentContract}
  from '../js/glaze-v1.7-visual-motion-direction.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const json=path=>JSON.parse(read(path));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/privacy-authority-boundaries.dev.json');
const schema=json('schemas/v1.7-privacy-authority-boundaries.schema.json');
const tokens=json('tokens/glaze-v1.7-privacy-authority-boundaries.dev.json');
const lifecycle=json('registry/lifecycle.json');
const version=read('VERSION').trim();
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const plan=read('GLAZE_UI_V1_7_PLANNED.md');
const research=read('research/v1.7-privacy-authority-boundaries.md');
const rootResearch=read('OPEN-SOURCE-RESEARCH.md');

assert(contract.version==='1.7.0-dev.37','contract version mismatch');
assert(contract.planVersion==='v1.2'&&contract.v12SpecificationSections[0]===44,'contract plan binding mismatch');
assert(contract.consumerEligible===false&&contract.stableBaseline==='1.6.0','contract lifecycle boundary weakened');
assert(contract.truthDomains.length===9,'truth domain count mismatch');
assert(contract.authorityPolicy.providerRegistryInherited===true,'V1.5 provider registry inheritance missing');
assert(contract.authorityPolicy.providerConflictsFailClosed===true,'provider conflict policy weakened');
assert(contract.authorityPolicy.providerPrecedenceInferred===false,'provider precedence inference introduced');
assert(contract.motionPolicy.truthBearingMotionRequiresAcceptedTruth===true,'truth-bearing motion boundary weakened');
assert(contract.acceptanceBoundary.section44Complete===false,'contract overclaims Section 44 completion');
assert(schema.properties.version.const==='1.7.0-dev.37','schema identity mismatch');
assert(tokens.principle.motionCreatesTruth===false&&tokens.principle.conflictsFailClosed===true,'token truth boundary weakened');

const wardveil=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'security-protection',
  claims:[{providerId:'wardveil-security',ownerKind:'wardveil-security',authority:'security',scope:'system',state:'protected',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true,
  accessibility:{},accessibilityAuthoritative:true,
  performancePressure:'neutral',performancePressureAuthoritative:true
});
assert(wardveil.truth.accepted&&wardveil.truth.effectiveState==='protected','authoritative Wardveil protection must be accepted');
assert(wardveil.presentation.protectionCueAllowed===true,'accepted Wardveil protection cue missing');

const spoofedProtection=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'security-protection',
  claims:[{providerId:'random-service',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'protected',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(spoofedProtection.truth.accepted===false&&spoofedProtection.truth.effectiveState==='unknown','non-Wardveil protection claim must fail closed');

const privacy=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'privacy-consent',
  claims:[{providerId:'privacy-shield',ownerKind:'privacy-shield',authority:'privacy',scope:'system',state:'revoked',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(privacy.presentation.privacyRevocationCueAllowed===true,'Privacy Shield revocation must be authoritative');

const providerLocalPrivacy=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'privacy-access',
  claims:[{providerId:'photos-service',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'denied',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(providerLocalPrivacy.truth.accepted&&providerLocalPrivacy.truth.acceptedScope==='provider-local','provider-local privacy access should remain bounded');

const globalProviderPrivacy=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'privacy-access',
  claims:[{providerId:'photos-service',ownerKind:'responsible-provider',authority:'service',scope:'system',state:'revoked',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(globalProviderPrivacy.truth.accepted===false,'responsible provider must not claim system-wide privacy access truth');

const sync=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'synchronization',
  claims:[{providerId:'calendar-sync',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'synchronized',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(sync.presentation.synchronizationCompletionCueAllowed===true,'authoritative synchronization completion cue missing');

const conflict=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'synchronization',
  claims:[
    {providerId:'sync-a',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'synchronized',authorityAttested:true},
    {providerId:'sync-b',ownerKind:'responsible-provider',authority:'service',scope:'provider-local',state:'failed',authorityAttested:true}
  ],
  transitionOccurrenceAuthoritative:true
});
assert(conflict.providerSnapshot.conflict===true&&conflict.truth.effectiveState==='unknown','provider conflict must fail closed');

const unattested=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'operation-result',
  claims:[{providerId:'editor',ownerKind:'application',authority:'application',scope:'application-local',state:'success',authorityAttested:false}],
  transitionOccurrenceAuthoritative:true
});
assert(unattested.truth.accepted===false&&unattested.presentation.successCueAllowed===false,'unattested success must not be manufactured');

const everkeep=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'resilience-recovery',
  claims:[{providerId:'everkeep',ownerKind:'everkeep',authority:'service',scope:'system',state:'recovered',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(everkeep.presentation.recoveryCompletionCueAllowed===true,'Everkeep recovery truth not preserved');

const identity=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'identity-authentication',
  claims:[{providerId:'goreecloud-identity',ownerKind:'goreecloud-identity',authority:'identity',scope:'system',state:'authenticated',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(identity.presentation.authenticationSuccessCueAllowed===true,'Identity authentication truth not preserved');

const mesh=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'coordination-status',
  claims:[{providerId:'goreecloud-mesh',ownerKind:'goreecloud-mesh',authority:'service',scope:'coordination-only',state:'delivered',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(mesh.truth.accepted&&mesh.authority.meshCoordinationTruthOnly===true,'Mesh coordination truth should be accepted only in coordination scope');
assert(mesh.authority.meshGovernanceAuthorityInherited===false&&mesh.authority.meshAuthorizationAuthorityInherited===false,'Mesh must not inherit governance or authorization');

const meshSecuritySpoof=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'security-protection',
  claims:[{providerId:'goreecloud-mesh',ownerKind:'goreecloud-mesh',authority:'service',scope:'coordination-only',state:'protected',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(meshSecuritySpoof.truth.accepted===false&&meshSecuritySpoof.truth.effectiveState==='unknown','Mesh must not acquire Wardveil security truth authority');

const platformConnectivity=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'connectivity-availability',
  claims:[{providerId:'android-platform',ownerKind:'platform',authority:'platform',scope:'platform-local',state:'online',authorityAttested:true}],
  transitionOccurrenceAuthoritative:true
});
assert(platformConnectivity.truth.accepted&&platformConnectivity.truth.acceptedScope==='platform-local','platform connectivity truth must remain platform-local');

const noOccurrence=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'operation-result',
  claims:[{providerId:'editor',ownerKind:'application',authority:'application',scope:'application-local',state:'success',authorityAttested:true}],
  transitionOccurrenceAuthoritative:false
});
assert(noOccurrence.truth.effectiveState==='success','truth state must not depend on animation occurrence');
assert(noOccurrence.presentation.successCueAllowed===true,'accepted success semantic cue should remain available');
assert(noOccurrence.presentation.animatedTransitionAllowed===false,'unattested transition occurrence must block non-trivial animation');

for(const bad of [
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({truthDomain:'operation-result',claims:[],score:10}),
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({truthDomain:'operation-result',claims:[{providerId:'x',ownerKind:'application',authority:'application',scope:'application-local',state:'success',authorityAttested:true,confidence:0.9}]}),
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({truthDomain:'operation-result',claims:[{providerId:'x',ownerKind:'application',authority:'application',scope:'application-local',state:'success',authorityAttested:true}],providerPrecedence:'x'}),
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({truthDomain:'security-protection',claims:[{providerId:'wardveil-security',ownerKind:'wardveil-security',authority:'security',scope:'system',state:'protected',authorityAttested:true,isProtected:true}]}),
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({truthDomain:'privacy-consent',claims:[{providerId:'privacy-shield',ownerKind:'privacy-shield',authority:'privacy',scope:'system',state:'granted',authorityAttested:true}],permissionGranted:true})
]){
  let failed=false; try{bad();}catch{failed=true;}
  assert(failed,'inference/ranking/raw truth controls must fail closed');
}

assert(PRIVACY_AUTHORITY_TRUTH_DOMAINS.length===9,'runtime truth domain count mismatch');
assert(glazeProviderDevelopmentContract.providerPrecedenceInferred===false,'V1.5 provider registry precedence changed');
assert(glazeV17VisualMotionDirectionDevelopmentContract.version==='1.7.0-dev.36','dev.36 dependency changed');
assert(glazeV17PrivacyAuthorityBoundariesDevelopmentContract.version==='1.7.0-dev.37','runtime contract identity mismatch');
assert(glazeV17PrivacyAuthorityBoundariesDevelopmentContract.motionCreatesTruth===false,'runtime contract manufactures truth');
assert(glazeV17PrivacyAuthorityBoundariesDevelopmentContract.section44Complete===false,'runtime overclaims Section 44');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=37,'aggregate version regressed below dev.37');
assert(glazeV17Development.planV12FoundationSections.includes(44),'aggregate missing Section 44');
assert(glazeV17Development.privacyAuthorityBoundariesFoundation==='js/glaze-v1.7-privacy-authority-boundaries.dev.mjs','aggregate missing dev.37 foundation');
assert(glazeV17Development.providerTruthManufactured===false,'aggregate provider truth boundary weakened');

assert(version==='1.6.0','VERSION must remain V1.6 Anchor');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'source implementation must not create lifecycle candidate');

assert(planned.includes('1.7.0-dev.37')&&planned.includes('Privacy and Authority Boundaries'),'planned feature control missing dev.37');
assert(implemented.includes('Privacy and Authority Boundaries')&&implemented.includes('1.7.0-dev.37'),'implemented feature control missing dev.37');
assert(changelog.includes('1.7.0-dev.37')&&changelog.includes('Privacy and Authority Boundaries'),'changelog missing dev.37');
assert(plan.includes('dev.37')&&plan.includes('Section 44'),'planned upgrade authority missing dev.37');
assert(rootResearch.includes('## V1.7 dev.37 — Privacy and Authority Boundaries'),'root research register missing dev.37');

for(const phrase of [
  'androidx/androidx','23327507f7fc7d5b19d65fec4b090f60c970079b','Apache-2.0',
  'microsoft/fluentui','8add8c8750c34c85acd811e32ab324abf8f1562e','MIT',
  'adobe/react-spectrum','16eead67e83cf42f3c0ee46ef6eb7a2032778378',
  'No third-party source code'
])assert(research.includes(phrase),'research provenance missing: '+phrase);

console.log('GLAZE UI V1.7 Privacy and Authority Boundaries Development validation: PASS');
console.log('Plan binding: v1.2 Section 44');
console.log('Truth domains: 9');
console.log('Provider conflicts fail closed: true');
console.log('Provider precedence inferred: false');
console.log('Motion creates truth: false');
console.log('Section 44 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
