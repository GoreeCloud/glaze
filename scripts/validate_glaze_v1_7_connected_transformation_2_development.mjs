#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  resolveGlazeConnectedTransformation,
  glazeV17ConnectedTransformation2DevelopmentContract
} from '../js/glaze-v1.7-connected-transformation-2.dev.mjs';
import {glazeV17SignatureTransitionFamiliesDevelopmentContract} from '../js/glaze-v1.7-signature-transition-families.dev.mjs';
import {glazeV17Development} from '../js/glaze-v1.7-development.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contract=json('contracts/v1.7/connected-transformation-2.dev.json');
const schema=json('schemas/v1.7-connected-transformation-2.schema.json');
const tokens=json('tokens/glaze-v1.7-connected-transformation-2.dev.json');
const lifecycle=json('registry/lifecycle.json');
const spec=read('GLAZE_UI_V1_7_PLANNED.md');
const planned=read('PLANNED-FEATURES.md');
const implemented=read('IMPLEMENTED-FEATURES.md');
const changelog=read('CHANGELOGS.md');
const glazeMotion=json('tokens/glaze-motion.json');

const connections=[
  'search-control-to-search-interface',
  'navigation-item-to-destination',
  'app-icon-to-application-surface',
  'card-to-detail-view',
  'thumbnail-to-viewer',
  'quick-setting-to-expanded-setting',
  'compact-player-to-full-player',
  'folder-to-folder-contents',
  'notification-to-related-event',
  'widget-to-expanded-experience',
  'command-result-to-resulting-interface',
  'compact-pane-to-expanded-pane'
];
const objectConnections=new Set([
  'search-control-to-search-interface',
  'card-to-detail-view',
  'thumbnail-to-viewer',
  'quick-setting-to-expanded-setting',
  'compact-player-to-full-player',
  'widget-to-expanded-experience',
  'compact-pane-to-expanded-pane'
]);
const taskConnections=new Set([
  'navigation-item-to-destination',
  'app-icon-to-application-surface',
  'folder-to-folder-contents',
  'notification-to-related-event',
  'command-result-to-resulting-interface'
]);

assert(read('VERSION').trim()==='1.7.0','bounded V1.7 VERSION changed');
assert(lifecycle.currentOfficial==='1.7.0'&&lifecycle.currentStable==='1.7.0'&&lifecycle.currentLifecycle==='anchor','V1.6 Anchor authority changed');
assert(lifecycle.activeCandidate===null&&lifecycle.plannedNext==='1.7.1','dev.17 must not create lifecycle promotion state');

for(const phrase of [
  '## 25. Connected Transformation 2.0',
  'Search control → Search interface',
  'Navigation item → Destination',
  'App icon → Application surface where platform appropriate',
  'Card → Detail view',
  'Thumbnail → Viewer',
  'Quick setting → Expanded setting',
  'Compact player → Full player',
  'Folder → Folder contents',
  'Notification → Related event',
  'Widget → Expanded experience',
  'Command result → Resulting interface',
  'Compact pane → Expanded pane',
  'A connected animation must never invent a relationship that does not actually exist.',
  'When identity is unclear, Glaze should fall back to a standard transition.'
]) assert(spec.includes(phrase),'Section 25 requirement missing: '+phrase);

assert(schema.$schema==='https://json-schema.org/draft/2020-12/schema','schema draft mismatch');
assert(contract.version==='1.7.0-dev.17'&&contract.planVersion==='v1.2'&&contract.consumerEligible===false,'dev.17 contract identity mismatch');
assert(JSON.stringify(contract.v12SpecificationSections)===JSON.stringify([25]),'dev.17 section marker mismatch');
assert(contract.dependsOn.signatureTransitionFamiliesVersion==='1.7.0-dev.16','dev.16 dependency mismatch');
assert(JSON.stringify(contract.connectionOrder)===JSON.stringify(connections),'connection order mismatch');
assert(Object.keys(contract.connectionPolicy).length===12,'connection policy count mismatch');
assert(contract.requestPolicy.connectionAuthorityRequired===true&&contract.requestPolicy.connectionIdentityAuthorityRequired===true,'connection authority boundary weakened');
assert(contract.requestPolicy.arbitraryRelationshipRequestAccepted===false&&contract.requestPolicy.directFamilyRequestAccepted===false,'direct relationship/family request boundary weakened');
assert(contract.requestPolicy.appSurfaceConnectionRequiresAuthoritativePlatformSupport===true,'app-surface platform boundary weakened');
assert(contract.continuity.preserveIdentityPreferentially===true&&contract.continuity.unclearIdentityFallsBackToStandardTransition===true,'identity/fallback boundary weakened');
assert(contract.continuity.stateDependsOnAnimationCompletion===false&&contract.continuity.navigationDependsOnAnimationCompletion===false&&contract.continuity.taskCompletionDependsOnAnimationCompletion===false,'motion state dependency introduced');
assert(contract.authority.connectionRelationshipCreatedByGlaze===false&&contract.authority.connectionIdentityCreatedByGlaze===false,'connection authority manufactured');
assert(contract.authority.platformSupportCreatedByGlaze===false&&contract.authority.providerTruthCreatedByGlaze===false,'platform/provider authority manufactured');
assert(contract.accessibility.reducedMotionPrecedence===true&&contract.accessibility.motionRequiredToUnderstandRelationship===false,'accessibility boundary weakened');
assert(contract.performance.degradationMayRemoveRequiredSemantics===false&&contract.performance.measuredPerformanceAcceptanceEstablished===false,'performance boundary weakened');
assert(contract.acceptanceBoundary.connectedTransformationCatalogImplemented===true&&contract.acceptanceBoundary.section25Complete===false,'Section 25 source boundary mismatch');
assert(contract.acceptanceBoundary.renderedAcceptanceEstablished===false&&contract.acceptanceBoundary.nativePlatformAcceptanceEstablished===false,'acceptance overclaim');
assert(contract.glazeMotionBoundary.experimentalLifecyclePromoted===false,'Glaze Motion lifecycle promoted');

assert(tokens.version==='1.7.0-dev.17'&&tokens.planVersion==='v1.2','token identity mismatch');
assert(tokens.fallbacks.missingConnectionIdentity==='standard-transition','missing identity fallback missing');
assert(tokens.fallbacks.unsupportedPlatformConnection==='standard-transition','platform fallback missing');
assert(tokens.boundaries.section25Complete===false&&tokens.boundaries.glazeMotionExperimentalLifecyclePromoted===false,'token lifecycle/completion boundary weakened');

for(const connection of connections){
  const input={
    connection,
    connectionAuthoritative:true,
    connectionIdentity:'connection-42',
    connectionIdentityAuthoritative:true,
    fromState:'before',
    toState:'after'
  };
  if(connection==='app-icon-to-application-surface'){
    input.platformConnectionSupported=true;
    input.platformConnectionSupportAuthoritative=true;
  }
  const resolved=resolveGlazeConnectedTransformation(input);
  const policy=contract.connectionPolicy[connection];
  assert(resolved.version==='1.7.0-dev.17','runtime version mismatch: '+connection);
  assert(resolved.sourceFoundation.connectionAccepted===true,'connection rejected: '+connection);
  assert(resolved.sourceFoundation.acceptedConnection===connection,'accepted connection mismatch: '+connection);
  assert(resolved.transformation.mode==='connected-transformation','connected mode missing: '+connection);
  assert(resolved.transformation.semanticRelationship===policy.relationship,'semantic relationship mismatch: '+connection);
  assert(resolved.transformation.family===policy.family,'family mismatch: '+connection);
  assert(resolved.transformation.connectionRelationshipInventedByGlaze===false,'relationship invention enabled: '+connection);
  assert(resolved.continuity.stateDependsOnAnimationCompletion===false,'state dependency introduced: '+connection);
  assert(resolved.authority.providerTruthCreatedByGlaze===false,'provider truth boundary weakened: '+connection);
  if(objectConnections.has(connection)){
    assert(resolved.continuity.objectIdentityPreserved===true&&resolved.continuity.taskIdentityPreserved===false,'object identity classification mismatch: '+connection);
  }
  if(taskConnections.has(connection)){
    assert(resolved.continuity.taskIdentityPreserved===true&&resolved.continuity.objectIdentityPreserved===false,'task identity classification mismatch: '+connection);
  }
}

for(const connection of ['card-to-detail-view','navigation-item-to-destination']){
  for(const connectionIdentity of [undefined,null,'','   ']){
    const resolved=resolveGlazeConnectedTransformation({
      connection,
      connectionAuthoritative:true,
      connectionIdentity,
      connectionIdentityAuthoritative:true
    });
    assert(resolved.sourceFoundation.connectionAccepted===false,'unclear identity accepted: '+connection);
    assert(resolved.transformation.mode==='standard-transition','unclear identity did not fall back: '+connection);
    assert(resolved.connection.fallbackReason==='unclear-identity','unclear identity fallback reason mismatch: '+connection);
  }
}

const untrustedConnection=resolveGlazeConnectedTransformation({
  connection:'card-to-detail-view',
  connectionAuthoritative:false,
  connectionIdentity:'card-42',
  connectionIdentityAuthoritative:true
});
assert(untrustedConnection.sourceFoundation.connectionAccepted===false,'untrusted relationship accepted');
assert(untrustedConnection.connection.fallbackReason==='untrusted-connection','untrusted relationship fallback mismatch');

const untrustedIdentity=resolveGlazeConnectedTransformation({
  connection:'card-to-detail-view',
  connectionAuthoritative:true,
  connectionIdentity:'card-42',
  connectionIdentityAuthoritative:false
});
assert(untrustedIdentity.sourceFoundation.connectionAccepted===false,'untrusted identity accepted');
assert(untrustedIdentity.connection.identity.withheldWithoutAuthority===true,'untrusted identity was not withheld');

const appUnsupported=resolveGlazeConnectedTransformation({
  connection:'app-icon-to-application-surface',
  connectionAuthoritative:true,
  connectionIdentity:'app-task-42',
  connectionIdentityAuthoritative:true,
  platformConnectionSupported:true,
  platformConnectionSupportAuthoritative:false
});
assert(appUnsupported.sourceFoundation.connectionAccepted===false,'app-surface connection accepted without platform authority');
assert(appUnsupported.connection.fallbackReason==='unsupported-platform-connection','app-surface platform fallback mismatch');

const reduced=resolveGlazeConnectedTransformation({
  connection:'card-to-detail-view',
  connectionAuthoritative:true,
  connectionIdentity:'card-42',
  connectionIdentityAuthoritative:true,
  accessibilityProfiles:['reduced-motion']
});
assert(reduced.accessibility.reducedMotionApplied===true,'Reduced Motion not applied');
assert(reduced.transformation.channels.find(x=>x.channel==='position').enabled===false,'Reduced Motion did not suppress connected position travel');
assert(reduced.accessibility.motionRequiredToUnderstandRelationship===false,'relationship understanding depends on motion');

for(const key of ['relationship','objectIdentity','family','durationMs','easing','spring','physics','keyframes','path','travelPx','distance','rotation','overshoot','bounce','wobble']){
  let failed=false;
  try{
    resolveGlazeConnectedTransformation({
      connection:'card-to-detail-view',
      connectionAuthoritative:true,
      connectionIdentity:'card-42',
      connectionIdentityAuthoritative:true,
      [key]:'arbitrary'
    });
  }catch{failed=true;}
  assert(failed,'direct/raw motion request accepted: '+key);
}

assert(glazeV17SignatureTransitionFamiliesDevelopmentContract.version==='1.7.0-dev.16','dev.16 identity changed');
assert(glazeV17SignatureTransitionFamiliesDevelopmentContract.section24Complete===false,'dev.16 relabeled as Section 24 complete');
assert(glazeMotion.glazeMotion.version==='0.6.0'&&glazeMotion.glazeMotion.status==='experimental','Glaze Motion 0.6 no longer Experimental');

assert(glazeV17ConnectedTransformation2DevelopmentContract.version==='1.7.0-dev.17','runtime contract version mismatch');
assert(glazeV17ConnectedTransformation2DevelopmentContract.section25Complete===false,'runtime contract completion overclaim');
const aggregateOrdinal=Number(glazeV17Development.version.match(/^1\.7\.0-dev\.(\d+)$/)?.[1]);
assert(Number.isInteger(aggregateOrdinal)&&aggregateOrdinal>=17,'aggregate version regressed below dev.17');
assert(glazeV17Development.planVersion==='v1.2'&&glazeV17Development.consumerEligible===false,'aggregate lifecycle mismatch');
for(const section of [22,23,24,25])assert(glazeV17Development.planV12FoundationSections.includes(section),'aggregate missing v1.2 section '+section);
assert(glazeV17Development.connectedTransformation2Foundation==='js/glaze-v1.7-connected-transformation-2.dev.mjs','aggregate missing dev.17 foundation');
assert(glazeV17Development.glazeMotionExperimentalLifecyclePromoted===false,'aggregate promoted Glaze Motion');

assert(spec.includes('dev.17 adds the bounded **Section 25 — Connected Transformation 2.0** source layer')&&spec.includes('dev.17 does **not** establish Section 25 completion'),'plan authority boundary missing dev.17 Section 25 provenance');
assert(planned.includes('1.7.0-dev.17')&&planned.includes('Connected Transformation 2.0'),'planned-feature control missing dev.17');
assert(implemented.includes('Connected Transformation 2.0 — `1.7.0-dev.17`'),'implemented-feature control missing dev.17');
assert(changelog.includes('1.7.0-dev.17')&&changelog.includes('Connected Transformation 2.0'),'changelog missing dev.17');

console.log('GLAZE UI V1.7 Connected Transformation 2.0 Development foundation: PASS');
console.log('Plan binding: v1.2 Section 25');
console.log('Governed connected relationships: 12');
console.log('Identity kinds: object + task');
console.log('Section 25 complete: false');
console.log('Rendered/native/performance acceptance: false');
console.log('Current bounded Anchor: 1.7.0; retained Development baseline: 1.6.0');
console.log('Consumer eligible: false');
