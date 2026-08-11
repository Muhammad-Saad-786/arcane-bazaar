import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineArrowLeft, HiOutlineBookOpen } from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import SEO from "../../components/ui/SEO";
import Spinner from "../../components/ui/Spinner";

const categoryLabels = {
  buying: "I'm Buying",
  selling: "I'm Selling",
  faq: "FAQ",
  account: "Account",
  payments: "Payments",
  disputes: "Disputes",
  security: "Security",
};

export default function CategoryPage() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [category]);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("category", category)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  const label = categoryLabels[category] || category;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={`${label} - Help Center`} />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/help" className="text-lg font-bold text-gray-900">
            Help Center
          </Link>
          <Link
            to="/"
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            ← Back to Arcane Bazaar
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          to="/help"
          className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 mb-6"
        >
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Help Center
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
          {label}
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <HiOutlineBookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No articles in this category yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/help/article/${article.slug}`}
                className="block p-5 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
              >
                <h3 className="text-gray-900 font-semibold group-hover:text-purple-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {article.content?.replace(/<[^>]*>/g, "").substring(0, 150)}
                  ...
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
