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
const EXTRA_GUEST_FEE_EUR = 200;   // per extra guest (>2 yrs) per night
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
  const [infants02, setInfants02] = useState(0);
  const [note, setNote] = useState("");
  const [months, setMonths] = useState<number>(1); // compact: 1 month everywhere

  useEffect(() => {
    // still keep 1 month on all screens for a concise UI
    setMonths(1);
  }, []);

  const n = nightsOf(range);
  const villaInfo = VILLAS[villa];
  const partySizeExclInfants = adults + childrenOver2;
  const overCapacity = partySizeExclInfants > villaInfo.sleeps;
  const underMinNights = n > 0 && n < MIN_NIGHTS;

  const extraGuests = Math.max(0, partySizeExclInfants - INCLUDED_GUESTS);
  const price = useMemo(() => {
    const base = n * villaInfo.nightlyEUR;
    const extraGuestFee = n > 0 ? n * EXTRA_GUEST_FEE_EUR * extraGuests : 0;
    const cleaning = n > 0 ? CLEANING_FEE : 0;
    const service = (base + extraGuestFee + cleaning) * SERVICE_FEE_PCT;
    return {
      base,
      extraGuestFee,
      cleaning,
      service,
      total: base + extraGuestFee + cleaning + service,
      deposit: 500
    };
  }, [n, villaInfo.nightlyEUR, extraGuests]);

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

  // helper for options
  const options = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);

  return (
    <>
      {/* HERO with global nav */}
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

      <main className="container">
        {/* Make summary more relevant – place it first on mobile */}
        <section className="shell booking-grid booking-grid--compact">
          {/* RIGHT (on desktop): sticky summary */}
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
          </aside>

          {/* LEFT (on desktop): compact calendar + selectors */}
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

            {/* Compact Calendar */}
            <div className="calendar-card compact-picker">
              <DayPicker
                mode="range"
                numberOfMonths={months}                 // 1 month – concise
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
                showOutsideDays
                captionLayout="dropdown"
                pagedNavigation
                styles={{
                  caption: { fontWeight: 700, fontSize: 14 },
                  head_cell: { fontSize: 12, color: "#64748b" },
                  day: { width: 34, height: 34, margin: 2, borderRadius: 8 },
                  day_selected: { backgroundColor: "#0ea5b7", color: "#fff" },
                  day_range_middle: { backgroundColor: "rgba(14,165,183,.15)", color: "#0f172a" },
                  nav_button: { width: 28, height: 28, borderRadius: 8 }
                }}
              />
              <div className="helper">
                Greyed dates are unavailable. Minimum stay {MIN_NIGHTS} nights in peak periods.
              </div>
            </div>

            {/* Elegant guest selectors (dropdowns) */}
            <div className="row elite-row">
              <div className="elite-field">
                <label className="label">Adults</label>
                <div className="select-wrap">
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                  >
                    {options(1, 12).map(v => <option key={`ad-${v}`} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="elite-field">
                <label className="label">Children (over 2)</label>
                <div className="select-wrap">
                  <select
                    value={childrenOver2}
                    onChange={(e) => setChildrenOver2(Number(e.target.value))}
                  >
                    {options(0, 12).map(v => <option key={`ch-${v}`} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="elite-field">
                <label className="label">Infants (0–2)</label>
                <div className="select-wrap">
                  <select
                    value={infants02}
                    onChange={(e) => setInfants02(Number(e.target.value))}
                  >
                    {options(0, 6).map(v => <option key={`in-${v}`} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Luxe notes */}
            <div className="elite-field">
              <label className="label">Special requests</label>
              <textarea
                className="textarea luxe"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Airport transfer, private chef, daily breakfast, yacht charter, nanny…"
                rows={3}
              />
            </div>
          </div>
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
