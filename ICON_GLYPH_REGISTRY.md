# Glaze Shared Icon and Glyph Registry

**State:** Development foundation; not Stable, consumer-eligible, production-qualified, or downstream-adopted.
**FR-020 baseline:** `d6acf37456e14ba1801129b53500916354512af5`
**Registry version:** `0.1.0-development`

This implementation is the source foundation for FR-020. It extends the existing Glaze iconography, icon construction, icon identity, and per-asset manifest contracts instead of replacing them.

## Namespaces

- `ui.*` — reusable interface actions, navigation, objects, and system icons.
- `glyph.*` — compact semantic and status glyphs.
- `identity.*` — references to separately governed first-party identities.

Product/service identities remain governed by Identity DNA and Identity Lock. The registry may reference approved identity assets but does not become a competing identity authority.

## Consumer contract

Consumers resolve a stable semantic identifier rather than copying vector geometry. `js/icon-glyph-registry.mjs` provides deterministic lookup, alias resolution, catalog search, optical-size selection, RTL mirroring metadata, and an explicit fail-closed/no-fallback option.

Ordinary lookup is **local-first and offline**. The registry does not require network access for presentation. The default unknown-ID fallback is `glyph.status.unavailable`, while callers that require strict resolution can disable fallback.

The registry is presentation metadata. It **does not manufacture provider truth**. Privacy, security, synchronization, availability, protection, and other state must still come from the responsible authoritative provider before a semantic glyph is shown as factual state.

## Source integrity and safety

Shared UI/glyph geometry is stored in `assets/icon-glyphs/system-symbols.svg`. Every sprite-backed entry carries its SHA-256 digest. Validation rejects external HTTP(S) references, scripts, event handlers, `foreignObject`, external CSS URLs, and XML entities.

`identity.glaze` is only a reference to the existing official Facet asset and its recorded digest. This bundle does not duplicate or replace that identity source.

## Accessibility and RTL

Every entry declares a default accessible name, whether decorative use is allowed, color-independent recognition, high-contrast support, Forced Colors support, Reduced Transparency support, optical sizes, and RTL behavior. Directional navigation arrows mirror in RTL; non-directional symbols preserve their geometry.

Protected semantic colors remain bound to the existing semantic token meanings. Color is not sufficient by itself to communicate meaning.

## Versioning, aliases, and deprecation

Canonical IDs are stable. Compatibility aliases are explicit and deprecated; aliases cannot collide with canonical IDs and must point to a registered target. A future removal or semantic reassignment requires governed compatibility review rather than silent reuse.

## Qualification boundary

The validator proves schema conformance, namespace consistency, ID/alias uniqueness, local-source policy, vector sanitation, digest integrity for shared sprite sources, semantic-token bindings, RTL metadata, accessibility metadata, deterministic fallback, search, and alias behavior.

That is machine validation only. Production qualification still requires representative rendered checks and **human visual and accessibility review**, including compact/micro legibility, light/dark/deep-dark, high contrast, Forced Colors, RTL, and collision/identity review. Downstream consumer acceptance remains separate.

**Traceability:** `PROJECT-SPECIFICATIONS.md` §13, `ICONOGRAPHY.md`, `ICON_CONSTRUCTION.md`, `ICON_IDENTITY.md`, `schemas/icon-manifest.schema.json`, and FR-020.
