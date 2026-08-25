import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import SEO from "../../components/ui/SEO";
import emptyBoostingImage from "/public/icons/pages/empty-orders.png";

export default function Boosting() {
  return (
    <>
      <SEO title="My Boosting" />
      <h1 className="text-2xl font-display font-extrabold text-white">
        My Boosting
      </h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="flex flex-col items-center justify-center py-12 px-4">
          {/* PNG Image */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 mb-6">
            <img
              src={emptyBoostingImage}
              alt="No boosting"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-white text-center">
            No boosting yet
          </h2>

          <Link to="/marketplace" className="mt-6">
            <Button variant="primary" size="lg">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </motion.div>
    </>
  );
}
