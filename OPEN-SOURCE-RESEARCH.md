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

