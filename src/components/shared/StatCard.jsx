export default function StatCard({
  icon,
  label,
  value,
  prefix = '',
  suffix = '',
  change,
  changeLabel = 'vs last month',
  className = '',
}) {
  const isPositive = change > 0;
  const isNeutral = change === 0 || change == null;

  return (
    <div className={`bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 transition-all hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          {typeof icon === 'string' ? (
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
          ) : (
            icon && <icon className="h-5 w-5" />
          )}
        </div>
        {change != null && (
          <div className={`flex items-center gap-1 font-headline text-xs font-bold px-2 py-1 rounded-full ${
            isNeutral ? 'bg-surface-container-high text-secondary' : isPositive ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
          }`}>
            <span className="material-symbols-outlined text-sm">
              {isNeutral ? 'remove' : isPositive ? 'trending_up' : 'trending_down'}
            </span>
            {isPositive ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-black text-on-surface tracking-tight font-headline">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        <p className="text-[10px] font-prompt uppercase tracking-widest text-secondary">{label}</p>
        {changeLabel && change != null && (
          <p className="text-[9px] text-secondary/60 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
