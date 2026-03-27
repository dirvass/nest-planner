import React, { useEffect, useState } from "react";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import { useLanguage } from "./i18n/LanguageContext";

const EXPERIENCES = [
  { key: "1", img: "/media/insaat-sureci/arazi-hazirligi-genel-gorunum.jpg", season: "allSeasons" },
  { key: "2", img: "/media/dis-mekan/on-cephe-ates-cukuru-render.jpg", season: "springSummer" },
  { key: "3", img: "/media/dis-mekan/giris-avlusu-gece-ai-render.jpg", season: "allSeasons" },
  { key: "4", img: "/media/dis-mekan/kus-bakisi-gece-ai-render.jpg", season: "allSeasons" },
  { key: "5", img: "/media/dis-mekan/yan-cephe-genel-gorunum-render.jpg", season: "allSeasons" },
  { key: "6", img: "/media/dis-mekan/havuz-deniz-manzarasi-konsept.jpg", season: "summerOnly" },
  { key: "7", img: "/media/dis-mekan/on-cephe-havuz-satranc-render.jpg", season: "allSeasons" },
  { key: "8", img: "/media/dis-mekan/drone-genel-gorunum-render.jpg", season: "allSeasons" },
  { key: "9", img: "/media/dis-mekan/on-cephe-ates-cukuru-render.jpg", season: "summerOnly" },
  { key: "10", img: "/media/dis-mekan/giris-yolu-peyzaj-render.jpg", season: "allSeasons" },
];

const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

export default function ExperiencePage() {
  const [vis, setVis] = useState(false);
  const { t } = useLanguage();
  useEffect(() => { const tm = setTimeout(() => setVis(true), 100); return () => clearTimeout(tm); }, []);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header className={`exp-hero ${vis ? "exp-hero--vis" : ""}`}>
        <div className="exp-hero__bg" aria-hidden="true" />
        <div className="exp-hero__ov" aria-hidden="true" />
        <TopNav />
        <div className="exp-hero__ct">
          <span className="exp-hero__badge">{t("experience.badge")}</span>
          <h1 className="exp-hero__title">{t("experience.heroTitle")}</h1>
          <div className="exp-hero__line" />
          <p className="exp-hero__sub">{t("experience.heroSub")}</p>
        </div>
      </header>

      <main className="exp-page">
        {/* ═══ EXPERIENCES GRID ═══ */}
        <section className="exp-page__grid-section">
          {EXPERIENCES.map((e) => (
            <article className="exp-card" key={e.key}>
              <div className="exp-card__img-wrap">
                <img className="exp-card__img" src={e.img} alt={t(`experience.exp${e.key}`)} loading="lazy" />
              </div>
              <div className="exp-card__body">
                <span className="exp-card__season">{t(`experience.${e.season}`)}</span>
                <h3 className="exp-card__title">{t(`experience.exp${e.key}`)}</h3>
                <p className="exp-card__desc">{t(`experience.exp${e.key}d`)}</p>
              </div>
            </article>
          ))}
        </section>

        {/* ═══ SEASONS ═══ */}
        <section className="exp-seasons">
          <h2 className="exp-seasons__title">{t("experience.seasonLabel")}</h2>
          <div className="exp-seasons__grid">
            {SEASONS.map((s) => (
              <div className="exp-season" key={s}>
                <h3 className="exp-season__name">{t(`experience.${s}`)}</h3>
                <p className="exp-season__desc">{t(`experience.${s}Desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="exp-cta-section">
          <h2 className="exp-cta__title">{t("home.closingTitle")}</h2>
          <p className="exp-cta__body">{t("home.closingBody")}</p>
          <a href="/book" className="exp-cta__btn">{t("home.closingCta")}</a>
        </section>
      </main>

      <Footer />
    </>
  );
}
