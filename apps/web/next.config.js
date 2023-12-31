require('dotenv-mono').config();

/**
 * Adds bundle analysis if development + with ANALYZE flag set to true
 */
const withNextBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
  i18n: {
    // This allows for the language value to be passed in HTML
    locales: ['en'],
    defaultLocale: 'en',
  },
  // Have to do this for each of the packages we import
  transpilePackages: ['shared-core', 'api', 'ui', 'ui-core'],
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = withNextBundleAnalyzer(nextConfig);
