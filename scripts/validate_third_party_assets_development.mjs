#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {thirdPartyAssetCatalog as catalog, resolveThirdPartyAsset} from '../js/third-party-assets.development.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'registry/third-party-assets.development.json'),'utf8'));
assert.deepEqual(catalog, manifest, 'browser data mirror must match JSON manifest');
assert.equal(catalog.lifecycle,'Development');
assert.equal(catalog.stableBaseline,'1.7.0');
assert.equal(catalog.consumerEligible,false);
assert.equal(catalog.networkRequired,false);
assert.ok(Object.isFrozen(catalog) && Object.isFrozen(catalog.assets));
const providers = new Map(catalog.providers.map(p => [p.id,p]));
assert.equal(providers.size,3,'exactly three vetted providers in initial tranche');
assert.deepEqual([...providers.keys()].sort(),['heroicons','lucide','tabler']);
const ids=new Set();
const assetsRoot = fs.realpathSync(path.join(root,'assets','third-party'));
const licenseRoot = fs.realpathSync(path.join(root,'licenses','third-party'));
function confined(relative, prefix, realRoot) {
  assert.equal(typeof relative,'string');
  assert.ok(relative.startsWith(prefix),`incorrect asset prefix: ${relative}`);
  assert.ok(!relative.includes('\\') && !relative.includes('..') && !relative.includes('//'),`noncanonical path: ${relative}`);
  const resolved=fs.realpathSync(path.join(root,relative));
  assert.ok(resolved.startsWith(realRoot+path.sep),`path escaped root: ${relative}`);
  return resolved;
}
for(const p of catalog.providers){
  assert.match(p.id,/^[a-z]+$/);
  assert.match(p.revision,/^[a-f0-9]{40}$/);
  assert.ok(/^https:\/\/github\.com\/[a-z0-9-]+\/[a-z0-9-]+$/i.test(p.repository));
  assert.ok(['MIT','ISC'].includes(p.license));
  const content=fs.readFileSync(confined(p.licensePath,'licenses/third-party/',licenseRoot),'utf8');
  assert.ok(content.includes(p.license==='MIT'?'MIT License':'ISC License'),`license missing: ${p.id}`);
  assert.ok(content.includes('Copyright'),`copyright missing: ${p.id}`);
}
assert.equal(catalog.assets.length,6);
for(const a of catalog.assets){
  assert.match(a.id,/^thirdparty\.[a-z]+\.[a-z0-9-]+$/);
  assert.ok(!ids.has(a.id),`duplicate ID: ${a.id}`);ids.add(a.id);
  assert.ok(providers.has(a.provider),`unknown provider: ${a.provider}`);
  assert.equal(a.id,`thirdparty.${a.provider}.${a.name}`);
  assert.ok(a.label.trim() && a.accessibleName.trim());
  assert.equal(a.rtl,'preserve');assert.equal(a.geometry,'24x24');
  assert.equal(a.lifecycle,'development');
  assert.equal(a.assetPath,`assets/third-party/${a.provider}/${a.name}.svg`);
  assert.match(a.upstreamPath,/^[a-z0-9/.\-]+\.svg$/);
  const svg=fs.readFileSync(confined(a.assetPath,'assets/third-party/',assetsRoot),'utf8');
  // Only inert, self-contained vector markup. Do not allow links, script, embedded payloads or animation.
  assert.match(svg,/<svg\b/i,`svg root missing: ${a.id}`);
  assert.match(svg,/viewBox\s*=\s*["']0 0 24 24["']/i,`unexpected geometry: ${a.id}`);
  assert.match(svg,/currentColor/,`semantic color inheritance missing: ${a.id}`);
  // The sole allowed HTTP URL is the XML namespace declaration; it is not a fetched asset.
  // Verify and remove that literal before rejecting every other remote URL or active payload.
  assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'), `canonical SVG namespace missing: ${a.id}`);
  const sanitizedNamespace = svg.replace('xmlns="http://www.w3.org/2000/svg"', 'xmlns="verified-svg-namespace"');
  assert.doesNotMatch(sanitizedNamespace,/<!(?:DOCTYPE|ENTITY)|<\?xml-stylesheet|<\s*(?:script|style|foreignObject|iframe|object|embed|image|use|a|animate|set)\b|\son[a-z]+\s*=|(?:xlink:)?href\s*=|\b(?:javascript|data|file|https?):|url\s*\(|@import/gi,`unsafe SVG markup: ${a.id}`);
  const uncommented = svg.replace(/<!--[\s\S]*?-->/g,'');
  for(const match of uncommented.matchAll(/<\s*\/?\s*([A-Za-z][A-Za-z0-9-]*)\b/g)) {
    assert.ok(new Set(['svg','path','circle','rect','line','polyline','polygon','ellipse','g']).has(match[1]),`unsupported element ${match[1]} in ${a.id}`);
  }
  assert.equal(resolveThirdPartyAsset(a.id).assetPath,a.assetPath);
}
assert.equal(resolveThirdPartyAsset('ui.action.search'),null,'first-party IDs must not be shadowed');
assert.equal(resolveThirdPartyAsset('../secret'),null);
const stable=fs.readFileSync(path.join(root,'js/glaze-v1.7.0.mjs'),'utf8');
assert.ok(!stable.includes('third-party-assets'),'stable entrypoint must remain isolated');
console.log('Validated 3 licensed providers and 6 Development-only local SVG assets.');
