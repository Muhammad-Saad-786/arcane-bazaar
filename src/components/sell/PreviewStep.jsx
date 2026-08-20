import useCreateListingStore from "../../stores/useCreateListingStore";
import GlassCard from "../ui/GlassCard";
import {
  HiOutlineLightningBolt,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineArrowNarrowRight,
  HiOutlineCube,
} from "react-icons/hi";

export default function PreviewStep() {
  const { formData, games, categories } = useCreateListingStore();
  const game = games.find((g) => g.id === formData.game_id);
  const category = categories.find((c) => c.id === formData.category_id);
  const categoryType = category?.type || "account";

  // Calculate price or price range for Topup/Currency
  const getPriceDisplay = () => {
    if (categoryType === "topup" || categoryType === "currency") {
      if (!formData.amount_options || formData.amount_options.length === 0) {
        return "$0.00";
      }
      const prices = formData.amount_options
        .map((opt) => Number.parseFloat(opt.price))
        .filter((p) => !Number.isNaN(p));
      if (prices.length === 0) return "$0.00";
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice === maxPrice
        ? `$${minPrice.toFixed(2)}`
        : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }
    return `$${Number.parseFloat(formData.price || 0).toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Preview Listing</h2>
        <p className="text-text-muted text-sm">
          This is how your listing will appear to prospective buyers on Arcane
          Bazaar
        </p>
      </div>

      <GlassCard className="p-6 border border-[#2A2932] bg-[#1E1D24]/70">
        {/* Header with Game icon & Category */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-xl bg-[#141319] border border-[#2A2932] flex items-center justify-center overflow-hidden shrink-0">
            {game?.icon ? (
              <img
                src={game.icon}
                alt={game?.name || "Game"}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-arcane-gold">
                {game?.name?.charAt(0) || "G"}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-arcane-gold/10 text-arcane-gold border border-arcane-gold/20 capitalize">
                {category?.name || categoryType}
              </span>
              {formData.delivery_type === "instant" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <HiOutlineLightningBolt className="w-3.5 h-3.5" /> Instant
                  Delivery
                </span>
              )}
            </div>
            <h3 className="text-white text-lg font-bold leading-snug">
              {formData.title || "Untitled Listing"}
            </h3>
            <p className="text-text-muted text-xs mt-0.5">{game?.name}</p>
          </div>
        </div>

        {/* Screenshots Preview */}
        {formData.images.length > 0 && (
          <div className="mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {formData.images.slice(0, 4).map((img, i) => (
                <div
                  key={img.id}
                  className="relative aspect-video rounded-xl overflow-hidden border border-[#2A2932]"
                >
                  <img
                    src={img.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-arcane-gold text-[#141319] text-[10px] font-bold rounded">
                      Cover
                    </span>
                  )}
                  {i === 3 && formData.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center text-white text-sm font-semibold">
                      +{formData.images.length - 4} More
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- CATEGORY-SPECIFIC DETAILS -------------------- */}

        {/* 1. Account Preview */}
        {categoryType === "account" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 p-3.5 bg-[#141319]/80 border border-[#2A2932] rounded-xl text-xs">
            <div>
              <span className="text-text-muted block text-[11px]">Rank</span>
              <span className="text-white font-medium">
                {formData.rank || "Unranked"}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Level</span>
              <span className="text-white font-medium">
                {formData.level || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Server</span>
              <span className="text-white font-medium">
                {formData.server || "Global"}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">
                Cosmetics
              </span>
              <span className="text-white font-medium">
                {formData.skin_count
                  ? `${formData.skin_count} Skins`
                  : "0 Skins"}{" "}
                •{" "}
                {formData.hero_count
                  ? `${formData.hero_count} Heroes`
                  : "0 Heroes"}
              </span>
            </div>
          </div>
        )}

        {/* 2. Topup / Currency Preview */}
        {(categoryType === "topup" || categoryType === "currency") && (
          <div className="mb-5 p-3.5 bg-[#141319]/80 border border-[#2A2932] rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted border-b border-[#2A2932] pb-2">
              <span>
                Delivery:{" "}
                <strong className="text-white capitalize">
                  {formData.delivery_method}
                </strong>
              </span>
              <span>
                Region:{" "}
                <strong className="text-white">
                  {formData.region || "Global"}
                </strong>
              </span>
              <span>
                Platform:{" "}
                <strong className="text-white">
                  {formData.platform || "All"}
                </strong>
              </span>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">
                Available Packages
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formData.amount_options.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className="flex items-center justify-between p-2.5 bg-[#1E1D24] border border-[#2A2932] rounded-lg text-xs"
                  >
                    <span className="text-white font-medium">{opt.amount}</span>
                    <span className="text-arcane-gold font-bold">
                      ${Number.parseFloat(opt.price || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Boosting Preview */}
        {categoryType === "boosting" && (
          <div className="mb-5 p-4 bg-[#141319]/80 border border-[#2A2932] rounded-xl">
            <div className="flex items-center justify-center gap-4 text-center">
              <div className="p-3 bg-[#1E1D24] border border-[#2A2932] rounded-lg flex-1">
                <span className="text-[11px] text-text-muted uppercase block">
                  Current Rank
                </span>
                <span className="text-sm font-bold text-white">
                  {formData.current_rank || "Any"}
                </span>
              </div>
              <HiOutlineArrowNarrowRight className="w-6 h-6 text-arcane-gold shrink-0" />
              <div className="p-3 bg-[#1E1D24] border border-[#2A2932] rounded-lg flex-1">
                <span className="text-[11px] text-text-muted uppercase block">
                  Target Goal
                </span>
                <span className="text-sm font-bold text-arcane-gold">
                  {formData.target_rank || "Target"}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-text-muted pt-2 border-t border-[#2A2932]">
              <span>
                Type:{" "}
                <strong className="text-white capitalize">
                  {(formData.service_type || "").replace("_", " ")}
                </strong>
              </span>
              <span>
                Server:{" "}
                <strong className="text-white">
                  {formData.server || "All"}
                </strong>
              </span>
              <span>
                Platform:{" "}
                <strong className="text-white">
                  {formData.platform || "PC"}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* 4. Items Preview */}
        {categoryType === "items" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 p-3.5 bg-[#141319]/80 border border-[#2A2932] rounded-xl text-xs">
            <div>
              <span className="text-text-muted block text-[11px]">Item</span>
              <span className="text-white font-medium">
                {formData.item_name || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Stock</span>
              <span className="text-white font-medium flex items-center gap-1">
                <HiOutlineCube className="w-3.5 h-3.5 text-arcane-gold" />{" "}
                {formData.quantity || 1} units
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Method</span>
              <span className="text-white font-medium capitalize">
                {(formData.delivery_method || "").replace("_", " ")}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">
                Server/Platform
              </span>
              <span className="text-white font-medium">
                {formData.server || formData.platform || "Global"}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Description
          </h4>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap bg-[#141319]/50 p-3.5 rounded-xl border border-[#2A2932]">
            {formData.description || "No description provided."}
          </p>
        </div>

        {/* Footer: Pricing & Delivery Time */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2A2932]">
          <div>
            <span className="text-text-muted text-xs block">
              {categoryType === "items" ? "Price Per Unit" : "Price"}
            </span>
            <p className="text-2xl font-bold text-arcane-gold">
              {getPriceDisplay()}
            </p>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <span className="text-text-muted text-xs flex items-center justify-end gap-1">
                <HiOutlineClock className="w-3.5 h-3.5" /> Guarantee
              </span>
              <p className="text-white text-sm font-semibold capitalize">
                {formData.delivery_type} ({formData.delivery_time} min)
              </p>
            </div>
          </div>
        </div>

        {/* Buyer Protection Footer Banner */}
        <div className="mt-4 pt-3 border-t border-[#2A2932]/50 flex items-center gap-2 text-xs text-text-muted">
          <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Covered by Arcane Bazaar Buyer Protection &amp; Escrow Guarantee
          </span>
        </div>
      </GlassCard>
    </div>
  );
}
