import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Generate QR code preview (low res for speed)
 */
export async function generatePreview(data, design) {
  const response = await api.post('/design/preview', { data, design }, {
    responseType: 'blob'
  });
  
  return URL.createObjectURL(response.data);
}

/**
 * Apply design and download high-res QR code
 */
export async function downloadQR(data, design, format = 'png') {
  const response = await api.post('/design/apply', 
    { data, design, format },
    { responseType: 'blob' }
  );

  // Create download link
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `qr-code.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Upload logo
 */
export async function uploadLogo(file) {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await api.post('/design/upload-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
}

/**
 * Get all templates
 */
export async function getTemplates() {
  const response = await api.get('/templates');
  return response.data;
}

/**
 * Get featured templates
 */
export async function getFeaturedTemplates() {
  const response = await api.get('/templates/public/featured');
  return response.data;
}

/**
 * Create new template
 */
export async function createTemplate(name, design, isPublic = false) {
  const response = await api.post('/templates', {
    name,
    design,
    isPublic
  });
  return response.data;
}

/**
 * Get template by ID
 */
export async function getTemplate(id) {
  const response = await api.get(`/templates/${id}`);
  return response.data;
}

/**
 * Update template
 */
export async function updateTemplate(id, updates) {
  const response = await api.put(`/templates/${id}`, updates);
  return response.data;
}

/**
 * Delete template
 */
export async function deleteTemplate(id) {
  await api.delete(`/templates/${id}`);
}

/**
 * Get available patterns
 */
export async function getPatterns() {
  const response = await api.get('/design/patterns');
  return response.data;
}

/**
 * Get available eye styles
 */
export async function getEyeStyles() {
  const response = await api.get('/design/eye-styles');
  return response.data;
}

export default api;
