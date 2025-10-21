import TopNav from "./components/TopNav";
import React, { useEffect, useMemo, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { differenceInCalendarDays, format, isBefore, startOfToday } from "date-fns";
import "react-day-picker/dist/style.css";

type VillaKey = "ALYA" | "ZEHRA";

const VILLAS: Record<VillaKey, { name: string; nightlyEUR: number; sleeps: number }> = {
  ALYA: { name: "ALYA", nightlyEUR: 700, sleeps: 8 },
  ZEHRA: { name: "ZEHRA", nightlyEUR: 550, sleeps: 6 },
};

const BOOKED: Record<VillaKey, { from: Date; to: Date }[]> = {
  ALYA: [
    { from: new Date(new Date().getFullYear(), 6, 12), to: new Date(new Date().getFullYear(), 6, 18) },
    { from: new Date(new Date().getFullYear(), 7, 3), to: new Date(new Date().getFullYear(), 7, 7) },
  ],
  ZEHRA: [{ from: new Date(new Date().getFullYear(), 7, 14), to: new Date(new Date().getFullYear(), 7, 21) }],
};

const CLEANING_FEE = 150;
const SERVICE_FEE_PCT = 0.05;
const EXTRA_GUEST_FEE_EUR = 200;
const INCLUDED_GUESTS = 2;

const CHEF_DINNER_PER_NIGHT = 200;
const QUAD_PER_HOUR = 50;
const TRANSFER_PER_WAY = 100;
const TRANSFER_INCLUDED_NIGHTS = 7;

const MIN_NIGHTS = 3;

function nightsOf(range: DateRange | undefined) {
  if (!range?.from || !range.to) return 0;
  return Math.max(0, differenceInCalendarDays(range.to, range.from));
}

const euro = (n: number) => `€ ${n.toFixed(2)}`;
const options = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

export default function BookingPage() {
  const [villa, setVilla] = useState<VillaKey>("ALYA");
  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(2);
  const [childrenOver2, setChildrenOver2] = useState(0);
  const [infants02, setInfants02] = useState(0);
  const [note, setNote] = useState("");

  // Extras
  const [chef, setChef] = useState(false);
  const [quadHours, setQuadHours] = useState(0);
  const [transferWays, setTransferWays] = useState(0);

  // --- Mobile awareness for layout & calendar ---
  const [isMobile, setIsMobile] = useState(false);
  const [months, setMonths] = useState(1); // force 1 month on mobile to avoid overflow

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 980;
      setIsMobile(mobile);
      setMonths(1); // keep compact even on tablet - safer
      // lock viewport width to prevent horizontal scroll jiggle
      document.documentElement.style.setProperty("--vw", `${window.innerWidth}px`);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const n = nightsOf(range);
  const villaInfo = VILLAS[villa];
  const partySizeExclInfants = adults + childrenOver2;
  const overCapacity = partySizeExclInfants > villaInfo.sleeps;
  const underMinNights = n > 0 && n < MIN_NIGHTS;

  const extraGuests = Math.max(0, partySizeExclInfants - INCLUDED_GUESTS);
  const base = n * villaInfo.nightlyEUR;
  const extraGuestFee = n > 0 ? n * EXTRA_GUEST_FEE_EUR * extraGuests : 0;

  const chefTotal = chef && n > 0 ? n * CHEF_DINNER_PER_NIGHT : 0;
  const quadTotal = quadHours * QUAD_PER_HOUR;
  const transferIncluded = n >= TRANSFER_INCLUDED_NIGHTS;
  const transferTotal = transferIncluded ? 0 : transferWays * TRANSFER_PER_WAY;
  const cleaning = n > 0 ? CLEANING_FEE : 0;

  const subtotal = base + extraGuestFee + chefTotal + quadTotal + transferTotal + cleaning;
  const service = subtotal * SERVICE_FEE_PCT;
  const total = subtotal + service;
  const deposit = 500;

  const today = startOfToday();
  const disabledDates = [{ before: today }, ...BOOKED[villa]];
  const canSubmit = n >= MIN_NIGHTS && !overCapacity;

  const waText = encodeURIComponent(
    [
      "Hello NEST ULASLI, I’d like to enquire about a stay.",
      `Villa: ${villaInfo.name}`,
      range?.from ? `Check-in: ${format(range.from, "dd MMM yyyy")}` : "Check-in: -",
      range?.to ? `Check-out: ${format(range.to, "dd MMM yyyy")}` : "Check-out: -",
      `Nights: ${n}`,
      `Guests: ${adults} adults, ${childrenOver2} children (over 2), ${infants02} infants (0-2)`,
      `Extras: Chef(dinner)=${chef ? "Yes" : "No"}, Quad=${quadHours}h, Transfers=${transferIncluded ? "Included" : `${transferWays} way(s)`}`,
      `Estimate: ${euro(total)} (excl. refundable deposit € ${deposit.toFixed(0)})`,
      note ? `Note: ${note}` : "",
    ].join("\n")
  );

  useEffect(() => {
    if (n >= TRANSFER_INCLUDED_NIGHTS) setTransferWays(0);
  }, [n]);

  const chips = useMemo(() => {
    const d =
      range?.from && range?.to
        ? `${format(range.from, "dd MMM")} -> ${format(range.to, "dd MMM yyyy")}`
        : "Select dates";
    const nightsTxt = `${n} ${n === 1 ? "night" : "nights"}`;
    const partyTxt = `${adults}A · ${childrenOver2}C · ${infants02}I`;
    const fromTxt = `From € ${villaInfo.nightlyEUR.toFixed(0)}/night`;
    return { d, nightsTxt, partyTxt, fromTxt };
  }, [range, n, adults, childrenOver2, infants02, villaInfo.nightlyEUR]);

  return (
    <>
      {/* HERO */}
      <header className="header">
        <TopNav />
        <div className="header-inner" style={{ textAlign: "center" }}>
          <span className="badge">by Dizman</span>
          <h1 className="hero-title">NEST ULASLI - Book & Enquire</h1>
          <div className="subtitle">
            Includes daily breakfast • bicycles • table tennis. For 7+ nights: return transfers & 1× floating breakfast.
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container">
        {/* On mobile put SUMMARY first, Calendar second - controlled by CSS order */}
        <section className="shell booking-grid booking-grid--summary-dominant">
          {/* SUMMARY */}
          <aside className="summary summary-card sticky">
            <div className="summary-head">
              <div className="summary-total">{euro(total)}</div>
              <div className="summary-sub muted">
                Estimate for your dates{n ? ` - ${n} ${n === 1 ? "night" : "nights"}` : ""} - excl. refundable deposit (€ {deposit})
              </div>
              <div className="summary-ctas">
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
                  href={
                    canSubmit
                      ? `mailto:reservations@nest-ulasli.com?subject=Booking Enquiry - ${villaInfo.name}&body=${waText}`
                      : undefined
                  }
                >
                  Request to Book
                </a>
              </div>
            </div>

            <div className="divider" />

            <div className="summary-lines">
              <div className="line">
                <span>Accommodation</span>
                <span className="hint">{n} × € {villaInfo.nightlyEUR.toFixed(0)}</span>
                <strong>{euro(base)}</strong>
              </div>

              <div className="line">
                <span>Extra guests</span>
                <span className="hint">{n} × € {EXTRA_GUEST_FEE_EUR} × {extraGuests}</span>
                <strong>{euro(extraGuestFee)}</strong>
              </div>

              <div className="group-label">Enhancements</div>
              <div className="line">
                <span>Private chef (dinner)</span>
                <span className="hint">{chef ? `${n} × € ${CHEF_DINNER_PER_NIGHT}` : "-"}</span>
                <strong>{chef ? euro(chefTotal) : "€ 0.00"}</strong>
              </div>
              <div className="line">
                <span>Quad bike</span>
                <span className="hint">{quadHours} h × € {QUAD_PER_HOUR}</span>
                <strong>{euro(quadTotal)}</strong>
              </div>
              <div className="line">
                <span>Airport transfer</span>
                <span className="hint">
                  {transferIncluded ? "Included (7+ nights)" : `${transferWays} way(s) × € ${TRANSFER_PER_WAY}`}
                </span>
                <strong>{euro(transferTotal)}</strong>
              </div>

              <div className="group-label">Fees</div>
              <div className="line">
                <span>Cleaning fee</span>
                <strong>{euro(cleaning)}</strong>
              </div>
              <div className="line">
                <span>Service {Math.round(SERVICE_FEE_PCT * 100)}%</span>
                <strong>{euro(service)}</strong>
              </div>
            </div>

            {underMinNights && (
              <div className="notice error" style={{ marginTop: 8 }}>
                Minimum stay is {MIN_NIGHTS} nights. Please adjust your dates.
              </div>
            )}

            <div className="included">
              <span className="badge-soft">Daily breakfast</span>
              <span className="badge-soft">Bicycles</span>
              <span className="badge-soft">Table tennis</span>
              {n >= TRANSFER_INCLUDED_NIGHTS && (
                <>
                  <span className="badge-soft">Return transfers</span>
                  <span className="badge-soft">1× Floating breakfast</span>
                </>
              )}
            </div>
          </aside>

          {/* AVAILABILITY + FORM */}
          <div className="panel stack">
            <div className="panel-head">
              <h3 className="panel-title">Availability</h3>
              <div className="chips">
                <span className="chip">{chips.d}</span>
                <span className="chip">{chips.nightsTxt}</span>
                <span className="chip">{chips.partyTxt}</span>
                <span className="chip chip-soft">{chips.fromTxt}</span>
              </div>
            </div>

            <div className="row">
              <div>
                <label className="label">Villa</label>
                <select
                  aria-label="Select villa"
                  value={villa}
                  onChange={(e) => { setVilla(e.target.value as VillaKey); setRange(undefined); }}
                >
                  <option value="ALYA">ALYA - sleeps 8</option>
                  <option value="ZEHRA">ZEHRA - sleeps 6</option>
                </select>
              </div>
              <div className="spacer" />
              <button className="ghost" onClick={() => setRange(undefined)} aria-label="Reset dates">
                Reset dates
              </button>
            </div>

            {/* Compact Calendar */}
            <div className="calendar-card compact-picker shrink-65 no-overflow">
              <DayPicker
                mode="range"
                numberOfMonths={months}
                selected={range}
                onSelect={(r) => {
                  if (r?.from && r?.to && isBefore(r.to, r.from)) setRange({ from: r.to, to: r.from });
                  else setRange(r);
                }}
                fromDate={today}
                disabled={disabledDates}
                showOutsideDays
                captionLayout="dropdown"
                pagedNavigation
              />
              <div className="calendar-legend">
                <span><span className="dot dot-sel" /> Selected</span>
                <span><span className="dot dot-un" /> Unavailable</span>
                <span><span className="dot dot-av" /> Available</span>
              </div>
            </div>

            {/* Guests */}
            <div className="row elite-row">
              <div className="elite-field">
                <label className="label">Adults</label>
                <div className="select-wrap">
                  <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                    {options(1, 12).map((v) => <option key={`a-${v}`} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="elite-field">
                <label className="label">Children (over 2)</label>
                <div className="select-wrap">
                  <select value={childrenOver2} onChange={(e) => setChildrenOver2(Number(e.target.value))}>
                    {options(0, 12).map((v) => <option key={`c-${v}`} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="elite-field">
                <label className="label">Infants (0-2)</label>
                <div className="select-wrap">
                  <select value={infants02} onChange={(e) => setInfants02(Number(e.target.value))}>
                    {options(0, 6).map((v) => <option key={`i-${v}`} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Extras */}
            <div className="extras panel">
              <h4 className="extras-title">Enhance your stay (optional)</h4>
              <label className="switch">
                <input type="checkbox" checked={chef} onChange={(e) => setChef(e.target.checked)} />
                <span className="slider" />
                <div className="switch-label">
                  <strong>Private chef (dinner)</strong>
                  <span>€ {CHEF_DINNER_PER_NIGHT} / night</span>
                </div>
              </label>

              <div className="extras-row">
                <div className="elite-field">
                  <label className="label">Quad bike (hours)</label>
                  <div className="select-wrap wide">
                    <select value={quadHours} onChange={(e) => setQuadHours(Number(e.target.value))}>
                      {options(0, 12).map((v) => <option key={`qh-${v}`} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="muted small">€ {QUAD_PER_HOUR} / hour</div>
                </div>

                <div className="elite-field">
                  <label className="label">Airport transfer (ways)</label>
                  <div className="select-wrap wide">
                    <select
                      value={transferWays}
                      onChange={(e) => setTransferWays(Number(e.target.value))}
                      disabled={transferIncluded}
                    >
                      {[0, 1, 2].map((v) => <option key={`tw-${v}`} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="muted small">
                    {transferIncluded ? "Included for 7+ nights" : `€ ${TRANSFER_PER_WAY} / way`}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="elite-field">
              <label className="label">Special requests</label>
              <textarea
                className="textarea luxe"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Airport transfer timing, chef preferences, quad route time, dietary needs, nanny…"
                rows={3}
              />
            </div>
          </div>
        </section>
      </main>

      {/* MOBILE STICKY BAR */}
      <div className="bottom-bar" role="region" aria-label="Quick booking actions">
        <div className="info">
          <div className="total">{euro(total)}</div>
          <div className="sub">{n ? `${n} ${n === 1 ? "night" : "nights"}` : "Select dates"} - {villaInfo.name}</div>
        </div>
        <div className="actions">
          <a
            className={`btn primary ${!canSubmit ? "disabled" : ""}`}
            aria-disabled={!canSubmit}
            href={canSubmit ? `https://wa.me/00000000000?text=${waText}` : undefined}
            target="_blank"
            rel="noreferrer"
          >
            Enquire
          </a>
          <a
            className={`btn ghost ${!canSubmit ? "disabled" : ""}`}
            aria-disabled={!canSubmit}
            href={
              canSubmit
                ? `mailto:reservations@nest-ulasli.com?subject=Booking Enquiry - ${villaInfo.name}&body=${waText}`
                : undefined
            }
          >
            Email
          </a>
        </div>
      </div>
    </>
  );
}
