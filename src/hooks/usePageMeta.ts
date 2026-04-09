import { useEffect } from "react";
import { useLanguage, Locale } from "../i18n/LanguageContext";

const OG_IMAGE = "/media/dis-mekan/kus-bakisi-gunduz-ai-render.jpg";

const LOCALE_MAP: Record<Locale, string> = {
  en: "en_US",
  tr: "tr_TR",
  de: "de_DE",
  ar: "ar_SA",
};

const HREFLANG_MAP: Record<Locale, string> = {
  en: "en",
  tr: "tr",
  de: "de",
  ar: "ar",
};

const SUPPORTED_LOCALES: Locale[] = ["en", "tr", "de", "ar"];

/** Set or create a <meta> tag by attribute selector */
function setMeta(attr: string, value: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr.includes("property") ? "property" : "name", value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Sets document.title and SEO / Open Graph meta tags using translated strings.
 * Cleans up OG tags on unmount so page-specific tags don't bleed across routes.
 */
export function usePageMeta(titleKey: string, descKey: string) {
  const { t, locale } = useLanguage();

  useEffect(() => {
    const title = t(titleKey);
    const desc = t(descKey);

    // Document title
    document.title = title;

    // Standard meta
    setMeta("name", "description", desc);

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", window.location.href);
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("property", "og:locale", LOCALE_MAP[locale] ?? "en_US");

    // Hreflang links for multilingual SEO
    const basePath = window.location.pathname;
    const baseOrigin = window.location.origin;
    // Remove old hreflang links
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    // Add one for each supported locale
    for (const loc of SUPPORTED_LOCALES) {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = HREFLANG_MAP[loc];
      link.href = `${baseOrigin}${basePath}?lang=${loc}`;
      document.head.appendChild(link);
    }
    // x-default (fallback)
    const xdef = document.createElement("link");
    xdef.rel = "alternate";
    xdef.hreflang = "x-default";
    xdef.href = `${baseOrigin}${basePath}`;
    document.head.appendChild(xdef);

    // Cleanup: reset to defaults on unmount
    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
      document.title = "VERDE Ulaşlı — Agro-Luxury Villa Estate";
      setMeta("name", "description", "Turkey's first agro-luxury villa estate. Two private villas on 5,500 m² of living land in Kocaeli.");
      setMeta("property", "og:title", "VERDE Ulaşlı — Agro-Luxury Villa Estate");
      setMeta("property", "og:description", "Turkey's first agro-luxury villa estate. Two private villas on 5,500 m² of living land in Kocaeli.");
      setMeta("property", "og:locale", "en_US");
    };
  }, [t, titleKey, descKey, locale]);
}
