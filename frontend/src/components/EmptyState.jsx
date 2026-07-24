/**
 * Empty state component for tables and search results.
 */

function EmptyState({ type = 'no-data', message, subMessage }) {
  const configs = {
    'no-data': {
      icon: '📭',
      title: message || 'No leads yet',
      subtitle: subMessage || 'Leads will appear here once someone submits the contact form.',
    },
    'no-results': {
      icon: '🔍',
      title: message || 'No results found',
      subtitle: subMessage || 'Try adjusting your search or filter criteria.',
    },
    'error': {
      icon: '⚠️',
      title: message || 'Something went wrong',
      subtitle: subMessage || 'Please try again or contact support.',
    },
  };

  const config = configs[type] || configs['no-data'];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4 animate-bounce">{config.icon}</div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {config.title}
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary text-center max-w-sm">
        {config.subtitle}
      </p>
    </div>
  );
}

export default EmptyState;
