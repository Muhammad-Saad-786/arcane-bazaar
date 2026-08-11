import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineCamera, HiOutlineUpload, HiOutlineX } from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

const defaultAvatars = [
  "/avatars/default/avatar-1.png",
  "/avatars/default/avatar-2.png",
  "/avatars/default/avatar-3.png",
  "/avatars/default/avatar-4.png",
  "/avatars/default/avatar-5.png",
  "/avatars/default/avatar-6.png",
  "/avatars/default/avatar-7.png",
  "/avatars/default/avatar-8.png",
];

export default function AvatarPicker({ onClose }) {
  const { profile, updateProfile } = useAuthStore();
  const [selected, setSelected] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("defaults");

  const handleSelectDefault = async (url) => {
    setSelected(url);
    const result = await updateProfile({ avatar_url: url });
    if (result.success) {
      toast.success("Avatar updated!");
      onClose?.();
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);
    const filePath = `avatars/${profile.id}/${Date.now()}.${file.name.split(".").pop()}`;

    const { data: upload, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(upload.path);

    const result = await updateProfile({ avatar_url: publicUrl });
    if (result.success) {
      toast.success("Avatar uploaded!");
      onClose?.();
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    const result = await updateProfile({ avatar_url: null });
    if (result.success) {
      toast.success("Avatar removed");
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-modal w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Choose Avatar</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-white rounded-xl hover:bg-arcane-surface transition-all"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Current Avatar */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-arcane-surface">
          <div className="w-16 h-16 rounded-full bg-arcane-gold flex items-center justify-center text-xl font-bold text-white overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              profile?.username?.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div>
            <p className="text-white font-medium">{profile?.username}</p>
            <p className="text-text-muted text-xs">Current avatar</p>
            {profile?.avatar_url && (
              <button
                onClick={handleRemove}
                className="text-xs text-danger hover:text-red-400 mt-1"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-arcane-border pb-2">
          {["defaults", "upload"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-arcane-purple/20 text-arcane-purple"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {tab === "defaults" ? "Default Icons" : "Upload Custom"}
            </button>
          ))}
        </div>

        {/* Default Avatars Grid */}
        {activeTab === "defaults" && (
          <div className="grid grid-cols-4 gap-3">
            {defaultAvatars.map((avatar, i) => (
              <button
                key={i}
                onClick={() => handleSelectDefault(avatar)}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                  selected === avatar
                    ? "border-arcane-purple ring-2 ring-arcane-purple/20"
                    : "border-transparent hover:border-arcane-border"
                }`}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<div class="w-full h-full bg-arcane-surface flex items-center justify-center text-2xl">?</div>';
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Upload Custom */}
        {activeTab === "upload" && (
          <div>
            <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-arcane-border rounded-2xl cursor-pointer hover:border-arcane-purple/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-arcane-purple/10 flex items-center justify-center">
                <HiOutlineUpload className="w-7 h-7 text-arcane-purple" />
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-medium">
                  Click to upload
                </p>
                <p className="text-text-muted text-xs mt-1">
                  PNG, JPG, JPEG up to 2MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {uploading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-arcane-purple">
                <div className="w-4 h-4 border-2 border-arcane-purple/30 border-t-arcane-purple rounded-full animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
