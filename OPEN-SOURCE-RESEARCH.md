# Open-Source Research

This repository uses the GoreeCloud Reforge Process: external projects may inform requirements, but GoreeCloud source is independently designed and validated.

## V1.7 dev.29 — Native Glaze Kits v1.2

Research date: 2026-09-27.

- JetBrains/compose-multiplatform-core at `ba2c8a19a0d6e190068d99ce33d77c2f8bb5159d` — Apache-2.0. Studied for cross-platform state-driven UI architecture.
- GNOME/libadwaita at `0ffcd2c80b2260bdae01b89e88d94bb5c856db13` — examined animation source is LGPL-2.1-or-later. Studied for animation lifecycle and platform animation-preference behavior.
- KDE/kirigami at `c8a8a9ad507be64c0994faeb0435a0c884ff6238` — examined Units source is LGPL-2.0-or-later. Studied for semantic duration categories and platform integration.

Detailed requirements research is retained in `research/v1.7-native-glaze-kits-v1-2.md`.

No third-party source code, numeric motion values, curves, spring constants, assets, components, or visual identity are incorporated by this tranche.

## V1.7 dev.30 — Expanded Component System v1.2

Research date: 2026-09-27.

- Radix UI Primitives at `f7ecd5ab16f5e1e820eb5786a1419a98a2d594ae` — MIT. Studied for composable low-level component contracts, accessibility, customization, and explicit component-part ownership.
- Material Web at `cbd34a8921915af94d5ef65c2a69eece41d5b4f3` — Apache-2.0. Studied for accessible Web Component contracts and semantic behavior; its current maintenance-mode status is treated as a dependency warning, not a GoreeCloud foundation choice.
- Microsoft Fluent UI at `8add8c8750c34c85acd811e32ab324abf8f1562e` — MIT for reviewed repository source; referenced fonts/icons have separate asset terms and are not incorporated. Studied for separation of foundational APIs/slots, theming, component behavior, and accessibility.
- W3C ARIA Authoring Practices at `3f094fde1c81b25dfa69162563bf28d093f854d4` — W3C Software and Document License. Studied for keyboard, focus, and accessible widget semantics.

Detailed requirements research is retained in `research/v1.7-expanded-component-system-v1-2.md`.

No third-party source code, component implementation, animation values, assets, fonts, icons, visual identity, trademarks, or branding are incorporated by this tranche.

## V1.7 dev.31 — Advanced Theme System v1.2

Research date: 2026-09-27.

- Material Color Utilities at `5b3618b16fdc3825e21d5679bafd144662088ea1` — Apache-2.0. Studied for bounded seed-derived palette architecture and post-derivation accessibility constraints.
- Microsoft Fluent UI at `8add8c8750c34c85acd811e32ab324abf8f1562e` — MIT for reviewed repository source; referenced fonts/icons have separate terms and are not incorporated. Studied for semantic token and theme-role separation.
- Carbon Design System at `7e8c8f7db6dd2ed98c4947b78b37614f43eda920` — Apache-2.0. Studied for coherent theme families and categorical/data-visualization color governance.

Detailed requirements research is retained in `research/v1.7-advanced-theme-system-v1-2.md`.

No third-party source code, algorithms, exact palette constants, token implementations, assets, fonts, icons, visual identity, trademarks, or branding are incorporated by this tranche.

## V1.7 dev.32 — Glaze Inspector v1.2

Research date: 2026-09-27.

- Chrome DevTools frontend at `83c5c56d700f2065d9a0fb530ccc383f49ee6ae2` — BSD-3-Clause. Studied for animation-model inspection, grouped timeline context, and separation between observed animation state and developer controls.
- Storybook at `5efca7a6ab523726d4a0f2fbea00bbf5b66c3fe1` — MIT. Studied for component-control inspection, explicit unknown/loading state, and deferring expensive diagnostics until a useful lifecycle point.
- Redux DevTools at `89ae6ee57c6879c0da39d1f03d6ad8de029c5390` — MIT. Studied for keeping selected events/actions, previous/current state, and derived delta/provenance distinguishable in an inspector.

Detailed requirements research is retained in `research/v1.7-glaze-inspector-v1-2.md`.

No third-party source code, UI implementation, algorithms, numeric animation values, curves, spring constants, assets, fonts, icons, visual identity, trademarks, or branding are incorporated by this tranche.

## V1.7 dev.33 — Glaze Studio v1.2

Research date: 2026-09-27.

- Storybook at `5efca7a6ab523726d4a0f2fbea00bbf5b66c3fe1` — MIT. Studied for explicit preview/view-mode and bounded layout context in a component workbench.
- React Cosmos at `aae77c654b9b437ea5f6e635e6df7fc28924e606` — MIT. Studied for explicit isolated fixture/scenario state and renderer separation.
- Ladle at `592a3fc3bb83a2fe945cb0d8ab2c3ef35d19bc3e` — MIT. Studied for bounded declared component controls and multiple comparable variants.

Detailed requirements research is retained in `research/v1.7-glaze-studio-v1-2.md`.

No third-party source code, UI/control implementation, algorithms, animation values, components, assets, fonts, icons, visual identity, trademarks, or branding are incorporated by this tranche.


## V1.7 dev.34 — Accessibility Continuity

Research date: 2026-09-27.

- W3C ARIA Authoring Practices at `3f094fde1c81b25dfa69162563bf28d093f854d4` — W3C Software and Document License. Studied for visible, persistent, predictable keyboard focus and semantic conventions supporting assistive interaction.
- Adobe React Spectrum / React Aria at `16eead67e83cf42f3c0ee46ef6eb7a2032778378` — Apache-2.0. Studied for explicit focus-scope containment/restoration and bounded focus-management architecture.
- AndroidX Compose UI at `23327507f7fc7d5b19d65fec4b090f60c970079b` — Apache-2.0. Studied for preserving/restoring previously focused children across composition changes with explicit fallback behavior.

Detailed requirements research is retained in `research/v1.7-accessibility-continuity.md`.

No third-party source code, UI/focus-management implementation, algorithms, raw presentation values, components, assets, fonts, icons, visual identity, trademarks, or branding are incorporated by this tranche.

## V1.7 dev.35 — Cross-Device Consistency Without Uniformity

Research date: 2026-09-27.

- Flutter at `8db55268667c738b90677d49857ff42938e9c9fa` — BSD-3-Clause. Studied for preserving common interaction/action meaning while choosing platform-specific context-menu controls and toolbar presentation.
- JetBrains Compose Multiplatform Core at `ba2c8a19a0d6e190068d99ce33d77c2f8bb5159d` — Apache-2.0. Studied for shared declarative semantics with target-specific platform bridges, rendering, accessibility, and native implementation.
- GNOME libadwaita at `0ffcd2c80b2260bdae01b89e88d94bb5c856db13` — examined sources declare LGPL-2.1-or-later. Studied for adaptive split/collapsed navigation composition and separate platform-owned appearance/accessibility settings.

Detailed requirements research is retained in `research/v1.7-cross-device-consistency.md`.

No third-party source code, components, native controls, layout algorithms, numeric dimensions, animation values, assets, fonts, icons, visual identity, trademarks, or branding are incorporated by this tranche.

## V1.7 dev.36 — Visual and Motion Direction

Research date: 2026-09-27.

- AndroidX Material 3 at `23327507f7fc7d5b19d65fec4b090f60c970079b` — Apache-2.0. Studied for system-level standard/expressive motion schemes and separation between spatial and effect-oriented motion semantics.
- Microsoft Fluent UI at `8add8c8750c34c85acd811e32ab324abf8f1562e` — MIT. Studied for centralized, reusable motion vocabulary rather than unrelated per-component animation definitions.
- GNOME libadwaita at `0ffcd2c80b2260bdae01b89e88d94bb5c856db13` — LGPL-2.1-or-later. Studied for animation suppression when platform settings disable animation and for separately platform-owned appearance/high-contrast settings.

Detailed requirements research is retained in `research/v1.7-visual-motion-direction.md`.

No third-party source code, animation constants, numeric motion values, duration/easing/spring/keyframe definitions, visual effects, material recipes, components, assets, fonts, icons, visual identity, trademarks, or branding are incorporated by this tranche.

## V1.7 dev.37 — Privacy and Authority Boundaries

Research date: 2026-09-27.

- AndroidX Compose Foundation at `23327507f7fc7d5b19d65fec4b090f60c970079b` — Apache-2.0. Studied for explicit determinate/indeterminate progress semantics driven by supplied state rather than visual inference.
- Microsoft Fluent UI at `8add8c8750c34c85acd811e32ab324abf8f1562e` — MIT. Studied for progress accessibility semantics bound to supplied current/max values instead of animation-derived completion.
- Adobe React Spectrum / React Aria at `16eead67e83cf42f3c0ee46ef6eb7a2032778378` — Apache-2.0. Studied for explicit progress-state semantics in which determinate values are supplied and indeterminate state remains distinct from completion.

Detailed requirements research is retained in `research/v1.7-privacy-authority-boundaries.md`. The GoreeCloud implementation reuses the existing V1.5 provider registry for provenance, authority ownership, conflict handling, and no-inferred-precedence behavior; the external projects above inform only state-projection requirements.

No third-party source code, state machines, provider models, animation values, components, assets, fonts, icons, visual identity, trademarks, or branding are incorporated by this tranche.

## V1.7 dev.38 — Performance and Energy Awareness

Research date: 2026-09-27.

- Flutter at `8db55268667c738b90677d49857ff42938e9c9fa` — BSD-3-Clause. Studied `TickerMode` for suppressible ticker work and its explicit warning that forcing frames while a device would otherwise be idle can significantly increase battery usage.
- AndroidX Compose Animation Core at `23327507f7fc7d5b19d65fec4b090f60c970079b` — Apache-2.0. Studied continuous/infinite animation lifecycle as a reason to govern optional repeated visual work explicitly rather than treating it as a free default.
- GNOME libadwaita at `0ffcd2c80b2260bdae01b89e88d94bb5c856db13` — examined source is LGPL-2.1-or-later. Studied automatic animation skipping when a widget is unmapped or animations are disabled.

Detailed requirements research is retained in `research/v1.7-performance-energy-awareness.md`.

No third-party source code, scheduling/frame-loop implementation, animation specifications, timing constants, energy thresholds, components, assets, fonts, icons, visual identity, trademarks, or branding are incorporated by this tranche.
