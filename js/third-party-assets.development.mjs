// Development-only third-party assets. No runtime network requests, external asset URLs, or stable imports.
const raw = {
  "schemaVersion": "1.0-development",
  "lifecycle": "Development",
  "stableBaseline": "1.7.0",
  "consumerEligible": false,
  "networkRequired": false,
  "providers": [
    {
      "id": "lucide",
      "name": "Lucide",
      "repository": "https://github.com/lucide-icons/lucide",
      "revision": "3f1255ecfa1b5b3a231e4aeb027781761204e187",
      "license": "ISC",
      "licensePath": "licenses/third-party/lucide.LICENSE"
    },
    {
      "id": "tabler",
      "name": "Tabler Icons",
      "repository": "https://github.com/tabler/tabler-icons",
      "revision": "a4ce1404bc6d24d3c365afe7b258d6bf6f48d62d",
      "license": "MIT",
      "licensePath": "licenses/third-party/tabler.LICENSE"
    },
    {
      "id": "heroicons",
      "name": "Heroicons",
      "repository": "https://github.com/tailwindlabs/heroicons",
      "revision": "616b7a4dbbf3d011760af8066262cd5c6b3868f3",
      "license": "MIT",
      "licensePath": "licenses/third-party/heroicons.LICENSE"
    }
  ],
  "assets": [
    {
      "id": "thirdparty.lucide.sparkles",
      "provider": "lucide",
      "name": "sparkles",
      "category": "decorative",
      "label": "Sparkles",
      "assetPath": "assets/third-party/lucide/sparkles.svg",
      "upstreamPath": "icons/sparkles.svg",
      "rtl": "preserve",
      "geometry": "24x24",
      "lifecycle": "development",
      "accessibleName": "Sparkles"
    },
    {
      "id": "thirdparty.lucide.scan-face",
      "provider": "lucide",
      "name": "scan-face",
      "category": "action",
      "label": "Face scan",
      "assetPath": "assets/third-party/lucide/scan-face.svg",
      "upstreamPath": "icons/scan-face.svg",
      "rtl": "preserve",
      "geometry": "24x24",
      "lifecycle": "development",
      "accessibleName": "Face scan"
    },
    {
      "id": "thirdparty.tabler.device-desktop",
      "provider": "tabler",
      "name": "device-desktop",
      "category": "device",
      "label": "Desktop device",
      "assetPath": "assets/third-party/tabler/device-desktop.svg",
      "upstreamPath": "icons/outline/device-desktop.svg",
      "rtl": "preserve",
      "geometry": "24x24",
      "lifecycle": "development",
      "accessibleName": "Desktop device"
    },
    {
      "id": "thirdparty.tabler.layout-grid",
      "provider": "tabler",
      "name": "layout-grid",
      "category": "layout",
      "label": "Grid layout",
      "assetPath": "assets/third-party/tabler/layout-grid.svg",
      "upstreamPath": "icons/outline/layout-grid.svg",
      "rtl": "preserve",
      "geometry": "24x24",
      "lifecycle": "development",
      "accessibleName": "Grid layout"
    },
    {
      "id": "thirdparty.heroicons.adjustments-horizontal",
      "provider": "heroicons",
      "name": "adjustments-horizontal",
      "category": "action",
      "label": "Adjustments",
      "assetPath": "assets/third-party/heroicons/adjustments-horizontal.svg",
      "upstreamPath": "optimized/24/outline/adjustments-horizontal.svg",
      "rtl": "preserve",
      "geometry": "24x24",
      "lifecycle": "development",
      "accessibleName": "Adjustments"
    },
    {
      "id": "thirdparty.heroicons.squares-2x2",
      "provider": "heroicons",
      "name": "squares-2x2",
      "category": "layout",
      "label": "Grid of squares",
      "assetPath": "assets/third-party/heroicons/squares-2x2.svg",
      "upstreamPath": "optimized/24/outline/squares-2x2.svg",
      "rtl": "preserve",
      "geometry": "24x24",
      "lifecycle": "development",
      "accessibleName": "Grid of squares"
    }
  ]
};
const deepFreeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
};
export const thirdPartyAssetCatalog = deepFreeze(raw);
const byId = new Map(thirdPartyAssetCatalog.assets.map(item => [item.id, item]));
const normalize = value => typeof value === 'string' ? value.trim().toLowerCase() : '';

/** Explicit opt-in lookup. Unknown IDs fail closed, including malformed or first-party IDs. */
export function resolveThirdPartyAsset(id) {
  const asset = byId.get(normalize(id));
  if (!asset) return null;
  const provider = thirdPartyAssetCatalog.providers.find(item => item.id === asset.provider);
  return Object.freeze({ ...asset, license: provider.license, sourceRevision: provider.revision,
    sourceRepository: provider.repository, licensePath: provider.licensePath });
}

/** Browser/bundler consumers must package the local assetPath. No CDN fallback. */
export function listThirdPartyAssets({ provider, category, query } = {}) {
  const p = normalize(provider), c = normalize(category), q = normalize(query);
  return Object.freeze(thirdPartyAssetCatalog.assets
    .filter(item => !p || item.provider === p)
    .filter(item => !c || item.category === c)
    .filter(item => !q || [item.id,item.label,item.name,item.category].join(' ').toLowerCase().includes(q))
    .map(item => resolveThirdPartyAsset(item.id)));
}
