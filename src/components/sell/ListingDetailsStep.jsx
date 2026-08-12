import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { HiOutlineUpload, HiOutlineX } from "react-icons/hi";
import useCreateListingStore from "../../stores/useCreateListingStore";

export default function ListingDetailsStep() {
  const { formData, updateField, addImages, removeImage, games, categories } =
    useCreateListingStore();
  const game = games.find((g) => g.id === formData.game_id);
  const category = categories.find((c) => c.id === formData.category_id);

  const onDrop = useCallback((files) => addImages(files), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 10,
    maxSize: 5242880,
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Listing Details</h2>
        <p className="text-text-muted text-sm">
          {game?.name} • {category?.name}
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder={`e.g., ${game?.name} Account - Level 100+`}
          className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Price (USD) *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            $
          </span>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-arcane-gold/50 transition-all"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={4}
          placeholder="Describe your listing in detail..."
          className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all resize-none"
        />
      </div>

      {/* Game-specific fields for Accounts */}
      {category?.type === "account" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Rank
            </label>
            <input
              type="text"
              value={formData.rank}
              onChange={(e) => updateField("rank", e.target.value)}
              placeholder="e.g., Mythic"
              className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Level
            </label>
            <input
              type="number"
              value={formData.level}
              onChange={(e) => updateField("level", e.target.value)}
              placeholder="e.g., 100"
              className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Server
            </label>
            <input
              type="text"
              value={formData.server}
              onChange={(e) => updateField("server", e.target.value)}
              placeholder="e.g., SEA"
              className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all"
            />
          </div>
        </div>
      )}

      {/* Delivery */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Delivery Type
          </label>
          <select
            value={formData.delivery_type}
            onChange={(e) => updateField("delivery_type", e.target.value)}
            className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none"
          >
            <option value="manual">Manual</option>
            <option value="instant">Instant</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Delivery Time (min)
          </label>
          <input
            type="number"
            value={formData.delivery_time}
            onChange={(e) => updateField("delivery_time", e.target.value)}
            className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all"
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Screenshots ({formData.images.length}/10)
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${isDragActive ? "border-arcane-gold bg-arcane-gold/5" : "border-[#2A2932] hover:border-arcane-gold/30"}`}
        >
          <input {...getInputProps()} />
          <HiOutlineUpload className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">
            Drag & drop or click to upload
          </p>
        </div>
        {formData.images.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {formData.images.map((img, i) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={img.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <HiOutlineX className="w-3 h-3 text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-arcane-gold text-[#141319] text-xs rounded-md font-medium">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
