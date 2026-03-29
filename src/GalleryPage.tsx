import React, { useMemo, useState, useEffect, useCallback } from "react";
import TopNav from "./components/TopNav";
import { useLanguage } from "./i18n/LanguageContext";
import { usePageMeta } from "./hooks/usePageMeta";

type Media =
  | { id: string; type: "image"; src: string; alt: string; category: Category; featured?: boolean }
  | { id: string; type: "video"; src: string; poster?: string; alt: string; category: Category };

type Category = "exterior" | "interior" | "construction";

const CAT_LABEL_KEYS: Record<Category, string> = {
  exterior: "gallery.exterior",
  interior: "gallery.interior",
  construction: "gallery.construction",
};
const CAT_DESC_KEYS: Record<Category, string> = {
  exterior: "gallery.extDesc",
  interior: "gallery.intDesc",
  construction: "gallery.conDesc",
};

const MEDIA: Media[] = [
  // ─── EXTERIOR ───
  { id: "vid-yayla", type: "video", src: "/media/videolar/kuzu-yayla.mp4", poster: "/media/videolar/kuzu-yayla-poster.jpg", alt: "Kuzu Yayla — highland meadows and mountain views", category: "construction" },
  { id: "ext-kus-bakisi-gunduz", type: "image", src: "/media/dis-mekan/kus-bakisi-gunduz-ai-render.jpg", alt: "Aerial view — daytime", category: "exterior", featured: true },
  { id: "ext-havuz-deniz", type: "image", src: "/media/dis-mekan/havuz-deniz-manzarasi-konsept.jpg", alt: "Infinity pool with sea panorama", category: "exterior", featured: true },
  { id: "ext-on-cephe-ates", type: "image", src: "/media/dis-mekan/on-cephe-ates-cukuru-render.jpg", alt: "Front facade with fire pit", category: "exterior", featured: true },
  { id: "ext-drone-genel", type: "image", src: "/media/dis-mekan/drone-genel-gorunum-render.jpg", alt: "Drone overview of the estate", category: "exterior" },
  { id: "ext-giris-gece", type: "image", src: "/media/dis-mekan/giris-avlusu-gece-ai-render.jpg", alt: "Entrance courtyard — evening", category: "exterior" },
  { id: "ext-giris-peyzaj", type: "image", src: "/media/dis-mekan/giris-yolu-peyzaj-render.jpg", alt: "Landscaped entrance pathway", category: "exterior" },
  { id: "ext-kus-bakisi-gece", type: "image", src: "/media/dis-mekan/kus-bakisi-gece-ai-render.jpg", alt: "Aerial view — night", category: "exterior" },
  { id: "ext-kus-bakisi-otopark", type: "image", src: "/media/dis-mekan/kus-bakisi-otopark-render.jpg", alt: "Aerial view with parking area", category: "exterior" },
  { id: "ext-on-cephe-satranc", type: "image", src: "/media/dis-mekan/on-cephe-havuz-satranc-render.jpg", alt: "Pool terrace and chess garden", category: "exterior" },
  { id: "ext-satranc-alani", type: "image", src: "/media/dis-mekan/on-cephe-satranc-alani-render.jpg", alt: "Outdoor chess area", category: "exterior" },
  { id: "ext-arka-cephe", type: "image", src: "/media/dis-mekan/arka-cephe-otopark-render.jpg", alt: "Rear facade and parking", category: "exterior" },
  { id: "ext-yan-cephe", type: "image", src: "/media/dis-mekan/yan-cephe-genel-gorunum-render.jpg", alt: "Side view — full estate", category: "exterior" },

  // ─── INTERIOR RENDERS (ic-mekan) ───
  { id: "int-salon-deniz", type: "image", src: "/media/ic-mekan/salon-deniz-manzarasi-render.jpg", alt: "Living room with sea view", category: "interior", featured: true },
  { id: "int-yatak-banyo", type: "image", src: "/media/ic-mekan/yatak-odasi-banyolu-manzara-render.jpg", alt: "Master bedroom with en-suite bath", category: "interior", featured: true },
  { id: "int-mutfak", type: "image", src: "/media/ic-mekan/mutfak-ada-tezgah-render.jpg", alt: "Kitchen with island counter", category: "interior" },
  { id: "int-salon-somine", type: "image", src: "/media/ic-mekan/salon-somine-kahverengi-koltuk-render.jpg", alt: "Lounge with fireplace", category: "interior" },
  { id: "int-salon-manzara", type: "image", src: "/media/ic-mekan/salon-somine-manzara-render.jpg", alt: "Salon with fireplace and panoramic view", category: "interior" },
  { id: "int-yatak-minimalist", type: "image", src: "/media/ic-mekan/yatak-odasi-genis-minimalist-render.jpg", alt: "Minimalist bedroom suite", category: "interior" },
  { id: "int-yatak-yesil", type: "image", src: "/media/ic-mekan/yatak-odasi-yesil-dus-render.jpg", alt: "Bedroom with walk-in shower", category: "interior" },

  // ─── CONSTRUCTION PROCESS (insaat-sureci) ───
  { id: "con-foto3", type: "image", src: "/media/insaat-sureci/insaat-fotograf-3.jpg", alt: "Foundation formwork with sea panorama", category: "construction", featured: true },
  { id: "con-arazi", type: "image", src: "/media/insaat-sureci/arazi-hazirligi-genel-gorunum.jpg", alt: "Site preparation — overview", category: "construction" },
  { id: "con-foto1", type: "image", src: "/media/insaat-sureci/insaat-fotograf-1.jpg", alt: "Grading and retaining wall — sea view", category: "construction" },
  { id: "con-foto2", type: "image", src: "/media/insaat-sureci/insaat-fotograf-2.jpg", alt: "Retaining wall and earthworks", category: "construction" },
  { id: "con-foto4", type: "image", src: "/media/insaat-sureci/insaat-fotograf-4.jpg", alt: "Winter view — site under snow", category: "construction" },
  { id: "con-bati-bahce", type: "image", src: "/media/insaat-sureci/bati_bahce.jpg", alt: "West garden progress", category: "construction" },
  { id: "con-bati-cephe", type: "image", src: "/media/insaat-sureci/bati_cephe.jpg", alt: "West facade structure", category: "construction" },
  { id: "con-dogu-cephe", type: "image", src: "/media/insaat-sureci/dogu_cephe.jpg", alt: "East facade structure", category: "construction" },
  { id: "con-izolasyon-once", type: "image", src: "/media/insaat-sureci/izolasyon_oncesi.jpg", alt: "Before insulation", category: "construction" },
  { id: "con-izolasyon-sonra", type: "image", src: "/media/insaat-sureci/izolasyon_sonrasi.jpg", alt: "After insulation", category: "construction" },

  // ─── VIDEOS ───
  { id: "vid-1", type: "video", src: "/media/videolar/villa-video-1.mp4", alt: "Villa site tour 1", category: "construction" },
  { id: "vid-2", type: "video", src: "/media/videolar/villa-video-2.mp4", alt: "Villa site tour 2", category: "construction" },
  { id: "vid-3", type: "video", src: "/media/videolar/villa-video-3.mp4", alt: "Villa site overview", category: "construction" },
  { id: "vid-4", type: "video", src: "/media/videolar/villa-video-4.mp4", alt: "Construction progress walkthrough", category: "construction" },
];

function GalleryCard({ item, idx, onOpen }: { item: Media; idx: number; onOpen: (id: string) => void }) {
  const isFeatured = item.type === "image" && "featured" in item && item.featured;
  return (
    <article
      className={`gallery-card ${isFeatured ? "gallery-card--featured" : ""}`}
      onClick={() => onOpen(item.id)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(item.id); }}
      style={{ animationDelay: `${idx * 0.06}s` }}
    >
      {item.type === "image" ? (
        <img className="gallery-card__img" src={item.src} alt={item.alt} loading="lazy" />
      ) : (
        <video className="gallery-card__img" src={item.src} poster={"poster" in item ? item.poster : undefined} muted preload="metadata" playsInline />
      )}
      <div className="gallery-card__overlay">
        <span className="gallery-card__alt">
          {item.type === "video" && <span className="gallery-card__play">&#9654;</span>}
          {item.alt}
        </span>
      </div>
    </article>
  );
}

type FilterTab = "all" | Category;

export default function GalleryPage() {
  usePageMeta("meta.galleryTitle", "meta.galleryDesc");
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const tm = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(tm);
  }, []);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return MEDIA;
    return MEDIA.filter((m) => m.category === activeTab);
  }, [activeTab]);

  const activeIndex = useMemo(
    () => (activeId ? filteredItems.findIndex((i) => i.id === activeId) : -1),
    [activeId, filteredItems],
  );

  const open = (id: string) => setActiveId(id);
  const close = () => setActiveId(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (activeIndex < 0) return;
      const next = (activeIndex + dir + filteredItems.length) % filteredItems.length;
      setActiveId(filteredItems[next].id);
    },
    [activeIndex, filteredItems],
  );

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, go]);

  // Group items by category for the "all" view
  const categories: Category[] = ["exterior", "interior", "construction"];

  return (
    <>
      {/* ── HERO ── */}
      <header className={`gallery-hero ${heroVisible ? "gallery-hero--visible" : ""}`}>
        <div className="gallery-hero__bg" aria-hidden="true" />
        <div className="gallery-hero__overlay" aria-hidden="true" />
        <TopNav />
        <div className="gallery-hero__content">
          <span className="gallery-hero__badge">{t("gallery.badge")}</span>
          <h1 className="gallery-hero__title">{t("gallery.title")}</h1>
          <div className="gallery-hero__line" />
          <p className="gallery-hero__subtitle">{t("gallery.subtitle")}</p>
        </div>
      </header>

      {/* ── FILTER TABS ── */}
      <nav className="gallery-tabs" aria-label="Gallery filter">
        <div className="gallery-tabs__inner">
          {(["all", ...categories] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              className={`gallery-tab ${activeTab === tab ? "gallery-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? t("gallery.all") : t(CAT_LABEL_KEYS[tab])}
              <span className="gallery-tab__count">
                {tab === "all" ? MEDIA.length : MEDIA.filter((m) => m.category === tab).length}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <main className="gallery-main">
        {activeTab === "all" ? (
          // Sectioned view when showing all
          categories.map((cat) => {
            const items = MEDIA.filter((m) => m.category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat} className="gallery-section">
                <div className="gallery-section__header">
                  <div>
                    <h2 className="gallery-section__title">{t(CAT_LABEL_KEYS[cat])}</h2>
                    <p className="gallery-section__desc">{t(CAT_DESC_KEYS[cat])}</p>
                  </div>
                  <button
                    className="gallery-section__link"
                    onClick={() => setActiveTab(cat)}
                  >
                    {t("gallery.viewAll", { n: items.length })}
                  </button>
                </div>
                <div className={`gallery-grid ${cat === "construction" ? "gallery-grid--compact" : ""}`}>
                  {items.map((item, idx) => (
                    <GalleryCard key={item.id} item={item} idx={idx} onOpen={open} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          // Flat grid for single category
          <section className="gallery-section">
            <div className="gallery-section__header">
              <div>
                <h2 className="gallery-section__title">{t(CAT_LABEL_KEYS[activeTab])}</h2>
                <p className="gallery-section__desc">{t(CAT_DESC_KEYS[activeTab])}</p>
              </div>
            </div>
            <div className={`gallery-grid ${activeTab === "construction" ? "gallery-grid--compact" : ""}`}>
              {filteredItems.map((item, idx) => (
                <GalleryCard key={item.id} item={item} idx={idx} onOpen={open} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── LIGHTBOX ── */}
      {activeIndex >= 0 && (
        <div className="gal-lightbox" role="dialog" aria-modal="true" onClick={close}>
          <button className="gal-lightbox__close" aria-label="Close" onClick={close}>
            &times;
          </button>
          <button
            className="gal-lightbox__nav gal-lightbox__nav--prev"
            aria-label="Previous"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
          >
            &#8249;
          </button>
          <button
            className="gal-lightbox__nav gal-lightbox__nav--next"
            aria-label="Next"
            onClick={(e) => { e.stopPropagation(); go(1); }}
          >
            &#8250;
          </button>

          <div className="gal-lightbox__inner" onClick={(e) => e.stopPropagation()}>
            {filteredItems[activeIndex].type === "image" ? (
              <img
                className="gal-lightbox__media"
                src={filteredItems[activeIndex].src}
                alt={filteredItems[activeIndex].alt}
              />
            ) : (
              <video
                className="gal-lightbox__media"
                src={filteredItems[activeIndex].src}
                controls
                autoPlay
                playsInline
                preload="metadata"
              />
            )}
            <div className="gal-lightbox__caption">
              <span className="gal-lightbox__caption-cat">
                {t(CAT_LABEL_KEYS[filteredItems[activeIndex].category])}
              </span>
              <span>{filteredItems[activeIndex].alt}</span>
            </div>
            <div className="gal-lightbox__counter">
              {activeIndex + 1} / {filteredItems.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
