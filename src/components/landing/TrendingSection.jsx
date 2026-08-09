import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineFire,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineStar,
} from "react-icons/hi";
import useGamesStore from "../../stores/useGamesStore";
import useCurrencyStore from "../../stores/useCurrencyStore";

export default function TrendingSection() {
  const { trendingListings } = useGamesStore();
  const { formatPrice } = useCurrencyStore();

  return (
    <section className="section-container py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-arcane-gold/10 flex items-center justify-center">
            <HiOutlineFire className="w-4 h-4 text-arcane-gold" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Trending Now
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Most viewed listings today
            </p>
          </div>
        </div>
        <Link
          to="/marketplace?sort=trending"
          className="text-sm text-arcane-purple hover:text-arcane-purple-hover flex items-center gap-1 whitespace-nowrap"
        >
          View All <HiOutlineArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {trendingListings.slice(0, 8).map((listing, i) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={`/listing/${listing.id}`} className="block group">
              <div className="glass-card-hover p-3 sm:p-4">
                {/* Image */}
                <div className="aspect-video rounded-xl bg-arcane-elevated overflow-hidden mb-3 relative">
                  {listing.images?.[0]?.url ? (
                    <img
                      src={listing.images[0].url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {listing.game?.icon ? (
                        <img
                          src={listing.game.icon}
                          alt=""
                          className="w-12 h-12 opacity-20"
                        />
                      ) : (
                        <span className="text-3xl opacity-20">🎮</span>
                      )}
                    </div>
                  )}
                  {/* Trending Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-arcane-gold/90 text-arcane-dark text-xs font-bold rounded-lg flex items-center gap-1">
                    <HiOutlineFire className="w-3 h-3" />
                    Trending
                  </div>
                </div>

                {/* Game & Category */}
                <div className="flex items-center gap-2 mb-2">
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

                {/* Title */}
                <h3 className="text-sm font-medium text-white line-clamp-2 mb-2 group-hover:text-arcane-purple transition-colors">
                  {listing.title}
                </h3>

                {/* Price & Stats */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-arcane-gold">
                    {formatPrice(listing.price)}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <HiOutlineEye className="w-3 h-3" /> {listing.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
