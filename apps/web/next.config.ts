import { config as dotenvConfig } from 'dotenv-mono';
import type { NextConfig } from 'next';

dotenvConfig();

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    authInterrupts: true,
    inlineCss: true,
    scrollRestoration: true,
    serverActions: {
      bodySizeLimit: '20mb',
    },
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 65, 75],
    remotePatterns: [
      {
        hostname: 'images.ctfassets.net',
        protocol: 'https',
      },
      {
        hostname: '*.gattey.com',
        protocol: 'https',
      },
      {
        hostname: 'i.scdn.co',
        protocol: 'https',
      },
      {
        hostname: 'i.gr-assets.com',
        protocol: 'https',
      },
      {
        hostname: 's.gr-assets.com',
        protocol: 'https',
      },
      {
        hostname: 'covers.openlibrary.org',
        protocol: 'https',
      },
    ],
  },
  outputFileTracingExcludes: {
    '**': [
      '../../node_modules/.pnpm/@img+sharp*/**',
      '../../node_modules/.pnpm/sharp@*/**',
      '../../node_modules/**/@img/sharp*/**',
      '../../node_modules/**/sharp/**',
      '../../node_modules/**/moment/locale/**',
      '../../node_modules/**/react/**/*.development.js',
      '../../node_modules/**/next/dist/compiled/@vercel/og/index.edge.js',
      '../../node_modules/**/sequelize/lib/dialects/{db2,ibmi,mariadb,mssql,mysql,oracle,snowflake,sqlite}/{connection-manager,index,query,query-generator,query-interface}*',
    ],
    '**/page': [
      '../../node_modules/**/next/dist/compiled/@vercel/og/**',
      './.next/server/assets/Familjen-Grotesk-*.ttf',
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
  ],
};

export default nextConfig;
