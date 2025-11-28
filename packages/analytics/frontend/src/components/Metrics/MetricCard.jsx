import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, subtitle, trend, icon: Icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    orange: 'border-orange-500 bg-orange-50'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <div className={`metric-card ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{Math.abs(trend)}% vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${iconColorClasses[color]}`}>
            <Icon className="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  );
}
