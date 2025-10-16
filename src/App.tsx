import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import "./styles.css";

type Villa = {
  id: string;
  name: string;
  dailyFee: number; // in EUR
  occupancy: number;
  costPct: number;
};

type Scenario = "pessimistic" | "base" | "optimistic";
type Currency = "EUR" | "USD" | "GBP";

export default function App() {
  // --- Base villa data (in EUR)
  const [villas, setVillas] = useState<Villa[]>([
    { id: crypto.randomUUID(), name: "ALYA",  dailyFee: 700, occupancy: 0.6, costPct: 0.35 },
    { id: crypto.randomUUID(), name: "ZEHRA", dailyFee: 550, occupancy: 0.6, costPct: 0.35 },
  ]);

  // --- Currency setup
  const [currency, setCurrency] = useState<Currency>("EUR");
  const symbols: Record<Currency, string> = { EUR: "€", USD: "$", GBP: "£" };
  const [rates, setRates] = useState<Record<Currency, number>>({
    EUR: 1,
    USD: 1.08,
    GBP: 0.86,
  });

  useEffect(() => {
    fetch("https://api.exchangerate.host/latest?base=EUR&symbols=USD,GBP")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.rates) {
          setRates((prev) => ({
            ...prev,
            USD: d.rates.USD ?? prev.USD,
            GBP: d.rates.GBP ?? prev.GBP,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const fx = (nEUR: number) => nEUR * (rates[currency] ?? 1);
  const fmt2 = (n: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(n);
  const fmt0 = (n: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n);

  // --- Table Calculations (in EUR)
  const rows = useMemo(() => {
    return villas.map((v) => {
      const ebitdaEUR = v.dailyFee * 365 * v.occupancy;
      const netEUR = ebitdaEUR * (1 - v.costPct);
      return { ...v, ebitdaEUR, netEUR };
    });
  }, [villas]);

  const totals = useMemo(() => {
    const ebitdaEUR = rows.reduce((a, r) => a + r.ebitdaEUR, 0);
    const netEUR = rows.reduce((a, r) => a + r.netEUR, 0);
    return { ebitdaEUR, netEUR };
  }, [rows]);

  // --- Scenario logic
  function applyScenario(scn: Scenario) {
    const fees: Record<Scenario, [number, number]> = {
      pessimistic: [400, 350],
      base:        [700, 550],
      optimistic:  [1000, 800],
    };
    const cost: Record<Scenario, number> = {
      pessimistic: 0.40,
      base:        0.35,
      optimistic:  0.30, // Optimistic now 30%
    };
    setVillas((prev) =>
      prev.map((v, i) => ({
        ...v,
        name: i === 0 ? "ALYA" : i === 1 ? "ZEHRA" : v.name,
        dailyFee: fees[scn][i] ?? v.dailyFee,
        occupancy: 0.60,
        costPct: cost[scn],
      }))
    );
  }

  function getScenarioAnnualNetProfitEUR(scn: Scenario) {
    const feeMap = {
      pessimistic: [400, 350],
      base:        [700, 550],
      optimistic:  [1000, 800],
    } as const;
    const costMap = { pessimistic: 0.40, base: 0.35, optimistic: 0.30 } as const;
    const occ = 0.60;

    let totalNet = 0;
    villas.forEach((_, i) => {
      const daily = feeMap[scn][i] ?? feeMap[scn][0];
      const ebitda = daily * 365 * occ;
      const net = ebitda * (1 - costMap[scn]);
      totalNet += net;
    });
    return totalNet; // EUR per year
  }

  // --- Marketing adjustment: first 2 years = 0 EUR profit
  const effectiveYears = (y: number) => Math.max(0, y - 2);

  // --- ROI Chart Data (compute in EUR, then convert)
  const roiEUR = [
    { year: 5,  P: getScenarioAnnualNetProfitEUR("pessimistic") * effectiveYears(5),
                M: getScenarioAnnualNetProfitEUR("base")        * effectiveYears(5),
                O: getScenarioAnnualNetProfitEUR("optimistic")  * effectiveYears(5) },
    { year: 10, P: getScenarioAnnualNetProfitEUR("pessimistic") * effectiveYears(10),
                M: getScenarioAnnualNetProfitEUR("base")        * effectiveYears(10),
                O: getScenarioAnnualNetProfitEUR("optimistic")  * effectiveYears(10) },
    { year: 15, P: getScenarioAnnualNetProfitEUR("pessimistic") * effectiveYears(15),
                M: getScenarioAnnualNetProfitEUR("base")        * effectiveYears(15),
                O: getScenarioAnnualNetProfitEUR("optimistic")  * effectiveYears(15) },
  ];
  const roiDisplay = roiEUR.map((d) => ({
    year: d.year,
    Pesimistik: fx(d.P),
    Muhtemel:   fx(d.M),
    Optimistik: fx(d.O),
  }));

  // --- UI helpers
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

  // --- Render
  return (
    <>
      {/* HERO SECTION */}
      <header className="header">
        <div className="header-inner" style={{ textAlign: "center" }}>
          <span className="badge">nest by Halalbooking</span>
          <h1 className="title">NEST ULASLI</h1>
          <div className="subtitle">Ulaşlı Villa Projesi - Gelir–gider ve ROI senaryoları</div>
        </div>
      </header>

      <main className="container">
        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div title="All values are stored in Euro. Display currency applies conversion.">
            <label style={{ marginRight: 6 }}>Currency (display)</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              <option value="EUR">€ Euro</option>
              <option value="USD">$ USD</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>

          <span style={{ marginLeft: 8 }}>Senaryolar:</span>
          <button onClick={() => applyScenario("pessimistic")}>Pesimistik</button>
          <button onClick={() => applyScenario("base")}>Muhtemel</button>
          <button onClick={() => applyScenario("optimistic")}>Optimistik</button>

          <button onClick={addVilla} style={{ marginLeft: "auto" }}>
            + Villa ekle
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: 8 }}>Villa</th>
                <th style={{ textAlign: "left", padding: 8 }}>Günlük Ücret (EUR)</th>
                <th style={{ textAlign: "left", padding: 8 }}>Doluluk</th>
                <th style={{ textAlign: "left", padding: 8 }}>Maliyet %</th>
                <th style={{ textAlign: "left", padding: 8 }}>EBITDA**</th>
                <th style={{ textAlign: "left", padding: 8 }}>Yıllık Net Kâr</th>
                <th style={{ textAlign: "left", padding: 8 }}>5Y ROI*</th>
                <th style={{ textAlign: "left", padding: 8 }}>10Y ROI*</th>
                <th style={{ textAlign: "left", padding: 8 }}>15Y ROI*</th>
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
                    <span>€ </span>
                    <input
                      type="number"
                      value={r.dailyFee}
                      onChange={(e) =>
                        update(r.id, { dailyFee: Number(e.target.value || 0) })
                      }
                      style={{ width: 80 }}
                    />
                    <span>/gece</span>
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
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
                  <td style={{ padding: 8 }}>
                    {symbols[currency]} {fmt2(fx(r.ebitdaEUR))}
                  </td>
                  <td style={{ padding: 8 }}>
                    {symbols[currency]} {fmt2(fx(r.netEUR))}
                  </td>
                  {/* ROI columns use effectiveYears = years - 2 (min 0) */}
                  <td style={{ padding: 8 }}>
                    {symbols[currency]} {fmt2(fx(r.netEUR * effectiveYears(5)))}
                  </td>
                  <td style={{ padding: 8 }}>
                    {symbols[currency]} {fmt2(fx(r.netEUR * effectiveYears(10)))}
                  </td>
                  <td style={{ padding: 8 }}>
                    {symbols[currency]} {fmt2(fx(r.netEUR * effectiveYears(15)))}
                  </td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => removeVilla(r.id)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr style={{ borderTop: "2px solid #ddd", fontWeight: 700 }}>
                <td style={{ padding: 8 }}>Toplam</td>
                <td></td><td></td><td></td>
                <td style={{ padding: 8 }}>{symbols[currency]} {fmt2(fx(totals.ebitdaEUR))}</td>
                <td style={{ padding: 8 }}>{symbols[currency]} {fmt2(fx(totals.netEUR))}</td>
                <td style={{ padding: 8 }}>{symbols[currency]} {fmt2(fx(totals.netEUR * effectiveYears(5)))}</td>
                <td style={{ padding: 8 }}>{symbols[currency]} {fmt2(fx(totals.netEUR * effectiveYears(10)))}</td>
                <td style={{ padding: 8 }}>{symbols[currency]} {fmt2(fx(totals.netEUR * effectiveYears(15)))}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ROI Chart */}
        <div
          style={{
            marginTop: 32,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 8px 30px rgba(2,8,23,.06)",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0" }}>Senaryolara göre toplam ROI (5/10/15 yıl) *</h3>
          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer>
              <LineChart data={roiDisplay} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="year" tickFormatter={(y) => `${y}Y`} />
                <YAxis
                  tickFormatter={(v) => `${symbols[currency]} ${fmt0(v as number)}`}
                  width={90}
                />
                <ReferenceLine x={10} stroke="#e5e7eb" />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    color: "#fff",
                    borderRadius: 12,
                    border: "none",
                  }}
                  labelFormatter={(y) => `${y} Yıl`}
                  formatter={(val: any) => [
                    `${symbols[currency]} ${fmt0(val as number)}`,
                    "",
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="Pesimistik" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 1, stroke: "#fff" }} />
                <Line type="monotone" dataKey="Muhtemel"   stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 1, stroke: "#fff" }} />
                <Line type="monotone" dataKey="Optimistik" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 1, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            * İlk 2 yıl pazarlama giderleri nedeniyle ROI = 0 kabul edilmiştir. Tüm hesaplamalar EUR bazlıdır, görüntüleme seçilen kur ile yapılır.
            **EBITDA = faiz vergi yıpranma payı ve amortisman öncesi kar
          </div>
        </div>
      </main>
    </>
  );
}
