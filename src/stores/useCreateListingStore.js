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
  delivery_type: "manual",
  delivery_time: "30",
  instant_delivery: false,
  images: [],
  rank: "",
  level: "",
  server: "",
  hero_count: "",
  skin_count: "",
  amount_options: [],
});

const getListingPayload = (formData) => ({
  game_id: formData.game_id,
  category_id: formData.category_id,
  title: formData.title.trim(),
  description: formData.description.trim(),
  price: Number.parseFloat(formData.price),
  delivery_type: formData.delivery_type || "manual",
  delivery_time: String(formData.delivery_time || "30"),
  instant_delivery:
    formData.delivery_type === "instant" || Boolean(formData.instant_delivery),
  rank: formData.rank?.trim() || null,
  level: formData.level ? Number.parseInt(formData.level, 10) : null,
  server: formData.server?.trim() || null,
  hero_count: formData.hero_count
    ? Number.parseInt(formData.hero_count, 10)
    : 0,
  skin_count: formData.skin_count
    ? Number.parseInt(formData.skin_count, 10)
    : 0,
});

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
    const { currentStep, formData } = get();

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

      const price = Number.parseFloat(formData.price);

      if (!Number.isFinite(price) || price <= 0) {
        toast.error("Enter a valid price greater than zero");
        return false;
      }

      const deliveryTime = Number.parseInt(formData.delivery_time, 10);

      if (!Number.isFinite(deliveryTime) || deliveryTime <= 0) {
        toast.error("Enter a valid delivery time");
        return false;
      }
    }

    return true;
  },

  prepareCreate: () => {
    const currentImages = get().formData.images;

    currentImages.forEach((image) => {
      if (image.file && image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });

    set({
      editorMode: "create",
      editingListingId: null,
      originalImageIds: [],
      currentStep: 1,
      categories: [],
      formData: createEmptyForm(),
      loading: false,
      loadingListing: false,
    });
  },

  loadListing: async (listingId, mode = "edit") => {
    const user = useAuthStore.getState().user;

    if (!user || !listingId) {
      return { success: false, error: "Missing listing information" };
    }

    set({ loadingListing: true });

    try {
      const { data: listing, error } = await supabase
        .from("listings")
        .select(
          `
            *,
            images:listing_images(
              id,
              url,
              is_cover,
              sort_order
            )
          `,
        )
        .eq("id", listingId)
        .eq("seller_id", user.id)
        .single();

      if (error || !listing) {
        throw new Error("Listing not found or you do not own it");
      }

      await get().fetchCategories(listing.game_id);

      const existingImages = [...(listing.images || [])]
        .sort((a, b) => {
          if (a.is_cover && !b.is_cover) return -1;
          if (!a.is_cover && b.is_cover) return 1;
          return (a.sort_order || 0) - (b.sort_order || 0);
        })
        .map((image) => ({
          id: image.id,
          databaseId: image.id,
          preview: image.url,
          url: image.url,
          isExisting: true,
          is_cover: image.is_cover,
          sort_order: image.sort_order,
        }));

      set({
        editorMode: mode === "duplicate" ? "duplicate" : "edit",
        editingListingId: listing.id,
        originalImageIds: existingImages.map((image) => image.databaseId),
        currentStep: 3,
        formData: {
          ...createEmptyForm(),
          game_id: listing.game_id || "",
          category_id: listing.category_id || "",
          title:
            mode === "duplicate"
              ? `${listing.title || "Listing"} (Copy)`
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
          amount_options: Array.isArray(listing.amount_options)
            ? listing.amount_options
            : [],
        },
        loadingListing: false,
      });

      return { success: true };
    } catch (error) {
      console.error("Load listing error:", error);
      toast.error(error.message || "Could not load listing");
      set({ loadingListing: false });
      return { success: false, error: error.message };
    }
  },

  uploadNewImages: async (userId) => {
    const newImages = get().formData.images.filter((image) => image.file);
    const uploadedImages = [];

    for (const image of newImages) {
      const rawExtension = image.file.name.split(".").pop() || "jpg";
      const extension = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "");
      const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("account-images")
        .upload(filePath, image.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: image.file.type,
        });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("account-images").getPublicUrl(uploadData.path);

      uploadedImages.push({
        url: publicUrl,
        storagePath: uploadData.path,
      });
    }

    return uploadedImages;
  },

  createListing: async (user, uploadedImages) => {
    const { formData, editorMode } = get();
    const payload = getListingPayload(formData);

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

    /*
     * In Duplicate mode existing URLs receive new listing_images rows.
     * The original listing image rows are never changed or deleted.
     */
    const existingUrls =
      editorMode === "duplicate"
        ? formData.images
            .filter((image) => image.isExisting && image.url)
            .map((image) => image.url)
        : [];

    const allUrls = [
      ...existingUrls,
      ...uploadedImages.map((image) => image.url),
    ];

    if (allUrls.length > 0) {
      const imageRecords = allUrls.map((url, index) => ({
        listing_id: listing.id,
        url,
        is_cover: index === 0,
        sort_order: index,
      }));

      const { error: imageError } = await supabase
        .from("listing_images")
        .insert(imageRecords);

      if (imageError) throw imageError;
    }

    return listing;
  },

  updateListing: async (user, uploadedImages) => {
    const { formData, editingListingId, originalImageIds } = get();

    if (!editingListingId) {
      throw new Error("No listing selected for editing");
    }

    const payload = getListingPayload(formData);

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

    const retainedExistingImages = formData.images.filter(
      (image) => image.isExisting && image.databaseId,
    );

    const retainedIds = retainedExistingImages.map((image) => image.databaseId);

    const removedIds = originalImageIds.filter(
      (imageId) => !retainedIds.includes(imageId),
    );

    if (removedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("listing_images")
        .delete()
        .eq("listing_id", editingListingId)
        .in("id", removedIds);

      if (deleteError) throw deleteError;
    }

    for (let index = 0; index < retainedExistingImages.length; index += 1) {
      const image = retainedExistingImages[index];

      const { error: updateImageError } = await supabase
        .from("listing_images")
        .update({
          is_cover: index === 0,
          sort_order: index,
        })
        .eq("id", image.databaseId)
        .eq("listing_id", editingListingId);

      if (updateImageError) throw updateImageError;
    }

    if (uploadedImages.length > 0) {
      const startingIndex = retainedExistingImages.length;

      const newImageRecords = uploadedImages.map((image, index) => ({
        listing_id: editingListingId,
        url: image.url,
        is_cover: startingIndex === 0 && index === 0,
        sort_order: startingIndex + index,
      }));

      const { error: insertImageError } = await supabase
        .from("listing_images")
        .insert(newImageRecords);

      if (insertImageError) throw insertImageError;
    }

    return listing;
  },

  submitListing: async () => {
    const user = useAuthStore.getState().user;
    const { editorMode } = get();

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

      if (editorMode === "edit") {
        toast.success("Listing updated successfully");
      } else if (editorMode === "duplicate") {
        toast.success("Listing duplicated successfully");
      } else {
        toast.success("Listing created successfully");
      }

      set({ loading: false });

      return {
        success: true,
        id: listing.id,
      };
    } catch (error) {
      console.error("Listing submission error:", error);
      toast.error(error.message || "Could not save listing");
      set({ loading: false });

      return {
        success: false,
        error: error.message,
      };
    }
  },

  reset: () => {
    const images = get().formData.images;

    images.forEach((image) => {
      if (image.file && image.preview) {
        URL.revokeObjectURL(image.preview);
      }
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
