import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import en from "./en.json";
import tr from "./tr.json";
import ar from "./ar.json";

export type Locale = "en" | "tr" | "ar";

const TRANSLATIONS: Record<Locale, Record<string, any>> = { en, tr, ar };
const STORAGE_KEY = "verde-lang";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<Ctx>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return (saved === "tr" || saved === "ar") ? saved : "en";
  });

  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let val: any = TRANSLATIONS[locale];
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) return key;
    }
    if (typeof val !== "string") return key;
    if (params) {
      return val.replace(/\{\{(\w+)\}\}/g, (_: string, name: string) =>
        params[name] !== undefined ? String(params[name]) : `{{${name}}}`
      );
    }
    return val;
  }, [locale]);

  const ctx = useMemo(() => ({ locale, setLocale, t, dir }), [locale, setLocale, t, dir]);

  return <LanguageContext.Provider value={ctx}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
