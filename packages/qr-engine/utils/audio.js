/**
 * Audio QR Code Generator
 * Link to audio content on various platforms
 *
 * Platforms: Spotify, Apple Music, SoundCloud, YouTube Music, Direct audio files
 * Use Cases: Restaurant playlists, background music, podcasts, audio guides
 */

/**
 * Detect audio platform from URL
 */
const detectAudioPlatform = (url) => {
  const lower = url.toLowerCase();

  if (lower.includes('spotify.com')) {
    return 'spotify';
  }
  if (lower.includes('music.apple.com') || lower.includes('itunes.apple.com')) {
    return 'apple-music';
  }
  if (lower.includes('soundcloud.com')) {
    return 'soundcloud';
  }
  if (lower.includes('music.youtube.com')) {
    return 'youtube-music';
  }
  if (lower.includes('deezer.com')) {
    return 'deezer';
  }
  if (lower.includes('tidal.com')) {
    return 'tidal';
  }
  if (lower.match(/\.(mp3|wav|ogg|m4a|flac|aac|wma)$/i)) {
    return 'direct';
  }

  return 'other';
};

/**
 * Validate audio URL
 */
const validateAudioUrl = (url) => {
  if (!url) {
    throw new Error('Audio URL is required');
  }

  const trimmed = String(url).trim();

  if (!/^https?:\/\/.+/.test(trimmed)) {
    throw new Error('Audio URL must start with http:// or https://');
  }

  return trimmed;
};

/**
 * Validate audio title
 */
const validateAudioTitle = (title) => {
  if (!title) {
    return null;
  }

  const trimmed = String(title).trim();

  if (trimmed.length < 2) {
    throw new Error('Audio title must be at least 2 characters');
  }

  if (trimmed.length > 200) {
    throw new Error('Audio title must not exceed 200 characters');
  }

  return trimmed;
};

/**
 * Validate artist name
 */
const validateArtistName = (artist) => {
  if (!artist) {
    return null;
  }

  const trimmed = String(artist).trim();

  if (trimmed.length < 2) {
    throw new Error('Artist name must be at least 2 characters');
  }

  if (trimmed.length > 100) {
    throw new Error('Artist name must not exceed 100 characters');
  }

  return trimmed;
};

/**
 * Validate audio type
 */
const validateAudioType = (type) => {
  if (!type) {
    return null;
  }

  const validTypes = ['track', 'album', 'playlist', 'podcast', 'artist'];
  const trimmed = String(type).trim().toLowerCase();

  if (!validTypes.includes(trimmed)) {
    throw new Error(`Audio type must be one of: ${validTypes.join(', ')}`);
  }

  return trimmed;
};

/**
 * Generate Audio QR data
 *
 * @param {Object} options
 * @param {string} options.audioUrl - Audio URL
 * @param {string} [options.audioTitle] - Audio title (track/album/playlist name)
 * @param {string} [options.artistName] - Artist name
 * @param {string} [options.platform] - Platform override
 * @param {string} [options.audioType] - Type: track, album, playlist, podcast, artist
 * @param {number} [options.duration] - Duration in seconds
 * @returns {Object} Audio QR data
 */
const generateAudioQRData = ({
  audioUrl,
  audioTitle,
  artistName,
  platform,
  audioType,
  duration
}) => {
  const validatedUrl = validateAudioUrl(audioUrl);
  const validatedTitle = validateAudioTitle(audioTitle);
  const validatedArtist = validateArtistName(artistName);
  const validatedType = validateAudioType(audioType);

  const detectedPlatform = platform || detectAudioPlatform(validatedUrl);

  // For Spotify, we could add additional parameters if needed
  let destinationUrl = validatedUrl;

  return {
    url: destinationUrl,
    audioUrl: validatedUrl,
    audioTitle: validatedTitle,
    artistName: validatedArtist,
    platform: detectedPlatform,
    audioType: validatedType,
    duration: duration || null
  };
};

/**
 * Get Audio QR platform info
 */
const getAudioQRPlatformInfo = () => {
  return {
    name: 'Audio QR Code',
    supportedPlatforms: [
      {
        name: 'Spotify',
        format: 'https://open.spotify.com/track/...',
        types: ['track', 'album', 'playlist', 'artist', 'podcast']
      },
      {
        name: 'Apple Music',
        format: 'https://music.apple.com/...',
        types: ['track', 'album', 'playlist', 'artist']
      },
      {
        name: 'SoundCloud',
        format: 'https://soundcloud.com/...',
        types: ['track', 'playlist', 'artist']
      },
      {
        name: 'YouTube Music',
        format: 'https://music.youtube.com/...',
        types: ['track', 'album', 'playlist', 'artist']
      },
      {
        name: 'Deezer',
        format: 'https://www.deezer.com/...',
        types: ['track', 'album', 'playlist', 'artist']
      },
      {
        name: 'Tidal',
        format: 'https://tidal.com/...',
        types: ['track', 'album', 'playlist', 'artist']
      },
      {
        name: 'Direct audio files',
        format: 'Direct URL to MP3, WAV, OGG, M4A, FLAC, etc.',
        types: ['direct']
      }
    ],
    useCases: [
      'Restaurant background music playlists',
      'Curated dining atmosphere playlists',
      'Chef\'s favorite music',
      'Event soundtracks',
      'Audio guides for museums/galleries',
      'Podcast episodes',
      'Artist/band promotion',
      'Music album releases'
    ],
    audioTypes: {
      track: 'Single song/track',
      album: 'Full album',
      playlist: 'Curated playlist',
      podcast: 'Podcast episode or series',
      artist: 'Artist profile'
    },
    bestPractices: [
      'Use public/shareable links',
      'Test playback on mobile devices',
      'Consider regional availability',
      'Use descriptive titles',
      'Include artist name when applicable',
      'For restaurants: create mood-specific playlists',
      'Update playlists regularly to keep fresh',
      'Ensure audio content is appropriate for audience'
    ],
    restaurantUseCases: [
      'Brunch playlist QR on table tents',
      'Evening dinner ambiance playlist',
      'Happy hour music selection',
      'Cultural/regional music themes',
      'Chef\'s music picks',
      'Live performance recordings'
    ]
  };
};

module.exports = {
  detectAudioPlatform,
  validateAudioUrl,
  validateAudioTitle,
  validateArtistName,
  validateAudioType,
  generateAudioQRData,
  getAudioQRPlatformInfo
};
