# Glaze Stability Contract

**Current Stable/Anchor authority:** Glaze V1.7 / `1.7.0`  
**Immediate rollback baseline:** GLAZE UI V1.6 / `1.6.0`  
**Current lifecycle source:** `registry/lifecycle.json`

## Stability principles

1. Stable behavior fails closed when required evidence is absent.
2. Accessibility and semantic clarity outrank optional expression and decorative effects.
3. Exact-revision evidence is required for claims that depend on human, runtime, device, artifact, privacy/security, performance, energy, or platform observations.
4. Lifecycle scope decisions must never manufacture missing evidence.
5. Privacy or security requirements applicable to included Stable behavior may not be deferred until after Stable.
6. Presentation adaptation must preserve provider truth, authority boundaries, task continuity, and understandable state.
7. Glaze must not infer authorization, grant permission or consent, or automatically execute navigation, consequential actions, or fallbacks.
8. Platform-native claims require representative platform-native evidence.
9. Downstream product readiness remains product-specific and repository-local.
10. Recovery preserves previous known-good releases and exact source history.

## Current V1.7.0 boundary

V1.7.0 is a bounded stabilization release. `js/glaze-v1.7.0.mjs` inherits `js/glaze-v1.6.0.mjs` and does not import the retained V1.7 Development aggregate.

The exact bounded source anchor is `7c4ded83d7a8725165bb6a55dfb175667cc9589e`. Unfinished or unverified dev.47 and Section 48 behavior is excluded from Stable and transferred to V1.7.1.

## V1.7.1

`GLAZE_V1_7_1_HARDENING.md` controls the 21 retained open qualification lanes plus Section 48 acceptance. V1.7.1 is Development and non-consumer-eligible until separately qualified and promoted.

## Consumer boundary

No downstream application becomes `1.7.0`-conformant merely because the shared design system is current. Fresh repository-local V1.7.0 adoption and acceptance remains required.

## Publication boundary

Repository Stable/Anchor authority does not fabricate immutable publication evidence. Any V1.7.0 tag/GitHub Release publication remains a separate governed transition and must record exact source/artifact identity if performed.
