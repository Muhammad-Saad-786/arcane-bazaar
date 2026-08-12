import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlineCollection,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineMail,
  HiOutlineBell,
  HiOutlineStar,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineUpload,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import useSellerStore from "../../stores/useSellerStore";
import Logo from "../shared/Logo";

const navItems = [
  { icon: HiOutlineHome, label: "Dashboard", path: "/seller-dashboard" },
  {
    icon: HiOutlineCollection,
    label: "My Listings",
    path: "/seller-dashboard/listings",
  },
  {
    icon: HiOutlineShoppingBag,
    label: "Orders",
    path: "/seller-dashboard/orders",
  },
  {
    icon: HiOutlineCurrencyDollar,
    label: "Revenue",
    path: "/seller-dashboard/revenue",
  },
  {
    icon: HiOutlineChartBar,
    label: "Analytics",
    path: "/seller-dashboard/analytics",
  },
  {
    icon: HiOutlineMail,
    label: "Messages",
    path: "/seller-dashboard/messages",
  },
  {
    icon: HiOutlineStar,
    label: "Profile & Reviews",
    path: "/seller-dashboard/profile",
  },
  { icon: HiOutlineCog, label: "Settings", path: "/seller-dashboard/settings" },
];

export default function SellerDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuthStore();
  const { stats, fetchStats } = useSellerStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) fetchStats();
  }, [profile]);

  return (
    <div className="min-h-screen bg-[#141319] flex">
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
        className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-[#1A1920] border-r border-[#2A2932] flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-5 border-b border-[#2A2932]">
          <Logo size="sm" />
          <span className="text-xs text-arcane-gold mt-1 block font-medium">
            Seller Dashboard
          </span>
        </div>

        {/* Seller Stats Mini */}
        <div className="p-4 border-b border-[#2A2932]">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text-muted">Balance</span>
            <span className="text-arcane-gold font-bold">
              ${stats.totalRevenue?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
            <div>📦 {stats.activeListings} active</div>
            <div>📋 {stats.pendingOrders} pending</div>
          </div>
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
                    ? "bg-arcane-gold/20 text-arcane-gold"
                    : "text-white hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-arcane-gold" : ""}`}
                />{" "}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2A2932]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-arcane-gold flex items-center justify-center text-sm font-bold text-white overflow-hidden">
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
              <p className="text-sm font-medium text-white truncate">
                {profile?.username}
              </p>
              <p className="text-xs text-arcane-gold">Seller</p>
            </div>
          </div>
          <button
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <HiOutlineLogout className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-[#141319]/90 backdrop-blur-xl border-b border-[#2A2932] px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-white hover:bg-[#1E1D24] rounded-xl mr-3"
          >
            {sidebarOpen ? (
              <HiOutlineX className="w-5 h-5" />
            ) : (
              <HiOutlineMenu className="w-5 h-5" />
            )}
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <Link
              to="/sell"
              className="text-sm bg-arcane-gold text-[#141319] px-4 py-2 rounded-xl font-semibold hover:bg-arcane-gold-light transition-all flex items-center gap-2"
            >
              <HiOutlineUpload className="w-4 h-5" /> Create Listing
            </Link>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
