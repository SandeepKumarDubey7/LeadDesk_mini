/**
 * Custom hook for managing leads data.
 * Handles fetching, searching, filtering, and pagination.
 */

import { useState, useEffect, useCallback } from 'react';
import { getLeadsAPI, searchLeadsAPI, getDashboardStatsAPI } from '../services/api';

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const limit = 10;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (searchQuery || statusFilter || budgetFilter) {
        data = await searchLeadsAPI({
          q: searchQuery,
          status: statusFilter,
          budget: budgetFilter,
          page,
          limit,
        });
      } else {
        data = await getLeadsAPI(page, limit);
      }
      setLeads(data.leads || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, budgetFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStatsAPI();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleBudgetFilter = useCallback((budget) => {
    setBudgetFilter(budget);
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  return {
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
  };
}
