/**
 * Admin Dashboard — Protected page with stats, search, filters, and lead table.
 */

import { useLeads } from '../hooks/useLeads';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';
import LeadTable from '../components/LeadTable';
import LoadingSkeleton from '../components/LoadingSkeleton';

const BUDGET_OPTIONS = ['< ₹25k', '₹25k - ₹50k', '₹50k - ₹1L', '₹1L+'];

function AdminDashboard() {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
            Manage and track all your leads in one place.
          </p>
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

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name or email..."
          />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-sm text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={budgetFilter}
            onChange={(e) => handleBudgetFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-sm text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none"
          >
            <option value="">All Budgets</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <button
            onClick={refetch}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 cursor-pointer"
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
          />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
