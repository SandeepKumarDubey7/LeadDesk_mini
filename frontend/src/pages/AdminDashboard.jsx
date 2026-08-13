/**
 * Admin Dashboard — Protected page with stats, analytics charts, search, filters, export, and lead table.
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLeads } from '../hooks/useLeads';
import { useAuth } from '../context/AuthContext';
import { exportLeadsAPI } from '../services/api';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import LeadTable from '../components/LeadTable';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AnalyticsCharts from '../components/AnalyticsCharts';
import UserManagementModal from '../components/UserManagementModal';

const BUDGET_OPTIONS = ['< ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '₹1L+'];

function AdminDashboard() {
  const { role, user } = useAuth();
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingXlsx, setExportingXlsx] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const {
    leads,
    stats,
    loading,
    error,
    page,
    totalPages,
    total,
    searchQuery,
    statusFilter,
    budgetFilter,
    refetch,
    handleSearch,
    handleStatusFilter,
    handleBudgetFilter,
    goToPage,
  } = useLeads();

  const handleExport = async (format) => {
    if (format === 'csv') setExportingCsv(true);
    if (format === 'xlsx') setExportingXlsx(true);

    try {
      await exportLeadsAPI(format, {
        q: searchQuery,
        status: statusFilter,
        budget: budgetFilter,
      });
      toast.success(`Leads exported as ${format.toUpperCase()} successfully!`);
    } catch (err) {
      toast.error(`Failed to export leads as ${format.toUpperCase()}`);
    } finally {
      if (format === 'csv') setExportingCsv(false);
      if (format === 'xlsx') setExportingXlsx(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary">
                Dashboard
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
                {role ? role.replace('_', ' ') : 'Admin'}
              </span>
            </div>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
              Welcome back, <span className="font-medium text-text-primary dark:text-text-dark-primary">{user?.email}</span>. Manage your sales pipeline and track leads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {role === 'super_admin' && (
              <button
                onClick={() => setShowUsersModal(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>👥</span> Team Access
              </button>
            )}

            {/* Export Buttons */}
            <button
              onClick={() => handleExport('csv')}
              disabled={exportingCsv}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-border dark:border-border-dark text-text-primary dark:text-text-dark-primary text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              title="Export filtered leads to CSV"
            >
              <span>📄</span> {exportingCsv ? 'Exporting...' : 'CSV'}
            </button>

            <button
              onClick={() => handleExport('xlsx')}
              disabled={exportingXlsx}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-border dark:border-border-dark text-text-primary dark:text-text-dark-primary text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              title="Export filtered leads to Excel"
            >
              <span>📊</span> {exportingXlsx ? 'Exporting...' : 'Excel'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <LoadingSkeleton type="cards" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Leads"
              count={stats.total}
              icon="📊"
              color="purple"
              subtitle="All time"
            />
            <StatCard
              title="New Leads"
              count={stats.new}
              icon="🆕"
              color="blue"
              subtitle="Awaiting contact"
            />
            <StatCard
              title="Contacted"
              count={stats.contacted}
              icon="📞"
              color="amber"
              subtitle="In progress"
            />
            <StatCard
              title="Closed"
              count={stats.closed}
              icon="✅"
              color="green"
              subtitle="Successfully closed"
            />
          </div>
        )}

        {/* Analytics Charts */}
        <AnalyticsCharts />

        {/* Search & Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name or email..."
          />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-sm text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none shadow-sm"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={budgetFilter}
            onChange={(e) => handleBudgetFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-sm text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none shadow-sm"
          >
            <option value="">All Budgets</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <button
            onClick={refetch}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Lead Table */}
        {loading ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : (
          <LeadTable
            leads={leads}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={goToPage}
            onRefetch={refetch}
            searchQuery={searchQuery}
            userRole={role}
          />
        )}

        {/* Super Admin User Management Modal */}
        {showUsersModal && (
          <UserManagementModal onClose={() => setShowUsersModal(false)} />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
