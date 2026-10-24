import type { ChangelogRelease, ReleaseKind } from '@dg/services/github/fetchReleases';
import type { PaperEdge, PaperTone } from '../collage/types';

const GITHUB_REPOSITORY_URL = 'https://github.com/dgattey/dg';

export type ReleaseFilterKey = 'all' | ReleaseKind;
export type ReleaseFilter = ReleaseFilterKey | number;

type ChangelogYearGroup = {
  compactReleases: Array<ChangelogRelease>;
  featuredReleases: Array<ChangelogRelease>;
  totalCount: number;
  year: string;
};

export const RELEASE_KIND_LABELS: Record<ReleaseKind, string> = {
  major: 'Major',
  minor: 'Minor',
  patch: 'Patch',
};

export const RELEASE_KIND_TONES: Record<ReleaseKind, PaperTone> = {
  major: 'vermilion',
  minor: 'cobalt',
  patch: 'viridian',
};

const YEAR_TAG_TONES: ReadonlyArray<PaperTone> = [
  'vermilion',
  'cobalt',
  'viridian',
  'rose',
  'leaf',
  'ultramarine',
];

const CARD_EDGES: ReadonlyArray<PaperEdge> = ['quad-a', 'quad-b', 'quad-c', 'quad-d'];
const CARD_TILTS: ReadonlyArray<number> = [-0.6, 0.5, -0.4, 0.7, -0.5, 0.4];

export function releaseCardTreatment(index: number): { edge: PaperEdge; tiltDeg: number } {
  return {
    edge: CARD_EDGES[index % CARD_EDGES.length] ?? 'quad-a',
    tiltDeg: CARD_TILTS[index % CARD_TILTS.length] ?? 0,
  };
}

export function yearTagTreatment(index: number): { tiltDeg: number; tone: PaperTone } {
  const tilts = [-2.5, 2, -1.8, 2.4, -2.1, 1.7];
  return {
    tiltDeg: tilts[index % tilts.length] ?? -2,
    tone: YEAR_TAG_TONES[index % YEAR_TAG_TONES.length] ?? 'vermilion',
  };
}

const RELEASE_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export function formatReleaseDate(
  publishedAt: string | null,
  options?: { short?: boolean },
): string | null {
  if (!publishedAt) {
    return null;
  }
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return options?.short ? SHORT_DATE_FORMATTER.format(date) : RELEASE_DATE_FORMATTER.format(date);
}

export function extractReleaseYear(release: ChangelogRelease): string {
  if (release.publishedAt) {
    const year = release.publishedAt.slice(0, 4);
    if (/^\d{4}$/.test(year)) {
      return year;
    }
  }
  return 'Current';
}

export function filterReleases(
  releases: ReadonlyArray<ChangelogRelease>,
  filter: ReleaseFilter,
): Array<ChangelogRelease> {
  if (filter === 'all') {
    return [...releases];
  }
  if (typeof filter === 'number') {
    return releases.filter((release) => extractReleaseYear(release) === String(filter));
  }
  return releases.filter((release) => release.kind === filter);
}

export function groupReleasesByYear(
  releases: ReadonlyArray<ChangelogRelease>,
): Array<ChangelogYearGroup> {
  const byYear = new Map<string, Array<ChangelogRelease>>();
  const latestTag = releases[0]?.tag;

  for (const release of releases) {
    const year = extractReleaseYear(release);
    const list = byYear.get(year) ?? [];
    list.push(release);
    byYear.set(year, list);
  }

  const groups: Array<ChangelogYearGroup> = [];
  for (const [year, yearReleases] of byYear) {
    const featuredReleases: Array<ChangelogRelease> = [];
    const compactReleases: Array<ChangelogRelease> = [];
    for (const release of yearReleases) {
      if (release.notes.length > 0 || release.tag === latestTag || release.kind === 'major') {
        featuredReleases.push(release);
      } else {
        compactReleases.push(release);
      }
    }
    groups.push({
      compactReleases,
      featuredReleases,
      totalCount: yearReleases.length,
      year,
    });
  }

  return groups;
}

export function githubPullRequestUrl(prNumber: number): string {
  return `${GITHUB_REPOSITORY_URL}/pull/${prNumber}`;
}
