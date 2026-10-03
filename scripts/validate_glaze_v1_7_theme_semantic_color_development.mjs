#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  resolveGlazeThemeLayer,
  resolveGlazeSemanticColor,
  resolveGlazeThemeColorOverrides,
  generateGlazeThemePalette,
  evaluateGlazeThemeAccessibility,
  resolveGlazeThemeSafety,
  glazeV17ThemeSemanticColorDevelopmentContract
} from '../js/glaze-v1.7-theme-semantic-color.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition) throw new Error(message);};

const contract=json('contracts/v1.7/theme-semantic-color.dev.json');
const schema=json('schemas/v1.7-theme-semantic-color.schema.json');
const tokens=json('tokens/glaze-v1.7-theme-semantic-color.dev.json');
const lifecycle=json('registry/lifecycle.json');
const stable=read('VERSION').trim();
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');

assert(stable==='1.7.0','V1.7 dev.8 must coexist with bounded Glaze V1.7 / 1.7.0 as current Stable');
assert(lifecycle.currentOfficial===stable && lifecycle.currentStable===stable,'VERSION/current Stable authority must agree');
assert(lifecycle.activeCandidate===null,'V1.7 dev.8 must not create an active Candidate');
assert(lifecycle.activePatchReleaseCandidate===null,'V1.7 dev.8 must not create a patch RC');
assert(lifecycle.plannedNext==='1.7.1','V1.7 dev.8 must not mutate lifecycle plannedNext');

for(const heading of [
  '## 7. Theme Architecture',
  '## 8. Semantic Color System 2.0',
  '## 9. Semantic Color Prominence',
  '## 10. Protected Semantic Colors',
  '## 11. Semantic Color Layering',
  '## 12. Intelligent Palette Generation',
  '## 13. Theme Color Roles',
  '## 18. Theme Accessibility Engine',
  '## 19. Theme Safety Mode',
  '## 21. Local-First Theme Generation'
]) assert(spec.includes(heading),`V1.7 v1.1 specification missing dev.8 foundation area: ${heading}`);

assert(spec.includes('Accessibility → Protected Semantic State → Product Identity → User Theme → Contextual Accent → Glaze Default'),'theme precedence requirement missing');
assert(spec.includes('Subtle → Standard → Prominent → Critical'),'semantic prominence hierarchy missing');
assert(spec.includes('Personalization must not change truth.'),'protected semantic truth boundary missing');

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema must use JSON Schema 2020-12');
assert(contract.version==='1.7.0-dev.8','contract version mismatch');
assert(contract.lifecycle==='Development','contract must remain Development');
assert(contract.stableBaseline==='1.6.0','contract Stable baseline mismatch');
assert(contract.consumerEligible===false,'contract must remain non-consumer-eligible');
assert(contract.planVersion==='v1.1','contract plan version mismatch');
assert(JSON.stringify(contract.v11SpecificationSections)===JSON.stringify([7,8,9,10,11,12,13,18,19,21]),'v1.1 foundation section list mismatch');
assert(contract.completionClaims.v11SectionsComplete===false,'dev.8 must not claim complete v1.1 sections');
assert(contract.completionClaims.advancedThemeManagerComplete===false,'dev.8 must not claim full Theme Manager');
assert(contract.completionClaims.themePackagesComplete===false,'dev.8 must not claim Theme Packages');
assert(contract.authority.boundary==='presentation-only','dev.8 must remain presentation-only');
assert(contract.accessibility.precedence===true,'accessibility precedence missing');
assert(contract.localFirst.networkRequired===false && contract.localFirst.telemetryRequired===false,'dev.8 must remain local-first');

assert(tokens.version==='1.7.0-dev.8','token version mismatch');
assert(tokens.lifecycle==='Development','tokens must remain Development');
assert(tokens.stableBaseline==='1.6.0','token Stable baseline mismatch');
assert(tokens.consumerEligible===false,'tokens must remain non-consumer-eligible');
assert(tokens.safety.protectedSemanticOverrideAllowed===false,'token safety must protect semantic roles');
assert(tokens.localFirst.networkRequired===false && tokens.localFirst.telemetryRequired===false,'tokens must remain local-first');

const accessibilityWins=resolveGlazeThemeLayer({
  accessibilityToken:'accessibility.forced-colors',
  accessibilityAuthoritative:true,
  protectedSemanticToken:'semantic.security',
  protectedSemanticAuthoritative:true,
  productIdentityToken:'identity.mail',
  productIdentityAuthoritative:true,
  userThemeToken:'theme.user',
  contextualAccentToken:'context.now',
  glazeDefaultToken:'glaze.default'
});
assert(accessibilityWins.layer==='accessibility','accessibility must have highest theme precedence');

const protectedWins=resolveGlazeThemeLayer({
  accessibilityToken:'accessibility.unverified',
  accessibilityAuthoritative:false,
  protectedSemanticToken:'semantic.security',
  protectedSemanticAuthoritative:true,
  productIdentityToken:'identity.mail',
  productIdentityAuthoritative:true,
  userThemeToken:'theme.user'
});
assert(protectedWins.layer==='protected-semantic-state','protected semantic state must outrank identity and user theme');

const identityWinsWithoutSemanticAuthority=resolveGlazeThemeLayer({
  protectedSemanticToken:'semantic.security',
  protectedSemanticAuthoritative:false,
  productIdentityToken:'identity.mail',
  productIdentityAuthoritative:true,
  userThemeToken:'theme.user'
});
assert(identityWinsWithoutSemanticAuthority.layer==='product-identity','unauthoritative semantic state must not outrank authoritative identity');

const trustedSecurity=resolveGlazeSemanticColor({role:'security',prominence:'critical',authoritative:true});
assert(trustedSecurity.acceptedRole==='security' && trustedSecurity.effectiveProminence==='critical','authoritative critical security state should remain critical');
const untrustedSecurity=resolveGlazeSemanticColor({role:'security',prominence:'critical',authoritative:false});
assert(untrustedSecurity.acceptedRole==='unknown' && untrustedSecurity.token===null,'unauthoritative security state must fail closed');

const noisyInformation=resolveGlazeSemanticColor({role:'information',prominence:'critical',authoritative:true});
assert(noisyInformation.effectiveProminence==='prominent','ordinary information must not escalate to Critical');
assert(noisyInformation.criticalEscalationRejected===true,'critical escalation rejection must be observable');

const overrides=resolveGlazeThemeColorOverrides({
  security:'accent.purple',
  privacy:'accent.green',
  destructive:'accent.blue',
  'primary-accent':'accent.user.primary',
  selection:'accent.user.selection',
  madeup:'unknown'
});
assert(overrides.rejectedProtected.includes('security') && overrides.rejectedProtected.includes('privacy') && overrides.rejectedProtected.includes('destructive'),'protected theme overrides must be rejected');
assert(overrides.accepted['primary-accent']==='accent.user.primary','safe theme color role should remain customizable');
assert(overrides.accepted.selection==='accent.user.selection','selection theme role should remain customizable');
assert(overrides.rejectedUnsupported.includes('madeup'),'unsupported theme role must be rejected');

for(const mode of ['light','dark','deep-dark']){
  const palette=generateGlazeThemePalette({seed:'#3a79d8',mode});
  assert(palette.generatedLocally===true,'palette generation must be local');
  assert(palette.networkRequired===false && palette.telemetryRequired===false,'palette generation must not require network or telemetry');
  assert(palette.protectedSemanticPalettesReplaced===false,'generated palette must not replace protected semantic palettes');
  assert(palette.primary!==palette.secondary && palette.secondary!==palette.tertiary,'generated palette families must be distinguishable');
}

const readable=evaluateGlazeThemeAccessibility({
  foreground:'#000000',
  background:'#ffffff',
  focus:'#005fcc',
  focusBackground:'#ffffff'
});
assert(readable.normalTextPass===true && readable.focusPass===true && readable.conformant===true,'known accessible theme should pass diagnostics');

const unreadable=evaluateGlazeThemeAccessibility({
  foreground:'#777777',
  background:'#777777',
  focus:'#888888',
  focusBackground:'#888888'
});
assert(unreadable.conformant===false,'inaccessible theme should fail diagnostics');

const fallback=resolveGlazeThemeSafety({requestedThemeId:'theme.bad',diagnostics:unreadable});
assert(fallback.fallbackApplied===true && fallback.acceptedThemeId==='glaze-default','unsafe theme must fail safe to Glaze default');
assert(fallback.protectedSemanticMeaningPreserved===true,'theme safety fallback must preserve semantic meaning');

assert(glazeV17ThemeSemanticColorDevelopmentContract.version==='1.7.0-dev.8','runtime contract version mismatch');
assert(glazeV17ThemeSemanticColorDevelopmentContract.planVersion==='v1.1','runtime plan version mismatch');
assert(glazeV17ThemeSemanticColorDevelopmentContract.v11SectionsComplete===false,'runtime must not overclaim v1.1 completion');
assert(glazeV17ThemeSemanticColorDevelopmentContract.consumerEligible===false,'runtime must remain non-consumer-eligible');
assert(glazeV17ThemeSemanticColorDevelopmentContract.providerTruthManufactured===false,'runtime must preserve provider truth boundary');
assert(glazeV17ThemeSemanticColorDevelopmentContract.protectedSemanticOverrideAllowed===false,'runtime must protect semantic colors');

const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal) && aggregateOrdinal>=8,'aggregate must retain dev.8 or a later bounded Development revision');
assert(glazeV17Development.lifecycle==='development','aggregate must remain Development');
assert(glazeV17Development.stableBaseline==='1.6.0','aggregate Stable baseline mismatch');
assert(glazeV17Development.consumerEligible===false,'aggregate must remain non-consumer-eligible');
assert(glazeV17Development.implementedSpecificationSectionsPlanVersion==='v1.0-historical-numbering','aggregate must explicitly retain historical numbering provenance');
const aggregatePlanMinor=Number(glazeV17Development.planVersion.match(/^v1\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregatePlanMinor)&&aggregatePlanMinor>=1,'aggregate current plan version regressed below v1.1');
assert(glazeV17Development.themeSemanticColorFoundation==='js/glaze-v1.7-theme-semantic-color.dev.mjs','aggregate missing dev.8 foundation');
for(const section of [7,8,9,10,11,12,13,18,19,21]) assert(glazeV17Development.planV11FoundationSections.includes(section),`aggregate lost dev.8 v1.1 foundation section: ${section}`);
assert(glazeV17Development.providerTruthManufactured===false,'aggregate provider-truth boundary weakened');

assert(planned.includes('1.7.0-dev.8') && planned.includes('Theme and Semantic Color Reconciliation'),'planned-feature control missing dev.8 state');
assert(implemented.includes('Theme and Semantic Color Reconciliation — `1.7.0-dev.8`'),'implemented-feature control missing dev.8');
assert(changelog.includes('1.7.0-dev.8') && changelog.includes('Theme and Semantic Color Reconciliation'),'changelog missing dev.8');

for(const [fn,args] of [
  [resolveGlazeSemanticColor,{role:'invented',authoritative:true}],
  [generateGlazeThemePalette,{seed:'not-a-color'}]
]){
  let failed=false;
  try{fn(args);}catch{failed=true;}
  assert(failed,'unsupported semantic/theme value must fail closed');
}

console.log('GLAZE UI V1.7 Theme and Semantic Color Reconciliation Development foundation: PASS');
console.log('Plan version: v1.1');
console.log('Bounded foundation sections: 7, 8, 9, 10, 11, 12, 13, 18, 19, 21');
console.log('V1.1 sections complete: false');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
