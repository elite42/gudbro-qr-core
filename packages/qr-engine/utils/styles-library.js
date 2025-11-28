/**
 * Artistic QR Styles Library
 * Preset prompts for different artistic styles
 */

export const artisticStyles = {
  // Nature & Landscapes
  sunset: {
    name: 'Golden Sunset',
    prompt: 'Beautiful sunset over mountains, golden hour, dramatic clouds, vibrant orange and purple colors, masterpiece, high quality, 8k',
    negativePrompt: 'low quality, blurry, pixelated, noise',
    category: 'nature'
  },
  forest: {
    name: 'Enchanted Forest',
    prompt: 'Mystical forest with sunbeams, lush green trees, magical atmosphere, fantasy art, detailed foliage, high quality',
    negativePrompt: 'dark, scary, low quality',
    category: 'nature'
  },
  ocean: {
    name: 'Ocean Waves',
    prompt: 'Crystal clear ocean water, turquoise waves, tropical paradise, palm trees, sunny day, photorealistic',
    negativePrompt: 'stormy, dark, low quality',
    category: 'nature'
  },
  
  // Urban & Modern
  cyberpunk: {
    name: 'Cyberpunk City',
    prompt: 'Futuristic cyberpunk city, neon lights, rain reflections, purple and blue tones, high tech, dystopian, detailed, 8k',
    negativePrompt: 'daytime, bright, low quality',
    category: 'urban'
  },
  minimalist: {
    name: 'Minimalist Design',
    prompt: 'Clean minimalist design, geometric patterns, modern aesthetic, simple colors, professional, high contrast',
    negativePrompt: 'cluttered, messy, complex',
    category: 'urban'
  },
  graffiti: {
    name: 'Street Art',
    prompt: 'Vibrant street art graffiti style, colorful spray paint, urban wall, artistic, bold colors, high detail',
    negativePrompt: 'plain, boring, low quality',
    category: 'urban'
  },
  
  // Art Styles
  watercolor: {
    name: 'Watercolor Art',
    prompt: 'Soft watercolor painting, pastel colors, artistic brush strokes, dreamy atmosphere, delicate, hand painted',
    negativePrompt: 'digital, sharp, photorealistic',
    category: 'artistic'
  },
  anime: {
    name: 'Anime Style',
    prompt: 'Beautiful anime art style, vibrant colors, detailed illustration, manga aesthetic, high quality, Studio Ghibli inspired',
    negativePrompt: 'realistic, western style, low quality',
    category: 'artistic'
  },
  geometric: {
    name: 'Geometric Patterns',
    prompt: 'Abstract geometric patterns, mathematical art, symmetrical shapes, vibrant colors, modern design, high contrast',
    negativePrompt: 'organic, natural, random',
    category: 'artistic'
  },
  
  // Business & Professional
  corporate: {
    name: 'Corporate Professional',
    prompt: 'Professional corporate design, clean lines, business aesthetic, blue and white tones, modern office, high quality',
    negativePrompt: 'casual, messy, colorful',
    category: 'business'
  },
  luxury: {
    name: 'Luxury Gold',
    prompt: 'Luxury design with gold accents, elegant patterns, premium feel, black and gold, sophisticated, high end',
    negativePrompt: 'cheap, simple, plain',
    category: 'business'
  },
  
  // Food & Restaurant
  food: {
    name: 'Gourmet Food',
    prompt: 'Delicious gourmet food photography, restaurant quality, appetizing, vibrant colors, professional food styling, high detail',
    negativePrompt: 'unappetizing, low quality, bad lighting',
    category: 'food'
  },
  coffee: {
    name: 'Coffee Shop',
    prompt: 'Cozy coffee shop aesthetic, warm tones, latte art, rustic wood, inviting atmosphere, instagram worthy',
    negativePrompt: 'cold, sterile, industrial',
    category: 'food'
  },
  
  // Seasonal & Events
  christmas: {
    name: 'Christmas Theme',
    prompt: 'Festive Christmas scene, snow, decorated tree, warm lights, cozy atmosphere, red and green colors, holiday spirit',
    negativePrompt: 'summer, hot, dark',
    category: 'seasonal'
  },
  halloween: {
    name: 'Halloween Spooky',
    prompt: 'Spooky Halloween theme, pumpkins, autumn colors, mysterious atmosphere, orange and black, festive',
    negativePrompt: 'bright, cheerful, summery',
    category: 'seasonal'
  }
};

// Get style by key
export function getStyle(styleKey) {
  return artisticStyles[styleKey] || null;
}

// Get all style keys
export function getStyleKeys() {
  return Object.keys(artisticStyles);
}

// Get styles by category
export function getStylesByCategory(category) {
  return Object.entries(artisticStyles)
    .filter(([_, style]) => style.category === category)
    .reduce((acc, [key, style]) => ({ ...acc, [key]: style }), {});
}

// Get all categories
export function getCategories() {
  return [...new Set(Object.values(artisticStyles).map(s => s.category))];
}

export default artisticStyles;
