import test from 'node:test';
import assert from 'node:assert/strict';
import {thirdPartyAssetCatalog, resolveThirdPartyAsset, listThirdPartyAssets} from '../js/third-party-assets.development.mjs';

test('all entries are immutable, locally packaged, and attributed',()=>{
  assert.ok(Object.isFrozen(thirdPartyAssetCatalog.assets));
  for(const a of thirdPartyAssetCatalog.assets){
    assert.ok(Object.isFrozen(a));
    const resolved=resolveThirdPartyAsset(a.id);
    assert.ok(Object.isFrozen(resolved));
    assert.match(resolved.assetPath,/^assets\/third-party\//);
    assert.match(resolved.sourceRevision,/^[a-f0-9]{40}$/);
    assert.ok(resolved.licensePath.startsWith('licenses/third-party/'));
  }
});
test('explicit opt-in discovery supports provider and category',()=>{
  assert.equal(listThirdPartyAssets().length,6);
  assert.equal(listThirdPartyAssets({provider:'TABLER'}).length,2);
  assert.equal(listThirdPartyAssets({category:'layout'}).length,2);
  assert.equal(listThirdPartyAssets({query:'sparkles'})[0].provider,'lucide');
  assert.ok(Object.isFrozen(listThirdPartyAssets()));
});
test('unknown, hostile and first-party identifiers fail closed',()=>{
  for(const id of ['ui.action.search','glyph.status.unavailable','../foo','https://example.org/icon','__proto__',null,{}])
    assert.equal(resolveThirdPartyAsset(id),null);
  assert.equal(resolveThirdPartyAsset(' THIRDPARTY.LUCIDE.SPARKLES ').id,'thirdparty.lucide.sparkles');
});
