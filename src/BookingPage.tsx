// src/BookingPage.tsx
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

// demo booked ranges – replace with real availability as needed
const BOOKED: Record<VillaKey, { from: Date; to: Date }[]> = {
  ALYA: [
    { from: new Date(new Date().getFullYear(), 6, 12), to: new Date(new Date().getFullYear(), 6, 18) },
    { from: new Date(new Date().getFullYear(), 7, 3),  to: new Date(new Date().getFullYear(), 7, 7) }
  ],
  ZEHRA: [
    { from: new Date(new Date().getFullYear(), 7, 14), to: new Date(new Date().getFullYear(), 7, 21) }
  ]
};

// pricing
const CLEANING_FEE = 150;
const SERVICE_FEE_PCT = 0.05;
const EXTRA_GUEST_FEE_EUR = 200;   // per extra guest (older than 2 yrs), PER NIGHT
const INCLUDED_GUESTS = 2;

// booking policy
const MIN_NIGHTS = 3;

/* ---------- Helpers ---------- */
function nightsOf(range: DateRange | undefined) {
  if (!range?.from || !range.to) return 0;
  return Math.max(0, differenceInCalendarDays(range.to, range.from));
}
const euro = (n: number) => `€ ${n.toFixed(2)}`;

/* ---------- Component ---------- */
export default function BookingPage() {
  const [villa, setVilla] = useState<VillaKey>("ALYA");
  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(2);
  const [childrenOver2, setChildrenOver2] = useState(0);
  const [infants02, setInfants02] = useState(0); // 0–2 years (free)
  const [note, setNote] = useState("");
  const [months, setMonths] = useState<number>(2);

  // responsive months for calendar
  useEffect(() => {
    const onResize = () => setMonths(window.innerWidth < 980 ? 1 : 2);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const n = nightsOf(range);
  const villaInfo = VILLAS[villa];

  // Capacity check (infants don't count towards surcharge; keep capacity rule simple)
  const partySizeExclInfants = adults + childrenOver2;
  const overCapacity = partySizeExclInfants > villaInfo.sleeps;
  const underMinNights = n > 0 && n < MIN_NIGHTS;

  // ------- Pricing logic with extra-guest rule -------
  const extraGuests = Math.max(0, partySizeExclInfants - INCLUDED_GUESTS);
  const price = useMemo(() => {
    const base = n * villaInfo.nightlyEUR;
    const extraGuestFee = n > 0 ? n * EXTRA_GUEST_FEE_EUR * extraGuests : 0;
    const cleaning = n > 0 ? CLEANING_FEE : 0;
    const service = (base + cleaning + extraGuestFee) * SERVICE_FEE_PCT;
    return {
      base,
      extraGuestFee,
      cleaning,
      service,
      total: base + extraGuestFee + cleaning + service,
      deposit: 500
    };
  }, [n, villaInfo.nightlyEUR, extraGuests]);

  // calendar disable rules
  const today = startOfToday();
  const disabledDates = [{ before: today }, ...BOOKED[villa]];

  const waText = encodeURIComponent(
    [
      "Hello NEST ULASLI, I’d like to enquire about a stay.",
      `Villa: ${villaInfo.name}`,
      range?.from ? `Check-in: ${format(range.from, "dd MMM yyyy")}` : "Check-in: –",
      range?.to   ? `Check-out: ${format(range.to,   "dd MMM yyyy")}` : "Check-out: –",
      `Guests: ${adults} adults, ${childrenOver2} children (over 2), ${infants02} infants (0–2)`,
      `Nights: ${n}`,
      `Included guests: ${INCLUDED_GUESTS}; Extra chargeable guests: ${extraGuests} @ €${EXTRA_GUEST_FEE_EUR}/night`,
      `Estimate: ${euro(price.total)} (excl. refundable deposit € ${price.deposit.toFixed(0)})`,
      note ? `Note: ${note}` : ""
    ].join("\n")
  );

  const canSubmit = n >= MIN_NIGHTS && !overCapacity;

  return (
    <>
      {/* HERO with global nav (Home / Planner / Book) */}
      <header className="header">
        <div className="nav-buttons">
          <a href="/" className="nav-btn">Home</a>
          <a href="/planner" className="nav-btn">Planner</a>
          <a href="/book" className="nav-btn primary">Book & Enquire</a>
        </div>
        <div className="header-inner" style={{ textAlign: "center" }}>
          <span className="badge">by Dizman</span>
          <h1 className="title">NEST ULASLI – Book & Enquire</h1>
          <div className="subtitle">
            Private luxury villa with concierge service – seamless booking, curated experiences.
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container">
        <section className="shell booking-grid">
          {/* LEFT: calendar & form */}
          <div className="card stack">
            <div className="section-header">
              <h3 style={{ margin: 0 }}>Availability</h3>
              <div className="muted">Nightly from <strong>€ {villaInfo.nightlyEUR.toFixed(0)}</strong></div>
            </div>

            {/* Villa + reset */}
            <div className="row">
              <div>
                <label className="label">Villa</label>
                <select
                  aria-label="Select villa"
                  value={villa}
                  onChange={(e) => { setVilla(e.target.value as VillaKey); setRange(undefined); }}
                >
                  <option value="ALYA">ALYA — sleeps 8</option>
                  <option value="ZEHRA">ZEHRA — sleeps 6</option>
                </select>
              </div>
              <div className="spacer" />
              <button className="ghost" onClick={() => setRange(undefined)} aria-label="Reset dates">
                Reset dates
              </button>
            </div>

            {/* Calendar */}
            <div className="calendar-card">
              <DayPicker
                mode="range"
                numberOfMonths={months}
                selected={range}
                onSelect={(r) => {
                  if (r?.from && r?.to && isBefore(r.to, r.from)) {
                    setRange({ from: r.to, to: r.from });
                  } else {
                    setRange(r);
                  }
                }}
                fromDate={today}
                disabled={disabledDates}
                captionLayout="dropdown"
                pagedNavigation
                styles={{
                  day: { borderRadius: 10 },
                  day_selected: { backgroundColor: "#0ea5b7", color: "white" },
                  day_range_middle: { backgroundColor: "rgba(14,165,183,.15)" }
                }}
              />
              <div className="helper">
                Greyed dates are unavailable. Minimum stay {MIN_NIGHTS} nights in peak periods.
              </div>
            </div>

            {/* Guests */}
            <div className="row">
              <div>
                <label className="label">Adults</label>
                <input
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value || 1)))}
                />
              </div>
              <div>
                <label className="label">Children (over 2)</label>
                <input
                  type="number"
                  min={0}
                  value={childrenOver2}
                  onChange={(e) => setChildrenOver2(Math.max(0, Number(e.target.value || 0)))}
                />
              </div>
              <div>
                <label className="label">Infants (0–2)</label>
                <input
                  type="number"
                  min={0}
                  value={infants02}
                  onChange={(e) => setInfants02(Math.max(0, Number(e.target.value || 0)))}
                />
              </div>
            </div>

            {overCapacity && (
              <div className="error">
                This villa sleeps up to {villaInfo.sleeps}. Please reduce guests or choose the other villa.
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="label">Special requests</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Airport transfer, private chef, daily breakfast, yacht charter, nanny…"
                rows={4}
              />
            </div>
          </div>

          {/* RIGHT: sticky summary */}
          <aside className="card sticky summary">
            <h3 style={{ marginTop: 0 }}>Your stay</h3>
            <div className="muted" style={{ marginBottom: 8 }}>
              {range?.from ? format(range.from, "dd MMM yyyy") : "–"} → {range?.to ? format(range.to!, "dd MMM yyyy") : "–"} · {n} {n === 1 ? "night" : "nights"}
              <br />
              {villaInfo.name} · up to {villaInfo.sleeps} guests
              <br />
              Party: {adults} adults, {childrenOver2} children (over 2), {infants02} infants (0–2)
            </div>

            <table className="price-table">
              <tbody>
                <tr>
                  <td>Accommodation</td>
                  <td className="end">{n} × € {villaInfo.nightlyEUR.toFixed(0)}</td>
                  <td className="end">{euro(price.base)}</td>
                </tr>
                <tr>
                  <td>Extra guest fee</td>
                  <td className="end">
                    {n} × € {EXTRA_GUEST_FEE_EUR} × {extraGuests} {extraGuests === 1 ? "guest" : "guests"}
                  </td>
                  <td className="end">{euro(price.extraGuestFee)}</td>
                </tr>
                <tr>
                  <td>Cleaning fee</td>
                  <td />
                  <td className="end">{euro(price.cleaning)}</td>
                </tr>
                <tr>
                  <td>Service {Math.round(SERVICE_FEE_PCT * 100)}%</td>
                  <td />
                  <td className="end">{euro(price.service)}</td>
                </tr>
                <tr className="total">
                  <td>Total</td>
                  <td />
                  <td className="end">{euro(price.total)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="muted small">
                    Refundable security deposit on arrival: € {price.deposit.toFixed(0)}.
                  </td>
                </tr>
              </tbody>
            </table>

            {underMinNights && (
              <div className="error" style={{ marginTop: 8 }}>
                Minimum stay is {MIN_NIGHTS} nights. Please adjust your dates.
              </div>
            )}

            <div className="cta-row">
              <a
                className={`btn primary ${!canSubmit ? "disabled" : ""}`}
                aria-disabled={!canSubmit}
                href={canSubmit ? `https://wa.me/00000000000?text=${waText}` : undefined}
                target="_blank"
                rel="noreferrer"
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
        </section>

        {/* Reasons */}
        <section className="card stack shell" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Why book NEST ULASLI</h3>
          <div className="reasons">
            <div>
              <h4>Tailored stays</h4>
              <p>We design each itinerary around you – from sunrise swims to sunset cruises. Your concierge is one WhatsApp away.</p>
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
