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

// Release only when we have real version data
module.exports = withSentryConfig(nextConfig, {
  release: `dg@${process.env.NEXT_PUBLIC_APP_VERSION}`,
  dryRun: process.env.NEXT_PUBLIC_APP_VERSION === 'vX.Y.Z',
});
