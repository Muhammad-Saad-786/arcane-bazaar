import { create } from "zustand";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ph", name: "Filipino", flag: "🇵🇭" },
  { code: "my", name: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

const useLanguageStore = create((set, get) => ({
  languages,
  currentLang: (() => {
    try {
      return localStorage.getItem("arcane_lang") || "en";
    } catch {
      return "en";
    }
  })(),

  setLanguage: (code) => {
    localStorage.setItem("arcane_lang", code);
    set({ currentLang: code });
  },

  getCurrentLanguage: () => {
    const code = get().currentLang;
    return languages.find((l) => l.code === code) || languages[0];
  },
}));

export default useLanguageStore;
