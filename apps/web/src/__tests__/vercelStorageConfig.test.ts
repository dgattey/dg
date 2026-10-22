import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import nextConfig from '../../next.config';
import vercelConfig from '../../vercel.json' with { type: 'json' };

const WEB_ROOT = resolve(__dirname, '../..');

function createTempRepo({ bumped }: { bumped: boolean }) {
  const repoDir = mkdtempSync(join(tmpdir(), 'dg-ignore-cmd-'));
  const webDir = join(repoDir, 'apps', 'web');

  spawnSync('git', ['init', repoDir], { stdio: 'ignore' });
  spawnSync('git', ['-C', repoDir, 'config', 'user.name', 'Test'], { stdio: 'ignore' });
  spawnSync('git', ['-C', repoDir, 'config', 'user.email', 'test@example.com'], {
    stdio: 'ignore',
  });

  mkdirSync(webDir, { recursive: true });
  writeFileSync(join(repoDir, 'package.json'), JSON.stringify({ version: '2.74.0' }));
  spawnSync('git', ['-C', repoDir, 'add', 'package.json'], { stdio: 'ignore' });
  spawnSync('git', ['-C', repoDir, 'commit', '-m', 'feat(web): initial feature commit'], {
    stdio: 'ignore',
  });

  if (bumped) {
    writeFileSync(join(repoDir, 'package.json'), JSON.stringify({ version: '2.74.1' }));
    spawnSync('git', ['-C', repoDir, 'add', 'package.json'], { stdio: 'ignore' });
    spawnSync('git', ['-C', repoDir, 'commit', '-m', 'Bump version to v2.74.1'], {
      stdio: 'ignore',
    });
  }
  return {
    cleanup: () => rmSync(repoDir, { force: true, recursive: true }),
    webDir,
  };
}

function runIgnoreCommand(cwd: string, env: Record<string, string>) {
  return spawnSync('sh', ['-c', vercelConfig.ignoreCommand], {
    cwd,
    env: { ...process.env, ...env },
  }).status;
}

describe('Vercel Function Storage configuration', () => {
  it('excludes sharp, moment locales, non-postgres dialects, and page-level OG renderer from NFT traces', () => {
    const excludes = nextConfig.outputFileTracingExcludes ?? {};
    expect(excludes['**']).toEqual(
      expect.arrayContaining([
        '../../node_modules/.pnpm/@img+sharp*/**',
        '../../node_modules/.pnpm/sharp@*/**',
        '../../node_modules/**/@img/sharp*/**',
        '../../node_modules/**/sharp/**',
        '../../node_modules/**/moment/locale/**',
        '../../node_modules/**/react/**/*.development.js',
        '../../node_modules/**/next/dist/compiled/@vercel/og/index.edge.js',
        '../../node_modules/**/next/dist/compiled/@vercel/og/Geist-Regular.ttf',
      ]),
    );
    expect(excludes['**/page']).toEqual(
      expect.arrayContaining([
        '../../node_modules/**/next/dist/compiled/@vercel/og/**',
        './.next/server/assets/SFPro*.ttf',
      ]),
    );
  });

  it('always builds production and main deployments in ignoreCommand within the 256-char Vercel limit', () => {
    expect(vercelConfig.ignoreCommand.length).toBeLessThanOrEqual(256);
    expect(
      runIgnoreCommand(WEB_ROOT, {
        VERCEL_ENV: 'production',
        VERCEL_GIT_COMMIT_REF: 'main',
      }),
    ).toBe(1);
    expect(
      runIgnoreCommand(WEB_ROOT, {
        VERCEL_ENV: 'preview',
        VERCEL_GIT_COMMIT_REF: 'main',
      }),
    ).toBe(1);
  });

  it('skips unbumped preview branch pushes and builds version-bumped PR heads', () => {
    const unbumped = createTempRepo({ bumped: false });
    try {
      expect(
        runIgnoreCommand(unbumped.webDir, {
          VERCEL_ENV: 'preview',
          VERCEL_GIT_COMMIT_REF: 'dgattey/feature-branch',
        }),
      ).toBe(0);
    } finally {
      unbumped.cleanup();
    }

    const bumped = createTempRepo({ bumped: true });
    try {
      expect(
        runIgnoreCommand(bumped.webDir, {
          VERCEL_ENV: 'preview',
          VERCEL_GIT_COMMIT_REF: 'dgattey/feature-branch',
        }),
      ).toBe(1);
    } finally {
      bumped.cleanup();
    }
  });
});
