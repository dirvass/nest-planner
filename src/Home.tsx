import React from "react";

export default function Home() {
  return (
    <header className="header">
      <div className="header-inner">
        <span className="badge">by Ahmed Said Dizman</span>
        <h1 className="hero-title">NEST ULASLI</h1>

        <div className="hero-buttons">
          <a href="/planner" className="hero-btn">Planner</a>
          <a href="/book" className="hero-btn primary">Book & Enquire</a>
        </div>
      </div>
    </header>
  );
}
