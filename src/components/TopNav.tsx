import React from "react";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSelector from "./LanguageSelector";

export default function TopNav() {
  const { t } = useLanguage();

  return (
    <div className="nav-buttons" role="navigation" aria-label="Primary">
      <a href="/" className="nav-btn dark">{t("nav.home")}</a>
      <a href="/planner" className="nav-btn dark">{t("nav.planner")}</a>
      <a href="/gallery" className="nav-btn dark">{t("nav.gallery")}</a>
      <a href="/book" className="nav-btn primary">{t("nav.booking")}</a>
      <LanguageSelector />
    </div>
  );
}
