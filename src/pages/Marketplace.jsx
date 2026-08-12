// Baackup
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineFire,
  HiOutlineLightningBolt,
  HiOutlineStar,
} from "react-icons/hi";
import useMarketplaceStore from "../stores/useMarketplaceStore";
import useCurrencyStore from "../stores/useCurrencyStore";
import GameSelector from "../components/games/GameSelector";
import ListingCard from "../components/listings/ListingCard";
import SEO from "../components/ui/SEO";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import useSEOContentStore from "../stores/useSEOContentStore";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

const gameRanks = {
  "mobile-legends": [
    "Warrior",
    "Elite",
    "Master",
    "Grandmaster",
    "Epic",
    "Legend",
    "Mythic",
    "Mythical Honor",
    "Mythical Glory",
    "Mythical Immortal",
  ],
  valorant: [
    "Iron",
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Ascendant",
    "Immortal",
    "Radiant",
  ],
  "league-of-legends": [
    "Iron",
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Emerald",
    "Diamond",
    "Master",
    "Grandmaster",
    "Challenger",
  ],
  cs2: [
    "Silver",
    "Gold Nova",
    "Master Guardian",
    "Legendary Eagle",
    "Supreme",
    "Global Elite",
  ],
  default: ["Beginner", "Intermediate", "Advanced", "Expert", "Professional"],
};

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const { content: seoContent, fetchContent } = useSEOContentStore();

  const {
    listings,
    games,
    categories,
    loading,
    totalCount,
    currentPage,
    pageSize,
    filters,
    setFilter,
    resetFilters,
    fetchListings,
    fetchGames,
    fetchCategories,
    setPage,
  } = useMarketplaceStore();

  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    fetchGames();
    fetchCategories();

    // Check URL params
    const game = searchParams.get("game");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    if (game) setFilter("game", game);
    if (category) setFilter("category", category);
    if (search) setFilter("search", search);

    fetchListings();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [filters, currentPage]);

  useEffect(() => {
    if (filters.game) fetchCategories(filters.game);
  }, [filters.game]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const ranks = filters.game
    ? gameRanks[filters.game] || gameRanks.default
    : gameRanks.default;

  return (
    <div className="min-h-screen bg-arcane-dark pt-24 pb-20">
      <SEO
        title="Marketplace"
        description="Browse 135+ games. Find the best deals on gaming accounts, currency, and items."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Marketplace
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {totalCount.toLocaleString()} listings available
          </p>
        </div>

        {/* Game Selector */}
        <div className="mb-6">
          <GameSelector
            selected={filters.game}
            onSelect={(slug) => {
              setFilter("game", slug);
              setFilter("category", "");
              setFilter("type", "");
            }}
            showAll
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Search listings..."
              className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilter("sortBy", e.target.value)}
              className="bg-arcane-surface border border-arcane-border rounded-xl px-4 py-3 text-white text-sm outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                showFilters
                  ? "bg-arcane-purple/20 border-arcane-purple text-arcane-purple"
                  : "bg-arcane-surface border-arcane-border text-white"
              }`}
            >
              <HiOutlineFilter className="w-5 h-5" /> Filters
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "featured", icon: HiOutlineStar, label: "Featured" },
            {
              key: "instantDelivery",
              icon: HiOutlineLightningBolt,
              label: "Instant Delivery",
            },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key, !filters[f.key])}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                filters[f.key]
                  ? "bg-arcane-gold/20 text-arcane-gold border border-arcane-gold/30"
                  : "bg-arcane-surface border border-arcane-border text-text-muted hover:text-white"
              }`}
            >
              <f.icon className="w-3 h-3" /> {f.label}
            </button>
          ))}
          {filters.game && (
            <button
              onClick={() => {
                setFilter("game", "");
                setFilter("category", "");
              }}
              className="px-3 py-1.5 rounded-full text-xs bg-arcane-purple/20 text-arcane-purple border border-arcane-purple/30 flex items-center gap-1"
            >
              <HiOutlineX className="w-3 h-3" /> Clear Game
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-64 flex-shrink-0 hidden lg:block"
            >
              <div className="glass-card p-4 space-y-5 sticky top-24">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm">Filters</h3>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-arcane-purple hover:text-arcane-gold-light"
                  >
                    Reset
                  </button>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilter("minPrice", e.target.value)}
                      className="w-full bg-arcane-surface border border-arcane-border rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilter("maxPrice", e.target.value)}
                      className="w-full bg-arcane-surface border border-arcane-border rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {/* Rank */}
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                    Rank
                  </label>
                  <select
                    value={filters.rank}
                    onChange={(e) => setFilter("rank", e.target.value)}
                    className="w-full bg-arcane-surface border border-arcane-border rounded-lg px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="">All Ranks</option>
                    {ranks.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Server */}
                {filters.game === "mobile-legends" && (
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                      Server
                    </label>
                    <select
                      value={filters.server}
                      onChange={(e) => setFilter("server", e.target.value)}
                      className="w-full bg-arcane-surface border border-arcane-border rounded-lg px-3 py-2 text-sm text-white outline-none"
                    >
                      <option value="">All Servers</option>
                      {[
                        "SEA Server",
                        "EU Server",
                        "NA Server",
                        "MENA Server",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Category Type */}
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                    Category
                  </label>
                  <div className="space-y-1">
                    {["account", "topup", "boosting", "currency", "items"].map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() =>
                            setFilter("type", filters.type === type ? "" : type)
                          }
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                            filters.type === type
                              ? "bg-arcane-purple/20 text-arcane-purple"
                              : "text-text-muted hover:text-white hover:bg-arcane-surface"
                          }`}
                        >
                          {type}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Listings Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-muted text-lg">No listings found</p>
                <p className="text-text-muted text-sm mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl text-sm text-white bg-arcane-surface hover:bg-arcane-border disabled:opacity-30 transition-all"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, currentPage - 3), currentPage + 2)
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => setPage(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            currentPage === page
                              ? "bg-arcane-purple text-white"
                              : "text-white bg-arcane-surface hover:bg-arcane-border"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    <button
                      onClick={() =>
                        setPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl text-sm text-white bg-arcane-surface hover:bg-arcane-border disabled:opacity-30 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
