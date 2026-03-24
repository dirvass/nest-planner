import React, { useEffect, useState } from "react";
import TopNav from "./components/TopNav";
import { useLanguage } from "./i18n/LanguageContext";

export default function Home() {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <header className={`home-hero ${visible ? "home-hero--visible" : ""}`}>
        <div className="home-hero__bg" aria-hidden="true" />
        <div className="home-hero__overlay" aria-hidden="true" />
        <TopNav />
        <div className="home-hero__content">
          <span className="home-hero__badge">{t("home.badge")}</span>
          <h1 className="home-hero__title">{t("home.title")}</h1>
          <p className="home-hero__tagline">{t("home.tagline")}</p>
          <div className="home-hero__divider" />
          <p className="home-hero__subtitle">{t("home.subtitle")}</p>
          <div className="home-hero__actions">
            <a href="/book" className="home-hero__cta">{t("home.ctaReserve")}</a>
            <a href="/gallery" className="home-hero__cta home-hero__cta--ghost">{t("home.ctaGallery")}</a>
          </div>
        </div>
        <div className="home-hero__scroll" aria-hidden="true">
          <span>{t("home.scroll")}</span>
          <div className="home-hero__scroll-line" />
        </div>
      </header>

      <section className={`home-features ${visible ? "home-features--visible" : ""}`}>
        <div className="home-features__grid">
          <div className="home-features__item">
            <span className="home-features__number">1000m&sup2;</span>
            <span className="home-features__label">{t("home.garden")}</span>
          </div>
          <div className="home-features__divider" />
          <div className="home-features__item">
            <span className="home-features__number">10&times;5m</span>
            <span className="home-features__label">{t("home.pool")}</span>
          </div>
          <div className="home-features__divider" />
          <div className="home-features__item">
            <span className="home-features__number">3</span>
            <span className="home-features__label">{t("home.bedrooms")}</span>
          </div>
          <div className="home-features__divider" />
          <div className="home-features__item">
            <span className="home-features__number">12</span>
            <span className="home-features__label">{t("home.guests")}</span>
          </div>
        </div>
      </section>
    </>
  );
}
