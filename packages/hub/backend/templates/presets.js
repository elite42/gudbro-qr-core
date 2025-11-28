// Module 9: Hub Template Presets Library

export const TEMPLATE_PRESETS = {
  // 1. RESTAURANT
  restaurant: {
    name: 'Restaurant',
    category: 'hospitality',
    description: 'Perfect for restaurants, bistros, and dining establishments',
    icon: 'utensils',
    theme: {
      primaryColor: '#d32f2f',
      secondaryColor: '#ffffff',
      backgroundColor: '#fafafa',
      textColor: '#212121',
      fontFamily: 'Playfair Display',
      borderRadius: '12px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'book-open', label: 'View Menu', url: 'https://example.com/menu' },
      { type: 'url', icon: 'calendar', label: 'Reserve a Table', url: 'https://example.com/booking' },
      { type: 'url', icon: 'map-pin', label: 'Get Directions', url: 'https://maps.google.com' },
      { type: 'phone', icon: 'phone', label: 'Call Us', url: 'tel:+1234567890' },
      { type: 'social', icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/restaurant' },
      { type: 'url', icon: 'star', label: 'Leave a Review', url: 'https://g.page/r/restaurant/review' },
      { type: 'url', icon: 'wifi', label: 'WiFi Access', url: '#' }
    ]
  },

  // 2. HOTEL
  hotel: {
    name: 'Hotel',
    category: 'hospitality',
    description: 'Ideal for hotels, resorts, and accommodations',
    icon: 'hotel',
    theme: {
      primaryColor: '#1976d2',
      secondaryColor: '#ffffff',
      backgroundColor: '#f5f5f5',
      textColor: '#424242',
      fontFamily: 'Lato',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'calendar-check', label: 'Check In / Check Out', url: 'https://example.com/checkin' },
      { type: 'url', icon: 'home', label: 'Room Service', url: 'tel:+1234567890' },
      { type: 'url', icon: 'dumbbell', label: 'Amenities & Services', url: 'https://example.com/amenities' },
      { type: 'url', icon: 'map-pin', label: 'Hotel Location', url: 'https://maps.google.com' },
      { type: 'url', icon: 'phone', label: 'Concierge', url: 'tel:+1234567890' },
      { type: 'url', icon: 'wifi', label: 'WiFi Info', url: '#' },
      { type: 'url', icon: 'star', label: 'Rate Your Stay', url: 'https://example.com/review' }
    ]
  },

  // 3. EVENT
  event: {
    name: 'Event',
    category: 'events',
    description: 'Great for conferences, concerts, and gatherings',
    icon: 'calendar',
    theme: {
      primaryColor: '#7b1fa2',
      secondaryColor: '#ffffff',
      backgroundColor: '#fafafa',
      textColor: '#212121',
      fontFamily: 'Montserrat',
      borderRadius: '10px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'calendar', label: 'Event Schedule', url: 'https://example.com/schedule' },
      { type: 'url', icon: 'users', label: 'Speakers & Guests', url: 'https://example.com/speakers' },
      { type: 'url', icon: 'map-pin', label: 'Venue Location', url: 'https://maps.google.com' },
      { type: 'url', icon: 'ticket', label: 'Get Tickets', url: 'https://example.com/tickets' },
      { type: 'url', icon: 'download', label: 'Event App', url: 'https://example.com/app' },
      { type: 'social', icon: 'twitter', label: 'Event Updates', url: 'https://twitter.com/event' },
      { type: 'url', icon: 'wifi', label: 'WiFi Access', url: '#' }
    ]
  },

  // 4. PERSONAL
  personal: {
    name: 'Personal',
    category: 'professional',
    description: 'Personal brand and portfolio showcase',
    icon: 'user',
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontFamily: 'Inter',
      borderRadius: '6px',
      buttonStyle: 'minimal'
    },
    defaultLinks: [
      { type: 'url', icon: 'briefcase', label: 'Portfolio', url: 'https://example.com/portfolio' },
      { type: 'social', icon: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/username' },
      { type: 'social', icon: 'github', label: 'GitHub', url: 'https://github.com/username' },
      { type: 'email', icon: 'mail', label: 'Email Me', url: 'mailto:hello@example.com' },
      { type: 'url', icon: 'file-text', label: 'Resume/CV', url: 'https://example.com/cv.pdf' },
      { type: 'social', icon: 'twitter', label: 'Twitter', url: 'https://twitter.com/username' }
    ]
  },

  // 5. RETAIL
  retail: {
    name: 'Retail Store',
    category: 'business',
    description: 'Perfect for shops, boutiques, and retail businesses',
    icon: 'shopping-bag',
    theme: {
      primaryColor: '#f57c00',
      secondaryColor: '#ffffff',
      backgroundColor: '#fff8e1',
      textColor: '#424242',
      fontFamily: 'Poppins',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'shopping-cart', label: 'Shop Online', url: 'https://example.com/shop' },
      { type: 'url', icon: 'tag', label: 'Current Deals', url: 'https://example.com/deals' },
      { type: 'url', icon: 'map-pin', label: 'Store Location', url: 'https://maps.google.com' },
      { type: 'url', icon: 'clock', label: 'Store Hours', url: 'https://example.com/hours' },
      { type: 'url', icon: 'credit-card', label: 'Loyalty Program', url: 'https://example.com/loyalty' },
      { type: 'social', icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/store' },
      { type: 'phone', icon: 'phone', label: 'Contact Us', url: 'tel:+1234567890' }
    ]
  },

  // 6. REAL ESTATE
  realestate: {
    name: 'Real Estate',
    category: 'business',
    description: 'For property listings and real estate marketing',
    icon: 'home',
    theme: {
      primaryColor: '#2e7d32',
      secondaryColor: '#ffffff',
      backgroundColor: '#f1f8e9',
      textColor: '#1b5e20',
      fontFamily: 'Roboto',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'home', label: 'Property Details', url: 'https://example.com/property' },
      { type: 'url', icon: 'image', label: 'Photo Gallery', url: 'https://example.com/gallery' },
      { type: 'url', icon: 'video', label: 'Virtual Tour', url: 'https://example.com/tour' },
      { type: 'url', icon: 'map-pin', label: 'Location & Map', url: 'https://maps.google.com' },
      { type: 'url', icon: 'file-text', label: 'Property Brochure', url: 'https://example.com/brochure.pdf' },
      { type: 'phone', icon: 'phone', label: 'Schedule Viewing', url: 'tel:+1234567890' },
      { type: 'email', icon: 'mail', label: 'Contact Agent', url: 'mailto:agent@example.com' }
    ]
  },

  // 7. HEALTHCARE
  healthcare: {
    name: 'Healthcare',
    category: 'professional',
    description: 'Medical practices, clinics, and health services',
    icon: 'heart-pulse',
    theme: {
      primaryColor: '#0277bd',
      secondaryColor: '#ffffff',
      backgroundColor: '#e1f5fe',
      textColor: '#01579b',
      fontFamily: 'Open Sans',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'calendar', label: 'Book Appointment', url: 'https://example.com/booking' },
      { type: 'url', icon: 'map-pin', label: 'Clinic Location', url: 'https://maps.google.com' },
      { type: 'phone', icon: 'phone', label: 'Call Office', url: 'tel:+1234567890' },
      { type: 'phone', icon: 'phone-call', label: 'Emergency Line', url: 'tel:+1234567890' },
      { type: 'url', icon: 'file-text', label: 'Patient Portal', url: 'https://example.com/portal' },
      { type: 'url', icon: 'info', label: 'Services & Info', url: 'https://example.com/services' },
      { type: 'url', icon: 'shield-check', label: 'Insurance Accepted', url: 'https://example.com/insurance' }
    ]
  },

  // 8. EDUCATION
  education: {
    name: 'Education',
    category: 'professional',
    description: 'Schools, courses, and educational institutions',
    icon: 'graduation-cap',
    theme: {
      primaryColor: '#1565c0',
      secondaryColor: '#ffffff',
      backgroundColor: '#e3f2fd',
      textColor: '#0d47a1',
      fontFamily: 'Nunito',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'book-open', label: 'Course Catalog', url: 'https://example.com/courses' },
      { type: 'url', icon: 'user-plus', label: 'Enroll Now', url: 'https://example.com/enroll' },
      { type: 'url', icon: 'calendar', label: 'Academic Calendar', url: 'https://example.com/calendar' },
      { type: 'url', icon: 'download', label: 'Resources & Materials', url: 'https://example.com/resources' },
      { type: 'url', icon: 'mail', label: 'Contact Admissions', url: 'mailto:admissions@example.com' },
      { type: 'url', icon: 'map-pin', label: 'Campus Location', url: 'https://maps.google.com' }
    ]
  },

  // 9. GENERIC BUSINESS
  business: {
    name: 'Business',
    category: 'business',
    description: 'General purpose business landing page',
    icon: 'briefcase',
    theme: {
      primaryColor: '#37474f',
      secondaryColor: '#ffffff',
      backgroundColor: '#eceff1',
      textColor: '#263238',
      fontFamily: 'Inter',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'globe', label: 'Website', url: 'https://example.com' },
      { type: 'url', icon: 'briefcase', label: 'Services', url: 'https://example.com/services' },
      { type: 'url', icon: 'users', label: 'About Us', url: 'https://example.com/about' },
      { type: 'phone', icon: 'phone', label: 'Call Us', url: 'tel:+1234567890' },
      { type: 'email', icon: 'mail', label: 'Email', url: 'mailto:info@example.com' },
      { type: 'social', icon: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/business' }
    ]
  },

  // 10. BLANK
  blank: {
    name: 'Blank Template',
    category: 'other',
    description: 'Start from scratch with a blank canvas',
    icon: 'layout',
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontFamily: 'Inter',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: []
  },

  // 11. FITNESS/GYM
  fitness: {
    name: 'Fitness/Gym',
    category: 'health',
    description: 'Gyms, fitness studios, and personal trainers',
    icon: 'dumbbell',
    theme: {
      primaryColor: '#c62828',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffebee',
      textColor: '#b71c1c',
      fontFamily: 'Rajdhani',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'calendar', label: 'Class Schedule', url: 'https://example.com/classes' },
      { type: 'url', icon: 'user-plus', label: 'Join / Membership', url: 'https://example.com/join' },
      { type: 'url', icon: 'calendar-check', label: 'Book a Session', url: 'https://example.com/booking' },
      { type: 'url', icon: 'users', label: 'Personal Training', url: 'https://example.com/training' },
      { type: 'url', icon: 'map-pin', label: 'Gym Location', url: 'https://maps.google.com' },
      { type: 'social', icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/gym' },
      { type: 'phone', icon: 'phone', label: 'Contact', url: 'tel:+1234567890' }
    ]
  },

  // 12. SALON/SPA
  salon: {
    name: 'Salon/Spa',
    category: 'wellness',
    description: 'Beauty salons, spas, and wellness centers',
    icon: 'sparkles',
    theme: {
      primaryColor: '#ad1457',
      secondaryColor: '#ffffff',
      backgroundColor: '#fce4ec',
      textColor: '#880e4f',
      fontFamily: 'Quicksand',
      borderRadius: '12px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'scissors', label: 'Services & Pricing', url: 'https://example.com/services' },
      { type: 'url', icon: 'calendar', label: 'Book Appointment', url: 'https://example.com/booking' },
      { type: 'url', icon: 'image', label: 'Gallery', url: 'https://example.com/gallery' },
      { type: 'url', icon: 'gift', label: 'Gift Cards', url: 'https://example.com/giftcards' },
      { type: 'url', icon: 'star', label: 'Reviews', url: 'https://example.com/reviews' },
      { type: 'url', icon: 'map-pin', label: 'Location', url: 'https://maps.google.com' },
      { type: 'social', icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/salon' }
    ]
  },

  // 13. AUTOMOTIVE
  automotive: {
    name: 'Automotive',
    category: 'business',
    description: 'Car dealerships, auto repair, and services',
    icon: 'car',
    theme: {
      primaryColor: '#212121',
      secondaryColor: '#ffd600',
      backgroundColor: '#fafafa',
      textColor: '#424242',
      fontFamily: 'Roboto Condensed',
      borderRadius: '4px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'car', label: 'View Inventory', url: 'https://example.com/inventory' },
      { type: 'url', icon: 'calendar-check', label: 'Schedule Test Drive', url: 'https://example.com/testdrive' },
      { type: 'url', icon: 'wrench', label: 'Service Center', url: 'https://example.com/service' },
      { type: 'url', icon: 'dollar-sign', label: 'Financing Options', url: 'https://example.com/financing' },
      { type: 'url', icon: 'award', label: 'Trade-In Value', url: 'https://example.com/tradein' },
      { type: 'url', icon: 'map-pin', label: 'Showroom Location', url: 'https://maps.google.com' },
      { type: 'phone', icon: 'phone', label: 'Contact Sales', url: 'tel:+1234567890' }
    ]
  },

  // 14. NON-PROFIT
  nonprofit: {
    name: 'Non-Profit',
    category: 'organization',
    description: 'Charities, foundations, and NGOs',
    icon: 'heart',
    theme: {
      primaryColor: '#00897b',
      secondaryColor: '#ffffff',
      backgroundColor: '#e0f2f1',
      textColor: '#004d40',
      fontFamily: 'Lato',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'heart', label: 'Donate Now', url: 'https://example.com/donate' },
      { type: 'url', icon: 'users', label: 'Volunteer', url: 'https://example.com/volunteer' },
      { type: 'url', icon: 'calendar', label: 'Upcoming Events', url: 'https://example.com/events' },
      { type: 'url', icon: 'info', label: 'Our Mission', url: 'https://example.com/mission' },
      { type: 'url', icon: 'file-text', label: 'Annual Report', url: 'https://example.com/report.pdf' },
      { type: 'social', icon: 'facebook', label: 'Facebook', url: 'https://facebook.com/nonprofit' },
      { type: 'email', icon: 'mail', label: 'Contact Us', url: 'mailto:info@example.com' }
    ]
  },

  // 15. ARTIST/MUSICIAN
  artist: {
    name: 'Artist/Musician',
    category: 'creative',
    description: 'Musicians, artists, and creative professionals',
    icon: 'music',
    theme: {
      primaryColor: '#6a1b9a',
      secondaryColor: '#ffffff',
      backgroundColor: '#f3e5f5',
      textColor: '#4a148c',
      fontFamily: 'Oswald',
      borderRadius: '0px',
      buttonStyle: 'outline'
    },
    defaultLinks: [
      { type: 'url', icon: 'music', label: 'Listen Now', url: 'https://example.com/music' },
      { type: 'url', icon: 'calendar', label: 'Tour Dates', url: 'https://example.com/tour' },
      { type: 'url', icon: 'shopping-bag', label: 'Merch Store', url: 'https://example.com/shop' },
      { type: 'social', icon: 'youtube', label: 'YouTube', url: 'https://youtube.com/artist' },
      { type: 'social', icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/artist' },
      { type: 'social', icon: 'spotify', label: 'Spotify', url: 'https://open.spotify.com/artist' },
      { type: 'email', icon: 'mail', label: 'Contact', url: 'mailto:booking@example.com' }
    ]
  },

  // 16. PODCAST
  podcast: {
    name: 'Podcast',
    category: 'media',
    description: 'Podcasters and audio content creators',
    icon: 'mic',
    theme: {
      primaryColor: '#ff6f00',
      secondaryColor: '#ffffff',
      backgroundColor: '#fff3e0',
      textColor: '#e65100',
      fontFamily: 'Work Sans',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'headphones', label: 'Latest Episode', url: 'https://example.com/latest' },
      { type: 'url', icon: 'list', label: 'All Episodes', url: 'https://example.com/episodes' },
      { type: 'url', icon: 'rss', label: 'Subscribe', url: 'https://example.com/subscribe' },
      { type: 'social', icon: 'spotify', label: 'Spotify', url: 'https://open.spotify.com/show' },
      { type: 'social', icon: 'apple', label: 'Apple Podcasts', url: 'https://podcasts.apple.com' },
      { type: 'url', icon: 'shopping-bag', label: 'Support / Merch', url: 'https://example.com/support' },
      { type: 'email', icon: 'mail', label: 'Contact', url: 'mailto:podcast@example.com' }
    ]
  },

  // 17. REAL ESTATE AGENT
  realestateagent: {
    name: 'Real Estate Agent',
    category: 'professional',
    description: 'Personal real estate agent profiles',
    icon: 'user-check',
    theme: {
      primaryColor: '#1565c0',
      secondaryColor: '#ffffff',
      backgroundColor: '#e3f2fd',
      textColor: '#0d47a1',
      fontFamily: 'Merriweather',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'home', label: 'Current Listings', url: 'https://example.com/listings' },
      { type: 'url', icon: 'star', label: 'Client Testimonials', url: 'https://example.com/testimonials' },
      { type: 'url', icon: 'calculator', label: 'Mortgage Calculator', url: 'https://example.com/calculator' },
      { type: 'url', icon: 'user', label: 'About Me', url: 'https://example.com/about' },
      { type: 'phone', icon: 'phone', label: 'Call Me', url: 'tel:+1234567890' },
      { type: 'email', icon: 'mail', label: 'Email', url: 'mailto:agent@example.com' },
      { type: 'social', icon: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/agent' }
    ]
  },

  // 18. DOCTOR/DENTIST
  doctor: {
    name: 'Doctor/Dentist',
    category: 'healthcare',
    description: 'Medical and dental practices',
    icon: 'stethoscope',
    theme: {
      primaryColor: '#0288d1',
      secondaryColor: '#ffffff',
      backgroundColor: '#e1f5fe',
      textColor: '#01579b',
      fontFamily: 'Roboto',
      borderRadius: '8px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'calendar-check', label: 'Book Appointment', url: 'https://example.com/booking' },
      { type: 'url', icon: 'file-text', label: 'New Patient Forms', url: 'https://example.com/forms' },
      { type: 'url', icon: 'shield', label: 'Insurance Info', url: 'https://example.com/insurance' },
      { type: 'phone', icon: 'phone', label: 'Office Phone', url: 'tel:+1234567890' },
      { type: 'phone', icon: 'alert-circle', label: 'Emergency Contact', url: 'tel:+1234567890' },
      { type: 'url', icon: 'map-pin', label: 'Office Location', url: 'https://maps.google.com' },
      { type: 'url', icon: 'info', label: 'Services', url: 'https://example.com/services' }
    ]
  },

  // 19. LAWYER
  lawyer: {
    name: 'Lawyer',
    category: 'professional',
    description: 'Law firms and legal professionals',
    icon: 'scale',
    theme: {
      primaryColor: '#1a237e',
      secondaryColor: '#c5cae9',
      backgroundColor: '#e8eaf6',
      textColor: '#1a237e',
      fontFamily: 'Crimson Text',
      borderRadius: '4px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'briefcase', label: 'Practice Areas', url: 'https://example.com/practice' },
      { type: 'url', icon: 'calendar', label: 'Free Consultation', url: 'https://example.com/consultation' },
      { type: 'url', icon: 'award', label: 'Attorney Profile', url: 'https://example.com/profile' },
      { type: 'url', icon: 'star', label: 'Client Testimonials', url: 'https://example.com/testimonials' },
      { type: 'phone', icon: 'phone', label: 'Call Office', url: 'tel:+1234567890' },
      { type: 'email', icon: 'mail', label: 'Email', url: 'mailto:lawyer@example.com' },
      { type: 'url', icon: 'map-pin', label: 'Office Location', url: 'https://maps.google.com' }
    ]
  },

  // 20. WEDDING
  wedding: {
    name: 'Wedding',
    category: 'events',
    description: 'Wedding information and guest resources',
    icon: 'heart',
    theme: {
      primaryColor: '#d81b60',
      secondaryColor: '#ffffff',
      backgroundColor: '#fce4ec',
      textColor: '#880e4f',
      fontFamily: 'Great Vibes',
      borderRadius: '12px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'calendar-heart', label: 'RSVP', url: 'https://example.com/rsvp' },
      { type: 'url', icon: 'calendar', label: 'Wedding Schedule', url: 'https://example.com/schedule' },
      { type: 'url', icon: 'map-pin', label: 'Venue Location', url: 'https://maps.google.com' },
      { type: 'url', icon: 'hotel', label: 'Accommodation', url: 'https://example.com/hotels' },
      { type: 'url', icon: 'gift', label: 'Gift Registry', url: 'https://example.com/registry' },
      { type: 'url', icon: 'image', label: 'Photo Gallery', url: 'https://example.com/photos' },
      { type: 'url', icon: 'music', label: 'Request a Song', url: 'https://example.com/music' }
    ]
  },

  // 21. COFFEE SHOP ☕
  coffeeshop: {
    name: 'Coffee Shop',
    category: 'hospitality',
    description: 'Coffee shops, cafes, and tea houses',
    icon: 'coffee',
    theme: {
      primaryColor: '#5d4037',
      secondaryColor: '#ffffff',
      backgroundColor: '#efebe9',
      textColor: '#3e2723',
      fontFamily: 'Caveat',
      borderRadius: '16px',
      buttonStyle: 'solid'
    },
    defaultLinks: [
      { type: 'url', icon: 'coffee', label: 'Menu', url: 'https://example.com/menu' },
      { type: 'url', icon: 'shopping-cart', label: 'Order Online', url: 'https://example.com/order' },
      { type: 'url', icon: 'clock', label: 'Hours & Location', url: 'https://example.com/hours' },
      { type: 'url', icon: 'map-pin', label: 'Get Directions', url: 'https://maps.google.com' },
      { type: 'url', icon: 'gift', label: 'Loyalty Program', url: 'https://example.com/loyalty' },
      { type: 'url', icon: 'wifi', label: 'Free WiFi', url: '#' },
      { type: 'social', icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/coffeeshop' },
      { type: 'url', icon: 'star', label: 'Leave a Review', url: 'https://g.page/r/coffeeshop/review' }
    ]
  }
};

// Export helper functions
export const getTemplate = (templateId) => {
  return TEMPLATE_PRESETS[templateId] || TEMPLATE_PRESETS.blank;
};

export const getAllTemplates = () => {
  return Object.entries(TEMPLATE_PRESETS).map(([id, template]) => ({
    id,
    ...template
  }));
};

export const getTemplatesByCategory = (category) => {
  return Object.entries(TEMPLATE_PRESETS)
    .filter(([_, template]) => template.category === category)
    .map(([id, template]) => ({ id, ...template }));
};

export const TEMPLATE_CATEGORIES = [
  { id: 'hospitality', name: 'Hospitality', icon: 'utensils' },
  { id: 'business', name: 'Business', icon: 'briefcase' },
  { id: 'professional', name: 'Professional', icon: 'user-tie' },
  { id: 'health', name: 'Health & Wellness', icon: 'heart' },
  { id: 'creative', name: 'Creative', icon: 'palette' },
  { id: 'events', name: 'Events', icon: 'calendar' },
  { id: 'organization', name: 'Organizations', icon: 'users' },
  { id: 'media', name: 'Media', icon: 'radio' },
  { id: 'other', name: 'Other', icon: 'layout' }
];
