# Glaze UI — Planned Features

**Status:** Active planned-feature control  
**As of:** 2026-09-26  
**Canonical lifecycle authority:** `registry/lifecycle.json`  
**Canonical repository:** `GoreeCloud/glaze-ui`  
**Current Official Anchor:** GLAZE UI V1.6 / `1.6.0` (Stable compatibility channel)

## Purpose

This file is the repository-native authority for planned, active, recommended, and otherwise not-yet-complete Glaze UI feature obligations. It does not establish implementation, qualification, lifecycle promotion, consumer eligibility, deployment, or production acceptance.

The detailed planned successor specification for V1.7 is `GLAZE_UI_V1_7_PLANNED.md`.

## Planned and Active Obligations

| ID | Feature / obligation | Priority | Current state |
| --- | --- | --- | --- |
| FR-001 | Reconcile and maintain every current planned or recommended Glaze UI feature from authoritative project records and verified repository evidence in this roadmap. | High | Ongoing control. |
| FR-002 | Move actionable feature obligations into GoreeCloud Tasks Management when required, preserving priority, dependency, blocker, and lifecycle disposition. | High | Ongoing control. |
| FR-003 | Do not mark features implemented, complete, cancelled, superseded, RC, Stable, deployed, or production-accepted without authoritative evidence and synchronized repository/Drive/task records. | High | Ongoing control. |
| FR-010 | Drive current-Anchor adoption across GoreeCloud-controlled user-facing consumers without allowing platform-level Anchor status to imply application-level acceptance. | P0 | Ongoing consumer migration/acceptance work; required target is `1.6.0`, while consumers remain separately evidence-gated. |
| FR-011 | Reconcile stale historical documentation and roadmap records that still identify older Glaze releases as current, without rewriting immutable historical evidence. | High | Active documentation-control work; current repository authority surfaces are reconciled for V1.6.0 while older records remain historical provenance. |
| FR-017 | Establish downstream V1.6 application adoption profiles only after shared V1.6 lifecycle and acceptance state make consumer migration valid. | High | Active — shared V1.6.0 is the Official Anchor; every consumer still requires fresh repository-local adoption and acceptance evidence. |
| FR-018 | Design and implement GLAZE UI V1.7 around Interaction Continuity + Personal Expression + Signature Motion, including Task Continuity, Adaptive Input 2.0, first-class form-factor profiles, adaptive composition, GlzCommandSurface, Advanced Theme Manager 2.0, layered theme architecture, Semantic Color System 2.0, protected semantic colors, semantic prominence/layering, intelligent palette generation, color-coded navigation/system/connectivity/data visualization, theme accessibility and safety, declarative theme packages, local-first theme generation, Glaze Signature Motion, named transition families, Connected Transformation 2.0, adaptive-composition motion, signature microinteractions, theme transitions, motion-expression profiles, Reduced Motion equivalents, motion-fatigue protection, motion performance, Glaze Motion lifecycle reconciliation, shell continuity, notification/activity surfaces, native Glaze kits, expanded components, Glaze Inspector/Studio, accessibility continuity, cross-device consistency, privacy/authority boundaries, performance/energy awareness, and evidence-driven V1.7 acceptance. | P0 | In progress — `1.7.0-dev.21` is the latest bounded Development aggregate. dev.14 is the v1.2 Section 22 Signature Motion System source foundation; dev.15 adds bounded Section 23 Signature Motion Principles; dev.16 adds bounded Section 24 Signature Transition Families semantics; dev.17 adds bounded Section 25 Connected Transformation 2.0 semantics; dev.18 adds bounded Section 26 Adaptive Composition Motion semantics; dev.19 adds bounded Section 27 Signature Microinteractions semantics; dev.20 adds bounded Section 28 Theme Transition System semantics; dev.21 adds bounded Section 29 Motion Expression Profiles semantics, mapping the existing Personalization 2.0 motionIntensity values to Calm/Balanced/Expressive profiles with accessibility and authoritative performance precedence, no raw motion controls, no continuous decorative animation, and no preference rewrite during effective-profile degradation. Sections 22–29 remain incomplete pending their required measured/rendered/native/assistive-technology/performance/motion-fatigue/human-review evidence. Sections 30–34 remain open. V1.7 remains non-consumer-eligible; separate Glaze Motion 0.6 remains Experimental. |


## V1.7 Development Provenance

The historical dev tranche numbers remain bound to the plan revision under which they were implemented. `1.7.0-dev.7` is retained as historical v1.0-plan provenance. The v1.1 foundations are retained as: `1.7.0-dev.8` Theme and Semantic Color Reconciliation; `1.7.0-dev.9` Native Glaze Kits; `1.7.0-dev.10` Expanded Component System; `1.7.0-dev.11` Glaze Inspector; `1.7.0-dev.12` Glaze Studio; and `1.7.0-dev.13` Continuity-Aware Motion. `1.7.0-dev.14` is the first explicitly v1.2-bound foundation and maps only to v1.2 Section 22. `1.7.0-dev.15` maps only to v1.2 Section 23 as a bounded Signature Motion Principles source layer. `1.7.0-dev.16` maps only to v1.2 Section 24 as a bounded Signature Transition Families semantic choreography layer. `1.7.0-dev.17` maps only to v1.2 Section 25 as a bounded Connected Transformation 2.0 source layer. `1.7.0-dev.18` maps only to v1.2 Section 26 as a bounded Adaptive Composition Motion source layer. `1.7.0-dev.19` maps only to v1.2 Section 27 as a bounded Signature Microinteractions source layer. `1.7.0-dev.20` maps only to v1.2 Section 28 as a bounded Theme Transition System source layer. `1.7.0-dev.21` maps only to v1.2 Section 29 as a bounded Motion Expression Profiles source layer. These names and numbers preserve implementation evidence only; no historical tranche is renumbered, and dev.14–dev.21 do not make their mapped v1.2 sections complete.

## V1.7 Planning Boundary

The detailed successor specification is `GLAZE_UI_V1_7_PLANNED.md` **v1.2**, themed **Interaction Continuity + Personal Expression + Signature Motion**. The v1.2 plan contains 47 sections. Historical Development references remain bound to the plan revision under which they were implemented and must not be renumbered retroactively.

GLAZE UI V1.6 / `1.6.0` remains the current Official Stable shared target. V1.7 planning must not change `VERSION`, `registry/lifecycle.json`, current Stable runtime entrypoints, published V1.6 release evidence, or downstream consumer eligibility.

Any V1.7 implementation must remain presentation-focused, preserve provider authority, and fail closed rather than inventing authentication, authorization, privacy, security, consent, permission, capability, connectivity, data-integrity, recovery, identity, backup, availability, trust, or acceptance truth.

## Qualification Boundary

Automated validation alone must not establish V1.7 acceptance. Claimed V1.7 support requires applicable exact-revision evidence for source behavior, semantic correctness, theme safety, custom-theme accessibility, protected semantic color enforcement, palette generation, contrast, grayscale and color-vision differentiation, Forced Colors, Increased Contrast, Reduced Transparency, appearance modes, inputs, task continuity, adaptive composition, Signature Motion semantics, connected transformations, interruption and reversal, Reduced Motion equivalents, frame pacing, input latency, motion-fatigue behavior, motion-performance degradation, claimed Mobile/Tablet/Desktop/Foldable/TV/Wearable support, representative rendering, native-platform behavior, performance and energy behavior, regression, human visual and motion review, assistive technology, security/privacy/authority boundaries, and artifact provenance.

## Maintenance

Keep this file synchronized with verified repository implementation state, `registry/lifecycle.json`, the canonical Drive navigation index `GoreeCloud/Sources/Glaze-UI-Index`, and applicable GoreeCloud task records. Planned work must remain planned until authoritative implementation and acceptance evidence establishes another state.
