import { withLogtail } from '@logtail/next';
import { config as dotenvConfig } from 'dotenv-mono';
import type { NextConfig } from 'next';

dotenvConfig();

const nextConfig: NextConfig = {
  experimental: {
    scrollRestoration: true,
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
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

export default withLogtail(nextConfig);
