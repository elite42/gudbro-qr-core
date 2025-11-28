import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch complete analytics overview
 */
export const fetchAnalytics = async (qrCodeId, params = {}) => {
  const { data } = await api.get(`/qr/${qrCodeId}/analytics`, { params });
  return data;
};

/**
 * Fetch timeline data (scans over time)
 */
export const fetchTimeline = async (qrCodeId, params = {}) => {
  const { data } = await api.get(`/qr/${qrCodeId}/analytics/timeline`, { params });
  return data;
};

/**
 * Fetch geographic breakdown
 */
export const fetchGeoData = async (qrCodeId, params = {}) => {
  const { data } = await api.get(`/qr/${qrCodeId}/analytics/geo`, { params });
  return data;
};

/**
 * Fetch device statistics
 */
export const fetchDeviceData = async (qrCodeId, params = {}) => {
  const { data } = await api.get(`/qr/${qrCodeId}/analytics/devices`, { params });
  return data;
};

/**
 * Export analytics data
 */
export const exportAnalytics = async (qrCodeId, format = 'csv', params = {}) => {
  const response = await api.get(`/qr/${qrCodeId}/analytics/export`, {
    params: { ...params, format },
    responseType: format === 'csv' ? 'blob' : 'json'
  });
  
  if (format === 'csv') {
    // Create download link for CSV
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `qr-analytics-${qrCodeId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
  
  return response.data;
};

/**
 * Fetch QR code list
 */
export const fetchQRCodes = async (params = {}) => {
  const { data } = await api.get('/qr', { params });
  return data;
};

/**
 * Fetch single QR code details
 */
export const fetchQRCode = async (qrCodeId) => {
  const { data } = await api.get(`/qr/${qrCodeId}`);
  return data;
};

export default api;
