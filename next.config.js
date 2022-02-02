const { withSentryConfig } = require('@sentry/nextjs');

/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enables the styled-components SWC transform
    styledComponents: true,

    // Allows Yarn PnP to work right now
    swcFileReading: false,
  },
  images: {
    domains: ['images.ctfassets.net', 'i.scdn.co'],
  },

  // Unfortunately required for Prisma until it upgrades to undici@^4
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common');
      config.externals.push('encoding');
    }
    return config;
  },
};

module.exports = withSentryConfig(nextConfig, { silent: true });
