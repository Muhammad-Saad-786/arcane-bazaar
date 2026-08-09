import { motion } from "framer-motion";

const variants = {
  primary: "bg-arcane-purple text-white hover:bg-arcane-purple-hover",
  gold: "bg-arcane-gold text-arcane-dark hover:bg-arcane-gold-light",
  ghost:
    "border border-arcane-border text-text-secondary hover:border-arcane-purple/50 hover:text-white hover:bg-arcane-purple/10",
  danger: "bg-danger text-white hover:bg-red-600",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-4 text-base rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
