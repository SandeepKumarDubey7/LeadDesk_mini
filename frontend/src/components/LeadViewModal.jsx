/**
 * Lead view modal — displays full lead details.
 */

function LeadViewModal({ lead, onClose }) {
  if (!lead) return null;

  const statusColors = {
    New: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-surface-card-dark rounded-2xl shadow-2xl border border-border dark:border-border-dark animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border dark:border-border-dark">
          <h3 className="text-lg font-bold text-text-primary dark:text-text-dark-primary">
            Lead Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Name</p>
              <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">{lead.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">{lead.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Budget</p>
              <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">{lead.budget}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Status</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] || ''}`}>
                {lead.status}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Message</p>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-text-primary dark:text-text-dark-primary leading-relaxed whitespace-pre-wrap">
                {lead.message}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Submitted At</p>
            <p className="text-sm text-text-primary dark:text-text-dark-primary">
              {new Date(lead.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border dark:border-border-dark">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-text-dark-primary font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadViewModal;
