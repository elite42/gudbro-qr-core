import React from 'react';
import { MapPin } from 'lucide-react';

export default function GeoTable({ data, title = "Top Locations" }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          {title}
        </h3>
        <div className="text-center py-12 text-gray-500">
          No geographic data available
        </div>
      </div>
    );
  }

  // Calculate total for percentage bars
  const total = data.reduce((sum, item) => sum + (item.scans || item.count || 0), 0);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <MapPin className="w-5 h-5 mr-2" />
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scans
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distribution
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => {
              const scans = item.scans || item.count || 0;
              const percentage = ((scans / total) * 100).toFixed(1);
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {item.city ? `${item.city}, ${item.country}` : item.country}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{scans.toLocaleString()}</div>
                    {item.unique_visitors && (
                      <div className="text-xs text-gray-500">
                        {item.unique_visitors.toLocaleString()} unique
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700 min-w-[50px]">
                        {percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
