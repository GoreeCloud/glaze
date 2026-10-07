import {iconGlyphRegistryData} from './icon-glyph-registry.data.mjs';

const canonical = new Map(iconGlyphRegistryData.entries.map(entry => [entry.id, entry]));
const aliases = new Map(iconGlyphRegistryData.aliases.map(alias => [alias.id, alias]));
const norm = value => String(value ?? '').trim().toLowerCase();

export const iconGlyphRegistry = iconGlyphRegistryData;

export function resolveIconGlyph(requestedId, options = {}) {
  const requested = norm(requestedId);
  const alias = aliases.get(requested) ?? null;
  let entry = canonical.get(alias?.target ?? requested) ?? null;
  let usedFallback = false;

  if (!entry && options.fallback !== false) {
    entry = canonical.get(iconGlyphRegistryData.fallbackPolicy.unknownId) ?? null;
    usedFallback = Boolean(entry);
  }
  if (!entry) return null;

  const requestedSize = norm(options.size || 'standard');
  const requestedVariant = norm(options.variant || entry.variants[0]);
  const size = entry.opticalSizes.includes(requestedSize)
    ? requestedSize
    : (entry.opticalSizes.includes('standard') ? 'standard' : entry.opticalSizes[0]);
  const variant = entry.variants.includes(requestedVariant) ? requestedVariant : entry.variants[0];

  return Object.freeze({
    requestedId: requested,
    canonicalId: entry.id,
    usedFallback,
    deprecatedAlias: alias ? Object.freeze({...alias}) : null,
    namespace: entry.namespace,
    concept: entry.concept,
    category: entry.category,
    meaning: entry.meaning,
    size,
    variant,
    rtlMirrored: Boolean(options.rtl) && entry.rtl.behavior === 'mirror',
    source: Object.freeze({...entry.source}),
    accessibility: Object.freeze({...entry.accessibility}),
    semantic: Object.freeze({...entry.semantic}),
    lifecycle: Object.freeze({...entry.lifecycle})
  });
}

export function searchIconGlyphs(query, options = {}) {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  const namespace = options.namespace ? norm(options.namespace) : null;
  const category = options.category ? norm(options.category) : null;

  return iconGlyphRegistryData.entries
    .filter(entry => !namespace || entry.namespace === namespace)
    .filter(entry => !category || entry.category === category)
    .filter(entry => {
      if (!terms.length) return true;
      const haystack = norm([
        entry.id, entry.concept, entry.category, entry.meaning,
        entry.accessibility.defaultName, entry.semantic.role ?? ''
      ].join(' '));
      return terms.every(term => haystack.includes(term));
    })
    .slice()
    .sort((a,b) => a.id.localeCompare(b.id))
    .map(entry => Object.freeze({
      id:entry.id, namespace:entry.namespace, concept:entry.concept,
      category:entry.category, meaning:entry.meaning
    }));
}

export function listIconGlyphIds({namespace} = {}) {
  const wanted = namespace ? norm(namespace) : null;
  return iconGlyphRegistryData.entries
    .filter(entry => !wanted || entry.namespace === wanted)
    .map(entry => entry.id)
    .sort();
}

export function getIconGlyphRegistryCapabilities() {
  return Object.freeze({
    schemaVersion:iconGlyphRegistryData.schemaVersion,
    registryVersion:iconGlyphRegistryData.registryVersion,
    lifecycle:iconGlyphRegistryData.lifecycle,
    stableBaseline:iconGlyphRegistryData.stableBaseline,
    consumerEligible:iconGlyphRegistryData.consumerEligible,
    networkRequired:iconGlyphRegistryData.fallbackPolicy.networkRequired,
    namespaces:Object.freeze(Object.keys(iconGlyphRegistryData.namespaces).sort())
  });
}
