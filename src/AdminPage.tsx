import React, { useState, useEffect } from "react";
import TopNav from "./components/TopNav";
import { getBooked, setBooked, VillaKey, BookedRange } from "./availability";
import "./styles/AdminPage.css";

const VILLAS: VillaKey[] = ["ALYA", "ZEHRA"];

export default function AdminPage() {
  const [data, setData] = useState(() => getBooked());
  const [heroVis, setHeroVis] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 100); return () => clearTimeout(t); }, []);

  function addRange(villa: VillaKey) {
    setData(prev => ({
      ...prev,
      [villa]: [...prev[villa], { from: "", to: "" }],
    }));
    setSaved(false);
  }

  function updateRange(villa: VillaKey, idx: number, field: "from" | "to", value: string) {
    setData(prev => ({
      ...prev,
      [villa]: prev[villa].map((r, i) => i === idx ? { ...r, [field]: value } : r),
    }));
    setSaved(false);
  }

  function removeRange(villa: VillaKey, idx: number) {
    setData(prev => ({
      ...prev,
      [villa]: prev[villa].filter((_, i) => i !== idx),
    }));
    setSaved(false);
  }

  function save() {
    // Filter out incomplete ranges
    const cleaned: Record<VillaKey, BookedRange[]> = { ALYA: [], ZEHRA: [] };
    for (const v of VILLAS) {
      cleaned[v] = data[v].filter(r => r.from && r.to);
    }
    setBooked(cleaned);
    setData(cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const total = VILLAS.reduce((a, v) => a + data[v].length, 0);

  return (
    <>
      <header className={`admin-hero ${heroVis ? "admin-hero--vis" : ""}`}>
        <div className="admin-hero__bg" aria-hidden="true" />
        <div className="admin-hero__ov" aria-hidden="true" />
        <TopNav />
        <div className="admin-hero__ct">
          <span className="admin-hero__badge">Extranet</span>
          <h1 className="admin-hero__title">Availability Manager</h1>
          <div className="admin-hero__line" />
          <p className="admin-hero__sub">Manage booked dates for each villa. Changes are saved locally and reflected on the booking page.</p>
        </div>
      </header>

      <main className="admin">
        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat">
            <span className="admin-stat__label">Total Bookings</span>
            <span className="admin-stat__value">{total}</span>
          </div>
          {VILLAS.map(v => (
            <div key={v} className="admin-stat">
              <span className="admin-stat__label">{v}</span>
              <span className="admin-stat__value">{data[v].length} booking{data[v].length !== 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>

        {/* Villa sections */}
        {VILLAS.map(v => (
          <section key={v} className="admin-villa">
            <div className="admin-villa__head">
              <h2 className="admin-villa__name">{v}</h2>
              <button className="admin-btn admin-btn--add" onClick={() => addRange(v)}>+ Add Booking</button>
            </div>

            {data[v].length === 0 && (
              <p className="admin-empty">No bookings yet. Click "+ Add Booking" to block dates.</p>
            )}

            <div className="admin-ranges">
              {data[v].map((r, i) => (
                <div key={i} className="admin-range">
                  <label className="admin-field">
                    <span>Check-in</span>
                    <input
                      type="date"
                      value={r.from}
                      onChange={e => updateRange(v, i, "from", e.target.value)}
                    />
                  </label>
                  <span className="admin-range__arrow">&rarr;</span>
                  <label className="admin-field">
                    <span>Check-out</span>
                    <input
                      type="date"
                      value={r.to}
                      onChange={e => updateRange(v, i, "to", e.target.value)}
                    />
                  </label>
                  <button className="admin-btn admin-btn--del" onClick={() => removeRange(v, i)} title="Remove">
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Save */}
        <div className="admin-save">
          <button className="admin-btn admin-btn--save" onClick={save}>
            {saved ? "Saved \u2713" : "Save Changes"}
          </button>
          <p className="admin-save__hint">Changes are stored in your browser and will apply to the booking calendar immediately.</p>
        </div>
      </main>
    </>
  );
}
