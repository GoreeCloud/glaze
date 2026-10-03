#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeAdvancedThemeManager,
  evaluateGlazeThemeAccessibilityV12,
  resolveGlazeThemeSafetyV12,
  resolveGlazeThemePackage,
  resolveGlazeThemeHistory,
  resolveGlazeColorCodedContext,
  glazeV17AdvancedThemeSystemV12DevelopmentContract
} from '../js/glaze-v1.7-advanced-theme-system-v1-2.dev.mjs';
import {glazeV17PersonalizationDevelopmentContract} from '../js/glaze-v1.7-personalization.dev.mjs';
import {glazeV17ThemeSemanticColorDevelopmentContract} from '../js/glaze-v1.7-theme-semantic-color.dev.mjs';
import {glazeV17ThemeTransitionSystemDevelopmentContract} from '../js/glaze-v1.7-theme-transition-system.dev.mjs';
import {glazeV17MotionPersonalizationDevelopmentContract} from '../js/glaze-v1.7-motion-personalization.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/advanced-theme-system-v1-2.dev.json');
const schema=json('schemas/v1.7-advanced-theme-system-v1-2.schema.json');
const tokens=json('tokens/glaze-v1.7-advanced-theme-system-v1-2.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const research=read('research/v1.7-advanced-theme-system-v1-2.md');
const rootResearch=read('OPEN-SOURCE-RESEARCH.md');

assert(read('VERSION').trim()==='1.7.0','dev.31 must coexist with bounded Glaze V1.7 / 1.7.0 Anchor');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.31 must not create release lifecycle state');

for(let section=6;section<=21;section++)assert(spec.includes('## '+section+'. '),'current V1.7 plan missing Section '+section);
for(const phrase of [
  'Follow System','User-created themes','Per-application overrides','Per-device preferences',
  'Accessibility previews','Color-vision previews','Theme history','Safe import/export',
  'Accessibility → Protected Semantic State → Product Identity → User Theme → Contextual Accent → Glaze Default',
  'Subtle → Standard → Prominent → Critical','Personalization must not change truth.',
  'Color-Coded Navigation and Interaction','Color-Coded System State',
  'Connectivity and Synchronization Color','Data Visualization Color',
  'Theme Accessibility Engine','Theme Safety Mode','Theme Packages','Local-First Theme Generation'
])assert(spec.includes(phrase),'plan requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.31'&&contract.planVersion==='v1.2','dev.31 contract identity mismatch');
assert(contract.lifecycle==='Development'&&contract.consumerEligible===false,'dev.31 lifecycle boundary weakened');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify(Array.from({length:16},(_,i)=>i+6)),'Section 6-21 binding mismatch');
assert(contract.provenance.historicalFoundationsReinterpreted===false,'historical theme foundations were relabeled');
assert(contract.advancedThemeManager.appearanceModes.includes('follow-system'),'Follow System missing');
assert(contract.advancedThemeManager.perApplicationOverrides===true&&contract.advancedThemeManager.perDevicePreferences===true,'scoped preferences missing');
assert(contract.advancedThemeManager.themeHistory===true&&contract.advancedThemeManager.safeImportExport===true,'history/import-export missing');
assert(contract.themeArchitecture.accessibilityHighestPriority===true,'accessibility precedence missing');
assert(contract.semanticColorSystem.protectedSemanticOverrideAllowed===false,'protected semantic override boundary weakened');
assert(contract.colorCoding.connectivityAndSynchronizationConflated===false,'connectivity/synchronization distinction weakened');
assert(contract.themeAccessibility.automaticCorrectionMayChangeSemanticMeaning===false,'automatic correction may not change meaning');
assert(contract.themeSafety.damagedThemeMayBlockThemeManager===false,'unsafe theme may not block repair');
assert(contract.themePackages.nonExecutable===true&&contract.themePackages.remoteRuntimeResourcesAllowed===false,'theme package safety weakened');
assert(contract.paletteGeneration.networkRequired===false&&contract.paletteGeneration.offlineCompleteThemeExperienceRequired===true,'local-first theme generation weakened');
assert(contract.acceptanceBoundary.v12Sections6Through21SourceRequirementsMapped===true,'source reconciliation not mapped');
assert(contract.acceptanceBoundary.v12Sections6Through21Complete===false,'dev.31 overclaims Sections 6-21 completion');

assert(glazeV17PersonalizationDevelopmentContract.version==='1.7.0-dev.5','historical Personalization identity changed');
assert(glazeV17ThemeSemanticColorDevelopmentContract.version==='1.7.0-dev.8','historical theme/color identity changed');
assert(glazeV17ThemeSemanticColorDevelopmentContract.v11SectionsComplete===false,'dev.8 completion provenance changed');
assert(glazeV17ThemeTransitionSystemDevelopmentContract.version==='1.7.0-dev.20','Theme Transition identity changed');
assert(glazeV17MotionPersonalizationDevelopmentContract.version==='1.7.0-dev.22','Motion Personalization identity changed');

const fallback=resolveGlazeAdvancedThemeManager({
  action:'preview',appearanceMode:'follow-system',themeId:'glaze-default',scopeKind:'session-preview'
});
assert(fallback.theme.appearance.effective==='light'&&fallback.theme.appearance.followSystemResolved===false,'untrusted Follow System must fail safe');

const scoped=resolveGlazeAdvancedThemeManager({
  action:'apply-proposal',explicitUserIntent:true,
  appearanceMode:'follow-system',systemAppearance:'deep-dark',systemAppearanceAuthoritative:true,
  themeId:'theme.owner.midnight',themeIdentityAuthoritative:true,
  scopeKind:'application',scopeId:'com.goreecloud.mail',scopeAuthoritative:true,
  expressionProfile:'calm',primarySeed:'#3a79d8',secondarySeed:'#8a4fd4',tertiarySeed:'#2b9b78',
  paletteSeedAuthoritative:true,
  themeColorOverrides:{'primary-accent':'theme.owner.primary',selection:'theme.owner.selection',security:'unsafe.theme.security'}
});
assert(scoped.theme.appearance.effective==='deep-dark'&&scoped.theme.appearance.followSystemResolved===true,'authoritative Follow System failed');
assert(scoped.scope.effective==='application'&&scoped.scope.identity==='com.goreecloud.mail','application scope failed');
assert(scoped.action.accepted===true&&scoped.action.callerMustPersist===true,'apply proposal persistence boundary failed');
assert(scoped.palette.primary&&scoped.palette.secondary&&scoped.palette.tertiary,'multi-color palettes missing');
assert(scoped.palette.primary.protectedSemanticPalettesReplaced===false,'palette replaced protected semantics');
assert(scoped.overrides.rejectedProtected.includes('security'),'protected semantic override not rejected');

const untrustedDevice=resolveGlazeAdvancedThemeManager({
  action:'apply-proposal',explicitUserIntent:true,appearanceMode:'dark',
  themeId:'theme.owner.dark',themeIdentityAuthoritative:true,
  scopeKind:'device',scopeId:'device:phone',scopeAuthoritative:false
});
assert(untrustedDevice.scope.effective==='session-preview'&&untrustedDevice.action.accepted===false,'untrusted device scope must fail closed');

const noIntent=resolveGlazeAdvancedThemeManager({
  action:'apply-proposal',appearanceMode:'dark',themeId:'theme.owner.dark',
  themeIdentityAuthoritative:true,scopeKind:'global',scopeAuthoritative:true
});
assert(noIntent.action.accepted===false&&noIntent.action.reason==='explicit-user-intent-required','apply proposal must require explicit user intent');

const accessibility=evaluateGlazeThemeAccessibilityV12({
  diagnosticsAuthoritative:true,
  baseContrast:{foreground:'#000000',background:'#ffffff',focus:'#005fcc',focusBackground:'#ffffff'},
  selectionVisibility:true,semanticStateSeparation:true,categoricalColorSeparation:true,
  glazeReadability:true,disabledStateClarity:true,colorVisionAccessibility:true,
  grayscaleUsability:true,forcedColorsCompatibility:true,
  requestedAutomaticAdjustments:['tone','chroma','foreground','material-opacity','semantic-role']
});
assert(accessibility.conformant===true,'complete authoritative theme diagnostics should conform');
assert(accessibility.automaticCorrection.rejected.includes('semantic-role'),'unsafe semantic repair must be rejected');
assert(accessibility.automaticCorrection.semanticMeaningMayChange===false,'automatic repair may not alter meaning');

const safety=resolveGlazeThemeSafetyV12({
  requestedThemeId:'theme.owner.unsafe',evaluation:{conformant:false},invalidProperties:['foreground','selection']
});
assert(safety.fallbackApplied===true&&safety.acceptedThemeId==='glaze-default','unsafe theme must fail safe');
assert(safety.repairSurfaceMustRemainReachable===true&&safety.unsafeThemeMayBlockThemeManager===false,'repair/reset path must remain reachable');

const safePackage=resolveGlazeThemePackage({
  sourceAuthoritative:true,
  package:{format:'goreecloud.glaze-theme',version:1,id:'theme.package.owner',
    themeColorOverrides:{'primary-accent':'theme.package.primary',privacy:'theme.package.unsafe-privacy'}}
});
assert(safePackage.accepted===true&&safePackage.package.nonExecutable===true&&safePackage.import.previewOnly===true,'valid package boundary failed');
assert(safePackage.package.overrides.rejectedProtected.includes('privacy'),'package may not redefine protected semantics');

for(const packageObject of [
  {format:'goreecloud.glaze-theme',version:1,id:'bad-script',script:'alert(1)'},
  {format:'goreecloud.glaze-theme',version:1,id:'bad-remote',remoteResources:['https://example.invalid/theme.js']}
]){
  assert(resolveGlazeThemePackage({sourceAuthoritative:true,package:packageObject}).accepted===false,'executable/remote package content must be rejected');
}

const history=resolveGlazeThemeHistory({
  historyAuthoritative:true,explicitUserIntent:true,
  entries:[{id:'theme.a',appearance:'light'},{id:'theme.b',appearance:'dark'}]
});
assert(history.undo.accepted===true&&history.undo.proposedTheme.id==='theme.a','history undo proposal failed');
assert(history.undo.persistencePerformedByGlaze===false,'Glaze must not persist history undo');

const securityUnknown=resolveGlazeColorCodedContext({domain:'system',state:'security',stateAuthoritative:false});
assert(securityUnknown.acceptedState==='unknown'&&securityUnknown.providerAuthority==='Wardveil Security','security color must fail closed');
const connectivity=resolveGlazeColorCodedContext({domain:'connectivity',state:'connecting',stateAuthoritative:true});
const synchronization=resolveGlazeColorCodedContext({domain:'synchronization',state:'synchronizing',stateAuthoritative:true});
assert(connectivity.domain!==synchronization.domain&&connectivity.connectivityAndSynchronizationConflated===false,'connectivity and sync must remain distinct');
const chart=resolveGlazeColorCodedContext({domain:'data-visualization',state:'category'});
assert(chart.categoricalPaletteMustAvoidProtectedSemanticConfusion===true&&chart.colorOnlyMeaningAllowed===false,'data visualization color safety missing');

assert(tokens.version==='1.7.0-dev.31','token identity mismatch');
assert(tokens.themePackage.nonExecutable===true&&tokens.themePackage.remoteRuntimeResourcesAllowed===false,'token package safety weakened');
assert(tokens.boundaries.sections6Through21Complete===false,'token completion overclaimed');

assert(glazeV17AdvancedThemeSystemV12DevelopmentContract.version==='1.7.0-dev.31','runtime contract mismatch');
assert(glazeV17AdvancedThemeSystemV12DevelopmentContract.historicalFoundationsReinterpreted===false,'runtime relabeled historical foundations');
assert(glazeV17AdvancedThemeSystemV12DevelopmentContract.sourceRequirementsMapped===true,'runtime source mapping missing');
assert(glazeV17AdvancedThemeSystemV12DevelopmentContract.sections6Through21Complete===false,'runtime completion overclaimed');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=31,'aggregate version regressed below dev.31');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle boundary weakened');
assert(glazeV17Development.advancedThemeSystemV12Foundation==='js/glaze-v1.7-advanced-theme-system-v1-2.dev.mjs','aggregate missing dev.31 theme foundation');
assert(glazeV17Development.advancedThemeSystemHistoricalFoundationsReinterpreted===false,'aggregate relabeled historical theme foundations');
for(let section=6;section<=21;section++)assert(glazeV17Development.planV12ThemeSystemFoundationSections.includes(section),'aggregate missing theme Section '+section);

assert(planned.includes('1.7.0-dev.31')&&planned.includes('Advanced Theme System'),'planned-feature control missing dev.31');
assert(implemented.includes('Advanced Theme System v1.2 — ' + String.fromCharCode(96) + '1.7.0-dev.31' + String.fromCharCode(96)),'implemented-feature control missing dev.31');
assert(changelog.includes('1.7.0-dev.31')&&changelog.includes('Advanced Theme System'),'changelog missing dev.31');
assert(!changelog.includes('\\n'),'changelog contains literal escaped newline text');

for(const phrase of [
  'material-foundation/material-color-utilities','5b3618b16fdc3825e21d5679bafd144662088ea1','Apache-2.0',
  'microsoft/fluentui','8add8c8750c34c85acd811e32ab324abf8f1562e','MIT',
  'carbon-design-system/carbon','7e8c8f7db6dd2ed98c4947b78b37614f43eda920',
  'No third-party source code'
])assert(research.includes(phrase),'research provenance missing: '+phrase);
assert(rootResearch.includes('## V1.7 dev.31 — Advanced Theme System v1.2'),'root research register missing dev.31');

console.log('GLAZE UI V1.7 Advanced Theme System v1.2 Development reconciliation: PASS');
console.log('Plan binding: v1.2 Sections 6-21');
console.log('Historical dev.5/dev.8/dev.20/dev.21/dev.22 provenance preserved: true');
console.log('Source requirements mapped: true');
console.log('Sections 6-21 complete: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
