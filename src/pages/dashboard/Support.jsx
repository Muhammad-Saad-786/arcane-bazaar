import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineSupport,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
  HiOutlineChat,
  HiOutlineBookOpen,
  HiOutlineExclamation,
  HiOutlineArrowRight,
  HiOutlineMail,
  HiOutlineGlobe,
} from "react-icons/hi";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import SEO from "../../components/ui/SEO";

const helpCategories = [
  {
    icon: HiOutlineShieldCheck,
    title: "Account & Security",
    desc: "Password reset, 2FA, account recovery, privacy settings",
    color: "text-green-400",
    bg: "bg-green-500/10",
    links: [
      { label: "Reset Password", href: "/forgot-password" },
      { label: "Account Settings", href: "/dashboard/settings" },
    ],
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: "Payments & Billing",
    desc: "Payment methods, escrow, refunds, withdrawals, fees",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    links: [
      { label: "Refund Policy", href: "/refund" },
      { label: "Wallet", href: "/dashboard/wallet" },
    ],
  },
  {
    icon: HiOutlineUser,
    title: "Buying & Selling",
    desc: "How to buy, how to sell, delivery, verification",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    links: [
      { label: "Become a Seller", href: "/become-seller" },
      { label: "Marketplace", href: "/marketplace" },
    ],
  },
  {
    icon: HiOutlineExclamation,
    title: "Disputes & Reports",
    desc: "File a dispute, report a scam, safety tips",
    color: "text-red-400",
    bg: "bg-red-500/10",
    links: [
      { label: "Report Issue", href: "/dashboard/orders" },
      { label: "Safety Center", href: "/safety" },
    ],
  },
];

const quickLinks = [
  {
    icon: HiOutlineBookOpen,
    label: "Help Center",
    desc: "Browse all articles",
    href: "/help",
  },
  {
    icon: HiOutlineChat,
    label: "Live Chat",
    desc: "Chat with support team",
    href: "/dashboard/messages",
  },
  {
    icon: HiOutlineMail,
    label: "Email Support",
    desc: "support@arcanebazaar.com",
    href: "mailto:support@arcanebazaar.com",
  },
];

export default function Support() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-4xl"
    >
      <SEO title="Support" />

      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Help & Support
        </h1>
        <p className="text-text-muted text-sm mt-1">
          How can we help you today?
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.label} to={link.href}>
            <GlassCard className="p-5 hover:border-arcane-purple/30 transition-all group text-center">
              <div className="w-12 h-12 rounded-2xl bg-arcane-purple/10 flex items-center justify-center mx-auto mb-3">
                <link.icon className="w-6 h-6 text-arcane-purple" />
              </div>
              <h3 className="text-white font-semibold">{link.label}</h3>
              <p className="text-text-muted text-xs mt-1">{link.desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* Help Categories */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Browse by Topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {helpCategories.map((cat) => (
            <GlassCard key={cat.title} className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${cat.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{cat.title}</h3>
                  <p className="text-text-muted text-xs mt-1">{cat.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {cat.links.map((link) => (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="text-xs text-arcane-purple hover:text-arcane-gold-light transition-colors"
                      >
                        {link.label} →
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <GlassCard className="p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-arcane-gold/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineSupport className="w-8 h-8 text-arcane-gold" />
        </div>
        <h2 className="text-xl font-bold text-white">Still Need Help?</h2>
        <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
          Our support team is available 24/7 to assist you with any questions or
          issues.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link to="/dashboard/messages">
            <Button variant="primary">
              <HiOutlineChat className="w-5 h-5" />
              Contact Support
            </Button>
          </Link>
          <a href="mailto:support@arcanebazaar.com">
            <Button variant="ghost">
              <HiOutlineMail className="w-5 h-5" />
              Email Us
            </Button>
          </a>
        </div>
      </GlassCard>

      <div className="h-10" />
    </motion.div>
  );
}
