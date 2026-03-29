import React from "react";
import { Link } from "react-router-dom";
import TopNav from "./components/TopNav";
import { useLanguage } from "./i18n/LanguageContext";
import "./styles/NotFoundPage.css";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="nf-page">
      <TopNav />
      <div className="nf-content">
        <span className="nf-code">404</span>
        <h1 className="nf-title">{t("notFound.title")}</h1>
        <p className="nf-subtitle">{t("notFound.subtitle")}</p>
        <Link to="/" className="nf-cta">{t("notFound.cta")}</Link>
      </div>
    </div>
  );
}
