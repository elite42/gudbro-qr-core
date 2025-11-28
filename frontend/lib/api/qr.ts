/**
 * QR Engine API Client
 * Communicates with QR Engine backend (port 3001)
 */

const QR_API_URL = process.env.NEXT_PUBLIC_QR_ENGINE_URL || 'http://localhost:3001';

// ============= INTERFACES =============

// Base QR Response
export interface QRResponse {
  id: string;
  user_id: string;
  type: string;
  data: any;
  qr_image: string;
  short_url?: string;
  created_at: string;
}

// Essential QR Types
export interface SMSQRData {
  phone: string;
  message: string;
}

export interface EmailQRData {
  to: string;
  subject?: string;
  body?: string;
}

export interface WiFiQRData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface SocialQRData {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'snapchat' | 'pinterest';
  username: string;
}

export interface EventQRData {
  title: string;
  location?: string;
  description?: string;
  start_date: string; // ISO 8601
  end_date?: string;  // ISO 8601
  all_day?: boolean;
}

export interface VCardQRData {
  first_name: string;
  last_name: string;
  organization?: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  note?: string;
}

// Asia QR Types
export interface VietQRData {
  bank_code: string;
  account_number: string;
  account_name: string;
  amount?: number;
  description?: string;
}

export interface ZaloQRData {
  phone: string;
}

export interface WeChatPayQRData {
  merchant_id: string;
  amount?: number;
  currency?: 'CNY' | 'VND';
  description?: string;
}

export interface KakaoTalkQRData {
  phone: string;
}

export interface LINEQRData {
  phone: string;
  country_code?: 'TH' | 'TW' | 'JP' | 'VN';
}

// Standard QR Types
export interface PDFQRData {
  url: string;
  auto_download?: boolean;
}

export interface AppStoreQRData {
  app_name: string;
  ios_app_id?: string;
  android_package_name?: string;
}

export interface VideoQRData {
  platform: 'youtube' | 'vimeo' | 'tiktok' | 'facebook' | 'instagram' | 'direct';
  url: string;
  video_id?: string;
}

export interface AudioQRData {
  platform: 'spotify' | 'apple' | 'soundcloud' | 'youtube' | 'direct';
  url: string;
  track_id?: string;
}

export interface MultiURLQRData {
  urls: Array<{
    url: string;
    device?: 'ios' | 'android' | 'desktop';
    priority?: number;
    label?: string;
  }>;
  routing_type: 'device' | 'priority' | 'choice';
  default_url: string;
}

export interface BusinessPageQRData {
  business_name: string;
  tagline?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  hours?: {
    [key: string]: { open: string; close: string } | 'closed';
  };
  social_links?: {
    [key: string]: string;
  };
}

export interface CouponQRData {
  title: string;
  code: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed' | 'bogo';
  discount_value?: number;
  valid_from?: string;
  valid_until?: string;
  terms?: string;
}

export interface FeedbackFormQRData {
  title: string;
  description?: string;
  questions: Array<{
    id: string;
    type: 'text' | 'rating' | 'choice' | 'yesno';
    question: string;
    required?: boolean;
    options?: string[];
  }>;
  submit_url?: string;
}

// ============= API FUNCTIONS =============

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  data?: any
): Promise<T> {
  const url = `${QR_API_URL}/api/qr${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method === 'POST') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Essential QR Types
export const qrApi = {
  // SMS
  createSMS: (data: SMSQRData) => apiCall<QRResponse>('/sms', 'POST', data),

  // Email
  createEmail: (data: EmailQRData) => apiCall<QRResponse>('/email', 'POST', data),

  // WiFi
  createWiFi: (data: WiFiQRData) => apiCall<QRResponse>('/wifi', 'POST', data),

  // Social Media
  createSocial: (data: SocialQRData) => apiCall<QRResponse>('/social', 'POST', data),

  // Event
  createEvent: (data: EventQRData) => apiCall<QRResponse>('/event', 'POST', data),

  // vCard
  createVCard: (data: VCardQRData) => apiCall<QRResponse>('/vcard', 'POST', data),

  // Asia QR Types
  createVietQR: (data: VietQRData) => apiCall<QRResponse>('/vietqr', 'POST', data),
  getVietQRBanks: () => apiCall<{ banks: any[] }>('/vietqr/banks', 'GET'),

  createZalo: (data: ZaloQRData) => apiCall<QRResponse>('/zalo', 'POST', data),

  createWeChatPay: (data: WeChatPayQRData) => apiCall<QRResponse>('/wechat-pay', 'POST', data),
  getWeChatPayCurrencies: () => apiCall<{ currencies: string[] }>('/wechat-pay/currencies', 'GET'),

  createKakaoTalk: (data: KakaoTalkQRData) => apiCall<QRResponse>('/kakaotalk', 'POST', data),

  createLINE: (data: LINEQRData) => apiCall<QRResponse>('/line', 'POST', data),

  // Standard QR Types
  createPDF: (data: PDFQRData) => apiCall<QRResponse>('/pdf', 'POST', data),

  createAppStore: (data: AppStoreQRData) => apiCall<QRResponse>('/app-store', 'POST', data),

  createVideo: (data: VideoQRData) => apiCall<QRResponse>('/video', 'POST', data),

  createAudio: (data: AudioQRData) => apiCall<QRResponse>('/audio', 'POST', data),

  createMultiURL: (data: MultiURLQRData) => apiCall<QRResponse>('/multi-url', 'POST', data),

  createBusinessPage: (data: BusinessPageQRData) => apiCall<QRResponse>('/business-page', 'POST', data),

  createCoupon: (data: CouponQRData) => apiCall<QRResponse>('/coupon', 'POST', data),

  createFeedbackForm: (data: FeedbackFormQRData) => apiCall<QRResponse>('/feedback-form', 'POST', data),

  // Get QR by ID
  getQR: (id: string) => apiCall<QRResponse>(`/${id}`, 'GET'),

  // Get all user's QR codes
  getUserQRs: (page = 1, limit = 20) =>
    apiCall<{ qr_codes: QRResponse[]; total: number }>(`?page=${page}&limit=${limit}`, 'GET'),
};
