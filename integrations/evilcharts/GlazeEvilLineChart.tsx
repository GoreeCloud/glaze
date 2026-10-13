"use client";
import { useEffect, useState } from "react";
import { normalizeGlazeChart, type ChartInput } from "./normalize.mjs";

// Development-only adapter: EvilCharts source is installed into the consumer
// by its MIT-licensed shadcn registry. Glaze remains the identity and API authority.
// Lazy client-side loading avoids evaluating upstream animated loading fixtures during SSR.
type ChartComponent = typeof import("@/components/evilcharts/charts/recharts-line-chart")["EvilLineChart"];
const PALETTE = [
  "var(--glz1-accent, #3478bd)",
  "var(--glz1-text-secondary, #64748b)",
  "var(--glz1-positive, #16845b)",
  "var(--glz1-attention, #946200)",
];
export function GlazeEvilLineChart({ chart }: { chart: ChartInput }) {
  const [Chart, setChart] = useState<ChartComponent | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    let mounted = true;
    import("@/components/evilcharts/charts/recharts-line-chart")
      .then(module => { if (mounted) setChart(() => module.EvilLineChart); })
      .catch(() => { if (mounted) setLoadFailed(true); });
    return () => { mounted = false; };
  }, []);
  let data: ReturnType<typeof normalizeGlazeChart>;
  try {
    data = normalizeGlazeChart(chart);
  } catch {
    return <p role="alert">Chart unavailable: invalid or missing source data.</p>;
  }
  const config = Object.fromEntries(data.series.map((s,i) => [s.key, {
    label: s.label, colors: { light: [PALETTE[i]], dark: [PALETTE[i]] },
  }]));
  return <section data-glz-evilcharts="development" aria-label={data.title}>
    <header>
      <h3>{data.title}</h3>
      <p>Source: {data.source} · Updated: <time dateTime={data.updatedAt}>{data.updatedAt}</time></p>
    </header>
    {data.rows.length ? (
      <figure>
        {Chart ? (
          <Chart data={data.rows} config={config} animationType="none" curveType="linear">
            <Chart.Grid />
            <Chart.XAxis dataKey="timestamp" />
            <Chart.YAxis />
            {data.series.map((s,i)=><Chart.Line key={s.key} dataKey={s.key} strokeVariant={i%2 ? "dashed":"solid"} animationType="none" />)}
            <Chart.Tooltip />
            <Chart.Legend />
          </Chart>
        ) : <p role={loadFailed ? "alert" : "status"}>{loadFailed ? "Chart graphics could not load; source values remain available below." : "Preparing chart graphics; source values are available below."}</p>}
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
