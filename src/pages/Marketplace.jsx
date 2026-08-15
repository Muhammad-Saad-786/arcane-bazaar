import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineLightningBolt,
  HiOutlineStar,
} from "react-icons/hi";
import useMarketplaceStore from "../stores/useMarketplaceStore";
import GameSelector from "../components/games/GameSelector";
import ListingCard from "../components/listings/ListingCard";
import SEO from "../components/ui/SEO";

const sortOptions = [
  { value: "newest", label: "Newest" },
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

const SkeletonCard = () => (
  <div className="rounded-xl bg-arcane-surface border border-arcane-border overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-arcane-surface" />
    <div className="p-3 space-y-2">
      <div className="h-3 w-3/4 rounded bg-arcane-surface" />
      <div className="h-3 w-1/2 rounded bg-arcane-surface" />
      <div className="flex justify-between">
        <div className="h-4 w-16 rounded bg-arcane-surface" />
        <div className="h-3 w-10 rounded bg-arcane-surface" />
      </div>
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
    {Array.from({ length: 10 }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const {
    listings,
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

  const isInitialMount = useRef(true);

  // Initial load - set filters directly without triggering multiple fetches
  useEffect(() => {
    const init = async () => {
      await fetchGames();
      await fetchCategories();

      const game = searchParams.get("game");
      const category = searchParams.get("category");
      const search = searchParams.get("search");

      // Set all filters at once using setState directly
      useMarketplaceStore.setState((state) => ({
        filters: {
          ...state.filters,
          game: game || "",
          category: category || "",
          search: search || "",
        },
        currentPage: 1,
      }));

      // Fetch listings with the updated filters
      await fetchListings();
    };
    init();
  }, []);

  // Fetch on filter/page changes (skip first render)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchListings();
  }, [filters, currentPage]);

  // Fetch categories when game changes
  useEffect(() => {
    if (filters.game) fetchCategories(filters.game);
  }, [filters.game]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const ranks = filters.game
    ? gameRanks[filters.game] || gameRanks.default
    : gameRanks.default;

  const handleGameSelect = (slug) => {
    if (!slug || slug === "all") {
      setFilter("game", "");
      setFilter("category", "");
      setFilter("type", "");
    } else {
      setFilter("game", slug);
      setFilter("category", "");
      setFilter("type", "");
    }
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-arcane-dark pt-20 pb-16">
      <SEO
        title="Marketplace"
        description="Browse 135+ games. Find the best deals on gaming accounts, currency, and items."
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header - Compact */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Marketplace
          </h1>
          <p className="text-text-muted text-xs mt-0.5">
            {totalCount.toLocaleString()} listings
          </p>
        </div>

        {/* Game Selector - Compact */}
        <div className="mb-4">
          <GameSelector
            selected={filters.game}
            onSelect={handleGameSelect}
            showAll
          />
        </div>

        {/* Search Bar - Single Row */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Search games, items..."
              className="w-full bg-arcane-surface border border-arcane-border rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 transition-all"
            />
          </div>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilter("sortBy", e.target.value)}
            className="bg-arcane-surface border border-arcane-border rounded-lg px-3 py-2.5 text-sm text-white outline-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value} className="bg-arcane-dark">
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {filters.game && (
            <button
              onClick={() => {
                setFilter("game", "");
                setFilter("category", "");
                setFilter("type", "");
                fetchListings();
              }}
              className="px-2.5 py-1 rounded-full text-xs bg-arcane-purple/20 text-arcane-purple border border-arcane-purple/30 flex items-center gap-1"
            >
              <HiOutlineX className="w-3 h-3" /> Clear
            </button>
          )}
          <button
            onClick={() => setFilter("featured", !filters.featured)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${filters.featured ? "bg-arcane-gold/20 text-arcane-gold border border-arcane-gold/30" : "bg-arcane-surface border border-arcane-border text-text-muted hover:text-white"}`}
          >
            <HiOutlineStar className="w-3 h-3" /> Featured
          </button>
          <button
            onClick={() =>
              setFilter("instantDelivery", !filters.instantDelivery)
            }
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${filters.instantDelivery ? "bg-arcane-gold/20 text-arcane-gold border border-arcane-gold/30" : "bg-arcane-surface border border-arcane-border text-text-muted hover:text-white"}`}
          >
            <HiOutlineLightningBolt className="w-3 h-3" /> Instant
          </button>
        </div>

        {/* Listings Grid - Compact like Eldorado */}
        <div>
          {loading ? (
            <SkeletonGrid />
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-muted text-base">No listings found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-6">
                  <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-xs text-white bg-arcane-surface hover:bg-arcane-border disabled:opacity-30"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, currentPage - 3), currentPage + 2)
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium ${currentPage === page ? "bg-arcane-purple text-white" : "text-white bg-arcane-surface hover:bg-arcane-border"}`}
                      >
                        {page}
                      </button>
                    ))}
                  <button
                    onClick={() =>
                      setPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg text-xs text-white bg-arcane-surface hover:bg-arcane-border disabled:opacity-30"
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
  );
}
