import useCreateListingStore from "../../stores/useCreateListingStore";
import { HiOutlineExclamation } from "react-icons/hi";

const categoryIcons = {
  account: "👤",
  topup: "💎",
  boosting: "📈",
  currency: "💰",
  items: "🎁",
  coaching: "🎓",
  service: "⚙️",
};

export default function CategorySelectStep() {
  const { categories, formData, updateField, nextStep } =
    useCreateListingStore();

  const handleSelect = (cat) => {
    updateField("category_id", cat.id);
    nextStep();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Select Category</h2>
      <p className="text-text-muted text-sm">What type of listing is this?</p>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-[#1E1D24] rounded-2xl border border-[#2A2932]">
          <HiOutlineExclamation className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-white font-medium">
            No categories available for this game
          </p>
          <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">
            This game doesn't have any listing categories yet. Please select a
            different game or contact support.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#1E1D24] border border-[#2A2932] hover:border-arcane-gold/50 hover:bg-arcane-gold/5 transition-all group"
            >
              <span className="text-3xl">
                {categoryIcons[cat.type] || "📦"}
              </span>
              <div className="text-center">
                <p className="text-white font-medium group-hover:text-arcane-gold transition-colors">
                  {cat.name}
                </p>
                <p className="text-text-muted text-xs capitalize mt-1">
                  {cat.type}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
