import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";

type Row = { year: number; Pesimistik: number; Muhtemel: number; Optimistik: number };

export default function ScenarioChart({
  data,
  currency
}: {
  data: Row[];
  currency: string;
}) {
  const fmt0 = (n: number) =>
    new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n);

  // brand-ish colours
  const colP = "#ef4444"; // pessimistic
  const colB = "#3b82f6"; // base
  const colO = "#10b981"; // optimistic (green)
  const grid = "#e5e7eb";
  const axis = "#475569";
  const card = {
    bg: "#fff",
    border: "#e2e8f0",
    shadow: "0 8px 30px rgba(2,8,23,.06)"
  };

  const tooltipContent = ({
    label,
    payload
  }: {
    label?: any;
    payload?: any[];
  }) => {
    if (!payload || !payload.length) return null;
    return (
      <div
        style={{
          background: "#0f172a",
          color: "#fff",
          padding: "10px 12px",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(2,8,23,.35)",
          fontSize: 12
        }}
      >
        <div style={{ opacity: 0.9, marginBottom: 4 }}>{label} yıl</div>
        {payload.map((p) => (
          <div key={p.dataKey} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: p.color
              }}
            />
            <span style={{ minWidth: 88 }}>{p.name}</span>
            <strong>
              {currency} {fmt0(p.value as number)}
            </strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        background: card.bg,
        border: `1px solid ${card.border}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: card.shadow
      }}
    >
      <h3 style={{ margin: "0 0 12px 0" }}>Senaryolara göre toplam ROI (5/10/15 yıl)</h3>

      {/* give the chart a real height or it won't render */}
      <div style={{ width: "100%", height: 420 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            {/* soft grid */}
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />

            {/* axes */}
            <XAxis
              dataKey="year"
              tickFormatter={(y) => `${y}Y`}
              tick={{ fill: axis, fontSize: 12 }}
              axisLine={{ stroke: grid }}
              tickLine={{ stroke: grid }}
            />
            <YAxis
              tickFormatter={(v) => `${currency} ${fmt0(v as number)}`}
              tick={{ fill: axis, fontSize: 12 }}
              width={90}
              axisLine={{ stroke: grid }}
              tickLine={{ stroke: grid }}
            />

            {/* helpful vertical guide at 10Y */}
            <ReferenceLine x={10} stroke={grid} />

            {/* gradient fills under lines */}
            <defs>
              <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colP} stopOpacity={0.25} />
                <stop offset="100%" stopColor={colP} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colB} stopOpacity={0.25} />
                <stop offset="100%" stopColor={colB} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colO} stopOpacity={0.25} />
                <stop offset="100%" stopColor={colO} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* tooltip & legend */}
            <Tooltip content={tooltipContent as any} />
            <Legend
              verticalAlign="bottom"
              height={32}
              formatter={(value) => (
                <span style={{ color: "#334155", fontSize: 12 }}>{value}</span>
              )}
            />

            {/* sleek lines with gentle animation */}
            <Line
              type="monotone"
              dataKey="Pesimistik"
              stroke={colP}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, stroke: "#fff" }}
              activeDot={{ r: 6 }}
              name="Pesimistik"
              fill="url(#gradP)"
            />
            <Line
              type="monotone"
              dataKey="Muhtemel"
              stroke={colB}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, stroke: "#fff" }}
              activeDot={{ r: 6 }}
              name="Muhtemel"
              fill="url(#gradB)"
            />
            <Line
              type="monotone"
              dataKey="Optimistik"
              stroke={colO}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, stroke: "#fff" }}
              activeDot={{ r: 6 }}
              name="Optimistik"
              fill="url(#gradO)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
