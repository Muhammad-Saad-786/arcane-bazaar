import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import {
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineCube,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
  HiOutlineCog,
} from "react-icons/hi";

const categoryIcons = {
  account: HiOutlineUser,
  topup: HiOutlineCurrencyDollar,
  boosting: HiOutlineTrendingUp,
  currency: HiOutlineCube,
  items: HiOutlineSparkles,
  coaching: HiOutlineAcademicCap,
  service: HiOutlineCog,
};

const categoryColors = {
  account: "text-blue-400 bg-blue-500/10",
  topup: "text-green-400 bg-green-500/10",
  boosting: "text-orange-400 bg-orange-500/10",
  currency: "text-amber-400 bg-amber-500/10",
  items: "text-purple-400 bg-purple-500/10",
  coaching: "text-cyan-400 bg-cyan-500/10",
  service: "text-pink-400 bg-pink-500/10",
};

export default function CategoryGrid({ gameSlug }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gameSlug) fetchCategories();
  }, [gameSlug]);

  const fetchCategories = async () => {
    setLoading(true);
    let query = supabase
      .from("listing_categories")
      .select("*, game:games(name, slug)");

    if (gameSlug && gameSlug !== "all") {
      query = query.eq("game.slug", gameSlug);
    }

    const { data } = await query.order("type").limit(12);
    setCategories(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-arcane-surface animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {categories.map((cat) => {
        const Icon = categoryIcons[cat.type] || HiOutlineCube;
        const colors =
          categoryColors[cat.type] || "text-gray-400 bg-gray-500/10";

        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={`/marketplace?game=${cat.game?.slug}&category=${cat.slug}`}
              className="glass-card-hover p-4 sm:p-5 flex flex-col items-center text-center gap-3 h-full"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colors} flex items-center justify-center`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{cat.name}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {cat.game?.name}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
