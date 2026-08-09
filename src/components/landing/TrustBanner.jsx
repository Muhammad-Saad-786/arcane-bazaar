import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiOutlineSupport,
  HiOutlineLockClosed,
} from "react-icons/hi";

const features = [
  {
    icon: HiOutlineShieldCheck,
    title: "Secure Escrow",
    desc: "Payment held until delivery confirmed",
  },
  {
    icon: HiOutlineRefresh,
    title: "Instant Delivery",
    desc: "Get your account within minutes",
  },
  {
    icon: HiOutlineSupport,
    title: "24/7 Support",
    desc: "Help whenever you need it",
  },
  {
    icon: HiOutlineLockClosed,
    title: "Verified Sellers",
    desc: "KYC verified trusted sellers",
  },
];

export default function TrustBanner() {
  return (
    <section className="section-container py-8 sm:py-12">
      <div className="glass-card p-6 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Why Choose{" "}
            <span className="text-arcane-gold-light">Arcane Bazaar</span>
          </h2>
          <p className="text-text-muted text-sm mt-2">
            The safest way to trade gaming accounts
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-arcane-purple/10 flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-arcane-purple" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
