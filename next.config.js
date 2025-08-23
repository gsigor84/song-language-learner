/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don’t fail the build on ESLint errors in CI
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
