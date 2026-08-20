import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  HiOutlineUpload,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSparkles,
} from "react-icons/hi";
import useCreateListingStore from "../../stores/useCreateListingStore";

export default function ListingDetailsStep() {
  const {
    formData,
    updateField,
    addImages,
    removeImage,
    addAmountOption,
    updateAmountOption,
    removeAmountOption,
    games,
    categories,
  } = useCreateListingStore();

  const game = games.find((g) => g.id === formData.game_id);
  const category = categories.find((c) => c.id === formData.category_id);
  const categoryType = category?.type || "account";

  const onDrop = useCallback((files) => addImages(files), [addImages]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 10,
    maxSize: 5242880,
  });

  // Auto-suggest title format helper
  const handleAutoSuggestTitle = () => {
    const gameName = game?.name || "Game";
    let suggested = "";

    if (categoryType === "account") {
      const parts = [gameName];
      if (formData.rank) parts.push(formData.rank);
      if (formData.level) parts.push(`Lv.${formData.level}`);
      if (formData.skin_count) parts.push(`${formData.skin_count} Skins`);
      if (formData.server) parts.push(`[${formData.server}]`);
      suggested =
        parts.length > 1 ? parts.join(" | ") : `${gameName} Premium Account`;
    } else if (categoryType === "topup" || categoryType === "currency") {
      suggested = `${gameName} Instant Top-up | Fast & Safe Delivery ${
        formData.region ? `[${formData.region}]` : ""
      }`;
    } else if (categoryType === "boosting") {
      suggested = `${gameName} ${
        formData.service_type === "placement"
          ? "Placement Matches Boost"
          : formData.service_type === "win_boost"
            ? "Net Wins Boost"
            : `${formData.current_rank || "Rank"} to ${formData.target_rank || "Desired Rank"} Boost`
      }`;
    } else if (categoryType === "items") {
      suggested = `${formData.item_name || "Rare Item"} x${
        formData.quantity || 1
      } - ${gameName}`;
    }

    if (suggested) {
      updateField("title", suggested.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2A2932]">
        <div>
          <h2 className="text-xl font-bold text-white">Listing Details</h2>
          <p className="text-text-muted text-sm mt-0.5">
            {game?.name} •{" "}
            <span className="text-arcane-gold capitalize">
              {category?.name || categoryType}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleAutoSuggestTitle}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E1D24] border border-[#2A2932] hover:border-arcane-gold/50 text-xs font-medium text-arcane-gold rounded-lg transition-all"
        >
          <HiOutlineSparkles className="w-4 h-4" />
          Auto-Suggest Title
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Listing Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder={`e.g., [${game?.name || "Game"}] Safe & Fast Delivery`}
          className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all placeholder:text-gray-500"
        />
      </div>

      {/* -------------------- 1. ACCOUNT CATEGORY FIELDS -------------------- */}
      {categoryType === "account" && (
        <div className="space-y-4 p-4 bg-[#141319]/60 border border-[#2A2932] rounded-2xl">
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
            Account Specifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Rank
              </label>
              <input
                type="text"
                value={formData.rank}
                onChange={(e) => updateField("rank", e.target.value)}
                placeholder="e.g., Radiant / Mythic"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Level
              </label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => updateField("level", e.target.value)}
                placeholder="e.g., 150"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Server / Region
              </label>
              <input
                type="text"
                value={formData.server}
                onChange={(e) => updateField("server", e.target.value)}
                placeholder="e.g., NA / EU / Global"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Heroes / Champions Count
              </label>
              <input
                type="number"
                value={formData.hero_count}
                onChange={(e) => updateField("hero_count", e.target.value)}
                placeholder="e.g., 45"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Skins / Cosmetics Count
              </label>
              <input
                type="number"
                value={formData.skin_count}
                onChange={(e) => updateField("skin_count", e.target.value)}
                placeholder="e.g., 120"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 2. TOPUP / CURRENCY CATEGORY FIELDS -------------------- */}
      {(categoryType === "topup" || categoryType === "currency") && (
        <div className="space-y-4 p-4 bg-[#141319]/60 border border-[#2A2932] rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                Amount Tiers & Pricing
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Add the denomination packages buyers can choose from.
              </p>
            </div>
            <button
              type="button"
              onClick={addAmountOption}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-arcane-gold text-[#141319] text-xs font-semibold rounded-lg hover:bg-arcane-gold/90 transition-all"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Add Option
            </button>
          </div>

          {formData.amount_options.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-[#2A2932] rounded-xl text-text-muted text-xs">
              No packages added yet. Click &quot;Add Option&quot; to set amount
              options and pricing.
            </div>
          ) : (
            <div className="space-y-3">
              {formData.amount_options.map((opt, index) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-3 p-3 bg-[#1E1D24] border border-[#2A2932] rounded-xl"
                >
                  <span className="text-xs font-medium text-text-muted w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={opt.amount}
                      onChange={(e) =>
                        updateAmountOption(opt.id, "amount", e.target.value)
                      }
                      placeholder="e.g., 1,000 Diamonds / 500k Gold"
                      className="w-full bg-[#141319] border border-[#2A2932] rounded-lg py-2 px-3 text-white text-xs outline-none focus:border-arcane-gold/50"
                    />
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={opt.price}
                      onChange={(e) =>
                        updateAmountOption(opt.id, "price", e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full bg-[#141319] border border-[#2A2932] rounded-lg py-2 pl-7 pr-3 text-white text-xs outline-none focus:border-arcane-gold/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAmountOption(opt.id)}
                    className="p-2 text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Delivery Method
              </label>
              <select
                value={formData.delivery_method}
                onChange={(e) => updateField("delivery_method", e.target.value)}
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3 text-white text-sm outline-none"
              >
                <option value="login">Account Login</option>
                <option value="gifting">In-Game Gifting</option>
                <option value="redeem_code">Redeem Code</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => updateField("region", e.target.value)}
                placeholder="e.g., Global / US / Asia"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Platform
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => updateField("platform", e.target.value)}
                placeholder="e.g., Android / iOS / PC"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 3. BOOSTING CATEGORY FIELDS -------------------- */}
      {categoryType === "boosting" && (
        <div className="space-y-4 p-4 bg-[#141319]/60 border border-[#2A2932] rounded-2xl">
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
            Boosting Service Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Service Type
              </label>
              <select
                value={formData.service_type}
                onChange={(e) => updateField("service_type", e.target.value)}
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3 text-white text-sm outline-none"
              >
                <option value="rank_boost">Rank Boost</option>
                <option value="win_boost">Win Boost</option>
                <option value="placement">Placement Matches</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Current Rank
              </label>
              <input
                type="text"
                value={formData.current_rank}
                onChange={(e) => updateField("current_rank", e.target.value)}
                placeholder="e.g., Silver II"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Target Rank / Goal
              </label>
              <input
                type="text"
                value={formData.target_rank}
                onChange={(e) => updateField("target_rank", e.target.value)}
                placeholder="e.g., Diamond I"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Server / Region
              </label>
              <input
                type="text"
                value={formData.server}
                onChange={(e) => updateField("server", e.target.value)}
                placeholder="e.g., North America"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Platform
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => updateField("platform", e.target.value)}
                placeholder="e.g., PC / PlayStation / Xbox"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 4. ITEMS CATEGORY FIELDS -------------------- */}
      {categoryType === "items" && (
        <div className="space-y-4 p-4 bg-[#141319]/60 border border-[#2A2932] rounded-2xl">
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
            Item Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Item Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.item_name}
                onChange={(e) => updateField("item_name", e.target.value)}
                placeholder="e.g., Dragonclaw Hook / Rare Rune"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Stock Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
                placeholder="1"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Delivery Method
              </label>
              <select
                value={formData.delivery_method}
                onChange={(e) => updateField("delivery_method", e.target.value)}
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3 text-white text-sm outline-none"
              >
                <option value="direct_trade">Direct In-Game Trade</option>
                <option value="in_game_mail">In-Game Mail</option>
                <option value="gift">Gift</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Server
              </label>
              <input
                type="text"
                value={formData.server}
                onChange={(e) => updateField("server", e.target.value)}
                placeholder="e.g., Server #102"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Platform
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => updateField("platform", e.target.value)}
                placeholder="e.g., PC / Console"
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PRICE FIELD (Hidden if Topup dynamic tiers are used) -------------------- */}
      {categoryType !== "topup" && categoryType !== "currency" && (
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            {categoryType === "items"
              ? "Price Per Item (USD) *"
              : "Price (USD) *"}
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
      )}

      {/* Description */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={4}
          placeholder="Describe delivery rules, guarantee terms, and listing highlights in detail..."
          className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all resize-none"
        />
      </div>

      {/* Delivery Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Delivery Type
          </label>
          <select
            value={formData.delivery_type}
            onChange={(e) => updateField("delivery_type", e.target.value)}
            className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none"
          >
            <option value="manual">Manual Delivery</option>
            <option value="instant">Instant Delivery (Automated)</option>
            <option value="auto">Auto Dispatch</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Estimated Delivery Time (minutes){" "}
            <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={formData.delivery_time}
            onChange={(e) => updateField("delivery_time", e.target.value)}
            className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all"
          />
        </div>
      </div>

      {/* Screenshots Upload */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-text-secondary">
            Screenshots ({formData.images.length}/10)
          </label>
          <span className="text-xs text-text-muted">
            {categoryType === "account" ? (
              <span className="text-arcane-gold font-medium">
                Minimum 5 screenshots required
              </span>
            ) : (
              "At least 1 screenshot required"
            )}
          </span>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-arcane-gold bg-arcane-gold/5"
              : "border-[#2A2932] hover:border-arcane-gold/30"
          }`}
        >
          <input {...getInputProps()} />
          <HiOutlineUpload className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-sm">
            Drag &amp; drop or click to upload
          </p>
          <p className="text-xs text-text-muted/60 mt-1">
            PNG, JPG, JPEG, WEBP up to 5MB
          </p>
        </div>

        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
            {formData.images.map((img, i) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden border border-[#2A2932]"
              >
                <img
                  src={img.preview}
                  alt="Listing screenshot"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <HiOutlineX className="w-3.5 h-3.5 text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-arcane-gold text-[#141319] text-[10px] rounded-md font-bold uppercase tracking-wider shadow-md">
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
