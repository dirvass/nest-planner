import React from "react";
import "./styles.css";

export default function Home() {
  return (
    <header className="header">
      <div className="header-inner">
        <span className="badge">by Ahmed Said Dizman</span>

        <h1 className="hero-title">NEST ULASLI</h1>
        <p className="hero-subtitle">
          Annual Profit Planner – villa gelir–gider ve ROI senaryoları
        </p>

        {/* 👇 net, belirgin, modern CTA’lar */}
        <nav className="hero-cta" aria-label="Primary">
          <a href="/" className="hero-btn ghost">Home</a>
          <a href="/planner" className="hero-btn">Planner</a>
          <a href="/book" className="hero-btn primary">Book &amp; Enquire</a>
        </nav>
      </div>
    </header>
  );
}
