#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  createGlazeStudioSessionV12,
  createGlazeStudioPreviewV12,
  compareGlazeStudioPreviewsV12,
  compareGlazeStudioMotionModesV12,
  glazeV17StudioV12DevelopmentContract
} from '../js/glaze-v1.7-studio-v1-2.dev.mjs';
import {glazeV17StudioDevelopmentContract} from '../js/glaze-v1.7-studio.dev.mjs';
import {glazeV17InspectorV12DevelopmentContract} from '../js/glaze-v1.7-inspector-v1-2.dev.mjs';
import {glazeV17MotionExpressionProfilesDevelopmentContract} from '../js/glaze-v1.7-motion-expression-profiles.dev.mjs';
import {glazeV17ReducedMotionEquivalentsDevelopmentContract} from '../js/glaze-v1.7-reduced-motion-equivalents.dev.mjs';
import {glazeV17MotionPerformanceDevelopmentContract} from '../js/glaze-v1.7-motion-performance.dev.mjs';
import {glazeV17ExpandedComponentSystemV12DevelopmentContract} from '../js/glaze-v1.7-expanded-component-system-v1-2.dev.mjs';
import {glazeV17AdvancedThemeSystemV12DevelopmentContract} from '../js/glaze-v1.7-advanced-theme-system-v1-2.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/glaze-studio-v1-2.dev.json');
const schema=json('schemas/v1.7-glaze-studio-v1-2.schema.json');
const tokens=json('tokens/glaze-v1.7-studio-v1-2.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('research/v1.7-glaze-studio-v1-2.md');
const rootResearch=read('OPEN-SOURCE-RESEARCH.md');

const previewDomains=[
  'signature-transitions','motion-profiles','components','adaptive-layout-changes',
  'form-factor-transitions','themes','color-palettes','accessibility-modes',
  'reduced-motion','input-models','semantic-states'
];
const comparisonModes=['calm','balanced','expressive','reduced-motion'];

assert(read('VERSION').trim()==='1.7.0','dev.33 must coexist with bounded Glaze V1.7 / 1.7.0 Anchor');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.33 must not create release lifecycle state');

assert(spec.includes('## 40. Glaze Studio'),'V1.7 plan missing Section 40');
for(const phrase of [
  'Signature transitions','Motion profiles','Components','Adaptive layout changes','Form-factor transitions',
  'Themes','Color palettes','Accessibility modes','Reduced Motion','Input models','Semantic states',
  'compare Calm, Balanced, Expressive, and Reduced Motion behavior side by side'
])assert(spec.includes(phrase),'Section 40 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.33'&&contract.planVersion==='v1.2','dev.33 contract identity mismatch');
assert(contract.lifecycle==='Development'&&contract.consumerEligible===false,'dev.33 lifecycle boundary weakened');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([40]),'Section 40 binding mismatch');
assert(contract.historicalFoundation.version==='1.7.0-dev.12','historical Studio version changed');
assert(contract.historicalFoundation.planNumbering==='v1.1-historical-numbering','historical Studio plan provenance missing');
assert(contract.historicalFoundation.reinterpretedAsV12Section40===false,'historical dev.12 must not be relabeled as Section 40');
assert(JSON.stringify(contract.previewDomains)===JSON.stringify(previewDomains),'Section 40 preview domain set mismatch');
assert(JSON.stringify(contract.comparisonModes)===JSON.stringify(comparisonModes),'Section 40 comparison mode set mismatch');
assert(contract.studioCapabilities.sideBySideMotionComparison===true,'side-by-side Studio comparison missing');
assert(contract.studioCapabilities.sourceMutationAllowed===false&&contract.studioCapabilities.animationExecutionAllowed===false,'Studio execution boundary weakened');
assert(contract.studioCapabilities.themePersistenceAutomatic===false&&contract.studioCapabilities.rankingOrWinnerSelectionAllowed===false,'Studio persistence/ranking boundary weakened');
assert(contract.authority.advisoryOnly===true&&contract.authority.acceptanceGrantedByStudio===false,'Studio authority boundary weakened');
assert(contract.privacy.localFirst===true&&contract.privacy.telemetryRequired===false&&contract.privacy.networkRequired===false,'Studio privacy boundary weakened');
assert(contract.acceptanceBoundary.section40Complete===false,'dev.33 must not claim Section 40 complete');

assert(glazeV17StudioDevelopmentContract.version==='1.7.0-dev.12','historical Studio runtime changed');
assert(glazeV17StudioDevelopmentContract.planVersion==='v1.1','historical Studio plan version changed');
assert(JSON.stringify(glazeV17StudioDevelopmentContract.v11SpecificationSections)===JSON.stringify([27]),'historical Studio Section 27 provenance changed');
assert(glazeV17MotionExpressionProfilesDevelopmentContract.version==='1.7.0-dev.21','dev.21 motion profile dependency changed');
assert(glazeV17ReducedMotionEquivalentsDevelopmentContract.version==='1.7.0-dev.23','dev.23 Reduced Motion dependency changed');
assert(glazeV17MotionPerformanceDevelopmentContract.version==='1.7.0-dev.25','dev.25 performance dependency changed');
assert(glazeV17ExpandedComponentSystemV12DevelopmentContract.version==='1.7.0-dev.30','dev.30 component dependency changed');
assert(glazeV17AdvancedThemeSystemV12DevelopmentContract.version==='1.7.0-dev.31','dev.31 theme dependency changed');
assert(glazeV17InspectorV12DevelopmentContract.version==='1.7.0-dev.32','dev.32 Inspector dependency changed');

const session=createGlazeStudioSessionV12({role:'designer',sessionId:'section-40-review'});
assert(session.version==='1.7.0-dev.33'&&session.v12SpecificationSections[0]===40,'Studio session Section 40 identity mismatch');
assert(session.historicalFoundation.reinterpretedAsV12Section40===false,'Studio session relabeled historical dev.12');
assert(JSON.stringify(session.comparisonModes)===JSON.stringify(comparisonModes),'Studio session comparison modes mismatch');
assert(session.localOnly===true&&session.animationExecutionAutomatic===false&&session.acceptanceGrantedByStudio===false,'Studio session authority boundary weakened');

const base={
  component:'GlzThemePreview',
  profile:'mobile',
  previewKind:'signature-transition',
  sourceStateAuthoritative:false,
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
  inputMapping:'keyboard-and-pointer',
  inputMappingAuthoritative:true,
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
  semanticStateAuthoritative:true,
  durationFamily:'medium',
  durationFamilyAuthoritative:true,
  easingFamily:'emphasized',
  easingFamilyAuthoritative:true,
  motionMagnitude:'standard',
  motionMagnitudeAuthoritative:true,
  advancedTheme:{action:'preview',appearanceMode:'dark',themeId:'glaze-default',scopeKind:'session-preview'}
};

const preview=createGlazeStudioPreviewV12(base);
assert(preview.version==='1.7.0-dev.33'&&preview.scenario.previewKind==='signature-transition','Studio preview identity mismatch');
assert(preview.scenario.simulation===true&&preview.scenario.providerTruthCreatedByStudio===false,'Studio simulation must not become provider truth');
assert(preview.preview.currentMotionFamily.family==='Glaze Bloom','Studio must expose current governed signature family');
assert(preview.preview.transitionEndpoints.accepted===true,'Studio transition endpoints lost');
assert(preview.preview.connectedIdentity.satisfied===true,'Studio connected identity explanation lost');
assert(preview.preview.themeResolution.advancedTheme.appearance.effective==='dark','Studio advanced theme preview lost');
assert(preview.preview.formFactor.profile==='mobile','Studio form-factor preview lost');
assert(preview.preview.inputModel.accepted==='keyboard-and-pointer','Studio input-model preview lost');
assert(preview.evidenceBoundary.renderedEvidenceClaimed===false&&preview.evidenceBoundary.humanReviewClaimed===false,'Studio preview overclaims acceptance evidence');
assert(preview.authority.animationExecutedByStudio===false&&preview.authority.sourceModifiedAutomatically===false,'Studio execution boundary weakened');
assert(preview.acceptanceBoundary.section40Complete===false,'Studio runtime overclaims Section 40 completion');

const comparison=compareGlazeStudioMotionModesV12({...base,scenarioId:'motion-profile-review'});
assert(comparison.previews.length===4&&JSON.stringify(comparison.modeOrder)===JSON.stringify(comparisonModes),'Studio four-mode comparison mismatch');
assert(comparison.calm.preview.motionProfile.resolved.expression.effectiveProfile==='calm','Calm comparison mode mismatch');
assert(comparison.balanced.preview.motionProfile.resolved.expression.effectiveProfile==='balanced','Balanced comparison mode mismatch');
assert(comparison.expressive.preview.motionProfile.resolved.expression.effectiveProfile==='expressive','Expressive comparison mode mismatch');
assert(comparison.reducedMotion.preview.motionProfile.resolved.accessibility.reducedMotionApplied===true,'Reduced Motion comparison mode missing');
assert(comparison.reducedMotion.preview.motionProfile.resolved.expression.effectiveProfile==='calm','Reduced Motion must cap effective profile at Calm');
assert(comparison.reducedMotion.preview.reducedMotionMapping.reducedMotionApplied===true,'Reduced Motion equivalent preview missing');
assert(comparison.rankingPerformed===false&&comparison.acceptedWinner===null,'Studio comparison must not rank or select a winner');
assert(comparison.preferencePersistedByStudio===false&&comparison.animationExecuted===false,'Studio comparison execution/persistence boundary weakened');

const semanticComparison=compareGlazeStudioPreviewsV12({scenarios:[
  {...base,scenarioId:'warning',previewKind:'semantic-state'},
  {...base,scenarioId:'accessibility',previewKind:'accessibility-mode',accessibilityProfiles:['reduced-motion']}
]});
assert(semanticComparison.previews.length===2&&semanticComparison.rankingPerformed===false,'generic Studio comparison mismatch');
assert(semanticComparison.previews[1].preview.reducedMotionMapping.reducedMotionApplied===true,'accessibility preview lost Reduced Motion state');

for(const bad of [
  ()=>createGlazeStudioPreviewV12({...base,previewKind:'invented'}),
  ()=>createGlazeStudioPreviewV12({...base,durationMs:240}),
  ()=>createGlazeStudioPreviewV12({...base,performanceMeasurements:{fps:60}}),
  ()=>compareGlazeStudioPreviewsV12({scenarios:[base]}),
  ()=>compareGlazeStudioMotionModesV12({...base,score:10})
]){
  let failed=false;try{bad();}catch{failed=true;}assert(failed,'unsupported/raw/acceptance Studio input must fail closed');
}

assert(tokens.version==='1.7.0-dev.33'&&tokens.v12SpecificationSections[0]===40,'token identity mismatch');
assert(JSON.stringify(tokens.previewDomains)===JSON.stringify(previewDomains),'token preview domains mismatch');
assert(tokens.preview.animationExecuted===false&&tokens.preview.rankingPerformed===false,'token execution/ranking boundaries weakened');
assert(tokens.boundaries.section40Complete===false&&tokens.boundaries.rawAnimationValuesAccepted===false,'token acceptance boundary weakened');

assert(glazeV17StudioV12DevelopmentContract.version==='1.7.0-dev.33','runtime contract identity mismatch');
assert(glazeV17StudioV12DevelopmentContract.historicalFoundationReinterpreted===false,'runtime contract relabeled dev.12');
assert(glazeV17StudioV12DevelopmentContract.rawAnimationValuesAccepted===false&&glazeV17StudioV12DevelopmentContract.animationExecutedByStudio===false,'runtime raw/execution boundary weakened');
assert(glazeV17StudioV12DevelopmentContract.section40Complete===false,'runtime contract completion overclaimed');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=33,'aggregate version regressed below dev.33');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle boundary weakened');
assert(glazeV17Development.planV12FoundationSections.includes(40),'aggregate missing Section 40');
assert(glazeV17Development.studioV12Foundation==='js/glaze-v1.7-studio-v1-2.dev.mjs','aggregate missing dev.33 Studio foundation');
assert(glazeV17Development.studioHistoricalFoundationReinterpretedAsV12===false,'aggregate relabeled historical Studio');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Experimental Glaze Motion');

assert(planned.includes('FR-018')&&planned.includes('Glaze Inspector/Studio'),'planned-feature scope lost Glaze Studio');
assert(implemented.includes('Glaze Studio v1.2 — `1.7.0-dev.33`'),'implemented-feature control missing dev.33');
assert(changelog.includes('1.7.0-dev.33')&&changelog.includes('Glaze Studio v1.2'),'changelog missing dev.33');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

for(const phrase of [
  'storybookjs/storybook','5efca7a6ab523726d4a0f2fbea00bbf5b66c3fe1','MIT',
  'react-cosmos/react-cosmos','aae77c654b9b437ea5f6e635e6df7fc28924e606',
  'tajo/ladle','592a3fc3bb83a2fe945cb0d8ab2c3ef35d19bc3e',
  'No third-party source code'
])assert(research.includes(phrase),'research provenance missing: '+phrase);
assert(rootResearch.includes('## V1.7 dev.33 — Glaze Studio v1.2'),'root research register missing dev.33');

console.log('GLAZE UI V1.7 Glaze Studio v1.2 Development validation: PASS');
console.log('Plan binding: v1.2 Section 40');
console.log('Historical dev.12 / v1.1 Section 27 provenance preserved: true');
console.log('Side-by-side modes: Calm, Balanced, Expressive, Reduced Motion');
console.log('Raw animation/performance values accepted: false');
console.log('Animation executed by Studio: false');
console.log('Section 40 complete: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
