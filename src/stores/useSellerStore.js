import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useSellerStore = create((set, get) => ({
  stats: {
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeListings: 0,
    pendingOrders: 0,
    completedOrders: 0,
    disputeRate: 0,
    avgRating: 0,
  },
  listings: [],
  orders: [],
  transactions: [],
  reviews: [],
  loading: false,

  fetchStats: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const [
      { count: activeListings },
      { count: pendingOrders },
      { count: completedOrders },
      { data: transactions },
      { data: reviews },
    ] = await Promise.all([
      supabase
        .from("listings")
        .select("*", { count: "exact" })
        .eq("seller_id", user.id)
        .eq("status", "active"),
      supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("seller_id", user.id)
        .eq("status", "pending"),
      supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("seller_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("transactions")
        .select("amount")
        .eq("seller_id", user.id)
        .eq("status", "completed"),
      supabase.from("reviews").select("rating").eq("seller_id", user.id),
    ]);

    const totalRevenue = (transactions || []).reduce(
      (s, t) => s + parseFloat(t.amount),
      0,
    );
    const avgRating = reviews?.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    const disputeRate = completedOrders ? 0 : 0;

    set({
      stats: {
        totalRevenue,
        activeListings: activeListings || 0,
        pendingOrders: pendingOrders || 0,
        completedOrders: completedOrders || 0,
        disputeRate,
        avgRating,
      },
    });
  },

  fetchListings: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ loading: true });
    const { data } = await supabase
      .from("listings")
      .select(
        `*, game:games(name, slug, icon), category:listing_categories(name, type), images:listing_images(url, is_cover)`,
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    set({ listings: data || [], loading: false });
  },

  fetchOrders: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select(
        `*, listing:listings(title, game:games(name)), buyer:profiles(username)`,
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    set({ orders: data || [] });
  },

  fetchTransactions: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    set({ transactions: data || [] });
  },

  deleteListing: async (id) => {
    if (!confirm("Delete this listing permanently?")) return;
    await supabase.from("listings").delete().eq("id", id);
    toast.success("Listing deleted");
    get().fetchListings();
    get().fetchStats();
  },

  updateListingStatus: async (id, status) => {
    await supabase.from("listings").update({ status }).eq("id", id);
    toast.success(`Listing ${status}`);
    get().fetchListings();
  },

  acceptOrder: async (orderId) => {
    await supabase
      .from("orders")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", orderId);
    toast.success("Order accepted");
    get().fetchOrders();
    get().fetchStats();
  },

  deliverOrder: async (orderId) => {
    await supabase
      .from("orders")
      .update({
        status: "delivered",
        escrow_status: "delivered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    toast.success("Order marked as delivered");
    get().fetchOrders();
  },
  // ============================================
  // ORDER CHAT
  // ============================================
  fetchOrderMessages: async (orderId) => {
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles(username, avatar_url)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    return data || [];
  },

  sendOrderMessage: async (orderId, content) => {
    const user = useAuthStore.getState().user;
    if (!user || !content.trim()) return null;

    const { data: order } = await supabase
      .from("orders")
      .select("buyer_id, seller_id")
      .eq("id", orderId)
      .single();
    if (!order) return null;

    const receiverId =
      user.id === order.buyer_id ? order.seller_id : order.buyer_id;

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: user.id,
          receiver_id: receiverId,
          order_id: orderId,
          content: content.trim(),
        },
      ])
      .select("*, sender:profiles(username, avatar_url)")
      .single();

    if (error) {
      toast.error("Failed to send message");
      return null;
    }
    return data;
  },

  // ============================================
  // DELIVERY WITH PROOF
  // ============================================
  deliverOrderWithProof: async (orderId, proofFile, note = "") => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false };

    try {
      let proofUrl = null;
      if (proofFile) {
        const fileExt = proofFile.name.split(".").pop();
        const filePath = `delivery-proofs/${user.id}/${Date.now()}.${fileExt}`;
        const { data: upload } = await supabase.storage
          .from("account-images")
          .upload(filePath, proofFile);
        if (upload) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("account-images").getPublicUrl(upload.path);
          proofUrl = publicUrl;
        }
      }

      await supabase
        .from("orders")
        .update({
          status: "delivered",
          escrow_status: "delivered",
          delivery_proof: proofUrl,
          delivery_note: note,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("seller_id", user.id);

      toast.success("Order delivered with proof!");
      get().fetchOrders();
      return { success: true };
    } catch (error) {
      toast.error("Failed to deliver order");
      return { success: false };
    }
  },

  // ============================================
  // REJECT ORDER
  // ============================================
  rejectOrder: async (orderId, reason = "") => {
    await supabase
      .from("orders")
      .update({
        status: "cancelled",
        escrow_status: "refunded",
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    toast.success("Order rejected");
    get().fetchOrders();
    get().fetchStats();
  },

  // ============================================
  // WITHDRAWAL REQUEST
  // ============================================
  requestWithdrawal: async (amount, method) => {
    const user = useAuthStore.getState().user;
    const { stats } = get();

    if (amount > stats.totalRevenue) {
      toast.error("Insufficient balance");
      return { success: false };
    }

    const { error } = await supabase.from("transactions").insert([
      {
        seller_id: user.id,
        amount: -Math.abs(amount),
        type: "withdrawal",
        status: "pending",
        description: `Withdrawal request via ${method}`,
      },
    ]);

    if (error) {
      toast.error("Withdrawal request failed");
      return { success: false };
    }

    toast.success("Withdrawal request submitted!");
    get().fetchTransactions();
    get().fetchStats();
    return { success: true };
  },

  // ============================================
  // VACATION MODE
  // ============================================
  toggleVacationMode: async (enable) => {
    const user = useAuthStore.getState().user;
    const { data: listings } = await supabase
      .from("listings")
      .select("id")
      .eq("seller_id", user.id)
      .eq("status", "active");

    if (listings?.length > 0) {
      const newStatus = enable ? "hidden" : "active";
      await supabase
        .from("listings")
        .update({ status: newStatus })
        .eq("seller_id", user.id)
        .eq("status", enable ? "active" : "hidden");
    }

    await supabase
      .from("profiles")
      .update({ vacation_mode: enable })
      .eq("id", user.id);
    toast.success(
      enable
        ? "Vacation mode ON - All listings hidden"
        : "Vacation mode OFF - Listings visible",
    );
    get().fetchListings();
  },

  // ============================================
  // BULK UPLOAD (CSV)
  // ============================================
  bulkUploadListings: async (csvData, gameId, categoryId) => {
    const user = useAuthStore.getState().user;
    if (!csvData || csvData.length === 0)
      return { success: false, error: "No data" };

    set({ loading: true });
    try {
      const listings = csvData.map((row) => ({
        seller_id: user.id,
        game_id: gameId,
        category_id: categoryId,
        title: row.title || `${row.rank || ""} Account`,
        description: row.description || "",
        price: parseFloat(row.price) || 0,
        status: "active",
        approval_status: "approved",
        rank: row.rank || null,
        level: row.level ? parseInt(row.level) : null,
        server: row.server || null,
      }));

      const { error } = await supabase.from("listings").insert(listings);
      if (error) throw error;

      toast.success(`${listings.length} listings created!`);
      get().fetchListings();
      get().fetchStats();
      set({ loading: false });
      return { success: true, count: listings.length };
    } catch (error) {
      toast.error("Bulk upload failed: " + error.message);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },
  // Seller Levels
  getSellerLevel: () => {
    const { stats } = get();
    const orders = stats.completedOrders || 0;

    if (orders >= 200)
      return {
        name: "Elite",
        icon: "👑",
        color: "text-arcane-gold",
        bg: "bg-arcane-gold/10",
        minOrders: 200,
        fee: "5%",
      };
    if (orders >= 50)
      return {
        name: "Professional",
        icon: "💼",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        minOrders: 50,
        fee: "6%",
      };
    if (orders >= 10)
      return {
        name: "Experienced",
        icon: "📈",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        minOrders: 10,
        fee: "7%",
      };
    return {
      name: "New Seller",
      icon: "🌱",
      color: "text-green-400",
      bg: "bg-green-500/10",
      minOrders: 0,
      fee: "8%",
    };
  },
}));

export default useSellerStore;
