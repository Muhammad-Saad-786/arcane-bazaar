import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineUpload,
  HiOutlineSearch,
  HiOutlineClipboardCopy,
  HiOutlineDownload,
  HiOutlineX,
} from "react-icons/hi";
import useSellerStore from "../../stores/useSellerStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import useCreateListingStore from "../../stores/useCreateListingStore";
import useMarketplaceStore from "../../stores/useMarketplaceStore";
import toast from "react-hot-toast";

const statusColors = {
  active: "bg-green-500/20 text-green-400",
  pending: "bg-amber-500/20 text-amber-400",
  sold: "bg-blue-500/20 text-blue-400",
  hidden: "bg-white/10 text-white/40",
  rejected: "bg-red-500/20 text-red-400",
};

export default function ListingsManagement() {
  const {
    listings,
    loading,
    fetchListings,
    deleteListing,
    updateListingStatus,
    bulkUploadListings,
    games,
  } = useSellerStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { loadListing } = useCreateListingStore();

  // Bulk Upload State
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkGame, setBulkGame] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCategories, setBulkCategories] = useState([]);
  const { games: allGames, fetchGames } = useMarketplaceStore();

  // In useEffect:
  useEffect(() => {
    fetchListings();
    fetchGames();
  }, []);

  // Fetch categories when game changes
  useEffect(() => {
    if (bulkGame) {
      const fetchCats = async () => {
        const { supabase } = await import("../../lib/supabase");
        const { data } = await supabase
          .from("listing_categories")
          .select("*")
          .eq("game_id", bulkGame);
        setBulkCategories(data || []);
      };
      fetchCats();
    } else {
      setBulkCategories([]);
    }
  }, [bulkGame]);

  const handleBulkUpload = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }
    if (!bulkGame) {
      toast.error("Please select a game");
      return;
    }

    setBulkLoading(true);
    try {
      const text = await csvFile.text();
      const rows = text
        .split("\n")
        .slice(1) // Skip header row
        .map((row) => {
          const cols = row
            .split(",")
            .map((c) => c.trim().replace(/^"|"$/g, ""));
          return {
            title: cols[0] || "",
            description: cols[1] || "",
            price: cols[2] || "0",
            rank: cols[3] || "",
            level: cols[4] || "",
            server: cols[5] || "",
          };
        })
        .filter((r) => r.title && r.price);

      if (rows.length === 0) {
        toast.error("No valid rows found in CSV");
        setBulkLoading(false);
        return;
      }

      const result = await bulkUploadListings(rows, bulkGame, bulkCategory);
      if (result.success) {
        setShowBulkUpload(false);
        setCsvFile(null);
        setBulkGame("");
        setBulkCategory("");
      }
    } catch (error) {
      toast.error("Failed to parse CSV file");
    }
    setBulkLoading(false);
  };

  const filtered = listings.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (search && !l.title?.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white">
            My Listings
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {listings.length} total listings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowBulkUpload(true)}
            variant="ghost"
            size="sm"
          >
            <HiOutlineUpload className="w-4 h-4" /> Bulk Upload
          </Button>
          <Link to="/sell">
            <Button variant="gold">
              <HiOutlineUpload className="w-4 h-4" /> Create Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none"
          />
        </div>
        {["all", "active", "pending", "sold", "hidden"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === s ? "bg-arcane-gold/20 text-arcane-gold" : "text-text-muted hover:text-white bg-[#1E1D24]"}`}
          >
            {s} (
            {s === "all"
              ? listings.length
              : listings.filter((l) => l.status === s).length}
            )
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-text-muted">No listings found</p>
          <Link to="/sell">
            <Button variant="gold" size="sm" className="mt-4">
              Create Listing
            </Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-4 hover:border-arcane-gold/30 transition-all group">
                <div className="aspect-video rounded-xl bg-[#1E1D24] overflow-hidden mb-3 relative">
                  {listing.images?.[0]?.url ? (
                    <img
                      src={listing.images[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">
                      🎮
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${statusColors[listing.status]}`}
                    >
                      {listing.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {listing.game?.icon && (
                    <img
                      src={listing.game.icon}
                      alt=""
                      className="w-4 h-4 rounded"
                    />
                  )}
                  <span className="text-xs text-text-muted">
                    {listing.game?.name} • {listing.category?.name}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
                  {listing.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-arcane-gold font-bold">
                    ${listing.price}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {listing.status === "active" && (
                      <>
                        <button
                          onClick={() =>
                            updateListingStatus(listing.id, "hidden")
                          }
                          className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-[#1E1D24]"
                          title="Hide"
                        >
                          <HiOutlineEyeOff className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            updateListingStatus(listing.id, "sold")
                          }
                          className="p-1.5 text-text-muted hover:text-green-400 rounded-lg hover:bg-[#1E1D24]"
                          title="Mark Sold"
                        >
                          <HiOutlineCheck className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {listing.status === "hidden" && (
                      <button
                        onClick={() =>
                          updateListingStatus(listing.id, "active")
                        }
                        className="p-1.5 text-text-muted hover:text-arcane-gold rounded-lg hover:bg-[#1E1D24]"
                        title="Publish"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="p-1.5 text-text-muted hover:text-red-400 rounded-lg hover:bg-[#1E1D24]"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const result = await loadListing(listing.id, "edit");
                        if (result.success)
                          navigate(`/sell?edit=${listing.id}`);
                      }}
                      className="p-1.5 text-text-muted hover:text-blue-400 rounded-lg hover:bg-[#1E1D24]"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const result = await loadListing(
                          listing.id,
                          "duplicate",
                        );
                        if (result.success)
                          navigate(`/sell?duplicate=${listing.id}`);
                      }}
                      className="p-1.5 text-text-muted hover:text-purple-400 rounded-lg hover:bg-[#1E1D24]"
                      title="Duplicate"
                    >
                      <HiOutlineClipboardCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                  <span>👁 {listing.views}</span>
                  <span>
                    📅 {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* ============ BULK UPLOAD MODAL ============ */}
      <AnimatePresence>
        {showBulkUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">
                  Bulk Upload Listings
                </h3>
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="p-2 text-text-muted hover:text-white"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-arcane-gold/10 border border-arcane-gold/20 rounded-xl mb-4">
                <p className="text-text-muted text-xs">
                  <strong className="text-arcane-gold">CSV Format:</strong>{" "}
                  Title, Description, Price, Rank, Level, Server
                </p>
                <a
                  href="/template.csv"
                  download
                  className="text-arcane-gold text-xs hover:underline mt-1 inline-flex items-center gap-1"
                >
                  <HiOutlineDownload className="w-3 h-3" /> Download Template
                </a>
              </div>

              <label className="block text-sm text-text-secondary mb-2">
                Select Game *
              </label>
              <select
                value={bulkGame}
                onChange={(e) => {
                  setBulkGame(e.target.value);
                  setBulkCategory("");
                }}
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white text-sm outline-none mb-4"
              >
                <option value="">Choose a game...</option>
                {allGames?.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              {bulkCategories.length > 0 && (
                <>
                  <label className="block text-sm text-text-secondary mb-2">
                    Select Category (Optional)
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white text-sm outline-none mb-4"
                  >
                    <option value="">All categories</option>
                    {bulkCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <label className="block text-sm text-text-secondary mb-2">
                CSV File *
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0])}
                className="w-full text-white text-sm mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-arcane-gold file:text-[#141319] file:cursor-pointer"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleBulkUpload}
                  variant="gold"
                  className="flex-1"
                  disabled={bulkLoading || !csvFile || !bulkGame}
                >
                  {bulkLoading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <HiOutlineUpload className="w-4 h-4" /> Upload CSV
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowBulkUpload(false)}
                  variant="ghost"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
