/**
 * Video QR Code - Unit Tests
 *
 * Tests for Video QR codes
 * Platforms: YouTube, Vimeo, Facebook, Instagram, TikTok, Direct files
 * Use Cases: Restaurant tours, dish presentations, chef videos
 */

const {
  detectVideoPlatform,
  validateVideoUrl,
  validateVideoTitle,
  generateVideoQRData,
  getVideoQRPlatformInfo
} = require('../utils/video');

describe('Video QR Code', () => {
  describe('detectVideoPlatform', () => {
    test('should detect YouTube URLs', () => {
      expect(detectVideoPlatform('https://www.youtube.com/watch?v=abc123')).toBe('youtube');
      expect(detectVideoPlatform('https://youtube.com/watch?v=abc123')).toBe('youtube');
      expect(detectVideoPlatform('https://youtu.be/abc123')).toBe('youtube');
      expect(detectVideoPlatform('https://m.youtube.com/watch?v=abc123')).toBe('youtube');
    });

    test('should detect Vimeo URLs', () => {
      expect(detectVideoPlatform('https://vimeo.com/123456789')).toBe('vimeo');
      expect(detectVideoPlatform('https://www.vimeo.com/123456789')).toBe('vimeo');
      expect(detectVideoPlatform('https://player.vimeo.com/video/123456789')).toBe('vimeo');
    });

    test('should detect Facebook URLs', () => {
      expect(detectVideoPlatform('https://www.facebook.com/watch?v=123456789')).toBe('facebook');
      expect(detectVideoPlatform('https://facebook.com/video.php?v=123')).toBe('facebook');
      expect(detectVideoPlatform('https://fb.watch/abc123')).toBe('facebook');
    });

    test('should detect Instagram URLs', () => {
      expect(detectVideoPlatform('https://www.instagram.com/p/abc123/')).toBe('instagram');
      expect(detectVideoPlatform('https://instagram.com/reel/abc123/')).toBe('instagram');
    });

    test('should detect TikTok URLs', () => {
      expect(detectVideoPlatform('https://www.tiktok.com/@user/video/123')).toBe('tiktok');
      expect(detectVideoPlatform('https://tiktok.com/@user/video/123')).toBe('tiktok');
    });

    test('should detect direct video files', () => {
      expect(detectVideoPlatform('https://example.com/video.mp4')).toBe('direct');
      expect(detectVideoPlatform('https://example.com/video.mov')).toBe('direct');
      expect(detectVideoPlatform('https://example.com/video.avi')).toBe('direct');
      expect(detectVideoPlatform('https://example.com/video.wmv')).toBe('direct');
      expect(detectVideoPlatform('https://example.com/video.flv')).toBe('direct');
      expect(detectVideoPlatform('https://example.com/video.webm')).toBe('direct');
    });

    test('should detect direct video files case-insensitively', () => {
      expect(detectVideoPlatform('https://example.com/video.MP4')).toBe('direct');
      expect(detectVideoPlatform('https://example.com/video.MOV')).toBe('direct');
    });

    test('should return "other" for unknown platforms', () => {
      expect(detectVideoPlatform('https://example.com/video')).toBe('other');
      expect(detectVideoPlatform('https://dailymotion.com/video/abc')).toBe('other');
    });

    test('should be case-insensitive', () => {
      expect(detectVideoPlatform('HTTPS://WWW.YOUTUBE.COM/watch?v=abc')).toBe('youtube');
      expect(detectVideoPlatform('HTTPS://VIMEO.COM/123')).toBe('vimeo');
    });
  });

  describe('validateVideoUrl', () => {
    test('should accept valid video URLs', () => {
      expect(validateVideoUrl('https://www.youtube.com/watch?v=abc123'))
        .toBe('https://www.youtube.com/watch?v=abc123');
      expect(validateVideoUrl('http://example.com/video.mp4'))
        .toBe('http://example.com/video.mp4');
    });

    test('should trim whitespace', () => {
      expect(validateVideoUrl('  https://www.youtube.com/watch?v=abc123  '))
        .toBe('https://www.youtube.com/watch?v=abc123');
    });

    test('should reject invalid URLs', () => {
      expect(() => validateVideoUrl('youtube.com/watch?v=abc')).toThrow('http://');
      expect(() => validateVideoUrl('ftp://example.com/video.mp4')).toThrow('http://');
      expect(() => validateVideoUrl('')).toThrow('Video URL is required');
      expect(() => validateVideoUrl(null)).toThrow('Video URL is required');
    });
  });

  describe('validateVideoTitle', () => {
    test('should accept valid video titles', () => {
      expect(validateVideoTitle('How to Make Pho')).toBe('How to Make Pho');
      expect(validateVideoTitle('Restaurant Tour 2024')).toBe('Restaurant Tour 2024');
      expect(validateVideoTitle('Chef Introduction')).toBe('Chef Introduction');
    });

    test('should return null for empty values', () => {
      expect(validateVideoTitle(undefined)).toBeNull();
      expect(validateVideoTitle(null)).toBeNull();
      expect(validateVideoTitle('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateVideoTitle('  Video Title  ')).toBe('Video Title');
    });

    test('should reject titles that are too short', () => {
      expect(() => validateVideoTitle('A')).toThrow('at least 2 characters');
    });

    test('should reject titles that are too long', () => {
      const longTitle = 'A'.repeat(201);
      expect(() => validateVideoTitle(longTitle)).toThrow('not exceed 200 characters');
    });
  });

  describe('generateVideoQRData', () => {
    test('should generate Video QR data with minimum required fields', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://www.youtube.com/watch?v=abc123'
      });

      expect(result.url).toBe('https://www.youtube.com/watch?v=abc123');
      expect(result.videoUrl).toBe('https://www.youtube.com/watch?v=abc123');
      expect(result.platform).toBe('youtube');
      expect(result.videoTitle).toBeNull();
      expect(result.autoplay).toBe(false);
      expect(result.startTime).toBeNull();
    });

    test('should generate Video QR data with all fields', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        videoTitle: 'How to Make Pho',
        autoplay: true,
        startTime: 30
      });

      expect(result.videoUrl).toBe('https://www.youtube.com/watch?v=abc123');
      expect(result.videoTitle).toBe('How to Make Pho');
      expect(result.platform).toBe('youtube');
      expect(result.autoplay).toBe(true);
      expect(result.startTime).toBe(30);
    });

    test('should detect YouTube platform automatically', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://youtu.be/abc123'
      });

      expect(result.platform).toBe('youtube');
    });

    test('should detect Vimeo platform automatically', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://vimeo.com/123456789'
      });

      expect(result.platform).toBe('vimeo');
    });

    test('should detect Facebook platform automatically', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://fb.watch/abc123'
      });

      expect(result.platform).toBe('facebook');
    });

    test('should detect Instagram platform automatically', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://www.instagram.com/reel/abc123/'
      });

      expect(result.platform).toBe('instagram');
    });

    test('should detect TikTok platform automatically', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://www.tiktok.com/@user/video/123'
      });

      expect(result.platform).toBe('tiktok');
    });

    test('should detect direct video files automatically', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://example.com/presentation.mp4'
      });

      expect(result.platform).toBe('direct');
    });

    test('should respect platform override', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://example.com/video',
        platform: 'vimeo'
      });

      expect(result.platform).toBe('vimeo');
    });

    test('should add autoplay parameter for YouTube', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        autoplay: true
      });

      expect(result.url).toContain('autoplay=1');
      expect(result.autoplay).toBe(true);
    });

    test('should add start time parameter for YouTube', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        startTime: 60
      });

      expect(result.url).toContain('t=60');
      expect(result.startTime).toBe(60);
    });

    test('should add both autoplay and start time for YouTube', () => {
      const result = generateVideoQRData({
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        autoplay: true,
        startTime: 30
      });

      expect(result.url).toContain('autoplay=1');
      expect(result.url).toContain('t=30');
    });

    test('should not modify URL for non-YouTube platforms with autoplay', () => {
      const vimeoUrl = 'https://vimeo.com/123456789';
      const result = generateVideoQRData({
        videoUrl: vimeoUrl,
        autoplay: true
      });

      expect(result.url).toBe(vimeoUrl);
      expect(result.autoplay).toBe(true); // Stored but not applied to URL
    });

    test('should validate video URL', () => {
      expect(() => generateVideoQRData({
        videoUrl: 'invalid-url'
      })).toThrow('http://');
    });

    test('should validate video title', () => {
      expect(() => generateVideoQRData({
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        videoTitle: 'A'
      })).toThrow('at least 2 characters');
    });

    test('should handle complex YouTube URLs', () => {
      const complexUrl = 'https://www.youtube.com/watch?v=abc123&feature=share&list=PLxxx';
      const result = generateVideoQRData({
        videoUrl: complexUrl,
        autoplay: true
      });

      expect(result.url).toContain('autoplay=1');
      expect(result.url).toContain('v=abc123');
    });
  });

  describe('getVideoQRPlatformInfo', () => {
    test('should return platform information', () => {
      const info = getVideoQRPlatformInfo();

      expect(info).toHaveProperty('name', 'Video QR Code');
      expect(info).toHaveProperty('supportedPlatforms');
      expect(info).toHaveProperty('useCases');
      expect(info).toHaveProperty('features');
      expect(info).toHaveProperty('bestPractices');
    });

    test('should list all supported platforms', () => {
      const info = getVideoQRPlatformInfo();

      expect(Array.isArray(info.supportedPlatforms)).toBe(true);
      expect(info.supportedPlatforms).toContain('YouTube');
      expect(info.supportedPlatforms).toContain('Vimeo');
      expect(info.supportedPlatforms).toContain('Facebook');
      expect(info.supportedPlatforms).toContain('Instagram');
      expect(info.supportedPlatforms).toContain('TikTok');
    });

    test('should include use cases', () => {
      const info = getVideoQRPlatformInfo();

      expect(Array.isArray(info.useCases)).toBe(true);
      expect(info.useCases.length).toBeGreaterThan(0);
    });

    test('should describe YouTube-specific features', () => {
      const info = getVideoQRPlatformInfo();

      expect(info.features).toHaveProperty('autoplay');
      expect(info.features).toHaveProperty('startTime');
      expect(info.features.autoplay).toContain('YouTube');
      expect(info.features.startTime).toContain('YouTube');
    });

    test('should include platform detection feature', () => {
      const info = getVideoQRPlatformInfo();

      expect(info.features).toHaveProperty('platformDetection');
    });

    test('should support direct video files', () => {
      const info = getVideoQRPlatformInfo();

      expect(info.features).toHaveProperty('directFiles');
    });

    test('should include best practices', () => {
      const info = getVideoQRPlatformInfo();

      expect(Array.isArray(info.bestPractices)).toBe(true);
      expect(info.bestPractices.length).toBeGreaterThan(0);
    });
  });
});
