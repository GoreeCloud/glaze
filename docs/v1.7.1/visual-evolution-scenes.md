# Glaze 1.7.1 — Application Experience Scenes

**Status:** Development only; no Stable, deployment or consumer authority.

This additive reference explores three distinct Glaze presentations without modifying GoreeCloud applications:

- **Memos:** content-driven masonry with note color controls and visible labels. Colors are personalization examples, not semantic system status.
- **Launcher:** an empty home screen with five dock positions, and a solid five-column app drawer. The displayed symbols are generic registry glyphs, not official app icons.
- **System dashboard:** synthetic, explicitly labeled connectivity, usage and attention examples. These are not service measurements.

The reference scene uses canonical Glaze SVG symbols, native semantic controls, arrow-key tab navigation, dialog focus and Escape behavior, a demonstrative progress control, Reduced Motion inheritance and forced-color styles.

**Review location:** reference/v1.7.1/visual-evolution-scenes.html. From repository root, serve using Python's local HTTP server, then open that path.

**Qualification boundaries:** Source-contract and repository checks cannot establish rendered quality, native parity, screen-reader accessibility, keyboard-device behavior, performance or energy acceptance. Do not adopt into consumers or publish a release until the applicable separate evidence is reviewed and approved.

**Source boundaries:** Current Stable Glaze remains 1.7.0. These scenes are not imported by its entrypoint. V1.6 stays the historical rollback baseline.

## Accessible sample-theme navigation — Development

The experience scenes now show four explicitly labeled theme choices (Porcelain, Cedar,
Nocturne, Contrast), with active selection exposed by `aria-current`.
Theme differences are examples rather than new official brand-color authority;
selection uses a local URL parameter and never persists a user preference.

Component refinements include high-visibility keyboard focus, responsive grouping,
reduced-motion and forced-colors alternatives, and a narrow semantic edge for
**synthetic, explicitly labelled** information and warning examples. These
presentations do not provide evidence of live connectivity, security, privacy,
sync or provider state.

The independently runnable Chromium test harness is
`scripts/qa_glaze_v171_scenes_browser.cjs`. It tests compact through
wide viewports, note color changes, the five-column Launcher drawer, roving
tab selection, native dialog dismissal, illustrative progress, palette
examples, and reduced-motion/forced-colors behavior. Its results are
**Development browser smoke evidence only**, not physical-device, human
visual, assistive-technology, performance, energy or release acceptance.

## Memo appearance customization — Development

The Memos scene now uses a dedicated, native-dialog-based appearance editor,
replacing the older color-cycling control. It previews four named options
(Default, Clay, Meadow, Rose) and permits bounded editing of an illustrative
note label (maximum 24 characters). Apply changes only to the synthetic note
already displayed in the current page; Cancel and Escape must leave it unchanged.

Focus moves into the dialog on opening and returns to the invoking note control
on close. Visible focus, reduced-motion, and forced-colors styles are included.
No account access, persistent preference, service endpoint, note database,
storage migration, or production Memos behavior is implied.

Development Chromium regression exercises Apply, Cancel, Escape, label edits,
focus restoration, the responsive scenes, and other existing interactions at
320, 390, 768, 1280 and 1600 px. Manual screen-reader and physical-device
acceptance remain separate open gates.

## Semantic notice component — Development

A separate example component now demonstrates three explicit, synthetic
security, warning and privacy notices. Each selection provides a contextual
semantic color, the appropriate first-party Glaze vector glyph, and human-readable
text that distinguishes the example from a provider-derived result.

The notice is presented with a polite live region and explicit dismissal.
Dismiss and Escape restore keyboard focus to the initiating control.
No live connectivity, security posture, account permission or user data
is consulted or represented as verified.

Browser regression verifies each semantic glyph/message and dismissal
across all five supported demonstration viewport sizes. Source tests
assert canonical semantics and forbid local persistence and unrelated
network APIs. Forced-colors presentation retains borders and readable text;
manual assistive-technology and real-device acceptance remain unqualified.
