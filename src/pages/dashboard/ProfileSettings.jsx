import { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineUser, HiOutlineMail, HiOutlineCamera } from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function ProfileSettings() {
  const { profile, updateProfile } = useAuthStore();
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ username, bio });
    setSaving(false);
    if (result.success) toast.success("Profile updated!");
    else toast.error("Failed to update");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const filePath = `${profile.id}/${Date.now()}.${file.name.split(".").pop()}`;
    const { data: upload } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);
    if (upload) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(upload.path);
      await updateProfile({ avatar_url: publicUrl });
      toast.success("Avatar updated!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Account Settings
      </h1>

      {/* Avatar */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Profile Picture
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-arcane-purple to-arcane-gold flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
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
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-arcane-purple rounded-full flex items-center justify-center cursor-pointer hover:bg-arcane-purple-hover transition-all">
              <HiOutlineCamera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-white font-medium">{profile?.username}</p>
            <p className="text-text-muted text-sm">{profile?.email}</p>
          </div>
        </div>
      </GlassCard>

      {/* Profile Form */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Personal Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Username
            </label>
            <div className="relative">
              <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-arcane-purple/50 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Email
            </label>
            <div className="relative">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3 pl-12 pr-4 text-text-muted outline-none opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3 px-4 text-white outline-none focus:border-arcane-purple/50 transition-all resize-none"
            />
          </div>
          <Button onClick={handleSave} variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
