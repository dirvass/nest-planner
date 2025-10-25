import TopNav from "./components/TopNav";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
const WHATSAPP_NUMBER = "905320000000";
const WHATSAPP_DISPLAY = "+90 532 000 00 00";

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
  const [showValidation, setShowValidation] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);

  // Extras
  const [chef, setChef] = useState(false);
  const [quadHours, setQuadHours] = useState(0);
  const [transferWays, setTransferWays] = useState(0);

  // Calendar responsiveness
  const [months, setMonths] = useState(1);
  const guestPopoverRef = useRef<HTMLDivElement | null>(null);

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
      "Hello NEST ULASLI, I’d like to book a stay.",
      `Villa: ${villaInfo.name}`,
      range?.from ? `Check-in: ${format(range.from, "dd MMM yyyy")}` : "Check-in: –",
      range?.to ? `Check-out: ${format(range.to, "dd MMM yyyy")}` : "Check-out: –",
      `Nights: ${n}`,
      `Guests: ${adults} adults, ${childrenOver2} children (over 2), ${infants02} infants (0–2)`,
      `Extras: Chef(dinner)=${chef ? "Yes" : "No"}, Quad=${quadHours}h, Transfers=${transferIncluded ? "Included" : `${transferWays} way(s)`}`,
      `Estimate: ${euro(total)} (excl. refundable deposit € ${deposit.toFixed(0)})`,
      note ? `Note: ${note}` : "",
    ].join("\n")
  );

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
  const mailtoUrl = `mailto:reservations@nest-ulasli.com?subject=Booking Only – ${villaInfo.name}&body=${waText}`;

  const validationMessage = useMemo(() => {
    if (!showValidation || canSubmit) return "";
    if (!range?.from || !range?.to) return "Choose check-in and check-out dates to continue.";
    if (underMinNights) return `Minimum stay is ${MIN_NIGHTS} nights for this villa.`;
    if (overCapacity) return `${villaInfo.name} sleeps ${villaInfo.sleeps}. Reduce the number of adult or child guests.`;
    return "Complete the details above to proceed.";
  }, [showValidation, canSubmit, range?.from, range?.to, underMinNights, overCapacity, villaInfo.name, villaInfo.sleeps]);

  const handleWhatsApp = () => {
    if (!canSubmit) {
      setShowValidation(true);
      return;
    }
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleEmail = () => {
    if (!canSubmit) {
      setShowValidation(true);
      return;
    }
    if (typeof window !== "undefined") {
      window.location.href = mailtoUrl;
    }
  };

  const revealCalendar = () => {
    if (typeof document === "undefined") return;
    const calendar = document.getElementById("booking-calendar");
    calendar?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSearch = () => {
    if (!canSubmit) {
      setShowValidation(true);
      return;
    }
    if (typeof document === "undefined") return;
    const summaryHeading = document.getElementById("booking-summary-heading");
    summaryHeading?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateMonths = () => setMonths(window.innerWidth >= 1024 ? 2 : 1);
    updateMonths();
    window.addEventListener("resize", updateMonths);
    return () => window.removeEventListener("resize", updateMonths);
  }, []);

  useEffect(() => {
    if (n >= TRANSFER_INCLUDED_NIGHTS) setTransferWays(0);
  }, [n]);

  useEffect(() => {
    if (canSubmit && showValidation) setShowValidation(false);
  }, [canSubmit, showValidation]);

  useEffect(() => {
    if (!guestMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!guestPopoverRef.current) return;
      if (!guestPopoverRef.current.contains(event.target as Node)) {
        setGuestMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [guestMenuOpen]);

  const checkInText = range?.from ? format(range.from, "EEE, dd MMM") : "Add check-in";
  const checkOutText = range?.to ? format(range.to, "EEE, dd MMM") : "Add check-out";
  const nightsLabel = n ? `${n} ${n === 1 ? "night" : "nights"}` : `${MIN_NIGHTS}+ nights`;
  const servicePct = Math.round(SERVICE_FEE_PCT * 100);
  const primaryGuests = adults + childrenOver2;
  const guestSummary = primaryGuests
    ? `${adults} adult${adults === 1 ? "" : "s"}`
        + (childrenOver2
          ? `, ${childrenOver2} child${childrenOver2 === 1 ? "" : "ren"}`
          : "")
        + (infants02 ? `, ${infants02} infant${infants02 === 1 ? "" : "s"}` : "")
    : "Add guests";

  const summarySections = [
    {
      title: "Stay essentials",
      lines: [
        {
          label: "Accommodation",
          hint: n ? `${n} × € ${villaInfo.nightlyEUR.toFixed(0)}` : "Pick your travel dates",
          amount: base,
          placeholder: "Add dates",
        },
        {
          label: "Extra guests",
          hint:
            extraGuests > 0
              ? n > 0
                ? `${n} × € ${EXTRA_GUEST_FEE_EUR} × ${extraGuests}`
                : "Add dates to calculate extra guest fees"
              : `Included for ${INCLUDED_GUESTS} guests`,
          amount: extraGuestFee,
          placeholder: extraGuests > 0 ? "Add dates" : "Included",
        },
      ],
    },
    {
      title: "Enhancements",
      lines: [
        {
          label: "Private chef (dinner)",
          hint: chef && n > 0 ? `${n} × € ${CHEF_DINNER_PER_NIGHT}` : "Perfect for celebrations",
          amount: chefTotal,
          placeholder: chef ? "Add dates" : "Not added",
        },
        {
          label: "Quad bike",
          hint: quadHours > 0 ? `${quadHours} h × € ${QUAD_PER_HOUR}` : "Thrilling coastal trails",
          amount: quadTotal,
          placeholder: "Not added",
        },
        {
          label: "Airport transfer",
          hint: transferIncluded
            ? "Included with 7+ nights"
            : transferWays > 0
              ? `${transferWays} way(s) × € ${TRANSFER_PER_WAY}`
              : "Add private transfers if required",
          amount: transferTotal,
          placeholder: transferIncluded ? "Included" : "Not added",
        },
      ],
    },
    {
      title: "Fees",
      lines: [
        {
          label: "Cleaning fee",
          hint: n > 0 ? "Per stay" : "Added once your stay is scheduled",
          amount: cleaning,
          placeholder: "—",
        },
        {
          label: `Service ${servicePct}%`,
          hint: "Curated concierge support",
          amount: service,
          placeholder: "—",
        },
      ],
    },
  ];

  const chips = useMemo(() => {
    const d = range?.from && range?.to
      ? `${format(range.from, "dd MMM")} → ${format(range.to, "dd MMM yyyy")}`
      : "Select dates";
    const nightsTxt = n ? `${n} ${n === 1 ? "night" : "nights"}` : `${MIN_NIGHTS}+ nights`;
    const partyTxt = `${adults}A · ${childrenOver2}C · ${infants02}I`;
    const fromTxt = `From € ${villaInfo.nightlyEUR.toFixed(0)}/night`;
    return { d, nightsTxt, partyTxt, fromTxt };
  }, [range, n, adults, childrenOver2, infants02, villaInfo.nightlyEUR]);

  const adjustGuests = (setter: React.Dispatch<React.SetStateAction<number>>, delta: number, min: number, max: number) => {
    setter((prev) => {
      const next = prev + delta;
      if (next < min) return min;
      if (next > max) return max;
      return next;
    });
  };

  return (
    <>
      {/* HERO */}
      <header className="header">
        <TopNav />
        <div className="header-inner" style={{ textAlign: "center" }}>
          <span className="badge">by Dizman</span>
          <h1 className="hero-title">NEST ULASLI – Booking Only</h1>
          <div className="subtitle">
            Curate your stay, secure your preferred villa and tailor enhancements before confirming with our concierge team.
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="container booking-progress" aria-label="How to book">
        <div className="progress-card">
          <div className="progress-head">
            <div>
              <span className="badge">Tailor your escape</span>
              <h2>Booking concierge</h2>
              <p>
                Follow the steps to design your stay, explore enhancements, then send the details directly to our concierge team.
              </p>
            </div>
            <div className="progress-meta">
              <span className="meta-label">Talk to us</span>
              <span className="meta-value">WhatsApp {WHATSAPP_DISPLAY}</span>
              <span className="meta-sub">Everyday 09:00 – 22:00 TRT</span>
            </div>
          </div>
          <ol className="progress-steps">
            <li><strong>Step 1.</strong> Pick your villa and ideal dates.</li>
            <li><strong>Step 2.</strong> Confirm who’s travelling and add enhancements.</li>
            <li><strong>Step 3.</strong> Submit via WhatsApp or email to reserve.</li>
          </ol>
        </div>
      </section>

      <main className="container booking-container">
        <section className="booking-grid booking-grid--summary-dominant">
          {/* SUMMARY */}
          <aside className="summary summary-card sticky" aria-labelledby="booking-summary-heading">
            <div className="summary-top">
              <div>
                <span className="summary-label">Estimated total</span>
                <h2 id="booking-summary-heading" className="summary-total">{euro(total)}</h2>
                <p className="summary-sub muted">
                  {n ? `For ${nightsLabel} in ${villaInfo.name}` : "Add dates to reveal your bespoke quote"} — excludes refundable deposit (€ {deposit.toFixed(0)}).
                </p>
              </div>
              <div className="summary-bubble" aria-live="polite">
                <span className="summary-bubble-label">Deposit due</span>
                <span className="summary-bubble-value">€ {deposit.toFixed(0)}</span>
                <span className="summary-bubble-hint">Refundable on checkout</span>
              </div>
            </div>

            <div className="summary-meta-grid">
              <div className="meta-card">
                <span className="meta-label">Villa</span>
                <span className="meta-value">{villaInfo.name}</span>
                <span className="meta-sub">Sleeps {villaInfo.sleeps}</span>
              </div>
              <div className="meta-card">
                <span className="meta-label">Stay length</span>
                <span className="meta-value">{n ? nightsLabel : "Select dates"}</span>
                <span className="meta-sub">{MIN_NIGHTS}+ night minimum</span>
              </div>
              <div className="meta-card">
                <span className="meta-label">Guests</span>
                <span className="meta-value">{partySizeExclInfants} guest{partySizeExclInfants === 1 ? "" : "s"}</span>
                <span className="meta-sub">{infants02} infant{infants02 === 1 ? "" : "s"} (0–2)</span>
              </div>
            </div>

            {underMinNights && (
              <div className="notice error" role="alert">
                Minimum stay is {MIN_NIGHTS} nights. Please adjust your dates.
              </div>
            )}
            {overCapacity && (
              <div className="notice warning" role="alert">
                {villaInfo.name} sleeps {villaInfo.sleeps}. Reduce adult or children guests to proceed.
              </div>
            )}

            <div className="summary-actions">
              <button
                type="button"
                className="btn primary"
                onClick={handleWhatsApp}
                disabled={!canSubmit}
              >
                Start WhatsApp chat
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={handleEmail}
                disabled={!canSubmit}
              >
                Email booking
              </button>
            </div>

            {validationMessage && (
              <div className="notice info" role="status">
                {validationMessage}
              </div>
            )}

            <div className="divider" />

            {summarySections.map((section) => (
              <section className="summary-section" key={section.title} aria-label={`${section.title} breakdown`}>
                <h3 className="summary-section-title">{section.title}</h3>
                <div className="summary-section-lines">
                  {section.lines.map((line) => (
                    <div className="summary-line" key={line.label}>
                      <div className="summary-line-copy">
                        <span className="summary-line-label">{line.label}</span>
                        <span className="summary-line-hint">{line.hint}</span>
                      </div>
                      <span className={`summary-line-value ${line.amount === 0 ? "muted" : ""}`}>
                        {line.amount > 0 ? euro(line.amount) : line.placeholder}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="summary-foot muted">
              Complimentary experiences unlock automatically once your stay reaches the qualifying nights.
            </div>

            <div className="included included-modern">
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
              <div>
                <span className="panel-step">Step 1</span>
                <h3 className="panel-title">Plan your stay</h3>
              </div>
              <div className="chips">
                <span className="chip">{chips.d}</span>
                <span className="chip">{chips.nightsTxt}</span>
                <span className="chip">{chips.partyTxt}</span>
                <span className="chip chip-soft">{chips.fromTxt}</span>
              </div>
            </div>

            <div className="stay-search">
              <div className="stay-search-top">
                <label className="stay-select">
                  <span className="stay-select-label">Villa</span>
                  <select
                    aria-label="Select villa"
                    value={villa}
                    onChange={(e) => { setVilla(e.target.value as VillaKey); setRange(undefined); }}
                  >
                    <option value="ALYA">ALYA — sleeps 8</option>
                    <option value="ZEHRA">ZEHRA — sleeps 6</option>
                  </select>
                </label>
                <button
                  className="stay-reset"
                  onClick={() => { setRange(undefined); setShowValidation(false); }}
                  aria-label="Reset dates"
                >
                  Reset dates
                </button>
              </div>

              <div className="stay-search-inner">
                <button type="button" className="stay-field stay-field--dates" onClick={revealCalendar}>
                  <span className="stay-field-block">
                    <span className="stay-field-label">Check-in</span>
                    <span className="stay-field-value">{checkInText}</span>
                  </span>
                  <span className="stay-field-arrow" aria-hidden>
                    →
                  </span>
                  <span className="stay-field-block">
                    <span className="stay-field-label">Check-out</span>
                    <span className="stay-field-value">{checkOutText}</span>
                  </span>
                </button>

                <span className="stay-divider" aria-hidden />

                <div className="stay-guest" ref={guestPopoverRef}>
                  <button
                    type="button"
                    className={`stay-field ${guestMenuOpen ? "is-active" : ""}`}
                    onClick={() => setGuestMenuOpen((open) => !open)}
                    aria-haspopup="dialog"
                    aria-expanded={guestMenuOpen}
                  >
                    <span className="stay-field-label">Guests</span>
                    <span className="stay-field-value">{guestSummary}</span>
                  </button>

                  {guestMenuOpen && (
                    <div className="guest-popover" role="dialog" aria-label="Guest selection">
                      <div className="guest-row">
                        <div>
                          <span className="guest-title">Adults</span>
                          <span className="guest-sub">Ages 13+</span>
                        </div>
                        <div className="guest-counter">
                          <button type="button" onClick={() => adjustGuests(setAdults, -1, 1, 12)} aria-label="Remove adult">−</button>
                          <span>{adults}</span>
                          <button type="button" onClick={() => adjustGuests(setAdults, 1, 1, 12)} aria-label="Add adult">+</button>
                        </div>
                      </div>
                      <div className="guest-row">
                        <div>
                          <span className="guest-title">Children</span>
                          <span className="guest-sub">Ages 3–12</span>
                        </div>
                        <div className="guest-counter">
                          <button type="button" onClick={() => adjustGuests(setChildrenOver2, -1, 0, 12)} aria-label="Remove child">−</button>
                          <span>{childrenOver2}</span>
                          <button type="button" onClick={() => adjustGuests(setChildrenOver2, 1, 0, 12)} aria-label="Add child">+</button>
                        </div>
                      </div>
                      <div className="guest-row">
                        <div>
                          <span className="guest-title">Infants</span>
                          <span className="guest-sub">Under 3</span>
                        </div>
                        <div className="guest-counter">
                          <button type="button" onClick={() => adjustGuests(setInfants02, -1, 0, 6)} aria-label="Remove infant">−</button>
                          <span>{infants02}</span>
                          <button type="button" onClick={() => adjustGuests(setInfants02, 1, 0, 6)} aria-label="Add infant">+</button>
                        </div>
                      </div>
                      <button type="button" className="guest-close" onClick={() => setGuestMenuOpen(false)}>
                        Done
                      </button>
                    </div>
                  )}
                </div>

                <span className="stay-divider stay-divider--flush" aria-hidden />

                <button type="button" className="stay-search-btn" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>

            <div className="calendar-shell">
              <div className="calendar-metrics">
                <div className="calendar-metric">
                  <span className="calendar-metric-label">Check-in</span>
                  <span className="calendar-metric-value">{checkInText}</span>
                </div>
                <div className="calendar-metric">
                  <span className="calendar-metric-label">Check-out</span>
                  <span className="calendar-metric-value">{checkOutText}</span>
                </div>
                <div className="calendar-metric">
                  <span className="calendar-metric-label">Stay</span>
                  <span className="calendar-metric-value">{n ? nightsLabel : `${MIN_NIGHTS}+ nights`}</span>
                </div>
              </div>

              <div className="calendar-card" id="booking-calendar">
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
                  fixedWeeks
                  captionLayout="dropdown"
                  pagedNavigation
                />
              </div>

              <div className="calendar-legend">
                <span><span className="dot dot-sel" /> Selected</span>
                <span><span className="dot dot-un" /> Unavailable</span>
                <span><span className="dot dot-av" /> Available</span>
              </div>

              <div className="calendar-footnote muted">
                Stay {MIN_NIGHTS}+ nights to unlock return transfers and a floating breakfast experience.
              </div>
            </div>

            <div className="panel-head">
              <div>
                <span className="panel-step">Step 2</span>
                <h3 className="panel-title">Enhancements</h3>
              </div>
            </div>

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
                  <div className="select-wrap" style={{ width: 140 }}>
                    <select value={quadHours} onChange={(e) => setQuadHours(Number(e.target.value))}>
                      {options(0, 12).map(v => <option key={`qh-${v}`} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="helper">€ {QUAD_PER_HOUR} / hour</div>
                </div>

                <div className="elite-field">
                  <label className="label">Airport transfer (ways)</label>
                  <div className="select-wrap" style={{ width: 140 }}>
                    <select
                      value={transferWays}
                      onChange={(e) => setTransferWays(Number(e.target.value))}
                      disabled={transferIncluded}
                    >
                      {[0,1,2].map(v => <option key={`tw-${v}`} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="helper">{transferIncluded ? "Included for 7+ nights" : `€ ${TRANSFER_PER_WAY} / way`}</div>
                </div>
              </div>
            </div>

            <div className="panel-head">
              <div>
                <span className="panel-step">Step 3</span>
                <h3 className="panel-title">Special requests</h3>
              </div>
            </div>

            <div className="elite-field">
              <label className="label">Special requests</label>
              <textarea
                className="textarea luxe"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Airport transfer timing, chef preferences, dietary needs, nanny…"
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
          <div className="sub">{n ? `${n} ${n === 1 ? "night" : "nights"}` : "Select dates"} · {villaInfo.name}</div>
        </div>
        <div className="actions">
          <button type="button" className="btn primary" onClick={handleWhatsApp} disabled={!canSubmit}>
            WhatsApp
          </button>
          <button type="button" className="btn ghost" onClick={handleEmail} disabled={!canSubmit}>
            Email
          </button>
        </div>
      </div>
    </>
  );
}
