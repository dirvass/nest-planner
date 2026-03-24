import React, { useEffect, useState } from "react";
import TopNav from "./components/TopNav";

export default function Home() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after mount
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <header className={`home-hero ${visible ? "home-hero--visible" : ""}`}>
        {/* Slow zoom background */}
        <div className="home-hero__bg" aria-hidden="true" />

        {/* Gradient overlays */}
        <div className="home-hero__overlay" aria-hidden="true" />

        <TopNav />

        <div className="home-hero__content">
          <span className="home-hero__badge">Kocaeli, Ulasli</span>
          <h1 className="home-hero__title">NEST</h1>
          <p className="home-hero__tagline">Where nature meets luxury</p>
          <div className="home-hero__divider" />
          <p className="home-hero__subtitle">
            Private villas with infinity pool, sauna &amp; panoramic views
          </p>
          <div className="home-hero__actions">
            <a href="/book" className="home-hero__cta">Reserve Your Stay</a>
            <a href="/gallery" className="home-hero__cta home-hero__cta--ghost">View Gallery</a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="home-hero__scroll" aria-hidden="true">
          <span>Scroll</span>
          <div className="home-hero__scroll-line" />
        </div>
      </header>

      {/* Minimal feature strip below hero */}
      <section className={`home-features ${visible ? "home-features--visible" : ""}`}>
        <div className="home-features__grid">
          <div className="home-features__item">
            <span className="home-features__number">1000m&sup2;</span>
            <span className="home-features__label">Private Garden</span>
          </div>
          <div className="home-features__divider" />
          <div className="home-features__item">
            <span className="home-features__number">10&times;5m</span>
            <span className="home-features__label">Infinity Pool</span>
          </div>
          <div className="home-features__divider" />
          <div className="home-features__item">
            <span className="home-features__number">3</span>
            <span className="home-features__label">En-suite Bedrooms</span>
          </div>
          <div className="home-features__divider" />
          <div className="home-features__item">
            <span className="home-features__number">12</span>
            <span className="home-features__label">Guests</span>
          </div>
        </div>
      </section>
    </>
  );
}
