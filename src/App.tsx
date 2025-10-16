import React, { useMemo, useState } from "react";

type Villa = {
  id: string;
  name: string;
  dailyFee: number;   // € / gece
  occupancy: number;  // 0..1
  costPct: number;    // 0..1
};

export default function App() {
  // Varsayılan = Muhtemel
  const [villas, setVillas] = useState<Villa[]>([
    { id: crypto.randomUUID(), name: "ALYA",  dailyFee: 700, occupancy: 0.60, costPct: 0.35 },
    { id: crypto.randomUUID(), name: "ZEHRA", dailyFee: 550, occupancy: 0.60, costPct: 0.35 },
  ]);
  const [currency, setCurrency] = useState("€");

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(n);

  const rows = useMemo(() => {
    return villas.map(v => {
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
    setVillas(prev => prev.map(v => (v.id === id ? { ...v, ...patch } : v)));
  }
  function addVilla() {
    const idx = villas.length + 1;
    setVillas(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: `Villa ${String.fromCharCode(64 + idx)}`, dailyFee: 600, occupancy: 0.6, costPct: 0.35 },
    ]);
  }
  function removeVilla(id: string) {
    setVillas(prev => prev.filter(v => v.id !== id));
  }

  type Scenario = "pessimistic" | "base" | "optimistic";
  function applyScenario(scn: Scenario) {
    const fees: Record<Scenario, [number, number]> = {
      pessimistic: [400, 350],
      base:        [700, 550],
      optimistic:  [1000, 800],
    };
    const cost: Record<Scenario, number> = {
      pessimistic: 0.40,
      base:        0.35,
      optimistic:  0.40,
    };
    setVillas(prev =>
      prev.map((v, i) => ({
        ...v,
        name: i === 0 ? "ALYA" : i === 1 ? "ZEHRA" : v.name,
        dailyFee: fees[scn][i] ?? v.dailyFee,
        occupancy: 0.60,
        costPct: cost[scn],
      }))
    );
  }

  return (
    <>
      {/* Hero / header with image */}
      <header className="header">
        <div className="header-inner">
          <span className="badge">nest by Halalbooking</span>
          <h1 className="title">NEST – Annual Profit Planner</h1>
          <div className="subtitle">Plan villa gelir–gider ve ROI senaryolarını hızlıca simüle edin.</div>
        </div>
      </header>

      <main className="container">
        <div className="card">
          {/* Toolbar */}
          <div className="toolbar">
            <div>
              <label style={{ marginRight: 6 }}>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="€">€ Euro</option>
                <option value="$">$ USD</option>
                <option value="£">£ GBP</option>
              </select>
            </div>

            <span style={{ marginLeft: 8 }}>Scenario presets:</span>
            <button className="ghost" onClick={() => applyScenario("pessimistic")}>Pesimistik</button>
            <button className="ghost" onClick={() => applyScenario("base")}>Muhtemel</button>
            <button className="ghost" onClick={() => applyScenario("optimistic")}>Optimistik</button>

            <button className="primary" onClick={addVilla} style={{ marginLeft: "auto" }}>+ Villa ekle</button>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Villa</th>
                  <th>Günlük Ücret</th>
                  <th>Doluluk</th>
                  <th>Maliyet %</th>
                  <th>EBITDA (yıllık)</th>
                  <th>Yıllık Net Kâr</th>
                  <th>5Y ROI</th>
                  <th>10Y ROI</th>
                  <th>15Y ROI</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td>
                      <input value={r.name} onChange={e => update(r.id, { name: e.target.value })} style={{ width: 140 }} />
                    </td>
                    <td>
                      <span>{currency} </span>
                      <input type="number" min={0} value={r.dailyFee}
                        onChange={e => update(r.id, { dailyFee: Number(e.target.value || 0) })}
                        style={{ width: 100 }} />
                      <span>/gece</span>
                    </td>
                    <td>
                      <input type="number" min={0} max={100} value={Math.round(r.occupancy * 100)}
                        onChange={e => update(r.id, { occupancy: Math.min(100, Math.max(0, Number(e.target.value))) / 100 })}
                        style={{ width: 80 }} />%
                    </td>
                    <td>
                      <input type="number" min={0} max={100} value={Math.round(r.costPct * 100)}
                        onChange={e => update(r.id, { costPct: Math.min(100, Math.max(0, Number(e.target.value))) / 100 })}
                        style={{ width: 80 }} />%
                    </td>
                    <td>{currency} {fmt(r.ebitda)}</td>
                    <td>{currency} {fmt(r.net)}</td>
                    <td>{currency} {fmt(r.net * 5)}</td>
                    <td>{currency} {fmt(r.net * 10)}</td>
                    <td>{currency} {fmt(r.net * 15)}</td>
                    <td><button className="ghost" onClick={() => removeVilla(r.id)}>Sil</button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Toplam</td><td></td><td></td><td></td>
                  <td>{currency} {fmt(totals.ebitda)}</td>
                  <td>{currency} {fmt(totals.net)}</td>
                  <td>{currency} {fmt(totals.net * 5)}</td>
                  <td>{currency} {fmt(totals.net * 10)}</td>
                  <td>{currency} {fmt(totals.net * 15)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="helper">
            Formüller: NET Kâr = Günlük Ücret × 365 × Doluluk. Net Kâr = EBITDA × (1 - Maliyet %). ROI = Net Kâr × yıl sayısı.
          </div>
        </div>
      </main>
    </>
  );
}
