import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineLightningBolt,
  HiOutlineStar,
  HiOutlineShieldCheck,
  HiOutlineCube,
  HiOutlineArrowNarrowRight,
  HiOutlineClock,
  HiCheckCircle,
} from "react-icons/hi";
import useCurrencyStore from "../../stores/useCurrencyStore";
import useWishlistStore from "../../stores/useWishlistStore";

export default function ListingCard({ listing }) {
  const { formatPrice } = useCurrencyStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();

  const isWishlisted = wishlistIds.includes(listing.id);
  const isSold = listing.status === "sold";
  const categoryType = listing.category?.type || "account";

  // Format rating percentage (e.g. 99.8%) and review count
  const sellerRatingPercent = listing.seller?.rating
    ? (listing.seller.rating * 20).toFixed(0)
    : "100";
  const reviewCount =
    listing.seller?.review_count || listing.seller?.total_sales || 12;

  const renderPrice = () => {
    if (isSold) return "SOLD";

    if (
      (categoryType === "topup" || categoryType === "currency") &&
      Array.isArray(listing.amount_options) &&
      listing.amount_options.length > 0
    ) {
      const prices = listing.amount_options
        .map((opt) => Number.parseFloat(opt.price))
        .filter((p) => !Number.isNaN(p));

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice
          ? formatPrice(minPrice)
          : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
      }
    }

    return formatPrice(listing.price || 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link to={`/listing/${listing.id}`} className="block h-full group">
        <div className="h-full flex flex-col justify-between bg-[#18171E] hover:bg-[#1E1D24] border border-[#2A2932] hover:border-arcane-gold/50 rounded-2xl p-3 sm:p-3.5 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/50 relative overflow-hidden">
          <div>
            {/* Thumbnail Box */}
            <div className="aspect-[16/10] rounded-xl bg-[#141319] overflow-hidden mb-3 relative border border-[#2A2932]/60">
              {listing.images?.[0]?.url ? (
                <img
                  src={listing.images[0].url}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#141319]/80">
                  {listing.game?.icon ? (
                    <img
                      src={listing.game.icon}
                      alt=""
                      className="w-10 h-10 opacity-30 object-contain"
                    />
                  ) : (
                    <span className="text-3xl opacity-25">🎮</span>
                  )}
                </div>
              )}

              {/* Status & Delivery Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                {isSold && (
                  <span className="px-2 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-md shadow-sm uppercase tracking-wider">
                    SOLD
                  </span>
                )}
                {listing.status === "pending" && (
                  <span className="px-2 py-0.5 bg-amber-500/90 text-white text-[10px] font-bold rounded-md shadow-sm uppercase tracking-wider">
                    PENDING
                  </span>
                )}
                {(listing.instant_delivery ||
                  listing.delivery_type === "instant") && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-md shadow-sm uppercase tracking-wider">
                    <HiOutlineLightningBolt className="w-3 h-3" /> Instant
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(listing.id);
                }}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-[#141319]/80 hover:bg-[#141319] text-text-muted hover:text-red-400 border border-[#2A2932] transition-colors"
              >
                {isWishlisted ? (
                  <HiHeart className="w-4 h-4 text-red-500" />
                ) : (
                  <HiOutlineHeart className="w-4 h-4" />
                )}
              </button>

              {/* Category Indicator Tag */}
              <div className="absolute bottom-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded-md bg-[#141319]/90 backdrop-blur-sm border border-[#2A2932] text-arcane-gold text-[10px] font-semibold capitalize tracking-wide">
                  {listing.category?.name || categoryType}
                </span>
              </div>
            </div>

            {/* Game Info Header */}
            <div className="flex items-center gap-1.5 mb-1 text-[11px] text-text-muted truncate">
              {listing.game?.icon && (
                <img
                  src={listing.game.icon}
                  alt=""
                  className="w-3.5 h-3.5 rounded-sm object-contain shrink-0"
                />
              )}
              <span className="font-medium truncate">{listing.game?.name}</span>
              {listing.server && (
                <>
                  <span>•</span>
                  <span className="truncate text-gray-400">
                    [{listing.server}]
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-arcane-gold transition-colors line-clamp-2 leading-snug mb-2">
              {listing.title}
            </h3>

            {/* Specifications Snippet */}
            <div className="mb-3">
              {categoryType === "account" && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {listing.rank && (
                    <span className="px-1.5 py-0.5 rounded bg-[#141319] border border-[#2A2932] text-[10px] text-gray-300 font-medium">
                      {listing.rank}
                    </span>
                  )}
                  {listing.level && (
                    <span className="px-1.5 py-0.5 rounded bg-[#141319] border border-[#2A2932] text-[10px] text-gray-300">
                      Lv.{listing.level}
                    </span>
                  )}
                  {listing.skin_count > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-[#141319] border border-[#2A2932] text-[10px] text-arcane-gold/90">
                      {listing.skin_count} Skins
                    </span>
                  )}
                </div>
              )}

              {(categoryType === "topup" || categoryType === "currency") && (
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="px-1.5 py-0.5 rounded bg-[#141319] border border-[#2A2932] text-gray-300 capitalize">
                    {listing.delivery_method || "Direct Topup"}
                  </span>
                  {listing.region && (
                    <span className="text-gray-400">[{listing.region}]</span>
                  )}
                </div>
              )}

              {categoryType === "boosting" && (
                <div className="flex items-center gap-1 text-[10px] text-text-muted bg-[#141319] px-2 py-0.5 rounded border border-[#2A2932] w-fit">
                  <span className="text-white font-medium">
                    {listing.rank || "Start"}
                  </span>
                  <HiOutlineArrowNarrowRight className="w-3 h-3 text-arcane-gold" />
                  <span className="text-arcane-gold font-bold">
                    {listing.target_rank || "Goal"}
                  </span>
                </div>
              )}

              {categoryType === "items" && (
                <div className="flex items-center gap-1 text-[10px] text-text-muted">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#141319] border border-[#2A2932] text-gray-300">
                    <HiOutlineCube className="w-3 h-3 text-arcane-gold" />{" "}
                    Stock: {listing.quantity || 1}
                  </span>
                  {listing.delivery_method && (
                    <span className="capitalize text-gray-400 truncate">
                      {listing.delivery_method.replace("_", " ")}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Eldorado-Style Seller & Reputation Footer */}
          <div className="pt-2.5 border-t border-[#2A2932]/70">
            <div className="flex items-center justify-between text-[11px] text-text-muted mb-2">
              {/* Seller Avatar + Online badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="relative w-4 h-4 rounded-full bg-arcane-gold flex items-center justify-center overflow-hidden shrink-0">
                  {listing.seller?.avatar_url ? (
                    <img
                      src={listing.seller.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[8px] font-bold text-arcane-gold">
                      {listing.seller?.username?.charAt(0).toUpperCase() || "S"}
                    </span>
                  )}
                  <span className="absolute bottom-0 right-0 w-1 h-1 rounded-full bg-emerald-500" />
                </div>
                <span className="truncate hover:text-white transition-colors font-medium text-gray-300 text-[11px]">
                  {listing.seller?.username || "Verified Seller"}
                </span>
                {listing.seller?.verified_seller && (
                  <HiOutlineShieldCheck
                    className="w-3.5 h-3.5 text-blue-400 shrink-0"
                    title="Verified Seller"
                  />
                )}
              </div>

              {/* Rating + Feedback Count */}
              <div className="flex items-center gap-1 shrink-0 text-[10px]">
                <span className="text-emerald-400 font-bold">
                  {sellerRatingPercent}%
                </span>
                <span className="text-text-muted">({reviewCount})</span>
              </div>
            </div>

            {/* Price & Delivery Time */}
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] text-text-muted block leading-none mb-0.5">
                  {categoryType === "items" ? "Price / Unit" : "Price"}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-arcane-gold tracking-tight">
                  {renderPrice()}
                </span>
              </div>

              <div className="text-right text-[10px] text-text-muted flex items-center gap-1">
                <HiOutlineClock className="w-3 h-3 text-text-muted" />
                <span>{listing.delivery_time || "15"}m</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
