/**
 * Hub Template Presets
 * 21 professional templates for different industries
 */

import { HubTheme } from './api/hub';

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  theme: HubTheme;
  defaultLinks?: Array<{
    type: string;
    icon: string;
    label: string;
    url: string;
  }>;
}

export const TEMPLATE_CATEGORIES = {
  hospitality: 'Hospitality',
  business: 'Business',
  professional: 'Professional',
  health: 'Health & Wellness',
  creative: 'Creative',
  events: 'Events',
  organizations: 'Organizations',
  other: 'Other',
};

export const TEMPLATES: Template[] = [
  // HOSPITALITY
  {
    id: 'restaurant',
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
      buttonStyle: 'solid',
    },
  },
  {
    id: 'hotel',
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
      buttonStyle: 'solid',
    },
  },
  {
    id: 'coffeeshop',
    name: 'Coffee Shop',
    category: 'hospitality',
    description: 'Great for coffee shops, cafes, and tea houses',
    icon: 'coffee',
    theme: {
      primaryColor: '#6d4c41',
      secondaryColor: '#ffffff',
      backgroundColor: '#fff8e1',
      textColor: '#3e2723',
      fontFamily: 'Merriweather',
      borderRadius: '10px',
      buttonStyle: 'solid',
    },
  },

  // BUSINESS
  {
    id: 'retail',
    name: 'Retail',
    category: 'business',
    description: 'Perfect for shops, boutiques, and stores',
    icon: 'shopping-bag',
    theme: {
      primaryColor: '#c2185b',
      secondaryColor: '#ffffff',
      backgroundColor: '#fce4ec',
      textColor: '#4a0e2f',
      fontFamily: 'Roboto',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    category: 'business',
    description: 'For property listings and real estate agencies',
    icon: 'home',
    theme: {
      primaryColor: '#00796b',
      secondaryColor: '#ffffff',
      backgroundColor: '#e0f2f1',
      textColor: '#004d40',
      fontFamily: 'Open Sans',
      borderRadius: '6px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'automotive',
    name: 'Automotive',
    category: 'business',
    description: 'Car dealerships and auto repair shops',
    icon: 'car',
    theme: {
      primaryColor: '#f57c00',
      secondaryColor: '#ffffff',
      backgroundColor: '#fff3e0',
      textColor: '#bf360c',
      fontFamily: 'Roboto',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'business',
    name: 'Business',
    category: 'business',
    description: 'Generic business template',
    icon: 'briefcase',
    theme: {
      primaryColor: '#1565c0',
      secondaryColor: '#ffffff',
      backgroundColor: '#e3f2fd',
      textColor: '#0d47a1',
      fontFamily: 'Inter',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },

  // PROFESSIONAL
  {
    id: 'personal',
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
      buttonStyle: 'minimal',
    },
  },
  {
    id: 'education',
    name: 'Education',
    category: 'professional',
    description: 'Schools, courses, and institutions',
    icon: 'graduation-cap',
    theme: {
      primaryColor: '#5e35b1',
      secondaryColor: '#ffffff',
      backgroundColor: '#ede7f6',
      textColor: '#311b92',
      fontFamily: 'Roboto',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    category: 'professional',
    description: 'Clinics and medical practices',
    icon: 'heart-pulse',
    theme: {
      primaryColor: '#0288d1',
      secondaryColor: '#ffffff',
      backgroundColor: '#e1f5fe',
      textColor: '#01579b',
      fontFamily: 'Lato',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'realestateagent',
    name: 'Real Estate Agent',
    category: 'professional',
    description: 'Individual real estate agents',
    icon: 'key',
    theme: {
      primaryColor: '#00695c',
      secondaryColor: '#ffffff',
      backgroundColor: '#e0f2f1',
      textColor: '#004d40',
      fontFamily: 'Roboto',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'doctor',
    name: 'Doctor',
    category: 'professional',
    description: 'Doctors and dentists',
    icon: 'stethoscope',
    theme: {
      primaryColor: '#0277bd',
      secondaryColor: '#ffffff',
      backgroundColor: '#e1f5fe',
      textColor: '#01579b',
      fontFamily: 'Lato',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'lawyer',
    name: 'Lawyer',
    category: 'professional',
    description: 'Law firms and legal professionals',
    icon: 'scale',
    theme: {
      primaryColor: '#37474f',
      secondaryColor: '#ffffff',
      backgroundColor: '#eceff1',
      textColor: '#263238',
      fontFamily: 'Merriweather',
      borderRadius: '6px',
      buttonStyle: 'solid',
    },
  },

  // HEALTH & WELLNESS
  {
    id: 'fitness',
    name: 'Fitness',
    category: 'health',
    description: 'Gyms and fitness studios',
    icon: 'dumbbell',
    theme: {
      primaryColor: '#c62828',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffebee',
      textColor: '#7f0000',
      fontFamily: 'Roboto',
      borderRadius: '10px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'salon',
    name: 'Salon',
    category: 'health',
    description: 'Beauty salons and spas',
    icon: 'scissors',
    theme: {
      primaryColor: '#ad1457',
      secondaryColor: '#ffffff',
      backgroundColor: '#fce4ec',
      textColor: '#4a0e2f',
      fontFamily: 'Playfair Display',
      borderRadius: '12px',
      buttonStyle: 'solid',
    },
  },

  // CREATIVE
  {
    id: 'artist',
    name: 'Artist',
    category: 'creative',
    description: 'Musicians, artists, and creators',
    icon: 'palette',
    theme: {
      primaryColor: '#7b1fa2',
      secondaryColor: '#ffffff',
      backgroundColor: '#f3e5f5',
      textColor: '#4a148c',
      fontFamily: 'Montserrat',
      borderRadius: '10px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'podcast',
    name: 'Podcast',
    category: 'creative',
    description: 'Podcasters and audio creators',
    icon: 'mic',
    theme: {
      primaryColor: '#f57c00',
      secondaryColor: '#ffffff',
      backgroundColor: '#fff3e0',
      textColor: '#bf360c',
      fontFamily: 'Inter',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },

  // EVENTS
  {
    id: 'event',
    name: 'Event',
    category: 'events',
    description: 'Conferences, concerts, and gatherings',
    icon: 'calendar',
    theme: {
      primaryColor: '#7b1fa2',
      secondaryColor: '#ffffff',
      backgroundColor: '#fafafa',
      textColor: '#212121',
      fontFamily: 'Montserrat',
      borderRadius: '10px',
      buttonStyle: 'solid',
    },
  },
  {
    id: 'wedding',
    name: 'Wedding',
    category: 'events',
    description: 'Wedding information pages',
    icon: 'heart',
    theme: {
      primaryColor: '#d81b60',
      secondaryColor: '#ffffff',
      backgroundColor: '#fce4ec',
      textColor: '#4a0e2f',
      fontFamily: 'Playfair Display',
      borderRadius: '12px',
      buttonStyle: 'solid',
    },
  },

  // ORGANIZATIONS
  {
    id: 'nonprofit',
    name: 'Non-Profit',
    category: 'organizations',
    description: 'Charities, foundations, and NGOs',
    icon: 'hand-heart',
    theme: {
      primaryColor: '#00897b',
      secondaryColor: '#ffffff',
      backgroundColor: '#e0f2f1',
      textColor: '#004d40',
      fontFamily: 'Roboto',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },

  // OTHER
  {
    id: 'blank',
    name: 'Blank',
    category: 'other',
    description: 'Start from scratch',
    icon: 'file',
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Inter',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return TEMPLATES.filter((t) => t.category === category);
}
