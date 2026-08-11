import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineStar,
  HiOutlineEmojiHappy,
  HiOutlineEmojiSad,
  HiOutlineCheck,
  HiOutlineX,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import SEO from "../../components/ui/SEO";

const ITEMS_PER_PAGE = 10;

export default function Feedback() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    negative: 0,
    score: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchReviews();
    }
  }, [user, currentPage, activeTab]);

  const fetchStats = async () => {
    const { data, count } = await supabase
      .from("reviews")
      .select("rating", { count: "exact" })
      .eq("seller_id", user.id);

    if (data) {
      const total = data.length;
      const positive = data.filter((r) => r.rating >= 4).length;
      const negative = data.filter((r) => r.rating <= 2).length;
      const score = total > 0 ? Math.round((positive / total) * 100) : 0;

      setStats({ total, positive, negative, score });
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("reviews")
      .select(
        `*, reviewer:profiles!reviews_reviewer_id_fkey(username, avatar_url), listing:listings(title, game:games(name))`,
        { count: "exact" },
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (activeTab === "positive") {
      query = query.gte("rating", 4);
    } else if (activeTab === "negative") {
      query = query.lte("rating", 2);
    }

    const { data, count } = await query.range(from, to);

    setReviews(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-3xl"
    >
      <SEO title="Feedback & Reviews" />

      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Feedback
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Reviews from your completed orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Completed Orders",
            value: stats.total,
            icon: "📦",
            color: "text-blue-400",
          },
          {
            label: "Positive Feedback",
            value: stats.positive,
            icon: "👍",
            color: "text-green-400",
          },
          {
            label: "Negative Feedback",
            value: stats.negative,
            icon: "👎",
            color: "text-red-400",
          },
          {
            label: "Feedback Score",
            value: `${stats.score}%`,
            icon: "⭐",
            color: "text-arcane-gold",
          },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-xl font-extrabold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-text-muted text-xs mt-1">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-arcane-border pb-2">
        {[
          { id: "all", label: `All (${stats.total})` },
          { id: "positive", label: `Positive (${stats.positive})` },
          { id: "negative", label: `Negative (${stats.negative})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-arcane-purple/20 text-arcane-purple"
                : "text-text-muted hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : reviews.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-arcane-purple/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineStar className="w-8 h-8 text-arcane-purple" />
          </div>
          <h3 className="text-lg font-semibold text-white">No reviews yet</h3>
          <p className="text-text-muted text-sm mt-1">
            {activeTab === "all"
              ? "Reviews from buyers will appear here after completed orders"
              : `No ${activeTab} reviews`}
          </p>
        </GlassCard>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <GlassCard key={review.id} className="p-5">
                <div className="flex items-start gap-4">
                  {/* Reviewer Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-arcane-purple to-arcane-gold flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                    {review.reviewer?.avatar_url ? (
                      <img
                        src={review.reviewer.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      review.reviewer?.username?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-medium text-sm">
                          {review.reviewer?.username}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex text-arcane-gold text-sm">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </div>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-xs text-text-muted">
                            {review.listing?.game?.name}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-text-muted flex-shrink-0">
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-text-secondary text-sm mt-2">
                        {review.comment}
                      </p>
                    )}

                    {review.listing?.title && (
                      <p className="text-text-muted text-xs mt-2">
                        Order: {review.listing.title}
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-xl text-sm text-text-muted hover:text-white hover:bg-arcane-surface disabled:opacity-30 transition-all"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      currentPage === page
                        ? "bg-arcane-purple text-white"
                        : "text-text-muted hover:bg-arcane-surface hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-xl text-sm text-text-muted hover:text-white hover:bg-arcane-surface disabled:opacity-30 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
