import { create } from "zustand";
import useAuthStore from "./useAuthStore";

const loyaltyTiers = {
  bronze: {
    name: "Bronze",
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    icon: "🥉",
    min: 0,
  },
  silver: {
    name: "Silver",
    color: "text-gray-300",
    bg: "bg-gray-300/10",
    icon: "🥈",
    min: 100,
  },
  gold: {
    name: "Gold",
    color: "text-arcane-gold",
    bg: "bg-arcane-gold/10",
    icon: "🥇",
    min: 500,
  },
  diamond: {
    name: "Diamond",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    icon: "💎",
    min: 2000,
  },
  elite: {
    name: "Elite",
    color: "text-arcane-purple",
    bg: "bg-arcane-purple/10",
    icon: "👑",
    min: 5000,
  },
};

const useLoyaltyStore = create((set, get) => ({
  getCurrentTier: () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return loyaltyTiers.bronze;

    const tier = profile.loyalty_tier || "bronze";
    return loyaltyTiers[tier] || loyaltyTiers.bronze;
  },

  getPoints: () => {
    const profile = useAuthStore.getState().profile;
    return profile?.loyalty_points || 0;
  },

  getNextTier: () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return null;

    const currentTier = profile.loyalty_tier || "bronze";
    const tiers = Object.entries(loyaltyTiers);
    const currentIndex = tiers.findIndex(([key]) => key === currentTier);

    if (currentIndex < tiers.length - 1) {
      const [nextKey, nextTier] = tiers[currentIndex + 1];
      return {
        name: nextTier.name,
        pointsNeeded: nextTier.min - (profile.loyalty_points || 0),
        icon: nextTier.icon,
      };
    }
    return null;
  },

  getTierProgress: () => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return 0;

    const currentTier = profile.loyalty_tier || "bronze";
    const tiers = Object.entries(loyaltyTiers);
    const currentIndex = tiers.findIndex(([key]) => key === currentTier);

    if (currentIndex >= tiers.length - 1) return 100;

    const currentMin = tiers[currentIndex][1].min;
    const nextMin = tiers[currentIndex + 1][1].min;
    const points = profile.loyalty_points || 0;

    return Math.min(
      100,
      ((points - currentMin) / (nextMin - currentMin)) * 100,
    );
  },
}));

export default useLoyaltyStore;
