import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useWalletStore = create((set, get) => ({
  wallet: null,
  transactions: [],
  loading: false,

  fetchWallet: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });
    const { data } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    set({ wallet: data, loading: false });
  },

  fetchTransactions: async () => {
    const { wallet } = get();
    if (!wallet) return;

    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })
      .limit(20);

    set({ transactions: data || [] });
  },

  getBalance: () => {
    return get().wallet?.balance || 0;
  },

  formatBalance: () => {
    const balance = get().wallet?.balance || 0;
    return `$${balance.toFixed(2)}`;
  },
}));

export default useWalletStore;
