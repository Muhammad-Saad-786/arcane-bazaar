import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineWallet,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineRefresh,
} from "react-icons/hi";
import useWalletStore from "../../stores/useWalletStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";

export default function Wallet() {
  const {
    wallet,
    transactions,
    loading,
    fetchWallet,
    fetchTransactions,
    formatBalance,
  } = useWalletStore();

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        My Wallet
      </h1>

      {/* Balance Card */}
      <GlassCard className="p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-arcane-gold/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineWallet className="w-8 h-8 text-arcane-gold" />
        </div>
        <p className="text-text-muted text-sm">Available Balance</p>
        <p className="text-4xl sm:text-5xl font-extrabold text-arcane-gold mt-2">
          {formatBalance()}
        </p>
        <div className="flex gap-3 mt-6 justify-center">
          <Button variant="primary" size="md">
            Deposit
          </Button>
          <Button variant="ghost" size="md">
            Withdraw
          </Button>
        </div>
      </GlassCard>

      {/* Transactions */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Transactions</h2>
          <button
            onClick={fetchTransactions}
            className="text-text-muted hover:text-white"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-text-muted text-center py-8">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-arcane-surface transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === "deposit" || tx.type === "earning"
                        ? "bg-success/10"
                        : "bg-danger/10"
                    }`}
                  >
                    {tx.type === "deposit" || tx.type === "earning" ? (
                      <HiOutlineArrowDown className="w-5 h-5 text-success" />
                    ) : (
                      <HiOutlineArrowUp className="w-5 h-5 text-danger" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">
                      {tx.type}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${tx.type === "deposit" || tx.type === "earning" ? "text-success" : "text-danger"}`}
                >
                  {tx.type === "deposit" || tx.type === "earning" ? "+" : "-"}$
                  {tx.amount?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
