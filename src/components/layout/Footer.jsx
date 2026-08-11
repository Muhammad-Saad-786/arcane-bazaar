import { Link } from "react-router-dom";
import { HiOutlineMail } from "react-icons/hi";
import { FiGithub, FiYoutube, FiInstagram, FiTwitter } from "react-icons/fi";
import { SiDiscord, SiTiktok } from "react-icons/si";
import Logo from "../shared/Logo";

const footerLinks = {
  marketplace: {
    title: "Marketplace",
    links: [
      { label: "Browse All", href: "/marketplace" },
      { label: "Game Accounts", href: "/marketplace?category=account" },
      { label: "Top Up", href: "/marketplace?category=topup" },
      { label: "Boosting", href: "/marketplace?category=boosting" },
    ],
  },
  popular: {
    title: "Popular Games",
    links: [
      { label: "Mobile Legends", href: "/marketplace?game=mobile-legends" },
      { label: "Fortnite", href: "/marketplace?game=fortnite" },
      { label: "Valorant", href: "/marketplace?game=valorant" },
      { label: "GTA 5", href: "/marketplace?game=gta-5" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Safety Center", href: "/safety" },
      { label: "Report Issue", href: "/report" },
      { label: "Become a Seller", href: "/become-seller" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
};

const socialLinks = [
  {
    icon: SiDiscord,
    href: "https://discord.gg/arcanebazaar",
    label: "Discord",
    color: "hover:text-[#5865F2] hover:border-[#5865F2]/30",
  },
  {
    icon: FiYoutube,
    href: "https://youtube.com/@arcanebazaar",
    label: "Youtube",
    color: "hover:text-[#FF0000] hover:border-[#FF0000]/30",
  },
  {
    icon: FiInstagram,
    href: "https://instagram.com/arcanebazaar",
    label: "Instagram",
    color: "hover:text-[#E4405F] hover:border-[#E4405F]/30",
  },
  {
    icon: FiTwitter,
    href: "https://twitter.com/arcanebazaar",
    label: "Twitter",
    color: "hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30",
  },
  {
    icon: SiTiktok,
    href: "https://tiktok.com/@arcanebazaar",
    label: "TikTok",
    color: "hover:text-white hover:border-white/30",
  },
  {
    icon: FiGithub,
    href: "https://github.com/arcanebazaar",
    label: "Github",
    color: "hover:text-white hover:border-white/30",
  },
];

const paymentMethods = [
  { name: "Visa", icon: "/payments/visa.png" },
  { name: "Mastercard", icon: "/payments/master-card.png" },
  { name: "Apple Pay", icon: "/payments/apple-pay.png" },
  { name: "Google Pay", icon: "/payments/google-pay.png" },
  { name: "PayPal", icon: "/payments/paypal.png" },
  { name: "Discover", icon: "/payments/discover.png" },
  { name: "Amex", icon: "/payments/amex.png" },
  { name: "BTC", icon: "/payments/btc.png" },
];

export default function Footer() {
  return (
    <footer className="bg-arcane-surface border-t border-arcane-border mt-auto">
      {/* Payment Methods Bar */}
      <div className="border-b border-arcane-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-text-muted uppercase tracking-wider">
              Accepted Payment Methods
            </span>
            <div className="flex items-center gap-3">
              {/* Show 5 payment methods */}
              {paymentMethods.slice(0, 5).map((method) => (
                <div
                  key={method.name}
                  className="h-8 brightness-100 opacity-100"
                  title={method.name}
                >
                  <img
                    src={method.icon}
                    alt={method.name}
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ))}
              {/* +X More badge */}
              <div className="h-8 px-3 flex items-center justify-center rounded-lg bg-arcane-dark border border-arcane-border">
                <span className="text-xs text-text-muted font-medium">
                  +{paymentMethods.length - 5} more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo size="md" />
            <p className="mt-3 text-text-muted text-sm leading-relaxed">
              The trusted global marketplace for gaming accounts, currency, and
              services. Protected by escrow. Trusted by millions.
            </p>

            {/* Google Badge */}
            <a
              href="https://www.google.com/preferences/source?q=arcane-bazaar.vercel.app&utm_source=marketplace&utm_medium=cta&utm_campaign=google_preferred_src&utm_content=footer"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 p-3 rounded-xl bg-arcane-dark/50 border border-arcane-border inline-block hover:border-arcane-purple/30 hover:bg-arcane-purple/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <img
                  src="/google.png"
                  alt="Google"
                  className="h-5 w-auto"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div>
                  <p className="text-xs text-text-muted group-hover:text-text-secondary transition-colors">
                    Preferred source on
                  </p>
                  <p className="text-xs text-white font-medium group-hover:text-arcane-gold-light transition-colors">
                    Google
                  </p>
                </div>
              </div>
            </a>

            {/* Social Links */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  className={`p-2.5 rounded-xl bg-arcane-dark border border-arcane-border text-text-muted transition-all ${social.color}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-text-muted hover:text-arcane-gold-light transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-arcane-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted text-center sm:text-left">
            © {new Date().getFullYear()} Arcane Bazaar. All rights reserved. Not
            affiliated with any game publisher.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/terms"
              className="text-xs text-text-muted hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-text-muted hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/refund"
              className="text-xs text-text-muted hover:text-white transition-colors"
            >
              Refunds
            </Link>
            <Link
              to="/cookies"
              className="text-xs text-text-muted hover:text-white transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
