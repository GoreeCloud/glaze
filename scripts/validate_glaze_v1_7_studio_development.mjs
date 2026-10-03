#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createGlazeStudioSession,proposeGlazeStudioThemeDraft,resolveGlazeStudioScene,compareGlazeStudioScenes,glazeV17StudioDevelopmentContract} from '../js/glaze-v1.7-studio.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/studio.dev.json');
const schema=json('schemas/v1.7-glaze-studio.schema.json');
const tokens=json('tokens/glaze-v1.7-studio.dev.json');
const lifecycle=json('registry/lifecycle.json');
const stable=read('VERSION').trim();
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');

const axes=["components","semantic-states","theme-presets","user-created-themes","color-families","appearance-modes","expression-modes","form-factors","adaptive-layouts","motion","loading-behavior","error-states","accessibility-configurations","platform-mappings"];

assert(stable==='1.7.0','dev.12 must coexist with bounded Glaze V1.7 / 1.7.0 Stable');
assert(lifecycle.currentOfficial===stable&&lifecycle.currentStable===stable,'Stable authority mismatch');
assert(lifecycle.activeCandidate===null&&lifecycle.activePatchReleaseCandidate===null,'dev.12 must not create Candidate state');
assert(lifecycle.plannedNext==='1.7.1','dev.12 must not mutate plannedNext');

assert(spec.includes('## 40. Glaze Studio'),'V1.7 v1.2 specification missing Glaze Studio Section 40');
assert(spec.includes('dev.8–dev.13 use the prior v1.1 35-section numbering'),'v1.2 plan must preserve v1.1 implementation-numbering provenance');
for(const phrase of ['Signature transitions','Motion profiles','Components','Themes','Accessibility modes','Input models','Semantic states']) {
  assert(spec.includes(phrase),`V1.7 v1.2 Studio requirement missing: ${phrase}`);
}

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema version mismatch');
assert(contract.version==='1.7.0-dev.12'&&contract.lifecycle==='Development'&&contract.consumerEligible===false,'contract lifecycle mismatch');
assert(contract.planVersion==='v1.1','plan version mismatch');
assert(JSON.stringify(contract.v11SpecificationSections)===JSON.stringify([27]),'Section 27 marker mismatch');
assert(JSON.stringify(contract.explorationAxes)===JSON.stringify(axes),'Studio exploration axes mismatch');
assert(contract.studioCapabilities.themeDraftCreation===true&&contract.studioCapabilities.themeDraftPersistence===false,'theme draft boundary mismatch');
assert(contract.studioCapabilities.themeManagerReplaced===false&&contract.studioCapabilities.repositoryContractsReplaced===false,'Studio replacement boundary weakened');
assert(contract.authority.advisoryOnly===true&&contract.authority.acceptanceGrantedByStudio===false,'Studio authority boundary weakened');
assert(contract.privacy.localFirst===true&&contract.privacy.telemetryRequired===false&&contract.privacy.networkRequired===false,'Studio local-first/privacy boundary weakened');
assert(contract.privacy.executableThemeCodeAllowed===false&&contract.privacy.remoteTrackersAllowed===false,'Studio theme safety boundary weakened');
assert(contract.acceptanceBoundary.section27Complete===false&&contract.acceptanceBoundary.humanReviewRequired===true,'Studio acceptance boundary mismatch');
for(const source of Object.values(contract.integrationFoundations))assert(fs.existsSync(path.join(root,source)),`missing Studio integration source: ${source}`);

assert(tokens.version==='1.7.0-dev.12'&&tokens.consumerEligible===false,'token lifecycle mismatch');
assert(tokens.themeDraft.localOnly===true&&tokens.themeDraft.persistenceAutomatic===false&&tokens.themeDraft.applyAutomatic===false,'token draft boundary mismatch');
assert(tokens.preview.renderedEvidenceClaimed===false&&tokens.preview.humanReviewClaimed===false,'token preview must not claim acceptance evidence');

const session=createGlazeStudioSession({role:'designer',sessionId:'review-1'});
assert(session.role==='designer'&&session.explorationAxes.length===14,'Studio session catalog mismatch');
assert(session.localOnly===true&&session.repositoryContractsReplaced===false&&session.acceptanceGrantedByStudio===false,'Studio session authority boundary weakened');

const draft=proposeGlazeStudioThemeDraft({
  draftId:'theme-a',
  appearanceMode:'dark',
  expressionMode:'expressive',
  requestedPreferences:{accentFamily:'glaze-default',materialIntensity:'expressive',motionIntensity:'expressive'}
});
assert(draft.preview.action==='preview','Studio theme creation must remain preview-only');
assert(draft.persistenceAutomatic===false&&draft.applyAutomatic===false,'Studio theme draft must not persist/apply automatically');
assert(draft.themeManagerReplaced===false&&draft.executableCodeAllowed===false&&draft.remoteTrackersAllowed===false,'Theme Manager/safety boundary weakened');

const unresolvedSystem=proposeGlazeStudioThemeDraft({appearanceMode:'follow-system',resolvedSystemAppearance:'dark',systemAppearanceAuthoritative:false});
assert(unresolvedSystem.resolvedSystemAppearance.verified===false,'unauthoritative system appearance must remain unverified');
assert(unresolvedSystem.resolvedSystemAppearance.effective==='light','unauthoritative follow-system preview must fail closed to bounded fallback');

const resolvedSystem=proposeGlazeStudioThemeDraft({appearanceMode:'follow-system',resolvedSystemAppearance:'dark',systemAppearanceAuthoritative:true});
assert(resolvedSystem.resolvedSystemAppearance.verified===true&&resolvedSystem.resolvedSystemAppearance.effective==='dark','authoritative follow-system preview lost');

const baseScene={
  component:'GlzThemePreview',
  profile:'mobile',
  sceneState:'warning',
  sceneStateAuthoritative:false,
  semanticColorRole:'warning',
  semanticColorAuthoritative:false,
  appearanceMode:'dark',
  expressionMode:'balanced',
  glazeDefaultThemeToken:'glaze.default',
  previousTaskState:{navigationDestination:'settings',focusId:'theme-preview',draftText:'preserve'}
};
const scene=resolveGlazeStudioScene(baseScene);
assert(scene.sceneState.simulation===true&&scene.sceneState.providerTruthCreatedByStudio===false,'Studio simulation must not become provider truth');
assert(scene.inspector.component.id==='GlzThemePreview','Inspector integration lost component identity');
assert(scene.inspector.component.taskState.draftText==='preserve','Studio must preserve task continuity');
assert(scene.previews.renderedEvidenceClaimed===false&&scene.previews.humanReviewClaimed===false,'Studio preview overclaims acceptance');
assert(scene.authority.repositoryContractsReplaced===false&&scene.authority.acceptanceGrantedByStudio===false,'Studio repository/acceptance boundary weakened');

const nativeScene=resolveGlazeStudioScene({
  ...baseScene,
  platform:'android-compose',
  profile:'mobile',
  nativeSemanticRole:'surface',
  capabilityState:'available',
  capabilityAuthoritative:true,
  systemAppearanceApiState:'available',
  systemAppearanceApiAuthoritative:true,
  platformColorApiState:'available',
  platformColorApiAuthoritative:true
});
assert(nativeScene.nativeMapping.platform==='android-compose','Studio native mapping preview missing');
assert(nativeScene.nativeMapping.acceptanceBoundary.nativeDeviceAcceptanceRequired===true,'Studio must not convert mapping preview into native acceptance');

const comparison=compareGlazeStudioScenes({
  scenes:[
    {...baseScene,sceneId:'light-scene',appearanceMode:'light'},
    {...baseScene,sceneId:'dark-scene',appearanceMode:'dark'}
  ]
});
assert(comparison.scenes.length===2&&comparison.acceptedWinner===null,'Studio comparison must remain non-ranking and non-accepting');
assert(comparison.acceptanceGrantedByStudio===false&&comparison.lifecyclePromotionAutomatic===false,'Studio comparison authority boundary weakened');

for(const bad of [
  ()=>createGlazeStudioSession({role:'operator'}),
  ()=>proposeGlazeStudioThemeDraft({appearanceMode:'neon'}),
  ()=>resolveGlazeStudioScene({...baseScene,sceneState:'invented'}),
  ()=>compareGlazeStudioScenes({scenes:[baseScene]})
]){
  let failed=false;try{bad();}catch{failed=true;}assert(failed,'unsupported Studio input must fail closed');
}

assert(glazeV17StudioDevelopmentContract.version==='1.7.0-dev.12','runtime contract version mismatch');
assert(glazeV17StudioDevelopmentContract.section27Complete===false&&glazeV17StudioDevelopmentContract.consumerEligible===false,'runtime lifecycle overclaim');
assert(glazeV17StudioDevelopmentContract.themeDraftPersistence===false&&glazeV17StudioDevelopmentContract.repositoryContractsReplaced===false,'runtime Studio boundary weakened');

const aggregateVersionParts=String(glazeV17Development.version).split('-dev.');
const aggregateDevelopmentRevision=Number(aggregateVersionParts[1]);
assert(
  aggregateVersionParts[0]==='1.7.0' && Number.isInteger(aggregateDevelopmentRevision) && aggregateDevelopmentRevision>=12,
  'aggregate Development version must retain or advance beyond Glaze Studio dev.12'
);
assert(glazeV17Development.lifecycle==='development'&&glazeV17Development.stableBaseline==='1.6.0'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const n of [7,8,9,10,11,12,13,18,19,21,24,25,26,27])assert(glazeV17Development.planV11FoundationSections.includes(n),`aggregate missing v1.1 foundation ${n}`);
assert(glazeV17Development.studioFoundation==='js/glaze-v1.7-studio.dev.mjs','aggregate missing dev.12 Studio foundation');
assert(glazeV17Development.inspectorFoundation==='js/glaze-v1.7-inspector.dev.mjs','aggregate lost dev.11');
assert(glazeV17Development.expandedComponentSystemFoundation==='js/glaze-v1.7-expanded-component-system.dev.mjs','aggregate lost dev.10');
assert(glazeV17Development.nativeGlazeKitsFoundation==='js/glaze-v1.7-native-glaze-kits.dev.mjs','aggregate lost dev.9');
assert(glazeV17Development.themeSemanticColorFoundation==='js/glaze-v1.7-theme-semantic-color.dev.mjs','aggregate lost dev.8');
assert(glazeV17Development.providerTruthManufactured===false,'aggregate provider-truth boundary weakened');

assert(planned.includes('1.7.0-dev.12')&&planned.includes('Glaze Studio'),'planned control missing dev.12');
assert(planned.includes('1.7.0-dev.11')&&planned.includes('Glaze Inspector'),'planned control lost dev.11 provenance');
assert(implemented.includes('Glaze Studio — `1.7.0-dev.12`'),'implemented control missing dev.12');
assert(changelog.includes('1.7.0-dev.12')&&changelog.includes('Glaze Studio'),'changelog missing dev.12');

console.log('GLAZE UI V1.7 Glaze Studio Development foundation: PASS');
console.log('Exploration axes: 14');
console.log('Theme draft persistence: false');
console.log('Section 27 complete: false');
console.log('Stable baseline preserved: 1.6.0');
console.log('Consumer eligible: false');
