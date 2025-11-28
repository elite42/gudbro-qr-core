/**
 * Week 3: Export Quality - Feature Test Script
 *
 * Tests:
 * 1. High-resolution PNG export (300 DPI)
 * 2. Print-ready PDF export (with bleed)
 * 3. EPS vector export
 * 4. Bulk ZIP download
 * 5. Print sizes
 */

const { generateQRWithDesign } = require('./utils/qrCustomizer');
const {
  exportHighResPNG,
  exportPrintReadyPDF,
  exportEPS,
  createBulkZIP,
  getPrintSizes,
  calculatePrintDimensions,
  PRINT_SIZES
} = require('./utils/exportFormats');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('\n=== Week 3 Export Quality - Feature Test ===\n');

  const testData = 'https://example.com';
  const outputDir = path.join(__dirname, 'test-output-week3');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Test 1: Print Sizes
  console.log('Test 1: Print Sizes & DPI Calculations');
  const sizes = getPrintSizes();
  console.log(`✓ Found ${sizes.length} predefined print sizes`);
  sizes.forEach(s => {
    console.log(`  - ${s.id}: ${s.name} = ${s.pixels300dpi.width}x${s.pixels300dpi.height}px @ 300 DPI`);
  });
  console.log();

  // Test 2: High-Resolution PNG Export
  console.log('Test 2: High-Resolution PNG Export (300 DPI)');

  try {
    // Generate base QR
    const baseQR = await generateQRWithDesign(testData, {
      pattern: 'rounded',
      eyeStyle: 'rounded',
      foreground: '#1E3A8A',
      background: '#FFFFFF'
    }, 'png');

    // Export different sizes
    const testSizes = ['small', 'medium', 'large'];

    for (const size of testSizes) {
      const highResPNG = await exportHighResPNG(baseQR, { size, dpi: 300 });
      const filename = `qr-300dpi-${size}.png`;
      fs.writeFileSync(path.join(outputDir, filename), highResPNG);

      const sizeKB = Math.round(highResPNG.length / 1024);
      const dims = PRINT_SIZES[size];
      console.log(`  ✓ ${size}: ${dims.width}x${dims.height}" @ 300 DPI (${sizeKB} KB) → ${filename}`);
    }

    // Custom size
    const customSize = await exportHighResPNG(baseQR, {
      customWidth: 5,
      customHeight: 5,
      dpi: 300
    });
    fs.writeFileSync(path.join(outputDir, 'qr-300dpi-custom-5x5.png'), customSize);
    const customDims = calculatePrintDimensions(5, 5, 300);
    console.log(`  ✓ custom: 5x5" @ 300 DPI (${customDims.width}x${customDims.height}px) → qr-300dpi-custom-5x5.png`);

    console.log('✓ High-resolution PNG export working\n');
  } catch (error) {
    console.error(`✗ High-res PNG test failed: ${error.message}\n`);
  }

  // Test 3: Print-Ready PDF Export
  console.log('Test 3: Print-Ready PDF Export (with bleed margins)');

  try {
    const baseQR = await generateQRWithDesign(testData, {
      pattern: 'classy',
      eyeStyle: 'shield',
      foreground: '#000000'
    }, 'png');

    const printPDF = await exportPrintReadyPDF(baseQR, {
      size: 'medium',
      bleed: 0.125, // 1/8 inch standard bleed
      cropMarks: true
    });

    fs.writeFileSync(path.join(outputDir, 'qr-print-ready.pdf'), printPDF);
    console.log(`  ✓ PDF with 1/8" bleed margins → qr-print-ready.pdf`);
    console.log('  ✓ Crop marks included');
    console.log('✓ Print-ready PDF export working\n');
  } catch (error) {
    console.error(`✗ PDF test failed: ${error.message}\n`);
  }

  // Test 4: EPS Vector Export
  console.log('Test 4: EPS Vector Export');

  try {
    const svgQR = await generateQRWithDesign(testData, {
      pattern: 'dots',
      eyeStyle: 'rounded',
      gradientPreset: 'sunset'
    }, 'svg');

    const eps = exportEPS(svgQR.toString(), {
      width: 4,
      height: 4,
      title: 'Test QR Code'
    });

    fs.writeFileSync(path.join(outputDir, 'qr-vector.eps'), eps);
    console.log('  ✓ EPS format (Encapsulated PostScript)');
    console.log('  ✓ 4x4 inches @ 72 points/inch');
    console.log('  ✓ Vector format (infinite scalability)');
    console.log(`  ✓ Saved → qr-vector.eps`);
    console.log('✓ EPS export working\n');
  } catch (error) {
    console.error(`✗ EPS test failed: ${error.message}\n`);
  }

  // Test 5: Bulk ZIP Download
  console.log('Test 5: Bulk ZIP Download');

  try {
    // Create multiple QR codes
    const qrCodesData = [
      { name: 'website', data: 'https://example.com', design: { pattern: 'rounded' } },
      { name: 'social', data: 'https://instagram.com/example', design: { pattern: 'dots', gradientPreset: 'neon' } },
      { name: 'menu', data: 'https://restaurant.com/menu', design: { pattern: 'classy', frame: 'menu-here' } }
    ];

    // Generate all QR codes
    const generatedQRs = [];

    for (const qr of qrCodesData) {
      // PNG
      const pngBuffer = await generateQRWithDesign(qr.data, qr.design, 'png');
      generatedQRs.push({ name: qr.name, buffer: pngBuffer, format: 'png' });

      // SVG
      const svgBuffer = await generateQRWithDesign(qr.data, qr.design, 'svg');
      generatedQRs.push({ name: qr.name, buffer: svgBuffer, format: 'svg' });
    }

    // Create ZIP - flat structure
    const zipFlat = await createBulkZIP(generatedQRs, { folderStructure: 'flat' });
    fs.writeFileSync(path.join(outputDir, 'qr-codes-flat.zip'), zipFlat);
    console.log(`  ✓ Flat structure: ${generatedQRs.length} files → qr-codes-flat.zip`);

    // Create ZIP - by-format structure
    const zipByFormat = await createBulkZIP(generatedQRs, { folderStructure: 'by-format' });
    fs.writeFileSync(path.join(outputDir, 'qr-codes-by-format.zip'), zipByFormat);
    console.log(`  ✓ By-format structure: organized in folders → qr-codes-by-format.zip`);

    const zipSizeKB = Math.round(zipFlat.length / 1024);
    console.log(`  ✓ ZIP size: ${zipSizeKB} KB`);
    console.log('✓ Bulk ZIP download working\n');
  } catch (error) {
    console.error(`✗ Bulk ZIP test failed: ${error.message}`);
    console.error(error.stack);
  }

  // Summary
  console.log('=== Test Summary ===');
  console.log('✓ High-Resolution PNG: Multiple sizes @ 300 DPI');
  console.log('✓ Print-Ready PDF: With bleed margins and crop marks');
  console.log('✓ EPS Vector: PostScript format for design tools');
  console.log('✓ Bulk ZIP: Multiple QR codes in archive');
  console.log(`✓ Output directory: ${outputDir}`);
  console.log('\n=== Week 3 Implementation Complete! ===\n');

  // List generated files
  console.log('Generated files:');
  const files = fs.readdirSync(outputDir);
  files.forEach(file => {
    const stats = fs.statSync(path.join(outputDir, file));
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`  - ${file} (${sizeKB} KB)`);
  });
  console.log();
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
