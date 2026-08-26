import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineTruck,
  HiOutlineChat,
  HiOutlineUpload,
  HiOutlinePaperAirplane,
  HiOutlinePhotograph,
} from "react-icons/hi";
import useSellerStore from "../../stores/useSellerStore";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import emptyOrdersImage from "/public/icons/pages/empty-orders.png";
const statusColors = {
  pending: "bg-amber-500/20 text-amber-400",
  accepted: "bg-blue-500/20 text-blue-400",
  delivered: "bg-purple-500/20 text-purple-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
  disputed: "bg-red-500/20 text-red-400",
};

const escrowColors = {
  awaiting_payment: "text-amber-400",
  payment_submitted: "text-blue-400",
  payment_verified: "text-green-400",
  delivered: "text-purple-400",
  released: "text-arcane-gold",
  refunded: "text-red-400",
};

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

  // Chat Modal
  const [chatOrder, setChatOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Delivery Modal
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [delivering, setDelivering] = useState(false);

  // Reject Modal
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchOrders().then(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // Open Chat
  const openChat = async (order) => {
    setChatOrder(order);
    const msgs = await fetchOrderMessages(order.id);
    setMessages(msgs || []);
  };

  // Send Message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    const msg = await sendOrderMessage(chatOrder.id, newMessage);
    if (msg) setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    setSendingMsg(false);
  };

  // Open Delivery Modal
  const openDelivery = (order) => {
    setDeliveryOrder(order);
    setProofFile(null);
    setProofPreview(null);
    setDeliveryNote("");
  };

  // Handle Proof Upload
  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  // Deliver with Proof
  const handleDeliver = async () => {
    if (!proofFile) {
      toast.error("Please upload delivery proof");
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

  // Reject Order
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    await rejectOrder(rejectOrderId, rejectReason);
    setRejectOrderId(null);
    setRejectReason("");
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Orders
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {orders.length} total orders
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          "all",
          "pending",
          "accepted",
          "delivered",
          "completed",
          "disputed",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${filter === s ? "bg-arcane-gold cursor-pointer text-arcane-dark" : " text-white bg-[#1E1D24]"}`}
          >
            {s} (
            {s === "all"
              ? orders.length
              : orders.filter((o) => o.status === s).length}
            )
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 max-w-2xl mx-auto"
        >
          <div className="flex flex-col items-center justify-center py-12 px-4">
            {/* PNG Image */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 mb-6">
              <img
                src={emptyOrdersImage}
                alt="No orders"
                className="w-full h-full object-contain"
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-white text-center">
              No orders yet
            </h2>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <GlassCard key={order.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                    {order.escrow_status && (
                      <span
                        className={`text-xs ${escrowColors[order.escrow_status]}`}
                      >
                        • {order.escrow_status?.replace(/_/g, " ")}
                      </span>
                    )}
                    {order.delivery_proof && (
                      <span className="text-xs text-green-400">
                        • Proof uploaded
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold">
                    {order.listing?.title || "Order"}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                    <span>👤 {order.buyer?.username}</span>
                    <span>🎮 {order.listing?.game?.name}</span>
                    <span>
                      📅 {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-arcane-gold font-bold text-lg mt-2">
                    ${order.amount}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {order.status === "pending" && (
                      <>
                        <Button
                          onClick={() => acceptOrder(order.id)}
                          variant="gold"
                          size="sm"
                        >
                          <HiOutlineCheck className="w-4 h-4" /> Accept
                        </Button>
                        <Button
                          onClick={() => setRejectOrderId(order.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <HiOutlineX className="w-4 h-4" /> Reject
                        </Button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <Button
                        onClick={() => openDelivery(order)}
                        variant="gold"
                        size="sm"
                      >
                        <HiOutlineTruck className="w-4 h-4" /> Deliver
                      </Button>
                    )}
                    {order.status === "delivered" && (
                      <span className="text-sm text-purple-400">
                        ⏳ Waiting for buyer confirmation
                      </span>
                    )}
                    <Button
                      onClick={() => openChat(order)}
                      variant="ghost"
                      size="sm"
                    >
                      <HiOutlineChat className="w-4 h-4" /> Chat
                    </Button>
                    {order.delivery_proof && (
                      <a
                        href={order.delivery_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-arcane-gold hover:underline self-center"
                      >
                        View Proof
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* ============ CHAT MODAL ============ */}
      <AnimatePresence>
        {chatOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal w-full max-w-lg max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-[#2A2932] flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Order Chat</h3>
                  <p className="text-text-muted text-xs">
                    {chatOrder.listing?.title} • {chatOrder.buyer?.username}
                  </p>
                </div>
                <button
                  onClick={() => setChatOrder(null)}
                  className="p-2 text-text-muted hover:text-white"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-8">
                    No messages yet
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${isMine ? "bg-arcane-gold/20 text-white" : "bg-[#1E1D24] text-white"}`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs text-text-muted mt-1">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-4 border-t border-[#2A2932] flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#1E1D24] border border-[#2A2932] rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                />
                <Button
                  onClick={handleSendMessage}
                  variant="gold"
                  size="sm"
                  disabled={sendingMsg}
                >
                  <HiOutlinePaperAirplane className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ DELIVERY MODAL ============ */}
      <AnimatePresence>
        {deliveryOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal w-full max-w-md p-6"
            >
              <h3 className="text-white font-semibold text-lg mb-4">
                Deliver Order
              </h3>
              <p className="text-text-muted text-sm mb-4">
                {deliveryOrder.listing?.title}
              </p>

              <label className="block text-sm text-text-secondary mb-2">
                Delivery Proof (Screenshot) *
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
                className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-[#2A2932] rounded-xl cursor-pointer hover:border-arcane-gold/30 transition-all mb-4"
              >
                {proofPreview ? (
                  <img
                    src={proofPreview}
                    alt=""
                    className="max-h-40 rounded-lg"
                  />
                ) : (
                  <>
                    <HiOutlinePhotograph className="w-8 h-8 text-text-muted" />
                    <span className="text-text-muted text-sm">
                      Click to upload proof
                    </span>
                  </>
                )}
              </label>

              <label className="block text-sm text-text-secondary mb-2">
                Note (optional)
              </label>
              <textarea
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={2}
                placeholder="Add delivery details..."
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-4 text-white text-sm outline-none resize-none mb-4"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleDeliver}
                  variant="gold"
                  className="flex-1"
                  disabled={delivering || !proofFile}
                >
                  {delivering ? (
                    "Delivering..."
                  ) : (
                    <>
                      <HiOutlineTruck className="w-4 h-4" /> Confirm Delivery
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setDeliveryOrder(null)}
                  variant="ghost"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ REJECT MODAL ============ */}
      <AnimatePresence>
        {rejectOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal w-full max-w-md p-6"
            >
              <h3 className="text-white font-semibold text-lg mb-4">
                Reject Order
              </h3>
              <label className="block text-sm text-text-secondary mb-2">
                Reason for rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Explain why you are rejecting this order..."
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-4 text-white text-sm outline-none resize-none mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleReject}
                  variant="gold"
                  className="flex-1"
                >
                  <HiOutlineX className="w-4 h-4" /> Confirm Reject
                </Button>
                <Button
                  onClick={() => setRejectOrderId(null)}
                  variant="ghost"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
