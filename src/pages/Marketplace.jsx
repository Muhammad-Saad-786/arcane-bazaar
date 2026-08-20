import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineLightningBolt,
  HiOutlineStar,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineCube,
  HiOutlineChevronDown,
} from "react-icons/hi";
import useMarketplaceStore from "../stores/useMarketplaceStore";
import GameSelector from "../components/games/GameSelector";
import ListingCard from "../components/listings/ListingCard";
import SEO from "../components/ui/SEO";

const sortOptions = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

const categoryTypeTabs = [
  { id: "", label: "All Offers", icon: null },
  { id: "account", label: "Accounts", icon: HiOutlineUserGroup },
  { id: "topup", label: "Top Up & Currency", icon: HiOutlineCurrencyDollar },
  { id: "boosting", label: "Boosting", icon: HiOutlineTrendingUp },
  { id: "items", label: "Items & Skins", icon: HiOutlineCube },
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
  default: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"],
};

const SkeletonCard = () => (
  <div className="rounded-2xl bg-[#18171E] border border-[#2A2932] overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-[#1E1D24]" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 w-3/4 rounded bg-[#1E1D24]" />
      <div className="h-3 w-1/2 rounded bg-[#1E1D24]" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 w-20 rounded bg-[#1E1D24]" />
        <div className="h-4 w-12 rounded bg-[#1E1D24]" />
      </div>
    </div>
  </div>
);

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    listings,
    loading,
    totalCount,
    currentPage,
    pageSize,
    filters,
    games,
    categories,
    setFilter,
    setMultipleFilters,
    resetFilters,
    resetAll,
    fetchListings,
    fetchGames,
    fetchCategories,
    setPage,
  } = useMarketplaceStore();

  // Load baseline metadata on mount
  useEffect(() => {
    fetchGames();
    fetchCategories();
  }, []);

  // Sync from URL search params into Zustand store whenever the URL changes
  useEffect(() => {
    const game = searchParams.get("game") || "";
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";

    setMultipleFilters({ game, category, type, search });
  }, [searchParams]);

  // Fetch listings whenever store filters or current page change
  useEffect(() => {
    fetchListings();
  }, [filters, currentPage]);

  // When game filter changes, re-fetch relevant subcategories
  useEffect(() => {
    if (filters.game) {
      fetchCategories(filters.game);
    }
  }, [filters.game]);

  const updateURLParams = (updatedEntries) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updatedEntries).forEach(([key, val]) => {
      if (val) {
        nextParams.set(key, val);
      } else {
        nextParams.delete(key);
      }
    });
    setSearchParams(nextParams);
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const currentGame = games.find((g) => g.slug === filters.game);
  const ranks = filters.game
    ? gameRanks[filters.game] || gameRanks.default
    : gameRanks.default;

  const handleGameSelect = (slug) => {
    const selectedSlug = !slug || slug === "all" ? "" : slug;
    setMultipleFilters({
      game: selectedSlug,
      category: "",
      server: "",
      rank: "",
      region: "",
      platform: "",
    });
    updateURLParams({ game: selectedSlug, category: "" });
  };

  const handleTypeSelect = (typeId) => {
    setMultipleFilters({
      type: typeId,
      category: "",
      serviceType: "",
      deliveryMethod: "",
    });
    updateURLParams({ type: typeId, category: "" });
  };

  const handleSubCategorySelect = (categorySlug) => {
    setFilter("category", categorySlug);
    updateURLParams({ category: categorySlug });
  };

  const activeFiltersCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.server,
    filters.rank,
    filters.region,
    filters.platform,
    filters.serviceType,
    filters.deliveryMethod,
    filters.featured,
    filters.instantDelivery,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#121118] text-white pt-24 pb-20">
      <SEO
        title={
          currentGame
            ? `${currentGame.name} For Sale  | Buy ${currentGame.name} `
            : "Gaming Marketplace"
        }
        description="Buy verified gaming accounts, currency top-ups, boosting services, and items safely on Arcane Bazaar."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Marketplace Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#2A2932]/70">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                {currentGame ? currentGame.name : "Global Marketplace"}
              </h1>
              {currentGame?.icon && (
                <img
                  src={currentGame.icon}
                  alt={currentGame.name}
                  className="w-7 h-7 object-contain rounded-lg bg-[#1E1D24] p-0.5 border border-[#2A2932]"
                />
              )}
            </div>
            <p className="text-text-muted text-xs sm:text-sm mt-1 flex items-center gap-2">
              <span className="text-arcane-gold font-semibold">
                {totalCount.toLocaleString()}
              </span>{" "}
              active listings
              <span className="inline-block w-1 h-1 rounded-full bg-[#2A2932]" />
              <span className="text-emerald-400 inline-flex items-center gap-1 font-medium">
                <HiOutlineShieldCheck className="w-4 h-4" /> Escrow & Buyer
                Protected
              </span>
            </p>
          </div>

          {/* Quick Search & Sort */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilter("search", e.target.value);
                  updateURLParams({ search: e.target.value });
                }}
                placeholder="Search skins, ranks, items..."
                className="w-full bg-[#18171E] border border-[#2A2932] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-arcane-gold/50 transition-all"
              />
              {filters.search && (
                <button
                  onClick={() => {
                    setFilter("search", "");
                    updateURLParams({ search: "" });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                >
                  <HiOutlineX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilter("sortBy", e.target.value)}
              className="bg-[#18171E] border border-[#2A2932] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-arcane-gold/50 cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#18171E]"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Game Horizontal Selector */}
        <div className="mb-6">
          <GameSelector
            selected={filters.game}
            onSelect={handleGameSelect}
            showAll
          />
        </div>

        {/* STYLE CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-[#2A2932]/40">
          {categoryTypeTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = filters.type === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTypeSelect(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-arcane-gold text-[#141319] shadow-lg shadow-arcane-gold/10"
                    : "bg-[#18171E] text-text-muted hover:text-white hover:bg-[#1E1D24] border border-[#2A2932]"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Category Sub-filter & Quick Pills Toolbar */}
        <div className="bg-[#18171E]/90 border border-[#2A2932] rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Quick Flag Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() =>
                  setFilter("instantDelivery", !filters.instantDelivery)
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.instantDelivery
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-[#141319] text-text-muted hover:text-white border border-[#2A2932]"
                }`}
              >
                <HiOutlineLightningBolt className="w-3.5 h-3.5" /> Instant
                Delivery
              </button>

              <button
                onClick={() => setFilter("featured", !filters.featured)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.featured
                    ? "bg-arcane-gold/20 text-arcane-gold border border-arcane-gold/30"
                    : "bg-[#141319] text-text-muted hover:text-white border border-[#2A2932]"
                }`}
              >
                <HiOutlineStar className="w-3.5 h-3.5" /> Featured Offers
              </button>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  showAdvancedFilters || activeFiltersCount > 0
                    ? "bg-arcane-gold/10 text-arcane-gold border-arcane-gold/30"
                    : "bg-[#141319] text-text-muted hover:text-white border-[#2A2932]"
                }`}
              >
                <HiOutlineFilter className="w-3.5 h-3.5" /> Filter Options
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-arcane-gold text-[#141319] text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
                <HiOutlineChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Price Quick Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#141319] border border-[#2A2932] rounded-lg px-2 py-1 text-xs">
                <span className="text-text-muted mr-1">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilter("minPrice", e.target.value)}
                  className="w-14 bg-transparent text-white outline-none text-xs"
                />
                <span className="text-text-muted mx-1">-</span>
                <span className="text-text-muted mr-1">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter("maxPrice", e.target.value)}
                  className="w-14 bg-transparent text-white outline-none text-xs"
                />
              </div>

              {(activeFiltersCount > 0 ||
                filters.search ||
                filters.type ||
                filters.category) && (
                <button
                  onClick={() => {
                    resetFilters();
                    setSearchParams(filters.game ? { game: filters.game } : {});
                  }}
                  className="text-xs text-text-muted hover:text-red-400 underline transition-colors px-2"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* ADVANCED CATEGORY-SPECIFIC FILTER ACCORDION */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 mt-3 border-t border-[#2A2932] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
              >
                {/* Specific Category Sub-dropdown */}
                {categories.length > 0 && (
                  <div>
                    <label className="block text-text-muted mb-1 text-[11px]">
                      Sub-Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleSubCategorySelect(e.target.value)}
                      className="w-full bg-[#141319] border border-[#2A2932] rounded-lg py-2 px-2.5 text-white outline-none"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Account Specific: Rank Dropdown */}
                {(!filters.type || filters.type === "account") && (
                  <div>
                    <label className="block text-text-muted mb-1 text-[11px]">
                      Rank
                    </label>
                    <select
                      value={filters.rank}
                      onChange={(e) => setFilter("rank", e.target.value)}
                      className="w-full bg-[#141319] border border-[#2A2932] rounded-lg py-2 px-2.5 text-white outline-none"
                    >
                      <option value="">Any Rank</option>
                      {ranks.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Boosting Specific: Service Type */}
                {filters.type === "boosting" && (
                  <div>
                    <label className="block text-text-muted mb-1 text-[11px]">
                      Boosting Service
                    </label>
                    <select
                      value={filters.serviceType}
                      onChange={(e) => setFilter("serviceType", e.target.value)}
                      className="w-full bg-[#141319] border border-[#2A2932] rounded-lg py-2 px-2.5 text-white outline-none"
                    >
                      <option value="">All Services</option>
                      <option value="rank_boost">Rank Boost</option>
                      <option value="win_boost">Net Wins Boost</option>
                      <option value="placement">Placement Matches</option>
                    </select>
                  </div>
                )}

                {/* Topup / Items Specific: Delivery Method */}
                {(filters.type === "topup" ||
                  filters.type === "items" ||
                  filters.type === "currency") && (
                  <div>
                    <label className="block text-text-muted mb-1 text-[11px]">
                      Delivery Method
                    </label>
                    <select
                      value={filters.deliveryMethod}
                      onChange={(e) =>
                        setFilter("deliveryMethod", e.target.value)
                      }
                      className="w-full bg-[#141319] border border-[#2A2932] rounded-lg py-2 px-2.5 text-white outline-none"
                    >
                      <option value="">Any Method</option>
                      <option value="login">Account Login</option>
                      <option value="redeem_code">Redeem Code</option>
                      <option value="gifting">In-Game Gift</option>
                      <option value="direct_trade">Direct Trade</option>
                    </select>
                  </div>
                )}

                {/* Server Filter */}
                <div>
                  <label className="block text-text-muted mb-1 text-[11px]">
                    Server / Realm
                  </label>
                  <input
                    type="text"
                    value={filters.server}
                    onChange={(e) => setFilter("server", e.target.value)}
                    placeholder="e.g. NA / EU / Global"
                    className="w-full bg-[#141319] border border-[#2A2932] rounded-lg py-2 px-2.5 text-white outline-none"
                  />
                </div>

                {/* Platform Filter */}
                <div>
                  <label className="block text-text-muted mb-1 text-[11px]">
                    Platform
                  </label>
                  <select
                    value={filters.platform}
                    onChange={(e) => setFilter("platform", e.target.value)}
                    className="w-full bg-[#141319] border border-[#2A2932] rounded-lg py-2 px-2.5 text-white outline-none"
                  >
                    <option value="">All Platforms</option>
                    <option value="PC">PC</option>
                    <option value="Mobile">Mobile (iOS / Android)</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LISTINGS GRID */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-[#18171E]/50 border border-[#2A2932] rounded-2xl">
              <p className="text-white text-base font-semibold">
                No listings match your criteria
              </p>
              <p className="text-text-muted text-xs mt-1">
                Try resetting filters or searching for different terms.
              </p>
              <button
                onClick={() => {
                  resetAll();
                  setSearchParams({});
                }}
                className="mt-4 px-4 py-2 bg-arcane-gold text-[#141319] font-bold text-xs rounded-xl hover:bg-arcane-gold/90 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#18171E] border border-[#2A2932] hover:border-arcane-gold/50 disabled:opacity-30 transition-all"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, currentPage - 3), currentPage + 2)
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          currentPage === page
                            ? "bg-arcane-gold text-[#141319] shadow-md shadow-arcane-gold/20"
                            : "text-white bg-[#18171E] border border-[#2A2932] hover:border-arcane-gold/50"
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
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#18171E] border border-[#2A2932] hover:border-arcane-gold/50 disabled:opacity-30 transition-all"
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
