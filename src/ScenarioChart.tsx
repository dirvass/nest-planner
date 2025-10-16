// src/ScenarioChart.tsx
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

type Row = { year: number; Pesimistik: number; Muhtemel: number; Optimistik: number };

export default function ScenarioChart({ data, currency }: { data: Row[]; currency: string }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16, boxShadow: "0 4px 20px rgba(2,8,23,.06)" }}>
      <h3 style={{ margin: "0 0 12px 0" }}>Senaryolara göre toplam ROI (5/10/15 yıl)</h3>
      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tickFormatter={(y) => `${y}Y`} />
            <YAxis tickFormatter={(v) => `${currency} ${fmt(v)}`} />
            <Tooltip formatter={(v: number) => [`${currency} ${fmt(v)}`, ""]} labelFormatter={(y) => `${y} Yıl`} />
            <Legend />
            <Line type="monotone" dataKey="Pesimistik" stroke="#ef4444" strokeWidth={2} dot />
            <Line type="monotone" dataKey="Muhtemel"   stroke="#3b82f6" strokeWidth={2} dot />
            <Line type="monotone" dataKey="Optimistik" stroke="#10b981" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
