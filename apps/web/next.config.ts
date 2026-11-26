import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

// Auth and other backend origins the browser may call directly.
const authOrigin =
  process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4001';
const extraConnect = [
  authOrigin,
  'http://localhost:4001',
  'http://127.0.0.1:4001',
  'http://localhost:4002',
  'http://localhost:4003',
  'http://localhost:4004',
  'http://localhost:4005',
  'http://localhost:4006',
  'http://localhost:4007',
]
  .filter(Boolean)
  .join(' ');

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next injects inline bootstrap scripts; eval is only needed by the dev overlay.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // PeerJS + local auth/backend services (signup, API calls)
  `connect-src 'self' ${extraConnect} wss://0.peerjs.com https://0.peerjs.com`,
  // Let the <video> element play blob: URLs (screen-recording / remote streams).
  "media-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // PeerJS/WebRTC needs workers in some browsers.
  "worker-src 'self' blob:",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Workspace packages ship TypeScript source; Next compiles them.
  transpilePackages: ['@uhs/ui', '@uhs/contracts'],
  experimental: {
    optimizePackageImports: ['@uhs/ui', 'lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
