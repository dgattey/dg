const { withSentryConfig } = require('@sentry/nextjs');

/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  api: {
    /**
     * To remove a false positive error that appears all the time because of Sentry's `withSentry`
     * api wrapper (https://github.com/getsentry/sentry-javascript/issues/3852)
     */
    externalResolver: true,
  },
  images: {
    domains: ['images.ctfassets.net', 'i.scdn.co'],
  },
  // Unfortunately required for Prisma until it upgrades to undici@^5
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

module.exports = withSentryConfig(
  nextConfig,
  process.env.NODE_ENV === 'development' ? developmentSentryConfig : productionSentryConfig,
);
