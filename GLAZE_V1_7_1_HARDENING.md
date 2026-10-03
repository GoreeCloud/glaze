# Glaze V1.7.1 — Qualification Hardening and Feature Completion

**Lifecycle:** Development  
**Version:** `1.7.1-dev.1`  
**Stable baseline:** `1.7.0`  
**Historical source input:** `1.7.0-dev.47`  
**Historical exact source revision:** `4b9d085a5177b96cc31d4270b38d792a59872e37`  
**Development entrypoint:** `js/glaze-v1.7.1-development.mjs`  
**Established:** 2026-10-03

## Purpose

V1.7.1 is the controlled successor track for every Glaze V1.7 capability, qualification lane, and acceptance obligation that was unfinished or unverified when V1.7.0 was stabilized.

V1.7.0 deliberately ships the inherited accepted V1.6.0 runtime behavior. The richer V1.7 dev.47 implementation is not discarded; it becomes the starting Development input for V1.7.1 and remains non-consumer-eligible until its applicable evidence closes.

## Carried qualification lanes

V1.7.1 now carries these 20 still-open retained v1.2 lanes after the exact-source rendered Regression checkpoint:

1. Frame pacing
2. Input latency
3. Mobile
4. Tablet
5. Desktop
6. Foldable
7. TV
8. Wearable
9. Keyboard
10. Pointer
11. Touch
12. Alternative input
13. Representative rendering
14. Native behavior
15. Performance
16. Energy behavior
17. Human visual and motion review
18. Assistive technology
19. Privacy boundaries
20. Security boundaries

The existing 17 evidence-group-complete lanes remain exact-source evidence provenance for `4b9d085a5177b96cc31d4270b38d792a59872e37`; they are not automatically rebound to a changed V1.7.1 source revision.

## Retained Regression checkpoint — 2026-10-03

PR #393 qualified the retained `regression` lane for frozen historical source `4b9d085a5177b96cc31d4270b38d792a59872e37` under V1.7.1 Development. Exact tooling head `83c8d783dc57a78ad87d0819e06bd59782978989` passed the full exact-head matrix before merge at `8508f2636fe2364d041bb36f1d4a78c154978018`. GitHub Actions run `37157473094` completed successfully; verification job `111303763574` and rendered comparison job `111303887933` both passed. Artifact `11286278764` (`glaze-v1.7-v1.2-rendered-regression-37157473094`) was recorded with digest `sha256:cb55b581668f6007b9ed56d53fca3a318ae773639f6a9e7620b22a4cf4d2e2e5`.

The comparison preserved the historical dev.47 semantic baseline, captured all 22 scenes twice under deterministic capture-only normalization, and required decoded-pixel SHA-256 equality at zero tolerance. Semantic baseline matching and fresh visual repeatability both passed. The durable canonical record is `acceptance/v1.7.1-regression-evidence.json`.

Combined with the already retained machine evidence for the same frozen source, this makes 17 of 37 retained v1.2 lanes evidence-group-complete and leaves 20 lanes unverified. This checkpoint is historical-source evidence only: it is not automatically rebound to any changed V1.7.1 candidate and creates no Section 48, governed-review, lifecycle, consumer, deployment, production, privacy, security, device/native, human, assistive-technology, performance, or energy acceptance.

## Representative performance qualification control — 2026-10-03

V1.7.1 now has a local-first exact-source performance qualification control for the frozen historical dev.47 source. `contracts/v1.7/qualification.v1.2.performance.plan.json`, `reference/v1.7/performance-qualification.html`, and `scripts/prepare_glaze_v1_7_1_performance_qualification.py` bind the measurement to source `4b9d085a5177b96cc31d4270b38d792a59872e37`, source model `1.7.0-dev.47`, retained acceptance model `1.7.0-dev.39`, current Stable baseline `1.7.0`, and historical source baseline `1.6.0`.

The control targets the three retained lanes whose complete evidence group is `performance`: Frame pacing, Input latency, and Performance. It uses the approved GoreeCloud Glaze UI Performance Budget v1.0, requires at least 200 resolver samples, 30 real user-triggered interaction-to-painted-update samples, 120 idle frame intervals, and 240 active frame intervals, and exercises actual V1.7 adaptive-composition, semantic-color, Motion Performance, Performance and Energy Awareness, Expression System, and Task Continuity resolvers. Hosted CI may validate only this control plane; it may not claim representative performance.

The harness requires explicit reviewer confirmation that the observed hardware/runtime remains representative and explicit review of automatic authority incidents before it can emit a passing candidate measurement. A passing candidate still cannot close any lane automatically; separate durable exact-source review and evidence governance are required. Energy behavior is intentionally outside this tranche because its acceptance model requires both `energy` and `device` evidence. No representative performance measurement or performance-lane acceptance is claimed by the control itself.

## Section 48

All Section 48 Expression System and Adaptive Intelligence surfaces move to V1.7.1 for qualification and release purposes:

- Expression System Core
- Contextual Actions
- Glaze Brief
- Glaze Control Center
- Workspace
- Compact Surface
- Accessibility Presentation
- Agent Activity
- Privacy Attention
- Care Surface
- Creative Surface
- Compare

Their bounded source implementations remain available through historical dev.40–dev.44 and the dev.45–dev.47 qualification-control lineage, but source completeness is not acceptance.

## Mandatory Stable gates

V1.7.1 may not be promoted to Stable while an applicable privacy or security requirement remains incomplete, failed, stale, conflicting, or unverified. Privacy and security are prerequisites, not post-Stable work.

The remaining native/device, assistive-technology, performance, energy, human-review, input, form-factor, representative-rendering, privacy, security, and Section 48 evidence must be gathered for the exact V1.7.1 candidate that is actually proposed for promotion.

## Provenance rule

Historical `1.7.0-dev.*` version identifiers remain historical. New work must advance the V1.7.1 line instead of rewriting those identifiers. Evidence may be reused only where source-impact continuity is explicitly demonstrated and the governing evidence model permits carry-forward.

## Authority boundary

V1.7.1 Development is non-consumer-eligible. It grants no deployment, production, downstream-consumer, or lifecycle authority.
