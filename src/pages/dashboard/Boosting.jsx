import { motion } from "framer-motion";
import { HiOutlineTrendingUp } from "react-icons/hi";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";

export default function Boosting() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Boosting Services
      </h1>
      <GlassCard className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-arcane-purple/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineTrendingUp className="w-8 h-8 text-arcane-purple" />
        </div>
        <h2 className="text-lg font-semibold text-white">No boosting orders</h2>
        <p className="text-text-muted text-sm mt-1">
          Your rank boosting and power leveling orders will appear here
        </p>
        <Link to="/marketplace?category=boosting" className="mt-4 inline-block">
          <Button variant="primary">Browse Boosting</Button>
        </Link>
      </GlassCard>
    </motion.div>
  );
}
