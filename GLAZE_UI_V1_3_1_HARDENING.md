# GLAZE UI V1.3.1 — Accessibility, Interaction + Qualification Hardening

**Status:** Historical superseded hardening track  
**Lifecycle authority:** No separate V1.3.1 release was promoted; retained as historical development provenance  
**Historical baseline:** GLAZE UI V1.3 — Adaptive Resonance / `1.3.0` Stable  
**Superseded release path:** V1.4.0 and V1.4.1 Stable; later V1.5.x releases; current V1.6 / `1.6.0` Anchor  
**V1.3.1 consumer eligibility:** Never separately promoted  
**Current lifecycle authority:** `registry/lifecycle.json`

V1.3.1 was the governed follow-up track for hardening work that was intentionally kept separate from the V1.3.0 release. The separate V1.3.1 patch was not promoted as a release. This file is retained as historical development and qualification provenance; it is not an active lifecycle or consumer-target authority, and later release records govern current acceptance and rollout state.

## Owner-directed carry-forward scope

The following workstreams were originally transferred from V1.3 lifecycle blockers into the V1.3.1 follow-up track:

1. Human optical, visual-finish, and icon/artwork collision qualification, including all V1.3 quality rules.
2. Manual assistive-technology sessions for the support matrix actually claimed.
3. Physical-device/native-platform qualification for claimed Android/OEM, Linux compositor/window, foldable/posture, and other platform behavior.
4. Accepted production-performance budgets plus representative real-device pacing, latency, memory, GPU/compositor, power/thermal, and constrained-device evidence.
5. Native Personalization persistence, system-appearance, wallpaper-source, and fallback adapter qualification where claimed.
6. Stable activation/source-namespace cleanup with migration, equivalence, import-closure, and rollback hardening.

Their historical transfer into V1.3.1 was a release-scope decision, not an evidence pass. Current completion and lifecycle authority for equivalent or successor requirements comes only from the later qualified release records; this historical list must not be read as a current V1.3.1 backlog.

## Accessibility and interaction hardening slice

The first implemented V1.3.1 slice makes the interaction layer explicit and machine-testable:

- visible keyboard, remote, and assistive-input focus with pointer focus remaining quiet until focus-visible;
- focus presentation structurally distinct from current, selected, and pressed state;
- fine-pointer-only hover lift, bounded pressed feedback, and disabled-state precedence;
- Reduced Motion removal of nonessential hover and press transforms without delaying semantic activation;
- Forced Colors focus through platform `Highlight` authority and structural state boundaries;
- Reduced Transparency solid-surface fallback for the reference treatment;
- 48px default interactive target floor and conservative 56px coarse-pointer reference floor;
- compact responsive wrapping without shrinking targets or depending on hover;
- a dependency-free browser reference for manual inspection; and
- fail-closed runtime, contract, CSS-marker, reference, and lifecycle-boundary validation.

## Implementation artifacts

- `contracts/v1.3.1/accessibility-interaction-hardening.candidate.json`
- `js/glaze-v1.3.1-accessibility-interaction-hardening.candidate.mjs`
- `css/glaze-v1.3.1-accessibility-interaction-hardening.candidate.css`
- `reference/v1.3/accessibility-interaction-hardening.html`
- `tests/glaze-v1.3.1-accessibility-interaction-hardening.test.mjs`
- `scripts/validate_glaze_v1_3_1_accessibility_interaction_hardening.py`
- `.github/workflows/glaze-v1.3.1-accessibility-interaction-hardening.yml`

## Acceptance boundary

Automated checks establish implementation contracts and reference behavior only. They do not establish human optical acceptance, screen-reader acceptance, switch/voice acceptance, physical-device acceptance, native-platform parity, production-performance acceptance, or downstream consumer conformance.

Historically, V1.3.0 remained Official Stable while this follow-up work was explored. V1.3.1 was never separately promoted as a Stable consumer target; later release lines superseded this track.

## Release relationship

- V1.3.0: historical Stable release.
- V1.3.1: historical unpromoted hardening/deferred-qualification track.
- V1.4.0 / V1.4.1 and later releases: superseding governed release path.
- V1.6 / `1.6.0`: current Official Anchor authority.

No V1.3.1 artifact or historical wording may be interpreted as current lifecycle authority or as replacing the release state in `registry/lifecycle.json`.
