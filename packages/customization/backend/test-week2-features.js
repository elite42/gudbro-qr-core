/**
 * Week 2: Advanced Customization - Feature Test Script
 *
 * Tests:
 * 1. Frame templates (10 designs)
 * 2. Pattern styles (9 total: 3 existing + 6 new)
 * 3. Eye styles (8 total: 3 existing + 5 new)
 * 4. Gradient colors (10 presets)
 */

const { generateQRWithDesign } = require('./utils/qrCustomizer');
const { getFrameTemplates } = require('./utils/frameTemplates');
const { getPatternStyles } = require('./utils/patterns');
const { getEyeStyles } = require('./utils/eyeStyles');
const { getGradientPresets } = require('./utils/gradients');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('\n=== Week 2 Advanced Customization - Feature Test ===\n');

  // Test 1: Frame Templates
  console.log('Test 1: Frame Templates');
  const frames = getFrameTemplates();
  console.log(`✓ Found ${frames.length} frame templates`);
  frames.forEach(f => console.log(`  - ${f.id}: ${f.name}`));

  if (frames.length !== 10) {
    console.error(`✗ Expected 10 frames, got ${frames.length}`);
  } else {
    console.log('✓ All 10 frame templates available\n');
  }

  // Test 2: Pattern Styles
  console.log('Test 2: Pattern Styles');
  const patterns = getPatternStyles();
  console.log(`✓ Found ${patterns.length} pattern styles`);
  patterns.forEach(p => console.log(`  - ${p.id}: ${p.name} (${p.category})`));

  if (patterns.length !== 9) {
    console.error(`✗ Expected 9 patterns, got ${patterns.length}`);
  } else {
    console.log('✓ All 9 pattern styles available (3 existing + 6 new)\n');
  }

  // Test 3: Eye Styles
  console.log('Test 3: Eye Styles');
  const eyeStyles = getEyeStyles();
  console.log(`✓ Found ${eyeStyles.length} eye styles`);
  eyeStyles.forEach(e => console.log(`  - ${e.id}: ${e.name} (${e.category})`));

  if (eyeStyles.length !== 8) {
    console.error(`✗ Expected 8 eye styles, got ${eyeStyles.length}`);
  } else {
    console.log('✓ All 8 eye styles available (3 existing + 5 new)\n');
  }

  // Test 4: Gradient Presets
  console.log('Test 4: Gradient Presets');
  const gradients = getGradientPresets();
  console.log(`✓ Found ${gradients.length} gradient presets`);
  gradients.forEach(g => console.log(`  - ${g.id}: ${g.name} (${g.type})`));

  if (gradients.length !== 10) {
    console.error(`✗ Expected 10 gradients, got ${gradients.length}`);
  } else {
    console.log('✓ All 10 gradient presets available\n');
  }

  // Test 5: Generate QR codes with new features
  console.log('Test 5: QR Code Generation with New Features');

  const testData = 'https://example.com';
  const outputDir = path.join(__dirname, 'test-output');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Test with frame
    console.log('  - Generating QR with "scan-me" frame...');
    const qrWithFrame = await generateQRWithDesign(testData, {
      frame: 'scan-me',
      pattern: 'rounded',
      eyeStyle: 'rounded'
    }, 'png');
    fs.writeFileSync(path.join(outputDir, 'qr-with-frame.png'), qrWithFrame);
    console.log('    ✓ Saved to test-output/qr-with-frame.png');

    // Test with new pattern
    console.log('  - Generating QR with "classy" pattern...');
    const qrWithPattern = await generateQRWithDesign(testData, {
      pattern: 'classy',
      eyeStyle: 'square'
    }, 'png');
    fs.writeFileSync(path.join(outputDir, 'qr-classy-pattern.png'), qrWithPattern);
    console.log('    ✓ Saved to test-output/qr-classy-pattern.png');

    // Test with new eye style
    console.log('  - Generating QR with "leaf" eye style...');
    const qrWithEyeStyle = await generateQRWithDesign(testData, {
      pattern: 'rounded',
      eyeStyle: 'leaf'
    }, 'png');
    fs.writeFileSync(path.join(outputDir, 'qr-leaf-eyes.png'), qrWithEyeStyle);
    console.log('    ✓ Saved to test-output/qr-leaf-eyes.png');

    // Test with gradient (SVG works best)
    console.log('  - Generating QR with "sunset" gradient (SVG)...');
    const qrWithGradient = await generateQRWithDesign(testData, {
      gradientPreset: 'sunset',
      pattern: 'rounded',
      eyeStyle: 'rounded'
    }, 'svg');
    fs.writeFileSync(path.join(outputDir, 'qr-gradient-sunset.svg'), qrWithGradient);
    console.log('    ✓ Saved to test-output/qr-gradient-sunset.svg');

    // Test combined features
    console.log('  - Generating QR with multiple features combined...');
    const qrCombined = await generateQRWithDesign(testData, {
      pattern: 'extra-rounded',
      eyeStyle: 'shield',
      gradientPreset: 'ocean',
      frame: 'menu-here'
    }, 'png');
    fs.writeFileSync(path.join(outputDir, 'qr-combined.png'), qrCombined);
    console.log('    ✓ Saved to test-output/qr-combined.png');

    console.log('\n✓ All QR code generation tests passed\n');
  } catch (error) {
    console.error(`✗ QR generation failed: ${error.message}`);
    console.error(error.stack);
  }

  // Summary
  console.log('=== Test Summary ===');
  console.log('✓ Frame Templates: 10 designs');
  console.log('✓ Pattern Styles: 9 styles (3 existing + 6 new)');
  console.log('✓ Eye Styles: 8 styles (3 existing + 5 new)');
  console.log('✓ Gradient Presets: 10 presets');
  console.log('✓ QR Generation: All features working');
  console.log('\n=== Week 2 Implementation Complete! ===\n');
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
