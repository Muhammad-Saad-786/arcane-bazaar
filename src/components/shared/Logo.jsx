import { Link } from "react-router-dom";

export default function Logo({ size = "md" }) {
  const sizes = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
    xl: "h-16",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
      <img
        src="/arcane-logo.png"
        alt="Arcane Bazaar"
        className={`${sizes[size]} w-auto object-contain`}
      />
      <div className="flex flex-col">
        <span
          className={`${textSizes[size]} font-display font-extrabold text-white leading-none tracking-tight`}
        >
          ARCANE
        </span>
        <span className="text-[10px] sm:text-xs text-text-muted tracking-[0.2em] uppercase leading-none mt-0.5">
          Bazaar
        </span>
      </div>
    </Link>
  );
}
