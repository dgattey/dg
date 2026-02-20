#!/usr/bin/env tsx
/**
 * Version management commands for CI
 * Usage: tsx src/version.ts <command> [args...]
 *
 * Commands:
 *   bump <event-path>                 Parse PR, compute target from tags, bump package.json
 *   release-info <event-path>         Read version + extract release notes from PR
 *   pr-comment <event> <ver> <state>  Upsert PR comment
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import https from 'node:https';
import { join } from 'node:path';
import { fail, findRoot, fmt, log, out, parseArgs, withSpinner } from './lib/utils.js';

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

function readEvent(eventPath: string): { prBody: string; event: Record<string, unknown> } {
  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  const pr = event.pull_request as Record<string, unknown> | undefined;
  return { event, prBody: (pr?.body as string) ?? '' };
}

function parseReleaseType(prBody: string): ReleaseType {
  if (/- \[x\]\s*Major/i.test(prBody)) return 'major';
  if (/- \[x\]\s*Minor/i.test(prBody)) return 'minor';
  return 'patch';
}

function extractNotes(prBody: string): string {
  const notes: Array<string> = [];
  let inSection = false;

  for (const line of prBody.split('\n')) {
    if (/^#\s*What changed\?/i.test(line)) inSection = true;
    else if (inSection && (/^#\s*Release info/i.test(line) || /^-+\s*$/.test(line))) break;
    else if (inSection) notes.push(line);
  }
  return notes.join('\n').trim();
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

switch (cmd) {
  case 'bump': {
    if (!args[0]) fail('Usage: version bump <event-path>');
    const { prBody } = readEvent(args[0]);

    const releaseType = parseReleaseType(prBody);
    log(fmt.info(`Release type: ${fmt.bold(releaseType)}`));

    const current = readPkg().version;
    log(fmt.info(`Current version: ${fmt.bold(current)}`));

    const latestTag = getLatestTag();
    const base = latestTag ?? current;
    log(
      fmt.info(`Base from tags: ${fmt.bold(base)}${latestTag ? '' : ' (no tags, using current)'}`),
    );

    const target = computeNext(base, releaseType);

    if (current === target) {
      log(fmt.success(`Already at target ${target}, skipping`));
    } else {
      await withSpinner(
        `Bumping ${current} → ${target}`,
        () => {
          const pkg = readPkg();
          pkg.version = target;
          writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
        },
        undefined,
        { stderr: true },
      );
    }
    out(`VERSION_FROM=${base}`);
    out(`VERSION_TO=${target}`);
    out(`CHANGED=${current !== target}`);
    break;
  }

  case 'release-info': {
    if (!args[0]) fail('Usage: version release-info <event-path>');
    const { prBody } = readEvent(args[0]);

    const version = readPkg().version;
    log(fmt.info(`Version: ${fmt.bold(version)}`));

    const notes = extractNotes(prBody);
    log(fmt.info(`Release notes: ${notes ? `${notes.split('\n').length} line(s)` : 'empty'}`));

    const delimiter = `NOTES_DELIM_${Date.now()}`;
    out(`VERSION=${version}`);
    out(`NOTES<<${delimiter}`);
    out(notes);
    out(delimiter);
    break;
  }

  case 'pr-comment': {
    const [eventPath, version, state] = args;
    if (!eventPath || !version || !state)
      fail('Usage: version pr-comment <event> <version> <will-be|released>');

    const { event } = readEvent(eventPath);
    const repo = event.repository as Record<string, unknown> | undefined;
    const pr = event.pull_request as Record<string, unknown> | undefined;
    const owner = (repo?.owner as Record<string, unknown> | undefined)?.login as string | undefined;
    const repoName = repo?.name as string | undefined;
    const number = pr?.number as number | undefined;
    if (!owner || !repoName || !number) fail('Missing repo info in event');

    log(
      fmt.info(`Commenting on ${owner}/${repoName}#${number}: ${state} ${fmt.bold(`v${version}`)}`),
    );

    const marker = '<!-- release-bot-version-comment -->';
    const releaseUrl = process.env.RELEASE_URL;
    if (state === 'released' && !releaseUrl) fail('RELEASE_URL required for released state');

    const body =
      state === 'released'
        ? `${marker}\n🎉 This PR is included in version ${version} 🎉\n\nRelease: [GitHub](${releaseUrl})`
        : `${marker}\n🎉 This PR will be included in version ${version} 🎉`;

    await withSpinner(
      'Updating PR comment',
      async () => {
        type Comment = { id: number; body?: string };
        const comments = await githubRequest<Array<Comment>>(
          'GET',
          `/repos/${owner}/${repoName}/issues/${number}/comments?per_page=100`,
        );
        const existing = comments.find((c) => c.body?.includes(marker));

        if (existing) {
          await githubRequest(
            'PATCH',
            `/repos/${owner}/${repoName}/issues/comments/${existing.id}`,
            { body },
          );
        } else {
          await githubRequest('POST', `/repos/${owner}/${repoName}/issues/${number}/comments`, {
            body,
          });
        }
      },
      undefined,
      { stderr: true },
    );
    break;
  }

  default:
    fail(`Unknown command: ${cmd}\nUsage: version <bump|release-info|pr-comment>`);
}
