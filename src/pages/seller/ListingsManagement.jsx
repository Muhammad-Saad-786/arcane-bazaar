import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  HiOutlineInformationCircle,
} from "react-icons/hi";
import useSellerStore from "../../stores/useSellerStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import useCreateListingStore from "../../stores/useCreateListingStore";
import useMarketplaceStore from "../../stores/useMarketplaceStore";
import toast from "react-hot-toast";
import emptyOrdersImage from "/public/icons/pages/empty-orders.png";
import SEO from "../../components/ui/SEO";
const statusColors = {
  active: "bg-green-500/20 text-green-400",
  pending: "bg-amber-500/20 text-amber-400",
  sold: "bg-blue-500/20 text-blue-400",
  hidden: "bg-white/10 text-white/40",
  rejected: "bg-red-500/20 text-red-400",
};

// CSV column parsing with quotation escaping support
function parseCSVLine(text) {
  const result = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export default function ListingsManagement() {
  const {
    listings,
    loading,
    fetchListings,
    deleteListing,
    updateListingStatus,
    bulkUploadListings,
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

  useEffect(() => {
    fetchListings();
    fetchGames();
  }, [fetchListings, fetchGames]);

  // Fetch categories when selected game changes
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
      setBulkCategory("");
    }
  }, [bulkGame]);

  // Dynamic sample CSV template generator with all 4 category examples
  const downloadSampleTemplate = () => {
    const csvContent = [
      // Header row
      [
        "title",
        "description",
        "price",
        "delivery_type",
        "delivery_time",
        "rank",
        "level",
        "server",
        "hero_count",
        "skin_count",
        "amount_options",
        "delivery_method",
        "region",
        "platform",
        "service_type",
        "target_rank",
        "item_name",
        "quantity",
      ].join(","),

      // Row 1: Account Example
      [
        '"Radiant Peak Account | 45 Skins | Full Access"',
        '"Original owner account with prime skins and email change available."',
        "149.99",
        "instant",
        "15",
        '"Radiant"',
        "120",
        '"NA"',
        "28",
        "45",
        '""',
        '""',
        '""',
        '"PC"',
        '""',
        '""',
        '""',
        "1",
      ].join(","),

      // Row 2: Topup / Currency Example
      [
        '"Mobile Legends 1000+ Diamonds Instant Top-up"',
        '"Instant direct ID recharge without login required."',
        "18.50",
        "auto",
        "5",
        '""',
        '""',
        '""',
        "0",
        "0",
        '\"[{\\"amount\\":\\"500 Diamonds\\",\\"price\\":9.50},{\\"amount\\":\\"1000 Diamonds\\",\\"price\\":18.50}]\"',
        '"redeem_code"',
        '"Global"',
        '"Mobile"',
        '""',
        '""',
        '""',
        "1",
      ].join(","),

      // Row 3: Boosting Service Example
      [
        '"Valorant Competitive Rank Boost (Gold to Diamond)"',
        '"Professional duo or solo rank boost with 80%+ winrate guarantee."',
        "45.00",
        "manual",
        "120",
        '"Gold II"',
        '""',
        '"NA"',
        "0",
        "0",
        '""',
        '""',
        '"NA"',
        '"PC"',
        '"rank_boost"',
        '"Diamond I"',
        '""',
        "1",
      ].join(","),

      // Row 4: Items Example
      [
        '"Path of Exile 50x Divine Orbs [Standard League]"',
        '"Fast face-to-face in-game trade within 10 minutes."',
        "32.00",
        "manual",
        "10",
        '""',
        '""',
        '"Standard"',
        "0",
        "0",
        '""',
        '"direct_trade"',
        '"Global"',
        '"PC"',
        '""',
        '""',
        '"Divine Orb"',
        "50",
      ].join(","),
    ].join("\r\n");

    // Create UTF-8 encoded Blob
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "arcane_bazaar_sample_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length <= 1) {
        toast.error("CSV file contains no rows");
        setBulkLoading(false);
        return;
      }

      const headerCols = parseCSVLine(lines[0]).map((h) =>
        h.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      );

      const rows = lines
        .slice(1)
        .map((rowLine) => {
          const cols = parseCSVLine(rowLine);
          const rowData = {};

          headerCols.forEach((header, index) => {
            rowData[header] = cols[index] || "";
          });

          // Parse amount_options if valid JSON string
          let parsedAmountOptions = [];
          if (rowData.amount_options) {
            try {
              parsedAmountOptions = JSON.parse(rowData.amount_options);
            } catch {
              parsedAmountOptions = [];
            }
          }

          return {
            title: rowData.title || "",
            description: rowData.description || "",
            price: Number.parseFloat(rowData.price) || 0,
            delivery_type: rowData.delivery_type || "manual",
            delivery_time: String(rowData.delivery_time || "30"),
            rank: rowData.rank || null,
            level: rowData.level ? Number.parseInt(rowData.level, 10) : null,
            server: rowData.server || null,
            hero_count: rowData.hero_count
              ? Number.parseInt(rowData.hero_count, 10)
              : 0,
            skin_count: rowData.skin_count
              ? Number.parseInt(rowData.skin_count, 10)
              : 0,
            amount_options: parsedAmountOptions,
            delivery_method: rowData.delivery_method || null,
            region: rowData.region || null,
            platform: rowData.platform || null,
            service_type: rowData.service_type || null,
            target_rank: rowData.target_rank || null,
            item_name: rowData.item_name || null,
            quantity: rowData.quantity
              ? Number.parseInt(rowData.quantity, 10)
              : 1,
          };
        })
        .filter(
          (r) =>
            r.title &&
            (r.price > 0 || (r.amount_options && r.amount_options.length > 0)),
        );

      if (rows.length === 0) {
        toast.error("No valid listings found. Please verify column headers.");
        setBulkLoading(false);
        return;
      }

      const result = await bulkUploadListings(rows, bulkGame, bulkCategory);
      if (result.success) {
        toast.success(`Successfully uploaded ${rows.length} listings!`);
        setShowBulkUpload(false);
        setCsvFile(null);
        setBulkGame("");
        setBulkCategory("");
        fetchListings();
      }
    } catch (error) {
      console.error("CSV Bulk Upload error:", error);
      toast.error("Failed to parse CSV file: " + error.message);
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
      <SEO title="Listings Management" />
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
            className="text-white"
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
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
              filter === s
                ? "bg-arcane-gold text-arcane-dark border border-arcane-gold/30"
                : "text-text-muted text-white bg-[#1E1D24]"
            }`}
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 max-w-2xl mx-auto"
        >
          <div className="flex flex-col items-center justify-center py-12 px-4">
            {/* PNG Image */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 mb-6">
              <img
                src={emptyOrdersImage}
                alt="No orders"
                className="w-full h-full object-contain"
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-white text-center">
              No orders yet
            </h2>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-4 hover:border-arcane-gold/30 transition-all group relative flex flex-col justify-between h-full">
                <div>
                  <div className="aspect-video rounded-xl bg-[#1E1D24] overflow-hidden mb-3 relative border border-[#2A2932]">
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
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold tracking-wide uppercase ${
                          statusColors[listing.status] ||
                          "bg-white/10 text-white"
                        }`}
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
                        className="w-4 h-4 rounded object-contain"
                      />
                    )}
                    <span className="text-xs text-text-muted">
                      {listing.game?.name} •{" "}
                      {listing.category?.name || "General"}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
                    {listing.title}
                  </h3>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between border-t border-[#2A2932] pt-2">
                    <div>
                      <span className="text-arcane-gold font-bold text-base">
                        ${listing.price || "0.00"}
                      </span>
                      {listing.quantity > 1 && (
                        <span className="text-text-muted text-[11px] block">
                          Stock: {listing.quantity}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {listing.status === "active" && (
                        <>
                          <button
                            onClick={() =>
                              updateListingStatus(listing.id, "hidden")
                            }
                            className="p-1.5 cursor-pointer text-white rounded-lg hover:bg-[#1E1D24]"
                            title="Hide"
                          >
                            <HiOutlineEyeOff className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateListingStatus(listing.id, "sold")
                            }
                            className="p-1.5 cursor-pointer text-green-400 rounded-lg hover:bg-[#1E1D24]"
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
                          className="p-1.5 cursor-pointer text-arcane-gold rounded-lg hover:bg-[#1E1D24]"
                          title="Publish"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteListing(listing.id)}
                        className="p-1.5 cursor-pointer text-red-400 rounded-lg hover:bg-[#1E1D24]"
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
                        className="p-1.5 cursor-pointer text-blue-400 rounded-lg hover:bg-[#1E1D24]"
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
                        className="p-1.5 cursor-pointer text-purple-400 rounded-lg hover:bg-[#1E1D24]"
                        title="Duplicate"
                      >
                        <HiOutlineClipboardCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-text-muted">
                    <span>👁 {listing.views || 0} views</span>
                    <span>
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* ============ BULK UPLOAD MODAL ============ */}
      <AnimatePresence>
        {showBulkUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto bg-[#18171E] border border-[#2A2932] rounded-2xl"
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

              <div className="p-3 bg-arcane-gold/10 border border-arcane-gold/20 rounded-xl mb-4 space-y-2">
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <HiOutlineInformationCircle className="w-4 h-4 text-arcane-gold shrink-0 mt-0.5" />
                  <span>
                    Upload standard listings, accounts, topups, boosting or
                    items using our unified schema.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="text-arcane-gold text-xs font-medium hover:underline inline-flex items-center gap-1.5"
                >
                  <HiOutlineDownload className="w-3.5 h-3.5" /> Download Unified
                  CSV Template
                </button>
              </div>

              <label className="block text-sm text-text-secondary mb-1.5">
                Select Game *
              </label>
              <select
                value={bulkGame}
                onChange={(e) => {
                  setBulkGame(e.target.value);
                  setBulkCategory("");
                }}
                className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none mb-4"
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
                  <label className="block text-sm text-text-secondary mb-1.5">
                    Select Category (Optional)
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none mb-4"
                  >
                    <option value="">All / Auto-assign</option>
                    {bulkCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </>
              )}

              <label className="block text-sm text-text-secondary mb-1.5">
                CSV File *
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0])}
                className="w-full text-white text-sm mb-5 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-arcane-gold file:text-[#141319] file:font-semibold file:cursor-pointer"
              />

              <div className="flex gap-3">
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
