# Glaze V1.7 retained v1.2 — External Qualification Collection

**Lifecycle:** DevelopmentQualification  
**Frozen source:** `4b9d085a5177b96cc31d4270b38d792a59872e37`  
**Acceptance model:** `1.7.0-dev.39`  
**Historical source line:** V1.7 retained v1.2 / `1.7.0-dev.47`  \n**Successor qualification line:** Glaze V1.7.1 / `1.7.1-dev.1`  \n**Current bounded Anchor:** Glaze V1.7 / `1.7.0`

PR #391 established the current retained working set: 43 exact-source records, 16 evidence-group-complete lanes, and 21 unverified lanes. This protocol does not create evidence or grant lifecycle authority.

Use the existing canonical packet `acceptance/v1.7-qualification-evidence.template.json`. Every verified observation must match the frozen source revision, use a lane-allowed evidence type, carry a content-addressed `evidence+sha256:` reference, and include a concrete finding, timestamp, and reviewer/operator identity.

## Missing evidence groups

- **Performance:** Frame pacing, Input latency, Performance.
- **Device:** Mobile, Tablet, Desktop, Foldable, TV, Wearable, Touch, Native behavior, Energy behavior.
- **Human:** Keyboard, Pointer, Touch, Alternative input, Representative rendering, Native behavior, Human visual and motion review, Privacy boundaries, Security boundaries.
- **Assistive technology:** Alternative input, Assistive technology.
- **Energy:** Energy behavior.
- **Rendered:** Regression.

The retained browser form-factor scenes are rendered presentation evidence only. They do not satisfy physical-device or native-behavior evidence.

## Non-equivalences

- CI browser viewport is not physical-device evidence.
- Emulator or simulator output is not physical-device evidence.
- Accessibility-tree inspection is not a real assistive-technology session.
- Automated assertions are not human review.
- CI timing is not representative performance evidence.
- Synthetic resource estimates are not energy evidence.
- The existing rendered artifact is not automatically Regression evidence.
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
