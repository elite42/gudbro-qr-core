import CreateHubForm from '@/components/hub/CreateHubForm';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Create Hub | QR Platform',
  description: 'Create a new Hub landing page',
};

export default function CreateHubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              >
                <LucideIcons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Create New Hub</h1>
                <p className="text-sm text-gray-600">
                  Build your link-in-bio landing page in minutes
                </p>
              </div>
            </div>

            <Link
              href="/hub"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              View all Hubs
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateHubForm />
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-sm text-gray-500">
        <p>
          Need help?{' '}
          <a href="#" className="text-black hover:underline">
            View documentation
          </a>
        </p>
      </footer>
    </div>
  );
}
