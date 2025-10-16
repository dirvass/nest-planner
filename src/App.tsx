import React, { useMemo, useState } from "react";
import ScenarioChart from "./ScenarioChart"; // Grafik bileşeni

type Villa = {
  id: string;
  name: string;
  dailyFee: number;
  occupancy: number;
  costPct: number;
};

export default function App() {
  // Varsayılan = Muhtemel senaryo
  const [villas, setVillas] = useState<Villa[]>([
    { id: crypto.randomUUID(), name: "ALYA", dailyFee: 700, occupancy: 0.6, costPct: 0.35 },
    { id: crypto.randomUUID(), name: "ZEHRA", dailyFee: 550, occupancy: 0.6, costPct: 0.35 },
  ]);
  const [currency, setCurrency] = useState("€");

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(n);

  // Ana tablo hesaplamaları
  const rows = useMemo(() => {
    return villas.map((v) => {
      const ebitda = v.dailyFee * 365 * v.occupancy;
      const net = ebitda * (1 - v.costPct);
      return { ...v, ebitda, net };
    });
  }, [villas]);

  const totals = useMemo(() => {
    const ebitda = rows.reduce((a, r) => a + r.ebitda, 0);
    const net = rows.reduce((a, r) => a + r.net, 0);
    return { ebitda, net };
  }, [rows]);

  function update(id: string, patch: Partial<Villa>) {
    setVillas((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }
  function addVilla() {
    const idx = villas.length + 1;
