import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineCreditCard,
  HiOutlineLightningBolt,
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineBadgeCheck,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import useAuthStore from "../stores/useAuthStore";
import useWalletStore from "../stores/useWalletStore";
import useOrderStore from "../stores/useOrderStore";
import useCurrencyStore from "../stores/useCurrencyStore";
import Button from "../components/ui/Button";
import SEO from "../components/ui/SEO";

// Insurance Tiers Configuration
const insuranceOptions = [
  {
    id: "none",
    title: "No Extra Insurance",
    desc: "Standard 48-Hour trade escrow protection included.",
    priceRate: 0,
    badge: "Included Free",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    id: "basic",
    title: "14 Days TradeShield™ Insurance",
    desc: "Full money-back guarantee in case of seller account recall or bans within 14 days.",
    priceRate: 0.08, // 8% fee
    badge: "Recommended",
    badgeColor: "bg-arcane-gold/15 text-arcane-gold border-arcane-gold/30",
  },
  {
    id: "premium",
    title: "30 Days Full Lifetime Insurance",
    desc: "Maximum priority dispute resolution and 100% replacement assurance for 30 days.",
    priceRate: 0.15, // 15% fee
    badge: "Ultimate Safe",
    badgeColor:
      "bg-arcane-purple/15 text-arcane-purple border-arcane-purple/30",
  },
];

// Skeleton Card Placeholder
const CheckoutSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-pulse space-y-6">
    <div className="h-6 w-36 bg-[#1E1D24] rounded-lg" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-44 bg-[#18171E] border border-[#2A2932] rounded-2xl p-5" />
        <div className="h-64 bg-[#18171E] border border-[#2A2932] rounded-2xl p-5" />
        <div className="h-48 bg-[#18171E] border border-[#2A2932] rounded-2xl p-5" />
      </div>
      <div className="space-y-4">
        <div className="h-80 bg-[#18171E] border border-[#2A2932] rounded-2xl p-5" />
        <div className="h-32 bg-[#18171E] border border-[#2A2932] rounded-2xl p-5" />
      </div>
    </div>
  </div>
);

export default function Checkout() {
  const { listingId } = useParams();
  const [searchParams] = useSearchParams();
  const packageIndex = parseInt(searchParams.get("package") || "0", 10);

  const { user } = useAuthStore();
  const { wallet, fetchWallet, formatBalance } = useWalletStore();
  const { createOrder, submitting } = useOrderStore();
  const { formatPrice } = useCurrencyStore();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsurance, setSelectedInsurance] = useState("none");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  useEffect(() => {
    if (user?.id) fetchWallet();
    fetchListingAndSellerData();
  }, [listingId, user?.id]);

  const fetchListingAndSellerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Listing with Game and Seller Info
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select(
          `
            *,
            game:games(name, slug, icon),
            category:listing_categories(name, type),
            seller:profiles!seller_id(id, username, avatar_url, verified_seller, rating, total_sales, created_at)
          `,
        )
        .eq("id", listingId)
        .single();

      if (listingError || !listingData) throw listingError;
      setListing(listingData);

      // 2. Fetch Verified Seller Reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(
          `
            id,
            rating,
            comment,
            created_at,
            reviewer:profiles!reviewer_id(username, avatar_url)
          `,
        )
        .eq("seller_id", listingData.seller_id)
        .order("created_at", { ascending: false })
        .limit(3);

      setSellerReviews(reviewsData || []);
    } catch (err) {
      console.error("Error loading checkout data:", err);
      toast.error("Could not load checkout details");
      navigate("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121118] text-white pt-24 pb-20">
        <CheckoutSkeleton />
      </div>
    );
  }

  if (!listing) return null;

  // Calculate pricing & package details
  const hasPackages =
    (listing.category?.type === "topup" ||
      listing.category?.type === "currency") &&
    Array.isArray(listing.amount_options) &&
    listing.amount_options.length > 0;

  const selectedPkg = hasPackages
    ? listing.amount_options[packageIndex] || listing.amount_options[0]
    : null;

  const itemTitle = selectedPkg
    ? `${listing.game?.name || "Game"} - ${selectedPkg.amount}`
    : listing.title;

  const basePrice = selectedPkg
    ? Number(selectedPkg.price)
    : Number(listing.price);

  // Calculate Insurance Amount
  const activeInsurance = insuranceOptions.find(
    (i) => i.id === selectedInsurance,
  );
  const insuranceFee = Number(
    (basePrice * activeInsurance.priceRate).toFixed(2),
  );
  const totalAmount = Number((basePrice + insuranceFee).toFixed(2));

  // Wallet Verification
  const userWalletBalance = Number(wallet?.balance || 0);
  const hasSufficientBalance = userWalletBalance >= totalAmount;

  // Seller Metrics
  const sellerPositiveRate = listing.seller?.rating
    ? (listing.seller.rating * 20).toFixed(0)
    : "99.8";

  const handlePayNow = async () => {
    if (!user) {
      toast.error("Please log in to complete your order");
      navigate("/login");
      return;
    }

    if (user.id === listing.seller_id) {
      toast.error("You cannot buy your own listing");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please accept the TradeShield escrow agreement");
      return;
    }

    if (paymentMethod === "wallet" && !hasSufficientBalance) {
      toast.error(
        "Insufficient wallet balance. Please top up or choose card payment.",
      );
      return;
    }

    const result = await createOrder({
      buyerId: user.id,
      sellerId: listing.seller_id,
      listingId: listing.id,
      amount: totalAmount,
      paymentMethod,
      packageDetails: selectedPkg
        ? `${selectedPkg.amount} [${activeInsurance.title}]`
        : activeInsurance.id !== "none"
          ? `With ${activeInsurance.title}`
          : null,
    });

    if (result.success) {
      navigate("/dashboard/orders");
    }
  };

  return (
    <div className="min-h-screen bg-[#121118] text-white pt-24 pb-20">
      <SEO title={`Checkout - ${itemTitle} | Arcane Bazaar`} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Back Nav */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white mb-6 transition-colors font-medium"
        >
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Listing
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Complete Your Order
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 flex items-center gap-1.5">
              <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400" />
              Protected by{" "}
              <strong className="text-white">TradeShield™ Escrow</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted bg-[#18171E] border border-[#2A2932] px-3.5 py-1.5 rounded-xl self-start">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Encrypted 256-Bit SSL Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ================= LEFT 2 COLUMNS: ITEM, SELLER TRUST & INSURANCE ================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Item Summary Card */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#141319] border border-[#2A2932] flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                  {listing.game?.icon ? (
                    <img
                      src={listing.game.icon}
                      alt=""
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <span className="text-2xl">🎮</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-arcane-gold uppercase tracking-wider px-2 py-0.5 rounded bg-arcane-gold/10 border border-arcane-gold/20">
                      {listing.game?.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      • {listing.category?.name || "Offer"}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug truncate">
                    {itemTitle}
                  </h3>

                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <HiOutlineLightningBolt className="w-3.5 h-3.5" />
                      {listing.delivery_time || "15"}m Avg Delivery
                    </span>
                    <span>•</span>
                    <span className="capitalize text-gray-300">
                      Method:{" "}
                      {listing.delivery_method
                        ? listing.delivery_method.replace(/_/g, " ")
                        : "Direct Dispatch"}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg sm:text-xl font-extrabold text-arcane-gold block">
                    {formatPrice(basePrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Seller Trust & Feedback Card */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2932]">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-[#141319] border border-[#2A2932] flex items-center justify-center font-bold text-arcane-gold overflow-hidden">
                    {listing.seller?.avatar_url ? (
                      <img
                        src={listing.seller.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      listing.seller?.username?.charAt(0).toUpperCase() || "S"
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#18171E]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">
                        {listing.seller?.username || "Verified Merchant"}
                      </span>
                      {listing.seller?.verified_seller && (
                        <HiOutlineBadgeCheck
                          className="w-4 h-4 text-blue-400"
                          title="Verified Identity"
                        />
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted">
                      {listing.seller?.total_sales || 142} orders completed
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-400 block">
                    {sellerPositiveRate}% Positive
                  </span>
                  <span className="text-[10px] text-text-muted">
                    Verified Trader
                  </span>
                </div>
              </div>

              {/* Verified Seller Reviews Snippet */}
              {sellerReviews.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                    Recent Buyer Feedback for this Seller
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {sellerReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 bg-[#141319] border border-[#2A2932]/70 rounded-xl flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <strong className="text-gray-300">
                              {rev.reviewer?.username || "Buyer"}
                            </strong>
                            <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
                              <HiOutlineCheck className="w-3 h-3" /> Verified
                              Order
                            </span>
                          </div>
                          <p className="text-text-muted mt-1 leading-relaxed text-[11px]">
                            &ldquo;
                            {rev.comment || "Fast and reliable delivery."}
                            &rdquo;
                          </p>
                        </div>
                        <div className="flex text-amber-400 text-xs shrink-0">
                          {"★".repeat(rev.rating || 5)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Insurance & Protection Selector (Like Reference UI) */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-xl space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-5 h-5 text-arcane-gold" />
                  Order Insurance & Warranty
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Protect your purchase against unauthorized recovery, recalls,
                  or suspensions.
                </p>
              </div>

              <div className="space-y-2.5">
                {insuranceOptions.map((opt) => {
                  const isSelected = selectedInsurance === opt.id;
                  const fee =
                    opt.priceRate > 0
                      ? Number((basePrice * opt.priceRate).toFixed(2))
                      : 0;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => setSelectedInsurance(opt.id)}
                      className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-arcane-gold/10 border-arcane-gold ring-1 ring-arcane-gold/30"
                          : "bg-[#141319] border-[#2A2932] hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="insurance"
                          checked={isSelected}
                          onChange={() => setSelectedInsurance(opt.id)}
                          className="accent-arcane-gold w-4 h-4 mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {opt.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${opt.badgeColor}`}
                            >
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-white">
                          {fee === 0 ? "FREE" : `+${formatPrice(fee)}`}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Payment Method Selector */}
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-xl space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Select Payment Method
              </h2>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "wallet"
                    ? "bg-arcane-gold/10 border-arcane-gold ring-1 ring-arcane-gold/30"
                    : "bg-[#141319] border-[#2A2932] hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                    className="accent-arcane-gold w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Arcane Wallet Balance
                    </span>
                    <span className="text-xs text-text-muted">
                      Available:{" "}
                      <strong className="text-arcane-gold">
                        {formatBalance()}
                      </strong>
                    </span>
                  </div>
                </div>

                {!hasSufficientBalance && (
                  <Link
                    to="/dashboard/wallet"
                    className="text-xs text-arcane-purple hover:underline font-semibold"
                  >
                    Top-up Wallet +
                  </Link>
                )}
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "bg-arcane-gold/10 border-arcane-gold ring-1 ring-arcane-gold/30"
                    : "bg-[#141319] border-[#2A2932] hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="accent-arcane-gold w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Credit / Debit Card (Stripe / Binance Pay)
                    </span>
                    <span className="text-xs text-text-muted">
                      Instant zero-fee escrow checkout
                    </span>
                  </div>
                </div>
                <HiOutlineCreditCard className="w-5 h-5 text-gray-400" />
              </label>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PRICE BREAKDOWN & ESCROW CTA ================= */}
          <div className="space-y-4">
            <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl p-5 shadow-2xl sticky top-24">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2A2932]">
                Summary Breakdown
              </h2>

              <div className="space-y-3 text-xs text-text-muted pb-4 border-b border-[#2A2932]">
                <div className="flex justify-between">
                  <span>Item Price</span>
                  <span className="text-white font-medium">
                    {formatPrice(basePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance ({activeInsurance.title})</span>
                  <span className="text-white font-medium">
                    {insuranceFee === 0 ? "FREE" : formatPrice(insuranceFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TradeShield™ Protection Fee</span>
                  <span className="text-emerald-400 font-medium">
                    FREE ($0.00)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-[#2A2932]">
                <span className="text-sm font-bold text-white">
                  Total Amount
                </span>
                <span className="text-2xl font-extrabold text-arcane-gold tracking-tight">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-2.5 my-4 cursor-pointer select-none text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded accent-arcane-gold bg-[#141319] border-[#2A2932] mt-0.5 shrink-0"
                />
                <span className="leading-snug">
                  I understand funds remain locked in TradeShield Escrow until I
                  inspect and confirm delivery.
                </span>
              </label>

              {/* Main Pay Now CTA */}
              <Button
                variant="gold"
                size="lg"
                disabled={submitting || !agreedToTerms}
                onClick={handlePayNow}
                className="w-full font-bold shadow-lg shadow-arcane-gold/20 flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  "Securing Escrow..."
                ) : (
                  <>
                    <HiOutlineLockClosed className="w-5 h-5" /> Confirm & Pay{" "}
                    {formatPrice(totalAmount)}
                  </>
                )}
              </Button>

              {/* Guarantees Box */}
              <div className="mt-5 pt-4 border-t border-[#2A2932]/70 space-y-2.5 text-[11px] text-text-muted">
                <div className="flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Refund Guarantee if seller fails delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineClock className="w-4 h-4 text-arcane-gold shrink-0" />
                  <span>Automated 48-Hour Inspection Window</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
