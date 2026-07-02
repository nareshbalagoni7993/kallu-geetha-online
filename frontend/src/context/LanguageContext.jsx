import { createContext, useContext, useState } from 'react';
import en from '../locales/en';
import te from '../locales/te';

const LANGS = { en, te };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  const toggle = () => {
    const next = lang === 'en' ? 'te' : 'en';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const t = (key) => LANGS[lang]?.[key] || LANGS.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
