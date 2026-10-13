import { test } from "node:test";
import { strict as assert } from "node:assert";
import { normalizeGlazeChart } from "../normalize.mjs";
const chart = () => ({
 title: "DNS requests", source: "Source-owned telemetry fixture", updatedAt: "2026-10-13T06:00:00Z",
 series: [{key:"allowed",label:"Allowed",unit:"count"},{key:"blocked",label:"Blocked",unit:"count"}],
 points: [{timestamp:"2026-10-13T05:00:00Z",values:{allowed:3,blocked:0}},
          {timestamp:"2026-10-13T06:00:00Z",values:{allowed:null,blocked:1}}],
});
test("preserve zero, null, units, source and UTC provenance", () => {
 const c=normalizeGlazeChart(chart());
 assert.equal(c.rows[0].blocked,0);
 assert.equal(c.rows[1].allowed,null);
 assert.equal(c.series[0].unit,"count");
 assert.equal(c.source,"Source-owned telemetry fixture");
});
test("reject spoofed data, malformed times and nonfinite metrics", () => {
 for (const variant of [
  v=>v.points[0].values.blocked=NaN,
  v=>v.points[0].values.blocked="0",
  v=>delete v.points[0].values.blocked,
  v=>v.points[1].timestamp=v.points[0].timestamp,
  v=>v.points[0].timestamp="now",
  v=>v.updatedAt="not-a-date",
  v=>v.series[1].key="allowed",
  v=>v.series[0].key="timestamp",
  v=>v.points[0].values.extra=12,
 ]) {const item=chart();variant(item);assert.throws(()=>normalizeGlazeChart(item));}
});
test("no-data state is distinct from zero",()=> {
 const c=chart();c.points=[];const result=normalizeGlazeChart(c);assert.equal(result.rows.length,0);
});
