# Glaze — Third-Party Assets (Development)

**Status:** Development-only, opt-in. Not qualified for Stable, automatic consumer adoption, production, or identity use.
**Stable runtime:** `1.7.0` is unchanged. The current first-party `ui.*`, `glyph.*`, and `identity.*` icon/glyph registry remains authoritative.

## What is actually included

Six locally bundled 24×24 SVG assets from three permissively licensed icon libraries are in `assets/third-party/`. Each asset is registered in `registry/third-party-assets.development.json` with provider name, source commit, upstream path, attribution, accessible name and local path. The browser-compatible module `js/third-party-assets.development.mjs` resolves IDs without network calls or unknown-ID fallbacks.

| Pack | License | Included assets |
| --- | --- | --- |
| Lucide | ISC; its upstream LICENSE additionally identifies certain Feather-derived icons under MIT | `sparkles`, `scan-face` |
| Tabler Icons | MIT | `device-desktop`, `layout-grid` |
| Heroicons | MIT | `adjustments-horizontal`, `squares-2x2` |

Upstream source references are pinned to exact commits in the manifest. The corresponding unmodified license texts are retained under `licenses/third-party/`. This import does not incorporate official GoreeCloud identity artwork, trademarked third-party logos, fonts, remote CDNs, executable third-party libraries or telemetry.

## Use

```js
import {resolveThirdPartyAsset, listThirdPartyAssets}
  from './js/third-party-assets.development.mjs';

const icon = resolveThirdPartyAsset('thirdparty.lucide.sparkles');
// icon.assetPath -> assets/third-party/lucide/sparkles.svg
const layouts = listThirdPartyAssets({ category: 'layout' });
```

Consumers must explicitly opt in, bundle or copy the **local** `assetPath`, retain corresponding upstream license notices in distributions, and apply their own accessible label or mark truly decorative images accordingly. The displayed 24px SVGs rely on `currentColor` when **inlined**, not hard-coded GoreeCloud color values. An SVG loaded via `<img>` does not inherit the host text color in the same way. This module deliberately does not inject SVG markup into the DOM or fetch remote icons.

Do **not** assume these external packs are interchangeable with first-party Glaze icons: assess optical weight, stroke density, size, RTL direction, semantic meaning, visual consistency, responsive layout, high contrast, Forced Colors, assistive technology and light/dark environments per consumer. Do not use `scan-face` to imply biometric availability or permissions without a provider-owned true state. Do not use any shield/security symbol as proof of protection.

## Verification and promotion boundary

Run:

```sh
node scripts/validate_third_party_assets_development.mjs
node --test tests/third-party-assets.development.test.mjs
```

The validator enforces catalog synchronization, license presence, path confinement, inert self-contained SVG markup, semantic-color compatibility, unique IDs, stable-runtime separation and deterministic local resolution. CI runs these checks for related changes.

**Still required before wider promotion:** visually compare all source icons against Glaze first-party symbols at micro/compact/standard sizes, review license and attribution distribution, verify representative browser/native consumers and assistive-tech use, and complete governed consumer-specific acceptance. Do not edit `registry/icon-glyph-registry.json` or `js/glaze-v1.7.0.mjs` simply to advertise this Development collection.

The separate EvilCharts React development PR may provide an additional third-party chart adapter after its own review; it is not part of this asset import and must not be counted as merged or Stable.

## Licensing and sources

- Lucide: https://github.com/lucide-icons/lucide
- Tabler Icons: https://github.com/tabler/tabler-icons
- Heroicons: https://github.com/tailwindlabs/heroicons

All resources are offered under their respective upstream terms. Glaze's root MIT license does **not** replace third-party licenses or waive third-party copyright/notice obligations.
