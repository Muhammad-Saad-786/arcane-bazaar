import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useWishlistStore = create((set, get) => ({
  wishlistIds: [],
  wishlistItems: [],
  loading: false,
  count: 0,

  fetchWishlistIds: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const { data } = await supabase
      .from("wishlist")
      .select("listing_id")
      .eq("user_id", user.id);
    const ids = (data || []).map((item) => item.listing_id);
    set({ wishlistIds: ids, count: ids.length });
  },

  toggleWishlist: async (listingId) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }

    const { wishlistIds } = get();
    const isWishlisted = wishlistIds.includes(listingId);

    if (isWishlisted) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
      set({
        wishlistIds: wishlistIds.filter((id) => id !== listingId),
        count: get().count - 1,
      });
      toast.success("Removed from wishlist");
    } else {
      await supabase
        .from("wishlist")
        .insert([{ user_id: user.id, listing_id: listingId }]);
      set({ wishlistIds: [...wishlistIds, listingId], count: get().count + 1 });
      toast.success("Added to wishlist!");
    }
  },

  clearWishlist: () => set({ wishlistIds: [], wishlistItems: [], count: 0 }),
}));

export default useWishlistStore;
