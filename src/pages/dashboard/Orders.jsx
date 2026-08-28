import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineShoppingBag,
  HiOutlineCheckCircle,
  HiOutlineChat,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineExclamation,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineClipboardCopy,
  HiOutlineLockClosed,
  HiOutlinePhotograph,
  HiOutlineLightningBolt,
  HiOutlineBadgeCheck,
} from "react-icons/hi";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/useAuthStore";
import useOrderStore from "../../stores/useOrderStore";
import { supabase } from "../../lib/supabase";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import SEO from "../../components/ui/SEO";
import emptyOrdersImage from "/public/icons/pages/empty-orders.png";

const statusBadges = {
  pending: {
    label: "Awaiting Seller Dispatch",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  accepted: {
    label: "Seller Preparing Order",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
  },
  delivered: {
    label: "Delivered (Action Required)",
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    dot: "bg-purple-400",
  },
  completed: {
    label: "Completed & Verified",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  disputed: {
    label: "Under Escrow Dispute",
    color: "bg-red-500/15 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
  cancelled: {
    label: "Cancelled / Refunded",
    color: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    dot: "bg-gray-400",
  },
};

export default function Orders() {
  const { user } = useAuthStore();
  const {
    orders,
    loading,
    fetchBuyerOrders,
    confirmAndReleaseEscrow,
    openDispute,
    subscribeToOrders,
    unsubscribeFromOrders,
  } = useOrderStore();

  const navigate = useNavigate();

  // Credentials & Proof Inspection Modal
  const [viewDetailsOrder, setViewDetailsOrder] = useState(null);

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Dispute Modal State
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchBuyerOrders(user.id);
      subscribeToOrders(user.id);
    }
    return () => {
      unsubscribeFromOrders();
    };
  }, [user?.id]);

  const handleConfirmDelivery = async (order) => {
    if (
      !confirm(
        `Confirm delivery and release $${order.amount} from TradeShield escrow to seller ${order.seller?.username}?`,
      )
    ) {
      return;
    }

    const res = await confirmAndReleaseEscrow(
      order.id,
      user.id,
      order.seller_id,
      order.amount,
    );

    if (res.success) {
      setViewDetailsOrder(null);
      setReviewOrder(order);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      const { error } = await supabase.from("reviews").insert([
        {
          order_id: reviewOrder.id,
          reviewer_id: user.id,
          seller_id: reviewOrder.seller_id,
          listing_id: reviewOrder.listing_id,
          rating,
          comment: comment.trim(),
        },
      ]);

      if (error) throw error;
      toast.success("Thank you for your rating!");
      setReviewOrder(null);
      setComment("");
    } catch (err) {
      console.error("Submit review error:", err);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error("Please specify your reason for dispute");
      return;
    }
    await openDispute({
      orderId: disputeOrder.id,
      buyerId: user.id,
      sellerId: disputeOrder.seller_id,
      reason: disputeReason,
      description: disputeDesc,
    });
    setDisputeOrder(null);
    setDisputeReason("");
    setDisputeDesc("");
  };

  const copyToClipboard = (text, label = "Credentials") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO title="My Purchases & Orders | Arcane Bazaar" />
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2932]">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white">
              My Purchases
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

          <Link to="/marketplace">
            <Button
              variant="ghost"
              size="sm"
              className="border border-[#2A2932] text-xs"
            >
              + Browse More Games
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-[#18171E] border border-[#2A2932] rounded-2xl text-center"
          >
            <div className="w-28 h-28 mb-4">
              <img
                src={emptyOrdersImage}
                alt="No orders"
                className="w-full h-full object-contain opacity-75"
              />
            </div>
            <h2 className="text-lg font-bold text-white">
              No purchases placed yet
            </h2>
            <p className="text-text-muted text-xs mt-1 mb-5">
              Explore accounts, instant top-ups, boosting, and in-game items
              with escrow protection.
            </p>
            <Link to="/marketplace">
              <Button variant="gold" size="sm" className="font-bold">
                Explore Marketplace
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo =
                statusBadges[order.status] || statusBadges.pending;
              const isDelivered = order.status === "delivered";
              const isCompleted = order.status === "completed";
              const hasDeliveredInfo = Boolean(
                order.delivery_note ||
                order.payment_proof ||
                order.delivery_proof,
              );

              return (
                <div
                  key={order.id}
                  className="bg-[#18171E] border border-[#2A2932] hover:border-[#2A2932]/90 rounded-2xl p-5 shadow-xl transition-all space-y-4"
                >
                  {/* Top Bar: Order ID, Status, Escrow Status & Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#2A2932]/70">
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
                        <strong className="capitalize">
                          {order.escrow_status?.replace(/_/g, " ") || "Held"}
                        </strong>
                      </span>
                    </div>

                    <div className="text-xs text-text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                  </div>

                  {/* Center Content: Game Icon + Listing Info + Seller Mini Profile */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Game & Listing */}
                    <div className="md:col-span-2 flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#141319] border border-[#2A2932] flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                        {order.listing?.game?.icon ? (
                          <img
                            src={order.listing.game.icon}
                            alt=""
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<span class="text-xl">🎮</span>';
                            }}
                          />
                        ) : (
                          <span className="text-xl">🎮</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-arcane-gold uppercase tracking-wider block">
                          {order.listing?.game?.name || "Game Asset"} •{" "}
                          {order.listing?.category?.name || "Offer"}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                          {order.listing?.title || "Purchased Item"}
                        </h3>
                        {order.package_details && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#141319] border border-[#2A2932] text-[11px] text-emerald-400 font-semibold">
                            💎 {order.package_details}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Seller Mini Card */}
                    <div className="flex items-center justify-between md:justify-end gap-4 p-3 rounded-xl bg-[#141319] border border-[#2A2932]/70">
                      <Link
                        to={`/seller/${order.seller?.username}`}
                        className="flex items-center gap-2.5 min-w-0 group/seller"
                      >
                        <div className="relative w-8 h-8 rounded-full bg-[#1E1D24] border border-[#2A2932] flex items-center justify-center font-bold text-arcane-gold overflow-hidden text-xs shrink-0">
                          {order.seller?.avatar_url ? (
                            <img
                              src={order.seller.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            order.seller?.username?.charAt(0).toUpperCase() ||
                            "S"
                          )}
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-white group-hover/seller:text-arcane-gold transition-colors block truncate">
                            {order.seller?.username || "Verified Merchant"}
                          </span>
                          <span className="text-[10px] text-text-muted block">
                            Merchant
                          </span>
                        </div>
                      </Link>

                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-extrabold text-arcane-gold block">
                          ${order.amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info Banner (When Delivered) */}
                  {isDelivered && (
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 text-xs text-purple-300 font-medium">
                        <HiOutlineLightningBolt className="w-5 h-5 text-purple-400 shrink-0" />
                        <span>
                          Seller has dispatched your credentials/order. Please
                          inspect them now!
                        </span>
                      </div>

                      <Button
                        onClick={() => setViewDetailsOrder(order)}
                        variant="gold"
                        size="sm"
                        className="font-bold flex items-center gap-1.5 shadow-md shadow-arcane-gold/20"
                      >
                        <HiOutlineEye className="w-4 h-4" /> View Credentials &
                        Proof
                      </Button>
                    </div>
                  )}

                  {/* Actions Toolbar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#2A2932]/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isDelivered && (
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => handleConfirmDelivery(order)}
                          className="font-bold flex items-center gap-1.5 shadow-md shadow-arcane-gold/20"
                        >
                          <HiOutlineCheckCircle className="w-4 h-4" /> Confirm &
                          Release Funds
                        </Button>
                      )}

                      {/* View details button for completed orders */}
                      {isCompleted && hasDeliveredInfo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewDetailsOrder(order)}
                          className="text-xs border border-[#2A2932] flex items-center gap-1 hover:border-arcane-gold/40"
                        >
                          <HiOutlineEye className="w-4 h-4 text-arcane-gold" />{" "}
                          View Details
                        </Button>
                      )}

                      {isCompleted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReviewOrder(order)}
                          className="text-xs text-arcane-gold border border-arcane-gold/40 flex items-center gap-1 hover:bg-arcane-gold/10"
                        >
                          <HiOutlineStar className="w-4 h-4" /> Rate Seller
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/dashboard/messages?seller=${order.seller_id}`,
                          )
                        }
                        className="text-xs border border-[#2A2932] flex items-center gap-1 hover:border-arcane-gold/40"
                      >
                        <HiOutlineChat className="w-4 h-4 text-arcane-gold" />{" "}
                        Trade Chat
                      </Button>
                    </div>

                    {!isCompleted &&
                      order.status !== "disputed" &&
                      order.status !== "cancelled" && (
                        <button
                          onClick={() => setDisputeOrder(order)}
                          className="text-xs text-text-muted hover:text-red-400 transition-colors"
                        >
                          Problem with order? Open Dispute
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= VIEW CREDENTIALS & DELIVERY PROOF MODAL ================= */}
      <AnimatePresence>
        {viewDetailsOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18171E] border border-[#2A2932] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2932]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HiOutlineEye className="w-5 h-5 text-arcane-gold" />{" "}
                  Delivered Details & Instructions
                </h3>
                <button
                  onClick={() => setViewDetailsOrder(null)}
                  className="p-1 text-text-muted hover:text-white"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Order Context */}
              <div className="p-3 bg-[#141319] border border-[#2A2932] rounded-xl text-xs space-y-1">
                <span className="text-arcane-gold font-bold block">
                  {viewDetailsOrder.listing?.title}
                </span>
                <span className="text-text-muted block">
                  Seller:{" "}
                  <strong className="text-gray-200">
                    {viewDetailsOrder.seller?.username}
                  </strong>
                </span>
              </div>

              {/* Delivered Credentials / Instructions */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Account Credentials / Secret Key</span>
                  {viewDetailsOrder.delivery_note && (
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(viewDetailsOrder.delivery_note)
                      }
                      className="text-xs text-arcane-gold hover:underline flex items-center gap-1 font-semibold normal-case"
                    >
                      <HiOutlineClipboardCopy className="w-3.5 h-3.5" /> Copy
                      Details
                    </button>
                  )}
                </label>
                <div className="p-3.5 bg-[#141319] border border-[#2A2932] rounded-xl text-xs sm:text-sm text-gray-200 font-mono whitespace-pre-wrap select-all">
                  {viewDetailsOrder.delivery_note ||
                    "No textual note provided. Please check the Trade Chat or attached screenshot."}
                </div>
              </div>

              {/* Delivery Proof Screenshot (if attached) */}
              {(viewDetailsOrder.payment_proof ||
                viewDetailsOrder.delivery_proof) && (
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <HiOutlinePhotograph className="w-4 h-4 text-arcane-gold" />
                    Delivery Proof Screenshot
                  </label>
                  <div className="rounded-xl overflow-hidden border border-[#2A2932] bg-[#141319] p-2">
                    <img
                      src={
                        viewDetailsOrder.payment_proof ||
                        viewDetailsOrder.delivery_proof
                      }
                      alt="Delivery Proof"
                      className="w-full max-h-60 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 flex gap-2">
                {viewDetailsOrder.status === "delivered" && (
                  <Button
                    onClick={() => handleConfirmDelivery(viewDetailsOrder)}
                    variant="gold"
                    size="md"
                    className="flex-1 font-bold shadow-md shadow-arcane-gold/20 flex items-center justify-center gap-1.5"
                  >
                    <HiOutlineCheckCircle className="w-4 h-4" /> Confirm &
                    Release Funds
                  </Button>
                )}
                <Button
                  onClick={() => setViewDetailsOrder(null)}
                  variant="ghost"
                  size="md"
                  className="flex-1 border border-[#2A2932]"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= RATING & REVIEW MODAL ================= */}
      <AnimatePresence>
        {reviewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#2A2932] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HiOutlineStar className="w-5 h-5 text-arcane-gold" /> Rate
                  Your Experience
                </h3>
                <button
                  onClick={() => setReviewOrder(null)}
                  className="p-1 text-text-muted hover:text-white"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center py-2">
                <p className="text-xs text-text-muted mb-2">
                  How was your trade with{" "}
                  <strong>{reviewOrder.seller?.username}</strong>?
                </p>
                <div className="flex justify-center gap-2 text-2xl text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="hover:scale-125 transition-transform cursor-pointer"
                    >
                      {star <= rating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Your Review Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Fast delivery, accurate credentials, great seller..."
                  className="w-full bg-[#141319] border border-[#2A2932] rounded-xl p-3 text-xs text-white outline-none focus:border-arcane-gold/50 resize-none"
                />
              </div>

              <Button
                variant="gold"
                size="md"
                disabled={submittingReview}
                onClick={handleSubmitReview}
                className="w-full font-bold cursor-pointer"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= DISPUTE MODAL ================= */}
      <AnimatePresence>
        {disputeOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#2A2932] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HiOutlineExclamation className="w-5 h-5 text-red-400" /> Open
                  Trade Dispute
                </h3>
                <button
                  onClick={() => setDisputeOrder(null)}
                  className="p-1 text-text-muted hover:text-white"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Reason *
                </label>
                <input
                  type="text"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="e.g. Credentials incorrect / Item not delivered"
                  className="w-full bg-[#141319] border border-[#2A2932] rounded-xl p-2.5 text-xs text-white outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Details
                </label>
                <textarea
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  rows={3}
                  placeholder="Describe what happened in detail..."
                  className="w-full bg-[#141319] border border-[#2A2932] rounded-xl p-3 text-xs text-white outline-none focus:border-red-400 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleOpenDispute}
                  className="flex-1 font-bold"
                >
                  Submit Dispute
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setDisputeOrder(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
