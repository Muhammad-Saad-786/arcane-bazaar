import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineClock, HiOutlineEye } from "react-icons/hi";
import useRecentlyViewedStore from "../../stores/useRecentlyViewedStore";
import useCurrencyStore from "../../stores/useCurrencyStore";

export default function RecentlyViewed() {
  const { items, loading, fetchRecentlyViewed } = useRecentlyViewedStore();
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  if (loading) {
    return (
      <section className="section-container py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-arcane-purple/10 animate-pulse" />
          <div className="h-6 w-40 bg-arcane-surface rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-3 sm:p-4">
              <div className="aspect-video rounded-xl bg-arcane-surface animate-pulse mb-3" />
              <div className="h-4 bg-arcane-surface rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 bg-arcane-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="section-container py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-arcane-purple/10 flex items-center justify-center">
            <HiOutlineClock className="w-4 h-4 text-arcane-purple" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Recently Viewed
            </h2>
            <p className="text-text-muted text-sm">
              Pick up where you left off
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={`/listing/${item.id}`} className="block group">
              <div className="glass-card-hover p-3 sm:p-4">
                {/* Image */}
                <div className="aspect-video rounded-xl bg-arcane-elevated overflow-hidden mb-3">
                  {item.images?.[0]?.url ? (
                    <img
                      src={item.images[0].url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.game?.icon ? (
                        <img
                          src={item.game.icon}
                          alt=""
                          className="w-12 h-12 opacity-20"
                        />
                      ) : (
                        <span className="text-3xl opacity-20">🎮</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Game & Category */}
                <div className="flex items-center gap-2 mb-2">
                  {item.game?.icon && (
                    <img
                      src={item.game.icon}
                      alt=""
                      className="w-4 h-4 rounded"
                    />
                  )}
                  <span className="text-xs text-text-muted">
                    {item.game?.name}
                  </span>
                  {item.category && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-arcane-border text-text-muted capitalize">
                      {item.category.type}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-medium text-white line-clamp-2 mb-2 group-hover:text-arcane-gold-light transition-colors">
                  {item.title}
                </h3>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-bold text-arcane-gold">
                    {item.status === "sold" ? "SOLD" : formatPrice(item.price)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <HiOutlineEye className="w-3 h-3" />
                    {item.views || 0}
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
