import React, { useMemo, useState, useEffect, useCallback } from "react";
import TopNav from "./components/TopNav";

type Media =
  | { id: string; type: "image"; src: string; alt: string; category: string }
  | { id: string; type: "video"; src: string; poster?: string; alt: string; category: string };

const MEDIA: Media[] = [
  // ----------- MAIN VILLA IMAGES -----------
  { id: "villa-01", type: "image", src: "/media/villa-01.jpg", alt: "Villa exterior 01", category: "Main Villa" },
  { id: "villa-02", type: "image", src: "/media/villa-02.jpg", alt: "Villa exterior 02", category: "Main Villa" },
  { id: "villa-03", type: "image", src: "/media/villa-03.jpg", alt: "Villa exterior 03", category: "Main Villa" },
  { id: "villa-livingroom", type: "image", src: "/media/villa-livingroom.jpg", alt: "Living room", category: "Main Villa" },
  { id: "villa-master-bedroom", type: "image", src: "/media/villa-master-bedroom.jpg", alt: "Master bedroom", category: "Main Villa" },
  { id: "home-view", type: "image", src: "/media/home-view.jpg", alt: "Home view panorama", category: "Main Villa" },
  { id: "tour-01", type: "video", src: "/media/tour-01.mp4", poster: "/media/tour-01-poster.jpg", alt: "Property tour 01", category: "Main Villa" },

  // ----------- VILLA RENDER -----------
  // New uploads (case-sensitive)
  { id: "vr-ai-render2", type: "image", src: "/media/villa-render/AI-RENDER2.jpg", alt: "AI Render 2", category: "Villa Render" },
  { id: "vr-ai-render3", type: "image", src: "/media/villa-render/AI-RENDER3.jpg", alt: "AI Render 3", category: "Villa Render" },
  { id: "vr-ai-render5", type: "image", src: "/media/villa-render/AI-RENDER5.jpg", alt: "AI Render 5", category: "Villa Render" },
  { id: "vr-ai-render4", type: "image", src: "/media/villa-render/AI-Render4.jpg", alt: "AI Render 4", category: "Villa Render" },

  // Existing renders
  { id: "vr-ana-yol", type: "image", src: "/media/villa-render/ANA-YOL.jpg", alt: "Ana yol", category: "Villa Render" },
  { id: "vr-arka-gorunum", type: "image", src: "/media/villa-render/ARKA-GORUNUM.jpg", alt: "Arka görünüm", category: "Villa Render" },
  { id: "vr-ates-cukuru", type: "image", src: "/media/villa-render/ATES-CUKURU.jpg", alt: "Ateş çukuru", category: "Villa Render" },
  { id: "vr-kus-bakisi", type: "image", src: "/media/villa-render/KUS-BAKISI.jpg", alt: "Kuş bakışı", category: "Villa Render" },
  { id: "vr-satranc-2", type: "image", src: "/media/villa-render/SATRANC-2.jpg", alt: "Satranç 2", category: "Villa Render" },
  { id: "vr-satranc", type: "image", src: "/media/villa-render/SATRANC.jpg", alt: "Satranç", category: "Villa Render" },
  { id: "vr-yan-aci", type: "image", src: "/media/villa-render/YAN-ACI.jpg", alt: "Yan açı", category: "Villa Render" },
  { id: "vr-yan-aci2", type: "image", src: "/media/villa-render/YAN-ACI2.jpg", alt: "Yan açı 2", category: "Villa Render" },
  { id: "vr-drone", type: "image", src: "/media/villa-render/DRONE.jpg", alt: "Drone", category: "Villa Render" },

  // ----------- INŞAAT SÜRECİ (construction process) -----------
  { id: "bati-bahce", type: "image", src: "/media/inşaat süreci/bati_bahce.jpg", alt: "Batı bahçe (west garden)", category: "inşaat süreci" },
  { id: "bati-cephe", type: "image", src: "/media/inşaat süreci/bati_cephe.jpg", alt: "Batı cephe (west facade)", category: "inşaat süreci" },
  { id: "dogu-cephe", type: "image", src: "/media/inşaat süreci/dogu_cephe.jpg", alt: "Doğu cephe (east facade)", category: "inşaat süreci" },
  { id: "izolasyon-oncesi", type: "image", src: "/media/inşaat süreci/izolasyon_oncesi.jpg", alt: "İzolasyon öncesi", category: "inşaat süreci" },
  { id: "izolasyon-sonrasi", type: "image", src: "/media/inşaat süreci/izolasyon_sonrasi.jpg", alt: "İzolasyon sonrası", category: "inşaat süreci" },
  { id: "izolasyon-1", type: "video", src: "/media/inşaat süreci/izolasyon.mp4", poster: "/media/inşaat süreci/izolasyon_oncesi.jpg", alt: "İzolasyon çalışması 1", category: "inşaat süreci" },
  { id: "izolasyon-2", type: "video", src: "/media/inşaat süreci/izolasyon_2.mp4", poster: "/media/inşaat süreci/izolasyon_sonrasi.jpg", alt: "İzolasyon çalışması 2", category: "inşaat süreci" },
];

type FilterType = "all" | "photos" | "videos";

export default function GalleryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [category, setCategory] = useState<string>("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(MEDIA.map((m) => m.category)))], []);

  const items = useMemo(() => {
    let result = MEDIA;
    if (category !== "All") result = result.filter((m) => m.category === category);
    if (filter === "photos") result = result.filter((m) => m.type === "image");
    if (filter === "videos") result = result.filter((m) => m.type === "video");
    return result;
  }, [category, filter]);

  const activeIndex = useMemo(
    () => (activeId ? items.findIndex((i) => i.id === activeId) : -1),
    [activeId, items]
  );

  const open = (id: string) => setActiveId(id);
  const close = () => setActiveId(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (activeIndex < 0) return;
      const next = (activeIndex + dir + items.length) % items.length;
      setActiveId(items[next].id);
    },
    [activeIndex, items]
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

  return (
    <>
      <header className="header">
        <TopNav />
        <div className="header-inner" style={{ textAlign: "center" }}>
          <span className="badge">by Ahmed Said Dizman</span>
          <h1 className="hero-title">Gallery</h1>
          <p className="hero-subtitle">Photos and videos of Nest Ulasli</p>

          {/* CATEGORY FILTER */}
          <div className="segmented" role="tablist" aria-label="Filter categories" style={{ marginTop: 16 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={category === cat}
                className={`seg-btn ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* PHOTO/VIDEO FILTER */}
          <div className="segmented" role="tablist" aria-label="Filter gallery type" style={{ marginTop: 10 }}>
            <button className={`seg-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              All
            </button>
            <button className={`seg-btn ${filter === "photos" ? "active" : ""}`} onClick={() => setFilter("photos")}>
              Photos
            </button>
            <button className={`seg-btn ${filter === "videos" ? "active" : ""}`} onClick={() => setFilter("videos")}>
              Videos
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="shell stack">
          <div className="gallery-grid">
            {items.map((item) => (
              <article
                key={item.id}
                className="media-card"
                onClick={() => open(item.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") open(item.id);
                }}
                aria-label={`${item.type === "image" ? "Image" : "Video"}: ${item.alt}`}
              >
                {item.type === "image" ? (
                  <img className="media-thumb" src={item.src} alt={item.alt} loading="lazy" />
                ) : (
                  <div className="video-thumb">
                    <img src={item.poster || "/hero.jpg"} alt={item.alt} loading="lazy" />
                    <span className="play-badge" aria-hidden>
                      ▶
                    </span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      {activeIndex >= 0 && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          <button className="lightbox-close" aria-label="Close" onClick={close}>
            ×
          </button>
          <button
            className="lightbox-nav prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            ‹
          </button>
          <button
            className="lightbox-nav next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            ›
          </button>

          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            {items[activeIndex].type === "image" ? (
              <img className="lightbox-media" src={items[activeIndex].src} alt={items[activeIndex].alt} />
            ) : (
              <video
                className="lightbox-media"
                src={items[activeIndex].src}
                poster={(items[activeIndex] as any).poster}
                controls
                playsInline
                preload="metadata"
              />
            )}
            <div className="lightbox-caption">{items[activeIndex].alt}</div>
          </div>
        </div>
      )}
    </>
  );
}
