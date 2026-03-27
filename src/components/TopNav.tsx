import React from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSelector from "./LanguageSelector";

// Public nav — /planner and /admin accessible via direct link only
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

  return (
    <div className="nav-buttons" role="navigation" aria-label="Primary">
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
  );
}
