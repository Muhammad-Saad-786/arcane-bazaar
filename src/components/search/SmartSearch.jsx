import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSearch, HiOutlineX, HiOutlineFire } from "react-icons/hi";
import useSearchStore from "../../stores/useSearchStore";
import useCurrencyStore from "../../stores/useCurrencyStore";
import Skeleton from "../ui/Skeleton";

const categoryIcons = {
  account: "👤",
  topup: "💎",
  boosting: "📈",
  currency: "💰",
  items: "🎁",
  coaching: "🎓",
  service: "⚙️",
};

export default function SmartSearch() {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { formatPrice } = useCurrencyStore();

  const {
    query,
    results,
    popularGames,
    popularCategories,
    loading,
    showResults,
    setQuery,
    search,
    clearSearch,
    closeResults,
    fetchPopularItems,
  } = useSearchStore();

  useEffect(() => {
    fetchPopularItems();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeResults();
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        closeResults();
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(query.trim())}`);
      closeResults();
    }
  };

  const handleItemClick = () => {
    closeResults();
    clearSearch();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (query.length === 0) setQuery("");
            }}
            placeholder="Search games, accounts, items..."
            className="w-full bg-arcane-surface border border-arcane-border rounded-2xl pl-12 pr-12 py-3 text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 focus:ring-2 focus:ring-arcane-purple/20 transition-all text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-arcane-border transition-all"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          )}
          {!query && !focused && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
              <kbd className="px-2 py-0.5 text-[10px] text-text-muted bg-arcane-border rounded-md">
                Ctrl+K
              </kbd>
            </div>
          )}
        </div>
      </form>

      {/* Results Dropdown */}
      <AnimatePresence>
        {(showResults || focused) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-arcane-elevated border border-arcane-border rounded-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto"
          >
            {query.length >= 2 ? (
              /* Search Results */
              <div className="p-2">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center">
                    <HiOutlineSearch className="w-10 h-10 text-text-muted mx-auto mb-3" />
                    <p className="text-text-secondary text-sm">
                      No results found for "{query}"
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      Try different keywords
                    </p>
                  </div>
                ) : (
                  <>
                    {results.map((item) => (
                      <Link
                        key={item.id}
                        to={`/listing/${item.id}`}
                        onClick={handleItemClick}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-arcane-surface transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-arcane-surface overflow-hidden flex-shrink-0">
                          {item.images?.[0]?.url ? (
                            <img
                              src={item.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              {item.game?.icon || "🎮"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-arcane-gold-light transition-colors">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-text-muted">
                              {item.game?.name}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-arcane-border text-text-muted capitalize">
                              {item.category?.type}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-arcane-gold flex-shrink-0">
                          {formatPrice(item.price)}
                        </span>
                      </Link>
                    ))}
                    <Link
                      to={`/marketplace?search=${encodeURIComponent(query)}`}
                      onClick={handleItemClick}
                      className="flex items-center justify-center gap-2 p-3 mt-2 rounded-xl bg-arcane-purple/10 text-arcane-purple hover:bg-arcane-purple/20 transition-all text-sm font-medium"
                    >
                      View all results for "{query}"
                    </Link>
                  </>
                )}
              </div>
            ) : (
              /* Popular Items Grid */
              <div className="p-3">
                {/* Popular Games */}
                {popularGames.length > 0 && (
                  <div className="mb-4">
                    <p className="px-2 py-1.5 text-xs text-text-muted uppercase tracking-wider flex items-center gap-2">
                      <HiOutlineFire className="w-3 h-3 text-arcane-gold" />
                      Popular Games
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {popularGames.map((game) => (
                        <Link
                          key={game.id}
                          to={`/marketplace?game=${game.slug}`}
                          onClick={handleItemClick}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-arcane-surface transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-arcane-surface flex items-center justify-center overflow-hidden">
                            {game.icon ? (
                              <img
                                src={game.icon}
                                alt=""
                                className="w-7 h-7 object-contain"
                              />
                            ) : (
                              <span className="text-lg font-bold text-arcane-purple">
                                {game.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-secondary text-center leading-tight group-hover:text-white transition-colors">
                            {game.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Categories */}
                {popularCategories.length > 0 && (
                  <div>
                    <p className="px-2 py-1.5 text-xs text-text-muted uppercase tracking-wider">
                      Popular Categories
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {popularCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/marketplace?game=${cat.game?.slug}&category=${cat.slug}`}
                          onClick={handleItemClick}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-arcane-surface transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-arcane-surface flex items-center justify-center text-lg">
                            {categoryIcons[cat.type] || "📦"}
                          </div>
                          <span className="text-[11px] text-text-secondary text-center leading-tight group-hover:text-white transition-colors">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
