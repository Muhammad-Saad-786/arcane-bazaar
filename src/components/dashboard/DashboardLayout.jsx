import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../layout/Navbar";
import SEO from "../../components/ui/SEO";
import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineMail,
  HiOutlineBell,
  HiOutlineStar,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineViewGrid,
  HiOutlineSupport,
  HiOutlineBadgeCheck,
  HiOutlineClipboardList,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import useWalletStore from "../../stores/useWalletStore";
import LoyaltyBadge from "../ui/LoyaltyBadge";

const navItems = [
  { icon: HiOutlineViewGrid, label: "Dashboard", path: "/dashboard" },
  { icon: HiOutlineShoppingBag, label: "Orders", path: "/dashboard/orders" },
  { icon: HiOutlineCurrencyDollar, label: "Offers", path: "/dashboard/offers" },
  { icon: HiOutlineTrendingUp, label: "Boosting", path: "/dashboard/boosting" },
  { icon: HiOutlineStar, label: "Loyalty", path: "/dashboard/loyalty" },
  { icon: HiOutlineCreditCard, label: "Wallet", path: "/dashboard/wallet" },
  {
    icon: HiOutlineBadgeCheck,
    label: "Become a Seller",
    path: "/become-seller",
  },
  { icon: HiOutlineHeart, label: "Wishlist", path: "/dashboard/wishlist" },
  { icon: HiOutlineMail, label: "Messages", path: "/dashboard/messages" },
  {
    icon: HiOutlineBell,
    label: "Notifications",
    path: "/dashboard/notifications",
  },
  {
    icon: HiOutlineBadgeCheck,
    label: "Become a Seller",
    path: "/become-seller",
    seller: false,
  },
  {
    icon: HiOutlineClipboardList,
    label: "Feedback",
    path: "/dashboard/feedback",
  },
  { icon: HiOutlineCog, label: "Settings", path: "/dashboard/settings" },
  { icon: HiOutlineSupport, label: "Support", path: "/dashboard/support" },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuthStore();
  const { wallet, formatBalance, fetchWallet } = useWalletStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) fetchWallet();
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (item.seller === false && profile?.role === "seller") return false;
    return true;
  });

  return (
    <>
      <SEO title="Dashboard" />
      <div className="min-h-screen bg-arcane-dark">
        {/* Fixed Navbar - Full width, top of screen */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>

        {/* Main layout below navbar */}
        <div className="flex pt-[100px]">
          {/* Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              />
            )}
          </AnimatePresence>

          {/* Sidebar - Full height minus navbar */}
          <motion.aside
            className={`fixed lg:sticky top-[72px] left-0 z-40 w-64 h-[calc(100vh-72px)] bg-arcane-surface border-r border-arcane-border flex flex-col overflow-y-auto transition-transform lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* User Profile Card */}
            <div className="p-4 border-b border-arcane-border">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-arcane-purple/20 via-arcane-dark to-arcane-gold/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-arcane-gold flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0 ring-2 ring-arcane-border">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      profile?.username?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {profile?.username}
                    </p>
                    <p className="text-xs text-text-muted">
                      Registered:{" "}
                      {new Date(profile?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <LoyaltyBadge size="sm" />

                <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-arcane-dark/50">
                  <div className="flex items-center gap-2">
                    <HiOutlineCreditCard className="w-4 h-4 text-arcane-gold" />
                    <span className="text-xs text-text-secondary">Balance</span>
                  </div>
                  <span className="text-base font-bold text-arcane-gold">
                    {formatBalance()}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-arcane-purple/20 text-white"
                        : "text-white hover:bg-arcane-border/50"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-arcane-purple" : ""}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-arcane-border">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-danger/10 transition-all"
              >
                <HiOutlineLogout className="w-5 h-5" /> Log out
              </button>
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
