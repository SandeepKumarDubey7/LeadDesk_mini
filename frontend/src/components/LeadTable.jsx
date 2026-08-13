/**
 * Lead management table with status dropdown, pagination, attachment indicators, and view action.
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateLeadStatusAPI } from '../services/api';
import LeadViewModal from './LeadViewModal';
import EmptyState from './EmptyState';

const STATUS_OPTIONS = ['New', 'Contacted', 'Closed'];

function LeadTable({ leads, loading, error, page, totalPages, total, onPageChange, onRefetch, searchQuery, userRole }) {
  const [viewLead, setViewLead] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (leadId, newStatus) => {
    if (userRole === 'viewer') {
      toast.error('Viewer role cannot update lead status');
      return;
    }
    setUpdatingId(leadId);
    try {
      await updateLeadStatusAPI(leadId, newStatus);
      toast.success(`Status updated to "${newStatus}"`);
      onRefetch();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColors = {
    New: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    Contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  };

  const truncate = (text, maxLen = 45) => {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Error state
  if (error) {
    return <EmptyState type="error" message="Failed to load leads" subMessage={error} />;
  }

  // Empty state
  if (!loading && leads.length === 0) {
    return searchQuery ? (
      <EmptyState type="no-results" />
    ) : (
      <EmptyState type="no-data" />
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="bg-white dark:bg-surface-card-dark rounded-2xl border border-border dark:border-border-dark overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider px-4 py-3.5">Name</th>
                <th className="text-left text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider px-4 py-3.5">Email</th>
                <th className="text-left text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider px-4 py-3.5">Budget</th>
                <th className="text-left text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Message</th>
                <th className="text-left text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider px-4 py-3.5">Status</th>
                <th className="text-left text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Date</th>
                <th className="text-left text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{lead.name}</span>
                      {lead.attachment_filename && (
                        <span title={`Attached: ${lead.attachment_filename}`} className="text-sm cursor-help">
                          📎
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">{lead.email}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-medium text-primary">{lead.budget}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">{truncate(lead.message)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      disabled={updatingId === lead._id || userRole === 'viewer'}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 appearance-none ${statusColors[lead.status] || ''}`}
                      style={{ backgroundImage: 'none' }}
                      title={userRole === 'viewer' ? 'Viewers cannot change status' : 'Change status'}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option 
                          key={status} 
                          value={status}
                          className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">{formatDate(lead.created_at)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setViewLead(lead)}
                      className="text-sm font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-border dark:border-border-dark gap-3">
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            Showing {leads.length} of {total} leads
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-text-dark-primary hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => onPageChange(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  page === i + 1
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-text-dark-primary hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {i + 1}
              </button>
            )).slice(
              Math.max(0, page - 3),
              Math.min(totalPages, page + 2)
            )}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-text-dark-primary hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewLead && (
        <LeadViewModal lead={viewLead} onClose={() => setViewLead(null)} />
      )}
    </>
  );
}

export default LeadTable;
