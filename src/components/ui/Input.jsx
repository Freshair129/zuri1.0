'use client';

export default function Input({
  label,
  id,
  error,
  icon: Icon,
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className="w-full relative group">
      {label && (
        <label htmlFor={id} className="block font-label text-[0.65rem] uppercase tracking-widest text-secondary mb-1 ml-1 group-focus-within:text-primary transition-colors">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-outline group-focus-within:text-primary transition-colors" />
          </div>
        )}
        <input
          id={id}
          className={`
            block w-full bg-surface-container-low text-on-surface font-body
            placeholder:text-outline-variant transition-all duration-300
            border-0 border-b-2 
            focus:ring-0 focus:outline-none focus:bg-surface-container
            disabled:bg-surface disabled:text-outline disabled:cursor-not-allowed disabled:border-b-outline-variant/30
            ${error ? 'border-b-error' : 'border-b-outline-variant focus:border-b-primary'}
            ${Icon ? 'pl-11 pr-3 py-3' : 'px-3 py-3'}
            rounded-t-md rounded-b-none
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-error font-prompt font-light ml-1">{error}</p>
      )}
    </div>
  );
}
