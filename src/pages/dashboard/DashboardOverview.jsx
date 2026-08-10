import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineStar,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, points: 0 });
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { count: orders } = await supabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("buyer_id", user.id);
    const { count: wishlist } = await supabase
      .from("wishlist")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("loyalty_points")
      .eq("id", user.id)
      .single();

    setStats({
      orders: orders || 0,
      wishlist: wishlist || 0,
      points: profile?.loyalty_points || 0,
    });

    // Fetch recent listings across all games
    const { data: listings } = await supabase
      .from("listings")
      .select(
        `*, game:games(name, slug, icon), category:listing_categories(name, type), images:listing_images(url, is_cover)`,
      )
      .eq("status", "active")
      .eq("approval_status", "approved")
      .order("views", { ascending: false })
      .limit(6);

    setRecentListings(listings || []);
  };

  const quickStats = [
    {
      label: "My Orders",
      value: stats.orders,
      icon: HiOutlineShoppingBag,
      color: "text-arcane-purple",
      href: "/dashboard/orders",
    },
    {
      label: "Wishlist",
      value: stats.wishlist,
      icon: HiOutlineHeart,
      color: "text-red-400",
      href: "/dashboard/wishlist",
    },
    {
      label: "Loyalty Points",
      value: stats.points,
      icon: HiOutlineStar,
      color: "text-arcane-gold",
      href: "/dashboard/loyalty",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Welcome back, {user?.email?.split("@")[0]}
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Here's what's happening with your account.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={stat.href}>
              <GlassCard className="p-5 hover:border-arcane-purple/30 transition-all">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
                <div className="text-2xl font-extrabold text-white">
                  {stat.value}
                </div>
                <div className="text-text-muted text-sm mt-1">{stat.label}</div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/marketplace">
            <Button variant="primary" size="sm">
              Browse Marketplace
            </Button>
          </Link>
          <Link to="/dashboard/orders">
            <Button variant="ghost" size="sm">
              View Orders
            </Button>
          </Link>
          <Link to="/dashboard/wallet">
            <Button variant="ghost" size="sm">
              Wallet
            </Button>
          </Link>
        </div>
      </GlassCard>

      {/* Trending Across All Games */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Trending Now</h2>
          <Link
            to="/marketplace"
            className="text-sm text-arcane-purple hover:text-arcane-gold-light flex items-center gap-1"
          >
            View All <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentListings.map((listing) => (
            <Link key={listing.id} to={`/listing/${listing.id}`}>
              <GlassCard className="p-4 hover:border-arcane-purple/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-arcane-elevated overflow-hidden flex-shrink-0">
                    {listing.images?.[0]?.url ? (
                      <img
                        src={listing.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        {listing.game?.icon ? (
                          <img
                            src={listing.game.icon}
                            alt=""
                            className="w-6 h-6"
                          />
                        ) : (
                          "🎮"
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-arcane-gold-light transition-colors">
                      {listing.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-muted">
                        {listing.game?.name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-arcane-border text-text-muted capitalize">
                        {listing.category?.type}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-arcane-gold mt-1">
                      ${listing.price}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
