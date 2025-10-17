import React, { useEffect, useMemo, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { differenceInCalendarDays, format, isBefore, startOfToday } from "date-fns";
import "react-day-picker/dist/style.css";

/* ---------- Config ---------- */
type VillaKey = "ALYA" | "ZEHRA";
const VILLAS: Record<VillaKey, { name: string; nightlyEUR: number; sleeps: number }> = {
  ALYA:  { name: "ALYA",  nightlyEUR: 700, sleeps: 8 },
  ZEHRA: { name: "ZEHRA", nightlyEUR: 550, sleeps: 6 },
};

// demo booked ranges (örn. peak tarihler)
const BOOKED: Record<VillaKey, { from: Date; to: Date }[]> = {
  ALYA: [
    { from: new Date(new Date().getFullYear(), 6, 12), to: new Date(new Date().getFullYear(), 6, 18) },
    { from: new Date(new Date().getFullYear(), 7, 3),  to: new Date(new Date().getFullYear(), 7, 7) }
  ],
  ZEHRA: [
    { from: new Date(new Date().getFullYear(), 7, 14), to: new Date(new Date().getFullYear(), 7, 21) }
  ]
};

const CLEANING_FEE = 150;
const SERVICE_FEE_PCT = 0.05;
const MIN_NIGHTS = 3;

/* ---------- Helpers ---------- */
function nightsOf(range: DateRange | undefined) {
  if (!range?.from || !range.to) return 0;
  return Math.max(0, differenceInCalendarDays(range.to, range.from));
}
const euro = (n: number) => `€ ${n.toFixed(2)}`;

/* ---------- Component ---------- */
export default function BookingPage() {
  const [villa, setVilla]     = useState<VillaKey>("ALYA");
  const [range, setRange]     = useState<DateRange | undefined>();
  const [adults, setAdults]   = useState(2);
  const [children, setChildren] = useState(0);
  const [note, setNote]       = useState("");
  const [months, setMonths]   = useState(2);

  // responsive months
  useEffect(() => {
    const onResize = () => setMonths(window.innerWidth < 900 ? 1 : 2);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const today     = startOfToday();
  const villaInfo = VILLAS[villa];
  const nights    = nightsOf(range);
  const overCap   = adults + children > villaInfo.sleeps;
  const underMin  = nights > 0 && nights < MIN_NIGHTS;

  const disabled = [{ before: today }, ...BOOKED[villa]];

  const price = useMemo(() => {
    const base = nights * villaInfo.nightlyEUR;
    const cleaning = nights > 0 ? CLEANING_FEE : 0;
    const service = (base + cleaning) * SERVICE_FEE_PCT;
    return { base, cleaning, service, total: base + cleaning + service, deposit: 500 };
  }, [nights, villaInfo.nightlyEUR]);

  const waText = encodeURIComponent(
    [
      "Hello NEST ULASLI, I’d like to enquire about a stay.",
      `Villa: ${villaInfo.name}`,
      range?.from ? `Check-in: ${format(range.from, "dd MMM yyyy")}` : "Check-in: –",
      range?.to   ? `Check-out: ${format(range.to,   "dd MMM yyyy")}` : "Check-out: –",
      `Guests: ${adults} adults, ${children} children (sleeps up to ${villaInfo.sleeps})`,
      `Nights: ${nights}`,
      `Estimated total: ${euro(price.total)} (excl. refundable deposit € ${price.deposit.toFixed(0)})`,
      note ? `Note: ${note}` : ""
    ].join("\n")
  );
  const canSubmit = nights >= MIN_NIGHTS && !overCap;

  return (
    <>
      {/* HERO */}
      <header className="header">
        <div className="nav-buttons">
          <a href="/" className="nav-btn">Home</a>
          <a href="/planner" className="nav-btn">Planner</a>
          <a href="/book" className="nav-btn primary">Book & Enquire</a>
        </div>
        <div className="header-inner" style={{ textAlign: "center" }}>
          <span className="badge">by Dizman</span>
          <h1 className="hero-title">NEST ULASLI – Book & Enquire</h1>
          <p className="hero-subtitle">Private luxury villa with concierge service – seamless booking, curated experiences.</p>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container">
        <div className="booking-grid redesigned">
          {/* LEFT PANEL */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">Availability</h3>
                <div className="chips">
                  <span className="chip">
                    {range?.from ? format(range.from, "dd MMM") : "Check-in"} →
                    {range?.to ? ` ${format(range.to, "dd MMM")}` : " Check-out"}
                  </span>
                  <span className="chip">{nights} night{nights === 1 ? "" : "s"}</span>
                  <span className="chip">{adults} adult{adults > 1 ? "s" : ""}{children ? `, ${children} child` : ""}</span>
                </div>
              </div>
              <div className="price-note">Nightly from <strong>€ {villaInfo.nightlyEUR.toFixed(0)}</strong></div>
            </div>

            <div className="panel-row">
              <div className="field">
                <label>Villa</label>
                <select
                  value={villa}
                  onChange={(e) => { setVilla(e.target.value as VillaKey); setRange(undefined); }}
                >
                  <option value="ALYA">ALYA — sleeps 8</option>
                  <option value="ZEHRA">ZEHRA — sleeps 6</option>
                </select>
              </div>
              <button className="btn ghost" onClick={() => setRange(undefined)} style={{ height: 38 }}>
                Reset dates
              </button>
            </div>

            <div className="calendar">
              <DayPicker
                mode="range"
                numberOfMonths={months}
                selected={range}
                onSelect={(r) => {
                  if (r?.from && r?.to && isBefore(r.to, r.from)) setRange({ from: r.to, to: r.from });
                  else setRange(r);
                }}
                fromDate={today}
                disabled={disabled}
                captionLayout="dropdown"
                pagedNavigation
                styles={{
                  caption: { fontWeight: 700 },
                  day: { borderRadius: 10, height: 40, width: 40 },
                  day_selected: { backgroundColor: "#0ea5b7", color: "#fff" },
                  day_range_middle: { backgroundColor: "rgba(14,165,183,.12)" },
                  day_disabled: { color: "#cbd5e1" }
                }}
              />
              <div className="helper">
                Greyed dates are unavailable. Minimum stay {MIN_NIGHTS} nights in peak periods.
              </div>
            </div>

            <div className="grid-two">
              <div className="field">
                <label>Adults</label>
                <input type="number" min={1} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value||1)))} />
              </div>
              <div className="field">
                <label>Children</label>
                <input type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value||0)))} />
              </div>
            </div>

            {overCap && (
              <div className="notice error">
                This villa sleeps up to {villaInfo.sleeps}. Please reduce guests or choose the other villa.
              </div>
            )}

            <div className="field">
              <label>Special requests</label>
              <textarea
                rows={4}
                placeholder="Airport transfer, private chef, daily breakfast, yacht charter, nanny…"
                value={note}
                onChange={(e)=>setNote(e.target.value)}
              />
            </div>
          </section>

          {/* RIGHT SUMMARY (STICKY) */}
          <aside className="summary sticky">
            <h3 className="panel-title" style={{ marginTop: 0 }}>Your stay</h3>

            <div className="summary-line">
              <div className="summary-label">Dates</div>
              <div className="summary-value">
                {range?.from ? format(range.from, "dd MMM yyyy") : "–"} → {range?.to ? format(range.to, "dd MMM yyyy") : "–"}
              </div>
            </div>
            <div className="summary-line">
              <div className="summary-label">Nights</div>
              <div className="summary-value">{nights}</div>
            </div>
            <div className="summary-line">
              <div className="summary-label">Villa</div>
              <div className="summary-value">{villaInfo.name} · up to {villaInfo.sleeps} guests</div>
            </div>

            <hr className="sep" />

            <table className="price-table">
              <tbody>
                <tr><td>Accommodation</td><td className="end">{nights} × € {villaInfo.nightlyEUR.toFixed(0)}</td><td className="end">{euro(price.base)}</td></tr>
                <tr><td>Cleaning fee</td><td/><td className="end">{euro(price.cleaning)}</td></tr>
                <tr><td>Service {Math.round(SERVICE_FEE_PCT*100)}%</td><td/><td className="end">{euro(price.service)}</td></tr>
              </tbody>
              <tfoot>
                <tr><td colSpan={2} className="total-label">Total</td><td className="end total-amount">{euro(price.total)}</td></tr>
              </tfoot>
            </table>

            <div className="muted small" style={{ marginTop: 6 }}>
              Refundable security deposit on arrival: € {price.deposit.toFixed(0)}.
            </div>

            {underMin && (
              <div className="notice warn" style={{ marginTop: 10 }}>
                Minimum stay is {MIN_NIGHTS} nights. Please adjust your dates.
              </div>
            )}

            <div className="cta-col">
              <a
                className={`btn primary ${!canSubmit ? "disabled" : ""}`}
                aria-disabled={!canSubmit}
                href={canSubmit ? `https://wa.me/00000000000?text=${waText}` : undefined}
                target="_blank" rel="noreferrer"
              >
                Enquire on WhatsApp
              </a>
              <a
                className={`btn ghost ${!canSubmit ? "disabled" : ""}`}
                aria-disabled={!canSubmit}
                href={canSubmit ? `mailto:reservations@nest-ulasli.com?subject=Booking Enquiry – ${villaInfo.name}&body=${waText}` : undefined}
              >
                Request to Book
              </a>
            </div>

            <ul className="bullets">
              <li>Concierge can arrange private chef, daily housekeeping, yacht, car hire, massages and childcare.</li>
              <li>Check-in 16:00, check-out 11:00. No smoking indoors. Pets on request.</li>
              <li>Flexible cancellation – ask your concierge for current terms.</li>
            </ul>
          </aside>
        </div>
      </main>
    </>
  );
}
