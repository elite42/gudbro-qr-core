'use client';

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

// QR Types organized by category
const QR_TYPES = {
  essential: [
    { id: 'sms', name: 'SMS', description: 'Pre-filled text message', icon: 'MessageSquare', color: 'blue' },
    { id: 'email', name: 'Email', description: 'Mailto link with subject & body', icon: 'Mail', color: 'red' },
    { id: 'wifi', name: 'WiFi', description: 'Network credentials', icon: 'Wifi', color: 'purple' },
    { id: 'social', name: 'Social Media', description: '8 social platforms', icon: 'Share2', color: 'pink' },
    { id: 'event', name: 'Calendar Event', description: 'iCalendar format', icon: 'Calendar', color: 'orange' },
    { id: 'vcard', name: 'vCard Contact', description: 'Digital business card', icon: 'User', color: 'green' },
  ],
  asia: [
    { id: 'zalo', name: 'Zalo', description: 'Vietnam messaging (74M users)', icon: 'MessageCircle', color: 'blue' },
    { id: 'kakaotalk', name: 'KakaoTalk', description: 'South Korea (47M users)', icon: 'MessageCircle', color: 'yellow' },
    { id: 'line', name: 'LINE', description: 'Thailand/Taiwan/Japan (165M+)', icon: 'MessageCircle', color: 'green' },
    { id: 'wechat-pay', name: 'WeChat Pay', description: 'Chinese payment system', icon: 'CreditCard', color: 'green' },
    { id: 'vietqr', name: 'VietQR', description: 'Vietnam payment (23 banks)', icon: 'Banknote', color: 'red' },
  ],
  standard: [
    { id: 'pdf', name: 'PDF', description: 'Direct PDF download', icon: 'FileText', color: 'red' },
    { id: 'app-store', name: 'App Store', description: 'iOS & Android apps', icon: 'Smartphone', color: 'blue' },
    { id: 'video', name: 'Video', description: 'YouTube, Vimeo, TikTok, etc.', icon: 'Video', color: 'red' },
    { id: 'audio', name: 'Audio', description: 'Spotify, Apple Music, etc.', icon: 'Music', color: 'green' },
    { id: 'multi-url', name: 'Multi-URL', description: 'Smart device routing', icon: 'GitBranch', color: 'purple' },
    { id: 'business-page', name: 'Business Page', description: 'Company info + hours', icon: 'Building2', color: 'indigo' },
    { id: 'coupon', name: 'Coupon', description: 'Digital discount voucher', icon: 'Ticket', color: 'orange' },
    { id: 'feedback-form', name: 'Feedback', description: 'Customer surveys', icon: 'MessageSquareText', color: 'teal' },
  ],
};

const CATEGORY_INFO = {
  essential: {
    title: 'Essential QR Types',
    description: 'Fundamental QR codes for everyday use',
    icon: 'Star',
  },
  asia: {
    title: 'Asia-Pacific QR Types',
    description: 'Social & payment systems popular in Vietnam, Korea, China, Thailand',
    icon: 'Globe',
  },
  standard: {
    title: 'Standard QR Types',
    description: 'Advanced QR codes for business and marketing',
    icon: 'Sparkles',
  },
};

const COLOR_CLASSES = {
  blue: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-700',
  red: 'bg-red-50 border-red-200 hover:border-red-400 text-red-700',
  green: 'bg-green-50 border-green-200 hover:border-green-400 text-green-700',
  purple: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-700',
  orange: 'bg-orange-50 border-orange-200 hover:border-orange-400 text-orange-700',
  pink: 'bg-pink-50 border-pink-200 hover:border-pink-400 text-pink-700',
  yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 text-yellow-700',
  indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 text-indigo-700',
  teal: 'bg-teal-50 border-teal-200 hover:border-teal-400 text-teal-700',
};

export default function QRTypesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Create QR Code</h1>
              <p className="text-gray-600 mt-1">
                Choose from 19 QR code types across 3 categories
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
            >
              <LucideIcons.ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {Object.entries(QR_TYPES).map(([category, types]) => {
          const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
          const CategoryIcon = LucideIcons[categoryInfo.icon as keyof typeof LucideIcons] as React.ComponentType<any>;

          return (
            <section key={category}>
              {/* Category Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-black rounded-lg">
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-black">{categoryInfo.title}</h2>
                </div>
                <p className="text-gray-600 ml-14">{categoryInfo.description}</p>
              </div>

              {/* QR Types Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.map((type) => {
                  const Icon = LucideIcons[type.icon as keyof typeof LucideIcons] as React.ComponentType<any>;
                  const colorClass = COLOR_CLASSES[type.color as keyof typeof COLOR_CLASSES];

                  return (
                    <Link
                      key={type.id}
                      href={`/qr/create/${type.id}`}
                      className={`block p-6 rounded-xl border-2 transition-all ${colorClass}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{type.name}</h3>
                          <p className="text-sm opacity-90">{type.description}</p>
                        </div>
                        <LucideIcons.ArrowRight className="w-5 h-5 opacity-50" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Footer Stats */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-black">19</div>
            <div className="text-sm text-gray-600">QR Code Types</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-black">1.5B+</div>
            <div className="text-sm text-gray-600">Potential Users (Asia-Pacific)</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-black">100%</div>
            <div className="text-sm text-gray-600">Production Ready Backend</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
