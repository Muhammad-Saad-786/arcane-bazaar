import { Link } from "react-router-dom";
import { HiOutlineMail } from "react-icons/hi";
import { FiGithub, FiYoutube } from "react-icons/fi";
import { SiDiscord } from "react-icons/si";
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
      { label: "Contact Us", href: "/contact" },
      { label: "Safety Center", href: "/safety" },
      { label: "Report Issue", href: "/report" },
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
  { icon: SiDiscord, href: "#", label: "Discord" },
  { icon: FiGithub, href: "#", label: "Github" },
  { icon: FiYoutube, href: "#", label: "Youtube" },
];

export default function Footer() {
  return (
    <footer className="bg-arcane-surface border-t border-arcane-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo size="md" />
            <p className="mt-3 text-text-muted text-sm leading-relaxed">
              The trusted global marketplace for gaming accounts, currency, and
              services.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-arcane-dark border border-arcane-border text-text-muted hover:text-white hover:border-arcane-purple/30 transition-all"
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

        <div className="mt-12 pt-6 border-t border-arcane-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
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
