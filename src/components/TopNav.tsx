import React from "react";

/** Luxury pill navigation used across all pages (Home, Planner, Booking) */
export default function TopNav() {
  return (
    <div className="nav-buttons" role="navigation" aria-label="Primary">
      <a href="/" className="nav-btn dark" aria-label="Go to Home">Home</a>
      <a href="/planner" className="nav-btn dark" aria-label="Go to Planner">Planner</a>
      <a href="/book" className="nav-btn primary" aria-label="Go to Booking">
        Booking
      </a>
    </div>
  );
}
