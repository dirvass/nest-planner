import React, { useMemo, useState, useEffect, useCallback } from "react";
import TopNav from "./components/TopNav";

/* ---------- Media list: add/remove items here ---------- */
type Media =
  | { id: string; type: "image"; src: string; alt: string; thumb?: string }
  | { id: string; type: "video"; src: string; alt: string; poster?: string };

const MEDIA: Media[] = [
  // Photos (use your new files)
  { id: "img-01", type: "image", src: "/media/home-view.jpg", alt: "Home view over the sea" },
  { id: "img-02", type: "image", src: "/media/manzara.jpg", alt: "Scenic valley and sea panorama" },
  { id: "img-03", type: "image", src: "/media/villa-01.jpg", alt: "Villa exterior with pool" },
  { id: "img-04", type: "image", src: "/media/villa-02.jpg", alt: "Garden and terrace" },
  { id: "img-05", type: "image", src: "/media/villa-03.jpg", alt: "Poolside seating at sunset" },
  { id: "img-06", type: "image", src: "/media/villa-livingroom.jpg", alt: "Modern living room" },
  { id: "img-07", type: "image", src: "/media/villa-master-bedroom.jpg", alt: "Master bedroom with balcony" },

  // Video (poster will be shown in the grid)
  { id: "vid-01", type: "video", src: "/media/tour-01.mp4", poster: "/media/tour-01-poster.jpg", alt: "Property tour" },
];

type Filter = "all" | "photos" | "videos";

/* ---------- Page ---------- */
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

  // keyboard nav for the lightbox
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
      {/* HERO (matches other pages) */}
      <header className="header">
        <TopNav />
        <div className="header-inner" style={{ textAlign: "center" }}>
          <span className="badge">by Ahmed Said Dizman</span>
          <h1 className="hero-title">Gallery</h1>
          <p className="hero-subtitle">Photos and videos of NEST ULASLI</p>

          {/* Filter pills */}
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
                onKeyDown={(e) => { if (e.key === "Enter") open(item.id); }}
                tabIndex={0}
                aria-label={`${item.type === "image" ? "Image" : "Video"}: ${item.alt}`}
              >
                {item.type === "image" ? (
                  <img className="media-thumb" src={item.src} alt={item.alt} loading="lazy" />
                ) : (
                  <div className="video-thumb" aria-label={`${item.alt} - tap to play`}>
                    <img src={item.poster || "/hero.jpg"} alt={item.alt} loading="lazy" />
                    {/* Fallback link: opens MP4 in new tab if lightbox fails */}
                    <a
                      className="play-badge"
                      href={item.src}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Open video in a new tab"
                    >
                      ▶
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* LIGHTBOX */}
      {activeIndex >= 0 && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close} style={{ zIndex: 9999 }}>
          <button className="lightbox-close" aria-label="Close" onClick={close}>×</button>
          <button className="lightbox-nav prev" aria-label="Previous" onClick={e => { e.stopPropagation(); go(-1); }}>‹</button>
          <button className="lightbox-nav next" aria-label="Next" onClick={e => { e.stopPropagation(); go(1); }}>›</button>

          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            {items[activeIndex].type === "image" ? (
              <img className="lightbox-media" src={(items[activeIndex] as any).src} alt={(items[activeIndex] as any).alt} />
            ) : (
              <video
                className="lightbox-media"
                poster={(items[activeIndex] as any).poster}
                controls
                playsInline
                preload="metadata"
              >
                <source src={(items[activeIndex] as any).src} type="video/mp4" />
                Your browser cannot play this video.{" "}
                <a href={(items[activeIndex] as any).src} target="_blank" rel="noreferrer">Open in a new tab</a>.
              </video>
            )}
            <div className="lightbox-caption">{items[activeIndex].alt}</div>
          </div>
        </div>
      )}
    </>
  );
}
