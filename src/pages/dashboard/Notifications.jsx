import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import useNotificationStore from "../../stores/useNotificationStore";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import SEO from "../../components/ui/SEO";
import emptyNotificationImage from "/public/icons/pages/notifications.png";
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineBan,
  HiOutlineCash,
  HiOutlineShieldCheck,
  HiOutlineShoppingBag,
  HiOutlineChat,
  HiOutlineStar,
  HiOutlineFilter,
} from "react-icons/hi";

const typeConfig = {
  warning: {
    icon: HiOutlineExclamation,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  ban: { icon: HiOutlineBan, color: "text-red-400", bg: "bg-red-500/10" },
  refund: {
    icon: HiOutlineCash,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  escrow: {
    icon: HiOutlineShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  order: {
    icon: HiOutlineShoppingBag,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  message: {
    icon: HiOutlineChat,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  review: {
    icon: HiOutlineStar,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  verification: {
    icon: HiOutlineShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  default: { icon: HiOutlineBell, color: "text-white/50", bg: "bg-white/5" },
};

const filterTabs = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "warning", label: "Warnings" },
  { key: "order", label: "Orders" },
];

export default function Notifications() {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
      subscribeToNotifications(user.id);
    }
    return () => {
      unsubscribeFromNotifications();
    };
  }, [user?.id]);

  const getTimeAgo = (date) => {
    const diff = new Date() - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "all") return true;
    return n.type === activeFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO title="All Notifications | Arcane Bazaar" />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-arcane-gold text-[#141319] text-xs font-bold rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-text-muted text-xs sm:text-sm mt-1">
            Stay updated with your orders and trading activity
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsRead(user?.id)}
              variant="ghost"
              size="sm"
            >
              <HiOutlineCheck className="w-4 h-4" /> Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              onClick={() => deleteAll(user?.id)}
              variant="ghost"
              size="sm"
            >
              <HiOutlineTrash className="w-4 h-4" /> Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap sm:mt-8 mt-5">
        {filterTabs.map((tab) => {
          const count =
            tab.key === "all"
              ? notifications.length
              : tab.key === "unread"
                ? unreadCount
                : notifications.filter((n) => n.type === tab.key).length; //ss

          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer  ${
                activeFilter === tab.key
                  ? "bg-arcane-gold text-[#141319]"
                  : "bg-[#18171E] text-white  border border-[#2A2932]"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-3xl mx-auto"
      >
        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mb-4">
              <img
                src={emptyNotificationImage}
                alt="No notifications"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white text-center">
              {activeFilter === "unread"
                ? "You're all caught up!"
                : "No notifications yet"}
            </h3>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filteredNotifications.map((n) => {
                const config = typeConfig[n.type] || typeConfig.default;
                const IconComponent = config.icon;

                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className={`relative p-4 rounded-xl border transition-all ${config.bg} border-[#2A2932] ${
                      !n.read
                        ? "ring-1 ring-arcane-gold/30 bg-[#1E1D24]"
                        : "opacity-75"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}
                      >
                        <IconComponent className={`w-5 h-5 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-text-muted shrink-0">
                            {getTimeAgo(n.created_at)}
                          </span>
                        </div>

                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-3 mt-2.5">
                          {n.link && (
                            <Link
                              to={n.link}
                              className="text-xs text-arcane-gold hover:underline font-medium"
                            >
                              View Details →
                            </Link>
                          )}
                          {!n.read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="text-xs text-white hover:text-arcane-gold transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="text-xs text-text-muted hover:text-red-400 transition-colors ml-auto"
                          >
                            <HiOutlineTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-arcane-gold shrink-0 mt-1.5" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </>
  );
}
