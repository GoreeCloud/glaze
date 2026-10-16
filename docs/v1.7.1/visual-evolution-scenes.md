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

## Note context actions and content-state explorer — Development

The Memos example now has an icon-bearing per-note context menu. It uses canonical Glaze vector geometry, explicit ARIA menu/menuitem semantics, visible expanded state, keyboard Arrow/Home/End navigation, Escape and outside-click dismissal, and focus restoration. The local Pin/Unpin action changes a visible Pinned marker but does **not** reorder or persist any note. Customize appearance routes to the existing synthetic color/label editor.

A separate content-state example offers Loading, Empty and Error selections. Skeletons, canonical folder and warning glyphs, text, and semantic colors make each illustrative state legible without color alone. Loading is entirely synthetic: no actual requests are started; Error is not a detected service failure. Motion and forced-colors fallbacks are provided.

Automated browser evidence includes compact through wide viewports, note menu state, keyboard and focus, pin toggling, appearance routing, state selection, and representative RTL checks. These examples still require manual screen-reader, touch-device, native, design, performance and release acceptance. They are not production app features.

## Surface and control laboratory — Development

An opt-in interactive material panel now offers real visual evaluation of Flat,
Raised, and Outlined card treatments, a native keyboard-operable corner-radius
range, and a semantic decorative-accent switch. Only the synthetic preview
card changes; values are not saved, sent to providers, or applied to GoreeCloud
applications. The switch exposes `role="switch"` and `aria-checked`, and
elevation buttons expose pressed selection. Meaningful text remains available
without relying on hue or elevation alone.

Responsive, forced-colors, and reduced-motion fallbacks are scoped to this
demonstration. Browser tests must verify computed geometry and shadow changes,
accessible selection, switch state, keyboard range adjustment, and no overflow
at 320/390/768/1280/1600 px. These are Development smoke checks, not manual
accessibility, production, native-device or release acceptance.

## October 15 — Accessibility and consumer-preparation evidence

An isolated axe-core WCAG 2.0/2.1 A/AA automated browser audit now covers:
desktop and compact gallery; desktop and compact application scenes; Memos
dialog; Launcher tab; note context menu; and Nocturne theme. The first run
reported link-name mismatches, an insufficient-contrast sidebar label and a
prohibited ARIA attribute on a decorative skeleton. Those were corrected.
The next run reported **zero violations in all eight cases**. This does not
prove complete accessibility, since automated engines cover only a subset of
WCAG and do not emulate screen-reader users.

The Development workflow now executes Chromium interaction/viewport tests and
axe in addition to source/contrast/adapter checks on every relevant PR change.
Opt-in, architecture-specific, **non-shipping** Memos, Asterport and Launcher
assets and adoption instructions are in `integrations/v1.7.1/README.md`.
They do not modify or import into the current applications or Glaze Stable.

### Manual acceptance still required

- **Android hardware:** Connect an authorized phone over USB with debugging
  permission. First verify a device appears under `adb devices -l`; none
  appeared during this session. Install only a separately accepted Launcher
  Development APK, then review the 5-column home/dock/drawer, navigation,
  gestures, TalkBack labels, dynamic type, rotation, screen insets, wallpaper
  and rollback. Do not use ADB emulator/browser screenshots as physical proof.
- **Desktop screen-reader:** Manually navigate both galleries with Orca on
  Linux and/or NVDA on Windows, and verify heading navigation, dialog name,
  menu arrow/Escape/focus restoration, state announcements, input labels,
  keyboard focus and high-contrast operation. Orca being installed on the
  connected laptop alone is not evidence that this happened.
- **Mobile screen-reader:** Verify VoiceOver (iOS/Safari) and TalkBack
  (Android/Chrome) on real hardware, including note customization and
  application preview navigation; collect device/OS/browser versions.
- **Product integration:** Review the opt-in adapters separately in the
  Memos React/Tailwind, Asterport React/Vite, and Launcher Lawnchair-native
  source branches. Full consumer tests, screenshots, UI approval, packaging,
  performance/energy and privacy/security acceptance are required before
  production adoption.

**Status:** Automated development qualification passed; human/device, native
consumer and release acceptance **remain open**. Do not mark 1.7.1 Stable.

## Form and validation preview — Development

The new opt-in interaction laboratory demonstrates a required workspace label, native Personal/Team radio controls, a preview checkbox, Reset, inline error/help text and a visual example card. Submit is intercepted locally: no account/workspace is created, no data is persisted, and text is always written through `textContent`, never HTML. Error state uses `aria-invalid`, explicitly described help/error elements, and focuses the invalid input. Native radio and checkbox controls remain keyboard-operable. Forced-colors and Reduced Motion alternatives are provided.

Chromium exercises empty-name failure, focus and error recovery, safe HTML-like text, Team selection, preview visibility, Reset, and responsive rendering. Automated axe is extended to cover the invalid and committed form examples. Human/native-device/screen-reader qualification is still independently required.

## Quick Actions — Development

The experience gallery includes a searchable, local-only **Quick actions** dialog.
It opens from a visible control or with Control/Command+K. Actions filter by
name and related terms, with an explicit empty-result message. Arrow keys,
Home/End, Enter and Escape are supported. Selecting Memos, Launcher or the
dashboard activates the corresponding demonstration tab; selecting a control
section moves focus to its heading. First-party SVG glyphs accompany text
labels, and nothing opens a real app or changes a connected service.

Automated Chromium checks cover command search, tab activation and dismissal,
and the axe suite audits both open and empty-results states. The example is
not consumer-integrated or a substitute for human screen-reader testing.

## Local resource and layout stability — Development

`scripts/qa_glaze_v171_performance.cjs` measures three isolated, local
Chromium previews (gallery mobile, scenes mobile, scenes desktop). The bounded
smoke checks first-party request count (maximum 35), encoded resource payload
(maximum 160,000 bytes), unexpected external network requests, runtime errors,
horizontal overflow and cumulative layout shift (maximum 0.1). FCP and DOM
readiness times are logged as **diagnostic samples only**, not absolute release
budgets or representative hardware performance evidence. The script runs in
the Development CI browser job, independently of the existing responsive and
automated accessibility suites.

Observed local baseline before the tightened threshold: 10 resources and
34,899 encoded bytes for the 390px gallery, 23 resources and 71,801 encoded
bytes for the 390px scenes, and the same resource count/bytes at 1280px.
These are synthetic, single-machine samples and do not qualify Frame pacing,
Input latency, native Performance, Energy behavior, physical touch or the
historical V1.7.1 retained field-evidence lanes.

## Typography and readability laboratory — Development

The scenes gallery now includes an opt-in system-font specimen with Standard (15px), Relaxed (18px), and Large (21px) sample text plus Balanced and Airy leading. Controls expose pressed states and change only the sample; they do not persist settings or alter GoreeCloud apps. Responsive width and text reflow remain release-review criteria. The browser test checks the rendered Large size, while hardware, screen-reader and design signoff remain open.

## Reading clarity refinement — Development

The synthetic typography specimen has a third local-only choice: Regular or
Higher clarity. Higher clarity strengthens text weight and optical spacing
without replacing GoreeCloud's canonical system font or application settings.
The paired line-spacing and clarity controls use balanced two-column grids
at phone widths. Selection uses pressed-state labels rather than color alone.

A dedicated, opt-in Chromium/axe script at
`scripts/qa_glaze_v171_typography.cjs` covers type size, line spacing,
high-clarity state, target geometry, reflow and sampled WCAG checks for four
sample themes at 320/390/768/1280px combinations. Its tests are separate from
the existing mandatory Development workflow once the required Chromium job runs that matrix.
A source/baseline browser success is not a claim of human screen-reader,
physical-device, localization or native typography acceptance.
