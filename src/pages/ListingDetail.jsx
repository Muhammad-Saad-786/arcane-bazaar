import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineEye,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineHeart,
  HiHeart,
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineChat,
} from "react-icons/hi";
import { supabase } from "../lib/supabase";
import useAuthStore from "../stores/useAuthStore";
import useCurrencyStore from "../stores/useCurrencyStore";
import useWishlistStore from "../stores/useWishlistStore";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import SEO from "../components/ui/SEO";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { formatPrice } = useCurrencyStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    const { data } = await supabase
      .from("listings")
      .select(
        `*, game:games(name, slug, icon), category:listing_categories(name, type), seller:profiles(username, avatar_url, verified_seller, rating, total_sales, created_at), images:listing_images(url, is_cover)`,
      )
      .eq("id", id)
      .single();
    setListing(data);
    setLoading(false);

    // Increment views
    if (data) {
      await supabase
        .from("listings")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", id);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-arcane-dark pt-24 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (!listing)
    return (
      <div className="min-h-screen bg-arcane-dark pt-24 flex items-center justify-center">
        <p className="text-white text-lg">Listing not found</p>
      </div>
    );

  const isWishlisted = wishlistIds.includes(listing.id);
  const isSold = listing.status === "sold";
  const seller = listing.seller;
  const images = listing.images || [];

  return (
    <div className="min-h-screen bg-arcane-dark pt-24 pb-20">
      <SEO
        title={listing.title}
        description={listing.description?.substring(0, 160)}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Images */}
          <div className="lg:col-span-2">
            <GlassCard className="p-4">
              <div className="aspect-video rounded-xl bg-[#1E1D24] overflow-hidden mb-3">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.url || images[0]?.url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                    🎮
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === selectedImage ? "border-arcane-gold" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Description */}
            <GlassCard className="p-6 mt-4">
              <h2 className="text-lg font-semibold text-white mb-3">
                Description
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                {listing.description || "No description provided."}
              </p>

              {listing.rank && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {listing.rank && (
                    <div className="p-3 bg-[#1E1D24] rounded-xl">
                      <span className="text-text-muted text-xs">Rank</span>
                      <p className="text-white font-medium">{listing.rank}</p>
                    </div>
                  )}
                  {listing.level && (
                    <div className="p-3 bg-[#1E1D24] rounded-xl">
                      <span className="text-text-muted text-xs">Level</span>
                      <p className="text-white font-medium">{listing.level}</p>
                    </div>
                  )}
                  {listing.server && (
                    <div className="p-3 bg-[#1E1D24] rounded-xl">
                      <span className="text-text-muted text-xs">Server</span>
                      <p className="text-white font-medium">{listing.server}</p>
                    </div>
                  )}
                  {listing.hero_count > 0 && (
                    <div className="p-3 bg-[#1E1D24] rounded-xl">
                      <span className="text-text-muted text-xs">Heroes</span>
                      <p className="text-white font-medium">
                        {listing.hero_count}
                      </p>
                    </div>
                  )}
                  {listing.skin_count > 0 && (
                    <div className="p-3 bg-[#1E1D24] rounded-xl">
                      <span className="text-text-muted text-xs">Skins</span>
                      <p className="text-white font-medium">
                        {listing.skin_count}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right - Purchase Panel */}
          <div className="space-y-4">
            {/* Game & Category */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-3">
                {listing.game?.icon && (
                  <img
                    src={listing.game.icon}
                    alt=""
                    className="w-8 h-8 object-contain"
                  />
                )}
                <div>
                  <p className="text-white font-medium">{listing.game?.name}</p>
                  <p className="text-text-muted text-xs capitalize">
                    {listing.category?.type || listing.category?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Price</span>
                <span className="text-2xl font-extrabold text-arcane-gold">
                  {isSold ? "SOLD" : formatPrice(listing.price)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                <HiOutlineEye className="w-3 h-3" /> {listing.views} views
                <span>•</span>
                <HiOutlineClock className="w-3 h-3" />{" "}
                {listing.delivery_time || 30} min delivery
              </div>
            </GlassCard>

            {/* Seller Card */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-arcane-gold flex items-center justify-center text-sm font-bold text-white">
                  {seller?.avatar_url ? (
                    <img
                      src={seller.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    seller?.username?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-white font-medium text-sm">
                      {seller?.username}
                    </p>
                    {seller?.verified_seller && (
                      <HiOutlineShieldCheck className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <HiOutlineStar className="w-3 h-3 text-arcane-gold" />
                    <span>{seller?.rating || "New"}</span>
                    <span>•</span>
                    <span>{seller?.total_sales || 0} sales</span>
                  </div>
                </div>
              </div>
              <p className="text-text-muted text-xs">
                Member since{" "}
                {new Date(seller?.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </GlassCard>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 text-xs text-text-muted">
              {[
                { icon: HiOutlineShieldCheck, text: "Verified seller" },
                { icon: HiOutlineClock, text: "7-day protection" },
                { icon: HiOutlineCheck, text: "Secure escrow" },
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E1D24] border border-[#2A2932]"
                >
                  <b.icon className="w-3 h-3 text-green-400" />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {!isSold && (
              <div className="space-y-2">
                <Button variant="gold" size="lg" className="w-full">
                  <HiOutlineShoppingBag className="w-5 h-5" /> Buy Now
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleWishlist(listing.id)}
                    variant="ghost"
                    className="flex-1"
                  >
                    {isWishlisted ? (
                      <HiHeart className="w-4 h-4 text-red-400" />
                    ) : (
                      <HiOutlineHeart className="w-4 h-4" />
                    )}
                    {isWishlisted ? "Saved" : "Wishlist"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() =>
                      user
                        ? navigate(
                            `/dashboard/messages?seller=${listing.seller_id}`,
                          )
                        : toast.error("Please login")
                    }
                  >
                    <HiOutlineChat className="w-4 h-4" /> Contact
                  </Button>
                </div>
              </div>
            )}
            {isSold && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-red-400 font-bold text-lg">SOLD</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
