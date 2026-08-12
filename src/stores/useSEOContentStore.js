import { create } from "zustand";
import { supabase } from "../lib/supabase";
// backup
const useSEOContentStore = create((set, get) => ({
  content: null,
  loading: false,
  cache: {},

  fetchContent: async (gameSlug, categoryType) => {
    const cacheKey = `${gameSlug}-${categoryType}`;

    // Check cache first
    if (get().cache[cacheKey]) {
      set({ content: get().cache[cacheKey] });
      return;
    }

    set({ loading: true });

    const { data: game } = await supabase
      .from("games")
      .select("id")
      .eq("slug", gameSlug)
      .single();
    if (!game) {
      set({ loading: false });
      return;
    }

    const { data } = await supabase
      .from("seo_content")
      .select("*")
      .eq("game_id", game.id)
      .eq("category_type", categoryType)
      .single();

    if (data) {
      set((state) => ({
        cache: { ...state.cache, [cacheKey]: data },
        content: data,
      }));
    }
    set({ loading: false });
  },
}));

export default useSEOContentStore;
