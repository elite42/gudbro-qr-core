const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { getCachedURL, cacheURL } = require('../utils/cache');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Track QR scan asynchronously (non-blocking)
 * Extracts device info from user-agent and stores scan data
 */
async function trackScanAsync(qrCodeId, req) {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    const referer = req.get('referer') || null;

    // Extract device type from user-agent (basic detection)
    let deviceType = 'desktop';
    if (/mobile/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    // Extract OS (basic detection)
    let os = 'unknown';
    if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/mac os/i.test(userAgent)) os = 'macOS';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';

    // Extract browser (basic detection)
    let browser = 'unknown';
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = 'Chrome';
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/edg/i.test(userAgent)) browser = 'Edge';

    // Extract UTM parameters from referer
    let utmSource = null;
    let utmMedium = null;
    let utmCampaign = null;
    
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        utmSource = refererUrl.searchParams.get('utm_source');
        utmMedium = refererUrl.searchParams.get('utm_medium');
        utmCampaign = refererUrl.searchParams.get('utm_campaign');
      } catch (e) {
        // Invalid referer URL, ignore
      }
    }

    // Insert scan record
    await pool.query(
      `INSERT INTO qr_scans (
        qr_code_id, ip_address, user_agent, referer,
        device_type, os, browser,
        utm_source, utm_medium, utm_campaign
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        qrCodeId, ipAddress, userAgent, referer,
        deviceType, os, browser,
        utmSource, utmMedium, utmCampaign
      ]
    );

    // Update QR code scan count
    await pool.query(
      `UPDATE qr_codes 
       SET total_scans = total_scans + 1, 
           last_scanned_at = NOW()
       WHERE id = $1`,
      [qrCodeId]
    );

    console.log(`📊 Tracked scan: ${qrCodeId} from ${deviceType}/${os}/${browser}`);

  } catch (error) {
    // Don't let tracking errors affect redirect
    console.error('⚠️  Tracking error (non-blocking):', error.message);
  }
}

/**
 * GET /:shortCode - Redirect to destination URL
 * This is the main redirect endpoint - MUST BE FAST
 */
router.get('/:shortCode', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { shortCode } = req.params;

    // Step 1: Check Redis cache (fast path)
    let destinationUrl = await getCachedURL(shortCode);

    let qrCodeId = null;

    // Step 2: If not in cache, query database
    if (!destinationUrl) {
      const result = await pool.query(
        `SELECT id, destination_url, is_active, expires_at, max_scans, total_scans 
         FROM qr_codes 
         WHERE short_code = $1`,
        [shortCode]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'QR code not found',
          short_code: shortCode
        });
      }

      const qrCode = result.rows[0];
      qrCodeId = qrCode.id;
      destinationUrl = qrCode.destination_url;

      // Check if QR is active
      if (!qrCode.is_active) {
        return res.status(410).json({
          error: 'QR code is inactive',
          short_code: shortCode
        });
      }

      // Check if expired
      if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
        return res.status(410).json({
          error: 'QR code has expired',
          short_code: shortCode,
          expired_at: qrCode.expires_at
        });
      }

      // Check max scans limit
      if (qrCode.max_scans && qrCode.total_scans >= qrCode.max_scans) {
        return res.status(410).json({
          error: 'QR code has reached maximum scans',
          short_code: shortCode,
          max_scans: qrCode.max_scans
        });
      }

      // Cache for future requests
      await cacheURL(shortCode, destinationUrl);
    } else {
      // If from cache, still need QR code ID for tracking
      // TODO: Could optimize by caching ID too
      const result = await pool.query(
        'SELECT id FROM qr_codes WHERE short_code = $1',
        [shortCode]
      );
      if (result.rows.length > 0) {
        qrCodeId = result.rows[0].id;
      }
    }

    // Step 3: Redirect immediately (don't wait for tracking)
    res.redirect(302, destinationUrl);

    const redirectTime = Date.now() - startTime;
    console.log(`⚡ Redirect: ${shortCode} → ${destinationUrl} (${redirectTime}ms)`);

    // Step 4: Track scan asynchronously (non-blocking)
    if (qrCodeId) {
      // Fire and forget - don't await
      trackScanAsync(qrCodeId, req).catch(err => {
        console.error('Tracking background error:', err.message);
      });
    }

  } catch (error) {
    console.error('Redirect error:', error);
    
    // Even on error, try to provide helpful response
    res.status(500).json({
      error: 'Redirect failed',
      message: 'An error occurred while processing the redirect'
    });
  }
});

/**
 * GET /track/stats - Get redirect performance stats
 * Useful for monitoring
 */
router.get('/track/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_qr_codes,
        SUM(total_scans) as total_scans,
        AVG(total_scans) as avg_scans_per_qr,
        COUNT(CASE WHEN is_active THEN 1 END) as active_qr_codes
      FROM qr_codes
    `);

    const stats = result.rows[0];

    res.json({
      success: true,
      stats: {
        total_qr_codes: parseInt(stats.total_qr_codes),
        total_scans: parseInt(stats.total_scans) || 0,
        avg_scans_per_qr: parseFloat(stats.avg_scans_per_qr) || 0,
        active_qr_codes: parseInt(stats.active_qr_codes)
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch stats'
    });
  }
});

module.exports = router;
