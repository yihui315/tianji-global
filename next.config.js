/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  outputFileTracingRoot: __dirname,
  transpilePackages: ['three'],
  async headers() {
    const legacyPublicRoutes = [
      '/bazi',
      '/ziwei',
      '/tarot',
      '/yijing',
      '/western',
      '/astrology',
    ];

    return legacyPublicRoutes.map((source) => ({
      source,
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex, nofollow',
        },
      ],
    }));
  },
};

module.exports = nextConfig;
