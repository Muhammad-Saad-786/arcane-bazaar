import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import Logo from "../shared/Logo";

const navItems = [
  { icon: HiOutlineHome, label: "Overview", path: "/dashboard" },
  { icon: HiOutlineShoppingBag, label: "Orders", path: "/dashboard/orders" },
  { icon: HiOutlineHeart, label: "Wishlist", path: "/dashboard/wishlist" },
  { icon: HiOutlineCurrencyDollar, label: "Offers", path: "/dashboard/offers" },
  { icon: HiOutlineTrendingUp, label: "Boosting", path: "/dashboard/boosting" },
  { icon: HiOutlineStar, label: "Loyalty", path: "/dashboard/loyalty" },
  { icon: HiOutlineCreditCard, label: "Wallet", path: "/dashboard/wallet" },
  { icon: HiOutlineMail, label: "Messages", path: "/dashboard/messages" },
  {
    icon: HiOutlineBell,
    label: "Notifications",
    path: "/dashboard/notifications",
  },
  { icon: HiOutlineUser, label: "Profile", path: "/dashboard/profile" },
  { icon: HiOutlineCog, label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-arcane-dark flex">
      {/* Mobile Overlay */}
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

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-arcane-surface border-r border-arcane-border flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-arcane-border">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
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

        <div className="p-4 border-t border-arcane-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-arcane-purple to-arcane-gold flex items-center justify-center text-sm font-bold text-white overflow-hidden">
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.username}
              </p>
              <p className="text-xs text-text-muted">Buyer</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-xl transition-all"
          >
            <HiOutlineLogout className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-arcane-dark/90 backdrop-blur-xl border-b border-arcane-border px-4 sm:px-6 py-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-white hover:bg-arcane-surface rounded-xl mr-3"
          >
            {sidebarOpen ? (
              <HiOutlineX className="w-5 h-5" />
            ) : (
              <HiOutlineMenu className="w-5 h-5" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        </div>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
