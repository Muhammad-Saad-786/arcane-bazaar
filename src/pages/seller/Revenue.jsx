import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineCurrencyDollar,
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineCreditCard,
  HiOutlineX,
} from "react-icons/hi";
import useSellerStore from "../../stores/useSellerStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const withdrawalMethods = [
  { id: "paypal", label: "PayPal", icon: "🅿️" },
  { id: "bank", label: "Bank Transfer", icon: "🏦" },
  { id: "crypto", label: "Crypto (USDT)", icon: "₿" },
  { id: "skrill", label: "Skrill", icon: "💳" },
];

export default function Revenue() {
  const {
    stats,
    transactions,
    fetchStats,
    fetchTransactions,
    requestWithdrawal,
  } = useSellerStore();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("paypal");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amount < 10) {
      toast.error("Minimum withdrawal is $10");
      return;
    }
    if (amount > stats.totalRevenue) {
      toast.error("Insufficient balance");
      return;
    }

    setWithdrawing(true);
    const method =
      withdrawalMethods.find((m) => m.id === withdrawMethod)?.label ||
      withdrawMethod;
    const result = await requestWithdrawal(amount, method);
    setWithdrawing(false);

    if (result.success) {
      setShowWithdraw(false);
      setWithdrawAmount("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Revenue
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Track your earnings and withdrawals
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `$${stats.totalRevenue?.toFixed(2) || "0.00"}`,
            icon: HiOutlineCurrencyDollar,
            color: "text-arcane-gold",
            bg: "bg-arcane-gold/10",
          },
          {
            label: "Completed Orders",
            value: stats.completedOrders,
            icon: HiOutlineArrowUp,
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
          {
            label: "Pending Orders",
            value: stats.pendingOrders,
            icon: HiOutlineArrowDown,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5 border-t-2 border-t-arcane-gold/30">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-extrabold text-white">
                {stat.value}
              </div>
              <div className="text-text-muted text-sm mt-1">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Transaction History
          </h2>
          <Button
            onClick={() => setShowWithdraw(true)}
            variant="gold"
            size="sm"
          >
            <HiOutlineCreditCard className="w-4 h-4" /> Withdraw
          </Button>
        </div>
        {transactions.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1E1D24] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "sale" ? "bg-green-500/10" : tx.type === "withdrawal" ? "bg-amber-500/10" : "bg-red-500/10"}`}
                  >
                    {tx.type === "sale" ? (
                      <HiOutlineArrowDown className="w-5 h-5 text-green-400" />
                    ) : (
                      <HiOutlineArrowUp className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium capitalize">
                      {tx.type}
                    </p>
                    <p className="text-text-muted text-xs">
                      {tx.description || "Transaction"} •{" "}
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                    {tx.status === "pending" && (
                      <span className="text-xs text-amber-400">
                        Pending approval
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${tx.type === "sale" ? "text-green-400" : "text-red-400"}`}
                >
                  {tx.type === "sale" ? "+" : "-"}$
                  {Math.abs(tx.amount)?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ============ WITHDRAWAL MODAL ============ */}
      <AnimatePresence>
        {showWithdraw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">
                  Withdraw Earnings
                </h3>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="p-2 text-text-muted hover:text-white"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-arcane-gold/10 rounded-xl mb-4 text-center">
                <p className="text-text-muted text-sm">Available Balance</p>
                <p className="text-2xl font-extrabold text-arcane-gold">
                  ${stats.totalRevenue?.toFixed(2) || "0.00"}
                </p>
              </div>

              <label className="block text-sm text-text-secondary mb-2">
                Amount (USD) *
              </label>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  $
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Minimum $10"
                  className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-arcane-gold/50 transition-all"
                />
              </div>

              <label className="block text-sm text-text-secondary mb-2">
                Withdrawal Method
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {withdrawalMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setWithdrawMethod(m.id)}
                    className={`p-3 rounded-xl text-sm border transition-all flex items-center gap-2 ${
                      withdrawMethod === m.id
                        ? "border-arcane-gold bg-arcane-gold/10 text-arcane-gold"
                        : "border-[#2A2932] text-text-muted hover:border-white/10"
                    }`}
                  >
                    <span>{m.icon}</span> {m.label}
                  </button>
                ))}
              </div>

              <p className="text-text-muted text-xs mb-4">
                Withdrawals are processed within 1-3 business days.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleWithdraw}
                  variant="gold"
                  className="flex-1"
                  disabled={withdrawing}
                >
                  {withdrawing ? "Processing..." : "Request Withdrawal"}
                </Button>
                <Button
                  onClick={() => setShowWithdraw(false)}
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
