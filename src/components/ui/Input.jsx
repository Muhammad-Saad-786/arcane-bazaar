export default function Input({
  label,
  error,
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        )}
        <input
          className={`input-glass ${Icon ? "pl-12" : ""} ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
