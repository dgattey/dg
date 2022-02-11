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

    // Allows SWR to work right now - until Yarn updates
    esmExternals: false,
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

const productionSentryConfig = {
  dryRun:
    // These are the fallbacks when we can't find an app version, like it's not deployed on a real branch
    ['vX.Y.Z', 'LOCAL'].includes(process.env.NEXT_PUBLIC_APP_VERSION),
};

const developmentSentryConfig = {
  silent: true,
};

// Release only when we have real version data
module.exports = withSentryConfig(
  nextConfig,
  process.env.NODE_ENV === 'development' ? developmentSentryConfig : productionSentryConfig,
);
