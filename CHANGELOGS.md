# Changelogs

All notable changes to the Glaze UI reference implementation are recorded here.

## Unreleased — GLAZE UI V1.7 Development


- Added bounded `1.7.0-dev.21` **Motion Expression Profiles** Development source for V1.7 v1.2 Section 29.
- Connected the existing Personalization 2.0 `motionIntensity` vocabulary to Calm (`minimal`), Balanced (`standard`), and Expressive (`expressive`) profiles without creating a second user-preference authority.
- Added semantic profile traits for travel, settling, connected transformation use, material animation, adaptive recomposition, depth, signature motion, and decorative movement while explicitly prohibiting continuous decorative animation and raw timing/easing/spring/physics/distance/scale controls.
- Added accessibility and authoritative performance precedence: Reduced Motion uses Calm plus lower-motion semantic equivalents while preserving direct-manipulation tracking; constrained performance caps Expressive at Balanced; severe performance caps profiles at Calm; effective degradation never rewrites the selected preference.
- Recorded Material Components, Carbon Design System, and Fluent UI open-source motion/token research with exact revisions and licenses as independent-reimplementation provenance; no upstream source, curves, duration values, components, assets, or visual identity are copied.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.21` with v1.2 foundation sections 22–29 while keeping Sections 22–29 acceptance incomplete, Glaze Motion 0.6 Experimental, V1.6 / `1.6.0` as Official Anchor, and V1.7 non-consumer-eligible.



- Added bounded `1.7.0-dev.20` **Theme Transition System** Development source for V1.7 v1.2 Section 28.
- Added governed semantic theme-transition coordination for Canvas color, Surface color, Accent families, Material atmosphere, Icon tint, Selection color, Non-semantic decorative color, and Appearance mode without exposing application-facing raw timing/easing/physics controls.
- Separated cancellable preview from application state and made the target theme count as applied only after an authoritative `committed` result from the responsible system; pending, failed, cancelled, unchanged, or untrusted results do not manufacture a commit.
- Added Reduced Motion immediate theme replacement, Reduced Transparency solid-material equivalence, Forced Colors authority preservation, and performance-pressure degradation that removes optional interpolation without changing authoritative theme state.
- Recorded Material Components and Fluent UI open-source theming/motion research as Reforge provenance without copying upstream source, exact timing/easing values, transition classes, or visual identity.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.20` with v1.2 foundation sections 22–28 while keeping Sections 22–28 acceptance incomplete, Glaze Motion 0.6 Experimental, V1.6 / `1.6.0` as Official Anchor, and V1.7 non-consumer-eligible.



- Added bounded `1.7.0-dev.19` **Signature Microinteractions** Development source for V1.7 v1.2 Section 27.
- Added governed semantic microinteraction feedback for Toggle, Select, Favorite, Save, Copy, Pin, Expand, Collapse, Refresh, Retry, Send, Download, Upload, Completion, and Reorder, with no more than three semantic motion-property channels per action and no application-facing raw timing/easing/physics controls.
- Separated authoritative action intent from authoritative result feedback: Glaze may present bounded intent acknowledgement, but confirmed/failed/cancelled/unchanged result feedback requires provider/application-owned result authority; Glaze does not execute commands, transfers, state mutation, or manufacture completion truth.
- Added Reduced Motion immediate-state equivalents, Reduced Transparency solid-material equivalents, rapid-repetition fatigue suppression for travel/scale/icon motion, and performance-pressure degradation that removes optional motion without changing authoritative state.
- Recorded Material, Carbon, and Fluent open-source motion research as Reforge provenance without copying upstream source, timing values, easing curves, components, or visual identity.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.19` with v1.2 foundation sections 22–27 while keeping Sections 22–27 acceptance incomplete, Glaze Motion 0.6 Experimental, V1.6 / `1.6.0` as Official Anchor, and V1.7 non-consumer-eligible.


- Added bounded `1.7.0-dev.18` **Adaptive Composition Motion** Development source for V1.7 v1.2 Section 26.
- Added governed adaptive recomposition for reposition, resize, hierarchy change, movement between panes, merge, separate, reorder, and material-level change through Glaze Flow, Glaze Fold, and Glaze Material Shift semantics.
- Require authoritative composition-change truth, a supplied non-empty authoritative composition identity, and explicit from/to composition states. Missing or untrusted composition identity falls back to the immediate final composition instead of inventing continuity.
- Preserve spatial understanding, task and element continuity, focus/reading order, selection, navigation context, Reduced Motion immediate recomposition, and performance-pressure degradation that may remove optional interpolation but never final composition correctness.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.18` with v1.2 foundation sections 22–26 while keeping Sections 22–26 acceptance incomplete, Glaze Motion 0.6 Experimental, V1.6 / `1.6.0` as Official Anchor, and V1.7 non-consumer-eligible.

- Added bounded `1.7.0-dev.17` **Connected Transformation 2.0** Development source for V1.7 v1.2 Section 25.
- Added twelve governed connected object/task relationships covering search control → search interface, navigation item → destination, app icon → application surface where platform appropriate, card → detail, thumbnail → viewer, quick setting → expanded setting, compact player → full player, folder → contents, notification → related event, widget → expanded experience, command result → resulting interface, and compact pane → expanded pane.
- Require authoritative connection truth plus a supplied non-empty authoritative connection identity before connected continuity is applied; app-icon → application-surface continuity additionally requires authoritative platform support. Unclear, untrusted, or unsupported identity falls back to a standard transition without inventing a relationship.
- Preserve Reduced Motion equivalents, focus/reading order, task continuity, interruption/state integrity, presentation-only authority, and performance degradation that may simplify optional motion but never required semantics.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.17` with v1.2 foundation sections 22–25 while keeping Sections 22–25 acceptance incomplete, Glaze Motion 0.6 Experimental, V1.6 / `1.6.0` as Official Anchor, and V1.7 non-consumer-eligible.

- Added bounded `1.7.0-dev.16` **Signature Transition Families** Development source for V1.7 v1.2 Section 24.
- Added semantic choreography descriptors for all ten named families—Bloom, Flow, Lift, Veil, Fold, Trace, Settle, Focus Transfer, Color Shift, and Material Shift—while preserving dev.14 relationship/identity authority and dev.15 motion principles.
- Added Reduced Motion family equivalents, Reduced Transparency solid fallback for Material Shift, certainty-first critical Veil behavior, protected semantic-color continuity, focus-state independence, and explicit anti-decoration rules for Fold, Trace, and Settle.
- Rejected raw family, duration, easing, spring, physics, keyframe, path, distance, rotation, overshoot, bounce, and wobble controls so applications continue to request motion by semantic intent rather than invent choreography parameters.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.16` with v1.2 foundation sections 22–24 while keeping Sections 22–24 acceptance incomplete, rendered/native choreography acceptance unestablished, Glaze Motion 0.6 Experimental, V1.6 / `1.6.0` as Official Anchor, and V1.7 non-consumer-eligible.

- Added bounded `1.7.0-dev.15` **Signature Motion Principles** Development source for V1.7 v1.2 Section 23.
- Made all eight Section 23 principles machine-verifiable: immediate acknowledgement policy, purposeful semantic motion, authoritative identity preservation, meaningful depth, quiet settling, user-controlled interruptibility, non-blocking state, and accessibility/Reduced Motion precedence.
- Added fail-closed raw depth/bounce/wobble rejection and explicit relationship interpretation for purpose, depth role, identity mode, and settling role without adding Section 24 choreography.
- Preserved dev.14 Signature Motion System semantics, connected-identity fallback, V1.6 motion-budget behavior, Experimental Glaze Motion 0.6, and V1.6 / `1.6.0` as the Official Anchor.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.15` with v1.2 foundation sections 22 and 23 while keeping Section 22 and Section 23 acceptance incomplete, Section 24 choreography open, measured responsiveness unaccepted, and V1.7 non-consumer-eligible.

- Require a supplied non-empty object identity as well as caller authority before applying Glaze Bloom or Glaze Trace. Missing, null, empty, and whitespace-only identities fall back to standard replacement without asserting object continuity. Added regression cases to the existing Signature Motion validator; V1.7 remains Development and consumer-ineligible.

- Migrated the current GLAZE UI V1.6 / 1.6.0 release from legacy Stable lifecycle vocabulary to canonical **Anchor** under GoreeCloud Platform Contract 2.0 after a current-governance reclassification review confirmed the exact accepted release still has complete qualification, final security acceptance, controlled publication/readback, justified shared-library production applicability, all nine Integral Platform Systems evaluated, a known-good rollback target, and zero qualification blockers. Released V1.6 bytes and historical Stable evidence were not rewritten; downstream consumer acceptance remains separate.

- Reconciled V1.6 consumer-registry notes with current downstream source state: Launcher, Monitor, and Wardveil carry bounded V1.6.0 source mappings while remaining acceptance-blocked; Privacy Center still carries a pre-reset 2.1.0 implementation and remains migration-required. No consumer status or production eligibility was promoted.

- Reconciled the V1.6 consumer registry to the live `GoreeCloud/launcher`, `GoreeCloud/monitor`, `GoreeCloud/wardveil`, and `GoreeCloud/privacy-shield` repository identities and added Gallery, Notify, and Since as `adoption-required` / production-ineligible consumers; no downstream acceptance or lifecycle promotion is implied.

- Added the bounded `1.7.0-dev.14` Glaze Signature Motion System Development foundation as the first V1.7 source tranche explicitly bound to plan v1.2, covering Section 22 only.
- Added ten authoritative semantic relationship requests mapped to the ten named Signature Motion families—Bloom, Flow, Lift, Veil, Fold, Trace, Settle, Focus Transfer, Color Shift, and Material Shift—while rejecting arbitrary raw family, duration, easing, spring, physics, and keyframe inputs.
- Preserved fail-closed relationship/object-identity authority, Reduced Motion precedence, direct-manipulation tracking, retained V1.6 motion-budget protection, non-blocking final state, and presentation-only authority.
- Preserved Glaze Motion 0.6 as a separately governed Experimental foundation with Motion Core 0.4 runtime compatibility; dev.14 does not promote Motion Core, Motion Studio, or Motion Spatial and does not claim Section 22/23/24 completion or downstream acceptance.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.14` / plan v1.2 while retaining all v1.0/v1.1 provenance, V1.6 / `1.6.0` as Official Stable, and V1.7 as non-consumer-eligible.

- Expanded `GLAZE_UI_V1_7_PLANNED.md` to planning revision v1.2 with 47 sections and the theme **Interaction Continuity + Personal Expression + Signature Motion**.
- Added the Glaze Signature Motion System, ten named transition families (Bloom, Flow, Lift, Veil, Fold, Trace, Settle, Focus Transfer, Color Shift, Material Shift), Connected Transformation 2.0, adaptive-composition motion, signature microinteractions, theme transitions, motion-expression profiles, Reduced Motion equivalents, motion-fatigue protection, motion performance, and explicit Glaze Motion lifecycle reconciliation.
- Added a strict numbering-provenance boundary: dev.1–dev.7 remain v1.0-plan evidence and dev.8–dev.13 remain v1.1-plan evidence. Historical dev.13 “v1.1 Section 28 Continuity-Aware Motion” must not be reinterpreted as v1.2 Section 28 Theme Transition System or as completion of newly added Signature Motion requirements.
- Preserved GLAZE UI V1.6 / `1.6.0` as current Official Stable; the planning expansion does not change lifecycle state, consumer eligibility, release evidence, deployment, or production acceptance.

- Added the bounded `1.7.0-dev.13` Continuity-Aware Motion Development foundation for V1.7 v1.1 Section 28.
- Extended the retained V1.6 focus/motion resolver with continuity events for surface relocation, composition change, retained object identity, focus movement, pane primacy changes, compact/expanded transitions, and bounded theme changes.
- Added continuity explanations and Task Continuity preservation while requiring authoritative object-identity, focus-target, and pane-primacy claims instead of inventing them.
- Required Reduced Motion to provide equivalent static or minimally animated transitions and kept continuous rainbow effects, unnecessary chromatic movement, and decorative animation out of defaults.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.13` while retaining V1.6 / `1.6.0` as Official Stable and keeping Section 28 incomplete pending separate qualification.

- Added the bounded `1.7.0-dev.12` Glaze Studio Development foundation for V1.7 v1.1 Section 27.
- Added local design/review sessions, Inspector-backed scene exploration, preview-only theme drafts, and bounded comparisons across components, semantic states, appearance/expression modes, form factors, adaptive layouts, motion, loading/error states, accessibility configurations, and platform mappings.
- Added optional Native Glaze Kit mapping previews while marking simulated Studio states as non-authoritative and preserving provider/platform truth ownership.
- Kept Theme Manager as the end-user personalization interface and repository contracts as authority; Studio does not persist/apply theme drafts automatically, mutate source, execute application actions, grant acceptance, or claim rendered/native/assistive-technology/performance/human-review evidence.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.12` while retaining V1.6 / `1.6.0` as Official Stable and keeping Section 27 incomplete pending separate qualification.

- Added the bounded `1.7.0-dev.11` Glaze Inspector Development foundation for V1.7 v1.1 Section 26.
- Added explainable inspection across component state, token provenance, semantic color/theme resolution, material hierarchy, accessibility overrides, focus/input mapping, adaptive layout, form-factor previews, supplied target-size evidence, authority boundaries, and migration state.
- Added six resolution-provenance sources—semantic state, product identity, user theme, context, accessibility, and Glaze fallback—without creating provider truth or mutating source.
- Reused existing V1.6 conformance/developer-diagnostic machinery as advisory evidence while preserving dev.8 theme/color, dev.9 native mappings, and dev.10 expanded-component boundaries.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.11` while retaining V1.6 / `1.6.0` as Official Stable and keeping Section 26 incomplete pending separate acceptance.

- Added the bounded `1.7.0-dev.10` Expanded Component System Development foundation for V1.7 v1.1 Section 25.
- Added a 14-component semantic catalog with 10 new adaptive/personalization-oriented source foundations while preserving inherited V1.7 component identities.
- Enforced semantic color roles instead of literal color values, retained accessibility precedence and Task Continuity, and preserved dev.8 Theme/Semantic Color plus dev.9 Native Glaze Kits boundaries.
- Kept provider-owned activity and recovery state fail closed; dev.10 does not claim Section 25 completion, native/rendered/device/assistive-technology/performance acceptance, consumer eligibility, release promotion, deployment, or production acceptance.
- Advanced the bounded V1.7 Development aggregate to `1.7.0-dev.10` while retaining V1.6 / `1.6.0` as Official Stable.

- Added the bounded `1.7.0-dev.9` Native Glaze Kits Development source-mapping foundation for the expanded V1.7 v1.1 Section 24.
- Added semantic bridge mappings for Android / Jetpack Compose, Apple / SwiftUI, Web, and supported Linux native environments across accessibility, input, rendering, system appearance, color capability, and performance characteristics while preserving one Glaze semantic vocabulary.
- Integrated the dev.8 Theme and Semantic Color foundation so native mappings preserve semantic themes, semantic color roles, protected semantic precedence, and fail-closed provider/caller truth rather than translating Glaze into pixel-identical cross-platform surfaces.
- Kept platform capability, native-control availability, appearance/color capability, privacy/security state, permissions, consent, availability, and consequential execution outside Glaze authority; dev.9 does not claim finished native reference implementations, Section 24 completion, native-device/rendered/assistive-technology/performance acceptance, consumer eligibility, release, deployment, or production acceptance.
- Advanced the bounded Development aggregate to `1.7.0-dev.9` while preserving V1.6 / `1.6.0` as Official Stable and the dev.8 theme/color foundation as regression authority.

- Added the bounded `1.7.0-dev.8` Theme and Semantic Color Reconciliation Development foundation against the expanded V1.7 v1.1 plan.
- Added explicit theme-layer precedence (Accessibility → Protected Semantic State → Product Identity → User Theme → Contextual Accent → Glaze Default), protected semantic role override rejection, semantic prominence controls that prevent ordinary information from escalating to Critical, and fail-closed provider/caller semantic truth handling.
- Added local deterministic palette generation, Theme Color Roles, WCAG-oriented text/focus contrast diagnostics, and Theme Safety fallback to `glaze-default` when a custom theme is unsafe; palette generation requires no network, telemetry, wallpaper upload, remote fonts, or remote visual dependencies.
- Advanced the Development aggregate to `1.7.0-dev.8` and added explicit provenance that the retained dev.1–dev.7 `implementedSpecificationSections` numbering belongs to the historical v1.0 plan. dev.8 is a bounded v1.1 foundation and does not claim complete v1.1 sections, Advanced Theme Manager completion, Theme Packages, native/rendered acceptance, consumer eligibility, release, deployment, or production acceptance.

- Added the bounded `1.7.0-dev.7` Notification and Activity Surfaces source foundation for specification section 8, with `GlzNotificationSurface`, `GlzActivityItem`, `GlzActivityGroup`, `GlzStatusFeed`, `GlzBackgroundTask`, and `GlzProgressSurface`.
- Notification/activity kind, progress, and action availability now fail closed unless supplied with the applicable provider authority; Glaze presents the supplied truth but does not generate security/privacy state, system-notification permission, background-task execution, or action authority.
- Added profile-aware presentation and Task Continuity integration so notification/activity surfaces can adapt across Mobile, Tablet, Desktop, Foldable, TV/far-view, and Wearable without resetting the active task, focus, navigation, drafts, or provider-owned state.
- Advanced the V1.7 Development aggregate to `1.7.0-dev.7` while retaining dev.1–dev.6 and V1.6 Stable regression gates. V1.6 / `1.6.0` remains Official Stable and V1.7 remains non-consumer-eligible.

- Added the bounded `1.7.0-dev.6` System Shell Continuity source foundation for specification section 7, covering notification/activity presentation continuity, Control Center continuity, persistent layout where supported, multi-window, split-view, compact/expanded navigation, restoration, application/system handoff, task switching, shell overlays, search continuity, and contextual command surfaces.
- Shell capability and configuration truth now fails closed unless supplied authoritatively by the caller/platform; Glaze does not create windowing support, grant system privileges, generate notification/activity truth, create search/navigation authority, persist shell state, or execute consequential shell transitions.
- System-shell recomposition reuses Task Continuity and the existing V1.7 input/profile/composition/command/personalization foundations to preserve active task, navigation, focus, selection, drafts, query/filter context, pane/window context, safe pending interactions, and provider-owned truth across predictable, reversible presentation changes.
- Kept Section 8 Notification and Activity Surfaces explicitly separate: dev.6 covers presentation continuity only and does not claim the notification/activity component catalog, native shell parity, cross-device sync, or production acceptance.
- Advanced the V1.7 Development aggregate to `1.7.0-dev.6` while retaining dev.1–dev.5 as regression foundations. V1.6 / `1.6.0` remains Official Stable and V1.7 remains non-consumer-eligible.

- Added the bounded `1.7.0-dev.5` Personalization 2.0 source foundation for specification section 6, covering Light, Dark, Deep Dark, accent families, material intensity, density, geometry, motion intensity, local wallpaper/application-identity influence, and per-device Development scope semantics.
- Accessibility now has explicit precedence over aesthetic personalization, while Security, Privacy, Warning, Critical, Destructive, Restricted, Protected, and Success roles reject arbitrary personalization remapping.
- Added local-first source-authority boundaries and an 8% decorative wallpaper-influence ceiling; Glaze does not inspect wallpaper/private content, require network/telemetry/advertising/remote fonts, or invent source authority.
- Added Preview/Apply/Reset/Undo proposal semantics with explicit user intent for Apply/Reset/Undo, caller-owned persistence, no automatic cross-device sync, and no automatic consequential execution.
- Advanced the V1.7 Development aggregate to `1.7.0-dev.5` while retaining dev.1–dev.4 as regression foundations. V1.6 / `1.6.0` remains Official Stable and V1.7 remains non-consumer-eligible.
- Added the bounded `1.7.0-dev.4` `GlzCommandSurface` source foundation for specification section 5, unifying Universal Search, application search, commands, actions, contextual actions, navigation shortcuts, keyboard-first palettes, touch-oriented command/search surfaces, and remote-friendly selection under one semantic component.
- Provider scope, source identity, and action availability now fail closed independently; command items cannot be presented as executable until all applicable authority is explicit, and Glaze never performs command, navigation, permission, authorization, or consequential execution automatically.
- Added profile-specific command presentations for Mobile, Tablet, Desktop, Foldable, TV/far-view, and Wearable while preserving one semantic command identity, query/filter/selection/focus/navigation context, stable partial-result ordering, and provider-owned source/scope truth across adaptive presentation.
- Advanced the V1.7 Development aggregate to `1.7.0-dev.4` while retaining dev.1–dev.3 as regression foundations. V1.6 / `1.6.0` remains Official Stable and V1.7 remains non-consumer-eligible.
- Added the bounded `1.7.0-dev.3` First-Class Form-Factor Profiles source foundation for specification section 3, with governed Mobile, Tablet, Desktop, Foldable/posture-aware, TV/far-view, and Wearable profile semantics across thirteen profile dimensions.
- Mobile and Tablet are explicitly first-priority Development profiles; profile selection is not derived from width or device brand alone, safe areas remain platform-owned, and accessibility may reduce density/pane count without shrinking interaction targets to preserve composition.
- Added continuity-preserving transitions across all six profile families, a governed Wearable profile that does not imply native-device or production acceptance, and an explicit Spatial Experimental boundary requiring separate native-platform, accessibility, interaction, performance, and representative-device evidence.
- Advanced the V1.7 Development aggregate to `1.7.0-dev.3` while retaining dev.1 Task Continuity/Adaptive Composition and dev.2 Adaptive Input as regression foundations. V1.6 / `1.6.0` remains Official Stable and V1.7 remains non-consumer-eligible.
- Added the bounded `1.7.0-dev.2` Adaptive Input 2.0 source foundation for specification section 2, covering nine input models, authoritative semantic-action availability, input-specific presentation bindings, and Task Continuity-backed input-method changes.
- Added fail-closed semantic alternatives for drag, swipe, hover, long-press, precision-pointer, and multi-touch dependencies so unavailable or unsuitable techniques do not become the sole path to meaning or action.
- Advanced the V1.7 Development aggregate to `1.7.0-dev.2` while retaining dev.1 Task Continuity and `GlzAdaptivePane` as required regression foundations; V1.6 / `1.6.0` remains Official Stable and V1.7 remains non-consumer-eligible.
- Added the bounded `1.7.0-dev.1` Task Continuity and Adaptive Composition source foundation for specification sections 1 and 4: machine contract, fail-closed schema, semantic token map, Development runtime resolver, aggregate entrypoint, and exact-source validator.
- Task continuity now models seven governed state classes—durable, session-scoped, presentation-only, provider-owned, temporary, recoverable, and non-restorable—and preserves navigation, focus, selection, scroll position, expansion, drafts/forms, filters/query, pane/media state, safe pending interactions, and working context across governed environment changes unless an authoritative caller explicitly supplies a valid replacement or loss instruction.
- Adaptive composition maps one semantic surface across Mobile, Tablet, Desktop, Foldable, TV/far-view, and Wearable presentation forms while preserving semantic identity, accessibility semantics, task state, and provider-owned truth. Width alone is not treated as composition authority.
- The Development foundation remains presentation-only and non-consumer-eligible. It does not change `VERSION`, `registry/lifecycle.json`, Stable runtime entrypoints, V1.6 accepted evidence, downstream consumer status, release publication, deployment, or production acceptance. GLAZE UI V1.6 / `1.6.0` remains current Official Stable.
- Migrated the repository changelog authority from the retired singular `CHANGELOG.md` filename to mandatory root-level `CHANGELOGS.md` without dropping historical entries.



## Current lifecycle authority — 2026-09-19

- This promotion establishes **GLAZE UI V1.6 / `1.6.0`** as the current Official Stable, consumer-eligible shared design-system release after protected merge and authoritative `main` readback.
- V1.5.1 remains the immediate known-good rollback Stable.
- The retained `1.6.0-rc.1` record is superseded, non-consumer-eligible qualification provenance.
- The V1.6 qualification matrix is complete at **24 verified / 0 unverified / 0 not applicable** for frozen qualification source `c7509c79256b04b0aa67cb9dd0737d7588e0ae4a`.
- Final Stable security acceptance is complete for exact accepted release source `a7180679ea851389e0f3004515f9a25f420e716d`; the complete Stable Release Security Blockers applicability matrix contains 39 evaluated controls, 14 Passed/Passed-bounded, 25 Not Applicable with justification, 0 Blocked, 0 Unknown, 0 Excepted, and no security exceptions.
- Controlled tag `v1.6.0` and GitHub Release `392095913` publish the exact security-accepted artifact bytes; post-publication readback verified the archive, SBOM, provenance, and checksum manifest without rebuild.
- `VERSION` and `registry/lifecycle.json` move to `1.6.0`; `consumers/registry.json` sets `1.6.0` as the required downstream target without manufacturing downstream conformance or production eligibility.
- Direct service deployment is Not Applicable for this source-distributed shared-library boundary. Downstream consumer migration/acceptance, deployment, product production readiness, and production acceptance remain separate controlled transitions.
- Central GoreeCloud Platform Contract PR #39 reconciled the current Glaze target to `1.6.0` at evaluator revision `e49b9afdea094c96a36a0457b1603f2fa8e8fa6b`; repository PR #299 revalidated GLAZE UI V1.6 against that authority at main revision `f93cccd1383d1e93ba0cb3955713aa64f3d7c8c3`.

### Historical namespace note

Entries below that describe earlier 1.x or 2.x releases as current or Stable are retained as historical pre-reset/release provenance. They do **not** override current lifecycle authority. Current truth is determined by `VERSION`, `registry/lifecycle.json`, and the current front-door release records.


## 2.2.0 — Stable — 2026-09-01

- Promoted the accepted Glaze UI 2.2 Candidate design-system surface to `2.2.0` Stable without rewriting the human-reviewed Candidate presentation or its immutable provenance.
- Adds versioned Stable entrypoints `css/glaze-2.2.0.css` and `js/glaze-2.2.0.mjs` over preserved Candidate implementation layers.
- Promoted the bounded System Shell, 32-component contract catalog, Foundation/Structure/Overlay/Signature/Intelligence reference presentation, Universal Search and Control Center reference interactions, performance/System Glaze budget, Optical Reachability presentation, source-pinned visual regression and bounded Android handheld reference into the Stable contract.
- Preserves the Human Visual Excellence decision **Accepted** for source revision `0411b0f6dd877aea30e2c5674e1acde0105fd97b` and requires source-pinned regression to prove presentation continuity on the exact promotion head.
- Moved lifecycle, canonical token, enforcement, consumer-target, migration and Design Center authorities to the `2.2.0` Stable boundary while preserving `2.1.0` as the documented rollback and historical regression baseline.
- Keeps every downstream GoreeCloud application separately migration-gated and non-production-eligible until its own repository-local 2.2 adoption, accessibility, rendered/native and product acceptance gates pass.
- Retains compact platform-neutral wearable/spatial semantics while keeping historical native wearable evidence isolated; neither browser references nor the bounded Android handheld reference certify Wear OS, watchOS or downstream physical devices.
- Keeps Glaze Motion Experimental and prevents Candidate/Experimental capability from becoming a Stable consumer dependency by implication.
- Corrects lifecycle-transition drift discovered by fail-closed validation, including Candidate-only migration language, superseded 2.1 current-Stable assumptions, public Design Center 2.1 publication, canonical token authority, wearable lifecycle authority and the system-interaction rendered-validator path. No acceptance threshold or semantic requirement is weakened.
- Stable release completed after exact-head and post-merge GitHub/Cloudflare validation, expected-head-protected PR #115 merge as `6731098b28dd0393faa878c70d989a221d714a20`, annotated `v2.2.0` tag creation, GitHub Release `380971405`, and recorded release-closure evidence.

## 2.0.0 — Stable — 2026-08-28

- Promoted the administrator-enforced Glaze UI 2.0 design contract to the current Stable GoreeCloud design-system baseline under the governing sentence **Make interaction feel tangible.**
- Established the current Glaze Material hierarchy as Canvas / Surface / Soft Glaze / Glaze / Deep Glaze / Live Glaze, with Clear / Balanced / Solid clarity, Light / Dark / Deep Dark appearance, Calm / Balanced / Expressive expression, Connected Transformation, Navigation Capsule, Live Surfaces, foldable hinge awareness, wearable rotational navigation, and spatial floating surfaces.
- Preserved the exact 2.0 Candidate contract, token snapshot, implementation filenames, and acceptance record as immutable pre-promotion provenance rather than rewriting historical Candidate evidence.
- Promoted 48px general and 56px TV interaction floors, state-preserving no-View-Transition fallback, 1114×834 hinge-aware foldable acceptance, representative wearable rotational navigation, spatial flat fallback, increased-contrast emulation, reduced-motion/transparency, forced-colors, and no-backdrop resilience as Stable design-system evidence.
- Kept native or real-device wearable/spatial certification application-specific; the platform-neutral design-system release does not certify Wear OS, watchOS, XR hardware, crown input, native accessibility APIs, host-managed surfaces, or physical-device performance.
- Migrated canonical release-state governance, enforcement metadata, component/lifecycle/conformance/adoption records, Design Center publication, and the mandatory consumer target from 1.6.0 to 2.0.0.
- Reclassified every evidenced 1.x consumer as migration-required under the 2.0 current-Stable rule without manufacturing downstream 2.0 conformance; GoreeCloud Notes remains Unverified.
- Retained Glaze UI 1.x source/rendered suites and Glaze Motion 0.6 Experimental evidence as permanent compatibility/regression gates; Glaze Motion remains Experimental and is not promoted by the 2.0 release.
- Release-state migration exposed two wording-only validator mismatches (`View Transitions are unavailable` provenance wording and the explicit `Wearable rotational navigation` Stable boundary). Both were corrected without weakening product or rendered acceptance assertions.
- Exact promotion head `5478407bf6fbc013f28fd5100d6674dfd20c92d4` passed Glaze UI CI #505 / run `33164360997`, Semantic Color #225 / run `33164361128`, Icon Construction #190 / run `33164360987`, and Icon Identity #182 / run `33164361019`.
- Cloudflare Pages successfully deployed the exact promotion head to the PR/branch preview before merge; production promotion remains bound to the controlled `main` merge.

## 1.6.0 — Stable — 2026-08-28

- Promoted Evidence Presentation and Authority Surfaces to Stable with producer-authority separation across Wardveil Security, Privacy Shield, Everkeep, GoreeCloud Mesh, and Glaze UI presentation authority.
- Promoted Adaptive Workspace and Navigation to Stable across Mobile, Tablet, Desktop, Wide Desktop, and distinct far-view TV composition.
- Retained fail-closed rendered matrices for light/dark, reduced motion, reduced transparency, forced colors, constrained-performance fallbacks, density, target floors, and 200% text reflow.
- Fixed the Candidate 200% Mobile evidence reflow defect before promotion; the acceptance gate was not weakened.
- Candidate promotion evidence head `9a632e8df5ddd3a66c19ef2bb90efb7e65678048` passed Glaze UI CI #460, Icon Construction #145, Icon Identity #137, and Semantic Color #180 before merge as `cc50ad8debce49b254da424399768741b0a5a96e`.
- Glaze Motion remains Experimental and wearable production support remains deferred/production-blocked.
- `1.6.0` becomes the mandatory current Stable consumer target; existing 1.5 and older application evidence becomes migration input only until each consumer completes 1.6 adoption and application-specific acceptance.

## Unreleased

### Glaze UI 1.6 — Adaptive Workspace Candidate

- Added `WORKSPACE_NAVIGATION.md` as the Candidate contract for semantic window/workspace regions, title areas, navigation, toolbars, primary content, inspectors, status regions, overlays, density, input-aware targets, responsive transformation, accessibility/resilience, and platform-authority boundaries.
- Added `tokens/workspace-navigation.candidate.json` so the workspace anatomy, dimensions, target floors, geometry, navigation transformations, adaptation invariants, accessibility requirements, and authority bindings are machine-readable.
- Added `css/glaze.workspace.candidate.css` with reusable Desktop/Tablet/Mobile workspace composition, sidebar and inspector transformation, pointer/touch target adaptation, reduced-motion, reduced-transparency, no-backdrop-filter, and forced-colors behavior.
- Added `reference/candidate-1.6-workspace.html` as a dependency-free evaluation surface and `scripts/validate_workspace_navigation.py` as a fail-closed Candidate validator.
- Wired the Candidate validator into the exact-head Glaze UI CI workflow and surfaced a bounded workspace preview in the Design Center without changing the Stable production target.
- Corrected Design Center Facet authority wording: the authoritative identity source is `GoreeCloud/goreecloud-branding-assets` at `systems/glaze-ui/glaze-ui-mark.svg`; this repository publishes a synchronized byte-equivalent consumer copy.
- At the time of this historical Candidate entry, Glaze UI 1.5.0 was the current Stable baseline. The Adaptive Workspace layer did not trigger consumer migration or permit Stable 1.6 conformance claims until the normal promotion gate was completed.

### Glaze Motion — Experimental

- Motion Core 0.3 was merged as `f1f42eab087b9b49623b8db63d8ecbe399fccdf6`, adding semantic reorder/swipe/pan/zoom state, directional keyboard/remote parity, local-only frame-budget instrumentation, native mapping guidance, and reference-consumer evidence while remaining outside the Glaze UI 1.5 Stable compatibility promise.
- Motion Core 0.4 adds a compatibility-preserving aggregate runtime entry point, localization-neutral accessible reorder commands and position metadata, and a bounded local settling-animation budget that can refuse optional settling under reduced motion or saturation without blocking semantic state updates.
- Rendered Glaze Motion acceptance is expanded to Mobile, Desktop, and TV web/reference profiles in both normal and reduced-motion modes; this is development evidence and not native or real-device certification.
- Motion Core 0.5 records the first merged first-party downstream evaluation from GoreeCloud Launcher PR #22 (`23a389b3b24db726ceab5e328f9f8157fa7655ae`) after Android CI #67 passed the repository, build, unit, Room, and Android 16 emulator gates. The evaluation remains test-only and does not activate Experimental Motion in production.
- Motion Core 0.6 adds the second merged first-party native evaluation from GoreeCloud Keyboard PR #4 (`c9c0500263b40640339cf7a46f1a029d9a2ac240`). Exact head `80de7bd2dcff6d07b06b19f8250e37d20155d7ff` passed Android CI #15, including the repository quarantine/build gate and an Android 15 / API 35 x86_64 emulator reduced-motion interaction test against the real `KeyboardView` key-release and suggestion-selection paths.
- The first Keyboard emulator attempt in Android CI #13 exposed a brittle process-level animation-state assertion. The emulator gate was retained and corrected to read Android's authoritative global animator-duration setting; semantic and reduced-motion assertions were not weakened.
- The central consumer registry now records both Launcher and Keyboard as Glaze UI 1.5.0 `adoption-candidate` consumers with `productionEligible: false`; their final native/rendered/accessibility/physical-device acceptance remains pending.
- Motion Core 0.6 is an evidence/governance iteration with the 0.4.0 runtime implementation retained as its compatibility baseline; no new runtime primitive is claimed and two test-only native Android evaluations remain insufficient for Candidate promotion.
- Earlier 0.1/0.2 experimental foundation work remains superseded lineage rather than Stable product capability. Motion Studio and Motion Spatial remain Planned.

## 1.5.0 — 2026-08-25

Stable adaptive-expression and interaction-architecture release. Promotes the validated 1.5 adaptive color, iconography/construction/identity, motion/interaction, material/depth, layout/spacing/density, and semantic state/input-modality systems while retaining the complete 1.4 form-factor layer.

### Added

- Layered adaptive semantic color with protected truth families and accessibility modes.
- Governed iconography, icon construction, optical sizing, identity-lock, semantic badge, and adaptive-presentation contracts.
- Purpose-driven interruptible motion with reduced-motion substitutions and truthful progress/state rules.
- Canvas/Solid/Raised/Functional Glass/Clear Glass/Overlay material and depth architecture with reduced-transparency and constrained-performance fallbacks.
- Semantic spacing, responsive gutters, bounded measures, density modes, safe-area behavior, target floors, localization/order rules, and bounded intrinsic overflow.
- Focus-visible, hover, pressed, selected, expanded, disabled, read-only, loading, invalid, success, and mixed keyboard/pointer/touch/remote/assistive-input semantics.
- `acceptance/1.5.0.md` as the Stable release acceptance record.

### Validation and promotion

- Exact pre-promotion Candidate head `3613fe3b47827e29b23b2606db68f2ec6e7a9434` passed Glaze UI CI #375 / run `32925596296`, Icon Construction #60, Icon Identity #52, and Semantic Color #95.
- Stable release conversion preserves all subsystem/source/rendered gates; the exact final promotion head must pass the full stack before merge.
- Earlier forced-colors TV `PENDING` browser-harness attempts were treated as incomplete, not as passes; no assertion or acceptance threshold was weakened.

### Compatibility and consumer boundary

- Glaze UI 1.4.0 becomes the immediately preceding historical Stable baseline.
- All GoreeCloud-controlled user-facing consumers must migrate to 1.5.0 through evidence-backed application-specific adoption.
- Wearable applications remain production-blocked until an applicable Stable wearable contract exists.
- Privacy Shield, Wardveil Security, Everkeep, GoreeCloud Mesh, and application logic retain authority for underlying truth; Glaze UI remains presentation authority.

## 1.4.0 — 2026-08-21

Stable form-factor evolution release preserving the complete Glaze UI 1.3 expressive foundation while making Mobile, Tablet, Desktop, and TV first-class semantic interaction environments.

### Added

- `FORM_FACTORS.md` as the canonical form-factor contract based on app window, primary input, viewing distance, platform conventions, posture/resizability, and product task rather than width or device name alone.
- Platform-neutral Mobile, Tablet, Desktop, and TV semantic token roles.
- `css/glaze.formfactors.css` reusable composition primitives.
- Dependency-free Mobile, Tablet, Desktop, and TV reference experiences.
- TV far-view typography, 56px reference minimum targets, larger icon roles, directional-focus semantics, bounded focus scale/lift, overscan-safe references, and focus/selection distinction.
- A dedicated fail-closed `scripts/validate_form_factors.py` Stable contract validator.
- `acceptance/1.4.0.md` as the release acceptance record.
- A consumer-registry migration model that moves current Stable baseline metadata to 1.4 without automatically migrating downstream applications.

### Improved

- Purpose-built Phone/Mobile, Tablet, Desktop, Wide Desktop, and TV acceptance replaces generic scaled-shell assumptions.
- Form-factor fidelity now covers navigation, density, pane structure, resizable windows, touch/reachability, pointer/keyboard behavior, viewing distance, and directional focus.
- Form-factor transitions preserve task continuity, reading order, keyboard/focus order, and critical-action access.
- TV is explicitly a far-viewing, directional-input environment and must never be treated as Wide Desktop.
- The public design-site source and canonical reference now describe 1.4 as Stable while retaining the 1.3 material, expressive, accessibility, privacy, and resilience contracts.
- Stability and component-lifecycle governance from later 1.3 hardening work were reconciled into the 1.4 promotion rather than overwritten by the older candidate branch.

### Validation and Stable promotion

- Earlier candidate head `b076e10d71cb1576ab1904cce71392f4a4b636ca` passed Glaze UI CI #109 / run `32530794651`, including the full Candidate form-factor matrix.
- The stale candidate branch was reconciled onto hardened Stable main `1120f576eeeb2f5725896f85847b5470907f91cf` before promotion.
- Promotion gating caught and corrected missing historical Phone terminology, missing representative-task-flow wording, accidental removal of the retained 1.3 expressive rendered assertion, a validator wording mismatch for the stronger TV/Wide-Desktop rule, and lost live 1.3 reference examples/44px appearance targets. No gate was removed or weakened.
- Exact reconciled content-bearing head `777844030f365c3ce45205633ef05135e4df5067` passed Glaze UI CI #125 / run `32541270573`: canonical repository validation, dedicated 1.4 form-factor validation, consumer-registry validation, Firefox integration, deterministic public design-site validation, and the complete Chromium-rendered reference/form-factor matrix.
- Final exact promotion head `a8dfb979e85b2636130880bfd11cdfd4c7679b60` passed the entire promotion stack again in Glaze UI CI #128 / run `32541459970`, including the retained 1.2/1.3 rendered assertions and the complete Mobile, Tablet, Desktop, Wide Desktop, TV, reduced-motion, and TV forced-colors matrix.
- PR #28 was promoted from draft only after CI #128 passed and was squash-merged with expected-head protection as canonical Stable commit `01c86323f8b747373d308026adc8b0881855cdc5`.

### Compatibility

- Glaze UI 1.3.0 remains a supported older Stable consumer target.
- Manager remains intentionally pinned to 1.3.0, the public website consumer remains pinned to 1.1.0, Tasks remains an Adoption Candidate against 1.3.0, and unverified consumers remain unverified until separately audited.
- Native applications still require application-specific native/real-device acceptance; design-system-core Stable status does not certify downstream products.
- Speculative intelligence, agents, automation, ambient computing, voice, and operating-experience concepts remain Planned/roadmap-only.

## 1.3.0 — 2026-08-20

Stable expressive-hierarchy release based on the documented Glaze UI lineage of One UI 8.5, Liquid Glass, and Material 3 Expressive while preserving GoreeCloud's original identity and accessibility/privacy requirements.

### Added

- Explicit Glaze UI design-lineage metadata and documentation.
- `css/glaze.expressive.css` as the canonical 1.3 expressive layer.
- Functional Glass for navigation, controls, toolbars, floating actions, and transient chrome.
- Clear Glass for controls over visually rich media, with a stricter usage boundary than ordinary Glaze surfaces.
- Compact, Standard, Expressive, Hero, and Pressed shape semantics.
- Separate effects-motion and spatial-motion duration/easing semantics.
- Expressive action and tile primitives with bounded shape morphing.
- Adaptive button groups with visual emphasis that preserves logical/action order.
- Compact reachability composition helpers that support lower action zones without DOM or keyboard reordering.
