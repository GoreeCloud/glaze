# Glaze 1.7.1 — Application-specific preview integration

**Status:** Development only. These opt-in examples are not release artifacts. Glaze 1.7.0 remains Stable. Do not attach these styles to production root elements, bundle them as an authoritative Glaze theme, or silently migrate consumers. Glaze 1.7.1 is not consumer-eligible.

## Memos — React / Tailwind preview

Verified upstream target: `GoreeCloud/memos`, `web/src/index.css`, importing `./themes/default.css` and `./themes/goreecloud.css`. The web UI uses Tailwind semantic tokens such as `--background`, `--card`, `--foreground`, `--border`, and `--ring`, and the current package uses pnpm/Vite/Vitest/Playwright.

Proposed *development branch only* copy: `integrations/v1.7.1/memos/preview.css` into a non-shipping preview route; render a wrapper with `data-glaze-v171-preview` and class `glaze-v171-memos`. Trial-note cards use `glaze-v171-preview-masonry` and `glaze-v171-preview-note`. Preserve live note persistence, existing labels, masonry behavior, i18n, authentication and existing GoreeCloud theme. Do not adopt sample/demo note colors as official brand choices.

**Review:** pnpm lint/test/browser on the targeted consumer branch; keyboard, context menu/dialog focus and note color/label persistence with genuine data separately; iOS/Android mobile browser and screen-reader manual review; compare both dark/light themes. Glaze preview contract alone does not establish this integration.

## Asterport — React / Vite preview

Verified target: `GoreeCloud/asterport`, `apps/web/src/main.jsx` importing `./glaze-asterport.css` and vendored `glaze-v1.7.0.mjs`; current Asterport CSS has consumer-owned `--ast-glaze-*` values. Copy `integrations/v1.7.1/asterport/preview.css` only to a separate non-shipping preview route or behind an internal Development flag. Opt in per container with `data-glaze-v171-preview` and `glaze-v171-asterport`; use `glaze-v171-preview-card` and `glaze-v171-preview-action` inside. The bridge maps to Asterport's *existing* values and never replaces its identity or Stable JS runtime.

**Review:** `npm run check`, desktop and mobile navigation/layout regressions, account separation, keyboard/AT review, perf and service-boundary testing. Do not change live auth, assistant, integrations, data requests or release status.

## Launcher — Android native preview

Verified implementation branch: `GoreeCloud/launcher` `feat/launcher-edit-home-mockup-20261014`, with Lawnchair-based `lawnchair/` modules; `main` currently contains only a README. `integrations/v1.7.1/launcher/preview-dimens.xml` is a **review-only values resource**, not copied into or built by the Android project. It describes 5-column home/dock/drawer mockup constraints, native 48dp control targets and visual corner radii. It intentionally contains **no color resources, icons, package IDs, network references or executable behavior**.

**Review:** copy/adapt in a dedicated Launcher Development branch only after checking how the existing launcher resources and user defaults are implemented; preserve zero default home apps, no search bar, opaque app drawer, five columns and custom wallpaper rules from Launcher-specific requirements. Verify Android build, ADB install, real device visual screenshots, rotation/insets, TalkBack, touch, frame pacing, launcher data persistence and rollback. **An ADB listing with no devices is not device acceptance.**

## Cross-application acceptance boundaries

All adapter selectors are scoped under `[data-glaze-v171-preview]`. Do not import into Stable entrypoints. Do not override official branding, provider states, system security status, or consumer-persisted settings. Avoid loading production data into synthetic previews.

Before app-specific merges, require source and contract tests, screenshot comparison, full integration tests, independently checked accessibility, real hardware as required, performance, security/privacy review and explicit governed release acceptance. Keep each consumer app's PR separate from Glaze design-system Development PR #426, allowing independent rollback.
