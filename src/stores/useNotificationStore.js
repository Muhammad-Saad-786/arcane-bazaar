import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

let notificationSubscription = null;

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  // Fetch initial notifications & calculate unread
  fetchNotifications: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const unread = (data || []).filter((n) => !n.read).length;
      set({ notifications: data || [], unreadCount: unread, loading: false });
    } catch (err) {
      console.error("fetchNotifications error:", err);
      set({ loading: false });
    }
  },

  // Subscribe to live Postgres changes for incoming notifications
  subscribeToNotifications: (userId) => {
    if (!userId || notificationSubscription) return;

    notificationSubscription = supabase
      .channel(`public:notifications:user_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new;
          set((state) => ({
            notifications: [newNotif, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));

          // Show floating toast alert for new notification
          toast(newNotif.title || "New notification received", {
            icon: "🔔",
            style: {
              background: "#1E1D24",
              color: "#fff",
              border: "1px solid #2A2932",
            },
          });
        }
      )
      .subscribe();
  },

  unsubscribeFromNotifications: () => {
    if (notificationSubscription) {
      supabase.removeChannel(notificationSubscription);
      notificationSubscription = null;
    }
  },

  markAsRead: async (id) => {
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      });
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  },

  markAllAsRead: async (userId) => {
    if (!userId) return;
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("markAllAsRead error:", err);
    }
  },

  deleteNotification: async (id) => {
    try {
      await supabase.from("notifications").delete().eq("id", id);
      set((state) => {
        const target = state.notifications.find((n) => n.id === id);
        const wasUnread = target && !target.read;
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
      toast.success("Notification deleted");
    } catch (err) {
      console.error("deleteNotification error:", err);
    }
  },

  deleteAll: async (userId) => {
    if (!userId) return;
    try {
      await supabase.from("notifications").delete().eq("user_id", userId);
      set({ notifications: [], unreadCount: 0 });
      toast.success("All notifications cleared");
    } catch (err) {
      console.error("deleteAll error:", err);
    }
  },
}));

export default useNotificationStore;
