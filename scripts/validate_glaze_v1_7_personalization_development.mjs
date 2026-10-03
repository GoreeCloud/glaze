#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazePersonalization,
  resolveGlazePersonalizationAction,
  glazeV17PersonalizationDevelopmentContract
} from '../js/glaze-v1.7-personalization.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = json('contracts/v1.7/personalization.dev.json');
const schema = json('schemas/v1.7-personalization.schema.json');
const tokens = json('tokens/glaze-v1.7-personalization.dev.json');
const lifecycle = json('registry/lifecycle.json');
const stable = read('VERSION').trim();
const spec = read('GLAZE_UI_V1_7_PLANNED.md');

const appearanceModes = ['light','dark','deep-dark'];
const accentFamilies = ['glaze-default','user-accent','wallpaper-derived','application-identity'];
const materialLevels = ['subdued','standard','expressive'];
const densityLevels = ['compact','standard','comfortable'];
const geometryPreferences = ['compact','balanced','rounded'];
const motionLevels = ['minimal','standard','expressive'];
const actions = ['preview','apply','reset','undo'];
const protectedRoles = ['security','privacy','warning','critical','destructive','restricted','protected','success'];

assert(stable === '1.7.0', 'V1.7 dev.5 must coexist with bounded Glaze V1.7 / 1.7.0 as current Stable');
assert(lifecycle.currentOfficial === stable && lifecycle.currentStable === stable, 'VERSION/current Stable authority must agree');
assert(lifecycle.activeCandidate === null, 'V1.7 dev.5 must not create an active Candidate');
assert(lifecycle.activePatchReleaseCandidate === null, 'V1.7 dev.5 must not create a patch RC');
assert(lifecycle.plannedNext==='1.7.1', 'V1.7 dev.5 must not mutate lifecycle plannedNext');

assert(spec.includes('## 6. Advanced Theme Manager 2.0'), 'V1.7 specification missing Advanced Theme Manager 2.0 section');
for (const phrase of [
  'Follow System',
  'Light',
  'Dark',
  'Deep Dark',
  'Accent palettes',
  'Material intensity',
  'Density profiles',
  'Governed geometry profiles',
  'Motion-expression profiles',
  'Wallpaper-derived palettes',
  'Application-aware themes',
  'Preview-before-Apply',
  'Theme history',
  'Undo',
  'Per-device preferences'
]) {
  assert(spec.includes(phrase), `V1.7 v1.2 specification missing personalization requirement: ${phrase}`);
}
for (const role of ['security','privacy','warning','critical','destructive','restricted','protected','success']) {
  assert(spec.toLowerCase().includes(role), `V1.7 specification missing protected role: ${role}`);
}
assert(spec.includes('Theme generation should remain local-first.'), 'V1.7 v1.2 specification missing local-first theme-generation requirement');

assert(fs.existsSync(path.join(root, 'IMPLEMENTED-FEATURES.md')), 'IMPLEMENTED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'PLANNED-FEATURES.md')), 'PLANNED-FEATURES.md is required');
assert(fs.existsSync(path.join(root, 'CHANGELOGS.md')), 'CHANGELOGS.md is required');
assert(!fs.existsSync(path.join(root, 'FEATURE-ROADMAP.md')), 'FEATURE-ROADMAP.md must remain retired');
assert(!fs.existsSync(path.join(root, 'CHANGELOG.md')), 'legacy singular CHANGELOG.md must remain retired');

assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'schema must use JSON Schema 2020-12');
assert(contract.$schema === '../../schemas/v1.7-personalization.schema.json', 'contract schema binding mismatch');
assert(contract.version === '1.7.0-dev.5', 'contract version mismatch');
assert(contract.lifecycle === 'Development', 'contract must remain Development');
assert(contract.stableBaseline === '1.6.0', 'contract Stable baseline mismatch');
assert(contract.consumerEligible === false, 'contract must remain non-consumer-eligible');
assert(JSON.stringify(contract.implementedSpecificationSections) === JSON.stringify([6]), 'implemented section set mismatch');
assert(JSON.stringify(contract.appearanceModes) === JSON.stringify(appearanceModes), 'appearance modes mismatch');
assert(JSON.stringify(contract.accentFamilies) === JSON.stringify(accentFamilies), 'accent families mismatch');
assert(JSON.stringify(contract.materialIntensityLevels) === JSON.stringify(materialLevels), 'material levels mismatch');
assert(JSON.stringify(contract.densityLevels) === JSON.stringify(densityLevels), 'density levels mismatch');
assert(JSON.stringify(contract.geometryPreferences) === JSON.stringify(geometryPreferences), 'geometry preferences mismatch');
assert(JSON.stringify(contract.motionIntensityLevels) === JSON.stringify(motionLevels), 'motion levels mismatch');
assert(JSON.stringify(contract.actions) === JSON.stringify(actions), 'personalization actions mismatch');
assert(JSON.stringify(contract.protectedSemanticRoles) === JSON.stringify(protectedRoles), 'protected semantic roles mismatch');
assert(contract.authorityPrecedence[0] === 'accessibility', 'accessibility must have highest personalization precedence');
assert(contract.authorityPrecedence[1] === 'semantic', 'semantic authority must precede aesthetic authorities');
assert(contract.accessibility.overridesAestheticPersonalization === true, 'accessibility must override aesthetic personalization');
assert(contract.accessibility.protectedSemanticRolesRemainProtected === true, 'protected semantic roles must remain protected');
assert(contract.localFirst.networkRequired === false, 'personalization must not require network access');
assert(contract.localFirst.telemetryRequired === false, 'personalization must not require telemetry');
assert(contract.localFirst.advertisingDependencyAllowed === false, 'personalization must not depend on advertising');
assert(contract.localFirst.remoteFontsRequired === false, 'personalization must not require remote fonts');
assert(contract.localFirst.remoteVisualDependenciesRequired === false, 'personalization must not require remote visual dependencies');
assert(contract.localFirst.sensitiveContentAnalysisRequired === false, 'personalization must not require sensitive-content analysis');
assert(contract.localFirst.directWallpaperPixelAcquisitionAuthority === false, 'Glaze must not gain wallpaper pixel acquisition authority');
assert(contract.wallpaperInfluence.decorativeOnly === true, 'wallpaper influence must remain decorative');
assert(contract.wallpaperInfluence.maximumInfluence === 0.08, 'wallpaper influence ceiling mismatch');
assert(contract.wallpaperInfluence.privateContentInspectionAllowed === false, 'wallpaper influence must not authorize private content inspection');
assert(contract.applicationIdentity.preservedThroughPersonalization === true, 'application identity must be preserved');
assert(contract.applicationIdentity.mayRedefineProtectedSemanticRoles === false, 'application identity must not redefine protected semantic roles');
assert(contract.session.previewBeforeApplySupported === true, 'preview-before-apply must be supported');
assert(contract.session.explicitUserIntentRequiredForApplyResetUndo === true, 'apply/reset/undo must require explicit user intent');
assert(contract.session.crossDeviceSyncEstablished === false, 'dev.5 must not claim cross-device sync');
assert(contract.session.persistenceAutomatic === false, 'Glaze must not automatically persist personalization');
assert(contract.authority.boundary === 'presentation-only', 'Personalization must remain presentation-only');
assert(contract.authority.sourceAuthorityInferredByGlaze === false, 'Glaze must not infer source authority');
assert(contract.authority.permissionGrantedByGlaze === false, 'Glaze must not grant permission');
assert(contract.authority.consentGrantedByGlaze === false, 'Glaze must not grant consent');
assert(contract.authority.capabilityCreatedByGlaze === false, 'Glaze must not create capability');
assert(contract.authority.persistencePerformedByGlaze === false, 'Glaze must not perform persistence');
assert(contract.authority.consequentialExecutionAutomatic === false, 'Glaze must not auto-execute consequential actions');

assert(tokens.version === '1.7.0-dev.5', 'token map version mismatch');
assert(tokens.lifecycle === 'Development', 'token map must remain Development');
assert(tokens.stableBaseline === '1.6.0', 'token map Stable baseline mismatch');
assert(tokens.consumerEligible === false, 'token map must remain non-consumer-eligible');
assert(Object.keys(tokens.appearanceModes).length === 3, 'token map must expose three appearance modes');
assert(Object.keys(tokens.accentFamilies).length === 4, 'token map must expose four accent families');
assert(Object.keys(tokens.materialIntensity).length === 3, 'token map must expose three material intensity levels');
assert(Object.keys(tokens.density).length === 3, 'token map must expose three density levels');
assert(Object.keys(tokens.geometry).length === 3, 'token map must expose three geometry preferences');
assert(Object.keys(tokens.motionIntensity).length === 3, 'token map must expose three motion intensity levels');
assert(Object.keys(tokens.actions).length === 4, 'token map must expose four personalization actions');
assert(Object.keys(tokens.protectedSemanticRoles).length === 8, 'token map must expose eight protected semantic roles');
assert(tokens.precedence[0] === 'accessibility' && tokens.precedence[1] === 'semantic', 'token map authority precedence mismatch');
assert(tokens.wallpaperInfluence.maximumInfluence === 0.08, 'token map wallpaper influence ceiling mismatch');
assert(tokens.localFirst.networkRequired === false, 'token map must remain local-first');
assert(tokens.localFirst.telemetryRequired === false, 'token map must not require telemetry');
assert(tokens.boundaries.personalizationMayRedefineProtectedSemanticRoles === false, 'token map must protect semantic roles');
assert(tokens.boundaries.persistencePerformedByGlaze === false, 'token map must not perform persistence');

for (const source of tokens.sourceAuthorities || []) {
  assert(fs.existsSync(path.join(root, source)), `token source authority missing: ${source}`);
}

for (const appearance of appearanceModes) {
  const resolved = resolveGlazePersonalization({appearance});
  assert(resolved.appearance.requested === appearance, `appearance request mismatch: ${appearance}`);
  assert(resolved.appearance.effective === appearance, `appearance effective mismatch: ${appearance}`);
  assert(resolved.authority.presentationOnly === true, `presentation boundary lost: ${appearance}`);
}

for (const family of accentFamilies) {
  const input = {
    accentFamily: family,
    userAccentToken: family === 'user-accent' ? 'accent.user.test' : null,
    userAccentAuthoritative: family === 'user-accent',
    wallpaperPaletteSummary: family === 'wallpaper-derived' ? 'palette.wallpaper.test' : null,
    wallpaperSummaryAuthoritative: family === 'wallpaper-derived',
    applicationIdentityToken: family === 'application-identity' ? 'identity.app.test' : null,
    applicationIdentityAuthoritative: family === 'application-identity',
    wallpaperInfluence: 0.08
  };
  const resolved = resolveGlazePersonalization(input);
  assert(resolved.accent.acceptedFamily === family, `authoritative accent family failed: ${family}`);
  assert(resolved.accent.protectedSemanticRolesMayBeRedefined === false, `accent family weakened semantic protection: ${family}`);
}

const unverifiedWallpaper = resolveGlazePersonalization({
  accentFamily:'wallpaper-derived',
  wallpaperPaletteSummary:'palette.wallpaper.private',
  wallpaperSummaryAuthoritative:false,
  wallpaperInfluence:0.08
});
assert(unverifiedWallpaper.accent.acceptedFamily === 'glaze-default', 'unverified wallpaper source must fail closed to Glaze default');
assert(unverifiedWallpaper.accent.requestedSourceWithheldWithoutAuthority === true, 'withheld wallpaper source must be observable');
assert(unverifiedWallpaper.accent.decorativeWallpaperInfluence === 0, 'unverified wallpaper source must have zero influence');
assert(unverifiedWallpaper.authority.privateContentInspectedByGlaze === false, 'Glaze must not inspect private wallpaper content');

const boundedWallpaper = resolveGlazePersonalization({
  accentFamily:'wallpaper-derived',
  wallpaperPaletteSummary:'palette.wallpaper.local-summary',
  wallpaperSummaryAuthoritative:true,
  wallpaperInfluence:0.50
});
assert(boundedWallpaper.accent.acceptedFamily === 'wallpaper-derived', 'authoritative wallpaper source should be accepted');
assert(boundedWallpaper.accent.decorativeWallpaperInfluence === 0.08, 'wallpaper influence must clamp to 8%');
assert(boundedWallpaper.accent.wallpaperInfluenceDecorativeOnly === true, 'wallpaper influence must remain decorative');

const unverifiedIdentity = resolveGlazePersonalization({
  accentFamily:'application-identity',
  applicationIdentityToken:'identity.app',
  applicationIdentityAuthoritative:false
});
assert(unverifiedIdentity.accent.acceptedFamily === 'glaze-default', 'unverified application identity must fail closed');
assert(unverifiedIdentity.applicationIdentity.token === null, 'unverified application identity token must be withheld');
assert(unverifiedIdentity.applicationIdentity.preservedThroughPersonalization === true, 'application identity preservation invariant missing');

const semanticProtection = resolveGlazePersonalization({
  semanticRoleOverrides:{
    security:'accent.hot-pink',
    privacy:'accent.green',
    warning:'accent.blue',
    critical:'accent.yellow',
    destructive:'accent.cyan',
    restricted:'accent.orange',
    protected:'accent.purple',
    success:'accent.red',
    accent:'accent.user',
    focus:'focus.user',
    madeUpRole:'unknown.user'
  }
});
assert(semanticProtection.semanticOverrides.rejectedProtected.length === 8, 'all protected semantic override attempts must be rejected');
assert(semanticProtection.semanticOverrides.accepted.accent === 'accent.user', 'safe accent presentation override should remain possible');
assert(semanticProtection.semanticOverrides.accepted.focus === 'focus.user', 'safe focus presentation override should remain possible');
assert(semanticProtection.semanticOverrides.rejectedUnsupported.includes('madeuprole'), 'unsupported override role should be rejected');
assert(semanticProtection.protectedSemanticRoles.length === 8, 'protected role list must remain intact');

const forcedColors = resolveGlazePersonalization({
  appearance:'deep-dark',
  accentFamily:'user-accent',
  userAccentToken:'accent.user',
  userAccentAuthoritative:true,
  materialIntensity:'expressive',
  accessibilityProfiles:['forced-colors']
});
assert(forcedColors.appearance.effective === 'deep-dark', 'forced colors must not erase requested appearance identity');
assert(forcedColors.appearance.pigmentAuthority === 'accessibility-forced-colors', 'forced colors must own effective pigments');
assert(forcedColors.accent.pigmentAuthority === 'accessibility', 'forced colors must outrank accent pigment');
assert(forcedColors.materialIntensity.effective === 'expressive', 'forced colors alone must not invent material downgrade beyond contract');

const accessibilityOverrides = resolveGlazePersonalization({
  materialIntensity:'expressive',
  density:'compact',
  geometry:'rounded',
  motionIntensity:'expressive',
  accessibilityProfiles:[
    'increased-contrast',
    'reduced-transparency',
    'reduced-motion',
    'extra-large-text',
    'touch-assistance'
  ]
});
assert(accessibilityOverrides.materialIntensity.effective === 'subdued', 'accessibility must be able to reduce material intensity');
assert(accessibilityOverrides.motionIntensity.effective === 'minimal', 'Reduced Motion must force minimal motion');
assert(accessibilityOverrides.density.effective === 'comfortable', 'large text/touch assistance must force comfortable density');
assert(accessibilityOverrides.geometry.effective === 'balanced', 'large text must be able to override geometry');
assert(accessibilityOverrides.accessibility.precedence === true, 'accessibility precedence must be explicit');

const preview = resolveGlazePersonalizationAction({
  action:'preview',
  currentPreferences:{appearance:'light'},
  requestedPreferences:{appearance:'dark',density:'comfortable'}
});
assert(preview.accepted === true, 'preview must be accepted without persistence intent');
assert(preview.transition.previewOnly === true, 'preview must remain preview-only');
assert(preview.proposed.appearance === 'dark', 'preview must resolve requested appearance');
assert(preview.transition.callerMustPersist === false, 'preview must not request persistence');
assert(preview.transition.persistencePerformedByGlaze === false, 'Glaze must not persist preview');

const applyWithoutIntent = resolveGlazePersonalizationAction({
  action:'apply',
  currentPreferences:{appearance:'light'},
  requestedPreferences:{appearance:'dark'},
  explicitUserIntent:false
});
assert(applyWithoutIntent.accepted === false, 'apply must fail closed without explicit user intent');
assert(applyWithoutIntent.reason === 'explicit-user-intent-required', 'apply rejection reason mismatch');
assert(applyWithoutIntent.proposed.appearance === 'light', 'rejected apply must preserve current state');

const apply = resolveGlazePersonalizationAction({
  action:'apply',
  currentPreferences:{appearance:'light'},
  requestedPreferences:{appearance:'dark',motionIntensity:'minimal'},
  explicitUserIntent:true
});
assert(apply.accepted === true, 'explicit apply should produce a proposal');
assert(apply.proposed.appearance === 'dark', 'apply proposal appearance mismatch');
assert(apply.transition.callerMustPersist === true, 'accepted apply must require caller persistence');
assert(apply.transition.persistencePerformedByGlaze === false, 'Glaze must not perform apply persistence');

const reset = resolveGlazePersonalizationAction({
  action:'reset',
  currentPreferences:{appearance:'deep-dark',density:'comfortable'},
  explicitUserIntent:true
});
assert(reset.accepted === true, 'explicit reset should produce a proposal');
assert(reset.proposed.appearance === 'light', 'reset must restore governed default appearance');
assert(reset.proposed.density === 'standard', 'reset must restore governed default density');

const undoWithoutHistory = resolveGlazePersonalizationAction({
  action:'undo',
  currentPreferences:{appearance:'dark'},
  explicitUserIntent:true
});
assert(undoWithoutHistory.accepted === false, 'undo without previous state must fail closed');
assert(undoWithoutHistory.reason === 'previous-state-required', 'undo without history reason mismatch');
assert(undoWithoutHistory.proposed.appearance === 'dark', 'undo without history must preserve current state');

const undo = resolveGlazePersonalizationAction({
  action:'undo',
  currentPreferences:{appearance:'dark'},
  previousPreferences:{appearance:'light'},
  explicitUserIntent:true
});
assert(undo.accepted === true, 'undo with caller-supplied previous state should produce a proposal');
assert(undo.proposed.appearance === 'light', 'undo proposal must use caller-supplied previous state');
assert(undo.transition.persistencePerformedByGlaze === false, 'Glaze must not persist undo automatically');

assert(glazeV17PersonalizationDevelopmentContract.version === '1.7.0-dev.5', 'runtime contract version mismatch');
assert(glazeV17PersonalizationDevelopmentContract.lifecycle === 'development', 'runtime contract must remain Development');
assert(glazeV17PersonalizationDevelopmentContract.stableBaseline === '1.6.0', 'runtime Stable baseline mismatch');
assert(glazeV17PersonalizationDevelopmentContract.consumerEligible === false, 'runtime must remain non-consumer-eligible');
assert(glazeV17PersonalizationDevelopmentContract.appearanceModes.length === 3, 'runtime appearance mode count mismatch');
assert(glazeV17PersonalizationDevelopmentContract.accentFamilies.length === 4, 'runtime accent family count mismatch');
assert(glazeV17PersonalizationDevelopmentContract.protectedSemanticRoles.length === 8, 'runtime protected role count mismatch');
assert(glazeV17PersonalizationDevelopmentContract.maximumWallpaperInfluence === 0.08, 'runtime wallpaper influence ceiling mismatch');
assert(glazeV17PersonalizationDevelopmentContract.accessibilityPrecedence === true, 'runtime accessibility precedence missing');
assert(glazeV17PersonalizationDevelopmentContract.personalizationMayRedefineProtectedSemanticRoles === false, 'runtime must protect semantic roles');
assert(glazeV17PersonalizationDevelopmentContract.networkRequired === false, 'runtime personalization must not require network');
assert(glazeV17PersonalizationDevelopmentContract.telemetryRequired === false, 'runtime personalization must not require telemetry');
assert(glazeV17PersonalizationDevelopmentContract.crossDeviceSyncEstablished === false, 'runtime must not claim cross-device sync');
assert(glazeV17PersonalizationDevelopmentContract.persistenceAutomatic === false, 'runtime must not auto-persist');

const aggregateVersionParts = glazeV17Development.version.split('-dev.');
assert(
  aggregateVersionParts.length === 2 && aggregateVersionParts[0] === '1.7.0',
  'aggregate version format mismatch'
);
const aggregateDevelopmentOrdinal = Number(aggregateVersionParts[1]);
assert(Number.isInteger(aggregateDevelopmentOrdinal) && aggregateDevelopmentOrdinal >= 5, 'aggregate must retain Personalization dev.5 or later');
assert(glazeV17Development.lifecycle === 'development', 'aggregate must remain Development');
assert(glazeV17Development.stableBaseline === '1.6.0', 'aggregate Stable baseline mismatch');
assert(glazeV17Development.consumerEligible === false, 'aggregate must remain non-consumer-eligible');
for (const retainedSection of [1,2,3,4,5,6]) {
  assert(
    glazeV17Development.implementedSpecificationSections.includes(retainedSection),
    `aggregate lost Personalization prerequisite section ${retainedSection}`
  );
}
assert(glazeV17Development.taskContinuityFoundation === 'js/glaze-v1.7-task-continuity.dev.mjs', 'aggregate lost Task Continuity');
assert(glazeV17Development.adaptiveInputFoundation === 'js/glaze-v1.7-adaptive-input.dev.mjs', 'aggregate lost Adaptive Input');
assert(glazeV17Development.formFactorProfilesFoundation === 'js/glaze-v1.7-form-factor-profiles.dev.mjs', 'aggregate lost Form-Factor Profiles');
assert(glazeV17Development.commandSurfaceFoundation === 'js/glaze-v1.7-command-surface.dev.mjs', 'aggregate lost Command Surface');
assert(glazeV17Development.personalizationFoundation === 'js/glaze-v1.7-personalization.dev.mjs', 'aggregate missing Personalization foundation');

for (const [kind,value] of [
  ['appearance','sepia'],
  ['accentFamily','mystery'],
  ['materialIntensity','maximum'],
  ['density','tiny'],
  ['geometry','triangle'],
  ['motionIntensity','chaotic'],
  ['scope','cloud-global']
]) {
  let failed=false;
  try { resolveGlazePersonalization({[kind]:value}); } catch { failed=true; }
  assert(failed, `unknown personalization value must fail closed: ${kind}=${value}`);
}

let invalidAction=false;
try { resolveGlazePersonalizationAction({action:'publish-theme'}); } catch { invalidAction=true; }
assert(invalidAction, 'unknown personalization action must fail closed');

console.log('GLAZE UI V1.7 Personalization 2.0 Development foundation: PASS');
console.log('Implemented section: 6');
console.log('Appearance modes: 3');
console.log('Accent families: 4');
console.log('Protected semantic roles: 8');
console.log('Personalization actions: 4');
console.log('Wallpaper decorative influence ceiling: 0.08');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
