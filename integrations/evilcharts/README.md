# Glaze + EvilCharts (Development, opt-in)

**Status:** Adapter implementation for React consumers. No Stable runtime, Glaze canonical component catalog, or published consumer acceptance has been changed.

EvilCharts is [MIT licensed](https://github.com/legions-developer/evilcharts/blob/main/LICENSE) and uses a **source-install registry**, not an `evilcharts` npm runtime package (`evilcharts` is marked private in the upstream package manifest). This adapter uses upstream `EvilLineChart` by its registry-installed source, not a proprietary subscription or hosted service.

## Install in a compatible React consumer (Development only)

1. Configure React, CSS, Recharts, Motion, and the `@/components` alias following [EvilCharts registry instructions](https://evilcharts.com) and the shadcn registry documentation.
2. Install the **`recharts-line-chart` registry entry** and its dependencies through the public `@evilcharts` namespace. The upstream [registry.json](https://github.com/legions-developer/evilcharts/blob/main/registry.json) maps this entry to `components/evilcharts/charts/recharts-line-chart.tsx`.
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
