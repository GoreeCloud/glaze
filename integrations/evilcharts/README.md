# Glaze + EvilCharts (Development, opt-in)

**Status:** Adapter implementation for React consumers. No Stable runtime, Glaze canonical component catalog, or published consumer acceptance has been changed.

EvilCharts is [MIT licensed](https://github.com/legions-developer/evilcharts/blob/main/LICENSE) and uses a **source-install registry**, not an `evilcharts` npm runtime package (`evilcharts` is marked private in the upstream package manifest). This adapter uses upstream `EvilLineChart` by its registry-installed source, not a proprietary subscription or hosted service.

## Install in a compatible React consumer (Development only)

1. Configure React, CSS, Recharts, Motion, and the `@/components` alias following [EvilCharts registry instructions](https://evilcharts.com) and the shadcn registry documentation.
2. Install the **`recharts-line-chart` registry entry** and its dependencies with `npx shadcn@latest add @evilcharts/recharts-line-chart` (per the [official installation instructions](https://evilcharts.com/docs/recharts/installation)). The upstream [registry.json](https://github.com/legions-developer/evilcharts/blob/main/registry.json) maps this entry to `components/evilcharts/charts/recharts-line-chart.tsx`.
3. Copy or import `GlazeEvilLineChart.tsx` and `normalize.mjs` into the compatible consumer, retaining the `@/components/evilcharts/charts/recharts-line-chart` import target.
4. Pass **explicit, source-authoritative** chart payloads only. No artificial data generation or producer polling occurs in this adapter.

Run the dependency-free data boundary tests from this repository:

```sh
node --test integrations/evilcharts/tests/*.test.mjs
```

## Data contract

```ts
{
  title: "DNS requests",
  source: "Verified GoreeCloud DNS metrics source",
  updatedAt: "2026-10-13T06:00:00Z",
  series: [{key:"allowed",label:"Allowed",unit:"count"}],
  points: [{timestamp:"2026-10-13T05:00:00Z", values:{allowed:3}}]
}
```

The normalization layer preserves explicit `null` (missing) as distinct from numeric zero, rejects invalid numbers and ambiguous time ordering, requires identified provenance, and caps data to four series/500 points. The React adapter disables chart intro motion and provides an HTML table for the same values. It is not evidence of real upstream source delivery, production latency, device performance, assistive-technology review, or consumer adoption.

## Copyright and licensing

EvilCharts upstream: MIT License, Copyright (c) 2026 Gurbinder. When importing registry code, retain the original copyright and MIT permission notice in the distributed source or notices. [Full upstream license](https://github.com/legions-developer/evilcharts/blob/main/LICENSE).

Glaze integration glue is original GoreeCloud code under the [Glaze repository license](../../LICENSE). Do not add paid components or the hosted upstream website as a runtime dependency.

## Verified consumer-build regression (October 13, 2026)

The opt-in Glaze wrapper was compiled in a clean, temporary **Next.js 16.4.0** consumer created with the official shadcn registry. The first version hit Next.js static prerender protection because upstream EvilCharts creates randomized loading-fixture data even when not loading. The development adapter now lazily imports the EvilCharts component **after client mount** while immediately rendering its accessible source-data table. In a fresh test consumer, registry install, normalization tests, TypeScript and optimized Next.js build/static prerender all succeeded. This validates build compatibility for that environment only; browser assistive-technology, native parity and release acceptance remain unverified.

## Bar chart option (Development)

In a compatible React/shadcn consumer, install the **free MIT-licensed** upstream registry entry:

```sh
npx shadcn@latest add @evilcharts/recharts-bar-chart
```

Copy `GlazeEvilBarChart.tsx`, `normalize.mjs` and `normalize.d.mts` into the consumer, retaining the expected `@/components/evilcharts/charts/recharts-bar-chart` import. It uses the exact same source-data contract as `GlazeEvilLineChart` and displays the original values in a semantic HTML table when chart graphics have not yet loaded or cannot load. The chart implementation is loaded after client mount to prevent upstream randomized loading fixtures from executing during static prerender.

**Verified isolated consumer evidence (October 13, 2026):** Upstream registry installation created six source files. An isolated **Next.js 16.4.0** + shadcn/React consumer using source revision `95b9333a919bafc9ea3f3a25d5fa5559c8ffbb4a` passed TypeScript, optimized production build and static prerender. In headless Chromium, the bar chart hydrated and rendered at **1100×760** desktop and **390×844** mobile viewport sizes. A three-row semantic source table retained numeric zero separately from an explicit `Missing` value, the synthetic source text remained visible, and no page-level JavaScript errors were detected. Evidence marker: `GLAZE_BAR_CHART_CHROMIUM_HYDRATION_PASSED`. The test consumer and its own test server were cleaned up.

This is Development-only build/browser evidence with **synthetic fixture data**. It does not establish real metric ingestion, native-platform support, assistive-technology access, color contrast, interactive keyboard/touch coverage, high-density performance, or Stable acceptance. No subscriptions, hosted telemetry or paid chart service were used.
