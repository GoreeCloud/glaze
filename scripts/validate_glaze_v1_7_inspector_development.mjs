#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectGlazeElement,normalizeGlazeInspectorProvenance,glazeV17InspectorDevelopmentContract} from '../js/glaze-v1.7-inspector.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/inspector.dev.json');
const schema=json('schemas/v1.7-glaze-inspector.schema.json');
const tokens=json('tokens/glaze-v1.7-inspector.dev.json');
const lifecycle=json('registry/lifecycle.json');
const stable=read('VERSION').trim();
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');

const domains=["component-state","token-provenance","semantic-color-resolution","theme-resolution","material-hierarchy","accessibility-overrides","focus-behavior","input-mapping","adaptive-layout-resolution","form-factor-previews","target-sizes","authority-boundaries","migration-state"];
const provenanceSources=["semantic-state","product-identity","user-theme","context","accessibility","glaze-fallback"];

assert(stable==='1.7.0','dev.11 must coexist with bounded Glaze V1.7 / 1.7.0 Stable');
assert(lifecycle.currentOfficial===stable&&lifecycle.currentStable===stable,'Stable authority mismatch');
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'dev.11 must not create Candidate state');
assert(lifecycle.plannedNext==='1.7.1','dev.11 must not mutate plannedNext');

assert(spec.includes('## 39. Glaze Inspector'),'V1.7 v1.2 specification missing Glaze Inspector Section 39');
assert(spec.includes('dev.8–dev.13 use the prior v1.1 35-section numbering'),'v1.2 plan must preserve v1.1 implementation-numbering provenance');
for(const phrase of ['Theme resolution','Semantic color resolution','Material resolution','Focus state','Accessibility overrides']) {
  assert(spec.includes(phrase),`V1.7 v1.2 Inspector requirement missing: ${phrase}`);
}

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema version mismatch');
assert(contract.version==='1.7.0-dev.11'&&contract.lifecycle==='Development'&&contract.consumerEligible===false,'contract lifecycle mismatch');
assert(contract.planVersion==='v1.1','plan version mismatch');
assert(JSON.stringify(contract.v11SpecificationSections)===JSON.stringify([26]),'Section 26 marker mismatch');
assert(JSON.stringify(contract.inspectionDomains)===JSON.stringify(domains),'inspection domain catalog mismatch');
assert(JSON.stringify(contract.provenanceSources)===JSON.stringify(provenanceSources),'provenance source catalog mismatch');
assert(contract.resolutionRequirements.colorResolutionExplainable===true,'color resolution must be explainable');
assert(contract.resolutionRequirements.sourceMutationAllowed===false,'Inspector must not mutate source');
assert(contract.resolutionRequirements.missingEvidenceMayInferPass===false,'missing evidence must remain unverified');
assert(contract.authority.advisoryOnly===true&&contract.authority.acceptanceGrantedByInspector===false,'Inspector authority boundary weakened');
assert(contract.privacy.privateContentRequired===false&&contract.privacy.telemetryRequired===false,'Inspector privacy boundary weakened');
assert(contract.acceptanceBoundary.section26Complete===false,'dev.11 must not claim Section 26 complete');
for(const source of Object.values(contract.integrationFoundations))assert(fs.existsSync(path.join(root,source)),`missing Inspector integration source: ${source}`);

assert(tokens.version==='1.7.0-dev.11'&&tokens.consumerEligible===false,'token lifecycle mismatch');
assert(JSON.stringify(tokens.inspectionDomains)===JSON.stringify(domains),'token inspection domain mismatch');
assert(JSON.stringify(tokens.provenanceSources)===JSON.stringify(provenanceSources),'token provenance source mismatch');
assert(tokens.boundaries.sourceMutationAutomatic===false&&tokens.boundaries.providerTruthInvented===false,'token authority boundary weakened');

const provenance=normalizeGlazeInspectorProvenance([
  {token:'semantic.warning.prominent',source:'semantic-state',authoritative:true,detail:'provider warning state'},
  {token:'theme.user.custom',source:'user-theme',authoritative:true}
]);
assert(provenance.length===2&&provenance[0].status==='verified','provenance normalization failed');
let badProvenance=false;try{normalizeGlazeInspectorProvenance([{token:'x',source:'mystery',authoritative:true}]);}catch{badProvenance=true;}assert(badProvenance,'unsupported provenance source must fail closed');

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
  previousTaskState:{navigationDestination:'settings',focusId:'theme-preview',draftText:'draft'}
};

const semantic=inspectGlazeElement(base);
assert(semantic.colorResolution.themeLayer==='protected-semantic-state','protected semantic theme should win');
assert(semantic.colorResolution.provenanceSource==='semantic-state','protected semantic source explanation mismatch');
assert(semantic.colorResolution.semanticRole==='warning','semantic role lost');
assert(semantic.colorResolution.matchedProvenance.length===1,'semantic provenance match missing');
assert(semantic.component.taskState.draftText==='draft','task continuity lost');
assert(semantic.authority.sourceModifiedAutomatically===false,'Inspector must remain advisory');
assert(semantic.acceptanceBoundary.section26Complete===false,'Inspector must not overclaim completion');

const accessibility=inspectGlazeElement({
  ...base,
  accessibilityThemeToken:'accessibility.forced-colors',
  accessibilityThemeAuthoritative:true
});
assert(accessibility.colorResolution.themeLayer==='accessibility','accessibility theme must win');
assert(accessibility.colorResolution.provenanceSource==='accessibility','accessibility provenance explanation mismatch');

const userTheme=inspectGlazeElement({
  ...base,
  protectedSemanticThemeToken:null,
  protectedSemanticThemeAuthoritative:false
});
assert(userTheme.colorResolution.themeLayer==='user-theme','user theme resolution mismatch');
assert(userTheme.colorResolution.provenanceSource==='user-theme','user theme provenance explanation mismatch');

const evidence=inspectGlazeElement({
  ...base,
  focusId:'theme-preview',
  focusAuthoritative:false,
  inputMapping:'keyboard:enter',
  inputMappingAuthoritative:false,
  materialHierarchy:['canvas','surface','glaze'],
  materialHierarchyAuthoritative:false,
  accessibilityOverrides:['forced-colors'],
  accessibilityOverridesAuthoritative:false,
  targetSizePx:48,
  minimumTargetSizePx:44,
  targetSizeAuthoritative:false,
  migrationState:'migration-required',
  migrationStateAuthoritative:false
});
assert(evidence.focusBehavior.accepted===null&&evidence.focusBehavior.withheldWithoutAuthority===true,'untrusted focus must be withheld');
assert(evidence.inputMapping.accepted===null&&evidence.inputMapping.withheldWithoutAuthority===true,'untrusted input mapping must be withheld');
assert(evidence.materialHierarchy.accepted===null,'untrusted material hierarchy must be withheld');
assert(evidence.accessibilityOverrides.accepted===null,'untrusted accessibility overrides must be withheld');
assert(evidence.targetSizes.status==='unverified'&&evidence.targetSizes.minimumInventedByInspector===false,'target-size evidence must remain unverified');
assert(evidence.migrationState.accepted==='unknown','untrusted migration state must fail closed');

const trustedTarget=inspectGlazeElement({
  ...base,
  targetSizePx:48,
  minimumTargetSizePx:44,
  targetSizeAuthoritative:true,
  focusId:'theme-preview',
  focusAuthoritative:true,
  inputMapping:'keyboard:enter',
  inputMappingAuthoritative:true,
  materialHierarchy:['canvas','surface','glaze'],
  materialHierarchyAuthoritative:true,
  accessibilityOverrides:['forced-colors'],
  accessibilityOverridesAuthoritative:true,
  migrationState:'current',
  migrationStateAuthoritative:true,
  consistency:{evidence:{tokens:true,colors:true},findings:{}},
  developerDiagnostics:{contrastSufficient:true,targetSizeAccessible:true}
});
assert(trustedTarget.targetSizes.status==='pass','authoritative target-size evidence should pass supplied minimum');
assert(trustedTarget.focusBehavior.accepted==='theme-preview','authoritative focus lost');
assert(trustedTarget.inputMapping.accepted==='keyboard:enter','authoritative input mapping lost');
assert(Array.isArray(trustedTarget.materialHierarchy.accepted)&&trustedTarget.materialHierarchy.accepted.length===3,'material hierarchy lost');
assert(trustedTarget.migrationState.accepted==='current','authoritative migration state lost');
assert(trustedTarget.consistency!==null&&trustedTarget.consistency.authority.sourceModifiedAutomatically===false,'consistency Inspector integration missing');
assert(trustedTarget.developerDiagnostics!==null&&trustedTarget.developerDiagnostics.safety.autofixExecuted===false,'developer diagnostics integration must not autofix');

assert(glazeV17InspectorDevelopmentContract.version==='1.7.0-dev.11','runtime contract version mismatch');
assert(glazeV17InspectorDevelopmentContract.section26Complete===false,'runtime must not claim Section 26 complete');
assert(glazeV17InspectorDevelopmentContract.sourceMutationAllowed===false,'runtime source mutation boundary weakened');
assert(glazeV17InspectorDevelopmentContract.acceptanceGrantedByInspector===false,'runtime acceptance boundary weakened');

const aggregateVersionParts=String(glazeV17Development.version).split('-dev.');
const aggregateDevelopmentRevision=Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0]==='1.7.0' && Number.isInteger(aggregateDevelopmentRevision) && aggregateDevelopmentRevision>=11,
  'aggregate Development version must retain or advance beyond Glaze Inspector dev.11'
);
assert(glazeV17Development.lifecycle==='development'&&glazeV17Development.stableBaseline==='1.6.0'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const n of [7,8,9,10,11,12,13,18,19,21,24,25,26])assert(glazeV17Development.planV11FoundationSections.includes(n),`aggregate missing v1.1 foundation ${n}`);
assert(glazeV17Development.inspectorFoundation==='js/glaze-v1.7-inspector.dev.mjs','aggregate missing dev.11 Inspector foundation');
assert(glazeV17Development.expandedComponentSystemFoundation==='js/glaze-v1.7-expanded-component-system.dev.mjs','aggregate lost dev.10');
assert(glazeV17Development.nativeGlazeKitsFoundation==='js/glaze-v1.7-native-glaze-kits.dev.mjs','aggregate lost dev.9');
assert(glazeV17Development.themeSemanticColorFoundation==='js/glaze-v1.7-theme-semantic-color.dev.mjs','aggregate lost dev.8');
assert(glazeV17Development.providerTruthManufactured===false,'aggregate provider-truth boundary weakened');

assert(planned.includes('1.7.0-dev.11')&&planned.includes('Glaze Inspector'),'planned control missing dev.11');
assert(planned.includes('1.7.0-dev.10')&&planned.includes('Expanded Component System'),'planned control lost dev.10 provenance');
assert(implemented.includes('Glaze Inspector — `1.7.0-dev.11`'),'implemented control missing dev.11');
assert(changelog.includes('1.7.0-dev.11')&&changelog.includes('Glaze Inspector'),'changelog missing dev.11');

console.log('GLAZE UI V1.7 Glaze Inspector Development foundation: PASS');
console.log('Inspection domains: 13');
console.log('Resolution provenance sources: 6');
console.log('Section 26 complete: false');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
