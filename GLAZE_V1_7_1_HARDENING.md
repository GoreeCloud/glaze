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

## Human qualification review control — 2026-10-03

V1.7.1 now has an exact-source local human-review control for the six retained lanes whose outstanding evidence includes a `human` group and whose non-human prerequisites are already retained or not required: Keyboard, Pointer, Representative rendering, Human visual and motion review, Privacy boundaries, and Security boundaries. The plan, schema, review-root materializer, browser review surface, validator, and protected CI bind review to frozen source `4b9d085a5177b96cc31d4270b38d792a59872e37` / `1.7.0-dev.47`, retained acceptance model `1.7.0-dev.39`, current Stable baseline `1.7.0`, and historical source baseline `1.6.0`.

The review surface requires a real human observer and supports real keyboard and pointer interaction, representative rendering checks, ordinary and Reduced Motion inspection, task/focus continuity, and authoritative/fail-closed privacy and security scenarios. It has no PASS control, generates no evidence file, persists no review notes, emits no telemetry, and cannot decide that an observation is acceptable. Any accepted human evidence must be separately recorded with exact-source identity, environment, findings, limitations, and durable provenance and then evaluated through the governed acceptance process.

The control does not close any lane by itself. If a real governed human evidence tranche is later accepted for the frozen source, the six targeted lanes have the required prerequisite groups to become evidence-group-complete; until that happens the retained matrix remains 17 complete / 20 unverified. Assistive Technology, physical-device/native, performance, energy, Section 48, lifecycle, consumer, deployment, publication, and production acceptance remain separate.

## Assistive-technology qualification control — 2026-10-03

V1.7.1 now has a dedicated exact-source manual assistive-technology review control for the retained `assistive-technology` evidence group. The plan, fail-closed session template, human procedure, exact-source review-root materializer, interactive review surface, validator, and CI self-tests bind review to frozen source `4b9d085a5177b96cc31d4270b38d792a59872e37` / `1.7.0-dev.47`, retained acceptance model `1.7.0-dev.39`, current Stable baseline `1.7.0`, and historical source baseline `1.6.0`.

The review surface exercises V1.7 Accessibility Continuity and Adaptive Input semantics with native semantic controls, predictable landmarks/focus order, live status and alert regions, explicit non-drag alternatives, task-state continuity, 200% text reflow, Reduced Transparency review support, and Forced Colors compatibility. It deliberately has no PASS control and emits no evidence file. Hosted CI validates only the protocol/control plane and synthetic negative cases; accessibility trees, keyboard automation, self-tests, and the template are not assistive-technology evidence.

A real session requires a human operator, a physical device, an identified assistive technology and version, exact source/tooling provenance, and scenario-level observations. After separate governed review, such a session may contribute the `assistive-technology` group to the Assistive technology lane and to Alternative input, but Alternative input still requires its independent `human` group. No lane is closed and no Section 41/48, lifecycle, consumer, deployment, publication, or production acceptance is created by the control itself.

## Physical-device qualification control — 2026-10-03

V1.7.1 now has a dedicated exact-source physical-device qualification control for the nine retained lanes that contain a `device` evidence group: Mobile, Tablet, Desktop, Foldable, TV, Wearable, Touch, Native behavior, and Energy behavior. The plan, schema, fail-closed candidate template, manual procedure, exact-source review-package helper, validator, and protected CI bind the control to frozen source `4b9d085a5177b96cc31d4270b38d792a59872e37` / `1.7.0-dev.47`, retained acceptance model `1.7.0-dev.39`, current Stable baseline `1.7.0`, and historical source baseline `1.6.0`.

The control requires a real physical device, a real human-operated session, concrete device/platform/build identity, and one lane-specific observation set per record. Emulators and simulators cannot satisfy Device evidence. Mobile/Tablet/Desktop/Foldable/TV/Wearable records must match the actual claimed form factor; Foldable requires folded and unfolded posture observation; TV requires actual remote/D-pad input; Wearable requires real touch or rotary input; Touch requires real touch input. Native behavior additionally requires a native implementation rather than a browser/web surface.

This tranche creates no Device evidence by itself. Form-factor lanes retain their existing rendered prerequisite, while Touch and Native behavior still require separate Human evidence. Energy behavior can receive only the Device half from this protocol; its independent `energy` group remains required. One physical device never implies an entire platform, OEM, form-factor, or native-toolkit matrix, and no Section 48, lifecycle, consumer, deployment, publication, or production authority is created by the control.

## Energy-behavior qualification control — 2026-10-03

V1.7.1 now has a dedicated exact-source Energy evidence collection control for the conditional `energy-behavior` lane. The plan, schema, fail-closed candidate template, human procedure, exact-source review-package helper, validator, and protected CI bind the control to frozen source `4b9d085a5177b96cc31d4270b38d792a59872e37` / `1.7.0-dev.47`, retained acceptance model `1.7.0-dev.39`, current Stable baseline `1.7.0`, and historical source baseline `1.6.0`.

The control requires a real physical device and direct quantitative energy or power measurement across controlled idle, representative foreground workload, constrained/low-power operation, background/off-screen lifecycle, and thermal/resource recovery. Battery percentage, thermal state, or CPU/GPU utilization alone are contextual/proxy data and cannot satisfy Energy evidence. No numeric Energy acceptance threshold is currently approved for this retained lane, so the protocol deliberately has no automatic PASS decision and may not invent one; a structurally complete measurement remains `review-required` for separate governed assessment against the GoreeCloud motion/performance standards.

Energy evidence remains separate from the independent Device evidence group required by `energy-behavior`. The control creates neither group by itself, does not close the lane, and grants no Section 48, V1.7.1 lifecycle, consumer, deployment, publication, or production authority.

## Field Human qualification companion control — 2026-10-03

V1.7.1 now has a dedicated fail-closed Human evidence companion control for the three retained lanes whose Human group cannot be honestly reviewed in the browser-only human surface: Touch, Alternative input, and Native behavior. The plan, schema, candidate template, manual procedure, validator, and protected CI bind candidate records to frozen source `4b9d085a5177b96cc31d4270b38d792a59872e37` / `1.7.0-dev.47`, retained acceptance model `1.7.0-dev.39`, current Stable baseline `1.7.0`, and historical source baseline `1.6.0`.

The control requires real human operation on real physical hardware. Touch requires actual touch input; Alternative input requires a concrete non-primary input path plus technology identity/version where applicable; Native behavior requires an actual native implementation and toolkit. Sessions may be co-scheduled with the existing Device or Assistive-Technology protocols, but evidence types remain separate: a Device or Assistive-Technology record does not automatically count as Human evidence, and the Human record does not claim Device or Assistive-Technology evidence.

CI validates only the protocol and negative cases. Emulators, simulators, templates, synthetic self-tests, and a `session-pass` value cannot close a lane. Separate governed durable review remains required, and each lane remains incomplete until its other acceptance-model evidence group is also accepted. No Section 41/48, V1.7.1 lifecycle, consumer, deployment, publication, or production authority is created by this control.

## Section 48 trust qualification control — 2026-10-03

V1.7.1 now has dedicated exact-source manual collection controls for Section 48 `provider-integration` and `privacy-security` evidence. The provider control covers Agent Activity authority, Care authority, the general Provider Integration lane, Contextual Actions, Glaze Brief, and Glaze Control Center. The privacy/security control covers Privacy Attention authority and the Privacy/Security Integration lane.

The controls are governed by `contracts/v1.7/qualification.v1.3.trust.plan.json`, use `acceptance/v1.7.1-section48-trust-qualification.md`, and provide separate fail-closed candidate templates for the two evidence types. The provider protocol requires authoritative provider identity/provenance, least privilege, provider-owned truth, no Glaze command/result/permission invention, safe failure/revocation behavior, data minimization, secret exclusion, and explicit contract compatibility. The privacy/security protocol requires privacy by default, data minimization, preserved Wardveil Security and Privacy Shield system authority, provider-local scope discipline, conflict/unattested fail-closed behavior, truth/presentation separation, permission revocation, and no telemetry/secret capture.

These are collection controls only. A `session-pass` record remains candidate evidence until separate governed review accepts exact-source durable evidence. Existing machine/rendered/device/AT/human/performance/energy/provenance controls do not automatically supply these trust-specific evidence types, and no Section 48, V1.7.1 lifecycle, consumer, deployment, publication, or production authority is created.

## Section 48 field-evidence qualification control — 2026-10-03

V1.7.1 now has a Section 48-specific field-evidence control for the remaining `human`, `device`, `assistive-technology`, `performance`, and `energy` groups. `contracts/v1.7/qualification.v1.3.field.plan.json` maps those evidence types directly to their v1.3 lanes, provides fail-closed candidate templates, a manual procedure, an exact-source review-package helper, semantic negative tests, and protected CI. Existing retained V1.7.1 Human, Device, Assistive Technology, Performance, and Energy protocols remain methodological precedents, but their evidence is never inherited automatically; every Section 48 record must explicitly target one v1.3 lane and include Section 48-specific observations.

The field protocol covers 20 Human lanes, six Device lanes, six Assistive-Technology lanes, `performance-v13`, and `energy-v13`. It rejects emulators as Device evidence, accessibility-tree/automation substitutes as Assistive-Technology evidence, single-platform claims for cross-platform expression, hosted CI as representative Performance evidence, and battery-percentage/thermal/CPU/GPU proxy-only Energy claims. Section 48 Performance requires explicit workload coverage across the governed Section 48 surfaces; Energy requires direct quantitative energy/power measurement and remains review-required because no numeric Energy acceptance threshold is approved.

`contracts/v1.7/qualification.v1.3.control-coverage.json` and `scripts/validate_glaze_v1_7_1_section48_control_coverage.mjs` now prove that all 25 Section 48 qualification/coverage lanes and all 10 required evidence types have an explicit control path: machine, rendered, provenance, provider-integration, privacy-security, human, device, assistive-technology, performance, and energy. This is **control coverage only**. Accepted Section 48 evidence remains incomplete, the evidence inventory is not complete, and no Section 48, V1.7.1 lifecycle, consumer, deployment, publication, or production authority is created.

## Section 48 governed evidence intake — 2026-10-03

V1.7.1 now has a successor governed evidence-intake packet for all 25 Section 48 dev.47 qualification and coverage lanes. `contracts/v1.7/qualification.v1.3.evidence-intake.plan.json`, `acceptance/v1.7.1-section48-evidence-intake.template.json`, and `scripts/validate_glaze_v1_7_1_section48_evidence_intake.mjs` supersede the old 21-lane dev.45 intake **for future V1.7.1 evidence admission** without rewriting that historical control. The successor intake understands the four dev.47 coverage lanes—Expression System, Contextual Actions, Glaze Brief, and Glaze Control Center—in addition to the original 21 lanes.

The packet permits incremental durable admission only for exact-source records with content-addressed `evidence+sha256:` references that have been independently accepted by governed review. Partial reviewed evidence is preserved as partial; it does not make the inventory complete. Every required evidence group must be satisfied for an applicable lane, and only conditional `energy-v13` may be marked not applicable with a specific justification. Observation time must precede evidence review time, which must not postdate the packet review. Duplicate or unsafe evidence references, stale revisions, wrong lane/type combinations, and authority overclaims fail closed.

If all required groups are independently reviewed and present, the packet may become `readyForSection48GovernedAcceptanceReview=true`. That state is deliberately not Section 48 acceptance: the intake's authority remains false for Section 48 acceptance, V1.7.1 acceptance, lifecycle promotion, consumer eligibility, deployment, publication, and production.

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
