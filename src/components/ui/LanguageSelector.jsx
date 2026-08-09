import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineChevronDown,
  HiOutlineCheck,
  HiOutlineGlobe,
} from "react-icons/hi";
import useLanguageStore from "../../stores/useLanguageStore";

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { languages, currentLang, setLanguage, getCurrentLanguage } =
    useLanguageStore();
  const current = getCurrentLanguage();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-arcane-surface border border-arcane-border hover:border-arcane-purple/30 transition-all text-sm"
      >
        <HiOutlineGlobe className="w-4 h-4 text-text-muted" />
        <span className="text-text-secondary text-xs font-medium hidden sm:inline">
          {current?.code.toUpperCase()}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-arcane-elevated border border-arcane-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    currentLang === lang.code
                      ? "bg-arcane-purple/20 text-white"
                      : "text-text-secondary hover:bg-arcane-surface hover:text-white"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.name}</span>
                  {currentLang === lang.code && (
                    <HiOutlineCheck className="w-4 h-4 text-arcane-purple" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
