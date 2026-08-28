import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCollection,
  HiOutlineShoppingBag,
  HiOutlineStar,
  HiOutlineArrowRight,
  HiOutlineUpload,
  HiOutlineShieldCheck,
  HiOutlineTrendingUp,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlineExternalLink,
} from "react-icons/hi";
import useSellerStore from "../../stores/useSellerStore";
import useAuthStore from "../../stores/useAuthStore";
import Button from "../../components/ui/Button";
import SEO from "../../components/ui/SEO";

const statusBadges = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  accepted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  delivered: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  disputed: "bg-red-500/15 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export default function SellerOverview() {
  const {
    stats,
    fetchStats,
    listings,
    orders,
    fetchListings,
    fetchOrders,
    getSellerLevel,
  } = useSellerStore();

  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const level = getSellerLevel();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchListings(), fetchOrders()]).finally(() =>
      setLoading(false),
    );
  }, []);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const statCards = [
    {
      label: "Total Net Revenue",
      value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
      icon: HiOutlineCurrencyDollar,
      color: "text-arcane-gold",
      bg: "bg-arcane-gold/10",
      border: "border-arcane-gold/30",
      link: "/seller-dashboard/revenue",
    },
    {
      label: "Active Listings",
      value: stats.activeListings || 0,
      icon: HiOutlineCollection,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      link: "/seller-dashboard/listings",
    },
    {
      label: "Orders Pending Action",
      value: stats.pendingOrders || 0,
      icon: HiOutlineShoppingBag,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      link: "/seller-dashboard/orders?filter=pending",
      highlight: stats.pendingOrders > 0,
    },
    {
      label: "Customer Rating",
      value:
        stats.avgRating && stats.avgRating > 0
          ? `${stats.avgRating} ★`
          : "New (5.0)",
      icon: HiOutlineStar,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      link: "/seller-dashboard/profile",
    },
  ];

  // Calculate Tier Progress
  const completedOrders = stats.completedOrders || 0;
  const nextTierGoal = level.minOrders > 0 ? level.minOrders : 10;
  const progressPercent = Math.min(
    100,
    Math.round((completedOrders / nextTierGoal) * 100),
  );

  return (
    <>
      <SEO title="Merchant Dashboard Overview | Arcane Bazaar" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-6xl"
      >
        {/* ================= TOP WELCOME & MERCHANT TIER BANNER ================= */}
        <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left: Greeting & Status */}
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-xl bg-[#141319] border border-[#2A2932] flex items-center justify-center font-bold text-arcane-gold text-lg overflow-hidden shrink-0 shadow-md">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.username?.charAt(0).toUpperCase() || "M"
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#18171E]" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                    Welcome back, {profile?.username || "Merchant"}
                  </h1>
                  {profile?.verified_seller && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                      <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Verified
                      Seller
                    </span>
                  )}
                </div>
                <p className="text-text-muted text-xs sm:text-sm mt-0.5">
                  Manage your active trade listings, fulfill customer orders,
                  and track revenue payouts.
                </p>
              </div>
            </div>

            {/* Right: Seller Tier Badge & Platform Fee */}
            <div className="flex items-center gap-4 bg-[#141319] border border-[#2A2932] p-3 rounded-xl shrink-0">
              <div className="text-2xl">{level.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${level.color}`}
                  >
                    {level.name}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1E1D24] text-[10px] text-text-muted border border-[#2A2932]">
                    Fee: {level.fee}
                  </span>
                </div>
                <div className="w-36 bg-[#1E1D24] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-arcane-gold h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-muted mt-1 block">
                  {completedOrders} completed orders
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= METRIC KPI STATS GRID ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} to={stat.link} className="block group">
                <div
                  className={`p-5 bg-[#18171E] hover:bg-[#1E1D24] border border-[#2A2932] rounded-2xl transition-all shadow-md group-hover:border-arcane-gold/40 relative overflow-hidden ${
                    stat.highlight
                      ? "ring-1 ring-amber-500/40 bg-amber-500/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 border ${stat.border}`}
                    >
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <HiOutlineArrowRight className="w-4 h-4 text-text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <div className="text-2xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-text-muted text-xs mt-1 font-medium">
                    {stat.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ================= QUICK ACTIONS TOOLBAR ================= */}
        <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Quick Merchant Actions
            </span>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link to="/sell">
                <Button
                  variant="gold"
                  size="sm"
                  className="font-bold flex items-center gap-1.5 shadow-md shadow-arcane-gold/20"
                >
                  <HiOutlineUpload className="w-4 h-4" /> Create Listing
                </Button>
              </Link>

              <Link to="/seller-dashboard/orders">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-[#2A2932] text-xs"
                >
                  Manage Orders ({orders.length})
                </Button>
              </Link>

              <Link to="/seller-dashboard/revenue">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-[#2A2932] text-xs"
                >
                  Withdraw Funds
                </Button>
              </Link>

              <Link to={`/seller/${profile?.username}`} target="_blank">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-[#2A2932] text-xs flex items-center gap-1 text-arcane-gold"
                >
                  <HiOutlineExternalLink className="w-3.5 h-3.5" /> View Public
                  Store
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ================= 2-COLUMN BOTTOM SECTION (RECENT ORDERS & RECENT LISTINGS) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Card */}
          <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2932] mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <HiOutlineShoppingBag className="w-5 h-5 text-arcane-gold" />{" "}
                    Recent Customer Orders
                  </h2>
                  <p className="text-text-muted text-xs mt-0.5">
                    Latest trade orders placed for your listings
                  </p>
                </div>
                <Link
                  to="/seller-dashboard/orders"
                  className="text-xs text-arcane-gold hover:underline font-semibold flex items-center gap-1"
                >
                  View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  <HiOutlineShoppingBag className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-30" />
                  No customer orders received yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {orders.slice(0, 4).map((order) => {
                    const statusClass =
                      statusBadges[order.status] || statusBadges.pending;
                    return (
                      <div
                        key={order.id}
                        className="p-3 bg-[#141319] hover:bg-[#1E1D24] border border-[#2A2932] rounded-xl flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Game Icon Chip */}
                          <div className="w-10 h-10 rounded-xl bg-[#18171E] border border-[#2A2932] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                            {order.listing?.game?.icon ? (
                              <img
                                src={order.listing.game.icon}
                                alt=""
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentElement.innerHTML =
                                    '<span class="text-base">🎮</span>';
                                }}
                              />
                            ) : (
                              <span className="text-base">🎮</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {order.listing?.title || "Order"}
                            </h4>
                            {/* Buyer Mini Identity */}
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-muted">
                              <div className="w-4 h-4 rounded-full bg-[#2A2932] overflow-hidden shrink-0 flex items-center justify-center text-[8px] text-arcane-gold font-bold">
                                {order.buyer?.avatar_url ? (
                                  <img
                                    src={order.buyer.avatar_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  order.buyer?.username
                                    ?.charAt(0)
                                    .toUpperCase() || "B"
                                )}
                              </div>
                              <span className="truncate text-gray-300 font-medium">
                                {order.buyer?.username || "Buyer"}
                              </span>
                              <span>•</span>
                              <span>{formatTimeAgo(order.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-arcane-gold block">
                            ${order.amount}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${statusClass}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Listings Card */}
          <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2932] mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <HiOutlineCollection className="w-5 h-5 text-blue-400" />{" "}
                    Active Trade Listings
                  </h2>
                  <p className="text-text-muted text-xs mt-0.5">
                    Your published offers visible in the marketplace
                  </p>
                </div>
                <Link
                  to="/seller-dashboard/listings"
                  className="text-xs text-arcane-gold hover:underline font-semibold flex items-center gap-1"
                >
                  View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {listings.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  <p className="mb-3">
                    You haven&apos;t published any listings yet.
                  </p>
                  <Link to="/sell">
                    <Button variant="gold" size="sm" className="font-bold">
                      Create Your First Listing
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {listings.slice(0, 4).map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/listing/${listing.id}`}
                      className="p-3 bg-[#141319] hover:bg-[#1E1D24] border border-[#2A2932] rounded-xl flex items-center justify-between gap-3 transition-all block group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#18171E] border border-[#2A2932] overflow-hidden shrink-0 flex items-center justify-center">
                          {listing.images?.[0]?.url ? (
                            <img
                              src={listing.images[0].url}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : listing.game?.icon ? (
                            <img
                              src={listing.game.icon}
                              alt=""
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="text-base">🎮</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-arcane-gold transition-colors">
                            {listing.title}
                          </h4>
                          <span className="text-[11px] text-text-muted block truncate">
                            {listing.game?.name} •{" "}
                            <span className="capitalize">
                              {listing.category?.name || "Offer"}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-arcane-gold block">
                          ${listing.price}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold block">
                          ● Active
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
