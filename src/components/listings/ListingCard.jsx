import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineEye, HiOutlineHeart, HiHeart } from "react-icons/hi";
import useCurrencyStore from "../../stores/useCurrencyStore";
import useWishlistStore from "../../stores/useWishlistStore";

export default function ListingCard({ listing }) {
  const { formatPrice } = useCurrencyStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const isWishlisted = wishlistIds.includes(listing.id);
  const isSold = listing.status === "sold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="glass-card-hover p-3 sm:p-4 relative overflow-hidden group">
          {/* Status Badge */}
          {isSold && (
            <div className="absolute top-3 left-3 z-20 px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-lg">
              SOLD
            </div>
          )}
          {listing.status === "pending" && (
            <div className="absolute top-3 left-3 z-20 px-2 py-1 bg-yellow-500/90 text-white text-xs font-bold rounded-lg">
              PENDING
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(listing.id);
            }}
            className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-arcane-dark/80 hover:bg-arcane-dark transition-all"
          >
            {isWishlisted ? (
              <HiHeart className="w-4 h-4 text-red-400" />
            ) : (
              <HiOutlineHeart className="w-4 h-4 text-text-muted hover:text-red-400 transition-colors" />
            )}
          </button>

          {/* Image */}
          <div className="aspect-video rounded-xl bg-arcane-elevated overflow-hidden mb-3 relative">
            {listing.images?.[0]?.url ? (
              <img
                src={listing.images[0].url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {listing.game?.icon ? (
                  <img
                    src={listing.game.icon}
                    alt=""
                    className="w-12 h-12 opacity-30"
                  />
                ) : (
                  <span className="text-3xl opacity-30">🎮</span>
                )}
              </div>
            )}
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-arcane-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
              <span className="text-white text-sm font-medium bg-arcane-purple/90 px-4 py-2 rounded-xl">
                View Details
              </span>
            </div>
          </div>

          {/* Game & Category */}
          <div className="flex items-center gap-2 mb-2">
            {listing.game?.icon && (
              <img src={listing.game.icon} alt="" className="w-4 h-4 rounded" />
            )}
            <span className="text-xs text-text-muted">
              {listing.game?.name}
            </span>
            {listing.category && (
              <>
                <span className="text-text-muted">·</span>
                <span className="text-xs text-text-muted capitalize">
                  {listing.category.type}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
            {listing.title}
          </h3>

          {/* Price & Views */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-arcane-gold">
              {isSold ? "SOLD" : formatPrice(listing.price)}
            </span>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <HiOutlineEye className="w-3 h-3" />
              {listing.views || 0}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
