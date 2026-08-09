import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useSearchStore = create((set, get) => ({
  query: "",
  results: [],
  popularGames: [],
  popularCategories: [],
  loading: false,
  showResults: false,

  fetchPopularItems: async () => {
    // Fetch games
    const { data: games } = await supabase
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .limit(8);

    // Fetch categories
    const { data: categories } = await supabase
      .from("listing_categories")
      .select("*, game:games(name, slug, icon)")
      .limit(8);

    set({ popularGames: games || [], popularCategories: categories || [] });
  },

  setQuery: (query) => {
    set({ query });
    if (query.length >= 2) {
      get().search(query);
    } else if (query.length === 0) {
      set({ results: [], showResults: false });
    }
  },

  search: async (query) => {
    set({ loading: true, showResults: true });

    const { data } = await supabase
      .from("listings")
      .select(
        `*, game:games(name, slug, icon), category:listing_categories(name, type), images:listing_images(url, is_cover)`,
      )
      .eq("status", "active")
      .eq("approval_status", "approved")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("views", { ascending: false })
      .limit(6);

    set({ results: data || [], loading: false });
  },

  clearSearch: () => {
    set({ query: "", results: [], showResults: false });
  },

  closeResults: () => set({ showResults: false }),
}));

export default useSearchStore;
