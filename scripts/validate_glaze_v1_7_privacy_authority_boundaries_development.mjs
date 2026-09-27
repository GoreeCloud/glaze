import {readFileSync} from 'node:fs';
import {
  resolveGlazePrivacyAuthorityBoundaryV12,
  glazeV17PrivacyAuthorityBoundariesDevelopmentContract,
  PRIVACY_AUTHORITY_TRUTH_DOMAINS,
  PRIVACY_AUTHORITY_EVENTS
} from '../js/glaze-v1.7-privacy-authority-boundaries.dev.mjs';
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
assert(contract.planVersion==='v1.2'&&contract.v12SpecificationSections.length===1&&contract.v12SpecificationSections[0]===44,'contract plan binding mismatch');
assert(contract.consumerEligible===false&&contract.stableBaseline==='1.6.0','contract lifecycle boundary weakened');
assert(contract.governingRule.motionCommunicatesTruth===true&&contract.governingRule.motionCreatesTruth===false,'truth/motion rule weakened');
assert(contract.governingRule.providerPrecedenceInferred===false,'provider precedence boundary weakened');
assert(contract.truthDomains['security-protection'][0]==='wardveil-security','security authority identifier drifted');
assert(contract.truthDomains['privacy-access'].includes('privacy-shield'),'privacy authority identifier drifted');
assert(contract.truthDomains.recovery.includes('everkeep'),'recovery authority identifier drifted');
assert(contract.truthDomains['identity-authentication'][0]==='goreecloud-identity','identity authority identifier drifted');
assert(contract.acceptanceBoundary.section44Complete===false,'contract overclaims Section 44 completion');
assert(schema.properties.version.const==='1.7.0-dev.37','schema version mismatch');
assert(schema.properties.v12SpecificationSections.const[0]===44,'schema plan binding mismatch');

const wardveil=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'security-protection',
  event:'protection-enabled',
  truthState:'confirmed',
  authoritySource:'wardveil-security',
  authorityAuthoritative:true
});
assert(wardveil.resolution.effectiveTruth==='confirmed','Wardveil confirmation lost');
assert(wardveil.resolution.truthBearingMotionAllowed===true,'authoritative Wardveil protection should permit truth-bearing motion');
assert(wardveil.authority.sourceAllowed===true&&wardveil.authority.providerPrecedenceInferred===false,'Wardveil authority resolution invalid');

const privacy=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'privacy-access',
  event:'privacy-access-revoked',
  truthState:'confirmed',
  authoritySource:'privacy-shield',
  authorityAuthoritative:true
});
assert(privacy.resolution.truthBearingMotionAllowed===true,'authoritative Privacy Shield revocation should permit truth-bearing motion');

const sync=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'synchronization',
  event:'synchronization-completed',
  truthState:'confirmed',
  authoritySource:'responsible-provider',
  responsibleProviderId:'example.sync.provider',
  authorityAuthoritative:true
});
assert(sync.resolution.truthBearingMotionAllowed===true,'authoritative responsible-provider synchronization completion should permit truth-bearing motion');
assert(sync.authority.responsibleProviderId==='example.sync.provider','responsible provider identity was not preserved');

const wrongOwner=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'security-protection',
  event:'protection-enabled',
  truthState:'confirmed',
  authoritySource:'privacy-shield',
  authorityAuthoritative:true
});
assert(wrongOwner.resolution.effectiveTruth==='unknown','mismatched authority owner must fail closed');
assert(wrongOwner.resolution.truthBearingMotionAllowed===false,'mismatched owner must not permit truth-bearing motion');
assert(wrongOwner.resolution.reason==='authority-source-not-valid-for-domain','mismatched-owner explanation missing');

const untrusted=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'operation-result',
  event:'operation-succeeded',
  truthState:'confirmed',
  authoritySource:'responsible-provider',
  responsibleProviderId:'example.operation.provider',
  authorityAuthoritative:false
});
assert(untrusted.resolution.effectiveTruth==='unknown','non-authoritative success must remain unknown');
assert(untrusted.resolution.truthBearingMotionAllowed===false,'non-authoritative success must not animate as success');

const unknown=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'recovery',
  event:'recovery-completed',
  truthState:'unknown',
  authoritySource:'everkeep',
  authorityAuthoritative:true
});
assert(unknown.resolution.effectiveTruth==='unknown'&&unknown.resolution.presentationDirective==='neutral-unknown','unknown recovery truth must stay neutral');

const refuted=resolveGlazePrivacyAuthorityBoundaryV12({
  truthDomain:'identity-authentication',
  event:'identity-authenticated',
  truthState:'refuted',
  authoritySource:'goreecloud-identity',
  authorityAuthoritative:true
});
assert(refuted.resolution.effectiveTruth==='refuted','authoritative refutation lost');
assert(refuted.resolution.truthBearingMotionAllowed===false,'refuted positive event must not replay positive motion');
assert(refuted.resolution.presentationDirective==='confirmed-negative-semantic-state','authoritative refutation should expose negative semantic state');

for(const bad of [
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({
    truthDomain:'privacy-access',event:'protection-enabled',truthState:'confirmed',
    authoritySource:'privacy-shield',authorityAuthoritative:true
  }),
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({
    truthDomain:'synchronization',event:'synchronization-completed',truthState:'confirmed',
    authoritySource:'responsible-provider',authorityAuthoritative:true
  }),
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({
    truthDomain:'security-protection',event:'protection-enabled',truthState:'confirmed',
    authoritySource:'wardveil-security',authorityAuthoritative:true,isProtected:true
  }),
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({
    truthDomain:'operation-result',event:'operation-succeeded',truthState:'confirmed',
    authoritySource:'responsible-provider',responsibleProviderId:'provider',authorityAuthoritative:true,success:true
  }),
  ()=>resolveGlazePrivacyAuthorityBoundaryV12({
    truthDomain:'privacy-access',event:'privacy-access-revoked',truthState:'confirmed',
    authoritySource:'privacy-shield',authorityAuthoritative:true,providerPrecedence:['privacy-shield']
  })
]){
  let failed=false;
  try{bad();}catch{failed=true;}
  assert(failed,'invalid/raw truth or authority input must fail closed');
}

assert(tokens.version==='1.7.0-dev.37'&&tokens.v12SpecificationSections[0]===44,'token identity mismatch');
assert(tokens.truth.motionCommunicatesTruth===true&&tokens.truth.motionCreatesTruth===false,'token truth rule weakened');
assert(tokens.authority.providerPrecedenceInferredByGlaze===false,'token provider precedence boundary weakened');
assert(tokens.acceptance.section44Complete===false,'token acceptance boundary weakened');

assert(glazeV17PrivacyAuthorityBoundariesDevelopmentContract.version==='1.7.0-dev.37','runtime contract identity mismatch');
assert(glazeV17PrivacyAuthorityBoundariesDevelopmentContract.motionCreatesTruth===false,'runtime truth boundary weakened');
assert(glazeV17PrivacyAuthorityBoundariesDevelopmentContract.rawTruthControlsAccepted===false,'runtime raw truth controls boundary weakened');
assert(glazeV17PrivacyAuthorityBoundariesDevelopmentContract.section44Complete===false,'runtime overclaims Section 44 completion');
assert(glazeV17VisualMotionDirectionDevelopmentContract.version==='1.7.0-dev.36','Section 43 dependency changed');
assert(PRIVACY_AUTHORITY_TRUTH_DOMAINS.length===6,'truth-domain count mismatch');
assert(PRIVACY_AUTHORITY_EVENTS.length===12,'truth-bearing event count mismatch');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=37,'aggregate version regressed below dev.37');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle boundary weakened');
assert(glazeV17Development.planV12FoundationSections.includes(44),'aggregate missing Section 44');
assert(glazeV17Development.privacyAuthorityBoundariesFoundation==='js/glaze-v1.7-privacy-authority-boundaries.dev.mjs','aggregate missing dev.37 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Experimental Glaze Motion');

assert(version==='1.6.0','VERSION must remain V1.6 Anchor');
assert(lifecycle.currentOfficial==='1.6.0'&&lifecycle.currentStable==='1.6.0'&&lifecycle.currentLifecycle==='anchor','lifecycle authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext===null,'V1.7 must not become lifecycle candidate by source implementation');

assert(planned.includes('1.7.0-dev.37')&&planned.includes('Privacy and Authority Boundaries'),'planned-feature control missing dev.37');
assert(implemented.includes('Privacy and Authority Boundaries')&&implemented.includes('1.7.0-dev.37'),'implemented-feature control missing dev.37');
assert(changelog.includes('1.7.0-dev.37')&&changelog.includes('Privacy and Authority Boundaries'),'changelog missing dev.37');
assert(plan.includes('dev.37')&&plan.includes('Section 44'),'planned upgrade authority boundary missing dev.37');

for(const phrase of [
  'androidx/androidx','23327507f7fc7d5b19d65fec4b090f60c970079b','Apache-2.0',
  'microsoft/fluentui','8add8c8750c34c85acd811e32ab324abf8f1562e','MIT',
  'adobe/react-spectrum','16eead67e83cf42f3c0ee46ef6eb7a2032778378',
  'No third-party source code'
])assert(research.includes(phrase),'research provenance missing: '+phrase);
assert(rootResearch.includes('## V1.7 dev.37 — Privacy and Authority Boundaries'),'root research register missing dev.37');

console.log('GLAZE UI V1.7 Privacy and Authority Boundaries Development validation: PASS');
console.log('Plan binding: v1.2 Section 44');
console.log('Truth domains: 6');
console.log('Truth-bearing events: 12');
console.log('Motion creates truth: false');
console.log('Provider precedence inferred: false');
console.log('Section 44 complete: false');
console.log('Official Anchor baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
