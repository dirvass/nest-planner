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
    setVillas((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `Villa ${idx}`, dailyFee: 600, occupancy: 0.6, costPct: 0.35 },
    ]);
  }
  function removeVilla(id: string) {
    setVillas((prev) => prev.filter((v) => v.id !== id));
  }

  // 3 senaryo parametreleri
  type Scenario = "pessimistic" | "base" | "optimistic";

  function applyScenario(scn: Scenario) {
    const fees: Record<Scenario, [number, number]> = {
      pessimistic: [400, 350],
      base: [700, 550],
      optimistic: [1000, 800],
    };
    const cost: Record<Scenario, number> = {
      pessimistic: 0.4,
      base: 0.35,
      optimistic: 0.4,
    };
    setVillas((prev) =>
      prev.map((v, i) => ({
        ...v,
        name: i === 0 ? "ALYA" : i === 1 ? "ZEHRA" : v.name,
        dailyFee: fees[scn][i] ?? v.dailyFee,
        occupancy: 0.6,
        costPct: cost[scn],
      }))
    );
  }

  // Her senaryonun yıllık toplam net kârını hesapla
  function getScenarioAnnualNetProfit(scn: Scenario) {
    const feeMap = {
      pessimistic: [400, 350],
      base: [700, 550],
      optimistic: [1000, 800],
    } as const;
    const costMap = { pessimistic: 0.4, base: 0.35, optimistic: 0.4 } as const;
    const occ = 0.6;

    let totalNet = 0;
    villas.forEach((_, i) => {
      const daily = feeMap[scn][i] ?? feeMap[scn][0];
      const ebitda = daily * 365 * occ;
      const net = ebitda * (1 - costMap[scn]);
      totalNet += net;
    });
    return totalNet;
  }

  // Grafik verisi (5/10/15 yıllık ROI)
  const roiData = [
    {
      year: 5,
      Pesimistik: getScenarioAnnualNetProfit("pessimistic") * 5,
      Muhtemel: getScenarioAnnualNetProfit("base") * 5,
      Optimistik: getScenarioAnnualNetProfit("optimistic") * 5,
    },
    {
      year: 10,
      Pesimistik: getScenarioAnnualNetProfit("pessimistic") * 10,
      Muhtemel: getScenarioAnnualNetProfit("base") * 10,
      Optimistik: getScenarioAnnualNetProfit("optimistic") * 10,
    },
    {
      year: 15,
      Pesimistik: getScenarioAnnualNetProfit("pessimistic") * 15,
      Muhtemel: getScenarioAnnualNetProfit("base") * 15,
      Optimistik: getScenarioAnnualNetProfit("optimistic") * 15,
    },
  ];

  return (
    <div style={{ fontFamily: "Inter, system-ui, Arial, sans-serif", padding: 16 }}>
      {/* Üst başlık */}
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>NEST – Annual Profit Planner</h1>

      {/* Kontroller */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <label style={{ marginRight: 6 }}>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="€">€ Euro</option>
            <option value="$">$ USD</option>
            <option value="£">£ GBP</option>
          </select>
        </div>

        <span style={{ marginLeft: 8 }}>Scenario presets:</span>
        <button onClick={() => applyScenario("pessimistic")}>Pesimistik</button>
        <button onClick={() => applyScenario("base")}>Muhtemel</button>
        <button onClick={() => applyScenario("optimistic")}>Optimistik</button>

        <button onClick={addVilla} style={{ marginLeft: "auto" }}>+ Villa ekle</button>
      </div>

      {/* Tablo */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ textAlign: "left", padding: 8 }}>Villa</th>
              <th style={{ textAlign: "left", padding: 8 }}>Günlük Ücret</th>
              <th style={{ textAlign: "left", padding: 8 }}>Doluluk</th>
              <th style={{ textAlign: "left", padding: 8 }}>Maliyet %</th>
              <th style={{ textAlign: "left", padding: 8 }}>EBITDA (yıllık)</th>
              <th style={{ textAlign: "left", padding: 8 }}>Yıllık Net Kâr</th>
              <th style={{ textAlign: "left", padding: 8 }}>5Y ROI</th>
              <th style={{ textAlign: "left", padding: 8 }}>10Y ROI</th>
              <th style={{ textAlign: "left", padding: 8 }}>15Y ROI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>
                  <input
                    value={r.name}
                    onChange={(e) => update(r.id, { name: e.target.value })}
                    style={{ width: 120 }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <span>{currency} </span>
                  <input
                    type="number"
                    min={0}
                    value={r.dailyFee}
                    onChange={(e) => update(r.id, { dailyFee: Number(e.target.value || 0) })}
                    style={{ width: 80 }}
                  />
                  <span>/gece</span>
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(r.occupancy * 100)}
                    onChange={(e) =>
                      update(r.id, {
                        occupancy: Math.min(100, Math.max(0, Number(e.target.value))) / 100,
                      })
                    }
                    style={{ width: 60 }}
                  />
                  %
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(r.costPct * 100)}
                    onChange={(e) =>
                      update(r.id, {
                        costPct: Math.min(100, Math.max(0, Number(e.target.value))) / 100,
                      })
                    }
                    style={{ width: 60 }}
                  />
                  %
                </td>
                <td style={{ padding: 8 }}>{currency} {fmt(r.ebitda)}</td>
                <td style={{ padding: 8 }}>{currency} {fmt(r.net)}</td>
                <td style={{ padding: 8 }}>{currency} {fmt(r.net * 5)}</td>
                <td style={{ padding: 8 }}>{currency} {fmt(r.net * 10)}</td>
                <td style={{ padding: 8 }}>{currency} {fmt(r.net * 15)}</td>
                <td style={{ padding: 8 }}><button onClick={() => removeVilla(r.id)}>Sil</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid #ddd", fontWeight: 700 }}>
              <td style={{ padding: 8 }}>Toplam</td>
              <td></td><td></td><td></td>
              <td style={{ padding: 8 }}>{currency} {fmt(totals.ebitda)}</td>
              <td style={{ padding: 8 }}>{currency} {fmt(totals.net)}</td>
              <td style={{ padding: 8 }}>{currency} {fmt(totals.net * 5)}</td>
              <td style={{ padding: 8 }}>{currency} {fmt(totals.net * 10)}</td>
              <td style={{ padding: 8 }}>{currency} {fmt(totals.net * 15)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ROI line chart */}
      <div style={{ marginTop: 32 }}>
        <ScenarioChart data={roiData} currency={currency} />
      </div>

      <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
        Formüller: NET Kâr = Günlük Ücret × 365 × Doluluk. Net Kâr = EBITDA × (1 - Maliyet %).
        ROI = Net Kâr × yıl sayısı. Tüm değerler yaklaşık hesaplamadır.
      </p>
    </div>
  );
}
