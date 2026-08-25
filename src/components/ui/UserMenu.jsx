import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineStar,
  HiOutlineCreditCard,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMail,
  HiOutlineBell,
  HiOutlineBadgeCheck,
  HiOutlineViewGrid,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import useWalletStore from "../../stores/useWalletStore";
import LoyaltyBadge from "./LoyaltyBadge";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, profile, signOut } = useAuthStore();
  const { wallet, fetchWallet, formatBalance } = useWalletStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchWallet();
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  const isSeller = profile?.is_seller_verified || profile?.role === "seller";

  return (
    <div ref={dropdownRef} className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-arcane-surface transition-all border border-transparent hover:border-arcane-border hover:cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-arcane-gold flex items-center justify-center text-sm font-bold text-white overflow-hidden">
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
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed right-4 top-16 w-72 max-h-[calc(100vh-100px)] overflow-y-auto bg-arcane-elevated border border-arcane-border rounded-2xl shadow-2xl z-50"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-arcane-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-arcane-gold flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
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
                    <p className="text-sm font-semibold text-white truncate">
                      {profile?.username || "Arcane User"}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {profile?.email || user?.email}
                    </p>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-arcane-surface">
                  <span className="text-xs text-text-secondary">Balance</span>
                  <span className="text-base font-bold text-arcane-gold">
                    {formatBalance ? formatBalance() : "$0.00"}
                  </span>
                </div>

                {/* Loyalty Badge */}
                <div className="mt-2">
                  <LoyaltyBadge size="sm" />
                </div>
              </div>

              {/* Menu Items - Main */}
              <div className="p-2">
                <Link
                  to="/dashboard/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white hover:bg-arcane-surface transition-all"
                >
                  <HiOutlineShoppingBag className="w-5 h-5" /> Orders
                </Link>

                <Link
                  to="/dashboard/offers"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white hover:bg-arcane-surface transition-all"
                >
                  <HiOutlineCurrencyDollar className="w-5 h-5" /> Offers
                </Link>

                <Link
                  to="/dashboard/boosting"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white hover:bg-arcane-surface transition-all"
                >
                  <HiOutlineTrendingUp className="w-5 h-5" /> Boosting
                </Link>

                <Link
                  to="/dashboard/loyalty"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white hover:bg-arcane-surface transition-all"
                >
                  <HiOutlineStar className="w-5 h-5" /> Loyalty
                </Link>

                <Link
                  to="/dashboard/wallet"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white hover:bg-arcane-surface transition-all"
                >
                  <HiOutlineCreditCard className="w-5 h-5" /> Wallet
                </Link>

                {/* Dynamic Verified Seller Link */}
                {isSeller ? (
                  <Link
                    to="/seller-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-arcane-gold hover:bg-arcane-gold/10 transition-all font-semibold"
                  >
                    <HiOutlineViewGrid className="w-5 h-5" /> Seller Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/become-seller"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-arcane-gold hover:bg-arcane-gold/10 transition-all font-medium"
                  >
                    <HiOutlineBadgeCheck className="w-5 h-5" /> Become a Seller
                  </Link>
                )}
              </div>

              {/* Menu Items - Communication */}
              <div className="border-t border-arcane-border p-2">
                <Link
                  to="/dashboard/messages"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white hover:bg-arcane-surface transition-all"
                >
                  <HiOutlineMail className="w-5 h-5" /> Messages
                </Link>

                <Link
                  to="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white hover:bg-arcane-surface transition-all"
                >
                  <HiOutlineBell className="w-5 h-5" /> Notifications
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white hover:bg-arcane-surface transition-all"
                >
                  <HiOutlineCog className="w-5 h-5" /> Account Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-arcane-border p-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <HiOutlineLogout className="w-5 h-5" /> Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
