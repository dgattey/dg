#!/usr/bin/env tsx
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec, execSafe, fail, findRoot, fmt, log, out, parseArgs } from './lib/utils.js';

export type ReleaseType = 'major' | 'minor' | 'patch';
export type SemverTuple = readonly [major: number, minor: number, patch: number];

export interface PullRequestReleaseMetadata {
  body: string;
  headRefName: string;
  mergeCommitOid: string | null;
  number: number;
  state: 'OPEN' | 'MERGED' | 'CLOSED';
  title: string;
  url: string;
}

export interface ReleasePlan {
  latestTag: string;
  notes: string;
  prNumber: number;
  releaseType: ReleaseType;
  targetCommitish: string;
  version: string;
}

export interface BuildReleasePlanOptions {
  bumpTypeOverride?: ReleaseType;
  existingTagOnCommit?: string | null;
  latestTag: string;
  mergedPackageVersion?: string;
}

const PR_COMMENT_MARKER = '<!-- release-bot-version-comment -->';
const NOTE_HEADINGS =
  'what changed|release notes|highlights|summary|changes|overview|description'.split('|');
const STOPPED_HEADINGS = new Set(
  'release info|verification|testing|test plan|tests|screenshots|demo|checklist'.split('|'),
);

export function parseVersion(raw: string): SemverTuple {
  const clean = raw.trim().replace(/^v/, '').split('-')[0] ?? '';
  const parts = clean.split('.');
  return [Number(parts[0]) || 0, Number(parts[1]) || 0, Number(parts[2]) || 0];
}

export function compareVersions(lhs: string, rhs: string): number {
  const [lMaj, lMin, lPat] = parseVersion(lhs);
  const [rMaj, rMin, rPat] = parseVersion(rhs);
  return lMaj - rMaj || lMin - rMin || lPat - rPat;
}

export function bumpVersion(base: string, type: ReleaseType): string {
  const [major, minor, patch] = parseVersion(base);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

// Keep in sync with the bump job's `if:` in .github/workflows/release.yml.
export function parseReleaseType(prBody: string): ReleaseType {
  if (/^\s*-\s*\[x\]\s*Major\b/im.test(prBody)) return 'major';
  if (/^\s*-\s*\[x\]\s*Minor\b/im.test(prBody)) return 'minor';
  return 'patch';
}

function stripAgentWrapper(body: string): string {
  const begin = body.indexOf('<!-- CURSOR_AGENT_PR_BODY_BEGIN -->');
  const after = begin !== -1 ? body.slice(begin + 35) : body;
  const end = after.indexOf('<!-- CURSOR_AGENT_PR_BODY_END -->');
  return (end !== -1 ? after.slice(0, end) : after).replace(/<!--[\s\S]*?-->/g, '').trim();
}

function parseHeading(line: string): { level: number; norm: string } | null {
  const m = /^\s*(#{1,6})\s+(.+?)\s*$/.exec(line);
  if (!m?.[1] || !m[2]) return null;
  const norm = m[2]
    .replace(/\s*[?:]\s*$/, '')
    .trim()
    .toLowerCase();
  return { level: m[1].length, norm };
}

function collectSectionLines(cleanedBody: string, targetNorm?: string): string {
  let sectionLevel: number | null = targetNorm ? null : 0;
  let skipLevel: number | null = null;
  const collected: Array<string> = [];

  for (const line of cleanedBody.split('\n')) {
    const trimmed = line.trim();
    const heading = parseHeading(line);
    if (sectionLevel === null) {
      if (heading && heading.norm === targetNorm) sectionLevel = heading.level;
      continue;
    }
    if (/^-+\s*$/.test(trimmed)) break;
    if (!targetNorm && /^(?:closes|fixes|resolves)\b/i.test(trimmed)) continue;
    if (heading) {
      if (targetNorm && heading.level <= sectionLevel) break;
      if (STOPPED_HEADINGS.has(heading.norm)) skipLevel = heading.level;
      else if (skipLevel !== null && heading.level <= skipLevel) skipLevel = null;
      if (!targetNorm || STOPPED_HEADINGS.has(heading.norm)) continue;
    }
    if (skipLevel !== null || /^[-*]\s*$/.test(trimmed)) continue;
    if (!targetNorm && /^-\s*\[[ xX]\]\s*/.test(trimmed)) continue;
    collected.push(line);
  }
  return collected.join('\n').trim();
}

export function extractNotes(prBody: string, prTitle?: string): string {
  const cleaned = stripAgentWrapper(prBody);
  for (const heading of NOTE_HEADINGS) {
    const section = collectSectionLines(cleaned, heading);
    if (section) return section;
  }
  return collectSectionLines(cleaned) || (prTitle?.trim() ? `- ${prTitle.trim()}` : '');
}

export function buildReleasePlan(
  pr: PullRequestReleaseMetadata,
  opts: BuildReleasePlanOptions,
): ReleasePlan {
  const releaseType = opts.bumpTypeOverride ?? parseReleaseType(pr.body);
  const existing = opts.existingTagOnCommit?.replace(/^v/, '');
  const bumped = bumpVersion(opts.latestTag, releaseType);
  const merged = opts.mergedPackageVersion;
  const useMerged = Boolean(merged && compareVersions(merged, bumped) > 0);
  const version =
    existing && !opts.bumpTypeOverride ? existing : useMerged ? (merged ?? bumped) : bumped;
  return {
    latestTag: opts.latestTag,
    notes: extractNotes(pr.body, pr.title),
    prNumber: pr.number,
    releaseType,
    targetCommitish: pr.mergeCommitOid ?? 'main',
    version,
  };
}

function getLatestTag(excludeTag?: string | null): string | null {
  const tags = execSafe('git tag --list --sort=-v:refname')?.split('\n').filter(Boolean) ?? [];
  const filtered = excludeTag
    ? tags.filter((t) => t !== excludeTag && t !== `v${excludeTag}`)
    : tags;
  const match = filtered.find((t) => /^v?\d+\.\d+\.\d+/.test(t));
  return match?.replace(/^v/, '') ?? null;
}

interface EventPayload {
  pull_request?: { body?: string; number?: number; title?: string };
  repository?: { name?: string; owner?: { login?: string } };
}

function readEvent(eventPath: string): { event: EventPayload; prBody: string; prTitle?: string } {
  const event = JSON.parse(readFileSync(eventPath, 'utf8')) as EventPayload;
  return { event, prBody: event.pull_request?.body ?? '', prTitle: event.pull_request?.title };
}

function formatCommentBody(version: string, state: string, releaseUrl?: string): string {
  if (state === 'released') {
    if (!releaseUrl) fail('RELEASE_URL required for released state');
    return `${PR_COMMENT_MARKER}\n🎉 This PR is included in version ${version} 🎉\n\nRelease: [GitHub](${releaseUrl})`;
  }
  return `${PR_COMMENT_MARKER}\n🎉 This PR will be included in version ${version} 🎉`;
}

async function githubRequest<T>(method: string, path: string, body?: object): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN required');
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'dg-cli',
  };
  const res = await fetch(`https://api.github.com${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers,
    method,
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

function getFlag(args: ReadonlyArray<string>, flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

function runReleasePr(args: ReadonlyArray<string>): void {
  const dryRun = args.includes('--dry-run') || args.includes('-n');
  const prArg = args.find(
    (a, i) => !a.startsWith('-') && args[i - 1] !== '--bump-type' && args[i - 1] !== '--repo',
  );
  const prNumber = prArg ? Number.parseInt(prArg.replace(/^#/, ''), 10) : Number.NaN;
  if (!Number.isInteger(prNumber) || prNumber <= 0)
    fail('Usage: version release-pr <pr-number> [--dry-run]');
  const bumpRaw = getFlag(args, '--bump-type')?.toLowerCase();
  if (bumpRaw && bumpRaw !== 'major' && bumpRaw !== 'minor' && bumpRaw !== 'patch')
    fail(`Invalid --bump-type "${bumpRaw}"`);
  const repo =
    getFlag(args, '--repo') ??
    execSafe('gh repo view --json nameWithOwner --jq .nameWithOwner') ??
    'dgattey/dg';

  execSafe('git fetch --tags --force --quiet');
  const prJson = exec(
    `gh pr view ${prNumber} --repo "${repo}" --json number,title,body,state,headRefName,mergeCommit,url`,
  );
  const rawPr = JSON.parse(prJson) as PullRequestReleaseMetadata & {
    mergeCommit?: { oid?: string } | null;
  };
  const oid = rawPr.mergeCommit?.oid ?? null;
  const existingTagOnCommit = oid
    ? execSafe(`git tag --points-at "${oid}" "v*"`)?.split('\n')[0] || null
    : null;
  const pkgJson = oid ? execSafe(`git show "${oid}:package.json"`) : null;
  const mergedPackageVersion = pkgJson
    ? (JSON.parse(pkgJson) as { version?: string }).version
    : undefined;

  const prMeta = {
    ...rawPr,
    body: rawPr.body ?? '',
    headRefName: rawPr.headRefName ?? '',
    mergeCommitOid: oid,
    title: rawPr.title ?? '',
  };
  const plan = buildReleasePlan(prMeta, {
    bumpTypeOverride: bumpRaw as ReleaseType | undefined,
    existingTagOnCommit,
    latestTag: getLatestTag(existingTagOnCommit) ?? '0.0.0',
    mergedPackageVersion,
  });

  log(
    `PR #${plan.prNumber} (${rawPr.state}) -> v${plan.version} (${plan.releaseType})\nNotes:\n${plan.notes || '(empty)'}`,
  );
  if (dryRun) {
    log(fmt.info(`[DRY RUN] Would release v${plan.version} and comment on PR #${plan.prNumber}`));
    return;
  }
  if (rawPr.state !== 'MERGED') fail(`PR #${plan.prNumber} is ${rawPr.state} (must be MERGED).`);

  const tag = `v${plan.version}`;
  const tmpDir = mkdtempSync(join(tmpdir(), 'dg-release-'));
  try {
    const notesPath = join(tmpDir, 'notes.md');
    writeFileSync(notesPath, plan.notes, 'utf8');
    const viewCmd = `gh release view "${tag}" --repo "${repo}" --json url --jq .url`;
    const relCmd = execSafe(viewCmd)
      ? `edit "${tag}"`
      : `create "${tag}" --target "${plan.targetCommitish}"`;
    exec(`gh release ${relCmd} --repo "${repo}" --title "${tag}" --notes-file "${notesPath}"`);

    const releaseUrl = `https://github.com/${repo}/releases/tag/${tag}`;
    const listJson = exec(`gh api "repos/${repo}/issues/${plan.prNumber}/comments?per_page=100"`);
    const comments = JSON.parse(listJson) as Array<{ body?: string; id: number }>;
    const existing = comments.find((c) => c.body?.includes(PR_COMMENT_MARKER));
    const payloadPath = join(tmpDir, 'comment.json');
    const body = formatCommentBody(plan.version, 'released', releaseUrl);
    writeFileSync(payloadPath, JSON.stringify({ body }), 'utf8');
    const ep = existing ? `issues/comments/${existing.id}` : `issues/${plan.prNumber}/comments`;
    exec(
      `gh api --method ${existing ? 'PATCH' : 'POST'} "repos/${repo}/${ep}" --input "${payloadPath}"`,
    );
    log(fmt.success(`Released ${tag} and updated PR #${plan.prNumber} -> ${releaseUrl}`));
  } finally {
    rmSync(tmpDir, { force: true, recursive: true });
  }
}

async function main(): Promise<void> {
  const pkgPath = join(findRoot(), 'package.json');
  const readPkg = (): { version: string } => JSON.parse(readFileSync(pkgPath, 'utf8'));
  const [cmd, ...args] = parseArgs();

  switch (cmd) {
    case 'bump': {
      if (!args[0]) fail('Usage: version bump <event-path>');
      const { prBody } = readEvent(args[0]);
      const releaseType = parseReleaseType(prBody);
      const current = readPkg().version;
      const base = getLatestTag() ?? current;
      const target = bumpVersion(base, releaseType);
      log(fmt.info(`Release: ${releaseType} | Current: ${current} | Base: ${base} -> ${target}`));
      if (current !== target) {
        const pkg = readPkg();
        pkg.version = target;
        writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
      }
      out(`VERSION_FROM=${base}\nVERSION_TO=${target}\nCHANGED=${current !== target}`);
      break;
    }

    case 'release-info': {
      if (!args[0]) fail('Usage: version release-info <event-path>');
      const { prBody, prTitle } = readEvent(args[0]);
      const version = readPkg().version;
      const notes = extractNotes(prBody, prTitle);
      const d = `NOTES_DELIM_${Date.now()}`;
      out(`VERSION=${version}\nNOTES<<${d}\n${notes}\n${d}`);
      break;
    }

    case 'pr-comment': {
      const [eventPath, version, state] = args;
      if (!eventPath || !version || !state)
        fail('Usage: version pr-comment <event> <version> <will-be|released>');
      const { event } = readEvent(eventPath);
      const owner = event.repository?.owner?.login;
      const repoName = event.repository?.name;
      const number = event.pull_request?.number;
      if (!owner || !repoName || !number) fail('Missing repo info in event');

      const body = formatCommentBody(version, state, process.env.RELEASE_URL);
      const path = `/repos/${owner}/${repoName}/issues/${number}/comments?per_page=100`;
      const comments = await githubRequest<Array<{ id: number; body?: string }>>('GET', path);
      const existing = comments.find((c) => c.body?.includes(PR_COMMENT_MARKER));
      const ep = existing ? `comments/${existing.id}` : `${number}/comments`;
      await githubRequest(existing ? 'PATCH' : 'POST', `/repos/${owner}/${repoName}/issues/${ep}`, {
        body,
      });
      log(fmt.success(`Updated PR #${number} comment (${state} v${version})`));
      break;
    }

    case 'release-pr':
      runReleasePr(args);
      break;

    default:
      fail(`Unknown command: ${cmd ?? ''}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
