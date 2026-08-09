export default function GlassCard({
  children,
  className = "",
  hover = false,
  padding = true,
}) {
  return (
    <div
      className={`
        ${hover ? "glass-card-hover" : "glass-card"}
        ${padding ? "p-4 sm:p-6" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
