import TopNav from "./components/TopNav";
import React, { useEffect, useMemo, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { differenceInCalendarDays, format, isBefore, startOfToday } from "date-fns";
import "react-day-picker/dist/style.css";

/* ── constants ── */
type VillaKey = "ALYA" | "ZEHRA";

const VILLAS: Record<VillaKey, { name: string; nightlyEUR: number; sleeps: number; tagline: string; img: string }> = {
  ALYA:  { name: "ALYA",  nightlyEUR: 700, sleeps: 8, tagline: "Panoramic sea views, master suite with private terrace", img: "/media/dis-mekan/kus-bakisi-gunduz-ai-render.jpg" },
  ZEHRA: { name: "ZEHRA", nightlyEUR: 550, sleeps: 6, tagline: "Intimate retreat nestled among ancient olive groves",    img: "/media/dis-mekan/havuz-deniz-manzarasi-konsept.jpg" },
};
const VILLA_KEYS: VillaKey[] = ["ALYA", "ZEHRA"];

const BOOKED: Record<VillaKey, { from: Date; to: Date }[]> = {
  ALYA: [
    { from: new Date(new Date().getFullYear(), 6, 12), to: new Date(new Date().getFullYear(), 6, 18) },
    { from: new Date(new Date().getFullYear(), 7, 3),  to: new Date(new Date().getFullYear(), 7, 7) },
  ],
  ZEHRA: [{ from: new Date(new Date().getFullYear(), 7, 14), to: new Date(new Date().getFullYear(), 7, 21) }],
};

const CLEANING_FEE = 150;
const SERVICE_FEE_PCT = 0.05;
const EXTRA_GUEST_FEE_EUR = 100;
const INCLUDED_GUESTS = 2;
const CHEF_DINNER_PER_NIGHT = 200;
const QUAD_PER_HOUR = 50;
const TRANSFER_PER_WAY = 100;
const TRANSFER_INCLUDED_NIGHTS = 7;
const MIN_NIGHTS = 3;
const DEPOSIT = 500;

const CONTACT = {
  whatsappNumber: "905370123285",
  whatsappDisplay: "+90 537 012 32 85",
  email: "reservations@nest-ulasli.com",
} as const;

/* ── helpers ── */
function nightsOf(r: DateRange | undefined) {
  if (!r?.from || !r.to) return 0;
  return Math.max(0, differenceInCalendarDays(r.to, r.from));
}
const euro = (v: number) => `€\u00A0${v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const euro0 = (v: number) => `€\u00A0${v.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`;
const opt = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/* ══════════════════════════════════════════════ */
export default function BookingPage() {
  const [villa, setVilla] = useState<VillaKey>("ALYA");
  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [note, setNote] = useState("");
  const [showVal, setShowVal] = useState(false);
  const [heroVis, setHeroVis] = useState(false);
  const [chef, setChef] = useState(false);
  const [quadH, setQuadH] = useState(0);
  const [transfers, setTransfers] = useState(0);
  const [calMonths, setCalMonths] = useState(1);

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 100); return () => clearTimeout(t); }, []);

  const nights = nightsOf(range);
  const vi = VILLAS[villa];
  const party = adults + children;
  const overCap = party > vi.sleeps;
  const underMin = nights > 0 && nights < MIN_NIGHTS;

  const extraG = Math.max(0, party - INCLUDED_GUESTS);
  const base = nights * vi.nightlyEUR;
  const extraFee = nights > 0 ? nights * EXTRA_GUEST_FEE_EUR * extraG : 0;
  const chefTot = chef && nights > 0 ? nights * CHEF_DINNER_PER_NIGHT : 0;
  const quadTot = quadH * QUAD_PER_HOUR;
  const xferInc = nights >= TRANSFER_INCLUDED_NIGHTS;
  const xferTot = xferInc ? 0 : transfers * TRANSFER_PER_WAY;
  const clean = nights > 0 ? CLEANING_FEE : 0;
  const sub = base + extraFee + chefTot + quadTot + xferTot + clean;
  const svc = sub * SERVICE_FEE_PCT;
  const total = sub + svc;

  const today = startOfToday();
  const disabled = [{ before: today }, ...BOOKED[villa]];
  const ok = nights >= MIN_NIGHTS && !overCap;

  const waText = encodeURIComponent([
    "Hello NEST ULASLI, I'd like to book a stay.",
    `Villa: ${vi.name}`,
    range?.from ? `Check-in: ${format(range.from, "dd MMM yyyy")}` : "Check-in: –",
    range?.to   ? `Check-out: ${format(range.to,  "dd MMM yyyy")}` : "Check-out: –",
    `Nights: ${nights}`, `Guests: ${adults} adults, ${children} children, ${infants} infants`,
    `Extras: Chef=${chef?"Yes":"No"}, Quad=${quadH}h, Transfers=${xferInc?"Included":`${transfers} way(s)`}`,
    `Estimate: ${euro(total)} (excl. deposit €${DEPOSIT})`,
    note ? `Note: ${note}` : "",
  ].filter(Boolean).join("\n"));
  const waUrl = `https://wa.me/${CONTACT.whatsappNumber}?text=${waText}`;
  const mailUrl = `mailto:${CONTACT.email}?subject=Booking – ${vi.name}&body=${waText}`;

  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  const send = (type: "wa" | "mail") => {
    if (!ok) { setShowVal(true); scroll("bk-cal"); return; }
    if (type === "wa") window.open(waUrl, "_blank", "noopener,noreferrer");
    else window.location.href = mailUrl;
  };

  useEffect(() => {
    const up = () => setCalMonths(window.innerWidth >= 1440 ? 3 : window.innerWidth >= 1024 ? 2 : 1);
    up(); window.addEventListener("resize", up); return () => window.removeEventListener("resize", up);
  }, []);
  useEffect(() => { if (xferInc) setTransfers(0); }, [nights]);
  useEffect(() => { if (ok && showVal) setShowVal(false); }, [ok, showVal]);

  const rangeOk = Boolean(range?.from && range?.to);
  const checkIn  = range?.from ? format(range.from, "EEE, dd MMM") : "Select";
  const checkOut = range?.to   ? format(range.to,   "EEE, dd MMM") : "Select";

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header className={`bk-hero ${heroVis ? "bk-hero--vis" : ""}`}>
        <div className="bk-hero__bg" aria-hidden="true" />
        <div className="bk-hero__ov" aria-hidden="true" />
        <TopNav />
        <div className="bk-hero__ct">
          <span className="bk-hero__badge">Private Villa Concierge</span>
          <h1 className="bk-hero__title">Book Your Stay</h1>
          <div className="bk-hero__line" />
          <p className="bk-hero__sub">Choose your villa, pick your dates and let us craft the perfect escape.</p>
        </div>
      </header>

      <main className="bk">
        {/* ═══ 1 · VILLA SELECTION ═══ */}
        <section className="bk__section">
          <div className="bk__section-head">
            <span className="bk__step">01</span>
            <div>
              <h2 className="bk__section-title">Choose Your Villa</h2>
              <p className="bk__section-desc">Each villa is a private estate with its own pool, garden and dedicated concierge.</p>
            </div>
          </div>

          <div className="bk-villas">
            {VILLA_KEYS.map((k) => {
              const v = VILLAS[k];
              const active = villa === k;
              return (
                <button
                  key={k}
                  className={`bk-villa ${active ? "bk-villa--active" : ""}`}
                  onClick={() => { setVilla(k); setRange(undefined); setShowVal(false); }}
                >
                  <img className="bk-villa__img" src={v.img} alt={v.name} loading="lazy" />
                  <div className="bk-villa__info">
                    <h3 className="bk-villa__name">{v.name}</h3>
                    <p className="bk-villa__tag">{v.tagline}</p>
                    <div className="bk-villa__meta">
                      <span>{euro0(v.nightlyEUR)} / night</span>
                      <span>Sleeps {v.sleeps}</span>
                    </div>
                  </div>
                  {active && <span className="bk-villa__check">&#10003;</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* ═══ 2 · DATES ═══ */}
        <section className="bk__section">
          <div className="bk__section-head">
            <span className="bk__step">02</span>
            <div>
              <h2 className="bk__section-title">Select Your Dates</h2>
              <p className="bk__section-desc">Minimum stay {MIN_NIGHTS} nights. Longer stays unlock complimentary experiences.</p>
            </div>
            {rangeOk && (
              <button className="bk__reset" onClick={() => { setRange(undefined); setShowVal(false); }}>
                Reset
              </button>
            )}
          </div>

          {/* Date summary pills */}
          <div className="bk-dates">
            <button className="bk-date" onClick={() => scroll("bk-cal")}>
              <span className="bk-date__label">Check-in</span>
              <span className="bk-date__value">{checkIn}</span>
            </button>
            <div className="bk-dates__arrow">&#8594;</div>
            <button className="bk-date" onClick={() => scroll("bk-cal")}>
              <span className="bk-date__label">Check-out</span>
              <span className="bk-date__value">{checkOut}</span>
            </button>
            <div className="bk-date bk-date--accent">
              <span className="bk-date__label">Duration</span>
              <span className="bk-date__value">{nights ? `${nights} night${nights > 1 ? "s" : ""}` : `${MIN_NIGHTS}+ nights`}</span>
            </div>
          </div>

          {showVal && !ok && (!range?.from || !range?.to) && (
            <div className="bk-warn" role="alert">Please select check-in and check-out dates.</div>
          )}
          {showVal && !ok && rangeOk && underMin && (
            <div className="bk-warn" role="alert">Minimum stay is {MIN_NIGHTS} nights.</div>
          )}

          <div className="bk-cal" id="bk-cal">
            <DayPicker
              mode="range"
              numberOfMonths={calMonths}
              selected={range}
              onSelect={(sr) => {
                if (sr?.from && sr?.to && isBefore(sr.to, sr.from)) setRange({ from: sr.to, to: sr.from });
                else setRange(sr);
              }}
              fromDate={today}
              disabled={disabled}
              showOutsideDays={false}
              fixedWeeks={false}
              captionLayout="dropdown"
              pagedNavigation
            />
          </div>

          <div className="bk-cal__foot">
            <span className="bk-dot bk-dot--brand" /> Selected
            <span className="bk-dot bk-dot--muted" /> Unavailable
            <span className="bk-dot bk-dot--open" /> Available
          </div>
        </section>

        {/* ═══ 3 · GUESTS ═══ */}
        <section className="bk__section">
          <div className="bk__section-head">
            <span className="bk__step">03</span>
            <div>
              <h2 className="bk__section-title">Who's Staying</h2>
              <p className="bk__section-desc">{vi.name} sleeps up to {vi.sleeps} guests. Additional guests incur {euro0(EXTRA_GUEST_FEE_EUR)}/person/night.</p>
            </div>
          </div>

          <div className="bk-guests">
            <label className="bk-counter">
              <span className="bk-counter__label">Adults</span>
              <select value={adults} onChange={(e) => setAdults(+e.target.value)}>
                {opt(1, 12).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="bk-counter">
              <span className="bk-counter__label">Children <small>3–12</small></span>
              <select value={children} onChange={(e) => setChildren(+e.target.value)}>
                {opt(0, 12).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="bk-counter">
              <span className="bk-counter__label">Infants <small>0–2</small></span>
              <select value={infants} onChange={(e) => setInfants(+e.target.value)}>
                {opt(0, 6).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>

          {showVal && overCap && (
            <div className="bk-warn" role="alert">{vi.name} sleeps {vi.sleeps}. Please reduce guest count.</div>
          )}
        </section>

        {/* ═══ 4 · ENHANCEMENTS ═══ */}
        <section className="bk__section">
          <div className="bk__section-head">
            <span className="bk__step">04</span>
            <div>
              <h2 className="bk__section-title">Curate Your Experience</h2>
              <p className="bk__section-desc">Enhance your stay with bespoke services — all arranged by our concierge.</p>
            </div>
          </div>

          <div className="bk-enhancements">
            <label className={`bk-enh ${chef ? "bk-enh--on" : ""}`}>
              <div className="bk-enh__top">
                <div>
                  <strong>Private Chef</strong>
                  <span>Dinner prepared in your villa</span>
                </div>
                <span className="bk-enh__price">{euro0(CHEF_DINNER_PER_NIGHT)}/night</span>
              </div>
              <div className="bk-enh__toggle">
                <input type="checkbox" checked={chef} onChange={(e) => setChef(e.target.checked)} />
                <span className="bk-enh__switch" />
              </div>
            </label>

            <div className="bk-enh bk-enh--select">
              <div className="bk-enh__top">
                <div>
                  <strong>Quad Bike</strong>
                  <span>Explore coastal trails</span>
                </div>
                <span className="bk-enh__price">{euro0(QUAD_PER_HOUR)}/hour</span>
              </div>
              <select value={quadH} onChange={(e) => setQuadH(+e.target.value)}>
                {opt(0, 12).map((n) => <option key={n} value={n}>{n === 0 ? "Not needed" : `${n} hour${n > 1 ? "s" : ""}`}</option>)}
              </select>
            </div>

            <div className={`bk-enh bk-enh--select ${xferInc ? "bk-enh--inc" : ""}`}>
              <div className="bk-enh__top">
                <div>
                  <strong>Airport Transfer</strong>
                  <span>{xferInc ? "Complimentary with 7+ nights" : "Private car to/from airport"}</span>
                </div>
                <span className="bk-enh__price">{xferInc ? "Included" : `${euro0(TRANSFER_PER_WAY)}/way`}</span>
              </div>
              {!xferInc && (
                <select value={transfers} onChange={(e) => setTransfers(+e.target.value)}>
                  {[0, 1, 2].map((n) => <option key={n} value={n}>{n === 0 ? "Not needed" : `${n} way${n > 1 ? "s" : ""}`}</option>)}
                </select>
              )}
            </div>
          </div>
        </section>

        {/* ═══ 5 · SPECIAL REQUESTS ═══ */}
        <section className="bk__section">
          <div className="bk__section-head">
            <span className="bk__step">05</span>
            <div>
              <h2 className="bk__section-title">Special Requests</h2>
              <p className="bk__section-desc">Anything else we should know — dietary needs, celebration details, arrival time.</p>
            </div>
          </div>
          <textarea
            className="bk-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. We're celebrating a birthday, please arrange a cake. Arriving around 16:00…"
            rows={4}
          />
        </section>

        {/* ═══ SUMMARY & CTA ═══ */}
        <section className="bk-summary" id="bk-summary">
          <div className="bk-summary__inner">
            <div className="bk-summary__left">
              <span className="bk-summary__eyebrow">Your Estimate</span>
              <h2 className="bk-summary__total">{euro(total)}</h2>
              <p className="bk-summary__sub">
                {nights
                  ? `${nights} night${nights > 1 ? "s" : ""} in ${vi.name}`
                  : "Select dates to see pricing"}
                {nights > 0 && ` — excl. refundable deposit (${euro0(DEPOSIT)})`}
              </p>
            </div>

            <div className="bk-summary__breakdown">
              <div className="bk-summary__row">
                <span>Accommodation</span>
                <span>{nights ? `${nights} × ${euro0(vi.nightlyEUR)}` : "—"}</span>
                <strong>{nights ? euro(base) : "—"}</strong>
              </div>
              {extraFee > 0 && (
                <div className="bk-summary__row">
                  <span>Extra guests</span>
                  <span>{nights} × {euro0(EXTRA_GUEST_FEE_EUR)} × {extraG}</span>
                  <strong>{euro(extraFee)}</strong>
                </div>
              )}
              {chefTot > 0 && (
                <div className="bk-summary__row">
                  <span>Private chef</span>
                  <span>{nights} × {euro0(CHEF_DINNER_PER_NIGHT)}</span>
                  <strong>{euro(chefTot)}</strong>
                </div>
              )}
              {quadTot > 0 && (
                <div className="bk-summary__row">
                  <span>Quad bike</span>
                  <span>{quadH}h × {euro0(QUAD_PER_HOUR)}</span>
                  <strong>{euro(quadTot)}</strong>
                </div>
              )}
              {xferTot > 0 && (
                <div className="bk-summary__row">
                  <span>Airport transfer</span>
                  <span>{transfers} × {euro0(TRANSFER_PER_WAY)}</span>
                  <strong>{euro(xferTot)}</strong>
                </div>
              )}
              {clean > 0 && (
                <div className="bk-summary__row bk-summary__row--light">
                  <span>Cleaning fee</span><span></span><strong>{euro(clean)}</strong>
                </div>
              )}
              {svc > 0 && (
                <div className="bk-summary__row bk-summary__row--light">
                  <span>Service ({Math.round(SERVICE_FEE_PCT * 100)}%)</span><span></span><strong>{euro(svc)}</strong>
                </div>
              )}
            </div>

            {nights > 0 && (
              <div className="bk-summary__perks">
                <span>Daily breakfast</span>
                <span>Bicycles</span>
                <span>Table tennis</span>
                {xferInc && <span>Return transfers</span>}
                {xferInc && <span>Floating breakfast</span>}
              </div>
            )}

            {showVal && !ok && (
              <div className="bk-warn" role="status" style={{ marginTop: 12 }}>
                {!range?.from || !range?.to ? "Please select dates first." : underMin ? `Minimum ${MIN_NIGHTS} nights.` : `${vi.name} sleeps ${vi.sleeps}.`}
              </div>
            )}

            <div className="bk-summary__actions">
              <button className="bk-cta bk-cta--primary" onClick={() => send("wa")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Reserve via WhatsApp
              </button>
              <button className="bk-cta bk-cta--ghost" onClick={() => send("mail")}>
                Reserve via Email
              </button>
            </div>

            <p className="bk-summary__contact">
              Or call us directly: <strong>{CONTACT.whatsappDisplay}</strong> — everyday 09:00–22:00
            </p>
          </div>
        </section>
      </main>

      {/* ═══ MOBILE STICKY BAR ═══ */}
      <div className="bk-mobile-bar">
        <div>
          <strong className="bk-mobile-bar__total">{euro(total)}</strong>
          <span className="bk-mobile-bar__sub">{nights ? `${nights} night${nights > 1 ? "s" : ""}` : "Add dates"}</span>
        </div>
        <button className="bk-cta bk-cta--primary bk-cta--sm" onClick={() => send("wa")}>Reserve</button>
      </div>
    </>
  );
}
