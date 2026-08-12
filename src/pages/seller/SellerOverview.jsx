import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCollection,
  HiOutlineShoppingBag,
  HiOutlineStar,
  HiOutlineArrowRight,
  HiOutlineUpload,
} from "react-icons/hi";
import useSellerStore from "../../stores/useSellerStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";

export default function SellerOverview() {
  const { stats, fetchStats, listings, orders, fetchListings, fetchOrders } =
    useSellerStore();
  const { getSellerLevel } = useSellerStore();
  const level = getSellerLevel();
  useEffect(() => {
    fetchStats();
    fetchListings();
    fetchOrders();
  }, []);

  const statCards = [
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue?.toFixed(2) || "0.00"}`,
      icon: HiOutlineCurrencyDollar,
      color: "text-arcane-gold",
      bg: "bg-arcane-gold/10",
    },
    {
      label: "Active Listings",
      value: stats.activeListings,
      icon: HiOutlineCollection,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: HiOutlineShoppingBag,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Avg Rating",
      value: `${stats.avgRating || "New"}`,
      icon: HiOutlineStar,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
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
          Seller Dashboard
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Welcome back, manage your listings and track earnings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5 border-t-2 border-t-arcane-gold/30 hover:border-t-arcane-gold transition-all">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-extrabold text-white">
                {stat.value}
              </div>
              <div className="text-text-muted text-sm mt-1">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
        <GlassCard className="p-5 border-t-2 border-t-arcane-gold/30">
          <div
            className={`w-10 h-10 rounded-xl ${level.bg} flex items-center justify-center mb-3`}
          >
            <span className="text-xl">{level.icon}</span>
          </div>
          <div className={`text-lg font-bold ${level.color}`}>{level.name}</div>
          <div className="text-text-muted text-xs mt-1">
            Fee: {level.fee} per sale
          </div>
          {level.minOrders > 0 && (
            <div className="text-text-muted text-xs mt-1">
              {level.minOrders - (stats.completedOrders || 0)} orders to next
              level
            </div>
          )}
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/sell">
            <Button variant="gold" size="sm">
              <HiOutlineUpload className="w-4 h-4" /> Create Listing
            </Button>
          </Link>
          <Link to="/seller-dashboard/orders">
            <Button variant="ghost" size="sm">
              View Orders
            </Button>
          </Link>
          <Link to="/seller-dashboard/revenue">
            <Button variant="ghost" size="sm">
              Withdraw Earnings
            </Button>
          </Link>
        </div>
      </GlassCard>

      {/* Recent Orders */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Link
            to="/seller-dashboard/orders"
            className="text-sm text-arcane-gold hover:text-arcane-gold-light flex items-center gap-1"
          >
            View All <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">
            No orders yet
          </p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1E1D24] transition-all"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    {order.listing?.title || "Order"}
                  </p>
                  <p className="text-text-muted text-xs">
                    Buyer: {order.buyer?.username} •{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-arcane-gold font-bold">${order.amount}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${order.status === "pending" ? "bg-amber-500/20 text-amber-400" : order.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Recent Listings */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">My Listings</h2>
          <Link
            to="/seller-dashboard/listings"
            className="text-sm text-arcane-gold hover:text-arcane-gold-light flex items-center gap-1"
          >
            View All <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {listings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">No listings yet</p>
            <Link to="/sell">
              <Button variant="gold" size="sm" className="mt-3">
                Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {listings.slice(0, 3).map((listing) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="glass-card-hover p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1E1D24] overflow-hidden flex-shrink-0">
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
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      {listing.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {listing.game?.name} • {listing.category?.name}
                    </p>
                    <p className="text-arcane-gold font-bold text-sm mt-1">
                      ${listing.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
