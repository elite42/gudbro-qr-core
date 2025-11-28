/**
 * Hub API Client
 * Communicates with Hub Aggregator backend (port 3009)
 */

const HUB_API_URL = process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:3009';

export interface HubTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: 'solid' | 'outline' | 'minimal';
}

export interface HubLink {
  id?: string;
  type: 'url' | 'qr' | 'email' | 'phone' | 'social' | 'payment' | 'file';
  icon: string;
  label: string;
  url: string;
  color?: string;
  background_color?: string;
  button_style?: string;
  display_order?: number;
  is_active?: boolean;
  is_featured?: boolean;
  click_count?: number;
}

export interface Hub {
  id: string;
  user_id: string;
  qr_code_id?: string;
  short_code: string;
  title: string;
  subtitle?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  favicon_url?: string;
  template: string;
  theme_json: HubTheme;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_active: boolean;
  is_public: boolean;
  password_hash?: string;
  custom_domain?: string;
  view_count: number;
  unique_visitors: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
  links?: HubLink[];
}

export interface CreateHubData {
  title: string;
  subtitle?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  template: string;
  theme?: Partial<HubTheme>;
  password?: string;
  custom_domain?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface UpdateHubData {
  title?: string;
  subtitle?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  theme?: Partial<HubTheme>;
  is_active?: boolean;
  is_public?: boolean;
  password?: string;
  custom_domain?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface CreateLinkData {
  type: HubLink['type'];
  icon: string;
  label: string;
  url: string;
  color?: string;
  background_color?: string;
  button_style?: string;
  is_featured?: boolean;
}

// Helper to get auth token (placeholder - implement based on your auth)
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// API Client
export const hubApi = {
  // Create new hub
  async createHub(data: CreateHubData): Promise<{ hub: Hub; qr: any }> {
    const response = await fetch(`${HUB_API_URL}/api/hub`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create hub');
    }

    return response.json();
  },

  // Get user's hubs
  async getUserHubs(page = 1, limit = 20): Promise<{ hubs: Hub[]; pagination: any }> {
    const response = await fetch(
      `${HUB_API_URL}/api/hub?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch hubs');
    }

    return response.json();
  },

  // Get hub by ID
  async getHub(id: string): Promise<Hub> {
    const response = await fetch(`${HUB_API_URL}/api/hub/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hub');
    }

    return response.json();
  },

  // Update hub
  async updateHub(id: string, data: UpdateHubData): Promise<Hub> {
    const response = await fetch(`${HUB_API_URL}/api/hub/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update hub');
    }

    return response.json();
  },

  // Delete hub
  async deleteHub(id: string): Promise<void> {
    const response = await fetch(`${HUB_API_URL}/api/hub/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete hub');
    }
  },

  // Add link to hub
  async addLink(hubId: string, data: CreateLinkData): Promise<HubLink> {
    const response = await fetch(`${HUB_API_URL}/api/hub/${hubId}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add link');
    }

    return response.json();
  },

  // Update link
  async updateLink(
    hubId: string,
    linkId: string,
    data: Partial<CreateLinkData>
  ): Promise<HubLink> {
    const response = await fetch(
      `${HUB_API_URL}/api/hub/${hubId}/links/${linkId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update link');
    }

    return response.json();
  },

  // Delete link
  async deleteLink(hubId: string, linkId: string): Promise<void> {
    const response = await fetch(
      `${HUB_API_URL}/api/hub/${hubId}/links/${linkId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete link');
    }
  },

  // Reorder links
  async reorderLinks(hubId: string, linkIds: string[]): Promise<void> {
    const response = await fetch(
      `${HUB_API_URL}/api/hub/${hubId}/links/reorder`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ link_ids: linkIds }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to reorder links');
    }
  },

  // Get hub analytics
  async getAnalytics(
    id: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    const response = await fetch(
      `${HUB_API_URL}/api/hub/${id}/analytics?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    return response.json();
  },
};
