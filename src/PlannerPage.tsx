import React, { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav";
import { useLanguage } from "./i18n/LanguageContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

type Villa = { id: string; name: string; dailyFee: number; occupancy: number; costPct: number };
type Scenario = "pessimistic" | "base" | "optimistic";
type Currency = "EUR" | "USD" | "GBP";

const SCN_LABEL_KEYS: Record<Scenario, string> = { pessimistic: "planner.pessimistic", base: "planner.base", optimistic: "planner.optimistic" };
const SCN_COLORS: Record<Scenario, string> = { pessimistic: "#C9B99A", base: "#C3A564", optimistic: "#6ECFA0" };

export default function PlannerPage({ embedded = false }: { embedded?: boolean }) {
  const [villas, setVillas] = useState<Villa[]>([
    { id: crypto.randomUUID(), name: "ALYA",  dailyFee: 750, occupancy: 0.60, costPct: 0.35 },
    { id: crypto.randomUUID(), name: "ZEHRA", dailyFee: 750, occupancy: 0.60, costPct: 0.35 },
  ]);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [activeScn, setActiveScn] = useState<Scenario>("base");
  const [heroVis, setHeroVis] = useState(false);
  const { t } = useLanguage();

  const sym: Record<Currency, string> = { EUR: "€", USD: "$", GBP: "£" };
  const [rates, setRates] = useState<Record<Currency, number>>({ EUR: 1, USD: 1.08, GBP: 0.86 });

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 100); return () => clearTimeout(t); }, []);
  useEffect(() => {
    fetch("https://api.exchangerate.host/latest?base=EUR&symbols=USD,GBP")
      .then(r => r.json())
      .then(d => d?.rates && setRates(p => ({ ...p, USD: d.rates.USD ?? p.USD, GBP: d.rates.GBP ?? p.GBP })))
      .catch(() => {});
  }, []);

  const fx = (n: number) => n * (rates[currency] ?? 1);
  const fmt0 = (n: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n);
  const fmt2 = (n: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(n);
  const fmtC = (n: number) => `${sym[currency]}\u00A0${fmt0(fx(n))}`;
  const fmtC2 = (n: number) => `${sym[currency]}\u00A0${fmt2(fx(n))}`;

  const rows = useMemo(() => villas.map(v => {
    const ebitda = v.dailyFee * 365 * v.occupancy;
    const net = ebitda * (1 - v.costPct);
    return { ...v, ebitda, net };
  }), [villas]);

  const totals = useMemo(() => ({
    ebitda: rows.reduce((a, r) => a + r.ebitda, 0),
    net: rows.reduce((a, r) => a + r.net, 0),
  }), [rows]);

  function update(id: string, p: Partial<Villa>) { setVillas(prev => prev.map(v => v.id === id ? { ...v, ...p } : v)); }
  function addVilla() { setVillas(p => [...p, { id: crypto.randomUUID(), name: `Villa ${p.length + 1}`, dailyFee: 600, occupancy: 0.6, costPct: 0.35 }]); }
  function removeVilla(id: string) { setVillas(p => p.filter(v => v.id !== id)); }

  function applyScenario(s: Scenario) {
    setActiveScn(s);
    const fees: Record<Scenario, [number, number]> = { pessimistic: [500, 500], base: [750, 750], optimistic: [1000, 1000] };
    const cost: Record<Scenario, number> = { pessimistic: 0.38, base: 0.35, optimistic: 0.32 };
    setVillas(prev => prev.map((v, i) => ({
      ...v, name: i === 0 ? "ALYA" : i === 1 ? "ZEHRA" : v.name,
      dailyFee: fees[s][i] ?? v.dailyFee, occupancy: 0.60, costPct: cost[s],
    })));
  }

  const eff = (y: number) => Math.max(0, y - 2);

  function scnNet(s: Scenario) {
    const feeMap = { pessimistic: [500, 500], base: [750, 750], optimistic: [1000, 1000] } as const;
    const costMap = { pessimistic: 0.38, base: 0.35, optimistic: 0.32 } as const;
    let tot = 0;
    villas.forEach((_, i) => { const d = feeMap[s][i] ?? feeMap[s][0]; tot += d * 365 * 0.6 * (1 - costMap[s]); });
    return tot;
  }

  // Year-by-year data for smooth area chart (years 1-15)
  const chartData = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => {
      const y = i + 1;
      return {
        year: y,
        pessimistic: fx(scnNet("pessimistic") * eff(y)),
        base: fx(scnNet("base") * eff(y)),
        optimistic: fx(scnNet("optimistic") * eff(y)),
      };
    }), [villas, currency, rates]
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="pl-tooltip">
        <div className="pl-tooltip__label">{t("planner.year", { n: label })}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="pl-tooltip__row">
            <span className="pl-tooltip__dot" style={{ background: p.color }} />
            <span>{t(SCN_LABEL_KEYS[p.dataKey as Scenario])}</span>
            <strong>{sym[currency]}&nbsp;{fmt0(p.value)}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* ═══ HERO (hidden when embedded in investor page) ═══ */}
      {!embedded && (
        <header className={`pl-hero ${heroVis ? "pl-hero--vis" : ""}`}>
          <div className="pl-hero__bg" aria-hidden="true" />
          <div className="pl-hero__ov" aria-hidden="true" />
          <TopNav />
          <div className="pl-hero__ct">
            <span className="pl-hero__badge">{t("planner.heroBadge")}</span>
            <h1 className="pl-hero__title">{t("planner.heroTitle")}</h1>
            <div className="pl-hero__line" />
            <p className="pl-hero__sub">{t("planner.heroSub")}</p>
          </div>
        </header>
      )}

      <main className="pl">
        {/* ═══ KPI CARDS ═══ */}
        <section className="pl-kpis">
          <div className="pl-kpi">
            <span className="pl-kpi__label">{t("planner.kpiEbitda")}</span>
            <span className="pl-kpi__value">{fmtC(totals.ebitda)}</span>
          </div>
          <div className="pl-kpi">
            <span className="pl-kpi__label">{t("planner.kpiNet")}</span>
            <span className="pl-kpi__value">{fmtC(totals.net)}</span>
          </div>
          <div className="pl-kpi">
            <span className="pl-kpi__label">{t("planner.kpi5y")}</span>
            <span className="pl-kpi__value">{fmtC(totals.net * eff(5))}</span>
          </div>
          <div className="pl-kpi pl-kpi--accent">
            <span className="pl-kpi__label">{t("planner.kpi15y")}</span>
            <span className="pl-kpi__value">{fmtC(totals.net * eff(15))}</span>
          </div>
        </section>

        {/* ═══ CONTROLS ═══ */}
        <section className="pl-controls">
          <div className="pl-controls__left">
            <div className="pl-scenarios">
              {(["pessimistic", "base", "optimistic"] as Scenario[]).map(s => (
                <button
                  key={s}
                  className={`pl-scn ${activeScn === s ? "pl-scn--active" : ""}`}
                  style={{ "--scn-color": SCN_COLORS[s] } as React.CSSProperties}
                  onClick={() => applyScenario(s)}
                >
                  <span className="pl-scn__dot" />
                  {t(SCN_LABEL_KEYS[s])}
                </button>
              ))}
            </div>
            <select className="pl-currency" value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>
          <button className="pl-add" onClick={addVilla}>{t("planner.addVilla")}</button>
        </section>

        {/* ═══ CHART ═══ */}
        <section className="pl-chart-wrap">
          <h2 className="pl-section-title">{t("planner.chartTitle")}</h2>
          <p className="pl-section-desc">{t("planner.chartDesc")}</p>
          <div className="pl-chart">
            <ResponsiveContainer width="100%" height={420}>
              <AreaChart data={chartData} margin={{ top: 12, right: 20, left: 10, bottom: 8 }}>
                <defs>
                  <linearGradient id="gPess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SCN_COLORS.pessimistic} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={SCN_COLORS.pessimistic} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SCN_COLORS.base} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={SCN_COLORS.base} stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="gOpt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SCN_COLORS.optimistic} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={SCN_COLORS.optimistic} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(195,165,100,.08)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="year" tickFormatter={y => `${y}Y`} tick={{ fill: "rgba(235,232,225,.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${sym[currency]} ${fmt0(v)}`} tick={{ fill: "rgba(235,232,225,.35)", fontSize: 11 }} width={95} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="pessimistic" stroke={SCN_COLORS.pessimistic} strokeWidth={2} fill="url(#gPess)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#0E1A16" }} />
                <Area type="monotone" dataKey="base" stroke={SCN_COLORS.base} strokeWidth={2.5} fill="url(#gBase)" dot={false} activeDot={{ r: 6, strokeWidth: 2, stroke: "#0E1A16" }} />
                <Area type="monotone" dataKey="optimistic" stroke={SCN_COLORS.optimistic} strokeWidth={2} fill="url(#gOpt)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#0E1A16" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="pl-chart__legend">
            {(["pessimistic", "base", "optimistic"] as Scenario[]).map(s => (
              <span key={s}><span className="pl-chart__ldot" style={{ background: SCN_COLORS[s] }} />{t(SCN_LABEL_KEYS[s])}</span>
            ))}
          </div>
        </section>

        {/* ═══ TABLE ═══ */}
        <section className="pl-table-wrap">
          <h2 className="pl-section-title">{t("planner.tableTitle")}</h2>
          <div className="pl-table-scroll">
            <table className="pl-table">
              <thead>
                <tr>
                  <th>{t("planner.thVilla")}</th>
                  <th>{t("planner.thRate")}</th>
                  <th>{t("planner.thOcc")}</th>
                  <th>{t("planner.thCost")}</th>
                  <th>{t("planner.thEbitda")}</th>
                  <th>{t("planner.thNet")}</th>
                  <th>{t("planner.th5y")}</th>
                  <th>{t("planner.th10y")}</th>
                  <th>{t("planner.th15y")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td><input className="pl-input pl-input--name" value={r.name} onChange={e => update(r.id, { name: e.target.value })} /></td>
                    <td>
                      <div className="pl-input-group">
                        <span>€</span>
                        <input className="pl-input" type="number" value={r.dailyFee} onChange={e => update(r.id, { dailyFee: Number(e.target.value || 0) })} />
                      </div>
                    </td>
                    <td>
                      <div className="pl-input-group">
                        <input className="pl-input pl-input--sm" type="number" min={0} max={100} value={Math.round(r.occupancy * 100)} onChange={e => update(r.id, { occupancy: Math.min(100, Math.max(0, +e.target.value)) / 100 })} />
                        <span>%</span>
                      </div>
                    </td>
                    <td>
                      <div className="pl-input-group">
                        <input className="pl-input pl-input--sm" type="number" min={0} max={100} value={Math.round(r.costPct * 100)} onChange={e => update(r.id, { costPct: Math.min(100, Math.max(0, +e.target.value)) / 100 })} />
                        <span>%</span>
                      </div>
                    </td>
                    <td className="pl-td--num">{fmtC2(r.ebitda)}</td>
                    <td className="pl-td--num">{fmtC2(r.net)}</td>
                    <td className="pl-td--num">{fmtC2(r.net * eff(5))}</td>
                    <td className="pl-td--num">{fmtC2(r.net * eff(10))}</td>
                    <td className="pl-td--num">{fmtC2(r.net * eff(15))}</td>
                    <td><button className="pl-del" onClick={() => removeVilla(r.id)}>&#10005;</button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>{t("planner.total")}</strong></td><td></td><td></td><td></td>
                  <td className="pl-td--num"><strong>{fmtC2(totals.ebitda)}</strong></td>
                  <td className="pl-td--num"><strong>{fmtC2(totals.net)}</strong></td>
                  <td className="pl-td--num"><strong>{fmtC2(totals.net * eff(5))}</strong></td>
                  <td className="pl-td--num"><strong>{fmtC2(totals.net * eff(10))}</strong></td>
                  <td className="pl-td--num"><strong>{fmtC2(totals.net * eff(15))}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ═══ DETAILED SCENARIO BREAKDOWN ═══ */}
        <section className="pl-detail">
          <h2 className="pl-section-title">{t("planner.scnTitle")}</h2>
          <p className="pl-section-desc">{t("planner.scnDesc")}</p>

          <div className="pl-detail__grid">
            {/* ── LAUNCH ── */}
            <div className="pl-detail__card">
              <h3 className="pl-detail__h" style={{borderColor: SCN_COLORS.pessimistic}}>{t("planner.scnLaunch")}</h3>
              <table className="pl-detail__table">
                <tbody>
                  <tr><td>{t("planner.accommodation")}</td><td className="pl-td--num">&euro; 219,000</td></tr>
                  <tr><td>{t("planner.cleaningExtras")}</td><td className="pl-td--num">&euro; 32,450</td></tr>
                  <tr><td><strong>{t("planner.grossRevenue")}</strong></td><td className="pl-td--num"><strong>&euro; 251,450</strong></td></tr>
                  <tr><td colSpan={2} style={{height:8}}></td></tr>
                  <tr><td>{t("planner.personnel1")}</td><td className="pl-td--num">&euro; 30,000</td></tr>
                  <tr><td>{t("planner.utilities")}</td><td className="pl-td--num">&euro; 29,000</td></tr>
                  <tr><td>{t("planner.marketingPlatform")}</td><td className="pl-td--num">&euro; 24,710</td></tr>
                  <tr><td>{t("planner.cleaningAccounting")}</td><td className="pl-td--num">&euro; 12,000</td></tr>
                  <tr><td><strong>{t("planner.totalOpex")}</strong></td><td className="pl-td--num"><strong>&euro; 95,710</strong></td></tr>
                  <tr><td colSpan={2} style={{height:8}}></td></tr>
                  <tr><td><strong>EBITDA</strong></td><td className="pl-td--num"><strong>&euro; 155,740</strong></td></tr>
                  <tr><td>{t("planner.depreciationTax")}</td><td className="pl-td--num">&euro; (61,060)</td></tr>
                  <tr style={{background:'rgba(45,80,64,0.06)'}}><td><strong>{t("planner.netProfitAnnual")}</strong></td><td className="pl-td--num"><strong>&euro; 94,680</strong></td></tr>
                </tbody>
              </table>
            </div>

            {/* ── GROWTH ── */}
            <div className="pl-detail__card">
              <h3 className="pl-detail__h" style={{borderColor: SCN_COLORS.base}}>{t("planner.scnGrowth")}</h3>
              <table className="pl-detail__table">
                <tbody>
                  <tr><td>{t("planner.accommodation")}</td><td className="pl-td--num">&euro; 328,500</td></tr>
                  <tr><td>{t("planner.cleaningService")}</td><td className="pl-td--num">&euro; 32,925</td></tr>
                  <tr><td>{t("planner.chefExperiences")}</td><td className="pl-td--num">&euro; 49,310</td></tr>
                  <tr><td><strong>{t("planner.grossRevenue")}</strong></td><td className="pl-td--num"><strong>&euro; 410,735</strong></td></tr>
                  <tr><td colSpan={2} style={{height:8}}></td></tr>
                  <tr><td>{t("planner.personnel2")}</td><td className="pl-td--num">&euro; 45,000</td></tr>
                  <tr><td>{t("planner.utilities")}</td><td className="pl-td--num">&euro; 34,600</td></tr>
                  <tr><td>{t("planner.marketingPlatform")}</td><td className="pl-td--num">&euro; 34,638</td></tr>
                  <tr><td>{t("planner.operationsFarm")}</td><td className="pl-td--num">&euro; 40,390</td></tr>
                  <tr><td><strong>{t("planner.totalOpex")}</strong></td><td className="pl-td--num"><strong>&euro; 154,628</strong></td></tr>
                  <tr><td colSpan={2} style={{height:8}}></td></tr>
                  <tr><td><strong>EBITDA</strong></td><td className="pl-td--num"><strong>&euro; 256,107</strong></td></tr>
                  <tr><td>{t("planner.depreciationTax")}</td><td className="pl-td--num">&euro; (86,152)</td></tr>
                  <tr style={{background:'rgba(45,80,64,0.06)'}}><td><strong>{t("planner.netProfitAnnual")}</strong></td><td className="pl-td--num"><strong>&euro; 169,955</strong></td></tr>
                </tbody>
              </table>
            </div>

            {/* ── PREMIUM ── */}
            <div className="pl-detail__card">
              <h3 className="pl-detail__h" style={{borderColor: SCN_COLORS.optimistic}}>{t("planner.scnPremium")}</h3>
              <table className="pl-detail__table">
                <tbody>
                  <tr><td>{t("planner.accommodation")}</td><td className="pl-td--num">&euro; 438,000</td></tr>
                  <tr><td>{t("planner.cleaningService")}</td><td className="pl-td--num">&euro; 38,400</td></tr>
                  <tr><td>{t("planner.chefExperiences")}</td><td className="pl-td--num">&euro; 86,790</td></tr>
                  <tr><td>{t("planner.localProducts")}</td><td className="pl-td--num">&euro; 3,000</td></tr>
                  <tr><td><strong>{t("planner.grossRevenue")}</strong></td><td className="pl-td--num"><strong>&euro; 566,190</strong></td></tr>
                  <tr><td colSpan={2} style={{height:8}}></td></tr>
                  <tr><td>{t("planner.personnel4")}</td><td className="pl-td--num">&euro; 84,240</td></tr>
                  <tr><td>{t("planner.utilities")}</td><td className="pl-td--num">&euro; 45,000</td></tr>
                  <tr><td>{t("planner.marketingInfluencer")}</td><td className="pl-td--num">&euro; 51,280</td></tr>
                  <tr><td>{t("planner.operationsPremium")}</td><td className="pl-td--num">&euro; 64,229</td></tr>
                  <tr><td><strong>{t("planner.totalOpex")}</strong></td><td className="pl-td--num"><strong>&euro; 244,749</strong></td></tr>
                  <tr><td colSpan={2} style={{height:8}}></td></tr>
                  <tr><td><strong>EBITDA</strong></td><td className="pl-td--num"><strong>&euro; 321,441</strong></td></tr>
                  <tr><td>{t("planner.depreciationTax")}</td><td className="pl-td--num">&euro; (102,485)</td></tr>
                  <tr style={{background:'rgba(45,80,64,0.06)'}}><td><strong>{t("planner.netProfitAnnual")}</strong></td><td className="pl-td--num"><strong>&euro; 218,956</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══ COMPARISON & ROI ═══ */}
        <section className="pl-table-wrap">
          <h2 className="pl-section-title">{t("planner.roiTitle")}</h2>
          <p className="pl-section-desc">{t("planner.roiDesc")}</p>
          <div className="pl-table-scroll">
            <table className="pl-table">
              <thead>
                <tr>
                  <th></th>
                  <th>{t("planner.roiLaunch")}</th>
                  <th>{t("planner.roiGrowth")}</th>
                  <th>{t("planner.roiPremium")}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>{t("planner.perVillaNight")}</td><td className="pl-td--num">&euro;500</td><td className="pl-td--num">&euro;750</td><td className="pl-td--num">&euro;1,000</td></tr>
                <tr><td>{t("planner.combinedNight")}</td><td className="pl-td--num">&euro;1,000</td><td className="pl-td--num">&euro;1,500</td><td className="pl-td--num">&euro;2,000</td></tr>
                <tr><td>{t("planner.personnel")}</td><td className="pl-td--num">1-2</td><td className="pl-td--num">2</td><td className="pl-td--num">4</td></tr>
                <tr><td>{t("planner.grossRevenueShort")}</td><td className="pl-td--num">&euro;251K</td><td className="pl-td--num">&euro;411K</td><td className="pl-td--num">&euro;566K</td></tr>
                <tr><td>{t("planner.netProfitRow")}</td><td className="pl-td--num">&euro;95K</td><td className="pl-td--num">&euro;170K</td><td className="pl-td--num">&euro;219K</td></tr>
                <tr><td>{t("planner.netMargin")}</td><td className="pl-td--num">37.6%</td><td className="pl-td--num">41.4%</td><td className="pl-td--num">38.7%</td></tr>
                <tr style={{background:'rgba(195,165,100,0.06)'}}><td>{t("planner.year12")}</td><td className="pl-td--num">&euro;0</td><td className="pl-td--num">&euro;0</td><td className="pl-td--num">&euro;0</td></tr>
                <tr><td>{t("planner.cumulative5y")}</td><td className="pl-td--num">&euro;284K</td><td className="pl-td--num">&euro;510K</td><td className="pl-td--num">&euro;657K</td></tr>
                <tr><td>{t("planner.cumulative10y")}</td><td className="pl-td--num">&euro;757K</td><td className="pl-td--num">&euro;1.36M</td><td className="pl-td--num">&euro;1.75M</td></tr>
                <tr><td>{t("planner.cumulative15y")}</td><td className="pl-td--num">&euro;1.23M</td><td className="pl-td--num">&euro;2.21M</td><td className="pl-td--num">&euro;2.85M</td></tr>
                <tr style={{background:'rgba(45,80,64,0.08)'}}><td><strong>{t("planner.payback")}</strong></td><td className="pl-td--num"><strong>{t("planner.payback1")}</strong></td><td className="pl-td--num"><strong>{t("planner.payback2")}</strong></td><td className="pl-td--num"><strong>{t("planner.payback3")}</strong></td></tr>
                <tr><td>{t("planner.breakeven")}</td><td className="pl-td--num">17.0%</td><td className="pl-td--num">14.1%</td><td className="pl-td--num">18.8%</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══ GROWTH STRATEGY ═══ */}
        <section className="pl-table-wrap">
          <h2 className="pl-section-title">{t("planner.gsTitle")}</h2>
          <p className="pl-section-desc">{t("planner.gsDesc")}</p>
          <div className="pl-table-scroll">
            <table className="pl-table">
              <thead><tr><th>{t("planner.gsPeriod")}</th><th>{t("planner.gsPricing")}</th><th>{t("planner.gsTeam")}</th><th>{t("planner.gsGoal")}</th></tr></thead>
              <tbody>
                <tr><td>{t("planner.gsP1")}</td><td>{t("planner.gsPr1")}</td><td>{t("planner.gsT1")}</td><td>{t("planner.gsG1")}</td></tr>
                <tr><td>{t("planner.gsP2")}</td><td>{t("planner.gsPr2")}</td><td>{t("planner.gsT2")}</td><td>{t("planner.gsG2")}</td></tr>
                <tr><td>{t("planner.gsP3")}</td><td>{t("planner.gsPr3")}</td><td>{t("planner.gsT3")}</td><td>{t("planner.gsG3")}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pl-foot">
          <p>{t("planner.foot1")}</p>
          <p>{t("planner.foot2")}</p>
        </footer>
      </main>
    </>
  );
}
