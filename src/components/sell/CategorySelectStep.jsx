import useCreateListingStore from "../../stores/useCreateListingStore";

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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#1E1D24] border border-[#2A2932] hover:border-arcane-gold/50 hover:bg-arcane-gold/5 transition-all group"
          >
            <span className="text-3xl">{categoryIcons[cat.type] || "📦"}</span>
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
    </div>
  );
}
