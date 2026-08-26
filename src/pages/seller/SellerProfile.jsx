import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineStar,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineBadgeCheck,
  HiOutlineClock,
  HiOutlineCheck,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import useSellerStore from "../../stores/useSellerStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import LoyaltyBadge from "../../components/ui/LoyaltyBadge";

const sellerLevels = [
  { name: "New Seller", min: 0, icon: "🌱", color: "text-green-400" },
  { name: "Experienced", min: 10, icon: "📈", color: "text-blue-400" },
  { name: "Professional", min: 50, icon: "💼", color: "text-purple-400" },
  { name: "Elite", min: 200, icon: "👑", color: "text-arcane-gold" },
];

export default function SellerProfile() {
  const { profile } = useAuthStore();
  const { stats } = useSellerStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select(
        `*, reviewer:profiles(username, avatar_url), listing:listings(title, game:games(name))`,
      )
      .eq("seller_id", profile?.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setReviews(data || []);
    setLoading(false);
  };

  const sellerLevel =
    sellerLevels.findLast((l) => (stats.completedOrders || 0) >= l.min) ||
    sellerLevels[0];
  const completionRate =
    stats.completedOrders + stats.pendingOrders > 0
      ? Math.round(
          (stats.completedOrders /
            (stats.completedOrders + stats.pendingOrders)) *
            100,
        )
      : 100;

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
      className="space-y-6 max-w-full mx-auto"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Profile & Reviews
      </h1>

      {/* Profile Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-arcane-gold flex items-center justify-center text-3xl font-bold text-white overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              profile?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">
                {profile?.username}
              </h2>
              {profile?.verified_seller && (
                <HiOutlineBadgeCheck className="w-6 h-6 text-blue-400" />
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${sellerLevel.color} bg-white/5`}
              >
                {sellerLevel.icon} {sellerLevel.name}
              </span>
            </div>
            <p className="text-text-muted text-sm mt-1">
              Joined{" "}
              {new Date(profile?.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: "Rating", value: `${stats.avgRating || "New"} ★` },
                { label: "Orders", value: stats.completedOrders },
                { label: "Completion", value: `${completionRate}%` },
                {
                  label: "Trust Score",
                  value: `${profile?.trust_score || 100}%`,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-3 bg-[#1E1D24] rounded-xl"
                >
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-text-muted text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Reviews */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">
            No reviews yet
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 bg-[#1E1D24] rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-arcane-purple to-arcane-gold flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {review.reviewer?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">
                        {review.reviewer?.username}
                      </p>
                      <span className="text-xs text-text-muted">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex text-arcane-gold text-sm mt-1">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    {review.comment && (
                      <p className="text-text-secondary text-sm mt-2">
                        {review.comment}
                      </p>
                    )}
                    {review.listing && (
                      <p className="text-text-muted text-xs mt-2">
                        {review.listing?.game?.name} • {review.listing?.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
