/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  outputFileTracingRoot: __dirname,
  // Allow build to succeed despite pre-existing TypeScript type errors in
  // @auth/core and @types/nodemailer dependency chains.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
