import React from "react";
import TopNav from "./components/TopNav";

export default function Home() {
  return (
    <header className="header">
      <TopNav />
      <div className="header-inner" style={{ textAlign: "center" }}>
        <span className="badge">by Ahmed Said Dizman</span>
        <h1 className="hero-title">NEST ULASLI</h1>
        <p className="hero-subtitle">
          Annual Profit Planner - villa gelir–gider ve ROI senaryoları
        </p>
        <div className="hero-buttons" aria-hidden />
      </div>
    </header>
  );
}
