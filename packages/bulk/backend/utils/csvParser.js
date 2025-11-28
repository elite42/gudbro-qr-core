/**
 * CSV Parser
 * Parse CSV files for bulk QR generation
 */

const fs = require('fs');
const csv = require('csv-parser');
const { URL } = require('url');

/**
 * Parse CSV file and validate data
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} Array of QR code data
 */
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let lineNumber = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        lineNumber++;
        
        try {
          // Validate and clean row data
          const qrData = validateRow(row, lineNumber);
          if (qrData) {
            results.push(qrData);
          }
        } catch (error) {
          errors.push({
            line: lineNumber,
            error: error.message,
            row: row
          });
        }
      })
      .on('end', () => {
        if (errors.length > 0 && results.length === 0) {
          // All rows failed validation
          reject(new Error(`CSV validation failed. ${errors.length} errors found. First error: ${errors[0].error}`));
        } else {
          // Return valid results (ignoring invalid rows)
          console.log(`CSV parsed: ${results.length} valid rows, ${errors.length} errors`);
          if (errors.length > 0) {
            console.warn('Errors found in CSV:', errors);
          }
          resolve(results);
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
}

/**
 * Validate a single CSV row
 * @param {Object} row - CSV row object
 * @param {number} lineNumber - Line number in CSV
 * @returns {Object|null} Validated QR data or null if invalid
 */
function validateRow(row, lineNumber) {
  // Required field: destination_url
  if (!row.destination_url || row.destination_url.trim() === '') {
    throw new Error(`Line ${lineNumber}: destination_url is required`);
  }

  // Validate URL format
  const url = row.destination_url.trim();
  if (!isValidURL(url)) {
    throw new Error(`Line ${lineNumber}: Invalid URL format: ${url}`);
  }

  // Build QR data object
  return {
    destination_url: url,
    title: (row.title || '').trim() || `QR ${lineNumber}`,
    folder: (row.folder || '').trim() || null,
    description: (row.description || '').trim() || null,
    // Store original line number for error reporting
    _lineNumber: lineNumber
  };
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidURL(url) {
  try {
    const parsed = new URL(url);
    // Allow http and https protocols only
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Generate CSV from QR data array
 * @param {Array} qrData - Array of QR code objects with results
 * @returns {string} CSV string
 */
function generateResultsCSV(qrData) {
  // CSV header
  let csv = 'destination_url,title,folder,description,short_code,short_url,qr_image_url,status,error\n';
  
  // Add each row
  for (const qr of qrData) {
    const row = [
      escapeCsvValue(qr.destination_url),
      escapeCsvValue(qr.title || ''),
      escapeCsvValue(qr.folder || ''),
      escapeCsvValue(qr.description || ''),
      escapeCsvValue(qr.short_code || ''),
      escapeCsvValue(qr.short_url || ''),
      escapeCsvValue(qr.qr_image_url || ''),
      escapeCsvValue(qr.status || 'unknown'),
      escapeCsvValue(qr.error || '')
    ];
    csv += row.join(',') + '\n';
  }
  
  return csv;
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    // Escape internal quotes by doubling them
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Validate CSV structure before processing
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Object>} Validation result
 */
async function validateCSV(filePath) {
  return new Promise((resolve, reject) => {
    let hasHeader = false;
    let requiredColumns = ['destination_url'];
    let foundColumns = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        hasHeader = true;
        foundColumns = headers;
        
        // Check for required columns
        const hasRequired = requiredColumns.every(col => 
          headers.includes(col)
        );
        
        if (!hasRequired) {
          reject(new Error(`CSV missing required column: destination_url`));
        }
      })
      .on('end', () => {
        if (!hasHeader) {
          reject(new Error('CSV file has no header row'));
        } else {
          resolve({
            valid: true,
            columns: foundColumns
          });
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

module.exports = {
  parseCSV,
  validateRow,
  isValidURL,
  generateResultsCSV,
  escapeCsvValue,
  validateCSV
};
