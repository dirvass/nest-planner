import React from "react";

export default function Home() {
  return (
    <header className="header">
      {/* HERO NAV – centered, pill buttons */}
      <div className="nav-buttons nav-buttons--hero">
        <a href="/" className="nav-btn dark">Home</a>
        <a href="/planner" className="nav-btn dark">Planner</a>
        <a href="/book" className="nav-btn primary">Book & Enquire</a>
      </div>

      <div className="header-inner">
        <span className="badge">by Ahmed Said Dizman</span>
        <h1 className="hero-title">NEST ULASLI</h1>
        <p className="hero-subtitle">
          Annual Profit Planner - villa gelir–gider ve ROI senaryoları
        </p>
      </div>
    </header>
  );
}
