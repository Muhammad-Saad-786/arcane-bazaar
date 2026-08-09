import useLoyaltyStore from "../../stores/useLoyaltyStore";

export default function LoyaltyBadge({ showProgress = false, size = "sm" }) {
  const { getCurrentTier, getPoints, getNextTier, getTierProgress } =
    useLoyaltyStore();
  const tier = getCurrentTier();
  const points = getPoints();
  const nextTier = getNextTier();
  const progress = getTierProgress();

  return (
    <div className="space-y-2">
      {/* Tier Badge */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${tier.bg} ${tier.color}`}
      >
        <span>{tier.icon}</span>
        <span className={`text-${size === "sm" ? "xs" : "sm"} font-semibold`}>
          {tier.name} Rank
        </span>
      </div>

      {/* Points */}
      <p className="text-xs text-text-muted">
        {points.toLocaleString()} points
      </p>

      {/* Progress Bar */}
      {showProgress && nextTier && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-muted">{tier.name}</span>
            <span className="text-text-muted">{nextTier.name}</span>
          </div>
          <div className="w-full h-2 bg-arcane-border rounded-full overflow-hidden">
            <div
              className="h-full bg-arcane-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1">
            {nextTier.pointsNeeded.toLocaleString()} points to {nextTier.name}{" "}
            {nextTier.icon}
          </p>
        </div>
      )}
    </div>
  );
}
