import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useNavbarStore = create((set, get) => ({
  games: [],
  allCategories: [],
  trendingListings: [],
  loaded: false,

  // Fetch ALL data once when app loads
  initialize: async () => {
    if (get().loaded) return; // Only fetch once

    const [gamesRes, categoriesRes, listingsRes] = await Promise.all([
      supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("listing_categories")
        .select("*, game:games(name, slug, icon)")
        .order("type"),
      supabase
        .from("listings")
        .select(
          `*, game:games(name, slug, icon), category:listing_categories(name, type), images:listing_images(url, is_cover)`,
        )
        .eq("status", "active")
        .eq("approval_status", "approved")
        .order("views", { ascending: false })
        .limit(6),
    ]);

    set({
      games: gamesRes.data || [],
      allCategories: categoriesRes.data || [],
      trendingListings: listingsRes.data || [],
      loaded: true,
    });
  },

  // Get categories by type (filtered instantly from cache)
  getCategoriesByType: (type) => {
    return get().allCategories.filter((c) => c.type === type);
  },

  // Get trending by type
  getTrendingByType: (type) => {
    const { allCategories } = get();
    const typeCategoryIds = allCategories
      .filter((c) => c.type === type)
      .map((c) => c.id);
    return get().trendingListings.filter((l) =>
      typeCategoryIds.includes(l.category_id),
    );
  },
}));

export default useNavbarStore;
