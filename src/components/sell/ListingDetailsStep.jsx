import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  HiOutlineUpload,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSparkles,
  HiOutlineTag,
  HiOutlineFire,
  HiOutlineGift,
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
      suggested = `${gameName} Instant Top-up & Currency | Fast Recharge ${
        formData.region ? `[${formData.region}]` : ""
      }`;
    } else if (categoryType === "boosting") {
      suggested = `${gameName} ${
        formData.service_type === "placement"
          ? "Placement Matches Boost"
          : formData.service_type === "win_boost"
            ? "Net Wins Boost"
            : `${formData.current_rank || "Rank"} to ${formData.target_rank || "Target Rank"} Boost`
      }`;
    } else if (categoryType === "items") {
      suggested = `${formData.item_name || "Rare Item"} x${formData.quantity || 1} - ${gameName}`;
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
          <HiOutlineSparkles className="w-4 h-4" /> Auto-Suggest Title
        </button>
      </div>

      {/* Listing Title */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Listing Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder={`e.g., [${game?.name || "Game"}] Safe & Fast Delivery`}
          className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all placeholder:text-gray-500 text-sm"
        />
      </div>

      {/* ================= 1. ACCOUNT CATEGORY FIELDS ================= */}
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

      {/* ================= 2. MULTI-PACKAGE TOPUP / CURRENCY BUILDER ================= */}
      {(categoryType === "topup" || categoryType === "currency") && (
        <div className="space-y-4 p-4 bg-[#141319]/60 border border-[#2A2932] rounded-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#2A2932]">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                <HiOutlineTag className="w-4 h-4 text-arcane-gold" />{" "}
                Denomination Packages & Discounts
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Add top-up package tiers with regular prices, selling prices,
                discounts, and bonus labels.
              </p>
            </div>
            <button
              type="button"
              onClick={addAmountOption}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-arcane-gold text-[#141319] text-xs font-bold rounded-xl hover:bg-arcane-gold/90 transition-all shadow-md"
            >
              <HiOutlinePlus className="w-4 h-4" /> Add Package
            </button>
          </div>

          {formData.amount_options.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-[#2A2932] rounded-2xl text-text-muted text-xs">
              <p className="font-semibold text-white mb-1">
                No Packages Configured
              </p>
              <p>
                Click &quot;Add Package&quot; to define denominations (e.g., 56
                Diamonds, 256 Diamonds, etc.).
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.amount_options.map((opt, index) => {
                const hasDiscount = Boolean(
                  opt.discount_percent && Number(opt.discount_percent) > 0,
                );
                return (
                  <div
                    key={opt.id}
                    className="p-4 bg-[#1E1D24] border border-[#2A2932] hover:border-arcane-gold/30 rounded-2xl transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#141319] text-arcane-gold text-xs font-bold flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          Package Configuration
                        </span>
                        {hasDiscount && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold">
                            {opt.discount_percent}% OFF
                          </span>
                        )}
                        {opt.is_popular && (
                          <span className="px-2 py-0.5 rounded-full bg-arcane-gold/15 border border-arcane-gold/30 text-arcane-gold text-[10px] font-bold flex items-center gap-1">
                            <HiOutlineFire className="w-3 h-3" /> Best Value
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAmountOption(opt.id)}
                        className="p-1.5 text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Package Name */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-text-muted mb-1">
                          Package Name / Amount{" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={opt.amount}
                          onChange={(e) =>
                            updateAmountOption(opt.id, "amount", e.target.value)
                          }
                          placeholder="e.g., 256 Diamonds / 10,000 V-Bucks"
                          className="w-full bg-[#141319] border border-[#2A2932] rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-arcane-gold/50"
                        />
                      </div>

                      {/* Original / List Price */}
                      <div>
                        <label className="block text-[11px] text-text-muted mb-1">
                          Original Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={opt.original_price || ""}
                          onChange={(e) =>
                            updateAmountOption(
                              opt.id,
                              "original_price",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 5.50"
                          className="w-full bg-[#141319] border border-[#2A2932] rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-arcane-gold/50"
                        />
                      </div>

                      {/* Selling / Discounted Price */}
                      <div>
                        <label className="block text-[11px] text-text-muted mb-1">
                          Selling Price ($){" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={opt.price}
                          onChange={(e) =>
                            updateAmountOption(opt.id, "price", e.target.value)
                          }
                          placeholder="e.g., 4.39"
                          className="w-full bg-[#141319] border border-[#2A2932] rounded-xl py-2 px-3 text-white text-xs font-semibold text-arcane-gold outline-none focus:border-arcane-gold/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Bonus Text */}
                      <div>
                        <label className="block text-[11px] text-text-muted mb-1 flex items-center gap-1">
                          <HiOutlineGift className="w-3.5 h-3.5 text-arcane-gold" />{" "}
                          Bonus Tag (Optional)
                        </label>
                        <input
                          type="text"
                          value={opt.bonus || ""}
                          onChange={(e) =>
                            updateAmountOption(opt.id, "bonus", e.target.value)
                          }
                          placeholder="e.g., +25 Bonus / Extra Code"
                          className="w-full bg-[#141319] border border-[#2A2932] rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-arcane-gold/50"
                        />
                      </div>

                      {/* Custom Discount % */}
                      <div>
                        <label className="block text-[11px] text-text-muted mb-1">
                          Discount % (Auto-computed)
                        </label>
                        <input
                          type="number"
                          value={opt.discount_percent || ""}
                          onChange={(e) =>
                            updateAmountOption(
                              opt.id,
                              "discount_percent",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 20"
                          className="w-full bg-[#141319] border border-[#2A2932] rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-arcane-gold/50"
                        />
                      </div>

                      {/* Highlight Badge Toggle */}
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(opt.is_popular)}
                            onChange={(e) =>
                              updateAmountOption(
                                opt.id,
                                "is_popular",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4 rounded accent-arcane-gold bg-[#141319] border-[#2A2932]"
                          />
                          <span>Mark as Most Popular</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery & Platform settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#2A2932]/70">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Delivery Method
              </label>
              <select
                value={formData.delivery_method}
                onChange={(e) => updateField("delivery_method", e.target.value)}
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3 text-white text-xs outline-none"
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
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-xs outline-none focus:border-arcane-gold/50 transition-all"
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
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-xs outline-none focus:border-arcane-gold/50 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. BOOSTING CATEGORY FIELDS ================= */}
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

      {/* ================= 4. ITEMS CATEGORY FIELDS ================= */}
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

      {/* ================= FIXED PRICE (ACCOUNTS / BOOSTING / ITEMS) ================= */}
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
          className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all resize-none text-sm"
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
            className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none text-sm"
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
            className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-gold/50 transition-all text-sm"
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
