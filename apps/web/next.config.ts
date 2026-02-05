import { config as dotenvConfig } from 'dotenv-mono';
import type { NextConfig } from 'next';

dotenvConfig();

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    authInterrupts: true,
    scrollRestoration: true,
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
  },
  // LocatorJS support for Turbopack - only in development
  ...(process.env.NODE_ENV === 'development' && {
    turbopack: {
      rules: {
        '**/*.{tsx,jsx}': {
          loaders: [
            {
              loader: '@locator/webpack-loader',
              options: { env: 'development' },
            },
          ],
        },
      },
    },
  }),
  headers() {
    return [
      {
        headers: [
          {
            key: 'Accept-CH',
            value: 'Sec-CH-Prefers-Color-Scheme',
          },
        ],
        source: '/:path*',
      },
    ];
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
  reactCompiler: true,
  reactStrictMode: true,
  // Disables the Sequelize warning about the `sequelize` package not being found
  serverExternalPackages: ['sequelize'],
  // Have to do this for each of the packages we import
  transpilePackages: [
    '@dg/shared-core',
    '@dg/content-models',
    '@dg/services',
    '@dg/ui',
    '@dg/maps',
    '@dg/og',
  ],
};

export default nextConfig;
