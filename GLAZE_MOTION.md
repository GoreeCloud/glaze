# Glaze Motion

Status: **Experimental foundation (0.6.0)**  
Extends: **GLAZE UI V1.0 Stable**  
Runtime implementation baseline: **Motion Core 0.4.0**

Glaze Motion is GoreeCloud's formal motion, animation, transition, spatial-interaction, and interactive-graphics extension of Glaze UI. It does not replace the existing GLAZE UI V1.0 Stable motion contract in `MOTION.md`; it builds a richer, separately governed capability layer on top of that Stable baseline.

`Glaze UI -> Glaze Motion -> Motion Core / Motion Studio / Motion Spatial`

Only **Motion Core** has source implementation. Motion Studio and Motion Spatial remain Planned and cannot be represented as implemented, Stable, or mandatory production dependencies.

## Design rule

Motion must communicate hierarchy, causality, state, continuity, spatial relationship, focus, progress, or identity. It must not exist merely because an interface can be animated.

## Motion Core — Experimental

0.6 retains the 0.4 semantic timing, bounded springs, direct-manipulation sessions, velocity-projected snapping, semantic swipe and pan/zoom state, shared-element/View Transition fallback, component adapters, localization-neutral accessible reorder semantics, local-only frame instrumentation, bounded settling budget, native mapping guidance, reduced-motion behavior, capability fallbacks, and six-case rendered web/reference matrix.

**0.6 is an evidence/governance iteration.** It expands merged first-party downstream evidence from one to two native Android consumers and reconciles the current-Stable consumer registry. It does not add a new Motion runtime primitive. `js/glaze.motion.core.js` remains the 0.4 runtime implementation baseline.

Motion Core remains interruptible by default. Application state must never depend on an animation finishing or on a settling-animation budget ticket being accepted.

## Direct manipulation and accessible gestures

Direct manipulation is input tracking, not decorative animation. Reduced-motion mode must not detach drag, resize, pan, reorder, or similar controls from active input. Tracking remains immediate while nonessential post-gesture inertia and settling collapse.

`createReorderModel()` requires stable unique item keys and exposes deterministic move operations independent of pointer animation. `resolveDirectionalMove()` maps keyboard or directional-remote input into the same semantic move result. `resolveSwipeAction()` returns semantic start/end/none results based on bounded distance/velocity thresholds. `createPanZoomState()` provides clamped pan/zoom state while leaving application commands and permissions authoritative.

`resolveReorderCommand()` and `createAccessibleReorderController()` map directional keys plus Home/End to semantic movement. Results expose position metadata (`fromIndex`, `toIndex`, one-based `position`, `total`, and updated items) rather than hard-coded announcement sentences. Consumer applications own localization and may use the metadata for an appropriate live-region or platform-native announcement.

Task-critical gesture actions require non-gesture alternatives when the platform supports them. Cancellation must always leave valid application state.

## Shared-element transitions

`createSharedElementName()`, `setSharedElementName()`, and `startSharedTransition()` preserve identity and continuity. Stable keys are required. When View Transitions are unsupported or reduced motion is active, the state update still executes immediately.

## Component adapters

Button, disclosure, dialog, navigation, reorder, and shared-element roles map to semantic duration/easing/spring values through `createMotionAdapter()`. Reduced motion collapses timing without removing state changes.

## Performance instrumentation and settling budget

`createFrameBudgetProbe()` records frame intervals and long-task durations for local validation. It has no network reporting, analytics, persistence, or authority role. Its output is evidence for development and acceptance only; it does not itself prove that an application meets a performance target.

`createSettlingBudget()` bounds concurrent nonessential settling animations, rejects new settling work when the local budget is exhausted, and rejects settling work under reduced motion. A rejected ticket never blocks or reverses the underlying semantic state update; the caller applies the final state without the optional settling animation.

## Native mappings

`NATIVE_MOTION_MAPPINGS.md` defines semantic parity requirements for web, mobile/tablet native, desktop native, and TV native adapters. Native implementations may use platform-specific primitives but must preserve duration/spring intent, direct manipulation, cancellation, reduced-motion behavior, focus/input semantics, and producer truth boundaries.

The TV rendered profile remains web/reference evidence only. It is not native TV or real-device certification.

## First-party downstream evidence

Glaze Motion 0.6 retains the merged **GoreeCloud Launcher** evaluation and adds a second merged native evaluation from **GoreeCloud Keyboard**.

### GoreeCloud Launcher

Launcher PR **#22**, exact validated head `3095b9320b660f5e166465990d5d2bee061d7422`, was squash-merged as `23a389b3b24db726ceab5e328f9f8157fa7655ae` after Android CI #67 passed repository guards, GLAZE UI V1.0 adoption validation, the Glaze Motion evaluation quarantine guard, lint, unit tests, debug assembly, Room checks, and the Android 16 emulator runtime suite.

The evaluation maps Motion Core 0.4 reorder and settling semantics onto Launcher's real workspace ordering domain while remaining entirely under test source. A fail-closed repository guard rejects the `GlazeMotionExperimental` marker if it escapes into production Kotlin sources.

### GoreeCloud Keyboard

Keyboard PR **#4**, exact validated head `80de7bd2dcff6d07b06b19f8250e37d20155d7ff`, was squash-merged as `c9c0500263b40640339cf7a46f1a029d9a2ac240` after Android CI #15 passed its Glaze UI / Glaze Motion quarantine guard, unit tests, debug assembly, and a dedicated Android 15 / API 35 x86_64 emulator job.

The evaluation maps Glaze Motion 0.5 timing, press-state, optional-settling, and reduced-motion semantics onto Keyboard's real first-party `KeyboardView`. The accepted instrumentation verifies actual key-release commit behavior and suggestion hit-testing while Android's animator duration scale is disabled. Experimental mapping remains under Android test source and repository-local governance rather than production Keyboard code.

The first Keyboard emulator run in Android CI #13 exposed a brittle test assumption: `ValueAnimator.areAnimatorsEnabled()` did not reliably represent the runner's already-applied global animation setting inside the instrumentation process. The gate was retained and corrected to read `Settings.Global.ANIMATOR_DURATION_SCALE` directly; the semantic and reduced-motion assertions were not weakened.

Launcher and Keyboard both target GLAZE UI V1.0 as **Adoption Candidates** and remain `productionEligible: false`. Their final native/rendered/accessibility/physical-device acceptance is incomplete. Therefore:

- both evaluations are valid first-party development evidence;
- Experimental Glaze Motion is **not** a production dependency of either consumer;
- neither consumer is `aligned-current-stable`;
- two test-only native Android evaluations are still insufficient for Motion Core Candidate promotion.

The original 0.6 Experimental acceptance record was retired from the current tree during the inherited-version normalization at commit `f16f87c20be97ebab020cabadc56825f0baf3e37`; its historical evidence remains recoverable from exact commit `974c6043281db1497973ef2b5ebc149440cd476b`. The current V1.7 lifecycle evaluation is recorded in `docs/development/v1.7-glaze-motion-lifecycle-reconciliation-20260926.md` and does not rewrite that historical evidence.

## Reference consumer evidence

`reference/glaze-motion-consumer.mjs` remains the dependency-free representative state consumer for reorder, shared-transition fallback, and local performance evidence. `reference/glaze-motion.html` exercises the 0.4 aggregate entry point and accessibility/performance extensions in rendered acceptance.

These design-system references remain required regression evidence. They do not certify production applications.

## Motion Studio — Planned

Motion Studio remains the planned richer storytelling tier for product websites, onboarding, interactive diagrams, Rive/SVG/Canvas animation, bounded particles/parallax, dimensional cards, cinematic transitions, interactive heroes, and advanced reveal choreography. It is not implemented by 0.6.0.

## Motion Spatial — Planned

Motion Spatial remains the planned advanced tier for Three.js, WebGL2, WebGPU, interactive 3D, data/mesh visualization, product demonstrations, real-time graphics, and simulation. Progressive fallback remains `WebGPU -> WebGL2 -> Canvas/SVG/CSS -> static accessible representation`.

## Motion tokens

`tokens/glaze-motion.json` is the machine-readable Experimental 0.6 contract. It preserves the 0.4 runtime semantics and records first-party downstream evidence as an array so evidence can expand without duplicating a singular consumer contract. Both Launcher and Keyboard evaluations are test-only, non-production, non-native-certified, and individually insufficient for Candidate promotion.

## Runtime API

`js/glaze.motion.js` remains the 0.3 compatibility primitive module. `js/glaze.motion.accessibility.js` remains the 0.4 accessibility and settling-budget extension. `js/glaze.motion.core.js` remains the 0.4 aggregate Motion Core entry point and re-exports both modules without breaking existing 0.3 imports.

No new runtime API is introduced by 0.6.

## Accessibility and reduced motion

Reduced motion removes decorative translation/scaling, parallax, loops, camera-like travel, and post-gesture settling; durations collapse to zero; direct manipulation still tracks input; semantic state remains perceivable; keyboard/remote alternatives remain available; task completion must not be delayed.

Accessible reorder results are semantic and localizable. The design-system runtime does not dictate user-facing English announcement copy. Focus, reading order, localization, assistive feedback, and application truth remain consumer responsibilities and must be validated in real consumer adoption.

Keyboard's Android 15 emulator evidence verifies one concrete platform-disabled-animation interaction path, but it does not substitute for TalkBack, switch-access, broader assistive-technology, or representative physical-device acceptance.

## Rendered acceptance

0.6 retains the 0.4 six-case deterministic web/reference matrix: Mobile normal, Mobile reduced motion, Desktop normal, Desktop reduced motion, TV normal, and TV reduced motion. The harness asserts duration collapse, direct-manipulation retention, drag/snap/swipe behavior, accessible reorder metadata, pan/zoom bounds, settling-budget behavior, local-only performance evidence, and shared-transition fallback.

This matrix remains design-system regression evidence. It does not replace downstream application rendered tests or native/real-device acceptance.

## Performance and resilience

Motion Core targets 60 fps with a nominal 16.67 ms frame budget and 50 ms long-task boundary. It prefers transform/opacity, avoids persistent `will-change` and autonomous loops, bounds concurrent settling work to the governed limit, and preserves essential content/actions when animation support fails. Performance probes and settling budgets are local-only and never introduce telemetry.

Launcher and Keyboard evidence does not claim representative-device Motion performance, power, thermal, input-latency, or frame-pacing acceptance; those remain promotion gaps.

## Privacy, security, and authority

Glaze Motion is presentation infrastructure. Privacy Shield supplies privacy truth; Wardveil Security supplies security/protection truth; Everkeep supplies resilience/backup/recovery/preservation truth; GoreeCloud Mesh supplies coordination/governance truth; product logic supplies workflow/ordering/progress truth. Motion must never invent or prematurely animate those states.

## Validation and promotion

Glaze Motion 0.6.0 remains **Experimental** and outside GLAZE UI V1.0 Stable. Source validation, runtime/interaction/accessibility/reference-consumer tests, native mapping documentation, local performance instrumentation, rendered acceptance, and two merged first-party test-only native Android evaluations provide stronger development evidence than 0.5, but they do not establish Candidate or Stable readiness.

Candidate or Stable promotion still requires additional representative consumer and physical-device evidence, applicable assistive-technology and performance acceptance, compatibility/migration review, dependency/security/licensing review, and normal Glaze UI promotion governance. V1.7 Section 34 evaluates the current evidence across accessibility, native-platform behavior, frame pacing, interaction latency, interruption, reversal, Reduced Motion, physical-device behavior, energy impact, and human motion review. The current dev.26 evaluation retains Glaze Motion 0.6 as Experimental because no bounded subset satisfies all ten independent promotion requirements.
