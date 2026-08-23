import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

let messageSubscription = null;

const useMessageStore = create((set, get) => ({
  conversations: [], // Array of unique user threads
  activeConversation: null, // Current active other user profile
  activeMessages: [], // Messages for the active chat
  unreadCount: 0,
  loading: false,
  messagesLoading: false,

  // Fetch all conversation threads for current user
  fetchConversations: async (currentUserId) => {
    if (!currentUserId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
            id,
            content,
            read,
            created_at,
            sender_id,
            receiver_id,
            sender:profiles!sender_id(id, username, avatar_url, verified_seller),
            receiver:profiles!receiver_id(id, username, avatar_url, verified_seller)
          `,
        )
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group into unique conversations by peer user ID
      const map = new Map();
      let totalUnread = 0;

      (data || []).forEach((msg) => {
        const isMe = msg.sender_id === currentUserId;
        const peer = isMe ? msg.receiver : msg.sender;
        if (!peer) return;

        if (!isMe && !msg.read) {
          totalUnread += 1;
        }

        if (!map.has(peer.id)) {
          map.set(peer.id, {
            peer,
            lastMessage: msg,
            unreadCount: !isMe && !msg.read ? 1 : 0,
          });
        } else if (!isMe && !msg.read) {
          const existing = map.get(peer.id);
          existing.unreadCount += 1;
        }
      });

      set({
        conversations: Array.from(map.values()),
        unreadCount: totalUnread,
        loading: false,
      });
    } catch (err) {
      console.error("fetchConversations error:", err);
      set({ loading: false });
    }
  },

  // Fetch messages with a specific peer
  fetchMessagesWithPeer: async (currentUserId, peerId) => {
    if (!currentUserId || !peerId) return;
    set({ messagesLoading: true });
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
            *,
            sender:profiles!sender_id(id, username, avatar_url),
            receiver:profiles!receiver_id(id, username, avatar_url)
          `,
        )
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${currentUserId})`,
        )
        .order("created_at", { ascending: true });

      if (error) throw error;

      set({ activeMessages: data || [], messagesLoading: false });

      // Mark incoming unread messages as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("sender_id", peerId)
        .eq("receiver_id", currentUserId)
        .eq("read", false);

      // Recalculate unread badge
      get().fetchConversations(currentUserId);
    } catch (err) {
      console.error("fetchMessagesWithPeer error:", err);
      set({ messagesLoading: false });
    }
  },

  // Send a message
  sendMessage: async ({ senderId, receiverId, content, listingId = null }) => {
    if (!content?.trim() || !senderId || !receiverId) return false;
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            sender_id: senderId,
            receiver_id: receiverId,
            content: content.trim(),
            listing_id: listingId,
            read: false,
          },
        ])
        .select(
          `
            *,
            sender:profiles!sender_id(id, username, avatar_url),
            receiver:profiles!receiver_id(id, username, avatar_url)
          `,
        )
        .single();

      if (error) throw error;

      // Append to active chat if communicating with current peer
      const currentActive = get().activeConversation;
      if (currentActive?.id === receiverId) {
        set((state) => ({
          activeMessages: [...state.activeMessages, data],
        }));
      }

      get().fetchConversations(senderId);
      return true;
    } catch (err) {
      console.error("sendMessage error:", err);
      toast.error("Failed to send message");
      return false;
    }
  },

  setActiveConversation: (peerProfile) => {
    set({ activeConversation: peerProfile });
  },

  // Real-time subscription for incoming chat messages
  subscribeToMessages: (currentUserId) => {
    if (!currentUserId || messageSubscription) return;

    messageSubscription = supabase
      .channel(`public:messages:user_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const newMsg = payload.new;
          const activePeer = get().activeConversation;

          // If active chat is currently open with the sender
          if (activePeer && activePeer.id === newMsg.sender_id) {
            // Fetch sender profile details to append cleanly
            const { data: senderData } = await supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .eq("id", newMsg.sender_id)
              .single();

            const fullMsg = { ...newMsg, sender: senderData };

            set((state) => ({
              activeMessages: [...state.activeMessages, fullMsg],
            }));

            // Auto-mark as read
            await supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMsg.id);
          } else {
            // Increment unread and display toast banner
            set((state) => ({ unreadCount: state.unreadCount + 1 }));
            toast("You have a new message!", {
              icon: "💬",
              style: {
                background: "#1E1D24",
                color: "#fff",
                border: "1px solid #2A2932",
              },
            });
          }

          get().fetchConversations(currentUserId);
        },
      )
      .subscribe();
  },

  unsubscribeFromMessages: () => {
    if (messageSubscription) {
      supabase.removeChannel(messageSubscription);
      messageSubscription = null;
    }
  },
}));

export default useMessageStore;
