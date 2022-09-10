const { withSentryConfig } = require('@sentry/nextjs');

/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
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

/**
 * Adds bundle analysis if development + with ANALYZE flag set to true
 */
const withNextBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

if (process.env.NODE_ENV === 'development') {
  // Add silent sentry on develop and make sure it's always a dry run
  module.exports = withNextBundleAnalyzer(
    withSentryConfig(nextConfig, {
      hideSourceMaps: false,
      release: process.env.NEXT_PUBLIC_APP_VERSION,
      silent: true,
      dryRun: true,
    }),
  );
} else {
  // For prod, dry run if it's running locally/appears local
  module.exports = withNextBundleAnalyzer(
    withSentryConfig(nextConfig, {
      hideSourceMaps: true,
      release: process.env.NEXT_PUBLIC_APP_VERSION,
      dryRun:
        // If not deployed on a real branch or the db url points to something local, we know we're running a production build locally
        'vX.Y.Z'.includes(process.env.NEXT_PUBLIC_APP_VERSION) ||
        process.env?.DATABASE_URL?.includes('127.0.0.1'),
    }),
  );
}
