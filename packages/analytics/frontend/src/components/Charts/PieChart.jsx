import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data, title, dataKey = 'device_type' }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-12 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const colors = [
    'rgb(59, 130, 246)',   // blue
    'rgb(139, 92, 246)',   // purple
    'rgb(34, 197, 94)',    // green
    'rgb(249, 115, 22)',   // orange
    'rgb(239, 68, 68)',    // red
    'rgb(236, 72, 153)',   // pink
    'rgb(20, 184, 166)',   // teal
    'rgb(251, 191, 36)',   // yellow
  ];

  const chartData = {
    labels: data.map(item => {
      const key = item[dataKey] || item.os || item.browser || 'Unknown';
      return key.charAt(0).toUpperCase() + key.slice(1);
    }),
    datasets: [
      {
        label: 'Scans',
        data: data.map(item => item.count || item.scans),
        backgroundColor: colors.slice(0, data.length),
        borderColor: '#ffffff',
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ height: '300px' }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
