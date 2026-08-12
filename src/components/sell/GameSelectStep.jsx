import { useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import useCreateListingStore from "../../stores/useCreateListingStore";

export default function GameSelectStep() {
  const { games, formData, updateField, nextStep, fetchCategories } =
    useCreateListingStore();
  const [search, setSearch] = useState("");

  const filtered = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (game) => {
    updateField("game_id", game.id);
    fetchCategories(game.id);
    nextStep();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Select Game</h2>
      <p className="text-text-muted text-sm">
        Choose the game for your listing
      </p>

      <div className="relative">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games..."
          className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-arcane-gold/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto">
        {filtered.map((game) => (
          <button
            key={game.id}
            onClick={() => handleSelect(game)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#1E1D24] border border-[#2A2932] hover:border-arcane-gold/50 hover:bg-arcane-gold/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#141319] flex items-center justify-center overflow-hidden">
              {game.icon ? (
                <img
                  src={game.icon}
                  alt=""
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-lg font-bold text-arcane-gold">
                  {game.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-xs text-white text-center leading-tight group-hover:text-arcane-gold transition-colors">
              {game.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
