import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useMarketplaceStore = create((set, get) => ({
  listings: [],
  games: [],
  categories: [],
  loading: false,
  totalCount: 0,
  currentPage: 1,
  pageSize: 12,

  filters: {
    search: "",
    game: "",
    category: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    server: "",
    rank: "",
    sortBy: "newest",
    featured: false,
    instantDelivery: false,
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1,
    })),

  resetFilters: () =>
    set({
      filters: {
        search: "",
        game: "",
        category: "",
        type: "",
        minPrice: "",
        maxPrice: "",
        server: "",
        rank: "",
        sortBy: "newest",
        featured: false,
        instantDelivery: false,
      },
      currentPage: 1,
    }),

  fetchGames: async () => {
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    set({ games: data || [] });
  },

  fetchCategories: async (gameSlug) => {
    let query = supabase
      .from("listing_categories")
      .select("*, game:games!inner(name, slug)");
    if (gameSlug) query = query.eq("game.slug", gameSlug);
    const { data } = await query.order("type");
    set({ categories: data || [] });
  },

  fetchListings: async () => {
    set({ loading: true });
    const { filters, currentPage, pageSize } = get();

    try {
      let query = supabase
        .from("listings")
        .select(
          `*, game:games!inner(name, slug, icon), category:listing_categories!inner(name, slug, type), seller:profiles(username, verified_seller, rating), images:listing_images(url, is_cover)`,
          { count: "exact" },
        )
        .eq("status", "active")
        .eq("approval_status", "approved");

      // Filters
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      }
      if (filters.game) query = query.eq("game.slug", filters.game);
      if (filters.category) query = query.eq("category.slug", filters.category);
      if (filters.type) query = query.eq("category.type", filters.type);
      if (filters.minPrice)
        query = query.gte("price", parseFloat(filters.minPrice));
      if (filters.maxPrice)
        query = query.lte("price", parseFloat(filters.maxPrice));
      if (filters.server) query = query.eq("server", filters.server);
      if (filters.rank) query = query.eq("rank", filters.rank);
      if (filters.featured) query = query.eq("is_featured", true);
      if (filters.instantDelivery) query = query.eq("instant_delivery", true);

      // Sort
      switch (filters.sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "popular":
          query = query.order("views", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      // Pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      set({ listings: data || [], totalCount: count || 0, loading: false });
    } catch (error) {
      console.error("Fetch listings error:", error);
      set({ loading: false });
    }
  },

  setPage: (page) => set({ currentPage: page }),
}));

export default useMarketplaceStore;
