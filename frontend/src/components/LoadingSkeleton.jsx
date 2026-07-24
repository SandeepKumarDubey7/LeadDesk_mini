/**
 * Reusable skeleton loading component for tables and cards.
 */

function LoadingSkeleton({ type = 'table', rows = 5 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface-card-dark rounded-2xl p-6 border border-border dark:border-border-dark">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-8 w-16 mb-2" />
            <div className="skeleton h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white dark:bg-surface-card-dark rounded-2xl border border-border dark:border-border-dark overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 gap-4 p-4 border-b border-border dark:border-border-dark">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
        {/* Rows */}
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-4 p-4 border-b border-border/50 dark:border-border-dark/50">
            {[...Array(7)].map((_, j) => (
              <div key={j} className="skeleton h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export default LoadingSkeleton;
