# Readability Test - Documentation

## Overview

Automatic QR code readability testing across device types to ensure scannability before delivery to customer.

## How It Works

**3-tier device simulation:**
1. **Modern** (iPhone 12+, Android 2020+) - No blur
2. **Mid-range** (iPhone 8-11, Android 2017-2019) - Slight blur (1px)
3. **Old** (iPhone 6-7, Android 2015-2016) - More blur (2px)

**Scoring:**
- Scan all 3 tiers
- Score = (passed / 3) × 100
- Grade: A (90+), B (70-89), C (50-69), F (<50)

**Auto-retry:**
- If score < 70 on first attempt
- Increases `conditioningScale` by 0.3
- Retries generation once
- Returns best result

## API Usage

```bash
# With quality check (default)
curl -X POST /qr/artistic \
  -d '{
    "url": "https://gudbro.com",
    "style": "sunset",
    "qualityCheck": true
  }'

# Without quality check (faster, no guarantee)
curl -X POST /qr/artistic \
  -d '{
    "url": "https://gudbro.com",
    "style": "sunset",
    "qualityCheck": false
  }'
```

## Response Format

```json
{
  "status": "completed",
  "result": {
    "gcsUrl": "https://storage.googleapis.com/...",
    "readability": {
      "score": 100,
      "grade": "A",
      "passedTests": 3,
      "totalTests": 3,
      "results": [
        {
          "device": "modern",
          "deviceName": "iPhone 12+ / Android 2020+",
          "success": true,
          "confidence": 100
        },
        {
          "device": "mid-range",
          "deviceName": "iPhone 8-11 / Android 2017-2019",
          "success": true,
          "confidence": 100
        },
        {
          "device": "old",
          "deviceName": "iPhone 6-7 / Android 2015-2016",
          "success": true,
          "confidence": 100
        }
      ],
      "recommendation": "Excellent readability across all devices. Safe for printing."
    },
    "attempts": 1
  }
}
```

## Grades Explained

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90-100 | Perfect - works on all devices |
| B | 70-89 | Good - works on modern devices |
| C | 50-69 | Limited - may fail on old phones |
| F | 0-49 | Poor - unreliable |

## Cost Impact

- **With quality check:** 8-15 seconds, may cost 2× if retry needed
- **Without:** 5-10 seconds, standard cost

**Recommendation:** Always enable for paid customers.

## Customer Display

```javascript
// Show badge based on grade
const badges = {
  A: { color: 'green', text: '✓ Excellent Readability' },
  B: { color: 'blue', text: '✓ Good Readability' },
  C: { color: 'yellow', text: '⚠ Limited Readability' },
  F: { color: 'red', text: '✗ Poor Readability' }
};
```

## Troubleshooting

**All tests fail:**
- Check if QR URL is correct in result
- Verify image not corrupted
- Try simpler style

**Only old devices fail:**
- Normal for complex artistic styles
- Grade B still acceptable for most use cases

**Retry not triggered:**
- Retry only happens if score < 70
- Check `qualityCheck: true` in request
- Review worker logs

---

**Version:** 1.0  
**Added:** Module 8 v1.1
