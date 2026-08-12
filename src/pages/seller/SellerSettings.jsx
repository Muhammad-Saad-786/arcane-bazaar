import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineCreditCard,
  HiOutlineClock,
  HiOutlineBell,
  HiOutlinePause,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import useSellerStore from "../../stores/useSellerStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export default function SellerSettings() {
  const { profile, updateProfile } = useAuthStore();
  const { toggleVacationMode } = useSellerStore();
  const [deliveryTime, setDeliveryTime] = useState(
    profile?.delivery_time || "30",
  );
  const [vacationMode, setVacationMode] = useState(
    profile?.vacation_mode || false,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({
      delivery_time: deliveryTime,
      vacation_mode: vacationMode,
    });
    setSaving(false);
    toast.success(result.success ? "Settings saved!" : "Failed to save");
  };

  const handleVacationToggle = async () => {
    const newState = !vacationMode;
    setVacationMode(newState);
    await toggleVacationMode(newState);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Settings
      </h1>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HiOutlineCreditCard className="w-5 h-5 text-arcane-gold" /> Payment
          Methods
        </h2>
        <p className="text-text-muted text-sm mb-4">
          Add withdrawal methods to receive your earnings
        </p>
        <div className="space-y-3">
          {[
            { method: "PayPal", value: profile?.paypal_email || "Not set" },
            {
              method: "Bank Transfer",
              value: profile?.bank_name
                ? `${profile.bank_name} - ${profile.bank_account}`
                : "Not set",
            },
            {
              method: "Crypto (USDT)",
              value: profile?.binance_usdt || "Not set",
            },
            { method: "Skrill", value: profile?.skrill_email || "Not set" },
          ].map((pm) => (
            <div
              key={pm.method}
              className="flex items-center justify-between p-3 bg-[#1E1D24] rounded-xl"
            >
              <span className="text-white text-sm">{pm.method}</span>
              <span className="text-text-muted text-xs">{pm.value}</span>
            </div>
          ))}
        </div>
        <Button
          variant="gold"
          size="sm"
          className="mt-4"
          onClick={() => toast.success("Payment settings coming soon")}
        >
          Edit Payment Methods
        </Button>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HiOutlineClock className="w-5 h-5 text-arcane-gold" /> Delivery
          Settings
        </h2>
        <div>
          <label className="text-sm text-text-secondary mb-2 block">
            Default Delivery Time (minutes)
          </label>
          <input
            type="number"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="w-full bg-[#1E1D24] border border-[#2A2932] rounded-xl py-3 px-4 text-white text-sm outline-none w-32"
          />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HiOutlinePause className="w-5 h-5 text-arcane-gold" /> Vacation Mode
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm">Pause all listings</p>
            <p className="text-text-muted text-xs mt-1">
              Buyers won't be able to purchase while vacation mode is on
            </p>
          </div>
          <button
            onClick={handleVacationToggle}
            className={`relative w-12 h-7 rounded-full transition-all ${vacationMode ? "bg-arcane-gold" : "bg-[#2A2932]"}`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${vacationMode ? "left-6" : "left-1"}`}
            />
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HiOutlineBell className="w-5 h-5 text-arcane-gold" /> Notification
          Preferences
        </h2>
        {[
          "New order",
          "Payment received",
          "Order disputed",
          "Review received",
          "Withdrawal processed",
        ].map((n) => (
          <div key={n} className="flex items-center justify-between py-2">
            <span className="text-white text-sm">{n}</span>
            <button className="relative w-12 h-7 rounded-full bg-arcane-gold transition-all">
              <div className="absolute top-1 left-6 w-5 h-5 rounded-full bg-white transition-all" />
            </button>
          </div>
        ))}
      </GlassCard>

      <Button
        onClick={handleSave}
        variant="gold"
        size="lg"
        className="w-full"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </motion.div>
  );
}
