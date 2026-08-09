import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useRecentlyViewedStore = create((set, get) => ({
  items: [],
  loading: false,

  // Add to recently viewed
  addToRecentlyViewed: async (listingId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage for non-logged-in users
      const saved = JSON.parse(
        localStorage.getItem("arcane_recently_viewed") || "[]",
      );
      const filtered = saved.filter((item) => item.id !== listingId);
      filtered.unshift({ id: listingId, viewedAt: new Date().toISOString() });
      localStorage.setItem(
        "arcane_recently_viewed",
        JSON.stringify(filtered.slice(0, 20)),
      );
      return;
    }

    // Save to database
    try {
      await supabase.from("recently_viewed").upsert(
        {
          user_id: user.id,
          listing_id: listingId,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,listing_id" },
      );
    } catch (error) {
      console.error("Failed to save recently viewed:", error);
    }
  },

  // Fetch recently viewed
  fetchRecentlyViewed: async () => {
    set({ loading: true });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Load from localStorage
        const saved = JSON.parse(
          localStorage.getItem("arcane_recently_viewed") || "[]",
        );
        if (saved.length === 0) {
          set({ items: [], loading: false });
          return;
        }

        // Fetch listings for saved IDs
        const ids = saved.slice(0, 8).map((item) => item.id);
        const { data } = await supabase
          .from("listings")
          .select(
            `*, game:games(name, slug, icon), category:listing_categories(name, type), images:listing_images(url, is_cover)`,
          )
          .in("id", ids);

        // Sort by viewed order
        const sorted = ids
          .map((id) => data?.find((d) => d.id === id))
          .filter(Boolean);
        set({ items: sorted, loading: false });
        return;
      }

      // Load from database
      const { data } = await supabase
        .from("recently_viewed")
        .select(
          `*, listing:listings(*, game:games(name, slug, icon), category:listing_categories(name, type), images:listing_images(url, is_cover))`,
        )
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(8);

      const items = (data || []).map((item) => item.listing).filter(Boolean);
      set({ items, loading: false });
    } catch (error) {
      console.error("Failed to fetch recently viewed:", error);
      set({ loading: false });
    }
  },
}));

export default useRecentlyViewedStore;
