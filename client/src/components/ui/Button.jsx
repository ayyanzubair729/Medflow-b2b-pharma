const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variants = {
  primary:
    "bg-primary text-white shadow-soft hover:bg-[#1E3A8A] focus-visible:ring-primary",
  secondary:
    "bg-secondary text-white shadow-soft hover:bg-[#0F766E] focus-visible:ring-secondary",
  outline:
    "border border-slate-600/70 bg-transparent text-slate-100 hover:border-primary hover:text-primary focus-visible:ring-primary",
  ghost:
    "bg-transparent text-slate-100 hover:bg-slate-800/60 focus-visible:ring-primary",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
