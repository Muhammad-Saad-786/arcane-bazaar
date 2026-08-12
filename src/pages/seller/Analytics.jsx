import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineFire,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import useSellerStore from "../../stores/useSellerStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

export default function Analytics() {
  const { user } = useAuthStore();
  const { stats } = useSellerStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: orders } = await supabase
      .from("orders")
      .select(
        "*, listing:listings(game_id, category_id, game:games(name), category:listing_categories(name))",
      )
      .eq("seller_id", user.id);
    const { data: listings } = await supabase
      .from("listings")
      .select("views, sales")
      .eq("seller_id", user.id);

    const totalViews = listings?.reduce((s, l) => s + (l.views || 0), 0) || 0;
    const totalSales = listings?.reduce((s, l) => s + (l.sales || 0), 0) || 0;
    const conversionRate =
      totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(1) : 0;

    const gameRevenue = {};
    const categoryRevenue = {};
    orders?.forEach((o) => {
      const game = o.listing?.game?.name || "Unknown";
      const cat = o.listing?.category?.name || "Unknown";
      gameRevenue[game] = (gameRevenue[game] || 0) + parseFloat(o.amount || 0);
      categoryRevenue[cat] =
        (categoryRevenue[cat] || 0) + parseFloat(o.amount || 0);
    });

    setAnalytics({
      totalViews,
      totalSales,
      conversionRate,
      topGames: Object.entries(gameRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topCategories: Object.entries(categoryRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      monthlySales:
        orders?.filter(
          (o) =>
            new Date(o.created_at) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        ).length || 0,
    });
    setLoading(false);
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Analytics
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Track your performance and growth
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Views",
            value: analytics?.totalViews?.toLocaleString() || "0",
            icon: "👁",
            color: "text-blue-400",
          },
          {
            label: "Total Sales",
            value: analytics?.totalSales || "0",
            icon: "💰",
            color: "text-arcane-gold",
          },
          {
            label: "Conversion Rate",
            value: `${analytics?.conversionRate || 0}%`,
            icon: "📈",
            color: "text-green-400",
          },
          {
            label: "Monthly Sales",
            value: analytics?.monthlySales || "0",
            icon: "📅",
            color: "text-purple-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`text-xl font-extrabold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-text-muted text-xs mt-1">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Top Games by Revenue
          </h2>
          {analytics?.topGames?.length === 0 ? (
            <p className="text-text-muted text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics?.topGames.map(([game, revenue], i) => (
                <div key={game} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-muted w-6">
                      {i + 1}
                    </span>
                    <span className="text-white text-sm">{game}</span>
                  </div>
                  <span className="text-arcane-gold font-bold text-sm">
                    ${revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Top Categories by Revenue
          </h2>
          {analytics?.topCategories?.length === 0 ? (
            <p className="text-text-muted text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics?.topCategories.map(([cat, revenue], i) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-muted w-6">
                      {i + 1}
                    </span>
                    <span className="text-white text-sm">{cat}</span>
                  </div>
                  <span className="text-arcane-gold font-bold text-sm">
                    ${revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}
