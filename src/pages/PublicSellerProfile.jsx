import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineChat,
  HiOutlineSearch,
  HiOutlineLightningBolt,
  HiOutlineCheck,
  HiOutlineShoppingBag,
  HiOutlineThumbUp,
  HiOutlineChevronRight,
  HiOutlineBadgeCheck,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import useAuthStore from "../stores/useAuthStore";
import useCurrencyStore from "../stores/useCurrencyStore";
import Spinner from "../components/ui/Spinner";
import SEO from "../components/ui/SEO";
import ListingCard from "../components/listings/ListingCard";

const sellerLevels = [
  { name: "New Merchant", min: 0, icon: "🌱", color: "text-emerald-400" },
  { name: "Verified Merchant", min: 10, icon: "🛡️", color: "text-blue-400" },
  { name: "Pro Trader", min: 50, icon: "💼", color: "text-purple-400" },
  { name: "Elite Merchant", min: 200, icon: "👑", color: "text-arcane-gold" },
];

export default function PublicSellerProfile() {
  const { username } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Core Data States
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gamesList, setGamesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeMainTab, setActiveMainTab] = useState("offers"); // 'offers' | 'feedback'
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [instantDeliveryOnly, setInstantDeliveryOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [reviewFilter, setReviewFilter] = useState("all"); // 'all' | 'positive' | 'negative'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSellerData();
  }, [username]);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Seller Profile by Username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError || !profileData) {
        setSeller(null);
        setLoading(false);
        return;
      }

      setSeller(profileData);

      // 2. Fetch Seller's Active Listings
      const { data: listingsData } = await supabase
        .from("listings")
        .select(
          `
            *,
            game:games!inner(id, name, slug, icon),
            category:listing_categories!inner(id, name, slug, type),
            seller:profiles(id, username, verified_seller, rating, avatar_url, total_sales),
            images:listing_images(id, url, is_cover, sort_order)
          `,
        )
        .eq("seller_id", profileData.id)
        .eq("status", "active")
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false });

      const allListings = listingsData || [];
      setListings(allListings);

      // Extract unique games where seller has active offers
      const gameMap = new Map();
      allListings.forEach((item) => {
        if (item.game?.slug && !gameMap.has(item.game.slug)) {
          gameMap.set(item.game.slug, {
            ...item.game,
            count: allListings.filter((l) => l.game?.slug === item.game.slug)
              .length,
          });
        }
      });
      setGamesList(Array.from(gameMap.values()));

      // 3. Fetch Real Reviews using `reviewer_id`
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(
          `
            id,
            rating,
            comment,
            created_at,
            reviewer:profiles!reviewer_id(id, username, avatar_url)
          `,
        )
        .eq("seller_id", profileData.id)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading seller profile:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121118] pt-28 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-[#121118] pt-28 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1E1D24] flex items-center justify-center text-3xl mb-3">
          🔍
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Seller Not Found</h2>
        <p className="text-text-muted text-xs mb-4">
          The merchant profile "{username}" does not exist.
        </p>
        <Link
          to="/marketplace"
          className="px-4 py-2 bg-arcane-gold text-[#141319] font-bold text-xs rounded-xl hover:bg-arcane-gold/90 transition-all"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  // Real-time seller metrics calculation
  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const positivePercentage =
    totalReviews > 0
      ? ((positiveReviews / totalReviews) * 100).toFixed(0)
      : seller.rating
        ? (seller.rating * 20).toFixed(0)
        : "100";

  const totalSales = seller.total_sales || 0;
  const sellerLevel =
    sellerLevels.findLast((l) => totalSales >= l.min) || sellerLevels[0];

  // In-store filter logic
  const filteredListings = listings.filter((item) => {
    if (selectedGame !== "all" && item.game?.slug !== selectedGame)
      return false;
    if (selectedType && item.category?.type !== selectedType) return false;
    if (
      instantDeliveryOnly &&
      !item.instant_delivery &&
      item.delivery_type !== "instant"
    )
      return false;
    if (minPrice && parseFloat(item.price) < parseFloat(minPrice)) return false;
    if (maxPrice && parseFloat(item.price) > parseFloat(maxPrice)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.rank?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort filtered listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "price-low")
      return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === "price-high")
      return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Pagination Slice
  const totalPages = Math.ceil(sortedListings.length / pageSize);
  const paginatedListings = sortedListings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === "positive") return r.rating >= 4;
    if (reviewFilter === "negative") return r.rating < 4;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#121118] text-white pt-24 pb-20">
      <SEO
        title={`${seller.username}`}
        description={`Browse verified gaming accounts, top-ups, and items from seller ${seller.username}.`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <HiOutlineChevronRight className="w-3.5 h-3.5" />
          <Link
            to="/marketplace"
            className="hover:text-white transition-colors"
          >
            Marketplace
          </Link>
          <HiOutlineChevronRight className="w-3.5 h-3.5" />
          <span className="text-arcane-gold font-medium">
            {seller.username}
          </span>
        </div>

        {/* ================= SELLER STORE HEADER ================= */}
        <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Avatar & Identity */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl bg-[#141319] border border-[#2A2932] flex items-center justify-center text-3xl font-bold text-arcane-gold overflow-hidden shrink-0 shadow-lg">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  seller.username?.charAt(0).toUpperCase()
                )}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#18171E]" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                    {seller.username}
                  </h1>
                  {seller.verified_seller && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                      <HiOutlineBadgeCheck className="w-4 h-4" /> Verified
                      Merchant
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-[#2A2932] text-xs font-semibold ${sellerLevel.color}`}
                  >
                    <span>{sellerLevel.icon}</span> {sellerLevel.name}
                  </span>
                </div>

                <p className="text-text-muted text-xs mt-1.5 flex items-center gap-2 flex-wrap">
                  <span>
                    Member since{" "}
                    {new Date(
                      seller.created_at || Date.now(),
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <HiOutlineCheck className="w-3.5 h-3.5" /> ID Verified
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Key Performance Stats & Direct Contact */}
            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
              <div className="grid grid-cols-3 gap-2 text-center bg-[#141319] p-3 rounded-xl border border-[#2A2932] text-xs w-full sm:w-auto">
                <div className="px-3">
                  <span className="text-text-muted block text-[10px]">
                    Positive
                  </span>
                  <span className="text-base font-extrabold text-emerald-400 block">
                    {positivePercentage}%
                  </span>
                </div>
                <div className="px-3 border-x border-[#2A2932]">
                  <span className="text-text-muted block text-[10px]">
                    Completed
                  </span>
                  <span className="text-base font-extrabold text-white block">
                    {totalSales}
                  </span>
                </div>
                <div className="px-3">
                  <span className="text-text-muted block text-[10px]">
                    Avg Speed
                  </span>
                  <span className="text-base font-extrabold text-arcane-gold block">
                    ~15m
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    toast.error("Please login to contact this seller");
                    navigate("/login");
                  } else {
                    navigate(`/dashboard/messages?seller=${seller.id}`);
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 bg-arcane-gold text-[#141319] hover:bg-arcane-gold/90 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <HiOutlineChat className="w-4 h-4" /> Contact Seller
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="mt-6 pt-4 border-t border-[#2A2932]/70 flex items-center gap-6 text-xs text-text-muted flex-wrap">
            <div className="flex items-center gap-1.5">
              <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>TradeShield™ 100% Escrow Protection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HiOutlineLightningBolt className="w-4 h-4 text-amber-400" />
              <span>Instant & Fast Delivery Support</span>
            </div>
          </div>
        </div>

        {/* ================= MAIN STORE TABS ================= */}
        <div className="flex items-center gap-2 border-b border-[#2A2932] mb-6">
          <button
            onClick={() => setActiveMainTab("offers")}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeMainTab === "offers"
                ? "border-arcane-gold text-arcane-gold"
                : "border-transparent text-text-muted hover:text-white"
            }`}
          >
            <HiOutlineShoppingBag className="w-4 h-4" />
            Seller Offers ({listings.length})
          </button>
          <button
            onClick={() => setActiveMainTab("feedback")}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeMainTab === "feedback"
                ? "border-arcane-gold text-arcane-gold"
                : "border-transparent text-text-muted hover:text-white"
            }`}
          >
            <HiOutlineThumbUp className="w-4 h-4" />
            Feedback & Reviews ({reviews.length})
          </button>
        </div>

        {/* ================= OFFERS TAB CONTENT ================= */}
        {activeMainTab === "offers" ? (
          <div>
            {/* Game Tabs */}
            {gamesList.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
                <button
                  onClick={() => {
                    setSelectedGame("all");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedGame === "all"
                      ? "bg-arcane-gold text-[#141319]"
                      : "bg-[#18171E] text-text-muted hover:text-white border border-[#2A2932]"
                  }`}
                >
                  All Games ({listings.length})
                </button>
                {gamesList.map((g) => (
                  <button
                    key={g.slug}
                    onClick={() => {
                      setSelectedGame(g.slug);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedGame === g.slug
                        ? "bg-arcane-gold text-[#141319]"
                        : "bg-[#18171E] text-text-muted hover:text-white border border-[#2A2932]"
                    }`}
                  >
                    {g.icon && (
                      <img
                        src={g.icon}
                        alt=""
                        className="w-4 h-4 object-contain rounded"
                      />
                    )}
                    {g.name} ({g.count})
                  </button>
                ))}
              </div>
            )}

            {/* In-Store Search & Filter Toolbar */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-4 mb-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={`Search in ${seller.username}'s offers...`}
                    className="w-full bg-[#141319] border border-[#2A2932] rounded-xl py-2 pl-10 pr-3 text-xs text-white placeholder:text-gray-500 outline-none focus:border-arcane-gold/50"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setInstantDeliveryOnly(!instantDeliveryOnly)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      instantDeliveryOnly
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-[#141319] text-text-muted hover:text-white border-[#2A2932]"
                    }`}
                  >
                    <HiOutlineLightningBolt className="w-3.5 h-3.5" /> Instant
                    Delivery
                  </button>

                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-[#141319] border border-[#2A2932] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    <option value="account">Accounts</option>
                    <option value="topup">Top-up & Currency</option>
                    <option value="boosting">Boosting</option>
                    <option value="items">Items & Skins</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#141319] border border-[#2A2932] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            {paginatedListings.length === 0 ? (
              <div className="text-center py-16 bg-[#18171E]/50 border border-[#2A2932] rounded-2xl">
                <HiOutlineShoppingBag className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-40" />
                <p className="text-white text-sm font-semibold">
                  No offers match your criteria
                </p>
                <p className="text-text-muted text-xs mt-1">
                  Try clearing some search filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  {paginatedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#18171E] border border-[#2A2932] hover:border-arcane-gold/50 disabled:opacity-30 transition-all"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                            currentPage === page
                              ? "bg-arcane-gold text-[#141319] shadow-md shadow-arcane-gold/20"
                              : "text-white bg-[#18171E] border border-[#2A2932] hover:border-arcane-gold/50"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
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
        ) : (
          /* ================= FEEDBACK & REVIEWS TAB CONTENT ================= */
          <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2932] mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <HiOutlineThumbUp className="w-5 h-5 text-emerald-400" />
                  Buyer Feedback & Reviews
                </h2>
                <p className="text-text-muted text-xs mt-0.5">
                  Verified ratings from buyers who completed trades with{" "}
                  {seller.username}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-[#141319] p-1 rounded-xl border border-[#2A2932]">
                <button
                  onClick={() => setReviewFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    reviewFilter === "all"
                      ? "bg-[#1E1D24] text-white border border-[#2A2932]"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  All ({reviews.length})
                </button>
                <button
                  onClick={() => setReviewFilter("positive")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    reviewFilter === "positive"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-text-muted hover:text-emerald-400"
                  }`}
                >
                  Positive ({positiveReviews})
                </button>
                <button
                  onClick={() => setReviewFilter("negative")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    reviewFilter === "negative"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "text-text-muted hover:text-red-400"
                  }`}
                >
                  Negative ({totalReviews - positiveReviews})
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="py-12 text-center bg-[#141319] rounded-xl border border-[#2A2932]/50">
                  <HiOutlineStar className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-white text-sm font-medium">
                    No reviews found
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    This merchant does not have{" "}
                    {reviewFilter !== "all" ? reviewFilter : ""} reviews yet.
                  </p>
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-[#141319] border border-[#2A2932]/70 rounded-xl space-y-2 hover:border-[#2A2932] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#1E1D24] flex items-center justify-center text-xs font-bold text-arcane-gold overflow-hidden">
                          {rev.reviewer?.avatar_url ? (
                            <img
                              src={rev.reviewer.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            rev.reviewer?.username?.charAt(0).toUpperCase() ||
                            "B"
                          )}
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {rev.reviewer?.username || "Verified Buyer"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold flex items-center gap-0.5">
                          <HiOutlineCheck className="w-3 h-3" /> Verified Trade
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <HiOutlineStar
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="text-text-muted text-xs leading-relaxed mt-1">
                        {rev.comment}
                      </p>
                    )}

                    <span className="text-[10px] text-gray-500 block">
                      {new Date(rev.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
