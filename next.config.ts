import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: '8mb' }, // upload de fotos no admin
  },
  // os templates de apresentação saíram do ar: links antigos caem na home
  async redirects() {
    return [
      { source: '/template-:n(1|2|3)', destination: '/', permanent: false },
      { source: '/template-:n(1|2|3)/produto/:slug', destination: '/produto/:slug', permanent: false },
      { source: '/template-:n(1|2|3)/:path*', destination: '/', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
