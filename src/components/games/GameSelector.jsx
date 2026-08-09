import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

export default function GameSelector({ selected, onSelect, showAll = true }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    setGames(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-20 h-20 rounded-2xl bg-arcane-surface animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
      {showAll && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect?.("all")}
          className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
            selected === "all" || !selected
              ? "bg-arcane-purple/20 border border-arcane-purple/30"
              : "bg-arcane-surface border border-arcane-border hover:border-arcane-purple/20"
          }`}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-arcane-purple/30 to-arcane-gold/20 flex items-center justify-center">
            <span className="text-lg">🎮</span>
          </div>
          <span className="text-xs text-text-secondary whitespace-nowrap">
            All Games
          </span>
        </motion.button>
      )}

      {games.map((game) => (
        <motion.button
          key={game.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect?.(game.slug)}
          className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
            selected === game.slug
              ? "bg-arcane-purple/20 border border-arcane-purple/30"
              : "bg-arcane-surface border border-arcane-border hover:border-arcane-purple/20"
          }`}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-arcane-elevated flex items-center justify-center overflow-hidden">
            {game.icon ? (
              <img
                src={game.icon}
                alt={game.name}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-arcane-purple">
                {game.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-xs text-text-secondary whitespace-nowrap max-w-[80px] truncate">
            {game.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
