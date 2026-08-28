import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

let orderSubscription = null;

const useOrderStore = create((set, get) => ({
  orders: [],
  activeOrder: null,
  loading: false,
  submitting: false,

  // Fetch buyer's orders with full relations
  fetchBuyerOrders: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
            *,
            listing:listings(
              id, 
              title, 
              price, 
              delivery_time, 
              instant_delivery, 
              delivery_type,
              game:games(id, name, slug, icon), 
              category:listing_categories(name, type)
            ),
            seller:profiles!seller_id(id, username, avatar_url, verified_seller, rating)
          `,
        )
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ orders: data || [], loading: false });
    } catch (err) {
      console.error("fetchBuyerOrders error:", err);
      set({ loading: false });
    }
  },

  // Create Escrow Order & Trigger Notifications
  createOrder: async ({
    buyerId,
    sellerId,
    listingId,
    amount,
    paymentMethod,
    packageDetails,
  }) => {
    set({ submitting: true });
    try {
      // 1. Insert Order with Escrow status 'held'
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            buyer_id: buyerId,
            seller_id: sellerId,
            listing_id: listingId,
            amount: Number(amount),
            currency: "USD",
            status: "pending",
            escrow_status: "held",
            payment_method: paymentMethod || "wallet",
            payment_date: new Date().toISOString(),
          },
        ])
        .select(
          `
            *,
            listing:listings(title),
            seller:profiles!seller_id(username)
          `,
        )
        .single();

      if (orderError) throw orderError;

      // 2. Insert Escrow Transaction Audit
      await supabase.from("escrow_transactions").insert([
        {
          order_id: order.id,
          action: "payment_held",
          performed_by: buyerId,
          details: `TradeShield escrow held $${amount} via ${paymentMethod || "wallet"}${
            packageDetails ? ` for package: ${packageDetails}` : ""
          }`,
        },
      ]);

      // 3. Notify Seller Real-Time
      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: "New Order Received! 🛍️",
          message: `A buyer purchased your listing for $${amount}. Escrow is locked. Please deliver now.`,
          type: "order",
          link: "/seller-dashboard/orders",
          read: false,
        },
      ]);

      // 4. Create Initial Chat Message for Trade Room
      await supabase.from("messages").insert([
        {
          sender_id: buyerId,
          receiver_id: sellerId,
          listing_id: listingId,
          content: `Hi! I just purchased your listing (#${order.id.slice(0, 8)}). Escrow payment of $${amount} is safely locked in TradeShield. Please provide delivery details.`,
          read: false,
        },
      ]);

      set({ submitting: false });
      toast.success("Payment secured in TradeShield Escrow!");
      return { success: true, order };
    } catch (err) {
      console.error("createOrder error:", err);
      set({ submitting: false });
      toast.error(err.message || "Failed to create escrow order");
      return { success: false, error: err.message };
    }
  },

  // Buyer Confirms Delivery & Releases Escrow
  confirmAndReleaseEscrow: async (orderId, buyerId, sellerId, amount) => {
    try {
      // 1. Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          escrow_status: "released",
          escrow_released_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("buyer_id", buyerId);

      if (updateError) throw updateError;

      // 2. Log Escrow Release
      await supabase.from("escrow_transactions").insert([
        {
          order_id: orderId,
          action: "escrow_released",
          performed_by: buyerId,
          details: `Buyer confirmed delivery. $${amount} released to seller.`,
        },
      ]);

      // 3. Credit Seller's Wallet
      const { data: sellerWallet } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", sellerId)
        .single();

      if (sellerWallet) {
        const newBalance = Number(sellerWallet.balance || 0) + Number(amount);
        await supabase
          .from("wallets")
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq("id", sellerWallet.id);

        await supabase.from("wallet_transactions").insert([
          {
            wallet_id: sellerWallet.id,
            amount: Number(amount),
            type: "sale",
            status: "completed",
            reference: `Order #${orderId.slice(0, 8)} payout`,
          },
        ]);
      }

      // 4. Update seller profile completed_orders count
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("completed_orders, total_sales")
        .eq("id", sellerId)
        .single();

      if (sellerProfile) {
        await supabase
          .from("profiles")
          .update({
            completed_orders: (sellerProfile.completed_orders || 0) + 1,
            total_sales: (sellerProfile.total_sales || 0) + 1,
          })
          .eq("id", sellerId);
      }

      // 5. Notify Seller
      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: "Funds Released! 💰",
          message: `The buyer confirmed delivery for Order #${orderId.slice(0, 8)}. $${amount} has been added to your wallet!`,
          type: "escrow",
          link: "/seller-dashboard/revenue",
          read: false,
        },
      ]);

      // Refresh local list
      get().fetchBuyerOrders(buyerId);
      toast.success("Order completed! Funds released to seller.");
      return { success: true };
    } catch (err) {
      console.error("confirmAndReleaseEscrow error:", err);
      toast.error("Failed to complete order");
      return { success: false, error: err.message };
    }
  },

  // Open a Dispute
  openDispute: async ({ orderId, buyerId, sellerId, reason, description }) => {
    try {
      const { data, error } = await supabase.from("disputes").insert([
        {
          order_id: orderId,
          buyer_id: buyerId,
          seller_id: sellerId,
          reason,
          description,
          status: "open",
        },
      ]);

      if (error) throw error;

      await supabase
        .from("orders")
        .update({ status: "disputed" })
        .eq("id", orderId);

      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: "Dispute Opened ⚠️",
          message: `A dispute has been opened for Order #${orderId.slice(0, 8)}. TradeShield dispute team notified.`,
          type: "warning",
          link: "/seller-dashboard/orders",
          read: false,
        },
      ]);

      get().fetchBuyerOrders(buyerId);
      toast.success("Dispute opened. Support team will review.");
      return { success: true };
    } catch (err) {
      console.error("openDispute error:", err);
      toast.error("Failed to open dispute");
      return { success: false };
    }
  },

  // Live order listener
  subscribeToOrders: (userId) => {
    if (!userId || orderSubscription) return;

    orderSubscription = supabase
      .channel(`public:orders:buyer_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `buyer_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new;
            if (updated.status === "delivered") {
              toast(
                "Your order has been marked as Delivered! Please inspect.",
                {
                  icon: "📦",
                  style: {
                    background: "#1E1D24",
                    color: "#fff",
                    border: "1px solid #2A2932",
                  },
                },
              );
            }
          }
          get().fetchBuyerOrders(userId);
        },
      )
      .subscribe();
  },

  unsubscribeFromOrders: () => {
    if (orderSubscription) {
      supabase.removeChannel(orderSubscription);
      orderSubscription = null;
    }
  },
}));

export default useOrderStore;
