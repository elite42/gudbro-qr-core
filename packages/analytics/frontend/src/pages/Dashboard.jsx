import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';
import MetricCard from '../components/Metrics/MetricCard';
import LineChart from '../components/Charts/LineChart';
import PieChart from '../components/Charts/PieChart';
import GeoTable from '../components/Charts/GeoTable';
import { fetchAnalytics, fetchTimeline, exportAnalytics } from '../utils/api';
import { format, subDays } from 'date-fns';

export default function Dashboard() {
  const { id } = useParams();
  const [dateRange, setDateRange] = useState({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd')
  });

  // Fetch analytics overview
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['analytics', id, dateRange],
    queryFn: () => fetchAnalytics(id, dateRange),
    refetchInterval: 60000 // Refetch every minute
  });

  // Fetch timeline data
  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline', id, dateRange],
    queryFn: () => fetchTimeline(id, { ...dateRange, granularity: 'day' }),
    refetchInterval: 60000
  });

  const handleExport = async (format) => {
    try {
      await exportAnalytics(id, format, dateRange);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleRefresh = () => {
    refetchAnalytics();
  };

  if (analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  const overview = analytics.overview || {};
  const qrCode = analytics.qr_code || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                Analytics: {qrCode.title || qrCode.short_code}
              </h1>
              <p className="mt-1 text-sm text-gray-500 truncate">
                {qrCode.destination_url}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <label className="text-sm text-gray-600 mr-2">From:</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              />
            </div>
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2">To:</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Scans"
            value={overview.total_scans || 0}
            icon={BarChart3}
            color="blue"
            subtitle={`${overview.avg_scans_per_day || 0} avg/day`}
          />
          <MetricCard
            title="Unique Visitors"
            value={overview.unique_visitors || 0}
            icon={Users}
            color="purple"
          />
          <MetricCard
            title="Today's Scans"
            value={overview.today_scans || 0}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            title="Peak Hour"
            value={overview.peak_hour !== null ? `${overview.peak_hour}:00` : 'N/A'}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Timeline Chart */}
        <div className="mb-8">
          {!timelineLoading && timeline?.data ? (
            <LineChart data={timeline.data} title="Scans Over Time" />
          ) : (
            <div className="card">
              <div className="text-center py-12 text-gray-500">
                Loading timeline data...
              </div>
            </div>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PieChart 
            data={analytics.devices || []} 
            title="Device Breakdown"
            dataKey="device_type"
          />
          <PieChart 
            data={analytics.operating_systems || []} 
            title="Operating Systems"
            dataKey="os"
          />
        </div>

        {/* Browser Stats */}
        <div className="mb-8">
          <PieChart 
            data={analytics.browsers || []} 
            title="Top Browsers"
            dataKey="browser"
          />
        </div>

        {/* Geographic Data */}
        <div>
          <GeoTable 
            data={analytics.top_countries || []} 
            title="Top Locations"
          />
        </div>
      </div>
    </div>
  );
}
