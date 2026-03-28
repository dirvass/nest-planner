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
const SCN_COLORS: Record<Scenario, string> = { pessimistic: "#c0392b", base: "#2D5040", optimistic: "#1abc9c" };

export default function PlannerPage() {
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
      {/* ═══ HERO ═══ */}
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
                    <stop offset="0%" stopColor={SCN_COLORS.pessimistic} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={SCN_COLORS.pessimistic} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SCN_COLORS.base} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={SCN_COLORS.base} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gOpt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SCN_COLORS.optimistic} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={SCN_COLORS.optimistic} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,140,.15)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="year" tickFormatter={y => `${y}Y`} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${sym[currency]} ${fmt0(v)}`} tick={{ fill: "var(--muted)", fontSize: 12 }} width={95} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="pessimistic" stroke={SCN_COLORS.pessimistic} strokeWidth={2.5} fill="url(#gPess)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                <Area type="monotone" dataKey="base" stroke={SCN_COLORS.base} strokeWidth={3} fill="url(#gBase)" dot={false} activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }} />
                <Area type="monotone" dataKey="optimistic" stroke={SCN_COLORS.optimistic} strokeWidth={2.5} fill="url(#gOpt)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
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

        <footer className="pl-foot">
          <p>{t("planner.foot1")}</p>
          <p>{t("planner.foot2")}</p>
        </footer>
      </main>
    </>
  );
}
