const express = require('express');
const router = express.Router();
const { generateQRWithDesign } = require('../utils/qrCustomizer');
const {
  exportHighResPNG,
  exportPrintReadyPDF,
  exportEPS,
  createBulkZIP,
  getPrintSizes,
  validateExportOptions
} = require('../utils/exportFormats');

/**
 * Export API Routes
 * Week 3: Export Quality Implementation
 */

/**
 * POST /api/export/high-res-png
 * Export QR code as high-resolution PNG (300 DPI)
 *
 * Body:
 * {
 *   "data": "https://example.com",
 *   "design": { ... },
 *   "export": {
 *     "size": "medium",  // or customWidth/customHeight
 *     "dpi": 300
 *   }
 * }
 */
router.post('/high-res-png', async (req, res) => {
  try {
    const { data, design = {}, export: exportOptions = {} } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    // Validate export options
    const validation = validateExportOptions(exportOptions);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    // Generate base QR code
    const qrBuffer = await generateQRWithDesign(data, design, 'png');

    // Export as high-res PNG
    const highResPNG = await exportHighResPNG(qrBuffer, exportOptions);

    // Set headers
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `attachment; filename="qr-code-300dpi.png"`);
    res.send(highResPNG);
  } catch (error) {
    console.error('High-res PNG export error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/export/print-pdf
 * Export QR code as print-ready PDF with bleed margins
 *
 * Body:
 * {
 *   "data": "https://example.com",
 *   "design": { ... },
 *   "export": {
 *     "size": "medium",
 *     "bleed": 0.125,
 *     "cropMarks": true
 *   }
 * }
 */
router.post('/print-pdf', async (req, res) => {
  try {
    const { data, design = {}, export: exportOptions = {} } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    // Validate export options
    const validation = validateExportOptions(exportOptions);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    // Generate base QR code
    const qrBuffer = await generateQRWithDesign(data, design, 'png');

    // Export as print-ready PDF
    const pdf = await exportPrintReadyPDF(qrBuffer, exportOptions);

    // Set headers
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="qr-code-print-ready.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Print PDF export error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/export/eps
 * Export QR code as EPS vector format
 *
 * Body:
 * {
 *   "data": "https://example.com",
 *   "design": { ... },
 *   "export": {
 *     "width": 3,
 *     "height": 3
 *   }
 * }
 */
router.post('/eps', async (req, res) => {
  try {
    const { data, design = {}, export: exportOptions = {} } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    // Generate SVG QR code (required for EPS conversion)
    const svgBuffer = await generateQRWithDesign(data, design, 'svg');
    const svgString = svgBuffer.toString();

    // Export as EPS
    const eps = exportEPS(svgString, exportOptions);

    // Set headers
    res.set('Content-Type', 'application/postscript');
    res.set('Content-Disposition', `attachment; filename="qr-code.eps"`);
    res.send(eps);
  } catch (error) {
    console.error('EPS export error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/export/bulk
 * Export multiple QR codes as ZIP archive
 *
 * Body:
 * {
 *   "qrCodes": [
 *     {
 *       "name": "qr1",
 *       "data": "https://example.com/1",
 *       "design": { ... }
 *     },
 *     {
 *       "name": "qr2",
 *       "data": "https://example.com/2",
 *       "design": { ... }
 *     }
 *   ],
 *   "export": {
 *     "formats": ["png", "svg", "pdf"],
 *     "folderStructure": "by-format",
 *     "pngOptions": { "size": "medium" }
 *   }
 * }
 */
router.post('/bulk', async (req, res) => {
  try {
    const { qrCodes, export: exportOptions = {} } = req.body;

    if (!qrCodes || !Array.isArray(qrCodes) || qrCodes.length === 0) {
      return res.status(400).json({ error: 'qrCodes array is required' });
    }

    if (qrCodes.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 QR codes per bulk export' });
    }

    const {
      formats = ['png', 'svg'],
      folderStructure = 'flat',
      pngOptions = {}
    } = exportOptions;

    // Generate all QR codes in requested formats
    const generatedQRs = [];

    for (let i = 0; i < qrCodes.length; i++) {
      const { name, data, design = {} } = qrCodes[i];

      if (!data) {
        continue; // Skip invalid entries
      }

      const qrName = name || `qr-code-${i + 1}`;

      // Generate in each requested format
      for (const format of formats) {
        try {
          let buffer;

          if (format === 'png') {
            // Generate base PNG
            const basePNG = await generateQRWithDesign(data, design, 'png');
            // Optionally apply high-res export
            if (pngOptions.size || pngOptions.dpi) {
              buffer = await exportHighResPNG(basePNG, pngOptions);
            } else {
              buffer = basePNG;
            }
          } else if (format === 'svg') {
            buffer = await generateQRWithDesign(data, design, 'svg');
          } else if (format === 'pdf') {
            const basePNG = await generateQRWithDesign(data, design, 'png');
            buffer = await exportPrintReadyPDF(basePNG, pngOptions);
          } else if (format === 'eps') {
            const svgBuffer = await generateQRWithDesign(data, design, 'svg');
            const eps = exportEPS(svgBuffer.toString(), pngOptions);
            buffer = Buffer.from(eps);
          } else {
            continue; // Skip unknown formats
          }

          generatedQRs.push({
            name: qrName,
            buffer,
            format
          });
        } catch (error) {
          console.error(`Error generating QR ${i + 1} in ${format}:`, error);
          // Continue with other QR codes
        }
      }
    }

    if (generatedQRs.length === 0) {
      return res.status(400).json({ error: 'No QR codes could be generated' });
    }

    // Create ZIP archive
    const zipBuffer = await createBulkZIP(generatedQRs, { folderStructure });

    // Set headers
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="qr-codes-bulk-export.zip"`);
    res.send(zipBuffer);
  } catch (error) {
    console.error('Bulk export error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/export/print-sizes
 * Get available print sizes with pixel dimensions
 */
router.get('/print-sizes', (req, res) => {
  try {
    const sizes = getPrintSizes();
    res.json({ sizes });
  } catch (error) {
    console.error('Print sizes fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/export/formats
 * Get available export formats and their capabilities
 */
router.get('/formats', (req, res) => {
  try {
    const formats = [
      {
        id: 'png',
        name: 'PNG',
        description: 'Raster image format',
        features: ['High-resolution', '300 DPI', 'Transparent background'],
        useCases: ['Web', 'Print', 'Email'],
        maxSize: 'banner (12x12 in)'
      },
      {
        id: 'svg',
        name: 'SVG',
        description: 'Scalable vector format',
        features: ['Infinite scalability', 'Small file size', 'Editable'],
        useCases: ['Web', 'Design tools', 'Large prints'],
        maxSize: 'Unlimited'
      },
      {
        id: 'pdf',
        name: 'PDF',
        description: 'Print-ready PDF with bleed',
        features: ['Print-ready', 'Bleed margins', 'Crop marks'],
        useCases: ['Professional printing', 'Packaging', 'Marketing materials'],
        maxSize: 'banner (12x12 in)'
      },
      {
        id: 'eps',
        name: 'EPS',
        description: 'Encapsulated PostScript vector',
        features: ['Vector format', 'Design tool compatible', 'Print industry standard'],
        useCases: ['Adobe Illustrator', 'CorelDRAW', 'Professional design'],
        maxSize: 'Unlimited'
      }
    ];

    res.json({ formats });
  } catch (error) {
    console.error('Formats fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
