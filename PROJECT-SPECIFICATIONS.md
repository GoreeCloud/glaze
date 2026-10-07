# Glaze — Project Specifications

**Repository:** `GoreeCloud/glaze`  
**Project type:** Shared GoreeCloud visual, interaction, accessibility, adaptive-presentation, and component design system  
**Current Official Stable / Anchor:** Glaze V1.7 / `1.7.0`  
**Immediate Stable rollback:** GLAZE UI V1.6 / `1.6.0`  
**Current Development line:** Glaze V1.7.1 / `1.7.1-dev.1`, inheriting historical V1.7 dev.47 source as Development-only input  
**Migration baseline:** `8e8d37886692cada9ebbaf5c5c17783a96c93892`  
**Canonical lifecycle authority:** `registry/lifecycle.json`  
**Canonical machine version:** `VERSION`  
**Canonical project record:** `PROJECT-RECORD.md`  
**Canonical authority:** This file becomes the long-lived project specification once accepted on the default branch.

## Migration and precedence

This file reconciles the active Google Drive **Project Specification — Glaze UI.docx** (file ID `1PAd324pXcgP5yPqlZRaTCbZZzKkGrykQ`) with the current protected GitHub repository.

The Drive source is historically valuable but materially stale as a current-state authority: it records older V1.1–V1.3 lifecycle checkpoints and the former repository identity `GoreeCloud/goreecloud-glaze-ui`. Current verified repository lifecycle, release, acceptance, and source records control factual current-state claims.

Version-coupled requirements remain in release-specific contracts and acceptance records. Current implementation state is governed by `IMPLEMENTED-FEATURES.md`; planned/open work by `PLANNED-FEATURES.md`; chronology by `CHANGELOGS.md`; lifecycle by `registry/lifecycle.json`.

Historical lifecycle statements in the Drive source remain provenance and do not override current Glaze V1.7 / 1.7.0 Stable/Anchor authority or V1.7.1 Development scope.

## 1. Product role

Glaze UI is GoreeCloud's shared presentation and interaction system.

It governs, where applicable:
- visual hierarchy;
- semantic color;
- typography;
- iconography;
- spacing and geometry;
- material and depth;
- layout and responsive composition;
- accessibility and resilience presentation;
- component semantics;
- focus and input presentation;
- motion semantics;
- adaptive form-factor presentation;
- system-shell presentation patterns;
- command/search surfaces;
- notification/activity presentation;
- personalization presentation;
- conformance and adoption evidence;
- governed expression resolution;
- contextual and adaptive experience surfaces;
- transparent AI and agent-activity presentation.

Glaze UI is a **presentation system**. It does not become the authority for security, privacy, identity, authorization, consent, permissions, recovery, backup, synchronization, availability, capability, policy, or other provider-owned truth.

## 2. Governing principle

The interface may change shape, scale, typography, containment, material, color, composition, motion, density, or input mapping as the environment changes; the user's task, intent, accessibility requirements, preferences, identity, and authoritative system truth must remain continuous.

Presentation may adapt from authoritative context and capability truth, but must never manufacture or expand that truth.

When provider authority is missing, ambiguous, stale, unsupported, or conflicting, Glaze UI must fail closed rather than infer a positive state.

## 3. Material and hierarchy model

Glaze UI uses a bounded material hierarchy:

`Canvas → Surface → Soft Glaze → Glaze → Deep Glaze → Live Glaze`

Core rule:

**Solid where users read or make explicit critical decisions. Glazed where users interact with transient navigation, command, search, control, or feedback chrome.**

Glaze Material exists to communicate hierarchy, interaction, continuity, identity, and spatial organization. It is not a decorative objective.

Readable or consequential content must remain understandable when blur, transparency, animation, depth, environmental effects, or optional rendering capabilities are unavailable.

## 4. Semantic color system

Color is a communication layer, not decoration.

Color roles must communicate meaningful identity, hierarchy, state, priority, interaction, availability, privacy, security, synchronization, protection, or another verified condition.

Glaze UI separates:
- **Identity** — which product or experience the user is using.
- **Interaction** — selection, focus, press, navigation, editing, manipulation.
- **Semantic State** — what is actually happening and how important it is.

When these layers conflict, Semantic State has priority.

Protected meanings such as warning, danger, privacy, security, protected, restricted, destructive, unavailable, success, and critical must not be arbitrarily remapped by product identity or personalization.

Color must never be the sole carrier of essential meaning. Important conditions require additional text, iconography, geometry, borders, labels, material, or accessible state description.

Glaze UI must not visually imply secure/private/protected/backed-up/synchronized/verified/available state unless the appropriate authoritative system supplies that truth.

## 5. Accessibility and resilience

Accessibility is part of the product contract.

Applicable Glaze UI behavior must account for:
- Reduced Motion;
- Reduced Transparency;
- Increased Contrast;
- Forced Colors;
- large text and 200%-class reflow;
- keyboard input;
- pointer and touch;
- coarse pointer;
- assistive technology;
- screen readers;
- RTL/localization;
- input modality changes;
- constrained rendering;
- degraded optional presentation capability.

Normal interaction floors use a 48 px / equivalent reference minimum where applicable, with conservative 56 px / equivalent treatment for Touch Assistance, far-view, or similarly governed conditions.

Accessibility takes precedence over aesthetic richness and personalization.

Meaning, interaction, state, and task completion must survive the loss of optional visual effects.

## 6. Adaptive presentation and form factors

Glaze UI is capability- and context-aware rather than device-model-driven.

Supported semantic profiles may include:
- Mobile;
- Tablet;
- Desktop;
- Foldable/posture-aware;
- TV/far-view;
- Wearable;
- future separately governed profiles.

Responsive scaling alone is insufficient.

Composition should consider effective window size, safe regions, hinge/fold/occlusion geometry, posture, input modality, viewing distance, density, accessibility state, task context, and platform capability.

### Foldable and posture continuity

Where a consumer supports foldable, flip, dual-screen, split-view, multi-window, or posture-changing environments, Glaze UI should:
- preserve navigation/task/focus/selection/scroll/draft/media/session continuity;
- avoid placing critical controls in inaccessible or occluded regions;
- avoid stretched-phone layouts on expanded surfaces;
- avoid compressed large-screen layouts on cover displays;
- preserve applicable accessibility and target floors;
- degrade optional effects before sacrificing responsiveness or usability.

Physical-device or OEM-specific claims require exact-revision evidence where those behaviors matter to the production claim.

## 7. Task continuity

Task Continuity is a first-class design invariant.

Across governed environment changes, presentation should preserve applicable:
- navigation context;
- focus;
- selection;
- scroll position;
- expanded/collapsed state;
- drafts and forms;
- query and filters;
- pane/window state;
- media state;
- safe pending interaction context;
- provider-owned truth.

Glaze UI must not reset or mutate task state merely because presentation changes.

Authoritative caller instructions may replace or discard state only when the contract explicitly allows it.

## 8. Input adaptation

Input adaptation may support:
- touch;
- mouse/pointer;
- keyboard;
- remote/far-view input;
- stylus/precision input;
- assistive input;
- platform-specific native input systems.

Hover is enhancement, not authority.

Actions that depend on drag, swipe, hover, long press, precision input, or multi-touch must have semantic alternatives when those techniques are unavailable or unsuitable.

Focus-visible state must remain distinct from semantic selection/current state.

Disabled presentation must not advertise executable behavior.

## 9. Motion

Motion must explain interaction, hierarchy, continuity, state, or identity rather than exist merely as decoration.

Requirements include:
- semantic motion intent rather than arbitrary animation parameters;
- interruption and reversal where interaction requires it;
- preserved final semantic state even if animation is skipped;
- Reduced Motion equivalents;
- motion-fatigue protection;
- bounded performance cost;
- no motion-dependent essential meaning.

### Glaze Signature Motion

The V1.7 Development line introduces a separately governed Signature Motion system with named semantic transition families.

Current `1.7.0-dev.14` is a bounded Development foundation for V1.7 plan v1.2 Section 22 only.

It does not make V1.7 consumer-eligible, Release Candidate, Stable, deployed, or production accepted.

Glaze Motion 0.6 remains separately governed Experimental work and is not promoted merely because V1.7 integrates motion semantics.

## 10. Personalization and themes

Glaze UI supports bounded personalization while preserving protected state semantics and accessibility.

Applicable personalization may include:
- Light, Dark, and Deep Dark;
- accent families;
- material intensity;
- density;
- geometry;
- motion intensity;
- local caller-supplied identity/environment context;
- preview/apply/reset/undo semantics.

Accessibility and protected semantic state take precedence over aesthetic preferences.

Ordinary personalization must not create remote data collection, telemetry, advertising, wallpaper upload, or content inspection authority.

Persistence and cross-device synchronization remain caller/platform responsibilities unless separately governed.

## 11. Command, search, and system surfaces

Glaze UI may provide semantic presentation contracts for:
- Universal Search;
- application search;
- command palettes;
- contextual commands;
- navigation shortcuts;
- Control Center-like surfaces;
- notification/activity surfaces;
- background-task presentation;
- progress surfaces;
- shell overlays;
- system-shell composition.

Source identity, scope, capability, action availability, ordering, navigation, execution, and provider state remain external authority.

A presented action must not be treated as executable until the responsible provider/caller supplies valid authority.

## 12. Components

The design system maintains reusable component contracts with explicit state, accessibility, responsive, input, material, and performance behavior.

Components should define or support, where applicable:
- rest;
- hover;
- focus;
- pressed;
- selected/current;
- disabled;
- unavailable/restricted/unsupported;
- loading/stale/error;
- validation;
- read-only;
- destructive;
- success/warning/critical state.

Component composition should avoid unnecessary nested transparency, repeated borders/padding, conflicting elevation, and visual noise.

Dense information surfaces must preserve legibility and accessible row/column semantics.

## 13. Typography and iconography

Typography uses semantic roles rather than product-local arbitrary styling.

Type must adapt safely to text scaling, localization, language, environment, and form factor without hiding essential content.

Iconography must preserve:
- semantic consistency;
- recognizable construction;
- accessibility;
- platform-appropriate adaptation;
- product identity without replacing semantic state.

Directional icons and interaction affordances must adapt correctly for RTL where applicable.

### Shared icon and glyph registry — mandatory Development capability

Glaze **must provide a shared, versioned, authoritative icon and glyph registry** so GoreeCloud applications and services resolve approved visual symbols by stable semantic identifiers rather than maintaining independent, diverging icon sets. The V1.7.1 Development source contains the initial registry schema, catalog, first-party vector sprite, local resolver/search API, compatibility aliases, machine validation, and review surface. This is a **Development source foundation only**: it does not establish Stable qualification, production acceptance, native-platform qualification, or downstream consumer adoption.

The registry must:
- distinguish reusable interface icons, compact semantic glyphs, and first-party application/service identity packages; retain the distinct Identity DNA and Identity Lock requirements for product and service artwork;
- supply stable namespaced identifiers, meanings, categories, canonical vector sources, allowed optical sizes and variants, provenance, usage rights, ownership, lifecycle/version, and deprecation/replacement metadata;
- define semantic role, Glaze geometry and stroke/optical weight, color-token and interaction-state mappings, light/dark/high-contrast/forced-color adaptations, accessible name/description behavior, decorative treatment, and RTL directional behavior;
- enable platform adapters and applications to consume the same approved semantic catalog without requiring pixel-identical native rendering or network access for ordinary presentation;
- preserve platform-native accessibility, input, density, and rendering behavior; reserve protected semantic status and product/provider truth to their authoritative owners;
- prevent silent duplication, naming collisions, unreviewed icon overrides, unlicensed artwork, unsafe SVG resources, or ad hoc product-local copies of approved shared assets;
- enforce machine-readable schema validation, provenance and asset integrity checks, contrast/legibility and optical-size coverage, deterministic resolution and fallback, compatibility/deprecation checks, and representative rendered/human accessibility review before production qualification.

The existing `ICON_CONSTRUCTION.md`, `ICON_IDENTITY.md`, `ICONOGRAPHY.md`, and `schemas/icon-manifest.schema.json` govern related construction/identity behavior and must be reused rather than replaced by a competing registry authority. `FR-020` remains open in `PLANNED-FEATURES.md` until applicable rendered/human accessibility review, native/platform qualification, production qualification, and downstream adoption obligations are separately verified.

## 14. Loading, progress, feedback, and recovery

Loading and progress presentation must remain truthful.

Glaze UI may present:
- skeletons;
- progress;
- stale content;
- background refresh;
- errors;
- retry/recovery actions;
- offline/degraded state;
- notifications;
- banners/toasts/inline/dialog feedback.

It must not invent numeric progress, recovery availability, connectivity truth, data safety, retry authority, or destructive-action authority.

Caller-authorized recovery actions may be presented; Glaze UI does not execute consequential recovery automatically.

## 15. Performance and energy

Presentation quality must degrade gracefully under constrained rendering, power, thermal, or performance conditions.

Optional effects may simplify before:
- accessibility;
- semantic truth;
- readability;
- interaction floors;
- task continuity;
- essential state;
- user control.

Performance budgets and qualification are evidence-bound to the reviewed environments in the applicable release contract.

Shared-library performance acceptance does not establish downstream application performance.

## 16. Native platform mapping

Glaze UI defines shared semantics, not pixel-identical cross-platform rendering.

Native kits and adapters may map Glaze semantics into:
- Android / Jetpack Compose;
- Apple / SwiftUI;
- Web;
- supported Linux native toolkits;
- other separately approved environments.

Native controls should be used when they improve accessibility, integration, ergonomics, input behavior, performance, or platform consistency while preserving Glaze semantics.

Platform capability, permissions, native-control availability, accessibility APIs, system appearance, safe areas, and device behavior remain platform-owned.

## 17. Consumer conformance

No downstream application is upgraded merely because a shared Glaze release is Stable.

Every applicable controlled consumer must independently:
- adopt the current required Stable release;
- bind adoption to an exact revision;
- implement applicable semantics rather than only change version strings;
- validate its supported platforms/form factors;
- validate accessibility;
- validate interaction/task continuity;
- validate performance where applicable;
- preserve rollback;
- complete its own production/release acceptance.

Prior consumer acceptance must not be rebound automatically to a new Glaze revision.

## 18. Evidence and qualification

Lifecycle and acceptance claims require exact-revision evidence.

Applicable evidence may include:
- machine tests;
- rendered evidence;
- human optical review;
- assistive-technology review;
- native/device evidence;
- representative performance measurements;
- privacy/security/authority review;
- artifact provenance;
- post-merge readback.

A complete automated matrix does not automatically replace human/manual/physical evidence when the contract requires it.

Evidence must remain bound to the exact reviewed source and claimed environment.

## 19. Stable lifecycle

Current Stable/Anchor authority is Glaze V1.7 / `1.7.0`; GLAZE UI V1.6 / `1.6.0` is the retained rollback release.

The shared release is consumer-eligible as a design-system source release.

The V1.6 qualification source is `c7509c79256b04b0aa67cb9dd0737d7588e0ae4a`.

The security-accepted release source is `a7180679ea851389e0f3004515f9a25f420e716d`.

The controlled release is published as tag `v1.6.0` and GitHub Release `392095913`, with artifact SHA-256 `687268b5eb76917eccae9d935ffa1bead333d5dee50b6098e996a3f44cee50af`.

V1.5.1 is the immediate known-good Stable rollback baseline.

Downstream consumer conformance remains separate.

## 20. V1.7 Development boundary

V1.7 is Development-only and non-consumer-eligible.

The detailed planned successor specification is `GLAZE_UI_V1_7_PLANNED.md` v1.3, themed:

**Interaction Continuity + Personal Expression + Adaptive Intelligence + Signature Motion**

Historical Development tranche numbers remain bound to the plan revision under which they were implemented:
- dev.1–dev.7: historical v1.0-plan provenance;
- dev.8–dev.13: historical v1.1-plan provenance;
- dev.14–dev.39: v1.2-bound source foundations and acceptance-control work.

Plan v1.3 appends Section 48 without renumbering or reinterpreting the existing v1.2 sections. The detailed expansion is maintained in `docs/v1.7/GLAZE_UI_V1_7_EXPRESSION_ADAPTIVE_INTELLIGENCE.md`.

The v1.3 expansion adds the Glaze Expression System, Semantic Geometry, Visual Scale and Emphasis, Expressive Typography, Semantic Containment, Component Expression, Expression Resolution, Glaze Contextual Actions, Glaze Brief, Glaze Control Center, Glaze Workspace, Glaze Compact Surface, Glaze Agent Activity, Glaze Privacy Attention, Glaze Accessibility Presentation, Glaze Creative Surface, Glaze Compare, and Glaze Care Surface.

Adaptive intelligence remains presentation-focused and cannot manufacture user intent, consent, authorization, permission, privacy/security status, identity, connectivity, availability, success, completion, recovery, or other provider-owned truth.

Accessibility outranks optional expression. Performance, thermal, power, and energy constraints may simplify optional richness without reducing task continuity, direct manipulation, semantic meaning, accessibility, essential interaction, or authoritative state.

Personalization may change expression. **Personalization must not change truth.**

The historical v1.2 Development aggregate remains frozen at `1.7.0-dev.39`. V1.7 plan v1.3 Section 48 has begun bounded source implementation: `1.7.0-dev.40` implements the Expression System Core and `1.7.0-dev.41` implements Glaze Contextual Actions, Glaze Brief, and Glaze Control Center. The remaining Section 48 adaptive surfaces are still planned, Section 48 is incomplete, and existing dev.39 acceptance control does not automatically accept any v1.3 requirement.

Current Development integration does not change `VERSION`, Stable runtime entrypoints, V1.6 published evidence, consumer eligibility, or downstream acceptance.

## 21. Privacy and external-dependency posture

Ordinary Glaze UI presentation should remain local-first.

Glaze UI must not require:
- ads;
- tracking;
- profiling;
- remote fonts;
- unnecessary network calls;
- private-content upload;
- mandatory AI services;
- external identity merely to render the design system.

When context is supplied by callers, Glaze UI should consume the minimum semantic information required for presentation.

## 22. Open-source and portability requirements

The project must remain:
- source-controlled;
- reviewable;
- testable;
- portable;
- documented;
- reproducible enough for governed release evidence;
- usable without proprietary hosted presentation authority.

Release artifacts, schemas, contracts, validators, tokens, and reference implementations must remain traceable to source.

## 23. Documentation and governance

Current authority is divided deliberately:

- `PROJECT-SPECIFICATIONS.md` — long-lived product requirements.
- `PROJECT-RECORD.md` — significant project decisions/history.
- `VERSION` / `registry/lifecycle.json` — current lifecycle authority.
- `IMPLEMENTED-FEATURES.md` — implemented capability inventory.
- `PLANNED-FEATURES.md` — planned/open obligations.
- `CHANGELOGS.md` — implementation/release chronology.
- release contracts and acceptance records — exact version-scoped authority.

Historical Drive documents are migration inputs and provenance, not parallel current authority after migration acceptance.

## 24. Maintenance principle

Glaze UI must evolve without erasing evidence or silently changing authority.

New releases must:
- preserve or explicitly replace known-good rollback paths;
- retain historical acceptance provenance;
- avoid relabeling old evidence as new evidence;
- keep consumer migrations separate;
- preserve accessibility and protected semantic meaning;
- document lifecycle changes explicitly.

Beauty is a requirement, but beauty never outranks truth, accessibility, continuity, or user control.
