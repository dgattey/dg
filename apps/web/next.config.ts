import { execFileSync } from 'node:child_process';
import { config as dotenvConfig } from 'dotenv-mono';
import type { NextConfig } from 'next';
import { version as pkgVersion, repository } from '../../package.json';

dotenvConfig();

type ReleaseType = 'major' | 'minor' | 'patch';

function parseSemver(raw: string): [number, number, number] | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(raw.trim());
  if (!match) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareSemver(a: string, b: string): number {
  const parsedA = parseSemver(a);
  const parsedB = parseSemver(b);
  if (!parsedA && !parsedB) return 0;
  if (!parsedA) return -1;
  if (!parsedB) return 1;
  for (let i = 0; i < 3; i++) {
    const diff = (parsedA[i] ?? 0) - (parsedB[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function computeNextVersion(base: string, type: ReleaseType): string {
  const [major = 0, minor = 0, patch = 0] = parseSemver(base) ?? [0, 0, 0];
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function parseReleaseType(commitBody: string): ReleaseType {
  if (/- \[x\] Major/i.test(commitBody)) return 'major';
  if (/- \[x\] Minor/i.test(commitBody)) return 'minor';
  return 'patch';
}

export function resolveVersionFromTagRefs({
  commitBody,
  fallbackVersion,
  headSha,
  tagRefsOutput,
}: {
  commitBody: string;
  fallbackVersion: string;
  headSha: string | null;
  tagRefsOutput: string;
}): string {
  const entries: Array<{ sha: string; version: string }> = [];
  for (const line of tagRefsOutput.split('\n')) {
    const [sha, ref] = line.trim().split(/\s+/);
    const tag = ref?.replace(/^refs\/tags\//, '') ?? '';
    if (sha && parseSemver(tag)) {
      entries.push({ sha, version: tag.replace(/^v/, '') });
    }
  }
  if (entries.length === 0) {
    return fallbackVersion.replace(/^v/, '');
  }
  if (headSha) {
    const taggedHead = entries
      .filter((entry) => entry.sha === headSha)
      .sort((a, b) => compareSemver(b.version, a.version))[0];
    if (taggedHead) {
      return taggedHead.version;
    }
  }
  const highest = entries.sort((a, b) => compareSemver(b.version, a.version))[0];
  if (!highest) {
    return fallbackVersion.replace(/^v/, '');
  }
  return computeNextVersion(highest.version, parseReleaseType(commitBody));
}

function runGit(args: ReadonlyArray<string>): string | null {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 3000,
    }).trim();
  } catch {
    return null;
  }
}

function resolveBuildVersion(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_VERSION?.trim();
  if (explicit) {
    return explicit.replace(/^v/, '');
  }
  if (process.env.NODE_ENV === 'test') {
    return pkgVersion;
  }
  const headSha = process.env.VERCEL_GIT_COMMIT_SHA?.trim() || runGit(['rev-parse', 'HEAD']);
  const tagRefsOutput =
    (repository ? runGit(['ls-remote', '--tags', '--refs', repository]) : null) ??
    runGit(['show-ref', '--tags']) ??
    '';
  const commitBody = runGit(['log', '-1', '--format=%B']) ?? '';
  return resolveVersionFromTagRefs({
    commitBody,
    fallbackVersion: pkgVersion,
    headSha,
    tagRefsOutput,
  });
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: resolveBuildVersion(),
  },
  experimental: {
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
  redirects() {
    return Promise.resolve([
      {
        destination: '/site-map',
        permanent: false,
        source: '/sitemap',
      },
    ]);
  },
  rewrites() {
    return Promise.resolve([
      {
        destination: '/.well-known/openapi.json',
        source: '/openapi.json',
      },
    ]);
  },
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
