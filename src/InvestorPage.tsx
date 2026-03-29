import React, { useState, useEffect } from "react";
import TopNav from "./components/TopNav";
import PlannerPage from "./PlannerPage";

type Tab = "financials" | "brand";

export default function InvestorPage() {
  const [tab, setTab] = useState<Tab>("financials");
  const [heroVis, setHeroVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 100); return () => clearTimeout(t); }, []);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header className={`inv-hero ${heroVis ? "inv-hero--vis" : ""}`}>
        <div className="inv-hero__bg" aria-hidden="true" />
        <div className="inv-hero__ov" aria-hidden="true" />
        <TopNav />
        <div className="inv-hero__ct">
          <span className="inv-hero__badge">Investor Portal</span>
          <h1 className="inv-hero__title">VERDE ULAŞLI</h1>
          <div className="inv-hero__line" />
          <p className="inv-hero__sub">Turkey's first agro-luxury villa estate</p>
        </div>
      </header>

      {/* ═══ TABS ═══ */}
      <nav className="inv-tabs">
        <button className={`inv-tab ${tab === "financials" ? "inv-tab--active" : ""}`} onClick={() => setTab("financials")}>
          Financials
        </button>
        <button className={`inv-tab ${tab === "brand" ? "inv-tab--active" : ""}`} onClick={() => setTab("brand")}>
          Brand
        </button>
      </nav>

      {/* ═══ CONTENT ═══ */}
      {tab === "financials" && <FinancialsTab />}
      {tab === "brand" && <BrandTab />}
    </>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* FINANCIALS TAB — wraps existing PlannerPage content       */
/* ══════════════════════════════════════════════════════════ */
function FinancialsTab() {
  return <PlannerPage embedded />;
}

/* ══════════════════════════════════════════════════════════ */
/* BRAND TAB — project overview, completed work, roadmap     */
/* ══════════════════════════════════════════════════════════ */
function BrandTab() {
  return (
    <main className="inv-brand">
      {/* ── 1. PROJECT OVERVIEW ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">Project Overview</h2>
        <div className="inv-section__divider" />
        <p className="inv-section__body">
          VERDE ULAŞLI is Turkey's first agro-luxury villa estate, located in Ulaşlı, Kocaeli.
          Two twin villas on 5,500 m² of living land — organic gardens, a henhouse, fruit trees,
          infinity pool, sauna, fire pit, and 10 unique experience programmes.
        </p>
        <table className="inv-table">
          <tbody>
            <tr><td>Location</td><td>Ulaşlı, Kocaeli, Turkey</td></tr>
            <tr><td>Estate</td><td>5,500 m² private gated land</td></tr>
            <tr><td>Villas</td><td>2 twin villas (ALYA + ZEHRA), 24 guests total</td></tr>
            <tr><td>Price target</td><td>€500–€1,000 / villa / night</td></tr>
            <tr><td>CAPEX</td><td>€500,000</td></tr>
            <tr><td>Opening</td><td>Coming Soon</td></tr>
            <tr><td>Website</td><td><a href="https://verde-ulasli.com" target="_blank" rel="noopener">verde-ulasli.com</a></td></tr>
            <tr><td>Instagram</td><td>@verde.ulasli</td></tr>
            <tr><td>Email</td><td>info@verde-ulasli.com</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── 2. BRAND IDENTITY ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">Brand Identity</h2>
        <div className="inv-section__divider" />
        <p className="inv-section__body">
          <strong>VERDE</strong> — Italian for "green". The colour of paradise in Islamic tradition,
          the language of Italian elegance, and the essence of the land that hosts you.
          Selected from 47 candidates through a multi-criteria analysis including Gulf customer psychology.
        </p>
        <table className="inv-table">
          <tbody>
            <tr><td>Brand name</td><td>VERDE ULAŞLI</td></tr>
            <tr><td>Logo</td><td>Golden olive tree + VERDE wordmark</td></tr>
            <tr><td>Palette</td><td>#0E1A16 (deep green), #2D5040 (forest), #C9B99A (sand), #C3A564 (gold), #EBE8E1 (mist)</td></tr>
            <tr><td>Typography</td><td>Playfair Display (serif) + Inter (sans-serif)</td></tr>
            <tr><td>Voice</td><td>Sensory, mysterious, elegant — the place speaks, not "you"</td></tr>
            <tr><td>5 Pillars</td><td>Land, Design, Experience, Privacy, Personal Touch</td></tr>
            <tr><td>4 Seasons</td><td>Uyanış (Spring), Altın Saat (Summer), Hasat (Autumn), Sığınak (Winter)</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── 3. COMPLETED WORK ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">Completed Work</h2>
        <div className="inv-section__divider" />

        <h3 className="inv-sub">Website (verde-ulasli.com)</h3>
        <table className="inv-table">
          <thead><tr><th>Page</th><th>Content</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Home</td><td>Hero + agro-luxury intro + 2 villas + experiences + location map + CTA + footer</td><td className="inv-done">Live</td></tr>
            <tr><td>Our Story</td><td>10 sections: medieval history, philosophy, agro-culture, Verde etymology (وردة), location</td><td className="inv-done">Live</td></tr>
            <tr><td>Experiences</td><td>10 experience cards + 4 seasonal packages</td><td className="inv-done">Live</td></tr>
            <tr><td>Gallery</td><td>34 media items (renders + construction + video) with lightbox</td><td className="inv-done">Live</td></tr>
            <tr><td>Booking</td><td>5-step guided flow, enquiry-based pricing, 6 included experiences</td><td className="inv-done">Live</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub">Digital Infrastructure</h3>
        <table className="inv-table">
          <thead><tr><th>Asset</th><th>Detail</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Domain</td><td>verde-ulasli.com (Cloudflare)</td><td className="inv-done">Active</td></tr>
            <tr><td>Hosting</td><td>Cloudflare Pages (auto-deploy)</td><td className="inv-done">Active</td></tr>
            <tr><td>Email</td><td>info@ + reservations@ → Gmail</td><td className="inv-done">Active</td></tr>
            <tr><td>Instagram</td><td>@verde.ulasli — 9-post grid + highlights</td><td className="inv-done">Active</td></tr>
            <tr><td>Languages</td><td>English, Turkish, Arabic (RTL)</td><td className="inv-done">Active</td></tr>
            <tr><td>Trademark</td><td>Risk assessment complete (2/10). TURKPATENT filing pending.</td><td className="inv-pending">Pending</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub">Brand Materials</h3>
        <table className="inv-table">
          <tbody>
            <tr><td>Logo</td><td>Golden olive tree — organic, detailed, on dark green</td><td className="inv-done">Done</td></tr>
            <tr><td>Brand document v4</td><td>Full brand strategy: vision, pillars, benchmark, financials</td><td className="inv-done">Done</td></tr>
            <tr><td>Luxury catalogue</td><td>12-page visual brochure (TR + EN), villa interiors + exteriors</td><td className="inv-done">Done</td></tr>
            <tr><td>Trademark report</td><td>Competitive analysis, 5 existing "Verde" hotels, risk 2/10</td><td className="inv-done">Done</td></tr>
            <tr><td>IG content plan</td><td>2-week plan: 6 posts + 6 stories + 5 highlight covers</td><td className="inv-done">Done</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── 4. ROADMAP ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">Roadmap</h2>
        <div className="inv-section__divider" />

        <h3 className="inv-sub inv-sub--phase">Immediate — This Week</h3>
        <table className="inv-table">
          <thead><tr><th>#</th><th>Task</th><th>Owner</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>TURKPATENT class 43 "verde" check</td><td>Founder</td><td className="inv-pending">Pending</td></tr>
            <tr><td>2</td><td>TURKPATENT filing (word + logo, class 43+35+41)</td><td>Founder</td><td className="inv-pending">Pending</td></tr>
            <tr><td>3</td><td>Integrate logo into website (favicon + nav + footer)</td><td>Developer</td><td className="inv-pending">Pending</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub inv-sub--phase">Short Term — April 2026</h3>
        <table className="inv-table">
          <thead><tr><th>#</th><th>Task</th><th>Owner</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>4</td><td>SEO — structured data, sitemap, hreflang</td><td>Developer</td><td className="inv-pending">Pending</td></tr>
            <tr><td>5</td><td>Map upgrade (Mapbox)</td><td>Developer</td><td className="inv-pending">Pending</td></tr>
            <tr><td>6</td><td>Video editing — Kuzu Yayla (CapCut/Runway)</td><td>Founder</td><td className="inv-pending">Pending</td></tr>
            <tr><td>7</td><td>Planner page password protection</td><td>Developer</td><td className="inv-pending">Pending</td></tr>
            <tr><td>8</td><td>Google Workspace (real email sending)</td><td>Founder</td><td className="inv-pending">Pending</td></tr>
            <tr><td>9</td><td>Execute 2-week IG content plan</td><td>Social Media</td><td className="inv-active">Active</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub inv-sub--phase">Medium Term — May–June 2026</h3>
        <table className="inv-table">
          <thead><tr><th>#</th><th>Task</th><th>Owner</th></tr></thead>
          <tbody>
            <tr><td>10</td><td>Email waitlist — lead capture form on website</td><td>Developer</td></tr>
            <tr><td>11</td><td>Influencer & PR plan</td><td>Founder + Social Media</td></tr>
            <tr><td>12</td><td>Platform integrations research (Airbnb, Booking)</td><td>Founder</td></tr>
            <tr><td>13</td><td>Professional photo/video shoot plan</td><td>Founder</td></tr>
            <tr><td>14</td><td>Social media manager role definition</td><td>Founder</td></tr>
            <tr><td>15</td><td>Weekly construction progress IG stories</td><td>Social Media</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub inv-sub--phase">Long Term — Until Opening</h3>
        <table className="inv-table">
          <thead><tr><th>#</th><th>Task</th><th>Owner</th></tr></thead>
          <tbody>
            <tr><td>16</td><td>Reservation system — real calendar + payment</td><td>Developer</td></tr>
            <tr><td>17</td><td>Enable public pricing (SHOW_PRICING = true)</td><td>Founder</td></tr>
            <tr><td>18</td><td>Digital guest concierge guide</td><td>Developer</td></tr>
            <tr><td>19</td><td>Google Business Profile</td><td>Founder</td></tr>
            <tr><td>20</td><td>Soft launch — first guests, feedback collection</td><td>All</td></tr>
            <tr><td>21</td><td>Platform listings (Airbnb, Booking.com)</td><td>Founder</td></tr>
            <tr><td>22</td><td>Grand opening — PR, influencer, campaign</td><td>All</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── 5. FILE MAP ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">Project Files</h2>
        <div className="inv-section__divider" />
        <table className="inv-table">
          <thead><tr><th>Folder</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>verde-ulasli.com</td><td>Live website — 7 pages, 3 languages</td></tr>
            <tr><td>marka-stratejisi/</td><td>Brand documents, catalogue, trademark report, roadmap</td></tr>
            <tr><td>instagram/</td><td>All IG content: grid, weekly posts, stories, highlights</td></tr>
            <tr><td>logo/</td><td>Final logo file (golden olive tree)</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
