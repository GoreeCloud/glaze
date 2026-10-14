"use client";
import { useEffect, useState } from "react";
import { normalizeGlazeChart, type ChartInput } from "./normalize.mjs";

// Optional MIT EvilCharts registry source, never a hosted or paid chart service.
// Client-only import avoids upstream random loading fixtures during static SSR.
type BarChartComponent = typeof import("@/components/evilcharts/charts/recharts-bar-chart")["EvilBarChart"];
const PALETTE = [
  "var(--glz1-accent, #3478bd)",
  "var(--glz1-text-secondary, #64748b)",
  "var(--glz1-positive, #16845b)",
  "var(--glz1-attention, #946200)",
];

export function GlazeEvilBarChart({ chart }: { chart: ChartInput }) {
  const [BarChart, setBarChart] = useState<BarChartComponent | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    let mounted = true;
    import("@/components/evilcharts/charts/recharts-bar-chart")
      .then(module => { if (mounted) setBarChart(() => module.EvilBarChart); })
      .catch(() => { if (mounted) setLoadFailed(true); });
    return () => { mounted = false; };
  }, []);
  let data: ReturnType<typeof normalizeGlazeChart>;
  try {
    data = normalizeGlazeChart(chart);
  } catch {
    return <p role="alert">Bar chart unavailable: invalid or missing source data.</p>;
  }
  const config = Object.fromEntries(data.series.map((s,i) => [s.key, {
    label: s.label,
    colors: { light: [PALETTE[i]], dark: [PALETTE[i]] },
  }]));
  return <section data-glz-evilcharts="bar-development" aria-label={data.title}>
    <header>
      <h3>{data.title}</h3>
      <p>Source: {data.source} · Updated: <time dateTime={data.updatedAt}>{data.updatedAt}</time></p>
    </header>
    {data.rows.length ? (
      <figure>
        {BarChart ? (
          <BarChart data={data.rows} config={config} animationType="none">
            <BarChart.Grid />
            <BarChart.XAxis dataKey="timestamp" />
            <BarChart.YAxis />
            {data.series.map(s => <BarChart.Bar key={s.key} dataKey={s.key} animationType="none" />)}
            <BarChart.Tooltip />
            <BarChart.Legend />
          </BarChart>
        ) : <p role={loadFailed ? "alert" : "status"}>
          {loadFailed ? "Bar graphics could not load; source values remain available below." : "Preparing bar graphics; source values are available below."}
        </p>}
        <figcaption>Source-reported values only. Missing values are not zero.</figcaption>
      </figure>
    ) : <p role="status">No source data was provided.</p>}
    <div style={{overflowX:"auto"}}>
      <table>
        <caption>Accessible values for {data.title}</caption>
        <thead><tr><th scope="col">Time (UTC)</th>{data.series.map(s=><th key={s.key} scope="col">{s.label} ({s.unit})</th>)}</tr></thead>
        <tbody>{data.rows.map(row=><tr key={row.timestamp}><th scope="row">{row.timestamp}</th>{data.series.map(s=><td key={s.key}>{row[s.key] === null ? "Missing" : String(row[s.key])}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </section>;
}
