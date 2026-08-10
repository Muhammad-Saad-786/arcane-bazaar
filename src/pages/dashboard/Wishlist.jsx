import { motion } from "framer-motion";
import { HiOutlineHeart } from "react-icons/hi";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";

export default function Wishlist() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        My Wishlist
      </h1>
      <GlassCard className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineHeart className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">
          Your wishlist is empty
        </h2>
        <p className="text-text-muted text-sm mt-1">
          Save items you like for later
        </p>
        <Link to="/marketplace" className="mt-4 inline-block">
          <Button variant="primary">Browse Marketplace</Button>
        </Link>
      </GlassCard>
    </motion.div>
  );
}
