/**
 * Analytics Charts component using Chart.js and react-chartjs-2.
 * Displays:
 * 1. Status Distribution (Doughnut Chart)
 * 2. Budget Distribution (Bar Chart)
 * 3. Leads Over Time (Line Chart with Area Fill)
 */

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  getStatusDistributionAPI,
  getBudgetDistributionAPI,
  getLeadsOverTimeAPI,
} from '../services/api';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

function AnalyticsCharts() {
  const [statusData, setStatusData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [statusRes, budgetRes, timelineRes] = await Promise.all([
          getStatusDistributionAPI(),
          getBudgetDistributionAPI(),
          getLeadsOverTimeAPI(days),
        ]);
        setStatusData(statusRes.data || []);
        setBudgetData(budgetRes.data || []);
        setTimelineData(timelineRes.data || []);
      } catch (err) {
        console.error('Failed to load analytics charts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-surface-card-dark rounded-2xl p-6 border border-border dark:border-border-dark h-72 flex items-center justify-center"
          >
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  // 1. Status Doughnut Chart Setup
  const statusColorsMap = {
    New: '#3b82f6',
    Contacted: '#f59e0b',
    Closed: '#10b981',
  };

  const statusLabels = statusData.map((d) => d.status);
  const statusCounts = statusData.map((d) => d.count);
  const statusColors = statusLabels.map((s) => statusColorsMap[s] || '#6366f1');

  const doughnutData = {
    labels: statusLabels.length ? statusLabels : ['No Data'],
    datasets: [
      {
        data: statusCounts.length ? statusCounts : [1],
        backgroundColor: statusCounts.length
          ? statusColors
          : ['#e2e8f0'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // 2. Budget Bar Chart Setup
  const budgetLabels = budgetData.map((d) => d.budget);
  const budgetCounts = budgetData.map((d) => d.count);

  const barData = {
    labels: budgetLabels,
    datasets: [
      {
        label: 'Leads',
        data: budgetCounts,
        backgroundColor: '#6366f1',
        borderRadius: 8,
        hoverBackgroundColor: '#4f46e5',
      },
    ],
  };

  // 3. Leads Over Time Line Chart Setup
  const lineLabels = timelineData.map((d) => {
    const parts = d.date.split('-');
    return `${parts[2]}/${parts[1]}`;
  });
  const lineCounts = timelineData.map((d) => d.count);

  const lineChartData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Daily Leads',
        data: lineCounts,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0ea5e9',
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 14,
          font: { family: 'Inter', size: 12 },
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: 'rgba(226, 232, 240, 0.4)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: 'rgba(226, 232, 240, 0.4)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-text-primary dark:text-text-dark-primary">
            Analytics Overview
          </h2>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
            Visual breakdown of pipeline status, budget distribution, and growth trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary">
            Timeframe:
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-xs text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-surface-card-dark rounded-2xl p-5 border border-border dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-4 flex items-center gap-2">
            <span>🎯</span> Status Distribution
          </h3>
          <div className="h-56 relative flex items-center justify-center">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        {/* Budget Distribution */}
        <div className="bg-white dark:bg-surface-card-dark rounded-2xl p-5 border border-border dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-4 flex items-center gap-2">
            <span>💰</span> Leads by Budget
          </h3>
          <div className="h-56">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Leads Over Time */}
        <div className="bg-white dark:bg-surface-card-dark rounded-2xl p-5 border border-border dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-4 flex items-center gap-2">
            <span>📈</span> Leads Over Time
          </h3>
          <div className="h-56">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsCharts;
