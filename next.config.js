/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  outputFileTracingRoot: __dirname,
  transpilePackages: ['three'],
};

module.exports = nextConfig;
