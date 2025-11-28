/**
 * PDF QR Code Generator
 * Direct link to PDF files
 *
 * Use Cases:
 * - Restaurant menus
 * - Brochures
 * - Wine lists
 * - Information sheets
 * - Downloadable content
 */

/**
 * Validate PDF URL
 */
const validatePdfUrl = (url) => {
  if (!url) {
    throw new Error('PDF URL is required');
  }

  const trimmed = String(url).trim();

  // Must be a valid URL
  if (!/^https?:\/\/.+/.test(trimmed)) {
    throw new Error('PDF URL must start with http:// or https://');
  }

  // Warn if doesn't end with .pdf (but don't fail - could be dynamic URL)
  if (!trimmed.toLowerCase().endsWith('.pdf') && !trimmed.includes('pdf')) {
    console.warn('Warning: URL does not appear to be a PDF file');
  }

  return trimmed;
};

/**
 * Validate PDF title (optional)
 */
const validatePdfTitle = (title) => {
  if (!title) {
    return null;
  }

  const trimmed = String(title).trim();

  if (trimmed.length < 2) {
    throw new Error('PDF title must be at least 2 characters');
  }

  if (trimmed.length > 200) {
    throw new Error('PDF title must not exceed 200 characters');
  }

  return trimmed;
};

/**
 * Validate download flag
 */
const validateDownload = (download) => {
  if (download === undefined || download === null) {
    return false; // Default: view in browser
  }

  return Boolean(download);
};

/**
 * Generate PDF QR data
 *
 * @param {Object} options
 * @param {string} options.pdfUrl - PDF file URL
 * @param {string} [options.pdfTitle] - PDF title/description
 * @param {boolean} [options.download=false] - Force download vs view in browser
 * @param {number} [options.fileSize] - File size in bytes (for metadata)
 * @returns {Object} PDF QR data
 */
const generatePdfQRData = ({
  pdfUrl,
  pdfTitle,
  download = false,
  fileSize
}) => {
  // Validate inputs
  const validatedUrl = validatePdfUrl(pdfUrl);
  const validatedTitle = validatePdfTitle(pdfTitle);
  const validatedDownload = validateDownload(download);

  // For download mode, we could add download parameter
  // Some servers respect: ?download=1 or use Content-Disposition header
  let destinationUrl = validatedUrl;

  // Add download hint if requested (works with some servers)
  if (validatedDownload && !validatedUrl.includes('download=')) {
    const separator = validatedUrl.includes('?') ? '&' : '?';
    destinationUrl = `${validatedUrl}${separator}download=1`;
  }

  return {
    url: destinationUrl,
    pdfUrl: validatedUrl,
    pdfTitle: validatedTitle,
    download: validatedDownload,
    fileSize: fileSize || null,
    note: validatedDownload
      ? 'Download mode enabled (works with compatible servers)'
      : 'Opens PDF in browser'
  };
};

/**
 * Get PDF QR platform info
 */
const getPdfQRPlatformInfo = () => {
  return {
    name: 'PDF QR Code',
    useCases: [
      'Restaurant menus (downloadable)',
      'Wine lists',
      'Brochures and flyers',
      'Information sheets',
      'Nutrition information',
      'Event programs',
      'Price lists'
    ],
    features: {
      viewMode: 'Opens PDF in browser for viewing',
      downloadMode: 'Forces download to device (server-dependent)',
      fileSize: 'Optional file size metadata',
      title: 'Optional PDF title/description'
    },
    bestPractices: [
      'Host PDFs on reliable CDN or server',
      'Optimize PDF file size for mobile (< 5MB recommended)',
      'Use descriptive PDF titles',
      'Test on both iOS and Android',
      'Consider responsive PDF design',
      'Use HTTPS for secure delivery'
    ],
    supportedHosts: [
      'Direct server URLs',
      'Google Drive (public links)',
      'Dropbox (public links)',
      'AWS S3',
      'Custom CDN'
    ]
  };
};

module.exports = {
  validatePdfUrl,
  validatePdfTitle,
  validateDownload,
  generatePdfQRData,
  getPdfQRPlatformInfo
};
