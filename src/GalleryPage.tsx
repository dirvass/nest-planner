import { useCallback, useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav";

type Media =
  | {
      id: string;
      type: "image";
      src: string;
      alt: string;
      category: string;
    }
  | {
      id: string;
      type: "video";
      src: string;
      poster?: string;
      alt: string;
      category: string;
    };

const MEDIA: Media[] = [
  // ---------------- MAIN VILLA ----------------
  {
    id: "villa-01",
    type: "image",
    src: "/media/villa-01.jpg",
    alt: "Main villa exterior 01",
    category: "Main Villa",
  },
  {
    id: "villa-02",
    type: "image",
    src: "/media/villa-02.jpg",
    alt: "Main villa exterior 02",
    category: "Main Villa",
  },
  {
    id: "villa-03",
    type: "image",
    src: "/media/villa-03.jpg",
    alt: "Main villa exterior 03",
    category: "Main Villa",
  },

  // ---------------- VILLA RENDER ----------------
  {
    id: "vr-ana-yol",
    type: "image",
    src: "/media/villa-render/ANA-YOL.jpg",
    alt: "Villa render - Ana yol",
    category: "Villa Render",
  },
  {
    id: "vr-arka-gorunum",
    type: "image",
    src: "/media/villa-render/ARKA-GORUNUM.jpg",
    alt: "Villa render - Arka görünüm",
    category: "Villa Render",
  },
  {
    id: "vr-ates-cukuru",
    type: "image",
    src: "/media/villa-render/ATES-CUKURU.jpg",
    alt: "Villa render - Ateş çukuru",
    category: "Villa Render",
  },
  {
    id: "vr-kus-bakisi",
    type: "image",
    src: "/media/villa-render/KUS-BAKISI.jpg",
    alt: "Villa render - Kuş bakışı",
    category: "Villa Render",
  },
  {
    id: "vr-satranc",
    type: "image",
    src: "/media/villa-render/SATRANC.jpg",
    alt: "Villa render - Satranç alanı",
    category: "Villa Render",
  },
  {
    id: "vr-satranc-2",
    type: "image",
    src: "/media/villa-render/SATRANC-2.jpg",
    alt: "Villa render - Satranç alanı 2",
    category: "Villa Render",
  },
  {
    id: "vr-yan-aci",
    type: "image",
    src: "/media/villa-render/YAN-ACI.jpg",
    alt: "Villa render - Yan açı",
    category: "Villa Render",
  },
  {
    id: "vr-yan-aci-2",
    type: "image",
    src: "/media/villa-render/YAN-ACI2.jpg",
    alt: "Villa render - Yan açı 2",
    category: "Villa Render",
  },
];

type FilterType = "all" | "photos" | "videos";

export default function GalleryPage() {
  const [category, setCategory] = useState("All");
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(MEDIA.map((m) => m.category)))],
    []
  );

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

  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  return (
    <>
      <header className="header">
        <TopNav />
        <div className="header-inner" style={{ textAlign: "centre" }}>
          <h1 className="hero-title">Gallery</h1>
          <p className="hero-subtitle">Photos and videos of Nest Ulasli</p>

          <div className="segmented" style={{ marginTop: 16 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`seg-btn ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="segmented" style={{ marginTop: 10 }}>
            <button
              className={`seg-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`seg-btn ${filter === "photos" ? "active" : ""}`}
              onClick={() => setFilter("photos")}
            >
              Photos
            </button>
            <button
              className={`seg-btn ${filter === "videos" ? "active" : ""}`}
              onClick={() => setFilter("videos")}
            >
              Videos
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="gallery-grid">
          {items.map((item) => (
            <article
              key={item.id}
              className="media-card"
              onClick={() => open(item.id)}
            >
              <img className="media-thumb" src={item.src} alt={item.alt} />
            </article>
          ))}
        </div>
      </main>

      {activeItem && (
        <div className="lightbox" onClick={close}>
          <button className="lightbox-close" onClick={close}>
            ×
          </button>

          <button
            className="lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            ‹
          </button>

          <button
            className="lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            ›
          </button>

          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img
              className="lightbox-media"
              src={activeItem.src}
              alt={activeItem.alt}
            />
            <div className="lightbox-caption">{activeItem.alt}</div>
          </div>
        </div>
      )}
    </>
  );
}
