import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineEye, HiOutlineFire, HiOutlineStar } from "react-icons/hi";
import useCurrencyStore from "../../stores/useCurrencyStore";

export default function TrendingCard({ listing, index }) {
  const { formatPrice } = useCurrencyStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/listing/${listing.id}`} className="block group">
        <div className="glass-card-hover p-3 sm:p-4 flex gap-3 sm:gap-4">
          {/* Rank Badge */}
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-arcane-purple/20 flex items-center justify-center text-sm font-bold text-arcane-purple">
            {index + 1}
          </div>

          {/* Image */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-arcane-elevated overflow-hidden flex-shrink-0">
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
                    className="w-8 h-8 opacity-30"
                  />
                ) : (
                  <span className="text-2xl opacity-30">🎮</span>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {listing.game?.icon && (
                <img
                  src={listing.game.icon}
                  alt=""
                  className="w-4 h-4 rounded"
                />
              )}
              <span className="text-xs text-text-muted">
                {listing.game?.name}
              </span>
              {listing.category && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-arcane-border text-text-muted capitalize">
                  {listing.category.type}
                </span>
              )}
            </div>

            <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-arcane-purple transition-colors">
              {listing.title}
            </h3>

            <div className="flex items-center justify-between mt-2">
              <span className="text-base sm:text-lg font-bold text-arcane-gold">
                {formatPrice(listing.price)}
              </span>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <div className="flex items-center gap-1">
                  <HiOutlineEye className="w-3 h-3" />
                  {listing.views || 0}
                </div>
                {listing.rating && (
                  <div className="flex items-center gap-1">
                    <HiOutlineStar className="w-3 h-3 text-arcane-gold" />
                    {listing.rating}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
