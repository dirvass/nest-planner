import React from "react";
import TopNav from "./components/TopNav";

export default function Home() {
  return (
    <header className="hero">
      {/* Top navigation */}
      <TopNav />

      {/* Hero content */}
      <div className="hero__inner">
        <span className="badge">by Ahmed Said Dizman</span>
        <h1 className="hero__title">NEST ULASLI</h1>
        <p className="hero__subtitle">
          Annual Profit Planner – villa gelir–gider ve ROI senaryoları
        </p>
        <div className="hero-buttons" aria-hidden="true" />
      </div>
    </header>
  );
}
