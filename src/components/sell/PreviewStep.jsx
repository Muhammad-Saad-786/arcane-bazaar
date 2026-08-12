import useCreateListingStore from "../../stores/useCreateListingStore";
import GlassCard from "../ui/GlassCard";

export default function PreviewStep() {
  const { formData, games, categories } = useCreateListingStore();
  const game = games.find((g) => g.id === formData.game_id);
  const category = categories.find((c) => c.id === formData.category_id);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Preview Listing</h2>
      <p className="text-text-muted text-sm">
        This is how your listing will appear to buyers
      </p>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#1E1D24] flex items-center justify-center overflow-hidden">
            {game?.icon ? (
              <img src={game.icon} alt="" className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-lg font-bold text-arcane-gold">
                {game?.name?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="text-white font-semibold">
              {formData.title || "Untitled Listing"}
            </p>
            <p className="text-text-muted text-xs">
              {game?.name} • {category?.name}
            </p>
          </div>
        </div>

        {/* Images Preview */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {formData.images.slice(0, 4).map((img) => (
              <div
                key={img.id}
                className="aspect-video rounded-xl overflow-hidden"
              >
                <img
                  src={img.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 mb-4">
          <p className="text-text-secondary text-sm">
            {formData.description || "No description"}
          </p>
          {formData.rank && (
            <p className="text-text-muted text-xs">Rank: {formData.rank}</p>
          )}
          {formData.level && (
            <p className="text-text-muted text-xs">Level: {formData.level}</p>
          )}
          {formData.server && (
            <p className="text-text-muted text-xs">Server: {formData.server}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#2A2932]">
          <div>
            <span className="text-text-muted text-xs">Price</span>
            <p className="text-2xl font-bold text-arcane-gold">
              ${formData.price || "0.00"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-text-muted text-xs">Delivery</span>
            <p className="text-white text-sm capitalize">
              {formData.delivery_type} • {formData.delivery_time} min
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
