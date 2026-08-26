import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineCamera,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineDeviceMobile,
  HiOutlineKey,
  HiOutlineGlobe,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import AvatarPicker from "../../components/ui/AvatarPicker";
import SEO from "../../components/ui/SEO";
const emailNotifications = [
  {
    id: "all",
    label: "All email notifications",
    desc: "Receive all email notifications",
  },
  { id: "new_order", label: "New order", desc: "When you receive a new order" },
  {
    id: "message",
    label: "Message received",
    desc: "When you receive a new message",
  },
  {
    id: "order_update",
    label: "Order updates",
    desc: "When your order status changes",
  },
  {
    id: "dispute",
    label: "Dispute updates",
    desc: "When your dispute is resolved or updated",
  },
  {
    id: "payment",
    label: "Payment updates",
    desc: "When your payment is received or refunded",
  },
  {
    id: "withdrawal",
    label: "Withdrawal updates",
    desc: "When you request or receive a withdrawal",
  },
  {
    id: "verification",
    label: "Verification updates",
    desc: "When your verification is processed",
  },
];

export default function ProfileSettings() {
  const { profile, updateProfile, signOut } = useAuthStore();
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Username edit mode
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || "");

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState(
    emailNotifications.reduce((acc, n) => ({ ...acc, [n.id]: true }), {}),
  );

  const handleSaveUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    const result = await updateProfile({ username: newUsername });
    if (result.success) {
      toast.success("Username updated!");
      setEditingUsername(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password changed successfully!");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogoutAll = async () => {
    if (
      !confirm("This will log you out from all devices and browsers. Continue?")
    )
      return;
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      toast.error("Failed to logout");
    } else {
      toast.success("Logged out from all sessions");
      signOut();
    }
  };

  const toggleNotification = (id) => {
    if (id === "all") {
      const allOn = !notifications.all;
      const updated = emailNotifications.reduce(
        (acc, n) => ({ ...acc, [n.id]: allOn }),
        {},
      );
      setNotifications(updated);
    } else {
      setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  return (
    <>
      <SEO title="Account Settings" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-full mx-auto"
      >
        <h1 className="text-2xl font-display font-extrabold text-white">
          Account Settings
        </h1>

        {/* Profile Section */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Profile</h2>

          {/* Email */}
          <div className="pb-5 mb-5 border-b border-arcane-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Email</p>
                <p className="text-white font-medium mt-1">{profile?.email}</p>
                <p className="text-xs text-text-muted mt-1">
                  This email is linked to your account. It is not visible to
                  other users.
                </p>
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="pb-5 mb-5 border-b border-arcane-border">
            {editingUsername ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-arcane-purple/50 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSaveUsername}
                    className="p-3 bg-success/10 text-success rounded-xl hover:bg-success/20 transition-all"
                  >
                    <HiOutlineCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingUsername(false)}
                    className="p-3 bg-danger/10 text-danger rounded-xl hover:bg-danger/20 transition-all"
                  >
                    <HiOutlineX className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-text-muted">
                  You can change your username once every 90 days.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Username</p>
                  <p className="text-white font-medium mt-1">
                    {profile?.username}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Name that is visible to other Arcane Bazaar users.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingUsername(true);
                    setNewUsername(profile?.username || "");
                  }}
                  className="flex items-center gap-1 text-sm text-arcane-purple hover:text-arcane-gold-light transition-colors"
                >
                  <HiOutlinePencil className="w-4 h-4" /> Edit
                </button>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="pb-5 mb-5 border-b border-arcane-border">
            {showPasswordForm ? (
              <div className="space-y-4">
                <h3 className="text-sm text-text-secondary font-medium">
                  Change Password
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <HiOutlineKey className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3 pl-12 pr-12 text-white outline-none focus:border-arcane-purple/50 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <HiOutlineKey className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3 pl-12 pr-12 text-white outline-none focus:border-arcane-purple/50 transition-all"
                    />
                    <button
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white z-10"
                    >
                      {showPasswords ? (
                        <HiOutlineEyeOff className="w-5 h-5" />
                      ) : (
                        <HiOutlineEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleChangePassword}
                    variant="primary"
                    size="sm"
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Changing..." : "Change Password"}
                  </Button>
                  <Button
                    onClick={() => setShowPasswordForm(false)}
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Password</p>
                  <p className="text-text-muted text-xs mt-1">
                    Change your account password
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="flex items-center gap-1 text-sm text-arcane-purple hover:text-arcane-gold-light transition-colors"
                >
                  <HiOutlinePencil className="w-4 h-4" /> Change
                </button>
              </div>
            )}
          </div>

          {/* Profile Picture */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Profile Picture</p>
                <p className="text-text-muted text-xs mt-1">
                  Must be JPEG, PNG or WebP.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-arcane-gold flex items-center justify-center text-lg font-bold text-white overflow-hidden">
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
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="text-sm text-arcane-purple hover:text-arcane-gold-light transition-colors"
                >
                  Update Image
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Security Section */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Security</h2>

          {/* Payment Lock (2FA) */}
          <div className="pb-5 mb-5 border-b border-arcane-border">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-arcane-purple/10 flex items-center justify-center flex-shrink-0">
                  <HiOutlineDeviceMobile className="w-5 h-5 text-arcane-purple" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    Payment Lock (2FA)
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    Enable with Google Authenticator. 2FA codes will be
                    requested for withdrawals and purchases.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  toast.success(
                    twoFactorEnabled
                      ? "2FA disabled"
                      : "2FA enabled - Coming soon",
                  );
                }}
                className={`relative w-12 h-7 rounded-full transition-all ${twoFactorEnabled ? "bg-success" : "bg-arcane-border"}`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${twoFactorEnabled ? "left-6" : "left-1"}`}
                />
              </button>
            </div>
          </div>

          {/* Logout All Sessions */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                  <HiOutlineLogout className="w-5 h-5 text-danger" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    Log out from all sessions
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    This logs you out from all devices and browsers.
                  </p>
                  <p className="text-text-muted text-xs">
                    * This action can take up to 1 hour to complete.
                  </p>
                </div>
              </div>
              <Button onClick={handleLogoutAll} variant="danger" size="sm">
                Logout All
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Email Notifications */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Email Notifications
          </h2>
          <div className="space-y-4">
            {emailNotifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-white text-sm">{notif.label}</p>
                  <p className="text-text-muted text-xs mt-0.5">{notif.desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(notif.id)}
                  className={`relative w-12 h-7 rounded-full transition-all ${notifications[notif.id] ? "bg-arcane-purple" : "bg-arcane-border"}`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${notifications[notif.id] ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Bio */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">About You</h2>
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
          <Button
            onClick={async () => {
              const result = await updateProfile({ bio });
              if (result.success) toast.success("Bio updated!");
            }}
            variant="primary"
            size="sm"
            className="mt-3"
          >
            Save Bio
          </Button>
        </GlassCard>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <AvatarPicker onClose={() => setShowAvatarPicker(false)} />
        )}
      </motion.div>
    </>
  );
}
