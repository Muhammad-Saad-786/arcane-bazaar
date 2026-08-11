import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineUser,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import SEO from "../../components/ui/SEO";
import Spinner from "../../components/ui/Spinner";

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();
    setArticle(data);
    setLoading(false);

    if (data) {
      // Increment views
      await supabase
        .from("articles")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", data.id);

      // Fetch related
      const { data: relatedData } = await supabase
        .from("articles")
        .select("*")
        .eq("category", data.category)
        .neq("id", data.id)
        .limit(3);
      setRelated(relatedData || []);
    }
  };

  const handleFeedback = async (type) => {
    setFeedback(type);
    if (type === "helpful") {
      await supabase
        .from("articles")
        .update({ helpful_count: (article.helpful_count || 0) + 1 })
        .eq("id", article.id);
    } else {
      await supabase
        .from("articles")
        .update({ not_helpful_count: (article.not_helpful_count || 0) + 1 })
        .eq("id", article.id);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  if (!article)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Article not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={article.title}
        description={article.content?.substring(0, 160)}
      />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-20">
        {/* Back */}
        <Link
          to="/help"
          className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 mb-8"
        >
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Help Center
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Meta */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs text-purple-600 font-medium uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full">
              {article.category}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <HiOutlineClock className="w-3 h-3" />{" "}
              {new Date(article.updated_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <HiOutlineUser className="w-3 h-3" /> {article.author}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">
            {article.title}
          </h1>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Feedback */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-gray-900 font-medium mb-3">
              Did this answer your question?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleFeedback("helpful")}
                className={`text-2xl transition-all ${feedback === "helpful" ? "scale-125" : "hover:scale-110"}`}
                disabled={!!feedback}
              >
                😊
              </button>
              <button
                onClick={() => handleFeedback("not_helpful")}
                className={`text-2xl transition-all ${feedback === "not_helpful" ? "scale-125" : "hover:scale-110"}`}
                disabled={!!feedback}
              >
                😐
              </button>
              {feedback && (
                <span className="text-sm text-gray-500 ml-2">
                  Thanks for your feedback!
                </span>
              )}
            </div>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Related Articles
              </h3>
              <div className="space-y-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/help/article/${r.slug}`}
                    className="block p-4 rounded-xl hover:bg-purple-50 transition-all text-purple-600 hover:text-purple-800 font-medium"
                  >
                    {r.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
