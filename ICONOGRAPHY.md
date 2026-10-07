# GLAZE UI V1.0 — Iconography

V1 icons are semantic controls and indicators, not decoration. They must remain recognizable at target sizes, support accessible names where meaning is not otherwise exposed, preserve directional semantics in RTL contexts, and avoid communicating critical state by color alone.

Product/service identity artwork and application icons remain subject to the applicable GoreeCloud icon identity and construction standards. V1 conformance requires exact-revision validation of any machine-readable icon manifests used by a consumer.

## Shared Icon and Glyph Registry — required, planned

**Requirement state (2026-10-06):** mandatory planned implementation; no claim of delivered registry API, approved asset catalog, application adoption, or production acceptance.

Glaze must maintain one shared, discoverable, source-controlled registry for reusable UI icons and glyphs, with stable semantic references consumed by GoreeCloud applications and services. It must reuse the existing icon-construction, identity, and manifest contracts. The repository's current per-asset manifests and construction standards are foundations, not evidence that the shared registry is available.

### Asset classes and naming
- `ui.*`: interface actions, navigation, controls, feedback, and non-branded semantic icons.
- `glyph.*`: compact indicators and specialized glyphs that share the same semantic, optical, and accessibility governance.
- `identity.*`: application/service identity references whose actual Identity DNA, Identity Lock, and optical representations remain governed by `ICON_IDENTITY.md` and `ICON_CONSTRUCTION.md`.
- Status badges and provider-owned state must compose with a stable base identity; registry naming must not manufacture provider truth.

### Canonical entries and delivery
Each entry must declare stable ID, semantic purpose, owner/source, license and provenance, canonical vector or approved native-symbol source, asset checksum/revision, construction family, visual weight, optical variants, supported contexts/platform mappings, Glaze semantic color and state rules, RTL mirroring policy, and accessibility metadata. Where relevant, it must identify replacements and compatibility aliases for deprecated entries.

The registry must expose searchable discovery and a deterministic, documented consumer resolution contract. Platform adapters may use approved native vector/symbol renderers while preserving recognizable meaning, identity, and accessibility. Ordinary presentation must remain local-first/offline-capable. Raster derivatives, where justified, must retain their vector source authority.

### Authoring, validation, and acceptance
Canonical additions or changes require ownership, provenance and usage-right review, visual/optical quality review, duplication and identity-collision review, safe vector sanitation, schema validation, accessibility and RTL verification, light/dark/high-contrast/forced-color checks, and representative compact and full-size rendering tests. Changes must carry version and deprecation compatibility guidance. No automated score substitutes for necessary human visual/accessibility review.

Consumers must prefer registered assets over custom copies. A documented platform-native fallback is permitted where the canonical asset has no suitable adapter, but it may not imply a new canonical icon definition. Do not use emoji as a substitute for ordinary interface icons. Maintain premium, polished and modern visual quality without sacrificing clarity or platform-native behavior.

**Traceability:** `PROJECT-SPECIFICATIONS.md` §13 (normative requirement), `PLANNED-FEATURES.md` FR-020 (open implementation), `ICON_CONSTRUCTION.md`, `ICON_IDENTITY.md`, and `schemas/icon-manifest.schema.json`. No Stable or consumer acceptance follows from this documentation alone.

