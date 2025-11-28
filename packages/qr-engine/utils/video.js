/**
 * Video QR Code Generator
 * Link to video content
 *
 * Platforms: YouTube, Vimeo, Direct video files
 * Use Cases: Restaurant tours, dish presentations, chef videos
 */

/**
 * Detect video platform from URL
 */
const detectVideoPlatform = (url) => {
  const lower = url.toLowerCase();

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return 'youtube';
  }
  if (lower.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (lower.includes('facebook.com') || lower.includes('fb.watch')) {
    return 'facebook';
  }
  if (lower.includes('instagram.com')) {
    return 'instagram';
  }
  if (lower.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (lower.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i)) {
    return 'direct';
  }

  return 'other';
};

/**
 * Validate video URL
 */
const validateVideoUrl = (url) => {
  if (!url) {
    throw new Error('Video URL is required');
  }

  const trimmed = String(url).trim();

  if (!/^https?:\/\/.+/.test(trimmed)) {
    throw new Error('Video URL must start with http:// or https://');
  }

  return trimmed;
};

/**
 * Validate video title
 */
const validateVideoTitle = (title) => {
  if (!title) {
    return null;
  }

  const trimmed = String(title).trim();

  if (trimmed.length < 2) {
    throw new Error('Video title must be at least 2 characters');
  }

  if (trimmed.length > 200) {
    throw new Error('Video title must not exceed 200 characters');
  }

  return trimmed;
};

/**
 * Generate Video QR data
 *
 * @param {Object} options
 * @param {string} options.videoUrl - Video URL
 * @param {string} [options.videoTitle] - Video title
 * @param {string} [options.platform] - Platform override
 * @param {boolean} [options.autoplay=false] - Autoplay flag
 * @param {number} [options.startTime] - Start time in seconds
 * @returns {Object} Video QR data
 */
const generateVideoQRData = ({
  videoUrl,
  videoTitle,
  platform,
  autoplay = false,
  startTime
}) => {
  const validatedUrl = validateVideoUrl(videoUrl);
  const validatedTitle = validateVideoTitle(videoTitle);

  const detectedPlatform = platform || detectVideoPlatform(validatedUrl);

  let destinationUrl = validatedUrl;

  // Add autoplay/start time for YouTube
  if (detectedPlatform === 'youtube' && (autoplay || startTime)) {
    const url = new URL(validatedUrl);
    if (autoplay) url.searchParams.set('autoplay', '1');
    if (startTime) url.searchParams.set('t', startTime);
    destinationUrl = url.toString();
  }

  return {
    url: destinationUrl,
    videoUrl: validatedUrl,
    videoTitle: validatedTitle,
    platform: detectedPlatform,
    autoplay: autoplay || false,
    startTime: startTime || null
  };
};

/**
 * Get Video QR platform info
 */
const getVideoQRPlatformInfo = () => {
  return {
    name: 'Video QR Code',
    supportedPlatforms: [
      'YouTube',
      'Vimeo',
      'Facebook',
      'Instagram',
      'TikTok',
      'Direct video files (MP4, MOV, etc.)'
    ],
    useCases: [
      'Restaurant virtual tours',
      'Dish preparation videos',
      'Chef introductions',
      'Cooking tutorials',
      'Event highlights',
      'Promotional videos'
    ],
    features: {
      autoplay: 'YouTube autoplay support',
      startTime: 'YouTube start time parameter',
      platformDetection: 'Automatic platform detection',
      directFiles: 'Support for direct video file links'
    },
    bestPractices: [
      'Use short, engaging videos (< 2 minutes)',
      'Test video playback on mobile devices',
      'Ensure videos are publicly accessible',
      'Use descriptive titles',
      'Consider vertical video for mobile',
      'Host on reliable platforms'
    ]
  };
};

module.exports = {
  detectVideoPlatform,
  validateVideoUrl,
  validateVideoTitle,
  generateVideoQRData,
  getVideoQRPlatformInfo
};
