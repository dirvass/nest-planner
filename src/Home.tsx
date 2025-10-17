import React from "react";
import "./styles.css";

export default function Home() {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand badge */}
        <span className="badge">by Dizman</span>

        {/* Hero title & subtitle */}
        <h1 className="hero-title">NEST ULAŞLI</h1>
        <p className="hero-subtitle">
          Private luxury villas overlooking the sea - experience serenity,
          exclusivity, and design at its finest.
        </p>

        {/* ✅ Modern glassy call-to-action buttons */}
        <div className="hero-cta">
          <a href="/" className="hero-btn ghost">Home</a>
          <a href="/planner" className="hero-btn">Planner</a>
          <a href="/book" className="hero-btn primary">Book & Enquire</a>
        </div>
      </div>
    </header>
  );
}
