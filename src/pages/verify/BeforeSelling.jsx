import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineBadgeCheck,
  HiOutlineClock,
  HiOutlineLockClosed,
  HiOutlineExclamation,
  HiOutlineBan,
  HiOutlineArrowRight,
  HiOutlineClipboardCheck,
} from "react-icons/hi";
import Button from "../../components/ui/Button";

const expectations = [
  {
    icon: HiOutlineBadgeCheck,
    title: "Professional Conduct",
    desc: "Be clear, polite and honest in listings and chats.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: HiOutlineClock,
    title: "Reliable Delivery",
    desc: "Deliver on time. Mark the order as complete only after successful delivery.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: HiOutlineLockClosed,
    title: "Platform Integrity",
    desc: "Keep all communication and payments on Arcane Bazaar for safety.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

const keepInMind = [
  {
    icon: HiOutlineExclamation,
    title: "Refunds",
    desc: "Buyers can get refunds for false, incomplete or late deliveries.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: HiOutlineBan,
    title: "Account Suspension",
    desc: "Repeated or serious violations can lead to temporary or permanent suspension.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: HiOutlineLockClosed,
    title: "Payout Holds",
    desc: "Funds may be held during confirmed fraud or security investigations.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
];

export default function BeforeSelling() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-arcane-dark pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-arcane-purple/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineClipboardCheck className="w-8 h-8 text-arcane-purple" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Before You{" "}
            <span className="text-arcane-gold-light">Start Selling</span>
          </h1>
          <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
            Here's what we expect from every seller and what to know before
            starting verification, which only takes a few minutes.
          </p>
        </motion.div>

        {/* What We Expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <HiOutlineShieldCheck className="w-6 h-6 text-arcane-purple" />
            What We Expect from Sellers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {expectations.map((item, i) => (
              <div
                key={item.title}
                className={`glass-card p-6 ${item.bg} border-${item.color}/20`}
              >
                <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                <h3 className="text-white font-semibold text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-text-muted text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What to Keep in Mind */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <HiOutlineExclamation className="w-6 h-6 text-arcane-gold" />
            What to Keep in Mind
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {keepInMind.map((item, i) => (
              <div
                key={item.title}
                className={`glass-card p-6 ${item.bg} border-${item.color}/20`}
              >
                <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                <h3 className="text-white font-semibold text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-text-muted text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            onClick={() => navigate("/verify/seller-details")}
            variant="gold"
            size="lg"
          >
            <HiOutlineShieldCheck className="w-5 h-5" />
            Continue to Verification
            <HiOutlineArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-text-muted text-xs mt-3">
            You'll be redirected to Ondato to confirm your ID • Takes ~5 minutes
          </p>
        </motion.div>
      </div>
    </div>
  );
}
