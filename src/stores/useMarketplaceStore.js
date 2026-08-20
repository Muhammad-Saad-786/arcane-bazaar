import { create } from "zustand";
import { supabase } from "../lib/supabase";

let requestId = 0;

const initialFilters = {
  search: "",
  game: "",
  category: "",
  type: "", // 'account' | 'topup' | 'currency' | 'boosting' | 'items' | ''
  minPrice: "",
  maxPrice: "",
  server: "",
  rank: "",
  region: "",
  platform: "",
  serviceType: "",
  deliveryMethod: "",
  sortBy: "newest", // 'newest' | 'price-low' | 'price-high' | 'popular'
  featured: false,
  instantDelivery: false,
};

const useMarketplaceStore = create((set, get) => ({
  listings: [],
  games: [],
  categories: [],
  loading: false,
  totalCount: 0,
  currentPage: 1,
  pageSize: 15,
  availableServers: [],
  availablePlatforms: [],

  filters: { ...initialFilters },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1,
    }));
  },

  setMultipleFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1,
    }));
  },

  resetFilters: () => {
    set((state) => ({
      filters: {
        ...initialFilters,
        game: state.filters.game, // keep selected game if user only wants to reset filters
      },
      currentPage: 1,
    }));
  },

  resetAll: () => {
    set({
      filters: { ...initialFilters },
      currentPage: 1,
    });
  },

  fetchGames: async () => {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!error && data) {
      set({ games: data });
    }
    return data || [];
  },

  fetchCategories: async (gameSlug) => {
    let query = supabase
      .from("listing_categories")
      .select("*, game:games!inner(name, slug)");

    if (gameSlug && gameSlug !== "all") {
      query = query.eq("game.slug", gameSlug);
    }

    const { data, error } = await query.order("type", { ascending: true });
    if (!error && data) {
      set({ categories: data });
    }
    return data || [];
  },

  fetchListings: async () => {
    const currentRequestId = ++requestId;
    set({ loading: true });
    const { filters, currentPage, pageSize } = get();

    try {
      let query = supabase
        .from("listings")
        .select(
          `
            *,
            game:games!inner(id, name, slug, icon),
            category:listing_categories!inner(id, name, slug, type),
            seller:profiles(id, username, verified_seller, rating, avatar_url),
            images:listing_images(id, url, is_cover, sort_order)
          `,
          { count: "exact" },
        )
        .eq("status", "active")
        .eq("approval_status", "approved");

      // Game slug filter
      if (filters.game && filters.game !== "all") {
        query = query.eq("game.slug", filters.game);
      }

      // Category Type Tab filter (Accounts, Top-up, Boosting, Items)
      if (filters.type) {
        if (filters.type === "topup" || filters.type === "currency") {
          query = query.in("category.type", ["topup", "currency"]);
        } else {
          query = query.eq("category.type", filters.type);
        }
      }

      // Specific Category Slug filter
      if (filters.category) {
        query = query.eq("category.slug", filters.category);
      }

      // Search keyword filter
      if (filters.search?.trim()) {
        const term = filters.search.trim();
        query = query.or(
          `title.ilike.%${term}%,description.ilike.%${term}%,item_name.ilike.%${term}%`,
        );
      }

      // Price ranges
      if (filters.minPrice && !Number.isNaN(Number(filters.minPrice))) {
        query = query.gte("price", parseFloat(filters.minPrice));
      }
      if (filters.maxPrice && !Number.isNaN(Number(filters.maxPrice))) {
        query = query.lte("price", parseFloat(filters.maxPrice));
      }

      // Specifications
      if (filters.server) query = query.eq("server", filters.server);
      if (filters.region) query = query.eq("region", filters.region);
      if (filters.platform) query = query.eq("platform", filters.platform);
      if (filters.rank) query = query.eq("rank", filters.rank);
      if (filters.serviceType)
        query = query.eq("service_type", filters.serviceType);
      if (filters.deliveryMethod)
        query = query.eq("delivery_method", filters.deliveryMethod);

      // Quick flags
      if (filters.featured) query = query.eq("is_featured", true);
      if (filters.instantDelivery) {
        query = query.or("instant_delivery.eq.true,delivery_type.eq.instant");
      }

      // Sorting
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
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      // Pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (currentRequestId !== requestId) return;
      if (error) throw error;

      // Extract unique servers & platforms for active filter dropdowns
      const servers = [
        ...new Set((data || []).map((l) => l.server).filter(Boolean)),
      ];
      const platforms = [
        ...new Set((data || []).map((l) => l.platform).filter(Boolean)),
      ];

      set({
        listings: data || [],
        totalCount: count || 0,
        availableServers: servers,
        availablePlatforms: platforms,
        loading: false,
      });
    } catch (error) {
      if (currentRequestId !== requestId) return;
      console.error("Marketplace fetch error:", error);
      set({ listings: [], totalCount: 0, loading: false });
    }
  },

  setPage: (page) => set({ currentPage: page }),
}));

export default useMarketplaceStore;
