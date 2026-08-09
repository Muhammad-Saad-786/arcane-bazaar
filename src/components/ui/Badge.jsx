export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-arcane-border text-text-secondary",
    purple: "bg-arcane-purple/20 text-arcane-purple",
    gold: "bg-arcane-gold/20 text-arcane-gold",
    green: "bg-success/20 text-success",
    red: "bg-danger/20 text-danger",
    blue: "bg-blue-500/20 text-blue-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
