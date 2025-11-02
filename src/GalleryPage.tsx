import React, { useMemo, useState, useEffect, useCallback } from "react";
import TopNav from "./components/TopNav";

type Media =
  | { id: string; type: "image"; src: string; thumb?: string; alt: string }
  | { id: string; type: "video"; src: string; poster?: string; alt: string };

const MEDIA: Media[] = [
  // ---- IMAGES ----
  { id: "img-1", type: "image", src: "/media/villa-01.jpg", alt: "Infinity pool with sea view" },
  { id: "img-2", type: "image", src: "/media/villa-02.jpg", alt: "Master bedroom with balcony" },
  { id: "img-3", type: "image", src: "/media/villa-03.jpg", alt: "Sunset over the valley" },
  { id: "img-4", type: "image", src: "/media/villa-04.jpg", alt: "Modern kitchen and island" },
  // ---- VIDEOS ----
  { id: "vid-1", type: "video", src: "/media/tour-01.mp4", poster: "/media/tour-01-poster.jpg", alt: "Property tour video 1" },
  { id: "vid-2", type: "video", src: "/media/tour-02.mp4", poster: "/media/tour-02-poster.jpg", alt: "Property tour video 2" },
];

type Filter = "all" | "photos" | "videos";

export default function GalleryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const items = useMemo(() => {
    if (filter === "photos") return MEDIA.filter(m => m.type === "image");
    if (filter === "videos") return MEDIA.filter(m => m.type === "video");
    return MEDIA;
  }, [filter]);

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
      {/* HERO (same structure as other pages) */}
      <header className="header">
        <TopNav />
        <div className="header-inner" style={{ textAlign: "center" }}>
          <span className="badge">by Ahmed Said Dizman</span>
          <h1 className="hero-title">Gallery</h1>
          <p className="hero-subtitle">Photos and videos of NEST ULASLI</p>

          {/* Filter pills shown on the hero for a premium look */}
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

      {/* CONTENT */}
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
                  <img className="media-thumb" src={item.thumb || item.src} alt={item.alt} loading="lazy" />
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
