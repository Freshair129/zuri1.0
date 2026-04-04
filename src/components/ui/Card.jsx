export default function Card({
  children,
  header,
  footer,
  className = '',
  bodyClassName = '',
  noPadding = false,
}) {
  return (
    <div className={`bg-surface-container-lowest rounded-2xl shadow-floating overflow-hidden transition-all duration-300 ${className}`}>
      {header && (
        <div className="px-6 py-5 bg-surface pb-3">
          {header}
        </div>
      )}
      <div className={noPadding ? '' : `px-6 py-5 ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-surface-container-low rounded-b-2xl mt-2">
          {footer}
        </div>
      )}
    </div>
  );
}
