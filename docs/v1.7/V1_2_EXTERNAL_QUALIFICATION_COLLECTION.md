# Glaze V1.7 retained v1.2 — External Qualification Collection

**Lifecycle:** DevelopmentQualification  
**Frozen source:** `4b9d085a5177b96cc31d4270b38d792a59872e37`  
**Acceptance model:** `1.7.0-dev.39`  
**Historical source line:** V1.7 retained v1.2 / `1.7.0-dev.47`
**Successor qualification line:** Glaze V1.7.1 / `1.7.1-dev.1`
**Current bounded Anchor:** Glaze V1.7 / `1.7.0`

PR #391 established the historical retained working set at 43 exact-source records, 16 evidence-group-complete lanes, and 21 unverified lanes. PR #393 subsequently established exact-source rendered Regression evidence for the same frozen dev.47 source. The current retained checkpoint is 44 evidence records, 17 evidence-group-complete lanes, and 20 unverified lanes. This protocol does not create evidence or grant lifecycle authority.

Use the existing canonical packet `acceptance/v1.7-qualification-evidence.template.json`. Every verified observation must match the frozen source revision, use a lane-allowed evidence type, carry a content-addressed `evidence+sha256:` reference, and include a concrete finding, timestamp, and reviewer/operator identity.

## Missing evidence groups

- **Performance:** Frame pacing, Input latency, Performance.
- **Device:** Mobile, Tablet, Desktop, Foldable, TV, Wearable, Touch, Native behavior, Energy behavior.
- **Human:** Keyboard, Pointer, Touch, Alternative input, Representative rendering, Native behavior, Human visual and motion review, Privacy boundaries, Security boundaries.
- **Assistive technology:** Alternative input, Assistive technology.
- **Energy:** Energy behavior.

The retained browser form-factor scenes are rendered presentation evidence only. They do not satisfy physical-device or native-behavior evidence.

## Durable Regression checkpoint

PR #393 established the separate rendered Regression evidence group for frozen source `4b9d085a5177b96cc31d4270b38d792a59872e37`. GitHub Actions run `37157473094` passed on exact tooling head `83c8d783dc57a78ad87d0819e06bd59782978989`; verification job `111303763574` and comparison job `111303887933` passed. Artifact `11286278764` is recorded with digest `sha256:cb55b581668f6007b9ed56d53fca3a318ae773639f6a9e7620b22a4cf4d2e2e5`. The durable record is `acceptance/v1.7.1-regression-evidence.json`.

This evidence is bound to the frozen historical source and is not automatically valid for a materially changed V1.7.1 candidate.

## Non-equivalences

- CI browser viewport is not physical-device evidence.
- Emulator or simulator output is not physical-device evidence.
- Accessibility-tree inspection is not a real assistive-technology session.
- Automated assertions are not human review.
- CI timing is not representative performance evidence.
- Synthetic resource estimates are not energy evidence.
- The prior generic rendered artifact alone is not Regression evidence; the separate PR #393 comparison is the retained rendered Regression checkpoint.
- Packet completeness is not V1.7 acceptance or Anchor promotion.

## Intake sequence

1. Build or materialize the frozen source without modifying it.
2. Confirm the runtime/device represents the claimed evidence class.
3. Perform the observation or measurement.
4. Store the observation artifact durably and compute its SHA-256 digest.
5. Add the evidence record to the canonical V1.7 qualification packet.
6. Validate the packet with the existing V1.7 qualification-evidence validator.
7. Continue until every required evidence group is satisfied.
8. Submit a complete packet for governed qualification review.
9. Keep lifecycle promotion separate from qualification-packet completeness.

This protocol now feeds V1.7.1 Development qualification. The bounded V1.7.0 Stable runtime does not consume the retained dev.47 feature aggregate. V1.7.1 remains Development and non-consumer-eligible until governed exact-candidate qualification and lifecycle promotion are separately accepted.
