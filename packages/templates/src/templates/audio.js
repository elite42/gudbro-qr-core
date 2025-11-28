/**
 * Audio Template
 * Generates QR codes for audio files (MP3, Spotify, Apple Music)
 */

export const audioTemplate = {
  type: 'audio',
  name: 'Audio/Music',
  icon: '🎵',
  description: 'Link to audio file, podcast, or music',
  
  fields: [
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      required: true,
      options: [
        { value: 'file', label: 'Audio File (MP3, WAV)' },
        { value: 'spotify', label: 'Spotify' },
        { value: 'applemusic', label: 'Apple Music' },
        { value: 'soundcloud', label: 'SoundCloud' },
        { value: 'custom', label: 'Custom URL' }
      ]
    },
    {
      name: 'audioUrl',
      label: 'Audio URL',
      type: 'text',
      required: true,
      placeholder: 'https://example.com/audio.mp3',
      hint: 'For file: direct MP3/WAV URL. For Spotify/Apple Music: track/album/playlist URL',
      validation: (value) => {
        try {
          const url = new URL(value);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      }
    },
    {
      name: 'title',
      label: 'Title (optional)',
      type: 'text',
      required: false,
      placeholder: 'Song/Podcast Title',
      maxLength: 100
    },
    {
      name: 'artist',
      label: 'Artist/Creator (optional)',
      type: 'text',
      required: false,
      placeholder: 'Artist Name',
      maxLength: 100
    }
  ],

  generate: (data) => {
    const { platform, audioUrl } = data;
    
    if (!platform || !audioUrl) {
      throw new Error('Platform and audio URL are required');
    }

    // Validate URL
    try {
      new URL(audioUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    // For all platforms, just return the URL
    // The QR code will link directly to the audio
    return audioUrl;
  },

  example: {
    platform: 'spotify',
    audioUrl: 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
    title: 'Mr. Brightside',
    artist: 'The Killers'
  }
};

