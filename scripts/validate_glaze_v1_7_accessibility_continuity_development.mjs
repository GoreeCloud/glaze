#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeAccessibilityContinuity,
  ACCESSIBILITY_CONTINUITY_CHANGES,
  glazeV17AccessibilityContinuityDevelopmentContract
} from '../js/glaze-v1.7-accessibility-continuity.dev.mjs';
import {glazeV17TaskContinuityDevelopmentContract} from '../js/glaze-v1.7-task-continuity.dev.mjs';
import {glazeV17AdaptiveInputDevelopmentContract} from '../js/glaze-v1.7-adaptive-input.dev.mjs';
import {glazeV16StateAccessibilityDevelopmentContract} from '../js/glaze-v1.6-state-accessibility.dev.mjs';
import {glazeV16FocusMotionDevelopmentContract} from '../js/glaze-v1.6-focus-motion.dev.mjs';
import {glazeV17MotionExpressionProfilesDevelopmentContract} from '../js/glaze-v1.7-motion-expression-profiles.dev.mjs';
import {glazeV17ReducedMotionEquivalentsDevelopmentContract} from '../js/glaze-v1.7-reduced-motion-equivalents.dev.mjs';
import {glazeV17AdvancedThemeSystemV12DevelopmentContract} from '../js/glaze-v1.7-advanced-theme-system-v1-2.dev.mjs';
import {glazeV17StudioV12DevelopmentContract} from '../js/glaze-v1.7-studio-v1-2.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/accessibility-continuity.dev.json');
const schema=json('schemas/v1.7-accessibility-continuity.schema.json');
const tokens=json('tokens/glaze-v1.7-accessibility-continuity.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('research/v1.7-accessibility-continuity.md');
const rootResearch=read('OPEN-SOURCE-RESEARCH.md');

const modes=[
  'large-text','reduced-motion','reduced-transparency','increased-contrast','forced-colors',
  'screen-reader','switch-access','voice-access','touch-assistance','keyboard-navigation'
];

assert(read('VERSION').trim()==='1.7.0','dev.34 must coexist with bounded Glaze V1.7 / 1.7.0 Anchor');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.34 must not create release lifecycle state');

assert(spec.includes('## 41. Accessibility Continuity'),'V1.7 v1.2 plan missing Section 41');
for(const phrase of [
  'Large text','Reduced Motion','Reduced Transparency','Increased Contrast','Forced Colors',
  'Screen readers','Switch access','Voice access','Touch Assistance','Keyboard navigation',
  'must preserve the current task wherever technically possible',
  'Accessibility always outranks motion richness'
])assert(spec.includes(phrase),'Section 41 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.34'&&contract.planVersion==='v1.2','dev.34 contract identity mismatch');
assert(contract.lifecycle==='Development'&&contract.consumerEligible===false,'dev.34 lifecycle boundary weakened');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([41]),'Section 41 binding mismatch');
assert(JSON.stringify(contract.accessibilityChanges)===JSON.stringify(modes),'Section 41 accessibility-change catalog mismatch');
assert(contract.continuityRequirements.preserveCurrentTaskWhereTechnicallyPossible===true,'task-preservation requirement lost');
assert(contract.continuityRequirements.accessibilityOutranksMotionRichness===true,'accessibility precedence lost');
assert(contract.presentationRequirements.largeTextReflowRequired===true,'large-text reflow requirement lost');
assert(contract.presentationRequirements.reducedMotionEquivalentRequired===true,'Reduced Motion equivalent requirement lost');
assert(contract.presentationRequirements.reducedTransparencySolidEquivalentRequired===true,'Reduced Transparency fallback requirement lost');
assert(contract.presentationRequirements.forcedColorsAuthorityPreserved===true,'Forced Colors authority requirement lost');
assert(contract.presentationRequirements.screenReaderSemanticsPreserved===true,'screen-reader semantic requirement lost');
assert(contract.authority.accessibilityStateCreatedByGlaze===false&&contract.authority.preferencePersistedByGlaze===false,'accessibility authority boundary weakened');
assert(contract.authority.navigationExecutedByGlaze===false&&contract.authority.acceptanceGrantedByGlaze===false,'execution/acceptance boundary weakened');
assert(contract.acceptanceBoundary.section41Complete===false,'dev.34 must not claim Section 41 complete');

assert(glazeV17TaskContinuityDevelopmentContract.version==='1.7.0-dev.1','Task Continuity dependency changed');
assert(glazeV17AdaptiveInputDevelopmentContract.version==='1.7.0-dev.2','Adaptive Input dependency changed');
assert(glazeV16StateAccessibilityDevelopmentContract.version==='1.6.0-dev.2','historical state/accessibility dependency changed');
assert(glazeV16FocusMotionDevelopmentContract.version==='1.6.0-dev.3','historical focus/motion dependency changed');
assert(glazeV17MotionExpressionProfilesDevelopmentContract.version==='1.7.0-dev.21','Motion Expression dependency changed');
assert(glazeV17ReducedMotionEquivalentsDevelopmentContract.version==='1.7.0-dev.23','Reduced Motion dependency changed');
assert(glazeV17AdvancedThemeSystemV12DevelopmentContract.version==='1.7.0-dev.31','Advanced Theme dependency changed');
assert(glazeV17StudioV12DevelopmentContract.version==='1.7.0-dev.33','Glaze Studio dependency changed');

const previousTaskState={
  navigationDestination:'settings/accessibility',
  focusId:'motion-toggle',
  selectionIds:['reduced-motion'],
  scrollPositionKey:'accessibility:motion',
  expandedRegionIds:['motion'],
  draftText:'preserve this draft',
  formState:{search:'accessibility'},
  activeFilters:['system'],
  query:'motion',
  paneState:{detail:'motion'},
  workingContext:{workspace:'settings'}
};

const result=resolveGlazeAccessibilityContinuity({
  accessibilityChanges:modes,
  accessibilityStateAuthoritative:true,
  previousTaskState,
  profile:'tablet',
  profileAuthoritative:true,
  semanticSurfaceId:'accessibility-settings',
  surfaceRole:'task',
  motionIntensity:'expressive',
  motionIntensityAuthoritative:true,
  currentFocusUnavailable:true,
  currentFocusAvailabilityAuthoritative:true,
  fallbackFocusId:'accessibility-heading',
  fallbackFocusAuthoritative:true,
  focusStateAuthoritative:true,
  focused:true,
  fromInputModel:'touch',
  toInputModel:'switch-access',
  inputModelChangeAuthoritative:true
});

assert(result.version==='1.7.0-dev.34'&&result.v12SpecificationSections[0]===41,'runtime Section 41 identity mismatch');
assert(JSON.stringify(result.accessibility.acceptedModes)===JSON.stringify(modes),'authoritative accessibility modes not accepted');
assert(result.accessibility.accessibilityOutranksMotionRichness===true,'runtime accessibility precedence lost');
assert(result.task.state.navigationDestination==='settings/accessibility','navigation task state lost');
assert(result.task.state.focusId==='motion-toggle','existing focus identity lost from task continuity');
assert(result.task.state.draftText==='preserve this draft','draft continuity lost');
assert(result.task.continuity.taskResetAllowed===false&&result.task.continuity.focusResetAllowed===false,'task/focus reset boundary weakened');
assert(result.composition.accepted===true&&result.composition.resolution.presentation==='full-screen-step','large-text constrained adaptive recomposition missing');
assert(result.composition.resolution.preservation.focusPreserved===true&&result.composition.resolution.preservation.draftStatePreserved===true,'adaptive composition continuity weakened');

assert(result.presentation.largeText.active===true&&result.presentation.largeText.twoHundredPercentTextSupportRequired===true,'large-text source requirement missing');
assert(result.presentation.reducedMotion.active===true&&result.presentation.reducedMotion.motionRequiredToUnderstandState===false,'Reduced Motion source requirement missing');
assert(result.presentation.reducedTransparency.solidOrOpaqueEquivalentRequired===true,'Reduced Transparency fallback missing');
assert(result.presentation.increasedContrast.higherContrastVariantRequired===true,'Increased Contrast requirement missing');
assert(result.presentation.forcedColors.platformPaletteAuthorityPreserved===true&&result.presentation.forcedColors.colorOnlyMeaningAllowed===false,'Forced Colors boundary weakened');
assert(result.presentation.screenReader.semanticStructurePreserved===true&&result.presentation.screenReader.predictableReadingOrderRequired===true,'screen-reader semantics continuity missing');
assert(result.presentation.switchAccess.alternativeInteractionRequired===true,'switch-access alternative requirement missing');
assert(result.presentation.voiceAccess.semanticAddressabilityRequired===true,'voice-access semantic addressability missing');
assert(result.presentation.touchAssistance.targetProtectionRequired===true,'Touch Assistance target protection missing');
assert(result.presentation.keyboardNavigation.visibleFocusRequired===true&&result.presentation.keyboardNavigation.focusDistinctFromSelectionRequired===true,'keyboard focus continuity missing');

assert(JSON.stringify(result.input.expectedModels)===JSON.stringify(['assistive-input','switch-access','voice-access','touch','keyboard']),'assistive input expectations mismatch');
assert(result.input.expectationCreatesInputModelTruth===false,'input expectations must not manufacture input truth');
assert(result.input.transition.accepted===true,'authoritative input transition rejected');
assert(result.input.transition.transition.taskState.draftText==='preserve this draft','input transition lost task state');
assert(result.input.transition.transition.continuity.focusResetAllowed===false,'input transition focus continuity weakened');

assert(result.focus.fallbackFocusId==='accessibility-heading'&&result.focus.fallbackProposalAuthoritative===true,'authoritative logical focus fallback proposal lost');
assert(result.focus.presentation.continuity.restoration.suggestedAction==='restore-authoritative-target','focus restoration proposal mismatch');
assert(result.focus.focusExecutionPerformedByGlaze===false,'Glaze must not execute focus');
assert(result.motion.resolution.expression.selectedProfile==='expressive','selected motion preference must remain visible');
assert(result.motion.resolution.expression.effectiveProfile==='calm','Reduced Motion must outrank Expressive richness');
assert(result.motion.resolution.accessibility.reducedMotionApplied===true,'Reduced Motion precedence missing');
assert(result.motion.selectedPreferenceRewritten===false,'accessibility must not rewrite durable motion preference');
assert(result.acceptanceBoundary.section41Complete===false&&result.acceptanceBoundary.assistiveTechnologyAcceptanceEstablished===false,'runtime overclaims Section 41 acceptance');

const untrusted=resolveGlazeAccessibilityContinuity({
  accessibilityChanges:['forced-colors','screen-reader','reduced-motion'],
  accessibilityStateAuthoritative:false,
  previousTaskState
});
assert(untrusted.accessibility.acceptedModes.length===0,'untrusted accessibility modes must fail closed');
assert(untrusted.accessibility.requestedStateWithheldWithoutAuthority===true,'untrusted accessibility state must be marked withheld');
assert(untrusted.task.state.navigationDestination==='settings/accessibility','fail-closed accessibility request must still preserve current task');
assert(untrusted.motion.resolution.accessibility.reducedMotionApplied===false,'untrusted Reduced Motion must not be treated as platform/user truth');

const untrustedInput=resolveGlazeAccessibilityContinuity({
  accessibilityChanges:['switch-access'],
  accessibilityStateAuthoritative:true,
  previousTaskState,
  fromInputModel:'touch',
  toInputModel:'switch-access',
  inputModelChangeAuthoritative:false
});
assert(untrustedInput.input.transition.requested===true&&untrustedInput.input.transition.accepted===false,'untrusted input-model change must fail closed');
assert(untrustedInput.input.transition.transition===null,'untrusted input-model change must not manufacture transition truth');

for(const bad of [
  ()=>resolveGlazeAccessibilityContinuity({accessibilityChanges:['invented'],accessibilityStateAuthoritative:true}),
  ()=>resolveGlazeAccessibilityContinuity({accessibilityChanges:['large-text'],accessibilityStateAuthoritative:true,textScalePercent:200}),
  ()=>resolveGlazeAccessibilityContinuity({accessibilityChanges:['screen-reader'],accessibilityStateAuthoritative:true,assistiveTechnologyEvidence:{pass:true}}),
  ()=>resolveGlazeAccessibilityContinuity({accessibilityChanges:['switch-access'],accessibilityStateAuthoritative:true,fromInputModel:'touch'})
]){
  let failed=false;try{bad();}catch{failed=true;}assert(failed,'unsupported/raw/evidence accessibility input must fail closed');
}

assert(tokens.version==='1.7.0-dev.34'&&tokens.v12SpecificationSections[0]===41,'token identity mismatch');
assert(JSON.stringify(tokens.accessibilityChanges)===JSON.stringify(modes),'token accessibility catalog mismatch');
assert(tokens.continuity.taskResetAllowed===false&&tokens.continuity.accessibilityOutranksMotionRichness===true,'token continuity boundary weakened');
assert(tokens.presentation.colorOnlyMeaningAllowed===false&&tokens.presentation.forcedColorsAuthorityPreserved===true,'token accessibility presentation boundary weakened');
assert(tokens.presentation.switchAccessSemanticAlternativesRequired===true&&tokens.presentation.voiceAccessSemanticAddressabilityRequired===true,'token assistive-input semantics missing');
assert(tokens.authority.accessibilityStateCreatedByGlaze===false&&tokens.authority.preferencePersistedByGlaze===false,'token authority boundary weakened');
assert(tokens.authority.inputModelCreatedByGlaze===false&&tokens.authority.focusExecutedByGlaze===false,'token input/focus authority boundary weakened');
assert(tokens.acceptance.section41Complete===false,'token completion overclaimed');

assert(glazeV17AccessibilityContinuityDevelopmentContract.version==='1.7.0-dev.34','runtime contract identity mismatch');
assert(JSON.stringify(glazeV17AccessibilityContinuityDevelopmentContract.accessibilityChanges)===JSON.stringify(ACCESSIBILITY_CONTINUITY_CHANGES),'runtime contract accessibility catalog mismatch');
assert(glazeV17AccessibilityContinuityDevelopmentContract.accessibilityOutranksMotionRichness===true,'runtime contract precedence mismatch');
assert(glazeV17AccessibilityContinuityDevelopmentContract.rawPresentationValuesAccepted===false&&glazeV17AccessibilityContinuityDevelopmentContract.rawAcceptanceEvidenceAccepted===false,'runtime raw-input boundary weakened');
assert(glazeV17AccessibilityContinuityDevelopmentContract.section41Complete===false,'runtime contract completion overclaimed');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=34,'aggregate version regressed below dev.34');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle boundary weakened');
assert(glazeV17Development.planV12FoundationSections.includes(41),'aggregate missing Section 41');
assert(glazeV17Development.accessibilityContinuityFoundation==='js/glaze-v1.7-accessibility-continuity.dev.mjs','aggregate missing dev.34 Accessibility Continuity foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Experimental Glaze Motion');

assert(planned.includes('1.7.0-dev.34')&&planned.includes('Accessibility Continuity'),'planned-feature control missing dev.34');
assert(implemented.includes('Accessibility Continuity — `1.7.0-dev.34`'),'implemented-feature control missing dev.34');
assert(changelog.includes('1.7.0-dev.34')&&changelog.includes('Accessibility Continuity'),'changelog missing dev.34');

for(const phrase of [
  'w3c/aria-practices','3f094fde1c81b25dfa69162563bf28d093f854d4','W3C Software and Document License',
  'adobe/react-spectrum','16eead67e83cf42f3c0ee46ef6eb7a2032778378','Apache-2.0',
  'androidx/androidx','23327507f7fc7d5b19d65fec4b090f60c970079b',
  'No third-party source code'
])assert(research.includes(phrase),'research provenance missing: '+phrase);
assert(rootResearch.includes('## V1.7 dev.34 — Accessibility Continuity'),'root research register missing dev.34');

console.log('GLAZE UI V1.7 Accessibility Continuity Development validation: PASS');
console.log('Plan binding: v1.2 Section 41');
console.log('Accessibility changes: 10');
console.log('Accessibility outranks motion richness: true');
console.log('Task/focus/draft reset allowed: false');
console.log('Raw presentation/evidence values accepted: false');
console.log('Section 41 complete: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
