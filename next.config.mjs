/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don’t fail the build on ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
