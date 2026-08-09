import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineArrowRight } from "react-icons/hi";
import useGamesStore from "../../stores/useGamesStore";

const gameGradients = {
  "mobile-legends": "from-blue-500/20 to-purple-500/20",
  fortnite: "from-blue-400/20 to-cyan-400/20",
  "gta-5": "from-green-500/20 to-emerald-500/20",
  valorant: "from-red-500/20 to-orange-500/20",
  roblox: "from-red-400/20 to-pink-400/20",
  "league-of-legends": "from-amber-500/20 to-yellow-500/20",
  minecraft: "from-green-600/20 to-lime-500/20",
  "call-of-duty": "from-orange-500/20 to-red-500/20",
  default: "from-arcane-purple/20 to-arcane-purple-hover/20",
};

export default function FeaturedGames() {
  const { games } = useGamesStore();

  return (
    <section className="section-container py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Popular Games
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Choose your game and start trading
          </p>
        </div>
        <Link
          to="/marketplace"
          className="text-sm text-arcane-purple hover:text-arcane-purple-hover flex items-center gap-1"
        >
          View All <HiOutlineArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {games.slice(0, 10).map((game, i) => {
          const gradient = gameGradients[game.slug] || gameGradients.default;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/marketplace?game=${game.slug}`}>
                <div className="glass-card-hover p-4 sm:p-6 flex flex-col items-center text-center gap-3 group">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
                  >
                    {game.icon ? (
                      <img
                        src={game.icon}
                        alt={game.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-bold text-arcane-purple">
                        {game.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-arcane-purple transition-colors">
                      {game.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Accounts • Items
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
