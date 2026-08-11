import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineBookOpen,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlineQuestionMarkCircle,
  HiOutlineUser,
  HiOutlineGlobe,
  HiOutlineSparkles,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import SEO from "../../components/ui/SEO";
import Spinner from "../../components/ui/Spinner";

const categoryConfig = {
  buying: {
    icon: HiOutlineShieldCheck,
    label: "I'm Buying",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  selling: {
    icon: HiOutlineCurrencyDollar,
    label: "I'm Selling",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  faq: {
    icon: HiOutlineQuestionMarkCircle,
    label: "FAQ",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  account: {
    icon: HiOutlineUser,
    label: "Account",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  payments: {
    icon: HiOutlineCurrencyDollar,
    label: "Payments",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  disputes: {
    icon: HiOutlineSparkles,
    label: "Disputes",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  security: {
    icon: HiOutlineShieldCheck,
    label: "Security",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  selling: {
    icon: HiOutlineCurrencyDollar,
    label: "I'm Selling",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
};

export default function HelpCenter() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  // Group articles by category
  const groupedArticles = articles.reduce((acc, article) => {
    if (!acc[article.category]) acc[article.category] = [];
    acc[article.category].push(article);
    return acc;
  }, {});

  // Get most viewed
  const mostViewed = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  // Filter by search
  const searchResults = search
    ? articles.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  // Language selector (placeholder)
  const [language, setLanguage] = useState("English");

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Help Center" />

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/help" className="text-lg font-bold text-gray-900">
            Help Center
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-purple-600 hover:text-arcane-gold"
            >
              ← Back to Arcane Bazaar
            </Link>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600"
            >
              <option>English</option>
              <option>Bahasa Indonesia</option>
              <option>Filipino</option>
              <option>Bahasa Melayu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Welcome to Arcane Bazaar Help Center!
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl mx-auto"
          >
            <div className="relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for articles..."
                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : search ? (
          /* Search Results */
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Search Results for "{search}"
            </h2>
            {searchResults.length === 0 ? (
              <div className="text-center py-20">
                <HiOutlineSearch className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">No articles found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((article) => (
                  <Link
                    key={article.id}
                    to={`/help/article/${article.slug}`}
                    className="block p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
                  >
                    <span className="text-xs text-purple-600 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <h3 className="text-gray-900 font-medium group-hover:text-purple-600 transition-colors mt-1">
                      {article.title}
                    </h3>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {Object.entries(categoryConfig).map(([key, cat]) => {
                const count = groupedArticles[key]?.length || 0;
                if (count === 0) return null;
                const Icon = cat.icon;
                return (
                  <Link
                    key={key}
                    to={`/help/category/${key}`}
                    className={`p-6 rounded-2xl border ${cat.border} ${cat.bg} hover:shadow-lg transition-all group`}
                  >
                    <Icon className={`w-8 h-8 ${cat.color} mb-3`} />
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {count} article{count !== 1 ? "s" : ""}
                    </p>
                  </Link>
                );
              })}
            </div>

            {/* Most Viewed Articles */}
            {mostViewed.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Most Viewed Articles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mostViewed.map((article) => (
                    <Link
                      key={article.id}
                      to={`/help/article/${article.slug}`}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
                    >
                      <div>
                        <span className="text-xs text-purple-600 uppercase tracking-wider">
                          {article.category}
                        </span>
                        <h3 className="text-gray-900 text-sm font-medium group-hover:text-purple-600 transition-colors mt-0.5">
                          {article.title}
                        </h3>
                      </div>
                      <HiOutlineArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
