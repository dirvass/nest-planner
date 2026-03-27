import React from "react";
import { useLanguage } from "../i18n/LanguageContext";

const NAV = [
  { href: "/", key: "nav.home" },
  { href: "/story", key: "nav.story" },
  { href: "/experience", key: "nav.experience" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/book", key: "nav.booking" },
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__logo">VERDE ULAŞLI</span>
          <p className="site-footer__tagline">{t("footer.tagline")}</p>
        </div>
        <div className="site-footer__col">
          <h4 className="site-footer__heading">{t("footer.nav")}</h4>
          <nav className="site-footer__nav">
            {NAV.map((l) => (
              <a key={l.href} href={l.href} className="site-footer__link">{t(l.key)}</a>
            ))}
          </nav>
        </div>
        <div className="site-footer__col">
          <h4 className="site-footer__heading">{t("footer.contact")}</h4>
          <a href={`mailto:${t("footer.email")}`} className="site-footer__link">{t("footer.email")}</a>
          <a href={`tel:${t("footer.phone").replace(/\s/g, "")}`} className="site-footer__link">{t("footer.phone")}</a>
          <span className="site-footer__link">{t("footer.hours")}</span>
          <span className="site-footer__link">{t("footer.location")}</span>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>{t("footer.copy")}</span>
      </div>
    </footer>
  );
}
