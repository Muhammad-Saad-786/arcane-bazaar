import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useGamesStore = create((set, get) => ({
  games: [],
  categories: [],
  trendingListings: [],
  selectedGame: "all",
  loading: false,

  fetchGames: async () => {
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    set({ games: data || [] });
  },

  fetchCategories: async (gameSlug) => {
    let query = supabase
      .from("listing_categories")
      .select("*, game:games(name, slug, icon)");
    if (gameSlug && gameSlug !== "all") {
      query = query.eq("game.slug", gameSlug);
    }
    const { data } = await query.order("type").limit(12);
    set({ categories: data || [] });
  },

  fetchTrendingListings: async (gameSlug) => {
    set({ loading: true });
    let query = supabase
      .from("listings")
      .select(
        `*, game:games(name, slug, icon), category:listing_categories(name, type), images:listing_images(url, is_cover)`,
      )
      .eq("status", "active")
      .eq("approval_status", "approved")
      .order("views", { ascending: false })
      .limit(8);

    if (gameSlug && gameSlug !== "all") {
      query = query.eq("game.slug", gameSlug);
    }

    const { data } = await query;
    set({ trendingListings: data || [], loading: false });
  },

  setSelectedGame: (slug) => {
    set({ selectedGame: slug });
    get().fetchCategories(slug);
    get().fetchTrendingListings(slug);
  },

  initialize: () => {
    get().fetchGames();
    get().fetchCategories("all");
    get().fetchTrendingListings("all");
  },
}));

export default useGamesStore;
