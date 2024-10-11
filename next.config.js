/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // This will ignore all ESLint errors during build
      // Or for more granular control:
      dirs: ['pages', 'components'], // Only run ESLint on these directories
    },
  };
  
  module.exports = nextConfig;