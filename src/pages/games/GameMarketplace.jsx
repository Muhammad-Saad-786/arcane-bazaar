import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineStar,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import useCurrencyStore from "../../stores/useCurrencyStore";
import ListingCard from "../../components/listings/ListingCard";
import SEO from "../../components/ui/SEO";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export default function GameMarketplace() {
  const { gameSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "accounts";

  const [game, setGame] = useState(null);
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    fetchGame();
    fetchCategories();
  }, [gameSlug]);

  useEffect(() => {
    fetchListings();
  }, [gameSlug, activeCategory, sortBy, currentPage, search]);

  const fetchGame = async () => {
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("slug", gameSlug)
      .single();
    setGame(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("listing_categories")
      .select("*")
      .eq("game.slug", gameSlug);
    setCategories(data || []);
  };

  const fetchListings = async () => {
    setLoading(true);
    const pageSize = 24;
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("listings")
      .select(
        `*, game:games(name, slug, icon), category:listing_categories(name, type), seller:profiles(username, verified_seller, rating, total_sales), images:listing_images(url, is_cover)`,
        { count: "exact" },
      )
      .eq("game.slug", gameSlug)
      .eq("status", "active")
      .eq("approval_status", "approved");

    if (activeCategory) {
      query = query.eq("category.slug", activeCategory);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%`);
    }
    if (filters.minPrice)
      query = query.gte("price", parseFloat(filters.minPrice));
    if (filters.maxPrice)
      query = query.lte("price", parseFloat(filters.maxPrice));

    switch (sortBy) {
      case "price-low":
        query = query.order("price", { ascending: true });
        break;
      case "price-high":
        query = query.order("price", { ascending: false });
        break;
      case "popular":
        query = query.order("views", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, count } = await query.range(from, to);
    setListings(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const totalPages = Math.ceil(totalCount / 24);

  if (!game && !loading) {
    return (
      <div className="min-h-screen bg-arcane-dark pt-24 flex items-center justify-center">
        <p className="text-white text-lg">Game not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arcane-dark">
      <SEO
        title={`${game?.name || "Game"} Accounts For Sale`}
        description={`Buy and sell ${game?.name} accounts, currency, items, and boosting services.`}
      />

      {/* Game Header Banner */}
      <div className="relative pt-24 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-arcane-purple/10 to-transparent" />
        {game?.banner && (
          <div className="absolute inset-0 opacity-10">
            <img
              src={game.banner}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-arcane-surface flex items-center justify-center overflow-hidden">
              {game?.icon ? (
                <img
                  src={game.icon}
                  alt={game.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-arcane-purple">
                  {game?.name?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                {activeCategory === "accounts"
                  ? `${game?.name} Accounts For Sale`
                  : activeCategory === "topup"
                    ? `${game?.name} Top Up`
                    : activeCategory === "boosting"
                      ? `${game?.name} Boosting`
                      : activeCategory === "currency"
                        ? `${game?.name} Currency`
                        : activeCategory === "items"
                          ? `${game?.name} Items`
                          : `${game?.name} Marketplace`}
              </h1>
              <p className="text-text-muted text-sm mt-1">
                {totalCount.toLocaleString()} items found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => {
                setActiveCategory(cat.slug);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? "bg-arcane-purple text-white"
                  : "bg-arcane-surface text-text-secondary hover:text-white border border-arcane-border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search ${game?.name} accounts...`}
              className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-arcane-surface border border-arcane-border rounded-xl px-4 py-3 text-white text-sm outline-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value} className="bg-arcane-dark">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg">No listings found</p>
            <p className="text-text-muted text-sm mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm text-white bg-arcane-surface hover:bg-arcane-border disabled:opacity-30"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), currentPage + 2)
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium ${currentPage === page ? "bg-arcane-purple text-white" : "text-white bg-arcane-surface hover:bg-arcane-border"}`}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm text-white bg-arcane-surface hover:bg-arcane-border disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* SEO Content */}
        <div className="mt-16 max-w-4xl">
          <h2 className="text-xl font-bold text-white mb-4">
            {activeCategory === "accounts"
              ? `Buy ${game?.name} Accounts`
              : activeCategory === "topup"
                ? `${game?.name} Top Up & Gift Cards`
                : `${game?.name} Marketplace`}
          </h2>
          <div className="prose prose-invert max-w-none text-text-secondary text-sm space-y-3">
            <p>
              Buy and sell {game?.name} {activeCategory} safely on Arcane
              Bazaar. All sellers are verified and transactions are protected by
              our escrow system.
            </p>
            <p>
              Browse through {totalCount.toLocaleString()} listings from trusted
              sellers. Find the best deals on {game?.name} accounts, currency,
              items, and boosting services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
