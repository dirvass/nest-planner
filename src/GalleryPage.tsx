import React, { useMemo, useState, useEffect, useCallback } from "react";
import TopNav from "./components/TopNav";

type Media =
  | { id: string; type: "image"; src: string; alt: string }
  | { id: string; type: "video"; src: string; poster?: string; alt: string };

const MEDIA: Media[] = [
  // -------- Photos (public/media/*.jpg) --------
  { id: "villa-01", type: "image", src: "/media/villa-01.jpg", alt: "Villa exterior 01" },
  { id: "villa-02", type: "image", src: "/media/villa-02.jpg", alt: "Villa exterior 02" },
  { id: "villa-03", type: "image", src: "/media/villa-03.jpg", alt: "Villa exterior 03" },
  { id: "villa-livingroom", type: "image", src: "/media/villa-livingroom.jpg", alt: "Living room" },
  { id: "villa-master-bedroom", type: "image", src: "/media/villa-master-bedroom.jpg", alt: "Master bedroom" },

  { id: "home-view", type: "image", src: "/media/home-view.jpg", alt: "Home view panorama" },
  { id: "bati-bahce", type: "image", src: "/media/bati_bahce.jpg", alt: "Batı bahçe (west garden)" },
  { id: "bati-cephe", type: "image", src: "/media/bati_cephe.jpg", alt: "Batı cephe (west facade)" },
  { id: "dogu-cephe", type: "image", src: "/media/dogu_cephe.jpg", alt: "Doğu cephe (east facade)" },

  // Optional “before/after” stills for the insulation videos
  { id: "izolasyon-oncesi", type: "image", src: "/media/izolasyon_oncesi.jpg", alt: "İzolasyon öncesi" },
  { id: "izolasyon-sonrasi", type: "image", src: "/media/izolasyon_sonrasi.jpg", alt: "İzolasyon sonrası" },

  // -------- Videos (public/media/*.mp4) --------
  { id: "tour-01", type: "video", src: "/media/tour-01.mp4", poster: "/media/tour-01-poster.jpg", alt: "Property tour 01" },

  // Insulation clips; using the before/after photos as posters
  { id: "izolasyon-1", type: "video", src: "/media/izolasyon.mp4", poster: "/media/izolasyon_oncesi.jpg", alt: "İzolasyon çalışması 1" },
  { id: "izolasyon-2", type: "video", src: "/media/izolasyon_2.mp4", poster: "/media/izolasyon_sonrasi.jpg", alt: "İzolasyon çalışması 2" },
];

type Filter = "all" | "photos" | "videos";

export default function GalleryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  // filter items
  const items = useMemo(() => {
    if (filter === "photos") return MEDIA.filter(m => m.type === "image");
    if (filter === "videos") return MEDIA.filter(m => m.type === "video");
    return MEDIA;
  }, [filter]);

  // active lightbox index
  const activeIndex = useMemo(
    () => (activeId ? items.findIndex(i => i.id === activeId) : -1),
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

  // keyboard controls for lightbox
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
      {/* HERO – same look as other pages */}
      <header className="header">
        <TopNav />
        <div className="header-inner" style={{ textAlign: "center" }}>
          <span className="badge">by Ahmed Said Dizman</span>
          <h1 className="hero-title">Gallery</h1>
          <p className="hero-subtitle">Photos and videos of NEST ULASLI</p>

          {/* segmented filter */}
          <div className="segmented" role="tablist" aria-label="Filter gallery" style={{ marginTop: 16 }}>
            <button
              role="tab"
              aria-selected={filter === "all"}
              className={`seg-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              role="tab"
              aria-selected={filter === "photos"}
              className={`seg-btn ${filter === "photos" ? "active" : ""}`}
              onClick={() => setFilter("photos")}
            >
              Photos
            </button>
            <button
              role="tab"
              aria-selected={filter === "videos"}
              className={`seg-btn ${filter === "videos" ? "active" : ""}`}
              onClick={() => setFilter("videos")}
            >
              Videos
            </button>
          </div>
        </div>
      </header>

      {/* GRID */}
      <main className="container">
        <section className="shell stack">
          <div className="gallery-grid">
            {items.map(item => (
              <article
                key={item.id}
                className="media-card"
                onClick={() => open(item.id)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") open(item.id); }}
                aria-label={`${item.type === "image" ? "Image" : "Video"}: ${item.alt}`}
              >
                {item.type === "image" ? (
                  <img className="media-thumb" src={item.src} alt={item.alt} loading="lazy" />
                ) : (
                  <div className="video-thumb" aria-label={`${item.alt} (tap to play)`}>
                    <img src={item.poster || "/hero.jpg"} alt={item.alt} loading="lazy" />
                    <span className="play-badge" aria-hidden>▶</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* LIGHTBOX */}
      {activeIndex >= 0 && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          <button className="lightbox-close" aria-label="Close" onClick={close}>×</button>
          <button className="lightbox-nav prev" aria-label="Previous" onClick={e => { e.stopPropagation(); go(-1); }}>‹</button>
          <button className="lightbox-nav next" aria-label="Next" onClick={e => { e.stopPropagation(); go(1); }}>›</button>

          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            {items[activeIndex].type === "image" ? (
              <img className="lightbox-media" src={(items[activeIndex] as any).src} alt={(items[activeIndex] as any).alt} />
            ) : (
              <video
                className="lightbox-media"
                src={(items[activeIndex] as any).src}
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
