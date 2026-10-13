// Source-bound adapter for the opt-in EvilCharts React implementation.
// No network, persistence, producer polling, synthetic zeroes, or health inference.
const KEY = /^[a-z][a-z0-9_]{0,31}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isRecord = x => x !== null && typeof x === "object" && !Array.isArray(x);
function limitedString(s, length, name) {
  if (typeof s !== "string" || !s.trim() || s.length > length)
    throw new TypeError(`Invalid ${name}`);
  return s;
}
function utc(s) {
  limitedString(s, 32, "UTC timestamp");
  if (!ISO.test(s) || !Number.isFinite(Date.parse(s)) ||\n      new Date(s).toISOString() !== (s.includes(".") ? s : s.replace(/Z$/, ".000Z")))
    throw new TypeError("Timestamp must be a valid UTC ISO-8601 string");
  return s;
}
export function normalizeGlazeChart(input) {
  if (!isRecord(input)) throw new TypeError("Expected chart payload");
  const title = limitedString(input.title, 120, "title");
  const source = limitedString(input.source, 160, "source");
  const updatedAt = utc(input.updatedAt);
  if (!Array.isArray(input.series) || input.series.length < 1 || input.series.length > 4)
    throw new TypeError("Expected one to four series");
  const series = input.series.map(s => {
    if (!isRecord(s) || typeof s.key !== "string" || !KEY.test(s.key) || s.key === "timestamp")
      throw new TypeError("Invalid series key");
    return { key: s.key, label: limitedString(s.label, 90, "series label"), unit: limitedString(s.unit, 24, "unit") };
  });
  if (new Set(series.map(s => s.key)).size !== series.length) throw new TypeError("Duplicate series key");
  if (!Array.isArray(input.points) || input.points.length > 500)
    throw new TypeError("Too many chart points");
  let last = -Infinity;
  const rows = input.points.map(point => {
    if (!isRecord(point) || !isRecord(point.values)) throw new TypeError("Invalid chart point");
    const stamp = utc(point.timestamp);
    const current = Date.parse(stamp);
    if (current <= last) throw new TypeError("Timestamps must strictly increase");
    last = current;
    const row = { timestamp: stamp };
    if (Object.keys(point.values).length !== series.length) throw new TypeError("Every series must report measured value or explicit null");
    for (const item of series) {
      if (!Object.prototype.hasOwnProperty.call(point.values, item.key))
        throw new TypeError("Missing series value");
      const value = point.values[item.key];
      if (value !== null && (typeof value !== "number" || !Number.isFinite(value)))
        throw new TypeError("Value must be finite number or explicit null");
      row[item.key] = value;
    }
    return row;
  });
  return { title, source, updatedAt, series, rows };
}
