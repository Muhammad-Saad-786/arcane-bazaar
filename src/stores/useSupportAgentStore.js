import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";

const ACTIVE_PIECES_WEBHOOK_URL =
  "https://cloud.activepieces.com/api/v1/webhooks/VQxFYPuw4tuq7QosMPF6O";

const useSupportAgentStore = create((set, get) => ({
  messages: [],
  loading: false,
  sending: false,
  isOpen: false,
  currentTicketId: null,
  pollingInterval: null,
  view: "home", // 'home' | 'chat' | 'messages' | 'help'
  ratedMessages: {},

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  setView: (view) => set({ view }),

  sendMessage: async (message) => {
    if (!message.trim()) return;

    const user = useAuthStore.getState().user;
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    set((state) => ({
      messages: [
        ...state.messages,
        { id: Date.now(), role: "user", content: message.trim() },
      ],
      sending: true,
      currentTicketId: ticketId,
      view: "chat",
    }));

    try {
      const { error: ticketError } = await supabase
        .from("support_tickets")
        .insert([
          {
            user_id: user?.id || null,
            ticket_id: ticketId,
            message: message.trim(),
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (ticketError) throw ticketError;

      const response = await fetch(ACTIVE_PIECES_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: { ticket_id: ticketId, message: message.trim() },
        }),
      });

      if (!response.ok) throw new Error("Webhook failed");

      get().pollForReply(ticketId);
    } catch (error) {
      console.error("Send message error:", error);
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: Date.now() + 1,
            role: "agent",
            content: "Sorry, there was an error. Please try again.",
            isError: true,
          },
        ],
        sending: false,
      }));
    }
  },

  pollForReply: async (ticketId) => {
    const maxPolls = 20;
    let polls = 0;

    const interval = setInterval(async () => {
      polls++;

      const { data: ticket, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("ticket_id", ticketId)
        .single();

      if (error || !ticket) {
        clearInterval(interval);
        get().handlePollingComplete(null, "Error checking ticket status");
        return;
      }

      if (ticket.status === "completed" && ticket.reply) {
        clearInterval(interval);
        get().handlePollingComplete(ticket, null);
        return;
      }

      if (ticket.status === "failed") {
        clearInterval(interval);
        get().handlePollingComplete(
          null,
          ticket.reply || "Failed to process request",
        );
        return;
      }

      if (polls >= maxPolls) {
        clearInterval(interval);
        get().handlePollingComplete(
          null,
          "Request timed out. A human agent will assist you shortly.",
        );
      }
    }, 3000);

    set({ pollingInterval: interval });
  },

  handlePollingComplete: (ticket, errorMsg) => {
    const reply = ticket?.reply || errorMsg;
    const needsHuman = ticket?.needs_human || false;

    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now() + 2,
          role: "agent",
          content: reply,
          needsHuman,
          category: ticket?.category,
          priority: ticket?.priority,
        },
      ],
      sending: false,
      pollingInterval: null,
    }));
  },

  rateMessage: (messageId, rating) => {
    set((state) => ({
      ratedMessages: { ...state.ratedMessages, [messageId]: rating },
    }));
  },

  clearChat: () => {
    const { pollingInterval } = get();
    if (pollingInterval) clearInterval(pollingInterval);
    set({
      messages: [],
      sending: false,
      currentTicketId: null,
      pollingInterval: null,
      view: "home",
    });
  },

  loadChatHistory: () => {
    try {
      const saved = localStorage.getItem("arcane_chat_history");
      if (saved) set({ messages: JSON.parse(saved) });
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  },

  saveChatHistory: () => {
    try {
      localStorage.setItem(
        "arcane_chat_history",
        JSON.stringify(get().messages),
      );
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  },
}));

export default useSupportAgentStore;
