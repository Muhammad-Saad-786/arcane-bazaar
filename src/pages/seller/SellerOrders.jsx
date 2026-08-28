import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineTruck,
  HiOutlineChat,
  HiOutlineUpload,
  HiOutlinePaperAirplane,
  HiOutlinePhotograph,
  HiOutlineLockClosed,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineCurrencyDollar,
  HiOutlineExternalLink,
} from "react-icons/hi";
import useSellerStore from "../../stores/useSellerStore";
import useAuthStore from "../../stores/useAuthStore";
import Button from "../../components/ui/Button";
import SEO from "../../components/ui/SEO";
import toast from "react-hot-toast";
import emptyOrdersImage from "/public/icons/pages/empty-orders.png";

const statusConfig = {
  pending: {
    label: "Action Required",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  accepted: {
    label: "In Progress (Deliver Now)",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
  },
  delivered: {
    label: "Delivered (Awaiting Buyer Confirmation)",
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    dot: "bg-purple-400",
  },
  completed: {
    label: "Funds Released",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelled / Refunded",
    color: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    dot: "bg-gray-400",
  },
  disputed: {
    label: "Under Escrow Dispute",
    color: "bg-red-500/15 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
};

const filterTabs = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending Action" },
  { key: "accepted", label: "To Deliver" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputes" },
];

// Order Card Skeleton Placeholder
const SellerOrderSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="p-5 bg-[#18171E] border border-[#2A2932] rounded-2xl animate-pulse space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2932]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E1D24]" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-[#1E1D24] rounded" />
              <div className="h-3 w-20 bg-[#1E1D24] rounded" />
            </div>
          </div>
          <div className="h-6 w-24 bg-[#1E1D24] rounded-lg" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 w-48 bg-[#1E1D24] rounded" />
          <div className="h-6 w-20 bg-[#1E1D24] rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default function SellerOrders() {
  const {
    orders,
    fetchOrders,
    acceptOrder,
    deliverOrderWithProof,
    rejectOrder,
    fetchOrderMessages,
    sendOrderMessage,
  } = useSellerStore();

  const { user } = useAuthStore();
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Chat Modal States
  const [chatOrder, setChatOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Delivery Modal States
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [delivering, setDelivering] = useState(false);

  // Reject Modal States
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchOrders().then(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // Time Formatter with Local Time & Relative Time
  const formatOrderTime = (timestamp) => {
    if (!timestamp) return { timeAgo: "Just now", fullDate: "" };
    const dateObj = new Date(timestamp);
    const diff = Date.now() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    let timeAgo = "Just now";
    if (minutes >= 1 && minutes < 60) timeAgo = `${minutes}m ago`;
    else if (hours >= 1 && hours < 24) timeAgo = `${hours}h ago`;
    else if (days >= 1) timeAgo = `${days}d ago`;

    const fullDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { timeAgo, fullDate };
  };

  // Open Chat Room
  const openChat = async (order) => {
    setChatOrder(order);
    const msgs = await fetchOrderMessages(order.id);
    setMessages(msgs || []);
  };

  // Send Message inside Order Room
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatOrder) return;
    setSendingMsg(true);
    const msg = await sendOrderMessage(chatOrder.id, newMessage);
    if (msg) setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    setSendingMsg(false);
  };

  // Delivery Modal Trigger
  const openDelivery = (order) => {
    setDeliveryOrder(order);
    setProofFile(null);
    setProofPreview(null);
    setDeliveryNote("");
  };

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Proof image must be less than 5MB");
        return;
      }
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleDeliver = async () => {
    if (!proofFile) {
      toast.error("Please upload delivery screenshot proof");
      return;
    }
    setDelivering(true);
    const result = await deliverOrderWithProof(
      deliveryOrder.id,
      proofFile,
      deliveryNote,
    );
    setDelivering(false);
    if (result.success) setDeliveryOrder(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a valid cancellation reason");
      return;
    }
    await rejectOrder(rejectOrderId, rejectReason);
    setRejectOrderId(null);
    setRejectReason("");
  };

  return (
    <>
      <SEO title="Seller Orders Management | Arcane Bazaar" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2932]">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white">
              Seller Orders Management
            </h1>
            <p className="text-text-muted text-xs sm:text-sm mt-1 flex items-center gap-2">
              <span>{orders.length} Total Orders</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <HiOutlineShieldCheck className="w-4 h-4" /> TradeShield™ Escrow
                Protected
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLoading(true);
                fetchOrders().then(() => setLoading(false));
              }}
              className="px-3 py-1.5 bg-[#18171E] hover:bg-[#1E1D24] text-text-muted hover:text-white border border-[#2A2932] rounded-xl text-xs font-semibold transition-all"
            >
              🔄 Refresh Orders
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => {
            const count =
              tab.key === "all"
                ? orders.length
                : orders.filter((o) => o.status === tab.key).length;

            const isSelected = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-arcane-gold text-[#141319] shadow-md shadow-arcane-gold/20 font-bold"
                    : "bg-[#18171E] text-white cursor-pointer border border-[#2A2932]"
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Order Feed */}
        {loading ? (
          <SellerOrderSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#18171E] border border-[#2A2932] rounded-2xl text-center">
            <div className="w-28 h-28 mb-4">
              <img
                src={emptyOrdersImage}
                alt="No orders"
                className="w-full h-full object-contain opacity-75"
              />
            </div>
            <h2 className="text-lg font-bold text-white">
              No orders matching this filter
            </h2>
            <p className="text-text-muted text-xs mt-1">
              New customer purchases will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const statusInfo =
                statusConfig[order.status] || statusConfig.pending;
              const { timeAgo, fullDate } = formatOrderTime(order.created_at);

              return (
                <div
                  key={order.id}
                  className="bg-[#18171E] border border-[#2A2932] hover:border-[#2A2932]/90 rounded-2xl p-5 shadow-xl transition-all space-y-4"
                >
                  {/* Top Bar: Order ID, Status, Escrow State & Timestamp */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A2932]/70">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-gray-400 bg-[#141319] px-2.5 py-1 rounded-lg border border-[#2A2932]">
                        #{order.id.slice(0, 8)}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} animate-pulse`}
                        />
                        {statusInfo.label}
                      </span>

                      <span className="text-xs text-arcane-gold font-semibold flex items-center gap-1">
                        <HiOutlineLockClosed className="w-3.5 h-3.5" />
                        Escrow:{" "}
                        <span className="capitalize">
                          {order.escrow_status?.replace(/_/g, " ") || "Held"}
                        </span>
                      </span>
                    </div>

                    {/* Exact Timestamp Display */}
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                      <span>{fullDate}</span>
                      <span className="text-gray-500 font-mono">
                        ({timeAgo})
                      </span>
                    </div>
                  </div>

                  {/* Center Content: Game Info, Listing Name, Buyer Profile */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Game & Listing Title */}
                    <div className="md:col-span-2 flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#141319] border border-[#2A2932] flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                        {order.listing?.game?.icon ? (
                          <img
                            src={order.listing.game.icon}
                            alt=""
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-xl">🎮</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-arcane-gold uppercase tracking-wider block">
                          {order.listing?.game?.name || "Game Asset"}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                          {order.listing?.title || "Purchased Offer"}
                        </h3>
                        {order.package_details && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#141319] border border-[#2A2932] text-[11px] text-emerald-400 font-semibold">
                            💎 {order.package_details}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Buyer Identity Profile */}
                    <div className="flex items-center justify-between md:justify-end gap-4 p-3 rounded-xl bg-[#141319] border border-[#2A2932]/70">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full bg-[#1E1D24] border border-[#2A2932] flex items-center justify-center font-bold text-arcane-gold overflow-hidden text-xs shrink-0">
                          {order.buyer?.avatar_url ? (
                            <img
                              src={order.buyer.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            order.buyer?.username?.charAt(0).toUpperCase() ||
                            "B"
                          )}
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[#141319]" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block truncate">
                            {order.buyer?.username || "Verified Buyer"}
                          </span>
                          <span className="text-[10px] text-text-muted block">
                            Customer
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base sm:text-lg font-extrabold text-arcane-gold block">
                          ${order.amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-[#2A2932]/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      {order.status === "pending" && (
                        <>
                          <Button
                            onClick={() => acceptOrder(order.id)}
                            variant="gold"
                            size="sm"
                            className="font-bold flex items-center gap-1.5 shadow-md shadow-arcane-gold/10"
                          >
                            <HiOutlineCheck className="w-4 h-4" /> Accept Order
                          </Button>
                          <Button
                            onClick={() => setRejectOrderId(order.id)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-400 hover:bg-red-500/10 border border-[#2A2932]"
                          >
                            <HiOutlineX className="w-4 h-4" /> Reject / Cancel
                          </Button>
                        </>
                      )}

                      {order.status === "accepted" && (
                        <Button
                          onClick={() => openDelivery(order)}
                          variant="gold"
                          size="sm"
                          className="font-bold flex items-center gap-1.5 shadow-md shadow-arcane-gold/20"
                        >
                          <HiOutlineTruck className="w-4 h-4" /> Deliver Order
                          with Proof
                        </Button>
                      )}

                      {order.status === "delivered" && (
                        <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl font-medium">
                          ⏳ Waiting for buyer inspection & release
                        </span>
                      )}

                      {order.status === "completed" && (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1">
                          <HiOutlineCheck className="w-4 h-4" /> Payout Cleared
                          to Wallet
                        </span>
                      )}

                      <Button
                        onClick={() => openChat(order)}
                        variant="ghost"
                        size="sm"
                        className="text-xs border border-[#2A2932] flex items-center gap-1 hover:border-arcane-gold/40"
                      >
                        <HiOutlineChat className="w-4 h-4 text-arcane-gold" />{" "}
                        Order Chat
                      </Button>
                    </div>

                    {order.payment_proof && (
                      <a
                        href={order.payment_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-arcane-gold hover:underline flex items-center gap-1 font-medium self-center"
                      >
                        <HiOutlinePhotograph className="w-4 h-4" /> View
                        Delivery Proof Screenshot
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= CHAT MODAL ================= */}
        <AnimatePresence>
          {chatOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#18171E] border border-[#2A2932] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-[#2A2932] flex items-center justify-between bg-[#141319]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1E1D24] flex items-center justify-center font-bold text-arcane-gold text-xs">
                      {chatOrder.buyer?.avatar_url ? (
                        <img
                          src={chatOrder.buyer.avatar_url}
                          alt=""
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        chatOrder.buyer?.username?.charAt(0).toUpperCase() ||
                        "B"
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Chat with {chatOrder.buyer?.username}
                      </h3>
                      <p className="text-text-muted text-[11px]">
                        Order #{chatOrder.id.slice(0, 8)} • ${chatOrder.amount}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatOrder(null)}
                    className="p-1.5 text-text-muted hover:text-white"
                  >
                    <HiOutlineX className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px]">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-xs">
                      No messages in this trade room yet. Send credentials or
                      delivery instructions.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                              isMine
                                ? "bg-arcane-gold text-[#141319] font-medium rounded-tr-none"
                                : "bg-[#141319] border border-[#2A2932] text-white rounded-tl-none"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <span
                              className={`block text-[9px] mt-1 text-right ${
                                isMine ? "text-[#141319]/70" : "text-gray-400"
                              }`}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3.5 border-t border-[#2A2932] flex gap-2 bg-[#141319]/40">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type account credentials or delivery message..."
                    className="flex-1 bg-[#18171E] border border-[#2A2932] rounded-xl px-4 py-2 text-white text-xs sm:text-sm outline-none focus:border-arcane-gold/50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    variant="gold"
                    size="sm"
                    disabled={sendingMsg || !newMessage.trim()}
                    className="font-bold"
                  >
                    <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ================= DELIVERY MODAL WITH PROOF ================= */}
        <AnimatePresence>
          {deliveryOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#18171E] border border-[#2A2932] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#2A2932]">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HiOutlineTruck className="w-5 h-5 text-arcane-gold" />{" "}
                    Confirm Order Delivery
                  </h3>
                  <button
                    onClick={() => setDeliveryOrder(null)}
                    className="p-1 text-text-muted hover:text-white"
                  >
                    <HiOutlineX className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#141319] border border-[#2A2932] text-xs">
                  <span className="text-text-muted block text-[10px]">
                    Delivering To
                  </span>
                  <span className="font-bold text-white">
                    {deliveryOrder.buyer?.username}
                  </span>
                  <p className="text-text-muted text-[11px] mt-0.5 truncate">
                    {deliveryOrder.listing?.title}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Delivery Proof Screenshot{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofChange}
                    className="hidden"
                    id="delivery-proof"
                  />
                  <label
                    htmlFor="delivery-proof"
                    className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#2A2932] hover:border-arcane-gold/50 rounded-2xl cursor-pointer bg-[#141319]/50 transition-all"
                  >
                    {proofPreview ? (
                      <img
                        src={proofPreview}
                        alt="Proof preview"
                        className="max-h-36 rounded-xl object-contain border border-[#2A2932]"
                      />
                    ) : (
                      <>
                        <HiOutlinePhotograph className="w-8 h-8 text-text-muted" />
                        <span className="text-xs text-text-muted font-medium">
                          Click to upload delivery screenshot
                        </span>
                        <span className="text-[10px] text-gray-500">
                          PNG, JPG, JPEG up to 5MB
                        </span>
                      </>
                    )}
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Delivery Instructions / Secret Keys (Optional)
                  </label>
                  <textarea
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    rows={2}
                    placeholder="Provide redemption instructions or notes to buyer..."
                    className="w-full bg-[#141319] border border-[#2A2932] rounded-xl p-3 text-xs text-white outline-none focus:border-arcane-gold/50 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleDeliver}
                    variant="gold"
                    size="md"
                    className="flex-1 font-bold"
                    disabled={delivering || !proofFile}
                  >
                    {delivering
                      ? "Uploading & Delivering..."
                      : "Submit Delivery"}
                  </Button>
                  <Button
                    onClick={() => setDeliveryOrder(null)}
                    variant="ghost"
                    size="md"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ================= REJECT ORDER MODAL ================= */}
        <AnimatePresence>
          {rejectOrderId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#18171E] border border-[#2A2932] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#2A2932]">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HiOutlineX className="w-5 h-5 text-red-400" /> Reject /
                    Cancel Order
                  </h3>
                  <button
                    onClick={() => setRejectOrderId(null)}
                    className="p-1 text-text-muted hover:text-white"
                  >
                    <HiOutlineX className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-text-muted">
                  Cancelling will immediately refund the full amount from
                  TradeShield escrow back to the buyer's wallet.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Reason for Cancellation{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="e.g., Out of stock / Unable to fulfill at this moment..."
                    className="w-full bg-[#141319] border border-[#2A2932] rounded-xl p-3 text-xs text-white outline-none focus:border-red-400 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleReject}
                    variant="danger"
                    size="md"
                    className="flex-1 font-bold"
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    onClick={() => setRejectOrderId(null)}
                    variant="ghost"
                    size="md"
                    className="flex-1"
                  >
                    Keep Order
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
