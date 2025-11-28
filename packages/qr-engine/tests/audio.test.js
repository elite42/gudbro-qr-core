/**
 * Audio QR Code - Unit Tests
 *
 * Tests for Audio QR codes
 * Platforms: Spotify, Apple Music, SoundCloud, YouTube Music, Direct files
 * Use Cases: Restaurant playlists, background music, podcasts
 */

const {
  detectAudioPlatform,
  validateAudioUrl,
  validateAudioTitle,
  validateArtistName,
  validateAudioType,
  generateAudioQRData,
  getAudioQRPlatformInfo
} = require('../utils/audio');

describe('Audio QR Code', () => {
  describe('detectAudioPlatform', () => {
    test('should detect Spotify URLs', () => {
      expect(detectAudioPlatform('https://open.spotify.com/track/abc123')).toBe('spotify');
      expect(detectAudioPlatform('https://spotify.com/playlist/abc123')).toBe('spotify');
      expect(detectAudioPlatform('https://open.spotify.com/album/xyz')).toBe('spotify');
    });

    test('should detect Apple Music URLs', () => {
      expect(detectAudioPlatform('https://music.apple.com/us/album/abc')).toBe('apple-music');
      expect(detectAudioPlatform('https://itunes.apple.com/album/abc')).toBe('apple-music');
    });

    test('should detect SoundCloud URLs', () => {
      expect(detectAudioPlatform('https://soundcloud.com/artist/track')).toBe('soundcloud');
      expect(detectAudioPlatform('https://www.soundcloud.com/artist')).toBe('soundcloud');
    });

    test('should detect YouTube Music URLs', () => {
      expect(detectAudioPlatform('https://music.youtube.com/watch?v=abc')).toBe('youtube-music');
      expect(detectAudioPlatform('https://music.youtube.com/playlist?list=xyz')).toBe('youtube-music');
    });

    test('should detect Deezer URLs', () => {
      expect(detectAudioPlatform('https://www.deezer.com/track/123')).toBe('deezer');
      expect(detectAudioPlatform('https://deezer.com/playlist/456')).toBe('deezer');
    });

    test('should detect Tidal URLs', () => {
      expect(detectAudioPlatform('https://tidal.com/browse/track/123')).toBe('tidal');
      expect(detectAudioPlatform('https://www.tidal.com/album/456')).toBe('tidal');
    });

    test('should detect direct audio files', () => {
      expect(detectAudioPlatform('https://example.com/song.mp3')).toBe('direct');
      expect(detectAudioPlatform('https://example.com/audio.wav')).toBe('direct');
      expect(detectAudioPlatform('https://example.com/music.ogg')).toBe('direct');
      expect(detectAudioPlatform('https://example.com/track.m4a')).toBe('direct');
      expect(detectAudioPlatform('https://example.com/audio.flac')).toBe('direct');
      expect(detectAudioPlatform('https://example.com/song.aac')).toBe('direct');
      expect(detectAudioPlatform('https://example.com/audio.wma')).toBe('direct');
    });

    test('should detect direct audio files case-insensitively', () => {
      expect(detectAudioPlatform('https://example.com/song.MP3')).toBe('direct');
      expect(detectAudioPlatform('https://example.com/audio.WAV')).toBe('direct');
    });

    test('should return "other" for unknown platforms', () => {
      expect(detectAudioPlatform('https://example.com/audio')).toBe('other');
      expect(detectAudioPlatform('https://bandcamp.com/track/abc')).toBe('other');
    });

    test('should be case-insensitive', () => {
      expect(detectAudioPlatform('HTTPS://OPEN.SPOTIFY.COM/track/abc')).toBe('spotify');
      expect(detectAudioPlatform('HTTPS://SOUNDCLOUD.COM/artist')).toBe('soundcloud');
    });
  });

  describe('validateAudioUrl', () => {
    test('should accept valid audio URLs', () => {
      expect(validateAudioUrl('https://open.spotify.com/track/abc123'))
        .toBe('https://open.spotify.com/track/abc123');
      expect(validateAudioUrl('http://example.com/song.mp3'))
        .toBe('http://example.com/song.mp3');
    });

    test('should trim whitespace', () => {
      expect(validateAudioUrl('  https://spotify.com/track/abc  '))
        .toBe('https://spotify.com/track/abc');
    });

    test('should reject invalid URLs', () => {
      expect(() => validateAudioUrl('spotify.com/track/abc')).toThrow('http://');
      expect(() => validateAudioUrl('ftp://example.com/audio.mp3')).toThrow('http://');
      expect(() => validateAudioUrl('')).toThrow('Audio URL is required');
      expect(() => validateAudioUrl(null)).toThrow('Audio URL is required');
    });
  });

  describe('validateAudioTitle', () => {
    test('should accept valid audio titles', () => {
      expect(validateAudioTitle('My Favorite Playlist')).toBe('My Favorite Playlist');
      expect(validateAudioTitle('Jazz Evening')).toBe('Jazz Evening');
      expect(validateAudioTitle('Podcast Episode 1')).toBe('Podcast Episode 1');
    });

    test('should return null for empty values', () => {
      expect(validateAudioTitle(undefined)).toBeNull();
      expect(validateAudioTitle(null)).toBeNull();
      expect(validateAudioTitle('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateAudioTitle('  Audio Title  ')).toBe('Audio Title');
    });

    test('should reject titles that are too short', () => {
      expect(() => validateAudioTitle('A')).toThrow('at least 2 characters');
    });

    test('should reject titles that are too long', () => {
      const longTitle = 'A'.repeat(201);
      expect(() => validateAudioTitle(longTitle)).toThrow('not exceed 200 characters');
    });
  });

  describe('validateArtistName', () => {
    test('should accept valid artist names', () => {
      expect(validateArtistName('The Beatles')).toBe('The Beatles');
      expect(validateArtistName('Miles Davis')).toBe('Miles Davis');
      expect(validateArtistName('Various Artists')).toBe('Various Artists');
    });

    test('should return null for empty values', () => {
      expect(validateArtistName(undefined)).toBeNull();
      expect(validateArtistName(null)).toBeNull();
      expect(validateArtistName('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateArtistName('  Artist Name  ')).toBe('Artist Name');
    });

    test('should reject names that are too short', () => {
      expect(() => validateArtistName('A')).toThrow('at least 2 characters');
    });

    test('should reject names that are too long', () => {
      const longName = 'A'.repeat(101);
      expect(() => validateArtistName(longName)).toThrow('not exceed 100 characters');
    });
  });

  describe('validateAudioType', () => {
    test('should accept valid audio types', () => {
      expect(validateAudioType('track')).toBe('track');
      expect(validateAudioType('album')).toBe('album');
      expect(validateAudioType('playlist')).toBe('playlist');
      expect(validateAudioType('podcast')).toBe('podcast');
      expect(validateAudioType('artist')).toBe('artist');
    });

    test('should normalize to lowercase', () => {
      expect(validateAudioType('TRACK')).toBe('track');
      expect(validateAudioType('Album')).toBe('album');
      expect(validateAudioType('PLAYLIST')).toBe('playlist');
    });

    test('should return null for empty values', () => {
      expect(validateAudioType(undefined)).toBeNull();
      expect(validateAudioType(null)).toBeNull();
      expect(validateAudioType('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateAudioType('  track  ')).toBe('track');
    });

    test('should reject invalid audio types', () => {
      expect(() => validateAudioType('video')).toThrow('must be one of');
      expect(() => validateAudioType('song')).toThrow('must be one of');
    });
  });

  describe('generateAudioQRData', () => {
    test('should generate Audio QR data with minimum required fields', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://open.spotify.com/track/abc123'
      });

      expect(result.url).toBe('https://open.spotify.com/track/abc123');
      expect(result.audioUrl).toBe('https://open.spotify.com/track/abc123');
      expect(result.platform).toBe('spotify');
      expect(result.audioTitle).toBeNull();
      expect(result.artistName).toBeNull();
      expect(result.audioType).toBeNull();
      expect(result.duration).toBeNull();
    });

    test('should generate Audio QR data with all fields', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://open.spotify.com/track/abc123',
        audioTitle: 'My Favorite Song',
        artistName: 'The Beatles',
        audioType: 'track',
        duration: 180
      });

      expect(result.audioUrl).toBe('https://open.spotify.com/track/abc123');
      expect(result.audioTitle).toBe('My Favorite Song');
      expect(result.artistName).toBe('The Beatles');
      expect(result.platform).toBe('spotify');
      expect(result.audioType).toBe('track');
      expect(result.duration).toBe(180);
    });

    test('should detect Spotify platform automatically', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://open.spotify.com/playlist/xyz'
      });

      expect(result.platform).toBe('spotify');
    });

    test('should detect Apple Music platform automatically', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://music.apple.com/us/album/abc'
      });

      expect(result.platform).toBe('apple-music');
    });

    test('should detect SoundCloud platform automatically', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://soundcloud.com/artist/track'
      });

      expect(result.platform).toBe('soundcloud');
    });

    test('should detect YouTube Music platform automatically', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://music.youtube.com/watch?v=abc'
      });

      expect(result.platform).toBe('youtube-music');
    });

    test('should detect direct audio files automatically', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://example.com/song.mp3'
      });

      expect(result.platform).toBe('direct');
    });

    test('should respect platform override', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://example.com/audio',
        platform: 'spotify'
      });

      expect(result.platform).toBe('spotify');
    });

    test('should handle playlist type', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://open.spotify.com/playlist/abc',
        audioTitle: 'Restaurant Background Music',
        audioType: 'playlist'
      });

      expect(result.audioType).toBe('playlist');
      expect(result.audioTitle).toBe('Restaurant Background Music');
    });

    test('should handle podcast type', () => {
      const result = generateAudioQRData({
        audioUrl: 'https://open.spotify.com/episode/abc',
        audioTitle: 'Cooking Tips Episode 5',
        audioType: 'podcast'
      });

      expect(result.audioType).toBe('podcast');
    });

    test('should validate audio URL', () => {
      expect(() => generateAudioQRData({
        audioUrl: 'invalid-url'
      })).toThrow('http://');
    });

    test('should validate audio title', () => {
      expect(() => generateAudioQRData({
        audioUrl: 'https://spotify.com/track/abc',
        audioTitle: 'A'
      })).toThrow('at least 2 characters');
    });

    test('should validate artist name', () => {
      expect(() => generateAudioQRData({
        audioUrl: 'https://spotify.com/track/abc',
        artistName: 'A'
      })).toThrow('at least 2 characters');
    });

    test('should validate audio type', () => {
      expect(() => generateAudioQRData({
        audioUrl: 'https://spotify.com/track/abc',
        audioType: 'invalid'
      })).toThrow('must be one of');
    });
  });

  describe('getAudioQRPlatformInfo', () => {
    test('should return platform information', () => {
      const info = getAudioQRPlatformInfo();

      expect(info).toHaveProperty('name', 'Audio QR Code');
      expect(info).toHaveProperty('supportedPlatforms');
      expect(info).toHaveProperty('useCases');
      expect(info).toHaveProperty('audioTypes');
      expect(info).toHaveProperty('bestPractices');
    });

    test('should list all supported platforms', () => {
      const info = getAudioQRPlatformInfo();

      expect(Array.isArray(info.supportedPlatforms)).toBe(true);
      const platformNames = info.supportedPlatforms.map(p => p.name);
      expect(platformNames).toContain('Spotify');
      expect(platformNames).toContain('Apple Music');
      expect(platformNames).toContain('SoundCloud');
      expect(platformNames).toContain('YouTube Music');
    });

    test('should include platform formats', () => {
      const info = getAudioQRPlatformInfo();

      const spotifyPlatform = info.supportedPlatforms.find(p => p.name === 'Spotify');
      expect(spotifyPlatform).toHaveProperty('format');
      expect(spotifyPlatform).toHaveProperty('types');
    });

    test('should describe audio types', () => {
      const info = getAudioQRPlatformInfo();

      expect(info.audioTypes).toHaveProperty('track');
      expect(info.audioTypes).toHaveProperty('album');
      expect(info.audioTypes).toHaveProperty('playlist');
      expect(info.audioTypes).toHaveProperty('podcast');
      expect(info.audioTypes).toHaveProperty('artist');
    });

    test('should include use cases', () => {
      const info = getAudioQRPlatformInfo();

      expect(Array.isArray(info.useCases)).toBe(true);
      expect(info.useCases.length).toBeGreaterThan(0);
    });

    test('should include restaurant-specific use cases', () => {
      const info = getAudioQRPlatformInfo();

      expect(info).toHaveProperty('restaurantUseCases');
      expect(Array.isArray(info.restaurantUseCases)).toBe(true);
    });

    test('should include best practices', () => {
      const info = getAudioQRPlatformInfo();

      expect(Array.isArray(info.bestPractices)).toBe(true);
      expect(info.bestPractices.length).toBeGreaterThan(0);
    });
  });
});
