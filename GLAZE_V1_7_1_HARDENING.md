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

V1.7.1 carries these 21 still-open retained v1.2 lanes:

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
17. Regression
18. Human visual and motion review
19. Assistive technology
20. Privacy boundaries
21. Security boundaries

The existing 16 evidence-group-complete lanes remain exact-source evidence provenance for `4b9d085a5177b96cc31d4270b38d792a59872e37`; they are not automatically rebound to a changed V1.7.1 source revision.

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

The remaining native/device, assistive-technology, performance, energy, regression, human-review, input, form-factor, representative-rendering, privacy, security, and Section 48 evidence must be gathered for the exact V1.7.1 candidate that is actually proposed for promotion.

## Provenance rule

Historical `1.7.0-dev.*` version identifiers remain historical. New work must advance the V1.7.1 line instead of rewriting those identifiers. Evidence may be reused only where source-impact continuity is explicitly demonstrated and the governing evidence model permits carry-forward.

## Authority boundary

V1.7.1 Development is non-consumer-eligible. It grants no deployment, production, downstream-consumer, or lifecycle authority.
