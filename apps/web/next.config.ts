import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next injects inline bootstrap scripts; eval is only needed by the dev overlay.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // PeerJS signaling (wss) + TURN/STUN (UDP/TCP TURN doesn't go through CSP,
  // but the WebSocket signaling and any HTTP fetch do).
  "connect-src 'self' wss://0.peerjs.com https://0.peerjs.com",
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