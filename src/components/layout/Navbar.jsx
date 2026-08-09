import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineHeart,
  HiOutlineMail,
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import useWishlistStore from "../../stores/useWishlistStore";
import { supabase } from "../../lib/supabase";
import Logo from "../shared/Logo";
import SmartSearch from "../search/SmartSearch";
import UserMenu from "../ui/UserMenu";
import CurrencySelector from "../ui/CurrencySelector";
import LanguageSelector from "../ui/LanguageSelector";
import Button from "../ui/Button";

const mainCategories = [
  { label: "Games", key: "games", type: "games" },
  { label: "Accounts", key: "account", type: "category" },
  { label: "Topups", key: "topup", type: "category" },
  { label: "Boosting", key: "boosting", type: "category" },
  { label: "Currency", key: "currency", type: "category" },
  { label: "Items", key: "items", type: "category" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [megaMenuData, setMegaMenuData] = useState({
    games: [],
    categories: [],
    listings: [],
  });
  const [megaSearch, setMegaSearch] = useState("");
  const { user } = useAuthStore();
  const { count: wishlistCount } = useWishlistStore();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMegaMenuData = async (categoryKey) => {
    // Always fetch games
    const { data: games } = await supabase
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (categoryKey === "games") {
      // Games tab: show all games
      setMegaMenuData({ games: games || [], categories: [], listings: [] });
    } else {
      // Other tabs: show listings for that category type
      const { data: categories } = await supabase
        .from("listing_categories")
        .select("*, game:games(name, slug, icon)")
        .eq("type", categoryKey)
        .limit(8);

      const { data: listings } = await supabase
        .from("listings")
        .select(
          `*, game:games(name, slug, icon), images:listing_images(url, is_cover)`,
        )
        .eq("status", "active")
        .eq("approval_status", "approved")
        .eq("category.type", categoryKey)
        .order("views", { ascending: false })
        .limit(6);

      setMegaMenuData({
        games: games || [],
        categories: categories || [],
        listings: listings || [],
      });
    }
  };

  const handleCategoryClick = (key) => {
    if (activeDropdown === key) {
      setActiveDropdown(null);
    } else {
      fetchMegaMenuData(key);
      setActiveDropdown(key);
    }
  };

  const filteredGames = megaMenuData.games.filter((g) =>
    g.name.toLowerCase().includes(megaSearch.toLowerCase()),
  );

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-arcane-dark/95 backdrop-blur-xl border-b border-arcane-border shadow-lg"
            : "bg-arcane-dark/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row */}
          <div className="flex items-center justify-between h-16 gap-4">
            <Logo size="sm" />
            <div className="hidden lg:flex flex-1 max-w-xl mx-4">
              <SmartSearch />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <CurrencySelector />
              {user ? (
                <>
                  <Link
                    to="/dashboard/wishlist"
                    className="relative p-2 text-text-secondary hover:text-white transition-colors"
                  >
                    <HiOutlineHeart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-arcane-purple text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/dashboard/messages"
                    className="relative p-2 text-text-secondary hover:text-white transition-colors hidden sm:block"
                  >
                    <HiOutlineMail className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/dashboard/notifications"
                    className="relative p-2 text-text-secondary hover:text-white transition-colors hidden sm:block"
                  >
                    <HiOutlineBell className="w-5 h-5" />
                  </Link>
                  <Link to="/sell" className="hidden sm:block">
                    <Button variant="gold" size="sm">
                      Sell
                    </Button>
                  </Link>
                  <UserMenu />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" className="hidden sm:block">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 text-text-secondary hover:text-white"
              >
                {isMobileOpen ? (
                  <HiOutlineX className="w-6 h-6" />
                ) : (
                  <HiOutlineMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div
            className="hidden lg:flex items-center gap-1 pb-2"
            ref={dropdownRef}
          >
            {mainCategories.map((cat) => (
              <div key={cat.key} className="relative">
                <button
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeDropdown === cat.key
                      ? "text-white bg-arcane-surface"
                      : "text-text-secondary hover:text-white hover:bg-arcane-surface/50"
                  }`}
                >
                  {cat.label}
                  <HiOutlineChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === cat.key ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {activeDropdown === cat.key && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-[560px] bg-arcane-elevated border border-arcane-border rounded-2xl shadow-2xl z-40 overflow-hidden"
                    >
                      {cat.type === "games" ? (
                        /* GAMES DROPDOWN */
                        <div className="grid grid-cols-3 gap-0">
                          <div className="p-4 border-r border-arcane-border">
                            <p className="text-xs text-text-muted uppercase tracking-wider mb-3 px-2">
                              Popular Games
                            </p>
                            <div className="space-y-0.5">
                              {megaMenuData.games.slice(0, 6).map((game) => (
                                <Link
                                  key={game.id}
                                  to={`/marketplace?game=${game.slug}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-arcane-surface transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-arcane-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {game.icon ? (
                                      <img
                                        src={game.icon}
                                        alt=""
                                        className="w-5 h-5 object-contain"
                                      />
                                    ) : (
                                      <span className="text-xs font-bold text-arcane-purple">
                                        {game.name.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <span className="truncate group-hover:text-arcane-gold-light transition-colors">
                                    {game.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                            <Link
                              to="/games"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-1 mt-2 px-3 py-1.5 text-xs text-arcane-purple hover:text-arcane-gold-light transition-colors"
                            >
                              All Games{" "}
                              <HiOutlineChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                          <div className="col-span-2 p-4">
                            <p className="text-xs text-text-muted uppercase tracking-wider mb-3 px-2">
                              All Games
                            </p>
                            <div className="relative mb-3 px-2">
                              <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                              <input
                                type="text"
                                value={megaSearch}
                                onChange={(e) => setMegaSearch(e.target.value)}
                                placeholder="Search for game"
                                className="w-full bg-arcane-surface border border-arcane-border rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 transition-all"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-0.5 max-h-56 overflow-y-auto px-2">
                              {filteredGames.map((game) => (
                                <Link
                                  key={game.id}
                                  to={`/marketplace?game=${game.slug}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-arcane-surface transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-arcane-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {game.icon ? (
                                      <img
                                        src={game.icon}
                                        alt=""
                                        className="w-5 h-5 object-contain"
                                      />
                                    ) : (
                                      <span className="text-xs font-bold text-arcane-purple">
                                        {game.name.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <span className="truncate group-hover:text-arcane-gold-light transition-colors">
                                    {game.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* CATEGORY DROPDOWN (Accounts, Topups, Boosting, Currency, Items) */
                        <div className="grid grid-cols-5 gap-0">
                          <div className="col-span-2 p-4 border-r border-arcane-border">
                            <p className="text-xs text-text-muted uppercase tracking-wider mb-3 px-2">
                              Popular in {cat.label}
                            </p>
                            <div className="space-y-0.5">
                              {megaMenuData.categories
                                .slice(0, 6)
                                .map((category) => (
                                  <Link
                                    key={category.id}
                                    to={`/marketplace?game=${category.game?.slug}&category=${category.slug}`}
                                    onClick={() => setActiveDropdown(null)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-arcane-surface transition-all group"
                                  >
                                    <div className="w-7 h-7 rounded-lg bg-arcane-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                                      {category.game?.icon ? (
                                        <img
                                          src={category.game.icon}
                                          alt=""
                                          className="w-5 h-5 object-contain"
                                        />
                                      ) : (
                                        <span className="text-xs font-bold text-arcane-purple">
                                          {category.name.charAt(0)}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <span className="truncate group-hover:text-arcane-gold-light transition-colors">
                                        {category.name}
                                      </span>
                                      <p className="text-xs text-text-muted">
                                        {category.game?.name}
                                      </p>
                                    </div>
                                  </Link>
                                ))}
                            </div>
                            <Link
                              to={`/marketplace?category=${cat.key}`}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-1 mt-2 px-3 py-1.5 text-xs text-arcane-purple hover:text-arcane-gold-light transition-colors"
                            >
                              All {cat.label}{" "}
                              <HiOutlineChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                          <div className="col-span-3 p-4">
                            <p className="text-xs text-text-muted uppercase tracking-wider mb-3 px-2">
                              Trending {cat.label}
                            </p>
                            <div className="space-y-2 px-2">
                              {megaMenuData.listings.map((listing) => (
                                <Link
                                  key={listing.id}
                                  to={`/listing/${listing.id}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-arcane-surface transition-all group"
                                >
                                  <div className="w-12 h-12 rounded-lg bg-arcane-surface overflow-hidden flex-shrink-0">
                                    {listing.images?.[0]?.url ? (
                                      <img
                                        src={listing.images[0].url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-lg">
                                        🎮
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate group-hover:text-arcane-gold-light transition-colors">
                                      {listing.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-text-muted">
                                        {listing.game?.name}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-sm font-bold text-arcane-gold flex-shrink-0">
                                    ${listing.price}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden pb-3">
            <SmartSearch />
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-arcane-elevated border-l border-arcane-border z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6 pt-24 space-y-4">
                <p className="text-xs text-text-muted uppercase tracking-wider px-2">
                  Categories
                </p>
                {mainCategories.map((cat) => (
                  <Link
                    key={cat.label}
                    to={`/marketplace?category=${cat.key}`}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-white hover:bg-arcane-surface text-lg"
                  >
                    {cat.label}
                  </Link>
                ))}
                <div className="border-t border-arcane-border pt-4">
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileOpen(false)}
                        className="block px-4 py-3 rounded-xl text-text-secondary hover:text-white hover:bg-arcane-surface"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/sell"
                        onClick={() => setIsMobileOpen(false)}
                        className="block px-4 py-3 rounded-xl text-arcane-gold hover:bg-arcane-gold/10 font-medium"
                      >
                        Sell Now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileOpen(false)}
                        className="block"
                      >
                        <Button variant="ghost" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileOpen(false)}
                        className="block"
                      >
                        <Button variant="primary" className="w-full">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
