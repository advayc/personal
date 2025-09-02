/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['https://advayc.vercel.app/'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Removed X-Frame-Options to allow iframe content
          // Removed X-Content-Type-Options to allow proxy content
          // Removed Referrer-Policy to allow proxy requests
        ]
      },
      // Special headers for the proxy API to allow iframe embedding
      {
        source: '/api/proxy',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: '*'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
