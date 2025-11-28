/**
 * Video Template
 * Generates QR codes for video links (YouTube, Vimeo)
 */

export const videoTemplate = {
  type: 'video',
  name: 'Video',
  icon: '🎥',
  description: 'Link to a video (YouTube, Vimeo, etc)',
  
  fields: [
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      required: true,
      options: [
        { value: 'youtube', label: 'YouTube' },
        { value: 'vimeo', label: 'Vimeo' },
        { value: 'custom', label: 'Custom URL' }
      ]
    },
    {
      name: 'videoId',
      label: 'Video ID / URL',
      type: 'text',
      required: true,
      placeholder: 'dQw4w9WgXcQ',
      hint: 'For YouTube: video ID (e.g., dQw4w9WgXcQ). For Vimeo: video ID. For custom: full URL'
    }
  ],

  generate: (data) => {
    const { platform, videoId } = data;
    
    if (!platform || !videoId) {
      throw new Error('Platform and video ID are required');
    }

    if (platform === 'youtube') {
      // Extract video ID if full URL is provided
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = videoId.match(youtubeRegex);
      const id = match ? match[1] : videoId;
      
      return `https://www.youtube.com/watch?v=${id}`;
    }

    if (platform === 'vimeo') {
      // Extract video ID if full URL is provided
      const vimeoRegex = /vimeo\.com\/(\d+)/;
      const match = videoId.match(vimeoRegex);
      const id = match ? match[1] : videoId;
      
      return `https://vimeo.com/${id}`;
    }

    if (platform === 'custom') {
      // Validate URL
      try {
        new URL(videoId);
        return videoId;
      } catch {
        throw new Error('Invalid URL');
      }
    }

    throw new Error('Invalid platform');
  },

  example: {
    platform: 'youtube',
    videoId: 'dQw4w9WgXcQ'
  }
};

