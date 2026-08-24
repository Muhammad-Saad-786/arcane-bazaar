import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const createEmptyForm = () => ({
  game_id: "",
  category_id: "",
  title: "",
  description: "",
  price: "",
  delivery_type: "manual", // manual | instant | auto
  delivery_time: "30",
  instant_delivery: false,
  images: [],

  // Account specific
  rank: "",
  level: "",
  server: "",
  hero_count: "",
  skin_count: "",

  // Topup / Currency specific
  amount_options: [], // [{ id, amount, original_price, price, discount_percent, bonus, is_popular }]
  delivery_method: "login", // login | gifting | redeem_code
  region: "",
  platform: "",

  // Boosting specific
  service_type: "rank_boost", // rank_boost | win_boost | placement
  current_rank: "",
  target_rank: "",

  // Items specific
  item_name: "",
  quantity: "1",
});

const getListingPayload = (formData, categoryType) => {
  const basePayload = {
    game_id: formData.game_id,
    category_id: formData.category_id,
    title: formData.title.trim(),
    description: formData.description.trim(),
    price: formData.price ? Number.parseFloat(formData.price) : 0,
    delivery_type: formData.delivery_type || "manual",
    delivery_time: String(formData.delivery_time || "30"),
    instant_delivery:
      formData.delivery_type === "instant" ||
      Boolean(formData.instant_delivery),
  };

  // Category specific mappings
  if (categoryType === "account") {
    return {
      ...basePayload,
      rank: formData.rank?.trim() || null,
      level: formData.level ? Number.parseInt(formData.level, 10) : null,
      server: formData.server?.trim() || null,
      hero_count: formData.hero_count
        ? Number.parseInt(formData.hero_count, 10)
        : 0,
      skin_count: formData.skin_count
        ? Number.parseInt(formData.skin_count, 10)
        : 0,
      amount_options: [],
      service_type: null,
      target_rank: null,
      item_name: null,
      quantity: 1,
      delivery_method: null,
      region: null,
      platform: null,
    };
  }

  if (categoryType === "topup" || categoryType === "currency") {
    const formattedOptions = (formData.amount_options || []).map((opt) => ({
      id: opt.id || crypto.randomUUID(),
      amount: String(opt.amount || "").trim(),
      original_price: opt.original_price
        ? Number.parseFloat(opt.original_price)
        : null,
      price: Number.parseFloat(opt.price) || 0,
      discount_percent: opt.discount_percent
        ? Number.parseInt(opt.discount_percent, 10)
        : null,
      bonus: opt.bonus?.trim() || null,
      is_popular: Boolean(opt.is_popular),
    }));

    // Auto set base price from lowest price package
    const prices = formattedOptions.map((o) => o.price).filter((p) => p > 0);
    const effectivePrice =
      prices.length > 0 ? Math.min(...prices) : basePayload.price || 0;

    return {
      ...basePayload,
      price: effectivePrice,
      amount_options: formattedOptions,
      delivery_method: formData.delivery_method || "login",
      region: formData.region?.trim() || null,
      platform: formData.platform?.trim() || null,
      rank: null,
      level: null,
      server: null,
      hero_count: 0,
      skin_count: 0,
      service_type: null,
      target_rank: null,
      item_name: null,
      quantity: 1,
    };
  }

  if (categoryType === "boosting") {
    return {
      ...basePayload,
      service_type: formData.service_type || "rank_boost",
      rank: formData.current_rank?.trim() || null,
      target_rank: formData.target_rank?.trim() || null,
      region: formData.region?.trim() || null,
      server: formData.server?.trim() || null,
      platform: formData.platform?.trim() || null,
      amount_options: [],
      level: null,
      hero_count: 0,
      skin_count: 0,
      item_name: null,
      quantity: 1,
      delivery_method: null,
    };
  }

  if (categoryType === "items") {
    return {
      ...basePayload,
      item_name: formData.item_name?.trim() || null,
      quantity: formData.quantity
        ? Math.max(1, Number.parseInt(formData.quantity, 10))
        : 1,
      delivery_method: formData.delivery_method || "direct_trade",
      server: formData.server?.trim() || null,
      region: formData.region?.trim() || null,
      platform: formData.platform?.trim() || null,
      amount_options: [],
      rank: null,
      level: null,
      hero_count: 0,
      skin_count: 0,
      service_type: null,
      target_rank: null,
    };
  }

  return {
    ...basePayload,
    rank: formData.rank?.trim() || null,
    level: formData.level ? Number.parseInt(formData.level, 10) : null,
    server: formData.server?.trim() || null,
    hero_count: formData.hero_count
      ? Number.parseInt(formData.hero_count, 10)
      : 0,
    skin_count: formData.skin_count
      ? Number.parseInt(formData.skin_count, 10)
      : 0,
    amount_options: formData.amount_options || [],
    service_type: formData.service_type || null,
    target_rank: formData.target_rank || null,
    item_name: formData.item_name || null,
    quantity: formData.quantity ? Number.parseInt(formData.quantity, 10) : 1,
    delivery_method: formData.delivery_method || null,
    region: formData.region || null,
    platform: formData.platform || null,
  };
};

const useCreateListingStore = create((set, get) => ({
  currentStep: 1,
  totalSteps: 4,
  loading: false,
  loadingListing: false,
  games: [],
  categories: [],

  editorMode: "create",
  editingListingId: null,
  originalImageIds: [],

  formData: createEmptyForm(),

  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  updateField: (field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
    })),

  // Top-Up Package Helpers
  addAmountOption: () =>
    set((state) => ({
      formData: {
        ...state.formData,
        amount_options: [
          ...state.formData.amount_options,
          {
            id: crypto.randomUUID(),
            amount: "",
            original_price: "",
            price: "",
            discount_percent: "",
            bonus: "",
            is_popular: false,
          },
        ],
      },
    })),

  updateAmountOption: (id, field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        amount_options: state.formData.amount_options.map((opt) => {
          if (opt.id !== id) return opt;

          const updated = { ...opt, [field]: value };

          // Automatically compute discount percentage if original_price & price exist
          if (field === "price" || field === "original_price") {
            const orig = Number.parseFloat(
              field === "original_price" ? value : updated.original_price,
            );
            const pr = Number.parseFloat(
              field === "price" ? value : updated.price,
            );
            if (orig > 0 && pr > 0 && orig > pr) {
              updated.discount_percent = Math.round(
                ((orig - pr) / orig) * 100,
              ).toString();
            } else if (pr >= orig) {
              updated.discount_percent = "";
            }
          }

          return updated;
        }),
      },
    })),

  removeAmountOption: (id) =>
    set((state) => ({
      formData: {
        ...state.formData,
        amount_options: state.formData.amount_options.filter(
          (opt) => opt.id !== id,
        ),
      },
    })),

  addImages: (files) => {
    const acceptedFiles = Array.from(files || []);
    set((state) => {
      const availableSlots = Math.max(0, 10 - state.formData.images.length);
      const filesToAdd = acceptedFiles.slice(0, availableSlots);

      const newImages = filesToAdd.map((file) => ({
        id: `new-${crypto.randomUUID()}`,
        file,
        preview: URL.createObjectURL(file),
        isExisting: false,
      }));

      if (acceptedFiles.length > availableSlots) {
        toast.error("A maximum of 10 screenshots is allowed");
      }

      return {
        formData: {
          ...state.formData,
          images: [...state.formData.images, ...newImages],
        },
      };
    });
  },

  removeImage: (id) =>
    set((state) => {
      const image = state.formData.images.find((item) => item.id === id);
      if (image?.file && image.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return {
        formData: {
          ...state.formData,
          images: state.formData.images.filter((item) => item.id !== id),
        },
      };
    }),

  fetchGames: async () => {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Could not load games");
      return [];
    }

    set({ games: data || [] });
    return data || [];
  },

  fetchCategories: async (gameId) => {
    if (!gameId) {
      set({ categories: [] });
      return [];
    }

    const { data, error } = await supabase
      .from("listing_categories")
      .select("*")
      .eq("game_id", gameId)
      .order("type", { ascending: true });

    if (error) {
      toast.error("Could not load game categories");
      return [];
    }

    set({ categories: data || [] });
    return data || [];
  },

  validateCurrentStep: () => {
    const { currentStep, formData, categories } = get();
    const category = categories.find((c) => c.id === formData.category_id);
    const categoryType = category?.type || "account";

    if (currentStep === 1 && !formData.game_id) {
      toast.error("Please select a game");
      return false;
    }

    if (currentStep === 2 && !formData.category_id) {
      toast.error("Please select a category");
      return false;
    }

    if (currentStep === 3) {
      if (!formData.title.trim()) {
        toast.error("Listing title is required");
        return false;
      }

      if (!formData.description.trim()) {
        toast.error("Listing description is required");
        return false;
      }

      const deliveryTime = Number.parseInt(formData.delivery_time, 10);
      if (!Number.isFinite(deliveryTime) || deliveryTime <= 0) {
        toast.error("Enter a valid delivery time in minutes");
        return false;
      }

      // Accounts Validation
      if (categoryType === "account") {
        const price = Number.parseFloat(formData.price);
        if (!Number.isFinite(price) || price <= 0) {
          toast.error("Enter a valid price greater than zero");
          return false;
        }

        if (formData.images.length < 5) {
          toast.error(
            "Account listings require at least 5 screenshots for verification",
          );
          return false;
        }
      }

      // Topup / Currency Validation
      if (categoryType === "topup" || categoryType === "currency") {
        if (!formData.amount_options || formData.amount_options.length === 0) {
          toast.error("Please add at least one top-up package");
          return false;
        }

        const hasInvalidOptions = formData.amount_options.some(
          (opt) =>
            !opt.amount.trim() ||
            !opt.price ||
            Number.parseFloat(opt.price) <= 0,
        );
        if (hasInvalidOptions) {
          toast.error(
            "Please provide package amount names and valid selling prices",
          );
          return false;
        }

        if (formData.images.length < 1) {
          toast.error("Please upload at least 1 image/cover");
          return false;
        }
      }

      // Boosting Validation
      if (categoryType === "boosting") {
        const price = Number.parseFloat(formData.price);
        if (!Number.isFinite(price) || price <= 0) {
          toast.error("Enter a valid price greater than zero");
          return false;
        }

        if (!formData.current_rank?.trim() || !formData.target_rank?.trim()) {
          toast.error("Please provide both Current Rank and Target Rank");
          return false;
        }

        if (formData.images.length < 1) {
          toast.error("Please upload at least 1 image");
          return false;
        }
      }

      // Items Validation
      if (categoryType === "items") {
        if (!formData.item_name?.trim()) {
          toast.error("Item name is required");
          return false;
        }

        const quantity = Number.parseInt(formData.quantity, 10);
        if (!Number.isFinite(quantity) || quantity < 1) {
          toast.error("Quantity must be at least 1");
          return false;
        }

        const price = Number.parseFloat(formData.price);
        if (!Number.isFinite(price) || price <= 0) {
          toast.error("Enter a valid price per item");
          return false;
        }

        if (formData.images.length < 1) {
          toast.error("Please upload at least 1 item image");
          return false;
        }
      }
    }

    return true;
  },

  loadListing: async (listingId, mode = "edit") => {
    const user = useAuthStore.getState().user;
    if (!user || !listingId)
      return { success: false, error: "Missing listing info" };

    set({ loadingListing: true });
    try {
      const { data: listing, error } = await supabase
        .from("listings")
        .select(`*, images:listing_images(id, url, is_cover, sort_order)`)
        .eq("id", listingId)
        .eq("seller_id", user.id)
        .single();

      if (error || !listing) throw new Error("Listing not found");

      await get().fetchCategories(listing.game_id);

      const existingImages = [...(listing.images || [])]
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img) => ({
          id: img.id,
          databaseId: img.id,
          preview: img.url,
          url: img.url,
          isExisting: true,
          is_cover: img.is_cover,
          sort_order: img.sort_order,
        }));

      const normalizedAmountOptions = Array.isArray(listing.amount_options)
        ? listing.amount_options.map((opt) => ({
            id: opt.id || crypto.randomUUID(),
            amount: String(opt.amount || ""),
            original_price: opt.original_price?.toString() || "",
            price: opt.price?.toString() || "",
            discount_percent: opt.discount_percent?.toString() || "",
            bonus: opt.bonus || "",
            is_popular: Boolean(opt.is_popular),
          }))
        : [];

      set({
        editorMode: mode === "duplicate" ? "duplicate" : "edit",
        editingListingId: listing.id,
        originalImageIds: existingImages.map((img) => img.databaseId),
        currentStep: 3,
        formData: {
          ...createEmptyForm(),
          game_id: listing.game_id || "",
          category_id: listing.category_id || "",
          title:
            mode === "duplicate"
              ? `${listing.title} (Copy)`
              : listing.title || "",
          description: listing.description || "",
          price: listing.price?.toString() || "",
          delivery_type: listing.delivery_type || "manual",
          delivery_time: listing.delivery_time?.toString() || "30",
          instant_delivery: Boolean(listing.instant_delivery),
          images: existingImages,

          rank: listing.rank || "",
          level: listing.level?.toString() || "",
          server: listing.server || "",
          hero_count: listing.hero_count?.toString() || "",
          skin_count: listing.skin_count?.toString() || "",

          amount_options: normalizedAmountOptions,
          delivery_method: listing.delivery_method || "login",
          region: listing.region || "",
          platform: listing.platform || "",

          service_type: listing.service_type || "rank_boost",
          current_rank: listing.rank || "",
          target_rank: listing.target_rank || "",

          item_name: listing.item_name || "",
          quantity: listing.quantity?.toString() || "1",
        },
        loadingListing: false,
      });

      return { success: true };
    } catch (err) {
      console.error("Load listing error:", err);
      set({ loadingListing: false });
      return { success: false, error: err.message };
    }
  },

  uploadNewImages: async (userId) => {
    const newImages = get().formData.images.filter((img) => img.file);
    const uploadedImages = [];

    for (const image of newImages) {
      const ext = (image.file.name.split(".").pop() || "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("account-images")
        .upload(filePath, image.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: image.file.type,
        });

      if (uploadError)
        throw new Error(`Image upload failed: ${uploadError.message}`);

      const {
        data: { publicUrl },
      } = supabase.storage.from("account-images").getPublicUrl(uploadData.path);

      uploadedImages.push({ url: publicUrl, storagePath: uploadData.path });
    }

    return uploadedImages;
  },

  createListing: async (user, uploadedImages) => {
    const { formData, editorMode, categories } = get();
    const category = categories.find((c) => c.id === formData.category_id);
    const payload = getListingPayload(formData, category?.type);

    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        ...payload,
        seller_id: user.id,
        status: "active",
        approval_status: "approved",
      })
      .select("id")
      .single();

    if (error) throw error;

    const existingUrls =
      editorMode === "duplicate"
        ? formData.images
            .filter((img) => img.isExisting && img.url)
            .map((img) => img.url)
        : [];

    const allUrls = [...existingUrls, ...uploadedImages.map((img) => img.url)];

    if (allUrls.length > 0) {
      const imageRecords = allUrls.map((url, index) => ({
        listing_id: listing.id,
        url,
        is_cover: index === 0,
        sort_order: index,
      }));
      await supabase.from("listing_images").insert(imageRecords);
    }

    return listing;
  },

  updateListing: async (user, uploadedImages) => {
    const { formData, editingListingId, originalImageIds, categories } = get();
    const category = categories.find((c) => c.id === formData.category_id);
    const payload = getListingPayload(formData, category?.type);

    const { data: listing, error } = await supabase
      .from("listings")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingListingId)
      .eq("seller_id", user.id)
      .select("id")
      .single();

    if (error) throw error;

    const retainedImages = formData.images.filter(
      (img) => img.isExisting && img.databaseId,
    );
    const retainedIds = retainedImages.map((img) => img.databaseId);
    const removedIds = originalImageIds.filter(
      (id) => !retainedIds.includes(id),
    );

    if (removedIds.length > 0) {
      await supabase
        .from("listing_images")
        .delete()
        .eq("listing_id", editingListingId)
        .in("id", removedIds);
    }

    for (let i = 0; i < retainedImages.length; i++) {
      await supabase
        .from("listing_images")
        .update({ is_cover: i === 0, sort_order: i })
        .eq("id", retainedImages[i].databaseId)
        .eq("listing_id", editingListingId);
    }

    if (uploadedImages.length > 0) {
      const startingIndex = retainedImages.length;
      const newImages = uploadedImages.map((img, idx) => ({
        listing_id: editingListingId,
        url: img.url,
        is_cover: startingIndex === 0 && idx === 0,
        sort_order: startingIndex + idx,
      }));
      await supabase.from("listing_images").insert(newImages);
    }

    return listing;
  },

  submitListing: async () => {
    const user = useAuthStore.getState().user;
    const { editorMode, formData } = get();

    if (!user) {
      toast.error("Please sign in again");
      return { success: false };
    }

    set({ loading: true });
    try {
      const uploadedImages = await get().uploadNewImages(user.id);
      const listing =
        editorMode === "edit"
          ? await get().updateListing(user, uploadedImages)
          : await get().createListing(user, uploadedImages);

      toast.success(
        editorMode === "edit"
          ? "Listing updated successfully"
          : editorMode === "duplicate"
            ? "Listing duplicated successfully"
            : "Listing created successfully",
      );

      set({ loading: false });
      return { success: true, id: listing.id };
    } catch (err) {
      console.error("Listing submission error:", err);
      toast.error(err.message || "Could not save listing");
      set({ loading: false });
      return { success: false, error: err.message };
    }
  },

  reset: () => {
    const images = get().formData.images;
    images.forEach((img) => {
      if (img.file && img.preview) URL.revokeObjectURL(img.preview);
    });

    set({
      currentStep: 1,
      loading: false,
      loadingListing: false,
      categories: [],
      editorMode: "create",
      editingListingId: null,
      originalImageIds: [],
      formData: createEmptyForm(),
    });
  },
}));

export default useCreateListingStore;
