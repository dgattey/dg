import 'server-only';

import { log } from '@dg/shared-core/logging/log';

const GITHUB_REPOSITORY = 'dgattey/dg';
export const GITHUB_REPOSITORY_URL = `https://github.com/${GITHUB_REPOSITORY}`;
const RELEASES_PER_PAGE = 100;
const MAX_RELEASE_PAGES = 10;

export type ReleaseKind = 'major' | 'minor' | 'patch';

export type ChangelogRelease = {
  htmlUrl: string;
  kind: ReleaseKind;
  major: number;
  minor: number;
  name: string;
  notes: ReadonlyArray<string>;
  patch: number;
  prNumbers: ReadonlyArray<number>;
  publishedAt: string | null;
  tag: string;
  version: string;
};

type RawGitHubRelease = {
  body?: string | null;
  draft?: boolean;
  html_url?: string;
  name?: string | null;
  prerelease?: boolean;
  published_at?: string | null;
  tag_name?: string;
};

export function parseSemverTag(
  tagName: string,
): { kind: ReleaseKind; major: number; minor: number; patch: number; version: string } | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(tagName.trim());
  if (!match) {
    return null;
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  const kind: ReleaseKind = minor === 0 && patch === 0 ? 'major' : patch === 0 ? 'minor' : 'patch';
  return {
    kind,
    major,
    minor,
    patch,
    version: `${major}.${minor}.${patch}`,
  };
}

function cleanNoteLine(line: string): string {
  return line
    .replace(/^[-*]\s+/, '')
    .replace(/\[#(\d+)\]\(https:\/\/github\.com\/dgattey\/dg\/(?:pull|issues)\/\1\)/g, '#$1')
    .replace(
      /\[([^\]]+)\]\(https:\/\/github\.com\/dgattey\/dg\/(?:pull|issues)\/(\d+)\)/g,
      '$1 (#$2)',
    )
    .replace(/\bhttps:\/\/github\.com\/dgattey\/dg\/(?:pull|issues)\/(\d+)\b/g, '#$1')
    .replace(/\s*\(\[[0-9a-f]{7,40}\]\(https:\/\/github\.com\/[^)]+\)\)/gi, '')
    .replace(/\s+by\s+@[a-z0-9-]+\s+in\s+(?=#\d+\b)/gi, ' ')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractPrNumbers(text: string): Array<number> {
  const numbers = new Set<number>();
  const pattern =
    /(?:https:\/\/github\.com\/dgattey\/dg\/(?:pull|issues)\/(\d+)|(?<![a-z0-9])#(\d+)\b)/gi;
  for (const match of text.matchAll(pattern)) {
    const raw = match[1] ?? match[2];
    const parsed = raw ? Number(raw) : Number.NaN;
    if (Number.isInteger(parsed) && parsed > 0) {
      numbers.add(parsed);
    }
  }
  return [...numbers];
}

/**
 * Cleans GitHub release Markdown into plain note items and linked PR numbers.
 * Strips semantic-release version headers, verification sections, HTML tags,
 * image embeds, and Linear ticket footers.
 */
export function parseReleaseBody(body: string | null | undefined): {
  notes: Array<string>;
  prNumbers: Array<number>;
} {
  if (!body) {
    return { notes: [], prNumbers: [] };
  }

  const withoutComments = body
    .replace(/\r\n/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '');

  const prNumbers = extractPrNumbers(withoutComments);
  const notes: Array<string> = [];
  let inCodeBlock = false;
  let inDroppedSection = false;

  for (const rawLine of withoutComments.split('\n')) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock || !trimmed) {
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      const heading = trimmed.replace(/^#{1,6}\s+/, '').trim();
      if (
        /^(?:verification|measured|screenshots|manual follow-ups|human dashboard checklist|how to verify|not in this pr|unrelated|also fixed in passing|held back|transition evidence|at-rest invariants|supersedes|not the cause|live evidence)\b/i.test(
          heading,
        )
      ) {
        inDroppedSection = true;
        continue;
      }
      inDroppedSection = false;
      if (
        /^\[?\d+\.\d+\.\d+\]?/.test(heading) ||
        /^(?:what's changed|what changed\??|features|bug fixes|breaking changes|release info)\b/i.test(
          heading,
        )
      ) {
        continue;
      }
      const cleanHeading = cleanNoteLine(heading);
      if (cleanHeading) {
        notes.push(cleanHeading);
      }
      continue;
    }

    if (inDroppedSection) {
      continue;
    }

    if (
      /^!\[[^\]]*\]\([^)]+\)$/.test(trimmed) ||
      /^\[[^\]]+\]\(https:\/\/cursor\.com\/[^)]+\)$/.test(trimmed) ||
      /^\*\*Full Changelog\*\*:/i.test(trimmed) ||
      /^(?:Closes|Fixes|Resolves)\s+[A-Z]+-\d+/i.test(trimmed) ||
      /^\|.*\|$/.test(trimmed) ||
      /^[-:|\s]+$/.test(trimmed)
    ) {
      continue;
    }

    const isTopBullet = /^[-*]\s+/.test(rawLine);
    const isIndentedBullet = /^\s{2,}[-*]\s+/.test(rawLine);
    if (isIndentedBullet && notes.length > 0) {
      continue;
    }

    if (isTopBullet || notes.length < 4) {
      const cleaned = cleanNoteLine(trimmed);
      if (cleaned && !notes.includes(cleaned)) {
        notes.push(cleaned);
      }
    }
  }

  return { notes: notes.slice(0, 8), prNumbers };
}

export function normalizeGitHubRelease(raw: RawGitHubRelease): ChangelogRelease | null {
  if (raw.draft || raw.prerelease || !raw.tag_name) {
    return null;
  }
  const semver = parseSemverTag(raw.tag_name);
  if (!semver) {
    return null;
  }
  const tag = `v${semver.version}`;
  const { notes, prNumbers } = parseReleaseBody(raw.body);
  return {
    htmlUrl: raw.html_url || `${GITHUB_REPOSITORY_URL}/releases/tag/${tag}`,
    kind: semver.kind,
    major: semver.major,
    minor: semver.minor,
    name: raw.name?.trim() || tag,
    notes,
    patch: semver.patch,
    prNumbers,
    publishedAt: raw.published_at ?? null,
    tag,
    version: semver.version,
  };
}

export function createFallbackRelease(fallbackVersion: string): ChangelogRelease {
  const semver = parseSemverTag(fallbackVersion) ?? {
    kind: 'patch' as const,
    major: 2,
    minor: 0,
    patch: 0,
    version: fallbackVersion.replace(/^v/, ''),
  };
  const tag = `v${semver.version}`;
  return {
    htmlUrl: `${GITHUB_REPOSITORY_URL}/releases/tag/${tag}`,
    kind: semver.kind,
    major: semver.major,
    minor: semver.minor,
    name: tag,
    notes: [],
    patch: semver.patch,
    prNumbers: [],
    publishedAt: null,
    tag,
    version: semver.version,
  };
}

export function compareReleasesDesc(a: ChangelogRelease, b: ChangelogRelease): number {
  if (a.major !== b.major) return b.major - a.major;
  if (a.minor !== b.minor) return b.minor - a.minor;
  return b.patch - a.patch;
}

/**
 * Fetches all published GitHub releases for `dgattey/dg`, paging until
 * exhausted. Falls back to the current version if the GitHub API is
 * unreachable.
 */
export async function fetchReleases(options?: {
  fallbackVersion?: string;
}): Promise<Array<ChangelogRelease>> {
  const fallbackVersion = options?.fallbackVersion ?? '2.80.1';
  const collected: Array<ChangelogRelease> = [];
  const seenTags = new Set<string>();

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dylangattey-web',
  };
  const token =
    process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? process.env.GITHUB_AUTHENTICATION_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    for (let page = 1; page <= MAX_RELEASE_PAGES; page += 1) {
      const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/releases?per_page=${RELEASES_PER_PAGE}&page=${page}`;
      const response = await fetch(url, {
        cache: 'no-store',
        headers,
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        log.warn('GitHub releases fetch returned non-OK status', {
          page,
          status: response.status,
        });
        break;
      }
      const payload = (await response.json()) as unknown;
      if (!Array.isArray(payload) || payload.length === 0) {
        break;
      }
      for (const item of payload) {
        if (item && typeof item === 'object') {
          const parsed = normalizeGitHubRelease(item as RawGitHubRelease);
          if (parsed && !seenTags.has(parsed.tag)) {
            seenTags.add(parsed.tag);
            collected.push(parsed);
          }
        }
      }
      if (payload.length < RELEASES_PER_PAGE) {
        break;
      }
    }
  } catch (error) {
    log.warn('GitHub releases fetch failed, using fallback version', { error });
  }

  const fallback = createFallbackRelease(fallbackVersion);
  if (!seenTags.has(fallback.tag)) {
    collected.push(fallback);
  }

  return collected.sort(compareReleasesDesc);
}
