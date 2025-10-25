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
const WHATSAPP_NUMBER = "905320000000";
const WHATSAPP_DISPLAY = "+90 532 000 00 00";

function nightsOf(range: DateRange | undefined) {
  if (!range?.from || !range.to) return 0;
  return Math.max(0, differenceInCalendarDays(range.to, range.from));
}

const euro = (value: number) => `€ ${value.toFixed(2)}`;
const options = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

export default function BookingPage() {
  const [villa, setVilla] = useState<VillaKey>("ALYA");
  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(2);
  const [childrenOver2, setChildrenOver2] = useState(0);
  const [infants02, setInfants02] = useState(0);
  const [note, setNote] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  // Extras
  const [chef, setChef] = useState(false);
  const [quadHours, setQuadHours] = useState(0);
  const [transferWays, setTransferWays] = useState(0);

  // Calendar responsiveness
  const [months, setMonths] = useState(1);

  const nights = nightsOf(range);
  const villaInfo = VILLAS[villa];
  const partySizeExclInfants = adults + childrenOver2;
  const overCapacity = partySizeExclInfants > villaInfo.sleeps;
  const underMinNights = nights > 0 && nights < MIN_NIGHTS;

  const extraGuests = Math.max(0, partySizeExclInfants - INCLUDED_GUESTS);
  const base = nights * villaInfo.nightlyEUR;
  const extraGuestFee = nights > 0 ? nights * EXTRA_GUEST_FEE_EUR * extraGuests : 0;
  const chefTotal = chef && nights > 0 ? nights * CHEF_DINNER_PER_NIGHT : 0;
  const quadTotal = quadHours * QUAD_PER_HOUR;
  const transferIncluded = nights >= TRANSFER_INCLUDED_NIGHTS;
  const transferTotal = transferIncluded ? 0 : transferWays * TRANSFER_PER_WAY;
  const cleaning = nights > 0 ? CLEANING_FEE : 0;

  const subtotal = base + extraGuestFee + chefTotal + quadTotal + transferTotal + cleaning;
  const service = subtotal * SERVICE_FEE_PCT;
  const total = subtotal + service;
  const deposit = 500;

  const today = startOfToday();
  const disabledDates = [{ before: today }, ...BOOKED[villa]];
  const canSubmit = nights >= MIN_NIGHTS && !overCapacity;

  const waText = encodeURIComponent(
    [
      "Hello NEST ULASLI, I’d like to book a stay.",
      `Villa: ${villaInfo.name}`,
      range?.from ? `Check-in: ${format(range.from, "dd MMM yyyy")}` : "Check-in: –",
      range?.to ? `Check-out: ${format(range.to, "dd MMM yyyy")}` : "Check-out: –",
      `Nights: ${nights}`,
      `Guests: ${adults} adults, ${childrenOver2} children (over 2), ${infants02} infants (0–2)`,
      `Extras: Chef(dinner)=${chef ? "Yes" : "No"}, Quad=${quadHours}h, Transfers=${transferIncluded ? "Included" : `${transferWays} way(s)`}`,
      `Estimate: ${euro(total)} (excl. refundable deposit € ${deposit.toFixed(0)})`,
      note ? `Note: ${note}` : "",
    ].filter(Boolean).join("\n"),
  );

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
  const mailtoUrl = `mailto:reservations@nest-ulasli.com?subject=Booking – ${villaInfo.name}&body=${waText}`;

  const validationMessage = useMemo(() => {
    if (!showValidation || canSubmit) return "";
    if (!range?.from || !range?.to) return "Choose check-in and check-out dates to continue.";
    if (underMinNights) return `Minimum stay is ${MIN_NIGHTS} nights for this villa.`;
    if (overCapacity) return `${villaInfo.name} sleeps ${villaInfo.sleeps}. Reduce the number of adult or child guests.`;
    return "Complete the details above to proceed.";
  }, [showValidation, canSubmit, range?.from, range?.to, underMinNights, overCapacity, villaInfo.name, villaInfo.sleeps]);

  const scrollIntoViewById = (id: string) => {
    if (typeof document === "undefined") return;
    const prefersReduced = typeof window !== "undefined"
      && typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "center",
    });
  };

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
    scrollIntoViewById("booking-calendar");
  };

  const handleSearch = () => {
    if (!canSubmit) {
      setShowValidation(true);
      scrollIntoViewById("booking-calendar");
      return;
    }
    scrollIntoViewById("booking-summary-heading");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateMonths = () => setMonths(window.innerWidth >= 1024 ? 2 : 1);
    updateMonths();
    window.addEventListener("resize", updateMonths);
    return () => window.removeEventListener("resize", updateMonths);
  }, []);

  useEffect(() => {
    if (nights >= TRANSFER_INCLUDED_NIGHTS) setTransferWays(0);
  }, [nights]);

  useEffect(() => {
    if (canSubmit && showValidation) setShowValidation(false);
  }, [canSubmit, showValidation]);

  const rangeSelected = Boolean(range?.from && range?.to);
  const checkInText = range?.from ? format(range.from, "EEE, dd MMM") : "Add check-in";
  const checkOutText = range?.to ? format(range.to, "EEE, dd MMM") : "Add check-out";
  const nightsLabel = nights ? `${nights} ${nights === 1 ? "night" : "nights"}` : `${MIN_NIGHTS}+ nights`;
  const servicePct = Math.round(SERVICE_FEE_PCT * 100);
  const primaryGuests = adults + childrenOver2;
  const guestSummary = useMemo(() => (
    primaryGuests
      ? `${adults} adult${adults === 1 ? "" : "s"}`
          + (childrenOver2 ? `, ${childrenOver2} child${childrenOver2 === 1 ? "" : "ren"}` : "")
          + (infants02 ? `, ${infants02} infant${infants02 === 1 ? "" : "s"}` : "")
      : "Add guests"
  ), [primaryGuests, adults, childrenOver2, infants02]);
  const stayWindow = rangeSelected && range?.from && range?.to
    ? `${format(range.from, "dd MMM yyyy")} → ${format(range.to, "dd MMM yyyy")}`
    : "Select dates";

  const summarySections = useMemo(() => ([
    {
      title: "Stay essentials",
      lines: [
        {
          label: "Accommodation",
          hint: nights ? `${nights} × € ${villaInfo.nightlyEUR.toFixed(0)}` : "Pick your travel dates",
          amount: base,
          placeholder: "Add dates",
        },
        {
          label: "Extra guests",
          hint:
            extraGuests > 0
              ? nights > 0
                ? `${nights} × € ${EXTRA_GUEST_FEE_EUR} × ${extraGuests}`
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
          hint: chef && nights > 0 ? `${nights} × € ${CHEF_DINNER_PER_NIGHT}` : "Perfect for celebrations",
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
          hint: nights > 0 ? "Per stay" : "Added once your stay is scheduled",
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
  ]), [base, chef, chefTotal, cleaning, extraGuestFee, extraGuests, nights, quadHours, quadTotal, service, servicePct, transferIncluded, transferTotal, transferWays, villaInfo.nightlyEUR]);

  return (
    <>
      <header className="hero">
        <TopNav />
        <div className="hero__inner">
          <span className="badge">by Dizman</span>
          <h1 className="hero__title">NEST ULASLI – Booking </h1>
          <p className="hero__subtitle">
            Curate your stay, secure your preferred villa and tailor enhancements before confirming with our concierge team.
          </p>
        </div>
      </header>

      <main className="booking">
        <section className="booking__intro" aria-label="Booking concierge steps">
          <div className="intro-card">
            <div className="intro-copy">
              <span className="badge">Tailor your escape</span>
              <h2>Booking concierge</h2>
              <p>
                Follow the steps to design your stay, explore enhancements, then send the details directly to our concierge team.
              </p>
            </div>
            <div className="intro-meta">
              <span className="meta-label">Talk to us</span>
              <span className="meta-value">WhatsApp {WHATSAPP_DISPLAY}</span>
              <span className="meta-sub">Everyday 09:00 – 22:00 TRT</span>
            </div>
          </div>
          <ol className="intro-steps">
            <li><strong>Step 1.</strong> Pick your villa and ideal dates.</li>
            <li><strong>Step 2.</strong> Confirm who’s travelling and add enhancements.</li>
            <li><strong>Step 3.</strong> Submit via WhatsApp or email to reserve.</li>
          </ol>
        </section>

        <section className="booking__layout">
          <aside className="summary-card" aria-labelledby="booking-summary-heading">
            <div className="summary-card__header">
              <div>
                <span className="summary-label">Estimated total</span>
                <h2 id="booking-summary-heading" className="summary-total">{euro(total)}</h2>
                <p className="summary-sub">
                  {nights ? `For ${nightsLabel} in ${villaInfo.name}` : "Add dates to reveal your bespoke quote"} — excludes refundable deposit (€ {deposit.toFixed(0)}).
                </p>
              </div>
              <div className="summary-chip" aria-live="polite">
                <span className="summary-chip__label">Deposit due</span>
                <span className="summary-chip__value">€ {deposit.toFixed(0)}</span>
                <span className="summary-chip__hint">Refundable on checkout</span>
              </div>
            </div>

            <dl className="summary-meta">
              <div>
                <dt>Villa</dt>
                <dd>{villaInfo.name}</dd>
                <small>Sleeps {villaInfo.sleeps}</small>
              </div>
              <div>
                <dt>Stay length</dt>
                <dd>{nights ? nightsLabel : "Select dates"}</dd>
                <small>{MIN_NIGHTS}+ night minimum</small>
              </div>
              <div>
                <dt>Guests</dt>
                <dd>{partySizeExclInfants} guest{partySizeExclInfants === 1 ? "" : "s"}</dd>
                <small>{infants02} infant{infants02 === 1 ? "" : "s"} (0–2)</small>
              </div>
            </dl>

            <div className="summary-actions">
              <button type="button" className="btn primary" onClick={handleWhatsApp} disabled={!canSubmit}>
                Start WhatsApp chat
              </button>
              <button type="button" className="btn ghost" onClick={handleEmail} disabled={!canSubmit}>
                Email booking
              </button>
            </div>

            {showValidation && !canSubmit && range?.from && range?.to && validationMessage && (
              <div className="summary-note" role="status">{validationMessage}</div>
            )}

            <div className="summary-breakdown">
              {summarySections.map((section) => (
                <section key={section.title} aria-label={`${section.title} breakdown`}>
                  <h3>{section.title}</h3>
                  <ul>
                    {section.lines.map((line) => (
                      <li key={line.label}>
                        <div>
                          <span className="line-label">{line.label}</span>
                          <span className="line-hint">{line.hint}</span>
                        </div>
                        <span className={`line-value ${line.amount === 0 ? "muted" : ""}`}>
                          {line.amount > 0 ? euro(line.amount) : line.placeholder}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <p className="summary-foot">
              Complimentary experiences unlock automatically once your stay reaches the qualifying nights.
            </p>

            <div className="summary-included">
              <span>Daily breakfast</span>
              <span>Bicycles</span>
              <span>Table tennis</span>
              {nights >= TRANSFER_INCLUDED_NIGHTS && (
                <>
                  <span>Return transfers</span>
                  <span>1× Floating breakfast</span>
                </>
              )}
            </div>
          </aside>

          <section className="booking-flow">
            <article className="card availability" aria-labelledby="availability-heading">
              <header className="card-header">
                <div>
                  <span className="card-step">Step 1</span>
                  <h3 id="availability-heading">Check availability</h3>
                </div>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => { setRange(undefined); setShowValidation(false); }}
                >
                  Reset dates
                </button>
              </header>

              <div className="status-band" aria-live="polite">
                <div className="status-band__item">
                  <span className="status-band__label">Stay window</span>
                  <strong className="status-band__value">{stayWindow}</strong>
                </div>
                <div className="status-band__item">
                  <span className="status-band__label">Nights</span>
                  <strong className="status-band__value">{nightsLabel}</strong>
                </div>
                <div className="status-band__item">
                  <span className="status-band__label">Guests</span>
                  <strong className="status-band__value">{guestSummary}</strong>
                </div>
                <div className="status-band__item">
                  <span className="status-band__label">Villa rate</span>
                  <strong className="status-band__value">€ {villaInfo.nightlyEUR.toFixed(0)}/night</strong>
                </div>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span className="field__label">Villa</span>
                  <select
                    aria-label="Select villa"
                    value={villa}
                    onChange={(event) => { setVilla(event.target.value as VillaKey); setRange(undefined); setShowValidation(false); }}
                  >
                    <option value="ALYA">ALYA — sleeps 8</option>
                    <option value="ZEHRA">ZEHRA — sleeps 6</option>
                  </select>
                </label>

                <button type="button" className="date-field" onClick={revealCalendar}>
                  <span className="field__label">Check-in</span>
                  <span className="field__value">{checkInText}</span>
                </button>
                <button type="button" className="date-field" onClick={revealCalendar}>
                  <span className="field__label">Check-out</span>
                  <span className="field__value">{checkOutText}</span>
                </button>
              </div>

              {showValidation && !canSubmit && (!range?.from || !range?.to) && (
                <div className="inline-warning" role="alert">
                  Choose check-in and check-out dates to continue.
                </div>
              )}
              {showValidation && !canSubmit && range?.from && range?.to && underMinNights && (
                <div className="inline-warning" role="alert">
                  Minimum stay is {MIN_NIGHTS} nights for this villa.
                </div>
              )}

              <div className="calendar" id="booking-calendar">
                <DayPicker
                  mode="range"
                  numberOfMonths={months}
                  selected={range}
                  onSelect={(selectedRange) => {
                    if (selectedRange?.from && selectedRange?.to && isBefore(selectedRange.to, selectedRange.from)) {
                      setRange({ from: selectedRange.to, to: selectedRange.from });
                    } else {
                      setRange(selectedRange);
                    }
                  }}
                  fromDate={today}
                  disabled={disabledDates}
                  showOutsideDays
                  fixedWeeks
                  captionLayout="dropdown"
                  pagedNavigation
                />
              </div>

              <div className="calendar-foot">
                <div className="legend">
                  <span><span className="dot dot--selected" /> Selected</span>
                  <span><span className="dot dot--unavailable" /> Unavailable</span>
                  <span><span className="dot dot--available" /> Available</span>
                </div>
                <p>Stay {MIN_NIGHTS}+ nights to unlock return transfers and a floating breakfast experience.</p>
              </div>

              <div className="card-actions">
                <button type="button" className="btn primary" onClick={handleSearch}>
                  Review pricing
                </button>
              </div>
            </article>

            <article className="card" aria-labelledby="guests-heading">
              <header className="card-header">
                <div>
                  <span className="card-step">Step 2</span>
                  <h3 id="guests-heading">Guest details</h3>
                </div>
              </header>

              <div className="guest-grid">
                <label className="field">
                  <span className="field__label">Adults</span>
                  <select value={adults} onChange={(event) => setAdults(Number(event.target.value))}>
                    {options(1, 12).map((value) => (
                      <option key={`adult-${value}`} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Children (3–12)</span>
                  <select value={childrenOver2} onChange={(event) => setChildrenOver2(Number(event.target.value))}>
                    {options(0, 12).map((value) => (
                      <option key={`child-${value}`} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Infants (0–2)</span>
                  <select value={infants02} onChange={(event) => setInfants02(Number(event.target.value))}>
                    {options(0, 6).map((value) => (
                      <option key={`infant-${value}`} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="field-hint">{villaInfo.name} sleeps {villaInfo.sleeps}. Additional guests incur € {EXTRA_GUEST_FEE_EUR} per person per night.</p>

              {showValidation && overCapacity && (
                <div className="inline-warning" role="alert">
                  {villaInfo.name} sleeps {villaInfo.sleeps}. Reduce adult or child guests to proceed.
                </div>
              )}
            </article>

            <article className="card" aria-labelledby="enhancements-heading">
              <header className="card-header">
                <div>
                  <span className="card-step">Step 3</span>
                  <h3 id="enhancements-heading">Enhancements</h3>
                </div>
              </header>

              <label className="toggle">
                <input type="checkbox" checked={chef} onChange={(event) => setChef(event.target.checked)} />
                <span className="toggle__control" />
                <div>
                  <strong>Private chef (dinner)</strong>
                  <span>€ {CHEF_DINNER_PER_NIGHT} per night</span>
                </div>
              </label>

              <div className="enhancement-grid">
                <label className="field">
                  <span className="field__label">Quad bike (hours)</span>
                  <select value={quadHours} onChange={(event) => setQuadHours(Number(event.target.value))}>
                    {options(0, 12).map((value) => (
                      <option key={`quad-${value}`} value={value}>{value}</option>
                    ))}
                  </select>
                  <span className="field-hint">€ {QUAD_PER_HOUR} per hour</span>
                </label>
                <label className="field">
                  <span className="field__label">Airport transfer (ways)</span>
                  <select
                    value={transferWays}
                    onChange={(event) => setTransferWays(Number(event.target.value))}
                    disabled={transferIncluded}
                  >
                    {[0, 1, 2].map((value) => (
                      <option key={`transfer-${value}`} value={value}>{value}</option>
                    ))}
                  </select>
                  <span className="field-hint">{transferIncluded ? "Included for 7+ nights" : `€ ${TRANSFER_PER_WAY} per way`}</span>
                </label>
              </div>
            </article>

            <article className="card" aria-labelledby="requests-heading">
              <header className="card-header">
                <div>
                  <span className="card-step">Step 4</span>
                  <h3 id="requests-heading">Special requests</h3>
                </div>
              </header>

              <label className="field textarea-field">
                <span className="field__label">Let us know anything else</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Airport transfer timing, chef preferences, dietary needs, nanny…"
                  rows={4}
                />
              </label>
            </article>
          </section>
        </section>
      </main>

      <div className="mobile-bar" role="region" aria-label="Quick booking actions">
        <div>
          <strong>{euro(total)}</strong>
          <span>{nights ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Select dates"} · {guestSummary}</span>
        </div>
        <div className="mobile-bar__actions">
          <button type="button" className="btn primary" onClick={handleWhatsApp} disabled={!canSubmit}>WhatsApp</button>
          <button type="button" className="btn ghost" onClick={handleEmail} disabled={!canSubmit}>Email</button>
        </div>
      </div>
    </>
  );
}
