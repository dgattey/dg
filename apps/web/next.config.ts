import { config as dotenvConfig } from 'dotenv-mono';
import type { NextConfig } from 'next';

dotenvConfig();

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    authInterrupts: true,
    scrollRestoration: true,
    serverActions: {
      bodySizeLimit: '20mb',
    },
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
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
  /**
   * `@vercel/nft` only emits libvips alongside sharp's native addon when it sees
   * `sharp/lib/index.js`, an entry point sharp 0.35 replaced with `dist/index.cjs`. Without
   * this the deployed bundle ships the addon but not the `libvips-cpp.so` it dlopens, and
   * every route that renders the Spotify card dies with `ERR_DLOPEN_FAILED`.
   * `scripts/verifyTracedNativeLibraries.ts` fails the build if this stops covering it.
   */
  outputFileTracingIncludes: {
    '/**': [
      '../../node_modules/.pnpm/@img+sharp-libvips-*/node_modules/@img/sharp-libvips-*/lib/**/*',
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
