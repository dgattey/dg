#!/usr/bin/env tsx
/**
 * Version management commands for CI
 * Usage: tsx src/version.ts <command> [args...]
 *
 * Commands:
 *   read                              Read version from package.json
 *   pr-info <event-path>              Parse release type from PR
 *   bump <version> <major|minor|patch> Bump version in package.json
 *   target-from-tags <version> <type>  Compute target from git tags
 *   extract-notes <event-path>        Extract notes from PR body
 *   pr-comment <event> <ver> <state>  Upsert PR comment
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import https from 'node:https';
import { join } from 'node:path';
import { fail, findRoot, out, parseArgs, withSpinner } from './lib/utils.js';

type ReleaseType = 'major' | 'minor' | 'patch';

const root = findRoot();
const pkgPath = join(root, 'package.json');
const [cmd, ...args] = parseArgs();

function computeNext(base: string, type: ReleaseType): string {
  const [major = 0, minor = 0, patch = 0] = base.split('-')[0]?.split('.').map(Number) ?? [];
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function readPkg(): { version: string } {
  return JSON.parse(readFileSync(pkgPath, 'utf8'));
}

function getLatestTag(): string | null {
  try {
    const tags = execSync('git tag --list --sort=-v:refname', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\n')
      .filter(Boolean);
    const match = tags.find((t) => /^v?\d+\.\d+\.\d+/.test(t));
    return match?.replace(/^v/, '') ?? null;
  } catch {
    return null;
  }
}

function githubRequest<T>(method: string, path: string, body?: object): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN required');

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'dg-cli',
        },
        hostname: 'api.github.com',
        method,
        path,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data ? JSON.parse(data) : null);
          } else {
            reject(new Error(`GitHub API ${res.statusCode}: ${data}`));
          }
        });
      },
    );
    req.on('error', reject);
    if (body) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Commands
switch (cmd) {
  case 'read': {
    out(`VERSION=${readPkg().version}`);
    break;
  }

  case 'pr-info': {
    const event = JSON.parse(readFileSync(args[0] ?? '', 'utf8'));
    const body: string = event.pull_request?.body ?? '';
    const type = /- \[x\]\s*Major/i.test(body)
      ? 'major'
      : /- \[x\]\s*Minor/i.test(body)
        ? 'minor'
        : 'patch';
    out(`RELEASE_TYPE=${type}`);
    break;
  }

  case 'bump': {
    const [baseVersion, releaseType] = args;
    if (!baseVersion || !releaseType) fail('Usage: version bump <version> <major|minor|patch>');
    const newVersion = computeNext(baseVersion, releaseType as ReleaseType);
    await withSpinner(`Bumping ${baseVersion} → ${newVersion}`, () => {
      const pkg = readPkg();
      pkg.version = newVersion;
      writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
    });
    out(`VERSION_FROM=${baseVersion}`);
    out(`VERSION_TO=${newVersion}`);
    break;
  }

  case 'target-from-tags': {
    const [currentVersion, releaseType] = args;
    if (!currentVersion || !releaseType) fail('Usage: version target-from-tags <version> <type>');
    const base = getLatestTag() ?? currentVersion;
    const target = computeNext(base, releaseType as ReleaseType);
    out(`BASE_VERSION_USED=${base}`);
    out(`VERSION_FROM=${base}`);
    out(`VERSION_TO=${target}`);
    break;
  }

  case 'extract-notes': {
    const event = JSON.parse(readFileSync(args[0] ?? '', 'utf8'));
    const body: string = event.pull_request?.body ?? '';
    const notes: Array<string> = [];
    let inSection = false;

    for (const line of body.split('\n')) {
      if (/^#\s*What changed\?/i.test(line)) inSection = true;
      else if (inSection && (/^#\s*Release info/i.test(line) || /^-+\s*$/.test(line))) break;
      else if (inSection) notes.push(line);
    }
    out(notes.join('\n').trim());
    break;
  }

  case 'pr-comment': {
    const [eventPath, version, state] = args;
    if (!eventPath || !version || !state)
      fail('Usage: version pr-comment <event> <version> <will-be|released>');

    const event = JSON.parse(readFileSync(eventPath, 'utf8'));
    const { owner, repo, number } = {
      number: event.pull_request?.number,
      owner: event.repository?.owner?.login,
      repo: event.repository?.name,
    };
    if (!owner || !repo || !number) fail('Missing repo info in event');

    const marker = '<!-- release-bot-version-comment -->';
    const releaseUrl = process.env.RELEASE_URL;
    if (state === 'released' && !releaseUrl) fail('RELEASE_URL required for released state');

    const body =
      state === 'released'
        ? `${marker}\n🎉 This PR is included in version ${version} 🎉\n\nRelease: [GitHub](${releaseUrl})`
        : `${marker}\n🎉 This PR will be included in version ${version} 🎉`;

    await withSpinner('Updating PR comment', async () => {
      type Comment = { id: number; body?: string };
      const comments = await githubRequest<Array<Comment>>(
        'GET',
        `/repos/${owner}/${repo}/issues/${number}/comments?per_page=100`,
      );
      const existing = comments.find((c) => c.body?.includes(marker));

      if (existing) {
        await githubRequest('PATCH', `/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
          body,
        });
      } else {
        await githubRequest('POST', `/repos/${owner}/${repo}/issues/${number}/comments`, { body });
      }
    });
    break;
  }

  default:
    fail(
      `Unknown command: ${cmd}\nUsage: version <read|pr-info|bump|target-from-tags|extract-notes|pr-comment>`,
    );
}
