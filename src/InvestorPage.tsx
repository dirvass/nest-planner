import React, { useState, useEffect } from "react";
import TopNav from "./components/TopNav";
import PlannerPage from "./PlannerPage";
import { useLanguage } from "./i18n/LanguageContext";

type Tab = "financials" | "brand";

export default function InvestorPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("financials");
  const [heroVis, setHeroVis] = useState(false);
  useEffect(() => { const tm = setTimeout(() => setHeroVis(true), 100); return () => clearTimeout(tm); }, []);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header className={`inv-hero ${heroVis ? "inv-hero--vis" : ""}`}>
        <div className="inv-hero__bg" aria-hidden="true" />
        <div className="inv-hero__ov" aria-hidden="true" />
        <TopNav />
        <div className="inv-hero__ct">
          <span className="inv-hero__badge">{t("investor.heroBadge")}</span>
          <h1 className="inv-hero__title">VERDE ULAŞLI</h1>
          <div className="inv-hero__line" />
          <p className="inv-hero__sub">{t("investor.heroSub")}</p>
        </div>
      </header>

      {/* ═══ TABS ═══ */}
      <nav className="inv-tabs">
        <button className={`inv-tab ${tab === "financials" ? "inv-tab--active" : ""}`} onClick={() => setTab("financials")}>
          {t("investor.tabFinancials")}
        </button>
        <button className={`inv-tab ${tab === "brand" ? "inv-tab--active" : ""}`} onClick={() => setTab("brand")}>
          {t("investor.tabBrand")}
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
  const { t } = useLanguage();

  return (
    <main className="inv-brand">
      {/* ── 1. PROJECT OVERVIEW ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">{t("investor.overviewTitle")}</h2>
        <div className="inv-section__divider" />
        <p className="inv-section__body">{t("investor.overviewBody")}</p>
        <table className="inv-table">
          <tbody>
            <tr><td>{t("investor.labelLocation")}</td><td>{t("investor.valueLocation")}</td></tr>
            <tr><td>{t("investor.labelEstate")}</td><td>{t("investor.valueEstate")}</td></tr>
            <tr><td>{t("investor.labelVillas")}</td><td>{t("investor.valueVillas")}</td></tr>
            <tr><td>{t("investor.labelPrice")}</td><td>{t("investor.valuePrice")}</td></tr>
            <tr><td>{t("investor.labelCapex")}</td><td>{t("investor.valueCapex")}</td></tr>
            <tr><td>{t("investor.labelOpening")}</td><td>{t("investor.valueOpening")}</td></tr>
            <tr><td>{t("investor.labelWebsite")}</td><td><a href="https://verde-ulasli.com" target="_blank" rel="noopener">verde-ulasli.com</a></td></tr>
            <tr><td>{t("investor.labelInstagram")}</td><td>@verde.ulasli</td></tr>
            <tr><td>{t("investor.labelEmail")}</td><td>info@verde-ulasli.com</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── 2. BRAND IDENTITY ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">{t("investor.brandTitle")}</h2>
        <div className="inv-section__divider" />
        <p className="inv-section__body" dangerouslySetInnerHTML={{ __html: t("investor.brandBody") }} />
        <table className="inv-table">
          <tbody>
            <tr><td>{t("investor.labelBrandName")}</td><td>VERDE ULAŞLI</td></tr>
            <tr><td>{t("investor.labelLogo")}</td><td>{t("investor.valueLogo")}</td></tr>
            <tr><td>{t("investor.labelPalette")}</td><td>#0E1A16 (deep green), #2D5040 (forest), #C9B99A (sand), #C3A564 (gold), #EBE8E1 (mist)</td></tr>
            <tr><td>{t("investor.labelTypography")}</td><td>{t("investor.valueTypography")}</td></tr>
            <tr><td>{t("investor.labelVoice")}</td><td>{t("investor.valueVoice")}</td></tr>
            <tr><td>{t("investor.labelPillars")}</td><td>{t("investor.valuePillars")}</td></tr>
            <tr><td>{t("investor.labelSeasons")}</td><td>{t("investor.valueSeasons")}</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── 3. COMPLETED WORK ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">{t("investor.completedTitle")}</h2>
        <div className="inv-section__divider" />

        <h3 className="inv-sub">{t("investor.subWebsite")}</h3>
        <table className="inv-table">
          <thead><tr><th>{t("investor.thPage")}</th><th>{t("investor.thContent")}</th><th>{t("investor.thStatus")}</th></tr></thead>
          <tbody>
            <tr><td>{t("investor.pagHome")}</td><td>{t("investor.pagHomeContent")}</td><td className="inv-done">{t("investor.statusLive")}</td></tr>
            <tr><td>{t("investor.pagStory")}</td><td>{t("investor.pagStoryContent")}</td><td className="inv-done">{t("investor.statusLive")}</td></tr>
            <tr><td>{t("investor.pagExperiences")}</td><td>{t("investor.pagExperiencesContent")}</td><td className="inv-done">{t("investor.statusLive")}</td></tr>
            <tr><td>{t("investor.pagGallery")}</td><td>{t("investor.pagGalleryContent")}</td><td className="inv-done">{t("investor.statusLive")}</td></tr>
            <tr><td>{t("investor.pagBooking")}</td><td>{t("investor.pagBookingContent")}</td><td className="inv-done">{t("investor.statusLive")}</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub">{t("investor.subDigital")}</h3>
        <table className="inv-table">
          <thead><tr><th>{t("investor.thAsset")}</th><th>{t("investor.thDetail")}</th><th>{t("investor.thStatus")}</th></tr></thead>
          <tbody>
            <tr><td>{t("investor.diDomain")}</td><td>{t("investor.diDomainDetail")}</td><td className="inv-done">{t("investor.statusActive")}</td></tr>
            <tr><td>{t("investor.diHosting")}</td><td>{t("investor.diHostingDetail")}</td><td className="inv-done">{t("investor.statusActive")}</td></tr>
            <tr><td>{t("investor.diEmail")}</td><td>{t("investor.diEmailDetail")}</td><td className="inv-done">{t("investor.statusActive")}</td></tr>
            <tr><td>{t("investor.diInstagram")}</td><td>{t("investor.diInstagramDetail")}</td><td className="inv-done">{t("investor.statusActive")}</td></tr>
            <tr><td>{t("investor.diLanguages")}</td><td>{t("investor.diLanguagesDetail")}</td><td className="inv-done">{t("investor.statusActive")}</td></tr>
            <tr><td>{t("investor.diTrademark")}</td><td>{t("investor.diTrademarkDetail")}</td><td className="inv-pending">{t("investor.statusPending")}</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub">{t("investor.subBrandMat")}</h3>
        <table className="inv-table">
          <tbody>
            <tr><td>{t("investor.bmLogo")}</td><td>{t("investor.bmLogoDetail")}</td><td className="inv-done">{t("investor.statusDone")}</td></tr>
            <tr><td>{t("investor.bmBrandDoc")}</td><td>{t("investor.bmBrandDocDetail")}</td><td className="inv-done">{t("investor.statusDone")}</td></tr>
            <tr><td>{t("investor.bmCatalogue")}</td><td>{t("investor.bmCatalogueDetail")}</td><td className="inv-done">{t("investor.statusDone")}</td></tr>
            <tr><td>{t("investor.bmTrademark")}</td><td>{t("investor.bmTrademarkDetail")}</td><td className="inv-done">{t("investor.statusDone")}</td></tr>
            <tr><td>{t("investor.bmIG")}</td><td>{t("investor.bmIGDetail")}</td><td className="inv-done">{t("investor.statusDone")}</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── 4. ROADMAP ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">{t("investor.roadmapTitle")}</h2>
        <div className="inv-section__divider" />

        <h3 className="inv-sub inv-sub--phase">{t("investor.phaseImmediate")}</h3>
        <table className="inv-table">
          <thead><tr><th>{t("investor.thNum")}</th><th>{t("investor.thTask")}</th><th>{t("investor.thOwner")}</th><th>{t("investor.thStatus")}</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>{t("investor.task1")}</td><td>{t("investor.ownerFounder")}</td><td className="inv-pending">{t("investor.statusPending")}</td></tr>
            <tr><td>2</td><td>{t("investor.task2")}</td><td>{t("investor.ownerFounder")}</td><td className="inv-pending">{t("investor.statusPending")}</td></tr>
            <tr><td>3</td><td>{t("investor.task3")}</td><td>{t("investor.ownerDeveloper")}</td><td className="inv-pending">{t("investor.statusPending")}</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub inv-sub--phase">{t("investor.phaseShort")}</h3>
        <table className="inv-table">
          <thead><tr><th>{t("investor.thNum")}</th><th>{t("investor.thTask")}</th><th>{t("investor.thOwner")}</th><th>{t("investor.thStatus")}</th></tr></thead>
          <tbody>
            <tr><td>4</td><td>{t("investor.task4")}</td><td>{t("investor.ownerDeveloper")}</td><td className="inv-pending">{t("investor.statusPending")}</td></tr>
            <tr><td>5</td><td>{t("investor.task5")}</td><td>{t("investor.ownerDeveloper")}</td><td className="inv-pending">{t("investor.statusPending")}</td></tr>
            <tr><td>6</td><td>{t("investor.task6")}</td><td>{t("investor.ownerFounder")}</td><td className="inv-pending">{t("investor.statusPending")}</td></tr>
            <tr><td>7</td><td>{t("investor.task7")}</td><td>{t("investor.ownerDeveloper")}</td><td className="inv-pending">{t("investor.statusPending")}</td></tr>
            <tr><td>8</td><td>{t("investor.task8")}</td><td>{t("investor.ownerFounder")}</td><td className="inv-pending">{t("investor.statusPending")}</td></tr>
            <tr><td>9</td><td>{t("investor.task9")}</td><td>{t("investor.ownerSocial")}</td><td className="inv-active">{t("investor.statusActive")}</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub inv-sub--phase">{t("investor.phaseMedium")}</h3>
        <table className="inv-table">
          <thead><tr><th>{t("investor.thNum")}</th><th>{t("investor.thTask")}</th><th>{t("investor.thOwner")}</th></tr></thead>
          <tbody>
            <tr><td>10</td><td>{t("investor.task10")}</td><td>{t("investor.ownerDeveloper")}</td></tr>
            <tr><td>11</td><td>{t("investor.task11")}</td><td>{t("investor.ownerFounderSocial")}</td></tr>
            <tr><td>12</td><td>{t("investor.task12")}</td><td>{t("investor.ownerFounder")}</td></tr>
            <tr><td>13</td><td>{t("investor.task13")}</td><td>{t("investor.ownerFounder")}</td></tr>
            <tr><td>14</td><td>{t("investor.task14")}</td><td>{t("investor.ownerFounder")}</td></tr>
            <tr><td>15</td><td>{t("investor.task15")}</td><td>{t("investor.ownerSocial")}</td></tr>
          </tbody>
        </table>

        <h3 className="inv-sub inv-sub--phase">{t("investor.phaseLong")}</h3>
        <table className="inv-table">
          <thead><tr><th>{t("investor.thNum")}</th><th>{t("investor.thTask")}</th><th>{t("investor.thOwner")}</th></tr></thead>
          <tbody>
            <tr><td>16</td><td>{t("investor.task16")}</td><td>{t("investor.ownerDeveloper")}</td></tr>
            <tr><td>17</td><td>{t("investor.task17")}</td><td>{t("investor.ownerFounder")}</td></tr>
            <tr><td>18</td><td>{t("investor.task18")}</td><td>{t("investor.ownerDeveloper")}</td></tr>
            <tr><td>19</td><td>{t("investor.task19")}</td><td>{t("investor.ownerFounder")}</td></tr>
            <tr><td>20</td><td>{t("investor.task20")}</td><td>{t("investor.ownerAll")}</td></tr>
            <tr><td>21</td><td>{t("investor.task21")}</td><td>{t("investor.ownerFounder")}</td></tr>
            <tr><td>22</td><td>{t("investor.task22")}</td><td>{t("investor.ownerAll")}</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── 5. FILE MAP ── */}
      <section className="inv-section">
        <h2 className="inv-section__title">{t("investor.filesTitle")}</h2>
        <div className="inv-section__divider" />
        <table className="inv-table">
          <thead><tr><th>{t("investor.thFolder")}</th><th>{t("investor.thDescription")}</th></tr></thead>
          <tbody>
            <tr><td>{t("investor.folderWebsite")}</td><td>{t("investor.folderWebsiteDesc")}</td></tr>
            <tr><td>{t("investor.folderBrand")}</td><td>{t("investor.folderBrandDesc")}</td></tr>
            <tr><td>{t("investor.folderIG")}</td><td>{t("investor.folderIGDesc")}</td></tr>
            <tr><td>{t("investor.folderLogo")}</td><td>{t("investor.folderLogoDesc")}</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
