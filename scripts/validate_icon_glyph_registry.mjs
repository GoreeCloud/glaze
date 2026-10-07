#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

import {validateSchema} from './validate_json_schema_subset.mjs';
import {iconGlyphRegistryData} from '../js/icon-glyph-registry.data.mjs';
import {
  resolveIconGlyph, searchIconGlyphs, listIconGlyphIds, getIconGlyphRegistryCapabilities
} from '../js/icon-glyph-registry.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');

const assetsRoot = fs.realpathSync(path.resolve(root, 'assets'));
const normalizeAssetPath = rel => {
  const raw = String(rel ?? '');
  assert(raw.length > 0 && raw === raw.trim(), 'asset path must be non-empty and trimmed');
  assert(!raw.includes('\\'), `backslash asset path forbidden: ${raw}`);
  assert(!path.posix.isAbsolute(raw), `absolute asset path forbidden: ${raw}`);
  const normalized = path.posix.normalize(raw);
  assert(normalized === raw, `non-canonical asset path forbidden: ${raw}`);
  assert(normalized.startsWith('assets/'), `asset path escaped assets root: ${raw}`);
  const real = fs.realpathSync(path.resolve(root, normalized));
  assert(real.startsWith(`${assetsRoot}${path.sep}`), `asset path escaped real assets root: ${raw}`);
  return {rel: normalized, real};
};
const readAsset = rel => fs.readFileSync(normalizeAssetPath(rel).real, 'utf8');

const registry = json('registry/icon-glyph-registry.json');
const schema = json('schemas/icon-glyph-registry.schema.json');
const sprite = readAsset('assets/icon-glyphs/system-symbols.svg');
const docs = read('ICON_GLYPH_REGISTRY.md');
const gallery = read('reference/icon-glyph-registry.html');
const aggregate = read('js/glaze-v1.7.1-development.mjs');

const schemaErrors = validateSchema(registry, schema);
assert(schemaErrors.length === 0, `schema validation failed:\n${schemaErrors.join('\n')}`);
assert(JSON.stringify(registry) === JSON.stringify(iconGlyphRegistryData), 'generated data mirror diverged from registry JSON');
assert(Object.isFrozen(iconGlyphRegistryData), 'registry data root must be immutable');
assert(Object.isFrozen(iconGlyphRegistryData.namespaces), 'registry namespaces must be immutable');
assert(Object.isFrozen(iconGlyphRegistryData.fallbackPolicy), 'registry fallback policy must be immutable');
assert(Object.isFrozen(iconGlyphRegistryData.entries), 'registry entries collection must be immutable');
assert(Object.isFrozen(iconGlyphRegistryData.aliases), 'registry aliases collection must be immutable');
for (const entry of iconGlyphRegistryData.entries) {
  assert(Object.isFrozen(entry), `registry entry must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.source), `registry source must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.opticalSizes), `registry optical sizes must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.variants), `registry variants must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.rtl), `registry RTL metadata must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.accessibility), `registry accessibility metadata must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.theme), `registry theme metadata must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.theme.modes), `registry theme modes must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.semantic), `registry semantic metadata must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.provenance), `registry provenance must be immutable: ${entry.id}`);
  assert(Object.isFrozen(entry.lifecycle), `registry lifecycle metadata must be immutable: ${entry.id}`);
}
for (const alias of iconGlyphRegistryData.aliases) assert(Object.isFrozen(alias), `registry alias must be immutable: ${alias.id}`);

assert(registry.lifecycle === 'Development', 'registry must remain Development');
assert(registry.stableBaseline === '1.7.0', 'stable baseline must remain 1.7.0');
assert(registry.consumerEligible === false, 'development registry cannot be consumer eligible');
assert(registry.fallbackPolicy.networkRequired === false, 'ordinary lookup must remain local/offline');

const ids = registry.entries.map(entry => entry.id);
assert(new Set(ids).size === ids.length, 'canonical ID collision');
assert(ids.includes(registry.fallbackPolicy.unknownId), 'fallback ID missing');
assert(JSON.stringify(Object.keys(registry.namespaces).sort()) === JSON.stringify(['glyph','identity','ui']), 'namespace set changed');

const aliases = new Set();
for (const alias of registry.aliases) {
  assert(!ids.includes(alias.id), `alias collides with canonical ID: ${alias.id}`);
  assert(!aliases.has(alias.id), `duplicate alias: ${alias.id}`);
  aliases.add(alias.id);
  assert(ids.includes(alias.target), `alias target missing: ${alias.target}`);
}

const spriteHash = sha256(sprite);
const unsafe = [
  /<!DOCTYPE/i, /<!ENTITY/i, /<\?xml-stylesheet/i,
  /<\s*(?:script|foreignObject|iframe|object|embed|image|use|a|animate|set|animateTransform|animateMotion|mpath)\b/i,
  /\son[a-z]+\s*=/i, /(?:xlink:)?href\s*=/i,
  /@import/i, /\burl\s*\(\s*["']?\s*(?:https?:|data:|file:|javascript:|\/\/)/i, /\b(?:javascript|data|file):/i
];
for (const pattern of unsafe) assert(!pattern.test(sprite), `unsafe SVG content: ${pattern}`);

const allowedSvgElements = new Set([
  'svg','defs','style','symbol','g','path','circle','rect','line','polyline','polygon','ellipse'
]);
for (const match of sprite.matchAll(/<\s*\/?\s*([A-Za-z][A-Za-z0-9:-]*)\b/g)) {
  const element = match[1].toLowerCase();
  assert(allowedSvgElements.has(element), `unsupported SVG element: ${element}`);
}

const symbolIds = new Set([...sprite.matchAll(/<symbol\s+id="([^"]+)"/g)].map(match => match[1]));
for (const entry of registry.entries) {
  assert(gallery.includes(`<strong>${entry.id}</strong>`), `review gallery missing canonical entry: ${entry.id}`);
  assert(entry.id.startsWith(`${entry.namespace}.`), `namespace mismatch: ${entry.id}`);
  assert(entry.provenance.owner === 'GoreeCloud', `owner missing: ${entry.id}`);
  assert(entry.provenance.usageRights.trim(), `usage-right metadata missing: ${entry.id}`);
  assert(entry.accessibility.defaultName.trim(), `accessible name missing: ${entry.id}`);
  assert(entry.accessibility.colorIndependent === true, `color-dependent meaning forbidden: ${entry.id}`);
  assert(entry.theme.highContrast && entry.theme.forcedColors && entry.theme.reducedTransparency, `adaptive modes incomplete: ${entry.id}`);
  assert(['preserve','mirror'].includes(entry.rtl.behavior), `invalid RTL rule: ${entry.id}`);
  const assetPath = normalizeAssetPath(entry.source.asset).rel;

  if (entry.source.kind === 'svg-symbol') {
    assert(assetPath.startsWith('assets/icon-glyphs/'), `symbol asset escaped icon-glyph root: ${entry.id}`);
    assert(entry.source.sha256 === spriteHash, `sprite integrity mismatch: ${entry.id}`);
    assert(symbolIds.has(entry.source.symbol), `missing SVG symbol: ${entry.id}`);
  }
  if (entry.source.kind === 'identity-reference') {
    assert(entry.namespace === 'identity', `identity reference escaped identity namespace: ${entry.id}`);
    assert(assetPath.startsWith('assets/identity/official/'), `identity reference escaped official identity root: ${entry.id}`);
    assert(entry.source.symbol === null, `identity reference must not define a local symbol: ${entry.id}`);
    const identityAsset = readAsset(entry.source.asset);
    for (const pattern of unsafe) assert(!pattern.test(identityAsset), `unsafe identity SVG content for ${entry.id}: ${pattern}`);
    assert(sha256(identityAsset) === entry.source.sha256, `identity-reference integrity mismatch: ${entry.id}`);
  }
}

const protectedTokens = new Map([
  ['warning','semantic.warning'], ['privacy','semantic.privacy'],
  ['security','semantic.security'], ['unavailable','state.unavailable']
]);
for (const entry of registry.entries) {
  if (protectedTokens.has(entry.semantic.role)) {
    assert(entry.semantic.colorToken === protectedTokens.get(entry.semantic.role), `protected semantic token mismatch: ${entry.id}`);
  }
}

assert(resolveIconGlyph('ui.navigation.back', {rtl:true}).rtlMirrored === true, 'RTL back icon must mirror');
assert(resolveIconGlyph('ui.action.search', {rtl:true}).rtlMirrored === false, 'search icon must preserve geometry in RTL');
assert(resolveIconGlyph('ui.action.remove').canonicalId === 'ui.action.delete', 'deprecated alias resolution failed');
assert(resolveIconGlyph('not.registered').canonicalId === 'glyph.status.unavailable', 'unknown ID fallback failed');
assert(resolveIconGlyph('not.registered', {fallback:false}) === null, 'fail-closed no-fallback mode failed');
assert(searchIconGlyphs('warning').some(result => result.id === 'glyph.status.warning'), 'search index missing warning');
assert(listIconGlyphIds({namespace:'identity'}).length === 1, 'identity namespace list mismatch');
assert(gallery.includes('../assets/identity/official/facet/glaze-ui-mark.svg'), 'review gallery missing canonical identity asset');

const caps = getIconGlyphRegistryCapabilities();
assert(caps.lifecycle === 'Development' && caps.consumerEligible === false && caps.networkRequired === false, 'capability boundary mismatch');
assert(aggregate.includes("export * from './icon-glyph-registry.mjs';"), 'V1.7.1 aggregate must expose the registry resolver');
assert(aggregate.includes('iconGlyphRegistrySourceAvailable: true'), 'V1.7.1 aggregate must declare registry source availability');
assert(aggregate.includes('iconGlyphRegistryStableQualified: false'), 'V1.7.1 aggregate must not claim Stable registry qualification');
assert(aggregate.includes('iconGlyphRegistryConsumerAdoptionAutomatic: false'), 'registry source availability must not imply downstream adoption');

for (const phrase of [
  'Development foundation',
  'local-first and offline',
  'Identity Lock',
  'human visual and accessibility review',
  'does not manufacture provider truth',
  'FR-020'
]) assert(docs.includes(phrase), `documentation invariant missing: ${phrase}`);

console.log(`Glaze shared icon/glyph registry validation passed: ${registry.entries.length} entries, ${registry.aliases.length} aliases`);
