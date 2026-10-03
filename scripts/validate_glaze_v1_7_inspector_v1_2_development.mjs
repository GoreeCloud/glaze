#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  inspectGlazeElementV12,
  glazeV17InspectorV12DevelopmentContract
} from '../js/glaze-v1.7-inspector-v1-2.dev.mjs';
import {glazeV17InspectorDevelopmentContract} from '../js/glaze-v1.7-inspector.dev.mjs';
import {glazeV17ExpandedComponentSystemV12DevelopmentContract} from '../js/glaze-v1.7-expanded-component-system-v1-2.dev.mjs';
import {glazeV17ReducedMotionEquivalentsDevelopmentContract} from '../js/glaze-v1.7-reduced-motion-equivalents.dev.mjs';
import {glazeV17MotionFatigueProtectionDevelopmentContract} from '../js/glaze-v1.7-motion-fatigue-protection.dev.mjs';
import {glazeV17MotionPerformanceDevelopmentContract} from '../js/glaze-v1.7-motion-performance.dev.mjs';
import {glazeV17AdvancedThemeSystemV12DevelopmentContract} from '../js/glaze-v1.7-advanced-theme-system-v1-2.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/glaze-inspector-v1-2.dev.json');
const schema=json('schemas/v1.7-glaze-inspector-v1-2.schema.json');
const tokens=json('tokens/glaze-v1.7-inspector-v1-2.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('research/v1.7-glaze-inspector-v1-2.md');
const rootResearch=read('OPEN-SOURCE-RESEARCH.md');

const domains=[
  'current-motion-family','transition-source-destination','connected-identity-relationship',
  'duration-family','easing-family','motion-magnitude','motion-budget','reduced-motion-mapping',
  'theme-resolution','semantic-color-resolution','material-resolution','focus-state',
  'accessibility-overrides','motion-selection-explanation'
];

assert(read('VERSION').trim()==='1.7.0','dev.32 must coexist with bounded Glaze V1.7 / 1.7.0 Anchor');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.32 must not create release lifecycle state');

assert(spec.includes('## 39. Glaze Inspector'),'V1.7 plan missing Section 39');
for(const phrase of [
  'Current motion family','Transition source and destination','Connected-identity relationship',
  'Duration family','Easing family','Motion magnitude','Motion budget','Reduced Motion mapping',
  'Theme resolution','Semantic color resolution','Material resolution','Focus state','Accessibility overrides',
  'why a given animation was selected'
])assert(spec.includes(phrase),'Section 39 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.32'&&contract.planVersion==='v1.2','dev.32 contract identity mismatch');
assert(contract.lifecycle==='Development'&&contract.consumerEligible===false,'dev.32 lifecycle boundary weakened');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([39]),'Section 39 binding mismatch');
assert(contract.historicalFoundation.version==='1.7.0-dev.11','historical Inspector version changed');
assert(contract.historicalFoundation.planNumbering==='v1.1-historical-numbering','historical Inspector plan provenance missing');
assert(contract.historicalFoundation.reinterpretedAsV12Section39===false,'historical dev.11 must not be relabeled as Section 39');
assert(JSON.stringify(contract.inspectionDomains)===JSON.stringify(domains),'Section 39 inspection domain set mismatch');
assert(JSON.stringify(contract.semanticTiming.durationFamilies)===JSON.stringify(['instant','micro','short','medium','long','ambient']),'duration-family vocabulary mismatch');
assert(JSON.stringify(contract.semanticTiming.easingFamilies)===JSON.stringify(['standard','enter','exit','emphasized','linear']),'easing-family vocabulary mismatch');
assert(contract.semanticTiming.rawDurationAccepted===false&&contract.semanticTiming.rawEasingCurveAccepted===false,'raw timing controls must remain rejected');
assert(contract.semanticTiming.inspectorSelectsTiming===false,'Inspector must not become timing authority');
assert(contract.motionBudget.callerMayRaiseLimits===false&&contract.motionBudget.callerMayOverrideBudget===false,'motion-budget authority weakened');
assert(contract.motionBudget.acceptanceMayBeInferred===false,'motion budget may not manufacture performance acceptance');
assert(contract.explainability.sourceMutationAllowed===false&&contract.explainability.missingEvidenceMayInferPass===false,'Inspector explainability boundary weakened');
assert(contract.authority.advisoryOnly===true&&contract.authority.animationExecutedByInspector===false,'Inspector execution boundary weakened');
assert(contract.authority.motionFamilyCreatedByInspector===false&&contract.authority.timingAuthorityCreatedByInspector===false,'Inspector motion authority boundary weakened');
assert(contract.authority.acceptanceGrantedByInspector===false,'Inspector may not grant acceptance');
assert(contract.privacy.privateContentRequired===false&&contract.privacy.telemetryRequired===false&&contract.privacy.networkRequired===false,'Inspector privacy boundary weakened');
assert(contract.acceptanceBoundary.section39Complete===false,'dev.32 must not claim Section 39 complete');

assert(glazeV17InspectorDevelopmentContract.version==='1.7.0-dev.11','historical Inspector runtime changed');
assert(glazeV17InspectorDevelopmentContract.planVersion==='v1.1','historical Inspector plan version changed');
assert(JSON.stringify(glazeV17InspectorDevelopmentContract.v11SpecificationSections)===JSON.stringify([26]),'historical Inspector Section 26 provenance changed');
assert(glazeV17ExpandedComponentSystemV12DevelopmentContract.version==='1.7.0-dev.30','dev.30 component dependency changed');
assert(glazeV17ReducedMotionEquivalentsDevelopmentContract.version==='1.7.0-dev.23','dev.23 Reduced Motion dependency changed');
assert(glazeV17MotionFatigueProtectionDevelopmentContract.version==='1.7.0-dev.24','dev.24 budget dependency changed');
assert(glazeV17MotionPerformanceDevelopmentContract.version==='1.7.0-dev.25','dev.25 performance dependency changed');
assert(glazeV17AdvancedThemeSystemV12DevelopmentContract.version==='1.7.0-dev.31','dev.31 theme dependency changed');

const base={
  component:'GlzThemePreview',
  profile:'mobile',
  semanticColorRole:'warning',
  semanticProminence:'prominent',
  semanticColorAuthoritative:true,
  protectedSemanticThemeToken:'semantic.warning.prominent',
  protectedSemanticThemeAuthoritative:true,
  userThemeToken:'theme.user.custom',
  userThemeAuthoritative:true,
  glazeDefaultThemeToken:'glaze.default',
  tokenProvenance:[
    {token:'semantic.warning.prominent',source:'semantic-state',authoritative:true},
    {token:'theme.user.custom',source:'user-theme',authoritative:true}
  ],
  previousTaskState:{navigationDestination:'settings',focusId:'theme-preview',draftText:'draft'},
  focusId:'theme-preview',
  focusAuthoritative:true,
  materialHierarchy:['canvas','surface','glaze'],
  materialHierarchyAuthoritative:true,
  accessibilityOverrides:[],
  accessibilityOverridesAuthoritative:true,
  transitionRelationship:'same-object-expansion',
  transitionAuthoritative:true,
  connectedIdentity:'theme-preview:owner',
  connectedIdentityAuthoritative:true,
  transitionSource:'theme-card',
  transitionDestination:'theme-preview',
  transitionEndpointsAuthoritative:true,
  durationFamily:'medium',
  durationFamilyAuthoritative:true,
  easingFamily:'emphasized',
  easingFamilyAuthoritative:true,
  motionMagnitude:'standard',
  motionMagnitudeAuthoritative:true,
  advancedTheme:{action:'preview',appearanceMode:'dark',themeId:'glaze-default',scopeKind:'session-preview'}
};

const inspected=inspectGlazeElementV12(base);
assert(inspected.version==='1.7.0-dev.32'&&inspected.v12SpecificationSections[0]===39,'runtime Section 39 identity mismatch');
assert(inspected.historicalFoundation.reinterpretedAsV12Section39===false,'runtime relabeled historical Inspector');
assert(inspected.currentMotionFamily.family==='Glaze Bloom','same-object expansion should resolve to Glaze Bloom');
assert(inspected.currentMotionFamily.relationshipAccepted===true,'authoritative same-object relationship should be accepted');
assert(inspected.transitionEndpoints.accepted===true&&inspected.transitionEndpoints.acceptedSource==='theme-card','authoritative transition endpoints lost');
assert(inspected.connectedIdentity.required===true&&inspected.connectedIdentity.satisfied===true,'connected identity requirement not explained');
assert(inspected.semanticTiming.durationFamily.accepted==='medium','authoritative semantic duration family lost');
assert(inspected.semanticTiming.easingFamily.accepted==='emphasized','authoritative semantic easing family lost');
assert(inspected.semanticTiming.rawDurationAccepted===false&&inspected.semanticTiming.inspectorSelectsTiming===false,'Inspector raw timing boundary weakened');
assert(inspected.motionMagnitude.accepted==='standard'&&inspected.motionMagnitude.compliance==='within-governed-ceiling','motion magnitude diagnostic mismatch');
assert(inspected.motionBudget.callerMayOverrideBudget===false&&inspected.motionBudget.acceptanceInferred===false,'motion budget diagnostic authority weakened');
assert(inspected.reducedMotionMapping.family==='Glaze Bloom','Reduced Motion mapping should retain semantic family identity');
assert(inspected.themeResolution.advancedTheme.appearance.effective==='dark','dev.31 theme resolution not exposed');
assert(inspected.semanticColorResolution.themeLayer==='protected-semantic-state','semantic color resolution provenance lost');
assert(Array.isArray(inspected.materialResolution.hierarchy.accepted)&&inspected.materialResolution.hierarchy.accepted.length===3,'material resolution lost');
assert(inspected.focusState.accepted==='theme-preview','focus state lost');
assert(inspected.selectionExplanation.decisions.some(entry=>entry.code==='signature-family-selected'&&entry.applied===true),'selection explanation missing family decision');
assert(inspected.authority.sourceModifiedAutomatically===false&&inspected.authority.animationExecutedByInspector===false,'Inspector must remain advisory-only');
assert(inspected.acceptanceBoundary.section39Complete===false,'runtime overclaims Section 39 completion');

const noIdentity=inspectGlazeElementV12({...base,connectedIdentity:undefined,connectedIdentityAuthoritative:false});
assert(noIdentity.connectedIdentity.required===true&&noIdentity.connectedIdentity.satisfied===false,'missing identity must remain visible');
assert(noIdentity.currentMotionFamily.relationshipAccepted===false,'identity-dependent relationship must fail closed without identity');
assert(noIdentity.currentMotionFamily.family==='Standard transition','missing identity must use state-first standard fallback');
assert(noIdentity.selectionExplanation.decisions.some(entry=>entry.code==='connected-identity-requirement'&&entry.applied===true&&entry.detail.includes('missing or untrusted')),'missing identity explanation absent');

const untrustedTiming=inspectGlazeElementV12({...base,durationFamilyAuthoritative:false,easingFamilyAuthoritative:false,motionMagnitudeAuthoritative:false});
assert(untrustedTiming.semanticTiming.durationFamily.accepted==='unknown','untrusted duration family must remain unknown');
assert(untrustedTiming.semanticTiming.easingFamily.accepted==='unknown','untrusted easing family must remain unknown');
assert(untrustedTiming.motionMagnitude.accepted==='unknown'&&untrustedTiming.motionMagnitude.compliance==='unverified','untrusted magnitude must remain unverified');

const reduced=inspectGlazeElementV12({...base,accessibilityProfiles:['reduced-motion'],accessibilityOverrides:['reduced-motion']});
assert(reduced.reducedMotionMapping.reducedMotionApplied===true,'Reduced Motion application missing');
assert(reduced.performance.mode==='reduced-motion','Reduced Motion must govern performance presentation');
assert(reduced.motionMagnitude.governedMaximum==='minimal','Reduced Motion magnitude ceiling must be minimal');
assert(reduced.reducedMotionMapping.motionRequiredToUnderstandState===false,'Reduced Motion mapping may not be required for understanding state');

const pressured=inspectGlazeElementV12({
  ...base,
  activeMotion:{simultaneousTransitions:7},
  motionMagnitude:'emphasized',
  motionMagnitudeAuthoritative:true
});
assert(pressured.motionBudget.exhausted===true&&pressured.motionBudget.exceededDimensions.includes('simultaneousTransitions'),'motion budget pressure not exposed');
assert(pressured.performance.mode==='restrained','single governed budget pressure should restrain optional motion');
assert(pressured.motionMagnitude.governedMaximum==='restrained'&&pressured.motionMagnitude.compliance==='exceeds-governed-ceiling','magnitude ceiling diagnostic failed');
assert(pressured.selectionExplanation.decisions.some(entry=>entry.code==='motion-budget-pressure'&&entry.applied===true),'budget selection explanation missing');

let rawRejected=false;
try{inspectGlazeElementV12({...base,durationMs:240});}catch(error){rawRejected=error instanceof RangeError;}
assert(rawRejected,'raw duration must be rejected');
let rawPerfRejected=false;
try{inspectGlazeElementV12({...base,performanceMeasurements:{fps:60}});}catch(error){rawPerfRejected=error instanceof RangeError;}
assert(rawPerfRejected,'raw performance measurements must be rejected');
let invalidFamilyRejected=false;
try{inspectGlazeElementV12({...base,durationFamily:'custom'});}catch(error){invalidFamilyRejected=error instanceof RangeError;}
assert(invalidFamilyRejected,'unsupported semantic duration family must fail closed');

assert(tokens.version==='1.7.0-dev.32'&&tokens.v12SpecificationSections[0]===39,'token identity mismatch');
assert(JSON.stringify(tokens.inspectionDomains)===JSON.stringify(domains),'token inspection domains mismatch');
assert(tokens.boundaries.rawAnimationValuesAccepted===false&&tokens.boundaries.section39Complete===false,'token boundaries weakened');

assert(glazeV17InspectorV12DevelopmentContract.version==='1.7.0-dev.32','runtime contract identity mismatch');
assert(glazeV17InspectorV12DevelopmentContract.historicalFoundationReinterpreted===false,'runtime contract relabeled dev.11');
assert(glazeV17InspectorV12DevelopmentContract.rawAnimationValuesAccepted===false,'runtime contract raw animation boundary weakened');
assert(glazeV17InspectorV12DevelopmentContract.section39Complete===false,'runtime contract completion overclaimed');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=32,'aggregate version regressed below dev.32');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle boundary weakened');
assert(glazeV17Development.planV12FoundationSections.includes(39),'aggregate missing Section 39');
assert(glazeV17Development.inspectorV12Foundation==='js/glaze-v1.7-inspector-v1-2.dev.mjs','aggregate missing dev.32 Inspector foundation');
assert(glazeV17Development.inspectorHistoricalFoundationReinterpretedAsV12===false,'aggregate relabeled historical Inspector');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Experimental Glaze Motion');

assert(planned.includes('FR-018')&&planned.includes('Glaze Inspector/Studio'),'planned-feature scope lost Glaze Inspector');
assert(implemented.includes('Glaze Inspector v1.2 — `1.7.0-dev.32`'),'implemented-feature control missing dev.32');
assert(changelog.includes('1.7.0-dev.32')&&changelog.includes('Glaze Inspector v1.2'),'changelog missing dev.32');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

for(const phrase of [
  'ChromeDevTools/devtools-frontend','83c5c56d700f2065d9a0fb530ccc383f49ee6ae2','BSD-3-Clause',
  'storybookjs/storybook','5efca7a6ab523726d4a0f2fbea00bbf5b66c3fe1','MIT',
  'reduxjs/redux-devtools','89ae6ee57c6879c0da39d1f03d6ad8de029c5390',
  'No third-party source code'
])assert(research.includes(phrase),'research provenance missing: '+phrase);
assert(rootResearch.includes('## V1.7 dev.32 — Glaze Inspector v1.2'),'root research register missing dev.32');

console.log('GLAZE UI V1.7 Glaze Inspector v1.2 Development validation: PASS');
console.log('Plan binding: v1.2 Section 39');
console.log('Historical dev.11 / v1.1 Section 26 provenance preserved: true');
console.log('Raw animation/performance values accepted: false');
console.log('Source mutation allowed: false');
console.log('Section 39 complete: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
