import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineEye,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineHeart,
  HiHeart,
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineChat,
  HiOutlineSparkles,
  HiOutlineThumbUp,
  HiOutlineBadgeCheck,
  HiOutlineLightningBolt,
  HiOutlineArrowNarrowRight,
  HiOutlineChevronRight,
} from "react-icons/hi";

import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import useAuthStore from "../stores/useAuthStore";
import useCurrencyStore from "../stores/useCurrencyStore";
import useWishlistStore from "../stores/useWishlistStore";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import SEO from "../components/ui/SEO";
import ListingCard from "../components/listings/ListingCard";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { formatPrice } = useCurrencyStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedListings, setRelatedListings] = useState([]);
  const [reviewTab, setReviewTab] = useState("all"); // 'all' | 'positive' | 'negative'
  const [sellerReviews, setSellerReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("listings")
        .select(
          `
            *,
            game:games(id, name, slug, icon),
            category:listing_categories(id, name, slug, type),
            seller:profiles(id, username, avatar_url, verified_seller, rating, total_sales, created_at),
            images:listing_images(id, url, is_cover, sort_order)
          `,
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        setListing(null);
        setLoading(false);
        return;
      }

      setListing(data);
      setLoading(false);

      // Increment view counter
      supabase
        .from("listings")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", id)
        .then();

      // Fetch related listings from the same category / game
      fetchRelatedListings(data.game_id, data.category_id, data.id);

      // Fetch dynamic seller feedback
      if (data.seller?.id || data.seller_id) {
        fetchSellerReviews(data.seller?.id || data.seller_id);
      }
    } catch (err) {
      console.error("Fetch listing detail error:", err);
      setLoading(false);
    }
  };

  const fetchRelatedListings = async (gameId, categoryId, currentListingId) => {
    try {
      let query = supabase
        .from("listings")
        .select(
          `
            *,
            game:games!inner(id, name, slug, icon),
            category:listing_categories!inner(id, name, slug, type),
            seller:profiles(id, username, verified_seller, rating, avatar_url),
            images:listing_images(id, url, is_cover, sort_order)
          `,
        )
        .eq("status", "active")
        .eq("approval_status", "approved")
        .neq("id", currentListingId)
        .limit(5);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      } else if (gameId) {
        query = query.eq("game_id", gameId);
      }

      const { data } = await query;
      setRelatedListings(data || []);
    } catch (e) {
      console.error("Fetch related listings error:", e);
    }
  };

  const fetchSellerReviews = async (sellerId) => {
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
            id,
            rating,
            comment,
            created_at,
            buyer:profiles!buyer_id(id, username, avatar_url)
          `,
        )
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSellerReviews(data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setSellerReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121118] pt-28 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#121118] pt-28 flex flex-col items-center justify-center">
        <p className="text-white text-lg font-semibold mb-4">
          Listing not found
        </p>
        <Link
          to="/marketplace"
          className="px-4 py-2 bg-arcane-gold text-[#141319] font-bold text-xs rounded-xl hover:bg-arcane-gold/90 transition-all"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(listing.id);
  const isSold = listing.status === "sold";
  const seller = listing.seller;
  const images = listing.images || [];
  const categoryType = listing.category?.type || "account";

  // Real-time calculations from live reviews
  const totalReviewsCount = sellerReviews.length;
  const positiveReviewsCount = sellerReviews.filter(
    (r) => r.rating >= 4,
  ).length;
  const averageRating =
    totalReviewsCount > 0
      ? (
          sellerReviews.reduce((sum, r) => sum + r.rating, 0) /
          totalReviewsCount
        ).toFixed(1)
      : seller?.rating
        ? Number(seller.rating).toFixed(1)
        : null;

  const positivePercentage =
    totalReviewsCount > 0
      ? ((positiveReviewsCount / totalReviewsCount) * 100).toFixed(0)
      : null;

  const filteredReviews = sellerReviews.filter((r) => {
    if (reviewTab === "positive") return r.rating >= 4;
    if (reviewTab === "negative") return r.rating < 4;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#121118] text-white pt-24 pb-20">
      <SEO
        title={`${listing.title} | Arcane Bazaar`}
        description={listing.description?.substring(0, 160)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-6 overflow-x-auto whitespace-nowrap">
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
          {listing.game && (
            <>
              <HiOutlineChevronRight className="w-3.5 h-3.5" />
              <Link
                to={`/marketplace?game=${listing.game.slug}`}
                className="hover:text-white transition-colors"
              >
                {listing.game.name}
              </Link>
            </>
          )}
          {listing.category && (
            <>
              <HiOutlineChevronRight className="w-3.5 h-3.5" />
              <Link
                to={`/marketplace?game=${listing.game?.slug || ""}&category=${listing.category.slug}&type=${categoryType}`}
                className="text-arcane-gold font-medium"
              >
                {listing.category.name}
              </Link>
            </>
          )}
        </div>

        {/* Main 2-Column Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* LEFT COLUMN: Media, Specs, Description & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery Card */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-4 shadow-xl">
              <div className="aspect-[16/10] sm:aspect-video rounded-xl bg-[#141319] overflow-hidden mb-3 relative border border-[#2A2932]/70">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.url || images[0]?.url}
                    alt={listing.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-5xl opacity-20">
                    {listing.game?.icon ? (
                      <img
                        src={listing.game.icon}
                        alt=""
                        className="w-16 h-16 object-contain opacity-40"
                      />
                    ) : (
                      "🎮"
                    )}
                  </div>
                )}

                {/* Instant Delivery Tag */}
                {(listing.instant_delivery ||
                  listing.delivery_type === "instant") && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-lg">
                    <HiOutlineLightningBolt className="w-3.5 h-3.5" /> Instant
                    Delivery
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        i === selectedImage
                          ? "border-arcane-gold shadow-md shadow-arcane-gold/20"
                          : "border-[#2A2932] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Card */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <HiOutlineSparkles className="w-4 h-4 text-arcane-gold" /> Offer
                Specifications
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
                <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                  <span className="text-text-muted text-[11px] block">
                    Game
                  </span>
                  <p className="text-white font-semibold mt-0.5 truncate">
                    {listing.game?.name || "Global"}
                  </p>
                </div>
                <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                  <span className="text-text-muted text-[11px] block">
                    Category
                  </span>
                  <p className="text-white font-semibold mt-0.5 capitalize">
                    {listing.category?.name || categoryType}
                  </p>
                </div>
                <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                  <span className="text-text-muted text-[11px] block">
                    Platform
                  </span>
                  <p className="text-white font-semibold mt-0.5">
                    {listing.platform || "PC / Mobile"}
                  </p>
                </div>
                <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                  <span className="text-text-muted text-[11px] block">
                    Delivery Speed
                  </span>
                  <p className="text-emerald-400 font-semibold mt-0.5">
                    {listing.delivery_time || "15"} mins
                  </p>
                </div>

                {listing.rank && (
                  <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                    <span className="text-text-muted text-[11px] block">
                      Current Rank
                    </span>
                    <p className="text-arcane-gold font-semibold mt-0.5">
                      {listing.rank}
                    </p>
                  </div>
                )}
                {listing.level && (
                  <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                    <span className="text-text-muted text-[11px] block">
                      Account Level
                    </span>
                    <p className="text-white font-semibold mt-0.5">
                      Lv. {listing.level}
                    </p>
                  </div>
                )}
                {listing.server && (
                  <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                    <span className="text-text-muted text-[11px] block">
                      Server / Realm
                    </span>
                    <p className="text-white font-semibold mt-0.5">
                      {listing.server}
                    </p>
                  </div>
                )}
                {listing.hero_count > 0 && (
                  <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                    <span className="text-text-muted text-[11px] block">
                      Unlocked Heroes
                    </span>
                    <p className="text-white font-semibold mt-0.5">
                      {listing.hero_count}
                    </p>
                  </div>
                )}
                {listing.skin_count > 0 && (
                  <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                    <span className="text-text-muted text-[11px] block">
                      Total Skins
                    </span>
                    <p className="text-arcane-gold font-semibold mt-0.5">
                      {listing.skin_count}
                    </p>
                  </div>
                )}
                {listing.delivery_method && (
                  <div className="p-3 bg-[#141319] rounded-xl border border-[#2A2932]/70">
                    <span className="text-text-muted text-[11px] block">
                      Delivery Method
                    </span>
                    <p className="text-white font-semibold mt-0.5 capitalize">
                      {listing.delivery_method.replace("_", " ")}
                    </p>
                  </div>
                )}
              </div>

              <h3 className="text-sm font-semibold text-white mb-2">
                Description & Details
              </h3>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-[#141319] p-4 rounded-xl border border-[#2A2932]/60">
                {listing.description || "No description provided."}
              </p>
            </div>

            {/* DYNAMIC SELLER REVIEWS & FEEDBACK SECTION */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2932] mb-6">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <HiOutlineThumbUp className="w-5 h-5 text-emerald-400" />
                    Customer Feedback & Reviews
                  </h2>
                  <p className="text-text-muted text-xs mt-0.5">
                    {totalReviewsCount > 0
                      ? `Showing real verified purchases from buyers (${totalReviewsCount} total)`
                      : "No reviews submitted for this seller yet."}
                  </p>
                </div>

                {totalReviewsCount > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#141319] p-1 rounded-xl border border-[#2A2932]">
                    <button
                      onClick={() => setReviewTab("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        reviewTab === "all"
                          ? "bg-[#1E1D24] text-white border border-[#2A2932]"
                          : "text-text-muted hover:text-white"
                      }`}
                    >
                      All ({totalReviewsCount})
                    </button>
                    <button
                      onClick={() => setReviewTab("positive")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        reviewTab === "positive"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "text-text-muted hover:text-emerald-400"
                      }`}
                    >
                      Positive ({positiveReviewsCount})
                    </button>
                    <button
                      onClick={() => setReviewTab("negative")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        reviewTab === "negative"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "text-text-muted hover:text-red-400"
                      }`}
                    >
                      Negative ({totalReviewsCount - positiveReviewsCount})
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {reviewsLoading ? (
                  <div className="py-8 text-center text-text-muted text-xs">
                    <Spinner size="sm" />
                  </div>
                ) : totalReviewsCount === 0 ? (
                  <div className="py-10 text-center bg-[#141319] rounded-xl border border-[#2A2932]/50">
                    <HiOutlineStar className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
                    <p className="text-white text-sm font-medium">
                      No reviews yet
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      Reviews and ratings from verified buyers will appear here
                      after orders are completed.
                    </p>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="py-6 text-center text-text-muted text-xs">
                    No {reviewTab} reviews found.
                  </div>
                ) : (
                  filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 bg-[#141319] border border-[#2A2932]/70 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#1E1D24] flex items-center justify-center text-[10px] font-bold text-arcane-gold overflow-hidden">
                            {rev.buyer?.avatar_url ? (
                              <img
                                src={rev.buyer.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              rev.buyer?.username?.charAt(0).toUpperCase() ||
                              "B"
                            )}
                          </div>
                          <span className="text-xs font-medium text-white">
                            {rev.buyer?.username || "Verified Buyer"}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold flex items-center gap-0.5">
                            <HiOutlineCheck className="w-3 h-3" /> Verified
                            Order
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
                        <p className="text-text-muted text-xs leading-relaxed">
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
          </div>

          {/* RIGHT COLUMN: Purchase & Seller Trust Panel */}
          <div className="space-y-5">
            {/* Purchase Action Box */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-2xl relative">
              <div className="flex items-center gap-2 mb-2">
                {listing.game?.icon && (
                  <img
                    src={listing.game.icon}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                )}
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {listing.game?.name}
                </span>
              </div>

              <h1 className="text-base sm:text-lg font-bold text-white leading-snug mb-4">
                {listing.title}
              </h1>

              {/* Price Display */}
              <div className="p-4 bg-[#141319] border border-[#2A2932] rounded-xl mb-5 flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">
                    Total Price
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-arcane-gold tracking-tight">
                    {isSold ? "SOLD" : formatPrice(listing.price)}
                  </span>
                </div>
                <div className="text-right text-xs text-text-muted space-y-1">
                  <div className="flex items-center gap-1 justify-end text-emerald-400 font-semibold text-[11px]">
                    <HiOutlineLightningBolt className="w-3.5 h-3.5" /> Instant
                    Delivery
                  </div>
                  <div className="flex items-center gap-1 justify-end text-gray-400 text-[10px]">
                    <HiOutlineClock className="w-3 h-3" /> ~
                    {listing.delivery_time || "15"}m avg
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isSold ? (
                <div className="space-y-2.5">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full font-bold shadow-lg shadow-arcane-gold/20 flex items-center justify-center gap-2"
                    onClick={() => {
                      if (!user) {
                        toast.error("Please login to complete your purchase");
                        navigate("/login");
                      } else {
                        toast.success("Redirecting to Escrow Checkout...");
                      }
                    }}
                  >
                    <HiOutlineShoppingBag className="w-5 h-5" /> Buy Now
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => toggleWishlist(listing.id)}
                      variant="ghost"
                      className="border border-[#2A2932] bg-[#141319] text-xs py-2.5 flex items-center justify-center gap-1.5"
                    >
                      {isWishlisted ? (
                        <>
                          <HiHeart className="w-4 h-4 text-red-400" /> Saved
                        </>
                      ) : (
                        <>
                          <HiOutlineHeart className="w-4 h-4" /> Wishlist
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      className="border border-[#2A2932] bg-[#141319] text-xs py-2.5 flex items-center justify-center gap-1.5"
                      onClick={() => {
                        if (!user) {
                          toast.error("Please login to contact seller");
                          navigate("/login");
                        } else {
                          navigate(
                            `/dashboard/messages?seller=${seller?.id || listing.seller_id}`,
                          );
                        }
                      }}
                    >
                      <HiOutlineChat className="w-4 h-4 text-arcane-gold" />{" "}
                      Chat Seller
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <p className="text-red-400 font-bold text-sm">
                    This item has been sold
                  </p>
                </div>
              )}
            </div>

            {/* DYNAMIC SELLER TRUST & REPUTATION CARD */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2A2932]">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full bg-arcane-gold border border-[#2A2932] flex items-center justify-center text-lg font-bold text-arcane-gold overflow-hidden">
                    {seller?.avatar_url ? (
                      <img
                        src={seller.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      seller?.username?.charAt(0).toUpperCase() || "S"
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white">
                        {seller?.username || "Seller"}
                      </h3>
                      {seller?.verified_seller && (
                        <HiOutlineShieldCheck
                          className="w-4 h-4 text-blue-400"
                          title="Identity Verified"
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Member since{" "}
                      {seller?.created_at
                        ? new Date(seller.created_at).getFullYear()
                        : "2024"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {positivePercentage !== null ? (
                    <>
                      <div className="text-sm font-extrabold text-emerald-400">
                        {positivePercentage}%
                      </div>
                      <span className="text-[10px] text-text-muted block">
                        ({totalReviewsCount}{" "}
                        {totalReviewsCount === 1 ? "review" : "reviews"})
                      </span>
                    </>
                  ) : (
                    <span className="px-2 py-1 rounded bg-[#141319] border border-[#2A2932] text-[11px] text-arcane-gold font-semibold">
                      New Seller
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center bg-[#141319] p-3 rounded-xl border border-[#2A2932] text-xs mb-4">
                <div>
                  <span className="text-text-muted block text-[10px]">
                    Avg Speed
                  </span>
                  <span className="font-bold text-white text-[11px]">
                    ~{listing.delivery_time || "15"}m
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">
                    Rating
                  </span>
                  <span className="font-bold text-emerald-400 text-[11px]">
                    {averageRating ? `${averageRating} / 5.0` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">
                    Sales
                  </span>
                  <span className="font-bold text-arcane-gold text-[11px]">
                    {seller?.total_sales || 0}
                  </span>
                </div>
              </div>

              {/* Protection Guarantees */}
              <div className="space-y-2 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>TradeShield™ 100% Escrow Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineBadgeCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Money Back Guarantee if not delivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: MORE OFFERS IN THIS CATEGORY */}
        {relatedListings.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#2A2932]/70">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                  More {listing.category?.name || "Offers"} in{" "}
                  {listing.game?.name}
                </h2>
                <p className="text-text-muted text-xs mt-0.5">
                  Browse other top-rated listings from verified merchants
                </p>
              </div>

              <Link
                to={`/marketplace?game=${listing.game?.slug || ""}&type=${categoryType}&category=${listing.category?.slug || ""}`}
                className="text-xs text-arcane-gold hover:text-white transition-colors font-semibold flex items-center gap-1"
              >
                View All Offers{" "}
                <HiOutlineArrowNarrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {relatedListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
