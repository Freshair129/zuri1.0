'use client';

const variantClasses = {
  primary: 'gold-gradient text-[#0B2D5E] hover:shadow-primary/40 hover:scale-[1.02] shadow-xl',
  secondary: 'bg-transparent text-secondary border border-outline-variant/30 hover:bg-surface-container-low',
  danger: 'bg-error text-on-error hover:bg-error/90 hover:shadow-error/30 shadow-md',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-container border border-transparent',
  text: 'bg-transparent text-on-surface hover:underline hover:text-primary',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs tracking-wider',
  md: 'px-6 py-2.5 text-sm tracking-widest',
  lg: 'px-8 py-4 text-base tracking-widest',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-label font-bold uppercase
        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
        active:scale-[0.98]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
