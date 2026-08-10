import { motion } from "framer-motion";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";

export default function Offers() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Special Offers
      </h1>
      <GlassCard className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-arcane-gold/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineCurrencyDollar className="w-8 h-8 text-arcane-gold" />
        </div>
        <h2 className="text-lg font-semibold text-white">
          No offers available
        </h2>
        <p className="text-text-muted text-sm mt-1">
          Special deals and discounts will appear here
        </p>
        <Link to="/marketplace" className="mt-4 inline-block">
          <Button variant="primary">Browse Marketplace</Button>
        </Link>
      </GlassCard>
    </motion.div>
  );
}
