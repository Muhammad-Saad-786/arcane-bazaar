import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineChevronDown, HiOutlineCheck } from "react-icons/hi";
import useCurrencyStore from "../../stores/useCurrencyStore";

export default function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currencies, selectedCurrency, setCurrency } = useCurrencyStore();
  const current = currencies.find((c) => c.code === selectedCurrency);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-arcane-surface border border-arcane-border hover:border-arcane-purple/30 transition-all text-sm"
      >
        <span>{current?.flag}</span>
        <span className="text-text-secondary">{current?.code}</span>
        <HiOutlineChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-arcane-elevated border border-arcane-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2">
              <p className="px-3 py-2 text-xs text-text-muted uppercase tracking-wider">
                Select Currency
              </p>
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    setCurrency(currency.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    selectedCurrency === currency.code
                      ? "bg-arcane-purple/20 text-white"
                      : "text-text-secondary hover:bg-arcane-surface hover:text-white"
                  }`}
                >
                  <span className="text-lg">{currency.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{currency.code}</p>
                    <p className="text-xs text-text-muted">{currency.name}</p>
                  </div>
                  {selectedCurrency === currency.code && (
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
