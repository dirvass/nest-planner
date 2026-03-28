import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSelector from "./LanguageSelector";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/story", key: "nav.story" },
  { href: "/experience", key: "nav.experience" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/book", key: "nav.booking" },
];

export default function TopNav() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Desktop nav ── */}
      <div className="nav-desktop" role="navigation" aria-label="Primary">
        {LINKS.map((l) => {
          const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
          return (
            <a key={l.href} href={l.href} className={`nav-btn ${active ? "primary" : "dark"}`}>
              {t(l.key)}
            </a>
          );
        })}
        <LanguageSelector />
      </div>

      {/* ── Mobile hamburger ── */}
      <button
        className={`nav-hamburger ${open ? "nav-hamburger--open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      {/* ── Mobile overlay menu ── */}
      <div className={`nav-mobile ${open ? "nav-mobile--open" : ""}`}>
        <div className="nav-mobile__inner">
          <span className="nav-mobile__brand">VERDE</span>
          <nav className="nav-mobile__links">
            {LINKS.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={`nav-mobile__link ${active ? "nav-mobile__link--active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {t(l.key)}
                </a>
              );
            })}
          </nav>
          <div className="nav-mobile__lang">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </>
  );
}
