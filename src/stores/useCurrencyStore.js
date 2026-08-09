import { create } from "zustand";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
];

// Approximate exchange rates (update with real API later)
const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  PHP: 56.5,
  IDR: 15700,
  MYR: 4.65,
  PKR: 278,
  AUD: 1.52,
  CAD: 1.36,
  SGD: 1.34,
};

const useCurrencyStore = create((set, get) => ({
  currencies,
  selectedCurrency: (() => {
    try {
      return localStorage.getItem("arcane_currency") || "USD";
    } catch {
      return "USD";
    }
  })(),

  setCurrency: (code) => {
    localStorage.setItem("arcane_currency", code);
    set({ selectedCurrency: code });
  },

  convertPrice: (usdPrice, toCurrency) => {
    const target = toCurrency || get().selectedCurrency;
    const rate = exchangeRates[target] || 1;
    return usdPrice * rate;
  },

  formatPrice: (usdPrice, toCurrency) => {
    const target = toCurrency || get().selectedCurrency;
    const converted = get().convertPrice(usdPrice, target);
    const currency = currencies.find((c) => c.code === target);

    if (target === "IDR" || target === "PKR") {
      return `${currency?.symbol || ""} ${Math.round(converted).toLocaleString()}`;
    }
    return `${currency?.symbol || ""}${converted.toFixed(2)}`;
  },

  getCurrencySymbol: (code) => {
    const currency = currencies.find(
      (c) => c.code === (code || get().selectedCurrency),
    );
    return currency?.symbol || "$";
  },
}));

export default useCurrencyStore;
