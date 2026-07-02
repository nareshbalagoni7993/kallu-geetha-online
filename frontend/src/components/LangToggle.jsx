import { useLang } from '../context/LanguageContext';

export default function LangToggle({ dark = false }) {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      title={lang === 'en' ? 'తెలుగులో చదవండి' : 'Switch to English'}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 select-none ${
        dark
          ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
          : 'bg-green-50 hover:bg-green-100 text-green-800 border border-green-200'
      }`}
    >
      <span className="text-sm">{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
      <span>{lang === 'en' ? 'తెలుగు' : 'ENG'}</span>
    </button>
  );
}
