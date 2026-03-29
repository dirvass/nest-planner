import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import LocationMap from "./components/LocationMap";
import { useLanguage } from "./i18n/LanguageContext";
import { usePageMeta } from "./hooks/usePageMeta";
import "./styles/StoryPage.css";

const SECTIONS = [
  { key: "s1",  img: "/media/dis-mekan/drone-genel-gorunum-render.jpg" },
  { key: "s2",  img: "/media/ic-mekan/salon-somine-kahverengi-koltuk-render.jpg" },
  { key: "s3",  img: "/media/dis-mekan/on-cephe-ates-cukuru-render.jpg" },
  { key: "s6",  img: "/media/dis-mekan/giris-yolu-peyzaj-render.jpg" },
  { key: "s4",  img: "/media/dis-mekan/havuz-deniz-manzarasi-konsept.jpg" },
  { key: "s7",  img: "/media/dis-mekan/giris-avlusu-gece-ai-render.jpg" },
  { key: "s5",  img: "/media/dis-mekan/on-cephe-havuz-satranc-render.jpg" },
  { key: "s8",  img: "/media/dis-mekan/on-cephe-satranc-alani-render.jpg" },
  { key: "s9",  img: "/media/dis-mekan/kus-bakisi-gece-ai-render.jpg" },
];

export default function StoryPage() {
  usePageMeta("meta.storyTitle", "meta.storyDesc");
  const [vis, setVis] = useState(false);
  const { t } = useLanguage();
  useEffect(() => { const tm = setTimeout(() => setVis(true), 100); return () => clearTimeout(tm); }, []);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <header className={`story-hero ${vis ? "story-hero--vis" : ""}`}>
        <div className="story-hero__bg" aria-hidden="true" />
        <div className="story-hero__ov" aria-hidden="true" />
        <TopNav />
        <div className="story-hero__ct">
          <span className="story-hero__badge">{t("story.badge")}</span>
          <h1 className="story-hero__title">{t("story.heroTitle")}</h1>
          <div className="story-hero__line" />
          <p className="story-hero__sub">{t("story.heroSub")}</p>
        </div>
      </header>

      <main className="story">
        {SECTIONS.map((s, i) => (
          <section className={`story__section ${i % 2 === 1 ? "story__section--reverse" : ""}`} key={s.key}>
            <div className="story__img-wrap">
              <img className="story__img" src={s.img} alt="" loading="lazy" />
            </div>
            <div className="story__text">
              <h2 className="story__title">{t(`story.${s.key}Title`)}</h2>
              <div className="story__divider" />
              <p className="story__body">{t(`story.${s.key}Body`)}</p>
            </div>
          </section>
        ))}

        {/* ═══ CINEMATIC VIDEO — Kuzu Yayla ═══ */}
        <section className="story__video-section">
          <div className="story__video-wrap">
            <video
              className="story__video"
              src="/media/videolar/kuzu-yayla.mp4"
              autoPlay
              muted
              loop
              playsInline
              poster="/media/dis-mekan/yan-cephe-genel-gorunum-render.jpg"
            />
            <div className="story__video-overlay" />
            <div className="story__video-content">
              <span className="story__video-label">{t("story.s9Title")}</span>
              <p className="story__video-quote">{t("story.heroSub")}</p>
            </div>
          </div>
        </section>

        {/* ═══ LOCATION — with radial map ═══ */}
        <section className="story__section">
          <div className="story__text">
            <h2 className="story__title">{t("story.s10Title")}</h2>
            <div className="story__divider" />
            <p className="story__body">{t("story.s10Body")}</p>
          </div>
          <div>
            <LocationMap />
          </div>
        </section>

        {/* Closing quote */}
        <section className="story__closing">
          <blockquote className="story__quote">
            "{t("story.closingQuote")}"
          </blockquote>
          <Link to="/book" className="story__cta">{t("home.closingCta")}</Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
