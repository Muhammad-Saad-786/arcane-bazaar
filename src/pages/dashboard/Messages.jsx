import { motion } from "framer-motion";
import { HiOutlineMail } from "react-icons/hi";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";

export default function Messages() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Messages
      </h1>
      <GlassCard className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineMail className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">No messages yet</h2>
        <p className="text-text-muted text-sm mt-1">
          Messages with sellers will appear here
        </p>
        <Link to="/marketplace" className="mt-4 inline-block">
          <Button variant="primary">Browse Marketplace</Button>
        </Link>
      </GlassCard>
    </motion.div>
  );
}
