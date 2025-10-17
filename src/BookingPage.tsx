import React, { useMemo, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { differenceInCalendarDays, format } from "date-fns";
import "react-day-picker/dist/style.css";

type VillaKey = "ALYA" | "ZEHRA";

const VILLAS: Record<VillaKey, { name: string; nightlyEUR: number; sleeps: number }> = {
  ALYA:  { name: "ALYA",  nightlyEUR: 700, sleeps: 8 },
  ZEHRA: { name: "ZEHRA", nightlyEUR: 550, sleeps: 6 },
};

// demo booked ranges – replace with your real availability
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
const REFUNDABLE_DEPOSIT = 500;

function nights(range: DateRange | undefined) {
  if (!range?.from || !range.to) return 0;
  return Math.max(0, differenceInCalendarDays(range.to, range.from));
}

export default function BookingPage() {
  const [villa, setVilla] = useState<VillaKey>("ALYA");
  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [note, setNote] = useState("");

  const n = nights(range);
  const villaInfo = VILLAS[villa];

  const price = useMemo(() => {
    const base = n * villaInfo.nightlyEUR;
    const cleaning = n > 0 ? CLEANING_FEE : 0;
    const service = (base + cleaning) * SERVICE_FEE_PCT;
    return { base, cleaning, service, total: base + cleaning + service, deposit: REFUNDABLE_DEPOSIT };
  }, [n, villaInfo.nightlyEUR]);

  const booked = BOOKED[villa];

  const waText = encodeURIComponent(
    [
      "Hello NEST ULASLI, I’d like to enquire about a stay.",
      `Villa: ${villaInfo.name}`,
      range?.from ? `Check-in: ${format(range!.from!, "dd MMM yyyy")}` : "Check-in: –",
      range?.to   ? `Check-out: ${format(range!.to!,   "dd MMM yyyy")}` : "Check-out: –",
      `Guests: ${adults} adults, ${children} children`,
      `Nights: ${n}`,
      `Estimated total: € ${price.total.toFixed(2)} (excl. refundable deposit € ${price.deposit.toFixed(0)})`,
      note ? `Note: ${note}` : ""
    ].join("\n")
  );

  return (
    <>
     <header className="header">
  <nav className="topnav">
    <a href="/">Planner</a>
    <a href="/book">Book & Enquire</a>
  </nav>

  <div className="header-inner" style={{ textAlign: "center" }}>
    <span className="badge">by Ahmed Said Dizman</span>
    <h1 className="title">NEST ULASLI – Book & Enquire</h1>
    <div className="subtitle">
      Private luxury villa with concierge service – seamless booking, curated experiences.
    </div>
  </div>
</header>

      <main className="container">
        <div className="card" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
          {/* LEFT */}
          <section>
            <h3 style={{ marginTop: 0 }}>Availability & Dates</h3>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <label>Villa</label>
              <select value={villa} onChange={(e) => setVilla(e.target.value as VillaKey)}>
                <option value="ALYA">ALYA — sleeps 8</option>
                <option value="ZEHRA">ZEHRA — sleeps 6</option>
              </select>
              <span style={{ marginLeft: "auto", color: "#475569" }}>
                Nightly from <strong>€ {VILLAS[villa].nightlyEUR.toFixed(0)}</strong>
              </span>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12 }}>
              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={2}
                disabled={booked}
                fromMonth={new Date()}
                captionLayout="dropdown"
                pagedNavigation
                styles={{
                  day: { borderRadius: 10 },
                  day_selected: { backgroundColor: "var(--brand)", color: "white" },
                  day_range_middle: { backgroundColor: "rgba(14,165,183,.15)" }
                }}
              />
              <div className="helper">Dates shown in grey are unavailable. Minimum stay 3 nights in peak periods.</div>
            </div>

            <h3 style={{ marginTop: 18 }}>Guests</h3>
            <div style={{ display: "flex", gap: 12 }}>
              <label>Adults</label>
              <input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value || 1))} style={{ width: 90 }} />
              <label>Children</label>
              <input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value || 0))} style={{ width: 90 }} />
            </div>

            <h3 style={{ marginTop: 18 }}>Special requests</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Airport transfer, private chef, daily breakfast, yacht charter, nanny…"
              style={{ width: "100%", height: 90, border: "1px solid var(--border)", borderRadius: 12, padding: 10 }}
            />
          </section>

          {/* RIGHT */}
          <aside className="card" style={{ alignSelf: "start" }}>
            <h3 style={{ marginTop: 0 }}>Your stay</h3>
            <div style={{ color: "#475569", marginBottom: 8 }}>
              {range?.from ? format(range.from, "dd MMM yyyy") : "–"} → {range?.to ? format(range.to, "dd MMM yyyy") : "–"} · {n} {n === 1 ? "night" : "nights"}
              <br />
              {villaInfo.name} · up to {villaInfo.sleeps} guests
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }}>
              <tbody>
                <tr><td>Accommodation</td><td style={{ textAlign: "right" }}>€ {price.base.toFixed(2)}</td></tr>
                <tr><td>Cleaning fee</td><td style={{ textAlign: "right" }}>€ {price.cleaning.toFixed(2)}</td></tr>
                <tr><td>Service {Math.round(SERVICE_FEE_PCT * 100)}%</td><td style={{ textAlign: "right" }}>€ {price.service.toFixed(2)}</td></tr>
                <tr><td style={{ paddingTop: 6, fontWeight: 700 }}>Total</td><td style={{ textAlign: "right", paddingTop: 6, fontWeight: 700 }}>€ {price.total.toFixed(2)}</td></tr>
                <tr><td colSpan={2} style={{ color: "#64748b", fontSize: 12, paddingTop: 6 }}>Refundable security deposit on arrival: € {price.deposit.toFixed(0)}.</td></tr>
              </tbody>
            </table>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <a className="btn primary" href={`https://wa.me/00000000000?text=${waText}`} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center" }}>
                Enquire on WhatsApp
              </a>
              <a className="btn ghost" href={`mailto:reservations@nest-ulasli.com?subject=Booking Enquiry – ${villaInfo.name}&body=${waText}`} style={{ flex: 1, textAlign: "center" }}>
                Request to Book
              </a>
            </div>

            <ul style={{ marginTop: 14, color: "#475569" }}>
              <li>Concierge can arrange private chef, daily housekeeping, yacht, car hire, massages and childcare.</li>
              <li>Check-in 16:00, check-out 11:00. No smoking indoors. Pets on request.</li>
              <li>Flexible cancellation - ask your concierge for current terms.</li>
            </ul>
          </aside>
        </div>

        <section className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginTop: 0 }}>Why book NEST ULASLI</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <div>
              <h4>Tailored stays</h4>
              <p>We design each itinerary around you - from sunrise swims to sunset cruises. Your concierge is one WhatsApp away.</p>
            </div>
            <div>
              <h4>Privacy & space</h4>
              <p>Private grounds, panoramic sea views and resort-style amenities for families and close friends.</p>
            </div>
            <div>
              <h4>Hotel-level housekeeping</h4>
              <p>Fresh linens, mid-stay clean and daily refresh on request. Optional breakfast and private chef experiences.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
