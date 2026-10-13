export type ChartInput = {
  title: string;
  source: string;
  updatedAt: string;
  series: Array<{ key: string; label: string; unit: string }>;
  points: Array<{ timestamp: string; values: Record<string, number | null> }>;
};
export type NormalizedChart = {
  title: string; source: string; updatedAt: string;
  series: ChartInput["series"];
  rows: Array<{ timestamp: string } & Record<string, number | null | string>>;
};
export function normalizeGlazeChart(input: ChartInput): NormalizedChart;
