const { withLogtail } = require('@logtail/next');
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
  experimental: {
    scrollRestoration: true,
  },
  i18n: {
    defaultLocale: 'en',
    // This allows for the language value to be passed in HTML
    locales: ['en'],
  },
  images: {
    remotePatterns: [
      {
        hostname: 'images.ctfassets.net',
        protocol: 'https',
      },
      {
        hostname: 'i.scdn.co',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  // Disables the Sequelize warning about the `sequelize` package not being found
  serverExternalPackages: ['sequelize'],
  // Have to do this for each of the packages we import
  transpilePackages: ['shared-core', 'api', 'ui'],
};

module.exports = withNextBundleAnalyzer(withLogtail(nextConfig));
