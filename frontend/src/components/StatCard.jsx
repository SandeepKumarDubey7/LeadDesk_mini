/**
 * Dashboard statistics card component.
 * Displays a metric with icon, count, and label.
 */

function StatCard({ title, count, icon, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  const bgClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'bg-amber-50 dark:bg-amber-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
  };

  const textClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div className="bg-white dark:bg-surface-card-dark rounded-2xl p-6 border border-border dark:border-border-dark hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bgClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClasses[color]} pulse-dot`} />
      </div>
      <h3 className={`text-3xl font-bold ${textClasses[color]} mb-1`}>
        {count}
      </h3>
      <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default StatCard;
