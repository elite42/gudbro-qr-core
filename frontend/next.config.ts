import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {}, // Silence Turbopack warning for Next.js 16
  output: 'standalone', // Enable standalone output for Docker production builds
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vietqr.io',
        pathname: '/img/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3006',
    NEXT_PUBLIC_QR_ENGINE_URL: process.env.NEXT_PUBLIC_QR_ENGINE_URL || 'http://localhost:3001',
    NEXT_PUBLIC_MENU_URL: process.env.NEXT_PUBLIC_MENU_URL || 'http://localhost:3011',
    NEXT_PUBLIC_I18N_URL: process.env.NEXT_PUBLIC_I18N_URL || 'http://localhost:3010',
  },
};

export default withPWA(nextConfig);
