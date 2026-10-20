#!/usr/bin/env tsx
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec, execSafe, fail, fmt, log } from './lib/utils.js';

export type ReleaseType = 'major' | 'minor' | 'patch';
type CommentState = 'will-be' | 'released';
export type SemverTuple = readonly [major: number, minor: number, patch: number];

interface GitHubEvent {
  pull_request?: { body?: string; number?: number; title?: string };
  repository?: { name?: string; owner?: { login?: string } };
}

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

function readGitHubEvent(): GitHubEvent {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) fail('GITHUB_EVENT_PATH environment variable required');
  return JSON.parse(readFileSync(eventPath, 'utf8')) as GitHubEvent;
}

function writeGitHubOutputs(outputs: Record<string, string>): void {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  for (const [k, v] of Object.entries(outputs)) {
    const line = v.includes('\n') ? `${k}<<EOF_${k}\n${v}\nEOF_${k}\n` : `${k}=${v}\n`;
    appendFileSync(outputPath, line);
  }
}

export function parseReleaseType(prBody: string): ReleaseType {
  if (/^\s*-\s*\[x\]\s*Major\b/im.test(prBody)) return 'major';
  if (/^\s*-\s*\[x\]\s*Minor\b/im.test(prBody)) return 'minor';
  return 'patch';
}

export function parseVersion(raw: string): SemverTuple {
  const parts = raw.trim().replace(/^v/, '').split('.');
  return [Number(parts[0]) || 0, Number(parts[1]) || 0, Number(parts[2]) || 0];
}

export function compareVersions(lhs: string, rhs: string): number {
  const [lMaj, lMin, lPat] = parseVersion(lhs);
  const [rMaj, rMin, rPat] = parseVersion(rhs);
  return lMaj - rMaj || lMin - rMin || lPat - rPat;
}

export function bumpVersion(version: string, releaseType: ReleaseType): string {
  const [major, minor, patch] = parseVersion(version);
  switch (releaseType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default: {
      const exhaustive: never = releaseType;
      return exhaustive;
    }
  }
}

function getLatestTagVersion(excludeTag?: string | null): string {
  const tags = execSafe('git tag --list "v*" --sort=-v:refname')?.split('\n').filter(Boolean) ?? [];
  const list = excludeTag ? tags.filter((t) => t !== excludeTag && t !== `v${excludeTag}`) : tags;
  return list[0] ? list[0].replace(/^v/, '') : '0.0.0';
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

function formatPrCommentBody(version: string, state: CommentState, releaseUrl?: string): string {
  if (state === 'released') {
    if (!releaseUrl) fail('RELEASE_URL environment variable required when state is "released"');
    return `${PR_COMMENT_MARKER}\n🎉 This PR is included in version ${version} 🎉\n\nThe release is available on [GitHub release](${releaseUrl})`;
  }
  return `${PR_COMMENT_MARKER}\n🎉 This PR will be included in version ${version} 🎉`;
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

function getFlag(args: ReadonlyArray<string>, flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

function bump(): void {
  const event = readGitHubEvent();
  const releaseType = parseReleaseType(event.pull_request?.body ?? '');
  const latestTag = getLatestTagVersion();
  const target = bumpVersion(latestTag, releaseType);
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
  const changed = pkg.version !== target;
  log(`Latest: v${latestTag}, type: ${releaseType}, current: ${pkg.version}, target: ${target}`);
  if (changed) {
    pkg.version = target;
    writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
    log(fmt.success(`Bumped package.json to ${target}`));
  } else {
    log(fmt.success(`Already at target ${target}, skipping`));
  }
  writeGitHubOutputs({ CHANGED: String(changed), VERSION: target });
}

function releaseInfo(): void {
  const event = readGitHubEvent();
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
  const notes = extractNotes(event.pull_request?.body ?? '', event.pull_request?.title);
  log(
    `Version: ${pkg.version} | Notes: ${notes ? `${notes.split('\n').length} line(s)` : '(empty)'}`,
  );
  writeGitHubOutputs({ NOTES: notes, VERSION: pkg.version });
}

async function prComment(): Promise<void> {
  const args = process.argv.slice(3);
  const version = getFlag(args, '--version');
  const state = getFlag(args, '--state') as CommentState | undefined;
  if (!version) fail('--version is required');
  if (state !== 'will-be' && state !== 'released') fail('--state must be "will-be" or "released"');
  const token = process.env.GITHUB_TOKEN;
  if (!token) fail('GITHUB_TOKEN environment variable required');

  const event = readGitHubEvent();
  const owner = event.repository?.owner?.login;
  const repo = event.repository?.name;
  const issueNumber = event.pull_request?.number;
  if (!owner || !repo || !issueNumber) fail('Missing repository or pull_request info in event');

  const body = formatPrCommentBody(version, state, process.env.RELEASE_URL);
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const listRes = await fetch(`${base}/issues/${issueNumber}/comments?per_page=100`, { headers });
  if (!listRes.ok) fail(`GitHub API error listing comments: ${listRes.status}`);

  const comments = (await listRes.json()) as Array<{ body?: string; id: number }>;
  const existing = comments.find((c) => c.body?.includes(PR_COMMENT_MARKER));
  const endpoint = existing ? `issues/comments/${existing.id}` : `issues/${issueNumber}/comments`;
  const method = existing ? 'PATCH' : 'POST';
  const res = await fetch(`${base}/${endpoint}`, {
    body: JSON.stringify({ body }),
    headers,
    method,
  });
  if (!res.ok) fail(`GitHub API error updating comment: ${res.status}`);
  log(fmt.success(`${existing ? 'Updated' : 'Created'} PR #${issueNumber} comment (${state})`));
}

function releasePr(): void {
  const args = process.argv.slice(3);
  const dryRun = args.includes('--dry-run') || args.includes('-n');
  const prArg = args.find(
    (a, i) => !a.startsWith('-') && args[i - 1] !== '--bump-type' && args[i - 1] !== '--repo',
  );
  const prNumber = prArg ? Number.parseInt(prArg.replace(/^#/, ''), 10) : Number.NaN;
  if (!Number.isInteger(prNumber) || prNumber <= 0)
    fail('Usage: version.ts release-pr <pr-number> [--dry-run]');
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
    latestTag: getLatestTagVersion(existingTagOnCommit),
    mergedPackageVersion,
  });

  log(`PR #${plan.prNumber} (${rawPr.state}) -> v${plan.version} (${plan.releaseType})`);
  log(`Notes:\n${plan.notes || '(empty)'}`);
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
    const body = formatPrCommentBody(plan.version, 'released', releaseUrl);
    writeFileSync(payloadPath, JSON.stringify({ body }), 'utf8');
    const ep = existing ? `issues/comments/${existing.id}` : `issues/${plan.prNumber}/comments`;
    const method = existing ? 'PATCH' : 'POST';
    exec(`gh api --method ${method} "repos/${repo}/${ep}" --input "${payloadPath}"`);
    log(fmt.success(`Released ${tag} and updated PR #${plan.prNumber} -> ${releaseUrl}`));
  } finally {
    rmSync(tmpDir, { force: true, recursive: true });
  }
}

const command = process.argv[2];
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (command === 'bump') bump();
  else if (command === 'release-info') releaseInfo();
  else if (command === 'pr-comment') await prComment();
  else if (command === 'release-pr') releasePr();
  else fail(`Unknown subcommand: "${command ?? ''}"`);
}
